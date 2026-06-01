#!/usr/bin/env node
/**
 * tools/gen-writing-modelanswers.js
 * Server-side generator: fills empty `modelAnswer` fields in writing tests with
 * prompt-specific, top-band answers via the Gemini API.
 *
 * SECURITY: reads GEMINI_API_KEY from .env (server-side). NEVER writes the key
 * into any content/frontend file — only the generated essay text is stored.
 *
 * Idempotent: only fills items whose modelAnswer is empty. Re-run to fill gaps.
 *
 * Usage: node tools/gen-writing-modelanswers.js [ielts|celpip|toefl]
 */
"use strict";

const fs    = require("fs");
const path  = require("path");
const https = require("https");

// ── Load API key from .env (no dependency) ────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  const txt = fs.readFileSync(envPath, "utf8");
  const out = {};
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
const ENV = loadEnv();
const GEMINI_API_KEY = (ENV.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR")) {
  console.error("✗ GEMINI_API_KEY not set in .env"); process.exit(1);
}

const MODEL_CHAIN = ["gemini-2.5-flash", "gemini-1.5-flash"];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function geminiPostRaw(model, prompt) {
  return new Promise((resolve, reject) => {
    const genCfg = { temperature: 0.7, maxOutputTokens: 2048, topP: 0.95 };
    // gemini-2.5-* enable "thinking" by default which consumes the output budget
    // and truncates the answer. Disable it (1.5 models don't accept this field).
    if (model.startsWith("gemini-2.5")) genCfg.thinkingConfig = { thinkingBudget: 0 };
    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: genCfg,
    });
    const opts = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode === 429 || res.statusCode >= 500) {
          return reject({ retry: true, code: res.statusCode, msg: data.slice(0, 120) });
        }
        try {
          const j = JSON.parse(data);
          const text = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (!text) return reject({ retry: false, code: res.statusCode, msg: "empty: " + data.slice(0, 160) });
          resolve(text.trim());
        } catch (e) { reject({ retry: false, code: res.statusCode, msg: "parse: " + data.slice(0, 160) }); }
      });
    });
    req.on("error", (e) => reject({ retry: true, msg: e.message }));
    req.write(body); req.end();
  });
}

async function generate(prompt) {
  for (const model of MODEL_CHAIN) {
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        return await geminiPostRaw(model, prompt);
      } catch (err) {
        if (err.retry && attempt < 3) { await sleep(2000 * (attempt + 1)); continue; }
        if (err.retry) break; // move to next model
        throw new Error(`[${model}] ${err.code} ${err.msg}`);
      }
    }
  }
  throw new Error("all models exhausted");
}

