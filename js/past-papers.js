/* ============================================================
   The past-paper library

   24 Edexcel 9MA0 papers, 2018 to 2024 plus the sample
   assessment materials, each with its mark scheme. They sat on
   disk being useful only to the practice test, which draws
   individual questions out of them; nothing in the app let you
   simply open one and sit it, which is what a past paper is
   mostly for.

    and  are what the extraction got out of
   each one, and they are the honest reason three of these
   behave differently from the rest:

     2019 and 2021 Paper 3 are scans. There is no text layer at
     all - 2021 yields not one character - so no question can be
     located inside them and they contribute nothing to the
     practice test. They open and read perfectly well as papers,
     which is what this library is for.

     2024 Paper 3 is half a paper. The file the source site
     hosts is the Mechanics section only; re-downloading returns
     the same bytes, so the missing Statistics half is not
     something this end can fix.

   Everything else came out whole at 100 marks, bar 2018 Paper 1
   at 93, where one question escaped the extraction.
   ============================================================ */

const PAST_PAPER_ROOT = "Exam questions PDFs/A-Level Maths/Past papers/";

const PAST_PAPERS = [
 {"name":"2018 Paper 1 Pure","year":"2018","paper":1,"kind":"Pure","hasMs":true,"questions":13,"marks":93,"scan":false},
 {"name":"2018 Paper 2 Pure","year":"2018","paper":2,"kind":"Pure","hasMs":true,"questions":14,"marks":100,"scan":false},
 {"name":"2018 Paper 3 Applied","year":"2018","paper":3,"kind":"Applied","hasMs":true,"questions":10,"marks":100,"scan":false},
 {"name":"2019 Paper 1 Pure","year":"2019","paper":1,"kind":"Pure","hasMs":true,"questions":14,"marks":100,"scan":false},
 {"name":"2019 Paper 2 Pure","year":"2019","paper":2,"kind":"Pure","hasMs":true,"questions":14,"marks":100,"scan":false},
 {"name":"2019 Paper 3 Applied","year":"2019","paper":3,"kind":"Applied","hasMs":true,"questions":0,"marks":0,"scan":true},
 {"name":"2020 Paper 1 Pure","year":"2020","paper":1,"kind":"Pure","hasMs":true,"questions":16,"marks":100,"scan":false},
 {"name":"2020 Paper 2 Pure","year":"2020","paper":2,"kind":"Pure","hasMs":true,"questions":16,"marks":100,"scan":false},
 {"name":"2020 Paper 3 Applied","year":"2020","paper":3,"kind":"Applied","hasMs":true,"questions":10,"marks":100,"scan":false},
 {"name":"2021 Paper 1 Pure","year":"2021","paper":1,"kind":"Pure","hasMs":true,"questions":15,"marks":100,"scan":false},
 {"name":"2021 Paper 2 Pure","year":"2021","paper":2,"kind":"Pure","hasMs":true,"questions":15,"marks":100,"scan":false},
 {"name":"2021 Paper 3 Applied","year":"2021","paper":3,"kind":"Applied","hasMs":true,"questions":0,"marks":0,"scan":true},
 {"name":"2022 Paper 1 Pure","year":"2022","paper":1,"kind":"Pure","hasMs":true,"questions":16,"marks":100,"scan":false},
 {"name":"2022 Paper 2 Pure","year":"2022","paper":2,"kind":"Pure","hasMs":true,"questions":16,"marks":100,"scan":false},
 {"name":"2022 Paper 3 Applied","year":"2022","paper":3,"kind":"Applied","hasMs":true,"questions":11,"marks":100,"scan":false},
 {"name":"2023 Paper 1 Pure","year":"2023","paper":1,"kind":"Pure","hasMs":true,"questions":15,"marks":100,"scan":false},
 {"name":"2023 Paper 2 Pure","year":"2023","paper":2,"kind":"Pure","hasMs":true,"questions":15,"marks":100,"scan":false},
 {"name":"2023 Paper 3 Applied","year":"2023","paper":3,"kind":"Applied","hasMs":true,"questions":12,"marks":100,"scan":false},
 {"name":"2024 Paper 1 Pure","year":"2024","paper":1,"kind":"Pure","hasMs":true,"questions":15,"marks":100,"scan":false},
 {"name":"2024 Paper 2 Pure","year":"2024","paper":2,"kind":"Pure","hasMs":true,"questions":15,"marks":100,"scan":false},
 {"name":"2024 Paper 3 Applied","year":"2024","paper":3,"kind":"Applied","hasMs":true,"questions":6,"marks":50,"scan":false},
 {"name":"Sample Paper 1 Pure","year":"Sample","paper":1,"kind":"Pure","hasMs":true,"questions":15,"marks":100,"scan":false},
 {"name":"Sample Paper 2 Pure","year":"Sample","paper":2,"kind":"Pure","hasMs":true,"questions":16,"marks":100,"scan":false},
 {"name":"Sample Paper 3 Applied","year":"Sample","paper":3,"kind":"Applied","hasMs":true,"questions":10,"marks":100,"scan":false}
];

/* Where a paper's two PDFs live. */
function pastPaperUrl(rec, which) {
  const folder = which === "ms" ? "Mark schemes/" : "Questions/";
  const file = rec.name + (which === "ms" ? " MS" : "") + ".pdf";
  return encodeURI(PAST_PAPER_ROOT + folder + file);
}

/* Newest first, which is the order anyone actually wants them in. */
function pastPapersByYear() {
  const groups = {};
  PAST_PAPERS.forEach(function (p) {
    if (!groups[p.year]) groups[p.year] = [];
    groups[p.year].push(p);
  });
  return Object.keys(groups)
    .sort(function (a, b) {
      if (a === "Sample") return 1;
      if (b === "Sample") return -1;
      return b.localeCompare(a);
    })
    .map(function (y) { return { year: y, papers: groups[y] }; });
}
