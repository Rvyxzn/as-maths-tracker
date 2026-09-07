/* Turn positioned lines back into logical ones. */
const BULLET = /\uF0B7/g;
const AO_ONLY = /^(?:(?:Knowledge(?:\/understanding)?|Application|Analysis|Evaluation|KAA)\s*\d+\s*[,;]?\s*)+$/i;
const GRID_ROW = /^[-\u00a3\d][\d.,\u00a3\s]*$/;

function toText(lines) {
  const cols = lines.filter(l => l.text.indexOf("\uF0B7") >= 0).map(l => l.col);
  const bulletCol = cols.length ? Math.min.apply(null, cols) : -1;

  const out = [];
  let open = null;   // bullet still wrapping
  let para = null;   // plain paragraph still wrapping

  const flushBullet = () => { if (open !== null) { out.push("\u2022 " + open.replace(/\s+/g, " ").trim()); open = null; } };
  const flushPara = () => { if (para !== null) { out.push(para.replace(/\s+/g, " ").trim()); para = null; } };
  const flush = () => { flushBullet(); flushPara(); };

  lines.forEach(function (l) {
    const hasBullet = l.text.indexOf("\uF0B7") >= 0;
    const text = l.text.replace(BULLET, " ").replace(/\s+/g, " ").trim();
    if (!text) return;

    if (hasBullet) { flush(); open = text; return; }

    const heading = /:$/.test(text);
    const ao = AO_ONLY.test(text);
    const deeper = bulletCol >= 0 && l.col > bulletCol;

    /* a wrap of the bullet above */
    if (open !== null && deeper && !heading && !ao) { open += " " + text; return; }

    flushBullet();
    if (heading || ao || GRID_ROW.test(text) || /^\([a-e]\)$/.test(text)) { flushPara(); out.push(text); return; }

    /* Prose outside the bullets wraps too, and a mark scheme's "NB ..." note
       read as three orphan lines is how a sentence stops making sense. */
    if (para !== null) { para += " " + text; return; }
    para = text;
  });
  flush();
  return out;
}
module.exports = { toText, AO_ONLY, GRID_ROW, BULLET };
