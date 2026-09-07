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
   EconPlusDal playlists

   Every id below was read back from YouTube's own feed for that
   playlist, and the NAME is the playlist's real title rather
   than a description of it. That distinction matters: the last
   set of names here were paraphrases, and two chapters ended up
   pointing at the same id under two different invented titles,
   which is how "Government intervention" came to offer a series
   of diagram tutorials as its content.

   CONTENT, DIAGRAMS AND WALKTHROUGHS ARE THREE DIFFERENT THINGS.

   The channel has course playlists that teach a theme, "…
   Diagrams" playlists that show you how to draw one thing after
   another, and a series of worked 25-mark answers. They are not
   interchangeable. A diagrams playlist is the right thing to
   watch when you cannot draw the graph and the wrong thing to
   watch when you do not know the content, so they are kept apart
   and offered for what they are.

   WHY THE COURSE PLAYLISTS ARE LINKS AND NOT AN EMBEDDED SERIES.
   Maths sets `playlist` per chapter, which drives the
   watch-every-video step and counts progress through it. That
   works there because a playlist IS a chapter. Here one course
   playlist covers a whole theme, so attaching it to 1.2 would
   claim "How markets work" needs every video in it watched.

   No video counts are recorded. The feed returns only the most
   recent fifteen entries of a playlist, so a count taken from it
   would be wrong for every series longer than that, and a number
   that is wrong is worse than no number.
   ------------------------------------------------------------ */

const EPD_PLAYLIST = "https://www.youtube.com/playlist?list=";

/* theme number -> the course playlist that teaches it */
const EPD_THEME = {
  1: { id: "PLWeicFreBUYCOFC2A0SlKrpEYgwaSF63t", name: "Microeconomics - Year 1 A Level and IB" },
  2: { id: "PLWeicFreBUYDlaLppnRTZpwgBASflf4lU", name: "Macroeconomics - Year 1 A Level and IB" },
  3: { id: "PLWeicFreBUYDwmBZ0AiJwhCNSCb0di9eI", name: "Microeconomics - Year 2 A Level and IB" },
  4: { id: "PLWeicFreBUYBW3kSFnfBC8MSvPdH6DbqQ", name: "Macroeconomics - Year 2 A Level & IB Global Economy" },
  5: { id: "PLWeicFreBUYCuUesTjG3RLfnYynR_6AsM", name: "Edexcel Exam Technique, Tips & Guidance" }
};

/* chapter id -> a narrower series that TEACHES that chapter. Only where the
   channel has one; a chapter with nothing here uses its theme's course
   playlist, which is the honest answer rather than the nearest diagram set. */
const EPD_TOPIC = {
  "eco1-2": [["PLWeicFreBUYDiPDqmdQafZ3eSxVUEdOPX", "Behavioural Economics & Utility Theory - Year 2 A Level"]],
  "eco2-6": [["PLWeicFreBUYABzU6C6coJdjCBOrMTIvVw", "AS/AD, Phillips Curve, Macro Policy & Performance - Year 2 A Level & IB"]],
  "eco3-5": [["PLWeicFreBUYCs7NjXgFhQpoEDvnryFip2", "Labour Market, Income/Wealth Inequality and Poverty - Year 2 A Level"]],
  "eco4-1": [["PLWeicFreBUYCKmmqatYfaiBoNjc_3INk5", "Balance of Payments, Trade & Protectionism - Year 2 A Level & IB"],
             ["PLWeicFreBUYCJJOkgx6l4bpi3aoT6E28z", "Exchange Rates, Globalisation, Economic Integration - Year 2 A Level & IB"]],
  "eco4-2": [["PLWeicFreBUYCs7NjXgFhQpoEDvnryFip2", "Labour Market, Income/Wealth Inequality and Poverty - Year 2 A Level"]],
  "eco4-3": [["PLWeicFreBUYBmtPeoW8MOMudTm6OaCgjF", "Development Economics - Year 2 A Level and IB"]],
  "eco4-4": [["PLWeicFreBUYCU4IjUPrKMzP5XIt-5idCu", "Financial Markets - Year 2 A Level"]],
  "eco4-5": [["PLWeicFreBUYABzU6C6coJdjCBOrMTIvVw", "AS/AD, Phillips Curve, Macro Policy & Performance - Year 2 A Level & IB"]],
  "eco5-1": [["PLWeicFreBUYD-AhJtDQ8q-hO7U5Bwd1J4", "Writing Skills in Economics (Analysis, Evaluation and Judgement)"]],
  "eco5-2": [["PLWeicFreBUYD-AhJtDQ8q-hO7U5Bwd1J4", "Writing Skills in Economics (Analysis, Evaluation and Judgement)"]]
};

/* The diagram series, and which chapters each one is actually about.

   Placed by their contents, not by their titles. "Market Failure Diagrams"
   runs externalities first and then eight ways of intervening - indirect
   tax, subsidy, state provision, information provision, tradable permits,
   buffer stocks - so it belongs to Government intervention as much as to
   Market failure, and the price control diagrams in the demand and supply
   set belong there too. */
