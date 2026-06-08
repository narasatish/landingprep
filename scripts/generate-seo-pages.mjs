#!/usr/bin/env node
// LandingPrep — programmatic SEO generator.
// Emits standalone prerendered static landing pages at REAL clean /paths
// (folder/index.html), each with full meta + canonical + JSON-LD + unique
// content + a CTA that links into the existing hash-routed SPA. Purely
// additive: does NOT touch the SPA, hash routing, or add any runtime build.
//
//   node scripts/generate-seo-pages.mjs
//
// Output: top-level folders (mock-test/, practice/, eligibility/, tools/) +
// sitemap.xml + robots.txt at repo root.

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://landingprep.com";
const BRAND = "LandingPrep";
const TODAY = "2026-05-30";

// Topic-cluster hubs — every prerendered page is linked from one of these, and these
// are linked from every page's footer (shell). Kills crawl-orphans + builds topical
// authority. Built at the end from already-emitted PAGES (see buildHubs).
const HUB_LINKS = [
  { label: "IELTS scores for universities", href: "/ielts-scores-for-universities/" },
  { label: "TOEFL scores for universities", href: "/toefl-scores-for-universities/" },
  { label: "PTE scores for universities", href: "/pte-scores-for-universities/" },
  { label: "Compare universities", href: "/compare-universities/" },
  { label: "Study abroad by course", href: "/study-abroad-courses/" },
  { label: "Scholarships", href: "/scholarships/" },
  { label: "IELTS band guides", href: "/ielts-band-guides/" },
  { label: "English test comparisons", href: "/english-test-comparisons/" },
  { label: "Test requirements by country", href: "/exam-requirements-by-country/" },
  { label: "How LandingPrep works", href: "/how-it-works/" },
  { label: "Free alternatives", href: "/free-alternatives/" },
  { label: "Blog", href: "/blog/" },
  { label: "Explore all pages", href: "/explore/" },
];

// Load the SAME college dataset the app uses (single source of truth) so a
// per-university SEO page is generated for every college automatically.
const _cw = {};
try { new Function("window", readFileSync(join(ROOT, "college-data.jsx"), "utf8"))(_cw); } catch (e) { console.warn("college-data load failed:", e.message); }
const COLLEGES = _cw.LP_COLLEGES || [];
const C_INFO = _cw.LP_COLLEGE_COUNTRY_INFO || {};
const C_PROC = _cw.LP_COLLEGE_PROCESS || {};
try { new Function("window", readFileSync(join(ROOT, "country-data.jsx"), "utf8"))(_cw); } catch (e) { console.warn("country-data load failed:", e.message); }
const COUNTRY_DATA = _cw.LP_COUNTRY_DATA || [];
try { new Function("window", readFileSync(join(ROOT, "scholarship-data.jsx"), "utf8"))(_cw); } catch (e) { console.warn("scholarship-data load failed:", e.message); }
const SCHOLARSHIP_DATA = _cw.LP_SCHOLARSHIPS || [];
try { new Function("window", readFileSync(join(ROOT, "blog-data.jsx"), "utf8"))(_cw); } catch (e) { console.warn("blog-data load failed:", e.message); }
const BLOG_EXTRA = _cw.LP_BLOG_EXTRA || [];

// ── Exam data (mirrors data.jsx; kept inline so the generator has no deps) ──
const EXAMS = {
  ielts:    { name: "IELTS",                 short: "IELTS", score: "Band 0–9",  scale: "band", appPath: "ielts",
              for: "study, work & migration", accepted: "11,000+ organisations in 140+ countries",
              sections: "Listening, Reading, Writing, Speaking" },
  toefl:    { name: "TOEFL iBT",             short: "TOEFL", score: "0–120",     scale: "points", appPath: "toefl",
              for: "university admissions worldwide", accepted: "12,000+ universities in 160+ countries",
              sections: "Reading, Listening, Speaking, Writing" },
  pte:      { name: "PTE Academic",          short: "PTE",   score: "10–90",     scale: "points", appPath: "pte",
              for: "study & visas (AI-scored, results in 48h)", accepted: "3,000+ universities & visa authorities",
              sections: "Speaking & Writing, Reading, Listening" },
  celpip:   { name: "CELPIP",                short: "CELPIP",score: "1–12",      scale: "level", appPath: "celpip",
              for: "Canada PR & citizenship", accepted: "IRCC for Canadian immigration",
              sections: "Listening, Reading, Writing, Speaking" },
  duolingo: { name: "Duolingo English Test", short: "DET",   score: "10–160",    scale: "points", appPath: "duolingo",
              for: "fast at-home admissions", accepted: "5,500+ universities incl. Yale, NYU, MIT",
              sections: "Adaptive + Writing & Speaking" },
  gre:      { name: "GRE General Test",      short: "GRE",   score: "260–340",   scale: "points", appPath: "gre",
              for: "graduate (MS/PhD) admissions", accepted: "1,300+ graduate & business schools",
              sections: "Verbal, Quantitative, Analytical Writing" },
  gmat:     { name: "GMAT Focus",            short: "GMAT",  score: "205–805",   scale: "points", appPath: "gmat",
              for: "MBA & business school", accepted: "2,400+ business schools / 7,700+ programmes",
              sections: "Quant, Verbal, Data Insights" },
};

// ── Country eligibility data (typical minimums; advisory, verify official) ──
const ELIGIBILITY = {
  "ielts-canada":      { exam: "ielts", country: "Canada", flag: "🇨🇦",
    min: "CLB 7 = Band 6.0 in each skill (Express Entry); universities typically 6.5 overall",
    note: "For Canadian permanent residence, IELTS General Training is mapped to Canadian Language Benchmarks (CLB). CLB 9 (L8.0/R7.0/W7.0/S7.0) earns maximum points." },
  "ielts-australia":   { exam: "ielts", country: "Australia", flag: "🇦🇺",
    min: "Competent 6.0 each · Proficient 7.0 each · Superior 8.0 each; universities ~6.5 overall",
    note: "Australian skilled migration awards points by IELTS band: 'Proficient' (7) and 'Superior' (8) give the most points." },
  "ielts-uk":          { exam: "ielts", country: "UK", flag: "🇬🇧",
    min: "IELTS UKVI 5.5 each (degree study, CEFR B2); universities usually 6.5 overall",
    note: "UK student visas require IELTS for UKVI (SELT) at an approved centre. Degree-level study needs CEFR B2." },
  "ielts-usa":         { exam: "ielts", country: "USA", flag: "🇺🇸",
    min: "6.5–7.0 overall for most universities; top programmes 7.0–7.5",
    note: "US universities set their own IELTS minimums — undergraduate often 6.5, graduate 7.0." },
  "ielts-new-zealand": { exam: "ielts", country: "New Zealand", flag: "🇳🇿",
    min: "Skilled Migrant 6.5 overall; student visas vary by level",
    note: "New Zealand residence under the Skilled Migrant Category typically requires IELTS 6.5 overall (or equivalent)." },
  "pte-australia":     { exam: "pte", country: "Australia", flag: "🇦🇺",
    min: "Competent 50 · Proficient 65 · Superior 79; universities ~58–65",
    note: "PTE Academic is fully accepted for Australian student and skilled-migration visas." },
  "pte-canada":        { exam: "pte", country: "Canada", flag: "🇨🇦",
    min: "Accepted for Express Entry since 2023; CLB 9 ≈ PTE 60 across skills",
    note: "PTE Core is approved by IRCC for economic immigration to Canada." },
  "pte-uk":            { exam: "pte", country: "UK", flag: "🇬🇧",
    min: "UKVI B2 ≈ PTE 59; universities ~58–65",
    note: "PTE Academic UKVI is a UK Home Office approved Secure English Language Test." },
  "toefl-usa":         { exam: "toefl", country: "USA", flag: "🇺🇸",
    min: "80–100 typical; Ivy League / top programmes 100+",
    note: "TOEFL iBT is the most widely accepted test by US universities." },
  "toefl-canada":      { exam: "toefl", country: "Canada", flag: "🇨🇦",
    min: "86–90 for most universities",
    note: "Canadian universities commonly require TOEFL iBT 86–90 with no section below 20–22." },
  "toefl-germany":     { exam: "toefl", country: "Germany", flag: "🇩🇪",
    min: "80–95 for English-taught Master's programmes",
    note: "German universities accept TOEFL iBT for English-medium programmes, usually 80–95." },
  "celpip-canada":     { exam: "celpip", country: "Canada", flag: "🇨🇦",
    min: "PR Express Entry CLB 9 = CELPIP 9 each; citizenship CLB 4 (Speaking & Listening)",
    note: "CELPIP-General is designated by IRCC for permanent residence; CELPIP-General LS for citizenship." },
  "duolingo-usa":      { exam: "duolingo", country: "USA", flag: "🇺🇸",
    min: "105–120 typical; top universities 120+",
    note: "The Duolingo English Test is accepted by thousands of US universities for admission." },
  "duolingo-canada":   { exam: "duolingo", country: "Canada", flag: "🇨🇦",
    min: "110–120 for most universities",
    note: "Canadian universities increasingly accept the Duolingo English Test (typically 110–120)." },
  "gre-usa":           { exam: "gre", country: "USA", flag: "🇺🇸",
    min: "Competitive 155+ Verbal & Quant; top STEM 165+ Quant",
    note: "GRE requirements are programme-specific — engineering values high Quant, humanities high Verbal." },
  "gre-canada":        { exam: "gre", country: "Canada", flag: "🇨🇦",
    min: "300+ combined competitive; varies widely by programme",
    note: "Many Canadian graduate programmes ask for GRE; strong applicants score 310+." },
  "gre-germany":       { exam: "gre", country: "Germany", flag: "🇩🇪",
    min: "155+ Quant for many English-taught MS programmes",
    note: "Several German MS programmes (esp. data/engineering) request or recommend the GRE." },
  "gmat-usa":          { exam: "gmat", country: "USA", flag: "🇺🇸",
    min: "Top MBA average ~645–655 (Focus); M7 schools 685+",
    note: "On the GMAT Focus 205–805 scale, leading US MBA programmes average in the mid-600s." },
  "gmat-india":        { exam: "gmat", country: "India", flag: "🇮🇳",
    min: "ISB & top IIM ~685+ (Focus, ≈700+ old scale)",
    note: "Indian business schools like ISB look for competitive GMAT Focus scores around 685 and above." },
  "gmat-uk":           { exam: "gmat", country: "UK", flag: "🇬🇧",
    min: "LBS / Oxford / Cambridge ~685+ (Focus)",
    note: "Top UK MBA programmes are competitive, with successful applicants typically 685+ on GMAT Focus." },
};

// ── Free tools (standalone SEO + link to in-app tools) ──────────────────────
const TOOLS = {
  "ielts-band-score-calculator": { title: "IELTS Band Score Calculator", exam: "ielts",
    kw: "ielts band score calculator free, ielts score calculator online, calculate ielts band from raw score, ielts overall band score calculator, what is my ielts band",
    lead: "Convert your raw IELTS Listening and Reading answers into the official 0–9 band score and get your overall band in seconds." },
  "english-test-score-converter": { title: "English Test Score Converter (IELTS ↔ TOEFL ↔ PTE ↔ CEFR)", exam: "ielts",
    kw: "ielts to toefl converter, toefl to ielts score conversion, pte to ielts equivalency, ielts to pte converter free, cefr level calculator, english test score equivalency",
    lead: "Instantly convert between IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo and CEFR levels with one free tool." },
  "university-eligibility-checker": { title: "Study Abroad Eligibility Checker", exam: "ielts",
    kw: "study abroad eligibility checker, am i eligible to study abroad free, university english requirement checker, visa requirements by country, study abroad requirements by exam score",
    lead: "Enter your English-test score and target country to see whether you meet typical university and visa requirements." },
  "reading-speed-test": { title: "Reading Speed Test (Words Per Minute)", exam: "ielts",
    kw: "reading speed test online free, words per minute test, improve reading speed ielts, wpm reading practice, ielts reading speed time management",
    lead: "Measure your reading speed in words per minute and build the pace you need to finish IELTS, TOEFL and GRE reading on time." },
};

// ── HTML helpers ────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const jsonld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

// SEO hygiene: keep <title> ≤ ~60 chars (preserving the "| Brand" suffix) and the meta
// description ≤ ~158 chars, trimmed on a word boundary so Google doesn't cut them mid-word.
function trimTitle(t) {
  if (!t || t.length <= 60) return t;
  const i = t.lastIndexOf(" | ");
  if (i > 12) {
    const brand = t.slice(i);
    let base = t.slice(0, i).replace(/\s*\(2026\)\s*$/, "");
    const room = 60 - brand.length;
    if (base.length > room) { const cut = base.slice(0, room); const sp = cut.lastIndexOf(" "); base = (sp > 20 ? cut.slice(0, sp) : cut).replace(/[\s,–-]+$/, ""); }
    return base + brand;
  }
  const cut = t.slice(0, 60); const sp = cut.lastIndexOf(" "); return (sp > 20 ? cut.slice(0, sp) : cut).replace(/[\s,–-]+$/, "");
}
function trimDesc(d) {
  if (!d || d.length <= 160) return d;
  const cut = d.slice(0, 157); const sp = cut.lastIndexOf(" ");
  return (sp > 120 ? cut.slice(0, sp) : cut).replace(/[\s,;:–-]+$/, "") + "…";
}
function head({ title, desc, path, kw, jsonLdBlocks }) {
  const url = ORIGIN + path;
  title = trimTitle(title);
  desc = trimDesc(desc);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<meta name="keywords" content="${esc(kw)}"/>
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"/>
<link rel="canonical" href="${url}"/>
<link rel="alternate" type="application/rss+xml" title="LandingPrep Blog" href="${ORIGIN}/feed.xml"/>
<link rel="alternate" hreflang="en-IN" href="${url}"/>
<link rel="alternate" hreflang="en" href="${url}"/>
<link rel="alternate" hreflang="x-default" href="${url}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${BRAND}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:image" content="${ORIGIN}/og-image.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(title)}"/>
<meta name="twitter:description" content="${esc(desc)}"/>
<meta name="theme-color" content="#4F46E5"/>
<link rel="icon" href="/icon.svg" type="image/svg+xml"/>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XZ60SKWWKH"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XZ60SKWWKH');</script>
${jsonLdBlocks.join("\n")}
<style>
:root{--brand:#4F46E5;--ink:#0f172a;--muted:#64748b;--bg:#f8fafc;--card:#fff;--line:#e2e8f0}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:var(--bg);line-height:1.6}
a{color:var(--brand);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:880px;margin:0 auto;padding:0 20px}
header.nav{background:#fff;border-bottom:1px solid var(--line)}
header.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.logo{font-weight:800;font-size:20px;color:var(--brand)}
.cta{display:inline-block;background:var(--brand);color:#fff!important;padding:12px 22px;border-radius:10px;font-weight:700;text-decoration:none}
.cta:hover{filter:brightness(1.07);text-decoration:none}
.hero{padding:54px 0 28px}.hero h1{font-size:clamp(28px,4vw,40px);line-height:1.15;margin:0 0 14px}
.lead{font-size:18px;color:var(--muted);margin:0 0 22px}
.badges{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}
.badge{background:#eef2ff;color:var(--brand);font-weight:600;font-size:13px;padding:6px 12px;border-radius:999px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:22px 24px;margin:16px 0}
h2{font-size:24px;margin:30px 0 12px}h3{margin:18px 0 6px}
ul{padding-left:20px}li{margin:6px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:14px 0}
.tile{display:block;background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 16px;font-weight:600}
.tile:hover{border-color:var(--brand);text-decoration:none}
.related-articles{margin:28px 0 8px}.related-articles h2{font-size:20px;margin:0 0 12px}
.rel-list{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:8px}
.rel-list li{margin:0}.rel-list li a{display:block;padding:11px 15px;background:#fff;border:1px solid var(--line);border-radius:10px;font-size:14px;font-weight:600;color:var(--brand);line-height:1.4}
.rel-list li a:hover{border-color:var(--brand);text-decoration:none}
.faq dt{font-weight:700;margin-top:16px}.faq dd{margin:4px 0 0;color:#334155}
footer{border-top:1px solid var(--line);background:#fff;margin-top:40px;padding:26px 0;color:var(--muted);font-size:14px}
.hubnav{margin:0 0 14px;line-height:1.9;font-size:13px}.hubnav a{color:var(--brand);font-weight:600}
.crumb{font-size:13px;color:var(--muted);margin:14px 0}
.note{font-size:14px;color:var(--muted);font-style:italic}
.backlink{display:inline-flex;align-items:center;gap:6px;margin:18px 0 0;padding:7px 15px 7px 12px;border-radius:999px;background:#fff;border:1px solid var(--line);color:var(--ink);font-weight:600;font-size:14px}
.backlink:hover{background:var(--brand);color:#fff;border-color:var(--brand);text-decoration:none}
.backlink span{font-size:16px;line-height:1}
.uni-banner{display:flex;align-items:center;gap:20px;margin:14px 0 0;padding:26px 24px;border-radius:18px;color:#fff}
.uni-logo{flex:0 0 auto;width:78px;height:78px;border-radius:16px;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:26px;font-weight:800;letter-spacing:.02em;border:1px solid rgba(255,255,255,.25)}
.uni-banner-info h1{margin:6px 0 6px;font-size:clamp(24px,3.5vw,34px);color:#fff;line-height:1.1}
.uni-flag{font-size:13px;font-weight:700;opacity:.92;text-transform:uppercase;letter-spacing:.04em}
.uni-addr{font-size:14px;opacity:.95}.uni-addr a{color:#fff;text-decoration:underline}
@media(max-width:560px){.uni-banner{flex-direction:column;text-align:center;align-items:center}}
.cmp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:15px}
.cmp-table th,.cmp-table td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}
.cmp-table thead th{background:#eef2ff;color:var(--brand);font-weight:700}
.cmp-table td:first-child{background:#f8fafc;width:120px}
</style>
</head>`;
}

function shell(inner) {
  return `<body>
<header class="nav"><div class="wrap"><a class="logo" href="/">▲ ${BRAND}</a><a class="cta" href="/#/exam-prep">Start free practice →</a></div></header>
<main class="wrap">
<a class="backlink" href="/" data-back><span aria-hidden>←</span> Back</a>
${inner}
</main>
<footer><div class="wrap">
<nav class="hubnav">${HUB_LINKS.map((h) => `<a href="${h.href}">${h.label}</a>`).join(" · ")}</nav>
© 2026 ${BRAND} — 100% free IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE &amp; GMAT practice for students worldwide. <a href="/">Home</a> · <a href="/#/exam-prep">All exams</a> · <a href="/#/colleges">Study abroad</a> · <a href="/about/">About</a> · <a href="mailto:support@landingprep.com">support@landingprep.com</a></div></footer>
<script>document.addEventListener('click',function(e){var a=e.target.closest('[data-back]');if(!a)return;if(history.length>1){e.preventDefault();history.back();}});</script>
</body></html>`;
}

function breadcrumbJsonLd(items) {
  return jsonld({ "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: ORIGIN + it.path })) });
}
function faqJsonLd(faqs) {
  return jsonld({ "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
}
function courseJsonLd(exam, name, desc) {
  return jsonld({ "@context": "https://schema.org", "@type": "Course", name, description: desc,
    provider: { "@type": "EducationalOrganization", name: BRAND, url: ORIGIN },
    isAccessibleForFree: true, inLanguage: "en",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" } });
}

function faqBlock(faqs) {
  return `<div class="card faq"><h2>Frequently asked questions</h2><dl>${faqs.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join("")}</dl></div>`;
}
function relatedGrid(links) {
  return `<h2>Keep going — free practice</h2><div class="grid">${links.map((l) => `<a class="tile" href="${l.href}">${esc(l.label)}</a>`).join("")}</div>`;
}

// Topic-cluster internal linking: the 6 most topically-related OTHER blog posts,
// scored by shared tag + keyword + title-word overlap. Builds real topic clusters
// (distributes link equity, deepens crawl) while staying visually clean.
const EXAM_MOCK = { IELTS: "ielts", TOEFL: "toefl", PTE: "pte", GRE: "gre", GMAT: "gmat", CELPIP: "celpip", Duolingo: "duolingo" };
function relatedArticles(a) {
  const aKw = new Set(String(a.kw || "").toLowerCase().split(/,\s*/).filter(Boolean));
  const aTitleWords = new Set(a.title.toLowerCase().split(/\W+/).filter((w) => w.length > 4));
  const score = (p) => {
    let s = p.tag === a.tag ? 10 : 0;
    for (const k of String(p.kw || "").toLowerCase().split(/,\s*/)) if (k && aKw.has(k)) s += 3;
    for (const w of p.title.toLowerCase().split(/\W+/)) if (w.length > 4 && aTitleWords.has(w)) s += 1;
    return s;
  };
  const ranked = BLOG_EXTRA.filter((p) => p.id !== a.id)
    .map((p) => ({ p, s: score(p) }))
    .sort((x, y) => y.s - x.s)
    .slice(0, 6)
    .map((x) => x.p);
  if (!ranked.length) return "";
  return `<section class="related-articles"><h2>Related articles</h2><ul class="rel-list">${
    ranked.map((p) => `<li><a href="/blog/${p.id}/">${esc(p.title)}</a></li>`).join("")
  }</ul></section>`;
}

// Tag-aware "Keep going" tiles — link an exam post to THAT exam's free mock + practice
// (was hardcoded to IELTS on every post); study-abroad posts link to the right tools.
function blogTiles(a) {
  const exam = EXAM_MOCK[a.tag];
  if (exam) {
    return [
      { label: `Free ${a.tag} mock test`, href: `/mock-test/${exam}/` },
      { label: `${a.tag} practice questions`, href: `/practice/${exam}/` },
      { label: `🎓 Free college predictor`, href: `/#/colleges` },
      { label: `All blog articles`, href: `/#/blog` },
    ];
  }
  return [
    { label: `🌍 Study-abroad destinations`, href: `/#/colleges` },
    { label: `💸 Scholarships (free finder)`, href: `/#/colleges` },
    { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
    { label: `All blog articles`, href: `/#/blog` },
  ];
}

const PAGES = []; // { path, html }
function emit(path, html) { PAGES.push({ path, html }); }

// ── Page builders ───────────────────────────────────────────────────────────
function mockPage(id) {
  const e = EXAMS[id];
  const path = `/mock-test/${id}/`;
  const title = `Free ${e.name} Mock Test 2026 — Full-Length Practice Online | ${BRAND}`;
  const desc = `Take a free full-length ${e.name} mock test online with real exam timing, ${e.sections} sections and instant scoring. No signup, no payment — built for students in India and worldwide.`;
  const kw = `free ${e.short.toLowerCase()} mock test 2026, ${e.short.toLowerCase()} mock test online no signup, free ${e.short.toLowerCase()} practice test for indian students, ${e.name} mock test with answers, ${e.short.toLowerCase()} sample test free, ${e.short.toLowerCase()} full test india`;
  const faqs = [
    { q: `Is this ${e.name} mock test really free?`, a: `Yes. Every ${e.name} mock test on ${BRAND} is 100% free with no signup, no credit card and no hidden paywall.` },
    { q: `Does the mock test match the real ${e.name}?`, a: `It mirrors the official ${e.name} format, timing and question types across ${e.sections}, scored on the ${e.score} scale.` },
    { q: `How is my ${e.short} score calculated?`, a: `Objective sections are auto-scored instantly; writing and speaking get AI rubric feedback so you see a realistic ${e.score} estimate.` },
    { q: `Can I practise ${e.short} on mobile?`, a: `Yes — ${BRAND} works in any browser on phone, tablet or laptop and even installs as an app for offline study.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/exam-prep">Mock Tests</a> › ${e.name} mock test</p>
<section class="hero">
  <div class="badges"><span class="badge">100% Free</span><span class="badge">Real exam timing</span><span class="badge">Instant scoring</span><span class="badge">No signup</span></div>
  <h1>Free ${e.name} Mock Test 2026</h1>
  <p class="lead">Sit a full-length ${e.name} practice test online with authentic timing and ${e.sections}. Get an instant ${e.score} estimate plus AI feedback on writing and speaking — completely free.</p>
  <a class="cta" href="/#/exam-prep/${e.appPath}">▶ Start the ${e.short} mock test free</a>
</section>
<div class="card">
  <h2>Why practise ${e.short} with ${BRAND}?</h2>
  <ul>
    <li><strong>Real format:</strong> ${e.sections} — matched to the official ${e.name} blueprint.</li>
    <li><strong>Exam-accurate timing</strong> so you build the stamina the real test demands.</li>
    <li><strong>Instant results</strong> on the ${e.score} scale, with answer explanations.</li>
    <li><strong>AI writing &amp; speaking feedback</strong> with model answers and band-style scoring.</li>
    <li><strong>Accepted everywhere:</strong> ${e.name} is recognised by ${e.accepted}.</li>
  </ul>
</div>
<div class="card">
  <h2>What's inside the ${e.short} mock test</h2>
  <p>${e.name} is used for ${e.for}. Our free mock reproduces every section in order, with on-screen timers, a review screen showing the correct answers, and an AI tutor you can ask "why is this the answer?" on any question. Take it as many times as you like — new attempts, no limits, no cost.</p>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `${e.short} practice test (section by section)`, href: `/practice/${id}/` },
  { label: `${e.short} score calculator & converter`, href: `/tools/english-test-score-converter/` },
  { label: `${e.short} AI speaking & writing practice`, href: `/#/agents` },
  { label: `All free exams`, href: `/#/exam-prep` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    courseJsonLd(id, `${e.name} Mock Test`, desc),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Mock Tests", path: "/#/exam-prep" }, { name: `${e.name} Mock Test`, path }]),
  ] }) + shell(inner));
}

function practicePage(id) {
  const e = EXAMS[id];
  const path = `/practice/${id}/`;
  const title = `${e.name} Practice Test Online — Free Section Practice 2026 | ${BRAND}`;
  const desc = `Free ${e.name} practice tests online: drill each section (${e.sections}) with answers, explanations and AI feedback. No signup. Perfect for ${e.for}.`;
  const kw = `${e.short.toLowerCase()} practice test online free, ${e.short.toLowerCase()} section practice questions with answers, free ${e.short.toLowerCase()} preparation for indian students, ${e.name} sample questions, ${e.short.toLowerCase()} listening reading writing speaking practice`;
  const faqs = [
    { q: `How can I practise ${e.short} for free?`, a: `Open ${BRAND}, pick ${e.name}, and choose a full mock or a single section. Everything is free with instant feedback.` },
    { q: `Which ${e.short} sections can I practise?`, a: `All of them: ${e.sections}. Each section can be practised on its own or as part of a full test.` },
    { q: `Do I get answer explanations?`, a: `Yes — every objective question shows the correct answer, and you can ask the AI tutor to explain the reasoning.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/exam-prep">Mock Tests</a> › ${e.name} practice</p>
<section class="hero">
  <div class="badges"><span class="badge">Free forever</span><span class="badge">Section drills</span><span class="badge">Answer explanations</span></div>
  <h1>${e.name} Practice Test (Online &amp; Free)</h1>
  <p class="lead">Drill ${e.name} one section at a time or sit a full mock. Every question is scored on the ${e.score} scale with explanations and AI feedback — free, in your browser, no account needed.</p>
  <a class="cta" href="/#/exam-prep/${e.appPath}">▶ Practise ${e.short} free now</a>
</section>
<div class="card">
  <h2>Practise every ${e.short} section</h2>
  <p>${e.name} covers ${e.sections}. ${BRAND} lets you target your weakest skill with focused section practice, then prove it on a timed full-length mock. You get instant scoring, a review screen with correct answers, model answers for writing, and two-way AI speaking practice.</p>
  <ul>
    <li>Unlimited free attempts — fresh practice every time</li>
    <li>Realistic, exam-matched questions and timing</li>
    <li>AI tutor for instant doubt-solving on any question</li>
    <li>Progress tracking, streaks and a personalised study plan</li>
  </ul>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${e.short} full mock test`, href: `/mock-test/${id}/` },
  { label: `${e.short} eligibility by country`, href: `/eligibility/` },
  { label: `Free study tools`, href: `/tools/english-test-score-converter/` },
  { label: `All free exams`, href: `/#/exam-prep` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    courseJsonLd(id, `${e.name} Practice Test`, desc),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Mock Tests", path: "/#/exam-prep" }, { name: `${e.name} Practice`, path }]),
  ] }) + shell(inner));
}

function eligibilityPage(slug) {
  const d = ELIGIBILITY[slug];
  const e = EXAMS[d.exam];
  const path = `/eligibility/${slug}/`;
  const title = `${e.name} Score for ${d.country} ${d.flag} — Requirements 2026 | ${BRAND}`;
  const desc = `What ${e.name} score do you need for ${d.country}? Typical minimum: ${d.min}. Check requirements and practise free on ${BRAND}.`;
  const kw = `${e.short.toLowerCase()} score for ${d.country.toLowerCase()}, ${e.short.toLowerCase()} requirement ${d.country.toLowerCase()}, ${e.short.toLowerCase()} ${d.country.toLowerCase()} eligibility, minimum ${e.short.toLowerCase()} ${d.country.toLowerCase()}, study in ${d.country.toLowerCase()} english test`;
  const faqs = [
    { q: `What ${e.short} score do I need for ${d.country}?`, a: `Typical minimum: ${d.min}. ${d.note}` },
    { q: `Is the ${e.short} accepted in ${d.country}?`, a: `Yes — ${e.name} is widely accepted in ${d.country}. ${d.note}` },
    { q: `How do I reach the ${e.short} score for ${d.country}?`, a: `Practise free on ${BRAND} with full ${e.name} mocks, section drills and AI feedback until you consistently hit your target.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/exam-prep">Mock Tests</a> › ${e.short} for ${d.country}</p>
<section class="hero">
  <div class="badges"><span class="badge">${d.flag} ${d.country}</span><span class="badge">Updated 2026</span><span class="badge">Free practice</span></div>
  <h1>${e.name} Score for ${d.country} ${d.flag}</h1>
  <p class="lead">${d.note}</p>
  <a class="cta" href="/#/exam-prep/${e.appPath}">▶ Practise ${e.short} free for ${d.country}</a>
</section>
<div class="card">
  <h2>Typical ${e.short} requirement for ${d.country}</h2>
  <p><strong>${d.min}</strong></p>
  <p class="note">Guidance only — always confirm the exact requirement with the official body or your target university/visa programme, as minimums change and vary by course.</p>
</div>
<div class="card">
  <h2>How to hit your ${e.short} target for ${d.country}</h2>
  <ul>
    <li>Take a free full-length ${e.name} mock to get your baseline ${e.score} score.</li>
    <li>Use section practice to fix your weakest skill among ${e.sections}.</li>
    <li>Get AI writing &amp; speaking feedback with model answers.</li>
    <li>Track progress and repeat until you clear the ${d.country} requirement.</li>
  </ul>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${e.short} mock test`, href: `/mock-test/${d.exam}/` },
  { label: `${e.short} practice by section`, href: `/practice/${d.exam}/` },
  { label: `Eligibility checker tool`, href: `/tools/university-eligibility-checker/` },
  { label: `Score converter`, href: `/tools/english-test-score-converter/` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Mock Tests", path: "/#/exam-prep" }, { name: `${e.short} for ${d.country}`, path }]),
  ] }) + shell(inner));
}

function toolPage(slug) {
  const t = TOOLS[slug];
  const e = EXAMS[t.exam];
  const path = `/tools/${slug}/`;
  const title = `${t.title} — Free Online Tool 2026 | ${BRAND}`;
  const desc = `${t.lead} Free, instant, no signup — from ${BRAND}.`;
  const faqs = [
    { q: `Is the ${t.title} free?`, a: `Yes, completely free and instant — no account or payment required.` },
    { q: `How accurate is it?`, a: `It uses the official scales and widely-published concordance tables; always confirm final requirements with the test maker or university.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › ${t.title}</p>
<section class="hero">
  <div class="badges"><span class="badge">Free tool</span><span class="badge">Instant</span><span class="badge">No signup</span></div>
  <h1>${t.title}</h1>
  <p class="lead">${t.lead}</p>
  <a class="cta" href="/#/tools">▶ Open the free tool</a>
</section>
<div class="card">
  <h2>About this tool</h2>
  <p>${t.lead} ${BRAND} is a 100% free platform for IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE and GMAT preparation. Use this tool alongside our free full-length mock tests and AI speaking &amp; writing practice to plan exactly what score you need and how to reach it.</p>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `Free TOEFL mock test`, href: `/mock-test/toefl/` },
  { label: `Free PTE mock test`, href: `/mock-test/pte/` },
  { label: `All free exams`, href: `/#/exam-prep` },
])}`;
  emit(path, head({ title, desc, path, kw: t.kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: t.title, applicationCategory: "EducationApplication",
      operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: t.title, path }]),
  ] }) + shell(inner));
}

// Eligibility hub index
function eligibilityHub() {
  const path = `/eligibility/`;
  const title = `English Test & Admission Score Requirements by Country 2026 | ${BRAND}`;
  const desc = `IELTS, TOEFL, PTE, CELPIP, GRE & GMAT score requirements for Canada, USA, UK, Australia, Germany and more. Free guides + free practice tests.`;
  const links = Object.keys(ELIGIBILITY).map((slug) => {
    const d = ELIGIBILITY[slug]; const e = EXAMS[d.exam];
    return { label: `${e.short} score for ${d.country} ${d.flag}`, href: `/eligibility/${slug}/` };
  });
  const inner = `
<p class="crumb"><a href="/">Home</a> › Eligibility</p>
<section class="hero"><h1>Score Requirements by Country</h1>
<p class="lead">Find the English-test and admission score you need for your destination — then practise free until you hit it.</p></section>
${relatedGrid(links)}`;
  emit(path, head({ title, desc, path, kw: "english test score by country, ielts toefl pte requirement, study abroad score requirement", jsonLdBlocks: [
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Eligibility", path }]),
  ] }) + shell(inner));
}

// ── Study-abroad / top-universities pages (college niche) ───────────────────
const COUNTRY_UNIS = {
  usa:       { name: "USA", flag: "🇺🇸", ielts: "6.5–7.0", fee: "$30,000–60,000/yr", intake: "Fall (Sep), Spring (Jan)",
    unis: ["MIT", "Stanford", "Carnegie Mellon", "UC Berkeley", "Georgia Tech", "University of Illinois Urbana-Champaign", "NYU", "USC"] },
  uk:        { name: "UK", flag: "🇬🇧", ielts: "6.5–7.5", fee: "£27,000–40,000/yr", intake: "Sep/Oct (some Jan)",
    unis: ["Oxford", "Cambridge", "Imperial College London", "UCL", "LSE", "University of Manchester", "University of Edinburgh"] },
  canada:    { name: "Canada", flag: "🇨🇦", ielts: "6.5–7.0", fee: "CAD 20,000–58,000/yr", intake: "Fall (Sep), Winter (Jan)",
    unis: ["University of Toronto", "UBC", "McGill", "University of Waterloo", "University of Alberta"] },
  australia: { name: "Australia", flag: "🇦🇺", ielts: "6.5", fee: "AUD 44,000–50,000/yr", intake: "February, July",
    unis: ["University of Melbourne", "University of Sydney", "UNSW Sydney", "ANU", "Monash University"] },
  germany:   { name: "Germany", flag: "🇩🇪", ielts: "6.5", fee: "Mostly tuition-free (≈€300/sem)", intake: "Winter (Oct), Summer (Apr)",
    unis: ["TU Munich", "RWTH Aachen", "TU Berlin", "Heidelberg University", "LMU Munich"] },
  ireland:   { name: "Ireland", flag: "🇮🇪", ielts: "6.5", fee: "€20,000–30,000/yr", intake: "September",
    unis: ["Trinity College Dublin", "University College Dublin", "University of Galway", "University College Cork"] },
  "new-zealand": { name: "New Zealand", flag: "🇳🇿", ielts: "6.5", fee: "NZD 30,000–45,000/yr", intake: "February, July",
    unis: ["University of Auckland", "University of Otago", "Victoria University of Wellington", "University of Canterbury"] },
  singapore: { name: "Singapore", flag: "🇸🇬", ielts: "6.5", fee: "SGD 40,000–60,000/yr", intake: "August, January",
    unis: ["National University of Singapore", "Nanyang Technological University", "Singapore Management University"] },
  netherlands: { name: "Netherlands", flag: "🇳🇱", ielts: "6.5", fee: "€15,000–20,000/yr", intake: "September",
    unis: ["Delft University of Technology", "University of Amsterdam", "Eindhoven University of Technology", "Utrecht University"] },
};
function countryUniPage(id) {
  const d = COUNTRY_UNIS[id];
  const path = `/study-abroad/top-universities-in-${id}/`;
  const title = `Top Universities in ${d.name} for International Students 2026 — Fees, IELTS & Intakes | ${BRAND}`;
  const desc = `Top universities in ${d.name} for Master's & MBA: IELTS ${d.ielts}, tuition ${d.fee}, intakes ${d.intake}. Free college predictor, score requirements & admission process.`;
  const kw = `top universities in ${d.name.toLowerCase()}, study in ${d.name.toLowerCase()} for indian students, best universities for ms in ${d.name.toLowerCase()}, ${d.name.toLowerCase()} university fees for international students, ${d.name.toLowerCase()} ielts requirement, universities in ${d.name.toLowerCase()} admission process free, cheapest universities in ${d.name.toLowerCase()}`;
  const ciFaq = COUNTRY_DATA.find((x) => x.id === id);
  const faqs = [
    { q: `What IELTS score do I need for universities in ${d.name}?`, a: `Most universities in ${d.name} require IELTS ${d.ielts} overall for postgraduate admission. Use the free LandingPrep College Predictor to match your exact score to universities.` },
    { q: `How much does it cost to study in ${d.name}?`, a: `International tuition is typically ${d.fee}, plus living costs. ${d.name === "Germany" ? "Public universities are largely tuition-free." : "Scholarships can offset a large part of this."}` },
    { q: `When are the intakes in ${d.name}?`, a: `The main intakes in ${d.name} are: ${d.intake}.` },
    { q: `Can I work and settle in ${d.name} after studying?`, a: ciFaq ? `Yes — ${d.name} offers ${ciFaq.postStudyWork}. The pathway is ${ciFaq.immigration} Permanent residence: ${ciFaq.prTimeline}.` : `Yes — ${d.name} offers post-study work options that can lead to permanent residence. See the LandingPrep Country Guide for the full roadmap.` },
    { q: `How do I shortlist universities and check my chances in ${d.name}?`, a: `Use the free LandingPrep Profile Evaluation and College Predictor: enter your test score, GPA and budget to get Safe, Target and Reach universities in ${d.name}, plus matching scholarships and the admission process.` },
    { q: `What is the student-visa success rate for ${d.name}?`, a: ciFaq ? `${d.name} has an indicative student-visa success rate of about ${ciFaq.visaSuccess}%. ${ciFaq.visaNote} Strong proof of funds and a genuine study plan matter most.` : `Student-visa success in ${d.name} depends on your profile — strong proof of funds and a genuine study plan matter most.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Top universities in ${d.name}</p>
<section class="hero">
  <div class="badges"><span class="badge">${d.flag} ${d.name}</span><span class="badge">2026 intake</span><span class="badge">Free predictor</span></div>
  <h1>Top Universities in ${d.name} for International Students (2026)</h1>
  <p class="lead">IELTS ${d.ielts} · Tuition ${d.fee} · Intakes ${d.intake}. See which universities fit your scores and budget with the free College Predictor.</p>
  <a class="cta" href="/#/colleges">▶ Predict my colleges (free)</a>
</section>
<div class="card">
  <h2>Top universities in ${d.name}</h2>
  <ul>${d.unis.map(u => `<li><strong>${u}</strong></li>`).join("")}</ul>
  <p>Each offers strong international support, work opportunities and globally-recognised degrees. Use the free predictor to see your Safe / Target / Reach matches with fees, intakes and the full admission process.</p>
</div>
<div class="card">
  <h2>Admission essentials for ${d.name}</h2>
  <ul>
    <li><strong>English test:</strong> IELTS ${d.ielts} (or equivalent TOEFL/PTE).</li>
    <li><strong>Tuition:</strong> ${d.fee} for international students.</li>
    <li><strong>Intakes:</strong> ${d.intake}.</li>
    <li><strong>Documents:</strong> SOP, 2–3 LORs, transcripts, CV, and a strong Statement of Purpose — build yours free with our SOP tool.</li>
  </ul>
</div>
${(() => {
  const ci = COUNTRY_DATA.find(x => x.id === id);
  if (!ci) return "";
  return `<div class="card">
  <h2>Visa, immigration &amp; settlement in ${d.name}</h2>
  <ul>
    <li><strong>Student-visa success rate:</strong> ≈${ci.visaSuccess}% — ${ci.visaNote}</li>
    <li><strong>Post-study work:</strong> ${ci.postStudyWork}</li>
    <li><strong>Immigration pathway:</strong> ${ci.immigration}</li>
    <li><strong>Settlement / PR:</strong> ${ci.settlement} (${ci.prTimeline})</li>
    <li><strong>Cost of living:</strong> ${ci.avgLiving}</li>
  </ul>
  <h3>Recent changes (2024–26)</h3>
  <ul>${ci.changes.map(c => `<li><strong>${c.d}:</strong> ${c.t}</li>`).join("")}</ul>
</div>`;
})()}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🔮 Free College Predictor`, href: `/#/colleges` },
  { label: `📝 Free SOP Builder & Checker`, href: `/#/colleges` },
  { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `IELTS score for ${d.name}`, href: `/eligibility/` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: `Top universities in ${d.name}`, path }]),
  ] }) + shell(inner));
}

