/* ============================================================
Written model answers - Geography.

   The Geography counterpart of js/eco-written.js, and the same
   rules apply for the same reasons: a mark scheme is a list of
   what an examiner may credit, not an answer, so the answer has
   to be written; it is written by the assistant, kept on this
   device afterwards, and never generated until you press the
   button, because it spends money.

   What differs is the shape. 9GE0's short answers are
   point-marked, one mark per step of a developed explanation,
   and its essays are levels-marked on AO1 and AO2 with an
   introduction and a judgement. So a Geography answer is:

     intro        12 marks and up
     paragraphs   one for a short answer, up to four for an essay,
                  each saying which assessment objectives it earns
     conclusion   12 marks and up: the judgement

   THE RESOURCES. Most questions say "Study Figure 4a". The
   booklet's text is sent with the request so the answer can quote
   it -- only the pages that name the figures this question uses,
   not the whole booklet, because Paper 1's booklet covers four
   topics and the Tectonics question has no business reading the
   Coasts figures. Maps and charts do not survive as text, and the
   request says so rather than letting the answer pretend it read
   values off a graph it never saw.
   ============================================================ */

const GeoWritten = (function () {

  const KEY_BASE = "::geo-written";
  const VERSION = 1;

  function key() {
    const base = (typeof Auth !== "undefined" && Auth.isSignedIn())
      ? Auth.storageKey() : STORAGE_KEY_BASE;
    return base + KEY_BASE;
  }

  let cache = null;
  function all() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(key());
      cache = raw ? JSON.parse(raw) : {};
    } catch (e) { cache = {}; }
    if (!cache || typeof cache !== "object") cache = {};
    return cache;
  }
  function save() {
    try { localStorage.setItem(key(), JSON.stringify(all())); }
    catch (e) { if (typeof UI !== "undefined") UI.toast("No room left to store that answer", "bad"); }
  }

  /* ---------- validation ---------- */

  function str(v, max) {
    if (typeof v !== "string") return null;
    const s = v.trim();
    return s ? s.slice(0, max || 4000) : null;
  }

  const ROLES = { point: 1, counter: 1, weigh: 1 };

  function clean(raw) {
    if (!raw || typeof raw !== "object") return null;
    const paras = (Array.isArray(raw.paragraphs) ? raw.paragraphs : [])
      .map(function (p) {
        if (!p || typeof p !== "object") return null;
        const text = str(p.text, 4000);
        if (!text) return null;
        return {
          role: ROLES[p.role] ? p.role : "point",
          ao: (str(p.ao, 24) || "").replace(/[^A-Za-z0-9+ ,&]/g, ""),
          text: text
        };
      })
      .filter(Boolean)
      .slice(0, 4);                    /* never more than four, as asked */
    if (!paras.length) return null;
    return {
      intro: str(raw.intro, 2000),
      paragraphs: paras,
      conclusion: str(raw.conclusion, 2500),
      resources: str(raw.resources, 600),
      words: [raw.intro, raw.conclusion].concat(paras.map(function (p) { return p.text; }))
        .reduce(function (a, t) { return a + (t ? String(t).split(/\s+/).length : 0); }, 0)
    };
  }

  /* ---------- reading ---------- */

  function get(id) {
    const rec = all()[id];
    if (!rec || rec.v !== VERSION) return null;
    const c = clean(rec.answer);
    if (c) { c.source = "assistant"; c.at = rec.at || null; }
    return c;
  }
  function forget(id) { delete all()[id]; save(); }

  /* ---------- the resources this question uses ---------- */

  let bookletsP = null;
  function booklets() {
    if (!bookletsP) {
      bookletsP = fetch("js/geo-booklets.json")
        .then(function (r) { return r.ok ? r.json() : {}; })
        .catch(function () { return {}; });
    }
    return bookletsP;
  }

  function contextFor(q, all) {
    const pages = all[q.paper + "|" + q.series] || [];
    if (!pages.length) return "";
    const text = String(q.text || "");
    const refs = [];
    let m;
    const fre = /\b(Figure|Table)\s+(\d+[a-z]?)\b/gi;
    while ((m = fre.exec(text))) refs.push(new RegExp("\\b" + m[1] + "\\s+" + m[2] + "(?![0-9a-z])", "i"));
    const sec = /Section\s+([A-C])\s+(?:of|in)\s+the\s+Resource\s+Booklet/i.exec(text) ||
                /resources?\s+in\s+Section\s+([A-C])/i.exec(text);

    let chosen = [];
    if (sec) {
      /* A whole section: from the page that opens it to the next one. */
      let inSec = false;
      pages.forEach(function (p) {
        const opens = /SECTION\s+([A-C])\b/i.exec(p.text);
        if (opens) inSec = opens[1].toUpperCase() === sec[1].toUpperCase();
        if (inSec) chosen.push(p);
      });
    }
    if (refs.length) {
      pages.forEach(function (p) {
        if (refs.some(function (re) { return re.test(p.text); }) && chosen.indexOf(p) < 0) chosen.push(p);
      });
    }
    /* An essay that names no figure: on Paper 3 the booklet IS the
       question's context; on Papers 1 and 2 it belongs to other questions. */
    if (!chosen.length && q.paper === 3 && q.marks >= 12) chosen = pages.slice();

    chosen.sort(function (a, b) { return a.page - b.page; });
    return chosen.map(function (p) { return "[booklet page " + p.page + "]\n" + p.text; })
      .join("\n\n").slice(0, 12000);
  }

  /* ---------- writing ---------- */

  function write(q) {
    if (!q) return Promise.reject(new Error("No question"));
    if (typeof Assistant === "undefined" || !Assistant.configured() || !Assistant.ask) {
      return Promise.reject(new Error(
        "The assistant is not set up, so there is nothing to write the answer. ASSISTANT.md is three commands."));
    }
    return booklets().then(function (bk) {
      return Assistant.ask({
        task: "answer",
        subject: "geography",
        question: String(q.text || ""),
        marks: q.marks,
        scheme: typeof GeoModel !== "undefined" ? GeoModel.clean(q.ms) : String(q.ms || ""),
        context: contextFor(q, bk)
      });
    }).then(function (raw) {
      const c = clean(raw);
      if (!c) throw new Error("The answer came back in a shape this app could not read.");
      all()[q.id] = { v: VERSION, at: new Date().toISOString(), answer: raw };
      save();
      c.source = "assistant";
      c.at = all()[q.id].at;
      return c;
    });
  }

  return { get: get, write: write, forget: forget, clean: clean, contextFor: contextFor, booklets: booklets };
})();
