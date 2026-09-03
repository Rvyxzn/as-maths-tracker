/* ============================================================
Formula flashcards, the things you have to know by heart.

   WHAT IS GIVEN AND WHAT IS NOT
   Every card is tagged `given: true` if the formula appears in the
   Edexcel AS formulae booklet, and left untagged if you must
   memorise it. That split is not guesswork: it was read straight
   out of Pearson's "Mathematical Formulae and Statistical Tables"
   (P54458A, Issue 1, July 2017), section 1 "AS Mathematics".

   The AS booklet is much shorter than people assume. It gives you
   ONLY:
     Pure - surface area of a sphere and curved surface of a cone;
             the binomial series with nCr; change of base for logs;
             e^(x ln a) = a^x; differentiation from first principles
     Stats - P(A') = 1 - P(A); sd = sqrt(variance); IQR = Q3 - Q1;
             Sxx and the two standard deviation forms; the binomial
             cumulative table
     Mech - the five constant-acceleration (suvat) equations

   Everything else here - the quadratic formula, the circle
   equation, every trig identity, the sine and cosine rules, the
   log laws, differentiating and integrating x^n, F = ma - is NOT
   in the booklet and has to come out of your head.

   The cards are written for this tracker from the 8MA0
   specification content. Nothing is copied from a published
   revision guide or another flashcard set.
   ============================================================ */

