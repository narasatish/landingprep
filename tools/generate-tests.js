#!/usr/bin/env node
// generate-tests.js
//
// Authors original exam-style practice tests via the Gemini API and writes them
// to content/<exam>/<section>/test-NNN.json. Validates each generated question
// against an existing-questions fingerprint set to guarantee uniqueness across
// the full bank.
//
// Usage:
//   set GEMINI_API_KEY=AIza...        (or export on macOS/Linux)
//   node tools/generate-tests.js --exam ielts --section listening --count 5
//   node tools/generate-tests.js --exam gmat  --section quant     --count 30
//
// Notes:
// * The LLM is instructed to author ORIGINAL content from scratch following the
//   documented exam *pattern* (timings, instruction format, question types).
// * It is NOT given any copyrighted exam content as a source.
// * Each generated question is fingerprinted; duplicates and near-duplicates
//   are rejected and re-generated.

"use strict";

const fs = require("fs");
const path = require("path");
const { fingerprint, isNearDuplicate, passageFingerprint } = require("./fingerprint");

const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const MANIFEST_PATH = path.join(CONTENT, "manifest.json");
const FINGERPRINTS_PATH = path.join(CONTENT, ".fingerprints.json");

const MODEL = "gemini-2.0-flash-exp";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// ── CLI ────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
  }
  return args;
}

// ── Patterns (facts only, no copyrighted content) ──────────────────────
const PATTERNS = {
  ielts: {
    listening: {
      durationSec: 30 * 60,
      parts: 4,
      questionsPerPart: 10,
      sectionsBrief: [
        "Part 1: a social/transactional conversation between two speakers. Typically form/note completion with bulleted hierarchical labels. Instruction: 'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.'",
        "Part 2: a monologue in a social/community context (tour, announcement). Mix of 4 MCQ (A/B/C) and three multi-select clusters of 'Choose TWO letters A-E'.",
        "Part 3: an academic discussion between 2-4 students/tutor. 6 MCQ (A/B/C) followed by a matching task: match 4 items to options from a letter pool of 6.",
        "Part 4: an academic monologue/lecture. Note completion with hierarchical bullets. Instruction: 'Write ONE WORD ONLY for each answer.'"
      ],
      voicesByPart: ["UK female + UK male (conversational)", "UK female monologue", "Mixed 2-3 UK students", "Academic monologue"]
    },
    reading: {
      durationSec: 60 * 60,
      passages: 3,
      questionsPerPassage: [13, 13, 14],
      types: ["true_false_not_given","yes_no_not_given","matching_headings","matching_information","matching_features","sentence_completion","summary_completion","note_completion","multiple_choice","short_answer"]
    },
    writing: {
      durationSec: 60 * 60,
      tasks: [
        { id: "task1", minutes: 20, minWords: 150, brief: "Describe a chart/graph/table/map/process in 150+ words." },
        { id: "task2", minutes: 40, minWords: 250, brief: "Argumentative or discursive essay in 250+ words." }
      ]
    },
    speaking: {
      durationSec: 14 * 60,
      parts: [
        { id: "part1", brief: "Introduction + everyday topic questions (4-5 minutes)." },
        { id: "part2", brief: "Long turn / cue card. 1 min prep, 2 min talk." },
        { id: "part3", brief: "Abstract discussion related to Part 2 topic (4-5 minutes)." }
      ]
    }
  },
  toefl: {
    reading: { durationSec: 35*60, passages: 2, questionsPerPassage: 10, types: ["factual","negative_factual","inference","rhetorical_purpose","vocabulary","reference","sentence_simplification","insert_text","prose_summary"] },
    listening: { durationSec: 36*60, items: 5, brief: "2 conversations (~3min each, 5 Qs each) + 3 lectures (~3-5min each, 6 Qs each)." },
    speaking: { durationSec: 16*60, tasks: 4, brief: "1 independent + 3 integrated (read+listen+speak)." },
    writing: { durationSec: 29*60, tasks: 2, brief: "1 integrated (read+listen+write 150-225 words) + 1 academic discussion (100+ words)." }
  },
  gmat: {
    quant:        { durationSec: 45*60, count: 21, types: ["problem_solving"], topics: ["arithmetic","algebra","percent","ratio","probability","statistics","number_theory"] },
    verbal:       { durationSec: 45*60, count: 23, types: ["critical_reasoning","reading_comprehension"], crSubtypes: ["weaken","strengthen","assumption","inference","evaluate","resolve_paradox","conclusion"] },
    dataInsights: { durationSec: 45*60, count: 20, types: ["data_sufficiency","multi_source_reasoning","table_analysis","graphics_interpretation","two_part_analysis"] }
  },
  gre: {
    verbal: { durationSec: 41*60, count: 27, types: ["text_completion_1blank","text_completion_2blank","text_completion_3blank","sentence_equivalence","reading_comprehension","critical_reasoning"] },
    quant:  { durationSec: 47*60, count: 27, types: ["multiple_choice","quantitative_comparison","numeric_entry","multiple_answer"], topics: ["arithmetic","algebra","geometry","data_analysis"] },
    writing:{ durationSec: 30*60, count: 1, types: ["analyze_an_issue"] }
  },
  pte: {
    speakingWriting: { durationSec: 67*60, types: ["read_aloud","repeat_sentence","describe_image","retell_lecture","answer_short_question","summarize_written_text","write_essay"] },
    reading:         { durationSec: 30*60, types: ["fill_blanks_rw","multiple_choice_multiple","reorder_paragraphs","fill_blanks_reading","multiple_choice_single"] },
    listening:       { durationSec: 35*60, types: ["summarize_spoken_text","multiple_choice_multiple","fill_blanks","highlight_correct_summary","multiple_choice_single","select_missing_word","highlight_incorrect_words","write_from_dictation"] }
  },
  celpip: {
    listening: { durationSec: 47*60, parts: 6 },
    reading:   { durationSec: 55*60, parts: 4 },
    writing:   { durationSec: 53*60, tasks: ["email","survey"] },
    speaking:  { durationSec: 20*60, tasks: 8 }
  },
  duolingo: {
    literacy:      { brief: "Read & complete + read & select tasks (~10-15 items)." },
    comprehension: { brief: "Listen & type + interactive reading (~10-15 items)." },
    conversation:  { brief: "Interactive listening + speaking turns (~8-12 items)." },
    production:    { brief: "Writing sample (~5 min) + speaking sample (~3 min)." }
  }
};

