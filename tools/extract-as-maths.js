#!/usr/bin/env node
/* ============================================================
   Extract the AS (Year 1) topic question sets.

   The A level topic PDFs were extracted a while back and became
   the 407 questions in js/maths-exam-questions.js. The 21 AS
   sets sitting beside them were never touched, which is why
   filtering the practice test to Year 1 served almost nothing:
   Binomial Expansion offered three questions out of a PDF with
   fourteen, and the A level set it fell back on spans both
   years so it is excluded from a Year 1 filter by design.

   The approach is the one the questions file already documents
   and is repeated here so this file stands on its own:

   THE PAGE IS THE QUESTION. Extracted text cannot carry a
   diagram, a laid-out fraction, or a subsetted font with no
   character map. So the app renders the question's own pages
   out of the PDF and the text here is a searchable shadow,
   with `flags` recording what did not survive.

   QUESTION BOUNDARIES come from the pages. These are whole
   exam pages lifted out of real papers, so a question starts
   on a page whose opening lines carry a question number, and
   runs until the next page that does.

   MARKS come from the tariffs the paper prints down the right
   margin, summed. That is the number the question is worth
   and it is read from the question paper alone.

   THE MARK SCHEME is aligned by sequence, not by search.
   Scheme pages run in the same order as the questions and
   scheme pages are full of algebra that starts with a digit,
   so a forward search for "question 8" finds the wrong thing.
   Longest common subsequence skips noise, keeps order, and
   cannot be dragged out of step by one bad hit. `msCheck`
   records how far each pairing can be trusted.

   Run: node tools/extract-as-maths.js [--write]
   Without --write it reports and changes nothing.
   ============================================================ */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { load, run } = require("./load.js");

const ROOT = path.join(__dirname, "..");

load("js/exam-pdfs.js");
const EXAM_SETS = run("EXAM_SETS");
const CHAPTER_SETS = run("CHAPTER_SETS");
const PDF_ROOTS = run("PDF_ROOTS");
const PDF_DIRS = run("PDF_DIRS");

/* Which chapters each set covers, read back out of the map the app
   already keeps, so this never invents a mapping of its own. */
const setChapters = {};
Object.keys(CHAPTER_SETS).forEach(function (cid) {
  (CHAPTER_SETS[cid] || []).forEach(function (e) {
    const k = typeof e === "string" ? e : e.key;
    if (!k) return;
    (setChapters[k] = setChapters[k] || []).push("ch:" + cid);
  });
});

function setPath(key, which) {
  const s = EXAM_SETS[key];
  const root = s.root || "as";
  const dirs = PDF_DIRS[root][s.dir];
  const folder = which === "ms" ? dirs.ms : dirs.q;
  const file = (which === "ms" ? s.ms : s.q) + ".pdf";
  return path.join(ROOT, PDF_ROOTS[root], s.dir, folder, file);
}

/* PAGE NUMBERS HAVE TO BE THE PDF's OWN, because the app renders these
   pages out of the file. Extracting the whole document in one go and
   splitting on form feeds does not give them: -layout emits a form feed
   between separate text flows as well as between pages, and the binomial
   scheme came out as 40 "pages" for a 14 page file. So each page is
   asked for by number, and the count is read out of the page tree. */
function page(pdf, i) {
  return execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", "-f", String(i), "-l", String(i), pdf, "-"],
    { maxBuffer: 1 << 26, encoding: "utf8" })
    /* Carriage returns first. A stray \r on the end of a line is a
       control character, the decoder reads control characters as proof
       that a word is in the shifted font, and "(2)\r" duly came out as
       "EOF*" -- taking the tariff with it. */
    .replace(/\r\n?/g, "\n")
    /* The vertical rubric is set in the document font, not the shifted
       one, so it has to go before anything is decoded -- otherwise it
       decodes as well and every page ends up saying "al klq tofqb". */
    .replace(/DO NOT WRITE IN THIS AREA/g, "")
    /* ONLY THE TRAILING FORM FEED. Stripping them all looked harmless
       and quietly deleted every closing bracket on a shifted page: ")"
       shifted down by 29 is a form feed, so "(a)" arrives as 0x0b 0x44
       0x0c and came out as "(a". Every tariff on those pages went with
       it, which is why three Circles questions were worth nothing. */
    .replace(/\f+$/, "");
}

