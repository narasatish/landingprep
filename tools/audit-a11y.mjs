#!/usr/bin/env node
/**
 * Static accessibility audit over the prerendered pages.
 *
 * Deliberately limited to what static HTML can PROVE. Contrast, focus order, screen-reader
 * behaviour and keyboard traps need a real browser and are NOT covered here — this reports
 * the structural defects that are deterministic, and says nothing about the rest.
 */
import fs from "fs";
import path from "path";

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/node_modules|\.git|content|scripts|tools|\.claude/.test(p)) walk(p); }
    else if (e.name.endsWith(".html")) files.push(p);
  }
};
walk(".");

const counts = {};
const samples = {};
const flag = (k, file, extra) => {
  counts[k] = (counts[k] || 0) + 1;
  (samples[k] = samples[k] || []);
  if (samples[k].length < 4) samples[k].push(path.relative(".", file).replace(/\\/g, "/") + (extra ? "  " + extra : ""));
};

for (const f of files) {
  const h = fs.readFileSync(f, "utf8");

  if (!/<html[^>]+lang=/i.test(h)) flag("html missing lang attribute", f);

  const h1 = (h.match(/<h1[\s>]/gi) || []).length;
  if (h1 === 0) flag("page has no <h1>", f);
  if (h1 > 1) flag("page has more than one <h1>", f, `(${h1})`);

  // images without alt (alt="" is valid for decorative, so only flag a MISSING attribute)
  for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/i.test(m[0])) flag("img without alt attribute", f, m[0].slice(0, 70));
  }

  // links whose only content is an icon/emoji with no text and no aria-label
  for (const m of h.matchAll(/<a\b[^>]*>([\s\S]{0,80}?)<\/a>/gi)) {
    const tag = m[0], inner = m[1];
    if (/aria-label\s*=|title\s*=/i.test(tag)) continue;
    const text = inner.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, "").trim();
    // strip emoji/pictographs — a link labelled only by an emoji has no accessible name
    const letters = text.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\u200d\ufe0f\s]/gu, "");
    if (!letters) flag("link with no accessible text", f, tag.slice(0, 70));
  }

  // buttons with no text and no aria-label
  for (const m of h.matchAll(/<button\b[^>]*>([\s\S]{0,80}?)<\/button>/gi)) {
    if (/aria-label\s*=/i.test(m[0])) continue;
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    const letters = text.replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\u200d\ufe0f\s]/gu, "");
    if (!letters) flag("button with no accessible name", f, m[0].slice(0, 70));
  }

  // inputs with neither a label[for], an aria-label, nor a title
  for (const m of h.matchAll(/<input\b[^>]*>/gi)) {
    const tag = m[0];
    if (/type\s*=\s*["'](hidden|submit|button|image)["']/i.test(tag)) continue;
    if (/aria-label\s*=|aria-labelledby\s*=|title\s*=/i.test(tag)) continue;
    const idm = /\bid\s*=\s*["']([^"']+)["']/i.exec(tag);
    if (idm && new RegExp(`<label[^>]+for\\s*=\\s*["']${idm[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(h)) continue;
    flag("input without an associated label", f, tag.slice(0, 70));
  }

  // heading level skips (h1 -> h3)
  const levels = [...h.matchAll(/<h([1-6])[\s>]/gi)].map((m) => +m[1]);
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) { flag("heading level skipped", f, `h${levels[i - 1]} → h${levels[i]}`); break; }
  }
}

console.log("\n──────── STATIC ACCESSIBILITY AUDIT ────────");
console.log(`pages scanned: ${files.length}\n`);
const keys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
if (!keys.length) console.log("no structural accessibility defects found");
for (const k of keys) {
  console.log(`${String(counts[k]).padStart(6)}  ${k}`);
  samples[k].forEach((s) => console.log(`          ${s}`));
}
console.log("\nNOT covered by this audit: colour contrast, focus order, keyboard traps,");
console.log("screen-reader announcements, motion preferences. Those need a real browser.");
// Gate, don't just report. A check that always exits 0 is a dashboard, not a guard — and
// the whole reason these defects survived is that nothing was failing on them.
if (keys.length) {
  console.log(`\n✗ ${keys.reduce((s, k) => s + counts[k], 0)} structural accessibility defect(s).`);
  process.exit(1);
}
console.log("\n✓ no structural accessibility defects");
