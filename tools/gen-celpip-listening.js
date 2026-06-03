// gen-celpip-listening.js — regenerate all 60 CELPIP General Listening tests with the
// correct real structure (6 parts: 8·5·6·5·8·6 = 38 MCQ) and distinct, full-length
// audio scripts. Consumes content/celpip/listening-bank.json (merged from bank-a/-b).
// Fixes: tests 31–60 had wrong part counts + invalid fill_in_the_blank items, and only
// ~13 distinct scripts were reused across all 60. Built-in validation throws on errors.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BANK = path.join(ROOT, "content", "celpip", "listening-bank.json");
const OUT_DIR = path.join(ROOT, "content", "celpip", "listening");
const NUM_TESTS = 60;

// Real CELPIP General Listening: part -> {title, description, pool key, question count}.
const PARTS = [
  { part: 1, title: "Problem Solving", pool: "problemSolving", n: 8, description: "A conversation in which one person has a problem and seeks help from another." },
  { part: 2, title: "Daily Life Conversation", pool: "dailyLife", n: 5, description: "An everyday conversation between two people." },
  { part: 3, title: "Listening for Information", pool: "information", n: 6, description: "An informational talk; listen for specific details." },
  { part: 4, title: "News Item", pool: "news", n: 5, description: "A short news report." },
  { part: 5, title: "Discussion", pool: "discussion", n: 8, description: "A discussion among people with different viewpoints." },
  { part: 6, title: "Viewpoints", pool: "viewpoints", n: 6, description: "A longer talk presenting one speaker's opinion and reasons." },
];

function die(m) { console.error("✗ " + m); process.exit(1); }
if (!fs.existsSync(BANK)) die("listening-bank.json not found — merge bank-a/-b first.");
const bank = JSON.parse(fs.readFileSync(BANK, "utf8"));
for (const p of PARTS) if (!Array.isArray(bank[p.pool]) || !bank[p.pool].length) die(`bank pool '${p.pool}' missing/empty`);

const errors = [];
let written = 0;
for (let t = 0; t < NUM_TESTS; t++) {
  const num = String(t + 1).padStart(3, "0");
  const parts = [], scripts = [], questions = [];
  let qNo = 0, qStart;
  for (const P of PARTS) {
    const pool = bank[P.pool];
    const sc = pool[t % pool.length];                          // distinct per part, rotates across tests
    const qs = sc.questions || [];
    if (qs.length !== P.n) errors.push(`test-${num} part${P.part}: ${qs.length} questions, expected ${P.n}`);
    if ((sc.script || "").length < 500) errors.push(`test-${num} part${P.part}: script too short (${(sc.script || "").length})`);
    const scriptId = `celpip-listening-${num}-s${P.part}`;
    scripts.push({ id: scriptId, part: P.part, sectionPart: P.part, title: sc.title || P.title, text: sc.script, audioUrl: "", internalVoiceConfig: { hidden: true } });
    qStart = qNo + 1;
    for (const q of qs) {
      qNo++;
      if (!q.options || q.options.length !== 4) errors.push(`test-${num} q${qNo}: not 4 options`);
      if (!q.options || !q.options.includes(q.correctAnswer)) errors.push(`test-${num} q${qNo}: correctAnswer not in options`);
      questions.push({
        id: `celpip-listening-${num}-q${String(qNo).padStart(2, "0")}`,
        audioScriptId: scriptId, questionType: "multiple_choice_single", part: P.part,
        prompt: q.prompt, options: q.options, correctAnswer: q.correctAnswer,
        explanation: q.explanation || "", difficulty: q.difficulty || "medium", topic: sc.topic || sc.title || "",
      });
    }
    parts.push({ part: P.part, title: P.title, questionRange: `${qStart}–${qNo}`, description: P.description });
  }
  if (questions.length !== 38) errors.push(`test-${num}: ${questions.length} questions total, expected 38`);
  if (new Set(scripts.map(s => s.text)).size !== scripts.length) errors.push(`test-${num}: duplicate script within test`);

  const out = {
    id: `celpip-listening-${num}`, exam: "celpip", section: "listening", type: "section",
    title: `CELPIP General Listening — Practice Test ${t + 1}`,
    durationSeconds: 3060, questionCount: questions.length,
    instructions: "Listen to the audio for each part and answer the questions. Each audio plays once.",
    parts, listeningScripts: scripts, questions,
  };
  fs.writeFileSync(path.join(OUT_DIR, `test-${num}.json`), JSON.stringify(out, null, 2));
  written++;
}

if (errors.length) { console.error(`\n✗ ${errors.length} validation errors:`); errors.slice(0, 30).forEach(e => console.error("  " + e)); process.exit(1); }
console.log(`✅ Regenerated ${written} CELPIP listening tests — 6 parts (8·5·6·5·8·6 = 38 MCQ), distinct full-length scripts.`);
