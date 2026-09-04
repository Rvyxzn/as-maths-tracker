/* ============================================================
Exam question sets, the PDFs sitting in "Exam questions PDFs".

   These are served straight from the folder next to index.html, so
   nothing is downloaded, attached or stored: open a chapter and the
   questions are simply there, with the mark scheme behind a click.

   The PDFs are filed by exam topic; the app is organised by textbook
   chapter, so each chapter is mapped to the set(s) that cover it.
   Where a set is the closest available match rather than an exact
   one, `approx: true` says so in the UI rather than pretending.
   ============================================================ */

const PDF_ROOT = "Exam questions PDFs/AS maths (Year 1)/";

/* [folder, questions file, mark scheme file] */
const EXAM_SETS = {
  /* ---- Pure ---- */
  surds: { paper: "Pure", name: "Surds and Indices", dir: "Pure", q: "AS Surds and Indices", ms: "AS Surds and Indices MS" },
  quadratics: { paper: "Pure", name: "Quadratics", dir: "Pure", q: "AS Quadratics", ms: "AS Quadratics MS" },
  functions: { paper: "Pure", name: "Functions", dir: "Pure", q: "AS Functions", ms: "AS Functions MS" },
  straight: { paper: "Pure", name: "Straight Line Graphs", dir: "Pure", q: "AS Straight Line Graphs", ms: "AS Straight Line Graphs MS" },
  circles: { paper: "Pure", name: "Circles", dir: "Pure", q: "AS Circles", ms: "AS Circles MS" },
  proof: { paper: "Pure", name: "Proof", dir: "Pure", q: "AS Proof", ms: "AS Proof MS" },
  binomial: { paper: "Pure", name: "Binomial Expansion", dir: "Pure", q: "AS Binomial Expansion", ms: "AS Binomial Expansion MS" },
  trigGeom: { paper: "Pure", name: "Trigonometry, Geometry", dir: "Pure", q: "AS Trigonometry Geometry", ms: "AS Trigonometry Geometry MS" },
  trigEq: { paper: "Pure", name: "Trigonometry, Equations",dir: "Pure", q: "AS Trigonometry Equations", ms: "AS Trigonometry Equations MS" },
  vectors: { paper: "Pure", name: "Vectors", dir: "Pure", q: "AS Vectors", ms: "AS Vectors MS" },
  diff: { paper: "Pure", name: "Differentiation", dir: "Pure", q: "AS Differentiation", ms: "AS Differentiation MS" },
  integ: { paper: "Pure", name: "Integration", dir: "Pure", q: "AS Integration", ms: "AS Integration MS" },
  explogs: { paper: "Pure", name: "Exponentials and Logs", dir: "Pure", q: "AS Exponentials and Logs", ms: "AS Exponentials and Logs MS" },

  /* ---- Statistics ---- */
  handling: { paper: "Stats", name: "Handling Data", dir: "Stats", q: "AS Handling Data", ms: "AS Handling Data MS" },
  regression: { paper: "Stats", name: "Linear Regression", dir: "Stats", q: "AS Linear Regression", ms: "AS Linear Regression MS" },
  probability:{ paper: "Stats", name: "Probability", dir: "Stats", q: "AS Probability", ms: "AS Probability MS" },
  binomDist: { paper: "Stats", name: "Binomial Distribution", dir: "Stats", q: "AS Binomial Distribution", ms: "AS Binomial Distribution MS" },

  /* ---- Mechanics ---- */
  motionGraphs:{ paper: "Mech", name: "Motion-Time Graphs", dir: "Mechanics", q: "AS Motion Time Graphs", ms: "AS Motion Time Graphs MS" },
  suvat: { paper: "Mech", name: "SUVAT", dir: "Mechanics", q: "AS SUVAT", ms: "AS SUVAT MS" },
  forces: { paper: "Mech", name: "Forces and Motion", dir: "Mechanics", q: "AS Forces and Motion", ms: "AS Forces and Motion MS" },
  varAccel: { paper: "Mech", name: "Variable Acceleration", dir: "Mechanics", q: "AS Variable Acceleration",ms: "AS Variable Acceleration MS" }
};

