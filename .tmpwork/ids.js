const { load, run } = require("./load.js");
load("js/eco-questions.js");
const Q = run("ECO_QUESTIONS");
Q.filter(q => q.series === "June 2017" && q.paper === 1)
 .forEach(q => console.log([q.id, "q=" + q.q, "part=" + (q.part || "-"), q.marks + "m", "erKey=" + q.erKey, "pdf=" + q.pdf, q.pageFrom + "-" + q.pageTo].join("  ")));
