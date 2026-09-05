/* ============================================================
   Prerequisites

   Some chapters cannot be started, only continued. Year 2
   differentiation assumes you can already differentiate;
   radians assumes the trigonometry that is measured in them;
   Theme 3 is Theme 1 applied to firms. Opening one of those cold
   is not revision, it is confusion, and the planner had no way
   of knowing.

   Only real dependencies are listed. "Everything needs algebra"
   is true and useless: a warning that fires on every chapter is
   a warning nobody reads. Each entry is a chapter that genuinely
   assumes another, with the reason, because "do Chapter 12 first"
   is easier to accept when it says what it is you would be
   missing.
   ============================================================ */

const PREREQS = (function () {

  const MAP = {
    maths: {
      /* ---- Pure, Year 2 on Year 1 ---- */
      "ch:pu2c1":  [["ch:pu7",  "Algebraic Methods builds straight on proof and algebraic division"]],
      "ch:pu2c2":  [["ch:pu4",  "Functions and Graphs extends the transformations you met here"]],
      "ch:pu2c4":  [["ch:pu8",  "The Year 2 expansion is the Year 1 one taken to negative and fractional powers"]],
      "ch:pu2c5":  [["ch:pu9",  "Radians are a different unit for the trigonometry you already know"],
                    ["ch:pu10", "Arc, sector and small-angle work all assume the identities and equations"]],
      "ch:pu2c6":  [["ch:pu10", "sec, cosec and cot are defined from the ratios and identities here"]],
      "ch:pu2c7":  [["ch:pu2c6", "Compound and double angle formulae are built on the reciprocal functions"]],
      "ch:pu2c9":  [["ch:pu12", "Chain, product and quotient rules assume differentiation from first principles"]],
      "ch:pu2c10": [["ch:pu2c9", "Newton-Raphson is an application of the derivative"]],
      "ch:pu2c11": [["ch:pu13", "Integration by substitution and by parts assume the Year 1 integral"],
                    ["ch:pu2c9", "Reversing the chain and product rules is how these methods work"]],
      "ch:pu2c12": [["ch:pu11", "Three-dimensional vectors extend the two-dimensional ones"]],
      "ch:pu2c8":  [["ch:pu10", "Parametric equations are usually given in terms of sin and cos"]],
      "ch:pu13":   [["ch:pu12", "Integration is introduced as the reverse of differentiation"]],
      "ch:pu12":   [["ch:pu5",  "Gradients, tangents and normals are straight lines at a point"]],
      "ch:pu10":   [["ch:pu9",  "The identities are relationships between the ratios"]],
      "ch:pu6":    [["ch:pu5",  "Circle work leans on perpendicular bisectors and midpoints"]],
      "ch:pu3":    [["ch:pu2",  "Solving and sketching inequalities assumes quadratics"]],

      /* ---- Statistics ---- */
      "ch:st7":    [["ch:st6",  "A hypothesis test is a probability calculated from the binomial distribution"]],
      "ch:st6":    [["ch:st5",  "A distribution is built out of the probability rules"]],
      "ch:st2c1":  [["ch:st4",  "Regression and correlation are extended here"],
                    ["ch:st7",  "The test follows the same logic as the Year 1 one"]],
      "ch:st2c2":  [["ch:st5",  "Conditional probability extends the probability rules and Venn diagrams"]],
      "ch:st2c3":  [["ch:st6",  "The normal is the second distribution: the binomial comes first"]],

      /* ---- Mechanics ---- */
      "ch:me10":   [["ch:me9",  "Forces produce acceleration, which is the SUVAT you already have"]],
      "ch:me11":   [["ch:pu12", "Variable acceleration is differentiating and integrating with respect to time"],
                    ["ch:pu13", "You integrate acceleration to get velocity and velocity to get displacement"]],
      "ch:me2c5":  [["ch:me10", "Friction is another force in the same resolving and Newton's second law"]],
      "ch:me2c6":  [["ch:me9",  "Projectiles are constant acceleration in two directions at once"]],
      "ch:me2c7":  [["ch:me2c5", "Applications of forces assume resolving with friction"]],
      "ch:me2c8":  [["ch:me11", "Further kinematics continues variable acceleration in vector form"]]
    },

    economics: {
      /* Theme 3 is Theme 1 applied to the firm; Theme 4 is Theme 2 applied
         to the world. That is the shape of the whole specification. */
      "ch:eco1-3": [["ch:eco1-2", "Market failure is what happens when the price mechanism from 1.2 does not work"]],
      "ch:eco1-4": [["ch:eco1-3", "Intervention is the response to the failures in 1.3"]],
      "ch:eco2-2": [["ch:eco2-1", "Aggregate demand is measured with the indicators from 2.1"]],
      "ch:eco2-3": [["ch:eco2-2", "AS is the other half of the AD/AS model"]],
      "ch:eco2-4": [["ch:eco2-3", "National income equilibrium needs both AD and AS"]],
      "ch:eco2-5": [["ch:eco2-4", "Growth is a shift in the national income equilibrium"]],
      "ch:eco2-6": [["ch:eco2-5", "Policy is aimed at growth and the other objectives"]],
      "ch:eco3-3": [["ch:eco1-2", "Revenue is price times quantity, which is demand and elasticity"]],
      "ch:eco3-4": [["ch:eco3-3", "Market structures are compared by their costs, revenues and profits"]],
      "ch:eco3-5": [["ch:eco1-2", "The labour market is supply and demand with wages as the price"]],
      "ch:eco3-6": [["ch:eco3-4", "Regulation is aimed at the conduct of the structures in 3.4"]],
      "ch:eco4-1": [["ch:eco2-6", "Trade and exchange rates sit inside the macro objectives"]],
      "ch:eco4-2": [["ch:eco4-1", "Inequality is discussed in the context of trade and development"]],
      "ch:eco4-3": [["ch:eco2-5", "Development is growth measured more broadly"]],
      "ch:eco4-5": [["ch:eco2-6", "The role of the state extends fiscal and monetary policy"]]
    }
  };

  /* The chapters this one assumes, with why, and where you are on each. */
  function forChapter(cid) {
    const subject = (typeof Subjects !== "undefined") ? Subjects.currentId() : "maths";
    const list = (MAP[subject] || {})[cid] || [];
    return list.map(function (p) {
      const inf = (typeof CHAPTER_INDEX !== "undefined") ? CHAPTER_INDEX[p[0]] : null;
      if (!inf || !inf.chapter) return null;
      const subs = (inf.chapter.subs || []).map(function (x) { return x.id; });
      const covered = subs.filter(function (id) { return Metrics.isCovered(id); }).length;
      const rated = subs.filter(function (id) { return Store.topic(id).rag; }).length;
      /* "ready" is deliberately generous: most of it covered, or rated and
         not red. The point is to catch starting something cold, not to
         gate the app behind a checklist. */
      let red = 0;
      subs.forEach(function (id) {
        const e = Metrics.effectiveRag(id);
        if (e.rag === "red") red++;
      });
      const ready = subs.length === 0 || (covered >= Math.ceil(subs.length * 0.6) && red <= 1);
      return { id: p[0], why: p[1], name: inf.chapter.name, label: inf.chapterLabel,
               total: subs.length, covered: covered, rated: rated, red: red, ready: ready };
    }).filter(Boolean);
  }

  /* Only the ones you are not ready for — what a warning would be about. */
  function missing(cid) {
    return forChapter(cid).filter(function (p) { return !p.ready; });
  }

  function has(cid) { return forChapter(cid).length > 0; }

  return { forChapter: forChapter, missing: missing, has: has };
})();
