/* ============================================================
Scheduler, priority scoring, spaced repetition and
   day-by-day plan generation.
   ============================================================ */

const Scheduler = (function () {

  /* Foundational topics that other topics depend on. Being weak here
     costs marks everywhere, so they get a prerequisite bonus. */
  const PREREQ = {
    "pu1-1": 22, "pu1-3": 20, "pu1-4": 18, "pu1-5": 14, // index laws, factorising, fractional indices, surds
    "pu2-1": 24, "pu2-2": 20, "pu2-5": 14, // solving quadratics, completing the square, discriminant
    "pu5-2": 12, "pu5-3": 12, // equations of lines, perpendicular gradients
    "pu12-3": 18, "pu12-5": 14, // differentiating x^n and multi-term expressions
    "pu13-1": 16, "pu13-2": 12, // integrating x^n, indefinite integrals
    "pu14-5": 12, "pu10-3": 12, // laws of logarithms, trig identities
    "sm9-3": 16, "sm9-4": 14, // suvat
    "sm6-3": 12, "sm2-4": 10 // cumulative binomial, standard deviation
  };

  const KIND = {
    learn: { label: "Full revision session", svg: "play" },
    video: { label: "Chapter summary video", svg: "play" },
    questions:{ label: "Exam-style questions", svg: "pencil" },
    retrieval:{ label: "Retrieval practice", svg: "refresh" },
    paper: { label: "Past paper", svg: "paper" },
    errors: { label: "Error analysis", svg: "alert" },
    formula: { label: "Formula & recall drill", svg: "star" }
  };

  /* ---------- priority scoring ---------- */
  function priority(id, opts) {
    opts = opts || {};
    const inf = Store.info(id);
    if (!inf) return { score: 0, reasons: [] };
    const t = Store.topic(id);
    const eff = Metrics.effectiveRag(id);
    const covered = opts.simCovered != null ? opts.simCovered : Metrics.isCovered(id);
    const reasons = [];
    let s = 0;

    // 1. RAG
    if (!t.rag) { s += 80; reasons.push("it has not been assessed yet"); }
    else if (eff.rag === "red") { s += 100; reasons.push("you rated it RED"); }
    else if (eff.rag === "amber") { s += 58; reasons.push("you rated it AMBER"); }
    else { s += 20; }
    if (eff.adjusted && eff.reasons.length) {
      reasons.push("it was moved from " + eff.base.toUpperCase() + " to " + eff.rag.toUpperCase() + " because " + eff.reasons[0]);
    }

    // 2. never covered
    if (!covered) {
      s += 46;
      if (!t.videoDone && !t.questionSets.length) reasons.push("you have never revised it");
      else reasons.push("you have started it but not finished the full workflow");
    }

    // 3. importance / exam frequency
    s += (inf.sub.importance || 3) * 8;
    if ((inf.sub.importance || 3) >= 5) reasons.push("it appears on almost every paper");

    // 4. prerequisite value
    if (PREREQ[id]) { s += PREREQ[id]; reasons.push("it underpins several other topics"); }

    // 5. time since last revision
    const since = opts.simLast != null ? opts.simLast : Metrics.daysSinceRevised(id);
    if (since === null) { s += 18; }
    else {
      s += Math.min(since, 21) * 2.4;
      if (since >= 4) reasons.push("you have not revised it for " + since + " day" + (since === 1 ? "" : "s"));
    }

    // 6. question performance
    const acc = Metrics.accuracy(id);
    if (acc !== null) {
      if (acc < 50) { s += 32; reasons.push("you scored " + acc + "% on your questions"); }
      else if (acc < 65) { s += 18; reasons.push("you scored " + acc + "% on your questions"); }
      else if (acc >= 85) { s -= 14; }
    }

    // 7. diminishing returns on repeated attempts
    s -= Math.min(18, t.sessions.length * 6);

    // 8. past-paper losses
    const loss = Metrics.paperLoss(id);
    if (loss.marks > 0) {
      s += loss.marks * 3;
      if (loss.papers >= 2) { s += 12; reasons.push("it has cost you marks in " + loss.papers + " different past papers"); }
      else if (loss.marks >= 3) reasons.push("you lost " + loss.marks + " marks on it in a past paper");
    }

    // 9. spaced-repetition due
    const due = opts.simDue != null ? opts.simDue : (t.nextReview ? Metrics.diffDays(t.nextReview, Metrics.today()) >= 0 : false);
    if (due && covered) { s += 26; reasons.push("it is due for a spaced-repetition review"); }

    // 10. the method's order: Pure, then Statistics, then Mechanics, and
    // earlier chapters before later ones. A green rating changes how
    // urgent a chapter is, never whether you do it.
    if (typeof isChapterId === "function" && isChapterId(id)) {
      const seq = Journey.sequenceIndex(id); // 0..3xx, lower = sooner
      s += Math.max(0, 120 - seq * 0.9);
      const phase = Journey.currentPhase();
      const inf2 = CHAPTER_INDEX[id];
      if (phase && phase.paper && inf2.paper.id !== phase.paper) s -= 90; // not this phase yet
      if (Journey.chapterComplete(id)) s -= 60;
    }

    // 11. manual controls
    s += (t.priorityBoost || 0) * 25;
    if (t.priorityBoost > 0) reasons.push("you manually raised its priority");
    if (t.pinned) { s += 250; reasons.push("you pinned it"); }

    return { score: Math.round(s), reasons: reasons, eff: eff, covered: covered, acc: acc, info: inf };
  }

  function whyText(p, kindLabel) {
    if (!p.reasons.length) return "Scheduled as routine maintenance so it stays fresh.";
    const r = p.reasons.slice(0, 3);
    let out = r[0];
    if (r.length === 2) out = r[0] + ", and " + r[1];
    if (r.length === 3) out = r[0] + ", " + r[1] + ", and " + r[2];
    return out.charAt(0).toUpperCase() + out.slice(1) + ".";
  }

  /* ---------- daily budget ---------- */
  function budgetFor(dateIso) {
    const s = Store.settings();
    if (s.dailyOverrides[dateIso] != null) return s.dailyOverrides[dateIso];
    const wd = Metrics.parseISO(dateIso).getDay();
    if (s.restDays.indexOf(wd) >= 0) return 0;
    return s.dailyMinutes;
  }

  /* ---------- past paper cadence ---------- */
  function paperTaskFor(dateIso, daysToExam, coveredPct, idx) {
    const s = Store.settings();
    const papersEnabled = s.papers;
    // full papers only make sense once you have actually covered most of the content
    const wantFull = coveredPct >= 45 && (daysToExam <= 10 || coveredPct >= 80);
    let target, minutes, title, sub;

    /* Which papers exist depends on the subject. Hard-coding the maths ones
       here told an Economics student to sit "AS Pure past-paper section". */
    const subject = (typeof Subjects !== "undefined") ? Subjects.current() : null;
    const papers = (subject && subject.papers) || [
      { key: "pure",  name: "AS Pure",                   paper: "Paper 1", full: 120, section: 50 },
      { key: "stats", name: "AS Statistics & Mechanics", paper: "Paper 2", full: 75,  section: 40 }
    ];
    /* honour the per-paper switches in Settings where they name a paper */
    const on = papers.filter(function (p) {
      return papersEnabled[p.key] === undefined ? true : !!papersEnabled[p.key];
    });
    const pick = (on.length ? on : papers)[idx % (on.length || papers.length)];

    target = pick.name;
    minutes = (wantFull ? pick.full + 35 : pick.section + 15);
    title = wantFull ? "Full timed " + pick.name + " paper (" + pick.paper + ")"
                     : pick.name + " past-paper section";
    sub = wantFull ? "Do it timed, mark it, then log every lost mark in the error log."
                   : "Timed section, then mark and log your errors.";
    return { kind: "paper", paperTarget: target, full: wantFull, minutes: minutes, title: title, note: sub };
  }

  /* ---------- plan generation ---------- */
  function generate(opts) {
    opts = opts || {};
    const st = Store.get();
    const s = st.settings;
    const todayIso = Metrics.today();
    const examIso = s.examDate;
    const horizon = Math.min(200, Math.max(0, Metrics.diffDays(todayIso, examIso)));

    const activeIds = Store.planIds(); // the method works chapter by chapter

    /* simulation state per topic */
    const sim = {};
    activeIds.forEach(function (id) {
      const t = Store.topic(id);
      sim[id] = {
        covered: Metrics.isCovered(id),
        videoDone: t.videoDone,
        hasQuestions: t.questionSets.length > 0,
        lastDate: t.lastRevised,
        stage: t.reviewStage || 0,
        nextDue: t.nextReview,
        rag: Metrics.effectiveRag(id).rag,
        passes: 0
      };
    });

    /* preserve history: past days and already-completed tasks today */
    const oldDays = (st.plan && st.plan.days) || {};
    const days = {};
    Object.keys(oldDays).forEach(function (d) {
      if (Metrics.diffDays(d, todayIso) > 0) days[d] = oldDays[d]; // strictly in the past
    });
    /* Tasks the user owns survive regeneration:
       - anything already done or skipped today (history)
       - anything they added by hand or moved by hand, on any future day */
    let todayKeep = [];
    if (oldDays[todayIso]) {
      todayKeep = oldDays[todayIso].filter(function (t) {
        const ts = st.taskState[t.id];
        return (ts && (ts.status === "done" || ts.status === "skipped")) || t.manual || t.userMoved;
      });
    }
    const keptByDate = {};
    Object.keys(oldDays).forEach(function (d) {
      if (Metrics.diffDays(d, todayIso) <= 0 && d !== todayIso) { // today and later
        const keep = oldDays[d].filter(function (t) { return t.manual || t.userMoved; });
        if (keep.length) keptByDate[d] = keep;
      }
    });

    let paperCounter = 0;
    let cursor = todayIso;
    const scheduledIds = {};
    const coverageNow = Metrics.coverage();
    let coveredCount = coverageNow.covered;
    const totalTopics = activeIds.length || 1;

    for (let dayN = 0; dayN < horizon; dayN++) {
      const date = Metrics.addDays(todayIso, dayN);
      const daysToExam = Metrics.diffDays(date, examIso);
      let budget = budgetFor(date);
      const tasks = [];

      if (date === todayIso && todayKeep.length) {
        /* A skipped task didn't actually consume any time, so its slot is
        freed up for the ranking loop below to fill with something else - only tasks that were genuinely done, or deliberately placed by
           hand, eat into today's remaining budget. */
        todayKeep.forEach(function (t) {
          tasks.push(t);
          const skipped = (st.taskState[t.id] || {}).status === "skipped";
          if (!skipped) budget -= (t.minutes || 0);
        });
      } else if (keptByDate[date]) {
        keptByDate[date].forEach(function (t) { tasks.push(t); budget -= (t.minutes || 0); });
      }
      if (budget <= 0) { days[date] = tasks; continue; }

      const coveredPct = Math.round(coveredCount / totalTopics * 100);
      const finalWeek = daysToExam <= 7;
      const eve = daysToExam === 1;

      /* ---- Exam eve: light consolidation only ---- */
      if (eve) {
        const cap = Math.min(budget, 90);
        let used = 0;
        const redRows = rankRows(activeIds, sim, date).filter(function (r) { return r.p.eff.rag === "red"; }).slice(0, 3);
        tasks.push(mk(date, {
          kind: "formula", title: "Formula and key-fact recall (both papers)", minutes: 25,
          why: "It is the day before the exam. Short recall beats new content, go through the formulae you must memorise and the ones in the booklet."
        }));
        used += 25;
        if (Store.get().papers.length) {
          tasks.push(mk(date, {
            kind: "errors", title: "Read through your past-paper error log", minutes: 20,
            why: "Re-reading your own mistakes is the highest-value 20 minutes available tonight."
          }));
          used += 20;
        }
        redRows.forEach(function (r) {
          if (used + 20 > cap) return;
          tasks.push(mk(date, {
            kind: "retrieval", topicId: r.id, title: r.p.info.sub.name, minutes: 20,
            why: "Still your weakest area, light retrieval only, no new content tonight."
          }));
          used += 20;
        });
        days[date] = tasks;
        continue;
      }

      /* Was a given filler/slot kind skipped by hand today? If so, don't
      recreate an identical one, these slots (paper, errors, formula) are
         a deterministic rotation, not a pick from a pool, so regenerating
         after a skip would otherwise just respawn the exact same task and
         look like skipping did nothing. */
      function skippedToday(kind) {
        if (isDismissed(date, kind)) return true; // you removed it from this day
        return date === todayIso && oldDays[todayIso] && oldDays[todayIso].some(function (t) {
          return t.kind === kind && (st.taskState[t.id] || {}).status === "skipped";
        });
      }

      /* ---- past paper slot ----
         Final week normally means papers every other day. But sitting a full
         paper on content you have never seen is a poor use of the last week:
         if coverage is still low, keep covering topics and thin the papers out. */
      const underCovered = coveredPct < 50;
      const paperEveryNDays = finalWeek ? (underCovered ? 3 : 1.6)
                            : coveredPct >= 80 ? 2.2 : coveredPct >= 50 ? 3.2 : 4.5;
      // don't open day one with a past paper while nothing has been covered yet
      const paperAllowedToday = finalWeek || coveredPct >= 55 || dayN > 0;
      const wantPaper = paperAllowedToday &&
                        Math.floor(dayN / paperEveryNDays) > Math.floor((dayN - 1) / paperEveryNDays);
      const forcePaper = finalWeek && !underCovered && dayN % 2 === 0;
      if (!skippedToday("paper") && (wantPaper || forcePaper) && budget >= 55) {
        const pt = paperTaskFor(date, daysToExam, coveredPct, paperCounter);
        if (pt.minutes <= budget + 20) {
          const mins = Math.min(pt.minutes, budget);
          tasks.push(mk(date, {
            kind: "paper", title: pt.title, minutes: mins, paperTarget: pt.paperTarget, full: pt.full,
            why: finalWeek
              ? (underCovered
                ? "Final week, but you have only covered " + coveredPct + "% of the specification. Papers have been thinned out and kept to sections so there is still room to cover new content, a full paper on material you have never seen mostly measures what you already know you are missing."
                 : "Final week: full timed papers under exam conditions are the highest-value work left.")
              : (coveredPct >= 55
                 ? "You have covered " + coveredPct + "% of the specification, so it is time to start putting topics together under time pressure."
                 : "Even early on, regular exam-condition practice stops revision becoming passive. " + pt.note)
          }));
          budget -= mins;
          paperCounter++;
        }
      }

      /* ---- error analysis in later phases ---- */
      if (finalWeek && st.papers.length > 0 && dayN % 2 === 1 && budget >= 25 && !skippedToday("errors")) {
        tasks.push(mk(date, {
          kind: "errors", title: "Error analysis: review your recurring mistakes", minutes: 25,
          why: "Final week: fixing repeated mistakes recovers marks faster than learning anything new."
        }));
        budget -= 25;
      }

      /* ---- topic work ---- */
      const rows = rankRows(activeIds, sim, date);
      for (let i = 0; i < rows.length && budget >= 15; i++) {
        const r = rows[i];
        const id = r.id;
        if (tasks.some(function (t) { return t.topicId === id; })) continue;
        if (isDismissed(date, id)) continue; // taken off this day by hand
        const m = subMinutes(r.p.info.sub);
        const simT = sim[id];

        let kind, minutes, title, why;

        if (!simT.covered) {
          const needVideo = !simT.videoDone && !(finalWeek && simT.hasQuestions);
          /* Use the real remaining playlist time where the episode lengths
             have been entered, so the plan reflects the actual watch, not a
             generic per-chapter estimate. */
          let videoMins = m.video;
          if (needVideo && typeof isChapterId === "function" && isChapterId(id)) {
            const vm = Journey.videoMinutes(id);
            if (vm && vm.remaining > 0) videoMins = vm.remaining;
          }
          minutes = (needVideo ? videoMins : 0) + m.questions + m.review;
          kind = "learn";
          title = r.p.info.sub.name;
          why = whyText(r.p);
          if (finalWeek && !needVideo) why += " Final week: skipping the video, go straight to questions.";
          if (minutes > budget) {
            // shrink: questions only
            if (m.questions + 8 <= budget) { minutes = m.questions + 8; kind = "questions"; why += " Only " + Metrics.fmtMins(budget) + " left today, so this is a questions-only slot."; }
            else continue;
          }
        } else {
          kind = "retrieval";
          minutes = m.retrieval;
          title = r.p.info.sub.name;
          why = whyText(r.p);
          if (minutes > budget) continue;
        }

        tasks.push(mk(date, {
          kind: kind, topicId: id, title: title, minutes: minutes, why: why,
          rag: r.p.eff.rag, score: r.score
        }));
        budget -= minutes;
        scheduledIds[id] = true;

        /* advance simulation */
        if (!simT.covered) { simT.covered = true; simT.videoDone = true; simT.hasQuestions = true; coveredCount++; }
        simT.lastDate = date;
        simT.passes++;
        simT.stage = Math.min(simT.stage + 1, 4);
        const gap = [1, 3, 7, 14, 24][simT.stage];
        const scale = simT.rag === "red" ? 0.5 : simT.rag === "amber" ? 0.75 : 1;
        simT.nextDue = Metrics.addDays(date, Math.max(1, Math.round(gap * scale)));
      }

      /* ---- formula drill filler ---- */
      if (budget >= 15 && (finalWeek || daysToExam <= 21) && !skippedToday("formula")) {
        tasks.push(mk(date, {
          kind: "formula", title: "Formula recall drill", minutes: Math.min(budget, 15),
          why: "Short daily recall of formulae you must memorise (they are not all in the booklet)."
        }));
        budget -= 15;
      }

      days[date] = tasks;
    }

    const unscheduled = activeIds.filter(function (id) { return !sim[id].covered; });

    return {
      generatedAt: new Date().toISOString(),
      days: days,
      unscheduled: unscheduled,
      paperSlots: paperCounter
    };
  }

  function rankRows(activeIds, sim, date) {
    return activeIds.map(function (id) {
      const simT = sim[id];
      const lastGap = simT.lastDate ? Metrics.diffDays(simT.lastDate, date) : null;
      const due = simT.nextDue ? Metrics.diffDays(simT.nextDue, date) >= 0 : false;
      const p = priority(id, { simCovered: simT.covered, simLast: lastGap, simDue: due });
      let score = p.score;
      // strongly damp topics already covered and not yet due
      if (simT.covered && !due) score -= 70;
      if (simT.covered) score -= simT.passes * 10;
      return { id: id, p: p, score: score };
    }).sort(function (a, b) { return b.score - a.score; });
  }

  let taskSeq = 0;
  function mk(date, data) {
    taskSeq++;
    return Object.assign({
      id: date + "-" + (data.kind || "t") + "-" + (data.topicId || "x") + "-" + taskSeq,
      date: date, kind: data.kind, minutes: Math.round(data.minutes || 30)
    }, data);
  }

  /* ---------- public actions ---------- */
  function regenerate(reason) {
    Store.mutate(function (st) {
      st.plan = generate();
      if (reason) Store.log("Plan regenerated: " + reason, "plan");
    });
    return Store.get().plan;
  }

  function tasksFor(dateIso) {
    const st = Store.get();
    if (!st.plan || !st.plan.days) return [];
    return (st.plan.days[dateIso] || []).map(function (t) {
      const ts = st.taskState[t.id] || {};
      return Object.assign({}, t, { status: ts.status || "pending" });
    });
  }

  function setTaskStatus(taskId, status) {
    Store.mutate(function (st) {
      st.taskState[taskId] = Object.assign(st.taskState[taskId] || {}, { status: status, at: new Date().toISOString() });
    });
  }

  function rescheduleTask(taskId, newDate) {
    Store.mutate(function (st) {
      const days = st.plan.days;
      let found = null, fromDate = null;
      Object.keys(days).forEach(function (d) {
        days[d].forEach(function (t) { if (t.id === taskId) { found = t; fromDate = d; } });
      });
      if (!found) return;
      days[fromDate] = days[fromDate].filter(function (t) { return t.id !== taskId; });
      found.date = newDate;
      found.userMoved = true; // survives future regeneration
      if (!days[newDate]) days[newDate] = [];
      days[newDate].push(found);
      Store.log("Moved “" + found.title + "” to " + Metrics.fmtDate(newDate), "plan");
    });
  }

  function addTask(dateIso, data) {
    Store.mutate(function (st) {
      if (!st.plan) st.plan = { generatedAt: new Date().toISOString(), days: {} };
      if (!st.plan.days[dateIso]) st.plan.days[dateIso] = [];
      st.plan.days[dateIso].push(mk(dateIso, Object.assign({ manual: true }, data)));
    });
  }

  /* ---------- taking something off a day for good ----------
     Deleting a generated task is not enough on its own: the next
     regeneration would put it straight back, which is exactly what used to
     happen with skipped past papers. So a removal is recorded against that
     date, by topic for a topic task, by kind for a paper, error-log or
     formula slot, and generate() honours it.

     Skip and Remove are deliberately different. Skip leaves the task on the
     day as history and frees the time for something else; Remove takes it
     off the day altogether. */
  function dismissedOn(dateIso) {
    const d = Store.get().dayDismissed || {};
    return d[dateIso] || [];
  }
  function isDismissed(dateIso, key) { return dismissedOn(dateIso).indexOf(key) >= 0; }

  function dismiss(dateIso, key) {
    Store.mutate(function (st) {
      if (!st.dayDismissed) st.dayDismissed = {};
      if (!st.dayDismissed[dateIso]) st.dayDismissed[dateIso] = [];
      if (st.dayDismissed[dateIso].indexOf(key) < 0) st.dayDismissed[dateIso].push(key);
    });
  }
  function undismiss(dateIso, key) {
    Store.mutate(function (st) {
      if (!st.dayDismissed || !st.dayDismissed[dateIso]) return;
      st.dayDismissed[dateIso] = st.dayDismissed[dateIso].filter(function (k) { return k !== key; });
    });
  }

  /* Remove a task from its day and stop it coming back there. */
  function dismissTask(taskId) {
    const st = Store.get();
    let found = null, onDate = null;
    Object.keys((st.plan && st.plan.days) || {}).forEach(function (d) {
      st.plan.days[d].forEach(function (t) { if (t.id === taskId) { found = t; onDate = d; } });
    });
    if (!found) return null;
    /* one you added yourself just goes, there is nothing to suppress */
    if (!found.manual) dismiss(onDate, found.topicId || found.kind);
    removeTask(taskId);
    return { task: found, date: onDate };
  }

  /* ---------- putting something on today by hand ----------
  "I want to do Integration today", even though the planner did not pick
     it. Tasks added this way are marked manual, so a plan regeneration
     leaves them exactly where you put them. */
  function todayTaskFor(topicId) {
    return tasksFor(Metrics.today()).filter(function (t) { return t.topicId === topicId; })[0] || null;
  }
  function isOnToday(topicId) { return !!todayTaskFor(topicId); }

  /* How long this topic would take, so the day's budget stays honest */
  function plannedMinutesFor(id) {
    const inf = Store.info(id);
    if (!inf) return 30;
    const m = subMinutes(inf.sub);
    if (Metrics.isCovered(id)) return m.retrieval;
    let video = m.video;
    if (typeof isChapterId === "function" && isChapterId(id)) {
      const vm = Journey.videoMinutes(id);
      if (vm && vm.remaining > 0) video = vm.remaining;
      if (Journey.state(id).steps.video.done) video = 0;
    }
    return video + m.questions + m.review;
  }

  function addToToday(id) {
    if (isOnToday(id)) return false;
    const inf = Store.info(id);
    if (!inf) return false;
    undismiss(Metrics.today(), id); // you changed your mind; let it back
    const covered = Metrics.isCovered(id);
    addTask(Metrics.today(), {
      kind: covered ? "retrieval" : "learn",
      topicId: id,
      title: inf.sub.name,
      minutes: plannedMinutesFor(id),
      rag: Metrics.effectiveRag(id).rag,
      why: "You added this to today yourself, so it stays put when the plan recalculates."
    });
    return true;
  }

  function removeFromToday(id) {
    const t = todayTaskFor(id);
    if (!t) return false;
    removeTask(t.id);
    return true;
  }

  function removeTask(taskId) {
    Store.mutate(function (st) {
      Object.keys(st.plan.days).forEach(function (d) {
        st.plan.days[d] = st.plan.days[d].filter(function (t) { return t.id !== taskId; });
      });
      delete st.taskState[taskId];
    });
  }

  /* "What should I do now?" */
  function whatNow(availableMins) {
    const todayIso = Metrics.today();
    const ph = Metrics.phase();
    if (ph.key === "after") return { none: true, message: "Your exam date has passed. Well done, the tracker is now read-only for reference." };

    const pending = tasksFor(todayIso).filter(function (t) { return t.status === "pending"; });
    let pick = null;
    if (availableMins) {
      pick = pending.filter(function (t) { return t.minutes <= availableMins + 10; })[0] || null;
      if (!pick && pending.length) {
        // offer a shortened version of the top task
        const t = pending[0];
        pick = Object.assign({}, t, { minutes: availableMins, shortened: true });
      }
    } else {
      pick = pending[0] || null;
    }

    if (pick) return { task: pick, fromPlan: true, phase: ph };

    /* nothing left in today's plan, compute best next thing */
    const rows = Store.planIds().map(function (id) {
      return { id: id, p: priority(id) };
    }).sort(function (a, b) { return b.p.score - a.p.score; });
    if (!rows.length) return { none: true, message: "No topics are active. Check your Settings." };
    const top = rows[0];
    const m = subMinutes(top.p.info.sub);
    const covered = Metrics.isCovered(top.id);
    return {
      task: {
        id: "adhoc-" + top.id, date: todayIso, topicId: top.id, kind: covered ? "retrieval" : "learn",
        title: top.p.info.sub.name, minutes: covered ? m.retrieval : m.video + m.questions + m.review,
        why: whyText(top.p), rag: top.p.eff.rag
      },
      fromPlan: false, phase: ph, bonus: true
    };
  }

  /* Called after a revision session completes */
  function completeSession(id, payload) {
    Store.mutate(function (st) {
      const t = st.topics[id];
      const todayIso = Metrics.today();
      t.lastRevised = todayIso;
      t.reviewStage = Math.min((t.reviewStage || 0) + 1, 4);
      t.reviewsDone = (t.reviewsDone || 0) + 1;
      t.nextReview = Metrics.nextReviewDate(id, todayIso);
      t.covered = Metrics.isCovered(id);
      t.sessions.push(Object.assign({ date: todayIso }, payload || {}));
      Store.log("Completed a revision session on " + Store.info(id).sub.name, "session");
    });
    regenerate("session completed");
  }

  return {
    KIND: KIND, priority: priority, whyText: whyText, generate: generate, regenerate: regenerate,
    tasksFor: tasksFor, setTaskStatus: setTaskStatus, rescheduleTask: rescheduleTask,
    addTask: addTask, removeTask: removeTask, whatNow: whatNow, completeSession: completeSession,
    dismissTask: dismissTask, dismissedOn: dismissedOn, isDismissed: isDismissed,
    undismiss: undismiss,
    todayTaskFor: todayTaskFor, isOnToday: isOnToday, addToToday: addToToday,
    removeFromToday: removeFromToday, plannedMinutesFor: plannedMinutesFor,
    budgetFor: budgetFor
  };
})();
