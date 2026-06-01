/**
 * fix-pte-question-counts.js
 *
 * Fixes PTE Academic question counts to match official format:
 *
 * Speaking & Writing (target 34 per test):
 *   read_aloud:            6  (was 3)
 *   repeat_sentence:      10  (was 2)
 *   describe_image:        6  (was 2)
 *   retell_lecture:        3  (was 2)
 *   answer_short_question: 5  (was 2)
 *   summarize_written_text:2  (unchanged)
 *   essay:                 2  (unchanged)
 *
 * Reading (target 15 per test):
 *   reading_writing_fill_blanks: 5  (was 2)
 *   fill_in_blanks:              4  (was 2)
 *   reorder_paragraphs:          2  (unchanged)
 *   multiple_choice_multiple:    2  (was 1)
 *   multiple_choice_single:      2  (was 1)
 *
 * Run: node tools/fix-pte-question-counts.js
 */

const fs   = require("fs");
const path = require("path");

const BASE          = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(BASE, "content/manifest.json");

// ─── Content pools for added questions ───────────────────────────────────────

const READ_ALOUD_TOPICS = [
  "the impact of artificial intelligence on job markets",
  "sustainable urban planning and green infrastructure",
  "the history of maritime trade routes",
  "cognitive benefits of bilingualism",
  "advances in renewable solar energy technology",
  "the role of microbiomes in human health",
  "climate change mitigation strategies",
  "cultural heritage preservation in digital age",
  "the economics of global food production",
  "neuroplasticity and lifelong learning",
  "space exploration and colonisation challenges",
  "biodiversity loss and ecosystem services",
  "the psychology of decision-making",
  "digital privacy and data sovereignty",
  "the evolution of public transport systems",
];

const REPEAT_SENTENCE_TOPICS = [
  "global water scarcity and conservation",
  "the role of social media in modern communication",
  "genetic engineering and ethical considerations",
  "international migration and cultural integration",
  "quantum computing breakthroughs",
  "the economics of automation",
  "childhood nutrition and cognitive development",
  "renewable energy infrastructure investment",
  "machine learning applications in healthcare",
  "urban heat islands and mitigation",
  "the history of ancient astronomical observations",
  "financial literacy and economic inclusion",
  "the impact of noise pollution on wildlife",
  "nanotechnology in materials science",
  "cross-cultural negotiations in business",
  "the science of sleep and memory consolidation",
  "carbon capture and storage technologies",
  "digital literacy in education",
  "wildlife corridor design and conservation",
  "antibiotic resistance and global health policy",
  "the philosophy of consciousness",
  "ocean acidification and marine biodiversity",
  "smart city technology and privacy",
  "the neuroscience of creativity",
  "deforestation and indigenous land rights",
];

const DESCRIBE_IMAGE_TOPICS = [
  "a bar chart comparing renewable energy adoption across five countries",
  "a pie chart showing global water usage by sector",
  "a line graph depicting global average temperature changes from 1900 to 2020",
  "a diagram of the water cycle and evapotranspiration",
  "a map showing deforestation patterns in the Amazon basin",
  "a table comparing literacy rates across regions",
  "a flowchart of the scientific method",
  "a graph showing smartphone adoption over the past decade",
  "a diagram illustrating photosynthesis",
  "a chart comparing energy consumption per capita",
  "a graph showing global population growth projections",
  "a diagram of the carbon cycle",
  "a bar chart of languages by number of native speakers",
  "a pie chart of global CO2 emissions by sector",
  "a line graph of ocean pH levels over time",
];

const RETELL_LECTURE_TOPICS = [
  "a lecture on the discovery of penicillin and its global health impact",
  "a talk about the formation of the universe and dark matter",
  "a lecture discussing the sociology of urban poverty",
  "a presentation on the history of the printing press",
  "a lecture on animal communication and language",
  "a talk on the psychology of motivation and goal-setting",
  "a lecture on the economics of international trade agreements",
  "a presentation on quantum entanglement and its applications",
];

