/* ============================================================
Metrics, derived values: effective RAG, accuracy, coverage,
   phases, workload feasibility, weakness detection.
   ============================================================ */

const Metrics = (function () {

  const DAY = 86400000;

  function parseISO(iso) { const p = String(iso).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function iso(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function addDays(isoStr, n) { const d = parseISO(isoStr); d.setDate(d.getDate() + n); return iso(d); }
  function diffDays(aIso, bIso) { return Math.round((parseISO(bIso) - parseISO(aIso)) / DAY); }
  function today() { return iso(new Date()); }

  function fmtDate(isoStr, opts) {
    const d = parseISO(isoStr);
    return d.toLocaleDateString("en-GB", opts || { weekday: "short", day: "numeric", month: "short" });
  }
  function fmtDateLong(isoStr) {
    return parseISO(isoStr).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }
  function fmtMins(m) {
    m = Math.round(m);
    if (m < 60) return m + " min";
    const h = Math.floor(m / 60), r = m % 60;
    return r ? h + "h " + r + "m" : h + "h";
  }

  /* ---------- exam timing ---------- */
  function daysLeft() { return Math.max(0, diffDays(today(), Store.settings().examDate)); }
  function examPassed() { return diffDays(today(), Store.settings().examDate) < 0; }
  function isExamDay() { return today() === Store.settings().examDate; }

  /* Phase of the revision campaign */
  function phase() {
    const d = daysLeft();
    if (examPassed()) return { key: "after", name: "Exam complete", desc: "Your exam date has passed." };
    if (isExamDay()) return { key: "examday", name: "Exam day", desc: "Good luck." };
    if (d === 1) return { key: "eve", name: "Exam eve mode",
      desc: "Light consolidation only: key formulas, your error log and short retrieval practice. No new content." };
    const cov0 = coverage().coveredPct;
    if (d <= 7) return { key: "final", name: "Final week mode",
      desc: cov0 < 50
      ? "Timed paper sections, error analysis and red topics, but with only " + cov0 + "% of the specification covered, the planner is still prioritising new content over full papers. Videos are suppressed for anything you have already done questions on."
        : "Timed papers, error analysis, red topics and formula recall. Videos are suppressed unless a topic has never been covered." };
    const cov = cov0;
    if (cov >= 85) return { key: "p3", name: "Phase 3, Final preparation",
      desc: "Full timed papers, marking, error analysis and rapid weak-topic revision." };
    if (cov >= 55) return { key: "p2", name: "Phase 2, Mixed practice",
      desc: "Mixed questions, past-paper sections and weak-topic revision alongside remaining new content." };
    return { key: "p1", name: "Phase 1, Specification coverage",
      desc: "Cover the specification: chapter videos and topic questions, with some past-paper practice." };
  }

/* "just now" / "20 minutes ago" / "yesterday", for telling you when you
     last stopped, which is only useful in human terms. */
  function relativeTime(iso) {
    if (!iso) return null;
    const then = new Date(iso).getTime();
    if (isNaN(then)) return null;
    const mins = Math.round((Date.now() - then) / 60000);
    if (mins < 2) return "just now";
    if (mins < 60) return mins + " minutes ago";
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? " hour ago" : " hours ago");
    const days = Math.round(hrs / 24);
    if (days === 1) return "yesterday";
    if (days < 30) return days + " days ago";
    return fmtDate(iso.slice(0, 10));
  }

  /* ---------- per-topic performance ---------- */
  /* Your score on recent question sets, as a percentage.

     This must be MARKS-based wherever marks were recorded. Counting only
     fully-correct questions punishes you twice for part-marks: 14/23 marks
     is 61%, but if only 3 of those 8 questions were perfect it looks like
     38%, which then drags your effective RAG down to RED and overrides a
     rating you correctly set to AMBER. Marks first, then a recorded pct,
     and only fall back to the fully-correct count when nothing better
     exists (older records, and the quick-log modal which has no marks). */
  /* A percentage means little without knowing how many marks it came off.
     GREEN needs at least a fair sample before it is offered. */
  const NOMINAL_SET_MARKS = 10; // assumed size of an old record with no marks
  const FAIR_MARKS = 12;
  const SOLID_MARKS = 30;
  const GREEN_MIN_MARKS = 20;

  /* Exam questions are real paper questions: harder, and much closer to what
     the exam actually asks than the in-app topic bank. They therefore pull
     more weight in a chapter's combined figure. Each source still reports
     its own plain percentage -- only the combined one is weighted, and it is
     always labelled as weighted so the numbers never disagree silently. */
  const EXAM_WEIGHT = 1.5;

  function accuracy(id) {
    const t = Store.topic(id);
    const sets = t.questionSets;
    if (!sets.length) return null;
    const recent = sets.slice(-3);
    /* Marks are the honest unit. Averaging the percentages instead let a
       2-mark set count the same as a 40-mark one, so getting two easy
       questions right looked exactly as good as a long set done well. */
    let mAvail = 0, mGot = 0;
    recent.forEach(function (s) {
      if (s.marksAvailable > 0 && s.marksAchieved != null) {
        mAvail += s.marksAvailable; mGot += s.marksAchieved;
        return;
      }
      /* older records kept only a percentage; give those a typical set's
         worth of marks so they still count, without guessing a size */
      const p = s.pct != null ? s.pct : (s.attempted ? s.correct / s.attempted * 100 : null);
      if (p != null) { mAvail += NOMINAL_SET_MARKS; mGot += NOMINAL_SET_MARKS * p / 100; }
    });
    if (!mAvail) return null;
    return Math.round(mGot / mAvail * 100);
  }

  /* How much evidence there is behind a topic's percentage. A score off a
     handful of marks is a hint; a score off most of a paper's worth of
     marks is a finding. Thresholds are in marks because that is what the
     exam is measured in. */
  function marksAttempted(id) {
    let marks = 0;
    (Store.topic(id).questionSets || []).forEach(function (s) {
      marks += (s.marksAvailable > 0 ? s.marksAvailable : NOMINAL_SET_MARKS);
    });
    return marks;
  }
  function confidenceOf(marks) {
    if (marks >= SOLID_MARKS) return { level: "solid", marks: marks, label: "solid evidence" };
    if (marks >= FAIR_MARKS) return { level: "fair", marks: marks, label: "a fair amount to go on" };
    return { level: "thin", marks: marks, label: "only " + marks + " mark" + (marks === 1 ? "" : "s") + " so far" };
  }
  function lastAccuracy(id) {
    const sets = Store.topic(id).questionSets;
    return sets.length ? sets[sets.length - 1].pct : null;
  }
  function bestAccuracy(id) {
    const sets = Store.topic(id).questionSets;
    if (!sets.length) return null;
    return Math.max.apply(null, sets.map(function (s) { return s.pct; }));
  }

  /* Marks lost on this topic across recorded past papers */
  function paperLoss(id) {
    let marks = 0, count = 0, papers = {};
    Store.get().papers.forEach(function (p) {
      (p.errors || []).forEach(function (e) {
        if (e.topicId === id) { marks += (+e.marks || 0); count++; papers[p.id] = true; }
      });
    });
    return { marks: marks, count: count, papers: Object.keys(papers).length };
  }

  /* ---------- effective RAG (performance overrides self-rating) ---------- */
  function effectiveRag(id) {
    const t = Store.topic(id);
    const base = t.rag;
    const reasons = [];
    const latestTest = typeof SchoolAssessments !== "undefined"
      ? SchoolAssessments.latestSignal(id) : { pct: null, assessment: null };
    if (!base && latestTest.pct === null) return { rag: null, base: null, reasons: [], adjusted: false };

    let level = base === "red" ? 0 : base === "amber" ? 1 : 2;
    /* A score from the most recently logged test is the freshest evidence
       there is, so it replaces rather than averages with older tests: log a
       result and the plan reacts to it the same day.

       It is trusted asymmetrically. A bad result drops the topic as far as
       it says, because there is no reading of 40% that means you are fine.
       A good result only lifts the topic one level, because one decent test
       is not enough to overturn your own judgement that a chapter is weak —
       rate it green yourself, or sit another, and it will get there. */
    if (latestTest.pct !== null) {
      const fromTest = latestTest.pct < 50 ? 0 : latestTest.pct < 65 ? 1 : 2;
      const capped = fromTest > level ? Math.min(fromTest, level + 1) : fromTest;
      const title = latestTest.assessment && latestTest.assessment.title;
      if (capped !== level) {
        reasons.push("your latest test" + (title ? " (“" + title + "”)" : "") +
                     " was " + latestTest.pct + "%");
      }
      level = capped;
    }
    const acc = accuracy(id);

    if (acc !== null) {
      if (acc < 50 && level > 0) { level = 0; reasons.push("you scored " + acc + "% on your recent questions"); }
      else if (acc < 65 && level > 1) { level = 1; reasons.push("you scored " + acc + "% on your recent questions"); }
      else if (acc >= 85 && level < 2 && t.covered) { level = Math.min(2, level + 1); reasons.push("you scored " + acc + "% on your recent questions"); }
      else if (acc >= 72 && level === 0) { level = 1; reasons.push("you scored " + acc + "% on your recent questions"); }
    }

    const loss = paperLoss(id);
    if (loss.marks >= 8 && level > 0) { level = Math.max(0, level - 1); reasons.push("you lost " + loss.marks + " marks on it across your past papers"); }
    else if (loss.marks >= 4 && level > 1) { level = 1; reasons.push("you lost " + loss.marks + " marks on it in past papers"); }

    const rag = level === 0 ? "red" : level === 1 ? "amber" : "green";
    return { rag: rag, base: base, reasons: reasons, adjusted: rag !== base };
  }

  /* ---------- topic completion checklist ---------- */
  function checklist(id) {
    const t = Store.topic(id);
    return {
      assessed: !!t.rag,
      video: !!t.videoDone,
      questions: t.questionSets.length > 0,
      marked: !!t.marked,
      postRag: t.sessions.some(function (s) { return s.ragAfter; }),
      reviewed: t.reviewsDone > 0
    };
  }
  function checklistScore(id) {
    const c = checklist(id);
    const keys = Object.keys(c);
    return { done: keys.filter(function (k) { return c[k]; }).length, total: keys.length, items: c };
  }
  function isCovered(id) {
    const c = checklist(id);
    return c.assessed && c.video && c.questions && c.marked && c.postRag;
  }

  /* ---------- aggregate coverage ---------- */
  function coverage(filterPaperId) {
    const ids = Store.activeSubIds().filter(function (id) {
      if (!filterPaperId) return true;
      const inf = Store.info(id); return inf && inf.paper.id === filterPaperId;
    });
    let assessed = 0, covered = 0, red = 0, amber = 0, green = 0, none = 0, videos = 0, questioned = 0;
    ids.forEach(function (id) {
      const t = Store.topic(id);
      if (t.rag) assessed++;
      if (isCovered(id)) covered++;
      if (t.videoDone) videos++;
      if (t.questionSets.length) questioned++;
      const e = effectiveRag(id).rag;
      if (e === "red") red++; else if (e === "amber") amber++; else if (e === "green") green++; else none++;
    });
    const n = ids.length || 1;
    return {
      total: ids.length, assessed: assessed, covered: covered, videos: videos, questioned: questioned,
      red: red, amber: amber, green: green, unassessed: none,
      assessedPct: Math.round(assessed / n * 100),
      coveredPct: Math.round(covered / n * 100),
      questionedPct: Math.round(questioned / n * 100)
    };
  }

  /* ---------- spaced repetition ---------- */
  /* intervals in days by stage, scaled by how strong the topic is */
  const INTERVALS = [1, 3, 7, 14, 24];
  function nextReviewDate(id, fromIso) {
    const t = Store.topic(id);
    const eff = effectiveRag(id).rag;
    let base = INTERVALS[Math.min(t.reviewStage, INTERVALS.length - 1)];
    if (eff === "red") base = Math.max(1, Math.round(base * 0.5));
    else if (eff === "amber") base = Math.max(1, Math.round(base * 0.75));
    // never schedule a review past the exam
    const target = addDays(fromIso || today(), base);
    const exam = Store.settings().examDate;
    return diffDays(target, exam) < 0 ? exam : target;
  }
  function isDue(id) {
    const t = Store.topic(id);
    return !!(t.nextReview && diffDays(t.nextReview, today()) >= 0);
  }
  function daysSinceRevised(id) {
    const t = Store.topic(id);
    if (!t.lastRevised) return null;
    return diffDays(t.lastRevised, today());
  }

  /* ---------- time actually spent today ---------- */
  /* Logged time plus whatever the live timer has accrued so far. */
  function timeDoneToday() {
    const logged = Store.timeLoggedOn(today());
    const t = Store.get().timer;
    const live = t ? Math.floor(Store.timerElapsedMs() / 60000) : 0;
    return logged + live;
  }
  function timeEntriesToday() { return (Store.get().timeLog || {})[today()] || []; }

  /* ---------- past papers ---------- */
  function paperStats() {
    const ps = Store.get().papers.filter(function (p) { return p.mark != null && p.total; });
    const sorted = ps.slice().sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); });
    const pcts = sorted.map(function (p) { return Math.round(p.mark / p.total * 100); });
    const avg = pcts.length ? Math.round(pcts.reduce(function (a, b) { return a + b; }, 0) / pcts.length) : null;
    const last3 = pcts.slice(-3);
    const trendAvg = last3.length ? Math.round(last3.reduce(function (a, b) { return a + b; }, 0) / last3.length) : null;
    return {
      count: Store.get().papers.length, scored: pcts.length, avg: avg, best: pcts.length ? Math.max.apply(null, pcts) : null,
      latest: pcts.length ? pcts[pcts.length - 1] : null, trendAvg: trendAvg, series: sorted, pcts: pcts,
      timed: Store.get().papers.filter(function (p) { return p.timed; }).length,
      full: Store.get().papers.filter(function (p) { return p.full; }).length
    };
  }

  /* A one-line picture of a subject without switching to it, for the subject
     menu. Reads that subject's saved file directly rather than activating it,
     because activation would swap the globals under the running view. */
  function subjectSummary(subjectId) {
    const s = Subjects.get(subjectId);
    if (!s) return { sections: 0, subs: 0, rated: 0 };

    const spec = s.spec();
    let sections = 0, subs = 0;
    spec.forEach(function (p) {
      sections += p.sections.length;
      p.sections.forEach(function (sec) { subs += sec.subs.length; });
    });

    let rated = 0;
    try {
      const base = (typeof Auth !== "undefined" && Auth.isSignedIn())
        ? Auth.storageKey() : STORAGE_KEY_BASE;
      const raw = localStorage.getItem(base + Subjects.storageSuffix(subjectId));
      if (raw) {
        const topics = (JSON.parse(raw) || {}).topics || {};
        Object.keys(topics).forEach(function (k) { if (topics[k] && topics[k].rag) rated++; });
      }
    } catch (e) { rated = 0; }

    return { sections: sections, subs: subs, rated: rated };
  }

  /* ---------- grade boundaries ----------
  A level Mathematics (9MA0) is marked out of 300: Paper 1 Pure 100,
  Paper 2 Pure 100, Paper 3 Statistics & Mechanics 100.

  IMPORTANT, READ BEFORE TRUSTING A GRADE
  Unlike the mark totals above, which are published and fixed, the marks
  below are INDICATIVE. They are a round-number reading of where recent
  9MA0 series have tended to sit, not a transcription of one published
  series, and Edexcel move them every year, sometimes by ten marks or
  more. They are here so a percentage has some human meaning, not so you
  can predict a grade.

  Check your own target against Pearson's published boundaries for the
  series you are sitting, and edit these numbers if you want them exact.

  They are also whole-subject boundaries: a set of topic questions on one
  chapter is not a whole paper, so a grade here indicates where that score
  would sit on a full paper. The UI repeats this wherever a grade shows. */
  const AS_MAX_MARK = 300;
  const AS_BOUNDARY_SERIES = "Edexcel 9MA0, indicative, not a published series";
  const AS_BOUNDARIES = [
    { grade: "A*", mark: 213 },
    { grade: "A", mark: 176 },
    { grade: "B", mark: 139 },
    { grade: "C", mark: 102 },
    { grade: "D", mark: 66 },
    { grade: "E", mark: 30 }
  ].map(function (b) {
    return { grade: b.grade, mark: b.mark, pct: b.mark / AS_MAX_MARK * 100 };
  });

  function estimateGrade(pct) {
    if (pct == null) return null;
    for (let i = 0; i < AS_BOUNDARIES.length; i++) {
      if (pct >= AS_BOUNDARIES[i].pct) return AS_BOUNDARIES[i].grade;
    }
    return "U";
  }

  /* Grade plus the distance to the next one up, so a score can say
     "3 marks off a B" rather than just naming a letter. */
  function gradeDetail(pct, marksAvailable) {
    if (pct == null) return null;
    const grade = estimateGrade(pct);
    let next = null;
    for (let i = AS_BOUNDARIES.length - 1; i >= 0; i--) {
      if (pct < AS_BOUNDARIES[i].pct) { next = AS_BOUNDARIES[i]; break; }
    }
    let marksOff = null;
    if (next && marksAvailable) {
      marksOff = Math.ceil((next.pct - pct) / 100 * marksAvailable);
      if (marksOff < 1) marksOff = 1;
    }
    return {
      grade: grade, pct: pct, next: next ? next.grade : null,
      nextPct: next ? next.pct : null, marksOff: marksOff,
      series: AS_BOUNDARY_SERIES
    };
  }

  /* ---------- a chapter's score, from both sources ----------
     Topic questions are the in-app bank; exam questions are the real
     Edexcel PDFs, where you mark yourself and enter the totals. The
     chapter's standing is the two added together, because the exam
     questions are the harder and more representative half, judging a
     chapter on the in-app bank alone would flatter it. */
  function chapterScore(cid) {
    const t = Store.topic(cid);
    const qs = typeof Journey !== "undefined" ? Journey.questionsFor(cid) : [];
    const ans = typeof Journey !== "undefined" ? Journey.answersFor(cid) : {};

    let tGot = 0, tAvail = 0, tCount = 0;
    qs.forEach(function (q, i) {
      const a = ans[i];
      if (a && a.recorded) { tCount++; tAvail += (q.marks || 0); tGot += (a.marksGot || 0); }
    });

    const ex = t.examScore || null;
    const eGot = ex && ex.avail > 0 ? (+ex.got || 0) : 0;
    const eAvail = ex && ex.avail > 0 ? +ex.avail : 0;

    const part = function (got, avail, count) {
      const pct = avail > 0 ? Math.round(got / avail * 100) : null;
      return { got: got, avail: avail, count: count, pct: pct,
               grade: pct == null ? null : estimateGrade(pct), has: avail > 0 };
    };

    const topic = part(tGot, tAvail, tCount);
    const exam = part(eGot, eAvail, eAvail > 0 ? 1 : 0);
    const overall = part(tGot + eGot, tAvail + eAvail, tCount + (eAvail > 0 ? 1 : 0));
    overall.sources = (topic.has ? 1 : 0) + (exam.has ? 1 : 0);

    /* The weighted view, kept separate from the raw one so the fraction on
       screen always matches the percentage next to it. */
    const wAvail = tAvail + eAvail * EXAM_WEIGHT;
    const wGot = tGot + eGot * EXAM_WEIGHT;
    overall.weighted = topic.has && exam.has;
    overall.weightedPct = wAvail > 0 ? Math.round(wGot / wAvail * 100) : null;
    overall.weightedGrade = overall.weightedPct == null ? null : estimateGrade(overall.weightedPct);
    overall.examWeight = EXAM_WEIGHT;
    /* the figure a judgement should be made on: weighted when there is
       something to weigh, plain otherwise */
    overall.judgePct = overall.weighted ? overall.weightedPct : overall.pct;
    overall.confidence = confidenceOf(tAvail + eAvail);
    return { topic: topic, exam: exam, overall: overall };
  }

  /* ---------- RAG recommendation ----------
     Anchored to the real boundaries rather than round numbers: an A-grade
     score is the only thing that justifies GREEN, anything below a C is
     RED, and the band between them is AMBER. Repeat attempts temper it - one good score on a second sitting of the same questions is weaker
     evidence than a good score first time. */
  function recommendRag(pct, opts) {
    if (pct == null) return null;
    opts = opts || {};
    const gradeA = AS_BOUNDARIES[0].pct; // 67.5%
    const gradeC = AS_BOUNDARIES[2].pct; // 51.25%
    const grade = estimateGrade(pct);
    let rag, why;

    if (pct >= gradeA) {
      rag = "green";
      why = "that is an A on the " + AS_BOUNDARY_SERIES + " grade boundaries";
    } else if (pct >= gradeC) {
      rag = "amber";
      why = "a grade " + grade + " means you can mostly do it, but not reliably enough yet";
    } else {
      rag = "red";
      why = grade === "U"
      ? "that is below an E, this has not gone in yet"
        : "a grade " + grade + " is too low to say you know this yet";
    }

    /* A strong score on a repeat of questions you have already seen is
       partly recall of the answers, so hold GREEN back one notch. */
    if (rag === "green" && opts.attemptNumber > 1 && pct < 85) {
      rag = "amber";
      why = "that is an A, but on questions you have already seen, stay AMBER until you can do it on new ones";
    }

    /* Two questions right is not the same evidence as eight. A high score
       off a handful of marks is encouraging, not proof, so GREEN waits
       until there is enough behind it. */
    if (rag === "green" && opts.marks != null && opts.marks < GREEN_MIN_MARKS) {
      rag = "amber";
      why = "that is an A, but off only " + opts.marks + " marks, do a few more before calling it GREEN";
    }

    /* Being slow matters even when the marks are there. */
    if (rag === "green" && opts.difficulty === "Very hard") {
      rag = "amber";
      why = "you got the marks, but you said it was very hard, AMBER is more honest";
    }

    return { rag: rag, why: why, grade: grade };
  }

  /* ---------- what is most likely to come up ----------
     IMPORTANT, and stated plainly wherever this is shown: Pearson do not
     publish how often each topic appears, and no reliable public tally of
     9MA0 papers exists. Nothing here is a measured frequency and no
     percentage is invented.

     What it IS built from, all of which is real:
     - the mark split, which is published and verifiable: Papers 1 and 2 are
     Pure, 100 marks each, so Pure is 200 of the 300 marks (66.7%);
     Paper 3 is 100 (Statistics 50 and Mechanics 50, 33.3% together)
       - the per-chapter weighting and typical mark ranges already carried in
         this app's chapter data, which are an editorial reading of the
         specification and the released papers, not a statistic
       - your own results, which are the only genuinely measured input here

     So it answers "where are the marks, and which of those am I weak on",
     which is the useful question, not "this appears in 87% of papers",
     which nobody can honestly tell you. */
     /* 9MA0: Papers 1 and 2 are 100 marks of Pure each; Paper 3 is 100 marks
     split evenly between Statistics and Mechanics. 300 marks in total. */
     const PAPER_MARKS = { pure: 200, stats: 50, mech: 50 };

  function chapterExamValue(cid) {
    const inf = CHAPTER_INDEX[cid];
    if (!inf) return null;
    const ex = inf.chapter.exam;
    const weight = ex && ex.weight ? ex.weight : 3;
    const marksText = ex && ex.marks ? ex.marks : "";
    /* Dash class written as unicode escapes, never as literal dash characters,
       so a find-and-replace over dashes cannot turn this into an invalid range.
       Chapter mark ranges are written with plain hyphens now, but older saved
       text may still contain en or em dashes. */
    const range = marksText.match(/(\d+)\s*[-–—]\s*(\d+)\s*marks/);
    const typicalMarks = range ? (parseInt(range[1], 10) + parseInt(range[2], 10)) / 2 : null;
    /* a chapter with no standalone mark range is not unimportant, it is
       woven through other questions (index laws inside differentiation, and
       so on). Treat it as reliably present but not separately counted. */
    const embedded = !range;
    const paperShare = PAPER_MARKS[inf.paper.id] || 0;
    return {
      cid: cid, name: inf.chapter.name, num: inf.chapter.num,
      paper: inf.paper.short, paperId: inf.paper.id,
      weight: weight, marksText: marksText,
      typicalMarks: typicalMarks, embedded: embedded, paperShare: paperShare
    };
  }

  /* Ranked by how much of the exam a chapter accounts for. Personal
     performance is reported alongside but never folded into this number, so
     the "what the exam looks like" ordering stays stable as you improve. */
  function likelyTopics(opts) {
    opts = opts || {};
    const ids = Store.planIds().filter(function (id) { return !!CHAPTER_INDEX[id]; });
    const rows = ids.map(function (cid) {
      const v = chapterExamValue(cid);
      /* Weight dominates (how reliably it shows up), marks break ties (how
         much it costs when it does). Embedded chapters are scored on weight
         alone plus a modest floor, since their marks land elsewhere. */
      const marksPart = v.typicalMarks != null ? v.typicalMarks : 9;
      v.score = v.weight * 10 + marksPart;
      const eff = effectiveRag(cid);
      v.rag = eff.rag;
      v.rated = !!Store.topic(cid).rag;
      v.complete = typeof Journey !== "undefined" ? Journey.chapterComplete(cid) : false;
      /* the case worth acting on: lots of marks and you are not solid */
      v.atRisk = (v.rag === "red" || v.rag === "amber" || !v.rated) && v.weight >= 4;
      return v;
    });
    rows.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.num - b.num;
    });
    return opts.limit ? rows.slice(0, opts.limit) : rows;
  }

