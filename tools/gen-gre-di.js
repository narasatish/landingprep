// gen-gre-di.js — add a Data Interpretation set (the chart/table questions that ALWAYS
// appear in real GRE Quant) to each GRE Quant test. Real GRE Quant = exactly 27 questions,
// so we REPLACE the last 3 with a 3-question DI set sharing one data table (keeps the count).
// Idempotent: re-running swaps the DI set, never grows the test. Consumes content/gre/di-bank.json.
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "content", "gre", "quant");
const SETS = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "gre", "di-bank.json"), "utf8")).sets;
if (!SETS.length) { console.error("✗ no DI sets in bank"); process.exit(1); }

const errors = [];
let changed = 0;
const files = fs.readdirSync(DIR).filter(f => /^test-\d+\.json$/.test(f)).sort();
files.forEach((f, ti) => {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const num = f.match(/(\d+)/)[1];
  // Drop any previously-added DI questions, keep the first 24 base questions.
  const base = (j.questions || []).filter(q => q.questionType !== "data_interpretation").slice(0, 24);
  const set = SETS[ti % SETS.length];
  const dataTable = { caption: (set.title ? set.title + " — " : "") + (set.dataCaption || ""), headers: set.headers, rows: set.rows };
  const di = (set.questions || []).map((q, k) => {
    if (!q.options || q.options.length !== 5) errors.push(`${f} DI q${k}: not 5 options`);
    if (!q.options || !q.options.includes(q.correctAnswer)) errors.push(`${f} DI q${k}: correctAnswer not in options`);
    return {
      id: `gre-quant-${num}-di${k + 1}`, questionType: "data_interpretation",
      topic: "Data Interpretation", prompt: q.prompt, difficulty: "medium",
      options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation || "",
      dataTable,
    };
  });
  const all = [...base, ...di];
  all.forEach((q, i) => { q.questionNumber = i + 1; });
  if (all.length !== 27) errors.push(`${f}: ${all.length} questions (need 27)`);
  j.questions = all;
  j.questionCount = all.length;
  if (Array.isArray(j.sections)) { /* leave section grouping as-is; counts unchanged */ }
  fs.writeFileSync(path.join(DIR, f), JSON.stringify(j, null, 2));
  changed++;
});

if (errors.length) { console.error(`✗ ${errors.length} errors:`); errors.slice(0, 20).forEach(e => console.error("  " + e)); process.exit(1); }
console.log(`✅ Added a Data Interpretation set (3 Qs + shared table) to ${changed} GRE Quant tests; each stays at 27 questions.`);
