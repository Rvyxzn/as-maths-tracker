#!/usr/bin/env node
/* ============================================================
   Extract the Edexcel A level Geography (9GE0) question bank.

   Built the same way as the Economics one: every question comes
   straight off a real past paper, one record per part, with its
   own mark scheme attached and the page it is printed on
   recorded, because the page is the question. Text extraction
   loses the figures, the tables and the layout, so the app
   renders the printed page and the text here is what search
   and the practice test read.

   WHAT A 9GE0 PAPER LOOKS LIKE

     Paper 1  Physical   A Tectonics
                         B EITHER Glaciated OR Coastal
                         C Water cycle and Carbon cycle, mixed
     Paper 2  Human      A Globalisation and Superpowers, mixed
                         B EITHER Regenerating OR Diverse Places
                         C EITHER Health OR Migration
     Paper 3  Synoptic   one investigation across the specification

   Two sections mix two topics INSIDE ONE QUESTION -- Paper 1
   Question 4 asks about the energy mix in (b) and about water
   management in (e) -- so the topic is decided per part, from
   what that part is about, not per section.

   THE RESOURCE BOOKLET is Geography's case study: questions say
   "Study Figure 4a in the Resource Booklet" and print nothing
   themselves. Up to 2020 it is a file of its own. From 2021 it is
   bound into the back of the question paper, after TOTAL FOR
   PAPER, so `rb` points at the question paper and `rbFrom` /
   `rbTo` give the booklet's pages. Every series has one.
   `rbMissing` is only set if a part asks for a booklet that
   genuinely cannot be found.

   Run: node tools/extract-geo-questions.js [--write]
   ============================================================ */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = "Exam questions PDFs/A-Level Geography";
const PAPERS = {
  1: "Paper 1 (Physical)",
  2: "Paper 2 (Human)",
  3: "Paper 3 (Synoptic)"
};
const SERIES = ["Specimen", "June 2018", "June 2019", "June 2020",
                "June 2021", "June 2022", "June 2023", "June 2024"];

/* ---------- pages ----------
   One page at a time, for the reasons written up in extract-as-maths.js:
   -layout emits form feeds between text flows as well as pages, so a
   whole-document split gives page numbers that point nowhere. */
/* Page text is cached, keyed by the PDF's path, size and modified time, so
   a change to the PDF invalidates it. Reading 72 papers one page at a time
   took over ten minutes a run, which is not a loop anybody can iterate in.
   The cache lives in .tmpwork, which git ignores. */
const crypto = require("crypto");
const CACHE = path.join(ROOT, ".tmpwork", "geo-page-cache");

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
    catch (e) { /* a cache that cannot be written just means a slow run */ }
  }
  return text;
}

function pagesOf(pdf) {
  const out = [];
  let blanks = 0;
  for (let i = 1; i <= 80 && blanks < 3; i++) {
    const p = page(pdf, i);
    if (p.trim()) blanks = 0; else blanks++;
    out.push(p);
  }
  while (out.length && !out[out.length - 1].trim()) out.pop();
  return out;
}

/* ---------- reading a question paper ---------- */

const SECTION = /^\s*SECTION\s+([A-D])\b/;
const OPTION = {
  "Glaciated Landscapes and Change": "glaciated",
  "Coastal Landscapes and Change": "coastal",
  "Regenerating Places": "regenerating",
  "Diverse Places": "diverse",
  "Health, Human Rights and Intervention": "health",
  "Migration, Identity and Sovereignty": "migration"
};
/* A question number is followed by WORDS. Figure tables printed in the paper
   have rows that start with a number too -- "1   50   9   1.9   11" -- and
   reading those as questions 1, 2, 3 is what split one paper into five
   records. Requiring a letter after the number (or a part marker) is what
   tells a question from a row of data. */
