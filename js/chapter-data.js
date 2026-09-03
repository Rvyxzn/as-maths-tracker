/* ============================================================
   Chapter learning data, playlists + question bank
   ------------------------------------------------------------
   PLAYLISTS
   All 44 ids below come from the Zeeshan Zamurred YouTube
   channel (@zeeshanzamurred9280). Each one was verified by
   fetching youtube.com/playlist?list=<id> and reading the real
   page title back, so no id is guessed and none is paired with
   a chapter by assumption. Every year and chapter number in the
   playlist title matches the chapter it is attached to here.

   Mechanics Year 1 Chapter 8 (Modelling in Mechanics) is the
   ONE exception: the channel has no playlist for it. A playlist
   of that name exists elsewhere on YouTube but belongs to a
   different channel, so it is left null on purpose. Paste your
   own link in the app rather than being sent to a wrong video.

   `count` is the real number of videos in each playlist, counted
   from the distinct video ids on the playlist page. You can still
   correct it in-app if the channel adds or removes videos.

   QUESTIONS
   Past-paper questions from Yesterday's Maths Exam, PMT and
   Pearson are copyright and cannot be copied into this app, so
   the bank below is ORIGINAL Edexcel-style practice written for
   this tracker, with full mark schemes. Add your own questions
   (typed or as a screenshot) alongside them at any time.
   ============================================================ */

const YT_CHANNEL = "https://www.youtube.com/@zeeshanzamurred9280";