const FLASHCARDS = {

  /* ================= PURE ================= */

  pu1: [
    { q: "Multiplying powers: aᵐ × aⁿ", a: "aᵐ⁺ⁿ, add the indices" },
    { q: "Dividing powers: aᵐ ÷ aⁿ", a: "aᵐ⁻ⁿ, subtract the indices" },
    { q: "Power of a power: (aᵐ)ⁿ", a: "aᵐⁿ, multiply the indices" },
    { q: "What is a⁰?", a: "1, for any a ≠ 0" },
    { q: "What is a⁻ⁿ?", a: "1/aⁿ, a minus power means flip it upside down" },
    { q: "What is a^(1/n)?", a: "ⁿ√a, the nth root of a" },
    { q: "What is a^(m/n)?", a: "ⁿ√(aᵐ) = (ⁿ√a)ᵐ, the bottom number is the root, the top number is the power" },
    { q: "Simplify √a × √b", a: "√(ab)" },
    { q: "Simplify √a ÷ √b", a: "√(a/b)" },
    { q: "How do you rationalise a denominator of the form a + √b?",
      a: "Multiply the top and bottom by a − √b (the same thing, but with the middle sign flipped, this is called the conjugate). The √ then cancels off the bottom." },
    { q: "Expand (a + b)²", a: "a² + 2ab + b², NOT a² + b². The middle bit is the one everyone forgets." },
    { q: "Difference of two squares: a² − b²", a: "(a + b)(a − b)" }
  ],

  pu2: [
    { q: "The quadratic formula for ax² + bx + c = 0",
      a: "x = (−b ± √(b² − 4ac)) / 2a, this is NOT in the exam booklet, so you have to learn it" },
    { q: "Completed square form of a(x + p)² + q, where is the turning point?",
      a: "At (−p, q). You can read the turning point straight off, just flip the sign of p." },
    { q: "How do you complete the square when a ≠ 1?",
      a: "Take a out of the x² and x terms FIRST: a[x² + (b/a)x] + c, then complete the square inside the bracket." },
    { q: "What is the discriminant?", a: "b² − 4ac" },
    { q: "Discriminant > 0", a: "Two distinct real roots, the curve crosses the x-axis twice" },
    { q: "Discriminant = 0", a: "One repeated root, the curve is tangent to the x-axis" },
    { q: "Discriminant < 0", a: "No real roots, the curve never touches the x-axis" },
    { q: "Shape of y = ax² + bx + c when a > 0", a: "A U-shaped parabola (opens upward), with a minimum point",
      svg: "parabola-up" },
    { q: "Shape of y = ax² + bx + c when a < 0", a: "An ∩-shaped parabola (opens downward), with a maximum point",
      svg: "parabola-down" },
    { q: "How do you find the y-intercept of a quadratic?", a: "Set x = 0, it is just c" },
    { q: "A question says 'the equation has two distinct real roots'. What do you write?",
      a: "Write b² − 4ac > 0, then solve it to find the unknown letter" },
    { q: "What does 'quadratic in disguise' mean?",
      a: "It looks like a quadratic, but in something other than x, like x², √x, eˣ or sin x. Swap that thing for u, solve as normal, then swap back." }
  ],

  pu3: [
    { q: "How do you solve a linear and a quadratic simultaneously?",
      a: "Rearrange the linear equation for one variable, substitute into the quadratic, solve, then pair each x with its own y" },
    { q: "What must you do to an inequality when you multiply or divide by a negative?",
      a: "Reverse the inequality sign" },
    { q: "How do you solve a quadratic inequality?",
      a: "Solve it = 0 to find where it crosses, sketch the parabola, then read off the bit the question wants" },
    { q: "x² < 9, what is the solution?", a: "−3 < x < 3 (a single region between the roots)" },
    { q: "x² > 9, what is the solution?", a: "x < −3 or x > 3, two separate bits. Never write it as one joined-up inequality." },
    { q: "Set notation for 'x less than 2 or greater than 5'", a: "{x : x < 2} ∪ {x : x > 5}" },
    { q: "Interval notation: which bracket for a strict inequality?",
      a: "Round ( ) leaves the end number out (< or >); square [ ] includes it (≤ or ≥)" },
    { q: "Dashed or solid line when shading a region?",
      a: "Dashed for strict (< or >), solid for inclusive (≤ or ≥)" },
    { q: "How does the discriminant tell you a line is a tangent to a curve?",
      a: "Put the line into the curve, tidy it into a quadratic, then set b² − 4ac = 0. One touching point means one repeated root." }
  ],

  pu4: [
    { q: "Transformation: y = f(x) + a", a: "Translation UP by a, vector (0, a)" },
    { q: "Transformation: y = f(x + a)", a: "Moves LEFT by a. It goes the opposite way to the sign, which catches people out." },
    { q: "Transformation: y = af(x)", a: "Vertical stretch, scale factor a" },
    { q: "Transformation: y = f(ax)", a: "Squashes sideways by 1/a, one over a, NOT a" },
    { q: "Transformation: y = −f(x)", a: "Reflection in the x-axis" },
    { q: "Transformation: y = f(−x)", a: "Reflection in the y-axis" },
    { q: "Shape of y = 1/x", a: "Two curves, top-right and bottom-left. It gets closer and closer to the x- and y-axes but never touches them (those lines are called asymptotes).",
      svg: "reciprocal" },
    { q: "What happens at a repeated root when sketching a cubic?",
      a: "The curve touches the x-axis and bounces back, instead of going through it" },
    { q: "Shape of y = x³", a: "Goes up the whole way, through (0, 0), flattening off briefly in the middle before carrying on up.",
      svg: "cubic" },
    { q: "What must a sketch always show to get the marks?",
      a: "Where it crosses the x-axis and the y-axis, plus any lines it never touches, all labelled. The marks are for the labels, not for a neat curve." }
  ],

  pu5: [
    { q: "Gradient of the line through (x₁, y₁) and (x₂, y₂)",
      a: "m = (y₂ − y₁) / (x₂ − x₁), change in y over change in x" },
    { q: "Midpoint of (x₁, y₁) and (x₂, y₂)",
      a: "((x₁ + x₂)/2, (y₁ + y₂)/2), average the x's and average the y's" },
    { q: "Distance between (x₁, y₁) and (x₂, y₂)",
      a: "√((x₂ − x₁)² + (y₂ − y₁)²), Pythagoras" },
    { q: "Equation of a line through (x₁, y₁) with gradient m",
      a: "y − y₁ = m(x − x₁)" },
    { q: "Condition for two lines to be perpendicular",
      a: "m₁m₂ = −1, multiply the two gradients and you get −1" },
    { q: "Gradient perpendicular to a line of gradient 2/3", a: "−3/2, turn the fraction upside down and change the sign" },
    { q: "Condition for two lines to be parallel", a: "m₁ = m₂ (and they are not the same line)" },
    { q: "What is a perpendicular bisector?",
      a: "A line that cuts another line exactly in half, at right angles. Find the midpoint, flip the gradient and change its sign, then use y − y₁ = m(x − x₁)." },
    { q: "'Give your answer in the form ax + by + c = 0 where a, b, c are integers', what does that mean?",
      a: "Get everything on one side (= 0) and multiply through so there are no fractions left" },
    { q: "In a linear model, what do the gradient and intercept mean?",
      a: "The gradient is how much y goes up for each 1 you add to x. The intercept is the starting value. Always say what they mean for the actual situation, with units." }
  ],

  pu6: [
    { q: "Equation of a circle, centre (a, b), radius r",
      a: "(x − a)² + (y − b)² = r²" },
    { q: "Centre of (x − 3)² + (y + 2)² = 25", a: "(3, −2) with radius 5, the signs flip, and r² = 25 so r = 5" },
    { q: "How do you find the centre and radius from x² + y² + 2fx + 2gy + c = 0?",
      a: "Complete the square in x and in y, then read off the centre-radius form" },
    { q: "What is the key property of a tangent to a circle?",
      a: "The tangent meets the radius at right angles where it touches. Almost every circle question uses this." },
    { q: "How do you find the equation of a tangent at a point on a circle?",
      a: "Find the gradient of the radius, flip it and change the sign to get the tangent gradient, then use y − y₁ = m(x − x₁)" },
    { q: "What does the perpendicular from the centre of a circle to a chord do?",
      a: "It cuts the chord exactly in half" },
    { q: "Angle in a semicircle", a: "90°, so if a triangle in a circle has a right angle, its longest side is a diameter" },
    { q: "How do you find a circle through three points?",
      a: "Take two pairs of points, find the line that cuts each pair in half at right angles. Where those two lines cross is the centre. The radius is the distance from there to any of the points." },
    { q: "How do you test whether a line meets a circle?",
      a: "Put the line into the circle equation and work out b² − 4ac: more than 0 means it cuts through twice, 0 means it just touches, less than 0 means it misses" }
  ],

  pu7: [
    { q: "State the factor theorem",
      a: "(x − a) is a factor of f(x) if and only if f(a) = 0" },
    { q: "To show (x − 2) is a factor of f(x), what must you write?",
      a: "Actually put 2 in and show the working: f(2) = ... = 0, then say what that proves. Writing 'f(2) = 0' with no working gets no marks." },
    { q: "After showing a linear factor of a cubic, what next?",
      a: "Divide the cubic by that bracket to get a quadratic, then factorise that to find all three answers" },
    { q: "What is proof by deduction?",
      a: "Start from things you know are true and work step by step to the answer, then write a sentence saying you have shown it" },
    { q: "What is proof by exhaustion?",
      a: "Check every possible case one by one. Only works when there is a small number of cases." },
    { q: "How do you disprove a statement?",
      a: "Find one example where it fails, and say clearly that this shows the statement is false" },
    { q: "What is usually the last mark in a proof question?",
      a: "The sentence at the end saying you have shown what was asked. Write it every time." }
  ],

  pu8: [
    { q: "The binomial expansion of (a + b)ⁿ", given: true,
      a: "aⁿ + ⁿC₁aⁿ⁻¹b + ⁿC₂aⁿ⁻²b² + ... + bⁿ, GIVEN in the AS formulae booklet" },
    { q: "Formula for ⁿCᵣ", given: true,
      a: "n! / (r!(n − r)!), GIVEN in the booklet, and on your calculator" },
    { q: "In (a + bx)ⁿ, what is the term in xʳ?",
      a: "ⁿCᵣ × aⁿ⁻ʳ × (bx)ʳ, the number b gets raised to the power too, not just the x" },
    { q: "Expand (2 − 3x)⁵, what is the first term?",
      a: "2⁵ = 32. The whole number gets raised to the power, not just the x." },
    { q: "'Coefficient of x³' versus 'the term in x³', what is the difference?",
      a: "The term includes the x³; the coefficient is only the number in front of it. Check which one they asked for." },
    { q: "How do you use a binomial expansion to approximate (1.02)⁸?",
      a: "Write 1.02 as (1 + 0.02), expand it, and just use the first few terms, the rest are far too small to matter" },
    { q: "What happens to the signs in (a − b)ⁿ?",
      a: "They flip each time: +, −, +, − ... because a minus number to an odd power stays negative" }
  ],

  pu9: [
    { q: "State the sine rule", a: "a/sin A = b/sin B = c/sin C (flip it for finding angles)" },
    { q: "When do you use the sine rule?",
      a: "When you have a side and the angle opposite it as a matching pair" },
    { q: "State the cosine rule", a: "a² = b² + c² − 2bc cos A" },
    { q: "Cosine rule rearranged for an angle",
      a: "cos A = (b² + c² − a²) / 2bc" },
    { q: "When do you use the cosine rule?",
      a: "When you have two sides and the angle between them (to find the third side), or all three sides (to find an angle)" },
    { q: "Area of a triangle from two sides and the included angle",
      a: "Area = ½ab sin C" },
    { q: "What is the ambiguous case of the sine rule?",
      a: "sin θ = sin(180° − θ), so there can be a second, bigger angle that also works. Always check whether the obtuse one fits the triangle." },
    { q: "Period of y = sin x and y = cos x", a: "360° (or 2π radians)" },
    { q: "Period of y = tan x", a: "180° (or π radians)" },
    { q: "Shape of y = sin x", a: "A wave starting at 0, up to 1 at 90°, back to 0 at 180°, down to −1 at 270°.",
      svg: "sin" },
    { q: "Shape of y = cos x", a: "The same wave as sin, but starting at 1 instead of 0, it is the sin curve shifted left by 90°.",
      svg: "cos" },
    { q: "Shape of y = tan x", a: "Repeating steep curves through 0. It shoots off to infinity at 90°, 270° and so on, never touching those lines.",
      svg: "tan" },
    { q: "Amplitude and period of y = a sin(bx)",
      a: "Amplitude a, period 360°/b" }
  ],

  pu10: [
    { q: "The Pythagorean trig identity", a: "sin²θ + cos²θ ≡ 1" },
    { q: "Rearrangements of sin²θ + cos²θ ≡ 1",
      a: "sin²θ ≡ 1 − cos²θ and cos²θ ≡ 1 − sin²θ" },
    { q: "The tangent identity", a: "tan θ ≡ sin θ / cos θ" },
    { q: "Exact values: sin 30°, cos 30°, tan 30°",
      a: "1/2, √3/2, 1/√3 (= √3/3)" },
    { q: "Exact values: sin 45°, cos 45°, tan 45°",
      a: "√2/2 (= 1/√2), √2/2, 1" },
    { q: "Exact values: sin 60°, cos 60°, tan 60°",
      a: "√3/2, 1/2, √3" },
    { q: "Exact values: sin 0°, cos 0°, tan 0°", a: "0, 1, 0" },
    { q: "Exact values: sin 90°, cos 90°, tan 90°", a: "1, 0, undefined" },
    { q: "How do you find every solution in a given interval?",
      a: "Get the first answer from your calculator, then use CAST or a sketch of the graph to find the rest. Missing answers loses more marks than anything else in AS trig." },
    { q: "Solving sin(2x) = c for 0 ≤ x ≤ 360°, what must you do first?",
      a: "Double the range first (0 to 720°), solve for 2x across all of it, then halve every answer you get" },
    { q: "Why must you never divide a trig equation by cos x?",
      a: "You lose all the answers where cos x = 0. Factorise instead of dividing." },
    { q: "How do you solve 2sin²x + 3sin x − 2 = 0?",
      a: "Treat sin x like x in a normal quadratic: factorise to (2sin x − 1)(sin x + 2) = 0. Then solve each bracket, and throw out sin x = −2, because sin can never go below −1." }
  ],

  pu11: [
    { q: "Magnitude of the vector ai + bj", a: "√(a² + b²), Pythagoras" },
    { q: "The vector from A to B in terms of position vectors",
      a: "AB = OB − OA, 'destination minus start'. Getting this backwards is a common slip." },
    { q: "What is a unit vector?", a: "A vector with length exactly 1. Divide a vector by its own length to make one." },
    { q: "How do you show two vectors are parallel?",
      a: "Show that one is just the other multiplied by a number, and write that sentence down" },
    { q: "How do you show three points are collinear?",
      a: "Show two of the vectors between them are parallel and share a point, so all three sit on one straight line" },
    { q: "How do you find the direction of a vector as an angle?",
      a: "Use tan θ = y ÷ x, then check against a quick sketch that the angle is pointing the right way" }
  ],

  pu12: [
    { q: "Differentiation from first principles", given: true,
      a: "f′(x) = lim(h→0) [f(x + h) − f(x)] / h, GIVEN in the AS booklet" },
    { q: "Differentiate xⁿ", a: "nxⁿ⁻¹, multiply by the power, then take one off the power" },
    { q: "What must you do before differentiating √x or 1/x²?",
      a: "Rewrite them as powers first: x^(1/2) and x⁻². Most mistakes happen because people skip this step." },
    { q: "What does dy/dx tell you?", a: "How steep the curve is at that exact point, how fast y is changing" },
    { q: "Gradient of the normal, if the tangent gradient is m",
      a: "−1/m, flip the tangent gradient upside down and change its sign" },
    { q: "How do you find a stationary point?", a: "Set dy/dx = 0 and solve for x" },
    { q: "Second derivative test", a: "Differentiate again. Positive means a minimum (valley), negative means a maximum (hill). If it is 0, that test tells you nothing, check the gradient just either side instead." },
    { q: "What does the mark scheme always want at a stationary point?",
      a: "Proof of whether it is a maximum or a minimum. There is a mark for showing which, not just for finding the point." },
    { q: "When is a function increasing?", a: "When f′(x) > 0" },
    { q: "When is a function decreasing?", a: "When f′(x) < 0" },
    { q: "The optimisation method",
      a: "Write an expression for what you are maximising or minimising. Use the other piece of information to get it down to ONE letter. Differentiate, set it to 0, show whether it is a max or min, then answer what was actually asked (they often want the volume, not x)." }
  ],

  pu13: [
    { q: "Integrate xⁿ", a: "xⁿ⁺¹/(n + 1) + c, add one to the power, then divide by the new power" },
    { q: "What must every indefinite integral have?", a: "+ c, the constant of integration" },
    { q: "How do you find c?", a: "Put in a point the question gives you and solve for c" },
    { q: "How do you evaluate a definite integral?",
      a: "Integrate, put it in square brackets with the two numbers, then work out (top) − (bottom)" },
    { q: "How do you find the area between a curve and the x-axis?",
      a: "Integrate between the two points where it crosses the x-axis. If they are not given, find them first by setting y = 0." },
    { q: "What do you do about area below the x-axis?",
      a: "It comes out negative. Split the integral where the curve crosses, work out each bit separately, then make them all positive before adding, otherwise they cancel each other out." },
    { q: "Area between a curve and a line",
      a: "Integrate (top curve − bottom curve) between the points where they cross. Or work out the area under the curve and take away the triangle or trapezium." },
    { q: "How do you find f(x) given f′(x)?",
      a: "Integrate it, then put in a point they give you to work out c" }
  ],

  pu14: [
    { q: "Log law: log a + log b", a: "log(ab)" },
    { q: "Log law: log a − log b", a: "log(a/b)" },
    { q: "Log law: n log a", a: "log(aⁿ)" },
    { q: "Change of base", given: true, a: "log_a x = log_b x / log_b a, GIVEN in the AS booklet" },
    { q: "e^(x ln a) = ?", given: true, a: "aˣ, GIVEN in the AS booklet" },
    { q: "Is log(x + y) = log x + log y?",
      a: "NO. There is no rule for the log of things added together. You lose marks every time for this one." },
    { q: "What is log_a 1?", a: "0, for any base" },
    { q: "What is log_a a?", a: "1" },
    { q: "How do you solve aˣ = b?", a: "Take logs of both sides, bring the power down: x log a = log b, so x = log b ÷ log a" },
    { q: "What are ln x and eˣ?", a: "They undo each other: ln(eˣ) = x and e^(ln x) = x. ln just means log to base e." },
    { q: "In y = Ae^(kt), what do A and k mean?",
      a: "A is the starting amount (when t = 0). If k is positive it is growing; if k is negative it is shrinking." },
    { q: "y = axⁿ, how do you linearise it?",
      a: "Take logs of both sides: log y = log a + n log x. Plotting log y against log x gives a straight line, its gradient is n and its intercept is log a." },
    { q: "y = kbˣ, how do you linearise it?",
      a: "Take logs of both sides: log y = log k + x log b. Plotting log y against x gives a straight line, its gradient is log b and its intercept is log k." },
    { q: "Why must you check solutions to log equations?",
      a: "You cannot take the log of 0 or a negative number, so throw out any answer that would make you do that" }
  ],

  /* ================= STATISTICS ================= */

  st1: [
    { q: "What is a population?", a: "Everyone or everything you are interested in, the whole group" },
    { q: "What is a census?", a: "When you collect data from every single member of the group, not just some" },
    { q: "What is a sampling frame?", a: "The list of everyone in the group, that you pick your sample from" },
    { q: "What is a sampling unit?", a: "One single member of the group" },
    { q: "Describe simple random sampling",
      a: "Give everyone a number, then pick numbers at random. Everyone has the same chance of being chosen." },
    { q: "Describe systematic sampling",
      a: "Put everyone in a list and take every kth person, where k = group size ÷ sample size. Start from a random point." },
    { q: "Describe stratified sampling",
      a: "Split everyone into groups (called strata), like year groups, then take a sample from each, sized in proportion to how big that group is" },
    { q: "Stratified sample calculation",
      a: "(size of that group ÷ total size) × sample size" },
    { q: "Describe quota sampling",
      a: "You decide in advance how many of each type of person you want, then go and find them. Not random, so it can end up biased." },
    { q: "Describe opportunity (convenience) sampling",
      a: "Just ask whoever happens to be around. Quick and easy, but probably not a fair reflection of everyone." },
    { q: "Advantage and disadvantage of a census",
      a: "It is completely accurate, but it costs a lot, takes a long time, and is impossible if testing wrecks the item" },
    { q: "What must an advantage/disadvantage answer always include?",
      a: "You must mention the actual situation in the question. A general answer that could apply to anything usually gets no marks." },
    { q: "In the large data set, what does 'tr' mean?",
      a: "Trace rainfall, less than 0.05 mm. It is not a number, so do not use it as 0 in a calculation." }
  ],

  st2: [
    { q: "How do you find the median position for n values?",
      a: "The n/2 th value for grouped data; for a discrete list, the (n+1)/2 th value" },
    { q: "Linear interpolation for the median",
      a: "Start at the bottom of the group the median falls in, then add (how far into the group ÷ how many are in it) × the group width. Use the edges of the group, not the middle values." },
    { q: "Sxx formula", given: true,
      a: "Sxx = Σ(xᵢ − x̄)² = Σxᵢ² − (Σxᵢ)²/n, GIVEN in the AS booklet" },
    { q: "Standard deviation formula", given: true,
      a: "√(Sxx/n) or √(Σx²/n − x̄²), GIVEN in the AS booklet" },
    { q: "Standard deviation and variance", given: true,
      a: "Standard deviation = √variance, so variance = sd², GIVEN in the booklet" },
    { q: "IQR", given: true, a: "Q₃ − Q₁, GIVEN in the booklet" },
    { q: "Coding y = (x − a)/b: what happens to the mean?",
      a: "ȳ = (x̄ − a)/b, so x̄ = bȳ + a" },
    { q: "Coding y = (x − a)/b: what happens to the standard deviation?",
      a: "σ_y = σ_x ÷ b. Adding or taking away a does NOT change the spread, only dividing by b does." },
    { q: "If you add 5 to every value, what happens to the standard deviation?",
      a: "Nothing at all. Everything moves up together, so the values are just as spread out. Only the mean changes." },
    { q: "What must you compare when comparing two data sets?",
      a: "BOTH an average (mean or median) AND how spread out they are (standard deviation or IQR), talking about the actual situation. Comparing only averages loses marks." }
  ],

  st3: [
    { q: "Frequency density", a: "frequency ÷ class width" },
    { q: "In a histogram, what represents frequency?",
      a: "The AREA of each bar, not its height. That is the whole point of a histogram." },
    { q: "How do you find a frequency from part of a histogram bar?",
      a: "Take the proportion of that bar's area, width of the part you want ÷ full class width, times the class frequency" },
    { q: "The outlier rule using quartiles",
      a: "Below Q₁ − 1.5×IQR, or above Q₃ + 1.5×IQR" },
    { q: "The outlier rule using standard deviation",
      a: "More than 2 standard deviations away from the mean. The question will tell you which rule to use." },
    { q: "What does a box plot show?",
      a: "Minimum, Q₁, median, Q₃, maximum, with outliers plotted as crosses" },
    { q: "How do you tell skew from a box plot?",
      a: "If the median line sits closer to the left of the box, it is positively skewed. Closer to the right means negatively skewed." },
    { q: "Positive skew in terms of mean and median", a: "mean > median" },
    { q: "Negative skew in terms of mean and median", a: "mean < median" },
    { q: "After identifying an outlier, what must you say?",
      a: "Whether you should take it out, and why. A mistake in recording should go; a real but unusual value can stay." }
  ],

  st4: [
    { q: "What does the PMCC measure?",
      a: "How closely the points follow a straight line, and which way it slopes. Always between −1 and 1." },
    { q: "PMCC close to 1, −1 and 0",
      a: "1 = strong positive linear correlation; −1 = strong negative; 0 = no linear correlation" },
    { q: "In the regression line y = a + bx, what is b?",
      a: "The gradient, how much y goes up for every 1 that x goes up. Always say what that means in the actual situation, with units." },
    { q: "What is the explanatory variable?",
      a: "x, the one you change or control. y is called the response variable, because it responds to x." },
    { q: "Interpolation versus extrapolation",
      a: "Interpolation means predicting inside the range of your data, usually fine. Extrapolation means going outside it, risky, because the pattern might not carry on." },
    { q: "Does correlation prove causation?",
      a: "No. There may be a third factor. Never write 'x causes y' from correlation alone." }
  ],

  st5: [
    { q: "P(A′)", given: true, a: "1 − P(A), GIVEN in the AS booklet" },
    { q: "The addition rule", a: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B)" },
    { q: "What does A ∩ B mean?", a: "A AND B, the overlap, where both happen" },
    { q: "What does A ∪ B mean?", a: "A OR B, or both, everything in either circle" },
    { q: "Condition for mutually exclusive events",
      a: "P(A ∩ B) = 0, they cannot both happen, so the circles do not overlap at all" },
    { q: "Condition for independent events",
      a: "P(A ∩ B) = P(A) × P(B). You have to actually work out both sides and compare them to say they are independent." },
    { q: "How do you fill in a Venn diagram?",
      a: "Fill in the middle overlap first, then work outwards. That way you never count anyone twice." },
    { q: "Sampling without replacement, what changes on a tree diagram?",
      a: "Both the top and bottom of the fraction go down by one on the second set of branches, because one has already been taken" }
  ],

  st6: [
    { q: "The four conditions for a binomial distribution",
      a: "A fixed number of goes (n); each go has only two outcomes (success or fail); the goes do not affect each other; the chance p stays the same every time. Say all four using the actual situation." },
    { q: "Notation for a binomial distribution", a: "X ~ B(n, p)" },
    { q: "P(X = x) for a binomial", a: "ⁿCₓ pˣ (1 − p)ⁿ⁻ˣ" },
    { q: "'At most 5' in cumulative notation", a: "P(X ≤ 5)" },
    { q: "'Fewer than 5'", a: "P(X ≤ 4)" },
    { q: "'More than 5'", a: "1 − P(X ≤ 5)" },
    { q: "'At least 5'", a: "1 − P(X ≤ 4). Being one out here is the most common binomial mistake, ‘at least 5’ includes 5 itself." },
    { q: "P(a ≤ X ≤ b)", a: "P(X ≤ b) − P(X ≤ a − 1)" },
    { q: "How do you criticise a binomial model?",
      a: "Point at one of the four conditions and explain why it does not hold here, usually that the goes affect each other, or the chance does not stay the same" }
  ],

  st7: [
    { q: "What is the null hypothesis?",
      a: "H₀: p = ..., the ‘nothing has changed’ statement that you test against" },
    { q: "What is the alternative hypothesis?",
      a: "H₁: p > ... or p < ... if they say increased/decreased; p ≠ ... if they just say changed. It is whatever the question is claiming." },
    { q: "What do you assume when calculating the test probability?",
      a: "That H₀ is true" },
    { q: "What is the critical region?",
      a: "The results so unlikely that, if you got one, you would say H₀ is wrong" },
    { q: "What is the actual significance level?",
      a: "Add up the probability of everything in the critical region. It is never exactly 5%, because you can only have whole numbers of successes." },
    { q: "What do you do on a two-tailed test at 5%?",
      a: "Halve it, 2.5% in each tail" },
    { q: "How do you decide to reject H₀?",
      a: "If your probability is smaller than the significance level, reject H₀. If not, do not reject it." },
    { q: "How must a conclusion be worded?",
      a: "Talk about evidence, using the actual situation: 'there is enough evidence at the 5% level to suggest that...'. Never say it proves anything." },
    { q: "Why never say a hypothesis test 'proves' something?",
      a: "It only gives evidence, not proof. Even a very unlikely result can still happen by pure chance." }
  ],

  /* ================= MECHANICS ================= */

  me8: [
    { q: "Modelling assumption: 'particle'",
      a: "Treat the object as a single point. Its size does not matter, so you can ignore it spinning or air pushing on it." },
    { q: "Modelling assumption: 'light'", a: "Its mass is so small you treat it as zero, so a light string has no weight" },
    { q: "Modelling assumption: 'inextensible'",
      a: "The string does not stretch, so anything joined by it speeds up at exactly the same rate" },
    { q: "Modelling assumption: 'smooth'", a: "There is no friction" },
    { q: "Modelling assumption: 'rough'", a: "There IS friction acting" },
    { q: "Modelling assumption: 'rigid'", a: "It does not bend, stretch or squash" },
    { q: "Scalar versus vector", a: "A scalar is just a size (mass, speed, distance). A vector has a size AND a direction (weight, velocity, displacement)." },
    { q: "Value of g to use", a: "9.8 m s⁻², and give answers to 3 significant figures" },
    { q: "Convert km/h to m/s", a: "Divide by 3.6. (There are 1000 m in a km and 3600 seconds in an hour.)" },
    { q: "SI unit of force", a: "The newton (N)" }
  ],

  me9: [
    { q: "The five suvat equations", given: true,
      a: "v = u + at; s = ut + ½at²; s = vt − ½at²; v² = u² + 2as; s = ½(u + v)t, ALL GIVEN in the AS booklet" },
    { q: "What do s, u, v, a and t stand for?",
      a: "s = distance moved, u = speed at the start, v = speed at the end, a = acceleration, t = time" },
    { q: "When can suvat be used?",
      a: "ONLY when the acceleration stays the same the whole time. If acceleration changes with t, you have to differentiate or integrate instead." },
    { q: "What is the velocity at the highest point of a vertical throw?",
      a: "Zero. It stops for a moment before falling back, that is how you find the highest point." },
    { q: "What is the acceleration at the highest point of a vertical throw?",
      a: "Still 9.8 m s⁻² downwards. Gravity keeps pulling even when the object has stopped moving." },
    { q: "What is the first thing to do in any vertical motion question?",
      a: "Pick which way is positive and stick to it for everything. Getting the sign of g wrong loses more marks than anything else in Mechanics." },
    { q: "On a velocity-time graph, what is the gradient?", a: "The acceleration" },
    { q: "On a velocity-time graph, what is the area under it?", a: "The displacement" },
    { q: "A ball is thrown from a height and lands below the start. What about the negative root?",
      a: "Check both answers. Throw out any negative time, but if both are positive the larger one is usually when it lands." }
  ],

  me10: [
    { q: "Newton's second law", a: "F = ma, add up all the forces (taking direction into account), and that total equals mass × acceleration" },
    { q: "Newton's first law", a: "Something stays still, or keeps moving at the same speed in the same direction, unless a force acts on it" },
    { q: "Newton's third law", a: "Every action has an equal and opposite reaction" },
    { q: "Weight of a mass m", a: "W = mg, acting vertically downwards (with g = 9.8)" },
    { q: "What is the normal reaction?",
      a: "The push from a surface, at right angles to it. On flat ground with nothing accelerating up or down, R = mg." },
    { q: "In a pulley problem, what is true about the tension?",
      a: "It is the same all the way along the string, as long as the string is light and the pulley is smooth" },
    { q: "In a pulley problem, what is true about the acceleration?",
      a: "Both objects speed up at the same rate, one goes up as the other goes down" },
    { q: "How do you solve connected particles?",
      a: "Write F = ma for each object on its own, taking positive as the way it actually moves, then solve the two equations together" },
    { q: "A lift accelerating upwards, what is the reaction force?",
      a: "R − mg = ma, so R = m(g + a). The floor pushes harder, so you feel heavier." },
    { q: "A lift accelerating downwards, what is the reaction force?",
      a: "mg − R = ma, so R = m(g − a). The floor pushes less, so you feel lighter." },
    { q: "What happens to the tension after a string breaks or a particle lands?",
      a: "The tension drops to zero, and whatever is left just moves under gravity on its own" }
  ],

  me11: [
    { q: "How do you get from displacement to velocity?", a: "Differentiate it (t is the variable)" },
    { q: "How do you get from velocity to acceleration?", a: "Differentiate it again" },
    { q: "How do you get from acceleration back to velocity?", a: "Integrate it, then use the starting values to find c" },
    { q: "How do you get from velocity back to displacement?", a: "Integrate it again, then use the starting values to find c" },
    { q: "What does 'instantaneously at rest' mean?", a: "It means the object has stopped for a moment. Put v = 0 and solve for t." },
    { q: "'At rest' versus 'at the origin'", a: "At rest means it has stopped (v = 0). At the origin means it is back at its starting point (s = 0). Very different things." },
    { q: "How do you find the maximum velocity?",
      a: "The speed stops changing when acceleration is 0. Set dv/dt = 0, solve for t, then put that t back into v." },
    { q: "How do you know whether to use suvat or calculus?",
      a: "If acceleration is given as something involving t, it is changing, use calculus. If it is just a number, use suvat." },
    { q: "What do you always need after integrating?",
      a: "The + c. Find it using the values the question gives you for the start." }
  ]
};

