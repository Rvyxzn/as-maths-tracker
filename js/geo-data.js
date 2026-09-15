/* ============================================================
   Edexcel A level Geography (9GE0), topic-by-topic database
   ------------------------------------------------------------
   Structured as the specification is: each topic splits into
   numbered Enquiry Questions, and each EQ into its key ideas.
   Exam-Focus works at the EQ level, normal mode at the key-idea
   level, matching how the content is actually taught.

   ASSESSMENT
   Paper 1  Physical: Topics 1, 2, 5, 6      2h15  105 marks  30%
   Paper 2  Human:    Topics 3, 4, 7, 8      2h15  105 marks  30%
   Paper 3  Synoptic investigation           2h15   70 marks  20%
   NEA      Independent Investigation                          20%

   TOPICS KEPT
   The four topics you sit: Physical (Tectonics, Coasts) and Human
   (Globalisation, Regenerating Places). Coasts is three EQs, with
   coastal management filed under EQ3.

   NO LEARNING RESOURCES YET
   No videos or question banks are attached. RAG rating, the
   planner, Exam-Focus and past papers all work; add your own
   links and questions per topic as you find them.
   ============================================================ */

const GEO_SPEC = [
{
  id: "geo-t1", paper: "Tectonics", short: "T1", group: "Physical",
  name: "Tectonic Processes & Hazards",
  code: "9GE0/01", book: "Physical geography, Paper 1",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Physical, Paper 1 Section A. Sat alongside Coasts.",
  sections: [
    { id: "geo1-1", num: "1.1", name: "EQ1: Why are some locations more at risk from tectonic hazards?",
      desc: "Global distribution, plate tectonic theory, boundary types and the physical processes behind each hazard.",
      subs: [
        { id: "geo1-1-1", code: "1.1.1", name: "Global distribution of tectonic hazards", importance: 4, reqs: [
          "Describe the global distribution of earthquakes, volcanoes and tsunamis",
          "Link the distribution to plate boundaries, hot spots and the Pacific Ring of Fire",
          "Understand that distribution alone does not explain risk" ]},
        { id: "geo1-1-2", code: "1.1.2", name: "Plate tectonic theory", importance: 4, reqs: [
          "Explain the structure of the Earth and the difference between oceanic and continental crust",
          "Explain convection currents, slab pull and ridge push as drivers of plate movement",
          "Understand palaeomagnetism and sea floor spreading as evidence" ]},
        { id: "geo1-1-3", code: "1.1.3", name: "Plate boundaries and their landforms", importance: 5, reqs: [
          "Describe the processes and landforms at divergent, convergent and conservative boundaries",
          "Explain why earthquake magnitude and depth vary between boundary types",
          "Explain the formation of Benioff zones, ocean trenches, fold mountains and rift valleys",
          "Explain intra-plate hot spot volcanism" ]},
        { id: "geo1-1-4", code: "1.1.4", name: "Physical processes and hazard characteristics", importance: 5, reqs: [
          "Explain the causes of primary hazards: ground shaking, lava flows, pyroclastic flows, ash falls, gas eruptions",
          "Explain secondary hazards: liquefaction, landslides, tsunamis, lahars",
          "Compare hazard magnitude, speed of onset, areal extent and duration" ]}
      ]},
    { id: "geo1-2", num: "1.2", name: "EQ2: Why do some tectonic hazards develop into disasters?",
      desc: "Vulnerability, resilience, hazard profiles and the role of governance and development.",
      subs: [
        { id: "geo1-2-1", code: "1.2.1", name: "Disaster risk and vulnerability", importance: 5, reqs: [
          "Use the risk equation: risk = hazard x vulnerability / capacity to cope",
          "Explain Degg's model of hazard, disaster and vulnerability",
          "Distinguish a hazard from a disaster and understand why the threshold varies" ]},
        { id: "geo1-2-2", code: "1.2.2", name: "Hazard profiles", importance: 4, reqs: [
          "Construct and interpret a hazard profile using magnitude, duration, speed of onset, areal extent, spatial predictability and frequency",
          "Use profiles to compare two contrasting tectonic events" ]},
        { id: "geo1-2-3", code: "1.2.3", name: "Development, governance and inequality", importance: 5, reqs: [
          "Explain how level of development affects vulnerability and resilience",
          "Explain the role of governance, corruption, building codes and planning",
          "Explain why an event of similar magnitude produces very different death tolls in contrasting countries" ]},
        { id: "geo1-2-4", code: "1.2.4", name: "Trends and patterns in tectonic disasters", importance: 3, reqs: [
          "Describe trends in disaster frequency, deaths and economic losses over time",
          "Explain why recorded frequency has risen while death rates have generally fallen",
          "Explain the significance of mega-disasters and multiple-hazard zones" ]}
      ]},
    { id: "geo1-3", num: "1.3", name: "EQ3: How successful is the management of tectonic hazards?",
      desc: "The hazard management cycle, prediction and monitoring, and strategies to reduce impact.",
      subs: [
        { id: "geo1-3-1", code: "1.3.1", name: "Hazard management frameworks", importance: 4, reqs: [
          "Explain the hazard management cycle: mitigation, preparedness, response, recovery",
          "Explain Park's model of disaster response and interpret its curve",
          "Compare the response curves of contrasting events" ]},
        { id: "geo1-3-2", code: "1.3.2", name: "Prediction, forecasting and monitoring", importance: 4, reqs: [
          "Explain why volcanic eruptions can be predicted but earthquakes generally cannot",
          "Explain monitoring techniques: seismometers, gas emissions, ground deformation, tiltmeters",
          "Explain the role of early warning systems, including tsunami warning networks" ]},
        { id: "geo1-3-3", code: "1.3.3", name: "Strategies to modify the event, vulnerability and loss", importance: 5, reqs: [
          "Explain strategies that modify the event: lava diversion, land use zoning",
          "Explain strategies that modify vulnerability: education, preparedness, building design",
          "Explain strategies that modify loss: aid, insurance, emergency response",
          "Evaluate the relative success of these approaches in contrasting contexts" ]}
      ]}
  ]
},
{
  id: "geo-t2b", paper: "Coasts", short: "T2B", group: "Physical",
  name: "Coastal Landscapes & Change",
  code: "9GE0/01", book: "Physical geography, Paper 1 (option 2B)",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Paper 1 Section B. The coasts option; sat alongside Tectonics.",
  sections: [
    { id: "geo2-1", num: "2.1", name: "EQ1: Why are coastal landscapes different and what processes cause these differences?",
      desc: "The littoral zone, coastal classification, geological structure and lithology.",
      subs: [
        { id: "geo2-1-1", code: "2.1.1", name: "The littoral zone and coastal classification", importance: 4, reqs: [
          "Describe the zones of the littoral zone: backshore, foreshore, inshore, offshore",
          "Classify coasts as rocky or coastal plain, high or low energy, primary or secondary",
          "Explain how classification affects the landforms found" ]},
        { id: "geo2-1-2", code: "2.1.2", name: "Geological structure and lithology", importance: 5, reqs: [
          "Explain concordant and discordant coastlines and the landforms of each",
          "Explain how lithology and rock strength affect the rate of erosion",
          "Explain the influence of faults, joints, bedding planes and dip on cliff profiles",
          "Explain the formation of Dalmatian and haff coastlines" ]},
        { id: "geo2-1-3", code: "2.1.3", name: "Vegetation and coastal stability", importance: 3, reqs: [
          "Explain the role of vegetation in stabilising coastal sediment",
          "Describe plant succession in a psammosere and a halosere",
          "Explain how salt marsh and sand dune vegetation modify the coast" ]}
      ]},
    { id: "geo2-2", num: "2.2", name: "EQ2: How do characteristic coastal landforms contribute to coastal landscapes?",
      desc: "Waves, tides, sediment cells, and the erosional and depositional landforms they produce.",
      subs: [
        { id: "geo2-2-1", code: "2.2.1", name: "Waves, tides and sediment cells", importance: 5, reqs: [
          "Explain wave formation, fetch, and the difference between constructive and destructive waves",
          "Explain tidal range and its effect on the coast",
          "Explain the sediment cell concept and sediment budgets as a dynamic equilibrium" ]},
        { id: "geo2-2-2", code: "2.2.2", name: "Erosion processes and landforms", importance: 5, reqs: [
          "Explain hydraulic action, abrasion, attrition and solution",
          "Explain wave refraction and its effect on headlands and bays",
          "Explain the formation of wave cut platforms, caves, arches, stacks and stumps" ]},
        { id: "geo2-2-3", code: "2.2.3", name: "Transport and depositional landforms", importance: 5, reqs: [
          "Explain longshore drift, traction, saltation, suspension and solution",
          "Explain the formation of beaches, spits, bars, tombolos and cuspate forelands",
          "Explain the conditions required for deposition" ]},
        { id: "geo2-2-4", code: "2.2.4", name: "Subaerial processes", importance: 4, reqs: [
          "Explain mechanical, chemical and biological weathering at the coast",
          "Explain mass movement: rockfall, slumping, landslides and soil creep",
          "Explain how subaerial processes interact with marine erosion to shape cliff profiles" ]}
      ]},
    { id: "geo2-3", num: "2.3", name: "EQ3: How do coastal erosion and sea level change alter coastlines, increase risks, and how can they be managed?",
      desc: "Sea level change, rapid retreat and flood risk, then hard and soft engineering, ICZM and the players.",
      subs: [
        { id: "geo2-3-1", code: "2.3.1", name: "Sea level change", importance: 5, reqs: [
          "Distinguish eustatic from isostatic sea level change and explain the causes of each",
          "Explain the landforms of emergent coasts: raised beaches, marine terraces, relict cliffs",
          "Explain the landforms of submergent coasts: rias, fjords and Dalmatian coasts" ]},
        { id: "geo2-3-2", code: "2.3.2", name: "Rapid coastal retreat", importance: 4, reqs: [
          "Explain the physical factors causing rapid retreat: lithology, fetch, wave energy",
          "Explain how human actions such as dredging and dam building accelerate retreat",
          "Explain the significance of sediment starvation" ]},
        { id: "geo2-3-3", code: "2.3.3", name: "Coastal flooding and climate change", importance: 5, reqs: [
          "Explain the causes of coastal flooding, including storm surges and depressions",
          "Explain the increased risk from climate change and thermal expansion",
          "Explain why low-lying and developing coastal areas are most vulnerable",
          "Explain the economic and social consequences of coastal flooding" ]},
        { id: "geo2-3-4", code: "2.3.4", name: "Hard and soft engineering", importance: 5, reqs: [
          "Describe hard engineering: sea walls, groynes, rip rap, revetments, offshore breakwaters",
          "Describe soft engineering: beach nourishment, dune stabilisation, managed realignment",
          "Evaluate the costs, benefits and sustainability of each approach" ]},
        { id: "geo2-3-5", code: "2.3.5", name: "Sustainable management and ICZM", importance: 4, reqs: [
          "Explain Integrated Coastal Zone Management and Shoreline Management Plans",
          "Explain the four SMP policy options: hold the line, advance the line, managed realignment, no active intervention",
          "Explain cost-benefit analysis in coastal decision making" ]},
        { id: "geo2-3-6", code: "2.3.6", name: "Players and conflict", importance: 4, reqs: [
          "Identify the players: residents, businesses, councils, environmental groups, national government",
          "Explain why coastal management creates winners and losers",
          "Explain how a decision in one place can increase erosion further along the coast" ]}
      ]}
  ]
},
{
  id: "geo-t3", paper: "Globalisation", short: "T3", group: "Human",
  name: "Globalisation",
  code: "9GE0/02", book: "Human geography, Paper 2",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Human, Paper 2 Section A. Sat alongside Regenerating Places.",
  sections: [
    { id: "geo3-1", num: "3.1", name: "EQ1: What are the causes of globalisation and why has it accelerated?",
      desc: "Transport and communication, global institutions, and the switched-off world.",
      subs: [
        { id: "geo3-1-1", code: "3.1.1", name: "Defining and measuring globalisation", importance: 4, reqs: [
          "Define globalisation and describe the lengthening and deepening of connections",
          "Explain flows of capital, labour, products, services and information",
          "Interpret the KOF index and the AT Kearney index" ]},
        { id: "geo3-1-2", code: "3.1.2", name: "Causes and accelerators", importance: 5, reqs: [
          "Explain the role of transport and containerisation, and time-space compression",
          "Explain the role of ICT, mobile phones and the internet",
          "Explain the role of IGOs: the IMF, World Bank and WTO",
          "Explain trade blocs, FDI, deregulation and free market liberalisation" ]},
        { id: "geo3-1-3", code: "3.1.3", name: "The switched-off world", importance: 4, reqs: [
          "Explain why some places are more connected than others",
          "Explain physical, political and economic reasons for being switched off",
          "Explain the consequences of remaining unconnected" ]}
      ]},
    { id: "geo3-2", num: "3.2", name: "EQ2: What are the impacts of globalisation?",
      desc: "Winners and losers, migration, cultural change and environmental cost.",
      subs: [
        { id: "geo3-2-1", code: "3.2.1", name: "Winners and losers", importance: 5, reqs: [
          "Explain how globalisation has restructured economies and shifted manufacturing",
          "Explain the growth of megacities and rural-urban migration",
          "Explain widening income inequality within and between countries" ]},
        { id: "geo3-2-2", code: "3.2.2", name: "Cultural and social impacts", importance: 4, reqs: [
          "Explain cultural diffusion, cultural erosion and westernisation",
          "Explain the significance of glocalisation and cultural hybridity",
          "Explain the impacts of migration on both source and host societies" ]},
        { id: "geo3-2-3", code: "3.2.3", name: "Environmental impacts", importance: 4, reqs: [
          "Explain the environmental cost of global production and transport",
          "Explain the significance of ecological footprints and food miles",
          "Explain the export of waste and pollution to lower income countries" ]}
      ]},
    { id: "geo3-3", num: "3.3", name: "EQ3: What are the consequences and how should players respond?",
      desc: "Development gaps, measuring progress, and ethical and sustainable responses.",
      subs: [
        { id: "geo3-3-1", code: "3.3.1", name: "Measuring development and inequality", importance: 4, reqs: [
          "Compare economic and social measures of development, including HDI and the Gini coefficient",
          "Explain trends in global inequality",
          "Explain the limitations of single measures" ]},
        { id: "geo3-3-2", code: "3.3.2", name: "Tensions and cultural identity", importance: 4, reqs: [
          "Explain the rise of anti-globalisation and nationalist movements",
          "Explain attempts to control the spread of global culture",
          "Explain the significance of local resistance" ]},
        { id: "geo3-3-3", code: "3.3.3", name: "Ethical and sustainable responses", importance: 4, reqs: [
          "Explain the role of ethical consumption, fair trade and local sourcing",
          "Explain the role of recycling, the circular economy and transition towns",
          "Evaluate the effectiveness of these responses" ]}
      ]}
  ]
},
{
  id: "geo-t4a", paper: "Regenerating Places", short: "T4A", group: "Human",
  name: "Regenerating Places",
  code: "9GE0/02", book: "Human geography, Paper 2 (option 4A)",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Human, Paper 2 Section B. Sat alongside Globalisation.",
  sections: [
    { id: "geo4-1", num: "4.1", name: "EQ1: How and why do places vary?",
      desc: "Economic function, employment structure and how places are connected and perceived.",
      subs: [
        { id: "geo4-1-1", code: "4.1.1", name: "Economy and employment structure", importance: 4, reqs: [
          "Explain the primary, secondary, tertiary and quaternary sectors and the Clark-Fisher model",
          "Explain how employment type affects income, health and education",
          "Explain differences between urban and rural places" ]},
        { id: "geo4-1-2", code: "4.1.2", name: "Function, connectedness and change", importance: 4, reqs: [
          "Explain how past and present connections shape a place's function",
          "Explain the role of regional, national and international influences",
          "Explain how demographic and cultural characteristics vary between places" ]},
        { id: "geo4-1-3", code: "4.1.3", name: "Perceptions and lived experience", importance: 4, reqs: [
          "Distinguish insider from outsider perspectives on a place",
          "Explain how age, gender, ethnicity and length of residence shape attachment",
          "Explain how media representation shapes perception of a place" ]}
      ]},
    { id: "geo4-2", num: "4.2", name: "EQ2: Why might regeneration be needed?",
      desc: "Measuring need, deprivation, deindustrialisation and priorities for regeneration.",
      subs: [
        { id: "geo4-2-1", code: "4.2.1", name: "Measuring the need for regeneration", importance: 5, reqs: [
          "Use statistical evidence: the Index of Multiple Deprivation, employment, income, health, education",
          "Use qualitative evidence: interviews, photographs, oral histories",
          "Explain the strengths and limitations of each type of evidence" ]},
        { id: "geo4-2-2", code: "4.2.2", name: "Causes of decline", importance: 5, reqs: [
          "Explain deindustrialisation and the loss of primary and secondary employment",
          "Explain the cycle of deprivation and the spiral of decline",
          "Explain rural decline, out-migration and the loss of services" ]},
        { id: "geo4-2-3", code: "4.2.3", name: "Conflicting priorities", importance: 4, reqs: [
          "Explain why different groups disagree about whether regeneration is needed",
          "Explain the tension between economic growth and community identity",
          "Explain the significance of engagement and lived experience in decision making" ]}
      ]},
    { id: "geo4-3", num: "4.3", name: "EQ3: How is regeneration managed?",
      desc: "The roles of national government, local government and other players.",
      subs: [
        { id: "geo4-3-1", code: "4.3.1", name: "National government policy", importance: 4, reqs: [
          "Explain infrastructure investment, planning laws and deregulation",
          "Explain policies on migration, house building and international investment",
          "Explain the role of major projects such as transport schemes" ]},
        { id: "geo4-3-2", code: "4.3.2", name: "Local players and rebranding", importance: 4, reqs: [
          "Explain the role of local councils, LEPs and Enterprise Zones",
          "Explain rebranding, reimaging and place marketing",
          "Explain the role of sport, culture, heritage and retail-led regeneration" ]},
        { id: "geo4-3-3", code: "4.3.3", name: "Players and conflict in regeneration", importance: 4, reqs: [
          "Identify the players: government, developers, businesses, residents, pressure groups",
          "Explain why regeneration produces winners and losers",
          "Explain the significance of gentrification and displacement" ]}
      ]},
    { id: "geo4-4", num: "4.4", name: "EQ4: How successful is regeneration?",
      desc: "Evaluating outcomes against economic, social and environmental measures.",
      subs: [
        { id: "geo4-4-1", code: "4.4.1", name: "Measuring success", importance: 5, reqs: [
          "Use economic measures: income, employment, poverty rates",
          "Use social measures: demographic change, health, education, deprivation indices",
          "Use environmental measures: pollution, derelict land, air quality" ]},
        { id: "geo4-4-2", code: "4.4.2", name: "Evaluating outcomes", importance: 5, reqs: [
          "Explain why different groups judge success differently",
          "Explain the difference between short term and long term outcomes",
          "Reach a supported judgement on the success of a regeneration scheme you have studied" ]}
      ]}
  ]
}
];

