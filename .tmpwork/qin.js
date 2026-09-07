/* Lines that are furniture: the repeated table header, the page number, the
   "6(b) continued" that starts a spill-over page, PMT's watermark, and the
   level grid's stray cells. */
function isFurniture(l) {
  const t = l.trim();
  return !t ||
    /^Question\s+(Answer|Indicative content)/i.test(t) ||
    /^(Mark|Answer|Indicative content|continued|PMT)$/i.test(t) ||
    /^Level\s+Mark\s+Descriptor/i.test(t) ||
    /^Pearson Education Limited/i.test(t) ||
    /^Publications? Code/i.test(t);
}

/* Where the generic marking ladder starts. It is the same on every extended
   response, describes the grade rather than this question's answer, and
   pdftotext interleaves its three columns into nonsense, so it is cut. */
const LEVEL_START = /^\s*(Level\s+Mark\s+Descriptor|Knowledge,\s*application\s*and\s*analysis\s*$|Evaluation\s*$|Level\s*\d|\d+\s+(A completely inaccurate|No evaluative))/i;
const AO_ONLY = /^(?:(?:Knowledge(?:\/understanding)?|Application|Analysis|Evaluation|KAA)\s*\d+\s*[,;]?\s*)+(?:\(\d+\))?\s*$/i;

/* A question marker owns column 0. Questions run 1 to 8, which keeps the
   "0" row of the level grid from opening a phantom question. */
const MARKER = /^([1-8])\s?(?:\(\s*([a-e])\s*\))?(?:\s+(.*))?$/;

function questionsIn(text) {
  const pages = text.split("\f");
  const out = [];
  let cur = null, skipping = false;

  pages.forEach(function (page) {
    page.split("\n").forEach(function (raw) {
      const line = raw.replace(/\s+$/, "");
      const t = line.trim();

      /* The header row sometimes carries the allocation for the block below
         it ("Number   Knowledge 4, Application 4, Analysis 8, Evaluation 9").
         Dropping the whole row loses the only statement of what the marks
         are for, so the row goes and its content stays. */
      const numRow = line.match(/^Number\s*(.*)$/i);
      if (numRow) {
        const rest = (numRow[1] || "").trim();
        if (cur && rest && AO_ONLY.test(rest)) { skipping = false; cur.lines.push({ col: 10, text: rest }); }
        return;
      }
      if (isFurniture(line)) { if (LEVEL_START.test(t)) skipping = true; return; }

      const start = /^\S/.test(line) ? line.match(MARKER) : null;
      if (start) {
        cur = { q: start[1], part: start[2] || "", lines: [] };
        out.push(cur);
        skipping = false;
        const rest = (start[3] || "").trim();
        if (rest) cur.lines.push({ col: line.indexOf(rest), text: rest });
        return;
      }
      if (!cur) return;
      if (LEVEL_START.test(line)) { skipping = true; return; }
      if (skipping) {
        if (AO_ONLY.test(t)) skipping = false;
        else return;
      }
      cur.lines.push({ col: line.search(/\S/), text: t });
    });
  });
  return out;
}
