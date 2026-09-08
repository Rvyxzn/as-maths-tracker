/* ============================================================
   Question packs — Economics

   Browse every past-paper question by its mark tariff, because
   that is how the paper is built and how you revise for it.

   Opening a question takes over the page: the list goes soft
   behind it and the question is the only thing to read. A data
   response's figures and extracts live in a panel that slides
   out from the side, because you need them beside the question,
   not scrolled away above it.

   The question stays alone until you ask for the answer. A mark
   scheme sitting open next to the question is reading, not
   practice.
   ============================================================ */

const PacksView = (function () {

  const TARIFFS = [5, 8, 10, 12, 15, 25];

  /* What each tariff is asking for, from the command word and the real
     KAA/evaluation split in the mark schemes. */
  const GUIDE = {
    5:  { name: "Short answer", split: "Knowledge, application and analysis only",
          how: "A calculation or one explained reason, plus a one-mark multiple choice. No evaluation is asked for, so do not spend time on it." },
    8:  { name: "Examine", split: "KAA 6 · Evaluation 2",
          how: "Two points, each explained as a chain, with a short evaluative comment. Depth beats breadth." },
    10: { name: "Assess", split: "KAA 6 · Evaluation 4",
          how: "One or two developed chains and a real judgement. Evaluation is worth almost half." },
    12: { name: "Discuss", split: "KAA 8 · Evaluation 4",
          how: "Two sides, each analysed properly, then a judgement that actually decides between them." },
    15: { name: "Discuss / Assess", split: "KAA 9 · Evaluation 6",
          how: "Three developed points, or two with a diagram, and evaluation running through rather than bolted on the end." },
    25: { name: "Essay", split: "KAA 16 · Evaluation 9",
          how: "Two or three fully developed chains with a diagram, and evaluation worth over a third of the marks. Running out of time before the evaluation is the most common way to lose an A." }
  };

  let tariff = 25;
  let focusId = null;          // the question that has taken over the page
  let revealed = {};
  let caseOpen = false;
  let caseWidth = null;        // px, once you have dragged the divider
  let paperFilter = "all";
  let yearFilter = "all";
  let practiceQueue = [];
  let practiceIndex = 0;
  let todoOnly = false;
  let query = "";
  const figOpen = {};            // which case-study figures are expanded
  const modelOpen = {};          // which model answers are unfolded

  function minutesFor(marks) { return Math.round(marks * ECO_MINUTES_PER_MARK); }

  /* Counted rather than written down, so adding a series does not leave the
     heading claiming a number that stopped being true. */
  function paperCount() {
    const seen = {};
    ECO_QUESTIONS.forEach(function (q) { seen[q.paper + "|" + q.series] = true; });
    return Object.keys(seen).length;
  }
  function byId(id) { return ECO_QUESTIONS.filter(function (q) { return q.id === id; })[0]; }

  /* What you might type looking for a question: a word from it, the topic it
     is on, its code, or the year of the paper. A search is not worth having
     if "2022" or "PED" misses. */
  function haystack(q) {
    return (q.text + " " + (q.topicName || "") + " " + (q.topicCode || "") + " " +
            (q.series || "") + " " + (q.section || "") + " Paper " + q.paper +
            " Year " + q.year + " " + q.marks + " mark").toLowerCase();
  }

  function matches(q, terms) {
    const hay = haystack(q);
    return terms.every(function (t) { return hay.indexOf(t) >= 0; });
  }

  function questions() {
    /* Searching looks across every tariff: if you type "PED" you want the
       question, not the question filtered to whichever tariff was showing. */
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length) {
      return ECO_QUESTIONS.filter(function (q) {
        if (paperFilter !== "all" && String(q.paper) !== paperFilter) return false;
        if (yearFilter !== "all" && String(q.year) !== yearFilter) return false;
        if (todoOnly && !onTodo(q.id)) return false;
        return matches(q, terms);
      });
    }
    return ECO_QUESTIONS.filter(function (q) {
      if (q.marks !== tariff) return false;
      if (paperFilter !== "all" && String(q.paper) !== paperFilter) return false;
      if (yearFilter !== "all" && String(q.year) !== yearFilter) return false;
      if (todoOnly && !onTodo(q.id)) return false;
      return true;
    });
  }

  /* What you have actually scored on the questions in front of you, so the
     tariff you are weakest at is visible without opening anything. */
  function scoreSummary() {
    const t = tally(questions());
    if (!t.done) return '<span class="tiny faint">None of these attempted yet</span>';
    const tone = t.pct < 50 ? "red" : t.pct < 65 ? "amber" : "green";
    return '<span class="qpack-total ' + tone + '">' +
      '<b>' + t.got + '/' + t.avail + '</b><span>' + t.pct + '%</span>' +
      '<small>' + t.done + ' of ' + t.total + ' done</small></span>';
  }

  function countBy(fn) {
    return ECO_QUESTIONS.filter(function (q) {
      return q.marks === tariff && (paperFilter === "all" || String(q.paper) === paperFilter) && fn(q);
    }).length;
  }

  /* ---------- assessment objectives ---------- */
  const AO = [
    { re: /knowledge/i,   key: "k",  label: "K",  title: "Knowledge — define it, state it" },
    { re: /application/i, key: "ap", label: "AP", title: "Application — use the data and the context" },
    { re: /analysis/i,    key: "an", label: "AN", title: "Analysis — build the chain of reasoning" },
    { re: /evaluation/i,  key: "ev", label: "EV", title: "Evaluation — judge it, and say what it depends on" }
  ];

  /* The AO allocation is its own line and looks like "Knowledge 2" or
     "Knowledge 1, Application 3" — a name and a number, and nothing else.

     "Knowledge/understanding: 1 mark for identifying a role; 1 mark for
     linked development" is an instruction that happens to start with the
     same word, and reading it as an allocation put a second, invented
     "K 1" badge under the real one. */
  const AO_LINE = /^(?:(?:knowledge(?:\/understanding)?|application|analysis|evaluation|kaa)\s*\d+\s*[,;]?\s*)+$/i;

  function isAoLine(line) { return AO_LINE.test(line.trim()); }

  function aoBadges(line) {
    const found = [];
    line.split(/[,;]/).forEach(function (bit) {
      const n = (bit.match(/(\d+)/) || [])[1];
      if (!n) return;
      AO.forEach(function (ao) { if (ao.re.test(bit)) found.push({ ao: ao, n: n }); });
    });
    if (!found.length) return '<div class="ms2-marks">' + UI.esc(line) + '</div>';
    found.sort(function (a, b) { return AO.indexOf(a.ao) - AO.indexOf(b.ao); });
    return '<div class="ms2-ao">' + found.map(function (f) {
      return '<span class="ao ao-' + f.ao.key + '" title="' + UI.esc(f.ao.title) + '">' +
        '<b>' + f.ao.label + '</b>' + f.n + '</span>';
    }).join("") + '</div>';
  }

  /* ---------- mark scheme ---------- */

  /* A row of the answer grid: nothing but numbers. */
  function isGridRow(l) {
    return /^[-\d][\d.,\s]*$/.test(l) && (l.match(/\d+/g) || []).length >= 3;
  }
  /* A wrapped header cell above that grid: a word or two, no sentence. */
  function isGridHead(l) {
    return l.length <= 14 && !/[.:;?]$/.test(l) && !isAoLine(l) &&
           !/^(•|\(\d+\)|\([a-e]\))/.test(l);
  }

  /* The mark scheme for a table question prints the completed table, and a
     PDF gives that back one cell per line: "Price", "£", "Quantity",
     "demanded", "per month", "(000)" and then "25 5 9 8 10". Joined into
     prose it is unreadable, and it is the answer. Pulled out as a grid it
     is the answer laid out the way the paper lays it out. */
  /* A line of table-header cells read across instead of down: no sentence
     punctuation, and repeating the same few column words. */
  function isScrambledHead(l) {
    if (typeof l !== "string") return false;
    const words = l.split(/\s+/).filter(Boolean);
    if (words.length < 6 || /[.:;?]$/.test(l)) return false;
    const key = /^(price|quantity|demanded|supplied|new|per|month|year|week|total|cost|revenue|output|£|\(000\)|\(m\)|units?)$/i;
    const hits = words.filter(function (w) { return key.test(w); }).length;
    return hits / words.length >= 0.7;
  }

  /* The extractor rebuilds a reprinted answer table from the column positions
     in the PDF and hands it over as one line, because reading it back off the
     rendered text is what put the numbers under the wrong headings. */
  const TABLE_LINE = /^\[\[TABLE\]\]\s*/;

  function liftGrid(lines) {
    const out = [];
    for (let i = 0; i < lines.length; i++) {
      if (TABLE_LINE.test(lines[i])) {
        try {
          const t = JSON.parse(lines[i].replace(TABLE_LINE, ""));
          out.push({ table: t });
        } catch (e) { /* leave it out rather than print the marker */ }
        continue;
      }
      if (!isGridRow(lines[i])) { out.push(lines[i]); continue; }
      let end = i;
      while (end + 1 < lines.length && isGridRow(lines[end + 1])) end++;
      if (end - i + 1 < 3) { out.push(lines[i]); continue; }
      /* the wrapped header cells sit immediately above the first row */
      let head = [];
      while (out.length && isGridHead(out[out.length - 1])) head.unshift(out.pop());
      /* Those cells now arrive as one run of words - "Price Quantity Quantity
         New New £ demanded supplied ..." - because the extractor rejoins
         wrapped lines. It is the same header the table below prints properly,
         so reading it twice, once scrambled, helps nobody. */
      if (out.length && isScrambledHead(out[out.length - 1])) out.pop();
      out.push({ grid: lines.slice(i, end + 1).map(function (r) { return r.trim().split(/\s+/); }),
                 headCells: head });
      i = end;
    }
    return out;
  }

  /* The completed table, rebuilt column by column. The question's own column
     names win where they fit, since this is that same table filled in. */
  function tableHtml(t, id) {
    const spec = (typeof ECO_QUESTION_TABLES !== "undefined") ? ECO_QUESTION_TABLES[id] : null;
    const cols = t.rows[0].length;
    const head = (spec && spec.head && spec.head.length === cols) ? spec.head
               : (t.head && t.head.length === cols && t.head.some(Boolean)) ? t.head : null;
    return '<div class="qtbl-wrap"><table class="qtbl ms2-grid">' +
      (head ? '<thead><tr>' + head.map(function (h) {
        return '<th>' + UI.esc(h) + '</th>'; }).join("") + '</tr></thead>' : "") +
      '<tbody>' + t.rows.map(function (r) {
        return '<tr>' + r.map(function (c, i) {
          return '<td' + (i ? ' class="num"' : '') + '>' + UI.esc(c) + '</td>';
        }).join("") + '</tr>';
      }).join("") + '</tbody></table></div>';
  }

  function gridHtml(node, id) {
    const spec = (typeof ECO_QUESTION_TABLES !== "undefined") ? ECO_QUESTION_TABLES[id] : null;
    const cols = node.grid[0].length;
    /* the question's own column names are the right ones, since this is that
       same table filled in */
    const head = (spec && spec.head && spec.head.length === cols) ? spec.head : null;
    return '<div class="qtbl-wrap"><table class="qtbl ms2-grid">' +
      (head ? '<thead><tr>' + head.map(function (h) {
        return '<th>' + UI.esc(h) + '</th>'; }).join("") + '</tr></thead>' : "") +
      '<tbody>' + node.grid.map(function (r) {
        return '<tr>' + r.map(function (c, i) {
          return '<td' + (i ? ' class="num"' : '') + '>' + UI.esc(c) + '</td>';
        }).join("") + '</tr>';
      }).join("") + '</tbody></table></div>';
  }

  function msSheet(text, id) {
    const raw = String(text || "").split("\n").map(function (l) { return l.trim(); })
                  .filter(function (l) { return l.length; });

    /* The lines arrive whole. They used to arrive as PDF text-layer fragments
       wrapped at the column width, so this rejoined them by guessing where a
       sentence restarted - and guessed wrong often enough to weld the mark
       allocation onto the first heading and headings onto the bullet above.
       The extractor now reads the column positions instead and emits one
       logical line per point, so there is nothing left to guess at. */
    const lines = liftGrid(raw);

    let html = "", inList = false, inLevel = false;
    const closeList = function () { if (inList) { html += "</ul>"; inList = false; } };
    const closeLevel = function () { if (inLevel) { html += "</div>"; inLevel = false; } };

    const EVAL_HEAD = /^Evaluation\b(?!\s*\d+\s*$)/i;
    const hasEval = lines.some(function (l) { return EVAL_HEAD.test(l); });
    let started = false;

    lines.forEach(function (line) {
      if (line && line.table) {
        closeLevel(); closeList();
        html += tableHtml(line.table, id);
        return;
      }
      if (line && line.grid) {
        closeLevel(); closeList();
        html += gridHtml(line, id);
        return;
      }
      if (hasEval && EVAL_HEAD.test(line)) {
        closeLevel(); closeList();
        const rest = line.replace(/^Evaluation\s*:?\s*/i, "").trim();
        html += '<div class="ms2-sec ms2-sec-ev"><b>EV</b>Evaluation</div>' +
                (rest ? '<p class="ms2-note">' + UI.esc(rest) + '</p>' : "");
        started = true;
        return;
      }
      if (inLevel && !/^(Level\s*\d|\d+\s+A completely|•|\(?[a-e]\)$|Knowledge|KAA|Application|Analysis|Evaluation)/i.test(line)) {
        html += " " + UI.esc(line);
        return;
      }
      closeLevel();
      if (/^\([a-e]\)$/.test(line)) {
        closeList();
        html += '<div class="ms2-part">Part ' + UI.esc(line.replace(/[()]/g, "")) + '</div>';
        return;
      }
      if (isAoLine(line)) {
        closeList();
        html += aoBadges(line);
        return;
      }
      /* "Knowledge/understanding:", "Application:" and the like introduce the
         marks below them, so they read as a heading rather than a sentence. */
      if (/^(Knowledge(\/understanding)?|Application|Analysis|Evaluation)\s*:/i.test(line)) {
        closeList();
        const cut = line.indexOf(":");
        html += '<div class="ms2-lead"><b>' + UI.esc(line.slice(0, cut)) + '</b>' +
                UI.esc(line.slice(cut + 1)) + '</div>';
        return;
      }
      if (/^(Level\s*\d|\d+\s+A completely)/i.test(line)) {
        closeList();
        const m = line.match(/^(Level\s*\d+|\d+)\s*([\d]+\s*[–—-]\s*[\d]+)?\s*(.*)$/i);
        html += '<div class="ms2-level"><b>' + UI.esc(m ? m[1] : line) + '</b>' +
                (m && m[2] ? '<span class="ms2-range">' + UI.esc(m[2].replace(/\s+/g, "")) + '</span>' : "") +
                (m && m[3] ? " " + UI.esc(m[3]) : "");
        inLevel = true;
        return;
      }
      if (/^[••]/.test(line)) {
        if (hasEval && !started) {
          html += '<div class="ms2-sec ms2-sec-kaa"><b>KAA</b>Knowledge, application and analysis</div>';
          started = true;
        }
        if (!inList) { html += '<ul class="ms2-list">'; inList = true; }
        html += "<li>" + UI.esc(line.replace(/^[••]\s*/, "")) + "</li>";
        return;
      }
      if (/^\(?\d+\)?$/.test(line)) {
        closeList();
        const n = line.replace(/[()]/g, "");
        html += '<div class="ms2-total">' + UI.esc(n) + (n === "1" ? " mark" : " marks") + '</div>';
        return;
      }
      /* the answer to a multiple choice, on its own */
      if (/^[A-E]$/.test(line)) {
        closeList();
        html += '<div class="ms2-answer"><span>Answer</span><b>' + UI.esc(line) + '</b></div>';
        return;
      }
      closeList();
      html += "<p>" + UI.esc(line) + "</p>";
    });
    closeLevel(); closeList();
    return '<div class="ms2">' + html + "</div>";
  }

  /* ---------- question text ----------

     The questions come out of the papers as one run of text: the PDF knows
     where every glyph sits but nothing about parts, options or tables, so a
     part marker, the stem of a multiple choice and its four options all
     arrive welded into the same paragraph. Reading that is miserable, and
     worse, an option silently swallowed into the previous sentence looks
     like part of the question rather than one of the answers.

     So the text is cut back into its real pieces here, in the order a paper
     actually uses them: parts, then the stem, then A to D. */

  /* "(a)", "(b)" ... starting a new part, wherever they appear */
  const PART = /\s(?=\([a-e]\)\s)/g;
  /* the sentence that always introduces a multiple choice */
  const STEM = /\s(?=Which\s+(?:one\s+)?of\s+the\s+following)/g;
  /* a mark tariff sitting on its own, e.g. "(2)" */
  const TARIFF = /^\((\d{1,2})\)$/;

  /* Options run together as "A ... B ... C ... D ...". Splitting on a bare
     capital would cut the text at every stray initial, so each letter is
     found in turn and only ever after the one before it. */
  function splitOptions(line) {
    /* One scan for every standalone capital that could be an option label,
       then keep only those that run A, B, C, D in order. A letter that never
       reached the text layer -- because its label lives inside the figure
       that is the option -- is skipped rather than ending the scan. */
    const re = /(?:^|[\s.;:])([A-E])\s+(?=\S)/g;
    const hits = [];
    let m;
    while ((m = re.exec(line))) {
      hits.push({ letter: m[1],
                  at: m.index + (m[0][0] === m[1] ? 0 : 1),
                  from: re.lastIndex });
    }
    const order = ["A", "B", "C", "D", "E"];
    const marks = [];
    let want = 0;
    hits.forEach(function (h) {
      while (want < order.length && order[want] !== h.letter) want++;
      if (want < order.length && order[want] === h.letter) { marks.push(h); want++; }
    });
    /* one or two lone letters are initials, not a set of answers */
    if (marks.length < 3) return null;
    const head = line.slice(0, marks[0].at).trim();
    const opts = marks.map(function (mk, i) {
      const to = i + 1 < marks.length ? marks[i + 1].at : line.length;
      return { letter: mk.letter, text: line.slice(mk.from, to).trim() };
    });
    return { head: head, opts: opts };
  }

  function segments(t) {
    let text = String(t || "").replace(/\s+/g, " ").trim();
    text = text.replace(PART, "\n").replace(STEM, "\n");
    /* a tariff belongs on its own line, never trailing a sentence */
    text = text.replace(/\s\((\d{1,2})\)(?=\s|$)/g, "\n($1)\n");
    const lines = text.split("\n").map(function (l) { return l.trim(); })
                      .filter(function (l) { return l.length; });
    /* A part whose whole wording is the multiple-choice stem gets split from
       its own marker, leaving "(c)" sitting alone. Put it back together. */
    const out = [];
    lines.forEach(function (l) {
      const prev = out[out.length - 1];
      if (prev && /^\([a-e]\)$/.test(prev)) out[out.length - 1] = prev + " " + l;
      else out.push(l);
    });
    return out;
  }

  /* Marks, money, percentages and quantities are the things you are asked to
     use, so they are picked out of the sentence rather than left to be found. */
  const NUM_RE = /(£\s?\d[\d,]*(?:[ ]\d{3})*(?:\.\d+)?(?:\s?(?:billion|million|bn|m|k))?|\$\s?\d[\d,]*(?:[ ]\d{3})*(?:\.\d+)?(?:\s?(?:billion|million|bn|m|k))?|[\d,]+(?:\.\d+)?\s?%|\d[\d, ]*\.?\d*)/g;

  function numbers(safe) {
    /* The text arrives already escaped, so an apostrophe is sitting in it as
       &#39; and an ampersand as &amp;. The digits inside an entity are not a
       number in the question, and bolding them splits the entity open, which
       is how "the world's longest sea bridge" came out with a bold 39 and a
       stray &# in front of it. So the string is cut on its entities and only
       the text between them is marked up. */
    return safe.split(/(&[#a-zA-Z0-9]+;)/).map(function (bit, n) {
      return n % 2 ? bit : bit.replace(NUM_RE, '<b class="q-num">$1</b>');
    }).join("");
  }

  function lineHtml(l) {
    const tar = l.match(TARIFF);
    if (tar) return '<span class="q-tariff">' + tar[1] + ' mark' + (tar[1] === "1" ? "" : "s") + '</span>';

    const part = l.match(/^\(([a-e])\)\s*([\s\S]*)$/);
    if (part) {
      const rest = splitOptions(part[2]);
      const body = rest ? rest.head : part[2];
      return '<span class="q-part"><b class="q-part-n">(' + part[1] + ')</b> ' +
        numbers(UI.esc(body)) + '</span>' + (rest ? optionsHtml(rest.opts) : "");
    }

    const sp = splitOptions(l);
    if (sp) {
      return (sp.head ? '<span class="q-line">' + numbers(UI.esc(sp.head)) + '</span>' : "") +
             optionsHtml(sp.opts);
    }
    return '<span class="q-line">' + numbers(UI.esc(l)) + '</span>';
  }

  function optionsHtml(opts) {
    return '<div class="q-opts">' + opts.map(function (o) {
      return '<div class="q-opt"><b class="q-opt-l">' + o.letter + '</b>' +
             '<span>' + numbers(UI.esc(o.text)) + '</span></div>';
    }).join("") + '</div>';
  }

  /* A question that prints a table carries the grid separately, because the
     PDF only gives it back as a run of words. The flattened version is cut
     out of the text and the real one put in its place, at the point in the
     question where the paper prints it. */
  function questionHtml(t, id) {
    const tbl = (typeof ECO_QUESTION_TABLES !== "undefined") ? ECO_QUESTION_TABLES[id] : null;
    if (!tbl) return segments(t).map(lineHtml).join("");

    let text = String(t || "");
    const at = text.indexOf(tbl.keep);
    let block = "";
    if (at >= 0) {
      const after = at + tbl.keep.length;
      const endOfLine = text.indexOf("\n", after);
      const lineEnd = endOfLine < 0 ? text.length : endOfLine;
      /* Everything between the introducing sentence and the end of that line
         is the grid read as prose. The question often carries on talking
         after it, though — "as a result of the campaign, demand increased by
         3 000" — and that is the change you are being asked to calculate, so
         it has to survive the cut. */
      let back = "";
      if (tbl.resume) {
        const r = text.indexOf(tbl.resume, after);
        if (r >= 0 && r < lineEnd) back = " " + text.slice(r, lineEnd);
      }
      text = text.slice(0, after) + back + text.slice(lineEnd);
    }
    block = tbl.diagram
      ? '<div class="qfig">' + ECO_QDIAGRAM.render(tbl.diagram) + '</div>'
      : tbl.chart
      ? '<div class="qfig">' + ECO_FIGURE.render(tbl.chart) + '</div>'
      : '<div class="qtbl-wrap"><table class="qtbl">' +
          (tbl.head ? '<thead><tr>' + tbl.head.map(function (h) {
            return '<th>' + UI.esc(h) + '</th>'; }).join("") + '</tr></thead>' : "") +
          '<tbody>' + tbl.rows.map(function (r) {
            return '<tr>' + r.map(function (c, i) {
              return '<td' + (i && c ? ' class="num"' : (c ? '' : ' class="blank"')) + '>' +
                     UI.esc(c) + '</td>';
            }).join("") + '</tr>';
          }).join("") + '</tbody></table>' +
          (tbl.note ? '<div class="qtbl-note">' + UI.esc(tbl.note) + '</div>' : "") +
        '</div>';

    /* put the table back where the paper has it: straight after the sentence
       that introduces it, before the first part */
    const segs = segments(text);
    let out = "", placed = false;
    segs.forEach(function (l) {
      const html = lineHtml(l);
      out += html;
      if (!placed && l.indexOf(tbl.keep.slice(0, 30)) >= 0) { out += block; placed = true; }
    });
    return placed ? out : segs.map(lineHtml).join("") + block;
  }

  /* ---------- the case study ---------- */
  function caseFor(q) {
    /* Paper 3's case studies are not transcribed. Their figures are charts
       and their extracts run to pages, and a retyped copy that drifts from
       the paper would be worse than none, so the panel shows the paper's own
       stimulus pages instead. */
    if (!q.caseKey && q.stimFrom) {
      return { pages: true, title: "Section " + q.section + " of the paper",
               figures: [], extracts: [],
               source: { pdf: q.pdf, from: q.stimFrom, to: q.stimTo } };
    }
    if (!q.caseKey || typeof ECO_CASE_STUDIES === "undefined") return null;
    const study = ECO_CASE_STUDIES[q.caseKey];
    if (!study) return null;
    /* The figures live on the shared stimulus pages for this case. Attach
       that source here instead of duplicating its PDF path in every figure. */
    return Object.assign({}, study, { source: { pdf: q.pdf, from: q.stimFrom, to: q.stimTo } });
  }

  function attemptsFor(id) {
    return (Store.get().packAttempts || []).filter(function (a) { return a.questionId === id; })
      .sort(function (a, b) { return String(b.at || "").localeCompare(String(a.at || "")); });
  }
  function lastAttempt(id) { return attemptsFor(id)[0] || null; }
  function daysAgo(iso) { return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)); }
  function scoreTone(a) {
    if (!a || !a.available) return "new";
    const pct = Math.round(a.got / a.available * 100);
    return pct < 50 ? "red" : pct < 65 ? "amber" : "green";
  }

  /* How stale an attempt is. A question answered correctly three months ago
     is not a question you can still answer, so recency is shown next to the
     score rather than folded into it. */
  function ageTone(days) {
    if (days == null) return "new";
    return days <= 7 ? "green" : days <= 21 ? "amber" : "red";
  }

  /* ---------- the to-do list ---------- */
  function todo() { return Store.get().packTodo || []; }
  function onTodo(id) { return todo().indexOf(id) >= 0; }
  function toggleTodo(id) {
    Store.mutate(function (st) {
      if (!st.packTodo) st.packTodo = [];
      const i = st.packTodo.indexOf(id);
      if (i >= 0) st.packTodo.splice(i, 1); else st.packTodo.push(id);
    });
  }

  /* Everything you have scored, for the running total beside the filters. */
  function tally(list) {
    let got = 0, avail = 0, done = 0;
    list.forEach(function (q) {
      const a = lastAttempt(q.id);
      if (!a || !a.available) return;
      got += a.got; avail += a.available; done++;
    });
    return { got: got, avail: avail, done: done, total: list.length,
             pct: avail ? Math.round(got / avail * 100) : null };
  }

  /* A figure is drawn from its data where we have it, and falls back to
     whatever the extraction managed otherwise. The drawn one wins: a chart
     is what the paper showed you, and half these questions ask you to read
     a trend off it. */
  /* A caption is the line printed above the figure, but the chart's own axis
     labels sit on the next line down and the extraction ran the two
     together: "Population of Rwanda (millions), 2008 to 2018 2008 2009 2010
     2011 ...". The tick labels are data, not caption, so they come off. */
  function caption(c) {
    let t = String(c || "").trim();

    /* The tick labels start by repeating a year the caption has already
       named — "2008 to 2018" then "2008 2009 2010 …" — so the repeat is
       where the caption ends. Cutting there keeps the range it states,
       which a blind trim of trailing years would throw away with the rest. */
    const years = [];
    const re = /\b(?:19|20)\d{2}\b/g;
    let m;
    while ((m = re.exec(t))) {
      if (years.indexOf(m[0]) >= 0 && years.length >= 2) { t = t.slice(0, m.index); break; }
      years.push(m[0]);
    }
    t = t.replace(/(?:\s+Q[1-4]\s+(?:19|20)\d{2}){2,}\s*$/, "");
    t = t.replace(/(?:\s+[\d.,]+%?){4,}\s*$/, "");
    return t.replace(/[\s,;:–—-]+$/, "").replace(/\s+\b(?:to|and)$/i, "").trim();
  }

  /* Figures start folded. The case panel is narrow and a question usually
     needs one of its three figures, so opening all of them pushes the
     extracts off the screen; and the question stays visible either way
     because the figure expands inside the panel beside it. */
  function figureHtml(f, drawn, key) {
    const fid = key + "|" + f.label;
    const open = !!figOpen[fid];
    const chart = drawn ? ECO_FIGURE.render(drawn) : "";
    const rows = (f.data || []).map(function (d) {
      return '<tr><td>' + UI.esc(d[0]) + '</td><td class="num">' + UI.esc(d[1]) + '</td></tr>';
    }).join("");
    const body = chart || (rows ? '<table class="cs-table"><tbody>' + rows + '</tbody></table>' : "");

    return '<div class="cs-fig' + (open ? " open" : "") + '">' +
      '<button class="cs-fig-head" data-action="pack-fig" data-fig="' + UI.esc(fid) + '">' +
        '<span class="cs-fig-titles">' +
          '<b>' + UI.esc(f.label) + '</b>' +
          (f.caption ? '<span>' + UI.esc(caption(f.caption)) + '</span>' : "") +
          '<em>' + (open ? "Click to fold away" :
                    body ? "Click to expand" : "Click to expand · no chart data yet") + '</em>' +
        '</span>' +
        '<span class="cs-fig-chev">' + (open ? "−" : "+") + '</span>' +
      '</button>' +
      (open ? '<div class="cs-fig-body">' +
          (drawn && drawn.note ? '<div class="cs-fig-note">' + UI.esc(drawn.note) + '</div>' : "") +
          (body || '<div class="tiny faint">This figure has not been redrawn yet, so only its ' +
                   'title is here. The extracts below still carry the case study.</div>') +
          (drawn && drawn.exact === false
            ? '<div class="cs-fig-approx">Read off the printed chart, so these are close rather than exact.</div>'
            : "") +
        '</div>' : "") +
    '</div>';
  }

  function caseHtml(cs, key) {
    /* Rendered from the paper itself: the figures and extracts exactly as
       they are printed, which on the synoptic paper is the only honest way
       to show them. */
    if (cs.pages) {
      return '<div class="cs-head">' + UI.icon("info") + '<span>Case Study</span></div>' +
        (cs.title ? '<h4 class="cs-title">' + UI.esc(cs.title) + '</h4>' : "") +
        /* the paths carry spaces and brackets, so they are encoded once here */
        '<div class="cs-pages" data-question-pdf="' + UI.esc(encodeURI(cs.source.pdf)) + '" ' +
          'data-question-from="' + cs.source.from + '" data-question-to="' + cs.source.to + '"></div>';
    }
    const drawn = (typeof ECO_FIGURE !== "undefined") ? ECO_FIGURE.forCase(key) : [];
    const byLabel = {};
    drawn.forEach(function (d) { byLabel[d.label] = d; });
    return '<div class="cs-head">' + UI.icon("info") + '<span>Case Study</span></div>' +
      (cs.title ? '<h4 class="cs-title">' + UI.esc(cs.title) + '</h4>' : "") +
      cs.figures.map(function (f) { return figureHtml(f, byLabel[f.label], key); }).join("") +
      cs.extracts.map(function (e) {
        return '<div class="cs-ext">' +
          '<div class="cs-ext-label">' + UI.esc(e.label) + '</div>' +
          (e.head ? '<div class="cs-ext-head">' + UI.esc(e.head) + '</div>' : "") +
          '<p>' + UI.esc(e.body) + '</p>' +
        '</div>';
      }).join("");
  }

  /* ---------- the model answer ----------

     Not an essay someone wrote out. What a full-mark answer contains, in the
     mark scheme's own points, laid out as the paragraphs you would write and
     timed at the 1.2 minutes a mark the paper allows, with the examiner's own
     account of where the marks went sitting beside it.

     It opens folded. Reading the model before writing your own is revision,
     not practice, and the whole panel only exists after you have revealed. */
  function modelBlock(q, er) {
    if (typeof EcoModel === "undefined") return "";
    const m = EcoModel.build(q, er);
    if (!m || (!m.kaa.length && !m.ev.length)) return "";
    const open = !!modelOpen[q.id];

    const group = function (points) {
      /* the scheme's own headings survive, because "Effects on consumers"
         and "Effects on suppliers" are the two halves of the answer */
      const out = [];
      let last = null;
      points.forEach(function (p) {
        if (p.heading !== last) { out.push('<div class="ma-sub">' + UI.esc(p.heading || "") + '</div>'); last = p.heading; }
        out.push('<li>' + UI.esc(p.text) + '</li>');
      });
      return out.join("").replace(/<div class="ma-sub"><\/div>/g, "");
    };

    const list = function (title, hint, points) {
      if (!points.length) return "";
      return '<div class="ma-col">' +
        '<div class="ma-col-head"><b>' + UI.esc(title) + '</b><span>' + UI.esc(hint) + '</span></div>' +
        '<ul class="ma-points">' + group(points) + '</ul></div>';
    };

    const says = function (cls, title, items) {
      if (!items || !items.length) return "";
      return '<div class="ma-says ' + cls + '"><b>' + UI.esc(title) + '</b><ul>' +
        items.map(function (s) { return '<li>' + UI.esc(s) + '</li>'; }).join("") + '</ul></div>';
    };

    return '<div class="ma' + (open ? " open" : "") + '">' +
      '<button class="ma-head" data-action="pack-model" data-id="' + q.id + '">' +
        UI.icon("cap") +
        '<span class="ma-title">Model answer</span>' +
        '<span class="ma-sum">' + m.minutes + ' min · ' +
          (m.split.ev ? 'KAA ' + m.split.kaa + ' · Evaluation ' + m.split.ev : m.marks + ' marks, no evaluation') +
          (m.best ? ' · examiner scored ' + m.best.got + '/' + m.best.outOf : '') + '</span>' +
        '<span class="ma-chev">' + (open ? "−" : "+") + '</span>' +
      '</button>' +
      (open ? '<div class="ma-body">' +

        '<div class="ma-plan">' + m.steps.map(function (s) {
          return '<div class="ma-step"><span class="ma-step-m">' + s.marks + '</span>' +
                 '<span class="ma-step-l">' + UI.esc(s.label) + '</span>' +
                 '<span class="ma-step-t">' + s.minutes + ' min</span></div>';
        }).join("") + '</div>' +

        (m.diagram ? '<div class="ma-flag">' + UI.icon("alert") +
          '<span>The mark scheme credits a diagram here. Draw it, label both axes and both curves, ' +
          'and refer to the labelled points in the writing.</span></div>' : "") +

        '<div class="ma-cols">' +
          list(m.fromProse ? "What earns the marks" : "Knowledge, application and analysis",
               m.fromProse ? "the mark scheme's own wording" : "pick two or three, and develop them",
               m.kaa) +
          list("Evaluation", "worth " + m.split.ev + " of the " + m.marks, m.ev) +
        '</div>' +

        (m.conditions.length
          ? '<div class="ma-cond"><b>The scheme also says</b><ul>' +
            m.conditions.map(function (c) { return '<li>' + UI.esc(c.text) + '</li>'; }).join("") +
            '</ul></div>' : "") +

        says("good", "What the examiner rewarded", m.gained) +
        says("bad", "Where the marks went", m.lost) +
        says("", "What the examiner said", m.notes) +
        says("tip", "Examiner tips", m.tips) +

        (m.best ? '<div class="ma-best"><b>The examiner on a ' + m.best.got + '/' + m.best.outOf +
          ' answer</b><p>' + UI.esc(m.best.text) + '</p></div>' : "") +

        '<div class="ma-foot">Assembled from Pearson’s mark scheme and examiner report for this ' +
          'question. Nothing here is written for you: the points are the ones the scheme lists.</div>' +
      '</div>' : "") +
    '</div>';
  }

  /* ---------- list ---------- */
  function yearPill(q) {
    if (!q.year) return '<span class="pill">year unclear</span>';
    return '<span class="pill acc" title="' +
      (q.topicCode ? "Specification " + q.topicCode + " — " + q.topicName : "Theme " + q.theme) +
      '">Y' + q.year + ' · ' + UI.esc(q.topicCode || ("T" + q.theme)) + '</span>';
  }

  /* Summer 2020 and 2021 were cancelled and those papers were sat in the
     autumn. The bank files them under June, following the past-paper site,
     but Pearson published the reports under the series they were actually
     sat in, so the two names have to be tried. */
  const REPORT_SERIES = { "june2020": "october2020", "june2021": "november2021" };

  function reportFor(q) {
    if (typeof ECO_EXAMINER_REPORTS === "undefined") return null;
    const name = q.series.toLowerCase().replace(/ /g, "");
    const set = ECO_EXAMINER_REPORTS["p" + q.paper + "-" + name] ||
                (REPORT_SERIES[name] ? ECO_EXAMINER_REPORTS["p" + q.paper + "-" + REPORT_SERIES[name]] : null);
    if (!set) return null;
    /* Some reports write up the whole of question 6 in one go rather than
       part by part, so a part with no entry of its own falls back to it. */
    return set.questions[q.erKey] ||
           set.questions[q.q + (q.part || "")] ||
           set.questions[q.q] || null;
  }

  function preview(t) {
    const s = String(t || "").replace(/\s+/g, " ").trim();
    return s.length > 105 ? s.slice(0, 105) + "…" : s;
  }

  function row(q) {
    const last = lastAttempt(q.id);
    const score = last && last.available ? Math.round(last.got / last.available * 100) : null;
    const age = last ? daysAgo(last.at) : null;
    const tone = scoreTone(last);
    return '<div class="qpack' + (onTodo(q.id) ? " todo" : "") + '">' +
      '<span class="qpack-strip ' + tone + '"></span>' +
      '<button class="qpack-head" data-action="pack-open" data-id="' + q.id + '">' +
        '<span class="qpack-marks">' + q.marks + '</span>' +
        '<span class="qpack-main">' +
          '<b>' + UI.esc(q.series) + ' · Paper ' + q.paper + ' · Q' + q.q + (q.part ? "(" + q.part + ")" : "") + '</b>' +
          '<small>' + UI.esc(preview(q.text)) + '</small>' +
        '</span>' +
        '<span class="qpack-tags">' + yearPill(q) +
          (caseFor(q) ? '<span class="pill">case study</span>' : "") +
          (reportFor(q) ? '<span class="pill good">report</span>' : "") +
        '</span>' +
        '<span class="qpack-result ' + tone + '">' +
          (last ? '<b>✓</b><span>' + score + '%</span>' : '<span class="qpack-o">○</span>') +
        '</span>' +
        '<span class="qpack-when ' + ageTone(age) + '">' +
          (last ? '<i class="qpack-clock"></i><span>' +
                  (age === 0 ? "today" : age + "d ago") + '</span>' : '') + '</span>' +
      '</button>' +
      '<button class="qpack-star' + (onTodo(q.id) ? " on" : "") + '" data-action="pack-todo" data-id="' + q.id +
        '" title="' + (onTodo(q.id) ? "Remove from your to-do list" : "Add to your to-do list") + '">' +
        (onTodo(q.id) ? "★" : "☆") + '</button>' +
      (last ? '<div class="qpack-last">Last attempted ' +
              (age === 0 ? "today" : age + " day" + (age === 1 ? "" : "s") + " ago") +
              ' · <b>' + last.got + '/' + last.available + '</b>' +
              (attemptsFor(q.id).length > 1 ? ' · ' + attemptsFor(q.id).length + ' attempts' : '') +
              '</div>' : "") +
    '</div>';
  }

  /* ---------- the focused question ---------- */
  function focusHtml(q) {
    const cs = caseFor(q);
    const er = reportFor(q);
    const show = !!revealed[q.id];
    const g = GUIDE[q.marks] || {};

    /* The backdrop closes; the card does not. The card carries its own
       do-nothing action so that a click inside it resolves to that rather
       than bubbling up to the backdrop's close. Buttons inside still win,
       because they are nearer to the click than the card is. */
    return '<div class="qfocus" data-action="pack-close">' +
      '<div class="qfocus-shell" data-action="pack-keep">' +
        (cs ? '<aside class="qcase' + (caseOpen ? " open" : "") + '">' +
                '<button class="qcase-tab" data-action="pack-case">' +
                  '<span>CASE STUDY</span>' +
                '</button>' +
                '<div class="qcase-body"' +
                  (caseOpen && caseWidth ? ' style="width:' + caseWidth + 'px"' : "") + '>' +
                  caseHtml(cs, q.caseKey) + '</div>' +
              '</aside>' +
              /* Drag the divider to give either side more room; a plain click
                 on the knob folds the case study away. */
              (caseOpen
                ? '<div class="qsplit" data-action="pack-keep" data-split>' +
                    '<span class="qsplit-knob" title="Drag to resize, click to close">‹</span>' +
                  '</div>'
                : "")
            : "") +

        '<div class="qfocus-main">' +
          '<div class="qfocus-bar">' +
            '<span class="qfocus-marks">' + q.marks + '</span>' +
            '<div class="qfocus-where">' +
              '<b>' + UI.esc(q.series) + ' · Paper ' + q.paper + ' · Q' + q.q + (q.part ? "(" + q.part + ")" : "") + '</b>' +
              '<small>' + (q.topicCode ? UI.esc(q.topicCode + " " + q.topicName) + ' · ' : "") +
                'Theme ' + q.theme + ' · Year ' + q.year + '</small>' +
            '</div>' +
            '<div class="spacer"></div>' +
            '<span class="pill">' + minutesFor(q.marks) + ' min</span>' +
            (practiceQueue.length ? '<span class="pill acc">Practice ' + (practiceIndex + 1) + ' / ' + practiceQueue.length + '</span>' : '') +
            '<button class="btn btn-sm" data-action="pack-time" data-id="' + q.id + '">Time me</button>' +
            '<button class="icon-btn" data-action="pack-close" title="Close">✕</button>' +
          '</div>' +

          '<div class="qfocus-scroll">' +
            '<div class="qtext">' + questionHtml(q.text, q.id) + '</div>' +
            (g.split ? '<div class="qfocus-guide"><b>' + UI.esc(g.name) + '</b>' +
                       '<span class="pill acc">' + UI.esc(g.split) + '</span>' +
                       '<p>' + UI.esc(g.how) + '</p></div>' : "") +

            (show
              ? modelBlock(q, er) +
                (q.ms ? '<div class="section-label" style="margin:18px 0 8px">Mark scheme</div>' + msSheet(q.ms, q.id)
                      : '<div class="tiny faint">No mark scheme was found for this one.</div>') +
                (er ? UI.examinerReport(er, { series: q.series, paper: q.paper,
                                              question: q.q + (q.part ? "(" + q.part + ")" : "") }) : "") +
                '<button class="btn btn-sm btn-block" style="margin-top:14px" data-action="pack-hide" data-id="' + q.id + '">Hide the answer</button>'
              : '<button class="btn btn-primary btn-block" style="margin-top:18px" data-action="pack-reveal" data-id="' + q.id + '">' +
                  'Reveal answer' + (er ? " and examiner report" : "") + '</button>' +
                '<div class="tiny faint" style="text-align:center;margin-top:8px">Write your answer first — ' +
                  minutesFor(q.marks) + ' minutes is what it is worth.</div>') +
            (show ? '<div class="qscore"><label>Score</label><input class="input" id="packScore" type="number" min="0" max="' + q.marks + '" placeholder="out of ' + q.marks + '">' +
              '<button class="btn btn-primary" data-action="pack-mark" data-id="' + q.id + '">Save score</button></div>' : '') +
            /* Reported from where it was noticed, with the question already
               identified. See js/reports.js. */
            '<div class="row" style="justify-content:flex-end;margin-top:10px">' +
              '<button class="btn btn-sm btn-ghost" data-action="rep-question" data-id="' + q.id +
                '" data-where="Question packs">Report a problem</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---------- year control ---------- */
  function yearBar() {
    const seg = function (val, label, n) {
      return '<button class="yearseg' + (yearFilter === val ? " on" : "") + '" ' +
        'data-action="pack-year" data-val="' + val + '">' + label + '<small>' + n + '</small></button>';
    };
    return '<div class="yearbar">' +
      seg("1", "YEAR 1", countBy(function (q) { return q.year === 1; })) +
      seg("2", "YEAR 2", countBy(function (q) { return q.year === 2; })) +
    '</div>' +
    (yearFilter !== "all"
      ? '<button class="btn btn-sm btn-block" style="margin-top:8px" data-action="pack-year" data-val="all">Show both years</button>'
      : "");
  }

  function render(root) {
    if (typeof ECO_QUESTIONS === "undefined") {
      root.innerHTML = UI.empty("✎", "No question bank for this subject",
        "Question packs are Economics only at the moment.");
      return;
    }
    const g = GUIDE[tariff];
    const list = questions();
    const focused = focusId ? byId(focusId) : null;

    root.innerHTML =
      '<div class="card">' +
        '<div class="card-head"><div class="card-title">Question packs</div>' +
          '<div class="right"><span class="tiny faint">' + ECO_QUESTIONS.length +
            ' questions from ' + paperCount() + ' past papers</span></div>' +
        '</div>' +
        '<div class="tiny muted">Every question, mark scheme and examiner report is Pearson’s own, from the ' +
          'Edexcel 9EC0 papers. Pick a tariff and drill it.</div>' +
        '<div class="row wrap" style="gap:7px;margin-top:14px">' +
          TARIFFS.map(function (t) {
            const n = ECO_QUESTIONS.filter(function (q) {
              return q.marks === t &&
                (paperFilter === "all" || String(q.paper) === paperFilter) &&
                (yearFilter === "all" || String(q.year) === yearFilter);
            }).length;
            return '<button class="btn btn-sm' + (t === tariff ? " btn-primary" : "") +
              (n ? "" : " is-empty") + '" data-action="pack-tariff" data-val="' + t + '">' +
              t + ' mark <span class="faint">(' + n + ')</span></button>';
          }).join("") +
        '</div>' +
        '<div class="row wrap" style="gap:7px;margin-top:9px">' +
          [["all", "All papers"], ["1", "Paper 1 · micro"], ["2", "Paper 2 · macro"],
           ["3", "Paper 3 · synoptic"]].map(function (p) {
            return '<button class="btn btn-sm' + (paperFilter === p[0] ? " btn-primary" : "") + '" ' +
              'data-action="pack-paper" data-val="' + p[0] + '">' + p[1] + '</button>';
          }).join("") +
        '</div>' +
        '<div style="margin-top:12px">' + yearBar() + '</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:12px">' +
          '<input class="input" id="packSearch" placeholder="Search questions — elasticity, PED, June 2022, 1.2.5…" ' +
            'value="' + UI.esc(query) + '" style="flex:1;min-width:240px">' +
          (query ? '<button class="btn btn-sm" data-action="pack-clear">Clear</button>' : "") +
        '</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:10px">' +
          '<button class="btn btn-primary" data-action="pack-random">Random question</button>' +
          '<button class="btn" data-action="pack-practice">Build a practice set</button>' +
          '<button class="btn' + (todoOnly ? " btn-primary" : "") + '" data-action="pack-todo-only">' +
            '★ To-do' + (todo().length ? ' (' + todo().length + ')' : '') + '</button>' +
          (todo().length ? '<button class="btn" data-action="pack-todo-start">Work through the list</button>' : '') +
          '<div class="spacer"></div>' + scoreSummary() +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-head"><div class="card-title">' + tariff + ' markers — ' + g.name + '</div>' +
          '<div class="right"><span class="pill acc">' + g.split + '</span></div></div>' +
        '<div class="tiny muted">' + g.how + '</div>' +
        '<div class="row wrap" style="gap:8px;margin-top:12px">' +
          '<span class="pill">' + list.length + ' questions</span>' +
          '<span class="pill">' + minutesFor(tariff) + ' min each</span>' +
          '<span class="pill">' + Metrics.fmtMins(minutesFor(list.length * tariff)) + ' for all of them</span>' +
        '</div>' +
      '</div>' +

      (list.length
        ? '<div class="stack">' + list.map(row).join("") + '</div>'
        : UI.empty("✎", "Nothing matches", "Try another tariff, paper or year.")) +

      (focused ? focusHtml(focused) : "");

    document.body.classList.toggle("has-focus", !!focused);
    /* the divider only exists once the markup is in the document */
    setTimeout(function () { mountSplit(); mountSourcePages(); }, 0);
  }

  function mountSourcePages() {
    if (typeof PdfViewer === "undefined") return;
    document.querySelectorAll("[data-figure-pdf]").forEach(function (host) {
      PdfViewer.renderPages(host, host.dataset.figurePdf, +host.dataset.figureFrom, +host.dataset.figureTo);
    });
    document.querySelectorAll("[data-question-pdf]").forEach(function (host) {
      PdfViewer.renderPages(host, host.dataset.questionPdf, +host.dataset.questionFrom, +host.dataset.questionTo);
    });
  }

  function shuffled(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const x = out[i]; out[i] = out[j]; out[j] = x; }
    return out;
  }
  function openPractice() {
    const tariffs = TARIFFS.slice();
    const picked = {};
    UI.modal({ title: "Build a question practice set", wide: true, body:
      '<div class="field"><label class="label">Which tariffs?</label>' +
        '<div class="chips" id="packTar">' + tariffs.map(function (t) {
          return '<button type="button" class="chip" data-tar="' + t + '">' + t + ' mark</button>';
        }).join("") + '</div>' +
        '<div class="tiny faint" style="margin-top:6px">Pick none and it uses every tariff. ' +
        'The paper and year filters above still apply.</div></div>' +
      '<div class="form-grid" style="margin-top:14px"><div class="field"><label class="label">How many questions</label><input class="input" id="packCount" type="number" min="1" placeholder="e.g. 5"></div>' +
      '<div class="field"><label class="label">Or total marks</label><input class="input" id="packMarks" type="number" min="5" placeholder="e.g. 25"></div></div>' +
      '<div class="tiny faint">Leave one blank to choose by the other. At 1.2 minutes a mark, 25 marks is half an hour.</div>',
      footer: '<button class="btn" data-modal-close>Cancel</button><button class="btn btn-primary" id="packStart">Start practice</button>',
      onMount: function (box) {
      box.querySelectorAll('[data-tar]').forEach(function (b2) {
        b2.onclick = function () {
          const t = +b2.dataset.tar;
          picked[t] = !picked[t];
          b2.classList.toggle("on", !!picked[t]);
        };
      });
      box.querySelector('#packStart').onclick = function () {
        const wantedCount = +box.querySelector('#packCount').value || 0;
        const wantedMarks = +box.querySelector('#packMarks').value || 0;
        const only = Object.keys(picked).filter(function (k) { return picked[k]; }).map(Number);
        const pool = shuffled(ECO_QUESTIONS.filter(function (q) {
          if (only.length && only.indexOf(q.marks) < 0) return false;
          return (paperFilter === 'all' || String(q.paper) === paperFilter) &&
                 (yearFilter === 'all' || String(q.year) === yearFilter);
        }));
        const chosen = [], marks = { value: 0 };
        pool.some(function (q) { if ((wantedCount && chosen.length >= wantedCount) || (wantedMarks && marks.value + q.marks > wantedMarks && chosen.length)) return true; chosen.push(q.id); marks.value += q.marks; return false; });
        if (!chosen.length) { UI.toast('No questions match those filters', 'bad'); return; }
        practiceQueue = chosen; practiceIndex = 0; focusId = chosen[0]; caseOpen = false; UI.closeModal(); App.render();
      }; }
    });
  }

  /* The divider between the case study and the question.

     Dragged, it hands width from one side to the other. Clicked without
     moving, it folds the case study away — so the same knob does both, and
     a click is told from a drag by whether the pointer actually travelled. */
  const MIN_CASE = 220;
  function mountSplit() {
    const bar = document.querySelector("[data-split]");
    if (!bar || bar.dataset.wired === "1") return;
    bar.dataset.wired = "1";

    const body = document.querySelector(".qcase-body");
    const shell = document.querySelector(".qfocus-shell");
    const knob = bar.querySelector(".qsplit-knob");
    if (!body || !shell) return;

    let dragging = false, startX = 0, startW = 0, moved = 0;

    bar.addEventListener("pointerdown", function (e) {
      dragging = true; moved = 0;
      startX = e.clientX;
      startW = body.getBoundingClientRect().width;
      bar.classList.add("dragging");
      try { bar.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    });

    bar.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      /* Leave the question a workable column whatever happens. The tab and
         the divider sit between them and take their own width, so they come
         off the budget too. */
      const chrome = 44 + 16;
      const max = Math.max(MIN_CASE, shell.getBoundingClientRect().width - 400 - chrome);
      const want = Math.round(Math.min(max, Math.max(MIN_CASE, startW + dx)));
      /* Point the arrow the way you are actually pulling — and only when the
         edge really moves, so it does not flip about once you hit a stop. */
      if (knob && want !== caseWidth) knob.textContent = want > caseWidth ? "›" : "‹";
      caseWidth = want;
      body.style.width = caseWidth + "px";
    });

    const finish = function (e) {
      if (!dragging) return;
      dragging = false;
      bar.classList.remove("dragging");
      if (knob) knob.textContent = "‹";     // back to the resting direction
      if (moved < 4) { caseOpen = false; App.render(); }
    };
    bar.addEventListener("pointerup", finish);
    bar.addEventListener("pointercancel", finish);
  }

  /* Re-rendering replaces the input, so the caret has to be put back or the
     box loses focus after the first keystroke. */
  function setSearch(v) {
    query = v;
    App.render();
    const box = document.getElementById("packSearch");
    if (box) { box.focus(); box.setSelectionRange(box.value.length, box.value.length); }
  }

  function handle(action, el) {
    switch (action) {
      case "pack-tariff": tariff = +el.dataset.val; App.render(); return true;
      case "pack-paper":  paperFilter = el.dataset.val; App.render(); return true;
      case "pack-year":   yearFilter = el.dataset.val; App.render(); return true;
      case "pack-random": { const pool = questions(); if (!pool.length) return true; practiceQueue = []; focusId = pool[Math.floor(Math.random() * pool.length)].id; caseOpen = false; App.render(); return true; }
      case "pack-practice": openPractice(); return true;
      case "pack-fig": {
        const k = el.dataset.fig;
        figOpen[k] = !figOpen[k];
        App.render();
        return true;
      }
      case "pack-clear": query = ""; App.render(); return true;
      case "pack-todo": toggleTodo(el.dataset.id); App.render(); return true;
      case "pack-todo-only": todoOnly = !todoOnly; App.render(); return true;
      case "pack-todo-start": {
        const ids = todo().filter(byId);
        if (!ids.length) { UI.toast("Nothing on your to-do list yet", "bad"); return true; }
        practiceQueue = ids; practiceIndex = 0; focusId = ids[0]; caseOpen = false;
        App.render(); return true;
      }
      case "pack-open":   focusId = el.dataset.id; caseOpen = false; caseWidth = null; App.render(); return true;
      case "pack-keep": return true;            // a click inside the card
      case "pack-close": focusId = null; App.render(); return true;
      case "pack-case":   caseOpen = !caseOpen; App.render(); return true;
      case "pack-reveal": revealed[el.dataset.id] = true; App.render(); return true;
      case "pack-hide":   delete revealed[el.dataset.id]; App.render(); return true;
      case "pack-model": {
        const k = el.dataset.id;
        modelOpen[k] = !modelOpen[k];
        App.render();
        return true;
      }
      case "pack-time": {
        const q = byId(el.dataset.id);
        if (q) App.startQuestionTimer(q);
        return true;
      }
      case "pack-mark": {
        const q = byId(el.dataset.id), input = document.querySelector('#packScore');
        const got = input ? Number(input.value) : NaN;
        if (!q || !Number.isFinite(got) || got < 0 || got > q.marks) { UI.toast('Enter a score between 0 and ' + (q ? q.marks : 'the available marks'), 'bad'); return true; }
        Store.mutate(function (st) { st.packAttempts.unshift({ questionId: q.id, got: got, available: q.marks, at: new Date().toISOString() }); });
        UI.toast('Saved ' + got + ' / ' + q.marks, got / q.marks >= .65 ? 'ok' : 'warn');
        if (practiceQueue.length && practiceIndex < practiceQueue.length - 1) { practiceIndex++; focusId = practiceQueue[practiceIndex]; revealed = {}; caseOpen = false; }
        else if (practiceQueue.length) { practiceQueue = []; practiceIndex = 0; focusId = null; }
        App.render(); return true;
      }
    }
    return false;
  }

  /* The question renderer is shared with the practice tests, which show the
     same Economics questions inside a paper rather than one at a time. It
     lives here because this is where the extraction quirks it works around
     are documented; exporting it beats a second, drifting copy. */
  return { render: render, setSearch: setSearch, handle: handle, minutesFor: minutesFor,
           questionHtml: questionHtml, msSheet: msSheet, caseFor: caseFor, caseHtml: caseHtml,
           reportFor: reportFor,
           guideFor: function (marks) { return GUIDE[marks] || null; } };
})();
