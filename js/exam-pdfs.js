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

/* Two collections sit side by side. The AS sets cover Year 1 only; the
   A level sets are the whole-course topic collections, which is where every
   Year 2 topic lives and where the harder Year 1 questions are. A chapter
   can point at both, and usually should: the AS set to get going, the A
   level one for what the real paper will actually ask. */
const PDF_ROOTS = {
  as: "Exam questions PDFs/A-Level Maths/AS maths (Year 1)/",
  al: "Exam questions PDFs/A-Level Maths/A level topics (Year 1 & 2)/"
};
const PDF_ROOT = PDF_ROOTS.as;   /* kept for anything still reading it */

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
  varAccel: { paper: "Mech", name: "Variable Acceleration", dir: "Mechanics", q: "AS Variable Acceleration",ms: "AS Variable Acceleration MS" },

  /* ---------- the A level topic collections ----------
     These are the whole-course sets: every Year 2 topic, and the Year 1
     topics again at A level standard. The AS sets above stop at the AS
     paper, which is why the Year 1 chapters point at both. */

  /* ---- A level Pure ---- */
  alProof: { paper: "Pure", name: "Proof", dir: "Pure", root: "al", level: "A level", q: "Proof", ms: "Proof MS" },
  alFunctions: { paper: "Pure", name: "Functions", dir: "Pure", root: "al", level: "A level", q: "Functions", ms: "Functions MS" },
  alModulus: { paper: "Pure", name: "The Modulus Function", dir: "Pure", root: "al", level: "A level", q: "Modulus Function", ms: "Modulus Function MS" },
  alSeq: { paper: "Pure", name: "Sequences and Series", dir: "Pure", root: "al", level: "A level", q: "Sequences and Series", ms: "Sequences and Series MS" },
  alSeqModel: { paper: "Pure", name: "Sequences and Series, Modelling", dir: "Pure", root: "al", level: "A level", q: "Sequences and Series Modelling", ms: "Sequences and Series Modelling MS" },
  alBinomial: { paper: "Pure", name: "Binomial Expansion", dir: "Pure", root: "al", level: "A level", q: "Binomial Expansion", ms: "Binomial Expansion MS" },
  alSectors: { paper: "Pure", name: "Radians, Sectors and Segments", dir: "Pure", root: "al", level: "A level", q: "Sectors and Segments", ms: "Sectors and Segments MS" },
  alTrig: { paper: "Pure", name: "Trigonometry", dir: "Pure", root: "al", level: "A level", q: "Trigonometry", ms: "Trigonometry MS" },
  alTrigModel: { paper: "Pure", name: "Trigonometry and Modelling", dir: "Pure", root: "al", level: "A level", q: "Trigonometry Modelling", ms: "Trigonometry Modelling MS" },
  alParametrics: { paper: "Pure", name: "Parametric Equations", dir: "Pure", root: "al", level: "A level", q: "Parametrics", ms: "Parametrics MS" },
  alDiff: { paper: "Pure", name: "Differentiation", dir: "Pure", root: "al", level: "A level", q: "Differentiation", ms: "Differentiation MS" },
  alImplicit: { paper: "Pure", name: "Implicit Differentiation", dir: "Pure", root: "al", level: "A level", q: "Implicit Differentiation", ms: "Implicit Differentiation MS" },
  alDiffOpt: { paper: "Pure", name: "Differentiation, Optimisation", dir: "Pure", root: "al", level: "A level", q: "Differentiation Optimisation", ms: "Differentiation Optimisation MS" },
  alNumerical: { paper: "Pure", name: "Numerical Methods", dir: "Pure", root: "al", level: "A level", q: "Numerical Methods", ms: "Numerical Methods MS" },
  alInteg: { paper: "Pure", name: "Integration", dir: "Pure", root: "al", level: "A level", q: "Integration", ms: "Integration MS" },
  alIntegTrap: { paper: "Pure", name: "Integration, Trapezium Rule", dir: "Pure", root: "al", level: "A level", q: "Integration Trapezium Rule", ms: "Integration Trapezium Rule MS" },
  alIntegDiffEq: { paper: "Pure", name: "Integration, Differential Equations", dir: "Pure", root: "al", level: "A level", q: "Integration Differential Equations", ms: "Integration Differential Equations MS" },
  alIntegParam: { paper: "Pure", name: "Integration, Parametric Equations", dir: "Pure", root: "al", level: "A level", q: "Integration Parametric Equations", ms: "Integration Parametric Equations MS" },
  alVectors: { paper: "Pure", name: "Vectors", dir: "Pure", root: "al", level: "A level", q: "Vectors", ms: "Vectors MS" },
  alCoordGeom: { paper: "Pure", name: "Coordinate Geometry", dir: "Pure", root: "al", level: "A level", q: "Coordinate Geometry", ms: "Coordinate Geometry MS" },
  alExpLogs: { paper: "Pure", name: "Exponentials and Logs", dir: "Pure", root: "al", level: "A level", q: "Exponentials and Logs", ms: "Exponentials and Logs MS" },
  alExpLogsModel: { paper: "Pure", name: "Exponentials and Logs, Modelling", dir: "Pure", root: "al", level: "A level", q: "Exponentials and Logs Modelling", ms: "Exponentials and Logs Modelling MS" },
  /* ---- A level Statistics ---- */
  alAsStats: { paper: "Stats", name: "AS Statistics", dir: "Stats", root: "al", level: "A level", q: "AS Stats", ms: "AS Stats MS" },
  alLargeData: { paper: "Stats", name: "The Large Data Set", dir: "Stats", root: "al", level: "A level", q: "Large Data Set", ms: "Large Data Set MS" },
  alBinomDist: { paper: "Stats", name: "Binomial Distribution", dir: "Stats", root: "al", level: "A level", q: "Binomial Distribution", ms: "Binomial Distribution MS" },
  alPmcc: { paper: "Stats", name: "PMCC and Linear Regression", dir: "Stats", root: "al", level: "A level", q: "PMCC and Linear Regression", ms: "PMCC and Linear Regression MS" },
  alNormal: { paper: "Stats", name: "The Normal Distribution", dir: "Stats", root: "al", level: "A level", q: "Normal Distribution", ms: "Normal Distribution MS" },
  alProbability: { paper: "Stats", name: "Probability", dir: "Stats", root: "al", level: "A level", q: "Probability", ms: "Probability MS" },
  /* ---- A level Mechanics ---- */
  alMotionGraphs: { paper: "Mech", name: "Motion-Time Graphs", dir: "Mechanics", root: "al", level: "A level", q: "Motion Time Graphs", ms: "Motion Time Graphs MS" },
  alVarAccel: { paper: "Mech", name: "Variable Acceleration", dir: "Mechanics", root: "al", level: "A level", q: "Variable Acceleration", ms: "Variable Acceleration MS" },
  alIsJs: { paper: "Mech", name: "Vectors in Mechanics (i and j)", dir: "Mechanics", root: "al", level: "A level", q: "is and js", ms: "is and js MS" },
  alProjectiles: { paper: "Mech", name: "Projectiles", dir: "Mechanics", root: "al", level: "A level", q: "Projectiles", ms: "Projectiles MS" },
  alForcesDyn: { paper: "Mech", name: "Forces, Dynamics", dir: "Mechanics", root: "al", level: "A level", q: "Forces Dynamics", ms: "Forces Dynamics MS" },
  alForcesStat: { paper: "Mech", name: "Forces, Statics", dir: "Mechanics", root: "al", level: "A level", q: "Forces Statics", ms: "Forces Statics MS" },
  alMoments: { paper: "Mech", name: "Moments", dir: "Mechanics", root: "al", level: "A level", q: "Moments", ms: "Moments MS" }
};

