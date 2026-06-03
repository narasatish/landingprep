// backfill-answers-explanations.mjs — ensure EVERY question has the right "answer at the
// end": objective questions get a point-to-point explanation built from their own answer
// key; productive questions (writing/speaking) get a model answer. Only fills MISSING
// fields — never overwrites authored content. Run after any content regeneration.
import fs from "fs"; import path from "path";
const BASE = "content";
const PRODUCTIVE = new Set(["essay", "write_essay", "writing_task", "email", "survey_response",
  "summarize_written_text", "summarize_spoken_text", "speaking_task", "giving_advice", "personal_experience",
  "describing_a_scene", "making_predictions", "comparing_and_persuading", "dealing_with_situation",
  "expressing_opinions", "unusual_situation", "describe_image", "write_about_photo", "speak_about_photo",
  "read_then_speak", "integrated_writing", "academic_discussion", "retell_lecture",
  "read_aloud", "repeat_sentence", "answer_short_question"]);
const list = (a) => (Array.isArray(a) ? a : [a]).filter((x) => x != null && x !== "").join(", ");
let added = { expl: 0, model: 0 };

// Extract a human answer string + a type-appropriate reason from whatever fields exist.
function explanationFor(q) {
  const t = q.questionType || q.type || "";
  if (Array.isArray(q.blanks) && q.blanks.some((b) => b && b.a != null)) {
    const parts = q.blanks.map((b, i) => `Blank ${i + 1}: “${b.a}”${b.e ? ` — ${b.e}` : ""}`);
    return parts.join("  ");
  }
  if (Array.isArray(q.correctOrder) && q.correctOrder.length)
    return `The correct order is ${q.correctOrder.join(" → ")}, following the logical flow of the text (topic sentence first, then supporting and concluding ideas).`;
  if (Array.isArray(q.incorrectWords) && q.incorrectWords.length)
    return `The words that differ from the recording are: ${list(q.incorrectWords)}${Array.isArray(q.correctWords) ? ` (you actually hear: ${list(q.correctWords)})` : ""}.`;
  if (q.correctPosition != null)
    return `The sentence fits best at position [${q.correctPosition}] — that is where the pronoun/connector links it to the surrounding ideas.`;
  if (Array.isArray(q.correctAnswers) && q.correctAnswers.length) {
    if (/fill|blank|dictation/i.test(t)) return `The missing words, in order, are: ${list(q.correctAnswers)}.`;
    return `The correct answers are: ${list(q.correctAnswers)}. Each is stated or directly supported by the passage/recording; the other options are not.`;
  }
  if (q.correctAnswer != null && q.correctAnswer !== "") {
    const a = Array.isArray(q.correctAnswer) ? list(q.correctAnswer) : q.correctAnswer;
    if (/dictation/i.test(t)) return `Type the sentence exactly as dictated: “${a}”. Spelling and word order are both scored.`;
    return `The correct answer is “${a}” — it is the option directly supported by the passage/recording; the others are not.`;
  }
  return null; // no answer key present → cannot explain (handled elsewhere)
}
function modelFor(q) {
  const topic = String(q.topic || "the topic").replace(/^\[\d+\]\s*/, "");
  const prompt = String(q.prompt || q.question || "").replace(/^\[\d+\]\s*/, "");
  const written = /write|essay|email|survey|discussion|summar/i.test(q.questionType || "");
  return `A strong ${written ? "written" : "spoken"} response addresses the prompt fully with a clear structure. For “${prompt || topic}”, you might ${written ? "write" : "say"}: “${topic[0] ? topic[0].toUpperCase() + topic.slice(1) : "This"} is something I have thought about. In my experience, … For example, … Overall, I believe ….” Aim for ${written ? "well-organised sentences" : "fluent, well-paced speech"} with specific details and accurate grammar.`;
}

for (const exam of fs.readdirSync(BASE)) {
  const ed = path.join(BASE, exam); if (!fs.statSync(ed).isDirectory() || exam === "learning-hub") continue;
  for (const section of fs.readdirSync(ed)) {
    const sd = path.join(ed, section); if (!fs.existsSync(sd) || !fs.statSync(sd).isDirectory()) continue;
    for (const f of fs.readdirSync(sd).filter((x) => /^test-\d+\.json$/.test(x))) {
      const file = path.join(sd, f);
      let j; try { j = JSON.parse(fs.readFileSync(file, "utf8")); } catch { continue; }
      let dirty = false;
      for (const q of (j.questions || j.items || [])) {
        const t = q.questionType || q.type || "";
        const productive = PRODUCTIVE.has(t);
        if (productive) {
          const has = q.modelAnswer || q.sampleAnswer || q.sampleResponse;
          if (!has) { q.modelAnswer = modelFor(q); added.model++; dirty = true; }
        } else if (!q.explanation) {
          const e = explanationFor(q);
          if (e) { q.explanation = e; added.expl++; dirty = true; }
        }
      }
      if (dirty) fs.writeFileSync(file, JSON.stringify(j, null, 2));
    }
  }
}
console.log(`✅ Backfilled ${added.expl} explanations + ${added.model} model answers (only where missing).`);
