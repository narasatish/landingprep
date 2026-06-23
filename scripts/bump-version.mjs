#!/usr/bin/env node
// Auto-bump the cache-busting version on every build so users always fetch fresh JS/CSS
// and the service worker re-caches. Keeps two things in sync to a single monotonic number:
//   • the service-worker CACHE_VERSION ("lp-vN") in sw.js
//   • every  ?v=N  query on asset URLs in index.html
// Run as the first step of `npm run build`. Idempotent within a build; each build bumps once.
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SW = join(ROOT, "sw.js");
const INDEX = join(ROOT, "index.html");

// Tolerate a transient file lock (OneDrive sync) by retrying the write a few times.
function writeRetry(path, content, label) {
  for (let i = 0; i < 6; i++) {
    try { writeFileSync(path, content); return; }
    catch (e) {
      if (i === 5) throw e;
      const until = Date.now() + 1500; while (Date.now() < until) { /* brief spin-wait */ }
    }
  }
}

// 1. Read the current SW version number as the source of truth.
const sw = readFileSync(SW, "utf8");
const m = sw.match(/CACHE_VERSION\s*=\s*"lp-v(\d+)"/);
if (!m) { console.error("[bump-version] could not find CACHE_VERSION in sw.js — skipping"); process.exit(0); }
const next = parseInt(m[1], 10) + 1;

// 2. Bump sw.js CACHE_VERSION and any ?v= refs in its precache list.
writeRetry(SW, sw
  .replace(/CACHE_VERSION\s*=\s*"lp-v\d+"/, `CACHE_VERSION = "lp-v${next}"`)
  .replace(/\?v=\d+/g, `?v=${next}`));

// 3. Set every ?v=N in index.html to the same number.
const index = readFileSync(INDEX, "utf8");
const updated = index.replace(/\?v=\d+/g, `?v=${next}`);
const count = (index.match(/\?v=\d+/g) || []).length;
writeRetry(INDEX, updated);

console.log(`[bump-version] cache version -> lp-v${next} (sw.js + ${count} asset refs in index.html)`);
