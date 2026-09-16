#!/usr/bin/env node
/* ============================================================
   Extract the Chalkface exam-question collections.

   thechalkface.net/xmqs publishes one PDF per textbook chapter
   (Y1P8, Y2S3, ...) made of real Edexcel 9MA0 / 8MA0 questions,
   each followed straight away by its own mark scheme. Page 1 is
   the index:

     2. P1(AS)_2018 Q11. 8 marks - Y1P8 The binomial expansion

   and then, per item, its question page(s) and its scheme
   page(s). The index gives the source paper, question number
   and tariff; the pages give where each one is. A page is a
   scheme page if it carries the scheme table's header or its
   AO codes; everything else after the index is question.

   The chapter is given, not guessed: the file IS the chapter.
   Y1P8 -> pu8, Y2S3 -> st2c3, Y1M9 -> me9 and so on, the same
   textbook numbering the app uses.

   Every question is kept, with its question pages and scheme
   pages recorded separately so the app can show one without the
   other. Chalkface and Yesterday's Maths are alternatives the app
   switches between; a question also in the Yesterday's Maths
   banks is marked `inOtherBank`. Each file's full item list is in
   CF_MATHS_SETS[code].items for the one-at-a-time viewer.

   Run: node tools/extract-chalkface.js [--write] [--probe]
   ============================================================ */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const DIR = "Exam questions PDFs/A-Level Maths/Chalkface";
const CACHE = path.join(ROOT, ".tmpwork", "cf-page-cache");

const CODES = [];
for (let i = 1; i <= 14; i++) CODES.push("Y1P" + i);
for (let i = 1; i <= 7; i++) CODES.push("Y1S" + i);
for (let i = 9; i <= 11; i++) CODES.push("Y1M" + i);
for (let i = 1; i <= 12; i++) CODES.push("Y2P" + i);
for (let i = 1; i <= 3; i++) CODES.push("Y2S" + i);
for (let i = 4; i <= 8; i++) CODES.push("Y2M" + i);

/* The site's own chapter titles. */
const NAMES = {
  Y1P1: "Algebraic expressions", Y1P2: "Quadratics", Y1P3: "Equations and inequalities",
  Y1P4: "Graphs and transformations", Y1P5: "Straight line graphs", Y1P6: "Circles",
  Y1P7: "Algebraic methods", Y1P8: "The binomial expansion", Y1P9: "Trigonometric ratios",
  Y1P10: "Trigonometric identities and equations", Y1P11: "Vectors", Y1P12: "Differentiation",
  Y1P13: "Integration", Y1P14: "Exponentials and logarithms",
  Y1S1: "Data collection", Y1S2: "Measures of location and spread", Y1S3: "Representations of data",
  Y1S4: "Correlation", Y1S5: "Probability", Y1S6: "Statistical distributions", Y1S7: "Hypothesis testing",
  Y1M9: "Constant acceleration", Y1M10: "Forces and motion", Y1M11: "Variable acceleration",
  Y2P1: "Algebraic methods", Y2P2: "Functions and graphs", Y2P3: "Sequences and series",
  Y2P4: "Binomial expansion", Y2P5: "Radians", Y2P6: "Trigonometric functions",
  Y2P7: "Trigonometry and modelling", Y2P8: "Parametric equations", Y2P9: "Differentiation",
  Y2P10: "Numerical methods", Y2P11: "Integration", Y2P12: "Vectors",
  Y2S1: "Regression, correlation and hypothesis testing", Y2S2: "Conditional probability",
  Y2S3: "The normal distribution",
  Y2M4: "Moments", Y2M5: "Forces and friction", Y2M6: "Projectiles",
  Y2M7: "Applications of forces", Y2M8: "Further kinematics"
};

function chapterOf(code) {
  const m = /^Y([12])([PSM])(\d+)$/.exec(code);
  const kind = { P: "pu", S: "st", M: "me" }[m[2]];
  return "ch:" + kind + (m[1] === "2" ? "2c" : "") + m[3];
}

/* ---------- pages (same reader as extract-as-maths.js) ---------- */

