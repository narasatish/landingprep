// LandingPrep — precompile all JSX to plain JS so the browser doesn't run Babel
// at load time (big first-paint speedup). Each .jsx referenced by index.html is
// transpiled 1:1 to a .js sibling, preserving the exact "global window.LP_*"
// script model (no bundling, no module wrapping) — so nothing about load order
// or globals changes; we only remove the runtime JSX transform.
//
// Run:  node scripts/precompile-jsx.mjs   (also part of `npm run build`)
import { transformSync } from "esbuild";
import { readFileSync, writeFileSync, existsSync } from "fs";
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
