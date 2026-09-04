/* ============================================================
   Question packs — Economics

   Browse every past-paper question by its mark tariff, because
   that is how the paper is built and how you revise for it.
   "I need to drill 25 markers" is a real thing to want.

   The question stands alone until you ask for the answer. A
   mark scheme sitting open next to the question is not practice,
   it is reading, so it stays behind Reveal answer.

   Question wording, tariffs and mark schemes are Pearson's,
   straight out of the PDFs. Year 1 / Year 2 is worked out here
   (Themes 1 and 2 are Year 1, Themes 3 and 4 are Year 2) and
   marked with a question mark when the wording is ambiguous.
   ============================================================ */

const PacksView = (function () {

  const TARIFFS = [5, 8, 10, 12, 15, 25];

  /* What each tariff is asking for, from the command word and the real
     KAA/evaluation split in the mark schemes. */
  const GUIDE = {
    5:  { name: "Short answer", split: "Knowledge, application and analysis only",
          how: "A calculation or one explained reason, plus a one-mark multiple choice. No evaluation is asked for, so do not spend time on it." },
    8:  { name: "Examine", split: "KAA 6 · Evaluation 2",
          how: "Two points, each explained as a chain, with a short evaluative comment. Depth beats breadth." },
    10: { name: "Assess", split: "KAA 6 · Evaluation 4",
          how: "One or two developed chains and a real judgement. Evaluation is worth almost half." },
    12: { name: "Discuss", split: "KAA 8 · Evaluation 4",
          how: "Two sides, each analysed properly, then a judgement that actually decides between them." },
    15: { name: "Discuss / Assess", split: "KAA 9 · Evaluation 6",
          how: "Three developed points, or two with a diagram, and evaluation running through rather than bolted on the end." },
    25: { name: "Essay", split: "KAA 16 · Evaluation 9",
          how: "Two or three fully developed chains with a diagram, and evaluation worth over a third of the marks. Running out of time before the evaluation is the most common way to lose an A." }
  };

  let tariff = 25;
  let openId = null;
  let revealed = {};
  let paperFilter = "all";
  let yearFilter = "all";

  function minutesFor(marks) { return Math.round(marks * ECO_MINUTES_PER_MARK); }

  function questions() {
    return ECO_QUESTIONS.filter(function (q) {
      if (q.marks !== tariff) return false;
      if (paperFilter !== "all" && String(q.paper) !== paperFilter) return false;
      if (yearFilter !== "all" && String(q.year) !== yearFilter) return false;
      return true;
    });
  }

  function countBy(fn) {
    return ECO_QUESTIONS.filter(function (q) {
      return q.marks === tariff && (paperFilter === "all" || String(q.paper) === paperFilter) && fn(q);
    }).length;
  }

  /* ---------- mark scheme, laid out rather than dumped ----------
     Edexcel mark schemes have a shape: a marks line ("Knowledge 2,
     Application 2, Analysis 4"), then indicative content as bullets, then
     level descriptors. Rendered as one paragraph it is unreadable, which is
     the complaint. Each kind of line is recognised and given its own form. */
  function msSheet(text) {
    const raw = String(text || "").split("\n").map(function (l) { return l.trim(); })
                  .filter(function (l) { return l.length; });

    /* The PDF wraps every line at the column width, so a single bullet or
       level descriptor arrives as several lines. Merge them back before
       deciding what anything is: a line that starts lower-case, or that
       follows one which clearly has not finished, continues the line above. */
    const STARTS = /^(•|[A-D]\s|Level\s*\d|\(?[a-e]\)|Knowledge|KAA|Application|Analysis|Evaluation|Effects|NB\b|\(\d+\)|\d+\s+[A-Z])/;
    const lines = [];
    raw.forEach(function (l) {
      const isNew = STARTS.test(l) || (/^[A-Z]/.test(l) && lines.length &&
                                       /[.:;?]$/.test(lines[lines.length - 1]));
      if (!lines.length || isNew) lines.push(l);
      else lines[lines.length - 1] += " " + l;
    });

    let html = "", inList = false, inLevel = false;
    const closeList = function () { if (inList) { html += "</ul>"; inList = false; } };
    const closeLevel = function () { if (inLevel) { html += "</div>"; inLevel = false; } };

    lines.forEach(function (line) {
      /* A level descriptor runs to several sentences. They belong in the
         level's own box, not loose underneath it. */
      if (inLevel && !/^(Level\s*\d|\d+\s+A completely|•|\(?[a-e]\)$|Knowledge|KAA|Application|Analysis|Evaluation)/i.test(line)) {
        html += " " + UI.esc(line);
        return;
      }
      closeLevel();
      if (/^\([a-e]\)$/.test(line)) {                       // part marker
        closeList();
        html += '<div class="ms2-part">Part ' + UI.esc(line.replace(/[()]/g, "")) + '</div>';
        return;
      }
      if (/^(Knowledge|KAA|Application|Analysis|Evaluation)\b.*\d/.test(line) && line.length < 120) {
        closeList();
        html += '<div class="ms2-marks">' + UI.esc(line) + '</div>';
        return;
      }
      if (/^(Level\s*\d|\d+\s+A completely)/i.test(line)) {
        closeList();
        /* "Level 1 1–2 Displays..." reads as one number followed by another.
           Split the level from its mark range so both are legible. */
        const m = line.match(/^(Level\s*\d+|\d+)\s*([\d]+\s*[–—-]\s*[\d]+)?\s*(.*)$/i);
        html += '<div class="ms2-level"><b>' + UI.esc(m ? m[1] : line) + '</b>' +
                (m && m[2] ? '<span class="ms2-range">' + UI.esc(m[2].replace(/\s+/g, "")) + '</span>' : "") +
                (m && m[3] ? " " + UI.esc(m[3]) : "");
        inLevel = true;                     // closed when the next block starts
        return;
      }
      if (/^[••]/.test(line)) {
        if (!inList) { html += '<ul class="ms2-list">'; inList = true; }
        html += "<li>" + UI.esc(line.replace(/^[••]\s*/, "")) + "</li>";
        return;
      }
      if (/^\(?\d+\)?$/.test(line)) {                       // a bare mark total
        closeList();
        html += '<div class="ms2-total">' + UI.esc(line.replace(/[()]/g, "")) + ' marks</div>';
        return;
      }
      closeList();
      html += "<p>" + UI.esc(line) + "</p>";
    });
    closeLevel();
    closeList();
    return '<div class="ms2">' + html + "</div>";
  }

  /* The PDF gives one line per cell, so a table arrives as a column of
     fragments and prose arrives broken mid-sentence. Reflow it: run the
     fragments back together, and only start a new line where the paper
     genuinely does — a new part, a multiple-choice option, or a tariff. */
  const BREAK = /^(\([a-e]\)|\(\d+\)$|[A-D]\s+[A-Z(]|[A-D]$|Extract\s|Figure\s|Table\s)/;

  function questionHtml(t) {
    const lines = String(t || "").split("\n")
      .map(function (l) { return l.trim(); })
      .filter(function (l) { return l.length; });
    const out = [];
    lines.forEach(function (l) {
      if (!out.length || BREAK.test(l)) { out.push(l); return; }
      const prev = out[out.length - 1];
      /* keep a break after a finished sentence, otherwise glue it back */
      if (/[.?:;]$/.test(prev) && /^[A-Z(]/.test(l)) out.push(l);
      else out[out.length - 1] = prev + " " + l;
    });
    return out.map(function (l) { return UI.esc(l); }).join("<br>");
  }

  function yearPill(q) {
    if (!q.year) return '<span class="pill">year unclear</span>';
    return '<span class="pill' + (q.themeConfident ? " acc" : "") + '" title="' +
      (q.themeConfident ? "Theme " + q.theme + ", worked out from the wording"
                        : "Theme " + q.theme + " is the best guess; the wording is ambiguous") +
      '">Year ' + q.year + ' · T' + q.theme + (q.themeConfident ? "" : "?") + '</span>';
  }

  function reportFor(q) {
    const key = "p" + q.paper + "-" + q.series.toLowerCase().replace(/ /g, "");
    const set = typeof ECO_EXAMINER_REPORTS !== "undefined" ? ECO_EXAMINER_REPORTS[key] : null;
    if (!set) return null;
    return set.questions[q.erKey] || set.questions[q.q + (q.part || "")] || null;
  }

  function preview(t) {
    const s = String(t || "").replace(/\s+/g, " ").trim();
    return s.length > 105 ? s.slice(0, 105) + "…" : s;
  }

  function row(q) {
    const open = openId === q.id;
    const er = reportFor(q);
    return '<div class="qpack' + (open ? " open" : "") + '">' +
      '<button class="qpack-head" data-action="pack-open" data-id="' + q.id + '">' +
        '<span class="qpack-marks">' + q.marks + '</span>' +
        '<span class="qpack-main">' +
          '<b>' + UI.esc(q.series) + ' · Paper ' + q.paper + ' · Q' + q.q + (q.part ? "(" + q.part + ")" : "") + '</b>' +
          '<small>' + UI.esc(preview(q.text)) + '</small>' +
        '</span>' +
        '<span class="qpack-tags">' + yearPill(q) +
          (er ? '<span class="pill good">report</span>' : "") +
        '</span>' +
      '</button>' +
      (open ? body(q, er) : "") +
    '</div>';
  }

  function body(q, er) {
    const show = !!revealed[q.id];
    return '<div class="qpack-body">' +
      '<div class="qpack-q">' + questionHtml(q.text) + '</div>' +
      '<div class="row wrap" style="gap:8px;margin:12px 0">' +
        '<span class="pill">' + q.marks + ' marks</span>' +
        '<span class="pill">' + minutesFor(q.marks) + ' min</span>' +
        '<span class="pill">Section ' + q.section + '</span>' +
        '<div class="spacer"></div>' +
        '<button class="btn btn-sm" data-action="pack-time" data-id="' + q.id + '">Time me</button>' +
      '</div>' +

      (show
        ? (q.ms
            ? '<div class="section-label" style="margin:16px 0 8px">Mark scheme</div>' + msSheet(q.ms)
            : '<div class="tiny faint">No mark scheme was found for this one in the PDF.</div>') +
          (er ? UI.examinerReport(er, { series: q.series, paper: q.paper,
                                        question: q.q + (q.part ? "(" + q.part + ")" : "") }) : "") +
          '<button class="btn btn-sm btn-block" style="margin-top:12px" data-action="pack-hide" data-id="' + q.id + '">Hide the answer</button>'
        : '<button class="btn btn-primary btn-block" data-action="pack-reveal" data-id="' + q.id + '">' +
            'Reveal answer' + (er ? " and examiner report" : "") + '</button>' +
          '<div class="tiny faint" style="text-align:center;margin-top:8px">Write your answer first — ' +
            minutesFor(q.marks) + ' minutes is what it is worth.</div>') +
    '</div>';
  }

  /* The Year 1 / Year 2 split, as one wide control across the card. */
  function yearBar() {
    const y1 = countBy(function (q) { return q.year === 1; });
    const y2 = countBy(function (q) { return q.year === 2; });
    const seg = function (val, label, n) {
      return '<button class="yearseg' + (yearFilter === val ? " on" : "") + '" ' +
        'data-action="pack-year" data-val="' + val + '">' +
        label + '<small>' + n + '</small></button>';
    };
    return '<div class="yearbar">' +
      seg("1", "YEAR 1", y1) +
      seg("2", "YEAR 2", y2) +
    '</div>' +
    (yearFilter !== "all"
      ? '<button class="btn btn-sm btn-block" style="margin-top:8px" data-action="pack-year" data-val="all">Show both years</button>'
      : "");
  }

  function render(root) {
    if (typeof ECO_QUESTIONS === "undefined") {
      root.innerHTML = UI.empty("✎", "No question bank for this subject",
        "Question packs are Economics only at the moment.");
      return;
    }
    const g = GUIDE[tariff];
    const list = questions();

    root.innerHTML =
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Question packs</div>' +
          '<div class="right"><span class="tiny faint">' + ECO_QUESTIONS.length + ' questions from 18 past papers</span></div>' +
        '</div>' +
        '<div class="tiny muted">Every question, mark scheme and examiner report is Pearson’s own, from the ' +
          'Edexcel 9EC0 papers. Pick a tariff and drill it.</div>' +
        '<div class="row wrap" style="gap:7px;margin-top:14px">' +
          /* Counts follow the paper and year you have picked, so the number
             on the button is the number you would actually get. */
          TARIFFS.map(function (t) {
            const n = ECO_QUESTIONS.filter(function (q) {
              return q.marks === t &&
                (paperFilter === "all" || String(q.paper) === paperFilter) &&
                (yearFilter === "all" || String(q.year) === yearFilter);
            }).length;
            return '<button class="btn btn-sm' + (t === tariff ? " btn-primary" : "") +
              (n ? "" : " is-empty") + '" ' +
              'data-action="pack-tariff" data-val="' + t + '">' + t + ' mark <span class="faint">(' + n + ')</span></button>';
          }).join("") +
        '</div>' +
        '<div class="row wrap" style="gap:7px;margin-top:9px">' +
          [["all", "Both papers"], ["1", "Paper 1 · micro"], ["2", "Paper 2 · macro"]].map(function (p) {
            return '<button class="btn btn-sm' + (paperFilter === p[0] ? " btn-primary" : "") + '" ' +
              'data-action="pack-paper" data-val="' + p[0] + '">' + p[1] + '</button>';
          }).join("") +
        '</div>' +
        '<div style="margin-top:12px">' + yearBar() + '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><div class="card-title">' + tariff + ' markers — ' + g.name + '</div>' +
          '<div class="right"><span class="pill acc">' + g.split + '</span></div></div>' +
        '<div class="tiny muted">' + g.how + '</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:12px">' +
          '<span class="pill">' + list.length + ' questions</span>' +
          '<span class="pill">' + minutesFor(tariff) + ' min each</span>' +
          '<span class="pill">' + Metrics.fmtMins(minutesFor(list.length * tariff)) + ' for all of them</span>' +
        '</div>' +
      '</div>' +

      (list.length
        ? '<div class="stack">' + list.map(row).join("") + '</div>'
        : UI.empty("✎", "Nothing matches", "Try another tariff, paper or year."));
  }

  function handle(action, el) {
    switch (action) {
      case "pack-tariff": tariff = +el.dataset.val; openId = null; App.render(); return true;
      case "pack-paper":  paperFilter = el.dataset.val; openId = null; App.render(); return true;
      case "pack-year":   yearFilter = el.dataset.val; openId = null; App.render(); return true;
      case "pack-open":   openId = (openId === el.dataset.id ? null : el.dataset.id); App.render(); return true;
      case "pack-reveal": revealed[el.dataset.id] = true; App.render(); return true;
      case "pack-hide":   delete revealed[el.dataset.id]; App.render(); return true;
      case "pack-time": {
        const q = ECO_QUESTIONS.filter(function (x) { return x.id === el.dataset.id; })[0];
        if (q) App.startQuestionTimer(q);
        return true;
      }
    }
    return false;
  }

  return { render: render, handle: handle, minutesFor: minutesFor };
})();