// ── Scholarship pages (high-intent acquisition SEO) ─────────────────────────
const SCHOLARSHIPS = {
  usa:       { name: "USA", flag: "🇺🇸", list: ["Fulbright Foreign Student Program (fully funded)", "Knight-Hennessy Scholars at Stanford (fully funded)", "AAUW International Fellowships ($20k–50k)", "Fulbright-Nehru for Indian students"] },
  uk:        { name: "UK", flag: "🇬🇧", list: ["Chevening Scholarship (UK govt, fully funded)", "Commonwealth Scholarship (fully funded)", "Gates Cambridge Scholarship", "Rhodes Scholarship at Oxford", "GREAT Scholarships (£10,000)"] },
  germany:   { name: "Germany", flag: "🇩🇪", list: ["DAAD Scholarships (€934/month + extras)", "Erasmus Mundus Joint Masters (fully funded)", "Deutschlandstipendium (€300/month)"] },
  canada:    { name: "Canada", flag: "🇨🇦", list: ["Vanier Canada Graduate Scholarship (CAD 50,000/yr)", "Lester B. Pearson Scholarship (U of Toronto, fully funded)", "Canada Graduate Scholarships"] },
  australia: { name: "Australia", flag: "🇦🇺", list: ["Australia Awards (fully funded)", "Research Training Program (RTP)", "University of Melbourne International Scholarships"] },
};
function scholarshipPage(id) {
  const d = SCHOLARSHIPS[id];
  const path = `/scholarships/study-in-${id}/`;
  const title = `Scholarships to Study in ${d.name} 2026 — Fully Funded for International Students | ${BRAND}`;
  const desc = `Top scholarships to study in ${d.name} for international students: ${d.list.slice(0, 3).map(s => s.split(" (")[0]).join(", ")} and more. Eligibility, amounts & deadlines + free scholarship finder.`;
  const kw = `scholarships to study in ${d.name.toLowerCase()}, fully funded scholarships ${d.name.toLowerCase()} for indian students, ${d.name.toLowerCase()} scholarships for international students 2026, masters scholarship ${d.name.toLowerCase()}, free scholarship search ${d.name.toLowerCase()}, scholarship amounts deadlines ${d.name.toLowerCase()}`;
  const faqs = [
    { q: `What scholarships can I get to study in ${d.name}?`, a: `Top options include ${d.list.slice(0, 3).map(s => s.split(" (")[0]).join(", ")}. Use the free LandingPrep Scholarship Finder to filter by level and funding type.` },
    { q: `Are there fully funded scholarships for ${d.name}?`, a: `Yes — several scholarships for ${d.name} cover full tuition plus living costs. ${d.list[0]} is one of the most generous.` },
    { q: `Do I need IELTS for a ${d.name} scholarship?`, a: `Most ${d.name} scholarships require proof of English (IELTS/TOEFL) plus university admission. Practise free on LandingPrep to hit the required score.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Scholarships</a> › Study in ${d.name}</p>
<section class="hero">
  <div class="badges"><span class="badge">${d.flag} ${d.name}</span><span class="badge">2026</span><span class="badge">Free finder</span></div>
  <h1>Scholarships to Study in ${d.name} (2026)</h1>
  <p class="lead">Fully-funded and partial scholarships for international students heading to ${d.name}. Filter them all free in the Scholarship Finder, then practise for the English test you'll need.</p>
  <a class="cta" href="/#/colleges">▶ Open the free Scholarship Finder</a>
</section>
<div class="card">
  <h2>Top scholarships for ${d.name}</h2>
  <ul>${d.list.map(s => `<li>${s}</li>`).join("")}</ul>
  <p>Each has its own eligibility and deadline — many require strong academics, leadership and a high IELTS/TOEFL score. The free finder lets you compare award size, level and funding type side by side.</p>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `💸 Free Scholarship Finder`, href: `/#/colleges` },
  { label: `🏛️ Top universities in ${d.name}`, href: `/study-abroad/top-universities-in-${id}/` },
  { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `IELTS score for ${d.name}`, href: `/eligibility/` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Scholarships", path: "/#/colleges" }, { name: `Study in ${d.name}`, path }]),
  ] }) + shell(inner));
}

// ── Blog article pages (country admission/immigration changes) ─────────────
// Contextual in-body links: link the FIRST occurrence of a few high-value anchor
// phrases per article (max 4, never self-link). Operates on already-escaped text
// (no HTML tags inside), so insertion is safe. Deep contextual internal links are
// the strongest internal-link signal Google reads.
const BODY_ANCHORS = [
  [/\bExpress Entry\b/i, "/blog/canada-pr-express-entry-basics/"],
  [/\bPGWP\b/, "/blog/canada-pgwp-2026-guide/"],
  [/\bGIC\b/, "/blog/gic-account-canada-2026-guide/"],
  [/\bblocked account\b/i, "/blog/germany-blocked-account-2026-guide/"],
  [/\bSTEM OPT\b/i, "/blog/usa-opt-stem-extension-2026-guide/"],
  [/\bGenuine Student\b/i, "/blog/australia-genuine-student-2026/"],
  [/\bGraduate Route\b/i, "/blog/uk-graduate-route-visa-2026/"],
  [/\bOne Skill Retake\b/i, "/blog/ielts-one-skill-retake-osr-2026/"],
  [/\bData Insights\b/i, "/blog/gmat-focus-edition-mock-test-free-2026/"],
];
function linkifyBody(text, lk) {
  for (const [re, href] of BODY_ANCHORS) {
    if (lk.count >= lk.max || href === lk.cur || lk.used.has(href)) continue;
    let done = false;
    text = text.replace(re, (m) => {
      if (done) return m;
      done = true; lk.used.add(href); lk.count++;
      return `<a href="${href}">${m}</a>`;
    });
  }
  return text;
}

// HowTo structured data for step-by-step posts → eligible for HowTo rich results.
function howToJsonLd(a) {
  return jsonld({ "@context": "https://schema.org", "@type": "HowTo", name: a.title, description: a.excerpt,
    step: a.sections.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.h, text: s.body })) });
}

function blogPage(a) {
  const path = `/blog/${a.id}/`;
  const title = `${a.title} | ${BRAND}`;
  const desc = a.excerpt.slice(0, 230);
  const kw = a.kw || (a.tag + ", study abroad, " + a.title.toLowerCase());
  const isHowTo = /^how-to-/.test(a.id) || /^how to /i.test(a.title);
  const lk = { used: new Set(), count: 0, max: 4, cur: path };
  const sectionsHtml = a.sections.map((s) => `<div class="card"><h2>${esc(s.h)}</h2><p>${linkifyBody(esc(s.body), lk)}</p></div>`).join("\n");
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/blog">Blog</a> › ${esc(a.tag)}</p>
<section class="hero">
  <div class="badges"><span class="badge">${esc(a.tag)}</span><span class="badge">Updated ${esc(a.date || "2026")}</span></div>
  <h1>${esc(a.title)}</h1>
  <p class="lead">${esc(a.excerpt)}</p>
  <a class="cta" href="/#/colleges">▶ Free College Predictor &amp; study-abroad tools</a>
</section>
${sectionsHtml}
${relatedArticles(a)}
${relatedGrid(blogTiles(a))}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.excerpt,
      author: { "@type": "Organization", name: BRAND }, publisher: { "@type": "Organization", name: BRAND }, datePublished: "2026-01-01", inLanguage: "en" }),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/#/blog" }, { name: a.title, path }]),
    ...(isHowTo ? [howToJsonLd(a)] : []),
  ] }) + shell(inner));
}

// ── Per-scholarship detail pages (auto-generated from scholarship-data) ─────
function scholarshipDetailPage(s) {
  const path = `/scholarship/${s.id}/`;
  const title = `${s.name} 2026 — Eligibility, Amount & Deadline | ${BRAND}`;
  const desc = `${s.name}: ${s.amount} for ${s.level} in ${s.country}. Eligibility: ${s.who}. Deadline: ${s.deadline}. Free scholarship finder + study-abroad tools.`;
  const kw = `${s.name.toLowerCase()}, ${s.name.toLowerCase()} eligibility, ${s.name.toLowerCase()} deadline, ${s.name.toLowerCase()} amount, ${s.country.toLowerCase()} scholarship, fully funded scholarship ${s.country.toLowerCase()}`;
  const faqs = [
    { q: `Who is eligible for the ${s.name}?`, a: `${s.who}. It funds ${s.level} study in ${s.country}.` },
    { q: `How much does the ${s.name} cover?`, a: `${s.amount}. ${s.highlight}` },
    { q: `What is the ${s.name} deadline?`, a: `Typically ${s.deadline}. Always confirm exact dates on the official scholarship website.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Scholarships</a> › ${esc(s.name)}</p>
<section class="hero">
  <div class="badges"><span class="badge">${esc(s.country)}</span><span class="badge">${esc(s.type)}</span><span class="badge">${esc(s.level)}</span></div>
  <h1>${esc(s.name)}</h1>
  <p class="lead">${esc(s.highlight)} Compare it with other awards in the free Scholarship Finder.</p>
  <a class="cta" href="/#/colleges">▶ Open the free Scholarship Finder</a>
</section>
<div class="card">
  <h2>Key facts</h2>
  <table style="width:100%;border-collapse:collapse" class="uni-table">
    <tr><td><strong>Award</strong></td><td>${esc(s.amount)}</td></tr>
    <tr><td><strong>Country</strong></td><td>${esc(s.country)}</td></tr>
    <tr><td><strong>Level</strong></td><td>${esc(s.level)}</td></tr>
    <tr><td><strong>Type</strong></td><td>${esc(s.type)}</td></tr>
    <tr><td><strong>Eligibility</strong></td><td>${esc(s.who)}</td></tr>
    <tr><td><strong>Deadline</strong></td><td>${esc(s.deadline)}</td></tr>
  </table>
</div>
<div class="card">
  <h2>How to apply</h2>
  <ol>
    <li>Confirm you meet the eligibility (${esc(s.who)}).</li>
    <li>Secure your university admission / nomination where required.</li>
    <li>Prepare a strong SOP and LORs — build yours free with our SOP tool.</li>
    <li>Submit before the ${esc(s.deadline)} deadline on the official portal.</li>
  </ol>
  <p class="note">Always verify amounts, eligibility and deadlines on the official scholarship website.</p>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `💸 All scholarships (free finder)`, href: `/#/colleges` },
  { label: `📝 Free SOP Builder`, href: `/#/colleges` },
  { label: `Scholarships to study in ${esc(s.country)}`, href: `/scholarships/study-in-${({ USA: "usa", UK: "uk", Germany: "germany", Canada: "canada", Australia: "australia" })[s.country] || "usa"}/` },
  { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Scholarships", path: "/#/colleges" }, { name: s.name, path }]),
  ] }) + shell(inner));
}

// ── Per-university pages (long-tail SEO, auto-generated from college-data) ──
function universityPage(c) {
  const ci = C_INFO[c.country] || {};
  const proc = C_PROC[c.country] || [];
  const path = `/university/${c.id}/`;
  const title = `${c.name} — Fees, IELTS/GRE Requirements & Admission 2026 | ${BRAND}`;
  const desc = `${c.name} (${c.city}, ${c.country}, QS #${c.rank}): tuition ${c.feeNote}, IELTS ${c.ielts}, GRE ${c.gre}, ${c.acceptance}% acceptance. Programs, scholarships, intakes & admission process — free.`;
  const kw = `${c.name.toLowerCase()} admission, ${c.name.toLowerCase()} fees, ${c.name.toLowerCase()} ielts requirement, ${c.name.toLowerCase()} ms requirements, ${c.name.toLowerCase()} acceptance rate, study at ${c.name.toLowerCase()}, ${c.name.toLowerCase()} scholarships`;
  const faqs = [
    { q: `What IELTS score do I need for ${c.name}?`, a: `${c.name} typically requires IELTS ${c.ielts} (TOEFL ${c.toefl}, PTE ${c.pte}). GRE: ${c.gre}.` },
    { q: `How much does ${c.name} cost?`, a: `International tuition is approximately ${c.feeNote}, plus living costs of ${ci.living || "varies"}. Application fee: ${c.appFee}.` },
    { q: `What is the acceptance rate at ${c.name}?`, a: `${c.name} has an indicative acceptance rate of about ${c.acceptance}% (${c.classProfile}).` },
    { q: `What are the intakes and deadlines at ${c.name}?`, a: `Intakes: ${c.intakes.join(", ")}. Typical deadline: ${c.deadline}.` },
  ];
  const row = (k, v) => `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`;
  const FLAG = { USA: "🇺🇸", UK: "🇬🇧", Canada: "🇨🇦", Australia: "🇦🇺", Germany: "🇩🇪", Ireland: "🇮🇪", "New Zealand": "🇳🇿", Singapore: "🇸🇬", Netherlands: "🇳🇱" };
  const inits = c.name.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).slice(0, 3).map((w) => w[0]).join("").toUpperCase();
  const hue = (c.name.charCodeAt(0) * 7) % 360;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Colleges</a> › ${esc(c.name)}</p>
<section class="uni-banner" style="background:linear-gradient(120deg,hsl(${hue} 55% 32%),hsl(${(hue + 40) % 360} 60% 24%))">
  <div class="uni-logo">${inits}</div>
  <div class="uni-banner-info">
    <div class="uni-flag">${FLAG[c.country] || "🎓"} ${c.country}</div>
    <h1>${esc(c.name)}</h1>
    <div class="uni-addr">📍 ${c.city}, ${c.country} · QS World Rank #${c.rank} · #${c.natRank} nationally${c.website ? ` · <a href="https://${c.website}" target="_blank" rel="noopener">${c.website}</a>` : ""}</div>
  </div>
</section>
<section class="hero" style="padding-top:18px">
  <div class="badges"><span class="badge">${c.country}</span><span class="badge">QS #${c.rank}</span><span class="badge">#${c.natRank} in ${c.country}</span><span class="badge">Founded ${c.founded}</span><span class="badge">${c.type}</span></div>
  <p class="lead">${c.highlight || ""} Check your fit with the free College Predictor, see fees, IELTS/GRE requirements and the full admission process below.</p>
  <a class="cta" href="/#/colleges/predictor/${encodeURIComponent(c.country)}">▶ Predict my admission chances (free)</a>
</section>
<div class="card">
  <h2>Admission requirements & key facts</h2>
  <table style="width:100%;border-collapse:collapse" class="uni-table">
    ${row("IELTS", c.ielts)}${row("TOEFL iBT", c.toefl)}${row("PTE Academic", c.pte)}${row("Duolingo", c.duolingo)}
    ${row("GRE", c.gre)}${row("GMAT (MBA)", c.gmat || "—")}${row("Min GPA", c.gpa)}${row("Work experience", c.workEx || "Not required")}
    ${row("Tuition (intl)", c.feeNote)}${row("Application fee", c.appFee)}${row("Acceptance rate", c.acceptance + "%")}${row("Intl students", c.intlPct + "%")}
    ${row("Intakes", c.intakes.join(", "))}${row("Deadline", c.deadline)}${row("Scholarships", c.scholarship || "—")}
  </table>
</div>
<div class="card">
  <h2>Popular programs</h2><ul>${c.programs.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
  <p><strong>Known for:</strong> ${(c.strengths || []).join(", ")}.${c.alumni ? ` Notable alumni: ${c.alumni}.` : ""}</p>
</div>
<div class="card">
  <h2>After you graduate · ${c.country}</h2>
  <ul>
    <li><strong>Post-study work:</strong> ${ci.psw || "—"}</li>
    <li><strong>Visa:</strong> ${ci.visa || "—"} · <strong>Work while studying:</strong> ${ci.work || "—"}</li>
    <li><strong>Living cost:</strong> ${ci.living || "—"}</li>
    <li><strong>Documents needed:</strong> ${(ci.checklist || []).join(", ")}</li>
  </ul>
</div>
<div class="card">
  <h2>Step-by-step admission process</h2>
  <ol>${proc.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
  <p class="note">All figures are indicative — confirm on the official site (${c.website}).</p>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🎓 Predict my admission (${c.country})`, href: `/#/colleges/predictor/${encodeURIComponent(c.country)}` },
  { label: `Top universities in ${c.country}`, href: `/#/colleges/rankings/${encodeURIComponent(c.country)}` },
  { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `Scholarships for ${c.country}`, href: `/#/colleges/scholarships/${encodeURIComponent(c.country)}` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "CollegeOrUniversity", name: c.name, url: "https://" + c.website,
      address: { "@type": "PostalAddress", addressLocality: c.city, addressCountry: c.country }, foundingDate: String(c.founded) }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Colleges", path: "/#/colleges" }, { name: c.name, path }]),
  ] }) + shell(inner));
}

// ── University-vs-University comparison pages (programmatic SEO) ─────────────
function uniVsPage(a, b) {
  const path = `/compare/${a.id}-vs-${b.id}/`;
  const title = `${a.name} vs ${b.name}: Fees, Ranking, IELTS & Admission Compared 2026 | ${BRAND}`;
  const desc = `${a.name} vs ${b.name} — compare QS rank (#${a.rank} vs #${b.rank}), tuition (${a.feeNote} vs ${b.feeNote}), IELTS (${a.ielts} vs ${b.ielts}), acceptance rate and programs. Free side-by-side comparison.`;
  const kw = `${a.name.toLowerCase()} vs ${b.name.toLowerCase()}, ${a.name.toLowerCase()} or ${b.name.toLowerCase()}, compare ${a.name.toLowerCase()} ${b.name.toLowerCase()}, ${a.name.toLowerCase()} ${b.name.toLowerCase()} fees ranking`;
  const faqs = [
    { q: `Is ${a.name} better than ${b.name}?`, a: `${a.name} is ranked QS #${a.rank} and ${b.name} #${b.rank}. "Better" depends on your course, budget and goals — ${a.name} costs ${a.feeNote} with ${a.acceptance}% acceptance, ${b.name} ${b.feeNote} with ${b.acceptance}%. Use the free LandingPrep College Predictor to see which fits your profile.` },
    { q: `Which is cheaper, ${a.name} or ${b.name}?`, a: `International tuition is ${a.feeNote} at ${a.name} and ${b.feeNote} at ${b.name}. Add living costs and check scholarships — both are covered free on LandingPrep.` },
    { q: `What IELTS score do I need for ${a.name} vs ${b.name}?`, a: `${a.name} typically requires IELTS ${a.ielts} and ${b.name} IELTS ${b.ielts}. Confirm exact, program-specific requirements on each official site.` },
  ];
  const row = (k, va, vb) => `<tr><td><strong>${k}</strong></td><td>${va}</td><td>${vb}</td></tr>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Compare</a> › ${esc(a.name)} vs ${esc(b.name)}</p>
<section class="hero">
  <div class="badges"><span class="badge">${a.country}</span><span class="badge">QS #${a.rank} vs #${b.rank}</span><span class="badge">2026</span></div>
  <h1>${esc(a.name)} vs ${esc(b.name)}</h1>
  <p class="lead">A free side-by-side comparison of fees, rankings, entry requirements and admissions. Check which fits your scores and budget with the free College Predictor.</p>
  <a class="cta" href="/#/colleges/compare/${encodeURIComponent(a.country)}">▶ Compare more universities (free)</a>
</section>
<div class="card">
  <h2>${esc(a.name)} vs ${esc(b.name)} — at a glance</h2>
  <table style="width:100%;border-collapse:collapse" class="uni-table">
    <tr><td></td><td><strong>${esc(a.name)}</strong></td><td><strong>${esc(b.name)}</strong></td></tr>
    ${row("Country / City", `${a.country}, ${a.city}`, `${b.country}, ${b.city}`)}
    ${row("QS World rank", "#" + a.rank, "#" + b.rank)}
    ${row("Tuition (intl)", a.feeNote, b.feeNote)}
    ${row("IELTS", a.ielts, b.ielts)}${row("TOEFL", a.toefl, b.toefl)}${row("GRE", a.gre, b.gre)}
    ${row("Acceptance rate", a.acceptance + "%", b.acceptance + "%")}
    ${row("Intl students", a.intlPct + "%", b.intlPct + "%")}
    ${row("Intakes", a.intakes.join(", "), b.intakes.join(", "))}
    ${row("Top programs", (a.programs || []).slice(0, 3).join(", "), (b.programs || []).slice(0, 3).join(", "))}
  </table>
</div>
<div class="card">
  <h2>Which should you choose?</h2>
  <p>Choose <strong>${esc(a.name)}</strong> if you want ${a.acceptance <= b.acceptance ? "a more selective brand name" : "a slightly higher acceptance rate"} and value ${(a.strengths || a.programs || []).slice(0, 2).join(" & ")}. Choose <strong>${esc(b.name)}</strong> for ${(b.strengths || b.programs || []).slice(0, 2).join(" & ")}${b.feeNum < a.feeNum ? " and lower tuition" : ""}. The best choice depends on your target program, budget and post-study plans — run both through the free predictor.</p>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `📊 ${a.name} details`, href: `/university/${a.id}/` },
  { label: `📊 ${b.name} details`, href: `/university/${b.id}/` },
  { label: `🔮 Free College Predictor`, href: `/#/colleges/predictor/${encodeURIComponent(a.country)}` },
  { label: `Top universities in ${a.country}`, href: `/#/colleges/rankings/${encodeURIComponent(a.country)}` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Compare", path: "/#/colleges" }, { name: `${a.name} vs ${b.name}`, path }]),
  ] }) + shell(inner));
}

// ── High-intent study-abroad pages: "Study [field] in [country]" + "Cost of
// studying in [country]" (programmatic SEO for big-volume queries). ──────────
const SEO_FIELDS = [
  { name: "MS in Computer Science", slug: "ms-computer-science", kw: "computer", short: "MS Computer Science" },
  { name: "MS in Data Science", slug: "ms-data-science", kw: "data", short: "MS Data Science" },
  { name: "MBA", slug: "mba", kw: "mba", short: "MBA" },
  { name: "MS in Engineering", slug: "ms-engineering", kw: "engineer", short: "MS Engineering" },
  { name: "MS in Business Analytics", slug: "ms-business-analytics", kw: "analyt", short: "Business Analytics" },
];

