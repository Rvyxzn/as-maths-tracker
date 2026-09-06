/* ============================================================
   Practice tests

   A question pack is a drill: one question, marked, then the
   next. A test is a different thing. It has a fixed set of
   questions decided before you start, a total out of which you
   are scoring, and a clock that runs across all of it rather
   than resetting between questions. Sitting one tells you
   something a hundred separate questions never do, because the
   exam is not a hundred separate questions either.

   So this assembles one. You say how long, or how many marks,
   or which tariffs, and it picks the questions: weighted
   towards what you are weak at and what you have never
   attempted, spread across chapters so a "50 mark test" is not
   two essays on the same topic, then ordered the way a paper
   is — short answers first, the long one last.

   Both subjects come through the same door. Economics questions
   are real past-paper questions with their own mark schemes;
   Maths ones come from the chapter banks. They are normalised
   into one shape here so the view, the marking and the scoring
   never have to ask which subject they are looking at.

   Marking writes through to wherever that subject already keeps
   its scores — Economics to the pack attempts, Maths to the
   chapter's answers — so a test is not a separate silo. When
   you finish, each chapter the test touched gets a question set
   recorded against it, which is what the RAG engine and the
   planner actually read. A test you sat badly should change
   tomorrow's plan; otherwise it was just a quiz.
   ============================================================ */

