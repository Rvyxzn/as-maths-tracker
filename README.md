# A-Level Maths Revision Tracker & Adaptive Study Planner

Pearson Edexcel A level Mathematics (9MA0), Year 1 and Year 2, across Pure,
Statistics and Mechanics.
Exam date preset to **1 September 2026** (changeable in Settings).

## Using it

### Online (nothing to install)

**https://Rvyxzn.github.io/as-maths-tracker/**

Published with GitHub Pages, so it runs in any browser, laptop or phone, with no
download and no setup. Open the link and start.

Your progress is saved in **your own browser**, so two people using the same link keep
entirely separate ratings, scores and plans. Nothing is shared and nothing is uploaded.

### Running it locally

Double-click **`Start Revision Tracker.bat`**. It starts a small server and opens the
site for you. Keep that window open while you study; closing it stops the site.
It needs Python installed.

> **Do not open `index.html` by double-clicking it.** Browsers block both the PDF.js
> worker and the file fetch on `file://`, so every PDF panel comes up blank. The app
> detects this and tells you so rather than failing silently. Use the launcher or the
> hosted link.

**PDFs render via PDF.js, not the browser's native plugin.** This app runs inside
embedded/Electron-based browser panes that don't ship Chromium's built-in PDF viewer
extension, a plain `<iframe src="file.pdf">` renders completely blank in that
environment, with no error. `js/pdf-viewer.js` renders every PDF to `<canvas>` with a
vendored copy of PDF.js (`js/vendor/pdfjs/`, Apache-2.0, no CDN at runtime) instead, so
it looks identical everywhere. One consequence worth knowing: DOM morphing (see below)
treats a `.pdfv` element as an opaque leaf and never re-diffs its children, otherwise an
unrelated click anywhere else on the same page would wipe and re-render the PDF from
scratch.

Every PDF panel, exam questions, mark schemes, past papers, has the same toolbar:

- **Zoom**, buttons, a slider, or **Ctrl/Cmd + scroll wheel zooms toward your cursor**.
  The zoom is scoped to that one PDF panel only; scrolling without Ctrl held behaves
  normally, and the site itself never zooms.
- **Reset**, snaps back to fit-width and scrolls back to the top.
- **Pen**, draw directly on the page (freehand, in red ink) to annotate a question
  or mark scheme; a **Clear** button appears while the pen is active. Drawings are not
  saved between sessions.
- **Full screen**, expands that one panel to fill most of the screen with a blurred
  backdrop behind it, Escape or clicking the backdrop closes it. This replaced the old
  "open in a new tab" links, which triggered a file-download prompt in this app's
  browser environment rather than actually opening the PDF.

No build step, no npm. The only external request is the Google Fonts pair, which falls back cleanly offline.

## Structure, by chapter

The topic database follows the **Pearson Edexcel student books**, which are the divisions
the specification is actually taught, revised and video-summarised in:

| Book | Chapters |
|---|---|
| Pure Mathematics Year 1/AS | 1-14 |
| Pure Mathematics Year 2 | 1-12 |
| Statistics & Mechanics Year 1/AS | 1-7 Statistics, 8-11 Mechanics |
| Statistics & Mechanics Year 2 | 1-3 Statistics, 4-8 Mechanics |

Both years restart their chapter numbering, so every chapter is labelled **Y1** or **Y2**
throughout the app.

**Pure:** 1 Algebraic Expressions · 2 Quadratics · 3 Equations and Inequalities ·
4 Graphs and Transformations · 5 Straight Line Graphs · 6 Circles · 7 Algebraic Methods ·
8 The Binomial Expansion · 9 Trigonometric Ratios · 10 Trigonometric Identities and Equations ·
11 Vectors · 12 Differentiation · 13 Integration · 14 Exponentials and Logarithms

**Statistics:** 1 Data Collection · 2 Measures of Location and Spread · 3 Representations of Data ·
4 Correlation · 5 Probability · 6 Statistical Distributions · 7 Hypothesis Testing

**Mechanics:** 8 Modelling in Mechanics · 9 Constant Acceleration · 10 Forces and Motion ·
11 Variable Acceleration

### Year 2

**Pure:** 1 Algebraic Methods · 2 Functions and Graphs · 3 Sequences and Series ·
4 Binomial Expansion · 5 Radians · 6 Trigonometric Functions · 7 Trigonometry and Modelling ·
8 Parametric Equations · 9 Differentiation · 10 Numerical Methods · 11 Integration ·
12 Vectors (3D)

