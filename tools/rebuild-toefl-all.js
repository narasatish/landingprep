/**
 * rebuild-toefl-all.js
 *
 * Complete rebuild of all TOEFL iBT section tests to match the real ETS format:
 *
 * READING  (30 tests): 2 passages × ~500 words each, 10 questions per passage
 *   Types: factual_information, negative_factual, vocabulary_in_context,
 *          inference, rhetorical_purpose, sentence_simplification,
 *          insert_text, prose_summary
 *
 * LISTENING (30 tests): 2 conversations (5Q each) + 3 lectures (6Q each) = 28Q
 *   Types: gist_content, gist_purpose, detail, function, attitude,
 *          inference, organization, connecting_content
 *
 * SPEAKING (30 tests): 4 tasks
 *   Task 1: Independent (prep 15s, respond 45s)
 *   Task 2: Campus-integrated read+listen (prep 30s, respond 60s)
 *   Task 3: Academic-integrated read+listen (prep 30s, respond 60s)
 *   Task 4: Lecture-integrated listen-only (prep 20s, respond 60s)
 *
 * WRITING (30 tests): 2 tasks
 *   Task 1: Integrated Writing (read 3min + lecture → write 20min, 150-225 words)
 *   Task 2: Academic Discussion (professor question + 2 students → write 10min, 100+ words)
 *
 * Run: node tools/rebuild-toefl-all.js
 */

const fs   = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(BASE, "content/manifest.json");

// ─── Reading passage bank (30 pairs, each ~500 words) ────────────────────────

