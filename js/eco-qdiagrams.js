/* ============================================================
   Diagrams that belong to one question

   Some questions are the diagram. "Explain one characteristic of
   the economy at position W" means nothing without a diagram that
   has a W on it, and the generic production possibility frontier
   from eco-diagrams.js has points A, B and C — so it was not just
   unhelpful but actively wrong, pointing at labels the question
   never mentions.

   These are drawn from each paper's own geometry: the same
   intercepts, the same axis values, the same labelled points in
   the same places. A student reading "the opportunity cost of
   producing 50 capital goods" has to be able to read 100 and 140
   off the diagram, so those are the numbers on it.
   ============================================================ */

const ECO_QDIAGRAM = (function () {

  const W = 440, H = 310;
  const L = 62, R = 348, T = 30, B = 226;

  function esc(s) { return (typeof UI !== "undefined" ? UI.esc(s) : String(s)); }
  function txt(x, y, s, cls, anchor) {
    return '<text class="' + cls + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"' +
      ' text-anchor="' + (anchor || "middle") + '">' + esc(s) + '</text>';
  }
  function line(x1, y1, x2, y2, cls) {
    return '<line class="' + cls + '" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) +
      '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
  }
  function dot(x, y) { return '<circle class="qd-pt" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.4"/>'; }

  function frame(inner, alt) {
    return '<svg class="qd" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      esc(alt || "Diagram") + '">' + inner + '</svg>';
  }

  /* ---------- production possibility frontier ---------- */
  function ppf(d) {
    const xMax = d.xMax, yMax = d.yMax;
    const px = function (v) { return L + (v / xMax) * (R - L); };
    const py = function (v) { return B - (v / yMax) * (B - T); };

    let out = line(L, T, L, B, "qd-ax") + line(L, B, R + 40, B, "qd-ax") +
      txt(4, T - 12, d.yLabel || "", "qd-al", "start") +
      txt(R + 40, B + 32, d.xLabel || "", "qd-al", "end");

    (d.yTicks || []).forEach(function (v) {
      out += txt(L - 8, py(v) + 4, String(v), "qd-t", "end");
    });
    (d.xTicks || []).forEach(function (v) {
      out += txt(px(v), B + 15, String(v), "qd-t");
    });
    out += txt(L - 8, B + 4, "0", "qd-t", "end");

    /* A frontier is concave to the origin unless the paper drew it straight,
       which some of them do to keep the opportunity cost constant. */
    (d.curves || []).forEach(function (c) {
      const x0 = px(c.from[0]), y0 = py(c.from[1]);
      const x1 = px(c.to[0]),   y1 = py(c.to[1]);
      out += c.shape === "straight"
        ? '<path class="qd-ppf" d="M' + x0.toFixed(1) + ',' + y0.toFixed(1) +
          ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) + '"/>'
        : '<path class="qd-ppf" d="M' + x0.toFixed(1) + ',' + y0.toFixed(1) +
          ' Q' + (x0 + (x1 - x0) * 0.62).toFixed(1) + ',' + (y0 + (y1 - y0) * 0.24).toFixed(1) +
          ' ' + x1.toFixed(1) + ',' + y1.toFixed(1) + '"/>';
      if (c.label) {
        out += txt(px(c.labelAt ? c.labelAt[0] : c.to[0] * 0.55),
                   py(c.labelAt ? c.labelAt[1] : c.from[1] * 0.62), c.label, "qd-lbl", "start");
      }
    });

    (d.points || []).forEach(function (p) {
      const x = px(p.x), y = py(p.y);
      if (p.guides) {
        out += line(L, y, x, y, "qd-gd") + line(x, y, x, B, "qd-gd");
      }
      out += dot(x, y) +
        txt(x + (p.dx == null ? 8 : p.dx), y + (p.dy == null ? -6 : p.dy), p.label, "qd-pl", "start");
    });
    return frame(out, d.alt);
  }

  /* ---------- the trade cycle ---------- */
  function cycle(d) {
    const px = function (v) { return L + (v / 100) * (R - L); };
    const py = function (v) { return B - (v / 100) * (B - T); };

    let out = line(L, T, L, B, "qd-ax") + line(L, B, R + 40, B, "qd-ax") +
      txt(4, T - 12, d.yLabel || "Real GDP", "qd-al", "start") +
      txt(R + 40, B + 32, d.xLabel || "Time", "qd-al", "end");

    const tr = d.trend;
    out += line(px(tr[0][0]), py(tr[0][1]), px(tr[1][0]), py(tr[1][1]), "qd-trend") +
      txt(px(tr[1][0]) + 6, py(tr[1][1]) - 2, "Trend GDP", "qd-lbl", "start");

    /* the actual path, smoothed through its own points */
    const pts = d.actual.map(function (p) { return [px(p[0]), py(p[1])]; });
    /* Catmull-Rom through the points, converted to cubics: a trade cycle is a
       smooth wave, and a curve that flattens between each pair of points
       reads as a series of steps rather than a cycle. */
    let path = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i > 0 ? i - 1 : 0];
      const p1 = pts[i], p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      path += " C" + c1x.toFixed(1) + "," + c1y.toFixed(1) +
              " " + c2x.toFixed(1) + "," + c2y.toFixed(1) +
              " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
    }
    out += '<path class="qd-actual" d="' + path + '"/>' +
      txt(pts[pts.length - 1][0] + 6, pts[pts.length - 1][1] + 4, "Actual GDP", "qd-lbl", "start");

    (d.points || []).forEach(function (p) {
      out += dot(px(p.x), py(p.y)) +
        txt(px(p.x) + (p.dx == null ? 0 : p.dx), py(p.y) + (p.dy == null ? 16 : p.dy), p.label, "qd-pl");
    });

    (d.notes || []).forEach(function (n) {
      out += txt(px(n.x), py(n.y), n.text, "qd-note", n.anchor || "middle");
    });
    return frame(out, d.alt);
  }

  /* ---------- a general labelled plot ----------

     Tax, subsidy and cost-and-revenue diagrams are the same drawing with
     different curves on it: named axes, a few lines or curves, and points
     the question asks you to read values off. They share this rather than
     each getting their own near-identical function. */
  function plot(d) {
    const px = function (v) { return L + (v / d.xMax) * (R - L); };
    const py = function (v) { return B - (v / d.yMax) * (B - T); };

    let out = line(L, T - 6, L, B, "qd-ax") + line(L, B, R + 40, B, "qd-ax") +
      txt(4, T - 14, d.yLabel || "", "qd-al", "start") +
      txt(R + 40, B + 32, d.xLabel || "", "qd-al", "end") +
      txt(L - 8, B + 4, "0", "qd-t", "end");

    (d.yTicks || []).forEach(function (t) {
      out += txt(L - 8, py(t.v == null ? t : t.v) + 4,
                 String(t.label == null ? t : t.label), "qd-t", "end");
    });
    (d.xTicks || []).forEach(function (t) {
      out += txt(px(t.v == null ? t : t.v), B + 15,
                 String(t.label == null ? t : t.label), "qd-t");
    });

    (d.curves || []).forEach(function (c) {
      if (c.points) {
        /* a curve through its own points: MC and AC are U-shaped, and a
           straight line between them would not be either cost curve */
        const pts = c.points.map(function (p) { return [px(p[0]), py(p[1])]; });
        let path = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i > 0 ? i - 1 : 0], p1 = pts[i], p2 = pts[i + 1];
          const p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1];
          path += " C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + "," + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) +
                  " " + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + "," + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) +
                  " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
        }
        out += '<path class="qd-curve ' + (c.cls || "") + '" d="' + path + '"/>';
      } else {
        out += line(px(c.from[0]), py(c.from[1]), px(c.to[0]), py(c.to[1]),
                    "qd-curve " + (c.cls || ""));
      }
      if (c.label) {
        const at = c.labelAt || (c.points ? c.points[c.points.length - 1] : c.to);
        out += txt(px(at[0]) + (c.ldx == null ? 7 : c.ldx),
                   py(at[1]) + (c.ldy == null ? 4 : c.ldy), c.label, "qd-lbl", "start");
      }
    });

    (d.points || []).forEach(function (p) {
      const x = px(p.x), y = py(p.y);
      if (p.guides !== false) out += line(L, y, x, y, "qd-gd") + line(x, y, x, B, "qd-gd");
      out += dot(x, y);
      if (p.label) out += txt(x + (p.dx == null ? 8 : p.dx), y + (p.dy == null ? -7 : p.dy),
                              p.label, "qd-pl", "start");
    });
    return frame(out, d.alt);
  }

  function render(d) {
    if (!d) return "";
    if (d.kind === "ppf") return ppf(d);
    if (d.kind === "cycle") return cycle(d);
    if (d.kind === "plot") return plot(d);
    return "";
  }

  return { render: render };
})();
