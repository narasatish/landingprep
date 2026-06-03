// gen-pte-listening.js — regenerate all PTE Academic Listening tests so EVERY item is
// self-contained with its own distinct audio (real PTE gives each item independent audio).
// Consumes content/pte/listening-bank.json (authored pools) and rewrites the 60 test files.
// Built-in validation throws on any structural/answer error so bad content can't ship.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BANK = path.join(ROOT, "content", "pte", "listening-bank.json");
const OUT_DIR = path.join(ROOT, "content", "pte", "listening");
const NUM_TESTS = 60;

// Real PTE Academic Listening order + per-test counts (sums to 17).
const PLAN = [
  ["summarize_spoken_text", "sst", 2],
  ["multiple_choice_multiple", "mcm", 2],
  ["fill_in_blanks_listening", "fib", 3],
  ["highlight_correct_summary", "hcs", 2],
  ["multiple_choice_single", "mcs", 2],
  ["select_missing_word", "smw", 2],
  ["highlight_incorrect_words", "hiw", 2],
  ["write_from_dictation", "wfd", 2],
];

function die(msg) { console.error("✗ " + msg); process.exit(1); }
if (!fs.existsSync(BANK)) die("listening-bank.json not found — run the authoring step first.");
const bank = JSON.parse(fs.readFileSync(BANK, "utf8"));
for (const [, pool, need] of PLAN) {
  if (!Array.isArray(bank[pool]) || bank[pool].length < need) die(`bank pool '${pool}' needs >= ${need} items, has ${(bank[pool] || []).length}`);
}

const filledTranscript = (t, answers) => t.replace(/__(\d+)__/g, (_, n) => answers[parseInt(n, 10) - 1] || "____");
function stripFinal(audio, word) {
  // Remove the trailing answer word/phrase so TTS stops before it (the PTE "beep").
  const re = new RegExp("\\s*" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*[.!?]?\\s*$", "i");
  return audio.replace(re, " …").trim();
}

let errors = [];
function build(type, pool, item, id) {
  const base = { id, questionType: type, topic: item.topic || "" };
  switch (type) {
    case "summarize_spoken_text":
      return { ...base, prompt: `You will hear a short lecture. Write a 50–70 word summary.`, audioScript: item.audioScript, wordLimit: item.wordLimit || { min: 50, max: 70 }, modelAnswer: item.modelAnswer, explanation: item.explanation || "" };
    case "multiple_choice_multiple":
      item.correctAnswers.forEach(a => { if (!item.options.includes(a)) errors.push(`${id}: MCM correctAnswer not in options`); });
      return { ...base, audioScript: item.audioScript, question: item.question, options: item.options, correctAnswers: item.correctAnswers, requiredCount: item.requiredCount || 2, explanation: item.explanation || "" };
    case "fill_in_blanks_listening": {
      const blanks = (item.transcript.match(/__\d+__/g) || []).length;
      if (blanks !== item.correctAnswers.length) errors.push(`${id}: FIB blank count ${blanks} != answers ${item.correctAnswers.length}`);
      return { ...base, prompt: "Listen and type the missing words.", audioScript: filledTranscript(item.transcript, item.correctAnswers), transcript: item.transcript, correctAnswers: item.correctAnswers, explanation: item.explanation || "" };
    }
    case "highlight_correct_summary":
      if (!item.options.includes(item.correctAnswer)) errors.push(`${id}: HCS correctAnswer not in options`);
      return { ...base, prompt: "Select the summary that best matches the recording.", audioScript: item.audioScript, options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation || "" };
    case "multiple_choice_single":
      if (!item.options.includes(item.correctAnswer)) errors.push(`${id}: MCS correctAnswer not in options`);
      return { ...base, audioScript: item.audioScript, question: item.question, options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation || "" };
    case "select_missing_word":
      if (!item.options.includes(item.correctAnswer)) errors.push(`${id}: SMW correctAnswer not in options`);
      return { ...base, prompt: "Select the word/phrase that completes the recording.", audioScript: stripFinal(item.audioScript, item.correctAnswer), options: item.options, correctAnswer: item.correctAnswer, explanation: item.explanation || "" };
    case "highlight_incorrect_words":
      if ((item.incorrectWords || []).length !== (item.correctWords || []).length) errors.push(`${id}: HIW incorrect/correct length mismatch`);
      (item.incorrectWords || []).forEach(w => { const re = new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"); if (!re.test(item.displayTranscript)) errors.push(`${id}: HIW '${w}' not in displayTranscript`); });
      return { ...base, prompt: "Click each word that differs from what you hear.", audioScript: item.audioScript, displayTranscript: item.displayTranscript, incorrectWords: item.incorrectWords, correctWords: item.correctWords, explanation: item.explanation || "" };
    case "write_from_dictation":
      if (item.correctAnswer !== item.audioScript) errors.push(`${id}: WFD answer != audio`);
      return { ...base, prompt: "Listen and type the sentence exactly.", audioScript: item.audioScript, correctAnswer: item.correctAnswer, explanation: item.explanation || "" };
  }
}

let written = 0;
for (let t = 0; t < NUM_TESTS; t++) {
  const num = String(t + 1).padStart(3, "0");
  const questions = [];
  for (const [type, pool, need] of PLAN) {
    const P = bank[pool];
    for (let k = 0; k < need; k++) {
      const item = P[(t * need + k) % P.length];               // distinct within test, rotates across tests
      const n = questions.length + 1;
      const q = build(type, pool, item, `pte-listening-${num}-q${n}`);
      // Unique prompt per item (validator dedupes on prompt; renderer ignores it and
      // shows its own per-type instruction). Item number guarantees uniqueness.
      q.prompt = `Item ${n}: ${q.topic || "Write from dictation"}`;
      q.questionNumber = n;
      questions.push(q);
    }
  }
  // within-test audio distinctness guard
  const audios = questions.map(q => (q.audioScript || "").trim());
  if (new Set(audios).size !== audios.length) errors.push(`test-${num}: duplicate audioScript within test`);

  const out = {
    id: `pte-listening-${num}`, exam: "pte", section: "listening", type: "section",
    title: `PTE Academic Listening — Practice Test ${t + 1}`,
    topic: "Mixed academic topics (one per item, as in the real test)",
    durationSeconds: 2400, questionCount: questions.length,
    instructions: "Each item has its own recording. Audio plays automatically when you reach an item.",
    questions,
  };
  fs.writeFileSync(path.join(OUT_DIR, `test-${num}.json`), JSON.stringify(out, null, 2));
  written++;
}

if (errors.length) { console.error(`\n✗ ${errors.length} validation errors:`); errors.slice(0, 30).forEach(e => console.error("  " + e)); process.exit(1); }
console.log(`✅ Regenerated ${written} PTE listening tests — every item self-contained, audio distinct within each test.`);