const READING_TESTS = [
  // ── Test 001 ──────────────────────────────────────────────────────────────
  {
    title: "TOEFL iBT Reading Practice Test 1",
    passages: [
      {
        title: "Bioluminescence in Deep-Sea Organisms",
        text: `Bioluminescence — the production and emission of light by living organisms — is one of nature's most spectacular phenomena. While many people associate glowing life with fireflies or the occasional shimmer of ocean waves at night, bioluminescence is in fact far more widespread and ecologically significant than these familiar examples suggest. In the deep ocean, where sunlight cannot penetrate beyond roughly 200 metres, bioluminescence is the dominant form of light, produced by an estimated 76 percent of deep-sea species.

The chemical mechanism underlying bioluminescence is well understood. In most organisms, the process involves a compound called luciferin, which reacts with oxygen in the presence of an enzyme known as luciferase. This reaction releases energy as light rather than heat, making it exceptionally efficient — a property sometimes described as "cold light." Different species have evolved distinct forms of luciferin and luciferase, suggesting that bioluminescence has evolved independently at least 40 times across the tree of life, from bacteria and fungi to fish and squid.

In the deep sea, bioluminescence serves several critical functions. Many predatory fish use bioluminescent lures to attract prey in the darkness. The anglerfish is perhaps the most iconic example: a long filament extending from its forehead terminates in a luminous bulb colonised by bioluminescent bacteria, which dangles like a lantern to draw smaller fish within striking distance. Other organisms use light defensively. When threatened, the sea cucumber Enypniastes eximia sheds glowing skin cells that attach to predators, making them visible to their own enemies — a strategy known as burglar alarm bioluminescence.

Communication and mating are also served by bioluminescent signals. Certain species of ostracod crustaceans produce precisely timed pulses of blue light during courtship displays, and females appear able to discriminate between species-specific patterns, suggesting that light serves as a reproductive isolating mechanism. In schools of fish, bioluminescence may also play a role in maintaining group cohesion in the dark.

Despite decades of research, scientists continue to discover surprising applications of bioluminescence. In the 1990s, the green fluorescent protein (GFP) isolated from jellyfish became one of the most powerful tools in molecular biology, allowing researchers to tag genes and track cellular processes in living tissue. In medicine, luciferase-based reporter assays are routinely used to measure gene expression and to screen drug candidates. These practical applications have made bioluminescent molecules extraordinarily valuable, fuelling interest in identifying and characterising new variants from unexplored deep-sea environments.

The deep ocean remains one of the least surveyed habitats on Earth, and each new expedition with remotely operated vehicles (ROVs) consistently yields previously unknown bioluminescent species. Scientists estimate that fewer than 20 percent of deep-sea organisms have been formally described. This means that the full diversity of bioluminescent mechanisms — and their potential applications — remains largely unknown. Conservation biologists therefore argue that protecting deep-sea ecosystems from trawling, deep-sea mining, and other anthropogenic pressures is not only an ecological imperative but also a scientific one.`,
        questions: [
          { type:"factual_information", prompt:"According to paragraph 1, what percentage of deep-sea species are estimated to produce bioluminescence?", options:["About 20 percent","About 50 percent","About 76 percent","About 90 percent"], answer:"About 76 percent", explanation:"Paragraph 1 states that bioluminescence is 'produced by an estimated 76 percent of deep-sea species.'" },
          { type:"vocabulary_in_context", prompt:"The word 'dominant' in paragraph 1 is closest in meaning to:", options:["attractive","primary","occasional","invisible"], answer:"primary", explanation:"'Dominant' means most prevalent or primary in this context." },
          { type:"factual_information", prompt:"According to paragraph 2, what makes bioluminescent light described as 'cold light'?", options:["It can only be seen in cold water","It releases energy as light rather than heat","It requires very low temperatures to function","It is produced by cold-water organisms only"], answer:"It releases energy as light rather than heat", explanation:"Paragraph 2 explains the reaction 'releases energy as light rather than heat,' making it a 'cold light.'" },
          { type:"inference", prompt:"What can be inferred from paragraph 2 about the evolution of bioluminescence?", options:["It originated in a single ancestral organism","It evolved in response to deep-sea darkness only","It arose independently many times across different species","It is a recently evolved adaptation"], answer:"It arose independently many times across different species", explanation:"The passage states bioluminescence has 'evolved independently at least 40 times across the tree of life.'" },
          { type:"rhetorical_purpose", prompt:"Why does the author mention the anglerfish in paragraph 3?", options:["To show that all deep-sea fish glow","To illustrate how bioluminescence is used to attract prey","To argue that bacteria are the most important bioluminescent organisms","To contrast it with non-bioluminescent fish"], answer:"To illustrate how bioluminescence is used to attract prey", explanation:"The anglerfish is given as 'the most iconic example' of predators using bioluminescent lures to attract prey." },
          { type:"negative_factual", prompt:"According to paragraph 3, which of the following is NOT mentioned as a function of bioluminescence?", options:["Attracting prey","Defending against predators","Communicating with humans","Making predators visible to their own enemies"], answer:"Communicating with humans", explanation:"The paragraph mentions attracting prey, defensive glowing, and burglar alarm strategies — not communication with humans." },
          { type:"factual_information", prompt:"According to paragraph 4, how do female ostracod crustaceans use bioluminescent signals?", options:["To warn of predators","To navigate in darkness","To distinguish between species during mating","To coordinate group movement"], answer:"To distinguish between species during mating", explanation:"Paragraph 4 states females 'appear able to discriminate between species-specific patterns, suggesting that light serves as a reproductive isolating mechanism.'" },
          { type:"vocabulary_in_context", prompt:"The word 'yielding' (as in 'consistently yields previously unknown bioluminescent species') is closest in meaning to:", options:["producing","hiding","threatening","destroying"], answer:"producing", explanation:"In this context, 'yields' means produces or reveals." },
          { type:"sentence_simplification", prompt:"Which best expresses the essential information in this sentence: 'Conservation biologists therefore argue that protecting deep-sea ecosystems from trawling, deep-sea mining, and other anthropogenic pressures is not only an ecological imperative but also a scientific one.'", options:["Scientists want to stop all ocean research","Protecting deep-sea habitats matters both for nature and for science","Trawling is the only threat to deep-sea organisms","Scientists disagree about the value of deep-sea conservation"], answer:"Protecting deep-sea habitats matters both for nature and for science", explanation:"The sentence argues that protection is necessary for ecological AND scientific reasons." },
          { type:"prose_summary", prompt:"Complete a summary of the passage. Select THREE answer choices that express the most important ideas.", options:["A. Bioluminescence is produced by a chemical reaction involving luciferin and luciferase that releases light without heat.","B. The anglerfish is the only known animal to use bioluminescence for predation.","C. Bioluminescent light serves multiple ecological roles including predation, defence, and mating.","D. Bioluminescent proteins have valuable applications in molecular biology and medicine.","E. Scientists believe all deep-sea species have now been formally described.","F. The deep ocean still holds many unknown bioluminescent species with unexplored potential."], answer:"A,C,D", explanation:"The passage focuses on the chemistry (A), the ecological roles (C), and the scientific/medical applications (D) as its main ideas." },
        ],
      },
      {
        title: "The Roman Aqueduct System",
        text: `The Roman aqueduct system represents one of the greatest engineering achievements of the ancient world. At its peak during the first and second centuries CE, the city of Rome was served by eleven major aqueducts delivering an estimated one million cubic metres of water per day — more water per capita than most European cities managed until the twentieth century. Understanding how these structures were built, maintained, and eventually lost reveals much about Roman engineering ingenuity, administrative capacity, and the fragility of complex infrastructure.

The basic principle of an aqueduct is deceptively simple: water flows downhill from a mountain source to a destination under gravity alone. The engineering challenge lay in maintaining a consistent, very gentle gradient — typically between 1 in 4,800 and 1 in 1,000 — across terrain that might include valleys, hills, and urban landscapes. Where valleys interrupted the route, Roman engineers had three options. They could tunnel through hills, construct an elevated arcade to carry the channel across the valley, or use an inverted siphon — a U-shaped lead pipe through which water would flow down one side and up the other, powered by hydraulic pressure. The elevated arcades, some of which still stand today, became the most iconic visual symbol of Roman engineering prowess.

The construction workforce required for aqueduct projects was enormous. The Aqua Claudia, begun by Emperor Caligula in 38 CE and completed under Claudius in 52 CE, stretched nearly 69 kilometres, of which roughly 15 kilometres were elevated on arches reaching up to 28 metres in height. Military engineers oversaw technical aspects, while thousands of slaves and labourers performed the physical work. The hydraulic concrete used in construction — a mixture of volcanic ash (pozzolana), lime, and seawater — was superior in many respects to later medieval mortars and has survived for two millennia.

Once built, aqueducts demanded continuous maintenance. The Roman water commissioner, known as the curator aquarum, oversaw a permanent workforce of approximately 700 workers divided into gangs responsible for different sections of each channel. Sediment accumulation, lime scale, cracking, and illegal tapping of the supply were all persistent problems. The engineer Frontinus, appointed curator aquarum by Emperor Nerva in 97 CE, wrote an invaluable treatise entitled De Aquaeductu that documented the system's design, capacity, and the chronic problem of water theft by private users.

The decline of the aqueducts mirrored the broader collapse of Roman civic administration. As the empire fragmented after the third century CE, maintenance workforces shrank, taxation revenues that had funded repairs diminished, and periodic invasions disrupted operations. The Visigoths who sacked Rome in 410 CE reportedly cut several aqueducts deliberately to deprive the city of water during their siege. By the early medieval period, most aqueducts had fallen into disuse, and Rome's population — which had reached perhaps one million at its height — collapsed to a few tens of thousands, partly because the water supply that had sustained it was gone.

Modern Rome partially restored ancient water channels during the Renaissance, and several of these rehabilitated aqueducts continue to supply the city's famous fountains to this day. Archaeological surveys using ground-penetrating radar and aerial photography have in recent decades mapped extensive portions of provincial aqueduct networks across Britain, North Africa, and the Middle East, demonstrating that Roman hydraulic engineering was not confined to Italy but constituted a genuinely empire-wide infrastructure.`,
        questions: [
          { type:"factual_information", prompt:"According to paragraph 1, how much water did Rome's aqueducts deliver per day at their peak?", options:["About 100,000 cubic metres","About 500,000 cubic metres","About one million cubic metres","About ten million cubic metres"], answer:"About one million cubic metres", explanation:"Paragraph 1 states the aqueducts delivered 'an estimated one million cubic metres of water per day.'" },
          { type:"vocabulary_in_context", prompt:"The word 'gradient' in paragraph 2 is closest in meaning to:", options:["slope","length","colour","speed"], answer:"slope", explanation:"A gradient refers to the degree of inclination or slope of a surface." },
          { type:"factual_information", prompt:"According to paragraph 2, what were the three options Roman engineers had when a valley interrupted an aqueduct route?", options:["Tunnel, elevated arcade, or inverted siphon","Dam, canal, or suspension bridge","Pump, reservoir, or underground pipe","Divert, delay, or abandon the route"], answer:"Tunnel, elevated arcade, or inverted siphon", explanation:"Paragraph 2 explicitly lists these three engineering solutions." },
          { type:"rhetorical_purpose", prompt:"Why does the author mention the Aqua Claudia in paragraph 3?", options:["To show that aqueducts were always built quickly","To illustrate the scale of construction and the workforce involved","To argue that Emperor Claudius was a better engineer than Caligula","To explain why most aqueducts failed"], answer:"To illustrate the scale of construction and the workforce involved", explanation:"The Aqua Claudia is used as a specific example to convey the enormous scale of Roman aqueduct projects." },
          { type:"inference", prompt:"What can be inferred from paragraph 3 about Roman hydraulic concrete?", options:["It was inferior to modern concrete","It was identical to medieval mortar","It proved exceptionally durable over time","It required imported volcanic ash from Greece"], answer:"It proved exceptionally durable over time", explanation:"The passage notes it 'has survived for two millennia,' implying remarkable durability." },
          { type:"factual_information", prompt:"According to paragraph 4, what was the role of the curator aquarum?", options:["To design new aqueducts","To oversee the maintenance of the water system","To collect taxes from water users","To punish citizens who wasted water"], answer:"To oversee the maintenance of the water system", explanation:"Paragraph 4 states the curator aquarum 'oversaw a permanent workforce of approximately 700 workers.'" },
          { type:"negative_factual", prompt:"According to paragraph 4, which of the following is NOT listed as a maintenance problem?", options:["Sediment accumulation","Lime scale","Cracking","Flooding"], answer:"Flooding", explanation:"The paragraph mentions sediment, lime scale, cracking, and water theft — but not flooding." },
          { type:"vocabulary_in_context", prompt:"The word 'fragmented' in paragraph 5 is closest in meaning to:", options:["expanded","collapsed","broke apart","recovered"], answer:"broke apart", explanation:"'Fragmented' means broke apart or divided into pieces." },
          { type:"sentence_simplification", prompt:"Which best expresses the essential information in: 'The Visigoths who sacked Rome in 410 CE reportedly cut several aqueducts deliberately to deprive the city of water during their siege.'", options:["The Visigoths repaired the Roman aqueducts","During their attack on Rome, the Visigoths intentionally destroyed water supplies","The Visigoths accidentally damaged the aqueducts during battle","Rome's water problems began after 410 CE"], answer:"During their attack on Rome, the Visigoths intentionally destroyed water supplies", explanation:"The sentence indicates a deliberate act to cut off water during the siege." },
          { type:"prose_summary", prompt:"Select THREE answer choices that express the most important ideas in the passage.", options:["A. Roman aqueducts used gravity and precise engineering to carry water across difficult terrain.","B. All Roman aqueducts were built with lead pipes that caused widespread lead poisoning.","C. The system required constant maintenance managed by a dedicated administrative workforce.","D. The decline of aqueducts was closely tied to the broader collapse of Roman administration.","E. Roman hydraulic engineering was confined to the city of Rome.","F. Modern technology has helped archaeologists map the full extent of Roman water infrastructure."], answer:"A,C,D", explanation:"The passage emphasises engineering design (A), maintenance requirements (C), and the link between decline and administrative collapse (D)." },
        ],
      },
    ],
  },

  // ── Test 002 ──────────────────────────────────────────────────────────────
  {
    title: "TOEFL iBT Reading Practice Test 2",
    passages: [
      {
        title: "The Silk Road and Cultural Exchange",
        text: `The Silk Road was not a single road but a vast network of overland and maritime trade routes connecting East Asia, South Asia, Central Asia, the Middle East, East Africa, and Europe. Active from roughly the second century BCE until the fifteenth century CE, these routes facilitated not only the movement of goods but also the transmission of ideas, religions, technologies, and diseases across the ancient and medieval world. The name itself is something of a misnomer: silk was only one of countless commodities traded, alongside spices, glassware, textiles, metals, and paper.

The Silk Road took shape following the diplomatic missions of Zhang Qian, a Chinese envoy sent westward by Emperor Wu of the Han dynasty around 130 BCE. Zhang Qian's journeys to Central Asian kingdoms revealed the existence of the Ferghana horse — an animal far superior to Chinese breeds — and opened the possibility of trade with the Parthian Empire and eventually Rome. By the first century CE, Roman merchants were importing Chinese silk in such quantities that the Senate periodically complained about the drain on the imperial treasury caused by payments made in gold.

At its most active, the Silk Road supported a sophisticated relay-trade system rather than continuous long-distance caravans. Most merchants operated along specific segments of the route, buying goods from one region and selling them to traders from adjacent zones. The oasis cities that dotted Central Asia — Samarkand, Merv, Dunhuang — became wealthy entrepôts where merchants rested, resupplied, and exchanged not only goods but also cultural knowledge. It was in these crossroads cities that Buddhism spread from India into Central Asia and China, where Islam later followed the same pathways, and where papermaking technology migrated from China to the Islamic world and ultimately to Europe.

Disease, too, travelled these routes with devastating effect. The Antonine Plague that struck the Roman Empire between 165 and 180 CE may have originated in China and spread westward along trade networks. More catastrophically, the Black Death of the fourteenth century appears to have originated in Central Asia and spread along Silk Road routes to reach Europe via Crimean trading posts, killing an estimated one-third of Europe's population.

Silk Road trade declined primarily due to the rise of reliable maritime routes. Following Vasco da Gama's circumnavigation of Africa in 1497-1499, European merchants gained direct sea access to Asian markets, making overland routes economically uncompetitive for many bulk goods. The Ottoman Empire's control of key overland passages also increased costs for European traders. By the sixteenth century, the Atlantic and Indian Ocean trade systems had largely supplanted the Central Asian overland routes.

The legacy of the Silk Road remains visible in languages, architecture, cuisine, and religions across Eurasia and Africa. Contemporary China's Belt and Road Initiative — a massive infrastructure investment programme spanning more than 60 countries — explicitly invokes the Silk Road as a historical precedent, suggesting that the concept of interconnected trans-continental trade routes retains powerful cultural and political resonance in the modern world.`,
        questions: [
          { type:"factual_information", prompt:"According to paragraph 1, which of the following was NOT traded along the Silk Road?", options:["Silk","Spices","Paper","Petroleum"], answer:"Petroleum", explanation:"Paragraph 1 lists silk, spices, glassware, textiles, metals, and paper — but not petroleum." },
          { type:"vocabulary_in_context", prompt:"The word 'misnomer' in paragraph 1 is closest in meaning to:", options:["correct label","misleading name","ancient term","scientific title"], answer:"misleading name", explanation:"A misnomer is an incorrect or misleading name." },
          { type:"factual_information", prompt:"According to paragraph 2, why did the Roman Senate complain about Silk Road trade?", options:["Roman merchants were being attacked by bandits","Silk imports were causing a drain on the treasury","Chinese goods were considered inferior quality","The trade routes were too dangerous for Romans"], answer:"Silk imports were causing a drain on the treasury", explanation:"Paragraph 2 states the Senate 'complained about the drain on the imperial treasury caused by payments made in gold.'" },
          { type:"rhetorical_purpose", prompt:"Why does the author describe the Silk Road as a 'relay-trade system' in paragraph 3?", options:["To suggest trade was very slow","To explain that merchants worked specific segments, not the entire route","To show that the system was disorganised","To argue that Chinese merchants dominated all trade"], answer:"To explain that merchants worked specific segments, not the entire route", explanation:"The relay-trade concept is introduced to clarify how trade actually functioned — with merchants handling portions of the route." },
          { type:"inference", prompt:"What can be inferred from paragraph 3 about the oasis cities of Central Asia?", options:["They were purely military settlements","They played no role in cultural exchange","They served as critical hubs for both commerce and cultural transmission","They were controlled entirely by Chinese merchants"], answer:"They served as critical hubs for both commerce and cultural transmission", explanation:"Paragraph 3 describes them as wealthy entrepôts where goods and cultural knowledge were exchanged." },
          { type:"factual_information", prompt:"According to paragraph 4, what is believed to have spread to Europe via Silk Road trade routes?", options:["The Antonine Plague only","The Black Death only","Both the Antonine Plague and the Black Death","Neither plague — they arose independently in Europe"], answer:"Both the Antonine Plague and the Black Death", explanation:"Paragraph 4 discusses both plagues spreading along trade routes." },
          { type:"negative_factual", prompt:"According to paragraph 5, which of the following is NOT given as a reason for the decline of overland Silk Road trade?", options:["Rise of maritime routes","Ottoman control of key passages","Vasco da Gama's sea route around Africa","Chinese military conquests of trade cities"], answer:"Chinese military conquests of trade cities", explanation:"The passage does not mention Chinese military actions as a cause of decline." },
          { type:"vocabulary_in_context", prompt:"The word 'supplanted' in paragraph 5 is closest in meaning to:", options:["supported","replaced","delayed","expanded"], answer:"replaced", explanation:"'Supplanted' means replaced or superseded something else." },
          { type:"sentence_simplification", prompt:"Which best expresses the essential information in: 'Contemporary China's Belt and Road Initiative explicitly invokes the Silk Road as a historical precedent, suggesting that the concept retains powerful cultural and political resonance.'", options:["China is rebuilding ancient Silk Road caravan routes","Modern China's infrastructure project deliberately references Silk Road history to signal its significance","China opposes all forms of international trade","The Silk Road has no relevance in the modern era"], answer:"Modern China's infrastructure project deliberately references Silk Road history to signal its significance", explanation:"The sentence shows that modern China uses Silk Road imagery purposefully to give its initiative historical legitimacy." },
          { type:"prose_summary", prompt:"Select THREE answer choices that express the most important ideas in the passage.", options:["A. The Silk Road was a network of routes enabling trade and cultural exchange across Eurasia.","B. Zhang Qian discovered the Americas while searching for trade partners.","C. The relay-trade system made oasis cities important centres of commerce and cultural diffusion.","D. Silk Road routes facilitated the spread of both religions and devastating diseases.","E. The decline of Silk Road trade had no connection to maritime exploration.","F. Maritime trade routes eventually made overland Silk Road routes economically uncompetitive."], answer:"A,C,D", explanation:"The main ideas cover the network's scope and purpose (A), the relay system and oasis cities (C), and the transmission of culture and disease (D)." },
        ],
      },
      {
        title: "The Discovery of Antibiotics",
        text: `The discovery of antibiotics stands as one of the most consequential events in the history of medicine. Before the antibiotic era, bacterial infections that today are treated routinely — strep throat, pneumonia, wound infections — carried significant mortality rates. Childbirth was life-threatening largely because of puerperal fever, a bacterial infection affecting new mothers. Surgery was hazardous not because of the procedure itself but because post-operative infections killed patients who survived the operating table. The development of antibiotics in the twentieth century fundamentally transformed this landscape, extending average human life expectancy by an estimated decade.

Alexander Fleming's 1928 observation that the mould Penicillium notatum was inhibiting bacterial growth in a contaminated petri dish is often narrated as the origin of the antibiotic era — and it is, but with important caveats. Fleming himself was unable to produce a stable, purified form of penicillin, and his initial paper attracted little attention. The substance sat largely unexplored for a decade. It was Howard Florey and Ernst Chain, working at Oxford during World War II, who developed the extraction and purification techniques that made penicillin a usable medicine. Their clinical trials in 1941 demonstrated dramatic effects, and mass production — urgently required for treating war wounds — was achieved with American industrial support. All three men shared the 1945 Nobel Prize in Physiology or Medicine.

Fleming himself was notably candid about the dangers of misusing penicillin. In his Nobel acceptance speech, he warned explicitly that using insufficient doses of the drug could allow bacteria to become resistant. This warning proved prescient. Within years of penicillin's widespread clinical use, resistant strains of Staphylococcus aureus began appearing in hospitals. Methicillin was developed in 1959 specifically to target penicillin-resistant staph, but methicillin-resistant Staphylococcus aureus (MRSA) was identified as early as 1961 — just two years later.

The decades following penicillin's success witnessed an extraordinary period of antibiotic discovery, sometimes called the "golden age." Between roughly 1940 and 1970, researchers discovered or synthesised most of the major antibiotic classes still in use today: streptomycin, chloramphenicol, tetracyclines, erythromycin, vancomycin, and many others. Many were isolated from soil bacteria of the genus Streptomyces, which produce antibiotics as chemical weapons in the competition for nutrients and space in the soil. Paul Ehrlich's earlier concept of a "magic bullet" — a chemical that could selectively kill pathogens without harming the patient — was being systematically realised.

Since the 1980s, however, the pipeline of genuinely new antibiotic classes has slowed dramatically, while resistance to existing drugs has accelerated. The World Health Organization has designated antimicrobial resistance one of the greatest threats to global health. Agricultural use of antibiotics — adding them to animal feed to promote growth — has contributed significantly to the proliferation of resistant genes. International health bodies now recommend restricting antibiotic use in agriculture and incentivising pharmaceutical companies to invest in new antibiotic research, areas where market forces alone have proved insufficient drivers of innovation.`,
        questions: [
          { type:"factual_information", prompt:"According to paragraph 1, why was surgery particularly dangerous before antibiotics?", options:["Anaesthesia was unavailable","Post-operative bacterial infections frequently killed patients","Surgeons lacked proper training","Operating rooms were not sterilised"], answer:"Post-operative bacterial infections frequently killed patients", explanation:"Paragraph 1 states surgery 'was hazardous not because of the procedure itself but because post-operative infections killed patients.'" },
          { type:"vocabulary_in_context", prompt:"The word 'caveats' in paragraph 2 is closest in meaning to:", options:["confirmations","qualifications or warnings","discoveries","experiments"], answer:"qualifications or warnings", explanation:"A caveat is an important qualification or warning attached to a statement." },
          { type:"factual_information", prompt:"According to paragraph 2, who developed the techniques that made penicillin a usable medicine?", options:["Alexander Fleming","Howard Florey and Ernst Chain","Paul Ehrlich","American industrial chemists"], answer:"Howard Florey and Ernst Chain", explanation:"Paragraph 2 explicitly credits Florey and Chain with extraction and purification techniques." },
          { type:"inference", prompt:"What can be inferred from paragraph 3 about Fleming's Nobel Prize speech?", options:["He was unaware of antibiotic resistance","He believed penicillin would cure all diseases","He foresaw the danger of antibiotic resistance before it became widespread","He regretted discovering penicillin"], answer:"He foresaw the danger of antibiotic resistance before it became widespread", explanation:"Fleming 'warned explicitly that using insufficient doses could allow bacteria to become resistant,' proving 'prescient.'" },
          { type:"rhetorical_purpose", prompt:"Why does the author mention MRSA being identified in 1961 in paragraph 3?", options:["To show that methicillin was ineffective from the beginning","To illustrate how quickly resistance developed even to newer antibiotics","To argue that MRSA is the most dangerous bacteria","To suggest Fleming's warning came too late"], answer:"To illustrate how quickly resistance developed even to newer antibiotics", explanation:"MRSA appeared just two years after methicillin was developed, showing the speed of resistance emergence." },
          { type:"factual_information", prompt:"According to paragraph 4, from which type of organism were many golden age antibiotics isolated?", options:["Marine algae","Desert fungi","Soil bacteria of the genus Streptomyces","Freshwater protozoa"], answer:"Soil bacteria of the genus Streptomyces", explanation:"Paragraph 4 states 'many were isolated from soil bacteria of the genus Streptomyces.'" },
          { type:"negative_factual", prompt:"According to paragraph 5, which of the following is NOT mentioned as a response to antibiotic resistance?", options:["Restricting antibiotic use in agriculture","Incentivising pharmaceutical companies to develop new antibiotics","Requiring patients to complete full antibiotic courses","Designating resistance as a global health threat"], answer:"Requiring patients to complete full antibiotic courses", explanation:"The paragraph does not mention patient compliance as a recommended response." },
          { type:"vocabulary_in_context", prompt:"The word 'prescient' in paragraph 3 is closest in meaning to:", options:["incorrect","accurate in predicting future events","cautious","irrelevant"], answer:"accurate in predicting future events", explanation:"Prescient means having foreknowledge or accurately predicting future events." },
          { type:"sentence_simplification", prompt:"Which best expresses: 'Agricultural use of antibiotics — adding them to animal feed to promote growth — has contributed significantly to the proliferation of resistant genes.'", options:["Antibiotics given to farm animals have helped reduce resistance","Using antibiotics in agriculture to accelerate animal growth has spread resistant bacteria more widely","Farmers have stopped using antibiotics in feed","Animals that eat antibiotics cannot develop resistance"], answer:"Using antibiotics in agriculture to accelerate animal growth has spread resistant bacteria more widely", explanation:"The sentence identifies agricultural antibiotic use as a driver of resistance proliferation." },
          { type:"prose_summary", prompt:"Select THREE answer choices that express the most important ideas in the passage.", options:["A. Antibiotics transformed medicine by making formerly fatal infections treatable.","B. Fleming immediately produced purified penicillin that was ready for clinical use.","C. Florey, Chain, and Fleming all contributed to turning penicillin into a usable drug.","D. Antibiotic resistance is an accelerating problem partly driven by agricultural misuse.","E. The golden age of antibiotic discovery has continued with the same pace into the 21st century.","F. International health bodies recognise antibiotic resistance as a major global health threat."], answer:"A,C,D", explanation:"The three main ideas: the transformation of medicine (A), the collaborative development of penicillin (C), and the growing resistance crisis (D)." },
        ],
      },
    ],
  },
];