// ── Prompt construction ────────────────────────────────────────────────
function buildPrompt(exam, section, testNumber, existingFingerprintCount) {
  const p = PATTERNS[exam]?.[section];
  if (!p) throw new Error(`No pattern defined for ${exam}/${section}`);

  const intro = `You are an expert exam content author for ${exam.toUpperCase()} ${section}. Author ORIGINAL practice content from scratch.

CRITICAL RULES:
- Do NOT reproduce or paraphrase any content from Cambridge, ETS, GMAC, Pearson, or other publishers.
- All passages, scripts, names, scenarios, places, characters, and questions must be entirely your own invention.
- Aim for the same difficulty, format, and structural patterns documented below, but with completely fresh content.
- Each answer must be correct and verifiable from the passage/script you author.
- Provide a one-sentence explanation for each question.

EXAM: ${exam.toUpperCase()}
SECTION: ${section}
TEST NUMBER: ${testNumber}
EXISTING TESTS IN BANK: ${existingFingerprintCount} (avoid topics/scenarios you may have seen before)

STRUCTURE / PATTERN FACTS (these are the official format, not copyrighted content):
${JSON.stringify(p, null, 2)}

OUTPUT FORMAT (strict JSON only, no markdown):
{
  "id": "${exam}-${section}-test-${String(testNumber).padStart(3, "0")}",
  "exam": "${exam}",
  "section": "${section}",
  "title": "...",
  "difficulty": "intermediate" | "advanced",
  "durationSec": ${p.durationSec || 1800},
  "parts": [
    {
      "partNum": 1,
      "context": "...",
      "audioScript": "...",        // ONLY for listening sections — multi-voice "Speaker: line" format
      "passage": { "title": "...", "text": "..." },  // ONLY for reading sections
      "questions": [
        {
          "id": "...",
          "num": 1,
          "type": "mcq" | "tfng" | "yng" | "fill" | "form_completion" | "mcq_multi" | "match_heading" | "matching" | "short_answer",
          "text": "...",
          "options": ["A. ...", "B. ..."],          // when applicable
          "answer": "B" | ["A","C"] | "string" | { "f1":"...", "f2":"..." },
          "explanation": "..."                        // 1-2 sentences
        }
      ]
    }
  ]
}

For each question, vary the type so the test demonstrates pattern diversity. Different tests in the bank should cover different topics — avoid repeating themes across consecutive tests.

Generate test number ${testNumber} now.`;

  return intro;
}

