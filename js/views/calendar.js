/* ============================================================
Calendar, day-by-day plan through to the exam
   ============================================================ */

const CalendarView = (function () {

  let mode = "list"; // list | grid
  let openDay = null; // the day expanded in the month grid

  function render(root) {
    const st = Store.get();
    if (!st.plan) {
      root.innerHTML = UI.empty("🗓", "No plan generated yet", "Finish your assessment, then generate a plan.") +
        '<div class="row" style="justify-content:center"><button class="btn btn-primary" data-action="regen">Generate plan</button></div>';
      return;
    }
    const todayIso = Metrics.today();
    const exam = st.settings.examDate;
    const total = Math.max(0, Metrics.diffDays(todayIso, exam));

    root.innerHTML =
      '<div class="card" style="margin-bottom:18px"><div class="row wrap" style="gap:10px">' +
        '<div style="flex:1"><b>' + total + ' day' + (total === 1 ? "" : "s") + ' of planning</b>' +
        '<div class="tiny muted" style="margin-top:3px">Generated ' + new Date(st.plan.generatedAt).toLocaleString("en-GB") +
          ' · the plan rewrites itself whenever your data changes.</div></div>' +
        '<div class="chips">' +
          '<button class="chip' + (mode === "list" ? " on" : "") + '" data-action="cal-mode" data-val="list">List</button>' +
          '<button class="chip' + (mode === "grid" ? " on" : "") + '" data-action="cal-mode" data-val="grid">Month grid</button>' +
        '</div>' +
        '<button class="btn btn-sm" data-action="regen">Recalculate</button>' +
      '</div></div>' +
      (st.plan.unscheduled && st.plan.unscheduled.length ? unscheduledWarning(st.plan.unscheduled) : "") +
      (mode === "list" ? listView(todayIso, exam) : gridView(todayIso, exam));
  }

  function unscheduledWarning(ids) {
    const names = ids.slice(0, 8).map(function (id) {
      const inf = Store.info(id); return inf ? inf.paper.short + ": " + inf.sub.name : id;
    });
    return '<div class="warnbox bad" style="margin-bottom:18px"><b>⚠️ ' + ids.length + ' topic' + (ids.length === 1 ? "" : "s") + ' will not fit before the exam</b>' +
      'There is not enough time to give these a full revision session at your current daily study time. They are the lowest priority ' +
      '(mostly green or low-frequency), but you should know they are being left out:' +
      '<ul>' + names.map(function (n) { return "<li>" + UI.esc(n) + "</li>"; }).join("") +
      (ids.length > 8 ? "<li>…and " + (ids.length - 8) + " more</li>" : "") + '</ul>' +
      'Raise your daily time in Settings, or accept the trade-off and keep going.</div>';
  }

  function listView(todayIso, exam) {
    const days = [];
    let cur = todayIso;
    let guard = 0;
    while (Metrics.diffDays(cur, exam) >= 0 && guard++ < 220) {
      days.push(cur); cur = Metrics.addDays(cur, 1);
    }
    if (!days.length) return UI.empty("🎓", "The exam date has passed");

    return '<div class="stack">' + days.map(function (d) {
      const isExam = d === exam;
      const tasks = Scheduler.tasksFor(d);
      const mins = tasks.reduce(function (a, t) { return a + t.minutes; }, 0);
      const doneN = tasks.filter(function (t) { return t.status === "done"; }).length;
      const budget = Scheduler.budgetFor(d);

      if (isExam) {
        return '<div class="card" style="border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)">' +
          '<div class="row"><b>' + Metrics.fmtDate(d, { weekday: "long", day: "numeric", month: "long" }) + '</b>' +
          '<div class="spacer"></div><span class="pill acc">' + UI.icon("cap") + 'EXAM DAY</span></div>' +
          '<div class="tiny" style="margin-top:6px">' + UI.esc(Store.settings().qualification) + '. Good luck.</div></div>';
      }

      return '<div class="card">' +
        '<div class="row wrap" style="gap:8px">' +
          '<b style="font-size:14px">' + Metrics.fmtDate(d, { weekday: "long", day: "numeric", month: "long" }) + '</b>' +
          (d === todayIso ? '<span class="pill acc">TODAY</span>' : "") +
          '<div class="spacer"></div>' +
          (tasks.length ? '<span class="pill' + (doneN === tasks.length ? " good" : "") + '">' +
            UI.icon("check") + doneN + '/' + tasks.length + '</span>' : "") +
          '<span class="pill ' + (mins > budget ? "warn" : "") + '">' + UI.icon("clock") +
            Metrics.fmtMins(mins) + ' / ' + Metrics.fmtMins(budget) + '</span>' +
          '<button class="btn btn-sm btn-ghost" data-action="set-day-time" data-date="' + d + '">Edit time</button>' +
          '<button class="btn btn-sm btn-ghost" data-action="add-task" data-date="' + d + '">+ Task</button>' +
        '</div>' +
        (tasks.length
          ? '<div class="stack" style="margin-top:12px;gap:8px">' + tasks.map(function (t) {
              return UI.taskCard(t, { hideWhy: d !== todayIso, hideActions: false });
            }).join("") + '</div>'
          : '<div class="tiny faint row" style="margin-top:8px;gap:6px">' +
              UI.icon(budget === 0 ? "rest" : "clock") + (budget === 0 ? "Rest day" : "Nothing scheduled") + '</div>') +
        '</div>';
    }).join("") + '</div>';
  }

/* One day in the month grid. Everything is a glyph or a bar, the only
     words are the date itself and the key underneath the grid. */
  function dayCell(d, todayIso, exam) {
    const isExam = d === exam;
    const tasks = Scheduler.tasksFor(d);
    const mins = tasks.reduce(function (a, t) { return a + t.minutes; }, 0);
    const budget = Scheduler.budgetFor(d);
    const done = tasks.length && tasks.every(function (t) { return t.status !== "pending"; });
    const dayNum = Metrics.parseISO(d).getDate();

    if (isExam) {
      return '<button class="cal-cell exam' + (d === openDay ? " open" : "") + '"' +
        ' data-action="cal-day" data-date="' + d + '"' +
        ' aria-expanded="' + (d === openDay ? "true" : "false") + '" aria-label="Exam day">' +
        '<div class="cal-top"><b>' + dayNum + '</b></div>' +
        '<div class="cal-exam">' + UI.icon("cap") + '</div></button>';
    }

    /* RAG spread of the day's topic work, capped so the row stays tidy */
    const rag = { red: 0, amber: 0, green: 0 };
    tasks.forEach(function (t) {
      if (!t.topicId) return;
      const e = Metrics.effectiveRag(t.topicId).rag;
      if (rag[e] != null) rag[e]++;
    });
    let dots = "";
    ["red", "amber", "green"].forEach(function (k) {
      for (let i = 0; i < Math.min(rag[k], 3); i++) dots += '<i class="dot dot-' + k + '"></i>';
    });

    const kinds = {};
    tasks.forEach(function (t) { kinds[t.kind] = true; });
    let marks = "";
    if (kinds.paper) marks += '<span class="cal-mark paper">' + UI.icon("paper") + '</span>';
    if (kinds.errors) marks += '<span class="cal-mark alert">' + UI.icon("alert") + '</span>';
    if (kinds.formula) marks += '<span class="cal-mark star">' + UI.icon("star") + '</span>';

    const load = budget > 0 ? Math.min(100, mins / budget * 100) : 0;
    const rest = budget === 0;

    return '<button class="cal-cell' + (d === todayIso ? " today" : "") + (done ? " done" : "") +
        (d === openDay ? " open" : "") + '"' +
        ' data-action="cal-day" data-date="' + d + '"' +
        ' aria-expanded="' + (d === openDay ? "true" : "false") + '"' +
        ' aria-label="' + Metrics.fmtDate(d, { day: "numeric", month: "long" }) +
        (rest ? ", rest day" : ", " + Metrics.fmtMins(mins) + " planned") + '">' +
      '<div class="cal-top"><b>' + dayNum + '</b>' +
        (done ? '<span class="cal-done">' + UI.icon("check") + '</span>' : "") + '</div>' +
      (rest
        ? '<div class="cal-rest">' + UI.icon("rest") + '</div>'
        : '<div class="cal-load' + (load >= 99 ? " full" : "") + '"><span style="width:' + load.toFixed(0) + '%"></span></div>' +
          '<div class="cal-dots">' + dots + marks + '</div>') +
    '</button>';
  }

  /* The panel that drops open under a week when you click one of its days.
  Deliberately brief, what you are doing, for how long, and nothing else. */
  function dayPanel(d, todayIso, exam) {
    const tasks = Scheduler.tasksFor(d);
    const mins = tasks.reduce(function (a, t) { return a + t.minutes; }, 0);
    const budget = Scheduler.budgetFor(d);
    const doneN = tasks.filter(function (t) { return t.status === "done"; }).length;
    const isExam = d === exam;
    const away = Metrics.diffDays(todayIso, d);
    const when = d === todayIso ? "Today" : away === 1 ? "Tomorrow"
               : away > 1 ? "In " + away + " days" : Math.abs(away) + " days ago";

    let body;
    if (isExam) {
      body = '<div class="cal-panel-exam">' + UI.icon("cap") +
        '<div><b>Exam day</b><div class="tiny muted">' + UI.esc(Store.settings().qualification) + '. Good luck.</div></div></div>';
    } else if (!tasks.length) {
      body = '<div class="row tiny muted" style="gap:8px">' + UI.icon(budget === 0 ? "rest" : "clock") +
        (budget === 0 ? "Rest day \u2014 nothing scheduled, by design."
                      : "Nothing scheduled. Recalculate the plan to fill it.") + '</div>';
    } else {
      body = '<div class="cal-panel-list">' + tasks.map(function (t) {
        const k = Scheduler.KIND[t.kind] || {};
        const rag = t.topicId ? Metrics.effectiveRag(t.topicId).rag : null;
        return '<div class="cal-panel-task' + (t.status !== "pending" ? " done" : "") + '">' +
          (rag ? UI.ragDot(rag) : '<i class="dot dot-none"></i>') +
          '<span class="cal-panel-ico">' + UI.icon(k.svg || "star") + '</span>' +
          '<span class="cal-panel-name">' + UI.esc(t.title) + '</span>' +
          '<span class="cal-panel-mins">' + Metrics.fmtMins(t.minutes) + '</span>' +
        '</div>';
      }).join("") + '</div>';
    }

    return '<div class="cal-panel">' +
      '<div class="cal-panel-head">' +
        '<b>' + Metrics.fmtDate(d, { weekday: "long", day: "numeric", month: "long" }) + '</b>' +
        '<span class="pill">' + UI.esc(when) + '</span>' +
        (isExam ? "" :
          '<span class="pill' + (mins > budget ? " warn" : "") + '">' + UI.icon("clock") +
            Metrics.fmtMins(mins) + ' / ' + Metrics.fmtMins(budget) + '</span>' +
          (tasks.length ? '<span class="pill' + (doneN === tasks.length ? " good" : "") + '">' +
            UI.icon("check") + doneN + '/' + tasks.length + '</span>' : "")) +
        '<div class="spacer"></div>' +
        '<button class="btn btn-sm btn-ghost" data-action="cal-day" data-date="' + d + '" ' +
          'aria-label="Collapse">\u2715</button>' +
      '</div>' + body +
      (isExam ? "" :
        '<div class="row wrap" style="gap:6px;margin-top:12px">' +
          '<button class="btn btn-sm" data-action="set-day-time" data-date="' + d + '">Change time</button>' +
          '<button class="btn btn-sm" data-action="add-task" data-date="' + d + '">+ Add a task</button>' +
          (d === todayIso ? '<button class="btn btn-sm btn-primary" data-action="go" data-view="today">Open today</button>' : "") +
        '</div>') +
    '</div>';
  }

  function legend() {
    const item = function (glyph, text) {
      return '<span class="cal-key-item">' + glyph + text + '</span>';
    };
    return '<div class="cal-key">' +
      item('<i class="dot dot-red"></i>', "red topic") +
      item('<i class="dot dot-amber"></i>', "amber") +
      item('<i class="dot dot-green"></i>', "green") +
      item('<span class="cal-mark paper">' + UI.icon("paper") + '</span>', "past paper") +
      item('<span class="cal-mark alert">' + UI.icon("alert") + '</span>', "error analysis") +
      item('<span class="cal-mark star">' + UI.icon("star") + '</span>', "formula drill") +
      item('<span class="cal-key-bar"><span style="width:70%"></span></span>', "how full the day is") +
      item('<span class="cal-mark">' + UI.icon("rest") + '</span>', "rest day") +
      item('<span class="cal-mark">' + UI.icon("cap") + '</span>', "exam") +
    '</div>';
  }

  function gridView(todayIso, exam) {
    const start = Metrics.parseISO(todayIso);
    const months = {};
    let cur = todayIso, guard = 0;
    while (Metrics.diffDays(cur, exam) >= 0 && guard++ < 220) {
      const d = Metrics.parseISO(cur);
      const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      if (!months[key]) months[key] = [];
      months[key].push(cur);
      cur = Metrics.addDays(cur, 1);
    }
    return Object.keys(months).map(function (k) {
      const days = months[k];
      const first = Metrics.parseISO(days[0]);
      const offset = (first.getDay() + 6) % 7; // Monday-first
      const slots = [];
      for (let i = 0; i < offset; i++) slots.push(null);
      days.forEach(function (d) { slots.push(d); });
      while (slots.length % 7 !== 0) slots.push(null);

      let cells = "";
      for (let w = 0; w < slots.length; w += 7) {
        const week = slots.slice(w, w + 7);
        week.forEach(function (d) {
          cells += d ? dayCell(d, todayIso, exam) : '<div class="cal-blank"></div>';
        });
        if (openDay && week.indexOf(openDay) >= 0) cells += dayPanel(openDay, todayIso, exam);
      }
      return '<div class="section-label">' + first.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) + '</div>' +
        '<div class="cal-grid">' +
        ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(function (w) {
          return '<div class="cal-dow">' + w + '</div>';
        }).join("") + cells + '</div>';
    }).join("") + legend();
  }

  function handle(action, el) {
    if (action === "cal-mode") { mode = el.dataset.val; App.render(); return true; }
    if (action === "cal-day") {
      openDay = (openDay === el.dataset.date) ? null : el.dataset.date;
      App.render();
      return true;
    }
    return false;
  }

  return { render: render, handle: handle };
})();
