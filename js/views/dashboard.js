/* ============================================================
Dashboard, the "how prepared am I / what do I do now" view
   ============================================================ */

const DashboardView = (function () {

  function render(root) {
    const c = Metrics.coverage();
    const ph = Metrics.phase();
    const d = Metrics.daysLeft();
    const ps = Metrics.paperStats();
    const feas = Metrics.feasibility();
    const todayIso = Metrics.today();
    const tasks = Scheduler.tasksFor(todayIso);
    const pending = tasks.filter(function (t) { return t.status === "pending"; });
    const doneCount = tasks.length - pending.length;
    const recurring = Metrics.recurringErrors();

    root.innerHTML =
      hero(d, ph, c, ps) +
      journeyCard() +
      alerts(feas, recurring, c) +
      '<div class="grid g-main" style="margin-top:18px">' +
        '<div class="stack" style="gap:18px">' + todayCard(tasks, pending, doneCount, ph) + likelyCard() + paperBreakdown() + '</div>' +
        '<div class="stack" style="gap:18px">' + progressCard(c) + weakCard() + pastPaperCard(ps) + '</div>' +
      '</div>';
  }

  function hero(d, ph, c, ps) {
    const passed = Metrics.examPassed();
    const examDay = Metrics.isExamDay();
    const cls = passed || examDay ? "done" : d <= 7 ? "urgent" : "";
    const label = passed ? "Exam complete" : examDay ? "Today is the exam" : d === 1 ? "Day until exam" : "Days until exam";
    const value = passed ? "✓" : examDay ? "0" : String(d);
    return '<div class="hero ' + cls + '">' +
      '<div class="row" style="align-items:flex-start"><div>' +
        '<div class="hero-lbl">' + label + '</div>' +
        '<div class="hero-days">' + value + '</div>' +
        '<div style="opacity:.9;font-size:13.5px;margin-top:4px">' + Metrics.fmtDateLong(Store.settings().examDate) + ' · ' + UI.esc(Store.settings().qualification) + '</div>' +
      '</div><div class="spacer"></div>' +
      '<div style="text-align:right"><span class="phase-chip">' + UI.esc(ph.name) + '</span></div></div>' +
      '<div style="margin-top:12px;font-size:13px;opacity:.92;max-width:62ch">' + UI.esc(ph.desc) + '</div>' +
      '<div class="hero-meta">' +
        '<div>Specification covered<b>' + c.coveredPct + '%</b></div>' +
        '<div>Assessed<b>' + c.assessedPct + '%</b></div>' +
        '<div>Red topics<b>' + c.red + '</b></div>' +
        '<div>Past papers logged<b>' + ps.count + (ps.avg != null ? " · avg " + ps.avg + "%" : "") + '</b></div>' +
      '</div></div>';
  }

/* MY AS MATHS JOURNEY, where you are in the method, and what is next */
  function journeyCard() {
    const phases = Journey.allPhases();
    const cur = Journey.currentPhase();
    const next = Journey.nextStep();
    const papers = Store.get().papers.length;

    const phaseRow = phases.map(function (p) {
      const dot = p.complete ? "green" : p.done > 0 ? "amber" : "red";
      return '<div class="journey-phase' + (p.complete ? " done" : p.id === cur.id ? " current" : "") + '">' +
        '<div class="row" style="gap:7px">' + UI.ragDot(dot) +
          '<b class="tiny">' + UI.esc(p.label) + '</b><div class="spacer"></div>' +
          '<span class="tiny faint">' + p.done + '/' + p.total + ' chapters</span></div>' +
        '<div style="margin-top:7px">' + UI.bar(p.pct, "thin") + '</div></div>';
    }).join("") +
    '<div class="journey-phase' + (cur.id === "papers" ? " current" : "") + '">' +
      '<div class="row" style="gap:7px">' + UI.icon("paper") +
        '<b class="tiny">Past papers</b><div class="spacer"></div>' +
        '<span class="tiny faint">' + papers + ' logged</span></div>' +
      '<div style="margin-top:7px">' + UI.bar(cur.id === "papers" ? Math.min(100, papers * 10) : 0, "thin") + '</div></div>';

    let stage = "";
    if (next.kind === "chapter") {
      const inf = Store.info(next.chapterId);
      stage = '<div class="journey-now">' +
        '<div class="row wrap" style="gap:8px">' +
          '<span class="pill acc">Current stage</span>' +
          '<b>' + UI.esc(next.phase.label + ", Chapter " + inf.chapter.num + " " + inf.chapter.name) + '</b>' +
        '</div>' +
        chapterStepStrip(next.state) +
        '<div class="tiny muted" style="margin-top:10px">' + UI.esc(next.detail) + '</div>' +
      '</div>';
    } else {
      stage = '<div class="journey-now">' +
        '<div class="row wrap" style="gap:8px"><span class="pill acc">Current stage</span>' +
        '<b>' + UI.esc(next.title) + '</b></div>' +
        '<div class="tiny muted" style="margin-top:8px">' + UI.esc(next.detail) + '</div></div>';
    }

    return '<div class="card" style="margin-top:18px">' +
    '<div class="card-head"><div class="card-title">My ' + UI.esc(Subjects.current().name) + ' journey</div>' +
        '<div class="right"><button class="btn btn-primary" data-action="continue-revision">' +
          UI.icon("play") + 'Continue revision</button></div></div>' +
      '<div class="journey-strip">' + phaseRow + '</div>' +
      stage + '</div>';
  }

  function chapterStepStrip(st) {
    const order = ["video", "questions", "marked", "rag"];
    return '<div class="chapter-steps compact" style="margin-top:12px">' + order.map(function (k, i) {
      const s = st.steps[k];
      const cls = s.done ? "done" : (st.current === k ? "current" : "todo");
      return '<div class="chapter-step ' + cls + '">' +
        '<span class="chapter-step-n">' + (s.done ? UI.icon("check") : (i + 1)) + '</span>' +
        '<span class="chapter-step-l">' + Journey.STEPS[i].label +
        (s.total > 1 ? '<small>' + s.count + '/' + s.total + '</small>' : '') + '</span></div>';
    }).join("") + '</div>';
  }

  function alerts(feas, recurring, c) {
    let out = "";
    if (!feas.ok && !Metrics.examPassed()) {
      const reqH = (feas.required.total / 60).toFixed(1), availH = (feas.availableMins / 60).toFixed(1);
      out += '<div class="warnbox ' + (feas.tight ? "" : "bad") + '" style="margin-top:18px">' +
        '<b>⚠️ ' + (feas.tight ? "This is tight" : "You cannot fit everything in") + '</b>' +
        'About <b>' + reqH + ' hours</b> of planned revision remain, but only about <b>' + availH + ' hours</b> ' +
        'of study time before the exam' + (feas.deficitMins > 0 ? ', a shortfall of roughly <b>' + Metrics.fmtMins(feas.deficitMins) + '</b>' : "") + '. ' +
        'The planner is already front-loading red topics and exam questions over videos and green maintenance. ' +
        '<a href="#" data-action="go" data-view="settings">Increase your daily study time</a> if you can.</div>';
    }
    const bad = recurring.filter(function (g) { return g.marks >= 5 && g.paperCount >= 2; }).slice(0, 2);
    bad.forEach(function (g) {
      out += '<div class="warnbox" style="margin-top:12px"><b>⚠️ ' + UI.esc(g.name) + ' is a recurring weakness in your past papers</b>' +
        'You have lost <b>' + g.marks + ' marks</b> on it across ' + g.paperCount + ' papers' +
        (g.topType ? ', most often through <b>' + UI.esc(g.topType.toLowerCase()) + '</b>' : "") +
        '. It has been promoted in your schedule. <a href="#" data-action="go" data-view="weaknesses">See the error log</a></div>';
    });
    if (c.assessed < c.total) {
      out += '<div class="warnbox info" style="margin-top:12px"><b>' + (c.total - c.assessed) + ' subtopics are still unrated</b>' +
        'Unrated topics are treated as high priority because the planner has to assume the worst. ' +
        '<a href="#" data-action="resume-assess">Finish your assessment</a> · ' +
        '<a href="#" data-action="retake-assessment">Retake it</a></div>';
    }
    return out;
  }

  function todayCard(tasks, pending, doneCount, ph) {
    const totalMins = tasks.reduce(function (a, t) { return a + t.minutes; }, 0);
    const budget = Scheduler.budgetFor(Metrics.today());
    let body;
    if (Metrics.examPassed()) {
      body = UI.empty("🎓", "Your exam has passed", "Everything below is kept for reference.");
    } else if (!tasks.length) {
      body = UI.empty("🗓", "Nothing scheduled today",
        Store.get().plan ? "Either it is a rest day or your plan needs regenerating." : "Generate your plan to get started.") +
        '<div class="row" style="justify-content:center"><button class="btn btn-primary" data-action="regen">Generate today’s plan</button></div>';
    } else {
      body = '<div class="stack">' + tasks.slice(0, 5).map(function (t) { return UI.taskCard(t); }).join("") + '</div>' +
        (tasks.length > 5 ? '<div style="margin-top:12px;text-align:center"><button class="btn btn-sm" data-action="go" data-view="today">See all ' + tasks.length + ' tasks</button></div>' : "");
    }
    const timeDone = Metrics.timeDoneToday();
    const live = !!(Store.get().timer && Store.get().timer.running);
    return '<div class="card">' +
      '<div class="card-head"><div class="card-title">Today · ' + Metrics.fmtDate(Metrics.today(), { weekday: "long", day: "numeric", month: "long" }) + '</div>' +
        '<div class="right">' +
          '<span class="pill">' + doneCount + '/' + tasks.length + ' done</span>' +
          '<span class="pill ' + (totalMins > budget ? "warn" : "") + '">' + Metrics.fmtMins(totalMins) + ' planned</span>' +
          '<button class="btn btn-sm" data-action="set-time">Change today’s time</button>' +
        '</div></div>' +
      '<div data-timebar="' + budget + '" style="margin-bottom:16px">' +
        UI.timeBar(timeDone, budget, { live: live }) +
      '</div>' + body + '</div>';
  }

  function progressCard(c) {
    return '<div class="card">' +
      '<div class="card-head"><div class="card-title">Where you are</div>' +
        '<div class="right"><button class="btn btn-sm btn-ghost" data-action="go" data-view="progress">Details</button></div></div>' +
      '<div class="row" style="gap:18px;align-items:center">' +
        UI.donut([
          { label: "Red", v: c.red, color: "var(--red)" },
          { label: "Amber", v: c.amber, color: "var(--amber)" },
          { label: "Green", v: c.green, color: "var(--green)" },
          { label: "Unrated", v: c.unassessed, color: "var(--border-strong)" }
        ], c.coveredPct + "%", "COVERED") +
        '<div style="flex:1;min-width:0">' + UI.ragLegend(c) +
          '<div class="stack" style="margin-top:12px;gap:9px">' +
            miniStat("Covered", c.covered + " / " + c.total, c.coveredPct) +
            miniStat("Questions done", c.questioned + " / " + c.total, c.questionedPct) +
            miniStat("Assessed", c.assessed + " / " + c.total, c.assessedPct) +
          '</div>' +
        '</div></div></div>';
  }

  function miniStat(label, val, pct) {
    return '<div><div class="row tiny" style="margin-bottom:4px"><span class="muted">' + label + '</span>' +
      '<div class="spacer"></div><b>' + val + '</b></div>' + UI.bar(pct, "thin") + '</div>';
  }

/* Which chapters account for the most of the exam, and, crucially, which
     of those you are currently weak on. The honesty note is not decoration:
     there is no published frequency table for 8MA0, so this must never read
     as though it were measured. */
  function likelyCard() {
    const rows = Metrics.likelyTopics({ limit: 8 });
    if (!rows.length) return "";
    const atRisk = rows.filter(function (r) { return r.atRisk && !r.complete; }).length;

    return '<div class="card"><div class="card-head">' +
        '<div class="card-title">Most likely to come up</div>' +
        '<div class="right"><button class="btn btn-sm btn-ghost" data-action="likely-why" ' +
          'title="Where this ranking comes from">' + UI.icon("info") + '</button></div>' +
      '</div>' +
      (atRisk
        ? '<div class="likely-flag">' + UI.icon("alert") +
          '<div><b>' + atRisk + ' high-value chapter' + (atRisk === 1 ? "" : "s") + ' you are not solid on.</b>' +
          '<div class="tiny muted" style="margin-top:2px">These are the marks most at risk. They are marked below.</div></div></div>'
        : "") +
      '<div class="likely-list">' + rows.map(likelyRow).join("") + '</div>' +
      '<div class="tiny faint" style="margin-top:10px">Ranked by how much of the paper each chapter accounts for, ' +
        'not by a measured frequency count, because Pearson do not publish one. ' +
        '<button class="linklike" data-action="likely-why">How this is worked out</button></div>' +
    '</div>';
  }

  function likelyRow(r) {
    const marks = r.embedded
      ? '<span class="likely-marks embedded" title="Runs through other questions rather than appearing as its own">woven in</span>'
      : '<span class="likely-marks">~' + Math.round(r.typicalMarks) + ' marks</span>';
    /* a div rather than a button, so the add-to-today control can live
       inside it without nesting one button in another */
    return '<div class="likely-row' + (r.atRisk && !r.complete ? " risk" : "") + (r.complete ? " done" : "") + '" ' +
        'role="button" tabindex="0" data-action="open-chapter" data-id="' + UI.esc(r.cid) + '">' +
      '<span class="likely-bars" aria-hidden="true">' + weightBars(r.weight) + '</span>' +
      '<span class="likely-name">' + UI.esc(r.paper) + ' Ch ' + UI.esc(r.num) + ' · ' + UI.esc(r.name) + '</span>' +
      marks +
      (r.complete ? '<span class="pill good">done</span>' : UI.ragDot(r.rated ? r.rag : null)) +
      (r.complete ? "" : UI.todayToggle(r.cid, { compact: true })) +
    '</div>';
  }

  /* five ticks = shows up on essentially every paper, one = niche */
  function weightBars(w) {
    let out = "";
    for (let i = 1; i <= 5; i++) out += '<i' + (i <= w ? ' class="on"' : "") + '></i>';
    return out;
  }

  function paperBreakdown() {
    const rows = SPEC.filter(function (p) { return paperOn(p.id); }).map(function (p) {
      const pc = Metrics.coverage(p.id);
      return '<div style="padding:13px 0;border-bottom:1px solid var(--border)">' +
        '<div class="row" style="margin-bottom:8px"><b style="font-size:13.5px">' + UI.esc(p.name) + '</b>' +
        '<div class="spacer"></div><span class="tiny muted">' + pc.covered + '/' + pc.total + ' covered · ' + pc.coveredPct + '%</span></div>' +
        UI.bar(pc.coveredPct, "thin") +
        '<div style="margin-top:8px">' + UI.ragBar(pc) + '</div>' +
        '<div class="legend" style="margin-top:7px">' +
          '<span><i class="dot dot-red"></i>' + pc.red + '</span><span><i class="dot dot-amber"></i>' + pc.amber + '</span>' +
          '<span><i class="dot dot-green"></i>' + pc.green + '</span>' +
          (pc.unassessed ? '<span><i class="dot dot-none"></i>' + pc.unassessed + ' unrated</span>' : "") + '</div>' +
        '</div>';
    }).join("");
    return '<div class="card"><div class="card-head"><div class="card-title">Paper breakdown</div>' +
      '<div class="right"><button class="btn btn-sm btn-ghost" data-action="go" data-view="topics">All topics</button></div></div>' +
      '<div style="margin-top:-8px">' + rows + '</div></div>';
  }

  function weakCard() {
    const w = Metrics.weaknesses(5);
    if (!w.length) return "";
    return '<div class="card"><div class="card-head"><div class="card-title">Your weakest areas</div>' +
      '<div class="right"><button class="btn btn-sm btn-ghost" data-action="retake-assessment">Re-rate</button>' +
      '<button class="btn btn-sm btn-ghost" data-action="go" data-view="weaknesses">All</button></div></div>' +
      '<div class="stack" style="gap:2px">' + w.map(function (r) {
        return '<div class="sub-row" data-action="open-topic" data-id="' + r.id + '" style="cursor:pointer">' +
          UI.ragDot(r.eff.rag) +
          '<div class="sub-name">' + UI.esc(r.info.sub.name) + '<small>' + UI.esc(r.info.paper.short + " \u00b7 " + r.info.chapterLabel) + '</small></div>' +
          (r.acc != null ? UI.accPill(r.acc) : (r.covered ? "" : '<span class="pill">not covered</span>')) +
          '</div>';
      }).join("") + '</div></div>';
  }

  function pastPaperCard(ps) {
    if (!ps.count) {
      return '<div class="card"><div class="card-head"><div class="card-title">Past papers</div></div>' +
        UI.empty("▤", "No papers logged yet", "Past papers are the single best predictor of your grade.") +
        '<button class="btn btn-primary btn-block" data-action="log-paper">Log your first paper</button></div>';
    }
    const pts = ps.series.map(function (p, i) {
      return { v: Math.round(p.mark / p.total * 100), label: p.title, short: p.date ? Metrics.fmtDate(p.date, { day: "numeric", month: "short" }) : "#" + (i + 1) };
    });
    return '<div class="card"><div class="card-head"><div class="card-title">Past paper performance</div>' +
      '<div class="right"><button class="btn btn-sm btn-ghost" data-action="go" data-view="papers">All</button></div></div>' +
      '<div class="row" style="gap:16px;margin-bottom:10px">' +
      '<div><div class="stat-k">Average</div><div style="font-size:22px;font-weight:800">' + (ps.avg != null ? ps.avg + "%" : "n/a") + '</div></div>' +
      '<div><div class="stat-k">Latest</div><div style="font-size:22px;font-weight:800">' + (ps.latest != null ? ps.latest + "%" : "n/a") + '</div></div>' +
      '<div><div class="stat-k">Best</div><div style="font-size:22px;font-weight:800">' + (ps.best != null ? ps.best + "%" : "n/a") + '</div></div>' +
        '<div><div class="stat-k">Timed</div><div style="font-size:22px;font-weight:800">' + ps.timed + '</div></div>' +
      '</div>' + UI.lineChart(pts, { height: 150 }) + '</div>';
  }

  return { render: render };
})();
