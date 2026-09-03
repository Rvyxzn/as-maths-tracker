/* ============================================================
   Today's Plan
   ============================================================ */

const TodayView = (function () {

  function render(root) {
    const iso = Metrics.today();
    const tasks = Scheduler.tasksFor(iso);
    const budget = Scheduler.budgetFor(iso);
    /* Skipped tasks stay listed for the day's history, but they no longer
    occupy any of today's time, a replacement already filled that slot. */
    const planned = tasks.filter(function (t) { return t.status !== "skipped"; })
      .reduce(function (a, t) { return a + t.minutes; }, 0);
    const doneMins = tasks.filter(function (t) { return t.status === "done"; }).reduce(function (a, t) { return a + t.minutes; }, 0);
    const timeDone = Metrics.timeDoneToday();
    const entries = Metrics.timeEntriesToday();
    const live = !!(Store.get().timer && Store.get().timer.running);
    const remaining = tasks.filter(function (t) { return t.status === "pending"; });
    const ph = Metrics.phase();

    root.innerHTML =
      '<div class="card" style="margin-bottom:18px">' +
        '<div class="row wrap" style="gap:14px">' +
          '<div style="flex:1;min-width:200px">' +
            '<h2 style="font-size:20px">' + Metrics.fmtDateLong(iso) + '</h2>' +
            '<div class="tiny muted" style="margin-top:4px">' + UI.esc(ph.name) + ' · ' + UI.esc(ph.desc) + '</div>' +
          '</div>' +
          '<div style="text-align:right"><div class="stat-k">Planned</div>' +
            '<div style="font-size:20px;font-weight:800;font-family:var(--font-display)">' + Metrics.fmtMins(planned) + '</div></div>' +
        '</div>' +
        '<div style="margin-top:16px">' +
          '<div class="row" style="margin-bottom:7px">' +
            '<div class="stat-k">Time studied today</div><div class="spacer"></div>' +
            (entries.length ? '<button class="btn btn-sm btn-ghost" data-action="log-time">Edit time log</button>' : "") +
          '</div>' +
          '<div data-timebar="' + budget + '">' +
            UI.timeBar(timeDone, budget, { live: live,
              note: timeDone === 0 ? "Start a task with the timer running and this fills up live." : "" }) +
          '</div>' +
          entryList(entries) +
        '</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:14px">' +
          '<button class="btn btn-primary" data-action="what-now">What should I do now?</button>' +
          '<button class="btn" data-action="set-time">How much time do I have today?</button>' +
          (Store.get().timer ? "" : '<button class="btn" data-action="timer-start-adhoc">Start a timer</button>') +
          '<button class="btn" data-action="log-time">Log time</button>' +
          '<button class="btn" data-action="add-task">+ Add a task</button>' +
          '<div class="spacer"></div>' +
          '<button class="btn btn-sm" data-action="regen">Recalculate plan</button>' +
        '</div>' +
      '</div>' +

      (planned > budget ? '<div class="warnbox" style="margin-bottom:16px"><b>Today is overloaded</b>' +
        Metrics.fmtMins(planned) + ' is scheduled but you said you have ' + Metrics.fmtMins(budget) + '. ' +
        'Either raise today’s time or skip the lowest task, the planner will push it forward.</div>' : "") +

      (tasks.length
        ? '<div class="stack">' + tasks.map(function (t) { return UI.taskCard(t); }).join("") + '</div>'
        : UI.empty("🗓", "Nothing scheduled for today",
            Scheduler.budgetFor(iso) === 0 ? "You marked today as a rest day in Settings." : "Recalculate your plan to fill today.") +
          '<div class="row" style="justify-content:center"><button class="btn btn-primary" data-action="regen">Recalculate plan</button></div>') +

      (remaining.length === 0 && tasks.length
        ? '<div class="warnbox info" style="margin-top:16px"><b>✓ Today’s plan is complete</b>' +
        'Everything scheduled for today is done. If you have more time, press “What should I do now?” for a bonus task, ' +
          'it will pick your highest-priority topic and pull work forward.</div>' : "") +

      upcoming();
  }

  /* Every chunk of time logged today, each removable in one click. */
  function entryList(entries) {
    if (!entries.length) return "";
    const KIND = { task: "task ticked off", session: "revision session", paper: "past paper",
                   manual: "added by hand", adhoc: "timer" };
    return '<div class="timelog compact" style="margin-top:12px">' + entries.map(function (e, i) {
      const when = new Date(e.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      return '<div class="timelog-row">' +
        '<div class="timelog-main"><b>' + UI.esc(e.label || "Study") + '</b>' +
          '<small>' + Metrics.fmtMins(e.minutes) + ' \u00b7 ' + UI.esc(KIND[e.kind] || e.kind || "study") +
          ' \u00b7 ' + when + '</small></div>' +
        '<button class="btn btn-sm btn-ghost" data-action="time-remove" data-idx="' + i + '" ' +
          'title="Remove these ' + e.minutes + ' minutes">\u2715</button>' +
      '</div>';
    }).join("") + '</div>';
  }

  function upcoming() {
    const st = Store.get();
    if (!st.plan) return "";
    const rows = [];
    for (let i = 1; i <= 3; i++) {
      const d = Metrics.addDays(Metrics.today(), i);
      if (Metrics.diffDays(d, st.settings.examDate) < 0) break;
      const ts = Scheduler.tasksFor(d);
      if (!ts.length) continue;
      rows.push('<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
        '<div class="row"><b class="tiny">' + Metrics.fmtDate(d, { weekday: "long", day: "numeric", month: "short" }) + '</b>' +
        '<div class="spacer"></div><span class="tiny faint">' + Metrics.fmtMins(ts.reduce(function (a, t) { return a + t.minutes; }, 0)) + '</span></div>' +
        '<div class="tiny muted" style="margin-top:5px">' + ts.map(function (t) {
          return (t.topicId ? UI.ragDot(Metrics.effectiveRag(t.topicId).rag) : "") + " " + UI.esc(t.title);
        }).join(" &nbsp;·&nbsp; ") + '</div></div>');
    }
    if (!rows.length) return "";
    return '<div class="card" style="margin-top:18px"><div class="card-head"><div class="card-title">Coming up</div>' +
      '<div class="right"><button class="btn btn-sm btn-ghost" data-action="go" data-view="calendar">Full calendar</button></div></div>' +
      '<div style="margin-top:-8px">' + rows.join("") + '</div></div>';
  }

  return { render: render };
})();
