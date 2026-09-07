/* ============================================================
   The revision timetable

   Every other part of this app plans ONE subject: the scheduler
   works inside Maths, or inside Economics, and it has to,
   because a chapter's priority only means something next to
   other chapters of the same specification.

   A timetable is the opposite problem. You have one evening and
   three subjects, and the question is not "which chapter" but
   "how much of tonight goes to Economics". So this lives outside
   the per-subject saves, in its own store, and is the only part
   of the app that sees all three at once.

   WHAT IT PLANS AROUND

   Your real week, not an idealised one. A day has a window you
   are actually free in, some days are off entirely, and the
   things that own your time already — work, school, a lesson —
   are blocks it schedules around rather than over.

   HOW MUCH EACH SUBJECT GETS

   Recommended, then yours to overrule. The recommendation reads
   four things: how you ranked the subject, how far your target
   grade is from where you think you are now, how soon the next
   exam is, and how much of the specification is still red. None
   of it is clever; it is just the arithmetic you would do
   yourself, done consistently.

   Nothing here is automatic in the sense of being locked. Every
   block can be dragged, retimed, relabelled or deleted, and a
   block you have touched is marked as yours so a regeneration
   leaves it alone.
   ============================================================ */

const Timetable = (function () {

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /* Distinct enough to tell apart at a glance in a grid of small nodes, and
     each one still readable with white text on it. Overridable per subject. */
  const PALETTE = ["#4fa9f0", "#f59e0b", "#10b981", "#a78bfa", "#fb7185",
                   "#22d3ee", "#facc15", "#f472b6", "#34d399", "#818cf8"];

  const GRADES = ["U", "E", "D", "C", "B", "A", "A*"];

  /* ------------------------------------------------------------
     storage — shared across subjects, unlike everything else
     ------------------------------------------------------------ */

  function key() {
    const base = (typeof Auth !== "undefined" && Auth.isSignedIn())
      ? Auth.storageKey() : STORAGE_KEY_BASE;
    return base + "::timetable";
  }

  /* A week that is free after school on weekdays and open at weekends. Kept
     here rather than filled in on load, because a reset has to produce a
     usable timetable too — defaults applied only on load meant clearAll left
     no windows at all, and generating against them placed nothing. */
  function defaultWindows() {
    const w = {};
    for (let d = 0; d < 7; d++) {
      w[d] = (d === 0 || d === 6)
        ? { from: "10:00", to: "17:00", off: false }
        : { from: "16:30", to: "21:00", off: false };
    }
    return w;
  }

  /* ------------------------------------------------------------
     the rules

     The window says when you COULD work. These say how you want
     to. They are all off or unlimited by default, because a rule
     nobody asked for is just a way of quietly dropping work, and
     every one of them can be filled in at once from Recommended.
     ------------------------------------------------------------ */
  function defaultRules() {
    return {
      dailyCapMins: null,    // most you want to do on any day
      dayCaps: {},           // 0-6 -> minutes, overriding the cap for that day
      subjectsPerDay: 0,     // 0 = as many as fit; 1 = one subject a day
      subjectDays: {},       // id -> [weekday], the days that subject is allowed
      minPerDay: {},         // id -> minutes that subject must get every day
      urgentDays: 10,        // an exam this close makes a subject unmissable
      paperRamp: true,       // past papers get denser as the exam nears
      examQuestions: true,   // exam-question sittings appear in their own right
      examQuestionEvery: 4,  // one every this many blocks of that subject
      alternate: {}          // id -> true, to swap sides of the spec each time
    };
  }

  function rules() {
    const r = get().prefs.rules || {};
    return Object.assign(defaultRules(), r);
  }

  function blank() {
    return {
      version: 1,
      setUp: false,
      prefs: {
        subjects: {},           // id -> { mins, rank, target, predicted, colour, off }
        windows: defaultWindows(),   // 0-6 -> { from, to, off }
        busy: [],               // [{ id, label, days:[0-6], from, to, colour }] fixed times
        flex: [],               // [{ id, label, days:[0-6], mins }] length known, time not
        blockMins: 45,
        breakMins: 15,
        rules: defaultRules()
      },
      days: {},                 // iso -> [block]
      generatedAt: null
    };
  }

  let state = null;

  function load() {
    try {
      const raw = localStorage.getItem(key());
      state = raw ? Object.assign(blank(), JSON.parse(raw)) : blank();
      state.prefs = Object.assign(blank().prefs, state.prefs || {});
    } catch (e) { state = blank(); }
    /* a save written before a day existed still gets that day */
    state.prefs.windows = Object.assign(defaultWindows(), state.prefs.windows || {});
    state.prefs.rules = Object.assign(defaultRules(), state.prefs.rules || {});
    return state;
  }

  function get() { return state || load(); }

  function save() {
    try { localStorage.setItem(key(), JSON.stringify(get())); }
    catch (e) { if (typeof UI !== "undefined") UI.toast("Could not save the timetable", "bad"); }
  }

  /* A short history of the days, so a mis-drop can be taken back. Only the
     blocks are kept, not the preferences: undo is for "I dragged that by
     accident", not for unpicking a whole setup. */
  const history = [];
  const HISTORY_MAX = 25;

  function snapshot() {
    try { history.push(JSON.stringify(get().days)); } catch (e) { return; }
    if (history.length > HISTORY_MAX) history.shift();
  }

  function canUndo() { return history.length > 0; }

  function undo() {
    if (!history.length) return false;
    const prev = history.pop();
    try { get().days = JSON.parse(prev); } catch (e) { return false; }
    save();
    return true;
  }

  function mutate(fn) { const s = get(); fn(s); save(); return s; }

  function reloadForUser() { state = null; return load(); }

  /* Take a whole timetable from elsewhere — the cloud, or an import. Merged
     onto a blank so a document written by an older build still gets every
     field this one expects. */
  function replaceAll(doc) {
    if (!doc) return get();
    const fresh = blank();
    state = Object.assign(fresh, doc);
    state.prefs = Object.assign(fresh.prefs, doc.prefs || {});
    state.prefs.windows = Object.assign(defaultWindows(), state.prefs.windows || {});
    state.prefs.rules = Object.assign(defaultRules(), state.prefs.rules || {});
    save();
    return state;
  }

  /* ------------------------------------------------------------
     time helpers — minutes from midnight, which is the only sane
     unit once blocks start being dragged about
     ------------------------------------------------------------ */

  function toMins(hhmm) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
    return m ? (+m[1]) * 60 + (+m[2]) : 0;
  }
  function toClock(mins) {
    mins = Math.max(0, Math.min(24 * 60 - 1, Math.round(mins)));
    return String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  }
  function overlaps(aFrom, aTo, bFrom, bTo) { return aFrom < bTo && bFrom < aTo; }

  /* ------------------------------------------------------------
     the subjects, priced
     ------------------------------------------------------------ */

  /* One subject's numbers, read straight from its own save rather than by
     activating it, because activating swaps the globals under a live view. */
  function readSubject(id) {
    const out = { rated: 0, red: 0, amber: 0, green: 0, total: 0, examDate: null, daysToExam: null };
    try {
      const base = (typeof Auth !== "undefined" && Auth.isSignedIn())
        ? Auth.storageKey() : STORAGE_KEY_BASE;
      const raw = localStorage.getItem(base + Subjects.storageSuffix(id));
      if (!raw) return out;
      const st = JSON.parse(raw) || {};
      const topics = st.topics || {};
      Object.keys(topics).forEach(function (k) {
        const r = topics[k] && topics[k].rag;
        if (!r) return;
        out.rated++;
        if (out[r] !== undefined) out[r]++;
      });
      out.total = Object.keys(topics).length;
      /* the soonest exam this subject still has ahead of it */
      const today = Metrics.today();
      const dates = [];
      if (st.settings && st.settings.examDate) dates.push(st.settings.examDate);
      (st.schoolAssessments || []).forEach(function (a) {
        if (a.awaiting && a.date) dates.push(a.date);
      });
      const ahead = dates.filter(function (d) { return d >= today; }).sort();
      if (ahead.length) {
        out.examDate = ahead[0];
        out.daysToExam = Metrics.diffDays(today, ahead[0]);
      }
    } catch (e) {}
    return out;
  }

  function subjectIds() {
    return (typeof Subjects !== "undefined" ? Subjects.ids() : []);
  }

  /* Everything the timetable knows about each subject, in one shape. */
  function subjects() {
    const p = get().prefs.subjects;
    return subjectIds().map(function (id, i) {
      const meta = Subjects.get(id);
      const pref = p[id] || {};
      const read = readSubject(id);
      return {
        id: id,
        name: meta ? meta.name : id,
        short: meta ? meta.short : id,
        colour: pref.colour || PALETTE[i % PALETTE.length],
        rank: pref.rank != null ? pref.rank : i + 1,
        target: pref.target || null,
        predicted: pref.predicted || null,
        mins: pref.mins != null ? pref.mins : null,   // weekly minutes, null = use the recommendation
        off: !!pref.off,
        stats: read
      };
    });
  }

  /* ------------------------------------------------------------
     how much time each subject deserves

     Four signals, multiplied rather than added so that a subject
     which is behind on all of them pulls away from one that is
     behind on a single one.
     ------------------------------------------------------------ */

  function gradeGap(s) {
    const a = GRADES.indexOf(s.predicted || "");
    const b = GRADES.indexOf(s.target || "");
    if (a < 0 || b < 0) return 1;
    return Math.max(0, b - a);          // how many grades short
  }

  function weightOf(s, n) {
    if (s.off) return 0;
    let w = 1;
    /* rank 1 is the one that matters most; the spread is deliberately gentle
       so ranking never starves a subject completely */
    w *= 1 + (n - s.rank) * 0.18;
    w *= 1 + gradeGap(s) * 0.35;
    const st = s.stats;
    if (st.rated) w *= 1 + (st.red / st.rated) * 0.8 + (st.amber / st.rated) * 0.3;
    if (st.daysToExam != null) {
      /* an exam inside a fortnight roughly doubles a subject's share */
      w *= st.daysToExam <= 3 ? 2.4 : st.daysToExam <= 14 ? 1.8 : st.daysToExam <= 35 ? 1.3 : 1;
    }
    return Math.max(0.15, w);
  }

  /* Recommended weekly minutes per subject, sharing out whatever the week
     actually has room for. */
  function recommend() {
    const list = subjects();
    const capacity = weeklyCapacity();
    const weights = {};
    let total = 0;
    list.forEach(function (s) { weights[s.id] = weightOf(s, list.length); total += weights[s.id]; });
    const out = {};
    list.forEach(function (s) {
      const share = total > 0 ? weights[s.id] / total : 0;
      /* rounded to a whole block, because half a block is not a thing you sit */
      const raw = capacity * share;
      const blk = get().prefs.blockMins || 45;
      out[s.id] = Math.max(s.off ? 0 : blk, Math.round(raw / blk) * blk);
    });
    return { perSubject: out, capacity: capacity, weights: weights };
  }

  /* The minutes a normal week can actually hold, which is not the same as
     the minutes it contains. Blocks are placed a break apart, so a four-hour
     evening of 45-minute blocks with 15-minute breaks holds four blocks —
     three hours of work, not four. Recommending against the raw window
     overshot what could ever be placed, and the subject that happened to be
     last in the queue got nothing at all. */
  function placeableOn(weekday) {
    const blk = get().prefs.blockMins || 45;
    const brk = get().prefs.breakMins || 15;
    return freeRuns(weekday).reduce(function (a, r) {
      const span = r[1] - r[0];
      /* n blocks need n*blk + (n-1)*brk, so the last break is not needed */
      const n = Math.max(0, Math.floor((span + brk) / (blk + brk)));
      return a + n * blk;
    }, 0);
  }

  function weeklyCapacity() {
    let total = 0;
    for (let d = 0; d < 7; d++) total += placeableOn(d);
    return total;
  }

  function busyOn(weekday) {
    return (get().prefs.busy || []).filter(function (b) {
      return (b.days || []).indexOf(weekday) >= 0;
    });
  }

  /* Free stretches on a given weekday, as [from, to] minute pairs, with the
     recurring commitments cut out of them. */
  function freeRuns(weekday) {
    const w = get().prefs.windows[weekday];
    if (!w || w.off) return [];
    let runs = [[toMins(w.from), toMins(w.to)]];
    busyOn(weekday).forEach(function (b) {
      const bf = toMins(b.from), bt = toMins(b.to);
      const next = [];
      runs.forEach(function (r) {
        if (!overlaps(r[0], r[1], bf, bt)) { next.push(r); return; }
        if (r[0] < bf) next.push([r[0], Math.min(bf, r[1])]);
        if (r[1] > bt) next.push([Math.max(bt, r[0]), r[1]]);
      });
      runs = next;
    });
    return runs.filter(function (r) { return r[1] - r[0] >= 15; });
  }

  function freeMinutesOn(weekday) {
    return freeRuns(weekday).reduce(function (a, r) { return a + (r[1] - r[0]); }, 0);
  }

  /* ------------------------------------------------------------
     what to actually revise in a block

     "Two hours of Maths" is a budget, not an instruction. The
     daily planner already knows which chapter is worth the next
     hour: it weighs the RAG rating, how long since you last
     touched it, what you scored on it, how much of the paper it
     is worth and what it has cost you in past papers. There is no
     reason for the timetable to invent a second, worse answer, so
     it asks the planner rather than guessing.

     The catch is that the planner only ever sees the subject that
     is open, because every global it reads is rebuilt when the
     subject changes. So this opens each subject in turn, takes
     its ranking, and puts back whichever was open before anyone
     notices.
     ------------------------------------------------------------ */

  /* The four steps of a chapter, and which of them are still owed. */
  function stepsFor(cid) {
    const st = Journey.state(cid);
    const inf = CHAPTER_INDEX[cid];
    const m = (inf && inf.sub) ? inf.sub : {};
    const ex = Store.topic(cid).examScore || {};
    return [
      { key: "video", label: "Watch the playlist", done: st.steps.video.done,
        detail: st.steps.video.count + " of " + st.steps.video.total + " watched",
        mins: m.vid || 30 },
      { key: "questions", label: "Topic questions", done: st.steps.questions.done,
        detail: st.steps.questions.count + " of " + st.steps.questions.total + " answered",
        mins: m.qs || 30 },
      { key: "exam", label: "Exam questions", done: ex.avail > 0,
        detail: (inf && inf.sets && inf.sets.length)
          ? inf.sets.length + " question set" + (inf.sets.length === 1 ? "" : "s") + " filed here"
          : "from the question bank",
        mins: 40 },
      { key: "mark", label: "Mark it and rate yourself", done: st.steps.marked.done,
        detail: "record the score, so the plan can move", mins: 10 }
    ];
  }

  /* The open subject's chapters, best first, with what each still needs. */
  function rankChapters() {
    return Store.planIds().map(function (cid) {
      const pr = Scheduler.priority(cid);
      const inf = CHAPTER_INDEX[cid];
      const steps = stepsFor(cid);
      const left = steps.filter(function (x) { return !x.done; });
      return {
        cid: cid,
        /* Which half of the specification this sits in, where the subject has
           halves. Geography's papers are grouped Physical and Human, and
           following one with the other is a real revision technique rather
           than a preference, so the group has to survive into the queue. */
        group: (inf && inf.paper && inf.paper.group) || null,
        label: inf ? inf.chapterLabel : cid,
        name: inf ? inf.chapter.name : cid,
        score: pr.score,
        why: (pr.reasons || [])[0] || "",
        rag: (pr.eff && pr.eff.rag) || null,
        steps: steps,
        remaining: left.length,
        minutes: left.reduce(function (a, x) { return a + x.mins; }, 0) || 30
      };
    }).sort(function (a, b) { return b.score - a.score; });
  }


  /* ------------------------------------------------------------
     what a subject owes, which is not only chapters

     A week of nothing but chapter revision is not how anyone
     actually revises for a paper. Three other things earn a slot,
     and each one earns it from evidence rather than from a rule:

       a past paper   when the week's target has not been met
       a practice test when several chapters are red and nothing
                      has been sat recently
       a tariff drill  when one mark tariff is consistently going
                      badly - eight-markers at 40% is a specific
                      problem with a specific fix, and "revise
                      Economics" is not it
     ------------------------------------------------------------ */

  /* How a subject is doing at each mark tariff, from what has been marked. */
  function tariffTrouble() {
    const byTariff = {};
    const add = function (marks, got, avail) {
      if (!avail) return;
      if (!byTariff[marks]) byTariff[marks] = { got: 0, avail: 0, n: 0 };
      byTariff[marks].got += got; byTariff[marks].avail += avail; byTariff[marks].n++;
    };
    (Store.get().packAttempts || []).forEach(function (a) { add(a.available, a.got, a.available); });
    (Store.get().examAttempts || []).forEach(function (a) { add(a.available, a.got, a.available); });
    let worst = null;
    Object.keys(byTariff).forEach(function (k) {
      const t = byTariff[k];
      if (t.n < 3) return;                     // three attempts is not a pattern, but it is a hint
      const pct = Math.round(t.got / t.avail * 100);
      if (pct >= 60) return;
      if (!worst || pct < worst.pct) worst = { marks: +k, pct: pct, n: t.n };
    });
    return worst;
  }

  function papersThisWeek() {
    const since = Metrics.addDays(Metrics.today(), -7);
    return (Store.get().papers || []).filter(function (p) {
      return (p.date || p.at || "") >= since;
    }).length;
  }

  /* Days until the open subject's next exam, from its own settings, so this
     works while the subject is switched in rather than needing readSubject. */
  function daysToExamFor() {
    const d = Store.settings().examDate;
    if (!d) return null;
    const n = Metrics.diffDays(Metrics.today(), d);
    return n >= 0 ? n : null;
  }

  function lastPracticeTest() {
    const done = (Store.get().practiceTests || []).filter(function (t) { return t.finishedAt; })
      .sort(function (a, b) { return String(b.finishedAt).localeCompare(String(a.finishedAt)); })[0];
    return done ? Metrics.diffDays(String(done.finishedAt).slice(0, 10), Metrics.today()) : null;
  }

  /* Put one of these in after every `gap` chapters, starting at `first`, all
     the way down the queue. Mutates the list, and never inserts two of the
     same kind next to each other. */
  function weave(items, gap, first, make) {
    let seen = 0, at = 0, put = 0;
    while (at < items.length) {
      if (items[at].kind === "chapter") seen++;
      at++;
      if (seen >= (put === 0 ? first : gap)) {
        items.splice(at, 0, make());
        at++; seen = 0; put++;
      }
    }
    /* a subject with fewer chapters than the spacing still gets one */
    if (!put) items.push(make());
    return put;
  }

  /* The open subject's work, best first: its chapters, plus whatever else it
     is short of this week. */
  function rankWork() {
    const items = rankChapters().map(function (c) {
      return { kind: "chapter", cid: c.cid, label: c.label, name: c.name,
               score: c.score, why: c.why, rag: c.rag, steps: c.steps,
               group: c.group, minutes: c.minutes };
    });

    const reds = items.filter(function (i) { return i.rag === "red"; }).length;
    const papers = (Subjects.current().papers || [])[0];
    const r = rules();

    /* How close the exam is decides how much of the week is whole papers.
       Learning the content is what a term is for; the fortnight before the
       paper is for sitting papers, and a timetable that keeps offering
       chapter three in that fortnight is planning the wrong thing. */
    const dte = daysToExamFor();
    let target = Store.settings().pastPaperTargetPerWeek || 0;
    if (r.paperRamp && dte != null) {
      const ramped = dte <= 7 ? 4 : dte <= 14 ? 3 : dte <= 28 ? 2 : dte <= 56 ? 1 : 0;
      target = Math.max(target, ramped);
    }

    /* Exam questions in their own right, not as the third step of a chapter.
       Doing them on their own is the thing that moves a grade, and it is the
       step people skip when it is buried at the bottom of a chapter. */
    if (r.examQuestions) {
      const every = Math.max(2, r.examQuestionEvery || 4);
      const why = dte != null && dte <= 21
        ? "the exam is " + dte + " day" + (dte === 1 ? "" : "s") + " away and this is what it is made of"
        : "past-paper questions on what you have covered, marked against the scheme";
      const make = function () {
        return { kind: "examq", cid: null, label: "Exam questions",
          name: "Exam questions", score: 9996, rag: null, why: why, minutes: 45,
          steps: [{ label: "Pick a tariff you are weak at", detail: "Question Packs, then the score summary", mins: 3 },
                  { label: "Answer them under time", detail: "the paper's own rate, no notes", mins: 32 },
                  { label: "Mark against the scheme", detail: "and read the examiner report underneath", mins: 10 }] };
      };
      /* Woven through the queue, not spliced in once.

         A fortnight rarely gets a subject past its first few chapters, and a
         chapter can take three sittings, so anything placed at index four is
         a month away and anything placed once is a gesture. Every few
         chapters, all the way down, is what makes it a habit. */
      weave(items, every, 2, make);
    }

    if (target && papersThisWeek() < target) {
      const why = (r.paperRamp && dte != null && dte <= 56)
        ? "the exam is " + dte + " day" + (dte === 1 ? "" : "s") + " away, so the week wants " +
          target + " whole paper" + (target === 1 ? "" : "s")
        : "you are short of your " + target + " past paper" + (target === 1 ? "" : "s") + " this week";
      const mins = papers ? (papers.section || 45) : 60;
      const makePaper = function () {
        return { kind: "paper", cid: null,
          label: "Past paper" + (papers ? " \u00b7 " + papers.name : ""),
          name: "Past paper", score: 9999, rag: null, why: why, minutes: mins,
          steps: [{ label: "Sit it timed", detail: "no notes, no pausing", mins: mins },
                  { label: "Mark it", detail: "against the real scheme", mins: 20 },
                  { label: "Log every lost mark", detail: "the error log is what makes it worth doing", mins: 10 }] };
      };
      /* The nearer the exam, the fewer chapters between papers. */
      const gap = dte == null ? 8 : dte <= 7 ? 2 : dte <= 14 ? 3 : dte <= 28 ? 5 : 8;
      weave(items, gap, 1, makePaper);
    }

    /* A worked 25-marker: one video, one essay written out in front of you.

       The thing a 25-marker actually costs marks on is not knowing the
       economics, it is the shape of the answer, and nothing else shows that.
       So it earns its own sitting - watch one, then plan one yourself while
       it is fresh - and it is only offered where the subject has essays and
       somebody has published walkthroughs of them. */
    if (typeof EPD_WALKTHROUGH !== "undefined" && Subjects.currentId() === "economics") {
      const sec = (typeof EcoSections !== "undefined") ? EcoSections.trouble() : null;
      weave(items, sec && sec.section === "C" ? 5 : 9, 3, function () {
        return { kind: "worked", cid: null,
          label: "Worked 25 marker",
          name: "Worked 25 marker", score: 9995, rag: null,
          why: sec && sec.section === "C"
            ? "you are averaging " + sec.pct + "% on the essays, which is the section this fixes"
            : "the shape of a 25-mark answer, written out one step at a time",
          minutes: 40,
          link: EPD_PLAYLIST + EPD_WALKTHROUGH.id,
          steps: [{ label: "Watch one walkthrough", detail: EPD_WALKTHROUGH.name, mins: 18 },
                  { label: "Plan the same question yourself", detail: "two chains, a diagram, a judgement", mins: 12 },
                  { label: "Compare your plan with his", detail: "the gap is what to practise", mins: 10 }] };
      });
    }

    const lastTest = lastPracticeTest();
    if (reds >= 3 && (lastTest === null || lastTest <= -7)) {
      items.splice(Math.min(4, items.length), 0, {
        kind: "practice", cid: null,
        label: "Practice test \u00b7 weak chapters",
        name: "Practice test", score: 9998, rag: null,
        why: reds + " chapters are red and you have not sat a practice test recently",
        minutes: 50,
        steps: [{ label: "Build it on your red chapters", detail: "Practice Test, Weak spots", mins: 2 },
                { label: "Sit it against the clock", detail: "the paper's own rate", mins: 40 },
                { label: "Mark it", detail: "it moves the ratings when you do", mins: 10 }]
      });
    }

    const bad = tariffTrouble();
    if (bad) {
      items.splice(Math.min(3, items.length), 0, {
        kind: "drill", cid: null,
        label: bad.marks + "-mark questions",
        name: bad.marks + "-markers", score: 9997, rag: "red",
        why: "you are averaging " + bad.pct + "% on " + bad.marks +
             "-markers across " + bad.n + " attempts",
        minutes: 40,
        steps: [{ label: "Build a set of " + bad.marks + "-markers", detail: "Practice Test, one tariff only", mins: 2 },
                { label: "Do them back to back", detail: "the same question shape, repeatedly", mins: 30 },
                { label: "Mark and compare", detail: "what is missing is usually the same thing each time", mins: 8 }]
      });
    }
    return items;
  }

  /* Every subject's work at once. */
  function chapterQueues() {
    const back = Subjects.currentId();
    const out = {};
    subjectIds().forEach(function (id) {
      try {
        Subjects.switchTo(id);
        out[id] = rankWork().slice(0, 40);
      } catch (e) { out[id] = []; }
    });
    Subjects.switchTo(back);
    return out;
  }

  /* ------------------------------------------------------------
     generating the blocks
     ------------------------------------------------------------ */

  function uid() { return "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* The steps are done in order, so a sitting covers a stretch of that
     order rather than all of it. A block from 60 to 130 minutes into a
     chapter gets the tail of the playlist and the start of the questions,
     and says so — showing every step on every part told you what the
     chapter needs, which you already knew, and not what to do now. */
  /* The next item for a subject. Normally that is simply the next one in the
     ranking, but a subject can be set to alternate the two halves of its
     specification - Geography's Physical and Human - in which case the queue
     is scanned forward for the first item on the other side. Scanned, not
     reordered: if there is nothing left on the other side the ranking wins
     rather than the rule blocking the subject. */
  function pickNext(q, subjectId, cursor, lastGroup, r) {
    const at = cursor[subjectId] % q.length;
    if (!(r.alternate || {})[subjectId]) return q[at];
    const last = lastGroup[subjectId];
    if (!last) return q[at];
    for (let i = 0; i < q.length; i++) {
      const cand = q[(at + i) % q.length];
      if (cand.group && cand.group !== last) {
        /* move the cursor to it so the carry bookkeeping stays on this item */
        cursor[subjectId] = (at + i) % q.length;
        return cand;
      }
    }
    return q[at];
  }

  function sliceSteps(steps, fromMin, toMin) {
    const out = [];
    let at = 0;
    (steps || []).forEach(function (s) {
      const a = at, b = at + (s.mins || 0);
      at = b;
      const lo = Math.max(a, fromMin), hi = Math.min(b, toMin);
      if (hi <= lo) return;
      const portion = Math.round(hi - lo);
      out.push({ label: s.label, detail: s.detail, mins: portion,
                 part: portion < (s.mins || 0),
                 carried: lo > a });
    });
    return out;
  }

  /* Build a fortnight (or whatever span is asked for) from today.

     Blocks you have moved, added or pinned survive: `mine` marks a block as
     yours, and a regeneration schedules around it rather than over it. */
  function generate(opts) {
    opts = opts || {};
    snapshot();
    const days = opts.days || 14;
    const startIso = opts.from || Metrics.today();
    const s = get();
    const blk = s.prefs.blockMins || 45;
    const brk = s.prefs.breakMins || 15;

    const list = subjects().filter(function (x) { return !x.off; });
    if (!list.length) return { made: 0, days: 0 };

    const r = rules();

    /* A subject with an exam this close is not one of several things you
       could do today; it is a thing you do EVERY day. It takes the first
       block of the day before anything else is considered, and it does not
       count against the one-subject-a-day rule, which is about how you like
       to work rather than about the week of the exam.

       One block, though, not the day. "At least one session of Economics a
       day" and "Economics is the only thing I do until Friday" are different
       instructions, and only the first one was asked for. After its
       guaranteed sitting it competes for the rest of the evening like
       anything else - and with an exam that close it usually wins anyway,
       because being days from the paper is most of what its share is built
       from. */
    const urgent = {};
    list.forEach(function (x) {
      const d = x.stats.daysToExam;
      if (d != null && d <= (r.urgentDays || 10)) urgent[x.id] = d;
    });

    const rec = recommend();
    /* minutes owed to each subject this week, drained as blocks are placed */
    const owed = {};
    list.forEach(function (x) {
      const pref = s.prefs.subjects[x.id] || {};
      owed[x.id] = (pref.mins != null ? pref.mins : rec.perSubject[x.id]) || 0;
    });
    const weekly = Object.assign({}, owed);

    /* what each subject should be working on, best first */
    const queues = opts.queues || chapterQueues();
    const cursor = {};
    const lastGroup = {};        // subject -> the half of the spec it last sat
    list.forEach(function (x) { cursor[x.id] = 0; });
    const partNo = opts.partNo || (opts.partNo = {});      // key -> sittings so far
    const partsOf = opts.partsOf || (opts.partsOf = {});   // key -> sittings in total

    let made = 0, touched = 0;
    for (let i = 0; i < days; i++) {
      const iso = Metrics.addDays(startIso, i);
      const weekday = new Date(iso + "T00:00:00").getDay();
      if (i > 0 && i % 7 === 0) Object.keys(weekly).forEach(function (k) { owed[k] = weekly[k]; });

      const keep = opts.fresh ? [] : (s.days[iso] || []).filter(function (b) { return b.mine; });
      let runs = freeRuns(weekday);
      if (!runs.length) { s.days[iso] = keep; continue; }

      const placed = keep.slice();
      /* how much of each item is still unplaced, so a long chapter can run
         over two sittings instead of being cut to fit one */
      const carry = opts.carry || (opts.carry = {});

      /* ---- what today's rules allow ---- */
      const cap = (r.dayCaps && r.dayCaps[weekday] != null) ? r.dayCaps[weekday] : r.dailyCapMins;
      let dayUsed = keep.reduce(function (a, b) {
        return a + (b.kind === "revision" ? toMins(b.to) - toMins(b.from) : 0);
      }, 0);
      const seenToday = {};
      keep.forEach(function (b) { if (b.subjectId) seenToday[b.subjectId] = true; });

      /* The subjects-per-day count ignores the urgent ones, so a guaranteed
         Economics sitting does not use up "one subject a day" and leave the
         rest of the evening unschedulable. */
      function countedToday() {
        return Object.keys(seenToday).filter(function (id) { return urgent[id] == null; }).length;
      }

      /* A subject can be pinned to particular days: "Maths on Monday and
         Thursday". An urgent one ignores that, because a rule you wrote in
         March should not keep you off Economics the day before the paper. */
      function allowedToday(x) {
        if (urgent[x.id] != null) return true;
        const days = (r.subjectDays || {})[x.id];
        if (days && days.length && days.indexOf(weekday) < 0) return false;
        const limit = r.subjectsPerDay || 0;
        if (limit && !seenToday[x.id] && countedToday() >= limit) return false;
        return true;
      }

      /* Commitments whose length you know but not their time — the gym for
         two hours on Monday, some time. They go in before revision so they
         get the room, and they take the end of a stretch rather than the
         middle, because splitting an evening in half wastes both halves. */
      (s.prefs.flex || []).forEach(function (f) {
        if ((f.days || []).indexOf(weekday) < 0) return;
        const want = f.mins || 60;
        let best = null;
        /* A time you asked for is honoured where the day has room for it,
           and ignored rather than refused where it does not: an hour that
           will not fit at ten still wants to happen that day. */
        if (f.at) {
          const want0 = toMins(f.at);
          runs.forEach(function (r) {
            if (want0 < r[0] || want0 + want > r[1]) return;
            const clash = placed.some(function (b) {
              return overlaps(want0, want0 + want, toMins(b.from), toMins(b.to)); });
            if (!clash && best === null) best = { at: want0, span: r[1] - r[0] };
          });
        }
        if (best === null) runs.forEach(function (r) {
          if (r[1] - r[0] < want) return;
          const at = f.prefer === "start" ? r[0] : r[1] - want;
          const clash = placed.some(function (b) {
            return overlaps(at, at + want, toMins(b.from), toMins(b.to)); });
          if (!clash && (best === null || (r[1] - r[0]) > best.span)) {
            best = { at: at, span: r[1] - r[0] };
          }
        });
        if (best === null) return;
        placed.push({ id: uid(), subjectId: null, label: f.label,
                      from: toClock(best.at), to: toClock(best.at + want),
                      colour: f.colour || "#64748b", kind: "flex", mine: false });
        const nf = [];
        runs.forEach(function (r) {
          if (!overlaps(r[0], r[1], best.at, best.at + want)) { nf.push(r); return; }
          if (r[0] < best.at) nf.push([r[0], best.at]);
          if (r[1] > best.at + want) nf.push([best.at + want, r[1]]);
        });
        runs = nf.filter(function (r) { return r[1] - r[0] >= 15; });
      });
      runs.forEach(function (run) {
        let at = run[0];
        while (at + Math.min(blk, 20) <= run[1]) {
          const clash = placed.some(function (b) {
            return overlaps(at, at + blk, toMins(b.from), toMins(b.to));
          });
          if (clash) { at += 15; continue; }

          /* the day is full even though the evening is not */
          if (cap != null && dayUsed >= cap) { at = run[1]; break; }

          /* An urgent subject with nothing today yet takes the next block,
             whatever it is owed; after that the most-owed subject goes next
             so the week evens out. */
          const open = list.filter(allowedToday);
          if (!open.length) { at = run[1]; break; }
          let best = null, guaranteed = false;
          open.forEach(function (x) {
            if (urgent[x.id] == null || seenToday[x.id]) return;
            if (!best || urgent[x.id] < urgent[best.id]) best = x;
          });
          if (best) guaranteed = true;
          else open.forEach(function (x) {
            if (owed[x.id] <= 0) return;
            if (!best || owed[x.id] > owed[best.id]) best = x;
          });
          if (!best) { at = run[1]; break; }

          /* the next chapter that subject owes work to, cycling round once
             the ranking runs out rather than leaving a block unnamed */
          const q = queues[best.id] || [];
          const ch = q.length ? pickNext(q, best.id, cursor, lastGroup, r) : null;

          /* A block is as long as the work is, not a fixed 45 minutes. You
             will not finish Quadratics between two and quarter to three, so
             the block runs for what the chapter still needs — capped by the
             room left in the evening and by how long anyone can usefully
             sit at one thing, and carried into another sitting if it does
             not fit. */
          const key = ch ? (best.id + "|" + (ch.cid || ch.kind)) : best.id;
          let need = ch ? (carry[key] != null ? carry[key] : ch.minutes) : blk;

          /* A leftover too small to sit is finished, not carried. Carrying it
             deadlocked the whole timetable: the item stayed at the front of
             the queue, every day computed a length below the minimum, broke
             out of the day, and every day after the third came out empty. */
          if (ch && need > 0 && need < 20) {
            carry[key] = 0;
            cursor[best.id]++;
            continue;
          }
          /* The guaranteed sitting is one block, not the whole evening: it is
             there so the day cannot pass without touching the subject. */
          let room = guaranteed
            ? Math.min(run[1] - at, Math.max(blk, owed[best.id] > 0 ? Math.min(owed[best.id], blk) : blk))
            : Math.min(run[1] - at, owed[best.id]);
          if (cap != null) room = Math.min(room, cap - dayUsed);
          const maxSit = Math.max(blk, s.prefs.maxSitting || 90);
          const MIN_SIT = 20;

          /* Work that will not fit one sitting is divided into equal ones
             rather than filled greedily. Greedy gave the longest block it
             could and left the remainder as a stub: two hours twenty came
             out as ninety minutes and then twenty, and nobody sits down for
             twenty minutes of Quadratics. Two sittings of seventy is the
             same work and a better evening. */
          let len, sittings = 1;
          if (need > maxSit) {
            sittings = Math.ceil(need / maxSit);
            len = Math.round((need / sittings) / 5) * 5;
          } else {
            len = need;
          }
          len = Math.min(len, room);
          len = Math.round(len / 5) * 5;

          /* Never leave a scrap behind either: if what would be left is too
             small to be worth a sitting, swallow it now when there is room,
             and otherwise give it up so the remainder is viable. */
          const rest = need - len;
          if (rest > 0 && rest < MIN_SIT) {
            if (len + rest <= room) len = need;
            else len = Math.max(MIN_SIT, need - MIN_SIT);
          }

          if (at + len > run[1]) len = run[1] - at;
          len = Math.round(len / 5) * 5;
          /* Rounding is the last thing that happens, so the cap is checked
             after it: rounding 178 up to 180 is fine, rounding past a cap of
             180 to 185 is the cap not meaning anything. */
          if (cap != null) len = Math.min(len, cap - dayUsed);
          if (at + len > run[1]) len = run[1] - at;
          if (len < MIN_SIT) { at = run[1]; break; }

          const partOf = ch && need > len;
          if (ch) carry[key] = Math.max(0, need - len);
          if (ch && carry[key] === 0) cursor[best.id]++;
          else if (!ch) cursor[best.id]++;

          /* where this sitting sits inside the chapter's remaining work */
          const total = ch ? ch.minutes : len;
          const doneBefore = ch ? Math.max(0, total - need) : 0;
          const undone = ch ? ch.steps.filter(function (x) { return !x.done; }) : [];
          const steps = ch ? sliceSteps(undone, doneBefore, doneBefore + len) : [];

          /* The count comes from the split itself, not from dividing the
             total by this block's length: a later sitting often gets a
             little more room, so that arithmetic said "part 1 of 3" for
             work that finished in two. */
          if (ch && partsOf[key] == null) partsOf[key] = Math.max(1, sittings);
          partNo[key] = (partNo[key] || 0) + 1;
          const nParts = ch ? Math.max(partsOf[key] || 1, partOf ? 2 : 1) : 1;
          placed.push({
            id: uid(), subjectId: best.id,
            label: (ch ? ch.label : best.name) +
                   (nParts > 1 ? " \u00b7 part " + partNo[key] + " of " + nParts : ""),
            subjectName: best.name,
            chapterId: ch ? ch.cid : null,
            work: ch ? ch.kind : "chapter",
            why: ch ? ch.why : "",
            rag: ch ? ch.rag : null,
            eta: ch ? ch.minutes : null,        // the whole chapter's remaining work
            sitting: len,                        // what this block is worth
            partNo: ch ? partNo[key] : 1,
            partCount: nParts,
            steps: steps,
            from: toClock(at), to: toClock(at + len),
            colour: best.colour, kind: "revision", mine: false
          });
          owed[best.id] -= len;
          dayUsed += len;
          seenToday[best.id] = true;
          if (ch && ch.group) lastGroup[best.id] = ch.group;
          made++;
          at += len + brk;
        }
      });
      touched++;
      placed.sort(function (a, b) { return toMins(a.from) - toMins(b.from); });
      s.days[iso] = placed;
    }
    /* Number the parts from what was actually placed.

       Predicting the count when the first sitting is scheduled cannot be
       right: a later day often has less room than this one, so work that
       looked like two sittings becomes three. Counting them afterwards is
       exact, and "part 1 of 2" that turns into three parts is exactly the
       kind of small lie that stops people trusting the thing. */
    const tally = {};
    Object.keys(s.days).sort().forEach(function (iso) {
      (s.days[iso] || []).forEach(function (b) {
        if (b.kind !== "revision" || !b.chapterId || b.mine) return;
        const k = b.subjectId + "|" + b.chapterId;
        tally[k] = (tally[k] || 0) + 1;
        b.partNo = tally[k];
      });
    });
    Object.keys(s.days).forEach(function (iso) {
      (s.days[iso] || []).forEach(function (b) {
        if (b.kind !== "revision" || !b.chapterId || b.mine) return;
        const k = b.subjectId + "|" + b.chapterId;
        b.partCount = tally[k];
        const base = String(b.label).split(" · part ")[0];
        b.label = base + (b.partCount > 1 ? " · part " + b.partNo + " of " + b.partCount : "");
      });
    });

    s.generatedAt = new Date().toISOString();
    s.setUp = true;
    save();
    return { made: made, days: touched };
  }

  /* ------------------------------------------------------------
     reading and editing days
     ------------------------------------------------------------ */

  /* Rebuild from today forward, keeping anything you have touched.

     Called when the work underneath changes — time logged, a chapter
     recorded, a test marked — because a timetable that still says "45
     minutes on Quadratics" after you have done ninety is not a plan, it is
     a leaflet. Only ever forwards: yesterday is history. */
  function reflow(reason) {
    const s = get();
    if (!s.generatedAt) return null;
    const days = Object.keys(s.days).filter(function (d) { return d >= Metrics.today(); }).length;
    const r = generate({ days: Math.max(14, days) });
    r.reason = reason || "";
    return r;
  }

  function blocksOn(iso) {
    const own = (get().days[iso] || []).slice();
    const weekday = new Date(iso + "T00:00:00").getDay();
    /* the recurring commitments are shown but not stored per day, so editing
       "work, Mondays 3-6" in one place changes every Monday */
    busyOn(weekday).forEach(function (b) {
      own.push({ id: "busy:" + b.id, subjectId: null, label: b.label,
                 from: b.from, to: b.to, colour: b.colour || "#64748b",
                 kind: "busy", fixed: true });
    });
    return own.sort(function (a, b) { return toMins(a.from) - toMins(b.from); });
  }

  /* When the timetable says to do this chapter today, if it does. Today's
     Plan lists what to do; this is what tells it when. */
  function slotsFor(cid, iso) {
    return (get().days[iso || Metrics.today()] || []).filter(function (b) {
      return b.chapterId === cid;
    }).map(function (b) { return { from: b.from, to: b.to, label: b.label }; });
  }

  function slotsToday() {
    return (get().days[Metrics.today()] || []).filter(function (b) { return b.kind === "revision"; });
  }

  function dayTotals(iso) {
    const out = {};
    (get().days[iso] || []).forEach(function (b) {
      if (b.kind !== "revision") return;
      out[b.subjectId] = (out[b.subjectId] || 0) + (toMins(b.to) - toMins(b.from));
    });
    return out;
  }

  function addBlock(iso, block) {
    snapshot();
    return mutate(function (s) {
      if (!s.days[iso]) s.days[iso] = [];
      s.days[iso].push(Object.assign({ id: uid(), kind: "revision", mine: true }, block));
      s.days[iso].sort(function (a, b) { return toMins(a.from) - toMins(b.from); });
    });
  }

  function updateBlock(iso, id, patch) {
    snapshot();
    return mutate(function (s) {
      (s.days[iso] || []).forEach(function (b) {
        if (b.id === id) { Object.assign(b, patch); b.mine = true; }
      });
      (s.days[iso] || []).sort(function (a, b) { return toMins(a.from) - toMins(b.from); });
    });
  }

  function removeBlock(iso, id) {
    snapshot();
    return mutate(function (s) {
      s.days[iso] = (s.days[iso] || []).filter(function (b) { return b.id !== id; });
    });
  }

  /* Drop a block at a new start time, keeping its length and refusing to sit
     on top of something else. */
  function moveBlock(iso, id, startMins, toIso) {
    const s = get();
    const from = (s.days[iso] || []).filter(function (b) { return b.id === id; })[0];
    if (!from) return false;
    const len = toMins(from.to) - toMins(from.from);
    const dest = toIso || iso;
    const start = Math.max(0, Math.min(24 * 60 - len, Math.round(startMins / 5) * 5));
    const others = blocksOn(dest).filter(function (b) { return b.id !== id; });
    const clash = others.some(function (b) {
      return overlaps(start, start + len, toMins(b.from), toMins(b.to));
    });
    if (clash) return false;
    snapshot();
    mutate(function (st) {
      st.days[iso] = (st.days[iso] || []).filter(function (b) { return b.id !== id; });
      if (!st.days[dest]) st.days[dest] = [];
      from.from = toClock(start); from.to = toClock(start + len); from.mine = true;
      st.days[dest].push(from);
      st.days[dest].sort(function (a, b) { return toMins(a.from) - toMins(b.from); });
    });
    return true;
  }

  /* ------------------------------------------------------------
     preferences
     ------------------------------------------------------------ */

  function setSubject(id, patch) {
    return mutate(function (s) {
      s.prefs.subjects[id] = Object.assign({}, s.prefs.subjects[id], patch);
    });
  }
  function setWindow(weekday, patch) {
    return mutate(function (s) {
      s.prefs.windows[weekday] = Object.assign({}, s.prefs.windows[weekday], patch);
    });
  }
  function addFlex(rec) {
    return mutate(function (s) {
      if (!s.prefs.flex) s.prefs.flex = [];
      s.prefs.flex.push(Object.assign({ id: uid(), colour: "#64748b", mins: 60 }, rec));
    });
  }
  function removeFlex(id) {
    return mutate(function (s) {
      s.prefs.flex = (s.prefs.flex || []).filter(function (b) { return b.id !== id; });
    });
  }

  function addBusy(rec) {
    return mutate(function (s) {
      s.prefs.busy.push(Object.assign({ id: uid(), colour: "#64748b" }, rec));
    });
  }
  function updateBusy(id, patch) {
    return mutate(function (s) {
      s.prefs.busy.forEach(function (b) { if (b.id === id) Object.assign(b, patch); });
    });
  }
  function removeBusy(id) {
    return mutate(function (s) {
      s.prefs.busy = s.prefs.busy.filter(function (b) { return b.id !== id; });
    });
  }
  function setRules(patch) {
    return mutate(function (s) {
      s.prefs.rules = Object.assign(defaultRules(), s.prefs.rules || {}, patch || {});
    });
  }

  /* ------------------------------------------------------------
     Recommended, for everything at once

     Someone who does not want to think about any of this should
     still get a timetable that is better than nothing, and the
     answers are not mysterious: cap the day a little under what
     the evening holds so it survives a bad day, do not force one
     subject a day because most people are sitting several papers,
     let past papers ramp, and alternate the halves of any subject
     that has halves.
     ------------------------------------------------------------ */
  function recommendRules() {
    const list = subjects().filter(function (x) { return !x.off; });

    /* the busiest day the week actually has, rounded down to a half hour */
    let mostFree = 0;
    for (let d = 0; d < 7; d++) mostFree = Math.max(mostFree, placeableOn(d));
    const cap = mostFree ? Math.max(60, Math.floor((mostFree * 0.85) / 30) * 30) : 180;

    const alternate = {};
    list.forEach(function (x) {
      /* only where the specification really is in two halves */
      if (groupsOf(x.id).length >= 2) alternate[x.id] = true;
    });

    return Object.assign(defaultRules(), {
      dailyCapMins: cap,
      dayCaps: {},
      subjectsPerDay: 0,
      subjectDays: {},
      urgentDays: 10,
      paperRamp: true,
      examQuestions: true,
      examQuestionEvery: 4,
      alternate: alternate
    });
  }

  /* The named halves of a subject's specification, if it has any. Geography's
     papers carry Physical and Human; Maths and Economics carry nothing, and
     alternating is meaningless for them. */
  function groupsOf(id) {
    try {
      const s = Subjects.get(id);
      if (!s || typeof s.spec !== "function") return [];
      const seen = {};
      (s.spec() || []).forEach(function (p) { if (p.group) seen[p.group] = true; });
      return Object.keys(seen);
    } catch (e) { return []; }
  }

  function setPrefs(patch) {
    return mutate(function (s) { Object.assign(s.prefs, patch); });
  }

  /* ------------------------------------------------------------
     export and import

     The whole timetable as one JSON file: preferences, busy
     blocks and every scheduled block. Importing replaces rather
     than merges, because two timetables interleaved is not a
     timetable, and it says what it is about to replace first.
     ------------------------------------------------------------ */

  function exportData() {
    const s = get();
    return {
      kind: "revision-tracker-timetable",
      version: 1,
      exportedAt: new Date().toISOString(),
      prefs: s.prefs,
      days: s.days,
      generatedAt: s.generatedAt
    };
  }

  function describe(data) {
    const days = Object.keys(data.days || {});
    let blocks = 0;
    days.forEach(function (d) { blocks += (data.days[d] || []).length; });
    const subs = Object.keys((data.prefs || {}).subjects || {});
    return {
      days: days.length, blocks: blocks, subjects: subs.length,
      busy: ((data.prefs || {}).busy || []).length,
      from: days.sort()[0] || null, to: days.sort()[days.length - 1] || null
    };
  }

  function importData(data) {
    if (!data || data.kind !== "revision-tracker-timetable") {
      throw new Error("That is not a timetable file");
    }
    mutate(function (s) {
      s.prefs = Object.assign(blank().prefs, data.prefs || {});
      s.days = data.days || {};
      s.generatedAt = data.generatedAt || null;
      s.setUp = true;
    });
    return describe(data);
  }

  /* Blocks brought in from elsewhere, added to the days rather than replacing
     them. They arrive marked as yours, so the next Generate builds revision
     around them; anything already sitting at the same time is cleared out of
     the way, because two blocks at eight o'clock is not a timetable. */
  function mergeDays(days) {
    snapshot();
    return mutate(function (s) {
      Object.keys(days || {}).forEach(function (iso) {
        const incoming = days[iso] || [];
        const existing = (s.days[iso] || []).filter(function (b) {
          return !incoming.some(function (n) {
            return overlaps(toMins(b.from), toMins(b.to), toMins(n.from), toMins(n.to));
          });
        });
        s.days[iso] = existing.concat(incoming)
          .sort(function (a, b) { return toMins(a.from) - toMins(b.from); });
      });
      s.setUp = true;
    });
  }

  function clearAll() {
    state = blank();
    save();
    return state;
  }

  return {
    DAY_NAMES: DAY_NAMES, SHORT_DAYS: SHORT_DAYS, PALETTE: PALETTE, GRADES: GRADES,
    load: load, get: get, save: save, reloadForUser: reloadForUser, replaceAll: replaceAll,
    toMins: toMins, toClock: toClock,
    subjects: subjects, readSubject: readSubject,
    recommend: recommend, weeklyCapacity: weeklyCapacity,
    freeRuns: freeRuns, freeMinutesOn: freeMinutesOn, placeableOn: placeableOn, busyOn: busyOn,
    generate: generate, reflow: reflow, blocksOn: blocksOn, dayTotals: dayTotals,
    undo: undo, canUndo: canUndo, snapshot: snapshot,
    rankWork: rankWork, tariffTrouble: tariffTrouble,
    addBlock: addBlock, updateBlock: updateBlock, removeBlock: removeBlock, moveBlock: moveBlock,
    slotsFor: slotsFor, slotsToday: slotsToday,
    rules: rules, setRules: setRules, defaultRules: defaultRules,
    recommendRules: recommendRules, groupsOf: groupsOf,
    setSubject: setSubject, setWindow: setWindow,
    addBusy: addBusy, updateBusy: updateBusy, removeBusy: removeBusy, setPrefs: setPrefs,
    addFlex: addFlex, removeFlex: removeFlex,
    stepsFor: stepsFor, rankChapters: rankChapters, chapterQueues: chapterQueues,
    exportData: exportData, importData: importData, mergeDays: mergeDays,
    describe: describe, clearAll: clearAll
  };
})();
