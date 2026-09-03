/* ============================================================
UI, shared rendering helpers, modals, toasts, charts
   ============================================================ */

const UI = (function () {

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ---------- toast ---------- */
  function toast(msg, kind, ms) {
    const root = document.getElementById("toastRoot");
    const el = document.createElement("div");
    el.className = "toast " + (kind || "");
    el.innerHTML = esc(msg);
    root.appendChild(el);
    setTimeout(function () {
      el.style.transition = "opacity .25s, transform .25s";
      el.style.opacity = "0"; el.style.transform = "translateX(20px)";
      setTimeout(function () { el.remove(); }, 260);
    }, ms || 3200);
  }

  /* ---------- modal ---------- */
  let modalCloser = null;
  function modal(opts) {
    const root = document.getElementById("modalRoot");
    const ov = document.getElementById("overlay");
    root.innerHTML =
      '<div class="modal ' + (opts.wide ? "wide" : "") + '">' +
        '<div class="modal-head"><h3>' + esc(opts.title) + '</h3>' +
          '<button class="icon-btn" data-modal-close>✕</button></div>' +
        '<div class="modal-body">' + (opts.body || "") + '</div>' +
        (opts.footer ? '<div class="modal-foot">' + opts.footer + '</div>' : "") +
      '</div>';
    root.classList.add("on"); ov.classList.add("on");
    const box = root.querySelector(".modal");
    box.addEventListener("click", function (e) { e.stopPropagation(); });
    root.onclick = closeModal;
    ov.onclick = closeModal;
    root.querySelector("[data-modal-close]").onclick = closeModal;
    modalCloser = opts.onClose || null;
    if (opts.onMount) opts.onMount(box);
    return box;
  }
  function closeModal() {
    document.getElementById("modalRoot").classList.remove("on");
    document.getElementById("modalRoot").innerHTML = "";
    document.getElementById("overlay").classList.remove("on");
    if (modalCloser) { const f = modalCloser; modalCloser = null; f(); }
  }
  function confirmDialog(title, message, confirmLabel, danger) {
    return new Promise(function (resolve) {
      let settled = false;
      /* Plain text is escaped, as it must be. A caller that genuinely needs
         markup -- a comparison table before overwriting your data, say --
         passes { html: "..." } and takes responsibility for escaping it. */
      const body = (message && typeof message === "object" && message.html != null)
        ? message.html
        : '<div class="muted">' + esc(message) + '</div>';
      modal({
        title: title,
        body: body,
        footer: '<button class="btn" data-c="0">Cancel</button>' +
                '<button class="btn ' + (danger ? "btn-danger" : "btn-primary") + '" data-c="1">' + esc(confirmLabel || "Confirm") + '</button>',
        onClose: function () { if (!settled) { settled = true; resolve(false); } },
        onMount: function (box) {
          box.querySelectorAll("[data-c]").forEach(function (b) {
            b.onclick = function () { settled = true; resolve(b.dataset.c === "1"); closeModal(); };
          });
        }
      });
    });
  }

  /* ---------- small bits ---------- */
  const RAG_LABEL = { red: "RED", amber: "AMBER", green: "GREEN" };
  const RAG_EMOJI = { red: "🔴", amber: "🟠", green: "🟢" };

  /* ---------- loose date parsing ----------
     A native <input type="date"> reports an empty value until every part of
     the date is filled in, so a half-typed entry reads as "nothing" and gets
     silently discarded. This accepts what people actually type and fills the
     gaps from the date already set, so "june" changes the month and leaves
     the rest alone.

     Day-first throughout, because this is a UK exam tracker: 6/7 is the 6th
     of July, never the 7th of June. */
  const MONTHS = ["january", "february", "march", "april", "may", "june",
                  "july", "august", "september", "october", "november", "december"];

  function parseLooseDate(text, fallbackISO) {
    const raw = String(text || "").trim().toLowerCase();
    if (!raw) return null;

    const fb = /^\d{4}-\d{2}-\d{2}$/.test(fallbackISO || "")
      ? fallbackISO.split("-").map(Number)
      : (function () { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()]; })();
    let [year, month, day] = fb;
    let sawAny = false;

    /* An exact ISO date is taken as-is. */
    const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
      year = +iso[1]; month = +iso[2]; day = +iso[3];
      return finish(year, month, day);
    }

    /* A month name anywhere in the string, full or abbreviated. */
    const nameMatch = raw.match(/[a-z]{3,}/);
    if (nameMatch) {
      const i = MONTHS.findIndex(function (m) { return m.indexOf(nameMatch[0]) === 0; });
      if (i < 0) return null;              // a word that is not a month: reject
      month = i + 1; sawAny = true;
    }

    /* Remaining numbers, in order. Their meaning depends on how many there
       are and whether a month name already claimed the month slot. */
    const nums = (raw.match(/\d+/g) || []).map(Number);

    if (nums.length === 1) {
      const n = nums[0];
      if (n >= 1000)      { year = n; }                          // "2027"
      else if (sawAny)    { day = n; }                           // "june 6"
      else if (n <= 12)   { month = n; }                         // "6" -> June
      else if (n <= 31)   { day = n; }                           // "24"
      else                { year = 2000 + n; }                   // "27"
      sawAny = true;
    } else if (nums.length === 2) {
      if (sawAny) {                                              // month named
        const [a, b] = nums;
        if (a >= 1000) { year = a; day = fb[2]; }
        else { day = a; year = b >= 1000 ? b : 2000 + b; }
      } else {
        const [a, b] = nums;
        if (b >= 1000)      { month = a; year = b; }             // "6/2027"
        else if (a >= 1000) { year = a; month = b; }             // "2027/6"
        else                { day = a; month = b; }              // "6/7" day-first
      }
      sawAny = true;
    } else if (nums.length >= 3) {
      const [a, b, c] = nums;
      if (a >= 1000) { year = a; month = b; day = c; }           // 2027 6 1
      else { day = a; month = b; year = c >= 1000 ? c : 2000 + c; }
      sawAny = true;
    }

    if (!sawAny) return null;
    return finish(year, month, day);
  }

  function finish(year, month, day) {
    if (!(month >= 1 && month <= 12)) return null;
    if (!(year >= 1900 && year <= 2200)) return null;
    /* Clamp rather than reject: changing the month from the 31st to a shorter
       month should land on that month's last day, not throw the entry away. */
    const last = new Date(year, month, 0).getDate();
    if (day < 1) day = 1;
    if (day > last) day = last;
    const p = function (n) { return (n < 10 ? "0" : "") + n; };
    return { iso: year + "-" + p(month) + "-" + p(day), year: year, month: month, day: day };
  }

  /* An exam date field that accepts typing. Text box for loose entry plus the
     native picker for anyone who would rather click, kept in step with each
     other. Saves on blur, so clicking away commits it. */
  function dateField(opts) {
    const id = opts.id;
    const value = opts.value || "";
    return '<div class="datefield" data-datefield="' + id + '">' +
      '<input class="input" id="' + id + '" type="text" autocomplete="off" spellcheck="false" ' +
        'placeholder="e.g. 1 June 2027, 6/2027, june" value="' + esc(fmtLoose(value)) + '">' +
      '<input class="input date-pick" id="' + id + '-pick" type="date" value="' + esc(value) + '" ' +
        'aria-label="Pick a date">' +
      '<div class="tiny faint datefield-hint" id="' + id + '-hint">' + esc(hintFor(value)) + '</div>' +
      '</div>';
  }

  function fmtLoose(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return d + " " + MONTHS[m - 1].charAt(0).toUpperCase() + MONTHS[m - 1].slice(1) + " " + y;
  }

  function hintFor(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return "";
    const d = new Date(iso + "T00:00:00");
    const days = Math.round((d - new Date(new Date().toDateString())) / 86400000);
    return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
      (days > 0 ? "  ·  " + days + " day" + (days === 1 ? "" : "s") + " away"
                : days === 0 ? "  ·  today" : "  ·  in the past");
  }

  function ragPill(rag, extra) {
    if (!rag) return '<span class="rag rag-none"><i class="dot dot-none"></i>NOT RATED</span>';
    return '<span class="rag rag-' + rag + '"><i class="dot dot-' + rag + '"></i>' + RAG_LABEL[rag] + (extra ? " " + esc(extra) : "") + '</span>';
  }

