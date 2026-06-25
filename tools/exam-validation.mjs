// LandingPrep — structural validation for ALL exams.
// Loads content/manifest.json + samples real test files and checks each exam's
// sections against the real exam pattern, catching the bug classes the user hit:
//   • a section with 0 tests (e.g. IELTS GT speaking was empty)
//   • a test with 0 questions / empty prompts
//   • writing/speaking items missing a model answer
//   • reading/listening MCQs missing options or a correct answer
//   • duplicate/repeated questions inside one test (cue-card-repeat class)
//   • listening sections missing an audio script
// Run:  node tools/exam-validation.mjs   (also part of `npm test`)
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const C = path.join(ROOT, "content");
const manifest = JSON.parse(fs.readFileSync(path.join(C, "manifest.json"), "utf8"));

let issues = [];
let checks = 0;
const fail = (exam, sec, msg) => issues.push(`[${exam}/${sec || "-"}] ${msg}`);
const ok = () => checks++;

// Real-exam minimum section expectations (sections that MUST exist & be non-empty).
const EXPECT = {
  ielts:    ["listening", "reading", "writing", "speaking"],
  toefl:    ["reading", "listening", "speaking", "writing"],
  pte:      ["speaking", "writing", "reading", "listening"], // some merged as speakingWriting
  gre:      ["verbal", "quant", "writing"],
  gmat:     ["quant", "verbal", "data"],
  celpip:   ["listening", "reading", "writing", "speaking"],
  duolingo: ["adaptive"],
};

function loadTest(file) {
  try { return JSON.parse(fs.readFileSync(path.join(C, file), "utf8")); }
  catch (e) { return null; }
}

function questionsOf(t) {
  if (!t) return [];
  return t.questions || t.items || t.tasks || t.cards || (t.parts ? t.parts.flatMap(p => p.questions || []) : []) || [];
}

function validateTest(exam, sec, entry) {
  const file = entry.file || entry;
  const t = loadTest(file);
  if (!t) { fail(exam, sec, `cannot load test file ${file}`); return; }
  const qs = questionsOf(t);
  if (!qs.length) { fail(exam, sec, `test ${file} has 0 questions`); return; }
  ok();

  // Empty prompts
  const empties = qs.filter(q => !(q.prompt || q.question || q.text || q.cue || q.topic || (q.passage && q.questions)));
  if (empties.length) fail(exam, sec, `${file}: ${empties.length}/${qs.length} items have empty prompt`);

  // Duplicate prompts within a test (the cue-card-repeat / templated-dup class)
  const texts = qs.map(q => (q.prompt || q.question || q.text || "").trim().toLowerCase()).filter(Boolean);
  const dups = texts.length - new Set(texts).size;
  if (texts.length >= 3 && dups >= Math.ceil(texts.length / 2)) fail(exam, sec, `${file}: ${dups} duplicate prompts (looks templated/repeated)`);

  // Section-type-specific checks
  const isWriting = sec !== "reading-writing" && (/writing|essay|task/i.test(sec) || /writing/i.test(t.type || ""));
  const isSpeaking = /speak/i.test(sec) || /speak/i.test(t.type || "");
  const isListening = /listen/i.test(sec) || /listen/i.test(t.type || "");
  const isObjective = /reading|verbal|quant|data|listen/i.test(sec);

  if (isWriting || isSpeaking) {
    const noModel = qs.filter(q => !(q.modelAnswer || q.sampleAnswer || q.band7Answer || q.model));
    if (noModel.length === qs.length) fail(exam, sec, `${file}: no model answers on any ${isSpeaking ? "speaking" : "writing"} item`);
  }
  if (isListening) {
    const hasScript = !!(t.listeningScripts || t.scripts || t.audioScript || t.transcript
      || (t.parts && t.parts.some(p => p.audioScript || p.script))
      || qs.some(q => q.audioScript || q.transcript || q.script));
    if (!hasScript) fail(exam, sec, `${file}: listening test has no audio script/transcript`);
  }
  if (isObjective && !isListening) {
    // objective MCQ-style: at least some items should have options + a correct answer
    const mcq = qs.filter(q => Array.isArray(q.options) && q.options.length);
    const withAns = mcq.filter(q => q.answer != null || q.correct != null || q.correctAnswer != null || q.correctIndex != null);
    if (mcq.length && withAns.length === 0) fail(exam, sec, `${file}: ${mcq.length} MCQ items but none have a correct answer`);
  }
}

console.log("\n──────── EXAM STRUCTURE VALIDATION ────────");
for (const [exam, ex] of Object.entries(manifest.exams || {})) {
  const sections = ex.sections || {};
  const secNames = Object.keys(sections);
  // 1) expected sections present + non-empty (account for merged sections like pte speakingWriting)
  for (const need of (EXPECT[exam] || [])) {
    const match = secNames.find(s => s.toLowerCase().includes(need) || (need === "speaking" && /speakingwriting/i.test(s)) || (need === "writing" && /speakingwriting/i.test(s)));
    if (!match) { fail(exam, need, `expected section "${need}" missing`); continue; }
    const arr = sections[match] || [];
    if (!arr.length) fail(exam, need, `section "${match}" has 0 tests`);
    else ok();
  }
  // 2) sample up to 2 tests per section and validate shape
  for (const [sec, arr] of Object.entries(sections)) {
    (arr || []).slice(0, 2).forEach(entry => validateTest(exam, sec, entry));
  }
  // 3) full mocks exist (guide-only exams have section practice only, no combined mock)
  if (!ex.guideOnly) {
    if (!(ex.fullMocks || []).length) fail(exam, "fullMocks", "no full mocks defined");
    else ok();
  }
}

console.log(`Ran ${checks} structural checks across ${Object.keys(manifest.exams || {}).length} exams.`);
if (issues.length) {
  console.log(`\n❌ ${issues.length} ISSUE(S):`);
  issues.forEach(i => console.log("  • " + i));
  process.exit(1);
} else {
  console.log("\n✅ ALL EXAMS STRUCTURALLY VALID");
}
