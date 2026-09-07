const { load, run } = require("./load.js");
load("js/eco-questions.js");
const Q = run("ECO_QUESTIONS");

const SIG = /(an wer|mark |ela ticity|recogni e|con ider| upply| ub id|hou ehold| tate|analy i |que tion| urplu |co t |increa e|decrea e|bu ine |mu t| hould)/i;
let msHit = 0, txtHit = 0;
const papers = {};
Q.forEach(q => {
  const key = q.series + " P" + q.paper;
  papers[key] = papers[key] || { ms: 0, tx: 0, n: 0 };
  papers[key].n++;
  if (SIG.test(q.ms || "")) { msHit++; papers[key].ms++; }
  if (SIG.test(q.text || "")) { txtHit++; papers[key].tx++; }
});
console.log("MS with dropped-s:", msHit, "/", Q.length);
console.log("TEXT with dropped-s:", txtHit, "/", Q.length);
console.log("");
Object.keys(papers).sort().forEach(k => {
  const p = papers[k];
  console.log(k.padEnd(20), "n=" + String(p.n).padEnd(4), "msBad=" + String(p.ms).padEnd(4), "textBad=" + p.tx);
});
