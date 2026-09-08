#!/usr/bin/env node
/* ============================================================
   One section, one stimulus range.

   Paper 3's case-study panel renders the paper's own pages. On
   the specimen paper the range had been taken as "everything up
   to this part's own page", so Question 1(a) got pages 2-4, the
   real stimulus, while 1(d) got 2-7 -- which is the stimulus
   plus three pages of Question 1(a) to 1(c) and their answer
   lines. Opening the case study on the last part therefore
   showed you the earlier questions.

   Every part of a section reads the same stimulus, so the range
   is the shortest one any part of that section claims: that is
   the one that stops before the questions start.

   Run: node tools/fix-eco-stimulus.js [--write]
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { load, run } = require("./load.js");

const ROOT = path.join(__dirname, "..");
load("js/eco-questions.js");
const Q = run("ECO_QUESTIONS");

const shortest = {};
Q.forEach(function (q) {
  if (q.caseKey || !q.stimFrom || !q.pdf) return;
  const k = q.pdf + "|" + q.section;
  if (shortest[k] == null || q.stimTo < shortest[k]) shortest[k] = q.stimTo;
});

const fixes = [];
Q.forEach(function (q) {
  if (q.caseKey || !q.stimFrom || !q.pdf) return;
  const want = shortest[q.pdf + "|" + q.section];
  if (q.stimTo !== want) fixes.push({ id: q.id, from: q.stimTo, to: want });
});

fixes.forEach(function (f) {
  console.log(f.id.padEnd(18), "stimTo " + f.from + " -> " + f.to);
});
console.log(fixes.length + " questions were showing question pages as case study");

if (process.argv.indexOf("--write") >= 0 && fixes.length) {
  const file = path.join(ROOT, "js", "eco-questions.js");
  let src = fs.readFileSync(file, "utf8");
  let done = 0;
  fixes.forEach(function (f) {
    /* Each question is one object literal keyed by its id; the stimTo
       inside that object is the next one after the id. */
    const at = src.indexOf('"id": "' + f.id + '"');
    if (at < 0) { console.log("could not find " + f.id); return; }
    /* The id is the LAST field of each question object, so the block runs
       backwards from it to the brace that opened it. Searching forwards
       instead patched the stimTo of the NEXT question. */
    const start = src.lastIndexOf("\n {", at);
    if (start < 0) { console.log("no object start for " + f.id); return; }
    const block = src.slice(start, at);
    const patched = block.replace(/"stimTo":\s*\d+/, '"stimTo": ' + f.to);
    if (patched === block) { console.log("no stimTo in " + f.id); return; }
    src = src.slice(0, start) + patched + src.slice(at);
    done++;
  });
  fs.writeFileSync(file, src, "utf8");
  console.log("rewrote " + done + " of " + fixes.length);
}
