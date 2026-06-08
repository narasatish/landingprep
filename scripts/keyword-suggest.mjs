// keyword-suggest.mjs — keyless trending-keyword research from Google Autocomplete.
//
// For each seed phrase, Google's public Suggest endpoint returns the REAL long-tail
// queries people are typing right now (no API key, no OAuth). We aggregate them,
// dedupe, and — crucially — flag the ones we DON'T yet have content for, so you get
// a ranked list of fresh, high-intent topics to target each week.
//
//   node scripts/keyword-suggest.mjs
// Prints a report to stdout and (in CI) appends it to the GitHub Actions job summary.

import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// High-intent, GLOBAL seeds across the funnel (exams + study abroad + source countries).
const SEEDS = [
  "free ielts", "ielts band", "ielts writing", "ielts speaking", "ielts listening", "ielts reading",
  "free toefl", "toefl home", "free pte", "pte score", "celpip", "duolingo english test",
  "gre practice test", "gre score", "gmat focus", "gmat vs gre",
  "study abroad from", "study in canada", "study in uk", "study in usa", "study in australia",
  "study in germany", "cheapest country to study", "fully funded scholarship", "scholarship for international students",
  "student visa", "sop for", "study abroad without ielts", "best country to study abroad",
];

async function suggest(seed) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(seed)}`;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal });
    clearTimeout(timer);
    const text = await r.text();
    const data = JSON.parse(text);
    return Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
  } catch (e) {
    return [];
  }
}

// Build a haystack of terms we already cover (sitemap slugs + blog titles/keywords),
// so we can flag suggestions that have NO matching content yet.
function existingHaystack() {
  let hay = "";
  try {
    if (existsSync(join(ROOT, "sitemap.xml"))) {
      hay += readFileSync(join(ROOT, "sitemap.xml"), "utf8").toLowerCase().replace(/[^a-z0-9]+/g, " ");
    }
  } catch (e) {}
  try {
    if (existsSync(join(ROOT, "blog-data.jsx"))) {
      const w = {};
      // eslint-disable-next-line no-new-func
      new Function("window", readFileSync(join(ROOT, "blog-data.jsx"), "utf8"))(w);
      for (const p of w.LP_BLOG_EXTRA || []) hay += " " + ((p.title || "") + " " + (p.kw || "")).toLowerCase();
    }
  } catch (e) {}
  return hay;
}

const STOP = new Set(["free", "the", "for", "and", "to", "in", "of", "a", "with", "best", "online", "test", "exam", "2025", "2026", "my", "how"]);
function covered(query, hay) {
  // "covered" if every meaningful word in the query appears somewhere in our content.
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  if (!words.length) return true;
  return words.every((w) => hay.includes(w));
}

(async () => {
  const hay = existingHaystack();
  const seen = new Set();
  const all = [];
  for (const seed of SEEDS) {
    const sugg = await suggest(seed);
    for (const q of sugg) {
      const key = q.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      all.push({ q, seed, gap: !covered(q, hay) });
    }
    await sleep(250); // be polite to the endpoint
  }

  const gaps = all.filter((x) => x.gap);
  const lines = [];
  lines.push(`# Trending keyword research — ${all.length} live queries from Google Autocomplete\n`);
  lines.push(`Seeds: ${SEEDS.length}. Content GAPS (no matching page yet): **${gaps.length}**.\n`);
  lines.push(`## 🎯 Content gaps — high-intent queries you don't cover yet\n`);
  if (gaps.length) {
    for (const g of gaps) lines.push(`- [ ] \`${g.q}\`  _(seed: ${g.seed})_`);
  } else {
    lines.push("_None — your content already covers every suggested query. Add more seeds to dig deeper._");
  }
  lines.push(`\n## All ${all.length} live suggestions (grouped by seed)\n`);
  const bySeed = {};
  for (const x of all) (bySeed[x.seed] = bySeed[x.seed] || []).push(x.q);
  for (const seed of SEEDS) {
    if (!bySeed[seed]) continue;
    lines.push(`**${seed}** → ${bySeed[seed].join(" · ")}`);
  }
  const report = lines.join("\n");
  console.log(report);

  if (process.env.GITHUB_STEP_SUMMARY) {
    try { appendFileSync(process.env.GITHUB_STEP_SUMMARY, report + "\n"); } catch (e) {}
  }
  if (!all.length) {
    console.error("\n⚠️  No suggestions returned (endpoint may have rate-limited this run). Non-fatal — try again.");
  }
})();
