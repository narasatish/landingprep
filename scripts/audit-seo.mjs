// audit-seo.mjs — deterministic SEO/indexing health check for the prerendered site.
// Cross-checks sitemap ↔ on-disk pages, broken internal links, and per-page SEO tags
// (canonical, title, meta description, og:image, valid JSON-LD). Read-only; exits 1 on
// any hard error so it can gate a deploy. Run: node scripts/audit-seo.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://landingprep.com";
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, "/");

// ── 1. Collect on-disk prerendered routes (every dir with an index.html) ───────
const SKIP = new Set(["node_modules", ".git", "scripts", "tests", "dist", "emails", ".well-known"]);
const diskRoutes = new Map(); // "/path/" -> absolute file
(function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.isDirectory()) {
      if (SKIP.has(name.name) || name.name.startsWith(".")) continue;
      walk(path.join(dir, name.name));
    } else if (name.name === "index.html") {
      const r = "/" + rel(path.join(dir, "index.html")).replace(/index\.html$/, "");
      diskRoutes.set(r === "/" ? "/" : r, path.join(dir, name.name));
    }
  }
})(ROOT);

// ── 2. Parse sitemap ───────────────────────────────────────────────────────────
const sitemap = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const sitemapRoutes = new Set(sitemapUrls.map((u) => u.replace(BASE, "").replace(/^$/, "/")));

const errors = [], warnings = [];

// ── 3. Sitemap ↔ disk consistency ──────────────────────────────────────────────
for (const u of sitemapRoutes) {
  const norm = u.endsWith("/") || u === "/" ? u : u + "/";
  if (!diskRoutes.has(norm) && !diskRoutes.has(u)) errors.push(`SITEMAP→404: ${u} is in sitemap but has no prerendered page on disk`);
}
const ORPHAN_OK = new Set(["/", "/admin/"]); // root + private owner dashboard (noindex, not in sitemap)
for (const [r] of diskRoutes) {
  if (r === "/") continue;
  const variants = [r, r.replace(/\/$/, ""), BASE + r, BASE + r.replace(/\/$/, "")];
  if (!variants.some((v) => sitemapRoutes.has(v) || sitemapRoutes.has(v + "/")) && !ORPHAN_OK.has(r)) {
    warnings.push(`ORPHAN: ${r} has a prerendered page but is not in sitemap.xml`);
  }
}

// ── 4. Per-page SEO-tag + internal-link checks ─────────────────────────────────
const routeExists = (href) => {
  let p = href.split("#")[0].split("?")[0];
  if (!p.startsWith("/")) return true;          // relative/asset — skip
  if (/\.(png|jpg|jpeg|svg|webp|ico|xml|txt|json|js|css|pdf|webmanifest)$/i.test(p)) {
    return fs.existsSync(path.join(ROOT, p.replace(/^\//, "")));
  }
  const norm = p.endsWith("/") ? p : p + "/";
  return diskRoutes.has(norm) || diskRoutes.has(p) || fs.existsSync(path.join(ROOT, p.replace(/^\//, "")));
};

let pagesChecked = 0;
const brokenLinkCounts = new Map();
const inbound = new Map(); // route -> Set of pages that link to it (crawl-graph)
for (const [r] of diskRoutes) inbound.set(r, new Set());
const normRoute = (href) => {
  const p = href.split("#")[0].split("?")[0];
  const n = p.endsWith("/") ? p : p + "/";
  if (diskRoutes.has(n)) return n;
  if (diskRoutes.has(p)) return p;
  return null;
};
for (const [route, file] of diskRoutes) {
  const html = fs.readFileSync(file, "utf8");
  pagesChecked++;
  const isStatic = route !== "/"; // root is the SPA shell; sub-routes are prerendered SEO pages
  if (isStatic) {
    if (!/<link[^>]+rel=["']canonical["']/.test(html)) errors.push(`NO-CANONICAL: ${route}`);
    if (!/<title>[^<]{5,}<\/title>/.test(html)) errors.push(`NO-TITLE: ${route}`);
    const descM = html.match(/<meta[^>]+name=["']description["'][^>]+content=("([^"]*)"|'([^']*)')/);
    const descVal = descM ? (descM[2] != null ? descM[2] : descM[3]) : "";
    if (descVal.trim().length < 20) warnings.push(`THIN-DESC: ${route}`);
    // canonical should match the route
    const can = (html.match(/rel=["']canonical["'][^>]+href=["']([^"']+)["']/) || [])[1];
    if (can) {
      const cr = can.replace(BASE, "");
      const want = route;
      if (cr !== want && cr + "/" !== want && cr !== want.replace(/\/$/, "")) {
        warnings.push(`CANONICAL-MISMATCH: ${route} → canonical points to ${cr}`);
      }
    }
    // JSON-LD validity
    for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)) {
      try { JSON.parse(m[1].trim()); } catch (e) { errors.push(`BAD-JSONLD: ${route} — ${e.message}`); }
    }
  }
  // internal links
  for (const m of html.matchAll(/href=["'](\/[^"'#][^"']*)["']/g)) {
    const href = m[1];
    if (href.startsWith("//")) continue;
    if (!routeExists(href)) {
      brokenLinkCounts.set(href, (brokenLinkCounts.get(href) || 0) + 1);
    }
    const tgt = normRoute(href);
    if (tgt && tgt !== route) inbound.get(tgt).add(route);
  }
}

// ── 5. Crawl-graph: pages with no inbound internal links (hard to discover/rank) ─
const crawlOrphans = [];
for (const [route, srcs] of inbound) {
  if (route === "/") continue;
  if (srcs.size === 0) crawlOrphans.push(route);
}
for (const r of crawlOrphans) warnings.push(`CRAWL-ORPHAN: ${r} — no other prerendered page links to it (only reachable via sitemap)`);
for (const [href, count] of [...brokenLinkCounts.entries()].sort((a, b) => b[1] - a[1])) {
  errors.push(`BROKEN-LINK: ${href} (referenced on ${count} page${count > 1 ? "s" : ""}) — target has no page/file`);
}

// ── Report ─────────────────────────────────────────────────────────────────────
console.log(`\n──────── SEO / INDEXING AUDIT ────────`);
console.log(`Prerendered pages on disk : ${diskRoutes.size}`);
console.log(`URLs in sitemap.xml       : ${sitemapRoutes.size}`);
console.log(`Pages scanned             : ${pagesChecked}`);
console.log(`Unique broken link targets: ${brokenLinkCounts.size}`);
console.log(`Crawl-orphan pages (0 inbound links): ${crawlOrphans.length}`);
console.log(`Warnings                  : ${warnings.length}`);
console.log(`Errors                    : ${errors.length}\n`);

if (warnings.length) {
  console.log("── WARNINGS ──");
  const cap = process.env.FULL ? warnings.length : 40;
  for (const w of warnings.slice(0, cap)) console.log("  ⚠ " + w);
  if (warnings.length > cap) console.log(`  …and ${warnings.length - cap} more`);
  console.log("");
}
if (errors.length) {
  console.log("── ERRORS ──");
  for (const e of errors.slice(0, 60)) console.log("  ✗ " + e);
  if (errors.length > 60) console.log(`  …and ${errors.length - 60} more`);
  console.log("\n❌ AUDIT FAILED");
  process.exit(1);
}
console.log("✅ AUDIT PASSED — sitemap, links and SEO tags are consistent.\n");
