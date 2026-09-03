/* ============================================================
Exam-Focus data, chapter-level revision
------------------------------------------------------------
   In Exam-Focus mode the tracker works a chapter at a time
   instead of section by section: one summary, the components
   that actually carry marks, the traps that lose them, and a
   link to Edexcel topic-sorted exam questions.

   ON THE WEIGHTINGS, please read
   Pearson do not publish a per-topic frequency count for 9MA0,
   and no reliable published tally exists. The `weight` values
   below are an editorial judgement built from:
     - the assessment structure of the specification
     - the mark split (Papers 1 and 2 Pure = 100 marks each, so
       Pure is 200 of the 300 marks / 66.7%; Paper 3 = 100 marks,
       split 50 Statistics and 50 Mechanics)
     - the recurring question structures in the Sample Assessment
       Materials and released papers
   They are a sensible ordering to revise by, not a measured
   statistic, and the app says so wherever they are shown.

   Question links point at Physics & Maths Tutor's Edexcel
   topic-sorted question sets (real questions + mark schemes,
     split AS / A level). Nothing here is invented, every URL was
   checked. Chapters map onto PMT's spec-theme pages, so several
   chapters legitimately share a page.
   ============================================================ */

const PMT = "https://www.physicsandmathstutor.com/maths-revision/a-level-edexcel/";