function studyFieldPage(field, co) {
  const path = `/study-abroad/${field.slug}-in-${co.id}/`;
  const all = COLLEGES.filter((c) => c.country === co.name);
  const matched = all.filter((c) => c.programs.join(" ").toLowerCase().includes(field.kw));
  const unis = (matched.length >= 3 ? matched : all).slice().sort((a, b) => a.rank - b.rank).slice(0, 6);
  const ielts = unis[0] ? unis[0].ielts : "6.5";
  const title = `${field.name} in ${co.name} 2026 — Top Universities, Fees & Requirements | ${BRAND}`;
  const desc = `Study ${field.name} in ${co.name}: top universities, tuition (${co.avgTuition}), IELTS/GRE requirements, intakes (${(co.intakes || []).join(", ")}), scholarships, post-study work (${co.postStudyWork}) and a free college predictor.`;
  const kw = `${field.short.toLowerCase()} in ${co.name.toLowerCase()}, study ${field.short.toLowerCase()} in ${co.name.toLowerCase()}, ${field.short.toLowerCase()} ${co.name.toLowerCase()} universities, ${field.short.toLowerCase()} ${co.name.toLowerCase()} fees, best universities for ${field.short.toLowerCase()} in ${co.name.toLowerCase()}`;
  const faqs = [
    { q: `Which are the best universities for ${field.short} in ${co.name}?`, a: `Top options include ${unis.slice(0, 4).map((u) => u.name).join(", ")}. Use the free LandingPrep College Predictor to match your scores to ${co.name} universities.` },
    { q: `How much does ${field.short} in ${co.name} cost?`, a: `Tuition is typically ${co.avgTuition} plus living costs of ${co.avgLiving}. Scholarships and education loans can cover a large part.` },
    { q: `What are the requirements for ${field.short} in ${co.name}?`, a: `Most programs require IELTS ${ielts} (or TOEFL/PTE equivalent), a strong GPA, an SOP and LORs; some ask for the GRE/GMAT. Confirm on each university's official page.` },
    { q: `Can I work in ${co.name} after ${field.short}?`, a: `Yes — ${co.name} offers ${co.postStudyWork}. ${co.immigration} PR timeline: ${co.prTimeline}.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › ${esc(field.name)} in ${co.name}</p>
<section class="hero">
  <div class="badges"><span class="badge">${co.flag} ${co.name}</span><span class="badge">${esc(field.short)}</span><span class="badge">2026 intake</span><span class="badge">Free predictor</span></div>
  <h1>${esc(field.name)} in ${co.name} (2026)</h1>
  <p class="lead">Top universities, tuition ${co.avgTuition}, IELTS ${ielts}, intakes ${(co.intakes || []).join(", ")}. See your Safe / Target / Reach matches free with the College Predictor.</p>
  <a class="cta" href="/#/colleges/predictor/${encodeURIComponent(co.name)}">▶ Predict my admission (free)</a>
</section>
<div class="card">
  <h2>Top universities for ${esc(field.short)} in ${co.name}</h2>
  <ul>${unis.map((u) => `<li><strong>${esc(u.name)}</strong> — QS #${u.rank} · IELTS ${u.ielts} · ${u.acceptance}% acceptance · ${u.feeNote} · <a href="/university/${u.id}/">details</a></li>`).join("")}</ul>
  <p>Each is a strong choice for ${esc(field.short)} with international support and good graduate outcomes. Use the free predictor for your personalised list.</p>
</div>
<div class="card">
  <h2>Cost, requirements &amp; intakes</h2>
  <ul>
    <li><strong>Tuition:</strong> ${co.avgTuition} for international students.</li>
    <li><strong>Living cost:</strong> ${co.avgLiving}.</li>
    <li><strong>Entry:</strong> IELTS ${ielts} (or TOEFL/PTE), SOP, 2–3 LORs, transcripts; GRE/GMAT for some programs.</li>
    <li><strong>Intakes:</strong> ${(co.intakes || []).join(", ")}.</li>
    <li><strong>Post-study work:</strong> ${co.postStudyWork} · <strong>PR:</strong> ${co.prTimeline}.</li>
  </ul>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🔮 Predict colleges in ${co.name}`, href: `/#/colleges/predictor/${encodeURIComponent(co.name)}` },
  { label: `Cost of studying in ${co.name}`, href: `/study-abroad/cost-of-studying-in-${co.id}/` },
  { label: `Top universities in ${co.name}`, href: `/study-abroad/top-universities-in-${co.id}/` },
  { label: `Scholarships for ${co.name}`, href: `/#/colleges/scholarships/${encodeURIComponent(co.name)}` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: `${field.name} in ${co.name}`, path }]),
  ] }) + shell(inner));
}

function costPage(co) {
  const path = `/study-abroad/cost-of-studying-in-${co.id}/`;
  const title = `Cost of Studying in ${co.name} 2026 — Tuition, Living Costs & Scholarships | ${BRAND}`;
  const desc = `How much does it cost to study in ${co.name}? Tuition ${co.avgTuition}, living ${co.avgLiving}, plus scholarships, education loans, part-time work and post-study earnings. Free cost & ROI calculator.`;
  const kw = `cost of studying in ${co.name.toLowerCase()}, ${co.name.toLowerCase()} tuition fees, living cost in ${co.name.toLowerCase()}, study in ${co.name.toLowerCase()} cost for international students, ${co.name.toLowerCase()} student budget`;
  const faqs = [
    { q: `How much does it cost to study in ${co.name}?`, a: `Budget roughly ${co.avgTuition} tuition plus ${co.avgLiving} living per year. Scholarships, education loans and part-time work reduce the net cost.` },
    { q: `Can I work part-time while studying in ${co.name}?`, a: `Yes — most student visas allow around 20 hours/week in term time, which helps with living costs.` },
    { q: `Is studying in ${co.name} worth it?`, a: `${co.name} offers ${co.postStudyWork} and a PR timeline of ${co.prTimeline}, so strong graduates often recover costs within a few years. Use the free ROI calculator to model your payback.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Cost of studying in ${co.name}</p>
<section class="hero">
  <div class="badges"><span class="badge">${co.flag} ${co.name}</span><span class="badge">Tuition ${co.avgTuition}</span><span class="badge">2026</span></div>
  <h1>Cost of Studying in ${co.name} (2026)</h1>
  <p class="lead">Tuition ${co.avgTuition} · Living ${co.avgLiving}. A full breakdown of fees, living costs, scholarships, loans and post-study earnings.</p>
  <a class="cta" href="/#/colleges/loan/${encodeURIComponent(co.name)}">▶ Free cost &amp; loan calculator</a>
</section>
<div class="card">
  <h2>Annual cost breakdown</h2>
  <ul>
    <li><strong>Tuition (international):</strong> ${co.avgTuition}</li>
    <li><strong>Living costs:</strong> ${co.avgLiving} (rent, food, transport, insurance)</li>
    <li><strong>Visa &amp; one-off setup:</strong> varies — include flights, deposits and proof of funds</li>
    <li><strong>Part-time work:</strong> typically allowed ~20 hours/week to offset living costs</li>
  </ul>
</div>
<div class="card">
  <h2>How to lower the cost</h2>
  <ul>
    <li><strong>Scholarships:</strong> merit and need-based awards — use the free Scholarship Finder.</li>
    <li><strong>Education loans:</strong> compare 10 lenders and estimate EMI in the Loans &amp; Costs tool.</li>
    <li><strong>Choose by ROI:</strong> ${co.name} offers ${co.postStudyWork}; model payback with the Cost &amp; ROI calculator.</li>
  </ul>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🧮 Cost & ROI calculator`, href: `/#/colleges/loan/${encodeURIComponent(co.name)}` },
  { label: `Scholarships for ${co.name}`, href: `/#/colleges/scholarships/${encodeURIComponent(co.name)}` },
  { label: `Top universities in ${co.name}`, href: `/study-abroad/top-universities-in-${co.id}/` },
  { label: `🔮 Free College Predictor`, href: `/#/colleges/predictor/${encodeURIComponent(co.name)}` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: `Cost of studying in ${co.name}`, path }]),
  ] }) + shell(inner));
}

// ── About page (E-E-A-T: who we are, mission, contact) ──────────────────────
function aboutPage() {
  const path = `/about/`;
  const title = `About LandingPrep — Free Exam Prep & Study-Abroad Platform`;
  const desc = `LandingPrep is a free platform helping international students worldwide go from mock test to campus abroad: free IELTS, TOEFL, PTE, GRE & GMAT mock tests plus a complete study-abroad toolkit. Learn about our mission and contact us.`;
  const kw = `about landingprep, landingprep contact, free exam prep platform, study abroad platform, landingprep mission`;
  const faqs = [
    { q: `Is LandingPrep really free?`, a: `Yes — all mock tests, AI practice, the college predictor, scholarship finder, SOP builder and study-abroad tools are 100% free with no signup required.` },
    { q: `How can I contact LandingPrep?`, a: `Email us at support@landingprep.com. We help with exam prep, college selection, scholarships, SOPs and study-abroad questions.` },
    { q: `Who is LandingPrep for?`, a: `International students worldwide preparing for IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE or GMAT and planning to study abroad.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › About</p>
<section class="hero">
  <div class="badges"><span class="badge">Free · No signup</span><span class="badge">Students worldwide</span></div>
  <h1>About LandingPrep</h1>
  <p class="lead">From mock test to campus abroad — free exam prep and a complete study-abroad toolkit for international students.</p>
</section>
<div class="card">
  <h2>Our mission</h2>
  <p>Premium exam preparation and study-abroad guidance should not cost a fortune. LandingPrep exists to give every international student — regardless of budget or country — free, high-quality tools to prepare for the IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo English Test, GRE and GMAT Focus, and to navigate the entire journey of studying abroad: choosing a country and university, winning scholarships, writing a strong SOP, comparing costs and loans, and understanding visas and immigration.</p>
</div>
<div class="card">
  <h2>What we offer — all free</h2>
  <ul>
    <li><strong>1,000+ mock tests</strong> across 7 exams with real timings, AI speaking & writing practice and model answers.</li>
    <li><strong>College Predictor</strong> across 99 top universities with Safe/Target/Reach matches, fees and requirements.</li>
    <li><strong>Scholarship finder, SOP/LOR/resume builders, university & country comparison, loan & ROI calculators.</li>
    <li><strong>Visa-interview practice and step-by-step immigration & PR roadmaps for 9 destinations.</li>
  </ul>
</div>
<div class="card">
  <h2>Contact us</h2>
  <p>Questions, feedback or partnerships? Email <a href="mailto:support@landingprep.com">support@landingprep.com</a> and our team will help. We cover exam prep, college selection, scholarships, SOPs, visas and study-abroad planning.</p>
  <p class="note">LandingPrep is an independent education platform and is not affiliated with any official test provider or university. Always verify fees, requirements and visa rules with the official source.</p>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🎯 Free mock tests`, href: `/#/exam-prep` },
  { label: `🏛️ Study-abroad toolkit`, href: `/#/colleges` },
  { label: `📰 Study & immigration blog`, href: `/#/blog` },
  { label: `🧰 Free tools`, href: `/#/tools` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "AboutPage", name: title, url: ORIGIN + path,
      mainEntity: { "@type": "Organization", name: BRAND, url: ORIGIN, email: "support@landingprep.com",
        logo: ORIGIN + "/og-image.png", slogan: "From mock test to campus abroad",
        contactPoint: { "@type": "ContactPoint", email: "support@landingprep.com", contactType: "customer support", areaServed: "Worldwide", availableLanguage: "English" } } }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "About", path }]),
  ] }) + shell(inner));
}

// ── Generate everything ─────────────────────────────────────────────────────
aboutPage();
Object.keys(EXAMS).forEach((id) => { mockPage(id); practicePage(id); });
COUNTRY_DATA.forEach((co) => { costPage(co); SEO_FIELDS.forEach((f) => studyFieldPage(f, co)); });
COLLEGES.forEach(universityPage);
// University-vs-University pages: adjacent-ranked rivals within each country
// (top 6 per country) — high-intent "X vs Y" searches, kept to a sane count.
(() => {
  const byCountry = {};
  COLLEGES.forEach((c) => { (byCountry[c.country] = byCountry[c.country] || []).push(c); });
  Object.values(byCountry).forEach((list) => {
    const top = list.slice().sort((a, b) => a.rank - b.rank).slice(0, 6);
    for (let i = 0; i < top.length - 1; i++) uniVsPage(top[i], top[i + 1]);
  });
})();
Object.keys(ELIGIBILITY).forEach(eligibilityPage);
Object.keys(TOOLS).forEach(toolPage);
Object.keys(COUNTRY_UNIS).forEach(countryUniPage);
Object.keys(SCHOLARSHIPS).forEach(scholarshipPage);
SCHOLARSHIP_DATA.forEach(scholarshipDetailPage);
BLOG_EXTRA.forEach(blogPage);
eligibilityHub();

// ── Language Hub SEO pages (German flagship + French) ────────────────────────
const LANG_SEO = {
  german: {
    name: "German", native: "Deutsch", slug: "learn-german", flag: "🇩🇪",
    countries: "Germany, Austria and Switzerland", tuition: "tuition-free public universities in Germany",
    exams: "Goethe-Zertifikat (A1–C2), TestDaF, telc and DSH",
    units: ["Greetings &amp; introductions", "Numbers, days &amp; time", "Articles &amp; gender (der/die/das)", "Present tense &amp; common verbs", "Survival German for uni, shops &amp; café"],
    kw: "learn german free, free german course online, german a1, learn german for beginners, goethe a1 practice, german for study abroad, free german lessons, german vocabulary with audio, german speaking practice ai, german mock test free, study in germany language requirement, learn german online free for beginners",
    faqs: [
      { q: "Is the German course on LandingPrep really free?", a: "Yes — the German A1 course, vocabulary with natural-voice pronunciation, AI speaking practice and mock tests are 100% free with no signup and no payment." },
      { q: "What level of German do I need to study in Germany?", a: "Most German-taught degrees require B1–B2 (TestDaF or DSH); many English-taught Master's programmes need no German. Start at A1 here and build up." },
      { q: "Which German exam should I take?", a: "The Goethe-Zertifikat is the most widely recognised worldwide; TestDaF and DSH are used for university admission. Pick the one your university accepts." },
      { q: "Can I practise speaking German with AI for free?", a: "Yes — our hands-free AI speaking partner holds a real two-way German conversation, gently auto-corrects your mistakes, replies in a natural German voice and shows the English translation. Just press Start and talk." },
    ],
  },
  french: {
    name: "French", native: "Français", slug: "learn-french", flag: "🇫🇷",
    countries: "France, Belgium, Switzerland and Québec (Canada)", tuition: "low-tuition public universities in France",
    exams: "DELF (A1–B2), DALF (C1–C2), TCF and TEF",
    units: ["Greetings &amp; introductions", "Numbers &amp; everyday words", "Articles &amp; gender (le/la/les)", "Key verbs: être &amp; avoir", "Survival French for daily life"],
    kw: "learn french free, free french course online, french a1, learn french for beginners, delf a1 practice, french for study abroad, free french lessons, french vocabulary with audio, french speaking practice ai, french mock test free, study in france language, tcf tef practice free",
    faqs: [
      { q: "Is the French course free?", a: "Yes — the French A1 course, vocabulary with native-voice pronunciation, AI speaking practice and mock tests are completely free with no signup." },
      { q: "What French level do I need to study in France?", a: "Most French-taught degrees want B2 (DELF/DALF or TCF). Campus France guides the level; English-taught programmes may need none. Start A1 here." },
      { q: "Which French exam is best for Canada?", a: "For Canadian immigration, the TEF and TCF are accepted (Express Entry). For study, DELF/DALF and TCF are widely recognised." },
      { q: "Can I practise speaking French with AI?", a: "Yes — our hands-free AI partner chats with you in simple French, gently auto-corrects your mistakes, speaks in a natural French voice and shows English translations. Just press Start and talk." },
    ],
  },
};
function languageLandingPage(key) {
  const L = LANG_SEO[key];
  const path = `/${L.slug}/`;
  const title = `Learn ${L.name} Free — Online A1 Course, Vocabulary &amp; Exam Prep 2026 | ${BRAND}`;
  const desc = `Learn ${L.name} (${L.native}) for free: a structured A1 course, vocabulary with natural-voice pronunciation, an AI speaking partner and ${L.name} mock tests. Built for students heading to ${L.countries}. No signup.`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/languages">Languages</a> › Learn ${L.name}</p>
<section class="hero">
  <div class="badges"><span class="badge">100% Free</span><span class="badge">Natural voice</span><span class="badge">AI speaking</span><span class="badge">No signup</span></div>
  <h1>Learn ${L.name} Free — ${L.flag} Online A1 Course</h1>
  <p class="lead">Study abroad in ${L.countries}? Learn ${L.name} from scratch with a free A1 course, vocabulary you can <em>hear</em> in a natural voice, a 2-way AI speaking partner and ${L.name} mock tests — all free, for students worldwide.</p>
  <a class="cta" href="/#/languages">▶ Start the free ${L.name} course</a>
</section>
<div class="card">
  <h2>Why learn ${L.name}?</h2>
  <ul>
    <li><strong>Study abroad:</strong> ${L.name} unlocks ${L.tuition} and daily life in ${L.countries}.</li>
    <li><strong>Better visa &amp; jobs:</strong> language skills improve student-visa approval and part-time work.</li>
    <li><strong>Settle &amp; work:</strong> speaking ${L.name} makes living, working and getting PR far easier.</li>
  </ul>
</div>
<div class="card">
  <h2>Free ${L.name} A1 course outline</h2>
  <ul>${L.units.map((u) => `<li>${u}</li>`).join("")}</ul>
  <p>Each lesson has grammar notes, example sentences and vocabulary with a 🔊 button so you hear the ${L.name} pronunciation in a natural voice — then a quick placement test to check your level.</p>
</div>
<div class="card">
  <h2>${L.name} exams for study abroad</h2>
  <p>We guide you through ${L.exams}. Take a free ${L.name} A1 mock test (Reading, Grammar &amp; Vocabulary, and Listening) with instant scoring to track your progress toward the level your university needs.</p>
</div>
<div class="card">
  <h2>Practise speaking ${L.name} with AI</h2>
  <p>Our free AI speaking partner holds a real two-way ${L.name} conversation: speak (or type), and it replies in simple ${L.name} with the English translation and the natural ${L.name} voice — the fastest way to build confidence.</p>
</div>
${faqBlock(L.faqs)}
${relatedGrid([
  { label: `Start the free ${L.name} course`, href: "/#/languages" },
  { label: key === "german" ? "Learn French free" : "Learn German free", href: key === "german" ? "/learn-french/" : "/learn-german/" },
  { label: "Free exam prep lessons (PPT)", href: "/prep-lessons/" },
  { label: "Study abroad — universities &amp; scholarships", href: "/#/colleges" },
])}`;
  emit(path, head({ title, desc, path, kw: L.kw, jsonLdBlocks: [
    courseJsonLd(key, `Free ${L.name} A1 Course`, desc),
    faqJsonLd(L.faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Languages", path: "/#/languages" }, { name: `Learn ${L.name}`, path }]),
  ] }) + shell(inner));
}
function prepLessonsPage() {
  const path = `/prep-lessons/`;
  const title = `Free Exam Prep Lessons — 600+ Strategy Slides for IELTS, TOEFL, PTE, GRE, GMAT, CELPIP &amp; Duolingo | ${BRAND}`;
  const desc = `Free PPT-style strategy lessons for every section of all 7 exams (IELTS, TOEFL iBT, PTE, GRE, GMAT Focus, CELPIP, Duolingo) plus German &amp; French — 24 decks, 600+ slides of tips, tricks, traps and worked examples. Learn the strategy, then practise with free mocks. No signup.`;
  const kw = "free exam prep lessons, ielts listening tips and tricks, ielts reading tips, ielts writing tips, ielts speaking tips, toefl tips and strategy, pte tips, gre verbal quant tips, gmat focus strategy, celpip tips, duolingo english test tips, exam preparation slides, ppt exam lessons free, ielts question types explained, ielts band 8 tips, learn german tips, learn french tips, study abroad exam strategy, exam tips with examples";
  const faqs = [
    { q: "Are the prep lessons free?", a: "Yes — all 24 lesson decks (600+ slides) are 100% free with no signup. Learn the strategy, then practise with our free mock tests." },
    { q: "Which exams have lessons?", a: "Every section of all 7 exams: IELTS, TOEFL iBT, PTE Academic, GRE, GMAT Focus, CELPIP and the Duolingo English Test — plus German and French foundations. Each deck has 22–32 slides of tips, traps and worked examples." },
    { q: "What do the IELTS lessons cover?", a: "Separate decks for Listening, Reading, Writing and Speaking — format, every question/task type, scoring bands, distractor traps, time management and band-8 strategy, all with examples." },
    { q: "Do you have lessons for German and French?", a: "Yes — German and French foundation decks cover pronunciation, gender (der/die/das, le/la), key verbs, word order and a smart learning plan, alongside free A1 courses, vocabulary, mock tests and an AI speaking partner." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › Prep Lessons</p>
<section class="hero">
  <div class="badges"><span class="badge">100% Free</span><span class="badge">24 decks · 600+ slides</span><span class="badge">All 7 exams</span><span class="badge">With examples</span></div>
  <h1>Free Exam Prep Lessons — Learn the Strategy First</h1>
  <p class="lead">Broad, visual PPT-style lessons for <strong>every section of all 7 exams</strong> — tips, tricks, traps and worked examples. Master the strategy here, then practise with our free mock tests.</p>
  <a class="cta" href="/#/lessons">▶ Open the free prep lessons</a>
</section>
<div class="card">
  <h2>What's inside — 24 decks, 600+ slides</h2>
  <ul>
    <li><strong>IELTS</strong> — Listening, Reading, Writing &amp; Speaking (4 decks): all question types, traps, band-8 strategy.</li>
    <li><strong>TOEFL iBT</strong> — Reading, Listening, Speaking &amp; Writing (incl. the academic-discussion task).</li>
    <li><strong>PTE Academic</strong> — Speaking &amp; Writing, Reading, Listening (Read Aloud, WFD and every task).</li>
    <li><strong>GRE &amp; GMAT Focus</strong> — Verbal, Quant, Analytical Writing / Data Insights with worked problems.</li>
    <li><strong>CELPIP &amp; Duolingo</strong> — every task type, scoring and proctoring tips for Canada &amp; university admission.</li>
    <li><strong>German &amp; French</strong> — foundations, pronunciation, grammar and a learning plan.</li>
  </ul>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: "Open all prep lessons", href: "/#/lessons" },
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
  { label: "Learn German free", href: "/learn-german/" },
  { label: "Learn French free", href: "/learn-french/" },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Prep Lessons", path }]),
  ] }) + shell(inner));
}
function bandCheckerPage(mode) {
  const isW = mode === "writing";
  const path = isW ? `/ielts-writing-checker/` : `/ielts-speaking-checker/`;
  const title = isW
    ? `Free IELTS Writing Checker — Instant AI Band Score (Task 1 &amp; 2) | ${BRAND}`
    : `Free IELTS Speaking Checker — Instant AI Band Score &amp; Feedback | ${BRAND}`;
  const desc = isW
    ? `Free AI IELTS Writing checker: paste your Task 1 or Task 2 answer and get an instant estimated band with a Task Response, Coherence, Lexical Resource &amp; Grammar breakdown, corrections and a Band 9 rewrite. No signup.`
    : `Free AI IELTS Speaking checker: record a Part 2 answer and get an instant estimated band with Fluency, Lexical, Grammar &amp; Pronunciation feedback and a Band 9 model answer. No signup.`;
  const kw = isW
    ? "free ielts writing checker, ielts band score checker, ielts essay checker free, ai ielts writing feedback, ielts writing task 2 checker, ielts writing task 1 checker, check my ielts essay band, ielts writing evaluator free, ielts essay band score calculator"
    : "free ielts speaking checker, ielts speaking band score, ai ielts speaking test free, ielts speaking practice with band score, check my ielts speaking, ielts speaking evaluator, ielts part 2 practice free";
  const faqs = isW ? [
    { q: "Is the IELTS Writing checker really free?", a: "Yes — paste your essay and get an instant estimated band with a full criterion breakdown, corrections and a Band 9 rewrite. No signup, no payment." },
    { q: "How accurate is the AI band score?", a: "It's calibrated to the official IELTS public band descriptors and is a strong guide for practice (most AI checkers are 80–90% accurate). For a high-stakes decision, confirm with a certified teacher." },
    { q: "Does it score Task 1 and Task 2?", a: "Both. Pick Task 1 (report/letter) or Task 2 (essay) and the checker applies the right descriptors (Task Achievement vs Task Response)." },
    { q: "What feedback do I get?", a: "An overall band, sub-scores for Task Response/Achievement, Coherence & Cohesion, Lexical Resource and Grammatical Range & Accuracy, your key mistakes corrected, and a full Band 9 rewrite to learn from." },
  ] : [
    { q: "Is the IELTS Speaking checker free?", a: "Yes — record a Part 2 long-turn answer and get an instant estimated band with feedback and a Band 9 model answer. No signup." },
    { q: "How does it work?", a: "You get a real Part 2 cue card, record your 1–2 minute answer (it transcribes live), and the AI examiner scores Fluency & Coherence, Lexical Resource, Grammar and Pronunciation against the band descriptors." },
    { q: "How accurate is it?", a: "It's a strong practice guide calibrated to the IELTS descriptors; pronunciation is estimated from the transcript, so pair it with a teacher for a precise pronunciation score." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${isW ? "IELTS Writing Checker" : "IELTS Speaking Checker"}</p>
<section class="hero">
  <div class="badges"><span class="badge">100% Free</span><span class="badge">Instant band</span><span class="badge">No signup</span><span class="badge">Band 9 ${isW ? "rewrite" : "model"}</span></div>
  <h1>Free IELTS ${isW ? "Writing" : "Speaking"} Checker — Instant AI Band Score</h1>
  <p class="lead">${isW ? "Paste your Task 1 or Task 2 answer" : "Record a Part 2 answer"} and get an estimated IELTS band in seconds, with a full criterion breakdown, ${isW ? "corrections and a Band 9 rewrite" : "feedback and a Band 9 model answer"}. Free, unlimited, no account.</p>
  <a class="cta" href="/#/${isW ? "writing-checker" : "speaking-checker"}">▶ Check my band score</a>
</section>
<div class="card">
  <h2>How it works</h2>
  <ul>
    <li><strong>1.</strong> ${isW ? "Pick Task 1 or Task 2 and paste your answer." : "Get a real Part 2 cue card and record your answer (it transcribes as you speak)."}</li>
    <li><strong>2.</strong> Our AI examiner applies the official IELTS band descriptors.</li>
    <li><strong>3.</strong> Get your overall band + ${isW ? "Task Response, Coherence, Lexical Resource &amp; Grammar" : "Fluency, Lexical, Grammar &amp; Pronunciation"} sub-scores, ${isW ? "key corrections and a Band 9 rewrite" : "targeted tips and a Band 9 model answer"}.</li>
  </ul>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: isW ? "Open the Writing checker" : "Open the Speaking checker", href: `/#/${isW ? "writing-checker" : "speaking-checker"}` },
  { label: isW ? "Free IELTS Speaking checker" : "Free IELTS Writing checker", href: isW ? "/ielts-speaking-checker/" : "/ielts-writing-checker/" },
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
  { label: "IELTS prep lessons (PPT)", href: "/prep-lessons/" },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    { "@context": "https://schema.org", "@type": "WebApplication", name: `Free IELTS ${isW ? "Writing" : "Speaking"} Checker`, applicationCategory: "EducationalApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description: desc },
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: isW ? "IELTS Writing Checker" : "IELTS Speaking Checker", path }]),
  ] }) + shell(inner));
}

function vocabularyPages() {
  let VOCAB = {};
  try { VOCAB = JSON.parse(readFileSync(join(ROOT, "data/vocab-topics.json"), "utf8")); } catch (e) { return; }
  const ids = Object.keys(VOCAB);
  // Hub page
  const hubFaqs = [
    { q: "Is the vocabulary free?", a: "Yes — every topic word list (with definitions, examples, synonyms and audio) is 100% free, no signup." },
    { q: "How does better vocabulary raise my band?", a: "Lexical Resource is 25% of your IELTS Writing and Speaking marks. Using precise, topic-specific words and higher-band synonyms lifts that score directly." },
    { q: "Which topics are covered?", a: "Education, technology, environment, health, work & career, crime & law, globalisation, Band 9 linking words, and high-frequency TOEFL academic words." },
  ];
  const hubInner = `
<p class="crumb"><a href="/">Home</a> › IELTS &amp; TOEFL Vocabulary</p>
<section class="hero">
  <div class="badges"><span class="badge">100% Free</span><span class="badge">${ids.length} topics</span><span class="badge">With audio</span></div>
  <h1>Free IELTS &amp; TOEFL Vocabulary by Topic</h1>
  <p class="lead">Topic word lists that lift your Lexical Resource band — definitions, example sentences, higher-band synonyms and 🔊 audio. Pick a topic and start learning.</p>
  <a class="cta" href="/#/vocabulary">▶ Open the vocabulary trainer</a>
</section>
<div class="card"><h2>Choose a topic</h2><ul>${ids.map((id) => `<li><a href="/ielts-vocabulary/${id}/"><strong>${esc(VOCAB[id].title)}</strong></a> — ${VOCAB[id].words.length} words</li>`).join("")}</ul></div>
${faqBlock(hubFaqs)}
${relatedGrid([
  { label: "Open vocabulary trainer", href: "/#/vocabulary" },
  { label: "Free IELTS writing checker", href: "/ielts-writing-checker/" },
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
  { label: "IELTS prep lessons", href: "/prep-lessons/" },
])}`;
  emit(`/ielts-vocabulary/`, head({
    title: `Free IELTS &amp; TOEFL Vocabulary by Topic — Word Lists with Examples | ${BRAND}`,
    desc: `Free IELTS & TOEFL vocabulary by topic: ${ids.map((i) => VOCAB[i].title).join(", ")}. Definitions, example sentences, Band 9 synonyms and audio. No signup.`,
    path: `/ielts-vocabulary/`,
    kw: "ielts vocabulary, ielts vocabulary list, ielts topic vocabulary, toefl vocabulary, toefl words list, ielts band 9 words, academic vocabulary ielts, free ielts vocabulary with meaning, ielts linking words",
    jsonLdBlocks: [
      { "@context": "https://schema.org", "@type": "Dataset", name: "IELTS & TOEFL Topic Vocabulary", description: "Free IELTS and TOEFL vocabulary organised by topic, with definitions, example sentences, higher-band synonyms and audio.", isAccessibleForFree: true, creator: { "@type": "Organization", name: BRAND }, keywords: ids.map((i) => VOCAB[i].title).join(", ") },
      faqJsonLd(hubFaqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Vocabulary", path: `/ielts-vocabulary/` }])],
  }) + shell(hubInner));
  // Per-topic pages
  ids.forEach((id) => {
    const t = VOCAB[id]; const path = `/ielts-vocabulary/${id}/`;
    const list = t.words.map((w) => `<div class="vrow"><strong>${esc(w.w)}</strong> <em>${esc(w.pos || "")}</em> — ${esc(w.def)}<br/><span class="vex">“${esc(w.ex)}”</span>${w.syn ? ` <span class="vsyn">↗ ${esc(w.syn)}</span>` : ""}</div>`).join("");
    const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/ielts-vocabulary/">Vocabulary</a> › ${esc(t.title)}</p>
<section class="hero"><div class="badges"><span class="badge">${t.words.length} words</span><span class="badge">Free</span></div>
<h1>${t.emoji || ""} ${esc(t.title)} Vocabulary for IELTS &amp; TOEFL</h1><p class="lead">${esc(t.intro)}</p>
<a class="cta" href="/#/vocabulary/${id}">▶ Practise with audio</a></section>
<div class="card"><h2>${esc(t.title)} word list</h2>${list}</div>
${relatedGrid(ids.filter((x) => x !== id).slice(0, 4).map((x) => ({ label: VOCAB[x].title + " vocabulary", href: `/ielts-vocabulary/${x}/` })))}`;
    emit(path, head({
      title: `${t.title} Vocabulary for IELTS &amp; TOEFL — Free Word List with Examples | ${BRAND}`,
      desc: `Free ${t.title} vocabulary for IELTS & TOEFL: ${t.words.slice(0, 8).map((w) => w.w).join(", ")}… — definitions, example sentences and Band 9 synonyms.`,
      path, kw: `${t.title.toLowerCase()} vocabulary ielts, ielts ${t.title.toLowerCase()} words, ${t.title.toLowerCase()} vocabulary list, ielts vocabulary ${t.title.toLowerCase()}, toefl ${t.title.toLowerCase()} words`,
      jsonLdBlocks: [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Vocabulary", path: `/ielts-vocabulary/` }, { name: t.title, path }])],
    }) + shell(inner));
  });
}

// ── Per-band "IELTS Band X requirements & how to get it" pages (high-intent) ──
const BANDS = [
  { b: "5.5", raw: "19/40", level: "Modest", use: "foundation, diploma and some pathway / pre-sessional programmes" },
  { b: "6", raw: "23/40", level: "Competent", use: "many undergraduate courses and some skilled-migration visas" },
  { b: "6.5", raw: "27/40", level: "Competent", use: "the most common requirement — most universities for UG and PG" },
  { b: "7", raw: "30/40", level: "Good", use: "top universities, many Master's, and professional registration (nursing, engineering)" },
  { b: "7.5", raw: "32/40", level: "Good", use: "competitive postgraduate programmes and scholarships" },
  { b: "8", raw: "35/40", level: "Very good", use: "elite programmes and the maximum points for skilled-migration / PR" },
];
function bandPage(item) {
  const path = `/ielts-band-${item.b.replace(".", "-")}/`;
  const title = `IELTS Band ${item.b} — Requirements &amp; How to Get It (2026) | ${BRAND}`;
  const desc = `What IELTS Band ${item.b} means, the raw score you need (about ${item.raw} in Listening/Reading), who needs it, and a step-by-step plan to reach Band ${item.b}. Free practice tests, lessons and an AI band checker.`;
  const kw = `ielts band ${item.b}, how to get ielts band ${item.b} in one month, ielts band ${item.b} raw score, ielts band ${item.b} requirements for study abroad, is ielts ${item.b} good for universities, ielts band ${item.b} meaning, strategy to reach ielts band ${item.b}`;
  const steps = [
    { name: "Know your target", text: `Band ${item.b} ≈ about ${item.raw} correct in Listening and Reading. Writing & Speaking are marked on the official band descriptors (Task Response/Fluency, Coherence, Lexical Resource, Grammar).` },
    { name: "Diagnose with a free mock test", text: `Take a full free IELTS mock test to see your current band in each of the four skills and find your weakest one.` },
    { name: "Learn the strategy", text: `Study the free PPT lessons for your weak sections — question types, traps and timing for Band ${item.b}.` },
    { name: "Build vocabulary & grammar", text: `Lexical Resource and Grammar are each 25% of Writing/Speaking. Learn topic vocabulary and Band 9 linking words.` },
    { name: "Practise Writing & Speaking with feedback", text: `Use the free AI band-score checker to get a TR/CC/LR/GRA breakdown and a Band 9 model, then redo your weak answers.` },
    { name: "Do timed full tests until consistent", text: `Repeat full mocks under exam timing until you hit Band ${item.b} two or three times in a row.` },
  ];
  const faqs = [
    { q: `What raw score is IELTS Band ${item.b}?`, a: `Roughly ${item.raw} correct out of 40 in Listening and in Reading (the exact boundary shifts slightly per test). Writing and Speaking are scored on the band descriptors, not a raw count.` },
    { q: `Is Band ${item.b} good?`, a: `Band ${item.b} is "${item.level}" on the IELTS scale and is typically needed for ${item.use}.` },
    { q: `How long does it take to reach Band ${item.b}?`, a: `It depends on your starting band — most learners move up about 0.5 band with 4–6 weeks of focused, feedback-driven practice. Use the free mock tests and AI checker to track progress.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › IELTS Band ${item.b}</p>
<section class="hero"><div class="badges"><span class="badge">${item.level}</span><span class="badge">Raw ≈ ${item.raw}</span><span class="badge">Free plan</span></div>
<h1>IELTS Band ${item.b}: Requirements &amp; How to Get It</h1>
<p class="lead"><strong>Band ${item.b}</strong> is rated "${item.level}" and usually needed for ${item.use}. In Listening and Reading that's about <strong>${item.raw}</strong> correct. Here's exactly how to reach it — free.</p>
<a class="cta" href="/mock-test/ielts/">▶ Take a free IELTS mock test</a></section>
<div class="card"><h2>Step-by-step plan to reach Band ${item.b}</h2><ol>${steps.map((s) => `<li><strong>${s.name}.</strong> ${s.text}</li>`).join("")}</ol></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
  { label: "Free AI writing band checker", href: "/ielts-writing-checker/" },
  { label: "IELTS prep lessons (PPT)", href: "/prep-lessons/" },
  { label: "IELTS vocabulary by topic", href: "/ielts-vocabulary/" },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    { "@context": "https://schema.org", "@type": "HowTo", name: `How to get IELTS Band ${item.b}`, description: desc, step: steps.map((s) => ({ "@type": "HowToStep", name: s.name, text: s.text })) },
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `IELTS Band ${item.b}`, path }]),
  ] }) + shell(inner));
}

