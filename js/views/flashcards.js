/* ============================================================
Flashcards, the formulae and facts you have to recall cold.

   Two things make this different from a generic deck:
     1. Every card says whether the formula is GIVEN in the Edexcel
        AS formulae booklet or has to be memorised. Learning things
        you are handed in the exam is wasted effort.
     2. Decks are per chapter, so they line up with the revision
        method rather than being one undifferentiated pile.

        Quizlet moves in and out as plain text, that is what Quizlet's
   own import and export use, and it needs no account or API.
   ============================================================ */

const FlashcardsView = (function () {

  let openChapter = null; // chapter being studied, or null for the index
  let idx = 0; // position in the current deck
  let flipped = false;
  let filter = "all"; // all | memorise | unknown
  let order = null; // shuffled index list, or null for spec order

  /* ---------- progress ---------- */
  function known(cid) {
    const p = Store.get().cardProgress || {};
    return (p[cid] && p[cid].known) || [];
  }
  function isKnown(cid, i) { return known(cid).indexOf(i) >= 0; }
  function setKnown(cid, i, on) {
    Store.mutate(function (st) {
      if (!st.cardProgress) st.cardProgress = {};
      if (!st.cardProgress[cid]) st.cardProgress[cid] = { known: [] };
      const arr = st.cardProgress[cid].known;
      const at = arr.indexOf(i);
      if (on && at < 0) arr.push(i);
      if (!on && at >= 0) arr.splice(at, 1);
    });
  }

  /* ---------- deck building ---------- */
  function deck(cid) {
    const all = cardsForChapter(cid);
    let ids = all.map(function (_, i) { return i; });
    if (filter === "memorise") ids = ids.filter(function (i) { return !all[i].given; });
    if (filter === "unknown") ids = ids.filter(function (i) { return !isKnown(cid, i); });
    if (order) ids = order.filter(function (i) { return ids.indexOf(i) >= 0; });
    return { all: all, ids: ids };
  }

  /* ---------- render ---------- */
  function render(root) {
    root.innerHTML = openChapter ? study(openChapter) : index();
  }

  function index() {
    const chapters = flashcardChapters();
    const totalCards = chapters.reduce(function (n, c) { return n + cardsForChapter(c).length; }, 0);
    const totalKnown = chapters.reduce(function (n, c) { return n + known(c).length; }, 0);
    const groups = { Pure: [], Stats: [], Mech: [] };
    chapters.forEach(function (cid) { groups[CHAPTER_INDEX[cid].paper.short].push(cid); });
    const label = { Pure: "Paper 1: Pure Mathematics", Stats: "Paper 2: Statistics", Mech: "Paper 2: Mechanics" };

    return '<div class="card" style="margin-bottom:18px">' +
        '<div class="row wrap" style="gap:14px">' +
          '<div style="flex:1;min-width:230px">' +
            '<b>' + totalCards + ' formula flashcards, filed by chapter</b>' +
            '<div class="tiny muted" style="margin-top:4px">Written from the 8MA0 specification. Each card tells you whether ' +
            'the formula is <b>given to you in the exam</b> or whether you have to learn it, so you are not wasting ' +
            'time memorising things they hand you on the day.</div>' +
          '</div>' +
          '<div style="text-align:right">' + UI.accPill(totalCards ? Math.round(totalKnown / totalCards * 100) : 0) +
            '<div class="tiny faint" style="margin-top:5px">' + totalKnown + ' / ' + totalCards + ' marked known</div></div>' +
        '</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:14px">' +
          '<button class="btn btn-primary" data-action="fc-study-all">Study everything</button>' +
          '<button class="btn" data-action="fc-weak">Study what I do not know</button>' +
          '<div class="spacer"></div>' +
          '<button class="btn btn-sm" data-action="fc-export">Export to Quizlet</button>' +
          '<button class="btn btn-sm" data-action="fc-import">Import from Quizlet</button>' +
        '</div>' +
      '</div>' +
      ["Pure", "Stats", "Mech"].map(function (p) {
        if (!groups[p].length) return "";
        return '<div class="section-label">' + label[p] + '</div>' +
          '<div class="fc-grid">' + groups[p].map(chapterCard).join("") + '</div>';
      }).join("");
  }

  function chapterCard(cid) {
    const inf = CHAPTER_INDEX[cid];
    const cards = cardsForChapter(cid);
    const k = known(cid).length;
    const pct = cards.length ? Math.round(k / cards.length * 100) : 0;
    const mustLearn = cards.filter(function (c) { return !c.given; }).length;
    return '<button class="fc-chapter" data-action="fc-open" data-id="' + UI.esc(cid) + '">' +
      '<div class="row" style="gap:8px">' +
        '<b class="fc-ch-name">Ch ' + UI.esc(inf.chapter.num) + ' · ' + UI.esc(inf.chapter.name) + '</b>' +
        '<div class="spacer"></div>' +
        '<span class="pill' + (pct === 100 ? " good" : "") + '">' + k + '/' + cards.length + '</span>' +
      '</div>' +
      UI.bar(pct, "thin") +
      '<div class="tiny faint" style="margin-top:6px">' + mustLearn + ' to memorise' +
        (cards.length - mustLearn ? ' · ' + (cards.length - mustLearn) + ' given in the booklet' : "") + '</div>' +
    '</button>';
  }

  /* ---------- study mode ---------- */
  function study(cid) {
    const inf = CHAPTER_INDEX[cid];
    const d = deck(cid);
    if (!d.ids.length) {
      return backBar(cid) +
        UI.empty("✓", "Nothing left in this filter",
          filter === "unknown" ? "You have marked every card in this chapter as known." : "Try a different filter.") +
        '<div class="row" style="justify-content:center"><button class="btn btn-primary" data-action="fc-filter" data-val="all">Show all cards</button></div>';
    }
    const pos = Math.min(idx, d.ids.length - 1);
    const i = d.ids[pos];
    const card = d.all[i];
    const isOwn = i >= (FLASHCARDS[cid.replace(CHAPTER_PREFIX, "")] || []).length;

    return backBar(cid) +
      '<div class="row wrap" style="gap:8px;margin-bottom:14px">' +
        chip("all", "All (" + d.all.length + ")") +
        chip("memorise", "Must memorise") +
        chip("unknown", "Not yet known") +
        '<div class="spacer"></div>' +
        '<button class="btn btn-sm" data-action="fc-shuffle">' + UI.icon("refresh") + (order ? "Shuffled" : "Shuffle") + '</button>' +
      '</div>' +

      '<div class="fc-stage">' +
        '<div class="fc-progress"><span style="width:' + ((pos + 1) / d.ids.length * 100).toFixed(1) + '%"></span></div>' +
        '<div class="tiny faint fc-count">Card ' + (pos + 1) + ' of ' + d.ids.length + '</div>' +

        '<div class="fc-card' + (flipped ? " flipped" : "") + '" data-action="fc-flip">' +
          '<div class="fc-face fc-front">' +
            (card.given ? '<span class="fc-tag given">Given in the booklet</span>'
                        : '<span class="fc-tag">Must memorise</span>') +
            (isOwn ? '<span class="fc-tag own">Yours</span>' : "") +
            '<div class="fc-q">' + UI.math(card.q) + '</div>' +
            '<div class="fc-hint tiny faint">Click to reveal</div>' +
          '</div>' +
          '<div class="fc-face fc-back">' +
            '<div class="fc-a">' + UI.math(card.a) + '</div>' +
            (card.svg && FLASHCARD_SVGS[card.svg] ? sketch(card.svg) : "") +
            '<div class="fc-hint tiny faint">Click to flip back</div>' +
          '</div>' +
        '</div>' +

        '<div class="fc-controls">' +
          '<button class="btn" data-action="fc-prev"' + (pos === 0 ? " disabled" : "") + '>← Back</button>' +
          '<button class="btn btn-danger-soft" data-action="fc-mark" data-id="' + UI.esc(cid) + '" data-n="' + i + '" data-known="0">Still learning</button>' +
          '<button class="btn btn-primary" data-action="fc-mark" data-id="' + UI.esc(cid) + '" data-n="' + i + '" data-known="1">' + UI.icon("check") + 'Got it</button>' +
          '<button class="btn" data-action="fc-next"' + (pos >= d.ids.length - 1 ? " disabled" : "") + '>Next →</button>' +
        '</div>' +
        (isKnown(cid, i) ? '<div class="tiny" style="text-align:center;color:var(--green);margin-top:8px">' + UI.icon("check") + 'Marked as known</div>' : "") +
      '</div>' +

      '<div class="row wrap" style="gap:8px;margin-top:16px;justify-content:center">' +
        '<button class="btn btn-sm" data-action="open-chapter" data-id="' + UI.esc(cid) + '">Open Chapter ' + UI.esc(inf.chapter.num) + '</button>' +
        '<button class="btn btn-sm" data-action="fc-add" data-id="' + UI.esc(cid) + '">+ Add your own card</button>' +
        '<button class="btn btn-sm" data-action="fc-export" data-id="' + UI.esc(cid) + '">Export this chapter</button>' +
        '<button class="btn btn-sm" data-action="fc-import" data-id="' + UI.esc(cid) + '">Import into this chapter</button>' +
      '</div>';
  }

  function sketch(key) {
    return '<svg class="fc-sketch" viewBox="0 0 80 68" aria-hidden="true">' +
      '<line class="ax" x1="4" y1="34" x2="76" y2="34"/>' +
      '<line class="ax" x1="40" y1="4" x2="40" y2="64"/>' +
      '<path class="cv" d="' + FLASHCARD_SVGS[key] + '"/>' +
    '</svg>';
  }

  function backBar(cid) {
    return '<button class="btn btn-sm btn-ghost" data-action="fc-close" style="margin-bottom:14px">← All flashcard decks</button>' +
      '<div class="assess-path" style="margin-bottom:4px">' + UI.esc(CHAPTER_INDEX[cid].paper.short) +
      ' · Chapter ' + UI.esc(CHAPTER_INDEX[cid].chapter.num) + '</div>' +
      '<h2 style="font-size:22px;margin:0 0 14px">' + UI.esc(CHAPTER_INDEX[cid].chapter.name) + '</h2>';
  }

  function chip(v, label) {
    return '<button class="chip' + (filter === v ? " on" : "") + '" data-action="fc-filter" data-val="' + v + '">' +
      UI.esc(label) + '</button>';
  }

  /* ---------- actions ---------- */
  function handle(action, el) {
    switch (action) {
      case "fc-open":
        openChapter = el.dataset.id; idx = 0; flipped = false; order = null;
        App.render(); return true;
      case "fc-close":
        openChapter = null; order = null; App.render(); return true;
      case "fc-flip":
        flipped = !flipped; App.render(); return true;
      case "fc-next":
        idx++; flipped = false; App.render(); return true;
      case "fc-prev":
        idx = Math.max(0, idx - 1); flipped = false; App.render(); return true;
      case "fc-filter":
        filter = el.dataset.val; idx = 0; flipped = false; App.render(); return true;
      case "fc-shuffle": {
        const n = cardsForChapter(openChapter).length;
        const a = []; for (let i = 0; i < n; i++) a.push(i);
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const t = a[i]; a[i] = a[j]; a[j] = t;
        }
        order = a; idx = 0; flipped = false; App.render(); return true;
      }
      case "fc-mark": {
        setKnown(el.dataset.id, +el.dataset.n, el.dataset.known === "1");
        const d = deck(el.dataset.id);
        if (idx < d.ids.length - 1) idx++;
        flipped = false;
        App.render(); return true;
      }
      case "fc-study-all": {
        const list = flashcardChapters();
        if (list.length) { openChapter = list[0]; idx = 0; filter = "all"; flipped = false; App.render(); }
        return true;
      }
      case "fc-weak": {
        const list = flashcardChapters().filter(function (c) {
          return known(c).length < cardsForChapter(c).length;
        });
        if (!list.length) { UI.toast("You have marked every card as known", "ok"); return true; }
        openChapter = list[0]; idx = 0; filter = "unknown"; flipped = false;
        App.render(); return true;
      }
      case "fc-export": App.flashcardExportModal(el.dataset.id || null); return true;
      case "fc-import": App.flashcardImportModal(el.dataset.id || openChapter || null); return true;
      case "fc-add": App.flashcardAddModal(el.dataset.id); return true;
    }
    return false;
  }

  function openFor(cid) { openChapter = cid; idx = 0; flipped = false; }

  return { render: render, handle: handle, openFor: openFor };
})();
