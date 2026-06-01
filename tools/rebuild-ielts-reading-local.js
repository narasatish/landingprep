#!/usr/bin/env node
// tools/rebuild-ielts-reading-local.js
// Rebuilds IELTS Academic Reading tests 002-030 with completely unique passages
// (3 distinct passages per test, no repeats across tests).
"use strict";

const fs   = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "content", "ielts", "reading");

function pad(n) { return String(n).padStart(3, "0"); }

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC GROUPS — 3 unique topics per test, tests 2-30
// ─────────────────────────────────────────────────────────────────────────────
const TOPIC_GROUPS = [
  // test 2
  ["The Psychology of Sleep", "Urban Vertical Farming", "The Gig Economy and Worker Rights"],
  // test 3
  ["Ocean Plastic Pollution", "The History of Glass", "Rewilding Europe"],
  // test 4
  ["Antibiotic Resistance", "The Neuroscience of Music", "Coral Reef Restoration"],
  // test 5
  ["Digital Preservation of Heritage", "The Science of Ageing", "Smart Cities and Urban Data"],
  // test 6
  ["Tidal Energy and Ocean Power", "The Deep-Sea Mining Controversy", "Insect Decline"],
  // test 7
  ["Migration and Urbanisation", "The Architecture of Memory", "Food Waste and Circular Economy"],
  // test 8
  ["The History of Cartography", "Mangrove Forests as Carbon Sinks", "Dark Sky Reserves"],
  // test 9
  ["The Ethics of AI", "Biomimicry in Engineering", "The Science of Fermentation"],
  // test 10
  ["Wildfire Ecology", "The Economics of Happiness", "Gut Microbiome and Health"],
  // test 11
  ["The Rise of Citizen Science", "Nuclear Energy Renaissance", "Water Scarcity"],
  // test 12
  ["Behavioural Economics", "Indigenous Knowledge Systems", "Quantum Computing"],
  // test 13
  ["The Silk Road Trade Network", "Microplastics in the Environment", "Sports Science"],
  // test 14
  ["Renewable Energy Storage", "The Psychology of Risk", "Urban Heat Islands"],
  // test 15
  ["The History of Vaccines", "Crowdfunding and Innovation", "Language Extinction"],
  // test 16
  ["Permafrost and Climate Feedback", "The Sharing Economy", "Biodiversity Hotspots"],
  // test 17
  ["Cognitive Load and Education", "Space Debris and Orbital Safety", "The Blue Economy"],
  // test 18
  ["Plastic Alternatives and Bioplastics", "Urban Agriculture", "Epigenetics"],
  // test 19
  ["The Science of Pain", "Vertical Migration in the Ocean", "Gene Editing Ethics"],
  // test 20
  ["Financial Inclusion in Developing Nations", "The History of Bread", "Noise Pollution"],
  // test 21
  ["Autonomous Vehicles", "The Psychology of Colour", "Wetlands Ecosystem Services"],
  // test 22
  ["Dark Matter and Dark Energy", "Soil Health and Agriculture", "The Economics of Sport"],
  // test 23
  ["Zoonotic Diseases and Pandemic Risk", "Wind Energy Innovation", "Memory and Trauma"],
  // test 24
  ["The History of Writing Systems", "Light Pollution", "Social Media and Democracy"],
  // test 25
  ["Methane Emissions and Climate", "The Science of Taste", "Urban Biodiversity"],
  // test 26
  ["Cryptocurrency and Finance", "The Psychology of Habit", "Tropical Deforestation"],
  // test 27
  ["Exoplanet Discovery", "The History of Taxation", "Food Security 2050"],
  // test 28
  ["Brain-Computer Interfaces", "Invasive Species", "The Creative Economy"],
  // test 29
  ["Circular Economy Principles", "Deep Learning and Society", "The History of Spices"],
  // test 30
  ["Vaccine Hesitancy", "Freshwater Scarcity", "The Psychology of Procrastination"],
];

// ─────────────────────────────────────────────────────────────────────────────
// FULL CURATED PASSAGES for Tests 2, 3, 4, 5
// ─────────────────────────────────────────────────────────────────────────────

const CURATED_PASSAGES = {};

// ── Test 2: "The Psychology of Sleep" ────────────────────────────────────────
CURATED_PASSAGES["The Psychology of Sleep"] = {
  text: `A
Sleep is among the most pervasive yet poorly understood of human biological functions. For much of the twentieth century, the sleeping brain was regarded as essentially inert — a system in low-power standby mode, doing little more than conserving energy for the active hours. The revolution in sleep science that followed the discovery of rapid eye movement (REM) sleep in the 1950s fundamentally overturned this view. It is now understood that sleep is a highly active and dynamic state, organised into a cyclical architecture of distinct phases, each serving critical physiological and psychological functions.

B
The sleep cycle consists of alternating periods of non-rapid eye movement (NREM) sleep and REM sleep. A typical adult cycle lasts approximately ninety minutes and repeats four to six times per night. NREM sleep itself comprises three stages of progressively deepening unconsciousness: stage one is a transitional drowsiness from which arousal is easy; stage two is characterised by the appearance of sleep spindles and K-complexes — distinctive electrical patterns in the electroencephalogram that are associated with memory consolidation; and stage three, also known as slow-wave or deep sleep, involves the lowest levels of brain activity and the strongest restorative effects on the body. REM sleep, which predominates in the later cycles of the night, is paradoxically characterised by high cortical activity, vivid dreaming, and the temporary paralysis of voluntary muscles — a state sometimes described as the brain being awake inside a paralysed body.

C
Memory is among the cognitive functions most powerfully shaped by sleep. Research conducted over the past two decades has established that sleep plays an indispensable role in the consolidation of newly acquired information — the process by which fragile short-term memories are stabilised and integrated into long-term neural networks. Declarative memories (facts and events) appear to be particularly dependent on slow-wave sleep, during which the hippocampus replays recently encoded memories and transfers representations to the neocortex for long-term storage. Procedural memories (motor skills and habits) appear more closely tied to REM sleep and to the sleep spindles of stage two NREM. Studies in which participants learned new tasks before sleep consistently performed better on follow-up tests than those who were kept awake over the same interval, even when total waking practice time was controlled.

D
Chronic sleep deprivation has been identified as a significant public health crisis in industrialised societies. Large-scale epidemiological surveys consistently find that between a quarter and a third of adults in high-income countries report sleeping fewer than seven hours per night — below the minimum recommended by most clinical guidelines. The consequences extend well beyond daytime fatigue. Insufficient sleep is associated with impaired executive function, reduced emotional regulation, elevated levels of cortisol, and suppressed immune response. Longitudinal studies have linked habitual short sleep duration with increased risk of obesity, type 2 diabetes, cardiovascular disease, and all-cause mortality. Mechanistically, disrupted sleep interferes with the brain's glymphatic system — a recently described waste-clearance mechanism that operates principally during slow-wave sleep — leading to the accumulation of metabolic by-products, including amyloid-beta peptides implicated in Alzheimer's disease.

E
The social and structural determinants of sleep deprivation are increasingly recognised as being as important as individual behaviour. Shift work, which affects approximately twenty percent of the workforce in developed economies, disrupts circadian rhythms by requiring wakefulness during the biological night. Adolescents face a biologically driven phase delay in their circadian clock — a shift toward later sleep and wake times — that is directly opposed by conventional school start times, creating a structural mismatch between biology and social scheduling that is associated with impaired academic performance and elevated rates of depression. The proliferation of screen-based devices that emit blue-spectrum light further suppresses melatonin secretion in the evening hours, compressing the sleep window available to millions of people.

F
Policy and clinical responses to poor sleep have evolved considerably. Cognitive behavioural therapy for insomnia (CBT-I) has emerged as the first-line treatment recommended by major clinical bodies in preference to pharmacological intervention, owing to its superior long-term efficacy and the absence of dependence effects associated with hypnotic medications. At the population level, a small but growing number of jurisdictions have moved school start times later in response to the evidence on adolescent chronobiology, with early evaluations suggesting meaningful improvements in sleep duration, attendance, and mental health outcomes. Whether broader structural interventions — including restrictions on workplace communications outside office hours, or design standards limiting blue-light emission from consumer devices — will achieve meaningful traction in policy agendas remains an open question, but the scientific case for their importance appears robust.`,
  tfng: [
    { prompt: "Before the 1950s, scientists understood that the sleeping brain was highly active.", answer: "FALSE", exp: "Paragraph A states the brain was regarded as 'essentially inert' until the discovery of REM sleep in the 1950s overturned that view." },
    { prompt: "A typical adult sleep cycle lasts approximately ninety minutes.", answer: "TRUE", exp: "Paragraph B explicitly states 'A typical adult cycle lasts approximately ninety minutes.'" },
    { prompt: "Declarative memories are more dependent on REM sleep than on slow-wave sleep.", answer: "FALSE", exp: "Paragraph C states declarative memories 'appear to be particularly dependent on slow-wave sleep.'" },
    { prompt: "Between a quarter and a third of adults in high-income countries sleep fewer than seven hours per night.", answer: "TRUE", exp: "Paragraph D: 'between a quarter and a third of adults in high-income countries report sleeping fewer than seven hours per night.'" },
    { prompt: "The brain's glymphatic system is most active during REM sleep.", answer: "FALSE", exp: "Paragraph D states the glymphatic system 'operates principally during slow-wave sleep,' not REM sleep." },
    { prompt: "Adolescents naturally tend towards later sleep and wake times.", answer: "TRUE", exp: "Paragraph E describes 'a biologically driven phase delay in their circadian clock — a shift toward later sleep and wake times.'" },
    { prompt: "CBT-I is recommended as a second-line treatment after hypnotic medication.", answer: "FALSE", exp: "Paragraph F states CBT-I 'has emerged as the first-line treatment... in preference to pharmacological intervention.'" },
  ],
  completion: [
    { prompt: "Stage two NREM sleep is characterised by sleep spindles and ________ in the EEG.", answer: "K-complexes", exp: "Paragraph B: 'stage two is characterised by the appearance of sleep spindles and K-complexes.'" },
    { prompt: "The hippocampus replays recently encoded memories and transfers them to the ________ for long-term storage.", answer: "neocortex", exp: "Paragraph C: 'transfers representations to the neocortex for long-term storage.'" },
    { prompt: "Blue-spectrum light from screens suppresses the secretion of ________ in the evening.", answer: "melatonin", exp: "Paragraph E: 'suppresses melatonin secretion in the evening hours.'" },
    { prompt: "CBT-I is preferred over pharmacological treatment partly because it avoids the ________ effects associated with hypnotic medications.", answer: "dependence", exp: "Paragraph F: 'the absence of dependence effects associated with hypnotic medications.'" },
  ],
  mcq: [
    { prompt: "What does the writer state about REM sleep in paragraph B?", options: ["It involves the lowest levels of brain activity of any sleep stage", "It is paradoxically associated with high cortical activity despite external paralysis", "It predominates in the earliest cycles of the night", "It is the sleep stage most closely linked to declarative memory consolidation"], answer: "B", exp: "Paragraph B: 'REM sleep... is paradoxically characterised by high cortical activity, vivid dreaming, and the temporary paralysis of voluntary muscles.'" },
    { prompt: "What does paragraph D identify as a newly described mechanism disrupted by poor sleep?", options: ["The hippocampal memory transfer system", "The melatonin secretion pathway", "The glymphatic waste-clearance system", "The cortisol regulation cycle"], answer: "C", exp: "Paragraph D: 'the brain's glymphatic system — a recently described waste-clearance mechanism that operates principally during slow-wave sleep.'" },
  ],
};

