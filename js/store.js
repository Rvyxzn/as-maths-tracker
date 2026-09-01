/* ============================================================
   Store — application state + localStorage persistence
   ============================================================ */

const STORAGE_KEY = "as-maths-tracker-v1";
const SCHEMA_VERSION = 1;

const Store = (function () {

  function todayISO(d) {
    const t = d ? new Date(d) : new Date();
    return t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate());
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function blankTopic() {
    return {
      rag: null,             // "red" | "amber" | "green" | null (unassessed)
      initialRag: null,      // captured at first assessment
      videoUrl: "",
      videoDone: false,
      questionSets: [],      // {date, attempted, correct, pct, minutes, difficulty, notes, mistakes}
      sessions: [],          // {date, type, ragBefore, ragAfter, minutes, notes}
      lastRevised: null,     // ISO date
      nextReview: null,      // ISO date
      reviewStage: 0,        // spaced repetition stage
      reviewsDone: 0,
      covered: false,        // completed the full workflow at least once
      marked: false,         // questions have been marked/checked
      notes: "",
      /* chapter-method fields */
      videoWatched: [],      // which playlist videos have been ticked
      videoTotal: null,      // overrides the known playlist length
      answers: {},           // { questionIndex: {work, revealed, marksGot, recorded} }
      ownQuestions: [],      // questions you added yourself
      attempts: [],          // {date, questions, correct, marksAvailable, marksAchieved, pct, minutes, ...}
      ragAfterChapter: null, // the rating recorded at the end of the chapter
      priorityBoost: 0,      // manual override (-3..+3)
      pinned: false,
      archived: false        // user removed it from the plan
    };
  }

  function defaultState() {
    return {
      schema: SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      settings: {
        examDate: "2026-09-01",
        qualification: "Pearson Edexcel AS Mathematics (8MA0)",
        papers: { pure: true, stats: true, mech: true },
        theme: "dark",
        dailyMinutes: 120,
        dailyOverrides: {},        // { "2026-08-22": 180 }
        restDays: [],              // 0-6 weekday indexes to skip
        includeY2: false,          // A-level Year 2 stretch topics
        examFocus: false,          // chapter-level revision instead of section-level
        timerPrompt: true,         // offer to time a task when starting it
        pastPaperTargetPerWeek: 2,
        questionCount: 0,          // topic questions shown per chapter; 0 = all
        studentName: ""
      },
      onboarded: false,
      assessmentDone: false,
      assessCursor: 0,
      assessQueue: null,           // ids being worked through in a retake
      assessScope: "full",
      assessments: [],             // snapshots of the RAG mix after each assessment
      topics: {},
      customSubs: [],              // user-added topics
      papers: [],                  // past paper records
      plan: null,                  // { generatedAt, days:{ iso: [task] } }
      taskState: {},               // { taskId: {status, doneAt, movedTo} }
      timer: null,                 // live session timer {label, kind, refId, startedAt, accumulated, running}
      timeLog: {},                 // { "2026-08-21": [ {label, kind, refId, minutes, at} ] }
      activity: [],                // rolling log
      lastPlace: null,             // { chapterId, step, question, at } — where you actually stopped
      dayDismissed: {}             // { "2026-08-31": ["ch:pu13","paper"] } — taken off that day by hand
    };
  }

  let state = null;
  const listeners = [];

  function ensureTopics() {
    const ids = ALL_SUB_IDS
      .concat(typeof ALL_CHAPTER_IDS !== "undefined" ? ALL_CHAPTER_IDS : [])
      .concat(state.customSubs.map(function (s) { return s.id; }));
    ids.forEach(function (id) {
      if (!state.topics[id]) state.topics[id] = blankTopic();
    });
  }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        state = Object.assign(defaultState(), parsed);
        state.settings = Object.assign(defaultState().settings, parsed.settings || {});
      } catch (e) {
        console.warn("Corrupt save, starting fresh", e);
        state = defaultState();
      }
    } else {
      state = defaultState();
    }
    ensureTopics();
    return state;
  }

  let saveTimer = null;
  function save(immediate) {
    if (saveTimer) clearTimeout(saveTimer);
    const doIt = function () {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
      catch (e) { console.error("Save failed", e); UI && UI.toast && UI.toast("Could not save — storage may be full", "bad"); }
    };
    if (immediate) doIt(); else saveTimer = setTimeout(doIt, 180);
  }

  function emit() { listeners.forEach(function (fn) { fn(state); }); }

  /* ---------- public API ---------- */
  return {
    todayISO: todayISO,
    blankTopic: blankTopic,

    init: function () { load(); return state; },
    get: function () { return state; },
    settings: function () { return state.settings; },
    topic: function (id) {
      if (!state.topics[id]) state.topics[id] = blankTopic();
      const t = state.topics[id];
      /* backfill fields added after this record was first saved */
      if (!t.videoWatched) t.videoWatched = [];
      if (!t.answers) t.answers = {};
      if (!t.ownQuestions) t.ownQuestions = [];
      if (!t.attempts) t.attempts = [];
      if (t.videoTotal === undefined) t.videoTotal = null;
      if (t.ragAfterChapter === undefined) t.ragAfterChapter = null;
      return t;
    },
    subscribe: function (fn) { listeners.push(fn); },

    /* commit a mutation: mutate(fn) -> save -> notify */
    mutate: function (fn, opts) {
      fn(state);
      save(opts && opts.immediate);
      if (!opts || opts.silent !== true) emit();
    },

    log: function (text, kind) {
      state.activity.unshift({ at: new Date().toISOString(), text: text, kind: kind || "info" });
      if (state.activity.length > 250) state.activity.length = 250;
    },

    /* The working unit list. In Exam-Focus mode this is chapters;
       otherwise it is individual specification sections. */
    activeSubIds: function () {
      const s = state.settings;
      const out = [];
      if (s.examFocus) {
        ALL_CHAPTER_IDS.forEach(function (id) {
          const inf = CHAPTER_INDEX[id];
          if (!s.papers[inf.paper.id]) return;
          if (state.topics[id] && state.topics[id].archived) return;
          out.push(id);
        });
        return out;
      }
      SPEC.forEach(function (p) {
        if (!s.papers[p.id]) return;
        p.sections.forEach(function (sec) {
          sec.subs.forEach(function (sub) {
            if (sub.y2 && !s.includeY2) return;
            if (state.topics[sub.id] && state.topics[sub.id].archived) return;
            out.push(sub.id);
          });
        });
      });
      state.customSubs.forEach(function (sub) {
        if (state.topics[sub.id] && state.topics[sub.id].archived) return;
        out.push(sub.id);
      });
      return out;
    },

    /* Every section id, regardless of mode — used when aggregating */
    allSectionIds: function () {
      const s = state.settings;
      const out = [];
      SPEC.forEach(function (p) {
        if (!s.papers[p.id]) return;
        p.sections.forEach(function (sec) {
          sec.subs.forEach(function (sub) {
            if (sub.y2 && !s.includeY2) return;
            out.push(sub.id);
          });
        });
      });
      state.customSubs.forEach(function (sub) { out.push(sub.id); });
      return out;
    },

    isFocus: function () { return !!state.settings.examFocus; },

    /* Where you actually stopped, so "Continue revision" resumes there
       rather than restarting the chapter from the top. Only tracks work
       that is genuinely in progress — a finished chapter is not a place
       to come back to, so it is cleared once the chapter completes. */
    setLastPlace: function (chapterId, extra) {
      if (!chapterId) return;
      state.lastPlace = Object.assign(
        { chapterId: chapterId, at: new Date().toISOString() },
        extra || {}
      );
    },
    lastPlace: function () { return state.lastPlace; },
    clearLastPlace: function () { state.lastPlace = null; },

    /* Revision always happens a chapter at a time — that is the method.
       The Exam-Focus toggle only changes how finely you RAG-rate, never
       how the work itself is done. */
    planIds: function () {
      const s = state.settings;
      return ALL_CHAPTER_IDS.filter(function (cid) {
        const inf = CHAPTER_INDEX[cid];
        if (!s.papers[inf.paper.id]) return false;
        if (state.topics[cid] && state.topics[cid].archived) return false;
        return true;
      });
    },

    /* Which chapter does any id belong to? */
    chapterOf: function (id) {
      if (isChapterId(id)) return id;
      const cid = chapterIdForSub(id);
      return cid && CHAPTER_INDEX[cid] ? cid : null;
    },

    /* index lookup that also covers custom topics */
    info: function (id) {
      if (CHAPTER_INDEX[id]) return CHAPTER_INDEX[id];
      if (SPEC_INDEX[id]) return SPEC_INDEX[id];
      const c = state.customSubs.filter(function (s) { return s.id === id; })[0];
      if (!c) return null;
      const paper = SPEC.filter(function (p) { return p.id === c.paperId; })[0] || SPEC[0];
      const fakeSec = { id: "custom", num: "C", name: c.sectionName || "Custom topics", desc: "", subs: [], y2Group: true };
      return { sub: c, section: fakeSec, paper: paper, chapterLabel: fakeSec.name,
               path: paper.short + " / " + fakeSec.name,
               fullName: fakeSec.name + " — " + c.name, custom: true };
    },

    addCustomSub: function (data) {
      const id = "cst-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      state.customSubs.push({
        id: id, name: data.name, paperId: data.paperId, sectionName: data.sectionName || "Custom topics",
        reqs: data.reqs || [], importance: data.importance || 3, vid: data.vid || 20, qs: data.qs || 35, custom: true
      });
      state.topics[id] = blankTopic();
      state.topics[id].rag = data.rag || null;
      return id;
    },

    resetTopic: function (id) { state.topics[id] = blankTopic(); },

    /* ---------- Exam-Focus mode ---------- */
    /* Switching modes carries your ratings across so you never start from
       scratch: chapters inherit the worst-case of their sections, and
       sections inherit their chapter's rating if they have none. */
    setExamFocus: function (on) {
      const rank = { red: 0, amber: 1, green: 2 };
      if (on) {
        ALL_CHAPTER_IDS.forEach(function (cid) {
          const inf = CHAPTER_INDEX[cid];
          if (!state.topics[cid]) state.topics[cid] = blankTopic();
          const ch = state.topics[cid];
          // keep an explicit chapter rating, but always refresh a derived one
          if (ch.rag && !ch.derived) return;
          const rated = inf.sub.sectionIds
            .map(function (sid) { return state.topics[sid] && state.topics[sid].rag; })
            .filter(Boolean);
          if (!rated.length) return;
          // a chapter is only as strong as its weakest examinable part
          let worst = rated[0];
          rated.forEach(function (r) { if (rank[r] < rank[worst]) worst = r; });
          ch.rag = worst;
          if (!ch.initialRag) ch.initialRag = worst;
          ch.derived = true;
        });
      } else {
        ALL_CHAPTER_IDS.forEach(function (cid) {
          const ch = state.topics[cid];
          if (!ch || !ch.rag) return;
          CHAPTER_INDEX[cid].sub.sectionIds.forEach(function (sid) {
            if (!state.topics[sid]) state.topics[sid] = blankTopic();
            if (!state.topics[sid].rag) {
              state.topics[sid].rag = ch.rag;
              state.topics[sid].derived = true;
            }
          });
        });
      }
      state.settings.examFocus = !!on;
      state.assessCursor = 0;
    },

    /* ---------- live timer ---------- */
    timerStart: function (label, kind, refId, taskId) {
      state.timer = { label: label, kind: kind || "task", refId: refId || null,
                      taskId: taskId || null,
                      startedAt: Date.now(), accumulated: 0, running: true };
    },
    timerPause: function () {
      const t = state.timer;
      if (!t || !t.running) return;
      t.accumulated += Date.now() - t.startedAt;
      t.running = false;
    },
    timerResume: function () {
      const t = state.timer;
      if (!t || t.running) return;
      t.startedAt = Date.now(); t.running = true;
    },
    timerElapsedMs: function () {
      const t = state.timer;
      if (!t) return 0;
      return t.accumulated + (t.running ? Date.now() - t.startedAt : 0);
    },
    /* stop and bank the time against today */
    timerStop: function (commit) {
      const t = state.timer;
      if (!t) return 0;
      const ms = t.accumulated + (t.running ? Date.now() - t.startedAt : 0);
      const mins = Math.round(ms / 60000);
      if (commit !== false && mins > 0) {
        const d = todayISO();
        if (!state.timeLog[d]) state.timeLog[d] = [];
        state.timeLog[d].push({ label: t.label, kind: t.kind, refId: t.refId,
                                taskId: t.taskId || null, minutes: mins, at: new Date().toISOString() });
      }
      state.timer = null;
      return mins;
    },
    /* minutes actually logged on a given day */
    timeLoggedOn: function (dateIso) {
      return (state.timeLog[dateIso] || []).reduce(function (a, e) { return a + (e.minutes || 0); }, 0);
    },
    /* ---- editing the day's time log ---- */
    removeTimeEntry: function (dateIso, idx) {
      const list = state.timeLog[dateIso];
      if (!list || idx < 0 || idx >= list.length) return null;
      const removed = list.splice(idx, 1)[0];
      if (!list.length) delete state.timeLog[dateIso];
      return removed;
    },
    setTimeEntryMinutes: function (dateIso, idx, minutes) {
      const list = state.timeLog[dateIso];
      if (!list || !list[idx]) return;
      list[idx].minutes = Math.max(0, Math.round(minutes) || 0);
      list[idx].edited = true;
    },
    clearTimeLog: function (dateIso) { delete state.timeLog[dateIso]; },
    timeEntriesOn: function (dateIso) { return state.timeLog[dateIso] || []; },

    /* Time logged against one chapter on a given day. Entries record the
       chapter they came from (refId), so time put on the wrong topic can be
       taken back off that topic without hunting through the whole day. */
    timeEntriesForTopic: function (dateIso, topicId) {
      return (state.timeLog[dateIso] || []).filter(function (e) { return e.refId === topicId; });
    },
    timeLoggedForTopic: function (dateIso, topicId) {
      return (state.timeLog[dateIso] || []).reduce(function (n, e) {
        return n + (e.refId === topicId ? (e.minutes || 0) : 0);
      }, 0);
    },
    /* Removes every entry for that chapter on that day and reports how many
       minutes went. Filtering rather than splicing in a loop keeps the
       indices from shifting underneath. */
    removeTimeForTopic: function (dateIso, topicId) {
      const list = state.timeLog[dateIso];
      if (!list) return 0;
      let mins = 0;
      const kept = list.filter(function (e) {
        if (e.refId !== topicId) return true;
        mins += (e.minutes || 0);
        return false;
      });
      if (kept.length) state.timeLog[dateIso] = kept; else delete state.timeLog[dateIso];
      return mins;
    },

    addTimeEntry: function (label, kind, refId, minutes, taskId) {
      const d = todayISO();
      if (!state.timeLog[d]) state.timeLog[d] = [];
      state.timeLog[d].push({ label: label, kind: kind, refId: refId, minutes: minutes,
                              taskId: taskId || null, at: new Date().toISOString() });
    },

    /* ---------- export / import ---------- */
    exportJSON: function () {
      return JSON.stringify({
        app: "AS Maths Revision Tracker", exportedAt: new Date().toISOString(),
        schema: SCHEMA_VERSION, data: state
      }, null, 2);
    },
    importJSON: function (text) {
      const parsed = JSON.parse(text);
      const data = parsed.data || parsed;
      if (!data || typeof data !== "object" || !data.topics) throw new Error("This does not look like a tracker backup file.");
      state = Object.assign(defaultState(), data);
      state.settings = Object.assign(defaultState().settings, data.settings || {});
      ensureTopics();
      save(true); emit();
      return true;
    },
    hardReset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      state = defaultState(); ensureTopics(); save(true); emit();
    }
  };
})();
