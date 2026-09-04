/* ============================================================
   Economics notes, written for this tracker
   ------------------------------------------------------------
   WHERE THESE COME FROM

   These are ORIGINAL notes written for this app against the
   Edexcel 9EC0 specification. They are not copied from Physics
   & Maths Tutor, tutor2u, a textbook or anywhere else. Those
   notes are their authors' work; this repository is public, so
   pasting them in would be republishing someone else's material
   under our own name.

   PMT's own notes stay one click away on every topic, on their
   site, where they belong. Use both: theirs are longer and
   worked through, these are built to be turned straight into
   flashcards.

   The economics itself, the definitions, formulae, diagrams and
   chains of reasoning, is shared subject knowledge and is not
   anyone's property. That is what is written out below.

   SHAPE
     summary     one line: what this subtopic actually is
     points      the content, one idea per line, card-sized
     terms       definitions worth knowing exactly
     diagram     what to be able to draw, and what to label
     evaluation  the lines that earn the evaluation marks

   Every field is optional. A subtopic with only `points` renders
   fine. Exam-Focus mode stacks all the subtopic notes for a
   topic, so 1.1 shows 1.1.1 through 1.1.6 in order.
   ============================================================ */

const ECO_NOTES = {

  /* ================= THEME 1 ================= */

  "eco1-1-1": {
    summary: "Economics studies how scarce resources get allocated, using models rather than experiments.",
    points: [
      "Economists build models: deliberate simplifications that isolate one relationship at a time.",
      "Ceteris paribus means all other things held equal. It is what lets you say a price rise cuts demand without every other influence muddying it.",
      "Economics is a social science: it studies people, so controlled laboratory experiments are usually impossible.",
      "Evidence therefore comes from observing what happens in real economies, which is why economists often disagree about the same data."
    ],
    terms: [
      { term: "Ceteris paribus", def: "All other variables held constant" },
      { term: "Social science", def: "A subject studying human behaviour, where controlled experiments are rarely possible" }
    ],
    evaluation: [
      "A model is only as good as its assumptions: say which assumption is doing the work.",
      "Disagreement between economists is usually about assumptions or values, not about the arithmetic."
    ]
  },

  "eco1-1-2": {
    summary: "Positive statements can be tested against evidence. Normative statements are value judgements.",
    points: [
      "Positive: a claim about what is, which data could confirm or refute. 'A minimum price on alcohol reduces consumption.'",
      "Normative: a claim about what ought to be, which no data can settle. 'The government should raise the minimum price.'",
      "Watch for the giveaway words: should, ought, must, unfair, too high, better.",
      "A positive statement can be wrong and still be positive. Testability is what makes it positive, not truth.",
      "Value judgements shape policy: which objective a government prioritises is normative, even when the analysis behind it is positive."
    ],
    terms: [
      { term: "Positive statement", def: "An objective claim that can be tested against evidence" },
      { term: "Normative statement", def: "A subjective value judgement about what ought to happen" }
    ],
    evaluation: [
      "Most policy arguments mix both: the effect is positive, the desirability is normative.",
      "Naming which half of a statement is normative is often the mark."
    ]
  },

  "eco1-1-3": {
    summary: "Wants are unlimited, resources are finite, so every choice has a cost measured in what you gave up.",
    points: [
      "The economic problem: infinite wants against scarce resources, forcing choices.",
      "Three questions every economy answers: what to produce, how to produce it, for whom.",
      "Factors of production: land, labour, capital, enterprise. Their rewards are rent, wages, interest and profit.",
      "Renewable resources replenish over time; non-renewable ones do not, which makes their opportunity cost intergenerational.",
      "Opportunity cost is the next best alternative forgone, not the total of everything given up."
    ],
    terms: [
      { term: "Scarcity", def: "Finite resources against unlimited wants" },
      { term: "Opportunity cost", def: "The value of the next best alternative forgone" }
    ],
    evaluation: [
      "Opportunity cost applies to governments and firms, not just consumers: spending on health is spending not on defence.",
      "Free goods have no opportunity cost, which is why they are rare and worth naming when they appear."
    ]
  },

  "eco1-1-4": {
    summary: "The PPF shows the maximum combinations of two goods an economy can produce with all resources fully used.",
    points: [
      "Points on the curve: productively efficient, all resources used. Inside: unemployment or inefficiency. Outside: unattainable now.",
      "The curve is usually concave to the origin because resources are not equally suited to both uses, so opportunity cost rises as you specialise.",
      "Movement ALONG the curve is a reallocation between the two goods, and has an opportunity cost.",
      "A SHIFT outwards is economic growth: more resources, better technology, better skills. Inwards is a loss, such as war or disaster.",
      "Capital goods against consumer goods is the key trade-off: producing more capital goods today shifts the curve out tomorrow."
    ],
    diagram: "Two axes, capital goods and consumer goods. Concave curve. Mark a point inside (A, inefficient), on (B, efficient) and outside (C, unattainable). Show a shift outwards for growth, and an arrow along the curve for a reallocation.",
    terms: [
      { term: "Productive efficiency", def: "Producing at lowest average cost, on the PPF" },
      { term: "Economic growth", def: "An outward shift of the PPF, or a rise in real GDP" }
    ],
    evaluation: [
      "Choosing capital goods sacrifices consumption now for growth later: the trade-off is across time, not just across goods.",
      "A point inside the curve is not always inefficiency; it can be a deliberate reserve of spare capacity."
    ]
  },

  "eco1-1-5": {
    summary: "Splitting production into tasks raises output, but at a cost in flexibility and boredom.",
    points: [
      "Division of labour: breaking production into separate tasks. Specialisation: each worker, firm or country concentrating on what it does best.",
      "Adam Smith's pin factory: ten workers each on one task massively outproduce ten doing every task.",
      "Gains: higher productivity, lower unit costs, workers get faster, training is cheaper and quicker.",
      "Costs: repetitive work is demotivating, high turnover, workers become less occupationally mobile, production stops if one stage fails.",
      "Specialisation requires exchange, and exchange requires money."
    ],
    terms: [
      { term: "Division of labour", def: "Breaking production into separate specialised tasks" },
      { term: "Occupational mobility", def: "How easily labour can move between different types of job" }
    ],
    keyList: {
      title: "Four functions of money",
      items: ["Medium of exchange", "Measure of value (unit of account)", "Store of value", "Method of deferred payment"]
    },
    evaluation: [
      "Specialisation raises output but increases interdependence: a single supply chain break stops everything.",
      "Countries specialising in one commodity are exposed to price volatility, which links straight to Theme 4."
    ]
  },

  "eco1-1-6": {
    summary: "Economies differ in who allocates resources: the market, the state, or both.",
    points: [
      "Free market: resources allocated by the price mechanism, private ownership, profit motive.",
      "Command: the state allocates, owns the means of production, plans output.",
      "Mixed: both, which is every real economy. The debate is about the balance.",
      "Adam Smith: the invisible hand, self-interest producing socially good outcomes through competition.",
      "Hayek: no central planner can gather the dispersed knowledge that prices summarise automatically.",
      "Marx: markets concentrate ownership and exploit labour, so the state should own the means of production."
    ],
    terms: [
      { term: "Free market economy", def: "Resources allocated by the price mechanism with minimal state" },
      { term: "Command economy", def: "Resources allocated by state planning" }
    ],
    evaluation: [
      "Free markets are efficient but produce inequality and ignore externalities and public goods.",
      "Command economies can pursue equity but lack the price signals and incentives that drive efficiency.",
      "The right balance depends on the objective: efficiency, equity, or stability."
    ]
  },

  "eco1-2-1": {
    summary: "Standard theory assumes consumers maximise utility and firms maximise profit. Reality is messier.",
    points: [
      "Consumers are assumed rational: they choose the option giving greatest satisfaction, with full information.",
      "Firms are assumed to maximise profit, producing where MC = MR.",
      "These are assumptions that make the models tractable, not descriptions of how people behave.",
      "Departures from rationality are covered in 1.2.10 and matter for policy design."
    ],
    terms: [
      { term: "Utility", def: "The satisfaction gained from consuming a good" },
      { term: "Rational behaviour", def: "Acting to maximise your own objective, given the information available" }
    ],
    evaluation: [
      "If consumers are not rational, policies relying on information provision will underperform.",
      "Firms may satisfice rather than maximise, especially where ownership is divorced from control."
    ]
  },

  "eco1-2-2": {
    summary: "Demand is the quantity consumers are willing and able to buy at each price. The curve slopes down.",
    points: [
      "Why it slopes down: the income effect (your real income falls as price rises) and the substitution effect (you switch to alternatives).",
      "Diminishing marginal utility: each extra unit gives less satisfaction, so you will only buy more at a lower price.",
      "A change in PRICE causes a movement along the curve: extension or contraction.",
      "A change in anything else SHIFTS the curve.",
      "Conditions of demand, remember PASIFIC: Population, Advertising, Substitutes, Income, Fashion, Interest rates, Complements."
    ],
    diagram: "Price on the vertical axis, quantity on the horizontal. Downward sloping D. Show a movement along for a price change, and a rightward shift to D1 for a change in a condition of demand.",
    terms: [
      { term: "Effective demand", def: "Willingness AND ability to buy at a given price" },
      { term: "Diminishing marginal utility", def: "Each additional unit consumed yields less extra satisfaction" }
    ],
    evaluation: [
      "The single most common error in the subject is shifting the curve for a price change. A price change never shifts its own curve.",
      "Veblen and Giffen goods are the exceptions where demand rises with price."
    ]
  },

  "eco1-2-3": {
    summary: "Elasticity measures how strongly quantity demanded responds to price, income or another good's price.",
    points: [
      "PED = %ΔQd / %ΔP. Always negative for a normal demand curve; judge it by magnitude.",
      "|PED| > 1 elastic, < 1 inelastic, = 1 unitary, = 0 perfectly inelastic, = infinity perfectly elastic.",
      "PED determines revenue: if demand is inelastic, raising price raises total revenue. If elastic, raising price lowers it.",
      "Factors affecting PED: substitutes available, necessity or luxury, proportion of income, time, habit or addiction, brand loyalty.",
      "YED = %ΔQd / %ΔY. Positive means normal good; negative means inferior. Above 1 is a luxury.",
      "XED = %ΔQd of A / %ΔP of B. Positive means substitutes; negative means complements; zero means unrelated."
    ],
    terms: [
      { term: "PED", def: "Responsiveness of quantity demanded to a change in price" },
      { term: "Inferior good", def: "A good whose demand falls as income rises, so YED is negative" }
    ],
    evaluation: [
      "The sign classifies the good, the magnitude measures the strength. Questions want both.",
      "Elasticity changes along a straight-line demand curve, so a single value only holds near that price.",
      "Elasticities are estimated from past data and may not hold after a large price change."
    ]
  },

  "eco1-2-4": {
    summary: "Supply is the quantity producers are willing and able to sell at each price. The curve slopes up.",
    points: [
      "Why it slopes up: higher prices raise profitability, and cover the rising marginal costs of extra output.",
      "A change in PRICE causes a movement along the curve.",
      "A change in anything else SHIFTS it.",
      "Conditions of supply, remember PINTSWC: Productivity, Indirect taxes, Number of firms, Technology, Subsidies, Weather, Costs of production.",
      "A subsidy shifts supply right (down by the subsidy per unit); an indirect tax shifts it left (up by the tax per unit)."
    ],
    diagram: "Upward sloping S with price on the vertical axis. Show a rightward shift to S1 for a fall in costs, and label the vertical distance as the tax or subsidy per unit where relevant.",
    evaluation: [
      "Supply shifts are often slower than demand shifts, because capacity takes time to change.",
      "The size of the shift matters as much as the direction: say how large and why."
    ]
  },

  "eco1-2-5": {
    summary: "PES measures how strongly quantity supplied responds to price. Time is the dominant factor.",
    points: [
      "PES = %ΔQs / %ΔP, normally positive.",
      "Elastic supply means producers can expand output quickly; inelastic means they cannot.",
      "Factors: spare capacity, stocks held, ease of switching production, mobility of factors, time period, barriers to entry.",
      "Time: supply is more inelastic in the short run, because at least one factor is fixed. In the long run all factors vary, so PES rises.",
      "Primary commodities tend to have inelastic supply, which is why their prices swing so much."
    ],
    evaluation: [
      "Inelastic supply plus inelastic demand produces violent price volatility, the standard explanation for commodity markets.",
      "PES determines who bears an indirect tax alongside PED."
    ]
  },

  "eco1-2-6": {
    summary: "Equilibrium is where demand meets supply. Surpluses and shortages push price back to it.",
    points: [
      "Equilibrium price and quantity: the point where quantity demanded equals quantity supplied, and there is no tendency to change.",
      "Above equilibrium: excess supply, a surplus, so price is bid down.",
      "Below equilibrium: excess demand, a shortage, so price is bid up.",
      "A demand shift moves price and quantity in the SAME direction; a supply shift moves them in OPPOSITE directions.",
      "The size of the price and quantity change depends on the elasticity of the other curve."
    ],
    diagram: "D and S crossing at Pe, Qe. Shift one curve, label the new equilibrium P1 Q1, and mark the surplus or shortage at the original price.",
    evaluation: [
      "Always say what happens to BOTH price and quantity, and by how much given elasticity.",
      "Markets do not clear instantly: adjustment takes time, and in some markets prices are sticky."
    ]
  },

  "eco1-2-7": {
    summary: "Price does three jobs at once: it rations, it signals, and it incentivises.",
    points: [
      "Rationing: scarce goods go to those willing and able to pay most, so a rising price allocates a shrinking supply.",
      "Signalling: price conveys information about relative scarcity to both sides of the market.",
      "Incentive: a higher price rewards producers for supplying more, and encourages consumers to economise.",
      "These operate at every scale: local markets, national labour markets and global commodity markets."
    ],
    evaluation: [
      "The mechanism only allocates efficiently where there is no market failure: externalities and information gaps break it.",
      "Rationing by price allocates by ability to pay, which is efficient but not necessarily equitable."
    ]
  },

  "eco1-2-8": {
    summary: "Surplus is the gap between what people would have paid or accepted and what they actually did.",
    points: [
      "Consumer surplus: the area under the demand curve and above the market price.",
      "Producer surplus: the area above the supply curve and below the market price.",
      "Together they measure the welfare the market creates. At equilibrium in a free market this is maximised.",
      "A demand rise increases both. A supply rise increases consumer surplus and has an ambiguous effect on producer surplus."
    ],
    diagram: "D and S crossing at Pe Qe. Shade the triangle above Pe and below D as consumer surplus, and the triangle below Pe and above S as producer surplus. Shade the changes after a shift.",
    evaluation: [
      "Elasticity determines the size of each surplus: inelastic demand means a large consumer surplus.",
      "Welfare loss in later topics is measured against this maximum, so get the areas right here."
    ]
  },

  "eco1-2-9": {
    summary: "Taxes shift supply left and subsidies shift it right. Elasticity decides who actually pays.",
    points: [
      "Specific tax: a fixed amount per unit, so supply shifts up in a parallel way.",
      "Ad valorem tax: a percentage, so the shift widens as price rises and the curves diverge.",
      "Incidence: the more inelastic side of the market bears more of the tax.",
      "If demand is perfectly inelastic, consumers bear the entire tax. If perfectly elastic, producers do.",
      "Subsidies work in reverse: the more inelastic side gains more of the benefit.",
      "Government revenue = tax per unit x quantity traded after the tax."
    ],
    diagram: "S and S+tax, with the vertical gap equal to the tax. Mark the new price paid by consumers and the price received by producers. Shade consumer burden above the original price and producer burden below it, and outline total tax revenue.",
    evaluation: [
      "Taxing an inelastic good raises a lot of revenue but changes behaviour very little, which matters if the aim was to reduce consumption.",
      "The revenue can be hypothecated to fund alternatives, strengthening the policy.",
      "Regressive effects: indirect taxes take a larger share of a low income."
    ]
  },

  "eco1-2-10": {
    summary: "People systematically depart from the rational model, which changes what good policy looks like.",
    points: [
      "Habitual behaviour: choices repeated without re-evaluating, so better options are ignored.",
      "Consumer inertia and the cost of switching: people stay with a supplier even when a cheaper one exists.",
      "Weakness at computation: comparing complex tariffs or interest rates is genuinely hard, so people use rules of thumb.",
      "Influence of others: social norms and herding drive choices, from fashion to bank runs.",
      "Implication: nudges, defaults and choice architecture can work where information provision alone does not."
    ],
    evaluation: [
      "If consumers are not rational, information-based policies underperform and regulation may be needed instead.",
      "Nudges are cheap and preserve choice, but their effects are often small and can fade."
    ]
  },

  "eco1-3-1": {
    summary: "Market failure is a misallocation of resources: the free market produces the wrong quantity.",
    points: [
      "Complete market failure: the market does not provide the good at all, as with pure public goods.",
      "Partial market failure: the good is provided, but at the wrong quantity or price.",
      "The three causes on the specification: externalities, under-provision of public goods, and information gaps.",
      "Market failure is the standard justification for government intervention, which is Topic 1.4."
    ],
    terms: [
      { term: "Market failure", def: "Where the free market allocates resources inefficiently" }
    ],
    evaluation: [
      "Identifying market failure does not automatically justify intervention: government failure may be worse.",
      "The scale of the failure should be weighed against the cost of correcting it."
    ]
  },

  "eco1-3-2": {
    summary: "Externalities are costs or benefits falling on third parties, so private decisions ignore them.",
    points: [
      "Private cost or benefit: borne by the decision maker. External: borne by third parties. Social = private + external.",
      "Negative externality in production: MSC lies ABOVE MPC. The market overproduces at Q1 where the optimum is Q*.",
      "Positive externality in consumption: MSB lies ABOVE MPB. The market underconsumes.",
      "The welfare loss triangle sits between the private and social curves, between the market quantity and the social optimum.",
      "Merit goods are under-consumed because their benefits are undervalued; demerit goods are over-consumed because their costs are.",
      "Information failure usually sits underneath merit and demerit goods."
    ],
    diagram: "For a negative production externality: MPC and MSC with MSC above, and MPB = MSB. Market equilibrium at Q1, social optimum at Q*. Shade the welfare loss triangle between the curves from Q* to Q1.",
    terms: [
      { term: "External cost", def: "A cost of production or consumption falling on a third party" },
      { term: "Welfare loss", def: "The loss of social welfare from producing away from the social optimum" }
    ],
    evaluation: [
      "External costs are extremely hard to value in money, so the size of the optimal tax is uncertain.",
      "Say which direction the market is wrong in, over or under, and by roughly how much.",
      "Externalities can be positive and negative at once: driving causes congestion but enables work."
    ]
  },

  "eco1-3-3": {
    summary: "Public goods are non-rival and non-excludable, so no one will pay and the market provides none.",
    points: [
      "Non-rival: one person consuming does not reduce the amount available to others.",
      "Non-excludable: you cannot prevent a non-payer from benefiting.",
      "The free rider problem follows directly: if you cannot exclude me, I will not pay, so no firm can profit and none is supplied.",
      "This is complete market failure, which is why public goods are state-provided and tax-funded.",
      "Quasi-public goods have the properties partially: a beach is non-excludable until you charge for entry, and non-rival until it is crowded.",
      "Technology changes classification: encryption made broadcast TV excludable."
    ],
    terms: [
      { term: "Public good", def: "A good that is both non-rival and non-excludable" },
      { term: "Free rider", def: "Someone who benefits without paying, because they cannot be excluded" }
    ],
    evaluation: [
      "Public and merit goods are not the same. Education is excludable and rival, so it is a merit good, not a public good.",
      "Government provision has an opportunity cost and no market signal for the right quantity."
    ]
  },

  "eco1-3-4": {
    summary: "When one side knows more than the other, the market allocates to the wrong people.",
    points: [
      "Symmetric information: both sides equally informed, the assumption behind an efficient market.",
      "Asymmetric information: one side knows more, so the price no longer reflects true value.",
      "Consequence: over-consumption of goods whose costs are underestimated, and under-consumption of goods whose benefits are.",
      "Standard examples: pensions and insurance (the seller knows more), second-hand cars (the seller knows more), healthcare (the doctor knows more).",
      "Adverse selection: the wrong people buy insurance. Moral hazard: being insured changes behaviour."
    ],
    terms: [
      { term: "Asymmetric information", def: "Where one party to a transaction has more information than the other" }
    ],
    evaluation: [
      "Information provision is cheap but relies on people acting on it, which 1.2.10 says they often do not.",
      "The gap is often unfixable: some information is genuinely costly to obtain."
    ]
  },

  "eco1-4-1": {
    summary: "Governments correct market failure with taxes, subsidies, price controls, permits, provision and regulation.",
    points: [
      "Indirect tax: internalises an external cost. Set it equal to the external cost per unit to reach the social optimum.",
      "Subsidy: internalises an external benefit, shifting supply right and lowering price.",
      "Maximum price: set BELOW equilibrium to be binding, which creates a shortage. Used for affordability.",
      "Minimum price: set ABOVE equilibrium to be binding, which creates a surplus. Used to discourage consumption or support producers.",
      "Tradable pollution permits: the state caps total emissions and lets firms trade, so cuts happen where they are cheapest.",
      "State provision of public and merit goods, funded by taxation.",
      "Information provision and regulation, backed by enforcement and fines."
    ],
    diagram: "For a maximum price: D and S with Pmax drawn below Pe as a horizontal line. Mark Qd and Qs at that price and label the shortage between them.",
    evaluation: [
      "A price cap set above equilibrium does nothing at all: it must be binding to have any effect.",
      "Maximum prices create shortages, queues and black markets; minimum prices create surpluses the state may have to buy.",
      "Every intervention costs money to administer and enforce, and that cost has an opportunity cost.",
      "Effectiveness depends on elasticity: taxing an inelastic demerit good changes little behaviour."
    ]
  },

  "eco1-4-2": {
    summary: "Government failure is intervention that leaves society worse off than before.",
    points: [
      "Distortion of price signals: subsidies and controls stop prices carrying accurate information about scarcity.",
      "Unintended consequences: black markets from price caps, waste from agricultural surpluses, congestion from free provision.",
      "Excessive administrative costs: the cost of running the policy exceeds the welfare gained.",
      "Information gaps: governments cannot value externalities accurately, so they set the tax or subsidy at the wrong level.",
      "Regulatory capture: the regulator ends up serving the industry it regulates."
    ],
    terms: [
      { term: "Government failure", def: "Where intervention causes a net welfare loss" }
    ],
    evaluation: [
      "Government failure does not mean do nothing: it means weigh the cost of intervening against the cost of the market failure.",
      "The risk rises with the complexity of the market and the poorer the information available.",
      "This is the standard evaluation paragraph for any Theme 1 intervention essay."
    ]
  },

  /* ================= THEME 2 ================= */

  "eco2-1-1": {
    summary: "Growth is measured by real GDP, but GDP is a poor proxy for living standards.",
    points: [
      "Nominal GDP is at current prices; REAL GDP strips out inflation. Only real GDP measures output.",
      "Total GDP measures the size of the economy; GDP PER CAPITA measures the average person's share, which is what living standards need.",
      "Volume measures physical output; value measures output at prices.",
      "GNI adds net income from abroad; GNP adds net income from citizens abroad. For countries with large remittances or foreign ownership these differ sharply from GDP.",
      "Purchasing power parity adjusts for the fact that the same money buys more in some countries, and is required for fair comparison.",
      "Limitations: ignores the informal economy, unpaid work, inequality, environmental damage, and the quality of what is produced."
    ],
    terms: [
      { term: "Real GDP", def: "The value of output adjusted for inflation" },
      { term: "PPP", def: "An exchange rate adjustment so a given sum buys the same basket in each country" }
    ],
    evaluation: [
      "A rise in GDP per capita can hide falling incomes for most people if inequality is rising.",
      "Subjective wellbeing plateaus above a certain income (the Easterlin paradox), so more GDP is not always more welfare."
    ]
  },

  "eco2-1-2": {
    summary: "Inflation is a sustained rise in the general price level, measured mainly by CPI.",
    points: [
      "Inflation: prices rising. Deflation: prices falling. Disinflation: prices still rising, but more slowly.",
      "CPI is built from a basket of around 700 goods, weighted by a Living Costs and Food Survey, updated annually.",
      "CPI limitations: the basket lags changing habits, it ignores housing costs (RPI includes mortgage interest), it does not reflect quality improvements, and it is an average that fits no individual household.",
      "Demand pull inflation: AD rises faster than AS, so excess demand bids prices up.",
      "Cost push inflation: costs rise (wages, imports, commodities, taxes), shifting SRAS left.",
      "Growth of the money supply: too much money chasing too few goods, the monetarist explanation."
    ],
    diagram: "Demand pull: AD shifts right along an upward sloping AS, raising both price level and output. Cost push: SRAS shifts left, raising the price level while output falls.",
    evaluation: [
      "Deflation is generally worse than moderate inflation: it delays spending and raises the real value of debt.",
      "Effects depend on who you are: inflation helps borrowers and hurts savers and those on fixed incomes.",
      "Anticipated inflation is far less damaging than unanticipated inflation."
    ]
  },

  "eco2-1-3": {
    summary: "Unemployment is being out of work, able and actively seeking. The two measures disagree.",
    points: [
      "Claimant count: those claiming unemployment-related benefits. Cheap and fast, but excludes anyone not eligible or not claiming.",
      "Labour Force Survey: an ILO-standard survey, out of work and actively sought in the last four weeks. More accurate, more expensive, sampling error.",
      "Underemployment: working fewer hours or below your skill level. Inactivity: not working and not seeking, so not counted as unemployed at all.",
      "Structural: skills or location mismatch after industrial change. The most persistent and the hardest to fix.",
      "Frictional: between jobs, short term and largely unavoidable.",
      "Seasonal, cyclical (demand deficient, from a fall in AD), and real wage inflexibility where wages are held above equilibrium."
    ],
    evaluation: [
      "Migration expands the labour force: whether it raises unemployment depends on whether it also raises AD, which it usually does.",
      "The two measures can move in opposite directions, so say which you are using.",
      "Costs fall on the individual (income, skills, health), firms (lost demand) and government (lower tax, higher benefits)."
    ]
  },

  "eco2-1-4": {
    summary: "The current account records trade in goods and services plus income and transfers.",
    points: [
      "Four components: trade in goods, trade in services, primary income (investment income and wages), secondary income (transfers).",
      "A deficit means more is flowing out than in on the current account; a surplus the reverse.",
      "The balance of payments as a whole always balances: a current account deficit is matched by a financial account surplus.",
      "Economies are interconnected: one country's deficit is another's surplus, so global imbalances persist."
    ],
    evaluation: [
      "A deficit is not automatically bad: it can reflect strong domestic demand or investment inflows.",
      "It matters when it is large, persistent, and financed by borrowing rather than long-term investment."
    ]
  },

  "eco2-2-1": {
    summary: "AD = C + I + G + (X − M). Consumption is by far the largest component.",
    points: [
      "Rough UK shares: consumption around 60 per cent, investment 15 to 20, government 20 to 25, net trade usually slightly negative.",
      "The AD curve slopes down for three reasons: the real balance effect (a lower price level raises real wealth), the interest rate effect, and the trade effect (exports become more competitive).",
      "A change in the PRICE LEVEL is a movement along AD. A change in any component SHIFTS it.",
      "This distinction is examined constantly and is the most common macro diagram error."
    ],
    diagram: "Price level on the vertical axis, real GDP on the horizontal. Downward sloping AD. Show a rightward shift to AD1 and label the new equilibrium against AS.",
    evaluation: [
      "Because consumption dominates, anything affecting consumer confidence has the largest effect on AD.",
      "The size of the shift depends on the multiplier, which is Topic 2.4."
    ]
  },

  "eco2-2-2": {
    summary: "Consumption depends on disposable income, and on confidence, wealth and interest rates.",
    points: [
      "Disposable income is the main driver: income after tax and benefits.",
      "Saving is the residual. The average propensity to consume plus the average propensity to save equals one.",
      "Marginal propensity to consume: the fraction of each extra pound spent rather than saved. Higher for lower income households.",
      "Interest rates: higher rates raise the cost of borrowing and the reward for saving, so consumption falls.",
      "Consumer confidence: expectations about job security and future income, often the fastest-moving influence.",
      "Wealth effects: rising house or share prices make people feel richer and spend more, even with unchanged income."
    ],
    evaluation: [
      "Wealth effects are concentrated among asset owners, so they widen inequality as well as raising AD.",
      "Confidence can collapse faster than any policy can respond, which is why recessions begin sharply."
    ]
  },

  "eco2-2-3": {
    summary: "Investment is spending on capital goods. It is volatile and drives long-run growth.",
    points: [
      "Gross investment is total spending on capital; NET investment subtracts depreciation. Only net investment grows the capital stock.",
      "Influences: rate of economic growth, business confidence and expectations, demand for exports, interest rates, access to credit, government policy, retained profit, technological change, and the cost of capital goods.",
      "The accelerator effect: investment depends on the RATE OF CHANGE of demand, which makes it far more volatile than consumption.",
      "Investment is a component of AD now and a determinant of LRAS later, which is why it appears in both halves of Theme 2."
    ],
    evaluation: [
      "Animal spirits: expectations matter more than interest rates in a downturn, which limits monetary policy.",
      "Investment raises AD immediately but LRAS only after a lag, so the inflationary effect comes first."
    ]
  },

  "eco2-2-4": {
    summary: "Government spending is set by policy, the cycle and demography.",
    points: [
      "The trade cycle: spending on benefits rises automatically in a recession, an automatic stabiliser.",
      "Fiscal policy stance: expansionary or contractionary, a deliberate choice.",
      "Age distribution: an ageing population raises pension and healthcare spending regardless of policy.",
      "Government spending is the component the state controls directly, which is why fiscal policy acts through it."
    ],
    evaluation: [
      "Much of government spending is committed and hard to cut quickly, which limits discretionary policy.",
      "Crowding out: higher government borrowing may raise interest rates and displace private investment."
    ]
  },

  "eco2-2-5": {
    summary: "Net trade is exports minus imports, driven by income, competitiveness and the exchange rate.",
    points: [
      "Real income at home: rising incomes suck in imports, worsening net trade.",
      "The state of the world economy: growth abroad raises demand for exports.",
      "Exchange rates, remember SPICED: Strong Pound, Imports Cheap, Exports Dear. A stronger pound worsens net trade.",
      "Protectionism abroad reduces exports; degree of protectionism at home reduces imports.",
      "Non-price factors: quality, design, reliability, branding and after-sales service, which matter more for advanced economies."
    ],
    evaluation: [
      "The Marshall-Lerner condition governs whether a depreciation actually improves the current account, covered in Theme 4.",
      "Net trade is the smallest component of AD in the UK, so its effect on AD is limited even when it moves a lot."
    ]
  },

  "eco2-3-1": {
    summary: "AS is the total output firms will supply at each price level. Short run and long run differ.",
    points: [
      "SRAS slopes upward: with at least one factor fixed and money wages sticky, a higher price level raises profit margins so firms supply more.",
      "A change in the PRICE LEVEL is a movement along AS; a change in costs or capacity SHIFTS it.",
      "LRAS shows productive capacity, and is independent of the price level.",
      "The shape of LRAS is the single biggest source of disagreement in macro, and the main evaluation lever in Theme 2."
    ]
  },

  "eco2-3-2": {
    summary: "SRAS shifts when the costs of production change.",
    points: [
      "Raw material and energy costs: an oil price rise shifts SRAS left.",
      "Exchange rates: a weaker pound raises imported input costs and shifts SRAS left.",
      "Business taxes and regulation costs.",
      "Wage costs, which are usually the largest single cost.",
      "A leftward SRAS shift causes stagflation: higher price level and lower output at the same time."
    ],
    diagram: "AD fixed, SRAS shifting left to SRAS1. Show the price level rising and real output falling, and label it stagflation.",
    evaluation: [
      "Cost push shocks put policymakers in a bind: raising rates cuts inflation but deepens the output fall."
    ]
  },

  "eco2-3-3": {
    summary: "LRAS is productive capacity. Classical says vertical, Keynesian says it has three phases.",
    points: [
      "CLASSICAL LRAS is vertical at full capacity: in the long run the economy returns to full employment, so demand-side policy only changes the price level.",
      "KEYNESIAN LRAS has a horizontal section (spare capacity, so AD raises output with no inflation), a rising section, and a vertical section at full capacity.",
      "Determinants of LRAS: technology, productivity, education and skills, government regulation, demographics and migration, competition policy, and infrastructure.",
      "Which curve you draw determines the answer, so state which you are using and why."
    ],
    diagram: "Draw both. Classical: vertical LRAS with AD shifting right, giving pure inflation. Keynesian: the reverse-L shape with AD shifting right along the horizontal section, giving output growth with no inflation.",
    evaluation: [
      "On classical LRAS, demand-side policy is useless in the long run and only supply-side policy raises output.",
      "On Keynesian LRAS with spare capacity, demand-side policy raises output with no inflationary cost.",
      "The honest answer is that it depends on where the economy currently is relative to capacity."
    ]
  },

  "eco2-4-1": {
    summary: "The circular flow tracks income moving between households and firms.",
    points: [
      "Households supply factors of production and receive income; firms supply goods and receive spending.",
      "Income is a FLOW measured over time; wealth is a STOCK measured at a point in time.",
      "The distinction matters: a wealth tax and an income tax hit completely different people."
    ]
  },

  "eco2-4-2": {
    summary: "Injections add to the circular flow, withdrawals leak out of it.",
    points: [
      "Injections: Investment, Government spending, Exports.",
      "Withdrawals: Savings, Taxation, Imports.",
      "Injections greater than withdrawals means national income rises; the reverse means it falls.",
      "Equilibrium national income is where injections equal withdrawals."
    ]
  },

  "eco2-4-3": {
    summary: "Equilibrium output and the price level are set where AD meets AS.",
    points: [
      "Draw AD against AS and read off equilibrium real output and price level.",
      "A rightward AD shift raises both output and the price level, with the split depending on the AS curve used.",
      "A rightward LRAS shift raises output and LOWERS the price level: non-inflationary growth."
    ],
    evaluation: [
      "Non-inflationary growth is the objective, which is why supply-side policy is attractive despite its lags."
    ]
  },

  "eco2-4-4": {
    summary: "The multiplier means an injection raises national income by more than itself.",
    points: [
      "An injection becomes someone's income, part of which they spend, which becomes someone else's income, and so on.",
      "Multiplier = 1 / (1 − MPC), or equivalently 1 / MPW where MPW = MPS + MPT + MPM.",
      "A higher MPC gives a larger multiplier; higher leakages give a smaller one.",
      "It works in both directions: a withdrawal contracts income by a multiple too.",
      "Worked example: MPC 0.8 gives a multiplier of 5, so a £2bn injection raises national income by £10bn."
    ],
    evaluation: [
      "The multiplier is smaller in an open economy with high imports, and smaller at full capacity where extra demand feeds prices instead of output.",
      "Estimating the MPC precisely is difficult, so the multiplier used in policy costings is uncertain."
    ]
  },

  "eco2-5-1": {
    summary: "Actual growth uses spare capacity; potential growth expands capacity itself.",
    points: [
      "Actual growth: a rise in real GDP, shown by AD shifting right or a move from inside the PPF towards it.",
      "Potential growth: a rise in productive capacity, shown by LRAS shifting right or the PPF shifting outwards.",
      "Short run causes: rises in any AD component.",
      "Long run causes: more or better factors of production, technology, productivity, investment.",
      "Export-led growth: growth driven by external demand, the model followed by China and the East Asian economies."
    ],
    diagram: "Show both on one AD/AS pair: AD shifting right for actual growth, LRAS shifting right for potential growth. Mirror it on a PPF.",
    evaluation: [
      "Actual growth without potential growth eventually hits capacity and becomes inflation.",
      "Export-led growth depends on demand abroad, so it exports vulnerability as well as goods."
    ]
  },

  "eco2-5-2": {
    summary: "An output gap is the difference between actual and potential output.",
    points: [
      "Negative output gap: actual output below potential, so spare capacity, unemployment and downward pressure on inflation.",
      "Positive output gap: actual above potential, an overheating economy with inflationary pressure.",
      "Shown as the horizontal distance between the AD/AS equilibrium and the LRAS curve.",
      "Measuring it requires knowing potential output, which is not observable."
    ],
    evaluation: [
      "Because potential output is estimated rather than measured, output gap figures are revised heavily after the fact.",
      "Policy based on a mismeasured gap can be actively destabilising."
    ]
  },

  "eco2-5-3": {
    summary: "Economies move through boom, downturn, recession and recovery.",
    points: [
      "Boom: output above trend, low unemployment, rising inflation, high confidence, positive output gap.",
      "Downturn: growth slowing, confidence falling.",
      "Recession: two consecutive quarters of negative growth. Rising unemployment, falling inflation, weak investment.",
      "Recovery: growth resumes, unemployment falls with a lag.",
      "Fluctuations are driven mainly by swings in AD, especially investment and confidence."
    ],
    evaluation: [
      "Unemployment lags the cycle: it keeps rising after recovery has begun, which shapes the politics of policy."
    ]
  },

  "eco2-5-4": {
    summary: "Growth raises incomes but carries environmental and distributional costs.",
    points: [
      "Benefits: higher incomes and living standards, employment, more tax revenue for public services, higher profits and investment.",
      "Costs: inflation risk, environmental damage and resource depletion, inequality if gains are concentrated, and a worsening current account as imports rise.",
      "Sustainability: growth that depletes natural capital borrows from future generations."
    ],
    evaluation: [
      "Whether growth improves living standards depends on distribution: GDP per capita is a mean, not a typical experience.",
      "The environmental cost depends on the type of growth: green growth is not a contradiction, but it is not automatic."
    ]
  },

  "eco2-6-1": {
    summary: "The main objectives, and the fact that they conflict.",
    points: [
      "Strong and sustainable economic growth, typically 2 to 3 per cent a year in the UK.",
      "Low unemployment, close to full employment.",
      "Low and stable inflation: the UK target is 2 per cent CPI, plus or minus 1.",
      "Balance of payments equilibrium on the current account.",
      "Additional objectives: balanced government budget, protection of the environment, greater income equality."
    ]
  },

  "eco2-6-2": {
    summary: "Fiscal and monetary policy shift AD. Both work with lags and both have limits.",
    points: [
      "MONETARY policy: interest rates, quantitative easing and the money supply, set by the Bank of England's MPC, independent since 1997, targeting 2 per cent CPI.",
      "Transmission mechanism of a rate cut: cheaper borrowing and lower saving returns, so consumption and investment rise; the exchange rate falls, so exports rise; AD shifts right.",
      "Quantitative easing: the Bank buys assets, raising their prices and lowering yields, increasing liquidity and lending.",
      "FISCAL policy: government spending and taxation. Expansionary means spending more or taxing less.",
      "Fiscal policy affects AD directly and, if spent on infrastructure or skills, LRAS as well."
    ],
    diagram: "AD shifting right against a Keynesian AS, then the same shift against a classical vertical LRAS, to show the same policy giving output in one case and only inflation in the other.",
    evaluation: [
      "Time lags: recognition, decision and implementation. Monetary policy is thought to act with a lag of up to two years.",
      "The liquidity trap: at very low rates, further cuts do little, which is why QE was used.",
      "Fiscal expansion worsens the deficit and may crowd out private investment.",
      "The effect depends on where the economy is on the AS curve."
    ]
  },

  "eco2-6-3": {
    summary: "Supply-side policy raises productive capacity by shifting LRAS right.",
    points: [
      "MARKET-BASED: reduce intervention so markets work better. Cutting income and corporation tax to raise incentives, deregulation, privatisation, trade union reform, reducing benefits.",
      "INTERVENTIONIST: the state acts directly. Spending on education and training, infrastructure, research and development subsidies, and regional policy.",
      "Both shift LRAS right, delivering growth with a FALLING price level, the only policy that improves growth and inflation together.",
      "Also improves the current account by raising international competitiveness."
    ],
    diagram: "LRAS shifting right with AD fixed: output rises and the price level falls. Contrast with an AD shift, where output and prices both rise.",
    evaluation: [
      "Very long time lags: education spending takes a generation to show in productivity.",
      "Expensive, with a large opportunity cost, and interventionist policy risks government failure.",
      "Market-based policies tend to increase inequality, particularly benefit and tax cuts.",
      "Supply-side policy does nothing for a demand-deficient recession in the short run."
    ]
  },

  "eco2-6-4": {
    summary: "Objectives conflict, so policy is a choice about which to sacrifice.",
    points: [
      "Growth against inflation: demand-led growth raises the price level, particularly near capacity.",
      "Unemployment against inflation: the short run Phillips curve shows the trade-off, since falling unemployment bids wages up.",
      "Growth against the current account: rising incomes raise imports, worsening the deficit.",
      "Growth against the environment: more output usually means more emissions and resource use.",
      "Growth against equality: the gains may accrue to capital owners rather than workers.",
      "Fiscal consolidation against growth: cutting the deficit reduces AD in the short run."
    ],
    diagram: "Short run Phillips curve with inflation on the vertical axis and unemployment on the horizontal, sloping down. Show the long run Phillips curve vertical at the natural rate.",
    evaluation: [
      "Supply-side policy is the one route that eases several conflicts at once, which is why it is the standard conclusion.",
      "The long run Phillips curve is vertical, so the trade-off is temporary if expectations adjust.",
      "Which conflict dominates depends on the starting position: spare capacity means less of a trade-off."
    ]
  },

  /* ================= THEME 3 ================= */

  "eco3-1-1": {
    summary: "Firms vary in size, and staying small is often a choice rather than a failure.",
    points: [
      "Reasons firms stay small: a small or niche market, lack of access to finance, the owner's own objectives, and the diseconomies that come with size.",
      "Public sector organisations are state owned and funded from taxation; private sector firms are privately owned.",
      "Not-for-profit organisations pursue a social objective and reinvest any surplus rather than distributing it.",
      "The principal-agent problem grows with size, which is itself a reason some owners stay small."
    ],
    evaluation: [
      "Small firms can be more innovative and responsive, so size is not the same as efficiency.",
      "Niche markets can be highly profitable precisely because large firms find them uneconomic to serve."
    ]
  },

  "eco3-1-2": {
    summary: "Firms grow organically or by integration, and each route has different risks.",
    points: [
      "Organic (internal) growth: reinvesting profit, expanding capacity. Slower but lower risk and keeps control.",
      "Inorganic (external) growth: mergers and takeovers. Fast, but integration often fails and costs are high.",
      "Horizontal integration: same industry, same stage. Raises market share and gives economies of scale.",
      "Vertical integration: same industry, different stage. Backward towards suppliers secures inputs; forward towards retail secures distribution.",
      "Conglomerate: unrelated industries. Diversifies risk but brings no synergies.",
      "Constraints on growth: size of the market, access to finance, owner objectives, and regulation such as competition authorities blocking a merger."
    ],
    terms: [
      { term: "Vertical integration", def: "Merging with a firm at a different stage of the same supply chain" }
    ],
    evaluation: [
      "Most mergers fail to deliver the promised synergies, largely through culture clashes and integration costs.",
      "Horizontal integration raises competition concerns and may be blocked."
    ]
  },

  "eco3-1-3": {
    summary: "Demergers split a firm up when the parts are worth more separately.",
    points: [
      "Reasons: no synergies materialised, the parts are valued higher separately, a wish to focus on core competencies, and regulatory pressure.",
      "Impacts on businesses: sharper focus, but lost economies of scale.",
      "Impacts on workers: uncertainty and possible redundancies from duplicated functions.",
      "Impacts on consumers: potentially more competition and better service, or lost scale economies and higher prices."
    ],
    evaluation: [
      "A demerger admits the original merger destroyed value, which is itself evidence about merger success rates."
    ]
  },

  "eco3-2-1": {
    summary: "Not every firm maximises profit. The objective chosen determines the output.",
    points: [
      "Profit maximisation: produce where MC = MR. This is the assumed default and the reference point for all the others.",
      "Revenue maximisation: produce where MR = 0. Higher output and lower price than profit maximisation.",
      "Sales maximisation: the largest output that still covers costs, where AC = AR, so normal profit only.",
      "Satisficing: doing enough to keep stakeholders content rather than optimising, which arises when ownership is divorced from control.",
      "Survival: the objective in a downturn or for a new entrant.",
      "The principal-agent problem: managers (agents) may pursue growth, salary or prestige rather than owner (principal) profit."
    ],
    diagram: "One cost and revenue diagram with AR, MR, MC and AC. Mark the four output levels: MC = MR, MR = 0, AC = AR, and show that output rises and price falls as you move along them.",
    evaluation: [
      "Firms may accept lower short run profit to build market share and raise long run profit.",
      "Which objective a firm holds is hard to observe from outside, which limits the predictive power of the models."
    ]
  },

  "eco3-3-1": {
    summary: "Revenue curves depend on whether the firm is a price taker or a price maker.",
    points: [
      "TR = P x Q. AR = TR / Q, and AR always equals price, so the AR curve IS the demand curve.",
      "MR is the revenue from one more unit.",
      "PRICE TAKER (perfect competition): the firm faces a horizontal demand curve, so AR = MR = price.",
      "PRICE MAKER: downward sloping AR, and MR falls twice as steeply and hits zero at half the output where AR hits zero.",
      "Link to elasticity: where demand is elastic MR is positive, so cutting price raises revenue. Where inelastic MR is negative. MR = 0 at unit elasticity, which is where revenue peaks."
    ],
    diagram: "Downward sloping AR with MR below it at twice the gradient, cutting the horizontal axis at half of AR's intercept. Mark the elastic region, unit elasticity at MR = 0, and the inelastic region.",
    evaluation: [
      "The MR curve being twice as steep is a very common diagram error and is worth checking every time."
    ]
  },

  "eco3-3-2": {
    summary: "Costs split into fixed and variable in the short run. In the long run everything varies.",
    points: [
      "Fixed costs do not change with output; variable costs do. TC = FC + VC.",
      "SHORT RUN: at least one factor is fixed. LONG RUN: all factors are variable.",
      "AC = TC / Q. MC is the cost of one more unit.",
      "The law of diminishing marginal productivity: adding more of a variable factor to a fixed factor eventually reduces the extra output per unit added, which is what makes MC rise.",
      "MC cuts AVC and AC at their MINIMUM points. This is arithmetic, not a coincidence: while MC is below the average it pulls it down.",
      "Long run average cost is U-shaped: economies of scale, then constant returns, then diseconomies."
    ],
    diagram: "SRAC and SRMC with MC cutting AC at its minimum. Separately, an LRAC envelope showing economies, minimum efficient scale, and diseconomies.",
    evaluation: [
      "Diminishing returns is a SHORT RUN idea about a fixed factor. Diseconomies of scale is a LONG RUN idea about management. Confusing them is a standard error."
    ]
  },

  "eco3-3-3": {
    summary: "Bigger firms can have lower unit costs, until management complexity reverses it.",
    points: [
      "Internal economies, remember RTFMPS: Risk bearing, Technical, Financial, Managerial, Purchasing, Specialisation.",
      "Technical: larger machinery and the specialisation of capital. Purchasing: bulk discounts. Financial: cheaper borrowing for large firms.",
      "External economies: benefits from the industry growing, such as a skilled local labour pool or shared infrastructure.",
      "Diseconomies of scale: control, coordination and communication problems, plus falling worker motivation in a large organisation.",
      "Minimum efficient scale: the lowest output at which LRAC is minimised. Where the MES is large relative to the market, the market naturally holds few firms."
    ],
    diagram: "U-shaped LRAC. Label the falling section economies of scale, the trough as the minimum efficient scale, and the rising section diseconomies.",
    evaluation: [
      "A high MES is the natural-monopoly argument and links directly to 3.4.5.",
      "Diseconomies can be managed by decentralising, so they are not inevitable."
    ]
  },

  "eco3-3-4": {
    summary: "Normal profit covers opportunity cost. Supernormal profit is anything above it.",
    points: [
      "NORMAL profit is the minimum needed to keep the firm in the industry. It is a cost, and is included in AC.",
      "SUPERNORMAL profit is any profit above normal, earned where AR is above AC.",
      "On a diagram, profit per unit is the vertical gap between AR and AC at the chosen output; total profit is that gap times quantity.",
      "SHORT RUN shutdown: close if price falls below AVC, since you cannot even cover variable costs.",
      "LONG RUN shutdown: close if price falls below AC, since fixed costs are now avoidable too."
    ],
    diagram: "AR, MR, MC and AC with output at MC = MR. Shade the rectangle between AR and AC over that quantity as supernormal profit. Repeat with AC above AR for a loss.",
    evaluation: [
      "Normal profit being zero economic profit but positive accounting profit is a distinction examiners test.",
      "Supernormal profit funds investment and dynamic efficiency, which is the main defence of monopoly."
    ]
  },

  "eco3-4-1": {
    summary: "Four efficiencies, each with a precise condition you can point to on a diagram.",
    points: [
      "ALLOCATIVE efficiency: P = MC. Resources go where consumers value them most, and welfare is maximised.",
      "PRODUCTIVE efficiency: producing at the minimum of AC, which is where MC cuts AC.",
      "DYNAMIC efficiency: innovation and investment over time, lowering costs and improving products. Requires supernormal profit to fund it.",
      "X-INEFFICIENCY: costs above the minimum possible, caused by lack of competitive pressure. Shown as operating above the AC curve."
    ],
    evaluation: [
      "There is a genuine trade-off: perfect competition delivers allocative and productive efficiency but no supernormal profit, so no dynamic efficiency.",
      "Monopoly is the reverse, which is why the verdict on monopoly depends on which efficiency you weight."
    ]
  },

  "eco3-4-2": {
    summary: "Many small firms, identical products, free entry. The theoretical benchmark.",
    points: [
      "Assumptions: many buyers and sellers, homogeneous products, perfect information, no barriers to entry or exit, firms are price takers.",
      "SHORT RUN: supernormal profit is possible if price is above AC.",
      "LONG RUN: supernormal profit attracts entry, industry supply rises, price falls until only normal profit remains.",
      "In long run equilibrium: P = MC = MR = AR = AC at minimum, so both allocatively AND productively efficient.",
      "No supernormal profit means no funds for R&D, so no dynamic efficiency."
    ],
    diagram: "Two diagrams side by side: the industry with S and D setting the price, and the firm with a horizontal AR = MR at that price. Show short run supernormal profit, then the long run with AR tangent to AC at its minimum.",
    evaluation: [
      "No real market meets all the assumptions, so it is a benchmark rather than a description.",
      "Its efficiency comes at the cost of variety and innovation."
    ]
  },

  "eco3-4-3": {
    summary: "Many firms, differentiated products, low barriers. Real and common.",
    points: [
      "Assumptions: many firms, product differentiation, low barriers to entry, some price-setting power.",
      "The differentiation gives a downward sloping but very elastic demand curve.",
      "SHORT RUN: supernormal profit possible. LONG RUN: entry competes it away to normal profit.",
      "In long run equilibrium AR is TANGENT to AC, but to the left of AC's minimum, so it is NEITHER allocatively nor productively efficient.",
      "Examples: restaurants, hairdressers, plumbers."
    ],
    diagram: "Long run: downward sloping AR just tangent to a U-shaped AC, at an output left of AC's minimum. Mark the excess capacity between that output and the minimum.",
    evaluation: [
      "The inefficiency buys consumers variety and choice, which has real value not captured by the efficiency conditions.",
      "Excess capacity is the cost of differentiation."
    ]
  },

  "eco3-4-4": {
    summary: "Few large interdependent firms. Interdependence is the defining feature.",
    points: [
      "Characteristics: few firms dominate, high barriers to entry, differentiated products, and interdependence, so each firm's best move depends on what rivals do.",
      "Concentration ratio: the combined market share of the largest n firms. A 5-firm ratio above 60 per cent indicates oligopoly.",
      "COLLUSIVE behaviour: firms act together to raise price towards the monopoly outcome. Overt collusion is a formal cartel and illegal; tacit collusion is unspoken price leadership.",
      "Kinked demand curve: rivals match price cuts but not price rises, so demand is elastic above the current price and inelastic below. This creates a gap in the MR curve and explains price rigidity.",
      "Game theory and the prisoner's dilemma: the dominant strategy for each firm produces a worse outcome for both than cooperating, which explains both price wars and the incentive to collude.",
      "Non-price competition: advertising, branding, loyalty schemes, quality and service, used because price competition destroys profit for everyone."
    ],
    diagram: "Kinked demand curve with the kink at the current price, elastic above and inelastic below, and a vertical discontinuity in MR. Show that MC can move within the gap without changing price or output.",
    evaluation: [
      "Collusion raises prices and harms consumers, but cartels are unstable because each member gains from cheating.",
      "The kinked demand model explains price stability but not how the price got there in the first place."
    ]
  },

  "eco3-4-5": {
    summary: "One dominant firm, high barriers, price maker. Efficiency depends on which efficiency.",
    points: [
      "Pure monopoly is one firm with 100 per cent share; legal monopoly is 25 per cent or more.",
      "Barriers to entry: economies of scale, legal protection such as patents, brand loyalty, high sunk costs, control of key resources.",
      "Profit maximises at MC = MR, giving a HIGHER price and LOWER output than perfect competition, so P is above MC and it is allocatively inefficient.",
      "It also produces away from minimum AC, so it is productively inefficient, and lacks competitive pressure, so it risks X-inefficiency.",
      "But supernormal profit funds R&D and investment, giving dynamic efficiency, and economies of scale can push price BELOW the competitive level.",
      "THIRD DEGREE PRICE DISCRIMINATION: charging different groups different prices for the same good. Requires market power, the ability to separate groups by elasticity, and prevention of resale.",
      "NATURAL MONOPOLY: where the MES is so large relative to demand that one firm is the efficient number, so competition would raise costs. Regulated rather than broken up."
    ],
    diagram: "Monopoly with AR, MR, MC, AC. Mark Pm and Qm at MC = MR, and the competitive P = MC point, shading the welfare loss triangle between them. For price discrimination, two sub-markets with different elasticities side by side.",
    evaluation: [
      "Price discrimination raises producer surplus and cuts consumer surplus, but can allow output that would otherwise be unprofitable, and can cross-subsidise low-income users.",
      "The monopoly verdict turns on dynamic against static efficiency, and on whether scale economies outweigh the loss of competition."
    ]
  },

  "eco3-4-6": {
    summary: "Monopsony is a single dominant BUYER, most often an employer.",
    points: [
      "Characteristics: one dominant buyer, so the buyer sets the price it pays rather than accepting a market price.",
      "Benefits to the firm: lower input or wage costs, so higher profit, and possibly lower prices passed to consumers.",
      "Costs to suppliers and employees: lower prices received and lower wages, plus lower employment than in a competitive market.",
      "Standard examples: large supermarkets buying from farmers, the NHS as an employer of nurses."
    ],
    diagram: "Labour market with the supply of labour as AC of labour and MC of labour ABOVE it. Employment set where MRP = MCL, but the wage read off the supply curve below, showing both lower wage and lower employment.",
    evaluation: [
      "Cost savings may be passed to consumers as lower prices, so the welfare effect is ambiguous.",
      "A trade union facing a monopsonist can raise wages AND employment, which is the bilateral monopoly case."
    ]
  },

  "eco3-4-7": {
    summary: "What matters is not how many firms there are, but how easily new ones could enter.",
    points: [
      "A contestable market has low barriers to entry AND exit, so incumbents face the threat of hit-and-run competition.",
      "SUNK COSTS are the key: costs that cannot be recovered on exit. Low sunk costs mean high contestability.",
      "The threat alone disciplines behaviour: incumbents set price near normal profit to deter entry, even with high concentration.",
      "So a monopoly in a contestable market may behave competitively."
    ],
    evaluation: [
      "Contestability shifts competition policy from breaking up firms towards removing barriers to entry.",
      "Perfect contestability is as unrealistic as perfect competition, but the direction of the argument holds."
    ]
  },

  "eco3-5-1": {
    summary: "Labour demand is derived from demand for the product it makes.",
    points: [
      "Derived demand: firms hire labour for what it produces, so demand for labour rises when demand for the product rises.",
      "The demand curve for labour is the marginal revenue product: MRP = marginal physical product x marginal revenue.",
      "Influences: wage rate, demand for the product, labour productivity, the price of capital as a substitute, and the number of firms.",
      "Elasticity of demand for labour depends on: the substitutability of capital, labour cost as a proportion of total cost, the PED of the final product, and time."
    ],
    evaluation: [
      "Where labour is a small share of total costs, demand for it is inelastic, so a minimum wage costs fewer jobs."
    ]
  },

  "eco3-5-2": {
    summary: "Labour supply to an occupation depends on far more than the wage.",
    points: [
      "Influences: the wage rate, the wages available in alternative jobs, the non-monetary characteristics of the work, barriers to entry such as qualifications, the size and demographics of the population, migration, and trade unions.",
      "Elasticity of supply depends on the qualifications and training required, the time period, and the occupational and geographical mobility of labour.",
      "Highly skilled occupations have inelastic supply, which is why their wages are high."
    ],
    evaluation: [
      "The backward bending supply curve: above a certain wage the income effect can outweigh the substitution effect and hours fall."
    ]
  },

  "eco3-5-3": {
    summary: "Wages are set by labour demand and supply, then modified by unions, monopsony and law.",
    points: [
      "In a competitive labour market, the wage is where the demand for labour (MRP) meets the supply of labour.",
      "Wage differentials arise from differences in MRP, skills, qualifications, non-monetary factors, and barriers to entry.",
      "TRADE UNION: raising the wage above equilibrium creates excess supply of labour, so employment falls, UNLESS the employer is a monopsonist.",
      "MONOPSONY: the employer sets a wage below the competitive level and hires fewer workers. Here a union or minimum wage can raise BOTH wage and employment.",
      "NATIONAL MINIMUM WAGE: a price floor in the labour market. Above equilibrium it causes excess supply, but the size depends on elasticity, and in a monopsonised market it may raise employment.",
      "Current issues: skills shortages, youth unemployment, the effect of migration on supply, and the gender pay gap."
    ],
    diagram: "Competitive labour market with DL and SL. Add a minimum wage line above equilibrium and mark the excess supply. Separately, a monopsony diagram showing a minimum wage raising both wage and employment.",
    evaluation: [
      "The employment effect of a minimum wage depends entirely on market structure and elasticity, which is why the empirical evidence is mixed.",
      "Higher wages can raise productivity and cut turnover, partially offsetting the cost to firms."
    ]
  },

  "eco3-5-4": {
    summary: "Discrimination misallocates labour and costs the discriminating firm money.",
    points: [
      "Discrimination means treating equally productive workers differently because of a characteristic unrelated to productivity.",
      "Effect on the discriminated group: lower demand for their labour, so lower wages and employment.",
      "Effect on the favoured group: higher wages and employment than their MRP justifies.",
      "Effect on the firm: it is not hiring the most productive workers, so its costs are higher than they need to be.",
      "Effect on the economy: labour is misallocated, so output is below potential."
    ],
    diagram: "Two labour market diagrams: the discriminated group with demand shifted left, giving a lower wage and employment, and the favoured group with demand shifted right.",
    evaluation: [
      "Competitive pressure should erode discrimination over time, since discriminating firms have higher costs, but in practice it persists.",
      "Legislation addresses direct discrimination more easily than the structural kind."
    ]
  },

  "eco3-6-1": {
    summary: "Competition policy exists to stop market power being used against consumers.",
    points: [
      "Competition policy: controlling mergers, monopolies, restrictive practices and cartels. In the UK this is the Competition and Markets Authority.",
      "Price regulation of natural monopolies: RPI-X caps, forcing real price falls and an incentive to cut costs.",
      "Quality regulation and performance targets where price competition is absent.",
      "Promoting small business, deregulation to lower barriers to entry, and privatisation to introduce competition.",
      "Protecting suppliers and employees: the Groceries Code Adjudicator, minimum wage, and employment law."
    ],
    evaluation: [
      "Regulation requires information the regulator does not have, particularly about the firm's true costs.",
      "Setting X too high risks underinvestment; too low and the firm keeps excess profit."
    ]
  },

  "eco3-6-2": {
    summary: "Intervention in markets has its own failure modes.",
    points: [
      "REGULATORY CAPTURE: the regulator comes to act in the industry's interest rather than the consumer's, through dependence on the firm for information and staff moving between the two.",
      "Asymmetric information: the firm knows its costs, the regulator does not, so caps are set wrong.",
      "Administrative and compliance costs, borne ultimately by consumers.",
      "Unintended consequences: capping prices can reduce investment and quality."
    ],
    evaluation: [
      "The case for intervention has to be that the market failure is larger than the government failure it risks.",
      "This is the standard evaluation paragraph for any Theme 3 intervention question."
    ]
  },

  /* ================= THEME 4 ================= */

  "eco4-1-1": {
    summary: "Globalisation is the increasing integration of economies through trade, capital, labour and information.",
    points: [
      "Characteristics: rising trade as a share of GDP, growth of TNCs, international financial flows, migration, and the spread of technology and culture.",
      "Causes: containerisation and cheaper transport, ICT and the internet, trade liberalisation through the WTO, deregulation of financial markets, the growth of TNCs, and the collapse of communism opening new markets.",
      "Winners: consumers get lower prices and more choice, TNCs get larger markets and cheaper inputs, and emerging economies gain employment and technology transfer.",
      "Losers: workers in industries facing import competition, countries left switched off, and the environment."
    ],
    terms: [
      { term: "Globalisation", def: "The increasing economic integration and interdependence of countries" }
    ],
    evaluation: [
      "Globalisation has reduced inequality BETWEEN countries while often widening it WITHIN them, which explains the political backlash.",
      "The environmental cost is external to the trade decisions that cause it, so it is a classic externality."
    ]
  },

  "eco4-1-2": {
    summary: "Countries gain from trade by specialising where their opportunity cost is lowest.",
    points: [
      "ABSOLUTE advantage: producing more of a good with the same resources.",
      "COMPARATIVE advantage: producing at a lower OPPORTUNITY COST. This, not absolute advantage, is what drives gains from trade.",
      "A country can have an absolute advantage in everything and still gain by specialising where its comparative advantage lies.",
      "Method: build the output table, work out the opportunity cost of one good in terms of the other for each country, and the lower opportunity cost has the comparative advantage.",
      "Gains: higher world output, lower prices, greater variety, economies of scale from larger markets.",
      "Assumptions: no transport costs, perfect factor mobility within countries, constant returns to scale, no trade barriers, and only two countries and two goods."
    ],
    diagram: "Two-country, two-good output table. Below it, opportunity cost ratios for each country. Show the terms of trade lying between the two ratios so both gain.",
    evaluation: [
      "The assumptions are heroic: transport costs and immobile factors both erode the predicted gains.",
      "Over-specialisation leaves a country exposed if world demand for its one export collapses.",
      "The gains are real at national level but unevenly distributed within the country."
    ]
  },

  "eco4-1-3": {
    summary: "Terms of trade measure export prices relative to import prices.",
    points: [
      "Terms of trade = (index of export prices / index of import prices) x 100.",
      "An IMPROVEMENT means export prices rise relative to import prices, so a given volume of exports buys more imports.",
      "Influences: relative inflation rates, exchange rates, productivity, and world demand for the country's exports.",
      "Primary product dependency means volatile terms of trade, because commodity prices swing."
    ],
    evaluation: [
      "An improvement is not always good: if it came from a stronger currency, competitiveness has fallen and export volumes may drop.",
      "The Prebisch-Singer hypothesis argues primary exporters face declining terms of trade over the long run, which links to Theme 4.3."
    ]
  },

  "eco4-1-4": {
    summary: "Trading blocs remove barriers between members, which creates trade and diverts it.",
    points: [
      "Free trade area: no internal tariffs, but each member keeps its own external tariff.",
      "Customs union: no internal tariffs plus a COMMON external tariff.",
      "Common market: a customs union plus free movement of labour and capital.",
      "Monetary union: a common market plus a shared currency and monetary policy.",
      "TRADE CREATION: consumption shifts from a high-cost domestic producer to a lower-cost member. Welfare improving.",
      "TRADE DIVERSION: consumption shifts from a low-cost non-member to a higher-cost member, because of the tariff. Welfare reducing.",
      "The WTO promotes liberalisation, sets rules and settles disputes."
    ],
    evaluation: [
      "A bloc is welfare improving only if trade creation exceeds trade diversion, which is an empirical question.",
      "Regional blocs may undermine multilateral liberalisation by making members defend their preferences."
    ]
  },

  "eco4-1-5": {
    summary: "Protectionism raises domestic price and output, and costs consumers more than producers gain.",
    points: [
      "TARIFF: a tax on imports. Domestic price rises, domestic output rises, imports fall, government gains revenue, consumers lose surplus, and there is a net welfare loss.",
      "QUOTA: a physical limit on import volume. Same direction as a tariff, but the extra revenue goes to importers rather than government.",
      "SUBSIDY to domestic producers: shifts domestic supply right, so domestic output rises and imports fall, at a cost to taxpayers.",
      "Non-tariff barriers: standards, licensing, administrative delay, and quality regulations.",
      "Arguments for: infant industry protection, preventing dumping, protecting employment, national security, correcting a deficit.",
      "Arguments against: higher prices, misallocated resources, retaliation, and protected industries never becoming competitive."
    ],
    diagram: "Domestic S and D with the world price as a horizontal line. Add the tariff as a higher horizontal line. Mark the fall in imports, the government revenue rectangle, and the two welfare loss triangles either side.",
    evaluation: [
      "Producers and government gain, consumers lose more, so there is a net welfare loss. Distribution is the political point.",
      "The infant industry argument requires the protection to be temporary, which politically it rarely is.",
      "Retaliation can leave everyone worse off, which is the trade war case."
    ]
  },

  "eco4-1-6": {
    summary: "The balance of payments records all transactions with the rest of the world, and always balances.",
    points: [
      "CURRENT account: trade in goods, trade in services, primary income (investment income, wages), secondary income (transfers).",
      "CAPITAL account: small, covering transfers of capital assets.",
      "FINANCIAL account: FDI, portfolio investment, and reserves.",
      "A current account deficit is offset by a financial account surplus: the country is selling assets or borrowing to fund it.",
      "Causes of a deficit: weak competitiveness, a strong currency, high domestic demand sucking in imports, and structural decline in manufacturing.",
      "Reducing a deficit: expenditure REDUCING policies (deflationary fiscal or monetary policy to cut demand for imports) and expenditure SWITCHING policies (depreciation or protectionism to switch demand to domestic goods), plus supply-side policy to raise competitiveness."
    ],
    evaluation: [
      "Expenditure reducing works but at the cost of growth and employment, so it treats the symptom.",
      "Supply-side policy is the only route that fixes the underlying cause, but it is slow.",
      "A deficit financed by long-term FDI is far less risky than one financed by short-term hot money."
    ]
  },

  "eco4-1-7": {
    summary: "Exchange rates move with demand for the currency, and change competitiveness.",
    points: [
      "FLOATING: set by supply and demand for the currency. A rise is an APPRECIATION, a fall a DEPRECIATION.",
      "FIXED: pegged by the central bank, which buys and sells reserves to hold it. A deliberate rise is a REVALUATION, a fall a DEVALUATION.",
      "Managed float: mostly market determined with occasional intervention.",
      "Influences on a floating rate: relative interest rates (hot money flows), relative inflation, the current account, speculation, FDI flows, and central bank intervention.",
      "Effects of a depreciation, remember WIDEC: Weak currency, Imports Dear, Exports Cheap. Exports rise, imports fall, AD rises, growth rises, but imported inflation rises too.",
      "MARSHALL-LERNER: a depreciation only improves the current account if the combined elasticities of demand for exports and imports exceed 1.",
      "J-CURVE: in the short run elasticities are low, so the current account worsens first, then improves as volumes adjust."
    ],
    diagram: "Currency market with the exchange rate on the vertical axis and quantity of the currency on the horizontal, with D and S crossing. Show a rightward demand shift causing appreciation. Separately, a J-curve with the current account on the vertical axis and time on the horizontal.",
    evaluation: [
      "A depreciation raises the cost of imported inputs, so cost push inflation offsets some of the competitiveness gain.",
      "It only works if firms have spare capacity to meet the extra export demand.",
      "The J-curve means the policy looks like it has failed before it works, which matters politically."
    ]
  },

  "eco4-1-8": {
    summary: "Competitiveness is the ability to sell abroad, measured mainly by relative unit labour costs.",
    points: [
      "Relative unit labour costs: wage costs per unit of output compared with competitors. The main measure.",
      "Relative export prices are the other standard measure.",
      "Influences: productivity, wage costs, the exchange rate, regulation and taxation, infrastructure, and investment in skills and technology.",
      "Non-price competitiveness: quality, design, reliability and branding, which matter more for advanced economies.",
      "Consequences of being uncompetitive: a current account deficit, falling output and employment in traded sectors, and lower FDI."
    ],
    evaluation: [
      "Raising productivity is the only route that improves competitiveness without cutting living standards.",
      "Competing on low wages is a race to the bottom that a high-income country cannot win."
    ]
  },

  "eco4-2-1": {
    summary: "Absolute poverty is not having enough to live on. Relative poverty is having much less than others.",
    points: [
      "ABSOLUTE poverty: income below what is needed for basic needs. The World Bank line is a fixed real amount per day.",
      "RELATIVE poverty: income below a proportion of the median in that society, in the UK usually 60 per cent.",
      "Causes of changes in absolute poverty: economic growth, employment, education, conflict, and disease.",
      "Causes of changes in relative poverty: the shape of the income distribution, wage inequality, tax and benefit policy, and unemployment."
    ],
    evaluation: [
      "Absolute poverty can be eliminated; relative poverty cannot fall to zero while any dispersion of income exists.",
      "Growth reduces absolute poverty but can raise relative poverty if the gains go to the top."
    ]
  },

  "eco4-2-2": {
    summary: "Wealth is a stock, income a flow, and wealth is far more unequally distributed.",
    points: [
      "Income is a flow received over time; wealth is a stock of assets held at a point in time.",
      "LORENZ CURVE: cumulative percentage of population on the horizontal axis against cumulative percentage of income on the vertical. The 45 degree line is perfect equality; the further the curve bows away, the greater the inequality.",
      "GINI COEFFICIENT: the area between the line of equality and the Lorenz curve, as a proportion of the whole triangle. 0 is perfect equality, 1 is perfect inequality.",
      "Causes: wage differentials, ownership of capital, inheritance, education access, tax and benefit systems, and discrimination.",
      "Between countries: differences in development, resources, institutions and trade position.",
      "Capitalism concentrates returns on capital, and if the return on capital exceeds growth, wealth inequality widens over time."
    ],
    diagram: "Lorenz curve: cumulative population against cumulative income, with the 45 degree equality line and a bowed curve below it. Shade the area between them as the Gini numerator.",
    evaluation: [
      "Some inequality creates incentives to work, invest and take risks, so zero inequality is not the objective.",
      "Excessive inequality reduces social mobility, damages growth, and concentrates political power.",
      "The Gini is a single number and hides where in the distribution the inequality sits."
    ]
  },

  "eco4-3-1": {
    summary: "Development is broader than income, which is why HDI combines three dimensions.",
    points: [
      "HDI combines: life expectancy at birth (health), mean and expected years of schooling (education), and GNI per capita at PPP (income). Scored 0 to 1.",
      "Advantages: broader than GDP, widely available, easy to compare and track.",
      "Limitations: ignores inequality, environment, political freedom, gender equality and the informal economy; the weighting of the three components is arbitrary.",
      "Other measures: the Inequality-adjusted HDI, the Multidimensional Poverty Index, the Gender Inequality Index, and non-economic indicators such as literacy, infant mortality and access to clean water."
    ],
    evaluation: [
      "Two countries with the same HDI can have very different distributions, which is why the IHDI exists.",
      "No single index captures development; using two or three together is the honest approach."
    ]
  },

  "eco4-3-2": {
    summary: "Development is held back by economic and non-economic barriers, often reinforcing each other.",
    points: [
      "PRIMARY PRODUCT DEPENDENCY: reliance on one or two commodities, exposing the economy to price volatility and declining terms of trade.",
      "SAVINGS GAP and the HARROD-DOMAR model: growth requires investment, investment requires saving, and low incomes mean low saving, so the economy is trapped.",
      "FOREIGN CURRENCY GAP: not enough export earnings to buy needed capital imports.",
      "CAPITAL FLIGHT: savings leaving the country rather than funding domestic investment.",
      "Demographics: a high dependency ratio means fewer workers supporting more people.",
      "Debt: servicing costs divert revenue from health, education and infrastructure.",
      "Poor infrastructure, weak education, and the absence of property rights, which stops assets being used as collateral.",
      "NON-ECONOMIC: corruption, weak institutions, political instability, conflict, and disease."
    ],
    evaluation: [
      "These barriers are interlocking, so single-policy solutions rarely work: this is the poverty trap.",
      "Institutions are increasingly seen as the binding constraint: without them, aid and investment leak away."
    ]
  },

  "eco4-3-3": {
    summary: "Strategies split into market-oriented, interventionist, and other. None works alone.",
    points: [
      "MARKET-ORIENTED: trade liberalisation, promoting FDI, removing subsidies, floating the exchange rate, microfinance, and privatisation.",
      "INTERVENTIONIST: developing human capital, protectionism for infant industries, managed exchange rates, infrastructure investment, promoting joint ventures, and buffer stock schemes.",
      "OTHER: industrialisation and the LEWIS MODEL (moving surplus labour from low-productivity agriculture into manufacturing), developing tourism, developing primary industries, fair trade schemes, aid, and debt relief.",
      "Aid types: bilateral, multilateral, tied and untied. Tied aid benefits the donor and is widely criticised."
    ],
    evaluation: [
      "The right strategy depends on the binding constraint: infrastructure spending achieves little where corruption is the real barrier.",
      "Market-oriented strategies risk widening inequality; interventionist ones risk government failure and corruption.",
      "Aid can create dependency and prop up bad governments, but works well when targeted at health and education.",
      "Name the country and the constraint: unspecific strategy lists do not reach the top band."
    ]
  },

  "eco4-4-1": {
    summary: "Financial markets channel savings into investment and let risk be priced and traded.",
    points: [
      "Roles: facilitating saving, lending to businesses and individuals, allowing the exchange of goods and services, providing forward markets, and providing a market for equities.",
      "MONEY market: short-term borrowing and lending, under a year.",
      "CAPITAL market: long-term finance through bonds and shares.",
      "FOREIGN EXCHANGE market: trading currencies.",
      "Forward markets let firms hedge against future price or currency movements, reducing risk."
    ],
    evaluation: [
      "A functioning financial sector is necessary for growth: the savings gap in Theme 4.3 is partly a financial market failure."
    ]
  },

  "eco4-4-2": {
    summary: "The financial sector fails in all the standard ways, and the consequences are systemic.",
    points: [
      "ASYMMETRIC INFORMATION: borrowers know their own risk better than lenders, giving adverse selection.",
      "MORAL HAZARD: being insured or bailed out changes behaviour, so banks take risks they would not otherwise take.",
      "EXTERNALITIES: a bank failure imposes costs on the whole economy, not just its shareholders. This is the systemic risk that justifies bailouts.",
      "SPECULATION AND BUBBLES: asset prices rise because people expect them to rise, detaching from fundamentals, until confidence breaks and they collapse.",
      "MARKET RIGGING: collusion to manipulate prices or rates, as with LIBOR.",
      "2008 applies all of these: subprime lending (asymmetric information), securitisation hiding risk, too big to fail (moral hazard), a housing bubble, and systemic externalities."
    ],
    evaluation: [
      "Bailouts stop the immediate externality but confirm the moral hazard, making the next crisis more likely.",
      "Regulation raises costs and can push risk into the unregulated shadow banking sector rather than removing it."
    ]
  },

  "eco4-4-3": {
    summary: "Central banks run monetary policy, bank for the government and banks, and regulate.",
    points: [
      "IMPLEMENTING MONETARY POLICY: setting the base rate and conducting quantitative easing to hit the inflation target.",
      "BANKER TO THE GOVERNMENT: managing the government's accounts and its debt issuance.",
      "BANKER TO THE BANKS and LENDER OF LAST RESORT: lending to solvent banks facing a liquidity crisis, to stop a run becoming a collapse.",
      "REGULATION: setting capital and liquidity requirements, and stress testing, done in the UK by the Prudential Regulation Authority and the Financial Policy Committee."
    ],
    evaluation: [
      "Lender of last resort is exactly the function that creates moral hazard, so the two roles pull against each other.",
      "Independence gives credibility on inflation but leaves an unelected body making distributional decisions."
    ]
  },

  "eco4-5-1": {
    summary: "Public spending splits three ways, and its size relative to GDP is the political question.",
    points: [
      "CAPITAL expenditure: investment in long-lived assets such as roads, schools and hospitals.",
      "CURRENT expenditure: day-to-day running costs, including public sector wages.",
      "TRANSFER payments: benefits and pensions, where no good or service is received in return, so they are not part of G in AD.",
      "Changing composition over time: ageing populations raise pension and health spending; debt interest rises with the debt.",
      "Effects of the size of public spending: on productivity and growth, on crowding out, on equality, and on the level of taxation required."
    ],
    evaluation: [
      "CROWDING OUT: government borrowing raises interest rates and displaces private investment. Contested, and weakest when there is spare capacity.",
      "CROWDING IN: public investment in infrastructure can raise the return on private investment.",
      "Capital spending raises LRAS; current spending mostly raises AD."
    ]
  },

  "eco4-5-2": {
    summary: "Taxes are progressive, proportional or regressive by the SHARE of income they take.",
    points: [
      "PROGRESSIVE: the proportion of income paid RISES with income. UK income tax.",
      "PROPORTIONAL: the same proportion at all incomes. A flat tax.",
      "REGRESSIVE: the proportion FALLS as income rises. VAT and most indirect taxes, because the poor spend a larger share of income.",
      "Direct taxes are on income and wealth; indirect taxes are on spending.",
      "Effects of changing tax rates: on incentives to work and invest, on income distribution, on output and employment through AD, on the price level, and on the trade balance through import demand.",
      "LAFFER CURVE: tax revenue rises with the rate up to a point, then falls as disincentives, avoidance and evasion take over."
    ],
    diagram: "Laffer curve: tax rate on the horizontal axis, tax revenue on the vertical, an inverted U peaking at some rate T*. Mark that revenue is zero at both 0 and 100 per cent.",
    evaluation: [
      "A tax being regressive is about the PROPORTION of income, not the amount. This is the most common error in the topic.",
      "Nobody knows where the Laffer peak is, so it is used to justify cuts without evidence.",
      "The incentive effect of income tax cuts is empirically small, because the income and substitution effects pull in opposite directions."
    ]
  },

  "eco4-5-3": {
    summary: "The deficit is a yearly flow, the debt is the accumulated stock. They are not the same.",
    points: [
      "A fiscal DEFICIT is the annual excess of spending over revenue. The national DEBT is the total stock of borrowing outstanding.",
      "A falling deficit still ADDS to the debt: only a surplus reduces it.",
      "CYCLICAL deficit: the part caused by the economic cycle, which disappears in recovery.",
      "STRUCTURAL deficit: the part that remains at full employment, which requires policy to remove.",
      "AUTOMATIC STABILISERS: in a recession, tax revenue falls and benefit spending rises without any decision being taken, cushioning the fall in AD. DISCRETIONARY policy is a deliberate change.",
      "Influences on size: the cycle, demographics, the level of interest rates, and political choices."
    ],
    evaluation: [
      "The significance of debt depends on the interest rate relative to growth: if growth exceeds the interest rate, the debt to GDP ratio falls without a surplus.",
      "Cutting a cyclical deficit in a recession worsens the recession and can raise the deficit, which is the austerity debate.",
      "Debt owed domestically in your own currency is far less risky than foreign currency debt."
    ]
  },

  "eco4-5-4": {
    summary: "Policy in an open economy has to cope with shocks it did not cause and cannot control.",
    points: [
      "Responding to external shocks: fiscal and monetary policy to support demand, supply-side policy to rebuild competitiveness, exchange rate policy, and direct controls such as price or capital controls.",
      "Measures to reduce fiscal deficits: raising taxes, cutting spending, and raising growth so revenue rises.",
      "Measures to reduce poverty and inequality: progressive taxation, benefits, minimum wages, and investment in education and health.",
      "Policies for developing economies: those in Theme 4.3, chosen against the binding constraint.",
      "PROBLEMS FACING POLICYMAKERS: inaccurate information, risks and uncertainties, and the inability to control external shocks."
    ],
    evaluation: [
      "Data are revised heavily after the event, so policy is set on figures that later turn out to be wrong.",
      "In a globalised economy, capital flows and commodity prices are outside national control, which limits what any single government can achieve.",
      "This subtopic is where Paper 3 synoptic questions usually land, so link it back to Themes 1 to 3."
    ]
  },

  /* ================= EXAM SKILLS ================= */

  "eco5-1-1": {
    summary: "The command word tells you what the mark scheme is looking for. Answer the one that is there.",
    points: [
      "IDENTIFY / STATE (1 to 2 marks): name it. No explanation needed and none rewarded.",
      "CALCULATE (2 to 4): show the working. Method marks are available even when the final answer is wrong.",
      "EXPLAIN (4 to 5): one point developed with a chain of reasoning, usually with a diagram.",
      "ANALYSE (6 to 10): develop chains of reasoning. Knowledge, application and analysis only, NO evaluation needed.",
      "ASSESS / EVALUATE / DISCUSS / TO WHAT EXTENT (12, 15, 20, 25): analysis AND a supported judgement. Evaluation is roughly half the marks.",
      "Rough split on an extended answer: KAA (knowledge, application, analysis) about 60 per cent, evaluation about 40 per cent."
    ],
    evaluation: [
      "Writing evaluation on an ANALYSE question earns nothing and costs time.",
      "Writing no evaluation on an ASSESS question caps you at roughly half marks, whatever the analysis is like."
    ]
  },

  "eco5-1-2": {
    summary: "A chain of analysis is a sequence where each step causes the next, and every link is stated.",
    points: [
      "The shape: point, then because, then which means, then therefore, then in context.",
      "Each arrow in your head must become words on the page. The mark is for the link, not the endpoints.",
      "Worked example: an indirect tax raises costs of production, so supply shifts left, so equilibrium price rises and quantity falls, so consumption of the demerit good falls, so the external cost falls towards the social optimum.",
      "Depth beats breadth: two developed chains score better than six undeveloped assertions.",
      "Use the diagram as part of the chain, and refer to it explicitly in the text."
    ],
    evaluation: [
      "The single most common reason strong students underperform is listing points rather than developing two of them."
    ]
  },

  "eco5-1-3": {
    summary: "Evaluation is judgement with reasons, not a list of both sides.",
    points: [
      "MAGNITUDE: how big is the effect? A tax on an inelastic good barely changes quantity.",
      "TIME FRAME: short run against long run. Supply-side policy does nothing this year.",
      "ELASTICITY: almost every micro evaluation runs through elasticity.",
      "ASSUMPTIONS: which assumption is the analysis resting on, and what if it fails? Ceteris paribus rarely holds.",
      "COUNTERFACTUAL: what would have happened anyway, without the policy?",
      "STAKEHOLDERS: who gains and who loses, and does that matter for the objective?",
      "Finish with a judgement that says which consideration dominates and WHY, not merely that it depends."
    ],
    evaluation: [
      "'It depends' with no statement of what it depends on scores nothing.",
      "A judgement in the introduction, sustained through the answer, tends to score higher than one bolted on at the end."
    ]
  },

  "eco5-1-4": {
    summary: "The extract is there to be used. Quoting figures and applying theory to them is the application mark.",
    points: [
      "Quote specific figures from the extract, and manipulate them: calculate a percentage change rather than repeating the number.",
      "Reference the extract explicitly, by line or by name, so the application is unmistakable.",
      "Apply theory to THIS context, not in general: name the market, firm or country in the extract.",
      "Do not simply describe what the extract says. Describing is not applying.",
      "Bring in your own knowledge as well: the best answers combine extract evidence with wider examples."
    ],
    evaluation: [
      "An answer that would read identically without the extract has thrown away the application marks."
    ]
  },

  "eco5-1-5": {
    summary: "A diagram earns marks only if it is accurate, labelled, and explained in the text.",
    points: [
      "Label BOTH axes with the correct variables, and every curve.",
      "Show the original equilibrium, then the shift with an arrow, then the new equilibrium, labelled P1 Q1.",
      "Shade and label any area the question depends on: welfare loss, tax revenue, surplus, profit.",
      "Then EXPLAIN it in the text. An unexplained diagram earns almost nothing.",
      "Draw them large enough to label clearly, and in pen."
    ],
    keyList: {
      title: "Diagrams worth being able to draw without thinking",
      items: [
        "Supply and demand with a shift",
        "Indirect tax and subsidy, with incidence",
        "Negative production and positive consumption externality, with welfare loss",
        "Maximum and minimum price",
        "AD/AS, both classical and Keynesian LRAS",
        "Cost and revenue curves for each market structure",
        "Labour market, including monopsony and minimum wage",
        "Tariff diagram with welfare areas",
        "Lorenz curve, Laffer curve, J-curve, Phillips curve"
      ]
    },
    evaluation: [
      "A wrong diagram costs more than no diagram, because it contradicts the text."
    ]
  },

  "eco5-2-1": {
    summary: "Quantitative skills are a guaranteed share of the marks and the easiest to secure.",
    points: [
      "PERCENTAGE CHANGE = (new − old) / old x 100. Distinct from PERCENTAGE POINTS: a rise from 4 to 6 per cent is 2 percentage points but a 50 per cent increase.",
      "INDEX NUMBERS: value / base value x 100. The base year is always 100.",
      "REAL from NOMINAL: real value = nominal / price index x 100.",
      "ELASTICITIES: %ΔQ / %ΔP, or the income or cross-price version. Report the sign and interpret it.",
      "MULTIPLIER = 1 / (1 − MPC) or 1 / (MPS + MPT + MPM).",
      "GINI COEFFICIENT from a Lorenz curve, and reading the curve correctly.",
      "Always INTERPRET the figure you calculate: what does it mean in this context?"
    ],
    evaluation: [
      "Correlation is not causation. If the extract shows two variables moving together, say what else could explain it.",
      "A calculated figure with no interpretation earns the calculation mark and nothing more."
    ]
  }
};
