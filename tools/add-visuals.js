#!/usr/bin/env node
// tools/add-visuals.js
//
// Adds real visual data to IELTS Academic Writing Task 1 questions.
// Calls Gemini to generate a coherent visual block (bar/line/pie/table)
// that matches the topic in the existing prompt.
//
// Usage:
//   node tools/add-visuals.js --key AIzaSy... [--from 1] [--to 30] [--force]
//
// Flags:
//   --key     Gemini API key (required)
//   --from    First test number to process (default: 1)
//   --to      Last test number to process  (default: 30)
//   --force   Re-process files already in the tracker

"use strict";

const fs   = require("fs");
const path = require("path");
const https = require("https");

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get  = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const has  = (flag) => args.includes(flag);

const API_KEY = get("--key");
if (!API_KEY) { console.error("❌  --key <Gemini API key> is required"); process.exit(1); }

const FROM  = parseInt(get("--from") || "1",  10);
const TO    = parseInt(get("--to")   || "30", 10);
const FORCE = has("--force");

// ─── Paths ───────────────────────────────────────────────────────────────────
const ROOT        = path.resolve(__dirname, "..");
const WRITING_DIR = path.join(ROOT, "content", "ielts", "writing");
const TRACKER     = path.join(ROOT, "content", ".expanded-visuals.json");

// ─── Tracker helpers ─────────────────────────────────────────────────────────
function loadTracker() {
  try { return JSON.parse(fs.readFileSync(TRACKER, "utf8")); } catch { return {}; }
}
function saveTracker(t) {
  fs.writeFileSync(TRACKER, JSON.stringify(t, null, 2));
}

// ─── HTTPS helper ─────────────────────────────────────────────────────────────
function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(JSON.stringify(body));
    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": buf.length },
    };
    const req = https.request(url, opts, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        try { resolve(JSON.parse(data)); } catch { reject(new Error("Bad JSON: " + data.slice(0, 200))); }
      });
    });
    req.on("error", reject);
    req.write(buf);
    req.end();
  });
}

// ─── Gemini call ──────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
        ...(model === "gemini-2.5-flash" ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    };
    try {
      const res = await httpsPost(url, body);
      const text = res?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!text) throw new Error("Empty response");
      return text;
    } catch (e) {
      console.warn(`  ⚠  ${model} failed: ${e.message} — trying next model`);
    }
  }
  throw new Error("All Gemini models failed");
}

// ─── Build prompt for Gemini ──────────────────────────────────────────────────
function buildGeminiPrompt(taskPrompt) {
  return `You are an IELTS Academic Writing Task 1 data designer.

Given the Task 1 writing prompt below, generate:
1. A more specific version of the prompt that clearly names the chart type, the x-axis categories, and the series labels — so a student knows exactly what to describe.
2. A "visual" JSON object that provides realistic, plausible data matching the topic.

The visual object must follow this exact schema:
{
  "type": "bar" | "line" | "pie" | "table",
  "title": "<descriptive chart title>",
  "xAxis": ["<label1>", "<label2>", ...],   // years, categories, or countries
  "series": [
    { "label": "<series name>", "values": [<number>, ...] }
  ],
  "yLabel": "<y-axis unit, e.g. '% of population' or 'millions'>"
}

Rules:
- For "pie" or single-series bar/line, one entry in series is enough.
- For "table", use { "type": "table", "title": "...", "headers": [...], "rows": [[...], ...] } instead.
- Use 4–6 x-axis categories. Values should be realistic and vary meaningfully (not all the same).
- The data must match the topic of the prompt (e.g. if it mentions renewable energy, use energy percentages; if it mentions population, use plausible population figures).
- Do NOT make up unrelated data.
- Output ONLY a JSON object with two keys: "updatedPrompt" (string) and "visual" (object). No markdown fences.

Original Task 1 prompt:
"""
${taskPrompt}
"""

Output JSON only:`;
}

