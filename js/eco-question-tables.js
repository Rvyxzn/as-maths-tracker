/* ============================================================
   Tables printed inside a question

   A table is a grid, and a PDF stores it as text scattered at
   coordinates. Read as a run of words it comes out as
   "Vietnam Gross National Human Income per Development capita
   Index (HDI) value (2011 PPPs) India 5 497 0.609" — which is
   not something you can calculate from, and these are exactly
   the questions that ask you to calculate.

   So the nine questions that print a table carry it here as
   real rows, transcribed from the paper. `keep` is the sentence
   that introduces it: everything after that sentence on the same
   line is the flattened grid, and is replaced by the table below.

   A blank cell is blank in the paper too — the last columns of a
   supply and demand table are there for your working.
   ============================================================ */

const ECO_QUESTION_TABLES = {

  "p1-june2017-q1": {
    keep: "The table shows market data for e-cigarette kits. The original equilibrium price is £23.",
    head: ["Price £", "Quantity demanded per month (000)", "Quantity supplied per month (000)",
           "New quantity demanded per month (000)", "New quantity supplied per month (000)"],
    rows: [["25", "5", "9", "", ""],
           ["24", "6", "8", "", ""],
           ["23", "7", "7", "", ""],
           ["22", "8", "6", "", ""],
           ["21", "9", "5", "", ""]],
    note: "The last two columns are blank in the paper — they are for your working."
  },

  "p1-june2022-q2": {
    keep: "The table below shows data on the drinks market in Chile in 2017.",
    head: ["", "Value"],
    rows: [["Price elasticity of demand for sweetened drinks", "−1.37"],
           ["Cross elasticity of demand for bottled water in response to a price change in sweetened drinks", "+0.63"]]
  },

  "p1-june2024-q1": {
    keep: "The table below shows price elasticity of demand for bus tickets in London 2021",
    head: ["Age", "Price elasticity of demand"],
    rows: [["18+ Student", "−0.7"], ["Adult", "−0.4"]]
  },

  "p1-june2024-q2": {
    keep: "The table below shows price elasticity of supply for housing in the US in 2020.",
    head: ["US State", "Price elasticity of supply"],
    rows: [["New York", "+0.5"], ["Texas", "+1.8"]]
  },

  "p1-specimen-q2": {
    keep: "The table shows the quantity of PlayStation 4 games demanded and supplied.",
    head: ["Price", "Quantity demanded per month (000s)", "Quantity supplied per month (000s)",
           "New quantity supplied per month (000s)"],
    rows: [["£25", "400", "320", ""],
           ["£30", "360", "360", ""],
           ["£35", "320", "400", ""],
           ["£40", "280", "440", ""],
           ["£45", "240", "480", ""]],
    note: "The last column is blank in the paper — it is for your working."
  },

  "p1-specimen-q4": {
    keep: "The following table shows the sales (millions) of tablet computers in quarter 3, 2012 and quarter 3, 2013:",
    head: ["Manufacturer", "Quarter 3, 2012", "Quarter 3, 2013"],
    rows: [["Apple", "14.0", "14.1"],
           ["Samsung", "4.3", "9.7"],
           ["Asus", "2.3", "3.5"],
           ["Lenovo", "0.4", "2.3"],
           ["Acer", "0.3", "1.2"],
           ["Others", "13.5", "16.8"],
           ["Total", "34.8", "47.6"]]
  },

  "p2-june2017-q2": {
    keep: "The table below shows marginal propensity to save data for an economy.",
    head: ["Year", "Marginal propensity to save (mps)"],
    rows: [["2010", "0.11"], ["2011", "0.09"], ["2012", "0.07"],
           ["2013", "0.05"], ["2014", "0.05"], ["2015", "0.04"]]
  },

  "p2-june2017-q5": {
    keep: "The table shows the selected economic data in 2014 for Vietnam and India.",
    head: ["", "Gross National Income per capita (2011 PPPs)", "Human Development Index (HDI) value"],
    rows: [["Vietnam", "5 092", "0.666"], ["India", "5 497", "0.609"]]
  },

  /* Not a table but a bar chart, and its values are printed above the bars,
     so it is exact and belongs with the question rather than in a caption. */
  "p1-june2018-q5": {
    keep: "The following graph shows the global sales of personal computers (PCs) between 2011 and 2015.",
    chart: { kind: "bar", exact: true, yLabel: "millions of PCs",
             caption: "Global sales of personal computers, 2011–2015",
             x: [2011, 2012, 2013, 2014, 2015],
             series: [{ name: "PCs sold", values: [352.4, 350.4, 315.1, 308.2, 276.7] }] }
  }

};
