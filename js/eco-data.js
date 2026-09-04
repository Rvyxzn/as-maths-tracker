/* ============================================================
   Edexcel A level Economics A (9EC0), theme-by-theme database
   ------------------------------------------------------------
   Structured exactly as the specification numbers it, because
   that is how the textbooks, past papers and mark schemes are
   organised, and how teachers refer to it:

     Theme 1  Introduction to markets and market failure
     Theme 2  The UK economy: performance and policies
     Theme 3  Business behaviour and the labour market
     Theme 4  A global perspective

   Each theme splits into numbered topics (1.1, 1.2, ...) and
   each topic into numbered subtopics (1.1.1, 1.1.2, ...).
   Exam-Focus mode works at the topic level (1.1), normal mode at
   the subtopic level (1.1.1).

   ASSESSMENT
   Paper 1  Markets and business behaviour   Themes 1 and 3
   Paper 2  The national and global economy  Themes 2 and 4
   Paper 3  Microeconomics and macroeconomics  all four themes
   Each paper is 2 hours and 100 marks, so the qualification is
   300 marks and every theme carries roughly a quarter of it.

   NO LEARNING RESOURCES YET
   There are no videos or question banks attached. RAG rating,
   the planner, Exam-Focus and past papers all work; add your own
   links and questions per topic as you find them.
   ============================================================ */

