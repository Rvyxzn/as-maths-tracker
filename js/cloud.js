/* ============================================================
   Cloud, Supabase accounts and cross-device sync
   ------------------------------------------------------------
   This is what makes the tracker follow you between your PC,
   your laptop and your phone instead of living in one browser.

   HOW SYNC WORKS
   Your whole tracker state is one JSON document. It is written
   to a single row per user in the `tracker_state` table, and
   localStorage is kept as an offline cache of that row.

     sign in   pull the row, compare it with the local cache,
               keep whichever was written last, and tell you if
               the two had genuinely diverged
     save      write locally straight away, push to Supabase a
               few seconds later so typing is never blocked
     offline   keep working against the cache; the next
               successful save pushes everything up

   WHY ONE JSON ROW, NOT MANY TABLES
   The tracker already treats its state as one object that is
   loaded and saved whole. Splitting it into normalised tables
   would mean rewriting every read and write in store.js for no
   gain at this size. One row per user is a poor fit for data
   several people edit at once, and a good fit for one person on
   three devices, which is what this is.

   CONFLICTS
   Last write wins, per device, on the whole document. If you
   edit on your phone and your laptop while the laptop is
   offline, the later save replaces the earlier one rather than
   merging them. The app warns you when it sees a remote copy
   that is newer than yours and lets you choose, instead of
   quietly throwing work away.
   ============================================================ */

const Cloud = (function () {

  const SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
  const TABLE = "tracker_state";

  let client = null;
  let sdkLoading = null;
  let lastPulledAt = null;

  function configured() { return supabaseConfigured(); }

  function loadSdk() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    if (sdkLoading) return sdkLoading;
    sdkLoading = new Promise(function (resolve, reject) {
      const s = document.createElement("script");
      s.src = SDK_URL;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Could not load the Supabase library. Check your connection.")); };
      document.head.appendChild(s);
    });
    return sdkLoading;
  }

  function ready() {
    if (!configured()) return Promise.reject(new Error("Cloud accounts are not set up yet. Add your Supabase URL and anon key to js/auth-config.js."));
    if (client) return Promise.resolve(client);
    return loadSdk().then(function () {
      client = window.supabase.createClient(AUTH_CONFIG.SUPABASE_URL, AUTH_CONFIG.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      return client;
    });
  }

  /* Supabase returns errors rather than throwing. Turn them into something
     a person can act on, instead of surfacing raw API text. */
  function readable(error) {
    const m = (error && error.message) || String(error || "Something went wrong");
    if (/Invalid login credentials/i.test(m)) return "That email and password do not match an account.";
    if (/User already registered/i.test(m))   return "There is already an account with that email. Sign in instead.";
    if (/Password should be at least/i.test(m)) return "Your password needs to be at least 6 characters.";
    if (/Email not confirmed/i.test(m))       return "Check your email and confirm the address, then sign in.";
    if (/Unable to validate email/i.test(m))  return "That email address does not look right.";
    if (/Failed to fetch|NetworkError/i.test(m)) return "Could not reach the server. Check your connection.";
    if (/relation .* does not exist/i.test(m)) return "The tracker_state table is missing. Run the SQL in SUPABASE.md.";
    return m;
  }

  /* ---------- accounts ---------- */
  function signUp(email, password, profile) {
    return ready().then(function (c) {
      return c.auth.signUp({
        email: email,
        password: password,
        /* Stored on the auth user, so a name and subject list survive even
           before the first state row is written. */
        options: { data: { full_name: profile.name || "", subjects: profile.subjects || [] } }
      });
    }).then(function (res) {
      if (res.error) throw new Error(readable(res.error));
      return {
        user: res.data.user,
        /* With email confirmation on, Supabase returns a user but no session
           until the link is clicked. The UI has to say so rather than
           looking like it silently failed. */
        needsConfirmation: !res.data.session
      };
    });
  }

  function signIn(email, password) {
    return ready().then(function (c) {
      return c.auth.signInWithPassword({ email: email, password: password });
    }).then(function (res) {
      if (res.error) throw new Error(readable(res.error));
      return res.data.user;
    });
  }

  function signInWithGoogle() {
    return ready().then(function (c) {
      return c.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
    }).then(function (res) {
      if (res.error) throw new Error(readable(res.error));
      return res.data;   // the browser is redirected to Google from here
    });
  }

  function resetPassword(email) {
    return ready().then(function (c) {
      return c.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname
      });
    }).then(function (res) {
      if (res.error) throw new Error(readable(res.error));
      return true;
    });
  }

  function signOut() {
    if (!client) return Promise.resolve();
    return client.auth.signOut().catch(function () { /* leaving is never blocked */ });
  }

  function session() {
    return ready().then(function (c) { return c.auth.getSession(); })
      .then(function (res) { return res.data ? res.data.session : null; });
  }

  function currentUser() {
    return session().then(function (s) { return s ? s.user : null; });
  }

  function onAuthChange(fn) {
    ready().then(function (c) {
      c.auth.onAuthStateChange(function (event, s) { fn(event, s ? s.user : null); });
    }).catch(function () { /* not configured; nothing to listen to */ });
  }

  /* ---------- state sync ---------- */
  function pull() {
    return ready().then(function (c) {
      return c.from(TABLE).select("state, updated_at, device").maybeSingle();
    }).then(function (res) {
      if (res.error) throw new Error(readable(res.error));
      lastPulledAt = res.data ? res.data.updated_at : null;
      return res.data || null;
    });
  }

  function push(state, userId) {
    return ready().then(function (c) {
      const now = new Date().toISOString();
      return c.from(TABLE).upsert({
        user_id: userId,
        state: state,
        updated_at: now,
        device: deviceName()
      }, { onConflict: "user_id" }).select("updated_at").maybeSingle();
    }).then(function (res) {
      if (res.error) throw new Error(readable(res.error));
      lastPulledAt = res.data ? res.data.updated_at : lastPulledAt;
      return lastPulledAt;
    });
  }

  /* Names the device in the sync log, so "last saved on" means something
     when you are wondering which machine overwrote what. */
  function deviceName() {
    const ua = navigator.userAgent;
    const os = /Windows/.test(ua) ? "Windows"
      : /Android/.test(ua) ? "Android"
      : /iPhone|iPad/.test(ua) ? "iOS"
      : /Mac/.test(ua) ? "Mac"
      : /Linux/.test(ua) ? "Linux" : "device";
    const kind = /Mobi/.test(ua) ? "phone" : "computer";
    return os + " " + kind;
  }

  return {
    configured: configured,
    ready: ready,
    signUp: signUp,
    signIn: signIn,
    signInWithGoogle: signInWithGoogle,
    resetPassword: resetPassword,
    signOut: signOut,
    session: session,
    currentUser: currentUser,
    onAuthChange: onAuthChange,
    pull: pull,
    push: push,
    deviceName: deviceName,
    lastPulledAt: function () { return lastPulledAt; },
    TABLE: TABLE
  };
})();
