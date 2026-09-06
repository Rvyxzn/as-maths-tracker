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

/* ------------------------------------------------------------
   EconPlusDal playlists, checked rather than guessed

   The video link used to be a channel-scoped SEARCH, on the
   reasoning that a search cannot rot the way a hardcoded
   playlist id can. Reasonable, and it meant every topic sent you
   to a results page to pick from rather than to the series.

   These ids were read off the channel's own playlists page and
   each one's title was checked against what it is mapped to
   here, so they are not guesses. The four course playlists line
   up with the Edexcel themes exactly, because the channel is
   organised the same way the specification is:

     Theme 1  Microeconomics, Year 1        43 videos
     Theme 2  Macroeconomics, Year 1        43 videos
     Theme 3  Microeconomics, Year 2        40 videos
     Theme 4  Macroeconomics, Year 2        44 videos

   WHY THESE ARE LINKS AND NOT AN EMBEDDED PLAYLIST. Maths sets
   `playlist` per chapter, which drives the watch-every-video
   step and counts your progress through it. That works there
   because a playlist IS a chapter. Here one playlist covers a
   whole theme, so attaching it to 1.2 would tell you that
   "How markets work" needs 43 videos watched and hold the
   chapter open until you had. A link is honest about what it
   is; a progress bar over the wrong denominator is not.

   The diagram and topic series are narrower than a theme, so
   where one genuinely belongs to a chapter it is listed too.
   ------------------------------------------------------------ */

const EPD_PLAYLIST = "https://www.youtube.com/playlist?list=";

/* theme number -> the course playlist for it */
const EPD_THEME = {
  1: { id: "PLWeicFreBUYCOFC2A0SlKrpEYgwaSF63t", name: "Microeconomics, Year 1", count: 43 },
  2: { id: "PLWeicFreBUYDlaLppnRTZpwgBASflf4lU", name: "Macroeconomics, Year 1", count: 43 },
  3: { id: "PLWeicFreBUYDwmBZ0AiJwhCNSCb0di9eI", name: "Microeconomics, Year 2", count: 40 },
  4: { id: "PLWeicFreBUYBW3kSFnfBC8MSvPdH6DbqQ", name: "Macroeconomics, Year 2", count: 44 },
  5: { id: "PLWeicFreBUYCuUesTjG3RLfnYynR_6AsM", name: "Edexcel exam technique", count: 18 }
};

/* chapter id -> the narrower series that actually covers it */
const EPD_TOPIC = {
  "eco1-2": [["PLWeicFreBUYCuNX9eIFvxSXfvqmQZ56GV", "Demand, supply, elasticity and price controls, drawn"],
             ["PLWeicFreBUYDiPDqmdQafZ3eSxVUEdOPX", "Behavioural economics and utility theory"]],
  "eco1-3": [["PLWeicFreBUYBRcEEeVbCYFxKqrYEBT4WK", "Market failure, drawn"]],
  "eco1-4": [["PLWeicFreBUYBRcEEeVbCYFxKqrYEBT4WK", "Market failure and intervention, drawn"]],
  "eco2-1": [["PLWeicFreBUYBrW52KNuBPAAq4YuTHqQQo", "Growth, inflation, unemployment and inequality, drawn"]],
  "eco2-2": [["PLWeicFreBUYAFmz0NbEJkb1Lk6T6lY_a3", "AD/AS, drawn"]],
  "eco2-3": [["PLWeicFreBUYAFmz0NbEJkb1Lk6T6lY_a3", "AD/AS, drawn"]],
  "eco2-4": [["PLWeicFreBUYAFmz0NbEJkb1Lk6T6lY_a3", "AD/AS, drawn"]],
  "eco2-5": [["PLWeicFreBUYBrW52KNuBPAAq4YuTHqQQo", "Growth, inflation, unemployment and inequality, drawn"]],
  "eco2-6": [["PLWeicFreBUYABzU6C6coJdjCBOrMTIvVw", "AD/AS, Phillips curve and macro policy"]],
  "eco3-4": [["PLWeicFreBUYAkFuVvehYzvo6oZnRCcHUc", "Market structures, drawn"]],
  "eco3-5": [["PLWeicFreBUYDmQmlnMnDDYU5ifAqlTkGF", "The labour market, drawn"],
             ["PLWeicFreBUYCs7NjXgFhQpoEDvnryFip2", "Labour market, inequality and poverty"]],
  "eco3-6": [["PLWeicFreBUYAkFuVvehYzvo6oZnRCcHUc", "Market structures and regulation, drawn"]],
  "eco4-1": [["PLWeicFreBUYDtdp2JwDmZIYH3ROWG5wDM", "International trade, drawn"],
             ["PLWeicFreBUYCKmmqatYfaiBoNjc_3INk5", "Balance of payments, trade and protectionism"],
             ["PLWeicFreBUYCJJOkgx6l4bpi3aoT6E28z", "Exchange rates, globalisation and integration"]],
  "eco4-2": [["PLWeicFreBUYCs7NjXgFhQpoEDvnryFip2", "Inequality and poverty"]],
  "eco4-3": [["PLWeicFreBUYBmtPeoW8MOMudTm6OaCgjF", "Development economics"]],
  "eco4-4": [["PLWeicFreBUYCU4IjUPrKMzP5XIt-5idCu", "Financial markets"]],
  "eco4-5": [["PLWeicFreBUYABzU6C6coJdjCBOrMTIvVw", "Macro policy and performance"]],
  "eco5-1": [["PLWeicFreBUYD-AhJtDQ8q-hO7U5Bwd1J4", "Writing analysis, evaluation and judgement"]],
  "eco5-2": [["PLWeicFreBUYD-AhJtDQ8q-hO7U5Bwd1J4", "Writing analysis, evaluation and judgement"]]
};