/* Half of these files have a compressed cross-reference table, so the page
   count is not readable out of the bytes and poppler has no page-count tool
   installed here. Asking for page N past the end is not an error, it is
   simply empty, so the end is found by walking off it: five empty pages in
   a row and the file is over. Five, because a scheme can carry a blank
   page and stopping at the first one would silently lose the rest. */
function pagesOf(pdf) {
  const out = [];
  let blanks = 0;
  for (let i = 1; i <= 400 && blanks < 5; i++) {
    const p = unshift(page(pdf, i));
    if (p.trim()) blanks = 0; else blanks++;
    out.push(p);
  }
  while (out.length && !out[out.length - 1].trim()) out.pop();
  return out;
}

/* ---------- the shifted font ----------

   Some of these pages come out as "7KH FLUFOH C KDV HTXDWLRQ". That is
   not corruption, it is a subsetted font with no character map: the
   glyphs were renumbered from the start of the font's own table and
   pdftotext reports the numbers. The offset is a constant 29, because
   the subset begins at the space, so "The" is stored as 0x37 0x4b 0x48
   and "The circle C has equation" comes back exactly.

   Left alone this cost more than ugly text. The question number went
   with it, so four pages of Circles ran together as one question worth
   eighteen marks, and every tariff on those pages was counted against
   the wrong question.

   Not everything on such a page is shifted -- single italic variables
   are set in a different font and arrive correctly -- so the decision
   is made a word at a time. A word is shifted if it carries a character
   below space, since nothing else produces those, or if it has a
   capital and no lower case, which is what shifted text looks like:
   capitals become digits and lower case becomes capitals, so a shifted
   word can never contain a lower-case letter. Single characters are
   left alone unless they are unambiguous, because "C" is far more
   likely to be a circle than a backtick. */
const SHIFT = 29;
const LONE = /^[$%&'*+]$/;              /* A B C D G H, never punctuation */
const CTRL = /[\u0000-\u001f]/;
const SHIFTED_SPACE = "\u0003";

function shiftable(w) {
  if (!w.length) return false;
  for (let i = 0; i < w.length; i++) {
    const c = w.charCodeAt(i);
    if (c < 0x03 || c > 0x61) return false;
  }
  return true;
}

function decodeWord(w) {
  let out = "";
  for (let i = 0; i < w.length; i++) out += String.fromCharCode(w.charCodeAt(i) + SHIFT);
  return out;
}

function wantsDecoding(w) {
  if (!shiftable(w)) return false;
  if (CTRL.test(w)) return true;
  if (w.length < 2) return LONE.test(w);
  return /[A-Z]/.test(w) && !/[a-z]/.test(w);
}

function unshift(text) {
  /* Only pages actually carrying the shifted font are touched, so a clean
     page cannot be damaged by a word that merely looks like one. */
  if (text.indexOf(SHIFTED_SPACE) < 0) return text;
  /* Splitting on \s would be wrong here. "(" and ")" shift down to the
     vertical tab and the form feed, which \s matches, so every bracket
     on the page would be read as a space and thrown away -- and the
     tariff is a bracket. Only a real space or tab separates words. */
  return text.split("\n").map(function (line) {
    return line.split(/([ \t]+)/).map(function (chunk) {
      if (/^[ \t]*$/.test(chunk)) return chunk;
      /* Inside a chunk the spaces are shifted too, so the words are
         separated by that character rather than by a real space. */
      return chunk.split(SHIFTED_SPACE).map(function (w) {
        return wantsDecoding(w) ? decodeWord(w) : w;
      }).join(" ");
    }).join("");
  }).join("\n");
}

/* ---------- reading a question page ---------- */

const WATERMARK = /www\.yesterdaysmathsexam\.com/i;
const CHROME = /^(DO NOT WRITE IN THIS AREA|Leave|blank|Turn over|TOTAL FOR PAPER.*|PMT)$/i;
const RULE = /^[_\s]+$/;
const FOOTER = /^\d{0,3}\s*\*[A-Z0-9]{8,}\*\s*\d{0,3}$/;
const QSTART = /^ {0,6}(\d{1,2})[.)](\s|$)/;
const TARIFF = /\((\d{1,2})\)\s*$/;
const PRINTED = /\((?:Total(?:\s+for\s+[^)]*?)?\s+)?(\d{1,3})\s*marks?\)/i;

