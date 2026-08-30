/* ============================================================
   Edexcel AS Mathematics (8MA0) — chapter-by-chapter database
   ------------------------------------------------------------
   Structured to match the Pearson Edexcel AS/A level Mathematics
   Year 1/AS student books, which are the chapter divisions the
   specification is taught and revised in (and the ones chapter
   summary videos follow):

     Pure Mathematics Year 1/AS ............ Chapters 1–14
     Statistics & Mechanics Year 1/AS ...... Chapters 1–7  (Statistics)
                                             Chapters 8–11 (Mechanics)

   Paper 1 (8MA0/01) Pure Mathematics       2h,    100 marks
   Paper 2 (8MA0/02) Statistics & Mechanics 1h15,   60 marks

   ACCURACY NOTE
   The Year 1/AS books contain the AS content and nothing more, so
   this chapter list *is* the examinable AS specification. Topics
   often assumed to be AS but which live in the Year 2 books and are
   NOT examinable on 8MA0 are listed at the end of the Pure chapters,
   flagged y2:true, and excluded from the schedule by default:
     arithmetic & geometric series, sigma notation, recurrence
     relations; radians, arc length/sector area, small angle
     approximations; sec/cosec/cot, compound & double angles,
     R sin(x+a); composite/inverse functions and the modulus
     function; proof by contradiction.
   ============================================================ */

/* importance: 1 = niche, 5 = appears on virtually every paper */

