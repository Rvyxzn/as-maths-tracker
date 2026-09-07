/* ============================================================
   Paper 3 examiner reports - Edexcel A level Economics A

   Pearson's own reports, split per question, so the examiner's
   account of what gained and lost marks sits under the question
   it is about instead of in a 50 MB folder of PDFs.

   This is Pearson's wording. The only changes are mechanical:
   the running headers and page numbers are dropped, the wrapped
   lines are rejoined, and the ligature splits the text layer
   introduces are put back together.

   Rejoining those is less trivial than it looks. Extraction
   splits "identified" into "identi fi ed", but it splits "the
   first" the same way, so joining everything gives "thefirst"
   and joining nothing leaves "identi fi ed". The rule used here
   is to join the ligature to the right unless the right token is
   already a word, and to the left unless the left token is a
   word and ligature+right is also a word.
   ============================================================ */

const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");

const DIR = "Exam questions PDFs/A-Level Economics/Examiner Reports";

/* The report for each series, and the series in the question bank it belongs
   to. Summer 2020 and 2021 were cancelled, so those papers were sat in the
   autumn; the bank follows the past-paper site in filing them under June, and
   the reports were matched to them on the papers' own subjects (the Turkish
   lira in 2020, hand car washes in 2021) rather than on their names. */
const REPORTS = [
  { file: "p3-june2017", series: "June 2017" },
  { file: "p3-june2018", series: "June 2018" },
  { file: "p3-june2019", series: "June 2019" },
  { file: "p3-october2020", series: "June 2020" },
  { file: "p3-november2021", series: "June 2021" },
  { file: "p3-june2022", series: "June 2022" },
  { file: "p3-june2023", series: "June 2023" },
  { file: "p3-june2024", series: "June 2024" }
];

/* Most reports head each section "Question 1 (a)" on a line of its own. The
   two autumn ones run the marker into the first sentence instead - "1(a) With
   this question there was a major problem..." - so both forms are read, and
   the inline one only where the tidy form never appears. */
const HEADING = /^\s*Question\s+([12])\s*\(?\s*([a-e])\s*\)?\s*$/i;
const INLINE = /^\s*([12])\s*(?:\(([a-e])\)\s*|([a-e])\s{2,})(.*)$/;

/* Running headers, page numbers, and Pearson's imprint. */
function furniture(t) {
  return !t ||
    /^GCE Economics A 9EC0 0?3\b/i.test(t) ||
    /^\d+\s+GCE Economics A/i.test(t) ||
    /GCE Economics A 9EC0 0?3\s+\d+$/i.test(t) ||
    /^Pearson Education (Limited|Ltd)/i.test(t) ||
    /^Publications? Code/i.test(t) ||
    /^All the material in this publication is copyright/i.test(t) ||
    /^©\s*Pearson/i.test(t) ||
    /^\d{1,3}$/.test(t);
}

const WORDS = (function () {
  /* A small dictionary is enough here: the decision is only ever between two
     candidate joins, and both are ordinary English. */
  const list = ("the first find fine file fill film final finally finance financial fiscal fit five fix flat " +
    "flow follow food for force form found four free from full fully further future off offer office often " +
    "official flexible fluctuate figure figures effect effective efficiency efficient effort");
  const set = {};
  list.split(" ").forEach(function (w) { set[w] = true; });
  return set;
})();

function isWord(w) { return !!WORDS[String(w).toLowerCase()]; }

/* "identi fi ed" -> "identified", but "the fi rst" -> "the first". */
function rejoinLigatures(text) {
  return text.replace(/(\S+)\s+(fi|fl|ff|ffi|ffl)\s+(\S+)/g, function (all, left, lig, right) {
    const joinRight = lig + right;
    if (!isWord(right)) return left + " " + joinRight;       // "the fi rst" -> "the first"
    if (isWord(left) && isWord(joinRight)) return left + " " + joinRight;
    return left + lig + " " + right;                          // "identi fi ed"
  });
}

function textOf(file) {
  /* these report PDFs warn about embedded fonts on nearly every page, which
     is noise rather than failure */
  return execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", path.join(ROOT, file), "-"],
                      { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] })
         .replace(/\r/g, "");
}

function parse(file) {
  const text = textOf(file);
  const lines = text.split("\n");
  const tidy = lines.some(function (l) { return HEADING.test(l.trim()); });

  const out = {};
  let key = null, buf = [], section = 0;

  function flush() {
    if (!key) return;
    const body = rejoinLigatures(buf.join(" ").replace(/\s+/g, " ")).trim();
    if (body) out[key] = (out[key] ? out[key] + " " : "") + body;
    buf = [];
  }

  lines.forEach(function (raw) {
    const t = raw.trim();

    /* Section A is question 1 and Section B is question 2, and one report
       labels a block inside Section A as "2(e)" when a real 2(e) appears
       later in Section B. Where the report states the section, that decides
       the question number. */
    if (/^Section\s+A\b/i.test(t)) { section = 1; return; }
    if (/^Section\s+B\b/i.test(t)) { section = 2; return; }

    const h = t.match(HEADING);
    if (h) { flush(); key = (section || h[1]) + h[2].toLowerCase(); return; }
    if (!tidy) {
      const i = t.match(INLINE);
      if (i) {
        flush();
        key = (section || i[1]) + (i[2] || i[3]).toLowerCase();
        if (i[4]) buf.push(i[4]);
        return;
      }
    }
    if (!key) return;
    if (furniture(t)) return;
    buf.push(t);
  });
  flush();
  return out;
}

function build() {
  const sets = {};
  REPORTS.forEach(function (r) {
    const file = DIR + "/" + r.file + ".pdf";
    if (!fs.existsSync(path.join(ROOT, file))) { console.error("missing", file); return; }
    const questions = parse(file);
    if (!Object.keys(questions).length) { console.error("nothing parsed from", file); return; }
    sets["p3-" + r.series.toLowerCase().replace(/\s+/g, "")] = {
      paper: 3, series: r.series, questions: questions
    };
  });
  return sets;
}

if (require.main === module) {
  const sets = build();
  if (process.argv[2] === "--write") {
    const file = path.join(ROOT, "js/eco-examiner-reports.js");
    const src = fs.readFileSync(file, "utf8");
    const { load, run } = require("./load.js");
    load("js/eco-examiner-reports.js");
    const existing = run("ECO_EXAMINER_REPORTS");
    Object.keys(existing).forEach(function (k) { if (k.indexOf("p3-") !== 0) sets[k] = existing[k]; });

    const cut = src.indexOf("const ECO_EXAMINER_REPORTS = {");
    const head = src.slice(0, cut);
    fs.writeFileSync(file, head + "const ECO_EXAMINER_REPORTS = " +
                     JSON.stringify(sets, null, 1) + ";\n");
    console.log("wrote", Object.keys(sets).length, "report sets");
  } else {
    Object.keys(sets).forEach(function (k) {
      const qs = sets[k].questions;
      console.log(k.padEnd(18), Object.keys(qs).length + " questions:",
                  Object.keys(qs).join(","),
                  "| " + Object.values(qs).reduce(function (a, s) { return a + s.length; }, 0) + " chars");
    });
    const first = sets[Object.keys(sets)[0]];
    if (first) {
      const k = Object.keys(first.questions)[0];
      console.log("\n--- sample " + k + " ---\n" + first.questions[k].slice(0, 500));
    }
  }
}

module.exports = { build, parse, rejoinLigatures, REPORTS };
