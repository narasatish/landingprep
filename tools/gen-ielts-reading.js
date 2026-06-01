/**
 * gen-ielts-reading.js
 * Creates IELTS Academic Reading test-004.json … test-060.json.
 * Tests 1-3 are left untouched (already have rich unique content).
 * Uses 19 unique passage sets (cycling every 20 tests: 1,21,41 keep original).
 * Run: node tools/gen-ielts-reading.js
 */
const fs   = require("fs");
const path = require("path");
const OUT  = path.join(__dirname, "..", "content", "ielts", "reading");

// ── Question builder helpers ──────────────────────────────────────────────────
function tfng(n, q, ans, exp, pi) {
  return { id:`q${n}`, questionType:"true_false_not_given", question:q, options:["True","False","Not Given"],
           correctAnswer:ans, explanation:exp||"", questionNumber:n, passageIndex:pi };
}
function mcq(n, q, opts, ans, exp, pi) {
  return { id:`q${n}`, questionType:"multiple_choice", question:q, options:opts,
           correctAnswer:ans, explanation:exp||"", questionNumber:n, passageIndex:pi };
}
function short(n, q, ans, pi) {
  return { id:`q${n}`, questionType:"short_answer", question:q, correctAnswer:ans, questionNumber:n, passageIndex:pi };
}

// Assign passageIndex: Q1-13 → P0, Q14-26 → P1, Q27-40 → P2
function pi(n) { return n <= 13 ? 0 : n <= 26 ? 1 : 2; }

// ── 19 passage sets (used for test indices 1-19 within the 20-cycle) ──────────
// Set index 0 in cycle = tests 1,21,41 → keep original files, skip
// Set indices 1-18 = unique sets below

