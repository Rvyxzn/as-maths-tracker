/* ============================================================
   Settings — exam setup, time budget, data export/import
   ============================================================ */

const SettingsView = (function () {

  const WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function render(root) {
    const s = Store.settings();
    const st = Store.get();

    root.innerHTML =
      '<div class="grid g2">' +

        '<div class="card"><div class="card-head"><div class="card-title">Exam and qualification</div></div>' +
          '<div class="stack">' +
            field("Exam date", '<input class="input" type="date" data-set="examDate" value="' + s.examDate + '">') +
            field("Qualification", '<input class="input" data-set="qualification" value="' + UI.esc(s.qualification) + '">') +
            field("Your name", '<input class="input" data-set="studentName" value="' + UI.esc(s.studentName) + '">') +
            '<div class="field"><label class="label">Papers</label><div class="stack" style="gap:9px;margin-top:4px">' +
              SPEC.map(function (p) {
                return '<label class="switch"><input type="checkbox" data-paper="' + p.id + '"' + (s.papers[p.id] ? " checked" : "") + '><i></i>' +
                  '<span>' + UI.esc(p.name) + '</span></label>';
              }).join("") + '</div></div>' +
            '<label class="switch"><input type="checkbox" data-set="includeY2"' + (s.includeY2 ? " checked" : "") + '><i></i>' +
              '<span>Include A-level Year 2 stretch topics</span></label>' +
            '<div class="warnbox info tiny"><b>About the Year 2 topics</b>' +
              'Arithmetic and geometric series, sigma notation, radians, small-angle approximations, sec/cosec/cot, compound angles, ' +
              'composite and inverse functions, and proof by contradiction are <b>A level (Year 2) content and are not examinable on AS 8MA0</b>. ' +
              'They are in the database, flagged YEAR 2, but excluded from your plan unless you switch them on here.</div>' +
            '<button class="btn btn-primary" data-action="save-settings">Save changes</button>' +
          '</div></div>' +

        '<div class="card"><div class="card-head"><div class="card-title">Study time</div></div>' +
          '<div class="stack">' +
            '<div class="field"><label class="label">Default study time per day</label>' +
              '<select class="input" data-set="dailyMinutes">' +
                [30, 60, 90, 120, 150, 180, 240, 300, 360, 420].map(function (m) {
                  return '<option value="' + m + '"' + (s.dailyMinutes === m ? " selected" : "") + '>' + Metrics.fmtMins(m) + '</option>';
                }).join("") + '</select></div>' +
            '<div class="field"><label class="label">Past papers to aim for per week</label>' +
              '<select class="input" data-set="pastPaperTargetPerWeek">' +
                [1, 2, 3, 4, 5].map(function (n) {
                  return '<option value="' + n + '"' + (s.pastPaperTargetPerWeek === n ? " selected" : "") + '>' + n + ' per week</option>';
                }).join("") + '</select></div>' +
            '<div class="field"><label class="label">Rest days (no revision scheduled)</label>' +
              '<div class="chips" style="margin-top:4px">' + WEEK.map(function (w, i) {
                return '<button class="chip' + (s.restDays.indexOf(i) >= 0 ? " on" : "") + '" data-action="toggle-rest" data-val="' + i + '">' + w.slice(0, 3) + '</button>';
              }).join("") + '</div></div>' +
            dayOverrides(s) +
            '<button class="btn btn-primary" data-action="save-settings">Save changes</button>' +
            '<button class="btn" data-action="regen">Recalculate plan now</button>' +
          '</div></div>' +

        '<div class="card"><div class="card-head"><div class="card-title">Revision mode</div></div>' +
          '<div class="stack">' +
            UI.focusDial(s.examFocus) +
            '<div class="tiny muted">' +
              (s.examFocus
                ? 'You are revising <b>chapter by chapter</b> \u2014 ' + Store.activeSubIds().length + ' chapters. Each session gives you one summary, the components that carry the marks, the traps that lose them, and a link to Edexcel topic questions.'
                : 'You are revising <b>section by section</b> \u2014 ' + Store.activeSubIds().length + ' individual specification sections. Switch on Exam-Focus to work a whole chapter at a time.') +
            '</div>' +
            '<label class="switch"><input type="checkbox" data-set="timerPrompt"' + (s.timerPrompt ? " checked" : "") + '><i></i>' +
              '<span>Ask if I want to time myself when I start a task or paper</span></label>' +
            '<button class="btn btn-block" data-action="retake-assessment">Retake the RAG assessment</button>' +
            '<div class="tiny faint">Your ratings carry across when you switch modes: a chapter inherits the weakest of its ' +
            'sections, and sections inherit their chapter\u2019s rating if they have none.</div>' +
          '</div></div>' +

        '<div class="card"><div class="card-head"><div class="card-title">Your data</div></div>' +
          '<div class="tiny muted">Everything is stored in this browser only (localStorage). Nothing is uploaded anywhere. ' +
          'Clearing your browser data would erase it, so export a backup regularly.</div>' +
          '<div class="row wrap" style="gap:8px;margin-top:14px">' +
            '<button class="btn btn-primary" data-action="export-data">⬇ Export JSON backup</button>' +
            '<button class="btn" data-action="import-data">⬆ Import backup</button>' +
            '<input type="file" id="importFile" accept="application/json,.json" style="display:none">' +
          '</div>' +
          '<div class="stack" style="margin-top:16px;gap:0">' +
            dataRow("Topics tracked", String(Store.activeSubIds().length)) +
            dataRow("Question sets logged", String(countSets())) +
            dataRow("Past papers logged", String(st.papers.length)) +
            dataRow("Mistakes logged", String(countErrors())) +
            dataRow("Time logged today", Metrics.fmtMins(Metrics.timeDoneToday())) +
            dataRow("Days with time logged", String(Object.keys(st.timeLog || {}).length)) +
            dataRow("Storage used", storageSize()) +
            dataRow("Created", new Date(st.createdAt).toLocaleDateString("en-GB")) +
          '</div>' +
        '</div>' +

        '<div class="card"><div class="card-head"><div class="card-title">Reset and rebuild</div></div>' +
          '<div class="stack">' +
            '<button class="btn btn-block" data-action="retake-assessment">Retake the RAG assessment</button>' +
            '<button class="btn btn-block" data-action="regen">Rebuild my revision plan from scratch</button>' +
            '<button class="btn btn-block btn-danger" data-action="clear-progress">Clear all progress (keep settings)</button>' +
            '<button class="btn btn-block btn-danger" data-action="hard-reset">Delete everything and start again</button>' +
          '</div>' +
          '<div class="section-label" style="margin:20px 0 10px">Official references</div>' +
          REFERENCE_LINKS.map(function (l) {
            return '<a class="btn btn-sm btn-block" style="margin-bottom:7px" href="' + l.url + '" target="_blank" rel="noopener">' + UI.esc(l.name) + ' ↗</a>';
          }).join("") +
          '<div class="tiny faint" style="margin-top:8px">No past-paper links are invented. Add your own paper URLs when you log a paper.</div>' +
        '</div>' +

        '<div class="card"><div class="card-head"><div class="card-title">Appearance</div></div>' +
          '<div class="row wrap" style="gap:8px">' +
            '<button class="btn' + (s.theme === "dark" ? " btn-primary" : "") + '" data-action="set-theme" data-val="dark">Dark</button>' +
            '<button class="btn' + (s.theme === "light" ? " btn-primary" : "") + '" data-action="set-theme" data-val="light">Light</button>' +
          '</div></div>' +

      '</div>';

  }

  function field(label, control) {
    return '<div class="field"><label class="label">' + label + '</label>' + control + '</div>';
  }
  function dataRow(k, v) {
    return '<div class="row tiny" style="padding:7px 0;border-bottom:1px solid var(--border)">' +
      '<span class="muted">' + k + '</span><div class="spacer"></div><b>' + UI.esc(v) + '</b></div>';
  }

  function dayOverrides(s) {
    const keys = Object.keys(s.dailyOverrides).filter(function (k) { return Metrics.diffDays(k, Metrics.today()) <= 0; }).sort();
    if (!keys.length) return '<div class="tiny faint">No per-day time overrides set. Use “Change today’s time” on the dashboard or “Edit time” in the calendar.</div>';
    return '<div class="field"><label class="label">Per-day overrides</label><div class="stack" style="gap:5px;margin-top:4px">' +
      keys.map(function (k) {
        return '<div class="row tiny"><span>' + Metrics.fmtDate(k) + '</span><div class="spacer"></div>' +
          '<b>' + Metrics.fmtMins(s.dailyOverrides[k]) + '</b>' +
          '<button class="btn btn-sm btn-ghost" data-action="clear-override" data-date="' + k + '">✕</button></div>';
      }).join("") + '</div></div>';
  }

  function countSets() {
    let n = 0; Object.keys(Store.get().topics).forEach(function (k) { n += (Store.get().topics[k].questionSets || []).length; });
    return n;
  }
  function countErrors() {
    let n = 0; Store.get().papers.forEach(function (p) { n += (p.errors || []).length; });
    return n;
  }
  function storageSize() {
    try {
      const s = localStorage.getItem(STORAGE_KEY) || "";
      return (s.length / 1024).toFixed(1) + " KB";
    } catch (e) { return "unavailable"; }
  }

  /* ---------- actions ---------- */
  function save() {
    const get = function (k) {
      const el = document.querySelector('[data-set="' + k + '"]');
      if (!el) return null;
      return el.type === "checkbox" ? el.checked : el.value;
    };
    const papers = {};
    document.querySelectorAll("[data-paper]").forEach(function (cb) { papers[cb.dataset.paper] = cb.checked; });
    if (!papers.pure && !papers.stats && !papers.mech) { UI.toast("Keep at least one paper enabled", "bad"); return; }

    Store.mutate(function (st) {
      st.settings.examDate = get("examDate") || st.settings.examDate;
      st.settings.qualification = get("qualification");
      st.settings.studentName = get("studentName");
      st.settings.dailyMinutes = parseInt(get("dailyMinutes"), 10);
      st.settings.pastPaperTargetPerWeek = parseInt(get("pastPaperTargetPerWeek"), 10);
      st.settings.includeY2 = get("includeY2");
      const tp = get("timerPrompt");
      if (tp !== null) st.settings.timerPrompt = tp;
      st.settings.papers = papers;
    });
    Scheduler.regenerate("settings changed");
    UI.toast("Settings saved and plan recalculated", "ok");
    App.render();
  }

  function exportData() {
    const blob = new Blob([Store.exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "as-maths-revision-backup-" + Metrics.today() + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    UI.toast("Backup downloaded", "ok");
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      UI.confirm("Import this backup?", "This replaces everything currently in the tracker with the contents of " + file.name + ".", "Import and replace", true)
        .then(function (ok) {
          if (!ok) { e.target.value = ""; return; }
          try {
            Store.importJSON(reader.result);
            UI.toast("Backup restored", "ok");
            App.go("dashboard");
          } catch (err) {
            UI.toast("Import failed: " + err.message, "bad", 5000);
          }
          e.target.value = "";
        });
    };
    reader.readAsText(file);
  }

  function handle(action, el) {
    switch (action) {
      case "save-settings": save(); return true;
      case "set-theme":
        Store.mutate(function (st) { st.settings.theme = el.dataset.val; });
        App.applyTheme(); App.render(); return true;
      case "toggle-rest": {
        const i = +el.dataset.val;
        Store.mutate(function (st) {
          const idx = st.settings.restDays.indexOf(i);
          if (idx >= 0) st.settings.restDays.splice(idx, 1); else st.settings.restDays.push(i);
        });
        Scheduler.regenerate("rest days changed");
        App.render(); return true;
      }
      case "clear-override":
        Store.mutate(function (st) { delete st.settings.dailyOverrides[el.dataset.date]; });
        Scheduler.regenerate("day override cleared");
        App.render(); return true;
      case "export-data": exportData(); return true;
      case "import-data": document.getElementById("importFile").click(); return true;
      case "rerun-assessment":
        Store.mutate(function (st) { st.assessCursor = 0; st.assessmentDone = false; });
        OnboardingView.goToStep(3);
        App.go("onboarding"); return true;
      case "clear-progress":
        UI.confirm("Clear all progress?", "Ratings, question scores, sessions, papers and the plan will be deleted. Your settings are kept.", "Clear progress", true)
          .then(function (ok) {
            if (!ok) return;
            Store.mutate(function (st) {
              Object.keys(st.topics).forEach(function (k) { st.topics[k] = Store.blankTopic(); });
              st.papers = []; st.plan = null; st.taskState = {}; st.activity = [];
              st.assessmentDone = false; st.assessCursor = 0; st.onboarded = false;
            });
            UI.toast("Progress cleared", "ok");
            App.go("onboarding");
          });
        return true;
      case "hard-reset":
        UI.confirm("Delete everything?", "This wipes the tracker completely, including your settings. Export a backup first if you might want it back.", "Delete everything", true)
          .then(function (ok) {
            if (!ok) return;
            Store.hardReset();
            OnboardingView.goToStep(0);
            App.go("onboarding");
            UI.toast("Tracker reset", "ok");
          });
        return true;
    }
    return false;
  }

  return { render: render, handle: handle, importFile: handleImportFile };
})();