/* the question and mark-scheme folders are named slightly differently per paper */
const PDF_DIRS = {
  Pure: { q: "Questions", ms: "Mark schemes" },
  Stats: { q: "Questions", ms: "Mark scheme" },
  Mechanics: { q: "Questions", ms: "Mark Scheme" }
};

function examSetPath(setKey, which) {
  const s = EXAM_SETS[setKey];
  if (!s) return null;
  const dirs = PDF_DIRS[s.dir];
  const folder = which === "ms" ? dirs.ms : dirs.q;
  const file = (which === "ms" ? s.ms : s.q) + ".pdf";
  return encodeURI(PDF_ROOT + s.dir + "/" + folder + "/" + file);
}

/* Which set(s) cover each chapter. `approx` marks a closest-match rather
   than an exact one, so the app never overstates the fit. */
const CHAPTER_SETS = {
  /* Pure */
  pu1: [{ key: "surds" }],
  pu2: [{ key: "quadratics" }],
  pu3: [{ key: "quadratics", approx: "Equations and inequalities questions sit inside the Quadratics set" }],
  pu4: [{ key: "functions" }],
  pu5: [{ key: "straight" }],
  pu6: [{ key: "circles" }],
  pu7: [{ key: "proof" }, { key: "functions", approx: "Algebraic methods overlap the Functions set" }],
  pu8: [{ key: "binomial" }],
  pu9: [{ key: "trigGeom" }],
  pu10: [{ key: "trigEq" }],
  pu11: [{ key: "vectors" }],
  pu12: [{ key: "diff" }],
  pu13: [{ key: "integ" }],
  pu14: [{ key: "explogs" }],

  /* Statistics */
  st1: [{ key: "handling", approx: "Data collection is covered within Handling Data" }],
  st2: [{ key: "handling" }],
  st3: [{ key: "handling" }],
  st4: [{ key: "regression" }],
  st5: [{ key: "probability" }],
  st6: [{ key: "binomDist" }],
  st7: [{ key: "binomDist", approx: "Hypothesis testing questions are in the Binomial Distribution set" }],

  /* Mechanics */
  me8: [{ key: "forces", approx: "Modelling assumptions are examined inside Forces and Motion" }],
  me9: [{ key: "suvat" }, { key: "motionGraphs" }],
  me10: [{ key: "forces" }],
  me11: [{ key: "varAccel" }]
};

/* Resolve a chapter to fully-formed set records */
function setsForChapter(chapterKey) {
  const list = CHAPTER_SETS[chapterKey] || [];
  return list.map(function (entry) {
    const s = EXAM_SETS[entry.key];
    return {
      key: entry.key, name: s.name, paper: s.paper, approx: entry.approx || null,
      qUrl: examSetPath(entry.key, "q"), msUrl: examSetPath(entry.key, "ms")
    };
  });
}

/* Attach to the chapter index so views can reach it directly */
(function () {
  ALL_CHAPTER_IDS.forEach(function (cid) {
    const inf = CHAPTER_INDEX[cid];
    inf.sets = setsForChapter(inf.chapter.id);
  });
})();

/* Every set, grouped for the Exam Questions page */
function allExamSets() {
  const byChapter = {};
  ALL_CHAPTER_IDS.forEach(function (cid) {
    /* Only Maths chapters carry exam-question PDFs. The index is rebuilt per
       subject, so under Economics or Geography there is no `sets` at all and
       this page has nothing to group. */
    (CHAPTER_INDEX[cid].sets || []).forEach(function (s) {
      if (!byChapter[s.key]) byChapter[s.key] = { set: s, chapters: [] };
      byChapter[s.key].chapters.push(cid);
    });
  });
  return Object.keys(EXAM_SETS).map(function (k) {
    const rec = byChapter[k];
    const s = EXAM_SETS[k];
    return {
      key: k, name: s.name, paper: s.paper,
      qUrl: examSetPath(k, "q"), msUrl: examSetPath(k, "ms"),
      chapters: rec ? rec.chapters : []
    };
  });
}
