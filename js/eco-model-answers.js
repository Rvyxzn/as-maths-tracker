/* ============================================================
   Model answers - Edexcel A level Economics A (9EC0)
   ------------------------------------------------------------
   Nothing here is invented. A model answer is assembled at read
   time out of two things Pearson published about that exact
   question: the mark scheme's indicative content, and the
   examiner's report on what the marks actually went to.

   That is deliberate. A written-out essay would be one person's
   answer, and the thing worth learning is not one person's
   wording but the shape a full-mark answer has: how many chains,
   how long each one runs, where the diagram goes, and how much of
   the paper's time belongs to the evaluation. So what you get is
   the plan, in Pearson's own points, timed by the 1.2 minutes a
   mark the paper allows, with the examiner's stated reasons that
   answers gained or lost marks sitting beside it.

   The report is one long run of text per question, but it is
   written to a fixed shape: general commentary first, then one
   block per exemplar script, each of which ends with "Examiner
   Comments" or "Examiner Tip". Those markers are what make it
   splittable, and they are Pearson's, not ours.
   ============================================================ */

const EcoModel = (function () {

  /* The shape of a full-mark answer at each tariff, from the real KAA and
     evaluation split in the mark schemes. Paragraph counts are what the
     examiner reports repeatedly ask for: depth over breadth. */
  const SHAPE = {
    5:  { kaa: 5,  ev: 0, chains: 1, judgement: false,
          steps: [["Define or calculate", 1], ["Explain the one reason, as a chain", 2],
                  ["Apply it to the data in front of you", 2]] },
    8:  { kaa: 6,  ev: 2, chains: 2, judgement: false,
          steps: [["Point one: define, apply, then analyse", 3],
                  ["Point two: define, apply, then analyse", 3],
                  ["One evaluative comment, developed", 2]] },
    10: { kaa: 6,  ev: 4, chains: 2, judgement: true,
          steps: [["Define the term in context", 1],
                  ["Chain one, applied to the extract", 3],
                  ["Chain two, applied to the extract", 2],
                  ["Evaluation running alongside, not bolted on", 4]] },
    12: { kaa: 8,  ev: 4, chains: 2, judgement: true,
          steps: [["Define the term in context", 1],
                  ["Chain one, fully developed", 4],
                  ["Chain two, fully developed", 3],
                  ["Evaluate both, then decide", 4]] },
    15: { kaa: 9,  ev: 6, chains: 2, judgement: true,
          steps: [["Define and set up the context", 1],
                  ["Chain one, with the diagram if one applies", 4],
                  ["Chain two, fully developed", 4],
                  ["Evaluation, then a judgement that decides", 6]] },
    25: { kaa: 16, ev: 9, chains: 2, judgement: true,
          steps: [["Define the terms the question uses", 2],
                  ["Chain one, with a labelled diagram, taken to the fourth link", 8],
                  ["Chain two, taken just as far", 6],
                  ["Evaluation: what it depends on, and how much", 6],
                  ["Judgement: answer the question you were asked", 3]] }
  };

  /* TWO ANALYTICAL PARAGRAPHS, WHATEVER THE TARIFF.

     A 25-marker is not a 12-marker with a third argument bolted on; it is
     two arguments taken further. The examiner reports say this in almost
     every series -- depth beats breadth, and the commonest way to lose an
     A is to run out of time before the evaluation because a third chain
     ate it. So the count is capped at two and the extra marks buy longer
     chains and more evaluation, which is where they actually are. */
  const MAX_CHAINS = 2;

  /* THE ANSWER IS PARAGRAPHS, NOT A LIST OF EVERYTHING ALLOWED.

     A scheme lists every point an examiner may credit -- nineteen of them
     on one 8-mark question -- because it has to cover whatever a candidate
     writes. Printing all nineteen is not a model answer, it is the scheme
     again, and it teaches the opposite of what the tariff rewards: an
     8-mark Examine wants TWO points taken a long way, and a candidate who
     writes nineteen lines scores level 1.

     So the plan takes as many points as the tariff actually pays for,
     pairs each with an evaluation of that same point, and lays them out in
     the order they are written. `chains` is that count, and it rises with
     the marks. The wording of each point stays Pearson's; the shape around
     it is what the tariff dictates. */
  const LINKS = [
    "State the point and define the term it turns on.",
    "Say why it happens — the mechanism, not the label.",
    "Take it one step further: and therefore…",
    "Land it on what the question asked about, in this context."
  ];

  /* Pearson's own section markers inside a report. */
  const MARKERS = /(Examiner Comments|Examiner Tip)/g;
  const EXEMPLAR = /This answer achieves (?:a mark of )?(\d+)\s*\/\s*(\d+)/i;

  /* Sentences in the general commentary that say what cost marks. The
     wording is stable across fifteen series because the reports are written
     to a house style. */
  const LOST = /(failed to|did not|lost a mark|common error|weaker response|weak response|low scoring|struggled|confused|a lack of|too many candidates|not always|unfortunately|mistake|were unable)/i;
  const GAINED = /(high scoring|full marks|stronger candidates|candidates who|well[- ]structured|effectively|impressive|best practice|top level|were able to)/i;

  function sentences(text) {
    return String(text || "")
      .split(/(?<=[.!?])\s+(?=[A-Z“'(])/)
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 25; });
  }

  /* Split the report into the general commentary and the exemplar blocks.
     Everything before the first "This answer achieves..." is the examiner
     talking about the cohort; after it, about one script at a time. */
  function parts(report) {
    const text = String(report || "").trim();
    if (!text) return { general: "", exemplars: [], tips: [] };

    const first = text.search(/This answer achieves/i);
    const general = first > 0 ? text.slice(0, first).trim() : (first < 0 ? text : "");
    const rest = first >= 0 ? text.slice(first) : "";

    /* One block per script: each starts at "This answer achieves". */
    const exemplars = rest.split(/(?=This answer achieves)/i)
      .map(function (b) { return b.trim(); })
      .filter(Boolean)
      .map(function (b) {
        const m = b.match(EXEMPLAR);
        /* The block runs "...script commentary... Examiner Comments ...tip...
           Examiner Tip". The tip is already listed on its own, and the
           trailing "Paper Summary" belongs to the whole paper rather than
           this question, so what is left is the commentary itself. */
        const body = b.split(/Paper Summary/)[0].split(/Examiner Comments/)[0].trim();
        return { got: m ? +m[1] : null, outOf: m ? +m[2] : null, text: body };
      });

    /* A tip is the sentence immediately before Pearson's "Examiner Tip"
       marker, which is how the reports label their own advice. */
    const tips = [];
    String(report).split(MARKERS).forEach(function (chunk, i, all) {
      if (all[i] !== "Examiner Tip") return;
      const prev = all[i - 1] || "";
      const ss = sentences(prev);
      const take = ss.slice(-2).join(" ");
      if (take) tips.push(take);
    });

    return { general: general, exemplars: exemplars, tips: unique(tips) };
  }

  function unique(list) {
    const seen = {};
    return list.filter(function (s) {
      const k = s.toLowerCase().replace(/\W+/g, " ").trim();
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    });
  }

  /* The mark scheme, split into the points you would actually write. A
     heading ending in a colon owns the bullets beneath it, and the
     "Evaluation" allocation is where the second half of the answer starts.

     Most schemes are bulleted, but the short calculation questions are
     written as prose - "1 mark for applying the formula and 1 mark for the
     correct answer" - and a plan with nothing in it is worse than no plan,
     so those lines are kept too and used when there are no bullets. */
  function scheme(ms) {
    const lines = String(ms || "").split("\n").map(function (l) { return l.trim(); })
                    .filter(Boolean);
    const kaa = [], ev = [], prose = [];
    let inEval = false, heading = "";

    lines.forEach(function (line) {
      /* "Evaluation 9" is where the second half of the answer starts - unless
         the allocation wrapped onto two lines, in which case it is still the
         tail of "Knowledge 4, Application 4, Analysis 8," and nothing has
         been written yet. Which one it is depends on whether any point has
         been read, not on the words. */
      if (/^Evaluation\s*\d+\s*$/i.test(line)) {
        if (kaa.length || ev.length || prose.length) { inEval = true; heading = ""; }
        return;
      }
      if (/^Evaluation\b/i.test(line)) {
        inEval = true;
        /* the heading above belonged to the knowledge half; carrying it over
           put "Economic effects include" on top of the evaluation points */
        heading = /:$/.test(line) ? line.replace(/:$/, "") : "";
        return;
      }
      if (/^(Knowledge|Application|Analysis|KAA)\b/i.test(line) && /^\S+\s*\d+\s*[,;]?/.test(line) &&
          !/:/.test(line)) { inEval = false; return; }
      if (/^\([a-e]\)$/.test(line)) { heading = "Part (" + line.replace(/[()]/g, "") + ")"; return; }
      if (/:$/.test(line)) { heading = line.replace(/:$/, ""); return; }

      if (line.indexOf("•") === 0) {
        const point = line.replace(/^•\s*/, "").replace(/\s*\(\d+(\+\d+)*\)\s*$/, "").trim();
        if (point) (inEval ? ev : kaa).push({ heading: heading, text: point });
        return;
      }

      /* prose: the sentence has to be saying something, not be a stray total */
      if (line.length > 12 && !/^\(?\d+\)?$/.test(line)) {
        prose.push({ heading: heading, text: line.replace(/\s*\(\d+\)\s*$/, "").trim() });
      }
    });

    if (!kaa.length && !ev.length) return { kaa: prose, ev: [], notes: [], fromProse: true };
    /* The prose around the bullets is where the scheme puts its conditions:
       "NB for a Level 3 response, candidates must consider both", "Negative
       consequences can be seen as KAA and positive as evaluation". Those are
       instructions for how to score, so they belong in the plan. */
    return { kaa: kaa, ev: ev, notes: prose, fromProse: false };
  }

  /* Does this question want a diagram? The mark scheme says so outright
     whenever it does, so there is no need to guess from the topic. */
  function wantsDiagram(ms) {
    return /\bdiagram\b/i.test(String(ms || ""));
  }

  function minutes(marks) {
    return Math.round(marks * (typeof ECO_MINUTES_PER_MARK === "number" ? ECO_MINUTES_PER_MARK : 1.2));
  }

  /* Everything the model-answer panel needs for one question. */
  /* One chain per paragraph you are going to write: the point, and the
     evaluation of that point sitting with it rather than in a heap at the
     end. Where the scheme has fewer evaluation points than chains the
     later chains carry no paired evaluation rather than borrowing one that
     belongs to a different argument. */
  /* A scheme usually opens by crediting the definition -- "Definition of
     monopsony", "Identification of an ad valorem tax". That is the first
     sentence of the answer, not one of its arguments, and letting it take
     a chain slot cost a 25-marker one of its three chains. It is lifted
     out and the chains start after it. */
  const DEFN = /^(definition|identification|defining|recognition)\b|^\s*def\b/i;

  function chainsFor(sh, sc) {
    const points = sc.kaa.slice();
    let define = null;
    if (points.length && DEFN.test(points[0].text)) define = points.shift().text;

    const out = [];
    const want = Math.min(sh.chains, MAX_CHAINS);
    for (let i = 0; i < want && i < points.length; i++) {
      out.push({
        n: i + 1,
        point: points[i].text,
        heading: points[i].heading || "",
        ev: sh.ev && sc.ev[i] ? sc.ev[i].text : null
      });
    }
    return { define: define, chains: out, rest: points.slice(want) };
  }

  function build(q, report) {
    if (!q) return null;
    const sh = SHAPE[q.marks] || SHAPE[25];
    const sc = scheme(q.ms);
    const pr = parts(report);
    const plan = chainsFor(sh, sc);
    const general = sentences(pr.general);

    /* The highest-scoring exemplar is the one worth reading: it is the
       examiner describing an answer that got the marks. */
    const best = pr.exemplars.slice().sort(function (a, b) {
      return (b.got || 0) - (a.got || 0);
    })[0] || null;

    const gained = general.filter(function (s) { return GAINED.test(s) && !LOST.test(s); }).slice(0, 4);
    const lost = general.filter(function (s) { return LOST.test(s); }).slice(0, 4);

    return {
      marks: q.marks,
      minutes: minutes(q.marks),
      split: { kaa: sh.kaa, ev: sh.ev },
      steps: sh.steps.map(function (s) {
        return { label: s[0], marks: s[1], minutes: minutes(s[1]) };
      }),
      diagram: wantsDiagram(q.ms),
      /* The answer itself: as many chains as the tariff pays for, each one
         a point paired with the evaluation of that point. */
      define: plan.define,
      chains: plan.chains,
      chainCount: sh.chains,
      links: LINKS,
      judgement: sh.judgement,
      /* Everything else the scheme would also have accepted, kept out of
         the answer but available underneath it, because "these were the
         other nineteen" is worth seeing once you have written yours. */
      alsoKaa: plan.rest,
      alsoEv: sc.ev.slice(sh.chains),
      kaa: sc.kaa,
      ev: sc.ev,
      conditions: sc.notes || [],
      fromProse: sc.fromProse,
      gained: gained,
      lost: lost,
      /* A report whose wording matched neither filter still said something
         about this question, and the first few sentences are where the
         examiner says how the cohort did. Better than an empty panel. */
      notes: (gained.length || lost.length) ? [] : general.slice(0, 3),
      tips: pr.tips.slice(0, 4),
      best: best && best.got !== null ? best : null,
      hasReport: !!String(report || "").trim()
    };
  }

  return { build: build, scheme: scheme, parts: parts, SHAPE: SHAPE };
})();
