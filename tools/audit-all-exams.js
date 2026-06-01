/**
 * audit-all-exams.js
 *
 * Comprehensive unit-test audit of every test file across all 7 exams.
 * Checks: file existence, JSON validity, question counts, question types,
 * timing, structural fields, distinct content, and format compliance.
 *
 * Run: node tools/audit-all-exams.js
 */

const fs   = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");
const MANIFEST = JSON.parse(fs.readFileSync(path.join(BASE,"content/manifest.json"),"utf8"));

// ─── Colour helpers ───────────────────────────────────────────────────────────
const C = {
  red:    s => `\x1b[31m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
};

let totalTests = 0, totalPassed = 0, totalFailed = 0, totalWarnings = 0;
const issues = [];

function pass(msg)  { totalTests++; totalPassed++;  process.stdout.write(C.green("✓")); }
function fail(msg)  { totalTests++; totalFailed++;  process.stdout.write(C.red("✗")); issues.push(msg); }
function warn(msg)  { totalWarnings++; process.stdout.write(C.yellow("⚠")); issues.push("WARN: "+msg); }

function check(condition, passMsg, failMsg) {
  if (condition) pass(passMsg); else fail(failMsg);
}

function loadFile(relPath) {
  const abs = path.join(BASE,"content",relPath);
  if (!fs.existsSync(abs)) return { err:"FILE_MISSING: "+relPath };
  try { return JSON.parse(fs.readFileSync(abs,"utf8")); }
  catch(e) { return { err:"PARSE_ERROR: "+relPath+" — "+e.message }; }
}

function sectionHeader(title) {
  console.log("\n"+C.bold(C.cyan("══════════════════════════════════════════════")));
  console.log(C.bold(C.cyan("  "+title)));
  console.log(C.bold(C.cyan("══════════════════════════════════════════════")));
}

function subsection(title) {
  console.log("\n  "+C.bold(title));
}

// ─── OFFICIAL FORMAT SPECS ────────────────────────────────────────────────────

const SPECS = {

  ielts: {
    listening: {
      questionCount: { min:40, max:40 },
      durationSeconds: { min:1800, max:2400 },
      requiredFields: ["listeningScripts","questions"],
      forbiddenQTypes: ["true_false_not_given","sentence_completion","matching_headings","fill_in_blanks"],
      requiredQTypes: [], // IELTS listening: MCQ, short_answer, sentence_completion allowed
      scriptCount: { min:4, max:4 }, // 4 parts
    },
    reading: {
      questionCount: { min:40, max:40 },
      durationSeconds: { min:3600, max:3600 },
      requiredFields: ["passages","questions"],
      passageCount: { min:3, max:3 },
      forbiddenQTypes: ["factual_information","negative_factual","gist_content","integrated_writing","academic_discussion"],
    },
    writing: {
      questionCount: { min:2, max:2 },
      durationSeconds: { min:3600, max:3600 },
      requiredFields: ["questions"],
      taskTypes: ["task_1","task_2"],
    },
    speaking: {
      questionCount: { min:3, max:3 },
      durationSeconds: { min:660, max:840 },
      requiredFields: ["questions"],
      partTypes: ["part_1","part_2","part_3"],
    },
  },

  toefl: {
    reading: {
      questionCount: { min:20, max:20 },
      durationSeconds: { min:2100, max:2100 },
      requiredFields: ["passages","questions"],
      passageCount: { min:2, max:2 },
      forbiddenQTypes: ["true_false_not_given","yes_no_not_given","sentence_completion","matching_headings","matching_information","summary_completion","short_answer","writing_task"],
      requiredQTypes: ["factual_information","vocabulary_in_context"],
    },
    listening: {
      questionCount: { min:28, max:28 },
      durationSeconds: { min:2100, max:2400 },
      requiredFields: ["listeningScripts","questions"],
      scriptCount: { min:5, max:5 }, // 2 conversations + 3 lectures
      forbiddenQTypes: ["true_false_not_given","sentence_completion","matching_headings"],
    },
    speaking: {
      questionCount: { min:4, max:4 },
      durationSeconds: { min:900, max:1200 },
      requiredFields: ["questions"],
      taskTypes: ["independent","campus_integrated","academic_integrated","academic_integrated_lecture_only"],
      taskTimings: [
        { prepSeconds:15, responseSeconds:45 }, // Task 1
        { prepSeconds:30, responseSeconds:60 }, // Task 2
        { prepSeconds:30, responseSeconds:60 }, // Task 3
        { prepSeconds:20, responseSeconds:60 }, // Task 4
      ],
    },
    writing: {
      questionCount: { min:2, max:2 },
      durationSeconds: { min:1800, max:1800 },
      requiredFields: ["questions"],
      taskTypes: ["integrated_writing","academic_discussion"],
    },
  },

  pte: {
    "speaking-writing": {
      questionCount: { min:32, max:42 },
      durationSeconds: { min:3600, max:5400 },
      requiredFields: ["questions"],
      forbiddenQTypes: ["email","true_false_not_given"],
      requiredQTypes: ["read_aloud","repeat_sentence","describe_image"],
      typeRanges: {
        read_aloud: [6,7], repeat_sentence: [10,12], describe_image: [6,7],
        retell_lecture: [3,4], answer_short_question: [5,6],
        summarize_written_text: [1,2], essay: [1,2],
      },
    },
    reading: {
      questionCount: { min:15, max:20 },
      durationSeconds: { min:900, max:1800 },
      requiredFields: ["questions"],
      requiredQTypes: ["reading_writing_fill_blanks","fill_in_blanks"],
    },
    listening: {
      questionCount: { min:17, max:25 },
      durationSeconds: { min:1800, max:2700 },
      requiredFields: ["questions"],
    },
  },

  celpip: {
    listening: {
      questionCount: { min:38, max:45 },
      durationSeconds: { min:3000, max:4800 },
      requiredFields: ["questions"],
    },
    reading: {
      questionCount: { min:38, max:42 },
      durationSeconds: { min:3360, max:3600 },
      requiredFields: ["questions"],
    },
    writing: {
      questionCount: { min:2, max:2 },
      durationSeconds: { min:2700, max:3600 },
      requiredFields: ["questions"],
      taskTypes: ["email","survey"],
    },
    speaking: {
      questionCount: { min:8, max:8 },
      durationSeconds: { min:1200, max:1800 },
      requiredFields: ["questions"],
    },
  },

  duolingo: {
    adaptive: {
      questionCount: { min:20, max:70 },
      durationSeconds: { min:2400, max:4800 },
      requiredFields: ["questions"],
    },
    literacy: { questionCount: { min:5, max:20 }, requiredFields: ["questions"] },
    comprehension: { questionCount: { min:5, max:20 }, requiredFields: ["questions"] },
    conversation: { questionCount: { min:2, max:10 }, requiredFields: ["questions"] },
    production: { questionCount: { min:2, max:10 }, requiredFields: ["questions"] },
  },

  gre: {
    verbal: {
      questionCount: { min:20, max:25 },
      durationSeconds: { min:1800, max:2400 },
      requiredFields: ["questions"],
      requiredQTypes: ["text_completion","sentence_equivalence","reading_comprehension"],
    },
    quant: {
      questionCount: { min:20, max:25 },
      durationSeconds: { min:2100, max:2700 },
      requiredFields: ["questions"],
    },
    writing: {
      questionCount: { min:1, max:2 },
      durationSeconds: { min:1800, max:3600 },
      requiredFields: ["questions"],
    },
  },

  gmat: {
    quant: {
      questionCount: { min:21, max:21 },
      durationSeconds: { min:2700, max:2700 },
      requiredFields: ["questions"],
    },
    verbal: {
      questionCount: { min:23, max:23 },
      durationSeconds: { min:2700, max:2700 },
      requiredFields: ["questions"],
    },
    "data-insights": {
      questionCount: { min:20, max:20 },
      durationSeconds: { min:2700, max:2700 },
      requiredFields: ["questions"],
    },
  },
};

// ─── Content uniqueness tracker ───────────────────────────────────────────────

function checkDistinctContent(testObjects, examSection) {
  const prompts = testObjects.map(t => {
    const qs = t.questions || [];
    return qs.slice(0,3).map(q=>q.prompt||"").join("|");
  });
  const unique = new Set(prompts);
  const pct = Math.round(unique.size / prompts.length * 100);
  if (pct < 80) {
    fail(`${examSection}: Only ${pct}% of tests have distinct question content (${unique.size}/${prompts.length} unique)`);
  } else {
    pass(`${examSection}: ${pct}% content uniqueness (${unique.size}/${prompts.length})`);
  }

  // Check for copy-paste identical answers
  const answers = testObjects.map(t => (t.questions||[]).map(q=>q.correctAnswer||"").join("|"));
  const uniqueAns = new Set(answers);
  if (uniqueAns.size < prompts.length * 0.7) {
    fail(`${examSection}: Suspicious answer repetition — only ${uniqueAns.size}/${prompts.length} distinct answer patterns`);
  } else {
    pass(`${examSection}: Answer variety OK (${uniqueAns.size}/${prompts.length})`);
  }
}

// ─── Core audit function ──────────────────────────────────────────────────────

function auditSection(examId, sectionId, spec) {
  const sectionEntries = MANIFEST.exams[examId]?.sections?.[sectionId];
  if (!sectionEntries) { fail(`${examId}/${sectionId}: NOT FOUND in manifest`); return; }

  const keys = Object.keys(sectionEntries);
  const expectedCount = keys.length;
  subsection(`${examId.toUpperCase()} › ${sectionId} (${expectedCount} tests)`);
  process.stdout.write("    Tests: ");

  const loadedTests = [];
  let missingFiles = 0, parseErrors = 0;

  for (const key of keys) {
    const entry = sectionEntries[key];
    const data = loadFile(entry.file);
    if (data.err) {
      if (data.err.includes("FILE_MISSING")) missingFiles++;
      else parseErrors++;
      fail(`${data.err}`);
      continue;
    }
    loadedTests.push({ entry, data });
    pass(`file OK`);
  }
  console.log(`  (${loadedTests.length}/${expectedCount} loaded)`);

  if (loadedTests.length === 0) {
    fail(`${examId}/${sectionId}: No tests could be loaded`);
    return;
  }

  // ── 1. Question count ──────────────────────────────────────────────────────
  process.stdout.write("    Q-count: ");
  let countFails = 0;
  for (const { entry, data } of loadedTests) {
    const qs = (data.questions||[]).length;
    const { min, max } = spec.questionCount;
    if (qs < min || qs > max) {
      fail(`${entry.file}: questionCount=${qs} (expected ${min}-${max})`);
      countFails++;
    } else {
      pass(`count OK`);
    }
  }
  if (countFails === 0) console.log(` All ${loadedTests.length} tests have correct question count`);
  else console.log(` ${countFails} count violations`);

  // ── 2. Duration ───────────────────────────────────────────────────────────
  if (spec.durationSeconds) {
    process.stdout.write("    Duration: ");
    for (const { entry, data } of loadedTests) {
      const dur = data.durationSeconds;
      const { min, max } = spec.durationSeconds;
      if (!dur) { warn(`${entry.file}: missing durationSeconds`); }
      else if (dur < min || dur > max) { warn(`${entry.file}: duration=${dur}s (expected ${min}-${max})`); }
      else { pass(`dur OK`); }
    }
    console.log();
  }

  // ── 3. Required fields ─────────────────────────────────────────────────────
  if (spec.requiredFields) {
    process.stdout.write("    Fields: ");
    for (const { entry, data } of loadedTests) {
      for (const field of spec.requiredFields) {
        if (!data[field]) fail(`${entry.file}: missing field "${field}"`);
        else pass(`field OK`);
      }
    }
    console.log();
  }

  // ── 4. Forbidden question types ────────────────────────────────────────────
  if (spec.forbiddenQTypes && spec.forbiddenQTypes.length) {
    process.stdout.write("    No-bad-types: ");
    let badTypeCount = 0;
    for (const { entry, data } of loadedTests) {
      const types = new Set((data.questions||[]).map(q=>q.questionType));
      for (const forbidden of spec.forbiddenQTypes) {
        if (types.has(forbidden)) {
          fail(`${entry.file}: FORBIDDEN type "${forbidden}" found`);
          badTypeCount++;
        }
      }
    }
    if (badTypeCount === 0) { pass(`no forbidden types`); console.log(" None found ✓"); }
    else console.log(` ${badTypeCount} violations`);
  }

  // ── 5. Required question types ─────────────────────────────────────────────
  if (spec.requiredQTypes && spec.requiredQTypes.length) {
    process.stdout.write("    Has-req-types: ");
    for (const { entry, data } of loadedTests) {
      const types = new Set((data.questions||[]).map(q=>q.questionType));
      for (const req of spec.requiredQTypes) {
        if (!types.has(req)) fail(`${entry.file}: missing required type "${req}"`);
        else pass(`req type OK`);
      }
    }
    console.log();
  }

  // ── 6. Passage count (reading) ─────────────────────────────────────────────
  if (spec.passageCount) {
    process.stdout.write("    Passages: ");
    for (const { entry, data } of loadedTests) {
      const pc = (data.passages||[]).length;
      const { min, max } = spec.passageCount;
      if (pc < min || pc > max) fail(`${entry.file}: passages=${pc} (expected ${min}-${max})`);
      else pass(`passages OK`);
    }
    console.log();
  }

  // ── 7. Script count (listening) ────────────────────────────────────────────
  if (spec.scriptCount) {
    process.stdout.write("    Scripts: ");
    for (const { entry, data } of loadedTests) {
      const sc = (data.listeningScripts||[]).length;
      const { min, max } = spec.scriptCount;
      if (sc < min || sc > max) fail(`${entry.file}: scripts=${sc} (expected ${min}-${max})`);
      else pass(`scripts OK`);
    }
    console.log();
  }

  // ── 8. Speaking task types & timings ──────────────────────────────────────
  if (spec.taskTypes && examId === "toefl" && sectionId === "speaking") {
    process.stdout.write("    Task-types: ");
    for (const { entry, data } of loadedTests) {
      const actualTypes = (data.questions||[]).map(q=>q.taskType);
      for (let i = 0; i < spec.taskTypes.length; i++) {
        if (actualTypes[i] !== spec.taskTypes[i]) fail(`${entry.file}: task${i+1} type="${actualTypes[i]}" expected="${spec.taskTypes[i]}"`);
        else pass(`task type OK`);
      }
      // Check timings
      for (let i = 0; i < spec.taskTimings.length; i++) {
        const q = data.questions[i];
        if (!q) continue;
        const { prepSeconds, responseSeconds } = spec.taskTimings[i];
        if (q.prepSeconds !== prepSeconds) fail(`${entry.file}: task${i+1} prep=${q.prepSeconds} expected=${prepSeconds}`);
        else pass(`prep OK`);
        if (q.responseSeconds !== responseSeconds) fail(`${entry.file}: task${i+1} respond=${q.responseSeconds} expected=${responseSeconds}`);
        else pass(`respond OK`);
      }
    }
    console.log();
  }

  // ── 9. Writing task types ──────────────────────────────────────────────────
  if (spec.taskTypes && sectionId === "writing" && examId === "toefl") {
    process.stdout.write("    Write-types: ");
    for (const { entry, data } of loadedTests) {
      const actualTypes = (data.questions||[]).map(q=>q.taskType);
      for (let i = 0; i < spec.taskTypes.length; i++) {
        if (actualTypes[i] !== spec.taskTypes[i]) fail(`${entry.file}: task${i+1} type="${actualTypes[i]}" expected="${spec.taskTypes[i]}"`);
        else pass(`write type OK`);
      }
    }
    console.log();
  }

  // ── 10. PTE type ranges ───────────────────────────────────────────────────
  if (spec.typeRanges) {
    process.stdout.write("    PTE-type-ranges: ");
    let rangeViolations = 0;
    for (const { entry, data } of loadedTests) {
      const typeCounts = {};
      (data.questions||[]).forEach(q => typeCounts[q.questionType] = (typeCounts[q.questionType]||0)+1);
      for (const [type, [min, max]] of Object.entries(spec.typeRanges)) {
        const count = typeCounts[type] || 0;
        if (count < min || count > max) {
          fail(`${entry.file}: ${type}=${count} (expected ${min}-${max})`);
          rangeViolations++;
        } else {
          pass(`range OK`);
        }
      }
    }
    if (rangeViolations === 0) console.log(" All PTE type counts within range ✓");
    else console.log(` ${rangeViolations} range violations`);
  }

  // ── 11. Content uniqueness & anti-copy-paste ──────────────────────────────
  process.stdout.write("    Distinctness: ");
  checkDistinctContent(loadedTests.map(t=>t.data), `${examId}/${sectionId}`);
  console.log();

  // ── 12. Check no empty prompts ────────────────────────────────────────────
  process.stdout.write("    No-empty-prompts: ");
  let emptyCount = 0;
  for (const { entry, data } of loadedTests) {
    for (const q of (data.questions||[])) {
      if (!q.prompt || q.prompt.trim().length < 10) {
        emptyCount++;
        fail(`${entry.file}: q${q.num||q.id}: empty/short prompt`);
      }
    }
  }
  if (emptyCount === 0) { pass("all prompts OK"); console.log(" ✓"); }
  else console.log(` ${emptyCount} empty prompts`);

  // ── 13. IELTS reading: check for IELTS-ONLY question types ───────────────
  if (examId === "ielts" && sectionId === "reading") {
    process.stdout.write("    IELTS-read-types: ");
    const validIELTS = new Set(["true_false_not_given","yes_no_not_given","multiple_choice","sentence_completion","short_answer","matching_headings","matching_information","summary_completion","note_completion","diagram_completion","table_completion","flow_chart"]);
    for (const { entry, data } of loadedTests) {
      const types = new Set((data.questions||[]).map(q=>q.questionType));
      for (const t of types) {
        if (!validIELTS.has(t)) warn(`${entry.file}: Unexpected IELTS question type "${t}"`);
      }
    }
    console.log(" done");
  }
}

// ─── Full mock spot checks ────────────────────────────────────────────────────

function auditFullMocks(examId) {
  const fmEntries = MANIFEST.exams[examId]?.fullMocks;
  if (!fmEntries || Object.keys(fmEntries).length === 0) {
    warn(`${examId}: No full mocks found in manifest`);
    return;
  }
  const keys = Object.keys(fmEntries).slice(0,3); // spot-check first 3
  process.stdout.write(`    FullMocks (spot 3): `);
  for (const key of keys) {
    const entry = fmEntries[key];
    const data = loadFile(entry.file);
    if (data.err) { fail(data.err); continue; }
    check(!!data.sections, `${entry.file}: has sections`, `${entry.file}: MISSING sections`);
    check(Array.isArray(data.sections) && data.sections.length >= 2,
      `${entry.file}: ≥2 sections`, `${entry.file}: fewer than 2 sections`);
  }
  console.log();
}

// ─── IELTS Listening specific: check for 4 sections ─────────────────────────

function auditIELTSListening() {
  const entries = MANIFEST.exams.ielts.sections.listening;
  subsection("IELTS › LISTENING — 4-section structure check");
  process.stdout.write("    Section-counts: ");
  const keys = Object.keys(entries).slice(0,5); // check first 5
  for (const key of keys) {
    const data = loadFile(entries[key].file);
    if (data.err) { fail(data.err); continue; }
    const scriptCount = (data.listeningScripts||data.sections||[]).length;
    if (scriptCount < 4) fail(`${entries[key].file}: only ${scriptCount} sections (need 4)`);
    else pass(`4+ sections OK`);
    // Check Q count
    const qCount = (data.questions||[]).length;
    if (qCount !== 40) fail(`${entries[key].file}: ${qCount} questions (need 40)`);
    else pass(`40Q OK`);
  }
  console.log();
}

// ─── CELPIP writing: check for email + survey ────────────────────────────────

function auditCELPIPWriting() {
  const entries = MANIFEST.exams.celpip.sections.writing;
  subsection("CELPIP › WRITING — email+survey structure check");
  process.stdout.write("    Task-types: ");
  const keys = Object.keys(entries).slice(0,5);
  for (const key of keys) {
    const data = loadFile(entries[key].file);
    if (data.err) { fail(data.err); continue; }
    const qs = data.questions || [];
    check(qs.length === 2, `${entries[key].file}: 2 tasks`, `${entries[key].file}: ${qs.length} tasks (need 2)`);
    if (qs.length >= 1) {
      const t1 = qs[0].taskType || qs[0].questionType || "";
      const hasEmail = t1.includes("email") || t1.includes("Email") || qs[0].prompt?.toLowerCase().includes("email");
      if (!hasEmail) fail(`${entries[key].file}: Task 1 is not email writing (got "${t1}")`);
      else pass(`email task OK`);
    }
  }
  console.log();
}

// ─── GRE Verbal: check for correct types ─────────────────────────────────────

function auditGREVerbal() {
  const entries = MANIFEST.exams.gre.sections.verbal;
  subsection("GRE › VERBAL — question type check");
  process.stdout.write("    Types: ");
  const keys = Object.keys(entries).slice(0,5);
  for (const key of keys) {
    const data = loadFile(entries[key].file);
    if (data.err) { fail(data.err); continue; }
    const types = new Set((data.questions||[]).map(q=>q.questionType));
    const hasTC = types.has("text_completion");
    const hasSE = types.has("sentence_equivalence");
    const hasRC = types.has("reading_comprehension");
    if (!hasTC) fail(`${entries[key].file}: missing text_completion`);
    else pass(`TC OK`);
    if (!hasSE) warn(`${entries[key].file}: missing sentence_equivalence`);
    if (!hasRC) warn(`${entries[key].file}: missing reading_comprehension`);
    // Check no IELTS contamination
    if (types.has("true_false_not_given")) fail(`${entries[key].file}: has IELTS type true_false_not_given`);
  }
  console.log();
}

// ─── GMAT: check for correct question counts ──────────────────────────────────

function auditGMAT() {
  ["quant","verbal","data-insights"].forEach(sec => {
    const expected = { quant:21, verbal:23, "data-insights":20 };
    const entries = MANIFEST.exams.gmat.sections[sec];
    subsection(`GMAT › ${sec.toUpperCase()} — count=${expected[sec]}`);
    process.stdout.write("    Counts: ");
    const keys = Object.keys(entries).slice(0,5);
    for (const key of keys) {
      const data = loadFile(entries[key].file);
      if (data.err) { fail(data.err); continue; }
      const qc = (data.questions||[]).length;
      if (qc !== expected[sec]) fail(`${entries[key].file}: ${qc} questions (need ${expected[sec]})`);
      else pass(`${qc}Q OK`);
    }
    console.log();
  });
}

// ─── Duolingo: adaptive test check ───────────────────────────────────────────

function auditDuolingo() {
  const entries = MANIFEST.exams.duolingo.sections.adaptive;
  subsection("DUOLINGO › ADAPTIVE — format check");
  process.stdout.write("    Structure: ");
  const keys = Object.keys(entries).slice(0,5);
  for (const key of keys) {
    const data = loadFile(entries[key].file);
    if (data.err) { fail(data.err); continue; }
    const qc = (data.questions||[]).length;
    if (qc < 20) fail(`${entries[key].file}: only ${qc} questions (need ≥20)`);
    else pass(`${qc}Q OK`);
    // Check adaptive has varied types
    const types = new Set((data.questions||[]).map(q=>q.questionType));
    if (types.size < 3) fail(`${entries[key].file}: only ${types.size} question types (need variety)`);
    else pass(`${types.size} types OK`);
  }
  console.log();
}

// ─── Run all audits ───────────────────────────────────────────────────────────

console.log(C.bold("\n🔍 LandingPrep Full Exam Audit — All 7 Exams\n"));
console.log(`Legend: ${C.green("✓")} pass  ${C.red("✗")} fail  ${C.yellow("⚠")} warning\n`);

// ── IELTS ─────────────────────────────────────────────────────────────────────
sectionHeader("1. IELTS");
auditIELTSListening();
["reading","writing","speaking"].forEach(sec => {
  auditSection("ielts", sec, SPECS.ielts[sec]);
});
process.stdout.write("  ");
auditFullMocks("ielts");

// ── TOEFL ─────────────────────────────────────────────────────────────────────
sectionHeader("2. TOEFL iBT");
["reading","listening","speaking","writing"].forEach(sec => {
  auditSection("toefl", sec, SPECS.toefl[sec]);
});
process.stdout.write("  ");
auditFullMocks("toefl");

// ── PTE ───────────────────────────────────────────────────────────────────────
sectionHeader("3. PTE Academic");
["speaking-writing","reading","listening"].forEach(sec => {
  auditSection("pte", sec, SPECS.pte[sec]);
});
process.stdout.write("  ");
auditFullMocks("pte");

// ── CELPIP ────────────────────────────────────────────────────────────────────
sectionHeader("4. CELPIP");
["listening","reading","writing","speaking"].forEach(sec => {
  auditSection("celpip", sec, SPECS.celpip[sec]);
});
auditCELPIPWriting();
process.stdout.write("  ");
auditFullMocks("celpip");

// ── DUOLINGO ──────────────────────────────────────────────────────────────────
sectionHeader("5. Duolingo English Test");
auditDuolingo();
["adaptive","literacy","comprehension","conversation","production"].forEach(sec => {
  if (SPECS.duolingo[sec]) auditSection("duolingo", sec, SPECS.duolingo[sec]);
});
process.stdout.write("  ");
auditFullMocks("duolingo");

// ── GRE ───────────────────────────────────────────────────────────────────────
sectionHeader("6. GRE");
auditGREVerbal();
["verbal","quant","writing"].forEach(sec => {
  auditSection("gre", sec, SPECS.gre[sec]);
});
process.stdout.write("  ");
auditFullMocks("gre");

// ── GMAT ─────────────────────────────────────────────────────────────────────
sectionHeader("7. GMAT Focus Edition");
auditGMAT();
["quant","verbal","data-insights"].forEach(sec => {
  auditSection("gmat", sec, SPECS.gmat[sec]);
});
process.stdout.write("  ");
auditFullMocks("gmat");

// ─── Final Report ─────────────────────────────────────────────────────────────
console.log("\n");
console.log(C.bold("══════════════════════════════════════════════"));
console.log(C.bold("  AUDIT SUMMARY"));
console.log(C.bold("══════════════════════════════════════════════"));
console.log(`  Total checks : ${totalTests}`);
console.log(`  ${C.green("Passed")}       : ${totalPassed}`);
console.log(`  ${C.red("Failed")}       : ${totalFailed}`);
console.log(`  ${C.yellow("Warnings")}     : ${totalWarnings}`);
console.log(`  Pass rate     : ${Math.round(totalPassed/totalTests*100)}%`);

if (issues.length > 0) {
  console.log("\n"+C.bold(C.red("  Issues Found:")));
  issues.slice(0, 80).forEach((iss,i) => console.log(`  ${i+1}. ${iss}`));
  if (issues.length > 80) console.log(`  ... and ${issues.length-80} more`);
} else {
  console.log("\n"+C.bold(C.green("  🎉 No issues found!")));
}
console.log();