const ECO_SPEC = [
{
  id: "eco-t1", paper: "Theme 1", short: "T1",
  name: "Theme 1: Introduction to markets and market failure",
  code: "9EC0/01 and 9EC0/03",
  book: "Microeconomics, assessed on Papers 1 and 3",
  examMinutes: 120, marks: 100,
  flatNumbering: true,
  note: "Theme 1 is microeconomics. It is examined on Paper 1 alongside Theme 3, and can appear on Paper 3.",
  sections: [

    { id: "eco1-1", num: "1.1", name: "Nature of economics",
      desc: "Economics as a social science, positive and normative statements, scarcity, and production possibility frontiers.",
      subs: [
        { id: "eco1-1-1", code: "1.1.1", name: "Economics as a social science", importance: 3, reqs: [
          "Understand that economists use models and simplifying assumptions to explain behaviour",
          "Understand the ceteris paribus assumption and why it is needed",
          "Understand that economics cannot usually use laboratory experiments, so evidence comes from observation" ]},
        { id: "eco1-1-2", code: "1.1.2", name: "Positive and normative economic statements", importance: 4, reqs: [
          "Distinguish a positive statement, which can be tested against evidence, from a normative one, which is a value judgement",
          "Identify normative language such as should, ought and too high",
          "Understand how value judgements influence economic decision making and policy" ]},
        { id: "eco1-1-3", code: "1.1.3", name: "The economic problem", importance: 4, reqs: [
          "Understand scarcity as the central economic problem: unlimited wants against finite resources",
          "Understand the need to make choices, and the renewable and non-renewable distinction",
          "Define and apply opportunity cost to consumers, producers and government" ]},
        { id: "eco1-1-4", code: "1.1.4", name: "Production possibility frontiers", importance: 5, reqs: [
          "Draw and interpret a PPF, showing maximum productive potential",
          "Use a PPF to illustrate opportunity cost, and points inside, on and beyond the curve",
          "Distinguish movements along a PPF from shifts of the whole curve",
          "Distinguish capital goods from consumer goods and explain the growth trade-off" ]},
        { id: "eco1-1-5", code: "1.1.5", name: "Specialisation and the division of labour", importance: 4, reqs: [
          "Understand specialisation and the division of labour, and Adam Smith's account of it",
          "Explain the advantages and disadvantages for firms and for workers",
          "Explain the advantages and disadvantages of specialising in trade",
          "Know the functions of money: medium of exchange, measure of value, store of value, method of deferred payment" ]},
        { id: "eco1-1-6", code: "1.1.6", name: "Free market, mixed and command economies", importance: 4, reqs: [
          "Distinguish free market, command and mixed economies",
          "Understand the role of the state in a mixed economy",
          "Know the arguments of Adam Smith, Friedrich Hayek and Karl Marx",
          "Evaluate the advantages and disadvantages of each system" ]}
      ]},

    { id: "eco1-2", num: "1.2", name: "How markets work",
      desc: "Demand, supply, elasticities, price determination and market mechanisms.",
      subs: [
        { id: "eco1-2-1", code: "1.2.1", name: "Rational decision making", importance: 3, reqs: [
          "Understand the assumption that consumers aim to maximise utility and firms to maximise profit",
          "Understand that this is an assumption, and that behaviour often departs from it" ]},
        { id: "eco1-2-2", code: "1.2.2", name: "Demand", importance: 5, reqs: [
          "Draw and interpret a demand curve and explain why it slopes downwards",
          "Distinguish a movement along the curve from a shift of it",
          "Explain the conditions of demand: population, income, related goods, advertising, tastes, expectations, seasons",
          "Understand diminishing marginal utility and how it underlies the demand curve" ]},
        { id: "eco1-2-3", code: "1.2.3", name: "Price, income and cross elasticities of demand", importance: 5, reqs: [
          "Calculate PED, YED and XED from data, with correct signs",
          "Interpret the numerical value: elastic, inelastic, unitary",
          "Classify goods as normal, inferior, substitute or complementary using the sign",
          "Explain the factors influencing each elasticity",
          "Apply elasticity to firms' pricing decisions and to government taxation" ]},
        { id: "eco1-2-4", code: "1.2.4", name: "Supply", importance: 5, reqs: [
          "Draw and interpret a supply curve and explain why it slopes upwards",
          "Distinguish a movement along the curve from a shift of it",
          "Explain the conditions of supply: costs, productivity, technology, indirect taxes, subsidies, number of firms" ]},
        { id: "eco1-2-5", code: "1.2.5", name: "Elasticity of supply", importance: 4, reqs: [
          "Calculate and interpret price elasticity of supply",
          "Explain the factors influencing PES, including time, spare capacity and stocks",
          "Distinguish the short run from the long run in supply decisions" ]},
        { id: "eco1-2-6", code: "1.2.6", name: "Price determination", importance: 5, reqs: [
          "Explain equilibrium price and quantity, and how excess demand or supply is removed",
          "Use diagrams to show the effect of shifts in demand and supply on price and quantity",
          "Apply the analysis to real markets such as housing, agriculture, commodities and foreign exchange" ]},
        { id: "eco1-2-7", code: "1.2.7", name: "Price mechanism", importance: 4, reqs: [
          "Explain the rationing, incentive and signalling functions of price",
          "Apply the price mechanism in local, national and global contexts" ]},
        { id: "eco1-2-8", code: "1.2.8", name: "Consumer and producer surplus", importance: 4, reqs: [
          "Identify consumer and producer surplus on a demand and supply diagram",
          "Explain how shifts in demand or supply change each surplus" ]},
        { id: "eco1-2-9", code: "1.2.9", name: "Indirect taxes and subsidies", importance: 5, reqs: [
          "Show the effect of an indirect tax and of a subsidy on a diagram",
          "Distinguish specific from ad valorem taxes and their different diagram shapes",
          "Analyse the incidence of a tax on consumers and producers, and link it to elasticity",
          "Calculate tax revenue, consumer and producer burden, and subsidy cost from a diagram" ]},
        { id: "eco1-2-10", code: "1.2.10", name: "Alternative views of consumer behaviour", importance: 3, reqs: [
          "Explain why consumers may not behave rationally: habit, inertia, weakness at computation",
          "Understand the influence of other people's behaviour on choices" ]}
      ]},

    { id: "eco1-3", num: "1.3", name: "Market failure",
      desc: "Externalities, public goods and information gaps as reasons markets misallocate resources.",
      subs: [
        { id: "eco1-3-1", code: "1.3.1", name: "Types of market failure", importance: 4, reqs: [
          "Understand market failure as a misallocation of resources",
          "Distinguish externalities, under-provision of public goods and information gaps",
          "Understand complete market failure and partial market failure" ]},
        { id: "eco1-3-2", code: "1.3.2", name: "Externalities", importance: 5, reqs: [
          "Distinguish private, external and social costs and benefits",
          "Draw and interpret diagrams for negative externalities in production and positive externalities in consumption",
          "Identify the welfare loss area and explain what it represents",
          "Explain over-production and under-consumption relative to the social optimum",
          "Distinguish merit and demerit goods" ]},
        { id: "eco1-3-3", code: "1.3.3", name: "Public goods", importance: 4, reqs: [
          "Define public goods by non-rivalry and non-excludability",
          "Explain the free rider problem and why it leads to under-provision or none at all",
          "Distinguish public, private and quasi-public goods",
          "Explain how technology can turn a public good into a private one" ]},
        { id: "eco1-3-4", code: "1.3.4", name: "Information gaps", importance: 4, reqs: [
          "Explain symmetric and asymmetric information",
          "Explain how imperfect information causes a misallocation of resources",
          "Apply to examples such as pensions, insurance, healthcare and second-hand cars" ]}
      ]},

    { id: "eco1-4", num: "1.4", name: "Government intervention",
      desc: "Correcting market failure, and the ways intervention itself can fail.",
      subs: [
        { id: "eco1-4-1", code: "1.4.1", name: "Government intervention in markets", importance: 5, reqs: [
          "Analyse indirect taxation, subsidies, maximum and minimum prices using diagrams",
          "Explain tradable pollution permits, provision of public goods and information provision",
          "Explain regulation and its enforcement",
          "Evaluate each intervention, including its cost and unintended consequences" ]},
        { id: "eco1-4-2", code: "1.4.2", name: "Government failure", importance: 5, reqs: [
          "Define government failure as intervention causing a net welfare loss",
          "Explain distortion of price signals, unintended consequences, excessive administrative costs and information gaps",
          "Apply to real examples of government failure in markets" ]}
      ]}
  ]
},
{
  id: "eco-t2", paper: "Theme 2", short: "T2",
  name: "Theme 2: The UK economy, performance and policies",
  code: "9EC0/02 and 9EC0/03",
  book: "Macroeconomics, assessed on Papers 2 and 3",
  examMinutes: 120, marks: 100,
  flatNumbering: true,
  note: "Theme 2 is macroeconomics. It is examined on Paper 2 alongside Theme 4, and can appear on Paper 3.",
  sections: [

    { id: "eco2-1", num: "2.1", name: "Measures of economic performance",
      desc: "Growth, inflation, employment and the balance of payments, and how each is measured.",
      subs: [
        { id: "eco2-1-1", code: "2.1.1", name: "Economic growth", importance: 5, reqs: [
          "Distinguish real from nominal GDP, and total from per capita",
          "Distinguish volume from value, and understand GDP against GNI and GNP",
          "Compare rates of growth between countries and over time, using purchasing power parity",
          "Understand the limitations of using GDP to compare living standards",
          "Understand national happiness and the factors influencing subjective wellbeing" ]},
        { id: "eco2-1-2", code: "2.1.2", name: "Inflation", importance: 5, reqs: [
          "Define inflation, deflation and disinflation",
          "Explain how the CPI is calculated, including the basket of goods and weights",
          "Explain the limitations of CPI, and how RPI differs",
          "Explain the causes of inflation: demand pull, cost push and growth of the money supply",
          "Explain the effects of inflation on consumers, firms, government and workers" ]},
        { id: "eco2-1-3", code: "2.1.3", name: "Employment and unemployment", importance: 5, reqs: [
          "Understand the claimant count and the Labour Force Survey measures",
          "Distinguish unemployment, underemployment and inactivity",
          "Explain the causes: structural, frictional, seasonal, demand deficient and real wage inflexibility",
          "Explain the significance of migration and skills for employment",
          "Explain the effects of unemployment on consumers, firms, government and society" ]},
        { id: "eco2-1-4", code: "2.1.4", name: "Balance of payments", importance: 4, reqs: [
          "Understand the components of the current account",
          "Understand the meaning of a current account deficit and surplus",
          "Explain how economies are interconnected through global trade and capital flows" ]}
      ]},

    { id: "eco2-2", num: "2.2", name: "Aggregate demand",
      desc: "The components of aggregate demand and what shifts each one.",
      subs: [
        { id: "eco2-2-1", code: "2.2.1", name: "The characteristics of aggregate demand", importance: 5, reqs: [
          "Know AD = C + I + G + (X − M) and the relative size of each component in the UK",
          "Draw the AD curve and explain why it slopes downwards",
          "Distinguish movements along AD from shifts of it" ]},
        { id: "eco2-2-2", code: "2.2.2", name: "Consumption (C)", importance: 4, reqs: [
          "Explain the influences on consumer spending: disposable income, saving, interest rates, confidence, wealth effects",
          "Understand the marginal propensity to consume" ]},
        { id: "eco2-2-3", code: "2.2.3", name: "Investment (I)", importance: 4, reqs: [
          "Distinguish gross from net investment",
          "Explain the influences on investment: rate of economic growth, business expectations and confidence, demand for exports, interest rates, access to credit, influence of government, retained profit, technological change, costs" ]},
        { id: "eco2-2-4", code: "2.2.4", name: "Government expenditure (G)", importance: 3, reqs: [
          "Explain the influences on government spending: the trade cycle, fiscal policy, age distribution of the population" ]},
        { id: "eco2-2-5", code: "2.2.5", name: "Net trade (X − M)", importance: 4, reqs: [
          "Explain the influences on net trade: real income, exchange rates, state of the world economy, degree of protectionism, non-price factors" ]}
      ]},

    { id: "eco2-3", num: "2.3", name: "Aggregate supply",
      desc: "Short run and long run aggregate supply, and the Keynesian and classical views.",
      subs: [
        { id: "eco2-3-1", code: "2.3.1", name: "The characteristics of aggregate supply", importance: 4, reqs: [
          "Draw the AS curve and distinguish the short run from the long run",
          "Distinguish movements along AS from shifts of it" ]},
        { id: "eco2-3-2", code: "2.3.2", name: "Short run AS", importance: 4, reqs: [
          "Explain the factors influencing SRAS: changes in costs of raw materials and energy, exchange rates, tax rates" ]},
        { id: "eco2-3-3", code: "2.3.3", name: "Long run AS", importance: 5, reqs: [
          "Distinguish the classical vertical LRAS from the Keynesian LRAS curve",
          "Explain the factors influencing LRAS: technological advances, changes in relative productivity, education and skills, government regulation, demographic change and migration, competition policy" ]}
      ]},

    { id: "eco2-4", num: "2.4", name: "National income",
      desc: "The circular flow, injections and withdrawals, the multiplier and equilibrium.",
      subs: [
        { id: "eco2-4-1", code: "2.4.1", name: "National income", importance: 3, reqs: [
          "Explain the circular flow of income",
          "Distinguish income from wealth" ]},
        { id: "eco2-4-2", code: "2.4.2", name: "Injections and withdrawals", importance: 4, reqs: [
          "Identify injections as investment, government spending and exports",
          "Identify withdrawals as saving, taxation and imports" ]},
        { id: "eco2-4-3", code: "2.4.3", name: "Equilibrium levels of real national output", importance: 4, reqs: [
          "Use AD and AS diagrams to show equilibrium real output and the price level",
          "Analyse the effect of shifts in AD and AS on national output" ]},
        { id: "eco2-4-4", code: "2.4.4", name: "The multiplier", importance: 5, reqs: [
          "Explain the multiplier ratio and calculate it from MPC or from MPS, MPT and MPM",
          "Use the multiplier to analyse the effect of an injection on AD and national income",
          "Explain the significance of the multiplier for shifts in AD" ]}
      ]},

    { id: "eco2-5", num: "2.5", name: "Economic growth",
      desc: "Causes of growth, output gaps, the trade cycle, and the impact of growth.",
      subs: [
        { id: "eco2-5-1", code: "2.5.1", name: "Causes of growth", importance: 4, reqs: [
          "Distinguish actual from potential growth, using AD/AS and PPF diagrams",
          "Explain export-led growth and the importance of international trade",
          "Explain the factors causing growth in the short run and the long run" ]},
        { id: "eco2-5-2", code: "2.5.2", name: "Output gaps", importance: 4, reqs: [
          "Identify negative and positive output gaps on a diagram",
          "Explain the difficulty of measuring output gaps in practice" ]},
        { id: "eco2-5-3", code: "2.5.3", name: "Trade or business cycle", importance: 4, reqs: [
          "Identify the phases: boom, downturn, recession, recovery",
          "Explain the characteristics of each phase for output, employment and inflation" ]},
        { id: "eco2-5-4", code: "2.5.4", name: "The impact of economic growth", importance: 4, reqs: [
          "Explain the benefits and costs of growth for consumers, firms, government and the environment",
          "Evaluate whether growth improves living standards, including sustainability" ]}
      ]},

    { id: "eco2-6", num: "2.6", name: "Macroeconomic objectives and policies",
      desc: "Fiscal, monetary and supply-side policy, and the conflicts between objectives.",
      subs: [
        { id: "eco2-6-1", code: "2.6.1", name: "Possible macroeconomic objectives", importance: 4, reqs: [
          "Know the objectives: growth, low unemployment, low and stable inflation, balance of payments equilibrium, balanced budget, protection of the environment, income equality" ]},
        { id: "eco2-6-2", code: "2.6.2", name: "Demand-side policies", importance: 5, reqs: [
          "Distinguish monetary from fiscal policy and identify the instruments of each",
          "Explain the role of the Bank of England and the MPC, and quantitative easing",
          "Use AD/AS diagrams to show the effect of expansionary and contractionary policy",
          "Evaluate the strengths and weaknesses of demand-side policies, including time lags" ]},
        { id: "eco2-6-3", code: "2.6.3", name: "Supply-side policies", importance: 5, reqs: [
          "Distinguish market-based from interventionist supply-side policies",
          "Explain policies to increase incentives, promote competition, reform the labour market, improve skills and infrastructure",
          "Use diagrams to show the effect on LRAS",
          "Evaluate the strengths and weaknesses, including cost and time lags" ]},
        { id: "eco2-6-4", code: "2.6.4", name: "Conflicts and trade-offs", importance: 5, reqs: [
          "Explain the conflicts between objectives, including growth against inflation and unemployment against inflation",
          "Understand the short run Phillips curve trade-off",
          "Explain the conflict between economic growth and the environment, and between growth and the current account" ]}
      ]}
  ]
},
{
  id: "eco-t3", paper: "Theme 3", short: "T3",
  name: "Theme 3: Business behaviour and the labour market",
  code: "9EC0/01 and 9EC0/03",
  book: "Microeconomics, assessed on Papers 1 and 3",
  examMinutes: 120, marks: 100,
  flatNumbering: true,
  note: "Theme 3 is microeconomics. It is examined on Paper 1 alongside Theme 1, and can appear on Paper 3.",
  sections: [

    { id: "eco3-1", num: "3.1", name: "Business growth",
      desc: "Why firms grow, how they grow, and why some choose to stay small.",
      subs: [
        { id: "eco3-1-1", code: "3.1.1", name: "Sizes and types of firms", importance: 4, reqs: [
          "Explain why some firms remain small and others grow",
          "Distinguish the public sector from the private sector, and profit from not-for-profit organisations" ]},
        { id: "eco3-1-2", code: "3.1.2", name: "Business growth", importance: 4, reqs: [
          "Distinguish organic from inorganic growth",
          "Explain horizontal, vertical and conglomerate integration",
          "Explain the constraints on business growth: size of the market, access to finance, owner objectives, regulation" ]},
        { id: "eco3-1-3", code: "3.1.3", name: "Demergers", importance: 3, reqs: [
          "Explain the reasons for demergers: lack of synergies, value of the parts, focused companies",
          "Explain the impact of demergers on businesses, workers and consumers" ]}
      ]},

    { id: "eco3-2", num: "3.2", name: "Business objectives",
      desc: "Profit maximisation and the alternatives firms actually pursue.",
      subs: [
        { id: "eco3-2-1", code: "3.2.1", name: "Business objectives", importance: 5, reqs: [
          "Explain profit maximisation at MC = MR, and show it on a diagram",
          "Explain revenue maximisation, sales maximisation, satisficing and survival",
          "Explain the divorce of ownership from control and the principal-agent problem" ]}
      ]},

    { id: "eco3-3", num: "3.3", name: "Revenues, costs and profits",
      desc: "The cost and revenue curves that everything in Theme 3 is built on.",
      subs: [
        { id: "eco3-3-1", code: "3.3.1", name: "Revenue", importance: 5, reqs: [
          "Calculate total, average and marginal revenue",
          "Explain the relationship between AR, MR and price elasticity of demand",
          "Draw revenue curves for a price taker and for a price maker" ]},
        { id: "eco3-3-2", code: "3.3.2", name: "Costs", importance: 5, reqs: [
          "Distinguish fixed from variable costs, and the short run from the long run",
          "Calculate total, average and marginal cost",
          "Explain the law of diminishing marginal productivity and its effect on cost curves",
          "Draw and explain short run and long run average cost curves" ]},
        { id: "eco3-3-3", code: "3.3.3", name: "Economies and diseconomies of scale", importance: 5, reqs: [
          "Explain internal economies: technical, managerial, financial, marketing, purchasing, risk bearing",
          "Explain external economies of scale",
          "Explain diseconomies of scale and the minimum efficient scale",
          "Show economies of scale on a long run average cost curve" ]},
        { id: "eco3-3-4", code: "3.3.4", name: "Normal profits, supernormal profits and losses", importance: 5, reqs: [
          "Distinguish normal from supernormal profit",
          "Identify profit and loss areas on a cost and revenue diagram",
          "Explain the short run and long run shutdown points" ]}
      ]},

    { id: "eco3-4", num: "3.4", name: "Market structures",
      desc: "Perfect competition through to monopoly, and how firms behave in each.",
      subs: [
        { id: "eco3-4-1", code: "3.4.1", name: "Efficiency", importance: 5, reqs: [
          "Define allocative, productive, dynamic and X-inefficiency",
          "Identify each on a diagram and explain the conditions for it" ]},
        { id: "eco3-4-2", code: "3.4.2", name: "Perfect competition", importance: 5, reqs: [
          "State the characteristics of perfect competition",
          "Draw short run and long run equilibrium diagrams for the firm and the industry",
          "Explain why supernormal profit is competed away in the long run" ]},
        { id: "eco3-4-3", code: "3.4.3", name: "Monopolistic competition", importance: 4, reqs: [
          "State the characteristics of monopolistic competition",
          "Draw short run and long run equilibrium diagrams and compare with perfect competition" ]},
        { id: "eco3-4-4", code: "3.4.4", name: "Oligopoly", importance: 5, reqs: [
          "State the characteristics of oligopoly and calculate concentration ratios",
          "Distinguish collusive from non-collusive behaviour, and overt from tacit collusion",
          "Explain the kinked demand curve model and price rigidity",
          "Apply game theory and the prisoner's dilemma to interdependent firms",
          "Distinguish price competition from non-price competition" ]},
        { id: "eco3-4-5", code: "3.4.5", name: "Monopoly", importance: 5, reqs: [
          "State the characteristics of monopoly and draw the equilibrium diagram",
          "Explain the costs and benefits of monopoly for firms, consumers, employees and suppliers",
          "Explain third degree price discrimination, its conditions and its diagram",
          "Explain natural monopoly and why it is regulated" ]},
        { id: "eco3-4-6", code: "3.4.6", name: "Monopsony", importance: 4, reqs: [
          "State the characteristics of monopsony",
          "Explain the costs and benefits of monopsony for firms, consumers, employees and suppliers" ]},
        { id: "eco3-4-7", code: "3.4.7", name: "Contestability", importance: 4, reqs: [
          "State the characteristics of a contestable market",
          "Explain sunk costs, barriers to entry and exit, and hit and run competition",
          "Explain the implications of contestability for the behaviour of firms" ]}
      ]},

    { id: "eco3-5", num: "3.5", name: "Labour market",
      desc: "Demand and supply of labour, wage determination and market failure in labour markets.",
      subs: [
        { id: "eco3-5-1", code: "3.5.1", name: "Demand for labour", importance: 4, reqs: [
          "Understand labour demand as a derived demand",
          "Explain the factors influencing demand for labour and its elasticity" ]},
        { id: "eco3-5-2", code: "3.5.2", name: "Supply of labour", importance: 4, reqs: [
          "Explain the factors influencing supply of labour to a particular occupation and its elasticity" ]},
        { id: "eco3-5-3", code: "3.5.3", name: "Wage determination", importance: 5, reqs: [
          "Explain wage determination in a competitive labour market using a diagram",
          "Explain current labour market issues: skills shortages, young workers, migration, wage differentials",
          "Analyse monopsony employers, trade unions and the national minimum wage using diagrams",
          "Explain how government intervention affects wages and employment" ]},
        { id: "eco3-5-4", code: "3.5.4", name: "Labour market issues", importance: 4, reqs: [
          "Explain the significance of discrimination in the labour market",
          "Analyse the impact of discrimination on wages, employment and profit using diagrams" ]}
      ]},

    { id: "eco3-6", num: "3.6", name: "Government intervention",
      desc: "Competition policy and the regulation of markets.",
      subs: [
        { id: "eco3-6-1", code: "3.6.1", name: "Government intervention", importance: 5, reqs: [
          "Explain competition policy, and policy to protect suppliers and employees",
          "Explain the control of mergers, monopolies, prices and quality of service",
          "Explain performance targets, promoting small business, deregulation and privatisation",
          "Evaluate the impact of intervention on prices, profit, efficiency, quality and choice" ]},
        { id: "eco3-6-2", code: "3.6.2", name: "Impact of government intervention", importance: 4, reqs: [
          "Explain the limits of government intervention, including regulatory capture and asymmetric information",
          "Evaluate whether intervention improves outcomes in a given market" ]}
      ]}
  ]
},
{
  id: "eco-t4", paper: "Theme 4", short: "T4",
  name: "Theme 4: A global perspective",
  code: "9EC0/02 and 9EC0/03",
  book: "Macroeconomics, assessed on Papers 2 and 3",
  examMinutes: 120, marks: 100,
  flatNumbering: true,
  note: "Theme 4 is macroeconomics. It is examined on Paper 2 alongside Theme 2, and can appear on Paper 3.",
  sections: [

    { id: "eco4-1", num: "4.1", name: "International economics",
      desc: "Globalisation, trade, exchange rates, competitiveness and the balance of payments.",
      subs: [
        { id: "eco4-1-1", code: "4.1.1", name: "Globalisation", importance: 4, reqs: [
          "Define globalisation and explain its characteristics",
          "Explain the factors contributing to globalisation in the last fifty years",
          "Evaluate the impact of globalisation on countries, governments, firms, workers, consumers and the environment" ]},
        { id: "eco4-1-2", code: "4.1.2", name: "Specialisation and trade", importance: 5, reqs: [
          "Explain absolute and comparative advantage, and calculate them from data",
          "Draw and interpret a comparative advantage numerical example",
          "Explain the assumptions and limitations of the theory",
          "Explain the advantages and disadvantages of specialisation and trade",
          "Explain the pattern of trade and the factors influencing it" ]},
        { id: "eco4-1-3", code: "4.1.3", name: "Terms of trade", importance: 3, reqs: [
          "Calculate the terms of trade from index numbers",
          "Explain the factors influencing a country's terms of trade and the impact of changes" ]},
        { id: "eco4-1-4", code: "4.1.4", name: "Trading blocs and the WTO", importance: 4, reqs: [
          "Distinguish free trade areas, customs unions, common markets and monetary unions",
          "Explain trade creation and trade diversion",
          "Explain the costs and benefits of regional trade agreements and the role of the WTO" ]},
        { id: "eco4-1-5", code: "4.1.5", name: "Restrictions on free trade", importance: 5, reqs: [
          "Explain the reasons for protectionism, including infant industry and dumping",
          "Analyse tariffs, quotas, subsidies to domestic producers and non-tariff barriers using diagrams",
          "Evaluate the impact of protectionism on consumers, producers, government, living standards and equality" ]},
        { id: "eco4-1-6", code: "4.1.6", name: "Balance of payments", importance: 4, reqs: [
          "Explain the components of the balance of payments, including the financial and capital accounts",
          "Explain the causes of deficits and surpluses on the current account",
          "Explain the measures to reduce a deficit, and the interconnectedness of economies" ]},
        { id: "eco4-1-7", code: "4.1.7", name: "Exchange rates", importance: 5, reqs: [
          "Distinguish floating, fixed and managed exchange rate systems",
          "Explain the factors influencing floating exchange rates",
          "Explain devaluation and revaluation, depreciation and appreciation",
          "Analyse the effects of changes in exchange rates on the current account, growth and inflation",
          "Apply the Marshall-Lerner condition and the J-curve effect" ]},
        { id: "eco4-1-8", code: "4.1.8", name: "International competitiveness", importance: 4, reqs: [
          "Explain the measures of international competitiveness, including relative unit labour costs",
          "Explain the factors influencing competitiveness and the significance of being uncompetitive" ]}
      ]},

    { id: "eco4-2", num: "4.2", name: "Poverty and inequality",
      desc: "Absolute and relative poverty, and how income and wealth inequality are measured.",
      subs: [
        { id: "eco4-2-1", code: "4.2.1", name: "Absolute and relative poverty", importance: 4, reqs: [
          "Distinguish absolute from relative poverty",
          "Explain the causes of changes in absolute and relative poverty" ]},
        { id: "eco4-2-2", code: "4.2.2", name: "Inequality", importance: 5, reqs: [
          "Distinguish wealth from income inequality",
          "Draw and interpret a Lorenz curve and calculate the Gini coefficient",
          "Explain the causes of income and wealth inequality within and between countries",
          "Explain the impact of economic change and development on inequality",
          "Understand the significance of capitalism for inequality" ]}
      ]},

    { id: "eco4-3", num: "4.3", name: "Emerging and developing economies",
      desc: "Measuring development, the barriers to it, and the strategies used to promote it.",
      subs: [
        { id: "eco4-3-1", code: "4.3.1", name: "Measures of development", importance: 4, reqs: [
          "Explain the Human Development Index and its components",
          "Explain the advantages and limitations of HDI",
          "Explain other indicators of development, both economic and non-economic" ]},
        { id: "eco4-3-2", code: "4.3.2", name: "Factors influencing growth and development", importance: 5, reqs: [
          "Explain economic factors: primary product dependency, volatility of commodity prices, savings gap and the Harrod-Domar model, foreign currency gap, capital flight, demographics, debt, access to credit, infrastructure, education and skills, absence of property rights",
          "Explain non-economic factors, including corruption, institutions, political instability, war and disease" ]},
        { id: "eco4-3-3", code: "4.3.3", name: "Strategies influencing growth and development", importance: 5, reqs: [
          "Explain market-oriented strategies: trade liberalisation, promotion of FDI, removal of subsidies, floating exchange rates, microfinance, privatisation",
          "Explain interventionist strategies: development of human capital, protectionism, managed exchange rates, infrastructure development, promoting joint ventures, buffer stock schemes",
          "Explain other strategies: industrialisation and the Lewis model, development of tourism and primary industries, fairtrade schemes, aid, debt relief",
          "Evaluate the effectiveness of each strategy in context" ]}
      ]},

    { id: "eco4-4", num: "4.4", name: "The financial sector",
      desc: "The role of financial markets, market failure in the financial sector, and how banks are regulated.",
      subs: [
        { id: "eco4-4-1", code: "4.4.1", name: "Role of financial markets", importance: 4, reqs: [
          "Explain the roles: facilitating saving, lending to businesses and individuals, allowing exchange of goods and services",
          "Explain the provision of forward markets and a market for equities",
          "Distinguish the money market, capital market and foreign exchange market" ]},
        { id: "eco4-4-2", code: "4.4.2", name: "Market failure in the financial sector", importance: 5, reqs: [
          "Explain asymmetric information, externalities and moral hazard in financial markets",
          "Explain speculation and market bubbles, and how they burst",
          "Explain market rigging and its consequences",
          "Apply these to the 2008 financial crisis" ]},
        { id: "eco4-4-3", code: "4.4.3", name: "Role of central banks", importance: 4, reqs: [
          "Explain the implementation of monetary policy",
          "Explain the banker to the government role and the banker to the banks role, including lender of last resort",
          "Explain the regulation of the banking industry" ]}
      ]},

    { id: "eco4-5", num: "4.5", name: "Role of the state in the macroeconomy",
      desc: "Public expenditure, taxation, public sector finances and macroeconomic policies in a global context.",
      subs: [
        { id: "eco4-5-1", code: "4.5.1", name: "Public expenditure", importance: 4, reqs: [
          "Distinguish capital expenditure, current expenditure and transfer payments",
          "Explain the reasons for changing size and composition of public expenditure over time",
          "Explain the significance of the size of public expenditure as a proportion of GDP, including productivity, growth, crowding out, equality and living standards" ]},
        { id: "eco4-5-2", code: "4.5.2", name: "Taxation", importance: 5, reqs: [
          "Distinguish progressive, proportional and regressive taxes",
          "Explain the economic effects of changes in direct and indirect tax rates on incentives, income distribution, output, employment, price level and the trade balance",
          "Draw and interpret the Laffer curve" ]},
        { id: "eco4-5-3", code: "4.5.3", name: "Public sector finances", importance: 4, reqs: [
          "Distinguish automatic stabilisers from discretionary fiscal policy",
          "Distinguish a structural from a cyclical deficit",
          "Explain the difference between a deficit and the national debt",
          "Explain the factors influencing the size of fiscal deficits and national debt, and the significance of their size" ]},
        { id: "eco4-5-4", code: "4.5.4", name: "Macroeconomic policies in a global context", importance: 5, reqs: [
          "Explain the use of fiscal, monetary, supply-side, exchange rate and direct controls to respond to external shocks",
          "Explain measures to reduce fiscal deficits, poverty and inequality",
          "Explain policies to promote growth and development in developing economies",
          "Explain the problems facing policymakers: inaccurate information, risks and uncertainties, inability to control external shocks" ]}
      ]}
  ]
},
{
  id: "eco-skills", paper: "Skills", short: "Skills",
  name: "Exam skills and quantitative methods",
  code: "9EC0 all papers",
  book: "Assessed across every paper",
  examMinutes: 0, marks: 0,
  flatNumbering: true,
  note: "Not a content theme. These are the skills the mark schemes reward, and quantitative skills are worth a minimum of 20% of the total marks.",
  sections: [

    { id: "eco5-1", num: "5.1", name: "Essay and data response technique",
      desc: "The structures the mark scheme rewards, and where marks are actually lost.",
      subs: [
        { id: "eco5-1-1", code: "5.1.1", name: "Command words and mark allocation", importance: 5, reqs: [
          "Know what each command word demands: identify, calculate, explain, analyse, assess, evaluate, discuss, to what extent",
          "Match the depth of the answer to the marks available",
          "Know the KAA and evaluation split for each question type" ]},
        { id: "eco5-1-2", code: "5.1.2", name: "Chains of analysis", importance: 5, reqs: [
          "Build a logical chain of reasoning rather than a list of points",
          "Link each step explicitly, so cause and effect is stated not implied",
          "Support analysis with a labelled and correctly explained diagram" ]},
        { id: "eco5-1-3", code: "5.1.3", name: "Evaluation", importance: 5, reqs: [
          "Evaluate using magnitude, time frame, elasticity, assumptions and the counterfactual",
          "Reach a supported judgement rather than listing both sides",
          "Explain what the judgement depends on" ]},
        { id: "eco5-1-4", code: "5.1.4", name: "Using data and extracts", importance: 4, reqs: [
          "Quote and manipulate data from the extract rather than describing it",
          "Reference the extract explicitly where the mark scheme expects application",
          "Apply theory to the specific context given rather than in general" ]},
        { id: "eco5-1-5", code: "5.1.5", name: "Diagrams", importance: 5, reqs: [
          "Draw the standard diagrams accurately with both axes and all curves labelled",
          "Show the shift or movement with arrows and label the new equilibrium",
          "Explain the diagram in the text; an unexplained diagram earns little" ]}
      ]},

    { id: "eco5-2", num: "5.2", name: "Quantitative skills",
      desc: "The calculations that carry at least a fifth of the marks across the qualification.",
      subs: [
        { id: "eco5-2-1", code: "5.2.1", name: "Calculations and interpretation", importance: 5, reqs: [
          "Calculate percentage change, percentage points and index numbers",
          "Calculate elasticities and interpret their sign and magnitude",
          "Calculate the multiplier, marginal propensities and real values from nominal",
          "Interpret the Gini coefficient and construct a Lorenz curve",
          "Read and interpret graphs, charts and tables accurately",
          "Distinguish correlation from causation when using data" ]}
      ]}
  ]
}
];

