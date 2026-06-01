#!/usr/bin/env node
/**
 * tools/gen-pte-sw-content.js
 * Generates REAL stimulus content for PTE Speaking & Writing items so the new
 * pte-sw-renderer has genuine material to present. One AI call per test returns
 * content for every non-describe_image item, keeping each test internally varied.
 *
 * Fields populated per type:
 *   read_aloud            -> readText (passage), modelAnswer=readText, unique prompt
 *   repeat_sentence       -> audioScript=sentence, correctAnswer=sentence
 *   retell_lecture        -> audioScript=lecture, keyPoints[], modelAnswer=retell
 *   answer_short_question -> audioScript=question, correctAnswer=answer
 *   summarize_written_text-> readText=passage, modelAnswer=one-sentence summary
 *   essay                 -> prompt=essay question, modelAnswer=model essay
 * describe_image is left untouched (already has a chart + model answer).
 *
 * SECURITY: key from .env only. Idempotent via q.swReady marker.
 */
"use strict";
const fs = require("fs"), path = require("path"), https = require("https");

const ENV = (() => { const t = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8"); const o = {};
  for (const l of t.split(/\r?\n/)) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, ""); } return o; })();
const KEY = (ENV.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
if (!KEY || KEY.includes("YOUR")) { console.error("✗ no GEMINI_API_KEY"); process.exit(1); }
const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function post(model, prompt) {
  return new Promise((resolve, reject) => {
    const cfg = { temperature: 0.7, maxOutputTokens: 8192, topP: 0.95, responseMimeType: "application/json" };
    if (model.startsWith("gemini-2.5")) cfg.thinkingConfig = { thinkingBudget: 0 };
    const body = JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: cfg });
    const req = https.request({ hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/${model}:generateContent?key=${KEY}`, method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } }, res => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        if (res.statusCode === 429 || res.statusCode >= 500) return reject({ retry: true, msg: res.statusCode });
        try { const j = JSON.parse(d); const t = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (!t) return reject({ retry: false, msg: "empty:" + d.slice(0, 120) }); resolve(t.trim());
        } catch (e) { reject({ retry: false, msg: "parse:" + d.slice(0, 120) }); }
      });
    });
    req.on("error", e => reject({ retry: true, msg: e.message })); req.write(body); req.end();
  });
}
async function ask(p) { for (const m of MODELS) for (let a = 0; a < 4; a++) {
  try { return await post(m, p); } catch (e) { if (e.retry && a < 3) { await sleep(2000 * (a + 1)); continue; } if (e.retry) break; throw new Error(`[${m}] ${e.msg}`); } }
  throw new Error("exhausted"); }
const parse = t => JSON.parse(t.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim());
const subOf = p => { const m = String(p || "").match(/about (.+?)\.?\s*$/i); return m ? m[1].replace(/\.\s*speak clearly.*/i, "").trim() : ""; };

const GEN_TYPES = new Set(["read_aloud","repeat_sentence","retell_lecture","answer_short_question","summarize_written_text","essay","write_essay"]);

function buildPrompt(jobItems) {
  const lines = jobItems.map(j => `  {"i": ${j.i}, "type": "${j.q.questionType}", "topicHint": ${JSON.stringify(subOf(j.q.prompt) || j.q.topic || "an academic subject")}}`).join(",\n");
  return `You are authoring authentic PTE Academic Speaking & Writing practice material. For each item below, produce real content tied to its topicHint. Make every item's content DISTINCT from the others.

ITEMS:
[
${lines}
]

Return ONLY a JSON array; each element matches an item by "i" with fields per type:
- read_aloud:            {"i":n,"title":"3-6 word title","readText":"a 55-70 word academic passage to read aloud"}
- repeat_sentence:       {"i":n,"title":"...","sentence":"one natural 9-13 word sentence"}
- retell_lecture:        {"i":n,"title":"...","lecture":"a 75-95 word spoken academic lecture excerpt","keyPoints":["3-4 short bullet points a good retell would mention"],"retell":"a 55-75 word model retell in the speaker's own words"}
- answer_short_question: {"i":n,"title":"...","question":"a short general-knowledge question answerable in 1-3 words","answer":"the 1-3 word answer"}
- summarize_written_text:{"i":n,"title":"...","passage":"a 75-95 word academic passage","summary":"ONE sentence of 25-40 words capturing the main point"}
- essay:                 {"i":n,"title":"...","essayPrompt":"a 35-55 word PTE essay question ending in a clear task instruction","modelEssay":"a 220-280 word model essay answering it"}
Rules: realistic, varied, self-consistent; titles unique within this set; output strictly valid JSON array, no markdown.`;
}

function applyContent(q, c) {
  const title = (c.title || "").trim() || subOf(q.prompt) || "an academic topic";
  switch (q.questionType) {
    case "read_aloud":
      if (!c.readText) return false;
      q.readText = c.readText.trim(); q.modelAnswer = c.readText.trim();
      q.prompt = `Read Aloud — “${title}”. You have 35 seconds to prepare, then read the text below aloud for 40 seconds.`;
      break;
    case "repeat_sentence":
      if (!c.sentence) return false;
      q.audioScript = c.sentence.trim(); q.correctAnswer = c.sentence.trim(); q.modelAnswer = c.sentence.trim();
      q.prompt = `Repeat Sentence — “${title}”. You will hear a sentence; after it plays, repeat it exactly as you heard it.`;
      break;
    case "retell_lecture":
      if (!c.lecture) return false;
      q.audioScript = c.lecture.trim(); q.keyPoints = Array.isArray(c.keyPoints) ? c.keyPoints : [];
      q.modelAnswer = (c.retell || "").trim();
      q.prompt = `Re-tell Lecture — “${title}”. Listen to the lecture, then retell it in your own words in 40 seconds.`;
      break;
    case "answer_short_question":
      if (!c.question || !c.answer) return false;
      q.audioScript = c.question.trim(); q.correctAnswer = String(c.answer).trim(); q.modelAnswer = String(c.answer).trim();
      q.prompt = `Answer Short Question — “${title}”. You will hear a short question; answer it in one or a few words.`;
      break;
    case "summarize_written_text":
      if (!c.passage || !c.summary) return false;
      q.readText = c.passage.trim(); q.modelAnswer = c.summary.trim();
      q.prompt = `Summarize Written Text — “${title}”. Read the passage and write ONE sentence of 5–75 words. You have 10 minutes.`;
      break;
    case "essay":
    case "write_essay":
      if (!c.essayPrompt || !c.modelEssay) return false;
      q.prompt = c.essayPrompt.trim(); q.modelAnswer = c.modelEssay.trim();
      break;
    default: return false;
  }
  q.swReady = true;
  return true;
}

async function run() {
  const dir = path.join(__dirname, "..", "content", "pte", "speaking-writing");
  let files = fs.readdirSync(dir).filter(f => /^test-\d+\.json$/.test(f)).sort();
  const limit = process.argv.find(a => a.startsWith("--only="));
  if (limit) files = files.filter(f => f === limit.split("=")[1]);
  let testsDone = 0, itemsDone = 0, failed = 0;
  // process tests with limited concurrency
  let cursor = 0;
  async function worker() {
    while (cursor < files.length) {
      const f = files[cursor++];
      const fp = path.join(dir, f);
      const json = JSON.parse(fs.readFileSync(fp, "utf8"));
      const STIM = { read_aloud: "readText", summarize_written_text: "readText", repeat_sentence: "audioScript", retell_lecture: "audioScript", answer_short_question: "audioScript" };
      const needs = q => {
        if (!GEN_TYPES.has(q.questionType)) return false;
        if (/^A strong response would/.test(q.modelAnswer || "")) return true;     // boilerplate model answer
        if (/^Complete the /.test(q.prompt || "")) return true;                     // generic templated prompt
        const sf = STIM[q.questionType];
        if (sf && !q[sf]) return true;                                              // missing stimulus
        return false;
      };
      const jobItems = (json.questions || [])
        .map((q, i) => ({ i, q }))
        .filter(j => needs(j.q));
      if (!jobItems.length) continue;
      try {
        const arr = parse(await ask(buildPrompt(jobItems)));
        const byI = {}; for (const c of arr) if (c && typeof c.i === "number") byI[c.i] = c;
        let applied = 0;
        for (const j of jobItems) { const c = byI[j.i]; if (c && applyContent(j.q, c)) applied++; }
        if (applied) { fs.writeFileSync(fp, JSON.stringify(json, null, 2)); testsDone++; itemsDone += applied; }
        if (applied < jobItems.length) console.warn(`  ~ ${f}: ${applied}/${jobItems.length} items applied`);
        else console.log(`  ✓ ${f}: ${applied} items`);
      } catch (e) { failed++; console.warn(`  ✗ ${f}: ${e.message}`); }
      await sleep(300);
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  console.log(`\nDone. ${itemsDone} items across ${testsDone} tests. Failed tests: ${failed}.`);
  if (failed) process.exitCode = 2;
}
run().catch(e => { console.error("FATAL", e); process.exit(1); });
