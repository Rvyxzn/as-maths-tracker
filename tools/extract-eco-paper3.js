/* ============================================================
   Paper 3 questions - Edexcel A level Economics A (9EC0/03)

   Paper 3 is the synoptic paper: two case studies, each carrying
   a 5, an 8, a 12 and a choice of two 25 mark essays, for 50
   marks a section. That fixed shape is what makes the parse
   reliable - the paper says what each part is worth, in its own
   "(5)" and "(25)" lines, so nothing is inferred from length.

   The question list is printed once as a run, then repeated one
   part at a time above its answer lines. The first run is the
   clean copy and the one this reads.

   The case study itself is not transcribed. Its figures are
   charts and its extracts are long, and a retyped copy that
   drifts from the paper is worse than no copy, so each question
   records the stimulus pages instead and the view renders them
   from the PDF.
   ============================================================ */

const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");

const DIR = "Exam questions PDFs/A-Level Economics/Paper 3 (Synoptic)";
const SERIES = ["June 2017", "June 2018", "June 2019", "June 2020", "June 2021",
                "June 2022", "June 2023", "June 2024", "Specimen"];

function pages(file) {
  /* These papers come back with Windows line endings, and a trailing carriage
     return is not something "." matches, so every pattern anchored at the end
     of a line quietly failed until they were stripped. */
  return execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", path.join(ROOT, file), "-"],
                      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
         .replace(/\r/g, "").split("\f");
}

/* "1 (a)" opens a question, "(b)" onwards continue it. A part ends at its own
   mark tariff on a line of its own. */
const OPEN = /^\s*([12])\s*\(([a-e])\)\s+(.*)$/;
const PART = /^\s*\(([a-e])\)\s+(.*)$/;
const TARIFF = /^\s*\((\d{1,2})\)\s*$/;

/* Every Paper 3 has the same shape, in both sections: a 5, an 8, a 12, and a
   choice of two 25 mark essays. Eight of the nine papers print those tariffs
   on their own lines and every one of them agrees with this; the 2024 paper
   prints them in a sideways layer that has no text of its own, so the shape
   is what fills the gap - and any paper that states a tariff disagreeing with
   it is reported rather than quietly accepted. */
const SHAPE = { a: 5, b: 8, c: 12, d: 25, e: 25 };

/* The "DO NOT WRITE IN THIS AREA" rule runs up the margin of the newer
   papers, and comes back welded to the start or end of whatever line it sits
   beside. */
const MARGIN = /[^\S\n]*DO NOT WRITE IN THIS AREA[^\S\n]*/g;

/* Page furniture: the printed page number with its item code, the answer
   lines, and the instructions that sit between the parts. */
function furniture(l) {
  const t = l.trim();
  return !t ||
    /^\**P\d+[A-Z]+\d+\**$/.test(t.replace(/\s/g, "")) ||
    /^\d+\s+\*P\d+/.test(t) || /\*P\d+[A-Z]+\d+\*\s*\d*$/.test(t) ||
    /^\.{20,}$/.test(t) ||
    /^(Turn over|BLANK PAGE|EITHER|OR|TOTAL FOR|Answer ALL)/i.test(t) ||
    /^\(Total for Question/i.test(t);
}

/* Read one paper. Returns the parts of both questions in paper order. */
function parse(file) {
  const pg = pages(file);
  const out = [];
  let cur = null, q = null, sectionStart = { 1: 0, 2: 0 };

  pg.forEach(function (page, pageIndex) {
    /* the margin rule is stripped first: on the newer papers it sits on the
       same line as the section heading and hides it */
    const clean = page.replace(MARGIN, " ");
    if (/^\s*SECTION A\s*$/m.test(clean)) sectionStart[1] = pageIndex + 1;
    if (/^\s*SECTION B\s*$/m.test(clean)) sectionStart[2] = pageIndex + 1;
    /* One paper's Section B heading never reached the text layer. The line
       that ends Section A did, and Section B starts on the page after it. */
    if (!sectionStart[2] && /TOTAL FOR SECTION A/i.test(clean)) sectionStart[2] = pageIndex + 2;

    /* The front page lists which questions to answer - "1(d) or 1(e)." - and
       that is not a question. Nothing before Section A is. */
    if (!sectionStart[1]) return;

    /* Only the first printing of a part is the clean one; after that the paper
       repeats each part above its own answer lines. */
    function close(stated) {
      if (!cur) return;
      const text = cur.words.join(" ").replace(/\s+/g, " ").trim();
      cur = null;
      if (!text) return;
      if (out.some(function (p) { return p.q === cur0.q && p.part === cur0.part; })) return;
      cur0.text = text;
      /* the paper's own statement wins; the shape only fills a gap */
      cur0.marks = stated || SHAPE[cur0.part];
      cur0.marksFrom = stated ? "paper" : "shape";
      if (stated && stated !== SHAPE[cur0.part]) cur0.unexpected = true;
      out.push(cur0);
    }
    let cur0 = null;

    page.split("\n").forEach(function (line) {
      const raw = line.replace(MARGIN, " ");
      const open = raw.match(OPEN);
      const part = raw.match(PART);
      const tariff = raw.match(TARIFF);

      if (open) {
        close(null);
        q = open[1];
        cur0 = { q: q, part: open[2], page: pageIndex + 1 };
        cur = { words: [open[3].trim()] };
        return;
      }
      if (part && q) {
        close(null);
        cur0 = { q: q, part: part[1], page: pageIndex + 1 };
        cur = { words: [part[2].trim()] };
        return;
      }
      if (!cur) return;
      if (tariff) { close(+tariff[1]); return; }
      if (furniture(raw)) { close(null); return; }
      cur.words.push(raw.trim());
    });
    close(null);
  });

  out.forEach(function (p) {
    p.section = p.q === "1" ? "A" : "B";
    p.stimFrom = sectionStart[p.q];
    p.stimTo = Math.max(sectionStart[p.q], p.page - 1);
  });
  return out;
}

if (require.main === module) {
  const only = process.argv[2];
  SERIES.forEach(function (s) {
    if (only && s !== only) return;
    const file = DIR + "/Questions/" + s + " QP.pdf";
    if (!fs.existsSync(path.join(ROOT, file))) { console.log(s, "-> no paper"); return; }
    const parts = parse(file);
    console.log("=== " + s + " (" + parts.length + " parts, " +
                parts.reduce(function (a, p) { return a + p.marks; }, 0) + " marks) ===");
    parts.forEach(function (p) {
      console.log("  " + p.q + "(" + p.part + ")  " + p.marks + "m  p" + p.page +
                  "  stim " + p.stimFrom + "-" + p.stimTo + "  " + p.text.slice(0, 90));
    });
  });
}

module.exports = { parse, SERIES, DIR };