/* Exam-Focus data for Economics, keyed by topic (1.1, 1.2, ...).
   Weights are an editorial ordering built from the assessment structure and
   the recurring question patterns, not a measured frequency, exactly as with
   Maths. The app says so wherever they are shown. */
const ECO_EXAM_FOCUS = {
  "eco1-1": { weight: 3,
    marks: "Usually short answers early in the paper, 2 to 8 marks",
    summary: "The opening theory. Cheap marks if you are precise with definitions, and PPF diagrams recur throughout the course.",
    core: ["Positive against normative statements", "Opportunity cost applied to a real decision", "PPF diagrams: movements, shifts, capital against consumer goods", "Division of labour, advantages and disadvantages"],
    traps: ["Describing a PPF shift as a movement along it", "Defining opportunity cost as 'the cost' rather than the next best alternative forgone"] },
  "eco1-2": { weight: 5,
    marks: "The largest topic in Theme 1, frequently 15 to 25 marks across a paper",
    summary: "The engine of the whole course. Supply and demand, elasticity and tax incidence come back in every theme, so weakness here is expensive everywhere.",
    core: ["Demand and supply diagrams, shifts against movements", "PED, YED, XED: calculate, sign, interpret", "Tax and subsidy incidence linked to elasticity", "Consumer and producer surplus areas", "The three functions of the price mechanism"],
    traps: ["Shifting the wrong curve for a change in price of a related good", "Dropping the minus sign on PED and then misclassifying the good", "Labelling axes with quantity and price the wrong way round"] },
  "eco1-3": { weight: 5,
    marks: "Typically 10 to 20 marks, and a very common essay",
    summary: "Externality diagrams with the welfare loss triangle are among the most reliably examined items in the whole specification.",
    core: ["Private, external and social costs and benefits", "Negative production and positive consumption externality diagrams", "Identifying and explaining the welfare loss area", "Public goods: non-rival, non-excludable, free rider problem", "Asymmetric information"],
    traps: ["Drawing MSC below MPC for a negative externality", "Not identifying the welfare loss triangle when the question asks for it", "Confusing a public good with a merit good"] },
  "eco1-4": { weight: 5,
    marks: "Typically 12 to 25 marks, often the Theme 1 essay",
    summary: "Intervention is where the evaluation marks live. Every policy needs a diagram, and every diagram needs a stated drawback.",
    core: ["Indirect tax, subsidy, max and min prices on diagrams", "Tradable permits and regulation", "Government failure: distorted signals, unintended consequences, admin cost", "Evaluating intervention against the size of the market failure"],
    traps: ["Setting a maximum price above equilibrium, which does nothing", "Listing policies without evaluating any", "Ignoring the cost of intervention"] },

  "eco2-1": { weight: 5,
    marks: "Typically 10 to 20 marks, and the source of most Paper 2 data questions",
    summary: "The four measures underpin every macro answer. Calculation questions here are guaranteed marks if the method is secure.",
    core: ["Real against nominal, total against per capita GDP", "CPI construction and its limitations", "Causes and effects of inflation", "The two measures of unemployment and the causes of it", "Current account components"],
    traps: ["Saying prices fell when inflation merely slowed, that is disinflation", "Using nominal figures to claim living standards rose", "Confusing the claimant count with the LFS measure"] },
  "eco2-2": { weight: 5,
    marks: "Typically 8 to 16 marks, and AD diagrams appear across the paper",
    summary: "AD = C + I + G + (X − M) is the backbone of Theme 2. Knowing what shifts each component is what makes the essays work.",
    core: ["The AD equation and the relative size of each component", "Influences on consumption, investment, government spending and net trade", "AD shifts against movements along AD", "Marginal propensity to consume"],
    traps: ["Shifting AS when the question is about a demand-side change", "Treating a change in the price level as a shift of AD"] },
  "eco2-3": { weight: 4,
    marks: "Typically 8 to 14 marks",
    summary: "The classical against Keynesian LRAS distinction is the evaluation lever for most macro essays, because the same policy has different effects on each.",
    core: ["SRAS and its determinants", "Classical vertical LRAS against the Keynesian curve", "Determinants of LRAS", "Which curve to use, and saying why"],
    traps: ["Drawing a Keynesian LRAS but analysing it as though vertical", "Confusing a movement along SRAS with a shift"] },
  "eco2-4": { weight: 4,
    marks: "Typically 8 to 14 marks; the multiplier calculation is near-guaranteed",
    summary: "The multiplier is one of the most reliable calculation marks on Paper 2, and it strengthens every fiscal policy answer.",
    core: ["Circular flow, injections and withdrawals", "Multiplier from MPC, or from MPS + MPT + MPM", "Applying the multiplier to an injection", "AD/AS equilibrium"],
    traps: ["Using 1/MPC instead of 1/(1−MPC)", "Forgetting that the multiplier works downwards on a withdrawal too"] },
  "eco2-5": { weight: 4,
    marks: "Typically 10 to 18 marks",
    summary: "Growth essays are common and are won on evaluation: sustainability, distribution and whether growth is actual or potential.",
    core: ["Actual against potential growth on AD/AS and PPF", "Output gaps, positive and negative", "The four phases of the trade cycle", "Costs and benefits of growth, including the environment"],
    traps: ["Claiming growth always raises living standards", "Confusing a negative output gap with negative growth"] },
  "eco2-6": { weight: 5,
    marks: "Typically 15 to 25 marks, and usually the Theme 2 essay",
    summary: "The biggest topic in Theme 2. Every policy needs a diagram, a transmission mechanism and a stated limitation, and the objective conflicts are where the top-band judgement comes from.",
    core: ["Monetary and fiscal instruments, and the MPC's role", "Supply-side policies, market-based against interventionist", "Diagrams for each policy type", "Conflicts: growth against inflation, unemployment against inflation, growth against the current account", "Time lags and policy limitations"],
    traps: ["Describing a policy without a transmission mechanism", "Treating supply-side policy as instant", "Listing conflicts without judging which dominates"] },

  "eco3-1": { weight: 3,
    marks: "Typically 4 to 12 marks",
    summary: "Mostly definitional, and quick marks. Integration types and the constraints on growth are the parts that recur.",
    core: ["Organic against inorganic growth", "Horizontal, vertical and conglomerate integration", "Constraints on growth", "Reasons for and effects of demergers"],
    traps: ["Confusing forward with backward vertical integration"] },
  "eco3-2": { weight: 4,
    marks: "Typically 6 to 14 marks",
    summary: "Short but high leverage: the objective a firm pursues determines which output it picks, so it drives the diagrams in 3.3 and 3.4.",
    core: ["Profit maximisation at MC = MR", "Revenue maximisation at MR = 0, sales maximisation at AC = AR", "Satisficing and the principal-agent problem", "Showing each objective on one diagram"],
    traps: ["Profit maximising where MC = AC", "Assuming every firm profit maximises without saying so"] },
  "eco3-3": { weight: 5,
    marks: "Typically 12 to 20 marks, and the diagrams recur throughout Theme 3",
    summary: "The cost and revenue curves everything else in Theme 3 sits on. Getting these accurate makes market structure diagrams straightforward.",
    core: ["Total, average and marginal revenue, and their link to PED", "Fixed and variable costs; short run against long run", "Diminishing marginal productivity and the shape of the cost curves", "Internal and external economies of scale, and the MES", "Normal and supernormal profit areas, and shutdown points"],
    traps: ["Drawing MC not cutting AC at its minimum", "Confusing diseconomies of scale with diminishing returns, which is a short run idea", "Treating normal profit as zero profit in ordinary language"] },
  "eco3-4": { weight: 5,
    marks: "The largest topic in Theme 3, often 20 to 30 marks across a paper",
    summary: "Market structures are the heart of Paper 1. Each structure needs an accurate diagram plus an efficiency verdict, and oligopoly with game theory is the most common extended question.",
    core: ["Allocative, productive, dynamic and X-efficiency, identified on diagrams", "Perfect competition short run and long run", "Monopolistic competition and its long run outcome", "Oligopoly: concentration ratios, collusion, kinked demand, game theory", "Monopoly, price discrimination and natural monopoly", "Monopsony and contestability"],
    traps: ["Long run supernormal profit in perfect competition", "Drawing the MR curve not twice as steep as AR", "Asserting monopoly is always bad without weighing dynamic efficiency"] },
  "eco3-5": { weight: 4,
    marks: "Typically 10 to 18 marks",
    summary: "Labour market diagrams follow the same logic as goods markets. Monopsony and the minimum wage are the two that come up most.",
    core: ["Labour demand as derived demand, and its elasticity", "Supply of labour to an occupation", "Competitive wage determination", "Monopsony, trade unions and the national minimum wage on diagrams", "Discrimination and wage differentials"],
    traps: ["Drawing the monopsony diagram without MC of labour above AC of labour", "Assuming a minimum wage always causes unemployment, it depends on the structure"] },
  "eco3-6": { weight: 4,
    marks: "Typically 10 to 20 marks, often the Theme 3 evaluation",
    summary: "Competition policy is where Theme 3 evaluation marks concentrate. Every measure has a cost and a risk of regulatory capture.",
    core: ["Competition policy and merger control", "Price and quality regulation of natural monopolies", "Deregulation and privatisation", "Regulatory capture and asymmetric information", "Evaluating effects on price, profit, efficiency, quality and choice"],
    traps: ["Listing policies without judging effectiveness", "Ignoring the information the regulator would need"] },

  "eco4-1": { weight: 5,
    marks: "The largest topic in Theme 4, commonly 20 to 30 marks",
    summary: "Trade, protectionism and exchange rates dominate Paper 2. Comparative advantage calculations and tariff diagrams are the two most reliable technical marks.",
    core: ["Absolute and comparative advantage, calculated from data", "Assumptions and limitations of comparative advantage", "Tariff, quota and subsidy diagrams", "Trading blocs, trade creation and diversion", "Exchange rate systems and their determinants", "Marshall-Lerner and the J-curve", "International competitiveness"],
    traps: ["Computing comparative advantage from absolute output alone", "Depreciation described as devaluation under a floating system", "Omitting the welfare areas on a tariff diagram"] },
  "eco4-2": { weight: 4,
    marks: "Typically 8 to 16 marks",
    summary: "Short and precise. The Lorenz curve and Gini coefficient are straightforward marks if you can construct and read them.",
    core: ["Absolute against relative poverty", "Causes of changes in poverty", "Wealth against income inequality", "Lorenz curve and Gini coefficient", "Capitalism and inequality"],
    traps: ["Treating relative poverty as though it can fall to zero", "Reading the Gini coefficient as a percentage of people rather than a measure of concentration"] },
  "eco4-3": { weight: 5,
    marks: "Typically 15 to 25 marks, and a frequent Theme 4 essay",
    summary: "Development strategies are an evaluation-heavy essay. The mark scheme rewards context, so name real countries and real policies.",
    core: ["HDI, its components and its limitations", "Economic barriers: primary product dependency, savings gap and Harrod-Domar, capital flight, debt", "Non-economic barriers: corruption, institutions, conflict", "Market-oriented against interventionist strategies", "Aid, debt relief, fairtrade, the Lewis model"],
    traps: ["Listing strategies with no judgement on which suits the country described", "Treating HDI as a complete measure of development"] },

  "eco4-4": { weight: 4,
    marks: "Typically 10 to 18 marks",
    summary: "The financial sector is where Theme 4 gets its clearest real-world case study. Almost every question routes back to the 2008 crisis, so having that example ready is most of the work.",
    core: ["Roles of financial markets and the three market types", "Asymmetric information, moral hazard and speculation", "How bubbles form and burst", "Central bank roles, including lender of last resort", "Regulation of banking"],
    traps: ["Describing the crisis without naming the market failure behind it", "Confusing moral hazard with adverse selection", "Treating regulation as costless"] },
  "eco4-5": { weight: 5,
    marks: "Typically 15 to 25 marks, and a frequent Paper 2 essay",
    summary: "The biggest topic in Theme 4 and heavily examined. Taxation and deficits carry both calculation and evaluation marks, and the policy-in-a-global-context material is what Paper 3 draws on.",
    core: ["Capital, current and transfer expenditure", "Progressive, proportional and regressive taxes, and the Laffer curve", "Structural against cyclical deficits, and deficit against debt", "Automatic stabilisers", "Policy responses to external shocks and the limits on policymakers"],
    traps: ["Confusing the deficit with the national debt", "Calling a tax regressive because the amount is smaller, rather than the proportion of income", "Asserting the Laffer curve peak is at a known rate"] },

  "eco5-1": { weight: 5,
    marks: "Applies to every mark on every paper",
    summary: "Not content, but where most marks are actually lost. A correct point written as a list rather than a chain scores a fraction of what it could.",
    core: ["Command words and what each demands", "Chains of analysis with each link stated", "Evaluation by magnitude, time frame, elasticity, assumptions, counterfactual", "Using the extract rather than describing it", "Accurate, labelled and explained diagrams"],
    traps: ["Writing two sides and stopping, with no judgement", "Diagrams drawn but never referred to in the text", "Answering 'assess' as though it said 'explain'"] },
  "eco5-2": { weight: 5,
    marks: "At least 20% of the total marks across the qualification",
    summary: "Quantitative skills are a guaranteed and specified proportion of the marks, and they are the easiest marks in the subject to secure.",
    core: ["Percentage change, percentage points and index numbers", "All elasticities, with sign and interpretation", "The multiplier and marginal propensities", "Real from nominal values", "Gini coefficient and Lorenz curve", "Correlation against causation"],
    traps: ["Confusing a percentage change with a change in percentage points", "Quoting a calculated figure without interpreting it", "Inferring causation from a correlation in the extract"] }
};
