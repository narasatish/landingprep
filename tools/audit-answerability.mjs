// Can a student actually select the correct answer to every question?
//
// Written after finding that 227 matching-headings questions were impossible to answer: the
// renderer labelled only five options while the heading bank held ten, so the correct answer
// sat past the end of the clickable list. Nothing errored, every page rendered, the smoke
// test passed. Only simulating the answer path caught it.
//
// For every question in every test this checks, against the REAL normalizer output:
//   - the question survives normalisation with usable text
//   - an objective question has a non-empty answer key
//   - a letter answer (A, B, C…) points at an option that actually exists
//   - a multi-select answer's letters all exist
//   - a true/false/not-given answer is one of the accepted values
//
//   node tools/audit-answerability.mjs            report
//   node tools/audit-answerability.mjs --strict   exit 1 if any question is unanswerable
import fs from "fs";
import path from "path";
import url from "url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const STRICT = process.argv.includes("--strict");

global.window = {};
// eslint-disable-next-line no-eval
eval(fs.readFileSync(path.join(ROOT, "normalize-test.js"), "utf8"));
const N = global.window.LP_NORMALIZE;

// Types whose "answer" is a rubric judgement, not a key — nothing to verify here.
const SUBJECTIVE = new Set(["speaking_task", "writing_task", "pte_rwfib", "essay", "pte_sst", "pte_swt"]);
const LETTER = /^[A-Z]$/;
const TFNG = new Set(["T", "F", "NG", "TRUE", "FALSE", "NOT GIVEN"]);
const YNNG = new Set(["Y", "N", "NG", "YES", "NO", "NOT GIVEN"]);

const manifest = JSON.parse(fs.readFileSync(path.join(CONTENT, "manifest.json"), "utf8"));
const problems = [];
let total = 0, files = 0;

const containers = (norm) => {
  const out = [];
  const collect = (s) => {
    for (const k of ["parts", "passages"]) for (const c of (s[k] || [])) out.push(c);
    for (const k of ["items", "cards", "tasks", "questions"]) {
      if (Array.isArray(s[k]) && s[k].length) out.push({ questions: s[k] });
    }
  };
  for (const s of (norm.sections || [])) collect(s);
  if (norm.parts) out.push(...norm.parts);
  return out;
};

for (const [exam, ev] of Object.entries(manifest.exams || {})) {
  for (const [sec, list] of Object.entries(ev.sections || {})) {
    // Speaking and writing are marked by a human or the AI examiner; there is no key to check.
    const rubricSection = /speaking|writing|production|conversation/.test(sec);
    for (const e of list || []) {
      const f = path.join(CONTENT, e.file || "");
      if (!e.file || !fs.existsSync(f)) continue;
      let norm;
      try { norm = N.normaliseTest(JSON.parse(fs.readFileSync(f, "utf8"))); }
      catch (err) { problems.push({ where: `${exam}/${sec}`, file: path.basename(f), q: "-", why: "test does not normalise: " + err.message.slice(0, 60) }); continue; }
      files++;

      for (const c of containers(norm)) {
        for (const q of (c.questions || [])) {
          total++;
          const at = { where: `${exam}/${sec}`, file: path.basename(f), q: q.num || q.id || "?" };
          // Options do not always live in `options`. match_cat renders a select built from
          // categoryOptions; map_label builds one from mapLetters (or the keys of mapKey).
          // Treating those as "no options" made this audit report 600 false alarms.
          const opts = Array.isArray(q.options) ? q.options
            : Array.isArray(q.categoryOptions) ? q.categoryOptions
            : Array.isArray(q.mapLetters) ? q.mapLetters
            : (q.mapKey && typeof q.mapKey === "object") ? Object.keys(q.mapKey)
            : null;
          const ans = q.answer;

          const text = String(q.text || q.sentenceText || q.prompt || q.topic || "").trim();
          const hasOwnBody = q.passage || q.paragraphs || q.sentence || q.visual;
          if (!text && !hasOwnBody && !SUBJECTIVE.has(q.type) && !rubricSection && q.type) {
            problems.push({ ...at, why: `[${q.type}] no question text` });
          }
          if (SUBJECTIVE.has(q.type) || rubricSection || !q.type) continue;

          const empty = ans === undefined || ans === null || ans === "" || (Array.isArray(ans) && !ans.length);
          if (empty) { problems.push({ ...at, why: `[${q.type}] no answer key` }); continue; }

          const letters = Array.isArray(ans) ? ans : [ans];
          const isLetterAnswer = letters.every((a) => typeof a === "string" && LETTER.test(a));

          if (isLetterAnswer && opts) {
            const reach = opts.length;                       // renderer labels A..(A+len-1)
            for (const a of letters) {
              const idx = a.charCodeAt(0) - 65;
              if (idx < 0 || idx >= reach) {
                problems.push({ ...at, why: `[${q.type}] answer "${a}" is outside the ${reach} options shown — unanswerable` });
              }
            }
          } else if (isLetterAnswer && !opts) {
            const ok = TFNG.has(String(ans).toUpperCase()) || YNNG.has(String(ans).toUpperCase());
            if (!ok) problems.push({ ...at, why: `[${q.type}] letter answer "${ans}" but no options to choose from` });
          }

          if ((q.type === "tfng" && !TFNG.has(String(ans).toUpperCase())) ||
              (q.type === "yng" && !YNNG.has(String(ans).toUpperCase()))) {
            problems.push({ ...at, why: `[${q.type}] "${ans}" is not a valid answer for this type` });
          }
        }
      }
    }
  }
}

const byReason = {};
for (const p of problems) {
  const k = p.why.replace(/"[^"]*"/g, '"…"').replace(/\d+/g, "N");
  (byReason[k] = byReason[k] || []).push(p);
}

console.log("\n──────── ANSWERABILITY ────────\n");
console.log(`tests normalised : ${files}`);
console.log(`questions checked: ${total}`);
console.log(`problems         : ${problems.length}`);

if (problems.length) {
  console.log("\ngrouped:");
  for (const [why, list] of Object.entries(byReason).sort((a, b) => b[1].length - a[1].length)) {
    const secs = [...new Set(list.map((p) => p.where))];
    console.log(`\n  ${list.length}x  ${why}`);
    console.log(`      sections: ${secs.slice(0, 6).join(", ")}${secs.length > 6 ? ` (+${secs.length - 6})` : ""}`);
    console.log(`      e.g. ${list.slice(0, 3).map((p) => `${p.where}/${p.file} q${p.q}`).join(", ")}`);
  }
} else {
  console.log("\n✓ every question is reachable and correctly keyed");
}

if (STRICT && problems.length) process.exit(1);
