/* ============================================================
Reports & Ideas — the tab where what is wrong goes.

   Two lists, one screen. Open things first, because a list of
   things you have already dealt with is not a to-do list. Every
   entry can be copied as text or turned into a GitHub issue with
   one click, and a question report carries the reference needed
   to find that question again.

   Why nothing is sent automatically: see the comment at the top
   of js/reports.js. The short version is that there is no server
   behind this app to send it to, and a button that pretends
   otherwise is worse than no button.
   ============================================================ */

const ReportsView = (function () {

  let filter = "open";

  function kindChip(k) {
    const m = Reports.KINDS[k] || { label: k };
    return '<span class="pill">' + UI.esc(m.label) + '</span>';
  }

  function card(r) {
    const done = r.status === "done";
    return '<div class="rep' + (done ? " done" : "") + '">' +
      '<div class="rep-head">' +
        '<div style="flex:1;min-width:0">' +
          '<b>' + UI.esc(r.title || "(no title)") + '</b>' +
          '<div class="tiny muted" style="margin-top:3px">' +
            new Date(r.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
            (r.subject ? ' · ' + UI.esc(r.subject) : "") +
            (r.where ? ' · ' + UI.esc(r.where) : "") +
          '</div>' +
        '</div>' +
        kindChip(r.kind) +
      '</div>' +
      (r.detail ? '<div class="rep-detail">' + UI.esc(r.detail) + '</div>' : "") +
      (r.ref ? '<div class="rep-ref tiny">' + UI.esc(Reports.refLine(r.ref)) + '</div>' : "") +
      '<div class="row wrap" style="gap:7px;margin-top:10px">' +
        '<button class="btn btn-sm" data-action="rep-copy" data-id="' + r.id + '">Copy as text</button>' +
        '<a class="btn btn-sm" href="' + Reports.issueUrl(r) + '" target="_blank" rel="noopener">' +
          'Open a GitHub issue</a>' +
        '<button class="btn btn-sm" data-action="rep-toggle" data-id="' + r.id + '">' +
          (done ? "Reopen" : "Mark done") + '</button>' +
        '<button class="btn btn-sm btn-danger" data-action="rep-delete" data-id="' + r.id + '">Delete</button>' +
      '</div>' +
    '</div>';
  }

  function render(root) {
    const all = Reports.all();
    const open = all.filter(function (r) { return r.status !== "done"; });
    const done = all.filter(function (r) { return r.status === "done"; });
    const list = filter === "done" ? done : open;

    root.innerHTML =
      '<div class="card">' +
        '<div class="card-head"><h2>Reports &amp; ideas</h2>' +
          '<div class="right">' +
            '<button class="btn btn-primary" data-action="rep-new">+ New report</button>' +
          '</div>' +
        '</div>' +
        '<p class="muted" style="margin-top:0">Something wrong with a question, a mark scheme that ' +
          'does not match, a bug, or an idea for what this should do next. Everything here stays ' +
          'on this device until you send it: copy it as text, or open it as an issue on ' +
          '<span class="tiny faint">' + UI.esc(Reports.repo) + '</span>, which is where a fix has ' +
          'to be made anyway.</p>' +
        '<div class="row wrap" style="gap:7px">' +
          '<button class="chip' + (filter === "open" ? " on" : "") + '" data-action="rep-filter" data-val="open">' +
            'Open (' + open.length + ')</button>' +
          '<button class="chip' + (filter === "done" ? " on" : "") + '" data-action="rep-filter" data-val="done">' +
            'Done (' + done.length + ')</button>' +
        '</div>' +
      '</div>' +

      (list.length
        ? '<div class="rep-list">' + list.map(card).join("") + '</div>'
        : '<div class="card" style="margin-top:14px"><div class="empty">' +
            (filter === "done"
              ? 'Nothing marked done yet.'
              : 'Nothing reported. The <b>Report a problem</b> button on a question fills most of ' +
                'this in for you — which question, which pages, which scheme — so use that one where ' +
                'you can.') +
          '</div></div>');
  }

  /* ---------- the form ---------- */

  /* Opened from anywhere. `pre` carries what the caller already knows:
     the question being looked at, the view it came from. Everything in
     here is wired in onMount, because ui.js stops clicks inside a modal
     from reaching the document. */
  function compose(pre) {
    pre = pre || {};
    const kinds = Object.keys(Reports.KINDS);
    UI.modal({
      title: "Report something",
      body:
        '<label class="lbl">What kind</label>' +
        '<div class="row wrap" style="gap:7px;margin-bottom:12px" id="repKind">' +
          kinds.map(function (k, i) {
            const on = pre.kind ? k === pre.kind : i === 0;
            return '<button class="chip' + (on ? " on" : "") + '" data-k="' + k + '">' +
              UI.esc(Reports.KINDS[k].label) + '</button>';
          }).join("") +
        '</div>' +
        (pre.ref
          ? '<div class="warnbox info" style="margin-bottom:12px"><b>About this question</b>' +
              UI.esc(Reports.refLine(pre.ref)) + '</div>'
          : "") +
        '<label class="lbl">In one line</label>' +
        '<input class="input" id="repTitle" placeholder="The mark scheme is for a different question" ' +
          'value="' + UI.esc(pre.title || "") + '">' +
        '<label class="lbl" style="margin-top:12px">What happened, or what should it do</label>' +
        '<textarea class="input" id="repDetail" rows="5" ' +
          'placeholder="What you did, what you expected, what you got."></textarea>',
      footer:
        '<button class="btn" data-modal-close>Cancel</button>' +
        '<button class="btn btn-primary" id="repSave">Save it</button>',
      onMount: function (box) {
        let kind = pre.kind || kinds[0];
        box.querySelectorAll("#repKind .chip").forEach(function (c) {
          c.onclick = function () {
            box.querySelectorAll("#repKind .chip").forEach(function (x) { x.classList.remove("on"); });
            c.classList.add("on");
            kind = c.dataset.k;
          };
        });
        box.querySelector("#repSave").onclick = function () {
          const title = box.querySelector("#repTitle").value.trim();
          const detail = box.querySelector("#repDetail").value.trim();
          if (!title && !detail) { UI.toast("Say what is wrong first", "bad"); return; }
          Reports.add({
            kind: kind, title: title || detail.slice(0, 70),
            detail: detail, where: pre.where || null, ref: pre.ref || null
          });
          UI.closeModal();
          UI.toast("Saved. It is in Reports & ideas.", "ok");
          App.render();
        };
      }
    });
  }

  function handle(action, el) {
    switch (action) {
      /* `where` and `kind` are optional: a button anywhere in the app can
         say which screen it was pressed on without knowing anything else
         about how a report is stored. */
      case "rep-new": compose({ where: el.dataset.where || null, kind: el.dataset.kind || null }); return true;
      case "rep-filter": filter = el.dataset.val; App.render(); return true;

      /* Reporting a question, from wherever that question is on screen.
         The caller passes the id and the bank it is in; everything else
         is looked up here so no view has to know the shape of a report. */
      case "rep-question": {
        const id = el.dataset.id;
        const bank = (typeof MATHS_EXAM_QUESTIONS !== "undefined" ? MATHS_EXAM_QUESTIONS : [])
          .concat(typeof AS_MATHS_EXAM_QUESTIONS !== "undefined" ? AS_MATHS_EXAM_QUESTIONS : [])
          .concat(typeof ECO_QUESTIONS !== "undefined" ? ECO_QUESTIONS : []);
        const q = bank.filter(function (x) { return x.id === id; })[0];
        compose({
          kind: el.dataset.kind || "question",
          where: el.dataset.where || null,
          ref: Reports.refFor(q, q ? null : { questionId: id })
        });
        return true;
      }

      case "rep-copy": {
        const r = Reports.all().filter(function (x) { return x.id === el.dataset.id; })[0];
        if (!r) return true;
        const text = Reports.asText(r);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text)
            .then(function () { UI.toast("Copied", "ok"); })
            .catch(function () { UI.toast("Could not copy — select it by hand", "bad"); });
        } else {
          UI.modal({ title: "Copy this", body: '<textarea class="input" rows="12">' + UI.esc(text) + '</textarea>' });
        }
        return true;
      }

      case "rep-toggle": {
        const r = Reports.all().filter(function (x) { return x.id === el.dataset.id; })[0];
        if (r) Reports.update(r.id, { status: r.status === "done" ? "open" : "done" });
        App.render(); return true;
      }

      case "rep-delete": {
        const id = el.dataset.id;
        UI.confirm("Delete this report?",
          "It is only on this device, so this is the end of it.",
          "Delete", true).then(function (yes) {
            if (!yes) return;
            Reports.remove(id);
            App.render();
          });
        return true;
      }
    }
    return false;
  }

  return { render: render, handle: handle, compose: compose };
})();
