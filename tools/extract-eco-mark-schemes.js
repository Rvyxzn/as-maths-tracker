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

/* One cell of a reprinted answer table: a word or two, no sentence
   punctuation, and not the start of anything. */
const CELL_WORD = /^(£|\(?000\)?|\(m\)|per|month|year|week|price|quantity|quantities|demanded|supplied|new|total|cost|costs|revenue|output|units?|s)$/i;
function isCell(t) {
  if (t.length > 22 || /[.:;?!]$/.test(t)) return false;
  const words = t.split(/\s+/).filter(Boolean);
  if (!words.length || words.length > 2) return false;
  return words.every(function (w) { return CELL_WORD.test(w); });
}
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
  /* Digits count as content: a row of the answer table is "£35 (000s) (000s)",
     which is mostly brackets and was being thrown away as a broken footer.
     A real footer carries dozens of punctuation marks, not four. */
  const content = (t.match(/[A-Za-z0-9]/g) || []).length;
  const punct = (t.match(PUNCT) || []).length;
  return punct >= 8 && punct > content * 0.5;
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
      /* The spaced line is kept as well as the trimmed one: a reprinted
         answer table is only recoverable from where its columns sit. */
      cur.lines.push({ col: indent + (t.length - cleaned.length), text: cleaned, raw: line });
    });
  });
  return out;
}

/* ---------- the reprinted answer table ----------

   A question that asks you to complete a table has the completed one as its
   mark scheme, and a PDF hands that back as scattered words: the header cells
   wrap down the page one word per line, and a value whose row is taller than
   the others is printed on the line below its own row. Read line by line the
   numbers end up under the wrong headings, which on a question about reading
   a table is the one mistake that matters.

   Columns are recoverable, though, because pdftotext keeps the x position of
   every token. So the block is read column by column rather than row by row:
   tokens are bucketed by where they start, and a column's values in printed
   order are that column's values in row order. When every column comes back
   with the same number of values, the table is exactly reconstructed. When
   they do not, nothing is claimed and the block is left as printed. */

const NUM = /^[£$]?-?\d[\d.,]*%?$/;
const TABLE_MARK = "[[TABLE]]";

function isNumberRow(raw) {
  const toks = String(raw).trim().split(/\s{2,}/).filter(Boolean);
  if (!toks.length) return false;
  return toks.every(function (t) { return NUM.test(t.trim()); });
}

/* A line that could be part of a table: nothing on it but numbers and the
   short words a column heading is made of. A sentence ends in punctuation and
   a heading ends in a colon, so both are excluded and the block stops there. */
