#!/usr/bin/env node
// tools/rebuild-ielts-speaking.js
// Rebuilds IELTS Speaking tests with proper Part 1/2/3 structure and model answers.
//
// Structure per test:
//   Part 1 — 4 short personal questions (45–70 word model answers each)
//   Part 2 — 1 cue card long turn (220–280 word model answer, covers all bullet points)
//   Part 3 — 4 analytical discussion questions (90–130 word model answers each)
//   Total: 9 questions
//
// Requires server.js running: node server.js
//
// Usage:
//   node tools/rebuild-ielts-speaking.js [--from 1] [--to 30] [--force]
"use strict";

const fs   = require("fs");
const path = require("path");
const http = require("http");

const ROOT    = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const BACKUP  = path.join(ROOT, ".backup", "ielts-speaking");
const TRACKER = path.join(ROOT, ".rebuild-speaking-tracker.json");
const SERVER  = "http://localhost:3001";

const args  = process.argv.slice(2);
const FROM  = parseInt(args[args.indexOf("--from") + 1] || "1",  10);
const TO    = parseInt(args[args.indexOf("--to")   + 1] || "60", 10);
const FORCE = args.includes("--force");

function pad(n) { return String(n).padStart(3, "0"); }
function loadTracker() { try { return JSON.parse(fs.readFileSync(TRACKER, "utf8")); } catch { return {}; } }
function saveTracker(t) { fs.writeFileSync(TRACKER, JSON.stringify(t, null, 2)); }
function backupFile(fp) {
  fs.mkdirSync(BACKUP, { recursive: true });
  const rel = path.relative(path.join(CONTENT, "ielts", "speaking"), fp);
  if (fs.existsSync(fp)) fs.copyFileSync(fp, path.join(BACKUP, rel));
}

function postGenerate(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ messages: [{ role: "user", content: prompt }], context: { mode: "rebuild" } });
    const req  = http.request(new URL(`${SERVER}/api/ai-tutor/generate`), {
      method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    }, (res) => {
      let raw = "";
      res.on("data", d => (raw += d));
      res.on("end", () => { try { resolve(JSON.parse(raw).answer || raw); } catch { resolve(raw); } });
    });
    req.on("error", reject);
    req.setTimeout(120_000, () => { req.destroy(); reject(new Error("timeout")); });
    req.write(body); req.end();
  });
}

function extractJSON(text) {
  const m = text.match(/```json\s*([\s\S]*?)```/i);
  if (m) return JSON.parse(m[1].trim());
  const s = text.indexOf("{"), e = text.lastIndexOf("}");
  if (s !== -1 && e !== -1) return JSON.parse(text.slice(s, e + 1));
  throw new Error("No JSON in response");
}