**Statistics:** 1 Regression, Correlation and Hypothesis Testing · 2 Conditional Probability ·
3 The Normal Distribution

**Mechanics:** 4 Moments · 5 Forces and Friction · 6 Projectiles · 7 Applications of Forces ·
8 Further Kinematics

Every chapter is broken into its numbered sections (1.1, 1.2, …), **247 examinable sections
across 45 chapters**, each with its own "what you need to be able to do" list, RAG rating,
video link, question history and review schedule.

### Year filter

Topics, the dashboard and the planner all respect a **Year 1 / Year 2 / both** filter, so a
Year 12 student can work the Year 1 content only and switch Year 2 on once it is taught.
Set the default in Settings, or flip it per view in Topics.

## Specification accuracy

This is the full A level (9MA0), assessed as three papers:

| Paper | Content | Length | Marks |
|---|---|---|---|
| 1 | Pure Mathematics 1 | 2h | 100 |
| 2 | Pure Mathematics 2 | 2h | 100 |
| 3 | Statistics and Mechanics (50 marks each) | 2h | 100 |

Pearson do not split the pure content between Papers 1 and 2, so any pure topic from either
year can appear on either paper. The app therefore keeps Pure as one body of content.

Grade boundaries shown in the app are **indicative, not a published series**. They are a
round-number reading of where recent 9MA0 series have sat, and Edexcel move them every year.
Check Pearson's published boundaries for the series you are sitting; the values live at the
top of `js/metrics.js` if you want them exact.

## School Tests

Past Papers covers official Edexcel papers. **School Tests** covers the other half of the
evidence: chapter tests, mini-assessments and school mocks.

- **Topic tests attach to chapters.** Type the title and the chapter is suggested from it
  ("Chapter 5 Radians test" attaches to Y2 Ch 5 Radians). Tick or untick to correct it.
  A weak score then pushes those chapters up your plan, exactly like losing marks in a
  past paper does.
- **Mocks and full papers attach to nothing.** There is no single chapter to blame, so they
  are tracked only as an overall grade trend.
- **Grade-only entries are allowed.** If all you were told is "you got a B", log that. It is
  kept in your history but never feeds the planner and is not plotted, because inventing a
  percentage from a letter would put a made-up number into your schedule.

Past papers are also tagged **AS (8MA0)** or **A level (9MA0)** and can be filtered by level,
so an AS average never flatters a full A level prediction.

## Exam-Focus mode

The dial in the top bar is an overclock-style gauge: off, a small dim tick sits on the left
with the arc empty; on, the needle **sweeps clockwise to the right**, the arc fills with a
green gradient and the whole clock enlarges. The **i** button beside it opens a popup
explaining exactly what the mode changes.

It switches the whole app between two granularities:

| | Off | On |
|---|---|---|
| Working unit | 247 specification sections | 45 chapters |
| A session covers | one section, e.g. 12.9 Stationary points | a whole chapter, e.g. Chapter 12 Differentiation |
| Assessment length | 247 ratings | 45 ratings |

In chapter mode each session gives you a summary of what the chapter is for, **the
components that actually carry the marks**, **where marks get thrown away**, an exam-value
rating, and a link to Edexcel topic-sorted exam questions with mark schemes.

Your ratings carry across both ways: a chapter inherits the *weakest* of its sections,
and sections inherit their chapter's rating if they have none. A rating you set yourself
always beats a derived one, and a derived chapter rating refreshes if you later re-rate
its sections.

### About the chapter weightings

Pearson do not publish a per-topic frequency count for 9MA0, and no reliable published
tally exists, the papers would have to be hand-counted. The exam-value ratings and the
"typically worth" figures are an **editorial judgement**, built from the assessment
structure of the specification, the 100/60 mark split between the papers, and the
recurring question structures in the Sample Assessment Materials and released papers.
They are a sensible order to revise in, not a measured statistic, and the app says so
wherever they appear.

Exam-question links point at Physics & Maths Tutor's Edexcel topic-sorted question sets
(real past-paper questions with mark schemes, split AS / A level). Every URL was checked.
Chapters map onto PMT's spec-theme pages, so several chapters legitimately share a page.

## Exam Questions

