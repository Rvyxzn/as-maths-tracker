/* Add the Paper 3 questions to the Economics bank.

   Paper 3 is synoptic, so a question is not "a Theme 2 question" the way a
   Paper 1 or Paper 2 one is: it asks for microeconomic AND macroeconomic
   effects by design. The topic is still worth recording, because it is what
   the tracker uses to tie a question to a chapter, so it is worked out the
   same way as the rest of the bank - by scoring the question against the
   specification's own wording with the app's own recogniser, rather than by
   a second, drifting copy of that logic living here. */

const fs = require("fs"), path = require("path");
const { parse, SERIES, DIR } = require("./extract-eco-paper3.js");
const { build: buildScheme } = require("./extract-eco-mark-schemes.js");
const { load, run, ctx } = require("./load.js");

const ROOT = path.join(__dirname, "..");

load("js/spec-data.js");
load("js/exam-focus.js");
load("js/eco-data.js");
load("js/topic-recognise.js");
load("js/eco-questions.js");

/* The recogniser reads whichever subject is active, so Economics is built
   into the globals it looks at before anything is scored. */
run(`
  SPEC = ECO_SPEC;
  SPEC_INDEX = buildSpecIndex(SPEC);
  ALL_SUB_IDS = Object.keys(SPEC_INDEX);
  ALL_SECTIONS = buildAllSections(SPEC);
  EXAM_FOCUS = ECO_EXAM_FOCUS || {};
  /* this is what puts the "1.2.9" code on each subtopic */
  CHAPTER_INDEX = buildChapterIndex(SPEC, EXAM_FOCUS);
  ALL_CHAPTER_IDS = Object.keys(CHAPTER_INDEX);
  Subjects = { current: function () { return { id: "economics" }; },
               currentId: function () { return "economics"; } };
  /* The recogniser reads the spec through the store, because in the app the
     store is what knows which papers you are sitting. Here every subtopic
     counts, so it is the whole specification. */
  Store = {
    activeSubIds: function () { return ALL_SUB_IDS; },
    info: function (id) { return SPEC_INDEX[id]; }
  };
`);

function slug(series) { return series.toLowerCase().replace(/\s+/g, ""); }

/* The recogniser reports its own confidence: how far clear the winner is of
   the runner-up, not its raw score. That is the honest flag to carry. */
function topicFor(text) {
  ctx.__q = text;
  return run(`(function () {
    const hits = TopicRecognise.match(__q, 2);
    if (!hits || !hits.length) return null;
    return JSON.stringify({ code: hits[0].code || hits[0].id, name: hits[0].name,
                            confident: !!hits[0].confident });
  })()`);
}

const built = [];
SERIES.forEach(function (series) {
  const qp = DIR + "/Questions/" + series + " QP.pdf";
  if (!fs.existsSync(path.join(ROOT, qp))) { console.log("no paper for", series); return; }

  const msFile = DIR + "/Mark Scheme/" + series + " MS.pdf";
  const scheme = fs.existsSync(path.join(ROOT, msFile)) ? buildScheme(msFile) : {};

  parse(qp).forEach(function (p) {
    const raw = topicFor(p.text);
    const topic = raw ? JSON.parse(raw) : null;
    const code = topic ? topic.code : "";
    const theme = code ? +String(code).charAt(0) : 0;

    built.push({
      q: p.q,
      part: p.part,
      marks: p.marks,
      section: p.section,
      text: p.text,
      ms: (scheme[p.q + p.part] || "").trim(),
      erKey: p.q + p.part,
      pageFrom: p.page,
      pageTo: p.page,
      stimFrom: p.stimFrom,
      stimTo: p.stimTo,
      pdf: qp,
      paper: 3,
      series: series,
      /* Paper 3 asks for both halves of the subject in the same answer, so the
         theme is where the question starts, not the whole of what it needs. */
      theme: theme || 1,
      topicCode: code,
      topicName: topic ? topic.name : "",
      themeConfident: !!(topic && topic.confident),
      synoptic: true,
      year: theme >= 3 ? 2 : 1,
      id: "p3-" + slug(series) + "-q" + p.q + p.part
    });
  });
});

console.log("built", built.length, "Paper 3 questions");
const noTopic = built.filter(function (b) { return !b.topicCode; });
console.log("without a topic:", noTopic.length, noTopic.map(function (b) { return b.id; }).join(", "));

if (process.argv[2] === "--write") {
  const file = path.join(ROOT, "js/eco-questions.js");
  const src = fs.readFileSync(file, "utf8");
  const existing = run("ECO_QUESTIONS").filter(function (q) { return q.paper !== 3; });
  const all = existing.concat(built);

  const cut = src.indexOf("const ECO_QUESTIONS = [");
  const tail = src.indexOf("\n];", cut);
  const after = src.slice(src.indexOf("\n", tail + 3));
  fs.writeFileSync(file, src.slice(0, cut) + "const ECO_QUESTIONS = " +
                   JSON.stringify(all, null, 1) + ";" + after);
  console.log("wrote", all.length, "questions");
} else {
  built.slice(0, 6).forEach(function (b) {
    console.log("  " + b.id + "  " + b.marks + "m  " + (b.topicCode || "?") + " " + b.topicName +
                "  (theme " + b.theme + ", " + (b.themeConfident ? "confident" : "unsure") + ")");
  });
}

module.exports = { built };
