/* ============================================================
Weaknesses, ranked weak topics, recurring past-paper errors,
   error-type breakdown
   ============================================================ */

const WeaknessesView = (function () {

  let grain = null; // null = follow the current mode

  function currentGrain() {
    if (grain) return grain;
    return Store.isFocus() ? "chapter" : "topic";
  }

  function render(root) {
    const rows = Metrics.weaknesses(null, currentGrain());
    const recurring = Metrics.recurringErrors();
    const types = Metrics.errorTypeTotals();
    const totalLost = types.reduce(function (a, t) { return a + t.marks; }, 0);

    root.innerHTML =
      '<div class="card" style="margin-bottom:18px"><div class="row wrap" style="gap:14px">' +
        '<div style="flex:1;min-width:180px"><b>Break weaknesses down by</b>' +
          '<div class="tiny muted" style="margin-top:3px">Chapter view rolls a chapter and all of its sections together.</div></div>' +
        '<div class="chips">' +
          '<button class="chip' + (currentGrain() === "topic" ? " on" : "") + '" data-action="weak-grain" data-val="topic">Topic</button>' +
          '<button class="chip' + (currentGrain() === "chapter" ? " on" : "") + '" data-action="weak-grain" data-val="chapter">Chapter</button>' +
        '</div>' +
        '<button class="btn btn-sm" data-action="retake-assessment">Retake assessment</button>' +
      '</div></div>' +
      '<div class="grid g-main">' +
        '<div class="stack" style="gap:18px">' +
          recurringCard(recurring) +
          rankedCard(rows) +
        '</div>' +
        '<div class="stack" style="gap:18px">' +
          typesCard(types, totalLost) +
          neverCard() +
          decayCard() +
        '</div>' +
      '</div>';
  }

  function recurringCard(recurring) {
    if (!recurring.length) {
      return '<div class="card"><div class="card-head"><div class="card-title">Where you keep losing marks</div></div>' +
        UI.empty("▤", "No mistakes logged yet",
          "Record the marks you lost, either on a past paper or by reviewing a school test, " +
          "this is where the tracker gets genuinely useful.") +
        '<div class="row" style="gap:8px">' +
        '<button class="btn btn-primary" style="flex:1" data-action="log-paper">Log a paper</button>' +
        '<button class="btn" style="flex:1" data-action="go" data-view="assessments">Review a test</button>' +
        '</div></div>';
    }
    return '<div class="card"><div class="card-head"><div class="card-title">Where you keep losing marks</div>' +
      '<div class="right"><button class="btn btn-sm btn-ghost" data-action="go" data-view="papers">Papers</button></div></div>' +
      '<div class="stack">' + recurring.slice(0, 10).map(function (g) {
        const severe = g.marks >= 5 && g.paperCount >= 2;
        return '<div style="padding:12px;border:1px solid ' + (severe ? "var(--amber)" : "var(--border)") + ';border-radius:12px;background:' + (severe ? "var(--amber-soft)" : "var(--surface-2)") + '">' +
          '<div class="row wrap" style="gap:8px">' +
            '<b style="font-size:13.5px">' + UI.esc(g.name) + '</b>' +
            '<span class="pill">' + UI.esc(g.paper) + '</span>' +
            '<div class="spacer"></div>' +
            '<span class="pill bad">' + g.marks + ' marks lost</span>' +
          '</div>' +
          '<div class="tiny muted" style="margin-top:6px">' +
            g.count + ' mistake' + (g.count === 1 ? "" : "s") + ' across ' + g.paperCount +
            ' paper or test' + (g.paperCount === 1 ? "" : "s") +
            (g.topType ? ' · most often <b>' + UI.esc(g.topType.toLowerCase()) + '</b>' : "") + '</div>' +
          (severe ? '<div class="tiny" style="margin-top:8px;font-weight:600">⚠️ This has been promoted in your schedule.</div>' : "") +
          (g.topTopic ? '<div style="margin-top:10px"><button class="btn btn-sm" data-action="open-session" data-id="' + g.topTopic + '">Revise ' +
            UI.esc(Store.info(g.topTopic).sub.name) + '</button></div>' : "") +
          '</div>';
      }).join("") + '</div></div>';
  }

  function rankedCard(rows) {
    const isCh = currentGrain() === "chapter";
    const top = rows.slice(0, isCh ? 30 : 25);
    return '<div class="card"><div class="card-head">' +
      '<div class="card-title">' + (isCh ? "Chapters" : "Topics") + ' ranked by weakness</div>' +
      '<div class="right tiny faint">RAG + question accuracy + past-paper losses + coverage</div></div>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr>' +
        '<th>#</th><th>' + (isCh ? "Chapter" : "Topic") + '</th><th>RAG</th><th>Accuracy</th>' +
        '<th>Paper marks lost</th><th>Covered</th><th></th></tr></thead><tbody>' +
        top.map(function (r, i) {
          const rag = isCh ? r.rag : r.eff.rag;
          const name = isCh
            ? '<b>' + UI.esc(r.info.chapter.num + ". " + r.info.sub.name) + '</b>' +
              '<div class="tiny faint">' + UI.esc(r.info.paper.short) + ' \u00b7 ' + r.total + ' sections</div>'
            : '<b>' + UI.esc(r.info.sub.name) + '</b>' +
              '<div class="tiny faint">' + UI.esc(r.info.paper.short) + ' \u00b7 ' + UI.esc(r.info.chapterLabel) + '</div>';
          const cov = isCh
            ? '<span class="tiny">' + r.coveredPct + '%</span>'
            : (r.covered ? '<span style="color:var(--green)">\u2713</span>' : '<span class="faint">\u25cb</span>');
          return '<tr><td class="faint">' + (i + 1) + '</td>' +
            '<td>' + name + '</td>' +
            '<td>' + UI.ragPill(rag) + '</td>' +
            '<td>' + (r.acc != null ? UI.accPill(r.acc) : '<span class="faint tiny">\u2014</span>') + '</td>' +
            '<td>' + (r.loss.marks ? '<span class="pill bad">' + r.loss.marks + '</span>' : '<span class="faint tiny">\u2014</span>') + '</td>' +
            '<td>' + cov + '</td>' +
            '<td><button class="btn btn-sm btn-primary" data-action="open-session" data-id="' + r.id + '">Revise</button></td></tr>';
        }).join("") + '</tbody></table></div></div>';
  }

  function handle(action, el) {
    if (action === "weak-grain") { grain = el.dataset.val; App.render(); return true; }
    return false;
  }

  function typesCard(types, totalLost) {
    if (!types.length) return "";
    return '<div class="card"><div class="card-head"><div class="card-title">How you lose marks</div></div>' +
      '<div class="tiny muted" style="margin-bottom:12px">' + totalLost + ' marks lost in total across your logged papers.</div>' +
      UI.hBars(types.map(function (t) {
        const knowledge = t.type === "Knowledge gap";
        return { label: t.type + " (" + t.count + ")", v: t.marks, display: t.marks + " marks",
                 color: knowledge ? "var(--red)" : "var(--amber)" };
      })) +
      '<div class="tiny faint" style="margin-top:12px">' +
        (types[0] && types[0].type !== "Knowledge gap"
          ? "Your biggest loss is <b>" + UI.esc(types[0].type.toLowerCase()) + "</b>, not missing knowledge. More revision will not fix that, slower, checked working will."
          : "Your biggest loss is genuine knowledge gaps, so topic revision is the right response.") +
      '</div></div>';
  }

  function neverCard() {
    const never = Store.activeSubIds().filter(function (id) {
      const t = Store.topic(id);
      return !t.videoDone && !t.questionSets.length;
    });
    if (!never.length) return '<div class="card"><div class="card-head"><div class="card-title">Never touched</div></div>' +
      '<div class="tiny" style="color:var(--green);font-weight:600">✓ You have started every active topic.</div></div>';
    return '<div class="card"><div class="card-head"><div class="card-title">Never touched</div>' +
      '<div class="right"><span class="pill bad">' + never.length + '</span></div></div>' +
      '<div class="tiny muted" style="margin-bottom:10px">No video, no questions. These carry the most risk.</div>' +
      '<div class="stack" style="gap:2px">' + never.slice(0, 12).map(function (id) {
        const inf = Store.info(id);
        return '<div class="sub-row" data-action="open-topic" data-id="' + id + '" style="cursor:pointer;padding:6px 8px">' +
          UI.ragDot(Metrics.effectiveRag(id).rag) +
          '<div class="sub-name tiny">' + UI.esc(inf.sub.name) + '<small>' + UI.esc(inf.paper.short) + '</small></div></div>';
      }).join("") + (never.length > 12 ? '<div class="tiny faint" style="padding:6px 8px">…and ' + (never.length - 12) + ' more</div>' : "") + '</div></div>';
  }

  function decayCard() {
    const rows = Store.activeSubIds().map(function (id) {
      return { id: id, days: Metrics.daysSinceRevised(id), due: Metrics.isDue(id) };
    }).filter(function (r) { return r.days != null && r.days >= 5; })
      .sort(function (a, b) { return b.days - a.days; }).slice(0, 8);
    if (!rows.length) return "";
    return '<div class="card"><div class="card-head"><div class="card-title">Going stale</div></div>' +
      '<div class="tiny muted" style="margin-bottom:10px">Covered, but not revisited for a while.</div>' +
      '<div class="stack" style="gap:2px">' + rows.map(function (r) {
        const inf = Store.info(r.id);
        return '<div class="sub-row" data-action="open-topic" data-id="' + r.id + '" style="cursor:pointer;padding:6px 8px">' +
          UI.ragDot(Metrics.effectiveRag(r.id).rag) +
          '<div class="sub-name tiny">' + UI.esc(inf.sub.name) + '<small>' + r.days + ' days ago</small></div>' +
          (r.due ? '<span class="pill warn">due</span>' : "") + '</div>';
      }).join("") + '</div></div>';
  }

  return { render: render, handle: handle };
})();