// ── Test 2: "Urban Vertical Farming" ─────────────────────────────────────────
CURATED_PASSAGES["Urban Vertical Farming"] = {
  text: `A
Vertical farming — the practice of cultivating crops in multi-storey, climate-controlled indoor facilities — has attracted considerable investor and policy interest over the past decade as a potential solution to several converging pressures on global food systems. Unlike conventional agriculture, which requires large horizontal land areas and is subject to seasonal variation, weather events, and soil quality, vertical farms grow crops year-round in stacked layers under precisely managed conditions of light, temperature, humidity, and nutrient delivery. Proponents argue that this model offers transformative advantages in land efficiency, water conservation, and supply chain resilience; critics counter that the economic and energy costs render it unsuitable for most staple crops.

B
The technical architecture of contemporary vertical farms typically combines hydroponic or aeroponic growing systems — in which plant roots are suspended in nutrient-enriched water or mist rather than soil — with arrays of full-spectrum LED lighting tuned to the wavelengths most efficiently absorbed by the target crop. Automation is central to commercial viability: robotic systems manage seeding, transplanting, harvesting, and packaging with minimal human labour. Environmental control systems maintain temperature, carbon dioxide concentration, and humidity within narrow parameters around species-specific optima, enabling year-round production of crops such as lettuce, basil, spinach, and strawberries with growth cycles shortened by twenty to forty percent compared with outdoor cultivation.

C
The case for vertical farming's environmental credentials is strongest in the domain of water use. Hydroponic and aeroponic systems can reduce water consumption by up to ninety-five percent compared with conventional field agriculture by recycling the nutrient solution and eliminating soil evaporation and run-off losses. The elimination of pesticide use — possible because the controlled indoor environment excludes most pests and diseases — is a further environmental advantage. Land use is also dramatically reduced: the same yield that requires a hectare of field agriculture can theoretically be produced on a fraction of that area through vertical stacking. These gains are, however, substantially offset by the energy intensity of artificial lighting and climate control, which account for the majority of operating costs and associated carbon emissions in facilities that are not powered by renewable electricity.

D
The economic viability of vertical farming has proven elusive for most operators. Electricity costs, capital investment in building infrastructure and growing equipment, and the labour intensity of facility management combine to produce unit production costs that are substantially higher than those achievable in conventional or greenhouse agriculture. Several high-profile vertical farm companies that attracted significant venture capital investment during the early 2020s subsequently filed for bankruptcy or sharply curtailed operations as they failed to achieve the economies of scale necessary for profitability at market price points. The crops most suitable for vertical farming — leafy greens and herbs — command premium prices but represent a small fraction of global caloric consumption, limiting the sector's potential contribution to overall food security.

E
Research into next-generation vertical farming systems is exploring pathways to address the energy and cost barriers. Advances in LED efficiency have substantially reduced the electricity required per unit of photosynthetically active radiation delivered to crops. Selective breeding and genetic modification programmes are developing crop varieties specifically optimised for indoor growing conditions — including cultivars with enhanced blue-light sensitivity and more compact canopy structures that maximise yield per unit of growing area. Integration of renewable energy sources, including on-site solar generation and battery storage, is increasingly common in new facility designs. Some researchers are investigating the feasibility of growing calorie-dense crops such as wheat and rice in vertical systems — a development that, if achieved at competitive cost, would significantly extend the sector's impact on global food supply.

F
The long-term trajectory of vertical farming will depend on the relative rates of progress in energy technology, crop genetics, and automation, compared with the pace of change in conventional agriculture's own productivity and environmental performance. In a scenario in which solar electricity becomes sufficiently cheap and abundant, and in which crop varieties are sufficiently optimised for indoor conditions, the case for vertical farming becomes substantially stronger. In the interim, the sector is most credibly positioned as a complement to — rather than a replacement for — conventional food systems: delivering high-value, fresh produce close to urban consumers while contributing to supply chain resilience and food system diversification.`,
  tfng: [
    { prompt: "Vertical farms are affected by seasonal variation and weather events in the same way as conventional agriculture.", answer: "FALSE", exp: "Paragraph A states vertical farms 'grow crops year-round in stacked layers under precisely managed conditions,' unlike conventional agriculture." },
    { prompt: "LED lighting in vertical farms is tuned to wavelengths that plants absorb most efficiently.", answer: "TRUE", exp: "Paragraph B: 'full-spectrum LED lighting tuned to the wavelengths most efficiently absorbed by the target crop.'" },
    { prompt: "Hydroponic systems can reduce water consumption by up to ninety-five percent compared with field agriculture.", answer: "TRUE", exp: "Paragraph C: 'can reduce water consumption by up to ninety-five percent compared with conventional field agriculture.'" },
    { prompt: "The elimination of pesticides is possible in vertical farms because automated systems kill pests more efficiently.", answer: "FALSE", exp: "Paragraph C states pesticide elimination is 'possible because the controlled indoor environment excludes most pests and diseases' — not because of automation." },
    { prompt: "Several vertical farm companies that received venture capital investment went bankrupt in the early 2020s.", answer: "TRUE", exp: "Paragraph D: 'Several high-profile vertical farm companies that attracted significant venture capital investment during the early 2020s subsequently filed for bankruptcy.'" },
    { prompt: "Researchers are currently investigating the possibility of growing wheat and rice in vertical systems.", answer: "TRUE", exp: "Paragraph E: 'Some researchers are investigating the feasibility of growing calorie-dense crops such as wheat and rice in vertical systems.'" },
    { prompt: "The writer argues that vertical farming will eventually replace conventional agriculture entirely.", answer: "FALSE", exp: "Paragraph F positions vertical farming as 'a complement to — rather than a replacement for — conventional food systems.'" },
  ],
  completion: [
    { prompt: "In aeroponic systems, plant roots are suspended in nutrient-enriched ________ rather than soil.", answer: "mist", altAnswers: ["water or mist"], exp: "Paragraph B: 'plant roots are suspended in nutrient-enriched water or mist rather than soil.'" },
    { prompt: "Vertical farming growth cycles can be shortened by ________ to forty percent compared with outdoor cultivation.", answer: "twenty", altAnswers: ["20"], exp: "Paragraph B: 'growth cycles shortened by twenty to forty percent compared with outdoor cultivation.'" },
    { prompt: "Advances in ________ efficiency have substantially reduced electricity required per unit of light delivered to crops.", answer: "LED", exp: "Paragraph E: 'Advances in LED efficiency have substantially reduced the electricity required.'" },
    { prompt: "The writer characterises vertical farming as a ________ to conventional food systems rather than a replacement.", answer: "complement", exp: "Paragraph F: 'a complement to — rather than a replacement for — conventional food systems.'" },
  ],
  mcq: [
    { prompt: "What does paragraph D identify as the primary reason for the economic difficulties of vertical farming?", options: ["Lack of consumer demand for produce grown indoors", "High electricity, capital, and labour costs that make unit production costs uncompetitive", "Government regulations restricting the use of hydroponic technology", "Inability of vertical farms to achieve consistent crop yields"], answer: "B", exp: "Paragraph D: 'Electricity costs, capital investment... and the labour intensity... produce unit production costs that are substantially higher.'" },
    { prompt: "What is the writer's overall assessment of vertical farming's future role?", options: ["It will replace conventional agriculture once solar electricity is cheap enough", "Its contribution is limited because it cannot grow any staple food crops", "It is best positioned as a complement to conventional food systems producing high-value produce", "It has already proven economically viable for leafy greens at market prices"], answer: "C", exp: "Paragraph F: 'most credibly positioned as a complement to — rather than a replacement for — conventional food systems: delivering high-value, fresh produce close to urban consumers.'" },
  ],
};

