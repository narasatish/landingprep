// auto-draft-posts.mjs — closes the content loop: finds real search-query gaps
// (keyless Google Autocomplete), drafts snippet-friendly blog posts for them with
// Gemini, validates, and appends them to blog-queue.json. The daily auto-blog then
// drips them out. Run weekly (or when the queue runs low) so content NEVER dries up.
//
//   GEMINI_API_KEY=xxx node scripts/auto-draft-posts.mjs [howMany]
// No key → exits 0 (no-op). Validates every draft before queueing; bad drafts are skipped.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KEY = process.env.GEMINI_API_KEY || "";
const WANT = Math.max(1, Math.min(8, parseInt(process.argv[2] || "5", 10)));
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70);

if (!KEY) { console.log("No GEMINI_API_KEY — skipping auto-draft (set it as a repo secret to enable)."); process.exit(0); }

// High-intent seeds across the funnel (same spirit as keyword-suggest).
const SEEDS = [
  "free ielts", "ielts band", "ielts writing", "ielts speaking", "ielts reading",
  "free toefl", "toefl home", "free pte", "pte score", "celpip", "duolingo english test",
  "gre score", "gmat focus", "study abroad from", "study in canada", "study in uk",
  "study in usa", "study in australia", "scholarship for international students",
  "student visa", "sop for", "study abroad without ielts",
];
const STOP = new Set(["free", "the", "for", "and", "to", "in", "of", "a", "with", "best", "online", "test", "exam", "my", "how", "what", "is", "are"]);

async function suggest(seed) {
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(seed)}`, { headers: { "User-Agent": UA }, signal: ctrl.signal });
    clearTimeout(t);
    const d = JSON.parse(await r.text());
    return Array.isArray(d) && Array.isArray(d[1]) ? d[1] : [];
  } catch (e) { return []; }
}

function coveredHaystack() {
  let hay = "";
  try { hay += readFileSync(join(ROOT, "sitemap.xml"), "utf8").toLowerCase().replace(/[^a-z0-9]+/g, " "); } catch (e) {}
  const w = {};
  try { new Function("window", readFileSync(join(ROOT, "blog-data.jsx"), "utf8"))(w); } catch (e) {}
  for (const p of w.LP_BLOG_EXTRA || []) if (p) hay += " " + ((p.title || "") + " " + (p.kw || "")).toLowerCase();
  return hay;
}
function isCovered(q, hay, queuedText) {
  const words = q.toLowerCase().split(/\s+/).filter((x) => x.length > 2 && !STOP.has(x));
  if (!words.length) return true;
  return words.every((x) => hay.includes(x)) || words.every((x) => queuedText.includes(x));
}

async function gemini(prompt) {
  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
  for (const model of models) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 4096 } }),
      });
      if (!r.ok) continue;
      const j = await r.json();
      const text = j?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
      if (text) return text;
    } catch (e) { /* try next model */ }
  }
  return "";
}

function postPrompt(query) {
  return `You are an expert exam-prep + study-abroad writer for LandingPrep (100% free IELTS/TOEFL/PTE/CELPIP/Duolingo/GRE/GMAT prep + study-abroad tools).
Write ONE SEO blog post that directly targets this exact search query: "${query}".
Return ONLY valid minified JSON (no markdown fences, no commentary) with EXACTLY this shape:
{"id":"kebab-slug","tag":"IELTS|TOEFL|PTE|CELPIP|Duolingo|GRE|GMAT|Comparison|Study Abroad|Scholarships","date":"2026","title":"~55-65 char title with the keyword + 2026","excerpt":"150-220 char summary","kw":"5-7 real comma-separated keywords","sections":[{"h":"heading","body":"3-5 accurate sentences"}]}
Rules: exactly 6 sections. The FIRST section must DIRECTLY answer the query in 2-3 sentences (featured-snippet friendly). Be accurate and hedge time-sensitive figures with 'confirm current rules with the official source'. The LAST section must naturally mention practising free on LandingPrep (one plain mention). Global framing. CRITICAL: no double-quote characters inside any string value (use single quotes), so the JSON parses. id must be a unique kebab-case slug ending in -2026.`;
}

function validPost(p) {
  if (!p || typeof p !== "object") return false;
  if (typeof p.title !== "string" || p.title.length < 20) return false;
  if (typeof p.excerpt !== "string" || p.excerpt.length < 40) return false;
  if (!Array.isArray(p.sections) || p.sections.length < 5) return false;
  if (!p.sections.every((s) => s && typeof s.h === "string" && typeof s.body === "string" && s.body.length > 60)) return false;
  return true;
}

(async () => {
  // 1) Don't over-generate: only top up when the queue is low.
  const QUEUE = join(ROOT, "blog-queue.json");
  let queue = [];
  try { queue = JSON.parse(readFileSync(QUEUE, "utf8")); } catch (e) {}
  if (queue.length >= 10) { console.log(`Queue healthy (${queue.length}) — no drafting needed.`); process.exit(0); }

  // 2) Gather fresh, uncovered query gaps.
  const hay = coveredHaystack();
  const queuedText = queue.map((p) => (p.title + " " + p.kw).toLowerCase()).join(" ");
  const haveIds = new Set(queue.map((p) => p.id));
  const w = {}; try { new Function("window", readFileSync(join(ROOT, "blog-data.jsx"), "utf8"))(w); } catch (e) {}
  for (const p of w.LP_BLOG_EXTRA || []) if (p) haveIds.add(p.id);

  const seen = new Set(), gaps = [];
  for (const seed of SEEDS) {
    for (const q of await suggest(seed)) {
      const k = q.toLowerCase().trim();
      if (seen.has(k)) continue; seen.add(k);
      if (q.length < 12 || q.length > 70) continue;
      if (!isCovered(q, hay, queuedText)) gaps.push(q);
    }
    await sleep(250);
    if (gaps.length > 40) break;
  }
  if (!gaps.length) { console.log("No uncovered gaps found this run."); process.exit(0); }

  // 3) Draft + validate each, append the good ones.
  const added = [];
  for (const q of gaps) {
    if (added.length >= WANT) break;
    const raw = await gemini(postPrompt(q));
    if (!raw) continue;
    let post;
    try { post = JSON.parse(raw.replace(/^```(json)?/i, "").replace(/```\s*$/, "").trim()); } catch (e) { continue; }
    if (!post.id) post.id = slug(post.title || q);
    post.date = "2026";
    if (haveIds.has(post.id) || !validPost(post)) continue;
    haveIds.add(post.id); added.push(post); queue.push(post);
    console.log(`  drafted: ${post.id}  ("${q}")`);
  }

  if (!added.length) { console.log("No valid drafts produced this run."); process.exit(0); }
  writeFileSync(QUEUE, JSON.stringify(queue, null, 2) + "\n");
  console.log(`\nAdded ${added.length} auto-drafted post(s). Queue now ${queue.length}.`);
})();