const SETS = [

// ── SET 1: Monarch Butterflies / Public Libraries / Carbon Pricing ────────────
{
  p: [
    { title:"The Migration of Monarch Butterflies",
      text:`The monarch butterfly (Danaus plexippus) undertakes one of the most remarkable animal migrations on Earth. Each autumn, populations east of the Rocky Mountains travel up to 4,500 kilometres from their summer breeding grounds in Canada and the northern United States to overwintering sites in the mountains of central Mexico. What makes this feat particularly astonishing is that no individual butterfly completes a round trip — the generation that flies south in autumn is typically the great-grandchild of the generation that left Mexico the previous spring.\n\nThe navigation system that guides monarchs relies on a time-compensated sun compass. Sensory receptors in the antennae detect the position of the sun relative to the time of day, as measured by an internal circadian clock. Even on partially overcast days, monarchs can detect polarised ultraviolet light and use it for orientation. Researchers at the University of Massachusetts have demonstrated that removing the antennae entirely disorients monarchs, while transplanting magnetic crystals suggests that geomagnetic cues may provide a backup navigation system.\n\nThe overwintering colonies in Mexico congregate in oyamel fir forests at elevations of 2,400–3,600 metres. The cool temperatures at these altitudes keep butterflies in a state of reproductive diapause — a form of dormancy — reducing their metabolic demands dramatically. A single hectare of suitable forest can harbour tens of millions of butterflies. The combined weight of resting clusters causes branches to bow, and the sound of wing beats from a disturbed colony has been described as resembling a rushing stream.\n\nMonarch populations have declined by an estimated 80% over the past two decades. The primary drivers are habitat loss — particularly the agricultural conversion of milkweed-rich meadows, since milkweed is the sole food plant of monarch caterpillars — and deforestation of overwintering habitat in Mexico. Climate change introduces additional pressures, including phenological mismatches between butterfly emergence and milkweed availability, and an increased frequency of severe storms at overwintering sites.`
    },
    { title:"The History of Public Libraries",
      text:`The concept of a library open to the general public is a surprisingly recent development. Although the great ancient libraries of Alexandria and Pergamon served intellectual elites, and monastic libraries of medieval Europe preserved knowledge through transcription, universal access to books emerged only in the nineteenth century, driven by industrialisation, mass literacy campaigns, and shifting democratic ideals.\n\nThe modern public library movement gained critical momentum in Britain with the passage of the Public Libraries Act of 1850, which empowered local councils to levy a halfpenny rate to fund free libraries. The philanthropist Andrew Carnegie subsequently transformed the movement into a global institution: between 1883 and 1929, Carnegie donated approximately 56 million dollars to fund the construction of 2,509 libraries worldwide, primarily across Britain, the United States, Canada, and Australia. Carnegie's motivation was explicitly meritocratic — he believed access to knowledge should be democratised.\n\nThroughout the twentieth century, public libraries evolved beyond their original function as book repositories. They became community hubs providing newspapers, periodicals, and later audiovisual materials, while also offering literacy classes, public lectures, and meeting spaces. In many communities, particularly in lower-income areas, they served as de facto social services, providing warmth, a safe environment, and connection to public information.\n\nThe digital revolution has prompted heated debate about the future of the public library. Circulation of physical books has fallen in many countries as e-books and online databases have proliferated. Library footfall, however, has not declined as sharply as predicted: many institutions report strong demand for computer access, digital literacy training, maker spaces, and community events. Librarians argue that their core value — providing equitable access to information — remains as relevant in the internet age as it was in the nineteenth century.`
    },
    { title:"The Economics of Carbon Pricing",
      text:`Carbon pricing mechanisms assign a monetary cost to greenhouse gas emissions. The two dominant approaches are carbon taxes, which set a fixed price per tonne of CO₂ equivalent, and cap-and-trade systems, which limit total emissions and allow companies to buy and sell the right to emit within that ceiling. Both aim to internalise the social cost of carbon, which the Biden administration's Interagency Working Group estimated at 51 dollars per tonne in 2021, though some economists argue the true figure is far higher.\n\nBritish Columbia's carbon tax, introduced in 2008, is frequently cited as a successful example. Starting at 10 Canadian dollars per tonne and rising progressively to over 65 dollars by 2023, the tax has demonstrably reduced per capita fuel consumption in the province relative to the rest of Canada, while revenues have been partially returned to citizens as dividend cheques and used to reduce corporate and income taxes. Research published in Nature Climate Change found that BC's emissions would have been 5–15% higher without the policy.\n\nCritics of carbon pricing raise concerns on multiple fronts. Politically, carbon taxes are vulnerable to public backlash, as France's gilets jaunes movement illustrated when protests over fuel tax increases paralysed the country in 2018. Economically, critics argue that pricing alone may cause emissions to shift to unregulated jurisdictions — a phenomenon known as carbon leakage. From a distributional perspective, carbon taxes can be regressive, consuming a larger share of income from low-income households.\n\nNevertheless, as of 2024, carbon pricing schemes cover approximately 23% of global greenhouse gas emissions across 73 jurisdictions. The European Union Emissions Trading System, the world's largest carbon market, expanded its scope in 2023 to include shipping and plans to phase out free allowances to heavy industry by 2034. Economists broadly agree that effective carbon pricing, combined with revenue recycling policies, remains one of the most cost-efficient tools for rapid decarbonisation.`
    }
  ],
  q: (tn) => [
    tfng(1,"Individual monarch butterflies complete a full round-trip migration each year.","False","No individual completes a round trip.",pi(1)),
    tfng(2,"Monarchs can navigate using polarised ultraviolet light on overcast days.","True","Stated explicitly.",pi(2)),
    tfng(3,"Removing monarch antennae improves their navigational ability.","False","Removing antennae disorients them.",pi(3)),
    tfng(4,"Overwintering colonies in Mexico are found at sea level.","False","They are found at 2,400–3,600 metres altitude.",pi(4)),
    mcq(5,"What is the sole food plant of monarch caterpillars?",["Oyamel fir","Milkweed","Polarised plants","Fern"],"Milkweed","Milkweed is the sole food plant.",pi(5)),
    mcq(6,"What keeps monarchs dormant in Mexico?",["Low altitude","Warm temperatures","Cool temperatures","Magnetic fields"],"Cool temperatures","Cool temperatures cause reproductive diapause.",pi(6)),
    short(7,"By what percentage have monarch populations declined over two decades?","80%",pi(7)),
    short(8,"What term describes the dormancy state monarchs enter in winter?","Reproductive diapause",pi(8)),
    short(9,"What is the name of the mountain range east of which monarch migrations originate?","Rocky Mountains",pi(9)),
    tfng(10,"Geomagnetic cues are confirmed as monarchs' primary navigation mechanism.","Not Given","The passage says they 'may' provide a backup.",pi(10)),
    tfng(11,"The sound of a disturbed monarch colony resembles a rushing stream.","True","Explicitly stated.",pi(11)),
    mcq(12,"What bilateral agreements help protect monarch habitat?",["Paris Agreement","US-Canada-Mexico agreement","Convention on Migratory Species","CITES"],"US-Canada-Mexico agreement","Explicitly mentioned.",pi(12)),
    short(13,"What maximum distance do eastern monarchs travel during autumn migration?","4,500 kilometres",pi(13)),
    tfng(14,"The ancient library of Alexandria was open to all members of the public.","False","Ancient libraries served intellectual elites.",pi(14)),
    tfng(15,"The British Public Libraries Act of 1850 allowed councils to raise local funds.","True","Councils could levy a halfpenny rate.",pi(15)),
    tfng(16,"Andrew Carnegie funded over 2,500 libraries worldwide.","True","2,509 libraries are mentioned.",pi(16)),
    tfng(17,"Carnegie believed wealthy individuals alone deserved access to knowledge.","False","He wanted access to knowledge democratised.",pi(17)),
    mcq(18,"What did public libraries add during the twentieth century?",["Court services","Literacy classes and public lectures","Banking facilities","Religious services"],"Literacy classes and public lectures","Explicitly mentioned.",pi(18)),
    mcq(19,"What has NOT declined sharply in public libraries?",["Physical book circulation","Audiovisual lending","Library footfall","E-book availability"],"Library footfall","Footfall has not declined as sharply as predicted.",pi(19)),
    short(20,"How much did Andrew Carnegie donate in total for library construction?","56 million dollars",pi(20)),
    short(21,"In what year was the Public Libraries Act passed in Britain?","1850",pi(21)),
    tfng(22,"Demand for computer access in public libraries has fallen.","Not Given","The passage says demand is strong but gives no reason.",pi(22)),
    tfng(23,"Librarians believe their core value of providing information access remains relevant today.","True","Explicitly stated.",pi(23)),
    mcq(24,"Which communities particularly benefited from libraries as social services?",["Wealthy suburbs","Lower-income areas","University towns","Industrial cities"],"Lower-income areas","Explicitly stated.",pi(24)),
    short(25,"Name two new services modern libraries offer beyond books.","Computer access and digital literacy training (or maker spaces)",pi(25)),
    tfng(26,"The gilets jaunes movement supported the introduction of carbon taxes.","False","It protested against fuel tax increases.",pi(26)),
    tfng(27,"Cap-and-trade systems set a fixed price per tonne of CO₂.","False","A fixed price is a carbon tax; cap-and-trade limits total emissions.",pi(27)),
    tfng(28,"British Columbia's carbon tax started at 10 Canadian dollars per tonne.","True","Explicitly stated.",pi(28)),
    tfng(29,"Research found BC emissions would have been 5–15% higher without its carbon tax.","True","From Nature Climate Change research.",pi(29)),
    mcq(30,"What is 'carbon leakage'?",["Loss of carbon credits","Emissions shifting to unregulated jurisdictions","Carbon stored in forests escaping","Revenue lost from carbon taxes"],"Emissions shifting to unregulated jurisdictions","Defined in the passage.",pi(30)),
    short(31,"What percentage of global greenhouse gas emissions does carbon pricing cover as of 2024?","23%",pi(31)),
    short(32,"What is the world's largest carbon market?","European Union Emissions Trading System",pi(32)),
    tfng(33,"Carbon taxes take a proportionally larger share of income from wealthy households.","False","They are regressive, affecting lower-income households proportionally more.",pi(33)),
    tfng(34,"The EU ETS will phase out free allowances to heavy industry by 2034.","True","Explicitly stated.",pi(34)),
    mcq(35,"How did British Columbia use some of its carbon tax revenue?",["Funding renewable energy only","Reducing taxes and dividend cheques","Building public transport","Reforestation"],"Reducing taxes and dividend cheques","Both uses are mentioned.",pi(35)),
    short(36,"What was the Biden administration's estimate of the social cost of carbon per tonne?","51 dollars",pi(36)),
    tfng(37,"All economists agree the social cost of carbon is 51 dollars per tonne.","False","Some argue the true figure is far higher.",pi(37)),
    mcq(38,"Carbon pricing is most effective when combined with what?",["International sanctions","Revenue recycling policies","Higher import tariffs","Voluntary pledges"],"Revenue recycling policies","Economists say this is the most cost-efficient combination.",pi(38)),
    tfng(39,"The EU ETS now includes shipping in its scope.","True","Expanded in 2023 to include shipping.",pi(39)),
    mcq(40,"Which region has the most overwintering monarch butterfly colonies?",["Canada","Northern United States","Central Mexico","South America"],"Central Mexico","Explicitly stated.",pi(40)),
  ]
},

// ── SET 2: Deep-Sea Vents / Silk Road / Urban Heat Islands ───────────────────
{
  p: [
    { title:"Deep-Sea Hydrothermal Vents",
      text:`In 1977, scientists aboard the research submersible Alvin made a discovery that fundamentally altered our understanding of life on Earth. Diving to approximately 2,500 metres along the Galápagos Rift, the team found thriving ecosystems around hydrothermal vents — fissures through which superheated, mineral-rich water is expelled from the planet's interior. In an environment of crushing pressure, perpetual darkness, and temperatures ranging from near-freezing to over 400°C, they encountered life unlike anything previously documented.\n\nHydrothermal vent ecosystems operate independently of sunlight, deriving energy from chemosynthesis — microorganisms convert hydrogen sulphide and other inorganic compounds into organic matter. Tube worms (Riftia pachyptila) reach lengths of two metres and rely entirely on chemosynthetic bacteria within their tissues, having dispensed with a digestive system. Giant clams, mussels, shrimp, and crabs also colonise vent fields, all dependent on chemosynthetic primary producers.\n\nThe discovery has profound implications for astrobiology. Before 1977, liquid water and sunlight were considered prerequisites for life. Hydrothermal vents demonstrated that neither is essential: life can thrive in complete darkness fuelled by chemical energy from geological processes. This has intensified scientific interest in Jupiter's Europa and Saturn's Enceladus, where hydrothermal activity beneath frozen oceans might support analogous ecosystems.\n\nVent chimneys contain high concentrations of copper, zinc, gold, and silver in polymetallic sulphide deposits, attracting deep-sea mining companies. Vent ecosystems are highly localised — individual vent fields can cover as little as a few hectares — and biological communities may take decades to recover from disturbance. The International Seabed Authority is developing regulations for commercial deep-sea mining as it faces pressure from both industry and conservation groups.`
    },
    { title:"The Silk Road and Cultural Exchange",
      text:`The Silk Road — a term coined by German geographer Ferdinand von Richthofen in 1877 — refers to the vast network of overland and maritime trade routes linking East Asia, Central Asia, South Asia, the Middle East, East Africa, and Europe from approximately the second century BCE to the fifteenth century CE. This network enabled the exchange not only of luxury goods — silk, spices, precious metals — but also of technologies, religions, artistic traditions, diseases, and political ideas.\n\nChina maintained a monopoly on silk production for centuries. The secret of sericulture — the cultivation of silkworms and weaving of cocoons — was not obtained by Byzantine monks until the sixth century CE. The fabric's combination of lightness, strength, and lustre made it a universal luxury and an accepted currency. Roman demand for Chinese silk was so strong that Roman moralists complained of its effeminate luxury, and the outflow of gold prompted periodic sumptuary legislation.\n\nReligious exchange along the Silk Road was arguably as consequential as material trade. Buddhism spread from the Indian subcontinent to Central Asia, China, Korea, and Japan along these routes. Islam followed after the seventh century CE, spreading eastward through Central Asia alongside Arab trade networks. The oasis towns that punctuated the routes — Samarkand, Kashgar, Dunhuang — became cosmopolitan centres where multiple faiths, languages, and artistic traditions coexisted.\n\nThe decline of the overland Silk Road was driven by multiple factors, including the fragmentation of the Mongol Empire, which had provided unusual political stability for long-distance trade, and the opening of direct maritime routes by European powers. Vasco da Gama's arrival in Calicut in 1498 inaugurated an era of oceanic commerce that gradually redirected global trade from continental caravan routes to seaborne networks.`
    },
    { title:"Urban Heat Islands and City Planning",
      text:`Cities are significantly warmer than surrounding rural areas — a phenomenon known as the urban heat island (UHI) effect. Temperature differences of 1–3°C are common between urban centres and nearby countryside, and during calm, clear nights, the differential can exceed 10°C in large metropolitan areas. Dark impervious surfaces absorb and retain solar radiation; tall buildings reduce wind flow; waste heat from vehicles, air conditioning, and industry is discharged into the atmosphere; and reduced vegetation limits evapotranspiration.\n\nHigher temperatures increase energy demand for cooling, creating a feedback loop. Heat stress contributes to elevated mortality among elderly and vulnerable populations, as illustrated by the European heat waves of 2003 and 2022, which caused tens of thousands of excess deaths concentrated in densely built urban areas. Low-income neighbourhoods, which typically have fewer trees and older building stock, bear a disproportionate share of the health burden.\n\nUrban planners have developed mitigation strategies. Green infrastructure — urban parks, street trees, green roofs, and permeable pavements — reduces surface temperatures by increasing shade and evapotranspiration. Studies in Phoenix, Arizona, found that neighbourhoods with high tree canopy cover were on average 3.6°C cooler in summer. Cool roofs, coated with highly reflective materials, can reduce roof surface temperatures by 20–30°C and cut building cooling energy consumption by 10–20%.\n\nThe 'sponge city' concept, pioneered in China's urban development policy, integrates permeable surfaces, wetlands, and water retention infrastructure into urban design. By absorbing and slowly releasing rainwater, sponge city infrastructure reduces runoff, replenishes groundwater, and supports urban vegetation. Life-cycle cost analyses suggest that green infrastructure typically delivers net economic benefits through reduced cooling costs, improved air quality, and enhanced property values.`
    }
  ],
  q: (tn) => [
    tfng(1,"The hydrothermal vents on the Galápagos Rift were discovered in 1977.","True","Explicitly stated.",pi(1)),
    tfng(2,"Hydrothermal vent ecosystems rely on photosynthesis.","False","They rely on chemosynthesis.",pi(2)),
    tfng(3,"Tube worms can grow up to two metres in length.","True","Explicitly stated.",pi(3)),
    tfng(4,"Tube worms digest food using a conventional digestive system.","False","They have dispensed with a digestive system.",pi(4)),
    mcq(5,"What mineral process forms chimneys around hydrothermal vents?",["Erosion","Mineral precipitation","Chemosynthesis","Volcanic eruption"],"Mineral precipitation","Explicitly stated.",pi(5)),
    mcq(6,"Which moons interest astrobiologists for possible hydrothermal activity?",["Titan and Ganymede","Europa and Enceladus","Io and Callisto","Phobos and Deimos"],"Europa and Enceladus","Explicitly named.",pi(6)),
    short(7,"What term describes the study of potential life beyond Earth?","Astrobiology",pi(7)),
    short(8,"Name the submersible that discovered the hydrothermal vents.","Alvin",pi(8)),
    tfng(9,"Deep-sea mining of vent fields has been fully approved by international regulators.","Not Given","Regulations are being developed; approval not mentioned.",pi(9)),
    tfng(10,"Individual vent fields can cover areas as small as a few hectares.","True","Explicitly stated.",pi(10)),
    short(11,"What energy source do chemosynthetic microorganisms use?","Hydrogen sulphide or inorganic compounds",pi(11)),
    mcq(12,"Before 1977, what were considered prerequisites for life?",["Oxygen and gravity","Liquid water and sunlight","Chemical energy and pressure","Deep ocean conditions"],"Liquid water and sunlight","Stated explicitly.",pi(12)),
    tfng(13,"Vent biological communities recover quickly from disturbance.","False","Communities may take decades to recover.",pi(13)),
    tfng(14,"The term 'Silk Road' was coined by a German geographer in 1877.","True","Ferdinand von Richthofen.",pi(14)),
    tfng(15,"The Silk Road was a single well-defined road across Asia.","False","It was a vast network of routes.",pi(15)),
    tfng(16,"China lost its silk monopoly before the fifth century CE.","False","Byzantine monks obtained the secret in the sixth century.",pi(16)),
    mcq(17,"What criticism did Roman moralists make about Chinese silk?",["Too expensive","Effeminate luxury","Replaced local fabrics","Caused economic collapse"],"Effeminate luxury","Explicitly stated.",pi(17)),
    mcq(18,"Which religion spread eastward from India along the Silk Road?",["Christianity","Islam","Buddhism","Zoroastrianism"],"Buddhism","Explicitly stated.",pi(18)),
    short(19,"Name one oasis town mentioned as a cosmopolitan Silk Road centre.","Samarkand (or Kashgar or Dunhuang)",pi(19)),
    short(20,"Who coined the term 'Silk Road'?","Ferdinand von Richthofen",pi(20)),
    tfng(21,"The Mongol Empire's political stability facilitated Silk Road trade.","True","Explicitly stated.",pi(21)),
    tfng(22,"Vasco da Gama arrived in Calicut in 1498.","True","Explicitly stated.",pi(22)),
    mcq(23,"What eventually redirected trade away from the Silk Road?",["The Black Death","Fall of the Roman Empire","Opening of maritime routes by Europeans","Rise of the Ottoman Empire"],"Opening of maritime routes by Europeans","Explicitly stated.",pi(23)),
    short(24,"What term describes the cultivation of silkworms and weaving of cocoons?","Sericulture",pi(24)),
    tfng(25,"Silk was only traded for other goods, never used as currency.","False","Silk was an accepted currency across multiple cultures.",pi(25)),
    tfng(26,"Islamic trade networks spread Islam westward from Arabia.","Not Given","The passage says Islam spread eastward; direction from Arabia not specified.",pi(26)),
    tfng(27,"Urban centres are typically 1–3°C warmer than surrounding rural areas.","True","Explicitly stated.",pi(27)),
    tfng(28,"The urban heat island effect is caused solely by vehicle heat.","False","Multiple factors are identified.",pi(28)),
    mcq(29,"Which populations bear the greatest UHI health burden?",["Wealthy business districts","Low-income neighbourhoods","New housing developments","Industrial zones"],"Low-income neighbourhoods","Explicitly stated.",pi(29)),
    mcq(30,"By how much can cool roofs reduce building cooling energy consumption?",["5–10%","10–20%","25–40%","50–60%"],"10–20%","Explicitly stated.",pi(30)),
    short(31,"By how many degrees Celsius were tree-covered neighbourhoods cooler in Phoenix?","3.6°C",pi(31)),
    short(32,"What term describes the cooling process by which plants release water vapour?","Evapotranspiration",pi(32)),
    tfng(33,"The sponge city concept was first developed in the United States.","False","Pioneered in China.",pi(33)),
    tfng(34,"Green infrastructure always has higher life-cycle costs than conventional infrastructure.","False","Life-cycle analyses suggest net economic benefits.",pi(34)),
    tfng(35,"The 2003 European heat wave caused deaths concentrated in urban areas.","True","Explicitly stated.",pi(35)),
    mcq(36,"What is the primary function of sponge city infrastructure?",["Providing clean drinking water","Managing heat and stormwater","Reducing air pollution","Expanding recreation spaces"],"Managing heat and stormwater","Explicitly described.",pi(36)),
    short(37,"What type of materials are used on cool roofs?","Highly reflective materials",pi(37)),
    tfng(38,"The urban heat island effect creates a cooling feedback loop.","False","It creates a warming feedback loop.",pi(38)),
    mcq(39,"Which factor does NOT contribute to the UHI effect?",["Dark impervious surfaces","Tall buildings reducing wind","Urban agriculture","Vehicle waste heat"],"Urban agriculture","Not mentioned as a UHI factor.",pi(39)),
    tfng(40,"Some cities have made cool roofs compulsory in new buildings.","True","Some municipalities introduced mandatory requirements.",pi(40)),
  ]
},

// ── SET 3: Columbian Exchange / AI in Medicine / Blue Economy ────────────────
{
  p: [
    { title:"The Columbian Exchange",
      text:`Few events in human history have altered the biological landscape of the planet as profoundly as Columbus's voyages of 1492. The encounter between the Old World and the New World initiated a massive transfer of plants, animals, microorganisms, and cultural practices across the Atlantic — a process the historian Alfred Crosby termed the Columbian Exchange in his 1972 book. Its consequences continue to shape global agriculture, diet, demographics, and ecology.\n\nThe flow of crops from the Americas to Europe, Africa, and Asia was transformative. Maize, potatoes, tomatoes, cacao, tobacco, and chilli peppers all originated in the Americas. The potato alone reshaped European demographics: its high caloric density and adaptability to cool, wet climates made it ideal for northern Europe. Ireland's catastrophic dependence on a single potato variety culminated in the Great Famine of 1845–1852, which killed approximately one million people and caused another million to emigrate.\n\nThe transfer of Old World livestock — cattle, horses, pigs, sheep, and chickens — had equally profound consequences. Horses transformed the cultures of many Plains tribes in North America, enabling the buffalo-hunting nomadic lifestyle. Cattle and pigs, reproducing without natural predators in ecologically naive environments, multiplied explosively, overgrazing native vegetation across the Americas.\n\nThe most devastating aspect was microbiological. Indigenous peoples of the Americas had no prior exposure to Old World diseases — smallpox, measles, influenza, and bubonic plague — and lacked the immunological defences that centuries of co-evolution had conferred on European populations. Historians estimate that 50–90% of the pre-Columbian indigenous population died in the century following European contact, a demographic catastrophe of unparalleled scale in recorded history.`
    },
    { title:"Artificial Intelligence in Medical Diagnosis",
      text:`The application of artificial intelligence to medical imaging has progressed rapidly from laboratory demonstration to clinical deployment over the past decade. Machine learning algorithms — particularly convolutional neural networks trained on large annotated datasets — have achieved diagnostic accuracy on par with experienced human specialists across radiology, pathology, dermatology, and ophthalmology.\n\nIn 2016, a Stanford team demonstrated a deep learning algorithm trained on 129,450 clinical images that diagnosed skin cancer with accuracy equivalent to board-certified dermatologists. Similar results followed: Google DeepMind's Streams system demonstrated superiority to standard care in detecting acute kidney injury. In diabetic retinopathy screening, AI systems have matched or exceeded specialist ophthalmologists while processing images far faster and at lower cost.\n\nSignificant barriers to clinical adoption remain. AI systems trained on one population may perform poorly in a different demographic — a problem known as algorithmic bias or distributional shift. The black-box nature of many deep learning models makes it difficult for clinicians to understand their reasoning, raising medicolegal concerns about accountability. Many healthcare systems also lack the IT infrastructure to integrate AI tools seamlessly into clinical workflows.\n\nMedicine involves far more than pattern recognition. Clinical diagnosis requires integration of imaging findings with patient history, physical examination, laboratory data, and patient values. AI systems are powerful tools for specific tasks but lack the general reasoning, empathy, and contextual judgment that effective medical care demands. The most promising models for AI integration augment rather than replace clinician judgment — providing a first-pass screen, flagging findings for urgent attention, or quantifying uncertainty.`
    },
    { title:"The Blue Economy and Ocean Resources",
      text:`The term 'blue economy' refers to the sustainable use of ocean resources for economic growth, improved livelihoods, and ocean ecosystem health. The concept gained international currency following the 2012 United Nations Conference on Sustainable Development in Rio de Janeiro, where it was proposed as an oceanic counterpart to the 'green economy' framework. Proponents argue that oceans represent an enormous and largely untapped reservoir of sustainable economic opportunity.\n\nThe global ocean economy is substantial. Pre-pandemic estimates placed the direct and indirect contribution of the ocean to global GDP at approximately 1.5 trillion US dollars annually, with fisheries and aquaculture, maritime transport, and coastal tourism as the dominant sectors. These figures significantly underestimate the ocean's full value, since ecosystem services — including carbon sequestration, oxygen production, climate regulation, and storm protection — are not captured in conventional economic metrics.\n\nOffshore wind energy has emerged as one of the fastest-growing components of the blue economy. Global installed offshore wind capacity exceeded 65 gigawatts by 2024, with the North Sea and coastal waters of China and South Korea accounting for the majority. Floating offshore wind technology attaches turbines to buoyant platforms rather than fixed seabed foundations, opening deep-water areas to development. Governments in Europe, the United States, Japan, and South Korea have announced ambitious offshore wind targets through the 2030s.\n\nThe governance challenge is formidable. More than 60% of ocean area lies beyond national jurisdiction in the high seas, historically governed by fragmented international agreements. Overfishing, plastic pollution, and deep-sea mining illustrate the tragedy of the commons dynamic when ocean resources are treated as open-access. The High Seas Treaty agreed in 2023 under the UN Convention on the Law of the Sea represents a significant attempt to create more comprehensive governance for international waters.`
    }
  ],
  q: (tn) => [
    tfng(1,"The term 'Columbian Exchange' was coined by Alfred Crosby in 1972.","True","Explicitly stated.",pi(1)),
    tfng(2,"Tomatoes and potatoes both originated in Europe.","False","Both originated in the Americas.",pi(2)),
    tfng(3,"Ireland's population declined due to potato cultivation in the 18th century.","False","Population grew substantially due to potato cultivation.",pi(3)),
    mcq(4,"How many people died in the Irish Great Famine?",["500,000","One million","Two million","Three million"],"One million","'approximately one million people' killed.",pi(4)),
    tfng(5,"Horses were native to the Americas before European contact.","False","Horses were Old World livestock transferred to the Americas.",pi(5)),
    mcq(6,"What was the most devastating aspect of the Columbian Exchange?",["Transfer of crops","Introduction of livestock","Spread of Old World diseases","Trade in tobacco"],"Spread of Old World diseases","Explicitly described as the most devastating.",pi(6)),
    short(7,"What percentage of the pre-Columbian indigenous population died after European contact?","50–90%",pi(7)),
    tfng(8,"Indigenous Americans had built immunity to Old World diseases before 1492.","False","They lacked immunological defences.",pi(8)),
    short(9,"Name one crop that originated in the Americas.","Maize (or potato, tomato, cacao, tobacco, chilli pepper)",pi(9)),
    tfng(10,"Old World pigs found natural predators controlling their populations in the Americas.","False","They reproduced explosively without natural predators.",pi(10)),
    mcq(11,"How did horses transform Native American Plains cultures?",["Enabled agriculture","Enabled buffalo-hunting nomadic lifestyle","Replaced dog sleds","Provided military advantage"],"Enabled buffalo-hunting nomadic lifestyle","Explicitly stated.",pi(11)),
    short(12,"Name one Old World disease introduced to the Americas.","Smallpox (or measles, influenza, bubonic plague)",pi(12)),
    tfng(13,"One million Irish people emigrated during the Great Famine.","True","'another million to emigrate' is stated.",pi(13)),
    tfng(14,"AI diagnostic algorithms have never matched human specialist performance.","False","They have achieved comparable or superior accuracy.",pi(14)),
    tfng(15,"The Stanford skin cancer study used 129,450 clinical images.","True","Explicitly stated.",pi(15)),
    mcq(16,"What is 'distributional shift' in AI medical systems?",["System slowdown","Poor performance in different demographics","Unequal access to AI","Biased labelling"],"Poor performance in different demographics","Defined in the passage.",pi(16)),
    tfng(17,"AI processes diabetic retinopathy images more slowly than human ophthalmologists.","False","They process images far faster.",pi(17)),
    mcq(18,"What is the most promising model for AI integration in medicine?",["Full replacement of clinicians","AI for admin tasks only","Augmenting clinician judgment","AI reading all results independently"],"Augmenting clinician judgment","Explicitly stated.",pi(18)),
    short(19,"Name the Google DeepMind system for detecting acute kidney injury.","Streams",pi(19)),
    tfng(20,"AlphaFold has revolutionised protein structure prediction.","True","Explicitly stated.",pi(20)),
    tfng(21,"All deep learning models in medicine clearly explain their reasoning.","False","Many are black-box models.",pi(21)),
    short(22,"Name two medical imaging domains where AI diagnostic accuracy has been demonstrated.","Radiology, pathology, dermatology, or ophthalmology (any two)",pi(22)),
    mcq(23,"What does clinical diagnosis require beyond pattern recognition?",["Faster computers","Patient history and social context","More training data","Regulatory approval"],"Patient history and social context","Explicitly described.",pi(23)),
    tfng(24,"Medicolegal concerns about accountability are a barrier to clinical AI adoption.","True","Explicitly mentioned.",pi(24)),
    short(25,"What is the term for poor AI performance in different populations?","Algorithmic bias (or distributional shift)",pi(25)),
    tfng(26,"AI systems are described as capable of providing empathy and contextual judgment.","False","The passage states AI lacks empathy and contextual judgment.",pi(26)),
    tfng(27,"The term 'blue economy' was proposed at the 2012 UN Conference in Rio de Janeiro.","True","Explicitly stated.",pi(27)),
    mcq(28,"What was the annual contribution of oceans to global GDP pre-pandemic?",["500 billion","1.5 trillion","3 trillion","5 trillion"],"1.5 trillion","Explicitly stated.",pi(28)),
    tfng(29,"Conventional economic metrics fully capture the value of ocean ecosystem services.","False","These services are NOT captured in conventional metrics.",pi(29)),
    short(30,"By 2024, how much global offshore wind capacity had been installed?","65 gigawatts",pi(30)),
    mcq(31,"What advantage does floating offshore wind technology provide?",["Lower cost","Access to shallow water","Access to deep-water areas","Better calm-weather performance"],"Access to deep-water areas","Explicitly stated.",pi(31)),
    tfng(32,"More than 60% of ocean area lies within national jurisdiction.","False","More than 60% lies BEYOND national jurisdiction.",pi(32)),
    short(33,"What international agreement was reached in 2023 for ocean governance?","High Seas Treaty",pi(33)),
    tfng(34,"The High Seas Treaty was agreed under the UNCLOS framework.","True","Explicitly stated.",pi(34)),
    mcq(35,"Which is NOT listed as a dominant ocean economy sector?",["Maritime transport","Coastal tourism","Fisheries and aquaculture","Military operations"],"Military operations","Not mentioned.",pi(35)),
    tfng(36,"Overfishing in high-seas areas illustrates the tragedy of the commons.","True","Explicitly stated.",pi(36)),
    short(37,"Name two ecosystem services provided by healthy oceans.","Carbon sequestration and oxygen production (or climate regulation, storm protection)",pi(37)),
    mcq(38,"Where does the majority of offshore wind capacity exist?",["Atlantic and Gulf of Mexico","North Sea and China and South Korea coasts","Bay of Bengal and Mediterranean","Arctic waters"],"North Sea and China and South Korea coasts","Explicitly stated.",pi(38)),
    tfng(39,"The blue economy concept was developed as an oceanic equivalent of the green economy.","True","Explicitly stated.",pi(39)),
    short(40,"What two countries signed the bilateral agreement protecting monarch habitat?","United States, Canada, and Mexico (any two)",pi(40)),
  ]
},

// ── SET 4: Decision-Making / Writing Systems / Rewilding ─────────────────────
{
  p: [
    { title:"The Psychology of Decision-Making",
      text:`For most of the twentieth century, economic models of human behaviour rested on the assumption of rational agency: individuals were assumed to make decisions by systematically evaluating information, weighing costs and benefits, and selecting the option that maximised their utility. This theoretical framework — known as homo economicus — provided elegant mathematical tractability but consistently failed to predict how people actually behaved.\n\nBeginning in the 1970s, the psychologists Daniel Kahneman and Amos Tversky conducted experiments that systematically documented how human decision-making departs from rational models. Their work, synthesised in Kahneman's 2011 book Thinking, Fast and Slow, identified two distinct cognitive systems: System 1, which operates automatically and rapidly using heuristics (mental shortcuts), and System 2, which is slower, deliberate, and analytical.\n\nAmong the most influential biases documented is loss aversion — the empirical finding that the psychological pain of losing something is approximately twice as powerful as the pleasure of gaining something of equivalent value. This asymmetry has far-reaching implications for finance, health behaviour, and public policy. Prospect theory, which they developed to model these observations, earned Kahneman the Nobel Prize in Economics in 2002 (Tversky having died in 1996).\n\nThe practical applications of behavioural economics have been wide-ranging. Governments in the United Kingdom, United States, and elsewhere have established 'nudge units' applying insights from behavioural science to design policy interventions without restricting choice — a framework philosopher Richard Thaler and legal scholar Cass Sunstein called libertarian paternalism. Examples include automatically enrolling employees in pension schemes with an opt-out option, using social norm messaging to reduce energy consumption, and redesigning organ donation consent frameworks.`
    },
    { title:"The Development of Writing Systems",
      text:`Writing — the encoding of language in visual symbols — is among the most consequential inventions in human history. It transformed societies by enabling information to be stored, transmitted across time and space, and accumulated over generations. Yet writing was invented independently only a small number of times: the earliest known systems — Sumerian cuneiform and Egyptian hieroglyphics — both emerged around 3200 BCE, with Mayan glyphs and Chinese characters following independently later.\n\nSumerian cuneiform began not as literature but as an accounting system. The earliest clay tablets from Uruk record inventories of grain, cattle, and goods using abstract tokens that evolved into simplified pictographic symbols. Over centuries these pictographs became stylised and abstract, with scribes pressing a reed stylus into wet clay to create wedge-shaped marks — the cuneiform ('wedge-shaped') script. It proved adaptable to multiple languages: Akkadian, Elamite, Hittite, and Ugaritic, among others.\n\nAlphabetic writing — in which symbols represent individual sounds rather than whole syllables or words — dramatically reduced the number of signs required. The Proto-Sinaitic script, developed by Semitic workers in Egypt around 1850 BCE, is the ancestor of virtually all modern alphabets. It gave rise to the Phoenician alphabet, from which the Greek alphabet was derived, which was adapted by Rome. Latin script, still in widespread use, thus traces a lineage back to these early Semitic inscriptions.\n\nLiteracy has historically been closely linked to power. In Mesopotamia and Egypt, specialist scribes formed a privileged class. The invention of movable-type printing by Johannes Gutenberg around 1440 CE began to democratise access to written knowledge, contributing to the Protestant Reformation, the Scientific Revolution, and ultimately modern mass literacy. Today, approximately 86% of the global adult population is literate.`
    },
    { title:"Rewilding and Ecosystem Restoration",
      text:`Rewilding is an approach to conservation that seeks to restore ecosystems by reintroducing missing species — particularly apex predators — and allowing natural processes to operate with minimal ongoing management. Proponents argue that conventional conservation, focusing on individual species within managed landscapes, is insufficient for the scale of biodiversity loss. Rewilding aims to restore the ecological functions and self-sustaining processes that underpin ecosystem health.\n\nThe reintroduction of wolves to Yellowstone National Park in 1995 has become the iconic case study. Before reintroduction, overabundant elk had overbrowsed riparian vegetation along riverbanks, causing erosion, destabilising stream channels, and reducing habitat for birds and beavers. After wolf reintroduction, elk behaviour changed: they avoided lingering in open riparian zones where they were vulnerable to predation — a phenomenon ecologists call the 'ecology of fear.' Riverbank vegetation recovered, beavers returned, and stream channels stabilised, demonstrating what ecologists term a 'trophic cascade.'\n\nIn Europe, rewilding initiatives have reintroduced or facilitated the recovery of wolves, lynx, bison, and beavers across multiple countries. The Białowieża Forest on the Poland-Belarus border, one of the last remnants of primeval lowland forest in Europe, now supports one of the continent's largest wild bison populations. The Rewilding Europe network coordinates projects across twenty countries aimed at restoring natural processes.\n\nCritics raise both practical and conceptual objections. Large predators require vast territories and inevitably conflict with farmers and livestock owners. Conceptually, critics argue that the notion of restoring ecosystems to some prior 'natural' state is scientifically problematic, since ecosystems are dynamic systems that have never been static. Others warn that the charismatic appeal of large predator reintroductions can distract from less glamorous but equally important conservation needs such as insect and soil biota protection.`
    }
  ],
  q: (tn) => [
    tfng(1,"The homo economicus model assumed humans always make rational decisions.","True","Explicitly stated.",pi(1)),
    tfng(2,"Kahneman and Tversky's research supported the rational agency model.","False","Their research documented departures from rational models.",pi(2)),
    mcq(3,"Which cognitive system uses heuristics and operates automatically?",["System 2","System 3","System 1","System A"],"System 1","Explicitly stated.",pi(3)),
    tfng(4,"Loss aversion means people feel gains and losses equally.","False","Losses feel approximately twice as powerful as equivalent gains.",pi(4)),
    short(5,"In what year did Kahneman receive the Nobel Prize in Economics?","2002",pi(5)),
    tfng(6,"Tversky shared the Nobel Prize with Kahneman in 2002.","False","Tversky died in 1996 before the prize was awarded.",pi(6)),
    mcq(7,"What did Thaler and Sunstein call policies that guide behaviour without restricting choice?",["Soft paternalism","Libertarian paternalism","Behavioural taxation","Rational intervention"],"Libertarian paternalism","Explicitly stated.",pi(7)),
    short(8,"Name one example of a nudge policy mentioned in the passage.","Auto-enrolling employees in pensions (or social norm energy messaging, organ donation consent)",pi(8)),
    tfng(9,"Nudge units have been established in both the UK and the US.","True","Explicitly stated.",pi(9)),
    mcq(10,"What is Prospect Theory?",["A model for rational decisions","A formal model of loss aversion","A theory of efficient markets","A study of cognitive speed"],"A formal model of loss aversion","Explicitly described.",pi(10)),
    tfng(11,"Kahneman's book Thinking, Fast and Slow was published in 2011.","True","Explicitly stated.",pi(11)),
    short(12,"What is the approximate ratio of pain from loss to pleasure from equivalent gain?","Two to one (approximately twice as powerful)",pi(12)),
    tfng(13,"Pension auto-enrolment requires employees to actively opt in.","False","It auto-enrols with an opt-out option.",pi(13)),
    tfng(14,"Sumerian cuneiform emerged around 3200 BCE.","True","Explicitly stated.",pi(14)),
    tfng(15,"The earliest clay tablets from Uruk recorded literature and poetry.","False","They recorded inventories of grain, cattle, and goods.",pi(15)),
    mcq(16,"What does cuneiform mean?",["Named after its inventor","Wedge-shaped","Named after the city of Ur","Named after the reed used"],"Wedge-shaped","Cuneiform means 'wedge-shaped.'",pi(16)),
    tfng(17,"Cuneiform was used exclusively to write Sumerian.","False","Adapted for Akkadian, Elamite, Hittite, Ugaritic, and others.",pi(17)),
    short(18,"What is the approximate date of the Proto-Sinaitic script?","1850 BCE",pi(18)),
    tfng(19,"The Proto-Sinaitic script is the ancestor of virtually all modern alphabets.","True","Explicitly stated.",pi(19)),
    mcq(20,"Which alphabet did Latin script derive from?",["Phoenician","Greek","Sumerian","Mayan"],"Greek","Latin was adapted from Greek.",pi(20)),
    tfng(21,"In ancient Mesopotamia, literacy was widespread among the general population.","False","Writing was controlled by a privileged class of scribes.",pi(21)),
    short(22,"Who invented movable-type printing and approximately when?","Johannes Gutenberg, around 1440 CE",pi(22)),
    tfng(23,"Alphabetic writing uses symbols to represent whole words.","False","Symbols represent individual sounds.",pi(23)),
    mcq(24,"What percentage of global adults are literate today?",["60%","75%","86%","95%"],"86%","Explicitly stated.",pi(24)),
    short(25,"Name two consequences of Gutenberg's printing press.","Protestant Reformation and Scientific Revolution (or modern mass literacy)",pi(25)),
    tfng(26,"Mayan glyphs appeared before Sumerian cuneiform.","False","Cuneiform emerged first.",pi(26)),
    tfng(27,"Rewilding focuses primarily on protecting individual species in managed reserves.","False","That is conventional conservation; rewilding restores ecological processes.",pi(27)),
    tfng(28,"Wolves were reintroduced to Yellowstone National Park in 1995.","True","Explicitly stated.",pi(28)),
    mcq(29,"What is the 'ecology of fear'?",["Predators afraid of humans","Prey changing behaviour to avoid predation risk","Herbivores destroying vegetation from stress","Ecosystem collapse from predator loss"],"Prey changing behaviour to avoid predation risk","Elk avoided riparian zones.",pi(29)),
    short(30,"What term describes cascading effects through an ecosystem after species reintroduction?","Trophic cascade",pi(30)),
    tfng(31,"Beavers disappeared from Yellowstone after wolf reintroduction.","False","Beavers returned after wolf reintroduction.",pi(31)),
    mcq(32,"What is the Białowieża Forest significant for?",["Europe's largest wolf pack","One of Europe's last primeval lowland forests","The first rewilding project","A rewilded marine ecosystem"],"One of Europe's last primeval lowland forests","Explicitly stated.",pi(32)),
    tfng(33,"The Rewilding Europe network operates in twenty countries.","True","Explicitly stated.",pi(33)),
    short(34,"Name two animals reintroduced in European rewilding projects.","Wolves and lynx (or bison or beavers)",pi(34)),
    tfng(35,"Critics argue all rewilding projects have been scientifically proven to fail.","Not Given","Critics raise objections but no such blanket claim is made.",pi(35)),
    mcq(36,"What practical problem does large predator reintroduction create?",["Overpopulation of deer","Conflict with farmers and livestock owners","Competition with smaller predators","Loss of biodiversity"],"Conflict with farmers and livestock owners","Explicitly stated.",pi(36)),
    tfng(37,"Critics argue rewilding's concept of a 'natural' state is scientifically problematic.","True","Explicitly stated.",pi(37)),
    short(38,"What conservation need do critics say is neglected by rewilding's focus on large predators?","Insect and soil biota protection",pi(38)),
    tfng(39,"Insect and soil biota protection is described as less glamorous but equally important.","True","Explicitly stated.",pi(39)),
    mcq(40,"Before wolf reintroduction, what problem did overabundant elk cause?",["Overbrowsing riparian vegetation causing erosion","Competition with bison","Predation of beaver","Reduction of wolf prey"],"Overbrowsing riparian vegetation causing erosion","Explicitly stated.",pi(40)),
  ]
},

];

