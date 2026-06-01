#!/usr/bin/env node
// tools/rebuild-ielts-reading.js
// Rebuilds IELTS Academic Reading tests 001–030 with:
//   • 3 long passages (900–1200 words each, distinct topics)
//   • 40 questions total (≥13 per passage) covering all IELTS question types
//   • Proper explanations and answer keys
//
// Requires server.js running: node server.js
//
// Usage:
//   node tools/rebuild-ielts-reading.js [--from 1] [--to 30] [--force]
"use strict";

const fs   = require("fs");
const path = require("path");
const http = require("http");

const ROOT      = path.resolve(__dirname, "..");
const CONTENT   = path.join(ROOT, "content");
const MANIFEST  = path.join(CONTENT, "manifest.json");
const BACKUP    = path.join(ROOT, ".backup", "ielts-reading");
const TRACKER   = path.join(ROOT, ".rebuild-reading-tracker.json");
const SERVER    = "http://localhost:3001";

// ── CLI args ─────────────────────────────────────────────────────────────────
const args  = process.argv.slice(2);
const FROM  = parseInt(args[args.indexOf("--from") + 1] || "1",  10);
const TO    = parseInt(args[args.indexOf("--to")   + 1] || "30", 10);
const FORCE = args.includes("--force");
const GT    = args.includes("--gt"); // rebuild General Training (031–060) instead

// ── Helpers ──────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(3, "0"); }

function loadTracker() {
  try { return JSON.parse(fs.readFileSync(TRACKER, "utf8")); } catch { return {}; }
}
function saveTracker(t) { fs.writeFileSync(TRACKER, JSON.stringify(t, null, 2)); }

function backupFile(filePath) {
  fs.mkdirSync(BACKUP, { recursive: true });
  const rel  = path.relative(path.join(CONTENT, "ielts", "reading"), filePath);
  const dest = path.join(BACKUP, rel);
  if (fs.existsSync(filePath)) fs.copyFileSync(filePath, dest);
}

// ── POST to server.js /api/ai-tutor/generate ─────────────────────────────────
function postGenerate(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      context:  { mode: "rebuild" },
    });
    const options = {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };
    const url  = new URL(`${SERVER}/api/ai-tutor/generate`);
    const req  = http.request(url, options, (res) => {
      let raw = "";
      res.on("data", d => (raw += d));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(raw);
          resolve(parsed.answer || parsed.text || raw);
        } catch {
          resolve(raw);
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(120_000, () => { req.destroy(); reject(new Error("timeout")); });
    req.write(body);
    req.end();
  });
}

// ── Extract JSON from LLM response ───────────────────────────────────────────
function extractJSON(text) {
  // Try ```json ... ``` block first
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return JSON.parse(fenced[1].trim());
  // Try raw { ... }
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) return JSON.parse(text.slice(start, end + 1));
  throw new Error("No JSON found in response");
}

