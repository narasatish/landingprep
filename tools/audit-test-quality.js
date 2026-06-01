#!/usr/bin/env node
// tools/audit-test-quality.js
// Audits all LandingPrep test content and prints a structured pass/fail report.
//
// Usage: node tools/audit-test-quality.js [--exam ielts] [--section reading] [--fix-variants]
"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT     = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "content", "manifest.json");

const args = process.argv.slice(2);
const filterExam    = args[args.indexOf("--exam") + 1]    || null;
const filterSection = args[args.indexOf("--section") + 1] || null;

// ── Thresholds ────────────────────────────────────────────────────────────────
const THRESHOLDS = {
  reading: {
    minPassageWords: 600,        // per individual passage
    minTotalQuestions: 35,
    requiredVariants: ["academic","general_training"],
  },
  listening: {
    minScriptWords: 350,         // per part
    minTotalQuestions: 35,
    requiredParts: 4,
  },
  writing: {
    task1MinModelAnswerWords: 120,
    task2MinModelAnswerWords: 220,
    requiresVisualForAcademic: true,
  },
  speaking: {
    minModelAnswerWords: 50,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const wc = str => (str || "").trim().split(/\s+/).filter(Boolean).length;
const loadJson = f => { try { return JSON.parse(fs.readFileSync(f,"utf8")); } catch { return null; } };

let passed = 0, failed = 0, warnings = 0;
const rows = [];

function report(file, check, status, detail) {
  rows.push({ file: path.relative(ROOT, file), check, status, detail });
  if (status === "PASS") passed++;
  else if (status === "FAIL") failed++;
  else warnings++;
}

// ── Audit a single test file ──────────────────────────────────────────────────
function auditFile(entry, filePath) {
  if (!fs.existsSync(filePath)) {
    report(filePath, "file_exists", "FAIL", "File not found: " + filePath);
    return;
  }
  const data = loadJson(filePath);
  if (!data) {
    report(filePath, "valid_json", "FAIL", "JSON parse error");
    return;
  }

  const exam    = data.exam    || entry.exam    || "unknown";
  const section = data.section || entry.section || "unknown";
  const qs      = data.questions || [];

  // ── Variant check ────────────────────────────────────────────────────────
  const needsVariant = ["ielts","pte","celpip"].includes(exam);
  if (needsVariant) {
    const hasVariant = !!(data.variant || entry.variant);
    report(filePath, "has_variant", hasVariant ? "PASS" : "FAIL",
      hasVariant ? `variant="${data.variant||entry.variant}"` : "Missing variant tag");
  }

  // ── Section-specific checks ──────────────────────────────────────────────
  if (section === "reading") {
    const passages = data.passages || [];
    report(filePath, "passage_count", passages.length >= 1 ? "PASS" : "FAIL",
      `${passages.length} passage(s)`);

    passages.forEach((p, i) => {
      const words = wc(p.text);
      const ok = words >= THRESHOLDS.reading.minPassageWords;
      report(filePath, `passage_${i+1}_words`, ok ? "PASS" : "FAIL",
        `${words} words (need ≥${THRESHOLDS.reading.minPassageWords})`);
    });

    const qCount = qs.length;
    const qOk = qCount >= THRESHOLDS.reading.minTotalQuestions;
    report(filePath, "question_count", qOk ? "PASS" : "FAIL",
      `${qCount} questions (need ≥${THRESHOLDS.reading.minTotalQuestions})`);

    // Check for explanations
    const withExp = qs.filter(q => q.explanation && q.explanation.length > 10).length;
    report(filePath, "explanations", withExp === qCount ? "PASS" : "WARN",
      `${withExp}/${qCount} questions have explanations`);

    // Question type variety
    const types = new Set(qs.map(q => q.questionType));
    report(filePath, "question_type_variety", types.size >= 2 ? "PASS" : "WARN",
      `${types.size} distinct type(s): ${[...types].join(", ")}`);
  }

  if (section === "listening") {
    const scripts = data.listeningScripts || [];
    const partCount = scripts.length;
    report(filePath, "part_count",
      partCount >= THRESHOLDS.listening.requiredParts ? "PASS" : "FAIL",
      `${partCount} parts (need ${THRESHOLDS.listening.requiredParts})`);

    scripts.forEach((s, i) => {
      const words = wc(s.script);
      const ok = words >= THRESHOLDS.listening.minScriptWords;
      report(filePath, `part_${i+1}_script_words`, ok ? "PASS" : "FAIL",
        `${words} words (need ≥${THRESHOLDS.listening.minScriptWords})`);
      if (!s.audioUrl && !s.script) {
        report(filePath, `part_${i+1}_content`, "FAIL", "No script and no audioUrl");
      }
    });

    const qCount = qs.length;
    report(filePath, "question_count",
      qCount >= THRESHOLDS.listening.minTotalQuestions ? "PASS" : "FAIL",
      `${qCount} questions (need ≥${THRESHOLDS.listening.minTotalQuestions})`);

    // Check question numbering per part
    const byPart = {};
    qs.forEach(q => { const p = q.part || 1; (byPart[p] = byPart[p]||[]).push(q); });
    Object.entries(byPart).forEach(([p, pqs]) => {
      report(filePath, `part_${p}_questions`, pqs.length >= 8 ? "PASS" : "WARN",
        `Part ${p}: ${pqs.length} questions`);
    });

    // Check answer keys
    const withAnswer = qs.filter(q => q.correctAnswer !== undefined && q.correctAnswer !== "").length;
    report(filePath, "answer_keys", withAnswer >= Math.ceil(qCount*0.8) ? "PASS" : "WARN",
      `${withAnswer}/${qCount} questions have answers`);
  }

  if (section === "writing") {
    const task1 = qs[0];
    const task2 = qs[1];

    if (task1) {
      const ma1 = wc(task1.modelAnswer || task1.sampleAnswer);
      report(filePath, "task1_model_answer_length",
        ma1 >= THRESHOLDS.writing.task1MinModelAnswerWords ? "PASS" : "FAIL",
        `${ma1} words (need ≥${THRESHOLDS.writing.task1MinModelAnswerWords})`);

      // Visual check for academic
      const variant = data.variant || entry.variant;
      if (!variant || variant === "academic") {
        const hasVisual = !!(task1.visual);
        report(filePath, "task1_has_visual", hasVisual ? "PASS" : "FAIL",
          hasVisual ? `type="${task1.visual.type}"` : "Missing visual block for Academic Task 1");
      }
    }

    if (task2) {
      const ma2 = wc(task2.modelAnswer || task2.sampleAnswer);
      report(filePath, "task2_model_answer_length",
        ma2 >= THRESHOLDS.writing.task2MinModelAnswerWords ? "PASS" : "FAIL",
        `${ma2} words (need ≥${THRESHOLDS.writing.task2MinModelAnswerWords})`);
    }
  }

  if (section === "speaking") {
    qs.forEach((q, i) => {
      const ma = wc(q.modelAnswer || q.sampleAnswer);
      const ok = ma >= THRESHOLDS.speaking.minModelAnswerWords;
      report(filePath, `q${i+1}_model_answer`, ok ? "PASS" : "FAIL",
        `${ma} words (need ≥${THRESHOLDS.speaking.minModelAnswerWords})`);
    });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  const manifest = loadJson(MANIFEST);
  if (!manifest) { console.error("Cannot load manifest.json"); process.exit(1); }

  const exams = manifest.exams || {};
  let fileCount = 0;

  for (const [examId, examData] of Object.entries(exams)) {
    if (filterExam && examId !== filterExam) continue;

    // Section tests
    const sections = examData.sections || {};
    for (const [sectionId, tests] of Object.entries(sections)) {
      if (filterSection && sectionId !== filterSection) continue;
      for (const entry of tests) {
        const filePath = path.join(ROOT, "content", entry.file);
        auditFile({ ...entry, exam: examId, section: sectionId }, filePath);
        fileCount++;
      }
    }

    // Full mocks — lighter check (just file existence + variant)
    for (const mock of (examData.fullMocks || [])) {
      const filePath = path.join(ROOT, "content", mock.file);
      if (!fs.existsSync(filePath)) {
        report(filePath, "file_exists", "FAIL", "Full mock file not found");
      }
      fileCount++;
    }
  }

  // ── Print report ─────────────────────────────────────────────────────────
  const colW = [50, 30, 6, 0];
  const sep  = "─".repeat(120);

  console.log("\n" + sep);
  console.log("  LandingPrep Content Audit Report");
  console.log("  " + new Date().toISOString());
  console.log(sep);

  // Group by status
  const fails = rows.filter(r => r.status === "FAIL");
  const warns = rows.filter(r => r.status === "WARN");

  if (fails.length) {
    console.log("\n❌  FAILURES (" + fails.length + ")\n");
    fails.forEach(r => {
      console.log(`  [FAIL]  ${r.file.padEnd(55)} ${r.check.padEnd(32)} ${r.detail}`);
    });
  }

  if (warns.length) {
    console.log("\n⚠️   WARNINGS (" + warns.length + ")\n");
    warns.forEach(r => {
      console.log(`  [WARN]  ${r.file.padEnd(55)} ${r.check.padEnd(32)} ${r.detail}`);
    });
  }

  console.log("\n" + sep);
  console.log(`  Files audited : ${fileCount}`);
  console.log(`  Checks run    : ${rows.length}`);
  console.log(`  ✅ PASS       : ${passed}`);
  console.log(`  ❌ FAIL       : ${failed}`);
  console.log(`  ⚠️  WARN       : ${warnings}`);
  console.log(sep + "\n");

  // Priority fix list
  if (failed > 0) {
    console.log("🔧  Top priority fixes:\n");
    const topFails = [
      { check: "passage_",       fix: "Run: node tools/rebuild-ielts-reading.js --key YOUR_KEY" },
      { check: "task1_has_visual", fix: "Run: node tools/add-visuals.js --key YOUR_KEY" },
      { check: "model_answer",   fix: "Run: node tools/rebuild-speaking-model-answers.js --key YOUR_KEY" },
      { check: "part_count",     fix: "Run: node tools/rebuild-ielts-listening.js --key YOUR_KEY" },
      { check: "has_variant",    fix: "Run: node tools/rebuild-exam-variants.js" },
    ];
    const shownFixes = new Set();
    fails.forEach(r => {
      const hit = topFails.find(f => r.check.includes(f.check));
      if (hit && !shownFixes.has(hit.fix)) {
        shownFixes.add(hit.fix);
        console.log("  →  " + hit.fix);
      }
    });
    console.log();
  }
}

main();