/* Which year of the A level a topic belongs to. Both years restart their
chapter numbering, so this badge is what keeps them apart at a glance. */
function yearPill(year) {
  const y = Number(year) === 2 ? 2 : 1;
  return '<span class="yr yr-' + y + '" title="Pure/Stats/Mechanics Year ' + y + ' content">Y' + y + '</span>';
}
  function ragDot(rag) { return '<i class="dot dot-' + (rag || "none") + '"></i>'; }

  function bar(pct, cls) {
    pct = Math.max(0, Math.min(100, Math.round(pct || 0)));
    return '<div class="bar ' + (cls || "") + '"><span style="width:' + pct + '%"></span></div>';
  }

  function ragBar(c) {
    const total = (c.red + c.amber + c.green + c.unassessed) || 1;
    const w = function (n) { return (n / total * 100).toFixed(2) + "%"; };
    return '<div class="ragbar">' +
      '<i class="r" style="width:' + w(c.red) + '"></i>' +
      '<i class="a" style="width:' + w(c.amber) + '"></i>' +
      '<i class="g" style="width:' + w(c.green) + '"></i>' +
      '<i class="n" style="width:' + w(c.unassessed) + '"></i></div>';
  }

  function ragLegend(c) {
    return '<div class="legend">' +
      '<span><i class="dot dot-red"></i>' + c.red + ' red</span>' +
      '<span><i class="dot dot-amber"></i>' + c.amber + ' amber</span>' +
      '<span><i class="dot dot-green"></i>' + c.green + ' green</span>' +
      (c.unassessed ? '<span><i class="dot dot-none"></i>' + c.unassessed + ' unrated</span>' : "") +
      '</div>';
  }

  function ragPicker(current, action, id, wide) {
    return '<div class="rag-pick' + (wide ? " row" : "") + '" style="' + (wide ? "width:100%" : "") + '">' +
      ["red", "amber", "green"].map(function (v) {
        return '<button class="rag-btn ' + (wide ? "wide " : "") + (current === v ? "sel" : "") + '" data-v="' + v + '" data-action="' + action + '" data-id="' + esc(id) + '">' +
          RAG_EMOJI[v] + " " + RAG_LABEL[v] + '</button>';
      }).join("") + '</div>';
  }

  function empty(icon, text, sub) {
    return '<div class="empty"><span class="e">' + icon + '</span><div class="empty-t">' + esc(text) + '</div>' +
      (sub ? '<div class="tiny empty-s">' + esc(sub) + '</div>' : "") + '</div>';
  }

  function accPill(pct) {
    if (pct == null) return '<span class="pill">no data</span>';
    const cls = pct >= 75 ? "good" : pct >= 55 ? "warn" : "bad";
    return '<span class="pill ' + cls + '">' + pct + '%</span>';
  }

  /* ---------- charts (hand-rolled SVG, no dependencies) ---------- */
  function lineChart(points, opts) {
    opts = opts || {};
    const W = 560, H = opts.height || 190, P = { l: 34, r: 12, t: 14, b: 26 };
    if (!points.length) return empty("📈", opts.emptyText || "No data yet");
    const iw = W - P.l - P.r, ih = H - P.t - P.b;
    const max = opts.max != null ? opts.max : 100, min = opts.min != null ? opts.min : 0;
    const n = points.length;
    const x = function (i) { return P.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw); };
    const y = function (v) { return P.t + ih - ((v - min) / (max - min)) * ih; };

    let grid = "", labels = "";
    [0, 25, 50, 75, 100].forEach(function (g) {
      const v = min + (max - min) * (g / 100);
      grid += '<line class="grid-l" x1="' + P.l + '" y1="' + y(v).toFixed(1) + '" x2="' + (W - P.r) + '" y2="' + y(v).toFixed(1) + '"/>';
      labels += '<text x="' + (P.l - 7) + '" y="' + (y(v) + 3.5).toFixed(1) + '" text-anchor="end">' + Math.round(v) + '</text>';
    });

    const d = points.map(function (p, i) { return (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1); }).join(" ");
    const area = d + " L" + x(n - 1).toFixed(1) + " " + (P.t + ih) + " L" + x(0).toFixed(1) + " " + (P.t + ih) + " Z";

    let dots = "", xlabels = "";
    points.forEach(function (p, i) {
      dots += '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="4" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"><title>' + esc(p.label || "") + ": " + p.v + '%</title></circle>';
      if (n <= 10 || i % Math.ceil(n / 8) === 0) {
        xlabels += '<text x="' + x(i).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle">' + esc(p.short || "") + '</text>';
      }
    });

    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="height:' + H + 'px">' +
      '<defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="var(--accent)" stop-opacity=".30"/>' +
      '<stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>' +
      grid + '<path d="' + area + '" fill="url(#lg)"/>' +
      '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      dots + labels + xlabels + '</svg>';
  }

  function hBars(rows, opts) {
    opts = opts || {};
    if (!rows.length) return empty("📊", opts.emptyText || "No data yet");
    const max = Math.max.apply(null, rows.map(function (r) { return r.v; })) || 1;
    return '<div class="stack" style="gap:9px">' + rows.map(function (r) {
      const pct = (r.v / max) * 100;
      const color = r.color || "var(--accent)";
      return '<div>' +
        '<div class="row tiny" style="margin-bottom:4px"><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(r.label) + '</span>' +
        '<b style="color:var(--text)">' + esc(r.display != null ? r.display : r.v) + '</b></div>' +
        '<div class="bar thin"><span style="width:' + pct.toFixed(1) + '%;background:' + color + '"></span></div>' +
        '</div>';
    }).join("") + '</div>';
  }

  function donut(segments, centerTop, centerSub) {
    const total = segments.reduce(function (a, s) { return a + s.v; }, 0) || 1;
    const R = 54, C = 2 * Math.PI * R;
    let off = 0;
    const arcs = segments.map(function (s) {
      const len = (s.v / total) * C;
      const el = '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="' + s.color + '" stroke-width="17" ' +
        'stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" ' +
        'transform="rotate(-90 70 70)"><title>' + esc(s.label) + ": " + s.v + '</title></circle>';
      off += len;
      return el;
    }).join("");
    return '<svg viewBox="0 0 140 140" style="width:140px;height:140px;flex:0 0 auto">' +
      '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="var(--surface-2)" stroke-width="17"/>' + arcs +
      '<text x="70" y="68" text-anchor="middle" style="font-size:22px;font-weight:800;fill:var(--text)">' + esc(centerTop) + '</text>' +
      '<text x="70" y="86" text-anchor="middle" style="font-size:10px;fill:var(--faint);letter-spacing:.08em">' + esc(centerSub) + '</text>' +
      '</svg>';
  }

  /* ---------- task card ---------- */
  function taskCard(t, opts) {
    opts = opts || {};
    const info = t.topicId ? Store.info(t.topicId) : null;
    const cls = t.kind === "paper" ? "paper" : (t.rag || (t.topicId ? Metrics.effectiveRag(t.topicId).rag : "") || "");
    const done = t.status === "done";
    const skipped = t.status === "skipped";
    const kindMeta = Scheduler.KIND[t.kind] || { label: t.kind, icon: "•" };

    let sub = "";
    if (info) sub = info.paper.short + " · " + info.section.name;
    else if (t.paperTarget) sub = t.paperTarget + (t.full ? " · full paper" : " · section");

    return '<div class="task ' + cls + (done || skipped ? " done" : "") + '" data-task="' + esc(t.id) + '">' +
      '<button class="check ' + (done ? "on" : "") + '" data-action="task-toggle" data-id="' + esc(t.id) + '" title="Mark complete">✓</button>' +
      '<div class="task-body">' +
        '<div class="row wrap" style="gap:8px">' +
          '<div class="task-title">' + esc(t.title) + '</div>' +
          (t.topicId ? ragPill(Metrics.effectiveRag(t.topicId).rag) : "") +
          (skipped ? '<span class="pill">skipped</span>' : "") +
        '</div>' +
        '<div class="task-meta">' + icon(kindMeta.svg || "star") + " " + kindMeta.label + (sub ? " · " + esc(sub) : "") +
          " · " + icon("clock") + Metrics.fmtMins(t.minutes) + (t.manual ? " · added by you" : "") + '</div>' +
        (t.why && !opts.hideWhy ? '<div class="task-why"><b>Why this?</b> ' + esc(t.why) + '</div>' : "") +
        (opts.hideActions ? "" :
        '<div class="task-actions">' +
          (t.topicId ? '<button class="btn btn-sm btn-primary" data-action="open-session" data-id="' + esc(t.topicId) + '" data-task="' + esc(t.id) + '">Start session</button>' : "") +
          (t.kind === "paper" ? '<button class="btn btn-sm btn-primary" data-action="log-paper">Log this paper</button>' : "") +
          (t.kind === "errors" ? '<button class="btn btn-sm btn-primary" data-action="go" data-view="weaknesses">Open error log</button>' : "") +
          '<button class="btn btn-sm" data-action="task-skip" data-id="' + esc(t.id) + '">Skip</button>' +
          '<button class="btn btn-sm" data-action="task-move" data-id="' + esc(t.id) + '">Reschedule</button>' +
          '<button class="btn btn-sm btn-danger" data-action="task-delete" data-id="' + esc(t.id) + '" ' +
          'title="' + (t.manual ? "Remove this task" : "Take this off the day, the planner will not put it back") + '">Remove</button>' +
        '</div>') +
      '</div></div>';
  }

  /* ---------- add / remove from today ----------
     One button that flips: + puts this topic on today's plan, − takes it
     off again. Anything you add by hand survives the plan recalculating. */
  function todayToggle(id, opts) {
    opts = opts || {};
    const on = Scheduler.isOnToday(id);
    const mins = on ? null : Scheduler.plannedMinutesFor(id);
    return '<button class="today-btn' + (on ? " on" : "") + (opts.compact ? " compact" : "") + '" ' +
      'data-action="' + (on ? "remove-today" : "add-today") + '" data-id="' + esc(id) + '" ' +
      'title="' + (on ? "Take this off today’s plan" : "Add this to today’s plan (about " + Metrics.fmtMins(mins) + ")") + '" ' +
      'aria-label="' + (on ? "Remove from today" : "Add to today") + '">' +
      icon(on ? "minus" : "plus") +
      (opts.label ? '<span>' + (on ? "On today" : "Add to today") + '</span>' : "") +
    '</button>';
  }

  /* ---------- Exam-Focus dial ----------
     An overclock-style gauge: off, the needle sits left as a small tick;
     on, it sweeps clockwise to the right, grows, and the arc lights up
     in a green gradient. */
  function focusDial(on, compact) {
    return '<div class="focus-wrap">' +
      focusButton(on, compact) +
      '<button class="focus-info" data-action="focus-info" aria-label="What is Exam-Focus?" ' +
        'title="What is Exam-Focus?">i</button>' +
    '</div>';
  }

  function focusButton(on, compact) {
    /* A gauge that sweeps from left to right as the mode comes on. The
       viewBox is 44x30 and the rendered box keeps that exact ratio, so the
       dial actually sits centred in its pill, the old one was 48x34 drawn
       into a 38x28 box, which pulled it off centre. Chunky rounded arc,
       capsule needle, solid hub. */
    return '<button class="focus-toggle' + (on ? " on" : "") + (compact ? " compact" : "") + '" ' +
        'data-action="toggle-focus" aria-pressed="' + (on ? "true" : "false") + '" ' +
        'title="Exam-Focus mode, revise a whole chapter at a time instead of section by section">' +
      '<svg class="dial" viewBox="0 0 44 30" aria-hidden="true">' +
        '<defs><linearGradient id="dialGrad" x1="0" y1="1" x2="1" y2="0">' +
          '<stop offset="0%" stop-color="var(--focus-a)"/>' +
          '<stop offset="55%" stop-color="var(--focus-b)"/>' +
          '<stop offset="100%" stop-color="var(--focus-c)"/>' +
        '</linearGradient></defs>' +
        '<path class="dial-track" d="M8 24 A14 14 0 0 1 36 24"/>' +
        '<path class="dial-fill" d="M8 24 A14 14 0 0 1 36 24"/>' +
        '<g class="dial-needle"><rect x="20.6" y="11" width="2.8" height="13.5" rx="1.4"/></g>' +
        '<circle class="dial-hub" cx="22" cy="24" r="3.4"/>' +
      '</svg>' +
      (compact ? "" : '<span class="focus-text"><b>Exam-Focus</b></span>') +
    '</button>';
  }


  /* ---------- animated time bar ----------
     Fills as you log time. When a live timer is running it keeps creeping
     forward and shows a pulsing edge. */
  function timeBar(doneMins, budgetMins, opts) {
    opts = opts || {};
    const pct = budgetMins > 0 ? Math.min(100, (doneMins / budgetMins) * 100) : 0;
    const full = pct >= 100;
    return '<div class="timebar-wrap' + (opts.live ? " live" : "") + (full ? " full" : "") + '">' +
      '<div class="timebar"><span class="timebar-fill" style="width:' + pct.toFixed(1) + '%"></span></div>' +
      '<div class="timebar-meta">' +
        '<span class="timebar-done">' + Metrics.fmtMins(doneMins) + '<span class="timebar-of"> of ' + Metrics.fmtMins(budgetMins) + '</span></span>' +
        '<span class="spacer"></span>' +
        '<span class="timebar-pct' + (full ? " done" : "") + '">' + Math.round(pct) + '%</span>' +
      '</div>' +
      (opts.note ? '<div class="tiny faint" style="margin-top:6px">' + esc(opts.note) + '</div>' : "") +
    '</div>';
  }

  /* ---------- live timer chip ---------- */
  function timerChip() {
    const t = Store.get().timer;
    if (!t) return "";
    const ms = Store.timerElapsedMs();
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), sec = total % 60;
    const clock = (h ? h + ":" + String(m).padStart(2, "0") : String(m)) + ":" + String(sec).padStart(2, "0");
    return '<div class="timer-chip' + (t.running ? " running" : " paused") + '" id="timerChip">' +
      '<span class="timer-dot"></span>' +
      '<span class="timer-clock">' + clock + '</span>' +
      '<span class="timer-label">' + esc(t.label) + '</span>' +
      '<button class="timer-btn" data-action="timer-toggle" title="' + (t.running ? "Pause" : "Resume") + '">' +
        (t.running ? "❙❙" : "▶") + '</button>' +
      '<button class="timer-btn" data-action="timer-stop" title="Stop and log this time">■</button>' +
    '</div>';
  }

  /* ---------- maths typesetting ----------
     Turns the plain notation used in the content into properly typeset
     maths: real superscripts and subscripts, and the correct symbols
     (× − ≤ ≥ ≠ √ θ π ° ∫) instead of keyboard stand-ins.

     It runs on already-escaped text, so it can never inject markup, and it
     is deliberately conservative: a bare "x" is left alone because it is far
     more often the variable than a multiplication sign. */
  const MATH_WORDS = [
    ["theta", "\u03b8"], ["Theta", "\u0398"], ["alpha", "\u03b1"],
    ["beta", "\u03b2"], ["lambda", "\u03bb"], ["mu", "\u03bc"],
    ["sigma", "\u03c3"], ["Sigma", "\u03a3"], ["Delta", "\u0394"],
    ["delta", "\u03b4"], ["phi", "\u03c6"], ["pi", "\u03c0"],
    ["infinity", "\u221e"]
  ].map(function (w) {
    return [new RegExp("(?<![A-Za-z])" + w[0] + "(?![A-Za-z])", "g"), w[1]];
  });

  function sup(g) { return "<sup>" + g.replace(/-/g, "\u2212") + "</sup>"; }
  function sub(g) { return "<sub>" + g + "</sub>"; }

  function math(str) {
    let t = esc(str);

    /* relations and operators (text is escaped, so "<" is "&lt;") */
    t = t.replace(/&lt;=/g, "\u2264").replace(/&gt;=/g, "\u2265")
         .replace(/!=/g, "\u2260").replace(/~=/g, "\u2248")
         .replace(/-&gt;/g, "\u2192").replace(/=&gt;/g, "\u21d2")
         .replace(/\+-/g, "\u00b1")
         .replace(/ \* /g, " \u00d7 ");

    /* roots, in every form they get typed:
         sqrt(x) root(x) root x \u221a already
       The bracketed forms run first so "root(3^2 + 4^2)" becomes
       "\u221a(3^2 + 4^2)" and the exponents are picked up further down. */
    t = t.replace(/(?<![A-Za-z])(?:sqrt|root)\s*\(([^()]*)\)/gi, "\u221a($1)")
         .replace(/(?<![A-Za-z])(?:sqrt|root)\s+(\d+(?:\.\d+)?|[a-z](?![a-z]))/gi, "\u221a$1");

    /* degrees: "30 degrees" -> 30° */
    t = t.replace(/(\d)\s*degrees(?![A-Za-z])/g, "$1\u00b0");

    /* Greek letters and infinity written as words */
    MATH_WORDS.forEach(function (r) { t = t.replace(r[0], r[1]); });

    /* superscripts: ^{...}, ^(...), ^-1, ^2, ^kx */
    /* The token class allows vulgar fractions (x^½) and a real minus sign,
    not just plain alphanumerics, otherwise "x^½" stayed as literal text.
       It deliberately does NOT include "/": "x^2/4" means x squared over
       four, not x to the power two-quarters. A genuinely fractional power
       is written with brackets, x^(1/2), and handled by the branch above. */
    t = t.replace(/\^\{([^}]*)\}/g, function (m, g) { return sup(g); })
         .replace(/\^\(([^)]*)\)/g, function (m, g) { return sup(g); })
         .replace(/\^([−-]?[A-Za-z0-9¼-¾⅐-⅞]+)/g, function (m, g) { return sup(g); });

    /* subscripts: _{...}, _a, _1 */
    t = t.replace(/_\{([^}]*)\}/g, function (m, g) { return sub(g); })
         .replace(/_([A-Za-z0-9])/g, function (m, g) { return sub(g); });

    /* ---------- stacked fractions ----------
       "1/2" should look like a written fraction, not typed text. The whole
       difficulty is everything else that contains a slash, so this is
       deliberately conservative and was written against an audit of every
       slash in the app's content:

         stack 1/2 · 15/56 · x²/4 · (y₂ − y₁)/(x₂ − x₁) · ln 20/ln 3
         leave m/s · km/h · m/s² (units)
         leave dy/dx · dv/dt · d²y/dx² (written inline by convention,
                   and that is how mark schemes write them)
         leave positive/negative · quicker/cheaper (prose)
         leave anything inside a URL

       A side may be a bracketed group, or a token of letters/digits with
       any superscripts and subscripts already applied. */
    if (t.indexOf("://") < 0) {
      const UNIT_DEN = /^(?:s|h|min|hr|kg|km|cm|mm|ml|m|N|J|W|day|week|year)\d*$/i;
      const DERIV_NUM = /^(?:d|d\d?[a-z])$/i;
      const side = "(?:\\([^()]*\\)|[A-Za-z0-9√π]+(?:<sup>[^<]*<\\/sup>|<sub>[^<]*<\\/sub>)*)";
      const re = new RegExp("(^|[\\s=+\\-−×÷(\\[,])(" + side + ")\\s*\\/\\s*(" + side + ")", "g");
      t = t.replace(re, function (whole, lead, num, den, offset, full) {
        const before = full.slice(0, offset + lead.length);
        const plain = function (x) { return x.replace(/<[^>]*>/g, ""); };
        const n = plain(num), d = plain(den);
        const bracketed = num.charAt(0) === "(" || den.charAt(0) === "(";
        /* "ln 20/ln 3" must not split as 20-over-ln: if the numerator is
           preceded by a function name then it is that function's argument,
           not a numerator on its own. Such cases are written with brackets
           in the content, which takes the branch above. */
        if (/(?:ln|log|sin|cos|tan)\s*$/i.test(before)) return whole;
        /* digits include the Unicode super/subscript forms, so "(y₂ − y₁)"
           is recognised as maths rather than mistaken for two words */
        const hasDigit = /[\d²³¹⁰-₟]/.test(n + d);
        /* both sides plain words and no brackets = prose, not a fraction */
        if (!bracketed && !hasDigit && n.length > 1 && d.length > 1) return whole;
        if (UNIT_DEN.test(d) && /^[A-Za-z]/.test(n)) return whole; // m/s, km/h, m/s²
        if (DERIV_NUM.test(n)) return whole; // dy/dx, d/dx
        return lead + '<span class="frac"><span class="fn">' + num +
               '</span><span class="fd">' + den + '</span></span>';
      });
    }

    /* a true minus sign wherever the hyphen is unambiguously arithmetic */
    /* A spaced hyphen between two maths-ish tokens is a minus sign. Letters
       count too, so "x - 2" and "OB - OA" read correctly and not just
       "15 - 5". Both sides must be padded with spaces, so hyphenated words
       ("well-known") are never touched. */
    t = t.replace(/(\d|\)|\]|[A-Za-z]|<\/sup>|<\/sub>)\s-\s(?=[\d(\[A-Za-z])/g, "$1 \u2212 ");

    return '<span class="math">' + t + "</span>";
  }

  /* ---------- mark scheme, laid out like a real one ----------
     Edexcel mark schemes are a table: the working down the left, the marks
     right-aligned in their own narrow column, in a serif face. Rendering
     them as a wall of text with "[1]" trailing each line reads nothing like
     the sheet you mark yourself against, so this splits each step out and
     puts the marks where you expect to find them.

     The marks column shows the number, not an M1/A1/B1 code: the real codes
     say whether a mark is for method or accuracy, and that is not recorded
     in the question bank, inventing it would be worse than omitting it. */
  function markScheme(text) {
    const lines = String(text == null ? "" : text).split("\n");
    let total = 0;
    const rows = lines.map(function (line) {
      const t = line.trim();
      if (!t) return "";
      const m = t.match(/\[(\d+)\]\s*$/);
      const marks = m ? parseInt(m[1], 10) : null;
      if (marks) total += marks;
      const work = m ? t.slice(0, m.index).trim() : t;
      return '<div class="ms-row">' +
        '<span class="ms-step">' + math(work) + '</span>' +
        '<span class="ms-mk">' + (marks ? marks : "") + '</span>' +
      '</div>';
    }).join("");

    return '<div class="ms-sheet">' +
      '<div class="ms-head"><span>Scheme</span><span class="ms-mk">Marks</span></div>' +
      rows +
      (total ? '<div class="ms-total"><span class="ms-total-l">Total</span>' +
               '<span class="ms-mk">' + total + '</span></div>' : "") +
    '</div>';
  }

  /* ---------- icons ----------
     Small stroke icons drawn in currentColor. Used instead of words wherever
     a glyph carries the meaning on its own. */
  const ICONS = {
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.4V12l3.1 1.9"/>',
    play: '<path d="M8.5 5.6 18 12l-9.5 6.4V5.6Z"/>',
    pencil: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="M14.5 6.5 17.5 9.5"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4.2V9h-4.8"/>',
    paper: '<path d="M6.5 3.5h7.6L19 8.4v12.1H6.5Z"/><path d="M13.8 3.6v5h5"/><path d="M9.4 13h6M9.4 16.6h4"/>',
    star: '<path d="m12 4.3 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8Z"/>',
    alert: '<path d="M12 4.6 21 20H3l9-15.4Z"/><path d="M12 10.4v4.1"/><circle cx="12" cy="17.4" r=".9" fill="currentColor" stroke="none"/>',
    check: '<path d="m5 12.8 4.6 4.4L19 6.9"/>',
    cap: '<path d="M12 5 2.8 9.5 12 14l9.2-4.5L12 5Z"/><path d="M6.6 11.6v4.2c0 1.4 2.4 2.7 5.4 2.7s5.4-1.3 5.4-2.7v-4.2"/>',
    flag: '<path d="M6 21V4.4"/><path d="M6 5.1h11.4l-2.2 3.7 2.2 3.7H6"/>',
    rest: '<path d="M20.4 14.6A8.6 8.6 0 0 1 9.3 3.5 8.6 8.6 0 1 0 20.4 14.6Z"/>',
    expand: '<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".9" fill="currentColor" stroke="none"/>',
    contract: '<path d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5"/>',
    eraser: '<path d="M15.5 4.5 19.5 8.5c.8.8.8 2 0 2.8L13 18H8l-4.5-4.5c-.8-.8-.8-2 0-2.8l7-7c.8-.8 2-.8 2.8 0Z"/><path d="M8 18h11"/><path d="m9.5 9.5 5 5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>'

  };

  function icon(name, cls) {
    const d = ICONS[name];
    if (!d) return "";
    return '<svg class="ico ' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
  }

  /* ---------- DOM morphing ----------
     Re-rendering a view by replacing innerHTML recreates every node, which
     (a) repaints the whole panel, the "blink", and (b) restarts every CSS
     entrance animation, so selected chips and ticks pop again on every click.
     Morphing updates the existing nodes in place instead, so only what
     genuinely changed is touched. Scroll position, focus and caret survive. */
  function morphAttrs(f, t, opaque) {
    const ta = t.attributes;
    for (let i = 0; i < ta.length; i++) {
      const a = ta[i];
      /* An opaque element's classes are owned by whatever code built its
         insides, not by the template. PdfViewer adds pdfv-shell on mount and
         toggles pdfv-fullscreen / pdfv-pen-mode / pdfv-tool-eraser as you use
         it; the template only ever says class="pdfv", so overwriting here
         would silently strip all of them on the next unrelated re-render - which is exactly what stopped full screen and the pen from working.
         Union instead: template classes are ensured, runtime ones survive. */
      if (opaque && a.name === "class") {
        t.classList.forEach(function (c) { f.classList.add(c); });
        continue;
      }
      if (f.getAttribute(a.name) !== a.value) f.setAttribute(a.name, a.value);
    }
    const fa = f.attributes;
    for (let i = fa.length - 1; i >= 0; i--) {
      const a = fa[i];
      if (opaque && a.name === "class") continue;
      if (!t.hasAttribute(a.name)) f.removeAttribute(a.name);
    }
  /* form state lives in properties, not attributes, and never clobber
       whatever the user is currently typing into */
    const tag = f.tagName;
    const active = document.activeElement === f;
    if (tag === "INPUT") {
      if (f.type === "checkbox" || f.type === "radio") {
        const c = t.hasAttribute("checked");
        if (!active && f.checked !== c) f.checked = c;
      } else if (!active) {
        const v = t.getAttribute("value");
        if (v !== null && f.value !== v) f.value = v;
      }
    } else if (tag === "TEXTAREA") {
      if (!active && f.value !== t.textContent) f.value = t.textContent;
    } else if (tag === "SELECT" && !active) {
      const sel = t.querySelector("option[selected]");
      if (sel && f.value !== sel.value) f.value = sel.value;
    }
  }