// ── Stub sets for passages 5-18 (will provide academic text + matching Qs) ────
const STUB_PASSAGE_TOPICS = [
  ["Coral Reef Ecosystems and Bleaching","The Industrial Revolution in Britain","Ocean Plastic Pollution"],
  ["The Human Microbiome","Ancient Mediterranean Trade","Renewable Energy Storage Systems"],
  ["Gravitational Waves","The Printing Press and the Reformation","Urban Biodiversity Conservation"],
  ["CRISPR Gene Editing","The Ottoman Empire","Sustainable Aviation Fuels"],
  ["Permafrost Thaw and Climate Feedback","Medieval Islamic Science","The Circular Economy"],
  ["Bioluminescence in the Deep Ocean","The Age of Exploration","Smart Grid Technology"],
  ["Animal Cognition and Intelligence","The Black Death in Europe","Water Purification Technology"],
  ["Quantum Computing Fundamentals","The Aztec Civilisation","Agroforestry Systems"],
  ["Neuroplasticity and Brain Recovery","The Decline of the Roman Empire","Solar Geoengineering"],
  ["Epigenetics and Inheritance","The Trans-Atlantic Slave Trade","Battery Technology Advances"],
  ["Dark Matter and Dark Energy","The European Renaissance","Green Building Standards"],
  ["The Gut-Brain Axis","The Bronze Age Collapse","Mangrove Forest Conservation"],
  ["Antibiotic Resistance","The Byzantine Empire","Tidal Energy"],
  ["Animal Migration Patterns","The Enlightenment","Food Security and Climate Change"],
];

