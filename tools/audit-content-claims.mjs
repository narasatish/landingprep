// Guard: the practice-question count advertised in the copy must not exceed what the
// content library actually holds.
//
// Written after an audit found the site advertising "1,000+ mock tests" while, for example,
// 54 of the 60 IELTS reading tests contained no material a student had not already seen in
// an earlier-numbered test. File count is not a measure of practice material; distinct
// questions is. This fails the build if the copy drifts ahead of the content again.
import fs from "fs";
import path from "path";
import url from "url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const EXAMS = /^(ielts|toefl|pte|celpip|duolingo|gre|gmat|oet|sat|act)$/;

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith(".json") ? [path.join(d, e.name)] : []
  );

// Count each question ONCE, no matter how many test files repeat it.
const distinct = new Set();
let instances = 0;

for (const f of walk(CONTENT)) {
  const rel = f.slice(CONTENT.length + 1).split(path.sep).join("/");
  const exam = rel.split("/")[0];
  if (!EXAMS.test(exam)) continue;
  let j;
  try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch { continue; }

  const rec = (o) => {
    if (Array.isArray(o)) return o.forEach(rec);
    if (!o || typeof o !== "object") return;
    if (o.answer !== undefined || o.correctAnswer !== undefined) {
      const stem = String(o.prompt || o.question || o.text || o.sentenceText || o.label || "").trim();
      if (stem.length >= 8) {
        instances++;
        distinct.add(exam + "::" + stem + "|" + JSON.stringify(o.answer ?? o.correctAnswer));
      }
    }
    Object.values(o).forEach(rec);
  };
  rec(j);
}

// Every place the number is advertised. Keep this list in step with the copy.
const CLAIM_SOURCES = [
  "index.html",
  "screens/home.jsx",
  "screens/exam-prep.jsx",
  "scripts/generate-seo-pages.mjs",
];

const claims = [];
for (const rel of CLAIM_SOURCES) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const text = fs.readFileSync(p, "utf8");
  // "5,400+ practice questions", "5400+ free practice questions", etc.
  for (const m of text.matchAll(/([\d,]{3,7})\s*\+?\s*(?:free\s+)?(?:distinct\s+)?practice questions/gi)) {
    claims.push({ rel, raw: m[1], n: parseInt(m[1].replace(/,/g, ""), 10) });
  }
}

console.log("\n──────── CONTENT CLAIMS ────────");
console.log(`Distinct practice questions : ${distinct.size}`);
console.log(`Question instances served   : ${instances} (each shown ${(instances / distinct.size).toFixed(1)}x on average)`);
console.log(`Advertised counts found     : ${claims.length}`);

let failed = 0;
for (const c of claims) {
  const ok = c.n <= distinct.size;
  if (!ok) failed++;
  console.log(`  ${ok ? "✓" : "✗"} ${c.raw}+ in ${c.rel}`);
}

if (!claims.length) {
  console.log("\n⚠  No advertised question count found — if the copy still promises a number, add its file to CLAIM_SOURCES.");
} else if (failed) {
  console.error(`\n✗ ${failed} claim(s) exceed the ${distinct.size} distinct questions actually in content/.`);
  console.error("  Either write more questions or lower the number in the copy.");
  process.exit(1);
} else {
  console.log(`\n✓ Every advertised count is backed by real content.`);
}
