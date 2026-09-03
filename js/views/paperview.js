/* ============================================================
Paper viewer: sit the paper inside the app, with the mark
   scheme kept behind a deliberate click.
   ============================================================ */

const PaperView = (function () {

  let msRevealed = false;
  let qpUrl = null, msUrl = null;
  let loadingFor = null;

  function open(id) { msRevealed = false; qpUrl = null; msUrl = null; loadingFor = null; }

  function paper(id) {
    return Store.get().papers.filter(function (p) { return p.id === id; })[0] || null;
  }

  function srcFor(p, which) {
    /* a file you added wins over a link */
    if (which === "qp") return p.qpFile ? qpUrl : (p.url || null);
    return p.msFile ? msUrl : (p.msUrl || null);
  }

  function render(root, id) {
    const p = paper(id);
    if (!p) { root.innerHTML = UI.empty("❓", "Paper not found"); return; }

    /* Pull the blobs out of IndexedDB. The key includes the attachment
       names so replacing a PDF reloads it rather than showing the old one. */
    const key = id + "|" + (p.qpFile || "") + "|" + (p.msFile || "");
    if (loadingFor !== key) {
      loadingFor = key;
      qpUrl = null; msUrl = null;
      const jobs = [];
      if (p.qpFile) jobs.push(PaperFiles.url("qp:" + id).then(function (u) { qpUrl = u; }));
      if (p.msFile) jobs.push(PaperFiles.url("ms:" + id).then(function (u) { msUrl = u; }));
      if (jobs.length) Promise.all(jobs).then(function () { App.render(); });
    }

    const qp = srcFor(p, "qp");
    const ms = srcFor(p, "ms");
    const pct = p.total && p.mark != null ? Math.round(p.mark / p.total * 100) : null;

    root.innerHTML =
      '<button class="btn btn-sm btn-ghost" data-action="go" data-view="papers" style="margin-bottom:14px">← All papers</button>' +
      '<div class="card" style="margin-bottom:16px">' +
        '<div class="row wrap" style="gap:10px">' +
          '<div style="flex:1;min-width:0">' +
            '<div class="assess-path">' + UI.esc(p.type || "Paper") + (p.series ? ' · ' + UI.esc(p.series) : "") + '</div>' +
            '<h2 style="font-size:22px;margin:6px 0 0">' + UI.esc(p.title) + '</h2>' +
          '</div>' +
          (pct != null ? '<div style="text-align:right">' + UI.accPill(pct) +
            '<div class="tiny faint" style="margin-top:5px">' + p.mark + '/' + p.total + ' · grade ' + Metrics.estimateGrade(pct) + '</div></div>' : "") +
        '</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:14px">' +
          (Store.get().timer && Store.get().timer.kind === "paper"
            ? '<span class="pill good">' + UI.icon("clock") + 'Timing this paper</span>'
            : '<button class="btn btn-sm" data-action="paper-timer" data-id="' + id + '">' + UI.icon("clock") + 'Start the clock</button>') +
          '<button class="btn btn-sm" data-action="log-paper" data-id="' + id + '">Edit details / score</button>' +
          '<button class="btn btn-sm" data-action="paper-errors" data-id="' + id + '">Log mistakes</button>' +
          '<div class="spacer"></div>' +
          '<button class="btn btn-sm" data-action="paper-attach" data-id="' + id + '" data-kind="qp">' +
            (p.qpFile ? "Replace paper PDF" : "Attach paper PDF") + '</button>' +
          '<button class="btn btn-sm" data-action="paper-attach" data-id="' + id + '" data-kind="ms">' +
            (p.msFile ? "Replace mark scheme" : "Attach mark scheme") + '</button>' +
        '</div>' +
      '</div>' +

      /* ---------- question paper ---------- */
      '<div class="sess-step" style="margin-bottom:16px">' +
        '<div class="sess-head"><div class="sess-n">1</div>' +
          '<div><div class="sess-title">Question paper</div>' +
          '<div class="tiny muted">Sit it here. The mark scheme stays hidden below.</div></div>' +
          '<div class="spacer"></div>' +
        '</div>' +
        '<div class="sess-body">' + viewer(qp, p.qpFile, "paper") + '</div>' +
      '</div>' +

      /* ---------- mark scheme ---------- */
      '<div class="sess-step">' +
        '<div class="sess-head"><div class="sess-n ' + (msRevealed ? "done" : "") + '">2</div>' +
          '<div><div class="sess-title">Mark scheme</div>' +
          '<div class="tiny muted">' + (msRevealed ? "Mark honestly, then log every lost mark." : "Hidden until you ask for it.") + '</div></div>' +
        '</div>' +
        '<div class="sess-body">' +
          (msRevealed
            ? viewer(ms, p.msFile, "mark scheme") +
              '<div class="row wrap" style="gap:8px">' +
                '<button class="btn" data-action="paper-hide-ms">Hide it again</button>' +
                '<button class="btn btn-primary" data-action="paper-errors" data-id="' + id + '">Log the marks you lost</button>' +
              '</div>'
            : '<div class="ms-lock">' +
                '<div class="ms-lock-ico">' + UI.icon("alert") + '</div>' +
                '<div><b>The mark scheme is hidden</b>' +
                '<div class="tiny muted" style="margin-top:4px">Finish the paper first. Revealing early is the fastest way ' +
                'to convince yourself you knew something you did not.</div></div>' +
                '<button class="btn btn-primary" data-action="paper-reveal-ms">Reveal mark scheme</button>' +
              '</div>') +
        '</div>' +
      '</div>';
  }

  /* Embedded PDF. A file you attached always renders; a link only renders
     if that server allows framing, so we say so plainly. */
  function viewer(src, isFile, what) {
    if (!src) {
      return '<div class="warnbox"><b>No ' + UI.esc(what) + ' attached yet</b>' +
      'Download the PDF once from the Pearson course page, then attach it above, it is stored in this browser ' +
        'and opens inside the app from then on. You can also paste a direct link when you add the paper.' +
        '<div class="row wrap" style="gap:6px;margin-top:10px">' +
          '<a class="btn btn-sm" href="' + PEARSON_PAPERS_URL + '" target="_blank" rel="noopener">Pearson past papers ↗</a>' +
        '</div></div>';
    }
    return '<div class="pdf-frame">' +
        '<div class="pdfv" data-src="' + UI.esc(src) + '"></div>' +
      '</div>' +
      (isFile ? "" :
        '<div class="tiny faint">This is a link rather than an attached file. If the panel above stays blank, that site ' +
        'does not allow being framed, attach the PDF instead and it will always open here.</div>');
  }

  function handle(action, el) {
    switch (action) {
      case "paper-reveal-ms": {
        const p = paper(App.params().id);
        if (p && !p.msFile && !p.msUrl) {
          UI.toast("Attach the mark scheme PDF first", "warn"); return true;
        }
        UI.confirm("Reveal the mark scheme?",
          "Only do this once you have finished the paper. You can hide it again afterwards.",
          "Reveal it", false).then(function (ok) {
            if (!ok) return;
            msRevealed = true; App.render();
          });
        return true;
      }
      case "paper-hide-ms": msRevealed = false; App.render(); return true;

      case "paper-attach": {
        const id = el.dataset.id, kind = el.dataset.kind;
        const inp = document.createElement("input");
        inp.type = "file"; inp.accept = "application/pdf";
        inp.onchange = function () {
          const f = inp.files[0];
          if (!f) return;
          if (f.type !== "application/pdf") { UI.toast("That is not a PDF", "bad"); return; }
          if (f.size > 25 * 1024 * 1024) { UI.toast("That PDF is over 25MB", "bad"); return; }
          PaperFiles.put(kind + ":" + id, f).then(function () {
            Store.mutate(function (st) {
              const p = st.papers.filter(function (x) { return x.id === id; })[0];
              if (p) { p[kind + "File"] = f.name; }
            });
            loadingFor = null; // force a reload of the new file
            UI.toast((kind === "qp" ? "Paper" : "Mark scheme") + " attached, it opens inside the app now", "ok", 4200);
            App.render();
          }).catch(function (e) { UI.toast("Could not store that file: " + e.message, "bad"); });
        };
        inp.click();
        return true;
      }

      case "paper-open": App.go("paperview", { id: el.dataset.id }); return true;

      case "paper-timer": {
        const p = paper(el.dataset.id);
        Store.mutate(function () {
          if (Store.get().timer) Store.timerStop(true);
          Store.timerStart(p ? p.title : "Past paper", "paper", el.dataset.id);
          if (p) { Store.get().timer.paperType = p.type; Store.get().timer.paperDuration = p.duration; }
        });
        UI.toast("Clock started", "ok");
        App.render(); return true;
      }
    }
    return false;
  }

  return { render: render, handle: handle, open: open };
})();