// ── Student city-guide SEO pages (high-traffic "student life in <city>") ──────
function cityGuidePages() {
  let SA = {};
  try { SA = JSON.parse(readFileSync(join(ROOT, "data/study-abroad-extra.json"), "utf8")); } catch (e) { return; }
  const cities = SA.cityGuides || [];
  if (!cities.length) return;
  const slug = (c) => c.city.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  // Hub
  const hubInner = `
<p class="crumb"><a href="/">Home</a> › Student City Guides</p>
<section class="hero"><div class="badges"><span class="badge">100% Free</span><span class="badge">${cities.length} cities</span><span class="badge">Costs &amp; tips</span></div>
<h1>Student City Guides — Cost of Living, Areas &amp; Tips</h1>
<p class="lead">Heading abroad? Real, practical guides to the best student cities — monthly budget, transport, where students live and insider tips.</p>
<a class="cta" href="/#/relocate">▶ Open the Move-Abroad toolkit</a></section>
<div class="card"><h2>Choose a city</h2><ul>${cities.map((c) => `<li><a href="/student-guide/${slug(c)}/"><strong>${esc(c.emoji)} ${esc(c.city)}</strong> (${esc(c.country)})</a> — ${esc(c.cost)}</li>`).join("")}</ul></div>
${relatedGrid([
  { label: "Move-abroad checklist &amp; visa timeline", href: "/#/relocate" },
  { label: "Free college predictor", href: "/#/colleges" },
  { label: "Scholarships", href: "/#/colleges" },
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
])}`;
  emit(`/student-city-guides/`, head({
    title: `Student City Guides — Cost of Living, Areas &amp; Tips (2026) | ${BRAND}`,
    desc: `Free student guides to ${cities.map((c) => c.city).join(", ")}: monthly cost of living, transport, where students live and practical tips for international students.`,
    path: `/student-city-guides/`,
    kw: `student city guide, cost of living for students, best student cities, ${cities.map((c) => "student life in " + c.city.toLowerCase()).join(", ")}`,
    jsonLdBlocks: [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Student City Guides", path: `/student-city-guides/` }])],
  }) + shell(hubInner));
  // Per-city
  cities.forEach((c) => {
    const path = `/student-guide/${slug(c)}/`;
    const faqs = [
      { q: `How much does it cost to live in ${c.city} as a student?`, a: `A typical international student in ${c.city} budgets around ${c.cost}, depending on accommodation and lifestyle.` },
      { q: `Where do students live in ${c.city}?`, a: `Popular student areas include ${(c.studentAreas || []).join(", ")}.` },
      { q: `How do students get around ${c.city}?`, a: c.transport },
    ];
    const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/student-city-guides/">City Guides</a> › ${esc(c.city)}</p>
<section class="hero"><div class="badges"><span class="badge">${esc(c.country)}</span><span class="badge">${esc(c.cost)}</span><span class="badge">Free guide</span></div>
<h1>${esc(c.emoji)} Student Guide to ${esc(c.city)}</h1><p class="lead">${esc(c.intro)}</p>
<a class="cta" href="/#/relocate">▶ Pre-departure checklist &amp; visa timeline</a></section>
<div class="card"><h2>Cost &amp; getting around</h2><ul><li><strong>Monthly budget:</strong> ${esc(c.cost)}</li><li><strong>Transport:</strong> ${esc(c.transport)}</li><li><strong>Where students live:</strong> ${esc((c.studentAreas || []).join(", "))}</li></ul></div>
<div class="card"><h2>Tips for students in ${esc(c.city)}</h2><ul>${(c.tips || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: "Move-abroad checklist &amp; visa timeline", href: "/#/relocate" },
  { label: "All student city guides", href: "/student-city-guides/" },
  ...cities.filter((x) => x.city !== c.city).slice(0, 2).map((x) => ({ label: `Student guide to ${x.city}`, href: `/student-guide/${slug(x)}/` })),
])}`;
    emit(path, head({
      title: `Student Guide to ${esc(c.city)} — Cost of Living, Areas &amp; Tips (2026) | ${BRAND}`,
      desc: `Living in ${c.city} as an international student: monthly cost (${c.cost}), transport, the best student areas and practical tips. Free study-abroad guide.`,
      path, kw: `student life in ${c.city.toLowerCase()}, cost of living ${c.city.toLowerCase()} students, study in ${c.city.toLowerCase()}, ${c.city.toLowerCase()} student accommodation, international students ${c.city.toLowerCase()}`,
      jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "City Guides", path: `/student-city-guides/` }, { name: c.city, path }])],
    }) + shell(inner));
  });
}

// ── Per-band × per-section IELTS pages ("Band 7 in Writing") ─────────────────
const SEC_RAW = { "6": "23/40", "6.5": "27/40", "7": "30/40", "7.5": "32/40", "8": "35/40" };
const SECTIONS = [
  { s: "Listening", emoji: "🎧", raw: true, tips: ["Read the questions and predict answers before the audio plays.", "Obey the word limit (e.g. 'NO MORE THAN TWO WORDS').", "If you miss one, let it go and keep listening — don't freeze.", "Drill spelling, names and numbers — they are easy marks."] },
  { s: "Reading", emoji: "📖", raw: true, tips: ["Skim for structure first, then scan for keywords and synonyms.", "Spend about 20 minutes per passage; leave the hardest for last.", "Master True/False/Not Given vs Yes/No/Not Given logic.", "Locate, decide, move on — don't read every word."] },
  { s: "Writing", emoji: "✍️", raw: false, tips: ["Answer the exact question — Task Response is 25% of the mark.", "Plan for 5 minutes; one clear idea per paragraph.", "Use a range of linkers and precise, topic-specific vocabulary.", "Vary your sentence structures and proofread grammar at the end."] },
  { s: "Speaking", emoji: "🗣️", raw: false, tips: ["Extend every answer with a reason and an example.", "Use the Part 2 prep minute to jot quick notes.", "Don't memorise scripts — speak naturally and keep flowing.", "Work on pronunciation, word stress and intonation."] },
];
function bandSectionPage(band, sec) {
  const b = band.b;
  const path = `/ielts-band-${b.replace(".", "-")}-${sec.s.toLowerCase()}/`;
  const need = sec.raw ? `about ${SEC_RAW[b]} correct out of 40` : `consistently meeting the Band ${b} descriptors`;
  const title = `How to Get IELTS Band ${b} in ${sec.s} (2026) | ${BRAND}`;
  const desc = `Get IELTS Band ${b} in ${sec.s}: what you need (${need}), the exact strategy, common mistakes and free practice. Step-by-step plan with mock tests${sec.raw ? "" : " and a free AI band checker"}.`;
  const steps = [
    { name: "Know the target", text: sec.raw ? `For ${sec.s}, Band ${b} is ${need} (boundaries shift slightly per test).` : `For ${sec.s}, Band ${b} means ${need} — there is no raw score; examiners use the public band descriptors.` },
    { name: "Diagnose", text: `Take a free IELTS ${sec.s} mock to see your current band and your specific weaknesses.` },
    ...sec.tips.map((t, i) => ({ name: "Tactic " + (i + 1), text: t })),
    { name: sec.raw ? "Practise under timing" : "Get feedback and redo", text: sec.raw ? `Do timed ${sec.s} sections until you hit ${need} two or three times in a row.` : `Use the free AI band checker to score your ${sec.s.toLowerCase()} on each criterion, then rewrite/re-record your weak answers.` },
  ];
  const faqs = [
    { q: `What do I need for Band ${b} in IELTS ${sec.s}?`, a: `You need ${need}. ${sec.raw ? "Every question is one mark with no negative marking, so never leave a blank." : "Focus on the four criteria for this section equally."}` },
    { q: `Is Band ${b} in ${sec.s} hard to get?`, a: `It's very achievable with focused, feedback-driven practice — most learners gain about 0.5 band in 4–6 weeks. The free mocks and AI checker show your progress.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/ielts-band-${b.replace(".", "-")}/">IELTS Band ${b}</a> › ${sec.s}</p>
<section class="hero"><div class="badges"><span class="badge">${sec.emoji} ${sec.s}</span><span class="badge">Band ${b}</span><span class="badge">Free plan</span></div>
<h1>How to Get IELTS Band ${b} in ${sec.s}</h1>
<p class="lead">To score <strong>Band ${b}</strong> in IELTS ${sec.s} you need ${need}. Here's the exact strategy — free.</p>
<a class="cta" href="${sec.raw ? "/mock-test/ielts/" : "/ielts-" + (sec.s === "Writing" ? "writing" : "speaking") + "-checker/"}">▶ ${sec.raw ? "Take a free IELTS mock" : "Check your " + sec.s.toLowerCase() + " band free"}</a></section>
<div class="card"><h2>Step-by-step plan</h2><ol>${steps.map((s) => `<li><strong>${s.name}.</strong> ${esc(s.text)}</li>`).join("")}</ol></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `All IELTS Band ${b} requirements`, href: `/ielts-band-${b.replace(".", "-")}/` },
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
  { label: "IELTS prep lessons (PPT)", href: "/prep-lessons/" },
  { label: "Free AI band checker", href: "/ielts-writing-checker/" },
])}`;
  emit(path, head({ title, desc, path, kw: `ielts band ${b} ${sec.s.toLowerCase()}, how to get band ${b} in ${sec.s.toLowerCase()}, ielts ${sec.s.toLowerCase()} band ${b}, ielts ${sec.s.toLowerCase()} tips band ${b}`, jsonLdBlocks: [
    { "@context": "https://schema.org", "@type": "HowTo", name: title.replace(` | ${BRAND}`, ""), description: desc, step: steps.map((s) => ({ "@type": "HowToStep", name: s.name, text: s.text })) },
    faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `Band ${b}`, path: `/ielts-band-${b.replace(".", "-")}/` }, { name: sec.s, path }]),
  ] }) + shell(inner));
}

// ── "[Exam] for [Country]" requirement pages ────────────────────────────────
const EXAM_COUNTRY = [
  { exam: "IELTS", slug: "ielts", c: "Canada", study: "6.0–6.5 overall (most courses want 6.5 with no band under 6.0)", extra: "For Express Entry PR, CLB 9 = IELTS Listening 8.0, Reading 7.0, Writing 7.0, Speaking 7.0 earns maximum language points. Accepted by IRCC and all Canadian universities." },
  { exam: "IELTS", slug: "ielts", c: "UK", study: "6.0–6.5 overall for most degrees (6.5–7.0 for top universities)", extra: "For a UK Student visa below degree level you need IELTS for UKVI (SELT) at the required CEFR level. Pre-sessional English can lower the entry score." },
  { exam: "IELTS", slug: "ielts", c: "Australia", study: "6.0–6.5 overall for study", extra: "For the subclass 500 student visa a minimum around 5.5–6.0 applies. For skilled PR: 'competent' = 6, 'proficient' = 7, 'superior' = 8 (which gives the most points)." },
  { exam: "IELTS", slug: "ielts", c: "Germany", study: "6.0–6.5 overall for English-taught programmes", extra: "German-taught degrees need German (TestDaF/DSH) instead. Many Master's are taught fully in English with IELTS 6.5." },
  { exam: "IELTS", slug: "ielts", c: "Ireland", study: "6.0–6.5 overall (often 6.5 for postgraduate)", extra: "Accepted by all Irish universities; the Stamp 1G graduate route lets you stay and work after study." },
  { exam: "IELTS", slug: "ielts", c: "New Zealand", study: "6.0–6.5 overall for most degrees", extra: "Accepted for study and for the Skilled Migrant residence pathway." },
  { exam: "TOEFL", slug: "toefl", c: "USA", study: "78–100 on TOEFL iBT (top universities want 100+)", extra: "There is no central English requirement for the F-1 visa — the score is set by each university. TOEFL is the most widely accepted test in the USA." },
  { exam: "PTE", slug: "pte", c: "Australia", study: "50–65 on the PTE Academic Global Scale", extra: "PTE Academic is fully accepted for Australian student visas and skilled migration (50 = competent, 65 = proficient, 79 = superior)." },
  { exam: "PTE", slug: "pte", c: "Canada", study: "60+ on PTE Academic for most universities", extra: "PTE Academic is now accepted for Canadian study permits and (PTE Core) for Express Entry." },
  { exam: "Duolingo", slug: "duolingo", c: "USA", study: "105–120 on the Duolingo English Test", extra: "Accepted by thousands of US universities; cheaper and faster than IELTS/TOEFL, with results in about two days." },
  { exam: "CELPIP", slug: "celpip", c: "Canada", study: "CELPIP-General is built mainly for Canadian immigration; for study most universities prefer IELTS or TOEFL, though some accept CELPIP", extra: "CELPIP-General is the go-to English test for Canadian PR and citizenship — fully computer-delivered and Canada-specific." },
];
function examForCountryPage(x) {
  const path = `/${x.slug}-for-${x.c.toLowerCase().replace(/\s+/g, "-")}/`;
  const title = `${x.exam} Score for ${x.c} — Study &amp; Visa Requirements (2026) | ${BRAND}`;
  const desc = `What ${x.exam} score do you need for ${x.c}? Typical study requirement: ${x.study}. ${x.extra} Free ${x.exam} mock tests and prep.`;
  const faqs = [
    { q: `What ${x.exam} score do I need for ${x.c}?`, a: `Typically ${x.study}. ${x.extra}` },
    { q: `Is ${x.exam} accepted in ${x.c}?`, a: `Yes — ${x.extra}` },
    { q: `How can I reach that score for free?`, a: `Take free ${x.exam} mock tests, learn the strategy in the PPT lessons, and check your writing/speaking band with the free AI checker.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${x.exam} for ${x.c}</p>
<section class="hero"><div class="badges"><span class="badge">${x.exam}</span><span class="badge">${x.c}</span><span class="badge">2026</span></div>
<h1>${x.exam} Score for ${x.c}: Study &amp; Visa Requirements</h1>
<p class="lead">For ${x.c}, the typical ${x.exam} requirement is <strong>${x.study}</strong>. ${esc(x.extra)}</p>
<a class="cta" href="/mock-test/${x.slug}/">▶ Take a free ${x.exam} mock test</a></section>
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${x.exam} mock test`, href: `/mock-test/${x.slug}/` },
  { label: `${x.exam} prep lessons`, href: "/prep-lessons/" },
  { label: "Free AI band checker", href: "/ielts-writing-checker/" },
  { label: `Student guide to ${x.c === "USA" ? "New York" : x.c === "Canada" ? "Toronto" : x.c === "Australia" ? "Sydney" : x.c === "UK" ? "London" : x.c === "Germany" ? "Berlin" : "Dublin"}`, href: "/student-city-guides/" },
])}`;
  emit(path, head({ title, desc, path, kw: `${x.exam.toLowerCase()} score for ${x.c.toLowerCase()}, ${x.exam.toLowerCase()} requirement ${x.c.toLowerCase()}, ${x.exam.toLowerCase()} for ${x.c.toLowerCase()} study visa, study in ${x.c.toLowerCase()} ${x.exam.toLowerCase()}`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `${x.exam} for ${x.c}`, path }])] }) + shell(inner));
}

// ── "[Exam] vs [Exam]" comparison pages ─────────────────────────────────────
const EXAM_VS = [
  { a: "IELTS", b: "TOEFL", rows: [["Scoring", "Band 0–9", "0–120"], ["Format", "Paper or computer; face-to-face speaking", "Internet-based; speak into a microphone"], ["Length", "About 2h 45m", "About 2 hours"], ["Speaking", "Live, with a real examiner", "Recorded, AI + human scored"], ["Best for", "UK, Australia, Canada, Ireland, NZ", "USA, and widely accepted worldwide"]], verdict: "Pick IELTS if you prefer a human speaking examiner or are heading to the UK/Australia; pick TOEFL for the USA or if you like an all-computer test." },
  { a: "IELTS", b: "PTE", rows: [["Scoring", "Band 0–9", "10–90 (Global Scale of English)"], ["Marking", "Human examiners", "Fully computer (AI) scored"], ["Results", "3–13 days", "Often within 48 hours"], ["Speaking", "With a real examiner", "Into a microphone, AI scored"], ["Best for", "Those who prefer human marking", "Fast results and Australia migration"]], verdict: "Choose PTE for fast, fully-computer scoring and quick turnaround; choose IELTS if you prefer a human examiner and the most universal recognition." },
  { a: "TOEFL", b: "PTE", rows: [["Scoring", "0–120", "10–90"], ["Marking", "AI + human", "Fully AI"], ["Results", "4–8 days", "~48 hours"], ["Strength", "Strong US recognition", "Fast, growing acceptance"], ["Best for", "USA universities", "Australia, fast results"]], verdict: "Both are computer-based; TOEFL is the safer choice for the USA, PTE for the fastest results and Australian migration." },
  { a: "IELTS", b: "Duolingo", rows: [["Scoring", "Band 0–9", "10–160"], ["Cost", "Higher (~US$200+)", "Much cheaper (~US$65)"], ["Length", "~2h 45m, at a centre", "~1 hour, at home"], ["Results", "3–13 days", "~2 days"], ["Acceptance", "Universal", "Thousands of universities, growing"]], verdict: "Duolingo is far cheaper, shorter and taken at home — great if your university accepts it. IELTS has the widest acceptance including visas/PR." },
  { a: "GRE", b: "GMAT", rows: [["Used for", "Most Master's & PhD programmes", "MBA & business Master's"], ["Score", "260–340 (+ AWA 0–6)", "205–805 (Focus Edition)"], ["Maths", "Calculator allowed", "No calculator (Quant)"], ["Length", "~1h 58m", "~2h 15m"], ["Best for", "Broad grad-school options", "Top business schools"]], verdict: "Take the GRE for the widest range of graduate programmes; take the GMAT Focus if you're targeting competitive MBA programmes that prefer it." },
  { a: "CELPIP", b: "IELTS", rows: [["Scoring", "CLB level 1–12", "Band 0–9"], ["Delivery", "Fully computer (incl. speaking)", "Paper/computer; speaking with a real examiner"], ["Accent", "North American English", "British/International English"], ["Results", "Usually 4–5 days", "3–13 days"], ["Best for", "Canadian PR, citizenship & some study", "Universal — study, work & migration worldwide"]], verdict: "For Canadian immigration both are accepted by IRCC — pick CELPIP if you prefer North American English and an all-computer test, or IELTS General for the widest global recognition." },
];
function examVsExamPage(v) {
  const path = `/${v.a.toLowerCase()}-vs-${v.b.toLowerCase()}/`;
  const title = `${v.a} vs ${v.b} — Which Is Easier &amp; Which Should You Take? (2026) | ${BRAND}`;
  const desc = `${v.a} vs ${v.b}: a clear side-by-side comparison of scoring, format, length, results and acceptance — and which test to choose. Free practice for both.`;
  const table = `<div class="card"><h2>${v.a} vs ${v.b} at a glance</h2><table class="cmp-table"><thead><tr><th></th><th>${v.a}</th><th>${v.b}</th></tr></thead><tbody>${v.rows.map((r) => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>`;
  const faqs = [
    { q: `Is ${v.a} easier than ${v.b}?`, a: `Neither is universally easier — it depends on your strengths. ${v.verdict}` },
    { q: `Which is more accepted, ${v.a} or ${v.b}?`, a: v.verdict },
    { q: `Can I practise both for free?`, a: `Yes — LandingPrep has free full-length mock tests, strategy lessons and an AI band checker for both ${v.a} and ${v.b}.` },
  ];
  const slugA = v.a.toLowerCase(), slugB = v.b.toLowerCase();
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${v.a} vs ${v.b}</p>
<section class="hero"><div class="badges"><span class="badge">${v.a}</span><span class="badge">vs</span><span class="badge">${v.b}</span></div>
<h1>${v.a} vs ${v.b}: Which Should You Take?</h1>
<p class="lead">${esc(v.verdict)}</p>
<a class="cta" href="/mock-test/${slugA}/">▶ Try a free ${v.a} mock test</a></section>
${table}
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${v.a} mock test`, href: `/mock-test/${slugA}/` },
  { label: `Free ${v.b} mock test`, href: `/mock-test/${slugB}/` },
  { label: "Score converter", href: "/tools/english-test-score-converter/" },
  { label: "Prep lessons", href: "/prep-lessons/" },
])}`;
  emit(path, head({ title, desc, path, kw: `${slugA} vs ${slugB} which is better, ${slugA} or ${slugB} which is easier, ${slugA} vs ${slugB} which should i take, ${slugA} vs ${slugB} university acceptance, which test for study abroad ${slugA} ${slugB}`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `${v.a} vs ${v.b}`, path }])] }) + shell(inner));
}

// ── "IELTS score for [University]" pages (long-tail, high-intent) ────────────
// Rich, unique per-university facts so the exam-for-uni pages aren't thin content.
function uniFacts(c) {
  const rows = [];
  if (c.rank) rows.push(["World rank (QS)", "#" + c.rank]);
  if (c.city) rows.push(["Location", esc(c.city) + ", " + esc(c.country)]);
  if (c.type) rows.push(["Type", esc(c.type)]);
  if (c.founded) rows.push(["Founded", String(c.founded)]);
  if (c.acceptance) rows.push(["Acceptance rate", c.acceptance + "%"]);
  if (c.intlPct) rows.push(["International students", c.intlPct + "%"]);
  if (c.feeNote) rows.push(["Tuition", esc(c.feeNote)]);
  if (c.appFee) rows.push(["Application fee", esc(c.appFee)]);
  if (c.deadline) rows.push(["Application deadline", esc(c.deadline)]);
  if (c.intakes && c.intakes.length) rows.push(["Intakes", esc(c.intakes.join(", "))]);
  let out = rows.length ? `<div class="card"><h2>${esc(c.name)} — key facts</h2><table class="cmp-table"><tbody>${rows.map((r) => `<tr><td><strong>${r[0]}</strong></td><td>${r[1]}</td></tr>`).join("")}</tbody></table></div>` : "";
  if (c.programs && c.programs.length) out += `<div class="card"><h2>Popular programmes at ${esc(c.name)}</h2><ul>${c.programs.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>`;
  const strengths = Array.isArray(c.strengths) ? c.strengths.join(", ") : (c.strengths || "");
  if (strengths) out += `<div class="card"><h2>What ${esc(c.name)} is known for</h2><p>${esc(strengths)}</p></div>`;
  if (c.scholarship) out += `<div class="card"><h2>Scholarships &amp; funding</h2><p>${esc(c.scholarship)}</p></div>`;
  return out;
}

function examForUniPage(c) {
  if (!c || !c.id || c.ielts == null) return;
  const band = c.ielts;
  const path = `/ielts-for-${c.id}/`;
  const bandStr = String(band);
  const bandLink = ["6", "6.5", "7", "7.5", "8"].includes(bandStr) ? `/ielts-band-${bandStr.replace(".", "-")}/` : "/ielts-band-7/";
  const title = `IELTS Score for ${esc(c.name)} — Requirement &amp; How to Get It (2026) | ${BRAND}`;
  const desc = `What IELTS score do you need for ${c.name} (${c.country})? Around Band ${band} overall${c.toefl ? " (≈ TOEFL " + c.toefl + ", PTE " + c.pte + ")" : ""}. Plus ${c.name}'s rank, fees, deadlines, programmes and a free plan to reach your target.`;
  const faqs = [
    { q: `What IELTS score do I need for ${c.name}?`, a: `${c.name} typically requires around IELTS Band ${band} overall${c.toefl ? " (equivalent to TOEFL iBT ~" + c.toefl + " or PTE ~" + c.pte + ")" : ""}. Undergraduate courses are often 0.5 lower; some postgraduate programmes ask higher — confirm on your course page.` },
    { q: `Does ${c.name} accept TOEFL or PTE too?`, a: `Yes — ${c.name} also accepts ${c.toefl ? "TOEFL iBT (~" + c.toefl + ") and PTE Academic (~" + c.pte + ")" : "TOEFL iBT and PTE Academic"} alongside IELTS.` },
    { q: `How can I reach Band ${band} for free?`, a: `Take free IELTS mocks to find your weak section, learn the strategy in the PPT lessons, and check your Writing/Speaking band with the free AI band checker.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/university/${c.id}/">${esc(c.name)}</a> › IELTS score</p>
<section class="hero"><div class="badges"><span class="badge">${esc(c.country)}</span>${c.rank ? `<span class="badge">QS #${c.rank}</span>` : ""}<span class="badge">IELTS ${band}</span><span class="badge">2026</span></div>
<h1>IELTS Score for ${esc(c.name)}</h1>
<p class="lead">To study at <strong>${esc(c.name)}</strong>${c.city ? " in " + esc(c.city) : ""}, you typically need around <strong>IELTS Band ${band}</strong> overall${c.toefl ? ` — about <strong>TOEFL ${c.toefl}</strong> or <strong>PTE ${c.pte}</strong>` : ""}. Undergraduate courses may accept a little lower; competitive postgraduate programmes can ask for more.</p>
<a class="cta" href="/mock-test/ielts/">▶ Take a free IELTS mock test</a></section>
${uniFacts(c)}
<div class="card"><h2>How to reach Band ${band}</h2><ol>
<li><strong>Diagnose.</strong> Take a free IELTS mock to see your band in each skill.</li>
<li><strong>Target the gap.</strong> See exactly what <a href="${bandLink}">Band ${band}</a> needs in each section.</li>
<li><strong>Learn the strategy.</strong> Use the free <a href="/prep-lessons/">IELTS prep lessons</a> for your weak sections.</li>
<li><strong>Get feedback.</strong> Check your Writing &amp; Speaking with the free <a href="/ielts-writing-checker/">AI band checker</a> and redo weak answers.</li>
</ol></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `${esc(c.name)} — full profile`, href: `/university/${c.id}/` },
  { label: `TOEFL score for ${esc(c.name)}`, href: `/toefl-for-${c.id}/` },
  { label: `How to get IELTS Band ${band}`, href: bandLink },
  { label: "Free AI band checker", href: "/ielts-writing-checker/" },
])}`;
  emit(path, head({ title, desc, path, kw: `ielts score for ${c.name.toLowerCase()}, ielts requirement ${c.name.toLowerCase()}, ${c.name.toLowerCase()} ielts, ielts band for ${c.name.toLowerCase()}, english requirement ${c.name.toLowerCase()}, ${c.name.toLowerCase()} admission requirements`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: c.name, path: `/university/${c.id}/` }, { name: "IELTS score", path }])] }) + shell(inner));
}

// ── TOEFL / PTE score for [University] — uses the university's REAL requirement ─
const ALT_EXAMS = [{ name: "TOEFL", full: "TOEFL iBT", k: "toefl" }, { name: "PTE", full: "PTE Academic", k: "pte" }];
function altExamForUniPage(c, ex) {
  if (!c || !c.id || c[ex.k] == null) return;
  const score = c[ex.k];
  const path = `/${ex.k}-for-${c.id}/`;
  const title = `${ex.name} Score for ${esc(c.name)} — Requirement (2026) | ${BRAND}`;
  const desc = `What ${ex.full} score do you need for ${c.name} (${c.country})? Around ${ex.name} ${score}${c.ielts ? " (≈ IELTS " + c.ielts + ")" : ""}. Plus ${c.name}'s rank, fees, deadlines, programmes and a free plan to reach it.`;
  const faqs = [
    { q: `What ${ex.name} score do I need for ${c.name}?`, a: `${c.name} typically needs about ${ex.full} ${score}${c.ielts ? ", equivalent to IELTS " + c.ielts : ""}. Confirm the exact figure on the official course page.` },
    { q: `Does ${c.name} accept ${ex.name}?`, a: `Yes — ${c.name} accepts ${ex.full} alongside IELTS for English proficiency.` },
    { q: `How do I prepare for free?`, a: `Take free ${ex.full} mock tests, learn the strategy in the prep lessons, and practise writing/speaking with the free AI band checker.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/university/${c.id}/">${esc(c.name)}</a> › ${ex.name} score</p>
<section class="hero"><div class="badges"><span class="badge">${esc(c.country)}</span>${c.rank ? `<span class="badge">QS #${c.rank}</span>` : ""}<span class="badge">${ex.name} ${score}</span>${c.ielts ? `<span class="badge">≈ IELTS ${c.ielts}</span>` : ""}</div>
<h1>${ex.name} Score for ${esc(c.name)}</h1>
<p class="lead">To study at <strong>${esc(c.name)}</strong>${c.city ? " in " + esc(c.city) : ""} you typically need about <strong>${ex.full} ${score}</strong>${c.ielts ? ` (equivalent to IELTS ${c.ielts})` : ""}. Here's how to get there, free.</p>
<a class="cta" href="/mock-test/${ex.k}/">▶ Take a free ${ex.name} mock test</a></section>
${uniFacts(c)}
<div class="card"><h2>How to reach ${ex.name} ${score}</h2><ol>
<li><strong>Diagnose.</strong> Take a free <a href="/mock-test/${ex.k}/">${ex.full} mock</a> to find your weak section.</li>
<li><strong>Learn the strategy.</strong> Use the free <a href="/prep-lessons/">${ex.name} prep lessons</a>.</li>
<li><strong>Get feedback.</strong> Check your writing &amp; speaking with the free <a href="/ielts-writing-checker/">AI band checker</a>.</li>
</ol></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `${esc(c.name)} — full profile`, href: `/university/${c.id}/` },
  { label: `IELTS score for ${esc(c.name)}`, href: `/ielts-for-${c.id}/` },
  { label: `Free ${ex.name} mock test`, href: `/mock-test/${ex.k}/` },
  { label: "Score converter", href: "/tools/english-test-score-converter/" },
])}`;
  emit(path, head({ title, desc, path, kw: `${ex.name.toLowerCase()} score for ${c.name.toLowerCase()}, ${ex.name.toLowerCase()} requirement ${c.name.toLowerCase()}, ${c.name.toLowerCase()} ${ex.name.toLowerCase()}, english requirement ${c.name.toLowerCase()}`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: c.name, path: `/university/${c.id}/` }, { name: `${ex.name} score`, path }])] }) + shell(inner));
}

// ── "Scholarships to study in [Country]" pages ──────────────────────────────
function scholarshipCountryPages() {
  const byC = {};
  for (const s of SCHOLARSHIP_DATA) { const c = s.country || "Global"; (byC[c] = byC[c] || []).push(s); }
  Object.keys(byC).forEach((country) => {
    const list = byC[country];
    if (!list.length) return;
    const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const path = `/scholarships-in-${slug}/`;
    const faqs = [
      { q: `Are there scholarships to study in ${country}?`, a: `Yes — there are ${list.length} notable scholarships for international students heading to ${country}, ranging from partial tuition waivers to fully-funded awards.` },
      { q: `Are these scholarships free to apply for?`, a: `Browsing and our scholarship finder are 100% free. Each scholarship links to its official application — never pay a third party to "apply" for you.` },
    ];
    const inner = `
