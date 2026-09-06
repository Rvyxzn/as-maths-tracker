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
        breakMins: 15
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
    return state;
  }

  function get() { return state || load(); }

  function save() {
    try { localStorage.setItem(key(), JSON.stringify(get())); }
    catch (e) { if (typeof UI !== "undefined") UI.toast("Could not save the timetable", "bad"); }
  }

  function mutate(fn) { const s = get(); fn(s); save(); return s; }

  function reloadForUser() { state = null; return load(); }

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

  function lastPracticeTest() {
    const done = (Store.get().practiceTests || []).filter(function (t) { return t.finishedAt; })
      .sort(function (a, b) { return String(b.finishedAt).localeCompare(String(a.finishedAt)); })[0];
    return done ? Metrics.diffDays(String(done.finishedAt).slice(0, 10), Metrics.today()) : null;
  }

  /* The open subject's work, best first: its chapters, plus whatever else it
     is short of this week. */
  function rankWork() {
    const items = rankChapters().map(function (c) {
      return { kind: "chapter", cid: c.cid, label: c.label, name: c.name,
               score: c.score, why: c.why, rag: c.rag, steps: c.steps,
               minutes: c.minutes };
    });

    const reds = items.filter(function (i) { return i.rag === "red"; }).length;
    const papers = (Subjects.current().papers || [])[0];
    const target = Store.settings().pastPaperTargetPerWeek || 0;

    if (target && papersThisWeek() < target) {
      items.splice(Math.min(2, items.length), 0, {
        kind: "paper", cid: null,
        label: "Past paper" + (papers ? " \u00b7 " + papers.name : ""),
        name: "Past paper", score: 9999, rag: null,
        why: "you are short of your " + target + " past paper" + (target === 1 ? "" : "s") + " this week",
        minutes: papers ? (papers.section || 45) : 60,
        steps: [{ label: "Sit it timed", detail: "no notes, no pausing", mins: papers ? (papers.section || 45) : 60 },
                { label: "Mark it", detail: "against the real scheme", mins: 20 },
                { label: "Log every lost mark", detail: "the error log is what makes it worth doing", mins: 10 }]
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

  /* Build a fortnight (or whatever span is asked for) from today.

     Blocks you have moved, added or pinned survive: `mine` marks a block as
     yours, and a regeneration schedules around it rather than over it. */
  function generate(opts) {
    opts = opts || {};
    const days = opts.days || 14;
    const startIso = opts.from || Metrics.today();
    const s = get();
    const blk = s.prefs.blockMins || 45;
    const brk = s.prefs.breakMins || 15;

    const list = subjects().filter(function (x) { return !x.off; });
    if (!list.length) return { made: 0, days: 0 };

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
    list.forEach(function (x) { cursor[x.id] = 0; });

    let made = 0, touched = 0;
    for (let i = 0; i < days; i++) {
      const iso = Metrics.addDays(startIso, i);
      const weekday = new Date(iso + "T00:00:00").getDay();
      if (i > 0 && i % 7 === 0) Object.keys(weekly).forEach(function (k) { owed[k] = weekly[k]; });

      const keep = (s.days[iso] || []).filter(function (b) { return b.mine; });
      let runs = freeRuns(weekday);
      if (!runs.length) { s.days[iso] = keep; continue; }

      const placed = keep.slice();
      /* how much of each item is still unplaced, so a long chapter can run
         over two sittings instead of being cut to fit one */
      const carry = opts.carry || (opts.carry = {});

      /* Commitments whose length you know but not their time — the gym for
         two hours on Monday, some time. They go in before revision so they
         get the room, and they take the end of a stretch rather than the
         middle, because splitting an evening in half wastes both halves. */
      (s.prefs.flex || []).forEach(function (f) {
        if ((f.days || []).indexOf(weekday) < 0) return;
        const want = f.mins || 60;
        let best = null;
        runs.forEach(function (r) {
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
          /* whoever is owed the most goes next, so the week evens out */
          let best = null;
          list.forEach(function (x) { if (!best || owed[x.id] > owed[best.id]) best = x; });
          if (!best || owed[best.id] <= 0) { at = run[1]; break; }
          /* the next chapter that subject owes work to, cycling round once
             the ranking runs out rather than leaving a block unnamed */
          const q = queues[best.id] || [];
          const ch = q.length ? q[cursor[best.id] % q.length] : null;

          /* A block is as long as the work is, not a fixed 45 minutes. You
             will not finish Quadratics between two and quarter to three, so
             the block runs for what the chapter still needs — capped by the
             room left in the evening and by how long anyone can usefully
             sit at one thing, and carried into another sitting if it does
             not fit. */
          const key = ch ? (best.id + "|" + (ch.cid || ch.kind)) : best.id;
          let need = ch ? (carry[key] != null ? carry[key] : ch.minutes) : blk;
          const room = Math.min(run[1] - at, owed[best.id] > 0 ? owed[best.id] : blk);
          const maxSit = Math.max(blk, s.prefs.maxSitting || 90);
          let len = Math.min(need, room, maxSit);
          len = Math.max(20, Math.round(len / 5) * 5);
          if (at + len > run[1]) len = run[1] - at;
          if (len < 20) { at = run[1]; break; }

          const partOf = ch && need > len;
          if (ch) carry[key] = Math.max(0, need - len);
          if (ch && carry[key] === 0) cursor[best.id]++;
          else if (!ch) cursor[best.id]++;

          const steps = ch && ch.steps
            ? ch.steps.filter(function (x) { return !x.done; })
                .map(function (x) { return { label: x.label, detail: x.detail, mins: x.mins }; })
            : [];
          placed.push({
            id: uid(), subjectId: best.id,
            label: (ch ? ch.label : best.name) + (partOf ? " \u00b7 part" : ""),
            subjectName: best.name,
            chapterId: ch ? ch.cid : null,
            work: ch ? ch.kind : "chapter",
            why: ch ? ch.why : "",
            rag: ch ? ch.rag : null,
            eta: ch ? ch.minutes : null,
            steps: steps,
            from: toClock(at), to: toClock(at + len),
            colour: best.colour, kind: "revision", mine: false
          });
          owed[best.id] -= len;
          made++;
          at += len + brk;
        }
      });
      touched++;
      placed.sort(function (a, b) { return toMins(a.from) - toMins(b.from); });
      s.days[iso] = placed;
    }
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
    return mutate(function (s) {
      if (!s.days[iso]) s.days[iso] = [];
      s.days[iso].push(Object.assign({ id: uid(), kind: "revision", mine: true }, block));
      s.days[iso].sort(function (a, b) { return toMins(a.from) - toMins(b.from); });
    });
  }

  function updateBlock(iso, id, patch) {
    return mutate(function (s) {
      (s.days[iso] || []).forEach(function (b) {
        if (b.id === id) { Object.assign(b, patch); b.mine = true; }
      });
      (s.days[iso] || []).sort(function (a, b) { return toMins(a.from) - toMins(b.from); });
    });
  }

  function removeBlock(iso, id) {
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

  function clearAll() {
    state = blank();
    save();
    return state;
  }

  return {
    DAY_NAMES: DAY_NAMES, SHORT_DAYS: SHORT_DAYS, PALETTE: PALETTE, GRADES: GRADES,
    load: load, get: get, save: save, reloadForUser: reloadForUser,
    toMins: toMins, toClock: toClock,
    subjects: subjects, readSubject: readSubject,
    recommend: recommend, weeklyCapacity: weeklyCapacity,
    freeRuns: freeRuns, freeMinutesOn: freeMinutesOn, placeableOn: placeableOn, busyOn: busyOn,
    generate: generate, reflow: reflow, blocksOn: blocksOn, dayTotals: dayTotals,
    rankWork: rankWork, tariffTrouble: tariffTrouble,
    addBlock: addBlock, updateBlock: updateBlock, removeBlock: removeBlock, moveBlock: moveBlock,
    slotsFor: slotsFor, slotsToday: slotsToday,
    setSubject: setSubject, setWindow: setWindow,
    addBusy: addBusy, updateBusy: updateBusy, removeBusy: removeBusy, setPrefs: setPrefs,
    addFlex: addFlex, removeFlex: removeFlex,
    stepsFor: stepsFor, rankChapters: rankChapters, chapterQueues: chapterQueues,
    exportData: exportData, importData: importData, describe: describe, clearAll: clearAll
  };
})();
