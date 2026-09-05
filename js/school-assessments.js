/* ============================================================
School assessments, the tests you actually sit in class
------------------------------------------------------------
Past Papers covers official Edexcel papers. This covers the
other half of the evidence: chapter tests, mini-assessments,
end-of-topic quizzes, and school mocks.

TWO KINDS, treated differently on purpose:

"topic" a test on specific content, a Chapter 5 test, a
trig assessment. These ATTACH to chapters, so a bad
score raises that chapter's priority in the planner
the same way losing marks in a past paper does.

"mock" a full paper or whole-subject mock. There is no
single chapter to blame, so these attach to nothing
and are tracked only as an overall grade trend.

SCORING, you may only know one of these, so both are allowed:
"marks" a mark out of a total, which gives a percentage
"grade" just the letter, when that is all you were told

A grade-only entry cannot produce a percentage, so it never
feeds the priority calculation, it still shows in your grade
history. This is deliberate: inventing a percentage from a
letter would put a made-up number into the planner.
============================================================ */

const SchoolAssessments = (function () {

    /* Words too common to identify a chapter, matching on these would
    attach a "Pure test" to every chapter with the word in its name. */
    const STOP = ("test assessment mini quiz mock exam paper the a an of and in on for " +
      "my class school end topic chapter unit half term week maths mathematics " +
      "pure statistics mechanics year retake resit").split(" ");

    /* Extra search terms per chapter: the words a student actually writes on a
    test title but which do not appear in the chapter's own name. Keyed by
    the real section ids, which are listed in spec-data.js. */
    const KEYWORDS = {
      /* Pure, Year 1 */
      pu1:  "indices surds factorise factorising expand brackets rationalise",
      pu2:  "quadratic quadratics discriminant completing square roots",
      pu3:  "simultaneous inequalities regions",
      pu4:  "transformations sketching asymptotes cubic reciprocal",
      pu5:  "straight line gradient perpendicular parallel coordinate",
      pu6:  "circle centre radius tangent chord perpendicular bisector",
      pu7:  "algebraic proof division factor theorem remainder",
      pu8:  "binomial pascal factorial choose estimation",
      pu9:  "trigonometry trig sine cosine rule area of a triangle",
      pu10: "trigonometry trig identities equations exact values cast graphs",
      pu11: "vectors magnitude direction column resultant",
      pu12: "differentiate derivative gradient tangent normal stationary first principles",
      pu13: "integrate area under curve definite indefinite",
      pu14: "exponentials logarithms logs natural growth decay modelling",

      /* Pure, Year 2 */
      pu2c1:  "proof contradiction partial fractions algebraic division remainder",
      pu2c2:  "modulus composite inverse functions domain range",
      pu2c3:  "sequences series arithmetic geometric sigma recurrence convergence sum",
      pu2c4:  "binomial expansion validity negative fractional",
      pu2c5:  "radians arc sector segment small angle",
      pu2c6:  "sec cosec cot reciprocal arcsin arccos arctan identities",
      pu2c7:  "compound double angle addition formulae harmonic rsin modelling",
      pu2c8:  "parametric cartesian parameter",
      pu2c9:  "differentiate chain product quotient implicit parametric rates concavity",
      pu2c10: "newton raphson iteration numerical root change of sign trapezium",
      pu2c11: "integrate substitution by parts partial differential equations trapezium",
      pu2c12: "vectors 3d three dimensional unit magnitude",

      /* Statistics, Year 1 */
      st1: "sampling population census stratified systematic data collection large data set",
      st2: "mean median mode quartiles variance standard deviation coding spread averages",
      st3: "histogram box plot cumulative frequency outliers representations",
      st4: "correlation scatter regression line of best fit bivariate",
      st5: "probability venn tree diagram mutually exclusive independent",
      st6: "binomial distribution random variables statistical distributions",
      st7: "hypothesis testing critical region critical value tails significance",

      /* Statistics, Year 2 */
      st2c1: "regression correlation pmcc product moment hypothesis exponential models",
      st2c2: "conditional probability venn tree set notation independence",
      st2c3: "normal distribution standardise approximation continuity correction",

      /* Mechanics, Year 1 */
      me8:  "modelling assumptions units quantities vectors",
      me9:  "suvat constant acceleration velocity time graphs gravity kinematics",
      me10: "forces newton laws connected particles pulleys tension",
      me11: "variable acceleration calculus kinematics",

      /* Mechanics, Year 2 */
      me2c4: "moments equilibrium rigid body tilting centre of mass rod",
      me2c5: "friction inclined plane resolving coefficient rough",
      me2c6: "projectiles projectile trajectory range greatest height",
      me2c7: "statics ladder friction inclined applications connected particles",
      me2c8: "kinematics vectors variable acceleration calculus"
    };

    function norm(s) {
      return String(s || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    }

    /* Suggest the chapters a test title is about.
    Returns chapter ids best-first. An explicit "chapter 5" style reference
    is trusted most, because that is the student telling us directly. */
    function suggest(title, paperHint) {
      const words = norm(title).split(" ").filter(function (w) {
          return w.length > 2 && STOP.indexOf(w) < 0;
        });
      if (!words.length && !/chapter|ch\s*\d/i.test(title || "")) return [];

      /* "chapter 5", "ch5", "ch 5", and which year, if stated */
      const chMatch = norm(title).match(/\b(?:chapter|ch)\s*(\d{1,2})\b/);
      const chNum = chMatch ? chMatch[1] : null;
      const yearMatch = norm(title).match(/\byear\s*([12])\b|\by([12])\b/);
      const year = yearMatch ? (yearMatch[1] || yearMatch[2]) : null;

      const scored = [];
      ALL_CHAPTER_IDS.forEach(function (cid) {
          const inf = CHAPTER_INDEX[cid];
          const sec = inf.chapter;
          if (paperHint && paperHint !== "all" && inf.paper.id !== paperHint) return;

          let score = 0;
          const hay = norm(sec.name + " " + (KEYWORDS[sec.id] || "") + " " +
            sec.subs.map(function (s) { return s.name; }).join(" "));

          words.forEach(function (w) {
              if (hay.indexOf(w) >= 0) score += w.length >= 6 ? 3 : 2;
            });

          /* An explicit chapter number is strong evidence, but both years have a
          chapter of every number, so without a stated year it is ambiguous
          and scores lower than a name match. */
          if (chNum && String(sec.num) === chNum) {
            score += year ? (String(sec.year) === year ? 8 : -5) : 3;
          }
          if (score > 0) scored.push({ cid: cid, score: score });
        });

      scored.sort(function (a, b) { return b.score - a.score; });
      /* Only keep matches close to the best one, a long tail of weak matches
      is worse than none, because it invites ticking the wrong chapter. */
      const best = scored.length ? scored[0].score : 0;
      return scored.filter(function (s) { return s.score >= Math.max(2, best * 0.6); })
      .slice(0, 4).map(function (s) { return s.cid; });
    }

    /* ---------- reading the log ---------- */
    function all() {
      return (Store.get().schoolAssessments || []).slice()
      .sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
    }

    function pct(a) {
      if (!a || a.scoreMode !== "marks") return null;
      const m = +a.mark, t = +a.total;
      if (!(t > 0) || isNaN(m)) return null;
      return Math.round(m / t * 100);
    }

    /* Every assessment attached to a chapter, or to one of its subtopics,
    so a chapter's record still shows when viewing a section inside it. */
    function forTopic(id) {
      const cid = isChapterId(id) ? id : chapterIdForSub(id);
      if (!cid) return [];
      return all().filter(function (a) {
          return a.kind === "topic" && (a.chapterIds || []).indexOf(cid) >= 0;
        });
    }

    /* The signal the planner uses: the average score across attached
    assessments, and how many there were. Grade-only entries are excluded
    because they carry no percentage. */
    function signal(id) {
      const rel = forTopic(id).map(pct).filter(function (p) { return p != null; });
      if (!rel.length) return { avg: null, count: 0 };
      const avg = Math.round(rel.reduce(function (a, b) { return a + b; }, 0) / rel.length);
      return { avg: avg, count: rel.length };
    }

    /* The plan needs a current signal rather than an average of every test
    ever taken. A better result this week should not stay buried under an
    older weak result (and vice versa). `updatedAt` is set whenever an entry
    is saved; older records gracefully fall back to their test date. */
    function latestSignal(id) {
      const rel = forTopic(id).filter(function (a) { return pct(a) != null; })
      .sort(function (a, b) {
        const aWhen = a.updatedAt || a.loggedAt || a.date || "";
        const bWhen = b.updatedAt || b.loggedAt || b.date || "";
        return bWhen.localeCompare(aWhen);
      });
      if (!rel.length) return { pct: null, assessment: null };
      return { pct: pct(rel[0]), assessment: rel[0] };
    }

    /* Overall grade trend, mocks and topic tests together. */
    function trend() {
      const withPct = all().filter(function (a) { return pct(a) != null; })
      .sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); });
      return withPct.map(function (a) {
          return { v: pct(a), label: a.title, short: a.date ? Metrics.fmtDate(a.date, { day: "numeric", month: "short" }) : "" };
        });
    }

    function summary() {
      const list = all();
      const pcts = list.map(pct).filter(function (p) { return p != null; });
      return {
        count: list.length,
        topic: list.filter(function (a) { return a.kind === "topic"; }).length,
        mock: list.filter(function (a) { return a.kind === "mock"; }).length,
        avg: pcts.length ? Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length) : null,
        latest: pcts.length ? pcts[pcts.length - 1] : null,
        gradeOnly: list.filter(function (a) { return a.scoreMode === "grade"; }).length
      };
    }

    /* ---------- writing ---------- */
    function save(rec) {
      Store.mutate(function (st) {
          if (!st.schoolAssessments) st.schoolAssessments = [];
          const i = st.schoolAssessments.findIndex(function (a) { return a.id === rec.id; });
          const now = new Date().toISOString();
          if (i >= 0) {
            rec.loggedAt = st.schoolAssessments[i].loggedAt || now;
            rec.updatedAt = now;
            st.schoolAssessments[i] = rec;
          }
          else {
            rec.loggedAt = now;
            rec.updatedAt = now;
            st.schoolAssessments.push(rec);
            Store.log("Logged school assessment: " + rec.title, "paper");
          }
        });
    }

    function remove(id) {
      Store.mutate(function (st) {
          st.schoolAssessments = (st.schoolAssessments || []).filter(function (a) { return a.id !== id; });
        });
    }

    function get(id) {
      return (Store.get().schoolAssessments || []).filter(function (a) { return a.id === id; })[0] || null;
    }

    return {
      suggest: suggest, all: all, get: get, pct: pct, forTopic: forTopic,
      signal: signal, latestSignal: latestSignal, trend: trend, summary: summary, save: save, remove: remove,
      GRADES: ["A*", "A", "B", "C", "D", "E", "U"]
    };
  })();
