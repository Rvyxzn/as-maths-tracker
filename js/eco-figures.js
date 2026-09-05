/* ============================================================
   Figure data, per case study

   The papers put their data in charts, and a chart is vector art:
   its axis labels reach the text layer but its plotted line never
   does. That is why the extracted case studies used to say "the
   values are not printed as text" under half their figures.

   `exact: true`   the paper printed these numbers itself, in a
                   table or beside its bars, so they are its own.
   `exact: false`  the paper only drew them. The series was read
                   off the plotted line, so it carries the shape
                   and the scale but not the last decimal. The
                   figure says so, because a number you are about
                   to calculate with should never pretend to a
                   precision it does not have.
   ============================================================ */

const ECO_FIGURES = {

  "p1-june2017": [
    { label: "Figure 1", kind: "bar", exact: true, unit: "%",
      caption: "Market shares by total revenue in the UK supermarket sector, 2010 and 2015",
      yLabel: "share %",
      x: ["Tesco", "Asda", "Sainsbury's", "Morrisons", "Co-op", "Waitrose", "Aldi", "Lidl", "Others"],
      series: [
        { name: "2010", values: [30.8, 17.6, 16.1, 11.6, 7.1, 4.1, 2.8, 2.2, 7.7] },
        { name: "2015", values: [28.6, 16.5, 16.5, 10.9, 6.2, 5.1, 5.5, 4.0, 6.7] }
      ] },
    { label: "Figure 2", kind: "hbar", exact: false, unit: "%",
      caption: "Proportion of food suppliers reporting that the following supermarkets fail to meet the Groceries Code of Conduct, 2015",
      rows: [["Tesco", 31], ["Morrisons", 30], ["Co-op", 25], ["Asda", 15],
             ["Waitrose", 12], ["Lidl", 10.5], ["Sainsbury's", 9], ["Aldi", 6]] }
  ],

  "p1-june2018": [
    { label: "Figure 1", kind: "line", exact: false,
      caption: "UK retail electricity and gas real price indices, 2004–2015",
      note: "Indices: 2010 (base) = 100",
      yLabel: "index",
      x: [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015],
      series: [
        { name: "Gas",         values: [57, 63, 80, 84, 99, 109, 100, 108, 118, 125, 129, 122] },
        { name: "Electricity", values: [69, 74, 88, 92, 103, 106, 100, 109, 115, 119, 120, 119] }
      ] },
    { label: "Figure 2", kind: "bar", exact: true, unit: "%",
      caption: "UK retail electricity and gas supply: market share by company, 2016",
      yLabel: "share %",
      x: ["British Gas", "EON", "SSE", "EDF", "Scottish P.", "nPower", "Other"],
      series: [
        { name: "Electricity", values: [23, 16, 16, 12, 11, 10, 12] },
        { name: "Gas",         values: [36, 13, 13, 8, 9, 9, 12] }
      ] }
  ],

  "p1-june2019": [
    { label: "Figure 1", kind: "bar", exact: false, unit: "",
      caption: "Average annual household bill from the Big Six UK energy suppliers, 2017",
      note: "The market's cheapest annual tariff was about £860.",
      yLabel: "£ per year",
      x: ["British Gas", "SSE", "E.ON", "EDF", "Scottish P.", "nPower"],
      series: [
        { name: "Standard variable tariff", values: [1040, 1120, 1125, 1100, 1160, 1190] },
        { name: "Supplier's cheapest tariff", values: [990, 1025, 950, 1005, 1020, 935] }
      ] },
    { label: "Figure 2", kind: "line", exact: false,
      caption: "The monthly rental cost of a telephone landline",
      note: "Wholesale line rental is the price BT Openreach charges telephone service providers.",
      yLabel: "£ per month",
      x: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
      series: [
        { name: "BT Retail",     values: [13.9, 13.4, 12.9, 13.0, 14.6, 15.6, 16.2, 16.2, 16.4, 18.0, 19.0] },
        { name: "Virgin Media",  values: [13.9, 13.3, 12.6, 12.9, 13.9, 15.0, 16.1, 16.1, 16.2, 17.8, 18.6] },
        { name: "Orange/EE",     values: [13.9, 13.3, 12.2, 12.2, 13.2, 14.4, 15.4, 15.6, 16.2, 17.8, 18.5] },
        { name: "Wholesale line rental", values: [10.4, 10.0, 9.7, 9.4, 9.1, 8.8, 8.4, 8.1, 7.8, 7.4, 7.1] }
      ] }
  ],

  "p1-june2020": [
    { label: "Figure 1", kind: "bar", exact: true,
      caption: "UK government subsidy to Northern, a train operating company in Northern England",
      yLabel: "£ millions",
      x: [2017, 2018],
      series: [{ name: "Subsidy", values: [277.0, 287.9] }] },
    { label: "Figure 2", kind: "line", exact: false,
      caption: "Rail passenger kilometres travelled per year in the UK, billions",
      note: "The paper labels the 2018 figure of 65 billion; the rest are read off the line.",
      yLabel: "billions of passenger km",
      x: [1985, 1990, 1995, 2000, 2005, 2010, 2015, 2018],
      series: [{ name: "Passenger kilometres", values: [30, 33, 29, 38.5, 43, 51, 63, 65] }] },
    { label: "Figure 3", kind: "bar", exact: true, dp: 2,
      caption: "Price of a single off-peak train journey, Edinburgh to Leeds, Saturday 22 December 2018, 19:00",
      yLabel: "£",
      x: ["Adult", "16–25 Railcard"],
      series: [{ name: "Fare", values: [105.30, 69.50] }] }
  ],

  "p1-specimen": [
    { label: "Figure 1", kind: "hbar", exact: true, dp: 2,
      caption: "Cineworld (London) cinema ticket prices after 5pm",
      rows: [["Family of 4", 29.80], ["Adult (19–59)", 9.60],
             ["Student (15–18)", 7.30], ["Senior (60+)", 7.30], ["Child (2–14)", 6.80]] }
  ],

  "p2-specimen": [
    { label: "Figure 1", kind: "table", exact: true,
      caption: "Economic indicators for the five EAC member countries, 2012",
      note: "GDP per capita is left blank for Burundi and Kenya in the paper — working it out is part (a).",
      head: ["", "Burundi", "Kenya", "Rwanda", "Tanzania", "Uganda"],
      rows: [["GDP (US$ bn)", "2.47", "37.23", "7.10", "28.25", "19.80"],
             ["Population (mn)", "16.14", "62.78", "18.21", "58.43", "48.89"],
             ["GDP per capita (US$)", "", "", "390", "483.48", "405"],
             ["GDP per capita PPP (US$)", "483", "1 517", "1 167", "1 380", "1 165"],
             ["HDI", "0.355", "0.519", "0.434", "0.476", "0.456"],
             ["IHDI", "no data", "0.344", "0.287", "0.346", "0.303"]] },
    { label: "Figure 2", kind: "bar", exact: false,
      caption: "Value of EAC exports 1985–2008 (US$ billions)",
      yLabel: "US$ billions",
      x: ["Euro area", "United States", "China", "Developing Asia", "Rest of Africa", "Within EAC"],
      series: [
        { name: "1985", values: [0.66, 0.15, 0.02, 0.13, 0.06, 0.10] },
        { name: "1995", values: [0.93, 0.19, 0.03, 0.29, 0.26, 0.33] },
        { name: "2005", values: [1.25, 0.42, 0.20, 0.57, 0.65, 0.62] },
        { name: "2008", values: [1.85, 0.41, 0.21, 1.00, 1.05, 1.03] }
      ] }
  ],

  "p1-june2021": [
    { label: "Figure 1", kind: "hbar", exact: true, unit: "%",
      caption: "Package holiday market share of the six largest providers, booked by UK residents, 2019",
      rows: [["TUI", 29], ["Jet2", 16], ["Thomas Cook", 13],
             ["Expedia", 8], ["On The Beach", 6], ["BA Holidays", 4]] },
    { label: "Figure 2", kind: "table", exact: true,
      caption: "Jet2 package holiday prices to Sorrento — 2 adults, 7 nights from Monday 25 May 2020",
      note: "Half board, premium double or twin room, return flights from Edinburgh, 22 kg bag allowance, ATOL protected. Prices accessed 22 and 23 September 2019.",
      head: ["", "Before Thomas Cook shut down", "12 hours after"],
      rows: [["Holiday price from", "£1 576", "£1 648"],
             ["Per person price", "£788", "£824"]] }
  ],

  "p1-june2022": [
    { label: "Figure 1", kind: "hbar", exact: true,
      caption: "Branded coffee shops by number of shops in the UK in 2021",
      rows: [["Other chains", 3748], ["Costa", 2681], ["Starbucks", 1025],
             ["Caffè Nero", 648], ["AMT", 50], ["Soho Coffee", 40], ["Coffee Republic", 30]] },
    { label: "Figure 2", kind: "line", exact: true,
      caption: "International coffee price (Arabica bean), US dollars per kilogram, 2020",
      yLabel: "US$ per kg",
      x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      series: [{ name: "Arabica price",
                 values: [3.13, 2.99, 3.27, 3.41, 3.30, 3.12, 3.24, 3.60, 3.67, 3.35, 3.31, 3.48] }] }
  ],

  "p1-june2023": [
    { label: "Figure 1", kind: "bar", exact: true, unit: "%",
      caption: "Market share of UK online streaming services, Q2 2021 to Q2 2022",
      yLabel: "share %",
      x: ["Q2 2021", "Q3 2021", "Q4 2021", "Q1 2022", "Q2 2022"],
      series: [
        { name: "Amazon Prime Video", values: [37.9, 41.1, 45.0, 27.1, 25.9] },
        { name: "Disney+",            values: [16.0, 17.7, 19.3, 14.1, 21.5] },
        { name: "Netflix",            values: [15.0, 10.5, 5.0, 9.4, 4.5] },
        { name: "NOW",                values: [11.3, 11.2, 5.6, 11.0, 11.1] },
        { name: "AppleTV+",           values: [4.0, 5.5, 7.3, 9.2, 9.9] },
        { name: "BritBox",            values: [4.0, 3.0, 5.7, 6.0, 5.9] },
        { name: "Others",             values: [11.8, 11.0, 12.1, 23.2, 21.2] }
      ] },
    { label: "Figure 2", kind: "table", exact: true,
      caption: "UK online streaming services — monthly fees, September 2022",
      head: ["Streaming service provider", "September 2022"],
      rows: [["Netflix premium (4 users / ultra HD)", "£15.99"],
             ["Netflix standard (2 users / HD)", "£10.99"],
             ["Netflix basic (single user / non HD)", "£6.99"],
             ["Amazon Prime Video", "£8.99"],
             ["Amazon Prime Video — student price", "£4.49"],
             ["Disney+", "£7.99"],
             ["AppleTV+", "£4.99"]] }
  ],

  "p2-june2020": [
    { label: "Figure 1", kind: "hbar", exact: true, unit: "%",
      caption: "The Fairtrade scheme in the cocoa industry: how the additional revenue is spent by cocoa farmers",
      rows: [["Farm equipment, training and funding", 45],
             ["Business administration and infrastructure", 44],
             ["Social services for the community", 10],
             ["Other", 1]] },
    { label: "Figure 2", kind: "hbar", exact: true, unit: "%",
      caption: "Ivory Coast exports — relative share of main products (%), 2016",
      rows: [["Cocoa beans & products", 54], ["Other", 23], ["Oil", 11],
             ["Rubber", 7], ["Gold", 5]] }
  ],

  "p2-june2017": [
    { label: "Figure 1", kind: "line", exact: false,
      caption: "Exchange rate of the euro (€) to the British pound (£)",
      note: "The paper plots this daily and labels two points: €1 = £0.95 in early 2009, and £0.75 in 2015. These are annual readings.",
      yLabel: "£ per €",
      x: [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
      series: [{ name: "Price of one euro in pounds",
                 values: [0.68, 0.80, 0.95, 0.86, 0.87, 0.81, 0.85, 0.83, 0.75, 0.76] }] },
    { label: "Figure 2", kind: "line", exact: false, unit: "%",
      caption: "Eurozone inflation rate as measured by the Consumer Prices Index (CPI)",
      yLabel: "annual % change in prices",
      x: [2011, 2012, 2013, 2014, 2015],
      series: [{ name: "CPI inflation", values: [3.08, 2.65, 1.55, 0.55, 0.13] }] }
  ],

  "p2-june2018": [
    { label: "Figure 1", kind: "line", exact: false, unit: "%",
      caption: "Proportion of population in absolute poverty (US$1.90-a-day, 2011 PPP)",
      yLabel: "% of population",
      x: [1990, 1992, 1994, 1996, 1998, 2000, 2002, 2004, 2006, 2008, 2010, 2012],
      series: [
        { name: "Sub-Saharan Africa", values: [55.5, 58, 58.5, 58, 57.5, 57, 55.5, 51.5, 49, 47, 45, 41.5] },
        { name: "East Asia",          values: [61, 53, 46, 39.5, 39, 33.5, 27, 18.5, 15.5, 12, 7.5, 3.5] }
      ] }
  ],

  "p2-june2019": [
    { label: "Figure 1", kind: "line", exact: false,
      caption: "Pound sterling to US$ exchange rate, 2016–17",
      note: "The referendum result took it from about $1.48 to $1.31 within days; the general election was announced in April 2017.",
      yLabel: "US$ per £",
      x: ["Jan 16", "Feb 16", "Mar 16", "Apr 16", "May 16", "Jun 16", "Jul 16", "Aug 16", "Sep 16",
          "Oct 16", "Nov 16", "Dec 16", "Jan 17", "Feb 17", "Mar 17", "Apr 17", "May 17"],
      series: [{ name: "$ per £",
                 values: [1.44, 1.42, 1.43, 1.43, 1.45, 1.44, 1.31, 1.30, 1.32,
                          1.23, 1.24, 1.26, 1.24, 1.25, 1.24, 1.26, 1.29] }] }
  ],

  "p2-june2021": [
    { label: "Figure 1", kind: "line", exact: false,
      caption: "Aid funding received by Rwanda (per capita, US dollars), 2008 to 2018",
      note: "The paper labels the peak of 123 in 2011 and the trough of 83 in 2012; the rest are read off the line.",
      yLabel: "US dollars",
      x: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
      series: [{ name: "Aid per capita",
                 values: [98, 95.5, 103, 123, 83, 100.5, 93.5, 95.5, 99, 103, 91] }] },
    { label: "Figure 2", kind: "line", exact: false,
      caption: "Population of Rwanda (millions), 2008 to 2018",
      yLabel: "millions",
      x: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
      series: [{ name: "Population",
                 values: [9.5, 9.78, 10.03, 10.29, 10.55, 10.8, 11.07, 11.35, 11.65, 11.97, 12.3] }] },
    { label: "Figure 3", kind: "line", exact: false,
      caption: "Rwanda real GDP annual percentage growth rate, 2008 to 2018",
      unit: "%", yLabel: "% growth",
      x: [2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018],
      series: [{ name: "Real GDP growth",
                 values: [11.1, 6.3, 7.4, 8.0, 8.65, 4.75, 6.15, 8.85, 6.0, 6.15, 8.6] }] }
  ],

  "p2-june2022": [
    { label: "Figure 1", kind: "table", exact: true,
      caption: "UK regional gross disposable household income per capita, 2018",
      note: "The paper shows this as a map of the UK shaded by band. The North East is in the lowest band and the South East in the highest.",
      head: ["Band", "£ per capita"],
      rows: [["Highest", "19 000 to 21 000"], ["", "17 000 to 18 999"],
             ["", "16 000 to 16 999"], ["", "15 000 to 15 999"],
             ["", "14 500 to 14 999"], ["", "14 000 to 14 499"],
             ["Lowest", "13 000 to 13 999"]] },
    { label: "Figure 2", kind: "bar", exact: true,
      caption: "UK subjective happiness by income, April 2021",
      note: "“On a scale of 1–10, how happy did you feel yesterday?” (0 = not at all, 10 = completely)",
      yLabel: "score out of 10",
      x: ["Under £10k", "£10k–£20k", "£20k–£40k", "Over £40k"],
      series: [{ name: "Happiness", values: [7.31, 7.02, 7.13, 7.29] }] }
  ],

  "p2-june2023": [
    { label: "Figure 1", kind: "bar", exact: false, unit: "%",
      caption: "Intra- and extra-regional exports as a percentage of total exports, 2020",
      note: "Intra: within a region. Extra: outside a region. Each region's two bars add to 100%.",
      yLabel: "% of total exports",
      x: ["Europe", "Asia", "N. America", "Africa", "Latin Am."],
      series: [
        { name: "Intra-regional", values: [68, 59, 30, 18, 14] },
        { name: "Extra-regional", values: [32, 41, 70, 82, 86] }
      ] }
  ],

  "p2-june2024": [
    { label: "Figure 1", kind: "bar", exact: false, unit: "%",
      caption: "UK national debt, percentage of GDP, 2001–2021",
      yLabel: "% of GDP",
      x: ["01–02", "02–03", "03–04", "04–05", "05–06", "06–07", "07–08", "08–09", "09–10", "10–11",
          "11–12", "12–13", "13–14", "14–15", "15–16", "16–17", "17–18", "18–19", "19–20", "20–21"],
      series: [{ name: "National debt",
                 values: [27, 28, 30, 31.5, 33, 33.5, 34, 48, 62, 69,
                          72.5, 76, 77.5, 78, 80, 81.5, 81, 78.5, 82.5, 94] }] },
    { label: "Figure 2", kind: "bar", exact: false, unit: "%",
      caption: "UK fiscal deficit, percentage of GDP, 2001–2021",
      yLabel: "% of GDP",
      x: ["01–02", "02–03", "03–04", "04–05", "05–06", "06–07", "07–08", "08–09", "09–10", "10–11",
          "11–12", "12–13", "13–14", "14–15", "15–16", "16–17", "17–18", "18–19", "19–20", "20–21"],
      series: [{ name: "Fiscal deficit",
                 values: [0.6, 2.8, 3.3, 3.7, 3.1, 2.6, 2.9, 7.4, 10.1, 8.6,
                          7.2, 7.2, 5.8, 5.1, 4.1, 2.8, 2.5, 2.0, 2.4, 15.0] }] },
    { label: "Figure 3", kind: "line", exact: false, unit: "%",
      caption: "Interest rate on a 10-year UK government bond, July 2022 to March 2023",
      note: "The paper plots this daily. These are monthly readings, keeping the spike above 4.5% that followed the September 2022 mini-budget.",
      yLabel: "%",
      x: ["Jul 22", "Aug 22", "Sep 22", "Oct 22", "Nov 22", "Dec 22", "Jan 23", "Feb 23", "Mar 23"],
      series: [{ name: "10-year gilt yield",
                 values: [2.1, 2.0, 3.1, 4.5, 3.2, 3.3, 3.5, 3.1, 3.5] }] },
    { label: "Figure 4", kind: "table", exact: true,
      caption: "Income tax rates for 2023–24, compared to 2022–23",
      head: ["Tax band", "2022–23 threshold", "Rate", "2023–24 threshold", "Rate"],
      rows: [["Personal allowance", "Up to £12 570", "0%", "Up to £12 570", "0%"],
             ["Basic rate", "£12 571–£50 270", "20%", "£12 571–£50 270", "20%"],
             ["Higher rate", "£50 271–£150 000", "40%", "£50 271–£125 140", "40%"],
             ["Additional rate", "Over £150 000", "45%", "Over £125 140", "45%"]] }
  ]

};
