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

  "p2-specimen-q2": {
    keep: "The chart below shows the annual percentage change in the value of US exports and imports.",
    resume: "Throughout this period, the USA has run a trade deficit.",
    chart: { kind: "bar", exact: false, unit: "%", yLabel: "annual % change",
             caption: "Annual percentage change in the value of US exports and imports, July 2011 to January 2013",
             x: ["Jul 11", "Aug 11", "Sep 11", "Oct 11", "Nov 11", "Dec 11", "Jan 12", "Feb 12", "Mar 12", "Apr 12",
                 "May 12", "Jun 12", "Jul 12", "Aug 12", "Sep 12", "Oct 12", "Nov 12", "Dec 12", "Jan 13"],
             series: [
               { name: "Exports", values: [15.4, 18.5, 18.0, 12.2, 11.3, 7.9, 7.3, 12.4, 6.2, 3.0,
                                           6.2, 8.1, 0.2, 1.4, 0.8, 2.3, 3.5, 3.0, 4.3] },
               { name: "Imports", values: [13.8, 14.2, 13.0, 12.0, 12.4, 10.7, 9.5, 9.7, 6.0, 6.2,
                                           5.0, 0.1, 2.9, -0.5, -1.6, 3.6, 3.2, -3.7, 1.1] }
             ] }
  },

  "p2-specimen-q4": {
    keep: "The chart below shows the price of crude oil from 1 January 2007 to 1 January 2014.",
    chart: { kind: "line", exact: false, yLabel: "US$ per barrel",
             caption: "Crude oil price, 1 January 2007 to 1 January 2014",
             x: ["2007", "", "", "", "2008", "", "", "", "2009", "", "", "", "2010", "", "", "",
                 "2011", "", "", "", "2012", "", "", "", "2013", "", "", "", "2014"],
             series: [{ name: "Crude oil price",
                        values: [60, 64, 72, 88, 100, 128, 140, 60, 42, 60, 68, 74,
                                 78, 76, 74, 86, 90, 113, 88, 95, 100, 105, 85, 92,
                                 95, 94, 105, 98, 98] }] }
  },

  "p2-june2023-q4": {
    keep: "UK consumption, % of GDP, 2004–2021",
    chart: { kind: "line", exact: false, unit: "%", yLabel: "% of GDP",
             caption: "UK consumption as a percentage of GDP, 2004–2021",
             x: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012,
                 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
             series: [{ name: "Consumption",
                        values: [85.0, 84.63, 84.0, 83.63, 84.63, 86.55, 85.8, 85.15, 85.32,
                                 84.85, 84.17, 83.83, 83.8, 83.0, 83.28, 83.05, 83.1, 83.5] }] }
  },

  "p2-specimen-q1": {
    keep: "The chart below shows UK regional unemployment in December 2013, as measured by both the International Labour Organisation (ILO) and the Claimant Count.",
    chart: { kind: "bar", exact: false, yLabel: "thousands of people",
             caption: "UK regional unemployment, December 2013",
             note: "London's ILO bar runs off the top of the paper's scale; it is about 335 thousand.",
             x: ["North East", "North West", "Yorks & Humber", "East Mids", "West Mids",
                 "East of England", "London", "South East", "South West"],
             series: [
               { name: "ILO",            values: [133, 270, 235, 149, 221, 178, 335, 244, 187] },
               { name: "Claimant Count", values: [74, 155, 132, 81, 131, 85, 173, 101, 66] }
             ] }
  },

  "p2-june2022-q2": {
    keep: "Annual percentage change in average UK house prices",
    chart: { kind: "line", exact: false, unit: "%", yLabel: "annual % change",
             caption: "Annual percentage change in average UK house prices, May 2018 to May 2021",
             x: ["May 18", "Aug 18", "Nov 18", "Feb 19", "May 19", "Aug 19", "Nov 19", "Feb 20",
                 "May 20", "Jun 20", "Aug 20", "Nov 20", "Feb 21", "Mar 21", "May 21"],
             series: [{ name: "House price growth",
                        values: [2.4, 2.0, 1.9, 0.4, 0.9, 0.7, 0.8, 2.3,
                                 3.7, 0.1, 5.0, 6.5, 7.2, 5.7, 10.9] }] }
  },

  "p2-june2022-q3": {
    keep: "Bank of England base interest rate, 2016–2020",
    chart: { kind: "line", step: true, exact: true, unit: "%", yLabel: "%",
             caption: "Bank of England base interest rate, 2016–2020",
             note: "The rate is set at a meeting and holds until the next one, so it steps rather than slopes.",
             x: ["2016", "", "", "", "2017", "", "", "", "2018", "", "", "",
                 "2019", "", "", "", "2020", "", "", ""],
             series: [{ name: "Base rate",
                        values: [0.50, 0.50, 0.25, 0.25, 0.25, 0.25, 0.25, 0.50,
                                 0.50, 0.50, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75,
                                 0.10, 0.10, 0.10, 0.10] }] }
  },

  "p2-june2019-q1": {
    keep: "Monthly additions to UK credit card lending, £ billions, 2015 – 2017",
    chart: { kind: "line", exact: false, yLabel: "£ billions",
             caption: "Monthly additions to UK credit card lending, 2015–2017",
             note: "The paper marks two points: January 2016 at 13 000 and March 2017 at 15 000.",
             x: ["Sep 15", "Oct 15", "Nov 15", "Dec 15", "Jan 16", "Feb 16", "Mar 16", "Apr 16",
                 "May 16", "Jun 16", "Jul 16", "Aug 16", "Sep 16", "Oct 16", "Nov 16", "Dec 16",
                 "Jan 17", "Feb 17", "Mar 17", "Apr 17", "May 17", "Jun 17", "Jul 17", "Aug 17", "Sep 17"],
             series: [{ name: "Credit card lending",
                        values: [13900, 13800, 14600, 15050, 13000, 13700, 14300, 13700,
                                 14200, 14600, 14100, 14400, 15050, 14400, 14700, 15200,
                                 14900, 13200, 15000, 13750, 15750, 15200, 15350, 15250, 14500] }] }
  },

  "p2-june2021-q3": {
    keep: "British pound to US dollar exchange rate (value of one pound in dollars), June 2017 to June 2019.",
    chart: { kind: "line", exact: false, yLabel: "US$ per £",
             caption: "British pound to US dollar exchange rate, June 2017 to June 2019",
             note: "The paper marks 1 January 2018 at $1.35 and 1 January 2019 at $1.25, which is what part (a) turns on.",
             x: ["Jun 17", "Aug 17", "Oct 17", "Dec 17", "Jan 18", "Mar 18", "Apr 18", "Jun 18",
                 "Aug 18", "Oct 18", "Dec 18", "Jan 19", "Mar 19", "May 19", "Jun 19"],
             series: [{ name: "$ per £",
                        values: [1.27, 1.30, 1.32, 1.34, 1.35, 1.40, 1.43, 1.33,
                                 1.29, 1.30, 1.27, 1.25, 1.32, 1.28, 1.27] }] }
  },

  "p1-june2024-q5": {
    keep: "The graph below shows the largest mortgage lenders in the United Kingdom (UK) in 2020, by market share.",
    chart: { kind: "hbar", exact: true, unit: "%",
             caption: "Largest UK mortgage lenders in 2020, by market share",
             rows: [["Other", 24.9], ["Lloyds", 19.5], ["Nationwide", 12.7], ["Santander UK", 11.1],
                    ["Natwest", 10.9], ["Barclays", 9.8], ["HSBC", 7.2], ["Virgin Money", 3.9]] }
  },

  "p2-june2017-q1": {
    keep: "The chart below shows the UK unemployment rate, seasonally adjusted, from 2008 to 2015",
    chart: { kind: "line", exact: false, unit: "%", yLabel: "% of all economically active",
             caption: "UK unemployment rate, seasonally adjusted, 2008–2015",
             x: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015],
             series: [{ name: "Unemployment rate",
                        values: [5.2, 7.6, 7.9, 7.9, 8.3, 7.7, 6.5, 5.4] }] }
  },

  "p2-june2017-q3": {
    keep: "The chart below shows UK inflation as measured by the Consumer Prices Index (CPI), 2011 to 2015.",
    chart: { kind: "line", exact: false, unit: "%", yLabel: "annual % change in prices",
             caption: "UK inflation measured by the CPI, September 2011 to 2015",
             x: ["Sep 11", "Jan 12", "Jul 12", "Jan 13", "Jul 13", "Jan 14", "Jul 14", "Jan 15", "Jul 15"],
             series: [
               { name: "CPI",                      values: [5.2, 3.6, 2.6, 2.7, 2.8, 1.9, 1.6, 0.3, 0.0] },
               { name: "Other goods and services", values: [3.9, 3.4, 2.2, 2.3, 2.5, 1.8, 1.9, 0.6, 0.8] },
               { name: "Food and fuel",            values: [1.3, 0.9, 0.4, 0.3, 0.5, 0.1, -0.3, -0.9, -0.7] }
             ] }
  },

  "p2-june2017-q4": {
    keep: "The chart below shows the UK Gini coefficient of incomes, 2007 to 2013.",
    chart: { kind: "line", exact: false, yLabel: "Gini coefficient",
             caption: "UK Gini coefficient of incomes, 2007 to 2013",
             x: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
             series: [{ name: "Gini coefficient",
                        values: [0.360, 0.358, 0.360, 0.340, 0.342, 0.340, 0.345] }] }
  },

  /* ---------- Section A charts ----------
     Each question prints its own chart. Where the paper prints the values
     beside the bars or in a table they are its own; where it only drew a
     line they were read off it, and the chart says so. */

  "p2-june2020-q1": {
    keep: "UK real Gross Domestic Product (GDP), annual percentage change 2014–2017",
    chart: { kind: "bar", exact: true, unit: "%", yLabel: "% change on a year earlier",
             caption: "UK real GDP, annual percentage change 2014–2017",
             x: [2014, 2015, 2016, 2017],
             series: [{ name: "Real GDP growth", values: [2.9, 2.3, 1.8, 1.7] }] }
  },

  "p2-june2023-q2": {
    keep: "UK unemployment rate (%), December 2020 – June 2022",
    chart: { kind: "line", exact: true, unit: "%", yLabel: "% unemployed",
             caption: "UK unemployment rate, December 2020 to June 2022",
             x: ["Dec 20", "Jan 21", "Feb 21", "Mar 21", "Apr 21", "May 21", "Jun 21", "Jul 21",
                 "Aug 21", "Sep 21", "Oct 21", "Nov 21", "Dec 21", "Jan 22", "Feb 22", "Mar 22",
                 "Apr 22", "May 22", "Jun 22"],
             series: [{ name: "Unemployment rate",
                        values: [5.2, 5.1, 5.0, 5.0, 4.9, 4.9, 4.7, 4.6, 4.4, 4.3, 4.2,
                                 4.1, 4.0, 4.0, 3.8, 3.7, 3.8, 3.8, 3.8] }] }
  },

  "p2-june2023-q3": {
    keep: "UK real GDP, 2020–2022",
    head: ["Year", "Annual percentage change on previous year", "Total (£ millions)"],
    rows: [["2020", "−9.9%", "2 045 091"],
           ["2021", "7.5%", "2 198 473"],
           ["2022 (forecast)", "3.5%", ""]],
    note: "The 2022 total is blank in the paper — working it out is part (a)."
  },

  /* Four diagrams as the four answers. The text extraction interleaved all
     four sets of axis labels into one run of words, which is how "Output of
     consumer goods 0 Output of capital goods Option A Y X" ended up inside
     the question; the diagrams carry that content properly instead. */

  "p1-june2019-q2": {
    keep: "The diagrams show movements from position X to Y on production possibility frontiers.",
    diagram: {
      kind: "options",
      items: [
        { letter: "A", kind: "ppf",
          alt: "The frontier shifts inward: X on the outer frontier moves to Y on the inner one",
          xLabel: "Output of capital goods", yLabel: "Output of consumer goods",
          xMax: 118, yMax: 118, xTicks: [], yTicks: [],
          curves: [{ ellipse: [100, 100] }, { ellipse: [74, 74] }],
          points: [{ on: 0, t: 0.55, label: "X", dx: 8, dy: -4 },
                   { on: 1, t: 0.55, label: "Y", dx: -17, dy: 2 }],
          arrow: [0, 1] },
        { letter: "B", kind: "ppf",
          alt: "The frontier shifts outward: X on the inner frontier moves to Y on the outer one",
          xLabel: "Output of capital goods", yLabel: "Output of consumer goods",
          xMax: 118, yMax: 118, xTicks: [], yTicks: [],
          curves: [{ ellipse: [74, 74] }, { ellipse: [100, 100] }],
          points: [{ on: 0, t: 0.55, label: "X", dx: -17, dy: 2 },
                   { on: 1, t: 0.55, label: "Y", dx: 8, dy: -4 }],
          arrow: [0, 1] },
        { letter: "C", kind: "ppf",
          alt: "A movement along one frontier, from X to Y",
          xLabel: "Output of capital goods", yLabel: "Output of consumer goods",
          xMax: 118, yMax: 118, xTicks: [], yTicks: [],
          curves: [{ ellipse: [100, 100] }],
          points: [{ on: 0, t: 0.72, label: "X", dx: 8, dy: 6 },
                   { on: 0, t: 0.34, label: "Y", dx: -17, dy: -4 }],
          arrow: [0, 1] },
        { letter: "D", kind: "ppf",
          alt: "A move from X on the frontier to Y beyond it",
          xLabel: "Output of capital goods", yLabel: "Output of consumer goods",
          xMax: 118, yMax: 118, xTicks: [], yTicks: [],
          curves: [{ ellipse: [100, 100] }],
          points: [{ on: 0, t: 0.55, label: "X", dx: -17, dy: 4 },
                   { on: 0, t: 0.5, scale: 1.22, label: "Y", dx: 8, dy: -4 }],
          arrow: [0, 1] }
      ]
    }
  },

  "p2-june2021-q2": {
    keep: "(a) Which one of the following diagrams illustrates the impact of an increase in net exports along a Keynesian long-run aggregate supply curve?",
    diagram: {
      kind: "options",
      /* Each AD line is solved to pass through the equilibrium marked below
         it, so the dashed guides meet the curves rather than pointing at
         empty space. On the Keynesian curve those are (44, 20) and (56, 34);
         on the vertical classical curve, both are at output 58. */
      items: [
        { letter: "A", kind: "adas", as: "keynesian",
          alt: "Keynesian AS with aggregate demand shifting right: the price level and real output both rise",
          ad: [{ from: [12, 50.4], to: [64, 1.0], label: "AD" },
               { from: [12, 75.8], to: [76, 15], label: "AD1" }],
          points: [{ x: 44, y: 20, py: "P", px: "Y" }, { x: 56, y: 34, py: "P1", px: "Y1" }] },
        { letter: "B", kind: "adas", as: "classical",
          alt: "Classical AS with aggregate demand shifting right: only the price level rises",
          ad: [{ from: [12, 62], to: [78, 10], label: "AD" },
               { from: [24, 91], to: [90, 39], label: "AD1" }],
          points: [{ x: 58, y: 25.8, py: "P", px: "Y" }, { x: 58, y: 54.2, py: "P1", vertical: false }] },
        { letter: "C", kind: "adas", as: "keynesian",
          alt: "Keynesian AS with aggregate demand shifting left: the price level and real output both fall",
          ad: [{ from: [12, 75.8], to: [76, 15], label: "AD" },
               { from: [12, 50.4], to: [64, 1.0], label: "AD1" }],
          points: [{ x: 56, y: 34, py: "P", px: "Y" }, { x: 44, y: 20, py: "P1", px: "Y1" }] },
        { letter: "D", kind: "adas", as: "classical",
          alt: "Classical AS with aggregate demand shifting left: only the price level falls",
          ad: [{ from: [24, 91], to: [90, 39], label: "AD" },
               { from: [12, 62], to: [78, 10], label: "AD1" }],
          points: [{ x: 58, y: 54.2, py: "P", px: "Y" }, { x: 58, y: 25.8, py: "P1", vertical: false }] }
      ]
    }
  },

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