/* A tariff is printed hard against the right margin. A "(4)" sitting in
   the body of the question is part of the maths, not what it is worth,
   so column position is what tells them apart. */
function tariffOn(raw) {
  /* The vertical "DO NOT WRITE IN THIS AREA" rubric lands to the right of
     the tariff on about a third of these pages, which put the tariff in
     the middle of the line instead of at the end of it. Two questions on
     the Surds page came out worth four marks between them for exactly
     that reason, so the rubric goes before the tariff is looked for. */
  const line = raw.replace(/DO NOT WRITE IN THIS AREA/g, "")
    .replace(WATERMARK, "").replace(/\s+$/, "");
  const m = TARIFF.exec(line);
  if (!m) return null;
  if (line.indexOf(m[0]) < 30) return null;
  return +m[1];
}

/* The first question number on a page, looked for only near the top:
   further down, "8." is as likely to be a step of the working. */
function startsOn(page) {
  const lines = page.split("\n");
  let seen = 0;
  for (let i = 0; i < lines.length && seen < 8; i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    if (WATERMARK.test(l)) continue;
    seen++;
    const m = QSTART.exec(l);
    if (m && sane(+m[1])) return { num: m[1], line: i };
  }
  return null;
}

function cleanPage(page) {
  const keep = [];
  page.split("\n").forEach(function (raw) {
    let l = raw.replace(WATERMARK, "").replace(/DO NOT WRITE IN THIS AREA/g, "");
    l = l.replace(/\s+$/, "");
    const t = l.trim();
    if (!t) { keep.push(""); return; }
    if (RULE.test(t)) return;
    if (CHROME.test(t)) return;
    if (FOOTER.test(t)) return;
    keep.push(l.replace(/^\s+/, function (s) { return s.length > 60 ? "" : s; }));
  });
  return keep.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* What did not survive extraction. Better to say so than to show a
   question that quietly lost its diagram. */
const MOJI = /[\u0000-\u0008\u000b\u000e-\u001f]|[\u00a7\u00a8\u00a9\u00aa\u00ab\u00ac\u00ad\u00ae\u00af\u00b0\u00b1\u00b2\u00b3\u00b4\u00b5\u00b6\u00b7\u00b8\u00b9]{2,}|\bIRUP\b|\bWKH\b|\bDQG\b|\bWLRQ\b/;

function flagsFor(text) {
  const f = [];
  if (/\bFigure\s+\d|\bdiagram\b|shown in Figure|sketch(?:ed)? (?:the )?(?:graph|curve)/i.test(text)) f.push("figure");
  if (MOJI.test(text)) f.push("font");
  /* A laid-out fraction comes apart into a numerator line, a short
     denominator line on its own, and the rest of the sentence. */
  const lines = text.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
  for (let i = 1; i < lines.length - 1; i++) {
    if (lines[i].length <= 3 && /^[0-9a-zA-Z]+$/.test(lines[i]) && lines[i - 1].length > 12) {
      f.push("layout"); break;
    }
  }
  return f;
}

function readQuestions(pdf) {
  const pages = pagesOf(pdf);
  const qs = [];
  pages.forEach(function (page, i) {
    const s = startsOn(page);
    const cur = qs[qs.length - 1];
    /* A page with no number at the top, or with the number of the
       question already open, is that question continuing. */
    if (!s) {
      if (cur) { cur.pageTo = i + 1; cur.pages.push(page); }
      return;
    }
    qs.push({ num: s.num, pageFrom: i + 1, pageTo: i + 1, pages: [page] });
  });

  qs.forEach(function (q) {
    let marks = 0, any = false;
    q.pages.forEach(function (p) {
      p.split("\n").forEach(function (l) {
        const t = tariffOn(l);
        if (t != null) { marks += t; any = true; }
      });
    });
    if (!any) {
      const m = PRINTED.exec(q.pages.join("\n"));
      if (m) { marks = +m[1]; any = true; }
    }
    q.marks = any ? marks : null;
    q.text = q.pages.map(cleanPage).filter(Boolean).join("\n\n");
    q.flags = flagsFor(q.text);
    delete q.pages;
  });
  return qs;
}

/* ---------- reading a mark scheme ---------- */

/* Every scheme page reprints the "Question / Scheme / Marks" column
   heading, and that is a far better boundary than the question number:
   the number is often lost to the broken font, while the heading is set
   in the document's own type and always comes through. The words can be
   split across two or three lines by the layout, so the top of the page
   is read as one piece rather than line by line. */
function isSchemeHead(page) {
  const lines = page.split("\n").filter(function (l) { return l.trim(); }).slice(0, 5);
  const top = lines.join(" ");
  /* Edexcel head the column "Question", "Question Number" or just "Qu"
     depending on the year the paper is from, and all three turn up in
     these compilations. Insisting on the full word lost the first three
     pages of the Probability scheme outright. */
  return /\bQu(estion)?\b/i.test(top) && /\bScheme\b/i.test(top) && /\bMarks?\b/i.test(top);
}

/* The question number in the scheme's left column. Deliberately fussy:
   a scheme page is full of algebra beginning with a digit, so a number
   only counts when it is followed by a part letter, a full stop, or
   nothing at all. Getting none is fine -- the block is then placed by
   its position instead. */
const MSNUM = [
  /^ {0,14}(\d{1,2})\s*\.?\s*\([a-e]\)/,
  /^ {0,14}(\d{1,2})\s*\.\s/,
  /^ {0,14}(\d{1,2})\s*$/,
  /* A whole-question scheme has no part letter, so the number sits alone
     in its column with the table gap after it. The gap is what makes this
     safe: "3 - 31x" is algebra, "3      x = 0" is a cell boundary. */
  /^ {0,14}(\d{1,2})\s{5,}\S/
];

/* Exam question numbers stop well short of twenty; anything larger came
   out of the algebra, not the column. */
function sane(n) { return n >= 1 && n <= 20; }

function schemeNum(page) {
  const lines = page.split("\n")
    .map(function (l) { return l.replace(WATERMARK, ""); })
    .filter(function (l) { return l.trim(); });
  for (let i = 0; i < lines.length && i < 14; i++) {
    if (/\bScheme\b/i.test(lines[i]) || /^\s*Number\s*$/i.test(lines[i])) continue;
    for (let k = 0; k < MSNUM.length; k++) {
      const m = MSNUM[k].exec(lines[i]);
      if (m && sane(+m[1])) return m[1];
    }
  }
  return null;
}

function readSchemes(pdf) {
  const pages = pagesOf(pdf);
  const blocks = [];
  pages.forEach(function (page, i) {
    const cur = blocks[blocks.length - 1];
    if (!isSchemeHead(page)) {
      if (cur) { cur.msTo = i + 1; cur.text.push(page); }
      return;
    }
    blocks.push({ num: schemeNum(page), msFrom: i + 1, msTo: i + 1, text: [page] });
  });

  blocks.forEach(function (b) {
    const joined = b.text.join("\n");
    /* The printed total, the one number in a scheme that can be checked
       against the question paper without either consulting the other.
       The last one on the block is the question's; the earlier ones are
       the per-part subtotals. */
    let total = null, m;
    const re = new RegExp(PRINTED.source, "gi");
    while ((m = re.exec(joined))) total = +m[1];
    b.total = total;
    delete b.text;
  });
  return blocks;
}

/* ---------- aligning the two ---------- */

/* Two sequences running in the same order with rubbish in between:
   longest common subsequence is the right tool. Numbers agreeing is
   good, numbers and totals agreeing is better, and a block whose number
   was lost to the font can still be placed on position alone. */
function score(q, b) {
  if (b.num == null || b.num !== q.num) return 0;
  if (q.marks == null || b.total == null) return 2;
  return b.total === q.marks ? 3 : 1;
}

function align(qs, blocks) {
  const n = qs.length, m = blocks.length;
  const dp = [];
  for (let i = 0; i <= n; i++) dp.push(new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      const s = score(qs[i], blocks[j]);
      dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1], s ? s + dp[i + 1][j + 1] : 0);
    }
  }
  const pairs = new Array(n).fill(null);
  const used = new Array(m).fill(false);
  let i = 0, j = 0;
  while (i < n && j < m) {
    const s = score(qs[i], blocks[j]);
    if (s && s + dp[i + 1][j + 1] === dp[i][j]) { pairs[i] = blocks[j]; used[j] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }

  /* Anything the numbers could not place is filled in by position. Two
     questions pinned either side of a single gap leave exactly one place
     for the block that sits between them, and no ordering is guessed:
     the run has to be the same length on both sides or it is left
     alone. These are marked `unverifiable`, because that is what they
     are -- placed by where they sit, not by what they say. */
  let a = -1;
  for (let k = 0; k <= n; k++) {
    if (k < n && !pairs[k]) continue;
    const from = a < 0 ? -1 : blocks.indexOf(pairs[a]);
    const to = k < n ? blocks.indexOf(pairs[k]) : m;
    const gapQ = k - a - 1;
    const free = [];
    for (let z = from + 1; z < to; z++) if (!used[z]) free.push(z);
    if (gapQ > 0 && free.length === gapQ) {
      for (let z = 0; z < gapQ; z++) { pairs[a + 1 + z] = blocks[free[z]]; used[free[z]] = true; }
    }
    a = k;
  }
  return pairs;
}

