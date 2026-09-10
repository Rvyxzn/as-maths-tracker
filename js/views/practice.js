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
  let hinted = {};             // keys whose hint has been asked for
  let msOpen = {};             // keys whose scheme is unfolded on the results page
  let msAllOpen = false;
  let resultId = null;         // a finished test being read
  let chaptersOpen = false;    // the chapter picker in the builder
  let picked = { tariffs: {}, chapters: {}, group: "all", year: "all",
                 mode: "marks", marks: 50, count: 6, weakFirst: true, unseenOnly: false,
                 includeBank: false };

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

  /* Every chapter that has a question of any kind, counted per chapter the
     question covers rather than per question. Built from the full pool, bank
     included, so a chapter with no exam questions of its own is still on the
     list and still pickable — it just says what it would give you. */
  function chaptersAvailable() {
    const exam = {}, bank = {};
    PracticeTest.pool(true).forEach(function (m) {
      /* The paper and year chips above the list are filters on the whole
         build, so the chapter list obeys them too: picking Year 1 and then
         scrolling past forty chapters that Year 1 cannot use is not a list,
         it is a haystack. */
      if (picked.group !== "all" && m.group !== picked.group) return;
      if (picked.year !== "all" && m.year != null && String(m.year) !== String(picked.year)) return;
      const mine = m.cids && m.cids.length ? m.cids : (m.cid ? [m.cid] : []);
      mine.forEach(function (cid) {
        const box = m.source === "bank" ? bank : exam;
        box[cid] = (box[cid] || 0) + 1;
      });
    });
    const all = {};
    Object.keys(exam).forEach(function (c) { all[c] = true; });
    Object.keys(bank).forEach(function (c) { all[c] = true; });
    return Object.keys(all).map(function (cid) {
      const inf = CHAPTER_INDEX[cid];
      const eff = Metrics.effectiveRag(cid);
      return { cid: cid, n: exam[cid] || 0, bank: bank[cid] || 0,
               bankOnly: !exam[cid],
               name: inf ? inf.chapter.name : cid,
               label: inf ? inf.chapterLabel : "", rag: eff ? eff.rag : null };
    /* "Y1 Ch 10" sorts before "Y1 Ch 2" as text, because "1" is less than
       "2", so the chapter list ran 1, 10, 11, 12, 2, 3. Compared with the
       numbers read as numbers it runs the way the book does. */
    }).sort(function (a, b) {
      return String(a.label).localeCompare(String(b.label), undefined,
                                           { numeric: true, sensitivity: "base" });
    });
  }

  /* Picking a chapter that has no exam questions has to bring the bank with
     it, or the chapter is on the list and still gives you nothing. */
  function needsBank() {
    const on = Object.keys(picked.chapters).filter(function (k) { return picked.chapters[k]; });
    if (!on.length) return false;
    const byId = {};
    chaptersAvailable().forEach(function (c) { byId[c.cid] = c; });
    return on.some(function (cid) { return byId[cid] && byId[cid].bankOnly; });
  }

  function currentOpts() {
    const tariffs = Object.keys(picked.tariffs).filter(function (k) { return picked.tariffs[k]; }).map(Number);
    const chapters = Object.keys(picked.chapters).filter(function (k) { return picked.chapters[k]; });
    return {
      tariffs: tariffs, chapters: chapters,
      group: picked.group, year: picked.year,
      weakFirst: picked.weakFirst, unseenOnly: picked.unseenOnly,
      includeBank: picked.includeBank || needsBank(),
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

  /* Why a year filter offers fewer questions than the bank holds.

     The topic PDFs are one file per topic and a topic runs across both
     years, so a third of them cannot be said to belong to one. They used to
     be filed under whichever chapter came first, which is how asking for
     Year 1 Integration served Year 2 work. They are held back now, and
     saying so is the difference between a filter and a mystery. */
  function spanNote() {
    if (picked.year === "all") return "";
    const on = Object.keys(picked.chapters).filter(function (k) { return picked.chapters[k]; });
    if (on.length) {
      return '<div class="tiny faint" style="margin-top:7px">You have picked chapters, so the ' +
        'Year ' + picked.year + ' filter is not also applied: the chapters are the more specific ' +
        'choice.</div>';
    }
    const held = PracticeTest.pool(true).filter(function (m) {
      return m.source === "exam" && m.year == null &&
             (picked.group === "all" || m.group === picked.group);
    }).length;
    if (!held) return "";
    return '<div class="tiny faint" style="margin-top:7px">' + held + ' question' +
      (held === 1 ? " comes" : "s come") + ' from topic sets that cover both years, so ' +
      (held === 1 ? "it is" : "they are") + ' left out while a year is selected. Pick the chapters ' +
      'instead to include ' + (held === 1 ? "it" : "them") + '.</div>';
  }

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
          (Subjects.currentId() === "maths"
            ? '<button class="chip' + (picked.includeBank ? " on" : "") + '" data-action="pt-bank" ' +
              'title="The built-in chapter bank is easier than the real thing. Off by default so a test is exam standard.">' +
              'Include the easy chapter bank</button>'
            : "") +
        '</div>' +

        '<div class="pt-avail">' +
          '<b>' + avail.length + '</b> question' + (avail.length === 1 ? "" : "s") +
          ' match, worth <b>' + availMarks + '</b> marks in total' +
        '</div>' +
        spanNote() +

        '<button class="btn btn-primary btn-block" style="margin-top:14px" data-action="pt-generate">' +
          'Generate the test</button>' +
        (avail.length ? "" :
          '<div class="tiny faint" style="text-align:center;margin-top:8px">Nothing matches those filters yet.</div>') +
      '</div>';
  }

  /* Where to go when this app has run out.

     Every one of these is a real, free, whole-topic source for this
     specification, and they are named rather than linked to a search:
     "look it up" is not a recommendation. Shown only when something in
     the list in front of you is actually short, so it does not sit there
     as permanent clutter. */
  const MORE_QUESTIONS = {
    maths: [
      ["Physics &amp; Maths Tutor", "physicsandmathstutor.com", "Edexcel A level Maths, filed by topic and by paper — the closest thing to more of what is already here."],
      ["Maths Genie", "mathsgenie.co.uk", "A level topic questions with worked video solutions for each one."],
      ["Dr Frost Maths", "drfrostmaths.com", "Free account. Practises a skill until you have it rather than setting whole questions."],
      ["Pearson qualifications", "qualifications.pearson.com", "The real papers and schemes, 9MA0, straight from the exam board."]
    ],
    economics: [
      ["Pearson qualifications", "qualifications.pearson.com", "Every 9EC0 paper and mark scheme, plus the examiner reports."],
      ["EconPlusDal", "youtube.com/@EconplusDal", "Worked 25 markers and the diagrams, which is what the long questions turn on."],
      ["tutor2u", "tutor2u.net/economics", "Topic questions and model answers written to the Edexcel A tariffs."]
    ],
    geography: [
      ["Pearson qualifications", "qualifications.pearson.com", "The 9GE0 papers, schemes and examiner reports."],
      ["A Level Geography (Seneca / PMT)", "physicsandmathstutor.com/geography-revision", "Topic questions and case-study material by unit."]
    ]
  };

  function moreQuestionsNote(list) {
    const thin = list.filter(function (c) { return !c.bankOnly && c.n > 0 && c.n < 8; });
    if (!thin.length) return "";
    const sub = (typeof Subjects !== "undefined" && Subjects.currentId) ? Subjects.currentId() : "maths";
    const where = MORE_QUESTIONS[sub] || MORE_QUESTIONS.maths;
    return '<div class="pt-thin">' +
      '<b>' + thin.length + (thin.length === 1 ? " chapter here has" : " chapters here have") +
        ' fewer than eight questions</b>' +
      '<div class="tiny muted" style="margin:3px 0 8px">' +
        thin.map(function (c) { return UI.esc(c.label || c.name) + " (" + c.n + ")"; }).join(" · ") +
        '. That is everything the PDFs in this folder hold for them, not a ' +
        'filter hiding the rest. To top them up:' +
      '</div>' +
      '<ul class="pt-thin-list">' +
        where.map(function (w) {
          return '<li><b>' + w[0] + '</b> <span class="tiny faint">' + w[1] + '</span>' +
            '<div class="tiny muted">' + w[2] + '</div></li>';
        }).join("") +
      '</ul>' +
      '<div class="tiny faint">Drop new PDFs into <code>Exam questions PDFs</code> and they ' +
        'show up here — the folder is the bank.</div>' +
    '</div>';
  }

  function chapterPicker() {
    const list = chaptersAvailable();
    return '<div class="pt-chaps">' +
      '<div class="row wrap" style="gap:7px;margin-bottom:9px">' +
        '<button class="btn btn-sm" data-action="pt-chap-all">Select all</button>' +
        '<button class="btn btn-sm" data-action="pt-chap-none">Clear</button>' +
        '<button class="btn btn-sm" data-action="pt-chap-weak">Just my red and amber ones</button>' +
      '</div>' +
      list.map(function (c) {
        const on = !!picked.chapters[c.cid];
        return '<button class="pt-chap' + (on ? " on" : "") + '" data-action="pt-chap" data-id="' + c.cid + '">' +
          UI.ragDot(c.rag) +
          '<span class="pt-chap-name"><b>' + UI.esc(c.label || c.name) + '</b>' +
            (c.label ? '<small>' + UI.esc(c.name) + '</small>' : "") + '</span>' +
          (c.bankOnly
            ? '<span class="pill warn" title="No past-paper questions filed under this chapter yet, so picking it uses the built-in bank, which is easier.">bank only · ' + c.bank + '</span>'
            : '<span class="pill">' + c.n + '</span>') +
        '</button>';
      }).join("") +
      moreQuestionsNote(list) +
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

  /* A test saved before the question bank was rebuilt.

     The bank is regenerated from the PDFs by tools/extract-as-maths.js,
     and when it is, the questions renumber: alBinomial-04 is a different
     question than it was. A saved test holds ids, so it still opens, and
     every question in it is real -- it is simply not the paper you were
     given. The tariffs are what give it away, and saying so beats letting
     somebody sit a paper whose marks no longer add up. */
  function staleItems(t) {
    return (t.items || []).filter(function (it) {
      const q = PracticeTest.question(it.key);
      return !q || (q.marks && it.marks && q.marks !== it.marks);
    });
  }

  function staleWarning(t) {
    const n = staleItems(t).length;
    if (!n) return "";
    return '<div class="pt-warn"><div>' +
      '<b>This paper was built against an older question bank</b>' +
      '<div class="tiny">' + n + ' of its ' + t.items.length + ' questions have moved since, so what ' +
        'is on screen is not what it was set at. Build a new one — the bank is bigger now.</div>' +
      '<button class="btn btn-sm" data-action="pt-discard" data-id="' + t.id + '" ' +
        'style="margin-top:8px">Discard this one</button></div></div>';
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

    return staleWarning(t) +
      '<div class="card pt-bar">' +
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
              /* the chapter's own number as well as its name: "1.2 How
                  markets work", the way the specification refers to it */
              UI.esc(inf ? inf.chapterLabel + (m && m.where !== inf.chapter.name ? " · " + m.where : "")
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
          ? (q.ms ? '<div class="section-label" style="margin:18px 0 8px">Mark scheme</div>' +
                    PacksView.msSheet(q.ms, q.id)
                  : '<div class="tiny faint">No mark scheme was found for this one.</div>') +
            (er ? UI.examinerReport(er, { series: q.series, paper: q.paper,
                                          question: q.q + (q.part ? "(" + q.part + ")" : "") }) : "")
          : revealButton(it));
    }

    if (PracticeTest.kindOf(it.key) === "mex") return examBody(it, q, show);
    if (PracticeTest.kindOf(it.key) === "pp") return paperBody(it, q, show);

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

  /* The question's own pages, in the full viewer.

     They used to be a bare stack of canvases: no zoom, no pen. The one
     screen where you actually want to magnify a diagram or scribble a
     working was the one screen without either, while the exam-question
     panel next door had both. It is the same viewer, given a page range. */
  function paperPanel(url, from, to, tall) {
    return '<div class="pdf-frame pt-paper-frame" style="height:' +
      (tall ? "min(78vh,900px)" : "min(62vh,720px)") + '">' +
      '<div class="pdfv" data-src="' + url + '" data-from="' + from +
      '" data-to="' + to + '"></div></div>';
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
        ? paperPanel(qUrl, q.pageFrom, q.pageTo, true)
        : '<div class="qtext">' + UI.math(q.text) + '</div>') +

      /* Where the text survived, it is worth having: it reflows on a phone
         and it is what search looks through. Where it did not, printing it
         under the real question would only invite you to read the wrong
         thing. */
      (clean && qUrl
        ? '<details class="pt-astext"><summary>Show it as text</summary>' +
            '<div class="qtext">' + UI.math(q.text) + '</div></details>'
        : "") +

      /* Reporting it from where you noticed it, with the question, its
         pages and its scheme filled in — none of which anybody would
         type out by hand, and without which a report is unactionable. */
      '<div class="row" style="justify-content:flex-end;margin-top:8px">' +
        '<button class="btn btn-sm btn-ghost" data-action="rep-question" data-id="' + q.id +
          '" data-where="Practice test" title="Something wrong with this question or its scheme?">' +
          'Report a problem</button>' +
      '</div>' +

      (show
        ? '<div class="qz-ms" style="margin-top:16px">' +
            '<div class="qz-ms-h">' + UI.icon("check") + 'Mark scheme' +
              (q.msCheck === "unverifiable"
                ? '<span class="pill" title="Placed by its position in the scheme, which runs in the same order as the questions. This is an older scheme that prints no totals, so there was nothing to check it against.">placed by order</span>'
                : q.msCheck === "bracketed"
                ? '<span class="pill warn" title="This one could not be placed directly, so it has been narrowed to the pages between the questions either side of it. The schemes run in order, so it is definitely in here — it may just not start at the top.">narrowed to these pages</span>'
                : "") +
            '</div>' +
            (msUrl && q.msFrom
              ? paperPanel(msUrl, q.msFrom, q.msTo, false)
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

  /* A whole past paper's question. Same idea as a topic-set one — the page
     is the question — but the PDFs live in the past-paper folder and the
     chapter was inferred rather than given, so where that inference was not
     clear it says so instead of asserting a topic. */
  function paperBody(it, q, show) {
    const root = "Exam questions PDFs/A-Level Maths/Past papers/";
    const qUrl = encodeURI(root + "Questions/" + q.pdf + ".pdf");
    const msUrl = encodeURI(root + "Mark schemes/" + q.pdf + " MS.pdf");
    const clean = !(q.flags || []).length;

    /* The chapter here is guessed from the wording, and measured honestly it
       is right about two thirds of the time. Good enough to browse by, not
       good enough to move a rating, so it says which it is. */
    const inf = q.chapters && q.chapters[0] ? CHAPTER_INDEX[q.chapters[0]] : null;
    return '<div class="tiny faint" style="margin-bottom:10px">' +
        (q.likely && inf
          ? 'Looks like <b>' + UI.esc(inf.chapterLabel) + '</b>, judged from the wording'
          : 'Topic unclear — a past paper is not filed by topic') +
        '. Either way it does not count towards any chapter’s rating; whole papers are ' +
        'tracked in Past Papers, where you assign the topic of each lost mark yourself.</div>' +
      paperPanel(qUrl, q.pageFrom, q.pageTo, true) +
      (clean
        ? '<details class="pt-astext"><summary>Show it as text</summary>' +
            '<div class="qtext">' + UI.math(q.text) + '</div></details>'
        : "") +
      (show
        ? '<div class="qz-ms" style="margin-top:16px">' +
            '<div class="qz-ms-h">' + UI.icon("check") + 'Mark scheme</div>' +
            (q.msFrom
              ? paperPanel(msUrl, q.msFrom, q.msTo, false)
              : '<div class="tiny muted">Could not place this one in the scheme — look for ' +
                '<b>question ' + q.num + '</b>.</div>' +
                '<div class="pdf-frame" style="height:min(62vh,720px)">' +
                  '<div class="pdfv" data-src="' + msUrl + '"></div></div>') +
          '</div>'
        : revealButton(it));
  }

  /* A nudge that is not the answer.

     Revealing the scheme mid-test ends the question: you cannot unsee it,
     and the mark you give yourself afterwards is not a mark. A hint says
     what the examiner is looking for and how the marks are split, which is
     what people actually want when they are stuck, and it leaves the
     question still worth sitting. */
  /* Edexcel's command words and what each is actually asking for. The
     command word is the most useful single thing to say about a question,
     because it fixes the shape of the answer before you know any of the
     economics. */
  const COMMANDS = [
    [/\bto what extent\b/i, "To what extent",
     "Both sides, then a judgement that commits. “It depends” with nothing after it scores nothing."],
    [/\bevaluate\b/i, "Evaluate",
     "Argue it, then weigh it. The evaluation is not a final paragraph, it runs alongside."],
    [/\bdiscuss\b/i, "Discuss",
     "Two sides, each analysed properly, then decide between them."],
    [/\bassess\b/i, "Assess",
     "Develop the case, then judge how strong it is and what it rests on."],
    [/\bexamine\b/i, "Examine",
     "Explain each point as a chain, then add a short evaluative comment. Depth beats breadth."],
    [/\banalyse\b/i, "Analyse", "Chains of cause and effect. No judgement is being asked for."],
    [/\bexplain\b/i, "Explain", "One reason, taken all the way to its consequence. Not a list."],
    [/\bcalculate\b/i, "Calculate",
     "Show the formula, substitute, then state the answer with its unit."],
    [/\bdefine\b/i, "Define", "One precise sentence, using the technical term."],
    [/\bdraw\b|\bsketch\b/i, "Draw", "The diagram is the answer. Label both axes and every curve."],
    [/\bidentify\b|\bstate\b/i, "State", "Name it. No explanation is being paid for."]
  ];

  const HOW_MANY = /\b(one|two|three|four)\s+((?:[a-z-]+\s+){0,2}?(?:causes?|reasons?|factors?|effects?|benefits?|costs?|advantages?|disadvantages?|ways?|policies|methods?|examples?))/i;

  /* How many separate points the scheme is willing to accept. "It allows
     six and you need two" is a genuinely useful nudge: it says stop hunting
     for the right one and develop the one you have. */
  function schemePoints(q) {
    if (!q || !q.ms) return 0;
    return String(q.ms).split("\n").filter(function (l) {
      return l.trim().indexOf("•") === 0;
    }).length;
  }

  /* A hint about THIS question rather than about questions in general.

     Everything here is read off the question and its own scheme - the
     command word, what it asks for and how many, the topic it sits in,
     whether a diagram is wanted, how many points the scheme allows, how
     the marks split. None of it gives away the content, which is what
     separates a hint from the answer. */
  function hintFor(it) {
    const q = PracticeTest.question(it.key);
    const kind = PracticeTest.kindOf(it.key);
    const mins = PracticeTest.minutesFor(it.marks);
    const text = String((q && q.text) || "");
    const bits = [];

    const cmd = COMMANDS.filter(function (c) { return c[0].test(text); })[0];
    const many = HOW_MANY.exec(text);

    if (cmd) bits.push("The command word is <b>" + UI.esc(cmd[1]) + "</b>. " + UI.esc(cmd[2]));

    if (many) {
      bits.push("It asks for <b>" + UI.esc(many[1].toLowerCase()) + " " +
                UI.esc(many[2].trim()) + "</b>, and marks exactly that many. A third earns " +
                "nothing and costs the time the evaluation needed.");
    }

    if (q && q.topicName) {
      /* Stated as a fact, not as advice. The topic tag is where the question
         is filed, which is not always what it wants: "apart from changes in
         indirect taxes and subsidies, examine two causes of income
         inequality" is filed under indirect taxes, and telling you to start
         from that definition would walk you into the one thing the question
         rules out. */
      bits.push("Filed under <b>" + UI.esc((q.topicCode ? q.topicCode + " " : "") + q.topicName) + "</b>.");
    } else if (it.cid && typeof CHAPTER_INDEX !== "undefined" && CHAPTER_INDEX[it.cid]) {
      const inf = CHAPTER_INDEX[it.cid];
      bits.push("This is <b>" + UI.esc(inf.chapterLabel || inf.chapter.name) + "</b>.");
    }

    if (q && /\bdiagram\b/i.test(text + " " + String(q.ms || ""))) {
      bits.push("This one wants a <b>diagram</b>. Draw it, label both axes and both curves, and " +
                "refer to the labelled points in the writing — an unreferenced diagram earns nothing.");
    }

    const n = schemePoints(q);
    if (n >= 3 && many) {
      bits.push("The scheme accepts <b>" + n + " different points</b> and you need " +
                UI.esc(many[1].toLowerCase()) + ". Stop looking for the right one and develop the " +
                "one you have already thought of.");
    }

    if (kind === "eco" && typeof PacksView !== "undefined") {
      const g = PacksView.guideFor(it.marks);
      if (g) bits.push("Marks split <b>" + UI.esc(g.split) + "</b>.");
    } else if (it.marks >= 8) {
      bits.push("At " + it.marks + " marks it wants developed chains, not a list: about " +
                Math.max(2, Math.round(it.marks / 6)) + " points, each taken to a consequence.");
    } else {
      bits.push("At " + it.marks + " marks it wants the answer and the working, not an essay.");
    }

    bits.push("Give it about <b>" + mins + " minutes</b>. Running long here is what costs the marks " +
              "at the end of the paper.");
    return bits;
  }

  function revealButton(it) {
    const showHint = !!hinted[it.key];
    const bits = hintFor(it);
    return (showHint
        ? '<div class="pt-hint">' + UI.icon("info") +
            '<div><b>A hint, not the answer</b><ul>' +
              bits.map(function (b) { return "<li>" + b + "</li>"; }).join("") +
            '</ul></div></div>'
        : "") +
      '<div class="pt-reveal">' +
        (showHint ? "" :
          '<button class="btn" data-action="pt-hint" data-key="' + UI.esc(it.key) + '">Give me a hint</button>') +
        '<button class="btn btn-primary" style="flex:1" ' +
          'data-action="pt-reveal" data-key="' + UI.esc(it.key) + '">Reveal the mark scheme</button>' +
      '</div>' +
      '<div class="tiny faint" style="text-align:center;margin-top:8px">' +
        'Write the whole answer first — ' + PracticeTest.minutesFor(it.marks) + ' minutes is what it is worth. ' +
        'Every scheme is on the results page at the end too.</div>';
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

      marksSchemes(t) +

      '<div class="row wrap" style="gap:8px">' +
        '<button class="btn btn-primary" data-action="pt-again">Build another test</button>' +
        '<button class="btn" data-action="pt-history-close">Back to the tests</button>' +
        '<div class="spacer"></div>' +
        '<button class="btn btn-ghost" data-action="pt-unlog" data-id="' + t.id + '">Unlog this test</button>' +
      '</div>';
  }

  /* Every mark scheme, at the end, in the order you sat them.

     Revealing one at a time mid-test is for checking a single answer. What
     you want afterwards is to go through the lot, and having to reopen the
     test and click through question by question is why people do not. Folded
     shut so the results are still the first thing on the page. */
  function marksSchemes(t) {
    return '<div class="card">' +
      '<div class="card-head"><div class="card-title">The mark schemes</div>' +
        '<div class="right"><button class="btn btn-sm" data-action="pt-ms-all">' +
          (msAllOpen ? "Fold them all away" : "Open all " + t.items.length) + '</button></div></div>' +
      '<div class="tiny muted" style="margin-bottom:12px">Every question you sat, with its scheme. ' +
        'Going through these is the part that moves a grade; the percentage above is just the ' +
        'receipt.</div>' +
      '<div class="stack">' + t.items.map(function (it, i) {
        const q = PracticeTest.question(it.key);
        const m = PracticeTest.meta(it.key);
        const s = PracticeTest.scoreOf(t, it.key);
        const pct = s ? Math.round(s.got / it.marks * 100) : null;
        const open = msAllOpen || !!msOpen[it.key];
        return '<div class="pt-ms' + (open ? " open" : "") + '">' +
          '<button class="pt-ms-head" data-action="pt-ms" data-key="' + UI.esc(it.key) + '">' +
            '<span class="pt-ms-n">' + (i + 1) + '</span>' +
            '<span class="pt-ms-main"><b>' + UI.esc(m ? m.label : "Question " + (i + 1)) + '</b>' +
              '<small>' + it.marks + ' marks' + (m && m.where ? " · " + UI.esc(m.where) : "") + '</small></span>' +
            (s ? '<span class="pill ' + tone(pct) + '">' + s.got + '/' + it.marks + '</span>'
               : '<span class="pill">not marked</span>') +
            '<span class="pt-ms-chev">' + (open ? "−" : "+") + '</span>' +
          '</button>' +
          (open
            ? '<div class="pt-ms-body">' +
                (q ? questionBody(it, q, true)
                   : '<div class="tiny faint">This question is no longer in the bank.</div>') +
              '</div>'
            : "") +
        '</div>';
      }).join("") + '</div>' +
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
    if (t && t.startedAt) { root.innerHTML = sitting(t); return; }
    if (t) { root.innerHTML = preview(t); return; }

    root.innerHTML = builder() + history();
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
      /* Adds to what is picked rather than replacing it. The list only shows
         the chapters the paper and year chips let through, so "select all"
         wiping the rest meant picking everything in Theme 1, switching to
         Theme 2, picking everything there, and finding Theme 1 gone. */
      case "pt-chap-all": {
        readInputs();
        chaptersAvailable().forEach(function (c) { picked.chapters[c.cid] = true; });
        App.render(); return true;
      }
      case "pt-bank": readInputs(); picked.includeBank = !picked.includeBank; App.render(); return true;
      case "pt-hint": hinted[el.dataset.key] = true; App.render(); return true;
      case "pt-cancel": {
        const id = el.dataset.id;
        UI.confirm("Cancel this test?",
          "It is thrown away and nothing is recorded — no score, no marks against any chapter. " +
          "The questions go back in the pool.",
          "Cancel the test", true).then(function (ok) {
            if (!ok) return;
            PracticeTest.discard(id);
            idx = 0; revealed = {}; hinted = {};
            UI.toast("Test cancelled, nothing recorded", "ok");
            App.render();
          });
        return true;
      }
      case "pt-unlog": {
        const id = el.dataset.id;
        UI.confirm("Unlog this test?",
          "It comes out of your history, and the marks it gave every chapter come out with it, so " +
          "your ratings and plan go back to where they were. This cannot be undone.",
          "Unlog it", true).then(function (ok) {
            if (!ok) return;
            PracticeTest.unlog(id);
            resultId = null;
            UI.toast("Test unlogged and its marks removed", "ok", 4000);
            App.render();
          });
        return true;
      }
      case "pt-ms": {
        const k = el.dataset.key;
        /* opening one on its own turns off "all", or the toggle does nothing */
        if (msAllOpen) {
          msAllOpen = false;
          (PracticeTest.get(resultId) || { items: [] }).items.forEach(function (i) { msOpen[i.key] = true; });
        }
        msOpen[k] = !msOpen[k];
        App.render(); return true;
      }
      case "pt-ms-all": msAllOpen = !msAllOpen; msOpen = {}; App.render(); return true;
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

  /* Open the builder with a set of chapters already ticked. Used by the
     planner's practice-test task, which knows what the next exam covers
     and would otherwise be asking you to remember four chapter names and
     find them in a list of forty-five. */
  function preset(cids) {
    picked.chapters = {};
    (cids || []).forEach(function (c) { if (CHAPTER_INDEX[c]) picked.chapters[c] = true; });
    /* The chapters ARE the filter now; leaving a year or paper chip on
       would quietly drop half of them. */
    picked.group = "all";
    picked.year = "all";
    idx = 0; revealed = {}; resultId = null;
  }

  return { render: render, handle: handle, preset: preset };
})();