const ASQ_TOPICS = [
  "the chemical symbol for water",
  "the largest planet in our solar system",
  "the process by which plants make food using sunlight",
  "the branch of medicine that deals with the heart",
  "the term for a word that means the opposite of another word",
  "the process of freezing water vapour in the atmosphere that forms snowflakes",
  "the study of ancient human history through excavation of sites",
  "the term for a government where one person holds all the power",
  "the name for the boundary between a country's atmosphere and outer space",
  "the process by which organisms change over generations through natural selection",
  "the type of energy stored in chemical bonds",
  "the term for a triangle with all sides equal",
  "the gas that makes up most of Earth's atmosphere",
  "the study of the structure of the Earth's interior",
  "the term for the movement of people from rural to urban areas",
];

const SWT_TOPICS = [
  "the relationship between economic growth and environmental sustainability",
  "how digital technology is transforming educational practices",
  "the causes and consequences of global urbanisation",
  "the role of diet and exercise in preventing chronic disease",
  "the challenges of managing freshwater resources globally",
];

const ESSAY_TOPICS = [
  "Some people think that economic growth is the most important goal for governments. Others believe that protecting the environment should be prioritised. Discuss both views and give your own opinion.",
  "Advances in technology have made it easier for people to work from home. Do the advantages of remote work outweigh its disadvantages?",
  "Many cities around the world are experiencing rapid population growth. What problems does this create and what solutions can you suggest?",
  "Some people argue that universities should focus only on academic subjects, while others believe practical and vocational skills should also be taught. Discuss both views.",
  "The increasing use of artificial intelligence in daily life raises concerns about privacy and employment. To what extent do you agree or disagree?",
];

// PTE Reading content
const RWFIB_TOPICS = [
  "the mechanisms of climate regulation in temperate forests",
  "the social and economic impacts of globalisation",
  "innovations in medical imaging technology",
  "the history of written language development",
  "the science of materials under extreme conditions",
  "cognitive theories of language acquisition",
  "urban biodiversity and ecological corridors",
  "the economics of healthcare systems",
  "digital transformation in financial services",
  "the psychology of collective decision-making",
];

const FIB_TOPICS = [
  "advances in battery technology for electric vehicles",
  "the cultural significance of oral storytelling traditions",
  "the effects of microplastics on marine ecosystems",
  "the history of scientific measurement standards",
  "the role of gut bacteria in mental health",
  "tectonic plate movement and earthquake prediction",
  "the development of international trade law",
  "carbon sequestration in tropical rainforests",
];

const REORDER_TOPICS = [
  "the steps involved in the water treatment process",
  "the stages of product development in tech companies",
  "how neurons communicate across synapses",
  "the chronological development of democratic governance",
];

const MCM_TOPICS = [
  "Which of the following are mentioned as effects of deforestation on local communities? (Choose TWO answers)",
  "According to the passage, which factors contribute to income inequality? (Choose TWO answers)",
  "Which of the following challenges are identified in the text regarding deep-sea exploration? (Choose TWO answers)",
  "What benefits does the author attribute to multilingual education? (Choose TWO answers)",
];

const MCS_TOPICS = [
  "What is the main purpose of this passage?",
  "According to the author, what is the most significant challenge described?",
  "What can be inferred from the final paragraph?",
  "Which statement best summarises the writer's viewpoint?",
];

// ─── Helper: generate a question ─────────────────────────────────────────────

function uid(testId, n) {
  return `${testId}-q${String(n).padStart(2, "0")}`;
}

function pick(arr, index) {
  return arr[index % arr.length];
}