/* ---------- putting a set together ---------- */

function idOf(key, n) {
  return key + "-" + String(n).padStart(2, "0");
}

const MISMATCH = [], UNPAIRED = [], DROPPED = [];

function buildSet(key) {
  const s = EXAM_SETS[key];
  const qs = readQuestions(setPath(key, "q"));
  let blocks = [];
  try { blocks = readSchemes(setPath(key, "ms")); }
  catch (e) { blocks = []; }
  const pairs = align(qs, blocks);

  const built = qs.map(function (q, i) {
    const b = pairs[i];
    let check = "none";
    if (b) {
      if (q.marks != null && b.total != null) check = b.total === q.marks ? "verified" : "none";
      else if (q.marks != null) check = "bracketed";
      else check = "unverifiable";
    }
    if (b && check === "none") {
      MISMATCH.push(key + " Q" + q.num + " p" + q.pageFrom +
        ": paper says " + q.marks + ", scheme " + b.msFrom + "-" + b.msTo + " says " + b.total);
    }
    if (!b) UNPAIRED.push(key + " Q" + q.num + " p" + q.pageFrom + " (" + q.marks + " marks)");
    const out = {
      id: idOf(key, i + 1),
      set: key,
      topic: s.name,
      chapters: (setChapters[key] || []).slice(),
      num: q.num,
      /* A handful of pages lost their tariff to the shifted font. Where
         the scheme it was matched to prints a total, that total is the
         same number and comes from a document that was not consulted to
         place it, so it is used rather than showing the question as
         worth nothing. */
      marks: q.marks != null ? q.marks : (b && b.total) || 0,
      year: 1,
      pageFrom: q.pageFrom,
      pageTo: q.pageTo,
      msFrom: b && check !== "none" ? b.msFrom : null,
      msTo: b && check !== "none" ? b.msTo : null,
      msCheck: check,
      flags: q.flags.join(","),
      text: q.text
    };
    return out;
  });

  /* A question the practice test cannot weigh or mark is not a question
     it can set. One histogram in Handling Data lost its tariff to the
     layout and its scheme prints no total, so there is nothing to read
     it off; it is dropped rather than offered as worth nothing. */
  return built.filter(function (q) {
    if (q.marks) return true;
    DROPPED.push(q.id + " (Q" + q.num + ", p" + q.pageFrom + "): no tariff anywhere");
    return false;
  });
}