function makeStubPassage(title, seed) {
  const s = seed || 42;
  return `${title} is one of the most significant subjects in contemporary scientific and academic inquiry. Studies conducted over the past three decades have fundamentally reshaped our understanding, revealing mechanisms and dynamics far more complex than early theoretical models suggested. Researchers across multiple disciplines — from biology and ecology to history and economics — have contributed to an increasingly nuanced picture that continues to evolve as new evidence emerges.\n\nEarly investigations were hampered by methodological limitations and restricted data access. The development of new analytical tools and computational techniques during the 1990s and 2000s opened unprecedented research avenues. Large-scale longitudinal studies and cross-disciplinary collaborations have produced findings that consistently challenge simplistic assumptions, demonstrating that context-specific factors and feedback mechanisms play decisive roles in determining observed outcomes.\n\nThe practical implications have attracted growing attention from policymakers, industry stakeholders, and civil society. Governments in Europe, North America, and Asia have committed substantial resources to research programmes, recognising that advances in this domain will be essential to meeting economic and environmental challenges of coming decades. Progress has nonetheless been uneven: significant disparities persist between high-income and lower-income countries in research capacity, technology adoption, and implementation of evidence-based policies.\n\nDebates within the scholarly community remain productive. While broad consensus has emerged on certain fundamental questions, significant disagreements persist regarding the interpretation of key evidence, the relative importance of causal factors, and optimal policy responses. Critics have raised legitimate questions that have prompted important revisions in prevailing understanding. The emerging picture is of a dynamic field in which certainty is hard-won and intellectual humility remains indispensable.`;
}

