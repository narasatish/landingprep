#!/usr/bin/env node
// tools/audit-manifest-files.js
// Cross-checks every file path in manifest.json against actual files on disk.
// Prints a clear report of every missing file with exam / section / variant / title.
//
// Usage:
//   node tools/audit-manifest-files.js
//   node tools/audit-manifest-files.js --exam ielts
//   node tools/audit-manifest-files.js --fix-hide   (removes missing entries from manifest — use with care)
"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT     = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "content", "manifest.json");
const CONTENT  = path.join(ROOT, "content");

const args      = process.argv.slice(2);
const examIdx   = args.indexOf("--exam");
const FILTER    = examIdx !== -1 ? (args[examIdx + 1] || null) : null;
const FIX_HIDE  = args.includes("--fix-hide");

// ── Load manifest ─────────────────────────────────────────────────────────────
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));

// ── Collect all entries ───────────────────────────────────────────────────────
const entries = [];

for (const [examId, examData] of Object.entries(manifest.exams || {})) {
  if (FILTER && examId !== FILTER) continue;

  // Section tests
  for (const [sectionId, tests] of Object.entries(examData.sections || {})) {
    for (const t of (Array.isArray(tests) ? tests : [])) {
      entries.push({
        examId,
        sectionId,
        kind:    "section",
        variant: t.variant || "any",
        title:   t.title   || t.id || "(no title)",
        file:    t.file,
        id:      t.id,
      });
    }
  }

  // Full mocks
  for (const m of (examData.fullMocks || [])) {
    entries.push({
      examId,
      sectionId: "full",
      kind:    "full_mock",
      variant: m.variant || "any",
      title:   m.title   || m.id || "(no title)",
      file:    m.file,
      id:      m.id,
    });
    // Also check section file references inside the mock's sections array
    for (const secRef of (m.sections || [])) {
      if (secRef.file) {
        entries.push({
          examId,
          sectionId: secRef.section || "unknown",
          kind:    "full_mock_section_ref",
          variant: m.variant || "any",
          title:   `${m.title} → ${secRef.section}`,
          file:    secRef.file,
          id:      m.id,
        });
      }
    }
  }
}

// ── Check each file ───────────────────────────────────────────────────────────
let missing  = [];
let present  = 0;
let noFile   = 0;

for (const entry of entries) {
  if (!entry.file) { noFile++; continue; }
  const abs = path.join(CONTENT, entry.file);
  if (fs.existsSync(abs)) {
    present++;
  } else {
    missing.push(entry);
  }
}

// ── Print report ──────────────────────────────────────────────────────────────
const RESET  = "\x1b[0m";
const RED    = "\x1b[31m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";

console.log(`\n${BOLD}══════════════════════════════════════════════════════${RESET}`);
console.log(`${BOLD}  LandingPrep — Manifest File Audit${RESET}`);
console.log(`══════════════════════════════════════════════════════${RESET}`);
console.log(`  Total entries checked : ${entries.length}`);
console.log(`  ${GREEN}Files present         : ${present}${RESET}`);
console.log(`  Entries without file  : ${noFile}`);
console.log(`  ${missing.length ? RED : GREEN}Missing files         : ${missing.length}${RESET}`);
console.log(`══════════════════════════════════════════════════════${RESET}\n`);

if (missing.length === 0) {
  console.log(`${GREEN}✅  All manifest files exist on disk.${RESET}\n`);
} else {
  // Group by exam for readability
  const byExam = {};
  for (const m of missing) {
    (byExam[m.examId] = byExam[m.examId] || []).push(m);
  }

  for (const [examId, items] of Object.entries(byExam)) {
    console.log(`${BOLD}${CYAN}▸ ${examId.toUpperCase()} — ${items.length} missing${RESET}`);
    for (const item of items) {
      console.log(`  ${RED}✗${RESET} ${item.file}`);
      console.log(`    ${YELLOW}kind   :${RESET} ${item.kind}`);
      console.log(`    ${YELLOW}section:${RESET} ${item.sectionId}`);
      console.log(`    ${YELLOW}variant:${RESET} ${item.variant}`);
      console.log(`    ${YELLOW}title  :${RESET} ${item.title}`);
    }
    console.log();
  }

  // Summary by exam
  console.log(`${BOLD}── Summary by exam ──────────────────────────────────${RESET}`);
  for (const [examId, items] of Object.entries(byExam)) {
    const bySec = {};
    for (const i of items) (bySec[i.sectionId] = bySec[i.sectionId] || []).push(i);
    const parts = Object.entries(bySec).map(([s, arr]) => `${s}:${arr.length}`).join(", ");
    console.log(`  ${YELLOW}${examId.padEnd(10)}${RESET} ${items.length} missing  (${parts})`);
  }

  // Recommended fix
  console.log(`\n${BOLD}── Recommended actions ──────────────────────────────${RESET}`);
  console.log(`  1. Run rebuild scripts for each missing section:`);
  console.log(`     node tools/rebuild-ielts-reading.js --from 31 --to 60   # IELTS GT reading`);
  console.log(`     node tools/rebuild-ielts-listening.js --from 31 --to 60 # IELTS GT listening`);
  console.log(`     node tools/rebuild-ielts-speaking.js --from 31 --to 60  # IELTS GT speaking`);
  console.log(`  2. Or run with --fix-hide to remove missing entries from manifest (hides broken cards):`);
  console.log(`     node tools/audit-manifest-files.js --fix-hide`);
}

// ── Fix-hide mode ─────────────────────────────────────────────────────────────
if (FIX_HIDE && missing.length > 0) {
  console.log(`\n${YELLOW}⚠  --fix-hide: removing ${missing.length} missing entries from manifest...${RESET}`);

  // Build a Set of missing file paths
  const missingFiles = new Set(missing.map(m => m.file));

  let removed = 0;
  for (const [examId, examData] of Object.entries(manifest.exams || {})) {
    // Section tests
    for (const [sectionId, tests] of Object.entries(examData.sections || {})) {
      const before = tests.length;
      examData.sections[sectionId] = tests.filter(t => !t.file || !missingFiles.has(t.file));
      removed += before - examData.sections[sectionId].length;
    }
    // Full mocks — only remove the mock itself if its top-level file is missing
    if (examData.fullMocks) {
      const before = examData.fullMocks.length;
      examData.fullMocks = examData.fullMocks.filter(m => !m.file || !missingFiles.has(m.file));
      removed += before - examData.fullMocks.length;
    }
  }

  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`${GREEN}✅  Removed ${removed} entries. Manifest saved.${RESET}`);
  console.log(`    Run the audit again to confirm: node tools/audit-manifest-files.js`);
}

console.log();