<p class="crumb"><a href="/">Home</a> › Scholarships in ${esc(country)}</p>
<section class="hero"><div class="badges"><span class="badge">${list.length} scholarships</span><span class="badge">${esc(country)}</span><span class="badge">2026</span></div>
<h1>Scholarships to Study in ${esc(country)}</h1>
<p class="lead">Funding for international students in ${esc(country)} — from partial awards to fully-funded scholarships. Free to browse, with eligibility and deadlines.</p>
<a class="cta" href="/#/colleges">▶ Open the free scholarship finder</a></section>
<div class="card"><h2>${list.length} scholarships for ${esc(country)}</h2>${list.map((s) => `<div class="vrow"><strong>${esc(s.name)}</strong> — ${esc(s.level || "")} · ${esc(s.type || "")} · ${esc(s.amount || "")}<br/><span class="vex">${esc(s.who || "")}${s.deadline ? " · Deadline: " + esc(s.deadline) : ""}</span></div>`).join("")}</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: "Free scholarship finder", href: "/#/colleges" },
  { label: "College predictor", href: "/#/colleges" },
  { label: `Student guide to ${country === "USA" ? "New York" : country === "Canada" ? "Toronto" : country === "Australia" ? "Sydney" : country === "UK" ? "London" : country === "Germany" ? "Berlin" : "Dublin"}`, href: "/student-city-guides/" },
  { label: "Move-abroad checklist", href: "/#/relocate" },
])}`;
    emit(path, head({ title: `Scholarships to Study in ${esc(country)} for International Students (2026) | ${BRAND}`, desc: `${list.length} scholarships to study in ${country} for international students — partial and fully-funded awards with eligibility and deadlines. Free scholarship finder.`, path, kw: `scholarships in ${country.toLowerCase()}, study in ${country.toLowerCase()} scholarships, ${country.toLowerCase()} scholarships for international students, fully funded scholarships ${country.toLowerCase()}, ${country.toLowerCase()} student funding`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `Scholarships in ${country}`, path }])] }) + shell(inner));
  });
}

// ── "[Exam] for [Country] PR / immigration" pages (very high intent) ─────────
const PR_TARGETS = [
  { exam: "IELTS", k: "ielts", country: "Canada", scheme: "Express Entry (Federal Skilled Worker)", slug: "ielts-for-canada-pr",
    levels: [["Minimum eligibility — CLB 7", "IELTS General 6.0 in each skill (L, R, W, S)", "Required to enter the Express Entry pool."], ["Strong CLB 9", "Listening 8.0, Reading 7.0, Writing 7.0, Speaking 7.0", "Earns the maximum language points in the CRS — a big score boost."]],
    tests: "IELTS General Training, CELPIP-General and PTE Core are accepted for English; TEF/TCF for French (extra points).",
    note: "Use IELTS General Training (not Academic) for Canadian PR. Higher CLB also raises your Comprehensive Ranking System (CRS) score for an invitation to apply." },
  { exam: "PTE", k: "pte", country: "Canada", scheme: "Express Entry (PTE Core)", slug: "pte-for-canada-pr",
    levels: [["Minimum — CLB 7", "PTE Core ~60 in each skill", "Eligibility for the Express Entry pool."], ["Strong — CLB 9", "PTE Core ~88 listening / 78 reading / 79 writing / 84 speaking (approx)", "Maximum language points."]],
    tests: "PTE Core is now accepted by IRCC for Express Entry alongside IELTS General and CELPIP.",
    note: "PTE Core (not PTE Academic) is the version accepted for Canadian economic immigration." },
  { exam: "IELTS", k: "ielts", country: "Australia", scheme: "Skilled Migration (189/190/491)", slug: "ielts-for-australia-pr",
    levels: [["Competent", "IELTS 6.0 in each band", "Minimum to be eligible — 0 points."], ["Proficient", "IELTS 7.0 in each band", "+10 points toward your skilled visa."], ["Superior", "IELTS 8.0 in each band", "+20 points — the maximum English points."]],
    tests: "IELTS, PTE Academic, TOEFL iBT, OET and Cambridge C1/C2 are accepted for Australian skilled migration.",
    note: "Points matter: moving from Competent to Superior English can add 20 points to your skilled-visa score." },
  { exam: "PTE", k: "pte", country: "Australia", scheme: "Skilled Migration (189/190/491)", slug: "pte-for-australia-pr",
    levels: [["Competent", "PTE Academic 50 in each skill", "Minimum eligibility — 0 points."], ["Proficient", "PTE Academic 65 in each skill", "+10 points."], ["Superior", "PTE Academic 79 in each skill", "+20 points (maximum)."]],
    tests: "PTE Academic is fully accepted for Australian skilled migration and student visas.",
    note: "PTE's fast results make it popular for Australian migration — aim for 79+ to bank the full 20 points." },
  { exam: "IELTS", k: "ielts", country: "UK", scheme: "Settlement (ILR) & Citizenship", slug: "ielts-for-uk-settlement",
    levels: [["ILR / Citizenship", "CEFR B1 — e.g. IELTS Life Skills B1 (Speaking & Listening)", "Required for indefinite leave to remain and naturalisation."], ["Some visas", "CEFR B2 or higher", "Skilled Worker and others may need a higher level."]],
    tests: "Use an approved Secure English Language Test (SELT): IELTS for UKVI / IELTS Life Skills, or another Home Office-approved provider.",
    note: "For settlement you also pass the Life in the UK test. Always book an approved UKVI SELT, not a standard IELTS." },
  { exam: "IELTS", k: "ielts", country: "New Zealand", scheme: "Skilled Migrant Category resident visa", slug: "ielts-for-new-zealand-pr",
    levels: [["Principal applicant", "IELTS General or Academic 6.5 overall (or equivalent)", "Standard English requirement for the resident visa."], ["Other evidence", "Recognised qualification or work in English", "May satisfy the requirement instead of a test."]],
    tests: "IELTS, PTE Academic, TOEFL iBT and other approved tests are accepted by Immigration New Zealand.",
    note: "Requirements change — always confirm on the Immigration New Zealand website before booking." },
  { exam: "CELPIP", k: "celpip", country: "Canada", scheme: "Express Entry (CELPIP-General)", slug: "celpip-for-canada-pr",
    levels: [["Minimum — CLB 7", "CELPIP-General 7 in each skill (Listening, Reading, Writing, Speaking)", "Eligibility for the Express Entry pool (Federal Skilled Worker)."], ["Strong — CLB 9", "CELPIP-General 9 in each skill", "Earns the maximum language points in the CRS."]],
    tests: "CELPIP-General is purpose-built for Canadian immigration and is accepted by IRCC alongside IELTS General and PTE Core.",
    note: "Use CELPIP-General (which tests all four skills) for Express Entry — not the LS version. Note: TOEFL is NOT accepted by IRCC for Express Entry." },
];
function examForPRPage(x) {
  const path = `/${x.slug}/`;
  const title = `${x.exam} Score for ${x.country} PR — ${esc(x.scheme)} Requirements (2026) | ${BRAND}`;
  const desc = `What ${x.exam} score do you need for ${x.country} PR / immigration (${x.scheme})? See the exact levels (minimum to maximum points), accepted tests and a free plan to reach your target.`;
  const rows = x.levels.map((l) => `<tr><td><strong>${esc(l[0])}</strong></td><td>${esc(l[1])}</td><td>${esc(l[2])}</td></tr>`).join("");
  const faqs = [
    { q: `What ${x.exam} score do I need for ${x.country} PR?`, a: `For ${x.scheme}: ${x.levels.map((l) => `${l[0]} = ${l[1]}`).join("; ")}. ${x.note}` },
    { q: `Which English tests are accepted for ${x.country} immigration?`, a: x.tests },
    { q: `How do I reach that score for free?`, a: `Take free ${x.exam} mock tests, learn the strategy in the prep lessons, and check your writing/speaking band with the free AI band checker.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${x.exam} for ${x.country} PR</p>
<section class="hero"><div class="badges"><span class="badge">${esc(x.country)} PR</span><span class="badge">${x.exam}</span><span class="badge">2026</span></div>
<h1>${x.exam} Score for ${x.country} PR / Immigration</h1>
<p class="lead">For <strong>${esc(x.scheme)}</strong>, your ${x.exam} score directly affects eligibility and points. ${esc(x.note)}</p>
<a class="cta" href="/mock-test/${x.k}/">▶ Take a free ${x.exam} mock test</a></section>
<div class="card"><h2>${x.exam} levels for ${x.country} immigration</h2><table class="cmp-table"><thead><tr><th>Level</th><th>${x.exam} requirement</th><th>What it means</th></tr></thead><tbody>${rows}</tbody></table><p class="note">${esc(x.tests)}</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${x.exam} mock test`, href: `/mock-test/${x.k}/` },
  { label: `${x.exam} score for ${x.country} (study)`, href: `/${x.k}-for-${x.country.toLowerCase().replace(/\s+/g, "-")}/` },
  { label: "Free AI band checker", href: "/ielts-writing-checker/" },
  { label: "Move-abroad checklist", href: "/#/relocate" },
])}`;
  emit(path, head({ title, desc, path, kw: `${x.exam.toLowerCase()} for ${x.country.toLowerCase()} pr, ${x.exam.toLowerCase()} score for ${x.country.toLowerCase()} immigration, ${x.country.toLowerCase()} pr english requirement, ${x.exam.toLowerCase()} ${x.country.toLowerCase()} express entry points, ${x.country.toLowerCase()} skilled migration english`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `${x.exam} for ${x.country} PR`, path }])] }) + shell(inner));
}

// ── IELTS for professional registration (nurses / doctors) — high intent ────
const PRO_REG = [
  { slug: "ielts-for-nurses-uk", role: "Nurses &amp; Midwives", body: "the UK Nursing and Midwifery Council (NMC)",
    req: "IELTS Academic 7.0 overall — at least 7.0 in Listening, Reading and Speaking, and 6.5 in Writing.", alt: "The NMC also accepts OET at grade B (with at least C+ in Writing).", who: "internationally-trained nurses and midwives registering to work in the UK" },
  { slug: "ielts-for-nurses-australia", role: "Nurses", body: "AHPRA / the Nursing and Midwifery Board of Australia",
    req: "IELTS Academic 7.0 in each of the four skills.", alt: "OET at grade B in each section is also accepted; results can be combined across two sittings under set conditions.", who: "nurses seeking registration to work in Australia" },
  { slug: "ielts-for-nurses-canada", role: "Nurses", body: "Canadian provincial nursing regulators (via NNAS)",
    req: "Around IELTS Academic 6.5–7.0 overall with Speaking 7.0 (requirements vary by province).", alt: "Many regulators accept CELBAN (the nursing-specific English test) or OET.", who: "internationally-educated nurses applying to practise in Canada" },
  { slug: "ielts-for-doctors-uk", role: "Doctors", body: "the General Medical Council (GMC) for UK practice (PLAB route)",
    req: "IELTS Academic 7.5 overall with at least 7.0 in each skill.", alt: "OET at grade B in each section is also accepted by the GMC.", who: "international medical graduates seeking GMC registration" },
  { slug: "ielts-for-doctors-australia", role: "Doctors", body: "AHPRA / the Medical Board of Australia",
    req: "IELTS Academic 7.0 in each of the four skills.", alt: "OET at grade B in each section is accepted.", who: "international medical graduates registering to work in Australia" },
];
function examForRolePage(x) {
  const path = `/${x.slug}/`;
  const cleanRole = x.role.replace(/&amp;/g, "&");
  const title = `IELTS for ${cleanRole} — Score Needed for ${x.body.replace(/the |\/ /g, "").slice(0, 40)} (2026) | ${BRAND}`.replace(/\s+\(/, " (");
  const desc = `What IELTS score do ${cleanRole.toLowerCase()} need? For ${x.body.replace(/&amp;/g, "&")}: ${x.req.replace(/&amp;/g, "&")} ${x.alt.replace(/&amp;/g, "&")} Free IELTS mock tests and an AI band checker to get there.`;
  const faqs = [
    { q: `What IELTS score do ${cleanRole.toLowerCase()} need?`, a: `For ${x.body.replace(/&amp;/g, "&")}: ${x.req.replace(/&amp;/g, "&")}` },
    { q: `Is OET accepted instead of IELTS?`, a: x.alt.replace(/&amp;/g, "&") },
    { q: `How can I reach this score for free?`, a: `Take free IELTS Academic mock tests, study the prep lessons, and check your Writing & Speaking band with the free AI band checker — Writing is often the hardest 7.0 to hit.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › IELTS for ${x.role}</p>
<section class="hero"><div class="badges"><span class="badge">${x.role}</span><span class="badge">Registration</span><span class="badge">2026</span></div>
<h1>IELTS Score for ${x.role}</h1>
<p class="lead">To register with ${x.body}, ${x.who} must prove English. The requirement is: <strong>${x.req}</strong></p>
<a class="cta" href="/mock-test/ielts/">▶ Take a free IELTS mock test</a></section>
<div class="card"><h2>The requirement</h2><ul>
<li><strong>IELTS:</strong> ${x.req}</li>
<li><strong>Alternative:</strong> ${x.alt}</li>
<li><strong>Use IELTS Academic</strong> (not General Training) for professional registration.</li>
</ul><p class="note">Always confirm the current rule on the official regulator's website — requirements change.</p></div>
<div class="card"><h2>How to hit your target — free</h2><ol>
<li>Take a free <a href="/mock-test/ielts/">IELTS mock</a> to find your weakest skill.</li>
<li>Most ${x.role.toLowerCase()} struggle with Writing 7.0 — use the free <a href="/ielts-writing-checker/">AI band checker</a> for criterion feedback.</li>
<li>Learn the strategy in the free <a href="/prep-lessons/">IELTS prep lessons</a>.</li>
<li>See exactly what <a href="/ielts-band-7/">Band 7</a> needs in each section.</li>
</ol></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
  { label: "Free AI band checker", href: "/ielts-writing-checker/" },
  { label: "How to get IELTS Band 7 in Writing", href: "/ielts-band-7-writing/" },
  { label: "IELTS prep lessons", href: "/prep-lessons/" },
])}`;
  emit(path, head({ title, desc, path, kw: `ielts for ${cleanRole.toLowerCase()}, ielts score for ${cleanRole.toLowerCase()}, ielts requirement ${cleanRole.toLowerCase()}, ${x.slug.replace(/-/g, " ")}, oet vs ielts ${cleanRole.toLowerCase()}`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `IELTS for ${cleanRole}`, path }])] }) + shell(inner));
}

function testFinderPage() {
  const path = `/which-english-test/`;
  const faqs = [
    { q: "Which English test is the easiest?", a: "It depends on your strengths and destination. PTE and Duolingo are fully computer-scored and fast; IELTS has a real-person speaking test; TOEFL is the US favourite. Our free quiz recommends one based on your answers." },
    { q: "IELTS or TOEFL — which should I take?", a: "Choose TOEFL for the USA or if you prefer an all-computer test; choose IELTS for the UK, Australia, Canada, Ireland and the widest global acceptance." },
    { q: "Is the Duolingo English Test accepted?", a: "Yes — thousands of universities accept the Duolingo English Test. It's the cheapest and fastest option, but always confirm your specific university accepts it." },
    { q: "Which test is best for Canada PR?", a: "For Canadian Express Entry, IRCC accepts IELTS General, CELPIP-General and PTE Core (not TOEFL). CELPIP is purpose-built for Canada." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › Which English Test?</p>
<section class="hero"><div class="badges"><span class="badge">Free quiz</span><span class="badge">4 questions</span><span class="badge">Instant result</span></div>
<h1>Which English Test Should I Take? IELTS vs TOEFL vs PTE vs Duolingo</h1>
<p class="lead">Not sure whether to take IELTS, TOEFL, PTE, Duolingo or CELPIP? Answer 4 quick questions about your destination, goal and preferences and get a personalised recommendation — with the reasons why. 100% free.</p>
<a class="cta" href="/#/which-english-test">▶ Take the free quiz</a></section>
<div class="card"><h2>A quick comparison</h2><table class="cmp-table"><thead><tr><th>Test</th><th>Best for</th><th>Speaking</th><th>Results</th></tr></thead><tbody>
<tr><td><strong>IELTS</strong></td><td>UK, Australia, Canada, worldwide</td><td>Real examiner</td><td>3–13 days</td></tr>
<tr><td><strong>TOEFL iBT</strong></td><td>USA</td><td>Computer (AI+human)</td><td>4–8 days</td></tr>
<tr><td><strong>PTE Academic</strong></td><td>Australia, fast results</td><td>Computer (AI)</td><td>~48 hours</td></tr>
<tr><td><strong>Duolingo</strong></td><td>Cheap & fast, many universities</td><td>Computer (AI)</td><td>~2 days</td></tr>
<tr><td><strong>CELPIP</strong></td><td>Canadian PR &amp; citizenship</td><td>Computer</td><td>4–5 days</td></tr>
</tbody></table></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: "Take the quiz", href: "/#/which-english-test" },
  { label: "IELTS vs TOEFL", href: "/ielts-vs-toefl/" },
  { label: "IELTS vs PTE", href: "/ielts-vs-pte/" },
  { label: "Free mock tests", href: "/#/exam-prep" },
])}`;
  emit(path, head({
    title: `Which English Test Should I Take? IELTS vs TOEFL vs PTE vs Duolingo — Free Quiz | ${BRAND}`,
    desc: `Free quiz: answer 4 questions and get a personalised recommendation — IELTS, TOEFL, PTE, Duolingo or CELPIP — for your country, study/PR goal and preferences.`,
    path, kw: "which english test should i take, ielts or toefl, ielts vs toefl vs pte, which english test is easiest, best english test for study abroad, which english test for canada pr, english test recommender",
    jsonLdBlocks: [
      { "@context": "https://schema.org", "@type": "WebApplication", name: "Which English Test Should I Take?", applicationCategory: "EducationalApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
      faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Which English Test?", path }]),
    ],
  }) + shell(inner));
}

Object.keys(LANG_SEO).forEach(languageLandingPage);
prepLessonsPage();
bandCheckerPage("writing");
bandCheckerPage("speaking");
testFinderPage();
vocabularyPages();
BANDS.forEach(bandPage);
cityGuidePages();
BANDS.filter((b) => SEC_RAW[b.b]).forEach((b) => SECTIONS.forEach((sec) => bandSectionPage(b, sec)));
EXAM_COUNTRY.forEach(examForCountryPage);
EXAM_VS.forEach(examVsExamPage);

// ── "Free alternative to [competitor]" comparison pages ──────────────────────
// Honest, fair comparisons targeting high-intent "[brand] alternative" / "free
// [brand]" searches. Competitor facts are kept neutral and accurate (no false
// claims); our only angle is that LandingPrep is 100% free. These are standalone
// prerendered SEO pages — they never touch the React app UI, so the product
// stays clean. All are linked from the footer hub (no crawl-orphans).
const LP_CMP = {
  price: "100% free, forever — no paywall, no card",
  mocks: "Unlimited free full-length mock tests",
  ai: "Free AI speaking partner + essay feedback",
  signup: "None — start instantly",
  predictor: "Free — 99 universities, by your profile",
  sop: "Free SOP builder + sample library",
};
const lpPitch = (kind) => kind === "exam"
  ? `${BRAND} gives you unlimited full-length mock tests with real exam timing, instant scoring and an AI speaking partner that talks back — across IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE and GMAT. There is no paywall and no signup, so you can start practising in seconds.`
  : `${BRAND} gives you a free college predictor across 99 universities, an SOP builder with samples, a scholarship finder and free exam mock tests — everything to go from shortlisting to admission without paying for counselling, and with no signup.`;
const COMPETITORS = [
  { slug: "magoosh", name: "Magoosh", what: "GRE, GMAT, IELTS & TOEFL prep", kind: "exam", exams: ["gre", "gmat", "ielts", "toefl"], coverShort: "GRE, GMAT, IELTS, TOEFL",
    their: { price: "Paid subscription (time-limited plans)", mocks: "Included in paid plan", ai: "Practice + scores; no live speaking partner", signup: "Account + payment", coverage: "GRE, GMAT, IELTS, TOEFL, SAT/ACT" },
    intro: "Magoosh is a well-known online test-prep company offering video lessons, practice questions and mock tests for the GRE, GMAT, IELTS and TOEFL, sold as time-limited paid subscriptions.",
    freeAnswer: "Magoosh offers a few free sample lessons and questions, but full access (lessons, practice sets and mock tests) requires a paid subscription.", paidPerk: "structured video courses and score guarantees" },
  { slug: "e2-test-prep", name: "E2 Test Prep", what: "IELTS, PTE & TOEFL prep", kind: "exam", exams: ["ielts", "pte", "toefl"], coverShort: "IELTS, PTE, TOEFL",
    their: { price: "Freemium (free videos + paid plans/classes)", mocks: "Some free; full mocks paid", ai: "Yes, in paid tiers", signup: "Account required", coverage: "IELTS, PTE, TOEFL, OET" },
    intro: "E2 (E2 Test Prep / E2 Language) offers YouTube lessons, live classes and practice for IELTS, PTE, TOEFL and OET, with free content plus paid subscriptions and live tutoring.",
    freeAnswer: "E2 has plenty of free YouTube lessons, but full mock tests, scored practice and live classes are part of its paid plans.", paidPerk: "live classes with teachers" },
  { slug: "apeuni", name: "APEUni", what: "PTE practice", kind: "exam", exams: ["pte"], coverShort: "PTE",
    their: { price: "Freemium (free practice + paid VIP)", mocks: "Practice free; scored mocks paid (VIP)", ai: "AI scoring in VIP", signup: "Account required", coverage: "PTE (some IELTS)" },
    intro: "APEUni is a widely-used PTE practice app with a large free question bank and a paid VIP tier for AI scoring and full mock tests.",
    freeAnswer: "APEUni's question bank is free to practise, but AI scoring and full scored mock tests require its paid VIP plan.", paidPerk: "detailed AI scoring on every task" },
  { slug: "kaplan", name: "Kaplan", what: "GRE, GMAT & TOEFL courses", kind: "exam", exams: ["gre", "gmat", "toefl"], coverShort: "GRE, GMAT, TOEFL",
    their: { price: "Paid courses (self-paced & live)", mocks: "Included in paid course", ai: "Limited", signup: "Account + payment", coverage: "GRE, GMAT, GMAT Focus, TOEFL, SAT/ACT/MCAT +" },
    intro: "Kaplan is a long-established test-prep company offering self-paced and live online courses, books and practice tests for the GRE, GMAT, TOEFL and many other exams, sold as paid packages.",
    freeAnswer: "Kaplan runs free practice events and sample tests occasionally, but its courses and full question banks are paid.", paidPerk: "live online classes and prep books" },
  { slug: "prepscholar", name: "PrepScholar", what: "GRE online prep", kind: "exam", exams: ["gre"], coverShort: "GRE",
    their: { price: "Paid subscription", mocks: "Included in paid plan", ai: "Adaptive lessons (paid)", signup: "Account + payment", coverage: "GRE, SAT, ACT" },
    intro: "PrepScholar offers an adaptive online GRE program with lessons and practice, sold as a paid subscription.",
    freeAnswer: "PrepScholar has free blog guides, but its adaptive GRE program and practice sets are paid.", paidPerk: "adaptive lesson sequencing" },
  { slug: "jamboree", name: "Jamboree Education", what: "GRE, GMAT & IELTS coaching", kind: "exam", exams: ["gre", "gmat", "ielts"], coverShort: "GRE, GMAT, IELTS",
    their: { price: "Paid classroom & online coaching", mocks: "Included with coaching", ai: "No", signup: "Enrolment / payment", coverage: "GRE, GMAT, IELTS, TOEFL, SAT + counselling" },
    intro: "Jamboree is a well-known Indian coaching institute offering classroom and online courses for the GRE, GMAT, IELTS, TOEFL and SAT, plus admissions counselling, as paid programs.",
    freeAnswer: "Jamboree offers free sample tests and webinars, but its coaching courses are paid.", paidPerk: "classroom coaching and admissions counselling" },
  { slug: "greedge", name: "GREedge", what: "personalised GRE prep", kind: "exam", exams: ["gre"], coverShort: "GRE",
    their: { price: "Paid personalised plans", mocks: "Included", ai: "Mentor-led", signup: "Enrolment / payment", coverage: "GRE + admissions support" },
    intro: "GREedge offers personalised, mentor-led online GRE preparation for Indian students as paid plans.",
    freeAnswer: "GREedge provides free diagnostic sessions, but its personalised GRE program is paid.", paidPerk: "a dedicated mentor and study plan" },
  { slug: "ielts-liz", name: "IELTS Liz", what: "free IELTS tips & lessons", kind: "exam", exams: ["ielts"], coverShort: "IELTS",
    their: { price: "Free tips/blog + some paid lessons", mocks: "No full timed mock platform", ai: "No", signup: "No (free content)", coverage: "IELTS only" },
    intro: "IELTS Liz is a popular free website with excellent IELTS tips, model answers and lessons from an experienced teacher (plus some paid advanced lessons). It is a learning resource rather than a full timed mock-test platform.",
    freeAnswer: "Yes — IELTS Liz's tips and lessons are largely free; a few advanced lessons are paid. It is great for learning, but it is not a timed mock-test platform.", paidPerk: "in-depth model-answer lessons" },
  { slug: "yocket", name: "Yocket", what: "study-abroad community & counselling", kind: "abroad",
    their: { price: "Free community + paid premium services", predictor: "Shortlisting (free) + paid counselling", sop: "Paid / counsellor-led", mocks: "Not a test-prep tool", signup: "Account required" },
    intro: "Yocket is a popular Indian study-abroad platform with a student community, university shortlisting, admits data and paid premium counselling and services.",
    freeAnswer: "Yocket's community and basic shortlisting are free, but premium counselling, applications and add-on services are paid.", paidPerk: "1-on-1 counselling and admits data" },
  { slug: "leverage-edu", name: "Leverage Edu", what: "study-abroad consultancy", kind: "abroad",
    their: { price: "Free content + paid counselling packages", predictor: "Counsellor-led (paid)", sop: "Paid / counsellor-led", mocks: "Paid test prep", signup: "Account required" },
    intro: "Leverage Edu is an Indian study-abroad consultancy offering university selection, application support, loans and test prep through free content and paid counselling packages.",
    freeAnswer: "Leverage Edu publishes lots of free content, but its core application support and counselling are paid packages.", paidPerk: "end-to-end counselling and application handling" },
  { slug: "collegedunia", name: "Collegedunia", what: "college & exam info portal", kind: "abroad",
    their: { price: "Free (ad / lead-supported)", predictor: "College finder (lead forms)", sop: "Not offered", mocks: "Not offered", signup: "Optional" },
    intro: "Collegedunia is a large Indian education portal with college listings, reviews, fees and exam information, supported by advertising and lead generation.",
    freeAnswer: "Collegedunia is free to browse; it makes money from ads and by passing your details to colleges and consultants as leads.", paidPerk: "a huge directory of college listings and reviews" },
  { slug: "shiksha-study-abroad", name: "Shiksha Study Abroad", what: "study-abroad info portal", kind: "abroad",
    their: { price: "Free (lead generation)", predictor: "Listings + counselling leads", sop: "Not offered", mocks: "Not offered", signup: "Optional" },
    intro: "Shiksha Study Abroad is an Indian portal with university and course information, rankings and counselling, monetised through lead generation.",
    freeAnswer: "Shiksha is free to use; like most portals it monetises by sharing your enquiry with universities and counsellors.", paidPerk: "broad university and course information" },
  { slug: "admitkard", name: "AdmitKard", what: "study-abroad guidance", kind: "abroad",
    their: { price: "Free content + paid services", predictor: "Shortlisting + counsellor (paid)", sop: "Paid / counsellor-led", mocks: "Paid test prep", signup: "Account required" },
    intro: "AdmitKard is an Indian study-abroad platform offering university shortlisting, application help, loans and counselling through free tools and paid services.",
    freeAnswer: "AdmitKard has free tools and content, but mentor guidance, applications and add-on services are paid.", paidPerk: "mentor matching and application support" },
];
function alternativePage(c) {
  const path = `/${c.slug}-alternative/`;
  const name = c.name;
  const title = `Free ${name} Alternative (2026) — ${c.what} | ${BRAND}`;
  const desc = `Looking for a free ${name} alternative? ${BRAND} is 100% free — ${c.kind === "exam" ? "unlimited mock tests, instant scoring and AI feedback" : "a free college predictor, SOP builder and scholarship finder"}, no signup. See the side-by-side comparison.`;
  const rows = c.kind === "exam"
    ? [["Price", LP_CMP.price, c.their.price], ["Full-length mock tests", LP_CMP.mocks, c.their.mocks], ["AI feedback", LP_CMP.ai, c.their.ai], ["Sign-up needed", LP_CMP.signup, c.their.signup], ["Covers", c.coverShort + " + more", c.their.coverage]]
    : [["Price", LP_CMP.price, c.their.price], ["Free college predictor", LP_CMP.predictor, c.their.predictor], ["Free SOP builder", LP_CMP.sop, c.their.sop], ["Free exam mock tests", LP_CMP.mocks, c.their.mocks], ["Sign-up needed", LP_CMP.signup, c.their.signup]];
  const table = `<div class="card"><h2>${esc(name)} vs ${BRAND} at a glance</h2><table class="cmp-table"><thead><tr><th></th><th>${BRAND}</th><th>${esc(name)}</th></tr></thead><tbody>${rows.map((r) => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>`;
  const faqs = [
    { q: `Is there a free alternative to ${name}?`, a: `Yes — ${BRAND} (landingprep.com) is 100% free. ${c.kind === "exam" ? `You get unlimited full-length mock tests, instant scoring and an AI speaking partner for ${c.coverShort}, with no signup.` : `You get a free college predictor, SOP builder, scholarship finder and exam mock tests, with no signup.`}` },
    { q: `Is ${name} free?`, a: c.freeAnswer },
    { q: `Why choose ${BRAND} over ${name}?`, a: `If cost is your priority, ${BRAND} gives you ${c.kind === "exam" ? "the core practice you need — real-timing mock tests and AI feedback" : "the core tools you need — a predictor, SOP builder and scholarships"} entirely free. ${name} is a strong option too; the right pick depends on whether you want paid extras like ${c.paidPerk}.` },
  ];
  const related = c.kind === "exam"
    ? [...(c.exams || []).slice(0, 2).map((e) => ({ label: `Free ${e.toUpperCase()} mock test`, href: `/mock-test/${e}/` })), { label: "Score converter", href: "/tools/english-test-score-converter/" }, { label: "Study & exam blog", href: "/blog/" }]
    : [{ label: "Free college predictor", href: "/#/colleges" }, { label: "Free scholarship finder", href: "/#/colleges" }, { label: "Free IELTS mock test", href: "/mock-test/ielts/" }, { label: "Study-abroad blog", href: "/blog/" }];
  const ctaHref = c.kind === "exam" ? `/mock-test/${(c.exams && c.exams[0]) || "ielts"}/` : "/#/colleges";
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/free-alternatives/">Free alternatives</a> › ${esc(name)}</p>
<section class="hero"><div class="badges"><span class="badge">Free alternative</span><span class="badge">${esc(name)}</span><span class="badge">2026</span></div>
<h1>Free ${esc(name)} Alternative: ${BRAND}</h1>
<p class="lead">${esc(c.intro)} If you want a 100% free option, here is how ${BRAND} compares.</p>
<a class="cta" href="${ctaHref}">▶ ${c.kind === "exam" ? "Try a free mock test" : "Open the free college predictor"}</a></section>
${table}
<div class="card"><h2>What you get free on ${BRAND}</h2><p>${esc(lpPitch(c.kind))}</p></div>
${faqBlock(faqs)}
${relatedGrid(related)}`;
  const lc = name.toLowerCase();
  const kw = `${c.slug} alternative, free ${c.slug} alternative, ${lc} alternative, ${lc} free alternative, is ${lc} free, ${lc} vs landingprep, free alternative to ${lc}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Free alternatives", path: "/free-alternatives/" }, { name: name, path }])] }) + shell(inner));
}
function altIndexPage() {
  const tiles = COMPETITORS.map((c) => `<a class="tile" href="/${c.slug}-alternative/">Free ${esc(c.name)} alternative</a>`).join("");
  const inner = `
<p class="crumb"><a href="/">Home</a> › Free alternatives</p>
<section class="hero"><div class="badges"><span class="badge">100% free</span><span class="badge">No signup</span></div>
<h1>Free Alternatives to Popular Exam-Prep &amp; Study-Abroad Tools</h1>
<p class="lead">${BRAND} is a 100% free alternative to paid test-prep and study-abroad platforms — unlimited mock tests, AI feedback, a college predictor, SOP builder and scholarship finder, all with no signup. Compare us with the tools you already know.</p></section>
<div class="card"><h2>Compare ${BRAND} with…</h2><div class="grid">${tiles}</div></div>`;
  emit("/free-alternatives/", head({ title: `Free Alternatives to Magoosh, Yocket, Leverage Edu &amp; More (2026) | ${BRAND}`, desc: `${BRAND} is a free alternative to paid exam-prep and study-abroad platforms — free mock tests, AI feedback, college predictor and SOP tools, no signup.`, path: "/free-alternatives/", kw: "free exam prep alternative, free study abroad tool, magoosh alternative free, yocket alternative, leverage edu alternative, free ielts practice alternative", jsonLdBlocks: [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Free alternatives", path: "/free-alternatives/" }])] }) + shell(inner));
}
COMPETITORS.forEach(alternativePage);
altIndexPage();
COLLEGES.forEach(examForUniPage);
COLLEGES.forEach((c) => ALT_EXAMS.forEach((ex) => altExamForUniPage(c, ex)));
scholarshipCountryPages();
PR_TARGETS.forEach(examForPRPage);
PRO_REG.forEach(examForRolePage);

// ── Hub / topic-cluster pages (run LAST: group already-emitted spokes) ──────────
function labelOf(html) {
  let t = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]
       || (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  return t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s*\|\s*LandingPrep.*$/i, "")
          .replace(/\s*\(2026\)\s*/g, " ").replace(/\s+/g, " ").trim().slice(0, 95);
}
function hubPage(path, title, desc, kw, sections) {
  if (PAGES.some((p) => p.path === path)) return [];
  const total = sections.reduce((n, s) => n + s.links.length, 0);
  if (!total) return [];
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${esc(title)}</p>
<section class="hero"><div class="badges"><span class="badge">100% free</span><span class="badge">${total} pages</span></div>
<h1>${esc(title)}</h1><p class="lead">${esc(desc)}</p></section>
${sections.filter((s) => s.links.length).map((s) => `<div class="card"><h2>${esc(s.h)}</h2><div class="grid">${s.links.map((l) => `<a class="tile" href="${l.href}">${esc(l.label)}</a>`).join("")}</div></div>`).join("")}
<div class="card"><h2>More free LandingPrep hubs</h2><div class="grid">${HUB_LINKS.filter((h) => h.href !== path).map((h) => `<a class="tile" href="${h.href}">${esc(h.label)}</a>`).join("")}</div></div>`;
  // ItemList structured data → eligible for list/carousel treatment in search results.
  const allLinks = sections.flatMap((s) => s.links);
  const itemList = jsonld({
    "@context": "https://schema.org", "@type": "ItemList", name: title, numberOfItems: allLinks.length,
    itemListElement: allLinks.slice(0, 100).map((l, i) => ({ "@type": "ListItem", position: i + 1, url: ORIGIN + l.href, name: l.label })),
  });
  emit(path, head({ title: `${title} (2026) | ${BRAND}`, desc, path, kw, jsonLdBlocks: [itemList, breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: title, path }])] }) + shell(inner));
  return sections.flatMap((s) => s.links.map((l) => l.href));
}
// ── Pillar / hub content pages (prose + FAQ schema + internal links) ──────────
// Emitted BEFORE buildHubs() so /explore/ picks them up (zero orphans). Each links
// only to verified-existing pages so the link audit stays green.
// Hub → blog internal linking: surface the 6 blog posts most relevant to a hub's
// keywords, so authority flows down from pillar hubs into the article cluster.
const HUB_STOP = new Set(["study","abroad","free","best","guide","university","universities","without","your","with","exam","test","2026","india","indian","students","student","online","find","should","take","which","what","cost","tips","top"]);
function hubRelated(kw, title) {
  const words = new Set((String(kw || "") + " " + String(title || "")).toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3 && !HUB_STOP.has(w)));
  const score = (p) => {
    const hay = (p.title + " " + (p.kw || "")).toLowerCase();
    let s = 0;
    for (const w of words) if (hay.includes(w)) s++;
    return s;
  };
  const ranked = BLOG_EXTRA.map((p) => ({ p, s: score(p) })).filter((x) => x.s >= 2).sort((a, b) => b.s - a.s).slice(0, 6).map((x) => x.p);
  if (!ranked.length) return "";
  return `<section class="related-articles"><h2>Related articles</h2><ul class="rel-list">${ranked.map((p) => `<li><a href="/blog/${p.id}/">${esc(p.title)}</a></li>`).join("")}</ul></section>`;
}

