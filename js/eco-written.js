/* ============================================================
Written model answers.

   A MARK SCHEME IS NOT AN ANSWER. It is a list of everything an
   examiner may credit, written so that it covers whatever a
   candidate puts down. Reading one teaches you the shape of a
   checklist. What a student actually needs to see once is the
   thing itself: the essay, written out, that would score full
   marks — where the chain goes, how long a paragraph runs, what
   an evaluation sentence sounds like when it is doing work.

   That cannot be assembled from the scheme by rearranging it,
   which is what the panel next door does and why it reads as
   the scheme again. It has to be written. So it is written, per
   question, by the assistant, and then kept.

   THREE PLACES IT CAN COME FROM, in order:

     bundled   written by hand and shipped in the repo. Exact,
               reviewed, and free. There are only a few.
     cached    written by the assistant on this device once and
               stored, so the second read costs nothing.
     written   asked for now. Costs a fraction of a penny and
               takes a few seconds.

   NOTHING IS GENERATED BEHIND YOUR BACK. The panel shows what it
   has; writing a new one is a button you press, because it
   spends money and because a model answer nobody asked for is
   not worth what it costs.
   ============================================================ */

const EcoWritten = (function () {

  const KEY_BASE = "::eco-written";
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
    catch (e) {
      /* A hundred 25-mark answers is comfortably inside the quota, but if
         it ever is not, say so rather than losing the newest one silently. */
      if (typeof UI !== "undefined") UI.toast("No room left to store that answer", "bad");
    }
  }

  /* ---------- validation ----------

     The reply is a guess, so it is checked rather than trusted. The rule
     that matters is the two-paragraph one: it is the whole point of the
     format, and a model that returns three has not written the answer that
     was asked for. Extra ones are dropped rather than shown. */

  function str(v, max) {
    if (typeof v !== "string") return null;
    const s = v.trim();
    return s ? s.slice(0, max || 4000) : null;
  }

  function clean(raw) {
    if (!raw || typeof raw !== "object") return null;

    const paras = Array.isArray(raw.paragraphs) ? raw.paragraphs : [];
    const kaa = [], ev = [];
    paras.forEach(function (p) {
      if (!p || typeof p !== "object") return;
      const text = str(p.text, 4000);
      if (!text) return;
      const n = Math.max(1, Math.min(2, Number(p.n) || (p.role === "ev" ? ev.length + 1 : kaa.length + 1)));
      if (p.role === "kaa" && kaa.length < 2) kaa.push({ n: n, text: text });
      else if (p.role === "ev" && ev.length < 2) ev.push({ n: n, text: text });
    });
    if (!kaa.length) return null;

    /* Written back out in the order it is read, each evaluation with the
       paragraph it evaluates rather than in a heap at the end. */
    const ordered = [];
    kaa.forEach(function (k, i) {
      ordered.push({ role: "kaa", n: i + 1, text: k.text });
      if (ev[i]) ordered.push({ role: "ev", n: i + 1, text: ev[i].text });
    });

    return {
      define: str(raw.define, 800),
      diagram: str(raw.diagram, 800),
      paragraphs: ordered,
      judgement: str(raw.judgement, 2000),
      words: ordered.reduce(function (a, p) { return a + p.text.split(/\s+/).length; }, 0)
    };
  }

  /* ---------- reading ---------- */

  function bundled(id) {
    if (typeof ECO_WRITTEN_ANSWERS === "undefined") return null;
    const a = ECO_WRITTEN_ANSWERS[id];
    if (!a) return null;
    const c = clean(a);
    if (c) { c.source = "bundled"; c.at = a.at || null; }
    return c;
  }

  function stored(id) {
    const rec = all()[id];
    if (!rec || rec.v !== VERSION) return null;
    const c = clean(rec.answer);
    if (c) { c.source = "assistant"; c.at = rec.at || null; }
    return c;
  }

  function get(id) { return bundled(id) || stored(id); }

  function forget(id) { delete all()[id]; save(); }

  /* ---------- writing ----------

     Everything Pearson published about this question goes with the
     request: the question, the extracts it refers to, the indicative
     content and the examiner's report. An answer written without the
     scheme would be a plausible essay rather than the one that scores. */

  function context(q) {
    if (typeof PacksView === "undefined" || !PacksView.caseFor) return null;
    const cs = PacksView.caseFor(q);
    if (!cs || cs.pages) return null;   /* pages are images; nothing to send */
    const bits = [];
    (cs.figures || []).forEach(function (f) {
      const rows = (f.data || []).map(function (d) { return d[0] + ": " + d[1]; }).join("; ");
      bits.push(f.label + (f.caption ? " — " + f.caption : "") + (rows ? "\n" + rows : ""));
    });
    (cs.extracts || []).forEach(function (e) {
      bits.push(e.label + (e.head ? " — " + e.head : "") + "\n" + (e.body || ""));
    });
    return bits.join("\n\n") || null;
  }

  function write(q) {
    if (!q) return Promise.reject(new Error("No question"));
    if (typeof Assistant === "undefined" || !Assistant.configured()) {
      return Promise.reject(new Error(
        "The assistant is not set up, so there is nothing to write the answer. " +
        "ASSISTANT.md is three commands."));
    }

    const report = (typeof PacksView !== "undefined" && PacksView.reportFor)
      ? PacksView.reportFor(q) : null;

    return Assistant.ask({
      task: "answer",
      question: String(q.text || ""),
      marks: q.marks,
      scheme: String(q.ms || ""),
      report: report ? String(report) : "",
      context: context(q) || ""
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

  return { get: get, write: write, forget: forget, clean: clean, bundled: bundled };
})();
