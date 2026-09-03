/* ============================================================
My Topics, searchable/filterable topic browser + topic detail
   ============================================================ */

const TopicsView = (function () {

  const filters = { q: "", paper: "all", year: "all", rag: "all", status: "all", sort: "spec" };
  const openSections = {};

  /* ---------- list ---------- */
  function render(root) {
    const ids = Store.activeSubIds();
    const c = Metrics.coverage();

    root.innerHTML =
      '<div class="card" style="margin-bottom:18px">' +
        '<div class="row wrap" style="gap:10px">' +
          '<input class="input" id="topicSearch" placeholder="Search topics, e.g. binomial, suvat, hypothesis…" value="' + UI.esc(filters.q) + '" style="flex:1;min-width:220px">' +
          '<select class="input" data-filter="sort" style="width:auto">' +
            opt("spec", "Specification order", filters.sort) + opt("weak", "Weakest first", filters.sort) +
            opt("due", "Due for review first", filters.sort) + opt("acc", "Lowest accuracy first", filters.sort) +
          '</select>' +
          '<button class="btn btn-sm" data-action="add-custom-topic">+ Add topic</button>' +
        '</div>' +
        '<div class="row wrap" style="gap:16px;margin-top:12px">' +
          chipGroup("paper", ["all", "pure", "stats", "mech"], { all: "All papers", pure: "Pure", stats: "Statistics", mech: "Mechanics" }) +
          chipGroup("year", ["all", "1", "2"], { all: "Both years", "1": "Year 1", "2": "Year 2" }) +
          chipGroup("rag", ["all", "red", "amber", "green", "unrated"], { all: "All RAG", red: "🔴 Red", amber: "🟠 Amber", green: "🟢 Green", unrated: "Unrated" }) +
          chipGroup("status", ["all", "notstarted", "video", "questions", "covered", "due"],
            { all: "Any status", notstarted: "Not started", video: "Video done", questions: "Questions done", covered: "Covered", due: "Due for review" }) +
        '</div>' +
      '</div>' +
      '<div class="row wrap tiny muted" style="margin-bottom:12px">' +
        '<span>' + filtered(ids).length + ' of ' + ids.length + ' subtopics shown</span><div class="spacer"></div>' +
        '<span>' + c.covered + ' covered · ' + c.red + ' red · ' + c.amber + ' amber · ' + c.green + ' green</span>' +
      '</div>' +
      (Store.isFocus() ? byChapter(ids) : (filters.sort === "spec" ? bySection(ids) : flatList(filtered(ids))));

  }

  /* called by the delegated input handler in app.js */
  function setSearch(v) { filters.q = v; App.render(); }

  function opt(v, label, cur) { return '<option value="' + v + '"' + (cur === v ? " selected" : "") + '>' + label + '</option>'; }

  function chipGroup(key, values, labels) {
    return '<div class="chips">' + values.map(function (v) {
      return '<button class="chip' + (filters[key] === v ? " on" : "") + '" data-action="filter" data-key="' + key + '" data-val="' + v + '">' + labels[v] + '</button>';
    }).join("") + '</div>';
  }

  function filtered(ids) {
    const q = filters.q.trim().toLowerCase();
    return ids.filter(function (id) {
      const inf = Store.info(id), t = Store.topic(id);
      if (filters.paper !== "all" && inf.paper.id !== filters.paper) return false;
      if (!yearPasses(inf.year || (inf.section && inf.section.year), filters.year)) return false;
      const eff = Metrics.effectiveRag(id).rag;
      if (filters.rag === "unrated" && t.rag) return false;
      if (["red", "amber", "green"].indexOf(filters.rag) >= 0 && eff !== filters.rag) return false;
      if (filters.status === "notstarted" && (t.videoDone || t.questionSets.length)) return false;
      if (filters.status === "video" && !t.videoDone) return false;
      if (filters.status === "questions" && !t.questionSets.length) return false;
      if (filters.status === "covered" && !Metrics.isCovered(id)) return false;
      if (filters.status === "due" && !Metrics.isDue(id)) return false;
      if (q) {
        const hay = (inf.sub.name + " " + inf.section.name + " " + inf.paper.short + " " + (inf.sub.reqs || []).join(" ")).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function sortIds(ids) {
    const arr = ids.slice();
    if (filters.sort === "weak") {
      const rank = {}; Metrics.weaknesses().forEach(function (w, i) { rank[w.id] = i; });
      arr.sort(function (a, b) { return (rank[a] == null ? 999 : rank[a]) - (rank[b] == null ? 999 : rank[b]); });
    } else if (filters.sort === "acc") {
      arr.sort(function (a, b) {
        const x = Metrics.accuracy(a), y = Metrics.accuracy(b);
        return (x == null ? 101 : x) - (y == null ? 101 : y);
      });
    } else if (filters.sort === "due") {
      arr.sort(function (a, b) {
        const x = Store.topic(a).nextReview || "9999", y = Store.topic(b).nextReview || "9999";
        return x.localeCompare(y);
      });
    }
    return arr;
  }

  /* Exam-Focus: one card per chapter instead of a tree of sections */
  function byChapter(allIds) {
    const shown = {}; filtered(allIds).forEach(function (id) { shown[id] = true; });
    let out = '<div class="focus-banner" style="margin-bottom:16px">' +
      '<b>Exam-Focus is on.</b> You are revising a chapter at a time \u2014 one summary, the components that carry ' +
      'the marks, and a mixed question set. Turn it off in the top bar to go back to individual sections.</div>';
    SPEC.forEach(function (p) {
      if (!Store.settings().papers[p.id]) return;
      const cards = p.sections.map(function (sec) {
        const cid = CHAPTER_PREFIX + sec.id;
        if (!shown[cid]) return "";
        return chapterCard(cid);
      }).filter(Boolean);
      if (!cards.length) return;
      out += '<div class="section-label">' + UI.esc(p.name) + '</div><div class="stack">' + cards.join("") + '</div>';
    });
    return out;
  }

  function chapterCard(cid) {
    const inf = Store.info(cid), t = Store.topic(cid);
    const eff = Metrics.effectiveRag(cid);
    const roll = Metrics.chapterRollup(cid);
    const acc = Metrics.accuracy(cid);
    const cs = Metrics.checklistScore(cid);
    const w = inf.sub.importance;
    return '<div class="topic-card ' + (eff.rag || "") + '">' +
      '<div class="row wrap" style="gap:10px">' +
        '<div style="flex:1;min-width:0">' +
          '<div class="row wrap" style="gap:8px">' +
            '<span class="code">Ch ' + UI.esc(inf.chapter.num) + '</span>' +
            '<b style="font-size:15px">' + UI.esc(inf.sub.name) + '</b>' +
            UI.yearPill(inf.chapter.year) +
            UI.ragPill(eff.rag) +
            '<span class="pill ' + (w >= 5 ? "bad" : w >= 4 ? "warn" : "") + '" title="Exam value">' +
              "\u2605".repeat(Math.max(1, Math.min(5, w))) + '</span>' +
          '</div>' +
          '<div class="topic-stats">' +
            '<span>' + inf.sub.sectionIds.length + ' sections</span>' +
            '<span>' + cs.done + '/' + cs.total + ' steps</span>' +
            (acc != null ? '<span>accuracy <b>' + acc + '%</b></span>' : "") +
            (roll.loss.marks ? '<span style="color:var(--red)">' + roll.loss.marks + ' marks lost in papers</span>' : "") +
            '<span>' + (t.lastRevised ? "last revised " + Metrics.fmtDate(t.lastRevised) : "never revised") + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="row wrap" style="gap:6px">' +
          UI.ragPicker(t.rag, "set-rag", cid) +
          UI.todayToggle(cid) +
          '<button class="btn btn-sm btn-primary" data-action="open-session" data-id="' + cid + '">Revise chapter</button>' +
          '<button class="btn btn-sm" data-action="open-topic" data-id="' + cid + '">Details</button>' +
        '</div>' +
      '</div></div>';
  }

  function bySection(allIds) {
    const shown = {}; filtered(allIds).forEach(function (id) { shown[id] = true; });
    let out = "";
    SPEC.forEach(function (p) {
      if (!Store.settings().papers[p.id]) return;
      const secs = p.sections.map(function (sec) {
        const ids = sec.subs.map(function (s) { return s.id; }).filter(function (id) { return shown[id]; });
        if (!ids.length) return "";
        return sectionCard(sec, p, ids);
      }).filter(Boolean);
      const customIds = Store.get().customSubs.filter(function (cs) { return cs.paperId === p.id && shown[cs.id]; }).map(function (cs) { return cs.id; });
      if (customIds.length) secs.push(sectionCard({ id: "custom-" + p.id, num: "C", name: "Custom topics", desc: "Topics you added yourself.", subs: [] }, p, customIds));
      if (!secs.length) return;
      out += '<div class="section-label">' + UI.esc(p.name) + '</div><div class="stack">' + secs.join("") + '</div>';
    });
    return out || UI.empty("🔍", "No topics match those filters");
  }

  function sectionCard(sec, paper, ids) {
    const counts = { red: 0, amber: 0, green: 0, unassessed: 0 };
    let covered = 0;
    ids.forEach(function (id) {
      const e = Metrics.effectiveRag(id).rag;
      if (e) counts[e]++; else counts.unassessed++;
      if (Metrics.isCovered(id)) covered++;
    });
    const overall = counts.red ? "red" : counts.amber ? "amber" : counts.unassessed === ids.length ? null : "green";
    const open = openSections[sec.id] !== false;
    return '<div class="topic-card ' + (overall || "") + '" style="cursor:default">' +
      '<div class="row wrap" data-action="toggle-section" data-id="' + sec.id + '" style="cursor:pointer;gap:10px">' +
        '<div style="flex:1;min-width:0">' +
        '<div class="row" style="gap:8px"><b style="font-size:15px">' + UI.esc(sec.plainLabel ? sec.name : "Chapter " + sec.num + " · " + sec.name) + '</b>' + UI.yearPill(sec.year) + UI.ragPill(overall, "overall") + '</div>' +
          '<div class="tiny muted" style="margin-top:4px">' + UI.esc(sec.desc) + '</div>' +
        '</div>' +
        '<div style="text-align:right"><div class="tiny muted">' + covered + '/' + ids.length + ' covered</div>' +
        '<div style="width:120px;margin-top:5px">' + UI.ragBar(counts) + '</div></div>' +
        '<span class="faint" style="font-size:16px">' + (open ? "▾" : "▸") + '</span>' +
      '</div>' +
      (open ? '<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:6px">' +
        sortIds(ids).map(subRow).join("") + '</div>' : "") +
      '</div>';
  }

  function subRow(id) {
    const inf = Store.info(id), t = Store.topic(id);
    const eff = Metrics.effectiveRag(id);
    const acc = Metrics.accuracy(id);
    const cs = Metrics.checklistScore(id);
    const due = Metrics.isDue(id);
    return '<div class="sub-row">' +
      UI.ragDot(eff.rag) +
      '<div class="sub-name" data-action="open-topic" data-id="' + id + '" style="cursor:pointer">' +
      (inf.sub.code ? '<span class="code">' + UI.esc(inf.sub.code) + '</span>' : "") +
      UI.esc(inf.sub.name) + UI.yearPill(inf.year) + (eff.adjusted ? '<span class="pill warn" style="margin-left:6px">adjusted</span>' : "") +
        '<small>' + cs.done + "/" + cs.total + ' steps' +
          (t.lastRevised ? " · last revised " + Metrics.fmtDate(t.lastRevised) : " · never revised") +
          (acc != null ? " · " + acc + "% accuracy" : "") +
          (due ? " · due now" : (t.nextReview ? " · review " + Metrics.fmtDate(t.nextReview) : "")) +
        '</small></div>' +
      (t.videoDone ? '<span class="pill good" title="Video watched">▶</span>' : "") +
      (t.questionSets.length ? '<span class="pill good" title="Questions done">✎</span>' : "") +
      UI.ragPicker(t.rag, "set-rag", id) +
      UI.todayToggle(id) +
      '<button class="btn btn-sm btn-primary" data-action="open-session" data-id="' + id + '">Revise</button>' +
      '</div>';
  }

  function flatList(ids) {
    if (!ids.length) return UI.empty("🔍", "No topics match those filters");
    return '<div class="stack" style="gap:2px">' +
      '<div class="card">' + sortIds(ids).map(subRow).join("") + '</div></div>';
  }

  /* ---------- detail view ---------- */
  function renderDetail(root, id) {
    const inf = Store.info(id);
    if (!inf) { root.innerHTML = UI.empty("❓", "Topic not found"); return; }
    const t = Store.topic(id);
    const eff = Metrics.effectiveRag(id);
    const acc = Metrics.accuracy(id);
    const best = Metrics.bestAccuracy(id);
    const loss = Metrics.paperLoss(id);
    const cs = Metrics.checklistScore(id);
    const p = Scheduler.priority(id);

    root.innerHTML =
      '<button class="btn btn-sm btn-ghost" data-action="go" data-view="topics" style="margin-bottom:14px">← All topics</button>' +
      '<div class="grid g-main">' +
        '<div class="stack" style="gap:18px">' +
          '<div class="card">' +
            '<div class="row wrap" style="gap:10px">' +
              '<div style="flex:1;min-width:0">' +
                '<div class="assess-path">' + UI.esc(inf.paper.short + " · " + inf.chapterLabel) + '</div>' +
                '<h2 style="font-size:24px;margin:6px 0 0">' + (inf.sub.code ? '<span class="code">' + UI.esc(inf.sub.code) + '</span>' : "") + UI.esc(inf.sub.name) + UI.yearPill(inf.year) + '</h2>' +
              '</div>' + UI.ragPill(eff.rag) +
            '</div>' +
            (eff.adjusted ? '<div class="warnbox" style="margin-top:12px"><b>Rating adjusted automatically</b>' +
              'You rated this ' + eff.base.toUpperCase() + ', but it is being treated as <b>' + eff.rag.toUpperCase() + '</b> because ' +
              UI.esc(eff.reasons.join(" and ")) + '.</div>' : "") +
            '<div style="margin-top:16px;font-weight:700;font-size:13px">What you need to be able to do</div>' +
            '<ul class="reqs" style="margin-top:6px">' + inf.sub.reqs.map(function (r) { return "<li>" + UI.math(r) + "</li>"; }).join("") + '</ul>' +
            '<div class="row wrap" style="margin-top:18px;gap:8px">' +
              '<button class="btn btn-primary" data-action="open-session" data-id="' + id + '">Start revision session</button>' +
              UI.todayToggle(id, { label: true }) +
              '<button class="btn" data-action="edit-video" data-id="' + id + '">' + (t.videoUrl ? "Edit video link" : "Add video link") + '</button>' +
              '<button class="btn" data-action="quick-questions" data-id="' + id + '">Log questions</button>' +
              '<button class="btn" data-action="topic-notes" data-id="' + id + '">Notes</button>' +
              '<div class="spacer"></div>' +
              '<button class="btn btn-sm" data-action="topic-pin" data-id="' + id + '">' + (t.pinned ? "Unpin" : "Pin to top") + '</button>' +
              '<button class="btn btn-sm btn-danger" data-action="topic-reset" data-id="' + id + '">Reset</button>' +
            '</div>' +
          '</div>' +
          historyCard(t, id) +
        '</div>' +
        '<div class="stack" style="gap:18px">' +
          '<div class="card"><div class="card-head"><div class="card-title">Status</div></div>' +
            statusRows(t, id, acc, best, loss) + '</div>' +
          '<div class="card"><div class="card-head"><div class="card-title">Your confidence</div></div>' +
            UI.ragPicker(t.rag, "set-rag", id, true) +
            '<div class="tiny faint" style="margin-top:9px">Your own rating. The planner may override it based on your scores.</div>' +
          '</div>' +
          '<div class="card"><div class="card-head"><div class="card-title">Completion checklist</div>' +
            '<div class="right"><span class="pill ' + (cs.done === cs.total ? "good" : "") + '">' + cs.done + '/' + cs.total + '</span></div></div>' +
            checklistRows(cs.items) +
            (cs.done === cs.total ? '<div class="tiny" style="margin-top:10px;color:var(--green);font-weight:600">✓ Covered, now on retrieval practice</div>'
              : '<div class="tiny faint" style="margin-top:10px">Watching the video alone does not count as covered.</div>') +
          '</div>' +
          '<div class="card"><div class="card-head"><div class="card-title">Why the planner ranks this here</div></div>' +
            '<div class="tiny muted">Priority score <b style="color:var(--text)">' + p.score + '</b></div>' +
            '<ul class="reqs" style="margin-top:8px">' + (p.reasons.length ? p.reasons.map(function (r) { return "<li>" + UI.esc(r.charAt(0).toUpperCase() + r.slice(1)) + "</li>"; }).join("") : "<li>Routine maintenance</li>") + '</ul>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function statusRows(t, id, acc, best, loss) {
    const rows = [
      ["Video", t.videoDone ? "✅ Watched" : "❌ Not watched"],
      ["Questions", t.questionSets.length ? "✅ " + t.questionSets.length + " set" + (t.questionSets.length > 1 ? "s" : "") : "❌ None yet"],
      ["Marked", t.marked ? "✅ Yes" : "❌ Not marked"],
      ["Last revised", t.lastRevised ? Metrics.fmtDate(t.lastRevised) + " (" + Metrics.daysSinceRevised(id) + "d ago)" : "Never"],
      ["Best question score", best != null ? best + "%" : "n/a"],
      ["Recent accuracy", acc != null ? acc + "%" : "n/a"],
      ["Past-paper marks lost", loss.marks ? loss.marks + " marks across " + loss.papers + " paper(s)" : "None recorded"],
      ["Next review", t.nextReview ? (Metrics.isDue(id) ? "Due now" : Metrics.fmtDate(t.nextReview)) : "Not scheduled"],
      ["Reviews completed", String(t.reviewsDone || 0)]
    ];
    let out = '<div class="stack" style="gap:0">';
    rows.forEach(function (r) {
      out += '<div class="row tiny" style="padding:7px 0;border-bottom:1px solid var(--border)">' +
        '<span class="muted">' + r[0] + '</span><div class="spacer"></div><b>' + UI.esc(r[1]) + '</b></div>';
    });
    out += '</div>';
    if (t.videoUrl) out += '<a class="btn btn-sm btn-block" style="margin-top:12px" href="' + UI.esc(t.videoUrl) + '" target="_blank" rel="noopener">▶ Open your video link</a>';
    return out;
  }

  function checklistRows(items) {
    const labels = {
      assessed: "Initial RAG assessment", video: "Summary video watched", questions: "Topic questions completed",
      marked: "Questions marked", postRag: "Post-practice RAG rating", reviewed: "First review completed"
    };
    return '<div class="stack" style="gap:7px">' + Object.keys(labels).map(function (k) {
      return '<div class="row tiny"><span style="color:' + (items[k] ? "var(--green)" : "var(--faint)") + ';font-weight:800;width:16px">' +
        (items[k] ? "✓" : "○") + '</span><span style="' + (items[k] ? "" : "color:var(--muted)") + '">' + labels[k] + '</span></div>';
    }).join("") + '</div>';
  }

  function historyCard(t, id) {
    if (!t.questionSets.length && !t.sessions.length) {
      return '<div class="card"><div class="card-head"><div class="card-title">History</div></div>' +
        UI.empty("📋", "Nothing recorded yet", "Start a revision session to build a record.") + '</div>';
    }
    const pts = t.questionSets.map(function (q, i) {
      return { v: q.pct, label: q.date, short: Metrics.fmtDate(q.date, { day: "numeric", month: "short" }) };
    });
    return '<div class="card"><div class="card-head"><div class="card-title">Question performance</div>' +
      '<div class="right"><button class="btn btn-sm" data-action="quick-questions" data-id="' + id + '">+ Log a set</button></div></div>' +
      (pts.length ? UI.lineChart(pts, { height: 160 }) : UI.empty("📈", "No question sets logged")) +
      (t.questionSets.length ? '<div class="tbl-wrap" style="margin-top:14px"><table class="tbl"><thead><tr>' +
        '<th>Date</th><th>Score</th><th>%</th><th>Time</th><th>Difficulty</th><th>Notes / mistakes</th><th></th></tr></thead><tbody>' +
        t.questionSets.slice().reverse().map(function (q, ri) {
          const idx = t.questionSets.length - 1 - ri;
          return '<tr><td>' + Metrics.fmtDate(q.date) + '</td><td>' + q.correct + '/' + q.attempted + '</td>' +
          '<td>' + UI.accPill(q.pct) + '</td><td>' + (q.minutes ? Metrics.fmtMins(q.minutes) : "n/a") + '</td>' +
          '<td>' + UI.esc(q.difficulty || "n/a") + '</td>' +
          '<td class="tiny muted">' + UI.esc([q.mistakes, q.notes].filter(Boolean).join(", ") || "n/a") + '</td>' +
            '<td><button class="btn btn-sm btn-ghost" data-action="del-qset" data-id="' + id + '" data-idx="' + idx + '">✕</button></td></tr>';
        }).join("") + '</tbody></table></div>' : "") +
      (t.sessions.length ? '<div class="section-label" style="margin:18px 0 8px">Session log</div>' +
        t.sessions.slice().reverse().map(function (s) {
          return '<div class="row tiny" style="padding:7px 0;border-bottom:1px solid var(--border)">' +
            '<span class="muted">' + Metrics.fmtDate(s.date) + '</span>' +
            '<div class="spacer"></div>' +
            (s.ragBefore ? UI.ragDot(s.ragBefore) + '<span class="faint">→</span>' : "") +
            (s.ragAfter ? UI.ragDot(s.ragAfter) : "") +
            (s.notes ? '<span class="muted" style="margin-left:8px;max-width:50%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + UI.esc(s.notes) + '</span>' : "") +
            '</div>';
        }).join("") : "") +
      '</div>';
  }

  function handle(action, el) {
    if (action === "filter") {
      filters[el.dataset.key] = el.dataset.val;
      App.render(); return true;
    }
    if (action === "toggle-section") {
      const k = el.dataset.id;
      openSections[k] = openSections[k] === false ? true : false;
      App.render(); return true;
    }
    return false;
  }

  function setFilter(k, v) { filters[k] = v; }

  return { render: render, renderDetail: renderDetail, handle: handle, setFilter: setFilter, setSearch: setSearch };
})();