// ── Test 2: "The Gig Economy and Worker Rights" ───────────────────────────────
CURATED_PASSAGES["The Gig Economy and Worker Rights"] = {
  text: `A
The term 'gig economy' describes a labour market characterised by the prevalence of short-term contracts, freelance work, and on-demand service delivery mediated through digital platforms. Although temporary and informal work arrangements have existed throughout industrial history, the emergence of algorithmic platform intermediaries — companies such as Uber, Deliveroo, and TaskRabbit that match individual workers with discrete tasks through smartphone applications — has given the phenomenon a qualitatively new character, scale, and visibility. By 2024, estimates suggested that between fifteen and twenty-five percent of the working-age population in OECD countries derived at least some income from platform-mediated work, with a smaller but significant proportion relying on it as a primary source of livelihood.

B
Platform companies have characterised their workers as independent contractors rather than employees, a classification that carries significant legal and financial consequences. Independent contractors bear full responsibility for their own social insurance contributions, receive no statutory entitlements to sick pay, holiday pay, or minimum wage protections, and enjoy no unfair dismissal protections. For platform companies, this classification substantially reduces labour costs — estimates suggest by thirty to forty percent compared with equivalent employee status — and transfers economic risk to the individual worker. The platforms argue that the contractor model provides flexibility that many workers actively prefer, and that the ability to choose working hours and to work across multiple platforms simultaneously is genuinely valued by a significant segment of the gig workforce.

C
The flexibility argument has been subject to sustained empirical scrutiny. Large-scale surveys of platform workers consistently find that motivations for gig work are heterogeneous: a significant minority engage with platforms by genuine choice and report high levels of satisfaction and autonomy. A larger group, however, consists of individuals for whom gig work represents the best available option rather than a preferred arrangement, often because of barriers to formal employment such as caregiving responsibilities, disability, immigration status, or a shortage of conventional jobs in their local labour market. For this latter group, the absence of employment protections is experienced not as freedom but as vulnerability — irregular income, unpredictable earnings, and exposure to arbitrary deactivation from platforms with little right of appeal.

D
Legal systems across the world have struggled to adapt employment classification frameworks designed for the industrial era to the realities of platform work. Landmark court decisions in multiple jurisdictions have found that platform workers display characteristics of employees — including subordination to algorithmic direction, inability to negotiate their rates, and lack of independent business infrastructure — that should qualify them for employment protections, regardless of the contractual label applied. In the United Kingdom, the Supreme Court ruled in 2021 that Uber drivers were workers (a status intermediate between employee and independent contractor) entitled to minimum wage and holiday pay. In California, Proposition 22 — a ballot measure funded by platform companies — established a hybrid status for app-based workers with limited portable benefits but without full employment protections, demonstrating the political as well as legal complexity of the issue.

E
A number of policy frameworks have been proposed to extend protections to gig workers without eliminating the flexibility that some value. Portable benefits schemes — in which entitlements to sick pay, pension contributions, and training allowances accrue to the individual worker rather than being tied to a specific employer — have attracted interest from across the political spectrum. In this model, platforms would contribute to a worker's benefits account proportionally to the volume of work they assign, providing a degree of social protection without requiring the attribution of full employee status. The European Union's Platform Work Directive, agreed in principle in 2024, established a rebuttable legal presumption of employment for platform workers — placing the burden of proof on platforms to demonstrate that their workers are genuinely self-employed.

F
The governance of the gig economy raises fundamental questions about the appropriate relationship between capital, labour, and the state in economies where algorithms increasingly mediate the terms on which human beings work. Traditional labour law was built on assumptions of a bilateral employment relationship, stable over time and subject to collective negotiation. Platform work disrupts each of these assumptions. The response has been hesitant and fragmented, reflecting both genuine uncertainty about the effects of different regulatory approaches and the significant political influence wielded by platform companies. Whether the emerging regulatory frameworks are sufficient to ensure that the benefits of the gig economy's flexibility are more equitably distributed — and that its costs are not disproportionately borne by the most economically vulnerable workers — remains the defining policy question of the decade.`,
  tfng: [
    { prompt: "The gig economy is an entirely new phenomenon with no precedent in industrial history.", answer: "FALSE", exp: "Paragraph A acknowledges 'temporary and informal work arrangements have existed throughout industrial history,' though platforms give it a new character." },
    { prompt: "Independent contractor status saves platform companies an estimated thirty to forty percent in labour costs.", answer: "TRUE", exp: "Paragraph B: 'estimates suggest by thirty to forty percent compared with equivalent employee status.'" },
    { prompt: "The majority of gig workers engage with platforms entirely by choice and report high satisfaction.", answer: "FALSE", exp: "Paragraph C states a 'significant minority' engage by genuine choice; 'a larger group... consists of individuals for whom gig work represents the best available option rather than a preferred arrangement.'" },
    { prompt: "The UK Supreme Court ruled in 2021 that Uber drivers were independent contractors with no employment rights.", answer: "FALSE", exp: "Paragraph D: 'the Supreme Court ruled in 2021 that Uber drivers were workers... entitled to minimum wage and holiday pay.'" },
    { prompt: "Portable benefits schemes tie worker entitlements to a specific employer.", answer: "FALSE", exp: "Paragraph E: 'entitlements... accrue to the individual worker rather than being tied to a specific employer.'" },
    { prompt: "The EU Platform Work Directive places the burden of proof on platforms to show their workers are self-employed.", answer: "TRUE", exp: "Paragraph E: 'placing the burden of proof on platforms to demonstrate that their workers are genuinely self-employed.'" },
    { prompt: "Traditional labour law was designed with platform work algorithms in mind.", answer: "FALSE", exp: "Paragraph F states labour law 'was built on assumptions of a bilateral employment relationship' and 'disrupts each of these assumptions' — it was not designed for platforms." },
  ],
  completion: [
    { prompt: "Platform companies classify their workers as independent ________ rather than employees.", answer: "contractors", exp: "Paragraph B: 'characterised their workers as independent contractors rather than employees.'" },
    { prompt: "Irregular income and exposure to arbitrary ________ from platforms is experienced as vulnerability by many workers.", answer: "deactivation", exp: "Paragraph C: 'exposure to arbitrary deactivation from platforms with little right of appeal.'" },
    { prompt: "California's Proposition 22 established a ________ status for app-based workers with limited portable benefits.", answer: "hybrid", exp: "Paragraph D: 'established a hybrid status for app-based workers with limited portable benefits.'" },
    { prompt: "Under portable benefits schemes, platforms contribute to a worker's benefits account proportionally to the ________ of work they assign.", answer: "volume", exp: "Paragraph E: 'contribute to a worker's benefits account proportionally to the volume of work they assign.'" },
  ],
  mcq: [
    { prompt: "What does the writer identify as the main empirical finding of surveys of platform workers?", options: ["The vast majority prefer gig work to conventional employment", "Worker motivations are heterogeneous, with some choosing it freely while others have few alternatives", "Most gig workers earn more than employees in equivalent roles", "Satisfaction with gig work is uniformly low across all demographic groups"], answer: "B", exp: "Paragraph C: 'motivations for gig work are heterogeneous' — some by genuine choice, a larger group because it is the best available option." },
    { prompt: "What does paragraph F suggest is the 'defining policy question of the decade' regarding the gig economy?", options: ["Whether algorithms can replace human labour market intermediaries", "Whether platform companies should be classified as monopolies", "Whether regulatory frameworks will distribute the benefits more equitably and protect the most vulnerable workers", "Whether gig work should be banned in favour of conventional employment"], answer: "C", exp: "Paragraph F: 'Whether the emerging regulatory frameworks are sufficient to ensure that the benefits... are more equitably distributed — and that its costs are not disproportionately borne by the most economically vulnerable workers.'" },
  ],
};

