/* ============================================================
Reports and ideas — what is wrong, and what should exist.

   THERE IS NO SERVER TO SEND THESE TO. This app is a folder of
   files served from GitHub Pages; there is no inbox behind it.
   A "Report a problem" button that silently posted nowhere
   would be worse than no button at all, so a report is kept on
   this device and given two ways out that actually work:

     Copy      the whole thing as text, to paste anywhere.
     GitHub    a prefilled issue on the repository, which is
               where the fix has to be made anyway.

   Neither happens on its own. A report is written and saved
   first, then sent when and where you choose, so nothing is
   published by the act of complaining about it.

   ONE LIST ACROSS SUBJECTS, like the timetable. A broken
   question in Economics and a layout bug in Maths are the same
   pile of work, and having to remember which subject you were
   in when you noticed something is not a filing system.

   A report about a question carries what is needed to find it
   again — the id, the set, the pages it was rendered from —
   because "the binomial one was wrong" identifies nothing three
   weeks later.
   ============================================================ */

const Reports = (function () {

  const REPO = "Rvyxzn/as-maths-tracker";

  const KINDS = {
    question: { label: "A question is wrong", icon: "alert" },
    scheme:   { label: "The mark scheme does not match", icon: "alert" },
    bug:      { label: "Something is broken", icon: "alert" },
    idea:     { label: "An idea", icon: "star" }
  };

  function key() {
    const base = (typeof Auth !== "undefined" && Auth.isSignedIn())
      ? Auth.storageKey() : STORAGE_KEY_BASE;
    return base + "::reports";
  }

  let cache = null;

  function all() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(key());
      cache = raw ? JSON.parse(raw) : [];
    } catch (e) { cache = []; }
    if (!Array.isArray(cache)) cache = [];
    return cache;
  }

  function save() {
    try { localStorage.setItem(key(), JSON.stringify(all())); }
    catch (e) { if (typeof UI !== "undefined") UI.toast("Could not save that report", "bad"); }
  }

  function add(rec) {
    const now = new Date().toISOString();
    const r = Object.assign({
      id: "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      kind: "bug",
      title: "",
      detail: "",
      subject: (typeof Subjects !== "undefined") ? Subjects.currentId() : null,
      where: null,        /* the view it was reported from */
      ref: null,          /* { questionId, set, num, pages, msPages } */
      status: "open",
      at: now
    }, rec || {});
    all().unshift(r);
    save();
    return r;
  }

  function update(id, patch) {
    const r = all().filter(function (x) { return x.id === id; })[0];
    if (!r) return null;
    Object.assign(r, patch);
    save();
    return r;
  }

  function remove(id) {
    cache = all().filter(function (x) { return x.id !== id; });
    save();
  }

  function open() { return all().filter(function (r) { return r.status !== "done"; }); }

  /* ---------- describing one ---------- */

  /* Everything needed to find the question again. The id alone is not
     enough once the bank is rebuilt and renumbered, so the set, the
     printed question number and the pages go with it. */
  function refFor(q, extra) {
    if (!q) return null;
    return Object.assign({
      questionId: q.id || null,
      set: q.set || null,
      num: q.num != null ? String(q.num) : null,
      pages: q.pageFrom ? (q.pageFrom + (q.pageTo && q.pageTo !== q.pageFrom ? "-" + q.pageTo : "")) : null,
      msPages: q.msFrom ? (q.msFrom + (q.msTo && q.msTo !== q.msFrom ? "-" + q.msTo : "")) : null,
      msCheck: q.msCheck || null,
      marks: q.marks || null
    }, extra || {});
  }

  function refLine(ref) {
    if (!ref) return "";
    const bits = [];
    if (ref.questionId) bits.push(ref.questionId);
    if (ref.num) bits.push("printed as Q" + ref.num);
    if (ref.marks) bits.push(ref.marks + " marks");
    if (ref.pages) bits.push("question page " + ref.pages);
    if (ref.msPages) bits.push("scheme page " + ref.msPages);
    if (ref.msCheck) bits.push("scheme " + ref.msCheck);
    return bits.join(" · ");
  }

  /* The text that goes to the clipboard or into a GitHub issue. Written
     so it is still readable by somebody who was not there. */
  function asText(r) {
    const lines = [];
    lines.push((KINDS[r.kind] || {}).label || r.kind);
    lines.push("");
    if (r.title) lines.push(r.title);
    if (r.detail) { lines.push(""); lines.push(r.detail); }
    lines.push("");
    lines.push("---");
    if (r.subject) lines.push("Subject: " + r.subject);
    if (r.where) lines.push("Reported from: " + r.where);
    if (r.ref) lines.push("Question: " + refLine(r.ref));
    lines.push("Reported: " + new Date(r.at).toLocaleString("en-GB"));
    return lines.join("\n");
  }

  function issueUrl(r) {
    const title = (r.title || (KINDS[r.kind] || {}).label || "Report").slice(0, 90);
    return "https://github.com/" + REPO + "/issues/new" +
      "?title=" + encodeURIComponent(title) +
      "&body=" + encodeURIComponent(asText(r));
  }

  return {
    KINDS: KINDS, all: all, open: open, add: add, update: update, remove: remove,
    refFor: refFor, refLine: refLine, asText: asText, issueUrl: issueUrl, repo: REPO
  };
})();
