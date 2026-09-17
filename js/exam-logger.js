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

  /* The chapter grid, the year and paper rows and the search box all live
     in ChapterPicker, shared with the school-assessment modal so that
     "which chapters?" is answered the same way wherever it is asked. */

  /* ---------- the modal ---------- */
  function open(existing) {
    const rec = existing || {};
    let picker = null;              // set once the modal is in the document

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

      ChapterPicker.html({ heading: "What does it cover?" });

    UI.modal({
      title: existing ? "Edit this test" : "Log an exam",
      wide: true,
      body: body,
      /* An exam you have logged can be changed or called off. Without a way
         to delete one, a test that moved or was cancelled sat in the stack
         for ever, counting down and pulling its chapters up the plan. */
      footer: (existing && existing.id
                ? '<button class="btn btn-danger" id="xDelete">Delete</button>'
                : '') +
              '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="xSave">Save the exam</button>',
      onMount: function (box) {
        const del = box.querySelector("#xDelete");
        if (del) del.onclick = function () {
          UI.confirm("Delete this exam?",
            "It comes off the dashboard and the planner stops working towards it. " +
            "Nothing you have already revised is affected.",
            "Delete it", true).then(function (ok) {
              if (!ok) return;
              SchoolAssessments.remove(existing.id);
              UI.closeModal();
              if (typeof Scheduler !== "undefined") Scheduler.regenerate("an exam was deleted");
              UI.toast("Exam deleted", "ok");
              App.render();
            });
        };
        picker = ChapterPicker.mount(box, { selected: (rec.chapterIds || []).slice() });

        box.querySelector("#xSave").onclick = function () {
          const title = box.querySelector("#xTitle").value.trim();
          const date = box.querySelector("#xDate").value;
          if (!date) { UI.toast("Pick the date of the exam", "bad"); return; }
          const ids = picker.get();

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
