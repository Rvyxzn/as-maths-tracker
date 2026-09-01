/* ============================================================
   Chapter learning data — playlists + question bank
   ------------------------------------------------------------
   PLAYLISTS
   Every id below was read directly off the Zeeshan Zamurred
   YouTube channel playlists page (@zeeshanzamurred9280) and is
   titled by chapter, matching our chapter structure exactly.
   Nothing here is guessed.

   Mechanics Chapter 8 (Modelling in Mechanics) has NO playlist
   on the channel. It is left null on purpose — paste your own
   link in the app rather than being sent to a wrong video.

   `count` is the number of videos where it was read from the
   channel; where it was not visible it falls back to the number
   of textbook sections as an estimate you can correct in-app.

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
    playlist: { id: "PLo41lMdYNV1kYoZX3N8PKWuDi5W8RsSOu", count: 6, estimated: true },
    questions: [
      { q: "Simplify (3x²y)³ × 2xy⁻¹, giving your answer in the form ax^m y^n.", marks: 3,
        ms: "(3x²y)³ = 27x⁶y³  [1]\n27x⁶y³ × 2xy⁻¹ = 54x⁷y²  [2]\nAnswer: 54x⁷y²" },
      { q: "Express √48 − √27 in the form a√3, where a is an integer.", marks: 2,
        ms: "√48 = 4√3 and √27 = 3√3  [1]\n4√3 − 3√3 = √3, so a = 1  [1]" },
      { q: "Rationalise the denominator of 6/(3 + √3), giving your answer in the form a + b√3.", marks: 3,
        ms: "Multiply top and bottom by the conjugate (3 − √3)  [1]\n= 6(3 − √3) / (9 − 3) = 6(3 − √3)/6  [1]\n= 3 − √3, so a = 3, b = −1  [1]" }
    ]
  },
  pu2: {
    playlist: { id: "PLo41lMdYNV1n-m6LE7lH8DLwnW-k1T166", count: 6, estimated: true },
    questions: [
      { q: "Write 2x² − 12x + 7 in the form a(x + b)² + c, where a, b and c are constants.", marks: 3,
        ms: "2(x² − 6x) + 7  [1]\n= 2[(x − 3)² − 9] + 7  [1]\n= 2(x − 3)² − 11, so a = 2, b = −3, c = −11  [1]" },
      { q: "The equation x² + kx + 9 = 0 has equal roots. Find the possible values of k.", marks: 3,
        ms: "Equal roots ⇒ b² − 4ac = 0  [1]\nk² − 36 = 0  [1]\nk = 6 or k = −6  [1]" },
      { q: "Solve 2x⁴ − 5x² − 3 = 0, giving your answers in exact form.", marks: 4,
        ms: "Let u = x²: 2u² − 5u − 3 = 0  [1]\n(2u + 1)(u − 3) = 0 ⇒ u = −½ or u = 3  [1]\nu = −½ rejected since x² ≥ 0  [1]\nx² = 3 ⇒ x = ±√3  [1]" }
    ]
  },
  pu3: {
    playlist: { id: "PLo41lMdYNV1lKKiE8WPuFW_9ndkIsgha2", count: 7, estimated: true },
    questions: [
      { q: "Solve the inequality x² − 5x − 14 > 0, giving your answer in set notation.", marks: 3,
        ms: "(x − 7)(x + 2) > 0  [1]\nCritical values x = 7 and x = −2; positive parabola so outside the roots  [1]\n{x : x < −2} ∪ {x : x > 7}  [1]" },
      { q: "Solve the simultaneous equations y = x + 2 and y = x² − 4.", marks: 4,
        ms: "x² − 4 = x + 2  [1]\nx² − x − 6 = 0 ⇒ (x − 3)(x + 2) = 0  [1]\nx = 3 or x = −2  [1]\nx = 3, y = 5 and x = −2, y = 0  [1]" },
      { q: "Find the set of values of k for which x² + kx + k + 3 = 0 has no real roots.", marks: 4,
        ms: "No real roots ⇒ b² − 4ac < 0  [1]\nk² − 4(k + 3) < 0 ⇒ k² − 4k − 12 < 0  [1]\n(k − 6)(k + 2) < 0  [1]\n−2 < k < 6  [1]" }
    ]
  },
  pu4: {
    playlist: { id: "PLo41lMdYNV1mnrskqtpbIFJoI2zq-bd2A", count: 7, estimated: true },
    questions: [
      { q: "Sketch the curve y = x(x − 2)(x + 3), showing clearly where it meets the axes.", marks: 3,
        ms: "Positive cubic shape  [1]\nCuts the x-axis at x = −3, 0 and 2  [1]\nPasses through the origin, so the y-intercept is 0  [1]", sketch: "cubic-three-roots" },
      { q: "The curve y = f(x) has a maximum at (2, 5). State the coordinates of the maximum on y = f(x − 3) + 1.", marks: 2,
        ms: "f(x − 3) translates 3 to the right; + 1 translates 1 up  [1]\nMaximum at (5, 6)  [1]" },
      { q: "Describe fully the single transformation that maps y = f(x) onto y = f(2x).", marks: 2,
        ms: "A stretch parallel to the x-axis  [1]\nScale factor ½ (about the y-axis)  [1]" }
    ]
  },
  pu5: {
    playlist: { id: "PLo41lMdYNV1nG2GVM09B4gxjN1IjJBFa-", count: 5, estimated: true },
    questions: [
      { q: "The line l passes through A(−1, 4) and B(3, −4). Find an equation for l in the form ax + by + c = 0, where a, b and c are integers.", marks: 4,
        ms: "Gradient = (−4 − 4)/(3 − (−1)) = −8/4 = −2  [1]\ny − 4 = −2(x + 1)  [1]\ny = −2x + 2  [1]\n2x + y − 2 = 0  [1]" },
      { q: "Find an equation of the perpendicular bisector of the line segment joining A(1, 2) and B(5, 8).", marks: 4,
        ms: "Midpoint = (3, 5)  [1]\nGradient AB = 6/4 = 3/2, so perpendicular gradient = −2/3  [1]\ny − 5 = −⅔(x − 3)  [1]\n2x + 3y − 21 = 0  [1]" },
      { q: "Show that the point (2, 7) lies on the line 3x − y + 1 = 0.", marks: 1,
        ms: "3(2) − 7 + 1 = 6 − 7 + 1 = 0, so the point lies on the line  [1]" }
    ]
  },
  pu6: {
    playlist: { id: "PLo41lMdYNV1m8EafJw7eQbygliabFXsFJ", count: 5, estimated: true },
    questions: [
      { q: "A circle has equation x² + y² − 6x + 4y − 12 = 0. Find its centre and radius.", marks: 3,
        ms: "(x − 3)² − 9 + (y + 2)² − 4 − 12 = 0  [1]\n(x − 3)² + (y + 2)² = 25  [1]\nCentre (3, −2), radius 5  [1]" },
      { q: "The point P(7, 1) lies on the circle in the previous question. Find an equation of the tangent at P.", marks: 4,
        ms: "Gradient of radius = (1 − (−2))/(7 − 3) = 3/4  [1]\nTangent gradient = −4/3  [1]\ny − 1 = −4/3 (x − 7)  [1]\n4x + 3y − 31 = 0  [1]" },
      { q: "A(1, 1) and B(7, 9) are the ends of a diameter of a circle. Find an equation of the circle.", marks: 3,
        ms: "Centre = midpoint = (4, 5)  [1]\nDiameter = √(6² + 8²) = 10, so radius = 5  [1]\n(x − 4)² + (y − 5)² = 25  [1]" }
    ]
  },
  pu7: {
    playlist: { id: "PLo41lMdYNV1m6VH0PAXbxHv98Vaouzmhl", count: 5, estimated: true },
    questions: [
      { q: "f(x) = 2x³ − 5x² − 4x + 3. Show that (x − 3) is a factor of f(x).", marks: 2,
        ms: "f(3) = 2(27) − 5(9) − 4(3) + 3  [1]\n= 54 − 45 − 12 + 3 = 0, so (x − 3) is a factor  [1]" },
      { q: "Hence factorise f(x) = 2x³ − 5x² − 4x + 3 completely.", marks: 4,
        ms: "Divide: f(x) = (x − 3)(2x² + x − 1)  [2]\n2x² + x − 1 = (2x − 1)(x + 1)  [1]\nf(x) = (x − 3)(2x − 1)(x + 1)  [1]" },
      { q: "Prove that the sum of any two consecutive odd numbers is a multiple of 4.", marks: 3,
        ms: "Let the odd numbers be 2n + 1 and 2n + 3  [1]\nSum = 4n + 4  [1]\n= 4(n + 1), which is a multiple of 4 for all integers n  [1]" }
    ]
  },
  pu8: {
    playlist: { id: "PLo41lMdYNV1lC639HvfPgh3L33jLf0bfj", count: 5, estimated: true },
    questions: [
      { q: "Find the first three terms, in ascending powers of x, of the expansion of (2 + 3x)⁵.", marks: 4,
        ms: "2⁵ = 32  [1]\n5 × 2⁴ × 3x = 240x  [1]\n10 × 2³ × (3x)² = 720x²  [1]\n32 + 240x + 720x²  [1]" },
      { q: "Find the coefficient of x³ in the expansion of (1 − 2x)⁷.", marks: 3,
        ms: "Term = ⁷C₃ (−2x)³  [1]\n= 35 × (−8)x³  [1]\nCoefficient = −280  [1]" },
      { q: "Use the binomial expansion of (1 + x)⁶ to estimate 1.02⁶, giving your answer to 4 decimal places.", marks: 3,
        ms: "(1 + x)⁶ = 1 + 6x + 15x² + 20x³ + …  [1]\nSubstitute x = 0.02: 1 + 0.12 + 0.006 + 0.00016  [1]\n≈ 1.1262  [1]" }
    ]
  },
  pu9: {
    playlist: { id: "PLo41lMdYNV1ldz39sVqG2ORjSnH9e5yHq", count: 8 },
    questions: [
      { q: "In triangle ABC, AB = 7 cm, AC = 9 cm and angle BAC = 52°. Find the length of BC, to 3 significant figures.", marks: 3,
        ms: "Cosine rule: BC² = 7² + 9² − 2(7)(9)cos52°  [1]\n= 49 + 81 − 126 × 0.6157 = 52.4  [1]\nBC = 7.24 cm  [1]" },
      { q: "Find the area of the triangle in the previous question, to 3 significant figures.", marks: 2,
        ms: "Area = ½ × 7 × 9 × sin52°  [1]\n= 31.5 × 0.7880 = 24.8 cm²  [1]" },
      { q: "Sketch y = 2 sin x for 0° ≤ x ≤ 360°, stating the coordinates of the maximum and minimum points.", marks: 3,
        ms: "Correct sine shape, one full cycle  [1]\nMaximum at (90°, 2)  [1]\nMinimum at (270°, −2)  [1]", sketch: "sin-2x" }
    ]
  },
  pu10: {
    playlist: { id: "PLo41lMdYNV1kbzFeHvjgqhuLsR3xZtC3u", count: 8 },
    questions: [
      { q: "Solve 3 sin x = 2 cos x for 0° ≤ x ≤ 360°, giving your answers to 1 decimal place.", marks: 3,
        ms: "Divide by cos x: tan x = 2/3  [1]\nx = 33.7°  [1]\nx = 213.7°  [1]" },
      { q: "Solve 2 sin²x + 3 cos x = 3 for 0° ≤ x ≤ 360°.", marks: 5,
        ms: "Use sin²x = 1 − cos²x: 2 − 2cos²x + 3cos x = 3  [1]\n2cos²x − 3cos x + 1 = 0  [1]\n(2cos x − 1)(cos x − 1) = 0  [1]\ncos x = ½ ⇒ x = 60°, 300°  [1]\ncos x = 1 ⇒ x = 0°, 360°  [1]" },
      { q: "Solve sin(2x + 30°) = 0.5 for 0° ≤ x ≤ 360°.", marks: 4,
        ms: "Let u = 2x + 30°, so 30° ≤ u ≤ 750°  [1]\nsin u = 0.5 ⇒ u = 30°, 150°, 390°, 510°  [2]\n2x = 0°, 120°, 360°, 480° ⇒ x = 0°, 60°, 180°, 240°  [1]" }
    ]
  },
  pu11: {
    playlist: { id: "PLo41lMdYNV1l7Z3xh8tRALo_HlzZOQjom", count: 8 },
    questions: [
      { q: "The vector a = 3i − 4j. Find |a|.", marks: 2,
        ms: "|a| = √(3² + (−4)²)  [1]\n= √25 = 5  [1]" },
      { q: "A has position vector (1, 3) and B has position vector (7, −5). Find AB as a column vector and find |AB|.", marks: 3,
        ms: "AB = OB − OA = (6, −8)  [1]\n|AB| = √(36 + 64)  [1]\n= 10  [1]" },
      { q: "Find the unit vector in the direction of 5i + 12j.", marks: 2,
        ms: "Magnitude = √(25 + 144) = 13  [1]\nUnit vector = (5i + 12j)/13  [1]" }
    ]
  },
  pu12: {
    playlist: { id: "PLo41lMdYNV1mo-rgpxe9xxFSfb0-_P6k5", count: 14 },
    questions: [
      { q: "Given y = 3x⁴ − 2√x, find dy/dx.", marks: 3,
        ms: "Write as 3x⁴ − 2x^½  [1]\nd/dx(3x⁴) = 12x³  [1]\nd/dx(−2x^½) = −x^(−½), so dy/dx = 12x³ − x^(−½)  [1]" },
      { q: "Find an equation of the tangent to the curve y = x² − 4x + 7 at the point where x = 3.", marks: 4,
        ms: "When x = 3, y = 9 − 12 + 7 = 4  [1]\ndy/dx = 2x − 4  [1]\nAt x = 3, gradient = 2  [1]\ny − 4 = 2(x − 3) ⇒ y = 2x − 2  [1]" },
      { q: "The curve C has equation y = x³ − 6x² + 9x. Find the coordinates of the stationary points and determine their nature.", marks: 5,
        ms: "dy/dx = 3x² − 12x + 9 = 3(x − 1)(x − 3)  [1]\nx = 1 ⇒ y = 4; x = 3 ⇒ y = 0  [1]\nd²y/dx² = 6x − 12  [1]\nAt x = 1: −6 < 0, maximum (1, 4)  [1]\nAt x = 3: 6 > 0, minimum (3, 0)  [1]" }
    ]
  },
  pu13: {
    playlist: { id: "PLo41lMdYNV1kUZhVrxovlJihQiahzwivu", count: 9 },
    questions: [
      { q: "Find ∫(6x² − 4x + 5) dx.", marks: 3,
        ms: "2x³  [1]\n− 2x²  [1]\n+ 5x + c  (constant required)  [1]" },
      { q: "Evaluate ∫ from 1 to 3 of (2x + 1) dx.", marks: 3,
        ms: "[x² + x] from 1 to 3  [1]\n= (9 + 3) − (1 + 1)  [1]\n= 10  [1]" },
      { q: "Find the area of the finite region enclosed by the curve y = x(4 − x) and the x-axis.", marks: 4,
        ms: "Curve meets the x-axis at x = 0 and x = 4  [1]\n∫ from 0 to 4 of (4x − x²) dx  [1]\n= [2x² − x³/3] from 0 to 4 = 32 − 64/3  [1]\n= 32/3  [1]", sketch: "area-under-parabola" }
    ]
  },
  pu14: {
    playlist: { id: "PLo41lMdYNV1lo5znVdjcSF8KpGPBSe7hO", count: 8, estimated: true },
    questions: [
      { q: "Solve 3^x = 20, giving your answer to 3 significant figures.", marks: 2,
        ms: "x = log₃20 = (ln 20)/(ln 3)  [1]\n= 2.73  [1]" },
      { q: "Write log₂8 + log₂5 − log₂10 as a single logarithm and hence evaluate it.", marks: 3,
        ms: "= log₂(8 × 5 ÷ 10)  [1]\n= log₂4  [1]\n= 2  [1]" },
      { q: "The population is modelled by P = 200e^(0.05t), where t is in years. Find the value of t when P = 500, to 3 significant figures.", marks: 3,
        ms: "e^(0.05t) = 2.5  [1]\n0.05t = ln 2.5 = 0.9163  [1]\nt = 18.3 years  [1]" }
    ]
  },

  /* ================= STATISTICS ================= */
  st1: {
    playlist: { id: "PLo41lMdYNV1mfw7HrtQY0A40E0DSnE-rH", count: 5 },
    questions: [
      { q: "Explain the difference between a census and a sample, and give one advantage of taking a sample.", marks: 3,
        ms: "A census collects data from every member of the population  [1]\nA sample collects data from part of the population  [1]\nAdvantage: quicker / cheaper / less data to process  [1]" },
      { q: "A school has 600 girls and 400 boys. A stratified sample of 50 students is taken by gender. Find the number of boys in the sample.", marks: 2,
        ms: "400/1000 × 50  [1]\n= 20 boys  [1]" },
      { q: "Give one advantage and one disadvantage of opportunity sampling.", marks: 2,
        ms: "Advantage: easy and inexpensive to carry out  [1]\nDisadvantage: unlikely to be representative / can be biased by the researcher  [1]" }
    ]
  },
  st2: {
    playlist: { id: "PLo41lMdYNV1kPRx-8X7qWWpkRPdH1Nwsl", count: 5, estimated: true },
    questions: [
      { q: "For a set of 10 values, Σx = 250 and Σx² = 6850. Find the mean and the standard deviation.", marks: 4,
        ms: "Mean = 250/10 = 25  [1]\nSxx = 6850 − 250²/10 = 6850 − 6250 = 600  [1]\nVariance = 600/10 = 60  [1]\nSd = √60 = 7.75  [1]" },
      { q: "The data are coded using y = (x − 20)/5. The coded mean is 3 and the coded standard deviation is 2. Find the mean and standard deviation of x.", marks: 3,
        ms: "Mean of x = 5(3) + 20 = 35  [2]\nSd of x = 5 × 2 = 10  [1]" },
      { q: "Explain when the median is a more appropriate measure of location than the mean.", marks: 2,
        ms: "When the data are skewed  [1]\nOr when there are outliers, since the median is not affected by extreme values  [1]" }
    ]
  },
  st3: {
    playlist: { id: "PLo41lMdYNV1lH1t38jUoEuhl2iz2LtIhB", count: 5 },
    questions: [
      { q: "In a histogram, the class 10–20 has frequency 30 and is represented by a bar of area 3 cm². Find the area of the bar representing a class of frequency 45.", marks: 3,
        ms: "3 cm² represents 30, so 1 cm² represents 10  [2]\nArea = 45/10 = 4.5 cm²  [1]" },
      { q: "For a data set Q1 = 12 and Q3 = 28. An outlier is a value more than 1.5 × IQR beyond a quartile. Determine whether 55 is an outlier.", marks: 3,
        ms: "IQR = 28 − 12 = 16  [1]\nUpper limit = 28 + 1.5(16) = 52  [1]\n55 > 52, so it is an outlier  [1]" },
      { q: "A data set has mean 32 and median 28. Describe the skew and justify your answer.", marks: 2,
        ms: "Positive skew  [1]\nBecause the mean is greater than the median  [1]" }
    ]
  },
  st4: {
    playlist: { id: "PLo41lMdYNV1mEpCeZhRPg_jxpiRvwKEJv", count: 4 },
    questions: [
      { q: "The correlation coefficient between hours revised and test score is 0.89. Interpret this value in context.", marks: 2,
        ms: "Strong positive correlation  [1]\nStudents who revised for longer tended to score higher marks  [1]" },
      { q: "A regression line is given by y = 3.2 + 0.45x, where x is hours revised and y is the mark. Interpret the gradient in context.", marks: 2,
        ms: "For each additional hour of revision  [1]\nthe mark increases by 0.45 on average  [1]" },
      { q: "Explain why using this regression line to predict the mark for 40 hours of revision may be unreliable.", marks: 2,
        ms: "40 hours is outside the range of the data collected  [1]\nThis is extrapolation, and the relationship may not continue  [1]" }
    ]
  },
  st5: {
    playlist: { id: "PLo41lMdYNV1m3mP-6Dzs5kiQ3HpRm4KRx", count: 6 },
    questions: [
      { q: "A and B are independent events with P(A) = 0.4 and P(B) = 0.3. Find P(A ∩ B) and P(A ∪ B).", marks: 3,
        ms: "P(A ∩ B) = 0.4 × 0.3 = 0.12  [1]\nP(A ∪ B) = 0.4 + 0.3 − 0.12  [1]\n= 0.58  [1]" },
      { q: "Two cards are drawn without replacement from a standard pack of 52. Find the probability that both are hearts.", marks: 3,
        ms: "13/52 × 12/51  [2]\n= 156/2652 = 1/17 ≈ 0.0588  [1]" },
      { q: "In a group of 40 people, 20 study A, 15 study B and 8 study both. Find the probability that a person chosen at random studies neither.", marks: 3,
        ms: "n(A ∪ B) = 20 + 15 − 8 = 27  [1]\nNeither = 40 − 27 = 13  [1]\nP = 13/40 = 0.325  [1]" }
    ]
  },
  st6: {
    playlist: { id: "PLo41lMdYNV1k4mcgVktfW7EBZcIcRcQ7P", count: 3, estimated: true },
    questions: [
      { q: "The random variable X ~ B(10, 0.3). Find P(X = 4), to 4 decimal places.", marks: 2,
        ms: "P(X = 4) = ¹⁰C₄ (0.3)⁴ (0.7)⁶  [1]\n= 210 × 0.0081 × 0.117649 = 0.2001  [1]" },
      { q: "For X ~ B(10, 0.3), find P(X ≤ 3), to 4 decimal places.", marks: 2,
        ms: "Use the cumulative binomial function on the calculator  [1]\nP(X ≤ 3) = 0.6496  [1]" },
      { q: "State two conditions needed for a binomial model to be appropriate.", marks: 2,
        ms: "A fixed number of independent trials  [1]\nTwo outcomes with a constant probability of success  [1]" }
    ]
  },
  st7: {
    playlist: { id: "PLo41lMdYNV1l1GFUMKxexqSicXzNg5wh4", count: 4, estimated: true },
    questions: [
      { q: "A coin is suspected of being biased towards heads. State suitable null and alternative hypotheses.", marks: 2,
        ms: "H₀: p = 0.5  [1]\nH₁: p > 0.5, where p is the probability of a head  [1]" },
      { q: "X ~ B(20, 0.25). A value of 9 is observed. Test at the 5% level whether the probability of success has increased.", marks: 5,
        ms: "H₀: p = 0.25, H₁: p > 0.25  [1]\nAssume H₀ true, X ~ B(20, 0.25)  [1]\nP(X ≥ 9) = 1 − P(X ≤ 8) = 1 − 0.9591  [1]\n= 0.0409 < 0.05  [1]\nReject H₀; there is sufficient evidence that the probability has increased  [1]" },
      { q: "Explain what is meant by carrying out a test at the 5% significance level.", marks: 2,
        ms: "There is a 5% probability of rejecting the null hypothesis  [1]\nwhen it is in fact true  [1]" }
    ]
  },

  /* ================= MECHANICS ================= */
  me8: {
    /* No playlist for this chapter exists on the channel — left null on
       purpose. Paste your own link in the app. */
    playlist: null,
    questions: [
      { q: "A football is modelled as a particle. State two consequences of this modelling assumption.", marks: 2,
        ms: "The football has no size, so it can be treated as a point mass  [1]\nRotation and air resistance acting on its surface can be ignored  [1]" },
      { q: "Convert 72 km/h into m/s.", marks: 2,
        ms: "72 × 1000 ÷ 3600  [1]\n= 20 m/s  [1]" },
      { q: "Two particles are connected by a light inextensible string. State what each of the words 'light' and 'inextensible' allows you to assume.", marks: 2,
        ms: "Light: the string has no mass, so the tension is the same throughout  [1]\nInextensible: the particles move with the same magnitude of acceleration  [1]" }
    ]
  },
  me9: {
    playlist: { id: "PLo41lMdYNV1n5d5SwSNAODA337gVI4Q3d", count: 7 },
    questions: [
      { q: "A particle moves with constant acceleration 2 m/s² from an initial speed of 5 m/s. Find its speed and displacement after 6 seconds.", marks: 3,
        ms: "v = u + at = 5 + 2(6) = 17 m/s  [1]\ns = ut + ½at² = 30 + ½(2)(36)  [1]\ns = 66 m  [1]" },
      { q: "A ball is projected vertically upwards at 21 m/s. Taking g = 9.8 m/s², find the greatest height reached.", marks: 3,
        ms: "At the greatest height v = 0, and a = −9.8  [1]\nv² = u² + 2as: 0 = 441 − 19.6s  [1]\ns = 22.5 m  [1]" },
      { q: "A car decelerates uniformly from 30 m/s to 12 m/s over a distance of 90 m. Find its acceleration.", marks: 3,
        ms: "v² = u² + 2as: 144 = 900 + 180a  [1]\n180a = −756  [1]\na = −4.2 m/s²  [1]" }
    ]
  },
  me10: {
    playlist: { id: "PLo41lMdYNV1m56gmndnw4hQ39HvP6SrBm", count: 8 },
    questions: [
      { q: "A particle of mass 5 kg is acted on by a force of 40 N to the right and 15 N to the left. Find its acceleration.", marks: 3,
        ms: "Resultant force = 40 − 15 = 25 N  [1]\nF = ma: 25 = 5a  [1]\na = 5 m/s² to the right  [1]" },
      { q: "A person of mass 60 kg stands in a lift accelerating upwards at 2 m/s². Taking g = 9.8, find the normal reaction from the floor.", marks: 3,
        ms: "R − mg = ma  [1]\nR = 60(9.8) + 60(2)  [1]\nR = 708 N  [1]" },
      { q: "Particles of mass 3 kg and 5 kg are connected by a light inextensible string over a smooth pulley and released from rest. Find the acceleration of the system and the tension in the string.", marks: 5,
        ms: "For the 5 kg: 5g − T = 5a; for the 3 kg: T − 3g = 3a  [2]\nAdding: 2g = 8a  [1]\na = 2.45 m/s²  [1]\nT = 3(9.8) + 3(2.45) = 36.75 N  [1]" }
    ]
  },
  me11: {
    playlist: { id: "PLo41lMdYNV1nR8G3u-XCrioD5XeCAghNP", count: 7 },
    questions: [
      { q: "A particle moves so that s = t³ − 6t² + 9t. Find its velocity when t = 4.", marks: 3,
        ms: "v = ds/dt = 3t² − 12t + 9  [2]\nAt t = 4: v = 48 − 48 + 9 = 9 m/s  [1]" },
      { q: "For the same particle, find the times at which it is instantaneously at rest.", marks: 3,
        ms: "3t² − 12t + 9 = 0  [1]\nt² − 4t + 3 = 0 ⇒ (t − 1)(t − 3) = 0  [1]\nt = 1 s and t = 3 s  [1]" },
      { q: "A particle has acceleration a = 6t − 4. Given that v = 2 when t = 0, find v in terms of t.", marks: 3,
        ms: "v = ∫(6t − 4) dt = 3t² − 4t + c  [2]\nt = 0, v = 2 ⇒ c = 2, so v = 3t² − 4t + 2  [1]" }
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
   PDFs you add yourself — see the Past Papers section). */
const PEARSON_PAPERS_URL =
  "https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html";