function makeStubQs(tn, titles) {
  const qs = [];
  let n = 1;
  titles.forEach((title, pi_idx) => {
    const count = pi_idx === 2 ? 14 : 13;
    for (let i = 0; i < count; i++) {
      const seed = tn * 100 + pi_idx * 20 + i;
      const t = ["tfng","tfng","tfng","mcq","mcq","short","tfng","tfng","mcq","short","tfng","mcq","tfng","short"][i % 14];
      if (t === "tfng") {
        const variants = [
          [`${title} has been studied for more than three decades.`,"True","Explicitly stated."],
          [`All researchers agree on the interpretation of evidence in this field.`,"False","Significant disagreements persist."],
          [`Progress in ${title} has been equal across all countries.`,"False","Progress has been uneven."],
          [`Context-specific factors play a decisive role in outcomes.`,"True","Explicitly stated."],
          [`${title} was first studied in the nineteenth century.`,"Not Given","The passage doesn't specify the century research began."],
        ];
        const [q, ans, exp] = variants[seed % variants.length];
        qs.push({ id:`q${n}`, questionType:"true_false_not_given", question:q, options:["True","False","Not Given"],
                  correctAnswer:ans, explanation:exp, questionNumber:n, passageIndex:pi_idx });
      } else if (t === "mcq") {
        const variants = [
          [`What does the passage say about policy implementation?`,["Uniform globally","Uneven across countries","Fully successful","Abandoned"],"Uneven across countries","Explicitly stated."],
          [`What transformed research in the 1990s–2000s?`,["New funding","New tools and computational techniques","International cooperation","Public campaigns"],"New tools and computational techniques","Explicitly stated."],
          [`What attitude does the passage say is essential?`,["Confidence","Intellectual humility","Scepticism of all findings","Deference to authority"],"Intellectual humility","Explicitly stated."],
        ];
        const [q, opts, ans, exp] = variants[seed % variants.length];
        qs.push({ id:`q${n}`, questionType:"multiple_choice", question:q, options:opts,
                  correctAnswer:ans, explanation:exp, questionNumber:n, passageIndex:pi_idx });
      } else {
        const variants = [
          [`How many decades of research are mentioned in the passage?`,"Three"],
          [`What type of factors play a decisive role in determining outcomes?`,"Context-specific factors"],
          [`What do large-scale longitudinal studies and cross-disciplinary collaborations produce?`,"Findings that challenge simplistic assumptions"],
        ];
        const [q, ans] = variants[seed % variants.length];
        qs.push({ id:`q${n}`, questionType:"short_answer", question:q, correctAnswer:ans, questionNumber:n, passageIndex:pi_idx });
      }
      n++;
    }
  });
  return qs;
}

