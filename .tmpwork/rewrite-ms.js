const fs = require("fs"), path = require("path");
const { build } = require("./extract-ms.js");
const { load, run } = require("./load.js");
load("js/eco-questions.js");
const Q = run("ECO_QUESTIONS");

function msPath(qpPath) {
  return qpPath.replace("/Questions/", "/Mark Scheme/").replace(/ QP\.pdf$/, " MS.pdf");
}

const cache = {};
function schemeFor(q) {
  const f = msPath(q.pdf);
  if (!cache[f]) {
    if (!fs.existsSync(path.join(__dirname, "..", f))) { cache[f] = { __missing: true }; }
    else cache[f] = build(f);
  }
  return cache[f];
}

const report = [];
Q.forEach(function (q) {
  const set = schemeFor(q);
  if (set.__missing) { report.push([q.id, "NO MS PDF"]); return; }
  let text;
  if (q.part) {
    text = set[q.q + q.part];
    if (!text) { report.push([q.id, "no block for " + q.q + q.part]); return; }
  } else {
    /* Section A prints (a), (b), (c) as separate blocks under one 5-mark
       question, so they are stitched back together in paper order with the
       part markers kept, which is how the paper reads. */
    const parts = Object.keys(set).filter(function (k) {
      return k === q.q || k.indexOf(q.q) === 0 && /^[a-e]$/.test(k.slice(q.q.length));
    }).sort();
    if (!parts.length) { report.push([q.id, "no block for " + q.q]); return; }
    text = parts.map(function (k) {
      const label = k.length > q.q.length ? "(" + k.slice(q.q.length) + ")\n" : "";
      return label + set[k];
    }).join("\n\n");
  }
  q.ms = text.trim();
});

const header = fs.readFileSync(path.join(__dirname, "..", "js/eco-questions.js"), "utf8");
const cut = header.indexOf("const ECO_QUESTIONS = [");
const tailStart = header.lastIndexOf("\n];");
const before = header.slice(0, cut);
const after = header.slice(header.indexOf("\n", tailStart + 3));

fs.writeFileSync(path.join(__dirname, "..", "js/eco-questions.js"),
  before + "const ECO_QUESTIONS = " + JSON.stringify(Q, null, 1) + ";" + after);

console.log("rewritten:", Q.length, "questions");
console.log("problems:", report.length);
report.forEach(function (r) { console.log("  " + r.join(" | ")); });
