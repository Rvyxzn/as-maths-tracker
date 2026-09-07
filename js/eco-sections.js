/* ============================================================
   How you are doing, section by section

   A paper is three different exams stapled together, and one
   percentage across all of them hides that. Section A is
   recall and calculation under time pressure. Section B is
   reading a case study and using it. Section C is a 25-mark
   essay, which is mostly about the shape of the answer.

   People are rarely equally good at all three, and the usual
   shape is being fine on the data response and losing a grade
   on the essay, or the reverse. "You are on 62%" cannot tell
   you which, and so cannot tell you what to do next. This can.

   WHICH SECTION A QUESTION BELONGS TO. The tariff decides it,
   because the tariff is how the paper is built: five marks is
   Section A, eight to fifteen is the data response, twenty-five
   is the essay. That holds across Papers 1, 2 and 3, which
   differ in what they ask about rather than in how they are
   shaped.
   ============================================================ */

const EcoSections = (function () {

  const SECTIONS = [
    { key: "A", name: "Section A", what: "Short answers and multiple choice",
      marks: [5],
      fix: "Definitions and calculations, under time. The marks go missing on units, formulas the wrong way round, and not answering the command word." },
    { key: "B", name: "Section B", what: "Data response",
      marks: [8, 10, 12, 15],
      fix: "Using the extract rather than writing around it. Every point wants a number or a line from the data attached to it." },
    { key: "C", name: "Section C", what: "The 25-mark essay",
      marks: [25],
      fix: "The shape of the answer: two developed chains, a diagram, and evaluation worth over a third of the marks. Watch a worked one, then plan the same question yourself." }
  ];

  function sectionOf(marks) {
    for (let i = 0; i < SECTIONS.length; i++) {
      if (SECTIONS[i].marks.indexOf(+marks) >= 0) return SECTIONS[i].key;
    }
    /* anything else sits with the data response, which is where the odd
       tariffs live */
    return "B";
  }

  /* Every marked attempt, gathered by section. Reads the question packs'
     attempts and the exam-question log, which are the two places a score on
     a single question is recorded. */
  function tally() {
    const out = {};
    SECTIONS.forEach(function (s) {
      out[s.key] = { got: 0, avail: 0, n: 0, recent: [], key: s.key,
                     name: s.name, what: s.what, fix: s.fix };
    });
    if (typeof Store === "undefined") return out;

    const st = Store.get() || {};
    const byId = {};
    if (typeof ECO_QUESTIONS !== "undefined") {
      ECO_QUESTIONS.forEach(function (q) { byId[q.id] = q; });
    }

    const add = function (marks, got, avail, at) {
      if (!avail) return;
      const k = sectionOf(marks);
      const t = out[k];
      t.got += got; t.avail += avail; t.n++;
      t.recent.push({ pct: Math.round(got / avail * 100), at: at || "" });
    };

    (st.packAttempts || []).forEach(function (a) {
      const q = byId[a.questionId];
      add(q ? q.marks : a.available, a.got, a.available, a.at);
    });
    (st.examAttempts || []).forEach(function (a) {
      add(a.available, a.got, a.available, a.at);
    });

    Object.keys(out).forEach(function (k) {
      const t = out[k];
      t.pct = t.avail ? Math.round(t.got / t.avail * 100) : null;
      t.recent.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
      /* the last five, so a run of better work shows before the average
         catches up with it */
      const last = t.recent.slice(0, 5);
      t.trendPct = last.length ? Math.round(last.reduce(function (a, x) { return a + x.pct; }, 0) / last.length) : null;
      t.trend = (t.pct != null && t.trendPct != null) ? t.trendPct - t.pct : null;
    });
    return out;
  }

  /* The section costing you the most, or null when nothing is. Three attempts
     is not a pattern, but it is enough to stop calling it noise. */
  function trouble() {
    const t = tally();
    let worst = null;
    Object.keys(t).forEach(function (k) {
      const s = t[k];
      if (s.n < 3 || s.pct == null || s.pct >= 60) return;
      if (!worst || s.pct < worst.pct) worst = { section: k, pct: s.pct, n: s.n, name: s.name, fix: s.fix };
    });
    return worst;
  }

  /* What to do next, from the gap between sections rather than from either
     one alone: being on 70% in the data response and 45% in the essay is a
     different problem from being on 45% in both. */
  function advice() {
    const t = tally();
    const done = Object.keys(t).map(function (k) { return t[k]; })
      .filter(function (s) { return s.n >= 3 && s.pct != null; });
    if (done.length < 2) {
      return { text: "Answer a few more questions and this will start telling you which section is " +
                     "costing you, rather than only what your average is.", section: null };
    }
    done.sort(function (a, b) { return a.pct - b.pct; });
    const low = done[0], high = done[done.length - 1];
    if (high.pct - low.pct >= 12) {
      return { section: low.key,
               text: low.name + " is " + (high.pct - low.pct) + " points behind " + high.name +
                     " (" + low.pct + "% against " + high.pct + "%). " + low.fix };
    }
    if (low.pct < 60) {
      return { section: low.key,
               text: "Every section is under where it needs to be, and " + low.name +
                     " is the weakest at " + low.pct + "%. " + low.fix };
    }
    return { section: null,
             text: "The three sections are within " + (high.pct - low.pct) +
                   " points of each other, so nothing is dragging you down on its own. " +
                   "Whole papers under time are what move all three now." };
  }

  return { SECTIONS: SECTIONS, sectionOf: sectionOf, tally: tally,
           trouble: trouble, advice: advice };
})();
