/* ============================================================
   Superpowers question ownership

   The Geography extractor already contains every Paper 2 Question 2
   from the specimen and June 2018-2024. They pre-date Topic 7 being in
   this tracker's specification, so this promotes all fourteen parts and
   files each under the correct Superpowers enquiry question.
   ============================================================ */

(function () {
  if (typeof GEO_QUESTIONS === "undefined") return;

  const eqs = {
    "geo7-1": "EQ1: What are superpowers and how have they changed over time?",
    "geo7-2": "EQ2: What are the impacts of superpowers on the global economy, politics and environment?",
    "geo7-3": "EQ3: What spheres of influence are contested and what are the implications?"
  };
  const ownership = {
    "g2-specimen-q2a": "geo7-1",
    "g2-specimen-q2b": "geo7-2",
    "g2-june2018-q2a": "geo7-1",
    "g2-june2019-q2a": "geo7-1",
    "g2-june2019-q2b": "geo7-3",
    "g2-june2020-q2a": "geo7-2",
    "g2-june2020-q2b": "geo7-2",
    "g2-june2021-q2a": "geo7-1",
    "g2-june2022-q2a": "geo7-1",
    "g2-june2022-q2b": "geo7-3",
    "g2-june2023-q2a": "geo7-2",
    "g2-june2023-q2b": "geo7-1",
    "g2-june2024-q2a": "geo7-2",
    "g2-june2024-q2b": "geo7-1"
  };

  GEO_QUESTIONS.forEach(function (q) {
    const eq = ownership[q.id];
    if (!eq) return;
    q.inSpec = true;
    q.eq = eq;
    q.eqConfident = true;
    q.topicCode = eq === "geo7-1" ? "7.1" : (eq === "geo7-2" ? "7.2" : "7.3");
    q.topicName = eqs[eq];
  });
})();
