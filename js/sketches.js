/* ============================================================
   Sketches — drawn answers.

   Some questions ask you to sketch something, and the answer is a
   picture. Describing it in words ("correct sine shape, one full
   cycle") tells you whether you were right only if you already
   know what right looks like, so those mark schemes show the
   curve as well.

   Everything here is drawn from the maths — the sine curve's peak
   really is a quarter of the way along, the cubic really does
   touch rather than cross at a repeated root. Nothing is traced
   from a textbook or a mark scheme.

   Geometry note: a cubic Bézier with both control points at height
   c has its midpoint at (y0 + 3c + 3c + y3)/8, so to make a hump
   actually reach the amplitude the controls have to overshoot it.
   That is why the control heights below sit outside the curve.
   ============================================================ */

const SKETCH = (function () {

  const W = 260, H = 150;

  function frame(inner, opts) {
    opts = opts || {};
    return '<svg class="sk" viewBox="0 0 ' + W + ' ' + H + '" role="img" ' +
      'aria-label="' + (opts.alt || "Sketch") + '">' + inner + '</svg>';
  }

  /* axes with optional labels at the ends */
  function axes(x0, x1, y0, y1, yAxisX, xAxisY) {
    return '<line class="sk-ax" x1="' + x0 + '" y1="' + xAxisY + '" x2="' + x1 + '" y2="' + xAxisY + '"/>' +
           '<line class="sk-ax" x1="' + yAxisX + '" y1="' + y0 + '" x2="' + yAxisX + '" y2="' + y1 + '"/>' +
           '<text class="sk-t" x="' + (x1 - 4) + '" y="' + (xAxisY - 6) + '" text-anchor="end">x</text>' +
           '<text class="sk-t" x="' + (yAxisX + 6) + '" y="' + (y0 + 10) + '">y</text>';
  }

  function dot(x, y, label, anchor, dy) {
    return '<circle class="sk-pt" cx="' + x + '" cy="' + y + '" r="3.2"/>' +
      (label ? '<text class="sk-t" x="' + (x + (anchor === "end" ? -6 : 6)) + '" y="' + (y + (dy || -7)) +
        '" text-anchor="' + (anchor || "start") + '">' + label + '</text>' : "");
  }

  const S = {};

  /* y = 2 sin x, 0° to 360°.  peak at 90°, trough at 270° */
  S["sin-2x"] = function () {
    const ax = 75, x0 = 26, xEnd = 232, mid = (x0 + xEnd) / 2;
    return frame(
      axes(x0 - 8, xEnd + 6, 14, 138, x0, ax) +
      '<path class="sk-cv" d="M' + x0 + ',' + ax +
        ' C' + (x0 + 34) + ',8 ' + (mid - 34) + ',8 ' + mid + ',' + ax +
        ' C' + (mid + 34) + ',142 ' + (xEnd - 34) + ',142 ' + xEnd + ',' + ax + '"/>' +
      dot(mid - 52, 25, "(90°, 2)", "start", -6) +
      dot(mid + 52, 125, "(270°, −2)", "end", 16) +
      '<text class="sk-t" x="' + mid + '" y="' + (ax + 14) + '" text-anchor="middle">180°</text>' +
      '<text class="sk-t" x="' + xEnd + '" y="' + (ax + 14) + '" text-anchor="middle">360°</text>',
      { alt: "y = 2 sin x, one full cycle: maximum 2 at 90 degrees, minimum minus 2 at 270 degrees" });
  };

  /* y = x(x − 2)(x + 3): positive cubic cutting at −3, 0 and 2 */
  S["cubic-three-roots"] = function () {
    const ax = 88;
    return frame(
      axes(14, 246, 12, 140, 126, ax) +
      '<path class="sk-cv" d="M30,138 C52,40 66,30 78,66 C88,96 104,112 126,88 C146,66 160,36 196,16 L214,10"/>' +
      dot(78, ax, "−3", "middle", 18) + dot(126, ax, "0", "start", 18) + dot(172, ax, "2", "middle", 18),
      { alt: "Positive cubic crossing the x-axis at minus 3, 0 and 2" });
  };

  /* y = (x − 1)²(x + 2): touches at x = 1, crosses at x = −2 */
  S["cubic-repeated-root"] = function () {
    const ax = 96;
    return frame(
      axes(14, 246, 12, 142, 96, ax) +
      '<path class="sk-cv" d="M28,140 C48,52 62,34 78,58 C92,80 104,96 126,96 C150,96 162,96 170,96 C186,96 200,60 224,16"/>' +
      dot(78, ax, "−2", "middle", 18) +
      dot(170, ax, "1", "middle", 18) +
      '<text class="sk-t" x="188" y="' + (ax + 30) + '" text-anchor="middle">touches here</text>' +
      dot(96, 62, "y-int 2", "start", -6),
      { alt: "Positive cubic crossing at minus 2 and touching the x-axis at 1" });
  };

  /* y = 3/x: reciprocal in the first and third quadrants */
  S["reciprocal"] = function () {
    const ax = 75, ay = 130;
    return frame(
      axes(14, 246, 12, 140, ay, ax) +
      '<path class="sk-cv" d="M138,132 C150,96 168,82 232,74"/>' +
      '<path class="sk-cv" d="M28,76 C92,68 110,54 122,18"/>' +
      '<text class="sk-t" x="236" y="' + (ax - 8) + '" text-anchor="end">y = 0</text>' +
      '<text class="sk-t" x="' + (ay + 6) + '" y="140">x = 0</text>',
      { alt: "Reciprocal curve in the first and third quadrants, approaching both axes" });
  };

  /* y = 2^x: increasing exponential through (0, 1), asymptote y = 0 */
  S["exponential"] = function () {
    const ax = 118, ay = 96;
    return frame(
      axes(14, 246, 12, 138, ay, ax) +
      '<line class="sk-asym" x1="18" y1="' + ax + '" x2="242" y2="' + ax + '"/>' +
      '<path class="sk-cv" d="M22,115 C70,112 104,104 126,88 C154,68 176,36 200,14"/>' +
      dot(ay, 96, "(0, 1)", "end", -8) +
      '<text class="sk-t" x="238" y="' + (ax + 14) + '" text-anchor="end">asymptote y = 0</text>',
      { alt: "Increasing exponential through (0, 1) with the x-axis as an asymptote" });
  };

  /* scatter with strong negative correlation */
  S["scatter-negative"] = function () {
    const pts = [[42,32],[56,40],[62,36],[74,52],[86,48],[92,62],[104,66],[116,74],
                 [126,70],[138,86],[150,90],[162,96],[174,104],[186,100],[198,116],[210,120]];
    return frame(
      axes(26, 240, 14, 136, 30, 132) +
      pts.map(function (p) { return '<circle class="sk-dot" cx="' + p[0] + '" cy="' + p[1] + '" r="3"/>'; }).join("") +
      '<line class="sk-trend" x1="40" y1="30" x2="212" y2="122"/>',
      { alt: "Scatter diagram with points close to a downward sloping line" });
  };

  /* velocity–time trapezium: 0 to 12 over 4s, flat 6s, down over 5s */
  S["vt-trapezium"] = function () {
    const ax = 122, y12 = 30;
    return frame(
      axes(20, 244, 14, 140, 34, ax) +
      '<path class="sk-fill" d="M34,' + ax + ' L94,' + y12 + ' L184,' + y12 + ' L232,' + ax + ' Z"/>' +
      '<path class="sk-cv" d="M34,' + ax + ' L94,' + y12 + ' L184,' + y12 + ' L232,' + ax + '"/>' +
      '<line class="sk-guide" x1="94" y1="' + y12 + '" x2="94" y2="' + ax + '"/>' +
      '<line class="sk-guide" x1="184" y1="' + y12 + '" x2="184" y2="' + ax + '"/>' +
      '<text class="sk-t" x="64" y="' + (ax + 14) + '" text-anchor="middle">4 s</text>' +
      '<text class="sk-t" x="139" y="' + (ax + 14) + '" text-anchor="middle">6 s</text>' +
      '<text class="sk-t" x="208" y="' + (ax + 14) + '" text-anchor="middle">5 s</text>' +
      '<text class="sk-t" x="30" y="' + (y12 + 4) + '" text-anchor="end">12</text>' +
      '<text class="sk-t" x="139" y="' + (y12 + 34) + '" text-anchor="middle">area = distance</text>',
      { alt: "Velocity-time graph: rises to 12, stays flat, then falls to zero" });
  };

  /* y = x(4 − x) with the region to the x-axis shaded */
  S["area-under-parabola"] = function () {
    const ax = 118;
    return frame(
      axes(18, 244, 12, 136, 46, ax) +
      '<path class="sk-fill" d="M46,' + ax + ' C86,10 158,10 198,' + ax + ' Z"/>' +
      '<path class="sk-cv" d="M46,' + ax + ' C86,10 158,10 198,' + ax + '"/>' +
      dot(46, ax, "0", "middle", 18) + dot(198, ax, "4", "middle", 18) +
      '<text class="sk-t" x="122" y="' + (ax - 26) + '" text-anchor="middle">shaded area</text>',
      { alt: "Parabola through 0 and 4 with the region between it and the x-axis shaded" });
  };

  function has(key) { return typeof S[key] === "function"; }
  function render(key) { return has(key) ? S[key]() : ""; }
  function keys() { return Object.keys(S); }

  return { render: render, has: has, keys: keys };
})();