function isCellRow(raw) {
  const t = String(raw).trim();
  if (!t || /[.:;?!]$/.test(t)) return false;
  if (hasBullet(t)) return false;
  const toks = t.split(/\s{2,}/).filter(Boolean);
  if (!toks.length) return false;
  return toks.every(function (tok) {
    return tok.length <= 22 && tok.split(/\s+/).every(function (w) {
      return NUM.test(w) || /^[A-Za-z£$(][\w()£$%.,'/-]{0,15}$/.test(w);
    });
  });
}

/* every token on a line, with the column it starts in */
function tokens(raw) {
  const out = [];
  const re = /\S+(?:[ ](?!\s)\S+)*/g;
  let m;
  while ((m = re.exec(raw))) out.push({ col: m.index, text: m[0] });
  return out;
}

/* Start columns that sit within a few characters of each other are the same
   column: a right-aligned number and its heading rarely begin in the same
   place, and a wrapped header word can be indented under its own cell. */
function columnsOf(all, tolerance) {
  const starts = all.map(function (t) { return t.col; }).sort(function (a, b) { return a - b; });
  const cols = [];
  starts.forEach(function (s) {
    if (!cols.length || s - cols[cols.length - 1] > tolerance) cols.push(s);
  });
  return cols;
}

function nearest(cols, x) {
  let best = 0;
  for (let i = 1; i < cols.length; i++) {
    if (Math.abs(cols[i] - x) < Math.abs(cols[best] - x)) best = i;
  }
  return best;
}

/* Read one run of lines as a table. Header words and data cells share the same
   lines in some papers - the price column is printed alongside the wrapped
   headings - so the split is not "these lines are the header and those are the
   body". It is per column: a column's words are its heading, and the numbers
   after them are its values, in the order they were printed.

   Returns null unless every column comes back with the same number of values.
   Anything else means the columns were not read correctly, and a table that
   reads cleanly while saying the wrong thing is worse than no table at all. */
function readTable(blockLines) {
  const all = [];
  blockLines.forEach(function (raw) {
    tokens(raw).forEach(function (t) { all.push(t); });
  });
  if (all.length < 8) return null;

  /* The columns are read off the numbers, not off every token. Numbers in a
     printed table line up exactly; a heading is centred over its column and
     wraps, so "New" and "quantity supplied" start in different places and
     would otherwise be counted as two columns. */
  const cols = columnsOf(all.filter(function (t) { return NUM.test(t.text); }), 4);
  if (cols.length < 2 || cols.length > 8) return null;

  const words = cols.map(function () { return []; });
  const nums = cols.map(function () { return []; });
  let broken = false;

  all.forEach(function (t) {
    const c = nearest(cols, t.col);
    if (NUM.test(t.text)) { nums[c].push(t.text); return; }
    /* a heading word after the numbers have started means this is not a
       column of a table, it is prose that happens to line up */
    if (nums[c].length) broken = true;
    words[c].push(t.text);
  });
  if (broken) return null;

  const n = nums[0].length;
  if (n < 3 || !nums.every(function (c) { return c.length === n; })) return null;

  const head = words.map(function (w) {
    /* the mark award printed beside the table is not a column name */
    return w.join(" ").replace(/^\(\d+(?:\+\d+)*\s*marks?\)\s*/i, "").trim();
  });

  const rows = [];
  for (let r = 0; r < n; r++) {
    rows.push(nums.map(function (c) { return c[r]; }));
  }
  return { head: head.some(Boolean) ? head : null, rows: rows };
}

/* Turn the positioned lines back into logical ones. A bullet opens an item, a
   deeper-indented line continues it, and a line ending in a colon is a
   heading introducing the bullets below rather than a wrap of the one above. */
function toText(lines) {
  const cols = lines.filter(function (l) { return hasBullet(l.text); })
                    .map(function (l) { return l.col; });
  const bulletCol = cols.length ? Math.min.apply(null, cols) : -1;

  /* Which lines belong to a reprinted answer table, and what that table is.
     Done first so the walk below can skip the whole run in one go. */
  const table = {};        // index of the block's first line -> the table
  const inTable = {};
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].raw || !isCellRow(lines[i].raw)) continue;
    let end = i;
    while (end + 1 < lines.length && lines[end + 1].raw && isCellRow(lines[end + 1].raw)) end++;

    /* a table needs rows, and rows are the lines carrying numbers */
    const numbered = lines.slice(i, end + 1)
      .filter(function (l) { return /\d/.test(l.raw); }).length;
    if (numbered >= 3) {
      const built = readTable(lines.slice(i, end + 1).map(function (l) { return l.raw; }));
      if (built) {
        table[i] = built;
        for (let k = i; k <= end; k++) inTable[k] = i;
      }
    }
    i = end;
  }

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

  lines.forEach(function (l, i) {
    if (inTable[i] !== undefined) {
      if (inTable[i] === i) {
        flush();
        out.push(TABLE_MARK + " " + JSON.stringify(table[i]));
      }
      return;                       // the rest of the run is inside that table
    }

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

    /* A cell of the answer table, which a PDF gives back one word per line:
       "Price", "£", "Quantity", "demanded", "per month", "(000)". Swept into
       the paragraph above they become a run of nonsense in the middle of a
       sentence; kept separate, the view stacks them back into the table. */
    if (isCell(text)) { flushPara(); out.push(text); return; }

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

module.exports = { build, pdfText, questionsIn, toText, isCellRow, readTable, tokens, columnsOf };

if (require.main === module) {
  const res = build(process.argv[2]);
  const only = process.argv[3];
  Object.keys(res).sort().forEach(function (k) {
    if (only && k !== only) return;
    console.log("===== " + k + " =====");
    console.log(res[k]);
  });
}
