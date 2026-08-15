#!/usr/bin/env node
/**
 * Re-key clustered answer distributions.
 *
 * gmat/verbal was 65% scoreable by always choosing B; ielts/listening 60% by choosing C.
 * That is a real product defect: a student can beat these papers without reading them.
 *
 * This was deferred once for a good reason. A previous library-wide rotation broke four
 * questions because it reordered shared option banks, and 52 GMAT questions REFERENCE a
 * letter inside their own text ("the assumption in B"), so blindly permuting options makes
 * the question incoherent.
 *
 * So this rotates only questions it can prove are safe:
 *   - every text field is scanned for a letter reference; any hit and the question is skipped
 *   - options must be self-contained (no "both A and C", "none of the above", "all of the above")
 *   - the option list must be unique and contain the keyed answer
 * and it preserves each file's own answer format (letter key vs full-text key).
 *
 *   node tools/rekey-answer-spread.mjs            report
 *   node tools/rekey-answer-spread.mjs --write    apply
 */
import fs from "fs";
import path from "path";

const WRITE = process.argv.includes("--write");
const ROOT = path.join(process.cwd(), "content");
const LETTERS = "ABCDE";

// Any reference to an option letter anywhere in the question's own prose makes rotation unsafe.
const LETTER_REF = /\b(?:option|choice|answer|statement|assumption|conclusion)s?\s*\(?[A-E]\b|\b[A-E]\)\s|\((?:[A-E])\)/;
const NON_ROTATABLE_OPT = /\b(?:all|none|both|neither)\s+of\s+the\s+above\b|\bboth\s+[A-E]\s+and\s+[A-E]\b|\b[A-E]\s+and\s+[A-E]\s+only\b/i;

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}

const stripPrefix = (s) => String(s).replace(/^\s*[A-E][.)]\s*/, "");
const hasPrefix = (opts) => opts.every((o) => /^\s*[A-E][.)]\s/.test(String(o)));

let filesTouched = 0, qRotated = 0, qSkipped = 0;
const before = [], after = [];

for (const file of walk(ROOT)) {
  let j;
  try { j = JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, "")); } catch { continue; }
  const qs = Array.isArray(j.questions) ? j.questions : [];
  if (qs.length < 8) continue;

  // current distribution
  const idxOf = (q) => {
    const opts = Array.isArray(q.options) ? q.options : null;
    if (!opts || opts.length < 2) return -1;
    const ca = q.correctAnswer;
    if (typeof ca === "string" && /^[A-E]$/.test(ca)) return LETTERS.indexOf(ca);
    return opts.findIndex((o) => String(o) === String(ca) || stripPrefix(o) === stripPrefix(String(ca)));
  };
  const positions = qs.map(idxOf);
  const valid = positions.filter((p) => p >= 0);
  if (valid.length < 8) continue;
  const counts = {};
  valid.forEach((p) => (counts[p] = (counts[p] || 0) + 1));
  const worst = Math.max(...Object.values(counts)) / valid.length;
  if (worst <= 0.45) continue;   // already acceptable

  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  before.push([rel, Math.round(worst * 100)]);

  // Rotate the safe questions toward an even spread, round-robin over option slots.
  let target = 0, changed = 0;
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const cur = positions[i];
    const opts = Array.isArray(q.options) ? q.options.slice() : null;
    if (cur < 0 || !opts) { qSkipped++; continue; }

    const prose = [q.prompt, q.question, q.explanation, q.text, q.stem].filter(Boolean).join(" ");
    if (LETTER_REF.test(prose)) { qSkipped++; continue; }
    if (opts.some((o) => NON_ROTATABLE_OPT.test(String(o)))) { qSkipped++; continue; }
    const bare = opts.map(stripPrefix);
    if (new Set(bare).size !== bare.length) { qSkipped++; continue; }

    const n = opts.length;
    const want = target++ % n;
    if (want === cur) continue;

    const prefixed = hasPrefix(opts);
    // move the correct option to slot `want`, keep the others in their relative order
    const rest = bare.filter((_, k) => k !== cur);
    const next = [];
    let r = 0;
    for (let k = 0; k < n; k++) next.push(k === want ? bare[cur] : rest[r++]);

    q.options = prefixed ? next.map((t, k) => `${LETTERS[k]}. ${t}`) : next;
    if (typeof q.correctAnswer === "string" && /^[A-E]$/.test(q.correctAnswer)) q.correctAnswer = LETTERS[want];
    else q.correctAnswer = q.options[want];
    changed++; qRotated++;
  }

  if (!changed) continue;
  // recompute
  const pos2 = qs.map(idxOf).filter((p) => p >= 0);
  const c2 = {};
  pos2.forEach((p) => (c2[p] = (c2[p] || 0) + 1));
  const worst2 = Math.max(...Object.values(c2)) / pos2.length;
  after.push([rel, Math.round(worst2 * 100)]);

  if (WRITE) {
    if (j.answerKey && typeof j.answerKey === "object") {
      const k = {};
      for (const q of qs) if (q && q.id != null && q.correctAnswer !== undefined) k[q.id] = q.correctAnswer;
      j.answerKey = k;
    }
    fs.writeFileSync(file, JSON.stringify(j, null, 2) + "\n");
  }
  filesTouched++;
}

console.log("\n──────── ANSWER-SPREAD RE-KEY ────────");
console.log(`files needing re-key : ${before.length}`);
console.log(`files changed        : ${filesTouched}`);
console.log(`questions rotated    : ${qRotated}`);
console.log(`questions skipped as unsafe (letter reference / linked options) : ${qSkipped}`);
if (before.length) {
  const b = before.reduce((s, x) => s + x[1], 0) / before.length;
  const a = after.length ? after.reduce((s, x) => s + x[1], 0) / after.length : b;
  console.log(`\nmean best-single-letter score: ${b.toFixed(0)}% -> ${a.toFixed(0)}%`);
  after.slice(0, 6).forEach(([f, v], i) => console.log(`  ${f}  ${before[i] ? before[i][1] : "?"}% -> ${v}%`));
}
if (!WRITE) console.log("\n(dry run — pass --write to apply)");
