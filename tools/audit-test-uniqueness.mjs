// Is each practice test actually a DIFFERENT test?
//
// Format conformance already has an owner: tools/validate-tests.js holds the exam spec table
// (question counts, durations, parts) and runs in `npm test`. Do not duplicate those numbers
// here — a second, drifting copy of the specs is worse than none. This session I wrote one,
// encoded the retired pre-2025 ACT format and the pre-2026 TOEFL format, and "corrected" 210
// files that were already right. validate-tests.js is the single source of truth for format.
//
// What nothing measured was whether the tests differ from each other. A section can match the
// official blueprint perfectly and still be worthless if test 7 is test 1 again.
//
// Metric: walk each section's tests in manifest order and count the substantial strings
// (passages, stems, options, prompts) that did NOT appear in an earlier-numbered test.
//
//   node tools/audit-test-uniqueness.mjs
//   node tools/audit-test-uniqueness.mjs --strict   exit 1 if any section is below --min
import fs from "fs";
import path from "path";
import url from "url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const STRICT = process.argv.includes("--strict");
const MIN = Number((process.argv.find((a) => a.startsWith("--min=")) || "--min=0").split("=")[1]);

const IDENT = new Set(["id", "passageId", "scriptId", "audioScriptId", "file", "title"]);
const substantial = (j) => {
  const out = new Set();
  const rec = (o) => {
    if (Array.isArray(o)) return o.forEach(rec);
    if (!o || typeof o !== "object") return;
    for (const [k, v] of Object.entries(o)) {
      if (IDENT.has(k)) continue;
      if (typeof v === "string") { const s = v.trim(); if (s.length > 25) out.add(s); }
      else rec(v);
    }
  };
  rec(j);
  return out;
};

const manifest = JSON.parse(fs.readFileSync(path.join(CONTENT, "manifest.json"), "utf8"));
const rows = [];

for (const [exam, ev] of Object.entries(manifest.exams || {})) {
  for (const [sec, list] of Object.entries(ev.sections || {})) {
    if (!Array.isArray(list) || list.length < 3) continue;
    const seen = new Set();
    let fresh = 0, all = 0, first = 0, dead = 0, n = 0;
    list.forEach((e, i) => {
      const f = path.join(CONTENT, e.file || "");
      if (!e.file || !fs.existsSync(f)) return;
      let j;
      try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch { return; }
      const s = substantial(j);
      if (!s.size) return;
      n++;
      let nw = 0;
      for (const x of s) if (!seen.has(x)) nw++;
      for (const x of s) seen.add(x);
      if (i === 0) first = s.size; else if (nw === 0) dead++;
      fresh += nw; all += s.size;
    });
    if (all) rows.push({ key: `${exam}/${sec}`, tests: n, pct: (fresh / all) * 100, equiv: first ? fresh / first : 0, dead });
  }
}

rows.sort((a, b) => a.pct - b.pct);
console.log("\n──────── TEST UNIQUENESS ────────\n");
console.log("section".padEnd(24) + "tests".padStart(6) + "new material".padStart(14) + "worth of tests".padStart(16) + "adding NOTHING".padStart(16));
for (const r of rows) {
  const flag = r.pct < 50 ? " ✗" : r.pct < 80 ? " ~" : " ✓";
  console.log(
    r.key.padEnd(24) + String(r.tests).padStart(6) + (r.pct.toFixed(0) + "%").padStart(14) +
    (r.equiv.toFixed(1) + " of " + r.tests).padStart(16) + String(r.dead).padStart(16) + flag
  );
}

const totalTests = rows.reduce((n, r) => n + r.tests, 0);
const totalEquiv = rows.reduce((n, r) => n + r.equiv, 0);
const totalDead = rows.reduce((n, r) => n + r.dead, 0);
const weak = rows.filter((r) => r.pct < 50);

console.log(`\n${totalTests} section tests hold about ${totalEquiv.toFixed(0)} tests' worth of distinct material.`);
console.log(`${totalDead} of them contain nothing a student has not already seen in an earlier test of that section.`);
console.log(`sections under 50% new material: ${weak.length} of ${rows.length}${weak.length ? " — " + weak.slice(0, 6).map((r) => r.key).join(", ") + (weak.length > 6 ? ", …" : "") : ""}`);

if (STRICT && rows.some((r) => r.pct < MIN)) {
  console.error(`\n✗ sections below the --min=${MIN}% uniqueness floor.`);
  process.exit(1);
}
