/* ============================================================
   Store, application state + localStorage persistence
   ------------------------------------------------------------
   Each profile keeps its progress under its own key, so two
   people sharing a browser cannot read or overwrite each other's
   work by accident. Auth owns the key; everything here goes
   through storageKey() rather than a fixed constant.
   ============================================================ */

/* The pre-profiles key. Still the base of every per-profile key, and still
   read directly by Auth.adoptLegacySave when upgrading an old save. */
const STORAGE_KEY_BASE = "as-maths-tracker-v1";

/* Which save file is open right now: profile first, then subject. Maths uses
   the unsuffixed key it has always used, so no existing save has to move. */
function storageKey() {
  const base = (typeof Auth !== "undefined" && Auth.isSignedIn())
    ? Auth.storageKey()
    : STORAGE_KEY_BASE;
  return base + (typeof Subjects !== "undefined" ? Subjects.storageSuffix() : "");
}

/* Kept so older code and the settings screen can still refer to a key.
   Prefer storageKey() anywhere the current profile matters. */
const STORAGE_KEY = STORAGE_KEY_BASE;

/* Is this paper (or Economics theme) part of the plan?

   Absent means ON. The defaults only name the Maths papers, so a subject
   added later would otherwise have every one of its papers read as disabled
   and its whole specification would vanish from the planner. Only an explicit
   false, set by unticking it in Settings, switches a paper off. Each subject
   has its own save file, so its own toggles, and they never collide. */
function paperOn(paperId) {
  const p = (typeof Store !== "undefined" && Store.get()) ? Store.settings().papers : null;
  return !p || p[paperId] !== false;
}

/* A copy of what was here before the last import, so restoring the wrong
   file is not the end of your progress. Per profile, for the same reason. */
function rollbackKey() { return storageKey() + "-rollback"; }
const ROLLBACK_KEY = "as-maths-tracker-v1-rollback";
const SCHEMA_VERSION = 1;

