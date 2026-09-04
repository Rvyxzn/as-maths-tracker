/* ============================================================
   Question packs — Economics

   Browse every past-paper question by its mark tariff, because
   that is how the paper is actually built and how you revise
   for it: "I need to drill 25 markers" is a real thing to want,
   "I need to drill Chapter 4" is not, for an essay subject.

   Each question carries the series it came from, its mark
   scheme, and the examiner's report on how people actually
   answered it. All three are Pearson's, straight out of the
   PDFs. The one worked-out field is the theme, which Pearson
   does not tag, so it is always shown as an estimate.

   Timing is the real Edexcel rate: 100 marks in 120 minutes,
   so 1.2 minutes per mark. The paper itself agrees — Section A
   says "spend 30 minutes" on 25 marks, Section B "1 hour" on 50.
   ============================================================ */

const PacksView = (function () {

  const TARIFFS = [5, 8, 10, 12, 15, 25];

  /* What each tariff is asking you to do. Taken from the command word and
     the KAA/evaluation split in the mark schemes, which is what actually
     decides how you should write the answer. */
  const GUIDE = {
    5:  { name: "Short answer", split: "Knowledge, application and analysis only",
          how: "Usually a calculation or one explained reason, plus a one-mark multiple choice. No evaluation is asked for, so do not waste time on it." },
    8:  { name: "Examine", split: "KAA 6 · Evaluation 2",
          how: "Two points, each explained in a chain, with a short evaluative comment. Depth beats breadth." },
    10: { name: "Assess", split: "KAA 6 · Evaluation 4",
          how: "One or two developed chains and a real judgement. The evaluation is worth almost half." },
    12: { name: "Discuss", split: "KAA 8 · Evaluation 4",
          how: "Two sides, each analysed properly, then a judgement that actually decides between them." },
    15: { name: "Discuss / Assess", split: "KAA 9 · Evaluation 6",
          how: "Three developed points or two with a diagram, and evaluation running through rather than bolted on at the end." },
    25: { name: "Essay", split: "KAA 16 · Evaluation 9",
          how: "Two or three fully developed chains with a diagram, and evaluation worth over a third of the marks. Running out of time before the evaluation is the single most common way to lose an A." }
  };

  let tariff = 25;
  let openId = null;
  let paperFilter = "all";

  function minutesFor(marks) { return Math.round(marks * ECO_MINUTES_PER_MARK); }

  function questions() {
    return ECO_QUESTIONS.filter(function (q) {
      if (q.marks !== tariff) return false;
      if (paperFilter !== "all" && String(q.paper) !== paperFilter) return false;
      return true;
    });
  }

  function themePill(q) {
    if (!q.theme) return '<span class="pill">theme unclear</span>';
    return '<span class="pill' + (q.themeConfident ? " acc" : "") + '" title="' +
      (q.themeConfident ? "Worked out from the question’s wording" : "Best guess — the wording is ambiguous") +
      '">Theme ' + q.theme + (q.themeConfident ? "" : "?") + '</span>';
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
        '<span class="qpack-tags">' + themePill(q) +
          (er ? '<span class="pill good" title="An examiner report covers this question">report</span>' : "") +
        '</span>' +
      '</button>' +
      (open ? body(q, er) : "") +
    '</div>';
  }

  function preview(t) {
    const s = String(t || "").replace(/\s+/g, " ").trim();
    return s.length > 110 ? s.slice(0, 110) + "…" : s;
  }

  /* The examiner report is keyed by paper, series and question label, which
     is exactly how the reports themselves are organised. */
  function reportFor(q) {
    const key = "p" + q.paper + "-" + q.series.toLowerCase().replace(/ /g, "");
    const set = typeof ECO_EXAMINER_REPORTS !== "undefined" ? ECO_EXAMINER_REPORTS[key] : null;
    if (!set) return null;
    return set.questions[q.erKey] || set.questions[q.q + (q.part || "")] || null;
  }

  function body(q, er) {
    return '<div class="qpack-body">' +
      '<div class="qpack-q">' + UI.esc(q.text).replace(/\n/g, "<br>") + '</div>' +
      '<div class="row wrap" style="gap:8px;margin:12px 0">' +
        '<span class="pill">' + q.marks + ' marks</span>' +
        '<span class="pill">' + minutesFor(q.marks) + ' min at 1.2 min/mark</span>' +
        '<span class="pill">Section ' + q.section + '</span>' +
        '<div class="spacer"></div>' +
        '<button class="btn btn-sm btn-primary" data-action="pack-time" data-id="' + q.id + '">Time me</button>' +
      '</div>' +
      (q.ms
        ? '<div class="section-label" style="margin:14px 0 8px">Mark scheme</div>' +
          '<div class="qpack-ms">' + UI.esc(q.ms).replace(/\n/g, "<br>") + '</div>'
        : '<div class="tiny faint">No mark scheme was found for this one in the PDF.</div>') +
      (er ? UI.examinerReport(er, { series: q.series, paper: q.paper,
                                    question: q.q + (q.part ? "(" + q.part + ")" : "") }) : "") +
    '</div>';
  }

  function render(root) {
    if (typeof ECO_QUESTIONS === "undefined") {
      root.innerHTML = UI.empty("✉", "No question bank for this subject",
        "Question packs are Economics only at the moment.");
      return;
    }
    const g = GUIDE[tariff];
    const list = questions();
    const totalMarks = list.length * tariff;

    root.innerHTML =
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Question packs</div>' +
          '<div class="right"><span class="tiny faint">' + ECO_QUESTIONS.length + ' questions from 18 past papers</span></div>' +
        '</div>' +
        '<div class="tiny muted">Every question, mark scheme and examiner report here is Pearson’s own, taken from the ' +
          'Edexcel 9EC0 papers. Pick a tariff and drill it.</div>' +
        '<div class="row wrap" style="gap:7px;margin-top:14px">' +
          TARIFFS.map(function (t) {
            const n = ECO_QUESTIONS.filter(function (q) { return q.marks === t; }).length;
            return '<button class="btn btn-sm' + (t === tariff ? " btn-primary" : "") + '" ' +
              'data-action="pack-tariff" data-val="' + t + '">' + t + ' mark <span class="faint">(' + n + ')</span></button>';
          }).join("") +
        '</div>' +
        '<div class="row wrap" style="gap:7px;margin-top:9px">' +
          [["all", "Both papers"], ["1", "Paper 1 · micro"], ["2", "Paper 2 · macro"]].map(function (p) {
            return '<button class="btn btn-sm' + (paperFilter === p[0] ? " btn-primary" : "") + '" ' +
              'data-action="pack-paper" data-val="' + p[0] + '">' + p[1] + '</button>';
          }).join("") +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><div class="card-title">' + tariff + ' markers — ' + g.name + '</div>' +
          '<div class="right"><span class="pill acc">' + g.split + '</span></div></div>' +
        '<div class="tiny muted">' + g.how + '</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:12px">' +
          '<span class="pill">' + list.length + ' questions</span>' +
          '<span class="pill">' + minutesFor(tariff) + ' min each</span>' +
          '<span class="pill">' + Metrics.fmtMins(minutesFor(totalMarks)) + ' to do them all</span>' +
        '</div>' +
      '</div>' +

      (list.length
        ? '<div class="stack">' + list.map(row).join("") + '</div>'
        : UI.empty("✉", "Nothing at this tariff", "Try another mark value or the other paper."));
  }

  function handle(action, el) {
    switch (action) {
      case "pack-tariff": tariff = +el.dataset.val; openId = null; App.render(); return true;
      case "pack-paper":  paperFilter = el.dataset.val; openId = null; App.render(); return true;
      case "pack-open":   openId = (openId === el.dataset.id ? null : el.dataset.id); App.render(); return true;
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