const SPEC = [
{
  id: "pure", paper: "Pure", short: "Pure",
  name: "Paper 1 — Pure Mathematics", code: "8MA0/01",
  book: "Pure Mathematics Year 1/AS",
  examMinutes: 120, marks: 100,
  sections: [

    { id: "pu1", num: "1", name: "Algebraic Expressions",
      desc: "Indices, expanding, factorising and surds — the manipulation every other chapter depends on.",
      subs: [
        { id:"pu1-1", code:"1.1", name:"Index laws", importance:5, vid:14, qs:26, reqs:[
          "Know and use the laws of indices: a^m × a^n = a^(m+n), a^m ÷ a^n = a^(m-n), (a^m)^n = a^(mn)",
          "Simplify expressions combining several index laws",
          "Simplify products and quotients such as (2x^2)^3 × 4x^-1",
          "Know that a^0 = 1" ]},
        { id:"pu1-2", code:"1.2", name:"Expanding brackets", importance:4, vid:12, qs:24, reqs:[
          "Expand a single bracket and collect like terms",
          "Expand the product of two brackets",
          "Expand the product of three or more brackets",
          "Expand expressions involving indices and negative terms accurately" ]},
        { id:"pu1-3", code:"1.3", name:"Factorising", importance:5, vid:16, qs:30, reqs:[
          "Factorise by taking out a common factor",
          "Factorise quadratic expressions, including where the coefficient of x^2 is not 1",
          "Factorise using the difference of two squares",
          "Factorise cubic expressions by first taking out a common factor",
          "Factorise expressions that are quadratic in a function of x" ]},
        { id:"pu1-4", code:"1.4", name:"Negative and fractional indices", importance:5, vid:16, qs:30, reqs:[
          "Understand a^-n = 1/a^n and interpret negative indices as reciprocals",
          "Understand a^(1/n) as the nth root and a^(m/n) as (nth root of a)^m",
          "Use the laws of indices for all rational exponents",
          "Convert between root/fraction form and index form before differentiating or integrating" ]},
        { id:"pu1-5", code:"1.5", name:"Surds", importance:4, vid:14, qs:26, reqs:[
          "Understand that a surd is an exact irrational root",
          "Simplify surds into the form a(root b)",
          "Multiply, divide and simplify expressions containing surds",
          "Expand brackets containing surds and collect terms",
          "Give exact answers in surd form rather than rounding" ]},
        { id:"pu1-6", code:"1.6", name:"Rationalising denominators", importance:4, vid:14, qs:26, reqs:[
          "Rationalise a denominator of the form 1/(root a)",
          "Rationalise a denominator of the form 1/(a + b root c) using the conjugate",
          "Simplify the result fully into the required form",
          "Recognise when rationalising is required by the question" ]}
      ]},

    { id: "pu2", num: "2", name: "Quadratics",
      desc: "Solving, completing the square, the discriminant, graphs and quadratic models.",
      subs: [
        { id:"pu2-1", code:"2.1", name:"Solving quadratic equations", importance:5, vid:18, qs:32, reqs:[
          "Solve quadratic equations by factorising",
          "Solve quadratic equations using the quadratic formula",
          "Solve equations that are quadratic in a function of x (in x^2, root x, e^x, sin x)",
          "Give answers in exact surd form where required" ]},
        { id:"pu2-2", code:"2.2", name:"Completing the square", importance:5, vid:20, qs:34, reqs:[
          "Write ax^2 + bx + c in the form a(x + p)^2 + q",
          "Handle a leading coefficient other than 1 correctly",
          "Solve a quadratic equation by completing the square",
          "Use the completed square form to find the turning point and line of symmetry",
          "Use completing the square to prove a quadratic is always positive/negative" ]},
        { id:"pu2-3", code:"2.3", name:"Functions", importance:3, vid:14, qs:26, reqs:[
          "Use function notation f(x), evaluate f(a) and solve f(x) = 0",
          "Understand the terms domain and range for simple functions",
          "Understand roots of a function as the solutions of f(x) = 0",
          "Substitute into functions defined with fractional or negative indices" ]},
        { id:"pu2-4", code:"2.4", name:"Quadratic graphs", importance:4, vid:16, qs:28, reqs:[
          "Sketch a quadratic graph showing the shape, roots, y-intercept and turning point",
          "Relate the sign of a to the orientation of the parabola",
          "Find the turning point from the completed square form or by symmetry",
          "Interpret the graph to solve related equations" ]},
        { id:"pu2-5", code:"2.5", name:"The discriminant", importance:5, vid:16, qs:30, reqs:[
          "Know that the discriminant is b^2 − 4ac",
          "Know that b^2 − 4ac > 0 gives two distinct real roots, = 0 gives one repeated root, < 0 gives no real roots",
          "Use the discriminant to find unknown coefficients or a range of values of k",
          "Interpret the discriminant graphically in terms of crossing, touching or missing the x-axis" ]},
        { id:"pu2-6", code:"2.6", name:"Modelling with quadratics", importance:3, vid:14, qs:26, reqs:[
          "Set up a quadratic model from a described situation",
          "Interpret the turning point in context, such as maximum height or minimum cost",
          "Interpret the roots in context, such as when a projectile hits the ground",
          "Comment on the limitations of a quadratic model" ]}
      ]},

    { id: "pu3", num: "3", name: "Equations and Inequalities",
      desc: "Simultaneous equations, linear and quadratic inequalities, and shaded regions.",
      subs: [
        { id:"pu3-1", code:"3.1", name:"Linear simultaneous equations", importance:3, vid:12, qs:22, reqs:[
          "Solve two linear simultaneous equations by elimination",
          "Solve two linear simultaneous equations by substitution",
          "Interpret the solution as the point of intersection of two lines" ]},
        { id:"pu3-2", code:"3.2", name:"Quadratic simultaneous equations", importance:4, vid:16, qs:30, reqs:[
          "Solve one linear and one quadratic simultaneous equation by substitution",
          "Obtain both pairs of solutions and pair the x and y values correctly",
          "Substitute back to check the solutions satisfy both equations" ]},
        { id:"pu3-3", code:"3.3", name:"Simultaneous equations on graphs", importance:4, vid:16, qs:28, reqs:[
          "Interpret solutions of simultaneous equations as points of intersection",
          "Use the discriminant of the resulting quadratic to determine whether a line and curve intersect at two points, are tangent, or do not meet",
          "Find the value of k for which a line is a tangent to a curve" ]},
        { id:"pu3-4", code:"3.4", name:"Linear inequalities", importance:3, vid:12, qs:22, reqs:[
          "Solve linear inequalities, reversing the sign when multiplying or dividing by a negative",
          "Solve inequalities with the unknown on both sides",
          "Express the solution using set notation and interval notation",
          "Solve two linear inequalities simultaneously and combine the solution sets" ]},
        { id:"pu3-5", code:"3.5", name:"Quadratic inequalities", importance:5, vid:18, qs:32, reqs:[
          "Solve a quadratic inequality by factorising and using a sketch or sign diagram",
          "Give the solution as a single interval or a union of two intervals as appropriate",
          "Use correct set and interval notation, including strict and non-strict inequalities",
          "Combine a quadratic inequality with the discriminant to find a range of values of k" ]},
        { id:"pu3-6", code:"3.6", name:"Inequalities on graphs", importance:3, vid:12, qs:22, reqs:[
          "Interpret inequalities graphically as the regions where one curve is above or below another",
          "Read the solution set of f(x) > g(x) from a sketch",
          "Identify the critical values from the points of intersection" ]},
        { id:"pu3-7", code:"3.7", name:"Regions", importance:2, vid:12, qs:22, reqs:[
          "Shade regions defined by linear and quadratic inequalities",
          "Use a dashed line for strict inequalities and a solid line for non-strict ones",
          "Identify the region satisfying several inequalities simultaneously",
          "Determine whether a given point lies in the shaded region" ]}
      ]},

    { id: "pu4", num: "4", name: "Graphs and Transformations",
      desc: "Cubic, quartic and reciprocal graphs, intersections, translations and stretches.",
      subs: [
        { id:"pu4-1", code:"4.1", name:"Cubic graphs", importance:4, vid:16, qs:30, reqs:[
          "Sketch cubic graphs given in factorised form, showing roots and the y-intercept",
          "Know the shape of a cubic for positive and negative leading coefficients",
          "Understand the effect of a repeated root (the curve touches the axis) and a triple root",
          "Factorise a cubic first where necessary in order to sketch it" ]},
        { id:"pu4-2", code:"4.2", name:"Quartic graphs", importance:2, vid:12, qs:22, reqs:[
          "Sketch quartic graphs given in factorised form",
          "Know the shape of a quartic for positive and negative leading coefficients",
          "Show roots, repeated roots and the y-intercept correctly" ]},
        { id:"pu4-3", code:"4.3", name:"Reciprocal graphs", importance:3, vid:12, qs:24, reqs:[
          "Sketch y = a/x and y = a/x^2 and know their shapes in each quadrant",
          "Identify the asymptotes x = 0 and y = 0 and show them on a sketch",
          "Describe the behaviour of the curve as x approaches the asymptotes" ]},
        { id:"pu4-4", code:"4.4", name:"Points of intersection", importance:4, vid:16, qs:30, reqs:[
          "Find the points of intersection of two curves, or a line and a curve, algebraically",
          "Sketch two graphs on the same axes and deduce the number of intersections",
          "Use points of intersection to solve equations and inequalities graphically" ]},
        { id:"pu4-5", code:"4.5", name:"Translating graphs", importance:4, vid:16, qs:28, reqs:[
          "Understand y = f(x + a) as a translation by the vector (-a, 0)",
          "Understand y = f(x) + a as a translation by the vector (0, a)",
          "Sketch the image of a curve after a translation, showing new roots, intercepts and asymptotes",
          "Describe a translation precisely using vector notation" ]},
        { id:"pu4-6", code:"4.6", name:"Stretching graphs", importance:4, vid:16, qs:28, reqs:[
          "Understand y = af(x) as a vertical stretch with scale factor a",
          "Understand y = f(ax) as a horizontal stretch with scale factor 1/a",
          "Understand y = -f(x) and y = f(-x) as reflections in the x- and y-axes",
          "Sketch the image and give the coordinates of transformed key points" ]},
        { id:"pu4-7", code:"4.7", name:"Transforming functions", importance:4, vid:18, qs:32, reqs:[
          "Apply combinations of translations, stretches and reflections in the correct order",
          "Find the image of a specific point, root, turning point or asymptote",
          "Given a transformed sketch, write down the equation of the new curve",
          "Describe a sequence of transformations fully" ]}
      ]},

    { id: "pu5", num: "5", name: "Straight Line Graphs",
      desc: "Gradients, equations of lines, parallel and perpendicular lines, length, area and modelling.",
      subs: [
        { id:"pu5-1", code:"5.1", name:"y = mx + c", importance:4, vid:12, qs:24, reqs:[
          "Understand the gradient m and the y-intercept c",
          "Convert between y = mx + c and ax + by + c = 0",
          "Find the gradient and intercepts from either form",
          "Find where a line crosses the x-axis and the y-axis" ]},
        { id:"pu5-2", code:"5.2", name:"Equations of straight lines", importance:5, vid:16, qs:30, reqs:[
          "Use y - y1 = m(x - x1) to find the equation of a line through a point with a given gradient",
          "Find the equation of the line through two given points",
          "Give the equation in the form required by the question, including integer coefficients",
          "Find the gradient from two points using (y2 - y1)/(x2 - x1)" ]},
        { id:"pu5-3", code:"5.3", name:"Parallel and perpendicular lines", importance:5, vid:16, qs:30, reqs:[
          "Know that parallel lines have equal gradients",
          "Know that perpendicular gradients satisfy m1 × m2 = −1",
          "Find the equation of a line perpendicular to a given line through a given point",
          "Find the equation of a perpendicular bisector of a line segment",
          "Prove that two lines are perpendicular" ]},
        { id:"pu5-4", code:"5.4", name:"Length and area", importance:4, vid:14, qs:28, reqs:[
          "Find the distance between two points using Pythagoras",
          "Find the midpoint of a line segment",
          "Find the area of a triangle or quadrilateral defined by coordinates",
          "Solve problems combining lengths, areas and equations of lines" ]},
        { id:"pu5-5", code:"5.5", name:"Modelling with straight lines", importance:3, vid:14, qs:26, reqs:[
          "Interpret the gradient and intercept of a linear model in context, with units",
          "Use a linear model to make predictions",
          "Comment on the reliability of the model and the danger of extrapolation" ]}
      ]},

    { id: "pu6", num: "6", name: "Circles",
      desc: "The equation of a circle, intersections with lines, and tangent, chord and triangle properties.",
      subs: [
        { id:"pu6-1", code:"6.1", name:"Midpoints and perpendicular bisectors", importance:3, vid:12, qs:24, reqs:[
          "Find the midpoint of a line segment",
          "Find the equation of the perpendicular bisector of a chord",
          "Use perpendicular bisectors to find the centre of a circle" ]},
        { id:"pu6-2", code:"6.2", name:"Equation of a circle", importance:5, vid:18, qs:32, reqs:[
          "Know and use (x − a)^2 + (y − b)^2 = r^2 for centre (a, b) and radius r",
          "Complete the square to convert x^2 + y^2 + 2fx + 2gy + c = 0 into centre-radius form",
          "Write down the centre and radius from either form",
          "Determine whether a point lies inside, on or outside a circle" ]},
        { id:"pu6-3", code:"6.3", name:"Intersections of straight lines and circles", importance:4, vid:16, qs:30, reqs:[
          "Find the points of intersection of a line and a circle algebraically",
          "Use the discriminant to decide whether a line intersects, is tangent to, or misses a circle",
          "Find the value of k for which a line is a tangent to a circle" ]},
        { id:"pu6-4", code:"6.4", name:"Use tangent and chord properties", importance:5, vid:18, qs:32, reqs:[
          "Know that the tangent is perpendicular to the radius at the point of contact",
          "Know that the perpendicular from the centre to a chord bisects the chord",
          "Find the equation of a tangent or normal to a circle at a given point",
          "Find the length of a tangent from an external point" ]},
        { id:"pu6-5", code:"6.5", name:"Circles and triangles", importance:3, vid:14, qs:26, reqs:[
          "Know that the angle in a semicircle is a right angle",
          "Find the centre of a circle through three given points",
          "Find the equation of the circumcircle of a triangle",
          "Use the converse of the angle in a semicircle to identify a diameter" ]}
      ]},

    { id: "pu7", num: "7", name: "Algebraic Methods",
      desc: "Algebraic fractions, polynomial division, the factor theorem and mathematical proof.",
      subs: [
        { id:"pu7-1", code:"7.1", name:"Algebraic fractions", importance:3, vid:14, qs:26, reqs:[
          "Simplify algebraic fractions by factorising the numerator and denominator and cancelling",
          "Multiply and divide algebraic fractions",
          "Add and subtract algebraic fractions using a common denominator" ]},
        { id:"pu7-2", code:"7.2", name:"Dividing polynomials", importance:4, vid:16, qs:30, reqs:[
          "Divide a polynomial by a linear expression using algebraic long division",
          "Identify the quotient and the remainder",
          "Divide by inspection where it is quicker",
          "Write f(x) in the form (x - a)Q(x) + r" ]},
        { id:"pu7-3", code:"7.3", name:"The factor theorem", importance:5, vid:18, qs:32, reqs:[
          "Know and use the factor theorem: (x - a) is a factor of f(x) if and only if f(a) = 0",
          "Use the factor theorem to show a given expression is a factor",
          "Fully factorise a cubic using the factor theorem and division",
          "Find unknown coefficients given a stated factor or root",
          "Solve the resulting cubic equation and sketch the curve" ]},
        { id:"pu7-4", code:"7.4", name:"Mathematical proof", importance:4, vid:16, qs:30, reqs:[
          "Understand and use the structure of a mathematical proof, from given assumptions through logical steps to a conclusion",
          "Use correct notation and logical language, and state the conclusion clearly",
          "Prove identities by manipulating one side into the other",
          "Prove results about odd, even and consecutive integers using algebra" ]},
        { id:"pu7-5", code:"7.5", name:"Methods of proof", importance:4, vid:16, qs:30, reqs:[
          "Use proof by deduction",
          "Use proof by exhaustion by splitting into a complete, finite set of cases",
          "Use disproof by counter-example, knowing that one counter-example is enough",
          "Choose an appropriate method of proof for a given statement" ]}
      ]},

    { id: "pu8", num: "8", name: "The Binomial Expansion",
      desc: "Pascal's triangle, factorial and nCr notation, expansions, individual terms and estimation.",
      subs: [
        { id:"pu8-1", code:"8.1", name:"Pascal's triangle", importance:3, vid:12, qs:24, reqs:[
          "Use Pascal's triangle to write down the coefficients for small positive integer n",
          "Expand (a + b)^n for small n using Pascal's triangle",
          "Understand the link between the rows of Pascal's triangle and binomial coefficients" ]},
        { id:"pu8-2", code:"8.2", name:"Factorial notation", importance:4, vid:12, qs:24, reqs:[
          "Understand and use n! and know that 0! = 1",
          "Understand and use the notations nCr and the binomial coefficient",
          "Evaluate nCr by formula and using a calculator",
          "Simplify expressions involving factorials" ]},
        { id:"pu8-3", code:"8.3", name:"The binomial expansion", importance:5, vid:20, qs:36, reqs:[
          "Expand (a + bx)^n for positive integer n using the binomial theorem",
          "Deal correctly with negative and fractional values of b and with powers of the coefficient",
          "Expand expressions such as (2 - 3x)^5 and simplify fully",
          "State the first few terms in ascending powers of x" ]},
        { id:"pu8-4", code:"8.4", name:"Solving binomial problems", importance:5, vid:18, qs:34, reqs:[
          "Find the coefficient of a specific term without carrying out the full expansion",
          "Find the term in x^k",
          "Find unknown constants given a stated coefficient",
          "Solve problems where two expansions are multiplied together" ]},
        { id:"pu8-5", code:"8.5", name:"Binomial estimation", importance:3, vid:14, qs:26, reqs:[
          "Use a binomial expansion to find an approximation, for example for (1.02)^8",
          "Choose a suitable value of x to substitute",
          "Comment on the accuracy of the approximation and why it is valid only for small x" ]}
      ]},

    { id: "pu9", num: "9", name: "Trigonometric Ratios",
      desc: "The sine and cosine rules, areas of triangles, and the graphs of sin, cos and tan.",
      subs: [
        { id:"pu9-1", code:"9.1", name:"The cosine rule", importance:4, vid:16, qs:30, reqs:[
          "Know and use the cosine rule a^2 = b^2 + c^2 - 2bc cos A",
          "Use the cosine rule to find an unknown side",
          "Rearrange the cosine rule to find an unknown angle",
          "Recognise when the cosine rule is the appropriate rule to use" ]},
        { id:"pu9-2", code:"9.2", name:"The sine rule", importance:4, vid:16, qs:30, reqs:[
          "Know and use the sine rule a/sin A = b/sin B",
          "Use the sine rule to find an unknown side or angle",
          "Understand and handle the ambiguous case where two angles are possible",
          "Decide which rule to use from the information given" ]},
        { id:"pu9-3", code:"9.3", name:"Areas of triangles", importance:3, vid:12, qs:24, reqs:[
          "Know and use the area formula ½ab sin C",
          "Find an unknown side or angle given the area",
          "Combine the area formula with the sine and cosine rules" ]},
        { id:"pu9-4", code:"9.4", name:"Solving triangle problems", importance:4, vid:18, qs:32, reqs:[
          "Solve multi-step problems using the sine rule, cosine rule and area formula together",
          "Apply these to bearings and to problems set in context",
          "Work with triangles in simple three-dimensional situations",
          "Give answers to an appropriate degree of accuracy" ]},
        { id:"pu9-5", code:"9.5", name:"Graphs of sine, cosine and tangent", importance:4, vid:16, qs:28, reqs:[
          "Sketch y = sin x, y = cos x and y = tan x for any interval in degrees",
          "Know the period, amplitude and symmetry of each graph",
          "Know the asymptotes of the tangent graph",
          "Read the number of solutions of an equation from a sketch" ]},
        { id:"pu9-6", code:"9.6", name:"Transforming trigonometric graphs", importance:4, vid:16, qs:28, reqs:[
          "Apply translations and stretches to trigonometric graphs",
          "Sketch curves such as y = a sin(bx) + c and y = cos(x + d)",
          "State the amplitude and period of a transformed trigonometric graph",
          "Find the coordinates of maximum and minimum points after a transformation" ]}
      ]},

    { id: "pu10", num: "10", name: "Trigonometric Identities and Equations",
      desc: "The four quadrants, exact values, identities, and solving trigonometric equations.",
      subs: [
        { id:"pu10-1", code:"10.1", name:"Angles in all four quadrants", importance:4, vid:16, qs:30, reqs:[
          "Use the unit circle and the CAST diagram to determine the sign of each ratio in each quadrant",
          "Find all angles in a given interval with a given sine, cosine or tangent",
          "Use the symmetry of the trigonometric graphs to find further solutions",
          "Work with negative angles and angles greater than 360 degrees" ]},
        { id:"pu10-2", code:"10.2", name:"Exact values of trigonometrical ratios", importance:4, vid:12, qs:24, reqs:[
          "Know exact values of sin, cos and tan for 0, 30, 45, 60 and 90 degrees",
          "Know exact values for multiples of these angles using the quadrants",
          "Give answers in exact surd form",
          "Know that tan 90 degrees is undefined" ]},
        { id:"pu10-3", code:"10.3", name:"Trigonometric identities", importance:5, vid:18, qs:32, reqs:[
          "Know and use tanθ = sinθ / cosθ",
          "Know and use sin^2θ + cos^2θ = 1",
          "Use the identities to simplify expressions and prove further identities",
          "Rearrange the Pythagorean identity into the form needed" ]},
        { id:"pu10-4", code:"10.4", name:"Simple trigonometric equations", importance:5, vid:18, qs:32, reqs:[
          "Solve equations of the form sin x = k, cos x = k and tan x = k in a given interval",
          "Give all solutions in the interval, not just the calculator value",
          "Use the graph or CAST to generate the full solution set",
          "Recognise when there are no solutions" ]},
        { id:"pu10-5", code:"10.5", name:"Harder trigonometric equations", importance:5, vid:22, qs:38, reqs:[
          "Solve equations of the form sin(kx + a) = c by adjusting the interval correctly",
          "Transform the interval, solve, then transform back",
          "Ensure no solutions are lost when the interval is widened",
          "Solve equations involving a multiple angle in context" ]},
        { id:"pu10-6", code:"10.6", name:"Equations and identities", importance:5, vid:20, qs:36, reqs:[
          "Use an identity to reduce an equation to a single trigonometric function",
          "Solve equations such as 3 sin x = 2 cos x by dividing to obtain tan x",
          "Solve quadratic trigonometric equations such as 2 sin^2 x + 3 sin x - 2 = 0",
          "Use sin^2 + cos^2 = 1 to convert an equation before solving",
          "Reject solutions that fall outside the given interval or are impossible" ]}
      ]},

    { id: "pu11", num: "11", name: "Vectors",
      desc: "Vector notation, magnitude and direction, position vectors, geometric problems and modelling.",
      subs: [
        { id:"pu11-1", code:"11.1", name:"Vectors", importance:3, vid:12, qs:24, reqs:[
          "Understand a vector as having both magnitude and direction, and distinguish it from a scalar",
          "Use vector notation, including bold and arrow notation",
          "Understand equal vectors, parallel vectors and the negative of a vector",
          "Add and subtract vectors using the triangle and parallelogram laws" ]},
        { id:"pu11-2", code:"11.2", name:"Representing vectors", importance:4, vid:14, qs:26, reqs:[
          "Write vectors in i, j form and as column vectors, and convert between them",
          "Add, subtract and multiply vectors by a scalar in component form",
          "Understand that parallel vectors are scalar multiples of one another",
          "Solve equations involving vectors to find unknown scalars" ]},
        { id:"pu11-3", code:"11.3", name:"Magnitude and direction", importance:4, vid:14, qs:28, reqs:[
          "Find the magnitude of a vector using Pythagoras",
          "Find the direction of a vector as an angle, including as a bearing",
          "Find a unit vector in the direction of a given vector",
          "Convert between magnitude-direction form and component form" ]},
        { id:"pu11-4", code:"11.4", name:"Position vectors", importance:4, vid:14, qs:28, reqs:[
          "Understand position vectors relative to the origin",
          "Find the vector AB as OB - OA",
          "Find the distance between two points from their position vectors",
          "Find the position vector of a point dividing a line segment in a given ratio" ]},
        { id:"pu11-5", code:"11.5", name:"Solving geometric problems", importance:3, vid:16, qs:30, reqs:[
          "Use vectors to solve problems involving triangles, parallelograms and other shapes",
          "Prove that three points are collinear",
          "Prove results about midpoints, ratios and parallel sides",
          "Express one vector in terms of others given in the diagram" ]},
        { id:"pu11-6", code:"11.6", name:"Modelling with vectors", importance:3, vid:14, qs:26, reqs:[
          "Use vectors to model displacement, velocity, acceleration and force",
          "Find a resultant velocity or displacement in vector form",
          "Interpret the magnitude and direction of a modelled vector in context" ]}
      ]},

    { id: "pu12", num: "12", name: "Differentiation",
      desc: "Gradients of curves, first principles, the rules, tangents and normals, stationary points and modelling.",
      subs: [
        { id:"pu12-1", code:"12.1", name:"Gradients of curves", importance:3, vid:12, qs:24, reqs:[
          "Understand the gradient of a curve at a point as the gradient of the tangent there",
          "Understand the gradient of a chord as an approximation to the gradient of a curve",
          "Interpret the derivative as a rate of change, with correct units in context" ]},
        { id:"pu12-2", code:"12.2", name:"Finding the derivative (first principles)", importance:3, vid:18, qs:30, reqs:[
          "Understand the derivative as the limit of the gradient of a chord as h tends to 0",
          "Use the notation lim (h -> 0) of [f(x + h) - f(x)] / h",
          "Differentiate x^2 and simple quadratics and cubics from first principles",
          "Set out the argument fully, including the limiting step" ]},
        { id:"pu12-3", code:"12.3", name:"Differentiating x to the power n", importance:5, vid:14, qs:28, reqs:[
          "Know and use the rule that the derivative of x^n is n x^(n-1)",
          "Apply the rule for negative and fractional values of n",
          "Rewrite expressions in index form before differentiating" ]},
        { id:"pu12-4", code:"12.4", name:"Differentiating quadratics", importance:4, vid:12, qs:24, reqs:[
          "Differentiate quadratic expressions term by term",
          "Find the gradient of a quadratic curve at a given point",
          "Find where the gradient takes a particular value" ]},
        { id:"pu12-5", code:"12.5", name:"Differentiating functions with two or more terms", importance:5, vid:16, qs:30, reqs:[
          "Differentiate sums, differences and constant multiples",
          "Rewrite expressions such as (3x + 1)/root x or (x + 2)^2 in index form first",
          "Differentiate expressions containing fractional and negative indices accurately" ]},
        { id:"pu12-6", code:"12.6", name:"Gradients, tangents and normals", importance:5, vid:16, qs:32, reqs:[
          "Find the gradient of a curve at a point by substituting into dy/dx",
          "Find the equation of the tangent to a curve at a given point",
          "Find the equation of the normal, using gradient -1/m",
          "Find where a tangent or normal meets the axes or meets the curve again" ]},
        { id:"pu12-7", code:"12.7", name:"Increasing and decreasing functions", importance:3, vid:12, qs:24, reqs:[
          "Know that a function is increasing where f'(x) > 0 and decreasing where f'(x) < 0",
          "Find the intervals on which a function is increasing or decreasing",
          "Prove a function is increasing for all x, often by completing the square" ]},
        { id:"pu12-8", code:"12.8", name:"Second order derivatives", importance:4, vid:12, qs:24, reqs:[
          "Find the second derivative and use the notation f''(x) and d2y/dx2",
          "Interpret the second derivative as the rate of change of the gradient",
          "Use the second derivative to determine the nature of a stationary point" ]},
        { id:"pu12-9", code:"12.9", name:"Stationary points", importance:5, vid:18, qs:34, reqs:[
          "Find stationary points by solving f'(x) = 0",
          "Determine the nature of each stationary point using the second derivative",
          "Determine nature using the sign of the gradient either side as an alternative",
          "Identify local maxima, local minima and points of inflection" ]},
        { id:"pu12-10", code:"12.10", name:"Sketching gradient functions", importance:2, vid:12, qs:22, reqs:[
          "Sketch the graph of the gradient function from the graph of a curve",
          "Relate stationary points on the curve to roots of the gradient function",
          "Relate the sign of the gradient to the position of the gradient graph" ]},
        { id:"pu12-11", code:"12.11", name:"Modelling with differentiation", importance:5, vid:20, qs:38, reqs:[
          "Set up an expression for a quantity to be maximised or minimised",
          "Use a given constraint to reduce the expression to a single variable",
          "Differentiate, solve f'(x) = 0, and justify the nature of the stationary point",
          "Interpret the answer in context with correct units",
          "Use differentiation to find rates of change in modelling contexts" ]}
      ]},

    { id: "pu13", num: "13", name: "Integration",
      desc: "Reversing differentiation, definite integrals, and areas under and between curves.",
      subs: [
        { id:"pu13-1", code:"13.1", name:"Integrating x to the power n", importance:5, vid:14, qs:28, reqs:[
          "Know that integration is the reverse of differentiation",
          "Integrate x^n for rational n, where n is not equal to -1",
          "Always include the constant of integration in an indefinite integral" ]},
        { id:"pu13-2", code:"13.2", name:"Indefinite integrals", importance:5, vid:16, qs:30, reqs:[
          "Integrate sums, differences and constant multiples term by term",
          "Rewrite expressions in index form before integrating",
          "Use correct integral notation including the dx" ]},
        { id:"pu13-3", code:"13.3", name:"Finding functions", importance:4, vid:14, qs:28, reqs:[
          "Integrate a derivative and use a given point to find the constant of integration",
          "Find the equation of a curve given its gradient function and a point on it",
          "Apply this in modelling contexts" ]},
        { id:"pu13-4", code:"13.4", name:"Definite integrals", importance:5, vid:16, qs:30, reqs:[
          "Evaluate definite integrals using correct square-bracket layout",
          "Substitute the limits in the correct order and subtract",
          "Understand what a negative value of a definite integral means" ]},
        { id:"pu13-5", code:"13.5", name:"Areas under curves", importance:5, vid:18, qs:34, reqs:[
          "Use definite integration to find the area between a curve and the x-axis",
          "Find the limits from the roots of the curve where they are not given",
          "Interpret the area in a modelling context with correct units" ]},
        { id:"pu13-6", code:"13.6", name:"Areas under the x-axis", importance:4, vid:16, qs:30, reqs:[
          "Recognise that an area below the x-axis gives a negative integral",
          "Split the integral at the roots and take the modulus of the negative part",
          "Find the total area rather than the net value of the integral" ]},
        { id:"pu13-7", code:"13.7", name:"Areas between curves and lines", importance:4, vid:18, qs:34, reqs:[
          "Find the points of intersection to establish the limits",
          "Subtract integrals, or combine an integral with the area of a triangle or trapezium",
          "Choose the most efficient method and lay the working out clearly",
          "Find the area between two curves" ]}
      ]},

    { id: "pu14", num: "14", name: "Exponentials and Logarithms",
      desc: "e to the x, logarithms and their laws, solving equations, and linearising non-linear data.",
      subs: [
        { id:"pu14-1", code:"14.1", name:"Exponential functions", importance:3, vid:12, qs:24, reqs:[
          "Know and use the function y = a^x for a > 0 and sketch its graph",
          "Know the shape, the y-intercept at (0, 1) and the asymptote y = 0",
          "Sketch transformations of exponential graphs" ]},
        { id:"pu14-2", code:"14.2", name:"y = e to the x", importance:4, vid:14, qs:26, reqs:[
          "Know and use the function e^x and its graph",
          "Know that the derivative of e^(kx) is k e^(kx), and why e is the natural choice of base",
          "Sketch transformations of y = e^x, showing asymptotes and intercepts" ]},
        { id:"pu14-3", code:"14.3", name:"Exponential modelling", importance:4, vid:16, qs:30, reqs:[
          "Use exponential functions to model growth and decay",
          "Interpret the parameters of a model such as P = a e^(kt) in context",
          "Find initial values, rates, doubling times and half-lives",
          "Comment on the limitations of an exponential model" ]},
        { id:"pu14-4", code:"14.4", name:"Logarithms", importance:4, vid:14, qs:28, reqs:[
          "Know that log_a(x) is the inverse of a^x, so a^x = n is equivalent to x = log_a(n)",
          "Evaluate logarithms, including log_a(a) = 1 and log_a(1) = 0",
          "Sketch the graph of y = log_a(x) and relate it to y = a^x" ]},
        { id:"pu14-5", code:"14.5", name:"Laws of logarithms", importance:5, vid:16, qs:32, reqs:[
          "Know and use log(xy) = log x + log y",
          "Know and use log(x/y) = log x − log y",
          "Know and use log(x^k) = k log x",
          "Combine several logarithmic terms into a single logarithm and split one into several",
          "Avoid the standard error of writing log(x + y) as log x + log y" ]},
        { id:"pu14-6", code:"14.6", name:"Solving equations using logarithms", importance:5, vid:18, qs:34, reqs:[
          "Solve equations of the form a^x = b by taking logarithms of both sides",
          "Solve equations requiring the log laws to combine terms first",
          "Solve equations that are quadratic in a^x or in a logarithm",
          "Check for and reject invalid solutions, such as the logarithm of a non-positive number" ]},
        { id:"pu14-7", code:"14.7", name:"Working with natural logarithms", importance:4, vid:14, qs:28, reqs:[
          "Know ln x as the logarithm to base e and that it is the inverse of e^x",
          "Use ln to solve equations involving e^x",
          "Know and use e^(ln x) = x and ln(e^x) = x" ]},
        { id:"pu14-8", code:"14.8", name:"Logarithms and non-linear data", importance:3, vid:18, qs:32, reqs:[
          "Understand that y = ax^n gives a straight line when log y is plotted against log x",
          "Understand that y = kb^x gives a straight line when log y is plotted against x",
          "Use the gradient and intercept of the transformed plot to estimate the constants",
          "Interpret the resulting model in context" ]}
      ]},

    /* ---- Year 2 content: NOT examinable on AS 8MA0, off by default ---- */
    { id: "puY2", num: "Y2", name: "Year 2 stretch — not on AS 8MA0", y2Group: true,
      desc: "These live in the Pure Year 2 book and are not examinable on the AS paper. Off by default; switch on in Settings only if you want the stretch.",
      subs: [
        { id:"y2-seq", code:"Y2", name:"Sequences and series (arithmetic, geometric, sigma)", importance:1, y2:true, vid:24, qs:38, reqs:[
          "PURE YEAR 2, CHAPTER 3 — not examinable on AS 8MA0",
          "Arithmetic sequences and series: nth term and sum formulae",
          "Geometric sequences and series: nth term, sum of n terms, sum to infinity and |r| < 1",
          "Sigma notation and recurrence relations; increasing, decreasing and periodic sequences" ]},
        { id:"y2-rad", code:"Y2", name:"Radians, arcs, sectors and small angles", importance:1, y2:true, vid:22, qs:36, reqs:[
          "PURE YEAR 2, CHAPTER 5 — not examinable on AS 8MA0",
          "Radian measure and conversion between degrees and radians",
          "Arc length s = r(theta) and sector area ½r^2(theta)",
          "Small angle approximations for sin, cos and tan" ]},
        { id:"y2-trig", code:"Y2", name:"Reciprocal and compound angle identities", importance:1, y2:true, vid:26, qs:40, reqs:[
          "PURE YEAR 2, CHAPTERS 6–7 — not examinable on AS 8MA0",
          "sec, cosec and cot and the derived Pythagorean identities",
          "Compound and double angle formulae",
          "The harmonic form R sin(x + a)" ]},
        { id:"y2-fn", code:"Y2", name:"Composite and inverse functions, modulus", importance:1, y2:true, vid:24, qs:38, reqs:[
          "PURE YEAR 2, CHAPTER 2 — not examinable on AS 8MA0",
          "Form and evaluate composite functions fg(x)",
          "Find inverse functions with their domains and ranges; reflection in y = x",
          "The modulus function and solving modulus equations and inequalities" ]},
        { id:"y2-proof", code:"Y2", name:"Proof by contradiction", importance:1, y2:true, vid:15, qs:25, reqs:[
          "PURE YEAR 2, CHAPTER 1 — not examinable on AS 8MA0",
          "Assume the negation, derive a contradiction, conclude the original statement",
          "Classic proofs: the irrationality of root 2, the infinitude of primes" ]}
      ]}
  ]
},
{
  id: "stats", paper: "Statistics", short: "Stats",
  name: "Paper 2 Section A — Statistics", code: "8MA0/02",
  book: "Statistics & Mechanics Year 1/AS, Chapters 1–7",
  examMinutes: 75, marks: 60,
  note: "Paper 2 is 1h15 and 60 marks in total, split between Statistics and Mechanics.",
  sections: [

    { id: "st1", num: "1", name: "Data Collection",
      desc: "Populations and samples, sampling methods, types of data and the large data set.",
      subs: [
        { id:"sm1-1", code:"1.1", name:"Populations and samples", importance:3, vid:12, qs:22, reqs:[
          "Understand the terms population, sample, sampling unit and sampling frame",
          "Know the advantages and disadvantages of a census compared with a sample",
          "Explain why sampling is used in a given context",
          "Comment on the limitations of a sample" ]},
        { id:"sm1-2", code:"1.2", name:"Sampling", importance:4, vid:16, qs:30, reqs:[
          "Describe and carry out simple random sampling using random numbers or a lottery method",
          "Describe and carry out systematic sampling",
          "Describe and carry out stratified sampling, including calculating the number required from each stratum",
          "State advantages and disadvantages of each method in context" ]},
        { id:"sm1-3", code:"1.3", name:"Non-random sampling", importance:3, vid:12, qs:24, reqs:[
          "Describe quota sampling and how quotas are set",
          "Describe opportunity (convenience) sampling",
          "State the advantages and disadvantages of each",
          "Select and justify an appropriate sampling method for a described situation" ]},
        { id:"sm1-4", code:"1.4", name:"Types of data", importance:2, vid:10, qs:20, reqs:[
          "Distinguish between qualitative and quantitative data",
          "Distinguish between discrete and continuous data",
          "Understand grouped data, class boundaries, midpoints and class widths" ]},
        { id:"sm1-5", code:"1.5", name:"The large data set", importance:3, vid:20, qs:28, reqs:[
          "Be familiar with the Edexcel large data set of UK and overseas weather station data (1987 and 2015)",
          "Know the locations, the variables and their units",
          "Know the meaning of terms such as Daily Mean Temperature, Daily Total Rainfall and tr (trace)",
          "Know that non-numeric entries such as n/a and tr must be handled and cannot be used as numbers",
          "Interpret summary statistics and diagrams drawn from the large data set and comment on their limitations" ]}
      ]},

    { id: "st2", num: "2", name: "Measures of Location and Spread",
      desc: "Averages, quartiles and percentiles, variance and standard deviation, and coding.",
      subs: [
        { id:"sm2-1", code:"2.1", name:"Measures of central tendency", importance:4, vid:16, qs:30, reqs:[
          "Calculate the mean, median and mode from raw data and from frequency tables",
          "Estimate the mean from a grouped frequency table using midpoints",
          "Choose and justify the most appropriate measure of location for given data",
          "Calculate a combined mean for two data sets" ]},
        { id:"sm2-2", code:"2.2", name:"Other measures of location", importance:4, vid:16, qs:30, reqs:[
          "Find the quartiles and percentiles for discrete data",
          "Use linear interpolation to estimate the median, quartiles and percentiles from grouped data",
          "Interpret a percentile in context" ]},
        { id:"sm2-3", code:"2.3", name:"Measures of spread", importance:4, vid:14, qs:26, reqs:[
          "Calculate the range and the interquartile range",
          "Calculate interpercentile ranges such as the 10th to 90th",
          "Choose an appropriate measure of spread and justify it in context" ]},
        { id:"sm2-4", code:"2.4", name:"Variance and standard deviation", importance:5, vid:18, qs:34, reqs:[
          "Calculate variance and standard deviation from raw data",
          "Calculate them from summary statistics using Sxx, the sum of x and the sum of x^2",
          "Use the statistics mode on a calculator to obtain the standard deviation efficiently",
          "Compare two data sets using a measure of location together with a measure of spread" ]},
        { id:"sm2-5", code:"2.5", name:"Coding", importance:3, vid:14, qs:28, reqs:[
          "Understand and use coding of the form y = (x − a)/b",
          "Find the mean and standard deviation of the original data from the coded data, and vice versa",
          "Know that adding a constant does not change the standard deviation",
          "Use coding to simplify awkward calculations" ]}
      ]},

    { id: "st3", num: "3", name: "Representations of Data",
      desc: "Outliers, box plots, cumulative frequency, histograms and comparing distributions.",
      subs: [
        { id:"sm3-1", code:"3.1", name:"Outliers", importance:4, vid:12, qs:26, reqs:[
          "Identify outliers using the rule Q1 − 1.5 × IQR and Q3 + 1.5 × IQR",
          "Identify outliers using a rule based on a number of standard deviations from the mean",
          "Understand the difference between an outlier and an error, and decide whether to clean the data",
          "Justify the removal or retention of a value in context" ]},
        { id:"sm3-2", code:"3.2", name:"Box plots", importance:4, vid:14, qs:28, reqs:[
          "Draw a box plot showing the minimum, quartiles, median, maximum and any outliers",
          "Interpret a box plot and read off values",
          "Compare two distributions from their box plots, referring to location and spread",
          "Comment on skewness from the relative positions of the quartiles" ]},
        { id:"sm3-3", code:"3.3", name:"Cumulative frequency", importance:3, vid:14, qs:26, reqs:[
          "Draw a cumulative frequency diagram from a grouped frequency table",
          "Read off estimates for the median, quartiles and percentiles",
          "Estimate the number of values above or below a given figure" ]},
        { id:"sm3-4", code:"3.4", name:"Histograms", importance:5, vid:18, qs:34, reqs:[
          "Draw a histogram with unequal class widths using frequency density",
          "Know that frequency density = frequency / class width and that area represents frequency",
          "Use the area of a bar, or a proportion of it, to estimate a frequency",
          "Find a missing frequency or class width from a histogram" ]},
        { id:"sm3-5", code:"3.5", name:"Comparing data", importance:3, vid:12, qs:24, reqs:[
          "Compare two distributions using a measure of location and a measure of spread",
          "Refer to the context of the data in every comparison",
          "Comment on skewness using the mean, median and quartiles" ]}
      ]},

    { id: "st4", num: "4", name: "Correlation",
      desc: "Scatter diagrams, correlation, regression lines and their interpretation.",
      subs: [
        { id:"sm4-1", code:"4.1", name:"Correlation", importance:3, vid:14, qs:26, reqs:[
          "Draw and interpret scatter diagrams for bivariate data",
          "Describe correlation as positive or negative and strong or weak",
          "Understand that correlation does not imply causation",
          "Suggest other factors that might explain an apparent association" ]},
        { id:"sm4-2", code:"4.2", name:"Linear regression", importance:3, vid:16, qs:30, reqs:[
          "Understand the regression line of y on x, and the roles of the explanatory and response variables",
          "Use a given regression equation to make a prediction",
          "Interpret the gradient and the intercept in context",
          "Understand interpolation and extrapolation, and know that extrapolation is unreliable" ]},
        { id:"sm4-3", code:"4.3", name:"Correlation and the large data set", importance:2, vid:12, qs:22, reqs:[
          "Interpret correlation between variables in the large data set",
          "Comment on the reliability of conclusions drawn from weather data",
          "Recognise where a relationship is affected by location or season" ]}
      ]},

    { id: "st5", num: "5", name: "Probability",
      desc: "Calculating probabilities, Venn diagrams, mutually exclusive and independent events, and tree diagrams.",
      subs: [
        { id:"sm5-1", code:"5.1", name:"Calculating probabilities", importance:4, vid:14, qs:26, reqs:[
          "Calculate probabilities from equally likely outcomes and from sample space diagrams",
          "Use two-way tables to calculate probabilities",
          "Use the complement P(not A) = 1 - P(A)",
          "Use relative frequency as an estimate of probability" ]},
        { id:"sm5-2", code:"5.2", name:"Venn diagrams", importance:4, vid:16, qs:30, reqs:[
          "Construct and interpret Venn diagrams for two and three sets",
          "Use set notation for intersection, union and complement",
          "Fill in a Venn diagram from partial information, working outwards from the centre",
          "Calculate probabilities from a completed Venn diagram" ]},
        { id:"sm5-3", code:"5.3", name:"Mutually exclusive and independent events", importance:4, vid:16, qs:30, reqs:[
          "Understand and use mutually exclusive events: P(A or B) = P(A) + P(B)",
          "Understand and use independent events: P(A and B) = P(A) × P(B)",
          "Use the addition formula P(A or B) = P(A) + P(B) - P(A and B)",
          "Determine whether two events are independent from given probabilities" ]},
        { id:"sm5-4", code:"5.4", name:"Tree diagrams", importance:4, vid:14, qs:28, reqs:[
          "Construct tree diagrams for two or three stages",
          "Distinguish between sampling with and without replacement",
          "Multiply along the branches and add across the outcomes",
          "Find an unknown probability given a stated overall probability" ]}
      ]},

    { id: "st6", num: "6", name: "Statistical Distributions",
      desc: "Discrete probability distributions and the binomial distribution.",
      subs: [
        { id:"sm6-1", code:"6.1", name:"Probability distributions", importance:3, vid:14, qs:26, reqs:[
          "Understand a discrete random variable and the notation P(X = x)",
          "Construct and interpret a probability distribution table",
          "Use the fact that the probabilities sum to 1 to find an unknown",
          "Calculate probabilities from a given probability function" ]},
        { id:"sm6-2", code:"6.2", name:"The binomial distribution", importance:5, vid:18, qs:32, reqs:[
          "Know the conditions for a binomial model: a fixed number of independent trials, two outcomes, and a constant probability of success",
          "Use the notation X ~ B(n, p)",
          "State clearly, in context, whether a binomial model is appropriate",
          "Criticise a proposed binomial model by referring to a specific assumption in context",
          "Calculate P(X = x) using the binomial probability formula" ]},
        { id:"sm6-3", code:"6.3", name:"Cumulative probabilities", importance:5, vid:18, qs:34, reqs:[
          "Use the calculator's binomial cumulative distribution function",
          "Convert phrases such as at least, more than, fewer than and at most into the correct cumulative form",
          "Calculate probabilities of the form P(a <= X <= b) by subtracting cumulative probabilities",
          "Solve problems involving several binomial stages" ]}
      ]},

    { id: "st7", num: "7", name: "Hypothesis Testing",
      desc: "Setting up and carrying out binomial hypothesis tests, and finding critical regions.",
      subs: [
        { id:"sm7-1", code:"7.1", name:"Hypothesis testing", importance:4, vid:16, qs:30, reqs:[
          "Understand and use the terms null hypothesis, alternative hypothesis, test statistic and significance level",
          "State hypotheses correctly in terms of the population parameter p",
          "Understand what a significance level means as the probability of rejecting a true null hypothesis",
          "Understand that a test never proves a hypothesis, only provides evidence" ]},
        { id:"sm7-2", code:"7.2", name:"Finding critical values", importance:4, vid:18, qs:32, reqs:[
          "Understand critical value, critical region and acceptance region",
          "Find the critical region for a binomial test at a given significance level",
          "Use cumulative binomial tables or a calculator to find critical values",
          "Calculate the actual significance level as the total probability of the critical region",
          "Explain why the actual significance level differs from the nominal one for a discrete distribution" ]},
        { id:"sm7-3", code:"7.3", name:"One-tailed tests", importance:5, vid:18, qs:34, reqs:[
          "Set up a one-tailed test with H0: p = value and H1: p > value or p < value",
          "Assume H0 is true and find the probability of the observed value or more extreme",
          "Compare with the significance level and decide whether to reject H0",
          "Write a full conclusion in context" ]},
        { id:"sm7-4", code:"7.4", name:"Two-tailed tests", importance:4, vid:18, qs:32, reqs:[
          "Set up a two-tailed test with H1: p not equal to value",
          "Halve the significance level and test against the appropriate tail",
          "Decide which tail the observed value lies in before testing",
          "Write a full conclusion in context" ]}
      ]}
  ]
},
{
  id: "mech", paper: "Mechanics", short: "Mech",
  name: "Paper 2 Section B — Mechanics", code: "8MA0/02",
  book: "Statistics & Mechanics Year 1/AS, Chapters 8–11",
  examMinutes: 75, marks: 60,
  note: "Paper 2 is 1h15 and 60 marks in total, split between Statistics and Mechanics.",
  sections: [

    { id: "me8", num: "8", name: "Modelling in Mechanics",
      desc: "Constructing models, standard modelling assumptions, units, and vectors in mechanics.",
      subs: [
        { id:"sm8-1", code:"8.1", name:"Constructing a model", importance:3, vid:12, qs:22, reqs:[
          "Understand how a real situation is simplified into a mathematical model",
          "Identify the assumptions being made and what each one allows you to ignore",
          "Comment on the validity of a model and suggest a refinement" ]},
        { id:"sm8-2", code:"8.2", name:"Modelling assumptions", importance:3, vid:12, qs:24, reqs:[
          "Know the standard assumptions: particle, rod, lamina, light, inextensible, smooth, rough, rigid, uniform",
          "State what each assumption means in practice, for example that a light string has negligible mass",
          "Know that a smooth pulley means the tension is the same on both sides",
          "Criticise an assumption in the context of a given question" ]},
        { id:"sm8-3", code:"8.3", name:"Quantities and units", importance:3, vid:12, qs:22, reqs:[
          "Understand and use the base SI units: length (m), mass (kg), time (s)",
          "Understand and use derived units: velocity (m/s), acceleration (m/s^2), force and weight (N)",
          "Convert between units consistently, including km/h into m/s",
          "Give answers with correct units and to a sensible accuracy, usually 3 significant figures with g = 9.8" ]},
        { id:"sm8-4", code:"8.4", name:"Working with vectors", importance:3, vid:14, qs:26, reqs:[
          "Distinguish between scalar and vector quantities, such as distance and displacement, speed and velocity",
          "Write vectors in i, j form and find their magnitude and direction",
          "Add vectors and find a resultant",
          "Understand the significance of signs when working in one dimension" ]}
      ]},

    { id: "me9", num: "9", name: "Constant Acceleration",
      desc: "Motion graphs, the suvat formulae, and vertical motion under gravity.",
      subs: [
        { id:"sm9-1", code:"9.1", name:"Displacement-time graphs", importance:3, vid:12, qs:24, reqs:[
          "Interpret a displacement-time graph, where the gradient represents velocity",
          "Draw a displacement-time graph from a described journey",
          "Distinguish between distance travelled and displacement from the graph" ]},
        { id:"sm9-2", code:"9.2", name:"Velocity-time graphs", importance:4, vid:16, qs:30, reqs:[
          "Interpret a velocity-time graph, where the gradient represents acceleration",
          "Know that the area under the graph represents displacement",
          "Use the areas of triangles and trapezia to find total distance",
          "Set up and solve an equation from the graph where a time or speed is unknown" ]},
        { id:"sm9-3", code:"9.3", name:"Constant acceleration formulae 1", importance:5, vid:20, qs:36, reqs:[
          "Know and use v = u + at",
          "Know and use s = ½(u + v)t",
          "Identify which quantities are given and which is required",
          "Use consistent signs for direction throughout a problem" ]},
        { id:"sm9-4", code:"9.4", name:"Constant acceleration formulae 2", importance:5, vid:20, qs:38, reqs:[
          "Know and use s = ut + ½at^2 and s = vt - ½at^2",
          "Know and use v^2 = u^2 + 2as",
          "Select the most efficient formula for the quantities given",
          "Apply the formulae to two-stage journeys and to two objects moving simultaneously",
          "Set up and solve simultaneous equations where necessary" ]},
        { id:"sm9-5", code:"9.5", name:"Vertical motion under gravity", importance:5, vid:20, qs:36, reqs:[
          "Apply the constant acceleration formulae to vertical motion with g = 9.8 m/s^2",
          "Choose and state a positive direction and use signs consistently",
          "Solve problems involving projection upwards, greatest height and time of flight",
          "Handle a particle thrown from a height that lands below its starting point",
          "Interpret both solutions of the resulting quadratic in time and reject the invalid one" ]}
      ]},

    { id: "me10", num: "10", name: "Forces and Motion",
      desc: "Force diagrams, Newton's laws, motion in two dimensions, connected particles and pulleys.",
      subs: [
        { id:"sm10-1", code:"10.1", name:"Force diagrams", importance:4, vid:14, qs:28, reqs:[
          "Draw a clear force diagram showing every force acting on a particle",
          "Identify weight, normal reaction, tension, thrust, friction and applied forces",
          "Know that weight = mg acting vertically downwards",
          "Understand equilibrium as a zero resultant force and resolve accordingly" ]},
        { id:"sm10-2", code:"10.2", name:"Forces as vectors", importance:3, vid:16, qs:30, reqs:[
          "Express forces in i, j component form",
          "Find the resultant of two or more forces given in vector form",
          "Find the magnitude and direction of a resultant force",
          "Find an unknown force given the resultant" ]},
        { id:"sm10-3", code:"10.3", name:"Forces and acceleration", importance:5, vid:20, qs:36, reqs:[
          "Know and use Newton's first law: constant velocity when the resultant force is zero",
          "Know and use Newton's second law F = ma in the direction of motion",
          "Know and use Newton's third law",
          "Apply F = ma to a particle moving horizontally or vertically, including in a lift",
          "Combine F = ma with the suvat formulae in multi-stage problems" ]},
        { id:"sm10-4", code:"10.4", name:"Motion in 2 dimensions", importance:3, vid:16, qs:30, reqs:[
          "Apply F = ma in vector form to find acceleration",
          "Integrate or use suvat in vector form to find velocity and displacement",
          "Find the magnitude and direction of the resulting acceleration or velocity" ]},
        { id:"sm10-5", code:"10.5", name:"Connected particles", importance:5, vid:22, qs:40, reqs:[
          "Model connected particles joined by a light inextensible string",
          "Write a separate equation of motion for each particle and solve them simultaneously",
          "Solve tow-bar and coupled-vehicle problems and find the force in the connecting rod",
          "Consider the system as a whole where it is quicker to do so",
          "State and use the assumption that a light string has the same tension throughout" ]},
        { id:"sm10-6", code:"10.6", name:"Pulleys", importance:5, vid:22, qs:40, reqs:[
          "Solve problems with a string passing over a smooth pulley or peg",
          "Write equations of motion for each particle with consistent positive directions",
          "Find the tension in the string and the acceleration of the system",
          "Deal with what happens when the string breaks or a particle reaches the ground",
          "Find the greatest height reached after a particle leaves the ground" ]}
      ]},

    { id: "me11", num: "11", name: "Variable Acceleration",
      desc: "Using calculus when acceleration is not constant.",
      subs: [
        { id:"sm11-1", code:"11.1", name:"Functions of time", importance:3, vid:12, qs:24, reqs:[
          "Understand displacement, velocity and acceleration expressed as functions of time",
          "Substitute a value of t to find displacement, velocity or acceleration at an instant",
          "Interpret the sign of each quantity in context" ]},
        { id:"sm11-2", code:"11.2", name:"Using differentiation", importance:4, vid:16, qs:30, reqs:[
          "Know that velocity is the derivative of displacement with respect to time",
          "Know that acceleration is the derivative of velocity with respect to time",
          "Differentiate to move from displacement to velocity to acceleration" ]},
        { id:"sm11-3", code:"11.3", name:"Maxima and minima problems", importance:4, vid:16, qs:30, reqs:[
          "Find the maximum or minimum velocity or displacement by setting a derivative to zero",
          "Justify that the value found is a maximum or a minimum",
          "Find when a particle is instantaneously at rest or changes direction" ]},
        { id:"sm11-4", code:"11.4", name:"Using integration", importance:4, vid:16, qs:32, reqs:[
          "Integrate acceleration to find velocity, and velocity to find displacement",
          "Use initial conditions to find the constant of integration",
          "Use a definite integral to find the displacement over an interval" ]},
        { id:"sm11-5", code:"11.5", name:"Constant acceleration formulae (derivation)", importance:2, vid:12, qs:22, reqs:[
          "Use calculus to derive the constant acceleration formulae",
          "Understand why the suvat formulae only apply when acceleration is constant",
          "Recognise from a question whether calculus or suvat is required" ]}
      ]}
  ]
}
];

/* ---------- derived helpers ---------- */
const SPEC_INDEX = (function () {
  const map = {};
  SPEC.forEach(function (paper) {
    paper.sections.forEach(function (sec) {
      sec.subs.forEach(function (sub) {
        map[sub.id] = {
          sub: sub, section: sec, paper: paper,
          chapterLabel: sec.y2Group ? sec.name : "Chapter " + sec.num + " · " + sec.name,
          path: paper.short + " / " + sec.name,
          fullName: sec.name + " — " + sub.name
        };
      });
    });
  });
  return map;
})();

const ALL_SUB_IDS = Object.keys(SPEC_INDEX);

/* Estimated minutes for the standard workflow on one subtopic */
function subMinutes(sub) {
  return {
    video: sub.vid || 20,
    questions: sub.qs || 35,
    review: 10,
    retrieval: Math.max(12, Math.round((sub.qs || 35) * 0.45))
  };
}

/* Reference links (official Pearson pages only — no invented paper URLs) */
const REFERENCE_LINKS = [
  { name: "Pearson Edexcel AS/A level Mathematics (2017) — specification, past papers and mark schemes",
    url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html" },
  { name: "Formulae booklet and the large data set (same page, under Teaching and learning materials)",
    url: "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html" }
];
