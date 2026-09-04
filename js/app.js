/* ============================================================
App, routing, navigation, global actions
   ============================================================ */

const App = (function () {

  let current = "dashboard";
  let params = {};
  let lastRenderedView = null;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "◈" },
    { id: "today", label: "Today’s Plan", icon: "✓" },
    { id: "topics", label: "My Topics", icon: "☰" },
    { id: "calendar", label: "Calendar", icon: "▦" },
    { id: "examq", label: "Exam Questions", icon: "✎" },
    { id: "papers", label: "Past Papers", icon: "▤" },
    { id: "assessments", label: "School Tests", icon: "✎" },
    { id: "flashcards", label: "Flashcards", icon: "◈" },
    { id: "weaknesses", label: "Weaknesses", icon: "⚠" },
    { id: "progress", label: "Progress", icon: "◔" },
    { id: "settings", label: "Settings", icon: "⚙" }
  ];

  const TITLES = {
    dashboard: "Dashboard", today: "Today’s Plan", topics: "My Topics", topic: "Topic", chapter: "Chapter", paperview: "Paper",
    calendar: "Calendar", examq: "Exam Questions", papers: "Past Papers", weaknesses: "Weaknesses",
    assessments: "School Tests", flashcards: "Formula Flashcards",
    progress: "Progress", settings: "Settings", session: "Revision Session", onboarding: "Getting Started"
  };

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", Store.settings().theme || "dark");
  }

/* The mobile sidebar and its dimmer are one thing, always move them
together, or you get a scrim with no sidebar behind it. */
function setSidebar(open) {
  document.getElementById("sidebar").classList.toggle("open", open);
  document.getElementById("sidebarScrim").classList.toggle("on", open);
}

  function go(view, p) {
    current = view; params = p || {};
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSidebar(false);
    render();
  }

  function render() {
    const st = Store.get();
    const root = document.getElementById("view");

    /* Signed out: the login screen takes the whole window. It is not a view
       inside the app shell, because there is no profile to render a sidebar,
       countdown or plan for yet. */
    const shell = document.getElementById("app");
    if (!Auth.isSignedIn()) {
      shell.style.display = "none";
      let host = document.getElementById("loginRoot");
      if (!host) {
        host = document.createElement("div");
        host.id = "loginRoot";
        document.body.appendChild(host);
      }
      host.style.display = "";
      LoginView.render(host);
      return;
    }
    shell.style.display = "";
    const loginHost = document.getElementById("loginRoot");
    if (loginHost) loginHost.style.display = "none";

    if (!st.onboarded && current !== "settings") current = "onboarding";

    /* Only play the entrance animation when the view actually changes.
       Re-rendering in place (ticking a task, saving a rating) must not
       make the whole screen fade out and back in. */
    const viewKey = current + ":" + (params.id || "");
    const changed = viewKey !== lastRenderedView;
    lastRenderedView = viewKey;
    root.classList.toggle("anim", changed);

    document.getElementById("viewTitle").textContent = TITLES[current] || "";
    renderNav();
    renderCountdown();
    renderThemeToggle();

    const topActions = document.getElementById("whatNowBtn");
    topActions.style.display = (current === "onboarding" || Metrics.examPassed()) ? "none" : "";
    renderFocusDial();
    renderTimerChip();

    /* Build into a detached node, then either swap wholesale (new view, so
       the entrance animation should play) or morph in place (same view, so
       nothing should flash). */
    const buf = changed ? root : document.createElement("div");

    switch (current) {
      case "onboarding": OnboardingView.render(buf); break;
      case "dashboard": DashboardView.render(buf); break;
      case "today": TodayView.render(buf); break;
      case "topics": TopicsView.render(buf); break;
      case "topic": TopicsView.renderDetail(buf, params.id); break;
      case "chapter": ChapterView.render(buf, params.id); break;
      case "paperview": PaperView.render(buf, params.id); break;
      case "session": SessionView.render(buf, params.id, params.taskId); break;
      case "calendar": CalendarView.render(buf); break;
      case "examq": ExamQView.render(buf); break;
      case "papers": PapersView.render(buf); break;
      case "assessments": AssessmentsView.render(buf); break;
      case "flashcards": FlashcardsView.render(buf); break;
      case "weaknesses": WeaknessesView.render(buf); break;
      case "progress": ProgressView.render(buf); break;
      case "settings": SettingsView.render(buf); break;
      default: DashboardView.render(buf);
    }

  /* PDF viewers are expensive to (re)build, pdf.js has to fetch and
  rasterise every page to canvas, so morph() (see ui.js) treats a
       .pdfv element as an opaque leaf and never touches its children,
       whether or not the view changed. mountAll() only (re)loads a
       viewer whose data-src is new to it. */
    if (!changed) UI.morph(root, buf);
    PdfViewer.mountAll(root);
    YtPlayer.mountAll(root);
  }

  function renderNav() {
    const st = Store.get();
    const todayPending = st.onboarded ? Scheduler.tasksFor(Metrics.today()).filter(function (t) { return t.status === "pending"; }).length : 0;
    const c = Metrics.coverage();
    const badges = { today: todayPending || "", weaknesses: c.red || "",
                     examq: typeof EXAM_SETS !== "undefined" ? Object.keys(EXAM_SETS).length : "",
                     papers: st.papers.length || "",
                     assessments: (st.schoolAssessments || []).length || "" };

    document.getElementById("nav").innerHTML = NAV.map(function (n) {
      const active = current === n.id || ((current === "topic" || current === "chapter") && n.id === "topics") || (current === "session" && n.id === "today");
      return '<button class="nav-item' + (active ? " active" : "") + '" data-action="go" data-view="' + n.id + '">' +
        '<span class="nav-ico">' + n.icon + '</span><span>' + n.label + '</span>' +
        (badges[n.id] ? '<span class="nav-badge">' + badges[n.id] + '</span>' : "") + '</button>';
    }).join("");
  }