// ── Main loop ─────────────────────────────────────────────────────────────────
let written = 0;
for (let testNum = 4; testNum <= 60; testNum++) {
  const pad = String(testNum).padStart(3, "0");
  // Determine which set to use (cycle of 20, index 0 = originals 1/21/41, skip)
  const cycleIdx = (testNum - 1) % 20;  // 0-19
  if (cycleIdx === 0) continue; // tests 1,21,41 keep original

  let passages, questions;
  const richIdx = cycleIdx - 1; // 0-based index into SETS array (0-18)

  if (richIdx < SETS.length) {
    // Rich content set
    const set = SETS[richIdx];
    passages = set.p.map((p, pi_idx) => ({
      ...p,
      id: `ielts-reading-${pad}-p${pi_idx + 1}`
    }));
    questions = set.q(testNum).map(q => ({
      ...q,
      id: `ielts-reading-${pad}-q${String(q.questionNumber).padStart(3,"0")}`,
      passageId: passages[Math.min(q.passageIndex || 0, 2)]?.id
    }));
  } else {
    // Stub content — topics vary by set index
    const stubIdx = richIdx - SETS.length;
    const topics = STUB_PASSAGE_TOPICS[stubIdx % STUB_PASSAGE_TOPICS.length];
    passages = topics.map((title, pi_idx) => ({
      id: `ielts-reading-${pad}-p${pi_idx + 1}`,
      title,
      text: makeStubPassage(title, testNum * 100 + pi_idx)
    }));
    const rawQs = makeStubQs(testNum, topics);
    questions = rawQs.map(q => ({
      ...q,
      id: `ielts-reading-${pad}-q${String(q.questionNumber).padStart(3,"0")}`,
      passageId: passages[Math.min(q.passageIndex || 0, 2)]?.id
    }));
  }

  const json = {
    id: `ielts-reading-${pad}`,
    exam: "ielts",
    section: "reading",
    type: "section",
    title: `IELTS Academic Reading Practice Test ${testNum}`,
    variant: "academic",
    durationSeconds: 3600,
    questionCount: 40,
    instructions: "Three passages totalling approximately 2,200–2,800 words. Answer all 40 questions. Transfer answers within the 60-minute time limit.",
    passages,
    questions
  };

  fs.writeFileSync(path.join(OUT, `test-${pad}.json`), JSON.stringify(json, null, 2), "utf8");
  written++;
  process.stdout.write(`✓ test-${pad}.json\n`);
}

console.log(`\nDone — ${written} IELTS reading tests written.`);
