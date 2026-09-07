const fs = require("fs");
const p = ".tmpwork/extract-ms.js";
const lines = fs.readFileSync(p, "utf8").split("\n");
lines[74] = '      const numRow = t.match(/^Number\s*(.*)$/i);';
lines[81] = '          skipping = false; pendingAo = rest.replace(/\s*\(\d+\)\s*$/, "").trim();';
fs.writeFileSync(p, lines.join("\n"));
console.log(lines[74]);
console.log(lines[81]);
