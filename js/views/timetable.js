/* ============================================================
   Timetable view

   Three screens in one, because they are the same object at
   three zoom levels:

     grid    a fortnight of day cards, each a row of coloured
             nodes — enough to see the shape of your week
     day     one day as a real timeline, hour by hour, where the
             blocks can be dragged
     setup   the questions the recommendation is built from

   The day timeline is the only place with real interaction, so
   it is the only place that needs pointer handling: blocks are
   positioned by minutes-from-midnight and dragged in the same
   unit, snapping to five minutes, and a drop that would land on
   something else is refused rather than allowed to overlap.
   ============================================================ */

const TimetableView = (function () {

  let mode = "grid";          // grid | day | setup
  let openIso = null;
  let span = 14;              // how many days the grid shows
  let drag = null;
  let openBlock = null;       // the block whose detail panel is showing

  const PX_PER_MIN = 1.1;     // the timeline's scale

  function fmt(mins) { return Metrics.fmtMins(mins); }
  function isoToday() { return Metrics.today(); }

  /* ------------------------------------------------------------
     header
     ------------------------------------------------------------ */

  function header() {
    const t = Timetable.get();
    const cap = Timetable.weeklyCapacity();
    return '<div class="card" style="margin-bottom:16px">' +
      '<div class="row wrap" style="gap:12px;align-items:center">' +
        '<div style="flex:1;min-width:200px">' +
          '<b>Your week</b>' +
          '<div class="tiny muted" style="margin-top:3px">' +
            fmt(cap) + ' free across the week' +
            (t.generatedAt ? ' · built ' + new Date(t.generatedAt).toLocaleString("en-GB") : ' · nothing built yet') +
          '</div>' +
        '</div>' +
        '<div class="chips">' +
          '<button class="chip' + (mode === "grid" ? " on" : "") + '" data-action="tt-mode" data-val="grid">Calendar</button>' +
          '<button class="chip' + (mode === "setup" ? " on" : "") + '" data-action="tt-mode" data-val="setup">Set up</button>' +
        '</div>' +
      '</div>' +
      '<div class="row wrap" style="gap:8px;margin-top:12px">' +
        '<button class="btn" data-action="tt-use-rec-all" ' +
          'title="Reset every subject to its recommended hours">Use recommended</button>' +
        '<button class="btn btn-primary" data-action="tt-generate">' +
          (t.generatedAt ? "Rebuild the timetable" : "Build my timetable") + '</button>' +
        '<button class="btn" data-action="tt-undo"' +
          (Timetable.canUndo() ? "" : " disabled") + '>Undo</button>' +
        '<button class="btn" data-action="tt-reset">Reset</button>' +
        '<button class="btn" data-action="tt-export">Export</button>' +
        '<button class="btn" data-action="tt-import">Import</button>' +
        '<div class="spacer"></div>' +
        '<button class="btn btn-sm" data-action="tt-span" data-val="7">1 week</button>' +
        '<button class="btn btn-sm" data-action="tt-span" data-val="14">2 weeks</button>' +
        '<button class="btn btn-sm" data-action="tt-span" data-val="28">4 weeks</button>' +
      '</div>' +
    '</div>';
  }

  /* ------------------------------------------------------------
     the grid of day cards
     ------------------------------------------------------------ */

  function grid() {
    const start = isoToday();
    let out = '<div class="tt-grid">';
    for (let i = 0; i < span; i++) {
      const iso = Metrics.addDays(start, i);
      const d = new Date(iso + "T00:00:00");
      const blocks = Timetable.blocksOn(iso);
      const revision = blocks.filter(function (b) { return b.kind === "revision"; });
      const mins = revision.reduce(function (a, b) {
        return a + (Timetable.toMins(b.to) - Timetable.toMins(b.from)); }, 0);
      const win = Timetable.get().prefs.windows[d.getDay()];
      const off = win && win.off;

      out += '<button class="tt-day' + (i === 0 ? " today" : "") + (off ? " off" : "") + '" ' +
          'data-action="tt-open" data-iso="' + iso + '">' +
        '<span class="tt-day-h">' +
          '<b>' + d.getDate() + '</b>' +
          '<small>' + Timetable.SHORT_DAYS[d.getDay()] + '</small>' +
        '</span>' +
        '<span class="tt-nodes">' + revision.slice(0, 6).map(function (b) {
          return '<i class="tt-node" style="background:' + b.colour + '" title="' +
            UI.esc(b.label + " " + b.from + "–" + b.to) + '"></i>';
        }).join("") + (revision.length > 6 ? '<i class="tt-more">+' + (revision.length - 6) + '</i>' : "") +
        '</span>' +
        '<span class="tt-day-f">' + (off ? "off" : mins ? fmt(mins) : "—") + '</span>' +
      '</button>';
    }
    return out + '</div>' + legend();
  }

  function legend() {
    const subs = Timetable.subjects();
    return '<div class="tt-legend">' + subs.map(function (s) {
      return '<span class="tt-leg' + (s.off ? " off" : "") + '">' +
        '<i style="background:' + s.colour + '"></i>' + UI.esc(s.short) + '</span>';
    }).join("") +
    '<span class="tt-leg"><i style="background:#64748b"></i>Busy</span></div>';
  }

  /* ------------------------------------------------------------
     one day, as a timeline
     ------------------------------------------------------------ */

  function day(iso) {
    const d = new Date(iso + "T00:00:00");
    const blocks = Timetable.blocksOn(iso);
    const runs = Timetable.freeRuns(d.getDay());
    /* show a little either side of what is actually in the day */
    let lo = 8 * 60, hi = 22 * 60;
    blocks.forEach(function (b) {
      lo = Math.min(lo, Timetable.toMins(b.from) - 30);
      hi = Math.max(hi, Timetable.toMins(b.to) + 30);
    });
    runs.forEach(function (r) { lo = Math.min(lo, r[0] - 30); hi = Math.max(hi, r[1] + 30); });
    lo = Math.max(0, Math.floor(lo / 60) * 60);
    hi = Math.min(24 * 60, Math.ceil(hi / 60) * 60);
    const height = (hi - lo) * PX_PER_MIN;

    let hours = "";
    for (let m = lo; m <= hi; m += 60) {
      hours += '<div class="tt-hour" style="top:' + ((m - lo) * PX_PER_MIN) + 'px">' +
        '<span>' + Timetable.toClock(m) + '</span></div>';
    }

    let free = "";
    runs.forEach(function (r) {
      free += '<div class="tt-free" style="top:' + ((r[0] - lo) * PX_PER_MIN) +
        'px;height:' + ((r[1] - r[0]) * PX_PER_MIN) + 'px"></div>';
    });

    const items = blocks.map(function (b) {
      const f = Timetable.toMins(b.from), t = Timetable.toMins(b.to);
      const short = (t - f) < 40;
      return '<div class="tt-block' + (b.kind === "busy" ? " busy" : "") + (short ? " short" : "") +
        (openBlock === b.id ? " open" : "") + '" ' +
        'data-id="' + b.id + '" data-iso="' + iso + '" ' +
        (b.kind === "busy" ? "" : 'data-drag="1" ') +
        'style="top:' + ((f - lo) * PX_PER_MIN) + 'px;height:' + ((t - f) * PX_PER_MIN) +
          'px;--c:' + b.colour + '">' +
        '<span class="tt-block-main"><b>' + UI.esc(b.label) + '</b>' +
          '<small>' + b.from + '–' + b.to +
            (b.subjectName ? ' · ' + UI.esc(b.subjectName) : '') + '</small></span>' +
        (b.kind === "busy"
          ? '<span class="tt-lock" title="A recurring commitment. Edit it in Set up.">▦</span>'
          : '<button class="tt-pen" data-action="tt-edit" data-id="' + b.id + '" data-iso="' + iso +
            '" title="Edit this block">✎</button>') +
      '</div>';
    }).join("");

    const totals = Timetable.dayTotals(iso);
    const subs = Timetable.subjects();

    return '<div class="card" style="margin-bottom:14px">' +
        '<div class="row wrap" style="gap:10px;align-items:center">' +
          '<button class="btn btn-sm" data-action="tt-mode" data-val="grid">‹ Calendar</button>' +
          '<div style="flex:1;min-width:180px">' +
            '<b>' + Metrics.fmtDate(iso, { weekday: "long", day: "numeric", month: "long" }) + '</b>' +
            '<div class="tiny muted">' + Object.keys(totals).map(function (k) {
              const s = subs.filter(function (x) { return x.id === k; })[0];
              return (s ? s.short : k) + " " + fmt(totals[k]);
            }).join(" · ") + (Object.keys(totals).length ? "" : "Nothing scheduled") + '</div>' +
          '</div>' +
          '<button class="btn btn-sm" data-action="tt-prev" data-iso="' + iso + '">‹</button>' +
          '<button class="btn btn-sm" data-action="tt-next" data-iso="' + iso + '">›</button>' +
          '<button class="btn btn-sm btn-primary" data-action="tt-add" data-iso="' + iso + '">+ Block</button>' +
        '</div>' +
      '</div>' +
      '<div class="card tt-timeline-wrap">' +
        '<div class="tt-timeline" style="height:' + height + 'px" data-lo="' + lo + '" data-iso="' + iso + '">' +
          hours + free + items +
        '</div>' +
        '<div class="tiny faint" style="margin-top:10px">Click a block to see what it is for, drag ' +
          'to move it, double-click to edit. The shaded stretches are when you said you are free.</div>' +
      '</div>';
  }

  /* What a block is actually asking you to do.

     A block that says "A-Level Maths" is a budget; one that says "Y1 Ch 12,
     watch the playlist then the topic questions" is an instruction. The
     chapter and the order come from the daily planner, so the timetable and
     the plan cannot disagree about what matters. */
  /* Clicking a block opens it as a modal rather than a panel below the
     timeline, so what you clicked and what you are reading are in the same
     place. Nothing is bound to double click: a double click is two clicks,
     and binding it meant the first one did something you then had to undo. */
  function detailModal(iso, id) {
    const html = detailBody(iso, id);
    if (!html) return;
    const b = Timetable.blocksOn(iso).filter(function (x) { return x.id === id; })[0];
    UI.modal({
      title: b ? b.label : "Block",
      wide: true,
      body: html,
      footer: '<button class="btn" data-modal-close>Close</button>' +
        (b && b.kind !== "busy"
          ? '<button class="btn btn-primary" id="ttEditFromDetail">Edit this block</button>' : ""),
      onMount: function (box) {
        const e = box.querySelector("#ttEditFromDetail");
        if (e) e.onclick = function () { UI.closeModal(); editModal(iso, id); };
        box.querySelectorAll("[data-action=\"tt-open-chapter\"]").forEach(function (btn) {
          btn.addEventListener("click", function () { UI.closeModal(); });
        });
      }
    });
  }

  function detailBody(iso, openId) {
    const b = Timetable.blocksOn(iso).filter(function (x) { return x.id === openId; })[0];
    if (!b) return "";
    if (b.kind !== "revision") {
      return '<div class="tiny muted">' + b.from + '–' + b.to +
        ' · not revision, so nothing is planned for it.</div>';
    }
    const steps = b.steps || [];
    return '<div>' +
        '<div class="row wrap" style="gap:10px;align-items:center">' +
          '<span class="tt-node" style="background:' + b.colour + ';width:14px;height:14px"></span>' +
          '<div style="flex:1;min-width:160px">' +
            '<b>' + UI.esc(b.label) + '</b>' +
            '<div class="tiny muted">' + UI.esc(b.subjectName || "") + ' · ' + b.from + '–' + b.to +
              (b.sitting ? ' · ' + fmt(b.sitting) + ' in this sitting' : '') + '</div>' +
          '</div>' +
          (b.rag ? UI.ragDot(b.rag) : "") +
          (b.chapterId
            ? '<button class="btn btn-sm btn-primary" data-action="tt-open-chapter" data-id="' +
              b.chapterId + '" data-sub="' + UI.esc(b.subjectId || "") + '">Open the chapter</button>'
            : "") +
        '</div>' +
        (b.work && b.work !== "chapter"
          ? '<div class="tt-kind ' + b.work + '">' +
            (b.work === "paper" ? "A whole past paper, timed and marked"
             : b.work === "practice" ? "A practice test built from your weakest chapters"
             : "A drill on one mark tariff") + '</div>'
          : "") +
        /* The chapter's total belongs next to the sitting, not instead of
           it: a 70 minute block labelled "2h 20m" reads as a 70 minute block
           that is somehow worth two hours twenty. */
        (b.eta && b.partCount > 1
          ? '<div class="tiny faint" style="margin-top:6px">Part ' + b.partNo + ' of ' + b.partCount +
            '. The chapter needs about ' + fmt(b.eta) + ' altogether, which is why it is split.</div>'
          : b.eta && b.sitting && b.eta > b.sitting
          ? '<div class="tiny faint" style="margin-top:6px">The chapter needs about ' + fmt(b.eta) +
            ' altogether.</div>'
          : "") +
        (b.why ? '<div class="tiny muted" style="margin-top:8px">Scheduled because ' + UI.esc(b.why) + '.</div>' : "") +
        (steps.length
          ? '<div class="section-label" style="margin:16px 0 0">In this sitting</div>' +
            '<div class="tt-steps">' + steps.map(function (x, i) {
              return '<div class="tt-step"><span class="tt-step-n">' + (i + 1) + '</span>' +
                '<span class="tt-step-main"><b>' + UI.esc(x.label) +
                  (x.carried ? ' <span class="tiny faint">(carry on)</span>'
                             : x.part ? ' <span class="tiny faint">(start it)</span>' : '') + '</b>' +
                  '<small>' + UI.esc(x.detail) + '</small></span>' +
                '<span class="pill">' + fmt(x.mins) + '</span></div>';
            }).join("") + '</div>'
          : '<div class="tiny faint" style="margin-top:10px">Nothing outstanding on this chapter — ' +
            'it is here to keep it fresh.</div>') +
      '</div>';
  }

  /* ------------------------------------------------------------
     setup
     ------------------------------------------------------------ */

  function setup() {
    const t = Timetable.get();
    const subs = Timetable.subjects();
    const rec = Timetable.recommend();

    const subjectRows = subs.map(function (s, i) {
      const suggested = rec.perSubject[s.id] || 0;
      const using = s.mins != null ? s.mins : suggested;
      return '<div class="tt-sub' + (s.off ? " off" : "") + '">' +
        '<input type="color" class="tt-colour" value="' + s.colour + '" ' +
          'data-tt-colour="' + s.id + '" title="Node colour">' +
        '<div class="tt-sub-main">' +
          '<b>' + UI.esc(s.name) + '</b>' +
          '<small>' + (s.stats.rated
              ? s.stats.rated + ' rated · ' + s.stats.red + ' red'
              : 'nothing rated yet') +
            (s.stats.daysToExam != null ? ' · exam in ' + s.stats.daysToExam + 'd' : '') + '</small>' +
        '</div>' +
        '<label class="tt-f"><span>Rank</span>' +
          '<input class="input" type="number" min="1" max="' + subs.length + '" value="' + s.rank +
            '" data-tt-rank="' + s.id + '"></label>' +
        '<label class="tt-f"><span>Now</span>' + gradeSelect(s.id, "predicted", s.predicted) + '</label>' +
        '<label class="tt-f"><span>Target</span>' + gradeSelect(s.id, "target", s.target) + '</label>' +
        /* Hours and minutes as two boxes. One box holding minutes read as
           hours: "18" meant eighteen minutes a week while the line under it
           suggested eighteen hours, and nothing on screen said which. */
        '<label class="tt-f wide"><span>Per week</span>' +
          '<span class="tt-hm">' +
            '<input class="input" type="number" min="0" max="99" value="' + Math.floor(using / 60) +
              '" data-tt-h="' + s.id + '"><em>h</em>' +
            '<input class="input" type="number" min="0" max="59" step="5" value="' + (using % 60) +
              '" data-tt-m="' + s.id + '"><em>m</em>' +
          '</span>' +
          '<small class="tt-rec">suggests ' + fmt(suggested) + '</small></label>' +
        '<button class="btn btn-sm" data-action="tt-use-rec" data-id="' + s.id + '" ' +
          'title="Put the recommendation back">Recommended</button>' +
        '<button class="btn btn-sm' + (s.off ? " btn-primary" : "") + '" data-action="tt-sub-off" data-id="' + s.id + '">' +
          (s.off ? "Off" : "On") + '</button>' +
      '</div>';
    }).join("");

    const windowRows = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      const w = t.prefs.windows[d];
      return '<div class="tt-win' + (w.off ? " off" : "") + '">' +
        '<b>' + Timetable.DAY_NAMES[d] + '</b>' +
        '<input class="input" type="time" value="' + w.from + '" data-tt-win-from="' + d + '"' + (w.off ? " disabled" : "") + '>' +
        '<span class="tiny faint">to</span>' +
        '<input class="input" type="time" value="' + w.to + '" data-tt-win-to="' + d + '"' + (w.off ? " disabled" : "") + '>' +
        '<span class="tiny faint">' + fmt(Timetable.freeMinutesOn(d)) + ' free</span>' +
        '<button class="btn btn-sm' + (w.off ? " btn-primary" : "") + '" data-action="tt-win-off" data-d="' + d + '">' +
          (w.off ? "Day off" : "Free") + '</button>' +
      '</div>';
    }).join("");

    const busyRows = (t.prefs.busy || []).map(function (b) {
      return '<div class="tt-busy">' +
        '<i class="tt-node" style="background:' + (b.colour || "#64748b") + '"></i>' +
        '<div class="tt-sub-main"><b>' + UI.esc(b.label) + '</b>' +
          '<small>' + b.from + '–' + b.to + ' · ' +
            (b.days || []).map(function (d) { return Timetable.SHORT_DAYS[d]; }).join(", ") + '</small></div>' +
        '<button class="btn btn-sm btn-ghost" data-action="tt-busy-del" data-id="' + b.id + '">✕</button>' +
      '</div>';
    }).join("") || '<div class="tiny faint">Nothing yet. Add school, work, a lesson — anything that owns part of your day.</div>';

    const flexRows = (t.prefs.flex || []).map(function (f) {
      return '<div class="tt-busy">' +
        '<i class="tt-node" style="background:' + (f.colour || "#64748b") + '"></i>' +
        '<div class="tt-sub-main"><b>' + UI.esc(f.label) + '</b>' +
          '<small>' + fmt(f.mins) + ' · ' +
            (f.days || []).map(function (d) { return Timetable.SHORT_DAYS[d]; }).join(", ") +
            ' · ' + (f.at ? "at " + f.at : f.prefer === "start" ? "first thing" : "last thing") +
            '</small></div>' +
        '<button class="btn btn-sm btn-ghost" data-action="tt-flex-del" data-id="' + f.id + '">✕</button>' +
      '</div>';
    }).join("");

    return '<div class="card" style="margin-bottom:14px">' +
        '<div class="card-title" style="margin-bottom:4px">Your subjects</div>' +
        '<div class="tiny muted">Rank them, say where you are and where you want to be, and the ' +
          'suggestion follows: a subject you ranked first, two grades short, with an exam close and ' +
          'plenty of red gets the most. Overrule any of it by typing a number.</div>' +
        '<div class="tt-subs">' + subjectRows + '</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:12px;align-items:flex-end">' +
          '<label class="tt-f"><span>Block length</span>' +
            '<input class="input" type="number" min="15" step="5" value="' + t.prefs.blockMins + '" data-tt-blk></label>' +
          '<label class="tt-f"><span>Break</span>' +
            '<input class="input" type="number" min="0" step="5" value="' + t.prefs.breakMins + '" data-tt-brk></label>' +
          '<span class="tiny faint">' + fmt(Timetable.weeklyCapacity()) + ' free a week in total</span>' +
        '</div>' +
      '</div>' +

      rulesPanel() +

      '<div class="card" style="margin-bottom:14px">' +
        '<div class="card-title" style="margin-bottom:4px">When you are free</div>' +
        '<div class="tiny muted">The window each day sits in. Anything outside it is never scheduled.</div>' +
        '<div class="tt-wins">' + windowRows + '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><div class="card-title">What already owns your time</div>' +
          '<div class="right"><button class="btn btn-sm btn-primary" data-action="tt-busy-add">+ Add</button></div></div>' +
        '<div class="tiny muted" style="margin-bottom:10px">Recurring commitments. These are scheduled ' +
          'around, never over, and editing one changes every week.</div>' +
        '<div class="tt-busies">' + busyRows + '</div>' +
      '</div>' +

      '<div class="card" style="margin-top:14px">' +
        '<div class="card-head"><div class="card-title">Things you know the length of, but not the time</div>' +
          '<div class="right"><button class="btn btn-sm btn-primary" data-action="tt-flex-add">+ Add</button></div></div>' +
        '<div class="tiny muted" style="margin-bottom:10px">Two hours at the gym on Monday, some time. ' +
          'Say how long and which days and it is placed for you — at the end of a free stretch, so it ' +
          'does not cut an evening in half — and revision is built around it.</div>' +
        '<div class="tt-busies">' + (flexRows ||
          '<div class="tiny faint">Nothing yet.</div>') + '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------
     How you want to work, as opposed to when you are free.

     Everything here is off by default and everything can be set
     in one click from Recommended, because the people most likely
     to need a timetable are the least likely to want to configure
     one.
     ------------------------------------------------------------ */
  function rulesPanel() {
    const r = Timetable.rules();
    const subs = Timetable.subjects();

    const hm = function (id, mins, placeholder) {
      const v = mins == null ? "" : mins;
      return '<span class="tt-hm">' +
        '<input class="input" type="number" min="0" max="16" ' + (v === "" ? '' : 'value="' + Math.floor(v / 60) + '"') +
          ' placeholder="' + (placeholder || "") + '" data-tt-cap-h="' + id + '"><em>h</em>' +
        '<input class="input" type="number" min="0" max="59" step="15" ' + (v === "" ? '' : 'value="' + (v % 60) + '"') +
          ' placeholder="00" data-tt-cap-m="' + id + '"><em>m</em></span>';
    };

    const dayCapRows = [1, 2, 3, 4, 5, 6, 0].map(function (d) {
      const set = r.dayCaps && r.dayCaps[d] != null;
      return '<div class="tt-cap">' +
        '<b>' + Timetable.SHORT_DAYS[d] + '</b>' +
        hm("d" + d, set ? r.dayCaps[d] : null, "—") +
        '<span class="tiny faint">' + (set ? "set" : "default") + '</span>' +
      '</div>';
    }).join("");

    const subjectRows = subs.map(function (s) {
      const days = (r.subjectDays || {})[s.id] || [];
      const groups = Timetable.groupsOf(s.id);
      return '<div class="tt-rule-sub">' +
        '<i class="tt-node" style="background:' + s.colour + '"></i>' +
        '<div class="tt-sub-main"><b>' + UI.esc(s.name) + '</b>' +
          '<small>' + (days.length
            ? "only on " + days.map(function (d) { return Timetable.SHORT_DAYS[d]; }).join(", ")
            : "any day it is owed time") + '</small></div>' +
        '<div class="chips tt-daypick">' + [1, 2, 3, 4, 5, 6, 0].map(function (d) {
          return '<button type="button" class="chip' + (days.indexOf(d) >= 0 ? " on" : "") + '" ' +
            'data-action="tt-subday" data-id="' + s.id + '" data-d="' + d + '">' +
            Timetable.SHORT_DAYS[d] + '</button>';
        }).join("") + '</div>' +
        (groups.length >= 2
          ? '<button class="btn btn-sm' + ((r.alternate || {})[s.id] ? " btn-primary" : "") + '" ' +
            'data-action="tt-alt" data-id="' + s.id + '" title="' +
            UI.esc("Follow " + groups[0] + " with " + groups[1]) + '">Alternate ' +
            UI.esc(groups.join(" / ")) + '</button>'
          : '') +
      '</div>';
    }).join("");

    return '<div class="card" style="margin-bottom:14px">' +
      '<div class="card-head"><div class="card-title">How you want to work</div>' +
        '<div class="right"><button class="btn btn-sm btn-primary" data-action="tt-rec-rules">' +
          'Recommended</button></div></div>' +
      '<div class="tiny muted" style="margin-bottom:12px">None of this is on unless you turn it on. ' +
        'Recommended fills the lot in from your week and your exam dates.</div>' +

      '<div class="tt-rule">' +
        '<div class="tt-rule-main"><b>Most in one day</b>' +
          '<small>Leave it blank and the evening is the only limit.</small></div>' +
        hm("all", r.dailyCapMins, "—") +
      '</div>' +

      '<div class="tt-rule">' +
        '<div class="tt-rule-main"><b>Subjects in one day</b>' +
          '<small>One a day means three hours of Maths, then a day of Geography. ' +
            'A subject with an exam inside ' + r.urgentDays + ' days ignores this.</small></div>' +
        '<select class="input" data-tt-perday>' +
          [0, 1, 2, 3, 4].map(function (n) {
            return '<option value="' + n + '"' + (r.subjectsPerDay === n ? " selected" : "") + '>' +
              (n === 0 ? "As many as fit" : n === 1 ? "One a day" : n + " a day") + '</option>';
          }).join("") + '</select>' +
      '</div>' +

      '<div class="tt-rule">' +
        '<div class="tt-rule-main"><b>Past papers as the exam nears</b>' +
          '<small>A whole paper a week from two months out, rising to four in the last week. ' +
            'Your own weekly target still applies if it is higher.</small></div>' +
        '<button class="btn btn-sm' + (r.paperRamp ? " btn-primary" : "") + '" data-action="tt-rule-toggle" ' +
          'data-k="paperRamp">' + (r.paperRamp ? "On" : "Off") + '</button>' +
      '</div>' +

      '<div class="tt-rule">' +
        '<div class="tt-rule-main"><b>Exam-question sittings</b>' +
          '<small>Questions on their own, not as the third step of a chapter. ' +
            'One every ' + (r.examQuestionEvery || 4) + ' blocks of that subject.</small></div>' +
        '<input class="input tt-num" type="number" min="2" max="12" value="' + (r.examQuestionEvery || 4) +
          '" data-tt-eqevery' + (r.examQuestions ? "" : " disabled") + '>' +
        '<button class="btn btn-sm' + (r.examQuestions ? " btn-primary" : "") + '" data-action="tt-rule-toggle" ' +
          'data-k="examQuestions">' + (r.examQuestions ? "On" : "Off") + '</button>' +
      '</div>' +

      '<div class="tt-rule-head">A cap for particular days</div>' +
      '<div class="tt-caps">' + dayCapRows + '</div>' +

      '<div class="tt-rule-head">Which days each subject may take</div>' +
      '<div class="tt-rule-subs">' + subjectRows + '</div>' +
    '</div>';
  }

  function gradeSelect(id, field, value) {
    return '<select class="input" data-tt-grade="' + id + '" data-field="' + field + '">' +
      '<option value="">—</option>' +
      Timetable.GRADES.slice().reverse().map(function (g) {
        return '<option' + (g === value ? " selected" : "") + '>' + g + '</option>';
      }).join("") + '</select>';
  }

  /* ------------------------------------------------------------
     render
     ------------------------------------------------------------ */

  function render(root) {
    Timetable.load();
    root.innerHTML = header() +
      (mode === "setup" ? setup() : mode === "day" && openIso ? day(openIso) : grid());
    setTimeout(wire, 0);
  }

  /* Inputs are wired rather than re-rendered on every keystroke, so typing a
     number does not rebuild the page underneath the caret. */
  function wire() {
    /* Either box writes the whole figure, so they cannot disagree. */
    const setHM = function (id) {
      const h = document.querySelector('[data-tt-h="' + id + '"]');
      const m = document.querySelector('[data-tt-m="' + id + '"]');
      const mins = (+(h && h.value) || 0) * 60 + (+(m && m.value) || 0);
      Timetable.setSubject(id, { mins: mins });
      App.render();
    };
    document.querySelectorAll("[data-tt-h]").forEach(function (el) {
      el.onchange = function () { setHM(el.dataset.ttH); };
    });
    document.querySelectorAll("[data-tt-m]").forEach(function (el) {
      el.onchange = function () { setHM(el.dataset.ttM); };
    });
    document.querySelectorAll("[data-tt-rank]").forEach(function (el) {
      el.onchange = function () { Timetable.setSubject(el.dataset.ttRank, { rank: +el.value }); App.render(); };
    });
    document.querySelectorAll("[data-tt-grade]").forEach(function (el) {
      el.onchange = function () {
        const p = {}; p[el.dataset.field] = el.value || null;
        Timetable.setSubject(el.dataset.ttGrade, p); App.render();
      };
    });
    document.querySelectorAll("[data-tt-colour]").forEach(function (el) {
      el.onchange = function () { Timetable.setSubject(el.dataset.ttColour, { colour: el.value }); App.render(); };
    });
    document.querySelectorAll("[data-tt-win-from]").forEach(function (el) {
      el.onchange = function () { Timetable.setWindow(+el.dataset.ttWinFrom, { from: el.value }); App.render(); };
    });
    document.querySelectorAll("[data-tt-win-to]").forEach(function (el) {
      el.onchange = function () { Timetable.setWindow(+el.dataset.ttWinTo, { to: el.value }); App.render(); };
    });
    const blk = document.querySelector("[data-tt-blk]");
    if (blk) blk.onchange = function () { Timetable.setPrefs({ blockMins: +blk.value }); App.render(); };
    const brk = document.querySelector("[data-tt-brk]");
    if (brk) brk.onchange = function () { Timetable.setPrefs({ breakMins: +brk.value }); App.render(); };

    /* A cap is two boxes and can be cleared. Both boxes empty means no cap
       at all, which is not the same as a cap of zero minutes: a cap of zero
       would silently empty the day. */
    const setCap = function (which) {
      const h = document.querySelector('[data-tt-cap-h="' + which + '"]');
      const m = document.querySelector('[data-tt-cap-m="' + which + '"]');
      const blankBoth = (!h || h.value === "") && (!m || m.value === "");
      const mins = blankBoth ? null : (+(h && h.value) || 0) * 60 + (+(m && m.value) || 0);
      if (which === "all") {
        Timetable.setRules({ dailyCapMins: mins });
      } else {
        const d = +which.slice(1);
        const caps = Object.assign({}, Timetable.rules().dayCaps || {});
        if (mins == null) delete caps[d]; else caps[d] = mins;
        Timetable.setRules({ dayCaps: caps });
      }
      App.render();
    };
    document.querySelectorAll("[data-tt-cap-h]").forEach(function (el) {
      el.onchange = function () { setCap(el.dataset.ttCapH); };
    });
    document.querySelectorAll("[data-tt-cap-m]").forEach(function (el) {
      el.onchange = function () { setCap(el.dataset.ttCapM); };
    });
    const perDay = document.querySelector("[data-tt-perday]");
    if (perDay) perDay.onchange = function () {
      Timetable.setRules({ subjectsPerDay: +perDay.value }); App.render();
    };
    const eqEvery = document.querySelector("[data-tt-eqevery]");
    if (eqEvery) eqEvery.onchange = function () {
      Timetable.setRules({ examQuestionEvery: Math.max(2, +eqEvery.value || 4) }); App.render();
    };
    wireDrag();
  }

  /* Dragging a block. Pointer events rather than HTML5 drag-and-drop: this
     has to work with a finger, and it has to snap to the timeline's own
     scale, which native dragging knows nothing about. */
  function wireDrag() {
    const line = document.querySelector(".tt-timeline");
    if (!line) return;
    line.querySelectorAll('[data-drag="1"]').forEach(function (el) {
      el.onpointerdown = function (e) {
        if (e.target.closest("[data-action]")) return;   // the ✕ is not a handle
        e.preventDefault();
        const lo = +line.dataset.lo;
        drag = { el: el, id: el.dataset.id, iso: el.dataset.iso, lo: lo,
                 startY: e.clientY, top: parseFloat(el.style.top), moved: false };
        el.setPointerCapture(e.pointerId);
        el.classList.add("dragging");
      };
      el.onpointermove = function (e) {
        if (!drag || drag.el !== el) return;
        const dy = e.clientY - drag.startY;
        if (Math.abs(dy) > 3) drag.moved = true;
        el.style.top = Math.max(0, drag.top + dy) + "px";
      };
      el.onpointerup = function (e) {
        if (!drag || drag.el !== el) return;
        el.classList.remove("dragging");
        /* A press that did not travel is a click, and a click opens the block
           rather than dropping it back where it already was. */
        if (!drag.moved) {
          const iso = drag.iso, id = drag.id;
          drag = null;
          detailModal(iso, id);
          return;
        }
        const mins = drag.lo + parseFloat(el.style.top) / PX_PER_MIN;
        const ok = Timetable.moveBlock(drag.iso, drag.id, mins);
        drag = null;
        if (!ok) UI.toast("That would land on top of something else", "warn", 2200);
        App.render();
      };
    });
  }

  /* ------------------------------------------------------------
     actions
     ------------------------------------------------------------ */

  /* Editing a block asks exactly what adding one asks, so it is the same
     modal with the fields filled in and a delete on the end. */
  function editModal(iso, id) {
    const b = Timetable.blocksOn(iso).filter(function (x) { return x.id === id; })[0];
    if (!b || b.kind === "busy") return;
    blockModal(iso, b);
  }

  function blockModal(iso, existing) {
    const subs = Timetable.subjects();
    UI.modal({
      title: existing ? "Edit this block" : "Add a block",
      body: '<div class="form-grid">' +
          '<div class="field"><label class="label">What</label>' +
            '<select class="input" id="ttWhat">' +
              subs.map(function (s) {
                return '<option value="' + s.id + '"' +
                  (existing && existing.subjectId === s.id ? " selected" : "") + '>' +
                  UI.esc(s.name) + '</option>'; }).join("") +
              '<option value="__other"' + (existing && !existing.subjectId ? " selected" : "") +
                '>Something else</option>' +
            '</select></div>' +
          '<div class="field"><label class="label">Label (if something else)</label>' +
            '<input class="input" id="ttLabel" placeholder="e.g. Piano practice" value="' +
              (existing && !existing.subjectId ? UI.esc(existing.label) : "") + '"></div>' +
          '<div class="field"><label class="label">From</label><input class="input" type="time" id="ttFrom" value="' +
            (existing ? existing.from : "17:00") + '"></div>' +
          '<div class="field"><label class="label">To</label><input class="input" type="time" id="ttTo" value="' +
            (existing ? existing.to : "18:00") + '"></div>' +
        '</div>',
      footer: (existing ? '<button class="btn btn-danger" id="ttDel">Delete</button>' : "") +
              '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="ttSave">' +
                (existing ? "Save" : "Add it") + '</button>',
      onMount: function (box) {
        const del = box.querySelector("#ttDel");
        if (del) del.onclick = function () {
          Timetable.removeBlock(iso, existing.id);
          UI.closeModal(); App.render();
        };
        box.querySelector("#ttSave").onclick = function () {
          const what = box.querySelector("#ttWhat").value;
          const from = box.querySelector("#ttFrom").value;
          const to = box.querySelector("#ttTo").value;
          if (Timetable.toMins(to) <= Timetable.toMins(from)) {
            UI.toast("The end has to be after the start", "bad"); return;
          }
          const s = subs.filter(function (x) { return x.id === what; })[0];
          const patch = {
            subjectId: s ? s.id : null,
            label: s ? s.name : (box.querySelector("#ttLabel").value || "Other"),
            from: from, to: to,
            colour: s ? s.colour : "#64748b",
            kind: s ? "revision" : "custom"
          };
          if (existing) Timetable.updateBlock(iso, existing.id, patch);
          else Timetable.addBlock(iso, patch);
          UI.closeModal(); App.render();
        };
      }
    });
  }

  /* Length known, time not. */
  /* A recurring thing of your own: forty-five minutes on the personal
     statement every Sunday. The time is optional, because most of these are
     "some time that day" and forcing a clock on them is how a timetable
     starts being wrong. */
  function flexModal() {
    UI.modal({
      title: "Something of your own, every week",
      body: '<div class="field"><label class="label">What is it</label>' +
          '<input class="input" id="tfLabel" placeholder="e.g. UCAS personal statement"></div>' +
        '<div class="field"><label class="label">How long</label>' +
          '<span class="tt-hm"><input class="input" type="number" min="0" max="12" value="0" id="tfH"><em>h</em>' +
          '<input class="input" type="number" min="0" max="59" step="5" value="45" id="tfM"><em>m</em></span></div>' +
        '<div class="field"><label class="label">Which days</label>' +
          '<div class="chips" id="tfDays">' + [1,2,3,4,5,6,0].map(function (d) {
            return '<button type="button" class="chip" data-d="' + d + '">' + Timetable.SHORT_DAYS[d] + '</button>';
          }).join("") + '</div></div>' +
        '<div class="field"><label class="label">When on those days</label>' +
          '<div class="chips" id="tfWhen">' +
            '<button type="button" class="chip on" data-w="end">Last thing</button>' +
            '<button type="button" class="chip" data-w="start">First thing</button>' +
            '<button type="button" class="chip" data-w="at">At a set time</button>' +
          '</div>' +
          '<input class="input" type="time" id="tfAt" value="10:00" style="margin-top:8px;display:none">' +
        '</div>' +
        '<div class="field"><label class="label">Colour</label>' +
          '<input type="color" class="tt-colour" id="tfColour" value="#64748b"></div>' +
        '<div class="tiny faint">Revision is built around it, and it repeats every week until you ' +
          'remove it.</div>',
      footer: '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="tfSave">Add it</button>',
      onMount: function (box) {
        const days = {};
        let when = "end";
        box.querySelectorAll("#tfDays [data-d]").forEach(function (b) {
          b.onclick = function () { const d = +b.dataset.d; days[d] = !days[d]; b.classList.toggle("on", !!days[d]); };
        });
        const at = box.querySelector("#tfAt");
        box.querySelectorAll("#tfWhen [data-w]").forEach(function (b) {
          b.onclick = function () {
            when = b.dataset.w;
            box.querySelectorAll("#tfWhen [data-w]").forEach(function (o) { o.classList.toggle("on", o === b); });
            at.style.display = when === "at" ? "" : "none";
          };
        });
        box.querySelector("#tfSave").onclick = function () {
          const picked = Object.keys(days).filter(function (k) { return days[k]; }).map(Number);
          const label = box.querySelector("#tfLabel").value.trim();
          const mins = (+box.querySelector("#tfH").value || 0) * 60 + (+box.querySelector("#tfM").value || 0);
          if (!label) { UI.toast("Give it a name", "bad"); return; }
          if (!picked.length) { UI.toast("Pick at least one day", "bad"); return; }
          if (mins < 15) { UI.toast("Give it at least 15 minutes", "bad"); return; }
          Timetable.addFlex({ label: label, days: picked, mins: mins,
                              prefer: when, at: when === "at" ? at.value : null,
                              colour: box.querySelector("#tfColour").value });
          UI.closeModal(); App.render();
        };
      }
    });
  }

  function busyModal() {
    UI.modal({
      title: "Something that owns your time",
      body: '<div class="field"><label class="label">What is it</label>' +
          '<input class="input" id="tbLabel" placeholder="e.g. Work"></div>' +
        '<div class="form-grid">' +
          '<div class="field"><label class="label">From</label><input class="input" type="time" id="tbFrom" value="15:00"></div>' +
          '<div class="field"><label class="label">To</label><input class="input" type="time" id="tbTo" value="18:00"></div>' +
        '</div>' +
        '<div class="field"><label class="label">Which days</label>' +
          '<div class="chips" id="tbDays">' + [1,2,3,4,5,6,0].map(function (d) {
            return '<button type="button" class="chip" data-d="' + d + '">' + Timetable.SHORT_DAYS[d] + '</button>';
          }).join("") + '</div></div>',
      footer: '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="tbSave">Add it</button>',
      onMount: function (box) {
        const days = {};
        box.querySelectorAll("[data-d]").forEach(function (b) {
          b.onclick = function () {
            const d = +b.dataset.d; days[d] = !days[d]; b.classList.toggle("on", !!days[d]);
          };
        });
        box.querySelector("#tbSave").onclick = function () {
          const picked = Object.keys(days).filter(function (k) { return days[k]; }).map(Number);
          const label = box.querySelector("#tbLabel").value.trim();
          if (!label) { UI.toast("Give it a name", "bad"); return; }
          if (!picked.length) { UI.toast("Pick at least one day", "bad"); return; }
          Timetable.addBusy({ label: label, days: picked,
            from: box.querySelector("#tbFrom").value, to: box.querySelector("#tbTo").value });
          UI.closeModal(); App.render();
        };
      }
    });
  }

  function doExport() {
    const data = Timetable.exportData();
    const d = Timetable.describe(data);
    const text = JSON.stringify(data, null, 1);
    UI.modal({
      title: "Export your timetable",
      wide: true,
      body: '<div class="tiny muted">' + d.blocks + ' blocks across ' + d.days + ' days, ' +
          d.busy + ' recurring commitments. Copy this, or save it as a file.</div>' +
        '<textarea class="input" id="ttOut" style="height:240px;font-family:var(--font-mono,monospace);font-size:11px">' +
          UI.esc(text) + '</textarea>',
      footer: '<button class="btn" data-modal-close>Close</button>' +
              '<button class="btn" id="ttCopy">Copy</button>' +
              '<button class="btn btn-primary" id="ttFile">Save as a file</button>',
      onMount: function (box) {
        box.querySelector("#ttCopy").onclick = function () {
          const ta = box.querySelector("#ttOut"); ta.select();
          navigator.clipboard.writeText(text).then(function () { UI.toast("Copied", "ok"); },
            function () { UI.toast("Copy it by hand", "warn"); });
        };
        box.querySelector("#ttFile").onclick = function () {
          const blob = new Blob([text], { type: "application/json" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "timetable-" + Metrics.today() + ".json";
          a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
        };
      }
    });
  }

  /* Reading a PDF's text with the viewer's own pdf.js, so a timetable that
     arrives as a document can be read like a pasted one. A scan has no text
     layer at all and there is nothing to be done about that here; the dialog
     says so rather than failing silently. */
  /* The text of a dropped file, whatever kind it is.

     A PDF is tried as a document first and only read by eye if it has no text
     layer, because reading the text layer is exact and recognition is not. A
     picture has no other option. `onStage` reports which of those is
     happening, since fetching the recogniser the first time takes long enough
     that silence looks like a hang. */
  function fileText(file, onStage) {
    const url = URL.createObjectURL(file);
    const done = function (t) { URL.revokeObjectURL(url); return t; };
    const failed = function (e) { URL.revokeObjectURL(url); throw e; };

    if (typeof Ocr !== "undefined" && Ocr.isImage(file)) {
      URL.revokeObjectURL(url);
      onStage({ kind: "ocr" });
      return Ocr.readImage(file, onStage);
    }

    if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
      if (typeof PdfViewer === "undefined" || !PdfViewer.textOf) {
        return Promise.reject(new Error("PDF reading is not available"));
      }
      onStage({ kind: "pdf" });
      return PdfViewer.textOf(url).then(function (t) {
        if (t && t.trim().length > 20) return done(t);
        if (typeof Ocr === "undefined") return done(t || "");
        /* a scan: nothing to read off the page, so read the page itself */
        onStage({ kind: "ocr", scanned: true });
        return Ocr.readPdf(url, onStage).then(done, failed);
      }, failed);
    }

    onStage({ kind: "text" });
    return new Promise(function (resolve, reject) {
      URL.revokeObjectURL(url);
      const rd = new FileReader();
      rd.onload = function () { resolve(rd.result); };
      rd.onerror = function () { reject(new Error("Could not read that file")); };
      rd.readAsText(file);
    });
  }

  function doImport() {
    let tab = "grid";

    const body = function () {
      return '<div class="chips" id="ttTabs" style="margin-bottom:12px">' +
          '<button type="button" class="chip' + (tab === "grid" ? " on" : "") + '" data-t="grid">A timetable I already have</button>' +
          '<button type="button" class="chip' + (tab === "words" ? " on" : "") + '" data-t="words">Describe what I want</button>' +
        '</div>' +

        '<div id="ttGrid"' + (tab === "grid" ? "" : ' hidden') + '>' +
          '<div class="tiny muted" style="margin-bottom:9px">Paste it, or choose a file. JSON from ' +
            'anywhere, a spreadsheet saved as CSV, plain text like ' +
            '<b>Monday 16:30-18:00 Maths</b>, a PDF, or a photo of one. Imported blocks ' +
            'count as yours, so Generate schedules around them rather than over them.</div>' +
          '<textarea class="input" id="ttIn" style="height:150px;font-family:var(--font-mono,monospace);font-size:11px" ' +
            'placeholder="Paste it here"></textarea>' +
          '<input type="file" accept=".json,.txt,.csv,.md,.pdf,image/*,application/json,text/plain,text/csv,application/pdf" ' +
            'id="ttFileIn" class="input" style="margin-top:9px">' +
          '<div class="tiny faint" style="margin-top:7px">A photo, a screenshot or a scanned PDF works ' +
            'too: they are read by eye. A straight-on shot in good light reads far better than one at ' +
            'an angle, and whatever it reads is shown here to correct before anything is saved.</div>' +

        '<div id="ttWords"' + (tab === "words" ? "" : ' hidden') + '>' +
          '<div class="tiny muted" style="margin-bottom:9px">Say it however you would say it out loud. ' +
            'Each sentence is read on its own, and anything not understood is listed back rather ' +
            'than quietly ignored.</div>' +
          '<textarea class="input" id="ttWordsIn" style="height:130px" placeholder="' +
            UI.esc("Three hours a day, one subject a day. Nothing on Fridays. " +
                   "Free 4pm to 9pm on weekdays. 45 minutes of UCAS personal statement " +
                   "every Sunday at 10am. Alternate human and physical geography.") + '"></textarea>' +
          '<div class="row wrap" style="gap:7px;margin-top:9px">' +
            '<button class="btn btn-sm" id="ttWordsRead">Read it</button>' +
            '<span class="tiny faint">Nothing changes until you press Apply.</span>' +
          '</div>' +
        '</div>' +

        '<div id="ttPreview" style="margin-top:12px"></div>';
    };

    UI.modal({
      title: "Bring a timetable in",
      wide: true,
      body: body(),
      footer: '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="ttDo" disabled>Apply</button>',
      onMount: function (box) {
        const ta = box.querySelector("#ttIn");
        const words = box.querySelector("#ttWordsIn");
        const preview = box.querySelector("#ttPreview");
        const go = box.querySelector("#ttDo");
        let pending = null;             // { apply: fn, label: string }

        const show = function (html, ready) {
          preview.innerHTML = html;
          go.disabled = !ready;
        };

        box.querySelectorAll("#ttTabs [data-t]").forEach(function (b) {
          b.onclick = function () {
            tab = b.dataset.t;
            box.querySelectorAll("#ttTabs [data-t]").forEach(function (o) { o.classList.toggle("on", o === b); });
            box.querySelector("#ttGrid").hidden = tab !== "grid";
            box.querySelector("#ttWords").hidden = tab !== "words";
            pending = null; show("", false);
          };
        });

        /* ---- a timetable someone already has ---- */
        const readGrid = function () {
          const raw = ta.value.trim();
          if (!raw) { pending = null; show("", false); return; }
          const r = TimetableAdopt.read(raw, { span: span });

          if (r.kind === "native") {
            const d = Timetable.describe(r.data);
            pending = { apply: function () { return Timetable.importData(r.data); } };
            show('<div class="ttp ok"><b>A timetable exported from here</b>' +
                 '<span>' + d.blocks + ' blocks across ' + d.days + ' days. ' +
                 'This replaces your timetable; your ratings and plans are untouched.</span></div>', true);
            return;
          }
          if (r.kind === "none") {
            pending = null;
            show('<div class="ttp bad"><b>Nothing readable in that</b><span>' +
                 r.notes.map(UI.esc).join(" ") + ' A line needs a day, a start and an end: ' +
                 '"Monday 16:30-18:00 Maths".</span></div>', false);
            return;
          }
          const total = Object.keys(r.days).reduce(function (a, k) { return a + r.days[k].length; }, 0);
          pending = { apply: function () {
            Timetable.mergeDays(r.days);
            return { blocks: total, days: Object.keys(r.days).length };
          } };
          show('<div class="ttp ok"><b>' + r.rows.length + ' recurring blocks read</b>' +
               '<span>' + total + ' sittings across the next ' + span + ' days. ' +
               (r.notes.length ? r.notes.map(UI.esc).join(" ") + " " : "") +
               'They are added as yours, so Generate works around them.</span></div>' +
               '<div class="ttp-rows">' + r.rows.slice(0, 12).map(function (x) {
                 return '<div><b>' + (typeof x.day === "number" ? Timetable.DAY_NAMES[x.day] : UI.esc(x.day)) + '</b>' +
                   Timetable.toClock(x.from) + '–' + Timetable.toClock(x.to) +
                   '<span>' + UI.esc(x.label) + '</span></div>';
               }).join("") + (r.rows.length > 12 ? '<div class="tiny faint">and ' + (r.rows.length - 12) + ' more</div>' : "") +
               '</div>', true);
        };

        ta.oninput = readGrid;
        box.querySelector("#ttFileIn").onchange = function (e) {
          const f = e.target.files[0];
          if (!f) return;
          let read = false;

          /* The first read downloads the recogniser and its English model,
             which is several megabytes, so it says which part it is on. */
          const stage = function (s) {
            if (read) return;
            if (s.kind === "pdf") { show('<div class="ttp"><b>Reading the PDF…</b></div>', false); return; }
            if (s.kind === "ocr") {
              show('<div class="ttp"><b>' + (s.scanned ? "That PDF is a scan, so it is being read by eye" :
                   "Reading the picture") + '…</b><span>The reader is fetched the first time and then ' +
                   'stays. This takes a few seconds.</span></div>', false);
              return;
            }
            if (s.stage === "loading") {
              show('<div class="ttp"><b>Fetching the text reader… ' + (s.pct || 0) + '%</b>' +
                   '<span>One-off download.</span></div>', false);
            } else if (s.stage === "reading") {
              show('<div class="ttp"><b>Reading… ' + (s.pct || 0) + '%</b></div>', false);
            } else if (s.stage === "page") {
              show('<div class="ttp"><b>Reading page ' + s.page + ' of ' + s.of + '…</b></div>', false);
            }
          };

          fileText(f, stage).then(function (t) {
            read = true;
            ta.value = t || "";
            if (!String(t || "").trim()) {
              show('<div class="ttp bad"><b>Nothing came back from that file</b><span>If it is a photo, ' +
                   'a straight-on shot in good light reads far better than one at an angle. You can also ' +
                   'type it into the box above, or describe it in the other tab.</span></div>', false);
              return;
            }
            readGrid();
            /* Recognition guesses, so what it read is shown and can be edited
               before anything is saved. */
            if (typeof Ocr !== "undefined" && (Ocr.isImage(f) || !/\d/.test(t.slice(0, 200)))) {
              const box2 = box.querySelector("#ttPreview");
              box2.insertAdjacentHTML("afterbegin",
                '<div class="ttp" style="margin-bottom:9px"><b>Read from the picture</b>' +
                '<span>Check it above before applying. Recognition guesses, and a 1 that should be a 7 ' +
                'is the kind of mistake it makes.</span></div>');
            }
          }, function (err) {
            read = true;
            show('<div class="ttp bad"><b>Could not read that file</b><span>' +
                 UI.esc(err && err.message ? err.message : "Unknown error") + '</span></div>', false);
          });
        };

        /* ---- a description ---- */
        const readWords = function () {
          const parsed = TimetableAdopt.describe(words.value);
          if (!parsed.said.length) {
            pending = null;
            show('<div class="ttp bad"><b>None of that turned into a setting</b>' +
                 '<span>Try things like "three hours a day", "one subject a day", ' +
                 '"nothing on Fridays", "free 4pm to 9pm on weekdays", ' +
                 '"45 minutes of UCAS on Sunday".</span></div>', false);
            return;
          }
          pending = { apply: function () {
            TimetableAdopt.apply(parsed);
            return { blocks: 0, days: 0, settings: parsed.said.length };
          } };
          show('<div class="ttp ok"><b>' + parsed.said.length + ' settings understood</b></div>' +
               '<ul class="ttp-said">' + parsed.said.map(function (s) {
                 return '<li>' + UI.esc(s) + '</li>'; }).join("") + '</ul>' +
               (parsed.missed.length
                 ? '<div class="ttp bad" style="margin-top:9px"><b>Not understood</b><span>' +
                   parsed.missed.map(function (s) { return '“' + UI.esc(s) + '”'; }).join(", ") +
                   '</span></div>'
                 : ""), true);
        };
        box.querySelector("#ttWordsRead").onclick = readWords;
        words.oninput = function () { pending = null; go.disabled = true; };

        go.onclick = function () {
          if (!pending) return;
          try {
            const d = pending.apply() || {};
            UI.closeModal();
            UI.toast(d.settings != null
              ? "Applied " + d.settings + " setting" + (d.settings === 1 ? "" : "s") + ". Generate to rebuild."
              : "Brought in " + d.blocks + " blocks across " + d.days + " days", "ok", 4500);
            mode = "grid"; App.render();
          } catch (err) { UI.toast(err.message, "bad"); }
        };
      }
    });
  }

  function handle(action, el) {
    switch (action) {
      case "tt-mode": mode = el.dataset.val; App.render(); return true;
      case "tt-span": span = +el.dataset.val; mode = "grid"; App.render(); return true;
      case "tt-open": openIso = el.dataset.iso; mode = "day"; App.render(); return true;
      case "tt-prev": openIso = Metrics.addDays(el.dataset.iso, -1); App.render(); return true;
      case "tt-next": openIso = Metrics.addDays(el.dataset.iso, 1); App.render(); return true;
      case "tt-add": blockModal(el.dataset.iso); return true;
      case "tt-edit": editModal(el.dataset.iso, el.dataset.id); return true;
      case "tt-del": Timetable.removeBlock(el.dataset.iso, el.dataset.id); App.render(); return true;
      case "tt-busy-add": busyModal(); return true;
      case "tt-flex-add": flexModal(); return true;
      case "tt-flex-del": Timetable.removeFlex(el.dataset.id); App.render(); return true;
      case "tt-open-chapter": {
        /* the chapter lives in its own subject, so go there first */
        if (el.dataset.sub && el.dataset.sub !== Subjects.currentId()) {
          Subjects.switchTo(el.dataset.sub);
        }
        App.go("chapter", { id: el.dataset.id });
        return true;
      }
      case "tt-busy-del": Timetable.removeBusy(el.dataset.id); App.render(); return true;
      case "tt-rule-toggle": {
        const k = el.dataset.k;
        const p = {}; p[k] = !Timetable.rules()[k];
        Timetable.setRules(p); App.render(); return true;
      }
      case "tt-subday": {
        const id = el.dataset.id, d = +el.dataset.d;
        const map = Object.assign({}, Timetable.rules().subjectDays || {});
        const list = (map[id] || []).slice();
        const at = list.indexOf(d);
        if (at >= 0) list.splice(at, 1); else list.push(d);
        /* every day picked is the same as no restriction, and saying so is
           clearer than a row of seven lit chips */
        if (list.length === 7 || !list.length) delete map[id]; else map[id] = list.sort();
        Timetable.setRules({ subjectDays: map }); App.render(); return true;
      }
      case "tt-alt": {
        const id = el.dataset.id;
        const map = Object.assign({}, Timetable.rules().alternate || {});
        if (map[id]) delete map[id]; else map[id] = true;
        Timetable.setRules({ alternate: map }); App.render(); return true;
      }
      case "tt-rec-rules": {
        Timetable.setRules(Timetable.recommendRules());
        UI.toast("Filled in from your week and your exam dates", "ok");
        App.render(); return true;
      }
      case "tt-sub-off": {
        const s = Timetable.subjects().filter(function (x) { return x.id === el.dataset.id; })[0];
        Timetable.setSubject(el.dataset.id, { off: !(s && s.off) });
        App.render(); return true;
      }
      case "tt-win-off": {
        const d = +el.dataset.d;
        const w = Timetable.get().prefs.windows[d];
        Timetable.setWindow(d, { off: !w.off });
        App.render(); return true;
      }
      case "tt-generate": {
        const cap = Timetable.weeklyCapacity();
        if (!cap) { UI.toast("Every day is marked off — set a window first", "bad"); mode = "setup"; App.render(); return true; }
        UI.confirm("Build the timetable?",
          "Blocks you have moved or added yourself are kept. Everything else is rebuilt from your " +
          "windows and the time each subject is owed.", "Build it", false).then(function (ok) {
            if (!ok) return;
            const r = Timetable.generate({ days: Math.max(span, 14) });
            UI.toast("Placed " + r.made + " blocks across " + r.days + " days", "ok", 3500);
            mode = "grid"; App.render();
          });
        return true;
      }
      /* Back to the suggestion, for one subject or all of them: having
         typed over it, there was no way back to it without working the
         number out again by hand. */
      case "tt-use-rec": {
        Timetable.setSubject(el.dataset.id, { mins: null });
        App.render(); return true;
      }
      case "tt-use-rec-all": {
        Timetable.subjects().forEach(function (s) { Timetable.setSubject(s.id, { mins: null }); });
        UI.toast("Every subject back to its recommended hours", "ok", 2600);
        mode = "setup"; App.render(); return true;
      }
      case "tt-undo": {
        if (!Timetable.undo()) { UI.toast("Nothing to undo", "warn", 1800); return true; }
        UI.toast("Put back", "ok", 1600);
        App.render(); return true;
      }
      case "tt-reset": {
        UI.confirm("Reset the timetable?",
          "Everything is rebuilt from your windows and your hours, including the blocks you moved " +
          "or added yourself. Your setup is not touched.",
          "Reset it", true).then(function (ok) {
            if (!ok) return;
            const r = Timetable.generate({ days: Math.max(span, 14), fresh: true });
            UI.toast("Rebuilt from scratch — " + r.made + " blocks", "ok", 3000);
            mode = "grid"; App.render();
          });
        return true;
      }
      case "tt-export": doExport(); return true;
      case "tt-import": doImport(); return true;
    }
    return false;
  }

  return { render: render, handle: handle };
})();