const EPD_GRAPHS = {
  "eco1-2": [["PLWeicFreBUYCuNX9eIFvxSXfvqmQZ56GV", "Demand/Supply, Elasticity & Price Control Diagrams"]],
  "eco1-3": [["PLWeicFreBUYBRcEEeVbCYFxKqrYEBT4WK", "Market Failure Diagrams"]],
  "eco1-4": [["PLWeicFreBUYBRcEEeVbCYFxKqrYEBT4WK", "Market Failure Diagrams"],
             ["PLWeicFreBUYCuNX9eIFvxSXfvqmQZ56GV", "Demand/Supply, Elasticity & Price Control Diagrams"]],
  "eco2-1": [["PLWeicFreBUYBrW52KNuBPAAq4YuTHqQQo", "Growth, Inflation, Unemployment, Inequality Diagrams"]],
  "eco2-2": [["PLWeicFreBUYAFmz0NbEJkb1Lk6T6lY_a3", "AS/AD Diagrams"]],
  "eco2-3": [["PLWeicFreBUYAFmz0NbEJkb1Lk6T6lY_a3", "AS/AD Diagrams"]],
  "eco2-4": [["PLWeicFreBUYAFmz0NbEJkb1Lk6T6lY_a3", "AS/AD Diagrams"]],
  "eco2-5": [["PLWeicFreBUYBrW52KNuBPAAq4YuTHqQQo", "Growth, Inflation, Unemployment, Inequality Diagrams"]],
  "eco2-6": [["PLWeicFreBUYAFmz0NbEJkb1Lk6T6lY_a3", "AS/AD Diagrams"]],
  "eco3-3": [["PLWeicFreBUYAkFuVvehYzvo6oZnRCcHUc", "Market Structure Diagrams"]],
  "eco3-4": [["PLWeicFreBUYAkFuVvehYzvo6oZnRCcHUc", "Market Structure Diagrams"]],
  "eco3-5": [["PLWeicFreBUYDmQmlnMnDDYU5ifAqlTkGF", "Labour Market Diagrams"]],
  "eco3-6": [["PLWeicFreBUYAkFuVvehYzvo6oZnRCcHUc", "Market Structure Diagrams"]],
  "eco4-1": [["PLWeicFreBUYDtdp2JwDmZIYH3ROWG5wDM", "International Trade Diagrams"]],
  "eco4-2": [["PLWeicFreBUYBrW52KNuBPAAq4YuTHqQQo", "Growth, Inflation, Unemployment, Inequality Diagrams"]]
};

/* Worked 25-mark answers, one at a time. Its own thing entirely: not content
   and not a diagram, but somebody writing the essay in front of you, which is
   the one part of a 25-marker that nothing else shows. */
const EPD_WALKTHROUGH = {
  id: "PLp8BSCLLWBUBtulbMZmJX04KW9sjU6Kf0",
  name: "Edexcel A-Level Economics 25 Markers | Answer Walkthroughs"
};

/* Which playlist to put in the player for a chapter: the series that teaches
   it where the channel has one, and the theme course otherwise. Never a
   diagram set - those are offered as graph practice instead. */
function epdEmbed(secId, theme) {
  const own = (typeof EPD_TOPIC !== "undefined" && EPD_TOPIC[secId]) ? EPD_TOPIC[secId][0] : null;
  if (own) return { id: own[0], title: own[1] };
  const t = (typeof EPD_THEME !== "undefined") ? EPD_THEME[theme] : null;
  return t ? { id: t.id, title: t.name } : null;
}

/* Graph practice for a chapter: the diagram series that covers it, and one
   real exam question that wants that diagram drawn, so the section finishes
   with using the graph rather than only watching it. */
function econGraphSkills(chapterId) {
  const secId = String(chapterId || "").replace(/^ch:/, "");
  const lists = (typeof EPD_GRAPHS !== "undefined" && EPD_GRAPHS[secId]) || [];
  if (!lists.length) return null;
  return {
    playlists: lists.map(function (t) {
      return { id: t[0], name: t[1], url: EPD_PLAYLIST + t[0] };
    }),
    question: econDiagramQuestion(secId)
  };
}

/* A past-paper question on this topic whose mark scheme credits a diagram.
   Chosen from the bank rather than written, and null when there is not one,
   because inventing a question to round the section off would defeat it. */
function econDiagramQuestion(secId) {
  if (typeof ECO_QUESTIONS === "undefined") return null;
  const m = /^eco(\d)-(\d)$/.exec(secId);
  if (!m) return null;
  const prefix = m[1] + "." + m[2] + ".";
  const wants = /\bdiagram\b/i;
  const pool = ECO_QUESTIONS.filter(function (q) {
    return String(q.topicCode || "").indexOf(prefix) === 0 &&
           (wants.test(q.text || "") || wants.test(q.ms || ""));
  });
  if (!pool.length) return null;
  /* the smallest tariff that still wants the diagram: graph practice is
     about the graph, not about finding forty minutes for an essay */
  pool.sort(function (a, b) { return a.marks - b.marks; });
  return pool[0];
}


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
        /* The player embeds the narrowest checked series that covers this
           chapter: its own topic playlist where the channel has one, and the
           theme series otherwise. Both ids were read off the channel and
           their titles checked, so neither is a guess.

           `count` is deliberately left off. It is what the watch-every-video
           step counts towards, and a theme playlist spans four to six
           chapters — claiming 1.2 needs all 43 would hold the chapter open
           for videos belonging to 1.1, 1.3 and 1.4. Without it the step uses
           its own modest default, which you can set per chapter, and the
           full series is still one click away in the links below. */
        playlist: epdEmbed(sec.id, r.theme || 1),
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
                 note: "The course series for this theme. Watch after making your flashcards" });
  }
  (EPD_TOPIC[sec.id] || []).forEach(function (t) {
    links.push({ label: "EconPlusDal: " + t[1], url: EPD_PLAYLIST + t[0], kind: "video",
                 note: "The series on this chapter specifically" });
  });
  /* The diagram sets are listed as what they are. Offering "Market Failure
     Diagrams" as the way to learn Government intervention is how the wrong
     playlist ended up on 1.4 in the first place. */
  (EPD_GRAPHS[sec.id] || []).forEach(function (t) {
    links.push({ label: "EconPlusDal: " + t[1], url: EPD_PLAYLIST + t[0], kind: "video",
                 note: "How to draw them, not what they mean" });
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
