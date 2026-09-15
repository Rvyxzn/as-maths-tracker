/* ============================================================
   The plan for a Geography answer - Edexcel A level (9GE0)
   ------------------------------------------------------------
   The Geography half of what EcoModel does for Economics, built
   on Geography's own marking rather than borrowed from it.

   Economics is marked on knowledge, application, analysis and
   evaluation, and its plan is built around that split. 9GE0 is
   marked two different ways depending on the tariff:

     POINT-MARKED   the short answers. "Award 1 mark for
                    identifying a reason, and a further 3 for
                    expansion." The scheme usually prints a worked
                    example with every (1) marked, which is the
                    most useful thing it contains.

     LEVELS-MARKED  everything from 6 marks up. Marks split
                    between AO1 (knowledge), AO2 (application,
                    analysis, evaluation) and on Paper 3 AO3
                    (using the resources), and the answer is placed
                    in a level. The TOP level's descriptors are the
                    literal definition of a full-mark answer, so
                    they are pulled out and shown first.

   Everything here is read out of the question's own mark scheme.
   Nothing is invented: the timings are the paper's own 1.3
   minutes a mark, and the shape of each answer is what the
   command word and the AO split ask for.
   ============================================================ */

const GeoModel = (function () {

  const PER_MARK = 1.3;
  function minutes(m) { return Math.max(1, Math.round(m * PER_MARK)); }

  /* Page furniture the specimen schemes carry mid-text. */
  const FOOTER = /\d*\s*Pearson Edexcel Level 3 Advanced GCE in Geography[^©]*©\s*Pearson Education Limited\s*\d{4}/gi;

  function clean(ms) {
    return String(ms || "").replace(FOOTER, " ").replace(/[ \t]{2,}/g, " ");
  }

  /* ---------- reading the scheme ---------- */

  function allocation(ms) {
    const out = {};
    const re = /AO\s*(\d)\s*[–-]?\s*\(\s*(\d+)(?:\s*\+\s*(\d+))?\s*marks?\s*\)/gi;
    let m;
    while ((m = re.exec(ms))) {
      const n = +m[2] + (m[3] ? +m[3] : 0);
      if (!out[m[1]]) out[m[1]] = n;
    }
    return out;
  }

  function pointRule(ms) {
    const m = /Award\s+1\s+mark\s+for[^.]*(\.|$)(\s*[^.]*further[^.]*\.)?/i.exec(ms);
    return m ? m[0].replace(/\s+/g, " ").trim() : null;
  }

  /* A worked example is a line that carries its own (1) marks. */
  function example(ms) {
    const lines = ms.split("\n").map(function (l) { return l.replace(/^[•\-]\s*/, "").trim(); });
    const ex = lines.filter(function (l) { return (l.match(/\(\s*1\s*\)/g) || []).length >= 2; });
    return ex.slice(0, 3);
  }

  function steer(ms) {
    const m = /There is no ['‘’`]?correct['‘’`]? answer[^.]*\./i.exec(ms);
    return m ? m[0].trim() : null;
  }

  /* The indicative content, sorted into its assessment objectives. Newer
     schemes put "AO1" on a line of its own with bullets under it; the
     specimen papers run it on as "AO1 mega-disasters are large-scale...".
     Both are read. Collection stops where the levels table starts. */
  function points(ms) {
    const ao = { 1: [], 2: [], 3: [] };
    let cur = null;
    const lines = ms.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let l = lines[i].trim();
      if (!l) continue;
      if (/^Level\b|Level\s+Mark\s+Descriptor|^Accept (any|other)/i.test(l)) {
        if (cur) cur = null;
        if (/^Level\b/i.test(l)) break;
        continue;
      }
      if (/Responses that demonstrate only AO1/i.test(l) || /Level\s*\d\s*AO1 performance/i.test(l)) continue;
      /* An allocation line. On the older papers the content starts on the
         SAME line -- "AO1 – (8 marks) systems consist of inputs, stores and
         outputs..." -- and skipping the line whole lost every point on 26
         of the 44 eight-markers. So the allocation is taken off the front
         and whatever follows it is kept. */
      const alloc = /^((?:\s*\/?\s*AO\s*(\d)\s*[–-]?\s*\(\s*\d+(?:\s*\+\s*\d+)?\s*marks?\s*\))+)\s*(.*)$/i.exec(l);
      if (alloc) {
        const ids = (alloc[1].match(/AO\s*\d/gi) || []).map(function (s) { return s.replace(/\D/g, ""); });
        if (ids.length === 1) cur = ids[0];
        l = alloc[3].trim();
        if (!l || !cur) continue;
      } else if (/AO\d\s*[–-]?\s*\(\s*\d+/.test(l)) continue;

      const head = /^AO\s*(\d)\b\s*(.*)$/.exec(l);
      if (head && /^[123]$/.test(head[1])) {
        cur = head[1];
        l = head[2].trim();
        if (!l) continue;
      }
      if (!cur) continue;
      if (/^[•\-]\s*/.test(l)) {
        ao[cur].push(l.replace(/^[•\-]\s*/, ""));
      } else if (ao[cur].length && !/[.:;]$/.test(ao[cur][ao[cur].length - 1])) {
        ao[cur][ao[cur].length - 1] += " " + l;
      } else {
        ao[cur].push(l);
      }
    }
    Object.keys(ao).forEach(function (k) {
      ao[k] = ao[k].map(function (p) { return p.replace(/\s+/g, " ").trim(); })
        .filter(function (p) { return p.length > 12; });
    });
    return ao;
  }

  /* THE TOP LEVEL. The table lists its bands bottom to top, and each band
     has the same number of descriptor bullets, so the last band's bullets
     are the last (total / bands) of them. That is the definition of full
     marks, in Pearson's words. */
  function topLevel(ms) {
    const at = ms.search(/Level\s+Mark\s+Descriptor|^Level\s*\d/im);
    if (at < 0) return null;
    const table = ms.slice(at);
    const bands = [];
    const bre = /\b(\d{1,2})\s*[–-]\s*(\d{1,2})\b/g;
    let b;
    while ((b = bre.exec(table))) {
      const lo = +b[1], hi = +b[2];
      if (hi > lo && hi <= 24 && !bands.some(function (x) { return x.hi === hi; })) bands.push({ lo: lo, hi: hi });
    }
    const bullets = table.split(/•/).slice(1).map(function (s) {
      return s.replace(/\b\d{1,2}\s*[–-]\s*\d{1,2}\b/g, "").replace(/No rewardable material\.?/i, "")
        .replace(/Level\s*\d/gi, "").replace(/\s+/g, " ").trim();
    }).filter(function (s) { return /\(AO\d\)/.test(s); });
    if (!bullets.length || !bands.length) return null;
    const per = bullets.length % bands.length === 0 ? bullets.length / bands.length : null;
    const top = bands.sort(function (x, y) { return y.hi - x.hi; })[0];
    const take = per || Math.min(bullets.length, 4);
    return {
      band: top.lo + "–" + top.hi,
      descriptors: bullets.slice(-take).map(function (s) {
        return s.replace(/\s*\((AO\d)\)\s*$/, " ($1)").trim();
      })
    };
  }

  /* ---------- the shape of the answer ---------- */

  function command(text) {
    const t = String(text || "");
    if (/\bevaluate\b|to what extent/i.test(t)) return "evaluate";
    if (/\bassess\b/i.test(t)) return "assess";
    if (/\banalyse\b/i.test(t)) return "analyse";
    if (/\bcalculate\b|\bcomplete\b/i.test(t)) return "calculate";
    if (/\bsuggest\b/i.test(t)) return "suggest";
    return "explain";
  }

  function shapeFor(q, cmd, ao) {
    const m = q.marks;
    const figure = /\bFigure\b|Resource Booklet|\bTable\b/i.test(q.text);
    if (m <= 4 && cmd === "calculate") {
      return [["Write the formula or method", 1], ["Substitute the figures from the resource", Math.max(1, m - 2)],
              ["Give the answer, with its unit and the precision asked for", 1]];
    }
    if (m <= 4) {
      return [["Identify the reason", 1], ["Develop it: because…", 1], ["Develop it again: which means…", 1],
              ["Tie it back to exactly what was asked", 1]].slice(0, m);
    }
    if (m <= 6) {
      return [["Point one, explained and tied to a real place", Math.ceil(m / 2)],
              ["Point two, explained the same way", Math.floor(m / 2)]];
    }
    /* An 8-mark Analyse is marked on reading the resource: AO1 plus AO3. */
    if (m <= 9 && (cmd === "analyse" || (figure && ao[3]))) {
      return [["Describe the pattern, quoting numbers off the figure", 3],
              ["Explain what causes it, using your own knowledge", m - 5],
              ["Anomalies, or what the data cannot tell you", 2]];
    }
    if (m <= 10) {
      return [["Point one, developed with a named example", 3], ["Point two, developed the same way", 3],
              ["Point three, or how the points connect", m - 6]];
    }
    if (m <= 12) {
      return [["Define the terms and set up what it depends on", 1],
              ["Factor one: the knowledge, then weigh it", 3],
              ["Factor two: the knowledge, then weigh it against the first", 3],
              ["Factor three, or the case against", 2],
              ["Judgement: which matters most, and why", 3]];
    }
    if (q.paper === 3 || ao[3]) {
      return [["Introduction: the issue, set up from the booklet", 2],
              ["Argument one, built on the resources and quoted", Math.round(m * 0.25)],
              ["Argument two, from your own knowledge across other topics", Math.round(m * 0.25)],
              ["The case against, weighed", Math.round(m * 0.17)],
              ["Conclusion that commits to a view", m - 2 - 2 * Math.round(m * 0.25) - Math.round(m * 0.17)]];
    }
    return [["Introduction: define the terms and the debate", 2],
            ["Argument for, with a named case study and data", Math.round(m * 0.25)],
            ["Argument against, with a named case study", Math.round(m * 0.25)],
            ["Weigh them: scale, time, place, and who is affected", Math.round(m * 0.2)],
            ["Conclusion that answers 'to what extent'", m - 2 - 2 * Math.round(m * 0.25) - Math.round(m * 0.2)]];
  }

  function build(q) {
    if (!q || q.subject !== "geography") return null;
    const ms = clean(q.ms);
    const ao = allocation(ms);
    const cmd = command(q.text);
    const pts = points(ms);
    const rule = pointRule(ms);
    const steps = shapeFor(q, cmd, ao).filter(function (s) { return s[1] > 0; }).map(function (s) {
      return { label: s[0], marks: s[1], minutes: minutes(s[1]) };
    });
    return {
      marks: q.marks,
      minutes: minutes(q.marks),
      command: cmd,
      allocation: ao,
      pointMarked: !!rule,
      rule: rule,
      example: example(ms),
      steer: steer(ms),
      steps: steps,
      ao1: pts[1], ao2: pts[2], ao3: pts[3],
      top: rule ? null : topLevel(ms),
      usesResource: /\bFigure\b|Resource Booklet|\bTable\b/i.test(q.text)
    };
  }

  return { build: build, minutes: minutes, command: command, clean: clean };
})();
