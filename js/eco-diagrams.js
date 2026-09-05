/* ============================================================
   Economics diagrams — drawn, not photographed.

   A diagram is half the marks on a lot of these questions, and a
   picture of a scanned page is not something you can learn a
   shape from. These are drawn from the economics: the lines are
   real lines, and every intersection is solved for rather than
   eyeballed, so the labelled points sit exactly where the maths
   puts them.

   Geometry note. Demand is P = a − bQ and supply P = c + dQ, so
   they meet at Q* = (a − c) / (b + d). Everything hangs off that
   one solve: shift a curve by changing its intercept and the new
   equilibrium falls out, rather than being nudged by hand until
   it looks about right. Screen y runs downwards, so a higher
   price is a smaller y — hence py() below.
   ============================================================ */

const ECO_DIAGRAM = (function () {

  /* The box is wider than the plot on purpose. Curves are labelled at their
     right-hand end and the axes are labelled outside them, so drawing to the
     edge clipped "MSC" to "MF" and "Cost / Revenue" to "Revenue". */
  const W = 372, H = 248;              // viewBox, tall enough for the
                                       // axis name and a footnote beneath it
  const L = 54, R = 268;               // plot area, left and right
  const T = 30, B = 182;               // top and bottom

  /* price and quantity are given on a 0..100 scale and mapped into the box */
  function px(q) { return L + (q / 100) * (R - L); }
  function py(p) { return B - (p / 100) * (B - T); }

  function line(x1, y1, x2, y2, cls) {
    return '<line class="' + cls + '" x1="' + x1 + '" y1="' + y1 +
           '" x2="' + x2 + '" y2="' + y2 + '"/>';
  }
  function txt(x, y, s, cls, anchor) {
    return '<text class="' + (cls || "ed-t") + '" x="' + x + '" y="' + y +
           '" text-anchor="' + (anchor || "middle") + '">' + s + '</text>';
  }
  function dot(x, y) { return '<circle class="ed-pt" cx="' + x + '" cy="' + y + '" r="3"/>'; }

  /* dashed guides from a point to both axes, the way you are taught to mark
     an equilibrium */
  function guides(q, p) {
    return line(L, py(p), px(q), py(p), "ed-gd") + line(px(q), py(p), px(q), B, "ed-gd");
  }
  /* A labelled point must project cleanly to both axes. Keeping this in one
     helper prevents floating labels and missing dotted guides. */
  function axisPoint(q, p, pLabel, qLabel) {
    return guides(q, p) + dot(px(q), py(p)) +
      (pLabel ? txt(L - 8, py(p) + 4, pLabel, "ed-t", "end") : "") +
      (qLabel ? txt(px(q), B + 14, qLabel, "ed-t") : "");
  }

  /* The vertical axis is labelled above itself rather than beside it — a
     label like "Cost / Revenue" is wider than the whole left margin. */
  function axes(xLabel, yLabel) {
    return line(L, T - 6, L, B, "ed-ax") + line(L, B, R + 8, B, "ed-ax") +
      txt(L - 6, T - 12, yLabel || "Price", "ed-al", "start") +
      txt(R + 8, B + 31, xLabel || "Quantity", "ed-al", "end");
  }

  function frame(inner, alt) {
    return '<svg class="ed" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      (alt || "Economics diagram") + '">' + inner + '</svg>';
  }

  /* a straight curve given as price at Q=0 and price at Q=100 */
  function curve(p0, p100, cls) { return line(px(0), py(p0), px(100), py(p100), cls); }

  /* where P = a - bQ meets P = c + dQ, expressed through the endpoints each
     line is drawn with */
  function meet(dem0, dem100, sup0, sup100) {
    const b = (dem0 - dem100) / 100, d = (sup100 - sup0) / 100;
    const q = (dem0 - sup0) / (b + d);
    return { q: q, p: dem0 - b * q };
  }

  const D = {};

  /* ---------- supply and demand ---------- */
  D["supply-demand"] = function () {
    const e = meet(90, 20, 20, 90);
    return frame(
      axes() +
      curve(90, 20, "ed-d") + curve(20, 90, "ed-s") +
      axisPoint(e.q, e.p, "P₁", "Q₁") +
      txt(px(100) + 7, py(20) + 4, "D", "ed-lbl", "start") +
      txt(px(100) + 7, py(90) + 4, "S", "ed-lbl", "start"),
      "Supply and demand meeting at one equilibrium price and quantity");
  };

  /* ---------- a shift in demand ---------- */
  D["demand-increase"] = function () {
    const a = meet(90, 20, 20, 90), b = meet(120, 50, 20, 90);
    return frame(
      axes() +
      curve(90, 20, "ed-d") + curve(120, 50, "ed-d ed-new") + curve(20, 90, "ed-s") +
      axisPoint(a.q, a.p, "P₁", "Q₁") + axisPoint(b.q, b.p, "P₂", "Q₂") +
      '<path class="ed-arrow" d="M' + px(52) + ',' + py(56) + ' L' + px(66) + ',' + py(70) + '"/>' +
      txt(px(100) + 7, py(20) + 4, "D₁", "ed-lbl", "start") +
      txt(px(100) + 7, py(50) + 4, "D₂", "ed-lbl", "start") +
      txt(px(100) + 7, py(90) + 4, "S", "ed-lbl", "start"),
      "Demand shifting right raises both the equilibrium price and quantity");
  };

  /* ---------- maximum price ---------- */
  D["max-price"] = function () {
    const e = meet(90, 20, 20, 90);
    const cap = e.p - 22;
    /* at the cap, quantity demanded comes off the demand curve and quantity
       supplied off the supply curve, and the gap between them is the shortage */
    const qd = (90 - cap) / ((90 - 20) / 100);
    const qs = (cap - 20) / ((90 - 20) / 100);
    return frame(
      axes() +
      curve(90, 20, "ed-d") + curve(20, 90, "ed-s") +
      line(L, py(cap), R, py(cap), "ed-cap") +
      axisPoint(e.q, e.p, "Pe", "Qe") +
      axisPoint(qs, cap, "Pmax", "Qs") + axisPoint(qd, cap, null, "Qd") +
      line(px(qs), py(cap) - 9, px(qd), py(cap) - 9, "ed-gap") +
      txt((px(qs) + px(qd)) / 2, py(cap) - 14, "shortage", "ed-note"),
      "A maximum price below equilibrium leaves quantity demanded above quantity supplied");
  };

  /* ---------- minimum price ---------- */
  D["min-price"] = function () {
    const e = meet(90, 20, 20, 90);
    const floor = e.p + 22;
    const qd = (90 - floor) / ((90 - 20) / 100);
    const qs = (floor - 20) / ((90 - 20) / 100);
    return frame(
      axes() +
      curve(90, 20, "ed-d") + curve(20, 90, "ed-s") +
      line(L, py(floor), R, py(floor), "ed-cap") +
      axisPoint(e.q, e.p, "Pe", "Qe") +
      axisPoint(qd, floor, "Pmin", "Qd") + axisPoint(qs, floor, null, "Qs") +
      line(px(qd), py(floor) - 9, px(qs), py(floor) - 9, "ed-gap") +
      txt((px(qd) + px(qs)) / 2, py(floor) - 14, "surplus", "ed-note"),
      "A minimum price above equilibrium leaves quantity supplied above quantity demanded");
  };

  /* ---------- an indirect tax ---------- */
  D["indirect-tax"] = function () {
    const a = meet(90, 20, 20, 90), b = meet(90, 20, 44, 114);
    return frame(
      axes() +
      curve(90, 20, "ed-d") + curve(20, 90, "ed-s") + curve(44, 114, "ed-s ed-new") +
      axisPoint(a.q, a.p, "P₁", "Q₁") + axisPoint(b.q, b.p, "Pc", "Q₂") +
      line(px(b.q), py(b.p), px(b.q), py(b.p - 24), "ed-gap") +
      line(L, py(b.p - 24), px(b.q), py(b.p - 24), "ed-gd") +
      txt(px(b.q) + 30, py(b.p - 12), "tax per unit", "ed-note", "start") +
      txt(px(100) + 7, py(20) + 4, "D", "ed-lbl", "start") +
      txt(px(100) + 7, py(90) + 4, "S", "ed-lbl", "start") +
      txt(px(100) + 7, py(97) + 4, "S+tax", "ed-lbl", "start") +
      txt(L - 8, py(b.p - 24) + 4, "Pp", "ed-t", "end"),
      "An indirect tax shifts supply up by the tax, raising price and cutting quantity");
  };

  /* ---------- a subsidy ---------- */
  D["subsidy"] = function () {
    const a = meet(90, 20, 20, 90), b = meet(90, 20, -4, 66);
    return frame(
      axes() +
      curve(90, 20, "ed-d") + curve(20, 90, "ed-s") + curve(-4, 66, "ed-s ed-new") +
      axisPoint(a.q, a.p, "P₁", "Q₁") + axisPoint(b.q, b.p, "P₂", "Q₂") +
      txt(px(100) + 7, py(20) + 4, "D", "ed-lbl", "start") +
      txt(px(100) + 7, py(90) + 4, "S", "ed-lbl", "start") +
      txt(px(100) + 7, py(66) + 4, "S+sub", "ed-lbl", "start") +
      "A subsidy shifts supply down, lowering price and raising quantity");
  };

  /* ---------- a negative externality in production ---------- */
  D["negative-externality"] = function () {
    const priv = meet(90, 20, 20, 90), soc = meet(90, 20, 44, 114);
    return frame(
      axes("Quantity", "Cost / Benefit") +
      curve(90, 20, "ed-d") + curve(20, 90, "ed-s") + curve(44, 114, "ed-s ed-new") +
      axisPoint(soc.q, soc.p, "P*", "Q*") + axisPoint(priv.q, priv.p, "P₁", "Q₁") +
      '<path class="ed-fill" d="M' + px(soc.q) + ',' + py(soc.p) + ' L' + px(priv.q) + ',' +
        py(priv.p) + ' L' + px(priv.q) + ',' + py(priv.p + 24) + ' Z"/>' +
      txt(px(100) + 7, py(20) + 4, "MPB = MSB", "ed-lbl", "start") +
      txt(px(100) + 7, py(90) + 4, "MPC", "ed-lbl", "start") +
      txt(px(100) + 7, py(100) + 4, "MSC", "ed-lbl", "start") +
      txt(L + 2, B + 45, "shaded area = welfare loss", "ed-note", "start"),
      "Marginal social cost above marginal private cost, so the market overproduces");
  };

  /* ---------- cost and revenue, profit and revenue maximising ---------- */
  D["cost-revenue"] = function () {
    /* AR = 100 − Q, so MR = 100 − 2Q: twice the slope, same intercept.
       MC is taken as rising, MC = 10 + 0.9Q. Profit maximising is MC = MR,
       revenue maximising is MR = 0, and both are solved here. */
    const arAt = function (q) { return 100 - q; };
    const mrAt = function (q) { return 100 - 2 * q; };
    const mcAt = function (q) { return 10 + 0.9 * q; };
    const qProfit = (100 - 10) / (2 + 0.9);          // 100 − 2q = 10 + 0.9q
    const qRev = 50;                                  // MR = 0
    return frame(
      axes("Output", "Cost / Revenue") +
      line(px(0), py(arAt(0)), px(100), py(arAt(100)), "ed-d") +
      line(px(0), py(mrAt(0)), px(50), py(0), "ed-mr") +
      line(px(0), py(mcAt(0)), px(100), py(mcAt(100)), "ed-s") +
      axisPoint(qProfit, arAt(qProfit), "Pπ", "Qπ") +
      axisPoint(qRev, arAt(qRev), "Pr", "Qr") +
      dot(px(qProfit), py(mcAt(qProfit))) + dot(px(qRev), py(0)) +
      txt(px(100) + 7, py(arAt(100)) + 4, "AR = D", "ed-lbl", "start") +
      txt(px(18), py(64) + 4, "MR", "ed-lbl", "end") +
      txt(px(100) + 7, py(mcAt(100)) + 4, "MC", "ed-lbl", "start") +
      txt(px(qProfit) - 6, py(mcAt(qProfit)) - 12, "MC = MR", "ed-note", "end") +
      txt(px(qRev) + 6, B - 10, "MR = 0", "ed-note", "start"),
      "Profit maximising where marginal cost meets marginal revenue, revenue maximising where marginal revenue is zero");
  };

  /* ---------- monopoly with supernormal profit ---------- */
  D["monopoly"] = function () {
    const arAt = function (q) { return 100 - q; };
    const mcAt = function (q) { return 10 + 0.9 * q; };
    const acAt = function (q) { return 34 + 0.35 * q; };
    const q = (100 - 10) / (2 + 0.9);
    const p = arAt(q), c = acAt(q);
    return frame(
      axes("Output", "Cost / Revenue") +
      '<path class="ed-fill" d="M' + px(0) + ',' + py(p) + ' L' + px(q) + ',' + py(p) +
        ' L' + px(q) + ',' + py(c) + ' L' + px(0) + ',' + py(c) + ' Z"/>' +
      line(px(0), py(arAt(0)), px(100), py(arAt(100)), "ed-d") +
      line(px(0), py(100), px(50), py(0), "ed-mr") +
      line(px(0), py(mcAt(0)), px(100), py(mcAt(100)), "ed-s") +
      line(px(0), py(acAt(0)), px(100), py(acAt(100)), "ed-ac") +
      axisPoint(q, p, "P", "Q") + axisPoint(q, c, "AC", null) +
      txt(px(100) + 7, py(arAt(100)) + 4, "AR", "ed-lbl", "start") +
      txt(px(100) + 7, py(mcAt(100)) + 4, "MC", "ed-lbl", "start") +
      txt(px(100) + 7, py(acAt(100)) + 4, "AC", "ed-lbl", "start") +
      txt(L + 2, B + 45, "shaded area = supernormal profit", "ed-note", "start"),
      "A monopoly setting output where marginal cost meets marginal revenue and charging above average cost");
  };

  /* ---------- AD / AS ---------- */
  D["ad-as"] = function () {
    const a = meet(90, 20, 20, 90), b = meet(120, 50, 20, 90);
    return frame(
      axes("Real GDP", "Price level") +
      curve(90, 20, "ed-d") + curve(120, 50, "ed-d ed-new") + curve(20, 90, "ed-s") +
      axisPoint(a.q, a.p, "P₁", "Y₁") + axisPoint(b.q, b.p, "P₂", "Y₂") +
      txt(px(100) + 7, py(20) + 4, "AD₁", "ed-lbl", "start") +
      txt(px(100) + 7, py(50) + 4, "AD₂", "ed-lbl", "start") +
      txt(px(100) + 7, py(90) + 4, "AS", "ed-lbl", "start"),
      "Aggregate demand rising lifts both the price level and real output");
  };

  /* ---------- production possibility frontier ---------- */
  D["ppf"] = function () {
    /* concave to the origin: a quarter ellipse, which is what increasing
       opportunity cost actually looks like */
    const arc = function (rx, ry, cls) {
      return '<path class="' + cls + '" d="M' + px(0) + ',' + py(ry) +
             ' A ' + (px(rx) - px(0)) + ' ' + (py(0) - py(ry)) + ' 0 0 1 ' +
             px(rx) + ',' + py(0) + '"/>';
    };
    return frame(
      axes("Capital goods", "Consumer goods") +
      arc(100, 92, "ed-ppf") + arc(78, 72, "ed-ppf ed-old") +
      /* the frontier is (x/100)^2 + (y/92)^2 = 1, so a point is on it,
         inside it or beyond it by whether that sum is 1, less or more */
      axisPoint(60, 73.6, "Ca", "Ka") +
      txt(px(60) + 8, py(73.6) - 6, "A", "ed-t", "start") +
      dot(px(35), py(35)) + txt(px(35) + 8, py(35) + 4, "B", "ed-t", "start") +
      dot(px(80), py(80)) + txt(px(80) + 8, py(80) - 4, "C", "ed-t", "start") +
      txt(L - 6, B + 45, "A on it · B inside, spare capacity · C beyond, not attainable",
          "ed-note", "start"),
      "A production possibility frontier with points on, inside and beyond it");
  };

  /* ---------- elastic against inelastic demand ---------- */
  D["elasticity"] = function () {
    return frame(
      axes() +
      curve(64, 36, "ed-d") +
      line(px(38), py(100), px(62), py(0), "ed-d ed-new") +
      axisPoint(50, 50, "P", "Q") +
      txt(px(100) + 7, py(36) + 4, "elastic", "ed-lbl", "start") +
      txt(px(62) + 4, py(4), "inelastic", "ed-lbl", "start") +
      txt(L - 6, B + 45, "the flatter the curve, the more price elastic demand is", "ed-note", "start"),
      "A flatter demand curve is more price elastic than a steeper one");
  };

  function has(k) { return typeof D[k] === "function"; }
  function render(k) { return has(k) ? D[k]() : ""; }
  function keys() { return Object.keys(D); }

  /* Which diagram a question is asking for. Read off the command and the
     mark scheme, and only where it is unambiguous — a question that mentions
     no diagram gets none rather than a decorative one. */
  const RULES = [
    ["ppf",                  /production possibility|\bPPF\b/i],
    /* A tax question wants the tax diagram. Externalities are usually the
       reason for the tax rather than the thing being drawn, so they come
       after — a question only gets the externality diagram when no tax or
       subsidy is named. */
    ["indirect-tax",         /indirect tax|ad valorem|\btax on\b|sugar tax|tax per unit|imposition of a \d+% tax/i],
    ["subsidy",              /subsid/i],
    ["negative-externality", /externalit|\bMSC\b|\bMPC\b|social cost/i],
    ["max-price",            /maximum price|price cap/i],
    ["min-price",            /minimum price|price floor|national living wage|minimum wage/i],
    ["monopoly",             /monopol/i],
    ["cost-revenue",         /cost and revenue|profit maximis|revenue maximis|\bMC\b.{0,20}\bMR\b/i],
    ["ad-as",                /aggregate demand|aggregate supply|\bAD\b.{0,14}\bAS\b/i],
    ["elasticity",           /price elasticity/i],
    ["demand-increase",      /shift.{0,24}demand|increase in demand|demand curve/i],
    ["supply-demand",        /supply and demand|demand and supply/i]
  ];

  function forQuestion(q) {
    if (!q) return null;
    const hay = (q.text || "") + " " + (q.ms || "");
    if (!/diagram|curve|\bMC\b|\bMR\b|\bAD\b|\bAS\b/i.test(hay)) return null;
    for (let i = 0; i < RULES.length; i++) {
      if (RULES[i][1].test(hay) && has(RULES[i][0])) return RULES[i][0];
    }
    return null;
  }

  return { render: render, has: has, keys: keys, forQuestion: forQuestion };
})();
