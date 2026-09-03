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

   OPTIONS
   Topics 2, 4 and 8 are optional routes and you sit one of each
   pair. Included here are the options matching the past-paper
   folders in this repository: 2B Coastal, 4A Regenerating
   Places, and both 8A and 8B. If you do not sit one of them,
   untick it in Settings and the planner will ignore it.

   NO LEARNING RESOURCES YET
   No videos or question banks are attached. RAG rating, the
   planner, Exam-Focus and past papers all work; add your own
   links and questions per topic as you find them.
   ============================================================ */

const GEO_SPEC = [
{
  id: "geo-t1", paper: "Topic 1 Tectonics", short: "T1",
  name: "Topic 1: Tectonic Processes and Hazards",
  code: "9GE0/01", book: "Physical geography, Paper 1",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Paper 1, physical geography. Assessed alongside Topics 2, 5 and 6.",
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
  id: "geo-t2b", paper: "Topic 2B Coasts", short: "T2B",
  name: "Topic 2B: Coastal Landscapes and Change",
  code: "9GE0/01", book: "Physical geography, Paper 1 (option 2B)",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Optional route. Sit either 2A Glaciated Landscapes or 2B Coastal Landscapes; this is 2B.",
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
    { id: "geo2-3", num: "2.3", name: "EQ3: How do coastal erosion and sea level change alter coastlines and increase risks?",
      desc: "Eustatic and isostatic change, rapid retreat, and coastal flood risk.",
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
          "Explain the economic and social consequences of coastal flooding" ]}
      ]},
    { id: "geo2-4", num: "2.4", name: "EQ4: How can coastlines be managed to meet the needs of all players?",
      desc: "Hard and soft engineering, sustainable management and the conflicts between players.",
      subs: [
        { id: "geo2-4-1", code: "2.4.1", name: "Hard and soft engineering", importance: 5, reqs: [
          "Describe hard engineering: sea walls, groynes, rip rap, revetments, offshore breakwaters",
          "Describe soft engineering: beach nourishment, dune stabilisation, managed realignment",
          "Evaluate the costs, benefits and sustainability of each approach" ]},
        { id: "geo2-4-2", code: "2.4.2", name: "Sustainable management and ICZM", importance: 4, reqs: [
          "Explain Integrated Coastal Zone Management and Shoreline Management Plans",
          "Explain the four SMP policy options: hold the line, advance the line, managed realignment, no active intervention",
          "Explain cost-benefit analysis in coastal decision making" ]},
        { id: "geo2-4-3", code: "2.4.3", name: "Players and conflict", importance: 4, reqs: [
          "Identify the players: residents, businesses, councils, environmental groups, national government",
          "Explain why coastal management creates winners and losers",
          "Explain how a decision in one place can increase erosion further along the coast" ]}
      ]}
  ]
},
{
  id: "geo-t5", paper: "Topic 5 Water", short: "T5",
  name: "Topic 5: The Water Cycle and Water Insecurity",
  code: "9GE0/01", book: "Physical geography, Paper 1",
  examMinutes: 135, marks: 105, flatNumbering: true,
  sections: [
    { id: "geo5-1", num: "5.1", name: "EQ1: What are the processes operating within the hydrological cycle?",
      desc: "Global stores and fluxes, drainage basins as open systems, and the water balance.",
      subs: [
        { id: "geo5-1-1", code: "5.1.1", name: "Global water stores and fluxes", importance: 4, reqs: [
          "Describe the size and residence time of the major global water stores",
          "Distinguish blue water from green water, and fossil water from renewable water",
          "Explain the global hydrological cycle as a closed system driven by solar energy" ]},
        { id: "geo5-1-2", code: "5.1.2", name: "The drainage basin as an open system", importance: 5, reqs: [
          "Explain inputs, flows, stores and outputs in a drainage basin",
          "Explain interception, infiltration, percolation, throughflow and overland flow",
          "Explain the water balance equation and interpret a soil moisture budget graph" ]},
        { id: "geo5-1-3", code: "5.1.3", name: "River regimes and storm hydrographs", importance: 5, reqs: [
          "Explain the factors affecting a river regime: climate, geology, land use",
          "Interpret a storm hydrograph: lag time, peak discharge, rising and falling limbs",
          "Explain how physical and human factors change hydrograph shape and flood risk" ]}
      ]},
    { id: "geo5-2", num: "5.2", name: "EQ2: What factors influence the hydrological system over short and long timescales?",
      desc: "Deficits and surpluses, drought, flooding, and human disruption of the cycle.",
      subs: [
        { id: "geo5-2-1", code: "5.2.1", name: "Deficits within the hydrological cycle", importance: 4, reqs: [
          "Explain meteorological, hydrological and agricultural drought",
          "Explain the role of ENSO cycles and high pressure blocking",
          "Explain the impacts of drought on wetlands and forests" ]},
        { id: "geo5-2-2", code: "5.2.2", name: "Surpluses and flooding", importance: 4, reqs: [
          "Explain the meteorological causes of flooding: intense storms, prolonged rain, snowmelt, monsoon",
          "Explain how land use change increases flood risk",
          "Explain the impacts of flooding on people and the environment" ]},
        { id: "geo5-2-3", code: "5.2.3", name: "Human disruption of the water cycle", importance: 4, reqs: [
          "Explain how deforestation, urbanisation and farming alter flows and stores",
          "Explain over-abstraction of groundwater and its consequences",
          "Explain the effects of reservoirs and dams" ]}
      ]},
    { id: "geo5-3", num: "5.3", name: "EQ3: How does water insecurity occur and why is it a global issue?",
      desc: "Water scarcity, its causes, consequences and the conflict it can create.",
      subs: [
        { id: "geo5-3-1", code: "5.3.1", name: "Water insecurity and its causes", importance: 5, reqs: [
          "Distinguish physical from economic water scarcity",
          "Explain the causes of rising demand: population, industry, agriculture, rising affluence",
          "Explain water stress and water scarcity thresholds" ]},
        { id: "geo5-3-2", code: "5.3.2", name: "Consequences and conflict", importance: 4, reqs: [
          "Explain the price and supply consequences of water insecurity",
          "Explain the potential for conflict over transboundary water sources",
          "Explain the significance of water sharing treaties" ]},
        { id: "geo5-3-3", code: "5.3.3", name: "Managing water supply", importance: 4, reqs: [
          "Explain hard engineering solutions: dams, reservoirs, water transfers, desalination",
          "Explain sustainable approaches: conservation, restoration, recycling, integrated water resource management",
          "Evaluate the sustainability of each approach" ]}
      ]}
  ]
},
{
  id: "geo-t6", paper: "Topic 6 Carbon", short: "T6",
  name: "Topic 6: The Carbon Cycle and Energy Security",
  code: "9GE0/01", book: "Physical geography, Paper 1",
  examMinutes: 135, marks: 105, flatNumbering: true,
  sections: [
    { id: "geo6-1", num: "6.1", name: "EQ1: How does the carbon cycle operate to maintain planetary health?",
      desc: "Carbon stores and fluxes, biological and geological pumps, and the greenhouse effect.",
      subs: [
        { id: "geo6-1-1", code: "6.1.1", name: "Carbon stores and fluxes", importance: 4, reqs: [
          "Describe the major carbon stores: lithosphere, hydrosphere, atmosphere, biosphere",
          "Distinguish the slow geological carbon cycle from the fast biological cycle",
          "Explain residence times and their significance" ]},
        { id: "geo6-1-2", code: "6.1.2", name: "Biological and physical pumps", importance: 4, reqs: [
          "Explain photosynthesis, respiration, decomposition and combustion",
          "Explain the oceanic carbonate and biological pumps",
          "Explain carbon sequestration in sediments and soils" ]},
        { id: "geo6-1-3", code: "6.1.3", name: "The greenhouse effect and planetary health", importance: 5, reqs: [
          "Explain the natural greenhouse effect and its role in regulating temperature",
          "Explain how the carbon cycle regulates atmospheric composition",
          "Explain the significance of soil health and forest carbon stores" ]}
      ]},
    { id: "geo6-2", num: "6.2", name: "EQ2: What are the consequences of our increasing demand for energy?",
      desc: "Energy security, mixes, players and the impacts of unconventional fossil fuels.",
      subs: [
        { id: "geo6-2-1", code: "6.2.1", name: "Energy security and energy mix", importance: 5, reqs: [
          "Define energy security, and distinguish domestic supply from imports",
          "Explain the factors influencing a country's energy mix",
          "Explain the roles of TNCs, OPEC, governments and consumers as players" ]},
        { id: "geo6-2-2", code: "6.2.2", name: "Unconventional fossil fuels", importance: 4, reqs: [
          "Describe tar sands, oil shale, shale gas and deepwater oil",
          "Explain the environmental costs of exploiting them",
          "Explain why they are increasingly exploited despite those costs" ]},
        { id: "geo6-2-3", code: "6.2.3", name: "Alternatives to fossil fuels", importance: 4, reqs: [
          "Compare renewables, recyclables, nuclear and biofuels",
          "Explain the costs, benefits and feasibility of each",
          "Explain the concept of energy pathways and their vulnerability" ]}
      ]},
    { id: "geo6-3", num: "6.3", name: "EQ3: How are the carbon and water cycles linked to the global climate system?",
      desc: "Climate change impacts, feedback loops, tipping points and mitigation.",
      subs: [
        { id: "geo6-3-1", code: "6.3.1", name: "Human impacts on the carbon cycle", importance: 5, reqs: [
          "Explain how fossil fuel combustion and land use change alter carbon stores",
          "Explain ocean acidification and its consequences",
          "Explain forest loss as both a source and a lost sink" ]},
        { id: "geo6-3-2", code: "6.3.2", name: "Feedback loops and tipping points", importance: 5, reqs: [
          "Distinguish positive from negative feedback in the climate system",
          "Explain permafrost melting, albedo change and forest die-back as feedbacks",
          "Explain the concept of a tipping point and the uncertainty around it" ]},
        { id: "geo6-3-3", code: "6.3.3", name: "Adaptation and mitigation", importance: 4, reqs: [
          "Explain adaptation strategies: water conservation, resilient agriculture, flood defence",
          "Explain mitigation strategies: carbon taxation, renewables, afforestation, carbon capture",
          "Evaluate the role of international agreements and the barriers to action" ]}
      ]}
  ]
},
{
  id: "geo-t3", paper: "Topic 3 Globalisation", short: "T3",
  name: "Topic 3: Globalisation",
  code: "9GE0/02", book: "Human geography, Paper 2",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Paper 2, human geography. Assessed alongside Topics 4, 7 and 8.",
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
  id: "geo-t4a", paper: "Topic 4A Regenerating Places", short: "T4A",
  name: "Topic 4A: Regenerating Places",
  code: "9GE0/02", book: "Human geography, Paper 2 (option 4A)",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Optional route. Sit either 4A Regenerating Places or 4B Diverse Places; this is 4A.",
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
},
{
  id: "geo-t7", paper: "Topic 7 Superpowers", short: "T7",
  name: "Topic 7: Superpowers",
  code: "9GE0/02", book: "Human geography, Paper 2",
  examMinutes: 135, marks: 105, flatNumbering: true,
  sections: [
    { id: "geo7-1", num: "7.1", name: "EQ1: What are superpowers and how have they changed over time?",
      desc: "Sources of power, patterns of dominance and the theories that explain them.",
      subs: [
        { id: "geo7-1-1", code: "7.1.1", name: "Characteristics and sources of power", importance: 5, reqs: [
          "Explain the pillars of power: economic, military, political, cultural, demographic, resource",
          "Distinguish hard power from soft power, and explain smart power",
          "Distinguish superpowers, emerging powers and regional powers" ]},
        { id: "geo7-1-2", code: "7.1.2", name: "Patterns of power over time", importance: 4, reqs: [
          "Explain unipolar, bipolar and multipolar systems",
          "Explain the significance of colonialism and the Cold War",
          "Explain the mechanisms of maintaining power: trade, alliances, aid, debt, military" ]},
        { id: "geo7-1-3", code: "7.1.3", name: "Theories of power", importance: 3, reqs: [
          "Explain Modernisation theory and Rostow's model",
          "Explain Dependency theory and Frank's development of underdevelopment",
          "Explain Wallerstein's World Systems Theory and its core, periphery and semi-periphery" ]}
      ]},
    { id: "geo7-2", num: "7.2", name: "EQ2: What are the impacts of superpowers?",
      desc: "Influence over the global economy, political systems and the environment.",
      subs: [
        { id: "geo7-2-1", code: "7.2.1", name: "Control of the global economy", importance: 5, reqs: [
          "Explain the role of the IMF, World Bank and WTO and who controls them",
          "Explain the influence of TNCs and global financial centres",
          "Explain how trade agreements reflect superpower interests" ]},
        { id: "geo7-2-2", code: "7.2.2", name: "Cultural and political influence", importance: 4, reqs: [
          "Explain the global spread of western culture and its significance",
          "Explain the role of the UN Security Council, NATO and G7",
          "Explain alliances as a mechanism of influence" ]},
        { id: "geo7-2-3", code: "7.2.3", name: "Environmental consequences", importance: 4, reqs: [
          "Explain the environmental impact of rising middle class consumption",
          "Explain the significance of resource demand and carbon emissions",
          "Explain tensions over responsibility for climate change" ]}
      ]},
    { id: "geo7-3", num: "7.3", name: "EQ3: What spheres of influence are contested?",
      desc: "Tensions over territory, resources and the shifting balance of power.",
      subs: [
        { id: "geo7-3-1", code: "7.3.1", name: "Contested places and resources", importance: 5, reqs: [
          "Explain tensions in the Arctic, the South China Sea and other contested regions",
          "Explain the significance of territorial waters, resources and shipping lanes",
          "Explain the causes and consequences of resource nationalism" ]},
        { id: "geo7-3-2", code: "7.3.2", name: "The shifting balance of power", importance: 4, reqs: [
          "Explain the rise of China, India and other emerging powers",
          "Explain the economic and political challenges to existing superpowers",
          "Explain the costs of maintaining superpower status" ]},
        { id: "geo7-3-3", code: "7.3.3", name: "Implications for the future", importance: 4, reqs: [
          "Explain possible future patterns of power",
          "Explain the risk of conflict as power shifts",
          "Evaluate whether a multipolar world is more or less stable" ]}
      ]}
  ]
},
{
  id: "geo-t8a", paper: "Topic 8A Health & Human Rights", short: "T8A",
  name: "Topic 8A: Health, Human Rights and Intervention",
  code: "9GE0/02", book: "Human geography, Paper 2 (option 8A)",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Optional route. Sit either 8A or 8B; this is 8A.",
  sections: [
    { id: "geo8a-1", num: "8A.1", name: "EQ1: What is human development and why do levels vary?",
      desc: "Measuring development beyond income, and the role of governance.",
      subs: [
        { id: "geo8a-1-1", code: "8A.1.1", name: "Defining and measuring development", importance: 5, reqs: [
          "Explain economic, social and political definitions of development",
          "Compare GDP per capita, HDI, the Gender Inequality Index and happiness indices",
          "Explain the strengths and limitations of each measure" ]},
        { id: "geo8a-1-2", code: "8A.1.2", name: "Variations in health and life expectancy", importance: 4, reqs: [
          "Explain global and internal variations in health outcomes",
          "Explain the role of income, education, sanitation and healthcare access",
          "Explain the epidemiological transition" ]},
        { id: "geo8a-1-3", code: "8A.1.3", name: "The role of governments and IGOs", importance: 4, reqs: [
          "Explain how government spending priorities affect development",
          "Explain the role of the IMF, World Bank and WHO",
          "Explain the significance of corruption and political stability" ]}
      ]},
    { id: "geo8a-2", num: "8A.2", name: "EQ2: Why do human rights vary from place to place?",
      desc: "Human rights frameworks, and variations in their protection and enforcement.",
      subs: [
        { id: "geo8a-2-1", code: "8A.2.1", name: "Human rights frameworks", importance: 4, reqs: [
          "Explain the Universal Declaration of Human Rights, the ECHR and the Geneva Convention",
          "Explain how these are enforced and by whom",
          "Explain the limits of international law" ]},
        { id: "geo8a-2-2", code: "8A.2.2", name: "Variations in rights and freedoms", importance: 5, reqs: [
          "Explain global variations in political freedom, gender equality and minority rights",
          "Explain the relationship between development and rights",
          "Explain the role of culture, religion and history" ]}
      ]},
    { id: "geo8a-3", num: "8A.3", name: "EQ3: How are human rights used to justify intervention?",
      desc: "The forms intervention takes and the arguments used to justify it.",
      subs: [
        { id: "geo8a-3-1", code: "8A.3.1", name: "Forms of geopolitical intervention", importance: 5, reqs: [
          "Explain development aid, trade embargoes, military aid and direct military action",
          "Explain the role of the UN, NATO and NGOs",
          "Explain the criteria used to decide whether to intervene" ]},
        { id: "geo8a-3-2", code: "8A.3.2", name: "Justifications and controversies", importance: 4, reqs: [
          "Explain humanitarian arguments for intervention",
          "Explain criticisms: sovereignty, self-interest, selectivity",
          "Explain why intervention is more likely in some places than others" ]}
      ]},
    { id: "geo8a-4", num: "8A.4", name: "EQ4: What are the outcomes of intervention?",
      desc: "Measuring the success of intervention for development and rights.",
      subs: [
        { id: "geo8a-4-1", code: "8A.4.1", name: "Measuring the success of intervention", importance: 5, reqs: [
          "Use development, health, education and rights indicators to judge outcomes",
          "Explain short term against long term consequences",
          "Explain why success is contested and depends on who is asked" ]},
        { id: "geo8a-4-2", code: "8A.4.2", name: "Consequences for people and places", importance: 4, reqs: [
          "Explain the consequences of intervention for stability and governance",
          "Explain unintended consequences, including displacement and dependency",
          "Reach a supported judgement on a case study you have learned" ]}
      ]}
  ]
},
{
  id: "geo-t8b", paper: "Topic 8B Migration & Sovereignty", short: "T8B",
  name: "Topic 8B: Migration, Identity and Sovereignty",
  code: "9GE0/02", book: "Human geography, Paper 2 (option 8B)",
  examMinutes: 135, marks: 105, flatNumbering: true,
  note: "Optional route. Sit either 8A or 8B; this is 8B.",
  sections: [
    { id: "geo8b-1", num: "8B.1", name: "EQ1: What are the impacts of globalisation on international migration?",
      desc: "Migration causes, patterns and consequences for source and host regions.",
      subs: [
        { id: "geo8b-1-1", code: "8B.1.1", name: "Causes and patterns of migration", importance: 5, reqs: [
          "Explain push and pull factors and the role of globalisation",
          "Distinguish economic migrants, refugees and asylum seekers",
          "Describe major global migration corridors" ]},
        { id: "geo8b-1-2", code: "8B.1.2", name: "Consequences for source and host", importance: 5, reqs: [
          "Explain remittances, brain drain and demographic change in source regions",
          "Explain economic, social and cultural impacts on host regions",
          "Explain why migration is politically contested" ]}
      ]},
    { id: "geo8b-2", num: "8B.2", name: "EQ2: How are nation states defined and how have they evolved?",
      desc: "Nationalism, borders, colonialism and contested sovereignty.",
      subs: [
        { id: "geo8b-2-1", code: "8B.2.1", name: "Nation states and sovereignty", importance: 4, reqs: [
          "Define nation, state, nation state and sovereignty",
          "Explain how borders were created, including the legacy of colonialism",
          "Explain contested borders and disputed territories" ]},
        { id: "geo8b-2-2", code: "8B.2.2", name: "Nationalism and identity", importance: 4, reqs: [
          "Explain the rise of nationalism and its role in state formation",
          "Explain how national identity is constructed and promoted",
          "Explain the significance of separatist movements" ]}
      ]},
    { id: "geo8b-3", num: "8B.3", name: "EQ3: What are the impacts of global organisations?",
      desc: "IGOs, their role in managing conflict, and how effective they are.",
      subs: [
        { id: "geo8b-3-1", code: "8B.3.1", name: "Global governance and IGOs", importance: 4, reqs: [
          "Explain the role of the UN, EU, NATO, IMF and World Bank",
          "Explain how IGOs attempt to manage conflict and environmental issues",
          "Explain the limits of their authority" ]},
        { id: "geo8b-3-2", code: "8B.3.2", name: "Effectiveness and criticism", importance: 4, reqs: [
          "Evaluate the effectiveness of IGO intervention",
          "Explain criticisms of bias, inefficiency and national self-interest",
          "Explain why some conflicts receive attention and others do not" ]}
      ]},
    { id: "geo8b-4", num: "8B.4", name: "EQ4: What are the threats to national sovereignty?",
      desc: "Globalisation, TNCs, migration and the erosion of state control.",
      subs: [
        { id: "geo8b-4-1", code: "8B.4.1", name: "Challenges to sovereignty", importance: 5, reqs: [
          "Explain how TNCs, IGOs and global finance limit state control",
          "Explain the significance of tax avoidance and offshore finance",
          "Explain how migration and supranational bodies challenge sovereignty" ]},
        { id: "geo8b-4-2", code: "8B.4.2", name: "Responses and the future of the nation state", importance: 4, reqs: [
          "Explain nationalist and protectionist responses",
          "Explain the significance of referendums and withdrawal from unions",
          "Reach a supported judgement on the future of the nation state" ]}
      ]}
  ]
},
{
  id: "geo-skills", paper: "Skills & NEA", short: "Skills",
  name: "Paper 3, skills and the Independent Investigation",
  code: "9GE0/03 and 9GE0/04", book: "Assessed across Paper 3 and the NEA",
  examMinutes: 135, marks: 70, flatNumbering: true,
  note: "Not a content topic. Paper 3 is a synoptic resource-based investigation worth 20%, and the NEA is worth a further 20%.",
  sections: [
    { id: "geo9-1", num: "9.1", name: "Paper 3 synoptic investigation",
      desc: "Working across topics from an unseen resource booklet.",
      subs: [
        { id: "geo9-1-1", code: "9.1.1", name: "Synoptic thinking", importance: 5, reqs: [
          "Link physical and human topics rather than answering them separately",
          "Apply the synoptic themes: players, attitudes and actions, futures and uncertainties",
          "Build an argument that draws on more than one topic" ]},
        { id: "geo9-1-2", code: "9.1.2", name: "Using the resource booklet", importance: 5, reqs: [
          "Interpret unfamiliar maps, graphs, photographs and text extracts under time pressure",
          "Quote and manipulate resource evidence rather than describing it",
          "Combine resource evidence with your own case study knowledge" ]},
        { id: "geo9-1-3", code: "9.1.3", name: "Extended writing and evaluation", importance: 5, reqs: [
          "Structure a 20 mark answer with a clear line of argument",
          "Evaluate using scale, time frame, players and uncertainty",
          "Reach a supported and explicit judgement" ]}
      ]},
    { id: "geo9-2", num: "9.2", name: "Geographical skills",
      desc: "The cartographic, statistical and fieldwork skills examined across all papers.",
      subs: [
        { id: "geo9-2-1", code: "9.2.1", name: "Cartographic and graphical skills", importance: 4, reqs: [
          "Interpret OS maps, choropleth, isoline, flow line and proportional symbol maps",
          "Interpret and construct scatter graphs, triangular graphs, radial graphs and kite diagrams",
          "Describe a distribution accurately using evidence from the resource" ]},
        { id: "geo9-2-2", code: "9.2.2", name: "Statistical skills", importance: 4, reqs: [
          "Calculate mean, median, mode, range, interquartile range and standard deviation",
          "Apply and interpret Spearman's rank correlation and the chi-squared test",
          "State a null hypothesis and interpret significance levels correctly" ]},
        { id: "geo9-2-3", code: "9.2.3", name: "The Independent Investigation", importance: 5, reqs: [
          "Define a focused question or hypothesis grounded in the specification",
          "Justify sampling methods and data collection techniques",
          "Present, analyse and evaluate data, including its limitations",
          "Reach a conclusion that answers the question and reflects on its reliability" ]}
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
  "geo2-3": { weight: 5, marks: "Typically 10 to 18 marks",
    summary: "Sea level change and flood risk connect coasts to climate change, which makes this a favourite for synoptic questions.",
    core: ["Eustatic against isostatic change", "Emergent and submergent landforms", "Causes of rapid retreat, including human sediment starvation", "Storm surges and climate change risk"],
    traps: ["Mixing up eustatic and isostatic", "Attributing all retreat to marine erosion alone"] },
  "geo2-4": { weight: 5, marks: "Typically 12 to 20 marks, usually the evaluation essay",
    summary: "Management is where the top-band marks are. Every strategy needs a cost, a beneficiary and a loser named.",
    core: ["Hard against soft engineering", "ICZM and the four SMP policy options", "Cost-benefit analysis", "Players, winners and losers, and knock-on erosion"],
    traps: ["Describing defences without evaluating them", "Ignoring the effect on the coast further along"] },

  "geo5-1": { weight: 4, marks: "Typically 8 to 15 marks",
    summary: "Systems vocabulary and hydrograph interpretation are reliable technical marks.",
    core: ["Global stores, fluxes and residence times", "Drainage basin as an open system", "Water balance and soil moisture budgets", "Storm hydrographs and lag time"],
    traps: ["Confusing stores with flows", "Describing a hydrograph without explaining the shape"] },
  "geo5-2": { weight: 4, marks: "Typically 8 to 16 marks",
    summary: "Drought and flood causes, with human disruption as the evaluation angle.",
    core: ["Types of drought and the role of ENSO", "Causes and impacts of flooding", "Deforestation, urbanisation and over-abstraction"],
    traps: ["Treating all drought as the same phenomenon", "Ignoring human causes of hydrological change"] },
  "geo5-3": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Water insecurity is a common essay and links directly to conflict and development.",
    core: ["Physical against economic scarcity", "Causes of rising demand", "Transboundary conflict and treaties", "Hard engineering against IWRM"],
    traps: ["Confusing physical with economic scarcity", "Assuming conflict is inevitable"] },

  "geo6-1": { weight: 4, marks: "Typically 8 to 15 marks",
    summary: "Carbon stores and pumps are the technical foundation for the climate essays later in the topic.",
    core: ["Major stores and residence times", "Fast biological against slow geological cycle", "Oceanic carbonate and biological pumps", "Natural greenhouse effect"],
    traps: ["Confusing the fast and slow cycles", "Describing the greenhouse effect as inherently harmful"] },
  "geo6-2": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Energy security is a reliable essay with a clear player framework.",
    core: ["Energy security and energy mix", "Players: TNCs, OPEC, governments, consumers", "Unconventional fossil fuels and their costs", "Renewables, nuclear and biofuels compared"],
    traps: ["Listing energy sources without evaluating feasibility", "Ignoring energy pathways and their vulnerability"] },
  "geo6-3": { weight: 5, marks: "Typically 12 to 20 marks, and highly synoptic",
    summary: "Feedback loops and tipping points are the highest-value ideas here, and they link straight to the water cycle for Paper 3.",
    core: ["Human alteration of carbon stores", "Ocean acidification", "Positive and negative feedback, permafrost and albedo", "Adaptation against mitigation"],
    traps: ["Calling any change a positive feedback", "Describing impacts without a feedback mechanism"] },

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
    traps: ["Concluding 'it was successful' with no criteria", "Using only economic measures"] },

  "geo7-1": { weight: 5, marks: "Typically 10 to 18 marks",
    summary: "The pillars of power and hard against soft power are the frameworks every Superpowers answer is built on.",
    core: ["Pillars of power and hard, soft and smart power", "Unipolar, bipolar and multipolar systems", "Colonialism and the Cold War", "Modernisation, Dependency and World Systems theory"],
    traps: ["Treating power as purely military or economic", "Naming a theory without applying it"] },
  "geo7-2": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Impacts across economy, politics and environment. The best answers show who benefits from the institutions.",
    core: ["IMF, World Bank, WTO and who controls them", "TNCs and global financial centres", "UN Security Council, NATO, G7", "Consumption and environmental consequences"],
    traps: ["Describing institutions without explaining whose interests they serve"] },
  "geo7-3": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Contested spheres are the essay most likely to appear, and future uncertainty is the evaluation lever.",
    core: ["Arctic, South China Sea and other contested regions", "Resource nationalism and shipping lanes", "The rise of China and emerging powers", "Costs of maintaining superpower status"],
    traps: ["Predicting the future without acknowledging uncertainty", "Ignoring the cost side of power"] },

  "geo8a-1": { weight: 4, marks: "Typically 8 to 15 marks",
    summary: "Measures of development and their limitations. Naming the limitation of each index is where the marks are.",
    core: ["Economic, social and political definitions", "GDP, HDI, GII and happiness measures", "Variations in health and life expectancy", "Government and IGO roles"],
    traps: ["Using GDP alone", "Describing variation without explaining causes"] },
  "geo8a-2": { weight: 4, marks: "Typically 8 to 16 marks",
    summary: "Rights frameworks and why enforcement varies.",
    core: ["UDHR, ECHR, Geneva Convention", "Enforcement and its limits", "Variation in freedoms and equality", "Culture, religion and history"],
    traps: ["Assuming legal protection means real protection"] },
  "geo8a-3": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Intervention is the essay. The strongest answers weigh humanitarian motives against self-interest.",
    core: ["Aid, embargoes, military aid, direct action", "UN, NATO and NGO roles", "Humanitarian justification", "Sovereignty and selectivity criticisms"],
    traps: ["Accepting stated motives uncritically", "Ignoring why some crises are ignored"] },
  "geo8a-4": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Outcomes and whether intervention worked. Contested success is the point, not a footnote.",
    core: ["Development, health and rights indicators", "Short against long term consequences", "Unintended consequences and dependency", "A supported judgement on a case study"],
    traps: ["Judging success on one indicator", "No named case study"] },

  "geo8b-1": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "Migration causes and consequences, with the source and host split as the structure.",
    core: ["Push and pull factors and globalisation", "Economic migrants, refugees and asylum seekers", "Remittances and brain drain", "Impacts on host regions"],
    traps: ["Conflating refugees with economic migrants", "Only discussing host country impacts"] },
  "geo8b-2": { weight: 4, marks: "Typically 8 to 16 marks",
    summary: "Definitions matter here, and colonial borders are the recurring explanation for contested territory.",
    core: ["Nation, state, nation state, sovereignty", "Colonial legacy and border creation", "Nationalism and constructed identity", "Separatist movements"],
    traps: ["Using nation and state interchangeably"] },
  "geo8b-3": { weight: 4, marks: "Typically 10 to 18 marks",
    summary: "IGOs and how effective they actually are. Criticism is required for the top band.",
    core: ["UN, EU, NATO, IMF, World Bank roles", "Managing conflict and environmental issues", "Bias, inefficiency and national self-interest"],
    traps: ["Describing what IGOs do without evaluating outcomes"] },
  "geo8b-4": { weight: 5, marks: "Typically 12 to 20 marks",
    summary: "The topic essay. Sovereignty under pressure from several directions at once.",
    core: ["TNCs, IGOs and global finance limiting state control", "Tax avoidance and offshore finance", "Migration and supranational bodies", "Nationalist and protectionist responses"],
    traps: ["Treating sovereignty as all or nothing", "No judgement on the future of the nation state"] },

  "geo9-1": { weight: 5, marks: "The whole of Paper 3, 70 marks and 20% of the A level",
    summary: "Paper 3 is not extra content. It rewards linking topics you already know under time pressure, using an unseen resource booklet.",
    core: ["Linking physical and human topics", "The synoptic themes: players, attitudes and actions, futures and uncertainties", "Using unseen resources as evidence", "Structuring a 20 mark argument"],
    traps: ["Answering each topic separately with no links", "Describing the resources rather than using them"] },
  "geo9-2": { weight: 4, marks: "Skills marks are spread across all three papers, plus the NEA at 20%",
    summary: "Skills are examined everywhere and are the most reliably securable marks in the subject.",
    core: ["Map and graph interpretation, including unfamiliar types", "Mean, median, IQR, standard deviation", "Spearman's rank and chi-squared, with null hypotheses", "NEA: question, sampling, analysis, evaluation"],
    traps: ["Quoting a statistical result without interpreting significance", "Describing a distribution without using figures from the resource"] }
};