// ── Topics ────────────────────────────────────────────────────────────────────
const TOPICS = [
  { p1: "your daily routine and work/study habits", p2: "a place you have visited that left a strong impression on you", p3: "tourism and its effects on local communities" },
  { p1: "food and cooking habits", p2: "a skill you learned outside of school", p3: "the role of education in modern society" },
  { p1: "technology in your daily life", p2: "a memorable gift you received", p3: "consumerism and its impact on the environment" },
  { p1: "your home and neighbourhood", p2: "a person who has influenced your life", p3: "urban development and city planning" },
  { p1: "hobbies and free time activities", p2: "a book or film that changed your way of thinking", p3: "media influence on society" },
  { p1: "your experience with public transport", p2: "a time when you helped someone", p3: "social responsibility and community involvement" },
  { p1: "your favourite type of music", p2: "a sports event or performance you attended", p3: "the role of sport in society" },
  { p1: "shopping habits and preferences", p2: "an important decision you made", p3: "the ethics of consumerism and fast fashion" },
  { p1: "your relationship with social media", p2: "a time when you had to communicate in a foreign language", p3: "globalisation and cultural identity" },
  { p1: "the area where you grew up", p2: "a traditional event or festival in your culture", p3: "the importance of preserving cultural heritage" },
  { p1: "your educational background", p2: "a teacher or mentor who inspired you", p3: "education systems and their challenges" },
  { p1: "health and fitness habits", p2: "a challenge you overcame", p3: "public health and government responsibility" },
  { p1: "your experience with technology at work or study", p2: "a piece of technology that changed your life", p3: "artificial intelligence and the future of work" },
  { p1: "your reading habits", p2: "a place in your country you would recommend to visitors", p3: "tourism management and sustainable travel" },
  { p1: "friendship and social relationships", p2: "a time when you worked as part of a team", p3: "teamwork and collaboration in the workplace" },
  { p1: "environmental habits in your daily life", p2: "an environmental problem in your area", p3: "climate change and individual vs government action" },
  { p1: "your experience with learning a language", p2: "a conversation that made you change your mind", p3: "communication and language diversity" },
  { p1: "your favourite season or weather", p2: "an outdoor activity you enjoy", p3: "people's relationship with nature and the environment" },
  { p1: "your experience with art or creative activities", p2: "a piece of art or music that had a strong impact on you", p3: "arts funding and cultural policy" },
  { p1: "your sleeping and rest habits", p2: "a period in your life when you learned a great deal", p3: "work-life balance and productivity" },
  { p1: "food traditions in your family", p2: "a meal or dining experience you remember well", p3: "globalisation and food culture" },
  { p1: "your experience with news and current affairs", p2: "a news story that affected you", p3: "media bias and freedom of the press" },
  { p1: "your experience with volunteering or charity work", p2: "a time you gave or received help from a stranger", p3: "social inequality and the role of charity" },
  { p1: "your preferences for city or countryside life", p2: "a journey or trip that was memorable", p3: "urban vs rural development" },
  { p1: "your relationship with animals or pets", p2: "a wild animal or nature experience", p3: "biodiversity conservation and human impact" },
  { p1: "your experience with celebrations and special occasions", p2: "a birthday or celebration you organised", p3: "the commercialisation of celebrations and traditions" },
  { p1: "your experience with public spaces (parks, libraries, museums)", p2: "a museum or exhibition that impressed you", p3: "investment in public spaces and culture" },
  { p1: "your study or work environment", p2: "a project you worked on that you are proud of", p3: "creativity and innovation in the workplace" },
  { p1: "your experience with money and budgeting", p2: "a time when you had to save for something important", p3: "financial literacy and economic inequality" },
  { p1: "your experience with travel abroad", p2: "a country or culture you would like to know more about", p3: "global migration and international relations" },
  // GT topics (31–60) — more everyday/community-oriented
  { p1: "your local community and neighbourhood", p2: "a community event or project you participated in", p3: "the role of communities in supporting individuals" },
  { p1: "your favourite way to relax", p2: "a time when you learned something from an older person", p3: "intergenerational relationships and knowledge sharing" },
  { p1: "your experience with public services", p2: "a time you had to deal with a difficult bureaucratic process", p3: "the quality of public services in modern society" },
  { p1: "your daily exercise habits", p2: "a sport or physical activity you enjoy", p3: "government policies to promote public health" },
  { p1: "your experience with cooking or trying new foods", p2: "a recipe or dish that is important in your family", p3: "food culture and its links to national identity" },
  { p1: "your experience with job hunting or career changes", p2: "a job or internship that taught you a lot", p3: "employment challenges facing young people today" },
  { p1: "your experience with childcare or education of children", p2: "a memorable childhood experience", p3: "the changing role of parents in child development" },
  { p1: "your habits around reading news or staying informed", p2: "a time when you had to make a complaint", p3: "consumer rights and corporate accountability" },
  { p1: "your experience with home or DIY projects", p2: "a time you had to learn a practical skill quickly", p3: "manual skills and vocational education" },
  { p1: "your preferences when shopping", p2: "a time you returned or exchanged something you bought", p3: "online shopping vs high street retail" },
  { p1: "your experience with digital devices", p2: "a time technology helped you solve a problem", p3: "digital literacy and access to technology" },
  { p1: "your relationship with family members", p2: "a family tradition that is important to you", p3: "changing family structures in modern society" },
  { p1: "your experience with local transport", p2: "a journey that was particularly difficult or interesting", p3: "investment in public infrastructure" },
  { p1: "your experience with recycling and waste management", p2: "a change you made to live more sustainably", p3: "environmental policy and individual behaviour" },
  { p1: "your experience with healthcare", p2: "a time you or someone close to you received medical help", p3: "healthcare systems and government funding" },
  { p1: "your experience with online communication", p2: "a time you made a friend or connection online", p3: "social media and the future of human connection" },
  { p1: "your experience with renting or buying a home", p2: "a place you have lived that felt like home", p3: "the housing crisis and government solutions" },
  { p1: "your experience with public libraries or community centres", p2: "a time a community resource helped you", p3: "the value of public services in modern life" },
  { p1: "your experience with local food markets", p2: "a local business or market stall you regularly visit", p3: "supporting local economies vs global chains" },
  { p1: "your experience with different languages", p2: "a time language was a barrier for you", p3: "language policy and multilingualism in society" },
];