// ── ACADEMIC READING prompt ───────────────────────────────────────────────────
function buildAcademicPrompt(testNum) {
  const topics = ACADEMIC_TOPICS[(testNum - 1) % ACADEMIC_TOPICS.length];
  return `You are generating an IELTS Academic Reading practice test. Test number: ${testNum}.

Generate a complete IELTS Academic Reading test with EXACTLY this JSON structure:

{
  "passages": [
    {
      "title": "...",
      "content": "...",
      "wordCount": <number>
    },
    { ... },
    { ... }
  ],
  "questions": [
    {
      "passageIndex": 0,
      "questionType": "matching_headings",
      "instructions": "...",
      "prompt": "...",
      "options": [...],
      "correctAnswer": "...",
      "explanation": "..."
    },
    ...
  ]
}

REQUIREMENTS:

PASSAGES (3 total):
- Topics: "${topics[0]}", "${topics[1]}", "${topics[2]}"
- Each passage: 900–1100 words of UNIQUE, substantive academic content
- Each passage must have 6–8 clearly separated paragraphs labeled A, B, C, D, E, F (and G, H if needed)
- Content must be academically rigorous — research findings, historical context, expert debate, data, implications
- Do NOT use filler sentences. Each sentence must add real information.

QUESTIONS (40 total, distributed across passages):
- Passage 1 (passageIndex: 0): 13–14 questions
- Passage 2 (passageIndex: 1): 13–14 questions
- Passage 3 (passageIndex: 2): 13–14 questions

REQUIRED question types (include ALL of these across the 40 questions):
1. matching_headings — match paragraph letters to headings (list: ["i. ...", "ii. ...", etc.], answer: "i")
2. true_false_not_given — options: ["True", "False", "Not Given"]
3. yes_no_not_given — options: ["Yes", "No", "Not Given"]
4. sentence_completion — fill in the blank (answer: the missing word/phrase, max 3 words)
5. summary_completion — choose from a box of words (provide options list of 8–10 words)
6. multiple_choice — 4 options (A, B, C, D format in options array)
7. matching_features — match statements to people/theories mentioned in passage
8. table_completion — fill cells (treat like sentence_completion)
9. short_answer — answer question in max 3 words from passage

Distribution suggestion per passage:
- Passage 1: 5 matching_headings + 5 true_false_not_given + 3 sentence_completion
- Passage 2: 5 yes_no_not_given + 4 multiple_choice + 4 sentence_completion
- Passage 3: 5 matching_features + 3 summary_completion + 3 table_completion + 2 short_answer

CRITICAL RULES:
- Every answer must be directly verifiable in the passage content you write
- Explanations must quote or paraphrase the relevant passage sentence
- matching_headings options must have MORE headings than paragraphs (add 2–3 distractors)
- sentence_completion prompts must have a clear blank ("The main _____ of the research was...")
- summary_completion options must include the correct word plus plausible distractors
- Do NOT include any question about a fact not mentioned in your passages
- All 40 questions must be in the "questions" array

Return ONLY the JSON object. No explanation before or after.`;
}

// ── GENERAL TRAINING READING prompt ──────────────────────────────────────────
function buildGTPrompt(testNum) {
  const topics = GT_TOPICS[(testNum - 31) % GT_TOPICS.length];
  return `You are generating an IELTS General Training Reading practice test. Test number: ${testNum}.

Generate a complete IELTS General Training Reading test with EXACTLY this JSON structure:

{
  "passages": [
    {
      "title": "...",
      "content": "...",
      "wordCount": <number>
    },
    {
      "title": "...",
      "content": "...",
      "wordCount": <number>
    },
    {
      "title": "...",
      "content": "...",
      "wordCount": <number>
    }
  ],
  "questions": [ ... 40 questions ... ]
}

GENERAL TRAINING STRUCTURE:
- Section 1 (passageIndex 0): Two short everyday texts combined (notices, ads, timetables, signs) — 300–400 words total
- Section 2 (passageIndex 1): Workplace/social context — employee handbook, training info, health & safety — 450–600 words
- Section 3 (passageIndex 2): Longer text on topic of general interest — 700–900 words, 6–7 paragraphs A–G

TOPICS: "${topics[0]}" / "${topics[1]}" / "${topics[2]}"

QUESTIONS (40 total):
- Section 1 (passageIndex 0): 14 questions — mostly matching, true/false/not given, sentence completion
- Section 2 (passageIndex 1): 13 questions — yes/no/not given, multiple choice, summary completion
- Section 3 (passageIndex 2): 13 questions — matching headings, matching features, sentence completion, short answer

REQUIRED question types (same as Academic — all must appear):
matching_headings, true_false_not_given, yes_no_not_given, sentence_completion, summary_completion, multiple_choice, matching_features, table_completion, short_answer

CRITICAL RULES:
- Every answer verifiable in your passage
- Explanations quote or paraphrase the relevant sentence
- summary_completion: provide 8–10 word options including the correct one
- matching_headings: more headings than paragraphs (add 2–3 distractors)

Return ONLY the JSON object. No text before or after.`;
}