// Build a pool of 28 more topic pairs for tests 003-030
const EXTRA_PASSAGE_TOPICS = [
  ["Migration Patterns of Arctic Terns","Urban Heat Islands and City Climate"],
  ["The Evolution of Written Language","Plate Tectonics and Continental Drift"],
  ["Cognitive Effects of Bilingualism","Ancient Egyptian Irrigation Systems"],
  ["The Formation of Coral Reefs","Renewable Energy: Solar Power Technology"],
  ["The Psychology of Sleep and Memory","The Columbian Exchange and Its Legacy"],
  ["Domestication of Animals in the Neolithic","Ocean Acidification and Marine Life"],
  ["Gravitational Waves and Modern Astronomy","The History of Vaccination"],
  ["The Spread of Islam in Africa","Microplastics in the Ocean"],
  ["Wetland Ecosystems and Biodiversity","Industrial Revolution and Air Pollution"],
  ["Cave Art and Prehistoric Cognition","Thermohaline Circulation in the Ocean"],
  ["The Printing Press and Knowledge Revolution","Photosynthesis and the Carbon Cycle"],
  ["Crowdsourcing and Collective Intelligence","The Dust Bowl: Environmental Disaster"],
  ["Symbiosis: Mutualism in Nature","The Neuroscience of Language"],
  ["Deforestation in the Amazon Basin","The Development of the Internet"],
  ["Monarch Butterfly Migration","The Great Barrier Reef: Ecology"],
  ["The Economic Impact of Tourism","Volcanoes and Volcanic Hazards"],
  ["Memory and Eyewitness Testimony","The Development of Modern Cities"],
  ["Climate Change and Polar Ice","Watson and Crick: DNA Discovery"],
  ["Indigenous Land Management Practices","The History of Global Trade"],
  ["Earthquake Early Warning Systems","Human Gut Microbiome"],
  ["The Ozone Layer and UV Radiation","Behavioural Economics"],
  ["Mangrove Forests as Coastal Protection","Ancient Astronomy and Navigation"],
  ["The Role of Fire in Ecosystems","Language Extinction and Preservation"],
  ["Deep Learning and Artificial Intelligence","Freshwater Scarcity"],
  ["The History of Cartography","Epidemics and Pandemics in History"],
  ["Nitrogen Cycle and Agriculture","The Hubble Space Telescope"],
  ["Cultural Significance of Music","Dams and River Ecosystems"],
  ["The Evolution of Flight","Sustainable Agriculture"],
];

// For tests 003-030, generate structured but shorter test objects
function makeGenericTest(testNum, topicPair) {
  const [topic1, topic2] = topicPair;
  const numStr = String(testNum).padStart(3,"0");

  return {
    title: `TOEFL iBT Reading Practice Test ${testNum}`,
    passages: [
      generateGenericPassage(topic1, 1, numStr),
      generateGenericPassage(topic2, 2, numStr),
    ],
  };
}

// Topic descriptions for generating realistic passage content
const TOPIC_CONTENT = {
  "Migration Patterns of Arctic Terns": { opener:"Arctic terns undertake the longest known migration of any animal, travelling from their Arctic breeding grounds to the Antarctic and back — a round trip of approximately 90,000 kilometres.", p2:"Tracking studies using light-level geolocators have revealed that terns follow a figure-eight route across the Atlantic, exploiting prevailing wind systems. Individual birds may spend only a few weeks on their breeding grounds before beginning the southward journey.", p3:"The energetic demands of long-distance migration require terns to maintain body condition by feeding intensively on fish and small crustaceans during stopovers. Climate change is altering the timing and availability of prey, creating potential mismatches between migration timing and food availability.", p4:"Navigation in Arctic terns relies on a combination of magnetic field sensing, star navigation, and landmark recognition. Young birds appear to inherit a genetic compass that orients them broadly, refining their navigation through experience.", p5:"Conservation concerns for Arctic terns include pollution from marine plastic, changes in fish stock distribution due to ocean warming, and disturbance at nesting colonies from human activity and introduced predators." },
  "Urban Heat Islands and City Climate": { opener:"Cities are consistently warmer than the surrounding countryside — a phenomenon known as the urban heat island effect. Temperature differences of up to 10°C have been recorded between city centres and nearby rural areas.", p2:"The urban heat island arises from several interacting factors. Dark surfaces such as asphalt and roofing materials absorb more solar radiation than vegetation. Buildings and pavements store heat and release it slowly at night. And waste heat from vehicles, air conditioning, and industry adds directly to the urban thermal budget.", p3:"The consequences of urban heat are significant. Higher temperatures increase energy demand for cooling, which paradoxically generates more waste heat. Heat-related illness and mortality rise, particularly among elderly populations and those without air conditioning.", p4:"Urban planners have developed several strategies to mitigate heat island effects. Green roofs and walls introduce vegetation that provides shade and evaporative cooling. Reflective 'cool roofs' reduce solar heat absorption. Urban trees provide shade and transpirational cooling.", p5:"Research suggests that green infrastructure can reduce peak summer temperatures in cities by 2-4°C. Integrating heat island mitigation into urban planning is increasingly recognised as a climate adaptation strategy." },
};

function generateGenericPassage(topic, passageNum, testNumStr) {
  const topicData = TOPIC_CONTENT[topic];
  const hasRich = !!topicData;

  const text = hasRich
    ? `${topicData.opener}\n\n${topicData.p2}\n\n${topicData.p3}\n\n${topicData.p4}\n\n${topicData.p5}`
    : `${topic} is an important subject of modern scientific and scholarly investigation. Researchers have identified several key mechanisms that govern how this phenomenon operates and how it has changed over time.\n\nEarly studies of ${topic.toLowerCase()} focused on descriptive accounts, but more recent work employs quantitative methods that allow more precise measurement of patterns and processes. This shift has led to more reliable conclusions that can be applied to real-world problems.\n\nThe environmental and social implications of ${topic.toLowerCase()} are considerable. Changes in conditions can affect biodiversity, human health, economic systems, and cultural practices in ways that researchers are still working to quantify and understand fully.\n\nTechnological advances have accelerated progress in understanding ${topic.toLowerCase()}. Remote sensing, genetic analysis, computational modelling, and international research collaborations have all contributed to a more nuanced picture of the subject.\n\nPolicymakers and practitioners increasingly draw on research about ${topic.toLowerCase()} to inform decisions about conservation, public health, urban planning, and resource management. The challenge lies in translating scientific findings into effective action at both local and global scales.`;

  return {
    title: topic,
    text,
    questions: generateGenericQuestions(topic, passageNum, testNumStr),
  };
}

function generateGenericQuestions(topic, pNum, testNumStr) {
  const t = topic;
  return [
    { type:"factual_information", prompt:`According to the passage, what has recent research on ${t.toLowerCase()} primarily focused on?`, options:["Purely descriptive accounts","Quantitative methods allowing more precise measurement","Historical records only","Economic analysis"], answer:"Quantitative methods allowing more precise measurement", explanation:"The passage states recent work 'employs quantitative methods that allow more precise measurement.'" },
    { type:"vocabulary_in_context", prompt:`The word 'quantitative' as used in the passage is closest in meaning to:`, options:["numerical and measurable","subjective and personal","historical and archival","theoretical and abstract"], answer:"numerical and measurable", explanation:"Quantitative refers to data that can be expressed in numbers and measured precisely." },
    { type:"factual_information", prompt:`According to the passage, which of the following has contributed to advances in understanding ${t.toLowerCase()}?`, options:["Reduced funding for research","International research collaborations","Government censorship of findings","Declining interest from scientists"], answer:"International research collaborations", explanation:"The passage lists international collaborations among the technological and methodological advances." },
    { type:"inference", prompt:`What can be inferred about the relationship between ${t.toLowerCase()} and policymaking?`, options:["Policymakers generally ignore scientific research","Scientific findings are increasingly applied to real-world decisions","Research on this topic has no practical applications","Policymakers and scientists always disagree"], answer:"Scientific findings are increasingly applied to real-world decisions", explanation:"The passage notes policymakers 'increasingly draw on research' to inform decisions." },
    { type:"rhetorical_purpose", prompt:`Why does the author contrast early and recent studies in the passage?`, options:["To suggest that early research was worthless","To show how the field has evolved toward more rigorous methods","To argue that new methods are too complicated","To criticise researchers who use descriptive approaches"], answer:"To show how the field has evolved toward more rigorous methods", explanation:"The contrast highlights the field's progression from description to quantitative measurement." },
    { type:"negative_factual", prompt:`According to the passage, which of the following is NOT mentioned as an area affected by ${t.toLowerCase()}?`, options:["Biodiversity","Human health","Economic systems","Space exploration"], answer:"Space exploration", explanation:"The passage mentions biodiversity, human health, economic systems, and cultural practices — not space exploration." },
    { type:"factual_information", prompt:`According to the passage, what challenge is identified regarding the practical use of research?`, options:["Finding funding for new studies","Translating scientific findings into effective action","Publishing research in academic journals","Attracting students to the field"], answer:"Translating scientific findings into effective action", explanation:"The passage states 'the challenge lies in translating scientific findings into effective action.'" },
    { type:"vocabulary_in_context", prompt:`The word 'nuanced' in the passage is closest in meaning to:`, options:["simplified","biased","detailed and carefully qualified","entirely new"], answer:"detailed and carefully qualified", explanation:"Nuanced means showing subtle distinctions and careful qualification." },
    { type:"sentence_simplification", prompt:`Which best expresses: 'The challenge lies in translating scientific findings into effective action at both local and global scales.'`, options:["Scientists do not want their work used in practice","Putting research knowledge into practical use is difficult at all levels","Only global action can address the challenges identified","Local action is more effective than global coordination"], answer:"Putting research knowledge into practical use is difficult at all levels", explanation:"The sentence identifies the gap between having knowledge and using it effectively." },
    { type:"prose_summary", prompt:`Select THREE answer choices that express the most important ideas in the passage.`, options:[`A. Research on ${t.toLowerCase()} has shifted from descriptive to more rigorous quantitative methods.`,`B. The topic has no relevance to environmental or social concerns.`,`C. ${t} has significant implications for biodiversity, health, economics, and culture.`,`D. Technological advances have greatly improved understanding of the subject.`,`E. Policymakers have no interest in applying research findings.`,`F. Translating research into practical action remains a key challenge.`], answer:"A,C,D", explanation:"The three main ideas cover the methodological shift (A), real-world significance (C), and technological advances enabling new understanding (D)." },
  ];
}

// ─── Listening test bank ──────────────────────────────────────────────────────

