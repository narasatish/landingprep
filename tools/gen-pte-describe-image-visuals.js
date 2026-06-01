#!/usr/bin/env node
/**
 * tools/gen-pte-describe-image-visuals.js
 * Attaches a renderable chart (`visual`) to every PTE "describe_image" item,
 * rewrites its prompt to point at the chart, and refreshes the spoken model
 * answer so it describes that chart. Renderer: visual-renderer.jsx via the
 * SpeakingSection describe-visual block (item.task.visual).
 *
 * Chart types restricted to bar | line | pie | table (the renderer's supported
 * set). SECURITY: key from .env, never written to content. Idempotent.
 */
"use strict";
const fs    = require("fs");
const path  = require("path");
const https = require("https");

const ENV = (() => {
  const txt = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8"); const o = {};
  for (const l of txt.split(/\r?\n/)) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
  return o;
})();
const KEY = (ENV.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
if (!KEY || KEY.includes("YOUR")) { console.error("✗ no GEMINI_API_KEY"); process.exit(1); }
const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function post(model, prompt) {
  return new Promise((resolve, reject) => {
    const cfg = { temperature: 0.7, maxOutputTokens: 1024, topP: 0.95, responseMimeType: "application/json" };
    if (model.startsWith("gemini-2.5")) cfg.thinkingConfig = { thinkingBudget: 0 };
    const body = JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: cfg });
    const req = https.request({
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/${model}:generateContent?key=${KEY}`,
      method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    }, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        if (res.statusCode === 429 || res.statusCode >= 500) return reject({ retry: true, msg: res.statusCode });
        try { const j = JSON.parse(d); const t = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (!t) return reject({ retry: false, msg: "empty:" + d.slice(0, 120) }); resolve(t.trim());
        } catch (e) { reject({ retry: false, msg: "parse:" + d.slice(0, 120) }); }
      });
    });
    req.on("error", e => reject({ retry: true, msg: e.message }));
    req.write(body); req.end();
  });
}
async function ask(p) {
  for (const m of MODELS) for (let a = 0; a < 4; a++) {
    try { return await post(m, p); } catch (e) { if (e.retry && a < 3) { await sleep(2000 * (a + 1)); continue; } if (e.retry) break; throw new Error(`[${m}] ${e.msg}`); }
  }
  throw new Error("exhausted");
}
const parse = (t) => JSON.parse(t.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim());

function validVisual(v) {
  if (!v || typeof v !== "object") return false;
  if (v.chartType === "pie") return Array.isArray(v.slices) && v.slices.length >= 2 && v.slices.every(s => s && s.label && typeof s.value === "number");
  if (v.chartType === "table") return Array.isArray(v.headers) && Array.isArray(v.rows) && v.rows.length >= 2;
  if (v.chartType === "bar" || v.chartType === "line") return Array.isArray(v.xAxis) && v.xAxis.length >= 2 && Array.isArray(v.series) && v.series.length >= 1 && v.series.every(s => s && s.label && Array.isArray(s.values) && s.values.length === v.xAxis.length);
  return false;
}

function buildPrompt(q) {
  return `You design a PTE Academic "Describe Image" task. Given the topic/prompt below, invent a clear chart and write a 70-90 word spoken model description of THAT chart.

CURRENT PROMPT/TOPIC: ${q.prompt}
TOPIC TAG: ${q.topic || ""}

Return ONLY JSON (no markdown):
{
  "visual": {
    "chartType": "bar"|"line"|"pie"|"table",
    "title": "...", "yLabel": "(bar/line only)",
    "xAxis": ["..."], "series": [{"label":"...","values":[n,...]}],   // bar/line; values length == xAxis length
    "slices": [{"label":"...","value":n}],                            // pie (percentages ~100)
    "headers": ["..."], "rows": [["..."]]                             // table
  },
  "prompt": "Look at the <chart type> below. You have 40 seconds to describe what it shows in as much detail as you can.",
  "modelAnswer": "70-90 word spoken description that references the chart's key figures, the highest/lowest values, and one comparison or trend."
}
RULES: pick chartType appropriate to the topic; keep figures realistic and internally consistent; the modelAnswer MUST match the figures in the visual. Output strictly valid JSON.`;
}

async function run() {
  const dir = path.join(__dirname, "..", "content", "pte", "speaking-writing");
  const files = fs.readdirSync(dir).filter(f => /^test-\d+\.json$/.test(f)).sort();
  const jobs = [];
  for (const f of files) {
    const fp = path.join(dir, f);
    const json = JSON.parse(fs.readFileSync(fp, "utf8"));
    (json.questions || []).forEach((q, idx) => {
      if (q.questionType === "describe_image" && !validVisual(q.visual)) jobs.push({ fp, idx, f });
    });
  }
  console.log(`PTE describe_image items needing a visual: ${jobs.length}`);
  if (!jobs.length) return;

  const cache = new Map();
  const getJson = (fp) => { if (!cache.has(fp)) cache.set(fp, JSON.parse(fs.readFileSync(fp, "utf8"))); return cache.get(fp); };
  const dirty = new Set();
  let done = 0, failed = 0, cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const json = getJson(job.fp); const q = json.questions[job.idx];
      try {
        const out = parse(await ask(buildPrompt(q)));
        if (!validVisual(out.visual)) throw new Error("bad visual");
        q.visual = out.visual;
        if (out.prompt && out.prompt.length > 20) q.prompt = out.prompt.trim();
        if (out.modelAnswer && out.modelAnswer.split(/\s+/).length >= 40) q.modelAnswer = out.modelAnswer.trim();
        dirty.add(job.fp); done++;
        if (done <= 3 || done % 25 === 0) console.log(`  ✓ ${job.f} [${out.visual.chartType}] [${done}/${jobs.length}]`);
      } catch (e) { failed++; if (failed <= 10) console.warn(`  ✗ ${job.f}: ${e.message}`); }
      await sleep(250);
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  for (const fp of dirty) fs.writeFileSync(fp, JSON.stringify(getJson(fp), null, 2));
  console.log(`\nDone. ${done} generated, ${failed} failed, ${dirty.size} files written.`);
  if (failed) process.exitCode = 2;
}
run().catch(e => { console.error("FATAL", e); process.exit(1); });