/* Elements whose *content* is built by other code after the fact, a
canvas-rendered PDF being the case in point, must be treated as
     opaque leaves. The template morph is diffing against is always the
     empty placeholder markup (the real content gets filled in later by
     JS), so recursing into one and reconciling children against that
     empty template would strip out exactly the content we want to keep.
     Attributes still morph normally, so a genuine change (a different
     data-src, i.e. a different PDF) is still picked up. */
  function isOpaque(el) {
    return el.classList && (el.classList.contains("pdfv") || el.classList.contains("ytp"));
  }

  function morphChildren(from, to) {
    const fc = from.childNodes, tc = to.childNodes;
    for (let i = 0; i < tc.length; i++) {
      const t = tc[i], f = fc[i];
      if (!f) { from.appendChild(document.importNode(t, true)); continue; }
      if (f.nodeType !== t.nodeType || (f.nodeType === 1 && f.tagName !== t.tagName)) {
        from.replaceChild(document.importNode(t, true), f); continue;
      }
      if (f.nodeType === 3 || f.nodeType === 8) {
        if (f.nodeValue !== t.nodeValue) f.nodeValue = t.nodeValue;
        continue;
      }
      if (f.nodeType === 1) {
        const opaque = isOpaque(f);
        morphAttrs(f, t, opaque);
        if (!opaque) morphChildren(f, t);
      }
    }
    while (fc.length > tc.length) from.removeChild(from.lastChild);
  }

  function morph(from, to) {
    try { morphChildren(from, to); }
    catch (e) { console.warn("morph fell back to replace", e); from.innerHTML = to.innerHTML; }
  }

  /* ---------- misc ---------- */
  function num(v, d) { const n = parseFloat(v); return isNaN(n) ? (d == null ? null : d) : n; }
  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

  return {
    esc: esc, toast: toast, modal: modal, closeModal: closeModal, confirm: confirmDialog,
    ragPill: ragPill, yearPill: yearPill, ragDot: ragDot, ragPicker: ragPicker, bar: bar, ragBar: ragBar, ragLegend: ragLegend,
    parseLooseDate: parseLooseDate, dateField: dateField, fmtLoose: fmtLoose, hintFor: hintFor,
    empty: empty, accPill: accPill, lineChart: lineChart, hBars: hBars, donut: donut, taskCard: taskCard,
    focusButton: focusButton, morph: morph, icon: icon, math: math, todayToggle: todayToggle,
    markScheme: markScheme,
    focusDial: focusDial, timeBar: timeBar, timerChip: timerChip,
    num: num, pct: pct, RAG_EMOJI: RAG_EMOJI, RAG_LABEL: RAG_LABEL
  };
})();