const Store = (function () {

  function todayISO(d) {
    const t = d ? new Date(d) : new Date();
    return t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate());
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function blankTopic() {
    return {
      rag: null, // "red" | "amber" | "green" | null (unassessed)
      initialRag: null, // captured at first assessment
      videoUrl: "",
      videoDone: false,
      questionSets: [], // {date, attempted, correct, pct, minutes, difficulty, notes, mistakes}
      sessions: [], // {date, type, ragBefore, ragAfter, minutes, notes}
      lastRevised: null, // ISO date
      nextReview: null, // ISO date
      reviewStage: 0, // spaced repetition stage
      reviewsDone: 0,
      covered: false, // completed the full workflow at least once
      marked: false, // questions have been marked/checked
      notes: "",
      /* chapter-method fields */
      videoWatched: [], // which playlist videos have been ticked
      videoTotal: null, // overrides the known playlist length
      answers: {}, // { questionIndex: {work, revealed, marksGot, recorded} }
      ownQuestions: [], // questions you added yourself
      attempts: [], // {date, questions, correct, marksAvailable, marksAchieved, pct, minutes, ...}
      ragAfterChapter: null, // the rating recorded at the end of the chapter
      priorityBoost: 0, // manual override (-3..+3)
      pinned: false,
      archived: false // user removed it from the plan
    };
  }

  /* A plain count of what a tracker holds. Used to show what is in a backup
     file before it replaces what you have -- restoring last month's file by
     mistake should not be a silent loss. */
  function describe(d) {
    const topics = d.topics || {};
    let rated = 0, sets = 0, attempts = 0, answers = 0;
    Object.keys(topics).forEach(function (k) {
      const t = topics[k] || {};
      if (t.rag) rated++;
      sets += (t.questionSets || []).length;
      attempts += (t.attempts || []).length;
      answers += Object.keys(t.answers || {}).length;
    });
    return {
      rated: rated, sets: sets, attempts: attempts, answers: answers,
      papers: (d.papers || []).length,
      daysLogged: Object.keys(d.timeLog || {}).length,
      createdAt: d.createdAt || null,
      lastBackupAt: d.lastBackupAt || null,
      examDate: (d.settings || {}).examDate || null,
      name: (d.settings || {}).studentName || ""
    };
  }

  function defaultState() {
    return {
      schema: SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      settings: {
        examDate: "2026-09-01",
        qualification: "Pearson Edexcel A level Mathematics (9MA0)",
        papers: { pure: true, stats: true, mech: true },
        theme: "dark",
        dailyMinutes: 120,
        dailyOverrides: {}, // { "2026-08-22": 180 }
        restDays: [], // 0-6 weekday indexes to skip
        yearFilter: "all", // "all" | "1" | "2", which year's content is in play
        paperLevelFilter: "all", // "all" | "as" | "alevel", past paper library filter
        examFocus: false, // chapter-level revision instead of section-level
        timerPrompt: true, // offer to time a task when starting it
        pastPaperTargetPerWeek: 2,
        questionCount: 0, // topic questions shown per chapter; 0 = all
        studentName: ""
      },
      onboarded: false,
      assessmentDone: false,
      assessCursor: 0,
      assessQueue: null, // ids being worked through in a retake
      assessScope: "full",
      assessments: [], // snapshots of the RAG mix after each assessment
      topics: {},
      customSubs: [], // user-added topics
      papers: [], // past paper records
      schoolAssessments: [], // class tests, mini-assessments and school mocks
      plan: null, // { generatedAt, days:{ iso: [task] } }
      taskState: {}, // { taskId: {status, doneAt, movedTo} }
      timer: null, // live session timer {label, kind, refId, startedAt, accumulated, running}
      timeLog: {}, // { "2026-08-21": [ {label, kind, refId, minutes, at} ] }
      activity: [], // rolling log
      lastPlace: null, // { chapterId, step, question, at }, where you actually stopped
      dayDismissed: {} // { "2026-08-31": ["ch:pu13","paper"] }, taken off that day by hand
    };
  }

  let state = null;
  const listeners = [];

  /* ---------- save-file migrations ----------
     Saves written before the tracker covered the full A level carry the
     old AS-only settings. Nothing here throws away user data: it only
     translates settings that changed shape. */
  function migrate(st) {
    const s = st.settings;

    /* The AS build had includeY2, a stretch-topic opt-in. Year 2 is now the
       real specification, so anyone upgrading sees all of it. */
    if (s.yearFilter === undefined || s.includeY2 !== undefined) {
      s.yearFilter = "all";
      delete s.includeY2;
    }
    if (s.paperLevelFilter === undefined) s.paperLevelFilter = "all";
    if (!st.schoolAssessments) st.schoolAssessments = [];

    if (/8MA0/.test(s.qualification || "")) {
      s.qualification = "Pearson Edexcel A level Mathematics (9MA0)";
    }

    /* Past papers logged before the AS and A level distinction existed are
       tagged "as", which is what they were sitting at the time. */
    (st.papers || []).forEach(function (p) {
      if (!p.level) p.level = /9MA0/.test(p.title || "") ? "alevel" : "as";
    });

    /* The five old "Year 2 stretch" placeholder topics were replaced by real
       Year 2 chapters. Drop the orphans so they cannot be counted. */
    ["y2-seq", "y2-rad", "y2-trig", "y2-fn", "y2-proof"].forEach(function (id) {
      if (st.topics && st.topics[id]) delete st.topics[id];
    });
  }

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
    try { raw = localStorage.getItem(storageKey()); } catch (e) { raw = null; }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        state = Object.assign(defaultState(), parsed);
        state.settings = Object.assign(defaultState().settings, parsed.settings || {});
        migrate(state);
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
      try { localStorage.setItem(storageKey(), JSON.stringify(state)); }
      catch (e) { console.error("Save failed", e); UI && UI.toast && UI.toast("Could not save, storage may be full", "bad"); }
      /* Local write first, always. The cloud push is scheduled after it and
         on a longer delay, so a slow or missing network can never block or
         lose a save that has already succeeded here. */
      if (typeof Sync !== "undefined" && Sync.enabled()) Sync.schedulePush();
    };
    if (immediate) doIt(); else saveTimer = setTimeout(doIt, 180);
  }

  /* Switching profile swaps the save file underneath a live app. Any pending
     debounced write belongs to the profile that just left, so it is dropped
     rather than flushed into the new profile's key. */
  function reloadForUser() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    load();
    emit();
    return state;
  }

  /* Adopt a state document that came from somewhere else, currently the
     cloud row on sign-in. Goes through the same migration and backfill path
     as a load from disk, so an older document from another device is brought
     up to date rather than trusted as-is. */
  function replaceState(incoming) {
    if (!incoming || typeof incoming !== "object") return state;
    state = Object.assign(defaultState(), incoming);
    state.settings = Object.assign(defaultState().settings, incoming.settings || {});
    migrate(state);
    ensureTopics();
    save(true);
    emit();
    return state;
  }

  function emit() { listeners.forEach(function (fn) { fn(state); }); }

  /* ---------- public API ---------- */
  return {
    todayISO: todayISO,
    blankTopic: blankTopic,

    init: function () { load(); return state; },
    reloadForUser: reloadForUser,
    replaceState: replaceState,
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
          if (!paperOn(inf.paper.id)) return;
          if (!yearPasses(inf.chapter.year, s.yearFilter)) return;
          if (state.topics[id] && state.topics[id].archived) return;
          out.push(id);
        });
        return out;
      }
      SPEC.forEach(function (p) {
        if (!paperOn(p.id)) return;
        p.sections.forEach(function (sec) {
          if (!yearPasses(sec.year, s.yearFilter)) return;
          sec.subs.forEach(function (sub) {
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

  /* Every section id, regardless of mode, used when aggregating */
    allSectionIds: function () {
      const s = state.settings;
      const out = [];
      SPEC.forEach(function (p) {
        if (!paperOn(p.id)) return;
        p.sections.forEach(function (sec) {
          if (!yearPasses(sec.year, s.yearFilter)) return;
          sec.subs.forEach(function (sub) { out.push(sub.id); });
        });
      });
      state.customSubs.forEach(function (sub) { out.push(sub.id); });
      return out;
    },

    isFocus: function () { return !!state.settings.examFocus; },

    /* Where you actually stopped, so "Continue revision" resumes there
       rather than restarting the chapter from the top. Only tracks work
       that is genuinely in progress, a finished chapter is not a place
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

    /* Revision always happens a chapter at a time, that is the method.
       The Exam-Focus toggle only changes how finely you RAG-rate, never
       how the work itself is done. */
    planIds: function () {
      const s = state.settings;
      return ALL_CHAPTER_IDS.filter(function (cid) {
        const inf = CHAPTER_INDEX[cid];
        if (!paperOn(inf.paper.id)) return false;
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
      /* plainLabel: show the section name as-is, with no "Y1 Ch 3 ·" prefix */
      const fakeSec = { id: "custom", num: "C", name: c.sectionName || "Custom topics", desc: "", subs: [], plainLabel: true, year: c.year || 1 };
      return { sub: c, section: fakeSec, paper: paper, year: fakeSec.year, chapterLabel: fakeSec.name,
               path: paper.short + " / " + fakeSec.name,
               fullName: fakeSec.name + ", " + c.name, custom: true };
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
        app: "A-Level Maths Revision Tracker", exportedAt: new Date().toISOString(),
        schema: SCHEMA_VERSION, data: state
      }, null, 2);
    },
    /* Reads a backup without applying it, so you can be told what is in the
       file before it replaces what you have. Throws on anything that is not
       a tracker backup. */
    inspectJSON: function (text) {
      let parsed;
      /* The raw parser error ("Unexpected token 'h'...") means nothing to
         anyone reading it, so say the useful thing instead. */
      try { parsed = JSON.parse(text); }
      catch (e) { throw new Error("that file is not a backup, pick the .json file the tracker saved."); }
      const data = parsed && (parsed.data || parsed);
      if (!data || typeof data !== "object" || !data.topics) {
        throw new Error("that file does not have any tracker data in it.");
      }
      return { data: data, exportedAt: parsed.exportedAt || null, summary: describe(data) };
    },

    /* What the current tracker holds, in the same shape, so the two can be
       put side by side before overwriting anything. */
    currentSummary: function () { return describe(state); },

    importJSON: function (text) {
      const parsed = JSON.parse(text);
      const data = parsed.data || parsed;
      if (!data || typeof data !== "object" || !data.topics) throw new Error("This does not look like a tracker backup file.");
      /* keep what is here now, so the import can be undone */
      try { localStorage.setItem(rollbackKey(), JSON.stringify({ at: new Date().toISOString(), data: state })); }
      catch (e) { /* out of space: the import still goes ahead, just without an undo */ }
      state = Object.assign(defaultState(), data);
      state.settings = Object.assign(defaultState().settings, data.settings || {});
      ensureTopics();
      save(true); emit();
      return true;
    },

    /* ---------- undoing an import ---------- */
    rollbackInfo: function () {
      try {
        const raw = localStorage.getItem(rollbackKey());
        if (!raw) return null;
        const r = JSON.parse(raw);
        if (!r || !r.data || !r.data.topics) return null;
        return { at: r.at, summary: describe(r.data) };
      } catch (e) { return null; }
    },
    undoImport: function () {
      const raw = localStorage.getItem(rollbackKey());
      if (!raw) return false;
      const r = JSON.parse(raw);
      if (!r || !r.data || !r.data.topics) return false;
      state = Object.assign(defaultState(), r.data);
      state.settings = Object.assign(defaultState().settings, r.data.settings || {});
      ensureTopics();
      try { localStorage.removeItem(rollbackKey()); } catch (e) {}
      save(true); emit();
      return true;
    },
    clearRollback: function () { try { localStorage.removeItem(rollbackKey()); } catch (e) {} },

    /* ---------- knowing whether you are actually backed up ---------- */
    markBackedUp: function () {
      state.lastBackupAt = new Date().toISOString();
      save(true); emit();
    },
    lastBackupAt: function () { return state.lastBackupAt || null; },
    hardReset: function () {
      try { localStorage.removeItem(storageKey()); } catch (e) {}
      state = defaultState(); ensureTopics(); save(true); emit();
    }
  };
})();
