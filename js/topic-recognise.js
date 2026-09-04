/* ============================================================
   Topic recognition

   Type a question you got wrong and this works out which topic
   it came from, so a test review does not mean scrolling a list
   of ninety-three subtopics for every question.

   It scores the words you typed against the specification's own
   wording — every subtopic's name and its requirements — and
   weights each match by how rare that word is across the whole
   spec. "Monopsony" appears in one subtopic and settles it on
   its own; "market" appears in dozens and barely counts.
   Phrases count for more than single words, and naming a
   subtopic outright counts for more still.

   Built from whatever subject is loaded, so it works the same
   for Maths and Geography without knowing anything about them.
   ============================================================ */

const TopicRecognise = (function () {

  const STOP = ("the a an and or of to in on for with by as is are be was were been being that this these those it its " +
    "from at into than then so such not no any all both each other more most some can may might will would should " +
    "could must have has had do does did if when where which who what why how about over under between during " +
    "before after above below up down out off again once here there very too also only own same just now i you " +
    "my your we they them he she got get question wrong answer mark marks part explain calculate state discuss " +
    "assess evaluate examine describe define").split(" ");
  const STOPSET = {};
  STOP.forEach(function (w) { STOPSET[w] = true; });

  let built = null, builtFor = null;

  function words(text) {
    const out = [];
    String(text || "").toLowerCase().replace(/[^a-z\s-]/g, " ").split(/\s+/).forEach(function (w) {
      if (w.length < 4 || STOPSET[w]) return;
      /* singular and plural should be the same word */
      if (w.length > 4 && w.slice(-3) === "ies") w = w.slice(0, -3) + "y";
      else if (w.length > 3 && w.slice(-1) === "s" && w.slice(-2) !== "ss") w = w.slice(0, -1);
      out.push(w);
    });
    return out;
  }

  function grams(ws) {
    const out = ws.slice();
    for (let i = 0; i < ws.length - 1; i++) out.push(ws[i] + " " + ws[i + 1]);
    for (let i = 0; i < ws.length - 2; i++) out.push(ws[i] + " " + ws[i + 1] + " " + ws[i + 2]);
    return out;
  }

  /* One entry per subtopic: its phrases, and the phrases in its name. */
  function build() {
    const subject = (typeof Subjects !== "undefined") ? Subjects.currentId() : "?";
    if (built && builtFor === subject) return built;

    const entries = [], df = {};
    Store.activeSubIds().forEach(function (id) {
      const inf = Store.info(id);
      if (!inf || !inf.sub) return;
      const name = inf.sub.name || "";
      const body = name + " " + (inf.section ? inf.section.name + " " : "") +
                   ((inf.sub.reqs || []).join(" "));
      const set = {}, nameSet = {};
      grams(words(body)).forEach(function (p) { set[p] = true; });
      grams(words(name)).forEach(function (p) { nameSet[p] = true; set[p] = true; });
      Object.keys(set).forEach(function (p) { df[p] = (df[p] || 0) + 1; });
      /* the single words of the name, matched without regard to order --
         "Price, income and cross elasticities of demand" never contains the
         phrase "price elasticity of demand" in one piece */
      const nameWords = {};
      words(name).forEach(function (w) { nameWords[w] = true; });
      entries.push({ id: id, name: name, code: inf.sub.code || "",
                     section: inf.section ? inf.section.name : "",
                     set: set, nameSet: nameSet, nameWords: nameWords,
                     size: Object.keys(set).length });
    });

    const n = entries.length || 1;
    const idf = {};
    Object.keys(df).forEach(function (p) { idf[p] = Math.log(n / df[p]); });

    built = { entries: entries, idf: idf };
    builtFor = subject;
    return built;
  }

  /* The best few topics for what you typed, most likely first. */
  function match(text, limit) {
    const b = build();
    const qs = {};
    grams(words(text)).forEach(function (p) { qs[p] = true; });
    const typed = Object.keys(qs);
    if (!typed.length) return [];

    const scored = [];
    b.entries.forEach(function (e) {
      let score = 0;
      typed.forEach(function (p) {
        if (!e.set[p]) return;
        const wordCount = p.split(" ").length;
        /* rarity, then length, then a bonus for naming the topic outright */
        score += (b.idf[p] || 0) * wordCount * wordCount * (e.nameSet[p] ? 3 : 1);
      });
      /* a subtopic with more requirement text offers more to hit by chance */
      if (score > 0) scored.push({ id: e.id, name: e.name, code: e.code,
                                   section: e.section, score: score / Math.sqrt(e.size) });
    });
    scored.sort(function (x, y) { return y.score - x.score; });

    const top = scored.slice(0, limit || 4);
    /* confidence is how far clear the winner is, not its raw score */
    if (top.length) {
      const runner = top[1] ? top[1].score : 0;
      top[0].confident = top[0].score > 0.9 && top[0].score >= runner * 1.5;
    }
    return top;
  }

  function best(text) {
    const m = match(text, 1);
    return m.length ? m[0] : null;
  }

  /* the index is per subject, so drop it when the subject changes */
  function reset() { built = null; builtFor = null; }

  return { match: match, best: best, reset: reset };
})();
