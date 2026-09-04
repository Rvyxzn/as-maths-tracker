/* ============================================================
   Economics learning resources
   ------------------------------------------------------------
   WHAT IS VERIFIED AND WHAT IS NOT

   PMT notes: every URL below was fetched from the Physics &
   Maths Tutor Edexcel (A) Economics theme pages, so the paths
   and filenames are real rather than reconstructed from a
   pattern. Links open PMT's own PDFs on PMT's own site; nothing
   is copied into this app, because the notes are their work.

   EconPlusDal videos: the channel is real and is the one to
   use for content, but YouTube would not serve its playlist
   pages for checking, so no playlist id is hardcoded. Rather
   than paste ids that might be wrong or belong to a fan-made
   compilation, each topic links to a search of that channel,
   which cannot go stale and cannot point at the wrong creator.
   Paste a specific playlist on any topic and it is remembered.

   tutor2u: linked at subject level for exam technique. Their
   material is not split by Edexcel topic number the way PMT's
   is, so a per-topic deep link would be invented.
   ============================================================ */

const PMT_ECO = "https://pmt.physicsandmathstutor.com/download/Economics/A-level/Notes/Edexcel-A/";
const PMT_ECO_THEME = "https://www.physicsandmathstutor.com/economics-revision/a-level-edexcel-a/";
const PMT_ECO_PAPERS = "https://www.physicsandmathstutor.com/past-papers/a-level-economics/";

const ECONPLUSDAL = "https://www.youtube.com/@EconplusDal";
const TUTOR2U_ECO = "https://www.tutor2u.net/economics";

/* A channel-scoped YouTube search. Always resolves to that creator's videos
   on the topic, and cannot rot the way a hardcoded playlist id can. */
function econVideoSearch(topicName) {
  return "https://www.youtube.com/@EconplusDal/search?query=" + encodeURIComponent(topicName);
}

/* PMT publishes both a detailed and a summary set, numbered by the same
   specification topics this tracker uses. Built from the verified filenames. */
function pmtNotes(theme, file) {
  return {
    detailed: PMT_ECO + "Theme-" + theme + "/Detailed/" + encodeURI(file) + ".pdf",
    summary:  PMT_ECO + "Theme-" + theme + "/Summary/"  + encodeURI(file) + ".pdf"
  };
}

/* Keyed by section id, matching ECO_SPEC. The PDF filenames are PMT's, which
   is why they do not always match this tracker's topic names exactly. */
const ECO_RESOURCES = {
  "eco1-1": { theme: 1, notes: pmtNotes(1, "1.1. Nature of Economics") },
  "eco1-2": { theme: 1, notes: pmtNotes(1, "1.2. How Markets Work") },
  "eco1-3": { theme: 1, notes: pmtNotes(1, "1.3. Market Failure") },
  "eco1-4": { theme: 1, notes: pmtNotes(1, "1.4. Government Intervention") },

  "eco2-1": { theme: 2, notes: pmtNotes(2, "2.1. Measures of Economic Performance") },
  "eco2-2": { theme: 2, notes: pmtNotes(2, "2.2. Aggregate Demand") },
  "eco2-3": { theme: 2, notes: pmtNotes(2, "2.3. Aggregate Supply") },
  "eco2-4": { theme: 2, notes: pmtNotes(2, "2.4. National Income") },
  "eco2-5": { theme: 2, notes: pmtNotes(2, "2.5. Economic Growth") },
  "eco2-6": { theme: 2, notes: pmtNotes(2, "2.6. Macroeconomic Objectives and Policies") },

  "eco3-1": { theme: 3, notes: pmtNotes(3, "3.1. Business Growth") },
  "eco3-2": { theme: 3, notes: pmtNotes(3, "3.2. Business Objectives") },
  "eco3-3": { theme: 3, notes: pmtNotes(3, "3.3. Revenues, Costs and Profits") },
  "eco3-4": { theme: 3, notes: pmtNotes(3, "3.4. Market Structures") },
  "eco3-5": { theme: 3, notes: pmtNotes(3, "3.5. Labour Markets") },
  "eco3-6": { theme: 3, notes: pmtNotes(3, "3.6. Government Intervention") },

  "eco4-1": { theme: 4, notes: pmtNotes(4, "4.1. International Economics") },
  "eco4-2": { theme: 4, notes: pmtNotes(4, "4.2. Poverty and Inequality") },
  "eco4-3": { theme: 4, notes: pmtNotes(4, "4.3. Emerging and Developing Economies") },
  "eco4-4": { theme: 4, notes: pmtNotes(4, "4.4. The Financial Sector") },
  "eco4-5": { theme: 4, notes: pmtNotes(4, "4.5. Role of the State in the Macroeconomy") },

  /* Exam skills has no numbered PMT note set of its own. PMT's exam technique
     and essay skills notes sit on each theme page instead. */
  "eco5-1": { theme: 1, notes: null, examTechnique: true },
  "eco5-2": { theme: 1, notes: null, examTechnique: true }
};