// ─── Process one file ─────────────────────────────────────────────────────────
async function processFile(filePath, tracker) {
  const rel = path.relative(ROOT, filePath);

  // Don't skip based on tracker alone — verify the file actually has visual data
  if (!FORCE && tracker[rel]) {
    const checkData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const checkQ = (checkData.questions || [])[0];
    if (checkQ && checkQ.visual) {
      console.log(`  ⏭  Already has visual (tracker + file confirmed): ${rel}`);
      return;
    }
    // Tracker says done but file has no visual — stale tracker entry, re-process
    console.log(`  ⚠  Tracker stale for ${rel} — re-processing`);
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const q1 = (data.questions || [])[0];

  if (!q1 || q1.questionType !== "writing_task") {
    console.log(`  ⚠  No writing_task q1 in ${rel} — skipping`);
    return;
  }

  // Skip if it already has a visual and not forcing
  if (!FORCE && q1.visual) {
    console.log(`  ✅  Already has visual: ${rel}`);
    tracker[rel] = { done: true, ts: new Date().toISOString() };
    saveTracker(tracker);
    return;
  }

  const originalPrompt = q1.prompt || "";
  console.log(`  🔄  Generating visual for: ${rel}`);
  console.log(`      Prompt excerpt: "${originalPrompt.slice(0, 80)}..."`);

  const geminiPrompt = buildGeminiPrompt(originalPrompt);
  let raw;
  try {
    raw = await callGemini(geminiPrompt);
  } catch (e) {
    console.error(`  ❌  Gemini error for ${rel}: ${e.message}`);
    return;
  }

  // Parse JSON response
  let parsed;
  try {
    // Strip markdown fences if Gemini added them anyway
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error(`  ❌  JSON parse failed for ${rel}: ${e.message}`);
    console.error("      Raw:", raw.slice(0, 300));
    return;
  }

  if (!parsed.visual || !parsed.updatedPrompt) {
    console.error(`  ❌  Missing fields in response for ${rel}`);
    return;
  }

  // Validate visual schema
  const v = parsed.visual;
  if (!v.type || !v.title) {
    console.error(`  ❌  Invalid visual schema for ${rel}`);
    return;
  }

  // Write back to JSON
  data.questions[0].prompt = parsed.updatedPrompt;
  data.questions[0].visual = parsed.visual;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  tracker[rel] = { done: true, type: v.type, ts: new Date().toISOString() };
  saveTracker(tracker);
  console.log(`  ✅  Done [${v.type}]: "${v.title}"`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🖼  add-visuals.js — IELTS Writing Task 1 visual enrichment`);
  console.log(`   Range: test-${String(FROM).padStart(3,"0")} → test-${String(TO).padStart(3,"0")}`);
  console.log(`   Force: ${FORCE}\n`);

  if (!fs.existsSync(WRITING_DIR)) {
    console.error("❌  Writing dir not found:", WRITING_DIR);
    process.exit(1);
  }

  const tracker = loadTracker();
  let processed = 0, skipped = 0, errors = 0;

  for (let i = FROM; i <= TO; i++) {
    const fname = `test-${String(i).padStart(3, "0")}.json`;
    const fpath = path.join(WRITING_DIR, fname);

    if (!fs.existsSync(fpath)) {
      console.log(`  ⚠  File not found: ${fname} — skipping`);
      skipped++;
      continue;
    }

    try {
      const rel = path.relative(ROOT, fpath);
      const hadVisualBefore = (() => {
        try { return !!(JSON.parse(fs.readFileSync(fpath,"utf8")).questions?.[0]?.visual); } catch { return false; }
      })();
      await processFile(fpath, tracker);
      const hasVisualAfter = (() => {
        try { return !!(JSON.parse(fs.readFileSync(fpath,"utf8")).questions?.[0]?.visual); } catch { return false; }
      })();
      if (!hadVisualBefore && hasVisualAfter) processed++;
      else if (hadVisualBefore) skipped++;
      else errors++; // called but no visual added = error
    } catch (e) {
      console.error(`  ❌  Unexpected error for ${fname}:`, e.message);
      errors++;
    }

    // Small delay to be polite to the API
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊  Summary: ${processed} enriched, ${skipped} skipped, ${errors} errors`);
  console.log(`   Tracker saved to: ${TRACKER}\n`);
}

main().catch(e => { console.error("Fatal:", e); process.exit(1); });
