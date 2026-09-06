/* ============================================================
   Practice Test

   Four screens, one at a time, because a test has four states
   and showing two of them at once is how you end up reading the
   mark scheme while you are still answering.

     build    what you want: length, tariffs, topics
     preview  the paper it made, before the clock starts
     sitting  one question at a time, with the paper's clock
     results  the total, and which chapters lost it for you

   The navigator down the side is the thing the whole screen is
   built around: one chip a question, ticked green as you mark
   it, coloured by how you scored. It is the answer to "how am I
   doing" without leaving the question you are on.
   ============================================================ */

const PracticeView = (function () {

  let idx = 0;                 // which question is open while sitting
  let revealed = {};           // keys whose mark scheme is showing
  let caseOpen = {};           // keys whose case study is expanded
  let resultId = null;         // a finished test being read
  let chaptersOpen = false;    // the chapter picker in the builder
  let picked = { tariffs: {}, chapters: {}, group: "all", year: "all",
                 mode: "marks", marks: 50, count: 6, weakFirst: true, unseenOnly: false };

  /* ------------------------------------------------------------
     shared bits
     ------------------------------------------------------------ */

  function tone(pct) { return pct == null ? "" : pct < 50 ? "red" : pct < 65 ? "amber" : "green"; }
  function daysAgo(iso) { return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)); }

  function tariffsAvailable() {
    const seen = {};
    PracticeTest.pool().forEach(function (m) { seen[m.marks] = (seen[m.marks] || 0) + 1; });
    return Object.keys(seen).map(Number).sort(function (a, b) { return a - b; })
      .map(function (m) { return { marks: m, n: seen[m] }; });
  }

  function groupsAvailable() {
    const seen = {};
    PracticeTest.pool().forEach(function (m) { if (m.group) seen[m.group] = true; });
    return Object.keys(seen);
  }

  function chaptersAvailable() {
    const seen = {};
    PracticeTest.pool().forEach(function (m) { if (m.cid) seen[m.cid] = (seen[m.cid] || 0) + 1; });
    return Object.keys(seen).map(function (cid) {
      const inf = CHAPTER_INDEX[cid];
      const eff = Metrics.effectiveRag(cid);
      return { cid: cid, n: seen[cid], name: inf ? inf.chapter.name : cid,
               label: inf ? inf.chapterLabel : "", rag: eff ? eff.rag : null };
    }).sort(function (a, b) { return String(a.label).localeCompare(String(b.label)); });
  }

  function currentOpts() {
    const tariffs = Object.keys(picked.tariffs).filter(function (k) { return picked.tariffs[k]; }).map(Number);
    const chapters = Object.keys(picked.chapters).filter(function (k) { return picked.chapters[k]; });
    return {
      tariffs: tariffs, chapters: chapters,
      group: picked.group, year: picked.year,
      weakFirst: picked.weakFirst, unseenOnly: picked.unseenOnly,
      marks: picked.mode === "marks" ? +picked.marks || 0 : 0,
      count: picked.mode === "count" ? +picked.count || 0 : 0
    };
  }

  /* ------------------------------------------------------------
     1. the builder
     ------------------------------------------------------------ */

  const PRESETS = [
    { id: "quick",  label: "Quick 25",    sub: "half an hour",   marks: 25 },
    { id: "half",   label: "Half paper",  sub: "50 marks, 1 hr", marks: 50 },
    { id: "full",   label: "Full paper",  sub: "100 marks, 2 hr", marks: 100 },
    { id: "weak",   label: "Weak spots",  sub: "40 marks, worst first", marks: 40, weak: true }
  ];

  function builder() {
    const avail = PracticeTest.eligible(currentOpts());
    const availMarks = avail.reduce(function (a, m) { return a + m.marks; }, 0);
    const groups = groupsAvailable();
    const subj = Subjects.current();

    return '<div class="card">' +
        '<div class="card-head"><div class="card-title">Build a practice test</div>' +
          '<div class="right"><span class="tiny faint">' + PracticeTest.pool().length +
            ' questions in the bank</span></div></div>' +
        '<div class="tiny muted">A set number of questions, one clock across all of them, and a total at ' +
          'the end. Questions are weighted towards what you are weak at and what you have never done, ' +
          'and spread across chapters so a long test is not one topic four times.</div>' +

        '<div class="pt-presets">' + PRESETS.map(function (p) {
          return '<button class="pt-preset" data-action="pt-preset" data-id="' + p.id + '">' +
            '<b>' + p.label + '</b><small>' + p.sub + '</small></button>';
        }).join("") + '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-title" style="margin-bottom:12px">Or set it yourself</div>' +

        '<div class="pt-len">' +
          '<button class="pt-seg' + (picked.mode === "marks" ? " on" : "") + '" data-action="pt-mode" data-val="marks">By total marks</button>' +
          '<button class="pt-seg' + (picked.mode === "count" ? " on" : "") + '" data-action="pt-mode" data-val="count">By question count</button>' +
        '</div>' +
        (picked.mode === "marks"
          ? '<div class="row wrap" style="gap:8px;align-items:flex-end;margin-top:10px">' +
              '<div class="field" style="width:150px;margin:0"><label class="label">Total marks</label>' +
                '<input class="input" id="ptMarks" type="number" min="5" step="5" value="' + UI.esc(picked.marks) + '"></div>' +
              '<span class="pill acc">' + Metrics.fmtMins(PracticeTest.minutesFor(+picked.marks || 0)) + ' at 1.2 min a mark</span>' +
            '</div>'
          : '<div class="row wrap" style="gap:8px;align-items:flex-end;margin-top:10px">' +
              '<div class="field" style="width:150px;margin:0"><label class="label">How many questions</label>' +
                '<input class="input" id="ptCount" type="number" min="1" value="' + UI.esc(picked.count) + '"></div>' +
              '<span class="tiny faint">However many marks that comes to.</span>' +
            '</div>') +

        '<div class="section-label" style="margin:18px 0 8px">Tariffs</div>' +
        '<div class="row wrap" style="gap:7px">' +
          tariffsAvailable().map(function (t) {
            return '<button class="chip' + (picked.tariffs[t.marks] ? " on" : "") + '" ' +
              'data-action="pt-tariff" data-val="' + t.marks + '">' + t.marks + ' mark ' +
              '<span class="faint">(' + t.n + ')</span></button>';
          }).join("") +
        '</div>' +
        '<div class="tiny faint" style="margin-top:6px">Pick none and every tariff is in play.</div>' +

        (groups.length > 1
          ? '<div class="section-label" style="margin:18px 0 8px">' + UI.esc(subj.papersLabel || "Papers") + '</div>' +
            '<div class="row wrap" style="gap:7px">' +
              '<button class="chip' + (picked.group === "all" ? " on" : "") + '" data-action="pt-group" data-val="all">All</button>' +
              groups.map(function (g) {
                return '<button class="chip' + (picked.group === g ? " on" : "") + '" ' +
                  'data-action="pt-group" data-val="' + UI.esc(g) + '">' + UI.esc(g) + '</button>';
              }).join("") +
            '</div>'
          : "") +

        '<div class="section-label" style="margin:18px 0 8px">Year</div>' +
        '<div class="row wrap" style="gap:7px">' +
          [["all", "Both years"], ["1", "Year 1"], ["2", "Year 2"]].map(function (y) {
            return '<button class="chip' + (picked.year === y[0] ? " on" : "") + '" ' +
              'data-action="pt-year" data-val="' + y[0] + '">' + y[1] + '</button>';
          }).join("") +
        '</div>' +

        '<div class="section-label" style="margin:18px 0 8px">Chapters</div>' +
        '<button class="btn btn-sm" data-action="pt-chapters">' +
          (chaptersOpen ? "Hide the list" : "Choose chapters") +
          (Object.keys(picked.chapters).filter(function (k) { return picked.chapters[k]; }).length
            ? " (" + Object.keys(picked.chapters).filter(function (k) { return picked.chapters[k]; }).length + " picked)"
            : " — all of them") + '</button>' +
        (chaptersOpen ? chapterPicker() : "") +

        '<div class="section-label" style="margin:18px 0 8px">How it picks</div>' +
        '<div class="row wrap" style="gap:7px">' +
          '<button class="chip' + (picked.weakFirst ? " on" : "") + '" data-action="pt-weak">' +
            'Lean on my weak topics</button>' +
          '<button class="chip' + (picked.unseenOnly ? " on" : "") + '" data-action="pt-unseen">' +
            'Only ones I have never done</button>' +
        '</div>' +

        '<div class="pt-avail">' +
          '<b>' + avail.length + '</b> question' + (avail.length === 1 ? "" : "s") +
          ' match, worth <b>' + availMarks + '</b> marks in total' +
        '</div>' +

        '<button class="btn btn-primary btn-block" style="margin-top:14px" data-action="pt-generate">' +
          'Generate the test</button>' +
        (avail.length ? "" :
          '<div class="tiny faint" style="text-align:center;margin-top:8px">Nothing matches those filters yet.</div>') +
      '</div>';
  }

  function chapterPicker() {
    const list = chaptersAvailable();
    return '<div class="pt-chaps">' +
      '<div class="row wrap" style="gap:7px;margin-bottom:9px">' +
        '<button class="btn btn-sm" data-action="pt-chap-none">Clear</button>' +
        '<button class="btn btn-sm" data-action="pt-chap-weak">Just my red and amber ones</button>' +
      '</div>' +
      list.map(function (c) {
        const on = !!picked.chapters[c.cid];
        return '<button class="pt-chap' + (on ? " on" : "") + '" data-action="pt-chap" data-id="' + c.cid + '">' +
          UI.ragDot(c.rag) +
          '<span class="pt-chap-name"><b>' + UI.esc(c.label || c.name) + '</b>' +
            (c.label ? '<small>' + UI.esc(c.name) + '</small>' : "") + '</span>' +
          '<span class="pill">' + c.n + '</span>' +
        '</button>';
      }).join("") +
    '</div>';
  }

  /* ------------------------------------------------------------
     2. the paper, before you start it
     ------------------------------------------------------------ */

  function preview(t) {
    const marks = t.items.reduce(function (a, it) { return a + it.marks; }, 0);
    return '<div class="card pt-paper-head">' +
        '<div class="card-head"><div class="card-title">' + UI.esc(t.name) + '</div>' +
          '<div class="right"><span class="pill acc">not started</span></div></div>' +
        '<div class="row wrap" style="gap:8px;margin-top:4px">' +
          '<span class="pill">' + t.items.length + ' questions</span>' +
          '<span class="pill">' + marks + ' marks</span>' +
          '<span class="pill">' + Metrics.fmtMins(t.targetMins) + ' allowed</span>' +
        '</div>' +
        '<div class="tiny muted" style="margin-top:10px">Look it over first. Swap anything you did ' +
          'yesterday, drop anything you do not want. The clock starts when you press start, and it ' +
          'runs across the whole paper — not one question at a time.</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:14px">' +
          '<button class="btn btn-primary" data-action="pt-start" data-id="' + t.id + '">Start the test</button>' +
          '<button class="btn" data-action="pt-regen" data-id="' + t.id + '">Build a different one</button>' +
          '<div class="spacer"></div>' +
          '<button class="btn btn-ghost" data-action="pt-discard" data-id="' + t.id + '">Discard</button>' +
        '</div>' +
      '</div>' +

      '<div class="stack">' + t.items.map(function (it, i) {
        const m = PracticeTest.meta(it.key);
        const last = PracticeTest.lastAttempt(it.key);
        const inf = it.cid ? CHAPTER_INDEX[it.cid] : null;
        return '<div class="pt-row">' +
          '<span class="pt-num">' + (i + 1) + '</span>' +
          '<span class="pt-marks">' + it.marks + '</span>' +
          '<span class="pt-main">' +
            '<b>' + UI.esc(m ? m.label : it.key) + '</b>' +
            '<small>' + UI.esc(m ? m.where : (inf ? inf.chapter.name : "")) + '</small>' +
          '</span>' +
          (last
            ? '<span class="pill ' + tone(last.avail ? Math.round(last.got / last.avail * 100) : null) + '">' +
                'done ' + (daysAgo(last.at) === 0 ? "today" : daysAgo(last.at) + "d ago") + '</span>'
            : '<span class="pill good">new to you</span>') +
          '<button class="icon-btn" data-action="pt-swap" data-id="' + t.id + '" data-key="' + UI.esc(it.key) +
            '" title="Swap for another of the same tariff">⟳</button>' +
          '<button class="icon-btn" data-action="pt-drop" data-id="' + t.id + '" data-key="' + UI.esc(it.key) +
            '" title="Take it out">✕</button>' +
        '</div>';
      }).join("") + '</div>';
  }

  /* ------------------------------------------------------------
     3. sitting the test
     ------------------------------------------------------------ */

  function navigator(t) {
    return '<div class="pt-nav">' + t.items.map(function (it, i) {
      const s = PracticeTest.scoreOf(t, it.key);
      const pct = s ? Math.round(s.got / it.marks * 100) : null;
      return '<button class="pt-chip' + (i === idx ? " on" : "") + (s ? " done " + tone(pct) : "") + '" ' +
        'data-action="pt-goto" data-n="' + i + '" title="Question ' + (i + 1) + ', ' + it.marks + ' marks">' +
        '<span class="pt-chip-strip"></span>' +
        '<b>' + (i + 1) + '</b>' +
        '<small>' + (s ? s.got + "/" + it.marks : it.marks + "m") + '</small>' +
        (s ? '<span class="pt-tick">✓</span>' : "") +
      '</button>';
    }).join("") + '</div>';
  }

  function sitting(t) {
    /* Clamped rather than read raw: a test opened while the position from a
       previous one is still in hand would otherwise say "Question 2 of 1". */
    idx = Math.max(0, Math.min(idx, t.items.length - 1));
    const it = t.items[idx];
    const tot = PracticeTest.totals(t);
    const q = PracticeTest.question(it.key);
    const m = PracticeTest.meta(it.key);
    const inf = it.cid ? CHAPTER_INDEX[it.cid] : null;
    const show = !!revealed[it.key];
    const s = PracticeTest.scoreOf(t, it.key);

    return '<div class="card pt-bar">' +
        '<div class="row wrap" style="gap:12px;align-items:center">' +
          '<div style="flex:1;min-width:200px">' +
            '<b>' + UI.esc(t.name) + '</b>' +
            '<div class="tiny muted">Question ' + (idx + 1) + ' of ' + t.items.length +
              ' · ' + tot.avail + ' marks · ' + Metrics.fmtMins(t.targetMins) + ' allowed</div>' +
          '</div>' +
          '<span class="pt-running ' + tone(tot.pct) + '">' +
            '<b>' + tot.got + '/' + tot.avail + '</b>' +
            '<small>' + tot.done + ' of ' + tot.total + ' marked</small></span>' +
          '<button class="btn' + (tot.done ? " btn-primary" : "") + '" data-action="pt-finish" data-id="' + t.id + '">' +
            'Finish and mark</button>' +
        '</div>' +
        navigator(t) +
      '</div>' +

      '<div class="card pt-q">' +
        '<div class="pt-q-head">' +
          '<span class="pt-marks big">' + it.marks + '</span>' +
          '<div style="flex:1;min-width:0">' +
            '<b>' + UI.esc(m ? m.label : "Question " + (idx + 1)) + '</b>' +
            '<div class="tiny faint">' +
              UI.esc(inf ? inf.chapter.name + (m && m.where !== inf.chapter.name ? " · " + m.where : "")
                         : (m ? m.where : "")) + '</div>' +
          '</div>' +
          '<span class="pill">' + PracticeTest.minutesFor(it.marks) + ' min worth</span>' +
        '</div>' +
        (q ? questionBody(it, q, show)
           : '<div class="warnbox"><b>This question is no longer in the bank</b>' +
             'Skip it, or drop it and build a new test.</div>') +
        scoreRow(t, it, show, s) +
        '<div class="pt-move">' +
          '<button class="btn" data-action="pt-prev"' + (idx === 0 ? " disabled" : "") + '>‹ Previous</button>' +
          '<div class="spacer"></div>' +
          '<button class="btn" data-action="pt-next"' + (idx >= t.items.length - 1 ? " disabled" : "") + '>Next ›</button>' +
        '</div>' +
      '</div>';
  }

  /* Economics questions carry their case study, figures and mark-scheme
     grids; Maths ones carry a sketch. Both renderers already exist, so this
     picks between them rather than growing a third. */
  function questionBody(it, q, show) {
    if (PracticeTest.kindOf(it.key) === "eco") {
      const cs = typeof PacksView !== "undefined" ? PacksView.caseFor(q) : null;
      const g = typeof PacksView !== "undefined" ? PacksView.guideFor(q.marks) : null;
      const er = show && typeof PacksView !== "undefined" ? PacksView.reportFor(q) : null;
      const open = !!caseOpen[it.key];
      return (cs
          ? '<div class="pt-case' + (open ? " open" : "") + '">' +
              '<button class="pt-case-tab" data-action="pt-case" data-key="' + UI.esc(it.key) + '">' +
                '<b>Case study</b><small>' + (open ? "click to fold it away" : "click to open the extracts and figures") + '</small>' +
                '<span>' + (open ? "▾" : "▸") + '</span>' +
              '</button>' +
              (open ? '<div class="pt-case-body">' + PacksView.caseHtml(cs, q.caseKey) + '</div>' : "") +
            '</div>'
          : "") +
        '<div class="qtext">' + PacksView.questionHtml(q.text, q.id) + '</div>' +
        (g ? '<div class="qfocus-guide"><b>' + UI.esc(g.name) + '</b>' +
             '<span class="pill acc">' + UI.esc(g.split) + '</span><p>' + UI.esc(g.how) + '</p></div>' : "") +
        (show
          ? PacksView.diagramBlock(q) +
            (q.ms ? '<div class="section-label" style="margin:18px 0 8px">Mark scheme</div>' +
                    PacksView.msSheet(q.ms, q.id)
                  : '<div class="tiny faint">No mark scheme was found for this one.</div>') +
            (er ? UI.examinerReport(er, { series: q.series, paper: q.paper,
                                          question: q.q + (q.part ? "(" + q.part + ")" : "") }) : "")
          : revealButton(it));
    }

    if (PracticeTest.kindOf(it.key) === "mex") return examBody(it, q, show);

    return '<div class="qtext">' + UI.math(q.q) + '</div>' +
      (q.img ? '<img class="qz-img" src="' + UI.esc(q.img) + '" alt="Question">' : "") +
      (show
        ? '<div class="qz-ms" style="margin-top:16px">' +
            '<div class="qz-ms-h">' + UI.icon("check") + 'Mark scheme</div>' +
            UI.markScheme(q.ms) +
            (q.sketch && typeof SKETCH !== "undefined" && SKETCH.has(q.sketch)
              ? '<div class="qz-sketch">' + SKETCH.render(q.sketch) +
                '<div class="tiny faint">What the sketch should look like.</div></div>'
              : "") +
          '</div>'
        : revealButton(it));
  }

  /* A real exam question.

     The page is the question. Text extraction cannot carry a diagram, a
     fraction or a subsetted font, so telling you to go and look at the paper
     was never an answer — the paper is right there. The question's own pages
     are rendered out of the PDF, cropped to that question rather than the
     whole document, and the extracted text is shown alongside only when it
     came through clean enough to be worth reading. */
  function examBody(it, q, show) {
    const set = typeof EXAM_SETS !== "undefined" ? EXAM_SETS[q.set] : null;
    const qUrl = typeof examSetPath === "function" ? examSetPath(q.set, "q") : null;
    const msUrl = typeof examSetPath === "function" ? examSetPath(q.set, "ms") : null;
    const clean = !(q.flags || []).length;

    return (qUrl
        ? '<div class="pt-paper" data-pdf-src="' + qUrl + '" data-pdf-from="' + q.pageFrom +
          '" data-pdf-to="' + q.pageTo + '"></div>'
        : '<div class="qtext">' + UI.math(q.text) + '</div>') +

      /* Where the text survived, it is worth having: it reflows on a phone
         and it is what search looks through. Where it did not, printing it
         under the real question would only invite you to read the wrong
         thing. */
      (clean && qUrl
        ? '<details class="pt-astext"><summary>Show it as text</summary>' +
            '<div class="qtext">' + UI.math(q.text) + '</div></details>'
        : "") +

      (show
        ? '<div class="qz-ms" style="margin-top:16px">' +
            '<div class="qz-ms-h">' + UI.icon("check") + 'Mark scheme' +
              (q.msCheck === "unverifiable"
                ? '<span class="pill" title="Placed by its position in the scheme, which runs in the same order as the questions. This is an older scheme that prints no totals, so there was nothing to check it against.">placed by order</span>'
                : "") +
            '</div>' +
            (msUrl && q.msFrom
              ? '<div class="pt-paper" data-pdf-src="' + msUrl + '" data-pdf-from="' + q.msFrom +
                '" data-pdf-to="' + q.msTo + '"></div>'
              : msUrl
                ? '<div class="tiny muted" style="padding:0 2px 10px">This one could not be placed in ' +
                    'the scheme, so here is the whole ' + UI.esc(set ? set.name : q.topic) + ' document. ' +
                    'Look for <b>question ' + q.num + '</b> — these are compilations, so the ' +
                    'numbering is the source paper’s.</div>' +
                  '<div class="pdf-frame" style="height:min(62vh,720px)">' +
                    '<div class="pdfv" data-src="' + msUrl + '"></div></div>'
                : '<div class="tiny faint">No mark scheme found for this set.</div>') +
          '</div>'
        : revealButton(it));
  }

  function revealButton(it) {
    return '<button class="btn btn-primary btn-block" style="margin-top:18px" ' +
        'data-action="pt-reveal" data-key="' + UI.esc(it.key) + '">Reveal the mark scheme</button>' +
      '<div class="tiny faint" style="text-align:center;margin-top:8px">' +
        'Write the whole answer first — ' + PracticeTest.minutesFor(it.marks) + ' minutes is what it is worth.</div>';
  }

  /* The score box only appears once the mark scheme is showing. Marking
     yourself before you have read it is not marking. */
  function scoreRow(t, it, show, s) {
    if (!show) return "";
    return '<div class="qscore">' +
      '<label>Marks</label>' +
      '<input class="input" id="ptScore" type="number" min="0" max="' + it.marks + '" ' +
        'placeholder="out of ' + it.marks + '" value="' + (s ? s.got : "") + '">' +
      '<button class="btn btn-primary" data-action="pt-score" data-id="' + t.id + '" data-key="' +
        UI.esc(it.key) + '">' + (s ? "Update" : "Save and next") + '</button>' +
    '</div>';
  }

  /* ------------------------------------------------------------
     4. results
     ------------------------------------------------------------ */

  function results(t) {
    const tot = PracticeTest.totals(t);
    const chapters = PracticeTest.byChapter(t);
    const gd = tot.fullPct != null ? Metrics.gradeDetail(tot.fullPct, tot.avail) : null;
    const over = t.minutesTaken && t.minutesTaken > t.targetMins;
    const worst = chapters.filter(function (c) { return c.pct != null && c.pct < 65 && CHAPTER_INDEX[c.cid]; });

    return '<div class="card">' +
        '<div class="card-head"><div class="card-title">' + UI.esc(t.name) + '</div>' +
          '<div class="right"><span class="tiny faint">' +
            UI.esc(new Date(t.finishedAt).toLocaleDateString()) + '</span></div></div>' +

        '<div class="score-strip" style="margin-top:6px">' +
          '<div class="score-box"><b>' + tot.avail + '</b><small>marks available</small></div>' +
          '<div class="score-box"><b>' + tot.got + '</b><small>marks achieved</small></div>' +
          '<div class="score-box big"><b>' + (tot.fullPct != null ? tot.fullPct + "%" : "—") + '</b><small>score</small></div>' +
          (gd ? '<div class="score-box big grade grade-' + gd.grade.toLowerCase().replace("*", "star") + '">' +
                '<b>' + gd.grade + '</b><small>grade</small></div>' : "") +
        '</div>' +
        (gd && gd.next && gd.marksOff
          ? '<div class="tiny faint" style="margin-top:8px">' + gd.marksOff + ' more mark' +
            (gd.marksOff === 1 ? "" : "s") + ' would have been ' +
            (gd.next === "A" || gd.next === "E" ? "an " : "a ") + gd.next + '</div>'
          : "") +
        (tot.done < tot.total
          ? '<div class="tiny faint" style="margin-top:8px">' + (tot.total - tot.done) +
            ' question' + (tot.total - tot.done === 1 ? " was" : "s were") +
            ' left unmarked and counted as zero.</div>'
          : "") +

        '<div class="row wrap" style="gap:8px;margin-top:14px">' +
          '<span class="pill">' + Metrics.fmtMins(t.targetMins) + ' allowed</span>' +
          (t.minutesTaken
            ? '<span class="pill ' + (over ? "bad" : "good") + '">' + Metrics.fmtMins(t.minutesTaken) + ' taken' +
              (over ? " — " + Metrics.fmtMins(t.minutesTaken - t.targetMins) + " over" : "") + '</span>'
            : "") +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-title" style="margin-bottom:4px">Where the marks went</div>' +
        '<div class="tiny muted">Chapter by chapter, weakest first. This is the part worth acting on — ' +
          'an overall percentage made of one chapter at 30% and another at 90% is not a percentage to ' +
          'do anything about evenly.</div>' +
        '<div class="stack" style="margin-top:14px">' + chapters.map(function (c) {
          return '<div class="pt-break">' +
            '<span class="pt-break-strip ' + tone(c.pct) + '"></span>' +
            '<div style="flex:1;min-width:0">' +
              '<b>' + UI.esc(c.label || c.name) + '</b>' +
              '<div class="tiny faint">' + c.n + ' question' + (c.n === 1 ? "" : "s") + '</div>' +
            '</div>' +
            '<span class="pill ' + tone(c.pct) + '">' + c.got + '/' + c.avail + ' · ' + c.pct + '%</span>' +
            (CHAPTER_INDEX[c.cid]
              ? '<button class="btn btn-sm" data-action="add-today" data-id="' + c.cid + '">Put on today</button>'
              : "") +
          '</div>';
        }).join("") + '</div>' +
        (worst.length
          ? '<div class="warnbox" style="margin-top:14px"><b>What to do next</b>' +
              UI.esc(worst.map(function (c) { return c.name; }).slice(0, 3).join(", ")) +
              ' came out under 65%. Those chapters have been given the score, so the planner has ' +
              'already picked them up — today’s plan will have changed.</div>'
          : '<div class="tiny faint" style="margin-top:14px">Nothing under 65%. The scores have gone ' +
            'to each chapter, so your ratings and plan already reflect this.</div>') +
      '</div>' +

      '<div class="row wrap" style="gap:8px">' +
        '<button class="btn btn-primary" data-action="pt-again">Build another test</button>' +
        '<button class="btn" data-action="pt-history-close">Back to the tests</button>' +
      '</div>';
  }

  /* ------------------------------------------------------------
     history
     ------------------------------------------------------------ */

  function history() {
    const list = PracticeTest.history();
    if (!list.length) return "";
    return '<div class="card">' +
      '<div class="card-title" style="margin-bottom:12px">Tests you have sat</div>' +
      '<div class="stack">' + list.map(function (t) {
        const tot = PracticeTest.totals(t);
        return '<button class="pt-hist" data-action="pt-open" data-id="' + t.id + '">' +
          '<span class="pt-break-strip ' + tone(tot.fullPct) + '"></span>' +
          '<span style="flex:1;min-width:0;text-align:left">' +
            '<b>' + UI.esc(t.name) + '</b>' +
            '<small>' + UI.esc(new Date(t.finishedAt).toLocaleDateString()) + ' · ' +
              t.items.length + ' questions' +
              (t.minutesTaken ? ' · ' + Metrics.fmtMins(t.minutesTaken) : "") + '</small>' +
          '</span>' +
          '<span class="pill ' + tone(tot.fullPct) + '">' + tot.got + '/' + tot.avail +
            ' · ' + (tot.fullPct != null ? tot.fullPct + "%" : "—") + '</span>' +
        '</button>';
      }).join("") + '</div></div>';
  }

  /* ------------------------------------------------------------
     render
     ------------------------------------------------------------ */

  function render(root) {
    if (!PracticeTest.supported()) {
      root.innerHTML = UI.empty("⏱", "No question bank for this subject",
        "Practice tests are built from a bank of marked questions. " +
        Subjects.current().short + " does not have one yet.");
      return;
    }

    if (resultId) {
      const done = PracticeTest.get(resultId);
      if (done && done.finishedAt) { root.innerHTML = results(done); return; }
      resultId = null;
    }

    const t = PracticeTest.live();
    if (t && t.startedAt) { root.innerHTML = sitting(t); mountPages(); return; }
    if (t) { root.innerHTML = preview(t); return; }

    root.innerHTML = builder() + history();
  }

  /* The printed question is a page range out of the topic PDF, which is a
     different job from showing a whole document and has its own renderer. */
  function mountPages() {
    if (typeof PdfViewer === "undefined") return;
    setTimeout(function () {
      document.querySelectorAll("[data-pdf-src]").forEach(function (host) {
        PdfViewer.renderPages(host, host.dataset.pdfSrc,
                              +host.dataset.pdfFrom, +host.dataset.pdfTo);
      });
    }, 0);
  }

  /* ------------------------------------------------------------
     actions
     ------------------------------------------------------------ */

  function readInputs() {
    const m = document.getElementById("ptMarks");
    const c = document.getElementById("ptCount");
    if (m && m.value !== "") picked.marks = +m.value;
    if (c && c.value !== "") picked.count = +c.value;
  }

  function generate(opts) {
    const chosen = PracticeTest.choose(opts);
    if (!chosen.length) { UI.toast("Nothing matches those filters", "bad"); return; }
    const id = PracticeTest.create(chosen, opts);
    if (!id) { UI.toast("Could not build that test", "bad"); return; }
    idx = 0; revealed = {}; caseOpen = {}; resultId = null;
    App.render();
  }

  function handle(action, el) {
    switch (action) {

      /* ---- builder ---- */
      case "pt-preset": {
        const p = PRESETS.filter(function (x) { return x.id === el.dataset.id; })[0];
        if (!p) return true;
        generate(Object.assign(currentOpts(), {
          marks: p.marks, count: 0, weakFirst: p.weak ? true : picked.weakFirst
        }));
        return true;
      }
      case "pt-mode": readInputs(); picked.mode = el.dataset.val; App.render(); return true;
      case "pt-tariff": {
        readInputs();
        const v = +el.dataset.val;
        picked.tariffs[v] = !picked.tariffs[v];
        App.render(); return true;
      }
      case "pt-group": readInputs(); picked.group = el.dataset.val; App.render(); return true;
      case "pt-year": readInputs(); picked.year = el.dataset.val; App.render(); return true;
      case "pt-weak": readInputs(); picked.weakFirst = !picked.weakFirst; App.render(); return true;
      case "pt-unseen": readInputs(); picked.unseenOnly = !picked.unseenOnly; App.render(); return true;
      case "pt-chapters": readInputs(); chaptersOpen = !chaptersOpen; App.render(); return true;
      case "pt-chap": {
        readInputs();
        const cid = el.dataset.id;
        picked.chapters[cid] = !picked.chapters[cid];
        App.render(); return true;
      }
      case "pt-chap-none": readInputs(); picked.chapters = {}; App.render(); return true;
      case "pt-chap-weak": {
        readInputs();
        picked.chapters = {};
        chaptersAvailable().forEach(function (c) {
          if (c.rag === "red" || c.rag === "amber" || c.rag === "new") picked.chapters[c.cid] = true;
        });
        if (!Object.keys(picked.chapters).length) UI.toast("Nothing is rated red or amber yet", "warn");
        App.render(); return true;
      }
      case "pt-generate": readInputs(); generate(currentOpts()); return true;

      /* ---- the paper ---- */
      case "pt-swap": {
        if (!PracticeTest.swap(el.dataset.id, el.dataset.key))
          UI.toast("No other question of that tariff is left to swap in", "warn");
        App.render(); return true;
      }
      case "pt-drop": {
        if (!PracticeTest.drop(el.dataset.id, el.dataset.key))
          UI.toast("A test needs at least one question", "warn");
        App.render(); return true;
      }
      case "pt-regen": {
        const t = PracticeTest.get(el.dataset.id);
        const opts = t ? t.opts : currentOpts();
        PracticeTest.discard(el.dataset.id);
        generate(opts);
        return true;
      }
      case "pt-discard": {
        const id = el.dataset.id;
        UI.confirm("Discard this test?", "The questions go back in the pool. Nothing you have already " +
          "marked is lost.", "Discard", true).then(function (ok) {
            if (!ok) return;
            PracticeTest.discard(id);
            App.render();
          });
        return true;
      }
      case "pt-start": {
        PracticeTest.start(el.dataset.id);
        idx = 0; revealed = {};
        UI.toast("Clock started. Countdown is on the right.", "ok", 4000);
        App.render(); return true;
      }

      /* ---- sitting it ---- */
      case "pt-goto": idx = +el.dataset.n; App.render(); return true;
      case "pt-prev": idx = Math.max(0, idx - 1); App.render(); return true;
      case "pt-next": {
        const t = PracticeTest.live();
        idx = Math.min((t ? t.items.length : 1) - 1, idx + 1);
        App.render(); return true;
      }
      case "pt-case": {
        const k = el.dataset.key;
        caseOpen[k] = !caseOpen[k];
        App.render(); return true;
      }
      case "pt-reveal": {
        revealed[el.dataset.key] = true;
        App.render(); return true;
      }
      case "pt-score": {
        const t = PracticeTest.get(el.dataset.id);
        const key = el.dataset.key;
        const item = t ? t.items.filter(function (x) { return x.key === key; })[0] : null;
        const input = document.getElementById("ptScore");
        const got = input ? Number(input.value) : NaN;
        if (!item || !Number.isFinite(got) || got < 0 || got > item.marks) {
          UI.toast("Enter a score between 0 and " + (item ? item.marks : "the marks available"), "bad");
          return true;
        }
        PracticeTest.score(t.id, key, got);
        UI.toast("Saved " + got + " / " + item.marks, got / item.marks >= 0.65 ? "ok" : "warn", 2200);
        /* straight on to the next one you have not marked, so a test flows */
        const next = t.items.map(function (x, i) { return { x: x, i: i }; })
          .filter(function (r) { return !PracticeTest.scoreOf(t, r.x.key); })[0];
        if (next) idx = next.i;
        App.render(); return true;
      }
      case "pt-finish": {
        const id = el.dataset.id;
        const t = PracticeTest.get(id);
        if (!t) return true;
        const tot = PracticeTest.totals(t);
        const left = tot.total - tot.done;
        UI.confirm("Finish and mark this test?",
          (left ? left + " question" + (left === 1 ? " is" : "s are") + " still unmarked and will count as zero. " : "") +
          "The score goes to every chapter the test touched, so your ratings and tomorrow's plan will change.",
          "Finish it", false).then(function (ok) {
            if (!ok) return;
            PracticeTest.finish(id);
            resultId = id;
            App.render();
          });
        return true;
      }

      /* ---- results and history ---- */
      case "pt-open": resultId = el.dataset.id; App.render(); return true;
      case "pt-history-close": resultId = null; App.render(); return true;
      case "pt-again": resultId = null; App.render(); return true;
    }
    return false;
  }

  return { render: render, handle: handle };
})();
