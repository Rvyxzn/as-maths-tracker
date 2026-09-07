const fs = require("fs");
const p = ".tmpwork/extract-ms.js";
const lines = fs.readFileSync(p, "utf8").split("\n");
lines[74] = String.raw`      const numRow = t.match(/^Number\s*(.*)$/i);`;
lines[81] = String.raw`          skipping = false; pendingAo = rest.replace(TRAILING_TOTAL, "").trim();`;
const i = lines.findIndex(l => l.indexOf("|| /^[A-E]$/.test(rest.replace(") >= 0);
lines[i] = String.raw`        if (rest && (AO_ONLY.test(rest) || /^[A-E]$/.test(rest.replace(TRAILING_TOTAL, "").trim()))) {`;
const j = lines.findIndex(l => l.indexOf("const MARKER =") >= 0);
lines.splice(j + 1, 0, "", "/* the mark total printed at the end of a header row, e.g. \"A   (1)\" */",
             String.raw`const TRAILING_TOTAL = /\s*\(\d+\)\s*$/;`);
fs.writeFileSync(p, lines.join("\n"));