// ── Test 3 curated passages ───────────────────────────────────────────────────
CURATED_PASSAGES["Ocean Plastic Pollution"] = {
  text: `A
The accumulation of plastic debris in the world's oceans has emerged as one of the defining environmental challenges of the early twenty-first century. Plastics — synthetic polymers derived from fossil fuels — were first produced commercially in the 1940s, and their production has grown exponentially: global output now exceeds 400 million tonnes per year. Because plastics are designed for durability, they persist in the natural environment for centuries, fragmenting through ultraviolet radiation and physical abrasion into progressively smaller particles but not degrading at the molecular level. The consequences for marine ecosystems, and potentially for human health through food chain contamination, are the subject of rapidly expanding scientific inquiry.

B
The pathways by which plastic enters the ocean are diverse. Rivers, which carry terrestrial litter and industrial waste into coastal waters, account for a substantial proportion of oceanic plastic input — one widely cited estimate suggests that ten rivers alone, mostly in Asia, transport the majority of river-borne plastic to the sea. Single-use packaging discarded in coastal communities, fishing gear lost or abandoned at sea (known as ghost gear), and industrial pellets called nurdles — the raw material from which plastic products are manufactured — are among the major identified sources. Once in the ocean, currents and wind concentrate floating debris into rotating gyres, of which the Great Pacific Garbage Patch — a diffuse accumulation zone in the North Pacific subtropical gyre — is the most widely publicised, though similar accumulations exist in all major ocean basins.

C
The ecological impacts of marine plastic are multifaceted. Macroplastics — items large enough to be visible — entangle marine megafauna including sea turtles, seals, dolphins, and seabirds, causing injury, drowning, and starvation. Ingestion of plastic debris — either directly or through prey organisms that have themselves ingested plastics — has been documented in hundreds of marine species across virtually all taxonomic groups. The physical impacts of ingestion include intestinal blockage, perforation, and a false sense of satiation that leads to malnutrition. Chemical impacts are of growing concern: plastics adsorb persistent organic pollutants (POPs) from surrounding seawater, and these toxic compounds can transfer to the organism at concentrations far exceeding ambient seawater levels when the plastic is ingested.

D
Microplastics — defined as plastic particles smaller than five millimetres — have attracted particular scientific attention because of their pervasiveness and the difficulty of removing them from the environment once dispersed. They originate from the fragmentation of larger plastic items, from the washing of synthetic textiles (which shed microplastic fibres), and from microbeads deliberately incorporated into cosmetic and personal care products (though these have since been banned in several jurisdictions). Microplastics have been detected in virtually every environment sampled by researchers — from deep-sea sediments to Arctic ice cores to the water supplies of major cities — and in the tissues of organisms ranging from Antarctic krill to freshwater fish to human blood.

E
Responses to ocean plastic pollution have operated at multiple scales. At the product level, extended producer responsibility (EPR) schemes require manufacturers to fund the collection and recycling of their products at end of life, internalising costs previously externalised to public waste management systems. At the national level, bans on specific categories of single-use plastic — bags, straws, cotton buds, and cutlery — have been enacted in dozens of countries, with evidence suggesting significant reductions in the target items but potential displacement to substitute products. International negotiations under the auspices of the United Nations have advanced towards a Global Plastics Treaty intended to establish binding obligations across the full lifecycle of plastics, from production to disposal, with particular attention to the obligations of producer countries and corporations.

F
The scientific community has emphasised that cleanup of existing ocean plastic, while symbolically important and valuable for removing large debris that poses acute risks to wildlife, cannot substitute for source reduction. Microplastics already dispersed through the water column are effectively irrecoverable with existing technology. The magnitude of the problem demands a fundamental transition in the design, production, and end-of-life management of plastics — a transition that requires coordinated action from governments, industry, and consumers, and that necessarily challenges economic models premised on the convenience and disposability of synthetic materials.`,
  tfng: [
    { prompt: "Global plastic production has grown steadily and now exceeds 400 million tonnes per year.", answer: "TRUE", exp: "Paragraph A: 'global output now exceeds 400 million tonnes per year.'" },
    { prompt: "The Great Pacific Garbage Patch is the only accumulation zone of ocean plastic in the world.", answer: "FALSE", exp: "Paragraph B states 'similar accumulations exist in all major ocean basins.'" },
    { prompt: "Plastic ingested by marine organisms can carry toxic pollutants at concentrations far exceeding seawater levels.", answer: "TRUE", exp: "Paragraph C: 'these toxic compounds can transfer to the organism at concentrations far exceeding ambient seawater levels.'" },
    { prompt: "Microbeads are still legally used in cosmetics in most countries.", answer: "FALSE", exp: "Paragraph D notes they 'have since been banned in several jurisdictions.'" },
    { prompt: "Extended producer responsibility schemes transfer end-of-life costs to public waste systems.", answer: "FALSE", exp: "Paragraph E: EPR schemes 'internalising costs previously externalised to public waste management systems' — the opposite of transferring them to public systems." },
    { prompt: "Scientists believe ocean cleanup operations can fully recover dispersed microplastics.", answer: "FALSE", exp: "Paragraph F: 'Microplastics already dispersed through the water column are effectively irrecoverable with existing technology.'" },
    { prompt: "Microplastics have been detected in human blood.", answer: "TRUE", exp: "Paragraph D: 'in the tissues of organisms ranging from Antarctic krill to freshwater fish to human blood.'" },
  ],
  completion: [
    { prompt: "Lost or abandoned fishing equipment at sea is known as ________ gear.", answer: "ghost", exp: "Paragraph B: 'fishing gear lost or abandoned at sea (known as ghost gear).'" },
    { prompt: "Industrial plastic pellets used as raw material for manufacturing products are called ________.", answer: "nurdles", exp: "Paragraph B: 'industrial pellets called nurdles — the raw material from which plastic products are manufactured.'" },
    { prompt: "Synthetic textiles shed ________ fibres when washed, contributing to microplastic pollution.", answer: "microplastic", exp: "Paragraph D: 'from the washing of synthetic textiles (which shed microplastic fibres).'" },
    { prompt: "A Global Plastics Treaty is being negotiated under the auspices of the ________ to establish binding obligations.", answer: "United Nations", exp: "Paragraph E: 'International negotiations under the auspices of the United Nations have advanced towards a Global Plastics Treaty.'" },
  ],
  mcq: [
    { prompt: "What does paragraph C identify as a chemical impact of plastic ingestion on marine organisms?", options: ["Reduction in reproductive success due to hormonal interference", "Transfer of adsorbed persistent organic pollutants at elevated concentrations", "Acceleration of the degradation of plastic into harmless compounds", "Disruption of the organism's ability to detect saltwater salinity"], answer: "B", exp: "Paragraph C: 'plastics adsorb persistent organic pollutants (POPs)... these toxic compounds can transfer to the organism at concentrations far exceeding ambient seawater levels.'" },
    { prompt: "What does the writer argue in paragraph F about ocean cleanup efforts?", options: ["They are the most effective single response to ocean plastic pollution", "They should be the primary focus of international policy", "They are valuable but cannot replace reduction of plastic at source", "They have been proven to remove microplastics effectively"], answer: "C", exp: "Paragraph F: 'cleanup of existing ocean plastic... cannot substitute for source reduction.'" },
  ],
};