function generateSWQuestions(testId, existingByType, testIndex) {
  const targets = {
    read_aloud:             6,
    repeat_sentence:       10,
    describe_image:         6,
    retell_lecture:         3,
    answer_short_question:  5,
    summarize_written_text: 2,
    essay:                  2,
  };

  const newQuestions = [];
  let offset = testIndex * 17; // vary content per test

  for (const [type, target] of Object.entries(targets)) {
    const existing = (existingByType[type] || []).length;
    const needed   = Math.max(0, target - existing);

    for (let i = 0; i < needed; i++) {
      const idx    = offset + i;
      const baseQ  = {
        questionType: type,
        correctAnswer: "",
        difficulty: "medium",
        topic: "communication",
      };

      switch (type) {
        case "read_aloud":
          baseQ.prompt = `Read aloud the following passage about ${pick(READ_ALOUD_TOPICS, idx)}. Speak clearly and at a natural pace.`;
          baseQ.rubric = ["content","pronunciation","fluency"];
          break;
        case "repeat_sentence":
          baseQ.prompt = `Listen to the recording and repeat the sentence about ${pick(REPEAT_SENTENCE_TOPICS, idx)} exactly as you hear it.`;
          baseQ.rubric = ["content","pronunciation","fluency"];
          break;
        case "describe_image":
          baseQ.prompt = `Look at the image showing ${pick(DESCRIBE_IMAGE_TOPICS, idx)}. In 40 seconds, describe what the image shows in as much detail as possible.`;
          baseQ.rubric = ["content","pronunciation","fluency"];
          break;
        case "retell_lecture":
          baseQ.prompt = `You will hear ${pick(RETELL_LECTURE_TOPICS, idx)}. After listening, retell what you heard using your own words in 40 seconds.`;
          baseQ.rubric = ["content","pronunciation","fluency"];
          break;
        case "answer_short_question":
          baseQ.prompt = `Answer the short question: What is the common term for ${pick(ASQ_TOPICS, idx)}?`;
          baseQ.correctAnswer = "sample answer";
          baseQ.rubric = ["content","pronunciation","fluency"];
          break;
        case "summarize_written_text":
          baseQ.prompt = `Read the passage about ${pick(SWT_TOPICS, idx)}. Write a one-sentence summary of the passage in 5–75 words within 10 minutes.`;
          baseQ.rubric = ["content","form","fluency","vocabulary"];
          break;
        case "essay":
          baseQ.prompt = pick(ESSAY_TOPICS, idx);
          baseQ.rubric = ["content","form","fluency","vocabulary"];
          break;
      }
      offset++;
      newQuestions.push(baseQ);
    }
    offset += 3;
  }
  return newQuestions;
}

function generateReadingQuestions(testId, existingByType, testIndex) {
  const targets = {
    reading_writing_fill_blanks: 5,
    fill_in_blanks:              4,
    reorder_paragraphs:          2,
    multiple_choice_multiple:    2,
    multiple_choice_single:      2,
  };

  const newQuestions = [];
  let offset = testIndex * 11;

  for (const [type, target] of Object.entries(targets)) {
    const existing = (existingByType[type] || []).length;
    const needed   = Math.max(0, target - existing);

    for (let i = 0; i < needed; i++) {
      const idx  = offset + i;
      const baseQ = {
        questionType: type,
        correctAnswer: "",
        difficulty: "medium",
        topic: "academic",
      };

      switch (type) {
        case "reading_writing_fill_blanks":
          baseQ.prompt = `Read the passage about ${pick(RWFIB_TOPICS, idx)} and select the correct word from the drop-down list to fill each gap. Each blank accepts only one answer.`;
          baseQ.options = ["A. consequently", "B. therefore", "C. however", "D. moreover"];
          baseQ.correctAnswer = "A";
          break;
        case "fill_in_blanks":
          baseQ.prompt = `Read the passage about ${pick(FIB_TOPICS, idx)} and drag the words from the box into the correct gaps in the text.`;
          baseQ.wordBank = ["critical","significant","established","demonstrated","revealed"];
          baseQ.correctAnswer = "refer to passage";
          break;
        case "reorder_paragraphs":
          baseQ.prompt = `The text below about ${pick(REORDER_TOPICS, idx)} has been scrambled. Arrange the sentences in the correct logical order.`;
          baseQ.sentences = [
            "A. The process begins when raw materials are collected from the environment.",
            "B. After transformation, the resulting product undergoes quality testing.",
            "C. Finally, approved products are distributed to end users.",
            "D. Raw materials are then processed using specialised machinery.",
          ];
          baseQ.correctAnswer = "A, D, B, C";
          break;
        case "multiple_choice_multiple":
          baseQ.prompt = pick(MCM_TOPICS, idx);
          baseQ.options = [
            "A. Loss of biodiversity in surrounding areas",
            "B. Disruption of traditional livelihoods",
            "C. Increased rainfall in the region",
            "D. Improved water quality downstream",
            "E. Soil erosion and land degradation",
          ];
          baseQ.correctAnswer = "A, E";
          break;
        case "multiple_choice_single":
          baseQ.prompt = pick(MCS_TOPICS, idx);
          baseQ.options = [
            "A. To argue that current policies are insufficient",
            "B. To describe a problem and propose potential solutions",
            "C. To compare two opposing scientific theories",
            "D. To demonstrate that technological progress is inevitable",
          ];
          baseQ.correctAnswer = "B";
          break;
      }
      offset++;
      newQuestions.push(baseQ);
    }
    offset += 2;
  }
  return newQuestions;
}

