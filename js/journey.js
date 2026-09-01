/* ============================================================
   Journey — the revision method, in order.

     ASSESS  →  PURE  →  STATISTICS  →  MECHANICS  →  PAST PAPERS

   Within every chapter the order is fixed:
     1. watch the whole playlist
     2. topic questions
     3. mark them and record the score
     4. update the RAG rating

   A GREEN rating never skips a chapter. It only changes how
   urgent the chapter is, never whether you do it.
   ============================================================ */

const Journey = (function () {

  const PHASES = [
    { id: "pure",  label: "Pure",       paper: "pure" },
    { id: "stats", label: "Statistics", paper: "stats" },
    { id: "mech",  label: "Mechanics",  paper: "mech" }
  ];

  const STEPS = [
    { key: "video",     label: "Watch the playlist" },
    { key: "questions", label: "Topic questions" },
    { key: "marked",    label: "Mark your answers" },
    { key: "rag",       label: "Update your confidence" }
  ];

  /* ---------- per-chapter state ---------- */
  function chapterIds(paperId) {
    return ALL_CHAPTER_IDS.filter(function (cid) {
      return CHAPTER_INDEX[cid].paper.id === paperId;
    });
  }

  function totalVideos(cid) {
    const t = Store.topic(cid);
    if (t.videoTotal != null) return t.videoTotal;
    const pl = CHAPTER_INDEX[cid].playlist;
    return pl && pl.count ? pl.count : 6;
  }

  /* Episodes you have marked as not part of the course — adverts, channel
     trailers, anything that is in the playlist but is not teaching. They
     stay playable, but they do not count towards finishing the chapter.
     Kept as a list of episode numbers rather than just a smaller total,
     because the extras are not always at the end. */
  function skippedVideos(cid) {
    const t = Store.topic(cid);
    return (t.videoSkipped || []).filter(function (n) { return n >= 1 && n <= totalVideos(cid); });
  }
  function isSkippedVideo(cid, n) { return skippedVideos(cid).indexOf(n) >= 0; }

  /* How many actually count towards the chapter */
  function countedVideos(cid) {
    return Math.max(0, totalVideos(cid) - skippedVideos(cid).length);
  }

  function watchedCount(cid) {
    const t = Store.topic(cid);
    const skip = skippedVideos(cid);
    return (t.videoWatched || []).filter(function (n) { return skip.indexOf(n) < 0; }).length;
  }

  /* How long the chapter's videos actually take.

     Lengths are learned one at a time — the player only knows the duration
     of the video currently loaded — so most of the time some are measured
     and the rest are not. Anything not yet measured is estimated from the
     average of the ones that are, which means the estimate MOVES as you
     watch more. That is unavoidable, but it must not look like a precise
     figure that keeps changing, so this reports the measured part and the
     estimated part separately and the UI shows which is which.

     Only videos that count are included — an advert you excluded is not
     study time. */
  function videoMinutes(cid) {
    const t = Store.topic(cid);
    const total = totalVideos(cid);
    const durations = t.videoDurations || {};
    const watched = t.videoWatched || [];
    const skip = skippedVideos(cid);

    let knownMins = 0, knownCount = 0, unknownCount = 0;
    let knownRemaining = 0, unknownRemaining = 0;
    for (let i = 1; i <= total; i++) {
      if (skip.indexOf(i) >= 0) continue;
      const d = +durations[i];
      const unwatched = watched.indexOf(i) < 0;
      if (d > 0) {
        knownMins += d; knownCount++;
        if (unwatched) knownRemaining += d;
      } else {
        unknownCount++;
        if (unwatched) unknownRemaining++;
      }
    }

    /* per-video estimate: the average of what has actually been measured,
       falling back to the chapter's own figure before anything is known */
    const counted = countedVideos(cid);
    const perVideo = knownCount
      ? knownMins / knownCount
      : (CHAPTER_INDEX[cid] && CHAPTER_INDEX[cid].sub.vid
          ? CHAPTER_INDEX[cid].sub.vid / Math.max(1, counted || 1) : 12);

    return {
      /* best overall figure — measured plus estimate for the rest */
      total: Math.round(knownMins + unknownCount * perVideo),
      remaining: Math.round(knownRemaining + unknownRemaining * perVideo),
      /* the part that is actually measured, which never moves */
      knownMins: Math.round(knownMins),
      knownRemaining: Math.round(knownRemaining),
      knownCount: knownCount,
      unknownCount: unknownCount,
      episodes: counted,
      skipped: skip.length,
      estimated: unknownCount > 0,
      exact: unknownCount === 0 && counted > 0
    };
  }

  /* Which episode the player is on. Once it is pinned — because you picked
     one, or because the player told us where it actually is — it stays put.
     Only an unpinned chapter falls back to "the first one not ticked off",
     otherwise ticking video 1 would silently make video 2 current and the
     player would jump. */
  function currentEpisode(cid) {
    const t = Store.topic(cid);
    const total = totalVideos(cid);
    if (t.currentEpisode && t.currentEpisode >= 1 && t.currentEpisode <= total) return t.currentEpisode;
    const watched = t.videoWatched || [];
    for (let i = 1; i <= total; i++) if (watched.indexOf(i) < 0) return i;
    return 1;
  }

  function playlistUrl(cid) {
    const t = Store.topic(cid);
    if (t.videoUrl) return t.videoUrl;
    const pl = CHAPTER_INDEX[cid].playlist;
    return pl ? "https://www.youtube.com/playlist?list=" + pl.id : "";
  }

  /* Pull a playlist or video id out of anything YouTube-shaped */
  function parseYouTube(url) {
    if (!url) return null;
    const list = url.match(/[?&]list=([A-Za-z0-9_-]{10,})/);
    if (list) return { type: "playlist", id: list[1] };
    const v = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ||
              url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
              url.match(/embed\/([A-Za-z0-9_-]{6,})/);
    if (v) return { type: "video", id: v[1] };
    if (/^PL[A-Za-z0-9_-]{10,}$/.test(url.trim())) return { type: "playlist", id: url.trim() };
    return null;
  }

  /* What the player should load: a playlist id, or a single video id if you
     pasted a plain video link. Returned as data rather than a URL because
     the player is driven through the IFrame API, not an <iframe src> — an
     `index` parameter on a playlist embed does not work (tested: the src
     said index=5 and the player still loaded video 1). */
  function embedSource(cid) {
    const t = Store.topic(cid);
    let src = null;
    if (t.videoUrl) src = parseYouTube(t.videoUrl);
    if (!src) {
      const pl = CHAPTER_INDEX[cid].playlist;
      if (pl) src = { type: "playlist", id: pl.id };
    }
    if (!src) return null;
    return src.type === "playlist" ? { list: src.id, video: null } : { list: null, video: src.id };
  }

  /* Watch this specific episode on YouTube itself — the fallback that always
     works, whatever the embed does. `index` DOES work on a youtube.com watch
     link (it is what YouTube's own URLs use); it is only the embed that
     ignores it. */
  function episodeUrl(cid, episode) {
    const base = playlistUrl(cid);
    if (!base) return "";
    if (base.indexOf("list=") < 0) return base;
    return base + (episode && episode > 1 ? "&index=" + episode : "");
  }

  /* Questions available for a chapter: the built-in bank plus your own */
  function questionsFor(cid) {
    const own = Store.topic(cid).ownQuestions || [];
    return CHAPTER_INDEX[cid].bank.concat(own);
  }

  /* ---------- picking a shorter question set ----------
     If you ask for fewer questions, they must not all be the two-markers.
     There is no difficulty field on the questions, so marks are used as the
     proxy — a 5-mark question genuinely asks more of you than a 2-mark one.
     Questions are banded WITHIN their own chapter, so "hard" means hard for
     that chapter rather than against some fixed scale, then picked
     round-robin across the three bands. It is deterministic: the same
     chapter always offers the same questions, so your recorded answers
     never point at a different question later. */
  function questionBands(cid) {
    const qs = questionsFor(cid);
    const sorted = qs.map(function (q, i) { return { i: i, m: q.marks || 3 }; })
      .sort(function (a, b) { return a.m - b.m || a.i - b.i; });
    const n = sorted.length;
    const c1 = Math.floor(n / 3), c2 = Math.floor((2 * n) / 3);
    return {
      easy: sorted.slice(0, c1).map(function (x) { return x.i; }),
      medium: sorted.slice(c1, c2).map(function (x) { return x.i; }),
      hard: sorted.slice(c2).map(function (x) { return x.i; })
    };
  }

  /* Which band a question sits in, for labelling it in the UI */
  function bandOf(cid, i) {
    const b = questionBands(cid);
    if (b.hard.indexOf(i) >= 0) return "hard";
    if (b.medium.indexOf(i) >= 0) return "medium";
    return "easy";
  }

  /* Every question is on show. You pick which ones to actually do — two
     mediums and a hard, or whatever mix you want — and only the ones you
     answer are counted. */
  function selectedQuestions(cid) {
    return questionsFor(cid).map(function (_, i) { return i; });
  }

  /* What you have actually answered, broken down by difficulty */
  function answeredBreakdown(cid) {
    const a = answersFor(cid);
    const qs = questionsFor(cid);
    const out = { easy: 0, medium: 0, hard: 0, count: 0, marks: 0, available: 0 };
    qs.forEach(function (q, i) {
      if (!(a[i] && a[i].recorded)) return;
      out[bandOf(cid, i)]++;
      out.count++;
      out.marks += (a[i].marksGot || 0);
      out.available += (q.marks || 0);
    });
    return out;
  }

  function answersFor(cid) { return Store.topic(cid).answers || {}; }

  function answeredCount(cid) {
    const a = answersFor(cid);
    return questionsFor(cid).filter(function (_, i) { return a[i] && a[i].recorded; }).length;
  }

  /* ---------- the four steps ---------- */
  function state(cid) {
    const t = Store.topic(cid);
    /* completion is measured against the videos that actually count, so a
       playlist padded with adverts does not leave the chapter unfinishable */
    const vTotal = countedVideos(cid), vDone = watchedCount(cid);
    const qs = questionsFor(cid), qDone = answeredCount(cid);
    const attempts = t.attempts || [];

    /* If nothing counts — every video excluded, or a chapter with no
       playlist at all — there is nothing to watch, so the step is done
       rather than blocking the chapter forever. */
    const video = { done: vTotal === 0 || vDone >= vTotal, count: vDone, total: vTotal };
    /* You choose how many to do, so the step is finished either when you
       have done them all or when you say you are finished. */
    const questions = {
      done: qs.length > 0 && (qDone >= qs.length || (!!t.questionsFinished && qDone > 0)),
      count: qDone, total: qs.length
    };
    const marked = { done: attempts.length > 0, count: attempts.length, total: 1 };
    const rag = { done: !!t.ragAfterChapter, count: t.ragAfterChapter ? 1 : 0, total: 1 };

    const steps = { video: video, questions: questions, marked: marked, rag: rag };
    const order = ["video", "questions", "marked", "rag"];
    let current = null;
    for (let i = 0; i < order.length; i++) {
      if (!steps[order[i]].done) { current = order[i]; break; }
    }
    const doneCount = order.filter(function (k) { return steps[k].done; }).length;
    return {
      id: cid, steps: steps, current: current, complete: current === null,
      doneCount: doneCount, totalSteps: order.length,
      rated: !!t.rag, attempts: attempts
    };
  }

  function chapterComplete(cid) { return state(cid).complete; }

  /* ---------- phase progress ---------- */
  function phaseProgress(paperId) {
    const ids = chapterIds(paperId).filter(function (cid) {
      return Store.settings().papers[paperId];
    });
    const done = ids.filter(chapterComplete).length;
    return {
      paper: paperId, total: ids.length, done: done,
      pct: ids.length ? Math.round(done / ids.length * 100) : 0,
      complete: ids.length > 0 && done === ids.length,
      ids: ids
    };
  }

  function allPhases() {
    return PHASES.filter(function (p) { return Store.settings().papers[p.paper]; })
                 .map(function (p) { return Object.assign({}, p, phaseProgress(p.paper)); });
  }

  /* Have you rated everything yet? The method starts with the RAG map. */
  function assessmentOutstanding() {
    const ids = Store.activeSubIds();
    return ids.filter(function (id) { return !Store.topic(id).rag; }).length;
  }

  /* ---------- where am I? ---------- */
  function currentPhase() {
    const phases = allPhases();
    for (let i = 0; i < phases.length; i++) if (!phases[i].complete) return phases[i];
    return { id: "papers", label: "Past papers", paper: null, complete: false };
  }

  /* The single next thing to do, and why. */
  /* The chapter you last worked on, if it is still worth returning to:
     still incomplete, still active in the plan, and actually started. */
  function resumeChapter() {
    const lp = Store.lastPlace();
    if (!lp || !lp.chapterId) return null;
    const cid = lp.chapterId;
    if (!CHAPTER_INDEX[cid]) return null;
    if (Store.planIds().indexOf(cid) < 0) return null;
    if (chapterComplete(cid)) return null;
    const st = state(cid);
    if (!st.doneCount && !watchedCount(cid) && !answeredCount(cid)) return null;  // never actually begun
    return cid;
  }

  function nextStep() {
    const unrated = assessmentOutstanding();
    if (unrated > 0) {
      return {
        kind: "assess", title: "Rate the rest of the specification",
        detail: unrated + " " + (Store.isFocus() ? "chapters" : "topics") + " are still unrated. " +
                "The method starts with a complete RAG map so the planner knows where you stand.",
        action: "resume-assess", cta: "Continue the assessment"
      };
    }

    const phase = currentPhase();

    if (phase.id === "papers") {
      const ps = Metrics.paperStats();
      return {
        kind: "paper",
        title: ps.count ? "Keep going with past papers" : "Start past papers",
        detail: "Every chapter is complete, so the whole specification is covered. " +
                (ps.count ? "You have logged " + ps.count + " paper" + (ps.count === 1 ? "" : "s") +
                  (ps.avg != null ? " averaging " + ps.avg + "%" : "") + ". Sit the next one under timed conditions, then log every lost mark."
                          : "Sit an AS paper under timed conditions, reveal the mark scheme, then log every lost mark."),
        action: "go-papers", cta: ps.count ? "Open past papers" : "Start your first paper"
      };
    }

    /* Where you actually stopped wins, provided it is still unfinished and
       still in the plan. Normally that IS the first incomplete chapter, so
       the method's order is unchanged — but if you jumped ahead, or came
       back mid-chapter, this is what makes "Continue" resume rather than
       restart. Falls back to the first incomplete chapter in phase order. */
    const resume = resumeChapter();
    const cid = resume || phase.ids.filter(function (c) { return !chapterComplete(c); })[0];
    if (!cid) return { kind: "done", title: "Phase complete", detail: "", action: "go-papers", cta: "Continue" };

    const st = state(cid);
    const inf = CHAPTER_INDEX[cid];
    const name = inf.chapter.name;
    const chLabel = phase.label + " — Chapter " + inf.chapter.num + " " + name;

    const detail = {
      video: st.steps.video.count === 0
        ? "Start the playlist. " + st.steps.video.total + " videos to watch."
        : "You are " + st.steps.video.count + " of " + st.steps.video.total +
          " videos through the playlist. Finish it before starting questions.",
      questions: "Playlist finished. Work through the " + st.steps.questions.total +
        " topic questions" + (st.steps.questions.count ? " — " + st.steps.questions.count +
        " done, " + (st.steps.questions.total - st.steps.questions.count) + " to go" : "") + ".",
      marked: "Questions answered. Mark them against the mark schemes and record your score.",
      rag: "Score recorded. Update your confidence for this chapter to finish it."
    }[st.current];

    /* Which question to drop you back on, when questions are the live step */
    const lp = Store.lastPlace();
    let question = null;
    if (st.current === "questions") {
      const ans = answersFor(cid);
      const qs = questionsFor(cid);
      for (let i = 0; i < qs.length; i++) {
        if (!(ans[i] && ans[i].recorded)) { question = i; break; }
      }
      /* if you stopped part-way through a specific question, go back to it */
      if (lp && lp.chapterId === cid && lp.question != null &&
          !(ans[lp.question] && ans[lp.question].recorded)) {
        question = lp.question;
      }
    }

    return {
      kind: "chapter", chapterId: cid, step: st.current,
      title: (resume ? "Pick up where you left off — " : "Continue ") + chLabel,
      detail: detail, question: question, resumed: !!resume,
      action: "open-chapter", cta: (resume ? "Resume " : "Continue ") + name,
      state: st, phase: phase
    };
  }

  /* ---------- ordering for the planner ---------- */
  /* Sequence position: earlier phases and earlier chapters come first. */
  function sequenceIndex(cid) {
    const inf = CHAPTER_INDEX[cid];
    const order = { pure: 0, stats: 1, mech: 2 };
    const p = order[inf.paper.id] != null ? order[inf.paper.id] : 3;
    return p * 100 + parseInt(inf.chapter.num, 10);
  }

  return {
    PHASES: PHASES, STEPS: STEPS,
    chapterIds: chapterIds, totalVideos: totalVideos, watchedCount: watchedCount,
    videoMinutes: videoMinutes, countedVideos: countedVideos, currentEpisode: currentEpisode,
    skippedVideos: skippedVideos, isSkippedVideo: isSkippedVideo,
    playlistUrl: playlistUrl, parseYouTube: parseYouTube,
    episodeUrl: episodeUrl, embedSource: embedSource,
    questionsFor: questionsFor, answersFor: answersFor, answeredCount: answeredCount,
    selectedQuestions: selectedQuestions, questionBands: questionBands, bandOf: bandOf,
    answeredBreakdown: answeredBreakdown,
    state: state, chapterComplete: chapterComplete,
    phaseProgress: phaseProgress, allPhases: allPhases, currentPhase: currentPhase,
    assessmentOutstanding: assessmentOutstanding, nextStep: nextStep,
    sequenceIndex: sequenceIndex, resumeChapter: resumeChapter
  };
})();
