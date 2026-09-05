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
       which some of them do to keep the opportunity cost constant.

       `ellipse` draws it as a quarter ellipse, which matters when the
       question puts a point ON the frontier: a point placed by eye beside a
       Bezier is a point that is not on the curve, and "X is on the frontier,
       Y is beyond it" is then a lie. With an ellipse a point at angle t is
       on it by construction. */
    (d.curves || []).forEach(function (c) {
      if (c.ellipse) {
        const a = c.ellipse[0], b = c.ellipse[1];
        out += '<path class="qd-ppf" d="M' + px(0).toFixed(1) + ',' + py(b).toFixed(1) +
          ' A ' + (px(a) - px(0)).toFixed(1) + ' ' + (py(0) - py(b)).toFixed(1) +
          ' 0 0 1 ' + px(a).toFixed(1) + ',' + py(0).toFixed(1) + '"/>';
      } else {
        const x0 = px(c.from[0]), y0 = py(c.from[1]);
        const x1 = px(c.to[0]),   y1 = py(c.to[1]);
        out += c.shape === "straight"
          ? '<path class="qd-ppf" d="M' + x0.toFixed(1) + ',' + y0.toFixed(1) +
            ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) + '"/>'
          : '<path class="qd-ppf" d="M' + x0.toFixed(1) + ',' + y0.toFixed(1) +
            ' Q' + (x0 + (x1 - x0) * 0.62).toFixed(1) + ',' + (y0 + (y1 - y0) * 0.24).toFixed(1) +
            ' ' + x1.toFixed(1) + ',' + y1.toFixed(1) + '"/>';
      }
      if (c.label) {
        out += txt(px(c.labelAt ? c.labelAt[0] : c.to[0] * 0.55),
                   py(c.labelAt ? c.labelAt[1] : c.from[1] * 0.62), c.label, "qd-lbl", "start");
      }
    });

    /* A point given as an angle on one of the ellipses, rather than as a
       pair of coordinates that only look like they are on it. */
    const at = function (p) {
      if (p.on == null) return [p.x, p.y];
      const e = d.curves[p.on].ellipse;
      const th = p.t * Math.PI / 2;
      const r = p.scale == null ? 1 : p.scale;
      return [e[0] * Math.sin(th) * r, e[1] * Math.cos(th) * r];
    };

    (d.points || []).forEach(function (p) {
      const c = at(p), x = px(c[0]), y = py(c[1]);
      if (p.guides) {
        out += line(L, y, x, y, "qd-gd") + line(x, y, x, B, "qd-gd");
      }
      out += dot(x, y) +
        txt(x + (p.dx == null ? 8 : p.dx), y + (p.dy == null ? -6 : p.dy), p.label, "qd-pl", "start");
    });

    /* an arrow between two of those points, pulled back off each end so it
       does not run through the dots */
    if (d.arrow) {
      const a = at(d.points[d.arrow[0]]), b = at(d.points[d.arrow[1]]);
      const ax = px(a[0]), ay = py(a[1]), bx = px(b[0]), by = py(b[1]);
      const dx = bx - ax, dy = by - ay, len = Math.sqrt(dx * dx + dy * dy) || 1;
      const gap = 9;
      out += arrowLine(ax + dx / len * gap, ay + dy / len * gap,
                       bx - dx / len * gap, by - dy / len * gap);
    }
    out += arrows(d.arrows, px, py);
    return frame(out, d.alt);
  }

  /* An arrow from one point to another: which way the frontier moved, or
     which way along it you travelled, is the whole content of some of these
     questions. */
  /* Drawn rather than marker-ended: an SVG marker needs an id, and four of
     these diagrams sit on the same page, where repeated ids collide. */
  function arrowLine(x1, y1, x2, y2) {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 6.5, w = 0.42;
    return line(x1, y1, x2, y2, "qd-arrow") +
      '<path class="qd-arrowhead" d="M' + x2.toFixed(1) + ',' + y2.toFixed(1) +
      ' L' + (x2 - h * Math.cos(a - w)).toFixed(1) + ',' + (y2 - h * Math.sin(a - w)).toFixed(1) +
      ' L' + (x2 - h * Math.cos(a + w)).toFixed(1) + ',' + (y2 - h * Math.sin(a + w)).toFixed(1) + ' z"/>';
  }

  function arrows(list, px, py) {
    if (!list || !list.length) return "";
    return list.map(function (a) {
      return arrowLine(px(a.from[0]), py(a.from[1]), px(a.to[0]), py(a.to[1]));
    }).join("");
  }

  /* ---------- aggregate demand and supply ----------
     The shape of AS is the point of these: Keynesian bends from flat to
     vertical, classical is vertical from the start, and which one you are
     looking at decides whether real output moves at all. */
  function adas(d) {
    const px = function (v) { return L + (v / 100) * (R - L); };
    const py = function (v) { return B - (v / 100) * (B - T); };

    let out = line(L, T - 6, L, B, "qd-ax") + line(L, B, R + 40, B, "qd-ax") +
      txt(4, T - 14, "Price level", "qd-al", "start") +
      txt(R + 40, B + 32, "Real output", "qd-al", "end");

    /* The Keynesian curve is drawn through named points rather than as a
       free-hand Bezier, so the equilibria marked below actually sit on it. */
    if (d.as === "classical") {
      out += line(px(58), T, px(58), B, "qd-curve qd-s") + txt(px(58), T - 8, "AS", "qd-lbl");
    } else {
      const kp = [[8, 12], [28, 14], [44, 20], [56, 34], [66, 60], [72, 96]];
      let path = "M" + px(kp[0][0]).toFixed(1) + "," + py(kp[0][1]).toFixed(1);
      for (let i = 0; i < kp.length - 1; i++) {
        const p0 = kp[i > 0 ? i - 1 : 0], p1 = kp[i], p2 = kp[i + 1];
        const p3 = kp[i + 2 < kp.length ? i + 2 : kp.length - 1];
        path += " C" + px(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + "," + py(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) +
                " " + px(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + "," + py(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) +
                " " + px(p2[0]).toFixed(1) + "," + py(p2[1]).toFixed(1);
      }
      out += '<path class="qd-curve qd-s" d="' + path + '"/>' +
        txt(px(72) + 4, py(96) - 4, "AS", "qd-lbl", "start");
    }

    /* two parallel AD curves, the second shifted by `shift` */
    (d.ad || []).forEach(function (a) {
      out += line(px(a.from[0]), py(a.from[1]), px(a.to[0]), py(a.to[1]), "qd-curve qd-d") +
        txt(px(a.to[0]) + 6, py(a.to[1]) + 4, a.label, "qd-lbl", "start");
    });

    (d.points || []).forEach(function (p) {
      const x = px(p.x), y = py(p.y);
      out += line(L, y, x, y, "qd-gd") + (p.vertical === false ? "" : line(x, y, x, B, "qd-gd"));
      if (p.py) out += txt(L - 7, y + 4, p.py, "qd-t", "end");
      if (p.px) out += txt(x, B + 15, p.px, "qd-t");
    });
    return frame(out, d.alt);
  }

  /* ---------- four diagrams as the four answers ---------- */
  function options(d) {
    return '<div class="qd-opts">' + d.items.map(function (it) {
      return '<div class="qd-opt"><span class="qd-opt-l">' + esc(it.letter) + '</span>' +
        render(it) + '</div>';
    }).join("") + '</div>';
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
    if (d.kind === "adas") return adas(d);
    if (d.kind === "options") return options(d);
    return "";
  }

  return { render: render };
})();