const MATHS_EXAM_FOCUS = {

  /* ---------------- PURE ---------------- */
  pu1: {
    weight: 5,
    marks: "Rarely a whole question, but the algebra runs through every other question on the paper",
    summary: "The manipulation toolkit. You almost never get asked 'simplify this surd' for 6 marks, but a sign slip or a botched index law here quietly destroys marks in differentiation, integration and coordinate geometry.",
    core: [
      "Laws of indices for all rational exponents, including negative and fractional",
      "Rewriting expressions into index form ready to differentiate or integrate, this is the single highest-value skill in the chapter",
      "Factorising quadratics and cubics fluently, including where the x² coefficient is not 1",
      "Simplifying surds and rationalising a denominator using the conjugate"
    ],
    traps: [
      "Expanding (a + b)² as a² + b², costs marks every series",
      "Losing a minus sign when expanding a bracket preceded by a subtraction",
      "Leaving an answer as a decimal when the question says 'give your answer in the form a + b√c'"
    ],
    qUrl: PMT + "algebra-and-functions/"
  },
  pu2: {
    weight: 5,
    marks: "Typically 8-14 marks, plus quadratic technique embedded elsewhere",
    summary: "Completing the square and the discriminant are the two things that come back constantly, both directly and as the engine inside circle, line-intersection and 'find the range of values of k' questions.",
    core: [
      "Completing the square, including when a ≠ 1, and reading the turning point straight off it",
      "The discriminant b² − 4ac and what each case means graphically (two roots / repeated root / no real roots)",
      "Using the discriminant to find a range of values of k, this is the classic 6-mark question",
      "Solving equations that are quadratic in a function of x (in x², √x, eˣ, sin x)"
    ],
    traps: [
      "Forgetting to factor out a before completing the square when a ≠ 1",
      "Writing 'b² − 4ac > 0' when the question says the equation has a repeated root (needs = 0)",
      "Giving x when the question asked for the values of k"
    ],
    qUrl: PMT + "algebra-and-functions/"
  },
  pu3: {
    weight: 4,
    marks: "Typically 6-12 marks",
    summary: "Quadratic inequalities and the line-meets-curve simultaneous equation are the two reliable earners. Set and interval notation is where easy marks leak away.",
    core: [
      "Solving a quadratic inequality via a sketch or sign diagram, then writing the answer in correct set/interval notation",
      "Linear + quadratic simultaneous equations by substitution, pairing x and y values correctly",
      "Linking simultaneous equations to intersections, and using the discriminant to test for tangency",
      "Shading regions with the dashed/solid line convention"
    ],
    traps: [
      "Giving x < 2, x > 5 as a single chained inequality instead of a union",
      "Not reversing the inequality sign when dividing by a negative",
      "Solving the quadratic but then guessing the interval rather than sketching it"
    ],
    qUrl: PMT + "algebra-and-functions/"
  },
  pu4: {
    weight: 4,
    marks: "Typically 6-11 marks, very often a sketch worth 3-4",
    summary: "Transformations are near-guaranteed and are cheap marks if you are precise about direction and order. Cubic sketching from factorised form is the other staple.",
    core: [
      "The four transformations and exactly what each does: f(x)+a, f(x+a), af(x), f(ax)",
      "Finding the image of a specific point, root, turning point or asymptote after a transformation",
      "Sketching cubics from factorised form, showing roots, y-intercept and the behaviour at a repeated root",
      "Reciprocal graphs and their asymptotes"
    ],
    traps: [
      "f(x + a) translating the wrong way, it moves LEFT by a",
      "f(ax) being called a stretch of scale factor a rather than 1/a",
      "Sketches with no intercepts labelled, the marks are for the labels, not the curve"
    ],
    qUrl: PMT + "algebra-and-functions/"
  },
  pu5: {
    weight: 5,
    marks: "Typically 9-14 marks, often combined with circles",
    summary: "Straight lines are unavoidable and are usually the most reliable marks on the paper. Perpendicular gradients and the perpendicular bisector show up again and again, including inside circle questions.",
    core: [
      "y − y₁ = m(x − x₁) and converting to the required form, usually ax + by + c = 0 with integer coefficients",
      "Perpendicular gradients (m₁m₂ = −1) and the equation of a perpendicular bisector",
      "Distance and midpoint formulae",
      "Interpreting gradient and intercept of a linear model in context, with units"
    ],
    traps: [
      "Leaving the answer as y = mx + c when the question demanded integer coefficients",
      "Arithmetic slips in the gradient, always check the sign against a rough sketch",
      "Forgetting units when interpreting a modelling gradient"
    ],
    qUrl: PMT + "coordinate-geometry/"
  },
  pu6: {
    weight: 5,
    marks: "Typically 10-15 marks, often the biggest single question on Paper 1",
    summary: "Circles are a very common extended question and they deliberately combine with Chapter 5. The tangent-perpendicular-to-radius property is the key that unlocks most of them.",
    core: [
      "Completing the square to get from x² + y² + 2fx + 2gy + c = 0 to centre-radius form",
      "Tangent ⟂ radius at the point of contact, the single most used fact in the chapter",
      "The perpendicular from the centre bisects a chord",
      "Line-meets-circle: substitute, form a quadratic, use the discriminant to test intersection or tangency",
      "Angle in a semicircle is 90°, and finding a circle through three points"
    ],
    traps: [
      "Reading the centre off with the wrong signs, (x − a)² means the centre is at +a",
      "Forgetting to square-root to get r after completing the square",
      "Finding the tangent gradient as the radius gradient instead of its negative reciprocal"
    ],
    qUrl: PMT + "coordinate-geometry/"
  },
  pu7: {
    weight: 4,
    marks: "Typically 7-12 marks; the factor theorem question is near-guaranteed",
    summary: "The factor theorem question appears with real consistency: show a factor, divide, factorise fully, solve. Proof is worth drilling because the marks are for the layout as much as the maths.",
    core: [
      "Factor theorem: (x − a) is a factor if and only if f(a) = 0, show the substitution explicitly",
      "Dividing a cubic by a linear factor, then factorising the quadratic to get all three roots",
      "Proof by deduction with a clear concluding statement referring back to the claim",
      "Proof by exhaustion and disproof by counter-example, know when each applies"
    ],
    traps: [
      "Writing f(a) = 0 without actually showing the substitution, no marks",
      "Stopping after the division instead of factorising fully",
      "A proof with no concluding sentence, there is usually a mark for it"
    ],
    qUrl: PMT + "algebra-and-functions/"
  },
  pu8: {
    weight: 5,
    marks: "Typically 6-10 marks, and it appears on essentially every paper",
    summary: "One of the most predictable questions on Paper 1. Usually: expand in ascending powers, then find a specific coefficient or use it to approximate.",
    core: [
      "Expanding (a + bx)ⁿ for positive integer n, in ascending powers of x",
      "Finding a specific coefficient or the term in xᵏ without doing the whole expansion",
      "nCr notation and evaluating it on your calculator",
      "Using the expansion for an approximation such as (1.02)⁸, and commenting on validity"
    ],
    traps: [
      "Forgetting to raise the coefficient to the power too, (2 − 3x)⁵ needs 2⁵, not 2",
      "Sign errors when b is negative and the power is odd",
      "Giving the term when the question asked only for the coefficient (or vice versa)"
    ],
    qUrl: PMT + "sequences-and-series/"
  },
  pu9: {
    weight: 4,
    marks: "Typically 8-13 marks",
    summary: "Sine rule, cosine rule and the area formula, usually inside a worded or 3D-ish context. The graphs half of the chapter feeds directly into Chapter 10.",
    core: [
      "Choosing correctly between the sine rule and the cosine rule from what you are given",
      "The area formula ½ab sin C, including working backwards from a given area",
      "The ambiguous case of the sine rule",
      "Sketching sin, cos and tan, knowing period, symmetry and the tan asymptotes",
      "Transformations of trig graphs: amplitude and period of y = a sin(bx) + c"
    ],
    traps: [
      "Calculator in radians instead of degrees, check before every trig question",
      "Missing the obtuse solution in the ambiguous case",
      "Rounding partway through and losing accuracy marks at the end"
    ],
    qUrl: PMT + "trigonometry/"
  },
  pu10: {
    weight: 5,
    marks: "Typically 9-14 marks, one of the highest-value chapters on Paper 1",
    summary: "The trig equation question is a near-certainty and is where a lot of candidates lose marks. The identities exist mainly to let you convert an equation into one solvable function.",
    core: [
      "sin²θ + cos²θ = 1 and tanθ = sinθ/cosθ, used to reduce an equation to a single function",
      "Solving over a given interval and giving ALL solutions, use CAST or the graph",
      "Equations of the form sin(kx + a) = c: transform the interval, solve, transform back",
      "Quadratic trig equations, e.g. 2sin²x + 3sin x − 2 = 0",
      "Exact values for 0°, 30°, 45°, 60°, 90° and their multiples"
    ],
    traps: [
      "Giving only the calculator solution and missing the rest of the interval, the biggest single mark-loser in AS trig",
      "Forgetting to widen the interval for sin(2x) before solving, then losing half the solutions",
      "Dividing both sides by cos x and silently throwing away solutions"
    ],
    qUrl: PMT + "trigonometry/"
  },
  pu11: {
    weight: 3,
    marks: "Typically 5-9 marks",
    summary: "Usually a shorter question. Magnitude, direction and position vectors are the dependable marks; the geometric proof part is the discriminator.",
    core: [
      "Magnitude via Pythagoras and direction as an angle or bearing",
      "AB = OB − OA, the fact most vector questions hinge on",
      "Unit vectors and parallel vectors as scalar multiples",
      "Proving points are collinear, and vectors in a modelling/mechanics context"
    ],
    traps: [
      "Computing OA − OB instead of OB − OA",
      "Giving a direction measured from the wrong axis, or not as a bearing when asked",
      "Forgetting that 'parallel' means one is a scalar multiple of the other, and saying so explicitly in a proof"
    ],
    qUrl: PMT + "vectors/"
  },
  pu12: {
    weight: 5,
    marks: "Typically 14-20 marks across the paper, the single biggest Pure chapter",
    summary: "Differentiation appears in multiple questions, not just one. Tangents/normals and stationary points are the bread and butter; the optimisation question is usually the highest-mark item on the paper.",
    core: [
      "Rewriting into index form before differentiating, where most errors actually originate",
      "Tangents and normals at a point (normal gradient = −1/m)",
      "Stationary points and using the second derivative to classify them",
      "Optimisation: build the expression, use the constraint to reduce to one variable, differentiate, justify the nature",
      "Increasing/decreasing intervals from the sign of f′(x)",
      "Differentiation from first principles using the limit definition"
    ],
    traps: [
      "Finding the stationary point but never justifying whether it is a max or min, there is always a mark for it",
      "Using the tangent gradient for the normal",
      "In optimisation, forgetting to substitute back to answer the actual question (they asked for the volume, not x)"
    ],
    qUrl: PMT + "differentiation/"
  },
  pu13: {
    weight: 5,
    marks: "Typically 12-18 marks",
    summary: "Almost always includes an area question. The definite integral is straightforward; the marks are lost on limits, on areas below the axis, and on forgetting +c.",
    core: [
      "Integrating xⁿ, including negative and fractional n, after rewriting into index form",
      "Definite integrals with correct square-bracket layout",
      "Area under a curve, finding the limits from the roots when they are not given",
      "Areas below the x-axis: split at the roots and take the modulus",
      "Area between a curve and a line, subtract, or combine an integral with a triangle/trapezium",
      "Finding f(x) from f′(x) using a given point to pin down c"
    ],
    traps: [
      "Omitting + c on an indefinite integral",
      "Subtracting the limits the wrong way round",
      "Reporting a negative area, or netting off above/below the axis when total area was asked for"
    ],
    qUrl: PMT + "integration/"
  },
  pu14: {
    weight: 5,
    marks: "Typically 10-15 marks",
    summary: "Log laws plus an exponential model is a very reliable pairing. The linearising-data question (log y against log x) is a distinctive Edexcel favourite worth practising specifically.",
    core: [
      "The three log laws, and combining several terms into a single logarithm",
      "Solving aˣ = b by taking logs of both sides",
      "Exponential growth/decay models: interpreting a and k in context, finding initial values and rates",
      "Linearising: y = axⁿ gives a straight line for log y against log x; y = kbˣ gives one for log y against x",
      "ln and eˣ as inverses, and equations that are quadratic in eˣ"
    ],
    traps: [
      "Writing log(x + y) = log x + log y, it is not true and it is heavily penalised",
      "Not rejecting solutions that require the log of a negative number or zero",
      "Interpreting the gradient of the linearised plot as the wrong constant, be clear which is n and which is log a"
    ],
    qUrl: PMT + "exponentials-and-logarithms/"
  },

  /* ---------------- STATISTICS ---------------- */
  st1: {
    weight: 3,
    marks: "Typically 4-8 marks",
    summary: "Short, wordy and very scoreable if you learn the definitions precisely. The large data set part rewards familiarity rather than calculation.",
    core: [
      "Definitions: population, sample, sampling unit, sampling frame, census",
      "Naming, describing and carrying out simple random, systematic and stratified sampling",
      "Stratified sample calculations, proportion of each stratum",
      "Advantages and disadvantages of each method, stated in the context of the question",
      "Large data set: the variables, their units, the locations, and terms like 'tr' for trace rainfall"
    ],
    traps: [
      "Giving a generic advantage instead of one tied to the scenario, context is where the mark is",
      "Treating 'tr' or 'n/a' in the large data set as a number",
      "Describing a method without saying how the sample is actually selected"
    ],
    qUrl: PMT + "sampling/"
  },
  st2: {
    weight: 4,
    marks: "Typically 7-12 marks",
    summary: "Standard deviation from summary statistics and linear interpolation for the median are the two calculations that recur most. Coding is the discriminator question.",
    core: [
      "Standard deviation and variance from Σx and Σx², and using calculator stats mode fluently",
      "Linear interpolation for the median and quartiles from a grouped table",
      "Coding y = (x − a)/b, and converting mean and standard deviation back and forth",
      "Comparing two data sets using BOTH a measure of location and a measure of spread, in context"
    ],
    traps: [
      "Adding a constant and thinking it changes the standard deviation, it does not",
      "Comparing two data sets with only the mean and no mention of spread",
      "Using class midpoints for interpolation instead of the class boundaries"
    ],
    qUrl: PMT + "data-presentation-and-interpretation/"
  },
  st3: {
    weight: 4,
    marks: "Typically 8-13 marks",
    summary: "The histogram frequency-density question is a reliable and distinctive earner. Outliers and box plot comparison come up regularly alongside it.",
    core: [
      "Frequency density = frequency ÷ class width, and using AREA to represent frequency",
      "Using a proportion of a bar's area to estimate a frequency between class boundaries",
      "The outlier rule Q1 − 1.5×IQR and Q3 + 1.5×IQR, and the standard-deviation-based alternative",
      "Drawing and comparing box plots, and commenting on skew"
    ],
    traps: [
      "Using bar height rather than area when reading a histogram",
      "Deciding a value is an outlier but never saying whether it should be removed and why",
      "Comparing box plots without referring to the context of the data"
    ],
    qUrl: PMT + "data-presentation-and-interpretation/"
  },
  st4: {
    weight: 2,
    marks: "Typically 4-7 marks",
    summary: "The smallest statistics chapter. Mostly interpretation marks, which makes it cheap if your wording is disciplined.",
    core: [
      "Describing correlation as positive/negative and strong/weak",
      "Interpreting the gradient and intercept of a regression line in context, with units",
      "Interpolation versus extrapolation, and why extrapolation is unreliable",
      "Correlation does not imply causation, and naming a plausible third factor"
    ],
    traps: [
      "Saying 'x causes y' from correlation alone",
      "Interpreting the gradient without units or context",
      "Using the regression line outside the data range without commenting on it"
    ],
    qUrl: PMT + "data-presentation-and-interpretation/"
  },
  st5: {
    weight: 4,
    marks: "Typically 7-12 marks",
    summary: "Venn diagrams and tree diagrams dominate. Testing for independence is the routine discriminator.",
    core: [
      "Filling a Venn diagram from partial information, working outwards from the intersection",
      "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)",
      "Testing independence by checking whether P(A ∩ B) = P(A) × P(B), show the comparison",
      "Tree diagrams, and the difference between sampling with and without replacement"
    ],
    traps: [
      "Putting the total in the intersection instead of the overlap only",
      "Asserting independence without demonstrating the multiplication check",
      "Forgetting the denominator changes on the second branch when sampling without replacement"
    ],
    qUrl: PMT + "probability/"
  },
  st6: {
    weight: 5,
    marks: "Typically 7-11 marks, and it underpins the hypothesis test too",
    summary: "The binomial distribution is the backbone of Paper 2 Section A: it feeds directly into Chapter 7, so weakness here costs you twice.",
    core: [
      "The four conditions for a binomial model, stated in context",
      "X ~ B(n, p) notation and calculating P(X = x)",
      "Calculator cumulative binomial, and translating 'at least / more than / fewer than / at most' into the right form",
      "P(a ≤ X ≤ b) by subtracting cumulative probabilities",
      "Criticising a binomial model by naming a specific assumption that fails in context"
    ],
    traps: [
      "'More than 5' meaning 1 − P(X ≤ 5), not 1 − P(X ≤ 4), off-by-one errors here are extremely common",
      "Listing the binomial conditions generically instead of tied to the scenario",
      "Using P(X = x) when a cumulative probability was needed"
    ],
    qUrl: PMT + "statistical-distributions/"
  },
  st7: {
    weight: 5,
    marks: "Typically 7-12 marks, very often the last and highest-value Stats question",
    summary: "A guaranteed question and highly formulaic, which makes it one of the best marks-per-hour topics on the whole course. Learn the structure and follow it every time.",
    core: [
      "Stating H₀ and H₁ correctly in terms of p",
      "Assuming H₀ true, computing the probability of the observed value or more extreme",
      "Comparing with the significance level and stating reject / do not reject",
      "A full conclusion in context, worded as evidence rather than proof",
      "Finding critical regions, and the actual significance level as the total probability of the region",
      "Two-tailed tests: halve the significance level and test the correct tail"
    ],
    traps: [
      "Concluding 'this proves the claim', it never does; say 'there is sufficient evidence to suggest…'",
      "Forgetting to halve α on a two-tailed test",
      "A conclusion with no reference to the context of the question"
    ],
    qUrl: PMT + "hypothesis-testing/"
  },

  /* ---------------- MECHANICS ---------------- */
  me8: {
    weight: 3,
    marks: "Typically 3-6 marks, usually spread as short parts",
    summary: "Short and definition-heavy. Cheap marks for anyone who has actually learned the modelling vocabulary, which many candidates have not.",
    core: [
      "Standard assumptions and what each buys you: particle, light, inextensible, smooth, rigid",
      "'Light' means mass negligible; 'smooth' means no friction; 'inextensible' means the connected parts share an acceleration",
      "SI base and derived units, and converting km/h to m/s",
      "Scalar versus vector, and using g = 9.8 with answers to 3 s.f."
    ],
    traps: [
      "Stating an assumption without saying what it allows you to ignore",
      "Unit slips, km/h left unconverted",
      "Over-rounding partway and losing the final accuracy mark"
    ],
    qUrl: PMT + "quantities-and-units-in-mechanics/"
  },
  me9: {
    weight: 5,
    marks: "Typically 10-16 marks, the largest Mechanics chapter",
    summary: "The suvat question is guaranteed. Vertical motion under gravity is the most common single scenario in AS Mechanics.",
    core: [
      "All five suvat formulae, and choosing the efficient one from what is given",
      "Vertical motion with g = 9.8: greatest height, time of flight, projection upwards",
      "Choosing a positive direction and keeping signs consistent throughout",
      "Particles thrown from a height that land below the start point, interpret both roots of the quadratic",
      "Velocity-time graphs: gradient = acceleration, area = displacement"
    ],
    traps: [
      "Sign errors on g, the single biggest mark-loser in Mechanics",
      "Taking the negative root of a time without checking whether it is valid",
      "Using suvat when acceleration is not constant (that is Chapter 11)"
    ],
    qUrl: PMT + "kinematics/"
  },
  me10: {
    weight: 5,
    marks: "Typically 12-18 marks, usually the biggest Mechanics question",
    summary: "The connected-particles / pulley question is the classic extended Mechanics item and is where the Mechanics grade is usually decided.",
    core: [
      "F = ma applied to each particle separately, then solved simultaneously",
      "Pulley problems: same tension throughout a light string over a smooth pulley, same magnitude of acceleration",
      "Clear force diagrams showing weight, normal reaction, tension and any applied force",
      "Lift problems and apparent weight (finding R when accelerating)",
      "Tow-bar problems and the force in the connecting rod",
      "What happens after the string breaks or a particle hits the ground"
    ],
    traps: [
      "Inconsistent positive directions between the two particles' equations",
      "Forgetting weight = mg, and using m where mg is needed",
      "After a particle lands, continuing to include the tension, it becomes zero"
    ],
    qUrl: PMT + "forces-and-newtons-laws/"
  },
  me11: {
    weight: 4,
    marks: "Typically 7-12 marks",
    summary: "The calculus-kinematics question is a dependable earner and is largely a Pure differentiation/integration question wearing a Mechanics hat.",
    core: [
      "Differentiate displacement → velocity → acceleration; integrate back the other way",
      "Using initial conditions to find the constant of integration",
      "Maximum/minimum velocity or displacement by setting the derivative to zero",
      "Finding when a particle is instantaneously at rest (v = 0)",
      "Recognising from the question whether calculus or suvat is required"
    ],
    traps: [
      "Using suvat on a variable-acceleration problem, an instant loss of most of the marks",
      "Losing the constant of integration",
      "Confusing 'at rest' (v = 0) with 'at the origin' (s = 0)"
    ],
    qUrl: PMT + "kinematics/"
  },

/* ================= PURE, YEAR 2 ================= */
pu2c1: {
  weight: 4,
  marks: "Typically 6-12 marks, plus partial fractions feeding the integration and binomial questions",
  summary: "Two separate things share this chapter. Proof by contradiction is a short, scripted 4-mark item you can bank. Partial fractions look like a side topic but are actually plumbing for Chapter 4 and Chapter 11: get them fluent and two later questions get easier.",
  core: [
    "Partial fractions with distinct linear factors, substitution method is fastest",
    "Partial fractions with a repeated factor, giving A/(x+a) + B/(x+a)²",
    "Improper fractions: divide first, then split the remainder",
    "Proof by contradiction with the standard scripts (√2 irrational, infinitely many primes)"
  ],
traps: [
  "Not stating the assumption at the start of a contradiction proof, that is a mark on its own",
  "Forgetting the repeated factor needs both A/(x+a) and B/(x+a)², not just the squared term",
  "Splitting an improper fraction without dividing first, which cannot work"
],
qUrl: PMT + "algebra-and-functions/"
},
pu2c2: {
  weight: 4,
  marks: "Typically 8-14 marks",
  summary: "Inverse and composite functions with their domains and ranges are the reliable earners. Most lost marks here are not algebra, they are domain and range statements left out or written the wrong way round.",
  core: [
    "fg(x) means do g first, and its domain comes from g",
    "Finding f⁻¹(x) by rearranging, and knowing domain and range swap with those of f",
    "Sketching y = |f(x)| and y = f(|x|) and knowing which half gets reflected",
    "Solving |f(x)| = g(x), checking each solution back in the original equation",
    "Combined transformations in the correct order"
  ],
traps: [
  "Giving the domain of f⁻¹ as the domain of f instead of its range",
  "Solving a modulus equation without checking for spurious solutions from the reflected branch",
  "Reflecting the wrong part for y = f(|x|), it is the x ≥ 0 side that gets copied over"
],
qUrl: PMT + "algebra-and-functions/"
},
pu2c3: {
  weight: 5,
  marks: "Typically 10-16 marks, a whole question in most series",
  summary: "One of the most predictable questions on the paper. Arithmetic and geometric series come up nearly every series, usually with a modelling wrapper (savings, salaries, depreciation), and the proofs of both sum formulae are explicitly examinable.",
  core: [
    "Sⁿ = n/2(2a + (n−1)d) and the proof by reversing and adding",
    "Geometric nth term and sum, and the proof by multiplying by r and subtracting",
    "Sum to infinity a/(1−r) and stating the condition |r| < 1",
    "Using logs to find n when the term or sum value is given",
    "Sigma notation, including sums that do not start at n = 1"
  ],
traps: [
  "Using n as the number of the term when it is the number of terms, or vice versa",
  "Quoting |r| < 1 as the condition but never actually checking it",
  "Rounding n down when the question asks for the first n exceeding a value, it should go up"
],
qUrl: PMT + "sequences-and-series/"
},
pu2c4: {
  weight: 4,
  marks: "Typically 7-12 marks",
  summary: "A mechanical, high-yield question: expand, state validity, sometimes approximate. The validity statement is a free mark that gets dropped constantly.",
  core: [
    "Expanding (1 + x)ⁿ for negative and fractional n",
    "Taking out aⁿ first to expand (a + bx)ⁿ, this step is where most marks are lost",
    "Stating the range of validity, |x| < 1 or |x| < |a/b|",
    "Splitting into partial fractions first when the expression is a rational function",
    "Substituting a value of x to produce a numerical approximation"
  ],
traps: [
  "Forgetting to raise the factored-out a to the power n as well",
  "Omitting the validity statement entirely",
  "Sign slips in the coefficients when n is negative"
],
qUrl: PMT + "sequences-and-series/"
},
pu2c5: {
  weight: 5,
  marks: "Typically 8-14 marks",
  summary: "Sector and segment area questions are dependable, and radians are the working language of the whole of Year 2 calculus and trigonometry. If you are still thinking in degrees, later chapters will punish you.",
  core: [
    "l = rθ and A = ½r²θ, with θ in radians every time",
    "Segment area as sector minus triangle: ½r²θ − ½r² sin θ",
    "Solving trig equations over an interval given in radians",
    "Exact values at π/6, π/4, π/3 without a calculator",
    "Small angle approximations sin θ ≈ θ, tan θ ≈ θ, cos θ ≈ 1 − θ²/2"
  ],
traps: [
  "Calculator left in degrees, the single most expensive setting error in the whole A level",
  "Using the degree version of the area formula alongside a radian angle",
  "Losing solutions when the interval is transformed for a multiple angle"
],
qUrl: PMT + "trigonometry/"
},
pu2c6: {
  weight: 4,
  marks: "Typically 6-12 marks, and the identities are used throughout Chapter 7",
  summary: "Mostly a supplier chapter. The two derived Pythagorean identities are what let you solve the mixed trig equations that appear in Chapter 7 and in integration.",
  core: [
    "1 + tan²x = sec²x and 1 + cot²x = cosec²x, and deriving both from sin² + cos² = 1",
    "Rewriting an equation in a single trig function before solving",
    "Graphs of sec, cosec and cot with their asymptotes and ranges",
    "arcsin, arccos and arctan with their restricted domains and ranges"
  ],
traps: [
  "Writing sec²x = 1 − tan²x, the sign is the whole point of the identity",
  "Dividing an equation by a trig function and losing the solutions where it is zero",
  "Giving the range of arccos as if it were arcsin"
],
qUrl: PMT + "trigonometry/"
},
pu2c7: {
  weight: 5,
  marks: "Typically 12-18 marks, very often a full question",
  summary: "The heavyweight trigonometry chapter and one of the highest-value in Year 2. Double angles and the R form appear constantly, and R form questions are worth learning as a fixed routine because they always run the same way.",
  core: [
    "Addition formulae and the three forms of cos 2A, picking the right one matters",
    "R cos(x ± α) / R sin(x ± α): R = √(a² + b²), tan α = b/a",
    "Reading maximum and minimum values and where they occur straight off the R form",
    "Reducing a mixed equation to one trig function, then solving over the interval",
    "Proving identities by starting from the messier side"
  ],
traps: [
  "Choosing the wrong form of cos 2A and creating an equation you cannot solve",
  "α outside the range the question specified",
  "Giving the maximum of R cos(x − α) as R but forgetting the question asked when it occurs"
],
qUrl: PMT + "trigonometry/"
},
pu2c8: {
  weight: 4,
  marks: "Typically 8-14 marks",
  summary: "Converting to Cartesian form and differentiating parametrically are the two things asked. The trig-parameter version, eliminated with sin² + cos² = 1, is the most common form.",
  core: [
    "Eliminating the parameter by substitution or with a trig identity",
    "Stating the domain and range that the parameter range forces",
    "dy/dx = (dy/dt)/(dx/dt) for gradients, tangents and normals",
    "Finding where a parametric curve meets the axes or a given line"
  ],
traps: [
  "Giving the Cartesian equation with no domain restriction when the parameter limits it",
  "Inverting the parametric derivative, it is dy/dt over dx/dt, not the other way round",
  "Forgetting that one Cartesian point may come from more than one parameter value"
],
qUrl: PMT + "coordinate-geometry/"
},
pu2c9: {
  weight: 5,
  marks: "Typically 15-25 marks across the paper, the single biggest Pure chapter",
  summary: "The largest and most examined chapter in Year 2. Product, quotient and chain rules turn up inside almost every other question, and implicit differentiation and connected rates are reliable standalone items.",
  core: [
    "Chain, product and quotient rules, including nested together",
    "Derivatives of sin, cos, tan, e^kx and ln x, and the reciprocal trig functions",
    "Implicit differentiation, applying the product rule to xy terms",
    "Parametric differentiation for tangents and normals",
    "Connected rates via dV/dt = dV/dr × dr/dt",
    "Second derivative for concavity, inflection and classifying stationary points"
  ],
traps: [
  "Dropping the inner derivative in the chain rule",
  "Quotient rule numerator written the wrong way round, the order is not symmetric",
  "In implicit differentiation, differentiating a y term without attaching dy/dx",
  "Differentiating trig functions with the calculator or the working in degrees"
],
qUrl: PMT + "differentiation/"
},
pu2c10: {
  weight: 4,
  marks: "Typically 8-12 marks",
  summary: "Method marks are almost free here if you show the working in the expected shape: quote the values, state continuity, state the conclusion. Newton-Raphson is the part most likely to be asked to be explained rather than just executed.",
  core: [
    "Change of sign: evaluate at both ends, note the sign change, state the function is continuous",
    "Iterative formulae from a rearrangement, quoting terms to the required accuracy",
    "Newton-Raphson x_{n+1} = x_n − f(x_n)/f′(x_n), differentiating correctly first",
    "Explaining why a method fails, turning point, f′(x) = 0, or a discontinuity",
    "Cobweb and staircase diagrams and identifying divergence"
  ],
traps: [
  "Omitting the words 'continuous' and 'change of sign' from the justification",
  "Rounding intermediate iterates and losing the required accuracy",
  "Showing a root to 3 d.p. by evaluating at the root instead of at the bounds of the rounding interval"
],
qUrl: PMT + "differentiation/"
},
pu2c11: {
  weight: 5,
  marks: "Typically 18-28 marks across the paper, rivals differentiation for size",
  summary: "The chapter with the most techniques to keep straight. Recognising which method a given integral wants is the actual skill, substitution, parts, partial fractions or reverse chain rule, and differential equations are a near-guaranteed extended question.",
  core: [
    "Reverse chain rule: f′(x)/f(x) → ln|f(x)|, and f′(x)(f(x))ⁿ",
    "Integration by substitution, changing the limits for a definite integral",
    "Integration by parts, and the ln x trick of taking the second function as 1",
    "Partial fractions → sum of logs → combined with log laws",
    "Separating variables in a differential equation and using a boundary condition",
    "Trapezium rule, with a justified over/underestimate statement",
    "Areas between curves and under parametric curves"
  ],
traps: [
  "Losing the constant of integration in a differential equation, which wrecks the boundary condition",
  "Not changing the limits after a substitution in a definite integral",
  "Forgetting the modulus in ln|x|",
  "Saying the trapezium rule overestimates without referring to the curve's concavity"
],
qUrl: PMT + "integration/"
},
pu2c12: {
  weight: 3,
  marks: "Typically 5-10 marks",
  summary: "The smallest Year 2 pure chapter and mostly an extension of Year 1 vectors into a third component. Magnitudes, unit vectors and collinearity are the recurring asks.",
  core: [
    "Magnitude in 3D as √(x² + y² + z²), and distance between two points",
    "Unit vectors, and angles a vector makes with each axis",
    "Position vectors and the vector joining two points",
    "Proving collinearity by showing two vectors are parallel and share a point"
  ],
traps: [
  "Proving two vectors are parallel and calling that collinear without a common point",
  "Sign errors forming the vector between two points, it is the destination minus the start",
  "Forgetting to divide by the magnitude when a unit vector is asked for"
],
qUrl: PMT + "vectors/"
},

/* ================= STATISTICS, YEAR 2 ================= */
st2c1: {
  weight: 4,
  marks: "Typically 8-13 marks",
  summary: "The hypothesis test for zero correlation is a short scripted routine with a table lookup, one of the most reliable marks on Paper 3. The log-linearising half connects straight back to Year 1 exponentials.",
  core: [
    "Hypotheses stated in terms of ρ, the population correlation coefficient",
    "Reading the critical value from the PMCC table using n and the significance level",
    "Halving the significance level for a two-tailed test",
    "Linearising y = axⁿ with log y against log x, and y = kbˣ with log y against x",
    "Reading a and n (or k and b) from the gradient and intercept",
    "A conclusion written in the context of the data"
  ],
traps: [
  "Stating the hypotheses in terms of r instead of ρ",
  "Comparing |r| with a critical value without halving α on a two-tailed test",
  "Concluding 'there is correlation' rather than 'there is evidence of correlation' in context",
  "Claiming causation from correlation"
],
qUrl: PMT + "hypothesis-testing/"
},
st2c2: {
  weight: 4,
  marks: "Typically 8-14 marks",
  summary: "Venn diagrams with a conditional probability at the end are the standard shape. Filling the diagram from the intersection outwards is the technique that makes the rest fall out.",
  core: [
    "P(A|B) = P(A ∩ B)/P(B), and using it in both directions",
    "Filling a Venn diagram starting from the intersection",
    "Testing independence by checking P(A ∩ B) = P(A)P(B) with an explicit calculation",
    "Tree diagrams with conditional branches, with and without replacement",
    "Set notation translated to and from words"
  ],
traps: [
  "Dividing by the wrong probability in the conditional formula, the condition goes on the bottom",
  "Asserting independence without showing the multiplication check",
  "Confusing mutually exclusive with independent, they are nearly opposites"
],
qUrl: PMT + "probability/"
},
st2c3: {
  weight: 5,
  marks: "Typically 12-18 marks, usually the largest Statistics question",
  summary: "The biggest Statistics topic in Year 2 and near-certain to appear. Finding μ and σ from two probabilities via simultaneous equations in Z is the classic high-mark item.",
  core: [
    "Normal probabilities and inverse normal on the calculator",
    "Standardising with Z = (X − μ)/σ",
    "Two given probabilities → two Z equations → simultaneous solve for μ and σ",
    "Normal approximation to the binomial with μ = np, σ² = np(1−p), plus a continuity correction",
    "Hypothesis test on a sample mean using X̄ ~ N(μ, σ²/n)"
  ],
traps: [
  "Continuity correction applied the wrong way, check whether the inequality is strict",
  "Using σ instead of σ/√n in a test on a sample mean",
  "Reading the inverse normal for the upper tail without converting to the lower tail first",
  "Mixing up σ and σ² in the N(μ, σ²) notation"
],
qUrl: PMT + "statistical-distributions/"
},

/* ================= MECHANICS, YEAR 2 ================= */
me2c4: {
  weight: 4,
  marks: "Typically 8-14 marks",
  summary: "The rod-on-two-supports question is a fixed template: resolve vertically, take moments about a support to kill an unknown, solve. Tilting problems are the same template with one reaction set to zero.",
  core: [
    "Moment = force × perpendicular distance, with a stated sense",
    "Equilibrium of a rigid body: zero resultant force and zero resultant moment",
    "Choosing the pivot to eliminate the unknown you do not want",
    "Non-uniform rods with the centre of mass at an unknown distance",
    "On the point of tilting ⇒ the reaction at the far support is zero"
  ],
traps: [
  "Using the slant distance instead of the perpendicular distance",
  "Forgetting the weight of the rod itself acts at its centre of mass",
  "Setting the wrong reaction to zero in a tilting problem"
],
qUrl: PMT + "forces-and-newtons-laws/"
},
me2c5: {
  weight: 5,
  marks: "Typically 12-18 marks",
  summary: "Rough inclined planes are the backbone of Year 2 Mechanics. Almost every question starts the same way: resolve perpendicular to the plane for R, then use F = μR along it.",
  core: [
    "Resolving weight into mg sin θ down the slope and mg cos θ perpendicular to it",
    "F ≤ μR, with equality only in limiting equilibrium or while moving",
    "Finding R first, everything else depends on it",
    "Applied forces at an angle, which change R and therefore change the friction",
    "Deciding whether a body actually moves by comparing required friction with the maximum"
  ],
traps: [
  "Swapping sin and cos when resolving on the slope",
  "Using R = mg on an inclined plane, it is not, and this invalidates the friction",
  "Using F = μR when the body is in equilibrium but not on the point of moving"
],
qUrl: PMT + "forces-and-newtons-laws/"
},
me2c6: {
  weight: 5,
  marks: "Typically 10-16 marks",
  summary: "Projectiles are highly predictable and worth drilling to a routine: split into horizontal and vertical, horizontal velocity constant, vertical acceleration −g, then suvat on each independently.",
  core: [
    "Resolving initial velocity into U cos α and U sin α",
    "Horizontal: constant velocity. Vertical: a = −9.8. Never mix them",
    "Greatest height by setting the vertical component of velocity to zero",
    "Time of flight, range, and landing above or below the launch level",
    "Speed and direction at an instant from the two components"
  ],
traps: [
  "Applying g to the horizontal motion",
  "Taking the wrong root of the quadratic in t when the projectile lands below its start",
  "Giving the speed as one component instead of the resultant of both"
],
qUrl: PMT + "kinematics/"
},
me2c7: {
  weight: 5,
  marks: "Typically 14-20 marks, often the longest Mechanics question",
  summary: "This chapter combines everything: friction, inclined planes, moments and connected particles. The ladder problem is the signature item and needs both force equilibrium and moment equilibrium together.",
  core: [
    "Ladder problems: resolve horizontally and vertically, then take moments about the base",
    "Limiting equilibrium on a rough slope and the least force needed to move a body",
    "F = ma along an inclined plane including friction, then suvat for the motion",
    "Connected particles where one sits on a rough inclined plane",
    "Stating and using the modelling assumptions"
  ],
traps: [
  "Forgetting friction at the wall when the question says the wall is rough",
  "Taking moments about a point that leaves two unknowns in the equation",
  "Keeping the tension in the equations after the string goes slack"
],
qUrl: PMT + "forces-and-newtons-laws/"
},
me2c8: {
  weight: 4,
  marks: "Typically 8-14 marks",
  summary: "Largely Pure calculus in a Mechanics context, extended into vectors. Differentiating and integrating component by component is the whole technique.",
  core: [
    "Differentiate r → v → a, integrate back the other way, component by component",
    "A vector constant of integration, found from the initial conditions",
    "suvat in vector form for constant acceleration in 2D",
    "When a particle moves in a stated direction, set the appropriate component to zero",
    "Total distance travelled, splitting the interval where velocity changes sign"
  ],
traps: [
  "A scalar constant of integration where a vector is needed",
  "Confusing distance with displacement when the direction reverses",
  "Using suvat when the acceleration is a function of t"
],
qUrl: PMT + "kinematics/"
  }
};

