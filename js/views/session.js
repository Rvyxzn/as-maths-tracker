/* ============================================================
Revision session, BEFORE → VIDEO → PRACTICE → REVIEW → COMPLETE
   ============================================================ */

const SessionView = (function () {

  let s = null; // working session state

  function start(id, taskId) {
    const t = Store.topic(id);
    s = {
      id: id, taskId: taskId || null,
      ragBefore: t.rag,
      preNotes: "",
      videoUrl: t.videoUrl || "",
      videoDone: false,
      attempted: "", correct: "", minutes: "", difficulty: "", notes: "", mistakes: "",
      marked: false,
      ragAfter: null, wentWrong: "",
      startedAt: Date.now()
    };
  }

  function ensure(id) { if (!s || s.id !== id) start(id); }

  function pctNow() {
    const a = UI.num(s.attempted), c = UI.num(s.correct);
    if (!a || c == null) return null;
    return Math.round((c / a) * 100);
  }

  function render(root, id, taskId) {
    if (!s || s.id !== id) start(id, taskId);
    const inf = Store.info(id);
    if (!inf) { root.innerHTML = UI.empty("❓", "Topic not found"); return; }
    const t = Store.topic(id);
    const eff = Metrics.effectiveRag(id);
    const m = subMinutes(inf.sub);
    const pct = pctNow();
    const ph = Metrics.phase();
    const skipVideo = (ph.key === "final" || ph.key === "eve") && t.questionSets.length > 0;

    root.innerHTML =
      '<button class="btn btn-sm btn-ghost" data-action="session-exit" style="margin-bottom:14px">← Leave session</button>' +
      '<div class="card" style="margin-bottom:18px">' +
        '<div class="row wrap" style="gap:10px">' +
          '<div style="flex:1;min-width:0">' +
            '<div class="assess-path">' + UI.esc(inf.paper.short + " · " + inf.chapterLabel) + '</div>' +
            '<h2 style="font-size:23px;margin:6px 0 0">' +
            (inf.sub.code ? '<span class="code">' + UI.esc(inf.sub.code) + '</span>' : "") +
            UI.esc(inf.sub.name) + UI.yearPill(inf.year) + '</h2>' +
            '<div class="tiny muted" style="margin-top:5px">' +
              (Store.get().timer && Store.get().timer.refId === id
                ? '<span class="pill good">\u23f1 timing this session</span> \u00b7 ' : "") +
              'Estimated ' + Metrics.fmtMins(m.video + m.questions + m.review) +
              ' · video ' + m.video + ' min · questions ' + m.questions + ' min · review ' + m.review + ' min</div>' +
          '</div>' + UI.ragPill(eff.rag) +
        '</div>' +
      '</div>' +

      '<div class="stack" style="gap:14px">' +
        step1(inf, t, eff) +
        step2(t, skipVideo) +
        step3(pct, m) +
        step4() +
        step5(pct) +
      '</div>';
  }

  /* called by the delegated input handler in app.js */
  function setField(key, value) {
    if (!s) return;
    s[key] = value;
    if (key === "attempted" || key === "correct" || key === "videoDone" || key === "marked") App.render();
  }

  function weightPill(w) {
    const label = w >= 5 ? "Very high value" : w >= 4 ? "High value" : w >= 3 ? "Moderate" : "Lower value";
    const cls = w >= 5 ? "bad" : w >= 4 ? "warn" : "";
    return '<span class="pill ' + cls + '" title="How much this chapter is worth in the exam">' +
      "\u2605".repeat(Math.max(1, Math.min(5, w))) + " " + label + '</span>';
  }

  function stepShell(n, title, doneFlag, body, sub) {
    return '<div class="sess-step">' +
      '<div class="sess-head"><div class="sess-n ' + (doneFlag ? "done" : "") + '">' + (doneFlag ? "✓" : n) + '</div>' +
        '<div><div class="sess-title">' + UI.esc(title) + '</div>' +
        (sub ? '<div class="tiny muted">' + UI.esc(sub) + '</div>' : "") + '</div></div>' +
      '<div class="sess-body">' + body + '</div></div>';
  }

  function step1(inf, t, eff) {
    const ch = inf.sub.isChapter;
    return stepShell(1, ch ? "Before you start \u2014 what this chapter is worth" : "Before you start", true,
      '<div class="row wrap" style="gap:10px"><span class="tiny muted">Current confidence:</span>' + UI.ragPill(eff.rag) +
        (eff.adjusted ? '<span class="tiny faint">(you rated it ' + eff.base + ', adjusted by your scores)</span>' : "") +
        (ch ? '<div class="spacer"></div>' + weightPill(inf.sub.importance) : "") + '</div>' +
      (ch && inf.sub.summary ? '<div class="focus-banner">' + UI.esc(inf.sub.summary) + '</div>' : "") +
      (ch && inf.sub.marks ? '<div class="tiny muted"><b>Typically worth:</b> ' + UI.esc(inf.sub.marks) + '</div>' : "") +
      '<div><div style="font-weight:700;font-size:13px;margin-bottom:6px">' +
        (ch ? "The components that actually carry the marks" : "What you need to be able to do") + '</div>' +
        '<ul class="reqs">' + inf.sub.reqs.map(function (r) { return "<li>" + UI.math(r) + "</li>"; }).join("") + '</ul></div>' +
      (ch && inf.sub.traps && inf.sub.traps.length
        ? '<div><div style="font-weight:700;font-size:13px;margin-bottom:6px;color:var(--red)">Where marks get thrown away</div>' +
          '<ul class="reqs">' + inf.sub.traps.map(function (r) { return "<li>" + UI.math(r) + "</li>"; }).join("") + '</ul></div>'
        : "") +
      (ch ? '<div class="tiny faint">Weighting is an editorial judgement from the specification\u2019s assessment structure ' +
        'and recurring question patterns \u2014 Pearson do not publish a per-topic frequency count.</div>' : "") +
      (t.notes ? '<div class="warnbox info"><b>Your notes on this topic</b>' + UI.esc(t.notes) + '</div>' : "") +
      lastTimeBox(t) +
      '<div class="field"><label class="label">Before starting, what do you think you can already do here? (optional)</label>' +
        '<textarea class="input" data-s="preNotes" placeholder="e.g. I can solve sin x = 0.5 but I get lost when it is sin(2x + 30)">' + UI.esc(s.preNotes) + '</textarea></div>',
      "Read the requirements and be honest about the gaps");
  }

  function lastTimeBox(t) {
    if (!t.questionSets.length) return "";
    const q = t.questionSets[t.questionSets.length - 1];
    return '<div class="warnbox"><b>Last time on this topic (' + Metrics.fmtDate(q.date) + ')</b>' +
      'You scored ' + q.correct + '/' + q.attempted + ' (' + q.pct + '%).' +
      (q.mistakes ? ' What went wrong: ' + UI.esc(q.mistakes) : "") + '</div>';
  }

  function step2(t, skipVideo) {
    return stepShell(2, "Watch the chapter summary", s.videoDone,
      '<div class="tiny muted">Paste the Zeeshan Zamured chapter summary video for this topic. The link is saved against the topic, ' +
      'so you only ever have to find it once. Nothing here is auto-detected, you decide when it counts as watched.</div>' +
      '<div class="row wrap" style="gap:8px">' +
        '<input class="input" data-s="videoUrl" placeholder="https://www.youtube.com/watch?v=…" value="' + UI.esc(s.videoUrl) + '" style="flex:1;min-width:200px">' +
        '<button class="btn" data-action="session-save-video">Save link</button>' +
        (s.videoUrl ? '<a class="btn btn-primary" href="' + UI.esc(s.videoUrl) + '" target="_blank" rel="noopener">▶ Open</a>' : "") +
      '</div>' +
      (skipVideo ? '<div class="warnbox"><b>Final week, video suppressed</b>You have already done questions on this topic. ' +
        'Rewatching a full summary video now is poor value; go straight to questions unless you are genuinely lost.</div>' : "") +
      '<label class="switch"><input type="checkbox" data-s="videoDone"' + (s.videoDone ? " checked" : "") + '><i></i>' +
        '<span>Video watched</span></label>' +
        (t.videoDone && !s.videoDone ? '<div class="tiny faint">You have watched this topic’s video before, ticking again is optional.</div>' : ""),
        "Manual, the app never assumes you watched anything");
  }

  function step3(pct, m) {
    const done = pct != null;
    const inf3 = Store.info(s.id);
    return stepShell(3, "Exam-style questions", done,
      (inf3 && inf3.sub.qUrl
        ? '<a class="btn btn-primary" href="' + UI.esc(inf3.sub.qUrl) + '" target="_blank" rel="noopener">' +
            'Open Edexcel topic questions for this chapter \u2197</a>' +
          '<div class="tiny faint">Topic-sorted past-paper questions with mark schemes on Physics &amp; Maths Tutor, ' +
          'split AS / A level \u2014 use the AS sets.</div>'
        : "") +
      '<div class="tiny muted">Aim for ' + Math.max(6, Math.round(m.questions / 4)) + '-' + Math.round(m.questions / 3) +
        ' exam-style questions. Do them, then mark them honestly against the mark scheme.</div>' +
      '<div class="form-grid">' +
        numField("Number attempted", "attempted", s.attempted) +
        numField("Number correct", "correct", s.correct) +
        '<div class="field"><label class="label">Score</label>' +
          '<div class="input" style="display:flex;align-items:center;font-weight:800;' +
            (pct == null ? "color:var(--faint)" : pct >= 75 ? "color:var(--green)" : pct >= 55 ? "color:var(--amber)" : "color:var(--red)") + '">' +
            (pct == null ? "n/a" : pct + "%") + '</div></div>' +
        numField("Time taken (min)", "minutes", s.minutes) +
        '<div class="field"><label class="label">Difficulty</label><select class="input" data-s="difficulty">' +
          ["", "Easy", "Comfortable", "Challenging", "Very hard"].map(function (d) {
            return '<option value="' + d + '"' + (s.difficulty === d ? " selected" : "") + '>' + (d || "n/a") + '</option>';
          }).join("") + '</select></div>' +
      '</div>' +
      '<div class="field"><label class="label">Mistakes made</label>' +
        '<textarea class="input" data-s="mistakes" placeholder="e.g. forgot the second solution in the interval; sign error expanding brackets">' + UI.esc(s.mistakes) + '</textarea></div>' +
      '<div class="field"><label class="label">Notes (optional)</label>' +
        '<textarea class="input" data-s="notes" placeholder="Method to remember, page reference, anything worth keeping">' + UI.esc(s.notes) + '</textarea></div>' +
      '<label class="switch"><input type="checkbox" data-s="marked"' + (s.marked ? " checked" : "") + '><i></i>' +
        '<span>I have marked / checked my answers against the mark scheme</span></label>',
        "This matters more than the video, it is the evidence you can actually score marks");
  }

  function numField(label, key, val) {
    return '<div class="field"><label class="label">' + label + '</label>' +
      '<input class="input" type="number" min="0" data-s="' + key + '" value="' + UI.esc(val) + '"></div>';
  }

  function step4() {
    const pct = pctNow();
    let hint = "";
    if (pct != null) {
      if (pct < 50) hint = "You scored " + pct + "%. Be honest, this is probably still RED.";
      else if (pct < 70) hint = "You scored " + pct + "%. AMBER is likely the truthful answer.";
      else if (pct >= 85) hint = "You scored " + pct + "%. GREEN is defensible if you did those unaided and under time.";
      else hint = "You scored " + pct + "%. Somewhere between AMBER and GREEN.";
    }
  return stepShell(4, "Review, how confident are you now?", !!s.ragAfter,
      (hint ? '<div class="warnbox info">' + UI.esc(hint) + ' Whatever you choose, your score will override an over-optimistic rating.</div>' : "") +
      UI.ragPicker(s.ragAfter, "session-rag-after", s.id, true) +
      '<div class="field"><label class="label">What went wrong? (optional)</label>' +
        '<textarea class="input" data-s="wentWrong" placeholder="e.g. I know the identity but I keep losing solutions when the interval is in terms of 2x">' + UI.esc(s.wentWrong) + '</textarea></div>',
      "Your rating plus your score decide when this comes back");
  }

  function step5(pct) {
    const t = Store.topic(s.id);
    const willCover = (t.videoDone || s.videoDone) && (t.questionSets.length || pct != null) && (t.marked || s.marked) && s.ragAfter;
    const nextIso = Metrics.nextReviewDate(s.id, Metrics.today());
    return stepShell(5, "Complete the session", false,
      '<div class="tiny muted">Saving updates the topic status, recalculates its priority and reschedules it.</div>' +
      '<div class="row wrap" style="gap:8px">' +
        (willCover ? '<span class="pill good">Will be marked as COVERED</span>'
          : '<span class="pill warn">Will stay as NOT COVERED, video, marked questions and a post-rating are all required</span>') +
        '<span class="pill">Next review around ' + Metrics.fmtDate(nextIso) + '</span>' +
      '</div>' +
      '<div class="row wrap" style="gap:8px">' +
        '<button class="btn btn-primary btn-lg" data-action="session-complete">Save and complete session</button>' +
        '<button class="btn" data-action="session-exit">Cancel</button>' +
      '</div>',
      "");
  }


  function handle(action, el) {
    if (!s) return false;
    switch (action) {
      case "session-rag-after":
        s.ragAfter = el.dataset.v; App.render(); return true;

      case "session-save-video": {
        const url = (document.querySelector('[data-s="videoUrl"]') || {}).value || "";
        s.videoUrl = url;
        Store.mutate(function (st) { st.topics[s.id].videoUrl = url; });
        UI.toast(url ? "Video link saved for this topic" : "Video link cleared", "ok");
        App.render(); return true;
      }

      case "session-exit":
        s = null; App.go("today"); return true;

      case "session-complete": return complete();
    }
    return false;
  }

  function complete() {
    const id = s.id;
    const pct = pctNow();
    const attempted = UI.num(s.attempted), correct = UI.num(s.correct);

    if (attempted && correct != null && correct > attempted) {
      UI.toast("Correct cannot be more than attempted", "bad"); return true;
    }
    if (!s.ragAfter && pct == null && !s.videoDone) {
      UI.toast("Record something first, video watched, questions, or a new rating", "warn"); return true;
    }

    Store.mutate(function (st) {
      const t = st.topics[id];
      if (s.videoDone) t.videoDone = true;
      if (s.videoUrl) t.videoUrl = s.videoUrl;
      if (pct != null) {
        t.questionSets.push({
          date: Metrics.today(), attempted: attempted, correct: correct, pct: pct,
          minutes: UI.num(s.minutes, null), difficulty: s.difficulty, notes: s.notes, mistakes: s.mistakes
        });
      }
      if (s.marked) t.marked = true;
      if (s.ragAfter) t.rag = s.ragAfter;
      const extra = [s.preNotes && ("Before: " + s.preNotes), s.wentWrong && ("What went wrong: " + s.wentWrong)]
        .filter(Boolean).join("\n");
      if (extra) t.notes = (t.notes ? t.notes + "\n" : "") + "[" + Metrics.today() + "] " + extra;
    });

    /* if a timer was running for this session, bank it as the time spent */
    let timedMins = null;
    const liveTimer = Store.get().timer;
    if (liveTimer && liveTimer.refId === id) {
      Store.mutate(function () { timedMins = Store.timerStop(true); });
    }

    /* No timer? Still count the session towards today, using the time you
       recorded, or the planned length of the task as a fallback. */
    if (timedMins === null) {
      const already = (Store.get().timeLog[Metrics.today()] || [])
        .some(function (e) { return s.taskId && e.taskId === s.taskId; });
      if (!already) {
        const task = s.taskId
          ? Scheduler.tasksFor(Metrics.today()).filter(function (x) { return x.id === s.taskId; })[0]
          : null;
        const m = subMinutes(Store.info(id).sub);
        const mins = UI.num(s.minutes, null) || (task ? task.minutes : m.video + m.questions + m.review);
        if (mins > 0) {
          Store.mutate(function () {
            Store.addTimeEntry(Store.info(id).sub.name, "session", id, mins, s.taskId || null);
          });
        }
      }
    }

    Scheduler.completeSession(id, {
      type: "revision", ragBefore: s.ragBefore, ragAfter: s.ragAfter,
      minutes: UI.num(s.minutes, timedMins), notes: s.wentWrong || s.notes || ""
    });

    if (s.taskId) Scheduler.setTaskStatus(s.taskId, "done");

    const eff = Metrics.effectiveRag(id);
    let msg = "Session saved.";
    if (s.ragAfter && eff.rag !== s.ragAfter) {
      msg += " Your rating of " + s.ragAfter.toUpperCase() + " was adjusted to " + eff.rag.toUpperCase() + " based on your score.";
    }
    msg += " Schedule updated.";
    UI.toast(msg, "ok", 5200);
    s = null;
    App.go("today");
    return true;
  }

  return { render: render, handle: handle, start: start, ensure: ensure, setField: setField };
})();