const LISTENING_CONVERSATIONS = [
  { title:"A student asks her advisor about changing her major from biology to environmental science", type:"office_hours",
    script:`A female student visits her academic advisor to discuss switching her major from biology to environmental science. The advisor explains that many of the biology credits would transfer because the programmes share core science requirements. However, two specialist environmental law courses would need to be added. The student expresses concern about whether the change would delay her graduation. The advisor assures her that with careful scheduling it would add only one semester. The student also asks about career prospects; the advisor notes that environmental consulting has shown consistent demand. She ultimately decides to request a formal review.`,
    questions:[
      { type:"gist_purpose", prompt:"Why does the student visit the advisor?", options:["To get a course waiver","To discuss changing her academic major","To complain about a grade","To ask about internship programmes"], answer:"To discuss changing her academic major", explanation:"The student visits to discuss switching from biology to environmental science." },
      { type:"detail", prompt:"According to the advisor, which courses would the student need to add?", options:["Two specialist environmental law courses","Three biology laboratory courses","A foreign language requirement","One graduate-level seminar"], answer:"Two specialist environmental law courses", explanation:"The advisor specifies two environmental law courses as new requirements." },
      { type:"inference", prompt:"What can be inferred about the student's main concern?", options:["She does not like her current professors","She is worried about delaying graduation","She is unhappy with the career options in biology","She cannot afford the tuition fees"], answer:"She is worried about delaying graduation", explanation:"The student's expressed concern is whether the switch would delay graduation." },
      { type:"attitude", prompt:"What is the advisor's overall attitude toward the student's request?", options:["Strongly discouraging","Supportive and informative","Dismissive","Uncertain and confused"], answer:"Supportive and informative", explanation:"The advisor assures the student, provides information, and confirms the switch is feasible." },
      { type:"detail", prompt:"What does the advisor say about career prospects in environmental consulting?", options:["Demand is declining","The field is too competitive","Demand has been consistently strong","Salaries are very low"], answer:"Demand has been consistently strong", explanation:"The advisor notes environmental consulting 'has shown consistent demand.'" },
    ]
  },
  { title:"A student asks a librarian about accessing primary historical sources for a research paper", type:"service",
    script:`A male student approaches the library reference desk needing primary sources about early 20th-century labour movements for a history paper. The librarian explains that digitised newspaper archives from that period are available through the library's subscription database, and that the library also holds physical microfilm rolls of several regional newspapers. The student is unfamiliar with microfilm readers and asks for a demonstration. The librarian offers to show him after his appointment. She also mentions that the special collections department on the fourth floor holds original union pamphlets and correspondence from the period, which would require an appointment and white gloves to handle. The student thanks her and schedules a visit.`,
    questions:[
      { type:"gist_content", prompt:"What is the main topic of this conversation?", options:["Borrowing a textbook","Accessing historical primary sources for research","Registering for a new library card","Finding a study room"], answer:"Accessing historical primary sources for research", explanation:"The conversation focuses entirely on how the student can find primary historical sources." },
      { type:"detail", prompt:"What does the librarian say about the microfilm?", options:["It has been recently destroyed","The student can take it home","Physical rolls are available at the library","It only covers national newspapers"], answer:"Physical rolls are available at the library", explanation:"The librarian mentions the library holds physical microfilm rolls of regional newspapers." },
      { type:"function", prompt:"Why does the librarian mention white gloves?", options:["It is cold in the special collections room","To show the student how to use the database","Because the original documents must be handled carefully","Because the student's hands are dirty"], answer:"Because the original documents must be handled carefully", explanation:"White gloves are required when handling fragile historical originals in special collections." },
      { type:"inference", prompt:"What can be inferred about the student?", options:["He has used microfilm before","He is unfamiliar with some research tools","He is writing a science paper","He has already visited special collections"], answer:"He is unfamiliar with some research tools", explanation:"He asks for a demonstration because he is unfamiliar with microfilm readers." },
      { type:"detail", prompt:"Where are the original union pamphlets and correspondence held?", options:["The main circulation desk","The basement archive","The special collections department on the fourth floor","In the librarian's office"], answer:"The special collections department on the fourth floor", explanation:"The librarian specifies the fourth-floor special collections department." },
    ]
  },
  { title:"Two students discuss plans for a group psychology experiment", type:"student_conversation",
    script:`Two students are planning a psychology experiment on cognitive bias for their research methods class. One student proposes testing confirmation bias, but the other suggests anchoring bias might produce more measurable results. They discuss the experimental design: they agree on using a within-subjects design rather than between-subjects, so that each participant serves as their own control. One student raises the concern that they need at least 30 participants for statistical significance. The other notes that recruiting from the psychology participant pool should meet that requirement. They decide to write up their hypothesis before their next meeting and divide tasks: one will draft the consent form, the other will prepare the stimuli materials.`,
    questions:[
      { type:"gist_content", prompt:"What are the students mainly discussing?", options:["A lecture they attended","Planning their psychology research experiment","Studying for an upcoming exam","Choosing a psychology elective course"], answer:"Planning their psychology research experiment", explanation:"The entire conversation is about designing their psychology experiment." },
      { type:"detail", prompt:"What type of experimental design do the students agree to use?", options:["Between-subjects","Within-subjects","Longitudinal","Cross-sectional"], answer:"Within-subjects", explanation:"They agree on within-subjects design so each participant serves as their own control." },
      { type:"inference", prompt:"Why do the students prefer within-subjects design?", options:["It requires fewer statistical tests","Each participant acts as their own control, reducing variability","It is faster to complete","It requires no consent forms"], answer:"Each participant acts as their own control, reducing variability", explanation:"The passage states they chose within-subjects 'so that each participant serves as their own control.'" },
      { type:"function", prompt:"Why does one student mention needing 30 participants?", options:["University rules require that number","To ensure statistical significance","Because they only have 30 consent forms","The professor assigned exactly 30 slots"], answer:"To ensure statistical significance", explanation:"The student explicitly raises the concern about needing 30 participants 'for statistical significance.'" },
      { type:"attitude", prompt:"How does the second student respond to the concern about participant numbers?", options:["By dismissing it as unimportant","By suggesting they recruit from the psychology participant pool","By saying they should reduce the sample size","By recommending a different study type"], answer:"By suggesting they recruit from the psychology participant pool", explanation:"The second student reassures by noting the participant pool should meet requirements." },
    ]
  },
  { title:"A student consults a professor about a failing grade on an essay", type:"office_hours",
    script:`A student meets with his English composition professor to understand why his essay received a failing grade. The professor explains that the essay lacked a clear thesis statement and that the body paragraphs did not develop the argument logically — they felt disconnected from one another. The student admits he wrote it the night before the deadline. The professor shows him examples of strong and weak thesis statements. She offers to accept a revised version if submitted within one week, with a maximum score of 70 percent. The professor also recommends the student visit the writing centre for support, noting that the writing centre tutors are specifically trained in composition. The student agrees and schedules a writing centre appointment.`,
    questions:[
      { type:"gist_purpose", prompt:"Why is the student meeting with the professor?", options:["To get an extension on an assignment","To discuss a failing essay grade","To complain about the course difficulty","To negotiate a letter of recommendation"], answer:"To discuss a failing essay grade", explanation:"The student visits to understand why his essay failed." },
      { type:"detail", prompt:"What specific problem does the professor identify with the essay?", options:["It was too long","It lacked a clear thesis and had disconnected paragraphs","The student used the wrong citation style","The essay covered the wrong topic"], answer:"It lacked a clear thesis and had disconnected paragraphs", explanation:"The professor cites a missing thesis and disconnected body paragraphs as the main issues." },
      { type:"inference", prompt:"What can be inferred from the student admitting he wrote the essay the night before?", options:["He is a strong student who works quickly","Rushed preparation contributed to the essay's weaknesses","The deadline was unfair","He always writes essays that way successfully"], answer:"Rushed preparation contributed to the essay's weaknesses", explanation:"The timing admission implies the essay problems resulted from lack of adequate preparation." },
      { type:"detail", prompt:"What is the maximum grade the student can receive for the revised essay?", options:["50 percent","60 percent","70 percent","100 percent"], answer:"70 percent", explanation:"The professor offers to accept a revision 'with a maximum score of 70 percent.'" },
      { type:"attitude", prompt:"What is the professor's attitude throughout the meeting?", options:["Angry and unwilling to help","Constructive and willing to offer support","Dismissive of the student's concerns","Uncertain about the grade she gave"], answer:"Constructive and willing to offer support", explanation:"She explains problems, offers examples, allows revision, and recommends the writing centre." },
    ]
  },
  { title:"A student discusses thesis research on renewable energy with her professor", type:"office_hours",
    script:`A graduate student meets with her thesis supervisor to discuss the direction of her research on community solar energy adoption. The supervisor suggests narrowing the focus from all renewable energy to specifically community solar, as the broader topic would be too large for a master's thesis. The student proposes using mixed methods — a survey combined with focus groups — to capture both quantitative data on adoption rates and qualitative insights about community attitudes. The supervisor is enthusiastic but recommends the student pilot-test the survey instrument with ten participants before full deployment to check for ambiguous questions. He also advises her to apply for IRB approval immediately since the process can take six to eight weeks.`,
    questions:[
      { type:"gist_content", prompt:"What is the main topic of this conversation?", options:["Undergraduate course selection","Graduate thesis research design","A funding application","A completed research paper"], answer:"Graduate thesis research design", explanation:"The conversation is about narrowing and designing the student's thesis research." },
      { type:"detail", prompt:"Why does the supervisor recommend narrowing the topic?", options:["The broader topic is not interesting","Community solar is more important than other renewables","The broader topic would be too large for a master's thesis","The library lacks resources on renewables"], answer:"The broader topic would be too large for a master's thesis", explanation:"The supervisor explicitly states the broader topic 'would be too large for a master's thesis.'" },
      { type:"function", prompt:"Why does the supervisor recommend pilot-testing the survey?", options:["To reduce the number of participants needed","To check for and identify ambiguous questions","To satisfy journal publication requirements","To earn extra credit in the research course"], answer:"To check for and identify ambiguous questions", explanation:"He recommends pilot-testing 'to check for ambiguous questions.'" },
      { type:"inference", prompt:"What can be inferred about the IRB approval process?", options:["It is automatic and takes only a day","It takes much longer than students often expect","The university rarely approves student research","It is optional for graduate students"], answer:"It takes much longer than students often expect", explanation:"The supervisor's advice to 'apply immediately' since it takes 6-8 weeks implies students underestimate the time." },
      { type:"attitude", prompt:"How does the supervisor react to the student's mixed-methods proposal?", options:["He rejects it entirely","He is enthusiastic but suggests a refinement","He says only quantitative methods should be used","He is indifferent"], answer:"He is enthusiastic but suggests a refinement", explanation:"The supervisor 'is enthusiastic' but recommends the pilot-test refinement." },
    ]
  },
];