// ─── Process a directory of PTE tests ────────────────────────────────────────

function processSection(dir, sectionType, generateFn) {
  const files = fs.readdirSync(dir)
    .filter(f => f.match(/^test-\d+\.json$/))
    .sort();

  console.log(`\nProcessing ${sectionType}: ${files.length} tests`);
  let updated = 0;
  const counts = {};

  files.forEach((file, testIndex) => {
    const filePath = path.join(dir, file);
    const numStr   = file.replace("test-","").replace(".json","");
    let test;
    try { test = JSON.parse(fs.readFileSync(filePath, "utf8")); }
    catch (e) { console.error(`  PARSE ERROR: ${file}`); return; }

    const existingByType = {};
    for (const q of (test.questions || [])) {
      if (!existingByType[q.questionType]) existingByType[q.questionType] = [];
      existingByType[q.questionType].push(q);
    }

    const newQs  = generateFn(test.id || `pte-${sectionType}-${numStr}`, existingByType, testIndex);
    if (newQs.length === 0) { counts[numStr] = test.questions.length; return; }

    // Append and renumber
    let num = (test.questions || []).length + 1;
    for (const q of newQs) {
      q.id = uid(test.id || `pte-${sectionType}-${numStr}`, num++);
    }
    test.questions     = [...(test.questions || []), ...newQs];
    test.questionCount = test.questions.length;

    fs.writeFileSync(filePath, JSON.stringify(test, null, 2), "utf8");
    counts[numStr] = test.questionCount;
    updated++;
    process.stdout.write(".");
  });
  console.log(`\n  Updated: ${updated} files`);
  return counts;
}

// ─── Update manifest ──────────────────────────────────────────────────────────

function updateManifestSection(manifest, exam, section, counts) {
  const entries = manifest.exams[exam]?.sections?.[section];
  if (!entries) { console.warn(`  Manifest section not found: ${exam}/${section}`); return 0; }
  let n = 0;
  for (const key of Object.keys(entries)) {
    const numStr = String(parseInt(key) + 1).padStart(3, "0");
    if (counts[numStr] !== undefined) {
      entries[key].questionCount = counts[numStr];
      n++;
    }
  }
  return n;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

// PTE Speaking & Writing
const swDir    = path.join(BASE, "content/pte/speaking-writing");
const swCounts = processSection(swDir, "speaking-writing", generateSWQuestions);
const swUpdated = updateManifestSection(manifest, "pte", "speaking-writing", swCounts);
console.log(`Manifest: updated ${swUpdated} PTE S+W entries`);

// PTE Reading
const readDir    = path.join(BASE, "content/pte/reading");
const readCounts = processSection(readDir, "reading", generateReadingQuestions);
const readUpdated = updateManifestSection(manifest, "pte", "reading", readCounts);
console.log(`Manifest: updated ${readUpdated} PTE Reading entries`);

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
console.log("\nManifest saved.\n");

// Summary
const sw001 = JSON.parse(fs.readFileSync(path.join(swDir, "test-001.json"), "utf8"));
console.log("PTE S+W test-001 final count:", sw001.questionCount);
const r001  = JSON.parse(fs.readFileSync(path.join(readDir, "test-001.json"), "utf8"));
console.log("PTE Reading test-001 final count:", r001.questionCount);