/* Exam-Focus data for Geography, keyed by Enquiry Question. Weights are an
   editorial ordering built from the assessment structure and the recurring
   question patterns, not a measured frequency. */
const GEO_EXAM_FOCUS = {
  "geo1-1": { weight: 4, marks: "Typically 4 to 12 marks",
    summary: "Foundational. Distribution and boundary processes are usually short-answer marks, and everything in EQ2 and EQ3 depends on getting the processes right.",
    core: ["Distribution of hazards and its link to boundaries", "Convection, slab pull and ridge push", "Landforms and hazards at each boundary type", "Primary and secondary hazards"],
    traps: ["Describing distribution without linking it to plate boundaries", "Confusing the boundary types and their landforms"] },
  "geo1-2": { weight: 5, marks: "Typically 12 to 20 marks, a common extended question",
    summary: "Where the marks are. Examiners want vulnerability and governance, not magnitude, as the explanation for why a hazard becomes a disaster.",
    core: ["Risk equation and Degg's model", "Hazard profiles for comparing events", "Development, governance and building codes", "Trends in deaths against economic losses"],
    traps: ["Explaining a disaster purely by magnitude", "Comparing two events without a shared framework"] },
  "geo1-3": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Management is the standard evaluation essay. Park's model gives the structure, and 'modify event, vulnerability, loss' gives the categories.",
    core: ["Hazard management cycle and Park's model", "Prediction and monitoring, and why earthquakes resist prediction", "Modify the event, the vulnerability, the loss", "Comparing success in contrasting countries"],
    traps: ["Listing strategies with no judgement", "Claiming earthquakes can be predicted"] },
  "geo2-1": { weight: 4, marks: "Typically 6 to 14 marks",
    summary: "Geology is the underpinning explanation for almost every coastal landform question, so it is worth more than its own mark allocation suggests.",
    core: ["Littoral zone and coastal classification", "Concordant against discordant coasts", "Lithology, structure, dip and cliff profiles", "Vegetation succession and stabilisation"],
    traps: ["Confusing concordant with discordant", "Ignoring geology when explaining differing erosion rates"] },
  "geo2-2": { weight: 5, marks: "Typically 12 to 20 marks, and the most examined EQ in the topic",
    summary: "Landform formation is the bread and butter of Paper 1. Every answer needs named processes in a sequence, not a description of the finished landform.",
    core: ["Constructive and destructive waves, tides, sediment cells", "Erosion processes and the cave-arch-stack-stump sequence", "Longshore drift and depositional landforms", "Weathering and mass movement"],
    traps: ["Describing a landform instead of explaining its formation", "Naming processes without sequencing them", "Forgetting subaerial processes on cliff questions"] },
  "geo2-3": { weight: 5, marks: "Typically 10 to 20 marks, and the usual evaluation essay",
    summary: "Risk and management in one EQ. Sea level change and flood risk connect coasts to climate change; management is where the top-band marks are, and every strategy needs a cost, a winner and a loser.",
    core: ["Eustatic against isostatic change", "Causes of rapid retreat, including sediment starvation", "Storm surges and climate change risk", "Hard against soft engineering, ICZM and SMP options", "Players, winners and losers"],
    traps: ["Mixing up eustatic and isostatic", "Describing defences without evaluating them", "Ignoring the effect further along the coast"] },
  "geo3-1": { weight: 4, marks: "Typically 8 to 15 marks",
    summary: "Causes of globalisation are usually straightforward marks if you can name mechanisms rather than describe outcomes.",
    core: ["Defining and measuring globalisation", "Transport, containerisation, ICT and time-space compression", "IMF, World Bank, WTO, trade blocs, FDI", "The switched-off world"],
    traps: ["Describing effects when asked for causes", "Treating globalisation as purely economic"] },
  "geo3-2": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Winners and losers is the standard framing, and the best answers apply it at more than one scale.",
    core: ["Economic restructuring and the shift of manufacturing", "Megacities and rural-urban migration", "Cultural diffusion, erosion and glocalisation", "Environmental cost and ecological footprints"],
    traps: ["Only discussing benefits", "Staying at one scale throughout"] },
  "geo3-3": { weight: 4, marks: "Typically 10 to 18 marks",
    summary: "The response half of the topic, and where evaluation marks concentrate.",
    core: ["HDI, Gini and the limits of single measures", "Anti-globalisation and nationalism", "Ethical consumption, fair trade, circular economy"],
    traps: ["Listing responses without judging effectiveness"] },
  "geo4-1": { weight: 4, marks: "Typically 8 to 15 marks",
    summary: "Place characteristics and perception. The insider and outsider distinction earns marks repeatedly.",
    core: ["Employment structure and the Clark-Fisher model", "Function, connectedness and change over time", "Insider against outsider perspectives", "Media representation of place"],
    traps: ["Describing a place without explaining why it varies", "Ignoring lived experience"] },
  "geo4-2": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Evidence is the heart of this EQ. Named indices and named qualitative sources, with their limitations, is what separates the top band.",
    core: ["IMD and other statistical evidence", "Qualitative evidence and its value", "Deindustrialisation and the cycle of deprivation", "Conflicting priorities between groups"],
    traps: ["Asserting decline without evidence", "Treating statistics as objective and complete"] },
  "geo4-3": { weight: 4, marks: "Typically 10 to 18 marks",
    summary: "Who does regeneration, and how. Player analysis is the structure the mark scheme rewards.",
    core: ["National policy: infrastructure, planning, deregulation", "Local players, LEPs, Enterprise Zones", "Rebranding and reimaging", "Conflict and gentrification"],
    traps: ["Describing a scheme without naming the players", "Ignoring displacement"] },
  "geo4-4": { weight: 5, marks: "Typically 12 to 20 marks, usually the topic essay",
    summary: "Pure evaluation. Success has to be measured against stated criteria and from more than one group's point of view.",
    core: ["Economic, social and environmental measures of success", "Short term against long term outcomes", "Why groups judge success differently", "A supported judgement on a studied scheme"],
    traps: ["Concluding 'it was successful' with no criteria", "Using only economic measures"] }
};
