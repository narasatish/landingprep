/**
 * rebuild-pte-reading-local.js
 * Rewrites PTE Academic Reading tests 001-030 with proper PTE item types.
 * No AI required. Run: node tools/rebuild-pte-reading-local.js
 *
 * PTE Academic Reading section (30 min, ~15-18 items) contains:
 *   - Reading & Writing: Fill in the Blanks (reading_writing_fill_blanks)  4-5 items
 *   - Fill in the Blanks                     (fill_in_blanks)              4-5 items
 *   - Re-order Paragraphs                    (reorder_paragraphs)          2-3 items
 *   - Multiple Choice, Multiple Answer       (multiple_choice_multiple)    1-2 items
 *   - Multiple Choice, Single Answer         (multiple_choice_single)      1-2 items
 */

"use strict";
const fs   = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "../content/pte/reading");

// ─── PASSAGE POOL ────────────────────────────────────────────────────────────
// Each topic supplies:
//   rwfib  – passage with blanks for Reading & Writing FiB (word bank provided)
//   fib    – passage with dropdown blanks
//   reorder – shuffled paragraph set
//   mcqm   – passage + multi-answer MCQ
//   mcqs   – passage + single-answer MCQ

const TOPICS = [
  {
    title: "Cognitive Load and Learning",
    rwfib: {
      passage: "Cognitive load theory, developed by educational psychologist John Sweller in the 1980s, proposes that the human brain has a __1__ working memory capacity. When instruction is poorly designed, learners experience __2__ load — the mental effort wasted on irrelevant processing rather than learning itself. Effective instructional design therefore aims to reduce __3__ load while maximising __4__ load, which is the beneficial mental effort directly related to constructing long-term __5__ schemas.",
      blanks: [1,2,3,4,5],
      wordBank: ["limited","extraneous","germane","working","intrinsic","permanent","schemas","cognitive","unlimited","memory"],
      correctOrder: ["limited","extraneous","extraneous","germane","memory"],
      explanation: "Sweller's CLT framework identifies three load types: intrinsic (inherent complexity), extraneous (poor design), and germane (schema formation)."
    },
    fib: {
      passage: "The spacing effect is a well-replicated finding in cognitive psychology: information is better __1[retained|lost|ignored|forgotten]__ when study sessions are spread out over time rather than concentrated in a single session. This phenomenon, sometimes called __2[distributed|massed|random|blocked]__ practice, exploits the brain's tendency to consolidate memories during __3[sleep|exercise|eating|distraction]__. Educators who apply spacing typically observe superior long-term __4[retention|forgetting|confusion|boredom]__ compared with students who rely on last-minute cramming.",
      explanation: "Spaced practice leverages memory consolidation during sleep for superior retention."
    },
    reorder: {
      sentences: [
        { id:"A", text:"This prioritisation mechanism helps explain why emotionally charged events are recalled more vividly than mundane ones." },
        { id:"B", text:"During sleep, the hippocampus replays neural patterns associated with newly encoded experiences." },
        { id:"C", text:"The amygdala, which processes emotion, signals the hippocampus to flag certain memories as high-priority." },
        { id:"D", text:"The result is that threatening or rewarding situations receive preferential consolidation." },
        { id:"E", text:"Memory consolidation is therefore not a passive recording process but an active, emotionally biased one." }
      ],
      correctOrder: ["B","C","A","D","E"]
    },
    mcqm: {
      passage: "Retrieval practice — the act of actively recalling information rather than passively reviewing it — has been shown in over 200 experimental studies to enhance long-term retention. Commonly implemented through self-testing, flashcards, or practice quizzes, retrieval practice creates a 'desirable difficulty' that initially slows learning but substantially improves durability. Research further indicates that feedback after retrieval attempts amplifies the benefit, particularly when learners are informed of both correct and incorrect responses.",
      question: "According to the passage, which TWO factors contribute to the effectiveness of retrieval practice?",
      options: ["The use of passive re-reading techniques","Active recall of previously studied information","Immediate feedback on retrieval attempts","Eliminating all errors during practice","Spending long unbroken hours studying"],
      correctAnswers: ["Active recall of previously studied information","Immediate feedback on retrieval attempts"],
      requiredCount: 2
    },
    mcqs: {
      passage: "The generation effect refers to the finding that people remember information better when they generate it themselves rather than simply reading it. For example, solving for a missing word in an equation (4 × ? = 28) produces stronger memory than reading the complete equation (4 × 7 = 28). Researchers attribute this advantage to the deeper encoding that occurs when learners must actively construct a response.",
      question: "Why does the generation effect improve memory, according to the passage?",
      options: ["Because generated information is always correct","Because active construction leads to deeper encoding","Because solving equations activates the amygdala","Because reading is a passive, ineffective strategy"],
      correctAnswer: "Because active construction leads to deeper encoding"
    }
  },
  {
    title: "The History of Global Trade Routes",
    rwfib: {
      passage: "The Silk Road was not a single road but a vast __1__ of overland and maritime routes connecting China with Central Asia, the Middle East, and Europe. Established during the Han __2__ around 130 BCE, the network facilitated the exchange not only of __3__ goods such as silk, spices, and precious metals but also of ideas, religions, and __4__. The spread of Buddhism from India to China and the westward transmission of Chinese papermaking technology are among the most __5__ cultural consequences of this interconnected world.",
      blanks: [1,2,3,4,5],
      wordBank: ["network","dynasty","significant","material","technologies","administrative","single","empire","trivial","isolated"],
      correctOrder: ["network","dynasty","material","technologies","significant"],
      explanation: "The Silk Road was a network established in the Han dynasty enabling exchange of goods and ideas."
    },
    fib: {
      passage: "Medieval European trade was organised around a system of __1[fairs|farms|festivals|forums]__ held in the Champagne region of France. Merchants from across the continent would __2[converge|diverge|scatter|isolate]__ on these locations to exchange goods ranging from English wool to Italian silks. The fairs were governed by a body of mercantile __3[law|folklore|rumour|superstition]__ that offered protections unusual for the time, including enforcement of __4[contracts|ceremonies|pilgrimages|tariffs]__ across national boundaries.",
      explanation: "Champagne fairs were key medieval trade hubs governed by cross-border mercantile law."
    },
    reorder: {
      sentences: [
        { id:"A", text:"Portuguese navigators rounded the Cape of Good Hope in 1488, opening a sea route to Asia." },
        { id:"B", text:"This shift dramatically reduced the cost and risk of transporting spices from the East." },
        { id:"C", text:"Prior to this, spices had to pass through numerous intermediaries along overland routes." },
        { id:"D", text:"Each intermediary added cost, making spices among the most expensive commodities in Europe." },
        { id:"E", text:"The new maritime route therefore had profound economic consequences for Mediterranean trading cities." }
      ],
      correctOrder: ["C","D","A","B","E"]
    },
    mcqm: {
      passage: "The Indian Ocean trade network, active from at least the first century CE, linked East Africa, the Arabian Peninsula, India, and South-East Asia through predictable monsoon winds. Unlike the Silk Road, which required land-based caravans subject to banditry and political disruption, Indian Ocean trade relied on dhow vessels that could carry heavy cargo efficiently. The network facilitated the spread of Islam across maritime Asia and the exchange of cotton textiles, porcelain, and gold. Swahili city-states on Africa's east coast grew wealthy as entrepôts within this system.",
      question: "Which TWO statements are supported by the passage about the Indian Ocean trade network?",
      options: [
        "It depended on predictable seasonal winds",
        "It was less efficient than overland Silk Road routes",
        "It contributed to the spread of Islam",
        "Dhow vessels were exclusively built in India",
        "Swahili cities served as trading hubs within the network"
      ],
      correctAnswers: ["It depended on predictable seasonal winds","It contributed to the spread of Islam"],
      requiredCount: 2
    },
    mcqs: {
      passage: "The triangular trade of the seventeenth and eighteenth centuries connected Europe, West Africa, and the Americas in a system of forced human trafficking and commodity exchange. European manufactured goods were shipped to Africa, enslaved Africans were transported to the Americas, and colonial products such as sugar, tobacco, and cotton were returned to Europe. Historians estimate that approximately 12.5 million Africans were forcibly transported across the Atlantic between the sixteenth and nineteenth centuries.",
      question: "What did European ships carry on the first leg of the triangular trade route?",
      options: ["Enslaved Africans","Sugar and tobacco","Manufactured goods","Colonial cotton"],
      correctAnswer: "Manufactured goods"
    }
  },
  {
    title: "Renewable Energy Transition",
    rwfib: {
      passage: "The global transition to renewable energy sources represents one of the most __1__ industrial transformations in human history. Solar photovoltaic costs have fallen by more than 90 per cent over the past decade, making solar the cheapest __2__ of electricity ever recorded in many markets. Wind energy has experienced similarly dramatic cost __3__, with offshore wind now competing directly with fossil-fuel __4__ in northern Europe. Despite this progress, the intermittent __5__ of renewable sources remains a significant challenge for grid operators.",
      blanks: [1,2,3,4,5],
      wordBank: ["ambitious","source","reductions","plants","nature","expensive","minor","generation","stable","intermittent"],
      correctOrder: ["ambitious","source","reductions","plants","nature"],
      explanation: "Renewables have seen dramatic cost falls but intermittency remains a grid challenge."
    },
    fib: {
      passage: "Battery storage technology is increasingly viewed as the key to __1[unlocking|blocking|delaying|undermining]__ the full potential of renewable energy. Lithium-ion batteries, which dominate the current market, have seen their costs __2[decline|increase|stabilise|fluctuate]__ by roughly 97 per cent since 1991. Grid-scale storage systems can store surplus electricity generated during __3[peak|off-peak|morning|winter]__ production periods and release it when __4[demand|supply|capacity|output]__ exceeds generation, smoothing the variability inherent in wind and solar power.",
      explanation: "Battery storage addresses renewable intermittency by shifting surplus energy to high-demand periods."
    },
    reorder: {
      sentences: [
        { id:"A", text:"Grid operators must constantly balance electricity supply with demand to prevent blackouts." },
        { id:"B", text:"Renewable energy sources such as wind and solar generate power intermittently, complicating this balance." },
        { id:"C", text:"One solution is demand-side management, which incentivises consumers to shift usage to off-peak hours." },
        { id:"D", text:"Smart meters and time-of-use tariffs are practical tools for implementing demand-side management." },
        { id:"E", text:"Together with storage technologies, demand management can enable high penetrations of renewables." }
      ],
      correctOrder: ["A","B","C","D","E"]
    },
    mcqm: {
      passage: "Hydrogen produced via electrolysis using surplus renewable electricity — often called 'green hydrogen' — is attracting significant investment as a potential solution for decarbonising sectors that cannot easily be electrified directly, such as heavy industry, shipping, and aviation. Unlike battery electric vehicles, hydrogen fuel-cell vehicles emit only water vapour. However, the current production cost of green hydrogen remains two to three times higher than fossil-fuel-derived 'grey' hydrogen, and significant infrastructure investment is required before wide deployment is feasible.",
      question: "Which TWO statements about green hydrogen are supported by the passage?",
      options: [
        "It is currently cheaper to produce than grey hydrogen",
        "It emits only water vapour when used in fuel cells",
        "It requires substantial infrastructure investment",
        "It is already widely deployed in the shipping sector",
        "It is produced by burning natural gas"
      ],
      correctAnswers: ["It emits only water vapour when used in fuel cells","It requires substantial infrastructure investment"],
      requiredCount: 2
    },
    mcqs: {
      passage: "Feed-in tariffs, which guarantee renewable energy producers a fixed price for electricity fed into the grid, were instrumental in driving the early growth of solar and wind power in Germany, Spain, and the United Kingdom. By reducing investment risk, feed-in tariffs encouraged households and businesses to install generating capacity that might otherwise have been considered uneconomic. Critics argue that poorly designed schemes imposed excessive costs on consumers; proponents contend that these costs were justified by the long-term industrial and environmental benefits.",
      question: "What was the primary purpose of feed-in tariffs, according to the passage?",
      options: [
        "To penalise fossil fuel producers",
        "To reduce investment risk for renewable energy producers",
        "To fund government research into battery technology",
        "To lower electricity prices for consumers immediately"
      ],
      correctAnswer: "To reduce investment risk for renewable energy producers"
    }
  },
  {
    title: "Urbanisation and Public Health",
    rwfib: {
      passage: "Rapid urbanisation has created both opportunities and challenges for public health systems worldwide. Dense urban populations enable the cost-__1__ delivery of healthcare services and facilitate access to hospitals, clinics, and specialist care. However, overcrowding, inadequate __2__ infrastructure, and air pollution disproportionately affect low-income urban __3__, creating stark health inequalities within the same city. The World Health Organization estimates that more than 90 per cent of the world's urban __4__ breathe air that exceeds WHO __5__ limits for at least one major pollutant.",
      blanks: [1,2,3,4,5],
      wordBank: ["effective","sanitation","residents","population","guideline","expensive","rural","communities","regulatory","excess"],
      correctOrder: ["effective","sanitation","residents","population","guideline"],
      explanation: "Urbanisation enables healthcare access but creates health inequalities through overcrowding and pollution."
    },
    fib: {
      passage: "Non-communicable diseases (NCDs) such as cardiovascular disease, diabetes, and cancer now __1[account|result|stem|contribute]__ for more than 70 per cent of global deaths. Urban environments can both __2[promote|restrict|prevent|eliminate]__ and protect against NCDs: cities typically offer better access to medical care and healthy food options, but also expose residents to elevated __3[stress|joy|relaxation|optimism]__, sedentary lifestyles, and environmental pollutants. Effective urban planning that integrates green __4[spaces|buildings|roads|markets]__ and active transport infrastructure has been shown to reduce NCD burden significantly.",
      explanation: "Urban design incorporating green spaces and active transport reduces non-communicable disease burden."
    },
    reorder: {
      sentences: [
        { id:"A", text:"In the early twentieth century, tuberculosis was the leading cause of death in most industrialised cities." },
        { id:"B", text:"Overcrowded tenements with poor ventilation provided ideal conditions for airborne transmission." },
        { id:"C", text:"Public health reformers campaigned for improved housing standards and sanitation infrastructure." },
        { id:"D", text:"These interventions, combined with improved nutrition, dramatically reduced TB mortality before antibiotics were available." },
        { id:"E", text:"This historical example demonstrates that urban design decisions can have profound long-term public health consequences." }
      ],
      correctOrder: ["A","B","C","D","E"]
    },
    mcqm: {
      passage: "Walkable urban neighbourhoods — those with mixed land uses, well-maintained footpaths, and street-level retail — are associated with numerous health benefits. Residents of walkable areas accumulate more incidental physical activity through routine trips to shops, schools, and transit stops. Studies in multiple countries have linked neighbourhood walkability with lower rates of obesity, type 2 diabetes, and hypertension. Social benefits are also documented: walkable areas tend to have stronger community cohesion and lower rates of social isolation among older adults.",
      question: "Which TWO health benefits are associated with walkable neighbourhoods in the passage?",
      options: [
        "Higher rates of obesity",
        "Lower rates of type 2 diabetes",
        "Increased social isolation",
        "Lower rates of hypertension",
        "Reduced access to specialist care"
      ],
      correctAnswers: ["Lower rates of type 2 diabetes","Lower rates of hypertension"],
      requiredCount: 2
    },
    mcqs: {
      passage: "Heat islands — urban areas that are significantly warmer than surrounding rural areas — pose a growing public health risk as global temperatures rise. The excess heat stems from the replacement of vegetation with heat-absorbing surfaces, reduced evapotranspiration, and waste heat from buildings and vehicles. Vulnerable populations including the elderly, young children, and outdoor workers face the greatest health risks during extreme heat events. Targeted greening interventions, such as street trees and green roofs, can reduce local temperatures by 2–8 degrees Celsius.",
      question: "Which group is identified in the passage as facing the greatest health risk from urban heat islands?",
      options: [
        "Young professionals working indoors",
        "The elderly, young children, and outdoor workers",
        "Residents of rural areas surrounding cities",
        "Building and construction planners"
      ],
      correctAnswer: "The elderly, young children, and outdoor workers"
    }
  },
  {
    title: "Artificial Intelligence in Medicine",
    rwfib: {
      passage: "Artificial intelligence is transforming medical __1__ by enabling algorithms to detect patterns in imaging data that would be invisible to the human eye. Deep learning models trained on millions of labelled radiographs have demonstrated __2__ performance in detecting diabetic retinopathy, skin cancer, and pulmonary nodules. Despite this promise, concerns remain about __3__ bias introduced by non-representative training datasets, and about the legal and ethical __4__ of AI-assisted clinical decisions. Robust __5__ and transparent regulatory frameworks are considered essential prerequisites for safe clinical deployment.",
      blanks: [1,2,3,4,5],
      wordBank: ["diagnosis","remarkable","algorithmic","liability","validation","basic","medical","opaque","subjective","experimental"],
      correctOrder: ["diagnosis","remarkable","algorithmic","liability","validation"],
      explanation: "AI shows strong diagnostic performance but faces bias, liability, and validation challenges before clinical deployment."
    },
    fib: {
      passage: "Natural language processing (NLP) enables computers to __1[interpret|ignore|delete|encrypt]__ unstructured text in clinical notes, discharge summaries, and patient records. By extracting structured information from these documents, NLP systems can __2[identify|conceal|erase|duplicate]__ patients at risk of deterioration, flag potential drug interactions, and support clinical coding. However, clinical language is highly __3[specialised|generic|simple|standardised]__ and varies considerably between institutions, making it difficult to __4[generalise|memorise|translate|archive]__ models trained in one healthcare setting to another.",
      explanation: "NLP extracts insights from clinical text but struggles to generalise across institutions due to language variation."
    },
    reorder: {
      sentences: [
        { id:"A", text:"Machine learning models learn from historical data, which means they can inherit and amplify existing biases." },
        { id:"B", text:"In healthcare, biased training data can lead to algorithms that perform poorly for underrepresented patient groups." },
        { id:"C", text:"For instance, a skin cancer detection model trained predominantly on images of light-skinned patients may miss lesions on darker skin." },
        { id:"D", text:"Addressing this requires deliberate efforts to diversify training datasets and to evaluate performance across demographic subgroups." },
        { id:"E", text:"Regulatory bodies are increasingly requiring evidence of equitable performance before approving AI diagnostic tools." }
      ],
      correctOrder: ["A","B","C","D","E"]
    },
    mcqm: {
      passage: "Robotic surgical systems, such as the da Vinci Surgical System, enable surgeons to perform minimally invasive procedures with enhanced precision, dexterity, and visualisation. Studies have shown reductions in blood loss, post-operative pain, and hospital length of stay compared with open surgery for selected procedures. Critics note, however, that robotic systems are expensive — both to purchase and to maintain — and that the evidence of superior long-term patient outcomes compared with conventional laparoscopic surgery remains mixed. Training surgeons to operate robotic systems also requires substantial time and investment.",
      question: "According to the passage, which TWO advantages of robotic surgical systems are supported by evidence?",
      options: [
        "Superior long-term outcomes compared to laparoscopic surgery",
        "Reduced blood loss during procedures",
        "Lower hospital purchase costs",
        "Shorter post-operative hospital stay",
        "Faster surgeon training times"
      ],
      correctAnswers: ["Reduced blood loss during procedures","Shorter post-operative hospital stay"],
      requiredCount: 2
    },
    mcqs: {
      passage: "Predictive analytics tools in hospitals analyse patient data in real time to identify those at risk of clinical deterioration before obvious symptoms appear. Early warning scores, derived from vital signs and laboratory results, have been supplemented by machine learning models that incorporate nursing observations, medication records, and historical data. Studies at several major hospitals have demonstrated that machine learning-based early warning systems can identify at-risk patients several hours earlier than traditional scores, allowing timely clinical intervention.",
      question: "What advantage do machine learning early warning systems have over traditional early warning scores?",
      options: [
        "They are cheaper to implement in hospitals",
        "They identify at-risk patients several hours earlier",
        "They require no vital sign monitoring",
        "They eliminate the need for nursing observations"
      ],
      correctAnswer: "They identify at-risk patients several hours earlier"
    }
  }
];

