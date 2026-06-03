// gen-ielts-reading-v2.js — regenerate IELTS Academic Reading tests with the FULL real
// variety of question types (matching headings, T/F/NG, Y/N/NG, sentence/summary
// completion, multiple choice, short answer) — the old content had only 3 types.
// Consumes content/ielts/reading-bank-a.json + -b.json (12 passages, 14 Qs each).
// Each test = 3 distinct passages (14 + 13 + 13 = 40 questions, numbered 1-40, 3600s).
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "content", "ielts", "reading");
const NUM_TESTS = 60;
const TAKE = [14, 13, 13]; // per-passage question counts → 40 total

function die(m) { console.error("✗ " + m); process.exit(1); }
function load(f) { const p = path.join(ROOT, "content", "ielts", f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")).passages || [] : []; }
const PASSAGES = [...load("reading-bank-a.json"), ...load("reading-bank-b.json")];
// Build each test from one 14-question passage + two 13-question passages = exactly 40.
const P14 = PASSAGES.filter(p => (p.questions || []).length === 14);
const P13 = PASSAGES.filter(p => (p.questions || []).length === 13);
if (!P14.length || P13.length < 2) die(`need one 14-Q passage + two 13-Q passages; have ${P14.length}×14, ${P13.length}×13`);

const errors = [];
let written = 0;
for (let t = 0; t < NUM_TESTS; t++) {
  const num = String(t + 1).padStart(3, "0");
  const chosen = [ P14[t % P14.length], P13[(t * 2) % P13.length], P13[(t * 2 + 1) % P13.length] ];
  if (new Set(chosen).size !== 3) errors.push(`test-${num}: passage repeat within test`);
  const passages = [], questions = [];
  let qn = 0;
  chosen.forEach((p, pi) => {
    const pid = `ielts-reading-${num}-p${pi + 1}`;
    passages.push({ title: p.title, text: p.text, id: pid });
    const take = (p.questions || []);            // take ALL questions (14 + 13 + 13 = 40)
    // matching-headings group must be intact (it's first); the trimmed tail must be standalone
    for (const q of take) {
      qn++;
      const needsOpts = q.questionType === "matching_headings" || q.questionType === "multiple_choice";
      if (needsOpts && (!q.options || !q.options.includes(q.correctAnswer))) errors.push(`test-${num} q${qn} (${q.questionType}): correctAnswer not in options`);
      if (q.questionType === "true_false_not_given" && !/^(True|False|Not Given)$/.test(q.correctAnswer)) errors.push(`test-${num} q${qn}: bad TFNG answer '${q.correctAnswer}'`);
      if (q.questionType === "yes_no_not_given" && !/^(Yes|No|Not Given)$/.test(q.correctAnswer)) errors.push(`test-${num} q${qn}: bad YNG answer '${q.correctAnswer}'`);
      questions.push({
        id: `ielts-reading-${num}-q${String(qn).padStart(2, "0")}`,
        questionType: q.questionType,
        // Prefix matching-headings prompts ("Paragraph A") with the passage number so the
        // same paragraph label across 3 passages isn't flagged as a duplicate question text.
        question: q.questionType === "matching_headings" ? `Passage ${pi + 1} — ${q.question}` : q.question,
        // Also emit `prompt` — the normaliser reads prompt/sentenceText (not `question`) for
        // sentence/summary completion, so without it the fill-in blanks don't render.
        prompt: q.questionType === "matching_headings" ? `Passage ${pi + 1} — ${q.question}` : q.question,
        options: q.options || undefined, correctAnswer: q.correctAnswer,
        explanation: q.explanation || "", questionNumber: qn,
        passageIndex: pi, passageId: pid,
      });
    }
  });
  if (questions.length !== 40) errors.push(`test-${num}: ${questions.length} questions (need 40)`);

  const out = {
    id: `ielts-reading-${num}`, exam: "ielts", section: "reading", type: "section",
    title: `IELTS Academic Reading — Practice Test ${t + 1}`, variant: "academic",
    durationSeconds: 3600, questionCount: 40,
    instructions: "You should spend about 20 minutes on each passage. Answer all questions.",
    passages, questions,
  };
  fs.writeFileSync(path.join(OUT_DIR, `test-${num}.json`), JSON.stringify(out, null, 2));
  written++;
}

if (errors.length) { console.error(`\n✗ ${errors.length} validation errors:`); errors.slice(0, 30).forEach(e => console.error("  " + e)); process.exit(1); }
console.log(`✅ Regenerated ${written} IELTS reading tests — 3 passages, 40 questions (1-40) with full real type variety.`);
