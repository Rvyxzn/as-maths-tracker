const { load, run } = require("./load.js");
load("js/eco-questions.js");
const Q = run("ECO_QUESTIONS");
const AO = /^(?:(?:Knowledge(?:\/understanding)?|Application|Analysis|Evaluation|KAA)\s*\d+\s*[,;]?\s*)+$/i;
let noAo = [], noBul = [], short = [], junk = [];
Q.forEach(q => {
  const lines = (q.ms || "").split("\n").map(l => l.trim()).filter(Boolean);
  const hasAo = lines.some(l => AO.test(l));
  const bullets = lines.filter(l => l.indexOf("\u2022") === 0).length;
  if (q.marks >= 8) {
    if (!hasAo) noAo.push(q.id);
    if (bullets < 3) noBul.push(q.id + " (" + bullets + ")");
  }
  if ((q.ms || "").length < q.marks * 25) short.push(q.id + " " + q.marks + "m len=" + (q.ms || "").length);
  const bad = lines.filter(l => /^(Number|Mark|Question|PMT|continued)$/i.test(l));
  if (bad.length) junk.push(q.id + " -> " + bad.join(","));
});
console.log("extended responses missing the AO line:", noAo.length, noAo.slice(0, 12).join(", "));
console.log("extended responses with <3 bullets:", noBul.length, noBul.slice(0, 12).join(", "));
console.log("suspiciously short:", short.length, short.slice(0, 12).join(" | "));
console.log("leftover furniture:", junk.length, junk.slice(0, 12).join(" | "));