/* The dial must persist between renders, replacing its markup would
     reset the element and the sweep animation would never play. */
  function renderFocusDial() {
    const slot = document.getElementById("focusSlot");
    const hide = current === "onboarding" || Metrics.examPassed();
    if (hide) { slot.innerHTML = ""; return; }
    const on = Store.isFocus();
    let btn = slot.querySelector(".focus-toggle");
    if (!btn) {
      slot.innerHTML = UI.focusDial(on);
      btn = slot.querySelector(".focus-toggle");
      /* let the first paint settle before transitions are allowed */
      requestAnimationFrame(function () { if (btn) btn.classList.add("ready"); });
      return;
    }
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  /* Same for the timer chip: keep the node, update its parts. */
  function renderTimerChip() {
    const slot = document.getElementById("timerSlot");
    const t = Store.get().timer;
    if (!t) { if (slot.innerHTML) slot.innerHTML = ""; return; }
    let chip = slot.querySelector(".timer-chip");
    if (!chip) { slot.innerHTML = UI.timerChip(); return; }
    chip.classList.toggle("running", !!t.running);
    chip.classList.toggle("paused", !t.running);
    const lbl = chip.querySelector(".timer-label");
    if (lbl && lbl.textContent !== t.label) lbl.textContent = t.label;
    const btns = chip.querySelectorAll(".timer-btn");
    if (btns[0]) { btns[0].textContent = t.running ? "\u2759\u2759" : "\u25b6"; btns[0].title = t.running ? "Pause" : "Resume"; }
    tick();
  }

  function renderThemeToggle() {
    const dark = (Store.settings().theme || "dark") === "dark";
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    const sun = '<svg class="theme-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7' +
      'M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>';
    const moon = '<svg class="theme-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5 8.6 8.6 0 1 0 20.5 14.6Z"/></svg>';
    btn.innerHTML = (dark ? sun : moon) + '<span>' + (dark ? "Light mode" : "Dark mode") + '</span>';
  }

  /* The sidebar countdown was removed. A permanent days-left number is
     pressure rather than information, and it never changed what to do next.
     The exam date still drives the planner; it just is not shouted at you. */
  function renderCountdown() {
    const el = document.getElementById("countdownMini");
    if (el) el.innerHTML = "";
    renderWhoAmI();
  }

  /* The sigma in the corner is the subject switcher, so it has to show the
     subject you are actually in. */
  function renderBrand() {
    const s = Subjects.current();
    const mark = document.getElementById("brandMark");
    const title = document.getElementById("brandTitle");
    if (mark) { mark.innerHTML = Subjects.markHtml(s); mark.setAttribute("data-subject", s.id); }
    if (title) title.textContent = s.name;
  }

  /* A starting Anki deck for one chapter, as a tab separated file: the format
     Anki's own importer expects, with no add-on needed.

     The cards are the specification's "what you need to be able to do" points,
     which is a scaffold rather than a finished deck. The UI says so: rewriting
     them in your own words is the part that does the learning, and a card you
     did not write is a card you will not remember. */
  function ankiExport(cid) {
    const inf = Store.info(cid);
    if (!inf) return;

    const chapter = inf.chapter || inf.section;
    const subject = Subjects.current();
    const deck = subject.short + "::" + (chapter ? chapter.num + " " + chapter.name : inf.sub.name);

    /* Anki splits on tabs, so any tab or newline inside a field would shift
       every column after it. Collapse whitespace rather than quote it. */
    const clean = function (s) { return String(s || "").replace(/\s+/g, " ").trim(); };

    const rows = [];
    const subs = chapter && chapter.subs ? chapter.subs : [inf.sub];
    subs.forEach(function (sub) {
      (sub.reqs || []).forEach(function (req) {
        rows.push([
          clean(sub.code ? sub.code + " " + sub.name : sub.name),   // front
          clean(req),                                               // back
          clean(deck + "::" + (sub.code || ""))                     // tags
        ].join("\t"));
      });
    });

    if (!rows.length) { UI.toast("Nothing to export for this chapter", "warn"); return; }

    /* The header lines are Anki's own import directives, so the file opens
       with the right column mapping and deck without any clicking about. */
    const file =
      "#separator:tab\n" +
      "#html:false\n" +
      "#notetype:Basic\n" +
      "#deck:" + deck + "\n" +
      "#columns:Front\tBack\tTags\n" +
      rows.join("\n") + "\n";

    const blob = new Blob([file], { type: "text/tab-separated-values;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (subject.short + "-" + (chapter ? chapter.num : inf.sub.code || "topic") + "-anki.txt")
      .replace(/[^\w.-]+/g, "-");
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);

    UI.toast(rows.length + " cards downloaded. In Anki: File, then Import, and pick that file.", "ok", 6000);
  }

  function subjectMenu() {
    const cur = Subjects.currentId();
    UI.modal({
      title: "Switch subject",
      body:
        '<p class="muted" style="margin-top:0">Each subject keeps its own ratings, plan, past papers and school ' +
        'tests. Switching does not affect the other.</p>' +
        '<div class="subject-list">' +
          Subjects.list().map(function (s) {
            const on = s.id === cur;
            const st = Metrics.subjectSummary(s.id);
            return '<button class="subject-row' + (on ? " on" : "") + '" data-pick-subject="' + s.id + '">' +
              '<span class="subject-mark" data-subject="' + s.id + '">' + Subjects.markHtml(s) + '</span>' +
              '<span class="subject-meta">' +
                '<b>' + UI.esc(s.name) + '</b>' +
                '<small>' + UI.esc(s.qualification) + '</small>' +
                '<small>' + st.sections + " " + UI.esc(s.unitPlural) + ", " + st.subs + " subtopics" +
                  (st.rated ? " · " + st.rated + " rated" : " · not rated yet") +
                  (s.hasResources ? "" : " · no videos or questions yet") + '</small>' +
              '</span>' +
              (on ? '<span class="subject-current">current</span>' : '<span class="profile-go">→</span>') +
              '</button>';
          }).join("") +
        '</div>',
      footer: '<button class="btn" data-close-subject>Close</button>',
      /* Modal content is wired here rather than through the delegated
         data-action handler: UI.modal stops click propagation inside the box,
         so document-level delegation never sees it. */
      onMount: function (box) {
        box.querySelector("[data-close-subject]").onclick = UI.closeModal;
        box.querySelectorAll("[data-pick-subject]").forEach(function (b) {
          b.onclick = function () {
            const id = b.dataset.pickSubject;
            UI.closeModal();
            if (id === Subjects.currentId()) return;
            const s = Subjects.switchTo(id);
            renderBrand();
            current = "dashboard";
            render();
            UI.toast("Switched to " + s.name, "ok");
          };
        });
      }
    });
  }

  /* Whose progress is on screen. Worth stating plainly once a browser can
     hold several profiles: it is how you notice you are in the wrong one. */
  function renderWhoAmI() {
    const el = document.getElementById("whoAmI");
    if (!el) return;
    const u = Auth.current();
    if (!u) { el.innerHTML = ""; return; }
    const av = u.picture
      ? '<img class="who-av" src="' + UI.esc(u.picture) + '" alt="" referrerpolicy="no-referrer">'
      : '<span class="who-av who-av-i">' + UI.esc((u.name || "?").charAt(0).toUpperCase()) + '</span>';
    el.innerHTML =
      '<div class="who-row">' + av +
        '<span class="who-name" title="' + UI.esc(u.email || u.name) + '">' + UI.esc(u.name) + '</span>' +
      '</div>' +
      syncChipHtml() +
      '<button class="btn btn-ghost btn-sm btn-block" data-action="sign-out">Sign out</button>';
  }

  /* Whether this device is actually in step with the account. Silence here
     would be worse than a label: the whole point of an account is knowing
     your work is safe, so say when it is not. */
  function syncChipHtml() {
    /* A guest has no account to sync to. Say so where the sync status would
       otherwise sit, so "this device only" stays visible rather than being a
       warning seen once at sign-in and then forgotten. */
    if (typeof Auth !== "undefined" && Auth.isSignedIn() && !Auth.isCloud() && Cloud.configured()) {
      return '<button class="sync-chip warn" data-action="go" data-view="settings" ' +
        'title="Guest progress is saved in this browser only. Use Settings to export a backup or move it to another device.">' +
        'This device only</button>';
    }
    if (typeof Sync === "undefined" || !Sync.enabled()) return "";
    const s = Sync.state();
    const map = {
      idle:    ["ok",   "✓ Synced"],
      syncing: ["",     "↻ Syncing…"],
      offline: ["warn", "⃠ Offline, saved here"],
      error:   ["bad",  "! Sync failed"]
    };
    const m = map[s.status] || ["", ""];
    if (!m[1]) return "";
    const title = s.status === "error" ? s.error
      : s.status === "offline" ? "Your work is saved on this device and will sync when you are back online"
      : s.lastSyncedAt ? "Last synced " + Metrics.relativeTime(s.lastSyncedAt) : "";
    return '<button class="sync-chip ' + m[0] + '" data-action="sync-now" title="' + UI.esc(title) + '">' +
      m[1] + '</button>';
  }

  function renderSyncChip() {
    const el = document.getElementById("whoAmI");
    if (el && Auth.isSignedIn()) renderWhoAmI();
  }

  /* ============================================================
     Global action handling
     ============================================================ */
  /* controls that should give a little pop when you click them */
  const POP_ACTIONS = {
    "task-toggle": 1, "set-rag": 1, "filter": 1, "paper-filter": 1, "weak-grain": 1,
    "cal-mode": 1, "session-rag-after": 1, "assess-rate": 1, "toggle-rest": 1
  };

  function popSelectorFor(el) {
    const d = el.dataset;
    let sel = "[data-action=\"" + d.action + "\"]";
    ["id", "v", "val", "key", "date"].forEach(function (k) {
      if (d[k] != null) sel += "[data-" + k + "=\"" + CSS.escape(d[k]) + "\"]";
    });
    return sel;
  }

  function popAfterRender(sel) {
    requestAnimationFrame(function () {
      const t = document.querySelector(sel);
      if (!t) return;
      t.classList.remove("pop");
      void t.offsetWidth; // restart the animation if it is mid-flight
      t.classList.add("pop");
      setTimeout(function () { t.classList.remove("pop"); }, 360);
    });
  }

/* Remember the chapter, and the question, you were last working on, so
     "Continue revision" resumes exactly there instead of dropping you at the
     top of whichever chapter happens to be first-incomplete. Any chapter
     action counts as being "in" that chapter. */
  function noteChapterPlace(action, el) {
    if (!action || action.indexOf("ch-") !== 0) return;
    const cid = el.dataset.id;
    if (!cid || !isChapterId(cid)) return;
    const extra = {};
    if (el.dataset.n != null && el.dataset.n !== "") extra.question = +el.dataset.n;
    Store.mutate(function () {
      Store.setLastPlace(cid, extra);
    }, { silent: true });
  }

  function onClick(e) {
    const el = e.target.closest("[data-action]");
    if (!el) return;
    const action = el.dataset.action;
    if (el.tagName === "A" && action) e.preventDefault();
    if (POP_ACTIONS[action]) { try { popAfterRender(popSelectorFor(el)); } catch (err) {} }
    noteChapterPlace(action, el);

    /* view-specific handlers first */
    if (current === "onboarding" && OnboardingView.handle(action, el, e)) return;
    if (current === "session" && SessionView.handle(action, el)) return;
    if (TopicsView.handle(action, el)) return;
    if (CalendarView.handle(action, el)) return;
    if (PapersView.handle(action, el)) return;
    if (AssessmentsView.handle(action, el)) return;
    if (action === "anki-export") { ankiExport(el.dataset.id); return; }
    if (action === "switch-subject") { subjectMenu(); return; }
    if (action === "sync-now") {
      UI.toast("Syncing…", "info", 1500);
      Sync.pushNow().then(function (ok) {
        UI.toast(ok ? "Synced to your account" : "Could not sync, your work is still saved here",
                 ok ? "ok" : "warn");
      });
      return;
    }
    if (LoginView.handle(action, el)) return;
    if (SettingsView.handle(action, el)) return;
    if (WeaknessesView.handle(action, el)) return;
    if (PaperView.handle(action, el)) return;
    if (ExamQView.handle(action, el)) return;
    if (FlashcardsView.handle(action, el)) return;

    switch (action) {
      case "go": go(el.dataset.view); return;

      case "open-topic": go("topic", { id: el.dataset.id }); return;

      /* put something on today, or take it off again, without leaving the
         page you are on */
      case "add-today": {
        const id = el.dataset.id;
        if (!Store.info(id)) return;
        if (!Scheduler.addToToday(id)) { UI.toast("That is already on today's plan", "warn"); return; }
        const t = Scheduler.todayTaskFor(id);
        const planned = Scheduler.tasksFor(Metrics.today())
          .filter(function (x) { return x.status !== "skipped"; })
          .reduce(function (a, x) { return a + x.minutes; }, 0);
        const budget = Scheduler.budgetFor(Metrics.today());
        UI.toast("Added " + Store.info(id).sub.name + " to today" +
          (t ? " (" + Metrics.fmtMins(t.minutes) + ")" : "") +
          (planned > budget ? ", today is now over your " + Metrics.fmtMins(budget) + " budget" : ""),
          planned > budget ? "warn" : "ok", 4200);
        render(); return;
      }
      case "remove-today": {
        const id = el.dataset.id;
        if (!Scheduler.removeFromToday(id)) return;
        UI.toast("Taken off today's plan", "ok", 2600);
        render(); return;
      }

      case "open-session": {
        /* Whatever you click, a task, a weak topic, a chapter card, the
           revision itself always happens in the chapter workflow. */
        const sid = el.dataset.id, stask = el.dataset.task || null;
        const cid = Store.chapterOf(sid);
        if (!cid) { UI.toast("No chapter found for that topic", "bad"); return; }
        const inf = Store.info(cid);
        const open = function () { go("chapter", { id: cid, taskId: stask }); };
        timerStartModal(inf ? inf.chapter.name : "Revision session", "session", cid, open, stask);
        return;
      }

      case "set-rag": {
        const id = el.dataset.id, v = el.dataset.v;
        Store.mutate(function (st) {
          const t = st.topics[id];
          t.rag = v;
          t.derived = false; // you rated it yourself now
          if (!t.initialRag) t.initialRag = v;
        });
        Scheduler.regenerate("RAG rating changed");
        const eff = Metrics.effectiveRag(id);
        if (eff.adjusted) {
          UI.toast("Saved as " + v.toUpperCase() + ", but the planner is treating it as " + eff.rag.toUpperCase() + " because " + eff.reasons[0] + ".", "warn", 5200);
        } else {
          UI.toast(Store.info(id).sub.name + " → " + v.toUpperCase() + ". Schedule updated.", "ok");
        }
        render(); return;
      }

      case "task-toggle": {
        const st = Store.get();
        const tid = el.dataset.id;
        const cur = (st.taskState[tid] || {}).status;
        const task = Scheduler.tasksFor(Metrics.today()).filter(function (x) { return x.id === tid; })[0];
        const nowDone = cur !== "done";

        Scheduler.setTaskStatus(tid, nowDone ? "done" : "pending");

        /* Completing a task counts its time towards today, unless a timer
           already logged it. Un-ticking takes that time back off again. */
        if (task) {
          if (nowDone) {
            const alreadyTimed = (Store.get().timeLog[Metrics.today()] || [])
              .some(function (e) { return e.taskId === tid; });
            if (!alreadyTimed) {
              Store.mutate(function () {
                Store.addTimeEntry(task.title, "task", task.topicId || null, task.minutes, tid);
              });
              UI.toast("Logged " + Metrics.fmtMins(task.minutes) + " towards today", "ok", 2600);
            }
          } else {
            Store.mutate(function (s2) {
              const d = Metrics.today();
              if (s2.timeLog[d]) s2.timeLog[d] = s2.timeLog[d].filter(function (e) { return e.taskId !== tid; });
            });
          }
        }
        if (nowDone) Scheduler.regenerate("task completed");
        render(); return;
      }

      case "task-skip":
        Scheduler.setTaskStatus(el.dataset.id, "skipped");
        Scheduler.regenerate("task skipped");
        UI.toast("Skipped, the planner has pushed it forward", "warn");
        render(); return;

      case "task-move": moveTaskModal(el.dataset.id); return;
      case "task-delete": {
        /* Remove takes it off the day for good. Skip, by contrast, leaves it
           on the day as history and lets the freed time be reused. */
        const info = Scheduler.dismissTask(el.dataset.id);
        if (!info) return;
        Scheduler.regenerate("task removed");
        const name = info.task.title;
        UI.toast("Removed " + name + " from " +
          (info.date === Metrics.today() ? "today" : Metrics.fmtDate(info.date)) +
          (info.task.manual ? "" : ", it will not come back to that day"), "ok", 4000);
        render(); return;
      }

      case "regen":
        Scheduler.regenerate("manual recalculation");
        UI.toast("Plan recalculated", "ok");
        render(); return;

      case "likely-why": likelyWhyModal(); return;
      case "what-now": whatNowModal(); return;
      case "continue-revision": continueRevision(); return;
      case "open-chapter": go("chapter", { id: el.dataset.id }); return;
      case "go-papers": go("papers"); return;
      case "set-time": timeModal(Metrics.today()); return;
      case "set-day-time": timeModal(el.dataset.date); return;
      case "add-task": addTaskModal(el.dataset.date || Metrics.today()); return;
      case "add-custom-topic": customTopicModal(); return;
      case "edit-video": videoModal(el.dataset.id); return;
      case "quick-questions": questionsModal(el.dataset.id); return;
      case "topic-notes": notesModal(el.dataset.id); return;

      case "topic-pin":
        Store.mutate(function (st) { st.topics[el.dataset.id].pinned = !st.topics[el.dataset.id].pinned; });
        Scheduler.regenerate("topic pinned");
        render(); return;

      case "topic-reset": {
        const id = el.dataset.id;
        UI.confirm("Reset this topic?", "All ratings, question sets and history for “" + Store.info(id).sub.name + "” will be cleared.", "Reset topic", true)
          .then(function (ok) {
            if (!ok) return;
            Store.mutate(function (st) { st.topics[id] = Store.blankTopic(); });
            Scheduler.regenerate("topic reset");
            UI.toast("Topic reset", "ok"); render();
          });
        return;
      }

      case "del-qset": {
        const id = el.dataset.id, idx = +el.dataset.idx;
        Store.mutate(function (st) { st.topics[id].questionSets.splice(idx, 1); });
        Scheduler.regenerate("question set deleted");
        render(); return;
      }

      case "focus-info": focusInfoModal(); return;

      case "toggle-focus": { doToggleFocus(); return; }

      case "timer-toggle": {
        const tt = Store.get().timer;
        if (!tt) return;
        Store.mutate(function () { if (tt.running) Store.timerPause(); else Store.timerResume(); });
        render(); return;
      }

      case "timer-stop": {
        const ts = Store.get().timer;
        if (!ts) return;
        const tlabel = ts.label;
        let tmins = 0;
        Store.mutate(function () { tmins = Store.timerStop(true); });
        UI.toast(tmins > 0 ? "Logged " + Metrics.fmtMins(tmins) + " on " + tlabel : "Timer stopped, nothing logged",
                 tmins > 0 ? "ok" : "warn");
        render(); return;
      }

      case "timer-start-adhoc": timerStartModal("Study session", "adhoc", null); return;
      case "retake-assessment": retakeModal(); return;
      case "log-time": logTimeModal(); return;

      case "time-remove": {
        const idx = +el.dataset.idx;
        let removed = null;
        Store.mutate(function () { removed = Store.removeTimeEntry(Metrics.today(), idx); });
        if (removed) UI.toast("Removed " + Metrics.fmtMins(removed.minutes) + " \u2014 " + removed.label, "ok");
        render(); return;
      }

      /* ---------- the chapter method ---------- */
      case "ch-ep": {
        const cid = el.dataset.id, n = +el.dataset.n;
        const total = Journey.totalVideos(cid);
        if (n < 1 || n > total) return;
        Store.mutate(function () { Store.topic(cid).currentEpisode = n; });
        /* Try to jump in place first, no reload, keeps the player warm.
           If the player does not answer, the re-render below swaps the
           iframe src, which reloads it at that episode instead. */
        jumpToEpisode(n);
        render(); return;
      }
      case "ch-ep-times": { episodeTimesModal(el.dataset.id); return; }

      case "ch-video": {
        const cid = el.dataset.id, n = +el.dataset.n;
        Store.mutate(function (st) {
          const t = Store.topic(cid);
          /* Pin where the player is BEFORE the tick changes what counts as
          "first unwatched", otherwise ticking a video slides the current
             episode forward and the player jumps to the next one. */
          if (t.currentEpisode == null) t.currentEpisode = Journey.currentEpisode(cid);
          const i = t.videoWatched.indexOf(n);
          if (i >= 0) t.videoWatched.splice(i, 1); else t.videoWatched.push(n);
          t.videoDone = t.videoWatched.length >= Journey.totalVideos(cid);
        });
        render(); return;
      }
      case "ch-video-all": {
        const cid = el.dataset.id;
        Store.mutate(function () {
          const t = Store.topic(cid);
          const n = Journey.totalVideos(cid);
          t.videoWatched = []; for (let i = 1; i <= n; i++) t.videoWatched.push(i);
          t.videoDone = true;
        });
        UI.toast("Playlist marked as watched", "ok");
        Scheduler.regenerate("playlist finished"); render(); return;
      }
      case "ch-video-none": {
        const cid = el.dataset.id;
        Store.mutate(function () { const t = Store.topic(cid); t.videoWatched = []; t.videoDone = false; });
        render(); return;
      }
      case "ch-video-url": {
        const cid = el.dataset.id;
        const url = (document.getElementById("chVidUrl") || {}).value || "";
        if (url && !Journey.parseYouTube(url)) { UI.toast("That does not look like a YouTube playlist or video link", "bad"); return; }
        Store.mutate(function () { Store.topic(cid).videoUrl = url.trim(); });
        UI.toast(url ? "Link saved and embedded" : "Link cleared", "ok"); render(); return;
      }
      case "ch-video-reset": {
        const cid = el.dataset.id;
        Store.mutate(function () { Store.topic(cid).videoUrl = ""; });
        render(); return;
      }
      case "ch-video-count": { videoCountModal(el.dataset.id); return; }
      case "ch-exam-score": {
        const cid = el.dataset.id;
        const got = UI.num((document.getElementById("chExGot") || {}).value, null);
        const avail = UI.num((document.getElementById("chExAvail") || {}).value, null);
        if (avail === null || avail <= 0) { UI.toast("Enter how many marks the exam questions were out of", "bad"); return; }
        if (got === null || got < 0) { UI.toast("Enter how many marks you got", "bad"); return; }
        if (got > avail) { UI.toast("You cannot score more than " + avail + " marks", "bad"); return; }
        Store.mutate(function () { Store.topic(cid).examScore = { got: got, avail: avail }; });
        const sc = Metrics.chapterScore(cid);
        UI.toast("Exam questions: " + got + "/" + avail + " (" + sc.exam.pct + "%, grade " + sc.exam.grade + ")", "ok", 3800);
        render(); return;
      }
      case "ch-exam-clear": {
        Store.mutate(function () { Store.topic(el.dataset.id).examScore = null; });
        render(); return;
      }
      case "ch-q-band": { ChapterView.setBand(el.dataset.val); render(); return; }
      case "ch-q-finish": {
        const cid = el.dataset.id;
        const b = Journey.answeredBreakdown(cid);
        if (!b.count) { UI.toast("Answer at least one question first", "bad"); return; }
        Store.mutate(function () { Store.topic(cid).questionsFinished = true; });
        Scheduler.regenerate("questions finished");
        UI.toast("Marking " + b.count + " question" + (b.count === 1 ? "" : "s") +
          ", " + b.marks + "/" + b.available + " marks", "ok", 3600);
        render(); return;
      }
      case "ch-q-reopen": {
        Store.mutate(function () { Store.topic(el.dataset.id).questionsFinished = false; });
        render(); return;
      }
      case "ch-q-open": {
        const n = +el.dataset.n;
        ChapterView.setOpenQ(ChapterView.getOpenQ() === n ? null : n);
        render(); return;
      }
      case "ch-q-reveal": {
        const cid = el.dataset.id, n = +el.dataset.n;
        const work = (document.querySelector('[data-work="' + n + '"]') || {}).value || "";
        Store.mutate(function () {
          const t = Store.topic(cid);
          t.answers[n] = Object.assign({}, t.answers[n], { revealed: true, work: work });
        });
        render(); return;
      }
      case "ch-q-record": {
        const cid = el.dataset.id, n = +el.dataset.n;
        const qs = Journey.questionsFor(cid);
        const got = UI.num((document.querySelector('[data-got="' + n + '"]') || {}).value, null);
        if (got === null) { UI.toast("Enter how many marks you got", "bad"); return; }
        const max = qs[n] ? qs[n].marks : got;
        if (got > max) { UI.toast("You cannot score more than " + max + " marks", "bad"); return; }
        const work = (document.querySelector('[data-work="' + n + '"]') || {}).value || "";
        Store.mutate(function () {
          const t = Store.topic(cid);
          t.answers[n] = Object.assign({}, t.answers[n], { revealed: true, recorded: true, marksGot: got, work: work });
        });
        /* jump to the next unrecorded question that is actually on show */
        const ans = Journey.answersFor(cid);
        let next = null;
        const sel = Journey.selectedQuestions(cid);
        for (let k = 0; k < sel.length; k++) { if (!(ans[sel[k]] && ans[sel[k]].recorded)) { next = sel[k]; break; } }
        ChapterView.setOpenQ(next);
        render(); return;
      }
      case "ch-q-add": { addQuestionModal(el.dataset.id); return; }

      case "ch-pdf": {
        const cid = el.dataset.id, kind = el.dataset.kind; // "q" or "ms"
        const inp = document.createElement("input");
        inp.type = "file"; inp.accept = "application/pdf";
        inp.onchange = function () {
          const f = inp.files[0];
          if (!f) return;
          if (f.type !== "application/pdf") { UI.toast("That is not a PDF", "bad"); return; }
          if (f.size > 25 * 1024 * 1024) { UI.toast("That PDF is over 25MB", "bad"); return; }
          const store = (kind === "q" ? "chq:" : "chms:") + cid;
          PaperFiles.put(store, f).then(function () {
            Store.mutate(function () {
              const t = Store.topic(cid);
              if (kind === "q") t.qSetFile = f.name; else t.qMsFile = f.name;
            });
            ChapterView.resetPdf(cid);
            UI.toast((kind === "q" ? "Questions" : "Mark scheme") + " attached \u2014 it opens inside the app now", "ok", 4200);
            render();
          }).catch(function (e) { UI.toast("Could not store that file: " + e.message, "bad"); });
        };
        inp.click();
        return;
      }
      case "ch-pdf-clear": {
        const cid = el.dataset.id;
        UI.confirm("Remove the attached PDFs?",
          "The question set and mark scheme for this chapter will be removed from the app. Your scores are kept.",
          "Remove", true).then(function (ok) {
            if (!ok) return;
            PaperFiles.del("chq:" + cid); PaperFiles.del("chms:" + cid);
            Store.mutate(function () {
              const t = Store.topic(cid); t.qSetFile = null; t.qMsFile = null;
            });
            ChapterView.revealMs(cid, false);
            ChapterView.resetPdf(cid);
            render();
          });
        return;
      }
      case "ch-ms-reveal": {
        const key = el.dataset.id + ":" + (el.dataset.key || "own");
        UI.confirm("Reveal the mark scheme?",
          "Only once you have worked through the questions. You can hide it again afterwards.",
          "Reveal it", false).then(function (ok) {
            if (!ok) return;
            ChapterView.revealMs(key, true); render();
          });
        return;
      }
      case "ch-ms-hide": {
        ChapterView.revealMs(el.dataset.id + ":" + (el.dataset.key || "own"), false);
        render(); return;
      }
      /* Open or close an examiner report. Kept as a plain toggle on the
         element rather than a re-render, so the page does not jump. */
      case "exrep-toggle": {
        const wrap = el.closest("[data-exrep]");
        const body = wrap && wrap.querySelector(".exrep-body");
        if (!body) return;
        const open = body.hidden;
        body.hidden = !open;
        wrap.classList.toggle("open", open);
        el.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }

      case "ch-record": { recordChapter(el.dataset.id); return; }

      /* Take today's logged time back off one chapter. Confirmed, because
         the minutes are gone from the day's total once they go. */
      case "ch-drop-time": {
        const cid = el.dataset.id;
        const d = Metrics.today();
        const mins = Store.timeLoggedForTopic(d, cid);
        if (!mins) { UI.toast("No time logged on this chapter today", "bad"); return; }
        const name = Store.info(cid).chapter.name;
        UI.confirm("Remove " + Metrics.fmtMins(mins) + " from " + name + "?",
                   "It comes off today's total as well. Your answers, score and rating are untouched.",
                   "Remove the time", true)
          .then(function (ok) {
            if (!ok) return;
            let gone = 0;
            Store.mutate(function () { gone = Store.removeTimeForTopic(d, cid); });
            UI.toast("Removed " + Metrics.fmtMins(gone) + " from " + name, "ok");
            render();
          });
        return;
      }
      case "ch-rag": {
        const cid = el.dataset.id, v = el.dataset.v;
        Store.mutate(function (st) {
          const t = Store.topic(cid);
          t.ragAfterChapter = v; t.rag = v; t.derived = false;
          if (!t.initialRag) t.initialRag = v;
        });
        Scheduler.regenerate("chapter rating updated");
        const eff = Metrics.effectiveRag(cid);
        UI.toast(eff.adjusted
          ? "Saved as " + v.toUpperCase() + " \u2014 the planner is treating it as " + eff.rag.toUpperCase() + " because " + eff.reasons[0]
          : "Chapter complete \u2014 rated " + v.toUpperCase(), eff.adjusted ? "warn" : "ok", 5000);
        render(); return;
      }
      case "ch-next": { continueRevision(); return; }

      case "resume-assess":
        OnboardingView.goToStep(3);
        Store.mutate(function (st) {
          const ids = Store.activeSubIds();
          const i = ids.findIndex(function (x) { return !Store.topic(x).rag; });
          st.assessCursor = i < 0 ? 0 : i;
          st.assessmentDone = false;
        });
        go("onboarding"); return;
    }
  }

  /* ---------- modals ---------- */
  /* Be explicit about what this ranking is and is not. It would be easy to
     dress it up as a frequency statistic; that would be made up. */
  function likelyWhyModal() {
    const m = Metrics.PAPER_MARKS;
    const total = m.pure + m.stats + m.mech;
    UI.modal({
      title: "How “most likely to come up” is worked out",
      body:
        '<div class="warnbox"><b>There is no official frequency table</b>' +
        'Pearson do not publish how often each topic appears on 9MA0, and there is no reliable public ' +
        'tally of past papers. So this ranking deliberately shows no percentages, any number of that ' +
        'kind would be invented. It ranks chapters by how much of the exam they account for.</div>' +

        '<div class="section-label" style="margin-top:16px">What it is based on</div>' +
        '<ol class="reqs" style="padding-left:20px">' +
        '<li><b>The mark split, which is published.</b> Papers 1 and 2 (Pure) are ' + m.pure + ' of the ' + total +
        ' marks, ' + Math.round(m.pure / total * 100) + '% of the qualification. Paper 3 is ' + (m.stats + m.mech) +
            ' marks, split evenly between Statistics and Mechanics.</li>' +
          '<li><b>A per-chapter weighting and typical mark range</b> carried in this app, read off the ' +
            'specification’s assessment structure and the released papers. This is an editorial judgement, ' +
            'not a measurement, and it is the part you should treat with most caution.</li>' +
            '<li><b>Your own results</b>, the only genuinely measured input. These never change the ranking ' +
            'itself, so the picture of the exam stays stable as you improve; they only flag which of those ' +
            'chapters you are currently weak on.</li>' +
        '</ol>' +

        '<div class="section-label" style="margin-top:16px">Reading the row</div>' +
        '<div class="tiny muted"><b>The five ticks</b> are how reliably that chapter shows up, five means it is on ' +
        'essentially every paper. <b>The marks figure</b> is the typical size of the question when it appears. ' +
        '<b>“Woven in”</b> means the chapter rarely gets its own question but runs through the others, ' +
        'Algebraic Expressions is the clearest case: you use index laws and factorising inside differentiation, ' +
        'integration and coordinate geometry, so weakness there costs you marks that get recorded against ' +
        'other topics. <b>The coloured dot</b> is your current rating, so a five-tick chapter with a red dot ' +
        'is the most valuable thing you could fix.</div>' +

        '<div class="warnbox info" style="margin-top:16px"><b>Use it for ordering, not for gambling</b>' +
        'This is a sensible order to revise in. It is not a prediction, and question spotting is a bad bet, ' +
        'the A level is a broad specification and examiners can and do ask anything on it.</div>',
      footer: '<button class="btn btn-primary" data-c>Got it</button>',
      onMount: function (box) { box.querySelector("[data-c]").onclick = UI.closeModal; }
    });
  }

  function whatNowModal() {
    UI.modal({
      title: "What should I do now?",
      body: '<div class="field"><label class="label">How much time do you have right now?</label>' +
        '<div class="chips" id="wnChips">' +
          [30, 45, 60, 90, 120, 180, 240].map(function (m) {
            return '<button class="chip" data-m="' + m + '">' + Metrics.fmtMins(m) + '</button>';
          }).join("") + '</div></div>' +
        '<div class="row" style="gap:8px"><input class="input" type="number" id="wnCustom" placeholder="Custom minutes" style="flex:1">' +
        '<button class="btn" id="wnGo">Tell me</button></div>' +
        '<div id="wnResult"></div>',
      onMount: function (box) {
        const show = function (mins) {
          const r = Scheduler.whatNow(mins);
          const out = box.querySelector("#wnResult");
          if (r.none) { out.innerHTML = '<div class="warnbox info">' + UI.esc(r.message) + '</div>'; return; }
          const t = r.task;
          out.innerHTML = '<div style="margin-top:6px">' +
            '<div class="tiny faint" style="letter-spacing:.1em;text-transform:uppercase;font-weight:700;margin-bottom:8px">Do this now</div>' +
            UI.taskCard(t, { hideActions: true }) +
            (t.shortened ? '<div class="tiny faint" style="margin-top:8px">Shortened to fit the ' + Metrics.fmtMins(mins) + ' you have, do as much as you can and log what you managed.</div>' : "") +
            (r.bonus ? '<div class="warnbox info" style="margin-top:12px"><b>Bonus work</b>Today’s plan is already done. This is the next highest-priority topic, pulled forward.</div>' : "") +
            '<div class="row wrap" style="gap:8px;margin-top:14px">' +
              (t.topicId ? '<button class="btn btn-primary" data-action="open-session" data-id="' + t.topicId + '" data-task="' + UI.esc(t.id) + '">Start this session</button>' : "") +
              (t.kind === "paper" ? '<button class="btn btn-primary" data-action="log-paper">Log the paper when done</button>' : "") +
              (t.kind === "errors" ? '<button class="btn btn-primary" data-action="go" data-view="weaknesses">Open error log</button>' : "") +
            '</div></div>';
          out.querySelectorAll("[data-action]").forEach(function (b) {
            b.addEventListener("click", function () { UI.closeModal(); });
          });
        };
        box.querySelectorAll("#wnChips .chip").forEach(function (c) {
          c.onclick = function () {
            box.querySelectorAll("#wnChips .chip").forEach(function (x) { x.classList.remove("on"); });
            c.classList.add("on");
            show(+c.dataset.m);
          };
        });
        box.querySelector("#wnGo").onclick = function () {
          const v = UI.num(box.querySelector("#wnCustom").value);
          show(v || null);
        };
        show(null);
      }
    });
  }

  function timeModal(dateIso) {
    const cur = Scheduler.budgetFor(dateIso);
    UI.modal({
      title: "Study time for " + Metrics.fmtDate(dateIso, { weekday: "long", day: "numeric", month: "long" }),
      body: '<div class="tiny muted">The planner will never schedule more work than the time you set here.</div>' +
        '<div class="chips" id="tmChips">' +
          [0, 30, 60, 90, 120, 150, 180, 240, 300, 360].map(function (m) {
            return '<button class="chip' + (cur === m ? " on" : "") + '" data-m="' + m + '">' + (m === 0 ? "Rest day" : Metrics.fmtMins(m)) + '</button>';
          }).join("") + '</div>' +
        '<div class="field"><label class="label">Or a custom number of minutes</label>' +
          '<input class="input" type="number" id="tmCustom" min="0" value="' + cur + '"></div>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="tmSave">Save and replan</button>',
      onMount: function (box) {
        let picked = cur;
        box.querySelectorAll("#tmChips .chip").forEach(function (c) {
          c.onclick = function () {
            box.querySelectorAll("#tmChips .chip").forEach(function (x) { x.classList.remove("on"); });
            c.classList.add("on"); picked = +c.dataset.m;
            box.querySelector("#tmCustom").value = picked;
          };
        });
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#tmSave").onclick = function () {
          const v = UI.num(box.querySelector("#tmCustom").value, picked);
          Store.mutate(function (st) { st.settings.dailyOverrides[dateIso] = Math.max(0, v); });
          Scheduler.regenerate("study time changed");
          UI.closeModal(); UI.toast("Plan rebuilt around " + Metrics.fmtMins(v), "ok");
          render();
        };
      }
    });
  }

  function addTaskModal(dateIso) {
    const opts = Store.activeSubIds().map(function (id) {
      const inf = Store.info(id);
      return '<option value="' + id + '">' + UI.esc(inf.paper.short + ", " + inf.sub.name) + '</option>';
    }).join("");
    UI.modal({
      title: "Add a task to " + Metrics.fmtDate(dateIso),
      body:
        '<div class="field"><label class="label">Task type</label><select class="input" id="atKind">' +
          '<option value="learn">Full revision session (video + questions)</option>' +
          '<option value="questions">Exam questions only</option>' +
          '<option value="retrieval">Retrieval practice</option>' +
          '<option value="paper">Past paper / section</option>' +
          '<option value="errors">Error analysis</option>' +
          '<option value="formula">Formula &amp; recall drill</option>' +
        '</select></div>' +
        '<div class="field" id="atTopicWrap"><label class="label">Topic</label><select class="input" id="atTopic">' + opts + '</select></div>' +
        '<div class="field"><label class="label">Title (leave blank to use the topic name)</label><input class="input" id="atTitle"></div>' +
        '<div class="field"><label class="label">Estimated minutes</label><input class="input" type="number" id="atMins" value="45"></div>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="atSave">Add task</button>',
      onMount: function (box) {
        const kind = box.querySelector("#atKind");
        const wrap = box.querySelector("#atTopicWrap");
        const sync = function () {
          const needsTopic = ["learn", "questions", "retrieval"].indexOf(kind.value) >= 0;
          wrap.style.display = needsTopic ? "" : "none";
        };
        kind.onchange = sync; sync();
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#atSave").onclick = function () {
          const k = kind.value;
          const needsTopic = ["learn", "questions", "retrieval"].indexOf(k) >= 0;
          const topicId = needsTopic ? box.querySelector("#atTopic").value : null;
          const title = box.querySelector("#atTitle").value.trim() ||
            (topicId ? Store.info(topicId).sub.name : (Scheduler.KIND[k] || {}).label || "Task");
          Scheduler.addTask(dateIso, {
            kind: k, topicId: topicId, title: title,
            minutes: UI.num(box.querySelector("#atMins").value, 45),
            why: "You added this task yourself."
          });
          UI.closeModal(); UI.toast("Task added", "ok"); render();
        };
      }
    });
  }

  function moveTaskModal(taskId) {
    UI.modal({
      title: "Reschedule task",
      body: '<div class="field"><label class="label">Move to</label>' +
        '<input class="input" type="date" id="mtDate" value="' + Metrics.addDays(Metrics.today(), 1) + '" min="' + Metrics.today() + '" max="' + Store.settings().examDate + '"></div>' +
        '<div class="tiny faint">Moving a task by hand keeps it exactly where you put it; the rest of the plan flows around it.</div>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="mtSave">Move</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#mtSave").onclick = function () {
          const d = box.querySelector("#mtDate").value;
          if (!d) return;
          Scheduler.rescheduleTask(taskId, d);
          Scheduler.regenerate("task rescheduled");
          UI.closeModal(); UI.toast("Task moved to " + Metrics.fmtDate(d) + ", today's plan filled the gap", "ok"); render();
        };
      }
    });
  }

  /* Jump the player to an episode. YtPlayer drives a real IFrame API player,
  where playVideoAt() is documented and actually works, unlike an `index`
     URL parameter, which a playlist embed silently ignores. If the player is
     still starting up, YtPlayer remembers the episode and goes there once it
     is ready. */
  function jumpToEpisode(n) {
    YtPlayer.playAtSelector("#chVideoFrame", n);
  }

  /* Enter how long each episode is. Typed once, then the totals and the
     planner all use real numbers instead of an estimate. */
  function episodeTimesModal(cid) {
    const total = Journey.totalVideos(cid);
    const t = Store.topic(cid);
    const d = t.videoDurations || {};
    const vm = Journey.videoMinutes(cid);
    let rows = "";
    for (let i = 1; i <= total; i++) {
      rows += '<div class="ep-time-row">' +
        '<label class="label" style="margin:0;flex:1">Episode ' + i + '</label>' +
        '<input class="input" type="number" min="0" max="180" step="1" data-ep="' + i + '" ' +
          'placeholder="mins" value="' + (d[i] != null ? UI.esc(String(d[i])) : "") + '" style="width:92px">' +
      '</div>';
    }
    UI.modal({
      title: "Episode lengths, " + Store.info(cid).chapter.name,
      body:
        '<div class="tiny muted">YouTube does not hand out video lengths without an API key, so these are not ' +
        'fetched automatically. Type them in from the thumbnails once and the chapter’s total, the time still ' +
        'left to watch, and the planner all switch from an estimate to your real numbers. Leave any blank and ' +
        'it fills the gap with the average of the ones you did enter.</div>' +
        '<div class="ep-time-grid" style="margin-top:14px">' + rows + '</div>' +
        '<div class="tiny faint" style="margin-top:10px">Currently ' +
        (vm.exact ? "using your entered lengths." : vm.knownCount + " of " + total + " entered, the rest are estimated.") +
        '</div>',
      footer: '<button class="btn" data-c>Cancel</button>' +
              '<button class="btn btn-primary" id="etSave">Save lengths</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#etSave").onclick = function () {
          const next = {};
          box.querySelectorAll("[data-ep]").forEach(function (inp) {
            const v = UI.num(inp.value, null);
            if (v != null && v > 0) next[inp.dataset.ep] = Math.round(v);
          });
          Store.mutate(function () { Store.topic(cid).videoDurations = next; });
          Scheduler.regenerate("episode lengths updated");
          UI.closeModal();
          const after = Journey.videoMinutes(cid);
          UI.toast("Total video time " + Metrics.fmtMins(after.total) +
            (after.exact ? "" : " (some still estimated)"), "ok", 4000);
          render();
        };
      }
    });
  }

  /* ---------- flashcards: Quizlet in and out ----------
     Quizlet has no open API for creating sets, so this uses the route that
     actually works and needs no account linking: its own copy-and-paste
     import/export, which is plain text with a chosen separator between term
     and definition and between cards. Quizlet's defaults are Tab and a new
     line, so those are the defaults here too. */
  const QUIZLET_SEPS = {
    tab: { label: "Tab", value: "\t" },
    comma: { label: "Comma", value: "," },
    dash: { label: "Hyphen -", value: "n/a" }
  };
  const QUIZLET_ROWS = {
    newline: { label: "New line", value: "\n" },
    semicolon: { label: "Semicolon", value: ";" },
    blank: { label: "Blank line", value: "\n\n" }
  };

  function flashcardDeckFor(cid) {
    if (cid) return cardsForChapter(cid).map(function (c) { return { cid: cid, card: c }; });
    const out = [];
    flashcardChapters().forEach(function (c) {
      cardsForChapter(c).forEach(function (card) { out.push({ cid: c, card: card }); });
    });
    return out;
  }

  function flashcardExportModal(cid) {
    const rows = flashcardDeckFor(cid);
    const title = cid ? CHAPTER_INDEX[cid].chapter.name : "every chapter";

    const build = function (sep, row, withChapter) {
      return rows.map(function (r) {
        const prefix = withChapter && !cid
          ? "[" + CHAPTER_INDEX[r.cid].paper.short + " Ch" + CHAPTER_INDEX[r.cid].chapter.num + "] " : "";
        /* strip the separator out of the text itself or the import breaks */
        const q = String(prefix + r.card.q).split(sep).join(" ");
        const a = String(r.card.a).split(sep).join(" ");
        return q + sep + a;
      }).join(row);
    };

    UI.modal({
      title: "Export flashcards to Quizlet",
      body:
        '<div class="tiny muted">Copy the text below, then in Quizlet choose <b>Create → Import</b> and paste it in, ' +
        'making sure Quizlet\'s separators match the ones you pick here.</div>' +
        '<div class="form-grid" style="margin-top:12px">' +
          '<div class="field"><label class="label">Between term and definition</label>' +
            '<select class="input" id="qxSep">' +
              Object.keys(QUIZLET_SEPS).map(function (k) {
                return '<option value="' + k + '">' + QUIZLET_SEPS[k].label + '</option>';
              }).join("") + '</select></div>' +
          '<div class="field"><label class="label">Between cards</label>' +
            '<select class="input" id="qxRow">' +
              Object.keys(QUIZLET_ROWS).map(function (k) {
                return '<option value="' + k + '">' + QUIZLET_ROWS[k].label + '</option>';
              }).join("") + '</select></div>' +
        '</div>' +
        (cid ? "" : '<label class="switch"><input type="checkbox" id="qxPrefix" checked><i></i>' +
          '<span>Label each card with its chapter</span></label>') +
        '<div class="field" style="margin-top:12px"><label class="label">' + rows.length + ' cards from ' + UI.esc(title) + '</label>' +
          '<textarea class="input" id="qxOut" rows="10" readonly style="font-family:ui-monospace,monospace;font-size:12px"></textarea></div>',
      footer: '<button class="btn" data-c>Close</button>' +
              '<button class="btn btn-primary" id="qxCopy">Copy to clipboard</button>',
      onMount: function (box) {
        const out = box.querySelector("#qxOut");
        const refresh = function () {
          const sep = QUIZLET_SEPS[box.querySelector("#qxSep").value].value;
          const row = QUIZLET_ROWS[box.querySelector("#qxRow").value].value;
          const pfx = box.querySelector("#qxPrefix");
          out.value = build(sep, row, pfx ? pfx.checked : false);
        };
        box.querySelector("#qxSep").onchange = refresh;
        box.querySelector("#qxRow").onchange = refresh;
        if (box.querySelector("#qxPrefix")) box.querySelector("#qxPrefix").onchange = refresh;
        refresh();
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#qxCopy").onclick = function () {
          out.select();
          navigator.clipboard.writeText(out.value).then(function () {
            UI.toast("Copied " + rows.length + " cards, paste into Quizlet's import box", "ok", 4200);
          }).catch(function () {
          UI.toast("Could not reach the clipboard, select the text and copy manually", "warn", 4200);
          });
        };
      }
    });
  }

  function flashcardImportModal(cid) {
    const chapters = flashcardChapters();
    UI.modal({
      title: "Import flashcards from Quizlet",
      body:
        '<div class="tiny muted">In Quizlet open your set, choose <b>Export</b>, copy the text and paste it below. ' +
        'Set the separators to match what Quizlet gave you. Imported cards are added to the chapter you choose ' +
        'and are marked as yours, so they sit alongside the built-in ones rather than replacing them.</div>' +
        '<div class="field" style="margin-top:12px"><label class="label">Add to chapter</label>' +
          '<select class="input" id="qiChapter">' +
            chapters.map(function (c) {
              const inf = CHAPTER_INDEX[c];
              return '<option value="' + c + '"' + (c === cid ? " selected" : "") + '>' +
              UI.esc(inf.paper.short + " Ch" + inf.chapter.num + ", " + inf.chapter.name) + '</option>';
            }).join("") + '</select></div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Between term and definition</label>' +
            '<select class="input" id="qiSep">' +
              Object.keys(QUIZLET_SEPS).map(function (k) {
                return '<option value="' + k + '">' + QUIZLET_SEPS[k].label + '</option>';
              }).join("") + '</select></div>' +
          '<div class="field"><label class="label">Between cards</label>' +
            '<select class="input" id="qiRow">' +
              Object.keys(QUIZLET_ROWS).map(function (k) {
                return '<option value="' + k + '">' + QUIZLET_ROWS[k].label + '</option>';
              }).join("") + '</select></div>' +
        '</div>' +
        '<div class="field"><label class="label">Paste your Quizlet export</label>' +
          '<textarea class="input" id="qiIn" rows="9" placeholder="term&#9;definition" ' +
            'style="font-family:ui-monospace,monospace;font-size:12px"></textarea></div>' +
        '<div id="qiPreview" class="tiny faint"></div>',
      footer: '<button class="btn" data-c>Cancel</button>' +
              '<button class="btn btn-primary" id="qiSave">Import</button>',
      onMount: function (box) {
        const parse = function () {
          const sep = QUIZLET_SEPS[box.querySelector("#qiSep").value].value;
          const row = QUIZLET_ROWS[box.querySelector("#qiRow").value].value;
          const raw = box.querySelector("#qiIn").value;
          return raw.split(row).map(function (line) {
            const t = line.trim();
            if (!t) return null;
            const at = t.indexOf(sep);
            if (at < 0) return null;
            const q = t.slice(0, at).trim();
            const a = t.slice(at + sep.length).trim();
            return q && a ? { q: q, a: a } : null;
          }).filter(Boolean);
        };
        const preview = function () {
          const cards = parse();
          box.querySelector("#qiPreview").innerHTML = cards.length
            ? '<b style="color:var(--green)">' + cards.length + ' card' + (cards.length === 1 ? "" : "s") + ' found.</b> ' +
              'First one: “' + UI.esc(cards[0].q.slice(0, 60)) + '” → “' + UI.esc(cards[0].a.slice(0, 60)) + '”'
            : (box.querySelector("#qiIn").value.trim()
                ? '<b style="color:var(--red)">No cards found.</b> Check the separators match your pasted text.'
                : "");
        };
        box.querySelector("#qiIn").addEventListener("input", preview);
        box.querySelector("#qiSep").onchange = preview;
        box.querySelector("#qiRow").onchange = preview;
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#qiSave").onclick = function () {
          const cards = parse();
          if (!cards.length) { UI.toast("Nothing to import, check the separators", "bad"); return; }
          const target = box.querySelector("#qiChapter").value;
          Store.mutate(function () {
            const t = Store.topic(target);
            if (!t.ownCards) t.ownCards = [];
            cards.forEach(function (c) { t.ownCards.push({ q: c.q, a: c.a }); });
          });
          UI.closeModal();
          UI.toast("Imported " + cards.length + " card" + (cards.length === 1 ? "" : "s") + " into " +
            CHAPTER_INDEX[target].chapter.name, "ok", 4200);
          FlashcardsView.openFor(target);
          go("flashcards");
        };
      }
    });
  }

  function flashcardAddModal(cid) {
    UI.modal({
      title: "Add your own flashcard",
      body:
        '<div class="field"><label class="label">Front (the prompt)</label>' +
          '<textarea class="input" id="fcQ" rows="3" placeholder="e.g. Cosine rule rearranged for an angle"></textarea></div>' +
        '<div class="field"><label class="label">Back (the answer)</label>' +
          '<textarea class="input" id="fcA" rows="3" placeholder="e.g. cos A = (b² + c² − a²) / 2bc"></textarea></div>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="fcSave">Add card</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#fcSave").onclick = function () {
          const q = box.querySelector("#fcQ").value.trim();
          const a = box.querySelector("#fcA").value.trim();
          if (!q || !a) { UI.toast("Both sides are needed", "bad"); return; }
          Store.mutate(function () {
            const t = Store.topic(cid);
            if (!t.ownCards) t.ownCards = [];
            t.ownCards.push({ q: q, a: a });
          });
          UI.closeModal(); UI.toast("Card added", "ok"); render();
        };
      }
    });
  }

  /* Which videos in the playlist actually count.

  Playlists are not always pure teaching, Zeeshan's include the odd
     advert or channel trailer. Two controls, because the extras are not
     always at the end: set how many videos the playlist has, and untick any
     individual one that is not part of the course. Unticked videos stay
     playable but do not count towards finishing the chapter, and their
     length is left out of the chapter's total watch time.

     Setting the count by hand also stops the YouTube player quietly
     correcting it back, which it does whenever it reports the real playlist
     length. */
  function videoCountModal(cid) {
    const detected = Store.topic(cid).videoDetectedTotal || null;
    const rebuild = function (box) {
      const total = Math.max(1, Math.min(60, Math.round(
        UI.num(box.querySelector("#vcN").value, Journey.totalVideos(cid)))));
      const skipped = Journey.skippedVideos(cid);
      const durations = Store.topic(cid).videoDurations || {};
      let rows = "";
      for (let i = 1; i <= total; i++) {
        const off = skipped.indexOf(i) >= 0;
        rows += '<label class="vc-row' + (off ? " off" : "") + '">' +
          '<input type="checkbox" data-ep="' + i + '"' + (off ? "" : " checked") + '>' +
          '<span class="vc-n">Video ' + i + '</span>' +
          '<span class="vc-len tiny faint">' + (durations[i] ? Metrics.fmtMins(durations[i]) : "") + '</span>' +
          '<span class="vc-state tiny">' + (off ? "does not count" : "counts") + '</span>' +
        '</label>';
      }
      box.querySelector("#vcList").innerHTML = rows;
      const counted = box.querySelectorAll('#vcList input:checked').length;
      box.querySelector("#vcSummary").innerHTML =
        '<b>' + counted + '</b> of ' + total + ' videos count towards this chapter' +
        (counted < total ? ' · ' + (total - counted) + ' excluded' : "");
    };

    UI.modal({
      title: "Which videos count?, " + Store.info(cid).chapter.name,
      body:
      '<div class="tiny muted">Playlists sometimes include videos that are not part of the course, adverts or ' +
        'channel trailers. Untick those and they will not count towards finishing the chapter, and their length ' +
        'will be left out of the total watch time. You can still play them.</div>' +
        (detected ? '<div class="tiny faint" style="margin-top:6px">YouTube reports this playlist has ' +
          detected + ' videos.</div>' : "") +
        '<div class="field" style="margin-top:12px"><label class="label">Videos in the playlist</label>' +
          '<input class="input" type="number" min="1" max="60" id="vcN" value="' + Journey.totalVideos(cid) + '" style="width:110px"></div>' +
        '<div id="vcSummary" class="vc-summary"></div>' +
        '<div id="vcList" class="vc-list"></div>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="vcSave">Save</button>',
      onMount: function (box) {
        rebuild(box);
        box.querySelector("#vcN").addEventListener("input", function () { rebuild(box); });
        box.querySelector("#vcList").addEventListener("change", function (e) {
          const row = e.target.closest(".vc-row");
          if (row) {
            row.classList.toggle("off", !e.target.checked);
            row.querySelector(".vc-state").textContent = e.target.checked ? "counts" : "does not count";
          }
          const total = box.querySelectorAll('#vcList input').length;
          const counted = box.querySelectorAll('#vcList input:checked').length;
          box.querySelector("#vcSummary").innerHTML =
            '<b>' + counted + '</b> of ' + total + ' videos count towards this chapter' +
            (counted < total ? ' · ' + (total - counted) + ' excluded' : "");
        });
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#vcSave").onclick = function () {
          const total = Math.max(1, Math.min(60, Math.round(
            UI.num(box.querySelector("#vcN").value, Journey.totalVideos(cid)))));
          const skip = [];
          box.querySelectorAll("#vcList input").forEach(function (inp) {
            if (!inp.checked) skip.push(+inp.dataset.ep);
          });
          Store.mutate(function () {
            const t = Store.topic(cid);
            t.videoTotal = total;
            t.videoTotalManual = true; // stop the player overriding this
            t.videoSkipped = skip;
            t.videoWatched = (t.videoWatched || []).filter(function (x) { return x <= total; });
            t.videoDone = Journey.watchedCount(cid) >= Journey.countedVideos(cid);
          });
          Scheduler.regenerate("playlist video count changed");
          UI.closeModal();
          UI.toast(Journey.countedVideos(cid) + " of " + total + " videos now count towards this chapter", "ok", 4000);
          render();
        };
      }
    });
  }

  function videoModal(id) {
    const t = Store.topic(id);
    UI.modal({
      title: "Chapter summary video, " + Store.info(id).sub.name,
      body: '<div class="tiny muted">Paste the Zeeshan Zamured chapter summary video URL for this topic. ' +
      'No links are guessed or invented, find the right video once and the tracker remembers it.</div>' +
        '<div class="field"><label class="label">Video URL</label>' +
        '<input class="input" id="vmUrl" placeholder="https://www.youtube.com/watch?v=…" value="' + UI.esc(t.videoUrl) + '"></div>' +
        '<label class="switch"><input type="checkbox" id="vmDone"' + (t.videoDone ? " checked" : "") + '><i></i><span>I have watched this video</span></label>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="vmSave">Save</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#vmSave").onclick = function () {
          Store.mutate(function (st) {
            st.topics[id].videoUrl = box.querySelector("#vmUrl").value.trim();
            st.topics[id].videoDone = box.querySelector("#vmDone").checked;
          });
          Scheduler.regenerate("video status changed");
          UI.closeModal(); UI.toast("Saved", "ok"); render();
        };
      }
    });
  }

  function questionsModal(id) {
    UI.modal({
      title: "Log a question set, " + Store.info(id).sub.name,
      body:
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Attempted</label><input class="input" type="number" min="1" id="qmA"></div>' +
          '<div class="field"><label class="label">Correct</label><input class="input" type="number" min="0" id="qmC"></div>' +
          '<div class="field"><label class="label">Time (min)</label><input class="input" type="number" min="0" id="qmT"></div>' +
          '<div class="field"><label class="label">Difficulty</label><select class="input" id="qmD">' +
            ["", "Easy", "Comfortable", "Challenging", "Very hard"].map(function (d) { return '<option>' + d + '</option>'; }).join("") +
          '</select></div>' +
        '</div>' +
        '<div class="field"><label class="label">Mistakes made</label><textarea class="input" id="qmM"></textarea></div>' +
        '<label class="switch"><input type="checkbox" id="qmMk" checked><i></i><span>I marked these against the mark scheme</span></label>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="qmSave">Save</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#qmSave").onclick = function () {
          const a = UI.num(box.querySelector("#qmA").value), c = UI.num(box.querySelector("#qmC").value);
          if (!a || c == null) { UI.toast("Enter attempted and correct", "bad"); return; }
          if (c > a) { UI.toast("Correct cannot exceed attempted", "bad"); return; }
          Store.mutate(function (st) {
            st.topics[id].questionSets.push({
              date: Metrics.today(), attempted: a, correct: c, pct: Math.round(c / a * 100),
              minutes: UI.num(box.querySelector("#qmT").value, null),
              difficulty: box.querySelector("#qmD").value, mistakes: box.querySelector("#qmM").value, notes: ""
            });
            if (box.querySelector("#qmMk").checked) st.topics[id].marked = true;
            st.topics[id].lastRevised = Metrics.today();
          });
          Scheduler.regenerate("questions logged");
          const eff = Metrics.effectiveRag(id);
          UI.closeModal();
          UI.toast(eff.adjusted
            ? Store.info(id).sub.name + " is now being treated as " + eff.rag.toUpperCase() + ", " + eff.reasons[0]
            : "Question set saved", eff.adjusted ? "warn" : "ok", 5000);
          render();
        };
      }
    });
  }

  function notesModal(id) {
    const t = Store.topic(id);
    UI.modal({
      title: "Notes, " + Store.info(id).sub.name,
      body: '<div class="field"><label class="label">Your notes</label>' +
        '<textarea class="input" id="nmText" style="min-height:200px">' + UI.esc(t.notes) + '</textarea></div>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="nmSave">Save</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#nmSave").onclick = function () {
          Store.mutate(function (st) { st.topics[id].notes = box.querySelector("#nmText").value; });
          UI.closeModal(); UI.toast("Notes saved", "ok"); render();
        };
      }
    });
  }

  function customTopicModal() {
    UI.modal({
      title: "Add a custom topic",
      body:
        '<div class="field"><label class="label">Topic name</label><input class="input" id="ctName" placeholder="e.g. Trapezium rule"></div>' +
        '<div class="field"><label class="label">Paper</label><select class="input" id="ctPaper">' +
          SPEC.map(function (p) { return '<option value="' + p.id + '">' + UI.esc(p.short) + '</option>'; }).join("") + '</select></div>' +
        '<div class="field"><label class="label">What you need to know (one per line)</label>' +
          '<textarea class="input" id="ctReqs" style="min-height:110px"></textarea></div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">Importance (1-5)</label><input class="input" type="number" min="1" max="5" id="ctImp" value="3"></div>' +
          '<div class="field"><label class="label">Video minutes</label><input class="input" type="number" id="ctVid" value="20"></div>' +
          '<div class="field"><label class="label">Question minutes</label><input class="input" type="number" id="ctQs" value="35"></div>' +
        '</div>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="ctSave">Add topic</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#ctSave").onclick = function () {
          const name = box.querySelector("#ctName").value.trim();
          if (!name) { UI.toast("Give the topic a name", "bad"); return; }
          let newId;
          Store.mutate(function () {
            newId = Store.addCustomSub({
              name: name, paperId: box.querySelector("#ctPaper").value,
              reqs: box.querySelector("#ctReqs").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean),
              importance: UI.num(box.querySelector("#ctImp").value, 3),
              vid: UI.num(box.querySelector("#ctVid").value, 20),
              qs: UI.num(box.querySelector("#ctQs").value, 35)
            });
          });
          Scheduler.regenerate("custom topic added");
          UI.closeModal(); UI.toast("Topic added", "ok");
          go("topic", { id: newId });
        };
      }
    });
  }

  /* ---------- retake the RAG assessment ---------- */
  function retakeModal() {
    const isFocus = Store.isFocus();
    const all = Store.activeSubIds();
    const unit = isFocus ? "chapters" : "topics";
    const topicCount = Store.allSectionIds().length;
    const chapterCount = ALL_CHAPTER_IDS.length;
    const count = function (fn) { return all.filter(fn).length; };
    const nWeak = count(function (id) {
      const e = Metrics.effectiveRag(id).rag;
      return e === "red" || e === "amber" || !Store.topic(id).rag;
    });
    const nUnrated = count(function (id) { return !Store.topic(id).rag; });
    const nStale = count(function (id) {
      const d = Metrics.daysSinceRevised(id); return d === null || d >= 5;
    });
    const opt = function (scope, title, desc, n) {
      return '<button class="retake-opt" data-scope="' + scope + '"' + (n === 0 ? " disabled" : "") + '>' +
        '<div><b>' + UI.esc(title) + '</b><small>' + UI.esc(desc) + '</small></div>' +
        '<span class="pill' + (n === 0 ? "" : " acc") + '">' + n + '</span></button>';
    };
    const hist = (Store.get().assessments || []).slice(-4).reverse();
    UI.modal({
      title: "Retake your RAG assessment",
      body:
        '<div class="tiny muted">Re-rating is meant to be done often \u2014 your confidence moves as you revise, and the ' +
        'planner is only as good as the ratings you feed it. Pick how much you want to go through.</div>' +
        '<div class="field"><label class="label">Rate by</label>' +
          '<div class="chips">' +
            '<button class="chip' + (!isFocus ? " on" : "") + '" data-grain="topic">Individual topics <span class="tiny faint">(' + topicCount + ')</span></button>' +
            '<button class="chip' + (isFocus ? " on" : "") + '" data-grain="chapter">Whole chapters <span class="tiny faint">(' + chapterCount + ')</span></button>' +
          '</div>' +
          '<div class="tiny faint" style="margin-top:6px">Your ratings carry across when you switch \u2014 a chapter takes the weakest rating of its sections.</div>' +
        '</div>' +
        '<div class="retake-opts">' +
          opt("full", "Everything", "Re-rate all " + all.length + " " + unit + " from scratch", all.length) +
          opt("weak", "Weak only", "Just what is currently red, amber or unrated", nWeak) +
          opt("unrated", "Unrated only", "Fill in the gaps you skipped", nUnrated) +
          opt("stale", "Going stale", "Not revised in 5+ days, or never", nStale) +
        '</div>' +
        '<div class="field"><label class="label">\u2026or just one paper</label>' +
          '<div class="chips">' + SPEC.filter(function (p) { return paperOn(p.id); }).map(function (p) {
            return '<button class="chip" data-scope="paper" data-paper="' + p.id + '">' + UI.esc(p.short) + '</button>';
          }).join("") + '</div></div>' +
        (hist.length ? '<div style="border-top:1px solid var(--border);padding-top:14px">' +
          '<div class="tiny" style="font-weight:700;margin-bottom:8px">Your last few assessments</div>' +
          hist.map(function (a) {
            return '<div class="row tiny" style="padding:5px 0">' +
              '<span class="muted">' + new Date(a.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
              ' \u00b7 ' + UI.esc(a.grain === "chapter" ? "chapters" : "topics") + '</span><div class="spacer"></div>' +
              '<span class="pill bad">' + a.red + '</span><span class="pill warn">' + a.amber + '</span>' +
              '<span class="pill good">' + a.green + '</span></div>';
          }).join("") + '</div>' : ""),
      footer: '<button class="btn" data-c>Cancel</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelectorAll("[data-grain]").forEach(function (b) {
          b.onclick = function () {
            const wantChapter = b.dataset.grain === "chapter";
            if (wantChapter === Store.isFocus()) return;
            Store.mutate(function () { Store.setExamFocus(wantChapter); });
            UI.closeModal();
            retakeModal();
          };
        });
        box.querySelectorAll("[data-scope]").forEach(function (b) {
          b.onclick = function () {
            if (b.disabled) return;
            if (!OnboardingView.startRetake(b.dataset.scope, b.dataset.paper)) return;
            UI.closeModal();
            go("onboarding");
          };
        });
      }
    });
  }

  function doToggleFocus() {
    const turningOn = !Store.isFocus();
    Store.mutate(function () { Store.setExamFocus(turningOn); });
    Scheduler.regenerate(turningOn ? "switched to Exam-Focus (chapters)" : "switched to section-level revision");
    const c = Metrics.coverage();
    UI.toast(turningOn
      ? "Exam-Focus on, planning " + c.total + " chapters instead of individual sections. Your ratings carried across."
      : "Exam-Focus off, back to " + c.total + " specification sections.", "ok", 5200);
    render();
  }

  /* ---------- the chapter method: recording and continuing ---------- */
  function recordChapter(cid) {
    const qs = Journey.questionsFor(cid);
    const ans = Journey.answersFor(cid);
    let correct = 0, n = 0;
    Journey.selectedQuestions(cid).forEach(function (i) {
      const q = qs[i];
      const a = ans[i];
      if (a && a.recorded) { n++; if ((a.marksGot || 0) >= q.marks) correct++; }
    });
    /* the chapter is judged on both sources together, not the in-app bank alone */
    const sc = Metrics.chapterScore(cid);
    if (!n && !sc.exam.has) { UI.toast("Record at least one question first", "bad"); return; }
    const got = sc.overall.got, avail = sc.overall.avail;
    const pct = sc.overall.pct != null ? sc.overall.pct : 0;
    const mins = UI.num((document.getElementById("chMins") || {}).value, null);
    const diff = (document.getElementById("chDiff") || {}).value || "";
    const mistakes = (document.getElementById("chMistakes") || {}).value || "";
    const notes = (document.getElementById("chNotes") || {}).value || "";

    Store.mutate(function () {
      const t = Store.topic(cid);
      t.attempts.push({ date: Metrics.today(), questions: n, correct: correct,
        marksAvailable: avail, marksAchieved: got, pct: pct,
        /* the same score with exam questions weighted up -- what the rating
           is judged on, kept beside the plain one rather than replacing it */
        judgePct: sc.overall.judgePct, judgeWeighted: !!sc.overall.weighted,
        topicMarks: sc.topic.has ? { got: sc.topic.got, avail: sc.topic.avail, pct: sc.topic.pct } : null,
        examMarks: sc.exam.has ? { got: sc.exam.got, avail: sc.exam.avail, pct: sc.exam.pct } : null,
        minutes: mins, difficulty: diff, mistakes: mistakes, notes: notes });
      /* feed the existing engine so RAG adjustment and the planner still work.
      Carry the marks across too, accuracy() weights by marks so that
         part-marks count, rather than only fully-correct questions. */
      t.questionSets.push({ date: Metrics.today(), attempted: n, correct: correct, pct: pct,
        marksAvailable: avail, marksAchieved: got,
        minutes: mins, difficulty: diff, notes: notes, mistakes: mistakes });
      t.marked = true;
      t.lastRevised = Metrics.today();
      if (mins) Store.addTimeEntry(Store.info(cid).chapter.name + " \u2014 topic questions", "session", cid, mins);
      Store.log("Recorded " + got + "/" + avail + " on " + Store.info(cid).chapter.name, "session");
    });
    Scheduler.regenerate("chapter questions marked");
    UI.toast("Recorded " + got + "/" + avail + " (" + pct + "%). Now update your confidence.", "ok", 5000);
    render();
  }

  function addQuestionModal(cid) {
    UI.modal({
      title: "Add your own question",
      body:
        '<div class="tiny muted">Bring in a question from Yesterday\u2019s Maths Exam, PMT or a past paper. ' +
        'Type it out, or paste a screenshot \u2014 it is stored only in your browser.</div>' +
        '<div class="field"><label class="label">Question</label>' +
          '<textarea class="input" id="aqQ" placeholder="Type or paste the question…"></textarea></div>' +
        '<div class="field"><label class="label">Screenshot (optional)</label>' +
          '<input class="input" type="file" id="aqImg" accept="image/*"></div>' +
        '<div class="field" style="max-width:140px"><label class="label">Marks</label>' +
          '<input class="input" type="number" min="1" id="aqM" value="4"></div>' +
        '<div class="field"><label class="label">Mark scheme / worked answer</label>' +
          '<textarea class="input" id="aqMS" placeholder="Kept hidden until you press Reveal"></textarea></div>',
      footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="aqSave">Add question</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#aqSave").onclick = function () {
          const q = box.querySelector("#aqQ").value.trim();
          const ms = box.querySelector("#aqMS").value.trim();
          const marks = UI.num(box.querySelector("#aqM").value, 4);
          const file = box.querySelector("#aqImg").files[0];
          if (!q && !file) { UI.toast("Add the question text or a screenshot", "bad"); return; }
          const save = function (img) {
            Store.mutate(function () {
              Store.topic(cid).ownQuestions.push({ q: q || "(see screenshot)", marks: marks, ms: ms || "(no mark scheme added)", img: img || null, own: true });
            });
            UI.closeModal(); UI.toast("Question added", "ok"); render();
          };
          if (file) {
            if (file.size > 1500000) { UI.toast("That image is too large \u2014 keep it under 1.5MB", "bad"); return; }
            const r = new FileReader();
            r.onload = function () { save(r.result); };
            r.readAsDataURL(file);
          } else save(null);
        };
      }
    });
  }

  /* The one button that always knows what is next. */
  /* Open a chapter positioned on the step you stopped at, expanding the
  right question if questions are the live step, rather than dumping you
     at the top of the page to find your place again. */
  function resumeChapterAt(n) {
    ChapterView.setOpenQ(n.question != null ? n.question : null);
    Store.mutate(function () {
      Store.setLastPlace(n.chapterId, n.question != null ? { question: n.question } : {});
    }, { silent: true });
    go("chapter", { id: n.chapterId });
    focusStep(n.step, n.question);
  }

  /* Scroll the live step into view and mark it, once the view has painted. */
  /* render() is synchronous, so the step is already in the DOM by the time
     this runs. Deliberately NOT using requestAnimationFrame: browsers pause
     rAF in a hidden or background tab, so the callback would never fire and
     you would silently land at the top of the page instead of on your step.
     A zero-delay timeout still yields to layout but always runs. */
  function focusStep(step, question) {
    const order = ["video", "questions", "marked", "rag"];
    const idx = order.indexOf(step);
    setTimeout(function () {
      let target = null;
      if (question != null) {
        const head = document.querySelector('.qz-head[data-n="' + question + '"]');
        target = document.querySelector(".qz.open") || (head && head.closest(".qz"));
      }
      if (!target && idx >= 0) target = document.querySelectorAll(".sess-step")[idx];
      if (!target) return;
      /* go() kicks off a smooth scroll to the top; this runs after it and
         wins, landing you on the step rather than at the top of the page. */
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      const card = target.closest(".sess-step") || target;
      card.classList.add("resume-flash");
      setTimeout(function () { card.classList.remove("resume-flash"); }, 1600);
    }, 0);
  }

  function resumeBanner(n) {
    const lp = Store.lastPlace();
    const when = lp && lp.at ? Metrics.relativeTime(lp.at) : null;
    const stepName = { video: "the playlist", questions: "the topic questions",
                       marked: "marking your answers", rag: "your confidence rating" }[n.step] || "this chapter";
    return '<div class="continue-resume">' + UI.icon("refresh") +
    '<div>Picking up where you stopped' + (when ? " " + UI.esc(when) : "") + ', ' + UI.esc(stepName) +
      (n.question != null ? ', question ' + (n.question + 1) : "") + '.</div></div>';
  }

  function continueRevision() {
    const n = Journey.nextStep();
    UI.modal({
      title: "Continue revision",
      body:
        '<div class="continue-hero">' +
        '<div class="continue-kind">' + UI.esc({ assess: "Step 1, Assess", chapter: "Chapter revision", paper: "Past papers", done: "Done" }[n.kind] || "") + '</div>' +
          '<h3 style="font-size:20px;margin:6px 0 8px">' + UI.esc(n.title) + '</h3>' +
          '<div class="muted tiny">' + UI.esc(n.detail) + '</div>' +
        '</div>' +
        (n.resumed ? resumeBanner(n) : "") +
        (n.kind === "chapter" ? chapterStepStrip(n.state) : "") +
        journeyStrip(),
      footer: '<button class="btn" data-c>Not now</button>' +
              '<button class="btn btn-primary btn-lg" id="crGo">' + UI.esc(n.cta) + '</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#crGo").onclick = function () {
          UI.closeModal();
          if (n.action === "open-chapter") resumeChapterAt(n);
          else if (n.action === "go-papers") go("papers");
          else if (n.action === "resume-assess") {
            OnboardingView.goToStep(3);
            Store.mutate(function (st) {
              const ids = Store.activeSubIds();
              const i = ids.findIndex(function (x) { return !Store.topic(x).rag; });
              st.assessCursor = i < 0 ? 0 : i; st.assessmentDone = false;
            });
            go("onboarding");
          }
        };
      }
    });
  }

  function chapterStepStrip(st) {
    const order = ["video", "questions", "marked", "rag"];
    return '<div class="chapter-steps compact">' + order.map(function (k, i) {
      const s = st.steps[k];
      const cls = s.done ? "done" : (st.current === k ? "current" : "todo");
      return '<div class="chapter-step ' + cls + '">' +
        '<span class="chapter-step-n">' + (s.done ? UI.icon("check") : (i + 1)) + '</span>' +
        '<span class="chapter-step-l">' + Journey.STEPS[i].label +
        (s.total > 1 ? '<small>' + s.count + '/' + s.total + '</small>' : '') + '</span></div>';
    }).join("") + '</div>';
  }

  function journeyStrip() {
    const phases = Journey.allPhases();
    const cur = Journey.currentPhase();
    return '<div class="journey-strip">' + phases.map(function (p) {
      return '<div class="journey-phase' + (p.complete ? " done" : p.id === cur.id ? " current" : "") + '">' +
        '<div class="row"><b class="tiny">' + UI.esc(p.label) + '</b><div class="spacer"></div>' +
        '<span class="tiny faint">' + p.done + '/' + p.total + '</span></div>' +
        UI.bar(p.pct, "thin") + '</div>';
    }).join("") +
    '<div class="journey-phase' + (cur.id === "papers" ? " current" : "") + '">' +
      '<div class="row"><b class="tiny">Past papers</b><div class="spacer"></div>' +
      '<span class="tiny faint">' + Store.get().papers.length + '</span></div>' +
      UI.bar(cur.id === "papers" ? 100 : 0, "thin") + '</div>' +
    '</div>';
  }

  /* ---------- what Exam-Focus actually does ---------- */
  function focusInfoModal() {
    const on = Store.isFocus();
    const sections = Store.get().settings.examFocus
      ? "139" : String(Store.activeSubIds().length);
    UI.modal({
      title: "What is Exam-Focus?",
      body:
        '<div class="row" style="gap:14px;align-items:flex-start">' +
          '<div>' + UI.focusButton(on, true) + '</div>' +
          '<div class="tiny muted">Exam-Focus changes how big a chunk you revise at a time. ' +
          'It is currently <b style="color:var(--text)">' + (on ? "ON" : "OFF") + '</b> \u2014 ' +
          'click the dial in the top bar to switch.</div>' +
        '</div>' +
        '<div class="focus-compare">' +
          '<div class="focus-col">' +
            '<div class="focus-col-h">OFF \u2014 section by section</div>' +
            '<ul class="reqs">' +
              '<li>Works through <b>139 individual specification sections</b></li>' +
              '<li>A session covers one section, e.g. <i>12.9 Stationary points</i></li>' +
              '<li>The RAG assessment asks you 139 questions</li>' +
              '<li>Thorough, but slow \u2014 better when you have months, not days</li>' +
            '</ul>' +
          '</div>' +
          '<div class="focus-col on">' +
            '<div class="focus-col-h">ON \u2014 chapter by chapter</div>' +
            '<ul class="reqs">' +
              '<li>Works through <b>25 chapters</b> instead</li>' +
              '<li>A session covers a whole chapter, e.g. <i>Chapter 12 Differentiation</i></li>' +
              '<li>Each one shows the <b>components that carry the marks</b>, the <b>traps that lose them</b>, and an exam-value rating</li>' +
              '<li>Links straight to Edexcel topic-sorted exam questions</li>' +
              '<li>The assessment is 25 questions, not 139</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="warnbox info"><b>Nothing is lost when you switch</b>' +
          'Your ratings carry across both ways. A chapter takes the <b>weakest</b> rating of its sections, and ' +
          'sections inherit their chapter\u2019s rating if they have none. Anything you rated yourself always ' +
          'beats an automatically derived rating.</div>' +
        '<div class="tiny faint">With ' + Metrics.daysLeft() + ' days left, chapter mode fits your remaining time ' +
          'considerably better \u2014 the planner will tell you either way if the workload does not fit.</div>',
      footer: '<button class="btn" data-c>Close</button>' +
              '<button class="btn btn-primary" id="fiToggle">' +
                (on ? "Switch to section by section" : "Turn Exam-Focus on") + '</button>',
      onMount: function (box) {
        box.querySelector("[data-c]").onclick = UI.closeModal;
        box.querySelector("#fiToggle").onclick = function () { UI.closeModal(); doToggleFocus(); };
      }
    });
  }

  /* ---------- live timer ---------- */
  function timerStartModal(label, kind, refId, onStart, taskId) {
    if (!Store.settings().timerPrompt) { if (onStart) onStart(false); return; }
    UI.modal({
      title: "Time this session?",
      body: '<div class="row" style="gap:14px;align-items:flex-start">' +
          '<div style="font-size:30px">\u23f1</div>' +
          '<div><div style="font-weight:700;margin-bottom:4px">' + UI.esc(label) + '</div>' +
          '<div class="tiny muted">A live timer runs in the top bar and today\u2019s time bar fills up as you work. ' +
          'You can pause it, and it logs automatically when you stop or finish the session.</div></div></div>' +
        (Store.get().timer ? '<div class="warnbox">A timer is already running on \u201c' + UI.esc(Store.get().timer.label) +
          '\u201d. Starting a new one will stop and log that first.</div>' : ""),
      footer: '<label class="switch" style="margin-right:auto"><input type="checkbox" id="tsAsk"><i></i>' +
                '<span class="tiny">Don\u2019t ask again</span></label>' +
              '<button class="btn" id="tsNo">Just start</button>' +
              '<button class="btn btn-primary" id="tsYes">Start with timer</button>',
      onMount: function (box) {
        const remember = function () {
          if (box.querySelector("#tsAsk").checked) {
            Store.mutate(function (st) { st.settings.timerPrompt = false; });
          }
        };
        box.querySelector("#tsNo").onclick = function () { remember(); UI.closeModal(); if (onStart) onStart(false); };
        box.querySelector("#tsYes").onclick = function () {
          remember();
          Store.mutate(function () {
            if (Store.get().timer) Store.timerStop(true);
            Store.timerStart(label, kind, refId, taskId);
          });
          UI.closeModal();
          if (onStart) onStart(true);
          render();
        };
      }
    });
  }

  const TIME_KIND = {
    task: "Task ticked off", session: "Revision session", paper: "Past paper",
    manual: "Added by hand", adhoc: "Timer"
  };

  /* Add, edit or remove any of today's logged time. */
  function logTimeModal() {
    const d = Metrics.today();

    const rows = function () {
      const entries = Store.timeEntriesOn(d);
      if (!entries.length) {
        return '<div class="tiny faint" style="padding:10px 0">Nothing logged today yet.</div>';
      }
      return '<div class="timelog">' + entries.map(function (e, i) {
        const when = new Date(e.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        return '<div class="timelog-row" data-row="' + i + '">' +
          '<div class="timelog-main">' +
            '<b>' + UI.esc(e.label || "Study") + '</b>' +
            '<small>' + UI.esc(TIME_KIND[e.kind] || e.kind || "Study") + ' \u00b7 ' + when +
              (e.edited ? " \u00b7 edited" : "") + '</small>' +
          '</div>' +
          '<div class="timelog-mins">' +
            '<input class="input" type="number" min="0" step="5" value="' + (e.minutes || 0) + '" data-mins="' + i + '">' +
            '<span class="tiny faint">min</span>' +
          '</div>' +
          '<button class="btn btn-sm btn-danger" data-del="' + i + '" title="Remove this entry">\u2715</button>' +
        '</div>';
      }).join("") + '</div>';
    };

    const totalLine = function () {
      const total = Store.timeLoggedOn(d);
      const budget = Scheduler.budgetFor(d);
      const pct = budget > 0 ? Math.round(total / budget * 100) : 0;
      return '<div class="row" style="border-top:1px solid var(--border);padding-top:12px">' +
        '<b>Total logged today</b><div class="spacer"></div>' +
        '<b style="font-family:var(--font-display);font-size:16px">' + Metrics.fmtMins(total) + '</b>' +
        '<span class="pill">' + pct + '% of ' + Metrics.fmtMins(budget) + '</span></div>';
    };

    UI.modal({
      title: "Time logged today",
      body:
        '<div class="tiny muted">Change a number to correct it, or press \u2715 to remove an entry you did not mean to log.</div>' +
        '<div id="ltRows">' + rows() + '</div>' +
        '<div id="ltTotal">' + totalLine() + '</div>' +
        '<div style="border-top:1px solid var(--border);padding-top:16px">' +
          '<div style="font-weight:700;margin-bottom:10px">Add an entry</div>' +
          '<div class="form-grid">' +
            '<div class="field"><label class="label">What on?</label>' +
              '<input class="input" id="ltLabel" placeholder="e.g. Chapter 12 questions"></div>' +
            '<div class="field"><label class="label">Minutes</label>' +
              '<input class="input" type="number" min="1" step="5" id="ltMins" value="30"></div>' +
          '</div>' +
          '<button class="btn btn-primary btn-block" style="margin-top:12px" id="ltAdd">Add time</button>' +
        '</div>',
      footer: (Store.timeEntriesOn(d).length
                ? '<button class="btn btn-danger" id="ltClear" style="margin-right:auto">Clear the whole day</button>' : "") +
              '<button class="btn btn-primary" data-c>Done</button>',
      onMount: function (box) {
        const refresh = function () {
          box.querySelector("#ltRows").innerHTML = rows();
          box.querySelector("#ltTotal").innerHTML = totalLine();
          bind();
          render();
        };
        const bind = function () {
          box.querySelectorAll("[data-del]").forEach(function (b) {
            b.onclick = function () {
              let removed = null;
              Store.mutate(function () { removed = Store.removeTimeEntry(d, +b.dataset.del); });
              if (removed) UI.toast("Removed " + Metrics.fmtMins(removed.minutes) + " \u2014 " + removed.label, "ok");
              refresh();
            };
          });
          box.querySelectorAll("[data-mins]").forEach(function (inp) {
            inp.onchange = function () {
              const v = UI.num(inp.value, 0);
              Store.mutate(function () { Store.setTimeEntryMinutes(d, +inp.dataset.mins, v); });
              box.querySelector("#ltTotal").innerHTML = totalLine();
              render();
            };
          });
        };
        bind();
        box.querySelector("[data-c]").onclick = function () { UI.closeModal(); render(); };
        const clr = box.querySelector("#ltClear");
        if (clr) clr.onclick = function () {
          UI.confirm("Clear today's time log?", "Every entry logged today will be removed. Your tasks and ratings are untouched.", "Clear the day", true)
            .then(function (ok) {
              if (!ok) return;
              Store.mutate(function () { Store.clearTimeLog(d); });
              UI.toast("Today's time log cleared", "ok");
              UI.closeModal(); render();
            });
        };
        box.querySelector("#ltAdd").onclick = function () {
          const mins = UI.num(box.querySelector("#ltMins").value, 0);
          if (!mins) { UI.toast("Enter a number of minutes", "bad"); return; }
          const label = box.querySelector("#ltLabel").value.trim() || "Study";
          Store.mutate(function () { Store.addTimeEntry(label, "manual", null, mins); });
          box.querySelector("#ltLabel").value = "";
          UI.toast("Logged " + Metrics.fmtMins(mins), "ok");
          refresh();
        };
      }
    });
  }

  /* Update the clock and any time bars once a second, without re-rendering
     the whole view (which would steal focus from inputs). */
  function tick() {
    const t = Store.get().timer;
    const chip = document.getElementById("timerChip");
    if (t && !chip) { document.getElementById("timerSlot").innerHTML = UI.timerChip(); return; }
    if (!t) { if (chip) document.getElementById("timerSlot").innerHTML = ""; return; }
    const total = Math.floor(Store.timerElapsedMs() / 1000);
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), sec = total % 60;
    const clock = (h ? h + ":" + String(m).padStart(2, "0") : String(m)) + ":" + String(sec).padStart(2, "0");
    const el = chip.querySelector(".timer-clock");
    if (el) el.textContent = clock;
    if (t.running) refreshTimeBars();
  }

  function refreshTimeBars() {
    const done = Metrics.timeDoneToday();
    const live = !!(Store.get().timer && Store.get().timer.running);
    document.querySelectorAll("[data-timebar]").forEach(function (wrap) {
      const budget = +wrap.dataset.timebar || 0;
      const pct = budget > 0 ? Math.min(100, (done / budget) * 100) : 0;
      const fill = wrap.querySelector(".timebar-fill");
      const pctEl = wrap.querySelector(".timebar-pct");
      const doneEl = wrap.querySelector(".timebar-done");
      if (fill) fill.style.width = pct.toFixed(1) + "%";
      if (pctEl) { pctEl.textContent = Math.round(pct) + "%"; pctEl.classList.toggle("done", pct >= 100); }
      if (doneEl) doneEl.innerHTML = Metrics.fmtMins(done) +
        '<span class="timebar-of"> of ' + Metrics.fmtMins(budget) + '</span>';
      wrap.classList.toggle("full", pct >= 100);
      wrap.classList.toggle("live", live);
    });
  }

  /* Commit a loose date entry. Anything unparseable is put back to the stored
     value rather than left sitting there looking accepted, and the plan is
     regenerated because every deadline in it is measured from this date. */
  function commitExamDate(fieldId, text) {
    const stored = Store.settings().examDate;
    const parsed = UI.parseLooseDate(text, stored);
    const box = document.getElementById(fieldId);
    const pick = document.getElementById(fieldId + "-pick");
    const hint = document.getElementById(fieldId + "-hint");

    if (!parsed) {
      if (box) box.value = UI.fmtLoose(stored);
      if (hint) hint.textContent = UI.hintFor(stored);
      if (String(text || "").trim()) UI.toast("Could not read that as a date, so it was left unchanged", "warn", 4000);
      return;
    }

    if (box) box.value = UI.fmtLoose(parsed.iso);
    if (pick) pick.value = parsed.iso;
    if (hint) hint.textContent = UI.hintFor(parsed.iso);

    if (parsed.iso === stored) return;          // nothing actually changed
    Store.mutate(function (st) { st.settings.examDate = parsed.iso; });
    Scheduler.regenerate("exam date changed");
    UI.toast("Exam date set to " + UI.fmtLoose(parsed.iso) + ", plan recalculated", "ok", 4000);
    renderCountdown();
  }

  /* ---------- boot ---------- */
  function boot() {
    /* Order matters. Subjects builds the spec globals everything reads, and
       Auth decides which profile's save file Store.init() then opens. */
    Subjects.activate(Subjects.remembered());
    Auth.init();
    Store.init();
    applyTheme();
    renderBrand();
    /* Keep the corner in step with the subject however it was switched, not
       only when the switch came from the menu. */
    Subjects.onChange(function () {
      renderBrand();
      TopicsView.resetFilters();
    });

    /* A Supabase session outlives a refresh, and Google sign-in comes back
       through a redirect, so both are resolved after the first paint rather
       than blocking it. Once the session is known, the state is reloaded for
       that account and reconciled with the server. */
    if (Cloud.configured()) {
      Sync.init();
      Auth.restoreCloudSession().then(function (profile) {
        if (!profile) { render(); return; }
        Store.reloadForUser();
        render();
        Sync.pullOnSignIn(profile.cloudId).then(function (r) {
          if (r.action === "pulled") { render(); UI.toast("Progress restored from your account", "ok"); }
          else if (r.action === "conflict") { render(); UI.toast("Two copies of your progress found, see Settings", "warn", 6000); }
          else render();
        });
      });
      Sync.on(function () { renderSyncChip(); });
    }

    document.addEventListener("click", onClick);

    /* Delegated form handling. Views render into a detached buffer, so they
       cannot attach handlers to their own nodes afterwards. */
    document.addEventListener("input", function (e) {
      const el = e.target;
      if (el.id === "topicSearch") { TopicsView.setSearch(el.value); return; }
      if (el.dataset && el.dataset.s) { SessionView.setField(el.dataset.s, el.value); return; }
    });
    document.addEventListener("change", function (e) {
      const el = e.target;
      if (el.id === "importFile") { SettingsView.importFile(e); return; }
      /* The native picker beside a loose date field: mirror it back. */
      if (el.id && el.id.endsWith("-pick")) { commitExamDate(el.id.replace("-pick", ""), el.value); return; }
      if (el.dataset && el.dataset.s) {
        SessionView.setField(el.dataset.s, el.type === "checkbox" ? el.checked : el.value);
        return;
      }
    });

    /* Clicking away from a date field commits what was typed, so a half
       finished entry is completed rather than thrown away. focusout is used
       rather than blur because blur does not bubble to the document. */
    document.addEventListener("focusout", function (e) {
      const el = e.target;
      if (!el || !el.id) return;
      const wrap = el.closest && el.closest("[data-datefield]");
      if (wrap && el.type === "text") commitExamDate(el.id, el.value);
    });

    /* Enter should commit too, without waiting for focus to move. */
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      const el = e.target;
      if (el && el.closest && el.closest("[data-datefield]") && el.type === "text") {
        e.preventDefault();
        commitExamDate(el.id, el.value);
        el.blur();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { UI.closeModal(); setSidebar(false); }
      if (current === "onboarding" && !document.getElementById("modalRoot").classList.contains("on")) {
        const tag = (document.activeElement.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea" && tag !== "select") OnboardingView.keydown(e);
      }
    });

    document.getElementById("themeToggle").onclick = function () {
      Store.mutate(function (st) { st.settings.theme = st.settings.theme === "dark" ? "light" : "dark"; });
      applyTheme(); render();
    };
  document.getElementById("menuBtn").onclick = function (e) {
    e.stopPropagation(); // don't let this click immediately re-close it
    setSidebar(!document.getElementById("sidebar").classList.contains("open"));
    };
  /* Tapping the dimmer, i.e. anywhere off the sidebar, puts it back. */
  document.getElementById("sidebarScrim").onclick = function () { setSidebar(false); };
  /* Following a link inside the sidebar closes it too (see go()). */
  document.getElementById("sidebar").addEventListener("click", function (e) {
    if (e.target.closest(".nav-item")) setSidebar(false);
  });
    document.getElementById("whatNowBtn").onclick = continueRevision;

    /* The player knows things we were only estimating, how many videos the
       playlist really has, and how long each one is. Record them as they
       come in so "total video time" becomes measured rather than guessed,
       without you typing anything. */
    YtPlayer.onMeta(function (meta) {
      const cid = meta.host && meta.host.dataset ? meta.host.dataset.cid : null;
      if (!cid || !CHAPTER_INDEX[cid]) return;
      let changed = false;
      Store.mutate(function () {
        const t = Store.topic(cid);
        if (meta.count > 0) {
          /* always remember what YouTube says, so the "which videos count"
          dialog can show it, but only apply it if you have not set the
             count yourself. Otherwise excluding the adverts would be undone
             the moment the player loaded. */
          if (t.videoDetectedTotal !== meta.count) { t.videoDetectedTotal = meta.count; changed = true; }
          if (!t.videoTotalManual && t.videoTotal !== meta.count) {
            t.videoTotal = meta.count;
            /* a shorter playlist than we thought must not leave ticks for
               episodes that do not exist */
            t.videoWatched = (t.videoWatched || []).filter(function (n) { return n <= meta.count; });
            t.videoDone = t.videoWatched.length >= meta.count;
            changed = true;
          }
        }
        /* Follow the player rather than fight it. If you skip videos using
        YouTube's own controls, the app must adopt that position - otherwise the next re-render would "correct" the player and yank
           you back to where the app thought you were. */
        if (meta.episode && t.currentEpisode !== meta.episode) {
          t.currentEpisode = meta.episode;
          changed = true;
        }
        if (meta.episode && meta.seconds > 0) {
          const mins = Math.max(1, Math.round(meta.seconds / 60));
          if (!t.videoDurations) t.videoDurations = {};
          if (t.videoDurations[meta.episode] !== mins) {
            t.videoDurations[meta.episode] = mins;
            changed = true;
          }
        }
      }, { silent: true });
      if (changed && current === "chapter" && params.id === cid) render();
    });

    const st = Store.get();
    current = st.onboarded ? "dashboard" : "onboarding";

    /* keep the plan honest across day boundaries */
    if (st.onboarded && st.plan) {
      const lastGen = st.plan.generatedAt ? st.plan.generatedAt.slice(0, 10) : null;
      if (lastGen !== Metrics.today()) Scheduler.regenerate("new day");
    }

    render();
    setInterval(tick, 1000);

    /* a running timer should survive a refresh */
    window.addEventListener("beforeunload", function () {
      if (Store.get().timer) Store.mutate(function () { Store.timerPause(); }, { immediate: true });
    });
  }

  return { boot: boot, render: render, go: go, applyTheme: applyTheme, params: function () { return params; },
           whatNowModal: whatNowModal, retakeModal: retakeModal,
           timerStartModal: timerStartModal, refreshTimeBars: refreshTimeBars,
           flashcardExportModal: flashcardExportModal, flashcardImportModal: flashcardImportModal,
           flashcardAddModal: flashcardAddModal };
})();

document.addEventListener("DOMContentLoaded", App.boot);
