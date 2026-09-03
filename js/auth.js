/* ============================================================
   Auth, who is using this tracker, and whose data to load
   ------------------------------------------------------------
   Two ways in:

     "local"   a profile on this device. Several people can share
               one browser and keep separate progress.
     "google"  real Google Identity Services sign-in, active only
               once a Client ID is set in auth-config.js.

   WHAT THIS IS AND IS NOT
   This decides which save file to open. It is not a security
   boundary, and the app says so on the login screen rather than
   implying a privacy it cannot deliver:

     - Progress lives in this browser's localStorage. Anyone with
       the device and developer tools can read any profile's data,
       passcode or not.
     - A profile passcode is a "not your account" speed bump
       between people sharing a laptop. It is not encryption. The
       data is not encrypted with it and is readable without it.
     - Signing in with Google proves who you are to Google. It
       does NOT move your progress anywhere; it is still on this
       device. It gives a stable id to file that data under, and
       a token a backend could verify later.
     - The Google token is decoded here for a name and picture
       only. Decoding a JWT is not verifying it. Nothing security
       relevant may depend on that read until a server checks the
       signature.

   Data does not sync between devices yet. Use Settings > Export
   to carry it across, or add Supabase (see the note at the end).
   ============================================================ */

const Auth = (function () {

  const PROFILES_KEY = "tracker-profiles";     // the roster, shared by all users
  const SESSION_KEY  = "tracker-session";      // who is signed in on this device
  const LEGACY_KEY   = "as-maths-tracker-v1";  // the single-user save, pre-profiles

  let current = null;
  const listeners = [];

  /* ---------- small helpers ---------- */
  function readJSON(key, fallback) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { console.error("Could not write " + key, e); return false; }
  }

  function slug(name) {
    return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "").slice(0, 32) || "user";
  }

  /* SHA-256 so a passcode is not sitting in localStorage in the clear.
     This stops a shoulder-surfer, not an attacker: the data it guards is
     readable without the passcode anyway, which the UI states plainly. */
  async function hash(text) {
    const buf = new TextEncoder().encode("as-maths-tracker:" + text);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  /* ---------- the profile roster ---------- */
  function profiles() {
    const list = readJSON(PROFILES_KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function saveProfiles(list) { writeJSON(PROFILES_KEY, list); }

  function findProfile(id) {
    return profiles().filter(function (p) { return p.id === id; })[0] || null;
  }

  /* Each profile keeps its progress under its own key, so profiles cannot
     read or clobber each other by accident. */
  function storageKeyFor(id) { return LEGACY_KEY + "::" + id; }

  function profileSize(id) {
    try {
      const raw = localStorage.getItem(storageKeyFor(id));
      return raw ? raw.length : 0;
    } catch (e) { return 0; }
  }

  /* ---------- creating and signing in ---------- */
  async function createLocal(name, passcode) {
    const trimmed = String(name || "").trim();
    if (!trimmed) throw new Error("Enter a name");

    const list = profiles();
    let id = slug(trimmed), n = 2;
    while (list.some(function (p) { return p.id === id; })) id = slug(trimmed) + "-" + n++;

    const profile = {
      id: id,
      name: trimmed,
      provider: "local",
      passcodeHash: passcode ? await hash(passcode) : null,
      createdAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    };
    list.push(profile);
    saveProfiles(list);
    return profile;
  }

  async function signInLocal(id, passcode) {
    const p = findProfile(id);
    if (!p) throw new Error("That profile no longer exists");
    if (p.passcodeHash) {
      if (!passcode) throw new Error("This profile needs its passcode");
      if (await hash(passcode) !== p.passcodeHash) throw new Error("Wrong passcode");
    }
    setCurrent(p);
    return p;
  }

  async function setPasscode(id, passcode) {
    const list = profiles();
    const p = list.filter(function (x) { return x.id === id; })[0];
    if (!p) throw new Error("Profile not found");
    p.passcodeHash = passcode ? await hash(passcode) : null;
    saveProfiles(list);
    if (current && current.id === id) current.passcodeHash = p.passcodeHash;
  }

  function renameProfile(id, name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) throw new Error("Enter a name");
    const list = profiles();
    const p = list.filter(function (x) { return x.id === id; })[0];
    if (!p) throw new Error("Profile not found");
    p.name = trimmed;
    saveProfiles(list);
    if (current && current.id === id) current.name = trimmed;
  }

  /* Deleting a profile deletes its progress with it. The caller is
     responsible for confirming that, and for offering an export first. */
  function deleteProfile(id) {
    saveProfiles(profiles().filter(function (p) { return p.id !== id; }));
    try { localStorage.removeItem(storageKeyFor(id)); } catch (e) {}
    if (current && current.id === id) signOut();
  }

  /* ---------- Google ---------- */
  let gsiLoading = null;

  function loadGsi() {
    if (window.google && window.google.accounts) return Promise.resolve();
    if (gsiLoading) return gsiLoading;
    gsiLoading = new Promise(function (resolve, reject) {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error("Could not reach Google. Check your connection.")); };
      document.head.appendChild(s);
    });
    return gsiLoading;
  }

  /* Reads the name/email/picture out of the credential. This is a decode,
     not a verification: a server has to check the signature before any of
     it can be trusted for anything that matters. */
  function decodeCredential(jwt) {
    const part = String(jwt).split(".")[1];
    if (!part) throw new Error("Google returned something unreadable");
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  }

  function signInGoogle() {
    return new Promise(function (resolve, reject) {
      if (!googleConfigured()) {
        reject(new Error("Google sign-in is not configured yet. Add your Client ID to js/auth-config.js."));
        return;
      }
      loadGsi().then(function () {
        try {
          google.accounts.id.initialize({
            client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
            callback: function (response) {
              try {
                const claims = decodeCredential(response.credential);
                const profile = {
                  id: "google-" + claims.sub,
                  name: claims.name || claims.email || "Google user",
                  email: claims.email || "",
                  picture: claims.picture || "",
                  provider: "google",
                  passcodeHash: null,
                  createdAt: new Date().toISOString(),
                  lastSeenAt: new Date().toISOString()
                };
                const list = profiles();
                const i = list.findIndex(function (p) { return p.id === profile.id; });
                if (i >= 0) { profile.createdAt = list[i].createdAt; list[i] = profile; }
                else list.push(profile);
                saveProfiles(list);
                setCurrent(profile);
                resolve(profile);
              } catch (e) { reject(e); }
            }
          });
          /* Renders Google's own button; prompt() alone is suppressed in
             many browsers, so the button is the reliable entry point. */
          resolve.__ready = true;
          google.accounts.id.prompt();
        } catch (e) { reject(e); }
      }).catch(reject);
    });
  }

  /* Google insists on rendering its own button, so views hand us a host
     element rather than styling a fake one. */
  function renderGoogleButton(host, onDone, onError) {
    if (!googleConfigured()) return false;
    loadGsi().then(function () {
      google.accounts.id.initialize({
        client_id: AUTH_CONFIG.GOOGLE_CLIENT_ID,
        callback: function (response) {
          try {
            const claims = decodeCredential(response.credential);
            const profile = {
              id: "google-" + claims.sub,
              name: claims.name || claims.email || "Google user",
              email: claims.email || "",
              picture: claims.picture || "",
              provider: "google",
              passcodeHash: null,
              createdAt: new Date().toISOString(),
              lastSeenAt: new Date().toISOString()
            };
            const list = profiles();
            const i = list.findIndex(function (p) { return p.id === profile.id; });
            if (i >= 0) { profile.createdAt = list[i].createdAt; list[i] = profile; }
            else list.push(profile);
            saveProfiles(list);
            setCurrent(profile);
            onDone && onDone(profile);
          } catch (e) { onError && onError(e); }
        }
      });
      host.innerHTML = "";
      google.accounts.id.renderButton(host, {
        theme: "outline", size: "large", text: "signin_with",
        shape: "rectangular", logo_alignment: "left", width: 280
      });
    }).catch(function (e) { onError && onError(e); });
    return true;
  }

  /* ---------- session ---------- */
  function setCurrent(profile) {
    current = profile;
    const list = profiles();
    const p = list.filter(function (x) { return x.id === profile.id; })[0];
    if (p) { p.lastSeenAt = new Date().toISOString(); saveProfiles(list); }
    writeJSON(SESSION_KEY, { id: profile.id, at: new Date().toISOString() });
    listeners.forEach(function (fn) { fn(current); });
  }

  function signOut() {
    current = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    if (window.google && google.accounts && google.accounts.id) {
      try { google.accounts.id.disableAutoSelect(); } catch (e) {}
    }
    listeners.forEach(function (fn) { fn(null); });
  }

  /* The save file written before profiles existed becomes the first
     profile's data, so upgrading never looks like lost progress. */
  function adoptLegacySave(profileId) {
    try {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (!legacy) return false;
      const target = storageKeyFor(profileId);
      if (localStorage.getItem(target)) return false;   // never overwrite
      localStorage.setItem(target, legacy);
      localStorage.setItem(LEGACY_KEY + "-preprofiles-backup", legacy);
      localStorage.removeItem(LEGACY_KEY);
      return true;
    } catch (e) { return false; }
  }

  function hasLegacySave() {
    try { return !!localStorage.getItem(LEGACY_KEY); } catch (e) { return false; }
  }

  /* Device profiles that actually hold work, biggest first. Used when signing
     into a cloud account for the first time on a machine that already has
     progress saved under a local profile: without this that work would be
     stranded under a key nothing opens any more. */
  function localProfilesWithData() {
    return profiles()
      .filter(function (p) { return p.provider !== "cloud" && profileSize(p.id) > 2000; })
      .map(function (p) { return { id: p.id, name: p.name, size: profileSize(p.id) }; })
      .sort(function (a, b) { return b.size - a.size; });
  }

  /* Copy a local profile's saved document into the profile that is signed in
     now. The source is left untouched, so this is a copy and never a move. */
  function copyProfileData(fromId, toId) {
    try {
      const raw = localStorage.getItem(storageKeyFor(fromId));
      if (!raw) return false;
      localStorage.setItem(storageKeyFor(toId), raw);
      return true;
    } catch (e) { return false; }
  }

  function init() {
    const s = readJSON(SESSION_KEY, null);
    if (s && s.id) {
      const p = findProfile(s.id);
      /* A passcoded profile must be unlocked again on a fresh load, or the
         passcode would only ever be asked once. */
      if (p && !p.passcodeHash) { current = p; }
      else if (p && p.passcodeHash) { current = null; }
    }
    return current;
  }

  /* ---------- cloud accounts ----------
     A Supabase account is a profile like any other, so everything below it
     (which save file to open, the sidebar, Settings) keeps working unchanged.
     The difference is `cloudId`, which Sync uses as the row key, and that its
     data is mirrored to the server rather than living only here. */
  function adoptCloudUser(user) {
    if (!user) return null;
    const m = user.user_metadata || {};
    const profile = {
      id: "cloud-" + user.id,
      cloudId: user.id,
      name: m.full_name || m.name || (user.email || "").split("@")[0] || "Account",
      email: user.email || "",
      picture: m.avatar_url || m.picture || "",
      subjects: m.subjects || [],
      provider: "cloud",
      passcodeHash: null,
      createdAt: user.created_at || new Date().toISOString(),
      lastSeenAt: new Date().toISOString()
    };
    const list = profiles();
    const i = list.findIndex(function (p) { return p.id === profile.id; });
    if (i >= 0) { profile.createdAt = list[i].createdAt; list[i] = profile; }
    else list.push(profile);
    saveProfiles(list);
    setCurrent(profile);
    return profile;
  }

  /* Restores a Supabase session on load, so you are not asked to sign in
     again on every refresh. */
  function restoreCloudSession() {
    if (typeof Cloud === "undefined" || !Cloud.configured()) return Promise.resolve(null);
    return Cloud.currentUser().then(function (user) {
      return user ? adoptCloudUser(user) : null;
    }).catch(function () { return null; });
  }

  return {
    init: init,
    current: function () { return current; },
    isSignedIn: function () { return !!current; },
    isCloud: function () { return !!(current && current.provider === "cloud" && current.cloudId); },
    adoptCloudUser: adoptCloudUser,
    restoreCloudSession: restoreCloudSession,
    onChange: function (fn) { listeners.push(fn); },

    profiles: profiles,
    findProfile: findProfile,
    profileSize: profileSize,
    storageKey: function () { return current ? storageKeyFor(current.id) : LEGACY_KEY; },
    storageKeyFor: storageKeyFor,

    createLocal: createLocal,
    signInLocal: signInLocal,
    setPasscode: setPasscode,
    renameProfile: renameProfile,
    deleteProfile: deleteProfile,

    signInGoogle: signInGoogle,
    renderGoogleButton: renderGoogleButton,
    signOut: signOut,

    hasLegacySave: hasLegacySave,
    adoptLegacySave: adoptLegacySave,
    localProfilesWithData: localProfilesWithData,
    copyProfileData: copyProfileData
  };
})();

/* ============================================================
   Moving to Supabase later
   ------------------------------------------------------------
   The pieces are deliberately separate so this is a small change,
   not a rewrite:

     1. Fill in SUPABASE_URL and SUPABASE_ANON_KEY in auth-config.js
        and load the supabase-js client.
     2. Replace signInGoogle / renderGoogleButton with
        supabase.auth.signInWithOAuth({ provider: "google" }).
        Supabase verifies the Google token server-side, which is
        the step this file cannot do on its own.
     3. In store.js, save() and load() currently read and write
        localStorage under Auth.storageKey(). Point them at a
        Supabase table keyed by user id, keeping localStorage as
        the offline cache and last-write-wins on reconnect.
     4. Turn on row level security so a row is readable only by
        the user whose id it carries. Without that step the anon
        key lets anyone read every row.

   Until then this file is honest about being device-only.
   ============================================================ */
