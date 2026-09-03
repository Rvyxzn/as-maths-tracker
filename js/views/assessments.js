/* ============================================================
School Assessments, log class tests, mini-assessments, mocks
============================================================ */

const AssessmentsView = (function () {

    const filters = { kind: "all" };

    function render(root) {
      const s = SchoolAssessments.summary();
      const rows = SchoolAssessments.all().filter(function (a) {
          return filters.kind === "all" || a.kind === filters.kind;
        });

      root.innerHTML =
      '<div class="grid g4" style="margin-bottom:18px">' +
      stat("Logged", s.count, s.topic + " topic · " + s.mock + " mock") +
      stat("Average", s.avg != null ? s.avg + "%" : "n/a", s.avg != null ? "across scored entries" : "no marks recorded yet") +
      stat("Latest", s.latest != null ? s.latest + "%" : "n/a", "") +
      stat("Grade only", s.gradeOnly, s.gradeOnly ? "not counted in the average" : "") +
      '</div>' +

      '<div class="card" style="margin-bottom:18px">' +
      '<div class="card-head"><div class="card-title">Your school results over time</div>' +
      '<div class="right"><button class="btn btn-sm btn-primary" data-action="log-assessment">+ Log an assessment</button></div>' +
      '</div>' +
      UI.lineChart(SchoolAssessments.trend(), { height: 180,
          emptyText: "Log an assessment with a mark to start the graph" }) +
      '<div class="tiny faint" style="margin-top:10px">Only entries with a mark out of a total appear here. ' +
      'Grade-only entries are kept in the table below but cannot be plotted, a letter has no percentage.</div>' +
      '</div>' +

      '<div class="card" style="margin-bottom:18px"><div class="row wrap" style="gap:16px">' +
      chips("kind", ["all", "topic", "mock"],
        { all: "All assessments", topic: "Topic tests", mock: "Mocks / full papers" }) +
      '</div></div>' +

      (rows.length ? table(rows) :
        (s.count ? UI.empty("🔍", "Nothing matches that filter")
          : UI.empty("✎", "No school assessments logged yet",
            "Chapter tests, mini-assessments and mocks all go here. Topic tests attach themselves to the chapter they cover, so a weak score pushes that chapter up your plan.") +
          '<div class="row" style="justify-content:center">' +
          '<button class="btn btn-primary" data-action="log-assessment">Log your first assessment</button></div>'));
    }

    function stat(k, v, sub) {
      return '<div class="stat"><div class="stat-k">' + UI.esc(k) + '</div><div class="stat-v">' + UI.esc(String(v)) + '</div>' +
      (sub ? '<div class="stat-sub">' + UI.esc(sub) + '</div>' : "") + '</div>';
    }

    function chips(key, vals, labels) {
      return '<div class="chips">' + vals.map(function (v) {
          return '<button class="chip' + (filters[key] === v ? " on" : "") + '" data-action="assess-filter" data-key="' + key + '" data-val="' + v + '">' +
          UI.esc(labels[v]) + '</button>';
        }).join("") + '</div>';
    }

    function table(rows) {
      return '<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr>' +
      '<th>Assessment</th><th>Kind</th><th>Date</th><th>Result</th><th>Attached to</th><th></th>' +
      '</tr></thead><tbody>' + rows.map(function (a) {
          const p = SchoolAssessments.pct(a);
          const chapters = (a.chapterIds || []).map(function (cid) {
              const inf = CHAPTER_INDEX[cid];
              return inf ? '<span class="pill">' + UI.esc(inf.chapterLabel) + '</span>' : "";
            }).join(" ");
          return '<tr>' +
          '<td><b>' + UI.esc(a.title) + '</b>' +
          (a.notes ? '<div class="tiny muted" style="max-width:280px">' + UI.esc(a.notes) + '</div>' : "") + '</td>' +
          '<td><span class="pill' + (a.kind === "mock" ? " warn" : "") + '">' +
          (a.kind === "mock" ? "Mock / full paper" : "Topic test") + '</span></td>' +
          '<td class="tiny">' + (a.date ? Metrics.fmtDate(a.date) : "n/a") + '</td>' +
          '<td>' + (p != null
            ? a.mark + " / " + a.total + " " + UI.accPill(p)
            : (a.grade ? '<b>' + UI.esc(a.grade) + '</b> <span class="tiny faint">grade only</span>' : "n/a")) + '</td>' +
          '<td class="tiny">' + (a.kind === "mock"
            ? '<span class="faint">whole paper, not attached</span>'
            : (chapters || '<span class="faint">no chapter set</span>')) + '</td>' +
          '<td style="white-space:nowrap">' +
          '<button class="btn btn-sm btn-ghost" data-action="log-assessment" data-id="' + a.id + '">Edit</button> ' +
          '<button class="btn btn-sm btn-ghost" data-action="assess-delete" data-id="' + a.id + '">✕</button>' +
          '</td></tr>';
        }).join("") + '</tbody></table></div></div>';
    }

    /* ---------- add / edit ---------- */
    function modal(id) {
      const existing = id ? SchoolAssessments.get(id) : null;
      const a = existing || {
        title: "", date: Metrics.today(), kind: "topic", chapterIds: [],
        scoreMode: "marks", mark: "", total: "", grade: "B", notes: ""
      };

      UI.modal({
          title: existing ? "Edit assessment" : "Log a school assessment",
          wide: true,
          body:
          '<div class="form-grid">' +
          f("What was it called?", '<input class="input" data-a="title" placeholder="e.g. Chapter 5 Radians test" value="' + UI.esc(a.title) + '">') +
          f("Date", '<input class="input" type="date" data-a="date" value="' + UI.esc(a.date) + '">') +
          '</div>' +

          '<div class="field"><label class="label">What kind of assessment?</label>' +
          '<div class="chips" data-a-chips="kind">' +
          kindChip("topic", "Topic test", a.kind) +
          kindChip("mock", "Mock / full paper", a.kind) +
          '</div>' +
          '<div class="tiny faint" style="margin-top:6px">A topic test attaches to the chapters it covered, so a weak score ' +
          'raises those chapters in your plan. A mock covers everything, so it is tracked as an overall grade only.</div></div>' +

          '<div class="field" id="chapterField"' + (a.kind === "mock" ? ' style="display:none"' : "") + '>' +
          '<label class="label">Chapters it covered</label>' +
          '<div class="tiny faint" style="margin-bottom:6px">Suggested from the title as you type, tick or untick to correct it.</div>' +
          '<div id="chapterSuggest"></div>' +
          '<select class="input" id="chapterAdd" style="margin-top:8px">' +
          '<option value="">+ add another chapter…</option>' +
          SPEC.map(function (sp) {
              return '<optgroup label="' + UI.esc(sp.short) + '">' + sp.sections.map(function (sec) {
                  return '<option value="' + CHAPTER_PREFIX + sec.id + '">' +
                  UI.esc("Y" + (sec.year || 1) + " Ch " + sec.num + " · " + sec.name) + '</option>';
                }).join("") + '</optgroup>';
            }).join("") +
          '</select></div>' +

          '<div class="field"><label class="label">What do you know about the result?</label>' +
          '<div class="chips" data-a-chips="scoreMode">' +
          modeChip("marks", "A mark out of a total", a.scoreMode) +
          modeChip("grade", "Only the grade", a.scoreMode) +
          '</div></div>' +

          '<div id="marksField"' + (a.scoreMode === "grade" ? ' style="display:none"' : "") + '>' +
          '<div class="form-grid">' +
          f("Marks scored", '<input class="input" type="number" min="0" data-a="mark" value="' + UI.esc(a.mark) + '">') +
          f("Out of", '<input class="input" type="number" min="1" data-a="total" value="' + UI.esc(a.total) + '">') +
          '</div></div>' +

          '<div id="gradeField"' + (a.scoreMode === "grade" ? "" : ' style="display:none"') + '>' +
          f("Grade awarded", '<select class="input" data-a="grade">' + SchoolAssessments.GRADES.map(function (g) {
                return '<option' + (a.grade === g ? " selected" : "") + '>' + g + '</option>'; }).join("") + '</select>') +
          '<div class="tiny faint">A grade on its own has no percentage behind it, so this entry is kept in your history ' +
          'but is not used to rank chapters or plotted on the graph. Add the marks later if you find them out.</div></div>' +

          '<div class="field"><label class="label">Notes</label>' +
          '<textarea class="input" data-a="notes" placeholder="What went wrong, what to go back to…">' + UI.esc(a.notes) + '</textarea></div>',

          footer: '<button class="btn" data-a-cancel>Cancel</button>' +
          '<button class="btn btn-primary" id="saveAssessment">' + (existing ? "Save changes" : "Save assessment") + '</button>',

          onMount: function (box) {
            let kind = a.kind;
            let scoreMode = a.scoreMode;
            let chosen = (a.chapterIds || []).slice();
            /* Once the student edits the ticks themselves, stop overwriting their
            choice from the title, the suggestion is a starting point, not a
            thing that keeps snatching the wheel back. */
            let userTouched = !!existing;

            const get = function (k) { return box.querySelector('[data-a="' + k + '"]').value; };

            function drawChapters() {
              const host = box.querySelector("#chapterSuggest");
              if (!chosen.length) {
                host.innerHTML = '<div class="tiny faint">Nothing matched yet, type the chapter or topic name, or pick one below.</div>';
                return;
              }
              host.innerHTML = '<div class="chips">' + chosen.map(function (cid) {
                  const inf = CHAPTER_INDEX[cid];
                  if (!inf) return "";
                  return '<button class="chip on" data-drop="' + cid + '" title="Remove">' +
                  UI.esc(inf.chapterLabel) + ' ✕</button>';
                }).join("") + '</div>';
              host.querySelectorAll("[data-drop]").forEach(function (b) {
                  b.onclick = function () {
                    userTouched = true;
                    chosen = chosen.filter(function (c) { return c !== b.dataset.drop; });
                    drawChapters();
                  };
                });
            }

            function resuggest() {
              if (userTouched || kind === "mock") return;
              chosen = SchoolAssessments.suggest(get("title"));
              drawChapters();
            }

            box.querySelector('[data-a="title"]').addEventListener("input", resuggest);

            box.querySelector("#chapterAdd").onchange = function () {
              const v = this.value;
              this.value = "";
              if (!v) return;
              userTouched = true;
              if (chosen.indexOf(v) < 0) chosen.push(v);
              drawChapters();
            };

            box.querySelectorAll('[data-a-chips="kind"] .chip').forEach(function (c) {
                c.onclick = function () {
                  kind = c.dataset.val;
                  box.querySelectorAll('[data-a-chips="kind"] .chip').forEach(function (x) {
                      x.classList.toggle("on", x.dataset.val === kind);
                    });
                  box.querySelector("#chapterField").style.display = kind === "mock" ? "none" : "";
                  if (kind === "mock") { chosen = []; drawChapters(); }
                  else resuggest();
                };
              });

            box.querySelectorAll('[data-a-chips="scoreMode"] .chip').forEach(function (c) {
                c.onclick = function () {
                  scoreMode = c.dataset.val;
                  box.querySelectorAll('[data-a-chips="scoreMode"] .chip').forEach(function (x) {
                      x.classList.toggle("on", x.dataset.val === scoreMode);
                    });
                  box.querySelector("#marksField").style.display = scoreMode === "grade" ? "none" : "";
                  box.querySelector("#gradeField").style.display = scoreMode === "grade" ? "" : "none";
                };
              });

            box.querySelector("[data-a-cancel]").onclick = UI.closeModal;
            drawChapters();

            box.querySelector("#saveAssessment").onclick = function () {
              const title = get("title").trim();
              if (!title) { UI.toast("Give the assessment a name", "bad"); return; }

              let mark = null, total = null;
              if (scoreMode === "marks") {
                total = UI.num(get("total"), null);
                mark = get("mark") === "" ? null : UI.num(get("mark"));
                if (!total) { UI.toast("Enter what it was marked out of", "bad"); return; }
                if (mark == null) { UI.toast("Enter the mark you scored", "bad"); return; }
                if (mark > total) { UI.toast("Mark cannot exceed the total", "bad"); return; }
              }

              SchoolAssessments.save({
                  id: existing ? existing.id : "sa-" + Date.now().toString(36),
                  title: title, date: get("date"), kind: kind,
                  chapterIds: kind === "mock" ? [] : chosen,
                  scoreMode: scoreMode,
                  mark: mark, total: total,
                  grade: scoreMode === "grade" ? get("grade") : null,
                  notes: get("notes")
                });

              Scheduler.regenerate("school assessment logged");
              UI.closeModal();
              UI.toast(kind === "mock"
                ? "Mock saved, tracked as an overall grade."
                : (chosen.length ? "Saved and attached to " + chosen.length + " chapter" + (chosen.length > 1 ? "s" : "") + "."
                  : "Saved. Attach a chapter to make it affect your plan."), "ok", 4500);
              App.render();
            };
          }
        });
    }

    function f(label, control) {
      return '<div class="field"><label class="label">' + label + '</label>' + control + '</div>';
    }
    function kindChip(v, label, cur) {
      return '<button class="chip' + (cur === v ? " on" : "") + '" data-val="' + v + '">' + label + '</button>';
    }
    const modeChip = kindChip;

    function handle(action, el) {
      if (action === "assess-filter") { filters[el.dataset.key] = el.dataset.val; App.render(); return true; }
      if (action === "log-assessment") { modal(el.dataset.id || null); return true; }
      if (action === "assess-delete") {
        const a = SchoolAssessments.get(el.dataset.id);
        if (!a) return true;
        UI.confirm("Delete this assessment?",
          "“" + a.title + "” will be removed from your record.", "Delete", true)
          .then(function (ok) {
            if (!ok) return;
            SchoolAssessments.remove(a.id);
            Scheduler.regenerate("school assessment deleted");
            UI.toast("Assessment deleted", "ok");
            App.render();
          });
        return true;
      }
      return false;
    }

    return { render: render, handle: handle, modal: modal };
  })();