/* Build the per-topic learning data in the shape chapter-data.js uses, so the
   chapter view needs no special case for Economics. */
const ECO_CHAPTER_DATA = (function () {
  const out = {};
  if (typeof ECO_SPEC === "undefined") return out;
  ECO_SPEC.forEach(function (paper) {
    paper.sections.forEach(function (sec) {
      const r = ECO_RESOURCES[sec.id] || {};
      out[sec.id] = {
        /* No verified playlist id, so no embedded player. The chapter view
           already handles this and invites you to paste your own link. */
        playlist: null,
        questions: [],
        links: buildLinks(sec, r)
      };
    });
  });
  return out;
})();

function buildLinks(sec, r) {
  const links = [];
  if (r.notes) {
    links.push({ label: "PMT detailed notes", url: r.notes.detailed, kind: "notes",
                 note: "Read these first, then turn them into flashcards" });
    links.push({ label: "PMT summary notes", url: r.notes.summary, kind: "notes",
                 note: "Shorter, for revisiting once you know it" });
  }
  links.push({ label: "EconPlusDal on this topic", url: econVideoSearch(sec.name), kind: "video",
               note: "Content explained. Watch after making your flashcards" });
  links.push({ label: "PMT Theme " + (r.theme || 1) + " page", url: PMT_ECO_THEME + "theme-" + (r.theme || 1) + "/",
               kind: "questions", note: "Example answers, exam technique and definitions" });
  if (r.examTechnique) {
    links.push({ label: "tutor2u exam technique", url: TUTOR2U_ECO, kind: "video",
                 note: "How to structure and evaluate, rather than content" });
  }
  return links;
}

/* The method the app nudges you through for Economics. Deliberately not the
   Maths workflow: Economics is not learned by watching then doing questions,
   it is learned by writing the content down in your own words first. */
const ECO_METHOD = {
  intro: "Economics rewards a different order of work from Maths. Content first in your own words, " +
         "then technique, then questions.",
  steps: [
    { n: 1, title: "Read the PMT notes",
      body: "Detailed notes for a first pass, summary notes when revisiting. Read for the chains of " +
            "reasoning, not the definitions alone." },
    { n: 2, title: "Make Anki flashcards as you read",
      body: "One card per idea, in your own words. Definitions, diagram labels, chains of analysis, and " +
            "one evaluation point per policy. Making them is the learning; reviewing them is the retention." },
    { n: 3, title: "Watch EconPlusDal for the content",
      body: "Use it to fix whatever did not land from the notes, and to hear the diagrams explained out loud." },
    { n: 4, title: "Watch tutor2u for exam technique",
      body: "Separate skill. How to hit the command word, build a chain, and reach a judgement that scores." },
    { n: 5, title: "Do exam questions, then whole past papers",
      body: "Start with single questions on this topic, then full papers under time. Log every paper and " +
            "every mistake in this tracker so the planner can react to it." }
  ],
  anki: {
    url: "https://apps.ankiweb.net/",
    note: "Anki is free on desktop and Android. The iOS app is paid. Cards you make yourself beat any " +
          "shared deck, because writing the card is where the understanding happens."
  }
};