function contentHub({ path, title, desc, kw, lead, sections, faqs, related }) {
  const secHtml = sections.map((s) => `<div class="card"><h2>${esc(s.h)}</h2><p>${esc(s.body)}</p></div>`).join("");
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${esc(title)}</p>
<section class="hero"><div class="badges"><span class="badge">100% free</span><span class="badge">No signup</span></div>
<h1>${esc(title)}</h1><p class="lead">${esc(lead || desc)}</p></section>
${secHtml}
${faqs && faqs.length ? faqBlock(faqs) : ""}
${hubRelated(kw, title)}
<div class="card">${relatedGrid(related)}</div>`;
  const blocks = [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: title, path }])];
  if (faqs && faqs.length) blocks.unshift(faqJsonLd(faqs));
  emit(path, head({ title: `${title} (2026) | ${BRAND}`, desc, path, kw, jsonLdBlocks: blocks }) + shell(inner));
}
const CONTENT_HUBS = [
  { path: "/study-abroad-without-ielts/", title: "Study Abroad Without IELTS — Country & University Guide",
    desc: "How to study abroad without IELTS in 2026 — MOI letters, English-medium study and accepted alternatives like Duolingo, PTE and TOEFL, by country. 100% free.",
    kw: "study abroad without ielts, universities without ielts, study in canada without ielts, study in usa without ielts, moi letter, duolingo instead of ielts",
    lead: "You don't always need IELTS to study abroad. Here are the legitimate routes — MOI letters, prior English-medium study and accepted alternative tests — and how to use them safely.",
    sections: [
      { h: "When IELTS can be waived", body: "Many universities accept a Medium of Instruction (MOI) letter, completion of English-medium study, or an alternative test in place of IELTS. Crucially, a university waiver is not always a visa waiver — some countries' student-visa rules still require a recognised English test, so confirm both the university and the immigration requirement for your destination." },
      { h: "Accepted alternatives to IELTS", body: "The Duolingo English Test, PTE Academic and TOEFL iBT are widely accepted and may suit you better than IELTS. Duolingo is cheaper and taken at home; PTE is computer-scored and fast. Choose the test that fits your strengths and is accepted by both your university and visa authority." },
      { h: "Which countries are flexible", body: "Germany (especially German-taught or MOI programmes), several universities in Canada and Australia, and parts of Europe offer pathways without IELTS — sometimes via a conditional offer or a short pre-sessional English course. Always verify the rule with the specific programme before you rely on it." },
    ],
    faqs: [
      { q: "Can I study in Canada without IELTS?", a: "Some Canadian universities accept an MOI letter, prior English-medium study, or alternative tests (Duolingo, PTE, TOEFL). However, study-permit rules may still expect a recognised test, so confirm both the university and IRCC requirements." },
      { q: "Which test is easiest to take instead of IELTS?", a: "The Duolingo English Test is the most convenient — online, at home and lower cost — and is accepted by thousands of universities. PTE Academic and TOEFL iBT are also widely accepted." },
      { q: "Is a university IELTS waiver the same as a visa waiver?", a: "No. A university may waive IELTS while the country's student-visa rules still require a recognised English test. Always check both before assuming you can skip the test." },
    ],
    related: [
      { href: "/mock-test/duolingo/", label: "Free Duolingo English Test Practice" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
      { href: "/study-abroad/top-universities-in-canada/", label: "Top Universities in Canada" },
      { href: "/practice/ielts/", label: "Free IELTS Practice" },
      { href: "/blog/", label: "Study Abroad Blog" },
    ] },
  { path: "/scholarships-for-indian-students/", title: "Scholarships for Indian Students — Find & Win Funding",
    desc: "Free hub of scholarships for Indian students 2026 — fully funded, merit and country schemes, plus how to apply and win. Links to every LandingPrep scholarship guide.",
    kw: "scholarships for indian students, fully funded scholarships, study abroad scholarships india, merit scholarships, how to get scholarship to study abroad",
    lead: "A complete, free hub of scholarships for Indian students — the main types, where to search, what wins funding, and links to detailed country guides.",
    sections: [
      { h: "Types of scholarship", body: "Funding falls into a few buckets: fully funded (tuition plus living and travel, like Chevening, Fulbright, DAAD and Australia Awards), merit-based university scholarships, need-based aid, and government schemes. Apply to several types to maximise your odds." },
      { h: "Where to search", body: "Start with each university's own financial-aid pages — often the biggest source — then government schemes and reputable databases. Never pay a fee to 'apply' for a scholarship; legitimate scholarships do not charge application fees." },
      { h: "What wins funding", body: "A clear academic record, a compelling SOP and essays, strong recommendation letters, relevant experience, and a good English-test score. Many scholarships weight the essays heavily, so invest your time there and apply well before the deadline." },
    ],
    faqs: [
      { q: "Which scholarships are fully funded for Indian students?", a: "Chevening (UK), Fulbright (USA), DAAD (Germany) and Australia Awards are well-known fully funded options covering tuition and living costs. Many universities also offer their own full or partial scholarships." },
      { q: "Do I need IELTS for a scholarship?", a: "Most scholarships and the universities behind them require a recognised English test such as IELTS, PTE or TOEFL. A higher score improves both your admission and scholarship chances." },
      { q: "When should I apply for scholarships?", a: "Major scholarships open months before the intake and have hard deadlines, often before university decisions. Build a deadline calendar and apply early." },
    ],
    related: [
      { href: "/scholarships/study-in-canada/", label: "Scholarships to Study in Canada" },
      { href: "/scholarships/study-in-uk/", label: "Scholarships to Study in the UK" },
      { href: "/scholarships/study-in-usa/", label: "Scholarships to Study in the USA" },
      { href: "/scholarships/study-in-germany/", label: "Scholarships to Study in Germany" },
      { href: "/scholarships/study-in-australia/", label: "Scholarships to Study in Australia" },
    ] },
  { path: "/cheapest-study-abroad-countries/", title: "Cheapest Countries to Study Abroad (Tuition + Living)",
    desc: "The cheapest countries to study abroad in 2026 ranked by tuition and living cost — tuition-free Germany, affordable Europe and Asia. Free study-abroad guide.",
    kw: "cheapest countries to study abroad, study abroad on a budget, cheapest country for masters, study in germany free, affordable study abroad",
    lead: "Where to get a quality international degree on a budget — ranked by total cost of tuition plus living, with the trade-offs to weigh.",
    sections: [
      { h: "Germany — best overall value", body: "Public universities in Germany charge only small semester fees (often €150–350), even for international students, including many English-taught master's programmes. You mainly budget for living costs via a blocked account (around €11,900/year). It is the standout value among top destinations." },
      { h: "Affordable Europe", body: "Several Central and Eastern European countries — Poland, Czechia and others — offer English-taught degrees at modest tuition (often €2,000–5,000/year) with lower living costs than Western Europe. Good value for engineering, IT and medicine." },
      { h: "Budget realistically", body: "Compare total cost — tuition plus living, visa, insurance and travel — not tuition alone. A 'cheap' country with high living costs can cost more overall than a moderate-tuition country with low living costs. Scholarships can make even pricier destinations affordable." },
    ],
    faqs: [
      { q: "Is studying in Germany really free?", a: "Most public universities in Germany charge little or no tuition even for international students; you mainly pay small semester fees and budget for living costs. Some private universities and a few states differ, so confirm per programme." },
      { q: "What is the cheapest country for a master's degree?", a: "Germany is the best value among top destinations thanks to low or no tuition. Parts of Central and Eastern Europe and some Asian hubs are also affordable when you include living costs." },
    ],
    related: [
      { href: "/study-abroad/top-universities-in-germany/", label: "Top Universities in Germany" },
      { href: "/study-abroad/top-universities-in-canada/", label: "Top Universities in Canada" },
      { href: "/scholarships/study-in-germany/", label: "Scholarships to Study in Germany" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
      { href: "/blog/", label: "Study Abroad Blog" },
    ] },
  { path: "/ms-in-canada/", title: "MS in Canada — Programs, Fees, Cutoffs & PR Pathway",
    desc: "A free guide to an MS in Canada for 2026 — programmes, fees, IELTS/GPA cutoffs, PGWP work permit and the route to PR. Practise IELTS/CELPIP free.",
    kw: "ms in canada, masters in canada, ms in canada for indian students, ielts for canada, pgwp, canada pr after study",
    lead: "Everything for an MS in Canada in one place — typical fees, English and GPA cutoffs, the post-study work permit, and the student-to-PR pathway.",
    sections: [
      { h: "Fees and entry requirements", body: "Master's tuition for international students typically runs higher than domestic, varying widely by university and programme. Most universities want IELTS around 6.5 (no band below 6.0) or equivalent PTE/TOEFL, plus a strong GPA and, for some programmes, GRE. Confirm exact cutoffs per programme." },
      { h: "Post-Graduation Work Permit (PGWP)", body: "A PGWP gives up to three years of open work rights after graduating from an eligible programme at a designated learning institution. Recent rules tie PGWP more closely to fields with labour shortages and added language-test requirements, so check your specific programme's eligibility before enrolling." },
      { h: "The route to PR", body: "Canada offers one of the clearest student-to-PR pathways via Express Entry, where a high IELTS or CELPIP score adds valuable CRS points. Target a PGWP-eligible programme, keep your English score high, and plan your Express Entry profile early." },
    ],
    faqs: [
      { q: "What IELTS score do I need for an MS in Canada?", a: "Most universities want around IELTS 6.5 overall with no band below 6.0, though competitive programmes may ask for 7.0. Confirm the exact requirement for your programme." },
      { q: "Can I get PR after an MS in Canada?", a: "Yes — many graduates use the Post-Graduation Work Permit to gain work experience, then apply for permanent residence through Express Entry, where a high English score boosts your CRS points." },
    ],
    related: [
      { href: "/study-abroad/top-universities-in-canada/", label: "Top Universities in Canada" },
      { href: "/ielts-for-canada-pr/", label: "IELTS for Canada PR" },
      { href: "/scholarships/study-in-canada/", label: "Scholarships to Study in Canada" },
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/mock-test/duolingo/", label: "Free Duolingo Practice" },
    ] },
  { path: "/fully-funded-scholarships/", title: "Fully Funded Scholarships to Study Abroad",
    desc: "Free guide to fully funded scholarships for 2026 — what 'fully funded' covers, the major schemes (Chevening, Fulbright, DAAD), and how to win one.",
    kw: "fully funded scholarships, fully funded scholarships 2026, chevening fulbright daad, study abroad fully funded, scholarship with stipend",
    lead: "Fully funded scholarships cover tuition and living costs — sometimes travel too. Here's what they include, the biggest schemes, and how to build a winning application.",
    sections: [
      { h: "What 'fully funded' means", body: "A fully funded scholarship typically covers tuition plus a living stipend, and often travel and insurance. Some are government-funded (Chevening, Fulbright, DAAD, Australia Awards); others are university or foundation scholarships. Read the fine print on what each one actually pays." },
      { h: "How to win one", body: "Strong essays and a clear story of impact matter most. Show academic ability, leadership or relevant experience, a concrete plan, and how you will contribute. A good English-test score is usually required and strengthens your case." },
      { h: "Apply early and widely", body: "Fully funded schemes are competitive with hard, early deadlines. Apply to several, tailor each application, and secure strong recommendation letters well in advance." },
    ],
    faqs: [
      { q: "What does a fully funded scholarship cover?", a: "Usually tuition plus a living stipend, and often travel and health insurance. Exact coverage varies, so check each scholarship's terms." },
      { q: "Are fully funded scholarships hard to get?", a: "They are competitive, but a strong academic record, compelling essays, good recommendations and a solid test score make you a serious candidate. Applying early and to several schemes improves your odds." },
    ],
    related: [
      { href: "/scholarships-for-indian-students/", label: "Scholarships for Indian Students" },
      { href: "/scholarships/study-in-uk/", label: "Scholarships to Study in the UK" },
      { href: "/scholarships/study-in-usa/", label: "Scholarships to Study in the USA" },
      { href: "/scholarships/study-in-germany/", label: "Scholarships to Study in Germany" },
      { href: "/blog/", label: "Study Abroad Blog" },
    ] },
  { path: "/gre-quant-160/", title: "GRE Quant 160+: Strategy, Traps & Free Practice",
    desc: "How to score 160+ on GRE Quant in 2026 — the fundamentals to master, the question types and traps, and timed practice. Free GRE Quant practice with solutions.",
    kw: "gre quant 160, how to score 160 gre quant, gre quant tips, gre quantitative practice, gre quant 170 strategy, free gre quant practice",
    lead: "GRE Quant is very learnable — the maths is high-school level, so the challenge is speed, careful reading and avoiding traps. Here's how to reach 160+.",
    sections: [
      { h: "Master the fundamentals", body: "Revise arithmetic, algebra, ratios, percentages, exponents, geometry and basic statistics until they are automatic. Most lost points on GRE Quant come from misreading the question or arithmetic slips under time pressure — not from genuinely hard maths." },
      { h: "Know the question types and traps", body: "Drill Quantitative Comparison, multiple-answer and numeric-entry questions. Quantitative Comparison rewards reasoning over calculation; watch for cases where the answer depends on unstated values (the 'cannot be determined' trap). Always check whether negatives, zero or fractions change the result." },
      { h: "Build speed with timed practice", body: "The section is time-pressured and adaptive, so pacing matters. Practise full, timed sets, learn when to mark and move on, and review every miss to find recurring patterns. Use free GRE Quant practice with worked solutions to target your weak spots." },
    ],
    faqs: [
      { q: "Is 160 a good GRE Quant score?", a: "A 160 in Quant is a strong, competitive score for many programmes; technical and quantitative programmes may expect higher. Combined with a balanced Verbal score it puts you in good standing." },
      { q: "How long does it take to reach GRE Quant 160?", a: "With consistent daily practice, many test-takers reach 160+ in 4–8 weeks because the content is high-school maths — the gains come from speed, accuracy and avoiding traps." },
    ],
    related: [
      { href: "/mock-test/gre/", label: "Free GRE Mock Test" },
      { href: "/practice/gre/", label: "Free GRE Section Practice" },
      { href: "/mock-test/gmat/", label: "Free GMAT Mock Test" },
      { href: "/blog/", label: "Exam-Prep Blog" },
      { href: "/explore/", label: "All Free LandingPrep Resources" },
    ] },
  { path: "/gmat-data-insights/", title: "GMAT Data Insights: Question Types & Free Practice",
    desc: "Master the GMAT Focus Data Insights section in 2026 — data sufficiency, table analysis, graphics, multi-source and two-part reasoning. Free GMAT practice with solutions.",
    kw: "gmat data insights, gmat focus data insights, data sufficiency gmat, gmat di practice, gmat focus edition, free gmat practice",
    lead: "Data Insights is the GMAT Focus Edition's newest, most decisive section. Here's what it tests and how to practise each question type effectively.",
    sections: [
      { h: "What Data Insights tests", body: "Data Insights is one of three equally weighted GMAT Focus sections. It blends data sufficiency, table analysis, graphics interpretation, multi-source reasoning and two-part analysis — testing how well you read data and reason about what is sufficient to answer a question." },
      { h: "How to approach the question types", body: "For data sufficiency, decide whether each statement alone (or together) is enough — without fully solving. For table and graphics questions, read the axes, units and totals carefully before answering. Multi-source reasoning rewards quickly locating the relevant tab of information." },
      { h: "Practise reading data fast", body: "Strong scorers read tables and charts quickly and accurately. Drill timed Data Insights sets, review every miss for the underlying reasoning error, and build the habit of checking units and what the question actually asks. Use free GMAT Focus practice with worked solutions." },
    ],
    faqs: [
      { q: "How important is Data Insights on the GMAT Focus?", a: "Very — it is one of three equally weighted sections and often separates strong scorers, because it is newer and many candidates under-prepare for it." },
      { q: "What question types are in Data Insights?", a: "Data sufficiency, table analysis, graphics interpretation, multi-source reasoning and two-part analysis. Each rewards careful, fast reading of data and clear reasoning." },
    ],
    related: [
      { href: "/mock-test/gmat/", label: "Free GMAT Mock Test" },
      { href: "/practice/gmat/", label: "Free GMAT Section Practice" },
      { href: "/mock-test/gre/", label: "Free GRE Mock Test" },
      { href: "/blog/", label: "Exam-Prep Blog" },
      { href: "/explore/", label: "All Free LandingPrep Resources" },
    ] },
  { path: "/how-to-get-ielts-band-8/", title: "How to Get IELTS Band 8: Section-by-Section Plan",
    desc: "How to reach IELTS Band 8 in 2026 — what Band 8 requires in each section and a focused plan to get there. Free IELTS mocks, writing and speaking checkers.",
    kw: "how to get ielts band 8, ielts band 8 preparation, ielts band 8 requirements, ielts 8 study plan, ielts band 8 writing speaking",
    lead: "Band 8 is a very high score — near-native control with only occasional slips. Here's what it demands in each section and how to train for it.",
    sections: [
      { h: "What Band 8 requires", body: "Band 8 means roughly 35/40 in Listening and Reading, Writing that fully develops ideas with rare errors, and Speaking that is fluent and precise with wide vocabulary. You can make occasional, non-systematic mistakes, but accuracy must be high and consistent." },
      { h: "Listening and Reading to 8", body: "At this level, almost every question must be correct, so eliminate careless errors: read instructions and word limits exactly, watch spelling, and master the trickiest types (Not Given, matching, multiple-select). Practise full timed sections and review every single miss." },
      { h: "Writing and Speaking to 8", body: "Writing Band 8 needs a clear, fully extended response with precise vocabulary and varied, accurate grammar — over-complex sentences with errors hurt you. Speaking Band 8 needs effortless fluency, idiomatic but natural vocabulary and clear pronunciation. Use the free AI Writing and Speaking tools to refine both." },
    ],
    faqs: [
      { q: "Is IELTS Band 8 hard to get?", a: "Yes — Band 8 is a very high score requiring near-native accuracy and fluency. It is achievable with strong English and disciplined, error-focused practice, especially in Writing and Speaking." },
      { q: "What is the hardest section for Band 8?", a: "For most candidates, Writing is the hardest to push to Band 8 because it demands fully developed ideas with precise vocabulary and very few errors. Targeted feedback helps most here." },
    ],
    related: [
      { href: "/ielts-band-8/", label: "IELTS Band 8 Guide" },
      { href: "/ielts-band-7/", label: "IELTS Band 7 Guide" },
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/ielts-writing-checker/", label: "Free IELTS Writing Checker" },
      { href: "/ielts-speaking-checker/", label: "Free IELTS Speaking Checker" },
    ] },
  { path: "/best-countries-to-study-abroad/", title: "Best Countries to Study Abroad — Compare & Decide",
    desc: "The best countries to study abroad in 2026 compared by cost, work rights, PR pathway and career value — USA, UK, Canada, Australia, Germany & more. Free guide.",
    kw: "best countries to study abroad, best country to study abroad for indian students, study abroad destinations, where to study abroad, study abroad comparison",
    lead: "There is no single 'best' destination — only the best fit for your budget, career and PR goals. Here's how the top countries compare on what matters.",
    sections: [
      { h: "Compare on what matters", body: "Weigh four things: total cost (tuition plus living), post-study work rights, the pathway to permanent residence, and career value in your field. A country that is cheaper but offers no work visa may cost you more in opportunity than a pricier one with a strong stay-back route." },
      { h: "How the top destinations differ", body: "The USA offers top research and salaries but higher costs; the UK has one-year master's plus a Graduate Route; Canada is strong on the student-to-PR pathway; Australia offers good post-study work; Germany is the best value with low or no tuition. Match these to your priorities." },
      { h: "Make your shortlist", body: "Pick your top priority — lowest cost, fastest PR, or highest earning potential — then shortlist two or three countries that fit, and compare specific universities and programmes. Use LandingPrep's free study-abroad tools and country pages to compare side by side." },
    ],
    faqs: [
      { q: "Which is the best country to study abroad for Indian students?", a: "It depends on your goal: Canada for a clear PR pathway, the UK for a fast one-year master's, Germany for low cost, the USA for top research and salaries, and Australia for post-study work. Compare on cost, work rights and PR." },
      { q: "Which country is cheapest to study in?", a: "Germany is the best value among top destinations because public universities charge little or no tuition; you mainly budget for living costs." },
    ],
    related: [
      { href: "/study-abroad/top-universities-in-usa/", label: "Top Universities in the USA" },
      { href: "/study-abroad/top-universities-in-uk/", label: "Top Universities in the UK" },
      { href: "/study-abroad/top-universities-in-canada/", label: "Top Universities in Canada" },
      { href: "/study-abroad/top-universities-in-australia/", label: "Top Universities in Australia" },
      { href: "/cheapest-study-abroad-countries/", label: "Cheapest Countries to Study Abroad" },
    ] },
  { path: "/duolingo-accepted-universities/", title: "Duolingo English Test: Accepted Universities & How to Score 120+",
    desc: "Which universities accept the Duolingo English Test in 2026, what score you need, and how to reach 120+. Free Duolingo practice with instant scoring.",
    kw: "duolingo accepted universities, duolingo english test universities, duolingo score for university, how to score 120 duolingo, det practice free",
    lead: "The Duolingo English Test is cheaper and taken at home, and is now accepted by thousands of universities. Here's who accepts it, the scores they want, and how to hit them.",
    sections: [
      { h: "Who accepts the Duolingo English Test", body: "Thousands of universities across the USA, UK, Canada, Australia and Europe accept the Duolingo English Test (DET), and the list keeps growing. Always confirm acceptance and the minimum score on your specific programme's admissions page, and check whether your student visa also accepts it." },
      { h: "What score you need", body: "DET is scored 10–160. Many universities ask for roughly 105–120, and competitive programmes may want 120–130 or more. As a rough guide, 120 is broadly comparable to IELTS 7.0 — but always use the university's own stated requirement." },
      { h: "How to reach 120+", body: "DET is adaptive and integrates reading, writing, speaking and listening into quick tasks. Practise the recurring task types, type and speak clearly and quickly, and build vocabulary. Free DET practice with instant scoring helps you learn the format and pace before test day." },
    ],
    faqs: [
      { q: "Is the Duolingo English Test accepted for universities?", a: "Yes — thousands of universities worldwide accept it, and the number is growing. Always confirm acceptance and the minimum score on your specific programme, and check your visa requirement separately." },
      { q: "What Duolingo score equals IELTS 7?", a: "As a rough guide, a Duolingo score of about 120 is broadly comparable to IELTS 7.0, but each university sets its own requirement, so use their stated score." },
    ],
    related: [
      { href: "/mock-test/duolingo/", label: "Free Duolingo English Test Practice" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
      { href: "/study-abroad-without-ielts/", label: "Study Abroad Without IELTS" },
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/blog/", label: "Exam-Prep Blog" },
    ] },
  { path: "/how-it-works/", title: "How LandingPrep Works — Our Method, Scoring & Why It's Free",
    desc: "How LandingPrep builds free mock tests that mirror the real IELTS, TOEFL, PTE, GRE & GMAT, how the AI scoring and feedback work, how we keep content current for 2026, and why it's 100% free — with honest limitations.",
    kw: "how landingprep works, are landingprep mock tests accurate, how is ielts mock test scored, ai ielts band score accuracy, who is behind landingprep, free ielts practice methodology",
    lead: "Trust matters when you are preparing for a high-stakes exam. Here is exactly how LandingPrep builds its practice, how the scoring and AI feedback work, how we keep everything current — and the honest limits of any practice tool.",
    sections: [
      { h: "Built to mirror the real exams", body: "Every mock test is modelled on the official test specification for that exam — the same section order, time limits, question types and answer formats as the real IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo English Test, GRE and GMAT Focus. The goal is that test day feels familiar: the timing pressure, the instructions and the question styles match what you will actually see." },
      { h: "How scoring works", body: "Objective sections (listening, reading, multiple-choice, quant) are auto-scored instantly against a verified answer key, with a point-to-point explanation for every question. Writing and speaking are assessed by an AI examiner against the official rubric for that exam and mapped onto its real scale — the IELTS band, the TOEFL 0–120, the PTE 10–90, and so on — so you get a realistic estimate to guide your practice." },
      { h: "How the AI feedback is built", body: "The AI Writing and Speaking agents are prompted with the official assessment criteria — for IELTS that means Task Achievement, Coherence & Cohesion, Lexical Resource and Grammatical Range & Accuracy; other exams use their own rubrics. You get structured, criterion-by-criterion feedback plus a Band 7+/CEFR C1 model answer to compare against, not just a number." },
      { h: "Kept current for 2026", body: "Exam formats, fees and visa rules change. We review and update content for the current year, cross-checking official test-maker and immigration sources, and date our study-abroad guides so you can see how fresh they are. The GMAT Focus edition, the latest Duolingo format and 2025–26 visa changes are already reflected." },
      { h: "Why it's 100% free", body: "Good exam prep and honest study-abroad guidance are usually locked behind a paywall, which shuts out the students who need them most. LandingPrep's mission is to remove that barrier — every mock test, AI tool, lesson and study-abroad resource is free, with no signup, no credit card and no trial that expires." },
      { h: "Honest limitations", body: "No practice tool — ours or anyone's — can issue an official score, and an AI estimate is an estimate. Use your LandingPrep results to track progress and find weak areas, but always confirm the exact score and the precise requirement with your chosen university and visa authority before you rely on it. We would rather be upfront about this than over-promise." },
    ],
    faqs: [
      { q: "How accurate is the AI band/score estimate?", a: "It is a realistic guide, not an official result. Objective sections are scored exactly against an answer key; writing and speaking are rated against the official rubric and mapped to the real scale. Treat it as a progress indicator and verify your target with the official test." },
      { q: "Do the mock tests really match the real exam?", a: "Yes — each mock mirrors the official format, section order, timing and question types for that exam, so test day feels familiar. We update them as exam formats change." },
      { q: "Who is behind LandingPrep?", a: "LandingPrep is built by an education-technology team focused on making exam prep and study-abroad guidance free and accessible. Content is modelled on official test specifications and reviewed for accuracy; we do not claim affiliation with any official test maker." },
      { q: "Is it really free, forever?", a: "Yes. Every mock test, AI tool, lesson and study-abroad resource is 100% free with no signup or payment. An optional free account only adds progress tracking across devices." },
      { q: "How often is content updated?", a: "We review content for the current year and reflect changes to exam formats, fees and visa rules as they happen, cross-checking official sources. Study-abroad guides are dated so you can see how current they are." },
    ],
    related: [
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
      { href: "/about/", label: "About LandingPrep" },
      { href: "/blog/", label: "Exam-Prep & Study-Abroad Blog" },
      { href: "/explore/", label: "Explore All Free Pages" },
    ] },
  { path: "/ielts-writing-task-1-guide/", title: "IELTS Writing Task 1: Chart & Letter Structure",
    desc: "Master IELTS Academic Writing Task 1 in 2026 — describe charts, diagrams, maps and processes with the right structure, vocabulary and examples. Free template and sample answers.",
    kw: "ielts writing task 1, ielts writing task 1 structure, how to describe chart ielts, ielts letter writing, ielts process diagram, ielts band 7 writing task 1, free ielts writing task 1 examples",
    lead: "IELTS Writing Task 1 rewards clear structure and precise language. Here's how to describe charts, graphs, maps and processes to hit Band 7+.",
    sections: [
      { h: "Task 1 question types", body: "Task 1 gives you a visual — a bar/line/pie chart, a table, a map or a process diagram — and asks you to describe it in 150+ words. Unlike Task 2 essays, Task 1 is purely factual: you summarise key features, highlight trends and compare data without opinion. The key is accuracy and organisation." },
      { h: "The winning structure for charts", body: "Introduction (paraphrase the visual + overview of main trend), Body (2–3 paragraphs describing key data, comparisons and patterns), Conclusion (recap the main takeaway). Use the overview paragraph to signal what you will describe in the body — examiners reward this 'roadmap'." },
      { h: "Vocabulary and language for Task 1", body: "Use present simple and passive voice (the highest point is reached, there was a rise in). Master trend verbs: increase, decrease, fluctuate, plateau, peak, plummet. Use comparison language: whereas, in contrast, compared to. Avoid repetition by using synonyms. Precision matters more than complexity." },
      { h: "Common traps and how to avoid them", body: "Do not add opinion or interpretation beyond what the data shows. Do not repeat the same figures. Do not write over 190–200 words (examiners penalise you for exceeding the word limit). Do not use the same sentence structure repeatedly — vary your syntax." },
      { h: "Letter vs Report (Academic vs General)", body: "Academic Task 1 is always a visual; General uses formal letters or semi-formal emails instead. For letters, follow a clear structure: address the recipient, state your purpose, explain your points, and close politely. Formal letters need appropriate greetings and sign-offs." },
      { h: "Band 7 and 8 checklist", body: "Accurate task response (all data covered, within word count), clear organisation (logical flow, linked paragraphs), sophisticated vocabulary (synonyms, precise phrases), grammatically accurate (varied structures, correct tenses). Use the free Writing Checker to refine your responses." },
    ],
    faqs: [
      { q: "What is the word count for IELTS Writing Task 1?", a: "Minimum 150 words. Examiners penalise you for writing fewer. Aim for 160–190 words; over 200 is flagged as exceeding the requirement." },
      { q: "How much does Task 1 count towards the overall band?", a: "Writing is 25% of your overall IELTS band, and Task 1 and Task 2 are equally weighted. So Task 1 strongly affects your Writing and overall score." },
      { q: "Is it better to describe all the data or just the main features?", a: "Describe the key features and trends, not every single number. Your overview paragraph should signal what you will focus on so the examiner expects your selection." },
    ],
    related: [
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/practice/ielts/", label: "Free IELTS Writing Practice" },
      { href: "/ielts-writing-task-2-templates/", label: "IELTS Writing Task 2 Templates" },
      { href: "/ielts-band-guides/", label: "IELTS Band Score Guides" },
    ] },
  { path: "/ielts-writing-task-2-templates/", title: "IELTS Writing Task 2: Essay Templates & Practice",
    desc: "IELTS Task 2 essay templates for opinion, discussion, problem-solution and advantage-disadvantage questions. Free essay framework and Band 7+ examples.",
    kw: "ielts writing task 2, ielts essay template, ielts opinion essay, ielts discussion essay, ielts problem solution, ielts band 7 writing task 2, free ielts essay examples",
    lead: "Task 2 essays follow predictable patterns. Here are templates for every question type, how to structure arguments and how to hit Band 7+ consistency.",
    sections: [
      { h: "The four main essay types", body: "Opinion (do you agree or disagree?), Discussion (discuss both views and give your opinion), Problem-Solution (what is the problem, what are solutions?), Advantage-Disadvantage (discuss both, give your view). Every question fits one of these — recognise the type quickly so you can deploy the right framework." },
      { h: "The universal essay structure", body: "Introduction (rephrase the question, state your position), Body (2–3 paragraphs, each with a main idea + evidence), Conclusion (restate your position and summarise your points). Examiners reward this structure heavily because it is easy to follow and shows clarity." },
      { h: "Opinion essay template", body: "Introduction: paraphrase question + clear position (agree/disagree). Body: Paragraph 1 (reason 1 + explanation + example), Paragraph 2 (reason 2 + explanation + example). Conclusion: restate your position using different words. Keep your tone formal and use balanced language." },
      { h: "Discussion and balanced essays", body: "Introduction: rephrase question, signal you will discuss both views. Body: Paragraph 1 (first viewpoint + evidence), Paragraph 2 (second viewpoint + evidence). Conclusion: state which side you agree with and summarise. This template suits 'discuss both and give your opinion' and advantage-disadvantage questions." },
      { h: "Paragraph linking and cohesion", body: "Connect your ideas using cohesive devices: furthermore, however, in contrast, for example, as a result, in conclusion. Link sentences within paragraphs (use pronouns, synonyms, reference words) and between paragraphs (use topic sentences that preview your point). Examiners score coherence & cohesion as 25% of your writing mark." },
      { h: "Getting to Band 7+", body: "Use a range of sentence types (simple, compound, complex). Employ topic-specific vocabulary and avoid repetition. Keep your arguments clear and supported by examples. Proofread for grammar — subject-verb agreement, tense consistency, article use. Use the free Writing Checker to get criterion feedback." },
    ],
    faqs: [
      { q: "How many paragraphs should an IELTS essay have?", a: "A standard 5-paragraph essay (intro + 3 body + conclusion) is ideal for 250–280 words. You can use 4 paragraphs (intro + 2 body + conclusion) if your arguments are substantial." },
      { q: "Can I disagree with the question or stay neutral?", a: "You can take any position — agree, disagree or stay neutral (if the question allows). What matters is that you support your position clearly with examples and reasoning." },
      { q: "How important are examples in Task 2?", a: "Very important. Examiners look for relevant examples that support your arguments. They can be real-world examples, personal experience or hypothetical scenarios — just make sure they are clear and directly support your main point." },
    ],
    related: [
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/practice/ielts/", label: "Free IELTS Writing Practice" },
      { href: "/ielts-writing-task-1-guide/", label: "IELTS Writing Task 1 Guide" },
      { href: "/how-to-get-ielts-band-8/", label: "How to Get IELTS Band 8" },
    ] },
  { path: "/ielts-speaking-cue-cards/", title: "IELTS Speaking Part 2: Cue Card Strategies & Topics",
    desc: "Master IELTS Speaking Part 2 cue cards in 2026 — common topics, how to structure a 2-minute talk and techniques to extend your answer. Free cue card examples.",
    kw: "ielts speaking cue card, ielts speaking part 2, ielts cue card topics, how to answer ielts cue card, ielts speaking topics, ielts band 7 speaking cue card",
    lead: "Part 2 gives you a cue card prompt and one minute to plan a 2-minute talk. Here's how to structure it and extend your answer to hit Band 7+.",
    sections: [
      { h: "Understanding the cue card task", body: "You get a cue card with a topic and 4–5 sub-questions (e.g. Describe a person you know: who they are, how you know them, why you admire them, what you have in common). You have one minute to read and plan, then you speak for 1–2 minutes without interruption. The examiner may ask a follow-up question after." },
      { h: "Common cue card topics", body: "Frequent topics include describe a person, a place you have visited, a book you enjoyed, an experience that made you laugh, a useful skill you learned, an object you own, a decision you made. All are everyday topics testing your ability to speak fluently about familiar subjects." },
      { h: "The planning minute — use it wisely", body: "Jot down keyword bullet points for each sub-question, not full sentences. Aim for 3–4 key points per sub-question. Decide on your opening line (e.g. 'I'll talk about my friend Ravi, whom I've known since school') and your closing (a brief comment on why it matters). This roadmap keeps you fluent and relevant." },
      { h: "Structure for fluency and coherence", body: "Opening (directly answer the topic, e.g. 'The person I'd like to describe is my best friend Arjun'), Body (develop each sub-question with details and examples), Closing (summary or personal reflection). Use signposting language: firstly, moving on to, to elaborate, in summary. This structure rewards coherence & cohesion." },
      { h: "Techniques to extend your talk to 2 minutes", body: "Add reasons and examples: not just 'he is kind' but 'he is kind — he helped my family when my father was ill'. Use descriptive language: colours, emotions, details. Ask yourself 'why' or 'how' and answer it. Tell a small story related to the topic. Pause for thought (it shows you are reflecting, not scripted)." },
      { h: "Avoiding common mistakes", body: "Do not memorise a script — examiners detect this and it lowers your fluency band. Do not stay silent for long — it damages your score. Do not talk about something else (the cue card, not your random story). Do not rush — pause occasionally, take a breath, let your answer flow naturally." },
    ],
    faqs: [
      { q: "What if I do not know the topic on the cue card?", a: "You can ask the examiner for clarification on a word, but you must speak about the general topic. If you genuinely cannot, you can say so, but the examiner will move on and you lose points. Practise a wide range of topics to be prepared." },
      { q: "Can I speak for less than 1 minute on Part 2?", a: "Technically you can stop early, but speaking less than 1 minute shows you cannot sustain fluency and will lower your band. Aim to fill the full 1–2 minutes by extending with reasons and examples." },
      { q: "How much does Part 2 count towards my speaking band?", a: "Speaking is 25% of your overall IELTS. Part 2 is a major component of the Speaking section, so delivering a fluent, detailed talk is crucial." },
    ],
    related: [
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/practice/ielts/", label: "Free IELTS Speaking Practice" },
      { href: "/ielts-linking-words/", label: "IELTS Linking Words & Cohesion" },
      { href: "/english-grammar-for-ielts/", label: "English Grammar for IELTS" },
    ] },
  { path: "/toefl-speaking-templates/", title: "TOEFL Speaking Tasks: Templates & Practice",
    desc: "Master all 4 TOEFL Speaking tasks in 2026 with templates for independent and integrated tasks. Free frameworks and response examples.",
    kw: "toefl speaking templates, toefl speaking tasks, toefl independent speaking, toefl integrated speaking, toefl speaking tips, free toefl speaking practice",
    lead: "TOEFL Speaking has 4 tasks — 2 independent, 2 integrated. Here are the templates and techniques to structure clear, fluent responses under pressure.",
    sections: [
      { h: "TOEFL Speaking: the four tasks", body: "Task 1 (independent): describe a place, person or event from your experience (45 seconds). Task 2 (independent): agree/disagree or choose between options (45 seconds). Task 3 (integrated): read a campus announcement, listen to a conversation, then speak about it (60 seconds). Task 4 (integrated): read an academic text, listen to a lecture excerpt, then summarise the lecture and link to the reading (60 seconds)." },
      { h: "Independent speaking template (Tasks 1 & 2)", body: "Introduction (brief intro to your topic, 5–10 seconds), Main point (state your choice or describe your example, 10 seconds), Reason 1 (explanation + details, 10 seconds), Reason 2 (explanation + details, 10 seconds), Conclusion (brief wrap-up, 5 seconds). This pacing helps you fill 45 seconds fluently without rushing." },
      { h: "Integrated speaking template (Task 3)", body: "Opening (the topic and the problem/announcement), Campus perspective (what the student or announcement says), Personal perspective (your view or the student's likely experience), Conclusion (brief summary). This structure shows you understood the integrated content and can link it to your own thinking." },
      { h: "Integrated speaking template (Task 4)", body: "Opening (the academic concept and the lecture topic), Lecture main idea (the professor's key point), Link to reading (how the lecture explains or extends the reading), Examples (details from the lecture that support the link). Scoring rewards candidates who clearly link the two sources." },
      { h: "Vocabulary and fluency techniques", body: "Use transition phrases: first of all, for example, as a result, in conclusion. Use filler phrases sparingly (well, you know) — too much damages your fluency band. Speak at a natural pace; rushing causes errors and poor clarity. Vary your sentence structure: questions, statements, compound sentences." },
      { h: "Common traps and fixes", body: "Do not memorise long responses — they sound unnatural. Do not pause too long (over 3 seconds suggests you are stuck). Do not use overly complex words if you do not control them — clarity and accuracy matter more. Do not forget to answer both parts of integrated questions." },
    ],
    faqs: [
      { q: "How much speaking time do I get on TOEFL?", a: "Total speaking time is 17 minutes: 45 seconds × 2 independent tasks + 60 seconds × 2 integrated tasks = 210 seconds plus prep time." },
      { q: "Can I use the same example for multiple independent tasks?", a: "You can use the same type of example (e.g. a friend) for different tasks if the topic allows, but the specific details should match the question asked." },
      { q: "How is TOEFL Speaking scored?", a: "Each task is rated 0–4. Your Speaking section score is 0–30. Raters assess delivery (pronunciation, fluency), language use (grammar, vocabulary) and topic development." },
    ],
    related: [
      { href: "/mock-test/toefl/", label: "Free TOEFL Mock Test" },
      { href: "/practice/toefl/", label: "Free TOEFL Speaking Practice" },
      { href: "/toefl-writing-templates/", label: "TOEFL Writing Templates" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
    ] },
  { path: "/toefl-writing-templates/", title: "TOEFL Writing: Integrated & Academic Essays",
    desc: "TOEFL Writing templates for integrated and academic-discussion essays. Free essay structure, outlines and Band 25+ techniques.",
    kw: "toefl writing template, toefl integrated essay, toefl academic discussion, toefl writing tips, free toefl writing practice, toefl band 25",
    lead: "TOEFL Writing has 2 tasks — integrated (read + listen + write) and academic discussion. Here are templates for both and how to hit high scores.",
    sections: [
      { h: "TOEFL Writing: the two tasks", body: "Integrated Task: you read a passage (3 minutes), listen to a lecture (2–3 minutes), then write a 150–225 word summary of how the lecture relates to the reading (20 minutes). Academic Discussion Task: you read a discussion prompt and 3 student posts, then contribute a response (100–150 words, 10 minutes) that fits the discussion tone and conventions." },
      { h: "Integrated essay template", body: "Introduction (the general topic and the reading's main point), Lecture summary (what the professor says), Connection (how the lecture challenges, supports or expands the reading), Details (1–2 examples from the lecture and reading). Keep it under 225 words. Avoid personal opinion; focus on the relationship between the sources." },
      { h: "Academic Discussion Task template", body: "Opening (acknowledge the discussion and the previous posts), State your view (agree, disagree, or nuance the discussion), Reasons (1–2 specific points from the discussion or your own experience), Closing (invite further discussion or summarise). Use a tone similar to the student posts — not overly formal, but clearly written." },
      { h: "Planning in your 10–20 minutes", body: "Integrated: spend 2–3 minutes planning (outline the reading, jot lecture notes during listening, plan your 3–4 main points before you write). Academic Discussion: spend 1–2 minutes re-reading the prompt and posts, noting key themes, then write. Time management is critical — do not spend too long planning." },
      { h: "Grammar and vocabulary priorities", body: "For Integrated: use complex sentences to show you understand the lecture-reading link. For Academic Discussion: write conversationally but correctly (avoid fragments, use clear subjects and verbs). Both tasks reward varied vocabulary and accurate grammar — but clarity over complexity." },
      { h: "Avoiding the integrated-task trap", body: "Do not just summarise the reading or lecture separately — examiners want to see how you synthesise the two. Do not insert personal opinion in the integrated essay. Do not forget to support your points with details from the sources." },
    ],
    faqs: [
      { q: "How much of my TOEFL score is Writing?", a: "Writing is one of four skills, each out of 30, so 25% of your total 120-point TOEFL score." },
      { q: "Can I use the word 'disagree' in academic discussion?", a: "Yes, but soften it with nuance. Instead of 'I disagree,' try 'While I see that point, I think...' which is more conversational and shows critical thinking." },
      { q: "What is a good TOEFL Writing score?", a: "Scores of 24–30 (out of 30) are competitive for most universities; scores of 28–30 are strong. The Writing score often matters less than Reading and Listening for most programmes." },
    ],
    related: [
      { href: "/mock-test/toefl/", label: "Free TOEFL Mock Test" },
      { href: "/practice/toefl/", label: "Free TOEFL Writing Practice" },
      { href: "/toefl-speaking-templates/", label: "TOEFL Speaking Templates" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
    ] },
  { path: "/pte-speaking-strategies/", title: "PTE Speaking: Read Aloud, Describe Image & Retell",
    desc: "Master PTE Speaking tasks in 2026 — Read Aloud, Repeat Sentence, Describe Image, Retell Lecture strategies and free practice.",
    kw: "pte speaking tasks, pte read aloud, pte describe image, pte retell lecture, pte speaking tips, pte fluency score, free pte speaking practice",
    lead: "PTE Speaking combines multiple task types in one go. Here's how to approach each — Read Aloud, Repeat Sentence, Describe Image and Retell Lecture.",
    sections: [
      { h: "PTE Speaking task overview", body: "PTE Speaking includes Read Aloud (scan and speak naturally), Repeat Sentence (listen and repeat accurately), Describe Image (describe a chart or photo in 40 seconds), Retell Lecture (listen to a 60–90 second academic lecture, then retell it in 40 seconds). The computer scores pronunciation, fluency, intonation and content." },
      { h: "Read Aloud strategy", body: "Scan the text quickly for key words and punctuation. Read at a natural, moderate pace (not too slow, not rushed). Use appropriate intonation and stress on important words. Avoid stumbling — if you make a small error, keep going smoothly. The score rewards natural, fluent speech over perfection." },
      { h: "Repeat Sentence technique", body: "Listen carefully the first time. If you miss a word, do your best to approximate. Speak as soon as the recording ends (do not delay). Aim for accuracy over pausing — a full, fluent repeat of 90% of words beats a halting, perfect version. Pronunciation and rhythm matter, so mimic the speaker's intonation." },
      { h: "Describe Image template", body: "Opening (identify what the image is: a chart, graph, photo, map). Overview (the main point or overall trend). Key features (2–3 important details or data points). Conclusion (a brief summary or observation). This structure fills 40 seconds and shows you can organise information." },
      { h: "Retell Lecture challenge and strategy", body: "The lecture is fast — take brief notes on key points (not full sentences). Immediately after, use your notes to reconstruct the main idea, 2–3 supporting points and any conclusion. Speak fluently without reading notes word-for-word. The score rewards capturing the gist, not reciting every detail." },
      { h: "Pronunciation and fluency", body: "PTE uses speech-recognition software, so clear articulation, natural pace and proper word stress are critical. Avoid long pauses (the system may stop recording). Use stress and intonation naturally — do not sound robotic. Practice with a native-English speaker or the free PTE practice tool." },
    ],
    faqs: [
      { q: "How long is the PTE Speaking section?", a: "Speaking is one of three skills and takes 77–93 minutes total for the full exam. Speaking component ranges from a few minutes to 40 seconds per task, with multiple tasks." },
      { q: "What if I cannot remember the exact words for Repeat Sentence?", a: "Do your best to approximate. The system scores for clarity and approximate accuracy — saying 90% of the sentence fluently is better than a halting, perfect version." },
      { q: "Can I describe an image using notes in PTE?", a: "No — Describe Image must be spoken freely from observation. You have no notes or template displayed. Practise organising your thoughts in 40 seconds." },
    ],
    related: [
      { href: "/mock-test/pte/", label: "Free PTE Mock Test" },
      { href: "/practice/pte/", label: "Free PTE Speaking Practice" },
      { href: "/pte-describe-image-template/", label: "PTE Describe Image Template" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
    ] },
  { path: "/pte-describe-image-template/", title: "PTE Describe Image: Structure & Template",
    desc: "PTE Describe Image template — how to structure a 40-second image description. Free examples, vocabulary and scoring tips.",
    kw: "pte describe image, pte describe image template, pte describe image examples, pte describe image tips, pte describe image strategy, free pte practice",
    lead: "PTE Describe Image is 40 seconds to analyse and describe a chart, map or photo. Here's a reusable template and worked examples.",
    sections: [
      { h: "The 40-second time limit and structure", body: "You have one minute to view the image, but only 40 seconds to speak. The solution: spend 15 seconds observing and planning, then 35 seconds describing. The key is a tight, predictable structure so you do not ramble. A typical breakdown: opening (5 seconds), overview (10 seconds), key details (15 seconds), conclusion (5 seconds)." },
      { h: "Opening and identifying the image type", body: "Start by identifying what you see — a bar chart, line graph, pie chart, map, photograph. Spend 3–5 seconds here. Example: 'This is a bar chart showing sales trends over five years.' Clear identification helps you (and the scorer) understand what is coming." },
      { h: "Overview: the main message", body: "Spend 8–10 seconds summarising the most important trend or pattern. For a chart: 'Sales increased from 2020 to 2024, with the steepest rise in 2022.' For a photo: 'The image shows a busy market with vendors and shoppers.' Examiners value candidates who quickly extract the gist." },
      { h: "Key details: the bulk of your response", body: "Spend 15–20 seconds describing specific data points, colours, people, relationships. For a chart: 'In 2020, sales were 50 million. By 2024, they reached 150 million — a threefold increase.' For a photo: 'There are stalls selling fruit, vegetables and flowers. Shoppers are browsing and wearing traditional clothing.' Use specific observations, not vague descriptions." },
      { h: "Conclusion: brief wrap-up", body: "Spend 3–5 seconds summarising the takeaway. Example: 'Overall, the chart demonstrates strong upward sales growth over the period' or 'This market scene captures the vibrancy of daily street commerce.' Keep it brief — you are running out of time." },
      { h: "Common traps and language tips", body: "Avoid 'I see' repetition — use 'The chart shows', 'The data indicates', 'In the image'. Avoid 'um' and long pauses. Do not make up details you cannot see. Do not speculate beyond what the image shows. Use precise numbers and percentages from charts if visible, or approximations if not (about, roughly, approximately)." },
    ],
    faqs: [
      { q: "What if the image is blurry or hard to understand?", a: "Do your best to describe what you can see. If you are genuinely unable to interpret it, acknowledge that and describe what you observe (colours, shapes, general layout). The scorer will take into account visibility." },
      { q: "Should I describe every detail in the image?", a: "No — prioritise key features and patterns. A well-organised, partial description (that hits the main points) scores better than a rambling, complete description." },
      { q: "How much does Describe Image count in the PTE Speaking score?", a: "PTE combines all speaking tasks into one score. Describe Image is one of several tasks, so doing well here significantly helps your overall Speaking band." },
    ],
    related: [
      { href: "/mock-test/pte/", label: "Free PTE Mock Test" },
      { href: "/practice/pte/", label: "Free PTE Speaking Practice" },
      { href: "/pte-speaking-strategies/", label: "PTE Speaking Strategies" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
    ] },
  { path: "/gre-vocabulary-list/", title: "High-Frequency GRE Vocabulary: Grouped by Theme",
    desc: "Essential GRE vocabulary list 2026 — high-frequency words grouped by topic, with meanings, synonyms and example usage. Free printable list.",
    kw: "gre vocabulary list, gre vocab words, gre vocabulary pdf, high frequency gre words, gre vocabulary by topic, free gre word list",
    lead: "GRE vocabulary is thematic, not random. Here's a focused list of the highest-frequency words, grouped by topic, with meanings and usage.",
    sections: [
      { h: "Why theme-based learning works", body: "GRE words often cluster around themes: abstract ideas (esoteric, ambiguous), criticism/conflict (refute, contentious), praise/approval (laudable, meritorious), support/weakness (bolster, undermine), and emotions (ebullient, despondent). Learning by theme helps you recall faster and understand relationships between words." },
      { h: "Abstract & intellectual words", body: "esoteric (intended for a small group of specialists), ambiguous (open to more than one interpretation), abstruse (difficult to understand), perspicacious (having keen insight), sagacious (wise). These often appear in passages about philosophy, academia and complex ideas. Knowing them helps you follow difficult Verbal texts." },
      { h: "Criticism and conflict theme", body: "refute (prove wrong), rebut (argue against), castigate (reprimand harshly), vituperative (abusive language), contentious (causing disagreement), acrimonious (bitter and hostile), belligerent (hostile and aggressive). These describe arguments, debates and disagreements in GRE passages." },
      { h: "Support, strength and weakness", body: "bolster (strengthen or support), corroborate (confirm or verify), undermine (weaken), mitigate (make less severe), assuage (calm, pacify), exacerbate (make worse), ameliorate (improve). These words signal cause-effect relationships and appear frequently in GRE reading passages." },
      { h: "Praise, approval and character", body: "laudable (worthy of praise), meritorious (deserving praise), exemplary (serving as model), sagacious (wise), perspicacious (insightful), dilatory (slow to act), indolent (lazy). These describe people, actions and character — useful for reading and essay tasks." },
      { h: "Emotions and states of mind", body: "ebullient (enthusiastic and energetic), languorous (slow, relaxed), morose (gloomy), sanguine (optimistic), despondent (sad and without hope), trepidation (fear), equanimity (calmness). These convey mood and tone in passages about people, experiences and attitudes." },
    ],
    faqs: [
      { q: "How many GRE vocabulary words should I learn?", a: "Focus on the 500–1000 most frequent GRE words. That covers 80% of the words you will see; the remainder are less common." },
      { q: "Is it better to memorise words or learn them in context?", a: "Both. Memorise definitions with flashcards for speed, then reinforce by reading them in context (GRE passages, articles). Context helps you remember and use them accurately." },
      { q: "Do difficult GRE words appear in every test?", a: "Yes, but they usually appear in one or two tough passages per test section. Strong vocabulary paired with reading comprehension skills helps you score high." },
    ],
    related: [
      { href: "/mock-test/gre/", label: "Free GRE Mock Test" },
      { href: "/practice/gre/", label: "Free GRE Verbal Practice" },
      { href: "/gre-quant-160/", label: "GRE Quant 160+ Strategy" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
    ] },
  { path: "/gre-quant-formulas/", title: "GRE Quant Formulas Cheat Sheet",
    desc: "Must-know GRE Quant formulas — arithmetic, algebra, geometry and statistics. Free printable formula sheet and worked examples.",
    kw: "gre quant formulas, gre math formulas, gre quantitative formulas pdf, gre geometry formulas, gre algebra, gre statistics formulas, free gre math cheat sheet",
    lead: "GRE Quant tests high-school maths. Here are the formulas you must know, organised by topic, with examples of how they appear on the test.",
    sections: [
      { h: "Arithmetic and percentages", body: "Percent = (Part / Whole) × 100. Percent change = ((New – Old) / Old) × 100. Interest: Simple Interest = Principal × Rate × Time. These appear constantly. Master percentage word problems — 'a 20% increase' means multiply by 1.2; a '30% decrease' means multiply by 0.7." },
      { h: "Algebra essentials", body: "Quadratic formula: x = (–b ± √(b²–4ac)) / 2a (rarely needed; most GRE quadratics factor). Linear equations: y = mx + b (m is slope, b is y-intercept). Exponent rules: x^a × x^b = x^(a+b), x^a / x^b = x^(a–b), (x^a)^b = x^(ab). These are foundational for most Quant problems." },
      { h: "Geometry formulas you must know", body: "Circle: Area = πr², Circumference = 2πr. Rectangle: Area = length × width, Perimeter = 2(l + w). Triangle: Area = (1/2) × base × height. Pythagorean theorem: a² + b² = c² (right triangles). Volume: Rectangular box = l × w × h, Sphere = (4/3)πr³, Cylinder = πr²h. Most GRE geometry is about applying one or two of these." },
      { h: "Statistics and data analysis", body: "Mean (average) = (Sum of all values) / (Count of values). Median = middle value (ordered data). Mode = most frequent value. Standard deviation measures spread (higher SD = wider spread). Probability = (Favorable outcomes) / (Total possible outcomes). These appear in graphs, tables and word problems." },
      { h: "Number properties and tricks", body: "Prime factorisation: express a number as a product of primes (e.g. 60 = 2² × 3 × 5). LCM (least common multiple) and GCD (greatest common divisor). Consecutive integers: if the first is n, the sum of k consecutive integers is k × (n + (k–1)/2). These help solve tricky Quant problems." },
      { h: "When to use formulas and when to skip", body: "Most GRE Quant problems reward logic and approximation over formula memorisation. The formula is your backup — first try to reason through the problem or test numbers. On Data Sufficiency, decide sufficiency without fully solving (saves time). Use formulas when you are stuck or to double-check." },
    ],
    faqs: [
      { q: "Do I need to memorise the quadratic formula?", a: "Good to know, but rarely needed on GRE — most quadratics factor or the problem is solve-able without it. Focus on exponent rules and percentage formulas instead." },
      { q: "How much of the GRE is geometry?", a: "Roughly 20–25% of the Quant section touches geometry. Master the basic area, perimeter and volume formulas and you are set." },
      { q: "Can I use a calculator on GRE?", a: "The on-screen calculator is available for most of the test, but efficient mental math and formula use are faster." },
    ],
    related: [
      { href: "/mock-test/gre/", label: "Free GRE Mock Test" },
      { href: "/practice/gre/", label: "Free GRE Quant Practice" },
      { href: "/gre-quant-160/", label: "GRE Quant 160+ Strategy" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
    ] },
  { path: "/gmat-quant-formulas/", title: "GMAT Focus Quant Formulas: Essential Cheat Sheet",
    desc: "GMAT Focus Quant formulas for algebra, geometry, arithmetic and statistics. Free formula sheet with worked examples.",
    kw: "gmat quant formulas, gmat focus formulas, gmat math formulas, gmat algebra geometry, gmat statistics, free gmat formula sheet",
    lead: "GMAT Focus Quant tests business-school-level maths. Here are the formulas grouped by topic, with tips on when to apply them.",
    sections: [
      { h: "GMAT Focus Quant section overview", body: "GMAT Focus Quant is one of three equally weighted sections (Quant, Verbal, Data Insights). It covers Problem Solving (choose the answer) and Data Sufficiency (decide if statements are sufficient to solve). Formulas help, but GMAT rewards problem-solving logic and estimation." },
      { h: "Arithmetic and algebraic identities", body: "Percent problems: Percent change = ((New – Old) / Old) × 100. Interest (compound): A = P(1 + r/n)^(nt). Ratios and proportions: a/b = c/d. Algebraic identities: (a + b)² = a² + 2ab + b², (a – b)² = a² – 2ab + b², a² – b² = (a + b)(a – b). These shortcuts save time." },
      { h: "Geometry for GMAT", body: "Circle: Area = πr², Circumference = 2πr. Triangle: Area = (1/2) × base × height, and for a right triangle, remember 3–4–5, 5–12–13 Pythagorean triples. Rectangle: Area = l × w. Volume: Box = l × w × h, Cylinder = πr²h. GMAT often tests these in combination (e.g. comparing volumes of different shapes)." },
      { h: "Statistics, averages and probability", body: "Mean = (Sum) / (Count). Sum = Mean × Count (useful for finding missing values). Median and mode for distributions. Probability: P(event) = (Favorable) / (Total). Independent events: P(A and B) = P(A) × P(B). GMAT Data Insights often combines statistics with logic." },
      { h: "Data Sufficiency strategy and formulas", body: "In Data Sufficiency, you do NOT need to solve — only decide if a statement gives enough information. Formulas help you quickly recognise what is sufficient. For example, if the problem asks for area of a circle and statement gives radius, that is sufficient (use Area = πr²). Avoid over-solving." },
      { h: "When to estimate instead of calculate", body: "GMAT rewards estimating for speed. If the answer choices are far apart, approximating π ≈ 3.14, rounding numbers and testing answers is faster than precise calculation. Use formulas to set up the logic, then estimate to narrow choices." },
    ],
    faqs: [
      { q: "Is the GMAT Quant section harder than GRE?", a: "Both test high-school maths at an advanced level. GMAT data sufficiency is more about logic than calculation; GRE problem-solving often requires more computational steps. Formulas matter for both." },
      { q: "Can I use a calculator on GMAT Focus?", a: "Yes, the on-screen calculator is available. But practise mental math and estimation — they are faster for many problems." },
      { q: "What percentage of GMAT Quant is geometry?", a: "Roughly 15–20% touches geometry directly, though many problems blend geometry with algebra or statistics." },
    ],
    related: [
      { href: "/mock-test/gmat/", label: "Free GMAT Mock Test" },
      { href: "/practice/gmat/", label: "Free GMAT Quant Practice" },
      { href: "/gmat-data-insights/", label: "GMAT Data Insights Strategy" },
      { href: "/which-english-test/", label: "Which English Test Should I Take?" },
    ] },
  { path: "/ielts-linking-words/", title: "IELTS Linking Words: Cohesive Devices for Band 7+",
    desc: "Complete guide to IELTS linking words and cohesive devices for Writing and Speaking. Free examples and functional categories.",
    kw: "ielts linking words, ielts cohesive devices, ielts transition words, ielts writing linking words, ielts band 7 vocabulary, free ielts vocabulary",
    lead: "Linking words bind your ideas — but using them naturally, not forcing every sentence, is what scores Band 7+. Here is a functional list by purpose.",
    sections: [
      { h: "What examiners mean by 'cohesion'", body: "Cohesion is how well your ideas link. Examiners score you on whether sentences and paragraphs flow logically — using pronouns, synonyms, repeated keywords and linking words naturally, not forcibly inserting 'furthermore' into every sentence. A well-linked paragraph needs only 2–3 explicit linkers; the rest flow via pronouns and logical flow." },
      { h: "Adding and listing ideas", body: "and, in addition, furthermore, moreover, besides, as well as, including, another, also. Use these to build arguments: 'She was intelligent and, moreover, driven.' But avoid starting every sentence with a linker — vary your sentence structure and use pronouns instead: 'She was intelligent. This trait made her a strong leader.'" },
      { h: "Showing contrast and concession", body: "however, in contrast, on the other hand, although, though, despite, while, whereas, yet, but. These show disagreement or unexpected turns. Example: 'While the study is well-designed, the sample is small.' Use 'however' and 'on the other hand' at the start of sentences for clarity; use 'although' and 'despite' in the middle of sentences." },
      { h: "Showing cause and effect", body: "because, since, as, due to, caused by, as a result, consequently, therefore, thus, so. Example: 'Because the storm was severe, schools closed. As a result, many families stayed home.' These are high-value words for explaining reasoning in essays and speaking." },
      { h: "Showing time and sequence", body: "first, then, next, later, after, before, meanwhile, during, subsequently, previously, finally. Example: 'First, I completed my degree. Subsequently, I worked in finance. Finally, I decided to study abroad.' These help you narrate events clearly in writing and speaking." },
      { h: "Showing example and clarification", body: "for example, for instance, such as, including, in other words, that is, to illustrate, specifically. Example: 'I study multiple languages. For instance, I am fluent in English and conversational in French.' These help you support arguments with specifics." },
    ],
    faqs: [
      { q: "Is using lots of linking words better for a higher IELTS band?", a: "No — overusing linking words sounds forced and lowers your score. Use them purposefully to guide logic, but let pronouns and clear sentence structure do most of the work." },
      { q: "Can I use the same linking word twice in one paragraph?", a: "Yes, but vary them. Repeating 'however' three times in a paragraph feels lazy. Alternate: 'however', 'on the other hand', 'in contrast'." },
      { q: "How much does cohesion count in the IELTS Writing band?", a: "Cohesion & Coherence is 25% of your Writing score (equal to Lexical Resource, Grammatical Range, Task Response). It is critical." },
    ],
    related: [
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/practice/ielts/", label: "Free IELTS Writing Practice" },
      { href: "/ielts-writing-task-2-templates/", label: "IELTS Writing Task 2 Templates" },
      { href: "/english-grammar-for-ielts/", label: "English Grammar for IELTS" },
    ] },
  { path: "/english-grammar-for-ielts/", title: "Essential English Grammar for IELTS Band 7+",
    desc: "Core grammar structures for IELTS — conditionals, passives, relative clauses and more. Free examples and Band 7 checklist.",
    kw: "ielts grammar, ielts grammar tips, english grammar for ielts, ielts conditional sentences, ielts relative clauses, ielts band 7 grammar, free ielts grammar guide",
    lead: "IELTS does not test grammar explicitly, but grammatical accuracy is 25% of your Writing band and affects Speaking fluency. Here are the structures that matter most.",
    sections: [
      { h: "Why grammar matters for IELTS", body: "Examiners score 'Grammatical Range & Accuracy' as a criterion. Band 7+ writers use a mix of simple, compound and complex sentences with few errors. Perfect grammar is not required, but errors must not distract the reader." },
      { h: "Conditional sentences (critical for essays)", body: "Zero conditional (fact): If + present tense, present tense. 'If you heat water to 100°C, it boils.' First conditional (possible future): If + present, will + base. 'If you study hard, you will pass.' Second conditional (unlikely/imaginary): If + past tense, would + base. 'If I won the lottery, I would travel.' Third conditional (impossible past): If + had + past participle, would have + past participle. 'If I had studied more, I would have scored higher.' Essays often use conditionals in arguments; master all four." },
      { h: "Passive voice (for objective writing)", body: "Form: be + past participle. Active: 'Scientists discovered a cure.' Passive: 'A cure was discovered.' Passive suits academic and formal writing — use it to shift focus from the actor to the action. But do not overuse; vary active and passive." },
      { h: "Relative clauses (for detail and sophistication)", body: "Defining: 'The student who studied hard passed.' Non-defining: 'John, who studied hard, passed.' Non-defining clauses add information in commas. Reduced relative clauses drop the relative pronoun: 'The book (that was) published last year is bestselling.' These structures show complexity and sophistication." },
      { h: "Present Perfect vs Past Simple", body: "Past Simple: finished action at a specific time. 'I completed my degree in 2023.' Present Perfect: action that happened at an unspecified time or continues to now. 'I have studied English for 5 years.' IELTS rewards accurate use of these — common errors lose points." },
      { h: "Common errors to avoid", body: "Subject-verb agreement: 'The data are clear' (not 'is'). Articles: 'I want to study in Canada' (not 'the Canada'). Prepositions: 'interested in' (not 'on'), 'apply for' (not 'apply to'). Fragments: 'Although I failed once. I eventually passed' is a fragment — combine to 'Although I failed once, I eventually passed.' These errors are caught quickly by examiners and lower your band." },
    ],
    faqs: [
      { q: "Do I need to use complex grammar for Band 7+?", a: "You need a mix of simple and complex sentences. Complex grammar with errors is worse than simple, accurate sentences. Accuracy matters more than complexity." },
      { q: "How many grammar errors am I allowed for Band 7?", a: "Band 7 allows occasional errors that do not impede meaning. Band 8 requires rare errors. A general rule: fewer than 5 errors per 250-word essay." },
      { q: "Is there a grammar section on IELTS?", a: "No — there is no explicit grammar test. Grammar is assessed as part of Writing and Speaking through the criteria of Grammatical Range & Accuracy." },
    ],
    related: [
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/practice/ielts/", label: "Free IELTS Practice" },
      { href: "/ielts-writing-task-2-templates/", label: "IELTS Writing Task 2 Templates" },
      { href: "/ielts-linking-words/", label: "IELTS Linking Words" },
    ] },
  { path: "/ielts-reading-question-types/", title: "IELTS Reading Question Types & Strategies",
    desc: "Every IELTS Reading question type explained — True/False/Not Given, matching, multiple choice and gap-fill strategies. Free practice tips.",
    kw: "ielts reading question types, ielts reading true false not given, ielts reading strategies, ielts reading tips, free ielts reading practice, ielts band 7 reading",
    lead: "IELTS Reading tests 13 distinct question types. Here's each one, the trap to watch and the fastest approach to get them right.",
    sections: [
      { h: "Overview of IELTS Reading", body: "IELTS Academic Reading has 40 questions across 3 passages. You get 60 minutes (no separate reading time). Passages range from academic to popular articles (200–950 words). Questions test your ability to scan for detail, understand main ideas and infer meaning — not your prior knowledge." },
      { h: "True / False / Not Given (TFNG)", body: "The statement is True if the passage confirms it, False if the passage contradicts it, Not Given if the passage does not mention it. Trap: many choose False when it is Not Given, or vice versa. Strategy: find the relevant sentence in the passage and match it word-for-word or by paraphrase. If you cannot find the info, it is Not Given." },
      { h: "Yes / No / Not Given (similar logic)", body: "Same as TFNG but used for opinions. Yes = the writer believes this, No = the writer rejects this, Not Given = the writer does not comment. This appears less frequently but follows the same logic." },
      { h: "Multiple choice (4 options, 1 answer)", body: "Read the question stem carefully. Underline the key word. Scan the passage for that idea. Eliminate options that are too extreme, contradict the text, or cite unrelevant details. The correct answer is usually a paraphrase, not the exact words from the passage." },
      { h: "Matching: people, descriptions or features", body: "Match names (e.g. scientists) to ideas or statements. Strategy: scan for each name or phrase in the passage, read the sentence, then find the matching description. Use process of elimination — if you are unsure, mark and come back." },
      { h: "Matching headings to paragraphs", body: "Each paragraph or section gets a heading from a longer list. Strategy: read the paragraph first (do not read the passage word-for-word), identify the main idea, then find the best heading. Headings often paraphrase main ideas; avoid those that cite minor details." },
      { h: "Sentence completion and short-answer gap-fill", body: "Complete a sentence with 1–3 words from the passage (usually). Strategy: read the gapped sentence, identify the grammar needed, then scan the passage for the missing word or phrase. Copy exactly — spelling and grammar matter." },
      { h: "Summary, classification and table completion", body: "Summary: fill in blanks using words from the passage to complete a paragraph summary. Classification: match items to categories. Table: complete cells with passage data. All reward scanning for specific facts, not understanding the whole passage. Strategy: read the table or summary skeleton, scan for matching data, copy exactly." },
    ],
    faqs: [
      { q: "How much time should I spend on each passage?", a: "Aim for 20 minutes per passage (60 ÷ 3). Do not get stuck on hard questions — mark and move on, return if you have time." },
      { q: "Should I read the whole passage first?", a: "Not for every question. For main-idea questions, read the passage. For detail questions (TFNG, gap-fill), scan using keywords. Develop a balance of quick reading and scanning." },
      { q: "What is the difference between False and Not Given?", a: "False means the passage says the opposite. Not Given means the passage does not mention it at all. This distinction is the most common mistake." },
    ],
    related: [
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/practice/ielts/", label: "Free IELTS Reading Practice" },
      { href: "/ielts-band-guides/", label: "IELTS Band Score Guides" },
      { href: "/academic-vocabulary-for-essays/", label: "Academic Vocabulary for Essays" },
    ] },
  { path: "/academic-vocabulary-for-essays/", title: "Academic Vocabulary & Collocations for Higher Writing Bands",
    desc: "Academic vocabulary and collocations for IELTS, TOEFL and GRE essays. Free phrasal lists and frequency vocabulary.",
    kw: "academic vocabulary, academic collocations, ielts vocabulary, essay vocabulary, academic english phrases, band 7 vocabulary, free vocabulary list",
    lead: "High-band essays use precise, topic-appropriate vocabulary. Here are academic phrases and collocations that raise your score, grouped by function.",
    sections: [
      { h: "What examiners mean by 'vocabulary range'", body: "Examiners score your use of synonyms, topic-specific words and precise collocations (words that naturally go together). Repeating 'good' and 'bad' costs you points; using 'beneficial', 'advantageous', 'detrimental' and 'adverse' shows range. Band 7+ writers vary vocabulary and use words accurately." },
      { h: "Academic collocations for essays", body: "Phrase: 'raise awareness' (not 'increase awareness'). 'Pose a challenge' (not 'create a challenge'). 'Have a significant impact' (not 'make a big effect'). 'Draw a conclusion' (not 'reach a conclusion'). These are idiomatic and high-frequency in academic writing. Master them and your essays sound more authoritative." },
      { h: "Argument-building vocabulary", body: "To support an idea: corroborate, substantiate, lend credence, buttress. To challenge: undermine, contradict, refute, dispute, challenge. To weaken: attenuate, diminish, reduce, mitigate. To strengthen: bolster, fortify, reinforce. Using these verbs instead of 'say' or 'think' significantly raises your band." },
      { h: "Topic-specific academic phrases", body: "For education: curriculum, pedagogical approach, assessment method, academic rigour. For environment: sustainable, biodiversity, fossil fuels, carbon footprint. For technology: digital divide, artificial intelligence, automation, cyber security. Learn 5–10 phrases per topic you might encounter and use them naturally." },
      { h: "Signposting and transition vocabulary", body: "To introduce ideas: It is widely recognised that, It is argued that, One perspective is that. To show emphasis: Notably, Crucially, Importantly. To qualify: To some extent, To a large degree, Arguably. These phrases guide the reader and show sophistication." },
      { h: "Band 7+ vocabulary checklist", body: "Avoid: good, bad, nice, very, really, a lot. Replace with precise synonyms: excellent, poor, pleasant, significantly, considerably, substantial. Use synonyms — do not repeat 'important' three times in an essay; use 'significant', 'crucial', 'vital'. Use verb precision — not 'go up' but 'surge', 'escalate', 'skyrocket' (depending on context)." },
    ],
    faqs: [
      { q: "How many new vocabulary words should I learn per week?", a: "Aim for 20–30 new words or phrases, but use them in practice essays so you internalise them, not just memorise." },
      { q: "Is using difficult words better for a higher score?", a: "Only if you use them accurately. A simple word used correctly scores higher than a difficult word used wrongly. Aim for precise and appropriate, not flashy." },
      { q: "Can I use the same vocabulary word twice in an essay?", a: "Yes, but vary it with synonyms when possible. One essay using 'important' once and 'significant' once and 'crucial' once shows more range than using 'important' three times." },
    ],
    related: [
      { href: "/mock-test/ielts/", label: "Free IELTS Mock Test" },
      { href: "/practice/ielts/", label: "Free IELTS Writing Practice" },
      { href: "/ielts-writing-task-2-templates/", label: "IELTS Writing Task 2 Templates" },
      { href: "/gre-vocabulary-list/", label: "GRE Vocabulary List" },
    ] },
];
CONTENT_HUBS.forEach(contentHub);

function buildHubs() {
  const UNI = new Set(COLLEGES.map((c) => c.id));
  const claimed = new Set();
  const sortL = (arr) => arr.sort((a, b) => a.label.localeCompare(b.label));
  const grab = (pred) => sortL(PAGES.filter((p) => !claimed.has(p.path) && pred(p.path)).map((p) => ({ href: p.path, label: labelOf(p.html) })));
  const examUni = (ex) => grab((path) => { const m = path.match(new RegExp(`^/${ex}-for-([a-z0-9]+)/$`)); return !!m && UNI.has(m[1]); });
  const hubs = [
    ["/ielts-scores-for-universities/", "IELTS Score Requirements for Top Universities", "The IELTS band each top university expects — with fees, rank and a free plan to hit the score, across the USA, UK, Canada, Australia, Germany, Ireland, NZ, Singapore & the Netherlands.", "ielts score for university, ielts band for admission, ielts requirement university", () => [{ h: "IELTS score by university", links: examUni("ielts") }]],
    ["/toefl-scores-for-universities/", "TOEFL Score Requirements for Top Universities", "The TOEFL iBT score each top university expects, plus a free plan to reach it with full-length mock tests.", "toefl score for university, toefl requirement university, toefl ibt for admission", () => [{ h: "TOEFL score by university", links: examUni("toefl") }]],
    ["/pte-scores-for-universities/", "PTE Score Requirements for Top Universities", "The PTE Academic score each top university expects, plus a free plan to reach it.", "pte score for university, pte requirement university, pte academic for admission", () => [{ h: "PTE score by university", links: examUni("pte") }]],
    ["/compare-universities/", "Compare Top Universities Side by Side", "Side-by-side comparisons of top universities — rank, fees, acceptance rate, English requirement and programmes — to pick the right fit, free.", "compare universities, university comparison, which university is better", () => [{ h: "University comparisons", links: grab((p) => /^\/compare\//.test(p)) }]],
    ["/study-abroad-courses/", "Study Abroad by Course & Country", "Where to study an MS, MBA or specialised master's by country — costs, top universities, entry requirements and ROI, free.", "ms in usa, mba abroad, ms computer science abroad, study abroad by country", () => [{ h: "Courses by country", links: grab((p) => /^\/study-abroad\//.test(p)) }]],
    ["/scholarships/", "Scholarships to Study Abroad (Fully & Partially Funded)", "Scholarships for international students — eligibility, award and deadlines — grouped by country and by award. Free scholarship finder.", "scholarships to study abroad, fully funded scholarships, international student scholarships", () => [{ h: "Scholarships", links: grab((p) => /^\/scholarship/.test(p)) }]],
    ["/ielts-band-guides/", "IELTS Band Score Guides — Band 6 to Band 8", "How to reach each IELTS band overall and by section (Listening, Reading, Writing, Speaking) — free tips, strategy and practice.", "ielts band 7, how to get ielts band 8, ielts band requirements, ielts band by section", () => [{ h: "IELTS band guides", links: grab((p) => /^\/ielts-band-/.test(p)) }]],
    ["/english-test-comparisons/", "English Test Comparisons — IELTS vs TOEFL vs PTE vs Duolingo", "Honest, free comparisons of the major English tests so you take the right one for your country and goal.", "ielts vs toefl, ielts vs pte, which english test, duolingo vs ielts", () => [{ h: "Comparisons & chooser", links: grab((p) => (/-vs-[a-z]+\/$/.test(p) && !/^\/compare\//.test(p)) || /^\/which-english-test\/$/.test(p)) }]],
    ["/exam-requirements-by-country/", "English Test Requirements by Country & Profession", "The English test and score you need for study, PR and professional registration in each country — IELTS, PTE, CELPIP and more.", "ielts for canada pr, ielts for nurses uk, english test for immigration, celpip for canada", () => [{ h: "By country, PR & profession", links: grab((p) => /-for-[a-z0-9-]+\/$/.test(p) || /^\/celpip-/.test(p)) }]],
    ["/blog/", "Study Abroad & Exam-Prep Blog", "Free guides on IELTS/TOEFL/PTE prep, study-abroad visas, scholarships and immigration news for 2026.", "study abroad blog, ielts tips, student visa news, scholarship guides", () => [{ h: "Latest articles", links: grab((p) => /^\/blog\//.test(p)) }]],
  ];
  for (const [path, title, desc, kw, mk] of hubs) {
    hubPage(path, title, desc, kw, mk()).forEach((h) => claimed.add(h));
  }
  // Master HTML sitemap — hubs + every page no hub claimed (guarantees zero orphans).
  const leftovers = sortL(PAGES.filter((p) => !claimed.has(p.path) && !HUB_LINKS.some((h) => h.href === p.path)).map((p) => ({ href: p.path, label: labelOf(p.html) })));
  hubPage("/explore/", "Explore Every Free LandingPrep Page", "A complete index of LandingPrep — every free mock test, score guide, university, scholarship, comparison and article in one place.", "landingprep sitemap, all free ielts toefl pte resources, study abroad index", [
    { h: "Main hubs", links: HUB_LINKS.filter((h) => h.href !== "/explore/") },
    { h: "All other free pages", links: leftovers },
  ]);
}
buildHubs();

// ── Honest <lastmod> ───────────────────────────────────────────────────────────
// Google ignores (and can distrust) sitemaps that stamp every URL with "today" on
// every build. So we only advance a page's lastmod when its rendered HTML actually
// changed: diff the new HTML against the on-disk copy BEFORE overwriting, and reuse
// the previous lastmod (read back from the existing sitemap) for unchanged pages.
const BUILD_DATE = (() => { try { return new Date().toISOString().slice(0, 10); } catch (e) { return TODAY; } })();
const PRIOR_LASTMOD = (() => {
  const map = new Map();
  try {
    const xml = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
    const re = /<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;
    let m; while ((m = re.exec(xml))) map.set(m[1].trim(), m[2].trim());
  } catch (e) { /* first run — no prior sitemap */ }
  return map;
})();
const lastmodFor = new Map();

// Write files (capturing change status before overwriting)
PAGES.forEach(({ path, html }) => {
  const dir = join(ROOT, path);
  const file = join(dir, "index.html");
  let changed = true;
  try { changed = readFileSync(file, "utf8") !== html; } catch (e) { changed = true; /* new page */ }
  const loc = ORIGIN + path;
  lastmodFor.set(loc, changed ? BUILD_DATE : (PRIOR_LASTMOD.get(loc) || BUILD_DATE));
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, html);
});

// Sitemap
const urls = [
  { loc: `${ORIGIN}/`, freq: "daily", pri: "1.0" },
  ...PAGES.map((p) => ({ loc: ORIGIN + p.path, freq: "weekly", pri: "0.8" })),
];
// The SPA homepage ships a fresh build every deploy, so it legitimately changes.
lastmodFor.set(`${ORIGIN}/`, BUILD_DATE);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmodFor.get(u.loc) || BUILD_DATE}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
    <xhtml:link rel="alternate" hreflang="en-IN" href="${u.loc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.loc}"/>
  </url>`).join("\n")}