const CHAPTER_DATA = {

  /* ================= PURE ================= */
  pu1: {
    playlist: { id: "PLo41lMdYNV1kYoZX3N8PKWuDi5W8RsSOu", count: 8 },
    questions: [
      { q: "Simplify (3x²y)³ × 2xy⁻¹, giving your answer in the form ax^m y^n.", marks: 3,
        ms: "(3x²y)³ = 27x⁶y³ [1]\n27x⁶y³ × 2xy⁻¹ = 54x⁷y² [2]\nAnswer: 54x⁷y²" },
      { q: "Express √48 − √27 in the form a√3, where a is an integer.", marks: 2,
        ms: "√48 = 4√3 and √27 = 3√3 [1]\n4√3 − 3√3 = √3, so a = 1 [1]" },
      { q: "Rationalise the denominator of 6/(3 + √3), giving your answer in the form a + b√3.", marks: 3,
        ms: "Multiply top and bottom by the conjugate (3 − √3) [1]\n= 6(3 − √3) / (9 − 3) = 6(3 − √3)/6 [1]\n= 3 − √3, so a = 3, b = −1 [1]" }
    ]
  },
  pu2: {
    playlist: { id: "PLo41lMdYNV1n-m6LE7lH8DLwnW-k1T166", count: 8 },
    questions: [
      { q: "Write 2x² − 12x + 7 in the form a(x + b)² + c, where a, b and c are constants.", marks: 3,
        ms: "2(x² − 6x) + 7 [1]\n= 2[(x − 3)² − 9] + 7 [1]\n= 2(x − 3)² − 11, so a = 2, b = −3, c = −11 [1]" },
      { q: "The equation x² + kx + 9 = 0 has equal roots. Find the possible values of k.", marks: 3,
        ms: "Equal roots ⇒ b² − 4ac = 0 [1]\nk² − 36 = 0 [1]\nk = 6 or k = −6 [1]" },
      { q: "Solve 2x⁴ − 5x² − 3 = 0, giving your answers in exact form.", marks: 4,
        ms: "Let u = x²: 2u² − 5u − 3 = 0 [1]\n(2u + 1)(u − 3) = 0 ⇒ u = −½ or u = 3 [1]\nu = −½ rejected since x² ≥ 0 [1]\nx² = 3 ⇒ x = ±√3 [1]" }
    ]
  },
  pu3: {
    playlist: { id: "PLo41lMdYNV1lKKiE8WPuFW_9ndkIsgha2", count: 10 },
    questions: [
      { q: "Solve the inequality x² − 5x − 14 > 0, giving your answer in set notation.", marks: 3,
        ms: "(x − 7)(x + 2) > 0 [1]\nCritical values x = 7 and x = −2; positive parabola so outside the roots [1]\n{x : x < −2} ∪ {x : x > 7} [1]" },
      { q: "Solve the simultaneous equations y = x + 2 and y = x² − 4.", marks: 4,
        ms: "x² − 4 = x + 2 [1]\nx² − x − 6 = 0 ⇒ (x − 3)(x + 2) = 0 [1]\nx = 3 or x = −2 [1]\nx = 3, y = 5 and x = −2, y = 0 [1]" },
      { q: "Find the set of values of k for which x² + kx + k + 3 = 0 has no real roots.", marks: 4,
        ms: "No real roots ⇒ b² − 4ac < 0 [1]\nk² − 4(k + 3) < 0 ⇒ k² − 4k − 12 < 0 [1]\n(k − 6)(k + 2) < 0 [1]\n−2 < k < 6 [1]" }
    ]
  },
  pu4: {
    playlist: { id: "PLo41lMdYNV1mnrskqtpbIFJoI2zq-bd2A", count: 7 },
    questions: [
      { q: "Sketch the curve y = x(x − 2)(x + 3), showing clearly where it meets the axes.", marks: 3,
        ms: "Positive cubic shape [1]\nCuts the x-axis at x = −3, 0 and 2 [1]\nPasses through the origin, so the y-intercept is 0 [1]", sketch: "cubic-three-roots" },
      { q: "The curve y = f(x) has a maximum at (2, 5). State the coordinates of the maximum on y = f(x − 3) + 1.", marks: 2,
        ms: "f(x − 3) translates 3 to the right; + 1 translates 1 up [1]\nMaximum at (5, 6) [1]" },
      { q: "Describe fully the single transformation that maps y = f(x) onto y = f(2x).", marks: 2,
        ms: "A stretch parallel to the x-axis [1]\nScale factor ½ (about the y-axis) [1]" }
    ]
  },
  pu5: {
    playlist: { id: "PLo41lMdYNV1nG2GVM09B4gxjN1IjJBFa-", count: 4 },
    questions: [
      { q: "The line l passes through A(−1, 4) and B(3, −4). Find an equation for l in the form ax + by + c = 0, where a, b and c are integers.", marks: 4,
        ms: "Gradient = (−4 − 4)/(3 − (−1)) = −8/4 = −2 [1]\ny − 4 = −2(x + 1) [1]\ny = −2x + 2 [1]\n2x + y − 2 = 0 [1]" },
      { q: "Find an equation of the perpendicular bisector of the line segment joining A(1, 2) and B(5, 8).", marks: 4,
        ms: "Midpoint = (3, 5) [1]\nGradient AB = 6/4 = 3/2, so perpendicular gradient = −2/3 [1]\ny − 5 = −⅔(x − 3) [1]\n2x + 3y − 21 = 0 [1]" },
      { q: "Show that the point (2, 7) lies on the line 3x − y + 1 = 0.", marks: 1,
        ms: "3(2) − 7 + 1 = 6 − 7 + 1 = 0, so the point lies on the line [1]" }
    ]
  },
  pu6: {
    playlist: { id: "PLo41lMdYNV1m8EafJw7eQbygliabFXsFJ", count: 7 },
    questions: [
      { q: "A circle has equation x² + y² − 6x + 4y − 12 = 0. Find its centre and radius.", marks: 3,
        ms: "(x − 3)² − 9 + (y + 2)² − 4 − 12 = 0 [1]\n(x − 3)² + (y + 2)² = 25 [1]\nCentre (3, −2), radius 5 [1]" },
      { q: "The point P(7, 1) lies on the circle in the previous question. Find an equation of the tangent at P.", marks: 4,
        ms: "Gradient of radius = (1 − (−2))/(7 − 3) = 3/4 [1]\nTangent gradient = −4/3 [1]\ny − 1 = −4/3 (x − 7) [1]\n4x + 3y − 31 = 0 [1]" },
      { q: "A(1, 1) and B(7, 9) are the ends of a diameter of a circle. Find an equation of the circle.", marks: 3,
        ms: "Centre = midpoint = (4, 5) [1]\nDiameter = √(6² + 8²) = 10, so radius = 5 [1]\n(x − 4)² + (y − 5)² = 25 [1]" }
    ]
  },
  pu7: {
    playlist: { id: "PLo41lMdYNV1m6VH0PAXbxHv98Vaouzmhl", count: 8 },
    questions: [
      { q: "f(x) = 2x³ − 5x² − 4x + 3. Show that (x − 3) is a factor of f(x).", marks: 2,
        ms: "f(3) = 2(27) − 5(9) − 4(3) + 3 [1]\n= 54 − 45 − 12 + 3 = 0, so (x − 3) is a factor [1]" },
      { q: "Hence factorise f(x) = 2x³ − 5x² − 4x + 3 completely.", marks: 4,
        ms: "Divide: f(x) = (x − 3)(2x² + x − 1) [2]\n2x² + x − 1 = (2x − 1)(x + 1) [1]\nf(x) = (x − 3)(2x − 1)(x + 1) [1]" },
      { q: "Prove that the sum of any two consecutive odd numbers is a multiple of 4.", marks: 3,
        ms: "Let the odd numbers be 2n + 1 and 2n + 3 [1]\nSum = 4n + 4 [1]\n= 4(n + 1), which is a multiple of 4 for all integers n [1]" }
    ]
  },
  pu8: {
    playlist: { id: "PLo41lMdYNV1lC639HvfPgh3L33jLf0bfj", count: 7 },
    questions: [
      { q: "Find the first three terms, in ascending powers of x, of the expansion of (2 + 3x)⁵.", marks: 4,
        ms: "2⁵ = 32 [1]\n5 × 2⁴ × 3x = 240x [1]\n10 × 2³ × (3x)² = 720x² [1]\n32 + 240x + 720x² [1]" },
      { q: "Find the coefficient of x³ in the expansion of (1 − 2x)⁷.", marks: 3,
        ms: "Term = ⁷C₃ (−2x)³ [1]\n= 35 × (−8)x³ [1]\nCoefficient = −280 [1]" },
      { q: "Use the binomial expansion of (1 + x)⁶ to estimate 1.02⁶, giving your answer to 4 decimal places.", marks: 3,
        ms: "(1 + x)⁶ = 1 + 6x + 15x² + 20x³ + … [1]\nSubstitute x = 0.02: 1 + 0.12 + 0.006 + 0.00016 [1]\n≈ 1.1262 [1]" }
    ]
  },
  pu9: {
    playlist: { id: "PLo41lMdYNV1ldz39sVqG2ORjSnH9e5yHq", count: 8 },
    questions: [
      { q: "In triangle ABC, AB = 7 cm, AC = 9 cm and angle BAC = 52°. Find the length of BC, to 3 significant figures.", marks: 3,
        ms: "Cosine rule: BC² = 7² + 9² − 2(7)(9)cos52° [1]\n= 49 + 81 − 126 × 0.6157 = 52.4 [1]\nBC = 7.24 cm [1]" },
      { q: "Find the area of the triangle in the previous question, to 3 significant figures.", marks: 2,
        ms: "Area = ½ × 7 × 9 × sin52° [1]\n= 31.5 × 0.7880 = 24.8 cm² [1]" },
      { q: "Sketch y = 2 sin x for 0° ≤ x ≤ 360°, stating the coordinates of the maximum and minimum points.", marks: 3,
        ms: "Correct sine shape, one full cycle [1]\nMaximum at (90°, 2) [1]\nMinimum at (270°, −2) [1]", sketch: "sin-2x" }
    ]
  },
  pu10: {
    playlist: { id: "PLo41lMdYNV1kbzFeHvjgqhuLsR3xZtC3u", count: 8 },
    questions: [
      { q: "Solve 3 sin x = 2 cos x for 0° ≤ x ≤ 360°, giving your answers to 1 decimal place.", marks: 3,
        ms: "Divide by cos x: tan x = 2/3 [1]\nx = 33.7° [1]\nx = 213.7° [1]" },
      { q: "Solve 2 sin²x + 3 cos x = 3 for 0° ≤ x ≤ 360°.", marks: 5,
        ms: "Use sin²x = 1 − cos²x: 2 − 2cos²x + 3cos x = 3 [1]\n2cos²x − 3cos x + 1 = 0 [1]\n(2cos x − 1)(cos x − 1) = 0 [1]\ncos x = ½ ⇒ x = 60°, 300° [1]\ncos x = 1 ⇒ x = 0°, 360° [1]" },
      { q: "Solve sin(2x + 30°) = 0.5 for 0° ≤ x ≤ 360°.", marks: 4,
        ms: "Let u = 2x + 30°, so 30° ≤ u ≤ 750° [1]\nsin u = 0.5 ⇒ u = 30°, 150°, 390°, 510° [2]\n2x = 0°, 120°, 360°, 480° ⇒ x = 0°, 60°, 180°, 240° [1]" }
    ]
  },
  pu11: {
    playlist: { id: "PLo41lMdYNV1l7Z3xh8tRALo_HlzZOQjom", count: 8 },
    questions: [
      { q: "The vector a = 3i − 4j. Find |a|.", marks: 2,
        ms: "|a| = √(3² + (−4)²) [1]\n= √25 = 5 [1]" },
      { q: "A has position vector (1, 3) and B has position vector (7, −5). Find AB as a column vector and find |AB|.", marks: 3,
        ms: "AB = OB − OA = (6, −8) [1]\n|AB| = √(36 + 64) [1]\n= 10 [1]" },
      { q: "Find the unit vector in the direction of 5i + 12j.", marks: 2,
        ms: "Magnitude = √(25 + 144) = 13 [1]\nUnit vector = (5i + 12j)/13 [1]" }
    ]
  },
  pu12: {
    playlist: { id: "PLo41lMdYNV1mo-rgpxe9xxFSfb0-_P6k5", count: 14 },
    questions: [
      { q: "Given y = 3x⁴ − 2√x, find dy/dx.", marks: 3,
        ms: "Write as 3x⁴ − 2x^½ [1]\nd/dx(3x⁴) = 12x³ [1]\nd/dx(−2x^½) = −x^(−½), so dy/dx = 12x³ − x^(−½) [1]" },
      { q: "Find an equation of the tangent to the curve y = x² − 4x + 7 at the point where x = 3.", marks: 4,
        ms: "When x = 3, y = 9 − 12 + 7 = 4 [1]\ndy/dx = 2x − 4 [1]\nAt x = 3, gradient = 2 [1]\ny − 4 = 2(x − 3) ⇒ y = 2x − 2 [1]" },
      { q: "The curve C has equation y = x³ − 6x² + 9x. Find the coordinates of the stationary points and determine their nature.", marks: 5,
        ms: "dy/dx = 3x² − 12x + 9 = 3(x − 1)(x − 3) [1]\nx = 1 ⇒ y = 4; x = 3 ⇒ y = 0 [1]\nd²y/dx² = 6x − 12 [1]\nAt x = 1: −6 < 0, maximum (1, 4) [1]\nAt x = 3: 6 > 0, minimum (3, 0) [1]" }
    ]
  },
  pu13: {
    playlist: { id: "PLo41lMdYNV1kUZhVrxovlJihQiahzwivu", count: 9 },
    questions: [
      { q: "Find ∫(6x² − 4x + 5) dx.", marks: 3,
        ms: "2x³ [1]\n− 2x² [1]\n+ 5x + c (constant required) [1]" },
      { q: "Evaluate ∫ from 1 to 3 of (2x + 1) dx.", marks: 3,
        ms: "[x² + x] from 1 to 3 [1]\n= (9 + 3) − (1 + 1) [1]\n= 10 [1]" },
      { q: "Find the area of the finite region enclosed by the curve y = x(4 − x) and the x-axis.", marks: 4,
        ms: "Curve meets the x-axis at x = 0 and x = 4 [1]\n∫ from 0 to 4 of (4x − x²) dx [1]\n= [2x² − x³/3] from 0 to 4 = 32 − 64/3 [1]\n= 32/3 [1]", sketch: "area-under-parabola" }
    ]
  },
  pu14: {
    playlist: { id: "PLo41lMdYNV1lo5znVdjcSF8KpGPBSe7hO", count: 11 },
    questions: [
      { q: "Solve 3^x = 20, giving your answer to 3 significant figures.", marks: 2,
        ms: "x = log₃20 = (ln 20)/(ln 3) [1]\n= 2.73 [1]" },
      { q: "Write log₂8 + log₂5 − log₂10 as a single logarithm and hence evaluate it.", marks: 3,
        ms: "= log₂(8 × 5 ÷ 10) [1]\n= log₂4 [1]\n= 2 [1]" },
      { q: "The population is modelled by P = 200e^(0.05t), where t is in years. Find the value of t when P = 500, to 3 significant figures.", marks: 3,
        ms: "e^(0.05t) = 2.5 [1]\n0.05t = ln 2.5 = 0.9163 [1]\nt = 18.3 years [1]" }
    ]
  },

  /* ================= STATISTICS ================= */
  st1: {
    playlist: { id: "PLo41lMdYNV1mfw7HrtQY0A40E0DSnE-rH", count: 5 },
    questions: [
      { q: "Explain the difference between a census and a sample, and give one advantage of taking a sample.", marks: 3,
        ms: "A census collects data from every member of the population [1]\nA sample collects data from part of the population [1]\nAdvantage: quicker / cheaper / less data to process [1]" },
      { q: "A school has 600 girls and 400 boys. A stratified sample of 50 students is taken by gender. Find the number of boys in the sample.", marks: 2,
        ms: "400/1000 × 50 [1]\n= 20 boys [1]" },
      { q: "Give one advantage and one disadvantage of opportunity sampling.", marks: 2,
        ms: "Advantage: easy and inexpensive to carry out [1]\nDisadvantage: unlikely to be representative / can be biased by the researcher [1]" }
    ]
  },
  st2: {
    playlist: { id: "PLo41lMdYNV1kPRx-8X7qWWpkRPdH1Nwsl", count: 7 },
    questions: [
      { q: "For a set of 10 values, Σx = 250 and Σx² = 6850. Find the mean and the standard deviation.", marks: 4,
        ms: "Mean = 250/10 = 25 [1]\nSxx = 6850 − 250²/10 = 6850 − 6250 = 600 [1]\nVariance = 600/10 = 60 [1]\nSd = √60 = 7.75 [1]" },
      { q: "The data are coded using y = (x − 20)/5. The coded mean is 3 and the coded standard deviation is 2. Find the mean and standard deviation of x.", marks: 3,
        ms: "Mean of x = 5(3) + 20 = 35 [2]\nSd of x = 5 × 2 = 10 [1]" },
      { q: "Explain when the median is a more appropriate measure of location than the mean.", marks: 2,
        ms: "When the data are skewed [1]\nOr when there are outliers, since the median is not affected by extreme values [1]" }
    ]
  },
  st3: {
    playlist: { id: "PLo41lMdYNV1lH1t38jUoEuhl2iz2LtIhB", count: 5 },
    questions: [
      { q: "In a histogram, the class 10-20 has frequency 30 and is represented by a bar of area 3 cm². Find the area of the bar representing a class of frequency 45.", marks: 3,
        ms: "3 cm² represents 30, so 1 cm² represents 10 [2]\nArea = 45/10 = 4.5 cm² [1]" },
      { q: "For a data set Q1 = 12 and Q3 = 28. An outlier is a value more than 1.5 × IQR beyond a quartile. Determine whether 55 is an outlier.", marks: 3,
        ms: "IQR = 28 − 12 = 16 [1]\nUpper limit = 28 + 1.5(16) = 52 [1]\n55 > 52, so it is an outlier [1]" },
      { q: "A data set has mean 32 and median 28. Describe the skew and justify your answer.", marks: 2,
        ms: "Positive skew [1]\nBecause the mean is greater than the median [1]" }
    ]
  },
  st4: {
    playlist: { id: "PLo41lMdYNV1mEpCeZhRPg_jxpiRvwKEJv", count: 4 },
    questions: [
      { q: "The correlation coefficient between hours revised and test score is 0.89. Interpret this value in context.", marks: 2,
        ms: "Strong positive correlation [1]\nStudents who revised for longer tended to score higher marks [1]" },
      { q: "A regression line is given by y = 3.2 + 0.45x, where x is hours revised and y is the mark. Interpret the gradient in context.", marks: 2,
        ms: "For each additional hour of revision [1]\nthe mark increases by 0.45 on average [1]" },
      { q: "Explain why using this regression line to predict the mark for 40 hours of revision may be unreliable.", marks: 2,
        ms: "40 hours is outside the range of the data collected [1]\nThis is extrapolation, and the relationship may not continue [1]" }
    ]
  },
  st5: {
    playlist: { id: "PLo41lMdYNV1m3mP-6Dzs5kiQ3HpRm4KRx", count: 6 },
    questions: [
      { q: "A and B are independent events with P(A) = 0.4 and P(B) = 0.3. Find P(A ∩ B) and P(A ∪ B).", marks: 3,
        ms: "P(A ∩ B) = 0.4 × 0.3 = 0.12 [1]\nP(A ∪ B) = 0.4 + 0.3 − 0.12 [1]\n= 0.58 [1]" },
      { q: "Two cards are drawn without replacement from a standard pack of 52. Find the probability that both are hearts.", marks: 3,
        ms: "13/52 × 12/51 [2]\n= 156/2652 = 1/17 ≈ 0.0588 [1]" },
      { q: "In a group of 40 people, 20 study A, 15 study B and 8 study both. Find the probability that a person chosen at random studies neither.", marks: 3,
        ms: "n(A ∪ B) = 20 + 15 − 8 = 27 [1]\nNeither = 40 − 27 = 13 [1]\nP = 13/40 = 0.325 [1]" }
    ]
  },
  st6: {
    playlist: { id: "PLo41lMdYNV1k4mcgVktfW7EBZcIcRcQ7P", count: 6 },
    questions: [
      { q: "The random variable X ~ B(10, 0.3). Find P(X = 4), to 4 decimal places.", marks: 2,
        ms: "P(X = 4) = ¹⁰C₄ (0.3)⁴ (0.7)⁶ [1]\n= 210 × 0.0081 × 0.117649 = 0.2001 [1]" },
      { q: "For X ~ B(10, 0.3), find P(X ≤ 3), to 4 decimal places.", marks: 2,
        ms: "Use the cumulative binomial function on the calculator [1]\nP(X ≤ 3) = 0.6496 [1]" },
      { q: "State two conditions needed for a binomial model to be appropriate.", marks: 2,
        ms: "A fixed number of independent trials [1]\nTwo outcomes with a constant probability of success [1]" }
    ]
  },
  st7: {
    playlist: { id: "PLo41lMdYNV1l1GFUMKxexqSicXzNg5wh4", count: 7 },
    questions: [
      { q: "A coin is suspected of being biased towards heads. State suitable null and alternative hypotheses.", marks: 2,
        ms: "H₀: p = 0.5 [1]\nH₁: p > 0.5, where p is the probability of a head [1]" },
      { q: "X ~ B(20, 0.25). A value of 9 is observed. Test at the 5% level whether the probability of success has increased.", marks: 5,
        ms: "H₀: p = 0.25, H₁: p > 0.25 [1]\nAssume H₀ true, X ~ B(20, 0.25) [1]\nP(X ≥ 9) = 1 − P(X ≤ 8) = 1 − 0.9591 [1]\n= 0.0409 < 0.05 [1]\nReject H₀; there is sufficient evidence that the probability has increased [1]" },
      { q: "Explain what is meant by carrying out a test at the 5% significance level.", marks: 2,
        ms: "There is a 5% probability of rejecting the null hypothesis [1]\nwhen it is in fact true [1]" }
    ]
  },

  /* ================= MECHANICS ================= */
  me8: {
    /* No playlist for this chapter exists on the channel, left null on
       purpose. Paste your own link in the app. */
    playlist: null,
    questions: [
      { q: "A football is modelled as a particle. State two consequences of this modelling assumption.", marks: 2,
        ms: "The football has no size, so it can be treated as a point mass [1]\nRotation and air resistance acting on its surface can be ignored [1]" },
      { q: "Convert 72 km/h into m/s.", marks: 2,
        ms: "72 × 1000 ÷ 3600 [1]\n= 20 m/s [1]" },
      { q: "Two particles are connected by a light inextensible string. State what each of the words 'light' and 'inextensible' allows you to assume.", marks: 2,
        ms: "Light: the string has no mass, so the tension is the same throughout [1]\nInextensible: the particles move with the same magnitude of acceleration [1]" }
    ]
  },
  me9: {
    playlist: { id: "PLo41lMdYNV1n5d5SwSNAODA337gVI4Q3d", count: 7 },
    questions: [
      { q: "A particle moves with constant acceleration 2 m/s² from an initial speed of 5 m/s. Find its speed and displacement after 6 seconds.", marks: 3,
        ms: "v = u + at = 5 + 2(6) = 17 m/s [1]\ns = ut + ½at² = 30 + ½(2)(36) [1]\ns = 66 m [1]" },
      { q: "A ball is projected vertically upwards at 21 m/s. Taking g = 9.8 m/s², find the greatest height reached.", marks: 3,
        ms: "At the greatest height v = 0, and a = −9.8 [1]\nv² = u² + 2as: 0 = 441 − 19.6s [1]\ns = 22.5 m [1]" },
      { q: "A car decelerates uniformly from 30 m/s to 12 m/s over a distance of 90 m. Find its acceleration.", marks: 3,
        ms: "v² = u² + 2as: 144 = 900 + 180a [1]\n180a = −756 [1]\na = −4.2 m/s² [1]" }
    ]
  },
  me10: {
    playlist: { id: "PLo41lMdYNV1m56gmndnw4hQ39HvP6SrBm", count: 8 },
    questions: [
      { q: "A particle of mass 5 kg is acted on by a force of 40 N to the right and 15 N to the left. Find its acceleration.", marks: 3,
        ms: "Resultant force = 40 − 15 = 25 N [1]\nF = ma: 25 = 5a [1]\na = 5 m/s² to the right [1]" },
      { q: "A person of mass 60 kg stands in a lift accelerating upwards at 2 m/s². Taking g = 9.8, find the normal reaction from the floor.", marks: 3,
        ms: "R − mg = ma [1]\nR = 60(9.8) + 60(2) [1]\nR = 708 N [1]" },
      { q: "Particles of mass 3 kg and 5 kg are connected by a light inextensible string over a smooth pulley and released from rest. Find the acceleration of the system and the tension in the string.", marks: 5,
        ms: "For the 5 kg: 5g − T = 5a; for the 3 kg: T − 3g = 3a [2]\nAdding: 2g = 8a [1]\na = 2.45 m/s² [1]\nT = 3(9.8) + 3(2.45) = 36.75 N [1]" }
    ]
  },
  me11: {
    playlist: { id: "PLo41lMdYNV1nR8G3u-XCrioD5XeCAghNP", count: 7 },
    questions: [
      { q: "A particle moves so that s = t³ − 6t² + 9t. Find its velocity when t = 4.", marks: 3,
        ms: "v = ds/dt = 3t² − 12t + 9 [2]\nAt t = 4: v = 48 − 48 + 9 = 9 m/s [1]" },
      { q: "For the same particle, find the times at which it is instantaneously at rest.", marks: 3,
        ms: "3t² − 12t + 9 = 0 [1]\nt² − 4t + 3 = 0 ⇒ (t − 1)(t − 3) = 0 [1]\nt = 1 s and t = 3 s [1]" },
      { q: "A particle has acceleration a = 6t − 4. Given that v = 2 when t = 0, find v in terms of t.", marks: 3,
        ms: "v = ∫(6t − 4) dt = 3t² − 4t + c [2]\nt = 0, v = 2 ⇒ c = 2, so v = 3t² − 4t + 2 [1]" }
    ]
},

/* ================= PURE, YEAR 2 =================
PLAYLISTS: the Year 1 playlist ids above were each read off the channel
directly. No Year 2 playlist was verified the same way, so every Year 2
chapter is left null rather than pointing you at a guessed link, add
your own in the app and it is remembered. */
pu2c1: {
  playlist: { id: "PLo41lMdYNV1mBKLCyU3yuZ6vN8hddYhFz", count: 11 },
  questions: [
    { q: "Express (5x + 3) / ((x + 3)(x − 1)) in partial fractions.", marks: 4,
      ms: "Let (5x + 3)/((x+3)(x−1)) = A/(x+3) + B/(x−1) [1]\n5x + 3 = A(x − 1) + B(x + 3) [1]\nx = 1: 8 = 4B ⇒ B = 2 [1]\nx = −3: −12 = −4A ⇒ A = 3\nAnswer: 3/(x+3) + 2/(x−1) [1]" },
    { q: "Express (2x + 9) / ((x + 4)²) in the form A/(x + 4) + B/(x + 4)².", marks: 3,
      ms: "2x + 9 = A(x + 4) + B [1]\nx = −4: −8 + 9 = B ⇒ B = 1 [1]\nComparing x terms: A = 2\nAnswer: 2/(x+4) + 1/(x+4)² [1]" },
    { q: "Prove by contradiction that if n² is even then n is even.", marks: 4,
      ms: "Assume n² is even and n is odd [1]\nThen n = 2k + 1 for some integer k [1]\nn² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, which is odd [1]\nThis contradicts n² being even, so n must be even [1]" }
  ]
},
pu2c2: {
  playlist: { id: "PLo41lMdYNV1narKEOjF0Qm3WopATLWQkj", count: 18 },
  questions: [
    { q: "The functions f and g are defined by f(x) = 2x + 1 and g(x) = x², x ∈ ℝ. Find fg(3) and gf(3).", marks: 3,
      ms: "fg(3) = f(9) = 2(9) + 1 = 19 [2]\ngf(3) = g(7) = 49 [1]" },
    { q: "The function f is defined by f(x) = (3x + 2)/(x − 1), x > 1. Find f⁻¹(x) and state its domain.", marks: 5,
      ms: "y = (3x + 2)/(x − 1) ⇒ y(x − 1) = 3x + 2 [1]\nxy − y = 3x + 2 ⇒ xy − 3x = y + 2 [1]\nx(y − 3) = y + 2 ⇒ x = (y + 2)/(y − 3) [1]\nf⁻¹(x) = (x + 2)/(x − 3) [1]\nRange of f is y > 3, so the domain of f⁻¹ is x > 3 [1]" },
    { q: "Solve |2x − 5| = x + 1.", marks: 4,
      ms: "Case 1: 2x − 5 = x + 1 ⇒ x = 6 [1]\nCase 2: −(2x − 5) = x + 1 ⇒ 5 − 2x = x + 1 ⇒ x = 4/3 [1]\nCheck x = 6: |7| = 7 ✓ and x = 4/3: |−7/3| = 7/3 ✓ [1]\nx = 6 or x = 4/3 [1]" }
  ]
},
pu2c3: {
  playlist: { id: "PLo41lMdYNV1lLsYSbrxhWj8KfcCZmXKCR", count: 15 },
  questions: [
    { q: "An arithmetic series has first term 7 and common difference 4. Find the sum of the first 20 terms.", marks: 3,
      ms: "S₂₀ = 20/2 (2(7) + 19(4)) [1]\n= 10(14 + 76) = 10(90) [1]\n= 900 [1]" },
    { q: "A geometric series has first term 12 and common ratio 0.8. Find its sum to infinity, justifying that it converges.", marks: 3,
      ms: "|r| = 0.8 < 1, so the series converges [1]\nS∞ = a/(1 − r) = 12/(1 − 0.8) [1]\n= 12/0.2 = 60 [1]" },
    { q: "The second term of a geometric series is 6 and the fifth term is 48. Find the first term and the common ratio.", marks: 4,
      ms: "ar = 6 and ar⁴ = 48 [1]\nDividing: r³ = 8 [1]\nr = 2 [1]\na = 6/2 = 3 [1]" }
  ]
},
pu2c4: {
  playlist: { id: "PLo41lMdYNV1mR6vOiegRFfsASSSeeeJcY", count: 9 },
  questions: [
    { q: "Find the binomial expansion of (1 + 4x)^(1/2) in ascending powers of x up to and including the term in x², and state the range of validity.", marks: 5,
      ms: "(1+4x)^(1/2) = 1 + (1/2)(4x) + ((1/2)(−1/2)/2!)(4x)² + … [2]\n= 1 + 2x + (−1/8)(16x²) [1]\n= 1 + 2x − 2x² [1]\nValid for |4x| < 1, i.e. |x| < 1/4 [1]" },
    { q: "Expand (4 + x)^(−1/2) in ascending powers of x up to the term in x², and state the range of validity.", marks: 5,
      ms: "(4 + x)^(−1/2) = 4^(−1/2)(1 + x/4)^(−1/2) = ½(1 + x/4)^(−1/2) [2]\n(1 + x/4)^(−1/2) = 1 − (1/2)(x/4) + ((−1/2)(−3/2)/2)(x/4)² + …\n= 1 − x/8 + 3x²/128 [1]\nMultiply by ½: ½ − x/16 + 3x²/256 [1]\nValid for |x/4| < 1, i.e. |x| < 4 [1]" },
    { q: "Use your expansion of (1 + 4x)^(1/2) with x = 0.01 to estimate √1.04, giving your answer to 4 decimal places.", marks: 3,
      ms: "x = 0.01 gives (1 + 0.04)^(1/2) = √1.04 [1]\n1 + 2(0.01) − 2(0.01)² = 1 + 0.02 − 0.0002 [1]\n= 1.0198 [1]" }
  ]
},
pu2c5: {
  playlist: { id: "PLo41lMdYNV1n5TyVi_R-KlRdFJvyWvu7q", count: 9 },
  questions: [
    { q: "A sector of a circle of radius 8 cm subtends an angle of 0.6 radians at the centre. Find its arc length and area.", marks: 3,
      ms: "l = rθ = 8(0.6) = 4.8 cm [1]\nA = ½r²θ = ½(64)(0.6) [1]\n= 19.2 cm² [1]" },
    { q: "A sector of radius 10 cm has an angle of π/3 radians. Find the exact area of the segment cut off by the chord.", marks: 4,
      ms: "Sector area = ½r²θ = ½(100)(π/3) = 50π/3 [1]\nTriangle area = ½r² sin θ = ½(100) sin(π/3) [1]\n= 50(√3/2) = 25√3 [1]\nSegment = 50π/3 − 25√3 cm² [1]" },
    { q: "Solve sin 2x = 0.5 for 0 ≤ x ≤ π, giving your answers in terms of π.", marks: 4,
      ms: "Let u = 2x, so 0 ≤ u ≤ 2π [1]\nsin u = 0.5 ⇒ u = π/6, 5π/6 [2]\nx = π/12, 5π/12 [1]" }
  ]
},
pu2c6: {
  playlist: { id: "PLo41lMdYNV1kw4hRmTFiSAT5rY5IShh0D", count: 11 },
  questions: [
    { q: "Prove that 1 + tan²x = sec²x.", marks: 3,
      ms: "Start from sin²x + cos²x = 1 [1]\nDivide every term by cos²x: sin²x/cos²x + 1 = 1/cos²x [1]\ntan²x + 1 = sec²x as required [1]" },
    { q: "Solve 2 sec²x − 3 tan x − 1 = 0 for 0° ≤ x ≤ 360°.", marks: 5,
      ms: "Use sec²x = 1 + tan²x: 2(1 + tan²x) − 3 tan x − 1 = 0 [1]\n2tan²x − 3tan x + 1 = 0 [1]\n(2tan x − 1)(tan x − 1) = 0 [1]\ntan x = 0.5 ⇒ x = 26.6°, 206.6° [1]\ntan x = 1 ⇒ x = 45°, 225° [1]" },
    { q: "Given that cosec θ = 5/3 and θ is acute, find the exact value of cot θ.", marks: 3,
      ms: "cosec θ = 5/3 ⇒ sin θ = 3/5 [1]\ncos θ = 4/5 (positive as θ is acute) [1]\ncot θ = cos θ / sin θ = (4/5)/(3/5) = 4/3 [1]" }
  ]
},
pu2c7: {
  playlist: { id: "PLo41lMdYNV1lWy3yginlDIPm8RV30z5Oz", count: 17 },
  questions: [
    { q: "Express 3 sin x + 4 cos x in the form R sin(x + α) where R > 0 and 0 < α < 90°.", marks: 4,
      ms: "R = √(3² + 4²) = 5 [2]\ntan α = 4/3 [1]\nα = 53.1°, so 5 sin(x + 53.1°) [1]" },
    { q: "Hence find the maximum value of 3 sin x + 4 cos x and the smallest positive value of x at which it occurs.", marks: 3,
      ms: "Maximum is R = 5, when sin(x + 53.1°) = 1 [1]\nx + 53.1° = 90° [1]\nx = 36.9° [1]" },
    { q: "Given that sin 2θ = 2 sin θ cos θ, solve sin 2θ = sin θ for 0 ≤ θ ≤ 2π.", marks: 5,
      ms: "2 sin θ cos θ − sin θ = 0 [1]\nsin θ(2cos θ − 1) = 0 [1]\nsin θ = 0 ⇒ θ = 0, π, 2π [1]\ncos θ = ½ ⇒ θ = π/3, 5π/3 [1]\nθ = 0, π/3, π, 5π/3, 2π [1]" }
  ]
},
pu2c8: {
  playlist: { id: "PLo41lMdYNV1n5oZPj66Q2kNPMV6ZvI12t", count: 10 },
  questions: [
    { q: "A curve has parametric equations x = 2t, y = t² − 3. Find a Cartesian equation for the curve.", marks: 3,
      ms: "From x = 2t, t = x/2 [1]\ny = (x/2)² − 3 [1]\ny = x²/4 − 3 [1]" },
    { q: "A curve has parametric equations x = 3 cos t, y = 3 sin t. Find a Cartesian equation and describe the curve.", marks: 4,
      ms: "cos t = x/3 and sin t = y/3 [1]\nUsing sin²t + cos²t = 1: (x/3)² + (y/3)² = 1 [1]\nx² + y² = 9 [1]\nA circle centre the origin, radius 3 [1]" },
    { q: "A curve has parametric equations x = t², y = t³ − t. Find dy/dx in terms of t.", marks: 3,
      ms: "dx/dt = 2t [1]\ndy/dt = 3t² − 1 [1]\ndy/dx = (3t² − 1)/(2t) [1]" }
  ]
},
pu2c9: {
  playlist: { id: "PLo41lMdYNV1kf2KATmaDlYnn_GCxdETmM", count: 29 },
  questions: [
    { q: "Differentiate y = x² sin x with respect to x.", marks: 3,
      ms: "Product rule with u = x², v = sin x [1]\ndy/dx = 2x sin x + x² cos x [2]" },
    { q: "Differentiate y = (2x + 1)/(3x − 2) with respect to x, simplifying your answer.", marks: 4,
      ms: "Quotient rule: dy/dx = [(3x−2)(2) − (2x+1)(3)] / (3x−2)² [2]\n= (6x − 4 − 6x − 3)/(3x−2)² [1]\n= −7/(3x − 2)² [1]" },
    { q: "A curve has equation x² + 3xy − y² = 5. Find dy/dx in terms of x and y.", marks: 5,
      ms: "Differentiate term by term: 2x + 3y + 3x(dy/dx) − 2y(dy/dx) = 0 [3]\n(3x − 2y)(dy/dx) = −2x − 3y [1]\ndy/dx = (−2x − 3y)/(3x − 2y) [1]" }
  ]
},
pu2c10: {
  playlist: { id: "PLo41lMdYNV1l5hBis2KQTeE_NlQRsoost", count: 8 },
  questions: [
    { q: "Show that the equation x³ − 4x + 1 = 0 has a root between x = 1 and x = 2.", marks: 3,
      ms: "f(1) = 1 − 4 + 1 = −2 [1]\nf(2) = 8 − 8 + 1 = 1 [1]\nSign change and f(x) is continuous on [1, 2], so a root lies in the interval [1]" },
    { q: "Using x₀ = 2 and the Newton-Raphson method on f(x) = x³ − 4x + 1, find x₁ to 4 decimal places.", marks: 4,
      ms: "f'(x) = 3x² − 4 [1]\nf(2) = 1, f'(2) = 8 [1]\nx₁ = 2 − 1/8 [1]\nx₁ = 1.8750 [1]" },
    { q: "Explain why the Newton-Raphson method would fail if x₀ were chosen close to a turning point of f(x).", marks: 2,
      ms: "At a turning point f'(x) = 0 [1]\nThe formula divides by f'(x₀), so the tangent is nearly horizontal and the next value is far away, or undefined, the iteration diverges [1]" }
  ]
},
pu2c11: {
  playlist: { id: "PLo41lMdYNV1njwJtAqPBNC-9VfRSpDlFQ", count: 36 },
  questions: [
    { q: "Find ∫ 6x / (3x² + 1) dx.", marks: 3,
      ms: "The numerator is the derivative of the denominator [1]\nSo the integral is of the form f'(x)/f(x) [1]\n= ln|3x² + 1| + c [1]" },
    { q: "Use integration by parts to find ∫ x e^(2x) dx.", marks: 4,
      ms: "u = x, dv/dx = e^(2x) ⇒ du/dx = 1, v = ½e^(2x) [1]\n= ½x e^(2x) − ∫ ½e^(2x) dx [1]\n= ½x e^(2x) − ¼e^(2x) [1]\n+ c [1]" },
    { q: "Solve the differential equation dy/dx = 2xy, given that y = 3 when x = 0.", marks: 5,
      ms: "Separate: (1/y) dy = 2x dx [1]\nln|y| = x² + c [2]\nx = 0, y = 3 ⇒ ln 3 = c [1]\ny = 3e^(x²) [1]" }
  ]
},
pu2c12: {
  playlist: { id: "PLo41lMdYNV1lPr1ZJzcrE_uMY48Pj8sYg", count: 8 },
  questions: [
    { q: "Find the magnitude of the vector a = 2i − 3j + 6k.", marks: 2,
      ms: "|a| = √(2² + (−3)² + 6²) = √(4 + 9 + 36) [1]\n= √49 = 7 [1]" },
    { q: "Points A and B have position vectors i + 2j − k and 4i − j + 5k. Find the distance AB.", marks: 3,
      ms: "AB = b − a = 3i − 3j + 6k [1]\n|AB| = √(9 + 9 + 36) = √54 [1]\n= 3√6 [1]" },
    { q: "Find a unit vector in the direction of a = 2i − 3j + 6k.", marks: 2,
      ms: "|a| = 7 [1]\nUnit vector = (1/7)(2i − 3j + 6k) = (2/7)i − (3/7)j + (6/7)k [1]" }
  ]
},

/* ================= STATISTICS, YEAR 2 ================= */
st2c1: {
  playlist: { id: "PLo41lMdYNV1keNegTTWraUtlbbtVI939i", count: 5 },
  questions: [
    { q: "A sample of 12 pairs of data gives a product moment correlation coefficient of 0.62. Test at the 5% level whether there is evidence of positive correlation. The critical value for n = 12 at 5% (one-tailed) is 0.4973.", marks: 4,
      ms: "H₀: ρ = 0, H₁: ρ > 0 [1]\nOne-tailed test, 5%, n = 12, critical value 0.4973 [1]\n0.62 > 0.4973, so reject H₀ [1]\nThere is evidence at the 5% level of positive correlation between the variables [1]" },
    { q: "The variables x and y are related by y = ax^n. Explain how a graph of log y against log x can be used to find a and n.", marks: 3,
      ms: "Taking logs: log y = log a + n log x [1]\nComparing with Y = mX + c, plotting log y against log x gives a straight line [1]\nThe gradient is n and the intercept is log a, so a = 10^(intercept) [1]" },
    { q: "A student finds r = 0.9 between ice cream sales and drowning incidents and concludes that ice cream causes drowning. Comment on this conclusion.", marks: 2,
      ms: "Correlation does not imply causation [1]\nBoth variables are likely driven by a third factor, such as hot weather increasing both swimming and ice cream sales [1]" }
  ]
},
st2c2: {
  playlist: { id: "PLo41lMdYNV1mk1_JB9q2LjTOduVUp_9Mn", count: 7 },
  questions: [
    { q: "Events A and B are such that P(A) = 0.4, P(B) = 0.5 and P(A ∩ B) = 0.2. Find P(A | B).", marks: 2,
      ms: "P(A|B) = P(A ∩ B)/P(B) = 0.2/0.5 [1]\n= 0.4 [1]" },
    { q: "For the events in the previous question, determine whether A and B are independent.", marks: 3,
      ms: "P(A) × P(B) = 0.4 × 0.5 = 0.2 [1]\nP(A ∩ B) = 0.2 [1]\nThese are equal, so A and B are independent [1]" },
    { q: "A bag holds 5 red and 3 blue counters. Two are taken without replacement. Find the probability that both are red.", marks: 3,
      ms: "P(first red) = 5/8 [1]\nP(second red | first red) = 4/7 [1]\nP(both red) = 5/8 × 4/7 = 20/56 = 5/14 [1]" }
  ]
},
st2c3: {
  playlist: { id: "PLo41lMdYNV1kza6lC3k-OqQMbgal-wuo6", count: 11 },
  questions: [
    { q: "The random variable X ~ N(50, 8²). Find P(X < 56).", marks: 3,
      ms: "Z = (56 − 50)/8 = 0.75 [1]\nP(Z < 0.75) [1]\n= 0.7734 [1]" },
    { q: "X ~ N(μ, σ²). Given P(X < 20) = 0.1 and P(X < 35) = 0.9, find μ and σ.", marks: 6,
      ms: "P(Z < z) = 0.1 ⇒ z = −1.2816; P(Z < z) = 0.9 ⇒ z = 1.2816 [2]\n(20 − μ)/σ = −1.2816 and (35 − μ)/σ = 1.2816 [1]\nSubtracting: 15/σ = 2.5632 [1]\nσ = 5.85 [1]\nμ = 20 + 1.2816(5.85) = 27.5 [1]" },
    { q: "X ~ B(100, 0.4) is approximated by a normal distribution. State the approximating distribution and use it to estimate P(X ≥ 45), applying a continuity correction.", marks: 4,
      ms: "μ = np = 40, σ² = np(1−p) = 24, so Y ~ N(40, 24) [2]\nContinuity correction: P(X ≥ 45) ≈ P(Y > 44.5) [1]\nZ = (44.5 − 40)/√24 = 0.9186, giving P ≈ 0.179 [1]" }
  ]
},

/* ================= MECHANICS, YEAR 2 ================= */
me2c4: {
  playlist: { id: "PLo41lMdYNV1nPd1IXh1uIwsKzCbhBSqK6", count: 7 },
  questions: [
    { q: "A uniform rod AB of length 4 m and mass 6 kg rests horizontally on supports at A and B. A mass of 10 kg is placed 1 m from A. Find the reaction at A. Take g = 9.8.", marks: 5,
      ms: "Weight of rod 6g acts at the midpoint, 2 m from A [1]\nTaking moments about B: R_A(4) = 6g(2) + 10g(3) [2]\n4R_A = 12g + 30g = 42g [1]\nR_A = 10.5g = 102.9 N [1]" },
    { q: "A non-uniform rod AB of length 3 m and mass 5 kg balances on a pivot 1.2 m from A. Find the distance of the centre of mass from A.", marks: 3,
      ms: "For the rod to balance, the centre of mass must be at the pivot [2]\nDistance from A = 1.2 m [1]" },
    { q: "A uniform rod of mass 8 kg and length 6 m rests on supports at A and C, where C is 4 m from A. A mass m is placed at B, the far end. Find m when the rod is on the point of tilting about C.", marks: 4,
      ms: "On the point of tilting about C, the reaction at A is zero [1]\nMoments about C: 8g(1) = mg(2) [2]\nm = 4 kg [1]" }
  ]
},
me2c5: {
  playlist: { id: "PLo41lMdYNV1k5OgYqd7gQcUin6FjrYPpR", count: 5 },
  questions: [
    { q: "A block of mass 4 kg rests on a rough horizontal surface with coefficient of friction 0.3. Find the least horizontal force needed to move it. Take g = 9.8.", marks: 3,
      ms: "R = mg = 4(9.8) = 39.2 N [1]\nF_max = μR = 0.3(39.2) [1]\n= 11.76 N [1]" },
    { q: "A particle of mass 5 kg is on a smooth plane inclined at 30° to the horizontal. Find its acceleration down the slope.", marks: 3,
      ms: "Down the slope: mg sin 30° = ma [1]\na = g sin 30° = 9.8(0.5) [1]\n= 4.9 m/s² [1]" },
    { q: "A particle of mass 2 kg slides down a rough plane inclined at 25°, with coefficient of friction 0.2. Find its acceleration.", marks: 5,
      ms: "Perpendicular: R = mg cos 25° = 2(9.8)cos 25° = 17.76 N [1]\nFriction F = μR = 0.2(17.76) = 3.55 N [1]\nDown the slope: mg sin 25° − F = ma [1]\n2(9.8)sin 25° − 3.55 = 2a ⇒ 8.28 − 3.55 = 2a [1]\na = 2.37 m/s² [1]" }
  ]
},
me2c6: {
  playlist: { id: "PLo41lMdYNV1mFUEt-7smdqd1AdAUM5q7X", count: 7 },
  questions: [
    { q: "A ball is thrown horizontally at 15 m/s from a height of 20 m. Find the time it takes to reach the ground. Take g = 9.8.", marks: 3,
      ms: "Vertically: s = ut + ½at², with u = 0 [1]\n20 = ½(9.8)t² [1]\nt² = 4.0816 ⇒ t = 2.02 s [1]" },
    { q: "For the same ball, find the horizontal distance travelled before it lands.", marks: 2,
      ms: "Horizontal velocity is constant at 15 m/s [1]\nx = 15(2.02) = 30.3 m [1]" },
    { q: "A projectile is launched at 20 m/s at 30° above the horizontal. Find its greatest height above the point of projection.", marks: 4,
      ms: "Initial vertical component = 20 sin 30° = 10 m/s [1]\nAt greatest height v = 0, using v² = u² + 2as [1]\n0 = 100 − 2(9.8)s [1]\ns = 5.10 m [1]" }
  ]
},
me2c7: {
  playlist: { id: "PLo41lMdYNV1kphodGG4PCibacTWyA413R", count: 12 },
  questions: [
    { q: "A uniform ladder of mass 20 kg and length 5 m rests against a smooth vertical wall on rough horizontal ground, at 60° to the ground. Find the normal reaction from the wall. Take g = 9.8.", marks: 5,
      ms: "Let S be the reaction at the wall, acting horizontally [1]\nTaking moments about the base: S(5 sin 60°) = 20g(2.5 cos 60°) [2]\nS(4.330) = 20(9.8)(1.25) = 245 [1]\nS = 56.6 N [1]" },
    { q: "For the same ladder, find the least coefficient of friction at the ground for it to remain in equilibrium.", marks: 4,
      ms: "Vertically: R = 20g = 196 N [1]\nHorizontally: F = S = 56.6 N [1]\nFor equilibrium F ≤ μR, so μ ≥ 56.6/196 [1]\nμ ≥ 0.289 [1]" },
    { q: "A particle of mass 3 kg rests in equilibrium on a rough plane inclined at 20°. Find the frictional force acting on it.", marks: 3,
      ms: "In equilibrium, friction balances the component of weight down the slope [1]\nF = mg sin 20° = 3(9.8) sin 20° [1]\n= 10.1 N up the slope [1]" }
  ]
},
me2c8: {
  playlist: { id: "PLo41lMdYNV1l8qJbJM-tq12VWzDlg_C2B", count: 8 },
  questions: [
    { q: "A particle has position vector r = (t² − 2t)i + (3t)j metres. Find its velocity when t = 3.", marks: 3,
      ms: "v = dr/dt = (2t − 2)i + 3j [2]\nAt t = 3: v = 4i + 3j m/s [1]" },
    { q: "For the same particle, find its speed when t = 3.", marks: 2,
      ms: "Speed = |4i + 3j| = √(16 + 9) [1]\n= 5 m/s [1]" },
    { q: "A particle has acceleration a = (6t)i − 4j m/s². Given that v = 2i + j when t = 0, find v in terms of t.", marks: 4,
      ms: "v = ∫a dt = (3t²)i − (4t)j + c [2]\nt = 0: v = c = 2i + j [1]\nv = (3t² + 2)i + (1 − 4t)j [1]" }
  ]
  }
};

/* Attach to the chapter index so views can reach it directly */
(function () {
  ALL_CHAPTER_IDS.forEach(function (cid) {
    const inf = CHAPTER_INDEX[cid];
    const d = CHAPTER_DATA[inf.chapter.id];
    inf.playlist = d && d.playlist ? d.playlist : null;
    inf.bank = d && d.questions ? d.questions : [];
  });
})();

/* Official Pearson landing page for past papers (papers themselves are
  PDFs you add yourself, see the Past Papers section). */
const PEARSON_PAPERS_URL =
  "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html";