function page(pdf, i) {
  let key = null;
  try {
    const st = fs.statSync(pdf);
    key = crypto.createHash("sha1").update(pdf + "|" + st.size + "|" + st.mtimeMs + "|" + i).digest("hex");
    const hit = path.join(CACHE, key + ".txt");
    if (fs.existsSync(hit)) return fs.readFileSync(hit, "utf8");
  } catch (e) { key = null; }
  let text = "";
  try {
    text = execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", "-f", String(i), "-l", String(i), pdf, "-"],
      { maxBuffer: 1 << 26, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .replace(/\r\n?/g, "\n")
      .replace(/DO NOT WRITE IN THIS AREA/g, "")
      .replace(/\f+$/, "");
  } catch (e) { text = ""; }
  if (key) {
    try { fs.mkdirSync(CACHE, { recursive: true }); fs.writeFileSync(path.join(CACHE, key + ".txt"), text, "utf8"); }
    catch (e) { /* slow, not broken */ }
  }
  return text;
}

const SHIFT = 29;
const LONE = /^[$%&'*+]$/;
const CTRL = /[\u0000-\u001f]/;
const SHIFTED_SPACE = "\u0003";
function shiftable(w) {
  for (let i = 0; i < w.length; i++) {
    const c = w.charCodeAt(i);
    if (c < 0x03 || c > 0x61) return false;
  }
  return w.length > 0;
}
function wantsDecoding(w) {
  if (!shiftable(w)) return false;
  if (CTRL.test(w)) return true;
  if (w.length < 2) return LONE.test(w);
  return /[A-Z]/.test(w) && !/[a-z]/.test(w);
}
function unshift(text) {
  if (text.indexOf(SHIFTED_SPACE) < 0) return text;
  return text.split("\n").map(function (line) {
    return line.split(/([ \t]+)/).map(function (chunk) {
      if (/^[ \t]*$/.test(chunk)) return chunk;
      return chunk.split(SHIFTED_SPACE).map(function (w) {
        if (!wantsDecoding(w)) return w;
        let o = "";
        for (let i = 0; i < w.length; i++) o += String.fromCharCode(w.charCodeAt(i) + SHIFT);
        return o;
      }).join(" ");
    }).join("");
  }).join("\n");
}

/* The page count: walk until several empty pages in a row. Every page
   carries a "Page N" header, so a real page is never empty. */
function pagesOf(pdf) {
  const out = [];
  let blanks = 0;
  for (let i = 1; i <= 600 && blanks < 3; i++) {
    const p = unshift(page(pdf, i));
    if (p.trim()) blanks = 0; else blanks++;
    out.push(p);
  }
  while (out.length && !out[out.length - 1].trim()) out.pop();
  return out;
}

/* ---------- the index ---------- */

const INDEX_ROW = /^\s*(\d{1,3})\.\s+(\S+?)\s+Q\s*(\d{1,2})\s*\.?\s*(\d{1,2})\s+marks?\s*-/;

/* A one-question file prints its index differently:
   "1. P1_2020   Y2P6 XMQs and MS" and, lower down, "Q12. 8 marks - ..." */
const INDEX_ONE_A = /^\s*1\.\s+(\S+_\d{4})\b/;
const INDEX_ONE_B = /^\s*Q\s*(\d{1,2})\s*\.?\s*(\d{1,2})\s+marks?\s*-/;

function readIndex(pages) {
  const rows = [];
  {
    const lines = pages[0].split("\n");
    const a = lines.map(function (l) { return INDEX_ONE_A.exec(l); }).filter(Boolean)[0];
    const b = lines.map(function (l) { return INDEX_ONE_B.exec(l); }).filter(Boolean)[0];
    if (a && b && !lines.some(function (l) { return INDEX_ROW.test(l); })) {
      const lineB = lines.filter(function (l) { return INDEX_ONE_B.test(l); })[0];
      const c = /-\s*(Y[12][PSM]\d+)\b/.exec(lineB);
      return { rows: [{ n: 1, source: a[1], num: b[1], marks: +b[2], code: c && NAMES[c[1]] ? c[1] : null }], endsAt: 0 };
    }
  }
  let last = 0;
  for (let i = 0; i < pages.length; i++) {
    let found = false;
    pages[i].split("\n").forEach(function (l) {
      const m = INDEX_ROW.exec(l);
      if (m && +m[1] === rows.length + 1) {
        const c = /-\s*(Y[12][PSM]\d+)\b/.exec(l);
        rows.push({ n: +m[1], source: m[2], num: m[3], marks: +m[4], code: c && NAMES[c[1]] ? c[1] : null });
        found = true;
      }
    });
    if (found) last = i;
    else if (rows.length) break;
  }
  return { rows: rows, endsAt: last };      /* 0-based index of last index page */
}

/* ---------- classifying pages ---------- */

const MS_HEAD = /\b(Qu\w*|Q)\s+Scheme\s+Marks/i;
const AO_CODE = /\b[123]\.\d[ab]?\b/g;
const MARK_CODE = /\b(d?M1|A1\*?|B1|A1ft|dM1|M1\*)\b/g;

function isScheme(text) {
  if (MS_HEAD.test(text)) return true;
  const ao = (text.match(AO_CODE) || []).length;
  const mk = (text.match(MARK_CODE) || []).length;
  /* a continuation page: no header, but a column of marks and AOs */
  /* or a page of the scheme's notes: "M1: For an attempt at..." */
  const noteLines = (text.match(/^\s*(d?M1|A1|B1|A1ft|M1\*|Alt|SC)\b[^\n]{0,6}:/gm) || []).length;
  return mk >= 3 && ao >= 2 || /^\s*Notes?\s*:?\s*$/m.test(text) && mk >= 1 || noteLines >= 2;
}

function questionText(text) {
  return text
    .replace(/^\s*Page \d+\s*$/m, "")
    .replace(/\*P\d+[A-Z]*\d+\*/g, "")
    .split("\n")
    .filter(function (l) {
      const t = l.trim();
      return t && !/^[_.\s]+$/.test(t) && !/^\d*\s*\*P\d+A\d+\*$/.test(t) &&
        !/^(Leave|blank|Turn over|PMT|Question \d+ continued)$/i.test(t) &&
        !/www\.|Total for Question/i.test(t);
    })
    .map(function (l) { return l.replace(/\s+$/, ""); })
    .join("\n")
    .replace(/\(\s*(\d{1,2})\s*\)\s*$/gm, "\n($1)")
    .trim();
}

/* The wording key for spotting a question already in another bank. The
   rubric most Pure questions open with is the same everywhere, so it is
   taken off first -- left on, it made unrelated questions look identical. */
const RUBRIC = [
  "inthisquestionyoumustshowallstagesofyourworking",
  "inthisquestionyoushouldshowallstagesofyourworking",
  "solutionsrelyingoncalculatortechnologyarenotacceptable",
  "solutionsrelyingentirelyoncalculatortechnologyarenotacceptable",
  "sectionastatistics", "answerallquestions", "writeyouranswersinthespacesprovided",
  "sectionbmechanics", "unlessotherwiseindicatedwheneveravalueofgisrequiredtakegmsandgiveyouranswerstoeithertwosignificantfiguresorthreesignificantfigures"
];
/* A scheme page opens with its question number in the left column --
   "Qu 2", "4 (a)", "3(a)" -- so the first page of an item's scheme should
   name the number the index gave. Where it does not, the pages are still
   the ones between this question and the next, and it says so. */
function schemeNamesQuestion(text, num) {
  const head = String(text || "").split("\n").slice(0, 14).join("\n");
  return new RegExp("(^|\\s|Qu\\w*\\s*)" + num + "\\s*(\\(|\\.|$|\\s)", "m").test(head);
}

function norm(s) {
  let t = String(s || "").toLowerCase().replace(/[^a-z]+/g, "");
  RUBRIC.forEach(function (r) { t = t.split(r).join(""); });
  return t;
}

function readFile(code) {
  const pdf = path.join(ROOT, DIR, code + "_XMQs_and_MS.pdf");
  const pages = pagesOf(pdf);
  const idx = readIndex(pages);
  const kinds = pages.map(function (p, i) { return i <= idx.endsAt ? "i" : (isScheme(p) ? "m" : "q"); });

  /* An item starts on the page that prints the next index row's question
     number near its top. Anything else continues what came before: more
     question if its scheme has not started, more scheme if it has -- a
     scheme's notes page often looks like neither. */
  const items = [];
  let cur = null;
  const startsWith = function (text, num) {
    const lines = text.split("\n").map(function (l) { return l.trim(); })
      .filter(function (l) { return l && !/^Page \d+$/.test(l); }).slice(0, 8);
    const re = new RegExp("^" + num + "\\s*\\.(\\s|\\(|$)");
    return lines.some(function (l) { return re.test(l); });
  };
  for (let i = idx.endsAt + 1; i < pages.length; i++) {
    const k = kinds[i];
    const next = idx.rows[items.length];
    /* A question page after a scheme opens the next item even without a
       readable number -- some are printed as images and have no text at all. */
    const opens = next && k === "q" && (startsWith(pages[i], next.num) ||
      (cur && cur.msFrom && !(pages[i].match(MARK_CODE) || []).length));
    if (opens && (!cur || cur.msFrom)) {
      cur = { qFrom: i + 1, qTo: i + 1, msFrom: null, msTo: null };
      items.push(cur);
    } else if (!cur) {
      continue;
    } else if (k === "m" || cur.msFrom) {
      if (!cur.msFrom) cur.msFrom = i + 1;
      cur.msTo = i + 1;
    } else {
      cur.qTo = i + 1;
    }
  }
  if (process.argv.indexOf("--why") >= 0 && process.argv.indexOf(code) >= 0) {
    console.log(idx.rows.map(function (r) { return r.n + ":Q" + r.num; }).join(" "));
    pages.forEach(function (p, i) {
      const it = items.findIndex(function (x) { return x.qFrom === i + 1; });
      const head = p.split("\n").map(function (l) { return l.trim(); })
        .filter(function (l) { return l && !/^Page \d+$/.test(l); }).slice(0, 2).join(" | ");
      console.log(String(i + 1).padStart(3), kinds[i], it >= 0 ? "START " + (it + 1) : "       ", head.slice(0, 90));
    });
  }
  return { code: code, pdf: pdf, pages: pages, index: idx.rows, items: items, kinds: kinds.join("") };
}

/* ---------- other banks, to skip what is already there ---------- */

function loadBank(file, name) {
  const p = path.join(ROOT, "js", file);
  if (!fs.existsSync(p)) return [];
  return new Function(fs.readFileSync(p, "utf8") + "; return " + name + ";")();
}

function main() {
  const probe = process.argv.indexOf("--probe") >= 0;
  const existing = loadBank("maths-exam-questions.js", "MATHS_EXAM_QUESTIONS")
    .concat(loadBank("as-maths-exam-questions.js", "AS_MATHS_EXAM_QUESTIONS"));
  /* Two copies of one question rarely extract identically -- a footer
     code here, a figure label there -- so a question is a duplicate when
     the shorter wording is the start of the longer, and long enough (40
     letters after the rubric) to mean it. */
  const keys = [];
  const KEYLEN = 90, MINKEY = 40;
  existing.forEach(function (q) {
    const k = norm(questionText(q.text)).slice(0, KEYLEN);
    if (k.length >= MINKEY) keys.push({ k: k, rec: null });
  });
  const dupOf = function (k) {
    if (k.length < MINKEY) return undefined;
    for (let i = 0; i < keys.length; i++) {
      const a = keys[i].k;
      const n = Math.min(a.length, k.length);
      if (a.slice(0, n) === k.slice(0, n)) return keys[i];
    }
    return undefined;
  };

  const out = [];
  const sets = {};
  let dupes = 0, mismatched = 0;
  CODES.forEach(function (code) {
    const f = readFile(code);
    const ok = f.index.length === f.items.length;
    if (!ok) mismatched++;
    console.log(code.padEnd(6), "index", String(f.index.length).padStart(3),
      "items", String(f.items.length).padStart(3), ok ? "" : "MISMATCH",
      probe ? " " + f.kinds : "");
    if (!ok) return;

    sets[code] = { name: NAMES[code], chapter: chapterOf(code), items: [] };

    f.index.forEach(function (row, i) {
      const it = f.items[i];
      const text = questionText(f.pages.slice(it.qFrom - 1, it.qTo).join("\n"));
      const key = norm(text).slice(0, KEYLEN);
      const msCheck = !it.msFrom ? "none"
        : schemeNamesQuestion(f.pages[it.msFrom - 1], row.num) ? "verified" : "unverifiable";

      /* Every item goes in its file's list, duplicate or not: the Exam
         Questions page walks the file one question at a time, and a gap
         where a question is printed would be confusing. */
      sets[code].items.push({
        n: row.n, num: row.num, marks: row.marks,
        source: row.source.replace(/_/g, " ") + " Q" + row.num,
        qFrom: it.qFrom, qTo: it.qTo, msFrom: it.msFrom, msTo: it.msTo, msCheck: msCheck
      });

      const dup = dupOf(key);
      if (dup && dup.rec) {
        /* The same question in an earlier Chalkface file: it belongs to this
           chapter too -- the file's author put it here. */
        if (dup.rec.chapters.indexOf(chapterOf(code)) < 0) dup.rec.chapters.push(chapterOf(code));
        return;
      }
      /* Already in the Yesterday's Maths banks. Kept -- you may be using
         Chalkface instead of those -- but marked, so a practice test that
         draws from both never serves it twice. */
      if (dup) dupes++;
      /* The row names the chapter the question is really on, which is
         usually the file's own but not always: Y1S3 opens with a Data
         Collection question. It is filed under both. */
      const rowCode = row.code || code;
      const chapters = [chapterOf(rowCode)];
      if (chapters.indexOf(chapterOf(code)) < 0) chapters.push(chapterOf(code));
      const year = /^Y1/.test(rowCode) && /^Y1/.test(code) ? 1 : 2;
      const rec = {
        id: "cf-" + code.toLowerCase() + "-" + String(row.n).padStart(2, "0"),
        set: "cf" + code,
        topic: NAMES[rowCode] || NAMES[code],
        chapters: chapters,
        num: row.num,
        source: row.source.replace(/_/g, " ") + " Q" + row.num,
        marks: row.marks,
        year: year,
        pageFrom: it.qFrom, pageTo: it.qTo,
        msFrom: it.msFrom, msTo: it.msTo,
        msCheck: msCheck,
        inOtherBank: !!dup,
        flags: "",
        text: text
      };
      if (key.length >= MINKEY) keys.push({ k: key, rec: rec });
      out.push(rec);
    });
  });

  const marks = out.reduce(function (a, q) { return a + q.marks; }, 0);
  console.log("");
  console.log(out.length + " questions, " + marks + " marks; " + dupes +
    " of them also in the Yesterday's Maths banks; " + mismatched + " files skipped (index and pages disagree)");

  if (process.argv.indexOf("--write") >= 0) {
    const file = path.join(ROOT, "js", "cf-maths-exam-questions.js");
    const header = "/* ============================================================\n" +
      "   Chalkface exam questions (thechalkface.net/xmqs).\n\n" +
      "   " + out.length + " real Edexcel questions carrying " + marks + " marks, one\n" +
      "   collection per textbook chapter, each with its own scheme in\n" +
      "   the same PDF, question and scheme pages recorded separately.\n\n" +
      "   Built by tools/extract-chalkface.js -- do not hand edit.\n" +
      "   ============================================================ */\n\n";
    const body = "const CF_MATHS_SETS = " + JSON.stringify(sets, null, 1) + ";\n\n" +
      "const CF_MATHS_EXAM_QUESTIONS = [\n" +
      out.map(function (q) { return "  " + JSON.stringify(q); }).join(",\n") + "\n];\n";
    fs.writeFileSync(file, header + body, "utf8");
    console.log("wrote " + file);
  }
}

main();