</urlset>
`;
writeFileSync(join(ROOT, "sitemap.xml"), sitemap);

// robots.txt — allow all search + AI crawlers (visibility in Google AND AI answers)
writeFileSync(join(ROOT, "robots.txt"), `# LandingPrep — 100% Free Exam Prep Platform
# Fully open to search engines and AI answer engines.
# All content is freely accessible — no paywalls, no signup required.

# Default: allow all crawlers
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

# ── Google Search & Indexing ──
User-agent: Googlebot
Allow: /
User-agent: Googlebot-Image
Allow: /
User-agent: Googlebot-Video
Allow: /

# ── Google AI Overviews (Generative Engine Optimization) ──
# Google's AI answer engine — explicitly allowed to cite LandingPrep for free exam prep, study abroad, and scholarship content.
User-agent: Google-Extended
Allow: /

# ── OpenAI / ChatGPT (All variants) ──
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /

# ── Anthropic Claude ──
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /

# ── Perplexity AI ──
User-agent: PerplexityBot
Allow: /

# ── Microsoft Bing & AI ──
User-agent: Bingbot
Allow: /
User-agent: MSNBot
Allow: /

# ── Apple (Siri & Spotlight search) ──
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /

# ── Amazon Alexa / Shopping ──
User-agent: Amazonbot
Allow: /

