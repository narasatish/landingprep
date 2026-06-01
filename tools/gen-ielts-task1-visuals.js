#!/usr/bin/env node
/**
 * tools/gen-ielts-task1-visuals.js
 * Attaches REAL chart data (`visual`) to each IELTS Academic Writing Task 1 item
 * and rewrites its modelAnswer so the description matches the chart exactly.
 *
 * The renderer (visual-renderer.jsx → LP_VisualRenderer) already consumes
 * task.visual with shapes:
 *   bar/line: { chartType, title, yLabel, xAxis:[...], series:[{label,values:[...]}] }
 *   pie:      { chartType:"pie", title, slices:[{label,value}] }
 *   table:    { chartType:"table", title, headers:[...], rows:[[...]] }
 *
 * SECURITY: GEMINI_API_KEY read from .env (server-side). Never written to content.
 * Idempotent: skips Task 1 items that already have a valid `visual`.
 */
"use strict";
const fs    = require("fs");
const path  = require("path");
const https = require("https");

const ENV = (() => {
  const txt = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
  const o = {};
  for (const l of txt.split(/\r?\n/)) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, ""); }
  return o;
})();
const KEY = (ENV.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "").trim();
if (!KEY || KEY.includes("YOUR")) { console.error("✗ no GEMINI_API_KEY"); process.exit(1); }
const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function post(model, prompt) {
  return new Promise((resolve, reject) => {
    const cfg = { temperature: 0.6, maxOutputTokens: 2048, topP: 0.95, responseMimeType: "application/json" };
    if (model.startsWith("gemini-2.5")) cfg.thinkingConfig = { thinkingBudget: 0 };
    const body = JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: cfg });
    const req = https.request({
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/${model}:generateContent?key=${KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    }, (res) => {
      let d = ""; res.on("data", c => d += c);
      res.on("end", () => {
        if (res.statusCode === 429 || res.statusCode >= 500) return reject({ retry: true, msg: res.statusCode });
        try {
          const j = JSON.parse(d);
          const t = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (!t) return reject({ retry: false, msg: "empty: " + d.slice(0, 160) });
          resolve(t.trim());
        } catch (e) { reject({ retry: false, msg: "parse: " + d.slice(0, 160) }); }
      });
    });
    req.on("error", e => reject({ retry: true, msg: e.message }));
    req.write(body); req.end();
  });
}
async function ask(prompt) {
  for (const m of MODELS) for (let a = 0; a < 4; a++) {
    try { return await post(m, prompt); }
    catch (e) { if (e.retry && a < 3) { await sleep(2000 * (a + 1)); continue; } if (e.retry) break; throw new Error(`[${m}] ${e.msg}`); }
  }
  throw new Error("exhausted");
}

function parseJson(text) {
  let t = text.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(t);
}

// Validate the visual shape so the renderer never receives malformed data.
function validVisual(v) {
  if (!v || typeof v !== "object") return false;
  const ct = v.chartType;
  if (ct === "pie") return Array.isArray(v.slices) && v.slices.length >= 2 && v.slices.every(s => s && s.label && typeof s.value === "number");
  if (ct === "table") return Array.isArray(v.headers) && Array.isArray(v.rows) && v.rows.length >= 1;
  if (ct === "bar" || ct === "line") return Array.isArray(v.xAxis) && v.xAxis.length >= 2 && Array.isArray(v.series) && v.series.length >= 1 && v.series.every(s => s && s.label && Array.isArray(s.values) && s.values.length === v.xAxis.length);
  return false;
}

function buildPrompt(promptText) {
  return `You are an IELTS Academic Writing Task 1 content designer. For the task below, design the chart's underlying data and write a Band 9 model answer that describes THAT data exactly.

TASK PROMPT: ${promptText}

Return ONLY a JSON object with this exact shape (no markdown, no comments):
{
  "visual": {
    "chartType": "bar" | "line" | "pie" | "table",
    "title": "short chart title",
    "yLabel": "axis label (omit for pie/table)",
    "xAxis": ["cat1","cat2",...],            // for bar/line ONLY: the category axis (years or groups)
    "series": [{"label":"Series name","values":[n,n,...]}],  // for bar/line ONLY; values length MUST equal xAxis length
    "slices": [{"label":"...","value":n}],   // for pie ONLY (values are percentages summing to ~100)
    "headers": ["...","..."],                // for table ONLY
    "rows": [["...","..."]]                  // for table ONLY
  },
  "modelAnswer": "170-190 word Band 9 description"
}

RULES:
- Choose chartType to MATCH the chart named in the task prompt (bar chart->bar, line graph->line, pie chart->pie, table->table). If the prompt mentions multiple, pick the primary one.
- Invent realistic, internally consistent figures. For bar/line, every series.values array length MUST equal xAxis length.
- The modelAnswer MUST reference the SAME figures/categories that appear in the visual (an overview of main trends + two body paragraphs of grouped comparisons). Formal academic register. No headings. No word count line.
- Output strictly valid JSON.`;
}

async function run() {
  const dir = path.join(__dirname, "..", "content", "ielts", "writing");
  const files = fs.readdirSync(dir).filter(f => /^test-\d+\.json$/.test(f)).sort();
  const jobs = [];
  for (const f of files) {
    const fp = path.join(dir, f);
    const json = JSON.parse(fs.readFileSync(fp, "utf8"));
    (json.questions || []).forEach((q, idx) => {
      const isTask1 = q.taskNumber === 1 || idx === 0;
      if (isTask1 && !validVisual(q.visual)) jobs.push({ fp, idx, f, json });
    });
  }
  console.log(`IELTS Task 1 items needing a visual: ${jobs.length}`);
  if (!jobs.length) return;

  const dirty = new Map();
  let done = 0, failed = 0, cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const json = dirty.get(job.fp) || job.json;
      const q = json.questions[job.idx];
      try {
        const out = parseJson(await ask(buildPrompt(q.prompt)));
        if (!validVisual(out.visual)) throw new Error("invalid visual shape");
        if (!out.modelAnswer || out.modelAnswer.split(/\s+/).length < 100) throw new Error("answer too short");
        q.visual = out.visual;
        q.modelAnswer = out.modelAnswer.trim();
        dirty.set(job.fp, json);
        done++;
        if (done <= 3 || done % 5 === 0) console.log(`  ✓ ${job.f} [${out.visual.chartType}] (${out.modelAnswer.split(/\s+/).length}w) [${done}/${jobs.length}]`);
      } catch (e) { failed++; console.warn(`  ✗ ${job.f}: ${e.message}`); }
      await sleep(300);
    }
  }
  await Promise.all([worker(), worker(), worker()]);
  for (const [fp, json] of dirty) fs.writeFileSync(fp, JSON.stringify(json, null, 2));
  console.log(`\nDone. ${done} generated, ${failed} failed, ${dirty.size} files written.`);
  if (failed) process.exitCode = 2;
}
run().catch(e => { console.error("FATAL", e); process.exit(1); });
