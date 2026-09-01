/* ============================================================
   Chapter view — the revision method, one chapter at a time.

     1. Watch the whole playlist   (embedded, ticked off video by video)
     2. Topic questions            (in-app, mark scheme hidden until asked for)
     3. Mark and record the score
     4. Update the RAG rating
   ============================================================ */

const ChapterView = (function () {

  let openQ = null;      // index of the question currently expanded
  let qBand = "all";     // difficulty filter on the question list (view only)
  const revealedMs = {}; // chapters whose attached mark scheme is showing
  const pdfUrls = {};    // blob urls for attached PDFs, by chapter
  let pdfLoaded = {};    // what has already been fetched out of IndexedDB

  function render(root, cid) {
    const inf = Store.info(cid);
    if (!inf || !inf.chapter) { root.innerHTML = UI.empty("❓", "Chapter not found"); return; }
    const st = Journey.state(cid);
    const t = Store.topic(cid);
    const eff = Metrics.effectiveRag(cid);

    /* fetch any attached PDFs once per chapter/attachment */
    const key = cid + "|" + (t.qSetFile || "") + "|" + (t.qMsFile || "");
    if (pdfLoaded[cid] !== key) {
      pdfLoaded[cid] = key;
      const jobs = [];
      if (t.qSetFile) jobs.push(PaperFiles.url("chq:" + cid).then(function (u) { pdfUrls[cid + ":q"] = u; }));
      if (t.qMsFile) jobs.push(PaperFiles.url("chms:" + cid).then(function (u) { pdfUrls[cid + ":ms"] = u; }));
      if (jobs.length) Promise.all(jobs).then(function () { App.render(); });
    }

    root.innerHTML =
      '<button class="btn btn-sm btn-ghost" data-action="go" data-view="topics" style="margin-bottom:14px">← All chapters</button>' +
      header(cid, inf, t, eff, st) +
      stepper(st) +
      '<div class="stack" style="gap:16px;margin-top:16px">' +
        stepVideo(cid, inf, st) +
        stepQuestions(cid, st) +
        stepMark(cid, st) +
        stepRag(cid, t, st) +
      '</div>';
  }

  function header(cid, inf, t, eff, st) {
    return '<div class="card">' +
      '<div class="row wrap" style="gap:10px">' +
        '<div style="flex:1;min-width:0">' +
          '<div class="assess-path">' + UI.esc(inf.paper.short) + ' · Chapter ' + UI.esc(inf.chapter.num) + '</div>' +
          '<h2 style="font-size:24px;margin:6px 0 0">' + UI.esc(inf.chapter.name) + '</h2>' +
          '<div class="tiny muted" style="margin-top:6px">' + UI.math(inf.chapter.desc) + '</div>' +
        '</div>' +
        '<div style="text-align:right">' + UI.ragPill(eff.rag) +
          '<div class="tiny faint" style="margin-top:6px">' + st.doneCount + ' of ' + st.totalSteps + ' steps done</div>' +
          '<div style="margin-top:8px">' + UI.todayToggle(cid, { label: true }) + '</div>' +
        '</div>' +
      '</div>' +
      (st.complete ? '<div class="focus-banner" style="margin-top:12px">' +
        '<b>Chapter complete.</b> Playlist watched, questions marked and confidence updated. ' +
        'It will still come back for retrieval practice.</div>' : "") +
    '</div>';
  }

  function stepper(st) {
    const order = ["video", "questions", "marked", "rag"];
    return '<div class="chapter-steps">' + order.map(function (k, i) {
      const s = st.steps[k];
      const label = Journey.STEPS[i].label;
      const cls = s.done ? "done" : (st.current === k ? "current" : "todo");
      return '<div class="chapter-step ' + cls + '">' +
        '<span class="chapter-step-n">' + (s.done ? UI.icon("check") : (i + 1)) + '</span>' +
        '<span class="chapter-step-l">' + label +
          (s.total > 1 ? '<small>' + s.count + '/' + s.total + '</small>' : '') + '</span>' +
      '</div>';
    }).join("") + '</div>';
  }

  /* ---------------- 1. playlist ---------------- */
  function stepVideo(cid, inf, st) {
    const t = Store.topic(cid);
    const total = Journey.totalVideos(cid);
    const watched = t.videoWatched || [];
    const custom = !!t.videoUrl;
    const pl = inf.playlist;

    const cur = Journey.currentEpisode(cid);
    const embed = Journey.embedSource(cid);
    const counted = Journey.countedVideos(cid);
    const skipped = Journey.skippedVideos(cid).length;

    /* Each episode is two controls in one pill: the number jumps the player
       to it, the tick marks it watched. They are deliberately separate —
       skipping ahead to re-watch something should not tick it off. */
    let ticks = "";
    for (let i = 1; i <= total; i++) {
      const on = watched.indexOf(i) >= 0;
      const off = Journey.isSkippedVideo(cid, i);
      ticks += '<span class="vid-tick' + (on && !off ? " on" : "") + (i === cur ? " playing" : "") +
          (off ? " excluded" : "") + '">' +
        '<button class="vid-go" data-action="ch-ep" data-id="' + cid + '" data-n="' + i + '" ' +
          'title="' + (off ? "Play video " + i + " (does not count towards the chapter)" : "Play video " + i) + '">' +
          (i === cur ? UI.icon("play") : "") + 'Ep ' + i + '</button>' +
        (off
          ? '<span class="vid-check off" title="Not part of the course — does not count">' + UI.icon("minus") + '</span>'
          : '<button class="vid-check ' + (on ? "on" : "") + '" data-action="ch-video" data-id="' + cid + '" data-n="' + i + '" ' +
            'title="' + (on ? "Mark video " + i + " unwatched" : "Mark video " + i + " watched") + '">' +
            UI.icon("check") + '</button>') +
      '</span>';
    }

    return card(1, "Watch the entire playlist", st.steps.video.done,
      (embed
        ? '<div class="video-frame"><div class="ytp" id="chVideoFrame" data-cid="' + UI.esc(cid) + '"' +
            (embed.list ? ' data-list="' + UI.esc(embed.list) + '"' : "") +
            (embed.video ? ' data-video="' + UI.esc(embed.video) + '"' : "") +
            ' data-ep="' + cur + '"></div></div>' +
          episodeBar(cid, cur, total, watched) +
          '<div class="tiny faint">' +
            (custom ? "Your own link." : "Zeeshan Zamurred — " + UI.esc(inf.paper.short === "Pure" ? "Pure Maths Year 1" : inf.paper.short === "Stats" ? "Statistics Year 1" : "Mechanics Year 1") +
              ", Chapter " + UI.esc(inf.chapter.num) + ".") +
            ' Skip between episodes with the buttons above, or the playlist button inside the player.</div>'
        : '<div class="warnbox"><b>No playlist found for this chapter</b>' +
            'There is no Zeeshan Zamurred playlist for this chapter on his channel, so nothing has been guessed. ' +
            'Paste a playlist or video link below and it will be embedded here and remembered.</div>') +

      '<div class="row wrap" style="gap:8px">' +
        '<input class="input" id="chVidUrl" placeholder="Paste a YouTube playlist or video link…" ' +
          'value="' + UI.esc(t.videoUrl || "") + '" style="flex:1;min-width:200px">' +
        '<button class="btn" data-action="ch-video-url" data-id="' + cid + '">Save link</button>' +
        (t.videoUrl ? '<button class="btn btn-sm btn-ghost" data-action="ch-video-reset" data-id="' + cid + '">Use the default</button>' : "") +
        (embed ? '<a class="btn btn-sm" href="' + UI.esc(Journey.playlistUrl(cid)) + '" target="_blank" rel="noopener">Open on YouTube ↗</a>' : "") +
      '</div>' +

      '<div>' +
        '<div class="row" style="margin-bottom:8px">' +
          '<b class="tiny">Chapter video progress</b><div class="spacer"></div>' +
          (skipped ? '<span class="tiny faint">' + skipped + ' not counted</span>' : "") +
          '<span class="pill' + (st.steps.video.done ? " good" : "") + '">' + st.steps.video.count + ' / ' + counted + '</span>' +
          '<button class="btn btn-sm btn-ghost" data-action="ch-video-count" data-id="' + cid + '">Which videos count?</button>' +
        '</div>' +
        UI.bar(counted ? st.steps.video.count / counted * 100 : 0) +
        '<div class="vid-ticks">' + ticks + '</div>' +
        '<div class="row wrap" style="gap:6px;margin-top:10px">' +
          '<button class="btn btn-sm" data-action="ch-video-all" data-id="' + cid + '">Mark the whole playlist watched</button>' +
          (watched.length ? '<button class="btn btn-sm btn-ghost" data-action="ch-video-none" data-id="' + cid + '">Clear</button>' : "") +
        '</div>' +
      '</div>',
      "The chapter is not video-complete until every video is ticked");
  }

  function episodeBar(cid, cur, total, watched) {
    const vm = Journey.videoMinutes(cid);
    const counted = Journey.countedVideos(cid);
    const left = counted - Journey.watchedCount(cid);

    return '<div class="ep-bar">' +
      '<div class="ep-nav">' +
        '<button class="btn btn-sm" data-action="ch-ep" data-id="' + cid + '" data-n="' + (cur - 1) + '"' +
          (cur <= 1 ? " disabled" : "") + ' title="Previous episode">← Prev</button>' +
        '<span class="ep-now">Episode <b>' + cur + '</b> of ' + total + '</span>' +
        '<button class="btn btn-sm" data-action="ch-ep" data-id="' + cid + '" data-n="' + (cur + 1) + '"' +
          (cur >= total ? " disabled" : "") + ' title="Next episode">Next →</button>' +
        '<div class="spacer"></div>' +
        '<a class="btn btn-sm btn-ghost" href="' + UI.esc(Journey.episodeUrl(cid, cur)) + '" target="_blank" rel="noopener" ' +
          'title="Open this episode on YouTube">Watch on YouTube ↗</a>' +
      '</div>' +
      '<div class="ep-time">' +
        '<span class="ep-time-main">' + UI.icon("clock") +
          'Total video time <b>' + (vm.exact ? "" : "about ") + Metrics.fmtMins(vm.total) + '</b>' +
          (vm.estimated
            ? '<span class="ep-est" title="A video’s length is only known once it has been loaded. ' +
              vm.knownCount + ' measured, ' + vm.unknownCount + ' still estimated from the average, so this figure ' +
              'moves as you watch more.">' + vm.knownCount + '/' + vm.episodes + ' measured</span>'
            : "") +
        '</span>' +
        (left > 0
          ? '<span class="ep-time-left">' + (vm.exact ? "" : "about ") + Metrics.fmtMins(vm.remaining) +
            ' still to watch · ' + left + ' video' + (left === 1 ? "" : "s") +
            (vm.skipped ? ' · ' + vm.skipped + ' not counted' : "") + '</span>'
          : '<span class="ep-time-left done">' + UI.icon("check") + 'All watched</span>') +
        '<div class="spacer"></div>' +
        '<button class="btn btn-sm btn-ghost" data-action="ch-ep-times" data-id="' + cid + '">' +
          (vm.knownCount ? "Edit episode lengths" : "Add episode lengths") + '</button>' +
      '</div>' +
    '</div>';
  }

  /* ---------------- 2. topic questions ---------------- */
  function stepQuestions(cid, st) {
    const locked = !st.steps.video.done;
    const qs = Journey.questionsFor(cid);
    const shown = Journey.selectedQuestions(cid);
    const ans = Journey.answersFor(cid);

    if (locked) {
      return card(2, "Topic questions", false,
        '<div class="warnbox"><b>Finish the playlist first</b>' +
        'The method is playlist → questions. ' + (Journey.totalVideos(cid) - Journey.watchedCount(cid)) +
        ' video(s) still to watch. You can override this by ticking the remaining videos above.</div>',
        "Locked until the playlist is done");
    }

    const body = shown.filter(function (i) {
      return qBand === "all" || Journey.bandOf(cid, i) === qBand;
    }).map(function (i, pos) {
      const q = qs[i];
      const a = ans[i] || {};
      const open = openQ === i;
      const band = Journey.bandOf(cid, i);
      return '<div class="qz' + (a.recorded ? " recorded" : "") + (open ? " open" : "") + '">' +
        '<div class="qz-head" data-action="ch-q-open" data-id="' + cid + '" data-n="' + i + '">' +
          '<span class="qz-n">' + (i + 1) + '</span>' +
          '<div class="qz-q">' + UI.math(q.q) + '</div>' +
          '<span class="band band-' + band + '" title="Rated by how many marks it carries">' + band + '</span>' +
          '<span class="pill">' + q.marks + ' marks</span>' +
          (a.recorded ? '<span class="pill ' + (a.marksGot >= q.marks ? "good" : a.marksGot > 0 ? "warn" : "bad") + '">' +
            a.marksGot + '/' + q.marks + '</span>' : "") +
          '<span class="qz-chev">' + (open ? "▾" : "▸") + '</span>' +
        '</div>' +
        (open ? '<div class="qz-body">' +
          (q.img ? '<img class="qz-img" src="' + UI.esc(q.img) + '" alt="Question">' : "") +
          '<div class="field"><label class="label">Your working / answer</label>' +
            '<textarea class="input" data-work="' + i + '" placeholder="Work it out on paper, then note your answer here…">' +
            UI.esc(a.work || "") + '</textarea></div>' +
          (a.revealed
            ? '<div class="qz-ms"><div class="qz-ms-h">' + UI.icon("check") + 'Mark scheme</div>' +
              UI.markScheme(q.ms) +
              (q.sketch && SKETCH.has(q.sketch)
                ? '<div class="qz-sketch">' + SKETCH.render(q.sketch) +
                  '<div class="tiny faint">What the sketch should look like.</div></div>'
                : "") +
              '</div>' +
              '<div class="row wrap" style="gap:8px;align-items:flex-end">' +
                '<div class="field" style="width:130px"><label class="label">Marks you got</label>' +
                  '<input class="input" type="number" min="0" max="' + q.marks + '" ' +
                  'data-got="' + i + '" value="' + (a.marksGot != null ? a.marksGot : "") + '"></div>' +
                '<span class="tiny faint">out of ' + q.marks + '</span>' +
                '<div class="spacer"></div>' +
                '<button class="btn btn-primary" data-action="ch-q-record" data-id="' + cid + '" data-n="' + i + '">' +
                  (a.recorded ? "Update" : "Record and next") + '</button>' +
              '</div>'
            : '<button class="btn btn-primary btn-block" data-action="ch-q-reveal" data-id="' + cid + '" data-n="' + i + '">' +
                'Reveal mark scheme</button>' +
              '<div class="tiny faint" style="text-align:center">Attempt it fully first — the answer stays hidden until you ask.</div>') +
        '</div>' : "") +
      '</div>';
    }).join("");

    return card(2, "Topic questions", st.steps.questions.done,
      '<div class="row wrap" style="gap:8px;align-items:center">' +
        '<span class="pill' + (st.steps.questions.done ? " good" : "") + '">' +
          st.steps.questions.count + ' / ' + st.steps.questions.total + ' answered</span>' +
        bandFilter(cid) +
        '<div class="spacer"></div>' +
        '<button class="btn btn-sm" data-action="ch-q-add" data-id="' + cid + '">+ Add your own question</button>' +
      '</div>' +
      answeredTally(cid, st) +
      '<div class="qz-list">' + body + '</div>' +
      questionPdf(cid) +
      "Attempt, reveal, mark, record");
  }

  /* Filter the list by difficulty, so picking "two mediums and two hards"
     is a couple of clicks rather than a hunt. Filtering only changes what
     is on screen — it never changes what has been counted. */
  function bandFilter(cid) {
    const bands = Journey.questionBands(cid);
    const chip = function (v, label, n) {
      return '<button class="chip tiny' + (qBand === v ? " on" : "") + '" data-action="ch-q-band" data-val="' + v + '">' +
        label + (n != null ? ' <span class="faint">' + n + '</span>' : "") + '</button>';
    };
    return '<span class="qcount">' +
      chip("all", "All") +
      chip("easy", "Easier", bands.easy.length) +
      chip("medium", "Middling", bands.medium.length) +
      chip("hard", "Harder", bands.hard.length) +
    '</span>';
  }

  /* What you have actually answered. You choose the mix — say two
     middling, two harder and one easier — and only those are totalled. */
  function answeredTally(cid, st) {
    const b = Journey.answeredBreakdown(cid);
    const t = Store.topic(cid);
    if (!b.count) {
      return '<div class="spread-note">' +
        '<b>Answer whichever questions you want.</b> You do not have to do all of them — pick a mix, ' +
        'and only the ones you answer are marked and counted.' +
        '<div class="tiny faint" style="margin-top:5px">Difficulty is judged by how many marks each question ' +
        'carries compared with the others in this chapter, because there is no official difficulty rating.</div>' +
      '</div>';
    }
    return '<div class="spread-note">' +
      '<b>You have answered ' + b.count + '</b> — ' +
      '<span class="band band-easy">' + b.easy + ' easier</span> ' +
      '<span class="band band-medium">' + b.medium + ' middling</span> ' +
      '<span class="band band-hard">' + b.hard + ' harder</span>' +
      ' · ' + b.marks + '/' + b.available + ' marks so far' +
      '<div class="row wrap" style="gap:8px;margin-top:9px">' +
        (st.steps.questions.done
          ? '<span class="pill good">' + UI.icon("check") + 'Questions finished</span>' +
            (t.questionsFinished ? '<button class="btn btn-sm btn-ghost" data-action="ch-q-reopen" data-id="' + cid + '">Answer more</button>' : "")
          : '<button class="btn btn-sm btn-primary" data-action="ch-q-finish" data-id="' + cid + '">' +
              'Done — mark these ' + b.count + '</button>' +
            '<span class="tiny faint">Or keep going; there is no need to do all ' + st.steps.questions.total + '.</span>') +
      '</div>' +
    '</div>';
  }

  /* The real Edexcel topic questions for this chapter, served straight
     from the PDFs in the project folder. Nothing to download or attach —
     the mark scheme simply stays behind a deliberate click. */
  function questionPdf(cid) {
    const inf = Store.info(cid);
    const sets = inf.sets || [];
    const t = Store.topic(cid);

    if (!sets.length) {
      return '<div class="qset"><div class="qset-head">' + UI.icon("paper") +
        '<div style="flex:1"><b>Exam questions</b>' +
        '<div class="tiny muted">No question set is filed against this chapter yet.</div></div>' +
        '<button class="btn btn-sm" data-action="ch-pdf" data-id="' + cid + '" data-kind="q">Attach your own</button>' +
        '</div>' + ownPdf(cid, t) + '</div>';
    }

    return sets.map(function (s, i) {
      const shown = revealedMs[cid + ":" + s.key];
      return '<div class="qset">' +
        '<div class="qset-head">' + UI.icon("paper") +
          '<div style="flex:1;min-width:0"><b>Exam questions — ' + UI.esc(s.name) + '</b>' +
            '<div class="tiny muted">' +
              (s.approx ? UI.esc(s.approx) : "Edexcel questions by topic, with the full mark scheme.") +
            '</div></div>' +
        '</div>' +
        '<div class="pdf-frame" style="height:min(70vh,780px)">' +
          '<div class="pdfv" data-src="' + s.qUrl + '"></div>' +
        '</div>' +
        (shown
          ? '<div class="qz-ms" style="margin-top:12px">' +
              '<div class="qz-ms-h">' + UI.icon("check") + 'Mark scheme — ' + UI.esc(s.name) + '</div>' +
              '<div class="pdf-frame" style="height:min(60vh,660px);border:0;border-radius:0">' +
                '<div class="pdfv" data-src="' + s.msUrl + '"></div>' +
              '</div></div>' +
            '<button class="btn" style="margin-top:10px" data-action="ch-ms-hide" data-id="' + cid + '" data-key="' + s.key + '">Hide the mark scheme</button>'
          : '<div class="ms-lock" style="margin-top:12px">' +
              '<div class="ms-lock-ico">' + UI.icon("alert") + '</div>' +
              '<div><b>Mark scheme hidden</b>' +
              '<div class="tiny muted" style="margin-top:4px">Work through the questions above first.</div></div>' +
              '<button class="btn btn-primary" data-action="ch-ms-reveal" data-id="' + cid + '" data-key="' + s.key + '">Reveal mark scheme</button>' +
            '</div>') +
      '</div>';
    }).join("") + ownPdf(cid, t);
  }

  /* Anything extra you attach yourself sits below the built-in set */
  function ownPdf(cid, t) {
    if (!t.qSetFile) {
      return '<div class="row" style="margin-top:10px">' +
        '<button class="btn btn-sm btn-ghost" data-action="ch-pdf" data-id="' + cid + '" data-kind="q">' +
        '+ Attach another question set</button></div>';
    }
    const shown = revealedMs[cid + ":own"];
    return '<div class="qset" style="margin-top:12px">' +
      '<div class="qset-head">' + UI.icon("paper") +
        '<div style="flex:1;min-width:0"><b>Your own set</b>' +
        '<div class="tiny muted">' + UI.esc(t.qSetFile) + '</div></div>' +
        '<button class="btn btn-sm" data-action="ch-pdf" data-id="' + cid + '" data-kind="q">Replace</button>' +
        (t.qMsFile ? "" : '<button class="btn btn-sm" data-action="ch-pdf" data-id="' + cid + '" data-kind="ms">Add mark scheme</button>') +
        '<button class="btn btn-sm btn-ghost" data-action="ch-pdf-clear" data-id="' + cid + '">Remove</button>' +
      '</div>' +
      (pdfUrls[cid + ":q"]
        ? '<div class="pdf-frame" style="height:min(60vh,660px)">' +
            '<div class="pdfv" data-src="' + UI.esc(pdfUrls[cid + ":q"]) + '"></div>' +
          '</div>'
        : '<div class="pdf-loading">Opening ' + UI.esc(t.qSetFile) + '…</div>') +
      (t.qMsFile
        ? (shown
            ? '<div class="qz-ms" style="margin-top:12px"><div class="qz-ms-h">' + UI.icon("check") + 'Mark scheme</div>' +
                (pdfUrls[cid + ":ms"]
                  ? '<div class="pdf-frame" style="height:min(55vh,600px);border:0;border-radius:0">' +
                      '<div class="pdfv" data-src="' + UI.esc(pdfUrls[cid + ":ms"]) + '"></div>' +
                    '</div>'
                  : '<div class="pdf-loading">Opening the mark scheme…</div>') + '</div>' +
              '<button class="btn" style="margin-top:10px" data-action="ch-ms-hide" data-id="' + cid + '" data-key="own">Hide the mark scheme</button>'
            : '<div class="ms-lock" style="margin-top:12px">' +
                '<div class="ms-lock-ico">' + UI.icon("alert") + '</div>' +
                '<div><b>Mark scheme hidden</b></div>' +
                '<button class="btn btn-primary" data-action="ch-ms-reveal" data-id="' + cid + '" data-key="own">Reveal mark scheme</button>' +
              '</div>')
        : "") +
    '</div>';
  }

  /* ---------------- 3. mark and record ---------------- */
  function stepMark(cid, st) {
    const locked = !st.steps.questions.done;
    const t = Store.topic(cid);
    const qs = Journey.questionsFor(cid);
    const ans = Journey.answersFor(cid);

    /* only total the questions actually on show, so the score matches the
       set you worked through rather than the whole bank */
    let got = 0, avail = 0, correct = 0, done = 0;
    Journey.selectedQuestions(cid).forEach(function (i) {
      const q = qs[i];
      const a = ans[i];
      if (a && a.recorded) {
        done++; avail += q.marks; got += (a.marksGot || 0);
        if ((a.marksGot || 0) >= q.marks) correct++;
      }
    });
    const pct = avail ? Math.round(got / avail * 100) : null;

    if (locked) {
      return card(3, "Mark your answers and record the score", false,
        '<div class="warnbox"><b>Answer the questions first</b>' +
        (st.steps.questions.total - st.steps.questions.count) + ' question(s) still to record.</div>',
        "Locked until every question is recorded");
    }

    const sc = Metrics.chapterScore(cid);

    return card(3, "Mark your answers and record the score", st.steps.marked.done,
      scoreBlock("Topic questions", sc.topic,
        done + " answered · " + correct + " fully correct") +
      examBlock(cid, sc.exam) +
      overallBlock(cid, sc) +
      '<div class="form-grid">' +
        '<div class="field"><label class="label">Time taken (min)</label>' +
          '<input class="input" type="number" min="0" id="chMins" value="' + UI.esc(t.pendingMins || "") + '"></div>' +
        '<div class="field"><label class="label">Difficulty</label><select class="input" id="chDiff">' +
          ["", "Easy", "Comfortable", "Challenging", "Very hard"].map(function (d) { return "<option>" + d + "</option>"; }).join("") +
        '</select></div>' +
      '</div>' +
      '<div class="field"><label class="label">Mistakes made</label>' +
        '<textarea class="input" id="chMistakes" placeholder="e.g. lost the second solution in the interval; sign slip expanding"></textarea></div>' +
      '<div class="field"><label class="label">Notes</label>' +
        '<textarea class="input" id="chNotes" placeholder="Anything worth keeping for the next pass"></textarea></div>' +
      '<button class="btn btn-primary btn-block" data-action="ch-record" data-id="' + cid + '">' +
        'Record ' + sc.overall.got + '/' + sc.overall.avail +
        ' (' + (sc.overall.pct != null ? sc.overall.pct + "%" : "—") + ') for this chapter</button>' +
      (t.attempts && t.attempts.length ? attemptHistory(t.attempts) : ""),
      "Marks achieved out of marks available");
  }

  /* One scoreline: marks, percentage and grade for a single source. */
  function scoreBlock(title, part, sub, extra) {
    if (!part.has) return "";
    const gd = Metrics.gradeDetail(part.pct, part.avail);
    return '<div class="score-block">' +
      '<div class="row" style="gap:8px;align-items:baseline;margin-bottom:8px">' +
        '<b class="tiny">' + UI.esc(title) + '</b>' +
        (sub ? '<span class="tiny faint">' + UI.esc(sub) + '</span>' : "") +
        '<div class="spacer"></div>' + (extra || "") +
      '</div>' +
      '<div class="score-strip">' +
        scoreBox(part.avail, "marks available") +
        scoreBox(part.got, "marks achieved") +
        '<div class="score-box big"><b>' + part.pct + '%</b><small>score</small></div>' +
        '<div class="score-box big grade grade-' + part.grade.toLowerCase() + '">' +
          '<b>' + part.grade + '</b><small>grade</small></div>' +
      '</div>' +
      (gd && gd.next && gd.marksOff
        ? '<div class="tiny faint" style="margin-top:6px">' + gd.marksOff + ' more mark' +
          (gd.marksOff === 1 ? "" : "s") + ' would have been ' +
          (gd.next === "A" || gd.next === "E" ? "an " : "a ") + gd.next + '</div>'
        : "") +
    '</div>';
  }

  /* Marks from the real Edexcel exam-question PDFs. You mark them yourself
     against the mark scheme, then put the totals in here. */
  function examBlock(cid, part) {
    const t = Store.topic(cid);
    const ex = t.examScore || {};
    const editor =
      '<div class="exam-entry">' +
        '<div class="field" style="width:120px;margin:0"><label class="label">Marks you got</label>' +
          '<input class="input" type="number" min="0" id="chExGot" value="' + UI.esc(ex.got != null ? ex.got : "") + '"></div>' +
        '<span class="exam-sep">out of</span>' +
        '<div class="field" style="width:120px;margin:0"><label class="label">Marks available</label>' +
          '<input class="input" type="number" min="0" id="chExAvail" value="' + UI.esc(ex.avail != null ? ex.avail : "") + '"></div>' +
        '<button class="btn btn-sm btn-primary" data-action="ch-exam-score" data-id="' + cid + '">' +
          (part.has ? "Update" : "Add") + '</button>' +
        (part.has ? '<button class="btn btn-sm btn-ghost" data-action="ch-exam-clear" data-id="' + cid + '">Remove</button>' : "") +
      '</div>';

    if (!part.has) {
      return '<div class="score-block">' +
        '<div class="row" style="gap:8px;align-items:baseline;margin-bottom:8px">' +
          '<b class="tiny">Exam questions</b>' +
          '<span class="tiny faint">the Edexcel PDFs above — mark them, then enter the totals</span>' +
        '</div>' + editor +
      '</div>';
    }
    return scoreBlock("Exam questions", part, "from the Edexcel question set") + editor;
  }

  /* The chapter's real standing: both sources added together. */
  function overallBlock(cid, sc) {
    if (!sc.overall.has) return "";
    if (sc.overall.sources < 2) {
      return '<div class="tiny faint" style="margin:4px 0 12px">' +
        (sc.exam.has
          ? 'Add your topic-question marks as well for a fuller picture of the chapter.'
          : 'Add your exam-question marks above and this becomes a combined total for the chapter.') +
      '</div>';
    }
    return scoreBlock("Whole chapter", sc.overall,
      "topic questions + exam questions",
      '<span class="pill acc">combined</span>');
  }

  function scoreBox(v, label) {
    return '<div class="score-box"><b>' + v + '</b><small>' + label + '</small></div>';
  }

  /* Where that percentage sits against the real published boundaries, and
     how close the next grade up is. Deliberately hedged: a chapter's topic
     questions are not a whole paper, and boundaries move every series. */
  function gradeNote(gd, got, avail) {
    const bands = Metrics.AS_BOUNDARIES.map(function (b) {
      const on = b.grade === gd.grade;
      return '<span class="gb-band' + (on ? " on" : "") + '">' + b.grade +
        '<small>' + Math.round(b.pct) + '%</small></span>';
    }).join("");

    return '<div class="grade-note">' +
      '<div class="row wrap" style="gap:8px;align-items:baseline">' +
        '<b>' + got + '/' + avail + ' = ' + gd.pct + '%, a grade ' + gd.grade + '</b>' +
        (gd.next && gd.marksOff
          ? '<span class="tiny muted">' + gd.marksOff + ' more mark' + (gd.marksOff === 1 ? "" : "s") +
            ' would have been ' + (gd.next === "A" || gd.next === "E" ? "an " : "a ") + gd.next + '</span>'
          : (gd.grade === "A" ? '<span class="tiny muted">top band</span>' : "")) +
      '</div>' +
      '<div class="gb-scale">' + bands + '</div>' +
      '<div class="tiny faint">Measured against the ' + UI.esc(Metrics.AS_BOUNDARY_SERIES) +
        ' subject boundaries (' + Metrics.AS_MAX_MARK + ' marks: A ' + Metrics.AS_BOUNDARIES[0].mark +
        ', B ' + Metrics.AS_BOUNDARIES[1].mark + ', C ' + Metrics.AS_BOUNDARIES[2].mark +
        ', D ' + Metrics.AS_BOUNDARIES[3].mark + ', E ' + Metrics.AS_BOUNDARIES[4].mark + '). ' +
        'One chapter of questions is not a whole paper, and the boundaries move a bit every year, so use this ' +
        'as a rough idea of where you are, not a predicted grade.</div>' +
    '</div>';
  }

  function attemptHistory(attempts) {
    return '<div style="margin-top:14px"><div class="tiny" style="font-weight:700;margin-bottom:8px">Previous attempts</div>' +
      attempts.slice().reverse().map(function (a) {
        return '<div class="row tiny" style="padding:6px 0;border-bottom:1px solid var(--border)">' +
          '<span class="muted">' + Metrics.fmtDate(a.date) + '</span>' +
          '<div class="spacer"></div>' +
          '<span>' + a.marksAchieved + '/' + a.marksAvailable + '</span>' +
          UI.accPill(a.pct) + '</div>';
      }).join("") + '</div>';
  }

  /* ---------------- 4. RAG ---------------- */
  function stepRag(cid, t, st) {
    const locked = !st.steps.marked.done;
    if (locked) {
      return card(4, "Update your confidence", false,
        '<div class="warnbox"><b>Record your score first</b>Your rating should follow the evidence, not precede it.</div>',
        "Locked until the score is recorded");
    }
    const last = (t.attempts || [])[t.attempts.length - 1];
    const pct = last ? last.pct : null;
    const rec = Metrics.recommendRag(pct, {
      attemptNumber: (t.attempts || []).length,
      difficulty: last ? last.difficulty : null
    });
    const chosen = t.ragAfterChapter || t.rag;
    const eff = Metrics.effectiveRag(cid);

    return card(4, "Update your confidence", st.steps.rag.done,
      (rec ? recommendation(cid, rec, pct, chosen) : "") +
      UI.ragPicker(chosen, "ch-rag", cid, true) +
      (st.steps.rag.done
        ? '<div class="row wrap" style="gap:8px"><span class="pill good">' + UI.icon("check") + 'Chapter complete</span>' +
          (eff.adjusted ? '<span class="pill warn">planner is treating it as ' + eff.rag.toUpperCase() + '</span>' : "") +
          '<div class="spacer"></div>' +
          '<button class="btn btn-primary" data-action="ch-next">Next chapter →</button></div>'
        : '<div class="tiny faint">Pick a rating to complete the chapter.</div>'),
      "This finishes the chapter");
  }

  /* The rating the evidence points to, offered as one click. You can still
     pick anything — but if you overrule it, it says so rather than letting
     an optimistic rating pass unremarked. */
  function recommendation(cid, rec, pct, chosen) {
    const label = { red: "RED", amber: "AMBER", green: "GREEN" }[rec.rag];
    const disagrees = chosen && chosen !== rec.rag;

    return '<div class="rag-rec ' + rec.rag + '">' +
      '<div class="rag-rec-main">' +
        '<div class="rag-rec-head">' + UI.ragDot(rec.rag) +
          '<b>Recommended: ' + label + '</b></div>' +
        '<div class="tiny muted">You scored ' + pct + '% — ' + UI.esc(rec.why) + '.</div>' +
      '</div>' +
      (chosen === rec.rag
        ? '<span class="pill good">' + UI.icon("check") + 'matches your rating</span>'
        : '<button class="btn btn-sm btn-primary" data-action="ch-rag" data-id="' +
            UI.esc(cid) + '" data-v="' + rec.rag + '">Use ' + label + '</button>') +
      (disagrees
        ? '<div class="tiny faint" style="flex-basis:100%;margin-top:6px">' +
          'You picked ' + chosen.toUpperCase() + '. That is fine — but the planner goes on your actual scores, ' +
          'so rating yourself higher than your marks will not change what it gives you.</div>'
        : "") +
    '</div>';
  }

  /* ---------------- shell ---------------- */
  function card(n, title, done, body, sub) {
    return '<div class="sess-step">' +
      '<div class="sess-head"><div class="sess-n ' + (done ? "done" : "") + '">' + (done ? "✓" : n) + '</div>' +
        '<div><div class="sess-title">' + UI.esc(title) + '</div>' +
        (sub ? '<div class="tiny muted">' + UI.esc(sub) + '</div>' : "") + '</div></div>' +
      '<div class="sess-body">' + body + '</div></div>';
  }

  function setOpenQ(n) { openQ = n; }
  function setBand(v) { qBand = v; }
  function getOpenQ() { return openQ; }

  function revealMs(key, on) { if (on) revealedMs[key] = true; else delete revealedMs[key]; }
  function resetPdf(cid) { pdfLoaded[cid] = null; }

  return { render: render, setOpenQ: setOpenQ, getOpenQ: getOpenQ, setBand: setBand,
           revealMs: revealMs, resetPdf: resetPdf };
})();
