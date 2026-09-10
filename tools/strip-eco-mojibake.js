#!/usr/bin/env node
/* ============================================================
   Strip the shifted-font page furniture out of the Economics text.

   Some of these PDFs set their running footer in a subsetted
   font with no character map, so pdftotext reports the glyph
   numbers instead of the letters. The subset numbers glyphs in
   order of first use, which is why it comes out as a rising run
   of punctuation: !"#$%&'() is P, e, a, r, s, o, n and a space.

   Decoded, every one of them says the same thing:

     "Pearson Edexcel Level 3 Advanced GCE in Economics A
      Sample Assessment Materials - Issue 1 - September 2015
      (c) Pearson Education Limited 2015"

   That is the bottom of the page, not the extract, so it is
   removed rather than repaired. Nothing readable is lost.

   THE TEST FOR IT has to be narrow, because a table of figures
   is also mostly digits and punctuation. A run counts as this
   font only when it has no lower-case letter at all AND uses
   several different punctuation marks: "2.0 1.6 1.2 0.8" uses
   one, and survives.

   Run: node tools/strip-eco-mojibake.js [--write]
   ============================================================ */

const fs = require("fs");
const path = require("path");
const { load, run } = require("./load.js");

load("js/eco-questions.js");
const CS = run("ECO_CASE_STUDIES");
const Q = run("ECO_QUESTIONS");

const PUNCT = "\"#$%&'*+,-./:;<=>?@";
const RUN = /[!-@A-Z\s]{20,}/g;

function isShiftedFont(chunk) {
  if (/[a-z]/.test(chunk)) return false;
  const solid = chunk.replace(/\s/g, "");
  if (solid.length < 18) return false;
  const marks = solid.split("").filter(function (c) { return PUNCT.indexOf(c) >= 0; });
  const distinct = {};
  marks.forEach(function (c) { distinct[c] = true; });
  return Object.keys(distinct).length >= 4 && marks.length / solid.length >= 0.25;
}

function strip(text) {
  if (!text) return { text: text, cut: null };
  let cut = null;
  const out = String(text).replace(RUN, function (m) {
    if (!isShiftedFont(m)) return m;
    cut = m.trim().slice(0, 70);
    /* An open bracket at the end of the run belongs to what comes after it,
       not to the footer: one of these sits immediately before "(billion
       dollars)" and swallowing it left the caption missing its bracket. */
    return /\($/.test(m) ? " (" : " ";
  });
  return { text: out.replace(/[ \t]{2,}/g, " ").trim(), cut: cut };
}

const hits = [];
Object.keys(CS).forEach(function (k) {
  (CS[k].extracts || []).forEach(function (e) {
    const r = strip(e.body);
    if (r.cut) hits.push({ where: k + " " + e.label, cut: r.cut, before: (e.body || "").length, after: r.text.length });
  });
});
Q.forEach(function (q) {
  ["text", "ms"].forEach(function (f) {
    const r = strip(q[f]);
    if (r.cut) hits.push({ where: q.id + " ." + f, cut: r.cut, before: String(q[f]).length, after: r.text.length });
  });
});

hits.forEach(function (h) {
  console.log(h.where.padEnd(28), h.before + " -> " + h.after, "  cut: " + h.cut);
});
console.log("");
console.log(hits.length + " runs of shifted-font furniture");

if (process.argv.indexOf("--write") >= 0 && hits.length) {
  const file = path.join(__dirname, "..", "js", "eco-questions.js");
  let src = fs.readFileSync(file, "utf8");
  let done = 0;
  /* The file is JSON-ish source, so the runs are replaced in their escaped
     form exactly as they appear in it. */
  Object.keys(CS).forEach(function (k) {
    (CS[k].extracts || []).forEach(function (e) {
      const r = strip(e.body);
      if (!r.cut) return;
      const from = JSON.stringify(e.body).slice(1, -1);
      const to = JSON.stringify(r.text).slice(1, -1);
      if (src.indexOf(from) < 0) { console.log("could not find " + k + " " + e.label + " in the source"); return; }
      src = src.replace(from, to);
      done++;
    });
  });
  Q.forEach(function (q) {
    ["text", "ms"].forEach(function (f) {
      const r = strip(q[f]);
      if (!r.cut) return;
      const from = JSON.stringify(q[f]).slice(1, -1);
      const to = JSON.stringify(r.text).slice(1, -1);
      if (src.indexOf(from) < 0) { console.log("could not find " + q.id + " ." + f); return; }
      src = src.replace(from, to);
      done++;
    });
  });
  fs.writeFileSync(file, src, "utf8");
  console.log("rewrote " + done + " of " + hits.length);
}
