// audit-answers.mjs — verify EVERY question in EVERY test of EVERY exam/section has
// (a) an answer key (objective Q) or a model answer (productive Q), and
// (b) a point-to-point explanation (objective Q).
// Reports per exam/section the tests with gaps, so nothing is missed. Exits 1 on gaps.
import fs from "fs"; import path from "path";
const BASE = "content";
const ANS = ["correctAnswer", "correctAnswers", "correctOption", "answer", "incorrectWords", "correctOrder", "correctPosition"];
const MODEL = ["modelAnswer", "sampleAnswer", "sampleResponse", "modelResponse"];
// Productive types = no single right answer; they need a MODEL answer instead of a key.
const PRODUCTIVE = new Set(["essay", "write_essay", "writing_task", "email", "survey_response",
  "summarize_written_text", "summarize_spoken_text", "speaking_task", "giving_advice", "personal_experience",
  "describing_a_scene", "making_predictions", "comparing_and_persuading", "dealing_with_situation",
  "expressing_opinions", "unusual_situation", "describe_image", "write_about_photo", "speak_about_photo",
  "read_then_speak", "integrated_writing", "academic_discussion", "retell_lecture",
  "read_aloud", "repeat_sentence", "answer_short_question",
  "role_play", "letter"]); // OET: role_play = speaking role card; letter = formal letter (no single correct answer)
const has = (it, keys) => keys.some(k => { const v = it[k]; return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0); });
const itemsOf = (j) => j.questions || j.items || j.tasks || (j.parts || []).flatMap(p => p.questions || p.items || []) || [];

let totalQ = 0, noAns = 0, noExpl = 0;
const sectionGaps = {}; // "exam/section" -> {ansTests:Set, explTests:Set, ansN, explN, tests}
for (const exam of fs.readdirSync(BASE)) {
  const ed = path.join(BASE, exam); if (!fs.statSync(ed).isDirectory() || exam === "learning-hub") continue;
  for (const section of fs.readdirSync(ed)) {
    const sd = path.join(ed, section); if (!fs.existsSync(sd) || !fs.statSync(sd).isDirectory()) continue;
    const files = fs.readdirSync(sd).filter(f => /^test-\d+\.json$/.test(f) || f.endsWith(".json"));
    if (!files.length) continue;
    const key = `${exam}/${section}`;
    const g = sectionGaps[key] = { ansTests: new Set(), explTests: new Set(), ansN: 0, explN: 0, tests: 0 };
    for (const f of files) {
      let j; try { j = JSON.parse(fs.readFileSync(path.join(sd, f), "utf8")); } catch { continue; }
      g.tests++;
      for (const it of itemsOf(j)) {
        totalQ++;
        const t = it.questionType || it.type || it.taskType || "?";
        const productive = PRODUCTIVE.has(t);
        const hasAns = has(it, ANS), hasModel = has(it, MODEL);
        if (!hasAns && !hasModel) { noAns++; g.ansN++; g.ansTests.add(f); }
        if (!productive && !it.explanation) { noExpl++; g.explN++; g.explTests.add(f); }
      }
    }
  }
}
console.log(`Scanned ${totalQ} questions across all exams.\n`);
console.log("Section".padEnd(26) + "tests  NO-ANSWER(tests)   NO-EXPLANATION(tests)");
console.log("-".repeat(74));
let anyGap = false;
for (const k of Object.keys(sectionGaps).sort()) {
  const g = sectionGaps[k];
  const a = g.ansN ? `${g.ansN}(${g.ansTests.size})` : "·";
  const e = g.explN ? `${g.explN}(${g.explTests.size})` : "·";
  if (g.ansN || g.explN) anyGap = true;
  console.log(k.padEnd(26) + String(g.tests).padStart(4) + "   " + a.padEnd(18) + e);
}
console.log("-".repeat(74));
console.log(`TOTAL missing answers: ${noAns}   |   missing explanations (objective Q): ${noExpl}`);
process.exit(anyGap ? 1 : 0);
