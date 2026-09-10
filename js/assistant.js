/* ============================================================
   The assistant

   The rule reader in timetable-adopt.js matches phrasings. It is
   fast, works offline, costs nothing, and cannot understand a
   sentence it was not written for - "cover the important topics
   for my econ test" will never be a regex. This asks a model
   instead, and falls back to the rules when it cannot.

   WHERE THE KEY IS. Not here. A static site ships everything it
   holds, so the key lives in a Supabase Edge Function that checks
   you are signed in before it spends anything. The browser sends
   its session token and the sentence; the function sends back
   settings. See ASSISTANT.md.

   WHAT COMES BACK IS NOT TRUSTED. The reply is data from a
   process that guesses, so every field is checked against the
   same whitelist the rule reader produces, in the same shape, and
   anything unrecognised is dropped rather than applied. A model
   is a good reader and a bad thing to hand write access to. The
   person still reads the summary and presses Apply.

   WHEN IT IS NOT AVAILABLE - not signed in, no function deployed,
   offline, over quota - the rules answer instead and the panel
   says which one replied. Silently degrading to a worse answer
   without saying so is how people stop trusting a tool.
   ============================================================ */

const Assistant = (function () {

  const PATH = "/functions/v1/assistant";
  const TIMEOUT = 25000;

  /* Configured means: there is a project to call. Available means: it will
     actually answer, which additionally needs somebody signed in. */
  function configured() {
    return typeof AUTH_CONFIG !== "undefined" &&
           !!AUTH_CONFIG.SUPABASE_URL &&
           AUTH_CONFIG.ASSISTANT !== false;
  }

  function endpoint() {
    return String(AUTH_CONFIG.SUPABASE_URL).replace(/\/+$/, "") + PATH;
  }

  function token() {
    if (typeof Cloud === "undefined" || !Cloud.session) return Promise.resolve(null);
    return Cloud.session().then(function (s) {
      return s && s.access_token ? s.access_token : null;
    }).catch(function () { return null; });
  }

  function available() {
    if (!configured()) return Promise.resolve(false);
    return token().then(function (t) { return !!t; });
  }

  /* ------------------------------------------------------------
     validation

     Everything below exists because the reply is a guess. A value
     that is not the right shape is dropped, not coerced: a cap of
     "about three hours" silently becoming 0 would empty the week.
     ------------------------------------------------------------ */

  function num(v, lo, hi) {
    const n = typeof v === "number" ? v : parseFloat(v);
    if (!isFinite(n)) return null;
    const r = Math.round(n);
    return r >= lo && r <= hi ? r : null;
  }

  function clockOf(v) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(v || "").trim());
    if (!m || +m[1] > 23 || +m[2] > 59) return null;
    return String(+m[1]).padStart(2, "0") + ":" + m[2];
  }

  function dayList(v) {
    if (!Array.isArray(v)) return [];
    const out = [];
    v.forEach(function (d) {
      const n = num(d, 0, 6);
      if (n !== null && out.indexOf(n) < 0) out.push(n);
    });
    return out.sort();
  }

  function knownSubject(id) {
    if (typeof Subjects === "undefined") return false;
    return Subjects.ids().indexOf(String(id)) >= 0;
  }

  function isoDate(v) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? String(v) : null;
  }

  function strings(v, max) {
    if (!Array.isArray(v)) return [];
    return v.filter(function (s) { return typeof s === "string" && s.trim(); })
      .map(function (s) { return s.trim().slice(0, 240); })
      .slice(0, max || 30);
  }

  /* The reply, reduced to what this app is willing to act on. */
  function clean(raw) {
    const src = (raw && typeof raw === "object") ? raw : {};
    const inRules = (src.rules && typeof src.rules === "object") ? src.rules : {};
    const rules = {};

    const cap = num(inRules.dailyCapMins, 15, 16 * 60);
    if (cap !== null) rules.dailyCapMins = cap;
    if (inRules.dailyCapMins === null) rules.dailyCapMins = null;

    if (inRules.dayCaps && typeof inRules.dayCaps === "object") {
      const caps = {};
      Object.keys(inRules.dayCaps).forEach(function (k) {
        const d = num(k, 0, 6), v = num(inRules.dayCaps[k], 0, 16 * 60);
        if (d !== null && v !== null) caps[d] = v;
      });
      if (Object.keys(caps).length) rules.dayCaps = caps;
    }

    const per = num(inRules.subjectsPerDay, 0, 6);
    if (per !== null) rules.subjectsPerDay = per;

    if (inRules.subjectDays && typeof inRules.subjectDays === "object") {
      const map = {};
      Object.keys(inRules.subjectDays).forEach(function (id) {
        const days = dayList(inRules.subjectDays[id]);
        /* every day is not a restriction, and no days would be a ban */
        if (knownSubject(id) && days.length && days.length < 7) map[id] = days;
      });
      if (Object.keys(map).length) rules.subjectDays = map;
    }

    if (inRules.subjectMins && typeof inRules.subjectMins === "object") {
      const map = {};
      Object.keys(inRules.subjectMins).forEach(function (id) {
        const v = num(inRules.subjectMins[id], 0, 60 * 60);
        if (knownSubject(id) && v !== null) map[id] = v;
      });
      if (Object.keys(map).length) rules.subjectMins = map;
    }

    if (typeof inRules.paperRamp === "boolean") rules.paperRamp = inRules.paperRamp;
    if (typeof inRules.examQuestions === "boolean") rules.examQuestions = inRules.examQuestions;
    const every = num(inRules.examQuestionEvery, 2, 12);
    if (every !== null) rules.examQuestionEvery = every;

    if (inRules.alternate && typeof inRules.alternate === "object") {
      const map = {};
      Object.keys(inRules.alternate).forEach(function (id) {
        if (knownSubject(id) && inRules.alternate[id]) map[id] = true;
      });
      if (Object.keys(map).length) rules.alternate = map;
    }

    const blk = num(inRules.blockMins, 15, 240);
    if (blk !== null) rules.blockMins = blk;
    const brk = num(inRules.breakMins, 0, 60);
    if (brk !== null) rules.breakMins = brk;

    if (Array.isArray(inRules.focus)) {
      const list = [];
      inRules.focus.forEach(function (f) {
        if (!f || !knownSubject(f.id)) return;
        list.push({ id: String(f.id), until: isoDate(f.until), days: dayList(f.days) });
      });
      if (list.length) rules.focus = list.slice(0, 6);
    }

    const windows = {};
    if (src.windows && typeof src.windows === "object") {
      Object.keys(src.windows).forEach(function (k) {
        const d = num(k, 0, 6);
        const w = src.windows[k];
        if (d === null || !w || typeof w !== "object") return;
        const out = {};
        const f = clockOf(w.from), t = clockOf(w.to);
        if (f) out.from = f;
        if (t) out.to = t;
        if (typeof w.off === "boolean") out.off = w.off;
        /* a window that ends before it starts is not a window */
        if (out.from && out.to && out.to <= out.from) return;
        if (Object.keys(out).length) windows[d] = out;
      });
    }

    const flex = [];
    if (Array.isArray(src.flex)) {
      src.flex.slice(0, 12).forEach(function (f) {
        if (!f || typeof f !== "object") return;
        const label = typeof f.label === "string" ? f.label.trim().slice(0, 60) : "";
        const mins = num(f.mins, 5, 12 * 60);
        const days = dayList(f.days);
        if (!label || mins === null || !days.length) return;
        const at = clockOf(f.at);
        flex.push({ label: label, mins: mins, days: days,
                    either: !!f.either && days.length > 1,
                    prefer: at ? "at" : (f.prefer === "start" ? "start" : "end"),
                    at: at });
      });
    }

    const busy = [];
    if (Array.isArray(src.busy)) {
      src.busy.slice(0, 12).forEach(function (b) {
        if (!b || typeof b !== "object") return;
        const label = typeof b.label === "string" ? b.label.trim().slice(0, 60) : "";
        const days = dayList(b.days);
        const f = clockOf(b.from), t = clockOf(b.to);
        if (!label || !days.length || !f || !t || t <= f) return;
        busy.push({ label: label, days: days, from: f, to: t });
      });
    }

    return {
      rules: rules, windows: windows, flex: flex, busy: busy,
      said: strings(src.said, 20),
      missed: strings(src.missed, 12),
      source: "assistant"
    };
  }

  /* ------------------------------------------------------------
     the call
     ------------------------------------------------------------ */

  function describe(text) {
    if (!configured()) return Promise.reject(new Error("not configured"));

    return token().then(function (t) {
      if (!t) throw new Error("not signed in");

      const ctrl = new AbortController();
      const timer = setTimeout(function () { ctrl.abort(); }, TIMEOUT);

      const subjects = (typeof Subjects !== "undefined" ? Subjects.list() : [])
        .map(function (s) { return { id: s.id, name: s.name }; });

      return fetch(endpoint(), {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + t },
        body: JSON.stringify({
          text: String(text || ""),
          subjects: subjects,
          today: (typeof Metrics !== "undefined") ? Metrics.today() : null
        })
      }).then(function (res) {
        clearTimeout(timer);
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || body.error) throw new Error(body.error || ("The assistant returned " + res.status));
          return clean(body.result);
        });
      }, function (err) {
        clearTimeout(timer);
        throw new Error(err && err.name === "AbortError"
          ? "The assistant took too long to answer."
          : "Could not reach the assistant.");
      });
    });
  }

  /* The model where it can, the rules where it cannot, and always a say of
     which one answered. Never silently the worse of the two. */
  function read(text) {
    const fallback = function (why) {
      const r = TimetableAdopt.describe(text);
      r.source = "rules";
      r.why = why || null;
      return r;
    };
    if (!configured()) return Promise.resolve(fallback(null));
    return describe(text).then(function (r) {
      /* an answer that understood nothing is not better than the rules */
      if (!r.said.length) {
        const alt = fallback(null);
        return alt.said.length ? alt : r;
      }
      return r;
    }, function (err) {
      return fallback(err && err.message ? err.message : String(err));
    });
  }

  /* The raw call, for the jobs that are not the timetable.

     `describe` above validates its reply against the timetable whitelist,
     which is the right thing for settings that get applied to your week
     and the wrong thing for a task whose answer is prose. So this returns
     the reply as it came and leaves the checking to the caller, which is
     the only one that knows what the shape should be.

     Writing a model answer is a longer job than reading a sentence, so it
     gets a longer clock. */
  function ask(payload, timeoutMs) {
    if (!configured()) {
      return Promise.reject(new Error("The assistant is not set up on this site."));
    }
    return token().then(function (t) {
      if (!t) throw new Error("Sign in to use the assistant.");

      const ctrl = new AbortController();
      const timer = setTimeout(function () { ctrl.abort(); }, timeoutMs || 90000);

      return fetch(endpoint(), {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + t },
        body: JSON.stringify(payload || {})
      }).then(function (res) {
        clearTimeout(timer);
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || body.error) {
            throw new Error(body.error || ("The assistant returned " + res.status));
          }
          return body.result;
        });
      }, function (err) {
        clearTimeout(timer);
        throw new Error(err && err.name === "AbortError"
          ? "The assistant took too long to answer."
          : "Could not reach the assistant.");
      });
    });
  }

  return { configured: configured, available: available, describe: describe,
           read: read, clean: clean, endpoint: endpoint, ask: ask };
})();