const LISTENING_LECTURES = [
  { title:"The Role of Fire in Forest Ecosystems", discipline:"ecology",
    script:`Good morning. Today I want to talk about something that might seem counterintuitive at first — the idea that fire is not simply a destructive force in forest ecosystems but actually a critical ecological process.\n\nFor most of the twentieth century, land management agencies in North America pursued a policy of total fire suppression. The thinking was straightforward: fire destroys timber, kills wildlife, and threatens communities. But this policy had unintended consequences that we are still dealing with today.\n\nThe key concept I want you to understand is the fire regime — the characteristic pattern of fire frequency, intensity, and seasonality in a given ecosystem. Many ecosystems evolved under regular, low-intensity surface fires that cleared dead material, released nutrients into the soil, and created habitat diversity. When these fires were suppressed for decades, fuel loads — the accumulated dead wood and brush — built up to abnormal levels. When fires finally occur in these fuel-loaded landscapes, they often become catastrophic stand-replacing fires that kill even the largest trees.\n\nThe giant sequoia of California is a fascinating example. Its cones can remain closed on the tree for up to twenty years, held shut by a resin that only melts at the high temperatures produced by fire. When fire opens the cones, seeds fall onto the ash-fertilised mineral soil created by the fire — the ideal germination environment. Without periodic fire, the sequoia cannot regenerate effectively.\n\nEcologists distinguish between fire-adapted and fire-sensitive ecosystems. Fire-adapted communities — including many grasslands, pine forests, and Mediterranean shrublands — have evolved with regular fire and depend on it for nutrient cycling and species diversity. Fire-sensitive communities, such as temperate rainforests, rarely experience fire and can be severely damaged by it.\n\nModern land management has increasingly embraced prescribed burning — deliberately setting controlled fires under safe conditions — as a tool to restore natural fire regimes and reduce catastrophic fire risk. This requires careful planning, trained personnel, and community communication. But the ecological evidence strongly supports its use as a management strategy.`,
    questions:[
      { type:"gist_content", prompt:"What is the lecture mainly about?", options:["How to fight forest fires","The ecological role and management of fire in forests","Why all forests should be burned","The history of fire suppression policy only"], answer:"The ecological role and management of fire in forests", explanation:"The lecture covers fire's ecological role, the consequences of suppression, and modern management." },
      { type:"detail", prompt:"What does the professor say was the consequence of total fire suppression?", options:["Forests became more diverse","Fuel loads built up to abnormal levels","Wildlife populations increased dramatically","Water quality improved"], answer:"Fuel loads built up to abnormal levels", explanation:"Suppression allowed dead wood and brush to accumulate, increasing catastrophic fire risk." },
      { type:"function", prompt:"Why does the professor mention giant sequoia cones?", options:["To show that sequoias are endangered","To illustrate how some species depend on fire for reproduction","To compare California with other forest regions","To criticise fire suppression policies"], answer:"To illustrate how some species depend on fire for reproduction", explanation:"The sequoia example demonstrates fire-dependency in reproduction — cones open only in fire-generated heat." },
      { type:"inference", prompt:"What can be inferred about ecosystems that are fire-adapted?", options:["They are damaged by any fire","They evolved under conditions that included regular fire","They should never be subject to prescribed burning","They are found only in tropical regions"], answer:"They evolved under conditions that included regular fire", explanation:"The professor defines fire-adapted ecosystems as those that 'evolved under regular, low-intensity surface fires.'" },
      { type:"attitude", prompt:"What is the professor's attitude toward prescribed burning?", options:["Strongly opposed","Neutral and uncommitted","Supportive based on ecological evidence","Uncertain whether it is legal"], answer:"Supportive based on ecological evidence", explanation:"The professor states 'the ecological evidence strongly supports its use as a management strategy.'" },
      { type:"organization", prompt:"How does the professor organise the lecture?", options:["By listing unrelated facts about fire","By moving from historical policy to ecological concepts to a management solution","By presenting a debate between two scientists","By describing only one case study in detail"], answer:"By moving from historical policy to ecological concepts to a management solution", explanation:"The lecture progresses from suppression history → fire regime concept → examples → modern management." },
    ]
  },
  { title:"The Neuroscience of Decision-Making", discipline:"neuroscience",
    script:`Let's shift today to a question that touches both neuroscience and everyday life: how does the brain make decisions? This has been an active research area for about three decades, and the findings have overturned some long-held assumptions about human rationality.\n\nTraditionally, economists modelled human decision-making as a rational process in which people weigh costs and benefits, calculate probabilities, and choose the option that maximises their expected utility. This is called the rational actor model. The problem is that human behaviour frequently violates this model in systematic, predictable ways.\n\nDaniel Kahneman and Amos Tversky's work in the 1970s and 1980s identified what they called cognitive biases — systematic errors in judgment and reasoning. Their most famous finding was loss aversion: humans feel the pain of a loss roughly twice as strongly as they feel the pleasure of an equivalent gain. This is why people behave differently when the same choice is framed as avoiding a loss versus achieving a gain, even when the outcomes are mathematically identical.\n\nNeuroimaging studies have helped us understand the brain regions involved. The prefrontal cortex, particularly the ventromedial prefrontal cortex, integrates emotional signals with deliberate reasoning in value judgments. Patients with damage to this region make poor financial decisions and show deficits in long-term planning, even though their intelligence and short-term memory remain intact — this showed that emotion is not opposed to good decision-making but is actually necessary for it.\n\nThe amygdala, widely known for its role in processing fear and threat, also plays a role in economic decision-making, particularly under uncertainty and risk. Studies with patients who have amygdala damage show they are willing to take much greater financial risks than healthy controls and do not show normal aversion to losses.\n\nThe takeaway from this research is that human decision-making is not purely rational or purely emotional — it involves a continuous interaction between deliberate, slow reasoning and faster, automatic emotional responses. Understanding this interaction has applications in medicine, economics, public policy, and even courtroom law.`,
    questions:[
      { type:"gist_content", prompt:"What is the lecture mainly about?", options:["How to make better financial investments","The neuroscience and psychology of human decision-making","A critique of the work of Daniel Kahneman","Brain surgery for decision disorders"], answer:"The neuroscience and psychology of human decision-making", explanation:"The lecture covers the psychology and neuroscience of how humans make decisions." },
      { type:"detail", prompt:"What is loss aversion as described in the lecture?", options:["The tendency to avoid all financial decisions","Feeling losses about twice as strongly as equivalent gains","A rare neurological condition","A strategy used by stock traders"], answer:"Feeling losses about twice as strongly as equivalent gains", explanation:"Kahneman and Tversky found humans 'feel the pain of a loss roughly twice as strongly as the pleasure of an equivalent gain.'" },
      { type:"function", prompt:"Why does the professor discuss patients with ventromedial prefrontal cortex damage?", options:["To show that intelligence predicts good decisions","To argue that emotion interferes with decision-making","To demonstrate that emotion is necessary for good decision-making","To criticise brain surgery as treatment"], answer:"To demonstrate that emotion is necessary for good decision-making", explanation:"These patients make poor decisions despite intact intelligence, showing emotion is required." },
      { type:"inference", prompt:"What does the amygdala damage research suggest about risk-taking?", options:["Fear responses are completely unrelated to financial decisions","Normal fear and loss aversion help regulate financial risk-taking","People without amygdalas make better investments","Risk-taking is controlled only by the prefrontal cortex"], answer:"Normal fear and loss aversion help regulate financial risk-taking", explanation:"Amygdala-damaged patients take excessive risks, suggesting the amygdala normally limits risk-taking." },
      { type:"detail", prompt:"What does the professor say about the rational actor model?", options:["It accurately predicts all human choices","Human behaviour frequently violates it in systematic ways","It was developed by neuroscientists","It explains loss aversion perfectly"], answer:"Human behaviour frequently violates it in systematic ways", explanation:"The professor states people 'frequently violate this model in systematic, predictable ways.'" },
      { type:"connecting_content", prompt:"According to the lecture, what is the relationship between emotion and reasoning in decision-making?", options:["They are entirely separate processes","Emotion always overrides reasoning","They continuously interact in producing decisions","Reasoning always controls emotion"], answer:"They continuously interact in producing decisions", explanation:"The professor concludes that decision-making 'involves a continuous interaction between deliberate, slow reasoning and faster, automatic emotional responses.'" },
    ]
  },
  { title:"The History and Science of Vaccination", discipline:"biology/medicine",
    script:`Today I want to trace the history of vaccination from its earliest origins to its modern form, and explain the immunological principles that make it work.\n\nThe concept of deliberate inoculation to prevent disease predates the germ theory of disease by more than a century. In the early eighteenth century, Lady Mary Wortley Montagu observed the practice of variolation in Ottoman Turkey — deliberately exposing people to material from smallpox pustules to produce a mild infection and subsequent immunity. She introduced the practice to England in 1721. Variolation was effective but carried real risks: approximately 2 percent of those variolated died, though this compared favourably to the 30 percent mortality of natural smallpox.\n\nEdward Jenner's 1796 experiment transformed the field. Jenner noticed that milkmaids who had contracted the mild disease cowpox appeared immune to smallpox. He inoculated eight-year-old James Phipps with cowpox material, then deliberately exposed the boy to smallpox — and he did not develop the disease. Jenner called his procedure vaccination, from the Latin vacca, meaning cow. The cowpox virus is now known as vaccinia, and it is closely related enough to the smallpox virus that antibodies produced against one provide protection against the other.\n\nLouis Pasteur and others in the late nineteenth century extended vaccination to other diseases using attenuated — weakened — pathogens. Pasteur's vaccines for cholera in chickens and anthrax in sheep demonstrated that it was possible to systematically weaken a pathogen so that it could stimulate immunity without causing full disease. Robert Koch's identification of specific disease-causing bacteria provided the theoretical foundation for understanding what these vaccines were targeting.\n\nModern vaccines work by introducing an antigen — a substance that the immune system recognises as foreign — to stimulate the production of antibodies and the formation of immunological memory. This means that when the body encounters the real pathogen, it can mount a rapid, effective response before the infection establishes itself. Different vaccine platforms — live attenuated, inactivated, subunit, and the recently developed mRNA vaccines — all achieve this goal through different mechanisms.\n\nHerd immunity describes a threshold at which enough individuals in a population are immune that disease transmission chains cannot be sustained, providing indirect protection even to those who cannot be vaccinated. This threshold varies by pathogen: for measles, it is approximately 95 percent; for polio, roughly 80-85 percent. Declining vaccination rates in some populations have led to the re-emergence of diseases previously considered controlled.`,
    questions:[
      { type:"gist_content", prompt:"What is the lecture mainly about?", options:["The dangers of modern vaccines","The history and immunological basis of vaccination","How to manufacture vaccines","A biography of Edward Jenner"], answer:"The history and immunological basis of vaccination", explanation:"The lecture traces vaccination from early history through modern immunology." },
      { type:"detail", prompt:"According to the lecture, what was the mortality rate of variolation?", options:["About 0.1 percent","About 2 percent","About 10 percent","About 30 percent"], answer:"About 2 percent", explanation:"The professor states variolation killed 'approximately 2 percent of those variolated.'" },
      { type:"function", prompt:"Why does the professor mention James Phipps?", options:["To show that Jenner's methods were unethical","To illustrate the experimental basis of Jenner's vaccination discovery","To argue that children should not be vaccinated","To compare Jenner's work with Pasteur's"], answer:"To illustrate the experimental basis of Jenner's vaccination discovery", explanation:"The Phipps case is Jenner's key experimental proof that cowpox exposure prevented smallpox." },
      { type:"vocabulary_in_context", prompt:"The word 'attenuated' as used in the lecture is closest in meaning to:", options:["strengthened","eliminated","weakened","concentrated"], answer:"weakened", explanation:"Pasteur worked with 'attenuated — weakened — pathogens.'" },
      { type:"inference", prompt:"What can be inferred about herd immunity and measles?", options:["Only 50 percent immunity is needed to stop measles","Measles requires a higher vaccination rate than most diseases to achieve herd immunity","Measles has no herd immunity threshold","Herd immunity only applies to polio"], answer:"Measles requires a higher vaccination rate than most diseases to achieve herd immunity", explanation:"Measles requires ~95% immunity versus ~80-85% for polio, indicating it needs a higher threshold." },
      { type:"connecting_content", prompt:"How are Jenner's and Pasteur's contributions to vaccination related?", options:["They worked together on the same vaccines","Jenner developed the concept; Pasteur extended it to other diseases using weakened pathogens","Pasteur discovered vaccines; Jenner improved them","They had conflicting theories about immunity"], answer:"Jenner developed the concept; Pasteur extended it to other diseases using weakened pathogens", explanation:"The lecture presents Jenner as the founder and Pasteur as extending the approach systematically." },
    ]
  },
  { title:"Ocean Acidification and Its Effects on Marine Ecosystems", discipline:"oceanography/ecology",
    script:`Good afternoon. Ocean acidification is one of the more alarming consequences of rising atmospheric carbon dioxide, and one that receives less media coverage than temperature-related climate change, even though its ecological implications are profound.\n\nWhen carbon dioxide dissolves in seawater, it forms carbonic acid, which then dissociates into bicarbonate and hydrogen ions. It's the increase in hydrogen ion concentration that we measure as acidification — the ocean's pH has already fallen from approximately 8.2 to 8.1 since the industrial revolution, a change that represents a 26 percent increase in hydrogen ion concentration because of the logarithmic nature of the pH scale.\n\nThe most direct biological consequence involves calcifying organisms — those that build shells or skeletons from calcium carbonate. These include corals, oysters, mussels, sea urchins, and certain plankton species. As acidity increases and the concentration of carbonate ions decreases, these organisms must expend more energy to maintain and build their calcium carbonate structures. Under sufficiently acidic conditions, the structures can actually begin to dissolve.\n\nCoral reefs are of particular concern. Reefs are built over millennia by coral polyps that secrete calcium carbonate skeletons. These ecosystems support approximately 25 percent of all marine species despite covering less than one percent of the ocean floor. Laboratory experiments demonstrate that at projected end-of-century pH levels, coral calcification rates decline by 20 to 30 percent. Combined with thermal bleaching driven by ocean warming, ocean acidification represents a double stressor for reef systems.\n\nSome organisms show surprising resilience. Certain species of sea urchin and some calcifying plankton have shown the ability to maintain shell formation under more acidic conditions in experimental settings. However, this resilience appears to come at a metabolic cost and may reduce reproductive success or growth rates.\n\nThe social and economic dimensions of ocean acidification are also significant. Coral reef fisheries support the livelihoods of approximately 500 million people worldwide. The shellfish aquaculture industry in the Pacific Northwest of North America has already reported economic damage from acidification affecting oyster larvae. Addressing ocean acidification ultimately requires reducing atmospheric carbon dioxide emissions — there is no local fix for a global problem driven by fossil fuel combustion.`,
    questions:[
      { type:"gist_content", prompt:"What is the main topic of this lecture?", options:["How to reduce ocean pollution","The causes and ecological effects of ocean acidification","Ocean temperature changes only","How coral reefs are formed"], answer:"The causes and ecological effects of ocean acidification", explanation:"The lecture covers the chemistry of acidification and its effects on marine life." },
      { type:"detail", prompt:"According to the professor, what has happened to ocean pH since the industrial revolution?", options:["It has risen from 8.1 to 8.2","It has fallen from 8.2 to 8.1","It has remained stable at 8.0","It has dropped to 7.5"], answer:"It has fallen from 8.2 to 8.1", explanation:"The professor states pH has 'fallen from approximately 8.2 to 8.1 since the industrial revolution.'" },
      { type:"function", prompt:"Why does the professor note the logarithmic nature of the pH scale?", options:["To confuse students with mathematics","To explain why the 0.1 pH change is more significant than it sounds","To argue that acidification is not real","To convert between temperature and acidity"], answer:"To explain why the 0.1 pH change is more significant than it sounds", explanation:"The logarithmic scale means 0.1 pH change = 26% increase in hydrogen ions — much larger than the number implies." },
      { type:"inference", prompt:"What can be inferred about the future of coral reefs if CO2 emissions continue?", options:["They will benefit from warmer, more acidic water","They face serious threats from both acidification and warming","They are completely unaffected by ocean chemistry","They will relocate to deeper water"], answer:"They face serious threats from both acidification and warming", explanation:"The professor identifies acidification and thermal bleaching as a 'double stressor' for reefs." },
      { type:"detail", prompt:"According to the lecture, what percentage of marine species do coral reefs support?", options:["About 5 percent","About 10 percent","About 25 percent","About 50 percent"], answer:"About 25 percent", explanation:"Reefs 'support approximately 25 percent of all marine species.'" },
      { type:"attitude", prompt:"What is the professor's view on local solutions to ocean acidification?", options:["Local action can solve the problem","Local fixes are unnecessary","There is no local fix — it requires global CO2 reduction","Individual consumer choices are the best solution"], answer:"There is no local fix — it requires global CO2 reduction", explanation:"The professor explicitly states 'there is no local fix for a global problem driven by fossil fuel combustion.'" },
    ]
  },
  { title:"Collective Memory and Historical Narratives", discipline:"sociology/history",
    script:`Today I want to introduce you to the concept of collective memory — an idea developed by the French sociologist Maurice Halbwachs in the early twentieth century that has become central to how historians and sociologists think about the relationship between the past and the present.\n\nHalbwachs argued that all memory is fundamentally social. Individual memories are always shaped by our participation in social groups — families, communities, nations — and by the frameworks those groups provide. We remember differently depending on the groups we belong to, and our memories change as those group affiliations change.\n\nCollective memory refers to the shared representations of the past that a group maintains, often through rituals, monuments, education, and media. These are not simply accurate records of what happened; they are shaped by the needs, values, and power dynamics of the group in the present. This means collective memories can be deeply contested — different groups within the same society often maintain conflicting accounts of the same historical events.\n\nConsider how differently World War II is remembered in different national contexts. In the United States, the dominant narrative emphasises liberation, democracy, and heroic sacrifice. In Japan, official war memory was for decades more focused on Japanese victimhood — particularly the atomic bombings — than on Japanese Imperial aggression. In Germany, post-war collective memory underwent a remarkable transformation: from early denial and silence to what scholars now call Erinnerungskultur — a culture of remembrance — that explicitly confronts German responsibility for the Holocaust.\n\nMemorials and monuments are powerful sites of collective memory construction. Who is commemorated, how they are depicted, and where memorials are placed all reflect the values and politics of the group that built them. The recent debates in the United States and Britain over statues of slave traders and Confederate leaders illustrate how contested these sites of memory can become when the values of a society shift.\n\nDigital technology has created new possibilities for collective memory. Online archives, crowdsourced historical documentation, and social media now allow marginalised communities to preserve and disseminate their own historical narratives in ways that were previously impossible.`,
    questions:[
      { type:"gist_content", prompt:"What concept is the lecture mainly about?", options:["Individual psychological memory","Collective memory and how groups maintain narratives of the past","Digital archives and their limitations","A biography of Maurice Halbwachs"], answer:"Collective memory and how groups maintain narratives of the past", explanation:"The lecture is primarily about collective memory and how social groups shape historical narratives." },
      { type:"detail", prompt:"According to the lecture, what did Halbwachs argue about memory?", options:["Memory is entirely biological","All memory is fundamentally social, shaped by group membership","Accurate memory is impossible for humans","Individuals remember independently of their social context"], answer:"All memory is fundamentally social, shaped by group membership", explanation:"Halbwachs argued 'all memory is fundamentally social' and shaped by group participation." },
      { type:"rhetorical_purpose", prompt:"Why does the professor compare World War II memory in the US, Japan, and Germany?", options:["To argue that only Germany has accurate war memory","To show how collective memories of the same events differ across national groups","To criticise American war memory","To prove that all war memory is false"], answer:"To show how collective memories of the same events differ across national groups", explanation:"The comparison illustrates that the same historical event can be remembered very differently by different societies." },
      { type:"vocabulary_in_context", prompt:"The German word Erinnerungskultur as used in the lecture refers to:", options:["A policy of war reparations","A culture of active remembrance and confrontation with historical responsibility","A festival celebrating German victory","Denial of wartime atrocities"], answer:"A culture of active remembrance and confrontation with historical responsibility", explanation:"The professor defines it as 'a culture of remembrance — that explicitly confronts German responsibility for the Holocaust.'" },
      { type:"inference", prompt:"What can be inferred from the lecture about collective memories?", options:["They are objective records of historical truth","They are always controlled by governments","They reflect present-day values and can change over time","They are fixed once established and never contested"], answer:"They reflect present-day values and can change over time", explanation:"The lecture shows collective memory changes as societies' values change — e.g., statue debates." },
      { type:"connecting_content", prompt:"How does the professor connect monuments to collective memory?", options:["Monuments are purely aesthetic objects","They are powerful sites that reflect the values of those who built them and can be contested","All monuments accurately represent historical truth","Monuments should be preserved regardless of their content"], answer:"They are powerful sites that reflect the values of those who built them and can be contested", explanation:"The professor argues monument design and placement 'reflect the values and politics of the group that built them' and become contested when values shift." },
    ]
  },
  { title:"Symbiosis: Forms and Functions of Interspecies Relationships", discipline:"biology",
    script:`Good morning. Today we're going to explore symbiosis — the close, long-term biological interactions between different species. The term is often misused in popular culture to mean any mutually beneficial relationship, but in ecology it has a broader technical meaning that includes several distinct types of interaction.\n\nSymbiosis is classified by the costs and benefits to each partner. Mutualism describes relationships in which both species benefit. Commensalism describes relationships where one species benefits and the other is neither helped nor harmed. Parasitism describes relationships where one organism — the parasite — benefits at the expense of the host.\n\nLet me give you examples of each. Mutualism: the relationship between flowering plants and their pollinators is one of the most ecologically important mutualisms on Earth. Bees receive nectar as food; flowers receive pollination services essential for reproduction. The relationship is so tight in some cases — obligate mutualisms — that neither partner can survive without the other. The yucca plant and the yucca moth are a textbook example: the moth is the sole pollinator of yucca flowers and can only lay its eggs in yucca seed pods.\n\nCommensalism is harder to confirm because apparent neutrality is often just unmeasured harm or benefit. Barnacles attaching to whale skin were long considered commensal — the barnacle gets free transport to nutrient-rich waters; the whale seems unaffected. Recent research suggests, however, that heavy barnacle loads may slightly reduce whale swimming efficiency, making this potentially parasitic.\n\nParasitism is the most common mode of symbiosis on Earth by species count. Most biologists estimate that at least half of all species are parasitic at some stage of their life cycle. Tapeworms absorbing nutrients from a host intestine, mistletoe extracting water and minerals from tree tissue, cuckoos laying eggs in other birds' nests — all are examples of parasitic interactions that span the plant, animal, and microbial worlds.\n\nSymbiosis drives evolution in profound ways. Co-evolution — the process by which two species exert selective pressure on each other over generations — produces remarkable adaptations. The arms race between parasites and host immune systems has shaped the evolution of vertebrate immunity. Mitochondria, the energy-producing organelles in eukaryotic cells, evolved from proteobacteria engulfed by ancient cells in what is now understood as an ancient endosymbiotic event — the most consequential mutualism in the history of life.`,
    questions:[
      { type:"gist_content", prompt:"What is the main topic of the lecture?", options:["How to classify organisms by kingdom","The forms and functions of symbiotic relationships between species","A comparison of parasite life cycles only","The evolution of flowers and pollinators"], answer:"The forms and functions of symbiotic relationships between species", explanation:"The lecture defines and illustrates the three main types of symbiosis and their evolutionary significance." },
      { type:"detail", prompt:"How does the professor define mutualism?", options:["A relationship where one species benefits at another's expense","A relationship where both species benefit","A relationship where one benefits and the other is unaffected","Any interaction between two species"], answer:"A relationship where both species benefit", explanation:"The professor defines mutualism as relationships 'in which both species benefit.'" },
      { type:"function", prompt:"Why does the professor mention the yucca plant and yucca moth?", options:["To illustrate obligate mutualism where neither partner can survive without the other","To show that moths are parasites","To compare mutualism and commensalism","To explain pollination in general"], answer:"To illustrate obligate mutualism where neither partner can survive without the other", explanation:"The yucca example demonstrates obligate mutualism — complete interdependence between partners." },
      { type:"inference", prompt:"What does the barnacle-whale example suggest about classifying symbiotic relationships?", options:["All barnacle relationships are parasitic","Symbiotic categories are sometimes difficult to establish without careful measurement","Commensalism is the most common form of symbiosis","Whales benefit from carrying barnacles"], answer:"Symbiotic categories are sometimes difficult to establish without careful measurement", explanation:"The barnacle seemed commensal but may be slightly parasitic — illustrating classification difficulty." },
      { type:"detail", prompt:"According to the professor, what is the significance of mitochondria in symbiosis?", options:["They are an example of a destructive parasitic relationship","They evolved from engulfed bacteria in an ancient mutualistic event","They are only found in parasitic organisms","They demonstrate commensalism in cells"], answer:"They evolved from engulfed bacteria in an ancient mutualistic event", explanation:"Mitochondria are presented as the most consequential ancient endosymbiotic mutualism." },
      { type:"attitude", prompt:"What is the professor's view on the prevalence of parasitism?", options:["Parasitism is rare and ecologically unimportant","Parasitism is the most common mode of symbiosis — most species are parasitic at some stage","Parasitism only affects plants","Parasitism has been eliminated by evolution"], answer:"Parasitism is the most common mode of symbiosis — most species are parasitic at some stage", explanation:"The professor states 'at least half of all species are parasitic at some stage of their life cycle.'" },
    ]
  },
];

