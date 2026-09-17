/* ============================================================
   Picking chapters, in one place.

   Two screens ask "which chapters did this cover?" — logging an exam and
   logging a school assessment — and they had grown apart: the exam logger
   had year and paper rows with tick chips, while the assessment modal was
   still a native <select> of forty-five options, half of which read
   "Ch 1", "Ch 2" twice over because two papers number from one.

   This is the exam logger's picker, lifted out whole and given a search
   box, so both screens select chapters the same way. The top row is the
   subject's own split — Year 1 / Year 2 for Maths, Physical / Human for
   Geography, nothing at all for Economics — and the second row is the
   paper within it.
   ============================================================ */

const ChapterPicker = (function () {

  /* Chapters indexed by the two things that actually narrow them down. */
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
      strands[top][st].push({ id: cid, num: inf.chapter.num, name: inf.chapter.name,
                              top: top, strand: st });
    });
    return { tops: tops, strands: strands, labels: labels };
  }

  function everyChapter(ix) {
    const out = [];
    ix.tops.forEach(function (t) {
      Object.keys(ix.strands[t] || {}).forEach(function (s) {
        (ix.strands[t][s] || []).forEach(function (it) { out.push(it); });
      });
    });
    return out;
  }

  function chip(it, on, withPath) {
    return '<button type="button" class="xpick' + (on ? " on" : "") + '" data-xpick="' + UI.esc(it.id) + '">' +
      (it.num ? '<b>' + UI.esc(String(it.num)) + '</b>' : "") + UI.esc(it.name) +
      (withPath ? '<small class="xpick-path">' + UI.esc(it.strand) + '</small>' : "") + '</button>';
  }

  /* ---------- markup ----------
     `id` namespaces the picker so two could sit on one page. */
  function html(opts) {
    opts = opts || {};
    const p = opts.id || "cp";
    const ix = index();
    return '<div class="chapter-picker" data-cp="' + p + '">' +
      '<div class="xhead">' +
        (opts.heading === false ? '<div></div>'
          : '<div class="section-label" style="margin:0">' + UI.esc(opts.heading || "What does it cover?") + '</div>') +
        '<div class="tiny faint" data-cp-count></div>' +
      '</div>' +
      '<input class="input cp-search" data-cp-search placeholder="' +
        UI.esc(opts.searchHint || ("Search " + (Subjects.current().unitPlural || "chapters") +
          " — " + (Subjects.current().pickerHint || "name, number or code"))) + '">' +
      (ix.tops.length > 1 ? '<div class="xyear" data-cp-year></div>' : "") +
      '<div class="xstrand" data-cp-strand></div>' +
      '<div class="xpick-row" data-cp-chips></div>' +
      '<div class="xpicked" data-cp-picked></div>' +
    '</div>';
  }

  /* ---------- behaviour ----------
     Returns a handle so the caller reads the selection when it saves, and
     can push a new one in (the assessment modal re-suggests chapters from
     the title as you type). */
  function mount(box, opts) {
    opts = opts || {};
    const host = box.querySelector(opts.id ? '[data-cp="' + opts.id + '"]' : ".chapter-picker");
    if (!host) return { get: function () { return []; }, set: function () {}, count: function () { return 0; } };

    const ix = index();
    const all = everyChapter(ix);
    const picked = {};
    (opts.selected || []).forEach(function (id) { picked[id] = true; });

    const multiTop = ix.tops.length > 1;
    const unit = Subjects.current().unitPlural || "chapters";
    let top = ix.tops[0] || "All";
    let strand = null;
    let query = "";

    const $ = function (sel) { return host.querySelector(sel); };
    const chosenIds = function () {
      return Object.keys(picked).filter(function (k) { return picked[k]; });
    };

    /* A search cuts across the year and paper rows: if you know the chapter
       is called "Binomial expansion" you should not have to work out which
       paper it sits in first. */
    function matches(it) {
      const inf = CHAPTER_INDEX[it.id] || {};
      const secs = (inf.chapter && inf.chapter.sections) || [];
      const hay = (it.name + " " + (it.num || "") + " " + it.strand + " " + it.top + " " +
                   (inf.chapterLabel || "") + " " +
                   secs.map(function (s) { return (s.code || "") + " " + (s.name || ""); }).join(" ")
                  ).toLowerCase();
      return hay.indexOf(query) >= 0;
    }

    function paint() {
      const searching = query.length > 0;
      const strandsForTop = ix.strands[top] || {};
      const names = Object.keys(strandsForTop);
      if (!strand || names.indexOf(strand) < 0) strand = names[0];

      const yearRow = $("[data-cp-year]"), strandRow = $("[data-cp-strand]");
      if (yearRow) yearRow.style.display = searching ? "none" : "";
      strandRow.style.display = searching ? "none" : "";

      if (multiTop && yearRow) {
        yearRow.innerHTML = ix.tops.map(function (t) {
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

      strandRow.innerHTML = names.map(function (nm) {
        const chosen = strandsForTop[nm].filter(function (it) { return picked[it.id]; }).length;
        return '<button type="button" class="xstrand-btn' + (nm === strand ? " on" : "") + '" data-xstrand="' + UI.esc(nm) + '">' +
          UI.esc(nm.length > 14 && names.length > 4 ? (ix.labels[nm] || nm) : nm) +
          (chosen ? '<span class="xdot">' + chosen + '</span>' : "") + '</button>';
      }).join("");

      const items = searching ? all.filter(matches) : (strandsForTop[strand] || []);
      const allOn = items.length && items.every(function (it) { return picked[it.id]; });
      $("[data-cp-chips]").innerHTML = items.length
        ? items.map(function (it) { return chip(it, picked[it.id], searching); }).join("") +
          '<button type="button" class="xpick xpick-all" data-xall="1">' +
            (allOn ? "Clear these" : "Select all " + items.length) + '</button>'
        : '<div class="tiny faint" style="padding:4px 2px">Nothing matches “' + UI.esc(query) + '”.</div>';

      const n = chosenIds().length;
      $("[data-cp-count]").textContent = n ? n + " selected" : "none selected yet";
      $("[data-cp-picked]").innerHTML = n
        ? chosenIds().map(function (id) {
            const inf = CHAPTER_INDEX[id];
            return '<span class="xtag" data-xdrop="' + UI.esc(id) + '">' +
              UI.esc(inf && inf.chapter ? inf.chapter.name : id) + ' <b>×</b></span>';
          }).join("")
        : '<span class="tiny faint">' + UI.esc(opts.emptyHint ||
            ("Pick the " + unit + " being examined — the planner uses them to decide what to put in front of you.")) + '</span>';

      wire();
      if (opts.onChange) opts.onChange(chosenIds());
    }

    function wire() {
      host.querySelectorAll("[data-xyear]").forEach(function (b) {
        b.onclick = function () { top = b.dataset.xyear; strand = null; paint(); };
      });
      host.querySelectorAll("[data-xstrand]").forEach(function (b) {
        b.onclick = function () { strand = b.dataset.xstrand; paint(); };
      });
      host.querySelectorAll("[data-xpick]").forEach(function (b) {
        b.onclick = function () { picked[b.dataset.xpick] = !picked[b.dataset.xpick]; paint(); };
      });
      const selectAll = host.querySelector("[data-xall]");
      if (selectAll) selectAll.onclick = function () {
        const items = query ? all.filter(matches) : ((ix.strands[top] || {})[strand] || []);
        const allOn = items.every(function (it) { return picked[it.id]; });
        items.forEach(function (it) { picked[it.id] = !allOn; });
        paint();
      };
      host.querySelectorAll("[data-xdrop]").forEach(function (b) {
        b.onclick = function () { delete picked[b.dataset.xdrop]; paint(); };
      });
    }

    /* paint() rebuilds everything below the search box and never the box
       itself, so the caret stays where it was as you type. */
    $("[data-cp-search]").addEventListener("input", function () {
      query = this.value.trim().toLowerCase();
      paint();
    });

    paint();

    return {
      get: chosenIds,
      set: function (ids) {
        Object.keys(picked).forEach(function (k) { delete picked[k]; });
        (ids || []).forEach(function (id) { picked[id] = true; });
        paint();
      },
      count: function () { return chosenIds().length; }
    };
  }

  return { html: html, mount: mount, index: index };
})();
