#!/usr/bin/env node
// expand-model-answers.js  v3
//
// Expands short model answers in writing and speaking test JSONs via Gemini.
// Skips already-expanded questions (tracked in content/.expanded-answers.json).
//
// Usage:
//   $env:GEMINI_API_KEY = "AIza..."
//   cd "C:\Users\naras\OneDrive\Desktop\LandingPrep"
//   node tools/expand-model-answers.js --exam ielts --section writing --count 30
//   node tools/expand-model-answers.js --exam ielts --section writing --count 30 --model gemini-2.5-flash

"use strict";

const fs    = require("fs");
const path  = require("path");
const https = require("https");

const ROOT    = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const MANIFEST_PATH = path.join(CONTENT, "manifest.json");
const EXPANDED_PATH = path.join(CONTENT, ".expanded-answers.json");

const MODEL_FALLBACKS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
];

// ── CLI ────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = { count: "30" };
  for (let i = 2; i < process.argv.length; i += 2) {
    args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
  }
  return args;
}

// ── Gemini HTTP call ───────────────────────────────────────────────────
function geminiRequestWithModel(apiKey, model, prompt) {
  return new Promise((resolve, reject) => {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const bodyObj = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 2048,
      },
    };
    // Gemini 2.5 Flash uses "thinking" tokens by default which consume
    // the output budget. Disable thinking so the full budget goes to text.
    if (model.startsWith("gemini-2.5")) {
      bodyObj.generationConfig.thinkingConfig = { thinkingBudget: 0 };
    }
    const body = JSON.stringify(bodyObj);
    const url  = new URL(endpoint + "?key=" + apiKey);
    const req  = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const j = JSON.parse(data);
          if (j.error) return reject(Object.assign(new Error(j.error.message), { status: j.error.code }));
          const text = j.candidates?.[0]?.content?.parts?.[0]?.text || "";
          resolve(text.trim());
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

let resolvedModel = null;

async function geminiRequest(apiKey, prompt, forcedModel) {
  const chain = forcedModel
    ? [forcedModel, ...MODEL_FALLBACKS.filter(m => m !== forcedModel)]
    : MODEL_FALLBACKS;

  if (resolvedModel) {
    return geminiRequestWithModel(apiKey, resolvedModel, prompt);
  }

  for (const model of chain) {
    try {
      const result = await geminiRequestWithModel(apiKey, model, prompt);
      if (!resolvedModel) {
        resolvedModel = model;
        console.log(`  ✔ Using model: ${model}`);
      }
      return result;
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("not found") || msg.includes("not supported") || msg.includes("404") || e.status === 404) {
        console.warn(`  ⚠ Model ${model} unavailable, trying next...`);
        continue;
      }
      throw e;
    }
  }
  throw new Error("All Gemini models in the fallback chain failed.");
}

// ── Prompts ────────────────────────────────────────────────────────────
function writingPrompt(q, taskIndex) {
  const taskType      = q.taskType || q.type || "writing_task";
  const isTask1Letter = taskType === "general_task_1_letter";
  const isTask1Acad   = taskIndex === 0 && !isTask1Letter;

  if (isTask1Letter) {
    return `Write an IELTS General Training Task 1 Band 7 letter for this prompt:

${q.prompt}

Requirements:
- 160 to 200 words
- Appropriate greeting and sign-off
- Address every bullet point clearly
- Correct register (formal/informal as the situation requires)
- Natural, fluent English — not template-like

Write ONLY the letter. No title. No explanation. No preamble. Start directly with "Dear ...".`;
  }

  if (isTask1Acad) {
    return `Write an IELTS Academic Task 1 Band 7 report for this prompt:

${q.prompt}

Requirements:
- 165 to 195 words
- First sentence paraphrases the prompt (do NOT copy it word for word)
- One overview paragraph identifying the key overall trend or feature
- One or two detail paragraphs with specific comparisons and data references
- Precise vocabulary for change (rose, fell, peaked, fluctuated, remained stable, etc.)
- No personal opinions — purely objective and factual
- No title or headings

Write ONLY the report text. No preamble. No explanation after the text.`;
  }

  // Task 2 essay
  return `Write an IELTS Task 2 Band 7 essay for this prompt:

${q.prompt}

Requirements:
- 265 to 295 words
- Introduction: paraphrase the question + clear thesis statement (2–3 sentences)
- Body paragraph 1: main point + explanation + specific example (4–5 sentences)
- Body paragraph 2: second main point + explanation + specific example (4–5 sentences)
- Conclusion: restate position concisely (1–2 sentences)
- Varied vocabulary, no word repetition across sentences
- Mix of simple and complex sentence structures
- No bullet points, no headings, no title

Write ONLY the essay. Start directly with the introduction.`;
}

function speakingPrompt(q) {
  const part = q.part || 1;
  const ctx  = {
    1: "IELTS Speaking Part 1 — short conversational answer, 3–5 sentences, personal and direct",
    2: "IELTS Speaking Part 2 — 2-minute cue-card talk, developed with a specific personal story or example",
    3: "IELTS Speaking Part 3 — extended abstract discussion, 5–7 sentences, sophisticated vocabulary and hedging",
  }[part] || "IELTS Speaking Part 1 — short conversational answer, 3–5 sentences";

  return `Write an IELTS Band 7 spoken response.

Context: ${ctx}
Question: ${q.prompt}

Requirements:
- 180 to 230 words
- Sounds like natural spoken English (use "Well,", "Actually,", "I mean,", "To be honest," etc.)
- Includes a specific personal example or developed idea
- Good vocabulary range used naturally
- Grammatically accurate with occasional natural spoken repairs
- No written prose style — conversational throughout

Write ONLY the spoken response. No labels. No preamble.`;
}

