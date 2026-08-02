// LandingPrep — precompile all JSX to plain JS so the browser doesn't run Babel
// at load time (big first-paint speedup). Each .jsx referenced by index.html is
// transpiled 1:1 to a .js sibling, preserving the exact "global window.LP_*"
// script model (no bundling, no module wrapping) — so nothing about load order
// or globals changes; we only remove the runtime JSX transform.
//
// Run:  node scripts/precompile-jsx.mjs   (also part of `npm run build`)
import { transformSync } from "esbuild";
import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import path from "path";

const root = process.cwd();
const html = readFileSync(path.join(root, "index.html"), "utf8");

// index.html loads precompiled `.js` files; map each back to its `.jsx` source
// (skip any .js that has no .jsx, e.g. third-party). Also accept legacy `.jsx`
// references so this works before/after the migration.
const re = /src="([^"?]+)\.jsx?(?:\?v=\d+)?"/g;
const files = new Set();
let m;
while ((m = re.exec(html))) {
  const jsx = m[1] + ".jsx";
  if (existsSync(path.join(root, jsx))) files.add(jsx);
}

// Also transpile LAZY-loaded modules (e.g. blog-data.jsx) that aren't <script src>
// in index.html but are loaded on demand via window.LP_loadScript(). Rule: any
// X.jsx that already has a compiled X.js sibling is a tracked output → keep it in
// sync. This makes content automation (auto-appending blog posts) self-healing.
for (const dir of ["", "screens"]) {
  const abs = path.join(root, dir);
  let entries = [];
  try { entries = readdirSync(abs); } catch { continue; }
  for (const f of entries) {
    if (!f.endsWith(".jsx")) continue;
    const rel = dir ? `${dir}/${f}` : f;
    const jsSibling = path.join(root, rel.replace(/\.jsx$/, ".js"));
    if (existsSync(jsSibling)) files.add(rel);
  }
}

let ok = 0;
const errors = [];
for (const rel of files) {
  try {
    const src = readFileSync(path.join(root, rel), "utf8");
    const out = transformSync(src, {
      loader: "jsx",
      jsx: "transform",
      jsxFactory: "React.createElement",
      jsxFragment: "React.Fragment",
      target: "es2019",
      legalComments: "none",
    });
    writeFileSync(path.join(root, rel.replace(/\.jsx$/, ".js")), out.code);
    ok++;
  } catch (e) {
    errors.push(rel + " → " + e.message);
  }
}

console.log(`[precompile] transpiled ${ok}/${files.size} JSX files to JS`);
if (errors.length) {
  console.error("[precompile] FAILURES:\n  " + errors.join("\n  "));
  process.exit(1);
}

// ── Guardrail (added after a v385→v388 incident where college-data.js and
// blog-data.js were 404 on production for several deploys). These modules are
// LAZY-loaded (not <script src> in index.html), so they are only re-transpiled
// when their .js sibling already exists (see the sibling rule above). If a
// sibling is ever deleted (e.g. a stray `rm` to dodge a Windows/OneDrive file
// lock), precompile silently skips it, `git add -A` stages the deletion, and
// because Render serves committed files as-is (no build step), the file 404s on
// the live site — taking down the College Predictor / in-app blog. Fail LOUD
// here so it can never ship silently again.
const REQUIRED_LAZY_OUTPUTS = ["college-data.js", "blog-data.js", "seo-pages.js"];
const missingCritical = REQUIRED_LAZY_OUTPUTS.filter((f) => !existsSync(path.join(root, f)));
if (missingCritical.length) {
  console.error(
    "[precompile] ❌ CRITICAL: required lazy-loaded output(s) missing after transpile: " +
    missingCritical.join(", ") +
    "\n  These are served as-is on production (Render has no build step) and would 404." +
    "\n  Do NOT `rm` these .js files before building — they only regenerate when the sibling exists." +
    "\n  Recover: run `npm run precompile` with the .js present, or transpile the .jsx directly."
  );
  process.exit(1);
}
