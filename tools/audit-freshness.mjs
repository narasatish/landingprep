// tools/audit-freshness.mjs
//
// Content-freshness guardrail. The generated pages stamp BUILD_DATE on every
// build, so a page can read "verified 2026-07-05" while its underlying fact is
// months out of date (this is exactly how Canada's SDS stayed "active" on the
// site after it ended in Nov 2024). This tool tracks the MANUAL last-verified
// date in content/fact-review.json and warns when a re-check is overdue.
//
// Usage:
//   node tools/audit-freshness.mjs           # warn if overdue (never fails the build)
//   node tools/audit-freshness.mjs --strict  # exit 1 if overdue (for a manual gate)
//
// After you re-verify the facts against their official source URLs, bump
// "lastReviewed" in content/fact-review.json (and fix any changed values).

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FILE = path.join(ROOT, "content", "fact-review.json");
const strict = process.argv.includes("--strict");

let data;
try { data = JSON.parse(fs.readFileSync(FILE, "utf8")); }
catch (e) { console.error("✗ cannot read content/fact-review.json:", e.message); process.exit(1); }

const today = new Date();
const reviewed = new Date(data.lastReviewed + "T00:00:00Z");
const interval = data.reviewIntervalDays || 90;
const days = Math.floor((today - reviewed) / 86400000);
const remaining = interval - days;

const facts = data.facts || [];
console.log(`\n──────── CONTENT FRESHNESS ────────`);
console.log(`Tracked volatile facts: ${facts.length} | last manual review: ${data.lastReviewed} (${days} days ago) | interval: ${interval} days`);

if (remaining > 0) {
  console.log(`✓ Facts reviewed ${days} days ago — next review due in ${remaining} days.`);
  checkExpressEntry();
  process.exit(0);
}

console.log(`\n⚠ OVERDUE by ${-remaining} days — re-verify these facts against their official source, then bump lastReviewed in content/fact-review.json:\n`);
for (const f of facts) {
  console.log(`  • ${f.claim}: ${f.value}`);
  console.log(`      source: ${f.source}`);
}
console.log(`\n(Fastest path: skim each source URL, correct any changed value on the listed pages, then set lastReviewed to today.)`);
checkExpressEntry();
process.exit(strict ? 1 : 0);

// The Express Entry draw tracker updates on a much shorter cycle (IRCC draws are
// roughly bi-weekly). Flag it separately if its own lastUpdated is >21 days old.
function checkExpressEntry() {
  try {
    const ee = JSON.parse(fs.readFileSync(path.join(ROOT, "content", "express-entry-draws.json"), "utf8"));
    const age = Math.floor((today - new Date(ee.lastUpdated + "T00:00:00Z")) / 86400000);
    console.log(`\n── EXPRESS ENTRY DRAW TRACKER ──`);
    if (age > 21) console.log(`⚠ Draw tracker last updated ${age} days ago — add the newest IRCC draw(s) to content/express-entry-draws.json and bump lastUpdated. Source: ${ee.source}`);
    else console.log(`✓ Draw tracker updated ${age} days ago (bi-weekly cadence).`);
  } catch (e) { /* file optional */ }
}
