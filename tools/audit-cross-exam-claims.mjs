#!/usr/bin/env node
/**
 * Cross-exam claim audit.
 *
 * Two false statements were shipped on this site, and both had the SAME shape: a claim that
 * is true for one exam, written into a generic block, and rendered on every exam's page.
 *   - "examiners penalise you for exceeding the word limit"  (false for IELTS Writing entirely)
 *   - "an answer over the limit scores zero"                 (true for IELTS/PTE gap-fill,
 *                                                             meaningless for GMAT/GRE/SAT/ACT)
 *
 * No structural audit can catch that, because the page is well-formed and the claim is simply
 * untrue for that exam. This one can: it looks for exam-SPECIFIC vocabulary appearing on the
 * pages of exams it does not belong to.
 *
 * It reports suspects for a human to judge. It does not "fix" anything — the last time exam
 * facts were rewritten from memory in this repo, 210 content files were corrupted and had to
 * be restored. Suspicion is cheap; correction requires the exam board's own page.
 */
import fs from "fs";
import path from "path";

// term -> the exams where the term is legitimately used.
const EXAM_TERMS = [
  // Tuned against a first run. Each allow-list below is the set of exams where the term is
  // genuinely correct, verified case by case — the first pass produced 11 suspects of which
  // 10 were legitimate, and over-narrow lists are how a useful audit becomes noise nobody reads.
  ["band 7", ["ielts"]],
  ["band 9", ["ielts"]],
  ["overall band", ["ielts"]],
  ["cue card", ["ielts"]],
  ["general training", ["ielts"]],
  // IELTS/PTE/CELPIP/OET gap-fills carry an explicit word cap. TOEFL's summary and table
  // items are drag-and-drop, so this instruction does not exist there — that distinction is
  // exactly the error this audit was written to catch, and it caught it.
  ["no more than two words", ["ielts", "pte", "celpip", "oet"]],
  ["speaking examiner", ["ielts"]],
  ["data insights", ["gmat"]],
  ["science section", ["act"]],
  // Deliberately NOT checked, because the first run proved them legitimate cross-exam usage:
  //   "band score"  — TOEFL's 2026 format reports 1–6 section band scores
  //   "adaptive"    — the Digital SAT and the 2026 TOEFL are both adaptive
  //   "task 1/2"    — TOEFL and CELPIP Writing genuinely have two numbered tasks
  //   "analytical writing" on GMAT — the page states its REMOVAL, which is correct
  //   "negative marking" — allow-listing every exam made it a no-op
];

const roots = ["practice", "mock-test", "learn"];
const pages = [];
for (const r of roots) {
  if (!fs.existsSync(r)) continue;
  for (const e of fs.readdirSync(r, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const f = path.join(r, e.name, "index.html");
    if (fs.existsSync(f)) pages.push({ exam: e.name.toLowerCase(), file: f, section: r });
  }
}

const suspects = [];
for (const p of pages) {
  const h = fs.readFileSync(p.file, "utf8");
  const main = (h.match(/<main[\s\S]*?<\/main>/i) || [h])[0].toLowerCase();
  for (const [term, okExams] of EXAM_TERMS) {
    if (okExams.includes(p.exam)) continue;
    const i = main.indexOf(term);
    if (i < 0) continue;
    const ctx = main.slice(Math.max(0, i - 90), i + 110).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    suspects.push({ exam: p.exam, file: p.file.replace(/\\/g, "/"), term, ctx });
  }
}

console.log("\n──────── CROSS-EXAM CLAIM AUDIT ────────");
console.log(`exam pages scanned: ${pages.length}`);
console.log(`exam-specific terms checked: ${EXAM_TERMS.length}\n`);

if (!suspects.length) {
  console.log("✓ no exam-specific language found on the wrong exam's pages");
  process.exit(0);
}

const byExam = {};
for (const s of suspects) (byExam[s.exam] = byExam[s.exam] || []).push(s);
for (const [exam, list] of Object.entries(byExam)) {
  console.log(`  ${exam.toUpperCase()} (${list.length})`);
  for (const s of list) {
    console.log(`    "${s.term}"  in ${s.file}`);
    console.log(`       …${s.ctx.slice(0, 150)}…`);
  }
  console.log("");
}
console.log(`${suspects.length} suspect(s) for human review.`);
console.log("These are SUSPECTS, not confirmed errors — some cross-references are legitimate");
console.log("(a comparison page may mention another exam on purpose). Read each before changing");
console.log("anything, and verify against the exam board's own page, never from memory.");
process.exit(0);
