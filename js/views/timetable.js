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
      return '<div class="tt-block' + (b.kind === "busy" ? " busy" : "") + (short ? " short" : "") + '" ' +
        'data-id="' + b.id + '" data-iso="' + iso + '" ' +
        (b.kind === "busy" ? "" : 'data-drag="1" ') +
        'style="top:' + ((f - lo) * PX_PER_MIN) + 'px;height:' + ((t - f) * PX_PER_MIN) +
          'px;--c:' + b.colour + '">' +
        '<span class="tt-block-main"><b>' + UI.esc(b.label) + '</b>' +
          '<small>' + b.from + '–' + b.to +
            (b.subjectName ? ' · ' + UI.esc(b.subjectName) : '') +
            (b.eta ? ' · ' + fmt(b.eta) + ' left on it' : '') + '</small></span>' +
        (b.kind === "busy"
          ? '<span class="tt-lock" title="A recurring commitment. Edit it in Set up.">▦</span>'
          : '<button class="tt-x" data-action="tt-del" data-id="' + b.id + '" data-iso="' + iso +
            '" title="Remove this block">✕</button>') +
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
      '</div>' +
      detailPanel(iso);
  }

  /* What a block is actually asking you to do.

     A block that says "A-Level Maths" is a budget; one that says "Y1 Ch 12,
     watch the playlist then the topic questions" is an instruction. The
     chapter and the order come from the daily planner, so the timetable and
     the plan cannot disagree about what matters. */
  function detailPanel(iso) {
    if (!openBlock) return "";
    const b = Timetable.blocksOn(iso).filter(function (x) { return x.id === openBlock; })[0];
    if (!b) return "";
    if (b.kind !== "revision") {
      return '<div class="card tt-detail"><b>' + UI.esc(b.label) + '</b>' +
        '<div class="tiny muted">' + b.from + '–' + b.to + ' · not revision, so nothing is planned for it.</div></div>';
    }
    const steps = b.steps || [];
    return '<div class="card tt-detail">' +
        '<div class="row wrap" style="gap:10px;align-items:center">' +
          '<span class="tt-node" style="background:' + b.colour + ';width:14px;height:14px"></span>' +
          '<div style="flex:1;min-width:160px">' +
            '<b>' + UI.esc(b.label) + '</b>' +
            '<div class="tiny muted">' + UI.esc(b.subjectName || "") + ' · ' + b.from + '–' + b.to +
              (b.eta ? ' · about ' + fmt(b.eta) + ' of work left on this chapter' : '') + '</div>' +
          '</div>' +
          (b.rag ? UI.ragDot(b.rag) : "") +
          (b.chapterId
            ? '<button class="btn btn-sm btn-primary" data-action="tt-open-chapter" data-id="' +
              b.chapterId + '" data-sub="' + UI.esc(b.subjectId || "") + '">Open the chapter</button>'
            : "") +
        '</div>' +
        (b.why ? '<div class="tiny muted" style="margin-top:8px">Scheduled because ' + UI.esc(b.why) + '.</div>' : "") +
        (steps.length
          ? '<div class="tt-steps">' + steps.map(function (x, i) {
              return '<div class="tt-step"><span class="tt-step-n">' + (i + 1) + '</span>' +
                '<span class="tt-step-main"><b>' + UI.esc(x.label) + '</b>' +
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
            ' · placed for you</small></div>' +
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
      el.ondblclick = function (e) {
        if (e.target.closest("[data-action]")) return;
        editModal(el.dataset.iso, el.dataset.id);
      };
      el.onpointerup = function (e) {
        if (!drag || drag.el !== el) return;
        el.classList.remove("dragging");
        /* A press that did not travel is a click, and a click opens the block
           rather than dropping it back where it already was. */
        if (!drag.moved) {
          openBlock = (openBlock === drag.id) ? null : drag.id;
          drag = null;
          App.render();
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
  function flexModal() {
    UI.modal({
      title: "Something that takes a set amount of time",
      body: '<div class="field"><label class="label">What is it</label>' +
          '<input class="input" id="tfLabel" placeholder="e.g. Gym"></div>' +
        '<div class="field"><label class="label">How long</label>' +
          '<span class="tt-hm"><input class="input" type="number" min="0" max="12" value="2" id="tfH"><em>h</em>' +
          '<input class="input" type="number" min="0" max="59" step="5" value="0" id="tfM"><em>m</em></span></div>' +
        '<div class="field"><label class="label">Which days</label>' +
          '<div class="chips" id="tfDays">' + [1,2,3,4,5,6,0].map(function (d) {
            return '<button type="button" class="chip" data-d="' + d + '">' + Timetable.SHORT_DAYS[d] + '</button>';
          }).join("") + '</div></div>' +
        '<div class="tiny faint">It is placed at the end of the longest free stretch on each of those ' +
          'days, and revision is built around it.</div>',
      footer: '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="tfSave">Add it</button>',
      onMount: function (box) {
        const days = {};
        box.querySelectorAll("[data-d]").forEach(function (b) {
          b.onclick = function () { const d = +b.dataset.d; days[d] = !days[d]; b.classList.toggle("on", !!days[d]); };
        });
        box.querySelector("#tfSave").onclick = function () {
          const picked = Object.keys(days).filter(function (k) { return days[k]; }).map(Number);
          const label = box.querySelector("#tfLabel").value.trim();
          const mins = (+box.querySelector("#tfH").value || 0) * 60 + (+box.querySelector("#tfM").value || 0);
          if (!label) { UI.toast("Give it a name", "bad"); return; }
          if (!picked.length) { UI.toast("Pick at least one day", "bad"); return; }
          if (mins < 15) { UI.toast("Give it at least 15 minutes", "bad"); return; }
          Timetable.addFlex({ label: label, days: picked, mins: mins });
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

  function doImport() {
    UI.modal({
      title: "Import a timetable",
      wide: true,
      body: '<div class="warnbox"><b>This replaces your timetable</b>Your subject progress, ' +
          'ratings and plans are untouched — only the timetable is swapped.</div>' +
        '<div class="field"><label class="label">Paste the file, or choose it below</label>' +
          '<textarea class="input" id="ttIn" style="height:180px;font-family:var(--font-mono,monospace);font-size:11px" ' +
            'placeholder="Paste the exported JSON here"></textarea></div>' +
        '<input type="file" accept="application/json,.json" id="ttFileIn" class="input">',
      footer: '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="ttDo">Import</button>',
      onMount: function (box) {
        const ta = box.querySelector("#ttIn");
        box.querySelector("#ttFileIn").onchange = function (e) {
          const f = e.target.files[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = function () { ta.value = r.result; };
          r.readAsText(f);
        };
        box.querySelector("#ttDo").onclick = function () {
          let data;
          try { data = JSON.parse(ta.value); }
          catch (err) { UI.toast("That is not valid JSON", "bad"); return; }
          try {
            const d = Timetable.importData(data);
            UI.closeModal();
            UI.toast("Imported " + d.blocks + " blocks across " + d.days + " days", "ok", 4000);
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
      case "tt-export": doExport(); return true;
      case "tt-import": doImport(); return true;
    }
    return false;
  }

  return { render: render, handle: handle };
})();