/* Up to twelve spaces of indent, not four. On the 2023 and 2024 papers the
   vertical "DO NOT WRITE IN THIS AREA" rubric sits to the LEFT of the
   question number on the same line; stripping it leaves the number six
   spaces in, and with a four-space limit Question 3(c) ran on for 34 pages
   and swallowed Questions 4, 5 and 6 -- 131 marks as one part. The letter
   after the number and the must-be-next-in-sequence check are what still
   keep table rows and stray numbers out. */
/* An "Evaluate this view" question usually opens by quoting the view --
   "6 `If the Haitian population is to have a prosperous future..." -- so an
   opening quote mark may come before the first letter. Without it that
   question went unread and Question 5 absorbed it: 42 marks, as one part. */
const QSTART = /^\s*(\d{1,2})\s+(?:\(([a-h])\)\s*)?([`'"\u2018\u201C]?[A-Za-z].*)$/;
/* Parts run (a) to (h). (i), (v) and (x) are roman sub-parts and roll up into
   the part above; allowing any letter made "(i) Calculate the mean" open a
   part "i". And the marker can sit right at the margin -- "(a) (i) Complete
   Figure 1" does -- so no indent is required. */
const PART = /^\s{0,12}\(([a-h])\)\s+(\S.*)$/;
const TARIFF = /\((\d{1,2})\)\s*$/;
const TOTAL = /Total for Question\s+(\d{1,2})\s*=\s*(\d{1,3})\s*marks/i;
const CHROME = /^\s*(PMT|Turn over|\*P\d+[A-Z0-9]*\*.*|\d{1,2}\s+\*P\d+.*|TOTAL FOR (SECTION|PAPER).*|Indicate which question.*|mind, put a line.*|If you answer Question.*|Answer (ALL|ONE) question.*|Write your answers in the spaces.*|You must use the Resource Booklet.*|You are advised to spend.*)\s*$/i;
const RULE = /^[.\s_]+$/;

/* Some papers end the option heading with a full stop -- "Health, Human
   Rights and Intervention." -- and an exact match missed it, leaving those
   questions with no option and so on the wrong topic. */
function optionOn(line) {
  const t = line.trim().replace(/\.$/, "");
  for (const k in OPTION) if (t === k) return OPTION[k];
  return null;
}

function tariffOn(line) {
  const m = TARIFF.exec(line);
  if (!m) return null;
  /* hard against the right margin; a "(4)" in the body is not a tariff */
  if (line.indexOf(m[0]) < 40) return null;
  return +m[1];
}

function readPaper(pdf, paper, series) {
  const pages = pagesOf(pdf);
  const parts = [];
  const totals = {};
  let section = paper === 3 ? "A" : null;
  let option = null;
  let cur = null;       /* the part being read */
  let qnum = null;

  /* WHERE THE EXAM STOPS AND THE BOOKLET BEGINS.

     From 2021 the resource booklet is not a separate file: it is bound
     into the back of the question paper, after "TOTAL FOR PAPER" and before
     the acknowledgements. Reading on past that point did two kinds of
     damage. The last question claimed the whole booklet as its answer
     space -- Paper 3's final question ran from page 14 to page 28 on a
     paper whose questions end at 18 -- and the booklet's own "SECTION B"
     and numbered headings were read as questions worth nothing. So
     questions stop at TOTAL FOR PAPER, and what follows is recorded as
     the booklet. */
  let paperEnd = null;
  let ackPage = null;

  function open(q, letter, first, pageNo) {
    cur = { paper: paper, series: series, section: section, option: option,
            q: q, part: letter || "", marks: 0, lines: [first],
            pageFrom: pageNo, pageTo: pageNo };
    parts.push(cur);
  }

  pages.forEach(function (txt, i) {
    const pageNo = i + 1;
    if (/Acknowledg/i.test(txt)) ackPage = pageNo;
    if (paperEnd !== null) return;       /* the booklet: not questions */
    txt.split("\n").forEach(function (raw) {
      const line = raw.replace(/\s+$/, "");
      if (!line.trim()) return;
      if (paperEnd !== null) return;
      if (/TOTAL FOR PAPER/i.test(line)) { paperEnd = pageNo; return; }

      const sec = SECTION.exec(line);
      if (sec) { section = sec[1]; option = null; return; }
      const opt = optionOn(line);
      if (opt) { option = opt; return; }

      const tot = TOTAL.exec(line);
      if (tot) { totals[tot[1]] = +tot[2]; return; }
      if (CHROME.test(line) || RULE.test(line)) return;

      const qs = QSTART.exec(line);
      /* Any later question within three, not strictly the next one. Accepting
         only qnum + 1 meant a single missed start was fatal: Question 4 went
         unread on the 2023 paper, so 5 and 6 were rejected as "not 4" and
         the rest of the paper collapsed into one part. */
      if (qs && (!qnum || (+qs[1] > +qnum && +qs[1] <= +qnum + 3))) {
        qnum = qs[1];
        open(qs[1], qs[2] || "", qs[3], pageNo);
        const t = tariffOn(line);
        if (t != null) cur.marks += t;
        return;
      }
      const pt = PART.exec(line);
      if (pt && qnum && cur && pt[1] > (cur.part || "")) {
        open(qnum, pt[1], pt[2], pageNo);
        const t = tariffOn(line);
        if (t != null) cur.marks += t;
        return;
      }

      if (!cur) return;
      const t = tariffOn(line);
      if (t != null) {
        cur.marks += t;
        cur.pageTo = pageNo;
        const body = line.replace(TARIFF, "").trim();
        if (body) cur.lines.push(body);
        return;
      }
      cur.pageTo = pageNo;
      cur.lines.push(line.trim());
    });
  });

  /* WHERE A TARIFF COULD NOT BE READ, THE PAPER'S OWN TOTAL IS USED.

     Paper 3 prints its tariffs hard against the right edge, far enough out
     that -layout clips them to "(4" with no closing bracket, and four of
     the six Specimen questions came out worth nothing. But every question
     also prints "(Total for Question 4 = 8 marks)", which is Pearson's
     figure rather than a guess. So:

       one record, no marks      the total is its mark
       several parts, one blank  the blank one gets whatever is left

     Anything less certain than that is left alone and reported. */
  const byQ = {};
  parts.forEach(function (p) { (byQ[p.q] = byQ[p.q] || []).push(p); });
  Object.keys(byQ).forEach(function (q) {
    const list = byQ[q], printed = totals[q];
    if (!printed) return;
    const read = list.reduce(function (a, p) { return a + p.marks; }, 0);
    if (read === printed) return;
    const blank = list.filter(function (p) { return !p.marks; });
    if (list.length === 1 && !list[0].marks) { list[0].marks = printed; list[0].fromTotal = true; }
    else if (blank.length === 1 && printed > read) { blank[0].marks = printed - read; blank[0].fromTotal = true; }
  });

  /* The bound-in booklet, when there is one: everything after the page the
     exam ends on, up to the acknowledgements. Only counted as a booklet if
     there is at least one page of it, so a paper whose TOTAL FOR PAPER sits
     on its last printed page does not claim an empty one. */
  let booklet = null;
  if (paperEnd !== null) {
    let to = (ackPage && ackPage > paperEnd) ? ackPage - 1 : pages.length;
    /* Trim the padding. Between the end of the exam and the booklet sit
       pages printed "BLANK PAGE" -- two of them on Paper 3 June 2023 -- so a
       booklet opened on its raw range showed you empty pages before any
       figure. A page counts as blank when, once its furniture is removed,
       there are no real words left on it. */
    const isBlank = function (n) {
      const t = String(pages[n - 1] || "")
        .replace(/BLANK PAGE/gi, "")
        .replace(/\*P\d+[A-Z0-9]*\*/g, "")
        .replace(/\bPMT\b|Turn over/gi, "")
        .replace(/[.\d\s]/g, " ");
      return (t.match(/[A-Za-z]{3,}/g) || []).length < 6;
    };
    let from = paperEnd + 1;
    while (from <= to && isBlank(from)) from++;
    while (to >= from && isBlank(to)) to--;
    if (to >= from) booklet = { from: from, to: to };
  }
  return { parts: parts, totals: totals, pages: pages.length, booklet: booklet };
}

/* ---------- topic ----------
   Decided per part. Keyword lists are kept short and specific to the
   spec's own vocabulary; a part matching neither is left on the section's
   default and flagged as not confident rather than guessed at. */
const KW = {
  water: /\b(water|drought|flood|hydrolog|precipitation|aquifer|river|catchment|evapotranspiration|runoff|groundwater|irrigation|reservoir|water insecurity|dam)/i,
  carbon: /\b(carbon|energy|fossil fuel|emission|greenhouse|climate change|sequestration|peat|renewable|oil|gas|coal|decarboni|global warming)/i,
  globalisation: /\b(globalis|global shift|TNC|transnational|trade|FDI|foreign direct|outsourc|offshor|deindustrial|global network|connectedness|KOF)/i,
  superpower: /\b(superpower|geopolit|hegemon|emerging power|IGO|BRIC|sphere of influence|military|soft power|hard power|United Nations|NATO|World Bank|IMF)/i
};

function topicFor(p) {
  const text = p.lines.join(" ");
  if (p.paper === 3) return { topic: "geo-syn", confident: true };
  if (p.paper === 1) {
    if (p.section === "A") return { topic: "geo-t1", confident: true };
    if (p.section === "B") return p.option === "glaciated"
      ? { topic: "geo-t2a", confident: true } : { topic: "geo-t2b", confident: true };
    if (p.section === "C") {
      const w = KW.water.test(text), c = KW.carbon.test(text);
      if (w && !c) return { topic: "geo-t5", confident: true };
      if (c && !w) return { topic: "geo-t6", confident: true };
      return { topic: w ? "geo-t5" : "geo-t6", confident: false };
    }
  }
  if (p.paper === 2) {
    if (p.section === "A") {
      const g = KW.globalisation.test(text), s = KW.superpower.test(text);
      if (g && !s) return { topic: "geo-t3", confident: true };
      if (s && !g) return { topic: "geo-t7", confident: true };
      return { topic: s ? "geo-t7" : "geo-t3", confident: false };
    }
    if (p.section === "B") return p.option === "diverse"
      ? { topic: "geo-t4b", confident: true } : { topic: "geo-t4a", confident: true };
    if (p.section === "C") return p.option === "migration"
      ? { topic: "geo-t8b", confident: true } : { topic: "geo-t8a", confident: true };
  }
  return { topic: null, confident: false };
}

/* The options this student sits, from the header of js/geo-data.js. Parts
   on the others are kept in the data -- a friend might sit Glaciated --
   and flagged so the app can leave them out by default. */
const IN_SPEC = { "geo-t1": 1, "geo-t2b": 1, "geo-t5": 1, "geo-t6": 1, "geo-t3": 1,
                  "geo-t4a": 1, "geo-t7": 1, "geo-t8a": 1, "geo-t8b": 1, "geo-syn": 1 };

/* ---------- reading a mark scheme ----------
   Blocks keyed by the question number in the scheme's left column:
   "2(a)", "4(b)(i)", or a bare "1" for a question with no parts. */
const MSKEY = /^\s{0,6}(\d{1,2})\s*(?:\(([a-z])\))?(?:\s*\([ivx]+\))?\s*$/;
const MSKEY_INLINE = /^\s{0,6}(\d{1,2})\s*\(([a-z])\)(?:\s*\([ivx]+\))?\s{2,}\S/;
/* Paper 3 writes a whole question's number at the start of its assessment
   line -- "3        AO1 (4 marks)/AO3 (4 marks)" -- which is neither on its
   own nor followed by a part letter, so neither pattern above saw it and
   most Paper 3 questions came out with no scheme. */
const MSKEY_AO = /^\s{0,6}(\d{1,2})\s*(?:\(([a-z])\))?\s{2,}AO\d/;
/* ...and sometimes merges the number into the column heading's second
   line: "number 2 (a) The table below shows data". */
const MSKEY_HEAD = /^\s*number\s+(\d{1,2})\s*(?:\(([a-z])\))?\s/;
/* Pearson's standard preamble, repeated above every levels-marked scheme.

   Written as plain sentences and turned into patterns that accept ANY
   whitespace between words. The scheme wraps these sentences at different
   words on different pages -- "general marking\nguidance", "are not\n
   required" -- and patterns with literal spaces in them matched none of
   the 107 schemes they were written for. */
const BOILERPLATE = [
  "Marking instructions",
  "Markers must apply the descriptors in line with the general marking guidance and the qualities outlined in the levels-based mark scheme below.",
  "Indicative content guidance",
  "The indicative content below is not prescriptive and candidates are not required to include all of it.",
  /* later series add a comma, and drop "the" from the bullet sentence */
  "The indicative content below is not prescriptive, and candidates are not required to include all of it.",
  "Bullet points covering indicative content do not translate directly into marks.",
  "Other relevant material not suggested below must also be credited.",
  "Please remember that the descriptors provide guidance as to the appropriate level.",
  "Bullet points covering the indicative content do not translate directly into marks.",
  "Relevant points may include:"
].map(function (sentence) {
  const body = sentence.split(/\s+/).map(function (w) {
    return w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("\\s+");
  return new RegExp(body + "\\s*", "gi");
});

/* A new block's heading. The question is restated BEFORE its number
   appears, so anything read after this line and before the number belongs
   to the question that is about to be named, not the one before it. */
const MSHEAD = /^\s*Question\b/;

function readScheme(pdf) {
  const pages = pagesOf(pdf);
  const blocks = {};
  let key = null;
  let pending = null;
  pages.forEach(function (txt) {
    txt.split("\n").forEach(function (raw) {
      const line = raw.replace(/\s+$/, "");
      if (!line.trim() || /^\s*PMT\s*$/.test(line)) return;

      const m = MSKEY.exec(line) || MSKEY_INLINE.exec(line) || MSKEY_AO.exec(line) || MSKEY_HEAD.exec(line);
      if (m && +m[1] <= 20) {
        key = m[1] + (m[2] || "");
        if (!blocks[key]) blocks[key] = [];
        if (pending) { blocks[key].push.apply(blocks[key], pending); pending = null; }
        const rest = line.replace(/^\s*(number\s+)?\d{1,2}\s*(\([a-z]\))?(\s*\([ivx]+\))?/, "").trim();
        if (rest) blocks[key].push(rest);
        return;
      }

      if (MSHEAD.test(line)) {
        pending = [line.replace(/^\s*Question\s*/, "").trim()].filter(Boolean);
        return;
      }
      if (pending) { pending.push(line.trim()); return; }
      if (key) blocks[key].push(line.trim());
    });
    /* A continuation page repeats the "Question number" heading without
       naming a new question. Whatever was held back waiting for a number
       that never came is the current question carrying on, so it goes back
       to that one -- otherwise Papers 1 and 2, which matched almost every
       scheme, would start handing one question's levels table to the next. */
    if (pending && key) { blocks[key].push.apply(blocks[key], pending); }
    pending = null;
  });
  Object.keys(blocks).forEach(function (k) {
    let t = blocks[k].join("\n")
      .replace(/�/g, "•");        /* the bullet glyph comes through as a replacement char */

    /* PEARSON'S PREAMBLE, not this question's scheme. Every levels-marked
       answer opens with the same four sentences about applying descriptors
       and indicative content not being prescriptive, so the first thing you
       read under any question was identical boilerplate and the actual
       points started a screen down. */
    BOILERPLATE.forEach(function (re) { t = t.replace(re, ""); });

    /* The scheme's column headings, "Question / number" and "Indicative
       content", repeat at the top of every page and were leaking into the
       text as lines of their own. */
    t = t.split("\n").filter(function (l) {
      return !/^\s*(Question|number|Question number|Indicative content|Answer|Mark)\s*$/i.test(l);
    }).join("\n");

    /* REFLOW. The PDF hard-wraps every sentence at the column edge, so a
       scheme read as "awarded marks as" on one line and "follows:" on the
       next, each shown as its own paragraph. A line is joined to the one
       before it unless it starts something new: a bullet, an AO or level
       heading, or a line that follows a finished sentence. */
    const STARTS_NEW = /^\s*(•|-\s|AO\d|Level\s*\d|\(\d+\)|\d+\s*marks?|\(?[a-h]\)|\(?[ivx]+\))/i;
    const lines = t.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
    const merged = [];
    /* The bullet glyph is drawn vertically centred on a two-line point, so
       it lands on the point's SECOND line: "• and environmental costs."
       finishes the point above rather than starting one. A bullet followed
       by a lower-case word is that continuation, and loses the bullet. */
    const BULLET_CONT = /^•\s*[a-z]/;
    lines.forEach(function (l) {
      const prev = merged.length ? merged[merged.length - 1] : null;
      if (prev && BULLET_CONT.test(l)) {
        merged[merged.length - 1] = prev + " " + l.replace(/^•\s*/, "");
        return;
      }
      const finished = prev && /[.:;!?)]$/.test(prev);
      if (prev && !finished && !STARTS_NEW.test(l)) merged[merged.length - 1] = prev + " " + l;
      else merged.push(l);
    });
    t = merged.join("\n");

    t = t.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();

    /* What is left after the furniture is gone. A block that was nothing
       but a page footer -- "9GE03 0618 Mark scheme" -- is no scheme at all,
       and is dropped rather than shown as if it were one. */
    /* Digits are kept on purpose: a calculation's whole scheme is
       "19627/55504 x 100 = 35.4%", and treating numbers as furniture would
       have thrown away every correct calculation scheme in the bank. */
    const substance = t
      .replace(/\b9GE0\s*\d+\s+\d{3,4}\b/gi, "")
      .replace(/\b(Mark scheme|Question|number|Answer|Indicative content|Marking instructions)\b/gi, "")
      .replace(/AO\d\s*\(\s*\d+(\s*\+\s*\d+)?\s*marks?\s*\)/gi, "")
      .replace(/[\s•]/g, "");
    if (substance.length < 12) { delete blocks[k]; return; }
    blocks[k] = t;
  });
  return blocks;
}

/* ---------- putting it together ---------- */

function idFor(paper, series, q, part) {
  return "g" + paper + "-" + series.toLowerCase().replace(/\s+/g, "") + "-q" + q + (part || "");
}

function cleanText(lines) {
  return lines.join("\n")
    .replace(/�/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const out = [];
const report = [];

Object.keys(PAPERS).forEach(function (pk) {
  const paper = +pk;
  SERIES.forEach(function (series) {
    const dir = path.join(ROOT, BASE, PAPERS[paper]);
    const qp = path.join(dir, "Questions", series + " QP.pdf");
    const ms = path.join(dir, "Mark Scheme", series + " MS.pdf");
    const rb = path.join(dir, "Resource Booklet", series + " RB.pdf");
    if (!fs.existsSync(qp)) return;

    const read = readPaper(qp, paper, series);

    /* --only "P2 June 2023" prints how that one paper split, part by part,
       which is how a paper that comes out as seven parts gets diagnosed. */
    const only = process.argv.indexOf("--only");
    if (only >= 0) {
      if (process.argv[only + 1] !== "P" + paper + " " + series) return;
      read.parts.forEach(function (p) {
        console.log(("Q" + p.q + p.part).padEnd(6), ("p" + p.pageFrom + "-" + p.pageTo).padEnd(8),
          String(p.marks).padStart(3) + "m", "sec " + (p.section || "-"), "opt " + (p.option || "-"),
          "|", p.lines.join(" ").replace(/\s+/g, " ").slice(0, 70));
      });
      console.log("printed totals:", JSON.stringify(read.totals));
      return;
    }
    const scheme = fs.existsSync(ms) ? readScheme(ms) : {};
    /* A separate booklet file where one exists (Specimen to 2020), otherwise
       the booklet bound into the back of the question paper (2021 on). */
    const hasRbFile = fs.existsSync(rb);
    const bound = !hasRbFile && read.booklet;
    const hasRb = hasRbFile || !!bound;

    let marks = 0, withMs = 0, unconfident = 0;
    read.parts.forEach(function (p) {
      if (!p.marks) return;                  /* a heading that caught a number, not a question */
      const t = topicFor(p);
      const text = cleanText(p.lines);
      const needsRb = /resource booklet/i.test(text);
      const msText = scheme[p.q + p.part] || scheme[p.q] || "";
      if (msText) withMs++;
      if (!t.confident) unconfident++;
      marks += p.marks;
      out.push({
        id: idFor(paper, series, p.q, p.part),
        subject: "geography",
        paper: paper, series: series, section: p.section, option: p.option,
        q: p.q, part: p.part, marks: p.marks,
        topic: t.topic, topicConfident: t.confident, inSpec: !!IN_SPEC[t.topic],
        text: text,
        ms: msText,
        pageFrom: p.pageFrom, pageTo: p.pageTo,
        pdf: path.posix.join(BASE, PAPERS[paper], "Questions", series + " QP.pdf"),
        rb: hasRbFile ? path.posix.join(BASE, PAPERS[paper], "Resource Booklet", series + " RB.pdf")
          : bound ? path.posix.join(BASE, PAPERS[paper], "Questions", series + " QP.pdf")
          : null,
        rbFrom: hasRbFile ? null : bound ? bound.from : null,
        rbTo: hasRbFile ? null : bound ? bound.to : null,
        rbMissing: needsRb && !hasRb
      });
    });

    /* The printed totals are the check on the tariffs read. */
    const printed = Object.keys(read.totals).reduce(function (a, k) { return a + read.totals[k]; }, 0);
    report.push({
      bound: bound ? ("bound p" + bound.from + "-" + bound.to) : "",
      label: "P" + paper + " " + series,
      parts: read.parts.filter(function (p) { return p.marks; }).length,
      marks: marks, printed: printed, withMs: withMs, unconfident: unconfident,
      rb: hasRb
    });
  });
});

report.forEach(function (r) {
  const ok = r.printed ? (r.marks === r.printed ? "totals match" : "READ " + r.marks + " vs PRINTED " + r.printed) : "no totals printed";
  console.log(r.label.padEnd(18), String(r.parts).padStart(3) + " parts",
    String(r.marks).padStart(4) + " marks", "·", ok.padEnd(26),
    "· scheme " + r.withMs + "/" + r.parts, r.unconfident ? "· " + r.unconfident + " topic unsure" : "",
    r.rb ? (r.bound ? "· booklet " + r.bound : "") : "· no RB");
});
const total = out.length, sat = out.filter(function (q) { return q.inSpec; }).length;
console.log("");
console.log(total + " parts, " + sat + " on the options you sit, " +
  out.filter(function (q) { return q.ms; }).length + " with a mark scheme, " +
  out.filter(function (q) { return q.rbMissing; }).length + " needing a booklet that is not available");

if (process.argv.indexOf("--write") >= 0) {
  const file = path.join(ROOT, "js", "geo-questions.js");
  const header = "/* ============================================================\n" +
    "   Edexcel A level Geography (9GE0) question bank.\n\n" +
    "   " + total + " parts off real past papers, " + sat + " of them on the options\n" +
    "   in js/geo-data.js. Built by tools/extract-geo-questions.js --\n" +
    "   do not hand edit, run the tool; what every field means is\n" +
    "   written up there.\n" +
    "   ============================================================ */\n\n";
  fs.writeFileSync(file, header + "const GEO_QUESTIONS = " + JSON.stringify(out, null, 1) + ";\n", "utf8");
  console.log("wrote " + file);
}
