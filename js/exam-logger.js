/* ============================================================
   Exam logger

   Logging a test you have coming up, in one place: what it
   covers, when it is, and how long it lasts. That is enough for
   the planner to work backwards from — an exam with no topics
   attached cannot tell it what to prioritise.

   The score is deliberately not asked for here. You log the test
   before you sit it; the result comes back days later, so the
   test sits in School Tests marked "awaiting result" until you
   fill it in.
   ============================================================ */

const ExamLogger = (function () {

  function todayISO() { return new Date().toISOString().slice(0, 10); }

  /* Chapters indexed by the two things that actually narrow them down.
     What the top row means depends on the subject: Maths splits into a taught
     Year 1 and Year 2, Geography into Physical and Human, and Economics into
     neither, so it gets no top row at all. Below it sit that group's papers.
     Showing all forty-five maths chapters at once meant two chapters numbered
     1, two numbered 2, and so on down the list. */
  function index() {
    const tops = [], strands = {}, labels = {};
    if (typeof CHAPTER_INDEX === "undefined") return { tops: tops, strands: strands, labels: labels };
    const usesYears = Subjects.current().usesYears;
    Object.keys(CHAPTER_INDEX).forEach(function (cid) {
      const inf = CHAPTER_INDEX[cid];
      if (!inf || !inf.chapter) return;
      const pap = inf.paper || {};
      const top = pap.group ? pap.group : (usesYears ? "Year " + (inf.chapter.year || 1) : "All");
      const st = pap.paper || pap.short || pap.name || "All";
      if (tops.indexOf(top) < 0) tops.push(top);
      if (!strands[top]) strands[top] = {};
      if (!strands[top][st]) strands[top][st] = [];
      labels[st] = pap.short || st;
      strands[top][st].push({ id: cid, num: inf.chapter.num, name: inf.chapter.name });
    });
    return { tops: tops, strands: strands, labels: labels };
  }

  function chip(it, on) {
    return '<button type="button" class="xpick' + (on ? " on" : "") + '" data-xpick="' + it.id + '">' +
      (it.num ? '<b>' + UI.esc(String(it.num)) + '</b>' : "") + UI.esc(it.name) + '</button>';
  }

  /* ---------- the modal ---------- */
  function open(existing) {
    const rec = existing || {};
    const picked = {};
    (rec.chapterIds || []).forEach(function (id) { picked[id] = true; });

    const ix = index();
    const multiTop = ix.tops.length > 1;
    let top = ix.tops[0] || "All";
    let strand = null;              // null until the first render picks one

    const body =
      '<div class="form-grid">' +
        '<div class="field"><label class="label">What is it called?</label>' +
          '<input class="input" id="xTitle" placeholder="e.g. Theme 1 and 2 test" value="' +
            UI.esc(rec.title || "") + '"></div>' +
        '<div class="field"><label class="label">When is it?</label>' +
          '<input class="input" type="date" id="xDate" value="' + UI.esc(rec.date || todayISO()) + '"></div>' +
      '</div>' +
      '<div class="form-grid">' +
        '<div class="field"><label class="label">How long? <span class="faint">optional</span></label>' +
          '<input class="input" type="number" min="0" step="5" id="xMins" placeholder="minutes" value="' +
            UI.esc(rec.minutes || "") + '"></div>' +
        '<div class="field"><label class="label">Total marks <span class="faint">optional</span></label>' +
          '<input class="input" type="number" min="0" id="xTotal" placeholder="e.g. 50" value="' +
            UI.esc(rec.total || "") + '"></div>' +
      '</div>' +

      '<div class="xhead">' +
        '<div class="section-label" style="margin:0">What does it cover?</div>' +
        '<div class="tiny faint" id="xCount"></div>' +
      '</div>' +
      (multiTop ? '<div class="xyear" id="xYear"></div>' : "") +
      '<div class="xstrand" id="xStrand"></div>' +
      '<div class="xpick-row" id="xChips"></div>' +
      '<div class="xpicked" id="xPicked"></div>';



    UI.modal({
      title: existing ? "Edit this test" : "Log an exam",
      wide: true,
      body: body,
      footer: '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="xSave">Save the exam</button>',
      onMount: function (box) {
        const $ = function (id) { return box.querySelector(id); };
        const nPicked = function () {
          return Object.keys(picked).filter(function (k) { return picked[k]; }).length;
        };

        /* Everything below the two rows redraws when either changes, so the
           chips only ever show one year of one paper at a time. */
        const unit = Subjects.current().unitPlural || "chapters";

        function paint() {
          const strandsForTop = ix.strands[top] || {};
          const names = Object.keys(strandsForTop);
          if (!strand || names.indexOf(strand) < 0) strand = names[0];

          if (multiTop) {
            $("#xYear").innerHTML = ix.tops.map(function (t) {
              const inThis = ix.strands[t] || {};
              const total = Object.keys(inThis).reduce(function (n, k) { return n + inThis[k].length; }, 0);
              const chosen = Object.keys(inThis).reduce(function (n, k) {
                return n + inThis[k].filter(function (it) { return picked[it.id]; }).length;
              }, 0);
              return '<button type="button" class="xyear-btn' + (t === top ? " on" : "") + '" data-xyear="' + UI.esc(t) + '">' +
                '<b>' + UI.esc(t.toUpperCase()) + '</b><small>' +
                (chosen ? chosen + ' of ' + total : total + ' ' + unit) + '</small></button>';
            }).join("");
          }

          $("#xStrand").innerHTML = names.map(function (nm) {
            const on = nm === strand;
            const chosen = strandsForTop[nm].filter(function (it) { return picked[it.id]; }).length;
            return '<button type="button" class="xstrand-btn' + (on ? " on" : "") + '" data-xstrand="' + UI.esc(nm) + '">' +
              UI.esc(nm.length > 14 && names.length > 4 ? (ix.labels[nm] || nm) : nm) +
              (chosen ? '<span class="xdot">' + chosen + '</span>' : "") + '</button>';
          }).join("");

          const items = strandsForTop[strand] || [];
          const allOn = items.length && items.every(function (it) { return picked[it.id]; });
          $("#xChips").innerHTML =
            items.map(function (it) { return chip(it, picked[it.id]); }).join("") +
            (items.length ? '<button type="button" class="xpick xpick-all" data-xall="1">' +
                            (allOn ? "Clear these" : "Select all " + items.length) + '</button>' : "");

          const n = nPicked();
          $("#xCount").textContent = n ? n + " selected" : "none selected yet";
          $("#xPicked").innerHTML = n
            ? Object.keys(picked).filter(function (k) { return picked[k]; }).map(function (id) {
                const inf = CHAPTER_INDEX[id];
                return '<span class="xtag" data-xdrop="' + id + '">' +
                  UI.esc(inf && inf.chapter ? inf.chapter.name : id) + ' <b>×</b></span>';
              }).join("")
            : '<span class="tiny faint">Pick the ' + unit + ' being examined — the planner uses them to decide what to put in front of you.</span>';

          wire();
        }

        function wire() {
          box.querySelectorAll("[data-xyear]").forEach(function (b2) {
            b2.onclick = function () { top = b2.dataset.xyear; strand = null; paint(); };
          });
          box.querySelectorAll("[data-xstrand]").forEach(function (b2) {
            b2.onclick = function () { strand = b2.dataset.xstrand; paint(); };
          });
          box.querySelectorAll("[data-xpick]").forEach(function (b2) {
            b2.onclick = function () {
              const id = b2.dataset.xpick;
              picked[id] = !picked[id];
              paint();
            };
          });
          const all = box.querySelector("[data-xall]");
          if (all) all.onclick = function () {
            const items = (ix.strands[top] || {})[strand] || [];
            const allOn = items.every(function (it) { return picked[it.id]; });
            items.forEach(function (it) { picked[it.id] = !allOn; });
            paint();
          };
          box.querySelectorAll("[data-xdrop]").forEach(function (b2) {
            b2.onclick = function () { delete picked[b2.dataset.xdrop]; paint(); };
          });
        }

        paint();

        box.querySelector("#xSave").onclick = function () {
          const title = box.querySelector("#xTitle").value.trim();
          const date = box.querySelector("#xDate").value;
          if (!date) { UI.toast("Pick the date of the exam", "bad"); return; }
          const ids = Object.keys(picked).filter(function (k) { return picked[k]; });

          const out = {
            id: rec.id || ("x" + Date.now().toString(36)),
            title: title || "Exam",
            date: date,
            kind: "topic",
            chapterIds: ids,
            minutes: UI.num(box.querySelector("#xMins").value, null),
            total: UI.num(box.querySelector("#xTotal").value, null),
            /* no score yet: it is logged before it is sat */
            scoreMode: rec.scoreMode || null,
            mark: rec.mark != null ? rec.mark : null,
            grade: rec.grade || null,
            awaiting: true
          };
          SchoolAssessments.save(out);
          if (typeof Scheduler !== "undefined") Scheduler.regenerate("exam logged");
          UI.closeModal();
          UI.toast("Logged " + out.title + " for " + Metrics.fmtDate(date, { day: "numeric", month: "long" }) +
                   ". Add your score when it comes back.", "ok", 6000);
          App.go("assessments");
        };
      }
    });
  }

  /* Tests logged but not yet scored, soonest first. */
  function awaiting() {
    return (Store.get().schoolAssessments || [])
      .filter(function (a) { return a.awaiting && a.mark == null && !a.grade; })
      .sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); });
  }

  function nextUp() {
    const today = Metrics.today();
    return awaiting().filter(function (a) { return (a.date || "") >= today; })[0] || null;
  }

  return { open: open, awaiting: awaiting, nextUp: nextUp };
})();
