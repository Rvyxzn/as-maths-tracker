/* ============================================================
Settings, exam setup, time budget, data export/import
   ============================================================ */

const SettingsView = (function () {

  const WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function render(root) {
    const s = Store.settings();
    const st = Store.get();

    root.innerHTML =
      accountCard() +
      '<div class="grid g2">' +

        '<div class="card"><div class="card-head"><div class="card-title">Exam and qualification</div></div>' +
          '<div class="stack">' +
            field("Exam date", UI.dateField({ id: "examDateField", value: s.examDate })) +
            field("Qualification", '<input class="input" data-set="qualification" value="' + UI.esc(s.qualification) + '">') +
            field("Your name", '<input class="input" data-set="studentName" value="' + UI.esc(s.studentName) + '">') +
            '<div class="field"><label class="label">Papers</label><div class="stack" style="gap:9px;margin-top:4px">' +
              SPEC.map(function (p) {
                return '<label class="switch"><input type="checkbox" data-paper="' + p.id + '"' + (paperOn(p.id) ? " checked" : "") + '><i></i>' +
                  '<span>' + UI.esc(p.name) + '</span></label>';
              }).join("") + '</div></div>' +
            '<div class="field"><label class="label">Content in your plan</label>' +
            '<select class="input" data-set="yearFilter">' +
            sel("all", "Both years, the full A level", s.yearFilter) +
            sel("1", "Year 1 only (AS content)", s.yearFilter) +
            sel("2", "Year 2 only", s.yearFilter) +
            '</select>' +
            '<div class="tiny faint" style="margin-top:6px">Restricts the planner, the dashboard and the topic list. ' +
            'Useful while you are still being taught Year 2, switch back to both years once you have covered it.</div></div>' +
            '<div class="warnbox info tiny"><b>This tracker covers the full A level (9MA0)</b>' +
            'Pure Year 1 chapters 1-14 and Year 2 chapters 1-12, Statistics Year 1 chapters 1-7 and Year 2 chapters 1-3, ' +
            'Mechanics Year 1 chapters 8-11 and Year 2 chapters 4-8. Both years restart their chapter numbering, so chapters ' +
            'are labelled <b>Y1</b> or <b>Y2</b> throughout.</div>' +
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
          backupState() +
          '<div class="row wrap" style="gap:8px;margin-top:14px">' +
            '<button class="btn btn-primary" data-action="export-data">⬇ Save a backup file</button>' +
            '<button class="btn" data-action="import-data">⬆ Restore from a file</button>' +
            '<input type="file" id="importFile" accept="application/json,.json" style="display:none">' +
          '</div>' +
          undoRow() +
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

  function sel(value, label, current) {
    return '<option value="' + value + '"' + (String(current) === value ? " selected" : "") + '>' + label + '</option>';
  }

  /* Who is signed in, and what that does and does not mean. Stated here as
     well as on the login screen, because this is where someone comes looking
     when they wonder where their progress actually lives. */
  function accountCard() {
    const u = Auth.current();
    if (!u) return "";
    const others = Auth.profiles().length - 1;
    const kb = Math.round(Auth.profileSize(u.id) / 1024);

    return '<div class="card" style="margin-bottom:18px">' +
      '<div class="card-head"><div class="card-title">Account</div>' +
        '<div class="right"><button class="btn btn-sm" data-action="sign-out">Sign out</button></div></div>' +

      '<div class="row wrap" style="gap:12px;align-items:center">' +
        (u.picture
          ? '<img class="profile-av" src="' + UI.esc(u.picture) + '" alt="" referrerpolicy="no-referrer">'
          : '<span class="profile-av profile-av-i">' + UI.esc((u.name || "?").charAt(0).toUpperCase()) + '</span>') +
        '<div style="flex:1;min-width:0">' +
          '<b style="font-size:15px">' + UI.esc(u.name) + '</b>' +
          '<div class="tiny muted">' +
            (u.provider === "google" ? "Signed in with Google" + (u.email ? " · " + UI.esc(u.email) : "")
                                     : "Profile on this device") +
            " · " + kb + " KB saved" +
          '</div>' +
        '</div>' +
        (u.provider === "local"
          ? '<button class="btn btn-sm" data-action="set-passcode">' +
              (u.passcodeHash ? "Change passcode" : "Add a passcode") + '</button>' +
            (u.passcodeHash ? ' <button class="btn btn-sm btn-ghost" data-action="clear-passcode">Remove</button>' : "")
          : "") +
      '</div>' +

      '<div class="warnbox info tiny" style="margin-top:14px"><b>Your progress is on this device only</b>' +
        'It is not synced between your laptop and your phone, and signing in with Google does not change that ' +
        'yet, it only says who you are. Use Export below to move it or to keep a backup. ' +
        'A passcode keeps another person on this laptop out of your profile by accident; it is not encryption, ' +
        'and it does not hide your data from anyone who really looks.' +
        (others > 0 ? ' There ' + (others === 1 ? "is 1 other profile" : "are " + others + " other profiles") +
          ' on this device, each with separate progress.' : "") +
      '</div></div>';
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
      const s = localStorage.getItem(storageKey()) || "";
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

    /* The exam date is committed on blur by the field itself, so by the time
       Save runs it is already in settings. Re-read the box anyway, in case
       Save was clicked straight from the field without it losing focus. */
    const dateEl = document.getElementById("examDateField");
    const typed = dateEl ? UI.parseLooseDate(dateEl.value, Store.settings().examDate) : null;

    Store.mutate(function (st) {
      if (typed) st.settings.examDate = typed.iso;
      st.settings.qualification = get("qualification");
      st.settings.studentName = get("studentName");
      st.settings.dailyMinutes = parseInt(get("dailyMinutes"), 10);
      st.settings.pastPaperTargetPerWeek = parseInt(get("pastPaperTargetPerWeek"), 10);
      st.settings.yearFilter = get("yearFilter") || "all";
      const tp = get("timerPrompt");
      if (tp !== null) st.settings.timerPrompt = tp;
      st.settings.papers = papers;
    });
    Scheduler.regenerate("settings changed");
    UI.toast("Settings saved and plan recalculated", "ok");
    App.render();
  }

  /* How long since the last backup, said plainly. A backup you forgot to
     make is the same as no backup, so this is stated up front rather than
     left for you to remember. */
  function backupState() {
    const last = Store.lastBackupAt();
    if (!last) {
      return '<div class="backup-state warn">' + UI.icon("alert") +
        '<span><b>No backup saved yet.</b> If this browser is cleared, everything goes with it.</span></div>';
    }
    const days = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
    const when = new Date(last).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const stale = days >= 14;
    return '<div class="backup-state' + (stale ? " warn" : " ok") + '">' +
      UI.icon(stale ? "alert" : "check") +
      '<span>Last backup <b>' + (days === 0 ? "today" : days === 1 ? "yesterday" : days + " days ago") + '</b> (' + when + ')' +
      (stale ? ', worth saving a fresh one.' : '') + '</span></div>';
  }

  /* Only shown when an import has actually happened, so the wrong file can
     be walked back. */
  function undoRow() {
    const rb = Store.rollbackInfo();
    if (!rb) return "";
    const when = new Date(rb.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    return '<div class="row wrap" style="gap:8px;margin-top:10px;align-items:center">' +
    '<span class="tiny faint">Replaced ' + UI.esc(when) + ', ' + rb.summary.rated + ' rated, ' +
        rb.summary.sets + ' question sets, ' + rb.summary.papers + ' papers.</span>' +
      '<div class="spacer"></div>' +
      '<button class="btn btn-sm" data-action="undo-import">Undo that restore</button>' +
    '</div>';
  }

  /* Both sides of the swap, in the same words, so it is obvious whether the
     file is ahead of or behind what is already here. */
  function compareRows(mine, theirs) {
    const line = function (label, a, b) {
      const diff = a === b ? "" : (b > a ? " more" : " fewer");
      return '<tr><td>' + label + '</td><td class="num">' + a + '</td>' +
        '<td class="num' + (b < a ? " loss" : "") + '">' + b + (diff ? '<small>' + diff + '</small>' : "") + '</td></tr>';
    };
    return '<table class="tbl cmp"><thead><tr><th></th><th class="num">Now</th><th class="num">In the file</th></tr></thead><tbody>' +
      line("Chapters rated", mine.rated, theirs.rated) +
      line("Question sets", mine.sets, theirs.sets) +
      line("Chapter attempts", mine.attempts, theirs.attempts) +
      line("Answers saved", mine.answers, theirs.answers) +
      line("Past papers", mine.papers, theirs.papers) +
      line("Days with time logged", mine.daysLogged, theirs.daysLogged) +
    '</tbody></table>';
  }

  function exportData() {
    const blob = new Blob([Store.exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "as-maths-revision-backup-" + Metrics.today() + ".json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    Store.markBackedUp();
    UI.toast("Backup saved to your downloads", "ok");
    App.render();
  }

  /* Download an arbitrary state document, not just the live one. Used when
     resolving a sync conflict, so the copy being replaced is saved to a file
     before it goes, and a wrong click stays recoverable. */
  function exportSnapshot(stateDoc, label) {
    try {
      const payload = JSON.stringify({
        app: "A-Level Maths Revision Tracker",
        exportedAt: new Date().toISOString(),
        note: "Copy kept automatically while resolving a sync conflict",
        data: stateDoc
      }, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "revision-tracker-" + (label || "snapshot") + "-" + Metrics.today() + ".json";
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      return true;
    } catch (e) {
      console.error("Could not save the snapshot", e);
      return false;
    }
  }

  /* Restoring is destructive, so the file is read and described first. You
     see what is in it beside what you already have, and only then decide.
     The previous data is kept either way, so a mistake here is recoverable. */
  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const clear = function () { e.target.value = ""; };
    const reader = new FileReader();
    reader.onerror = function () { UI.toast("Could not read that file", "bad"); clear(); };
    reader.onload = function () {
      let info;
      try {
        info = Store.inspectJSON(reader.result);
      } catch (err) {
        UI.toast("That is not a tracker backup: " + err.message, "bad", 5000);
        clear(); return;
      }
      const mine = Store.currentSummary();
      const theirs = info.summary;
      const made = info.exportedAt
        ? new Date(info.exportedAt).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : "an unknown date";
      const losing = theirs.sets < mine.sets || theirs.papers < mine.papers || theirs.attempts < mine.attempts;

      UI.confirm(
        "Restore from " + file.name + "?",
        { html:
        '<div class="tiny muted">Saved on <b>' + UI.esc(made) + '</b>' +
          (theirs.name ? ' by <b>' + UI.esc(theirs.name) + '</b>' : '') + '.</div>' +
        compareRows(mine, theirs) +
        (losing
          ? '<div class="warnbox" style="margin-top:12px"><b>This file has less in it than you have now.</b>' +
            'Restoring will replace your current progress with the older set. You can undo it straight afterwards if it was the wrong file.</div>'
          : '<div class="tiny faint" style="margin-top:10px">Your current data is kept so you can undo this.</div>') },
        "Restore this file", true)
        .then(function (ok) {
          if (!ok) { clear(); return; }
          try {
            Store.importJSON(reader.result);
            UI.toast("Restored from " + file.name + ", you can undo this in Settings", "ok", 6000);
            App.go("dashboard");
          } catch (err) {
            UI.toast("Restore failed: " + err.message, "bad", 5000);
          }
          clear();
        });
    };
    reader.readAsText(file);
  }

  function handle(action, el) {
    switch (action) {
      case "save-settings": save(); return true;

      case "set-passcode": {
        const u = Auth.current();
        if (!u || u.provider !== "local") return true;
        UI.modal({
          title: u.passcodeHash ? "Change passcode" : "Add a passcode",
          body:
            '<div class="field"><label class="label">New passcode</label>' +
              '<input class="input" id="pcNew" type="password" autocomplete="new-password"></div>' +
            '<div class="field"><label class="label">Confirm</label>' +
              '<input class="input" id="pcConfirm" type="password" autocomplete="new-password"></div>' +
            '<div class="warnbox info tiny"><b>What a passcode does</b>' +
              'It stops someone else on this laptop opening your profile by accident. It is not encryption: ' +
              'your progress is stored unencrypted and stays readable to anyone who opens the browser\'s ' +
              'developer tools, with or without this passcode.</div>',
          footer: '<button class="btn" data-pc-cancel>Cancel</button>' +
                  '<button class="btn btn-primary" id="pcSave">Save passcode</button>',
          onMount: function (box) {
            box.querySelector("[data-pc-cancel]").onclick = UI.closeModal;
            box.querySelector("#pcSave").onclick = function () {
              const a = box.querySelector("#pcNew").value;
              const b = box.querySelector("#pcConfirm").value;
              if (!a) { UI.toast("Enter a passcode", "bad"); return; }
              if (a !== b) { UI.toast("The two passcodes do not match", "bad"); return; }
              Auth.setPasscode(u.id, a).then(function () {
                UI.closeModal();
                UI.toast("Passcode saved. You will be asked for it next time you open the tracker.", "ok", 5000);
                App.render();
              });
            };
          }
        });
        return true;
      }

      case "clear-passcode": {
        const u = Auth.current();
        if (!u) return true;
        UI.confirm("Remove the passcode?",
          "Your profile will open without one. Your progress is unaffected.", "Remove")
          .then(function (ok) {
            if (!ok) return;
            Auth.setPasscode(u.id, null).then(function () {
              UI.toast("Passcode removed", "ok");
              App.render();
            });
          });
        return true;
      }
      case "undo-import": {
        const rb = Store.rollbackInfo();
        if (!rb) { UI.toast("Nothing to undo", "bad"); return true; }
        UI.confirm("Undo that restore?",
          "This puts back what was in the tracker before the file was loaded, and discards what the file brought in.",
          "Put it back", true)
          .then(function (ok) {
            if (!ok) return;
            if (Store.undoImport()) { UI.toast("Put back the way it was", "ok"); App.go("dashboard"); }
            else UI.toast("Could not undo, the saved copy has gone", "bad");
          });
        return true;
      }
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

  return { render: render, handle: handle, importFile: handleImportFile,
           exportSnapshot: exportSnapshot };
})();
