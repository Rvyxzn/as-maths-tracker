#!/usr/bin/env node
/* ============================================================
   Does each Paper 3 case study actually contain its case?

   Paper 3's stimulus is not transcribed -- its figures are charts
   and its extracts run to pages -- so the panel renders the
   paper's own pages. That is only honest if the page range
   really holds all of them. The paper says which: "Read Figures
   1 to 3 and the following extracts (A and B)". So the
   instruction is read out of the pages and checked against what
   is on them.

   Run: node tools/audit-eco-stimulus.js
   ============================================================ */

const { execFileSync } = require("child_process");
const path = require("path");
const { load, run } = require("./load.js");

const ROOT = path.join(__dirname, "..");
load("js/eco-questions.js");
const Q = run("ECO_QUESTIONS");

function page(pdf, i) {
  try {
    return execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", "-f", String(i), "-l", String(i), pdf, "-"],
      { maxBuffer: 1 << 26, encoding: "utf8" }).replace(/\r\n?/g, "\n");
  } catch (e) { return ""; }
}

/* One range per paper section, however many questions share it. */
const ranges = {};
Q.forEach(function (q) {
  /* Only the papers whose case study IS the pages. Paper 1 and 2 carry a
     stimulus range too, but their extracts are transcribed and their
     figures redrawn, so the range is only where those came from and not
     what the panel shows. */
  if (q.caseKey || !q.stimFrom || !q.pdf) return;
  const k = q.pdf + "|" + q.stimFrom + "-" + q.stimTo;
  if (!ranges[k]) ranges[k] = { pdf: q.pdf, from: q.stimFrom, to: q.stimTo, section: q.section, qs: [] };
  ranges[k].qs.push(q.id);
});

const keys = Object.keys(ranges).sort();
let bad = 0;
keys.forEach(function (k) {
  const r = ranges[k];
  const abs = path.join(ROOT, r.pdf);
  let text = "";
  for (let p = r.from; p <= r.to; p++) text += "\n" + page(abs, p);

  /* "Read Figures 1 to 3 and the following extracts (A and B)" */
  const want = { figures: [], extracts: [] };
  const fig = /Read\s+Figures?\s+(\d+)\s*(?:to|and|-|–)\s*(\d+)/i.exec(text);
  if (fig) for (let n = +fig[1]; n <= +fig[2]; n++) want.figures.push(n);
  else {
    const one = /Read\s+Figure\s+(\d+)/i.exec(text);
    if (one) want.figures.push(+one[1]);
  }
  /* Written either "the following extracts (A and B)" or plainly "Read
     extracts A and B", so the brackets cannot be required. */
  /* Case-sensitive on purpose. With /i the letters class matched lower
     case too, so "extract shale" in the body of an extract answered
     first and the real instruction was never reached. */
  const ex = /[Ee]xtracts\s*\(?\s*([A-Z](?:\s*(?:and|,|to|-|–)\s*[A-Z])+)/.exec(text);
  if (ex) (ex[1].match(/[A-Z]/g) || []).forEach(function (c) { want.extracts.push(c); });

  const missing = [];
  /* A figure is labelled "Figure 3: caption", or "Figure 3" alone above
     the chart, or -- on the specimen paper, where two charts sit side by
     side -- "Figure 2        Figure 3" on one line. Insisting on a colon
     or on owning the line marked figures missing that were plainly
     there, so any standalone mention counts. The instruction itself says
     "Figures 1 to 4", plural, so it can never be mistaken for a label. */
  want.figures.forEach(function (n) {
    const re = new RegExp("(^|[^A-Za-z])Figure[ \\t]+" + n + "(?![0-9])", "m");
    if (!re.test(text)) missing.push("Figure " + n);
  });
  want.extracts.forEach(function (c) {
    if (!new RegExp("Extract\\s+" + c + "\\b").test(text)) missing.push("Extract " + c);
  });

  const label = path.basename(r.pdf, ".pdf") + " s" + r.section + " p" + r.from + "-" + r.to;
  if (!want.figures.length && !want.extracts.length) {
    console.log(label.padEnd(38), "no instruction found on these pages — cannot check");
  } else if (missing.length) {
    bad++;
    console.log(label.padEnd(38), "MISSING " + missing.join(", ") +
      "  (wants figures " + want.figures.join(",") + " and extracts " + want.extracts.join(",") + ")");
  } else {
    console.log(label.padEnd(38), "figures " + want.figures.join(",") +
      " and extracts " + want.extracts.join(",") + " all present");
  }
});
console.log("");
console.log(keys.length + " stimulus ranges, " + bad + " missing something");