// ── Topic pools ───────────────────────────────────────────────────────────────
const ACADEMIC_TOPICS = [
  ["The History of Writing Systems", "Marine Bioluminescence", "Urban Heat Islands and Climate Adaptation"],
  ["The Domestication of Animals", "Neuroplasticity and Learning", "Renewable Energy Storage Technologies"],
  ["The Silk Road Trade Network", "Coral Reef Ecosystems Under Threat", "Behavioural Economics and Decision Making"],
  ["The Development of Vaccines", "Deep-Sea Hydrothermal Vents", "Language Acquisition in Early Childhood"],
  ["Ancient Agricultural Innovations", "The Psychology of Colour Perception", "Sustainable Architecture and Green Buildings"],
  ["The Origins of the Internet", "Migratory Patterns of Birds", "Social Consequences of Urbanisation"],
  ["The Evolution of Money", "Permafrost and Arctic Climate Change", "Artificial Intelligence in Medical Diagnosis"],
  ["The History of the Olympic Games", "Mangrove Forests and Coastal Protection", "Cognitive Biases in Human Judgement"],
  ["The Industrial Revolution", "Extremophiles in Hostile Environments", "The Global Plastic Pollution Crisis"],
  ["The Discovery of Antibiotics", "Plate Tectonics and Earthquake Prediction", "The Psychology of Sleep and Memory"],
  ["Medieval Trade Guilds", "Bioluminescent Fungi", "Digital Privacy in the Modern Age"],
  ["The Development of Navigation", "The Amazon Rainforest Ecosystem", "Emotional Intelligence and Leadership"],
  ["The History of Tea", "Quantum Computing Fundamentals", "Child Labour and Industrial Reform"],
  ["The Rise of Public Libraries", "Volcanic Activity and Soil Fertility", "Social Media and Mental Health"],
  ["The Origins of Writing in Mesopotamia", "Ocean Current Systems", "The Ethics of Genetic Engineering"],
  ["The Printing Press and Knowledge Spread", "Desertification and Land Degradation", "The Economics of Happiness"],
  ["The Space Race", "Insect Decline and Ecosystem Impact", "Universal Basic Income"],
  ["The History of Chocolate", "The Human Microbiome", "Smart Cities and Digital Infrastructure"],
  ["Iron Age Metallurgy", "Wildfires and Forest Management", "The Philosophy of Free Will"],
  ["The Byzantine Empire", "Tidal Energy as a Renewable Resource", "Education Reform in the 21st Century"],
  ["The History of Medicine Before Germ Theory", "The Arctic Food Web", "Income Inequality and Social Mobility"],
  ["The Development of the Compass", "Freshwater Scarcity", "The Neuroscience of Addiction"],
  ["Ancient Roman Engineering", "Invasive Species and Biodiversity Loss", "The Gig Economy and Worker Rights"],
  ["The History of Chess", "Soil Health and Agricultural Productivity", "Autonomous Vehicles and Urban Planning"],
  ["The Renaissance Art Movement", "Shark Ecology and Ocean Balance", "The Psychology of Persuasion"],
  ["The History of Clocks and Timekeeping", "Wildfire Ecology and Regrowth", "Telemedicine and Healthcare Access"],
  ["Colonial Era Botany", "Bat Echolocation", "The Future of Nuclear Energy"],
  ["The History of Photography", "Ocean Acidification", "Algorithmic Bias and AI Fairness"],
  ["The Transatlantic Slave Trade", "Wetlands and Water Purification", "The Science of Habit Formation"],
  ["The History of Vaccination Hesitancy", "Soil Carbon Sequestration", "Platform Economics and Monopoly"],
];