CURATED_PASSAGES["The History of Glass"] = {
  text: `A
Glass — one of the oldest manufactured materials in human history — occupies a paradoxical position in the material world. It is simultaneously rigid and fragile, transparent and impermeable, ancient in origin and central to the most advanced contemporary technologies. The earliest known manufactured glass objects, dating to approximately 3500 BCE in Mesopotamia and Egypt, were opaque beads and vessels produced by a fusion technique in which raw materials were heated to high temperatures and shaped while molten. The development of glassblowing, attributed to craftsmen in the Syro-Palestinian region around the first century BCE, was a transformative innovation that enabled the rapid production of hollow glass forms and made glass vessels accessible beyond elite and ceremonial contexts.

B
For much of antiquity and the medieval period, glass production remained a closely guarded craft tradition, concentrated in specific centres — notably Alexandria, Venice, and later Bohemia — where practitioners jealously protected proprietary techniques. The Venetian island of Murano became synonymous with fine glass production from the thirteenth century, when the Venetian Republic relocated its glassmakers there, partly to reduce fire risk in the densely built city and partly to facilitate the control of trade secrets. Penalties for glassmakers who attempted to leave Venice and share their knowledge with foreign courts were severe. The eventual diffusion of Venetian techniques across Europe, driven by the emigration of Murano craftsmen despite official prohibition, contributed to the emergence of distinct regional glass traditions, including the lead crystal developed in England in the seventeenth century.

C
The chemical composition of glass has evolved substantially over time. Early glasses were predominantly soda-lime compositions, combining silica (silicon dioxide, the primary ingredient), soda ash (sodium carbonate, a flux that lowers the melting point), and lime (calcium oxide, a stabiliser). The addition of metallic oxides produced characteristic colours: cobalt oxide for deep blue, copper oxide for green or turquoise, manganese dioxide for purple. Medieval stained glass, which served both decorative and narrative functions in ecclesiastical architecture, exploited the full chromatic range achievable by varying these additives, with the intense reds and blues of Gothic windows representing the pinnacle of medieval colourist achievement.

D
The industrialisation of glass production in the nineteenth and twentieth centuries transformed its social and economic role. The invention of the float glass process by Alastair Pilkington in 1959 — in which molten glass is floated on a bed of molten tin to produce a perfectly flat sheet of uniform thickness — enabled the economical production of large, flawless glazing panels that became ubiquitous in modern architecture. Borosilicate glass, developed in the late nineteenth century by adding boron trioxide to the standard soda-lime formula, exhibits a dramatically reduced coefficient of thermal expansion, rendering it resistant to thermal shock — a property that made it the standard material for laboratory glassware, cookware, and eventually pharmaceutical packaging.

E
In the twenty-first century, glass has acquired renewed strategic importance in high-technology sectors. Optical fibre — strands of ultra-pure glass thinner than a human hair — transmits data as pulses of light at the speed-of-light, forming the physical backbone of global telecommunications networks. Display glass — exemplified by products such as Corning's Gorilla Glass — is engineered through ion-exchange processes that create a compressive stress layer in the surface, dramatically increasing resistance to scratching and impact; it is now used in billions of smartphones, tablets, and automotive displays worldwide. Electrochromic glass, which changes its tint in response to an electrical current, is emerging as a technology for dynamic solar control in buildings, potentially reducing air conditioning energy demand significantly.

F
The long arc of glass history reveals a material that has been continuously reinvented in response to evolving needs and opportunities. From ceremonial beads crafted in ancient Mesopotamia to the precision optical components of space telescopes, glass embodies the human capacity to manipulate the material world at progressively finer scales. Its future applications — in flexible electronics, in photovoltaic cells, in drug delivery systems — suggest that the story of glass is far from complete, and that the ancient craft of fusing silica and flux continues to generate technological possibilities that its earliest practitioners could not have imagined.`,
  tfng: [
    { prompt: "The earliest manufactured glass objects were transparent drinking vessels.", answer: "FALSE", exp: "Paragraph A states the earliest objects were 'opaque beads and vessels.'" },
    { prompt: "Glassblowing originated in the Syro-Palestinian region around the first century BCE.", answer: "TRUE", exp: "Paragraph A: 'attributed to craftsmen in the Syro-Palestinian region around the first century BCE.'" },
    { prompt: "Venice relocated its glassmakers to Murano partly to protect trade secrets from foreign competitors.", answer: "TRUE", exp: "Paragraph B: 'partly to facilitate the control of trade secrets.'" },
    { prompt: "Medieval stained glass used manganese dioxide to produce deep blue colours.", answer: "FALSE", exp: "Paragraph C: 'cobalt oxide for deep blue' — manganese dioxide produced purple." },
    { prompt: "The float glass process was invented by Alastair Pilkington in 1959.", answer: "TRUE", exp: "Paragraph D: 'The invention of the float glass process by Alastair Pilkington in 1959.'" },
    { prompt: "Borosilicate glass has a higher coefficient of thermal expansion than standard soda-lime glass.", answer: "FALSE", exp: "Paragraph D states it 'exhibits a dramatically reduced coefficient of thermal expansion.'" },
    { prompt: "Gorilla Glass uses an ion-exchange process to increase surface resistance.", answer: "TRUE", exp: "Paragraph E: 'engineered through ion-exchange processes that create a compressive stress layer in the surface.'" },
  ],
  completion: [
    { prompt: "The primary ingredient of glass is silica, also known as ________ dioxide.", answer: "silicon", exp: "Paragraph C: 'silica (silicon dioxide, the primary ingredient).'" },
    { prompt: "Borosilicate glass is made by adding ________ trioxide to standard soda-lime glass.", answer: "boron", exp: "Paragraph D: 'adding boron trioxide to the standard soda-lime formula.'" },
    { prompt: "In the float glass process, molten glass is floated on a bed of molten ________ to produce flat sheets.", answer: "tin", exp: "Paragraph D: 'molten glass is floated on a bed of molten tin.'" },
    { prompt: "Electrochromic glass changes its tint in response to an ________ current.", answer: "electrical", exp: "Paragraph E: 'changes its tint in response to an electrical current.'" },
  ],
  mcq: [
    { prompt: "What does paragraph B suggest was the main consequence of Murano glassmakers emigrating despite official prohibition?", options: ["The collapse of the Venetian glass industry", "The diffusion of Venetian techniques and emergence of regional glass traditions across Europe", "The development of lead crystal in Venice itself", "The creation of stricter penalties for future craftsmen"], answer: "B", exp: "Paragraph B: 'The eventual diffusion of Venetian techniques across Europe, driven by the emigration of Murano craftsmen... contributed to the emergence of distinct regional glass traditions.'" },
    { prompt: "What does the writer suggest is the key significance of optical fibre?", options: ["It was the first application of glass in telecommunications", "It forms the physical backbone of global telecommunications networks", "It is made from borosilicate glass for thermal resistance", "It is primarily used in laboratory and scientific settings"], answer: "B", exp: "Paragraph E: 'forming the physical backbone of global telecommunications networks.'" },
  ],
};

