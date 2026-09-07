/* ============================================================
   Taking a timetable in from somewhere else

   Two different problems, kept apart because they fail
   differently.

   READING A TIMETABLE. Somebody has a grid already - exported
   from here, written out by ChatGPT, pasted from a spreadsheet,
   typed into a document. The old import accepted exactly one
   shape, its own, and everything else was "that is not a
   timetable file", which is a useless thing to say to someone
   holding a timetable. This reads the shapes people actually
   turn up with, and says which one it recognised.

   READING A DESCRIPTION. "Three hours a day, one subject a day,
   45 minutes on my personal statement every Sunday." That is not
   a timetable, it is the rules for building one, and the rules
   are what this app already knows how to act on. So a sentence
   becomes settings, and the settings are shown before anything is
   changed rather than applied silently.

   WHAT THIS IS NOT. It is not a language model. It reads a clause
   at a time and offers each one to every rule, and whatever
   matched nothing comes back in a list. That last part is the
   important one: a reader that quietly drops the sentence it did
   not understand is worse than one that cannot read it at all,
   because you carry on believing it was set up.

   A photo has no text in it, so it goes through Ocr first and
   arrives here as text like anything else.
   ============================================================ */

const TimetableAdopt = (function () {

  const DAY_WORDS = {
    sunday: 0, sun: 0, sundays: 0,
    monday: 1, mon: 1, mondays: 1,
    tuesday: 2, tue: 2, tues: 2, tuesdays: 2,
    wednesday: 3, wed: 3, weds: 3, wednesdays: 3,
    thursday: 4, thu: 4, thur: 4, thurs: 4, thursdays: 4,
    friday: 5, fri: 5, fridays: 5,
    saturday: 6, sat: 6, saturdays: 6
  };

  const WEEKDAYS = [1, 2, 3, 4, 5];
  const WEEKEND = [0, 6];

  /* ------------------------------------------------------------
     small parsers
     ------------------------------------------------------------ */

  /* "4pm", "16:30", "4.30pm", "0930" -> minutes from midnight, or null. */
  function timeOf(raw) {
    const t = String(raw || "").trim().toLowerCase().replace(/\s+/g, "");
    let m = /^(\d{1,2})[:.](\d{2})(am|pm)?$/.exec(t);
    if (m) {
      let h = +m[1];
      if (m[3] === "pm" && h < 12) h += 12;
      if (m[3] === "am" && h === 12) h = 0;
      return h * 60 + (+m[2]);
    }
    m = /^(\d{1,2})(am|pm)$/.exec(t);
    if (m) {
      let h = +m[1];
      if (m[2] === "pm" && h < 12) h += 12;
      if (m[2] === "am" && h === 12) h = 0;
      return h * 60;
    }
    m = /^(\d{2})(\d{2})$/.exec(t);
    if (m && +m[1] < 24) return (+m[1]) * 60 + (+m[2]);
    return null;
  }

  function clock(mins) {
    mins = Math.max(0, Math.min(24 * 60 - 1, Math.round(mins)));
    return String(Math.floor(mins / 60)).padStart(2, "0") + ":" + String(mins % 60).padStart(2, "0");
  }

  /* People write "three hours" as often as "3 hours", and half of them say
     "an hour and a half". */
  const NUM_WORDS = {
    a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
    fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50, ninety: 90,
    half: 0.5, quarter: 0.25
  };
  const NUM = "(\\d+(?:\\.\\d+)?|" + Object.keys(NUM_WORDS).join("|") + ")";

  function amount(s) {
    const t = String(s).toLowerCase();
    return NUM_WORDS[t] != null ? NUM_WORDS[t] : parseFloat(t);
  }

  /* "3 hours", "90 minutes", "1h30", "45 min", "three hours",
     "two and a half hours", "half an hour" -> minutes.

     The halves come first. Searching for a number in front of "hours" finds
     "half" in "two and a half hours", which is how two and a half hours came
     out as one. */
  const HOUR = "(?:h\\b|hr|hrs|hour|hours)";
  const MIN = "(?:m\\b|min|mins|minute|minutes)";

  function durationOf(raw) {
    const t = String(raw || "").toLowerCase();

    if (/\bhalf an hour\b/.test(t)) return 30;
    if (/\b(?:a |an )?quarter of an hour\b/.test(t)) return 15;

    const andHalf = new RegExp(NUM + "\\s*(?:and )?a half\\s*" + HOUR).exec(t);
    if (andHalf && amount(andHalf[1]) !== 0.5) return Math.round(amount(andHalf[1]) * 60) + 30;

    let total = null;
    const h = new RegExp(NUM + "\\s*" + HOUR).exec(t);
    const m = new RegExp(NUM + "\\s*" + MIN).exec(t);
    if (h) total = Math.round(amount(h[1]) * 60);
    if (m) total = (total || 0) + Math.round(amount(m[1]));
    /* "an hour and a half", where the number is the "an" */
    if (h && total != null && /\band a half\b/.test(t) && !andHalf) total += 30;
    return total;
  }

  /* Every weekday named in a phrase, including "weekends" and "every day". */
  function daysIn(text) {
    const t = String(text || "").toLowerCase();
    const out = {};
    if (/\b(every ?day|each day|all week|daily)\b/.test(t)) [0, 1, 2, 3, 4, 5, 6].forEach(function (d) { out[d] = true; });
    if (/\bweekends?\b/.test(t)) WEEKEND.forEach(function (d) { out[d] = true; });
    if (/\bweek ?days?\b/.test(t)) WEEKDAYS.forEach(function (d) { out[d] = true; });
    Object.keys(DAY_WORDS).forEach(function (w) {
      if (new RegExp("\\b" + w + "\\b").test(t)) out[DAY_WORDS[w]] = true;
    });
    return Object.keys(out).map(Number).sort();
  }

  /* ------------------------------------------------------------
     reading a timetable someone else made
     ------------------------------------------------------------ */

  /* One row of somebody's grid, however they spelled the fields. */
  function rowOf(o) {
    if (!o || typeof o !== "object") return null;
    const pick = function (names) {
      for (let i = 0; i < names.length; i++) {
        const k = Object.keys(o).filter(function (kk) { return kk.toLowerCase() === names[i]; })[0];
        if (k && o[k] != null && o[k] !== "") return o[k];
      }
      return null;
    };
    const label = pick(["subject", "task", "title", "label", "activity", "what", "topic", "name"]);
    const day = pick(["day", "weekday", "date", "when"]);
    let from = pick(["start", "from", "starttime", "start_time", "begin"]);
    let to = pick(["end", "to", "endtime", "end_time", "finish"]);
    const time = pick(["time", "slot", "period"]);

    /* "16:30-18:00" in one field is as common as two fields */
    if ((!from || !to) && time) {
      const m = /([\d.:apm]+)\s*(?:-|–|—|to|until)\s*([\d.:apm]+)/i.exec(String(time));
      if (m) { from = m[1]; to = m[2]; }
    }
    const mins = durationOf(String(pick(["minutes", "mins", "duration", "length"]) || ""));
    const f = timeOf(from);
    let t = timeOf(to);
    if (f != null && t == null && mins) t = f + mins;
    if (f == null || t == null || !label) return null;
    return { day: dayOf(day), from: f, to: t, label: String(label).trim() };
  }

  /* A day field can be a weekday name, a weekday number, or a date. Anything
     else is left alone so the caller can fall back to its own hint. */
  function dayOf(v) {
    if (v == null) return null;
    if (typeof v === "number") return v >= 0 && v <= 6 ? v : null;
    const s = String(v).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const named = DAY_WORDS[s.toLowerCase()];
    if (named != null) return named;
    const inside = daysIn(s);
    return inside.length === 1 ? inside[0] : null;
  }

  /* Whatever shape the document is, come out with a flat list of rows. */
  function rowsFrom(data) {
    const rows = [];
    const push = function (r, dayHint) {
      if (!r) return;
      if (r.day == null && dayHint != null) r.day = dayHint;
      rows.push(r);
    };

    if (Array.isArray(data)) {
      data.forEach(function (o) { push(rowOf(o)); });
      return rows;
    }
    if (!data || typeof data !== "object") return rows;

    /* { days: {...} } or { schedule: {...} } or { timetable: {...} } */
    const inner = data.days || data.schedule || data.timetable || data.week || data.plan;
    const src = (inner && typeof inner === "object") ? inner : data;

    Object.keys(src).forEach(function (k) {
      const v = src[k];
      if (!v) return;
      const asDay = DAY_WORDS[k.toLowerCase()];
      const isDate = /^\d{4}-\d{2}-\d{2}$/.test(k);
      const hint = asDay != null ? asDay : (isDate ? k : null);
      if (Array.isArray(v)) v.forEach(function (o) { push(rowOf(o), hint); });
      else if (typeof v === "object") push(rowOf(v), hint);
    });
    return rows;
  }

  /* Lines like "Monday 16:30-18:00 Maths" or "Mon, 4pm, 6pm, Economics". */
  function rowsFromText(text) {
    const rows = [];
    String(text || "").split(/\r?\n/).forEach(function (raw) {
      const line = raw.trim();
      if (!line || line.length > 200) return;
      const days = daysIn(line);
      const m = /([\d]{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)\s*(?:-|–|—|to|until)\s*([\d]{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)/i.exec(line);
      if (!days.length || !m) return;
      const from = timeOf(m[1]), to = timeOf(m[2]);
      if (from == null || to == null || to <= from) return;
      /* the label is whatever is left once the day and the times are removed */
      let label = line.replace(m[0], " ");
      Object.keys(DAY_WORDS).forEach(function (w) {
        label = label.replace(new RegExp("\\b" + w + "\\b", "ig"), " ");
      });
      label = label.replace(/[,;:|\t]+/g, " ").replace(/\s+/g, " ").trim();
      days.forEach(function (d) {
        rows.push({ day: d, from: from, to: to, label: label || "Revision" });
      });
    });
    return rows;
  }

  /* Match a row's subject text to one of yours, so an imported block opens
     the right subject rather than being a coloured rectangle. */
  function subjectFor(label) {
    const t = String(label || "").toLowerCase();
    let hit = null;
    (typeof Subjects !== "undefined" ? Subjects.list() : []).forEach(function (s) {
      const names = [s.name, s.short, s.id].filter(Boolean).map(function (x) { return String(x).toLowerCase(); });
      names.forEach(function (n) {
        if (n.length >= 3 && t.indexOf(n) >= 0 && !hit) hit = s;
      });
    });
    return hit;
  }

  /* Turn the rows into real days, from today forward. A weekday repeats
     every week across the span; a dated row lands on its date. */
  function toDays(rows, span) {
    const days = {};
    const today = Metrics.today();
    const n = span || 14;
    for (let i = 0; i < n; i++) {
      const iso = Metrics.addDays(today, i);
      const wd = new Date(iso + "T00:00:00").getDay();
      rows.forEach(function (r) {
        const dated = typeof r.day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.day);
        if (dated ? r.day !== iso : r.day !== wd) return;
        const sub = subjectFor(r.label);
        (days[iso] = days[iso] || []).push({
          id: "i" + Math.random().toString(36).slice(2, 9),
          subjectId: sub ? sub.id : null,
          subjectName: sub ? sub.name : null,
          label: r.label,
          from: clock(r.from), to: clock(r.to),
          colour: sub ? ((Timetable.get().prefs.subjects[sub.id] || {}).colour || "#4fa9f0") : "#64748b",
          kind: sub ? "revision" : "flex",
          /* Yours, so regenerating schedules around it instead of over it.
             Somebody who imported their own timetable did not do it to have
             it overwritten by the next Generate. */
          mine: true
        });
      });
    }
    Object.keys(days).forEach(function (iso) {
      days[iso].sort(function (a, b) { return a.from.localeCompare(b.from); });
    });
    return days;
  }

  /* The whole read, from anything. */
  function read(input, opts) {
    opts = opts || {};
    const notes = [];
    let data = null, text = "";

    if (typeof input === "string") {
      text = input;
      const trimmed = input.trim();
      if (trimmed.charAt(0) === "{" || trimmed.charAt(0) === "[") {
        try { data = JSON.parse(trimmed); }
        catch (e) { notes.push("It looks like JSON but will not parse, so it was read as text instead."); }
      }
    } else if (input && typeof input === "object") {
      data = input;
    }

    /* our own export, which carries everything including the preferences */
    if (data && data.kind === "revision-tracker-timetable") {
      return { kind: "native", data: data, notes: notes };
    }

    let rows = data ? rowsFrom(data) : [];
    if (!rows.length && text) rows = rowsFromText(text);

    if (!rows.length) {
      return { kind: "none", notes: notes.concat([
        "Nothing in there looked like a day, a start time and an end time."
      ]) };
    }

    const days = toDays(rows, opts.span || 14);
    const named = rows.filter(function (r) { return subjectFor(r.label); }).length;
    if (named < rows.length) {
      notes.push((rows.length - named) + " of " + rows.length +
                 " blocks did not name a subject of yours, so they are kept as commitments.");
    }
    return { kind: "grid", rows: rows, days: days, notes: notes };
  }

  /* ------------------------------------------------------------
     reading a description

     A clause at a time, and each clause is offered to every rule
     rather than to the first one that half-matches. One clause
     can legitimately say two things - "no maths on fridays" is
     both a subject and a day - and the rule that fires is the one
     whose evidence is actually present.

     Whatever matched nothing is handed back. That is the part
     that matters: a reader which quietly drops the sentence it
     did not understand is worse than one that cannot read it,
     because you carry on believing it was set up.
     ------------------------------------------------------------ */

  /* Everything that can end a clause. "but" and "however" always start a new
     one; a comma only does when what follows begins a fresh statement, so
     "Monday, Wednesday and Friday" survives intact. */
  const CLAUSE = new RegExp(
    "[.;!?\\n]+" +
    "|\\s+(?:but|however|although|though|whereas)\\s+" +
    /* "and" splits only in front of a number, so "four hours of maths and
       three of economics" becomes two clauses while "an hour and a half"
       stays one - "half" is a number word, "a" is not. */
    "|\\s+and\\s+(?=(?:\\d|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\\b)" +
    "|\\s*,\\s*(?=(?:and\\s+|then\\s+|also\\s+)?(?:" +
      "i\\b|my\\b|no\\b|not\\b|never\\b|nothing\\b|only\\b|just\\b|do\\b|don'?t\\b|dont\\b|" +
      "keep\\b|make\\b|start\\b|finish\\b|end\\b|stop\\b|alternate\\b|swap\\b|switch\\b|leave\\b|" +
      "free\\b|available\\b|more\\b|less\\b|fewer\\b|prefer\\b|want\\b|need\\b|put\\b|give\\b|" +
      "one\\b|two\\b|three\\b|four\\b|five\\b|six\\b|seven\\b|eight\\b|nine\\b|ten\\b|an?\\s|\\d" +
    "))", "g");

  /* Words that make a clause a limit rather than a plan. */
  const CAPPY = /\b(a|per|each|every|max|maximum|cap|capped|limit|limited|only|just|no more than|at most|up to|can|could|able|do|doing|revis|study|studying|work|working)\b/;

  /* A named commitment. Longest first, so "UCAS personal statement" does not
     come back as "UCAS". */
  const OWN = new RegExp("\\b(" + [
    "ucas personal statement", "personal statement", "extended project", "coursework",
    "epq", "ucas", "nea", "essay", "reading", "piano", "guitar", "violin", "drums",
    "gym", "football", "rugby", "netball", "swimming", "athletics", "training",
    "driving lesson", "driving", "tutoring", "tutor", "work", "job", "shift",
    "club", "society", "volunteering", "church", "mosque", "temple"
  ].join("|") + ")\\b");

  /* Things that own a fixed slot rather than a length: "work Saturday 9 to 5". */
  function subjectsNamed(text) {
    const t = String(text || "");
    const out = [];
    (typeof Subjects !== "undefined" ? Subjects.list() : []).forEach(function (s) {
      const names = [s.name, s.short, s.id].filter(Boolean)
        .map(function (x) { return String(x).toLowerCase().replace(/^a-?level\s*/, ""); });
      const hit = names.some(function (n) {
        return n.length >= 3 && new RegExp("\\b" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(t);
      });
      if (hit) out.push(s);
    });
    return out;
  }

  function describe(text) {
    const src = String(text || "").toLowerCase().replace(/[‘’]/g, "'");
    if (!src.trim()) return { rules: {}, windows: {}, flex: [], busy: [], said: [], missed: [] };

    const rules = {};
    const windows = {};
    const flex = [];
    const busy = [];
    const said = [];
    const missed = [];

    const parts = src.split(CLAUSE)
      .map(function (s) { return String(s || "").replace(/^\s*(and|then|also|plus)\s+/, "").trim(); })
      .filter(function (s) { return s.length > 2; });

    parts.forEach(function (p) {
      let hit = false;

      const mins = durationOf(p);
      const days = daysIn(p);
      const subs = subjectsNamed(p);
      const own = OWN.exec(p);
      const negative = /\b(no|not|never|nothing|don'?t|dont|avoid|skip)\b/.test(p);
      const range = /(?:^|\s|from\s)(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)\s*(?:-|–|—|to|until|till)\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)/.exec(p);
      const at = /\bat\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)/.exec(p);

      /* ---- a day off ----

         A clause that OPENS with the refusal is about the day whatever else
         it mentions: "nothing on Saturdays, they are for work" names a
         commitment but is not scheduling one. */
      const opensNegative = /^(no|nothing|never|not)\b/.test(p);
      if (days.length && negative && !subs.length && (opensNegative || !own) &&
          (/\b(revis|study|work|anything|nothing)\b/.test(p) || opensNegative)) {
        days.forEach(function (d) { windows[d] = Object.assign({}, windows[d], { off: true, byName: true }); });
        said.push("Nothing on " + days.map(dayName).join(", ") + ".");
        hit = true;
      }
      if (days.length && /\b(day off|days off|rest day|free day|day free)\b/.test(p)) {
        days.forEach(function (d) { windows[d] = Object.assign({}, windows[d], { off: true, byName: true }); });
        said.push(days.map(dayName).join(", ") + " off.");
        hit = true;
      }

      /* ---- a named commitment with a length, or with a fixed slot ---- */
      if (own && !hit) {
        let label = own[1];
        if (label === "ucas" && /personal statement/.test(p)) label = "ucas personal statement";
        label = title(label);
        if (range && days.length) {
          const f = timeOf(range[1]), t2 = timeOf(range[2]);
          if (f != null && t2 != null && t2 > f) {
            busy.push({ label: label, days: days, from: clock(f), to: clock(t2) });
            said.push(label + " on " + days.map(dayName).join(", ") + ", " + clock(f) + " to " + clock(t2) + ".");
            hit = true;
          }
        } else if (mins && days.length) {
          flex.push({ label: label, mins: mins, days: days,
                      prefer: at ? "at" : "end", at: at ? clock(timeOf(at[1])) : null });
          said.push(fmt(mins) + " of " + label + " on " + days.map(dayName).join(", ") +
                    (at ? " at " + clock(timeOf(at[1])) : "") + ".");
          hit = true;
        }
      }

      /* ---- which days a subject may take ---- */
      if (subs.length && days.length && !mins) {
        rules.subjectDays = rules.subjectDays || {};
        subs.forEach(function (s) {
          if (negative) {
            /* "no maths on fridays" is every day except those */
            const all = [0, 1, 2, 3, 4, 5, 6].filter(function (d) { return days.indexOf(d) < 0; });
            rules.subjectDays[s.id] = all;
            said.push(s.name + ": not on " + days.map(dayName).join(", ") + ".");
          } else {
            rules.subjectDays[s.id] = days.slice();
            said.push(s.name + ": only on " + days.map(dayName).join(", ") + ".");
          }
        });
        hit = true;
      }

      /* ---- how long a subject gets in a week ---- */
      if (subs.length && mins && /\b(a|per|each|every)\s*week\b/.test(p)) {
        rules.subjectMins = rules.subjectMins || {};
        subs.forEach(function (s) {
          rules.subjectMins[s.id] = mins;
          said.push(s.name + ": " + fmt(mins) + " a week.");
        });
        hit = true;
      }

      /* ---- a cap on the day ---- */
      if (mins && !own && !hit && (CAPPY.test(p) || days.length)) {
        if (days.length) {
          rules.dayCaps = rules.dayCaps || {};
          days.forEach(function (d) { rules.dayCaps[d] = mins; });
          said.push("At most " + fmt(mins) + " on " + days.map(dayName).join(", ") + ".");
          hit = true;
        } else if (/\bday\b/.test(p) || CAPPY.test(p)) {
          rules.dailyCapMins = mins;
          said.push("At most " + fmt(mins) + " on any day.");
          hit = true;
        }
      }

      /* ---- how many subjects in a day ---- */
      const per = new RegExp("\\b(one|1|two|2|three|3|four|4)\\s+subjects?\\s+(?:a|per|each)\\s+day\\b").exec(p);
      if (per) {
        const n = { one: 1, "1": 1, two: 2, "2": 2, three: 3, "3": 3, four: 4, "4": 4 }[per[1]];
        rules.subjectsPerDay = n;
        said.push(n === 1 ? "One subject a day." : n + " subjects a day.");
        hit = true;
      } else if (/\b(only|just)\s+(?:do\s+)?one subject\b/.test(p) || /\bone subject (?:a|per|each) day\b/.test(p)) {
        rules.subjectsPerDay = 1;
        said.push("One subject a day.");
        hit = true;
      }

      /* ---- when the day is free ---- */
      if (range && !own && !hit) {
        const f = timeOf(range[1]), t2 = timeOf(range[2]);
        if (f != null && t2 != null && t2 > f) {
          const list = days.length ? days : [0, 1, 2, 3, 4, 5, 6];
          list.forEach(function (d) {
            /* "nothing on Friday" is about Friday; "free 4 to 9 on weekdays"
               is about weekdays and happens to include it, so the one that
               named the day holds */
            const named = windows[d] && windows[d].byName;
            windows[d] = Object.assign({}, windows[d], { from: clock(f), to: clock(t2) });
            if (!named) windows[d].off = false;
          });
          said.push("Free " + clock(f) + " to " + clock(t2) + " on " +
                    (days.length ? days.map(dayName).join(", ") : "every day") + ".");
          hit = true;
        }
      }

      /* ---- one end of the day only ---- */
      const startAt = /\b(?:start|begin|from|after)\b[^\d]{0,12}(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)/.exec(p);
      const endAt = /\b(?:finish|end|stop|until|till|by|before)\b[^\d]{0,12}(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)/.exec(p);
      if (!hit && (startAt || endAt)) {
        const list = days.length ? days : [0, 1, 2, 3, 4, 5, 6];
        const f = startAt ? timeOf(startAt[1]) : null;
        const t2 = endAt ? timeOf(endAt[1]) : null;
        if (f != null || t2 != null) {
          list.forEach(function (d) {
            const cur = windows[d] || {};
            windows[d] = Object.assign({}, cur);
            if (f != null) windows[d].from = clock(f);
            if (t2 != null) windows[d].to = clock(t2);
            if (!cur.byName) windows[d].off = false;
          });
          said.push((f != null ? "Start at " + clock(f) : "") +
                    (f != null && t2 != null ? ", " : "") +
                    (t2 != null ? "finish by " + clock(t2) : "") + " on " +
                    (days.length ? days.map(dayName).join(", ") : "every day") + ".");
          hit = true;
        }
      }

      /* ---- alternating the halves of a subject ---- */
      if (/\balternat|\bswap\b|\bswitch between\b|\bthen the other\b|\bone then the\b/.test(p) ||
          (/\bhuman\b/.test(p) && /\bphysical\b/.test(p))) {
        const alt = {};
        const only = subs.length ? subs : (typeof Subjects !== "undefined" ? Subjects.list() : []);
        only.forEach(function (s) {
          if (Timetable.groupsOf(s.id).length >= 2) alt[s.id] = true;
        });
        if (Object.keys(alt).length) {
          rules.alternate = Object.assign(rules.alternate || {}, alt);
          said.push("Follow one half of a split subject with the other.");
          hit = true;
        }
      }

      /* ---- past papers, exam questions, block length, breaks ---- */
      if (/\bpast papers?\b|\bwhole papers?\b|\bfull papers?\b/.test(p)) {
        rules.paperRamp = !negative;
        said.push(rules.paperRamp ? "More past papers as each exam nears." : "No automatic past papers.");
        hit = true;
      }
      if (/\bexam questions?\b|\bquestion practice\b/.test(p)) {
        rules.examQuestions = !negative;
        said.push(rules.examQuestions ? "Exam-question sittings of their own." : "No separate exam-question sittings.");
        hit = true;
      }
      const blk = new RegExp(NUM + "\\s*(?:min|mins|minute|minutes)?\\s*(?:long\\s*)?(?:blocks?|sessions?|sittings?|chunks?)\\b").exec(p);
      if (blk && !/\bsubjects?\b/.test(p)) {
        const n = Math.round(amount(blk[1]));
        if (n >= 15 && n <= 240) { rules.blockMins = n; said.push(n + "-minute blocks."); hit = true; }
      }
      const brk = new RegExp("(?:break|rest)s?\\s*(?:of\\s*)?" + NUM + "\\s*(?:min|mins|minute|minutes)?" +
                             "|" + NUM + "\\s*(?:min|mins|minute|minutes)\\s*breaks?").exec(p);
      if (brk) {
        const n = Math.round(amount(brk[1] || brk[2]));
        if (n >= 0 && n <= 60) { rules.breakMins = n; said.push(n + "-minute breaks."); hit = true; }
      }

      if (!hit) missed.push(p);
    });

    /* the marker used to decide which statement wins is not a setting */
    Object.keys(windows).forEach(function (d) { delete windows[d].byName; });

    return { rules: rules, windows: windows, flex: flex, busy: busy, said: said, missed: missed };
  }


  function dayName(d) { return Timetable.DAY_NAMES[d]; }
  /* Sentence case, except for the initialisms, which look wrong any other
     way: "Ucas personal statement" is not a thing anybody has written down. */
  const CAPS = { ucas: "UCAS", nea: "NEA" };
  function title(s) {
    const words = String(s).split(" ");
    return words.map(function (w, i) {
      if (CAPS[w]) return CAPS[w];
      return i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w;
    }).join(" ");
  }
  function fmt(mins) {
    return (typeof Metrics !== "undefined") ? Metrics.fmtMins(mins)
      : Math.floor(mins / 60) + "h " + (mins % 60) + "m";
  }

  /* Put a read description into effect. Returns what changed. */
  function apply(parsed) {
    const done = [];
    if (parsed.rules && Object.keys(parsed.rules).length) {
      const r = Object.assign({}, parsed.rules);
      const blockMins = r.blockMins; delete r.blockMins;
      const breakMins = r.breakMins; delete r.breakMins;
      delete r.subjectMins;
      if (r.subjectDays) r.subjectDays = Object.assign({}, Timetable.rules().subjectDays || {}, r.subjectDays);
      if (r.dayCaps) r.dayCaps = Object.assign({}, Timetable.rules().dayCaps || {}, r.dayCaps);
      if (r.alternate) r.alternate = Object.assign({}, Timetable.rules().alternate || {}, r.alternate);
      if (Object.keys(r).length) Timetable.setRules(r);
      if (blockMins) Timetable.setPrefs({ blockMins: blockMins });
      if (breakMins != null) Timetable.setPrefs({ breakMins: breakMins });
      done.push("rules");
    }
    Object.keys(parsed.windows || {}).forEach(function (d) {
      Timetable.setWindow(+d, parsed.windows[d]);
      done.push("window");
    });
    (parsed.flex || []).forEach(function (f) { Timetable.addFlex(f); done.push("commitment"); });
    (parsed.busy || []).forEach(function (b) { Timetable.addBusy(b); done.push("commitment"); });
    /* a subject's own weekly hours are a subject setting, not a rule */
    if (parsed.rules && parsed.rules.subjectMins) {
      Object.keys(parsed.rules.subjectMins).forEach(function (id) {
        Timetable.setSubject(id, { mins: parsed.rules.subjectMins[id] });
        done.push("subject");
      });
    }
    return done;
  }

  return { read: read, describe: describe, apply: apply,
           timeOf: timeOf, durationOf: durationOf, daysIn: daysIn,
           rowsFromText: rowsFromText, rowsFrom: rowsFrom };
})();