// ── Helpers ────────────────────────────────────────────────────────────
function wordCount(s) {
  return (s || "").trim().split(/\s+/).filter(Boolean).length;
}

function preview(s, n = 80) {
  return (s || "").replace(/\n/g, " ").slice(0, n) + (s.length > n ? "…" : "");
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  const args    = parseArgs();
  const apiKey  = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: Set GEMINI_API_KEY first.\n  $env:GEMINI_API_KEY = "AIza..."');
    process.exit(1);
  }

  const exam         = args.exam    || "ielts";
  const section      = args.section || "writing";
  const limit        = parseInt(args.count, 10) || 30;
  const forcedModel  = args.model || null;

  // Per-task-type minimum word thresholds
  const MIN_WORDS_T1 = 130;   // Task 1 academic / GT letter
  const MIN_WORDS_T2 = 220;   // Task 2 essay
  const MIN_WORDS_SP = 120;   // Speaking

  if (forcedModel) { resolvedModel = forcedModel; console.log(`Pinned model: ${forcedModel}`); }
  console.log(`\nExpanding ${exam}/${section} — target: ${limit} questions\n`);

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const entries  = manifest.exams?.[exam]?.sections?.[section] || [];
  if (!entries.length) { console.error(`No entries for ${exam}/${section}`); process.exit(1); }

  let expanded = {};
  if (fs.existsSync(EXPANDED_PATH)) {
    try { expanded = JSON.parse(fs.readFileSync(EXPANDED_PATH, "utf8")); } catch (_) {}
  }

  let processed = 0, skipped = 0, failed = 0;

  outer:
  for (const entry of entries) {
    const filePath = path.join(CONTENT, entry.file);
    if (!fs.existsSync(filePath)) { console.warn(`Missing: ${entry.file}`); continue; }

    const test = JSON.parse(fs.readFileSync(filePath, "utf8"));

    for (let idx = 0; idx < (test.questions || []).length; idx++) {
      if (processed >= limit) break outer;

      const q        = test.questions[idx];
      const trackKey = q.id;

      if (expanded[trackKey]) { skipped++; continue; }

      // Task-type-aware threshold
      const taskType     = q.taskType || q.type || "";
      const isLetter     = taskType === "general_task_1_letter";
      const isTask1      = idx === 0 && !isLetter;
      const minW = section === "speaking" ? MIN_WORDS_SP
                 : (isTask1 || isLetter)  ? MIN_WORDS_T1
                 : MIN_WORDS_T2;

      const current = q.modelAnswer || q.sampleAnswer || "";
      if (current.length > 200 && wordCount(current) >= minW) {
        expanded[trackKey] = true;
        skipped++;
        continue;
      }

      let prompt;
      if (section === "writing")       prompt = writingPrompt(q, idx);
      else if (section === "speaking") prompt = speakingPrompt(q);
      else { skipped++; continue; }

      console.log(`→ ${q.id}`);
      let answer = "";
      let attempts = 0;

      while (attempts < 2) {
        attempts++;
        try {
          answer = await geminiRequest(apiKey, prompt, forcedModel);
        } catch (e) {
          console.error(`  ✗ API error: ${e.message}`);
          failed++;
          break;
        }
        const wc = wordCount(answer);
        console.log(`  ${wc} words — "${preview(answer)}"`);

        if (wc >= minW) break;   // good enough

        if (attempts < 2) {
          console.log(`  ↻ Below ${minW} words, retrying with higher temperature...`);
          // Temporarily override model so the retry uses the same resolved model
          // but with a more forceful one-shot prompt
          prompt = prompt.replace(/Requirements:[\s\S]*$/, "") +
            `\nIMPORTANT: Your response MUST be at least ${minW} words. Write the full response now:`;
          await sleep(400);
        }
      }

      const wc = wordCount(answer);
      if (wc >= minW) {
        q.modelAnswer = answer;
        delete q.sampleAnswer;
        expanded[trackKey] = true;
        fs.writeFileSync(filePath, JSON.stringify(test, null, 2));
        fs.writeFileSync(EXPANDED_PATH, JSON.stringify(expanded, null, 2));
        processed++;
        console.log(`  ✓ saved`);
      } else {
        console.warn(`  ✗ Still too short (${wc}/${minW}) — skipping`);
        failed++;
      }

      await sleep(500);
    }
  }

  fs.writeFileSync(EXPANDED_PATH, JSON.stringify(expanded, null, 2));

  console.log(`\n${"─".repeat(52)}`);
  console.log(`Expanded : ${processed}`);
  console.log(`Skipped  : ${skipped}  (already done)`);
  console.log(`Failed   : ${failed}  (too short after retry)`);
  console.log(`Model    : ${resolvedModel || "(none)"}`);
}

main().catch(e => { console.error("\nFatal:", e.message); process.exit(1); });
