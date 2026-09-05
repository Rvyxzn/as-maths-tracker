/* ============================================================
   Drawing the figures

   The papers put their data in charts, and a chart is vector art:
   the axis labels reach the text layer but the plotted line never
   does. Extracting the paper as text therefore produced figures
   that said "the values are not printed as text" — true, and
   useless, since half the questions ask you to read a trend off
   the very figure that had gone missing.

   So the figures are redrawn here from their data, in the same
   visual language as the diagrams: one accent per series, a light
   grid, values on the axis rather than floating. Where the paper
   printed its numbers (a table, or a bar chart with its values
   beside the bars) they are exact. Where they only existed as a
   drawn line they were read off the chart, and the figure says so,
   because a number you are going to calculate with should never
   pretend to a precision it does not have.
   ============================================================ */

const ECO_FIGURE = (function () {

  const W = 520, H = 300;
  const L = 62, R = 500, T = 26, B = 232;     // the plotting box

  function esc(s) { return (typeof UI !== "undefined" ? UI.esc(s) : String(s)); }
  function txt(x, y, s, cls, anchor) {
    return '<text class="' + cls + '" x="' + x + '" y="' + y + '"' +
      (anchor ? ' text-anchor="' + anchor + '"' : ' text-anchor="middle"') + '>' + esc(s) + '</text>';
  }
  function line(x1, y1, x2, y2, cls) {
    return '<line class="' + cls + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
  }

  /* A scale that ends on a round number, so the top gridline is a value a
     reader can actually use rather than whatever the maximum happened to be. */
  function nice(max, min) {
    const lo = Math.min(0, min == null ? 0 : min);
    const span = (max - lo) || 1;
    const step = Math.pow(10, Math.floor(Math.log10(span / 4)));
    const mult = [1, 2, 2.5, 5, 10].filter(function (m) { return span / (step * m) <= 5.5; })[0] || 10;
    const s = step * mult;
    return { lo: Math.floor(lo / s) * s, hi: Math.ceil(max / s) * s, step: s };
  }

  function fmt(v, step) {
    const dp = step < 1 ? String(step).split(".")[1].length : 0;
    return v.toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  function grid(sc, unit) {
    let out = "";
    for (let v = sc.lo; v <= sc.hi + 1e-9; v += sc.step) {
      const y = B - ((v - sc.lo) / (sc.hi - sc.lo)) * (B - T);
      out += line(L, y, R, y, "efg") +
             txt(L - 8, y + 4, fmt(v, sc.step) + (unit || ""), "eft", "end");
    }
    return out;
  }

  function frame(inner, title) {
    return '<svg class="ef" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      esc(title || "Figure") + '">' + inner + '</svg>';
  }

  function legend(names) {
    if (names.length < 2) return "";
    let x = L;
    return names.map(function (n, i) {
      const out = '<rect class="efk s' + (i % 5) + '" x="' + x + '" y="' + (T - 18) + '" width="11" height="11" rx="2"/>' +
        txt(x + 16, T - 8, n, "efl", "start");
      x += 22 + n.length * 6.1;
      return out;
    }).join("");
  }

  /* ---------- a line chart over time ---------- */
  function lineChart(f) {
    const all = f.series.reduce(function (a, s) { return a.concat(s.values.filter(function (v) { return v != null; })); }, []);
    const sc = nice(Math.max.apply(null, all), Math.min.apply(null, all));
    const n = f.x.length;
    const xAt = function (i) { return n < 2 ? (L + R) / 2 : L + (i / (n - 1)) * (R - L); };
    const yAt = function (v) { return B - ((v - sc.lo) / (sc.hi - sc.lo)) * (B - T); };

    let out = grid(sc, f.unit) + line(L, T, L, B, "efax") + line(L, B, R, B, "efax");

    /* every other tick when they would otherwise collide */
    const every = n > 12 ? Math.ceil(n / 8) : 1;
    f.x.forEach(function (lab, i) {
      if (i % every) return;
      out += txt(xAt(i), B + 16, lab, "eft");
    });

    f.series.forEach(function (s, si) {
      const pts = [];
      s.values.forEach(function (v, i) { if (v != null) pts.push(xAt(i) + "," + yAt(v)); });
      out += '<polyline class="efp s' + (si % 5) + '" points="' + pts.join(" ") + '"/>';
      s.values.forEach(function (v, i) {
        if (v == null) return;
        out += '<circle class="efd s' + (si % 5) + '" cx="' + xAt(i) + '" cy="' + yAt(v) + '" r="3"/>';
      });
    });

    out += legend(f.series.map(function (s) { return s.name; }));
    if (f.yLabel) out += txt(L - 46, T - 8, f.yLabel, "efa", "start");
    return frame(out, f.caption);
  }

  /* ---------- vertical bars, grouped where there is more than one series ---------- */
  function barChart(f) {
    const all = f.series.reduce(function (a, s) { return a.concat(s.values.filter(function (v) { return v != null; })); }, []);
    const sc = nice(Math.max.apply(null, all), 0);
    const n = f.x.length, k = f.series.length;
    const slot = (R - L) / n;
    const bw = Math.min(38, (slot * 0.72) / k);
    const yAt = function (v) { return B - ((v - sc.lo) / (sc.hi - sc.lo)) * (B - T); };

    let out = grid(sc, f.unit) + line(L, T, L, B, "efax") + line(L, B, R, B, "efax");
    /* Category names are as long as they are; when they would collide, the
       labels shrink rather than overlap or get cut. */
    const longest = f.x.reduce(function (m, l) { return Math.max(m, String(l).length); }, 0);
    const tick = longest * 6 > slot ? "eft efs" : "eft";
    f.x.forEach(function (lab, i) {
      const cx = L + slot * (i + 0.5);
      out += txt(cx, B + 16, lab, tick);
      f.series.forEach(function (s, si) {
        const v = s.values[i];
        if (v == null) return;
        const x = cx - (k * bw) / 2 + si * bw;
        out += '<rect class="efb s' + (si % 5) + '" x="' + x + '" y="' + yAt(v) +
               '" width="' + (bw - 2) + '" height="' + Math.max(0, B - yAt(v)) + '" rx="2"/>';
        if (k * n <= 14) out += txt(x + (bw - 2) / 2, yAt(v) - 5, fmt(v, sc.step) + (f.unit || ""), "efv");
      });
    });
    out += legend(f.series.map(function (s) { return s.name; }));
    if (f.yLabel) out += txt(L - 46, T - 8, f.yLabel, "efa", "start");
    return frame(out, f.caption);
  }

  /* ---------- horizontal bars: the shape a market-share figure wants ---------- */
  function hbarChart(f) {
    const vals = f.rows.map(function (r) { return r[1]; });
    const max = Math.max.apply(null, vals);
    const n = f.rows.length;
    const gap = (B - T) / n;
    const bh = Math.min(24, gap * 0.66);
    const x0 = 150;
    let out = "";
    f.rows.forEach(function (r, i) {
      const y = T + gap * i + (gap - bh) / 2;
      const w = max > 0 ? (r[1] / max) * (R - x0 - 42) : 0;
      out += txt(x0 - 9, y + bh / 2 + 4, r[0], "eft", "end") +
             '<rect class="efb s0" x="' + x0 + '" y="' + y + '" width="' + w + '" height="' + bh + '" rx="3"/>' +
             txt(x0 + w + 7, y + bh / 2 + 4, fmt(r[1], 1) + (f.unit || ""), "efv", "start");
    });
    out += line(x0, T, x0, B, "efax");
    return frame(out, f.caption);
  }

  /* ---------- a table the paper printed as a table ---------- */
  function tableHtml(f) {
    const head = f.head ? '<thead><tr>' + f.head.map(function (h) {
      return '<th>' + esc(h) + '</th>'; }).join("") + '</tr></thead>' : "";
    return '<div class="ef-tablewrap"><table class="ef-table">' + head + '<tbody>' +
      f.rows.map(function (r) {
        return '<tr>' + r.map(function (c, i) {
          return '<td' + (i ? ' class="num"' : '') + '>' + esc(c) + '</td>';
        }).join("") + '</tr>';
      }).join("") + '</tbody></table></div>';
  }

  function render(f) {
    if (!f) return "";
    if (f.kind === "line") return lineChart(f);
    if (f.kind === "bar") return barChart(f);
    if (f.kind === "hbar") return hbarChart(f);
    if (f.kind === "table") return tableHtml(f);
    return "";
  }

  /* The figures for one case study, in the order the paper prints them. */
  function forCase(key) {
    if (typeof ECO_FIGURES === "undefined") return [];
    return (ECO_FIGURES[key] || []).slice();
  }

  return { render: render, forCase: forCase };
})();
