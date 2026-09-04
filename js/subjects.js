/* ============================================================
   Subjects, which specification the tracker is working on
   ------------------------------------------------------------
   The app was built around one global SPEC. Rather than thread a
   subject parameter through every view, metric and scheduler
   call, the globals are rebuilt when the subject changes and
   everything downstream carries on unchanged.

   Each subject keeps its own progress under its own storage key,
   so ratings, plans, papers and school tests never mix between
   Maths and Economics.

   ADDING A SUBJECT
   Write a spec array in the shape spec-data.js uses, an optional
   exam-focus object keyed by section id, and add an entry to
   REGISTRY below. Nothing else needs to change: RAG rating, the
   planner, Exam-Focus, weaknesses and past papers all work off
   the shared shape.

   `flatNumbering` on a paper means its sections already carry a
   unique number (Economics 1.1, 1.2, ...) so labels use that
   number alone. Without it, labels get the Maths style year and
   chapter prefix, because Maths restarts numbering each year.
   ============================================================ */

const Subjects = (function () {

  const KEY = "tracker-subject";

  const REGISTRY = {
    maths: {
      id: "maths",
      name: "A-Level Maths",
      short: "Maths",
      mark: "∑",                       // sigma
      qualification: "Pearson Edexcel A level Mathematics (9MA0)",
      unit: "chapter",                      // what one section is called
      unitPlural: "chapters",
      spec: function () { return MATHS_SPEC; },
      examFocus: function () { return MATHS_EXAM_FOCUS; },
      chapterData: function () { return MATHS_CHAPTER_DATA; },
      hasResources: true,
      /* Maths splits into a taught Year 1 and Year 2 and restarts its chapter
         numbering in each, so the Year filter and the Y1/Y2 badges mean
         something. Subjects without that split hide both. */
      usesYears: true,
      papersLabel: "Papers",
      /* What a past-paper task means in this subject. Without this the
         planner set "AS Pure past-paper section" for every subject,
         so Economics was told to sit a maths paper. */
      papers: [
        { key: "pure",  name: "AS Pure",                    paper: "Paper 1", full: 120, section: 50 },
        { key: "stats", name: "AS Statistics & Mechanics",  paper: "Paper 2", full: 75,  section: 40 }
      ],
      searchHint: "Search topics, e.g. binomial, suvat, hypothesis…"
    },
    economics: {
      id: "economics",
      name: "A-Level Economics",
      short: "Econ",
      mark: "£",                       // pound sign
      qualification: "Pearson Edexcel A level Economics A (9EC0)",
      unit: "topic",
      unitPlural: "topics",
      spec: function () { return ECO_SPEC; },
      examFocus: function () { return ECO_EXAM_FOCUS; },
      chapterData: function () { return ECO_CHAPTER_DATA; },
      method: function () { return ECO_METHOD; },
      /* PMT notes and EconPlusDal links per topic, but no embedded playlist
         and no in-app question bank, so the chapter view still says where to
         go rather than pretending the questions are here. */
      hasResources: true,
      hasQuestionBank: false,
      usesYears: false,
      papersLabel: "Themes",
      papers: [
        { key: "p1", name: "Markets and business behaviour", paper: "Paper 1", full: 120, section: 45 },
        { key: "p2", name: "The national and global economy", paper: "Paper 2", full: 120, section: 45 }
      ],
      searchHint: "Search topics, e.g. elasticity, externalities, oligopoly…"
    },
    geography: {
      id: "geography",
      name: "A-Level Geography",
      short: "Geog",
      mark: "◐",                       // fallback if the SVG cannot render
      /* An open book with the left page shaded and the right page drawn as
         an outline. Uses currentColor so it follows the per-subject colour
         and flips correctly between light and dark mode. */
      markSvg:
        '<svg viewBox="0 0 24 24" width="60%" height="60%" aria-hidden="true" focusable="false">' +
          '<path fill="currentColor" d="M11.3 6.1C9.2 4.7 6.7 4.1 4 4.1c-.6 0-1 .4-1 1v12.4c0 .6.4 1 1 1 ' +
            '2.5 0 4.8.5 6.8 1.7.2.1.5 0 .5-.3V6.1z"/>' +
          '<path fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" ' +
            'd="M12.7 6.1c2.1-1.4 4.6-2 7.3-2 .6 0 1 .4 1 1v12.4c0 .6-.4 1-1 1-2.5 0-4.8.5-6.8 1.7-.2.1-.5 0-.5-.3V6.1z"/>' +
        '</svg>',
      qualification: "Pearson Edexcel A level Geography (9GE0)",
      unit: "enquiry question",
      unitPlural: "enquiry questions",
      spec: function () { return GEO_SPEC; },
      examFocus: function () { return GEO_EXAM_FOCUS; },
      chapterData: function () { return {}; },
      hasResources: false,
      usesYears: false,
      papersLabel: "Topics",
      papers: [
        { key: "phys", name: "Physical Geography", paper: "Paper 1", full: 105, section: 45 },
        { key: "hum",  name: "Human Geography",    paper: "Paper 2", full: 105, section: 45 }
      ],
      searchHint: "Search topics, e.g. tectonic, longshore drift, superpowers…"
    }
  };

  let currentId = null;
  const listeners = [];

  function list() {
    return Object.keys(REGISTRY).map(function (k) { return REGISTRY[k]; });
  }

  /* The icon for a subject, as markup. An SVG where one is defined, otherwise
     the character. Both come from this file, never from user input, so the
     SVG is safe to insert as markup. */
  function markHtml(subject) {
    const s = subject || current();
    if (s.markSvg) return s.markSvg;
    return (typeof UI !== "undefined" ? UI.esc(s.mark) : s.mark);
  }

  function get(id) { return REGISTRY[id] || null; }

  function current() { return REGISTRY[currentId] || REGISTRY.maths; }
  function currentIdOf() { return currentId || "maths"; }

  /* Remembered per device rather than per profile: which subject you were
     last looking at is a view preference, not progress. */
  function remembered() {
    try {
      const v = localStorage.getItem(KEY);
      return v && REGISTRY[v] ? v : "maths";
    } catch (e) { return "maths"; }
  }

  function remember(id) {
    try { localStorage.setItem(KEY, id); } catch (e) {}
  }

  /* Rebuild every global the rest of the app reads. Order matters: the
     chapter index is built from the spec index, and the learning data is
     hung off the chapter index afterwards. */
  function activate(id) {
    const s = REGISTRY[id] ? REGISTRY[id] : REGISTRY.maths;
    currentId = s.id;
    remember(s.id);

    SPEC = s.spec();
    SPEC_INDEX = buildSpecIndex(SPEC);
    ALL_SUB_IDS = Object.keys(SPEC_INDEX);
    ALL_SECTIONS = buildAllSections(SPEC);

    EXAM_FOCUS = s.examFocus() || {};
    CHAPTER_INDEX = buildChapterIndex(SPEC, EXAM_FOCUS);
    ALL_CHAPTER_IDS = Object.keys(CHAPTER_INDEX);

    attachChapterData(s.chapterData());
    return s;
  }

  /* Switch subject while the app is running: rebuild the globals, reopen the
     save file for that subject, and let the app redraw. */
  function switchTo(id) {
    if (id === currentId) return current();
    const s = activate(id);
    Store.reloadForUser();
    listeners.forEach(function (fn) { fn(s); });
    return s;
  }

  function onChange(fn) { listeners.push(fn); }

  /* Progress is per subject, so the storage key carries it. Maths keeps the
     unsuffixed key it has always used, so no existing save has to move. */
  function storageSuffix(id) {
    const sid = id || currentIdOf();
    return sid === "maths" ? "" : "::" + sid;
  }

  return {
    list: list,
    markHtml: markHtml,
    get: get,
    current: current,
    currentId: currentIdOf,
    remembered: remembered,
    activate: activate,
    switchTo: switchTo,
    onChange: onChange,
    storageSuffix: storageSuffix,
    ids: function () { return Object.keys(REGISTRY); }
  };
})();
