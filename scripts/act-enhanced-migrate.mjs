// act-enhanced-migrate.mjs — one-time migration of the ACT mock content (our own
// original practice questions) from the legacy paper format to the Enhanced ACT
// (standard from 2025–26): English 50q/35m, Math 45q/50m, Reading 36q/40m,
// Science 40q/40m (now optional on the real exam). Trims question arrays, updates
// timing metadata, and drops passages no longer referenced by any remaining question.
import { readFileSync, writeFileSync, readdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGETS = {
  english: { count: 50, minutes: 35 },
  math:    { count: 45, minutes: 50 },
  reading: { count: 36, minutes: 40 },
  science: { count: 40, minutes: 40 }, // count unchanged; time 35 → 40
};

let changed = 0;
for (const [section, t] of Object.entries(TARGETS)) {
  const dir = path.join(ROOT, "content", "act", section);
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const p = path.join(dir, f);
    const test = JSON.parse(readFileSync(p, "utf8"));
    const before = { q: test.questions.length, m: test.durationSeconds / 60 };
    // Trim to the Enhanced count (questions are ordered; keep the first N so
    // passage groups stay contiguous), renumber, and update metadata.
    test.questions = test.questions.slice(0, t.count).map((q, i) => ({ ...q, questionNumber: i + 1 }));
    test.questionCount = t.count;
    test.durationSeconds = t.minutes * 60;
    // Drop passages no remaining question references.
    if (Array.isArray(test.passages)) {
      const used = new Set(test.questions.map((q) => q.passageId).filter(Boolean));
      test.passages = test.passages.filter((pg) => used.has(pg.id));
    }
    // Refresh instructions that state the old counts/timings.
    if (typeof test.instructions === "string") {
      test.instructions = test.instructions
        .replace(/75 questions/g, "50 questions").replace(/60 questions/g, section === "math" ? "45 questions" : "60 questions")
        .replace(/40 questions/g, section === "reading" ? "36 questions" : "40 questions")
        .replace(/45 minutes/g, section === "english" ? "35 minutes" : "45 minutes")
        .replace(/60 minutes/g, section === "math" ? "50 minutes" : "60 minutes")
        .replace(/35 minutes/g, t.minutes + " minutes");
    }
    writeFileSync(p, JSON.stringify(test, null, 2));
    console.log(`  ${section}/${f}: ${before.q}q/${before.m}m → ${test.questions.length}q/${t.minutes}m (passages: ${(test.passages || []).length})`);
    changed++;
  }
}

// Full mocks: new total (core 125m + optional Science 40m as offered = 165m) + a note
// that Science is optional on the real Enhanced ACT and excluded from the composite.
const fullDir = path.join(ROOT, "content", "act", "full");
for (const f of readdirSync(fullDir).filter((x) => x.endsWith(".json"))) {
  const p = path.join(fullDir, f);
  const mock = JSON.parse(readFileSync(p, "utf8"));
  mock.durationSeconds = 165 * 60;
  mock.instructions = "Enhanced ACT format (standard from 2025–26): English 50 questions / 35 min, Math 45 / 50 min, Reading 36 / 40 min are the required core (2h 5m). Science (40 questions / 40 min) is OPTIONAL on the real exam and does not count toward your 1–36 composite — it is reported separately. We include it here so you can practise it; skip it if your target colleges don't need it.";
  for (const s of mock.sections) if (s.section === "science") s.optional = true;
  writeFileSync(p, JSON.stringify(mock, null, 2));
  console.log(`  full/${f}: duration → 165m, science marked optional`);
  changed++;
}
console.log(`Done — ${changed} files migrated to the Enhanced ACT format.`);
