#!/usr/bin/env node
/**
 * tools/gen-gmat-di-visuals.js
 * Deterministically converts GMAT Data Insights `dataContext` into a `visual`
 * spec consumed by visual-renderer.jsx (LP_VisualRenderer):
 *   - graphics_interpretation -> bar (categorical) or line (time series)
 *   - table_analysis          -> table
 * No AI/network. The underlying numbers are parsed from dataContext.data, which
 * is also echoed in the prompt text, so chart and question stay consistent.
 *
 * Idempotent: skips items that already have a valid `visual`.
 */
"use strict";
const fs   = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "content", "gmat", "data-insights");

function titleCase(s) {
  return String(s || "").replace(/\b\w/g, c => c.toUpperCase());
}
// Parse "Q1: $2.4M, Shares: 89, Click-through: 6.2%" -> [{label, valueStr, value}]
function parsePairs(dataStr) {
  return String(dataStr || "")
    .split(/,\s*(?=[^,]*:)/)            // split on commas that precede a "label:"
    .map(seg => {
      const ci = seg.indexOf(":");
      if (ci < 0) return null;
      const label = seg.slice(0, ci).trim();
      const valueStr = seg.slice(ci + 1).trim();
      const m = valueStr.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
      if (!label || !m) return null;
      return { label, valueStr, value: parseFloat(m[0]) };
    })
    .filter(Boolean);
}
// Unit hint for the y-axis, taken from the first value's trailing unit/symbol.
function unitHint(pairs) {
  const v = pairs[0]?.valueStr || "";
  if (/%/.test(v)) return "%";
  if (/\$/.test(v)) return "$ (millions)";
  const w = v.match(/[a-zA-Z]+$/);
  return w ? w[0] : "";
}
function isTimeSeries(pairs) {
  return pairs.every(p => /^(q[1-4]|fy\d|\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|week\s*\d|month\s*\d|year\s*\d)/i.test(p.label));
}

function buildVisual(q) {
  const dc = q.dataContext;
  if (!dc || typeof dc !== "object" || !dc.data) return null;
  const pairs = parsePairs(dc.data);
  if (pairs.length < 2) return null;
  const title = titleCase(`${dc.topic || ""}${dc.context ? " — " + dc.context : ""}`).trim() || "Data";

  if (q.questionType === "table_analysis") {
    return {
      chartType: "table",
      title,
      headers: ["Category", titleCase(dc.topic || "Value")],
      rows: pairs.map(p => [p.label, p.valueStr]),
    };
  }
  // graphics_interpretation -> line for time series, else bar
  const chartType = isTimeSeries(pairs) ? "line" : "bar";
  return {
    chartType,
    title,
    yLabel: unitHint(pairs),
    xAxis: pairs.map(p => p.label),
    series: [{ label: titleCase(dc.topic || "Value"), values: pairs.map(p => p.value) }],
  };
}

function validVisual(v) {
  if (!v) return false;
  if (v.chartType === "table") return Array.isArray(v.rows) && v.rows.length >= 2;
  return Array.isArray(v.xAxis) && v.xAxis.length >= 2 && Array.isArray(v.series) && v.series[0]?.values?.length === v.xAxis.length;
}

const TARGET_TYPES = new Set(["graphics_interpretation", "table_analysis"]);
const files = fs.readdirSync(dir).filter(f => /^test-\d+\.json$/.test(f)).sort();
let done = 0, skipped = 0, files_written = 0;
for (const f of files) {
  const fp = path.join(dir, f);
  const json = JSON.parse(fs.readFileSync(fp, "utf8"));
  let changed = false;
  (json.questions || []).forEach(q => {
    if (!TARGET_TYPES.has(q.questionType)) return;
    if (validVisual(q.visual)) { skipped++; return; }
    const v = buildVisual(q);
    if (v && validVisual(v)) { q.visual = v; changed = true; done++; }
  });
  if (changed) { fs.writeFileSync(fp, JSON.stringify(json, null, 2)); files_written++; }
}
console.log(`GMAT DI visuals: attached ${done}, already-present ${skipped}, files written ${files_written}.`);
