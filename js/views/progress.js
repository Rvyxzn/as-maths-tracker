/* ============================================================
   Progress — charts and long-run trends
   ============================================================ */

const ProgressView = (function () {

  function render(root) {
    const c = Metrics.coverage();
    const ps = Metrics.paperStats();
    const feas = Metrics.feasibility();

    root.innerHTML =
      '<div class="grid g4" style="margin-bottom:18px">' +
        stat("Specification covered", c.coveredPct + "%", c.covered + " of " + c.total + " subtopics") +
        stat("Questions attempted", totalAttempted() + "", totalSets() + " question sets logged") +
        stat("Overall accuracy", overallAccuracy() != null ? overallAccuracy() + "%" : "—", "across all topic questions") +
        stat("Past paper average", ps.avg != null ? ps.avg + "%" : "—", ps.count + " papers logged") +
      '</div>' +

      '<div class="grid g2">' +
        '<div class="card"><div class="card-head"><div class="card-title">Specification completion by paper</div></div>' +
          SPEC.filter(function (p) { return Store.settings().papers[p.id]; }).map(function (p) {
            const pc = Metrics.coverage(p.id);
            return '<div style="margin-bottom:16px"><div class="row tiny" style="margin-bottom:5px">' +
              '<b>' + UI.esc(p.short) + '</b><div class="spacer"></div><span class="muted">' + pc.coveredPct + '% · ' + pc.covered + '/' + pc.total + '</span></div>' +
              UI.bar(pc.coveredPct) +
              '<div style="margin-top:7px">' + UI.ragBar(pc) + '</div></div>';
          }).join("") +
        '</div>' +

        '<div class="card"><div class="card-head"><div class="card-title">RAG distribution</div></div>' +
          '<div class="row" style="gap:18px;align-items:center">' +
            UI.donut([
              { label: "Red", v: c.red, color: "var(--red)" },
              { label: "Amber", v: c.amber, color: "var(--amber)" },
              { label: "Green", v: c.green, color: "var(--green)" },
              { label: "Unrated", v: c.unassessed, color: "var(--border-strong)" }
            ], String(c.total), "TOPICS") +
            '<div style="flex:1">' + UI.hBars([
              { label: "Red", v: c.red, color: "var(--red)" },
              { label: "Amber", v: c.amber, color: "var(--amber)" },
              { label: "Green", v: c.green, color: "var(--green)" },
              { label: "Unrated", v: c.unassessed, color: "var(--border-strong)" }
            ]) + '</div>' +
          '</div>' +
          ragShiftNote() +
        '</div>' +

        '<div class="card"><div class="card-head"><div class="card-title">Exam-question accuracy over time</div></div>' +
          UI.lineChart(accuracySeries(), { height: 190, emptyText: "Log question sets in a revision session to build this graph" }) +
          '<div class="tiny faint" style="margin-top:10px">Every question set you record, in date order. This is the number that actually predicts your grade.</div>' +
        '</div>' +

        '<div class="card"><div class="card-head"><div class="card-title">Past paper performance</div>' +
          '<div class="right"><button class="btn btn-sm btn-ghost" data-action="go" data-view="papers">Papers</button></div></div>' +
          UI.lineChart(ps.series.map(function (p, i) {
            return { v: Math.round(p.mark / p.total * 100), label: p.title, short: p.date ? Metrics.fmtDate(p.date, { day: "numeric", month: "short" }) : "#" + (i + 1) };
          }), { height: 190, emptyText: "No scored papers yet" }) +
        '</div>' +

        '<div class="card"><div class="card-head"><div class="card-title">Weakest topics by actual performance</div></div>' +
          UI.hBars(Metrics.weaknesses(10).map(function (r) {
            return { label: r.info.sub.name, v: r.score, display: (r.acc != null ? r.acc + "%" : (r.covered ? "covered" : "not covered")),
                     color: r.eff.rag === "red" ? "var(--red)" : r.eff.rag === "amber" ? "var(--amber)" : "var(--green)" };
          }), { emptyText: "No data yet" }) +
        '</div>' +

        '<div class="card"><div class="card-head"><div class="card-title">Time budget to the exam</div></div>' +
          budgetBlock(feas) +
        '</div>' +
      '</div>' +

      activityCard();
  }

  function stat(k, v, sub) {
    return '<div class="stat"><div class="stat-k">' + UI.esc(k) + '</div><div class="stat-v">' + UI.esc(String(v)) + '</div>' +
      '<div class="stat-sub">' + UI.esc(sub) + '</div></div>';
  }

  function allSets() {
    const out = [];
    Store.activeSubIds().forEach(function (id) {
      Store.topic(id).questionSets.forEach(function (q) { out.push(Object.assign({ topicId: id }, q)); });
    });
    return out.sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); });
  }
  function totalSets() { return allSets().length; }
  function totalAttempted() { return allSets().reduce(function (a, q) { return a + (q.attempted || 0); }, 0); }
  function overallAccuracy() {
    const s = allSets();
    if (!s.length) return null;
    let a = 0, c = 0;
    s.forEach(function (q) { a += q.attempted || 0; c += q.correct || 0; });
    return a ? Math.round(c / a * 100) : null;
  }
  function accuracySeries() {
    return allSets().map(function (q) {
      const inf = Store.info(q.topicId);
      return { v: q.pct, label: (inf ? inf.sub.name : "") + " " + q.date, short: Metrics.fmtDate(q.date, { day: "numeric", month: "short" }) };
    });
  }

  function ragShiftNote() {
    let up = 0, down = 0, adjusted = 0;
    Store.activeSubIds().forEach(function (id) {
      const t = Store.topic(id);
      const eff = Metrics.effectiveRag(id);
      if (eff.adjusted) adjusted++;
      if (!t.initialRag || !t.rag) return;
      const rank = { red: 0, amber: 1, green: 2 };
      if (rank[t.rag] > rank[t.initialRag]) up++;
      if (rank[t.rag] < rank[t.initialRag]) down++;
    });
    if (!up && !down && !adjusted) return "";
    return '<div class="tiny muted" style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">' +
      '<b style="color:var(--text)">Since your first assessment:</b> ' + up + ' topic' + (up === 1 ? "" : "s") + ' improved, ' +
      down + ' dropped' + (adjusted ? ', and ' + adjusted + ' are currently being auto-adjusted by your scores' : "") + '.</div>';
  }

  function budgetBlock(f) {
    const rows = [
      { label: "Remaining topic coverage", v: f.required.topics, color: "var(--red)" },
      { label: "Retrieval / spaced review", v: f.required.reviews, color: "var(--amber)" },
      { label: "Past papers, marking & analysis", v: f.required.papers, color: "var(--blue)" }
    ].map(function (r) { return Object.assign(r, { display: Metrics.fmtMins(r.v) }); });
    return UI.hBars(rows) +
      '<div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--border)">' +
        '<div class="row tiny"><span class="muted">Work required</span><div class="spacer"></div><b>' + Metrics.fmtMins(f.required.total) + '</b></div>' +
        '<div class="row tiny" style="margin-top:6px"><span class="muted">Time available before the exam</span><div class="spacer"></div><b>' + Metrics.fmtMins(f.availableMins) + '</b></div>' +
        '<div class="row tiny" style="margin-top:6px"><span class="muted">Balance</span><div class="spacer"></div><b style="color:' +
          (f.ok ? "var(--green)" : "var(--red)") + '">' + (f.ok ? "fits" : "short by " + Metrics.fmtMins(f.deficitMins)) + '</b></div>' +
      '</div>' +
      (!f.ok ? '<div class="warnbox ' + (f.tight ? "" : "bad") + '" style="margin-top:14px"><b>Not everything fits</b>' +
        'Prioritise in this order: red Pure topics → red Stats/Mechanics → topic exam questions → past papers → green maintenance.</div>' : "");
  }

  function activityCard() {
    const log = Store.get().activity.slice(0, 14);
    if (!log.length) return "";
    return '<div class="card" style="margin-top:18px"><div class="card-head"><div class="card-title">Recent activity</div></div>' +
      '<div class="stack" style="gap:0">' + log.map(function (a) {
        return '<div class="row tiny" style="padding:7px 0;border-bottom:1px solid var(--border)">' +
          '<span class="muted">' + UI.esc(a.text) + '</span><div class="spacer"></div>' +
          '<span class="faint">' + new Date(a.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + '</span></div>';
      }).join("") + '</div></div>';
  }

  return { render: render };
})();
