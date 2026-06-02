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
    kw: "ielts band score calculator, ielts score calculator, calculate ielts band, ielts overall band",
    lead: "Convert your raw IELTS Listening and Reading answers into the official 0–9 band score and get your overall band in seconds." },
  "english-test-score-converter": { title: "English Test Score Converter (IELTS ↔ TOEFL ↔ PTE ↔ CEFR)", exam: "ielts",
    kw: "ielts to toefl, toefl to ielts, pte to ielts, ielts to pte conversion, cefr level converter, english score converter",
    lead: "Instantly convert between IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo and CEFR levels with one free tool." },
  "university-eligibility-checker": { title: "Study Abroad Eligibility Checker", exam: "ielts",
    kw: "study abroad eligibility, university english requirement, am i eligible to study abroad, english score for university",
    lead: "Enter your English-test score and target country to see whether you meet typical university and visa requirements." },
  "reading-speed-test": { title: "Reading Speed Test (Words Per Minute)", exam: "ielts",
    kw: "reading speed test, words per minute test, improve reading speed, wpm reading test, ielts reading speed",
    lead: "Measure your reading speed in words per minute and build the pace you need to finish IELTS, TOEFL and GRE reading on time." },
};

// ── HTML helpers ────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const jsonld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

function head({ title, desc, path, kw, jsonLdBlocks }) {
  const url = ORIGIN + path;
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
.faq dt{font-weight:700;margin-top:16px}.faq dd{margin:4px 0 0;color:#334155}
footer{border-top:1px solid var(--line);background:#fff;margin-top:40px;padding:26px 0;color:var(--muted);font-size:14px}
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
<footer><div class="wrap">© 2026 ${BRAND} — 100% free IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE &amp; GMAT practice for students worldwide. <a href="/">Home</a> · <a href="/#/exam-prep">All exams</a> · <a href="/#/colleges">Study abroad</a> · <a href="/#/blog">Blog</a> · <a href="/about/">About</a> · <a href="mailto:support@landingprep.com">support@landingprep.com</a></div></footer>
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

const PAGES = []; // { path, html }
function emit(path, html) { PAGES.push({ path, html }); }

// ── Page builders ───────────────────────────────────────────────────────────
function mockPage(id) {
  const e = EXAMS[id];
  const path = `/mock-test/${id}/`;
  const title = `Free ${e.name} Mock Test 2026 — Full-Length Practice Online | ${BRAND}`;
  const desc = `Take a free full-length ${e.name} mock test online with real exam timing, ${e.sections} sections and instant scoring. No signup, no payment — built for students in India and worldwide.`;
  const kw = `free ${e.short.toLowerCase()} mock test, ${e.short.toLowerCase()} practice test, ${e.name} mock test 2026, free ${e.short.toLowerCase()} test online, ${e.short.toLowerCase()} sample test, ${e.short.toLowerCase()} full test free`;
  const faqs = [
    { q: `Is this ${e.name} mock test really free?`, a: `Yes. Every ${e.name} mock test on ${BRAND} is 100% free with no signup, no credit card and no hidden paywall.` },
    { q: `Does the mock test match the real ${e.name}?`, a: `It mirrors the official ${e.name} format, timing and question types across ${e.sections}, scored on the ${e.score} scale.` },
    { q: `How is my ${e.short} score calculated?`, a: `Objective sections are auto-scored instantly; writing and speaking get AI rubric feedback so you see a realistic ${e.score} estimate.` },
    { q: `Can I practise ${e.short} on mobile?`, a: `Yes — ${BRAND} works in any browser on phone, tablet or laptop and even installs as an app for offline study.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/exam-prep">Exams</a> › ${e.name} mock test</p>
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
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Exams", path: "/#/exam-prep" }, { name: `${e.name} Mock Test`, path }]),
  ] }) + shell(inner));
}

function practicePage(id) {
  const e = EXAMS[id];
  const path = `/practice/${id}/`;
  const title = `${e.name} Practice Test Online — Free Section Practice 2026 | ${BRAND}`;
  const desc = `Free ${e.name} practice tests online: drill each section (${e.sections}) with answers, explanations and AI feedback. No signup. Perfect for ${e.for}.`;
  const kw = `${e.short.toLowerCase()} practice test, ${e.short.toLowerCase()} practice online free, ${e.name} sample questions, ${e.short.toLowerCase()} section practice, free ${e.short.toLowerCase()} preparation`;
  const faqs = [
    { q: `How can I practise ${e.short} for free?`, a: `Open ${BRAND}, pick ${e.name}, and choose a full mock or a single section. Everything is free with instant feedback.` },
    { q: `Which ${e.short} sections can I practise?`, a: `All of them: ${e.sections}. Each section can be practised on its own or as part of a full test.` },
    { q: `Do I get answer explanations?`, a: `Yes — every objective question shows the correct answer, and you can ask the AI tutor to explain the reasoning.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/exam-prep">Exams</a> › ${e.name} practice</p>
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
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Exams", path: "/#/exam-prep" }, { name: `${e.name} Practice`, path }]),
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
<p class="crumb"><a href="/">Home</a> › <a href="/#/exam-prep">Exams</a> › ${e.short} for ${d.country}</p>
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
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Exams", path: "/#/exam-prep" }, { name: `${e.short} for ${d.country}`, path }]),
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
  const kw = `top universities in ${d.name.toLowerCase()}, study in ${d.name.toLowerCase()}, ms in ${d.name.toLowerCase()}, ${d.name.toLowerCase()} university fees, ${d.name.toLowerCase()} ielts requirement, best colleges in ${d.name.toLowerCase()} for international students, ${d.name.toLowerCase()} admission process`;
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
  const kw = `scholarships in ${d.name.toLowerCase()}, fully funded scholarships ${d.name.toLowerCase()}, study in ${d.name.toLowerCase()} scholarship, ${d.name.toLowerCase()} scholarships for international students, masters scholarship ${d.name.toLowerCase()}, scholarship to study abroad`;
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
function blogPage(a) {
  const path = `/blog/${a.id}/`;
  const title = `${a.title} | ${BRAND}`;
  const desc = a.excerpt.slice(0, 230);
  const kw = a.kw || (a.tag + ", study abroad, " + a.title.toLowerCase());
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/blog">Blog</a> › ${esc(a.tag)}</p>
<section class="hero">
  <div class="badges"><span class="badge">${esc(a.tag)}</span><span class="badge">Updated ${esc(a.date || "2026")}</span></div>
  <h1>${esc(a.title)}</h1>
  <p class="lead">${esc(a.excerpt)}</p>
  <a class="cta" href="/#/colleges">▶ Free College Predictor &amp; study-abroad tools</a>
</section>
${a.sections.map(s => `<div class="card"><h2>${esc(s.h)}</h2><p>${esc(s.body)}</p></div>`).join("\n")}
${relatedGrid([
  { label: `🌍 Study-abroad destinations`, href: `/#/colleges` },
  { label: `💸 Scholarships`, href: `/#/colleges` },
  { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `All blog articles`, href: `/#/blog` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.excerpt,
      author: { "@type": "Organization", name: BRAND }, publisher: { "@type": "Organization", name: BRAND }, datePublished: "2026-01-01", inLanguage: "en" }),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/#/blog" }, { name: a.title, path }]),
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
      { q: "Can I practise speaking German with AI for free?", a: "Yes — our AI speaking partner holds a real two-way German conversation, replies in the natural German voice and gives the English translation, so you can practise anytime." },
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
      { q: "Can I practise speaking French with AI?", a: "Yes — our AI partner chats with you in simple French (with English translations) and speaks in the natural French voice." },
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
  const title = `Free Exam Prep Lessons — IELTS, TOEFL, German &amp; French Tips &amp; Strategy | ${BRAND}`;
  const desc = `Free slide lessons (PPT-style) for IELTS, TOEFL, PTE, GRE, GMAT, German &amp; French — tips, tricks, traps and section-by-section strategy with examples. Learn first, then practise with free mocks.`;
  const kw = "ielts listening tips, free exam prep lessons, ielts strategy, ielts listening practice tips, toefl tips, exam preparation slides, ielts question types, learn german tips, study abroad exam strategy, ielts listening band 8 tips";
  const faqs = [
    { q: "Are the prep lessons free?", a: "Yes — every slide lesson on LandingPrep is 100% free, with no signup. Learn the strategy, then practise with our free mock tests." },
    { q: "What do the IELTS Listening tips cover?", a: "Format, all question types, the word-limit rule, distractor traps, synonyms/paraphrasing, and a section-by-section game plan — 30 slides with examples." },
    { q: "Do you have lessons for German and French?", a: "Yes — German and French foundation decks cover pronunciation, gender (der/die/das, le/la), verbs and a smart learning plan." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › Prep Lessons</p>
<section class="hero">
  <div class="badges"><span class="badge">100% Free</span><span class="badge">Tips &amp; traps</span><span class="badge">With examples</span></div>
  <h1>Free Exam Prep Lessons — Learn the Strategy First</h1>
  <p class="lead">Quick, visual slide lessons for every exam section — tips, tricks, traps and worked examples. Master the strategy here, then practise with our free mock tests.</p>
  <a class="cta" href="/#/lessons">▶ Open the free prep lessons</a>
</section>
<div class="card">
  <h2>What's inside</h2>
  <ul>
    <li><strong>IELTS Listening</strong> — 30 slides: format, all 8 question types, traps, word-limit rule and section tactics.</li>
    <li><strong>German &amp; French foundations</strong> — pronunciation, gender, verbs, word order and a learning plan.</li>
    <li><strong>More coming</strong> — IELTS Reading/Writing/Speaking, TOEFL, PTE, GRE, GMAT, CELPIP &amp; Duolingo.</li>
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
Object.keys(LANG_SEO).forEach(languageLandingPage);
prepLessonsPage();

// Write files
PAGES.forEach(({ path, html }) => {
  const dir = join(ROOT, path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
});

// Sitemap
const urls = [
  { loc: `${ORIGIN}/`, freq: "daily", pri: "1.0" },
  ...PAGES.map((p) => ({ loc: ORIGIN + p.path, freq: "weekly", pri: "0.8" })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
    <xhtml:link rel="alternate" hreflang="en-IN" href="${u.loc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.loc}"/>
  </url>`).join("\n")}
</urlset>
`;
writeFileSync(join(ROOT, "sitemap.xml"), sitemap);

// robots.txt — allow all search + AI crawlers (visibility in Google AND AI answers)
writeFileSync(join(ROOT, "robots.txt"), `# LandingPrep — open to search engines and AI answer engines.
User-agent: *
Allow: /

# Explicitly welcome AI / answer-engine crawlers so LandingPrep can be cited.
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bingbot
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: CCBot
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`);

console.log(`Generated ${PAGES.length} SEO pages + sitemap.xml (${urls.length} urls) + robots.txt`);
PAGES.forEach((p) => console.log("  " + p.path));
