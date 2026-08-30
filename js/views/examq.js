/* ============================================================
   Exam Questions — every topic question set, by chapter, opened
   inside the app. Mark schemes stay hidden until asked for.
   ============================================================ */

const ExamQView = (function () {

  let filter = "all";
  let openSet = null;      // set key currently expanded
  const msShown = {};      // set keys whose mark scheme is revealed

  function render(root) {
    const sets = allExamSets();
    const shown = sets.filter(function (s) { return filter === "all" || s.paper === filter; });
    const counts = { all: sets.length, Pure: 0, Stats: 0, Mech: 0 };
    sets.forEach(function (s) { counts[s.paper]++; });

    root.innerHTML =
      '<div class="card" style="margin-bottom:18px">' +
        '<div class="row wrap" style="gap:14px">' +
          '<div style="flex:1;min-width:220px">' +
            '<b>Edexcel topic questions</b>' +
            '<div class="tiny muted" style="margin-top:3px">' +
              sets.length + ' question sets with full mark schemes, filed by chapter. ' +
              'Everything opens here — nothing to download.</div>' +
          '</div>' +
          '<div class="chips">' +
            chip("all", "All (" + counts.all + ")") +
            chip("Pure", "Pure (" + counts.Pure + ")") +
            chip("Stats", "Statistics (" + counts.Stats + ")") +
            chip("Mech", "Mechanics (" + counts.Mech + ")") +
          '</div>' +
        '</div>' +
      '</div>' +
      byPaper(shown);
  }

  function chip(v, label) {
    return '<button class="chip' + (filter === v ? " on" : "") + '" data-action="eq-filter" data-val="' + v + '">' +
      UI.esc(label) + '</button>';
  }

  function byPaper(sets) {
    const groups = { Pure: [], Stats: [], Mech: [] };
    sets.forEach(function (s) { groups[s.paper].push(s); });
    const label = { Pure: "Paper 1 — Pure Mathematics", Stats: "Paper 2 — Statistics", Mech: "Paper 2 — Mechanics" };
    let out = "";
    ["Pure", "Stats", "Mech"].forEach(function (p) {
      if (!groups[p].length) return;
      out += '<div class="section-label">' + label[p] + '</div>' +
             '<div class="stack">' + groups[p].map(card).join("") + '</div>';
    });
    return out || UI.empty("▤", "No question sets match that filter");
  }

  function card(s) {
    const open = openSet === s.key;
    const shown = msShown[s.key];
    /* which chapters this set serves, and how far through them you are */
    const chapters = s.chapters.map(function (cid) {
      const inf = CHAPTER_INDEX[cid];
      const st = Journey.state(cid);
      return { cid: cid, num: inf.chapter.num, name: inf.chapter.name,
               rag: Metrics.effectiveRag(cid).rag, done: st.complete };
    });

    return '<div class="eq-card' + (open ? " open" : "") + '">' +
      '<div class="eq-head" data-action="eq-open" data-key="' + s.key + '">' +
        '<span class="eq-ico">' + UI.icon("paper") + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<b>' + UI.esc(s.name) + '</b>' +
          '<div class="eq-chaps">' + chapters.map(function (c) {
            return '<span class="eq-chap' + (c.done ? " done" : "") + '">' +
              UI.ragDot(c.rag) + 'Ch ' + UI.esc(c.num) + ' ' + UI.esc(c.name) + '</span>';
          }).join("") + '</div>' +
        '</div>' +
        '<span class="pill">questions + mark scheme</span>' +
        '<span class="qz-chev">' + (open ? "▾" : "▸") + '</span>' +
      '</div>' +
      (open ? '<div class="eq-body">' +
        '<div class="row wrap" style="gap:8px;margin-bottom:10px">' +
          (chapters.length === 1
            ? '<button class="btn btn-sm btn-primary" data-action="open-session" data-id="' + chapters[0].cid + '">' +
                'Revise ' + UI.esc(chapters[0].name) + '</button>'
            : "") +
          '<div class="spacer"></div>' +
        '</div>' +
        '<div class="pdf-frame" style="height:min(72vh,820px)">' +
          '<div class="pdfv" data-src="' + s.qUrl + '"></div>' +
        '</div>' +
        (shown
          ? '<div class="qz-ms" style="margin-top:12px">' +
              '<div class="qz-ms-h">' + UI.icon("check") + 'Mark scheme — ' + UI.esc(s.name) + '</div>' +
              '<div class="pdf-frame" style="height:min(62vh,700px);border:0;border-radius:0">' +
                '<div class="pdfv" data-src="' + s.msUrl + '"></div>' +
              '</div></div>' +
            '<div class="row wrap" style="gap:8px;margin-top:10px">' +
              '<button class="btn" data-action="eq-ms-hide" data-key="' + s.key + '">Hide the mark scheme</button>' +
            '</div>'
          : '<div class="ms-lock" style="margin-top:12px">' +
              '<div class="ms-lock-ico">' + UI.icon("alert") + '</div>' +
              '<div><b>Mark scheme hidden</b>' +
              '<div class="tiny muted" style="margin-top:4px">Work through the questions first, then mark yourself honestly.</div></div>' +
              '<button class="btn btn-primary" data-action="eq-ms-reveal" data-key="' + s.key + '">Reveal mark scheme</button>' +
            '</div>') +
      '</div>' : "") +
    '</div>';
  }

  function handle(action, el) {
    switch (action) {
      case "eq-filter": filter = el.dataset.val; App.render(); return true;
      case "eq-open":
        openSet = (openSet === el.dataset.key) ? null : el.dataset.key;
        App.render(); return true;
      case "eq-ms-reveal": {
        const k = el.dataset.key;
        UI.confirm("Reveal the mark scheme?",
          "Only once you have worked through the questions. You can hide it again afterwards.",
          "Reveal it", false).then(function (ok) {
            if (!ok) return;
            msShown[k] = true; App.render();
          });
        return true;
      }
      case "eq-ms-hide": delete msShown[el.dataset.key]; App.render(); return true;
    }
    return false;
  }

  function openFor(setKey) { openSet = setKey; }

  return { render: render, handle: handle, openFor: openFor };
})();
