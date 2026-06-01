#!/usr/bin/env node
// tools/rebuild-exam-variants.js
// Tags variant fields in manifest.json for IELTS reading/writing/listening/speaking
// and also writes the variant field into each individual JSON file.
//
// IELTS:
//   tests 001–030 → academic
//   tests 031–060 → general_training  (gt-*.json files)
//
// PTE:  already tagged by generate-pte-core.js
// CELPIP: already tagged by generate-celpip-ls.js
//
// Run: node tools/rebuild-exam-variants.js
"use strict";

const fs   = require("fs");
const path = require("path");

const ROOT     = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "content", "manifest.json");

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
let changed = 0;

// ── IELTS section files ──────────────────────────────────────────────────────
const ielts = manifest.exams.ielts;
const IELTS_SECTIONS = ["reading","writing","listening","speaking"];

for (const sec of IELTS_SECTIONS) {
  const tests = ielts.sections[sec] || [];
  for (const entry of tests) {
    // Determine variant from file name OR index position
    let variant;
    const fname = path.basename(entry.file || "");
    if (fname.startsWith("gt-")) {
      variant = "general_training";
    } else {
      // Extract test number from filename (test-031.json → 31)
      const numMatch = fname.match(/(\d+)/);
      const num = numMatch ? parseInt(numMatch[1], 10) : 0;
      // Writing has gt- files; for other sections 031-060 = general_training
      variant = (num >= 31) ? "general_training" : "academic";
    }

    if (entry.variant !== variant) {
      entry.variant = variant;
      changed++;
    }

    // Also update the title to include variant label
    if (variant === "general_training" && !entry.title.includes("General")) {
      entry.title = entry.title.replace("IELTS", "IELTS General Training");
      changed++;
    } else if (variant === "academic" && !entry.title.includes("Academic")) {
      entry.title = entry.title.replace("IELTS", "IELTS Academic");
      changed++;
    }

    // Write variant into the JSON file itself
    const filePath = path.join(ROOT, "content", entry.file);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (data.variant !== variant) {
        data.variant = variant;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`  ✅  Tagged ${entry.file} → ${variant}`);
      }
    }
  }
}

// ── IELTS full mocks ─────────────────────────────────────────────────────────
const fullMocks = ielts.fullMocks || [];
for (const mock of fullMocks) {
  const num = parseInt((path.basename(mock.file || "").match(/\d+/) || ["0"])[0], 10);
  const variant = num <= 30 ? "academic" : "general_training";
  if (mock.variant !== variant) {
    mock.variant = variant;
    changed++;
  }
}

// ── Save manifest ────────────────────────────────────────────────────────────
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\n✅  Manifest updated — ${changed} entries changed.`);

// ── Summary ──────────────────────────────────────────────────────────────────
for (const sec of IELTS_SECTIONS) {
  const tests = ielts.sections[sec] || [];
  const acad = tests.filter(t => t.variant === "academic").length;
  const gen  = tests.filter(t => t.variant === "general_training").length;
  console.log(`  IELTS ${sec}: ${acad} academic, ${gen} general_training`);
}
