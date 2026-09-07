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

   WHAT THIS IS NOT. It is not a language model. It matches a list
   of phrasings, and it tells you what it did not understand
   instead of guessing. A scanned image of a timetable has no text
   in it at all and there is nothing here that can help with that;
   the honest answer is to say so.
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

  /* "3 hours", "90 minutes", "1h30", "45 min", "three hours" -> minutes. */
  function durationOf(raw) {
    const t = String(raw || "").toLowerCase();
    let total = null;
    const h = new RegExp(NUM + "\\s*(?:h\\b|hr|hrs|hour|hours)").exec(t);
    const m = new RegExp(NUM + "\\s*(?:m\\b|min|mins|minute|minutes)").exec(t);
    if (h) total = Math.round(amount(h[1]) * 60);
    if (m) total = (total || 0) + Math.round(amount(m[1]));
    /* "an hour and a half" */
    if (h && /\band a half\b/.test(t)) total += 30;
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

     Each rule is one phrasing test. A sentence that matches
     nothing is reported back rather than swallowed, because
     "I set it up" when it did not is the failure that matters.
     ------------------------------------------------------------ */

  function describe(text) {
    const src = String(text || "").toLowerCase();
    if (!src.trim()) return { rules: {}, windows: {}, flex: [], said: [], missed: [] };

    const rules = {};
    const windows = {};
    const flex = [];
    const said = [];
    const missed = [];

    /* sentences, so "3 hours a day" and "one subject a day" do not fight */
    /* Sentences, then the joins people use instead of a full stop. "but" is
       always a new clause; "and a half" is not, so "and" only splits when a
       number follows it. */
    const parts = src
      .split(/[.;\n]+|\s+but\s+|,\s*(?=(?:and\s+|then\s+)?(?:i\b|my\b|no\b|nothing\b|only\b|one\b|two\b|three\b|do\b|keep\b|start\b|finish\b|alternate\b|leave\b|free\b|more\b|less\b|\d))/)
                     .map(function (s) { return s.trim(); })
                     .filter(function (s) { return s.length > 2; });

    parts.forEach(function (p) {
      let hit = false;

      /* a cap, either for the whole week or for named days */
      const cap = durationOf(p);
      /* A length attached to a named activity is that activity's length, not
         a limit on the day: "45 minutes of UCAS" is handled further down. */
      const isActivity = /\b(ucas|statement|essay|coursework|nea|reading|piano|guitar|gym|driving|club|training)\b/.test(p);
      const capish = /\b(a|per|each|every|max|maximum|cap|limit|only|no more than|up to|can|could|do|doing|revis|study|work)\b/.test(p);
      const capDays = daysIn(p);
      /* A length with days on it and no activity attached is a limit for
         those days: "five hours at weekends" needs no further keyword. */
      if (cap && !isActivity && (capish || capDays.length)) {
        const on = capDays;
        if (on.length) {
          rules.dayCaps = rules.dayCaps || {};
          on.forEach(function (d) { rules.dayCaps[d] = cap; });
          said.push(fmt(cap) + " on " + on.map(dayName).join(", ") + ".");
          hit = true;
        } else if (/\bday\b/.test(p) || /\b(a|per|each|every|max|maximum|cap|limit|only)\b/.test(p)) {
          rules.dailyCapMins = cap;
          said.push("At most " + fmt(cap) + " on any day.");
          hit = true;
        }
      }

      /* one subject a day */
      const per = /\b(one|1|two|2|three|3)\s+subjects?\s+(?:a|per|each)\s+day\b/.exec(p);
      if (per) {
        const n = { one: 1, "1": 1, two: 2, "2": 2, three: 3, "3": 3 }[per[1]];
        rules.subjectsPerDay = n;
        said.push(n === 1 ? "One subject a day." : n + " subjects a day.");
        hit = true;
      } else if (/\bonly (?:do )?one subject\b/.test(p)) {
        rules.subjectsPerDay = 1;
        said.push("One subject a day.");
        hit = true;
      }

      /* days off. "Nothing on Fridays" says it without ever using the word
         revision, and that is how most people write it. */
      if (/\b(no|nothing|not?|never)\b.*\b(revis|work|study)/.test(p) ||
          /^\s*(no|nothing|never)\b/.test(p) ||
          /\b(day|days)? ?off\b/.test(p) || /\brest\b/.test(p) || /\bfree day\b/.test(p)) {
        const on = daysIn(p);
        if (on.length) {
          on.forEach(function (d) { windows[d] = Object.assign({}, windows[d], { off: true }); });
          said.push("Nothing on " + on.map(dayName).join(", ") + ".");
          hit = true;
        }
      }

      /* the window itself: "free from 4pm to 9pm on weekdays" */
      const win = /(?:from\s*)?(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)\s*(?:-|–|—|to|until|till)\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)/.exec(p);
      if (win && /\b(free|available|can|revise|study|work|from)\b/.test(p) && !cap) {
        const f = timeOf(win[1]), t = timeOf(win[2]);
        if (f != null && t != null && t > f) {
          const on = daysIn(p);
          const list = on.length ? on : [0, 1, 2, 3, 4, 5, 6];
          list.forEach(function (d) {
            /* "nothing on Friday" is a statement about Friday; "free 4 to 9
               on weekdays" is a statement about weekdays that happens to
               include it. The specific one holds. */
            const wasOff = windows[d] && windows[d].off;
            windows[d] = Object.assign({}, windows[d], { from: clock(f), to: clock(t) });
            if (!wasOff) windows[d].off = false;
          });
          said.push("Free " + clock(f) + " to " + clock(t) + " on " +
                    (on.length ? on.map(dayName).join(", ") : "every day") + ".");
          hit = true;
        }
      }

      /* something of your own, every week */
      /* Longest phrasing first, so "UCAS personal statement" does not come
         back as "Ucas". */
      const own = /\b(ucas personal statement|personal statement|coursework|ucas|nea|essay|reading|piano|guitar|gym|driving|work|job|club|training)\b/.exec(p);
      if (own) {
        const mins = durationOf(p);
        const on = daysIn(p);
        if (mins && on.length) {
          const at = /\bat\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)/.exec(p);
          let label = own[1];
          if (label === "ucas" && /personal statement/.test(p)) label = "ucas personal statement";
          label = title(label);
          flex.push({ label: label, mins: mins, days: on,
                      prefer: at ? "at" : "end", at: at ? clock(timeOf(at[1])) : null });
          said.push(fmt(mins) + " of " + label + " on " + on.map(dayName).join(", ") +
                    (at ? " at " + clock(timeOf(at[1])) : "") + ".");
          hit = true;
        }
      }

      /* alternating the halves of a subject */
      if (/\balternat|\bswap\b|\bswitch between\b|\bthen the other\b/.test(p) ||
          (/\bhuman\b/.test(p) && /\bphysical\b/.test(p))) {
        const alt = {};
        (typeof Subjects !== "undefined" ? Subjects.list() : []).forEach(function (s) {
          if (Timetable.groupsOf(s.id).length >= 2) alt[s.id] = true;
        });
        if (Object.keys(alt).length) {
          rules.alternate = Object.assign(rules.alternate || {}, alt);
          said.push("Follow one half of a split subject with the other.");
          hit = true;
        }
      }

      /* past papers and exam questions */
      if (/\bpast papers?\b/.test(p)) {
        rules.paperRamp = !/\b(no|don'?t|dont|never|fewer|less)\b/.test(p);
        said.push(rules.paperRamp ? "More past papers as each exam nears."
                                  : "No automatic past papers.");
        hit = true;
      }
      if (/\bexam questions?\b/.test(p)) {
        rules.examQuestions = !/\b(no|don'?t|dont|never)\b/.test(p);
        said.push(rules.examQuestions ? "Exam-question sittings of their own."
                                      : "No separate exam-question sittings.");
        hit = true;
      }

      /* block length */
      const blk = /\b(\d{2,3})\s*(?:min|mins|minute|minutes)\s*(?:blocks?|sessions?|sittings?)\b/.exec(p);
      if (blk) { rules.blockMins = +blk[1]; said.push(blk[1] + "-minute blocks."); hit = true; }

      if (!hit) missed.push(p);
    });

    return { rules: rules, windows: windows, flex: flex, said: said, missed: missed };
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
      if (r.dayCaps) r.dayCaps = Object.assign({}, Timetable.rules().dayCaps || {}, r.dayCaps);
      if (r.alternate) r.alternate = Object.assign({}, Timetable.rules().alternate || {}, r.alternate);
      if (Object.keys(r).length) Timetable.setRules(r);
      if (blockMins) Timetable.setPrefs({ blockMins: blockMins });
      done.push("rules");
    }
    Object.keys(parsed.windows || {}).forEach(function (d) {
      Timetable.setWindow(+d, parsed.windows[d]);
      done.push("window");
    });
    (parsed.flex || []).forEach(function (f) { Timetable.addFlex(f); done.push("commitment"); });
    return done;
  }

  return { read: read, describe: describe, apply: apply,
           timeOf: timeOf, durationOf: durationOf, daysIn: daysIn,
           rowsFromText: rowsFromText, rowsFrom: rowsFrom };
})();