/* The AS folders were named by hand and are inconsistent about the mark
   scheme ("Mark schemes", "Mark scheme", "Mark Scheme"); the A level ones
   were created in one go and are not. Both are described here rather than
   renamed, because the folders are the user's, not the app's. */
const PDF_DIRS = {
  as: {
    Pure: { q: "Questions", ms: "Mark schemes" },
    Stats: { q: "Questions", ms: "Mark scheme" },
    Mechanics: { q: "Questions", ms: "Mark Scheme" }
  },
  al: {
    Pure: { q: "Questions", ms: "Mark schemes" },
    Stats: { q: "Questions", ms: "Mark schemes" },
    Mechanics: { q: "Questions", ms: "Mark schemes" }
  }
};

function examSetPath(setKey, which) {
  const s = EXAM_SETS[setKey];
  if (!s) return null;
  const root = s.root || "as";
  const dirs = PDF_DIRS[root][s.dir];
  const folder = which === "ms" ? dirs.ms : dirs.q;
  const file = (which === "ms" ? s.ms : s.q) + ".pdf";
  return encodeURI(PDF_ROOTS[root] + s.dir + "/" + folder + "/" + file);
}

/* Which set(s) cover each chapter. `approx` marks a closest-match rather
   than an exact one, so the app never overstates the fit. */