/* Merge chapter exam data into the active spec, and build a chapter index.
   Rebuilt on every subject switch, so these are `let`. */
const CHAPTER_PREFIX = "ch:";
let EXAM_FOCUS = {};
let CHAPTER_INDEX = {};
let ALL_CHAPTER_IDS = [];

function buildChapterIndex(spec, focus) {
  const map = {};
  spec.forEach(function (paper) {
    paper.sections.forEach(function (sec) {
      sec.exam = focus[sec.id] || null;
      const id = CHAPTER_PREFIX + sec.id;
      const mins = chapterMinutes(sec);
      /* Maths restarts chapter numbers each year, so its labels carry the
         year. Subjects whose section numbers are already unique (Economics
         1.1, 1.2, ...) read better without it. */
      const flat = !!sec.flatNumbering;
      const yr = sec.year || 1;
      map[id] = {
        id: id, chapter: sec, paper: paper, year: yr,
        sub: {
          id: id,
          code: flat ? sec.num : "Ch " + sec.num,
          year: yr,
          name: sec.name,
          reqs: sec.exam ? sec.exam.core : sec.subs.map(function (s) { return s.name; }),
          traps: sec.exam ? sec.exam.traps : [],
          summary: sec.exam ? sec.exam.summary : sec.desc,
          marks: sec.exam ? sec.exam.marks : "",
          qUrl: sec.exam ? sec.exam.qUrl : "",
          importance: sec.exam ? sec.exam.weight : 3,
          vid: mins.vid, qs: mins.qs,
          isChapter: true,
          sectionIds: sec.subs.map(function (s) { return s.id; })
        },
        section: sec, paper_: paper,
        chapterLabel: chapterLabelFor(sec),
        path: paper.short + " / " + (flat ? sec.num : "Y" + yr + " Ch " + sec.num),
        fullName: flat ? sec.num + " " + sec.name
                       : "Y" + yr + " Chapter " + sec.num + ", " + sec.name
      };
    });
  });
  return map;
}

/* A chapter session is a summary + a mixed question set, deliberately
   not the sum of its sections, which would defeat the point. */
function chapterMinutes(sec) {
  const n = sec.subs.length;
  return {
    vid: Math.min(50, 18 + n * 3), // one chapter summary video
    qs: Math.min(75, 30 + n * 4) // a mixed exam-question set for the chapter
  };
}

/* Which chapter does a section belong to? */
function chapterIdForSub(subId) {
  const inf = SPEC_INDEX[subId];
  if (!inf) return null;
  return CHAPTER_PREFIX + inf.section.id;
}

function isChapterId(id) { return typeof id === "string" && id.indexOf(CHAPTER_PREFIX) === 0; }
