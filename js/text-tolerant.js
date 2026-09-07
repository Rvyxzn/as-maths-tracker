/* ============================================================
   Reading what somebody meant

   People type "2o0 min", "evry sat", "wanna do econ mondys", and
   a parser built on exact words throws all of it away and reports
   that it understood nothing. That is technically correct and
   completely useless: the sentence was perfectly clear.

   So everything is put through here first. It is three separate
   jobs and they are kept apart because they go wrong differently.

   NUMBERS. A letter inside a run of digits is a typo, not a
   letter: "2o0" is two hundred and "1l" is eleven. Only inside a
   digit run, though - "o" on its own is a word and "l" is not
   worth guessing at.

   SLANG AND SHORTHAND. A fixed list, expanded before anything is
   matched: "wanna" to "want to", "hrs" to "hours", "&" to "and".
   Fillers that carry no scheduling meaning at all - "tbh", "ngl",
   "lol" - are dropped rather than left to be reported as
   unreadable.

   SPELLING. Everything else is a fuzzy match against a known
   vocabulary: the day names, the subject names, the handful of
   keywords that matter. Edit distance, with the allowance scaled
   to the length of the word, so "mondya" finds Monday and "man"
   does not. A word that matches nothing is left exactly as it
   was, because a wrong correction is worse than no correction.
   ============================================================ */