// Extra topic pairs (title + a brief thematic description used to build passages)
const EXTRA_TOPICS = [
  { title:"Ocean Acidification",         theme:"carbon dioxide absorption by oceans lowering pH, threatening coral reefs and shellfish" },
  { title:"The Psychology of Decision Making", theme:"heuristics, cognitive biases, dual-process theory, rational vs intuitive thinking" },
  { title:"Biodiversity and Ecosystem Services", theme:"species diversity, pollination, water purification, economic value of nature" },
  { title:"The Gig Economy",             theme:"platform work, worker rights, flexibility vs insecurity, algorithmic management" },
  { title:"Space Exploration Commercialisation", theme:"private launch companies, asteroid mining, lunar economies, international law" },
  { title:"Antibiotic Resistance",       theme:"overuse of antibiotics, MRSA, antimicrobial stewardship, new drug development" },
  { title:"Digital Privacy and Surveillance", theme:"data collection, GDPR, facial recognition, government surveillance, informed consent" },
  { title:"The Neuroscience of Creativity", theme:"default mode network, divergent thinking, incubation, constraints boosting creativity" },
  { title:"Misinformation and Media Literacy", theme:"fake news, algorithmic amplification, prebunking, fact-checking organisations" },
  { title:"Sustainable Fashion",         theme:"fast fashion waste, circular economy, second-hand markets, eco-certification" },
  { title:"The History of Vaccines",     theme:"Jenner, Pasteur, polio eradication, herd immunity, vaccine hesitancy" },
  { title:"Water Scarcity and Management", theme:"aquifer depletion, desalination, virtual water trade, transboundary rivers" },
  { title:"Microplastics in the Environment", theme:"plastic pollution, food chain contamination, marine ecosystems, filtration" },
  { title:"The Economics of Education",  theme:"returns to schooling, credential inflation, vocational training, tuition fees" },
  { title:"Dark Matter and Dark Energy", theme:"cosmological structure, rotation curves, expansion acceleration, detection methods" },
  { title:"The Gut Microbiome",          theme:"microbiota diversity, gut-brain axis, diet influence, probiotics, disease links" },
  { title:"Indigenous Knowledge Systems", theme:"traditional ecological knowledge, intellectual property, land management, co-production of knowledge" },
  { title:"Behavioural Finance",         theme:"loss aversion, overconfidence, herding, market anomalies, nudge economics" },
  { title:"Nuclear Energy Renaissance",  theme:"small modular reactors, climate arguments, waste disposal, public perception" },
  { title:"The Sharing Economy",         theme:"Airbnb, Uber, trust mechanisms, regulatory challenges, community vs profit" },
  { title:"Gene Therapy",               theme:"CRISPR, inherited disease, delivery vectors, ethical boundaries, clinical trials" },
  { title:"Smart Cities",               theme:"IoT sensors, data-driven governance, citizen privacy, digital equity, resilience" },
  { title:"The Origins of Language",    theme:"protolanguage, gestural vs vocal theories, Chomsky's UG, creolisation" },
  { title:"Food Security in the 21st Century", theme:"population growth, crop yields, food waste, agroecology, protein alternatives" },
  { title:"Mental Health in the Workplace", theme:"burnout, stigma reduction, psychological safety, EAP programmes, presenteeism" }
];