The **Exam Questions** section in the sidebar holds 21 Edexcel topic question sets with
their full mark schemes, 13 Pure, 4 Statistics, 4 Mechanics, read straight from
`Exam questions PDFs/`. Nothing is downloaded or attached: open a set and the paper is
there, with the mark scheme behind a deliberate *Reveal* click.

Each set lists the chapters it covers, and the same PDFs appear inside step 2 of every
chapter, so the questions are where you actually revise. Chapter 9 (Constant Acceleration)
gets two sets, SUVAT and Motion-Time Graphs. Where a set is the closest available match
rather than an exact one (for example Equations and Inequalities sitting inside the
Quadratics set), the app says so rather than pretending the fit is exact.

## Formula flashcards

The **Flashcards** section holds 244 cards across all 25 chapters, written from the
specification. Every card is tagged **"Given in the booklet"** or **"Must memorise"**,
taken from Pearson's *Mathematical Formulae and Statistical Tables* (P54458A), section 1
"AS Mathematics".

The AS booklet is far shorter than people assume. It gives you only: sphere and cone
surface areas, the binomial series with ⁿCᵣ, change of base for logs, e^(x ln a) = aˣ,
differentiation from first principles, P(A′) = 1 − P(A), IQR, Sxx and standard deviation,
and the five suvat equations. **Everything else**, the quadratic formula, the circle
equation, every trig identity, the sine and cosine rules, the log laws, differentiating
and integrating xⁿ, F = ma, has to come out of your head, so there is no point drilling
what you are handed on the day.

Study mode flips cards, shuffles, filters to *must memorise* or *not yet known*, and
tracks what you have got. The graph-shape cards (sin, cos, tan, both parabolas, cubic,
reciprocal) draw the curve on the back, because the shape is the answer.

**Quizlet import/export** works both ways through Quizlet's own copy-and-paste format - no account linking, since Quizlet has no open API for creating sets. Separators are
selectable to match whatever Quizlet gives you, and the import preview shows what it
parsed before you commit.

## Time tracking

"Time studied today" is a progress bar that fills as you log time, with a percentage
against the study time you set for the day.