// ── Build prompt ──────────────────────────────────────────────────────────────
function buildPrompt(testNum) {
  const idx    = (testNum - 1) % TOPICS.length;
  const topic  = TOPICS[idx];
  const isGT   = testNum >= 31;

  return `Generate a complete IELTS Speaking practice test as a JSON object.

{
  "part1Questions": [
    {
      "prompt": "...",
      "modelAnswer": "..."
    },
    ... (4 questions)
  ],
  "part2CueCard": {
    "prompt": "Describe [something]. You should say:\\n  - [bullet 1]\\n  - [bullet 2]\\n  - [bullet 3]\\n  - [bullet 4]\\nand explain [concluding prompt].",
    "followUpQuestion": "...",
    "modelAnswer": "...",
    "followUpModelAnswer": "..."
  },
  "part3Questions": [
    {
      "prompt": "...",
      "modelAnswer": "..."
    },
    ... (4 questions)
  ]
}

PART 1 TOPIC: ${topic.p1}
PART 2 TOPIC: ${topic.p2}
PART 3 TOPIC: ${topic.p3}

TEST ${testNum} — ${isGT ? "General Training" : "Academic"}

PART 1 REQUIREMENTS (4 questions about: "${topic.p1}"):
- Short, friendly personal questions (not opinion-based)
- Model answer: 50–70 words each, conversational, natural English
- Use hedging language: "I'd say...", "I suppose...", "To be honest..."
- Include specific personal detail to sound authentic
- Examples: "Do you...?", "How often do you...?", "What do you think about...?"

PART 2 REQUIREMENTS (cue card about: "${topic.p2}"):
- The prompt field must include 4 bullet points the speaker should address
- Format bullets as: "\\n  - what it was\\n  - when it happened\\n  - who was involved\\n  - how you felt about it"
- followUpQuestion: a single follow-up question the examiner asks after the cue card
- modelAnswer: 230–280 words — MUST cover all 4 bullet points naturally
  * Opening: introduce the topic
  * Middle: develop each bullet with specific details, vivid language
  * End: reflect on significance or feelings
  * Natural spoken register: some fillers ("Well, actually...", "What I remember most is...")
- followUpModelAnswer: 40–60 words answering just the follow-up question

PART 3 REQUIREMENTS (4 analytical questions about: "${topic.p3}"):
- These are deeper opinion/discussion questions, not personal ("Do you think...?", "Why do you believe...?", "How has ... changed?", "What are the advantages of...?")
- Model answer: 90–120 words each
- Include: position statement + reason + example + concluding sentence
- Academic vocabulary appropriate for IELTS Band 7
- Avoid starting all answers the same way — vary openings

CRITICAL:
- All model answers must be COMPLETE (never end mid-sentence)
- Part 1 answers must sound spoken, not written
- Part 3 answers must demonstrate range of vocabulary and grammar

Return ONLY the JSON. No text before or after.`;
}