const GT_TOPICS = [
  ["Community notice board and gym timetable", "New employee onboarding guide", "The rise of remote working"],
  ["Library services and local events", "Workplace health and safety", "The history of coffee culture"],
  ["Apartment rental advertisements", "Staff training programme", "Urban gardening movements"],
  ["Bus route guide and parking notices", "Company code of conduct", "The sharing economy"],
  ["Supermarket loyalty programme and pharmacy info", "Employee benefits and leave policy", "A history of public parks"],
  ["Local council recycling guide", "Workplace diversity and inclusion policy", "The psychology of commuting"],
  ["Sports club membership information", "Training manual for new retail staff", "A brief history of radio"],
  ["Tourist attraction guide and café menus", "Fire safety procedures", "The development of public transport"],
  ["Medical centre notices and appointment info", "Annual leave and sick leave policy", "The art of negotiation"],
  ["Community centre class schedule", "Performance review guidelines", "The science of handwriting"],
  ["Electricity bill guide and appliance safety tips", "First aid procedures at work", "How newspapers evolved"],
  ["School term timetable and canteen menu", "Customer service training guide", "The history of the post office"],
  ["Neighbourhood watch newsletter", "IT acceptable use policy", "Community gardens and urban resilience"],
  ["Bank account guide and ATM safety", "Workplace ergonomics guidelines", "A short history of cinema"],
  ["Housing association newsletter", "Payroll and expenses procedures", "The economics of tourism"],
  ["Local heritage trail guide", "Social media policy for employees", "How public libraries changed communities"],
  ["Community health clinic leaflet", "Staff handbook: disciplinary procedures", "The rise of food delivery apps"],
  ["Pet adoption centre information", "Volunteer coordinator guidelines", "A history of the telephone"],
  ["Council planning notice and local development", "Employee assistance programme", "How museums preserve history"],
  ["Driving licence renewal guide", "Shift work policy and overtime rules", "The benefits of bilingualism"],
  ["Insurance policy summary", "Workplace conflict resolution", "The history of urban planning"],
  ["Childcare centre information", "Return-to-work procedures", "A history of public health campaigns"],
  ["Environmental charity leaflets", "Equipment maintenance log procedures", "The rise of the wellness industry"],
  ["Student accommodation guide", "Graduate induction programme", "The importance of adult literacy"],
  ["Emergency services contact information", "Parental leave policy", "How trade unions changed labour rights"],
  ["Local election candidate flyers", "Remote working policy", "The history of the census"],
  ["Recycling centre opening hours and accepted items", "Grievance and whistleblowing policy", "How zoning laws shape cities"],
  ["Airport transfer information", "Mentoring programme guidelines", "The evolution of retail shopping"],
  ["Senior citizens' services guide", "Workplace wellbeing programme", "A history of the minimum wage"],
  ["Tourist visa information leaflet", "Graduate development scheme", "The history of food safety regulations"],
];