- **Ticking a task off logs its planned time** towards today. Un-ticking takes it back off.
- Starting any task or past paper offers to **time you** (switch the prompt off in Settings).
- Finishing a session logs time even with no timer running, using the time you recorded
  (or the task's planned length). Nothing is ever counted twice.
- A live timer sits in the top bar with pause/resume/stop, and the bar creeps forward
  as you work.
- Finishing a revision session banks the elapsed time automatically.
- Stopping a past-paper timer carries the elapsed time into the paper log as "time taken".
- **Log time** opens the day's time log: add an entry by hand, correct a number that is
  wrong, or press ✕ to remove time you did not mean to log. Every chunk logged today is
  also listed under the bar on Today's Plan with a one-click remove, and there is a
  "clear the whole day" option if you want to start the day again.

Removing logged time is independent of your tasks, a task stays ticked off, and re-ticking
it will not double-count.

## Retaking the RAG assessment

Re-rating is meant to be routine, it is available from the Dashboard, the Weaknesses page
and Settings. Choose the scope:

- **Everything**, re-rate from scratch
- **Weak only**, what is currently red, amber or unrated
- **Unrated only**, fill the gaps you skipped
- **Going stale**, not revised in 5+ days, or never
- **One paper**, Pure, Statistics or Mechanics

Each completed assessment is snapshotted, so you can see how your red/amber/green mix
has shifted over time.

## Weaknesses: topic or chapter

The Weaknesses page has a **Topic / Chapter** toggle that works in either mode. Chapter view
rolls a chapter and all of its sections together, accuracy, marks lost in past papers and
coverage percentage. Either way, every row names the chapter it belongs to.

## How the planner works

`ASSESS → PLAN → REVISE → PRACTISE → REVIEW → REPLAN`

1. First run walks you through a RAG rating of all 247 sections.
2. It generates a day-by-day plan to the exam, sized to the study time you say you have.
3. Every session, question set and past-paper error you log **recalculates the plan**.

Priority per section is scored from: RAG rating, whether it's actually been covered, exam
frequency, prerequisite value, days since last revision, question accuracy, previous attempts,
marks lost in past papers, and spaced-repetition due dates.

**Your scores override your self-rating.** Rate something green then score 42% on its questions
and it drops to red automatically, with the reason shown. Lose marks on a topic across two past
papers and it gets promoted even if you rated it green.

Phases switch automatically: specification coverage → mixed practice → final preparation →
**final week mode** (7 days out: timed papers, error analysis, videos suppressed) →
**exam eve mode** (light consolidation only). If coverage is still low in the final week the
planner deliberately thins the papers down to sections and keeps covering new content.

## Calendar

Two views. **List** shows every day with its full task cards. **Month grid** shows each day
as a glyph summary rather than prose:

- a load bar for how full the day is against your budget (green when full)
- RAG dots for the topics scheduled
- icons for a past paper, error analysis or a formula drill
- a moon for rest days, a graduation cap for the exam

A key sits under the grid. **Click any day and it expands** into a short brief directly
under that week, the date, how far away it is, time planned against your budget, how many
tasks are done, and a one-line-per-task list of what you are actually doing. From there you
can change that day's time or add a task without leaving the calendar.

## Look and feel

Palette, gradient and font pairing are taken from the Contar AI site:

- **Dark**, `#15171c` field, `#1c2027` surfaces, blue ramp `#2f80ed → #4fa9f0 → #86dcf8`
- **Light**, a soft blue gradient field `#eef4fd → #dce9fa → #c8dcf6` with gently tinted
  `#fbfcff` surfaces, so nothing reads as a stark white slab, and the saturated brand
  gradient carries the hero instead
- **Fonts**, Bricolage Grotesque (display) + Instrument Sans (body)

Toggle with the sun/moon button at the bottom of the sidebar, or in Settings. Both themes
were checked against WCAG AA across every view, with translucent layers and gradient stops
composited properly: **no text falls below AA in either mode.**

Motion is used throughout, staggered card entrances, button presses, a pop when you tick a
task off, bars that grow, and the countdown counting in. All of it collapses under
`prefers-reduced-motion`.

**Rendering is deliberately non-destructive.** Changing view swaps the panel and plays the
entrance animation; anything else (rating a topic, ticking a task, filtering, toggling
Exam-Focus) is applied by **morphing the existing DOM** rather than replacing it, so there is
no repaint flash, scroll position and caret survive, and entrance animations do not replay.
The little pop on a control is applied to the element you actually clicked, not to every
element that happens to be selected, otherwise the whole view would pop on each render.

## Your data

Saved in your browser's `localStorage` under `as-maths-tracker-v1`, plus IndexedDB for any
PDFs you attach yourself. It never leaves your machine, there is no account and no server
storing anything.

**Clearing your browser data will erase your progress.** Settings → *Export JSON backup*
downloads a full snapshot; *Import backup* restores it. Do this weekly.

Each address is a separate browser origin with **separate saved data**, the hosted link,
`localhost:8777`, and `file://` do not share progress. Pick one and stick with it, or move
between them with export/import. The same applies across devices: your phone and your
laptop keep their own copies, so use export/import to move progress between them.

## Videos and past papers

No video URLs or past-paper links are invented. Each section has a field where you paste the
Zeeshan Zamured chapter summary video once, it's remembered against that section forever.
Past papers are added manually (title, type, date, marks, timing, URL); the official Pearson
course page is linked in Settings.

## File layout

```
index.html            shell + script tags (?v= query busts browser cache on edits)
css/app.css           design tokens, both themes, all components
js/spec-data.js       the chapter-by-chapter 9MA0 database (247 sections, Y1 + Y2)
js/exam-focus.js      chapter-level summaries, exam weightings, traps, question links
js/store.js           state + localStorage + export/import
js/metrics.js         derived values: effective RAG, coverage, phases, feasibility
js/scheduler.js       priority scoring, spaced repetition, plan generation
js/ui.js              shared render helpers, modals, toasts, SVG charts
js/views/*.js         one file per screen
js/app.js             routing, navigation, global actions
```

If you edit any JS or CSS file, bump the `?v=` numbers in `index.html` so your browser picks up
the change.

## Sources

Chapter structure cross-checked against:

- [Pearson Edexcel AS/A level Mathematics (2017) specification](https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html)
- [Pure Mathematics Year 1/AS contents](https://solutionbank.uk/edexcel-pure-maths-year-1.php)
- [Statistics & Mechanics Year 1/AS contents](https://ebin.pub/edexcel-as-and-a-level-mathematics-statistics-amp-mechanics-year-1-as-1nbsped-1292232536-9781292232539.html)
