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
  }
};
