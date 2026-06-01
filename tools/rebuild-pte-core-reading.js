"use strict";
const fs=require("fs"), path=require("path");
const OUT_DIR=path.join(__dirname,"../content/pte/reading");

const EXTRA_TOPICS=[
  {title:"Ocean Acidification",theme:"carbon dioxide lowering ocean pH, threatening coral reefs and shellfish"},
  {title:"The Psychology of Decision Making",theme:"heuristics, cognitive biases, dual-process theory, rational thinking"},
  {title:"Biodiversity and Ecosystem Services",theme:"species diversity, pollination, water purification, economic value"},
  {title:"The Gig Economy",theme:"platform work, worker rights, flexibility versus insecurity, algorithmic management"},
  {title:"Space Exploration Commercialisation",theme:"private launch companies, asteroid mining, lunar economies"},
  {title:"Antibiotic Resistance",theme:"overuse of antibiotics, MRSA, antimicrobial stewardship, new drug development"},
  {title:"Digital Privacy and Surveillance",theme:"data collection, GDPR, facial recognition, government surveillance"},
  {title:"The Neuroscience of Creativity",theme:"default mode network, divergent thinking, incubation effects on creativity"},
  {title:"Misinformation and Media Literacy",theme:"fake news, algorithmic amplification, prebunking, fact-checking"},
  {title:"Sustainable Fashion",theme:"fast fashion waste, circular economy, second-hand markets, eco-certification"},
  {title:"Water Scarcity and Management",theme:"aquifer depletion, desalination, virtual water trade, transboundary rivers"},
  {title:"Microplastics in the Environment",theme:"plastic pollution, food chain contamination, marine ecosystem damage"},
  {title:"The Economics of Education",theme:"returns to schooling, credential inflation, vocational training, tuition"},
  {title:"Dark Matter and Dark Energy",theme:"cosmological structure, rotation curves, expansion acceleration, detection"},
  {title:"The Gut Microbiome",theme:"microbiota diversity, gut-brain axis, diet influence, probiotics, disease"},
  {title:"Indigenous Knowledge Systems",theme:"traditional ecological knowledge, intellectual property, land management"},
  {title:"Behavioural Finance",theme:"loss aversion, overconfidence, herding, market anomalies, nudge economics"},
  {title:"Nuclear Energy Renaissance",theme:"small modular reactors, climate arguments, waste disposal, public perception"},
  {title:"The Sharing Economy",theme:"Airbnb, Uber, trust mechanisms, regulatory challenges, community versus profit"},
  {title:"Gene Therapy",theme:"CRISPR, inherited disease, delivery vectors, ethical boundaries, clinical trials"},
  {title:"Smart Cities",theme:"IoT sensors, data-driven governance, citizen privacy, digital equity, resilience"},
  {title:"The Origins of Language",theme:"protolanguage, gestural versus vocal theories, creolisation, grammar"},
  {title:"Food Security in the 21st Century",theme:"population growth, crop yields, food waste, agroecology, protein alternatives"},
  {title:"Mental Health in the Workplace",theme:"burnout, stigma reduction, psychological safety, EAP programmes"},
  {title:"Autonomous Vehicles",theme:"self-driving cars, safety systems, regulatory challenges, ethics of automation"},
  {title:"Quantum Computing",theme:"qubits, superposition, cryptography implications, current hardware limitations"},
  {title:"Coral Reef Restoration",theme:"bleaching events, coral gardening, artificial reefs, climate adaptation"},
  {title:"The Blue Economy",theme:"ocean resources, sustainable fisheries, maritime transport, offshore energy"},
  {title:"Epigenetics",theme:"gene expression, environmental influences, heritable changes, disease implications"},
  {title:"Circular Economy Principles",theme:"waste reduction, product lifecycle, regenerative design, zero waste systems"}
];

