// tools/validate-toefl-reading.mjs
//
// Strict schema + quality gate for TOEFL reading test files. Run after
// (re)writing any content/toefl/reading/test-*.json to catch schema drift,
// answer-key mismatches, wrong question-type mix, or leftover template text.
//
// Usage: node tools/validate-toefl-reading.mjs [test-004.json test-005.json ...]
//        (no args = validate all test-*.json in content/toefl/reading)

import fs from "node:fs";
import path from "node:path";

const DIR = path.resolve(import.meta.dirname, "..", "content", "toefl", "reading");
const TEMPLATE_MARK = "is an important subject of modern scientific and scholarly investigation";
const DIST = { // required question-type count PER passage
  factual_information: 3, vocabulary_in_context: 2, inference: 1,
  rhetorical_purpose: 1, negative_factual: 1, sentence_simplification: 1, prose_summary: 1,
};
const LETTERS = ["A", "B", "C", "D", "E", "F"];

const args = process.argv.slice(2);
const files = (args.length ? args : fs.readdirSync(DIR).filter(f => /^test-\d+\.json$/.test(f))).sort();

let errors = 0;
const err = (f, msg) => { console.error(`✗ ${f}: ${msg}`); errors++; };

for (const fname of files) {
  const f = path.basename(fname);
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8").replace(/^﻿/, "")); }
  catch (e) { err(f, "invalid JSON: " + e.message); continue; }

  const num = (f.match(/(\d+)/) || [])[1];
  const idBase = `toefl-reading-${num}`;

  // Metadata
  if (j.id !== idBase) err(f, `id should be ${idBase}, got ${j.id}`);
  if (j.exam !== "toefl" || j.section !== "reading" || j.type !== "section" || j.variant !== "ibt")
    err(f, "metadata (exam/section/type/variant) drifted");
  if (j.durationSeconds !== 1620) err(f, "durationSeconds must be 1620");
  if (j.questionCount !== 20) err(f, "questionCount must be 20");

  // Passages
  const ps = j.passages || [];
  if (ps.length !== 2) { err(f, `expected 2 passages, got ${ps.length}`); continue; }
  ps.forEach((p, i) => {
    if (p.id !== `${idBase}-p${i + 1}`) err(f, `passage ${i + 1} id should be ${idBase}-p${i + 1}`);
    if (!p.title || p.title.length < 4) err(f, `passage ${i + 1} missing title`);
    const wc = (String(p.text || "").match(/\S+/g) || []).length;
    if (wc < 420 || wc > 720) err(f, `passage ${i + 1} word count ${wc} out of range (420–720)`);
    if (String(p.text || "").includes(TEMPLATE_MARK)) err(f, `passage ${i + 1} still contains TEMPLATE boilerplate`);
    if (!["easy", "medium", "hard"].includes(p.difficulty)) err(f, `passage ${i + 1} difficulty invalid: ${p.difficulty}`);
    // paragraph structure: real passages have multiple paragraphs
    if (String(p.text || "").split(/\n\n+/).length < 3) err(f, `passage ${i + 1} has fewer than 3 paragraphs`);
  });

  // Questions
  const qs = j.questions || [];
  if (qs.length !== 20) { err(f, `expected 20 questions, got ${qs.length}`); continue; }
  for (const idx of [0, 1]) {
    const pqs = qs.filter(q => q.passageIndex === idx);
    if (pqs.length !== 10) err(f, `passage ${idx} should have 10 questions, has ${pqs.length}`);
    const dist = {};
    pqs.forEach(q => { dist[q.questionType] = (dist[q.questionType] || 0) + 1; });
    for (const [t, n] of Object.entries(DIST))
      if ((dist[t] || 0) !== n) err(f, `passage ${idx}: ${t} count ${dist[t] || 0}, expected ${n}`);
  }
  qs.forEach((q, i) => {
    const n = i + 1;
    const qid = `${idBase}-q${String(n).padStart(2, "0")}`;
    if (q.id !== qid) err(f, `q${n} id should be ${qid}, got ${q.id}`);
    if (q.num !== n) err(f, `q${n} num field mismatch`);
    const expectPidx = i < 10 ? 0 : 1;
    if (q.passageIndex !== expectPidx) err(f, `q${n} passageIndex should be ${expectPidx}`);
    if (q.passageId !== `${idBase}-p${expectPidx + 1}`) err(f, `q${n} passageId mismatch`);
    if (!q.prompt || q.prompt.length < 8) err(f, `q${n} missing prompt`);
    if (!q.explanation || q.explanation.length < 8) err(f, `q${n} missing explanation`);
    if (!Array.isArray(q.options)) { err(f, `q${n} missing options`); return; }
    if (q.questionType === "prose_summary") {
      if (q.options.length !== 6) err(f, `q${n} prose_summary needs 6 options`);
      q.options.forEach((o, k) => { if (!String(o).startsWith(LETTERS[k] + ". ")) err(f, `q${n} option ${k} should start "${LETTERS[k]}. "`); });
      const picks = String(q.correctAnswer || "").split(",").map(s => s.trim());
      if (picks.length !== 3) err(f, `q${n} prose_summary correctAnswer should be 3 letters like "A,C,D"`);
      picks.forEach(p => { if (!["A", "B", "C", "D", "E", "F"].includes(p)) err(f, `q${n} prose_summary bad letter "${p}"`); });
    } else {
      if (q.options.length !== 4) err(f, `q${n} should have 4 options (has ${q.options.length})`);
      if (!q.options.map(String).includes(String(q.correctAnswer)))
        err(f, `q${n} correctAnswer "${q.correctAnswer}" does not exactly match any option`);
      if (new Set(q.options.map(String)).size !== q.options.length) err(f, `q${n} has duplicate options`);
    }
  });
}

if (errors) { console.error(`\n✗ ${errors} problem(s) across ${files.length} file(s).`); process.exit(1); }
console.log(`✓ ${files.length} TOEFL reading file(s) valid — schema, answer keys, type mix, no template text.`);
