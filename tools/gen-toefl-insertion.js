// gen-toefl-insertion.js — add the signature TOEFL "Insert a Sentence" item to each
// TOEFL Reading test (one per passage). Rendered as a standard MCQ (the paragraph with
// [1][2][3][4] markers + the sentence in the prompt, four "Square [n]" options) so NO
// renderer change is needed. Consumes content/toefl/insertion-bank.json (20 items).
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "content", "toefl", "reading");
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "toefl", "insertion-bank.json"), "utf8")).items;

const errors = [];
const mkPrompt = (it) =>
  `Insert the sentence — "${it.sentenceToInsert}" — into the paragraph. ` +
  `The four squares [1] [2] [3] [4] show where it could be added; choose the best position.\n\n` +
  `${it.intro ? it.intro + "\n\n" : ""}${it.paragraph}`;

let changed = 0;
const files = fs.readdirSync(DIR).filter(f => /^test-\d+\.json$/.test(f)).sort();
files.forEach((f, ti) => {
  const j = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
  const passages = j.passages || [];
  const num = f.match(/(\d+)/)[1];
  // Remove any previously-added insertion items so re-runs are idempotent.
  j.questions = (j.questions || []).filter(q => !/-ins\d+$/.test(q.id || ""));
  let maxNum = j.questions.reduce((m, q) => Math.max(m, q.num || 0), 0);
  passages.forEach((p, pi) => {
    const it = bank[(ti * 2 + pi) % bank.length];
    if (it.correctPosition < 1 || it.correctPosition > 4) { errors.push(`${f} p${pi}: bad correctPosition`); return; }
    if ((it.paragraph.match(/\[[1-4]\]/g) || []).length !== 4) { errors.push(`${f} p${pi}: not 4 markers`); return; }
    maxNum++;
    j.questions.push({
      id: `toefl-reading-${num}-ins${pi + 1}`,
      passageId: p.id || `toefl-reading-${num}-p${pi + 1}`, passageIndex: pi,
      questionType: "multiple_choice", num: maxNum,
      prompt: mkPrompt(it),
      options: ["Square [1]", "Square [2]", "Square [3]", "Square [4]"],
      correctAnswer: `Square [${it.correctPosition}]`,
      explanation: it.explanation || "",
    });
  });
  j.questionCount = j.questions.length;
  fs.writeFileSync(path.join(DIR, f), JSON.stringify(j, null, 2));
  changed++;
});

if (errors.length) { console.error(`✗ ${errors.length} errors:`); errors.slice(0, 20).forEach(e => console.error("  " + e)); process.exit(1); }
console.log(`✅ Added Insert-a-Sentence items to ${changed} TOEFL reading tests (1 per passage).`);
