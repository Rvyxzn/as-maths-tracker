const { load, run } = require("./load.js");
load("js/eco-questions.js");
const Q = run("ECO_QUESTIONS");
/* Only fragments that cannot occur in real English: a word split where the
   "s" used to be. */
const SIG = /\b(an wer|ela ticity| ub id|hou ehold|analy i |que tion| urplu |increa e|decrea e|bu ine |recogni e|con umer|  upply|de cript|re pon e|di cu |a  e  |mu t\b|con ider)/i;
let hits = [];
Q.forEach(q => { const m = (q.ms || "").match(SIG); if (m) hits.push([q.id, m[0]]); });
console.log("still corrupted:", hits.length, "/", Q.length);
hits.slice(0, 20).forEach(h => console.log("  " + h.join(" | ")));

/* truncation: a mark scheme that stops mid-clause */
const cut = Q.filter(q => /\b(e\.g\.|and|the|of|to|a|in|for|with|that)$/i.test((q.ms || "").trim()));
console.log("truncated mid-clause:", cut.length);
cut.slice(0, 10).forEach(q => console.log("  " + q.id + " ... " + q.ms.trim().slice(-70)));

const empty = Q.filter(q => !(q.ms || "").trim());
console.log("empty:", empty.length, empty.map(q => q.id).join(", "));