const HEADER = `/* ============================================================
   AS (Year 1) exam questions, from the AS topic PDFs.

   Built by tools/extract-as-maths.js -- do not hand edit, run
   the tool. The reasoning behind the extraction, and what
   \`flags\` and \`msCheck\` mean, is documented there.

   These are the Year 1 half of the question bank. The A level
   topic sets in maths-exam-questions.js span both years, so a
   question from those has no year and is left out when you
   filter for Year 1; these carry year 1 by construction,
   because the AS paper only examines Year 1 content.
   ============================================================ */

`;

/* ---------- run ---------- */

const AS_KEYS = Object.keys(EXAM_SETS).filter(function (k) { return !EXAM_SETS[k].root; });

const all = [];
const report = [];
AS_KEYS.forEach(function (k) {
  let qs;
  try { qs = buildSet(k); }
  catch (e) { report.push([k, "FAILED: " + e.message]); return; }
  all.push.apply(all, qs);
  const byCheck = {};
  qs.forEach(function (q) { byCheck[q.msCheck] = (byCheck[q.msCheck] || 0) + 1; });
  const noMarks = qs.filter(function (q) { return !q.marks; }).length;
  const noChap = (setChapters[k] || []).length === 0;
  report.push([k, qs.length + " q, " + qs.reduce(function (a, q) { return a + q.marks; }, 0) + " marks, " +
    Object.keys(byCheck).map(function (c) { return c + " " + byCheck[c]; }).join(" / ") +
    (noMarks ? ", " + noMarks + " WITHOUT A TARIFF" : "") +
    (noChap ? ", NO CHAPTERS" : "")]);
});

report.forEach(function (r) { console.log(r[0].padEnd(14), r[1]); });
console.log("");
console.log("total", all.length, "questions,", all.reduce(function (a, q) { return a + q.marks; }, 0), "marks");

if (process.argv.indexOf("--why") >= 0) {
  console.log("");
  console.log("-- paired but the totals disagree (" + MISMATCH.length + ")");
  MISMATCH.forEach(function (m) { console.log("   " + m); });
  console.log("-- dropped (" + DROPPED.length + ")");
  DROPPED.forEach(function (m) { console.log("   " + m); });
  console.log("-- no scheme found (" + UNPAIRED.length + ")");
  UNPAIRED.forEach(function (m) { console.log("   " + m); });
}

if (process.argv.indexOf("--write") >= 0) {
  const out = path.join(ROOT, "js", "as-maths-exam-questions.js");
  const body = all.map(function (q) { return "  " + JSON.stringify(q); }).join(",\n");
  fs.writeFileSync(out, HEADER + "const AS_MATHS_EXAM_QUESTIONS = [\n" + body + "\n];\n", "utf8");
  console.log("wrote", out);
}