// ── Clean model output: strip markdown headings/wrappers, keep prose ──────────
function clean(text) {
  return text
    .replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "")
    .replace(/^\s*(model answer|sample answer|here('?s| is).*?:)\s*/i, "")
    .replace(/\*\*/g, "")
    .trim();
}

// ── Per-type prompt builders ──────────────────────────────────────────────────
function buildIelts(q) {
  if (q.taskNumber === 1) {
    return `You are an IELTS examiner writing a Band 9 model answer for Academic Writing Task 1.
TASK: ${q.prompt}
Write a model response of about 170–190 words that: opens with a paraphrased overview sentence, gives a clear summary of the main trends/features in a second overview sentence, then presents two body paragraphs grouping and comparing the key data logically. Since exact figures are not provided here, invent plausible, internally consistent figures consistent with the described chart and use them to illustrate comparisons. Use formal academic register and varied data-description language (rose, plateaued, in contrast, whereas). Output ONLY the essay text — no headings, no notes, no word count.`;
  }
  return `You are an IELTS examiner writing a Band 9 model answer for Academic Writing Task 2.
ESSAY QUESTION: ${q.prompt}
Write a model essay of about 280–310 words with: an introduction that paraphrases the question and states a clear position; two well-developed body paragraphs each with a topic sentence, explanation and a specific example; and a concise conclusion that restates the position. Use sophisticated cohesion, a range of complex sentences and precise vocabulary. Directly answer the specific question asked. Output ONLY the essay text — no headings, no notes, no word count.`;
}

function buildCelpip(q) {
  if (q.taskType === "email") {
    return `You are a CELPIP expert writing a Level 11 model response for Writing Task 1 (an email/letter).
SCENARIO: ${q.scenario}
RECIPIENT: ${q.recipient}
You MUST address all of these points: ${(q.bulletPoints || []).map((b, i) => `(${i + 1}) ${b}`).join("; ")}
Write ${q.wordCountGuideline || "150–200 words"}. Use an appropriate greeting and sign-off, a clear and friendly-but-organised tone suited to the recipient, natural paragraphing, and accurate grammar. Make the details specific and realistic. Output ONLY the email text (greeting through sign-off) — no notes, no labels.`;
  }
  // survey_response
  return `You are a CELPIP expert writing a Level 11 model response for Writing Task 2 (Responding to Survey Questions).
SURVEY QUESTION: ${q.surveyPrompt}
OPTION A: ${q.optionA}
OPTION B: ${q.optionB}
Choose ONE option and argue for it persuasively in about 150–200 words. Clearly state your choice, give two or three specific reasons with brief examples, and briefly acknowledge why the other option is less suitable. Use a clear, confident register and well-organised paragraphs. Output ONLY the response text — no notes, no labels.`;
}

function buildToefl(q) {
  return `You are a TOEFL expert writing a top-scoring (5/5) model response for the Writing for an Academic Discussion task.
PROFESSOR'S QUESTION: ${q.professorQuestion}
${q.student1Name} wrote: ${q.student1Response}
${q.student2Name} wrote: ${q.student2Response}
Write a post of ${q.targetWords || "100+"} words (about 100–140) that: states a clear, specific opinion on the professor's question; engages directly with at least one classmate's point (extending or respectfully challenging it); and supports your view with a concrete reason and example. Use natural academic English and precise vocabulary. Output ONLY the discussion post text — no greeting line like "Hi everyone" is required but acceptable; no notes or labels.`;
}

function buildGre(q) {
  const claim = q.situation || q.prompt;
  return `You are a GRE expert writing a top-scoring (6/6) model response for the Analytical Writing "Analyze an Issue" task.
ISSUE CLAIM: ${claim}
TASK INSTRUCTIONS: ${q.instructions || q.prompt}
Write a model essay of about 480–540 words that: opens with an introduction presenting a nuanced, clearly stated position on the specific claim above; develops three body paragraphs, each advancing a distinct reason or considering a condition under which the claim does or does not hold, supported by a specific, concrete example; engages thoughtfully with a counterargument; and closes with a conclusion that synthesizes the analysis. Use precise diction, varied sentence structure, and sophisticated logical transitions. Directly analyze THIS claim. Output ONLY the essay text — no headings, no notes, no word count.`;
}

const BUILDERS = { ielts: buildIelts, celpip: buildCelpip, toefl: buildToefl, gre: buildGre };

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  const only = process.argv[2];
  const targets = [
    { exam: "ielts",  sec: "writing" },
    { exam: "celpip", sec: "writing" },
    { exam: "toefl",  sec: "writing" },
    { exam: "gre",    sec: "writing" },
  ].filter(t => !only || t.exam === only);

  // Gather all empty-modelAnswer items across files
  const jobs = [];
  for (const { exam, sec } of targets) {
    const dir = path.join(__dirname, "..", "content", exam, sec);
    const files = fs.readdirSync(dir).filter(f => /^test-\d+\.json$/.test(f)).sort();
    for (const f of files) {
      const fp = path.join(dir, f);
      const json = JSON.parse(fs.readFileSync(fp, "utf8"));
      (json.questions || []).forEach((q, idx) => {
        const ma = (q.modelAnswer || "").trim();
        const words = ma ? ma.split(/\s+/).length : 0;
        // (re)generate when missing OR too short to be a complete top-band answer
        // (truncated AI outputs). Genuine model answers are always 80+ words.
        if (!ma || words < 80) {
          jobs.push({ exam, fp, idx, label: `${exam}/${f}#${idx + 1}` });
        }
      });
    }
  }
  console.log(`Found ${jobs.length} items needing model answers.`);
  if (!jobs.length) return;

  // Cache parsed files so multiple items in one file share the object
  const fileCache = new Map();
  function getJson(fp) {
    if (!fileCache.has(fp)) fileCache.set(fp, JSON.parse(fs.readFileSync(fp, "utf8")));
    return fileCache.get(fp);
  }
  const dirtyFiles = new Set();

  const CONCURRENCY = 3;
  let done = 0, failed = 0;
  let cursor = 0;

  async function worker(wid) {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const json = getJson(job.fp);
      const q = json.questions[job.idx];
      const prompt = BUILDERS[job.exam](q);
      try {
        const text = clean(await generate(prompt));
        if (!text || text.length < 60) throw new Error("too short");
        q.modelAnswer = text;
        dirtyFiles.add(job.fp);
        done++;
        if (done % 10 === 0 || done <= 3) console.log(`  ✓ ${job.label} (${text.split(/\s+/).length}w) [${done}/${jobs.length}]`);
      } catch (e) {
        failed++;
        console.warn(`  ✗ ${job.label}: ${e.message}`);
      }
      await sleep(300); // gentle pacing
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)));

  // Write back dirty files
  for (const fp of dirtyFiles) {
    fs.writeFileSync(fp, JSON.stringify(fileCache.get(fp), null, 2));
  }
  console.log(`\nDone. Generated ${done}, failed ${failed}. Wrote ${dirtyFiles.size} files.`);
  if (failed) process.exitCode = 2;
}

run().catch(e => { console.error("FATAL", e); process.exit(1); });