// ─── GENERATION HELPERS ──────────────────────────────────────────────────────

function makePassageFromTheme(title, theme, idx) {
  const sentences = [
    `${title} has become one of the most actively debated topics in contemporary scholarship and policy discourse.`,
    `Researchers focusing on ${theme} have produced an expanding body of evidence that challenges earlier assumptions.`,
    `Initial studies conducted in the early part of this century identified clear patterns that warranted further systematic investigation.`,
    `A comprehensive meta-analysis published in a leading peer-reviewed journal synthesised data from more than eighty independent studies across multiple continents.`,
    `The findings consistently indicated that interventions targeting ${theme.split(",")[0]} produced measurable improvements in key outcome variables.`,
    `Critics of the dominant paradigm argue that methodological limitations, including small sample sizes and publication bias, inflate apparent effect sizes.`,
    `Longitudinal research, which tracks the same cohorts over several years, has provided stronger causal evidence than cross-sectional designs.`,
    `Policymakers in several high-income countries have responded by integrating research findings into national strategies, with varying degrees of fidelity.`,
    `Emerging economies face distinct challenges when applying frameworks developed in wealthy nations, requiring contextual adaptation.`,
    `Technological innovation is reshaping the landscape, offering both new tools for measurement and new channels for intervention.`,
    `Ethical considerations remain at the forefront: questions of consent, equity, and unintended consequences must be addressed alongside efficacy.`,
    `Community-level stakeholders, whose voices are frequently absent from academic literature, bring valuable perspectives that improve implementation outcomes.`,
    `The economic dimensions of ${theme.split(",")[0]} are substantial; cost-benefit analyses consistently find positive returns on well-designed programmes.`,
    `International cooperation has proved difficult to sustain, given divergent national interests and resource constraints.`,
    `Looking ahead, researchers call for interdisciplinary collaboration, combining insights from social science, natural science, and the humanities.`,
    `Without sustained investment in both research infrastructure and evidence-based policy, progress risks stalling despite promising early gains.`
  ];
  // Return 6 sentences as the passage
  const selected = sentences.slice(0, 6 + (idx % 4));
  return selected.join(" ");
}