/* Kept as the fallback for anything not covered above: a channel-scoped
   search always resolves to that creator's videos on the topic. */
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

/* Notes for one subtopic, or for a whole topic in Exam-Focus mode where the
   subtopic notes are stacked in specification order. Returns [] when a
   subtopic has not been written up yet, and the view says so rather than
   rendering an empty panel. */
function econNotesFor(id) {
  if (typeof ECO_NOTES === "undefined") return [];

  /* A chapter id: gather every subtopic under it. */
  if (typeof isChapterId === "function" && isChapterId(id)) {
    const inf = CHAPTER_INDEX[id];
    if (!inf) return [];
    return (inf.chapter.subs || []).map(function (sub) {
      const n = ECO_NOTES[sub.id];
      return n ? Object.assign({ id: sub.id, code: sub.code, name: sub.name }, n) : null;
    }).filter(Boolean);
  }

  const n = ECO_NOTES[id];
  if (!n) return [];
  const inf = SPEC_INDEX[id];
  return [Object.assign({ id: id, code: inf ? inf.sub.code : "", name: inf ? inf.sub.name : "" }, n)];
}

/* How much of a topic has been written up, so the UI can be honest about
   partial coverage rather than looking complete. */
function econNotesCoverage(chapterId) {
  const inf = CHAPTER_INDEX[chapterId];
  if (!inf || typeof ECO_NOTES === "undefined") return { have: 0, total: 0 };
  const subs = inf.chapter.subs || [];
  return {
    have: subs.filter(function (s) { return !!ECO_NOTES[s.id]; }).length,
    total: subs.length
  };
}

function buildLinks(sec, r) {
  const links = [];
  if (r.notes) {
    links.push({ label: "PMT detailed notes", url: r.notes.detailed, kind: "notes",
                 note: "Read these first, then turn them into flashcards" });
    links.push({ label: "PMT summary notes", url: r.notes.summary, kind: "notes",
                 note: "Shorter, for revisiting once you know it" });
  }
  /* the series for this theme, then anything narrower that covers this
     chapter specifically, then the search as a last resort */
  const theme = EPD_THEME[r.theme || 1];
  if (theme) {
    links.push({ label: "EconPlusDal: " + theme.name, url: EPD_PLAYLIST + theme.id, kind: "video",
                 note: theme.count + " videos across the theme. Watch after making your flashcards" });
  }
  (EPD_TOPIC[sec.id] || []).forEach(function (t) {
    links.push({ label: "EconPlusDal: " + t[1], url: EPD_PLAYLIST + t[0], kind: "video",
                 note: "The series on this chapter specifically" });
  });
  if (!theme) {
    links.push({ label: "EconPlusDal on this topic", url: econVideoSearch(sec.name), kind: "video",
                 note: "Content explained. Watch after making your flashcards" });
  }
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
