const { pdfText } = require("./extract-ms.js");
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
function walk(d, out) {
  fs.readdirSync(path.join(ROOT, d)).forEach(n => {
    const rel = d + "/" + n;
    if (fs.statSync(path.join(ROOT, rel)).isDirectory()) walk(rel, out);
    else if (/MS\.pdf$/.test(n)) out.push(rel);
  });
  return out;
}
walk("Exam questions PDFs/A-Level Economics", []).sort().forEach(f => {
  const t = pdfText(f);
  const counts = {};
  t.split("\n").forEach(l => {
    const m = l.match(/^\s{5,}(\S)/);
    if (m && !/[A-Za-z0-9(£"'\u2018\u201c-]/.test(m[1])) counts[m[1]] = (counts[m[1]] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([c, n]) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0") + " x" + n);
  console.log(f.replace(/^.*\//, "").padEnd(18), f.indexOf("Macro") > 0 ? "P2" : "P1", "|", top.join("  ") || "(none)");
});
