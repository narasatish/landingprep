// Strict schema + quality gate for Smart Notes. Run over all content/smart-notes/**.json.
// Usage: node tools/validate-smart-notes.mjs [file ...]
import fs from "node:fs";
import path from "node:path";
const DIR = path.resolve(import.meta.dirname, "..", "content", "smart-notes");
const TEMPLATE_MARK = "is an important subject of modern"; // reuse the anti-boilerplate sentinel
let errors = 0;
const err = (f, m) => { console.error(`✗ ${f}: ${m}`); errors++; };
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const exam of fs.readdirSync(dir)) {
    const ed = path.join(dir, exam);
    if (!fs.statSync(ed).isDirectory()) continue;
    for (const f of fs.readdirSync(ed)) if (f.endsWith(".json")) out.push(path.join(ed, f));
  }
  return out;
}
const files = process.argv.slice(2).length ? process.argv.slice(2) : walk(DIR);
for (const fp of files) {
  const f = path.relative(DIR, fp);
  let j; try { j = JSON.parse(fs.readFileSync(fp, "utf8").replace(/^﻿/, "")); }
  catch (e) { err(f, "invalid JSON: " + e.message); continue; }
  const want = (k, cond, msg) => { if (!cond) err(f, `${k}: ${msg}`); };
  want("id", typeof j.id === "string" && /^[a-z0-9-]+$/.test(j.id), "must be a slug");
  want("exam", typeof j.exam === "string" && j.exam.length > 1, "required");
  want("section", typeof j.section === "string" && j.section.length > 1, "required");
  want("title", typeof j.title === "string" && j.title.length >= 8, "required (>=8 chars)");
  want("estMinutes", Number.isFinite(j.estMinutes) && j.estMinutes >= 3 && j.estMinutes <= 12, "3–12");
  want("summary", typeof j.summary === "string" && j.summary.length >= 20, "required (>=20 chars)");
  const cm = j.conceptMap || {};
  want("conceptMap.central", typeof cm.central === "string" && cm.central.length > 2, "required");
  want("conceptMap.nodes", Array.isArray(cm.nodes) && cm.nodes.length >= 4 && cm.nodes.length <= 7, "4–7 nodes");
  (cm.nodes || []).forEach((n, i) => want(`conceptMap.nodes[${i}]`, n && n.label && n.note, "need label + note"));
  want("chunks", Array.isArray(j.chunks) && j.chunks.length >= 3 && j.chunks.length <= 5, "3–5 chunks");
  (j.chunks || []).forEach((c, i) => {
    want(`chunks[${i}]`, c && c.heading && c.body && c.realExample && c.memoryHook, "need heading/body/realExample/memoryHook");
    if (c && String(c.body || "").includes(TEMPLATE_MARK)) err(f, `chunks[${i}] contains template boilerplate`);
  });
  want("recall", Array.isArray(j.recall) && j.recall.length === 5, "exactly 5 recall Q&A");
  (j.recall || []).forEach((r, i) => want(`recall[${i}]`, r && r.q && r.a, "need q + a"));
}
console.log(errors ? `\n✗ ${errors} problem(s) in ${files.length} file(s).` : `✓ ${files.length} Smart Note(s) valid.`);
process.exit(errors ? 1 : 0);