// ─── Speaking task bank ───────────────────────────────────────────────────────

const SPEAKING_TESTS = [
  { topic:"Technology and Daily Life", tasks:[
    { taskNum:1, taskType:"independent", prompt:"Some people prefer to use technology such as smartphones and apps to help manage their daily tasks, while others prefer to manage tasks without technology. Which do you prefer and why?", prepSeconds:15, responseSeconds:45, rubric:["delivery","language use","topic development"] },
    { taskNum:2, taskType:"campus_integrated", readingTitle:"University Announces New Digital Study Rooms", readingText:"The university library will open 20 new digital study rooms next semester. Each room will be equipped with large-screen monitors, collaborative software, and soundproofing. Students will be able to book rooms through the library portal up to 48 hours in advance. Library staff will be available during peak hours to provide technical support.", listeningDescription:"A male student expresses enthusiasm about the digital study rooms to a female student. He says he's been struggling to find quiet space with good technology for group projects, and this solves that problem. The female student is less enthusiastic — she says the booking limit of 48 hours is too restrictive, and worries about technical problems during important study sessions.", prompt:"The man expresses his opinion about the university's new digital study rooms. State his opinion and explain the reasons he gives for holding it.", prepSeconds:30, responseSeconds:60, rubric:["delivery","language use","topic development"] },
    { taskNum:3, taskType:"academic_integrated", readingTitle:"Cognitive Offloading", readingText:"Cognitive offloading refers to the process of using external tools — such as notes, lists, or digital devices — to reduce the cognitive demands placed on working memory. When people store information externally, they free up mental resources for other tasks. Researchers argue that cognitive offloading is a normal and adaptive human strategy rather than a sign of intellectual laziness.", listeningDescription:"A professor gives an example of cognitive offloading in an experiment where participants who were allowed to photograph objects they needed to remember later performed better on subsequent memory tests than those who had to memorise objects without assistance. The professor notes this shows external tools can enhance rather than replace cognitive function.", prompt:"Using the example from the lecture, explain how it illustrates the concept of cognitive offloading described in the reading.", prepSeconds:30, responseSeconds:60, rubric:["delivery","language use","topic development"] },
    { taskNum:4, taskType:"academic_integrated_lecture_only", listeningDescription:"A professor discusses how algorithms on social media platforms use engagement metrics to determine what content users see. The professor explains that content designed to provoke strong emotional responses — particularly anger or outrage — generates more clicks and comments, which the algorithm interprets as high-value content. This creates an incentive structure that systematically amplifies emotionally provocative content regardless of its accuracy.", prompt:"Using points from the lecture, explain how social media algorithms affect the content users see.", prepSeconds:20, responseSeconds:60, rubric:["delivery","language use","topic development"] },
  ]},
  { topic:"Environmental Challenges", tasks:[
    { taskNum:1, taskType:"independent", prompt:"Some people believe individuals can make a significant contribution to addressing environmental problems through personal lifestyle choices. Others think only government and business action can make a real difference. Which view do you agree with and why?", prepSeconds:15, responseSeconds:45, rubric:["delivery","language use","topic development"] },
    { taskNum:2, taskType:"campus_integrated", readingTitle:"Campus Introduces Mandatory Sustainability Module", readingText:"Beginning next academic year, all undergraduate students will be required to complete a one-credit sustainability module in their first semester. The module will cover topics including carbon footprints, renewable energy, and sustainable consumer choices. The provost's office states the initiative is intended to prepare graduates to engage with environmental challenges in their professional lives.", listeningDescription:"A female student discusses the mandatory module with a male student. She supports it strongly — she says most students don't know basic facts about their environmental impact and this will fill that gap. The male student is critical — he argues it should be optional, as students already choose their courses based on their interests and goals, and a mandatory course reduces the value of elective choices.", prompt:"The woman expresses her opinion about the mandatory sustainability module. State her opinion and explain the reasons she gives.", prepSeconds:30, responseSeconds:60, rubric:["delivery","language use","topic development"] },
    { taskNum:3, taskType:"academic_integrated", readingTitle:"Ecological Resilience", readingText:"Ecological resilience refers to the capacity of an ecosystem to absorb disturbances — such as drought, fire, or flooding — and reorganise while undergoing change, retaining essentially the same function, structure, and identity. Highly resilient ecosystems can withstand significant stress without shifting to an alternative stable state. Diversity of species is considered a key component of resilience.", listeningDescription:"A professor discusses a study of grassland ecosystems that experienced severe drought. Grasslands with higher plant diversity maintained greater productivity during and after the drought compared to low-diversity grasslands. The professor explains that different plant species responded differently to water stress, so when some species declined, others compensated, maintaining the ecosystem's overall function.", prompt:"Using the example from the lecture, explain how it illustrates the concept of ecological resilience described in the reading.", prepSeconds:30, responseSeconds:60, rubric:["delivery","language use","topic development"] },
    { taskNum:4, taskType:"academic_integrated_lecture_only", listeningDescription:"A professor explains how urban trees provide multiple ecosystem services in cities. Beyond aesthetic value, urban trees reduce air temperature through shading and evapotranspiration, intercept stormwater runoff, absorb air pollutants, and reduce noise levels. The professor notes that research shows proximity to urban green spaces is associated with improved mental health outcomes, and that urban trees increase property values in surrounding areas by measurable amounts.", prompt:"Using points and examples from the lecture, describe the benefits of urban trees as discussed by the professor.", prepSeconds:20, responseSeconds:60, rubric:["delivery","language use","topic development"] },
  ]},
  { topic:"Education and Learning", tasks:[
    { taskNum:1, taskType:"independent", prompt:"Do you think that students learn more effectively in traditional classroom settings or through online education? Use specific reasons and examples to support your opinion.", prepSeconds:15, responseSeconds:45, rubric:["delivery","language use","topic development"] },
    { taskNum:2, taskType:"campus_integrated", readingTitle:"University to Expand Pass/Fail Grading Option", readingText:"The Academic Committee has approved an expansion of the pass/fail grading option, allowing students to designate up to two courses per semester as pass/fail rather than receiving a letter grade. Previously, the option was restricted to one course per semester. The committee stated the change is intended to encourage students to explore subjects outside their comfort zone without fear of damaging their GPA.", listeningDescription:"A male student enthusiastically supports the change — he says he always wanted to take an art course but was afraid of getting a low grade in a field he had no experience in. The female student he's talking to is sceptical — she says grades provide important feedback and that students might not take pass/fail courses as seriously, leading to lower learning quality.", prompt:"The man expresses his opinion about expanding the pass/fail grading option. State his opinion and explain the reasons he gives.", prepSeconds:30, responseSeconds:60, rubric:["delivery","language use","topic development"] },
    { taskNum:3, taskType:"academic_integrated", readingTitle:"Spaced Practice in Learning", readingText:"Spaced practice, also called distributed practice, refers to the strategy of spreading learning sessions out over time rather than concentrating them in a single extended session. Research in cognitive psychology consistently shows that information studied in spaced intervals is retained more effectively than the same material studied in a single massed session — the phenomenon known as the spacing effect.", listeningDescription:"A professor describes a study in which two groups of students learned a set of vocabulary words. Group A studied the words in three consecutive days of study. Group B studied the same words but spread sessions across three weeks. In a test given one month later, Group B recalled significantly more words, demonstrating the spacing effect in a real educational context.", prompt:"Using the example from the lecture, explain how it demonstrates the concept of spaced practice described in the reading.", prepSeconds:30, responseSeconds:60, rubric:["delivery","language use","topic development"] },
    { taskNum:4, taskType:"academic_integrated_lecture_only", listeningDescription:"A professor discusses how metacognition — thinking about one's own thinking and learning — improves academic performance. Students who actively monitor their comprehension, identify gaps in their understanding, and adjust their study strategies accordingly consistently outperform students who do not engage in this self-monitoring. The professor notes that metacognitive skills can be explicitly taught and are particularly effective when combined with feedback.", prompt:"Using points and examples from the lecture, describe how metacognition affects learning as discussed by the professor.", prepSeconds:20, responseSeconds:60, rubric:["delivery","language use","topic development"] },
  ]},
];

