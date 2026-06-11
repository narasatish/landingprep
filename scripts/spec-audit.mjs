// Spec-compliance audit: checks every catalog test file against content/exam-patterns.json
// (the authoritative per-exam spec). Reports structural deviations — part counts, questions
// per part, totals, item types, durations, missing answer keys. Run: node scripts/spec-audit.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SPEC = JSON.parse(fs.readFileSync(path.join(ROOT, "content/exam-patterns.json"), "utf8")).exams;

function listFiles(exam, section) {
  const dir = path.join(ROOT, "content", exam, section);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".json")).map(f => path.join(dir, f));
}
function read(f) { try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; } }
const hasAns = q => q && (q.answer !== undefined || q.correctAnswer !== undefined || Array.isArray(q.answers) || Array.isArray(q.correctAnswers) || Array.isArray(q.sentences) || Array.isArray(q.incorrectWords) || q.modelAnswer !== undefined || q.sampleResponse !== undefined || Array.isArray(q.order) || Array.isArray(q.correctOrder) || q.correctWord !== undefined);

let totalFiles = 0, totalDev = 0;
const summary = [];

for (const exam of Object.keys(SPEC)) {
  const secs = SPEC[exam].sections || {};
  for (const secId of Object.keys(secs)) {
    const spec = secs[secId];
    const files = listFiles(exam, secId);
    if (!files.length) { summary.push(`  ⚠️  ${exam}/${secId}: NO catalog files (spec expects this section)`); continue; }
    let compliant = 0; const devs = [];
    for (const f of files) {
      totalFiles++;
      const t = read(f); const name = path.basename(f);
      if (!t) { devs.push(`${name}: unparseable`); totalDev++; continue; }
      const issues = [];
      const isQ = ["listening", "reading", "quant", "verbal", "reading-writing", "math", "english", "science"].includes(secId);
      if (isQ) {
        const qs = t.questions || [];
        // total question count
        if (spec.questionCount && qs.length !== spec.questionCount) issues.push(`${qs.length} Q (spec ${spec.questionCount})`);
        // per-part counts (listening)
        if (Array.isArray(spec.questionsPerPart)) {
          const byPart = {}; qs.forEach(q => { const p = q.part || 1; byPart[p] = (byPart[p] || 0) + 1; });
          const got = Object.keys(byPart).sort((a, b) => a - b).map(k => byPart[k]);
          if (JSON.stringify(got) !== JSON.stringify(spec.questionsPerPart)) issues.push(`parts ${JSON.stringify(got)} (spec ${JSON.stringify(spec.questionsPerPart)})`);
        }
        if (spec.parts && Array.isArray(t.parts) && t.parts.length !== spec.parts) issues.push(`${t.parts.length} parts (spec ${spec.parts})`);
        // item types
        if (Array.isArray(spec.itemTypes) && spec.itemTypes.length) {
          const bad = qs.filter(q => q.type && !spec.itemTypes.includes(q.type) && !spec.itemTypes.includes(q.questionType));
          if (bad.length) issues.push(`${bad.length} off-spec types e.g. "${bad[0].type || bad[0].questionType}"`);
        }
        // answer keys
        const noAns = qs.filter(q => !hasAns(q)).length;
        if (noAns) issues.push(`${noAns} missing answer`);
      } else {
        // writing/speaking: task-based
        const tasks = t.tasks || t.questions || [];
        if (spec.taskCount && tasks.length !== spec.taskCount) issues.push(`${tasks.length} tasks (spec ${spec.taskCount})`);
      }
      // duration
      if (spec.durationMinutes && t.durationSeconds && Math.abs(t.durationSeconds - spec.durationMinutes * 60) > 600)
        issues.push(`${Math.round(t.durationSeconds / 60)}min (spec ${spec.durationMinutes})`);
      if (issues.length) { devs.push(`${name}: ${issues.join("; ")}`); totalDev++; } else compliant++;
    }
    const pct = Math.round(compliant / files.length * 100);
    summary.push(`  ${pct === 100 ? "✅" : "⚠️"}  ${exam}/${secId}: ${compliant}/${files.length} compliant (${pct}%)` + (devs.length ? `\n       e.g. ${devs.slice(0, 3).join("\n       ")}` : ""));
  }
}

console.log("═══ SPEC COMPLIANCE AUDIT (catalog vs exam-patterns.json) ═══\n");
console.log(summary.join("\n"));
console.log(`\n═══ ${totalFiles} files checked · ${totalDev} with deviations ═══`);
