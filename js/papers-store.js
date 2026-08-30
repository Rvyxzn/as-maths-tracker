/* ============================================================
   PaperFiles — PDFs kept in IndexedDB so papers open inside the
   app instead of sending you off to download things.

   localStorage would blow its quota on a single paper, so the
   blobs live in IndexedDB and only a small reference is kept in
   the main save file. Object URLs are created on demand and
   revoked when the viewer closes.
   ============================================================ */

const PaperFiles = (function () {

  const DB = "as-maths-papers";
  const STORE = "files";
  let dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = function () {
        const db = r.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    return dbp;
  }

  function tx(mode) {
    return open().then(function (db) {
      return db.transaction(STORE, mode).objectStore(STORE);
    });
  }

  function put(key, blob) {
    return tx("readwrite").then(function (st) {
      return new Promise(function (res, rej) {
        const r = st.put(blob, key);
        r.onsuccess = function () { res(true); };
        r.onerror = function () { rej(r.error); };
      });
    });
  }

  function get(key) {
    return tx("readonly").then(function (st) {
      return new Promise(function (res, rej) {
        const r = st.get(key);
        r.onsuccess = function () { res(r.result || null); };
        r.onerror = function () { rej(r.error); };
      });
    });
  }

  function del(key) {
    return tx("readwrite").then(function (st) {
      return new Promise(function (res) {
        const r = st.delete(key);
        r.onsuccess = function () { res(true); };
        r.onerror = function () { res(false); };
      });
    });
  }

  function keys() {
    return tx("readonly").then(function (st) {
      return new Promise(function (res) {
        const r = st.getAllKeys();
        r.onsuccess = function () { res(r.result || []); };
        r.onerror = function () { res([]); };
      });
    });
  }

  /* object URLs handed out to the viewer, revoked on close */
  const live = {};
  function url(key) {
    return get(key).then(function (blob) {
      if (!blob) return null;
      if (live[key]) URL.revokeObjectURL(live[key]);
      live[key] = URL.createObjectURL(blob);
      return live[key];
    });
  }
  function release(key) {
    if (live[key]) { URL.revokeObjectURL(live[key]); delete live[key]; }
  }
  function releaseAll() { Object.keys(live).forEach(release); }

  function sizeOf(key) {
    return get(key).then(function (b) { return b ? b.size : 0; });
  }

  return { put: put, get: get, del: del, keys: keys, url: url,
           release: release, releaseAll: releaseAll, sizeOf: sizeOf };
})();