/* The subset that is both high-value and currently weak, the actual
     "do these first" list. */
  function priorityTopics(limit) {
    return likelyTopics().filter(function (r) { return r.atRisk && !r.complete; })
      .slice(0, limit || 6);
  }

  /* ---------- weaknesses ---------- */
  /* Aggregate every stat for a chapter from its own record plus all of its
     sections, so the chapter view is meaningful in either mode. */
  function chapterRollup(chapterId) {
    const inf = CHAPTER_INDEX[chapterId];
    const ids = [chapterId].concat(inf.sub.sectionIds);
    let att = 0, cor = 0, lossMarks = 0, lossCount = 0, sets = 0, covered = 0, total = 0;
    const papers = {}; const rags = [];
    ids.forEach(function (id) {
      const t = Store.get().topics[id];
      if (!t) return;
      const isChapterRec = id === chapterId;
      if (!isChapterRec) {
        total++;
        if (isCovered(id)) covered++;
        if (t.rag) rags.push(effectiveRag(id).rag); // section ratings only
      }
      t.questionSets.forEach(function (q) { att += q.attempted || 0; cor += q.correct || 0; sets++; });
      const l = paperLoss(id);
      lossMarks += l.marks; lossCount += l.count;
      Store.get().papers.forEach(function (p) {
        (p.errors || []).forEach(function (e) { if (e.topicId === id) papers[p.id] = true; });
      });
    });
    const rank = { red: 0, amber: 1, green: 2 };
    const chRec = Store.get().topics[chapterId];
    let rag = null;
    /* An explicit chapter rating wins. A *derived* one does not, if the
       sections have since been re-rated, the roll-up should follow them. */
    if (chRec && chRec.rag && !chRec.derived) {
      rag = effectiveRag(chapterId).rag;
    } else if (rags.length) {
      rag = rags.reduce(function (a, b) { return rank[b] < rank[a] ? b : a; }, rags[0]);
    } else if (chRec && chRec.rag) {
      rag = effectiveRag(chapterId).rag;
    }
    return {
      id: chapterId, info: inf, rag: rag,
      acc: att ? Math.round(cor / att * 100) : null,
      sets: sets,
      loss: { marks: lossMarks, count: lossCount, papers: Object.keys(papers).length },
      covered: covered, total: total,
      coveredPct: total ? Math.round(covered / total * 100) : 0,
      chapterCovered: isCovered(chapterId)
    };
  }

  /* Weakness rows at chapter grain, usable whichever mode you are in */
  function weaknessesByChapter(limit) {
    const rows = ALL_CHAPTER_IDS.filter(function (cid) {
      return paperOn(CHAPTER_INDEX[cid].paper.id);
    }).map(function (cid) {
      const r = chapterRollup(cid);
      let score = 0;
      score += r.rag === "red" ? 55 : r.rag === "amber" ? 30 : r.rag === "green" ? 5 : 45;
      if (r.acc !== null) score += Math.max(0, 70 - r.acc) * 0.7;
      score += r.loss.marks * 3.2;
      if (r.loss.papers >= 2) score += 12;
      score += (100 - r.coveredPct) * 0.16;
      score += (r.info.sub.importance || 3) * 2.2;
      return Object.assign(r, { score: Math.round(score), grain: "chapter" });
    }).sort(function (a, b) { return b.score - a.score; });
    return limit ? rows.slice(0, limit) : rows;
  }

  function weaknesses(limit, grain) {
    if (grain === "chapter") return weaknessesByChapter(limit);
    const rows = Store.activeSubIds().map(function (id) {
      const inf = Store.info(id), t = Store.topic(id);
      const eff = effectiveRag(id);
      const acc = accuracy(id);
      const loss = paperLoss(id);
      // weakness score: lower is better
      let score = 0;
      score += eff.rag === "red" ? 55 : eff.rag === "amber" ? 30 : eff.rag === "green" ? 5 : 45;
      if (acc !== null) score += Math.max(0, (70 - acc)) * 0.7;
      score += loss.marks * 3.2;
      if (loss.papers >= 2) score += 12;
      if (!isCovered(id)) score += 14;
      score += (inf.sub.importance || 3) * 2.2;
      return { id: id, info: inf, topic: t, eff: eff, acc: acc, loss: loss, score: Math.round(score), covered: isCovered(id) };
    }).sort(function (a, b) { return b.score - a.score; });
    return limit ? rows.slice(0, limit) : rows;
  }

  /* Recurring past-paper weaknesses, grouped by section */
  /* Errors come from two places now: past papers, and the questions you
     flagged when reviewing a school test. They are the same kind of
     evidence — a mark lost on a topic — so they are counted together. */
  function allErrorSources() {
    const out = Store.get().papers.map(function (p) {
      return { id: p.id, errors: p.errors || [] };
    });
    (Store.get().schoolAssessments || []).forEach(function (a) {
      if (a.errors && a.errors.length) out.push({ id: a.id, errors: a.errors });
    });
    return out;
  }

  function recurringErrors() {
    const bySection = {};
    allErrorSources().forEach(function (p) {
      (p.errors || []).forEach(function (e) {
        const inf = e.topicId ? Store.info(e.topicId) : null;
        const key = inf ? inf.section.id : "unassigned";
        if (!bySection[key]) bySection[key] = {
          key: key, name: inf ? inf.section.name : "Unassigned", paper: inf ? inf.paper.short : "n/a",
          marks: 0, count: 0, papers: {}, types: {}, topicIds: {}
        };
        const g = bySection[key];
        g.marks += (+e.marks || 0); g.count++; g.papers[p.id] = true;
        g.types[e.type || "Other"] = (g.types[e.type || "Other"] || 0) + 1;
        if (e.topicId) g.topicIds[e.topicId] = (g.topicIds[e.topicId] || 0) + (+e.marks || 0);
      });
    });
    return Object.keys(bySection).map(function (k) {
      const g = bySection[k];
      g.paperCount = Object.keys(g.papers).length;
      g.topTopic = Object.keys(g.topicIds).sort(function (a, b) { return g.topicIds[b] - g.topicIds[a]; })[0] || null;
      g.topType = Object.keys(g.types).sort(function (a, b) { return g.types[b] - g.types[a]; })[0] || null;
      return g;
    }).sort(function (a, b) { return b.marks - a.marks; });
  }

  function errorTypeTotals() {
    const t = {};
    allErrorSources().forEach(function (p) {
      (p.errors || []).forEach(function (e) {
        const k = e.type || "Other";
        if (!t[k]) t[k] = { type: k, marks: 0, count: 0 };
        t[k].marks += (+e.marks || 0); t[k].count++;
      });
    });
    return Object.keys(t).map(function (k) { return t[k]; }).sort(function (a, b) { return b.marks - a.marks; });
  }

  /* ---------- workload feasibility ---------- */
  function availableMinutes() {
    const s = Store.settings();
    let total = 0; const days = [];
    let cur = today();
    const end = s.examDate;
    while (diffDays(cur, end) > 0) { // days strictly before the exam
      const wd = parseISO(cur).getDay();
      let m = s.dailyOverrides[cur] != null ? s.dailyOverrides[cur] : (s.restDays.indexOf(wd) >= 0 ? 0 : s.dailyMinutes);
      total += m; days.push({ date: cur, minutes: m });
      cur = addDays(cur, 1);
    }
    return { total: total, days: days };
  }

  /* Estimated minutes of work still outstanding */
  function requiredMinutes() {
    let topicMins = 0, reviewMins = 0;
    Store.planIds().forEach(function (id) {
      const inf = Store.info(id), t = Store.topic(id);
      const m = subMinutes(inf.sub);
      const eff = effectiveRag(id).rag;
      if (!isCovered(id)) {
        if (!t.videoDone) topicMins += m.video;
        if (!t.questionSets.length) topicMins += m.questions;
        topicMins += m.review;
      }
      // planned future retrieval passes
      const passes = eff === "red" ? 2 : eff === "amber" ? 2 : 1;
      reviewMins += passes * m.retrieval;
    });
    const s = Store.settings();
    const weeks = Math.max(0, diffDays(today(), s.examDate) / 7);
    const paperMins = Math.round(weeks * (s.pastPaperTargetPerWeek || 2) * 150); // paper + marking + analysis
    return { topics: topicMins, reviews: reviewMins, papers: paperMins, total: topicMins + reviewMins + paperMins };
  }

  function feasibility() {
    const avail = availableMinutes().total;
    const req = requiredMinutes();
    const ratio = avail > 0 ? req.total / avail : Infinity;
    return {
      availableMins: avail, required: req, ratio: ratio,
      deficitMins: Math.max(0, req.total - avail),
      ok: ratio <= 1.02,
      tight: ratio > 1.02 && ratio <= 1.35
    };
  }

  return {
    iso: iso, today: today, addDays: addDays, diffDays: diffDays, parseISO: parseISO,
    fmtDate: fmtDate, fmtDateLong: fmtDateLong, fmtMins: fmtMins,
    daysLeft: daysLeft, examPassed: examPassed, isExamDay: isExamDay, phase: phase,
    accuracy: accuracy, lastAccuracy: lastAccuracy, bestAccuracy: bestAccuracy, paperLoss: paperLoss,
    effectiveRag: effectiveRag, checklist: checklist, checklistScore: checklistScore, isCovered: isCovered,
    coverage: coverage, nextReviewDate: nextReviewDate, isDue: isDue, daysSinceRevised: daysSinceRevised,
    paperStats: paperStats, estimateGrade: estimateGrade, subjectSummary: subjectSummary,
    gradeDetail: gradeDetail, recommendRag: recommendRag, relativeTime: relativeTime,
    chapterScore: chapterScore, marksAttempted: marksAttempted, confidenceOf: confidenceOf,
    likelyTopics: likelyTopics, priorityTopics: priorityTopics,
    chapterExamValue: chapterExamValue, PAPER_MARKS: PAPER_MARKS,
    AS_BOUNDARIES: AS_BOUNDARIES, AS_MAX_MARK: AS_MAX_MARK,
    AS_BOUNDARY_SERIES: AS_BOUNDARY_SERIES,
    timeDoneToday: timeDoneToday, timeEntriesToday: timeEntriesToday,
    weaknesses: weaknesses, weaknessesByChapter: weaknessesByChapter, chapterRollup: chapterRollup,
    recurringErrors: recurringErrors, errorTypeTotals: errorTypeTotals,
    availableMinutes: availableMinutes, requiredMinutes: requiredMinutes, feasibility: feasibility
  };
})();