// ── Build test JSON ───────────────────────────────────────────────────────────
function buildTestJSON(testNum, parsed) {
  const isGT   = testNum >= 31;
  const num3   = pad(testNum);
  const id     = `ielts-speaking-${num3}`;
  const variant = isGT ? "general_training" : "academic";

  const questions = [];
  let qNum = 1;

  // Part 1
  for (const q of (parsed.part1Questions || [])) {
    questions.push({
      id:           `${id}-q${String(qNum).padStart(2, "0")}`,
      part:         1,
      questionType: "speaking_task",
      prompt:       q.prompt || "",
      modelAnswer:  q.modelAnswer || "",
      prepSeconds:  0,
      responseSeconds: 30,
      rubric:       ["fluency","coherence","vocabulary","grammar","pronunciation"],
      difficulty:   "easy",
      topic:        TOPICS[(testNum - 1) % TOPICS.length].p1,
    });
    qNum++;
  }

  // Part 2
  const p2 = parsed.part2CueCard || {};
  questions.push({
    id:           `${id}-q${String(qNum).padStart(2, "0")}`,
    part:         2,
    questionType: "speaking_task",
    prompt:       p2.prompt || "",
    followUpQuestion: p2.followUpQuestion || "",
    modelAnswer:  p2.modelAnswer || "",
    followUpModelAnswer: p2.followUpModelAnswer || "",
    prepSeconds:  60,
    responseSeconds: 120,
    rubric:       ["fluency","coherence","vocabulary","grammar","pronunciation"],
    difficulty:   "medium",
    topic:        TOPICS[(testNum - 1) % TOPICS.length].p2,
    isCueCard:    true,
  });
  qNum++;

  // Part 3
  for (const q of (parsed.part3Questions || [])) {
    questions.push({
      id:           `${id}-q${String(qNum).padStart(2, "0")}`,
      part:         3,
      questionType: "speaking_task",
      prompt:       q.prompt || "",
      modelAnswer:  q.modelAnswer || "",
      prepSeconds:  0,
      responseSeconds: 90,
      rubric:       ["fluency","coherence","vocabulary","grammar","pronunciation"],
      difficulty:   "hard",
      topic:        TOPICS[(testNum - 1) % TOPICS.length].p3,
    });
    qNum++;
  }

  return {
    id,
    exam:            "ielts",
    section:         "speaking",
    type:            "section",
    variant,
    title:           `IELTS ${isGT ? "General Training" : "Academic"} Speaking Practice Test ${testNum}`,
    durationSeconds: 900,
    questionCount:   questions.length,
    instructions:    "Speak clearly and in detail. Use the model answers to compare your response. Part 1: Personal questions. Part 2: 1-minute cue card (1–2 minutes speaking). Part 3: Discussion questions.",
    questions,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await new Promise((resolve, reject) => {
    const req = http.get(`${SERVER}/api/health`, (res) => {
      let raw = "";
      res.on("data", d => (raw += d));
      res.on("end", () => {
        try {
          const j = JSON.parse(raw);
          if (!j.hasKey) { reject(new Error("No API key")); return; }
          console.log("✅  Server OK"); resolve();
        } catch { reject(new Error("Bad health")); }
      });
    });
    req.on("error", () => reject(new Error("server.js not running")));
    req.setTimeout(5000, () => { req.destroy(); reject(new Error("timeout")); });
  });

  const tracker = loadTracker();
  let created = 0, skipped = 0, errors = 0;

  for (let n = FROM; n <= TO; n++) {
    const isGT   = n >= 31;
    const num3   = pad(n);
    const fname  = `test-${num3}.json`;
    const absPath = path.join(CONTENT, "ielts", "speaking", fname);
    const relPath = `ielts/speaking/${fname}`;

    if (!FORCE && tracker[relPath]) {
      if (fs.existsSync(absPath)) {
        const check  = JSON.parse(fs.readFileSync(absPath, "utf8"));
        const hasP2  = check.questions?.some(q => q.part === 2 && (q.modelAnswer || "").split(/\s+/).length >= 180);
        const hasP3  = check.questions?.some(q => q.part === 3 && (q.modelAnswer || "").split(/\s+/).length >= 80);
        if (hasP2 && hasP3 && (check.questions?.length || 0) >= 8) {
          console.log(`  ⏭  Skip ${fname}`);
          skipped++; continue;
        }
        console.log(`  ⚠  Stale tracker for ${fname} — rebuilding`);
      }
    }

    console.log(`\n🎤  Rebuilding ${fname} (test ${n})…`);
    backupFile(absPath);

    let testJSON = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`    Calling Gemini (attempt ${attempt})…`);
        const raw    = await postGenerate(buildPrompt(n));
        const parsed = extractJSON(raw);

        if (!parsed.part1Questions?.length || !parsed.part2CueCard || !parsed.part3Questions?.length) {
          throw new Error("Missing parts in response");
        }
        const p2words = (parsed.part2CueCard.modelAnswer || "").split(/\s+/).length;
        if (p2words < 150) throw new Error(`Part 2 model answer too short: ${p2words} words`);

        testJSON = buildTestJSON(n, parsed);
        const p2q = testJSON.questions.find(q => q.part === 2);
        console.log(`    ✅  ${testJSON.questions.length} questions, P2 ~${p2words}w`);
        break;
      } catch (err) {
        console.warn(`    ⚠  Attempt ${attempt}: ${err.message}`);
        if (attempt === 3) {
          errors++;
          tracker[relPath] = { rebuilt: false, error: err.message, ts: Date.now() };
          saveTracker(tracker);
        } else {
          await new Promise(r => setTimeout(r, 3000 * attempt));
        }
      }
    }

    if (!testJSON) continue;

    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, JSON.stringify(testJSON, null, 2));
    tracker[relPath] = { rebuilt: true, ts: Date.now(), questionCount: testJSON.questions.length };
    saveTracker(tracker);
    created++;

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n══════════════════════════════════════`);
  console.log(`✅  Done — ${created} rebuilt, ${skipped} skipped, ${errors} errors`);
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