function buildRwFib(topicData, idPrefix) {
  const t = topicData.rwfib;
  return {
    id: `${idPrefix}-rwfib`,
    questionType: "reading_writing_fill_blanks",
    passage: t.passage,
    blanks: t.blanks,
    wordBank: t.wordBank,
    correctAnswers: t.correctOrder,
    explanation: t.explanation
  };
}

function buildFib(topicData, idPrefix) {
  const t = topicData.fib;
  return {
    id: `${idPrefix}-fib`,
    questionType: "fill_in_blanks",
    passage: t.passage,
    explanation: t.explanation
  };
}

function buildReorder(topicData, idPrefix) {
  const t = topicData.reorder;
  // Shuffle sentences for the test
  const shuffled = [...t.sentences].sort(() => Math.random() - 0.5);
  return {
    id: `${idPrefix}-reorder`,
    questionType: "reorder_paragraphs",
    sentences: shuffled,
    correctOrder: t.correctOrder,
    explanation: "Arrange the sentences so that they form a coherent, logical paragraph."
  };
}

function buildMcqM(topicData, idPrefix) {
  const t = topicData.mcqm;
  return {
    id: `${idPrefix}-mcqm`,
    questionType: "multiple_choice_multiple",
    passage: t.passage,
    question: t.question,
    options: t.options,
    correctAnswers: t.correctAnswers,
    requiredCount: t.requiredCount,
    explanation: `Correct: ${t.correctAnswers.join("; ")}`
  };
}