/* Small sketches for the "what does this graph look like" cards. Drawn
   here rather than described in words, because the shape IS the answer. */
const FLASHCARD_SVGS = {
  "parabola-up": 'M10,58 Q40,-6 70,58',
  "parabola-down": 'M10,10 Q40,74 70,10',
  "cubic": 'M8,60 C26,60 26,8 40,34 C54,60 54,8 72,8',
  "reciprocal": 'M42,58 C50,58 62,46 70,10 M10,58 C18,22 30,10 38,10',
  "sin": 'M8,34 C18,4 28,4 38,34 C48,64 58,64 68,34',
  "cos": 'M8,10 C18,10 24,58 38,58 C52,58 58,10 68,10',
  "tan": 'M10,58 C18,44 22,20 26,8 M30,58 C38,44 42,20 46,8 M50,58 C58,44 62,20 66,8'
};

/* Every chapter that has cards, with counts, used by the view. */
function flashcardChapters() {
  return ALL_CHAPTER_IDS.filter(function (cid) {
    const key = cid.replace(CHAPTER_PREFIX, "");
    return FLASHCARDS[key] && FLASHCARDS[key].length;
  });
}

function cardsForChapter(cid) {
  const key = cid.replace(CHAPTER_PREFIX, "");
  const own = (Store.topic(cid).ownCards || []);
  return (FLASHCARDS[key] || []).concat(own);
}

function allCardCount() {
  return Object.keys(FLASHCARDS).reduce(function (n, k) { return n + FLASHCARDS[k].length; }, 0);
}
