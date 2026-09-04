/* ============================================================
   Reviewing a school test

   A mark out of fifty tells the planner how you did. It does not
   tell it what to do about it. This does: you type the questions
   you lost marks on, and each one gets pinned to a topic, so the
   test stops being a number and becomes a list of things to go
   back to.

   Typing the question is the whole input. Picking the topic from
   a list of ninety-three every time is exactly the friction that
   stops a review from happening, so the topic is recognised from
   what you typed (see topic-recognise.js) and offered for
   confirmation. It is offered rather than assumed: the recogniser
   is right about eight times in ten, and a wrong topic quietly
   filed is worse than no review at all.

   The errors are stored on the assessment itself and read back by
   Metrics.recurringErrors, which is what Weaknesses is built from,
   so a test review lands in the same place a past-paper review
   does and needs no separate screen to be worth anything.
   ============================================================ */

const TestReview = (function () {

  /* What tends to go wrong depends on the subject. Losing marks to
     "no evaluation" is an Economics failure mode and means nothing in
     Mechanics; "algebra error" is the reverse. */
  const TYPES = {
    maths: ["Knowledge gap", "Method error", "Algebra error", "Calculator error",
            "Misread question", "Time pressure", "Careless mistake"],
    economics: ["Knowledge gap", "No evaluation", "Weak application", "No diagram",
                "Vague definition", "Misread question", "Time pressure"],
    geography: ["Knowledge gap", "No case study detail", "Weak evaluation",
                "Did not answer the question", "Misread question", "Time pressure"]
  };

  function types() {
    return TYPES[Subjects.currentId()] || TYPES.maths;
  }

  function errorsOf(a) { return (a && a.errors) || []; }

  /* ---------- the modal ---------- */
  function open(id) {
    const a = SchoolAssessments.get(id);
    if (!a) return;
    let errors = errorsOf(a).slice();
    let cands = [];            // current topic suggestions
    let chosenTopic = null;

    const body =
      '<div class="rv-intro tiny faint">Type or paste a question you dropped marks on. ' +
      'The topic is worked out from what you type — check it is right before you add it.</div>' +

      '<div class="field"><label class="label">The question you got wrong</label>' +
      '<textarea class="input rv-q" id="rvText" rows="3" ' +
      'placeholder="e.g. Explain how a rise in interest rates affects aggregate demand"></textarea></div>' +

      '<div id="rvTopic"></div>' +

      '<div class="form-grid" style="margin-top:4px">' +
        '<div class="field"><label class="label">Marks lost <span class="faint">optional</span></label>' +
        '<input class="input" type="number" min="0" id="rvMarks" placeholder="e.g. 4"></div>' +
        '<div class="field"><label class="label">Why did you lose them?</label>' +
        '<select class="input" id="rvType">' +
        types().map(function (t) { return '<option>' + UI.esc(t) + '</option>'; }).join("") +
        '</select></div>' +
      '</div>' +

      '<div class="row" style="justify-content:flex-end;margin-bottom:14px">' +
      '<button class="btn btn-primary btn-sm" id="rvAdd">Add this question</button></div>' +

      '<div class="section-label">Logged so far</div><div id="rvList"></div>';

    UI.modal({
      title: "Review: " + a.title,
      wide: true,
      body: body,
      footer: '<button class="btn" data-modal-close>Cancel</button>' +
              '<button class="btn btn-primary" id="rvSave">Save the review</button>',
      onMount: function (box) {
        const $ = function (s) { return box.querySelector(s); };
        const text = $("#rvText");

        /* Recognition runs as you type, but only once you have written
           enough for it to mean anything — three words in, every topic
           still looks plausible and the chips flicker. */
        function suggest() {
          const t = text.value.trim();
          const host = $("#rvTopic");
          if (t.split(/\s+/).length < 4) {
            cands = []; chosenTopic = null;
            host.innerHTML = '<div class="rv-hint tiny faint">Keep typing — the topic appears once there is enough to go on.</div>';
            return;
          }
          cands = TopicRecognise.match(t, 3);
          if (!cands.length) {
            chosenTopic = null;
            host.innerHTML = '<div class="rv-hint tiny faint">No topic matched that. Pick one below.</div>' + picker();
            wirePicker();
            return;
          }
          if (!chosenTopic || !cands.some(function (c) { return c.id === chosenTopic; })) {
            chosenTopic = cands[0].id;
          }
          host.innerHTML =
            '<div class="rv-label tiny">' + (cands[0].confident ? "This looks like" : "Best guess — check it") + '</div>' +
            '<div class="rv-cands">' + cands.map(function (c) {
              return '<button type="button" class="rv-cand' + (c.id === chosenTopic ? " on" : "") + '" data-rv="' + c.id + '">' +
                (c.code ? '<span class="rv-code">' + UI.esc(c.code) + '</span>' : "") +
                '<span class="rv-name">' + UI.esc(c.name) + '</span>' +
                '<span class="rv-sec tiny">' + UI.esc(c.section) + '</span></button>';
            }).join("") + '</div>' + picker();
          wirePicker();
          box.querySelectorAll("[data-rv]").forEach(function (b) {
            b.onclick = function () { chosenTopic = b.dataset.rv; suggest(); };
          });
        }

        /* The escape hatch: every subtopic, for when the guess is wrong
           and none of the three offered are right either. */
        function picker() {
          return '<select class="input rv-all" id="rvAll"><option value="">or choose the topic yourself…</option>' +
            SPEC.map(function (sp) {
              return '<optgroup label="' + UI.esc(sp.short) + '">' + sp.sections.map(function (sec) {
                return (sec.subs || []).map(function (sub) {
                  return '<option value="' + sub.id + '"' + (sub.id === chosenTopic ? " selected" : "") + '>' +
                    UI.esc((sub.code ? sub.code + " " : "") + sub.name) + '</option>';
                }).join("");
              }).join("") + '</optgroup>';
            }).join("") + '</select>';
        }

        function wirePicker() {
          const sel = $("#rvAll");
          if (!sel) return;
          sel.onchange = function () {
            if (!this.value) return;
            chosenTopic = this.value;
            const inf = Store.info(chosenTopic);
            cands = [{ id: chosenTopic, name: inf.sub.name, code: inf.sub.code || "",
                       section: inf.section.name }];
            suggest();
          };
        }

        function drawList() {
          const host = $("#rvList");
          if (!errors.length) {
            host.innerHTML = '<div class="tiny faint">Nothing added yet. Each question you add becomes a weakness on the topic it came from.</div>';
            return;
          }
          host.innerHTML = errors.map(function (e, i) {
            const inf = e.topicId ? Store.info(e.topicId) : null;
            return '<div class="rv-row">' +
              '<div class="rv-row-main">' +
                '<div class="rv-row-q">' + UI.esc(e.q || "(no question text)") + '</div>' +
                '<div class="rv-row-meta tiny">' +
                  (inf ? '<span class="pill">' + UI.esc((inf.sub.code ? inf.sub.code + " " : "") + inf.sub.name) + '</span>' :
                         '<span class="pill warn">no topic</span>') +
                  '<span class="faint">' + UI.esc(e.type || "") + '</span>' +
                  (e.marks ? '<span class="faint">−' + e.marks + ' mark' + (e.marks > 1 ? "s" : "") + '</span>' : "") +
                '</div>' +
              '</div>' +
              '<button class="btn btn-sm btn-ghost" data-rvdrop="' + i + '">✕</button></div>';
          }).join("");
          host.querySelectorAll("[data-rvdrop]").forEach(function (b) {
            b.onclick = function () { errors.splice(+b.dataset.rvdrop, 1); drawList(); };
          });
        }

        let timer = null;
        text.addEventListener("input", function () {
          clearTimeout(timer);
          timer = setTimeout(suggest, 180);
        });

        $("#rvAdd").onclick = function () {
          const q = text.value.trim();
          if (!q) { UI.toast("Type the question first", "bad"); return; }
          if (!chosenTopic) { UI.toast("Pick the topic it came from", "bad"); return; }
          errors.push({
            q: q, topicId: chosenTopic,
            marks: UI.num($("#rvMarks").value, 0) || 0,
            type: $("#rvType").value
          });
          text.value = ""; $("#rvMarks").value = "";
          chosenTopic = null; cands = [];
          suggest(); drawList();
          text.focus();
        };

        $("#rvSave").onclick = function () {
          const rec = SchoolAssessments.get(id);
          rec.errors = errors;
          SchoolAssessments.save(rec);
          if (typeof Scheduler !== "undefined") Scheduler.regenerate("test reviewed");
          UI.closeModal();
          UI.toast(errors.length
            ? "Review saved — " + errors.length + " question" + (errors.length > 1 ? "s" : "") +
              " added to your weaknesses."
            : "Review saved.", "ok", 5000);
          App.render();
        };

        suggest(); drawList();
      }
    });
  }

  /* Everything logged in a test review, flattened, for the metrics that
     already know how to read past-paper errors. */
  function allErrors() {
    const out = [];
    (Store.get().schoolAssessments || []).forEach(function (a) {
      errorsOf(a).forEach(function (e) {
        out.push({ topicId: e.topicId, marks: e.marks, type: e.type, q: e.q,
                   source: a.id, sourceTitle: a.title });
      });
    });
    return out;
  }

  function countFor(a) { return errorsOf(a).length; }

  return { open: open, allErrors: allErrors, countFor: countFor, types: types };
})();
