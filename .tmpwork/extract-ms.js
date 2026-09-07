/* Re-extract every Economics mark scheme from Pearson's own PDFs.

   The bank's mark schemes came out of a text layer that had lost the letter
   "s" on most pages, stopped mid-sentence, and welded headings onto the end
   of bullets. pdftotext's layout mode keeps the column positions, and the
   column a line starts in is what says whether it is a bullet, a wrap of the
   bullet above it, or a heading introducing the bullets below. */

const { execFileSync } = require("child_process");
const path = require("path");
const ROOT = path.join(__dirname, "..");

/* Every glyph these papers have used for a bullet: a Symbol-font dot, a real
   bullet, a black circle, an arrowhead, a Wingdings tick, and the infinity
   sign the specimen papers ended up with. Only counted at the start of a
   line, so an infinity inside a sentence is left alone. */
const BULLET = /^[•●∞➢]\s*/;
function hasBullet(t) { return BULLET.test(t.trim()); }

const GRID_ROW = /^[-£\d][\d.,£\s]*$/;
const AO_ONLY = /^(?:(?:Knowledge(?:\/understanding)?|Application|Analysis|Evaluation|KAA)\s*\d+\s*[,;]?\s*)+(?:\(\d+\))?\s*$/i;

/* A question marker owns the left margin. Questions run 1 to 8, which keeps
   the "0" row of the level grid from opening a phantom question. */
const MARKER = /^([1-8])\s?(?:\(\s*([a-e])\s*\))?(?:\s+(.*))?$/;

/* the mark total printed at the end of a header row, e.g. "A   (1)" */
const TRAILING_TOTAL = /\s*\(\d+\)\s*$/;

/* Where the generic marking ladder starts. It is identical on every extended
   response, describes the grade rather than this question's answer, and
   pdftotext interleaves its three columns into nonsense, so it is cut.

   It has to be recognised by its own header or by a descriptor row, not by
   the word "Level": several papers print the level column alongside the
   indicative content, so "Level 2" is often just a stray cell sitting in
   front of a line of the answer. */
const LEVEL_HEAD = /^(Level\s+)?Mark\s+Descriptor\b/i;
const LEVEL_ROW = /^(Level\s*\d+\s+)?\d+\s*[–—-]?\s*\d*\s+(Displays|Demonstrates|Applies|A completely|No evaluative|Identification|Evaluative|Use of generic|Descriptive|A narrow|Evidence of|An attempt)/i;
const LEVEL_SECTION = /^(Knowledge,\s*application\s+and\s+analysis|Evaluation)\s*$/i;
function isLevelStart(t) { return LEVEL_HEAD.test(t) || LEVEL_ROW.test(t) || LEVEL_SECTION.test(t); }

/* A stray cell from that level column, glued to the front of a real line. */
const LEVEL_CELL = /^Level(\s*\d+)?\s+(?=\S)/;

/* Same for the table's own header column, which on some pages is printed on
   the same row as the answer rather than above it. */
const QUESTION_CELL = /^Question(\s+Number)?\s+(?=\S)/;

/* Anything a font failure turns text into, weighed against real letters. */
const PUNCT = /[^\w\s£–—‘’“”]/g;

