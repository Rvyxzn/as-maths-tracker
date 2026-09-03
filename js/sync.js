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

    const localTouched = bundleWork(collectBundle());

    return Cloud.pull().then(function (row) {
      /* Nothing in the cloud yet: this device seeds it. */
      if (!row || !row.state) {
        return push(true).then(function () {
          setStatus("idle");
          return { action: "seeded", local: localTouched };
        });
      }

      const remoteTouched = bundleWork(row.state);
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

  /* ---------- the bundle ----------
     One cloud row holds every subject, not just the one on screen. Syncing
     only the active subject would mean whichever subject you happened to be
     looking at overwrote the row and quietly dropped the others.

     Shape: { __bundle: 2, subjects: { maths: <state>, economics: <state> } }
     A row without __bundle predates this and is a bare Maths document. */
  const BUNDLE_VERSION = 2;

  function keyFor(subjectId) {
    const base = (typeof Auth !== "undefined" && Auth.isSignedIn())
      ? Auth.storageKey() : STORAGE_KEY_BASE;
    return base + Subjects.storageSuffix(subjectId);
  }

  function readSubject(subjectId) {
    /* The active subject is read from memory, because unsaved edits live
       there for a moment before the debounced write lands. */
    if (subjectId === Subjects.currentId()) return Store.get();
    try { return JSON.parse(localStorage.getItem(keyFor(subjectId)) || "null"); }
    catch (e) { return null; }
  }

  function collectBundle() {
    const subjects = {};
    Subjects.ids().forEach(function (id) {
      const doc = readSubject(id);
      if (doc && doc.topics) subjects[id] = doc;
    });
    return { __bundle: BUNDLE_VERSION, subjects: subjects };
  }

  /* Accept either shape, so a row written before subjects existed still
     loads instead of being read as empty. */
  function asBundle(remote) {
    if (!remote) return { __bundle: BUNDLE_VERSION, subjects: {} };
    if (remote.__bundle && remote.subjects) return remote;
    return { __bundle: 1, subjects: { maths: remote } };
  }

  /* Write every subject in the bundle to its own key, then reopen the one on
     screen so the running views are looking at the new data. */
  function applyBundle(remote) {
    const b = asBundle(remote);
    Object.keys(b.subjects).forEach(function (id) {
      if (!Subjects.get(id)) return;              // a subject this build lacks
      const doc = b.subjects[id];
      if (!doc || !doc.topics) return;
      if (id === Subjects.currentId()) Store.replaceState(doc);
      else {
        try { localStorage.setItem(keyFor(id), JSON.stringify(doc)); } catch (e) {}
      }
    });
  }

  /* Work across every subject in a bundle, for deciding whether a side is
     empty and for describing a conflict. */
  function bundleWork(remote) {
    const b = asBundle(remote);
    return Object.keys(b.subjects).reduce(function (n, id) {
      return n + countWork(b.subjects[id]);
    }, 0);
  }

  function describeBundle(remote) {
    const b = asBundle(remote);
    const parts = Object.keys(b.subjects).map(function (id) {
      const s = Subjects.get(id);
      const w = countWork(b.subjects[id]);
      if (!w) return null;
      return (s ? s.short : id) + ": " + describe(b.subjects[id]);
    }).filter(Boolean);
    return parts.length ? parts.join("  ·  ") : "empty";
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

  /* Replace every local subject with the cloud's copy. */
  function adopt(remoteState, updatedAt) {
    applyBundle(remoteState);
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
    return Cloud.push(collectBundle(), user.cloudId).then(function (updatedAt) {
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
    describeBundle: describeBundle,
    collectBundle: collectBundle,
    applyBundle: applyBundle,
    bundleWork: bundleWork,
    countWork: countWork,
    clearMeta: function () { setMeta({}); lastSyncedAt = null; }
  };
})();