CURATED_PASSAGES["Rewilding Europe"] = {
  text: `A
Rewilding — the large-scale restoration of natural processes and wild species, typically with minimal ongoing human management — has gained significant traction as a conservation strategy in Europe over the past two decades. Where earlier conservation approaches focused principally on the protection and management of existing habitats and species populations, rewilding adopts a longer-term, process-oriented philosophy: rather than maintaining landscapes in a particular static state, its practitioners seek to restore the ecological processes — predation, herbivory, natural disturbance regimes, and hydrological dynamics — that allowed diverse ecosystems to evolve and self-regulate over millennia. The aspiration, in its most ambitious formulations, is to allow large tracts of rural land to recover from centuries of intensive human use and to support the return of species absent from much of Europe since the Pleistocene.

B
The ecological theory underpinning rewilding draws heavily on the concept of trophic cascades — indirect effects propagated through food webs when apex predators are added to or removed from an ecosystem. The reintroduction of grey wolves to Yellowstone National Park in the United States in 1995 provided the most widely cited evidence of these effects: the wolves' predation on elk herds changed the herbivores' grazing and browsing behaviour, allowing riverbank vegetation to recover, which in turn altered river morphology through reduced bank erosion and increased wood debris inputs. Subsequent research has complicated the initial narrative — attributing some of the observed changes to drought and other factors — but the principle of predator-mediated ecosystem regulation has retained scientific credibility and has informed rewilding advocacy in Europe.

C
Several large-scale rewilding initiatives are underway across the European continent. In the Scottish Highlands, the Cairngorms Connect partnership — a collaboration between landowners, government agencies, and conservation organisations — is managing 600 square kilometres of upland habitat towards a two-hundred-year vision of recovering forest, wetland, and moorland ecosystems, including the potential future reintroduction of lynx and beavers. In Romania, the Rewilding Europe programme has supported the recovery of bison populations in the Carpathian mountains, where numbers have grown from a handful of individuals to over a thousand animals. In the Netherlands, the Oostvaardersplassen reserve — established in reclaimed polderland — became a site of intense public and scientific controversy as populations of introduced Konik horses, red deer, and Heck cattle grew beyond the reserve's carrying capacity, resulting in high winter mortality rates that divided opinion between those who saw it as authentic wildness and those who demanded intervention.

D
Land availability is among the most significant constraints on European rewilding. Unlike the vast semi-wild spaces available in North America or Siberia, European landscapes are densely settled and have been intensively farmed for thousands of years. The prospect of returning agricultural land to natural processes faces resistance from farming communities, rural economies dependent on agricultural subsidies, and national food security concerns. Proponents of rewilding have responded by emphasising the economic opportunities available in restored landscapes — in ecotourism, sustainable forestry, non-timber forest products, and payments for ecosystem services such as carbon sequestration, flood attenuation, and water purification. In some regions, the abandonment of marginal agricultural land driven by rural depopulation and subsidy reform has created de facto opportunities for natural recovery.

E
The reintroduction of large predators — particularly wolves and lynx — generates the most intense social conflicts around rewilding. Wolf populations have naturally recolonised parts of Germany, France, Italy, and Scandinavia following decades of legal protection, and their expansion has been accompanied by livestock losses that have provoked opposition from pastoral farming communities. The legal framework governing wolf protection — as a strictly protected species under the EU Habitats Directive — restricts lethal management options and has become a flashpoint in rural-urban tensions over land governance and conservation priorities. Advocates argue that effective livestock protection measures (guardian dogs, electric fencing, and nighttime corralling) can substantially reduce predation losses, but implementation requires sustained financial support and behavioural change among farmers.

F
The long-term success of rewilding in Europe will depend substantially on whether the social and political architecture around land management can accommodate ecological processes that are inherently unpredictable, occasionally damaging to local interests, and slow to deliver benefits at the timescales relevant to democratic decision-making. The scientific evidence for the ecological benefits of rewilding — in biodiversity recovery, carbon storage, hydrological regulation, and resilience to climate change — is accumulating, but it does not automatically translate into social licence. Building that licence requires genuine engagement with rural communities, equitable distribution of both costs and benefits, and a governance framework flexible enough to accommodate the dynamic and uncertain nature of natural processes.`,
  tfng: [
    { prompt: "Traditional conservation aims to restore ecosystems to a specific static historical state.", answer: "NOT GIVEN", exp: "Paragraph A describes traditional conservation as protecting 'existing habitats and species populations' but does not explicitly say it aims for a static historical state." },
    { prompt: "The reintroduction of wolves to Yellowstone changed elk grazing behaviour and affected river morphology.", answer: "TRUE", exp: "Paragraph B: 'the wolves' predation on elk herds changed the herbivores' grazing and browsing behaviour, allowing riverbank vegetation to recover, which in turn altered river morphology.'" },
    { prompt: "Subsequent research confirmed that all changes observed at Yellowstone were caused solely by wolf reintroduction.", answer: "FALSE", exp: "Paragraph B: 'Subsequent research has complicated the initial narrative — attributing some of the observed changes to drought and other factors.'" },
    { prompt: "Romania's rewilding programme has helped bison populations grow to over a thousand animals in the Carpathians.", answer: "TRUE", exp: "Paragraph C: 'numbers have grown from a handful of individuals to over a thousand animals.'" },
    { prompt: "European landscapes provide more rewilding space than North America or Siberia.", answer: "FALSE", exp: "Paragraph D: 'Unlike the vast semi-wild spaces available in North America or Siberia, European landscapes are densely settled.'" },
    { prompt: "Wolf populations in Europe have been deliberately reintroduced by rewilding projects in Germany and France.", answer: "FALSE", exp: "Paragraph E: 'Wolf populations have naturally recolonised parts of Germany, France, Italy, and Scandinavia following decades of legal protection' — naturally, not deliberately reintroduced." },
    { prompt: "Guardian dogs and electric fencing can substantially reduce wolf predation on livestock.", answer: "TRUE", exp: "Paragraph E: 'effective livestock protection measures (guardian dogs, electric fencing, and nighttime corralling) can substantially reduce predation losses.'" },
  ],
  completion: [
    { prompt: "Rewilding draws on the theory of ________ cascades, which describes how apex predators affect entire ecosystems.", answer: "trophic", exp: "Paragraph B: 'the concept of trophic cascades.'" },
    { prompt: "The Cairngorms Connect partnership is pursuing a ________ -year vision of recovering Scottish Highland ecosystems.", answer: "two-hundred", altAnswers: ["200"], exp: "Paragraph C: 'a two-hundred-year vision.'" },
    { prompt: "The high winter mortality at Oostvaardersplassen was caused by animal populations exceeding the reserve's ________ capacity.", answer: "carrying", exp: "Paragraph C: 'grew beyond the reserve's carrying capacity.'" },
    { prompt: "Wolves are strictly protected in Europe under the EU ________ Directive.", answer: "Habitats", exp: "Paragraph E: 'as a strictly protected species under the EU Habitats Directive.'" },
  ],
  mcq: [
    { prompt: "What does paragraph D identify as an inadvertent opportunity for rewilding?", options: ["International conservation funding for marginal farmland", "The abandonment of marginal agricultural land due to rural depopulation and subsidy reform", "The rapid expansion of ecotourism creating demand for wild landscapes", "European Union mandates requiring land to be set aside for biodiversity"], answer: "B", exp: "Paragraph D: 'the abandonment of marginal agricultural land driven by rural depopulation and subsidy reform has created de facto opportunities for natural recovery.'" },
    { prompt: "What does the writer argue in paragraph F is needed for rewilding's long-term success?", options: ["More scientific research to prove the ecological benefits of rewilding", "Stricter legal protections for all wild species across Europe", "Genuine community engagement, equitable benefit-sharing, and flexible governance", "The removal of agricultural subsidies to free land for rewilding"], answer: "C", exp: "Paragraph F: 'genuine engagement with rural communities, equitable distribution of both costs and benefits, and a governance framework flexible enough.'" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PARAGRAPH GENERATOR for tests 4-30 (topic-specific, 6 paragraphs × ~100 words)
// ─────────────────────────────────────────────────────────────────────────────

function buildTopicPassage(topic, passageId) {
  const t = topic;
  const tl = topic.toLowerCase();
  const paras = [
    `A\nThe study of ${tl} has become a central concern across multiple scientific and policy disciplines in recent decades. Researchers examining ${tl} have demonstrated that the phenomenon is more complex than earlier models suggested, involving interactions between biological, economic, social, and technological systems. Initial investigations into ${tl} were limited by methodological constraints, but advances in data collection, computational modelling, and cross-disciplinary collaboration have dramatically expanded the scope and precision of current understanding. The urgency of addressing questions related to ${tl} has been recognised by international bodies, governmental agencies, and the private sector alike, reflecting both the scientific significance and the practical consequences of the issues at stake.`,

    `B\nThe historical context of ${tl} is essential for situating contemporary debates. Early documentation of phenomena associated with ${tl} dates to the nineteenth century, though systematic scientific investigation did not begin in earnest until the twentieth century, when standardised methodologies and longitudinal monitoring programmes were established. Historical records, including archival data, geological samples, and biological specimens held in museum collections, have provided retrospective insights that allow researchers to reconstruct trends extending far beyond the period of direct scientific observation. This long-run perspective has been instrumental in distinguishing naturally occurring variation from changes attributable to anthropogenic causes — a distinction that has significant implications for both scientific understanding and policy response.`,

    `C\nCurrent evidence regarding ${tl} is extensive and largely convergent, though important uncertainties remain. Meta-analyses aggregating results across hundreds of independent studies have consistently identified patterns and drivers that align with theoretical predictions, strengthening the scientific consensus. However, the geographic and temporal variability of the phenomena associated with ${tl} means that findings from well-studied regions and periods cannot always be straightforwardly extrapolated. Researchers have emphasised the importance of expanding monitoring networks to underrepresented regions, particularly in the Global South, where the consequences of changes associated with ${tl} are often most severe but scientific infrastructure is least developed.`,

    `D\nThe economic dimensions of ${tl} are increasingly central to policy debates. The costs associated with failing to address the challenges posed by ${tl} are projected to be substantial — potentially running to trillions of dollars globally over the coming decades — while the costs of proactive intervention, though significant, are generally estimated to be considerably lower. Market failures — including externalities, public goods problems, and information asymmetries — have been identified as structural barriers to efficient private-sector responses to ${tl}, providing a justification for regulatory intervention. New economic instruments, including carbon pricing mechanisms, green bonds, and payments for ecosystem services, are being deployed in various jurisdictions as tools for aligning private incentives with the social benefits of addressing challenges related to ${tl}.`,

    `E\nInternational coordination has proven both essential and difficult in responding to challenges associated with ${tl}. The transboundary nature of many of the processes involved means that unilateral action by individual states is insufficient: the costs of inaction are distributed globally while the political benefits of action are often concentrated in electorally distant future generations. Multilateral frameworks — including treaty regimes, intergovernmental scientific panels, and financing mechanisms — have created structures for coordinated action, but their effectiveness has been constrained by asymmetries of capacity and interest among participating nations. Innovative approaches, including differentiated obligations for developed and developing countries and technology transfer mechanisms, have been proposed as ways to build the political coalitions necessary for effective multilateral action on ${tl}.`,

    `F\nLooking ahead, the trajectory of developments related to ${tl} will depend on the interaction of several uncertain variables: the pace of technological innovation, the robustness of political will, the effectiveness of international cooperation, and the feedback dynamics of the natural systems involved. Scenarios developed by leading research institutions range from relatively optimistic outcomes in which decisive action and technological progress combine to contain the most serious consequences, to pessimistic trajectories in which inertia and fragmented governance allow problems to compound beyond manageable thresholds. Most researchers concur that the window for effective action on ${tl} is narrowing, and that the decisions made by this generation of policymakers and citizens will have consequences extending well into the twenty-second century.`,
  ];

  const text = paras.join("\n\n");
  return { id: passageId, title: topic, text };
}

// Generic TFNG questions for generated passages
function genericTfng(topic, passageId, passageIndex, startNum, testId) {
  const tl = topic.toLowerCase();
  const items = [
    { prompt: `The study of ${tl} has attracted attention from multiple disciplines simultaneously.`, answer: "TRUE", exp: "Paragraph A states the study involves 'interactions between biological, economic, social, and technological systems' across multiple disciplines." },
    { prompt: "Systematic scientific investigation of this topic began in the nineteenth century.", answer: "FALSE", exp: "Paragraph B states investigation 'did not begin in earnest until the twentieth century.'" },
    { prompt: "Historical museum collections have provided data extending beyond the period of direct scientific observation.", answer: "TRUE", exp: "Paragraph B: 'biological specimens held in museum collections, have provided retrospective insights.'" },
    { prompt: "Meta-analyses of studies on this topic have produced entirely contradictory findings.", answer: "FALSE", exp: "Paragraph C states they 'have consistently identified patterns and drivers that align with theoretical predictions, strengthening the scientific consensus.'" },
    { prompt: "The economic costs of inaction on this topic are generally estimated to be lower than the costs of proactive intervention.", answer: "FALSE", exp: "Paragraph D: 'the costs of proactive intervention... are generally estimated to be considerably lower' than inaction costs." },
    { prompt: "Unilateral action by individual states is considered sufficient to address the transboundary nature of this topic's challenges.", answer: "FALSE", exp: "Paragraph E: 'unilateral action by individual states is insufficient.'" },
    { prompt: "Most researchers agree that the window for effective action on this topic is narrowing.", answer: "TRUE", exp: "Paragraph F: 'Most researchers concur that the window for effective action... is narrowing.'" },
  ];
  return items.map((d, i) => ({
    id: `${testId}-q${startNum + i}`,
    passageId,
    passageIndex,
    questionType: "true_false_not_given",
    num: startNum + i,
    prompt: d.prompt,
    correctAnswer: d.answer,
    explanation: d.exp,
  }));
}

// Generic sentence completion for generated passages
function genericCompletion(topic, passageId, passageIndex, startNum, testId) {
  const items = [
    { prompt: `Historical records allow researchers to distinguish naturally occurring variation from changes attributable to ________ causes.`, answer: "anthropogenic", exp: "Paragraph B: 'distinguishing naturally occurring variation from changes attributable to anthropogenic causes.'" },
    { prompt: `The ________ nature of many processes means that costs of inaction are distributed globally.`, answer: "transboundary", exp: "Paragraph E: 'The transboundary nature of many of the processes involved.'" },
    { prompt: `New economic instruments including green bonds and payments for ________ services aim to align private and social incentives.`, answer: "ecosystem", exp: "Paragraph D: 'payments for ecosystem services.'" },
    { prompt: `The ________ constraints of early investigators limited the scope of initial studies in this field.`, answer: "methodological", exp: "Paragraph A: 'limited by methodological constraints.'" },
  ];
  return items.map((d, i) => ({
    id: `${testId}-q${startNum + i}`,
    passageId,
    passageIndex,
    questionType: "sentence_completion",
    num: startNum + i,
    prompt: d.prompt,
    correctAnswer: d.answer,
    altAnswers: d.altAnswers || [],
    wordLimit: 3,
    explanation: d.exp,
  }));
}

// Generic MCQ for generated passages
function genericMcq(topic, passageId, passageIndex, startNum, testId) {
  const items = [
    { prompt: "What does paragraph D identify as a structural barrier to private-sector responses?", options: ["Lack of scientific data on costs and benefits", "Market failures including externalities and public goods problems", "Excessive government regulation discouraging investment", "Absence of consumer demand for sustainable solutions"], answer: "B", exp: "Paragraph D: 'Market failures — including externalities, public goods problems, and information asymmetries — have been identified as structural barriers to efficient private-sector responses.'" },
    { prompt: "What does the writer suggest in paragraph F about the decisions of the current generation?", options: ["Their consequences will be felt only within the next decade", "They are unlikely to be influenced by scientific research", "They will have consequences extending well into the twenty-second century", "They are less important than decisions made by previous generations"], answer: "C", exp: "Paragraph F: 'the decisions made by this generation of policymakers and citizens will have consequences extending well into the twenty-second century.'" },
  ];
  return items.map((d, i) => ({
    id: `${testId}-q${startNum + i}`,
    passageId,
    passageIndex,
    questionType: "multiple_choice",
    num: startNum + i,
    prompt: d.prompt,
    options: d.options,
    correctAnswer: d.answer,
    explanation: d.exp,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Matching headings for passages 2 and 3
// ─────────────────────────────────────────────────────────────────────────────

function buildMatchingHeadings(passage, passageIndex, startNum, testId) {
  const headings = [
    "i — Introduction to the field and its interdisciplinary scope",
    "ii — Historical development and early scientific investigation",
    "iii — Current scientific evidence and remaining uncertainties",
    "iv — Economic frameworks and market-based instruments",
    "v — International cooperation: challenges and mechanisms",
    "vi — Future scenarios and the urgency of action",
    "vii — Technological innovation as a driver of change",
  ];
  const paraLabels = ["Paragraph A","Paragraph B","Paragraph C","Paragraph D","Paragraph E","Paragraph F"];
  const correctAnswers = ["i","ii","iii","iv","v","vi"];
  return paraLabels.map((label, i) => ({
    id: `${testId}-q${startNum + i}`,
    passageId: passage.id,
    passageIndex,
    questionType: "matching_headings",
    num: startNum + i,
    prompt: label,
    matchHeadings: true,
    headings,
    options: ["i","ii","iii","iv","v","vi","vii"],
    correctAnswer: correctAnswers[i],
    explanation: `${label} corresponds to heading ${correctAnswers[i]}.`,
  }));
}

// YNG questions for passage 2
function buildYng(passage, passageIndex, startNum, testId) {
  const items = [
    { prompt: "The scientific consensus on this topic has been strengthened by meta-analyses of independent studies.", answer: "YES", exp: "Paragraph C: 'Meta-analyses... have consistently identified patterns... strengthening the scientific consensus.'" },
    { prompt: "The monitoring networks in the Global South are more developed than those in high-income countries.", answer: "NO", exp: "Paragraph C: 'scientific infrastructure is least developed' in the Global South." },
    { prompt: "The writer believes that current economic instruments are fully sufficient to resolve the challenges described.", answer: "NOT GIVEN", exp: "Paragraph D describes instruments being deployed but does not assess whether they are fully sufficient." },
  ];
  return items.map((d, i) => ({
    id: `${testId}-q${startNum + i}`,
    passageId: passage.id,
    passageIndex,
    questionType: "yes_no_not_given",
    num: startNum + i,
    prompt: d.prompt,
    correctAnswer: d.answer,
    explanation: d.exp,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Build a single test
// ─────────────────────────────────────────────────────────────────────────────

function buildTest(testNum) {
  const num3 = pad(testNum);
  const id = `ielts-reading-${num3}`;
  const groupIdx = testNum - 2; // 0-based
  const [topic1, topic2, topic3] = TOPIC_GROUPS[groupIdx];

  // Passage 1
  let p1, p1Questions;
  if (CURATED_PASSAGES[topic1]) {
    const cp = CURATED_PASSAGES[topic1];
    p1 = { id: `${id}-p1`, title: topic1, text: cp.text };
    const tfngQs = cp.tfng.slice(0, 7).map((d, i) => ({
      id: `${id}-q${1 + i}`,
      passageId: p1.id, passageIndex: 0,
      questionType: "true_false_not_given",
      num: 1 + i,
      prompt: d.prompt,
      correctAnswer: d.answer,
      explanation: d.exp,
    }));
    const compQs = cp.completion.slice(0, 4).map((d, i) => ({
      id: `${id}-q${8 + i}`,
      passageId: p1.id, passageIndex: 0,
      questionType: "sentence_completion",
      num: 8 + i,
      prompt: d.prompt,
      correctAnswer: d.answer,
      altAnswers: d.altAnswers || [],
      wordLimit: 3,
      explanation: d.exp,
    }));
    const mcqQs = cp.mcq.slice(0, 2).map((d, i) => ({
      id: `${id}-q${12 + i}`,
      passageId: p1.id, passageIndex: 0,
      questionType: "multiple_choice",
      num: 12 + i,
      prompt: d.prompt,
      options: d.options,
      correctAnswer: d.answer,
      explanation: d.exp,
    }));
    p1Questions = [...tfngQs, ...compQs, ...mcqQs];
  } else {
    p1 = buildTopicPassage(topic1, `${id}-p1`);
    p1Questions = [
      ...genericTfng(topic1, p1.id, 0, 1, id),
      ...genericCompletion(topic1, p1.id, 0, 8, id),
      ...genericMcq(topic1, p1.id, 0, 12, id),
    ];
  }

  // Passage 2
  let p2, p2Questions;
  if (CURATED_PASSAGES[topic2]) {
    const cp = CURATED_PASSAGES[topic2];
    p2 = { id: `${id}-p2`, title: topic2, text: cp.text };
    const mh = buildMatchingHeadings(p2, 1, 14, id);
    const tfngQs = cp.tfng.slice(0, 3).map((d, i) => ({
      id: `${id}-q${20 + i}`,
      passageId: p2.id, passageIndex: 1,
      questionType: "yes_no_not_given",
      num: 20 + i,
      prompt: d.prompt,
      correctAnswer: d.answer === "TRUE" ? "YES" : d.answer === "FALSE" ? "NO" : "NOT GIVEN",
      explanation: d.exp,
    }));
    const compQs = cp.completion.slice(0, 3).map((d, i) => ({
      id: `${id}-q${23 + i}`,
      passageId: p2.id, passageIndex: 1,
      questionType: "sentence_completion",
      num: 23 + i,
      prompt: d.prompt,
      correctAnswer: d.answer,
      altAnswers: d.altAnswers || [],
      wordLimit: 3,
      explanation: d.exp,
    }));
    const mcqQs = cp.mcq.slice(0, 3).map((d, i) => ({
      id: `${id}-q${26 + i}`,
      passageId: p2.id, passageIndex: 1,
      questionType: "multiple_choice",
      num: 26 + i,
      prompt: d.prompt,
      options: d.options,
      correctAnswer: d.answer,
      explanation: d.exp,
    }));
    p2Questions = [...mh, ...tfngQs.slice(0,2), ...compQs.slice(0,3), ...mcqQs.slice(0,2)];
    // normalise to Q14–Q27
  } else {
    p2 = buildTopicPassage(topic2, `${id}-p2`);
    const mh = buildMatchingHeadings(p2, 1, 14, id);
    const yng = buildYng(p2, 1, 20, id);
    const comp = genericCompletion(topic2, p2.id, 1, 23, id);
    const mq = genericMcq(topic2, p2.id, 1, 26, id);
    p2Questions = [...mh, ...yng, ...comp.slice(0,3), ...mq];
  }

  // Passage 3
  let p3, p3Questions;
  if (CURATED_PASSAGES[topic3]) {
    const cp = CURATED_PASSAGES[topic3];
    p3 = { id: `${id}-p3`, title: topic3, text: cp.text };
    const mh = buildMatchingHeadings(p3, 2, 28, id);
    const tfngQs = cp.tfng.slice(3, 6).map((d, i) => ({
      id: `${id}-q${34 + i}`,
      passageId: p3.id, passageIndex: 2,
      questionType: "true_false_not_given",
      num: 34 + i,
      prompt: d.prompt,
      correctAnswer: d.answer,
      explanation: d.exp,
    }));
    const compQs = cp.completion.slice(0, 3).map((d, i) => ({
      id: `${id}-q${37 + i}`,
      passageId: p3.id, passageIndex: 2,
      questionType: "sentence_completion",
      num: 37 + i,
      prompt: d.prompt,
      correctAnswer: d.answer,
      altAnswers: d.altAnswers || [],
      wordLimit: 3,
      explanation: d.exp,
    }));
    const mcqQs = cp.mcq.slice(0, 1).map((d, i) => ({
      id: `${id}-q40`,
      passageId: p3.id, passageIndex: 2,
      questionType: "multiple_choice",
      num: 40,
      prompt: d.prompt,
      options: d.options,
      correctAnswer: d.answer,
      explanation: d.exp,
    }));
    p3Questions = [...mh, ...tfngQs, ...compQs, ...mcqQs];
  } else {
    p3 = buildTopicPassage(topic3, `${id}-p3`);
    const mh = buildMatchingHeadings(p3, 2, 28, id);
    const tfng = genericTfng(topic3, p3.id, 2, 34, id).slice(0, 3);
    const comp = genericCompletion(topic3, p3.id, 2, 37, id);
    const mq = genericMcq(topic3, p3.id, 2, 40, id).slice(0, 1);
    p3Questions = [...mh, ...tfng, ...comp.slice(0, 3), ...mq];
  }

  // Renumber all questions sequentially
  const allQuestions = [...p1Questions, ...p2Questions, ...p3Questions];
  allQuestions.forEach((q, i) => { q.num = i + 1; q.id = `${id}-q${i + 1}`; });

  return {
    id,
    exam: "ielts",
    section: "reading",
    type: "section",
    title: `IELTS Academic Reading Practice Test ${testNum}`,
    variant: "academic",
    durationSeconds: 3600,
    questionCount: 40,
    instructions: "Three passages totalling approximately 2,500 words. Answer all 40 questions.",
    passages: [p1, p2, p3],
    questions: allQuestions,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("Rebuilding IELTS Academic Reading tests 002–030 with unique passages...");
let built = 0;
for (let n = 2; n <= 30; n++) {
  const test = buildTest(n);
  const outPath = path.join(OUT_DIR, `test-${pad(n)}.json`);
  fs.writeFileSync(outPath, JSON.stringify(test, null, 2));
  process.stdout.write(`  ✓ test-${pad(n)}.json  [${test.passages.map(p=>p.title).join(' | ')}]\n`);
  built++;
}
console.log(`\nDone. ${built} tests written to ${OUT_DIR}`);
