/* ============================================================
Past Papers: tracker, filters, and per-paper error log
   ============================================================ */

const PapersView = (function () {

  const filters = { type: "all", level: "all", scope: "all", timing: "all" };
  const ERROR_TYPES = ["Knowledge gap", "Method error", "Algebra error", "Calculator error", "Misread question", "Time pressure", "Careless mistake"];
  const PAPER_TYPES = ["Pure", "Statistics", "Mechanics", "Statistics & Mechanics", "Mixed"];

  /* AS (8MA0) papers only examine Year 1 content and are marked out of 100/60;
  A level (9MA0) papers are out of 100 each and can ask anything from either
  year. Keeping them apart stops an AS average from flattering a full-A-level
  prediction, which is why the grade estimate is reported per level. */
  const PAPER_LEVELS = { as: "AS (8MA0)", alevel: "A level (9MA0)" };
  function levelOf(p) { return p.level === "alevel" ? "alevel" : "as"; }

  function render(root) {
    const st = Store.get();
    const ps = Metrics.paperStats();
    const rows = filtered();

    root.innerHTML =
      '<div class="grid g4" style="margin-bottom:18px">' +
        stat("Papers logged", ps.count, ps.timed + " timed · " + ps.full + " full") +
        stat("Average", ps.avg != null ? ps.avg + "%" : "n/a", ps.avg != null ? "grade " + Metrics.estimateGrade(ps.avg) + " (indicative)" : "no scores yet") +
        stat("Latest", ps.latest != null ? ps.latest + "%" : "n/a", ps.trendAvg != null ? "last 3 avg " + ps.trendAvg + "%" : "") +
        stat("Best", ps.best != null ? ps.best + "%" : "n/a", "") +
      '</div>' +

      '<div class="card" style="margin-bottom:18px">' +
        '<div class="card-head"><div class="card-title">Performance over time</div>' +
          '<div class="right">' +
            (Store.get().timer ? "" : '<button class="btn btn-sm" data-action="start-paper-timer">\u23f1 Start a paper (timed)</button>') +
            '<button class="btn btn-sm btn-primary" data-action="log-paper">+ Log a paper</button>' +
          '</div></div>' +
        UI.lineChart(ps.series.map(function (p, i) {
          return { v: Math.round(p.mark / p.total * 100), label: p.title, short: p.date ? Metrics.fmtDate(p.date, { day: "numeric", month: "short" }) : "#" + (i + 1) };
        }), { height: 180, emptyText: "Log a paper with a mark to start the graph" }) +
      '</div>' +

      '<div class="card" style="margin-bottom:18px"><div class="row wrap" style="gap:16px">' +
      chips("level", ["all", "as", "alevel"], { all: "AS + A level", as: "AS papers", alevel: "A level papers" }) +
        chips("type", ["all"].concat(PAPER_TYPES), { all: "All papers" }) +
        chips("scope", ["all", "full", "partial"], { all: "Full or partial", full: "Full paper", partial: "Partial / section" }) +
        chips("timing", ["all", "timed", "untimed"], { all: "Any timing", timed: "Timed", untimed: "Untimed" }) +
      '</div></div>' +

      (rows.length ? table(rows) :
        (st.papers.length ? UI.empty("🔍", "No papers match those filters")
          : UI.empty("▤", "No past papers logged yet",
            "Official Edexcel 9MA0 (A level) and 8MA0 (AS) papers, mark schemes and the formulae booklet are on the Pearson course page, add each one here as you do it, tagging which level it was.") +
            '<div class="row" style="justify-content:center;gap:8px">' +
              '<button class="btn btn-primary" data-action="log-paper">Log your first paper</button>' +
              '<a class="btn" href="' + REFERENCE_LINKS[0].url + '" target="_blank" rel="noopener">Pearson past papers ↗</a></div>'));
  }

  function stat(k, v, sub) {
    return '<div class="stat"><div class="stat-k">' + UI.esc(k) + '</div><div class="stat-v">' + UI.esc(String(v)) + '</div>' +
      (sub ? '<div class="stat-sub">' + UI.esc(sub) + '</div>' : "") + '</div>';
  }

  function chips(key, vals, labels) {
    return '<div class="chips">' + vals.map(function (v) {
      return '<button class="chip' + (filters[key] === v ? " on" : "") + '" data-action="paper-filter" data-key="' + key + '" data-val="' + UI.esc(v) + '">' +
        UI.esc(labels[v] || v) + '</button>';
    }).join("") + '</div>';
  }

  function filtered() {
    return Store.get().papers.filter(function (p) {
      if (filters.type !== "all" && p.type !== filters.type) return false;
      if (filters.level !== "all" && levelOf(p) !== filters.level) return false;
      if (filters.scope === "full" && !p.full) return false;
      if (filters.scope === "partial" && p.full) return false;
      if (filters.timing === "timed" && !p.timed) return false;
      if (filters.timing === "untimed" && p.timed) return false;
      return true;
    }).sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
  }

  function table(rows) {
    return '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
    '<th>Paper</th><th>Level</th><th>Type</th><th>Date</th><th>Mark</th><th>%</th><th>Grade</th><th>Time</th><th>Conditions</th><th>Errors</th><th></th>' +
      '</tr></thead><tbody>' + rows.map(function (p) {
        const pct = p.total ? Math.round(p.mark / p.total * 100) : null;
        const lost = (p.errors || []).reduce(function (a, e) { return a + (+e.marks || 0); }, 0);
        return '<tr>' +
          '<td><b>' + UI.esc(p.title) + '</b>' + (p.url ? ' <a href="' + UI.esc(p.url) + '" target="_blank" rel="noopener" title="Open paper">↗</a>' : "") +
            (p.notes ? '<div class="tiny muted" style="max-width:280px">' + UI.esc(p.notes) + '</div>' : "") + '</td>' +
            '<td><span class="pill ' + (levelOf(p) === "alevel" ? "good" : "") + '">' + UI.esc(PAPER_LEVELS[levelOf(p)]) + '</span></td>' +
            '<td><span class="pill">' + UI.esc(p.type || "n/a") + '</span></td>' +
            '<td class="tiny">' + (p.date ? Metrics.fmtDate(p.date) : "n/a") + '</td>' +
            '<td>' + (p.mark != null ? p.mark + " / " + p.total : "n/a") + '</td>' +
            '<td>' + (pct != null ? UI.accPill(pct) : "n/a") + '</td>' +
            '<td>' + (pct != null ? '<b>' + Metrics.estimateGrade(pct) + '</b>' : "n/a") + '</td>' +
            '<td class="tiny">' + (p.timeTaken ? p.timeTaken + "/" + (p.duration || "?") + " min" : (p.duration ? p.duration + " min" : "n/a")) + '</td>' +
          '<td class="tiny">' + (p.timed ? "⏱ timed" : "untimed") + '<br>' + (p.full ? "full paper" : "partial") + '</td>' +
          '<td>' + ((p.errors || []).length
            ? '<span class="pill bad">' + p.errors.length + ' · ' + lost + ' marks</span>'
            : '<span class="pill">none logged</span>') + '</td>' +
          '<td style="white-space:nowrap">' +
            '<button class="btn btn-sm btn-primary" data-action="paper-open" data-id="' + p.id + '">Open</button> ' +
            '<button class="btn btn-sm" data-action="paper-errors" data-id="' + p.id + '">Errors</button> ' +
            '<button class="btn btn-sm btn-ghost" data-action="log-paper" data-id="' + p.id + '">Edit</button> ' +
            '<button class="btn btn-sm btn-ghost" data-action="paper-delete" data-id="' + p.id + '">✕</button>' +
          '</td></tr>';
      }).join("") + '</tbody></table></div></div>';
  }

  /* ---------- add / edit paper ---------- */
  function paperModal(id) {
    const existing = id ? Store.get().papers.filter(function (p) { return p.id === id; })[0] : null;
    /* If a paper timer is running, bank it and pre-fill the time taken */
    let timed = null;
    const lt = Store.get().timer;
    if (!existing && lt && lt.kind === "paper") {
      const mins = Store.timerElapsedMs() / 60000;
      timed = { minutes: Math.round(mins), type: lt.paperType, duration: lt.paperDuration };
      Store.mutate(function () { Store.timerStop(true); });
    }
    const p = existing || {
      title: "", url: "", type: timed && timed.type ? timed.type : "Pure", date: Metrics.today(),
      level: "alevel",
      duration: timed && timed.duration ? timed.duration : 120,
      timeTaken: timed ? timed.minutes : "",
      mark: "", total: 100, timed: true, full: true, notes: ""
    };
    UI.modal({
      title: existing ? "Edit paper" : "Log a past paper",
      wide: true,
      body:
        '<div class="form-grid">' +
        f("Paper title", '<input class="input" data-p="title" placeholder="e.g. 9MA0/01 June 2023 Pure 1" value="' + UI.esc(p.title) + '">') +
        f("Level", '<select class="input" data-p="level">' + Object.keys(PAPER_LEVELS).map(function (k) {
          return '<option value="' + k + '"' + (levelOf(p) === k ? " selected" : "") + '>' + PAPER_LEVELS[k] + '</option>'; }).join("") + '</select>') +
          f("Type", '<select class="input" data-p="type">' + PAPER_TYPES.map(function (t) {
            return '<option' + (p.type === t ? " selected" : "") + '>' + t + '</option>'; }).join("") + '</select>') +
          f("Date completed", '<input class="input" type="date" data-p="date" value="' + UI.esc(p.date) + '">') +
          f("Marks scored", '<input class="input" type="number" min="0" data-p="mark" value="' + UI.esc(p.mark) + '">') +
          f("Total marks", '<input class="input" type="number" min="1" data-p="total" value="' + UI.esc(p.total) + '">') +
          f("Time allowed (min)", '<input class="input" type="number" min="0" data-p="duration" value="' + UI.esc(p.duration) + '">') +
          f("Time taken (min)", '<input class="input" type="number" min="0" data-p="timeTaken" value="' + UI.esc(p.timeTaken) + '">') +
          f("Paper URL (optional)", '<input class="input" data-p="url" placeholder="link to the PDF" value="' + UI.esc(p.url) + '">') +
        '</div>' +
        '<div class="row wrap" style="gap:20px">' +
          '<label class="switch"><input type="checkbox" data-p="timed"' + (p.timed ? " checked" : "") + '><i></i><span>Done under timed conditions</span></label>' +
          '<label class="switch"><input type="checkbox" data-p="full"' + (p.full ? " checked" : "") + '><i></i><span>Full paper (not a section)</span></label>' +
        '</div>' +
        '<div class="field"><label class="label">Notes</label><textarea class="input" data-p="notes" placeholder="How it felt, what to fix, timing issues…">' + UI.esc(p.notes) + '</textarea></div>' +
        '<div class="tiny faint">Grades shown in the tracker are indicative only, real Edexcel boundaries change every series.</div>',
      footer: '<button class="btn" data-modal-close-2>Cancel</button>' +
              '<button class="btn btn-primary" id="savePaper">' + (existing ? "Save changes" : "Save paper") + '</button>',
      onMount: function (box) {
        box.querySelector("[data-modal-close-2]").onclick = UI.closeModal;
        box.querySelector("#savePaper").onclick = function () {
          const get = function (k) {
            const el = box.querySelector('[data-p="' + k + '"]');
            return el.type === "checkbox" ? el.checked : el.value;
          };
          const title = get("title").trim();
          if (!title) { UI.toast("Give the paper a title", "bad"); return; }
          const total = UI.num(get("total"), 100);
          const mark = get("mark") === "" ? null : UI.num(get("mark"));
          if (mark != null && mark > total) { UI.toast("Mark cannot exceed the total", "bad"); return; }
          Store.mutate(function (st) {
            const rec = {
              id: existing ? existing.id : "pp-" + Date.now().toString(36),
              title: title, type: get("type"), level: get("level"), date: get("date"), url: get("url").trim(),
              duration: UI.num(get("duration"), null), timeTaken: UI.num(get("timeTaken"), null),
              mark: mark, total: total, timed: get("timed"), full: get("full"), notes: get("notes"),
              errors: existing ? existing.errors || [] : []
            };
            if (existing) {
              st.papers = st.papers.map(function (x) { return x.id === existing.id ? rec : x; });
            } else {
              st.papers.push(rec);
              Store.log("Logged past paper: " + title, "paper");
            }
          });
          Scheduler.regenerate("past paper logged");
          UI.closeModal();
          UI.toast("Paper saved. Now log the marks you lost, that is what changes your schedule.", "ok", 5000);
          const saved = Store.get().papers[Store.get().papers.length - 1];
          if (!existing) setTimeout(function () { errorModal(saved.id); }, 350);
          App.render();
        };
      }
    });
  }

  function f(label, control) {
    return '<div class="field"><label class="label">' + label + '</label>' + control + '</div>';
  }

  /* ---------- error log ---------- */
  function errorModal(paperId) {
    const paper = Store.get().papers.filter(function (p) { return p.id === paperId; })[0];
    if (!paper) return;
    const errs = paper.errors || [];
    const lost = errs.reduce(function (a, e) { return a + (+e.marks || 0); }, 0);

    const topicOptions = '<option value=""> - choose a topic - </option>' +
      SPEC.filter(function (sp) { return Store.settings().papers[sp.id]; }).map(function (sp) {
        /* Every topic stays selectable here regardless of the Year filter, a
        mistake in a paper must be attributable even if that year is hidden. */
        return '<optgroup label="' + UI.esc(sp.short) + '">' + sp.sections.map(function (sec) {
          return sec.subs.map(function (sub) {
            return '<option value="' + sub.id + '">' + UI.esc("Y" + (sec.year || 1) + " " + sec.name + ", " + sub.name) + '</option>';
          }).join("");
        }).join("") + '</optgroup>';
      }).join("");

    UI.modal({
      title: "Error log, " + paper.title,
      wide: true,
      body:
        '<div class="row wrap" style="gap:10px">' +
          '<span class="pill ' + (lost ? "bad" : "") + '">' + errs.length + ' mistakes · ' + lost + ' marks lost</span>' +
          (paper.mark != null ? '<span class="pill">scored ' + paper.mark + '/' + paper.total + '</span>' : "") +
        '</div>' +
        '<div class="tiny muted">Every mistake you log here feeds straight back into your revision schedule. ' +
        'Repeated losses on a topic will promote it, even if you rated it green.</div>' +
        (errs.length ? '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Q</th><th>Topic</th><th>Marks</th><th>Type</th><th>Why</th><th>Revisit</th><th></th></tr></thead><tbody>' +
          errs.map(function (e, i) {
            const inf = e.topicId ? Store.info(e.topicId) : null;
            return '<tr><td>' + UI.esc(e.qNo || "n/a") + '</td>' +
              '<td class="tiny">' + (inf ? UI.esc(inf.sub.name) + '<div class="faint">' + UI.esc(inf.section.name) + '</div>' : '<span class="faint">unassigned</span>') + '</td>' +
              '<td><b>' + (e.marks || 0) + '</b></td>' +
              '<td class="tiny">' + UI.esc(e.type || "n/a") + '</td>' +
              '<td class="tiny muted">' + UI.esc(e.why || "n/a") + '</td>' +
              '<td>' + (e.revisit ? '<span class="pill warn">yes</span>' : '<span class="pill">no</span>') + '</td>' +
              '<td><button class="btn btn-sm btn-ghost" data-del-err="' + i + '">✕</button></td></tr>';
          }).join("") + '</tbody></table></div>' : '<div class="tiny faint">No mistakes logged for this paper yet.</div>') +

        '<div style="border-top:1px solid var(--border);padding-top:16px">' +
          '<div style="font-weight:700;margin-bottom:10px">Add a mistake</div>' +
          '<div class="form-grid">' +
            f("Question number", '<input class="input" data-e="qNo" placeholder="e.g. 6(b)">') +
            f("Marks lost", '<input class="input" type="number" min="0" data-e="marks" value="1">') +
            f("Type of error", '<select class="input" data-e="type">' + ERROR_TYPES.map(function (t) { return "<option>" + t + "</option>"; }).join("") + '</select>') +
          '</div>' +
          '<div class="field" style="margin-top:12px"><label class="label">Topic</label>' +
            '<select class="input" data-e="topicId">' + topicOptions + '</select></div>' +
          '<div class="field" style="margin-top:12px"><label class="label">Why did you lose it?</label>' +
            '<textarea class="input" data-e="why" placeholder="e.g. didn’t realise I had to use the discriminant; ran out of time"></textarea></div>' +
            '<label class="switch" style="margin-top:12px"><input type="checkbox" data-e="revisit" checked><i></i><span>Needs revisiting, feed this into my schedule</span></label>' +
          '<button class="btn btn-primary btn-block" style="margin-top:14px" id="addErr">Add mistake</button>' +
        '</div>',
      footer: '<button class="btn btn-primary" data-modal-close-2>Done</button>',
      onMount: function (box) {
        box.querySelector("[data-modal-close-2]").onclick = function () { UI.closeModal(); App.render(); };
        box.querySelectorAll("[data-del-err]").forEach(function (b) {
          b.onclick = function () {
            const i = +b.dataset.delErr;
            Store.mutate(function (st) {
              const pp = st.papers.filter(function (x) { return x.id === paperId; })[0];
              pp.errors.splice(i, 1);
            });
            Scheduler.regenerate("error log updated");
            errorModal(paperId);
          };
        });
        box.querySelector("#addErr").onclick = function () {
          const get = function (k) {
            const el = box.querySelector('[data-e="' + k + '"]');
            return el.type === "checkbox" ? el.checked : el.value;
          };
          const marks = UI.num(get("marks"), 0);
          Store.mutate(function (st) {
            const pp = st.papers.filter(function (x) { return x.id === paperId; })[0];
            if (!pp.errors) pp.errors = [];
            pp.errors.push({
              qNo: get("qNo"), marks: marks, type: get("type"), topicId: get("topicId"),
              why: get("why"), revisit: get("revisit")
            });
          });
          Scheduler.regenerate("error logged");
          const tid = get("topicId");
          if (tid) {
            const eff = Metrics.effectiveRag(tid);
            if (eff.adjusted) UI.toast(Store.info(tid).sub.name + " promoted to " + eff.rag.toUpperCase() + " because of past-paper losses", "warn", 5000);
          }
          errorModal(paperId);
        };
      }
    });
  }

  function handle(action, el) {
    switch (action) {
      case "start-paper-timer": {
        UI.modal({
          title: "Start a timed past paper",
          body: '<div class="tiny muted">Pick what you are sitting. The timer runs in the top bar and today\u2019s time bar ' +
              'fills as you go. When you stop it, the elapsed time is carried into the paper log for you.</div>' +
            '<div class="field"><label class="label">Paper</label><select class="input" id="ptType">' +
              PAPER_TYPES.map(function (t) { return "<option>" + t + "</option>"; }).join("") + '</select></div>' +
            '<div class="field"><label class="label">Official time allowed (min)</label>' +
              '<input class="input" type="number" id="ptDur" value="120"></div>',
          footer: '<button class="btn" data-c>Cancel</button><button class="btn btn-primary" id="ptGo">Start the clock</button>',
          onMount: function (box) {
            const typeEl = box.querySelector("#ptType"), durEl = box.querySelector("#ptDur");
            typeEl.onchange = function () { durEl.value = typeEl.value === "Pure" ? 120 : 75; };
            box.querySelector("[data-c]").onclick = UI.closeModal;
            box.querySelector("#ptGo").onclick = function () {
              const label = typeEl.value + " past paper";
              Store.mutate(function () {
                if (Store.get().timer) Store.timerStop(true);
                Store.timerStart(label, "paper", null);
                Store.get().timer.paperType = typeEl.value;
                Store.get().timer.paperDuration = UI.num(durEl.value, null);
              });
              UI.closeModal();
              UI.toast("Clock started \u2014 stop it when you finish and log the paper", "ok", 4500);
              App.render();
            };
          }
        });
        return true;
      }
      case "paper-filter": filters[el.dataset.key] = el.dataset.val; App.render(); return true;
      case "log-paper": paperModal(el && el.dataset ? el.dataset.id : null); return true;
      case "paper-errors": errorModal(el.dataset.id); return true;
      case "paper-delete": {
        const id = el.dataset.id;
        const p = Store.get().papers.filter(function (x) { return x.id === id; })[0];
        UI.confirm("Delete this paper?", "“" + (p ? p.title : "") + "” and its error log will be removed permanently.", "Delete", true)
          .then(function (ok) {
            if (!ok) return;
            Store.mutate(function (st) { st.papers = st.papers.filter(function (x) { return x.id !== id; }); });
            Scheduler.regenerate("paper deleted");
            App.render(); UI.toast("Paper deleted", "ok");
          });
        return true;
      }
    }
    return false;
  }

  return { render: render, handle: handle, paperModal: paperModal, errorModal: errorModal, ERROR_TYPES: ERROR_TYPES };
})();