function shuffleArray(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function makePassage(title,theme,idx){
  const s=[
    title+" has become one of the most actively debated topics in contemporary scholarship and policy discourse.",
    "Researchers focusing on "+theme.split(",")[0]+" have produced an expanding body of evidence challenging earlier assumptions.",
    "A comprehensive meta-analysis synthesised data from more than eighty independent studies across multiple continents.",
    "The findings consistently indicated that targeted interventions produced measurable improvements in key outcome variables.",
    "Critics argue that methodological limitations, including small sample sizes and publication bias, inflate apparent effect sizes.",
    "Longitudinal research has provided stronger causal evidence than cross-sectional designs could achieve alone.",
    "Policymakers have responded by integrating research findings into national strategies with varying degrees of fidelity.",
    "Emerging economies face distinct challenges when applying frameworks developed in wealthier nations.",
    "Technological innovation is reshaping the landscape, offering new tools and new channels for intervention.",
    "Ethical considerations remain central: questions of consent, equity, and unintended consequences must be addressed."
  ];
  return s.slice(0, 6+(idx%3)).join(" ");
}

for(let n=31;n<=60;n++){
  const et=EXTRA_TOPICS[(n-31)%EXTRA_TOPICS.length];
  const id="pte-reading-"+String(n).padStart(3,"0");
  const p1=makePassage(et.title,et.theme,n);
  const p2=makePassage(et.title,et.theme+" economic and social dimensions",n+3);

  const items=[
    {
      id:id+"-rwfib",
      questionType:"reading_writing_fill_blanks",
      passage:et.title+" is a __1__ field that has attracted growing scholarly attention. Researchers have documented __2__ effects on human wellbeing and environmental __3__. Policy responses have been __4__, reflecting the __5__ nature of the underlying science.",
      blanks:[1,2,3,4,5],
      wordBank:["complex","substantial","outcomes","mixed","evolving","simple","minor","stable","uniform","superficial"],
      correctAnswers:["complex","substantial","outcomes","mixed","evolving"],
      explanation:"The passage requires words describing the complex, substantial, outcome-focused, mixed, and evolving nature of the field."
    },
    {
      id:id+"-fib",
      questionType:"fill_in_blanks",
      passage:"Evidence suggests that "+et.title+" has a __1[significant|negligible|unproven|superficial]__ impact on contemporary society. Early research was __2[hampered|accelerated|simplified|ignored]__ by limited data availability. More recent studies have __3[confirmed|denied|complicated|trivialised]__ key hypotheses. Policymakers face increasing __4[pressure|freedom|immunity|incentive]__ to respond effectively.",
      explanation:"Select the most contextually appropriate word for each blank."
    },
    {
      id:id+"-reorder",
      questionType:"reorder_paragraphs",
      sentences:shuffleArray([
        {id:"A",text:"Initial observations about "+et.title+" were largely anecdotal and lacked systematic documentation."},
        {id:"B",text:"Researchers began collecting structured data after concerns were raised in policy circles."},
        {id:"C",text:"Longitudinal studies eventually provided the robust evidence base needed for confident conclusions."},
        {id:"D",text:"These conclusions were translated into policy recommendations by international bodies."},
        {id:"E",text:"Implementation varied widely between countries depending on institutional capacity and political will."}
      ]),
      correctOrder:["A","B","C","D","E"],
      explanation:"Arrange sentences in logical progression from observation to policy implementation."
    },
    {
      id:id+"-mcqm",
      questionType:"multiple_choice_multiple",
      passage:p1,
      question:"Which TWO statements are directly supported by the passage about "+et.title+"?",
      options:[
        "Research findings have consistently challenged earlier assumptions",
        "Only a single disciplinary approach has proven effective",
        "Longitudinal research provides stronger causal evidence than cross-sectional designs",
        "Economic dimensions have been found to be negligible",
        "Community stakeholders are always excluded from academic research"
      ],
      correctAnswers:[
        "Research findings have consistently challenged earlier assumptions",
        "Longitudinal research provides stronger causal evidence than cross-sectional designs"
      ],
      requiredCount:2,
      explanation:"Both findings are explicitly stated in the passage text."
    },
    {
      id:id+"-mcqs",
      questionType:"multiple_choice_single",
      passage:p2,
      question:"What does the passage suggest about international cooperation regarding "+et.title+"?",
      options:[
        "It has been seamless due to shared economic interests",
        "It has proved difficult due to divergent national interests",
        "It is unnecessary as local solutions are sufficient",
        "It has produced binding global treaties"
      ],
      correctAnswer:"It has proved difficult due to divergent national interests",
      explanation:"The passage states international cooperation has proved difficult to sustain given divergent national interests."
    }
  ];

  const test={
    id,
    exam:"pte",
    section:"reading",
    title:"PTE Core Reading Practice Test "+(n-30),
    durationSeconds:1800,
    questionCount:items.length,
    questions:items
  };
  fs.writeFileSync(path.join(OUT_DIR,"test-"+String(n).padStart(3,"0")+".json"), JSON.stringify(test,null,2));
  console.log("  ✓ test-"+String(n).padStart(3,"0")+".json ("+items.length+" items)");
}
console.log("\nDone. PTE Core reading tests 031-060 rebuilt.");
