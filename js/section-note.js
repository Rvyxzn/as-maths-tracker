/* ============================================================
   Saying what a section of the paper actually is.

   "Section A" means nothing on its own, and it does not even mean one
   thing within a subject: on 9EC0 Papers 1 and 2, Section A is eight or
   nine short questions printed as (a), (b), (c) — a "5 marker" there is
   1 + 1 + 3, which is not the thing you practise when you sit down to
   write a five mark answer. Paper 3 also has a Section A and it is
   nothing of the sort: two data-response sets of 5, 8, 12 and 25.

   So the wording is generated from the bank rather than written down:
   which papers print a section split into parts, which print it whole,
   and what it is worth. Both the question packs and the practice-test
   builder read it, so the same filter is explained the same way.
   ============================================================ */

const SectionNote = (function () {

  function list(items, join) {
    if (!items.length) return "";
    if (items.length === 1) return items[0];
    return items.slice(0, -1).join(", ") + " " + (join || "and") + " " + items[items.length - 1];
  }

  function papers(nums) {
    if (!nums.length) return "";
    return (nums.length === 1 ? "Paper " : "Papers ") + list(nums);
  }

  function marks(tariffs) {
    if (!tariffs.length) return "";
    return list(tariffs.map(String)) + " mark";
  }

  /* The tooltip on one chip: what you get if you leave this section on. */
  function title(s) {
    const bits = [s.n + " questions", marks(s.tariffs)];
    if (s.splitPapers.length) {
      bits.push(marks(s.splitTariffs) + " split into parts on " + papers(s.splitPapers));
    }
    if (s.wholePapers.length) bits.push("whole answers on " + papers(s.wholePapers));
    return bits.filter(Boolean).join(" · ");
  }

  /* The line under the chips. It leads with the split sections, because
     wanting rid of those is the reason this control exists, and then says
     what is currently selected so the filter is never silently on. */
  function hint(secs, on, state) {
    const st = state || {};
    const split = secs.filter(function (s) { return s.splitPapers.length; });
    let lead;
    if (!split.length) {
      lead = secs.length > 1 ? "Pick the sections you want to practise." : "";
    } else {
      lead = split.map(function (s) {
        const t = s.splitTariffs[0];
        const whole = s.wholePapers.length
          ? " Its " + papers(s.wholePapers) + " questions are whole answers and are not."
          : "";
        return "Section " + s.id + " on " + papers(s.splitPapers) + " is printed as small parts — " +
               "a " + t + " marker there is 1 + 1 + 3 rather than one " + t +
               " mark answer." + whole;
      }).join(" ");
    }

    /* The two controls overlap, and saying which one is doing the work
       matters: "whole answers only" is the narrower cut, because it takes
       the split questions and leaves everything else in the same section
       alone. When both are on, the sections are the coarser filter and are
       named second. */
    const parts = [];
    if (st.whole) {
      parts.push("Leaving out the " + st.multi + " split ones.");
      if (on && on.length) parts.push("Showing Section " + list(on.slice()) + " only.");
    } else if (on && on.length) {
      parts.push("Showing Section " + list(on.slice()) + " only.");
      if (st.multi) {
        parts.push("“Whole answers only” drops just the " + st.multi +
                   " split questions and keeps the rest of every section.");
      }
    } else if (secs.length > 1) {
      parts.push("Nothing filtered, so everything is showing.");
    } else if (st.multi) {
      parts.push("Nothing filtered. “Whole answers only” drops the " + st.multi +
                 " questions printed in parts.");
    }

    return [lead].concat(parts).filter(Boolean).join(" ");
  }

  return { title: title, hint: hint };
})();
