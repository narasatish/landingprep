#!/usr/bin/env node
// tools/rebuild-ielts-listening.js
// Generates/rebuilds IELTS Listening tests.
//
// Academic (001–030): 4 parts × 10 Q each = 40 Q, each script 400–650 words
// General Training (031–060): same structure, everyday/community topics
//
// Requires server.js running: node server.js
//
// Usage:
//   node tools/rebuild-ielts-listening.js [--from 31] [--to 60] [--force]
//   node tools/rebuild-ielts-listening.js --from 1 --to 30   # academic
"use strict";

const fs   = require("fs");
const path = require("path");
const http = require("http");

const ROOT    = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const BACKUP  = path.join(ROOT, ".backup", "ielts-listening");
const TRACKER = path.join(ROOT, ".rebuild-listening-tracker.json");
const SERVER  = "http://localhost:3001";

const args  = process.argv.slice(2);
const FROM  = parseInt(args[args.indexOf("--from") + 1] || "31", 10);
const TO    = parseInt(args[args.indexOf("--to")   + 1] || "60", 10);
const FORCE = args.includes("--force");

function pad(n) { return String(n).padStart(3, "0"); }
function loadTracker() { try { return JSON.parse(fs.readFileSync(TRACKER, "utf8")); } catch { return {}; } }
function saveTracker(t) { fs.writeFileSync(TRACKER, JSON.stringify(t, null, 2)); }
function backupFile(fp) {
  fs.mkdirSync(BACKUP, { recursive: true });
  const rel = path.relative(path.join(CONTENT, "ielts", "listening"), fp);
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
    req.setTimeout(150_000, () => { req.destroy(); reject(new Error("timeout")); });
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
const ACADEMIC_TOPICS = [
  ["Postgraduate accommodation enquiry", "University library renovation tour", "Discussion about a psychology dissertation", "Lecture: The history of urban farming"],
  ["Language school registration call", "Campus sports facilities talk", "Seminar on climate change research methods", "Lecture: Migration patterns of Arctic birds"],
  ["Student healthcare centre enquiry", "Town heritage walking tour", "Academic discussion: sustainable packaging", "Lecture: The development of antibiotics"],
  ["Part-time job application call", "Nature reserve guided tour information", "Project discussion: renewable energy", "Lecture: Ancient Mesopotamian trade"],
  ["International student orientation call", "Museum exhibition tour guide talk", "Research group meeting: AI ethics", "Lecture: Deep-sea hydrothermal vents"],
  ["Fitness centre membership enquiry", "Community garden open day talk", "Seminar: Gender and workplace equality", "Lecture: Cognitive load theory"],
  ["Driving school booking enquiry", "Science centre exhibition talk", "Discussion: social media research project", "Lecture: The Silk Road"],
  ["Dental appointment enquiry call", "Botanical garden tour", "Academic discussion: urban inequality", "Lecture: Coral reef bleaching"],
  ["Library card registration", "Historical docklands tour", "Research meeting: language acquisition", "Lecture: Plate tectonics"],
  ["Photography course enquiry", "Wildlife sanctuary information session", "Seminar discussion: behavioural economics", "Lecture: The human microbiome"],
  ["Yoga class booking", "Coastal erosion field trip briefing", "Discussion: architecture dissertation", "Lecture: Neuroplasticity in adults"],
  ["Cooking class enquiry", "Archaeological dig site tour", "Academic discussion: e-waste and recycling", "Lecture: Wetland ecosystems"],
  ["Gym personal trainer enquiry", "City art gallery talk", "Research discussion: food security", "Lecture: History of vaccination"],
  ["Evening class enrolment call", "Castle tour guide talk", "Seminar: globalisation and culture", "Lecture: Ocean acidification"],
  ["Swimming lesson booking", "Planetarium talk", "Discussion: engineering thesis project", "Lecture: Permafrost and climate change"],
  ["Music lesson enquiry", "National park ranger talk", "Research meeting: immigration integration", "Lecture: Sleep science and memory"],
  ["Childcare centre enquiry", "Farmer's market tour information", "Seminar: consumer psychology", "Lecture: History of the printing press"],
  ["Career counselling appointment", "Urban cycling route information talk", "Discussion: environmental law project", "Lecture: Quantum computing basics"],
  ["Insurance claim enquiry", "Rainforest conservation briefing", "Research discussion: fintech innovation", "Lecture: Extremophiles"],
  ["Dental practice registration call", "Geology field trip introduction", "Academic discussion: smart city planning", "Lecture: The evolution of money"],
  ["Tutoring service enquiry", "Marine reserve diving centre talk", "Seminar: public health communication", "Lecture: Industrial Revolution outcomes"],
  ["Community college enrolment", "Butterfly sanctuary information", "Discussion: sustainable tourism research", "Lecture: Psychology of decision making"],
  ["Online course registration call", "Volcano national park ranger talk", "Academic discussion: digital privacy", "Lecture: Tidal energy systems"],
  ["Sports injury clinic booking", "City walking food tour information", "Research meeting: mental health in teens", "Lecture: Soil carbon sequestration"],
  ["Accountancy firm enquiry", "Science museum planetarium talk", "Seminar: workplace automation", "Lecture: History of the compass"],
  ["Optician appointment booking", "Heritage railway tour", "Discussion: migration and housing", "Lecture: Arctic food web"],
  ["Language exchange programme", "Wildlife photography workshop intro", "Research meeting: nutrition science", "Lecture: Bioluminescence"],
  ["Mortgage advice enquiry", "Community art project information", "Seminar: gig economy rights", "Lecture: Ancient Roman engineering"],
  ["Holiday booking enquiry", "Astronomy club public talk", "Academic discussion: cryptocurrency", "Lecture: Freshwater scarcity"],
  ["Dental bridge appointment", "Coastal bird watching reserve talk", "Research discussion: childhood obesity", "Lecture: History of the census"],
];

const GT_TOPICS = [
  ["Renting a flat enquiry call", "Community centre activities information talk", "Discussion about a work volunteering project", "Documentary-style talk: how coffee became global"],
  ["Sports club membership enquiry", "Local recycling centre tour information", "Workplace meeting: improving staff wellbeing", "Talk: history of public parks"],
  ["Childcare centre registration call", "Neighbourhood watch open day talk", "Colleagues discussing a charity fundraiser", "Documentary talk: how supermarkets changed eating"],
  ["Gym membership enquiry", "Library services and new features talk", "Meeting: planning a community festival", "Talk: the rise of the sharing economy"],
  ["Medical centre registration call", "Farmers' market information talk", "Work meeting: digital skills training plan", "Talk: how minimum wage laws developed"],
  ["Bank account opening enquiry", "Heritage trail guided tour talk", "Discussion: designing a new staff induction", "Talk: history of public libraries"],
  ["Driving lesson booking", "Community garden information session", "Colleagues planning a workplace survey", "Talk: why cities grew in the 20th century"],
  ["Dental clinic appointment enquiry", "Local food bank volunteer briefing", "Work discussion: flexible working options", "Talk: how radio transformed communication"],
  ["Insurance quote enquiry", "Town council planning information talk", "Meeting: reviewing a customer service process", "Talk: the history of the post office"],
  ["Home internet service enquiry", "Charity shop volunteer orientation", "Colleagues discussing a recycling initiative", "Talk: how trade unions changed labour rights"],
  ["Utility company billing enquiry", "Walking club route information talk", "Work meeting: mental health support policy", "Talk: history of public health campaigns"],
  ["Housing association tenancy enquiry", "Nature reserve ranger information talk", "Colleagues planning a team training day", "Talk: the development of food safety laws"],
  ["Car service booking call", "Museum volunteer briefing talk", "Work meeting: remote working guidelines", "Talk: history of the telephone"],
  ["Swimming pool membership enquiry", "Community notice board events talk", "Discussion: improving shift scheduling", "Talk: how newspapers evolved"],
  ["Veterinary clinic registration", "Senior citizens' centre activities talk", "Work meeting: developing a mentoring scheme", "Talk: why people moved to cities"],
  ["Optician appointment enquiry", "Local sports club coaching talk", "Colleagues reviewing a customer feedback system", "Talk: history of cinemas"],
  ["Adult education enrolment call", "Allotment society information session", "Meeting: planning a workplace diversity event", "Talk: the rise of food delivery apps"],
  ["Travel agent booking enquiry", "Cycling club route information talk", "Work discussion: revising the grievance procedure", "Talk: why the census matters"],
  ["Language class booking call", "Historical society lecture night talk", "Colleagues designing a staff wellbeing survey", "Talk: the history of the supermarket"],
  ["Personal trainer enquiry", "Community education programme talk", "Work meeting: updating IT security policy", "Talk: how recycling became mainstream"],
  ["Plumber booking enquiry", "Coastal path walking information talk", "Discussion: planning a community fundraiser", "Talk: the history of the welfare state"],
  ["Accommodation agency enquiry", "Astronomy club public events talk", "Work meeting: reviewing parental leave policy", "Talk: how zoning shapes neighbourhoods"],
  ["Garden centre product enquiry", "Local election information meeting", "Colleagues planning a training workshop", "Talk: the history of the minimum wage"],
  ["Council tax enquiry call", "Community orchard volunteer briefing", "Work discussion: updating expense procedures", "Talk: how adult literacy programmes started"],
  ["Estate agent property enquiry", "Wildlife trust volunteer orientation", "Meeting: improving onboarding for new staff", "Talk: why urban gardens matter"],
  ["Pharmacy prescription enquiry", "Leisure centre programme information", "Colleagues discussing a new appraisal system", "Talk: history of public transport"],
  ["Electrical store product enquiry", "City walking tour guide talk", "Work meeting: social media policy update", "Talk: how the co-operative movement grew"],
  ["Dentist registration call", "Community bee-keeping club information", "Discussion: updating the workplace code of conduct", "Talk: the history of the credit union"],
  ["Car insurance enquiry call", "Neighbourhood improvement scheme talk", "Work meeting: revising overtime rules", "Talk: how food banks developed"],
  ["Pet adoption centre enquiry", "Local arts festival volunteer briefing", "Colleagues discussing a green commuting plan", "Talk: the rise of the wellness industry"],
];

// ── Build prompt ──────────────────────────────────────────────────────────────
function buildPrompt(testNum) {
  const isGT = testNum >= 31;
  const topics = isGT
    ? GT_TOPICS[(testNum - 31) % GT_TOPICS.length]
    : ACADEMIC_TOPICS[(testNum - 1) % ACADEMIC_TOPICS.length];

  const [t1, t2, t3, t4] = topics;

  return `You are generating an IELTS ${isGT ? "General Training" : "Academic"} Listening practice test. Test number: ${testNum}.

Generate a complete IELTS Listening test as a single JSON object with this EXACT structure:

{
  "parts": [
    {
      "part": 1,
      "title": "...",
      "script": "...",
      "questions": [...]
    },
    {
      "part": 2,
      "title": "...",
      "script": "...",
      "questions": [...]
    },
    {
      "part": 3,
      "title": "...",
      "script": "...",
      "questions": [...]
    },
    {
      "part": 4,
      "title": "...",
      "script": "...",
      "questions": [...]
    }
  ]
}

PART TOPICS (use these exactly):
- Part 1: "${t1}"
- Part 2: "${t2}"
- Part 3: "${t3}"
- Part 4: "${t4}"

PART REQUIREMENTS:

PART 1 — Conversation between TWO speakers (everyday social/transactional context):
- Script: 450–600 words. A phone call or face-to-face service enquiry. Speakers labeled "Speaker A" and "Speaker B".
- Questions: EXACTLY 10, all form_completion or note_completion type.
- Write ONE WORD AND/OR A NUMBER for each. Answers must be explicitly stated in the script (name, date, number, item, place).
- Format each question as a form field: "Customer name: ________" with correctAnswer being the word/number said.

PART 2 — Monologue by ONE speaker (informational talk, tour, or announcement):
- Script: 500–650 words. A guide, officer, or presenter giving information.
- Questions: EXACTLY 10 — mix of:
  * 4–5 multiple_choice questions (options A/B/C only, pick ONE)
  * 3–4 matching questions (match item to category from a list, e.g. which area has which feature; options list has 5–6 items labeled A–E/F)
  * 1–2 map_labelling or sentence_completion
- Include the phrase "Now you will hear Part 2" at the start of the script.

PART 3 — Conversation between TWO OR THREE speakers (academic/professional discussion):
- Script: 550–700 words. Students or colleagues discussing a project, research, or work topic.
- Questions: EXACTLY 10 — mix of:
  * 4 multiple_choice (choose ONE from A/B/C)
  * 3 multiple_choice_choose_two (choose TWO answers from A–E; correctAnswer is array like ["A","C"])
  * 3 matching (match statements to speakers or categories)
- Include the phrase "Now you will hear Part 3" at the start.

PART 4 — Academic monologue/lecture by ONE speaker:
- Script: 550–650 words. A university lecturer or expert giving a talk.
- Questions: EXACTLY 10 — mix of:
  * 5–6 note_completion or flowchart_completion (one word or number per blank)
  * 4–5 multiple_choice (A/B/C, choose one)
- Include "Now you will hear Part 4" at start.

QUESTION FORMAT (for each question in the "questions" array):
{
  "questionNumber": <1–40>,
  "questionType": "form_completion" | "note_completion" | "multiple_choice" | "multiple_choice_choose_two" | "matching" | "sentence_completion" | "flowchart_completion" | "map_labelling",
  "instructions": "...",
  "prompt": "...",
  "options": [...],   // empty array [] for completion types
  "correctAnswer": "..." or ["...","..."] for choose_two,
  "explanation": "Quote or paraphrase the exact script line that confirms the answer."
}

CRITICAL RULES:
1. Question numbers run 1–40 continuously across all 4 parts (Part 1: Q1–10, Part 2: Q11–20, Part 3: Q21–30, Part 4: Q31–40)
2. Every answer MUST be clearly verifiable in the script — quote it in the explanation
3. For multiple_choice: options array contains ["A. ...", "B. ...", "C. ..."] and correctAnswer is "A", "B", or "C"
4. For multiple_choice_choose_two: options has 5 items ["A. ...", ..., "E. ..."] and correctAnswer is ["A","C"] style
5. For matching: options is the list of categories ["A. ...", "B. ...", "C. ...", "D. ...", "E. ..."] and correctAnswer is the letter
6. For completion types: options is [] and correctAnswer is the exact word(s)/number from the script (max 3 words)
7. Part 1 must NOT have multiple_choice — only completion types
8. Each script must end with "That is the end of Part [N]."
9. Do NOT repeat questions across parts
10. The total questions array across all 4 parts must be exactly 40

Return ONLY the JSON object. No text before or after.`;
}

// ── Build test JSON from parsed LLM output ────────────────────────────────────
function buildTestJSON(testNum, parsed) {
  const isGT   = testNum >= 31;
  const num3   = pad(testNum);
  const id     = `ielts-listening-${num3}`;
  const variant = isGT ? "general_training" : "academic";

  const questionGroups = [];
  const listeningScripts = [];
  const questions = [];

  for (const p of (parsed.parts || [])) {
    const part  = p.part;
    const sId   = `${id}-s${part}`;
    const qStart = (part - 1) * 10 + 1;
    const qEnd   = part * 10;

    questionGroups.push({
      part,
      title:         p.title || `Section ${part}`,
      questionRange: `${qStart}-${qEnd}`,
      pattern:       getPattern(part, p.questions),
      scriptId:      sId,
    });

    listeningScripts.push({
      id:                sId,
      sectionPart:       part,
      title:             p.title || `Section ${part}`,
      script:            p.script || "",
      audioUrl:          "",
      internalVoiceConfig: { hidden: true },
    });

    for (const q of (p.questions || [])) {
      const qNum = q.questionNumber || (questions.length + 1);
      questions.push({
        id:           `${id}-q${String(qNum).padStart(2, "0")}`,
        part,
        audioScriptId: sId,
        questionType: q.questionType || "form_completion",
        instructions: q.instructions || "Write ONE WORD AND/OR A NUMBER.",
        prompt:       q.prompt       || "",
        options:      q.options      || [],
        correctAnswer: q.correctAnswer || "",
        explanation:  q.explanation  || "",
        difficulty:   q.difficulty   || "medium",
        topic:        (p.title || "").toLowerCase().slice(0, 40),
      });
    }
  }

  return {
    id,
    exam:            "ielts",
    section:         "listening",
    type:            "section",
    variant,
    title:           `IELTS ${isGT ? "General Training" : "Academic"} Listening Practice Test ${testNum}`,
    durationSeconds: 1800,
    questionCount:   questions.length,
    instructions:    "You will hear four parts. Answer all 40 questions. You may write on the question paper, but you must transfer your answers to the answer sheet at the end.",
    questionGroups,
    listeningScripts,
    questions,
  };
}

function getPattern(part, qs = []) {
  const types = [...new Set((qs || []).map(q => q.questionType))];
  if (part === 1) return "form_completion";
  if (part === 2) return types.includes("matching") ? "multiple_choice_plus_matching" : "multiple_choice";
  if (part === 3) return "multiple_choice_choose_two_matching";
  return "note_completion_plus_mcq";
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  // Health check
  await new Promise((resolve, reject) => {
    const req = http.get(`${SERVER}/api/health`, (res) => {
      let raw = "";
      res.on("data", d => (raw += d));
      res.on("end", () => {
        try {
          const j = JSON.parse(raw);
          if (!j.hasKey) { reject(new Error("Server has no API key")); return; }
          console.log("✅  Server OK");
          resolve();
        } catch { reject(new Error("Bad health response")); }
      });
    });
    req.on("error", () => reject(new Error("server.js not running on port 3001. Run: node server.js")));
    req.setTimeout(5000, () => { req.destroy(); reject(new Error("timeout")); });
  });

  const tracker = loadTracker();
  let created = 0, skipped = 0, errors = 0;

  for (let n = FROM; n <= TO; n++) {
    const num3    = pad(n);
    const fname   = `test-${num3}.json`;
    const absPath = path.join(CONTENT, "ielts", "listening", fname);
    const relPath = `ielts/listening/${fname}`;

    // Skip check
    if (!FORCE && tracker[relPath]) {
      if (fs.existsSync(absPath)) {
        const check = JSON.parse(fs.readFileSync(absPath, "utf8"));
        const scripts = check.listeningScripts || [];
        const minWords = Math.min(...scripts.map(s => (s.script || "").split(/\s+/).length));
        if ((check.questions?.length || 0) >= 38 && minWords >= 350) {
          console.log(`  ⏭  Skip ${fname}`);
          skipped++; continue;
        }
        console.log(`  ⚠  Stale tracker for ${fname} — rebuilding`);
      }
    }

    console.log(`\n🎧  Rebuilding ${fname} (test ${n})…`);
    backupFile(absPath);

    let testJSON = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`    Calling Gemini (attempt ${attempt})…`);
        const raw    = await postGenerate(buildPrompt(n));
        const parsed = extractJSON(raw);

        if (!parsed.parts || parsed.parts.length < 4) throw new Error(`Only ${parsed.parts?.length || 0} parts`);
        const totalQ = parsed.parts.reduce((s, p) => s + (p.questions?.length || 0), 0);
        if (totalQ < 30) throw new Error(`Only ${totalQ} total questions`);

        testJSON = buildTestJSON(n, parsed);
        console.log(`    ✅  ${testJSON.questions.length} questions, ${testJSON.listeningScripts.length} scripts`);
        break;
      } catch (err) {
        console.warn(`    ⚠  Attempt ${attempt} failed: ${err.message}`);
        if (attempt === 3) {
          console.error(`    ❌  Giving up on ${fname}`);
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
  console.log(`✅  Done — ${created} created, ${skipped} skipped, ${errors} errors`);
}

main().catch(err => { console.error("Fatal:", err.message); process.exit(1); });