// ─── Writing task bank ────────────────────────────────────────────────────────

const WRITING_TESTS = [
  { title:"TOEFL iBT Writing Practice Test 1", topic:"Remote Work and Productivity",
    task1: {
      readingTitle:"Benefits of Remote Work for Employee Productivity",
      readingText:"Remote work arrangements offer several advantages that can significantly enhance employee productivity. First, working from home eliminates the daily commute, giving employees additional time that many use for preparation or exercise, arriving at their workday more focused. Second, home environments allow individuals to personalise their workspace in ways that suit their working style — adjusting lighting, temperature, and noise levels to optimise concentration. Third, studies indicate that remote workers often experience fewer workplace interruptions than office-based counterparts, allowing for longer periods of uninterrupted deep work. Surveys of remote workers consistently report higher levels of job satisfaction, which research links to greater motivation and sustained effort.",
      lectureDescription:"The professor challenges each point in the reading. First, home environments introduce their own distractions — family members, household chores, and the blurring of work and home boundaries actually reduce the quality of focus for many workers. Second, the professor cites a Stanford study showing that while some remote workers are more productive, the effect is highly variable and depends strongly on the individual's home circumstances. Third, regarding collaboration: the reading ignores that many forms of productive work require spontaneous interaction and team creativity, which are significantly harder to achieve remotely. The professor concludes that remote work benefits are real for some workers and tasks but are overstated as a universal solution.",
      prompt:"Summarise the points made in the lecture, being sure to explain how they cast doubt on the specific points made in the reading passage.",
      modelAnswer:"The reading argues that remote work enhances productivity through three main points: eliminating commutes, enabling personalised workspaces, and reducing interruptions. The professor challenges all three claims.\n\nOn commutes, the professor notes that home environments introduce their own distractions — family members and household responsibilities — that offset any time saved by avoiding travel. Rather than improving focus, working from home may blur the boundary between professional and personal life.\n\nRegarding personalised workspaces, the professor references a Stanford study showing productivity gains from remote work are highly inconsistent and depend heavily on individual home circumstances. Some workers benefit, but others do not, making the reading's claim overly broad.\n\nFinally, the professor argues that the reading overlooks the importance of spontaneous interaction and collaborative creativity, which are significantly harder to achieve when teams work remotely. Many productive activities require informal real-time collaboration that remote arrangements cannot replicate effectively.\n\nIn summary, the professor agrees that remote work benefits some workers, but contends that the reading overstates these benefits as universal advantages.",
      rubric:["task response","coherence and cohesion","lexical resource","grammatical range"],
      timeSeconds:1200, targetWords:"150-225",
    },
    task2: {
      professorName:"Dr Chen",
      professorQuestion:"This week we have been studying how organisations motivate employees. Consider the following question: Do you think financial rewards are more effective at motivating workers than non-financial rewards such as recognition, flexible hours, or meaningful work? Explain your view and give reasons.",
      student1Name:"Marcus",
      student1Response:"I think financial rewards are the most powerful motivator because money is universally useful. You can use it for anything — rent, travel, saving for the future. Recognition might feel good for a moment, but when bills are due, a bonus matters far more. Most people ultimately work because they need income, so increasing that income directly is the clearest way to motivate them.",
      student2Name:"Priya",
      student2Response:"I disagree. Research in psychology consistently shows that once people earn enough to meet their basic needs, additional money has diminishing returns on motivation. What keeps people genuinely engaged is autonomy, a sense of purpose, and the feeling that their work matters. A pay rise might boost effort briefly, but meaningful work sustains motivation over the long term.",
      prompt:"Your professor is teaching a class on organisational psychology. Write a post responding to the professor's question. In your response, express and support your personal opinion, and make a contribution to the discussion in your own words. An effective response will contain at least 100 words.",
      rubric:["task response","coherence","lexical resource","grammar"],
      timeSeconds:600, targetWords:"100+",
    },
  },
  { title:"TOEFL iBT Writing Practice Test 2", topic:"Urban Green Spaces and Public Health",
    task1: {
      readingTitle:"Urban Green Spaces Improve Public Health Outcomes",
      readingText:"Research consistently demonstrates that access to parks, urban forests, and other green spaces produces measurable improvements in public health. Physical activity levels rise when green spaces are accessible, as parks provide safe, attractive environments for walking, cycling, and recreation. Mental health benefits are also well documented: exposure to natural environments reduces cortisol levels and is associated with lower rates of anxiety and depression. Additionally, urban trees and vegetation improve air quality by absorbing particulate matter and ozone, reducing the incidence of respiratory conditions such as asthma.",
      lectureDescription:"The professor questions whether green space access truly drives these health improvements. On physical activity: studies show people who live near parks are already more likely to be physically active for reasons unrelated to the park — socioeconomic status, neighbourhood safety, and personal health consciousness all correlate with both park access and physical activity. On mental health: self-report studies are subject to demand bias — people who enjoy nature report feeling better partly because they expected to. Controlled experiments produce smaller effects. On air quality: urban trees provide modest air quality benefits, but these are concentrated in tree canopy areas and do not significantly improve air quality at the street level where most pollution exposure occurs.",
      prompt:"Summarise the points made in the lecture, being sure to explain how they cast doubt on specific points made in the reading passage.",
      modelAnswer:"The reading claims that urban green spaces improve public health in three ways: increasing physical activity, improving mental health, and reducing air pollution. The professor questions all three arguments.\n\nFirst, on physical activity, the professor argues that people who live near parks are already more active for reasons unrelated to the parks themselves — factors like socioeconomic status and neighbourhood safety explain both park access and active lifestyles. The correlation may not reflect a causal relationship.\n\nSecond, regarding mental health, the professor notes that self-report studies are subject to demand bias. People who spend time in nature may report feeling better partly because they expected to. Controlled experimental studies show much smaller mental health effects than survey-based research.\n\nThird, while acknowledging trees absorb some pollutants, the professor argues that air quality benefits from urban greenery are limited to the canopy level and do not significantly reduce pollution at street level, where people actually experience most of their air pollution exposure.\n\nOverall, the professor suggests that the public health case for urban green spaces, while not entirely without merit, is less clear-cut than the reading implies.",
      rubric:["task response","coherence and cohesion","lexical resource","grammatical range"],
      timeSeconds:1200, targetWords:"150-225",
    },
    task2: {
      professorName:"Dr Patel",
      professorQuestion:"Urban planners must decide how to use limited city space. Some argue that cities should prioritise building affordable housing on available land. Others argue that protecting and expanding parks and green spaces should take priority. What is your view? Which should cities prioritise, and why?",
      student1Name:"Aisha",
      student1Response:"Housing has to come first. A park is nice, but it doesn't help someone who can't afford rent. Cities are experiencing housing crises — homelessness is rising and families are spending 50 percent or more of their income on housing. Prioritising parks when people have nowhere affordable to live seems like the wrong set of values.",
      student2Name:"Lucas",
      student2Response:"But green spaces provide health benefits that reduce long-term healthcare costs, improve air quality, and give families places to exercise and relax. If we build housing on every available plot, we lose those benefits permanently. Cities need a long-term vision that includes both housing and green space, and we shouldn't sacrifice one entirely for the other.",
      prompt:"Write a post responding to the professor's question. Express and support your personal opinion and make a contribution to the discussion in your own words. An effective response will contain at least 100 words.",
      rubric:["task response","coherence","lexical resource","grammar"],
      timeSeconds:600, targetWords:"100+",
    },
  },
  { title:"TOEFL iBT Writing Practice Test 3", topic:"Artificial Intelligence in Education",
    task1: {
      readingTitle:"AI Tutoring Systems Enhance Student Learning",
      readingText:"Artificial intelligence tutoring systems offer several advantages over traditional instructional methods. First, these systems provide immediate, personalised feedback tailored to each student's performance level, allowing learners to identify and correct errors in real time rather than waiting for a teacher to review their work. Second, AI tutors are available around the clock, removing the time constraints of fixed class schedules and enabling students in different time zones or with demanding personal schedules to access quality instruction. Third, data collected by AI tutoring systems enables teachers to monitor individual student progress in detail, allowing them to allocate their limited instructional time to students who need the most support.",
      lectureDescription:"The professor raises concerns about each claimed advantage. On personalised feedback: AI systems are excellent at correcting factual and procedural errors but struggle with higher-order thinking — analysing arguments, evaluating evidence, developing original ideas. The feedback they provide is therefore useful for basic skills but inadequate for the most important aspects of education. On availability: constant access to AI instruction may undermine the development of self-regulated learning skills. Students need to develop the ability to manage their own learning schedules; having instant help always available may prevent this. On teacher data: the data AI systems collect focuses on measurable outcomes, potentially distorting instruction toward easily quantifiable skills at the expense of creativity and critical thinking.",
      prompt:"Summarise the points made in the lecture, explaining how they cast doubt on the specific points made in the reading passage.",
      modelAnswer:"The reading presents three advantages of AI tutoring systems: personalised feedback, around-the-clock availability, and detailed progress data for teachers. The professor challenges each of these claims.\n\nFirst, while acknowledging AI systems can correct basic errors effectively, the professor argues they struggle with higher-order thinking skills such as analysing arguments and developing original ideas. The feedback AI provides is therefore limited to foundational skills and misses the most important aspects of education.\n\nSecond, regarding constant availability, the professor argues this may actually harm students' development of self-regulated learning skills. Part of education involves learning to manage one's own time and motivation; having instant AI assistance always available may prevent students from developing this independence.\n\nThird, concerning teacher data, the professor notes that AI systems collect information on measurable, quantifiable outcomes. This risks distorting instruction toward easily measured skills — such as factual recall — at the expense of harder-to-measure but crucial abilities like creativity and critical thinking.\n\nIn conclusion, the professor does not deny that AI tutoring has some value, but argues that the reading overstates these advantages by failing to consider significant limitations.",
      rubric:["task response","coherence and cohesion","lexical resource","grammatical range"],
      timeSeconds:1200, targetWords:"150-225",
    },
    task2: {
      professorName:"Dr Williams",
      professorQuestion:"We have been discussing the integration of artificial intelligence into education. Some educators argue that AI tools such as chatbots and writing assistants should be freely available to students as learning aids. Others argue that allowing AI tools undermines the development of essential skills. What is your view?",
      student1Name:"Kenji",
      student1Response:"AI tools should be freely available. Students already use search engines, calculators, and spell checkers — these didn't stop people from learning. AI assistants are just the next step. The key is teaching students how to use these tools critically, not banning them. Banning AI in education would leave students unprepared for workplaces that use these tools constantly.",
      student2Name:"Sofia",
      student2Response:"I'm concerned that AI writing tools in particular undermine the development of writing skills. Writing forces you to think clearly and organise your ideas — if an AI generates your text, you skip that process entirely. A student who never struggles with their own writing never really learns to write. Some skills need to be developed through personal effort, not outsourced.",
      prompt:"Write a post responding to the professor's question. Express and support your personal opinion and make a contribution to the discussion in your own words. An effective response will contain at least 100 words.",
      rubric:["task response","coherence","lexical resource","grammar"],
      timeSeconds:600, targetWords:"100+",
    },
  },
];

// Generate additional writing tests 4-30 from topic pool
const WRITING_EXTRA_TOPICS = [
  ["Space Exploration Funding","Government funding for space exploration"],
  ["Universal Basic Income","Guaranteed income for all citizens"],
  ["Social Media and Democracy","Social media's effect on democratic discourse"],
  ["Vegetarian Diets and Health","Plant-based diets and health outcomes"],
  ["Gap Year Benefits","Taking time off between school and university"],
  ["Public Transport Investment","Investing in public vs. private transport"],
  ["Arts in School Curriculum","Mandatory arts education in schools"],
  ["Genetic Testing Ethics","Ethical implications of genetic testing"],
  ["Four-Day Work Week","Reducing the work week to four days"],
  ["Zoo Conservation Role","Zoos as conservation vs. ethical concerns"],
  ["Nuclear Energy Future","Nuclear power as a clean energy source"],
  ["Standardised Testing","The value of standardised academic testing"],
  ["Globalisation and Culture","Effects of globalisation on local cultures"],
  ["Elderly Care Responsibility","Who should care for ageing populations"],
  ["Free University Education","Making higher education free for all"],
  ["Autonomous Vehicles","Self-driving cars and safety"],
  ["Plastic Bag Bans","Government bans on single-use plastics"],
  ["Celebrity Influence","Public figures' responsibility as role models"],
  ["Prison Reform","Rehabilitation vs. punishment in criminal justice"],
  ["Telemedicine","Remote healthcare and its limitations"],
  ["Biodiversity and Agriculture","Intensive farming and wildlife loss"],
  ["Public Art Funding","Government funding for public art"],
  ["Homework in Schools","Whether homework improves learning"],
  ["Cultural Heritage Tourism","Tourism's impact on cultural sites"],
  ["Carbon Taxes","Taxing carbon emissions to reduce pollution"],
  ["Media Literacy","Teaching critical evaluation of media"],
  ["Volunteering Requirements","Mandatory community service"],
];

// ─── File generation functions ────────────────────────────────────────────────