# ── Yandex (Russian search) ──
User-agent: YandexBot
Allow: /

# ── DuckDuckGo ──
User-agent: DuckDuckBot
Allow: /

# ── Other major AI crawlers ──
User-agent: CCBot
Allow: /
User-agent: facebookexternalhit
Allow: /
User-agent: Twitterbot
Allow: /
User-agent: LinkedInBot
Allow: /

# Sitemap for all 697 prerendered pages
Sitemap: ${ORIGIN}/sitemap.xml

# Feed for blog posts
Sitemap: ${ORIGIN}/feed.xml
`);

// ── llms.txt + llms-full.txt (AI / answer-engine discovery — GEO) ────────────
const llms = `# LandingPrep — 100% Free Exam Prep & Study Abroad

> LandingPrep is a 100% free platform for English-test preparation, language learning, and studying abroad. Everything is free forever — no signup, no credit card, no paywall. Used by students in India, USA, UK, Canada, Australia, Germany, and 180+ countries.

## Key pages
- [Free IELTS mock tests](${ORIGIN}/mock-test/ielts/): full Academic & General mocks with instant band scoring (also TOEFL, PTE, CELPIP, Duolingo, GRE, GMAT)
- [Which English test should I take?](${ORIGIN}/which-english-test/): compare IELTS, TOEFL, PTE, CELPIP & Duolingo
- [Explore all free tools & practice](${ORIGIN}/explore/): the full LandingPrep hub
- [College predictor & study abroad](${ORIGIN}/#/colleges): admission chances across 99+ universities
- [Scholarships for international students](${ORIGIN}/scholarships/): fully-funded & partial awards
- [Free alternatives to paid prep](${ORIGIN}/free-alternatives/): a genuinely free option vs. paid coaching
- [Blog & study-abroad guides](${ORIGIN}/blog/): exam strategy, visa and scholarship guides

## Core Services (All Free)

### 1. Mock Tests & Practice (1,000+ full-length tests)
- **IELTS (Academic & General)**: Real exam timing, all 4 sections, instant band scoring (0–9)
- **TOEFL iBT**: Reading, Listening, Speaking, Writing — scored 0–120
- **PTE Academic**: Speaking & Writing, Reading, Listening — scored 10–90
- **CELPIP**: Listening, Reading, Writing, Speaking — scored 1–12 (for Canadian PR)
- **Duolingo English Test**: Adaptive + Writing & Speaking — scored 10–160
- **GRE General Test**: Verbal, Quantitative, Analytical Writing — scored 260–340
- **GMAT Focus**: Quant, Verbal, Data Insights — scored 205–805

All include real exam question types, answer explanations, and sample solutions.

### 2. AI-Powered Feedback Tools
- **IELTS Writing Band Checker**: Paste an essay → get estimated band (6–9) with IELTS rubric feedback (Task Response, Coherence & Cohesion, Lexical Range, Grammatical Accuracy), corrections, and Band 9 model answer.
- **IELTS Speaking Band Checker**: Record a Part 2 response → estimated band with fluency feedback.
- **AI Speaking Partner**: Two-way voice conversation that auto-corrects mistakes in real time.

### 3. Free Prep Lessons & Strategy (600+ slides across 24 decks)
- IELTS section-by-section strategy (Listening, Reading, Writing, Speaking)
- TOEFL, PTE, CELPIP, GRE, and GMAT Focus strategy decks
- German A1 & French A1 beginner courses (30 lessons each, with audio)

### 4. Vocabulary Resources
- IELTS/TOEFL topic vocabulary (definitions, Band 9 synonyms, audio pronunciation)
- GRE/GMAT word lists for Quant and Verbal sections

### 5. Study Abroad Toolkit (Free)
- **College Predictor**: Enter your exam scores → see your admission chances at 99+ universities (USA, UK, Canada, Australia, Germany, Ireland, New Zealand, Singapore, Netherlands)
- **University Profiles**: Fees, deadlines, application process, IELTS/TOEFL/PTE requirements for each university
- **Scholarships Database**: Fully-funded and partial awards for international students (sorted by country, field, eligibility)
- **SOP/LOR/CV Builder**: AI-guided templates to write Statement of Purpose, Letter of Recommendation, and CV
- **Compare Universities & Countries**: Side-by-side costs, visa requirements, post-study work rights, and quality of life
- **Visa Interview Practice**: Common questions for UK, USA, Canada, Australia
- **Immigration & PR Roadmaps**: Step-by-step guides for Canadian Express Entry, Australian PR, UK Settlement, New Zealand residence visas

## Exam Requirements by Country (Free Lookup)
- **Canada** (Express Entry / PR): IELTS General Training (CLB 7–9), CELPIP, PTE Core
- **Australia** (Skilled Migration): IELTS, PTE Academic (Competent 6.0–Superior 8.0)
- **UK** (Student Visa & Settlement): IELTS UKVI, Secure English Language Tests
- **USA** (University Admissions): TOEFL iBT 80–100+ (varies by university); GRE 155+ Verbal
- **Germany** (Master's programmes): TOEFL 80–95, GRE 155+ Quant
- **New Zealand** (Residence Visa): IELTS 6.5+ overall

## Free High-Intent Tools
- **IELTS Band Score Calculator**: Convert raw scores to official bands (0–9)
- **English Test Score Converter**: IELTS ↔ TOEFL ↔ PTE ↔ CEFR equivalency lookup
- **Study Abroad Eligibility Checker**: Enter your score + target country → see visa & university requirements
- **Reading Speed Test**: Measure words-per-minute (WPM) to build IELTS/TOEFL reading pace

## Key Facts
- **Cost**: 100% free, forever. No credit card. No paywalls. No freemium.
- **Format**: Browser-based (works on mobile, tablet, desktop). Offline study via PWA app.
- **Scoring**: Auto-scored objective sections + AI rubric feedback for Writing & Speaking.
- **Real Users**: 500,000+ students worldwide; strong Indian student base.
- **Owned Content**: All mock tests, lessons, and tools are built in-house — not resold third-party materials.

## Most-Used Pages & Entry Points
- Homepage: ${ORIGIN}/
- **IELTS Writing Band Checker** (free AI feedback): ${ORIGIN}/#/writing-checker
- **IELTS Speaking Band Checker**: ${ORIGIN}/#/speaking-checker
- **All Mock Tests** (IELTS, TOEFL, PTE, GRE, GMAT): ${ORIGIN}/#/exam-prep
- **Prep Lessons** (strategy decks for all exams): ${ORIGIN}/#/lessons
- **College Predictor** (check your admission chances): ${ORIGIN}/#/colleges
- **IELTS Vocabulary by Topic**: ${ORIGIN}/#/vocabulary
- **Band Score Guides** (how to get Band 7/7.5/8): ${ORIGIN}/ielts-band-7/
- **English Test Comparisons** (IELTS vs TOEFL vs PTE): ${ORIGIN}/ielts-vs-toefl/
- **Learn German Free** (A1 beginner course): ${ORIGIN}/#/learn
- **Learn French Free** (A1 beginner course): ${ORIGIN}/#/learn
- **Study Abroad Country Guides**: See /scholarships-in-*, /study-abroad-*, and /exam-requirements-by-country/

## Common Questions (answered by LandingPrep)
- **Free IELTS mock test** → ${ORIGIN}/#/exam-prep/ielts
- **IELTS band score calculator** → ${ORIGIN}/tools/ielts-band-score-calculator/
- **IELTS band 7 requirements** → ${ORIGIN}/ielts-band-7/
- **Which English test should I take?** → ${ORIGIN}/#/which-english-test
- **IELTS vs TOEFL — which is easier?** → ${ORIGIN}/ielts-vs-toefl/
- **Study abroad without IELTS** → See country-specific exemptions on college pages
- **Cheapest countries to study abroad** → Browse country guides on homepage
- **Scholarships for Indian students 2026** → ${ORIGIN}/#/colleges (scholarship finder)
- **Canadian PR English requirements** → ${ORIGIN}/ielts-for-canada-pr/
- **Best universities for MS in Canada** → ${ORIGIN}/#/colleges (predictor)

## Tagline
"From mock test to campus abroad — 100% free, forever."
`;
writeFileSync(join(ROOT, "llms.txt"), llms);

const groups = {};
for (const p of PAGES) { const k = p.path.split("/").filter(Boolean)[0] || "root"; (groups[k] = groups[k] || []).push(ORIGIN + p.path); }
const llmsFull = `# LandingPrep — full page index (for AI answer engines)\n\n> Complete list of LandingPrep's free, prerendered content pages. All are 100% free, no signup.\n\n- Homepage: ${ORIGIN}/\n\n` +
  Object.keys(groups).sort().map((k) => `## /${k}/\n` + groups[k].sort().map((u) => `- ${u}`).join("\n")).join("\n\n") + "\n";
writeFileSync(join(ROOT, "llms-full.txt"), llmsFull);

// ── humans.txt ──────────────────────────────────────────────────────────────
writeFileSync(join(ROOT, "humans.txt"), `/* TEAM */
Site: LandingPrep — free exam prep + study-abroad toolkit
Contact: support@landingprep.com
Location: Worldwide

/* SITE */
Standards: HTML5, CSS3, JavaScript, Schema.org JSON-LD
Components: React (prerendered static pages for SEO), Express backend, Gemini AI
Mission: From mock test to campus abroad — 100% free, no signup.
Last update: ${TODAY}
`);

// ── security.txt (RFC 9116) ─────────────────────────────────────────────────
const securityTxt = `Contact: mailto:support@landingprep.com
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: ${ORIGIN}/.well-known/security.txt
`;
mkdirSync(join(ROOT, ".well-known"), { recursive: true });
writeFileSync(join(ROOT, ".well-known", "security.txt"), securityTxt);
writeFileSync(join(ROOT, "security.txt"), securityTxt);

// ── RSS feed (blog) — helps crawl + freshness ───────────────────────────────
const rssItems = BLOG_EXTRA.map((a) => {
  let pub = TODAY;
  try { pub = new Date(a.date).toUTCString(); } catch (e) {}
  const link = `${ORIGIN}/blog/${a.id}/`;
  return `    <item>
      <title>${esc(a.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${pub}</pubDate>
      <description>${esc(a.excerpt || "")}</description>
    </item>`;
}).join("\n");
writeFileSync(join(ROOT, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>LandingPrep — Study Abroad &amp; Exam Prep Blog</title>
  <link>${ORIGIN}/#/blog</link>
  <description>Free IELTS, TOEFL, study-abroad and immigration tips from LandingPrep.</description>
  <language>en</language>
  <lastBuildDate>${(() => { try { return new Date().toUTCString(); } catch (e) { return TODAY; } })()}</lastBuildDate>
${rssItems}
</channel></rss>
`);

console.log(`Generated ${PAGES.length} SEO pages + sitemap.xml (${urls.length} urls) + robots.txt + llms.txt + llms-full.txt + humans.txt + security.txt + feed.xml`);
PAGES.forEach((p) => console.log("  " + p.path));
