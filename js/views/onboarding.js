/* ============================================================
Onboarding, welcome, exam setup, RAG explainer, assessment,
   revision map, generate plan.
   ============================================================ */

const OnboardingView = (function () {

  let step = 0; // 0 welcome, 1 setup, 2 explain, 3 assess, 4 map

  /* The assessment works through a queue, so a retake can cover everything,
     just the weak topics, or just one paper. No queue means "everything". */
  function list() {
    const q = Store.get().assessQueue;
    if (q && q.length) return q.filter(function (id) { return !!Store.info(id); });
    return Store.activeSubIds();
  }

  /* Build the queue for a retake and jump straight into it */
  function startRetake(scope, paperId) {
    const all = Store.activeSubIds();
    let ids = all;
    if (scope === "weak") {
      ids = all.filter(function (id) {
        const e = Metrics.effectiveRag(id).rag;
        return e === "red" || e === "amber" || !Store.topic(id).rag;
      });
    } else if (scope === "unrated") {
      ids = all.filter(function (id) { return !Store.topic(id).rag; });
    } else if (scope === "paper") {
      ids = all.filter(function (id) { return Store.info(id).paper.id === paperId; });
    } else if (scope === "stale") {
      ids = all.filter(function (id) {
        const d = Metrics.daysSinceRevised(id);
        return d === null || d >= 5;
      });
    }
  if (!ids.length) { UI.toast("Nothing matches that, every topic is already covered", "warn"); return false; }
    Store.mutate(function (st) {
      st.assessQueue = ids;
      st.assessCursor = 0;
      st.assessmentDone = false;
      st.assessScope = scope;
    });
    step = 3;
    return true;
  }

  /* Snapshot the RAG mix each time an assessment finishes, so Progress can
     show how your confidence has actually shifted over time. */
  function snapshot(st) {
    const c = Metrics.coverage();
    if (!st.assessments) st.assessments = [];
    st.assessments.push({
      at: new Date().toISOString(), scope: st.assessScope || "full",
      grain: st.settings.examFocus ? "chapter" : "topic",
      red: c.red, amber: c.amber, green: c.green, unrated: c.unassessed, total: c.total
    });
    if (st.assessments.length > 60) st.assessments.shift();
  }

  function dots(n) {
    let s = '<div class="steps">';
    for (let i = 0; i < 5; i++) s += '<div class="step-dot' + (i <= n ? " on" : "") + '"></div>';
    return s + "</div>";
  }

  function render(root) {
    const st = Store.get();
    if (st.assessmentDone && step < 4) step = 4;
    if (step === 3 && st.assessCursor >= list().length) step = 4;

    if (step === 0) return welcome(root);
    if (step === 1) return setup(root);
    if (step === 2) return explain(root);
    if (step === 3) return assess(root);
    return map(root);
  }

  function welcome(root) {
    const d = Metrics.daysLeft();
    root.innerHTML = '<div class="wizard">' + dots(0) +
      '<div class="assess-card">' +
        '<div class="assess-path">Getting started</div>' +
        '<h1 style="font-size:30px;margin:8px 0 10px">Let’s build your A-Level Maths revision plan.</h1>' +
        '<p class="muted" style="margin:0 0 20px;font-size:15px;line-height:1.65">' +
        'This tracker plans your revision around the full Pearson Edexcel A level Mathematics (9MA0) specification, ' +
        'Year 1 and Year 2, across Pure, Statistics and Mechanics. It adapts as you go: your ratings, your question ' +
        'scores and your past-paper mistakes all change what it tells you to do next.</p>' +
        '<div class="grid g3" style="margin-bottom:22px">' +
        statBox("Exam", Metrics.fmtDate(Store.settings().examDate), "Edexcel A level Maths 9MA0") +
          statBox("Days remaining", String(d), d === 1 ? "day" : "days") +
          statBox("Topics to cover", String(list().length), "subtopics across 3 papers") +
        '</div>' +
        '<div class="warnbox info"><b>How this works</b>' +
          'ASSESS → PLAN → REVISE → PRACTISE → REVIEW → REPLAN. You will not be handed a fixed timetable. ' +
          'First you rate your confidence across the whole specification, then the planner builds a schedule that ' +
          'recalculates every time you record something.</div>' +
        '<div class="row" style="margin-top:22px"><div class="spacer"></div>' +
          '<button class="btn btn-primary btn-lg" data-action="ob-next">Get started</button></div>' +
      '</div></div>';
  }

  function statBox(k, v, sub) {
    return '<div class="stat"><div class="stat-k">' + UI.esc(k) + '</div><div class="stat-v">' + UI.esc(v) +
      '</div><div class="stat-sub">' + UI.esc(sub) + '</div></div>';
  }

  function setup(root) {
    const s = Store.settings();
    root.innerHTML = '<div class="wizard">' + dots(1) +
      '<div class="assess-card">' +
        '<div class="assess-path">Step 1 of 3</div>' +
        '<h2 class="assess-q">Confirm your exam details</h2>' +
        '<p class="muted" style="margin:0 0 18px">Everything the planner does is measured backwards from this date.</p>' +
        '<div class="stack">' +
          '<div class="field"><label class="label">Exam date</label>' +
            '<input class="input" type="date" id="obExam" value="' + s.examDate + '"></div>' +
          '<div class="field"><label class="label">Qualification</label>' +
            '<input class="input" id="obQual" value="' + UI.esc(s.qualification) + '"></div>' +
          '<div class="field"><label class="label">Your name (optional)</label>' +
            '<input class="input" id="obName" placeholder="e.g. Rayan" value="' + UI.esc(s.studentName) + '"></div>' +
          '<div class="field"><label class="label">Papers you are sitting</label>' +
            '<div class="row wrap" style="gap:14px;margin-top:4px">' +
            paperToggle("pure", "Papers 1 & 2: Pure", s.papers.pure) +
            paperToggle("stats", "Paper 3: Statistics", s.papers.stats) +
            paperToggle("mech", "Paper 3: Mechanics", s.papers.mech) +
            '</div></div>' +
          '<div class="field"><label class="label">How much can you usually study per day?</label>' +
            '<select class="input" id="obDaily">' +
              [60, 90, 120, 180, 240, 300, 360].map(function (m) {
                return '<option value="' + m + '"' + (s.dailyMinutes === m ? " selected" : "") + '>' + Metrics.fmtMins(m) + '</option>';
              }).join("") +
            '</select><div class="tiny faint" style="margin-top:5px">You can change this any day, the planner never schedules more than the time you have.</div></div>' +
            '<div class="field"><label class="label">Which content are you revising right now?</label>' +
            '<select class="input" id="obYear">' +
            ['all|Both years, the full A level', '1|Year 1 only (AS content)', '2|Year 2 only'].map(function (o) {
              const p = o.split("|");
              return '<option value="' + p[0] + '"' + (String(s.yearFilter || "all") === p[0] ? " selected" : "") + '>' + p[1] + '</option>';
            }).join("") +
          '</select><div class="tiny faint" style="margin-top:5px">Pick Year 1 if you have not been taught Year 2 yet. ' +
          'You can switch this any time in Settings, or filter year by year in Topics.</div></div>' +
        '</div>' +
        '<div class="row" style="margin-top:24px">' +
          '<button class="btn" data-action="ob-back">Back</button><div class="spacer"></div>' +
          '<button class="btn btn-primary btn-lg" data-action="ob-save-setup">Continue</button></div>' +
      '</div></div>';
  }

  function paperToggle(id, label, on) {
    return '<label class="switch"><input type="checkbox" data-paper="' + id + '"' + (on ? " checked" : "") + '><i></i><span>' + UI.esc(label) + '</span></label>';
  }

  function explain(root) {
    const isFocus = Store.isFocus();
    const topicCount = Store.allSectionIds().length;
    const chapterCount = ALL_CHAPTER_IDS.length;
    root.innerHTML = '<div class="wizard">' + dots(2) +
      '<div class="assess-card">' +
        '<div class="assess-path">Step 2 of 3</div>' +
        '<h2 class="assess-q">How the RAG rating works</h2>' +
        '<p class="muted" style="margin:0 0 18px">Rate each subtopic by asking one question: ' +
          '<b style="color:var(--text)">could I answer exam questions on this right now, under time pressure, without notes?</b></p>' +
        '<div class="stack">' +
        ragRow("red", "Weak, I don’t understand it", "Very high priority. Scheduled first, revisited often, short spaced-repetition gaps.") +
          ragRow("amber", "Partially confident", "High priority. Scheduled early, reviewed at medium intervals.") +
          ragRow("green", "Confident", "Low priority, but not ignored, it still gets maintenance retrieval so it doesn’t decay.") +
        '</div>' +
        '<div class="field" style="margin-top:20px"><label class="label">Rate by</label>' +
          '<div class="chips">' +
            '<button class="chip' + (!isFocus ? " on" : "") + '" data-action="ob-set-grain" data-grain="topic">Individual topics <span class="tiny faint">(' + topicCount + ')</span></button>' +
            '<button class="chip' + (isFocus ? " on" : "") + '" data-action="ob-set-grain" data-grain="chapter">Whole chapters <span class="tiny faint">(' + chapterCount + ')</span></button>' +
          '</div>' +
          '<div class="tiny faint" style="margin-top:6px">Rating chapter by chapter is faster and matches how you revise, one rating per textbook chapter instead of one per subtopic.</div>' +
        '</div>' +
        '<div class="warnbox" style="margin-top:20px"><b>Ratings are not permanent, and they are not the final word</b>' +
          'Your scores override your self-rating. Rate a topic GREEN then score 42% on its questions and it will be pushed ' +
          'back down to AMBER or RED automatically. Rate something RED then score 90% and it moves up. Be honest, not optimistic, ' +
          'and don’t agonise, you can change any rating in one click later.</div>' +
        '<div class="row" style="margin-top:24px">' +
          '<button class="btn" data-action="ob-back">Back</button><div class="spacer"></div>' +
          '<button class="btn btn-primary btn-lg" data-action="ob-start-assess">Start the assessment</button></div>' +
      '</div></div>';
  }

  function ragRow(v, title, desc) {
    return '<div class="row" style="align-items:flex-start;gap:14px;padding:13px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2)">' +
      '<div style="font-size:24px">' + UI.RAG_EMOJI[v] + '</div>' +
      '<div><div style="font-weight:700">' + UI.esc(title) + '</div>' +
      '<div class="tiny muted" style="margin-top:3px">' + UI.esc(desc) + '</div></div></div>';
  }

  function assess(root) {
    const ids = list();
    const st = Store.get();
    const i = Math.min(st.assessCursor, ids.length - 1);
    const id = ids[i];
    const inf = Store.info(id);
    const t = Store.topic(id);
    const rated = ids.filter(function (x) { return Store.topic(x).rag; }).length;

    const scope = st.assessScope || "full";
    const scopeLabel = { full: "Full assessment", weak: "Retake, weak topics", unrated: "Retake, unrated only",
      paper: "Retake, one paper", stale: "Retake, going stale" }[scope] || "Assessment";
    const unit = st.settings.examFocus ? "chapters" : "topics";
    root.innerHTML = '<div class="wizard">' + dots(3) +
      '<div class="row tiny muted" style="margin-bottom:10px">' +
        '<span><b style="color:var(--on-field);font-size:14px">' + (i + 1) + ' / ' + ids.length + '</b> · ' +
          rated + ' of these ' + unit + ' rated</span>' +
        '<div class="spacer"></div>' +
        '<span>' + UI.esc(scopeLabel) + ' · ' + inf.paper.short + '</span></div>' +
      UI.bar((i / ids.length) * 100) +
      '<div class="assess-card" style="margin-top:18px">' +
        '<div class="assess-path">' + UI.esc(inf.chapterLabel) + '</div>' +
        '<h2 class="assess-q">' + (inf.sub.code ? '<span class="code">' + UI.esc(inf.sub.code) + '</span>' : "") + UI.esc(inf.sub.name) + UI.yearPill(inf.year) + '</h2>' +
        '<p class="muted tiny" style="margin:0 0 14px">' + UI.esc(inf.section.desc) + '</p>' +
        '<div style="font-weight:700;font-size:13px;margin-bottom:6px">What you need to be able to do</div>' +
        '<ul class="reqs">' + inf.sub.reqs.map(function (r) { return "<li>" + UI.math(r) + "</li>"; }).join("") + '</ul>' +
        '<div style="margin-top:20px;font-weight:700">How confident are you that you could answer exam questions on this right now?</div>' +
        '<div class="big-rag">' +
        bigBtn("red", "🔴", "Red", "Weak, I don’t understand it") +
          bigBtn("amber", "🟠", "Amber", "Partially confident") +
          bigBtn("green", "🟢", "Green", "Confident I could do this in an exam") +
        '</div>' +
        '<button class="btn btn-block" style="margin-top:10px" data-action="assess-noidea">I have no idea / I haven’t learned this yet <span class="faint">→ counts as RED</span></button>' +
        '<div class="row" style="margin-top:18px">' +
          '<button class="btn btn-sm" data-action="assess-prev"' + (i === 0 ? " disabled" : "") + '>← Previous</button>' +
          '<button class="btn btn-sm" data-action="assess-skip">Skip</button>' +
          '<div class="spacer"></div>' +
          (t.rag ? '<span class="tiny muted">Currently: ' + UI.ragPill(t.rag) + '</span>' : "") +
          '<button class="btn btn-sm btn-ghost" data-action="assess-finish">Finish early</button>' +
        '</div>' +
        '<div class="tiny faint" style="margin-top:12px;text-align:center">Tip: press <b>1</b>, <b>2</b> or <b>3</b> on your keyboard for red / amber / green.</div>' +
      '</div></div>';
  }

  function bigBtn(v, e, label, sub) {
    return '<button data-v="' + v + '" data-action="assess-rate"><span class="e">' + e + '</span>' + label +
      '<small>' + UI.esc(sub) + '</small></button>';
  }

  function map(root) {
    const c = Metrics.coverage();
    const feas = Metrics.feasibility();
    const hasPlan = !!Store.get().plan;
    root.innerHTML = '<div class="wizard">' + dots(4) +
      '<div class="assess-card">' +
        '<div class="assess-path">Your revision map</div>' +
        '<h2 style="font-size:26px;margin:8px 0 6px">Here is where you actually stand</h2>' +
        '<p class="muted" style="margin:0 0 20px">' + c.assessed + ' of ' + c.total + ' subtopics assessed.</p>' +
        '<div class="grid g3" style="margin-bottom:18px">' +
          bigCount("🔴", c.red, "Red", "var(--red)") +
          bigCount("🟠", c.amber, "Amber", "var(--amber)") +
          bigCount("🟢", c.green, "Green", "var(--green)") +
        '</div>' +
        UI.ragBar(c) + UI.ragLegend(c) +
        '<div class="grid g3" style="margin-top:20px">' +
          SPEC.map(function (p) {
            if (!paperOn(p.id)) return "";
            const pc = Metrics.coverage(p.id);
            return '<div class="card" style="box-shadow:none"><div class="card-title" style="margin-bottom:9px">' + UI.esc(p.short) + '</div>' +
              UI.ragBar(pc) + '<div class="tiny muted" style="margin-top:8px">' + pc.total + ' subtopics · ' + pc.red + ' red</div></div>';
          }).join("") +
        '</div>' +
        feasibilityBox(feas) +
        '<div class="row" style="margin-top:24px">' +
          '<button class="btn" data-action="ob-reassess">Re-do assessment</button><div class="spacer"></div>' +
          '<button class="btn btn-primary btn-lg" data-action="ob-generate">' + (hasPlan ? "Regenerate my revision plan" : "Generate my revision plan") + '</button></div>' +
      '</div></div>';
  }

  function bigCount(e, n, label, color) {
    return '<div class="stat" style="text-align:center"><div style="font-size:26px">' + e + '</div>' +
      '<div class="stat-v" style="color:' + color + '">' + n + '</div><div class="stat-sub">' + label + '</div></div>';
  }

  function feasibilityBox(f) {
    const availH = (f.availableMins / 60).toFixed(1);
    const reqH = (f.required.total / 60).toFixed(1);
    if (f.ok) {
      return '<div class="warnbox info" style="margin-top:20px"><b>The workload fits</b>' +
        'Roughly ' + reqH + ' hours of planned revision against about ' + availH + ' hours available before the exam. ' +
        'That is tight but realistic if you keep to the plan.</div>';
    }
    return '<div class="warnbox ' + (f.tight ? "" : "bad") + '" style="margin-top:20px"><b>⚠️ Be realistic about the time you have</b>' +
      'You have roughly <b>' + reqH + ' hours</b> of planned revision remaining but only about <b>' + availH + ' hours</b> ' +
      'of study time before ' + Metrics.fmtDateLong(Store.settings().examDate) + '.' +
      '<br><br>You cannot complete every planned task. The planner will front-load the highest-value work in this order:' +
      '<ol><li>Red Pure topics (Paper 1 is 100 of your marks)</li><li>Red Statistics and Mechanics topics</li>' +
      '<li>Topic exam questions rather than more videos</li><li>Timed past papers and error analysis</li>' +
      '<li>Green-topic maintenance, only if time allows</li></ol>' +
      'Increase your daily study time in Settings, or accept that some green topics will get maintenance only.</div>';
  }

  /* ---------- actions ---------- */
  function handle(action, el, e) {
    const st = Store.get();
    switch (action) {
      case "ob-next": step = 1; App.render(); return true;
      case "ob-back": step = Math.max(0, step - 1); App.render(); return true;

      case "ob-set-grain": {
        const wantChapter = el.dataset.grain === "chapter";
        if (wantChapter !== Store.isFocus()) {
          Store.mutate(function (s) { Store.setExamFocus(wantChapter); });
        }
        App.render(); return true;
      }

      case "ob-save-setup": {
        const exam = document.getElementById("obExam").value;
        const qual = document.getElementById("obQual").value;
        const name = document.getElementById("obName").value;
        const daily = parseInt(document.getElementById("obDaily").value, 10);
        const yearFilter = document.getElementById("obYear").value;
        const papers = {};
        document.querySelectorAll("[data-paper]").forEach(function (cb) { papers[cb.dataset.paper] = cb.checked; });
        if (!papers.pure && !papers.stats && !papers.mech) { UI.toast("Select at least one paper", "bad"); return true; }
        if (!exam) { UI.toast("Enter your exam date", "bad"); return true; }
        Store.mutate(function (s) {
          s.settings.examDate = exam; s.settings.qualification = qual; s.settings.studentName = name;
          s.settings.dailyMinutes = daily; s.settings.yearFilter = yearFilter; s.settings.papers = papers;
        });
        step = 2; App.render(); return true;
      }

      case "ob-start-assess": {
        const ids = list();
        const firstUnrated = ids.findIndex(function (id) { return !Store.topic(id).rag; });
        Store.mutate(function (s) { s.assessCursor = firstUnrated < 0 ? 0 : firstUnrated; });
        step = 3; App.render(); return true;
      }

      case "assess-rate":
      case "assess-noidea": {
        const ids = list();
        const id = ids[Math.min(st.assessCursor, ids.length - 1)];
        const v = action === "assess-noidea" ? "red" : el.dataset.v;
        Store.mutate(function (s) {
          const t = s.topics[id];
          t.rag = v;
          t.derived = false;
          if (!t.initialRag) t.initialRag = v;
          if (action === "assess-noidea") t.notes = (t.notes ? t.notes + "\n" : "") + "Marked as not yet learned during initial assessment.";
          s.assessCursor = Math.min(s.assessCursor + 1, ids.length);
          if (s.assessCursor >= ids.length) { s.assessmentDone = true; s.onboarded = true; snapshot(s); s.assessQueue = null; }
        });
        if (Store.get().assessCursor >= ids.length) step = 4;
        App.render(); return true;
      }

      case "assess-skip": {
        const ids = list();
        Store.mutate(function (s) {
          s.assessCursor = Math.min(s.assessCursor + 1, ids.length);
          if (s.assessCursor >= ids.length) { s.assessmentDone = true; s.onboarded = true; snapshot(s); s.assessQueue = null; }
        });
        if (Store.get().assessCursor >= ids.length) step = 4;
        App.render(); return true;
      }

      case "assess-prev":
        Store.mutate(function (s) { s.assessCursor = Math.max(0, s.assessCursor - 1); });
        App.render(); return true;

      case "assess-finish":
        Store.mutate(function (s) { s.assessmentDone = true; s.onboarded = true; snapshot(s); s.assessQueue = null; });
        step = 4; App.render(); return true;

      case "ob-reassess":
        App.retakeModal(); return true;

      case "ob-generate": {
        Scheduler.regenerate("initial plan generated");
        Store.mutate(function (s) { s.onboarded = true; s.assessmentDone = true; });
        UI.toast("Your revision plan is ready", "ok");
        App.go("dashboard"); return true;
      }
    }
    return false;
  }

  function keydown(e) {
    if (step !== 3) return;
    const map = { "1": "red", "2": "amber", "3": "green" };
    if (map[e.key]) {
      handle("assess-rate", { dataset: { v: map[e.key] } });
      e.preventDefault();
    } else if (e.key === "ArrowRight") { handle("assess-skip", {}); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { handle("assess-prev", {}); e.preventDefault(); }
  }

  function goToStep(n) { step = n; }

  return { render: render, handle: handle, keydown: keydown, goToStep: goToStep, startRetake: startRetake };
})();
