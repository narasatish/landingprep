// Builds full-mock composition files + manifest entries for exams that have
// section tests but no assembled full mocks yet (OET, SAT, ACT). A full mock
// only REFERENCES existing section files (no content duplication) — same shape
// the other exams already use. Re-runnable; safe to run after adding sections.
//
// Run:  node tools/build-missing-fullmocks.mjs
import fs from "fs";
import path from "path";

const C = "content";
const manifestPath = path.join(C, "manifest.json");
const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

// Realistic section order per exam (the order a candidate sits the real test).
const PLAN = {
  oet: ["listening", "reading", "writing", "speaking"],
  sat: ["reading-writing", "math"],
  act: ["english", "math", "reading", "science"],
};

let total = 0;
for (const [exam, order] of Object.entries(PLAN)) {
  const ex = m.exams[exam];
  if (!ex || !ex.sections) { console.log(`skip ${exam}: not in manifest`); continue; }
  const names = order.filter((s) => ex.sections[s] && ex.sections[s].length);
  if (names.length !== order.length) {
    console.log(`warn ${exam}: missing sections ${order.filter((s) => !names.includes(s)).join(",")}`);
  }
  const N = Math.min(...names.map((s) => ex.sections[s].length)); // limited by the scarcest section
  const dir = path.join(C, exam, "full");
  fs.mkdirSync(dir, { recursive: true });

  const entries = [];
  for (let i = 1; i <= N; i++) {
    const idx = i - 1;
    const sections = names.map((s) => {
      const t = ex.sections[s][idx];
      return { section: t.section, testId: t.id, file: t.file };
    });
    const durationSeconds = names.reduce((sum, s) => sum + (ex.sections[s][idx].durationSeconds || 0), 0);
    const num = String(i).padStart(3, "0");
    const file = `${exam}/full/mock-${num}.json`;
    const id = `${exam}-full-${num}`;
    const title = `${ex.name} Full Mock Test ${i}`;
    const variant = ex.sections[names[0]][idx].variant || "standard";

    const fullMock = {
      id, exam, type: "full", title, durationSeconds,
      instructions: "Full mock composition file. Load section files lazily in order.",
      sections,
    };
    fs.writeFileSync(path.join(C, exam, "full", `mock-${num}.json`), JSON.stringify(fullMock, null, 2) + "\n");
    entries.push({ id, title, exam, type: "full", durationSeconds, sectionCount: names.length, file, version: 3, variant });
    total++;
  }
  ex.fullMocks = entries;
  console.log(`${exam}: built ${N} full mocks (${names.join(" -> ")}, ${entries[0]?.durationSeconds}s each)`);
}

fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2) + "\n");
console.log(`Done. ${total} full mocks written + manifest.exams[*].fullMocks updated.`);
