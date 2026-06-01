#!/usr/bin/env node
// tools/rebuild-ielts-writing.js
// Rebuilds IELTS Writing tests:
//   Academic (001–030): Task 1 gets visual block + 160+ word model answer; Task 2 gets 280+ word model answer
//   General Training (031–060): Task 1 = letter (150+ words); Task 2 = essay (280+ words)
//
// Requires server.js running.
//
// Usage:
//   node tools/rebuild-ielts-writing.js [--from 1] [--to 30] [--force]
//   node tools/rebuild-ielts-writing.js --from 31 --to 60   # GT
"use strict";

const fs   = require("fs");
const path = require("path");
const http = require("http");

const ROOT    = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const BACKUP  = path.join(ROOT, ".backup", "ielts-writing");
const TRACKER = path.join(ROOT, ".rebuild-writing-tracker.json");
const SERVER  = "http://localhost:3001";

const args  = process.argv.slice(2);
const FROM  = parseInt(args[args.indexOf("--from") + 1] || "1",  10);
const TO    = parseInt(args[args.indexOf("--to")   + 1] || "30", 10);
const FORCE = args.includes("--force");

function pad(n) { return String(n).padStart(3, "0"); }
function loadTracker() { try { return JSON.parse(fs.readFileSync(TRACKER, "utf8")); } catch { return {}; } }
function saveTracker(t) { fs.writeFileSync(TRACKER, JSON.stringify(t, null, 2)); }
function backupFile(fp) {
  fs.mkdirSync(BACKUP, { recursive: true });
  const rel = path.relative(path.join(CONTENT, "ielts", "writing"), fp);
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

// ── Academic Writing prompts ──────────────────────────────────────────────────
const ACADEMIC_TASK1_TYPES = [
  "line graph", "bar chart", "pie chart", "table", "process diagram",
  "map", "bar chart", "line graph", "table", "pie chart",
  "process diagram", "map", "bar chart", "line graph", "table",
  "pie chart", "process diagram", "map", "bar chart", "line graph",
  "table", "pie chart", "process diagram", "map", "bar chart",
  "line graph", "table", "pie chart", "process diagram", "line graph",
];

const ACADEMIC_TASK2_TOPICS = [
  "technology and social isolation",
  "governments funding arts and culture",
  "online education vs traditional education",
  "rising house prices in cities",
  "benefits and drawbacks of tourism",
  "childhood obesity and government responsibility",
  "animal testing in medical research",
  "environmental vs economic development",
  "immigration benefits and challenges",
  "whether university education should be free",
  "plastic pollution and consumer responsibility",
  "social media's effect on news credibility",
  "nuclear energy as a solution to climate change",
  "gender equality in the workplace",
  "artificial intelligence replacing human jobs",
  "increasing the retirement age",
  "space exploration vs solving Earth's problems",
  "surveillance cameras in public places",
  "standardised testing in schools",
  "languages dying out — should governments intervene",
  "remote working and its future",
  "fast fashion and sustainability",
  "international aid — is it effective",
  "single-use plastic bans",
  "mental health in the workplace",
  "sport and national identity",
  "electric vehicles — are they the solution",
  "social media age restrictions",
  "junk food advertising bans",
  "genetic engineering of crops",
];

const GT_TASK1_LETTER_TOPICS = [
  { prompt: "You recently moved into a new flat. Write a letter to the landlord about a problem with the heating system.", style: "formal" },
  { prompt: "You have seen an advertisement for a part-time job at a local café. Write a letter applying for the job.", style: "semi-formal" },
  { prompt: "A friend has offered to lend you their car for a week. Write a letter thanking them and asking about the arrangements.", style: "informal" },
  { prompt: "You booked a hotel room for two nights but when you arrived, there were problems with your room. Write a letter to the hotel manager.", style: "formal" },
  { prompt: "You recently attended a community event organised by your local council. Write a letter to the council expressing your views.", style: "formal" },
  { prompt: "Your neighbour's dog has been causing problems. Write a letter to your neighbour explaining the situation.", style: "informal" },
  { prompt: "You saw an advertisement for an English language course abroad. Write a letter requesting further information.", style: "formal" },
  { prompt: "A colleague is leaving the company. Write a letter expressing your feelings and suggesting a farewell event.", style: "informal" },
  { prompt: "You have received a water bill that seems too high. Write a letter to the water company.", style: "formal" },
  { prompt: "You want to join a local sports club. Write a letter to the club secretary.", style: "semi-formal" },
  { prompt: "A family member is visiting your city. Write a letter recommending things to do.", style: "informal" },
  { prompt: "You bought an item online that arrived damaged. Write a letter to the company.", style: "formal" },
  { prompt: "You would like to volunteer at a local charity. Write a letter to the charity coordinator.", style: "formal" },
  { prompt: "You are moving house and need to cancel a subscription service. Write a letter.", style: "formal" },
  { prompt: "A friend helped you during a difficult time. Write a letter thanking them.", style: "informal" },
  { prompt: "Your workplace canteen has introduced changes you dislike. Write to the facilities manager.", style: "formal" },
  { prompt: "You want to enrol in an evening class at a college. Write a letter requesting information.", style: "semi-formal" },
  { prompt: "You recently used a taxi service and had a very good experience. Write to the company.", style: "formal" },
  { prompt: "You need to take a week off work for a family matter. Write a letter to your manager.", style: "formal" },
  { prompt: "You borrowed a book from a friend and damaged it. Write a letter apologising.", style: "informal" },
  { prompt: "You saw a job advertised at a local hospital. Write a letter of application.", style: "formal" },
  { prompt: "Your child's school is proposing to change its uniform policy. Write to the headteacher.", style: "formal" },
  { prompt: "You have been staying with a family as part of a language programme. Write a letter thanking them.", style: "informal" },
  { prompt: "You want to complain about noise from a nearby construction site.", style: "formal" },
  { prompt: "You ordered a birthday gift online and it arrived too late. Write to the company.", style: "formal" },
  { prompt: "A friend is thinking of starting their own business. Write to give advice.", style: "informal" },
  { prompt: "Your company has offered training opportunities. Write to express interest in a specific course.", style: "formal" },
  { prompt: "You recently stayed at a bed and breakfast. Write to the owner recommending improvements.", style: "formal" },
  { prompt: "You want to complain about the standard of a meal at a restaurant.", style: "formal" },
  { prompt: "A local park is being considered for redevelopment. Write to your local councillor.", style: "formal" },
];

const GT_TASK2_TOPICS = [
  "whether people rely too much on technology",
  "governments spending money on public parks",
  "young people moving abroad to work",
  "the benefits of living in a city vs countryside",
  "reducing car use in cities",
  "whether fast food culture is harmful",
  "parents or schools — who is responsible for children's behaviour",
  "whether working from home benefits society",
  "the impact of tourism on local communities",
  "should higher education be free for everyone",
  "whether older employees should retire to make room for young people",
  "celebrities as role models",
  "plastic bag charges — effective or not",
  "social media and young people's wellbeing",
  "the pros and cons of a cashless society",
  "public libraries — are they still relevant",
  "gender pay gap — causes and solutions",
  "should zoos be banned",
  "international travel broadening the mind",
  "whether competitive sport is good for children",
  "the rise of online shopping and high-street decline",
  "crime prevention — punishment or rehabilitation",
  "languages — is English becoming too dominant",
  "media influence on body image",
  "nuclear families vs extended families",
  "whether governments should control what people eat",
  "volunteering — should it be compulsory for young people",
  "road safety — individual responsibility or government duty",
  "whether advertisements targeting children should be banned",
  "the importance of art and music in school",
];

// ── Build prompt for Academic Writing ─────────────────────────────────────────
function buildAcademicPrompt(testNum) {
  const chartType = ACADEMIC_TASK1_TYPES[(testNum - 1) % ACADEMIC_TASK1_TYPES.length];
  const task2Topic = ACADEMIC_TASK2_TOPICS[(testNum - 1) % ACADEMIC_TASK2_TOPICS.length];

  const chartInstructions = {
    "line graph":       "Show changes over time for 3 categories across 6–8 time points. Include specific numbers.",
    "bar chart":        "Compare values for 3–5 categories across 2–3 groups. Include specific numbers.",
    "pie chart":        "Show proportions for 5–7 segments. Include percentages that sum to 100%.",
    "table":            "Show data for 4–5 rows × 3–4 columns with specific figures.",
    "process diagram":  "Describe a 6–8 step natural or industrial process (e.g. water purification, paper making).",
    "map":              "Show before/after changes to a town, building, or area.",
  };

  const instruction = chartInstructions[chartType] || chartInstructions["bar chart"];

  return `Generate a complete IELTS Academic Writing practice test as a JSON object:

{
  "task1": {
    "prompt": "...",
    "visual": {
      "type": "bar|line|pie|table|process|map",
      "title": "...",
      "description": "...",
      "data": { ... }
    },
    "modelAnswer": "...",
    "wordCount": <number>
  },
  "task2": {
    "prompt": "...",
    "modelAnswer": "...",
    "wordCount": <number>
  }
}

TASK 1 — ${chartType.toUpperCase()} (test ${testNum}):
Chart instruction: ${instruction}

Visual object format for "${chartType}":
${getVisualFormat(chartType)}

Task 1 prompt: Must describe what the ${chartType} shows (mention specific categories, time periods if applicable, units).
Example: "The line graph below shows changes in the percentage of households with internet access in four European countries between 2005 and 2020. Summarise the main features and make comparisons where relevant."

Task 1 model answer requirements:
- EXACTLY 160–200 words
- Opening: paraphrase the prompt (never copy it)
- Paragraph 2: overview — identify 2–3 key trends/features WITHOUT specific figures
- Paragraph 3: detail paragraph 1 with specific data comparisons
- Paragraph 4: detail paragraph 2 with more specific data
- Formal academic register
- No personal opinion
- Data in the answer must match the visual data you provide

TASK 2 — ESSAY on: "${task2Topic}" (test ${testNum}):
Prompt style: "Discuss both views and give your own opinion" OR "To what extent do you agree or disagree?" — choose ONE.

Task 2 model answer requirements:
- EXACTLY 280–320 words
- Paragraph 1: Introduction (paraphrase topic + thesis)
- Paragraph 2: First viewpoint with 2 specific examples or reasons
- Paragraph 3: Second viewpoint OR counter-argument with evidence
- Paragraph 4: Writer's opinion with reasoning
- Paragraph 5: Conclusion (restate thesis, no new ideas)
- Academic vocabulary, varied sentence structures
- Must be COMPLETE — do not cut off mid-sentence

Return ONLY the JSON. No text before or after.`;
}

function getVisualFormat(chartType) {
  switch (chartType) {
    case "line graph":
      return `{
  "type": "line",
  "title": "...",
  "xLabel": "Year",
  "yLabel": "Percentage (%)",
  "series": [
    { "label": "Category A", "data": [{"x":"2005","y":45}, {"x":"2010","y":62}, {"x":"2015","y":78}, {"x":"2020","y":85}] },
    { "label": "Category B", "data": [{"x":"2005","y":30}, {"x":"2010","y":41}, {"x":"2015","y":55}, {"x":"2020","y":70}] },
    { "label": "Category C", "data": [{"x":"2005","y":15}, {"x":"2010","y":28}, {"x":"2015","y":40}, {"x":"2020","y":58}] }
  ]
}`;
    case "bar chart":
      return `{
  "type": "bar",
  "title": "...",
  "xLabel": "Category",
  "yLabel": "Value (units)",
  "series": [
    { "label": "Group 1", "data": [{"x":"A","y":45}, {"x":"B","y":60}, {"x":"C","y":30}, {"x":"D","y":75}] },
    { "label": "Group 2", "data": [{"x":"A","y":35}, {"x":"B","y":50}, {"x":"C","y":55}, {"x":"D","y":40}] }
  ]
}`;
    case "pie chart":
      return `{
  "type": "pie",
  "title": "...",
  "description": "The chart shows the distribution of [topic] by category.",
  "segments": [
    {"label": "Category A", "value": 35},
    {"label": "Category B", "value": 25},
    {"label": "Category C", "value": 20},
    {"label": "Category D", "value": 12},
    {"label": "Category E", "value": 8}
  ]
}`;
    case "table":
      return `{
  "type": "table",
  "title": "...",
  "description": "The table shows [data description].",
  "headers": ["Country", "2010", "2015", "2020"],
  "rows": [
    ["Country A", "45%", "58%", "72%"],
    ["Country B", "30%", "41%", "60%"],
    ["Country C", "22%", "35%", "51%"],
    ["Country D", "15%", "28%", "44%"]
  ]
}`;
    case "process diagram":
      return `{
  "type": "process",
  "title": "...",
  "description": "The diagram illustrates the stages in [process name].",
  "steps": [
    {"step": 1, "label": "Step 1 name", "description": "What happens"},
    {"step": 2, "label": "Step 2 name", "description": "What happens"},
    {"step": 3, "label": "Step 3 name", "description": "What happens"},
    {"step": 4, "label": "Step 4 name", "description": "What happens"},
    {"step": 5, "label": "Step 5 name", "description": "What happens"},
    {"step": 6, "label": "Step 6 name", "description": "What happens"}
  ]
}`;
    case "map":
      return `{
  "type": "map",
  "title": "...",
  "description": "The maps show [place name] in [year 1] and [year 2], illustrating changes to the area.",
  "before": {
    "label": "[Year 1]",
    "features": ["Feature 1 location and description", "Feature 2", "Feature 3", "Feature 4"]
  },
  "after": {
    "label": "[Year 2]",
    "features": ["Changed feature 1", "New feature 2", "Removed feature 3", "New feature 4"]
  }
}`;
    default:
      return `{ "type": "bar", "title": "...", "series": [] }`;
  }
}

// ── Build prompt for GT Writing ───────────────────────────────────────────────
function buildGTPrompt(testNum) {
  const idx = (testNum - 31) % GT_TASK1_LETTER_TOPICS.length;
  const letter = GT_TASK1_LETTER_TOPICS[idx];
  const task2Topic = GT_TASK2_TOPICS[idx];

  return `Generate a complete IELTS General Training Writing practice test as a JSON object:

{
  "task1": {
    "prompt": "...",
    "style": "${letter.style}",
    "modelAnswer": "...",
    "wordCount": <number>
  },
  "task2": {
    "prompt": "...",
    "modelAnswer": "...",
    "wordCount": <number>
  }
}

TASK 1 — LETTER (test ${testNum}):
Situation: ${letter.prompt}
Letter style: ${letter.style}

Task 1 model answer requirements:
- EXACTLY 160–190 words
- Appropriate opening salutation for ${letter.style} letter
- 3 clear bullet point purposes addressed (mentioned or implied in the prompt)
- Appropriate closing
- Tone matches: ${letter.style === "informal" ? "friendly, conversational" : letter.style === "semi-formal" ? "polite but not stiff" : "formal, professional"}
- No bullet points in the actual letter — flowing paragraphs

TASK 2 — ESSAY on: "${task2Topic}" (test ${testNum}):
Use question type: "To what extent do you agree or disagree?" OR "Discuss both views and give your opinion"

Task 2 model answer requirements:
- EXACTLY 280–320 words
- Introduction: paraphrase + clear thesis
- Body paragraph 1: main argument with example
- Body paragraph 2: counter-argument or second point with example
- Body paragraph 3: your opinion with reasoning (if not in intro)
- Conclusion: restate position, no new ideas
- COMPLETE — do not end mid-sentence

Return ONLY the JSON. No extra text.`;
}

// ── Apply LLM output to existing file ────────────────────────────────────────
function applyToFile(testNum, existing, parsed, isGT) {
  const num3    = pad(testNum);
  const gtNum   = isGT ? pad(testNum - 30) : num3;
  const id      = isGT ? `ielts-writing-gt-${gtNum}` : `ielts-writing-${num3}`;
  const variant = isGT ? "general_training" : "academic";
  const q1      = existing.questions?.[0] || {};
  const q2      = existing.questions?.[1] || {};

  const t1 = parsed.task1 || {};
  const t2 = parsed.task2 || {};

  const newQ1 = {
    ...q1,
    id:           q1.id || `${id}-q01`,
    questionType: "writing_task",
    prompt:       t1.prompt || q1.prompt || "",
    type:         isGT ? "Task 1 Letter" : "Task 1",
    modelAnswer:  t1.modelAnswer || q1.modelAnswer || "",
    rubric:       q1.rubric || ["task response","organization","vocabulary","grammar","development"],
    difficulty:   q1.difficulty || "medium",
    topic:        q1.topic || "",
  };

  if (!isGT && t1.visual) newQ1.visual = t1.visual;
  if (isGT && t1.style)   newQ1.style  = t1.style;

  const newQ2 = {
    ...q2,
    id:           q2.id || `${id}-q02`,
    questionType: "writing_task",
    type:         "Task 2",
    prompt:       t2.prompt || q2.prompt || "",
    modelAnswer:  t2.modelAnswer || q2.modelAnswer || "",
    rubric:       q2.rubric || ["task response","organization","vocabulary","grammar","development"],
    difficulty:   q2.difficulty || "medium",
    topic:        q2.topic || "",
  };

  return {
    ...existing,
    id,
    variant,
    title: isGT
      ? `IELTS General Training Writing Practice Test ${testNum}`
      : `IELTS Academic Writing Practice Test ${testNum}`,
    questions: [newQ1, newQ2],
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
  let updated = 0, skipped = 0, errors = 0;

  for (let n = FROM; n <= TO; n++) {
    const isGT   = n >= 31;
    const num3   = pad(n);
    // GT uses gt-001..030.json naming; Academic uses test-001..030.json
    const gtNum  = isGT ? pad(n - 30) : num3;
    const fname  = isGT ? `gt-${gtNum}.json` : `test-${num3}.json`;
    const absPath = path.join(CONTENT, "ielts", "writing", fname);
    const relPath = `ielts/writing/${fname}`;

    if (!FORCE && tracker[relPath]) {
      if (fs.existsSync(absPath)) {
        const check = JSON.parse(fs.readFileSync(absPath, "utf8"));
        const q1    = check.questions?.[0] || {};
        const q2    = check.questions?.[1] || {};
        const t1ok  = (q1.modelAnswer || "").split(/\s+/).length >= 140;
        const t2ok  = (q2.modelAnswer || "").split(/\s+/).length >= 220;
        const visOk = isGT || !!q1.visual;
        if (t1ok && t2ok && visOk) {
          console.log(`  ⏭  Skip ${fname}`);
          skipped++; continue;
        }
        console.log(`  ⚠  Stale tracker for ${fname} — rebuilding (t1ok=${t1ok}, t2ok=${t2ok}, visOk=${visOk})`);
      }
    }

    console.log(`\n✍️  Rebuilding ${fname} (test ${n})…`);
    backupFile(absPath);

    const existing = fs.existsSync(absPath)
      ? JSON.parse(fs.readFileSync(absPath, "utf8"))
      : { id: `ielts-writing-${num3}`, exam: "ielts", section: "writing", type: "section",
          durationSeconds: 3600, questionCount: 2, instructions: "Complete both tasks.", questions: [{}, {}] };

    let newData = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`    Calling Gemini (attempt ${attempt})…`);
        const raw    = await postGenerate(isGT ? buildGTPrompt(n) : buildAcademicPrompt(n));
        const parsed = extractJSON(raw);

        if (!parsed.task1 || !parsed.task2) throw new Error("Missing task1 or task2");
        const t1words = (parsed.task1.modelAnswer || "").split(/\s+/).length;
        const t2words = (parsed.task2.modelAnswer || "").split(/\s+/).length;
        if (t1words < 100) throw new Error(`Task 1 model answer too short: ${t1words} words`);
        if (t2words < 200) throw new Error(`Task 2 model answer too short: ${t2words} words`);

        newData = applyToFile(n, existing, parsed, isGT);
        console.log(`    ✅  T1 ~${t1words}w, T2 ~${t2words}w${!isGT && newData.questions[0].visual ? ", visual ✓" : ""}`);
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

    if (!newData) continue;

    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, JSON.stringify(newData, null, 2));
    tracker[relPath] = { rebuilt: true, ts: Date.now() };
    saveTracker(tracker);
    updated++;

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n══════════════════════════════════════`);
  console.log(`✅  Done — ${updated} updated, ${skipped} skipped, ${errors} errors`);
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
