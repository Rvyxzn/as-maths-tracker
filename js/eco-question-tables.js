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

   `resume` is where the question starts talking again on the far
   side of the table. Without it, a question that says "as a
   result of the advertising campaign, demand increased by 3 000"
   after its table loses the very change it is asking you to
   calculate.

   A blank cell is blank in the paper too — the last columns of a
   supply and demand table are there for your working.
   ============================================================ */

const ECO_QUESTION_TABLES = {

  /* ---------- questions that are the diagram ----------
     Each is drawn from the paper's own geometry: the same intercepts, the
     same axis values, the same labelled points in the same places. */

  "p1-june2018-q1": {
    keep: "The diagram refers to production possibility frontiers for a country that produces capital goods and consumer goods.",
    resume: "Originally, the economy has a production possibility frontier",
    diagram: {
      kind: "ppf", alt: "Two production possibility frontiers, XY and XZ, with points W, V and U at 50 capital goods",
      xLabel: "Output of consumer goods", yLabel: "Output of capital goods",
      xMax: 195, yMax: 118, xTicks: [80, 100, 120, 140, 170], yTicks: [50, 100],
      curves: [{ from: [0, 100], to: [120, 0], label: "XY", labelAt: [58, 74] },
               { from: [0, 100], to: [170, 0], label: "XZ", labelAt: [104, 66] }],
      points: [{ x: 0, y: 100, label: "X", dx: 6, dy: -7 },
               { x: 120, y: 0, label: "Y", dx: 4, dy: -7 },
               { x: 170, y: 0, label: "Z", dx: 4, dy: -7 },
               { x: 80, y: 50, label: "W", guides: true, dx: -4, dy: -8 },
               { x: 100, y: 50, label: "V", guides: true, dx: -4, dy: -8 },
               { x: 140, y: 50, label: "U", guides: true, dx: -4, dy: -8 }]
    }
  },

  "p1-june2023-q2": {
    keep: "The production possibility frontier shows last year's harvest for a UK farmer at point X.",
    diagram: {
      kind: "ppf", alt: "A straight production possibility frontier for wheat and oats with points W, X, Y and Z",
      xLabel: "Oats", yLabel: "Wheat",
      xMax: 5.4, yMax: 8.4, xTicks: [1, 2, 3, 4, 5], yTicks: [1, 2, 3, 4, 5, 6, 7],
      curves: [{ from: [0, 8], to: [4, 0], shape: "straight" }],
      points: [{ x: 1, y: 6, label: "Y", guides: true, dx: 7, dy: -5 },
               { x: 2, y: 4, label: "X", guides: true, dx: 7, dy: 4 },
               { x: 3, y: 5, label: "Z", dx: 8, dy: 4 },
               { x: 1.5, y: 2, label: "W", dx: -3, dy: 15 }]
    }
  },

  "p2-specimen-q5": {
    keep: "Colombia and Zambia each produce copper and emeralds. The production possibility frontiers below show the two countries' productive capacities for these goods.",
    diagram: {
      kind: "ppf", alt: "Production possibility frontiers for Colombia and Zambia, copper against emeralds",
      xLabel: "Emeralds (kg)", yLabel: "Copper (million tonnes)",
      xMax: 1150, yMax: 580, xTicks: [500, 1000], yTicks: [100, 500],
      curves: [{ from: [0, 500], to: [700, 0], shape: "straight", label: "PPF Zambia", labelAt: [210, 380] },
               { from: [0, 100], to: [1000, 0], shape: "straight", label: "PPF Colombia", labelAt: [760, 78] }],
      points: []
    }
  },

  "p2-june2022-q4": {
    keep: "The trade cycle",
    diagram: {
      kind: "cycle", alt: "The trade cycle, with point Z at a peak above the trend line",
      trend: [[0, 18], [100, 74]],
      actual: [[0, 44], [14, 32], [26, 30], [38, 44], [50, 68], [60, 74], [72, 70], [84, 62], [100, 62]],
      points: [{ x: 60, y: 74, label: "Z", dx: 8, dy: -6 }],
      notes: [{ x: 26, y: 92, text: "Positive output gap", anchor: "middle" }]
    }
  },

  "p2-june2024-q4": {
    keep: "Real GDP Trend GDP growth",
    diagram: {
      kind: "cycle", alt: "The trade cycle, with points A, B, C and D on the actual GDP path",
      yLabel: "Real GDP", trend: [[0, 18], [100, 74]],
      actual: [[0, 44], [14, 30], [26, 27], [34, 28], [46, 46], [58, 72], [66, 78], [78, 74], [90, 66], [100, 64]],
      points: [{ x: 14, y: 30, label: "A" }, { x: 34, y: 28, label: "B" },
               { x: 66, y: 78, label: "C", dy: -9 }, { x: 90, y: 66, label: "D" }]
    }
  },

  "p1-june2017-q1": {
    keep: "The table shows market data for e-cigarette kits. The original equilibrium price is £23.",
    head: ["Price £", "Quantity demanded per month (000)", "Quantity supplied per month (000)",
           "New quantity demanded per month (000)", "New quantity supplied per month (000)"],
    rows: [["25", "5", "9", "", ""],
           ["24", "6", "8", "", ""],
           ["23", "7", "7", "", ""],
           ["22", "8", "6", "", ""],
           ["21", "9", "5", "", ""]],
    note: "The last two columns are blank in the paper — they are for your working.",
    resume: "As a result of a successful advertising campaign"
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
    note: "The last column is blank in the paper — it is for your working.",
    resume: "As a result of an increase in packaging costs"
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