const PracticeTest = (function () {

  const SUPPORTED = { maths: true, economics: true };

  /* Every Edexcel paper in both subjects is 1.2 minutes a mark: 9EC0 is 100
     marks in two hours, 9MA0 Paper 1 is 100 marks in two hours. One rate
     covers both, and it is the rate the real thing runs at. */
  const MINS_PER_MARK = 1.2;

  function subjectId() {
    return (typeof Subjects !== "undefined") ? Subjects.currentId() : "maths";
  }
  function supported() { return !!SUPPORTED[subjectId()]; }
  function minutesFor(marks) { return Math.max(1, Math.round(marks * MINS_PER_MARK)); }

  /* ------------------------------------------------------------
     The pool: every question either subject can offer, in one shape

       key    stable identifier, "eco:p1-june2022-q6b" or "maths:ch:pu12:3"
       marks  the tariff
       cid    the chapter it belongs to, for weighting and for scoring
       label  what to call it on screen
       topic  the finer-grained topic, where the subject has one
     ------------------------------------------------------------ */

  /* Economics questions are tagged with a specification code (1.2.6), which
     names a subtopic; the chapter is the section that subtopic sits in. */
  function ecoSubFor(code) {
    if (!code || typeof SPEC_INDEX === "undefined") return null;
    const ids = Object.keys(SPEC_INDEX);
    for (let i = 0; i < ids.length; i++) {
      if (SPEC_INDEX[ids[i]].sub.code === code) return ids[i];
    }
    return null;
  }

  function ecoPool() {
    if (typeof ECO_QUESTIONS === "undefined") return [];
    return ECO_QUESTIONS.map(function (q) {
      const subId = ecoSubFor(q.topicCode);
      const cid = subId ? Store.chapterOf(subId) : null;
      return {
        key: "eco:" + q.id,
        marks: q.marks,
        cid: cid,
        cids: cid ? [cid] : [],
        subId: subId,
        group: cid && CHAPTER_INDEX[cid] ? CHAPTER_INDEX[cid].paper.short : ("Paper " + q.paper),
        year: q.year || 1,
        label: q.series + " · Paper " + q.paper + " · Q" + q.q + (q.part ? "(" + q.part + ")" : ""),
        topic: q.topicCode ? q.topicCode + " " + q.topicName : "Theme " + q.theme,
        /* the specification subtopic, which is finer than the chapter and is
           the thing an Economics question is actually about */
        where: q.topicCode ? q.topicCode + " " + q.topicName : "Theme " + q.theme,
        preview: q.text
      };
    });
  }

  /* The real Edexcel questions, at the tariffs the paper sets. These are
     what a practice test should be made of: the built-in chapter bank is
     there to check you followed the video, and a "test" made of 2-mark
     recall questions measures nothing the exam will ask. */
  function mathsExamPool() {
    if (typeof MATHS_EXAM_QUESTIONS === "undefined") return [];
    const out = [];
    MATHS_EXAM_QUESTIONS.forEach(function (q) {
      /* A topic set usually serves several chapters — the Trigonometry set
         covers four of them. The question is COUNTED under the first, so a
         pool of 407 is 407 questions and a test cannot draw the same one
         twice, but it BELONGS to all of them, so every chapter it covers can
         filter for it. Filing it under the first alone quietly made fifteen
         chapters unpickable: they served real questions and offered none. */
      const cids = q.chapters.filter(function (c) { return CHAPTER_INDEX[c]; });
      const cid = cids[0];
      if (!cid) return;
      const inf = CHAPTER_INDEX[cid];
      out.push({
        key: "mex:" + q.id,
        marks: q.marks,
        cid: cid,
        cids: cids,
        subId: null,
        source: "exam",
        group: inf.paper.short,
        year: inf.year || 1,
        label: q.topic + " · Q" + q.num,
        topic: inf.chapter.name,
        where: inf.chapter.name,
        preview: q.text
      });
    });
    return out;
  }

  function mathsBankPool() {
    if (typeof ALL_CHAPTER_IDS === "undefined") return [];
    const out = [];
    ALL_CHAPTER_IDS.forEach(function (cid) {
      const inf = CHAPTER_INDEX[cid];
      const qs = (typeof Journey !== "undefined") ? Journey.questionsFor(cid) : (inf.bank || []);
      qs.forEach(function (q, i) {
        if (!q || !q.q) return;
        out.push({
          key: "maths:" + cid + ":" + i,
          marks: q.marks || 3,
          cid: cid,
          cids: [cid],
          subId: null,
          group: inf.paper.short,
          year: inf.year || 1,
          /* The chapter label already carries the chapter name, so the
             reference stays short and the name goes in `where` — the same
             split Economics has between "June 2022 Q6(b)" and its topic.

             The paper goes in front because Maths restarts its chapter
             numbering in every one of them: "Y1 Ch 1" is Algebraic
             Expressions in Pure and Data Collection in Statistics, and a
             test that mixes papers puts the two next to each other. */
          label: inf.paper.short + " · " +
                 (inf.chapter.flatNumbering ? inf.chapter.num
                  : "Y" + (inf.year || 1) + " Ch " + inf.chapter.num) + " · Q" + (i + 1),
          topic: inf.chapter.name,
          where: inf.chapter.name,
          source: "bank",
          preview: q.q
        });
      });
    });
    return out;
  }

  /* Real exam questions first, and on their own unless the easy bank is
     asked for: mixing a 2-mark bank question into a paper of 10-markers
     makes the total meaningless. */
  function mathsPool(includeBank) {
    const exam = mathsExamPool();
    if (!includeBank && exam.length) return exam;
    return exam.concat(mathsBankPool());
  }

  function pool(includeBank) {
    const s = subjectId();
    if (s === "economics") return ecoPool();
    if (s === "maths") return mathsPool(includeBank);
    return [];
  }

  /* The underlying question, whichever bank it came from. Everything that
     has to render or mark a question goes through here. */
  function question(key) {
    const bits = String(key || "").split(":");
    if (bits[0] === "eco") {
      if (typeof ECO_QUESTIONS === "undefined") return null;
      const id = bits.slice(1).join(":");
      return ECO_QUESTIONS.filter(function (q) { return q.id === id; })[0] || null;
    }
    if (bits[0] === "mex") {
      if (typeof MATHS_EXAM_QUESTIONS === "undefined") return null;
      const id = bits.slice(1).join(":");
      return MATHS_EXAM_QUESTIONS.filter(function (q) { return q.id === id; })[0] || null;
    }
    if (bits[0] === "maths") {
      /* the chapter id itself contains a colon, so the index is the last part */
      const idx = +bits[bits.length - 1];
      const cid = bits.slice(1, bits.length - 1).join(":");
      const qs = (typeof Journey !== "undefined") ? Journey.questionsFor(cid) : [];
      return qs[idx] || null;
    }
    return null;
  }

  function kindOf(key) { return String(key || "").split(":")[0]; }

  function meta(key) {
    /* Everything, bank included: a test built with the bank still has to be
       able to describe its own questions afterwards. */
    const list = pool(true);
    for (let i = 0; i < list.length; i++) if (list[i].key === key) return list[i];
    return null;
  }

  /* ------------------------------------------------------------
     Choosing the questions
     ------------------------------------------------------------ */

  function shuffled(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = out[i]; out[i] = out[j]; out[j] = t;
    }
    return out;
  }

  /* Has this question been attempted, and how did it go? Economics keeps
     pack attempts; Maths keeps the marks on the chapter's answers. */
  function lastAttempt(key) {
    const bits = String(key || "").split(":");
    if (bits[0] === "eco") {
      const id = bits.slice(1).join(":");
      const a = (Store.get().packAttempts || []).filter(function (x) { return x.questionId === id; })
        .sort(function (x, y) { return String(y.at || "").localeCompare(String(x.at || "")); })[0];
      return a ? { got: a.got, avail: a.available, at: a.at } : null;
    }
    if (bits[0] === "mex") {
      const id = bits.slice(1).join(":");
      const a = (Store.get().examAttempts || []).filter(function (x) { return x.questionId === id; })
        .sort(function (x, y) { return String(y.at || "").localeCompare(String(x.at || "")); })[0];
      return a ? { got: a.got, avail: a.available, at: a.at } : null;
    }
    if (bits[0] === "maths") {
      const idx = +bits[bits.length - 1];
      const cid = bits.slice(1, bits.length - 1).join(":");
      const a = (Store.topic(cid).answers || {})[idx];
      if (!a || !a.recorded) return null;
      const q = question(key);
      return { got: a.marksGot || 0, avail: q ? q.marks : null, at: a.at || null };
    }
    return null;
  }

  /* How much this question deserves to be picked.

     Weakness first, because a test made of what you are already good at is
     a test that tells you nothing. Then novelty: a question you have never
     seen measures you, one you marked last week measures your memory of
     the mark scheme. Importance breaks the remaining ties, so the topics
     the specification leans on come up more often. */
  function weightOf(m, opts) {
    let w = 1;
    if (opts.weakFirst !== false && m.cid) {
      const eff = Metrics.effectiveRag(m.cid);
      const r = eff && eff.rag;
      w *= r === "red" ? 3.2 : r === "new" ? 2.6 : r === "amber" ? 2 : r === "green" ? 0.9 : 1.4;
    }
    const last = lastAttempt(m.key);
    if (!last) w *= 1.6;
    else {
      const days = Math.max(0, Math.floor((Date.now() - new Date(last.at || 0).getTime()) / 86400000));
      const pct = last.avail ? last.got / last.avail : 0.5;
      /* recently and well is the least useful question there is */
      w *= (days < 14 && pct >= 0.7) ? 0.35 : (pct < 0.5 ? 1.3 : 0.8);
    }
    const inf = m.cid ? CHAPTER_INDEX[m.cid] : null;
    if (inf && inf.sub && inf.sub.importance) w *= 0.8 + inf.sub.importance * 0.08;
    return Math.max(0.05, w);
  }

  function weightedTake(cands, weights) {
    let total = 0;
    cands.forEach(function (c) { total += weights[c.key]; });
    let r = Math.random() * total;
    for (let i = 0; i < cands.length; i++) {
      r -= weights[cands[i].key];
      if (r <= 0) return cands[i];
    }
    return cands[cands.length - 1];
  }

  /* Everything the filters leave in play. */
  function eligible(opts) {
    const o = opts || {};
    return pool(o.includeBank).filter(function (m) {
      if (o.tariffs && o.tariffs.length && o.tariffs.indexOf(m.marks) < 0) return false;
      if (o.minMarks && m.marks < o.minMarks) return false;
      if (o.maxMarks && m.marks > o.maxMarks) return false;
      if (o.group && o.group !== "all" && m.group !== o.group) return false;
      if (o.year && o.year !== "all" && String(m.year) !== String(o.year)) return false;
      if (o.chapters && o.chapters.length) {
        const mine = m.cids && m.cids.length ? m.cids : [m.cid];
        const hit = mine.some(function (c) { return o.chapters.indexOf(c) >= 0; });
        if (!hit) return false;
      }
      if (o.unseenOnly && lastAttempt(m.key)) return false;
      return true;
    });
  }

  /* Pick to a target, spread across chapters.

     The per-chapter cap starts at one and only rises when there is nothing
     left to take without it. That is what stops a fifty-mark test being two
     essays on elasticity: breadth is the default, and repetition is what
     you fall back on when the filters have left you no choice. */
  function choose(opts) {
    const o = opts || {};
    const bag = eligible(o);
    if (!bag.length) return [];

    const weights = {};
    bag.forEach(function (m) { weights[m.key] = weightOf(m, o); });

    const wantCount = +o.count || 0;
    const wantMarks = +o.marks || 0;
    const chosen = [];
    const perChapter = {};
    let marks = 0, cap = 1;
    let left = shuffled(bag);

    /* Asking for 5, 8, 12 and 25 mark questions means you want all four, not
       four questions drawn from the union of them. Weighted picking on its
       own will happily hand you three 5-markers and a 12, because a tariff
       with more questions behind it wins more often. So one of each
       requested tariff is taken first, in the order asked, and only then
       does the weighting fill the rest of the paper. */
    const wanted = (o.tariffs || []).slice().sort(function (a, b) { return a - b; });
    wanted.forEach(function (t) {
      if (wantCount && chosen.length >= wantCount) return;
      const room = wantMarks ? wantMarks - marks : Infinity;
      if (wantMarks && t > room) return;
      const pickFrom = left.filter(function (m) { return m.marks === t; });
      if (!pickFrom.length) return;
      const one = weightedTake(pickFrom, weights);
      chosen.push(one);
      marks += one.marks;
      perChapter[one.cid] = (perChapter[one.cid] || 0) + 1;
      left = left.filter(function (m) { return m.key !== one.key; });
    });

    while (left.length) {
      if (wantCount && chosen.length >= wantCount) break;
      if (wantMarks && marks >= wantMarks) break;

      let cands = left.filter(function (m) { return (perChapter[m.cid] || 0) < cap; });
      if (!cands.length) {
        /* every chapter is at the cap: allow one more each and go round again */
        if (cap > 40) break;
        cap++;
        continue;
      }

      if (wantMarks) {
        const room = wantMarks - marks;
        const fits = cands.filter(function (m) { return m.marks <= room; });
        if (fits.length) cands = fits;
        /* Nothing fits the room left. Stop, unless we have nothing at all —
           a 10-mark target against a bank of 25-markers should still hand
           you a question rather than an empty paper. */
        else if (chosen.length) break;
        else cands = cands.slice().sort(function (a, b) { return a.marks - b.marks; }).slice(0, 1);
      }

      const pickMe = weightedTake(cands, weights);
      chosen.push(pickMe);
      marks += pickMe.marks;
      perChapter[pickMe.cid] = (perChapter[pickMe.cid] || 0) + 1;
      left = left.filter(function (m) { return m.key !== pickMe.key; });
    }

    return order(chosen);
  }

  /* A paper builds: the short answers first, the essay last. Within a
     tariff, keep the chapters together so it reads as a paper rather than
     as a shuffle. */
  function order(list) {
    return list.slice().sort(function (a, b) {
      return a.marks - b.marks || String(a.cid).localeCompare(String(b.cid));
    });
  }

  /* Swap one question for another of the same tariff that is not already in
     the test — for when the one you have been handed is the one you did
     yesterday. */
  function replacement(test, key) {
    const m = meta(key);
    if (!m) return null;
    const have = {};
    test.items.forEach(function (it) { have[it.key] = true; });
    const opts = test.opts || {};
    const cands = eligible(Object.assign({}, opts, { tariffs: [m.marks] }))
      .filter(function (c) { return !have[c.key]; });
    if (!cands.length) return null;
    const weights = {};
    cands.forEach(function (c) { weights[c.key] = weightOf(c, opts); });
    return weightedTake(cands, weights);
  }

  /* ------------------------------------------------------------
     The tests themselves
     ------------------------------------------------------------ */

  function store() {
    const st = Store.get();
    if (!st.practiceTests) st.practiceTests = [];
    return st.practiceTests;
  }

  function all() {
    const s = subjectId();
    return store().filter(function (t) { return t.subject === s; })
      .sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
  }

  function get(id) {
    return store().filter(function (t) { return t.id === id; })[0] || null;
  }

  /* The one you are in the middle of. There is only ever one: a test you
     have half-sat is not something to have two of. */
  function live() {
    return all().filter(function (t) { return !t.finishedAt; })[0] || null;
  }

  function history() {
    return all().filter(function (t) { return !!t.finishedAt; });
  }

  function nameFor(items, opts) {
    const marks = items.reduce(function (a, m) { return a + m.marks; }, 0);
    const o = opts || {};
    if (o.chapters && o.chapters.length === 1 && CHAPTER_INDEX[o.chapters[0]]) {
      return CHAPTER_INDEX[o.chapters[0]].chapter.name + " — " + marks + " marks";
    }
    if (o.group && o.group !== "all") return o.group + " — " + marks + " marks";
    return marks + "-mark practice test";
  }

  function create(items, opts) {
    if (!items || !items.length) return null;
    const marks = items.reduce(function (a, m) { return a + m.marks; }, 0);
    const rec = {
      id: "pt" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      subject: subjectId(),
      createdAt: new Date().toISOString(),
      name: nameFor(items, opts),
      opts: opts || {},
      targetMins: minutesFor(marks),
      items: items.map(function (m) { return { key: m.key, marks: m.marks, cid: m.cid, subId: m.subId || null }; }),
      scores: {},
      startedAt: null,
      finishedAt: null,
      minutesTaken: null
    };
    Store.mutate(function (st) {
      if (!st.practiceTests) st.practiceTests = [];
      st.practiceTests.unshift(rec);
    });
    return rec.id;
  }

  function swap(id, key) {
    const t = get(id);
    if (!t || t.startedAt) return false;
    const rep = replacement(t, key);
    if (!rep) return false;
    Store.mutate(function () {
      const test = get(id);
      const i = test.items.map(function (it) { return it.key; }).indexOf(key);
      if (i < 0) return;
      test.items[i] = { key: rep.key, marks: rep.marks, cid: rep.cid, subId: rep.subId || null };
      test.items = order(test.items);
    });
    return true;
  }

  function drop(id, key) {
    const t = get(id);
    if (!t || t.startedAt || t.items.length < 2) return false;
    Store.mutate(function () {
      const test = get(id);
      test.items = test.items.filter(function (it) { return it.key !== key; });
      test.targetMins = minutesFor(test.items.reduce(function (a, it) { return a + it.marks; }, 0));
      test.name = nameFor(test.items, test.opts);
    });
    return true;
  }

  /* Starting the test starts the clock, with the whole paper's allowance on
     it, so the countdown ring is the exam clock rather than one question's. */
  function start(id) {
    const t = get(id);
    if (!t || t.startedAt) return false;
    Store.mutate(function () {
      const test = get(id);
      test.startedAt = new Date().toISOString();
      Store.timerStart(test.name, "session", null, null, test.targetMins);
    });
    return true;
  }

  /* Marking one question writes through to wherever the subject already
     keeps that question's score, so the chapter view and the weakness
     engine see it immediately rather than at the end of the test. */
  function score(id, key, got) {
    const t = get(id);
    if (!t) return false;
    const item = t.items.filter(function (it) { return it.key === key; })[0];
    if (!item) return false;
    const marks = Math.max(0, Math.min(item.marks, Math.round(got)));
    const at = new Date().toISOString();

    Store.mutate(function (st) {
      const test = get(id);
      test.scores[key] = { got: marks, at: at };

      const bits = key.split(":");
      if (bits[0] === "eco") {
        if (!st.packAttempts) st.packAttempts = [];
        st.packAttempts.unshift({ questionId: bits.slice(1).join(":"), got: marks,
                                  available: item.marks, at: at, test: id });
      } else if (bits[0] === "mex") {
        if (!st.examAttempts) st.examAttempts = [];
        st.examAttempts.unshift({ questionId: bits.slice(1).join(":"), got: marks,
                                  available: item.marks, at: at, test: id });
      } else if (bits[0] === "maths") {
        const idx = +bits[bits.length - 1];
        const cid = bits.slice(1, bits.length - 1).join(":");
        const topic = Store.topic(cid);
        if (!topic.answers) topic.answers = {};
        topic.answers[idx] = Object.assign({}, topic.answers[idx],
          { revealed: true, recorded: true, marksGot: marks, at: at });
      }
    });
    return true;
  }

  function scoreOf(t, key) {
    return t && t.scores ? t.scores[key] : null;
  }

  function totals(t) {
    let got = 0, avail = 0, done = 0, marked = 0;
    (t.items || []).forEach(function (it) {
      avail += it.marks;
      const s = scoreOf(t, it.key);
      if (s) { got += s.got; done++; marked += it.marks; }
    });
    return { got: got, avail: avail, done: done, total: (t.items || []).length,
             markedAvail: marked,
             pct: marked ? Math.round(got / marked * 100) : null,
             fullPct: avail ? Math.round(got / avail * 100) : null };
  }

  /* How the test broke down by chapter — the part worth reading afterwards,
     because a 62% made of one chapter at 30% and another at 90% is not a
     62% you should do anything about evenly. */
  function byChapter(t) {
    const map = {};
    (t.items || []).forEach(function (it) {
      const s = scoreOf(t, it.key);
      if (!s) return;
      const cid = it.cid || "unknown";
      if (!map[cid]) map[cid] = { cid: cid, got: 0, avail: 0, n: 0 };
      map[cid].got += s.got; map[cid].avail += it.marks; map[cid].n++;
    });
    return Object.keys(map).map(function (cid) {
      const r = map[cid];
      r.pct = r.avail ? Math.round(r.got / r.avail * 100) : null;
      r.name = CHAPTER_INDEX[cid] ? CHAPTER_INDEX[cid].chapter.name : "Unattributed";
      r.label = CHAPTER_INDEX[cid] ? CHAPTER_INDEX[cid].chapterLabel : "";
      return r;
    }).sort(function (a, b) { return a.pct - b.pct; });
  }

  /* Finishing records the test against every chapter it touched. This is
     the step that makes it matter: questionSets is what accuracy() reads,
     accuracy is what moves the effective RAG, and the RAG is what the
     planner schedules from. */
  function finish(id) {
    const t = get(id);
    if (!t || t.finishedAt) return null;
    const tot = totals(t);
    const chapters = byChapter(t);
    const today = Metrics.today();
    let mins = 0;

    Store.mutate(function () {
      const test = get(id);
      if (Store.get().timer) mins = Store.timerStop(true);
      test.finishedAt = new Date().toISOString();
      test.minutesTaken = mins || null;

      chapters.forEach(function (c) {
        if (!c.avail || !CHAPTER_INDEX[c.cid]) return;
        const topic = Store.topic(c.cid);
        if (!topic.questionSets) topic.questionSets = [];
        topic.questionSets.push({
          date: today, attempted: c.n,
          correct: Math.round(c.n * (c.pct || 0) / 100),
          pct: c.pct, marksAvailable: c.avail, marksAchieved: c.got,
          minutes: null, difficulty: "", notes: "Practice test: " + test.name,
          mistakes: "", source: "practice-test"
        });
        topic.lastRevised = today;
      });

      /* Economics also carries a specification code per question, so the
         subtopic gets the evidence too and section-level ratings move. */
      const bySub = {};
      test.items.forEach(function (it) {
        const s = test.scores[it.key];
        if (!s || !it.subId) return;
        if (!bySub[it.subId]) bySub[it.subId] = { got: 0, avail: 0, n: 0 };
        bySub[it.subId].got += s.got; bySub[it.subId].avail += it.marks; bySub[it.subId].n++;
      });
      Object.keys(bySub).forEach(function (sid) {
        const r = bySub[sid];
        const topic = Store.topic(sid);
        if (!topic || !r.avail) return;
        if (!topic.questionSets) topic.questionSets = [];
        topic.questionSets.push({
          date: today, attempted: r.n,
          correct: Math.round(r.n * (r.got / r.avail)),
          pct: Math.round(r.got / r.avail * 100),
          marksAvailable: r.avail, marksAchieved: r.got,
          minutes: null, difficulty: "", notes: "Practice test", mistakes: "",
          source: "practice-test"
        });
      });

      Store.log("Sat a practice test: " + tot.got + "/" + tot.avail +
                (tot.fullPct != null ? " (" + tot.fullPct + "%)" : ""), "session");
    });

    if (typeof Scheduler !== "undefined") Scheduler.regenerate("a practice test was marked");
    return { totals: tot, chapters: chapters, minutes: mins };
  }

  function discard(id) {
    Store.mutate(function (st) {
      if (Store.get().timer && get(id) && get(id).startedAt) Store.timerStop(false);
      st.practiceTests = (st.practiceTests || []).filter(function (t) { return t.id !== id; });
    });
  }

  return {
    supported: supported, minutesFor: minutesFor, MINS_PER_MARK: MINS_PER_MARK,
    pool: pool, eligible: eligible, choose: choose, question: question, meta: meta,
    examPool: mathsExamPool,
    kindOf: kindOf, lastAttempt: lastAttempt,
    all: all, get: get, live: live, history: history,
    create: create, swap: swap, drop: drop, start: start,
    score: score, scoreOf: scoreOf, totals: totals, byChapter: byChapter,
    finish: finish, discard: discard
  };
})();