const CHAPTER_SETS = {
  /* Pure */
  pu1: [{ key: "surds" }],
  pu2: [{ key: "quadratics" }],
  pu3: [{ key: "quadratics", approx: "Equations and inequalities questions sit inside the Quadratics set" }],
  pu4: [{ key: "functions" }, { key: "alFunctions" }],
  pu5: [{ key: "straight" }, { key: "alCoordGeom" }],
  pu6: [{ key: "circles" }, { key: "alCoordGeom" }],
  pu7: [{ key: "proof" }, { key: "functions", approx: "Algebraic methods overlap the Functions set" }],
  pu8: [{ key: "binomial" }, { key: "alBinomial" }],
  pu9: [{ key: "trigGeom" }, { key: "alTrig" }],
  pu10: [{ key: "trigEq" }, { key: "alTrig" }],
  pu11: [{ key: "vectors" }, { key: "alVectors" }],
  pu12: [{ key: "diff" }, { key: "alDiff" }, { key: "alDiffOpt" }],
  pu13: [{ key: "integ" }, { key: "alInteg" }],
  pu14: [{ key: "explogs" }, { key: "alExpLogs" }, { key: "alExpLogsModel" }],

  /* Statistics */
  st1: [{ key: "handling", approx: "Data collection is covered within Handling Data" }, { key: "alLargeData" }],
  st2: [{ key: "handling" }, { key: "alAsStats" }],
  st3: [{ key: "handling" }, { key: "alAsStats" }],
  st4: [{ key: "regression" }, { key: "alPmcc" }],
  st5: [{ key: "probability" }, { key: "alProbability" }],
  st6: [{ key: "binomDist" }, { key: "alBinomDist" }],
  st7: [{ key: "binomDist", approx: "Hypothesis testing questions are in the Binomial Distribution set" }],

  /* Mechanics */
  me8: [{ key: "forces", approx: "Modelling assumptions are examined inside Forces and Motion" }],
  me9: [{ key: "suvat" }, { key: "motionGraphs" }, { key: "alMotionGraphs" }],
  me10: [{ key: "forces" }, { key: "alForcesDyn" }],
  me11: [{ key: "varAccel" }, { key: "alVarAccel" }],

  /* ---------- Year 2 ----------
     Year 2 had no exam questions at all until the A level topic sets were
     added: the AS collections stop at the AS paper, so every chapter below
     was relying on the built-in bank alone. */

  /* Pure, Year 2 */
  pu2c1: [{ key: "alProof" }],
  pu2c2: [{ key: "alFunctions" }, { key: "alModulus" }],
  pu2c3: [{ key: "alSeq" }, { key: "alSeqModel" }],
  pu2c4: [{ key: "alBinomial" }],
  pu2c5: [{ key: "alSectors" }],
  pu2c6: [{ key: "alTrig" }],
  pu2c7: [{ key: "alTrigModel" }, { key: "alTrig" }],
  pu2c8: [{ key: "alParametrics" }],
  pu2c9: [{ key: "alDiff" }, { key: "alImplicit" }, { key: "alDiffOpt" }],
  pu2c10: [{ key: "alNumerical" }],
  pu2c11: [{ key: "alInteg" }, { key: "alIntegTrap" }, { key: "alIntegDiffEq" }, { key: "alIntegParam" }],
  pu2c12: [{ key: "alVectors" }],

  /* Statistics, Year 2 */
  st2c1: [{ key: "alPmcc" }],
  st2c2: [{ key: "alProbability" }],
  st2c3: [{ key: "alNormal" }],

  /* Mechanics, Year 2 */
  me2c4: [{ key: "alMoments" }],
  me2c5: [{ key: "alForcesStat" }, { key: "alForcesDyn" }],
  me2c6: [{ key: "alProjectiles" }],
  me2c7: [{ key: "alForcesStat" }, { key: "alForcesDyn" }],
  me2c8: [{ key: "alIsJs" }, { key: "alVarAccel" }]
};

/* Resolve a chapter to fully-formed set records */
function setsForChapter(chapterKey) {
  const list = CHAPTER_SETS[chapterKey] || [];
  return list.map(function (entry) {
    const s = EXAM_SETS[entry.key];
    return {
      key: entry.key, name: s.name, paper: s.paper, level: s.level || "AS",
      approx: entry.approx || null,
      qUrl: examSetPath(entry.key, "q"), msUrl: examSetPath(entry.key, "ms")
    };
  });
}

/* Attach to the chapter index so views can reach it directly.

   This has to be callable, not a one-shot: switching subject rebuilds
   CHAPTER_INDEX from the spec, which throws away everything hung off it.
   As a run-once IIFE it attached the sets at load and never again, so going
   to Economics and back left every Maths chapter with no exam questions
   until the page was reloaded. Subjects.activate() calls this now. */
function attachExamSets() {
  if (typeof ALL_CHAPTER_IDS === "undefined") return;
  ALL_CHAPTER_IDS.forEach(function (cid) {
    const inf = CHAPTER_INDEX[cid];
    /* Only Maths has these PDFs; under another subject the chapter ids do
       not appear in CHAPTER_SETS and every chapter correctly gets none. */
    inf.sets = setsForChapter(inf.chapter.id);
  });
}
attachExamSets();

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
      key: k, name: s.name, paper: s.paper, level: s.level || "AS",
      qUrl: examSetPath(k, "q"), msUrl: examSetPath(k, "ms"),
      chapters: rec ? rec.chapters : []
    };
  });
}