function pdfText(file) {
  return execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", path.join(ROOT, file), "-"],
                      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

/* A page footer whose font carried no usable character map comes through as
   punctuation soup rather than words. It is a footer either way, and left in
   it lands in the middle of a mark scheme. */
function isMojibake(t) {
  if (t.length < 30) return false;
  const letters = (t.match(/[A-Za-z]/g) || []).length;
  const punct = (t.match(PUNCT) || []).length;
  return punct > letters;
}

/* Furniture: the repeated table header, the "6(b) continued" that starts a
   spill-over page, PMT's watermark, and Pearson's own imprint lines. */
function isFurniture(l) {
  const t = l.trim();
  return !t ||
    /^Question\s+(Answer|Indicative [Cc]ontent)/i.test(t) ||
    /^(Mark|Answer|Question|Indicative content|continued|PMT)$/i.test(t) ||
    /^Mark\s+Number$/i.test(t) ||
    /^Pearson Education Limited/i.test(t) ||
    /^Publications? Code/i.test(t) ||
    isMojibake(t);
}

function questionsIn(text) {
  const out = [];
  let cur = null, skipping = false, pending = null;

  text.split("\f").forEach(function (page) {
    page.split("\n").forEach(function (raw) {
      /* The "Mark" column header repeats at the right-hand end of whatever
         row starts a page, so it arrives welded to the end of a real line. */
      const line = raw.replace(/\s{2,}Mark\s*$/, "").replace(/\s+$/, "");
      const t = line.trim();

      /* The header row often carries the thing the block below it needs: the
         mark allocation, or on a multiple choice the answer itself. Dropping
         the whole row loses the only statement the mark scheme made, so the
         row goes and its content is held for whichever block comes next,
         which may be a question that has not started yet. */
      const numRow = t.match(/^Number\s*(.*)$/i);
      if (numRow) {
        const rest = (numRow[1] || "").replace(TRAILING_TOTAL, "").trim();
        if (rest && (AO_ONLY.test(rest) || /^[A-E]$/.test(rest) ||
                     /^The only correct answer is/i.test(rest))) { skipping = false; pending = rest; }
        return;
      }
      if (isFurniture(line)) { if (isLevelStart(t)) skipping = true; return; }

      /* Most papers put the question number hard against the left margin; a
         couple indent the whole table a few characters. The answer column
         sits further in than that, so a small indent is still the margin. */
      const indent = line.search(/\S/);
      const start = indent >= 0 && indent <= 6 ? t.match(MARKER) : null;
      if (start) {
        cur = { q: start[1], part: start[2] || "", lines: [] };
        out.push(cur);
        skipping = false;
        if (pending) { cur.lines.push({ col: 10, text: pending }); pending = null; }
        const rest = (start[3] || "").trim();
        if (rest && !isFurniture(rest)) cur.lines.push({ col: line.indexOf(rest), text: rest });
        return;
      }
      if (!cur) { pending = null; return; }
      if (pending) { cur.lines.push({ col: 10, text: pending }); pending = null; }

      if (isLevelStart(t)) { skipping = true; return; }
      if (skipping) {
        if (AO_ONLY.test(t)) skipping = false;
        else return;
      }

      /* drop the level column's stray cell, keep the line it was sitting on */
      const cleaned = t.replace(LEVEL_CELL, "").replace(QUESTION_CELL, "");
      if (!cleaned) return;
      cur.lines.push({ col: indent + (t.length - cleaned.length), text: cleaned });
    });
  });
  return out;
}

/* Turn the positioned lines back into logical ones. A bullet opens an item, a
   deeper-indented line continues it, and a line ending in a colon is a
   heading introducing the bullets below rather than a wrap of the one above. */
function toText(lines) {
  const cols = lines.filter(function (l) { return hasBullet(l.text); })
                    .map(function (l) { return l.col; });
  const bulletCol = cols.length ? Math.min.apply(null, cols) : -1;

  const out = [];
  let open = null;   // the bullet still being wrapped
  let para = null;   // a plain paragraph still being wrapped

  function flushBullet() {
    if (open === null) return;
    out.push("• " + open.replace(/\s+/g, " ").trim());
    open = null;
  }
  /* A multiple choice prints the answer and then a line per wrong option.
     They share a table cell, so they arrive as one paragraph; read as one
     sentence they are gibberish, and each is really its own statement. */
  const MCQ_SPLIT = /(?=(?:The only correct answer is|[A-E] is not correct because))/g;

  function flushPara() {
    if (para === null) return;
    const one = para.replace(/\s+/g, " ").trim();
    one.split(MCQ_SPLIT).map(function (s) { return s.trim(); })
       .filter(Boolean).forEach(function (s) { out.push(s); });
    para = null;
  }
  function flush() { flushBullet(); flushPara(); }

  lines.forEach(function (l) {
    const bulleted = hasBullet(l.text);
    const text = l.text.trim().replace(BULLET, "").replace(/\s+/g, " ").trim();
    if (!text) return;

    if (bulleted) { flush(); open = text; return; }

    const heading = /:$/.test(text);
    const ao = AO_ONLY.test(text);
    const deeper = bulletCol >= 0 && l.col > bulletCol;

    if (open !== null && deeper && !heading && !ao) { open += " " + text; return; }

    flushBullet();
    if (heading || ao || GRID_ROW.test(text) || /^\([a-e]\)$/.test(text)) {
      flushPara(); out.push(text); return;
    }

    /* Prose outside the bullets wraps too, and a mark scheme's "NB ..." note
       read as three orphan lines is how a sentence stops making sense. */
    if (para !== null) { para += " " + text; return; }
    para = text;
  });
  flush();
  return out;
}

/* Section A groups its parts under one 5-mark question; Section B keeps them
   apart. Either way a part can be split over two blocks (the KAA half and the
   evaluation half), so blocks are gathered, not picked. */
function build(file) {
  const byKey = {};
  questionsIn(pdfText(file)).forEach(function (b) {
    const key = b.q + (b.part || "");
    (byKey[key] = byKey[key] || []).push(b);
  });
  const out = {};
  Object.keys(byKey).forEach(function (k) {
    out[k] = byKey[k].map(function (b) { return toText(b.lines).join("\n"); })
                     .filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  });
  return out;
}

module.exports = { build, pdfText, questionsIn, toText };

if (require.main === module) {
  const res = build(process.argv[2]);
  const only = process.argv[3];
  Object.keys(res).sort().forEach(function (k) {
    if (only && k !== only) return;
    console.log("===== " + k + " =====");
    console.log(res[k]);
  });
}