const Tolerant = (function () {

  /* ------------------------------------------------------------
     edit distance, capped

     The cap is what makes this cheap: anything past the allowance
     can stop rather than finish the matrix.
     ------------------------------------------------------------ */
  function within(a, b, max) {
    a = String(a); b = String(b);
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > max) return -1;

    let prev = new Array(b.length + 1);
    let cur = new Array(b.length + 1);
    for (let j = 0; j <= b.length; j++) prev[j] = j;

    for (let i = 1; i <= a.length; i++) {
      cur[0] = i;
      let best = cur[0];
      for (let j = 1; j <= b.length; j++) {
        const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
        /* a transposition is one mistake, not two: "tuseday" is one slip */
        if (i > 1 && j > 1 &&
            a.charCodeAt(i - 1) === b.charCodeAt(j - 2) &&
            a.charCodeAt(i - 2) === b.charCodeAt(j - 1)) {
          cur[j] = Math.min(cur[j], prev[j - 2] !== undefined ? prev[j - 2] + cost : cur[j]);
        }
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return -1;
      const t = prev; prev = cur; cur = t;
    }
    return prev[b.length] <= max ? prev[b.length] : -1;
  }

  /* How wrong a word is allowed to be. Short words get no slack, because
     every three-letter word is one edit from several others. */
  function allowance(word) {
    const n = String(word).length;
    return n <= 3 ? 0 : n <= 5 ? 1 : n <= 9 ? 2 : 3;
  }

  /* The closest entry in a vocabulary, or null. `vocab` is a plain object of
     term -> whatever the caller wants back. */
  function nearest(word, vocab) {
    const w = String(word || "").toLowerCase();
    if (!w) return null;
    if (vocab[w] !== undefined) return { term: w, value: vocab[w], distance: 0 };
    const max = allowance(w);
    if (!max) return null;
    let best = null;
    Object.keys(vocab).forEach(function (term) {
      const d = within(w, term, max);
      if (d < 0) return;
      if (!best || d < best.distance || (d === best.distance && term.length > best.term.length)) {
        best = { term: term, value: vocab[term], distance: d };
      }
    });
    return best;
  }

  /* ------------------------------------------------------------
     the shorthand people actually type
     ------------------------------------------------------------ */

  /* Expanded before anything else looks at the text. Ordered longest first
     where one is a prefix of another. */
  const SLANG = {
    "wanna": "want to", "gonna": "going to", "gotta": "have to", "kinda": "kind of",
    "dunno": "do not know", "cus": "because", "cos": "because", "coz": "because",
    "bc": "because", "b/c": "because", "tho": "though", "altho": "although",
    "pls": "please", "plz": "please", "thx": "thanks", "u": "you", "ur": "your",
    "im": "i am", "ive": "i have", "id": "i would", "ill": "i will",
    "dont": "do not", "cant": "cannot", "wont": "will not", "isnt": "is not",
    "b4": "before", "l8r": "later", "w/": "with", "w/o": "without",
    "hr": "hour", "hrs": "hours", "hour's": "hours",
    "min": "minutes", "mins": "minutes", "minz": "minutes", "mnts": "minutes",
    "sec": "seconds", "secs": "seconds",
    "sesh": "session", "seshes": "sessions", "revison": "revision",
    "econ": "economics", "eco": "economics", "geog": "geography", "geo": "geography",
    "maths": "maths", "math": "maths", "bio": "biology", "chem": "chemistry",
    "phys": "physics", "psych": "psychology", "compsci": "computer science",
    "uni": "university", "ps": "personal statement",
    "everyday": "every day", "everyweek": "every week", "weekdays": "weekdays",
    "nothin": "nothing", "nuthin": "nothing", "somethin": "something",
    "evry": "every", "evry1": "everyone", "eveyday": "every day", "everyda": "every day",
    "lemme": "let me", "gimme": "give me", "abt": "about", "bout": "about",
    "wk": "week", "wks": "weeks", "wknd": "weekend", "wknds": "weekends",
    "sat": "saturday", "sun": "sunday", "tues": "tuesday", "thurs": "thursday",
    "thur": "thursday", "wed": "wednesday", "weds": "wednesday", "fri": "friday",
    "revising": "revision", "revise": "revision", "studying": "study",
    "arvo": "afternoon", "morn": "morning", "eve": "evening", "nite": "night"
  };

  /* Words that add nothing a timetable can act on. Left in, they turn a
     readable sentence into an unreadable one by dragging a clause below the
     threshold, and they get reported as "not understood" for no reason. */
  const FILLER = ("tbh ngl idk imo imho lol lmao omg btw fyi rn atm literally basically " +
    "honestly obviously actually just really very quite kinda sorta like ish " +
    "maybe perhaps probably def deffo obvs ye yeh yeah yea nah ok okay so well " +
    "please pls thanks ta cheers").split(" ");

  /* ------------------------------------------------------------
     the passes
     ------------------------------------------------------------ */

  /* "2o0" -> "200", "1l" -> "11", "3O" -> "30". Only where the run already
     contains a digit, so a bare "o" is left as a word. */
  function fixDigits(text) {
    return String(text).replace(/\b[\dolisz]{2,}\b/gi, function (run) {
      if (!/\d/.test(run)) return run;
      if (!/[olisz]/i.test(run)) return run;
      return run.replace(/[ol]/gi, "0").replace(/i/gi, "1").replace(/s/gi, "5").replace(/z/gi, "2");
    });
  }

  function expandSlang(text) {
    return String(text).replace(/[A-Za-z][A-Za-z/'’]*/g, function (w) {
      const k = w.toLowerCase().replace(/[’]/g, "'");
      return SLANG[k] !== undefined ? SLANG[k] : w;
    });
  }

  /* Filler goes, but its punctuation stays. "three hours a day tbh, no
     revision on Friday" has the comma attached to "tbh", and dropping the
     token whole took the comma with it - which welded two clauses into one
     and put the day of the second onto the cap of the first. */
  function dropFiller(text) {
    const set = {};
    FILLER.forEach(function (w) { set[w] = true; });
    return String(text).split(/(\s+)/).map(function (tok) {
      if (/^\s+$/.test(tok)) return tok;
      const m = /^([^\w]*)(.*?)([^\w]*)$/.exec(tok);
      const word = (m ? m[2] : tok).toLowerCase();
      if (!set[word]) return tok;
      return (m ? m[1] + m[3] : "");
    }).join("").replace(/\s{2,}/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
  }

  /* Everything, in the order that keeps each pass honest: digits before
     slang (so "2hrs" survives), slang before filler (so "deffo" is dropped
     rather than half-expanded). */
  function clean(text) {
    let t = String(text || "").toLowerCase()
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
      .replace(/&/g, " and ")
      .replace(/[–—]/g, "-");
    t = fixDigits(t);
    t = expandSlang(t);
    t = dropFiller(t);
    return t.replace(/\s{2,}/g, " ").trim();
  }

  /* Correct the words of a sentence against a vocabulary, leaving anything
     that matches nothing exactly as it was. Returns the sentence and what
     was changed, so a caller can show its corrections rather than silently
     rewriting what somebody typed. */
  function correct(text, vocab) {
    const fixes = [];
    const out = String(text).replace(/[a-z]{3,}/gi, function (w) {
      const hit = nearest(w, vocab);
      if (!hit || hit.distance === 0) return w;
      fixes.push({ from: w, to: hit.term });
      return hit.term;
    });
    return { text: out, fixes: fixes };
  }

  return { clean: clean, correct: correct, nearest: nearest, within: within,
           fixDigits: fixDigits, expandSlang: expandSlang, dropFiller: dropFiller,
           SLANG: SLANG };
})();
