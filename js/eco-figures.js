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
    { label: "Figure 3", kind: "bar", exact: true,
      caption: "Price of a single off-peak train journey, Edinburgh to Leeds, Saturday 22 December 2018, 19:00",
      yLabel: "£",
      x: ["Adult", "16–25 Railcard"],
      series: [{ name: "Fare", values: [105.30, 69.50] }] }
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
  ]

};
