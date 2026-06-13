#!/usr/bin/env node
/**
 * tools/run-tests.js — pin-to-pin test runner for LandingPrep.
 * Covers everything verifiable in Node: content validity, SEO/structured-data
 * integrity, security (no leaked key), cache-version consistency, and the
 * integrity of the data/catalog/renderer wiring.
 *
 * Run: node tools/run-tests.js   (exit 0 = all green)
 */
"use strict";
const fs = require("fs");
const path = require("path");
const cp = require("child_process");

const ROOT = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const exists = (p) => fs.existsSync(path.join(ROOT, p));

let pass = 0, fail = 0;
const fails = [];
function ok(name) { pass++; console.log("  \x1b[32m✓\x1b[0m " + name); }
function bad(name, detail) { fail++; fails.push(name + (detail ? " — " + detail : "")); console.log("  \x1b[31m✗\x1b[0m " + name + (detail ? "  (" + detail + ")" : "")); }
function check(name, cond, detail) { cond ? ok(name) : bad(name, detail); }
function group(t) { console.log("\n\x1b[1m" + t + "\x1b[0m"); }

// ── 1. Content validity (delegates to the content validator) ─────────────────
group("Content");
try {
  const out = cp.execSync("node tools/validate-tests.js", { cwd: ROOT, encoding: "utf8" })
    .replace(/\x1b\[[0-9;]*m/g, ""); // strip ANSI colour codes
  const m = out.match(/Pass rate\s*:\s*(\d+)%/);
  check("content validator passes at 100%", m && m[1] === "100", m ? m[1] + "%" : "no rate found");
  const f = out.match(/Failed\s*:\s*(\d+)/);
  check("zero content failures", f && f[1] === "0", f ? f[1] + " failed" : "?");
} catch (e) {
  bad("content validator runs", (e.stdout || e.message || "").slice(-200));
}

// ── 2. Structured data / SEO ─────────────────────────────────────────────────
group("SEO & structured data");
const html = read("index.html");
const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
check("has >= 4 JSON-LD blocks", ld.length >= 4, ld.length + " found");
let ldTypes = [];
let ldAllValid = true;
for (const m of ld) { try { ldTypes.push(JSON.parse(m[1])["@type"]); } catch (e) { ldAllValid = false; } }
check("all JSON-LD blocks parse", ldAllValid);
for (const t of ["EducationalOrganization", "FAQPage", "SoftwareApplication", "BreadcrumbList"])
  check("JSON-LD includes " + t, ldTypes.includes(t));
check("sitemap.xml exists", exists("sitemap.xml"));
check("robots.txt exists & references sitemap", exists("robots.txt") && /Sitemap:/i.test(read("robots.txt")));
check("hreflang en-IN present", /hreflang="en-IN"/.test(html));
check("robots meta allows max-snippet", /max-snippet:-1/.test(html));
check("canonical present", /rel="canonical"/.test(html));
// FAQ schema count matches visible FAQ count in home.jsx
const faqSchema = (read("index.html").match(/"@type":"Question"/g) || []).length;
const faqVisible = (read("screens/home.jsx").match(/\{ q:/g) || []).length;
check("FAQ schema count == visible FAQ count", faqSchema === faqVisible, `schema ${faqSchema} vs visible ${faqVisible}`);

// ── 2b. Programmatic SEO landing pages ───────────────────────────────────────
group("Programmatic SEO pages");
check("generator script exists", exists("scripts/generate-seo-pages.mjs"));
const seoSamples = [
  "mock-test/ielts/index.html", "practice/gmat/index.html",
  "eligibility/ielts-canada/index.html", "tools/english-test-score-converter/index.html",
];
check("sample SEO pages generated", seoSamples.every(exists), seoSamples.filter(p => !exists(p)).join(", ") || "all present");
if (exists("mock-test/ielts/index.html")) {
  const pg = read("mock-test/ielts/index.html");
  check("SEO page has canonical", /rel="canonical" href="https:\/\/landingprep\.com\/mock-test\/ielts\//.test(pg));
  check("SEO page has JSON-LD (Course/FAQ/Breadcrumb)", (pg.match(/application\/ld\+json/g) || []).length >= 3);
  check("SEO page has CTA into app", /href="\/#\/exam-prep/.test(pg));
  check("SEO page has unique <title>", /<title>Free IELTS Mock Test 2026/.test(pg));
}
const sm = exists("sitemap.xml") ? read("sitemap.xml") : "";
check("sitemap lists 100+ urls", (sm.match(/<loc>/g) || []).length >= 100, (sm.match(/<loc>/g) || []).length + " urls");
check("per-university SEO pages generated", exists("university/mit/index.html") && exists("university/harvard/index.html"));
if (exists("university/mit/index.html")) {
  const up = read("university/mit/index.html");
  check("university page has CollegeOrUniversity schema", /"@type":"CollegeOrUniversity"/.test(up));
  check("university page has requirements table", /Acceptance rate/.test(up) && /Post-study work/.test(up));
}

// ── 3. Security ──────────────────────────────────────────────────────────────
group("Security");
let key = "";
try { const m = read(".env").match(/GEMINI_API_KEY\s*=\s*(.+)/); key = m ? m[1].trim() : ""; } catch (e) {}
let leak = 0;
if (key) {
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (["node_modules", ".git"].includes(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(json|jsx|js|html|mjs|cjs|css)$/.test(e.name) && fs.readFileSync(p, "utf8").includes(key)) leak++;
    }
  })(ROOT);
}
check("Gemini key not leaked into any frontend/content file", leak === 0, leak + " leaks");
check("server.js reads key from process.env only", /process\.env\.GEMINI_API_KEY/.test(read("server.js")));

// ── 4. Cache-version consistency ─────────────────────────────────────────────
group("Cache versioning");
const versions = [...html.matchAll(/\?v=(\d+)/g)].map(m => m[1]);
const uniq = [...new Set(versions)];
check("all ?v= cache tags share one version", uniq.length === 1, "versions: " + uniq.join(","));

// ── 5. Data & wiring integrity ───────────────────────────────────────────────
group("Data & wiring");
const data = read("data.jsx");
const examIds = [...data.matchAll(/"?id"?: *"(ielts|toefl|pte|celpip|duolingo|gre|gmat)"/g)].map(m => m[1]);
check("7 exams defined", new Set(examIds).size === 7, examIds.join(","));
const articleIds = [...read("seo-pages.jsx").matchAll(/id: "([a-z0-9-]+)"/g)].map(m => m[1]);
check("blog article ids unique", new Set(articleIds).size === articleIds.length, articleIds.length + " ids");
check("blog has >= 5 articles", articleIds.length >= 5, articleIds.length + " articles");
// renderer wiring: every window.LP_* referenced in app.jsx is defined somewhere
const appRefs = [...read("app.jsx").matchAll(/window\.LP_([A-Za-z_]+)/g)].map(m => m[1]);
const allSrc = [
  "index.html", // index.html defines app-level globals too (e.g. window.LP_loadScript, window.LP_API_BASE)
  ...fs.readdirSync(ROOT).filter(f => f.endsWith(".jsx")),
  ...fs.readdirSync(path.join(ROOT, "screens")).filter(f => f.endsWith(".jsx")).map(f => "screens/" + f),
].map(read).join("\n");
const undefinedRefs = [...new Set(appRefs)].filter(r => !new RegExp("window\\.LP_" + r + "\\s*=").test(allSrc));
check("all LP_* components referenced in app.jsx are defined", undefinedRefs.length === 0, "missing: " + undefinedRefs.join(","));
// pte_sw renderer + normaliser + dispatch all present
check("PTE SW renderer registered", /window\.LP_PTE_SW\s*=/.test(read("screens/pte-sw-renderer.jsx")));
check("PTE SW normaliser routes correctly", /normalisePteSpeakingWriting/.test(read("normalize-test.jsx")));
check("PTE SW dispatched in mock-test", /sec\.type === "pte_sw"/.test(read("screens/mock-test.jsx")));
check("pte-sw-renderer loaded in index.html", /pte-sw-renderer\.jsx?/.test(html));
// visual renderer wired for the 4 visual paths
check("VisualRenderer consumed by QuestionCard (GMAT DI)", /q\.visual && window\.LP_VisualRenderer/.test(read("screens/mock-test.jsx")));
check("Blog in nav", /\["blog", "Blog"\]/.test(read("screens/home.jsx")));

// ── 6. Routing & navigation completeness ─────────────────────────────────────
group("Routing & navigation");
const appSrc = read("app.jsx");
const homeSrc = read("screens/home.jsx");
const navItems = [...homeSrc.matchAll(/\["([a-z-]+)", "[^"]+"\]/g)].map(m => m[1]);
check("nav has >= 7 items", navItems.length >= 7, navItems.length + ": " + navItems.join(","));
for (const v of ["exam-prep", "exams", "learning", "agents", "colleges", "tools", "blog", "progress", "login"])
  check(`route "${v}" wired in app.jsx`, new RegExp('=== "' + v + '"|head === "' + v + '"|id === "' + v + '"').test(appSrc));
check("colleges view renders LP_Colleges", /view === "colleges"/.test(appSrc) && /window\.LP_Colleges/.test(appSrc));
check("planner deep-link folds into tools", /head === "planner"/.test(appSrc) && /id === "planner"/.test(appSrc));
check("every screen jsx is wired (eager tag or lazy-loaded)", (() => {
  const screens = fs.readdirSync(path.join(ROOT, "screens")).filter(f => f.endsWith(".jsx"));
  // A screen counts as wired if it has an eager <script> in index.html OR is lazy-loaded on
  // demand — referenced via LP_loadScript / LazyScreen scripts=[...] anywhere in the source
  // (allSrc = index.html + all jsx). This lets us defer heavy screens off the initial load.
  const miss = screens.filter(f => {
    const js = "screens/" + f.replace(/\.jsx$/, ".js");
    return !html.includes("screens/" + f) && !html.includes(js) && !allSrc.includes(js);
  });
  return miss.length === 0 || miss.join(",");
})() === true, "some screens neither in index.html nor lazy-loaded");

// ── 7. Colleges & Tools panels ───────────────────────────────────────────────
group("Colleges & Tools panels");
const panelGlobals = ["LP_CollegePredictorPanel", "LP_DestinationsPanel", "LP_RankingsPanel", "LP_ScholarshipPanel", "LP_LoanPanel", "LP_SOPPanel", "LP_ApplicationsPanel", "LP_CalculatorsPanel", "LP_StudyPlannerPanel", "LP_ErrorLogPanel", "LP_Colleges", "LP_Tools"];
for (const g of panelGlobals) check(`${g} defined`, new RegExp("window\\." + g + "\\s*=").test(allSrc), "missing");
check("colleges page has 8 tabs", (read("screens/colleges.jsx").match(/\["[a-z]+", "[^"]+"\]/g) || []).length >= 8);

// ── 8. Study-abroad data integrity ───────────────────────────────────────────
group("Study-abroad data");
function loadData(file) { const w = {}; try { new Function("window", read(file))(w); } catch (e) {} return w; }
const cd = loadData("college-data.jsx");
const colleges = cd.LP_COLLEGES || [];
check("95+ universities", colleges.length >= 95, colleges.length + "");
check("university ids unique", new Set(colleges.map(c => c.id)).size === colleges.length);
check("every university has core fields", colleges.every(c => c.name && c.country && c.rank && c.ielts && c.feeNote && Array.isArray(c.programs) && c.programs.length), "missing fields");
check("country admission info for 9 countries", Object.keys(cd.LP_COLLEGE_COUNTRY_INFO || {}).length >= 9);
const ctd = loadData("country-data.jsx");
const countries = ctd.LP_COUNTRY_DATA || [];
check("9 destination countries", countries.length >= 9, countries.length + "");
check("every country has visa%/immigration/changes", countries.every(c => typeof c.visaSuccess === "number" && c.immigration && Array.isArray(c.changes) && c.changes.length), "missing");
check("10 loan lenders", (ctd.LP_LOAN_BANKS || []).length >= 10);
const scd = loadData("scholarship-data.jsx");
const schol = scd.LP_SCHOLARSHIPS || [];
check("25+ scholarships", schol.length >= 25, schol.length + "");
check("scholarship ids unique", new Set(schol.map(s => s.id)).size === schol.length);
check("5+ immigration blog articles", (loadData("blog-data.jsx").LP_BLOG_EXTRA || []).length >= 5);

// ── 9. SEO completeness across ALL generated pages ───────────────────────────
group("SEO completeness");
function allSeoDirs() {
  const dirs = [];
  for (const top of ["mock-test", "practice", "eligibility", "tools", "study-abroad", "scholarships", "scholarship", "university", "blog"]) {
    const d = path.join(ROOT, top);
    if (fs.existsSync(d)) for (const sub of fs.readdirSync(d)) { if (fs.existsSync(path.join(d, sub, "index.html"))) dirs.push(top + "/" + sub); }
  }
  return dirs;
}
const seoDirs = allSeoDirs();
check("150+ static SEO pages generated", seoDirs.length >= 150, seoDirs.length + " pages");
const seoBad = seoDirs.filter(d => { const pg = read(d + "/index.html"); return !(/<title>[^<]+<\/title>/.test(pg) && /name="description"/.test(pg) && /rel="canonical"/.test(pg) && /application\/ld\+json/.test(pg) && /property="og:title"/.test(pg)); });
check("every SEO page has title+desc+canonical+JSON-LD+OG", seoBad.length === 0, seoBad.slice(0, 4).join(", "));
const sitemapUrls = [...read("sitemap.xml").matchAll(/<loc>https:\/\/landingprep\.com\/([^<]*)<\/loc>/g)].map(m => m[1]).filter(Boolean);
const missingPages = sitemapUrls.filter(u => !fs.existsSync(path.join(ROOT, u, "index.html")));
check("every sitemap url has a generated page", missingPages.length === 0, "missing: " + missingPages.slice(0, 3).join(", "));
const kwMatch = html.match(/<meta name="keywords" content="([^"]+)"/);
check("aggressive keywords (45+ terms)", kwMatch && kwMatch[1].split(",").length >= 45, kwMatch ? kwMatch[1].split(",").length + " terms" : "no keywords");

// ── 10. Assets: images, audio, PWA ───────────────────────────────────────────
group("Assets & media");
check("icon.svg exists", exists("icon.svg"));
check("manifest.json valid JSON", exists("manifest.json") && (() => { try { JSON.parse(read("manifest.json")); return true; } catch (e) { return false; } })());
check("service worker exists & versioned", exists("sw.js") && /CACHE_VERSION\s*=\s*"lp-v\d+"/.test(read("sw.js")));
check("visual renderer (charts/images) present", exists("visual-renderer.jsx") && /window\.LP_VisualRenderer/.test(read("visual-renderer.jsx")));
check("TTS audio engine present & loaded", exists("gemini-tts.jsx") && /window\.LP_TTS/.test(read("gemini-tts.jsx")) && /gemini-tts\.jsx?/.test(html));
check("IELTS listening map scenes present", /SCENES|pickScene/.test(read("screens/mock-test.jsx")));
check("og:image referenced", /og:image/.test(html));

// ── 11. Universality (works for all countries) ───────────────────────────────
group("Universality");
check("no NCERT (India-only) reference", !/NCERT/i.test(html) && !/NCERT/i.test(homeSrc));
check("description is not India-first", !/students in India,/.test(html));
check("multi-locale hreflang (US/GB/CA/AU)", ["en-US", "en-GB", "en-CA", "en-AU"].every(l => new RegExp('hreflang="' + l + '"').test(html)));
check("destinations span 9 countries", countries.length >= 9);
check("colleges span 8+ countries", new Set(colleges.map(c => c.country)).size >= 8, new Set(colleges.map(c => c.country)).size + " countries");

// ── 12. Interactivity (buttons & handlers) ───────────────────────────────────
group("Interactivity");
for (const f of ["screens/colleges.jsx", "screens/destinations.jsx", "screens/tools.jsx", "screens/college-tools.jsx", "screens/sop-tool.jsx", "screens/calculators.jsx", "screens/scholarship-tool.jsx", "screens/error-log.jsx"])
  check(`${f} has interactive handlers`, (read(f).match(/onClick|onChange|onSubmit/g) || []).length > 0);
check("homepage hero CTA → colleges", /onNav\("colleges"\)/.test(homeSrc));
check("homepage study-abroad band", /sa-band/.test(homeSrc));
check("weakest-skill drill button wired", /weak-drill-btn/.test(read("screens/progress.jsx")));
check("explain-with-AI button on review", /explain-ai-btn/.test(read("screens/mock-test.jsx")));

// ── Summary ──────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(52));
console.log(`  ${pass} passed, ${fail} failed`);
if (fail) { console.log("\nFailures:\n  - " + fails.join("\n  - ")); process.exit(1); }
console.log("  \x1b[32mALL GREEN\x1b[0m");
