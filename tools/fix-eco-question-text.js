/* Trim question text that ran past its own part.

   Section B prints its parts one after another down the page, and the
   extraction for a dozen of them carried on into the next part: "(e) Discuss
   the likely benefits of price discrimination... (15) 6 (a) Refer to Figure
   1..." Read on screen that is one question asking two things, with a mark
   tariff in the middle, and the header saying 15 marks while the words on
   the page say 5.

   A part ends where the next part marker begins. The page furniture around
   it - the bullet the PDF uses for its footer and "Turn over" - goes too. */

const fs = require("fs"), path = require("path");
const { load, run } = require("./load.js");
const ROOT = path.join(__dirname, "..");

load("js/eco-questions.js");
const Q = run("ECO_QUESTIONS");

/* The marker that starts a different part: "(b)" through "(e)", or the
   question restating itself as "6 (a)". Not the tariff "(15)", and not a
   bracketed aside inside a sentence, which is why a following space and a
   capital or the end of the string are required. */
function cutAt(text, ownPart) {
  const re = /(?:^|\s)(?:\d\s*)?\(([a-e])\)(?=\s)/g;
  let m;
  while ((m = re.exec(text))) {
    if (m.index === 0 && m[1] === ownPart) continue;   // its own opening marker
    if (m[1] === ownPart && m.index < 4) continue;
    return m.index;
  }
  return -1;
}

function clean(text) {
  return String(text || "")
    .replace(/[•·]{2,}/g, " ")
    .replace(/\bTurn over\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let fixed = 0;
const report = [];
Q.forEach(function (q) {
  if (!q.part) return;
  const before = q.text;
  let t = clean(before);
  const at = cutAt(t, q.part);
  if (at > 0) t = t.slice(0, at).trim();
  t = clean(t);
  if (t && t !== before) {
    q.text = t;
    fixed++;
    if (before.length - t.length > 30) {
      report.push({ id: q.id, was: before.length, now: t.length, text: t });
    }
  }
});

console.log("texts changed:", fixed, "of", Q.filter(function (q) { return q.part; }).length);
report.forEach(function (r) {
  console.log("  " + r.id + "  " + r.was + " -> " + r.now + "  " + r.text.slice(0, 110));
});

if (process.argv[2] === "--write") {
  const file = path.join(ROOT, "js/eco-questions.js");
  const src = fs.readFileSync(file, "utf8");
  const cut = src.indexOf("const ECO_QUESTIONS = [");
  const tail = src.indexOf("\n];", cut);
  const after = src.slice(src.indexOf("\n", tail + 3));
  fs.writeFileSync(file, src.slice(0, cut) + "const ECO_QUESTIONS = " +
                   JSON.stringify(Q, null, 1) + ";" + after);
  console.log("written");
}
