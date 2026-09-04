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

  /* Chapters grouped the way the subject is actually taught, so the picker
     reads like the course rather than a flat list of ids. */
  function groups() {
    const out = [];
    if (typeof CHAPTER_INDEX === "undefined") return out;
    Object.keys(CHAPTER_INDEX).forEach(function (cid) {
      const inf = CHAPTER_INDEX[cid];
      if (!inf || !inf.chapter) return;
      const paper = (inf.paper && (inf.paper.name || inf.paper.short)) || "Course";
      let g = out.filter(function (x) { return x.name === paper; })[0];
      if (!g) { g = { name: paper, items: [] }; out.push(g); }
      g.items.push({ id: cid, num: inf.chapter.num, name: inf.chapter.name });
    });
    return out;
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

    const gs = groups();
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

      '<div class="section-label" style="margin:18px 0 4px">What does it cover?</div>' +
      '<div class="tiny muted" style="margin-bottom:10px">Click the chapters being examined. ' +
        'The planner uses these to decide what to put in front of you between now and the day.</div>' +
      '<div class="xpick-wrap" id="xPick">' +
        gs.map(function (g) {
          return '<div class="xpick-group">' +
            '<div class="xpick-head"><span>' + UI.esc(g.name) + '</span>' +
              '<button type="button" class="btn btn-sm" data-xall="' + UI.esc(g.name) + '">Select all</button></div>' +
            '<div class="xpick-row">' + g.items.map(function (it) { return chip(it, picked[it.id]); }).join("") + '</div>' +
          '</div>';
        }).join("") +
      '</div>' +
      '<div class="tiny faint" id="xCount" style="margin-top:10px"></div>';

    UI.modal({
      title: existing ? "Edit this test" : "Log an exam",
      wide: true,
      body: body,
      footer: '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="xSave">Save the exam</button>',
      onMount: function (box) {
        const count = box.querySelector("#xCount");
        const tally = function () {
          const n = Object.keys(picked).filter(function (k) { return picked[k]; }).length;
          count.textContent = n ? n + " chapter" + (n === 1 ? "" : "s") + " selected"
                                : "No chapters selected yet — the planner will not know what to revise.";
        };
        tally();

        box.querySelectorAll("[data-xpick]").forEach(function (b) {
          b.onclick = function () {
            const id = b.dataset.xpick;
            picked[id] = !picked[id];
            b.classList.toggle("on", !!picked[id]);
            tally();
          };
        });
        box.querySelectorAll("[data-xall]").forEach(function (b) {
          b.onclick = function () {
            const row = b.closest(".xpick-group").querySelectorAll("[data-xpick]");
            /* one button both ways: select all, or clear them if all are on */
            const allOn = [].every.call(row, function (x) { return picked[x.dataset.xpick]; });
            row.forEach(function (x) {
              picked[x.dataset.xpick] = !allOn;
              x.classList.toggle("on", !allOn);
            });
            b.textContent = allOn ? "Select all" : "Clear";
            tally();
          };
        });

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
