/* ============================================================
   Sync, keeps this device's state and the cloud row in step
   ------------------------------------------------------------
   Store still reads and writes localStorage exactly as before,
   which keeps the app fast and working offline. This module sits
   on top and moves that document to and from Supabase.

   The rule everywhere here: never throw away work silently. If
   the two copies have genuinely diverged, ask.
   ============================================================ */

const Sync = (function () {

  const PUSH_DELAY = 4000;      // batch a burst of edits into one write
  const META_KEY = "tracker-sync-meta";

  let timer = null;
  let status = "off";           // off | idle | syncing | error | offline
  let lastError = "";
  let lastSyncedAt = null;
  const listeners = [];

  function on(fn) { listeners.push(fn); }
  function emit() { listeners.forEach(function (fn) { fn(state()); }); }

  function state() {
    return { status: status, error: lastError, lastSyncedAt: lastSyncedAt,
             enabled: enabled(), device: Cloud.configured() ? Cloud.deviceName() : "" };
  }

  function enabled() {
    return Cloud.configured() && Auth.isCloud();
  }

  function meta() {
    try { return JSON.parse(localStorage.getItem(META_KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function setMeta(m) {
    try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) {}
  }

  function setStatus(s, err) {
    status = s; lastError = err || "";
    emit();
  }

  /* ---------- pulling on sign-in ----------
     Returns what happened so the UI can explain it, rather than the app
     silently changing under the user. */
  function pullOnSignIn(userId) {
    if (!enabled()) return Promise.resolve({ action: "skipped" });
    setStatus("syncing");

    const localState = Store.get();
    const localTouched = countWork(localState);

    return Cloud.pull().then(function (row) {
      /* Nothing in the cloud yet: this device seeds it. */
      if (!row || !row.state) {
        return push(true).then(function () {
          setStatus("idle");
          return { action: "seeded", local: localTouched };
        });
      }

      const remoteTouched = countWork(row.state);
      const m = meta();
      const localStamp = m.lastPushedAt || null;

      /* The cloud row is the one this device last pushed, so nothing has
         changed elsewhere and the local copy is already correct. */
      if (localStamp && row.updated_at === localStamp) {
        lastSyncedAt = row.updated_at;
        setStatus("idle");
        return { action: "already-current" };
      }

      /* An empty local copy: just take the cloud's. This is the normal case
         on a new device, and there is nothing to lose. */
      if (localTouched === 0) {
        adopt(row.state, row.updated_at);
        setStatus("idle");
        return { action: "pulled", remote: remoteTouched };
      }

      /* Both sides have work and they are not the same write. That is a real
         conflict, so the caller has to ask rather than pick. */
      lastSyncedAt = row.updated_at;
      setStatus("idle");
      return {
        action: "conflict",
        local: localTouched,
        remote: remoteTouched,
        remoteState: row.state,
        remoteUpdatedAt: row.updated_at,
        remoteDevice: row.device || "another device"
      };
    }).catch(function (e) {
      setStatus("error", e.message);
      return { action: "error", error: e.message };
    });
  }

  /* A rough "how much is in here", used only to tell an empty tracker from a
     used one and to describe each side of a conflict in plain numbers. */
  function countWork(st) {
    if (!st || !st.topics) return 0;
    let n = 0;
    Object.keys(st.topics).forEach(function (k) {
      const t = st.topics[k] || {};
      if (t.rag) n++;
      n += (t.questionSets || []).length;
      n += (t.sessions || []).length;
      n += (t.attempts || []).length;
    });
    n += (st.papers || []).length;
    n += (st.schoolAssessments || []).length;
    return n;
  }

  function describe(st) {
    if (!st || !st.topics) return "empty";
    let rated = 0, sets = 0;
    Object.keys(st.topics).forEach(function (k) {
      const t = st.topics[k] || {};
      if (t.rag) rated++;
      sets += (t.questionSets || []).length;
    });
    return rated + " ratings, " + sets + " question sets, " +
           (st.papers || []).length + " papers";
  }

  /* Replace local state with the cloud's copy. */
  function adopt(remoteState, updatedAt) {
    Store.replaceState(remoteState);
    lastSyncedAt = updatedAt;
    const m = meta();
    m.lastPushedAt = updatedAt;
    setMeta(m);
  }

  /* ---------- pushing ---------- */
  function schedulePush() {
    if (!enabled()) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { push(false); }, PUSH_DELAY);
  }

  function push(immediate) {
    if (!enabled()) return Promise.resolve(false);
    if (timer) { clearTimeout(timer); timer = null; }

    const user = Auth.current();
    if (!user || !user.cloudId) return Promise.resolve(false);

    setStatus("syncing");
    return Cloud.push(Store.get(), user.cloudId).then(function (updatedAt) {
      lastSyncedAt = updatedAt || new Date().toISOString();
      const m = meta();
      m.lastPushedAt = lastSyncedAt;
      setMeta(m);
      setStatus("idle");
      return true;
    }).catch(function (e) {
      /* Offline is a normal state for a revision app on a train, not an
         error to shout about. The local save already succeeded. */
      const offline = !navigator.onLine || /Could not reach/i.test(e.message);
      setStatus(offline ? "offline" : "error", e.message);
      return false;
    });
  }

  /* Try again when the network comes back, so work done offline is not
     stranded until the next manual save. */
  function watchConnection() {
    window.addEventListener("online", function () {
      if (enabled() && status === "offline") push(true);
    });
    /* A last push on the way out. keepalive is not available through the
       Supabase client, so this is best effort: the debounce is short enough
       that at most a few seconds of work is ever unpushed. */
    window.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden" && enabled()) push(true);
    });
  }

  function init() {
    if (!Cloud.configured()) { setStatus("off"); return; }
    const m = meta();
    lastSyncedAt = m.lastPushedAt || null;
    watchConnection();
    setStatus(enabled() ? "idle" : "off");
  }

  return {
    init: init,
    on: on,
    state: state,
    enabled: enabled,
    pullOnSignIn: pullOnSignIn,
    schedulePush: schedulePush,
    pushNow: function () { return push(true); },
    adopt: adopt,
    describe: describe,
    countWork: countWork,
    clearMeta: function () { setMeta({}); lastSyncedAt = null; }
  };
})();
