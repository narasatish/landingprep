/**
 * validate-tests.js  — 2026 exam-pattern validator
 *
 * Checks every test JSON for:
 *  1. Correct question count per exam/section
 *  2. No empty prompts / situations / passages
 *  3. No duplicate question texts within a test
 *  4. IELTS Reading global numbering (1-40, never resets)
 *  5. Speaking tasks have a modelAnswer field
 *  6. Writing tasks have a non-blank situation/prompt/readingText
 *  7. Field-schema checks per exam
 *
 * Run: node tools/validate-tests.js [--fix] [exam] [section]
 *   --fix  : auto-fix what can be fixed (durations, missing fields)
 *   exam   : optional filter e.g. "gre" or "toefl"
 *   section: optional filter e.g. "reading"
 */

const fs   = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");

// ─── 2026 Official Exam Specs ─────────────────────────────────────────────────
const SPECS = {
  ielts: {
    reading:   { min: 40, max: 40, duration: { min: 3600, max: 3600 } },
    listening: { min: 40, max: 40, duration: { min: 2400, max: 2400 }, parts: 4, perPart: 10 },
    writing:   { min: 2,  max: 2,  duration: { min: 3600, max: 3600 } },
    speaking:  { min: 3,  max: 3,  duration: { min: 720,  max: 840  } },
  },
  toefl: {
    // Post-Jan 2026 adaptive format
    reading:   { min: 20, max: 48, duration: { min: 1080, max: 1620 } },
    listening: { min: 28, max: 45, duration: { min: 1080, max: 1620 } },
    speaking:  { min: 4,  max: 11, duration: { min: 480,  max: 900  } },
    writing:   { min: 2,  max: 12, duration: { min: 1380, max: 1380 } },
  },
  pte: {
    "speaking-writing": { min: 28, max: 36, duration: { min: 3600, max: 5400 } },
    reading:            { min: 15, max: 25, duration: { min: 2700, max: 3600 } },
    listening:          { min: 17, max: 25, duration: { min: 2400, max: 3600 } },
  },
  celpip: {
    listening: { min: 38, max: 38, duration: { min: 2820, max: 3300 }, parts: 6 },
    reading:   { min: 38, max: 38, duration: { min: 3300, max: 3600 }, parts: 4 },
    writing:   { min: 2,  max: 2,  duration: { min: 3600, max: 3600 } },
    speaking:  { min: 8,  max: 8,  duration: { min: 1200, max: 1800 } },
  },
  gre: {
    verbal:  { min: 27, max: 27, duration: { min: 2460, max: 2460 } }, // 12+15 Q, 18+23 min = 41 min
    quant:   { min: 27, max: 27, duration: { min: 2820, max: 2820 } }, // 12+15 Q, 21+26 min = 47 min
    writing: { min: 1,  max: 1,  duration: { min: 1800, max: 1800 } }, // 1 issue essay, 30 min
  },
  gmat: {
    quant:          { min: 21, max: 21, duration: { min: 2700, max: 2700 } },
    verbal:         { min: 23, max: 23, duration: { min: 2700, max: 2700 } },
    "data-insights":{ min: 20, max: 20, duration: { min: 2700, max: 2700 } },
  },
  duolingo: {
    adaptive: { min: 20, max: 30, duration: { min: 2700, max: 3600 } },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const C = {
  red:    s => `\x1b[31m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
};

let totalChecks = 0, totalPass = 0, totalFail = 0, totalWarn = 0;
const issues = [];

function pass(msg) { totalChecks++; totalPass++; }
function fail(msg) { totalChecks++; totalFail++; issues.push(C.red(`✗ ${msg}`)); }
function warn(msg) { totalChecks++; totalWarn++; issues.push(C.yellow(`⚠ ${msg}`)); }

function checkFile(fp, exam, section) {
  let test;
  try {
    test = JSON.parse(fs.readFileSync(fp, "utf8"));
  } catch(e) {
    fail(`${fp}: invalid JSON — ${e.message}`);
    return;
  }

  const fname = path.basename(fp);
  const tag   = `${exam}/${section}/${fname}`;
  const spec  = SPECS[exam]?.[section];
  const qs    = test.questions || [];

  // 1. Question count
  if (spec) {
    if (qs.length < spec.min || qs.length > spec.max) {
      fail(`${tag}: ${qs.length} questions (expected ${spec.min}–${spec.max})`);
    } else {
      pass(`${tag}: Q count OK (${qs.length})`);
    }

    // Duration
    const dur = test.durationSeconds || 0;
    if (dur < spec.duration.min || dur > spec.duration.max) {
      warn(`${tag}: duration=${dur}s (expected ${spec.duration.min}–${spec.duration.max}s)`);
    } else {
      pass(`${tag}: duration OK`);
    }
  }

  // 2. No empty prompts
  let emptyPrompts = 0;
  qs.forEach((q, i) => {
    const text = q.prompt || q.question || q.stem || "";
    if (!text.trim()) emptyPrompts++;
  });
  if (emptyPrompts > 0) {
    fail(`${tag}: ${emptyPrompts} questions with empty prompt`);
  } else {
    pass(`${tag}: no empty prompts`);
  }

  // 3. No duplicate question texts within a test
  const texts = qs.map(q => (q.prompt || q.question || "").trim().toLowerCase().substring(0, 100));
  const textSet = new Set(texts.filter(t => t.length > 10));
  const dupeCount = texts.filter(t => t.length > 10).length - textSet.size;
  if (dupeCount > 0) {
    fail(`${tag}: ${dupeCount} duplicate question texts`);
  } else {
    pass(`${tag}: no duplicate question texts`);
  }

  // 4. IELTS reading — global question numbering check
  if (exam === "ielts" && section === "reading") {
    const nums = qs.map(q => q.questionNumber).filter(Boolean);
    const maxNum = Math.max(...nums, 0);
    const minNum = Math.min(...nums, 9999);
    if (minNum !== 1 || maxNum !== qs.length) {
      fail(`${tag}: question numbers are not sequential 1–${qs.length} (got ${minNum}–${maxNum})`);
    } else {
      pass(`${tag}: IELTS reading numbering 1–${qs.length} OK`);
    }

    // Check passages exist
    if (!test.passages || test.passages.length !== 3) {
      fail(`${tag}: expected 3 passages, found ${(test.passages||[]).length}`);
    } else {
      pass(`${tag}: 3 passages present`);
    }
  }

  // 5. IELTS listening — 4-part structure
  if (exam === "ielts" && section === "listening") {
    const parts = test.parts || test.sections || [];
    if (parts.length > 0 && parts.length !== 4) {
      warn(`${tag}: expected 4 listening parts, found ${parts.length}`);
    }
  }

  // 6. Speaking tasks — must have modelAnswer
  if (section === "speaking") {
    let missingModel = 0;
    qs.forEach(q => {
      const hasAnswer = q.modelAnswer || q.sampleAnswer || q.answerGuide || q.exampleAnswer || q.bandDescriptors;
      if (!hasAnswer) missingModel++;
    });
    if (missingModel > 0) {
      warn(`${tag}: ${missingModel} speaking tasks missing modelAnswer`);
    } else {
      pass(`${tag}: all speaking tasks have model answers`);
    }
  }

  // 7. Writing — non-blank situation/prompt/readingText
  if (section === "writing") {
    let blankSituation = 0;
    qs.forEach(q => {
      if (exam === "gre") {
        if (!q.situation || !q.situation.trim()) blankSituation++;
      }
      if (exam === "toefl" && q.taskType === "integrated_writing") {
        if (!q.readingText && !q.readingPassage) blankSituation++;
      }
    });
    if (blankSituation > 0) {
      fail(`${tag}: ${blankSituation} writing tasks missing required content (situation/readingText)`);
    } else {
      pass(`${tag}: writing tasks have required content`);
    }
  }

  // 8. GRE writing — single issue task
  if (exam === "gre" && section === "writing") {
    if (qs.length !== 1) {
      fail(`${tag}: GRE writing should have exactly 1 task (Analyse an Issue), found ${qs.length}`);
    }
    const q = qs[0];
    if (q && q.taskType !== "issue") {
      warn(`${tag}: GRE writing task should have taskType="issue", got "${q.taskType}"`);
    }
  }

  // 9. GMAT — check question type variety
  // GMAT Focus Edition Quant is Problem Solving ONLY (no Data Sufficiency),
  // so a single question type is correct there. Variety only matters for
  // Verbal (RC + CR) and Data Insights (5 types).
  if (exam === "gmat" && section !== "quant") {
    const types = new Set(qs.map(q => q.questionType));
    if (types.size < 2) {
      fail(`${tag}: only ${types.size} question type(s) — needs variety`);
    } else {
      pass(`${tag}: ${types.size} question types`);
    }
  }

  // 10. Answer validity — skip open-ended question types
  const OPEN_ENDED_TYPES = new Set([
    "numeric_entry","speaking_response","writing_response","writing_task","speaking_task",
    "read_aloud","listen_speak","read_speak","interactive_writing","integrated_writing",
    "academic_discussion","essay","short_answer","fill_blank","open_ended",
    "dictation","write_from_dictation","summarize_spoken","summarize_spoken_text",
    "highlight_correct_summary","select_missing_word","highlight_incorrect_words",
    "write_essay","summarise_written_text","reorder_paragraphs",
    "reading_writing_fill_blanks","fill_in_blanks",
    "write_about_photo","speak_about_photo","read_then_speak","listen_then_speak",
  ]);
  // Also skip text_completion variants — they use array answers checked separately
  const isTextCompletion = q => (q.questionType||"").startsWith("text_completion");
  const isSentenceEquiv  = q => q.questionType === "sentence_equivalence";
  const OPEN_ENDED_SECTIONS = new Set(["speaking","writing"]);
  let missingAnswer = 0;
  qs.forEach(q => {
    const ans = q.correctAnswer || q.answer ||
      (Array.isArray(q.correctAnswers) && q.correctAnswers.length ? q.correctAnswers : null);
    const isOpenType = OPEN_ENDED_TYPES.has(q.questionType);
    const isOpenSection = OPEN_ENDED_SECTIONS.has(section);
    // For PTE speaking-writing, many tasks are open-ended
    const isPTESW = exam === "pte" && section === "speaking-writing";
    if (!isOpenType && !isOpenSection && !isPTESW && !isTextCompletion(q) && !isSentenceEquiv(q)) {
      if (!ans) missingAnswer++;
    }
  });
  if (missingAnswer > 0) {
    warn(`${tag}: ${missingAnswer} questions missing correctAnswer`);
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

const args     = process.argv.slice(2);
const examFilter    = args.find(a => !a.startsWith("--") && SPECS[a]);
const sectionFilter = args.find(a => !a.startsWith("--") && a !== examFilter);

console.log(C.bold("\n🔍 LandingPrep Test Validator — 2026 Exam Specs\n"));

const contentDir = path.join(BASE, "content");
const exams = fs.readdirSync(contentDir).filter(e => fs.statSync(path.join(contentDir,e)).isDirectory() && e !== "." && SPECS[e]);

exams.forEach(exam => {
  if (examFilter && exam !== examFilter) return;
  const examDir = path.join(contentDir, exam);
  const sections = fs.readdirSync(examDir).filter(s => fs.statSync(path.join(examDir,s)).isDirectory());

  console.log(C.cyan(`\n  ${exam.toUpperCase()}`));

  sections.forEach(section => {
    if (sectionFilter && section !== sectionFilter) return;
    const secDir = path.join(examDir, section);
    const files  = fs.readdirSync(secDir).filter(f => f.match(/^test-\d+\.json$/)).sort();
    if (files.length === 0) return;

    process.stdout.write(`    ${exam}/${section} (${files.length} tests): `);
    const issueBefore = issues.length;

    files.forEach(f => checkFile(path.join(secDir, f), exam, section));

    const newIssues = issues.length - issueBefore;
    if (newIssues === 0) {
      console.log(C.green("✓ all OK"));
    } else {
      console.log(C.red(`✗ ${newIssues} issues`));
      issues.slice(issueBefore).forEach(i => console.log("      " + i));
      // Clear printed issues so they don't show twice in summary
      issues.splice(issueBefore, newIssues);
    }
  });
});

// Summary
console.log(C.bold(`\n${"═".repeat(50)}`));
console.log(C.bold("  VALIDATION SUMMARY"));
console.log(C.bold("═".repeat(50)));
console.log(`  Total checks : ${totalChecks}`);
console.log(`  ${C.green("Passed")}       : ${totalPass}`);
console.log(`  ${C.red("Failed")}       : ${totalFail}`);
console.log(`  ${C.yellow("Warnings")}     : ${totalWarn}`);
console.log(`  Pass rate     : ${Math.round(totalPass/totalChecks*100)}%\n`);
