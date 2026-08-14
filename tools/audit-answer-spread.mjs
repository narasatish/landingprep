// Can a candidate score well on a test WITHOUT reading it?
//
// Written after authoring a CELPIP reading test where, unprompted, the correct answer landed
// at option B in 28 of 38 questions — a candidate who always picked B would have scored 74%.
// Nothing else in the suite catches that: validate-tests.js and the answerability audit both
// pass such a test, because every answer is present and valid. The flaw is only visible in
// WHERE the answers sit.
//
// For each multiple-choice test this reports the best score obtainable by always choosing the
// same option letter. On a fair 4-option test that is ~25%; anything above ~40% means the key
// leaks the answers.
//
//   node tools/audit-answer-spread.mjs              report
//   node tools/audit-answer-spread.mjs --strict     exit 1 if any test is guessable above the cap
import fs from "fs";
import path from "path";
import url from "url";

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content");
const STRICT = process.argv.includes("--strict");
const CAP = Number((process.argv.find((a) => a.startsWith("--cap=")) || "--cap=45").split("=")[1]);

const manifest = JSON.parse(fs.readFileSync(path.join(CONTENT, "manifest.json"), "utf8"));
const rows = [];

for (const [exam, ev] of Object.entries(manifest.exams || {})) {
  for (const [sec, list] of Object.entries(ev.sections || {})) {
    for (const e of list || []) {
      const f = path.join(CONTENT, e.file || "");
      if (!e.file || !fs.existsSync(f)) continue;
      let j;
      try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch { continue; }

      // Only questions offering a fixed list of options can be gamed this way.
      const qs = [];
      const rec = (o) => {
        if (Array.isArray(o)) return o.forEach(rec);
        if (!o || typeof o !== "object") return;
        const opts = Array.isArray(o.options) ? o.options : Array.isArray(o.categoryOptions) ? o.categoryOptions : null;
        const ans = o.correctAnswer !== undefined ? o.correctAnswer : o.answer;
        if (opts && opts.length >= 3 && typeof ans === "string") qs.push({ opts, ans });
        else Object.values(o).forEach(rec);
      };
      rec(j);
      if (qs.length < 8) continue;

      const pos = {};
      let placed = 0;
      for (const q of qs) {
        // answer may be the option TEXT or a letter
        let i = q.opts.indexOf(q.ans);
        if (i === -1 && /^[A-Z]$/.test(q.ans)) i = q.ans.charCodeAt(0) - 65;
        if (i === -1) {
          const m = q.opts.findIndex((o) => String(o).replace(/^\s*[A-Za-z]+[.)]\s*/, "").trim() === q.ans.trim());
          i = m;
        }
        if (i < 0 || i >= q.opts.length) continue;
        pos[i] = (pos[i] || 0) + 1;
        placed++;
      }
      if (placed < 8) continue;

      const best = Math.max(...Object.values(pos));
      rows.push({
        key: `${exam}/${sec}`, file: path.basename(f),
        questions: placed, guessable: (best / placed) * 100,
        spread: Object.keys(pos).sort().map((k) => `${String.fromCharCode(65 + Number(k))}:${pos[k]}`).join(" "),
      });
    }
  }
}

rows.sort((a, b) => b.guessable - a.guessable);
const bad = rows.filter((r) => r.guessable > CAP);

console.log("\n──────── ANSWER-KEY SPREAD ────────\n");
console.log(`tests analysed: ${rows.length}   (multiple-choice tests with 8+ keyed questions)`);
console.log(`fair spread on a 4-option test is ~25%; flagged above ${CAP}%\n`);

if (bad.length) {
  console.log(`✗ ${bad.length} test(s) scoreable above ${CAP}% by always picking one option:\n`);
  console.log("test".padEnd(34) + "questions".padStart(10) + "guessable".padStart(11) + "   spread");
  for (const r of bad.slice(0, 30)) {
    console.log(`${(r.key + "/" + r.file).padEnd(34)}${String(r.questions).padStart(10)}${(r.guessable.toFixed(0) + "%").padStart(11)}   ${r.spread}`);
  }
  if (bad.length > 30) console.log(`   … and ${bad.length - 30} more`);
  const bySection = {};
  bad.forEach((r) => (bySection[r.key] = (bySection[r.key] || 0) + 1));
  console.log("\nby section: " + Object.entries(bySection).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} (${n})`).join(", "));
} else {
  console.log(`✓ no test is scoreable above ${CAP}% by always picking the same option`);
}

const worst = rows[0];
if (worst) console.log(`\nworst: ${worst.key}/${worst.file} at ${worst.guessable.toFixed(0)}%   |   median: ${rows[Math.floor(rows.length / 2)].guessable.toFixed(0)}%`);

if (STRICT && bad.length) process.exit(1);
