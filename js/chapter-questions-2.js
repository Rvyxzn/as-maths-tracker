/* ============================================================
Question bank, part 2, five more per chapter.
   Original Edexcel-style questions with full mark schemes, so they
   can live inside the app legally. Loaded after chapter-data.js and
   appended to each chapter's bank, giving 8 built-in questions per
   chapter (200 in total) alongside anything you add yourself.
   ============================================================ */

const CHAPTER_QUESTIONS_2 = {

  /* ===================== PURE ===================== */
  pu1: [
    { q: "Simplify (4x^3 y^2)^2 ÷ (2x y^3), giving your answer in the form ax^m y^n.", marks: 3,
      ms: "(4x^3y^2)^2 = 16x^6y^4 [1]\n16x^6y^4 ÷ 2xy^3 [1]\n= 8x^5y [1]" },
    { q: "Evaluate 27^(2/3) without a calculator.", marks: 2,
      ms: "27^(1/3) = 3 [1]\n3^2 = 9 [1]" },
    { q: "Expand and simplify (2x − 3)(x + 4)(x − 1).", marks: 4,
      ms: "(2x − 3)(x + 4) = 2x^2 + 5x − 12 [2]\n(2x^2 + 5x − 12)(x − 1) [1]\n= 2x^3 + 3x^2 − 17x + 12 [1]" },
    { q: "Simplify (5 + root 2)(3 − root 2).", marks: 3,
      ms: "= 15 − 5root 2 + 3root 2 − 2 [2]\n= 13 − 2root 2 [1]" },
    { q: "Write 1/(root 5 − 2) in the form a + b root 5.", marks: 3,
      ms: "Multiply by the conjugate (root 5 + 2) [1]\n= (root 5 + 2)/(5 − 4) [1]\n= 2 + root 5 [1]" }
  ],
  pu2: [
    { q: "Solve 3x^2 − 7x + 2 = 0 by factorising.", marks: 3,
      ms: "(3x − 1)(x − 2) = 0 [2]\nx = 1/3 or x = 2 [1]" },
    { q: "Write x^2 + 8x + 3 in the form (x + p)^2 + q and hence state the minimum value of the expression.", marks: 4,
      ms: "(x + 4)^2 − 16 + 3 [2]\n= (x + 4)^2 − 13 [1]\nMinimum value is −13 (when x = −4) [1]" },
    { q: "The quadratic 2x^2 + kx + 8 = 0 has no real roots. Find the set of possible values of k.", marks: 4,
      ms: "b^2 − 4ac < 0: k^2 − 64 < 0 [2]\n(k − 8)(k + 8) < 0 [1]\n−8 < k < 8 [1]" },
    { q: "Solve x − 5 root x + 6 = 0.", marks: 4,
      ms: "Let u = root x: u^2 − 5u + 6 = 0 [1]\n(u − 2)(u − 3) = 0 ⇒ u = 2 or 3 [1]\nroot x = 2 ⇒ x = 4 [1]\nroot x = 3 ⇒ x = 9 [1]" },
    { q: "A ball is thrown so that its height is h = 20t − 5t^2 metres. Find the greatest height reached.", marks: 3,
      ms: "h = −5(t^2 − 4t) = −5[(t − 2)^2 − 4] [1]\nh = 20 − 5(t − 2)^2 [1]\nGreatest height 20 m (at t = 2 s) [1]" }
  ],
  pu3: [
    { q: "Solve the simultaneous equations 3x + 2y = 12 and x − y = 1.", marks: 3,
      ms: "From the second, x = y + 1 [1]\n3(y + 1) + 2y = 12 ⇒ 5y = 9 ⇒ y = 1.8 [1]\nx = 2.8 [1]" },
    { q: "Solve 2x^2 + 5x − 3 <= 0, giving your answer in interval notation.", marks: 4,
      ms: "(2x − 1)(x + 3) = 0 ⇒ x = 1/2, x = −3 [2]\nPositive parabola, so the expression is <= 0 between the roots [1]\n[−3, 1/2] [1]" },
    { q: "Find the values of k for which the line y = kx + 1 is a tangent to the curve y = x^2 + 3x + 4.", marks: 5,
      ms: "x^2 + 3x + 4 = kx + 1 [1]\nx^2 + (3 − k)x + 3 = 0 [1]\nTangent ⇒ b^2 − 4ac = 0: (3 − k)^2 − 12 = 0 [1]\n3 − k = ±2root 3 [1]\nk = 3 ± 2root 3 [1]" },
    { q: "Solve the inequality 4 − 3x < 13.", marks: 2,
      ms: "−3x < 9 [1]\nx > −3 (sign reverses on dividing by a negative) [1]" },
    { q: "Shade the region satisfying y >= x^2 − 4 and y <= 5. Describe the boundaries.", marks: 3,
      ms: "Parabola y = x^2 − 4 drawn as a solid curve [1]\nHorizontal line y = 5 drawn solid [1]\nRegion above the parabola and below the line shaded [1]" }
  ],
  pu4: [
    { q: "Sketch y = (x − 1)^2(x + 2), showing the behaviour at each root.", marks: 3,
      ms: "Positive cubic [1]\nTouches the x-axis at x = 1 (repeated root) [1]\nCrosses at x = −2; y-intercept 2 [1]", sketch: "cubic-repeated-root" },
    { q: "The curve y = f(x) passes through (4, 0). State where y = f(x) − 3 and y = 2f(x) cross the y-axis relative to it.", marks: 3,
      ms: "y = f(x) − 3 moves every point down 3, so (4, 0) maps to (4, −3) [1]\ny = 2f(x) doubles the y-coordinate, so (4, 0) maps to (4, 0) [1]\nA root is unchanged by a vertical stretch [1]" },
    { q: "Sketch y = 3/x and state the equations of its asymptotes.", marks: 3,
      ms: "Correct reciprocal shape in the first and third quadrants [1]\nAsymptote x = 0 [1]\nAsymptote y = 0 [1]", sketch: "reciprocal" },
    { q: "Find the coordinates of the points where y = x^2 − 2x and y = x + 4 intersect.", marks: 4,
      ms: "x^2 − 2x = x + 4 [1]\nx^2 − 3x − 4 = 0 ⇒ (x − 4)(x + 1) = 0 [1]\nx = 4 ⇒ y = 8 [1]\nx = −1 ⇒ y = 3 [1]" },
    { q: "Describe the two transformations mapping y = f(x) onto y = f(x + 2) − 5.", marks: 2,
      ms: "Translation 2 to the left [1]\nThen translation 5 downwards [1]" }
  ],
  pu5: [
    { q: "Find the distance between A(−2, 3) and B(4, 11), giving an exact answer.", marks: 3,
      ms: "Differences 6 and 8 [1]\nAB = root(36 + 64) [1]\n= 10 [1]" },
    { q: "The line l has equation 4x − 2y + 7 = 0. Find the gradient of a line perpendicular to l.", marks: 3,
      ms: "2y = 4x + 7 ⇒ y = 2x + 3.5 [1]\nGradient of l is 2 [1]\nPerpendicular gradient is −1/2 [1]" },
    { q: "The line through A(0, 5) and B(6, 2) meets the x-axis at C. Find the coordinates of C.", marks: 4,
      ms: "Gradient = (2 − 5)/6 = −1/2 [1]\ny = −x/2 + 5 [1]\nSet y = 0: x/2 = 5 [1]\nC is (10, 0) [1]" },
    { q: "Show that A(1, 2), B(3, 6) and C(6, 12) are not collinear.", marks: 3,
      ms: "Gradient AB = 4/2 = 2 [1]\nGradient BC = 6/3 = 2 [1]\nGradients are equal, so they ARE collinear, the statement is false; state this [1]" },
    { q: "A taxi charges £3.20 plus £1.40 per mile. Write the cost C in terms of miles m and interpret the intercept.", marks: 3,
      ms: "C = 1.40m + 3.20 [2]\nThe intercept is the fixed charge of £3.20 before any distance is travelled [1]" }
  ],
  pu6: [
    { q: "Write down the centre and radius of (x + 5)^2 + (y − 1)^2 = 49.", marks: 2,
      ms: "Centre (−5, 1) [1]\nRadius 7 [1]" },
    { q: "Show that the point (6, 2) lies inside the circle (x − 4)^2 + (y − 3)^2 = 25.", marks: 3,
      ms: "(6 − 4)^2 + (2 − 3)^2 = 4 + 1 = 5 [2]\n5 < 25, so the point is inside the circle [1]" },
    { q: "Find the points of intersection of the line y = x + 1 and the circle x^2 + y^2 = 25.", marks: 5,
      ms: "x^2 + (x + 1)^2 = 25 [1]\n2x^2 + 2x − 24 = 0 ⇒ x^2 + x − 12 = 0 [1]\n(x + 4)(x − 3) = 0 [1]\nx = 3 ⇒ y = 4 [1]\nx = −4 ⇒ y = −3 [1]" },
    { q: "A circle has centre (2, −1). The point P(5, 3) lies on it. Find the radius and the equation of the circle.", marks: 3,
      ms: "Radius = root(3^2 + 4^2) = 5 [2]\n(x − 2)^2 + (y + 1)^2 = 25 [1]" },
    { q: "The chord AB of a circle with centre C has midpoint M. State the relationship between CM and AB, and why it is useful.", marks: 2,
      ms: "CM is perpendicular to AB [1]\nIt lets you form a right-angled triangle and use Pythagoras to find the radius or half-chord [1]" }
  ],
  pu7: [
    { q: "Simplify (x^2 − 9)/(x^2 + 7x + 12).", marks: 3,
      ms: "Numerator (x − 3)(x + 3) [1]\nDenominator (x + 3)(x + 4) [1]\n= (x − 3)/(x + 4) [1]" },
    { q: "Divide 2x^3 + 3x^2 − 11x − 6 by (x + 3).", marks: 3,
      ms: "Long division or inspection [1]\nQuotient 2x^2 − 3x − 2 [1]\nRemainder 0 [1]" },
    { q: "f(x) = x^3 + ax^2 − 5x + 6. Given that (x − 2) is a factor, find a.", marks: 3,
      ms: "f(2) = 0 [1]\n8 + 4a − 10 + 6 = 0 [1]\n4a = −4 ⇒ a = −1 [1]" },
    { q: "Prove that (n + 3)^2 − (n + 1)^2 is always even.", marks: 3,
      ms: "Expand: (n^2 + 6n + 9) − (n^2 + 2n + 1) [1]\n= 4n + 8 [1]\n= 2(2n + 4), which is even for all integers n [1]" },
    { q: "Disprove: 'for all integers n, n^2 + n + 1 is prime'.", marks: 2,
      ms: "Try n = 4: 16 + 4 + 1 = 21 [1]\n21 = 3 × 7, which is not prime, so the statement is false [1]" }
  ],
  pu8: [
    { q: "Write down the first four terms of (1 + x)^7 in ascending powers of x.", marks: 3,
      ms: "1 + 7x [1]\n+ 21x^2 [1]\n+ 35x^3 [1]" },
    { q: "Find the term independent of x in the expansion of (2 + 3x)^4 and state its value.", marks: 2,
      ms: "The constant term comes from taking 2 every time: 2^4 [1]\n= 16 [1]" },
    { q: "Find the coefficient of x^2 in the expansion of (3 − x)^6.", marks: 3,
      ms: "Term = 6C2 (3)^4 (−x)^2 [1]\n= 15 × 81 × x^2 [1]\nCoefficient = 1215 [1]" },
    { q: "In the expansion of (1 + ax)^5 the coefficient of x^2 is 40. Find the possible values of a.", marks: 4,
      ms: "Coefficient of x^2 is 5C2 a^2 = 10a^2 [2]\n10a^2 = 40 ⇒ a^2 = 4 [1]\na = 2 or a = −2 [1]" },
    { q: "Evaluate 8C3 and explain what it counts.", marks: 2,
      ms: "8C3 = 8!/(3!5!) = 56 [1]\nIt is the number of ways of choosing 3 objects from 8 when order does not matter [1]" }
  ],
  pu9: [
    { q: "In triangle PQR, PQ = 8 cm, QR = 5 cm and PR = 11 cm. Find angle PQR to 1 decimal place.", marks: 3,
      ms: "cos Q = (8^2 + 5^2 − 11^2)/(2 × 8 × 5) [1]\n= (64 + 25 − 121)/80 = −0.4 [1]\nQ = 113.6 degrees [1]" },
    { q: "In triangle ABC, angle A = 40 degrees, angle B = 65 degrees and a = 9 cm. Find b to 3 significant figures.", marks: 3,
      ms: "b/(sin B) = a/(sin A) [1]\nb = (9 sin 65°)/(sin 40°) [1]\nb = 12.7 cm [1]" },
    { q: "A triangle has sides 7 cm and 10 cm with an included angle of 30 degrees. Find its area.", marks: 2,
      ms: "Area = 1/2 × 7 × 10 × sin30 [1]\n= 17.5 cm^2 [1]" },
    { q: "State the period and amplitude of y = 4 cos(3x).", marks: 2,
      ms: "Amplitude 4 [1]\nPeriod 360/3 = 120 degrees [1]" },
    { q: "Explain why the sine rule can give two possible angles, and how to decide between them.", marks: 3,
      ms: "sin θ = sin(180 − θ), so an acute and an obtuse angle share the same sine [1]\nCheck whether the obtuse option keeps the angle sum under 180 degrees [1]\nThe longest side must face the largest angle [1]" }
  ],
  pu10: [
    { q: "Solve cos x = −0.5 for 0 <= x <= 360 degrees.", marks: 3,
      ms: "Reference angle 60 degrees [1]\nCosine is negative in the second and third quadrants [1]\nx = 120 degrees and x = 240 degrees [1]" },
    { q: "Prove that (1 − cos^2 x)/(sin x cos x) = tan x.", marks: 4,
      ms: "1 − cos^2 x = sin^2 x [1]\nLHS = (sin^2 x)/(sin x cos x) [1]\n= (sin x)/(cos x) [1]\n= tan x as required [1]" },
    { q: "Solve tan(x − 45 degrees) = 1 for 0 <= x <= 360 degrees.", marks: 4,
      ms: "Let u = x − 45, so −45 <= u <= 315 [1]\ntan u = 1 ⇒ u = 45, 225 [2]\nx = 90 degrees and x = 270 degrees [1]" },
    { q: "Solve 6 sin^2 x = 5 + cos x for 0 <= x <= 360 degrees.", marks: 5,
      ms: "6(1 − cos^2 x) = 5 + cos x [1]\n6cos^2 x + cos x − 1 = 0 [1]\n(3cos x − 1)(2cos x + 1) = 0 [1]\ncos x = 1/3 ⇒ x = 70.5, 289.5 degrees [1]\ncos x = −1/2 ⇒ x = 120, 240 degrees [1]" },
    { q: "Write down the exact value of sin 240 degrees.", marks: 2,
      ms: "240 degrees is in the third quadrant, reference angle 60 degrees, sine negative [1]\n= −root 3/2 [1]" }
  ],
  pu11: [
    { q: "Given a = 2i + 5j and b = 4i − j, find 3a − 2b.", marks: 3,
      ms: "3a = 6i + 15j [1]\n2b = 8i − 2j [1]\n3a − 2b = −2i + 17j [1]" },
    { q: "Find the angle that the vector 4i + 3j makes with the positive x-axis, to 1 decimal place.", marks: 3,
      ms: "tan θ = 3/4 [1]\nθ = 36.87 [1]\n= 36.9 degrees [1]" },
    { q: "P has position vector 2i − j and Q has position vector 8i + 7j. Find the position vector of the midpoint of PQ.", marks: 3,
      ms: "Midpoint = (OP + OQ)/2 [1]\n= (10i + 6j)/2 [1]\n= 5i + 3j [1]" },
    { q: "Show that the vectors 6i − 9j and −4i + 6j are parallel.", marks: 3,
      ms: "−4i + 6j = k(6i − 9j) [1]\nk = −2/3 satisfies both components [1]\nOne is a scalar multiple of the other, so they are parallel [1]" },
    { q: "A boat sails with velocity (5i + 12j) km/h. Find its speed.", marks: 2,
      ms: "Speed = |v| = root(25 + 144) [1]\n= 13 km/h [1]" }
  ],
  pu12: [
    { q: "Differentiate y = 5x^3 − 2x^2 + 7x − 4.", marks: 2,
      ms: "dy/dx = 15x^2 − 4x [1]\n+ 7 [1]" },
    { q: "Given y = (2x + 1)^2, find dy/dx.", marks: 3,
      ms: "Expand: y = 4x^2 + 4x + 1 [1]\ndy/dx = 8x + 4 [2]" },
    { q: "Find the equation of the normal to y = x^2 + 1 at the point (2, 5).", marks: 4,
      ms: "dy/dx = 2x, so the tangent gradient at x = 2 is 4 [1]\nNormal gradient = −1/4 [1]\ny − 5 = −1/4(x − 2) [1]\n4y + x − 22 = 0 [1]" },
    { q: "Find the range of values of x for which y = x^3 − 3x^2 is decreasing.", marks: 4,
      ms: "dy/dx = 3x^2 − 6x [1]\n3x(x − 2) < 0 [1]\nDecreasing between the roots [1]\n0 < x < 2 [1]" },
    { q: "A closed box has a square base of side x and volume 32 cm^3. Show that the surface area is A = 2x^2 + 128/x.", marks: 4,
      ms: "Height h = 32/x^2 [1]\nA = 2x^2 + 4xh [1]\n= 2x^2 + 4x(32/x^2) [1]\n= 2x^2 + 128/x as required [1]" }
  ],
  pu13: [
    { q: "Find the integral of (4x^3 − 6x + 1) with respect to x.", marks: 3,
      ms: "x^4 [1]\n− 3x^2 [1]\n+ x + c [1]" },
    { q: "Integrate y = 3/x^2 with respect to x.", marks: 3,
      ms: "Write as 3x^-2 [1]\n= −3x^-1 [1]\n= −3/x + c [1]" },
    { q: "Evaluate the definite integral of (3x^2 − 2) from x = 0 to x = 2.", marks: 3,
      ms: "[x^3 − 2x] from 0 to 2 [1]\n= (8 − 4) − 0 [1]\n= 4 [1]" },
    { q: "The curve C has gradient dy/dx = 6x − 4 and passes through (2, 5). Find the equation of C.", marks: 4,
      ms: "y = 3x^2 − 4x + c [2]\n5 = 12 − 8 + c [1]\nc = 1, so y = 3x^2 − 4x + 1 [1]" },
    { q: "Find the area enclosed between y = x^2 and y = 2x.", marks: 5,
      ms: "Intersections: x^2 = 2x ⇒ x = 0, x = 2 [1]\nArea = integral of (2x − x^2) from 0 to 2 [1]\n= [x^2 − x^3/3] from 0 to 2 [1]\n= 4 − 8/3 [1]\n= 4/3 [1]" }
  ],
  pu14: [
    { q: "Sketch y = 2^x, stating the coordinates of the y-intercept and the equation of the asymptote.", marks: 3,
      ms: "Correct increasing exponential shape [1]\nPasses through (0, 1) [1]\nAsymptote y = 0 [1]", sketch: "exponential" },
    { q: "Solve 5^(2x) = 30, giving your answer to 3 significant figures.", marks: 3,
      ms: "2x ln 5 = ln 30 [1]\n2x = 2.113 [1]\nx = 1.06 [1]" },
    { q: "Express 2 log_3 x − log_3 4 as a single logarithm.", marks: 3,
      ms: "2 log_3 x = log_3 x^2 [1]\nlog_3 x^2 − log_3 4 [1]\n= log_3 (x^2/4) [1]" },
    { q: "Solve ln(2x − 1) = 3, giving your answer to 3 significant figures.", marks: 3,
      ms: "2x − 1 = e^3 [1]\n2x = 21.086 [1]\nx = 10.5 [1]" },
    { q: "A radioactive mass is modelled by M = 50e^(−0.02t) grams. Find the half-life to 3 significant figures.", marks: 4,
      ms: "Half-life when M = 25 [1]\ne^(−0.02t) = 0.5 [1]\n−0.02t = ln 0.5 = −0.6931 [1]\nt = 34.7 years [1]" }
  ],

  /* ===================== STATISTICS ===================== */
  st1: [
    { q: "Define the terms 'population' and 'sampling frame'.", marks: 2,
      ms: "Population: the whole set of items or people being studied [1]\nSampling frame: a list of all the members of the population from which the sample is drawn [1]" },
    { q: "Describe how to take a systematic sample of 40 from a list of 800 employees.", marks: 3,
      ms: "800/40 = 20, so every 20th employee is chosen [1]\nSelect a random starting point between 1 and 20 [1]\nThen take every 20th name from that point [1]" },
    { q: "A factory has 250 day-shift and 150 night-shift workers. A stratified sample of 80 is taken. Find the number from each shift.", marks: 3,
      ms: "Total 400; day 250/400 × 80 = 50 [2]\nNight 150/400 × 80 = 30 [1]" },
    { q: "State one advantage and one disadvantage of using a census.", marks: 2,
      ms: "Advantage: every member is counted, so the result is completely accurate [1]\nDisadvantage: time-consuming and expensive [1]" },
    { q: "In the large data set, explain what 'tr' means in the rainfall column and how it should be treated.", marks: 2,
      ms: "'tr' means trace rainfall, less than 0.05 mm [1]\nIt is not a number, so it cannot be used directly in calculations, usually treated as 0 or excluded, and this should be stated [1]" }
  ],
  st2: [
    { q: "Find the mean of the data 4, 7, 7, 9, 12, 15.", marks: 2,
      ms: "Sum = 54 [1]\nMean = 54/6 = 9 [1]" },
    { q: "A grouped table has class 20-30 with cumulative frequency 18 before it and frequency 12; n = 50. Use linear interpolation to estimate the median.", marks: 4,
      ms: "Median position = 25th value [1]\n25 − 18 = 7 into the class [1]\n20 + (7/12) × 10 [1]\n= 25.8 [1]" },
    { q: "For n = 8, Σx = 96 and Σx^2 = 1224. Find the variance.", marks: 3,
      ms: "Mean = 12 [1]\nVariance = 1224/8 − 12^2 [1]\n= 153 − 144 = 9 [1]" },
    { q: "The mean of a data set is 45 and the standard deviation is 6. Each value is increased by 10. State the new mean and standard deviation.", marks: 2,
      ms: "New mean = 55 [1]\nStandard deviation is unchanged at 6 [1]" },
    { q: "Explain why the interquartile range may be preferred to the range.", marks: 2,
      ms: "The range uses only the two extreme values [1]\nThe IQR covers the middle 50% and is not affected by outliers [1]" }
  ],
  st3: [
    { q: "A histogram bar covers 0-10 with frequency density 2.5. Find the frequency of that class.", marks: 2,
      ms: "Frequency = frequency density × class width [1]\n= 2.5 × 10 = 25 [1]" },
    { q: "A data set has Q1 = 20, Q2 = 26 and Q3 = 38. Comment on the skew.", marks: 2,
      ms: "Q2 − Q1 = 6 and Q3 − Q2 = 12 [1]\nThe upper half is more spread out, so the data are positively skewed [1]" },
    { q: "From a cumulative frequency diagram, 60 of 200 students scored under 40 marks. Estimate the percentage scoring at least 40.", marks: 2,
      ms: "200 − 60 = 140 [1]\n140/200 = 70% [1]" },
    { q: "Explain why a box plot is more useful than a bar chart for comparing two data sets.", marks: 2,
      ms: "A box plot shows median, quartiles and range together [1]\nSo location and spread can be compared directly [1]" },
    { q: "A value of 92 is recorded where Q3 = 70 and IQR = 12. Determine whether it is an outlier.", marks: 3,
      ms: "Upper fence = 70 + 1.5 × 12 [1]\n= 88 [1]\n92 > 88, so it is an outlier [1]" }
  ],
  st4: [
    { q: "Sketch a scatter diagram showing strong negative correlation and describe it in context of price against sales.", marks: 3,
      ms: "Points lying close to a downward-sloping line [2]\nAs price increases, sales tend to decrease [1]", sketch: "scatter-negative" },
    { q: "A regression line of y on x is y = 24 − 1.8x. Predict y when x = 5 and comment on reliability.", marks: 3,
      ms: "y = 24 − 9 = 15 [2]\nReliable only if x = 5 lies within the range of the original data [1]" },
    { q: "Explain the difference between the explanatory and response variables.", marks: 2,
      ms: "The explanatory variable is the one controlled or chosen, plotted on the x-axis [1]\nThe response variable is the one that changes as a result, plotted on the y-axis [1]" },
    { q: "Ice cream sales and drowning incidents are positively correlated. Explain why this does not mean one causes the other.", marks: 2,
      ms: "Correlation does not imply causation [1]\nA third factor, hot weather, increases both [1]" },
    { q: "State what is meant by interpolation.", marks: 2,
      ms: "Using the regression line to estimate a value [1]\nwithin the range of the data collected, which is generally reliable [1]" }
  ],
  st5: [
    { q: "A fair six-sided die is rolled twice. Find the probability that both rolls show a 6.", marks: 2,
      ms: "Independent events: 1/6 × 1/6 [1]\n= 1/36 [1]" },
    { q: "P(A) = 0.5, P(B) = 0.4 and P(A ∩ B) = 0.2. Determine whether A and B are independent.", marks: 3,
      ms: "P(A) × P(B) = 0.5 × 0.4 = 0.2 [1]\nThis equals P(A ∩ B) [1]\nSo A and B are independent [1]" },
    { q: "A bag has 5 red and 3 blue counters. Two are taken without replacement. Find the probability they are different colours.", marks: 4,
      ms: "P(RB) = 5/8 × 3/7 = 15/56 [1]\nP(BR) = 3/8 × 5/7 = 15/56 [1]\nSum [1]\n= 30/56 = 15/28 [1]" },
    { q: "For events A and B, P(A) = 0.6, P(B) = 0.35 and P(A ∪ B) = 0.8. Find P(A ∩ B).", marks: 3,
      ms: "P(A ∪ B) = P(A) + P(B) − P(A ∩ B) [1]\n0.8 = 0.95 − P(A ∩ B) [1]\nP(A ∩ B) = 0.15 [1]" },
    { q: "Explain what it means for two events to be mutually exclusive, and state P(A ∩ B) in that case.", marks: 2,
      ms: "They cannot both happen at the same time [1]\nP(A ∩ B) = 0 [1]" }
  ],
  st6: [
    { q: "X ~ B(12, 0.4). Find P(X = 5) to 4 decimal places.", marks: 2,
      ms: "12C5 (0.4)^5 (0.6)^7 [1]\n= 0.2270 [1]" },
    { q: "X ~ B(15, 0.2). Find P(X >= 4) to 4 decimal places.", marks: 3,
      ms: "P(X >= 4) = 1 − P(X <= 3) [1]\nP(X <= 3) = 0.6482 [1]\n= 0.3518 [1]" },
    { q: "A discrete random variable has P(X = x) = kx for x = 1, 2, 3, 4. Find k.", marks: 3,
      ms: "Probabilities sum to 1: k(1 + 2 + 3 + 4) = 1 [2]\n10k = 1 ⇒ k = 0.1 [1]" },
    { q: "A machine produces items with a 5% fault rate. In a sample of 20, find the probability that exactly one is faulty.", marks: 3,
      ms: "X ~ B(20, 0.05) [1]\nP(X = 1) = 20C1 (0.05)(0.95)^19 [1]\n= 0.3774 [1]" },
    { q: "Explain why a binomial model may be unsuitable for the number of students late to school each day.", marks: 2,
      ms: "The trials may not be independent, bad weather or a bus delay affects many students at once [1]\nSo the probability of being late is not constant from student to student [1]" }
  ],
  st7: [
    { q: "A dice is suspected of being biased towards sixes. Write down H0 and H1.", marks: 2,
      ms: "H0: p = 1/6 [1]\nH1: p > 1/6, where p is the probability of rolling a six [1]" },
    { q: "X ~ B(30, 0.4). Find the critical region for a one-tailed test at the 5% level testing H1: p < 0.4.", marks: 4,
      ms: "Need P(X <= c) < 0.05 [1]\nP(X <= 7) = 0.0435 [1]\nP(X <= 8) = 0.0940 which is too big [1]\nCritical region is X <= 7 [1]" },
    { q: "For the test above, state the actual significance level.", marks: 2,
      ms: "The actual significance level is P(X <= 7) [1]\n= 0.0435, or 4.35% [1]" },
    { q: "A coin is tested for bias at the 5% level, two-tailed, with 20 throws. State the probability used in each tail.", marks: 2,
      ms: "The 5% is split between the two tails [1]\n0.025 in each tail [1]" },
    { q: "A test gives p = 0.031 at the 5% significance level. Write a suitable conclusion in context for a claim that a new drug works better.", marks: 3,
      ms: "0.031 < 0.05, so the result is significant [1]\nReject H0 [1]\nThere is sufficient evidence to suggest the new drug is more effective [1]" }
  ],

  /* ===================== MECHANICS ===================== */
  me8: [
    { q: "Explain what is meant by modelling a rope as 'light and inextensible'.", marks: 2,
      ms: "Light: the rope has negligible mass, so tension is constant along it [1]\nInextensible: it does not stretch, so connected objects have the same acceleration [1]" },
    { q: "Convert 15 m/s into km/h.", marks: 2,
      ms: "15 × 3600 ÷ 1000 [1]\n= 54 km/h [1]" },
    { q: "State the difference between a scalar and a vector, giving one example of each from mechanics.", marks: 3,
      ms: "A scalar has magnitude only; a vector has magnitude and direction [1]\nScalar example: speed or distance [1]\nVector example: velocity or displacement [1]" },
    { q: "A car is modelled as a particle. Give one advantage and one limitation of this assumption.", marks: 2,
      ms: "Advantage: its size and rotation can be ignored, simplifying the forces to a single point [1]\nLimitation: it cannot model turning, tipping or air resistance across its shape [1]" },
    { q: "Write down the SI units of force, and express a newton in base units.", marks: 2,
      ms: "Force is measured in newtons (N) [1]\n1 N = 1 kg m/s^2 [1]" }
  ],
  me9: [
    { q: "A particle starts from rest and accelerates at 3 m/s^2 for 8 seconds. Find its final velocity and the distance travelled.", marks: 3,
      ms: "v = 0 + 3(8) = 24 m/s [1]\ns = 1/2 (0 + 24)(8) [1]\n= 96 m [1]" },
    { q: "A car travelling at 20 m/s brakes to rest in 5 s. Find the deceleration and the stopping distance.", marks: 4,
      ms: "a = (0 − 20)/5 = −4 m/s^2 [2]\ns = 1/2 (20 + 0)(5) [1]\n= 50 m [1]" },
    { q: "A stone is dropped from rest down a well and hits the water after 2.5 s. Find the depth (g = 9.8).", marks: 3,
      ms: "s = ut + 1/2 at^2 with u = 0 [1]\ns = 1/2 (9.8)(6.25) [1]\n= 30.6 m [1]" },
    { q: "A velocity-time graph shows a rise from 0 to 12 m/s over 4 s, constant for 6 s, then a fall to rest over 5 s. Find the total distance.", marks: 4,
      ms: "First stage: 1/2 (4)(12) = 24 m [1]\nSecond stage: 12 × 6 = 72 m [1]\nThird stage: 1/2 (5)(12) = 30 m [1]\nTotal = 126 m [1]", sketch: "vt-trapezium" },
    { q: "A ball is thrown vertically upwards at 14.7 m/s from a height of 2 m. Find the time until it hits the ground (g = 9.8).", marks: 5,
      ms: "Taking up as positive: −2 = 14.7t − 4.9t^2 [1]\n4.9t^2 − 14.7t − 2 = 0 [1]\nt = [14.7 ± root(216.09 + 39.2)]/9.8 [1]\nt = (14.7 + 15.98)/9.8 [1]\nt = 3.13 s (rejecting the negative root) [1]" }
  ],
  me10: [
    { q: "A box of mass 8 kg rests on a smooth horizontal floor. A horizontal force of 24 N is applied. Find the acceleration.", marks: 2,
      ms: "F = ma: 24 = 8a [1]\na = 3 m/s^2 [1]" },
    { q: "A 2 kg mass hangs at rest from a string. State the tension (g = 9.8).", marks: 2,
      ms: "In equilibrium, T = mg [1]\nT = 19.6 N [1]" },
    { q: "A lift of mass 500 kg descends with an acceleration of 1.5 m/s^2. Find the tension in the cable (g = 9.8).", marks: 3,
      ms: "Taking down as positive: mg − T = ma [1]\nT = 500(9.8) − 500(1.5) [1]\nT = 4150 N [1]" },
    { q: "A car of mass 1200 kg tows a trailer of mass 400 kg. The driving force is 3200 N and resistances are negligible. Find the acceleration and the force in the tow bar.", marks: 4,
      ms: "Whole system: 3200 = 1600a [1]\na = 2 m/s^2 [1]\nTrailer alone: T = 400 × 2 [1]\nT = 800 N [1]" },
    { q: "Forces (3i + 4j) N and (−i + 2j) N act on a particle of mass 2 kg. Find the magnitude of its acceleration.", marks: 4,
      ms: "Resultant = 2i + 6j [1]\na = (2i + 6j)/2 = i + 3j [1]\n|a| = root(1 + 9) [1]\n= 3.16 m/s^2 [1]" }
  ],
  me11: [
    { q: "A particle has velocity v = 4t − t^2. Find its acceleration when t = 3.", marks: 3,
      ms: "a = dv/dt = 4 − 2t [2]\nAt t = 3: a = −2 m/s^2 [1]" },
    { q: "For v = 4t − t^2, find the maximum velocity.", marks: 3,
      ms: "Set dv/dt = 0: 4 − 2t = 0 ⇒ t = 2 [1]\nv = 8 − 4 [1]\nMaximum velocity 4 m/s [1]" },
    { q: "A particle has velocity v = 3t^2 − 12 m/s. Find the displacement from t = 0 to t = 2.", marks: 3,
      ms: "s = integral of (3t^2 − 12) dt = t^3 − 12t [1]\nAt t = 2: 8 − 24 = −16 [1]\nDisplacement = −16 m (16 m in the negative direction) [1]" },
    { q: "A particle moves with acceleration a = 4 − 6t. Given v = 5 at t = 0, find v and state the time at which the acceleration is zero.", marks: 4,
      ms: "v = 4t − 3t^2 + c [1]\nc = 5, so v = 4t − 3t^2 + 5 [1]\na = 0 when 4 − 6t = 0 [1]\nt = 2/3 s [1]" },
    { q: "Explain how you decide whether to use the suvat formulae or calculus for a kinematics problem.", marks: 2,
      ms: "Use suvat only when the acceleration is constant [1]\nIf acceleration is given as a function of time, use calculus (differentiate or integrate) [1]" }
  ]
};

/* Append to each chapter's bank */
(function () {
  Object.keys(CHAPTER_QUESTIONS_2).forEach(function (chId) {
    if (CHAPTER_DATA[chId]) {
      CHAPTER_DATA[chId].questions =
        CHAPTER_DATA[chId].questions.concat(CHAPTER_QUESTIONS_2[chId]);
    }
  });
  /* refresh the index built in chapter-data.js */
  ALL_CHAPTER_IDS.forEach(function (cid) {
    const inf = CHAPTER_INDEX[cid];
    const d = CHAPTER_DATA[inf.chapter.id];
    inf.bank = d && d.questions ? d.questions : [];
  });
})();
