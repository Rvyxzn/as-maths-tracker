/* ============================================================
   Question packs — Economics

   Browse every past-paper question by its mark tariff, because
   that is how the paper is built and how you revise for it.

   Opening a question takes over the page: the list goes soft
   behind it and the question is the only thing to read. A data
   response's figures and extracts live in a panel that slides
   out from the side, because you need them beside the question,
   not scrolled away above it.

   The question stays alone until you ask for the answer. A mark
   scheme sitting open next to the question is reading, not
   practice.
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
  let focusId = null;          // the question that has taken over the page
  let revealed = {};
  let caseOpen = false;
  let caseWidth = null;        // px, once you have dragged the divider
  let paperFilter = "all";
  let yearFilter = "all";

  function minutesFor(marks) { return Math.round(marks * ECO_MINUTES_PER_MARK); }
  function byId(id) { return ECO_QUESTIONS.filter(function (q) { return q.id === id; })[0]; }

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

  /* ---------- assessment objectives ---------- */
  const AO = [
    { re: /knowledge/i,   key: "k",  label: "K",  title: "Knowledge — define it, state it" },
    { re: /application/i, key: "ap", label: "AP", title: "Application — use the data and the context" },
    { re: /analysis/i,    key: "an", label: "AN", title: "Analysis — build the chain of reasoning" },
    { re: /evaluation/i,  key: "ev", label: "EV", title: "Evaluation — judge it, and say what it depends on" }
  ];

  function aoBadges(line) {
    const found = [];
    line.split(/[,;]/).forEach(function (bit) {
      const n = (bit.match(/(\d+)/) || [])[1];
      if (!n) return;
      AO.forEach(function (ao) { if (ao.re.test(bit)) found.push({ ao: ao, n: n }); });
    });
    if (!found.length) return '<div class="ms2-marks">' + UI.esc(line) + '</div>';
    found.sort(function (a, b) { return AO.indexOf(a.ao) - AO.indexOf(b.ao); });
    return '<div class="ms2-ao">' + found.map(function (f) {
      return '<span class="ao ao-' + f.ao.key + '" title="' + UI.esc(f.ao.title) + '">' +
        '<b>' + f.ao.label + '</b>' + f.n + '</span>';
    }).join("") + '</div>';
  }

  /* ---------- mark scheme ---------- */
  function msSheet(text) {
    const raw = String(text || "").split("\n").map(function (l) { return l.trim(); })
                  .filter(function (l) { return l.length; });

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

    const EVAL_HEAD = /^Evaluation\b(?!\s*\d+\s*$)/i;
    const hasEval = lines.some(function (l) { return EVAL_HEAD.test(l); });
    let started = false;

    lines.forEach(function (line) {
      if (hasEval && EVAL_HEAD.test(line)) {
        closeLevel(); closeList();
        const rest = line.replace(/^Evaluation\s*:?\s*/i, "").trim();
        html += '<div class="ms2-sec ms2-sec-ev"><b>EV</b>Evaluation</div>' +
                (rest ? '<p class="ms2-note">' + UI.esc(rest) + '</p>' : "");
        started = true;
        return;
      }
      if (inLevel && !/^(Level\s*\d|\d+\s+A completely|•|\(?[a-e]\)$|Knowledge|KAA|Application|Analysis|Evaluation)/i.test(line)) {
        html += " " + UI.esc(line);
        return;
      }
      closeLevel();
      if (/^\([a-e]\)$/.test(line)) {
        closeList();
        html += '<div class="ms2-part">Part ' + UI.esc(line.replace(/[()]/g, "")) + '</div>';
        return;
      }
      if (/^(Knowledge|KAA|Application|Analysis|Evaluation)\b.*\d/.test(line) && line.length < 120) {
        closeList();
        html += aoBadges(line);
        return;
      }
      if (/^(Level\s*\d|\d+\s+A completely)/i.test(line)) {
        closeList();
        const m = line.match(/^(Level\s*\d+|\d+)\s*([\d]+\s*[–—-]\s*[\d]+)?\s*(.*)$/i);
        html += '<div class="ms2-level"><b>' + UI.esc(m ? m[1] : line) + '</b>' +
                (m && m[2] ? '<span class="ms2-range">' + UI.esc(m[2].replace(/\s+/g, "")) + '</span>' : "") +
                (m && m[3] ? " " + UI.esc(m[3]) : "");
        inLevel = true;
        return;
      }
      if (/^[••]/.test(line)) {
        if (hasEval && !started) {
          html += '<div class="ms2-sec ms2-sec-kaa"><b>KAA</b>Knowledge, application and analysis</div>';
          started = true;
        }
        if (!inList) { html += '<ul class="ms2-list">'; inList = true; }
        html += "<li>" + UI.esc(line.replace(/^[••]\s*/, "")) + "</li>";
        return;
      }
      if (/^\(?\d+\)?$/.test(line)) {
        closeList();
        html += '<div class="ms2-total">' + UI.esc(line.replace(/[()]/g, "")) + ' marks</div>';
        return;
      }
      closeList();
      html += "<p>" + UI.esc(line) + "</p>";
    });
    closeLevel(); closeList();
    return '<div class="ms2">' + html + "</div>";
  }

  /* ---------- question text ---------- */
  const BREAK = /^(\([a-e]\)|\(\d+\)$|[A-D]\s+[A-Z(]|[A-D]$|Extract\s|Figure\s|Table\s)/;

  function questionHtml(t) {
    const lines = String(t || "").split("\n")
      .map(function (l) { return l.trim(); }).filter(function (l) { return l.length; });
    const out = [];
    lines.forEach(function (l) {
      if (!out.length || BREAK.test(l)) { out.push(l); return; }
      const prev = out[out.length - 1];
      if (/[.?:;]$/.test(prev) && /^[A-Z(]/.test(l)) out.push(l);
      else out[out.length - 1] = prev + " " + l;
    });
    return out.map(function (l) {
      /* the multiple-choice options and the tariff read as their own things */
      if (/^\(\d+\)$/.test(l)) return '<span class="q-tariff">' + UI.esc(l.replace(/[()]/g, "")) + ' marks</span>';
      if (/^[A-D]\s/.test(l)) return '<span class="q-opt"><b>' + l.charAt(0) + '</b>' + UI.esc(l.slice(2)) + '</span>';
      if (/^\([a-e]\)/.test(l)) return '<span class="q-part">' + UI.esc(l) + '</span>';
      return '<span class="q-line">' + UI.esc(l) + '</span>';
    }).join("");
  }

  /* ---------- the case study ---------- */
  function caseFor(q) {
    return (q.caseKey && typeof ECO_CASE_STUDIES !== "undefined")
      ? ECO_CASE_STUDIES[q.caseKey] : null;
  }

  function figureHtml(f) {
    const rows = (f.data || []).map(function (d) {
      return '<tr><td>' + UI.esc(d[0]) + '</td><td class="num">' + UI.esc(d[1]) + '</td></tr>';
    }).join("");
    return '<div class="cs-fig">' +
      '<div class="cs-fig-head"><b>' + UI.esc(f.label) + '</b>' +
        (f.caption ? '<span>' + UI.esc(f.caption) + '</span>' : "") + '</div>' +
      (rows ? '<table class="cs-table"><tbody>' + rows + '</tbody></table>'
            : '<div class="tiny faint">The figure in the paper is a chart; its values are not printed as text.</div>') +
    '</div>';
  }

  function caseHtml(cs) {
    return '<div class="cs-head">' + UI.icon("info") + '<span>Case Study</span></div>' +
      (cs.title ? '<h4 class="cs-title">' + UI.esc(cs.title) + '</h4>' : "") +
      cs.figures.map(figureHtml).join("") +
      cs.extracts.map(function (e) {
        return '<div class="cs-ext">' +
          '<div class="cs-ext-label">' + UI.esc(e.label) + '</div>' +
          (e.head ? '<div class="cs-ext-head">' + UI.esc(e.head) + '</div>' : "") +
          '<p>' + UI.esc(e.body) + '</p>' +
        '</div>';
      }).join("");
  }

  /* ---------- list ---------- */
  function yearPill(q) {
    if (!q.year) return '<span class="pill">year unclear</span>';
    return '<span class="pill acc" title="' +
      (q.topicCode ? "Specification " + q.topicCode + " — " + q.topicName : "Theme " + q.theme) +
      '">Y' + q.year + ' · ' + UI.esc(q.topicCode || ("T" + q.theme)) + '</span>';
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
    return '<div class="qpack">' +
      '<button class="qpack-head" data-action="pack-open" data-id="' + q.id + '">' +
        '<span class="qpack-marks">' + q.marks + '</span>' +
        '<span class="qpack-main">' +
          '<b>' + UI.esc(q.series) + ' · Paper ' + q.paper + ' · Q' + q.q + (q.part ? "(" + q.part + ")" : "") + '</b>' +
          '<small>' + UI.esc(preview(q.text)) + '</small>' +
        '</span>' +
        '<span class="qpack-tags">' + yearPill(q) +
          (caseFor(q) ? '<span class="pill">case study</span>' : "") +
          (reportFor(q) ? '<span class="pill good">report</span>' : "") +
        '</span>' +
      '</button>' +
    '</div>';
  }

  /* ---------- the focused question ---------- */
  function focusHtml(q) {
    const cs = caseFor(q);
    const er = reportFor(q);
    const show = !!revealed[q.id];
    const g = GUIDE[q.marks] || {};

    /* The backdrop closes; the card does not. The card carries its own
       do-nothing action so that a click inside it resolves to that rather
       than bubbling up to the backdrop's close. Buttons inside still win,
       because they are nearer to the click than the card is. */
    return '<div class="qfocus" data-action="pack-close">' +
      '<div class="qfocus-shell" data-action="pack-keep">' +
        (cs ? '<aside class="qcase' + (caseOpen ? " open" : "") + '">' +
                '<button class="qcase-tab" data-action="pack-case">' +
                  '<span>CASE STUDY</span>' +
                '</button>' +
                '<div class="qcase-body"' +
                  (caseOpen && caseWidth ? ' style="width:' + caseWidth + 'px"' : "") + '>' +
                  caseHtml(cs) + '</div>' +
              '</aside>' +
              /* Drag the divider to give either side more room; a plain click
                 on the knob folds the case study away. */
              (caseOpen
                ? '<div class="qsplit" data-action="pack-keep" data-split>' +
                    '<span class="qsplit-knob" title="Drag to resize, click to close">‹</span>' +
                  '</div>'
                : "")
            : "") +

        '<div class="qfocus-main">' +
          '<div class="qfocus-bar">' +
            '<span class="qfocus-marks">' + q.marks + '</span>' +
            '<div class="qfocus-where">' +
              '<b>' + UI.esc(q.series) + ' · Paper ' + q.paper + ' · Q' + q.q + (q.part ? "(" + q.part + ")" : "") + '</b>' +
              '<small>' + (q.topicCode ? UI.esc(q.topicCode + " " + q.topicName) + ' · ' : "") +
                'Theme ' + q.theme + ' · Year ' + q.year + '</small>' +
            '</div>' +
            '<div class="spacer"></div>' +
            '<span class="pill">' + minutesFor(q.marks) + ' min</span>' +
            '<button class="btn btn-sm" data-action="pack-time" data-id="' + q.id + '">Time me</button>' +
            '<button class="icon-btn" data-action="pack-close" title="Close">✕</button>' +
          '</div>' +

          '<div class="qfocus-scroll">' +
            '<div class="qtext">' + questionHtml(q.text) + '</div>' +
            (g.split ? '<div class="qfocus-guide"><b>' + UI.esc(g.name) + '</b>' +
                       '<span class="pill acc">' + UI.esc(g.split) + '</span>' +
                       '<p>' + UI.esc(g.how) + '</p></div>' : "") +

            (show
              ? (q.ms ? '<div class="section-label" style="margin:18px 0 8px">Mark scheme</div>' + msSheet(q.ms)
                      : '<div class="tiny faint">No mark scheme was found for this one.</div>') +
                (er ? UI.examinerReport(er, { series: q.series, paper: q.paper,
                                              question: q.q + (q.part ? "(" + q.part + ")" : "") }) : "") +
                '<button class="btn btn-sm btn-block" style="margin-top:14px" data-action="pack-hide" data-id="' + q.id + '">Hide the answer</button>'
              : '<button class="btn btn-primary btn-block" style="margin-top:18px" data-action="pack-reveal" data-id="' + q.id + '">' +
                  'Reveal answer' + (er ? " and examiner report" : "") + '</button>' +
                '<div class="tiny faint" style="text-align:center;margin-top:8px">Write your answer first — ' +
                  minutesFor(q.marks) + ' minutes is what it is worth.</div>') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---------- year control ---------- */
  function yearBar() {
    const seg = function (val, label, n) {
      return '<button class="yearseg' + (yearFilter === val ? " on" : "") + '" ' +
        'data-action="pack-year" data-val="' + val + '">' + label + '<small>' + n + '</small></button>';
    };
    return '<div class="yearbar">' +
      seg("1", "YEAR 1", countBy(function (q) { return q.year === 1; })) +
      seg("2", "YEAR 2", countBy(function (q) { return q.year === 2; })) +
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
    const focused = focusId ? byId(focusId) : null;

    root.innerHTML =
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Question packs</div>' +
          '<div class="right"><span class="tiny faint">' + ECO_QUESTIONS.length + ' questions from 18 past papers</span></div>' +
        '</div>' +
        '<div class="tiny muted">Every question, mark scheme and examiner report is Pearson’s own, from the ' +
          'Edexcel 9EC0 papers. Pick a tariff and drill it.</div>' +
        '<div class="row wrap" style="gap:7px;margin-top:14px">' +
          TARIFFS.map(function (t) {
            const n = ECO_QUESTIONS.filter(function (q) {
              return q.marks === t &&
                (paperFilter === "all" || String(q.paper) === paperFilter) &&
                (yearFilter === "all" || String(q.year) === yearFilter);
            }).length;
            return '<button class="btn btn-sm' + (t === tariff ? " btn-primary" : "") +
              (n ? "" : " is-empty") + '" data-action="pack-tariff" data-val="' + t + '">' +
              t + ' mark <span class="faint">(' + n + ')</span></button>';
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
        : UI.empty("✎", "Nothing matches", "Try another tariff, paper or year.")) +

      (focused ? focusHtml(focused) : "");

    document.body.classList.toggle("has-focus", !!focused);
    /* the divider only exists once the markup is in the document */
    setTimeout(mountSplit, 0);
  }

  /* The divider between the case study and the question.

     Dragged, it hands width from one side to the other. Clicked without
     moving, it folds the case study away — so the same knob does both, and
     a click is told from a drag by whether the pointer actually travelled. */
  const MIN_CASE = 220;
  function mountSplit() {
    const bar = document.querySelector("[data-split]");
    if (!bar || bar.dataset.wired === "1") return;
    bar.dataset.wired = "1";

    const body = document.querySelector(".qcase-body");
    const shell = document.querySelector(".qfocus-shell");
    const knob = bar.querySelector(".qsplit-knob");
    if (!body || !shell) return;

    let dragging = false, startX = 0, startW = 0, moved = 0;

    bar.addEventListener("pointerdown", function (e) {
      dragging = true; moved = 0;
      startX = e.clientX;
      startW = body.getBoundingClientRect().width;
      bar.classList.add("dragging");
      try { bar.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    bar.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      /* Leave the question a workable column whatever happens. The tab and
         the divider sit between them and take their own width, so they come
         off the budget too. */
      const chrome = 44 + 16;
      const max = Math.max(MIN_CASE, shell.getBoundingClientRect().width - 400 - chrome);
      const want = Math.round(Math.min(max, Math.max(MIN_CASE, startW + dx)));
      /* Point the arrow the way you are actually pulling — and only when the
         edge really moves, so it does not flip about once you hit a stop. */
      if (knob && want !== caseWidth) knob.textContent = want > caseWidth ? "›" : "‹";
      caseWidth = want;
      body.style.width = caseWidth + "px";
    });

    const finish = function (e) {
      if (!dragging) return;
      dragging = false;
      bar.classList.remove("dragging");
      if (knob) knob.textContent = "‹";     // back to the resting direction
      if (moved < 4) { caseOpen = false; App.render(); }
    };
    bar.addEventListener("pointerup", finish);
    bar.addEventListener("pointercancel", finish);
  }

  function handle(action, el) {
    switch (action) {
      case "pack-tariff": tariff = +el.dataset.val; App.render(); return true;
      case "pack-paper":  paperFilter = el.dataset.val; App.render(); return true;
      case "pack-year":   yearFilter = el.dataset.val; App.render(); return true;
      case "pack-open":   focusId = el.dataset.id; caseOpen = false; caseWidth = null; App.render(); return true;
      case "pack-keep": return true;            // a click inside the card
      case "pack-close": focusId = null; App.render(); return true;
      case "pack-case":   caseOpen = !caseOpen; App.render(); return true;
      case "pack-reveal": revealed[el.dataset.id] = true; App.render(); return true;
      case "pack-hide":   delete revealed[el.dataset.id]; App.render(); return true;
      case "pack-time": {
        const q = byId(el.dataset.id);
        if (q) App.startQuestionTimer(q);
        return true;
      }
    }
    return false;
  }

  return { render: render, handle: handle, minutesFor: minutesFor };
})();
