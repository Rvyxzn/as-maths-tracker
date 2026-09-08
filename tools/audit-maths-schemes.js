/* Does each maths question's mark scheme actually belong to it?

   The pairing was done by aligning two sequences, which is sound but not
   proof. This checks the pairing against the documents themselves, on two
   signals that are independent of how the alignment was made:

     number   the scheme pages name the question number the paper printed
     total    the scheme pages print a total equal to the question's tariff

   Neither is available everywhere - the older scheme format prints no
   totals at all - so a question is reported by what could be checked rather
   than scored on a single number. */

const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path");
const { load, run } = require("./load.js");
const ROOT = path.join(__dirname, "..");

load("js/exam-pdfs.js");
load("js/maths-exam-questions.js");

const SETS = run("EXAM_SETS");
const ROOTS = run("PDF_ROOTS");
const DIRS = run("PDF_DIRS");
const Q = run("MATHS_EXAM_QUESTIONS");

function msPath(setKey) {
  const s = SETS[setKey];
  if (!s) return null;
  const root = s.root || "as";
  const dirs = DIRS[root][s.dir];
  return ROOTS[root] + s.dir + "/" + dirs.ms + "/" + s.ms + ".pdf";
}

const cache = {};
function pages(file) {
  if (cache[file]) return cache[file];
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) return (cache[file] = null);
  try {
    cache[file] = execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", full, "-"],
      { encoding: "utf8", maxBuffer: 128 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] })
      .replace(/\r/g, "").split("\f");
  } catch (e) { cache[file] = null; }
  return cache[file];
}

const rows = [];
Q.forEach(function (q) {
  const file = msPath(q.set);
  const pg = file ? pages(file) : null;
  if (!pg) { rows.push({ id: q.id, set: q.set, verdict: "no pdf" }); return; }
  if (!q.msFrom) { rows.push({ id: q.id, set: q.set, verdict: "no pages" }); return; }

  const from = Math.max(1, q.msFrom), to = Math.min(pg.length, q.msTo || q.msFrom);
  const text = pg.slice(from - 1, to).join("\n");
  if (!text.trim()) { rows.push({ id: q.id, set: q.set, verdict: "blank pages" }); return; }

  /* the question number as a scheme prints it: at the start of a line, or in
     a "Question N" heading */
  const numRe = new RegExp("(^|\n)\s*" + q.num + "\s*[.\)（(]?\s|Question\s+" + q.num + "\b");
  const hasNum = numRe.test(text);

  /* a printed total equal to this question's tariff */
  const totals = (text.match(/\((\d{1,2})\s*marks?\)|\((\d{1,2})\)\s*$/gm) || [])
    .map(function (s) { return +(s.match(/\d+/) || [0])[0]; });
  const hasTotal = totals.indexOf(q.marks) >= 0;
  const anyTotal = totals.length > 0;

  rows.push({
    id: q.id, set: q.set, num: q.num, marks: q.marks, check: q.msCheck,
    hasNum: hasNum, hasTotal: hasTotal, anyTotal: anyTotal,
    verdict: (hasNum && hasTotal) ? "both"
           : hasTotal ? "total only"
           : hasNum ? "number only"
           : anyTotal ? "totals present, none match"
           : "nothing to check"
  });
});

const tally = {};
rows.forEach(function (r) { tally[r.verdict] = (tally[r.verdict] || 0) + 1; });
console.log("questions:", rows.length);
Object.keys(tally).sort().forEach(function (k) {
  console.log("  " + String(tally[k]).padStart(4) + "  " + k);
});

const bad = rows.filter(function (r) { return r.verdict === "totals present, none match"; });
console.log("\nMISMATCHED — the scheme pages print totals and none is this question's tariff:");
console.log("  " + bad.length + " questions");
const bySet = {};
bad.forEach(function (r) { (bySet[r.set] = bySet[r.set] || []).push(r); });
Object.keys(bySet).sort().forEach(function (s) {
  console.log("  " + s.padEnd(22) + bySet[s].length + "  e.g. " +
    bySet[s].slice(0, 3).map(function (r) { return "Q" + r.num + " (" + r.marks + "m)"; }).join(", "));
});

if (process.argv[2] === "--json") {
  fs.writeFileSync(path.join(__dirname, "..", ".tmpwork", "scheme-audit.json"),
    JSON.stringify(rows, null, 1));
  console.log("\nwritten to .tmpwork/scheme-audit.json");
}