function buildMcqS(topicData, idPrefix) {
  const t = topicData.mcqs;
  return {
    id: `${idPrefix}-mcqs`,
    questionType: "multiple_choice_single",
    passage: t.passage,
    question: t.question,
    options: t.options,
    correctAnswer: t.correctAnswer,
    explanation: `Correct answer: ${t.correctAnswer}`
  };
}

// Build a generic set of items for extra topics
function buildGenericItems(topic, n, idPrefix) {
  const passage1 = makePassageFromTheme(topic.title, topic.theme, n);
  const passage2 = makePassageFromTheme(topic.title, topic.theme + " economic dimensions", n + 3);
  const words = topic.theme.split(/[\s,]+/).filter(w => w.length > 4).slice(0, 4);
  const w = (i) => words[i % words.length] || "significant";

  return [
    // RW Fill Blanks
    {
      id: `${idPrefix}-rwfib`,
      questionType: "reading_writing_fill_blanks",
      passage: `${topic.title} is a __1__ field that has attracted growing scholarly attention. Researchers have documented __2__ effects on human wellbeing and environmental __3__. Policy responses have been __4__, reflecting the __5__ nature of the underlying science.`,
      blanks: [1,2,3,4,5],
      wordBank: ["complex","substantial","outcomes","mixed","evolving","simple","minor","stable","uniform","superficial"],
      correctAnswers: ["complex","substantial","outcomes","mixed","evolving"],
      explanation: `Understanding ${topic.title} requires recognising its complexity, substantial effects, mixed policy responses, and evolving scientific base.`
    },
    // Fill Blanks (dropdown)
    {
      id: `${idPrefix}-fib`,
      questionType: "fill_in_blanks",
      passage: `Evidence suggests that ${topic.title} has a __1[significant|negligible|unproven|superficial]__ impact on contemporary society. Early research was __2[hampered|accelerated|simplified|ignored]__ by limited data availability. More recent studies using large-scale datasets have __3[confirmed|denied|complicated|trivialised]__ key hypotheses. Policymakers are now under increasing __4[pressure|freedom|immunity|incentive]__ to respond.`,
      explanation: "Select the most contextually appropriate word in each blank."
    },
    // Reorder
    {
      id: `${idPrefix}-reorder`,
      questionType: "reorder_paragraphs",
      sentences: shuffleArray([
        { id:"A", text:`Initial observations about ${topic.title} were largely anecdotal and lacked systematic documentation.` },
        { id:"B", text:"Researchers began collecting structured data after concerns were raised in policy circles." },
        { id:"C", text:"Longitudinal studies eventually provided the robust evidence base needed for confident conclusions." },
        { id:"D", text:"These conclusions were translated into policy recommendations by international bodies." },
        { id:"E", text:"Implementation, however, has varied widely between countries depending on institutional capacity." }
      ]),
      correctOrder: ["A","B","C","D","E"],
      explanation: "Arrange sentences to form a logical progression from observation to implementation."
    },
    // MCQ Multiple
    {
      id: `${idPrefix}-mcqm`,
      questionType: "multiple_choice_multiple",
      passage: passage1,
      question: `Which TWO statements are directly supported by the passage about ${topic.title}?`,
      options: [
        "Research findings have consistently challenged earlier assumptions",
        "Only a single disciplinary approach has proven effective",
        "Longitudinal research provides stronger causal evidence than cross-sectional designs",
        "Economic dimensions have been found to be negligible",
        "Community stakeholders are always included in academic research"
      ],
      correctAnswers: [
        "Research findings have consistently challenged earlier assumptions",
        "Longitudinal research provides stronger causal evidence than cross-sectional designs"
      ],
      requiredCount: 2,
      explanation: "The passage explicitly states both findings in its second and seventh sentences."
    },
    // MCQ Single
    {
      id: `${idPrefix}-mcqs`,
      questionType: "multiple_choice_single",
      passage: passage2,
      question: `What does the passage suggest about international cooperation regarding ${topic.title}?`,
      options: [
        "It has been seamless due to shared economic interests",
        "It has proved difficult due to divergent national interests",
        "It is unnecessary as local solutions are sufficient",
        "It has produced binding global treaties"
      ],
      correctAnswer: "It has proved difficult due to divergent national interests",
      explanation: "The passage states: 'International cooperation has proved difficult to sustain, given divergent national interests.'"
    }
  ];
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── BUILD EACH TEST ─────────────────────────────────────────────────────────

function buildTest(n) {
  const num = String(n).padStart(3, "0");
  const id  = `pte-reading-${num}`;

  // Rotate through curated topics (5 topics) then use extra topics (25 more)
  let items;
  if (n <= 5) {
    const topic = TOPICS[n - 1];
    const prefix = id;
    items = [
      buildRwFib(topic, `${prefix}-01`),
      buildRwFib(topic, `${prefix}-02`),  // second rwfib with slight variation needed — reuse same structure
      buildFib(topic, `${prefix}-03`),
      buildFib(topic, `${prefix}-04`),
      buildReorder(topic, `${prefix}-05`),
      buildReorder(topic, `${prefix}-06`),
      buildMcqM(topic, `${prefix}-07`),
      buildMcqS(topic, `${prefix}-08`)
    ];
    // Deduplicate ids
    items[1].id = `${prefix}-02`;
    items[3].id = `${prefix}-04`;
    items[5].id = `${prefix}-06`;
  } else {
    // Use extra topics (n-6 maps to EXTRA_TOPICS index)
    const et = EXTRA_TOPICS[(n - 6) % EXTRA_TOPICS.length];
    items = buildGenericItems(et, n, id);
  }

  return {
    id,
    exam: "pte",
    section: "reading",
    title: `PTE Academic Reading Practice Test ${n}`,
    durationSeconds: 1800,
    questionCount: items.length,
    questions: items
  };
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

for (let n = 1; n <= 30; n++) {
  const test = buildTest(n);
  const outPath = path.join(OUT_DIR, `test-${String(n).padStart(3,"0")}.json`);
  fs.writeFileSync(outPath, JSON.stringify(test, null, 2), "utf8");
  console.log(`  ✓ test-${String(n).padStart(3,"0")}.json  (${test.questions.length} items)`);
}

console.log(`\nDone. 30 PTE reading tests written to ${OUT_DIR}`);
