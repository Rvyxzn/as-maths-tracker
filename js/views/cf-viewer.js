/* ============================================================
   A Chalkface collection, one question at a time.

   A Chalkface PDF prints each question and then its mark scheme
   straight after it, so showing the file whole shows every
   answer as you scroll, and "reveal the mark scheme" showed the
   same file again. Here the file is walked item by item from the
   page ranges tools/extract-chalkface.js recorded: the question's
   own pages, and behind a click, its own scheme pages.

   Used by the Exam Questions page and by each chapter's page;
   `scope` keeps their positions apart.
   ============================================================ */

const CfViewer = (function () {

  const picked = {};   /* scope|set -> item index */
  const shown = {};    /* scope|set|index -> scheme revealed */

  function itemsFor(setKey) {
    const code = String(setKey).replace(/^cf/, "");
    const s = typeof CF_MATHS_SETS !== "undefined" ? CF_MATHS_SETS[code] : null;
    return s && s.items ? s.items : [];
  }

  function viewer(url, from, to, height) {
    return '<div class="pdf-frame" style="height:' + height + '">' +
      '<div class="pdfv" data-src="' + url + '" data-from="' + from + '" data-to="' + to + '"></div>' +
    '</div>';
  }

  function html(setKey, scope) {
    const items = itemsFor(setKey);
    const url = examSetPath(setKey, "q");
    if (!items.length || !url) return '<div class="tiny muted">No questions were read from this collection.</div>';
    const id = scope + "|" + setKey;
    const i = Math.min(picked[id] || 0, items.length - 1);
    const it = items[i];
    const open = !!shown[id + "|" + i];
    const btn = function (action, extra, label, cls) {
      return '<button class="btn btn-sm' + (cls ? " " + cls : "") + '" data-action="' + action + '" ' +
        'data-set="' + setKey + '" data-scope="' + UI.esc(scope) + '" ' + extra + '>' + label + '</button>';
    };

    return '<div class="cfv">' +
      '<div class="cfv-list">' + items.map(function (x, k) {
        return '<button class="cfv-chip' + (k === i ? " on" : "") + (shown[id + "|" + k] ? " seen" : "") + '" ' +
          'data-action="cf-pick" data-set="' + setKey + '" data-scope="' + UI.esc(scope) + '" data-i="' + k + '" ' +
          'title="' + UI.esc(x.source + " · " + x.marks + " marks") + '">' +
          (k + 1) + '<small>' + x.marks + 'm</small></button>';
      }).join("") + '</div>' +

      '<div class="cfv-bar">' +
        btn("cf-pick", 'data-i="' + (i - 1) + '"' + (i === 0 ? " disabled" : ""), "‹ Previous") +
        '<div class="cfv-where"><b>Question ' + (i + 1) + ' of ' + items.length + '</b>' +
          '<small>' + UI.esc(it.source) + ' · ' + it.marks + ' marks</small></div>' +
        btn("cf-pick", 'data-i="' + (i + 1) + '"' + (i === items.length - 1 ? " disabled" : ""), "Next ›") +
      '</div>' +

      viewer(url, it.qFrom, it.qTo, "min(70vh,780px)") +

      (!it.msFrom
        ? '<div class="tiny faint" style="margin-top:10px">No mark scheme was found for this question.</div>'
        : open
          ? '<div class="qz-ms" style="margin-top:12px">' +
              '<div class="qz-ms-h">' + UI.icon("check") + 'Mark scheme, question ' + (i + 1) +
                (it.msCheck === "unverifiable"
                  ? ' <span class="pill" title="These are the pages straight after the question, but they do not print its number, so it could not be double-checked.">not double-checked</span>'
                  : "") +
              '</div>' +
              viewer(url, it.msFrom, it.msTo, "min(62vh,700px)") +
            '</div>' +
            '<div class="row wrap" style="gap:8px;margin-top:10px">' +
              btn("cf-ms", 'data-i="' + i + '" data-val="0"', "Hide the mark scheme") +
              '<div class="spacer"></div>' +
              (i < items.length - 1 ? btn("cf-pick", 'data-i="' + (i + 1) + '"', "Next question ›", "btn-primary") : "") +
            '</div>'
          : '<div class="ms-lock" style="margin-top:12px">' +
              '<div class="ms-lock-ico">' + UI.icon("alert") + '</div>' +
              '<div><b>Mark scheme hidden</b>' +
              '<div class="tiny muted" style="margin-top:4px">Answer question ' + (i + 1) + ' first, then mark it.</div></div>' +
              btn("cf-ms", 'data-i="' + i + '" data-val="1"', "Reveal mark scheme", "btn-primary") +
            '</div>') +
    '</div>';
  }

  function handle(action, el) {
    const d = el.dataset;
    switch (action) {
      case "cf-pick": {
        const n = itemsFor(d.set).length;
        const i = +d.i;
        if (!(i >= 0 && i < n)) return true;
        picked[d.scope + "|" + d.set] = i;
        App.render();
        return true;
      }
      case "cf-ms": {
        const k = d.scope + "|" + d.set + "|" + d.i;
        if (d.val === "1") shown[k] = true; else delete shown[k];
        App.render();
        return true;
      }
      case "mq-source":
        if (d.val === MathsSource.get()) return true;
        MathsSource.set(d.val);
        UI.toast("Showing " + MathsSource.name() + " questions");
        App.render();
        return true;
    }
    return false;
  }

  return { html: html, handle: handle, itemsFor: itemsFor };
})();