function buildReadingTest(testNum, testData) {
  const numStr = String(testNum).padStart(3,"0");
  const testId = `toefl-reading-${numStr}`;
  const questions = [];
  let qNum = 1;

  for (let pi = 0; pi < testData.passages.length; pi++) {
    const passage = testData.passages[pi];
    const passageId = `${testId}-p${pi+1}`;

    for (const qSpec of passage.questions) {
      const q = {
        id: `${testId}-q${String(qNum).padStart(2,"0")}`,
        passageId,
        passageIndex: pi,
        questionType: qSpec.type,
        num: qNum,
        prompt: qSpec.prompt,
        correctAnswer: qSpec.answer,
        explanation: qSpec.explanation,
      };
      if (qSpec.options) q.options = qSpec.options;
      if (qSpec.type === "insert_text") q.insertLocation = qSpec.insertLocation || "paragraph 3";
      questions.push(q);
      qNum++;
    }
  }

  return {
    id: testId,
    exam: "toefl",
    section: "reading",
    type: "section",
    title: testData.title,
    variant: "ibt",
    durationSeconds: 2100,
    questionCount: questions.length,
    instructions: "Read each passage carefully and answer all questions. You have 35 minutes. Questions test factual understanding, vocabulary, inference, and the ability to identify main ideas.",
    passages: testData.passages.map((p, pi) => ({
      id: `${testId}-p${pi+1}`,
      title: p.title,
      text: p.text,
    })),
    questions,
  };
}

function buildListeningTest(testNum) {
  const numStr = String(testNum).padStart(3,"0");
  const testId = `toefl-listening-${numStr}`;

  // Pick conversations and lectures using rotation
  const convOffset = (testNum - 1) * 2;
  const lectOffset = (testNum - 1) * 3;
  const convBank = LISTENING_CONVERSATIONS;
  const lectBank = LISTENING_LECTURES;

  const convs = [
    convBank[convOffset % convBank.length],
    convBank[(convOffset + 1) % convBank.length],
  ];
  const lects = [
    lectBank[lectOffset % lectBank.length],
    lectBank[(lectOffset + 1) % lectBank.length],
    lectBank[(lectOffset + 2) % lectBank.length],
  ];

  const scripts = [];
  const questions = [];
  let qNum = 1;
  let sNum = 1;

  // 2 conversations × 5 questions
  for (const conv of convs) {
    const scriptId = `${testId}-s${sNum}`;
    scripts.push({ id: scriptId, type:"conversation", title: conv.title, script: conv.script });
    for (const qSpec of conv.questions) {
      questions.push({
        id: `${testId}-q${String(qNum).padStart(2,"0")}`,
        scriptId, num: qNum,
        questionType: qSpec.type,
        prompt: qSpec.prompt,
        options: qSpec.options,
        correctAnswer: qSpec.answer,
        explanation: qSpec.explanation,
      });
      qNum++;
    }
    sNum++;
  }

  // 3 lectures × 6 questions
  for (const lect of lects) {
    const scriptId = `${testId}-s${sNum}`;
    scripts.push({ id: scriptId, type:"lecture", discipline: lect.discipline, title: lect.title, script: lect.script });
    for (const qSpec of lect.questions) {
      questions.push({
        id: `${testId}-q${String(qNum).padStart(2,"0")}`,
        scriptId, num: qNum,
        questionType: qSpec.type,
        prompt: qSpec.prompt,
        options: qSpec.options,
        correctAnswer: qSpec.answer,
        explanation: qSpec.explanation,
      });
      qNum++;
    }
    sNum++;
  }

  return {
    id: testId,
    exam: "toefl",
    section: "listening",
    type: "section",
    title: `TOEFL iBT Listening Practice Test ${testNum}`,
    variant: "ibt",
    durationSeconds: 2160,
    questionCount: questions.length,
    instructions: "Listen to each conversation and lecture and answer the questions. You will hear each recording only once. Conversations have 5 questions each; lectures have 6 questions each.",
    listeningScripts: scripts,
    questions,
  };
}

function buildSpeakingTest(testNum) {
  const numStr = String(testNum).padStart(3,"0");
  const testId = `toefl-speaking-${numStr}`;
  const template = SPEAKING_TESTS[(testNum - 1) % SPEAKING_TESTS.length];

  return {
    id: testId,
    exam: "toefl",
    section: "speaking",
    type: "section",
    title: `TOEFL iBT Speaking Practice Test ${testNum}`,
    variant: "ibt",
    durationSeconds: 1020,
    questionCount: 4,
    instructions: "There are 4 speaking tasks. Task 1 is independent — express your opinion on a given topic. Tasks 2 and 3 are integrated — read a short text and listen to a conversation or lecture, then speak. Task 4 is integrated — listen to a lecture and summarise key points.",
    questions: template.tasks.map(task => ({
      id: `${testId}-q0${task.taskNum}`,
      taskNum: task.taskNum,
      taskType: task.taskType,
      questionType: "speaking_task",
      prompt: task.prompt,
      prepSeconds: task.prepSeconds,
      responseSeconds: task.responseSeconds,
      rubric: task.rubric,
      ...(task.readingTitle ? { readingTitle: task.readingTitle, readingText: task.readingText } : {}),
      ...(task.listeningDescription ? { listeningDescription: task.listeningDescription } : {}),
    })),
  };
}

function buildWritingTest(testNum) {
  const numStr = String(testNum).padStart(3,"0");
  const testId = `toefl-writing-${numStr}`;

  let testData;
  if (testNum <= WRITING_TESTS.length) {
    testData = WRITING_TESTS[testNum - 1];
  } else {
    // Generate from topic pool
    const topicPair = WRITING_EXTRA_TOPICS[(testNum - WRITING_TESTS.length - 1) % WRITING_EXTRA_TOPICS.length];
    testData = generateGenericWritingTest(testNum, topicPair);
  }

  return {
    id: testId,
    exam: "toefl",
    section: "writing",
    type: "section",
    title: testData.title,
    variant: "ibt",
    durationSeconds: 1800,
    questionCount: 2,
    instructions: "There are 2 writing tasks. Task 1 (Integrated Writing): Read a passage for 3 minutes, listen to a lecture, then write a 150-225 word response explaining how the lecture relates to the reading. You have 20 minutes. Task 2 (Academic Discussion): Read a professor's question and two student responses, then write your own contribution of at least 100 words in 10 minutes.",
    questions: [
      {
        id: `${testId}-q01`,
        taskNum: 1,
        taskType: "integrated_writing",
        questionType: "integrated_writing",
        readingTitle: testData.task1.readingTitle,
        readingText: testData.task1.readingText,
        lectureDescription: testData.task1.lectureDescription,
        prompt: testData.task1.prompt,
        modelAnswer: testData.task1.modelAnswer,
        rubric: testData.task1.rubric,
        timeSeconds: testData.task1.timeSeconds,
        targetWords: testData.task1.targetWords,
      },
      {
        id: `${testId}-q02`,
        taskNum: 2,
        taskType: "academic_discussion",
        questionType: "academic_discussion",
        professorName: testData.task2.professorName,
        professorQuestion: testData.task2.professorQuestion,
        student1Name: testData.task2.student1Name,
        student1Response: testData.task2.student1Response,
        student2Name: testData.task2.student2Name,
        student2Response: testData.task2.student2Response,
        prompt: testData.task2.prompt,
        rubric: testData.task2.rubric,
        timeSeconds: testData.task2.timeSeconds,
        targetWords: testData.task2.targetWords,
      },
    ],
  };
}

function generateGenericWritingTest(testNum, topicPair) {
  const [topic, description] = topicPair;
  const professors = ["Dr Kim","Dr Okafor","Dr Martinez","Dr Andersen","Dr Nguyen","Dr Sharma","Dr Fischer","Dr Al-Hassan","Dr Petrova","Dr Chen"];
  const prof = professors[(testNum - 4) % professors.length];
  const s1Names = ["James","Layla","Tom","Mei","Alex","Fatima","Raj","Sophie"];
  const s2Names = ["Amara","Ben","Chloe","Diego","Emma","Felix","Grace","Hassan"];
  const s1 = s1Names[(testNum-4) % s1Names.length];
  const s2 = s2Names[(testNum-4) % s2Names.length];

  return {
    title: `TOEFL iBT Writing Practice Test ${testNum}`,
    task1: {
      readingTitle: `The Case For ${topic}`,
      readingText: `Proponents of ${description} argue that the benefits are substantial and well-supported by evidence. Studies show that when properly implemented, this approach leads to improved outcomes across multiple dimensions — social, economic, and environmental. Experts in the field point to successful examples in various national contexts where clear benefits were observed. Furthermore, technological and administrative improvements have made implementation more feasible than in the past. Critics exist, but the mainstream of research supports a positive assessment.`,
      lectureDescription: `The professor challenges the reading's optimistic view. First, the professor argues that the studies cited are often conducted in ideal conditions that do not reflect real-world implementation challenges. Second, the successful examples cited in the reading are often unrepresentative — they were selected because they succeeded, while failed attempts at the same policy are not mentioned. Third, the professor notes that costs — financial, social, or practical — are systematically underestimated in the literature that supports this position.`,
      prompt: `Summarise the points made in the lecture, being sure to explain how they cast doubt on the specific points made in the reading passage.`,
      modelAnswer: `The reading argues that ${description} produces clear benefits supported by research and real-world examples. The professor challenges this position on three grounds.\n\nFirst, the professor argues that the studies cited in the reading were conducted under conditions that do not reflect real-world complexity, making their findings difficult to generalise. Real implementation faces obstacles the research does not account for.\n\nSecond, the professor questions the representativeness of the successful examples cited in the reading. These cases were selected because they worked well; failed attempts were excluded, creating an overly optimistic picture.\n\nThird, the professor contends that the costs of this approach — whether financial, social, or practical — are systematically underestimated by the literature the reading draws upon.\n\nIn summary, the professor does not deny that there are some benefits, but argues the reading presents an incomplete and overly positive picture that ignores significant limitations and real-world constraints.`,
      rubric: ["task response","coherence and cohesion","lexical resource","grammatical range"],
      timeSeconds: 1200, targetWords: "150-225",
    },
    task2: {
      professorName: prof,
      professorQuestion: `We have been studying ${description} this week. I want you to consider: what do you think are the most important factors that should guide decisions in this area? Are there trade-offs that are difficult to resolve? Share your view and explain your reasoning.`,
      student1Name: s1,
      student1Response: `I think the most important factor is practical effectiveness. It doesn't matter how well-intentioned a policy is if it doesn't actually produce the intended results. We should focus on evidence — what has actually worked in other places — and be willing to change course when evidence shows something isn't working.`,
      student2Name: s2,
      student2Response: `I agree evidence matters, but I think fairness is equally important. Even if a policy is effective on average, we should ask: who benefits and who bears the costs? Policies that produce overall benefits but concentrate disadvantages on specific communities are not truly successful in my view.`,
      prompt: `Write a post responding to the professor's question. Express and support your personal opinion and make a contribution to the discussion in your own words. An effective response will contain at least 100 words.`,
      rubric: ["task response","coherence","lexical resource","grammar"],
      timeSeconds: 600, targetWords: "100+",
    },
  };
}

// ─── Main execution ───────────────────────────────────────────────────────────

const sections = ["reading","listening","speaking","writing"];
const dirs = {};
for (const sec of sections) {
  dirs[sec] = path.join(BASE, "content/toefl", sec);
  fs.mkdirSync(dirs[sec], { recursive: true });
}

console.log("\n═══════════════════════════════════════");
console.log(" TOEFL iBT Full Rebuild — All 4 Sections");
console.log("═══════════════════════════════════════\n");

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

// Ensure toefl section exists in manifest
if (!manifest.exams.toefl) manifest.exams.toefl = { label:"TOEFL iBT", sections:{}, fullMocks:[] };

for (const sec of sections) {
  console.log(`Building TOEFL ${sec.toUpperCase()} (30 tests)...`);
  manifest.exams.toefl.sections[sec] = {};
  let ok = 0;

  for (let n = 1; n <= 30; n++) {
    const numStr = String(n).padStart(3,"0");
    let testObj;

    try {
      if (sec === "reading") {
        const testData = n <= READING_TESTS.length
          ? READING_TESTS[n - 1]
          : makeGenericTest(n, EXTRA_PASSAGE_TOPICS[(n - READING_TESTS.length - 1) % EXTRA_PASSAGE_TOPICS.length]);
        testObj = buildReadingTest(n, testData);
      } else if (sec === "listening") {
        testObj = buildListeningTest(n);
      } else if (sec === "speaking") {
        testObj = buildSpeakingTest(n);
      } else {
        testObj = buildWritingTest(n);
      }

      const filePath = path.join(dirs[sec], `test-${numStr}.json`);
      fs.writeFileSync(filePath, JSON.stringify(testObj, null, 2), "utf8");

      manifest.exams.toefl.sections[sec][n - 1] = {
        id: testObj.id,
        title: testObj.title,
        exam: "toefl",
        section: sec,
        type: "section",
        variant: "ibt",
        durationSeconds: testObj.durationSeconds,
        questionCount: testObj.questionCount,
        file: `toefl/${sec}/test-${numStr}.json`,
        version: 2,
      };
      ok++;
    } catch (e) {
      console.error(`  ERROR test-${numStr}:`, e.message);
    }
    process.stdout.write(".");
  }
  console.log(` ${ok}/30 ✓`);
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
console.log("\nManifest updated.");
console.log("\n── Verification ──────────────────────────────");

// Verify
const r1 = JSON.parse(fs.readFileSync(path.join(dirs.reading, "test-001.json"),"utf8"));
console.log(`Reading test-001: ${r1.questionCount} questions, passage[0]="${r1.passages[0].title}"`);
const l1 = JSON.parse(fs.readFileSync(path.join(dirs.listening,"test-001.json"),"utf8"));
console.log(`Listening test-001: ${l1.questionCount} questions, ${l1.listeningScripts.length} scripts`);
const s1 = JSON.parse(fs.readFileSync(path.join(dirs.speaking,"test-001.json"),"utf8"));
console.log(`Speaking test-001: ${s1.questionCount} tasks, types: ${s1.questions.map(q=>q.taskType).join(", ")}`);
const w1 = JSON.parse(fs.readFileSync(path.join(dirs.writing,"test-001.json"),"utf8"));
console.log(`Writing test-001: ${w1.questionCount} tasks, types: ${w1.questions.map(q=>q.taskType).join(", ")}`);
console.log("\n✅ TOEFL rebuild complete.\n");
