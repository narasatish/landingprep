#!/usr/bin/env node
/**
 * answerKey drift guard.
 *
 * 210 content files carry a top-level `answerKey` map alongside each question's
 * own `correctAnswer`. Nothing in the app reads it — grading runs off
 * `correctAnswer` — so when it drifted, nothing failed. 90 files had drifted:
 * gmat/data-insights had every question in a test keyed to the same string.
 *
 * Two sources of truth for the same fact is the bug. This makes the second one
 * provably a copy: answerKey[q.id] must equal q.correctAnswer exactly.
 *
 *   node tools/audit-answer-key-sync.mjs        report
 *   node tools/audit-answer-key-sync.mjs --fix  rewrite answerKey from correctAnswer
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "content");
const FIX = process.argv.includes("--fix");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}

let carry = 0, drifted = 0, fixed = 0, orphanIds = 0;
const bad = [];

for (const file of walk(ROOT)) {
  let j;
  try { j = JSON.parse(fs.readFileSync(file, "utf8")); } catch { continue; }
  if (!j.answerKey || typeof j.answerKey !== "object" || Array.isArray(j.answerKey)) continue;
  const qs = Array.isArray(j.questions) ? j.questions : [];
  if (!qs.length) continue;
  carry++;

  const want = {};
  for (const q of qs) if (q && q.id != null && q.correctAnswer !== undefined) want[q.id] = q.correctAnswer;

  // keys in answerKey that match no question at all
  const qids = new Set(qs.map((q) => q && q.id));
  const orphans = Object.keys(j.answerKey).filter((k) => !qids.has(k));
  orphanIds += orphans.length;

  let mismatch = 0;
  for (const [id, v] of Object.entries(want)) {
    if (String(j.answerKey[id]) !== String(v)) mismatch++;
  }

  if (mismatch || orphans.length) {
    drifted++;
    bad.push(`${path.relative(ROOT, file).replace(/\\/g, "/")}  ${mismatch}/${qs.length} wrong` +
      (orphans.length ? `, ${orphans.length} orphan id(s)` : ""));
    if (FIX) {
      j.answerKey = want;
      fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
      fixed++;
    }
  }
}

console.log("\n──────── ANSWER-KEY SYNC ────────");
console.log(`files carrying answerKey : ${carry}`);
console.log(`out of sync              : ${drifted}`);
if (orphanIds) console.log(`orphan answerKey ids     : ${orphanIds}`);
bad.slice(0, 12).forEach((b) => console.log("  " + b));
if (bad.length > 12) console.log(`  … and ${bad.length - 12} more`);

if (FIX) {
  console.log(`\n✓ rewrote answerKey from correctAnswer in ${fixed} file(s)`);
  process.exit(0);
}
if (drifted) {
  console.log(`\n✗ ${drifted} file(s) have an answerKey that disagrees with correctAnswer.`);
  console.log("  Run: node tools/audit-answer-key-sync.mjs --fix");
  process.exit(1);
}
console.log("\n✓ every answerKey matches its questions' correctAnswer");