// ── Build JSON test from LLM output ──────────────────────────────────────────
function buildTestJSON(testNum, parsed, isGT) {
  const variant  = isGT ? "general_training" : "academic";
  const num3     = pad(testNum);
  const id       = `ielts-reading-${num3}`;
  const titleTag = isGT ? "IELTS General Training Reading" : "IELTS Academic Reading";

  const passages = (parsed.passages || []).map((p, idx) => ({
    id:       `${id}-p${idx + 1}`,
    title:    p.title   || `Passage ${idx + 1}`,
    content:  p.content || "",
    wordCount: p.wordCount || (p.content || "").split(/\s+/).filter(Boolean).length,
    topic:    (p.title || "").toLowerCase(),
  }));

  const questions = (parsed.questions || []).map((q, idx) => {
    const pIdx    = q.passageIndex ?? 0;
    const passage = passages[pIdx] || passages[0];
    return {
      id:           `${id}-q${String(idx + 1).padStart(2, "0")}`,
      passageId:    passage?.id || `${id}-p1`,
      questionType: q.questionType || "multiple_choice",
      instructions: q.instructions || "Answer according to the passage.",
      prompt:       q.prompt       || "",
      options:      q.options      || [],
      correctAnswer: q.correctAnswer || "",
      explanation:  q.explanation  || "",
      difficulty:   q.difficulty   || "medium",
      topic:        passage?.topic || "",
    };
  });

  return {
    id,
    exam:            "ielts",
    section:         "reading",
    type:            "section",
    variant,
    title:           `${titleTag} Practice Test ${testNum}`,
    durationSeconds: 3600,
    questionCount:   questions.length,
    instructions:    "Read the passages and answer all 40 questions. Transfer answers to the answer sheet within the time limit.",
    passages,
    questions,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Verify server is reachable
  await new Promise((resolve, reject) => {
    const req = http.get(`${SERVER}/api/health`, (res) => {
      let raw = "";
      res.on("data", d => (raw += d));
      res.on("end", () => {
        const j = JSON.parse(raw);
        if (!j.hasKey) { reject(new Error("Server has no API key in .env")); return; }
        console.log(`✅  Server OK — model ready`);
        resolve();
      });
    });
    req.on("error", () => reject(new Error("server.js not running on port 3001. Run: node server.js")));
    req.setTimeout(5000, () => { req.destroy(); reject(new Error("Server timeout")); });
  });

  const tracker = loadTracker();
  const subDir  = "ielts/reading";

  let created = 0, skipped = 0, errors = 0;

  const start = GT ? Math.max(FROM, 31) : Math.min(FROM, 30);
  const end   = GT ? Math.min(TO,   60) : Math.min(TO,  30);

  for (let n = start; n <= end; n++) {
    const num3    = pad(n);
    const fname   = `test-${num3}.json`;
    const relPath = `${subDir}/${fname}`;
    const absPath = path.join(CONTENT, subDir, fname);

    // Check tracker
    if (!FORCE && tracker[relPath]) {
      // Verify file actually has good content
      if (fs.existsSync(absPath)) {
        const check = JSON.parse(fs.readFileSync(absPath, "utf8"));
        const firstPassage = check.passages?.[0]?.content || "";
        if (firstPassage.split(/\s+/).length >= 600 && (check.questions?.length || 0) >= 38) {
          console.log(`  ⏭  Skip ${fname} (already rebuilt)`);
          skipped++;
          continue;
        }
        console.log(`  ⚠  Tracker stale for ${fname} — re-processing`);
      }
    }

    console.log(`\n📖  Rebuilding ${fname} (test ${n})…`);

    // Backup original
    backupFile(absPath);

    const isGT  = n >= 31;
    const prompt = isGT ? buildGTPrompt(n) : buildAcademicPrompt(n);

    let testJSON;
    let attempt = 0;
    while (attempt < 3) {
      attempt++;
      try {
        console.log(`    Calling Gemini (attempt ${attempt})…`);
        const rawAnswer = await postGenerate(prompt);
        const parsed    = extractJSON(rawAnswer);

        if (!parsed.passages || parsed.passages.length < 2) {
          throw new Error(`Only ${parsed.passages?.length || 0} passages returned`);
        }
        if (!parsed.questions || parsed.questions.length < 30) {
          throw new Error(`Only ${parsed.questions?.length || 0} questions returned`);
        }

        testJSON = buildTestJSON(n, parsed, isGT);

        const qCount = testJSON.questions.length;
        const p1Words = testJSON.passages[0]?.wordCount || 0;
        console.log(`    ✅  ${qCount} questions, passage[0] ~${p1Words} words`);
        break;
      } catch (err) {
        console.warn(`    ⚠  Attempt ${attempt} failed: ${err.message}`);
        if (attempt === 3) {
          console.error(`    ❌  Giving up on ${fname}`);
          errors++;
          tracker[relPath] = { rebuilt: false, error: err.message, ts: Date.now() };
          saveTracker(tracker);
          testJSON = null;
        } else {
          await new Promise(r => setTimeout(r, 3000 * attempt));
        }
      }
    }

    if (!testJSON) continue;

    // Write file
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, JSON.stringify(testJSON, null, 2));
    tracker[relPath] = { rebuilt: true, ts: Date.now(), questionCount: testJSON.questions.length };
    saveTracker(tracker);
    created++;

    // Small pause between calls
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n══════════════════════════════════════`);
  console.log(`✅  Done — ${created} rebuilt, ${skipped} skipped, ${errors} errors`);
  console.log(`\nNext: node tools/audit-test-quality.js --exam ielts --section reading`);
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