// ── Gemini API call ────────────────────────────────────────────────────
async function callGemini(prompt, apiKey) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 16000,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini ${res.status}: ${err.slice(0, 300)}`);
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty Gemini response");
  return JSON.parse(text);
}

// ── Validation + fingerprint dedup ────────────────────────────────────
function loadFingerprints() {
  if (!fs.existsSync(FINGERPRINTS_PATH)) return { questions: [], passages: [] };
  try { return JSON.parse(fs.readFileSync(FINGERPRINTS_PATH, "utf-8")); }
  catch { return { questions: [], passages: [] }; }
}
function saveFingerprints(fps) {
  fs.writeFileSync(FINGERPRINTS_PATH, JSON.stringify(fps, null, 2));
}

function validateAndFingerprint(test, existingFps) {
  const newQfps = [];
  const newPfps = [];
  for (const part of test.parts || []) {
    if (part.passage?.text) {
      const pfp = passageFingerprint(part.passage.text);
      if (existingFps.passages.includes(pfp)) {
        throw new Error("Duplicate passage detected — regenerating");
      }
      newPfps.push(pfp);
    }
    for (const q of part.questions || []) {
      q.fingerprint = fingerprint(q);
      if (isNearDuplicate(q, existingFps.questions.map(f => ({ fingerprint: f.fp, text: f.text || "" })))) {
        throw new Error(`Near-duplicate question detected: ${q.id}`);
      }
      newQfps.push({ fp: q.fingerprint, text: q.text });
    }
  }
  return { newQfps, newPfps };
}

// ── Main driver ────────────────────────────────────────────────────────
async function generate(exam, section, count) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Set GEMINI_API_KEY environment variable");

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
  const fps = loadFingerprints();

  const outDir = path.join(CONTENT, exam, section);
  fs.mkdirSync(outDir, { recursive: true });
  const existing = manifest.exams[exam].tests[section] || [];
  let nextNum = existing.length + 1;

  for (let i = 0; i < count; i++) {
    const testNum = nextNum + i;
    console.log(`→ Generating ${exam}/${section} test ${testNum}…`);

    let test, attempt = 0;
    while (attempt < 3) {
      try {
        const prompt = buildPrompt(exam, section, testNum, fps.questions.length);
        test = await callGemini(prompt, apiKey);
        const { newQfps, newPfps } = validateAndFingerprint(test, fps);
        fps.questions.push(...newQfps);
        fps.passages.push(...newPfps);
        break;
      } catch (e) {
        console.warn(`   attempt ${attempt + 1} failed: ${e.message}`);
        attempt++;
      }
    }
    if (!test) { console.error(`   skipped test ${testNum} after 3 attempts`); continue; }

    const file = `test-${String(testNum).padStart(3, "0")}.json`;
    fs.writeFileSync(path.join(outDir, file), JSON.stringify(test, null, 2));

    existing.push({
      id: test.id,
      title: test.title || `Test ${testNum}`,
      difficulty: test.difficulty || "intermediate",
      questionCount: (test.parts || []).reduce((s, p) => s + (p.questions || []).length, 0),
      duration: test.durationSec,
      file: `${exam}/${section}/${file}`,
      version: 1,
      createdAt: new Date().toISOString().slice(0, 10),
    });

    manifest.exams[exam].tests[section] = existing;
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    saveFingerprints(fps);

    console.log(`   ✓ wrote ${file}`);
    await new Promise(r => setTimeout(r, 1200)); // gentle rate limit
  }

  console.log(`\nDone. ${exam}/${section} bank now has ${manifest.exams[exam].tests[section].length} tests.`);
}

// ── Entry ──────────────────────────────────────────────────────────────
(async () => {
  const args = parseArgs();
  if (!args.exam || !args.section) {
    console.log(`Usage: node tools/generate-tests.js --exam <exam> --section <section> --count <n>`);
    console.log(`Exams: ${Object.keys(PATTERNS).join(", ")}`);
    process.exit(1);
  }
  await generate(args.exam, args.section, parseInt(args.count || "1", 10));
})().catch(e => { console.error(e); process.exit(1); });
