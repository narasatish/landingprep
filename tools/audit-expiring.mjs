// tools/audit-expiring.mjs
//
// Lists time-boxed / trending blog posts by their `expires` date so you can manage
// the stream: refresh the ones still trending, and let the rest lapse. Any post in
// blog-data.jsx with `expires: "YYYY-MM-DD"` auto-noindexes + drops from the sitemap
// once that date passes (the page stays reachable — no 404s). This tool just reports.
//
// Usage: node tools/audit-expiring.mjs   (or: npm run audit:expiring)
//
// Workflow for a trending post: add it to blog-data.jsx with
//   "expires": "<about 1 month out>"
// Publish now; after the date it quietly de-indexes itself. Nothing to delete.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
let posts = [];
try {
  const w = {};
  new Function("window", fs.readFileSync(path.join(ROOT, "blog-data.jsx"), "utf8"))(w);
  posts = w.LP_BLOG_EXTRA || w.LP_BLOG || [];
} catch (e) { console.error("could not load blog-data.jsx:", e.message); process.exit(0); }

const today = new Date();
const dayMs = 86400000;
const timed = posts.filter((p) => p && p.expires).map((p) => {
  const days = Math.round((new Date(p.expires + "T00:00:00Z") - today) / dayMs);
  return { id: p.id, expires: p.expires, days };
});

console.log(`\n──────── TIME-BOXED / TRENDING POSTS ────────`);
if (!timed.length) {
  console.log("No posts have an `expires` date yet. To publish a trending post that self-retires,");
  console.log('add `"expires": "YYYY-MM-DD"` (about a month out) to its object in blog-data.jsx.');
  process.exit(0);
}
const expired = timed.filter((t) => t.days < 0).sort((a, b) => a.days - b.days);
const soon = timed.filter((t) => t.days >= 0 && t.days <= 7).sort((a, b) => a.days - b.days);
const live = timed.filter((t) => t.days > 7).sort((a, b) => a.days - b.days);

console.log(`Tracked: ${timed.length} | live: ${live.length} | expiring ≤7 days: ${soon.length} | expired (now noindexed): ${expired.length}`);
if (soon.length) {
  console.log(`\n⏳ Expiring within 7 days — refresh if still trending, else let it lapse:`);
  for (const t of soon) console.log(`   ${t.days}d left  /blog/${t.id}/  (expires ${t.expires})`);
}
if (expired.length) {
  console.log(`\n🗄  Expired → auto-noindexed + out of sitemap (still reachable, no 404):`);
  for (const t of expired) console.log(`   ${-t.days}d ago  /blog/${t.id}/  (expired ${t.expires})`);
  console.log(`\n(To fully remove one, delete its object from blog-data.jsx and its /blog/<id>/ folder; noindex is usually enough.)`);
}
process.exit(0);
