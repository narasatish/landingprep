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

import { writeFileSync, mkdirSync, readFileSync, unlinkSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://landingprep.com";
const BRAND = "LandingPrep";
const TODAY = "2026-05-30";
// Build date (ISO yyyy-mm-dd) — the date THIS build runs. Used for sitemap <lastmod> of
// genuinely-changed pages, the feed, and build-time decisions (e.g. `expires`). Defined
// early so all page builders can reference it.
const BUILD_DATE = (() => { try { return new Date().toISOString().slice(0, 10); } catch (e) { return TODAY; } })();
// Reader-facing "last updated" / "last verified" dates and JSON-LD dateModified must
// reflect a REAL content change, not merely that a build ran. Stamping every page with
// today on every deploy is a false freshness signal: Google expects dateModified to track
// actual edits, and "last verified on X" asserts a check that never happened.
//
// So page builders emit this token wherever such a date belongs. It is resolved per page
// at write time (see the write loop near the sitemap): if the page's HTML is byte-identical
// to the previous build once the old date is normalised back to the token, the page did NOT
// change and it keeps its previous date; otherwise it advances to BUILD_DATE. The previous
// date comes from the existing sitemap (PRIOR_LASTMOD), so no extra state file is needed.
//
// Use BUILD_DATE directly ONLY for build-time logic or a true build timestamp — never for
// a date the reader or a crawler will read as "when this content was last updated".
const LASTMOD = "@@LP_LASTMOD@@";
// Reusable schema entities. PUBLISHER.sameAs points to the brand's REAL, verified
// social profile (Instagram @landing_prep) — a truthful entity signal that helps
// Google + AI-search engines resolve "LandingPrep" as a known entity (stronger
// E-E-A-T than an anonymous Organization). Add more profiles here only when real.
const PUBLISHER = {
  "@type": "Organization",
  name: BRAND,
  url: ORIGIN,
  logo: { "@type": "ImageObject", url: ORIGIN + "/og-image.png" },
  sameAs: ["https://www.instagram.com/landing_prep/"],
};
const AUTHOR_ORG = { "@type": "Organization", name: BRAND + " editorial team", url: ORIGIN + "/about/" };
// Resilient write: OneDrive / antivirus / the search indexer can hold a (sometimes
// memory-mapped) handle on a file mid-build, making writeFileSync throw EBUSY/EPERM/
// UNKNOWN and abort the whole generation. Retry with a short back-off; if the existing
// file is locked, unlink it first (drops the mapping) so the next write creates fresh.
function writeFileSafe(file, data) {
  // Skip files whose content is already identical. The repo lives on OneDrive, where each
  // write can hit EBUSY/UNKNOWN and fall into the blocking back-off below — rewriting all
  // ~1,357 pages when a handful changed is what makes a build take minutes.
  try { if (readFileSync(file, "utf8") === data) return; } catch (_) { /* new file */ }
  for (let attempt = 1; ; attempt++) {
    try { writeFileSync(file, data); return; }
    catch (e) {
      if (attempt >= 25 || !/EBUSY|EPERM|UNKNOWN|EACCES|user-mapped/i.test(String(e.code || e.message))) throw e;
      try { unlinkSync(file); } catch (_) {}
      const until = Date.now() + Math.min(400 * attempt, 2000);
      while (Date.now() < until) { /* blocking back-off before retry */ }
    }
  }
}

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
  { label: "SOP, LOR & motivation samples", href: "/sop-samples/" },
  { label: "Visa interview questions", href: "/visa-interview/" },
  { label: "Intakes & deadlines by country", href: "/intakes/" },
  { label: "Test requirements by country", href: "/exam-requirements-by-country/" },
  { label: "How LandingPrep works", href: "/how-it-works/" },
  { label: "Free alternatives", href: "/free-alternatives/" },
  { label: "Embed widget", href: "/embed/" },
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
const BLOG_EXTRA = (_cw.LP_BLOG_EXTRA || []).filter((p) => p && p.id);
try { new Function("window", readFileSync(join(ROOT, "sop-samples.jsx"), "utf8"))(_cw); } catch (e) { console.warn("sop-samples load failed:", e.message); }
const SOP_SAMPLES = (_cw.LP_SOP_SAMPLES || []).filter((s) => s && s.id);
try { new Function("window", readFileSync(join(ROOT, "visa-interview-data.jsx"), "utf8"))(_cw); } catch (e) { console.warn("visa-interview load failed:", e.message); }
const VISA_INTERVIEWS = (_cw.LP_VISA_INTERVIEWS || []).filter((v) => v && v.id);
let EXAM_PATTERNS = {};
try { EXAM_PATTERNS = JSON.parse(readFileSync(join(ROOT, "data", "exam-patterns.json"), "utf8").replace(/^﻿/, "")); } catch (e) { console.warn("exam-patterns load failed:", e.message); }

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
  oet:      { name: "OET (Occupational English Test)", short: "OET", score: "0–500 (A–E)", scale: "grade", appPath: "oet",
              for: "healthcare registration & migration (nurses, doctors, pharmacists & more)",
              accepted: "healthcare boards in the UK, Ireland, Australia, New Zealand, Canada, USA & more",
              sections: "Listening, Reading, Writing, Speaking" },
  // ACT and SAT had full practice content in content/ and NO landing page of their own, so
  // neither could rank for anything. Section figures are ACT's own published numbers for the
  // enhanced test (English 50q/35min, Math 45q/50min, Reading 36q/40min, Science optional).
  act:      { name: "ACT", short: "ACT", score: "1–36 Composite", scale: "composite", appPath: "act",
              for: "undergraduate admission to US & Canadian universities",
              accepted: "all US universities and many colleges in Canada",
              sections: "English, Mathematics, Reading (Science & Writing optional)" },
  sat:      { name: "Digital SAT", short: "SAT", score: "400–1600", scale: "points", appPath: "sat",
              for: "undergraduate admission to US universities & scholarship consideration",
              accepted: "US universities plus a growing number in the UK, Canada & Australia",
              sections: "Reading & Writing, Math (adaptive modules)" },
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
    lead: "Enter your four IELTS section scores to get your official overall band instantly — or use the raw-score table to convert Listening & Reading answers to a band.",
    widget: `<div class="card" id="lp-tool">
  <h2>Your overall IELTS band</h2>
  <p>Enter your four section scores (0–9, half bands allowed). Your <strong>overall band</strong> is the average of the four, rounded to the nearest half band using the <strong>official IELTS rounding rule</strong>.</p>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
    <label>Listening<input id="ib_l" type="number" step="0.5" min="0" max="9" inputmode="decimal" placeholder="e.g. 7.5" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Reading<input id="ib_r" type="number" step="0.5" min="0" max="9" inputmode="decimal" placeholder="e.g. 6.5" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Writing<input id="ib_w" type="number" step="0.5" min="0" max="9" inputmode="decimal" placeholder="e.g. 6.5" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Speaking<input id="ib_s" type="number" step="0.5" min="0" max="9" inputmode="decimal" placeholder="e.g. 7.0" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button class="cta" id="ib_btn" type="button" style="margin-top:12px;border:0;cursor:pointer;font-size:15px">Calculate overall band</button>
  <div id="ib_out" aria-live="polite" style="margin-top:14px"></div>
</div>
<script>(function(){
  function g(id){return document.getElementById(id);}
  function val(id){var el=g(id);if(!el||el.value==='')return null;var v=parseFloat(el.value);return isNaN(v)?NaN:v;}
  function calc(){
    var out=g('ib_out');if(!out)return;
    var s=[val('ib_l'),val('ib_r'),val('ib_w'),val('ib_s')];
    for(var i=0;i<4;i++){
      if(s[i]===null){out.innerHTML='<div class="callout"><span class="ic">✏️</span><div>Enter all four section scores (0–9) to see your overall band.</div></div>';return;}
      if(isNaN(s[i])||s[i]<0||s[i]>9){out.innerHTML='<div class="callout warn"><span class="ic">⚠️</span><div>Each band must be a number between 0 and 9.</div></div>';return;}
    }
    var avg=(s[0]+s[1]+s[2]+s[3])/4;
    var band=Math.round(avg*2)/2; // official IELTS rule: .25 rounds up to .5; .75 rounds up to the next whole band
    out.innerHTML='<div class="callout money"><span class="ic">🎯</span><div>'
      +'<strong style="font-size:20px">Overall band: '+band.toFixed(1)+'</strong><br>'
      +'Average of your four scores = '+avg.toFixed(2)+', rounded to the nearest half band.<br>'
      +'<span style="color:var(--muted);font-size:13px">Official rounding: an average ending in .25 rounds up to the next half band (e.g. 6.25 → 6.5); ending in .75 rounds up to the next whole band (e.g. 6.75 → 7.0).</span></div></div>';
  }
  var b=g('ib_btn');if(b)b.addEventListener('click',calc);
  ['ib_l','ib_r','ib_w','ib_s'].forEach(function(id){var el=g(id);if(el)el.addEventListener('input',calc);});
})();</script>`,
    ref: `<div class="card"><h2>IELTS raw score → band score (Listening &amp; Academic Reading)</h2><p>Both the Listening and Academic Reading tests have 40 questions. Your number of correct answers maps to a band as shown below (these are the widely-published bands and can vary slightly by test version).</p><table class="cmp-table"><thead><tr><th>Band</th><th>Listening (out of 40)</th><th>Academic Reading (out of 40)</th></tr></thead><tbody><tr><td><strong>9.0</strong></td><td>39–40</td><td>39–40</td></tr><tr><td><strong>8.5</strong></td><td>37–38</td><td>37–38</td></tr><tr><td><strong>8.0</strong></td><td>35–36</td><td>35–36</td></tr><tr><td><strong>7.5</strong></td><td>32–34</td><td>33–34</td></tr><tr><td><strong>7.0</strong></td><td>30–31</td><td>30–32</td></tr><tr><td><strong>6.5</strong></td><td>26–29</td><td>27–29</td></tr><tr><td><strong>6.0</strong></td><td>23–25</td><td>23–26</td></tr><tr><td><strong>5.5</strong></td><td>18–22</td><td>19–22</td></tr><tr><td><strong>5.0</strong></td><td>16–17</td><td>15–18</td></tr></tbody></table><p class="note">General Training Reading needs slightly more correct answers for the same band. Your overall band is the average of the four skills, rounded to the nearest 0.5. Always treat these as a guide and confirm with the official band descriptors.</p></div>` },
  "english-test-score-converter": { title: "English Test Score Converter (IELTS ↔ TOEFL ↔ PTE ↔ CEFR)", exam: "ielts",
    kw: "ielts to toefl converter, toefl to ielts score conversion, pte to ielts equivalency, ielts to pte converter free, cefr level calculator, english test score equivalency",
    lead: "Instantly convert between IELTS, TOEFL iBT, PTE Academic, Duolingo and CEFR levels with one free tool.",
    widget: `<div class="card" id="lp-tool">
  <h2>Convert your score</h2>
  <p>Pick the test you took, enter your score, and see the approximate equivalent in the other tests. Based on the official concordance tables — always confirm the exact requirement your university or visa accepts.</p>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">
    <label>Your test<select id="cv_test" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"><option value="ielts">IELTS</option><option value="toefl">TOEFL iBT</option><option value="pte">PTE Academic</option><option value="duo">Duolingo</option></select></label>
    <label>Your score<input id="cv_score" type="number" step="0.5" inputmode="decimal" placeholder="e.g. 7.0" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button class="cta" id="cv_btn" type="button" style="margin-top:12px;border:0;cursor:pointer;font-size:15px">Convert</button>
  <div id="cv_out" aria-live="polite" style="margin-top:14px"></div>
</div>
<script>(function(){
  var ROWS=[
    {ielts:9.0,toefl:[118,120],pte:[89,90],cefr:'C2',duo:[160,160]},
    {ielts:8.0,toefl:[110,114],pte:[83,86],cefr:'C1',duo:[145,145]},
    {ielts:7.5,toefl:[102,109],pte:[79,82],cefr:'C1',duo:[130,135]},
    {ielts:7.0,toefl:[94,101],pte:[73,78],cefr:'C1',duo:[120,125]},
    {ielts:6.5,toefl:[79,93],pte:[65,72],cefr:'B2',duo:[110,115]},
    {ielts:6.0,toefl:[60,78],pte:[59,64],cefr:'B2',duo:[105,105]},
    {ielts:5.5,toefl:[46,59],pte:[51,58],cefr:'B2',duo:[95,95]},
    {ielts:5.0,toefl:[35,45],pte:[43,50],cefr:'B1',duo:[80,80]}
  ];
  function g(id){return document.getElementById(id);}
  function pick(test,score){
    var best=null,bd=1e9;
    for(var i=0;i<ROWS.length;i++){var r=ROWS[i],d;
      if(test==='ielts'){d=Math.abs(r.ielts-score);}
      else{var rg=r[test];if(score>=rg[0]&&score<=rg[1])return r;d=Math.min(Math.abs(score-rg[0]),Math.abs(score-rg[1]));}
      if(d<bd){bd=d;best=r;}}
    return best;
  }
  function rng(a){return a[0]===a[1]?(''+a[0]):(a[0]+'–'+a[1]);}
  // pick() snaps to the NEAREST row, so without a bounds check a typo like IELTS "99"
  // silently returned a confident "IELTS 9.0 · C2" instead of flagging the input.
  var LIMITS={ielts:[0,9,'0–9'],toefl:[0,120,'0–120'],pte:[10,90,'10–90'],duo:[10,160,'10–160']};
  function calc(){
    var out=g('cv_out');if(!out)return;
    var test=g('cv_test').value,v=g('cv_score').value,sc=parseFloat(v);
    if(v===''||isNaN(sc)){out.innerHTML='<div class="callout"><span class="ic">✏️</span><div>Enter your score to see the equivalents.</div></div>';return;}
    var lim=LIMITS[test];
    if(lim&&(sc<lim[0]||sc>lim[1])){out.innerHTML='<div class="callout"><span class="ic">⚠️</span><div>Enter a valid score in the range <strong>'+lim[2]+'</strong> for this test.</div></div>';return;}
    var r=pick(test,sc);
    out.innerHTML='<div class="callout money"><span class="ic">🔁</span><div><strong>Approximate equivalent</strong><br>'
      +'IELTS <strong>'+r.ielts.toFixed(1)+'</strong> · TOEFL iBT <strong>'+rng(r.toefl)+'</strong> · PTE <strong>'+rng(r.pte)+'</strong> · CEFR <strong>'+r.cefr+'</strong> · Duolingo <strong>'+rng(r.duo)+'</strong>'
      +'<br><span style="color:var(--muted);font-size:13px">Approximate concordance — universities and visa systems set their own exact requirements. Confirm against the official source.</span></div></div>';
  }
  var b=g('cv_btn');if(b)b.addEventListener('click',calc);
  ['cv_test','cv_score'].forEach(function(id){var el=g(id);if(el)el.addEventListener('input',calc);});
})();</script>`,
    ref: `<div class="card"><h2>IELTS ↔ TOEFL iBT ↔ PTE ↔ CEFR ↔ Duolingo equivalences</h2><p>This is an approximate concordance based on the test makers' published comparison tables. Use it to estimate an equivalent score — universities and visa systems set their own exact requirements, so always confirm against the official source.</p><table class="cmp-table"><thead><tr><th>IELTS</th><th>TOEFL iBT</th><th>PTE Academic</th><th>CEFR</th><th>Duolingo</th></tr></thead><tbody><tr><td><strong>9.0</strong></td><td>118–120</td><td>89–90</td><td>C2</td><td>160</td></tr><tr><td><strong>8.0</strong></td><td>110–114</td><td>83–86</td><td>C1</td><td>145</td></tr><tr><td><strong>7.5</strong></td><td>102–109</td><td>79–82</td><td>C1</td><td>130–135</td></tr><tr><td><strong>7.0</strong></td><td>94–101</td><td>73–78</td><td>C1</td><td>120–125</td></tr><tr><td><strong>6.5</strong></td><td>79–93</td><td>65–72</td><td>B2</td><td>110–115</td></tr><tr><td><strong>6.0</strong></td><td>60–78</td><td>59–64</td><td>B2</td><td>105</td></tr><tr><td><strong>5.5</strong></td><td>46–59</td><td>51–58</td><td>B2</td><td>95</td></tr><tr><td><strong>5.0</strong></td><td>35–45</td><td>43–50</td><td>B1</td><td>80</td></tr></tbody></table><p class="note">Sources: the official ETS TOEFL–IELTS concordance, Pearson PTE score guide and Duolingo English Test comparison. Figures are approximate and updated periodically by the test makers — confirm the exact equivalence and the requirement your university or visa actually accepts.</p></div>` },
  "university-eligibility-checker": { title: "Study Abroad Eligibility Checker", exam: "ielts",
    kw: "study abroad eligibility checker, am i eligible to study abroad free, university english requirement checker, visa requirements by country, study abroad requirements by exam score",
    lead: "Enter your English-test score and target country to see whether you meet typical university and visa requirements.",
    ref: `<div class="card"><h2>Typical minimum English scores by destination</h2>
<p>These are the typical minimums the checker above scores you against — a realistic floor for mainstream undergraduate and taught-Master's entry. They are a starting point, not a guarantee.</p>
<table class="cmp-table"><thead><tr><th>Test</th><th>Canada</th><th>Australia</th><th>UK</th><th>USA</th><th>New Zealand</th><th>Germany</th></tr></thead><tbody>
<tr><td><strong>IELTS</strong> (band)</td><td>6.0</td><td>6.0</td><td>5.5</td><td>6.5</td><td>6.5</td><td>—</td></tr>
<tr><td><strong>TOEFL iBT</strong> (pts)</td><td>86</td><td>—</td><td>80</td><td>80</td><td>—</td><td>80</td></tr>
<tr><td><strong>PTE Academic</strong> (pts)</td><td>60</td><td>50</td><td>59</td><td>—</td><td>58</td><td>—</td></tr>
<tr><td><strong>CELPIP</strong> (level)</td><td>7</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
<tr><td><strong>Duolingo</strong> (pts)</td><td>110</td><td>—</td><td>110</td><td>105</td><td>—</td><td>—</td></tr>
</tbody></table>
<p class="note">A dash means that combination isn't a common route — not that the test is never accepted. Always confirm the exact requirement with the university and the visa authority.</p></div>
<div class="card"><h2>Why "eligible" is only half the answer</h2><ul class="bcheck">
<li><strong>The university minimum and the visa minimum are different bars.</strong> You must clear both, and they're set by different bodies — meeting one tells you nothing about the other.</li>
<li><strong>Per-section minimums catch people out.</strong> Many universities want an overall band <em>and</em> no individual band below a floor (often 5.5 or 6.0). A strong overall can still be rejected on one weak skill.</li>
<li><strong>Competitive courses sit well above the floor.</strong> Meeting the minimum makes you eligible, not competitive — top programmes often expect a band or two higher.</li>
<li><strong>Requirements shift.</strong> Visa English rules in particular change with policy; a figure that was right last intake may not be right this one.</li>
<li><strong>If you're just short on one skill</strong>, check whether your destination accepts <a href="/tools/ielts-one-skill-retake-calculator/">IELTS One Skill Retake</a> before rebooking the whole test.</li>
</ul></div>`,
    widget: `<div class="card" id="lp-tool">
  <h2>Check your eligibility</h2>
  <p>Pick your test and destination, then enter your score to see whether you clear the typical minimum. Minimums vary by university, course and visa stream — always verify with the official body.</p>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
    <label>Test<select id="el_test" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"><option value="ielts">IELTS</option><option value="toefl">TOEFL iBT</option><option value="pte">PTE Academic</option><option value="celpip">CELPIP</option><option value="duolingo">Duolingo</option></select></label>
    <label>Destination<select id="el_country" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"></select></label>
    <label>Your score<input id="el_score" type="number" step="0.5" inputmode="decimal" placeholder="score" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button class="cta" id="el_btn" type="button" style="margin-top:12px;border:0;cursor:pointer;font-size:15px">Check eligibility</button>
  <div id="el_out" aria-live="polite" style="margin-top:14px"></div>
</div>
<script>(function(){
  var ELIG={
    ielts:{name:'IELTS',countries:{Canada:6.0,Australia:6.0,UK:5.5,USA:6.5,'New Zealand':6.5}},
    toefl:{name:'TOEFL iBT',countries:{USA:80,Canada:86,Germany:80,UK:80}},
    pte:{name:'PTE Academic',countries:{Australia:50,Canada:60,UK:59,'New Zealand':58}},
    celpip:{name:'CELPIP',countries:{Canada:7}},
    duolingo:{name:'Duolingo',countries:{USA:105,Canada:110,UK:110}}
  };
  function g(id){return document.getElementById(id);}
  function fillCountries(){
    var t=g('el_test').value,sel=g('el_country');sel.innerHTML='';
    Object.keys(ELIG[t].countries).forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o);});
  }
  function calc(){
    var out=g('el_out');if(!out)return;
    var t=g('el_test').value,c=g('el_country').value,e=ELIG[t],min=e.countries[c];
    var v=g('el_score').value,s=parseFloat(v);
    if(v===''||isNaN(s)){out.innerHTML='<div class="callout"><span class="ic">✏️</span><div>Enter your '+e.name+' score to check eligibility.</div></div>';return;}
    if(s>=min){out.innerHTML='<div class="callout money"><span class="ic">✅</span><div><strong>Likely eligible for '+c+'</strong><br>You meet the typical '+e.name+' minimum of '+min+'. Always confirm the exact requirement on the official university or visa site.</div></div>';}
    else{out.innerHTML='<div class="callout warn"><span class="ic">⚠️</span><div><strong>Below the typical minimum for '+c+'</strong><br>Most programmes want '+e.name+' '+min+'+; you entered '+s+'. Keep practising — you are close!</div></div>';}
  }
  var ts=g('el_test');if(ts)ts.addEventListener('change',function(){fillCountries();g('el_out').innerHTML='';});
  var b=g('el_btn');if(b)b.addEventListener('click',calc);
  ['el_country','el_score'].forEach(function(id){var el=g(id);if(el)el.addEventListener('input',calc);});
  fillCountries();
})();</script>` },
  "reading-speed-test": { title: "Reading Speed Test (Words Per Minute)", exam: "ielts",
    kw: "reading speed test online free, words per minute test, improve reading speed ielts, wpm reading practice, ielts reading speed time management",
    lead: "Measure your reading speed in words per minute and build the pace you need to finish IELTS, TOEFL and GRE reading on time.",
    ref: `<div class="card"><h2>What your words-per-minute score means</h2>
<p>These are the bands this tool scores you against. They assume you actually read the passage for comprehension — skimming inflates the number without helping you answer questions.</p>
<table class="cmp-table"><thead><tr><th>Reading speed</th><th>What it means for timed exams</th></tr></thead><tbody>
<tr><td><strong>Under 120 wpm</strong></td><td>Slow — timed reading sections will be a real struggle. Daily reading practice is the fix, not speed tricks.</td></tr>
<tr><td><strong>120–179 wpm</strong></td><td>Average — workable, but you'll finish with little time to check answers. Push toward 200+.</td></tr>
<tr><td><strong>180–249 wpm</strong></td><td>Solid, exam-ready pace for IELTS, TOEFL and GRE reading.</td></tr>
<tr><td><strong>250+ wpm</strong></td><td>Excellent — provided comprehension holds up. Speed without accuracy scores nothing.</td></tr>
</tbody></table>
<p class="note">Reading speed only matters alongside comprehension. A 400 wpm skim that misses the writer's argument is worth less than a careful 200 wpm read.</p></div>
<div class="card"><h2>Why reading speed decides timed reading sections</h2><ul class="bcheck">
<li><strong>IELTS Academic Reading</strong> gives you 60 minutes for three passages and 40 questions — including the time to find and check each answer, not just to read.</li>
<li><strong>The bottleneck is usually re-reading</strong>, not raw speed. Every time you lose the thread and go back to the top of a paragraph, you pay twice.</li>
<li><strong>Build speed by reading more, not faster.</strong> Twenty minutes a day of real academic prose (news analysis, journal abstracts, long-form features) moves your pace far more reliably than speed-reading drills.</li>
<li><strong>Practise reading for structure first</strong> — what each paragraph <em>does</em>, not just what it says. Knowing where an answer lives is faster than re-scanning the whole passage.</li>
<li><strong>Retest every couple of weeks</strong> rather than daily; this tool rotates passages so you're not just re-reading a text you already know.</li>
</ul></div>`,
    widget: `<div class="card" id="lp-tool">
  <h2>Test your reading speed</h2>
  <p>This simply times how fast you read — no microphone. Tap start, read the passage at your normal pace, then tap stop to get your words-per-minute. IELTS, TOEFL and GRE reward 200+ wpm with good comprehension.</p>
  <div id="rs_ready">
    <p><strong id="rs_title">…</strong> · <span id="rs_wc">…</span> words</p>
    <button class="cta" id="rs_start" type="button" style="border:0;cursor:pointer;font-size:15px">▶ Start reading</button>
  </div>
  <div id="rs_reading" style="display:none">
    <div style="font-weight:600;margin:6px 0">⏱ <span id="rs_timer">0:00</span> — read at your normal pace, then tap stop</div>
    <p id="rs_text" style="line-height:1.75"></p>
    <button class="cta" id="rs_finish" type="button" style="border:0;cursor:pointer;font-size:15px">⏹ I've finished — show my speed</button>
  </div>
  <div id="rs_out" aria-live="polite" style="margin-top:12px"></div>
</div>
<script>(function(){
  var PASSAGES=[
    {t:"Urban Green Spaces",x:"Cities around the world are rediscovering the value of green spaces. For much of the twentieth century, urban planners prioritised roads, factories and housing, treating parks as a pleasant but optional extra. That attitude has shifted dramatically. Researchers now understand that access to trees, grass and water has measurable effects on physical and mental health. People who live near parks report lower levels of stress, take more exercise, and recover from illness more quickly than those surrounded only by concrete. Green spaces also perform practical functions that are easy to overlook. Trees absorb rainfall and reduce the risk of flooding during heavy storms. Their leaves filter dust and pollutants from the air, while their shade lowers temperatures during increasingly frequent heatwaves. A single mature tree can cool the area around it as effectively as several air conditioners, but without consuming electricity or releasing additional heat. Wildlife benefits too, as parks and gardens provide corridors that allow birds, insects and small mammals to move safely through the built environment. Despite these advantages, green space is unevenly distributed. Wealthier neighbourhoods often enjoy generous parks and tree-lined streets, while poorer districts may have almost none. Closing this gap has become a priority for many city governments, which are now planting trees, converting derelict land into community gardens, and even installing gardens on rooftops. The challenge is considerable, because land in growing cities is expensive and competition for it is fierce. Yet the evidence is increasingly clear: investing in nature is not a luxury but a sensible strategy for healthier, more resilient cities."},
    {t:"The Science of Sleep",x:"Sleep occupies roughly a third of human life, yet for centuries it was dismissed as a passive state in which little of importance happened. Modern research has overturned that view completely. Far from switching off, the brain is intensely active during sleep, carrying out tasks that are essential for memory, learning and health. During the deepest stages of sleep, the brain consolidates the day's experiences, transferring fragile new memories into more stable long-term storage. Skills that are practised before sleep are often performed better the following morning, as if the brain has continued rehearsing them overnight. Sleep also appears to clear away waste products that accumulate in brain tissue during waking hours, a kind of nightly cleaning that may help protect against disease. The consequences of insufficient sleep are serious and wide-ranging. People who regularly sleep too little show reduced concentration, weaker immune responses and a greater risk of heart disease, diabetes and depression. Reaction times slow, and the ability to regulate emotions declines, making conflicts and mistakes more likely. Despite this, sleep is frequently sacrificed in modern societies that prize productivity and offer endless distractions on glowing screens. Scientists recommend a consistent schedule, a cool and dark bedroom, and a deliberate wind-down period before bed. They warn that no amount of weekend recovery can fully repair the damage of chronic sleep loss. Understanding sleep, then, is not merely an academic exercise but a practical necessity for anyone who wishes to think clearly and live well."}
  ];
  var P=PASSAGES[Math.floor(Math.random()*PASSAGES.length)];
  var TEXT=P.x;
  var WORDS=TEXT.trim().split(' ').filter(function(x){return x.length>0;}).length;
  var start=0,timer=null;
  function g(id){return document.getElementById(id);}
  function fmt(sec){return Math.floor(sec/60)+':'+String(sec%60<0?0:sec%60).padStart(2,'0');}
  g('rs_title').textContent=P.t;
  g('rs_wc').textContent=WORDS;
  g('rs_text').textContent=TEXT;
  g('rs_start').addEventListener('click',function(){
    start=(new Date()).getTime();g('rs_out').innerHTML='';g('rs_ready').style.display='none';g('rs_reading').style.display='';
    timer=setInterval(function(){var s=Math.max(0,Math.round(((new Date()).getTime()-start)/1000));g('rs_timer').textContent=fmt(s);},250);
  });
  g('rs_finish').addEventListener('click',function(){
    if(timer){clearInterval(timer);timer=null;}
    var secs=((new Date()).getTime()-start)/1000;
    g('rs_reading').style.display='none';g('rs_ready').style.display='';
    var out=g('rs_out');
    if(secs<15){out.innerHTML='<div class="callout warn"><span class="ic">🤔</span><div>That was too quick to be a real read — tap start and read the whole passage at your normal pace.</div></div>';return;}
    var w=Math.round(WORDS/(secs/60));
    if(w>700){out.innerHTML='<div class="callout warn"><span class="ic">🤔</span><div>That was too quick to be a real read — read the whole passage at your normal pace.</div></div>';return;}
    var verdict=w>=250?'Excellent':w>=180?'Solid — exam-ready pace':w>=120?'Average — push for 200+ wpm':'Slow — practise daily reading';
    out.innerHTML='<div class="callout money"><span class="ic">⚡</span><div><strong style="font-size:20px">'+w+' wpm</strong> · '+verdict+'<br><span style="color:var(--muted);font-size:13px">You read '+WORDS+' words in '+fmt(Math.round(secs))+'. Aim for 200+ wpm with strong comprehension for timed exam reading.</span></div></div>';
  });
})();</script>` },
};

// ── HTML helpers ────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const jsonld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

// SEO hygiene: keep <title> ≤ ~60 chars (preserving the "| Brand" suffix) and the meta
// description ≤ ~158 chars, trimmed on a word boundary so Google doesn't cut them mid-word.
// A word-boundary cut can land INSIDE a parenthetical, leaving an orphaned opening bracket
// that ships verbatim to the SERP — "Study in Canada 2026: Complete Guide (Costs | Brand".
// Trailing-punctuation stripping does not catch it because the "(" is not at the end. When
// the cut orphaned a bracket, drop the whole incomplete parenthetical: a clean shorter title
// reads better than half a phrase. Loops because a title may contain more than one.
function dropUnclosedParen(s) {
  if (!s) return s;
  let out = s;
  while ((out.match(/\(/g) || []).length > (out.match(/\)/g) || []).length) {
    const at = out.lastIndexOf("(");
    if (at < 0) break;
    out = out.slice(0, at).replace(/\s*&[a-z0-9#;]*$/i, "").replace(/[\s,;:&|·•–—-]+$/, "");
  }
  return out;
}
// Cutting on a word boundary keeps whole words but not whole PHRASES. Two ways it still
// ships a broken snippet to the SERP:
//   1. it strands a function word — "Working While Studying Abroad: Rules by"
//   2. it severs a comma/ampersand list — "Best Countries to Study Abroad 2026: USA",
//      where the real title continues ", Canada, UK, Australia".
// Both read as a sentence that got interrupted. Walk the cut back to the last point the
// text is grammatically self-contained; a shorter complete title beats a longer broken one.
const STRANDED_WORD = /[\s]+(?:and|or|the|a|an|for|with|to|in|of|by|on|from|vs|via|your|&)$/i;
// Words that exist to modify a NOUN that follows. If the untrimmed title continues with
// another word, a title ending on one of these is a noun phrase sliced in half —
// "IELTS to TOEFL Score Conversion: Official" (…Concordance Table 2026).
const STRANDED_MODIFIER = /[\s]+(?:official|complete|full|free|best|top|new|higher|common|detailed|comprehensive|ultimate|essential|advanced|basic|sample|real|latest|proof|accepted)$/i;
// Runs to a fixed point, because each repair can expose the next one: dropping the stranded
// "vs" from "…Should I Take? IELTS vs" reveals that "IELTS" is itself a severed list item.
function dropDanglingTail(base, source) {
  let out = base, prev;
  do {
    prev = out;
    // `source` is the untrimmed text this was cut from, so what follows the cut tells us
    // whether we landed mid-list. Separator may be a comma, an ampersand or " vs ".
    if (/^\s*(?:[,&]|vs\b)/i.test(source.slice(out.length))) {
      // Fall back to the previous complete list item. If the severed item was the FIRST one
      // after a colon, drop the whole colon clause rather than leave a trailing "Title:".
      // A "?" is kept — "Which English Test Should I Take?" is complete on its own.
      const at = Math.max(out.lastIndexOf(","), out.lastIndexOf(":"), out.lastIndexOf("?"));
      // Stop retreating once the title is only the generic head. Because this loop runs to a
      // fixed point, an unguarded fallback walks back through every comma to the first colon:
      // "IELTS Speaking Part 2: Cue Cards, Structure & Model Answers" collapsed all the way to
      // "IELTS Speaking Part 2" — which then collided with a DIFFERENT page trimmed to the same
      // stub. A slightly long title is harmless; two pages sharing one title is not.
      const KEEP_MIN = 30;
      if (at > 20 && at >= KEEP_MIN) out = out.slice(0, out[at] === "?" ? at + 1 : at);
    }
    // Cut landed mid-phrase (the source continues straight into another word).
    if (/^\s*[A-Za-z0-9]/.test(source.slice(out.length))) out = out.replace(STRANDED_MODIFIER, "");
    out = out.replace(STRANDED_WORD, "").replace(/[\s,;:&|·•–—-]+$/, "");
  } while (out !== prev && out.length > 20);
  return out;
}
function trimTitle(t) {
  if (!t || t.length <= 60) return t;
  const i = t.lastIndexOf(" | ");
  if (i > 12) {
    const brand = t.slice(i);
    const source = t.slice(0, i).replace(/\s*\(2026\)\s*$/, "");
    let base = source;
    const room = 60 - brand.length;
    if (base.length > room) { const cut = base.slice(0, room); const sp = cut.lastIndexOf(" "); base = dropDanglingTail((sp > 20 ? cut.slice(0, sp) : cut).replace(/\s*&[a-z0-9#;]*$/i, "").replace(/[\s,;:&|·•–—-]+$/, ""), source); }
    return dropUnclosedParen(base) + brand;
  }
  const cut = t.slice(0, 60); const sp = cut.lastIndexOf(" "); return dropUnclosedParen(dropDanglingTail((sp > 20 ? cut.slice(0, sp) : cut).replace(/\s*&[a-z0-9#;]*$/i, "").replace(/[\s,;:&|·•–—-]+$/, ""), t));
}
function trimDesc(d) {
  if (!d || d.length <= 160) return d;
  const cut = d.slice(0, 157); const sp = cut.lastIndexOf(" ");
  // Same orphaned-bracket problem as trimTitle, but the fix differs. A description is a
  // sentence, and the parenthetical (typically a cost breakdown) often starts early — so
  // DROPPING it, as trimTitle does, would bin most of the useful text and leave a 60-char
  // description in a 160-char budget. Closing the bracket instead keeps the content and
  // still reads correctly: "(accommodation GBP 700-1,200, food GBP 250-400, transport…)".
  const base = (sp > 120 ? cut.slice(0, sp) : cut).replace(/[\s,;:–-]+$/, "");
  const unclosed = (base.match(/\(/g) || []).length - (base.match(/\)/g) || []).length;
  return base + "…" + (unclosed > 0 ? ")".repeat(unclosed) : "");
}
// Shorten long university names so <title>s stay complete (never trimmed mid-name
// by trimTitle). Explicit map for the big, commonly-searched ones; generic rules
// for the rest ("University of Manchester" → "Manchester", "RMIT University" → "RMIT").
const UNI_ABBR = {
  "Technical University of Munich": "TU Munich", "University College Dublin": "UCD",
  "London School of Economics": "LSE", "London School of Economics and Political Science": "LSE",
  "RMIT University": "RMIT", "RWTH Aachen University": "RWTH Aachen",
  "Nanyang Technological University": "NTU", "University College Cork": "UCC",
  "Karlsruhe Institute of Technology": "KIT",
  // The three UC campuses shared ONE <title> — "University of California" — because
  // trimTitle's 60-char clamp cut mid-word and dropDanglingTail then fell back to the last
  // comma, which for these names is part of the name, not a list separator. Three distinct
  // campuses competing on an identical title is a duplicate-content problem of our own
  // making. These abbreviations are also what people actually search for.
  "University of California, Berkeley": "UC Berkeley",
  "University of California, Los Angeles": "UCLA",
  "University of California, San Diego": "UC San Diego",
};
function shortUni(name) {
  const n = String(name || "").trim();
  // Many college names already carry their abbreviation, e.g. "…Munich (TUM)" — use it.
  const paren = n.match(/\(([A-Z][A-Za-z&.\- ]{1,10})\)\s*$/);
  if (paren) return paren[1].trim();
  return UNI_ABBR[n] || n.replace(/^The /, "").replace(/^University of /, "").replace(/ University$/, "").trim();
}
function head({ title, desc, path, kw, jsonLdBlocks, robots, canonical }) {
  const url = ORIGIN + path;
  // `canonical` points this page at a different URL — used to consolidate a near-duplicate
  // into the stronger page without deleting it (no 404, no lost backlinks). Prefer this over
  // noindex for duplicates: noindex drops the page's link equity instead of passing it on.
  const canonicalUrl = canonical || url;
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
<meta name="robots" content="${robots || "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"}"/>
<link rel="canonical" href="${canonicalUrl}"/>
<link rel="alternate" type="application/rss+xml" title="LandingPrep Blog" href="${ORIGIN}/feed.xml"/>
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
${(jsonLdBlocks || []).filter(Boolean).map((b) => typeof b === "string" ? b : jsonld(b)).join("\n")}
<style>
:root{--brand:#4F46E5;--brand2:#7C3AED;--ink:#0f172a;--muted:#64748b;--bg:#f7f9fc;--card:#fff;--line:#e8edf4;--shadow-sm:0 1px 2px rgba(16,24,40,.05);--shadow:0 1px 2px rgba(16,24,40,.04),0 10px 28px -14px rgba(16,24,40,.14);--shadow-lg:0 16px 40px -16px rgba(16,24,40,.22)}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:var(--bg);line-height:1.6;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
a{color:var(--brand);text-decoration:none}a:hover{text-decoration:underline}
/* WCAG 1.4.1 (Use of Colour): a link sitting INSIDE a block of text must not be
   identifiable by colour alone — colour-blind readers cannot see it. Underline prose links
   only. Standalone links (CTAs, cards, tiles, breadcrumbs, related-list boxes) are exempt
   under 1.4.1 because their shape/border already distinguishes them from surrounding text,
   so they keep the clean look. */
/* footer>.wrap>a is a CHILD selector on purpose: the footer's own inline links sit directly
   in .wrap among grey prose, but nav.hubnav lives in there too and its links are a nav row,
   not prose. A descendant selector would underline the whole hub nav. */
p a,td a,dd a,footer>.wrap>a{text-decoration:underline;text-underline-offset:2px}
/* Exclusions must OUT-SPECIFY the rule above (one class beats two elements), so these are
   written as class selectors rather than :not() chains — a :not() chain inherits the
   specificity of its argument and would lose to nothing, silently underlining every card. */
p a.cta,p a.backlink,p a.tile,.crumbs a,.hubnav a,.rel-list li a,.tile,.cta{text-decoration:none}
a:focus-visible,button:focus-visible,.cta:focus-visible,input:focus-visible{outline:2px solid var(--brand);outline-offset:2px;border-radius:6px}
.wrap{max-width:1000px;margin:0 auto;padding:0 20px}
.wrap p,.card>p,.lead{max-width:820px}
header.nav{background:#fff;border-bottom:1px solid var(--line)}
header.nav .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.logo{font-weight:800;font-size:20px;color:var(--brand)}
.cta{display:inline-block;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff!important;padding:13px 24px;border-radius:12px;font-weight:700;text-decoration:none;box-shadow:0 8px 18px -6px rgba(79,70,229,.45);transition:transform .15s ease,box-shadow .15s ease}
.cta:hover{transform:translateY(-2px);box-shadow:0 12px 24px -6px rgba(79,70,229,.55);text-decoration:none}
.cta:active{transform:translateY(0)}
.hero{padding:54px 0 28px}.hero h1{font-size:clamp(28px,4vw,40px);line-height:1.14;letter-spacing:-.022em;margin:0 0 14px}
.lead{font-size:18px;color:var(--muted);margin:0 0 22px}
.badges{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}
.badge{background:#eef2ff;color:var(--brand);font-weight:600;font-size:13px;padding:6px 12px;border-radius:999px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px 26px;margin:18px 0;box-shadow:var(--shadow)}
h2{font-size:24px;margin:30px 0 12px;letter-spacing:-.018em}h3{margin:18px 0 6px;letter-spacing:-.01em}
ul{padding-left:20px}li{margin:6px 0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin:14px 0}
.tile{display:block;background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 16px;font-weight:600;box-shadow:var(--shadow-sm);transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}
.tile:hover{border-color:var(--brand);transform:translateY(-2px);box-shadow:var(--shadow);text-decoration:none}
.related-articles{margin:28px 0 8px}.related-articles h2{font-size:20px;margin:0 0 12px}
.rel-list{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:8px}
.rel-list li{margin:0}.rel-list li a{display:block;padding:12px 16px;background:#fff;border:1px solid var(--line);border-radius:12px;font-size:14px;font-weight:600;color:var(--brand);line-height:1.4;box-shadow:var(--shadow-sm);transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}
.rel-list li a:hover{border-color:var(--brand);transform:translateY(-2px);box-shadow:var(--shadow);text-decoration:none}
.faq dt{font-weight:700;margin-top:16px}.faq dd{margin:4px 0 0;color:#334155}
footer{border-top:1px solid var(--line);background:#fff;margin-top:40px;padding:26px 0;color:var(--muted);font-size:14px}
.hubnav{margin:0 0 14px;line-height:1.9;font-size:13px}.hubnav a{color:var(--brand);font-weight:600}
.crumb{font-size:13px;color:var(--muted);margin:14px 0}
/* Explicit colour, not var(--muted): at 13px the muted token measures 4.51:1 on the page
   background — it passes AA by 0.01, so any future tweak to the token would silently break it. */
.updated{margin:26px 0 4px;padding-top:12px;border-top:1px solid var(--line,#e5e7eb);color:#475569;font-size:13px}
.note{font-size:14px;color:var(--muted);font-style:italic}
.backlink{display:inline-flex;align-items:center;gap:6px;margin:18px 0 0;padding:7px 15px 7px 12px;border-radius:999px;background:#fff;border:1px solid var(--line);color:var(--ink);font-weight:600;font-size:14px}
.backlink:hover{background:var(--brand);color:#fff;border-color:var(--brand);text-decoration:none}
.backlink span{font-size:16px;line-height:1}
.uni-banner{display:flex;align-items:center;gap:20px;margin:14px 0 0;padding:26px 24px;border-radius:20px;color:#fff;box-shadow:var(--shadow-lg)}
.uni-logo{flex:0 0 auto;width:78px;height:78px;border-radius:16px;background:rgba(255,255,255,.16);display:grid;place-items:center;font-size:26px;font-weight:800;letter-spacing:.02em;border:1px solid rgba(255,255,255,.25)}
.uni-banner-info h1{margin:6px 0 6px;font-size:clamp(24px,3.5vw,34px);color:#fff;line-height:1.1}
.uni-flag{font-size:13px;font-weight:700;opacity:.92;text-transform:uppercase;letter-spacing:.04em}
.uni-addr{font-size:14px;opacity:.95}.uni-addr a{color:#fff;text-decoration:underline}
@media(max-width:560px){.uni-banner{flex-direction:column;text-align:center;align-items:center}}
.uni-stats{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin:14px 0 4px}
.uni-stat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:15px 10px;text-align:center;box-shadow:var(--shadow-sm);transition:transform .15s ease,box-shadow .15s ease}
.uni-stat:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
.uni-stat-v{font-size:19px;font-weight:800;color:var(--brand);line-height:1.15}
.uni-stat-l{font-size:11px;color:var(--ink-3,#667085);margin-top:3px;font-weight:600;text-transform:uppercase;letter-spacing:.03em}
@media(max-width:760px){.uni-stats{grid-template-columns:repeat(3,1fr)}}
@media(max-width:420px){.uni-stats{grid-template-columns:repeat(2,1fr)}}
.uni-tips li{margin-bottom:4px}
.cmp-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:15px}
.cmp-table th,.cmp-table td{border:1px solid var(--line);padding:10px 12px;text-align:left;vertical-align:top}
.cmp-table thead th{background:#eef2ff;color:var(--brand);font-weight:700}
.cmp-table td:first-child{background:#f8fafc;width:120px}
.bsteps{list-style:none;counter-reset:bs;padding:0;margin:12px 0;display:flex;flex-direction:column;gap:10px}
.bsteps li{counter-increment:bs;position:relative;padding:12px 16px 12px 50px;border:1px solid var(--line);border-radius:11px;background:#fff}
.bsteps li::before{content:counter(bs);position:absolute;left:12px;top:11px;width:26px;height:26px;border-radius:999px;background:var(--brand);color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}
.bcheck{list-style:none;padding:0;margin:10px 0;display:flex;flex-direction:column;gap:7px}
.bcheck li{position:relative;padding-left:26px}
.bcheck li::before{content:"✓";position:absolute;left:0;color:var(--brand);font-weight:800}
.callout{display:flex;gap:10px;align-items:flex-start;padding:13px 16px;border-radius:11px;margin:12px 0;border:1px solid var(--line)}
.callout .ic{font-size:17px;flex-shrink:0}
.callout.info{border-left:4px solid #4f46e5;background:#eef2ff}
.callout.tip{border-left:4px solid #16a34a;background:#ecfdf5}
.callout.money{border-left:4px solid #d97706;background:#fffbeb}
.callout.warn{border-left:4px solid #dc2626;background:#fef2f2}
.callout.key{border-left:4px solid #7c3aed;background:#f5f3ff}
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
© 2026 ${BRAND} — 100% free IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE &amp; GMAT practice for students worldwide. <a href="/">Home</a> · <a href="/#/exam-prep">All exams</a> · <a href="/#/colleges">Study abroad</a> · <a href="/about/">About</a> · <a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="mailto:support@landingprep.com">support@landingprep.com</a></div></footer>
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

// ── Affiliate / partner CTA block (monetisation, SEO-safe) ────────────────────
// Reads config/affiliates.json (shared with server.js /go/<slug>). Renders only ACTIVE
// partners for the requested slugs, always with:
//  • rel="sponsored nofollow noopener" (Google REQUIRES paid links be tagged; untagged
//    money links from a low-authority domain are a real penalty risk),
//  • a visible disclosure (legally required — India's ASCI code — and an E-E-A-T signal),
//  • links to same-site /go/<slug> (which is robots-Disallowed) rather than the raw
//    partner URL, so no crawlable money link and the affiliate code stays in one place.
// Returns "" if no requested partner is active, so a page never shows an empty shell.
let AFFILIATES = { partners: {}, disclosure: "" };
try { AFFILIATES = JSON.parse(readFileSync(join(ROOT, "config", "affiliates.json"), "utf8")); } catch (e) { /* no monetisation configured */ }
function affiliateBlock(slugs, heading) {
  const active = slugs.filter((s) => AFFILIATES.partners[s] && AFFILIATES.partners[s].active !== false);
  if (!active.length) return "";
  const cards = active.map((slug) => {
    const p = AFFILIATES.partners[slug];
    return `<a class="tile" href="/go/${esc(slug)}" rel="sponsored nofollow noopener" target="_blank"><strong>${esc(p.name)}</strong><br><span class="muted">${esc(p.blurb || "")}</span><br><span style="color:var(--brand);font-weight:600">${esc(p.cta || "Visit →")}</span></a>`;
  }).join("");
  return `<div class="card"><h2>${esc(heading || "Recommended services")}</h2>
<p class="note" style="font-size:13px">${esc(AFFILIATES.disclosure || "")}</p>
<div class="grid">${cards}</div></div>`;
}

// Topic-cluster internal linking: the 6 most topically-related OTHER blog posts,
// scored by shared tag + keyword + title-word overlap. Builds real topic clusters
// (distributes link equity, deepens crawl) while staying visually clean.
const EXAM_MOCK = { IELTS: "ielts", TOEFL: "toefl", PTE: "pte", GRE: "gre", GMAT: "gmat", CELPIP: "celpip", Duolingo: "duolingo" };
function relatedArticles(a) {
  const aKw = new Set(String(a.kw || "").toLowerCase().split(/,\s*/).filter(Boolean));
  const aTitleWords = new Set(a.title.toLowerCase().split(/\W+/).filter((w) => w.length > 4));
  // Topic overlap (shared countries/exams/keywords) should outweigh a shared generic
  // tag — so a country-news post recommends related country guides, not random news.
  const score = (p) => {
    let s = p.tag === a.tag ? 2 : 0;
    for (const k of String(p.kw || "").toLowerCase().split(/,\s*/)) if (k && aKw.has(k)) s += 3;
    for (const w of p.title.toLowerCase().split(/\W+/)) if (w.length > 4 && aTitleWords.has(w)) s += 2;
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
const THIN_PATHS = new Set(); // thin pages → noindex,follow + excluded from sitemap (concentrates crawl budget on substantive pages)
// Near-duplicates consolidated into a stronger page via rel=canonical. They stay live and
// indexable-by-status (no noindex, so link equity still flows to the canonical target) but
// are kept OUT of the sitemap — a sitemap should only list canonical URLs.
const CANONICALISED_PATHS = new Set();
const THIN_MIN_CHARS = 1500; // below this much unique <main> text = thin/templated
// KEEP_INDEXED — exam×university + compare pages that the blanket prune wrongly noindexed despite
// proven Search-Console traction: these 26 rank page 2–3 (positions 8–27) with real impressions
// (GSC export 2026-06-25), and carry substantive content (~400–600 body words, 4–7 sections) — i.e.
// they are on the HELPFUL side of the quality ratio, not thin doorways. Re-indexing only the proven
// performers (while ~440 zero-impression combos stay pruned) is "quality over quantity" done right.
const KEEP_INDEXED = new Set([
  // The AI Speaking checker is a real product feature, not a thin doorway — but its unique
  // <main> text is 1,337 chars against the 1,500 gate, so the blanket prune noindexed it and
  // dropped it from the sitemap. Its identical twin, the Writing checker, sits at 1,561 and is
  // indexed. Same feature, same value to a reader, split by 163 characters. It is also pitched
  // as a linkable asset in docs/backlink-outreach-kit.md, and earning links to a noindexed page
  // wastes the outreach. This is exactly the "wrongly caught by the blanket prune" case.
  "/ielts-speaking-checker/",
  "/ielts-for-tum/", "/ielts-for-sydney/", "/ielts-for-rwth/", "/ielts-for-ucd/", "/ielts-for-nyu/",
  "/ielts-for-ubc/", "/ielts-for-dalhousie/", "/ielts-for-vuw/", "/ielts-for-uiuc/", "/ielts-for-adelaide/",
  "/ielts-for-waterloo/", "/pte-for-rmit/", "/pte-for-canterbury/", "/pte-for-tum/", "/toefl-for-lse/",
  "/toefl-for-ntu/", "/toefl-for-concordia/", "/toefl-for-waterloo/", "/toefl-for-ucd/", "/toefl-for-uts/",
  "/compare/ubc-vs-alberta/", "/compare/rwth-vs-kit/", "/compare/unsw-vs-anu/", "/compare/auckland-vs-otago/",
  "/compare/lmu-vs-heidelberg/", "/compare/ucd-vs-ucc/",
]);
// PRUNE_ZERO_TRAFFIC — the mirror image of KEEP_INDEXED. These pass the 1500-char length gate
// but are near-duplicates of each other AND earned literally zero impressions in three months.
//
// Evidence (GSC export 2026-08-08, "Last 3 months", Web): the /scholarships-in-<country>/ family
// is 22 indexable pages with 56% average 5-gram overlap between siblings (some pairs 61%) at
// ~500 body words each — a templated country roundup. Only TWO of the 22 appear in the Pages
// report at all: /scholarships-in-australia/ (29 impressions) and /scholarships-in-switzerland/
// (1 impression, but position 4), and both are deliberately EXCLUDED from this list. The other
// 20 have no impressions, so pruning them forfeits no traffic while raising the domain-level
// helpful:unhelpful ratio the March-2026 core update keys on.
//
// Deliberately NOT pruned, though they matched the same "short + templated" shape:
//   · /scholarship/<named>/ (44) — Rhodes, Chevening, DAAD, Gates Cambridge are real demand, and
//     GSC shows DAAD at position 5. These need DEEPENING, not removal.
//   · /<exam>-for-<uni>/ and /university/ — the site's BEST performers. GSC has /pte-for-rmit/ at
//     position 15 on 93 impressions and page-1 rankings for "rwth aachen ielts requirement" (6),
//     "ucc acceptance rate" (10), "university college cork application fee" (9.9). Pruning these
//     would have destroyed the only thing currently working.
// Fully reversible: remove a path here and it re-indexes on the next build.
const PRUNE_ZERO_TRAFFIC = new Set([
  "/scholarships-in-canada/", "/scholarships-in-china/", "/scholarships-in-czech-republic/",
  "/scholarships-in-denmark/", "/scholarships-in-europe-multiple/", "/scholarships-in-finland/",
  "/scholarships-in-france/", "/scholarships-in-germany/", "/scholarships-in-italy/",
  "/scholarships-in-japan/", "/scholarships-in-multiple/", "/scholarships-in-netherlands/",
  "/scholarships-in-new-zealand/", "/scholarships-in-poland/", "/scholarships-in-spain/",
  "/scholarships-in-sweden/", "/scholarships-in-uk/", "/scholarships-in-united-arab-emirates/",
  "/scholarships-in-usa/", "/scholarships-in-usa-uk-europe/",
]);
function uniqueContentLen(html) {
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  return main.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length;
}
// ── Honest "last updated" stamps ─────────────────────────────────────────────
// Generated pages carried NO freshness signal at all: no visible date, no
// datePublished, no dateModified. That is a real handicap for AI answer engines and for
// query types where recency matters ("IELTS band 6 requirements 2026").
//
// The date must be TRUE, so it is keyed to the page's own content: we store a hash per
// path and only move the date when that hash actually changes. Stamping today's date on
// every page each build would be fake freshness — precisely what Google penalises.
const PAGE_DATES_FILE = join(ROOT, "content", "page-dates.json");
let PAGE_DATES = {};
try { if (existsSync(PAGE_DATES_FILE)) PAGE_DATES = JSON.parse(readFileSync(PAGE_DATES_FILE, "utf8")); } catch { PAGE_DATES = {}; }
const STAMP_TODAY = new Date().toISOString().slice(0, 10);
let datesChanged = 0;
const datesChangedPaths = [];

function contentFingerprint(html) {
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  const text = main.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  return h.toString(36) + "-" + text.length;
}
function pageUpdatedOn(path, html) {
  const fp = contentFingerprint(html);
  const prev = PAGE_DATES[path];
  if (prev && prev.hash === fp) return prev.updated;   // unchanged → keep the real date
  PAGE_DATES[path] = { hash: fp, updated: STAMP_TODAY };
  datesChanged++;
  if (prev) datesChangedPaths.push(path); // changed (not brand new) — the interesting case
  return STAMP_TODAY;
}
const prettyDate = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

// Applied at WRITE time, not emit time: six paths are claimed by two builders each (see the
// duplicate warning in emit) and only the last write wins. Stamping per-emit made those six
// flip hashes every run and re-date themselves on every build — fake freshness, the exact
// thing this is meant to avoid. Stamp only what actually reaches disk.
function stampFreshness(path, html) {
  if (!/<\/main>/i.test(html)) return html;
  const updated = pageUpdatedOn(path, html);
  return html.replace(
    /<\/main>/i,
    `<p class="updated"><small>Last updated: <time datetime="${updated}">${prettyDate(updated)}</time></small></p>\n` +
    jsonld({
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: ORIGIN + path,
      dateModified: updated,
      publisher: { "@type": "Organization", name: BRAND, url: ORIGIN },
    }) +
    `\n</main>`
  );
}

function savePageDates() {
  try {
    writeFileSync(PAGE_DATES_FILE, JSON.stringify(PAGE_DATES, null, 2) + "\n");
    console.log(`  Freshness stamps: ${datesChanged} page(s) changed content this run (dates for the rest kept as-is)`);
    if (datesChangedPaths.length) {
      console.log(`    re-dated: ${datesChangedPaths.slice(0, 12).join(", ")}${datesChangedPaths.length > 12 ? ` … +${datesChangedPaths.length - 12}` : ""}`);
    }
  } catch (e) { console.warn("  ⚠ could not save page-dates.json:", e.message); }
}

function emit(path, html, opts) {
  // opts.thin forces noindex,follow even on >1500-char pages — for SCALED/programmatic clusters
  // (university-vs-university combos, competitor "alternative" doorways) that the March-2026 core
  // update penalises regardless of length. noindex + sitemap-exclusion raises the domain quality
  // ratio so the substantive pages rank better. Fully reversible (drop the flag to re-index).
  if (!KEEP_INDEXED.has(path) && (PRUNE_ZERO_TRAFFIC.has(path) || (opts && opts.thin) || uniqueContentLen(html) < THIN_MIN_CHARS)) {
    html = html.replace(/<meta name="robots" content="index,follow[^"]*"\/>/i, '<meta name="robots" content="noindex,follow"/>');
    THIN_PATHS.add(path);
  }
  // Two different builders can claim the same path (e.g. PR_COMBOS and PR_TARGETS both
  // own /ielts-for-canada-pr/). On disk the later write silently wins, but PAGES kept
  // BOTH — so the URL was listed twice in sitemap.xml. Keep last-wins (identical to the
  // filesystem behaviour, so no page content changes) and replace the earlier entry
  // instead of appending a duplicate. Warn loudly: a collision is usually unintended.
  const dupe = PAGES.findIndex((p) => p.path === path);
  if (dupe !== -1) {
    console.warn(`  ⚠ DUPLICATE emit for ${path} — later page wins (check for two builders owning this route)`);
    PAGES[dupe] = { path, html };
    return;
  }
  PAGES.push({ path, html });
}

// Curated deep links from an exam's hub pages (mock + practice) to that exam's strongest
// asset page. Added after measuring inbound internal links across the whole sitemap: the
// two best-performing pages in Search Console were among the WORST linked —
// /gmat-quant-formulas/ (the #1 page by impressions) had 2 inbound links, and
// /blog/ielts-to-toefl-score-conversion-2026/ (position ~21, the closest to page one) had
// exactly 1, from the blog index. Internal linking is the one ranking lever fully under our
// control, so point the relevant exam hubs at them. Keep this list SHORT and topical —
// blanket link-stuffing is what the March-2026 update penalises.
const EXAM_ASSET_LINK = {
  gmat: { label: "GMAT Quant formula sheet (free, printable)", href: "/gmat-quant-formulas/" },
  ielts: { label: "IELTS ↔ TOEFL score conversion table", href: "/blog/ielts-to-toefl-score-conversion-2026/" },
  toefl: { label: "IELTS ↔ TOEFL score conversion table", href: "/blog/ielts-to-toefl-score-conversion-2026/" },
};

// ── Page builders ───────────────────────────────────────────────────────────
/**
 * Depth for /mock-test/<exam>/ — 10 pages at a 582-word median.
 *
 * These are the landing pages for the thing this site actually is, and they were shorter than
 * the guides pointing at them. Every figure below is counted from the shipped test files at
 * build time, so the page cannot advertise a library that does not exist — the content-claims
 * audit exists because advertised counts had drifted from real ones before.
 *
 * The prose is about how to USE a full mock, because the common failure is not a shortage of
 * practice material, it is practising in a way that cannot reveal the errors that decide the
 * score.
 */
function mockDepthBlock(id, e) {
  const f = examFacts(id);
  if (!f || !f.sections.length) return "";
  const EX = String(e && e.short ? e.short : id).toUpperCase();
  const longest = f.sections.slice().sort((a, b) => (b.mins || 0) - (a.mins || 0))[0];
  const totalMins = f.sections.reduce((s, x) => s + (x.mins || 0), 0);
  const rows = f.sections.map((s) => `<tr><td>${esc(SECTION_LABEL(s.sec))}</td><td>${s.tests}</td><td>${s.perTest}</td><td>${s.mins ? s.mins + " min" : "untimed"}</td></tr>`).join("");
  return `<div class="card"><h2>What you get, counted from the actual test files</h2>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Section</th><th>Tests</th><th>Questions each</th><th>Time each</th></tr></thead><tbody>${rows}</tbody></table></div>
<p><strong>${f.tests} ${EX} tests, ${f.questions.toLocaleString("en-IN")} questions</strong>${totalMins ? `, about ${totalMins} minutes for one full sitting across all ${f.sections.length} section${f.sections.length === 1 ? "" : "s"}` : ""}. No signup, no attempt limit, nothing held back behind a paywall. Every question is verified before release: its answer key must match an option you can actually select, and no paper may be scoreable by picking the same letter throughout — checks that caught 227 unanswerable questions and 61 gameable papers when they were introduced.</p>
<h2>How to take a mock so it tells you something</h2>
<p>Most people do not have a practice-material problem. They have a practice-method problem, and it is the same one: practising in conditions that cannot surface the errors which actually cost marks.</p>
<ul class="bcheck">
<li><strong>Sit it complete and timed, in one go.</strong> The mistakes that decide a score — misread instructions, transfer errors, rushing the last questions — only appear when you are tired and behind the clock.${longest && longest.mins ? ` ${esc(SECTION_LABEL(longest.sec))} is the longest section here at about ${longest.mins} minutes, and it is where fatigue usually starts showing.` : ""} A section done fresh on a Sunday afternoon proves nothing about the same section done ninety minutes into a real exam.</li>
<li><strong>Do not check answers as you go.</strong> Checking mid-test resets your concentration and quietly removes the pacing pressure you are supposed to be rehearsing. Finish, then mark.</li>
<li><strong>Review every wrong answer against a cause, not a correction.</strong> Reading the right answer teaches you almost nothing. Ask which of four things happened: you did not know it, you misread the question, you ran out of time, or you knew it and made a careless error. Those need four completely different fixes, and only the first one is solved by more study.</li>
<li><strong>Watch the pattern across mocks, not the score of one.</strong> A single result is noise. Three papers moving in one direction is a signal, and three flat results despite steady work usually mean the work is aimed at the wrong section.</li>
<li><strong>Space them out.</strong> ${f.tests} tests is enough to take one a week for most of a preparation cycle. Taking several in a row burns the material for no benefit — you cannot act on the diagnosis of one paper while you are already sitting the next.</li>
</ul>
<p>The point of a mock is diagnosis, not a score. A paper that tells you exactly which section and which error type is costing you marks has done its job even if the number was disappointing — arguably especially then, since a comfortable score four weeks out teaches you nothing you can use.</p></div>`;
}

function mockPage(id) {
  const e = EXAMS[id];
  const path = `/mock-test/${id}/`;
  const title = `Free ${e.short} Mock Test 2026 — Full-Length & Timed | ${BRAND}`;
  const desc = `Take a free full-length ${e.name} mock test online with real exam timing, ${e.sections} sections and instant scoring. No signup, no payment — built for students worldwide.`;
  const kw = `free ${e.short.toLowerCase()} mock test 2026, ${e.short.toLowerCase()} mock test online no signup, free ${e.short.toLowerCase()} practice test for indian students, ${e.name} mock test with answers, ${e.short.toLowerCase()} sample test free, ${e.short.toLowerCase()} full test india`;
  const faqs = [
    { q: `Is this ${e.name} mock test really free?`, a: `Yes. Every ${e.name} mock test on ${BRAND} is 100% free with no signup, no credit card and no hidden paywall.` },
    { q: `Does the mock test match the real ${e.name}?`, a: `It mirrors the official ${e.name} format, timing and question types across ${e.sections}, scored on the ${e.score} scale.` },
    { q: `How is my ${e.short} score calculated?`, a: `Objective sections are auto-scored instantly; writing and speaking get rubric feedback so you see a realistic ${e.score} estimate.` },
    { q: `Can I practise ${e.short} on mobile?`, a: `Yes — ${BRAND} works in any browser on phone, tablet or laptop and even installs as an app for offline study.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/exam-prep">Mock Tests</a> › ${e.name} mock test</p>
<section class="hero">
  <div class="badges"><span class="badge">100% Free</span><span class="badge">Real exam timing</span><span class="badge">Instant scoring</span><span class="badge">No signup</span></div>
  <h1>Free ${e.name} Mock Test 2026</h1>
  <p class="lead">Sit a full-length ${e.name} practice test online with authentic timing and ${e.sections}. Get an instant ${e.score} estimate plus instant feedback on writing and speaking — completely free.</p>
  <a class="cta" href="/#/exam-prep/${e.appPath}">▶ Start the ${e.short} mock test free</a>
</section>
<div class="card">
  <h2>Why practise ${e.short} with ${BRAND}?</h2>
  <ul>
    <li><strong>Real format:</strong> ${e.sections} — matched to the official ${e.name} blueprint.</li>
    <li><strong>Exam-accurate timing</strong> so you build the stamina the real test demands.</li>
    <li><strong>Instant results</strong> on the ${e.score} scale, with answer explanations.</li>
    <li><strong>Writing &amp; speaking feedback</strong> with model answers and band-style scoring.</li>
    <li><strong>Accepted everywhere:</strong> ${e.name} is recognised by ${e.accepted}.</li>
  </ul>
</div>
<div class="card">
  <h2>What's inside the ${e.short} mock test</h2>
  <p>${e.name} is used for ${e.for}. Our free mock reproduces every section in order, with on-screen timers, a review screen showing the correct answers, and an smart tutor you can ask "why is this the answer?" on any question. Take it as many times as you like — new attempts, no limits, no cost.</p>
</div>
${(() => {
  const ep = EXAM_PATTERNS[id];
  if (!ep || !Array.isArray(ep.sections)) return "";
  return `<div class="card">
  <h2>📋 ${e.name} exam pattern (2026)</h2>
  <p><strong>Total time:</strong> ${esc(ep.totalDuration)}${ep.totalNote ? ` — ${esc(ep.totalNote)}` : ""} · <strong>Scoring:</strong> ${esc(ep.scoring)}</p>
  <div class="blg-tablewrap"><table class="cmp-table"><thead><tr><th>Section</th><th>Time</th><th>Questions / tasks</th><th>What it tests</th></tr></thead><tbody>${ep.sections.map((s) => `<tr><td><strong>${esc(s.name)}</strong></td><td>${esc(s.duration)}</td><td>${esc(s.count)}</td><td>${esc(s.tests)}</td></tr>`).join("")}</tbody></table></div>
  <p class="note">Format reflects the current ${e.name} as of 2026 — always confirm details on the official site before your test.</p>
</div>${Array.isArray(ep.benchmarks) && ep.benchmarks.length ? `
<div class="card"><h2>🎯 What's a good ${e.short} score?</h2><ul class="bcheck">${ep.benchmarks.map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>` : ""}${Array.isArray(ep.tips) && ep.tips.length ? `
<div class="card uni-tips"><h2>💡 ${e.short} prep tips</h2><ul class="bcheck">${ep.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}`;
})()}
${mockDepthBlock(id, e)}
${faqBlock(faqs)}
${relatedGrid([
  ...(["ielts", "toefl", "pte", "gre", "gmat", "duolingo", "sat", "celpip", "act", "oet", "cambridge"].includes(id) ? [{ label: `${e.short} Smart Notes — visual lessons & recall`, href: `/learn/${id}/` }] : []),
  { label: `${e.short} practice test (section by section)`, href: `/practice/${id}/` },
  { label: `${e.short} score calculator & converter`, href: `/tools/english-test-score-converter/` },
  ...(EXAM_ASSET_LINK[id] ? [EXAM_ASSET_LINK[id]] : []),
  { label: `${e.short} speaking & writing practice`, href: `/#/agents` },
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
  const title = `Free ${e.short} Practice Test 2026 — All Sections, No Signup | ${BRAND}`;
  const desc = `Free ${e.name} practice tests online: drill each section (${e.sections}) with answers, explanations and feedback. No signup. Perfect for ${e.for}.`;
  const kw = `${e.short.toLowerCase()} practice test online free, ${e.short.toLowerCase()} section practice questions with answers, free ${e.short.toLowerCase()} preparation for indian students, ${e.name} sample questions, ${e.short.toLowerCase()} listening reading writing speaking practice`;
  const faqs = [
    { q: `How can I practise ${e.short} for free?`, a: `Open ${BRAND}, pick ${e.name}, and choose a full mock or a single section. Everything is free with instant feedback.` },
    { q: `Which ${e.short} sections can I practise?`, a: `All of them: ${e.sections}. Each section can be practised on its own or as part of a full test.` },
    { q: `Do I get answer explanations?`, a: `Yes — every objective question shows the correct answer, and you can ask the smart tutor to explain the reasoning.` },
    { q: `Is section practice better than full mock tests?`, a: `They do different jobs. A full mock tells you where you stand; section practice is how you improve, because it isolates one skill instead of averaging your strengths and weaknesses into a single score. Sit a mock first to find your weakest section, drill that section, then re-test every two to three weeks.` },
    { q: `Should I practise ${e.short} with or without a timer?`, a: `Without one at first. Build accuracy while you can still think through each question, then add timing once your accuracy is stable. Adding pressure too early trains you to rush past the reasoning you are trying to learn.` },
    { q: `How many ${e.short} practice tests should I do?`, a: `Fewer than most people think, reviewed far more carefully than most people do. Two or three full mocks with thorough review beats ten sat back to back, because the learning happens in the review screen rather than in the attempt.` },
    { q: `Is there any penalty for a wrong answer in ${e.short}?`, a: `No — there is no negative marking, so never leave a question blank. An unanswered question scores zero for certain, while a guess does not.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/exam-prep">Mock Tests</a> › ${e.name} practice</p>
<section class="hero">
  <div class="badges"><span class="badge">Free forever</span><span class="badge">Section drills</span><span class="badge">Answer explanations</span></div>
  <h1>${e.name} Practice Test (Online &amp; Free)</h1>
  <p class="lead">Drill ${e.name} one section at a time or sit a full mock. Every question is scored on the ${e.score} scale with explanations and feedback — free, in your browser, no account needed.</p>
  <a class="cta" href="/#/exam-prep/${e.appPath}">▶ Practise ${e.short} free now</a>
</section>
<div class="card">
  <h2>Practise every ${e.short} section</h2>
  <p>${e.name} covers ${e.sections}. ${BRAND} lets you target your weakest skill with focused section practice, then prove it on a timed full-length mock. You get instant scoring, a review screen with correct answers, model answers for writing, and two-way speaking practice.</p>
  <ul>
    <li>Unlimited free attempts — fresh practice every time</li>
    <li>Realistic, exam-matched questions and timing</li>
    <li>smart tutor for instant doubt-solving on any question</li>
    <li>Progress tracking, streaks and a personalised study plan</li>
  </ul>
</div>
<div class="card">
  <h2>How to use section practice properly</h2>
  <p>Most candidates practise by sitting full mocks back to back. That measures where you are, but it is a slow way to improve, because a full test mixes your strong and weak skills together and gives you one number at the end. Section practice is the opposite: it isolates one skill so you can see exactly what is going wrong.</p>
  <p>A pattern that works for ${e.short}:</p>
  <ol>
    <li><strong>Sit one full mock first.</strong> You cannot target a weakness you have not identified. Use the <a href="/mock-test/${id}/">free ${e.short} mock test</a> and note your score per section, not just the total.</li>
    <li><strong>Take your weakest section and drill it untimed.</strong> Accuracy before speed, always. A candidate who is fast and wrong has a harder problem to fix than one who is slow and right.</li>
    <li><strong>Read every explanation, including the ones you got right.</strong> A correct guess and a correct answer look identical on your score report and are completely different in what they predict.</li>
    <li><strong>Reintroduce the clock.</strong> Only once your accuracy is stable. Timing pressure applied too early teaches you to rush past the reasoning you are trying to build.</li>
    <li><strong>Re-sit a full mock every two to three weeks</strong>, not every day. Frequent full tests eat study time and mostly re-measure what you already know.</li>
  </ol>
  <p>The review screen is where the learning happens. If you finish a section and immediately start another, you have practised ${e.short}; you have not studied it.</p>
</div>
<div class="card">
  <h2>What each ${e.short} section actually tests</h2>
  <p>${e.name} covers ${e.sections}, and the sections reward different things. Reading and listening sections test whether you can locate and interpret information under time pressure — the vocabulary matters less than the ability to find the part of the text that answers the question. Writing and speaking sections are marked against a published rubric, which means the examiner is looking for specific, nameable features rather than a general impression of fluency.</p>
  <p>That distinction changes how you should prepare. For objective sections, volume of practice with careful review works. For rated sections, volume alone does very little: repeating the same essay structure fifty times cements whatever is wrong with it. You need feedback against the rubric, which is why every writing and speaking task here is scored with rubric-referenced comments and a model answer rather than a bare number.</p>
  <p>If you are still deciding which exam to take, the <a href="/tools/english-test-score-converter/">score converter</a> shows roughly where a target score in ${e.short} lands in the other major tests, and <a href="/eligibility/">eligibility by country</a> lists what institutions typically ask for.</p>
</div>
<div class="card">
  <h2>Mistakes that cost the most marks</h2>
  <ul>
    <li><strong>Practising without timing, then never adding it.</strong> Untimed work builds accuracy; it does not build the pacing judgement the real test requires. Both stages are necessary.</li>
    <li><strong>Ignoring the instructions.</strong> ${/* TOEFL deliberately excluded: its Reading summary/table items are drag-and-drop, so it
      carries no "NO MORE THAN TWO WORDS" gap-fill instruction. Including it here was an
      error caught by tools/audit-cross-exam-claims.mjs. */
      ["ielts", "pte", "celpip", "oet"].includes(id)
      ? `Word limits in particular — where a gap-fill says "NO MORE THAN TWO WORDS", a three-word answer is marked wrong however correct it is, and this is one of the most common avoidable losses in ${e.short}. Note this applies to gap-fill answers in the marked sections only: the Writing tasks have a MINIMUM word count and no upper limit at all, and no marks are deducted for a long essay.`
      : `Read what each question is actually asking before you answer it — "which of the following must be true" and "which could be true" have different correct answers, and in ${e.short} a misread instruction costs the same mark as content you did not know. This is the cheapest category of loss to eliminate.`}</li>
    <li><strong>Reviewing only wrong answers.</strong> You learn as much from a right answer you were unsure of.</li>
    <li><strong>Studying the sections you enjoy.</strong> Almost everyone over-practises their strongest skill because it feels productive. Your score is dragged down by the weakest one.</li>
    <li><strong>Leaving blanks.</strong> There is no negative marking, so an unanswered question is a guaranteed zero where a guess is not.</li>
  </ul>
  <p>Everything on ${BRAND} is free and unlimited, so none of the above needs to be rationed. Start with a <a href="/mock-test/${id}/">full ${e.short} mock</a>, or jump straight into <a href="/#/exam-prep/${e.appPath}">section practice</a>.</p>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${e.short} full mock test`, href: `/mock-test/${id}/` },
  ...(["ielts", "toefl", "pte", "gre", "gmat", "duolingo", "sat", "celpip", "act", "oet", "cambridge"].includes(id) ? [{ label: `${e.short} Smart Notes — visual lessons & recall`, href: `/learn/${id}/` }] : []),
  { label: `${e.short} eligibility by country`, href: `/eligibility/` },
  { label: `Free study tools`, href: `/tools/english-test-score-converter/` },
  ...(EXAM_ASSET_LINK[id] ? [EXAM_ASSET_LINK[id]] : []),
  { label: `All free exams`, href: `/#/exam-prep` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    courseJsonLd(id, `${e.name} Practice Test`, desc),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Mock Tests", path: "/#/exam-prep" }, { name: `${e.name} Practice`, path }]),
  ] }) + shell(inner));
}

// Accurate, evergreen "what different scores mean" levels per exam (for the eligibility pages).
const SCORE_LEVELS = {
  ielts: ["Foundation / pathway courses: 5.5–6.0", "Most Master's programs: 6.5 overall (no band below 6.0)", "Top universities: 7.0–7.5+"],
  toefl: ["Foundation / conditional: 60–79", "Most programs: 80–90", "Top universities: 100–110+"],
  pte: ["Foundation: 50–58", "Most programs: 58–64", "Top universities: 70–79+"],
  gre: ["Most Master's: 300–315", "Competitive programs: 315–325", "Top programs: 325–330+"],
  gmat: ["Most MBA programs: 585–645 (Focus)", "Strong applications: 645–685", "Top MBA programs: 685–705"],
  duolingo: ["Foundation / pathway: 90–105", "Most programs: 105–120", "Top universities: 120–130+"],
  celpip: ["Most programs: CLB 7 (≈ CELPIP 7)", "Stronger profile: CLB 8–9", "Canada Express Entry (max points): CLB 9+"],
};
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
    { q: `How do I reach the ${e.short} score for ${d.country}?`, a: `Practise free on ${BRAND} with full ${e.name} mocks, section drills and feedback until you consistently hit your target.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/exam-prep">Mock Tests</a> › ${e.short} for ${d.country}</p>
<section class="hero">
  <div class="badges"><span class="badge">${d.flag} ${d.country}</span><span class="badge">Updated 2026</span><span class="badge">Free practice</span></div>
  <h1>${e.name} Score for ${d.country} ${d.flag}</h1>
  <p class="lead">${d.note}</p>
  <a class="cta" href="/#/exam-prep/${e.appPath}">▶ Practise ${e.short} free for ${d.country}</a>
</section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> For ${d.country}, the typical ${e.short} requirement is <strong>${d.min}</strong>. ${esc(d.note)} Always confirm the exact figure on your university's or the visa authority's official page, as it varies by course and changes over time.</div>
<div class="card">
  <h2>Typical ${e.short} requirement for ${d.country}</h2>
  <p><strong>${d.min}</strong></p>
  <p class="note">Guidance only — always confirm the exact requirement with the official body or your target university/visa programme, as minimums change and vary by course.</p>
</div>
${SCORE_LEVELS[d.exam] ? `<div class="card"><h2>What different ${e.short} scores mean</h2><ul class="bsteps">${SCORE_LEVELS[d.exam].map((l) => `<li>${esc(l)}</li>`).join("")}</ul><p class="note">Aim a little above the minimum — a higher ${e.short} score widens your university options and strengthens scholarship and visa applications.</p></div>` : ""}
<div class="card">
  <h2>How to hit your ${e.short} target for ${d.country}</h2>
  <ul>
    <li>Take a free full-length ${e.name} mock to get your baseline ${e.score} score.</li>
    <li>Use section practice to fix your weakest skill among ${e.sections}.</li>
    <li>Get Writing &amp; speaking feedback with model answers.</li>
    <li>Track progress and repeat until you clear the ${d.country} requirement.</li>
  </ul>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${e.short} mock test`, href: `/mock-test/${d.exam}/` },
  ...Object.keys(ELIGIBILITY).filter((s) => ELIGIBILITY[s].exam === d.exam && s !== slug).slice(0, 3).map((s) => ({ label: `${e.short} score for ${ELIGIBILITY[s].country}`, href: `/eligibility/${s}/` })),
  { label: `All score requirements by country`, href: `/eligibility/` },
  { label: `Score converter`, href: `/tools/english-test-score-converter/` },
])}`;
  // Conservative prune (2026-08-15). The 20 /eligibility/<exam>-<country>/ children are a
  // 341-word-median templated family: same headings, same table shape, exam and country
  // swapped. None appear in KEEP_INDEXED, i.e. none survived the earlier evidence-based
  // prune on traction. They stay live and linked — noindex,follow keeps equity flowing up
  // to the /eligibility/ hub, which is deepened and stays indexed.
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Mock Tests", path: "/#/exam-prep" }, { name: `${e.short} for ${d.country}`, path }]),
  ] }) + shell(inner), { thin: true });
}

/**
 * Depth for /tools/<slug>/ — 13 pages at a 527-word median.
 *
 * Deliberately NOT one shared paragraph bolted onto all of them: 13 pages carrying the
 * same new text would be more templated than before, not less, which is the exact trap
 * this whole pass exists to avoid.
 *
 * Instead the guidance keys off what the tool actually OUTPUTS, because that is what
 * changes the advice. A converted test score, a converted GPA, a loan figure and a
 * predicted band each fail the user in a different way, and each has a different
 * "do not trust this blindly" attached to it.
 */
function toolKind(slug) {
  if (/score-converter|test-score|comparison/.test(slug)) return "score";
  if (/gpa|cgpa|percentage/.test(slug)) return "gpa";
  if (/loan|emi|cost|funds|budget/.test(slug)) return "money";
  if (/band|retake|calculator/.test(slug)) return "band";
  if (/eligibility|readiness|checker|predictor/.test(slug)) return "eligibility";
  return "generic";
}
// `t` and `e` are optional: six of the thirteen tool pages have their own generator
// functions rather than going through toolPage(), and carry no TOOLS/EXAMS record.
// Falling back to a title derived from the slug keeps one implementation for all of them.
function toolDepthBlock(slug, t, e) {
  const kind = toolKind(slug);
  t = t || { title: String(slug).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") };
  const f = e && e.appPath ? examFacts(e.appPath) : null;
  const body = {
    score: `<p><strong>A converted score is an estimate, not an equivalence.</strong> Concordance tables are built by the test makers from statistical comparisons of large candidate groups. They describe where an average candidate with one score tends to land on another test — they do not promise that <em>you</em> would score that. Two tests measuring the same language with different task types will rank the same person differently, sometimes by a meaningful margin.</p>
<p><strong>Institutions decide what they accept, and many accept only one test.</strong> A conversion showing you already meet a requirement on a test you have not taken is not an argument you can make to an admissions office. Use the conversion to choose which test to sit and what to aim for, then sit that test.</p>
<p><strong>Per-section minimums do not convert cleanly.</strong> Where a requirement is written per skill rather than overall, converting an overall score tells you almost nothing about whether you clear it. Convert section by section if you convert at all.</p>`,
    gpa: `<p><strong>There is no universal GPA conversion, and anyone who tells you otherwise is selling certainty.</strong> Grading scales differ by country, by university and sometimes by faculty within one university. A conversion here gives you a defensible working figure for planning — it is not the number an admissions office will use.</p>
<p><strong>Most institutions convert your transcript themselves, or require a credential evaluation.</strong> Many will not accept a self-reported conversion at all, and several countries require an official evaluation from a designated body. Where that applies, budget both the fee and several weeks of processing.</p>
<p><strong>Context often outweighs the number.</strong> Class rank, the difficulty of your programme and an upward trend across your final years are read alongside the average. A converted figure strips exactly that context out, which is why it is a planning tool and not a verdict.</p>`,
    money: `<p><strong>The figure this produces is a starting point, not a budget.</strong> It models the inputs you gave it. It does not know about the rental deposit and agency fee that land before your first term, the flights, the health insurance, or the one-off setup costs that make the first two months far more expensive than an average month.</p>
<p><strong>Interest and total cost are different questions.</strong> A longer term lowers the monthly figure and raises what you repay overall; a shorter term does the reverse. Compare total repayment as well as the monthly number before choosing, because the comfortable monthly figure is the one that quietly costs the most.</p>
<p><strong>Currency movement is a real line item.</strong> If your funding sits in one currency and your costs in another, a few percent of drift across a multi-year course is the size of a semester's living costs. Hold a buffer rather than a forecast.</p>`,
    band: `<p><strong>Rounding is where most predictions go wrong.</strong> An IELTS overall band is the average of four sections rounded to the nearest whole or half band, and the rounding runs upward at the quarter: 6.75 is reported as 7.0, while 6.6 is reported as 6.5. That single rule explains most of the gap between what people expect and what they receive.</p>
<p><strong>Each section is a quarter of your result.</strong> Lifting one weak section by half a band moves your overall average by 0.125 — often not enough on its own. If you need a whole band, plan for two sections to move, and take the two weakest up rather than pushing a strong one higher.</p>
<p><strong>A prediction from untimed practice is not a prediction.</strong> Most band loss on test day comes from timing and transfer errors that only appear under full-length conditions. Feed this tool scores from complete, timed papers or the output will flatter you.</p>`,
    eligibility: `<p><strong>This narrows a list; it does not make a decision.</strong> The output is based on published requirements and the figures you enter. Admissions decisions weigh your statement, references, the fit between your background and the specific programme, and how strong the applicant pool is that year — none of which any calculator can see.</p>
<p><strong>Programme requirements beat institutional ones.</strong> The figures behind results like these are usually institution-level baselines. Individual departments routinely set a higher bar, and theirs is the one that applies to you. Always confirm on the specific programme page before you rule yourself in or out.</p>
<p><strong>Treat a marginal result as a reason to check, not to stop.</strong> Requirements move between admission cycles, and several routes accept a lower score with a pre-sessional English course or a foundation year attached. A near miss is worth an email to the admissions office.</p>`,
    generic: `<p><strong>Use the output as a planning figure and verify it at the point it matters.</strong> Everything here is built on published scales and official tables, and those change without notice. The version on the awarding body's own page is the only one that counts when you are committing money or a deadline to it.</p>`,
  }[kind];
  // A second per-kind section. Same rule as the first: keyed on what the tool outputs, so
  // the thirteen pages do not converge on one shared block of text.
  const second = {
    score: `<h2>Using a converted score without getting caught out</h2>
<p><strong>Convert in the direction you are travelling, then round against yourself.</strong> Concordance is not symmetric in practice: a table that maps A to B and one that maps B to A can disagree at the edges. When the result lands within a point or half a band of a requirement, treat it as below the requirement rather than at it, because that is how an admissions office will read a real score in the same position.</p>
<p><strong>The conversion says nothing about what the tests ask of you.</strong> Two tests can want the same level of English through completely different tasks — an integrated task that combines reading, listening and speaking is a different job from a standalone response, even at an identical converted score. That difference is exactly what a conversion strips out, and it is often the reason someone scores below their converted estimate on a first attempt.</p>
<p><strong>Use it to choose, then stop using it.</strong> The conversion is genuinely useful for deciding which test to sit and roughly what to aim for. Once you have chosen, work from the real scale of the test you are actually taking — carrying the converted figure into your preparation just adds a layer of error between you and the number that counts.</p>`,
    gpa: `<h2>Presenting your grades so they are read correctly</h2>
<p><strong>Send the transcript and the scale, not a converted number.</strong> Almost every institution prefers to do its own conversion, and giving them your original grades with the official grading scale from your university is both more accurate and more credible than a figure you calculated. Many transcripts print the scale on the reverse; if yours does not, your registrar can usually issue a grading-scheme letter.</p>
<p><strong>Know which average they want.</strong> Institutions variously ask for a cumulative average, a final-year average, a major-only average, or one weighted by credit hours. These can differ substantially for the same student, and answering with the wrong one is a common, avoidable mistake — it is worth asking rather than assuming.</p>
<p><strong>Explain an unusual record briefly, in the right place.</strong> A weak year with a clear reason and a strong recovery reads very differently from a flat weak record. That belongs in your statement or an additional-information field, stated plainly and without excuses — not in a converted number, which cannot carry it.</p>`,
    money: `<h2>Turning the estimate into a plan you can defend</h2>
<p><strong>Build the funding proof and the budget as two separate documents.</strong> A visa application asks you to demonstrate a specified sum in a specified form, held for a specified period. That is a compliance exercise with its own rules about acceptable account types and how recently money arrived. Your actual budget is a different question, and conflating them is how people satisfy a visa officer and then run short in month three.</p>
<p><strong>Model the bad year, not the expected one.</strong> Run the numbers again assuming you find no part-time work in your first term, your rent rises at renewal, and one unplanned flight home. If the plan survives that, it is a plan; if it only works when everything goes right, it is a hope with a spreadsheet attached.</p>
<p><strong>Check what the fee actually includes.</strong> Published tuition frequently excludes bench fees, materials, field trips, professional registration and compulsory insurance, and these vary enormously by subject. Ask the department for the full cost of attendance rather than the headline tuition figure.</p>`,
    band: `<h2>Getting a prediction you can trust</h2>
<p><strong>Feed it your worst realistic performance, not your best.</strong> People remember their strongest practice score and enter that. The useful prediction comes from a full, timed, uninterrupted paper sat at roughly the time of day your real test is booked for — anything else systematically over-predicts, and the direction of that error is always the expensive one.</p>
<p><strong>Predict each section separately and look at the spread.</strong> Two candidates with the same overall estimate are in completely different positions if one is even across all four sections and the other is carrying a weak one. The even candidate is close to done; the uneven one has a specific, fixable problem — and if any institution on their list sets per-section minimums, the estimate is misleading them.</p>
<p><strong>Re-run it after every full mock and watch the trend.</strong> A single result is noise. Three papers moving in one direction is a signal, and a flat line across three despite steady study usually means the study is aimed at the wrong thing — which is far more useful to learn four weeks out than four days out.</p>`,
    eligibility: `<h2>What to do with a borderline result</h2>
<p><strong>Ask the admissions office directly — they answer, and it costs nothing.</strong> A short, specific email naming the programme and your actual numbers gets a more accurate answer than any calculator, and asking has never counted against an applicant. Published requirements are frequently a guide rather than a hard floor, particularly where an applicant is strong elsewhere.</p>
<p><strong>Build a list, not a bet.</strong> A sensible shortlist spans clear-admits, realistic targets and one or two stretches. The most common error is not aiming too high — it is a list where every entry is a stretch, which feels ambitious and routinely ends with no offer at all.</p>
<p><strong>Check for the conditional routes before you rule anything out.</strong> Pre-sessional English, foundation years, pathway programmes and conditional offers exist precisely for applicants who are close but not clear. They carry extra time and extra fees, so they are not free — but "not eligible yet" and "not eligible" are different answers, and only one of them means stop.</p>`,
    generic: `<h2>Before you rely on this figure</h2>
<p><strong>Check the date on the source.</strong> Scales, fees and requirements are revised on their own schedules and rarely announce themselves. Anything you are committing money or a deadline to should be confirmed against the awarding body's current page on the day you commit, not the day you planned.</p>
<p><strong>Keep a record of what you checked and when.</strong> If a requirement changes between your application and a decision, having the version you relied on — with its date — is occasionally worth a great deal and costs you a screenshot.</p>`,
  }[kind];

  return `<div class="card"><h2>How to read the result — and where it stops being reliable</h2>
${body}
${f && f.sections.length ? `<p>If this points you toward more preparation, there are <strong>${f.tests} free ${esc(e.short)} practice tests</strong> here covering <strong>${f.questions.toLocaleString("en-IN")} questions</strong> — counted from the test files, not estimated — across ${f.sections.map((s) => SECTION_LABEL(s.sec)).join(", ")}. <a href="/mock-test/${e.appPath}/">Take a full timed ${esc(e.short)} mock →</a></p>` : ""}
</div>
<div class="card">
${second}
<p class="note">${esc(t.title)} is free and the calculation runs entirely in your browser: the values you type are not transmitted to us and are not saved — they disappear when you close the tab. (Like every page here, this one loads Google Analytics, which records the page visit itself; it does not receive what you enter.) The tool is provided for planning — confirm any figure you rely on with the test maker, university or lender directly.</p></div>`;
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
  <a class="cta" href="${t.widget ? "#lp-tool" : "/#/tools"}">▶ ${t.widget ? "Use the calculator" : "Open the free tool"}</a>
</section>
${t.widget || ""}
<div class="card">
  <h2>About this tool</h2>
  <p>${t.lead} ${BRAND} is a 100% free platform for IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE and GMAT preparation. Use this tool alongside our free full-length mock tests and speaking &amp; writing practice to plan exactly what score you need and how to reach it.</p>
</div>
${t.ref || ""}
${toolDepthBlock(slug, t, e)}
${faqBlock(faqs)}
${relatedGrid([
  { label: `IELTS Smart Notes — visual lessons & recall`, href: `/learn/ielts/` },
  { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `Free TOEFL mock test`, href: `/mock-test/toefl/` },
  // The converter tool and the conversion explainer answer the same question in different
  // formats; linking them is genuinely useful and lifts a page sitting just off page one.
  ...(slug === "english-test-score-converter" ? [{ label: `IELTS ↔ TOEFL score conversion explained`, href: `/blog/ielts-to-toefl-score-conversion-2026/` }] : []),
  { label: `Score requirements by country`, href: `/eligibility/` },
  { label: `Compare the tests`, href: `/english-test-comparisons/` },
  { label: `All free exams`, href: `/#/exam-prep` },
])}`;
  emit(path, head({ title, desc, path, kw: t.kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: t.title, description: t.lead, applicationCategory: "EducationApplication",
      operatingSystem: "Any browser", browserRequirements: "Requires JavaScript", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: t.title, path }]),
  ] }) + shell(inner));
}

// Eligibility hub index
function eligibilityHub() {
  const path = `/eligibility/`;
  const title = `English Test & Admission Score Requirements by Country 2026 | ${BRAND}`;
  const desc = `IELTS, TOEFL, PTE, CELPIP, GRE & GMAT score requirements for Canada, USA, UK, Australia, Germany and more. Free guides + free practice tests.`;
  const entries = Object.keys(ELIGIBILITY).map((slug) => ({ slug, d: ELIGIBILITY[slug], e: EXAMS[ELIGIBILITY[slug].exam] }));
  const links = entries.map(({ slug, d, e }) => ({ label: `${e.short} score for ${d.country} ${d.flag}`, href: `/eligibility/${slug}/` }));
  const rows = entries.map(({ slug, d, e }) => `<tr><td><a href="/eligibility/${slug}/">${e.short}</a></td><td>${d.flag} ${esc(d.country)}</td><td>${esc(d.min)}</td></tr>`).join("");
  const inner = `
<p class="crumb"><a href="/">Home</a> › Eligibility</p>
<section class="hero"><h1>Score Requirements by Country</h1>
<p class="lead">Find the English-test and admission score you need for your destination — then practise free until you hit it.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Most universities ask for around IELTS 6.0–6.5 (≈ TOEFL 80–90 / PTE 58–64); top universities want IELTS 7.0+. Visa minimums can differ from university minimums. Exact requirements vary by course and country — use the table below, then confirm on the official page.</div>
<div class="card"><h2>English-test &amp; admission score requirements by country</h2>
<table class="uni-table" style="width:100%;border-collapse:collapse"><thead><tr><th>Test</th><th>Country</th><th>Typical requirement</th></tr></thead><tbody>${rows}</tbody></table>
<p class="note">Guidance only — minimums change and vary by course/university/visa. Always confirm on the official source.</p></div>
<div class="card"><h2>How to use this</h2><ul class="bsteps"><li>Find your destination + test in the table and open its page for the full breakdown.</li><li>Aim 0.5–1 band (or the equivalent) above the minimum — it widens your options and helps with scholarships and visas.</li><li>Not sure of your level? Take a free full-length mock test and see your gap instantly.</li><li>Remember university vs visa requirements can differ — check both.</li></ul></div>
${relatedGrid(links)}`;
  emit(path, head({ title, desc, path, kw: "english test score by country, ielts toefl pte requirement, study abroad score requirement", jsonLdBlocks: [
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Eligibility", path }]),
    { "@context": "https://schema.org", "@type": "Dataset", name: "English-test & admission score requirements by country (2026)", description: desc, url: ORIGIN + path, creator: { "@type": "Organization", name: BRAND }, keywords: "IELTS requirement, TOEFL requirement, PTE requirement, study abroad score by country", measurementTechnique: "Compiled from official university and visa English-language requirements", variableMeasured: "Typical minimum English-test / admission score by exam and country" },
  ] }) + shell(inner));
}

// ── Study-abroad / top-universities pages (college niche) ───────────────────
const COUNTRY_UNIS = {
  "france": {"name":"France","flag":"🇫🇷","ielts":"6.5","fee":"€0–4,000/yr (public); €8,000–18,000/yr (private)","intake":"September, January","unis":["Sorbonne University (Paris)","ENA (École Nationale d'Administration)","HEC Paris","INSEAD","Grenoble INP","École Polytechnique"]},
  "italy": {"name":"Italy","flag":"🇮🇹","ielts":"6.0","fee":"€900–3,000/yr (public); €6,000–15,000/yr (private)","intake":"September, March","unis":["Politecnico di Milano","University of Bologna","Sapienza University of Rome","University of Padua","Università Cattolica del Sacro Cuore","Bocconi University"]},
  "sweden": {"name":"Sweden","flag":"🇸🇪","ielts":"6.5","fee":"SEK 80,000–140,000/yr (~€8,000–14,000 non-EU); free for EU","intake":"August, January","unis":["KTH Royal Institute of Technology","Lund University","Uppsala University","Stockholm School of Economics","Chalmers University of Technology","University of Gothenburg"]},
  "finland": {"name":"Finland","flag":"🇫🇮","ielts":"6.0","fee":"€0–8,500/yr (EU); €12,000–20,000/yr (non-EU); scholarships waive","intake":"August, January","unis":["Aalto University","University of Helsinki","University of Tampere","University of Turku","University of Eastern Finland","Oulu University"]},
  "denmark": {"name":"Denmark","flag":"🇩🇰","ielts":"6.5","fee":"DKK 50,000–120,000/yr (~€6,700–16,000 non-EU); free for EU","intake":"August, February","unis":["Technical University of Denmark (DTU)","University of Copenhagen","Aarhus University","Aalborg University","Copenhagen Business School","Roskilde University"]},
  "uae": {"name":"United Arab Emirates","flag":"🇦🇪","ielts":"6.5","fee":"AED 80,000–220,000/yr (~€21,500–59,500); varies by institution","intake":"August, January","unis":["NYU Abu Dhabi","Sorbonne University Abu Dhabi","INSEAD Abu Dhabi","University of Chicago Booth (Dubai)","Middlesex University Dubai","American University of Sharjah"]},
  "spain": {"name":"Spain","flag":"🇪🇸","ielts":"6.0","fee":"€1,000–3,500/yr (public); €7,000–16,000/yr (private)","intake":"September, February","unis":["Universitat Autònoma de Barcelona","Universitat Politècnica de Catalunya","IE University","University of Madrid (UCM)","University of Valencia","ESADE Business School"]},
  "poland": {"name":"Poland","flag":"🇵🇱","ielts":"5.5","fee":"€2,000–5,000/yr (most); €8,000–18,000/yr (Medicine)","intake":"September, February/March","unis":["University of Warsaw","Warsaw University of Technology","Jagiellonian University (Krakow)","Wroclaw University of Technology","AGH University of Science and Technology","Medical University of Warsaw"]},
  "czech-republic": {"name":"Czech Republic","flag":"🇨🇿","ielts":"5.5","fee":"€2,000–4,500/yr (most); €7,000–16,000/yr (Medicine)","intake":"September, February (limited)","unis":["Charles University (Prague)","Czech Technical University in Prague","Masaryk University (Brno)","University of Economics Prague","VSB–Technical University of Ostrava","Charles University Faculty of Medicine"]},
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
  switzerland: { name: "Switzerland", flag: "🇨🇭", ielts: "7.0", fee: "≈ CHF 1,500/yr (public) — world-class at near-free tuition", intake: "September, February",
    unis: ["ETH Zurich", "EPFL (Lausanne)", "University of Zurich", "University of Geneva", "University of Bern", "University of Basel"] },
  "hong-kong": { name: "Hong Kong", flag: "🇭🇰", ielts: "6.0–6.5", fee: "≈ HKD 170,000–210,000/yr (~US$22,000–27,000)", intake: "September",
    unis: ["University of Hong Kong (HKU)", "HKUST", "Chinese University of Hong Kong (CUHK)", "City University of Hong Kong", "Hong Kong Polytechnic University"] },
};
function countryUniPage(id) {
  const d = COUNTRY_UNIS[id];
  const path = `/study-abroad/top-universities-in-${id}/`;
  const title = `Top Universities in ${d.name} for International Students 2026 — Fees, IELTS & Intakes | ${BRAND}`;
  const desc = `Top universities in ${d.name} for Master's & MBA: IELTS ${d.ielts}, tuition ${d.fee}, intakes ${d.intake}. Free college predictor, score requirements & admission process.`;
  const kw = `top universities in ${d.name.toLowerCase()}, study in ${d.name.toLowerCase()} for indian students, best universities for ms in ${d.name.toLowerCase()}, ${d.name.toLowerCase()} university fees for international students, ${d.name.toLowerCase()} ielts requirement, universities in ${d.name.toLowerCase()} admission process free, cheapest universities in ${d.name.toLowerCase()}`;
  const ci = COUNTRY_DATA.find((x) => x.id === id) || {};
  const has = (k) => ci[k] != null && ci[k] !== "";
  const arr = (v) => Array.isArray(v) ? v : (v == null || v === "" ? [] : [v]);
  const plan = arr(ci.immigrationPlan).length ? arr(ci.immigrationPlan) : (typeof ci.immigrationPlan === "string" ? ci.immigrationPlan.split(/\s*(?:→|->)\s*/).filter(Boolean) : []);
  // Our own university pages for this country → real internal links (id mapped via d.name).
  const ourUnis = COLLEGES.filter((c) => c.country === d.name).sort((a, b) => (typeof a.rank === "number" ? a.rank : 9999) - (typeof b.rank === "number" ? b.rank : 9999)).slice(0, 14);
  const tuition = has("avgTuition") ? ci.avgTuition : d.fee;
  const living = has("avgLiving") ? ci.avgLiving : "Varies by city";
  const stat = (label, val) => `<div class="uni-stat"><div class="uni-stat-v">${val}</div><div class="uni-stat-l">${label}</div></div>`;
  const faqs = [
    { q: `What IELTS score do I need for universities in ${d.name}?`, a: `Most universities in ${d.name} require IELTS ${d.ielts} overall for postgraduate admission, with some competitive programmes asking for 7.0+. Use the free LandingPrep College Predictor to match your exact score to universities.` },
    { q: `How much does it cost to study in ${d.name}?`, a: `International tuition is typically ${tuition}, plus living costs of about ${living}. ${d.name === "Germany" ? "Public universities are largely tuition-free." : "Scholarships can offset a large part of this."}` },
    { q: `When are the intakes in ${d.name}?`, a: `The main intakes in ${d.name} are: ${(has("intakes") ? ci.intakes.join(", ") : d.intake)}. Apply 4–6 months ahead for scholarships and housing.` },
    { q: `Can I work and settle in ${d.name} after studying?`, a: has("postStudyWork") ? `Yes — ${d.name} offers ${ci.postStudyWork}. Immigration pathway: ${ci.immigration} Permanent residence: ${ci.prTimeline}.` : `Yes — ${d.name} offers post-study work options that can lead to permanent residence. See the LandingPrep Country Guide for the full roadmap.` },
    { q: `What is the student-visa success rate for ${d.name}?`, a: has("visaSuccess") ? `${d.name} has an indicative student-visa success rate of about ${ci.visaSuccess}%. ${ci.visaNote} Strong proof of funds and a genuine study plan matter most.` : `Student-visa success in ${d.name} depends on your profile — strong proof of funds and a genuine study plan matter most.` },
    { q: `How do I apply to universities in ${d.name} from my country?`, a: `Shortlist universities with the free Predictor, take a free IELTS/TOEFL/PTE mock to hit the required score, prepare your SOP, LORs and transcripts, apply online with the fee, then apply for the student visa with your offer and proof of funds.` },
    { q: `Which are the best universities in ${d.name} for international students?`, a: `Top picks include ${ourUnis.slice(0, 5).map((u) => u.name).join(", ") || d.unis.slice(0, 5).join(", ")}. Open any university below for fees, requirements and the full admission process.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › ${d.name}</p>
<section class="hero">
  <div class="badges"><span class="badge">${d.flag} ${d.name}</span><span class="badge">2026 intake</span><span class="badge">Free predictor</span></div>
  <h1>Study in ${d.name}: Top Universities, Fees, Visa &amp; PR Guide (2026)</h1>
  <p class="lead">${has("tagline") ? esc(ci.tagline) + ". " : ""}Everything to plan your move to ${d.name} — top universities, tuition &amp; living costs, English requirements, how to apply, student visa, post-study work and the PR pathway.</p>
  <a class="cta" href="/#/colleges">▶ Predict my colleges (free)</a>
</section>
<section class="uni-stats">
  ${stat("Avg tuition / yr", esc(tuition))}
  ${stat("Living cost / yr", esc(living))}
  ${has("visaSuccess") ? stat("Visa success", "≈" + ci.visaSuccess + "%") : stat("IELTS", d.ielts)}
  ${stat("English (IELTS)", d.ielts)}
  ${stat("Intakes", (has("intakes") ? ci.intakes.length : (d.intake.split(",").length)) + "/yr")}
  ${has("postStudyWork") ? stat("Post-study work", "✓") : stat("Free predictor", "✓")}
</section>
${has("whyStudy") ? `<div class="card">
  <h2>🌟 Why study in ${d.name}?</h2>
  <ul class="bcheck">${ci.whyStudy.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
</div>` : ""}
<div class="card">
  <h2>🏛️ Top universities in ${d.name}</h2>
  ${ourUnis.length ? `<p>Open any university for full fees, IELTS/GRE requirements, scholarships and the step-by-step admission process:</p>
  <ul class="bcheck">${ourUnis.map((u) => `<li><a href="/university/${u.id}/"><strong>${esc(u.name)}</strong></a> — ${esc(u.city)}${typeof u.rank === "number" && u.rank < 1000 ? ` · QS #${u.rank}` : ""} · IELTS ${u.ielts} · ${esc((u.feeNote || "").replace(/\s*international.*/i, ""))}</li>`).join("")}</ul>` : `<ul class="bcheck">${d.unis.map((u) => `<li><strong>${esc(u)}</strong></li>`).join("")}</ul>`}
  <p class="note">Use the free <a href="/#/colleges">College Predictor</a> to see your Safe / Target / Reach matches.</p>
</div>
${has("popularPrograms") ? `<div class="card">
  <h2>📚 Popular courses in ${d.name}</h2>
  <ul>${ci.popularPrograms.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
</div>` : ""}
<div class="card">
  <h2>💰 Cost of studying in ${d.name}</h2>
  <table style="width:100%;border-collapse:collapse" class="uni-table">
    <tr><td><strong>Tuition (international)</strong></td><td>${esc(tuition)}</td></tr>
    <tr><td><strong>Living costs (est.)</strong></td><td>${esc(living)}</td></tr>
    <tr><td><strong>English test</strong></td><td>IELTS ${d.ielts} / TOEFL / PTE</td></tr>
    <tr><td><strong>Intakes</strong></td><td>${has("intakes") ? ci.intakes.join(", ") : d.intake}</td></tr>
  </table>
  <p class="note">Budget for tuition + living + health insurance + the visa fee. Compare funding with the free <a href="/#/colleges">scholarship finder</a>.</p>
</div>
<div class="card">
  <h2>📝 How to apply to ${d.name} (step by step)</h2>
  <ol class="bsteps">
    <li><strong>Shortlist universities.</strong> Use the free Predictor with your scores, GPA and budget to get Safe / Target / Reach matches in ${d.name}.</li>
    <li><strong>Hit the English score.</strong> Take a free full-length <a href="/mock-test/ielts/">IELTS</a> / <a href="/mock-test/pte/">PTE</a> / <a href="/mock-test/toefl/">TOEFL</a> mock to find your gap, then book the real test.</li>
    <li><strong>Prepare documents.</strong> SOP, 2–3 LORs, transcripts, CV and passport — see the free <a href="/blog/how-to-write-sop/">SOP guide</a>.</li>
    <li><strong>Apply online &amp; pay the fee.</strong> Submit before the deadline (apply early for scholarships).</li>
    <li><strong>Accept your offer &amp; apply for the student visa</strong> with proof of funds and your offer letter.</li>
  </ol>
</div>
${(has("visaSuccess") || has("postStudyWork")) ? `<div class="card">
  <h2>🛂 Student visa, post-study work &amp; PR in ${d.name}</h2>
  <ul class="bcheck">
    ${has("visaSuccess") ? `<li><strong>Student-visa success rate:</strong> ≈${ci.visaSuccess}% — ${esc(ci.visaNote || "")}</li>` : ""}
    ${has("visaTypes") ? `<li><strong>Visa types:</strong><ul class="bcheck">${arr(ci.visaTypes).map((v) => typeof v === "string" ? `<li>${esc(v)}</li>` : `<li><strong>${esc(v.name || "")}</strong>${v.note ? ` — ${esc(v.note)}` : ""}</li>`).join("")}</ul></li>` : ""}
    ${has("postStudyWork") ? `<li><strong>Post-study work:</strong> ${esc(ci.postStudyWork)}</li>` : ""}
    ${has("immigration") ? `<li><strong>Immigration pathway:</strong> ${esc(ci.immigration)}</li>` : ""}
    ${has("settlement") ? `<li><strong>Settlement / PR:</strong> ${esc(ci.settlement)}${has("prTimeline") ? ` (${esc(ci.prTimeline)})` : ""}</li>` : ""}
  </ul>
  ${plan.length ? `<h3>PR pathway, step by step</h3><ol class="bsteps">${plan.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>` : ""}
</div>` : ""}
${has("topCities") ? `<div class="card">
  <h2>🏙️ Top student cities in ${d.name}</h2>
  <p>${arr(ci.topCities).map(esc).join(" · ")}</p>
</div>` : ""}
${has("changes") ? `<div class="card">
  <h2>🆕 Recent changes (2024–26)</h2>
  <ul class="bcheck">${arr(ci.changes).map((c) => `<li><strong>${esc(c.d || "")}:</strong> ${esc(c.t || c)}</li>`).join("")}</ul>
</div>` : ""}
<div class="card uni-tips">
  <h2>🎯 Tips to get admission &amp; visa in ${d.name}</h2>
  <ul class="bcheck">
    <li><strong>Apply early.</strong> Submitting 4–6 months ahead keeps scholarships and on-campus housing open.</li>
    <li><strong>Clear the English score first.</strong> Most ${d.name} programmes need IELTS ${d.ielts} — take a free mock to find your weakest section before booking.</li>
    <li><strong>Show clear, stable funds.</strong> Visa officers want genuine proof of funds covering tuition (${tuition}) plus living costs.</li>
    <li><strong>Write a tailored SOP.</strong> Name the exact programme and university — generic essays are the #1 reason strong profiles get rejected.</li>
    <li><strong>Pick the right intake.</strong> Main intakes: ${has("intakes") ? ci.intakes.join(" & ") : d.intake}.</li>
  </ul>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🔮 Free College Predictor`, href: `/#/colleges` },
  { label: `💸 Scholarships for ${d.name}`, href: `/#/colleges` },
  { label: `🎯 Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `✍️ Free SOP guide & samples`, href: `/blog/how-to-write-sop/` },
  { label: `📊 English score requirements`, href: `/eligibility/` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: `Study in ${d.name}`, path }]),
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
    { q: `How do I apply for a scholarship to study in ${d.name}?`, a: `Research scholarships that match your profile (course level, field, nationality). Prepare strong academic records, an SOP, 2–3 LORs and English test scores. Apply early — most deadlines fall 6–9 months before intake.` },
    { q: `What is the typical deadline for ${d.name} scholarships?`, a: `Deadlines vary widely but often cluster 2–3 times a year around main intakes. Always check the official scholarship website — applying early improves your odds and gives you backup time.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Scholarships</a> › Study in ${d.name}</p>
<section class="hero">
  <div class="badges"><span class="badge">${d.flag} ${d.name}</span><span class="badge">2026</span><span class="badge">Free finder</span></div>
  <h1>Scholarships to Study in ${d.name} (2026)</h1>
  <p class="lead">Fully-funded and partial scholarships for international students heading to ${d.name}. Filter them all free in the Scholarship Finder, then practise for the English test you'll need.</p>
  <a class="cta" href="/#/colleges">▶ Open the free Scholarship Finder</a>
</section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Many fully-funded scholarships cover tuition and living costs for international students in ${d.name}. Top options include ${d.list.slice(0, 2).map(s => s.split(" (")[0]).join(" and ")}. Always confirm eligibility and deadlines on the official scholarship website, as requirements change each year.</div>
<div class="card">
  <h2>Top scholarships for ${d.name}</h2>
  <ul>${d.list.map(s => `<li>${s}</li>`).join("")}</ul>
  <p>Each has its own eligibility and deadline — many require strong academics, leadership and a high IELTS/TOEFL score. The free finder lets you compare award size, level and funding type side by side.</p>
</div>
<div class="card">
  <h2>What these scholarships cover</h2>
  <p>Fully-funded scholarships typically cover tuition fees in full, plus monthly or annual living allowances (€500–1,500/month typical). Some include airfare and health insurance. Always check the official page for exact details — funding amounts vary by scholarship, level (Master's vs PhD), and year.</p>
  <p class="note">Partial scholarships cover only tuition or a fixed amount; you fund living costs separately. Compare all awards in the finder.</p>
</div>
<div class="card">
  <h2>How to apply for scholarships to study in ${d.name}</h2>
  <ol>
    <li><strong>Know your profile:</strong> Bachelor's, Master's, or PhD? Which field or course? Check the finder to shortlist matching scholarships.</li>
    <li><strong>Gather documents:</strong> Academic transcripts, passport, CV, SOP (Statement of Purpose), 2–3 letters of reference from professors or employers, and a clean English test score (IELTS/TOEFL).</li>
    <li><strong>Take an English test early:</strong> Most scholarships need proof — take a free IELTS or TOEFL mock here first to find your gap.</li>
    <li><strong>Write a strong SOP:</strong> Name the specific course and university, explain why you chose it, how it fits your career, and why you deserve funding. Generic essays get rejected.</li>
    <li><strong>Submit before the deadline:</strong> Apply 2–3 months early — funding and interview slots fill fast. Confirm the exact deadline on the official scholarship website.</li>
  </ol>
</div>
<div class="card">
  <h2>Who can apply: typical eligibility</h2>
  <ul>
    <li><strong>Nationality:</strong> Most scholarships are open to international students globally, but some favour or require specific nationalities. Check each award.</li>
    <li><strong>Academic record:</strong> Usually require a strong bachelor's (3.0+ GPA / upper second-class honours) for Master's scholarships; excellent Master's for PhD.</li>
    <li><strong>English proficiency:</strong> IELTS Band 6.5–7.5 or TOEFL 80–100 typical. Prove it with an official test score from an exam authority.</li>
    <li><strong>Work experience:</strong> Some prefer applicants with 2–5 years of relevant work experience; others welcome fresh graduates.</li>
  </ul>
  <p class="note">Eligibility varies by scholarship — always confirm on the official website. Test these requirements early so you know if you're on track.</p>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `💸 Free Scholarship Finder`, href: `/#/colleges` },
  { label: `🏛️ Top universities in ${d.name}`, href: `/study-abroad/top-universities-in-${id}/` },
  { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `Free TOEFL mock test`, href: `/mock-test/toefl/` },
  { label: `How to write an SOP`, href: `/blog/how-to-write-sop/` },
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

// Inline markdown for static HTML: **bold** and [text](url).
function mdInline(s) {
  return s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, t, u) => `<a href="${u}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`);
}
// Rich section → HTML (paragraphs, callouts, steps, checklists, tables).
function renderBlogSection(s, lk) {
  let h = `<div class="card">`;
  if (s.h) h += `<h2>${esc(s.h)}</h2>`;
  if (s.body) h += esc(s.body).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${mdInline(linkifyBody(p, lk))}</p>`).join("");
  if (s.callout) { const t = s.callout.type || "info"; const ic = { info: "ℹ️", tip: "💡", money: "💰", warn: "⚠️", key: "🔑" }[t] || "ℹ️"; h += `<div class="callout ${t}"><span class="ic">${ic}</span><div>${mdInline(linkifyBody(esc(s.callout.text), lk))}</div></div>`; }
  if (Array.isArray(s.steps) && s.steps.length) h += `<ol class="bsteps">${s.steps.map((x) => `<li>${mdInline(linkifyBody(esc(x), lk))}</li>`).join("")}</ol>`;
  if (Array.isArray(s.bullets) && s.bullets.length) h += `<ul class="bcheck">${s.bullets.map((x) => `<li>${mdInline(linkifyBody(esc(x), lk))}</li>`).join("")}</ul>`;
  if (s.table && Array.isArray(s.table.rows)) h += `<table class="cmp-table">${Array.isArray(s.table.headers) ? `<thead><tr>${s.table.headers.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead>` : ""}<tbody>${s.table.rows.map((r) => `<tr>${r.map((c) => `<td>${mdInline(linkifyBody(esc(String(c)), lk))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  h += `</div>`;
  return h;
}

// Interactive IELTS↔TOEFL converter, embedded on the post that already ranks for
// "ielts to toefl" (pos ~21) — matches the tool intent without a duplicate page.
// Uses the official ETS concordance; vanilla JS runs on the static prerendered page.
function ieltsToeflConverterWidget() {
  return `<div class="card" id="ietc" style="border:1px solid #c7d2fe;background:#f8faff">
<h2 style="margin-top:0">Interactive IELTS ↔ TOEFL converter</h2>
<p class="muted" style="margin:0 0 10px;font-size:13px">Based on the official ETS concordance. Ranges are approximate — always confirm the exact score your university requires.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px">
  <div><label for="ietc-ielts" style="font-weight:700;font-size:14px">Your IELTS band</label><br>
    <select id="ietc-ielts" style="margin-top:6px;padding:8px 10px;border-radius:8px;border:1px solid #cbd5e1;font-size:14px;width:100%">
      <option value="">Select band…</option>
      <option>9.0</option><option>8.5</option><option>8.0</option><option>7.5</option><option selected>7.0</option><option>6.5</option><option>6.0</option><option>5.5</option><option>5.0</option><option>4.5</option>
    </select>
    <p id="ietc-out1" style="margin:10px 0 0;font-size:15px;font-weight:700;color:#4338ca">≈ TOEFL iBT 94–101</p></div>
  <div><label for="ietc-toefl" style="font-weight:700;font-size:14px">Your TOEFL iBT score</label><br>
    <input id="ietc-toefl" type="number" min="0" max="120" placeholder="e.g. 100" style="margin-top:6px;padding:8px 10px;border-radius:8px;border:1px solid #cbd5e1;font-size:14px;width:100%">
    <p id="ietc-out2" style="margin:10px 0 0;font-size:15px;font-weight:700;color:#4338ca">Enter a score 0–120</p></div>
</div>
<p style="margin:12px 0 0;font-size:13px"><a href="/tools/english-test-score-converter/">Need PTE, CEFR or Duolingo too? Use the full score converter →</a></p>
<script>
(function(){
  var T={9:"118–120",8.5:"115–117",8:"110–114",7.5:"102–109",7:"94–101",6.5:"79–93",6:"60–78",5.5:"46–59",5:"35–45",4.5:"32–34"};
  var bands=[[118,"9.0"],[115,"8.5"],[110,"8.0"],[102,"7.5"],[94,"7.0"],[79,"6.5"],[60,"6.0"],[46,"5.5"],[35,"5.0"],[32,"4.5"]];
  var s=document.getElementById("ietc-ielts"),o1=document.getElementById("ietc-out1"),
      t=document.getElementById("ietc-toefl"),o2=document.getElementById("ietc-out2");
  function i2t(){var v=parseFloat(s.value);o1.textContent=T[v]?("≈ TOEFL iBT "+T[v]):"Select a band";}
  function t2i(){var n=parseInt(t.value,10);if(isNaN(n)||n<0||n>120){o2.textContent="Enter a score 0–120";return;}var b="below 4.5";for(var i=0;i<bands.length;i++){if(n>=bands[i][0]){b="IELTS "+bands[i][1];break;}}o2.textContent="≈ "+b;}
  if(s){s.addEventListener("change",i2t);i2t();}
  if(t){t.addEventListener("input",t2i);}
})();
</script></div>`;
}
const BLOG_WIDGETS = {
  "ielts-to-toefl-score-conversion-2026": ieltsToeflConverterWidget(),
};

function blogPage(a) {
  const path = `/blog/${a.id}/`;
  const title = `${a.title} | ${BRAND}`;
  // Prefer a hand-tuned, CTR-optimized meta description (complete ≤155-char sentence)
  // over the raw excerpt, which is longer and gets truncated mid-thought in SERPs.
  const desc = a.metaDesc || a.excerpt.slice(0, 230);
  const kw = a.kw || (a.tag + ", study abroad, " + a.title.toLowerCase());
  const isHowTo = a.howTo === true || /^how-to-/.test(a.id) || /^how to /i.test(a.title);
  // Time-boxed / trending posts: set a.expires = "YYYY-MM-DD". Once it passes, the
  // post auto-noindexes + drops from the sitemap (page stays reachable, so no 404s
  // and no broken backlinks) — stale trend content never accumulates as domain-quality
  // drag, which is the whole point. tools/audit-expiring.mjs lists what's expiring/expired.
  const expired = a.expires && String(a.expires) < BUILD_DATE;
  const expiredBanner = expired
    ? `<div class="callout" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:12px 16px;margin:0 0 12px;color:#9a3412"><strong>⏳ Archived update.</strong> This was a time-sensitive post (expired ${esc(String(a.expires))}) and may be out of date. For current information, see our <a href="/#/blog" style="color:#9a3412;font-weight:600">latest guides</a>.</div>`
    : "";
  const lk = { used: new Set(), count: 0, max: 6, cur: path };
  const sectionsHtml = a.sections.map((s) => renderBlogSection(s, lk)).join("\n");
  const faqs = Array.isArray(a.faqs) ? a.faqs.map((f) => Array.isArray(f) ? { q: f[0], a: f[1] } : f).filter((f) => f && f.q && f.a) : [];
  // AEO: a "Quick answer" box that LLMs + featured snippets lift verbatim (the first
  // ~2 sentences that directly answer the title). Auto-derived from section 1.
  // A hand-tuned a.answer (figure-first, matches the exact head query) is preferred for
  // AEO/AI-Overview extraction; otherwise auto-derive from section 1.
  let qa;
  if (a.answer) { qa = String(a.answer).replace(/\s+/g, " ").trim(); }
  else {
    const qaSrc = ((a.sections[0] && a.sections[0].body) || a.excerpt || "").replace(/\s+/g, " ").trim();
    qa = ""; for (const s of qaSrc.split(/(?<=[.!?])\s+/)) { if (qa && (qa + " " + s).length > 340) break; qa += (qa ? " " : "") + s; }
  }
  const qaBlock = qa ? `<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 6px"><strong style="color:#4338ca">⚡ Quick answer:</strong> ${esc(qa)}</div>` : "";
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/blog">Blog</a> › ${esc(a.tag)}</p>
<section class="hero">
  <div class="badges"><span class="badge">${esc(a.tag)}</span><span class="badge">Updated ${esc(LASTMOD)}</span></div>
  <h1>${esc(a.title)}</h1>
  <p class="lead">${esc(a.excerpt)}</p>
  <p class="byline" style="font-size:13px;color:#64748b;margin:2px 0 10px">Written and reviewed by the <a href="/about/" style="color:#4338ca;font-weight:600">${BRAND} editorial team</a> · Last updated ${esc(LASTMOD)} · Sources are linked inline and verified against official test-maker, university and government pages.</p>
  <a class="cta" href="/#/colleges">▶ Free College Predictor &amp; study-abroad tools</a>
</section>
${expiredBanner}${qaBlock}
${(typeof BLOG_WIDGETS !== "undefined" && BLOG_WIDGETS[a.id]) || a.topHtml || ""}
${sectionsHtml}
${blogDataBlock(a)}
${faqs.length ? faqBlock(faqs) : ""}
${relatedArticles(a)}
${relatedGrid(blogTiles(a))}`;
  // a.canonicalTo = the id of the post this one should consolidate into (near-duplicate).
  const canonical = a.canonicalTo ? `${ORIGIN}/blog/${a.canonicalTo}/` : undefined;
  if (canonical) CANONICALISED_PATHS.add(path);
  emit(path, head({ title, desc, path, kw, canonical, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.excerpt,
      author: AUTHOR_ORG,
      publisher: PUBLISHER,
      datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: canonical || ORIGIN + path, inLanguage: "en-IN" }),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Blog", path: "/#/blog" }, { name: a.title, path }]),
    jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
    ...(isHowTo ? [howToJsonLd(a)] : []),
    ...(faqs.length ? [faqJsonLd(faqs)] : []),
  ] }) + shell(inner), expired ? { thin: true } : undefined);   // expired trend post → noindex + drop from sitemap
}

// ── Per-scholarship detail pages (auto-generated from scholarship-data) ─────
/**
 * Per-scholarship depth for /scholarship/<id>/.
 *
 * Same problem as the university pages: the facts were all present and never
 * compared to anything, leaving 26 pages in a 425-729 word band. This positions
 * each award against the rest of SCHOLARSHIP_DATA — the other awards for the same
 * country and the same level — which is the comparison an applicant actually needs
 * and which no single awarding body will ever publish about itself.
 *
 * Deliberately does NOT invent selection criteria or success rates. Where a fact is
 * not in the dataset it is not asserted; the guidance below is about how funding
 * calendars and eligibility gates work, which is stable and checkable.
 */
function scholarshipDepthBlock(s, dc) {
  const all = Array.isArray(SCHOLARSHIP_DATA) ? SCHOLARSHIP_DATA : [];
  const sameCountry = all.filter((x) => x && x.id !== s.id && x.country === s.country);
  const sameLevel = sameCountry.filter((x) => x.level === s.level);
  // Peer table only where real peers exist. 12 of the 26 awards are the only entry for
  // their country in the dataset, and inventing a comparison set for them would be worse
  // than showing none — but the guidance below holds regardless, so it always renders.
  const sameLevelAny = all.filter((x) => x && x.id !== s.id && x.level === s.level);
  const pick = (sameCountry.length >= 2 ? (sameLevel.length >= 2 ? sameLevel : sameCountry) : sameLevelAny).slice(0, 6);
  const peerScope = sameCountry.length >= 2 ? "country" : "level";
  const rows = pick.map((x) => `<tr><td><a href="/scholarship/${esc(String(x.id))}/">${esc(String(x.name))}</a></td><td>${esc(String(x.amount || "—"))}</td><td>${esc(String(x.country || "—"))}</td><td>${esc(String(x.deadline || "—"))}</td></tr>`).join("");
  const types = [...new Set((peerScope === "country" ? sameCountry : sameLevelAny).map((x) => x.type).filter(Boolean))];
  return `<div class="card"><h2>${peerScope === "country" ? `Other funding for ${esc(String(s.country))} — and how this one fits` : `Where the ${esc(String(s.name))} sits among ${esc(String(s.level))} funding`}</h2>
<p>${peerScope === "country"
  ? `Our dataset holds ${sameCountry.length} other ${esc(String(s.country))} ${sameCountry.length === 1 ? "award" : "awards"}${sameLevel.length >= 2 ? `, ${sameLevel.length} of them at ${esc(String(s.level))} level` : ""}.`
  : `The ${esc(String(s.name))} is the only ${esc(String(s.country))} award in our dataset, so there is no national set to compare it against. The table below shows other ${esc(String(s.level))} awards instead — a different country, but the same stage of study, which is usually the more useful comparison anyway when you are deciding where to apply.`} Almost nobody wins funding from a single application, so the useful question is not whether to apply for the ${esc(String(s.name))} but what else goes on the list beside it.</p>
${pick.length ? `<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Scholarship</th><th>Award</th><th>Country</th><th>Deadline</th></tr></thead><tbody>${rows}</tbody></table></div>` : ""}
${types.length > 1 ? `<p>These awards split across ${types.map((t) => esc(String(t))).join(", ")} funding. That distinction matters more than the headline amount: the eligibility gate on a government or institution award is usually fixed and checkable in advance, so you can rule yourself in or out on paper, while merit and need awards turn on a judgement you cannot audit. Build the list from the ones you can verify you qualify for, then add the judgement-based ones on top.</p>` : ""}
<ul class="bcheck">
<li><strong>Funding deadlines run ahead of admission deadlines.</strong> ${dc ? "" : `The ${esc(String(s.name))} closes ${esc(String(s.deadline || "on its published date"))}, `}and for most awards the money is decided weeks or months before a place is. Applying "on time" for the course and late for the funding is the single most expensive ordinary mistake in this process, and it costs nothing to avoid.</li>
<li><strong>Some awards need admission or nomination first.</strong> Where that is the case the real deadline is the one on the university application, not the one on the scholarship page, because you cannot meet the second without having cleared the first.</li>
<li><strong>One tailored application beats six generic ones.</strong> Every award publishes what it is for. The applications that fail are usually the ones that describe an excellent candidate without ever connecting them to that specific purpose.</li>
<li><strong>Amounts are rarely what they look like.</strong> A full-tuition award in an expensive city can leave a larger gap than a smaller stipend somewhere cheaper. Compare what is left unfunded, not what is granted.</li>
</ul>
<p class="note">Amounts, eligibility and deadlines are indicative and set by the awarding bodies, who change them without notice. Verify every figure on the official source before you rely on it — including the ones on this page.</p></div>`;
}

function scholarshipDetailPage(s) {
  const path = `/scholarship/${s.id}/`;
  const dc = s.discontinued;
  // UNVERIFIED = we publish precise money figures (stipends, tuition waivers, deadlines) with
  // no official source behind them and no record of anyone checking. A student can act on those
  // numbers. Two entries that WERE checked came back wrong — DAAD's stipend was a stale €934
  // against an actual €992, and "Canada Graduate Scholarships" turned out to be closed to
  // international students entirely — so the base rate of error here is not low.
  // Until an entry carries `official` (a source the reader can check) or `verified` (a date
  // someone checked it), it is kept OUT of the index rather than shown to search users as fact.
  // Costs almost nothing: across all 20 such pages, GSC shows 5 impressions in three months.
  // Fully reversible — add `verified: "YYYY-MM-DD"` after checking and it re-indexes next build.
  const unverified = !s.official && !s.verified && !dc;
  // A closed programme must never be titled/described as if you can still apply "2026" —
  // that is the kind of page that wastes an applicant's time and earns a manual penalty.
  const title = dc
    ? `${dc.title || `${s.name} Discontinued`} | ${BRAND}`
    : `${s.name} 2026 — Eligibility, Amount & Deadline | ${BRAND}`;
  const desc = dc
    ? (dc.desc || `The ${s.name} has been discontinued. It is replaced by the ${dc.replacedByName}: ${dc.replacedByAmount}.`)
    : `${s.name}: ${s.amount} for ${s.level} in ${s.country}. Eligibility: ${s.who}. Deadline: ${s.deadline}. Free scholarship finder + study-abroad tools.`;
  const kw = `${s.name.toLowerCase()}, ${s.name.toLowerCase()} eligibility, ${s.name.toLowerCase()} deadline, ${s.name.toLowerCase()} amount, ${s.country.toLowerCase()} scholarship, fully funded scholarship ${s.country.toLowerCase()}`;
  const faqs = dc ? [
    { q: `Can I still apply for the ${s.name}?`, a: `No. The ${s.name} has been discontinued — the final competition was ${dc.finalCompetition}. Applications are no longer accepted.` },
    { q: `What replaced the ${s.name}?`, a: `The ${dc.replacedByName}, a harmonised programme from Canada's three federal research councils. It is worth ${dc.replacedByAmount}.` },
    { q: `Who can apply for the ${dc.replacedByName}?`, a: `${dc.replacedByWho}` },
    { q: `What is the deadline for the ${dc.replacedByName}?`, a: `${dc.replacedByDeadline}. Confirm the exact date on the official programme page, and check your own institution's internal deadline, which comes earlier.` },
  ] : [
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
${unverified ? `<div class="callout" style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #d97706;border-radius:12px;padding:14px 18px;margin:0 0 12px;color:#78350f"><strong>⚠️ Figures on this page are unverified.</strong> We have not been able to confirm the award amount, eligibility or deadline below against an official source, so treat them as indicative only. <strong>Confirm with the awarding body before you rely on any of it.</strong> This page is deliberately excluded from search results until it is verified.</div>` : ""}
${dc ? `<div class="callout" style="background:#fff7ed;border:1px solid #fed7aa;border-left:4px solid #ea580c;border-radius:12px;padding:14px 18px;margin:0 0 12px;color:#7c2d12"><strong>⛔ This scholarship no longer exists.</strong> The ${esc(s.name)} was discontinued — the final competition was ${esc(dc.finalCompetition)}. <strong>You cannot apply for it.</strong> It has been replaced by the <strong>${esc(dc.replacedByName)}</strong>, worth ${esc(dc.replacedByAmount)}. Details below.</div>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> The ${esc(s.name)} is closed. Canada's three federal research councils replaced it with the ${esc(dc.replacedByName)}, worth ${esc(dc.replacedByAmount)}. Eligibility: ${esc(dc.replacedByWho)} The deadline is ${esc(dc.replacedByDeadline)}. Confirm everything on the official programme page before applying.</div>`
: `<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> The ${esc(s.name)} is a ${esc(s.type.toLowerCase())} scholarship for ${esc(s.level)} study in ${esc(s.country)}, worth ${esc(s.amount)}. It's open to ${esc(s.who)}, with applications typically due around ${esc(s.deadline)}. Always confirm the exact award, criteria and deadline on the official scholarship website, as they change each year.</div>`}
${dc ? `<div class="card">
  <h2>What replaced the ${esc(s.name)}</h2>
  <p>The Canadian Institutes of Health Research (CIHR), the Natural Sciences and Engineering Research Council (NSERC) and the Social Sciences and Humanities Research Council (SSHRC) merged several doctoral awards — including this one — into a single harmonised programme.</p>
  <table style="width:100%;border-collapse:collapse" class="uni-table">
    <tr><td><strong>Replacement</strong></td><td>${esc(dc.replacedByName)}</td></tr>
    <tr><td><strong>Award</strong></td><td>${esc(dc.replacedByAmount)}</td></tr>
    <tr><td><strong>Who can apply</strong></td><td>${esc(dc.replacedByWho)}</td></tr>
    <tr><td><strong>Deadline</strong></td><td>${esc(dc.replacedByDeadline)}</td></tr>
  </table>
  <p><a class="cta" href="${esc(dc.replacedByUrl)}" target="_blank" rel="noopener">Open the official ${esc(dc.replacedByName)} page →</a></p>
  <p class="note">External link to the awarding body. LandingPrep is not affiliated with it and does not process applications.</p>
</div>` : ""}
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
${dc ? "" : `<div class="card">
  <h2>What the ${esc(s.name)} covers — and why it's worth applying</h2>
  <p>${esc(s.highlight)} The award (${esc(s.amount)}) is aimed at ${esc(s.level)} study in ${esc(s.country)}, and goes to ${esc(s.who)}.</p>
  <p>Beyond the money, prestigious scholarships like this strengthen your CV, open alumni and professional networks, and can make your visa application stronger by proving your funding. Even if you're unsure you'll win, applying costs nothing here and the process sharpens your SOP for every other application.</p>
</div>`}
<div class="card">
  <h2>How to apply${dc ? ` for the ${esc(dc.replacedByName)}` : " (and stand out)"}</h2>
  ${dc ? `<p class="note">These steps are for the replacement programme. The ${esc(s.name)} itself is closed and cannot be applied for.</p>` : ""}
  <ol>
    <li>Confirm you meet the eligibility: ${esc(dc ? dc.replacedByWho : s.who)}.</li>
    <li>Read the official criteria carefully and note exactly what the scholarship values.</li>
    <li>Secure your university admission or nomination first, where it's required.</li>
    <li>Write a specific, story-led SOP that ties your goals to the scholarship's mission — build and refine yours free with our SOP tool.</li>
    <li>Line up strong, tailored recommendation letters early (referees need 2–3 weeks).</li>
    <li>Highlight leadership, impact and a clear plan for how you'll use the opportunity.</li>
    <li>Submit well before the ${esc(dc ? dc.replacedByDeadline : s.deadline)} deadline, and prepare for an interview if you're shortlisted.</li>
  </ol>
  <p class="note">Always verify amounts, eligibility and deadlines on the official scholarship website — these change every year.</p>
</div>
${s.official ? `<div class="card">
  <h2>Official source</h2>
  <p>Every figure on this page is indicative and the awarding body can change it without notice. Check the current amount, eligibility and deadline here before you apply:</p>
  <p><a class="cta" href="${esc(s.official)}" target="_blank" rel="noopener">Open the official ${esc(s.name)} website →</a></p>
  <p class="note">External link to the awarding body. LandingPrep is not affiliated with it and does not process applications.</p>
</div>` : ""}
${scholarshipDepthBlock(s, dc)}
${faqBlock(faqs)}
${relatedGrid([
  { label: `💸 All scholarships (free finder)`, href: `/#/colleges` },
  { label: `📝 Free SOP Builder`, href: `/#/colleges` },
  { label: `Scholarships to study in ${esc(s.country)}`, href: `/scholarships/study-in-${({ USA: "usa", UK: "uk", Germany: "germany", Canada: "canada", Australia: "australia" })[s.country] || "usa"}/` },
  { label: `Fully funded scholarships`, href: `/fully-funded-scholarships/` },
  { label: `Free IELTS mock test`, href: `/mock-test/ielts/` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Scholarships", path: "/#/colleges" }, { name: s.name, path }]),
    // MonetaryGrant describes what this page IS. Built strictly from fields already rendered
    // above — no new claims — and `url` points at the awarding body's own site where one has
    // been verified, so the entity resolves to the real programme rather than to us.
    jsonld({
      "@context": "https://schema.org", "@type": "MonetaryGrant",
      name: s.name, description: s.highlight,
      ...(s.official ? { url: s.official, sameAs: s.official } : { url: ORIGIN + path }),
      funder: { "@type": "Organization", name: s.name.replace(/\s+Scholarships?$/i, "") },
      ...(s.official ? { sponsor: { "@type": "Organization", name: s.name.replace(/\s+Scholarships?$/i, ""), url: s.official } } : {}),
    }),
  ] }) + shell(inner), unverified ? { thin: true } : undefined);
}

// ── SOP / LOR / motivation-letter sample library (high-intent, pairs with the SOP builder) ──
function sopSamplePage(s) {
  const path = `/sop-samples/${s.id}/`;
  const title = `${s.title} (2026) | ${BRAND}`;
  const desc = s.metaDesc;
  const others = SOP_SAMPLES.filter((x) => x.id !== s.id).slice(0, 4);
  const faqs = [
    { q: `Can I copy this ${s.type.toLowerCase()} sample?`, a: `No — use it only as a structural model. Admissions systems run plagiarism checks, and a copied ${s.type.toLowerCase()} is easy to spot and will hurt your application. Replace every fact, example and sentence with your own.` },
    { q: `How long should a ${s.course} ${s.type.toLowerCase()} be?`, a: `Most ${s.type.toLowerCase() === "letter of recommendation" ? "recommendation letters run about 400–600 words (roughly one page)" : "statements of purpose run about 800–1,000 words (one to two pages)"}, unless the university sets a specific word or page limit — always follow their stated limit.` },
    { q: `Where can I build my own ${s.type.toLowerCase()} for free?`, a: `Use the free ${BRAND} SOP builder to draft and refine your own ${s.type.toLowerCase()} step by step, then tailor it to each university and program.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/sop-samples/">SOP &amp; LOR Samples</a> › ${esc(s.course)}</p>
<section class="hero">
  <div class="badges"><span class="badge">${esc(s.type)}</span><span class="badge">${esc(s.course)}</span><span class="badge">2026</span></div>
  <h1>${esc(s.title)}</h1>
  <p class="lead">${esc(s.sampleIntro)}</p>
  <a class="cta" href="/#/colleges">▶ Build your own ${esc(s.type)} free (SOP builder)</a>
</section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> ${esc(s.quick)}</div>
<div class="card" style="border-left:4px solid #f59e0b;background:#fffbeb">
  <h2>⚠️ Use as a model — never copy</h2>
  <p>This is an original, illustrative ${esc(s.type.toLowerCase())} written by the ${BRAND} editorial team — realistic but fictional. Universities and scholarship bodies run plagiarism checks, so copying any online sample (including this one) will damage your application. Study the structure, then write something that is unmistakably <em>you</em>.</p>
</div>
<div class="card">
  <h2>${esc(s.title)} — full sample</h2>
  ${s.sample.map((p) => `<p>${esc(p)}</p>`).join("")}
</div>
<div class="card">
  <h2>Structure — paragraph by paragraph</h2>
  <table style="width:100%;border-collapse:collapse" class="uni-table"><tbody>${s.structure.map((r) => `<tr><td style="white-space:nowrap"><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table>
</div>
<div class="card">
  <h2>Common mistakes to avoid</h2>
  <ul class="bcheck">${s.mistakes.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `📝 Build your ${esc(s.type)} free`, href: `/#/colleges` },
  { label: `✍️ How to write a winning SOP`, href: `/blog/how-to-write-sop/` },
  ...others.map((o) => ({ label: `${o.type === "Letter of Recommendation" ? "📄" : "📋"} ${o.course} ${o.type === "Statement of Purpose" ? "SOP" : o.type}`, href: `/sop-samples/${o.id}/` })),
  { label: `🏛️ Free College Predictor`, href: `/#/colleges` },
])}`;
  emit(path, head({ title, desc, path, kw: s.kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "Article", headline: s.title, description: s.metaDesc,
      author: AUTHOR_ORG,
      publisher: PUBLISHER,
      datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "SOP & LOR Samples", path: "/sop-samples/" }, { name: s.course, path }]),
  ] }) + shell(inner));
}
function sopSamplesIndex() {
  if (!SOP_SAMPLES.length) return;
  const path = `/sop-samples/`;
  const cards = SOP_SAMPLES.map((s) => `<div class="card"><h2><a href="/sop-samples/${s.id}/">${esc(s.title)}</a></h2><p>${esc(s.metaDesc)}</p><a class="tile" href="/sop-samples/${s.id}/">Read the sample →</a></div>`).join("");
  const faqs = [
    { q: "Are these SOP and LOR samples free?", a: `Yes — every sample, the paragraph-by-paragraph breakdown and the ${BRAND} SOP builder are 100% free, with no signup.` },
    { q: "Should I copy a sample SOP?", a: "Never. Use samples only to understand structure and tone. Admissions systems check for plagiarism, and a copied statement is easy to detect and will hurt your application. Write your own, tailored to each university." },
    { q: "What's the difference between an SOP and a motivation letter?", a: "They overlap heavily. A Statement of Purpose (SOP) is the academic essay most universities ask for; a motivation letter is the European/scholarship equivalent and is often slightly shorter and more personal. Both must connect your background, your fit for the specific program or award, and your goals." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › SOP &amp; LOR Samples</p>
<section class="hero"><div class="badges"><span class="badge">100% free</span><span class="badge">${SOP_SAMPLES.length} samples</span><span class="badge">2026</span></div>
<h1>Free SOP, LOR &amp; Motivation Letter Samples</h1>
<p class="lead">Complete, original sample Statements of Purpose, Letters of Recommendation and scholarship motivation letters — each with a paragraph-by-paragraph breakdown and the mistakes to avoid. Study them, then build your own free.</p>
<a class="cta" href="/#/colleges">▶ Build your own SOP free</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> A strong Statement of Purpose tells one focused story: a specific motivation, concrete evidence of your ability, exactly why you want <em>this</em> program, and clear goals. Use the samples below as structural models — never copy them, because universities run plagiarism checks. Build and tailor your own with the free SOP builder.</div>
${cards}
${faqBlock(faqs)}
${relatedGrid([
  { label: `📝 Free SOP Builder`, href: `/#/colleges` },
  { label: `✍️ How to write a winning SOP`, href: `/blog/how-to-write-sop/` },
  { label: `🏛️ Free College Predictor`, href: `/#/colleges` },
  { label: `💸 Scholarships (free finder)`, href: `/fully-funded-scholarships/` },
])}`;
  emit(path, head({ title: `Free SOP, LOR & Motivation Letter Samples (2026) | ${BRAND}`, desc: `Free, complete SOP, Letter of Recommendation and scholarship motivation letter samples with paragraph-by-paragraph breakdowns. Build your own free — never copy.`, path, kw: "sop samples, statement of purpose sample, lor sample, motivation letter sample, sop for masters sample, free sop examples", jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "SOP & LOR Samples", path }]),
  ] }) + shell(inner));
}

// ── Student-visa interview question banks (very high intent, evergreen) ──────────
function visaInterviewPage(v) {
  const path = `/visa-interview/${v.id}/`;
  const title = `${v.title} | ${BRAND}`;
  const desc = v.metaDesc;
  const others = VISA_INTERVIEWS.filter((x) => x.id !== v.id);
  const catBlocks = v.categories.map((cat) => `<div class="card"><h2>${esc(cat.h)}</h2>${cat.qs.map((q) => `<div class="vrow"><strong>${esc(q.q)}</strong><br/><span class="vex">💡 ${esc(q.how)}</span></div>`).join("")}</div>`).join("");
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/visa-interview/">Visa Interviews</a> › ${esc(v.country)}</p>
<section class="hero">
  <div class="badges"><span class="badge">${v.flag} ${esc(v.country)}</span><span class="badge">${esc(v.visa)}</span><span class="badge">2026</span></div>
  <h1>${esc(v.title)}</h1>
  <p class="lead">Genuine, consistent answers — not memorised scripts — are what pass a visa interview. Use these as practice prompts, then answer in your own words.</p>
  <a class="cta" href="/#/colleges">▶ Plan your study abroad free</a>
</section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> ${esc(v.quick)}</div>
<div class="card"><h2>How the ${esc(v.visa)} assessment works</h2><p>${esc(v.format)}</p></div>
${catBlocks}
<div class="card"><h2>Why applications get refused</h2><ul class="bcheck">${v.rejections.map((r) => `<li>${esc(r)}</li>`).join("")}</ul></div>
<div class="card"><h2>How to prepare</h2><ol class="bsteps">${v.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ol></div>
<div class="card" style="border-left:4px solid #f59e0b;background:#fffbeb"><h2>⚠️ Answer honestly — never script or fake it</h2><p>Visa officers are trained to spot rehearsed or false answers, and inconsistency with your documents is the fastest way to be refused. Use these questions to <em>practise</em> and to make sure your real reasons, finances and plans are clear and consistent — never to invent a story. Always confirm current requirements on the official government website before you apply.</p></div>
${faqBlock(v.faqs)}
${relatedGrid([
  { label: `🎓 Free College Predictor`, href: `/#/colleges` },
  { label: `📝 Free SOP samples & builder`, href: `/sop-samples/` },
  ...others.map((o) => ({ label: `${o.flag} ${o.country} visa interview`, href: `/visa-interview/${o.id}/` })),
  { label: `🌍 Score requirements by country`, href: `/eligibility/` },
])}`;
  emit(path, head({ title, desc, path, kw: v.kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "Article", headline: v.title, description: v.metaDesc,
      author: AUTHOR_ORG,
      publisher: PUBLISHER,
      datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
    faqJsonLd(v.faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Visa Interviews", path: "/visa-interview/" }, { name: v.country, path }]),
  ] }) + shell(inner));
}
function visaInterviewIndex() {
  if (!VISA_INTERVIEWS.length) return;
  const path = `/visa-interview/`;
  const cards = VISA_INTERVIEWS.map((v) => `<div class="card"><h2><a href="/visa-interview/${v.id}/">${v.flag} ${esc(v.country)} — ${esc(v.visa)}</a></h2><p>${esc(v.metaDesc)}</p><a class="tile" href="/visa-interview/${v.id}/">See the questions →</a></div>`).join("");
  const faqs = [
    { q: "Are these visa interview guides free?", a: `Yes — every question bank, the answering guidance and the ${BRAND} study-abroad tools are 100% free, with no signup.` },
    { q: "Should I memorise answers to visa interview questions?", a: "No. Visa officers are trained to detect rehearsed or coached answers, and any inconsistency with your documents can cause a refusal. Use these questions to practise and to make sure your genuine reasons, finances and plans are clear — then answer in your own words." },
    { q: "How accurate is this information?", a: "It's written and fact-checked by the LandingPrep editorial team against official government sources and kept current for 2026 (for example, Canada's Student Direct Stream closed in November 2024, and Australia replaced the GTE test with the Genuine Student requirement in March 2024). Visa rules change — always confirm on the official government website before applying." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › Visa Interviews</p>
<section class="hero"><div class="badges"><span class="badge">100% free</span><span class="badge">${VISA_INTERVIEWS.length} countries</span><span class="badge">2026</span></div>
<h1>Student Visa Interview Questions & Answers (2026)</h1>
<p class="lead">The most common student-visa interview questions for the USA, UK, Canada and Australia — with honest guidance on how to answer each, why applications get refused, and how to prepare. Free.</p>
<a class="cta" href="/#/colleges">▶ Plan your study abroad free</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Every student-visa interview is really one test: are you a <em>genuine</em>, funded student with a credible plan? Officers assess your reasons, your finances and (for some countries) your ties to home. The way to pass is to know your own course, costs and goals and answer honestly and consistently — never with a memorised script. Pick your destination below.</div>
${cards}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🎓 Free College Predictor`, href: `/#/colleges` },
  { label: `📝 SOP, LOR & motivation samples`, href: `/sop-samples/` },
  { label: `🌍 Score requirements by country`, href: `/eligibility/` },
  { label: `✈️ Move-abroad checklist`, href: `/#/relocate` },
])}`;
  emit(path, head({ title: `Student Visa Interview Questions & Answers — USA, UK, Canada, Australia (2026) | ${BRAND}`, desc: `Free student-visa interview question banks for the USA (F-1), UK, Canada and Australia with honest answering guidance, refusal reasons and prep checklists.`, path, kw: "student visa interview questions, f1 visa interview questions, uk student visa interview, canada study permit interview, australia student visa questions", jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Visa Interviews", path }]),
  ] }) + shell(inner));
}

// ── Cost-of-studying-abroad calculator (self-contained interactive tool page) ────
function costCalculatorPage() {
  const path = `/tools/cost-of-studying-abroad-calculator/`;
  const refRows = COUNTRY_DATA.map((c) => `<tr><td>${c.flag || "🎓"} <a href="/study-abroad/cost-of-studying-in-${c.id}/">${esc(c.name)}</a></td><td>${esc(c.avgTuition || "—")}</td><td>${esc(c.avgLiving || "—")}</td></tr>`).join("");
  const faqs = [
    { q: "How much does it cost to study abroad?", a: "It varies hugely by country: tuition can be near-zero (public universities in Germany) to US$30,000–60,000/year (USA), and living costs roughly US$10,000–20,000/year. Use the calculator above with your own numbers, and the per-country table below for typical ranges." },
    { q: "What costs should I include in a study-abroad budget?", a: "Tuition, living (rent, food, transport), one-time costs (visa fee, flights, health insurance, a security/blocked-account deposit), plus application and English-test fees. The calculator covers tuition, living, visa, flights and other one-time costs." },
    { q: "How can I reduce the cost of studying abroad?", a: "Scholarships, education loans, choosing lower-tuition countries (e.g. Germany), part-time work (most student visas allow ~20 hours/week), and applying early for funding all reduce the net cost." },
  ];
  const calc = `
<div class="card">
  <h2>💰 Estimate your total cost</h2>
  <p class="note">Enter every value in the <strong>same currency</strong> (your tuition currency is easiest). Use the per-country ranges below as a guide.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:10px 0">
    <label>Tuition per year<input id="lp_tuition" type="number" inputmode="decimal" min="0" placeholder="e.g. 30000" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Living cost per month<input id="lp_living" type="number" inputmode="decimal" min="0" placeholder="e.g. 1200" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Programme length (years)<input id="lp_years" type="number" inputmode="decimal" min="0.5" step="0.5" value="2" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Visa fee (one-time)<input id="lp_visa" type="number" inputmode="decimal" min="0" placeholder="e.g. 500" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Flights (one-time)<input id="lp_flights" type="number" inputmode="decimal" min="0" placeholder="e.g. 800" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Other one-time (insurance, deposit)<input id="lp_other" type="number" inputmode="decimal" min="0" placeholder="e.g. 1500" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button id="lp_calc_btn" class="cta" type="button" style="border:0;cursor:pointer">Calculate total cost →</button>
  <div id="lpCalcOut" style="margin-top:12px"></div>
</div>
<script>
(function(){
  function num(id){var v=parseFloat((document.getElementById(id)||{}).value);return isNaN(v)?0:Math.max(0,v);}
  function fmt(x){try{return Math.round(x).toLocaleString();}catch(e){return Math.round(x);}}
  function calc(){
    var years=num('lp_years')||1, tuition=num('lp_tuition'), living=num('lp_living');
    var visa=num('lp_visa'), flights=num('lp_flights'), other=num('lp_other');
    var perYear=tuition+living*12;
    var total=perYear*years+visa+flights+other;
    var out=document.getElementById('lpCalcOut');
    if(out) out.innerHTML='<div class="callout money"><span class="ic">💰</span><div><strong>Per year:</strong> '+fmt(perYear)+'<br><strong>Total for '+years+' year(s):</strong> '+fmt(total)+'<br><span style="color:var(--muted);font-size:13px">Tuition + (monthly living × 12), times years, plus one-time visa, flights &amp; other costs — in the currency you entered. An estimate; confirm exact figures with your university and consulate.</span></div></div>';
  }
  var b=document.getElementById('lp_calc_btn');
  if(b) b.addEventListener('click',calc);
})();
</script>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › Cost of Studying Abroad Calculator</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">Instant</span><span class="badge">No signup</span></div>
<h1>Cost of Studying Abroad Calculator (2026)</h1>
<p class="lead">Add up the real cost of studying abroad — tuition, living, visa, flights and one-time costs — for your programme, instantly and free.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Your total study-abroad cost = (tuition per year + 12 × monthly living) × programme length + one-time costs (visa, flights, insurance, deposits). Tuition ranges from near-zero (public universities in Germany) to US$30,000–60,000/year (USA); living is roughly US$10,000–20,000/year. Use the calculator below with your own numbers.</div>
${calc}
<div class="card"><h2>Typical tuition &amp; living costs by country (2026)</h2>
<table style="width:100%;border-collapse:collapse" class="uni-table"><thead><tr><th>Country</th><th>Tuition / year (international)</th><th>Living cost</th></tr></thead><tbody>${refRows}</tbody></table>
<p class="note">Indicative 2026 ranges in each country's local currency — always confirm current figures with the university. Tap a country for a full cost &amp; ROI breakdown.</p></div>
<div class="card"><h2>What's included in the cost of studying abroad</h2><ul class="bcheck">
<li><strong>Tuition</strong> — the biggest variable; public universities in some countries are near-free, top private/US universities are the most expensive.</li>
<li><strong>Living costs</strong> — rent, food, transport and personal expenses; big cities cost much more than smaller towns.</li>
<li><strong>One-time costs</strong> — student-visa fee, flights, health insurance, and any security or blocked-account deposit (e.g. Germany).</li>
<li><strong>Application costs</strong> — English test (IELTS/TOEFL/PTE), application fees, and document/courier costs.</li>
<li><strong>Offsets</strong> — scholarships, education loans and part-time work (most student visas allow about 20 hours/week) reduce the net cost.</li>
</ul></div>
${toolDepthBlock("cost-of-studying-abroad-calculator")}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🌍 Score requirements by country`, href: `/eligibility/` },
  { label: `💸 Scholarships by country`, href: `/fully-funded-scholarships/` },
  { label: `📅 Intakes & deadlines`, href: `/intakes/` },
  { label: `🏛️ Free College Predictor`, href: `/#/colleges` },
  { label: `🔄 Score converter`, href: `/tools/english-test-score-converter/` },
])}`;
  emit(path, head({ title: `Cost of Studying Abroad Calculator 2026 — Free Tuition + Living Estimator | ${BRAND}`, desc: `Free cost-of-studying-abroad calculator: add tuition, living, visa, flights & one-time costs for your programme. Plus typical 2026 tuition & living ranges for every country.`, path, kw: "cost of studying abroad calculator, study abroad cost calculator, tuition and living cost calculator, how much does it cost to study abroad, study abroad budget calculator", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "Cost of Studying Abroad Calculator", applicationCategory: "FinanceApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "Cost of Studying Abroad Calculator", path }]),
  ] }) + shell(inner));
}

// ── CGPA / SGPA → Percentage converter (self-contained interactive tool page) ────
// India has NO single official CGPA→% formula — it is set per university. The tool is
// honest about this: it offers the common conventions + a custom multiplier, and tells
// users to confirm their university's official rule. Accuracy/honesty over false precision.
function cgpaToPercentagePage() {
  const path = `/tools/cgpa-to-percentage-calculator/`;
  const faqs = [
    { q: "How do I convert CGPA to percentage?", a: "There is no single national formula — each university sets its own. The most common conventions on a 10-point scale are: CBSE style, Percentage = CGPA × 9.5; many universities (e.g. VTU) use Percentage = CGPA × 10 − 7.5; and some simply use Percentage = CGPA × 10. Always confirm the exact rule printed on your marksheet or your university's website." },
    { q: "Which CGPA to percentage formula should I use?", a: "Use the one your own university officially specifies — it is usually on the marksheet, grade card or the university website. If you don't know it, the CBSE ×9.5 rule is the most widely quoted for 10-point CGPA, but it is only an approximation for other universities." },
    { q: "Is CGPA × 9.5 an official formula?", a: "It is the official conversion CBSE published for its 10-point grading, and it is widely reused as an approximation. It is NOT automatically valid for every university — many use ×10 − 7.5 or their own table. Treat any generic formula as an estimate until you confirm your university's official rule." },
    { q: "Do foreign universities accept a converted percentage?", a: "Most prefer your original CGPA and official transcript, and may run their own conversion (or use a service like WES). Provide your real CGPA and let them convert; use this tool only for a quick personal estimate." },
  ];
  const calc = `
<div class="card">
  <h2>🎓 Convert CGPA to percentage</h2>
  <p class="note">Pick the formula your <strong>university</strong> uses (check your marksheet). No single formula is official for all universities.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:10px 0">
    <label>Your CGPA / SGPA<input id="lp_cgpa" type="number" inputmode="decimal" min="0" max="10" step="0.01" placeholder="e.g. 8.2" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Scale (max CGPA)<input id="lp_scale" type="number" inputmode="decimal" min="1" step="0.5" value="10" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Formula<select id="lp_formula" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px">
      <option value="9.5">CBSE style — CGPA × 9.5</option>
      <option value="m7.5">Many universities — CGPA × 10 − 7.5</option>
      <option value="10">Simple — CGPA × 10</option>
      <option value="custom">Custom multiplier…</option>
    </select></label>
    <label id="lp_custom_wrap" style="display:none">Custom multiplier<input id="lp_custom" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 9.5" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button id="lp_cgpa_btn" class="cta" type="button" style="border:0;cursor:pointer">Convert to percentage →</button>
  <div id="lpCgpaOut" style="margin-top:12px"></div>
</div>
<script>
(function(){
  function num(id){var e=document.getElementById(id);var v=parseFloat(e&&e.value);return isNaN(v)?0:v;}
  var sel=document.getElementById('lp_formula'), cw=document.getElementById('lp_custom_wrap');
  if(sel) sel.addEventListener('change',function(){cw.style.display=sel.value==='custom'?'':'none';});
  function conv(){
    var cgpa=Math.max(0,num('lp_cgpa')), scale=num('lp_scale')||10, f=sel?sel.value:'9.5';
    var out=document.getElementById('lpCgpaOut');
    if(!cgpa){ if(out) out.innerHTML='<div class="callout"><span class="ic">⚠️</span><div>Enter your CGPA to convert.</div></div>'; return; }
    var base = scale===10 ? cgpa : (cgpa/scale*10); // normalise to a 10-point CGPA first
    var pct, how;
    if(f==='9.5'){ pct=base*9.5; how='CGPA × 9.5 (CBSE style)'; }
    else if(f==='m7.5'){ pct=base*10-7.5; how='CGPA × 10 − 7.5'; }
    else if(f==='10'){ pct=base*10; how='CGPA × 10'; }
    else { var m=num('lp_custom'); pct=base*m; how='CGPA × '+m+' (custom)'; }
    pct=Math.max(0,Math.min(100,pct));
    if(out) out.innerHTML='<div class="callout tip"><span class="ic">🎓</span><div><strong>Estimated percentage: '+pct.toFixed(2)+'%</strong><br><span style="color:var(--muted);font-size:13px">Using '+how+(scale!==10?', normalised from your '+scale+'-point scale':'')+'. This is an estimate — your university sets the official formula, so confirm it on your marksheet or university website before using it on any application.</span></div></div>';
  }
  var b=document.getElementById('lp_cgpa_btn');
  if(b) b.addEventListener('click',conv);
})();
</script>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › CGPA to Percentage Calculator</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">Instant</span><span class="badge">No signup</span></div>
<h1>CGPA to Percentage Calculator</h1>
<p class="lead">Convert your CGPA or SGPA to a percentage instantly — using the exact formula your university applies. Free, no signup.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> There is no single national formula. On a 10-point scale the common conventions are <strong>Percentage = CGPA × 9.5</strong> (CBSE style), <strong>CGPA × 10 − 7.5</strong> (many universities such as VTU), or <strong>CGPA × 10</strong>. Use the one your university officially specifies — check your marksheet.</div>
${calc}
<div class="card"><h2>Common CGPA → percentage formulas (10-point scale)</h2>
<table style="width:100%;border-collapse:collapse" class="uni-table"><thead><tr><th>Convention</th><th>Formula</th><th>Example (CGPA 8.0)</th></tr></thead><tbody>
<tr><td>CBSE style</td><td>CGPA × 9.5</td><td>76.0%</td></tr>
<tr><td>Many universities (e.g. VTU)</td><td>CGPA × 10 − 7.5</td><td>72.5%</td></tr>
<tr><td>Simple</td><td>CGPA × 10</td><td>80.0%</td></tr>
</tbody></table>
<p class="note">These are the most-used conventions, not a universal rule. Autonomous colleges and many universities publish their own conversion — always use the official one for applications.</p></div>
<div class="card"><h2>How to find your university's official formula</h2><ul class="bcheck">
<li>Check your <strong>marksheet / grade card</strong> — many print the conversion formula or a percentage directly.</li>
<li>Search your <strong>university's website</strong> for "CGPA to percentage" or the examination/results rules.</li>
<li>Ask your <strong>examination cell / registrar</strong> if it isn't published.</li>
<li>For <strong>foreign applications</strong>, submit your real CGPA and transcript — the university (or WES) will convert it themselves.</li>
</ul></div>
${toolDepthBlock("cgpa-to-percentage-calculator")}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🎯 Percentage to US GPA (4.0)`, href: `/tools/percentage-to-gpa-calculator/` },
  { label: `🔄 English test score converter`, href: `/tools/english-test-score-converter/` },
  { label: `🏛️ Free College Predictor`, href: `/#/colleges` },
  { label: `💰 Cost of studying abroad`, href: `/tools/cost-of-studying-abroad-calculator/` },
])}`;
  emit(path, head({ title: `CGPA to Percentage Calculator — Free & Instant (2026) | ${BRAND}`, desc: `Free CGPA/SGPA to percentage calculator using your university's formula (CBSE ×9.5, ×10−7.5 or custom). Instant, honest estimate with no signup.`, path, kw: "cgpa to percentage calculator, sgpa to percentage, cgpa to percentage formula, convert cgpa to percentage, 10 point cgpa to percentage, cgpa calculator", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "CGPA to Percentage Calculator", applicationCategory: "EducationApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "CGPA to Percentage Calculator", path }]),
  ] }) + shell(inner));
}

// ── Percentage → US 4.0 GPA converter (self-contained interactive tool page) ────
// No universal India%→US-GPA formula exists; WES and individual universities differ.
// The tool gives a widely-used band estimate with a clear "official conversion varies" note.
function percentageToGpaPage() {
  const path = `/tools/percentage-to-gpa-calculator/`;
  const faqs = [
    { q: "How do I convert my percentage to a US 4.0 GPA?", a: "There is no single official formula. US universities and evaluation services (like WES) usually use a band/grade mapping rather than simple division. A widely-used approximation puts 85%+ at about 4.0, 75–84% at roughly 3.3–3.7, 65–74% at about 2.7–3.0, and 55–64% at about 2.0–2.3. Treat any converted GPA as an estimate — the university or WES makes the official conversion." },
    { q: "Is percentage ÷ 25 a correct way to get GPA?", a: "No — 'percentage ÷ 25' (so 80% = 3.2) is a crude shortcut that most US universities do NOT use. Admissions offices and services like WES convert grade by grade using bands, which is why this tool uses a band estimate and tells you to confirm with the university." },
    { q: "Should I convert my GPA myself for applications?", a: "Usually not. Most US universities ask for your original transcript and percentage/CGPA and either convert it themselves or require a WES/credential evaluation. Use this tool for a personal estimate, not as the number you submit." },
    { q: "What is a good GPA for US universities?", a: "Competitive master's programmes often look for roughly a 3.0+ GPA (about 65%+ in the Indian system), with top programmes wanting 3.5+ (about 80%+). Requirements vary widely by university and course — always check the specific programme." },
  ];
  const calc = `
<div class="card">
  <h2>🎯 Convert percentage to US GPA (4.0 scale)</h2>
  <p class="note">A band-based estimate (the way most US universities and WES actually convert). Not an official figure.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:10px 0">
    <label>Your percentage<input id="lp_pct" type="number" inputmode="decimal" min="0" max="100" step="0.1" placeholder="e.g. 78" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button id="lp_gpa_btn" class="cta" type="button" style="border:0;cursor:pointer">Convert to GPA →</button>
  <div id="lpGpaOut" style="margin-top:12px"></div>
</div>
<script>
(function(){
  function num(id){var e=document.getElementById(id);var v=parseFloat(e&&e.value);return isNaN(v)?0:v;}
  var bands=[[85,4.0,'A'],[80,3.7,'A−'],[75,3.3,'B+'],[70,3.0,'B'],[65,2.7,'B−'],[60,2.3,'C+'],[55,2.0,'C'],[50,1.7,'C−'],[0,1.0,'D/F']];
  function conv(){
    var p=num('lp_pct'), out=document.getElementById('lpGpaOut');
    if(!p){ if(out) out.innerHTML='<div class="callout"><span class="ic">⚠️</span><div>Enter your percentage to convert.</div></div>'; return; }
    p=Math.max(0,Math.min(100,p));
    var g=1.0,letter='D/F';
    for(var i=0;i<bands.length;i++){ if(p>=bands[i][0]){ g=bands[i][1]; letter=bands[i][2]; break; } }
    if(out) out.innerHTML='<div class="callout tip"><span class="ic">🎯</span><div><strong>Estimated GPA: '+g.toFixed(1)+' / 4.0 ('+letter+')</strong><br><span style="color:var(--muted);font-size:13px">Band estimate for '+p+'%. US universities and services like WES make the official conversion (often grade-by-grade), so this is a guide only — confirm the requirement with your target programme.</span></div></div>';
  }
  var b=document.getElementById('lp_gpa_btn');
  if(b) b.addEventListener('click',conv);
})();
</script>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › Percentage to GPA Calculator</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">4.0 scale</span><span class="badge">No signup</span></div>
<h1>Percentage to GPA Calculator (US 4.0 Scale)</h1>
<p class="lead">Estimate your US 4.0 GPA from an Indian percentage — using the band method most universities and WES actually apply. Free, instant, honest.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> There is no single official formula. US universities and services like WES map grades to a 4.0 scale by <strong>bands</strong>, not by dividing. Roughly: <strong>85%+ ≈ 4.0</strong>, 75–84% ≈ 3.3–3.7, 65–74% ≈ 2.7–3.0, 55–64% ≈ 2.0–2.3. Use it as an estimate and confirm with your university.</div>
${calc}
<div class="card"><h2>Percentage → GPA band table (estimate)</h2>
<table style="width:100%;border-collapse:collapse" class="uni-table"><thead><tr><th>Percentage</th><th>GPA (4.0)</th><th>Letter</th></tr></thead><tbody>
<tr><td>85–100%</td><td>4.0</td><td>A</td></tr>
<tr><td>80–84%</td><td>3.7</td><td>A−</td></tr>
<tr><td>75–79%</td><td>3.3</td><td>B+</td></tr>
<tr><td>70–74%</td><td>3.0</td><td>B</td></tr>
<tr><td>65–69%</td><td>2.7</td><td>B−</td></tr>
<tr><td>60–64%</td><td>2.3</td><td>C+</td></tr>
<tr><td>55–59%</td><td>2.0</td><td>C</td></tr>
<tr><td>50–54%</td><td>1.7</td><td>C−</td></tr>
</tbody></table>
<p class="note">A widely-used approximation. Your university or a credential-evaluation service (e.g. WES) makes the official conversion, often grade-by-grade — always use their figure for applications.</p></div>
${toolDepthBlock("percentage-to-gpa-calculator")}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🎓 CGPA to percentage`, href: `/tools/cgpa-to-percentage-calculator/` },
  { label: `🏛️ Free College Predictor`, href: `/#/colleges` },
  { label: `🔄 English test score converter`, href: `/tools/english-test-score-converter/` },
  { label: `💰 Cost of studying abroad`, href: `/tools/cost-of-studying-abroad-calculator/` },
])}`;
  emit(path, head({ title: `Percentage to GPA Calculator — Indian % to US 4.0 GPA (2026) | ${BRAND}`, desc: `Free percentage-to-GPA calculator: estimate your US 4.0 GPA from an Indian percentage using the band method universities and WES use. Instant, honest, no signup.`, path, kw: "percentage to gpa calculator, percentage to gpa, indian percentage to us gpa, convert percentage to 4.0 gpa, gpa calculator for us universities, wes gpa calculator", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "Percentage to GPA Calculator", applicationCategory: "EducationApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "Percentage to GPA Calculator", path }]),
  ] }) + shell(inner));
}

// ── IELTS One Skill Retake decision tool + guide (self-contained page) ──────────
// Facts verified against ielts.org: retake ONE section, computer-delivered IELTS only,
// within 60 days, one retake per full test, new TRF, and NOT universally accepted.
function ieltsOsrPage() {
  const path = `/tools/ielts-one-skill-retake-calculator/`;
  const faqs = [
    { q: "What is IELTS One Skill Retake?", a: "IELTS One Skill Retake (OSR) lets you retake just one section of the IELTS — Listening, Reading, Writing or Speaking — instead of sitting the whole test again. You receive a new Test Report Form showing the improved skill alongside your other three original scores." },
    { q: "Who is eligible for IELTS One Skill Retake?", a: "You must have taken your full IELTS as a computer-delivered test at a centre that offers OSR, and you must sit the retake within 60 days of your original test. It is available on computer only, in selected centres and countries. You can retake only one skill, once, per full test." },
    { q: "How long do I have to book One Skill Retake?", a: "You must take your One Skill Retake within 60 days of your full IELTS test date — this deadline applies to both booking and completing the retake." },
    { q: "Is IELTS One Skill Retake accepted everywhere?", a: "No — not every university, employer or immigration authority accepts an OSR result. IELTS advises you to confirm directly with the organisation you are applying to before booking. Many visa/immigration routes still require a single full test sitting." },
    { q: "How much does One Skill Retake cost?", a: "It is cheaper than a full test — roughly a quarter of the full IELTS fee (about INR 12,650 in India at the time of writing). Fees change and vary by centre, so confirm the current amount with IDP or British Council." },
    { q: "Which skill should I retake?", a: "Retake the single skill where a realistic improvement lifts your overall band to your target. Use the calculator above: enter your four section scores and target, and it shows the score you'd need on each skill and which retake is most achievable." },
  ];
  const calc = `
<div class="card">
  <h2>🎯 Which one skill should you retake?</h2>
  <p class="note">Enter your four section scores and your target overall band. The tool shows the score you'd need on a retake of each skill — and which single retake actually reaches your target.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:10px 0">
    <label>Listening<input id="lp_l" type="number" inputmode="decimal" min="0" max="9" step="0.5" placeholder="e.g. 6.5" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Reading<input id="lp_r" type="number" inputmode="decimal" min="0" max="9" step="0.5" placeholder="e.g. 6.5" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Writing<input id="lp_w" type="number" inputmode="decimal" min="0" max="9" step="0.5" placeholder="e.g. 6.0" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Speaking<input id="lp_s" type="number" inputmode="decimal" min="0" max="9" step="0.5" placeholder="e.g. 7.0" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Target overall band<input id="lp_target" type="number" inputmode="decimal" min="0" max="9" step="0.5" placeholder="e.g. 7.0" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button id="lp_osr_btn" class="cta" type="button" style="border:0;cursor:pointer">Find the skill to retake →</button>
  <div id="lpOsrOut" style="margin-top:12px"></div>
</div>
<script>
(function(){
  function num(id){var e=document.getElementById(id);var v=parseFloat(e&&e.value);return isNaN(v)?NaN:v;}
  function overall(a){ return Math.round(((a[0]+a[1]+a[2]+a[3])/4)*2)/2; } // IELTS rounding
  function conv(){
    var out=document.getElementById('lpOsrOut');
    var s=[num('lp_l'),num('lp_r'),num('lp_w'),num('lp_s')], names=['Listening','Reading','Writing','Speaking'], target=num('lp_target');
    if(s.some(isNaN)||isNaN(target)){ out.innerHTML='<div class="callout"><span class="ic">⚠️</span><div>Enter all four section scores and your target band.</div></div>'; return; }
    var cur=overall(s);
    if(cur>=target){ out.innerHTML='<div class="callout tip"><span class="ic">✅</span><div><strong>You already meet your target.</strong> Your current overall band is '+cur+', which is at or above your target of '+target+'. No retake needed.</div></div>'; return; }
    var rows='', best=null;
    for(var i=0;i<4;i++){
      var need=null;
      for(var x=Math.max(0,s[i]+0.5); x<=9.0001; x+=0.5){
        var t=s.slice(); t[i]=Math.min(9,Math.round(x*2)/2);
        if(overall(t)>=target){ need=t[i]; break; }
      }
      var reachable = need!==null;
      var improve = reachable ? (need - s[i]) : null;
      if(reachable && (best===null || improve<best.improve)) best={i:i,need:need,improve:improve};
      rows+='<tr><td>'+names[i]+'</td><td>'+s[i]+'</td><td>'+(reachable?need:'—')+'</td><td>'+(reachable?('+'+improve.toFixed(1)):'not enough alone')+'</td></tr>';
    }
    var head='<div class="callout money"><span class="ic">📊</span><div><strong>Current overall: '+cur+' · Target: '+target+'</strong></div></div>';
    var rec;
    if(best){
      var hard = best.improve>1.5;
      rec='<div class="callout '+(hard?'':'tip')+'"><span class="ic">'+(hard?'🤔':'🎯')+'</span><div><strong>Best single retake: '+names[best.i]+'</strong> — you\\'d need <strong>'+best.need+'</strong> (a +'+best.improve.toFixed(1)+' improvement) to reach an overall '+target+'.'+(hard?' That\\'s a big jump for one sitting — make sure it\\'s realistic before booking.':' A realistic improvement — this is your best-value retake.')+'</div></div>';
    } else {
      rec='<div class="callout"><span class="ic">🚫</span><div><strong>One retake can\\'t reach '+target+'.</strong> Even a perfect score on a single skill wouldn\\'t lift your overall to your target — you\\'d need to improve more than one skill, so a full retake is the better option.</div></div>';
    }
    out.innerHTML=head+'<table style="width:100%;border-collapse:collapse;margin:10px 0" class="uni-table"><thead><tr><th>Skill</th><th>Your score</th><th>Need on retake</th><th>Improvement</th></tr></thead><tbody>'+rows+'</tbody></table>'+rec+'<p class="note" style="margin-top:8px">Overall band is the average of the four sections, rounded to the nearest half band. One Skill Retake replaces a single skill only — and not every institution accepts it, so confirm before booking.</p>';
  }
  var b=document.getElementById('lp_osr_btn');
  if(b) b.addEventListener('click',conv);
})();
</script>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › IELTS One Skill Retake Calculator</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">2026</span><span class="badge">No signup</span></div>
<h1>IELTS One Skill Retake Calculator &amp; Guide (2026)</h1>
<p class="lead">Should you retake one IELTS skill — and which one? Enter your scores to see the fastest way to your target band, plus everything One Skill Retake does and doesn't allow.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> IELTS One Skill Retake (OSR) lets you retake <strong>one</strong> section (Listening, Reading, Writing or Speaking) instead of the whole test, on <strong>computer-delivered IELTS only</strong>, <strong>within 60 days</strong> of your original test. You get a new Test Report Form — but <strong>not every institution accepts OSR, so confirm first</strong>.</div>
${calc}
<div class="card"><h2>How IELTS One Skill Retake works</h2><ul class="bcheck">
<li><strong>One skill only:</strong> retake Listening, Reading, Writing OR Speaking — just one, once, per full test.</li>
<li><strong>Computer-delivered only:</strong> your original test must have been IELTS on computer, at a centre that offers OSR (selected centres/countries).</li>
<li><strong>60-day window:</strong> you must sit the retake within 60 days of your full test — this covers both booking and taking it.</li>
<li><strong>New Test Report Form:</strong> you receive a fresh TRF with the improved skill plus your other three original scores.</li>
<li><strong>Cheaper than a full retake:</strong> roughly a quarter of the full fee (about INR 12,650 in India at the time of writing — confirm the current amount with your centre).</li>
</ul></div>
<div class="card"><h2>The catch: check acceptance first</h2>
<p>IELTS itself advises confirming that the organisation you're applying to accepts a One Skill Retake result <strong>before you book</strong>. Many universities do, but some — and several visa/immigration routes — still require a single full IELTS sitting. A quick email to the admissions or visa office saves you a wasted retake.</p></div>
<div class="card"><h2>How to book</h2><ol>
<li>Confirm your original test was <strong>computer-delivered</strong> and your centre offers One Skill Retake.</li>
<li>Check the receiving university/authority <strong>accepts OSR</strong>.</li>
<li>Use the calculator above to pick the <strong>single skill</strong> that reaches your target.</li>
<li>Book through <strong>IDP</strong> or <strong>British Council</strong> within <strong>60 days</strong> of your full test.</li>
</ol></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🎧 Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `📚 IELTS Smart Notes`, href: `/learn/ielts/` },
  { label: `🎯 IELTS band score calculator`, href: `/tools/ielts-band-score-calculator/` },
  { label: `🔄 English test score converter`, href: `/tools/english-test-score-converter/` },
])}`;
  emit(path, head({ title: `IELTS One Skill Retake Calculator &amp; Guide 2026 — Which Skill to Retake | ${BRAND}`, desc: `Free IELTS One Skill Retake tool: enter your scores to see which single skill to retake to hit your target band, plus the full OSR rules (computer-only, 60 days, acceptance).`, path, kw: "ielts one skill retake, ielts osr, ielts retake one skill, which ielts skill to retake, ielts one skill retake eligibility, ielts one skill retake calculator", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "IELTS One Skill Retake Calculator", applicationCategory: "EducationApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "IELTS One Skill Retake Calculator", path }]),
  ] }) + shell(inner));
}

// ── Proof-of-Funds Calculator — free tool built on the funding facts verified
// against official sources (link magnet; cross-linked from the funding data study). ──
function proofOfFundsCalculatorPage() {
  const path = `/tools/proof-of-funds-calculator/`;
  // Verified against the official authority linked per country (same sources as
  // the funding-facts data study). "Last verified" is stamped on the page.
  const POF = [
    { id: "germany", flag: "🇩🇪", name: "Germany", cur: "EUR", base: 11904, months: 12, tuition: false, src: "https://www.auswaertiges-amt.de/en/sperrkonto-388600", how: "Blocked account (Sperrkonto): EUR 11,904 for the year, released to you at about EUR 992/month after you arrive. Tuition at public universities is usually near-zero." },
    { id: "canada", flag: "🇨🇦", name: "Canada", cur: "CAD", base: 22895, months: 12, tuition: true, src: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html", how: "CAD 22,895 living-cost proof (commonly shown via a GIC, returned to you in instalments) PLUS your first-year tuition. The Student Direct Stream ended in Nov 2024 — everyone uses the regular stream now." },
    { id: "uk-london", flag: "🇬🇧", name: "UK — London", cur: "GBP", monthly: 1529, months: 9, tuition: true, src: "https://www.gov.uk/student-visa/money", how: "Maintenance of GBP 1,529/month for up to 9 months, held 28 consecutive days before you apply, PLUS your first-year tuition (or the unpaid balance)." },
    { id: "uk-other", flag: "🇬🇧", name: "UK — outside London", cur: "GBP", monthly: 1171, months: 9, tuition: true, src: "https://www.gov.uk/student-visa/money", how: "Maintenance of GBP 1,171/month for up to 9 months, held 28 consecutive days before you apply, PLUS your first-year tuition (or the unpaid balance)." },
    { id: "australia", flag: "🇦🇺", name: "Australia", cur: "AUD", base: 29710, months: 12, tuition: true, src: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", how: "AUD 29,710/year is the published living-cost benchmark; financial capacity is assessed case-by-case under the Genuine Student requirement. Add first-year tuition." },
    { id: "ireland", flag: "🇮🇪", name: "Ireland", cur: "EUR", base: 10000, months: 12, tuition: true, src: "https://www.irishimmigration.ie/coming-to-study-in-ireland/", how: "EUR 10,000 proof of funds shown to immigration (ISD), plus your first-year tuition." },
    { id: "usa", flag: "🇺🇸", name: "USA", cur: "USD", base: 0, months: 12, tuition: true, custom: true, src: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html", how: "No fixed figure — you prove the first-year cost of attendance shown on your Form I-20 (tuition + living, set by your university)." },
  ];
  const opts = POF.map((c) => `<option value="${c.id}">${c.flag} ${esc(c.name)}</option>`).join("");
  const refRows = POF.map((c) => `<tr><td>${c.flag} ${esc(c.name)}</td><td>${c.monthly ? `${c.cur} ${c.monthly.toLocaleString()}/mo × up to ${c.months}` : (c.base ? `${c.cur} ${c.base.toLocaleString()}` : "Cost of attendance")}${c.tuition ? " + tuition" : ""}</td><td><a href="${c.src}" target="_blank" rel="nofollow noopener">official ↗</a></td></tr>`).join("");
  const faqs = [
    { q: "How much money do I need to show for a student visa?", a: "It depends on the country. Germany needs about EUR 11,904 in a blocked account; Canada about CAD 22,895 plus first-year tuition; the UK GBP 1,171–1,529 per month for up to 9 months plus tuition; Australia around AUD 29,710 per year plus tuition; Ireland about EUR 10,000 plus tuition; the USA has no fixed figure — you prove your Form I-20 cost of attendance. Use the calculator above for your exact total, then confirm with the official authority." },
    { q: "Does proof of funds include tuition?", a: "Usually yes for most countries — you show living costs AND your first-year tuition (or the unpaid balance). Germany's blocked account is the main exception, since public-university tuition there is typically near-zero." },
    { q: "Is the German blocked account or Canadian GIC a fee?", a: "No — both are your own money held as proof of funds. A German Sperrkonto releases about EUR 992 to you each month after arrival; a Canadian GIC is returned to you in instalments over your first year." },
    { q: "How current are these figures?", a: `They are checked against each government's official page (linked in the table) and were last verified on ${LASTMOD}. Proof-of-funds amounts change every year — always confirm the current figure on the official authority's site before you transfer money.` },
  ];
  const calc = `
<div class="card">
  <h2>💷 How much proof of funds do you need?</h2>
  <p class="note">Pick your destination, add your first-year tuition where it applies, and get the total funds to show — in that country's currency.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:10px 0">
    <label>Destination<select id="pof_country" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px">${opts}</select></label>
    <label>First-year tuition <span id="pof_cur" style="color:var(--muted)"></span><input id="pof_tuition" type="number" inputmode="decimal" min="0" placeholder="e.g. 15000" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label id="pof_months_wrap">Months of maintenance (UK, max 9)<input id="pof_months" type="number" inputmode="decimal" min="1" max="9" value="9" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button id="pof_btn" class="cta" type="button" style="border:0;cursor:pointer">Calculate proof of funds →</button>
  <div id="pofOut" style="margin-top:12px"></div>
</div>
<script>
(function(){
  var DATA=${JSON.stringify(POF)};
  function byId(id){return document.getElementById(id);}
  function num(id){var v=parseFloat((byId(id)||{}).value);return isNaN(v)?0:Math.max(0,v);}
  function fmt(x){try{return Math.round(x).toLocaleString();}catch(e){return Math.round(x);}}
  function find(id){for(var i=0;i<DATA.length;i++){if(DATA[i].id===id)return DATA[i];}return DATA[0];}
  function sync(){
    var c=find((byId('pof_country')||{}).value);
    var cur=byId('pof_cur'); if(cur) cur.textContent='('+c.cur+')';
    var mw=byId('pof_months_wrap'); if(mw) mw.style.display=c.monthly?'block':'none';
  }
  function calc(){
    var c=find((byId('pof_country')||{}).value), tuition=num('pof_tuition');
    var living, livingLabel;
    if(c.monthly){var m=Math.min(9,Math.max(1,num('pof_months')||9));living=c.monthly*m;livingLabel=c.cur+' '+fmt(c.monthly)+'/mo × '+m+' months = '+c.cur+' '+fmt(living);}
    else if(c.base){living=c.base;livingLabel=c.cur+' '+fmt(c.base)+' living-cost proof';}
    else {living=0;livingLabel='cost of attendance (set by your university)';}
    var total=living+(c.tuition?tuition:0);
    var out=byId('pofOut'); if(!out) return;
    out.innerHTML='<div class="callout money"><span class="ic">💰</span><div>'
      +'<strong>Total proof of funds to show: '+c.cur+' '+fmt(total)+(c.custom&&!tuition?' + your Form I-20 amount':'')+'</strong><br>'
      +'Living / base: '+livingLabel+(c.tuition?('<br>First-year tuition: '+c.cur+' '+fmt(tuition)):'')+'<br>'
      +'<span style="color:var(--muted);font-size:13px">'+c.how+' Confirm the current figure on the <a href="'+c.src+'" target="_blank" rel="nofollow noopener">official page ↗</a> before you transfer money.</span></div></div>';
  }
  var sel=byId('pof_country'); if(sel){sel.addEventListener('change',function(){sync();calc();});}
  var b=byId('pof_btn'); if(b) b.addEventListener('click',calc);
  sync();
})();
</script>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › Proof of Funds Calculator</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">Official sources</span><span class="badge">No signup</span></div>
<h1>Student Visa Proof-of-Funds Calculator (2026)</h1>
<p class="lead">Work out exactly how much money you must show for a student visa — living costs plus tuition — for Germany, Canada, the UK, Australia, Ireland and the USA. Free, instant, and checked against official government sources.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Proof of funds = the country's living-cost requirement (Germany EUR 11,904; Canada CAD 22,895; UK GBP 1,171–1,529/month × up to 9; Australia AUD 29,710; Ireland EUR 10,000) plus your first-year tuition (except Germany, where public-university tuition is near-zero). Pick your country below for the exact total.</div>
${calc}
<div class="card"><h2>Proof-of-funds requirement by country (2026)</h2>
<table style="width:100%;border-collapse:collapse" class="uni-table"><thead><tr><th>Country</th><th>Living / base requirement</th><th>Source</th></tr></thead><tbody>${refRows}</tbody></table>
<p class="note"><strong>Last verified: ${esc(LASTMOD)}</strong> against each government's official page (linked above). Figures change yearly — confirm the current amount with the official authority before you apply or transfer money. For the full breakdown, see the <a href="/study-abroad-funding-facts-2026/">Study-Abroad Funding Facts 2026</a> data study.</p></div>
${faqBlock(faqs)}
${affiliateBlock(["wise", "bookmyforex"], "Moving that money abroad")}
${relatedGrid([
  { label: `📊 Funding facts 2026 (all countries)`, href: `/study-abroad-funding-facts-2026/` },
  { label: `🧮 Cost of studying abroad`, href: `/tools/cost-of-studying-abroad-calculator/` },
  { label: `🏦 Education loan EMI calculator`, href: `/tools/education-loan-emi-calculator/` },
  { label: `🇩🇪 Germany blocked account guide`, href: `/blog/germany-blocked-account-2026-guide/` },
  { label: `🇨🇦 Canada GIC guide`, href: `/blog/gic-account-canada-2026-guide/` },
])}`;
  emit(path, head({ title: `Proof-of-Funds Calculator 2026 — Student Visa Money by Country | ${BRAND}`, desc: `Free student-visa proof-of-funds calculator: living costs + tuition for Germany, Canada, UK, Australia, Ireland & USA, verified against official government sources. Instant, no signup.`, path, kw: "proof of funds calculator, student visa proof of funds, how much money for student visa, blocked account amount calculator, gic amount canada, uk maintenance funds calculator, student visa financial requirement by country", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "Student Visa Proof-of-Funds Calculator", applicationCategory: "FinanceApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path, publisher: PUBLISHER }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "Proof of Funds Calculator", path }]),
  ] }) + shell(inner));
}

// ── Education Loan EMI Calculator — a free, self-contained financial tool (link magnet) ──
function loanEmiPage() {
  const path = `/tools/education-loan-emi-calculator/`;
  const faqs = [
    { q: "How is education loan EMI calculated?", a: "EMI = P × r × (1+r)^n ÷ ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12 ÷ 100) and n is the number of monthly instalments (years × 12). The calculator above does this instantly." },
    { q: "Do I pay EMI while studying?", a: "Most education loans have a moratorium (grace period) covering your course plus 6–12 months. During it you usually pay only simple interest, or nothing (interest is added to the principal). Full EMIs start after the moratorium — paying the interest during study reduces your total cost a lot." },
    { q: "What interest rate do education loans charge?", a: "In India, secured education loans (with collateral) are typically ~8.5–11% p.a. and unsecured / no-collateral loans ~11–15% p.a. The rate depends on the lender, collateral, your course and the university. Always compare the effective rate, processing fee and prepayment terms — not just the headline rate." },
    { q: "Can I prepay an education loan?", a: "Yes — most education loans allow part- or full prepayment, usually with no penalty on floating-rate loans. Because interest is front-loaded, prepaying early cuts the total interest substantially. Use the calculator to compare different tenures." },
  ];
  const calc = `
<div class="card">
  <h2>🧮 Estimate your monthly EMI</h2>
  <p class="note">Enter your loan amount, interest rate and tenure. Works in any currency.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:10px 0">
    <label>Loan amount<input id="lp_amt" type="number" inputmode="decimal" min="0" placeholder="e.g. 2000000" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Interest rate (% per year)<input id="lp_rate" type="number" inputmode="decimal" min="0" step="0.1" placeholder="e.g. 11" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Tenure (years)<input id="lp_tenure" type="number" inputmode="decimal" min="0.5" step="0.5" value="7" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button id="lp_emi_btn" class="cta" type="button" style="border:0;cursor:pointer">Calculate EMI →</button>
  <div id="lpEmiOut" style="margin-top:12px"></div>
</div>
<script>
(function(){
  function num(id){var v=parseFloat((document.getElementById(id)||{}).value);return isNaN(v)?0:Math.max(0,v);}
  function fmt(x){try{return Math.round(x).toLocaleString();}catch(e){return Math.round(x);}}
  function calc(){
    var P=num('lp_amt'), rate=num('lp_rate'), years=num('lp_tenure')||1;
    var n=Math.round(years*12); var r=rate/12/100;
    var out=document.getElementById('lpEmiOut');
    if(!P||!n){ if(out) out.innerHTML='<div class="callout tip"><span class="ic">💡</span><div>Enter a loan amount and tenure to see your EMI.</div></div>'; return; }
    var emi = r>0 ? P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1) : P/n;
    var total = emi*n; var interest = total - P;
    if(out) out.innerHTML='<div class="callout money"><span class="ic">💰</span><div><strong>Monthly EMI:</strong> '+fmt(emi)+'<br><strong>Total interest:</strong> '+fmt(interest)+'<br><strong>Total payable:</strong> '+fmt(total)+' over '+n+' months<br><span style="color:var(--muted);font-size:13px">An estimate in the currency you entered, assuming EMIs start immediately. A moratorium during study changes the figures — confirm with your lender.</span></div></div>';
  }
  var b=document.getElementById('lp_emi_btn');
  if(b) b.addEventListener('click',calc);
})();
</script>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › Education Loan EMI Calculator</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">Instant</span><span class="badge">No signup</span></div>
<h1>Education Loan EMI Calculator (2026)</h1>
<p class="lead">Work out your monthly EMI, total interest and total repayment on a study-abroad education loan — instantly and free.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ − 1), where P = loan amount, r = monthly rate (annual ÷ 12 ÷ 100), n = months (years × 12). Indian secured education loans run ~8.5–11% p.a.; no-collateral loans ~11–15%. Enter your numbers below.</div>
${calc}
<div class="card"><h2>What affects your education-loan EMI</h2><ul class="bcheck">
<li><strong>Loan amount</strong> — a bigger principal means a bigger EMI. Borrow only what you need after scholarships and savings.</li>
<li><strong>Interest rate</strong> — secured (collateral) loans are cheaper than unsecured ones. Even 1–2% lower saves lakhs over the tenure.</li>
<li><strong>Tenure</strong> — a longer tenure lowers the EMI but raises total interest; a shorter tenure does the opposite.</li>
<li><strong>Moratorium</strong> — most loans don't charge full EMIs during your course + 6–12 months. Paying the simple interest during study cuts the total a lot.</li>
<li><strong>Prepayment</strong> — floating-rate loans usually allow penalty-free prepayment; paying early saves the most interest.</li>
</ul></div>
${toolDepthBlock("education-loan-emi-calculator")}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🏦 Education loan without collateral`, href: `/blog/education-loan-without-collateral/` },
  { label: `📊 Study-abroad funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
  { label: `💸 Scholarships by country`, href: `/fully-funded-scholarships/` },
  { label: `🧮 Cost of studying abroad calculator`, href: `/tools/cost-of-studying-abroad-calculator/` },
  { label: `🏛️ Free College Predictor`, href: `/#/colleges` },
])}`;
  emit(path, head({ title: `Education Loan EMI Calculator 2026 — Free Study-Abroad Loan EMI | ${BRAND}`, desc: `Free education loan EMI calculator: enter your loan amount, interest rate and tenure to see your monthly EMI, total interest and total repayment for a study-abroad loan.`, path, kw: "education loan emi calculator, study abroad loan emi calculator, student loan emi calculator, education loan monthly payment, abroad education loan calculator", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "Education Loan EMI Calculator", applicationCategory: "FinanceApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "Education Loan EMI Calculator", path }]),
  ] }) + shell(inner));
}

// ── "Am I ready?" study-abroad application readiness checker — free interactive tool ──
function readinessPage() {
  const path = `/tools/study-abroad-readiness-checker/`;
  const items = [
    ["English test score achieved (IELTS / TOEFL / PTE)", 20, "/eligibility/", "Check the score you need"],
    ["Target universities shortlisted", 15, "/#/colleges", "Use the free College Predictor"],
    ["Proof of funds or education loan arranged", 20, "/tools/education-loan-emi-calculator/", "Plan your loan EMI"],
    ["Statement of Purpose (SOP) drafted", 15, "/sop-samples/", "See free SOP samples"],
    ["Letters of Recommendation (LORs) arranged", 10, "/sop-samples/", "See LOR samples"],
    ["Transcripts & academic documents ready", 10, "/visa-interview/", "Documents & visa prep"],
    ["Valid passport (6+ months) & visa plan", 10, "/visa-interview/", "Visa interview prep"],
  ];
  const rows = items.map((it, i) => `<label class="rd-item" style="display:flex;gap:10px;align-items:flex-start;padding:11px 0;border-bottom:1px solid var(--line)"><input type="checkbox" class="rd-cb" data-w="${it[1]}" data-label="${esc(it[0])}" data-link="${it[2]}" data-cta="${esc(it[3])}" style="margin-top:3px;width:18px;height:18px;flex-shrink:0"/><span><strong>${esc(it[0])}</strong> <span style="color:var(--muted);font-size:13px">(${it[1]}%)</span></span></label>`).join("");
  const tool = `
<div class="card">
  <h2>✅ Tick what you've done</h2>
  <div id="lpRd">${rows}</div>
  <div id="lpRdOut" style="margin-top:16px"></div>
</div>
<script>
(function(){
  var cbs=[].slice.call(document.querySelectorAll('.rd-cb'));
  function render(){
    var pct=0, gaps=[];
    cbs.forEach(function(cb){ if(cb.checked){ pct+=parseFloat(cb.getAttribute('data-w'))||0; } else { gaps.push(cb); } });
    pct=Math.round(pct);
    var col = pct>=80?'#16a34a':pct>=50?'#f59e0b':'#ef4444';
    var msg = pct>=80?'You\\'re application-ready — finish the last items and apply!':pct>=50?'Good progress — close these gaps to be ready.':'Early days — here\\'s your roadmap.';
    var bar='<div style="height:14px;border-radius:999px;background:var(--line);overflow:hidden;margin:6px 0 12px"><div style="width:'+pct+'%;height:100%;background:'+col+';border-radius:999px;transition:width .3s"></div></div>';
    var next = gaps.length? '<strong>Your next steps:</strong><ul style="margin:8px 0 0;padding-left:18px">'+gaps.map(function(cb){return '<li style="margin:5px 0">'+cb.getAttribute('data-label')+' — <a href="'+cb.getAttribute('data-link')+'">'+cb.getAttribute('data-cta')+' →</a></li>';}).join('')+'</ul>' : '<p style="margin:8px 0 0;color:#16a34a;font-weight:600">🎉 Everything checked — you\\'re ready to apply. Good luck!</p>';
    document.getElementById('lpRdOut').innerHTML='<div style="font-size:34px;font-weight:800;color:'+col+'">'+pct+'% ready</div><p style="margin:2px 0 0;color:var(--muted)">'+msg+'</p>'+bar+next;
  }
  cbs.forEach(function(cb){ cb.addEventListener('change',render); });
  render();
})();
</script>`;
  const faqs = [
    { q: "How do I know if I'm ready to apply to study abroad?", a: "You're ready when you have: your English test score, a shortlist of universities, proof of funds or an education loan, a drafted SOP and LORs, your academic documents, and a valid passport. The checker above scores your readiness and lists exactly what's left." },
    { q: "What documents do I need to study abroad?", a: "Typically: passport, academic transcripts & certificates, English-test scorecard, a Statement of Purpose, 1–3 Letters of Recommendation, proof of funds (bank statements / loan sanction), and the university offer letter for your visa. Requirements vary by country and university." },
    { q: "When should I start preparing?", a: "Begin 12–18 months before your intake: take the English test early, shortlist universities, arrange funds, then draft your SOP and gather documents. Applying early gives the best shot at admission and scholarships." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › Study-Abroad Readiness Checker</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">Instant</span><span class="badge">No signup</span></div>
<h1>Study-Abroad Readiness Checker (2026)</h1>
<p class="lead">Find out how ready you are to apply abroad — get a readiness score and a personalised checklist of exactly what's left, free.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> You're ready to apply when you have your English-test score, a university shortlist, proof of funds (or a loan), an SOP, LORs, academic documents and a valid passport. Tick what you've done below to see your readiness score and next steps.</div>
${tool}
${toolDepthBlock("study-abroad-readiness-checker")}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🌍 Score requirements by country`, href: `/eligibility/` },
  { label: `🏛️ Free College Predictor`, href: `/#/colleges` },
  { label: `🧮 Education loan EMI calculator`, href: `/tools/education-loan-emi-calculator/` },
  { label: `📝 Free SOP & LOR samples`, href: `/sop-samples/` },
])}`;
  emit(path, head({ title: `Study Abroad Readiness Checker 2026 — Am I Ready to Apply? | ${BRAND}`, desc: `Free study-abroad readiness checker: tick what you've done — English test, funds, SOP, documents — and get a readiness score plus a personalised checklist of what's left.`, path, kw: "study abroad readiness checker, am i ready to study abroad, study abroad application checklist, study abroad eligibility checker, what do i need to study abroad", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "Study-Abroad Readiness Checker", applicationCategory: "EducationalApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "Study-Abroad Readiness Checker", path }]),
  ] }) + shell(inner));
}

// ── Intake & deadline pages per country (high-intent, from real college data) ───
const INTAKE_NOTES = {
  USA: { slug: "usa", main: "Fall (August–September)", others: "Spring (January) and a limited Summer (May–June) intake", note: "Fall is by far the largest intake in the United States — the widest choice of programmes, funding and assistantships. Spring is a smaller second intake; Summer is rare for degree programmes." },
  UK: { slug: "uk", main: "September/October", others: "a smaller January intake at many universities", note: "Most UK degrees start in September or October. A growing number of universities also offer a January intake, useful if you miss the autumn deadline." },
  Canada: { slug: "canada", main: "Fall (September)", others: "Winter (January) and a smaller Spring/Summer (May) intake", note: "Fall is the primary Canadian intake with the most programmes and funding. Winter (January) is a solid second option; Spring/Summer is limited. Note: the Student Direct Stream closed in November 2024, so apply through the regular study-permit stream and start early." },
  Australia: { slug: "australia", main: "Semester 1 (February–March)", others: "Semester 2 (July), and some institutions offer additional intakes", note: "Australia's academic year starts in February, so Semester 1 (Feb–Mar) is the main intake; Semester 2 (July) is the strong second intake." },
  Germany: { slug: "germany", main: "Winter semester (October)", others: "Summer semester (April)", note: "German universities run two semesters: the Winter semester (starting October) is the main intake with the most programmes; the Summer semester (starting April) has fewer options. Application deadlines fall months earlier (often mid-July for Winter)." },
  Ireland: { slug: "ireland", main: "September", others: "a smaller January intake for some programmes", note: "Most Irish university programmes begin in September; some offer a January start." },
  "New Zealand": { slug: "new-zealand", main: "Semester 1 (February–March)", others: "Semester 2 (July)", note: "Like Australia, New Zealand's year starts in February, so Semester 1 is the main intake and Semester 2 (July) is the second." },
  Singapore: { slug: "singapore", main: "August", others: "a January intake at some universities", note: "Singapore's main university intake is in August, with a smaller January intake for some programmes." },
  Netherlands: { slug: "netherlands", main: "September", others: "a February intake for some programmes", note: "Most Dutch programmes start in September; some also offer a February intake. Deadlines for international students can be early (often 1 May), so check well ahead." },
};
function intakeDeadlinePage(country, list) {
  const info = INTAKE_NOTES[country]; if (!info) return;
  const path = `/intakes/${info.slug}/`;
  const ranked = list.slice().sort((a, b) => (a.rank || 9999) - (b.rank || 9999)).slice(0, 22);
  const rows = ranked.map((c) => `<tr><td><a href="/university/${c.id}/">${esc(c.name)}</a></td><td>${esc((c.intakes || []).join(", "))}</td><td>${esc(c.deadline || "Varies")}</td></tr>`).join("");
  const title = `${country} University Intakes & Application Deadlines 2026`;
  const desc = `${country} university intakes and application deadlines for 2026 — main intake ${info.main}. Deadlines for ${ranked.length} top universities, plus an application timeline. Free.`;
  const faqs = [
    { q: `What is the main intake in ${country}?`, a: `The main intake in ${country} is ${info.main}, with ${info.others}. ${info.note}` },
    { q: `When should I apply for a ${country} university?`, a: `Start 12–18 months before your intake: take your English/admission tests early, then apply roughly 6–12 months ahead. Top universities and scholarships close first, so earlier is always safer.` },
    { q: `Are these ${country} deadlines exact?`, a: `They're indicative typical deadlines and vary by university and programme — always confirm the exact date on each university's official admissions page before applying.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/intakes/">Intakes &amp; Deadlines</a> › ${esc(country)}</p>
<section class="hero"><div class="badges"><span class="badge">${esc(country)}</span><span class="badge">2026 intakes</span><span class="badge">${ranked.length} universities</span></div>
<h1>${esc(country)} University Intakes &amp; Application Deadlines (2026)</h1>
<p class="lead">When to apply to study in ${esc(country)} — the intake seasons, a clear application timeline, and typical deadlines for top universities. Free.</p>
<a class="cta" href="/#/colleges">▶ Find your universities (free predictor)</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> The main intake in ${esc(country)} is <strong>${esc(info.main)}</strong>, with ${esc(info.others)}. Apply roughly 6–12 months before your intake — the best programmes and scholarships close first. Always confirm exact deadlines on each university's official page.</div>
<div class="card"><h2>Intake seasons in ${esc(country)}</h2><p>${esc(info.note)}</p></div>
<div class="card"><h2>Application timeline — work backwards from your intake</h2><ol class="bsteps">
<li><strong>12–18 months before:</strong> shortlist universities and take a free <a href="/mock-test/ielts/">IELTS</a> / <a href="/mock-test/pte/">PTE</a> / <a href="/mock-test/toefl/">TOEFL</a> mock to find your gap, then book the real test.</li>
<li><strong>8–12 months before:</strong> prepare your <a href="/sop-samples/">SOP and recommendation letters</a>, finalise your test scores, and submit applications — apply early for scholarships.</li>
<li><strong>3–6 months before:</strong> accept your offer, arrange proof of funds, and apply for your student visa (prepare for the <a href="/visa-interview/">visa interview</a>).</li>
<li><strong>1–3 months before:</strong> book travel and accommodation, and complete pre-departure steps.</li>
</ol></div>
<div class="card"><h2>Intakes &amp; typical deadlines — top ${esc(country)} universities</h2>
<table style="width:100%;border-collapse:collapse" class="uni-table"><thead><tr><th>University</th><th>Intakes</th><th>Typical deadline</th></tr></thead><tbody>${rows}</tbody></table>
<p class="note">Indicative for 2026 — deadlines vary by programme and change yearly. Always confirm on each university's official admissions page.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🏛️ Top universities in ${country}`, href: `/study-abroad/top-universities-in-${info.slug}/` },
  { label: `🌍 Score requirements by country`, href: `/eligibility/` },
  { label: `📝 SOP samples & builder`, href: `/sop-samples/` },
  { label: `🛂 ${country} visa interview`, href: `/visa-interview/` },
  { label: `📅 All intakes & deadlines`, href: `/intakes/` },
])}`;
  emit(path, head({ title: `${title} | ${BRAND}`, desc, path, kw: `${country.toLowerCase()} intake 2026, ${country.toLowerCase()} university application deadline, fall intake ${country.toLowerCase()}, ${country.toLowerCase()} university intakes, when to apply ${country.toLowerCase()} university`, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Intakes & Deadlines", path: "/intakes/" }, { name: country, path }]),
  ] }) + shell(inner), { thin: true });   // conservative prune (2026-08-15): 9 country intake pages, 490-word median, one template with the country swapped; none in KEEP_INDEXED. noindex,follow — equity still flows to the /intakes/ hub, which stays indexed.
}
function intakeDeadlineIndex(byCountry) {
  const path = `/intakes/`;
  const intakeCountries = Object.keys(INTAKE_NOTES).filter((c) => byCountry[c] && byCountry[c].length);
  const cards = intakeCountries.map((c) => `<div class="card"><h2><a href="/intakes/${INTAKE_NOTES[c].slug}/">${esc(c)} — main intake: ${esc(INTAKE_NOTES[c].main)}</a></h2><p>Intake seasons, application timeline and typical deadlines for top universities in ${esc(c)}.</p><a class="tile" href="/intakes/${INTAKE_NOTES[c].slug}/">See ${esc(c)} deadlines →</a></div>`).join("");
  const faqs = [
    { q: "What is an intake when studying abroad?", a: "An intake is the term in which a university starts new students. Most countries have a main intake (the one with the most programmes and funding) and one or two smaller secondary intakes. Picking the main intake usually gives you the widest choice." },
    { q: "How early should I apply?", a: "Start 12–18 months before your intake and apply roughly 6–12 months ahead. Top universities and scholarships fill first, so applying early materially improves your chances." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › Intakes &amp; Deadlines</p>
<section class="hero"><div class="badges"><span class="badge">100% free</span><span class="badge">${intakeCountries.length} countries</span><span class="badge">2026</span></div>
<h1>University Intakes &amp; Application Deadlines by Country (2026)</h1>
<p class="lead">When to apply to study abroad — the main and secondary intakes, application timelines and typical university deadlines for every major destination. Free.</p>
<a class="cta" href="/#/colleges">▶ Find your universities (free predictor)</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Intakes differ by country — the US and UK start in autumn (Aug–Oct), Germany's main intake is October, while Australia and New Zealand start in February. Whatever your destination, apply 6–12 months ahead; the main intake always has the most programmes and scholarships. Pick a country below for its exact timeline.</div>
${cards}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🏛️ Free College Predictor`, href: `/#/colleges` },
  { label: `🌍 Score requirements by country`, href: `/eligibility/` },
  { label: `📝 SOP samples & builder`, href: `/sop-samples/` },
  { label: `🛂 Visa interview questions`, href: `/visa-interview/` },
])}`;
  emit(path, head({ title: `University Intakes & Application Deadlines by Country (2026) | ${BRAND}`, desc: `When to apply to study abroad — main and secondary intakes, application timelines and typical university deadlines for the USA, UK, Canada, Australia, Germany and more. Free.`, path, kw: "university intakes by country, study abroad application deadlines 2026, fall intake, spring intake, when to apply university abroad", jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Intakes & Deadlines", path }]),
  ] }) + shell(inner));
}

// The exam×university variants that KEEP_INDEXED vouches for, grouped by university id and
// excluding "ielts" (the grid already links that one explicitly). Derived from KEEP_INDEXED
// rather than hardcoded so the two can never drift apart.
const PROVEN_EXAM_PAGES = (() => {
  const m = {};
  for (const p of KEEP_INDEXED) {
    const mm = p.match(/^\/(pte|toefl)-for-([a-z0-9-]+)\/$/);
    if (!mm) continue;
    (m[mm[2]] = m[mm[2]] || []).push(mm[1]);
  }
  return m;
})();

// ── Per-university pages (long-tail SEO, auto-generated from college-data) ──
/*__UNIDEPTH_MOVE__*/
/**
 * Data-backed blocks for specific blog posts whose title promises something the prose does
 * not deliver — surfaced by tools/audit-title-promises.mjs.
 *
 * The rule for these is that the numbers come from COLLEGES, never from memory. A post
 * titled "What's a Good GRE Score for Top Universities?" needs named universities with real
 * GRE positions; writing plausible cutoffs down by hand is the failure that corrupted 210
 * content files earlier in this session. Rendering from the dataset also means the page stays
 * correct when the dataset is corrected, instead of quietly drifting away from it.
 */
function blogDataBlock(a) {
  if (!a || a.id !== "good-gre-score-for-top-universities") return "";
  const ranked = COLLEGES
    .filter((c) => c && c.gre && typeof c.rank === "number" && c.rank < 1000)
    .sort((x, y) => x.rank - y.rank);
  if (ranked.length < 5) return "";
  const top = ranked.slice(0, 12);
  const requires = ranked.filter((c) => !/optional|not required|waiv/i.test(String(c.gre)));
  const optional = ranked.length - requires.length;
  const rows = top.map((c) => `<tr><td><a href="/university/${c.id}/">${esc(c.name)}</a></td><td>#${c.rank}</td><td>${esc(String(c.country))}</td><td>${esc(String(c.gre))}</td></tr>`).join("");
  return `<div class="card"><h2>What the top-ranked universities actually say about the GRE</h2>
<p>The figures above are percentiles, which tell you where you sit against other test-takers but not what any particular university wants. Below are the ${top.length} highest-ranked universities in our dataset that publish a GRE position, so you can see the pattern rather than a generic "top-10" claim.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>University</th><th>QS rank</th><th>Country</th><th>GRE</th></tr></thead><tbody>${rows}</tbody></table></div>
<p>Across the ${ranked.length} ranked universities we hold GRE data for, <strong>${optional}</strong> list it as optional or waived and <strong>${requires.length}</strong> still expect or accept it. That split is the single most useful fact on this page, and it is the one most guides skip: since the pandemic-era waivers, "what GRE score do I need" is frequently the wrong question, and "does this programme want a GRE at all" is the right one. Check that first — it can save you the test fee entirely.</p>
<p><strong>Where a score still matters even when it is optional.</strong> Optional does not mean ignored. Where a programme is oversubscribed, a strong quant score is one of the few directly comparable signals across applicants from different countries and grading systems, and it can offset a transcript an admissions committee cannot easily read. The reverse is also true: submitting a weak optional score puts a number on a page that would otherwise not have been there. If it is optional and your score is below the programme's published median, not submitting is usually the stronger move.</p>
<p><strong>Read the programme page, not the university page.</strong> GRE policy is set per department and often per intake. Within a single university, one department may require it, another may waive it, and a third may require it only for applicants from certain backgrounds. The institution-level position in the table above is a starting point for your shortlist, not the answer for your application.</p>
<p class="note">GRE positions here are compiled for comparison and change between admission cycles. Confirm on each programme's own admissions page before deciding whether to sit the test.</p></div>`;
}

/**
 * Per-university depth for /university/<id>/.
 *
 * These 167 pages sat in a 717-954 word band — the tightest on the site, which is
 * what a template looks like from the outside. Every number needed to say something
 * genuinely specific was already loaded; it was just never compared against anything.
 *
 * This positions each university against its own national peer set from COLLEGES:
 * where its selectivity, price and English bar actually sit. A student cannot get
 * that from the university's own page, which is the point — it is the one thing this
 * site can say that the official source structurally cannot.
 */
function uniDepthBlock(c, ci) {
  const peers = COLLEGES.filter((x) => x.country === c.country && x.id !== c.id);
  if (peers.length < 3) return "";
  const nums = (arr, k) => arr.map((x) => (typeof x[k] === "number" && isFinite(x[k]) ? x[k] : null)).filter((v) => v !== null);
  const med = (a) => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const pAcc = nums(peers, "acceptance"), pRank = nums(peers, "rank").filter((r) => r < 1000);
  const pIelts = peers.map((x) => parseFloat(x.ielts)).filter((v) => isFinite(v));
  const myAcc = typeof c.acceptance === "number" ? c.acceptance : null;
  const myRank = typeof c.rank === "number" && c.rank < 1000 ? c.rank : null;
  const myIelts = parseFloat(c.ielts);
  const medAcc = med(pAcc), medRank = med(pRank), medIelts = med(pIelts);

  const bits = [];
  if (myAcc !== null && medAcc !== null) {
    const tighter = pAcc.filter((v) => v < myAcc).length;
    bits.push(`<li><strong>Selectivity.</strong> An indicative acceptance rate of about ${myAcc}% against a median of ${medAcc}% across the ${peers.length} other ${esc(c.country)} universities in our dataset. ${tighter} of them are harder to get into than ${esc(c.name)}. ${myAcc <= medAcc ? "It sits on the more selective side of its national peer group, so meeting the published minimums is the floor rather than the goal." : "It sits on the more accessible side of its national peer group, which usually means a complete, early, well-matched application matters more than an exceptional one."}</li>`);
  }
  if (myRank !== null && medRank !== null) {
    const above = pRank.filter((v) => v < myRank).length;
    bits.push(`<li><strong>Rank in context.</strong> QS #${myRank}, against a peer median of #${medRank}; ${above} ${esc(c.country)} ${above === 1 ? "university ranks" : "universities rank"} above it here. Rank is worth exactly this much and no more — it is driven by institution-wide research output and reputation surveys, not by the department you would actually join, so treat it as a coarse filter and judge the programme on its own page.</li>`);
  }
  if (isFinite(myIelts) && medIelts !== null) {
    bits.push(`<li><strong>English bar.</strong> IELTS ${c.ielts} against a peer median of ${medIelts}. ${myIelts > medIelts ? "That is above the national norm, so the English test is a live risk on this application rather than a formality — clear it before you spend money on the rest." : myIelts < medIelts ? "That is below the national norm, which makes it a low-risk gate here, but the same score may not clear the universities you are applying to alongside it. Prepare to the highest bar on your list, not this one." : "That is exactly the national norm, so a score built for this application should travel across your whole shortlist."}${c.toefl ? ` Equivalents: TOEFL ${esc(String(c.toefl))}${c.pte ? `, PTE ${esc(String(c.pte))}` : ""}.` : ""}</li>`);
  }
  if (!bits.length) return "";

  const progs = Array.isArray(c.programs) ? c.programs.filter(Boolean) : [];
  return `<div class="card"><h2>How ${esc(c.name)} compares in ${esc(c.country)}</h2>
<p>The figures on this page mean little on their own. Set against the ${peers.length} other ${esc(c.country)} universities in our dataset, they say something more useful about where an application to ${esc(c.name)} is likely to be won or lost.</p>
<ul class="bcheck">${bits.join("")}</ul>
${progs.length ? `<p><strong>Programme areas:</strong> ${progs.slice(0, 12).map((p) => esc(String(p))).join(" · ")}. Entry requirements are set per programme, not per university, so the figures above are the institutional baseline — a competitive department inside an accessible university can run far tighter than the headline rate suggests.</p>` : ""}
<p>Practical order of work for ${esc(c.name)}: clear the English requirement first, because it gates everything and is the only part of the application you fully control; then confirm which of the ${esc((c.intakes || []).join(" and ") || "published intakes")} intakes you are targeting, since ${c.deadline ? `the typical deadline is ${esc(String(c.deadline))} and ` : ""}funding decisions usually close before admission decisions; then build the application around one specific programme rather than the institution. ${c.appFee ? `Budget the application fee of ${esc(String(c.appFee))} per programme` : "Budget application fees per programme"}${ci && ci.living ? `, and living costs of ${esc(String(ci.living))} on top of tuition of ${esc(String(c.feeNote || "the published rate"))}` : ""}.</p>
<p class="note">Figures here are indicative and compiled for comparison. Acceptance rates in particular are institution-level estimates and move year to year — confirm anything you are deciding on against ${c.website ? `<a href="${esc(c.website)}" rel="nofollow noopener" target="_blank">the university's official pages</a>` : "the university's official pages"}.</p></div>`;
}

function universityPage(c) {
  const ci = C_INFO[c.country] || {};
  const proc = C_PROC[c.country] || [];
  const path = `/university/${c.id}/`;
  // Explicit abbreviations ONLY — not shortUni(), whose generic rules would rewrite 88 of
  // 110 titles and make several worse ("New York University" -> "New York"). The map exists
  // precisely for names the 60-char clamp cannot shorten safely on its own.
  const titleName = UNI_ABBR[c.name] || c.name;
  const title = `${titleName} — Fees, IELTS/GRE Requirements & Admission 2026 | ${BRAND}`;
  const ranked = typeof c.rank === "number" && c.rank < 1000;
  const desc = `${c.name} (${c.city}, ${c.country}${ranked ? ", QS #" + c.rank : ""}): tuition ${c.feeNote}, IELTS ${c.ielts}, GRE ${c.gre}, ${c.acceptance}% acceptance. Programs, scholarships, intakes & admission process — free.`;
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
  const site = (c.website || "").replace(/^https?:\/\//, "");
  const isCollege = /college/i.test(c.type || "");
  const compete = c.acceptance <= 40 ? "competitive" : c.acceptance <= 70 ? "moderately selective" : "accessible";
  const stat = (label, val) => `<div class="uni-stat"><div class="uni-stat-v">${val}</div><div class="uni-stat-l">${label}</div></div>`;
  // Admission tips tailored by selectivity + universal best-practice (genuine guidance, no false promises).
  const tips = [
    c.acceptance <= 40
      ? `<strong>Beat the bar.</strong> With about ${c.acceptance}% acceptance, aim <em>above</em> the minimums — target IELTS ${(Number(c.ielts) + 0.5) || c.ielts}+ and a strong GPA, and lead with research, projects or publications.`
      : c.acceptance <= 70
      ? `<strong>Clear the requirements comfortably.</strong> Meet IELTS ${c.ielts}+ and the GPA cleanly, then differentiate with a focused SOP and 1–2 strong recommendation letters.`
      : `<strong>Apply early.</strong> With around ${c.acceptance}% acceptance, the main risk is late or incomplete applications — submit early for the best shot at scholarships and housing.`,
    `<strong>Write a tailored SOP.</strong> Name the exact ${isCollege ? "program" : "program and 1–2 professors/labs"} at ${c.name} and connect your background to them — generic essays are the #1 reason strong profiles get rejected.`,
    `<strong>Hit the English score first.</strong> ${c.name} needs IELTS ${c.ielts} / TOEFL ${c.toefl} / PTE ${c.pte}. Take a free full-length mock to find your weakest section before you book the real test.`,
    `<strong>Prepare finances early.</strong> Budget for tuition (${c.feeNote}) plus living costs${ci.living ? ` (${ci.living})` : ""}; visa officers want clear, stable proof of funds.`,
    `<strong>Apply in the right intake.</strong> ${c.name}'s main intakes are ${c.intakes.join(" & ")} — applying 4–6 months ahead keeps scholarships and on-campus housing open.`,
  ];
  const faqs2 = faqs.concat([
    { q: `Is ${c.name} hard to get into?`, a: `${c.name} is ${compete}, with an indicative acceptance rate of about ${c.acceptance}%. ${c.acceptance <= 40 ? "Aim above the minimum scores and build a standout profile." : "A complete application that clearly meets the requirements has a strong chance."}` },
    { q: `Does ${c.name} require GRE or GMAT?`, a: `GRE: ${c.gre}. GMAT (for MBA): ${c.gmat || "Not required"}. Always confirm the exact policy for your specific program on the official site.` },
    { q: `Can I work after studying at ${c.name}?`, a: `${ci.psw || "Post-study work rights depend on the country and visa"} (${c.country}). You can typically also work part-time while studying${ci.work ? `: ${ci.work}` : ""}.` },
    { q: `What documents do I need to apply to ${c.name}?`, a: `Typically: ${(ci.checklist || ["transcripts", "English test score", "SOP", "letters of recommendation", "passport", "proof of funds"]).join(", ")}. Check program-specific requirements before applying.` },
  ]);
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Colleges</a> › <a href="/study-abroad/top-universities-in-${(c.country || "").toLowerCase().replace(/\s+/g, "-")}/">${esc(c.country)}</a> › ${esc(c.name)}</p>
<section class="uni-banner" style="background:linear-gradient(120deg,hsl(${hue} 55% 32%),hsl(${(hue + 40) % 360} 60% 24%))">
  <div class="uni-logo">${inits}</div>
  <div class="uni-banner-info">
    <div class="uni-flag">${FLAG[c.country] || "🎓"} ${c.country} · ${esc(c.type)}</div>
    <h1>${esc(c.name)}</h1>
    <div class="uni-addr">📍 ${esc(c.city)}, ${esc(c.country)}${ranked ? ` · QS World Rank #${c.rank}` : ""}${ranked && c.natRank && c.natRank !== "N/A" ? ` · #${c.natRank} nationally` : ""}${site ? ` · <a href="https://${site}" target="_blank" rel="noopener">${site}</a>` : ""}</div>
  </div>
</section>
<section class="uni-stats">
  ${stat("Acceptance rate", c.acceptance + "%")}
  ${stat("Tuition / yr", typeof c.tuitionUSD === "number" ? "~$" + Math.round(c.tuitionUSD / 1000) + "k" : c.feeNote)}
  ${stat("IELTS required", c.ielts)}
  ${stat("Intl students", (c.intlPct || "—") + "%")}
  ${stat("Founded", c.founded)}
  ${ranked ? stat("QS World rank", "#" + c.rank) : stat("Type", isCollege ? "College" : "University")}
</section>
<section class="hero" style="padding-top:8px">
  <p class="lead">${c.highlight ? esc(c.highlight).replace(/[\s.;]*$/, "") + ". " : ""}This guide covers ${c.name}'s courses, fees, English &amp; academic requirements, scholarships, the step-by-step admission process, student-visa and post-study-work rules, and tips to get in — everything in one place.</p>
  <a class="cta" href="/#/colleges/predictor/${encodeURIComponent(c.country)}">▶ Predict my admission chances (free)</a>
</section>
<div class="card">
  <h2>📚 Courses &amp; programs at ${esc(c.name)}</h2>
  <p>${esc(c.name)} is best known for ${(c.strengths || []).slice(0, 4).join(", ")}. Popular programs for international students include:</p>
  <ul>${c.programs.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
  ${c.classProfile ? `<p class="note">Class profile: ${esc(c.classProfile)}.${c.alumni && c.alumni !== "N/A" ? " Notable alumni: " + esc(c.alumni) + "." : ""}</p>` : ""}
</div>
<div class="card">
  <h2>✅ Entry requirements</h2>
  <table style="width:100%;border-collapse:collapse" class="uni-table">
    ${row("IELTS (Academic)", c.ielts)}${row("TOEFL iBT", c.toefl)}${row("PTE Academic", c.pte)}${row("Duolingo English Test", c.duolingo)}
    ${row("GRE", c.gre)}${row("GMAT (MBA)", c.gmat || "Not required")}${row("Min GPA / grade", c.gpa)}${row("Work experience", c.workEx || "Not required")}
  </table>
  <div class="callout tip"><span class="ic">💡</span><div>Below the English score? Don't pay to find out — take a <a href="/mock-test/ielts/">free full-length IELTS mock</a> (or <a href="/mock-test/pte/">PTE</a> / <a href="/mock-test/toefl/">TOEFL</a>) and see your gap instantly. Full breakdown: <a href="/ielts-for-${c.id}/">IELTS score for ${esc(c.name)}</a>.</div></div>
</div>
<div class="card">
  <h2>💰 Fees &amp; cost of studying</h2>
  <table style="width:100%;border-collapse:collapse" class="uni-table">
    ${row("Tuition (international)", c.feeNote)}${row("Application fee", c.appFee)}${row("Living costs (est.)", ci.living || "Varies by city")}${row("Scholarships", c.scholarship || "Merit & need-based options")}
  </table>
  <p class="note">Plan your budget for tuition + living + health insurance + the visa fee. Compare funding with the free <a href="/#/colleges">scholarship finder</a>.</p>
</div>
<div class="card">
  <h2>📝 Step-by-step admission process</h2>
  <ol class="bsteps">${proc.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
</div>
<div class="card">
  <h2>📄 Documents checklist</h2>
  <ul class="bcheck">${(ci.checklist || ["Academic transcripts & degree certificates", "English test scorecard (IELTS/TOEFL/PTE)", "Statement of Purpose (SOP)", "Letters of Recommendation", "Passport", "Proof of funds / bank statement", "Updated CV/resume"]).map(d => `<li>${esc(d)}</li>`).join("")}</ul>
</div>
<div class="card">
  <h2>🛂 Student visa &amp; post-study work · ${esc(c.country)}</h2>
  <ul class="bcheck">
    <li><strong>Student visa:</strong> ${esc(ci.visa || "Required — apply after your offer & proof of funds")}</li>
    <li><strong>Work while studying:</strong> ${esc(ci.work || "Usually allowed part-time during term")}</li>
    <li><strong>Post-study work:</strong> ${esc(ci.psw || "Varies — check current country rules")}</li>
  </ul>
</div>
<div class="card uni-tips">
  <h2>🎯 Tips &amp; tricks to get admission</h2>
  <ul class="bcheck">${tips.map(t => `<li>${t}</li>`).join("")}</ul>
</div>
<div class="card">
  <h2>📅 Intakes &amp; deadlines</h2>
  <table style="width:100%;border-collapse:collapse" class="uni-table">
    ${row("Intakes", c.intakes.join(", "))}${row("Typical deadline", c.deadline)}${row("Acceptance rate", c.acceptance + "% (" + compete + ")")}
  </table>
  <p class="note">All figures are indicative and change year to year — always confirm on the official site${site ? ` (<a href="https://${site}" target="_blank" rel="noopener">${site}</a>)` : ""} before applying.</p>
</div>
${uniDepthBlock(c, ci)}
${faqBlock(faqs2)}
${relatedGrid([
  { label: `🎓 Predict my admission (${c.country})`, href: `/#/colleges/predictor/${encodeURIComponent(c.country)}` },
  { label: `🏛️ Top universities in ${c.country}`, href: `/study-abroad/top-universities-in-${(c.country || "").toLowerCase().replace(/\s+/g, "-")}/` },
  ...(UNI_VS_LINK[c.id] ? [UNI_VS_LINK[c.id]] : []),
  { label: `📊 IELTS score for ${c.name}`, href: `/ielts-for-${c.id}/` },
  // Every university has ielts/pte/toefl variants, but this grid only ever linked the IELTS
  // one — so the non-IELTS pages were starved despite being the site's best performers.
  // GSC 2026-08-08: /pte-for-rmit/ ranks 15.4 on 93 impressions with exactly ONE inbound
  // internal link; /toefl-for-lse/ 12.4 on 43; /toefl-for-ucd/ 13.6 on 28. Restricted to
  // variants KEEP_INDEXED already vouches for, so this surfaces proven pages rather than
  // blanket-linking 334 combos — link-stuffing is what the March-2026 update penalises.
  ...(PROVEN_EXAM_PAGES[c.id] || []).map((e) => ({ label: `📊 ${e.toUpperCase()} score for ${c.name}`, href: `/${e}-for-${c.id}/` })),
  { label: `🎯 Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `💸 Scholarships for ${c.country}`, href: `/#/colleges/scholarships/${encodeURIComponent(c.country)}` },
  { label: `✍️ Free SOP guide & samples`, href: `/blog/how-to-write-sop/` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "CollegeOrUniversity", name: c.name, url: "https://" + c.website,
      address: { "@type": "PostalAddress", addressLocality: c.city, addressCountry: c.country }, foundingDate: String(c.founded) }),
    jsonld({ "@context": "https://schema.org", "@type": "ItemList", name: `Popular programs at ${c.name}`,
      itemListElement: (c.programs || []).slice(0, 8).map((p, i) => ({ "@type": "ListItem", position: i + 1,
        item: { "@type": "Course", name: p, description: `${p} for international students at ${c.name}, ${c.city}, ${c.country}.`, url: ORIGIN + path,
          provider: { "@type": "CollegeOrUniversity", name: c.name, sameAs: "https://" + c.website } } })) }),
    faqJsonLd(faqs2),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Colleges", path: "/#/colleges" }, { name: c.name, path }]),
  ] }) + shell(inner));
}

/**
 * Depth for /compare/<a>-vs-<b>/ — 6 pages at a 356-word median, the thinnest indexed
 * family left. Both universities are already loaded with rank, acceptance, English
 * requirement, fees and intakes, and the page was reporting them without ever drawing
 * the comparison a reader came for.
 *
 * Everything here is derived from the two records, so each pair reads differently.
 */
function uniCompareDepthBlock(a, b) {
  const n = (v) => (typeof v === "number" && isFinite(v) ? v : null);
  const ia = parseFloat(a.ielts), ib = parseFloat(b.ielts);
  const bits = [];
  const ra = n(a.rank), rb = n(b.rank);
  if (ra !== null && rb !== null && ra !== rb) {
    const hi = ra < rb ? a : b, lo = ra < rb ? b : a, gap = Math.abs(ra - rb);
    bits.push(`<li><strong>Rank.</strong> ${esc(hi.name)} sits ${gap} ${gap === 1 ? "place" : "places"} above ${esc(lo.name)} (#${n(hi.rank)} against #${n(lo.rank)}). Treat that as a coarse signal: QS rank is built largely from institution-wide research output and reputation surveys, so a gap of this size says very little about the department you would actually join, and nothing at all about teaching on your specific programme.</li>`);
  }
  const aa = n(a.acceptance), ab = n(b.acceptance);
  if (aa !== null && ab !== null) {
    bits.push(aa === ab
      ? `<li><strong>Selectivity.</strong> Both report an indicative acceptance rate of about ${aa}%, so neither is the safer application on this measure — which means your shortlist needs a genuine back-up elsewhere rather than treating one of these two as one.</li>`
      : `<li><strong>Selectivity.</strong> About ${aa}% at ${esc(a.name)} against ${ab}% at ${esc(b.name)} — ${esc(aa < ab ? a.name : b.name)} is the harder admission of the two. These are institution-level figures, so a competitive department inside the more accessible university can still be tighter than the headline gap suggests.</li>`);
  }
  if (isFinite(ia) && isFinite(ib)) {
    bits.push(ia === ib
      ? `<li><strong>English requirement.</strong> Both ask for IELTS ${esc(String(a.ielts))}, so one preparation target covers both applications and the English test is not a factor in choosing between them.</li>`
      : `<li><strong>English requirement.</strong> IELTS ${esc(String(a.ielts))} at ${esc(a.name)} against ${esc(String(b.ielts))} at ${esc(b.name)}. If you are applying to both, prepare to the higher of the two — ${esc(ia > ib ? a.name : b.name)} — because a score built for the lower bar closes the other door.</li>`);
  }
  if (a.feeNote && b.feeNote) {
    bits.push(`<li><strong>Fees.</strong> ${esc(String(a.feeNote))} at ${esc(a.name)}; ${esc(String(b.feeNote))} at ${esc(b.name)}. Compare these over the full length of the programme rather than per year, and check what each excludes — bench fees, materials, compulsory insurance and placement costs vary enormously by subject and are rarely in the headline number.</li>`);
  }
  if (!bits.length) return "";
  const sameCountry = a.country === b.country;
  return `<div class="card"><h2>${esc(a.name)} or ${esc(b.name)} — reading the differences</h2>
<ul class="bcheck">${bits.join("")}</ul>
<p>${sameCountry
  ? `Both are in ${esc(String(a.country))}, so visa route, post-study work rights and living costs are broadly common to the two and drop out of the decision. That is useful: it means the choice really is about programme, department and cost, rather than about country — and those are things you can investigate directly by reading the module lists and emailing the departments.`
  : `These are in different countries — ${esc(String(a.country))} and ${esc(String(b.country))} — which usually matters more than anything in the table above. Visa conditions, post-study work rights, the cost of living and whether you can stay and work afterwards differ by country, are set by government rather than by either university, and can change between applying and graduating. Settle the country question first; it constrains everything else.`}</p>
<p><strong>The comparison that actually decides it.</strong> Rank, acceptance rate and fees are the numbers that are easy to publish, which is why every comparison page leads with them. The things that determine whether you finish the degree well are the specific module list, who teaches it, whether there is a placement or industry link where you want to work, and the total cost to a work permit. None of those are in a ranking table, and all of them are answerable in an afternoon by reading two programme pages and sending two emails.</p></div>`;
}

// ── University-vs-University comparison pages (programmatic SEO) ─────────────
// Titles are clamped to ~60 chars for SERP display. Full university names are long, so
// "X vs Y: Fees, Ranking, IELTS & Admission Compared 2026" clamped away the "vs Y" — the
// one part that makes a comparison page distinct — leaving two different URLs sharing the
// title "Ludwig Maximilian University of Munich (LMU) | LandingPrep". Prefer a
// parenthesised abbreviation when the name carries one, and keep the title short enough
// that BOTH names survive the clamp.
function compactUniName(name, id) {
  const abbr = String(name).match(/\(([A-Za-z][A-Za-z0-9&.\-]{1,11})\)\s*$/);
  if (abbr) return abbr[1];
  const plain = String(name).replace(/^The\s+/i, "");
  // BOTH names have to fit the clamp together, so a per-name length test is not enough
  // ("University of Auckland" and "University of Otago" are each short-ish but collide).
  // The route id is the site's own short handle — "ubc", "otago", "alberta" — and is also
  // how people actually search ("UBC vs Alberta"). Full names still appear in the H1 and body.
  const h = String(id || "").replace(/[^a-z0-9]/gi, "");
  if (!h) return plain;
  return h.length <= 4 ? h.toUpperCase() : h.charAt(0).toUpperCase() + h.slice(1);
}
function uniVsPage(a, b) {
  const cmpDepth = uniCompareDepthBlock(a, b);
  const path = `/compare/${a.id}-vs-${b.id}/`;
  const title = `${compactUniName(a.name, a.id)} vs ${compactUniName(b.name, b.id)}: Fees & Ranking 2026 | ${BRAND}`;
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
${cmpDepth}
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
  ] }) + shell(inner), { thin: true });   // programmatic university-vs-university combo → noindex (prune for SEO recovery)
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

/**
 * Per-page depth for the /study-abroad/<field>-in-<country>/ family.
 *
 * These 100-odd pages sat at a 397-word median: the template already computed a
 * real, page-specific set of universities and then spent one <ul> on it. This
 * turns that same data into a comparison table and a spread analysis, so each
 * page carries numbers no sibling page has.
 *
 * It also states out loud when fewer than three universities actually match the
 * field, because the surrounding code silently falls back to the country's top
 * universities in that case. A reader deserves to know the list in front of them
 * is "top universities in this country" rather than "top universities for this
 * subject" — and an unqualified list would be the more SEO-flattering lie.
 */
function fieldDepthBlock(field, co, unis, matched, all) {
  if (!unis.length) return "";
  const num = (v) => (typeof v === "number" && isFinite(v) ? v : null);
  const accs = unis.map((u) => num(u.acceptance)).filter((x) => x !== null);
  const ranks = unis.map((u) => num(u.rank)).filter((x) => x !== null);
  const iel = unis.map((u) => parseFloat(u.ielts)).filter((x) => isFinite(x));
  const fellBack = matched.length < 3;
  const rows = unis.map((u) => `<tr><td><a href="/university/${u.id}/">${esc(u.name)}</a></td><td>${u.rank ? "#" + u.rank : "—"}</td><td>${esc(String(u.ielts))}</td><td>${u.acceptance != null ? u.acceptance + "%" : "—"}</td><td>${esc(String(u.feeNote || "—"))}</td></tr>`).join("");
  const spread = accs.length >= 2
    ? `Acceptance across this shortlist runs from ${Math.min(...accs)}% to ${Math.max(...accs)}%. That range matters more than any single number: a list of six universities with one at ${Math.min(...accs)}% and another at ${Math.max(...accs)}% is not six equivalent applications, and treating it as one is how students end up with an all-reach list and no offer.`
    : "";
  const ieltsLine = iel.length >= 2 && Math.min(...iel) !== Math.max(...iel)
    ? `English requirements are not uniform either — this shortlist spans IELTS ${Math.min(...iel)} to ${Math.max(...iel)}. Preparing to the lowest figure on the list quietly removes the other universities from your options before you have applied.`
    : `Every university on this shortlist asks for about IELTS ${iel[0] || "6.5"}, so one preparation target covers the whole list.`;
  return `<div class="card"><h2>Comparing the shortlist for ${esc(field.short)} in ${co.name}</h2>
${fellBack
  ? `<p><strong>Read this list carefully.</strong> Only ${matched.length} ${matched.length === 1 ? "university" : "universities"} in our ${co.name} dataset ${matched.length === 1 ? "lists" : "list"} a programme matching “${esc(field.short)}” by name, which is too few to rank meaningfully. The table below therefore shows the top-ranked universities in ${co.name} generally — strong institutions where ${esc(field.short)} is usually available under a broader faculty, but not a subject-specific ranking. Check the department page before you shortlist.</p>`
  : `<p>${matched.length} of the ${all.length} ${co.name} universities in our dataset run a programme matching ${esc(field.short)}. The ${unis.length} below are the highest-ranked of those.</p>`}
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>University</th><th>QS rank</th><th>IELTS</th><th>Acceptance</th><th>Fees</th></tr></thead><tbody>${rows}</tbody></table></div>
${spread ? `<p>${spread}</p>` : ""}
<p>${ieltsLine}</p>
${ranks.length >= 2 ? `<p>Ranks here span ${Math.min(...ranks)} to ${Math.max(...ranks)}. Rank is the weakest of the three columns for choosing a ${esc(field.short)} programme — it is dominated by research output and reputation surveys across the whole institution, neither of which tells you who teaches your modules or whether the department has industry links where you want to work. Use it to sanity-check, not to sort.</p>` : ""}
<p>The practical sequence for ${co.name}: confirm the intake you are targeting (${(co.intakes || []).join(", ") || "check each university"}), because entry requirements and funding both key off it; budget tuition of ${esc(String(co.avgTuition))} against living costs of ${esc(String(co.avgLiving))} rather than tuition alone, which is the most common underestimate; and check post-study work terms — ${esc(String(co.postStudyWork))} — before you commit, since that is what converts the degree into the outcome most students are actually buying.</p></div>
<div class="card"><h2>What the table above does not tell you</h2>
<p>Four things decide a ${esc(field.short)} application in ${co.name} that no ranking column captures, and they are usually what separates an offer from a rejection at the same institution.</p>
<ul class="bcheck">
<li><strong>Acceptance rate is institutional, not departmental.</strong> A university reporting ${accs.length ? Math.max(...accs) + "%" : "a high rate"} overall can run a ${esc(field.short)} programme far below that, because competitive departments carry the selective end of the distribution. Always look for the programme's own intake numbers; where they are not published, class size and the number of entry routes are decent proxies.</li>
<li><strong>The English score is a floor, not a target.</strong> IELTS ${iel.length ? Math.min(...iel) : "6.5"} clears the gate; it does not compete. Where a programme is oversubscribed, admissions staff read the band breakdown, and a strong overall score hiding a weak Writing band is a common quiet rejection. Check whether the university sets per-section minimums as well as an overall figure — many do, and applicants routinely miss it.</li>
<li><strong>Funding decisions run on a different calendar to admissions.</strong> In ${co.name} the intakes are ${(co.intakes || []).join(", ") || "published per university"}, but most scholarship deadlines sit weeks to months ahead of the application deadline. Applying "on time" for admission and late for money is one of the most expensive ordinary mistakes in the process, and it is entirely avoidable.</li>
<li><strong>Post-study work rules are what you are really buying.</strong> ${esc(String(co.postStudyWork))} ${co.prTimeline ? `The onward route matters too — ${esc(String(co.prTimeline))}.` : ""} These terms are set by government policy rather than by the university, so they can change between the year you apply and the year you graduate. Verify them on the official immigration site at the point of applying rather than trusting any third-party summary, this page included.</li>
</ul>
<p>If you are choosing between ${co.name} and somewhere else for ${esc(field.short)}, compare on total cost to a work permit rather than on tuition or rank. Tuition of ${esc(String(co.avgTuition))} plus living costs of ${esc(String(co.avgLiving))} over the length of the programme, set against what the post-study work window realistically lets you earn back, is the comparison that actually changes decisions — and it frequently reverses the ordering you get from ranking tables alone.</p></div>`;
}

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
${fieldDepthBlock(field, co, unis, matched, all)}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🔮 Predict colleges in ${co.name}`, href: `/#/colleges/predictor/${encodeURIComponent(co.name)}` },
  { label: `Cost of studying in ${co.name}`, href: `/study-abroad/cost-of-studying-in-${co.id}/` },
  { label: `Top universities in ${co.name}`, href: `/study-abroad/top-universities-in-${co.id}/` },
  { label: `Scholarships for ${co.name}`, href: `/#/colleges/scholarships/${encodeURIComponent(co.name)}` },
])}`;
  // 25 of these 90 pages (France, UAE, Spain, Poland, Czech Republic) have NO universities in
  // COLLEGES at all, so a page titled "<Field> in <Country> — Top Universities, Fees &
  // Requirements" lists none. That is not merely thin, it fails to deliver its own title, and
  // inventing institutions to fill it is exactly the from-memory fabrication that corrupted
  // 210 content files earlier. They stay live and linked for anyone who lands on them, but
  // noindex + out of sitemap until the dataset actually covers those countries.
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: `${field.name} in ${co.name}`, path }]),
  ] }) + shell(inner), unis.length ? undefined : { thin: true });
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
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Studying in ${esc(co.name)} costs about <strong>${esc(co.avgTuition)}</strong> in tuition plus <strong>${esc(co.avgLiving)}</strong> in living costs per year for international students. Scholarships, part-time work (≈20 hours/week) and ${esc((co.postStudyWork || "post-study work").toLowerCase())} bring the real, after-graduation cost down significantly. Figures are indicative for 2026 — confirm with each university.</div>
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
${Array.isArray(co.whyStudy) && co.whyStudy.length ? `<div class="card"><h2>Why ${esc(co.name)} is good value for international students</h2><ul class="bcheck">${co.whyStudy.slice(0, 5).map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>` : ""}
${Array.isArray(co.topCities) && co.topCities.length ? `<div class="card"><h2>Living costs vary by city</h2><p>Your living budget in ${esc(co.name)} depends heavily on the city. The most popular student cities are <strong>${co.topCities.slice(0, 6).map(esc).join(", ")}</strong> — the largest cities (typically the first one or two) cost noticeably more for rent than smaller university towns, so choosing a lower-cost city can save a significant amount over your degree.</p></div>` : ""}
${Array.isArray(co.popularPrograms) && co.popularPrograms.length ? `<div class="card"><h2>Popular programmes in ${esc(co.name)}</h2><p>International students in ${esc(co.name)} most commonly study:</p><ul class="bcheck">${co.popularPrograms.slice(0, 6).map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div>` : ""}
<div class="card"><h2>Earning it back — post-study work &amp; PR in ${esc(co.name)}</h2><ul class="bcheck">
${co.postStudyWork ? `<li><strong>Post-study work:</strong> ${esc(co.postStudyWork)}</li>` : ""}
${co.visaSuccess ? `<li><strong>Student-visa success rate:</strong> ≈${esc(String(co.visaSuccess))}%${co.visaNote ? ` — ${esc(co.visaNote)}` : ""}</li>` : ""}
${co.immigration ? `<li><strong>Immigration pathway:</strong> ${esc(co.immigration)}</li>` : ""}
${co.prTimeline ? `<li><strong>Permanent residence:</strong> ${esc(co.prTimeline)}</li>` : ""}
</ul><p class="note">A clear post-study work and PR pathway is what turns tuition into an investment — graduates who stay and work often recover the cost within a few years.</p></div>
${Array.isArray(co.changes) && co.changes.length ? `<div class="card"><h2>Recent updates affecting cost &amp; study in ${esc(co.name)}</h2><ul class="bcheck">${co.changes.slice(0, 4).map((c) => `<li><strong>${esc(c.d || c.date || "")}:</strong> ${esc(c.t || c.text || c)}</li>`).join("")}</ul><p class="note">Always verify current fees, visa rules and policies on official government and university websites before you apply.</p></div>` : ""}
<div class="card"><h2>Building a budget that survives contact with ${esc(co.name)}</h2>
<p>The headline pair — ${esc(String(co.avgTuition))} tuition and ${esc(String(co.avgLiving))} living — is the right starting point and the wrong finishing point. Budgets fail in predictable places, and almost none of them are tuition, because tuition is the one number everybody checks.</p>
<ul class="bcheck">
<li><strong>The first two months cost far more than an average month.</strong> A rental deposit, agency fees, the first month's rent paid up front, bedding and kitchen basics, a local phone and transport pass, and often a health-insurance payment all land before your first student-job pay arrives. Treat the setup period as a separate line, not as part of the monthly average, or you will hit it with a monthly-average bank balance.</li>
<li><strong>Proof of funds is not the same as your budget.</strong> Visa rules require you to show a set figure, and students routinely mistake it for a sufficiency estimate. It is a threshold set by policy, usually pegged to a national minimum rather than to what a student in a particular city actually spends, and in expensive cities it can be well under the real cost.</li>
<li><strong>Currency movement is a real line item.</strong> If your funding is in one currency and your costs in another, a few percent of drift across a multi-year degree is the size of a semester's living costs. Nobody can forecast it — the practical answer is a buffer, not a prediction.</li>
<li><strong>Part-time earnings are capped and seasonal.</strong> Roughly 20 hours a week in term time is a ceiling, not a plan: work is hardest to find in your first term when you have no local references, and the hours you can work are lowest exactly when coursework peaks. Budget as though term-time earnings are zero and treat anything you do earn as a buffer.</li>
</ul>
<p>A workable rule for ${esc(co.name)}: take the annual figures above, add roughly one extra month of living costs as a setup line, and hold a contingency you do not touch. ${co.postStudyWork ? `The reason the arithmetic is worth doing carefully is the other end of it — ${esc(String(co.postStudyWork))}${co.prTimeline ? `, with ${esc(String(co.prTimeline))}` : ""}. That window is what converts the spending into a return, and it is set by immigration policy rather than by any university, so verify it on the official government site at the point you apply.` : "Verify current figures on official government and university sources at the point you apply — published costs move year to year."}</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🧮 Cost of studying abroad calculator`, href: `/tools/cost-of-studying-abroad-calculator/` },
  { label: `Scholarships for ${co.name}`, href: `/#/colleges/scholarships/${encodeURIComponent(co.name)}` },
  { label: `Top universities in ${co.name}`, href: `/study-abroad/top-universities-in-${co.id}/` },
  { label: `📅 Intakes & deadlines`, href: `/intakes/` },
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
    { q: `Is LandingPrep really free?`, a: `Yes — all mock tests, practice, the college predictor, scholarship finder, SOP builder and study-abroad tools are 100% free with no signup required.` },
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
    <li><strong>5,400+ practice questions</strong> in full-length mock tests across 7 exams, with real timings, speaking &amp; writing practice and model answers.</li>
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
<div class="card">
  <h2>Editorial standards &amp; how we verify content</h2>
  <ul>
    <li><strong>Fact-checking:</strong> Exam formats, scores, fees, deadlines and visa rules are verified against official sources — test makers (IELTS, ETS, Pearson), university websites and government immigration portals — with sources linked inline.</li>
    <li><strong>Currency:</strong> Guides are reviewed regularly and re-dated whenever the underlying exam format, fees or visa rules change.</li>
    <li><strong>Independence:</strong> We are not affiliated with any test provider or university, and we never publish pay-to-rank placements.</li>
    <li><strong>No invention:</strong> We never fabricate statistics, reviews, author credentials or success stories. Where a figure is indicative (e.g. visa-success rates), we say so explicitly.</li>
    <li><strong>Who writes and reviews this:</strong> Guides are researched, written and cross-checked by the LandingPrep editorial team, with every factual claim traced to a primary official source. We publish under the team name rather than attach invented "expert" bylines or credentials we cannot stand behind — what we ask you to trust is the linked source next to each fact, not a name.</li>
    <li><strong>Corrections:</strong> Found something out of date or wrong? Email <a href="mailto:support@landingprep.com">support@landingprep.com</a>; we verify, fix and re-date the page.</li>
  </ul>
</div>
<div class="card">
  <h2>Disclaimer</h2>
  <p>LandingPrep provides free educational information and practice tools. This is general guidance, not professional immigration, legal, financial or admissions advice. Exam formats, university requirements, fees and visa rules change — always confirm the latest details with the official test maker, university or government authority before you act. Your use of the platform is at your own risk.</p>
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

function privacyPage() {
  const path = `/privacy/`;
  const title = `Privacy Policy — LandingPrep`;
  const desc = `How LandingPrep handles your data: we are local-first, collect the minimum, never sell your data, and you can use everything without an account. Read our full privacy policy.`;
  const kw = `landingprep privacy policy, data protection, cookie policy, student data privacy`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › Privacy Policy</p>
<section class="hero">
  <div class="badges"><span class="badge">Local-first</span><span class="badge">No data selling</span><span class="badge">Use without an account</span></div>
  <h1>Privacy Policy</h1>
  <p class="lead">LandingPrep is built privacy-first. You can take mock tests and use every tool without signing up, and we collect the minimum data needed to run the service. <em>Last updated: 2026.</em></p>
</section>
<div class="card">
  <h2>The short version</h2>
  <ul>
    <li>You can use LandingPrep <strong>without an account</strong>. Your progress is stored <strong>locally in your browser</strong> by default.</li>
    <li>We <strong>never sell</strong> your personal data, and we don't run intrusive ad networks.</li>
    <li>An optional free account only adds cross-device progress sync.</li>
    <li>You can request deletion of your data any time at <a href="mailto:support@landingprep.com">support@landingprep.com</a>.</li>
  </ul>
</div>
<div class="card">
  <h2>What we collect</h2>
  <ul>
    <li><strong>Progress & preferences</strong> — your test history, streaks and settings are saved in your browser's local storage. They never leave your device unless you create an account.</li>
    <li><strong>Optional account data</strong> — if you sign up, we store your name and email and a securely hashed password to sync progress across devices.</li>
    <li><strong>Analytics</strong> — we use Google Analytics 4 to understand which pages and tools are used (aggregate, not used to identify you personally).</li>
    <li><strong>Error reports</strong> — if a page breaks, a short technical error message is sent to us so we can fix it. It contains no personal data.</li>
    <li><strong>Newsletter</strong> — only if you choose to subscribe, we store your email to send study tips. One-click unsubscribe is in every email.</li>
  </ul>
</div>
<div class="card">
  <h2>Smart features</h2>
  <p>When you use a smart tool (the band checker, speaking/writing partner or smart tutor), the text or transcript you submit is sent to Google's Gemini API to generate feedback. We do not use your submissions to train models, and we don't store them beyond what's needed to show your result. Do not paste sensitive personal information into smart tools.</p>
</div>
<div class="card">
  <h2>Cookies & third parties</h2>
  <p>We use a small number of essential and analytics cookies (mainly Google Analytics). Optional accounts and sync are powered by Google Firebase. Our smart features use the Google Gemini API. These providers process data under their own privacy policies. We do not use third-party advertising trackers.</p>
</div>
<div class="card">
  <h2>Your rights & contact</h2>
  <p>You can access, correct or delete your data, or opt out of analytics, at any time. Email <a href="mailto:support@landingprep.com">support@landingprep.com</a> and we'll action your request. LandingPrep is not directed at children under 13; if you believe a child has provided data, contact us and we'll remove it.</p>
</div>
<div class="card" id="data-deletion">
  <h2>Data deletion</h2>
  <p>You can request deletion of all data LandingPrep holds about you at any time. To delete your data:</p>
  <ol>
    <li>Email <a href="mailto:support@landingprep.com?subject=Delete%20my%20data">support@landingprep.com</a> from the address linked to your account, with the subject "Delete my data".</li>
    <li>We verify the request and permanently delete your account and associated personal data within 30 days, and confirm by email.</li>
  </ol>
  <p>If you connected to LandingPrep through Instagram or Facebook, this same process removes any data we received via that login. Most of LandingPrep works with no account at all, in which case we hold no personal data tied to you. Questions about data deletion: <a href="mailto:support@landingprep.com">support@landingprep.com</a>.</p>
</div>
${relatedGrid([
  { label: `📄 Terms of Service`, href: `/terms/` },
  { label: `ℹ️ About LandingPrep`, href: `/about/` },
  { label: `🎯 Free mock tests`, href: `/#/exam-prep` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebPage", name: title, url: ORIGIN + path, description: desc, publisher: { "@type": "Organization", name: BRAND, url: ORIGIN } }),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Privacy Policy", path }]),
  ] }) + shell(inner));
}

function termsPage() {
  const path = `/terms/`;
  const title = `Terms of Service — LandingPrep`;
  const desc = `The terms for using LandingPrep's free exam prep and study-abroad tools. Scores shown are estimates, not official results, and we are not affiliated with any test provider.`;
  const kw = `landingprep terms of service, terms and conditions, free exam prep terms`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › Terms of Service</p>
<section class="hero">
  <div class="badges"><span class="badge">100% free</span><span class="badge">No affiliation with test providers</span></div>
  <h1>Terms of Service</h1>
  <p class="lead">Plain-English terms for using LandingPrep. By using the site you agree to these terms. <em>Last updated: 2026.</em></p>
</section>
<div class="card">
  <h2>The service</h2>
  <p>LandingPrep provides free practice tests, instant feedback tools and study-abroad resources for international students. The service is provided free of charge, "as is", and we may add, change or remove features at any time.</p>
</div>
<div class="card">
  <h2>Scores and information are estimates</h2>
  <p>band scores, predicted university chances, cost calculators and exam information are <strong>estimates and guidance only</strong> — they are not official scores or guarantees. Always confirm fees, score requirements, deadlines and visa rules with the official test provider, university or government source before making decisions.</p>
</div>
<div class="card">
  <h2>No affiliation</h2>
  <p>LandingPrep is an independent education platform. We are <strong>not affiliated with, endorsed by, or connected to</strong> IELTS, ETS (TOEFL/GRE), Pearson (PTE), CELPIP, Duolingo, GMAC (GMAT), any university, or any government. All trademarks belong to their respective owners and are used for identification only.</p>
</div>
<div class="card">
  <h2>Acceptable use</h2>
  <ul>
    <li>Use LandingPrep for your own personal exam preparation and study-abroad planning.</li>
    <li>Don't abuse, overload, scrape at scale, or attempt to disrupt the service or its smart features.</li>
    <li>Don't submit unlawful content or other people's personal data into the tools.</li>
  </ul>
</div>
<div class="card">
  <h2>Liability</h2>
  <p>To the maximum extent permitted by law, LandingPrep is not liable for any decisions made based on the estimates, content or tools provided, or for any loss arising from use of the free service. Your use is at your own discretion.</p>
  <p class="note">Questions about these terms? Email <a href="mailto:support@landingprep.com">support@landingprep.com</a>.</p>
</div>
${relatedGrid([
  { label: `🔒 Privacy Policy`, href: `/privacy/` },
  { label: `ℹ️ About LandingPrep`, href: `/about/` },
  { label: `🏛️ Study-abroad toolkit`, href: `/#/colleges` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebPage", name: title, url: ORIGIN + path, description: desc, publisher: { "@type": "Organization", name: BRAND, url: ORIGIN } }),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Terms of Service", path }]),
  ] }) + shell(inner));
}

// Link-in-bio hub — the single Instagram bio link points here; one tap → the exact guide/tool a
// post mentions. noindex,follow (it's a curated link menu, not original content) but passes equity.
function linksPage() {
  const path = `/links/`;
  const title = `LandingPrep — Free Study-Abroad Guides & Tools`;
  const desc = `Every free LandingPrep study-abroad guide and tool in one place: mock tests, college predictor, best countries, fastest PR, scholarships, SOP help and more. Tap any link.`;
  const kw = `landingprep links, free study abroad guides, free mock tests, college predictor, link in bio`;
  const LINKS = [
    { icon: "🎓", label: "Free College Predictor & study-abroad tools", href: "/#/colleges" },
    { icon: "📝", label: "Free mock tests — IELTS, TOEFL, PTE, GRE, GMAT", href: "/#/exam-prep" },
    { icon: "🌍", label: "Best countries to study abroad 2026", href: "/blog/best-countries-study-abroad-2026" },
    { icon: "⚡", label: "Fastest PR countries after study", href: "/blog/fastest-pr-countries-for-international-students-2026" },
    { icon: "💼", label: "Easiest countries to immigrate after study", href: "/blog/easiest-countries-to-immigrate-after-study-2026" },
    { icon: "💰", label: "Cheapest countries to study abroad", href: "/blog/cheapest-countries-to-study-abroad" },
    { icon: "📅", label: "Fall vs Spring intake — when to apply", href: "/blog/fall-vs-spring-intake-which-better" },
    { icon: "🎁", label: "Fully-funded scholarships 2026", href: "/blog/fully-funded-scholarships-study-abroad" },
    { icon: "✍️", label: "How to write a strong SOP", href: "/blog/how-to-write-sop" },
    { icon: "🎯", label: "GRE 2026 — full format & study plan", href: "/blog/gre-format-2026-complete-guide" },
    { icon: "🗣️", label: "How to get IELTS Band 7+", href: "/blog/how-to-get-ielts-band-7" },
  ];
  const buttons = LINKS.map((l) => `<a href="${l.href}" style="display:flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:18px 20px;margin:12px 0;text-decoration:none;color:#0f172a;font-weight:700;font-size:17px;box-shadow:0 1px 3px rgba(0,0,0,0.05)"><span style="font-size:24px;line-height:1">${l.icon}</span><span>${esc(l.label)}</span></a>`).join("");
  const inner = `
<section class="hero" style="text-align:center">
  <div class="badges" style="justify-content:center"><span class="badge">100% free</span><span class="badge">No signup</span></div>
  <h1>Everything for your study-abroad journey</h1>
  <p class="lead">Free guides, mock tests and tools — tap any link below. Follow <a href="https://instagram.com/landing_prep">@landing_prep</a> for a daily study-abroad guide.</p>
</section>
<div style="max-width:560px;margin:0 auto 8px">${buttons}</div>`;
  emit(path, head({ title, desc, path, kw, robots: "noindex, follow", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebPage", name: title, url: ORIGIN + path, description: desc, publisher: { "@type": "Organization", name: BRAND, url: ORIGIN } }),
  ] }) + shell(inner));
}

function embedPage() {
  const path = `/embed/`;
  const title = `Free Embeddable Study-Abroad Widgets — Proof of Funds, Score, GPA & Loan`;
  const desc = `Embed LandingPrep's free widgets on your site with one line of HTML: a student-visa proof-of-funds checker by country, an IELTS↔TOEFL↔PTE score converter, a GPA (%↔CGPA↔4.0) converter, and an education-loan EMI calculator. Free forever, no signup.`;
  const kw = `proof of funds widget, student visa funds by country, embed score converter, ielts toefl converter widget, gpa converter widget, education loan emi calculator widget, free study abroad widget, free education widget`;
  const WIDGETS = [
    { slug: "proof-of-funds", h: 470, title: "Student Visa Proof-of-Funds by Country" },
    { slug: "score-converter", h: 360, title: "IELTS ↔ TOEFL ↔ PTE Score Converter" },
    { slug: "gpa-converter", h: 470, title: "GPA Converter — % ↔ CGPA ↔ US 4.0" },
    { slug: "loan-emi", h: 560, title: "Education Loan EMI Calculator" },
  ];
  const widgetCards = WIDGETS.map((w) => {
    const snip = `<iframe src="https://landingprep.com/embed/${w.slug}/" width="100%" height="${w.h}" style="border:1px solid #eef0f3;border-radius:14px;max-width:480px" title="${esc(w.title)}" loading="lazy"></iframe>\n<p style="font:14px system-ui">Free <a href="https://landingprep.com/">${esc(w.title)}</a> by LandingPrep</p>`;
    return `<div class="card">
  <h2>${esc(w.title)}</h2>
  <iframe src="/embed/${w.slug}/" width="100%" height="${w.h}" style="border:1px solid #e5e7eb;border-radius:14px;max-width:480px" title="${esc(w.title)} preview" loading="lazy"></iframe>
  <p style="font-size:13px;margin-top:10px"><a href="/embed/${w.slug}/">Open ${esc(w.title)} in its own page →</a></p>
  <p style="margin-top:10px;font-weight:600">Copy this snippet to embed it:</p>
  <pre style="white-space:pre-wrap;word-break:break-word;background:#f1f5f9;color:#0f172a;padding:14px;border-radius:10px;font-size:13px;overflow:auto">${esc(snip)}</pre>
</div>`;
  }).join("\n");
  const inner = `
<p class="crumb"><a href="/">Home</a> › Embeddable widgets</p>
<section class="hero">
  <div class="badges"><span class="badge">Free to embed</span><span class="badge">No signup</span><span class="badge">One line of HTML</span></div>
  <h1>Free Embeddable Widgets for Your Site</h1>
  <p class="lead">Add free, genuinely-useful study-abroad tools to your website, blog or student portal — a score converter, a GPA converter, and an education-loan EMI calculator. One line of HTML each, free forever, mobile-friendly.</p>
</section>
${widgetCards}
<div class="card">
  <h2>Why embed these?</h2>
  <ul>
    <li>Instantly useful for IELTS/TOEFL/PTE candidates and study-abroad students.</li>
    <li>Mobile-friendly and fast; adapt to light or dark mode automatically.</li>
    <li>100% free — no API key, no signup, and they never track your visitors.</li>
  </ul>
</div>
${relatedGrid([
  { label: `🎯 Free mock tests`, href: `/#/exam-prep` },
  { label: `🔁 Full score &amp; eligibility tools`, href: `/#/tools` },
  { label: `🏛️ Free college predictor`, href: `/#/colleges` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "LandingPrep Score Converter", url: ORIGIN + path,
      applicationCategory: "EducationApplication", operatingSystem: "Any (web)", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Embeddable widgets", path }]),
  ] }) + shell(inner));
}

// ── PR / immigration exam pages — high-intent, real CLB/points data ───────────
const PR_COMBOS = [
  { exam: "IELTS", co: "Canada", flag: "🇨🇦", slug: "ielts-for-canada-pr",
    sys: "Canada's Express Entry ranks candidates using the Canadian Language Benchmarks (CLB). For permanent residence you take IELTS General Training (not Academic).",
    min: "CLB 7 — about IELTS 6.0 in each of Listening, Reading, Writing and Speaking — is the usual minimum for Express Entry programs such as the Federal Skilled Worker stream.",
    top: "CLB 9 — roughly Listening 8.0, Reading 7.0, Writing 7.0, Speaking 7.0 — earns the maximum Comprehensive Ranking System (CRS) language points plus valuable skill-transferability and spouse points.",
    why: "Language is one of the biggest CRS levers: moving from CLB 7 to CLB 9 can add 50–100+ points, often the difference between getting an Invitation to Apply or not.",
    tip: "Use IELTS General Training, scores are valid 2 years, and Canada also accepts CELPIP and (since 2024) PTE Core for economic PR. Always confirm current CLB rules with IRCC.",
    faqs: [{ q: "What IELTS score do I need for Canada PR?", a: "CLB 7 (about IELTS 6.0 in each band) is the common minimum, but CLB 9 (roughly L8.0/R7.0/W7.0/S7.0) maximizes your CRS points. Confirm your program's requirement with IRCC." },
      { q: "IELTS Academic or General Training for Canada PR?", a: "General Training. Academic is for university admission; Express Entry requires IELTS General Training." }] },
  { exam: "CELPIP", co: "Canada", flag: "🇨🇦", slug: "celpip-for-canada-pr",
    sys: "CELPIP-General is a fully computer-based English test designed for Canadian immigration, scored directly on the Canadian Language Benchmarks (CLB) scale.",
    min: "CLB 7 (CELPIP level 7 in each skill) is the usual Express Entry minimum; many Provincial Nominee streams also accept CLB 5–7.",
    top: "CLB 9 (CELPIP level 9 in each of Listening, Reading, Writing and Speaking) earns the maximum CRS language points — the same target as IELTS CLB 9.",
    why: "Because CELPIP levels map one-to-one to CLB, scoring is easy to interpret, and results arrive in about 3 days — useful when an Express Entry draw is close.",
    tip: "CELPIP is taken inside Canada and at select centres abroad; scores are valid 2 years. Confirm the current CLB requirement with IRCC.",
    faqs: [{ q: "Is CELPIP easier than IELTS for Canada PR?", a: "Many candidates find CELPIP more relatable because it uses Canadian English and a computer-based speaking test, but neither is objectively easier — pick the format you are most comfortable with." },
      { q: "How fast are CELPIP results?", a: "Typically about 3 calendar days, faster than IELTS, which helps when an Express Entry round is imminent." }] },
  { exam: "PTE", co: "Canada", flag: "🇨🇦", slug: "pte-for-canada-pr",
    sys: "Since January 2024, IRCC accepts PTE Core for economic permanent-residence programs. PTE Core scores map to the Canadian Language Benchmarks (CLB).",
    min: "Aim for the PTE Core scores that correspond to CLB 7 in each skill — the common Express Entry minimum. Use the official PTE Core to CLB table for the exact numbers.",
    top: "PTE Core scores corresponding to CLB 9 in every skill earn the maximum CRS language points, the same target as IELTS or CELPIP CLB 9.",
    why: "PTE Core is computer-marked with fast results, so it is a strong option for raising your CLB and therefore your CRS score quickly.",
    tip: "Use PTE Core (not PTE Academic) for Canadian economic immigration. Confirm the current PTE Core to CLB mapping and acceptance with IRCC.",
    faqs: [{ q: "Does Canada accept PTE for PR?", a: "Yes — IRCC accepts PTE Core (not PTE Academic) for economic PR programs as of 2024. Scores map to CLB; confirm the current table with IRCC." },
      { q: "PTE Core or PTE Academic for Canada PR?", a: "PTE Core for immigration; PTE Academic is for university study." }] },
  { exam: "IELTS", co: "Australia", flag: "🇦🇺", slug: "ielts-for-australia-pr",
    sys: "Australia's skilled visas (subclass 189/190/491) use a points test. Your English level adds points based on IELTS scores across all four skills.",
    min: "Competent English — IELTS 6.0 in each of the four skills — is the usual minimum to be eligible, but it adds 0 points.",
    top: "Proficient English (IELTS 7.0 in each) adds 10 points; Superior English (IELTS 8.0 in each) adds 20 points — a major boost to your SkillSelect ranking.",
    why: "Those 10–20 English points often decide whether you reach the points cut-off for an invitation, so pushing each band from 7 to 8 is high-value.",
    tip: "All four skills must hit the band for the points tier — one 7.5 among 8.0s drops you to the lower tier. Scores are valid 3 years for migration. Confirm current rules with the Department of Home Affairs.",
    faqs: [{ q: "What IELTS score gives 20 points for Australia PR?", a: "Superior English — IELTS 8.0 in each of Listening, Reading, Writing and Speaking — adds 20 points. IELTS 7.0 in each adds 10 points." },
      { q: "Is IELTS Academic or General for Australia PR?", a: "Either is accepted for the points test; check your specific visa and assessing authority, and confirm with the Department of Home Affairs." }] },
  { exam: "PTE", co: "Australia", flag: "🇦🇺", slug: "pte-for-australia-pr",
    sys: "PTE Academic is widely used for Australian skilled migration. The Department of Home Affairs converts PTE scores to the same English point tiers as IELTS.",
    min: "Competent English — PTE 50 in each skill (≈ IELTS 6.0) — is the usual minimum and adds 0 points.",
    top: "Proficient — PTE 65 in each (≈ IELTS 7.0) — adds 10 points; Superior — PTE 79 in each (≈ IELTS 8.0) — adds 20 points.",
    why: "PTE's computer scoring and fast (≈5 day) results make it a popular way to chase the 20-point Superior tier that lifts your SkillSelect rank.",
    tip: "All four communicative skills must reach the threshold for the tier. PTE scores are valid 3 years for migration. Confirm current points rules with the Department of Home Affairs.",
    faqs: [{ q: "What PTE score is 20 points for Australia PR?", a: "PTE 79 in each of the four skills (Superior English, ≈ IELTS 8.0) adds 20 points; PTE 65 in each adds 10 points." },
      { q: "Is PTE easier than IELTS for Australia PR?", a: "Many find PTE's computer-marked speaking less stressful and results faster, but difficulty is personal — both map to the same points tiers." }] },
  { exam: "IELTS", co: "the UK", flag: "🇬🇧", slug: "ielts-for-uk-visa",
    sys: "UK work and settlement routes require proof of English at a set CEFR level, taken as an approved Secure English Language Test (IELTS for UKVI).",
    min: "The Skilled Worker visa requires CEFR B1 — about IELTS 4.0 in each skill — while some routes and settlement (ILR) require B2.",
    top: "CEFR B2 — about IELTS 5.5–6.0 in each skill — covers most higher requirements, including many study and settlement routes.",
    why: "Using the correct UKVI-approved test the first time avoids a rejected application; the wrong IELTS version is a common, costly mistake.",
    tip: "You must book IELTS for UKVI (not the standard IELTS) at an approved centre for visa purposes. Confirm the exact CEFR level for your route on GOV.UK.",
    faqs: [{ q: "What IELTS do I need for a UK work visa?", a: "The Skilled Worker visa needs CEFR B1 (about IELTS 4.0 each); always book IELTS for UKVI and confirm your route's level on GOV.UK." },
      { q: "Is IELTS for UKVI different from normal IELTS?", a: "Same test content, but UKVI versions are taken at approved centres and are the ones accepted for UK visas. Book the UKVI version for immigration." }] },
  { exam: "PTE", co: "the UK", flag: "🇬🇧", slug: "pte-for-uk-visa",
    sys: "PTE offers UKVI-approved tests (PTE Academic UKVI and PTE Home) accepted as Secure English Language Tests for UK visa and settlement routes.",
    min: "PTE Home A1/A2/B1 covers family and some settlement routes; the Skilled Worker visa needs CEFR B1, met by the relevant PTE level.",
    top: "PTE Academic UKVI at CEFR B2 covers study and higher visa requirements; check the exact level your route needs.",
    why: "Choosing the right PTE UKVI/Home version for your specific route prevents a refusal and the cost of re-testing.",
    tip: "Book PTE Academic UKVI or PTE Home (as required) at an approved centre. Confirm the CEFR level for your route on GOV.UK.",
    faqs: [{ q: "Does the UK accept PTE for visas?", a: "Yes — PTE Academic UKVI and PTE Home are approved Secure English Language Tests for UK visa routes. Book the version your route requires." },
      { q: "PTE Home or PTE Academic UKVI?", a: "PTE Home is for family/settlement routes (A1–B1); PTE Academic UKVI is for study and higher-level requirements. Check GOV.UK for your route." }] },
  { exam: "IELTS", co: "New Zealand", flag: "🇳🇿", slug: "ielts-for-new-zealand-pr",
    sys: "New Zealand's Skilled Migrant Category and many work-to-residence pathways require evidence of English, commonly via IELTS.",
    min: "The Skilled Migrant Category typically requires IELTS 6.5 overall (or an accepted equivalent such as PTE or TOEFL).",
    top: "A stronger overall band (7.0+) helps with competitive points and some occupational registration bodies that set higher thresholds.",
    why: "Meeting the English requirement is mandatory for residence, and a higher score smooths professional registration in fields like nursing and teaching.",
    tip: "IELTS scores are valid 2 years; New Zealand also accepts PTE Academic, TOEFL iBT and others. Confirm the current requirement with Immigration New Zealand.",
    faqs: [{ q: "What IELTS score for New Zealand residence?", a: "The Skilled Migrant Category usually requires IELTS 6.5 overall or an accepted equivalent. Confirm the current rule with Immigration New Zealand." },
      { q: "Does New Zealand accept PTE instead of IELTS?", a: "Yes — PTE Academic, TOEFL iBT and other approved tests are accepted at equivalent levels. Check Immigration New Zealand for the current list." }] },
];
/**
 * Shared depth block for the migration/registration pages — /<exam>-for-<country>-pr/,
 * /<exam>-for-<country>/, /<exam>-for-nurses-<country>/ and friends.
 *
 * These 43 pages sat at a 347-word median, the thinnest cluster left, and 20 of them
 * already rank at positions 8-27 in Search Console. Depth on a page that is already
 * on page 2 is worth more than depth on a page nobody has ever seen, which is why
 * this cluster is worth the work despite being small.
 *
 * Everything asserted here is either (a) counted from the shipped practice files, or
 * (b) a structural fact about how these score requirements work that is stated in the
 * page's own source data. No invented cut-offs, no invented processing times.
 *
 * `extra` carries whatever the calling family has: { tests, note, scheme }.
 */
function migrationDepthBlock(examName, examKey, country, extra) {
  const e = extra || {};
  const f = examKey ? examFacts(examKey) : null;
  const EX = String(examName || "").toUpperCase();
  const lib = f && f.sections.length
    ? `<p>There are <strong>${f.tests} free ${EX} practice tests</strong> on this site covering <strong>${f.questions.toLocaleString("en-IN")} questions</strong> across ${f.sections.map((s) => SECTION_LABEL(s.sec)).join(", ")} — counted from the test files themselves, not estimated. Every question is checked before release so its answer key matches an option you can actually select, and no paper can be scored well by picking the same letter throughout. <a href="/mock-test/${examKey}/">Start a full ${EX} mock test →</a></p>`
    : "";
  return `<div class="card"><h2>What decides this in practice</h2>
<p>The score tables above are the published requirement. Four things decide whether you actually meet it, and none of them are on the official page.</p>
<ul class="bcheck">
<li><strong>The requirement is per skill, not an average.</strong> This is the single most common and most expensive misreading. A requirement written as a score "in each" skill means your lowest band is your result — a strong overall average with one weak skill fails, and it fails after you have paid. Prepare to the requirement in your weakest skill and treat the others as already done.</li>
<li><strong>One retake is normal; plan the calendar for it.</strong> Because the bar is per skill, a single weak paper sends people back for a full resit. Build one spare attempt into your timeline from the start rather than discovering you need it against a deadline${e.scheme ? ` — ${esc(String(e.scheme))} timelines rarely bend for a test date` : ""}. Booking is also seasonal, and slots near popular deadlines go first.</li>
<li><strong>Take the right version of the test.</strong> ${e.tests ? esc(String(e.tests)) : `Accepted tests and versions are set by the authority, not the test provider, and the wrong version of the right test is a common and total loss.`}${e.note ? ` ${esc(String(e.note))}` : ""}</li>
<li><strong>Verify the number before you book.</strong> Requirements here are compiled for comparison and the authorities change them without notice — sometimes mid-year. Confirm the current figure on the official government or registration body's own page at the point you book the test, not at the point you start preparing. That gap is often months.</li>
</ul>
${lib}
<p class="note">Figures on this page are indicative and provided for planning. ${esc(EX)} requirements for ${esc(String(country || "this route"))} are set by the relevant authority and are the only version that counts.</p></div>`;
}

function prExamPage(c) {
  const path = `/${c.slug}/`;
  const title = `${c.exam} Score for ${c.co} PR 2026 — Requirements & Points`;
  const desc = `${c.exam} requirements for ${c.co} PR / immigration in 2026: the minimum and competitive scores, how they convert to points, and tips. Free ${c.exam} practice on LandingPrep.`;
  const kw = `${c.exam.toLowerCase()} for ${c.co.toLowerCase()} pr, ${c.exam.toLowerCase()} score ${c.co.toLowerCase()} immigration, ${c.exam.toLowerCase()} ${c.co.toLowerCase()} pr requirement 2026, ${c.co.toLowerCase()} pr english test, ${c.exam.toLowerCase()} ${c.co.toLowerCase()} visa score`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/relocate">Immigration</a> › ${c.exam} for ${c.co} PR</p>
<section class="hero">
  <div class="badges"><span class="badge">${c.flag} ${c.co} PR</span><span class="badge">${c.exam}</span><span class="badge">Free practice</span></div>
  <h1>${c.exam} Score for ${c.co} PR — Requirements &amp; Points</h1>
  <p class="lead">${c.sys}</p>
</section>
<div class="card"><h2>The minimum you need</h2><p>${c.min}</p></div>
<div class="card"><h2>The competitive (high-points) target</h2><p>${c.top}</p></div>
<div class="card"><h2>Why your score matters</h2><p>${c.why}</p></div>
<div class="card"><h2>Key tips</h2><p>${c.tip}</p></div>
<div class="card"><h2>Practice free for your ${c.exam}</h2><p>Take full-length, real-timing ${c.exam} mock tests free on LandingPrep — with instant scoring and feedback so you hit your ${c.co} PR target faster. <a href="/#/exam-prep">Start a free ${c.exam} mock test →</a></p></div>
${migrationDepthBlock(c.exam, String(c.exam || "").toLowerCase(), c.co, { note: c.tip })}
${faqBlock(c.faqs)}
${relatedGrid([
  { label: `🎯 Free ${c.exam} mock tests`, href: `/#/exam-prep` },
  { label: `✈️ Move abroad checklist`, href: `/#/relocate` },
  { label: `🔁 Score converter`, href: `/embed/` },
])}`;
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [
    faqJsonLd(c.faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Immigration", path: "/#/relocate" }, { name: `${c.exam} for ${c.co} PR`, path }]),
  ] }) + shell(inner));
}

// ── Generate everything ─────────────────────────────────────────────────────
aboutPage();
privacyPage();
termsPage();
linksPage();
embedPage();
// PR_COMBOS is generated further down, once PR_TARGETS exists to be compared against —
// see the note next to PR_TARGETS.forEach.
Object.keys(EXAMS).forEach((id) => { mockPage(id); practicePage(id); });
COUNTRY_DATA.forEach((co) => { costPage(co); SEO_FIELDS.forEach((f) => studyFieldPage(f, co)); });
// Map each top-ranked university to one "vs" comparison page, so the (already-existing)
// /compare/ pages get bidirectional internal links from the university pages too.
const UNI_VS_LINK = (() => {
  const map = {}, byC = {};
  COLLEGES.forEach((c) => { (byC[c.country] = byC[c.country] || []).push(c); });
  Object.values(byC).forEach((list) => {
    const top = list.slice().sort((a, b) => a.rank - b.rank).slice(0, 6);
    for (let i = 0; i < top.length - 1; i++) {
      const a = top[i], b = top[i + 1], link = { label: `🆚 ${a.name} vs ${b.name}`, href: `/compare/${a.id}-vs-${b.id}/` };
      if (!map[a.id]) map[a.id] = link;
      if (!map[b.id]) map[b.id] = link;
    }
  });
  return map;
})();
SOP_SAMPLES.forEach(sopSamplePage);
sopSamplesIndex();
VISA_INTERVIEWS.forEach(visaInterviewPage);
visaInterviewIndex();
// ── Linkable data-study asset: study-abroad funding facts (proof-of-funds +
//    post-study-work + loan facts) compiled from official sources + LandingPrep
//    guides. Substantive + citable + Dataset schema → built to earn backlinks. ──
function fundingFactsPage() {
  const path = `/study-abroad-funding-facts-2026/`;
  const tStyle = `width:100%;border-collapse:collapse;margin:14px 0;font-size:15px`;
  const th = `text-align:left;padding:10px 12px;border-bottom:2px solid var(--line);font-weight:700`;
  const td = `padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top`;
  // Every figure below is verified against the official authority linked in its
  // row. Correct as of the "last verified" date shown on the page. Key 2024–26
  // changes reflected: Canada's Student Direct Stream (SDS) ended Nov 2024; UK
  // maintenance amounts rose (London GBP 1,529, elsewhere GBP 1,171); the UK
  // Graduate Route drops to 18 months for applications from Jan 2027.
  const src = (url, label) => `<a href="${url}" target="_blank" rel="nofollow noopener">${label}</a>`;
  const funds = [
    ["🇩🇪 Germany", "EUR 11,904 / year (EUR 992 / month)", `Blocked account (Sperrkonto) — released to you monthly after arrival. ${src("https://www.auswaertiges-amt.de/en/sperrkonto-388600", "Federal Foreign Office ↗")}`],
    ["🇨🇦 Canada", "CAD 22,895 (plus first-year tuition)", `Proof of funds for a study permit, commonly shown via a GIC (returned to you in instalments). The Student Direct Stream ended in November 2024 — all applicants now use the regular stream. ${src("https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html", "IRCC ↗")}`],
    ["🇬🇧 UK", "GBP 1,529 / month (London) · GBP 1,171 / month (elsewhere), up to 9 months", `Maintenance funds held 28 consecutive days before you apply (UKVI). ${src("https://www.gov.uk/student-visa/money", "GOV.UK ↗")}`],
    ["🇦🇺 Australia", "AUD 29,710 / year (indicative living-cost benchmark)", `Financial capacity under the Genuine Student requirement — assessed case-by-case, no single fixed figure. ${src("https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", "Home Affairs ↗")}`],
    ["🇮🇪 Ireland", "EUR 10,000 / year", `Proof of funds shown to immigration (ISD). ${src("https://www.irishimmigration.ie/coming-to-study-in-ireland/", "Irish Immigration Service ↗")}`],
    ["🇺🇸 USA", "First-year cost of attendance (varies by university)", `Financial evidence for the Form I-20 (F-1 visa); your school verifies funds before issuing it. ${src("https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html", "US Dept of State ↗")}`],
  ];
  const work = [
    ["🇺🇸 USA", "OPT (F-1)", "12 months, plus 24 months for STEM degrees = up to 36 months"],
    ["🇨🇦 Canada", "Post-Graduation Work Permit (PGWP)", "8 months to 3 years (by programme length; a language test is required for applications since Nov 2024)"],
    ["🇦🇺 Australia", "Temporary Graduate visa (subclass 485)", "2–4 years depending on qualification"],
    ["🇳🇿 New Zealand", "Post-study work visa", "Up to 3 years"],
    ["🇬🇧 UK", "Graduate Route", "2 years (3 years for PhD) — reduces to 18 months for applications from January 2027"],
    ["🇮🇪 Ireland", "Third Level Graduate Programme", "12 months (Level 8) to 24 months (Level 9+)"],
    ["🇩🇪 Germany", "Residence permit to seek work", "18 months after graduating"],
  ];
  const fundsRows = funds.map((r) => `<tr><td style="${td}"><strong>${r[0]}</strong></td><td style="${td}">${r[1]}</td><td style="${td}">${r[2]}</td></tr>`).join("");
  const workRows = work.map((r) => `<tr><td style="${td}"><strong>${r[0]}</strong></td><td style="${td}">${r[1]}</td><td style="${td}">${r[2]}</td></tr>`).join("");
  const faqs = [
    { q: "How much money do I need to show for a student visa in 2026?", a: "It varies by country. Germany requires about EUR 11,904 per year in a blocked account; Canada about CAD 22,895 in proof of funds (commonly a GIC); the UK about GBP 1,171–1,529 per month of maintenance for up to 9 months; Australia around AUD 29,710 per year as an indicative benchmark; Ireland about EUR 10,000 per year. The USA has no fixed figure — you prove the first-year cost of attendance for your university. Always confirm the current amount with the official authority before applying." },
    { q: "Which country gives the longest post-study work visa?", a: "Canada's PGWP (up to 3 years), Australia's subclass 485 (2–4 years) and New Zealand's post-study work visa (up to 3 years) are the longest. The UK Graduate Route is 2 years (3 for a PhD) for applications up to the end of 2026, dropping to 18 months from January 2027; US OPT is 12 months plus 24 months for STEM graduates." },
    { q: "Is the German blocked account or Canadian GIC refundable?", a: "Both are your own money. A German Sperrkonto releases roughly EUR 992 to you each month once you arrive and register; the Canadian GIC is returned to you in instalments over your first year. Neither is a fee — they are proof of funds." },
    { q: "Do these funding figures change?", a: "Yes — most countries update proof-of-funds amounts every year, and exchange rates move. Treat the figures here as indicative 2026 values and confirm the exact current requirement on the official immigration website before you apply." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Funding Facts 2026</p>
<section class="hero"><div class="badges"><span class="badge">Free data study</span><span class="badge">2026</span><span class="badge">Cite freely</span></div>
<h1>Study-Abroad Funding Facts 2026: Proof of Funds &amp; Post-Study Work by Country</h1>
<p class="lead">A free, citable reference comparing how much money you must show for a student visa, and how long you can work after graduating, across the top study destinations.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> In 2026, proof-of-funds runs from about <strong>EUR 10,000/year (Ireland)</strong> and <strong>EUR 11,904 (Germany Sperrkonto)</strong> to <strong>CAD 22,895 (Canada GIC)</strong> and <strong>AUD 29,710 (Australia)</strong>. The longest post-study work rights are <strong>Canada PGWP (up to 3 years)</strong> and <strong>Australia 485 (2–4 years)</strong>. Figures are indicative — confirm with the official authority.</div>

<div class="card"><h2>Proof of funds / blocked-account requirement by country (2026)</h2>
<table style="${tStyle}"><thead><tr><th style="${th}">Country</th><th style="${th}">Amount to show</th><th style="${th}">How it works</th></tr></thead><tbody>${fundsRows}</tbody></table>
<p class="note">Amounts are living-cost / proof-of-funds figures and usually exclude tuition. Always confirm the current requirement on the official immigration website before applying.</p></div>

<div class="card"><h2>Post-study work visa duration by country (2026)</h2>
<table style="${tStyle}"><thead><tr><th style="${th}">Country</th><th style="${th}">Post-study work visa</th><th style="${th}">How long you can stay &amp; work</th></tr></thead><tbody>${workRows}</tbody></table>
<p class="note">Durations depend on your qualification level and current immigration rules. Use each <a href="/#/colleges">country guide</a> for the full step-by-step path from study to work to PR.</p></div>

<div class="card"><h2>Education-loan facts (studying abroad from India)</h2><ul class="bcheck">
<li><strong>Secured loans (with collateral):</strong> typically ~8.5–11% p.a. — the cheapest option.</li>
<li><strong>Unsecured / no-collateral loans:</strong> typically ~11–15% p.a.; the limit varies by lender, course and university.</li>
<li><strong>Moratorium:</strong> most education loans don't charge full EMIs during your course plus 6–12 months — paying the simple interest during study cuts the total a lot.</li>
<li>Model your repayment with the free <a href="/tools/education-loan-emi-calculator/">education-loan EMI calculator</a>, or read the guide to <a href="/blog/education-loan-without-collateral/">loans without collateral</a>.</li>
</ul></div>

<div class="card"><h2>Methodology &amp; sources</h2><p><strong>Last verified: ${esc(LASTMOD)}.</strong> Every figure is checked against the primary official authority linked in the tables above — the ${src("https://www.auswaertiges-amt.de/en/sperrkonto-388600", "German Federal Foreign Office")}, ${src("https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html", "IRCC (Canada)")}, ${src("https://www.gov.uk/student-visa/money", "UKVI (UK)")}, ${src("https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500", "Australian Department of Home Affairs")}, ${src("https://www.irishimmigration.ie/coming-to-study-in-ireland/", "Irish Immigration Service")} and ${src("https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html", "US Department of State")}. Requirements change every year and are set by each government, not by us — this page is a free reference, not legal advice. Confirm the exact current figure with the official authority before you apply or transfer money. You may cite this page with a link to ${ORIGIN}${path}.</p>
<p class="note"><strong>Cite this study:</strong> LandingPrep (${esc(BUILD_DATE.slice(0, 4))}). <em>Study-Abroad Funding Facts 2026: Proof of Funds &amp; Post-Study Work by Country.</em> Retrieved from ${ORIGIN}${path}</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🧮 Proof-of-funds calculator`, href: `/tools/proof-of-funds-calculator/` },
  { label: `🇩🇪 Germany blocked account guide`, href: `/blog/germany-blocked-account-2026-guide/` },
  { label: `🇨🇦 Canada GIC guide`, href: `/blog/gic-account-canada-2026-guide/` },
  { label: `🏦 Education loan EMI calculator`, href: `/tools/education-loan-emi-calculator/` },
  { label: `💰 Cost of studying abroad`, href: `/tools/cost-of-studying-abroad-calculator/` },
])}`;
  emit(path, head({
    title: `Study-Abroad Funding Facts 2026: Proof of Funds & Post-Study Work by Country | ${BRAND}`,
    desc: `Free 2026 data study: how much money to show for a student visa (Germany EUR 11,904, Canada CAD 22,895, UK, Australia, Ireland, USA) and post-study work visa length by country. Citable reference.`,
    path,
    kw: "proof of funds student visa 2026, blocked account amount by country, post study work visa by country, how much money for student visa, germany sperrkonto canada gic, study abroad funding requirements",
    jsonLdBlocks: [
      jsonld({ "@context": "https://schema.org", "@type": "Dataset", name: "Study-Abroad Funding Facts 2026", description: "Proof-of-funds requirements and post-study work visa durations for top study-abroad destinations, verified against official government sources, 2026.", isAccessibleForFree: true, creator: PUBLISHER, publisher: PUBLISHER, url: ORIGIN + path, license: "https://creativecommons.org/licenses/by/4.0/", dateModified: LASTMOD, temporalCoverage: "2026", spatialCoverage: ["Germany", "Canada", "United Kingdom", "Australia", "Ireland", "United States", "New Zealand"], variableMeasured: ["Student-visa proof-of-funds amount", "Post-study work visa duration"], creditText: "LandingPrep — Study-Abroad Funding Facts 2026", isBasedOn: ["https://www.auswaertiges-amt.de/en/sperrkonto-388600", "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/get-documents/financial-support.html", "https://www.gov.uk/student-visa/money", "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500"] }),
      faqJsonLd(faqs),
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Funding Facts 2026", path }]),
    ],
  }) + shell(inner));
}
costCalculatorPage();
cgpaToPercentagePage();
percentageToGpaPage();
ieltsOsrPage();
loanEmiPage();
proofOfFundsCalculatorPage();
greScorePercentilePage();

// ── GRE Score Percentile Calculator (official ETS interpretive data) ────────────
function greScorePercentilePage() {
  const path = `/tools/gre-score-percentile-calculator/`;
  // Official ETS GRE Interpretive Data — percentile = % of test takers scoring lower.
  // Reference group: all test takers 1 July 2022 – 30 June 2025 (used on score reports
  // through the 2025–26 reporting year). Source: ets.org/pdfs/gre/gre-guide-table-1a.pdf
  const V = {170:99,169:99,168:98,167:97,166:96,165:95,164:93,163:90,162:88,161:85,160:82,159:79,158:76,157:72,156:68,155:64,154:59,153:54,152:48,151:43,150:39,149:34,148:30,147:27,146:24,145:21,144:18,143:16,142:14,141:11,140:10,139:8,138:6,137:5,136:4,135:3,134:2,133:2,132:1,131:1,130:0};
  const Q = {170:89,169:85,168:80,167:75,166:72,165:67,164:63,163:60,162:57,161:53,160:50,159:47,158:45,157:42,156:39,155:37,154:34,153:31,152:29,151:26,150:23,149:21,148:19,147:16,146:14,145:12,144:10,143:9,142:7,141:6,140:5,139:4,138:3,137:2,136:2,135:1,134:1,133:1,132:0,131:0,130:0};
  const AW = {"6.0":99,"5.5":98,"5.0":93,"4.5":85,"4.0":63,"3.5":40,"3.0":16,"2.5":7,"2.0":3,"1.5":1,"1.0":1,"0.5":0,"0.0":0};
  const pctCell = (n) => (n > 0 ? `${n}` : "&lt;1");
  let vqRows = "";
  for (let s = 170; s >= 130; s--) vqRows += `<tr><td><strong>${s}</strong></td><td>${pctCell(V[s])}</td><td>${pctCell(Q[s])}</td></tr>`;
  const awRows = ["6.0","5.5","5.0","4.5","4.0","3.5","3.0","2.5","2.0","1.5","1.0"].map((k) => `<tr><td><strong>${k}</strong></td><td>${pctCell(AW[k])}</td></tr>`).join("");
  const faqs = [
    { q: "What is a good GRE percentile?", a: "A percentile is the share of test takers you scored above. Broadly, 90th percentile and up is excellent, around the 75th is competitive for many programmes, and the 50th is roughly average. On the current ETS data that is about Verbal 163 (90th) and Quant 166 (72nd)." },
    { q: "Why is a perfect 170 Quant only the 89th percentile?", a: "Because a large share of GRE test takers score very high on Quantitative Reasoning, so even a top 170 sits at the 89th percentile — while a 170 Verbal is the 99th. Quant percentiles run lower across the whole scale; that is normal and reflects the test-taker population, per ETS." },
    { q: "What GRE score is the 50th percentile (average)?", a: "On the current ETS reference data, about Verbal 152 (48th) to 153 (54th) and Quant 160 (50th). The mean scaled scores are roughly Verbal 151 and Quant 158." },
    { q: "How are GRE percentiles calculated?", a: "ETS reports the percentile rank as the percentage of test takers who scored lower than your score, based on everyone who tested in a recent three-year window — currently 1 July 2022 to 30 June 2025. This tool uses those official figures exactly." },
  ];
  const DATA = JSON.stringify({ V, Q, AW });
  const calc = `
<div class="card" id="lp-tool">
  <h2>📊 Your GRE percentiles</h2>
  <p class="note">Enter your official GRE scores to see the percentile rank — the % of test takers you scored above — for each measure, using the current ETS interpretive data. Fill in any or all three.</p>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
    <label>Verbal (130–170)<input id="gr_v" type="number" min="130" max="170" step="1" inputmode="numeric" placeholder="e.g. 158" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Quantitative (130–170)<input id="gr_q" type="number" min="130" max="170" step="1" inputmode="numeric" placeholder="e.g. 162" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Analytical Writing (0–6)<input id="gr_w" type="number" min="0" max="6" step="0.5" inputmode="decimal" placeholder="e.g. 4.5" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <button class="cta" id="gr_btn" type="button" style="margin-top:12px;border:0;cursor:pointer;font-size:15px">Show my percentiles</button>
  <div id="gr_out" aria-live="polite" style="margin-top:14px"></div>
</div>
<script>(function(){
  var D=${DATA};
  function g(id){return document.getElementById(id);}
  function ord(n){var s=["th","st","nd","rd"],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);}
  function row(label,tbl,key,raw){
    var p=tbl[key];
    if(p===undefined)return '<div style="margin:3px 0">'+label+' '+raw+': out of range.</div>';
    return '<div style="margin:3px 0"><strong>'+label+' '+raw+'</strong> → '+(p>0?ord(p)+' percentile':'below the 1st percentile')+'</div>';
  }
  function calc(){
    var out=g('gr_out');if(!out)return;
    var vR=g('gr_v').value,qR=g('gr_q').value,wR=g('gr_w').value;
    if(vR===''&&qR===''&&wR===''){out.innerHTML='<div class="callout"><span class="ic">✏️</span><div>Enter at least one GRE score (Verbal, Quant or Writing) to see your percentile.</div></div>';return;}
    var parts=[],bad=[];
    if(vR!==''){var v=parseInt(vR,10);if(isNaN(v)||v<130||v>170)bad.push('Verbal must be 130–170');else parts.push(row('Verbal',D.V,v,v));}
    if(qR!==''){var q=parseInt(qR,10);if(isNaN(q)||q<130||q>170)bad.push('Quant must be 130–170');else parts.push(row('Quantitative',D.Q,q,q));}
    if(wR!==''){var w=parseFloat(wR);if(isNaN(w)||w<0||w>6||Math.round(w*2)/2!==w)bad.push('Writing must be 0–6 in half-point steps');else parts.push(row('Analytical Writing',D.AW,w.toFixed(1),w.toFixed(1)));}
    if(bad.length){out.innerHTML='<div class="callout warn"><span class="ic">⚠️</span><div>'+bad.join('<br>')+'</div></div>';return;}
    out.innerHTML='<div class="callout money"><span class="ic">📊</span><div>'+parts.join('')+'<br><span style="color:var(--muted);font-size:13px">Percentile = the % of GRE test takers who scored lower, per ETS interpretive data (test takers 1 Jul 2022 – 30 Jun 2025).</span></div></div>';
  }
  var b=g('gr_btn');if(b)b.addEventListener('click',calc);
  ['gr_v','gr_q','gr_w'].forEach(function(id){var el=g(id);if(el)el.addEventListener('input',calc);});
})();</script>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › GRE Score Percentile Calculator</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">Official ETS data</span><span class="badge">No signup</span></div>
<h1>GRE Score Percentile Calculator (2026)</h1>
<p class="lead">Turn your GRE Verbal, Quantitative and Analytical Writing scores into official percentile ranks — instantly, using the current ETS interpretive data.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> A GRE percentile is the % of test takers you scored above. On the current ETS data, Verbal 170 = 99th and Quant 170 = 89th percentile; the average is about Verbal 151 and Quant 158. Quant percentiles run lower than Verbal because the test-taker pool is quantitatively strong. Enter your scores below for the exact figure.</div>
${calc}
<div class="card"><h2>GRE Verbal &amp; Quantitative percentile table (130–170)</h2>
<p class="note">Percentile rank = the percentage of test takers who scored lower than that scaled score. Based on all individuals who tested 1 July 2022 – 30 June 2025 (used on score reports through 2025–26).</p>
<table style="width:100%;border-collapse:collapse" class="uni-table"><thead><tr><th>Scaled score</th><th>Verbal percentile</th><th>Quant percentile</th></tr></thead><tbody>${vqRows}</tbody></table></div>
<div class="card"><h2>GRE Analytical Writing percentile table</h2>
<table style="width:100%;border-collapse:collapse" class="uni-table"><thead><tr><th>Writing score</th><th>Percentile</th></tr></thead><tbody>${awRows}</tbody></table>
<p class="note">Source: <a href="https://www.ets.org/pdfs/gre/gre-guide-table-1a.pdf" target="_blank" rel="nofollow noopener">ETS GRE General Test Interpretive Data</a>. Percentiles are updated periodically by ETS — always confirm the current figures on your official score report.</p></div>
<div class="card"><h2>How to read your GRE percentiles</h2><ul class="bcheck">
<li><strong>Percentile, not raw score, is what admissions compares</strong> — a 160 Verbal (82nd) is stronger than a 160 Quant (50th), even though the scaled score is identical.</li>
<li><strong>Quant runs lower across the whole scale</strong> — the GRE population is quantitatively strong, so a perfect 170 Quant is the 89th percentile while a 170 Verbal is the 99th.</li>
<li><strong>Target the percentile your programme expects</strong> — competitive programmes often look for ~75th percentile and up in the measure most relevant to the field (Quant for STEM/quant, Verbal for humanities).</li>
<li><strong>Analytical Writing matters at the margins</strong> — a 4.5 is the 85th percentile; many programmes want 4.0+ (63rd) for coursework that is writing-heavy.</li>
</ul></div>
${faqBlock(faqs)}
${affiliateBlock(["amazon-gre", "amazon-gmat"], "Prep books (optional)")}
${relatedGrid([
  { label: `🧠 GRE Smart Notes — visual lessons & recall`, href: `/learn/gre/` },
  { label: `📝 Free GRE mock test`, href: `/mock-test/gre/` },
  { label: `🔄 GMAT ↔ GRE & score tools`, href: `/tools/english-test-score-converter/` },
  { label: `🌍 Score requirements by country`, href: `/eligibility/` },
  { label: `🎓 Free College Predictor`, href: `/#/colleges` },
])}`;
  emit(path, head({ title: `GRE Score Percentile Calculator 2026 — Verbal, Quant & Writing | ${BRAND}`, desc: `Free GRE percentile calculator using official ETS data: convert your Verbal, Quantitative and Analytical Writing scores to percentile ranks, plus the full 130–170 percentile table.`, path, kw: "gre percentile calculator, gre score percentile, gre verbal percentile, gre quant percentile, what percentile is my gre score, gre percentile chart, good gre score percentile", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "GRE Score Percentile Calculator", description: "Convert GRE Verbal, Quantitative and Analytical Writing scores to official ETS percentile ranks.", applicationCategory: "EducationApplication", operatingSystem: "Any browser", browserRequirements: "Requires JavaScript", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "GRE Score Percentile Calculator", path }]),
  ] }) + shell(inner));
}
readinessPage();

// ── Study in Germany — PILLAR hub. Broad, substantive guide that interlinks the
// existing Germany "spoke" pages (blocked account, free universities, opportunity
// card, cost, scholarships, intakes, MS programmes) into one topical cluster.
// Non-duplicative: it covers the whole journey; the spokes cover the specifics. ──
function germanyPillarPage() {
  const path = `/study-in-germany/`;
  const faqs = [
    { q: "Is studying in Germany really free for international students?", a: "At public universities, tuition is free or near-free for everyone, including international students — you usually pay only a semester contribution of about EUR 150–350 (which often includes a public-transport pass). The main exception is the state of Baden-Württemberg, which charges non-EU students about EUR 1,500 per semester. Private universities charge full tuition. You still need to cover living costs (about EUR 992/month)." },
    { q: "How much money do I need to show for a German student visa?", a: "About EUR 11,904 for the year, deposited in a blocked account (Sperrkonto), which releases roughly EUR 992 to you each month after you arrive. Use the free proof-of-funds calculator for your exact total, and see the blocked-account guide for how to open one." },
    { q: "Can I work while studying in Germany?", a: "Yes. International students can work up to 140 full days or 280 half days per year (recently expanded), alongside their studies. A part-time job helps with living costs but should not be your main funding source for the visa." },
    { q: "Can I stay and work in Germany after I graduate?", a: "Yes. After graduating you can apply for an 18-month residence permit to look for a job related to your degree. Once you have a qualifying job you can move to a work permit or the EU Blue Card, which is a fast route to permanent residence (a settlement permit) in Germany." },
    { q: "Do Indian students need an APS certificate for Germany?", a: "Yes. Since late 2022, Indian students must obtain an APS certificate (academic verification) before applying for a student visa. Factor the APS timeline into your application planning." },
    { q: "When should I apply to study in Germany?", a: "Germany has two intakes: the Winter intake (starts October, the main one with the most courses) and the Summer intake (starts April). Apply 6–9 months ahead — winter deadlines are often around May–July, summer around November–January. Many applications go through uni-assist." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Study in Germany</p>
<section class="hero"><div class="badges"><span class="badge">Complete guide</span><span class="badge">2026</span><span class="badge">Free public universities</span></div>
<h1>Study in Germany 2026: The Complete Guide for International Students</h1>
<p class="lead">Germany offers world-class, tuition-free public universities, a low cost of living, strong post-study work rights and a clear path to permanent residence. This guide walks the whole journey — universities, admission, the blocked account, the student visa, working while you study and staying on after graduation — and links the detailed step-by-step resources for each stage.</p>
<a class="cta" href="/tools/proof-of-funds-calculator/">▶ Calculate your German proof of funds (free)</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Public universities in Germany are tuition-free (you pay only a ~EUR 150–350/semester contribution); you need about <strong>EUR 11,904</strong> in a blocked account for the student visa; Indian students need an <strong>APS certificate</strong>; the main intake is <strong>Winter (October)</strong>; and after graduating you get an <strong>18-month permit to find work</strong>, leading to the EU Blue Card and permanent residence.</div>

<div class="card"><h2>Why study in Germany?</h2>
<ul class="bcheck">
<li><strong>Tuition-free public universities.</strong> Most public universities charge no tuition to any student, international included — only a small semester contribution. See <a href="/blog/study-in-germany-for-free-2026/">how to study in Germany for free</a> and <a href="/blog/study-germany-english-free-universities/">free English-taught universities</a>.</li>
<li><strong>Globally ranked, engineering &amp; research strength.</strong> TU Munich, RWTH Aachen, Heidelberg, LMU Munich and others rank among the world's best, especially for engineering, computer science and the sciences.</li>
<li><strong>Low cost of living</strong> relative to the UK/US/Australia, and a strong student-job market.</li>
<li><strong>Clear stay-back and PR path</strong> — an 18-month job-seeking permit, the EU Blue Card, and a settlement permit within a few years.</li>
</ul></div>

<div class="card"><h2>What it costs (tuition + living)</h2>
<p>Public-university <strong>tuition is free or near-free</strong> — you pay a semester contribution of roughly <strong>EUR 150–350</strong>, which often includes a regional public-transport ticket. The one notable exception is <strong>Baden-Württemberg</strong> (Stuttgart, Heidelberg, Karlsruhe…), which charges non-EU students about <strong>EUR 1,500/semester</strong>. Private universities charge full tuition.</p>
<p>Living costs run about <strong>EUR 992/month (EUR 11,904/year)</strong> — the same figure you must show for the visa. Big cities like Munich cost more; smaller towns cost less. Model your full budget with the free <a href="/tools/cost-of-studying-abroad-calculator/">cost-of-studying-abroad calculator</a>, and see the <a href="/study-abroad/cost-of-studying-in-germany/">Germany cost breakdown</a>.</p></div>

<div class="card"><h2>Admission &amp; requirements</h2>
<ul class="bcheck">
<li><strong>Academic:</strong> a recognised school-leaving/bachelor qualification for your level. Many programmes require a Studienkolleg (foundation year) if your qualification isn't directly equivalent.</li>
<li><strong>APS certificate (Indian students):</strong> mandatory academic verification you must complete before the visa — start it early.</li>
<li><strong>English proficiency</strong> for English-taught programmes: typically IELTS 6.5+ or TOEFL 80–90+. Check and practise with <a href="/ielts-for-germany/">IELTS for Germany</a> and a <a href="/mock-test/ielts/">free IELTS mock test</a> or <a href="/mock-test/toefl/">TOEFL mock test</a>.</li>
<li><strong>German proficiency</strong> (for German-taught programmes): usually TestDaF or DSH at B2–C1.</li>
<li><strong>Applications</strong> are often submitted through <strong>uni-assist</strong> (a central portal) or directly to the university.</li>
</ul></div>

<div class="card"><h2>Money: the blocked account (Sperrkonto)</h2>
<p>For the student visa you must prove about <strong>EUR 11,904</strong> for one year, held in a <strong>blocked account</strong> that releases roughly <strong>EUR 992 to you each month</strong> after you arrive and register. It is your own money, not a fee. Full walkthrough: the <a href="/blog/germany-blocked-account-2026-guide/">Germany blocked account (Sperrkonto) guide</a>. Work out your exact proof-of-funds total with the <a href="/tools/proof-of-funds-calculator/">proof-of-funds calculator</a>, and compare Germany with other destinations in the <a href="/study-abroad-funding-facts-2026/">2026 funding facts</a>.</p></div>

<div class="card"><h2>The student visa &amp; timeline</h2>
<p>Germany has two intakes: <strong>Winter (starts October)</strong> — the main intake with the most courses — and <strong>Summer (starts April)</strong>. Apply <strong>6–9 months ahead</strong>. A rough sequence: shortlist universities → sit IELTS/TOEFL and (for Indians) complete APS → apply via uni-assist → receive admission → open the blocked account → book the national (D-type) student-visa appointment → arrive, register (Anmeldung) and enrol. See <a href="/intakes/germany/">Germany intakes &amp; deadlines</a> and rehearse your interview with the <a href="/#/colleges">visa-interview coach</a>.</p></div>

<div class="card"><h2>Working while you study</h2>
<p>International students can work up to <strong>140 full days (or 280 half days) per year</strong> alongside studies — recently expanded — which helps with living costs. Student jobs (Werkstudent roles, research assistant/HiWi positions) are common and can be relevant to your field. Keep work within the legal limit and treat it as a supplement, not your visa funding.</p></div>

<div class="card"><h2>After graduation: work &amp; permanent residence</h2>
<ul class="bcheck">
<li><strong>18-month job-seeking permit:</strong> after graduating you can stay up to 18 months to find work related to your degree.</li>
<li><strong>EU Blue Card:</strong> with a qualifying graduate-level job and salary, the Blue Card is a fast track — it can lead to a <strong>settlement permit (permanent residence)</strong> within roughly 2–3 years (sooner with strong German).</li>
<li><strong>Opportunity Card (Chancenkarte):</strong> a points-based route (launched 2024) that lets qualified people come to look for work. See the <a href="/blog/germany-opportunity-card-2026/">Germany Opportunity Card guide</a>.</li>
</ul>
<p class="note">Immigration rules and salary thresholds change — always confirm the current details on the official <a href="https://www.make-it-in-germany.com/en/" target="_blank" rel="nofollow noopener">Make it in Germany ↗</a> portal before you rely on them.</p></div>

<div class="card"><h2>Scholarships &amp; funding</h2>
<p>Even with free tuition, scholarships help with living costs. <strong>DAAD</strong> is the largest provider, alongside the Deutschlandstipendium and university/foundation awards. Browse <a href="/scholarships/study-in-germany/">scholarships to study in Germany</a> and the wider <a href="/fully-funded-scholarships/">fully-funded scholarships database</a>. If you need a loan, model repayments with the <a href="/tools/education-loan-emi-calculator/">education-loan EMI calculator</a>.</p></div>

<div class="card"><h2>Popular Master's programmes in Germany</h2>
<p>Germany is especially strong for STEM and business Master's:
<a href="/study-abroad/ms-computer-science-in-germany/">MS Computer Science</a> ·
<a href="/study-abroad/ms-data-science-in-germany/">MS Data Science</a> ·
<a href="/study-abroad/ms-engineering-in-germany/">MS Engineering</a> ·
<a href="/study-abroad/ms-business-analytics-in-germany/">MS Business Analytics</a> ·
<a href="/study-abroad/mba-in-germany/">MBA</a>.</p>
<p class="note"><strong>Last verified:</strong> ${esc(LASTMOD)}. Figures (tuition contributions, blocked-account amount, work limits, post-study permits) are checked against official German sources and change over time — confirm the current details with your university and the German mission before you apply.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🧮 Proof-of-funds calculator`, href: `/tools/proof-of-funds-calculator/` },
  { label: `🏦 Germany blocked account guide`, href: `/blog/germany-blocked-account-2026-guide/` },
  { label: `🎓 Study in Germany for free`, href: `/blog/study-in-germany-for-free-2026/` },
  { label: `💸 Germany scholarships`, href: `/scholarships/study-in-germany/` },
  { label: `📅 Germany intakes & deadlines`, href: `/intakes/germany/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
])}`;
  emit(path, head({
    title: `Study in Germany 2026: Complete Guide for International Students | ${BRAND}`,
    desc: `Free complete guide to studying in Germany 2026: tuition-free public universities, admission & APS, the EUR 11,904 blocked account, student visa, working while studying, and the post-study 18-month permit to PR. Free tools included.`,
    path,
    kw: "study in germany, study in germany for international students, study in germany for free, germany student visa 2026, germany blocked account amount, study in germany from india, aps certificate germany, germany post study work visa, ms in germany, cost of studying in germany",
    jsonLdBlocks: [
      jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Study in Germany 2026: The Complete Guide for International Students", description: "Universities, admission, blocked account, student visa, working while studying and post-study work in Germany, 2026.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
      jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
      faqJsonLd(faqs),
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Study in Germany", path }]),
    ],
  }) + shell(inner));
}
germanyPillarPage();

// ── Study in Switzerland — PILLAR hub. Hook: world top-15 universities (ETH #7,
// EPFL #14) at near-free public tuition (~CHF 1,500/yr), with an HONEST counter-
// weight (high living costs, competitive non-EU work quotas, slow PR). Interlinks
// only pages that already exist (top-universities-in-switzerland, ielts/toefl-for-ethz,
// university/ethz + epfl, the calculators, funding facts). Figures are ranges. ──
function switzerlandPillarPage() {
  const path = `/study-in-switzerland/`;
  const faqs = [
    { q: "Is studying in Switzerland expensive?", a: "It's a study-abroad paradox: tuition is remarkably low but living is not. Public universities charge everyone — including international students — very little (ETH Zurich and EPFL are about CHF 1,460 per year; most other public universities are roughly CHF 1,000–4,000 per year). The real cost is living: budget about CHF 22,000–27,000 per year (roughly CHF 1,800–2,200 a month), higher in Zurich and Geneva. So the tuition rivals Germany's, but you need a bigger living budget." },
    { q: "How much money do I need to show for a Swiss student visa?", a: "Non-EU students must prove they can cover living costs — commonly around CHF 21,000 for the year — but the exact figure and format are set by the cantonal migration office you apply through, so it varies by canton. This is your own money to live on, not a fee. Model your full budget with the free cost-of-studying-abroad calculator and always confirm the current amount with the relevant Swiss cantonal authority." },
    { q: "Can I study in Switzerland in English?", a: "Most Master's programmes at ETH Zurich and EPFL, and many Master's elsewhere, are taught entirely in English (typically requiring IELTS 6.5–7.0 or equivalent). Bachelor's programmes are usually taught in the local language — German, French or Italian depending on the region — so English-taught options are far more common at postgraduate level." },
    { q: "Can I work while studying in Switzerland?", a: "Yes, but with real limits. Non-EU/EFTA students may work a maximum of 15 hours per week during term (full-time in holidays), and — importantly — you are generally only permitted to start working six months after you arrive. Treat a part-time job as a supplement to your living budget, never as your visa funding." },
    { q: "Can I stay and work in Switzerland after I graduate?", a: "Non-EU graduates of a Swiss university get a six-month residence permit to look for a job related to their studies. If you find qualifying work, you can convert to a work permit — but Switzerland applies annual quotas to non-EU workers, so it is competitive. Permanent residence (a C permit) generally takes about ten years of residence, so Switzerland is a strong career destination but not a fast PR route." },
    { q: "When should I apply to study in Switzerland?", a: "The main intake is Autumn (September), with some Master's also offering a Spring (February) start. Apply about 6–9 months ahead — many Autumn deadlines fall between December and April of the same year. Then allow 8–12 weeks for the national (D) visa and cantonal residence-permit process after you receive admission." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Study in Switzerland</p>
<section class="hero"><div class="badges"><span class="badge">Complete guide</span><span class="badge">2026</span><span class="badge">Near-free tuition</span><span class="badge">World top-15 unis</span></div>
<h1>Study in Switzerland 2026: The Complete Guide for International Students</h1>
<p class="lead">Switzerland offers a rare combination — universities ranked among the world's very best (ETH Zurich is 7th, EPFL 14th) at near-free public tuition, roughly CHF 1,500 a year. The trade-off is a high cost of living and a competitive, quota-limited job market for non-EU graduates. This guide walks the whole journey honestly: universities, English-taught admission, what it really costs, the student visa, working while you study, and your realistic options after graduation.</p>
<a class="cta" href="/study-abroad/top-universities-in-switzerland/">▶ See the top universities in Switzerland</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Public-university tuition in Switzerland is very low for everyone (<strong>ETH Zurich &amp; EPFL ≈ CHF 1,460/yr</strong>); the real cost is <strong>living (≈ CHF 22,000–27,000/yr)</strong>; most Master's at ETH/EPFL are <strong>English-taught</strong> (IELTS 6.5–7.0); the main intake is <strong>Autumn (September)</strong>; you can work <strong>15 hrs/week</strong> (only after 6 months); and graduates get a <strong>6-month permit to find work</strong>, though non-EU work quotas make it competitive.</div>

<div class="card"><h2>Why study in Switzerland?</h2>
<ul class="bcheck">
<li><strong>World-elite universities at near-free tuition.</strong> <a href="/university/ethz/">ETH Zurich</a> (world #7) and <a href="/university/epfl/">EPFL</a> (#14) charge international students only about CHF 1,460 a year — among the best value-for-quality in the world. See the full list of <a href="/study-abroad/top-universities-in-switzerland/">top universities in Switzerland</a>.</li>
<li><strong>Global strength in science, engineering &amp; tech.</strong> Switzerland is a research powerhouse — especially computer science, robotics, engineering and the life sciences — with deep links to industry (pharma, finance, deep tech).</li>
<li><strong>English-taught Master's</strong> are widely available at postgraduate level, so you don't necessarily need German or French to study there.</li>
<li><strong>High quality of life &amp; strong graduate salaries</strong> — Switzerland consistently ranks among the world's best for safety, healthcare and earnings.</li>
</ul></div>

<div class="card"><h2>What it costs (the honest trade-off)</h2>
<p>Switzerland is the study-abroad paradox: <strong>tuition is low, living is high.</strong> Public-university tuition is roughly <strong>CHF 1,000–4,000 per year</strong> for international students (ETH Zurich and EPFL are about <strong>CHF 1,460/yr</strong>; a few universities charge non-residents somewhat more). That rivals Germany's near-free model.</p>
<p>The real budget line is <strong>living costs: about CHF 22,000–27,000 per year</strong> (roughly CHF 1,800–2,200/month), higher in Zurich and Geneva. That is more than most European destinations, so plan carefully. Model your full budget with the free <a href="/tools/cost-of-studying-abroad-calculator/">cost-of-studying-abroad calculator</a>, and compare Switzerland against other destinations in the <a href="/study-abroad-funding-facts-2026/">2026 funding facts</a>.</p></div>

<div class="card"><h2>Admission &amp; requirements</h2>
<ul class="bcheck">
<li><strong>Academic:</strong> a recognised bachelor's degree (for Master's) with a strong record — ETH Zurich and EPFL are highly selective and expect a solid quantitative background.</li>
<li><strong>Language of instruction:</strong> most <strong>Master's at ETH/EPFL and many elsewhere are English-taught</strong>; bachelor's programmes are usually in German, French or Italian depending on the region.</li>
<li><strong>English proficiency:</strong> typically <strong>IELTS 6.5–7.0</strong> or TOEFL ~90–100 for English-taught programmes. Check the exact bar and practise with <a href="/ielts-for-ethz/">IELTS for ETH Zurich</a>, <a href="/toefl-for-ethz/">TOEFL for ETH Zurich</a>, and a free <a href="/mock-test/ielts/">IELTS mock test</a> or <a href="/mock-test/toefl/">TOEFL mock test</a>.</li>
<li><strong>GRE:</strong> often <em>not required</em> at ETH Zurich for many Master's, and recommended (not always mandatory) at EPFL — always check the specific programme page.</li>
<li><strong>Applications</strong> go directly to each university, usually with a small application fee (about CHF 100–150).</li>
</ul></div>

<div class="card"><h2>Money &amp; the student visa</h2>
<p>Non-EU/EFTA students need a <strong>national (D) visa</strong> to enter, then apply for a <strong>residence permit (B permit)</strong> at the <strong>cantonal migration office</strong> after arriving. As part of the application you must prove you can support yourself — commonly around <strong>CHF 21,000 for the year</strong>, though the exact figure and format are <strong>set by each canton</strong>. Work out your target total with the free <a href="/tools/proof-of-funds-calculator/">proof-of-funds calculator</a>. Allow <strong>8–12 weeks</strong> for the visa and permit process, so apply as soon as you have your admission letter.</p></div>

<div class="card"><h2>Working while you study</h2>
<p>Non-EU/EFTA students may work a <strong>maximum of 15 hours per week during term</strong> (and full-time during holidays). One rule catches many students out: you are generally <strong>only allowed to start working six months after you arrive</strong>. So budget for your first semester without job income, and treat part-time work as a top-up — not your visa funding.</p></div>

<div class="card"><h2>After graduation: work &amp; residence (realistic view)</h2>
<ul class="bcheck">
<li><strong>6-month job-search permit:</strong> after graduating from a Swiss university, non-EU graduates can stay up to six months to find work related to their degree.</li>
<li><strong>Work permit, but with quotas:</strong> Switzerland caps the number of non-EU/EFTA work permits each year, so converting to a work permit is <strong>competitive</strong> — strong, in-demand skills (tech, engineering, finance) help most.</li>
<li><strong>Permanent residence is a long road:</strong> a C settlement permit generally takes <strong>about ten years</strong> of residence (sometimes less for certain nationalities). Switzerland is an outstanding career and salary destination, but <strong>not a fast-PR one</strong> like Canada or Germany — plan accordingly.</li>
</ul>
<p class="note">Immigration rules, quotas and cantonal amounts change — always confirm the current details on the official <a href="https://www.sem.admin.ch/sem/en/home.html" target="_blank" rel="nofollow noopener">State Secretariat for Migration (SEM) ↗</a> and your cantonal migration office before you rely on them.</p></div>

<div class="card"><h2>Scholarships &amp; funding</h2>
<p>Because tuition is already low, funding mainly targets living costs. The big names are the <strong>ETH Excellence Scholarship (ESOP)</strong> and <strong>EPFL Excellence Fellowships</strong> (competitive, partial-to-full support for outstanding Master's applicants), plus the <strong>Swiss Government Excellence Scholarships (ESKAS)</strong> for research and PhD study. Browse the wider <a href="/fully-funded-scholarships/">fully-funded scholarships database</a>, and if you need a loan, model repayments with the <a href="/tools/education-loan-emi-calculator/">education-loan EMI calculator</a>.</p>
<p class="note"><strong>Last verified:</strong> ${esc(LASTMOD)}. Figures (tuition, living costs, cantonal proof-of-funds amounts, work limits and post-study permits) are checked against official Swiss sources and change over time — confirm the current details with your university and the relevant Swiss cantonal authority before you apply.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🎓 Top universities in Switzerland`, href: `/study-abroad/top-universities-in-switzerland/` },
  { label: `🏛️ ETH Zurich profile`, href: `/university/ethz/` },
  { label: `🏛️ EPFL profile`, href: `/university/epfl/` },
  { label: `🧮 Cost-of-studying calculator`, href: `/tools/cost-of-studying-abroad-calculator/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
  { label: `📝 IELTS for ETH Zurich`, href: `/ielts-for-ethz/` },
])}`;
  emit(path, head({
    title: `Study in Switzerland 2026: Complete Guide for International Students | ${BRAND}`,
    desc: `Honest complete guide to studying in Switzerland 2026: near-free public tuition at world-top ETH Zurich & EPFL, English-taught Master's, real living costs (CHF 22–27k/yr), the student visa, working while studying and realistic post-study work options. Free tools included.`,
    path,
    kw: "study in switzerland, study in switzerland for international students, study in switzerland for free, switzerland student visa 2026, cost of studying in switzerland, study in switzerland from india, eth zurich admission, epfl admission, masters in switzerland in english, switzerland post study work",
    jsonLdBlocks: [
      jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Study in Switzerland 2026: The Complete Guide for International Students", description: "Universities, English-taught admission, real costs, student visa, working while studying and post-study work in Switzerland, 2026.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-08-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
      jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
      faqJsonLd(faqs),
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Study in Switzerland", path }]),
    ],
  }) + shell(inner));
}
switzerlandPillarPage();

// ── Study in Sweden — PILLAR hub. Honest framing: non-EU students DO pay tuition
// (free myth busted), but strong English-taught Master's, a clear 12-month post-
// study job-search permit and a real PR path. Figures verified vs Migrationsverket
// (SEK 10,314/month maintenance, 2026). Interlinks only existing spokes. ──
function swedenPillarPage() {
  const path = `/study-in-sweden/`;
  const faqs = [
    { q: "Is studying in Sweden free for international students?", a: "No — this is a common myth. Sweden was tuition-free until 2011, but since then non-EU/EEA students pay tuition, typically about SEK 140,000–310,000 per year for most Master's programmes (engineering and tech at the higher end). Students from the EU/EEA and Switzerland still study free. There are, however, strong scholarships (notably the Swedish Institute Scholarships) that can cover tuition and living costs." },
    { q: "How much money do I need to show for a Swedish student residence permit?", a: "For 2026 the Swedish Migration Agency requires you to show about SEK 10,314 per month for the length of your studies, to cover living costs. The amount can be reduced if your accommodation or food is provided free. You apply for a residence permit for studies (not a visa sticker) through Migrationsverket, and you normally need to have paid your first tuition instalment first." },
    { q: "Can I study in Sweden in English?", a: "Yes, very widely at Master's level — Sweden has one of Europe's largest ranges of English-taught Master's programmes, so you generally don't need Swedish to study there. A typical English requirement is IELTS 6.5 (with no band below 5.5) or equivalent. Bachelor's programmes are more often taught in Swedish." },
    { q: "Can I work while studying in Sweden?", a: "Yes. Unusually, Sweden sets no fixed legal cap on how many hours international students may work during their studies — but your studies must remain your main activity, and full-time study is demanding, so treat any job as a supplement. A part-time job also helps you build local experience and language skills." },
    { q: "Can I stay and work in Sweden after I graduate?", a: "Yes. After completing a bachelor's or master's you can apply for a residence permit of up to 12 months to look for work or start a business in Sweden. If you find qualifying employment you move to a work permit, and holding a work permit for a few years opens a clear route to permanent residence — one of the more straightforward PR paths in Europe." },
    { q: "When should I apply to study in Sweden?", a: "The main intake is Autumn (starts late August), with applications through the central portal universityadmissions.se opening around mid-October and closing around mid-January for the following autumn. A smaller Spring intake (January start) exists for some programmes. There is a one-time application fee of about SEK 900 (waived for scholarship holders and EU/EEA students)." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Study in Sweden</p>
<section class="hero"><div class="badges"><span class="badge">Complete guide</span><span class="badge">2026</span><span class="badge">English-taught Master's</span><span class="badge">Clear PR path</span></div>
<h1>Study in Sweden 2026: The Complete Guide for International Students</h1>
<p class="lead">Sweden offers one of Europe's widest ranges of English-taught Master's, strong engineering and tech universities, generous scholarships, a 12-month post-study job-search permit and a genuinely clear route to permanent residence. The honest catch: since 2011, non-EU students pay tuition, and living costs are moderate-to-high. This guide walks the whole journey — universities, admission, the residence permit, working, and staying on after graduation.</p>
<a class="cta" href="/study-abroad/top-universities-in-sweden/">▶ See the top universities in Sweden</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Non-EU students pay tuition (<strong>≈ SEK 140,000–310,000/yr</strong> for most Master's); you must show about <strong>SEK 10,314/month</strong> for the study residence permit; most Master's are <strong>English-taught</strong> (IELTS 6.5); apply via <strong>universityadmissions.se</strong> for the <strong>Autumn (August)</strong> intake; and after graduating you get a <strong>12-month permit</strong> to find work, leading to a clear PR path.</div>

<div class="card"><h2>Why study in Sweden?</h2>
<ul class="bcheck">
<li><strong>Huge choice of English-taught Master's.</strong> You rarely need Swedish at postgraduate level, which makes Sweden very accessible for international students.</li>
<li><strong>World-class engineering, tech &amp; innovation.</strong> <a href="/university/kth/">KTH Royal Institute of Technology</a>, <a href="/university/lund/">Lund University</a> and <a href="/university/chalmers/">Chalmers</a> are globally ranked, with deep industry links (Ericsson, Spotify, Volvo). See all <a href="/study-abroad/top-universities-in-sweden/">top universities in Sweden</a>.</li>
<li><strong>Clear post-study &amp; PR pathway</strong> — a 12-month job-search permit, then a work permit, then permanent residence within a few years.</li>
<li><strong>High quality of life</strong> — strong work-life balance, sustainability, and near-universal English fluency.</li>
</ul></div>

<div class="card"><h2>What it costs (tuition myth busted)</h2>
<p>The biggest misconception is that Sweden is free. It was tuition-free until 2011, but <strong>non-EU/EEA students now pay tuition</strong> — typically <strong>SEK 140,000–310,000 per year</strong> for most Master's (engineering and computer science at the higher end; business and social sciences often lower). EU/EEA and Swiss students still study free.</p>
<p>Living costs run about <strong>SEK 9,000–12,000 per month</strong>, higher in Stockholm. Model your full budget with the free <a href="/tools/cost-of-studying-abroad-calculator/">cost-of-studying-abroad calculator</a>, and compare Sweden with other destinations in the <a href="/study-abroad-funding-facts-2026/">2026 funding facts</a>. Good news: scholarships are strong (see below).</p></div>

<div class="card"><h2>Admission &amp; requirements</h2>
<ul class="bcheck">
<li><strong>Academic:</strong> a recognised bachelor's degree for Master's entry, with relevant background for the programme.</li>
<li><strong>English proficiency:</strong> typically <strong>IELTS 6.5</strong> (no band below 5.5) or TOEFL ~90. Check the exact bar and practise with <a href="/ielts-for-kth/">IELTS for KTH</a>, <a href="/toefl-for-kth/">TOEFL for KTH</a>, and a free <a href="/mock-test/ielts/">IELTS mock test</a> or <a href="/mock-test/toefl/">TOEFL mock test</a>.</li>
<li><strong>GRE:</strong> generally <em>not required</em> at Swedish universities — a nice cost saving.</li>
<li><strong>Applications</strong> go through the central portal <strong>universityadmissions.se</strong> — one application can list up to four programmes, with a single SEK 900 fee.</li>
</ul></div>

<div class="card"><h2>Money &amp; the student residence permit</h2>
<p>Non-EU/EEA students apply for a <strong>residence permit for studies</strong> (not a visa sticker) through the <strong>Swedish Migration Agency (Migrationsverket)</strong>. You must show funds of about <strong>SEK 10,314 per month (2026)</strong> for the whole study period, and normally prove your <strong>first tuition instalment is paid</strong> and that you have comprehensive health insurance. Work out your target total with the free <a href="/tools/proof-of-funds-calculator/">proof-of-funds calculator</a>. Apply as soon as you are admitted — processing can take several weeks to a few months.</p></div>

<div class="card"><h2>Working while you study</h2>
<p>Sweden is unusual: there is <strong>no fixed legal limit</strong> on how many hours international students may work during their studies. That said, <strong>full-time study must remain your main activity</strong>, and Swedish Master's are intensive — so treat part-time work as a supplement, useful mainly for local experience and living costs, not as your funding plan.</p></div>

<div class="card"><h2>After graduation: work &amp; permanent residence</h2>
<ul class="bcheck">
<li><strong>12-month job-search permit:</strong> after a bachelor's or master's you can stay up to 12 months to look for work or start a business (doctoral graduates can get up to 18 months).</li>
<li><strong>Work permit → PR:</strong> with qualifying employment you move to a work permit; holding one for a few years (while meeting the self-support requirement) opens a clear route to <strong>permanent residence</strong>.</li>
<li><strong>In-demand fields help most</strong> — tech, engineering and data roles are strong in Sweden's job market.</li>
</ul>
<p class="note">Immigration rules and amounts change — always confirm the current details on the official <a href="https://www.migrationsverket.se/en.html" target="_blank" rel="nofollow noopener">Swedish Migration Agency (Migrationsverket) ↗</a> before you rely on them.</p></div>

<div class="card"><h2>Scholarships &amp; funding</h2>
<p>Because non-EU students pay tuition, scholarships matter. The flagship is the <strong>Swedish Institute Scholarships for Global Professionals (SISGP)</strong> — highly competitive, covering tuition <em>and</em> living costs — alongside university-specific awards at <a href="/university/kth/">KTH</a>, <a href="/university/lund/">Lund</a> and <a href="/university/chalmers/">Chalmers</a>. Browse <a href="/scholarships-in-sweden/">scholarships to study in Sweden</a> and the wider <a href="/fully-funded-scholarships/">fully-funded scholarships database</a>. If you need a loan, model repayments with the <a href="/tools/education-loan-emi-calculator/">education-loan EMI calculator</a>.</p></div>

<div class="card"><h2>Popular Master's in Sweden</h2>
<p>Sweden is especially strong for STEM Master's:
<a href="/study-abroad/ms-computer-science-in-sweden/">MS Computer Science</a> ·
<a href="/study-abroad/ms-data-science-in-sweden/">MS Data Science</a> ·
<a href="/study-abroad/mba-in-sweden/">MBA</a>.</p>
<p class="note"><strong>Last verified:</strong> ${esc(LASTMOD)}. Figures (tuition ranges, the SEK 10,314/month maintenance amount, work rules and post-study permits) are checked against official Swedish sources and change over time — confirm the current details with your university and Migrationsverket before you apply.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🎓 Top universities in Sweden`, href: `/study-abroad/top-universities-in-sweden/` },
  { label: `💸 Scholarships in Sweden`, href: `/scholarships-in-sweden/` },
  { label: `💻 MS Computer Science in Sweden`, href: `/study-abroad/ms-computer-science-in-sweden/` },
  { label: `🧮 Cost-of-studying calculator`, href: `/tools/cost-of-studying-abroad-calculator/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
  { label: `📝 IELTS for KTH`, href: `/ielts-for-kth/` },
])}`;
  emit(path, head({
    title: `Study in Sweden 2026: Complete Guide for International Students | ${BRAND}`,
    desc: `Honest complete guide to studying in Sweden 2026: English-taught Master's, real tuition for non-EU students, the SEK 10,314/month residence-permit requirement, working while studying, and the 12-month post-study job-search permit to PR. Free tools included.`,
    path,
    kw: "study in sweden, study in sweden for international students, is sweden free to study, sweden student visa 2026, sweden residence permit for studies, masters in sweden in english, cost of studying in sweden, sweden post study work permit, study in sweden from india, sweden scholarships",
    jsonLdBlocks: [
      jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Study in Sweden 2026: The Complete Guide for International Students", description: "Universities, English-taught admission, tuition, residence permit, working while studying and post-study work in Sweden, 2026.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-08-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
      jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
      faqJsonLd(faqs),
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Study in Sweden", path }]),
    ],
  }) + shell(inner));
}
swedenPillarPage();

// ── Study in Hong Kong — PILLAR hub. Hook: English-medium world-top-50 unis + the
// standout IANG 24-month stay-back (no job offer needed) and 7-year PR path.
// Verified vs immd.gov.hk. Interlinks only existing spokes (no ms-* pages yet). ──
function hongKongPillarPage() {
  const path = `/study-in-hong-kong/`;
  const faqs = [
    { q: "Is Hong Kong good for international students?", a: "Yes, especially if you want a world-ranked, English-medium education in Asia with a strong stay-back option. Universities like HKU, HKUST and CUHK rank in the global top 50, teach in English, and sit in a major finance and tech hub. The standout benefit is the IANG scheme, which lets graduates stay 24 months after finishing — with no job offer required for recent graduates." },
    { q: "How much does it cost to study in Hong Kong?", a: "Tuition for non-local students is roughly HKD 140,000–210,000 per year (about US$18,000–27,000), which is lower than comparable programmes in the US or UK. Living costs add about HKD 60,000–120,000 per year, with accommodation the biggest and most expensive factor. Budget carefully for housing, especially near campus." },
    { q: "Can I study in Hong Kong in English?", a: "Yes. English is the medium of instruction at most Hong Kong universities, particularly for postgraduate programmes, so you do not need Cantonese or Mandarin to study there. A typical English requirement is IELTS 6.0–6.5 or TOEFL ~79–90, depending on the university and programme." },
    { q: "Can I stay and work in Hong Kong after I graduate?", a: "Yes — this is Hong Kong's biggest draw. Under the Immigration Arrangements for Non-local Graduates (IANG), graduates are normally granted an initial stay of 24 months, and recent graduates (applying within six months of graduating) do NOT need a job offer to apply. If you find work you can renew and extend your stay, making it one of Asia's most graduate-friendly stay-back schemes." },
    { q: "Can I get permanent residency in Hong Kong?", a: "Yes, through the 7-year rule: after seven years of continuous ordinary residence you can apply for the right of abode (permanent residence). Importantly, your years spent studying in Hong Kong count toward those seven years, so studying there is a genuine long-term settlement route — one of the clearer PR paths in Asia." },
    { q: "When should I apply to study in Hong Kong?", a: "The main intake is September (Autumn). Postgraduate applications typically open around September–November of the year before and are assessed in rounds through to spring, so applying early improves both your admission and scholarship chances. Allow time afterwards for the university-sponsored student visa." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Study in Hong Kong</p>
<section class="hero"><div class="badges"><span class="badge">Complete guide</span><span class="badge">2026</span><span class="badge">English-medium</span><span class="badge">24-month stay-back</span></div>
<h1>Study in Hong Kong 2026: The Complete Guide for International Students</h1>
<p class="lead">Hong Kong pairs world-top-50, English-medium universities with the most generous stay-back scheme in Asia: the IANG arrangement gives graduates 24 months to stay — with no job offer required for recent graduates — and your study years count toward the 7-year path to permanent residence. This guide walks the whole journey: universities, admission, costs, the student visa, IANG, and settling long-term.</p>
<a class="cta" href="/study-abroad/top-universities-in-hong-kong/">▶ See the top universities in Hong Kong</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Hong Kong's universities are <strong>English-medium</strong> and globally ranked (HKU #17, CUHK #36, HKUST #47); tuition is <strong>≈ HKD 140,000–210,000/yr</strong> (US$18–27k); the main intake is <strong>September</strong>; and after graduating the <strong>IANG scheme gives 24 months to stay with no job offer needed</strong> — with study years counting toward the <strong>7-year PR</strong> path.</div>

<div class="card"><h2>Why study in Hong Kong?</h2>
<ul class="bcheck">
<li><strong>World-top-50, English-medium universities.</strong> <a href="/university/hku/">HKU</a> (#17), <a href="/university/cuhk/">CUHK</a> (#36) and <a href="/university/hkust/">HKUST</a> (#47) teach in English and rank among the world's best. See all <a href="/study-abroad/top-universities-in-hong-kong/">top universities in Hong Kong</a>.</li>
<li><strong>The standout stay-back:</strong> the IANG scheme gives graduates a 24-month stay with <em>no job offer required</em> for recent graduates — rare in Asia.</li>
<li><strong>Gateway to Greater China &amp; a global finance/tech hub</strong> — strong for business, finance, computer science and data.</li>
<li><strong>Real PR route:</strong> seven years of ordinary residence (your study years count) leads to the right of abode.</li>
</ul></div>

<div class="card"><h2>What it costs</h2>
<p>Tuition for non-local students is roughly <strong>HKD 140,000–210,000 per year (about US$18,000–27,000)</strong> — meaningfully lower than comparable US or UK programmes for a similar global ranking. Living costs add about <strong>HKD 60,000–120,000 per year</strong>, with <strong>accommodation the biggest expense</strong> (Hong Kong housing is famously pricey, and on-campus places are limited). Model your full budget with the free <a href="/tools/cost-of-studying-abroad-calculator/">cost-of-studying-abroad calculator</a>, and compare destinations in the <a href="/study-abroad-funding-facts-2026/">2026 funding facts</a>.</p></div>

<div class="card"><h2>Admission &amp; requirements</h2>
<ul class="bcheck">
<li><strong>Academic:</strong> a recognised bachelor's degree with a strong record for Master's entry; top programmes are competitive.</li>
<li><strong>English proficiency:</strong> typically <strong>IELTS 6.0–6.5</strong> or TOEFL ~79–90. Check the exact bar and practise with <a href="/ielts-for-hku/">IELTS for HKU</a>, <a href="/toefl-for-hku/">TOEFL for HKU</a>, and a free <a href="/mock-test/ielts/">IELTS mock test</a> or <a href="/mock-test/toefl/">TOEFL mock test</a>.</li>
<li><strong>GRE/GMAT:</strong> often recommended for competitive business and analytics Master's (GMAT ~650–680 range at the top schools).</li>
<li><strong>Applications</strong> go directly to each university, usually in rounds — apply early for the best admission and scholarship odds.</li>
</ul></div>

<div class="card"><h2>The student visa</h2>
<p>Once admitted, your university <strong>sponsors your student visa</strong> application to the Hong Kong Immigration Department. You'll need your admission/enrolment proof, financial evidence covering tuition and living costs, and a valid passport. Start as soon as you have your offer, as processing takes several weeks. Most non-local students may take <strong>on-campus part-time work and study-related internships</strong> — always confirm the current conditions attached to your visa (the "No Limit of Stay"/student conditions) before working.</p></div>

<div class="card"><h2>After graduation: IANG &amp; the 7-year PR path</h2>
<ul class="bcheck">
<li><strong>IANG — 24-month stay, no job offer needed:</strong> under the Immigration Arrangements for Non-local Graduates, graduates are normally granted an initial <strong>24-month</strong> stay. <strong>Recent graduates</strong> — those applying within six months of graduating — do <strong>not</strong> need a job offer to apply.</li>
<li><strong>Renew &amp; extend:</strong> once you're working you can renew your IANG status and keep building residence.</li>
<li><strong>Permanent residence at 7 years:</strong> after <strong>seven years of continuous ordinary residence</strong> — and your <em>study years count</em> — you can apply for the right of abode (PR).</li>
</ul>
<p class="note">Immigration rules change — always confirm the current IANG and right-of-abode details on the official <a href="https://www.immd.gov.hk/eng/services/visas/IANG.html" target="_blank" rel="nofollow noopener">Hong Kong Immigration Department ↗</a> before you rely on them.</p></div>

<div class="card"><h2>Scholarships &amp; funding</h2>
<p>Hong Kong universities offer <strong>entrance and merit scholarships</strong> for strong international applicants, plus <strong>Belt and Road</strong> scholarships for students from participating regions and the highly competitive <strong>Hong Kong PhD Fellowship Scheme (HKPFS)</strong> for research students. Browse the wider <a href="/fully-funded-scholarships/">fully-funded scholarships database</a>, and if you need a loan, model repayments with the <a href="/tools/education-loan-emi-calculator/">education-loan EMI calculator</a>.</p>
<p class="note"><strong>Last verified:</strong> ${esc(LASTMOD)}. Figures (tuition and living ranges, the IANG 24-month stay and the 7-year PR rule) are checked against official Hong Kong sources and change over time — confirm the current details with your university and the Hong Kong Immigration Department before you apply.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🎓 Top universities in Hong Kong`, href: `/study-abroad/top-universities-in-hong-kong/` },
  { label: `🏛️ HKU profile`, href: `/university/hku/` },
  { label: `🏛️ HKUST profile`, href: `/university/hkust/` },
  { label: `🧮 Cost-of-studying calculator`, href: `/tools/cost-of-studying-abroad-calculator/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
  { label: `📝 IELTS for HKU`, href: `/ielts-for-hku/` },
])}`;
  emit(path, head({
    title: `Study in Hong Kong 2026: Complete Guide for International Students | ${BRAND}`,
    desc: `Complete guide to studying in Hong Kong 2026: English-medium world-top-50 universities (HKU, CUHK, HKUST), tuition & costs, the student visa, the IANG 24-month stay-back (no job offer needed), and the 7-year path to permanent residence. Free tools included.`,
    path,
    kw: "study in hong kong, study in hong kong for international students, hong kong student visa 2026, iang visa hong kong, hong kong post study work, cost of studying in hong kong, masters in hong kong, hku admission, study in hong kong from india, hong kong permanent residency 7 years",
    jsonLdBlocks: [
      jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Study in Hong Kong 2026: The Complete Guide for International Students", description: "Universities, English-medium admission, costs, student visa, the IANG stay-back and the 7-year PR path in Hong Kong, 2026.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-08-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
      jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
      faqJsonLd(faqs),
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Study in Hong Kong", path }]),
    ],
  }) + shell(inner));
}
hongKongPillarPage();

// ── Education Loan for Studying Abroad — PILLAR hub. Targets the collateral/
// unsecured-loan query cluster (GSC: "non collateral education loan", "unsecured
// education loan", "education loan is secured or unsecured") and interlinks the
// loan spokes + the EMI calculator. Figures are ranges, not fixed quotes. ──
function educationLoanPillarPage() {
  const path = `/study-abroad-education-loan/`;
  const th = `text-align:left;padding:10px 12px;border-bottom:2px solid var(--line);font-weight:700`;
  const td = `padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top`;
  const rows = [
    ["Secured (with collateral)", "~8.5–11% p.a.", "Up to ~INR 1.5 crore", "Property, FD or LIC policy pledged; lowest rates, highest limits"],
    ["Unsecured (no collateral)", "~11–15% p.a.", "Typically up to ~INR 40–75 lakh", "No asset pledged; depends on university, course and co-applicant income"],
    ["International lenders (no co-signer)", "Varies (often higher)", "Course-cost based", "E.g. Prodigy Finance, MPOWER — for select universities, no Indian collateral/co-signer"],
  ].map((r) => `<tr><td style="${td}"><strong>${r[0]}</strong></td><td style="${td}">${r[1]}</td><td style="${td}">${r[2]}</td><td style="${td}">${r[3]}</td></tr>`).join("");
  const faqs = [
    { q: "Is an education loan secured or unsecured?", a: "It can be either. A secured (collateral) loan is backed by an asset — property, a fixed deposit or an LIC policy — and carries the lowest interest (about 8.5–11% p.a.) and the highest limits. An unsecured (collateral-free) loan pledges no asset and is approved on the strength of your university, course and co-applicant's income, at a higher rate (about 11–15% p.a.) and a lower limit. Many students take an unsecured loan when they don't have collateral to pledge." },
    { q: "Can I get an education loan without collateral for studying abroad?", a: "Yes. Private banks and NBFCs (such as Avanse, Auxilo, InCred and HDFC Credila) offer collateral-free education loans up to roughly INR 40–75 lakh, depending on the university, course and your co-applicant's income. International lenders like Prodigy Finance and MPOWER Financing lend to select universities with no Indian collateral or co-signer. Rates are higher than secured loans — compare the total cost, not just the headline rate." },
    { q: "Do I pay EMIs while I'm still studying?", a: "Usually not in full. Most education loans give a moratorium (repayment holiday) covering your course plus 6–12 months. Interest still accrues during this period, so paying at least the simple interest while you study meaningfully reduces your total repayment. Model it with the free EMI calculator." },
    { q: "What tax benefit does an education loan give?", a: "Under Section 80E of the Indian Income Tax Act, the interest paid on an education loan is fully deductible from your taxable income for up to 8 years (there is no upper limit on the interest amount). The principal is not deductible. This applies to loans taken for higher education for yourself, your spouse or your children." },
    { q: "How much can I borrow, and what do lenders check?", a: "Limits range from a few lakh up to about INR 1.5 crore with strong collateral. Lenders weigh your university's ranking and the course's employability, your academic record, the co-applicant's income and stability, and the collateral offered. A strong admit to a well-ranked, employable course improves both your approval odds and your rate." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › Education Loan for Studying Abroad</p>
<section class="hero"><div class="badges"><span class="badge">Complete guide</span><span class="badge">2026</span><span class="badge">Secured vs collateral-free</span></div>
<h1>Education Loan for Studying Abroad (2026): Secured vs Collateral-Free</h1>
<p class="lead">A clear guide to funding your study abroad with an education loan from India — secured versus unsecured (collateral-free) loans, typical interest rates and limits, the moratorium, tax benefits, and how to pick the cheapest total option. Model your repayment free.</p>
<a class="cta" href="/tools/education-loan-emi-calculator/">▶ Free education-loan EMI calculator</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> An education loan is <strong>secured</strong> (backed by collateral — property, FD or LIC — at about <strong>8.5–11% p.a.</strong>, highest limits) or <strong>unsecured / collateral-free</strong> (no asset pledged, at about <strong>11–15% p.a.</strong>, approved on your university, course and co-applicant income). No collateral? Private banks, NBFCs (Avanse, Auxilo, InCred, HDFC Credila) and international lenders (Prodigy, MPOWER) offer collateral-free loans. Compare total cost, not just the rate.</div>

<div class="card"><h2>Secured vs collateral-free education loans</h2>
<table style="width:100%;border-collapse:collapse;font-size:15px"><thead><tr><th style="${th}">Loan type</th><th style="${th}">Typical interest</th><th style="${th}">Typical limit</th><th style="${th}">How it works</th></tr></thead><tbody>${rows}</tbody></table>
<p class="note">Rates and limits are indicative ranges for Indian students in 2026 and vary by lender, university, course and profile — always get current quotes from two or three lenders. Full walkthrough: <a href="/blog/education-loan-without-collateral/">education loan without collateral</a> and <a href="/blog/education-loan-study-abroad/">education loan for study abroad</a>.</p></div>

<div class="card"><h2>The moratorium: pay less overall</h2>
<p>Most education loans include a <strong>moratorium</strong> (repayment holiday) of your <strong>course duration plus 6–12 months</strong>. Full EMIs start after that. But interest still <em>accrues</em> during the moratorium — so paying at least the <strong>simple interest</strong> while you study can cut your total repayment substantially. See exactly how much with the <a href="/tools/education-loan-emi-calculator/">EMI calculator</a>.</p></div>

<div class="card"><h2>Interest, tax and total cost</h2>
<ul class="bcheck">
<li><strong>Section 80E:</strong> the interest you pay is fully tax-deductible in India for up to 8 years — a real saving that lowers the effective rate.</li>
<li><strong>Compare total cost, not the headline rate:</strong> a slightly higher rate with no processing fee or with interest paid during study can be cheaper overall than a low advertised rate with high fees.</li>
<li><strong>Forex &amp; proof of funds:</strong> a loan sanction letter can serve as proof of funds, and loans can fund a blocked account or GIC — check your destination's rule in the <a href="/study-abroad-funding-facts-2026/">funding facts</a> and the <a href="/tools/proof-of-funds-calculator/">proof-of-funds calculator</a>.</li>
</ul></div>

<div class="card"><h2>Which lenders to consider</h2>
<ul class="bcheck">
<li><strong>Public-sector banks</strong> (e.g. SBI Global Ed-Vantage, Bank of Baroda): lowest rates, usually need collateral for larger amounts.</li>
<li><strong>Private banks &amp; NBFCs</strong> (Axis, ICICI, IDFC First; Avanse, Auxilo, InCred, HDFC Credila): faster processing and collateral-free options up to higher limits, at higher rates.</li>
<li><strong>International lenders</strong> (Prodigy Finance, MPOWER Financing): no Indian collateral or co-signer, for select universities — useful if you have neither.</li>
</ul>
<p class="note">LandingPrep is independent and does not sell loans or take lender commissions on this page — always compare current offers directly with the lenders.</p></div>

<div class="card"><h2>A simple plan</h2><ol>
<li><strong>Estimate the total cost</strong> of your course with the <a href="/tools/cost-of-studying-abroad-calculator/">cost-of-studying calculator</a>.</li>
<li><strong>Decide secured vs collateral-free</strong> based on whether you can pledge an asset.</li>
<li><strong>Get quotes from 2–3 lenders</strong> and compare the <em>total</em> cost (rate + fees + moratorium terms).</li>
<li><strong>Model the EMI</strong> and see the saving from paying interest during study — <a href="/tools/education-loan-emi-calculator/">EMI calculator</a>.</li>
<li><strong>Keep Section 80E in mind</strong> when you start repaying.</li>
</ol>
<p class="note"><strong>Last updated:</strong> ${esc(LASTMOD)}. This is general information, not financial advice; confirm current rates, limits and terms directly with lenders.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🏦 EMI calculator`, href: `/tools/education-loan-emi-calculator/` },
  { label: `📄 Loan without collateral`, href: `/blog/education-loan-without-collateral/` },
  { label: `🧮 Proof-of-funds calculator`, href: `/tools/proof-of-funds-calculator/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
  { label: `💰 Cost of studying abroad`, href: `/tools/cost-of-studying-abroad-calculator/` },
])}`;
  emit(path, head({
    title: `Education Loan for Studying Abroad 2026: Secured vs Collateral-Free | ${BRAND}`,
    desc: `Education loan for study abroad from India (2026): secured vs unsecured (collateral-free) loans, interest rates, limits, moratorium, Section 80E tax benefit and best lenders. Free EMI calculator.`,
    path,
    kw: "education loan for study abroad, education loan without collateral, collateral free education loan, unsecured education loan, is education loan secured or unsecured, nbfc education loan without collateral, study abroad loan, non collateral education loan",
    jsonLdBlocks: [
      jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Education Loan for Studying Abroad 2026: Secured vs Collateral-Free", description: "Secured vs unsecured education loans for Indian students going abroad — rates, limits, moratorium, tax and lenders.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
      jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
      faqJsonLd(faqs),
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "Education Loan for Studying Abroad", path }]),
    ],
  }) + shell(inner));
}
educationLoanPillarPage();

// ── Study in Canada — PILLAR hub. Broad guide reflecting the 2024–26 rule
// changes (SDS ended, study-permit cap + PAL with a master's/PhD exemption from
// Jan 2026, PGWP language + field-of-study rules, 24 hrs/week work), interlinking
// the existing Canada spokes. Facts verified against IRCC/canada.ca. ──
function canadaPillarPage() {
  const path = `/study-in-canada/`;
  const IRCC = "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html";
  const faqs = [
    { q: "How much money do I need to study in Canada in 2026?", a: "You must show living costs of about CAD 22,895 for a single applicant (set by IRCC, adjusted yearly), plus your first-year tuition and travel. Many students show the living-cost portion via a GIC (Guaranteed Investment Certificate), which is returned to them in instalments after arrival. Use the free proof-of-funds calculator for your exact total." },
    { q: "Did the Student Direct Stream (SDS) end?", a: "Yes. The SDS fast-track ended on 8 November 2024. All students now apply through the regular study-permit stream, which still accepts a GIC as proof of funds but is not the old two-week fast-track. Plan for standard processing times." },
    { q: "Do I need a Provincial Attestation Letter (PAL) for Canada?", a: "Most undergraduate and college students do — Canada caps international study permits and requires a Provincial/Territorial Attestation Letter (PAL/TAL) with the application. As of 1 January 2026, master's and doctoral students at public designated learning institutions are exempt from the PAL/TAL requirement. Always confirm your category with the official IRCC page." },
    { q: "How many hours can I work while studying in Canada?", a: "Up to 24 hours per week off campus during academic sessions (this is the current permanent rule, raised from 20 hours), and unlimited hours during scheduled breaks such as summer and winter holidays." },
    { q: "Can I stay and work in Canada after graduating?", a: "Yes, via the Post-Graduation Work Permit (PGWP), valid from 8 months to 3 years depending on your programme (master's graduates can get 3 years even from a shorter programme). Since November 2024 you must submit a language-test result, and non-degree graduates must have studied an eligible field of study. PGWP work experience then counts toward permanent residence through Express Entry (Canadian Experience Class)." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Study in Canada</p>
<section class="hero"><div class="badges"><span class="badge">Complete guide</span><span class="badge">2026</span><span class="badge">Updated for the 2024–26 rules</span></div>
<h1>Study in Canada 2026: The Complete Guide for International Students</h1>
<p class="lead">Canada offers strong universities, generous work rights and a clear study-to-PR pathway — but the rules changed a lot in 2024–2026. This guide covers the whole journey (costs, proof of funds, the study-permit cap and PAL, the visa, working while studying and the PGWP-to-PR route) and links the detailed resource for each stage, all verified against IRCC.</p>
<a class="cta" href="/tools/proof-of-funds-calculator/">▶ Calculate your Canada proof of funds (free)</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> For 2026 you need about <strong>CAD 22,895</strong> in living-cost proof (often via a <strong>GIC</strong>) plus first-year tuition; the <strong>SDS fast-track ended in Nov 2024</strong>; most undergrads need a <strong>Provincial Attestation Letter (PAL)</strong> — master's/PhD are exempt from Jan 2026; you can work <strong>24 hours/week</strong>; and the <strong>PGWP</strong> (8 months–3 years) leads to PR via Express Entry.</div>

<div class="card"><h2>Why study in Canada?</h2><ul class="bcheck">
<li><strong>Respected universities</strong> (Toronto, UBC, McGill, Waterloo, Alberta…) with strong research and co-op/work-integrated learning.</li>
<li><strong>Generous work rights</strong> — 24 hours/week during term, unlimited during breaks.</li>
<li><strong>A clear study-to-PR pathway</strong> — the PGWP lets you gain Canadian work experience that counts toward permanent residence.</li>
<li><strong>Multicultural, safe, and welcoming to international graduates.</strong></li>
</ul></div>

<div class="card"><h2>What it costs &amp; proof of funds</h2>
<p>Budget for <strong>tuition</strong> (roughly CAD 15,000–40,000/year for international students, by course and university) plus <strong>living costs</strong>. For the study permit you must show about <strong>CAD 22,895</strong> for a single applicant (IRCC's living-cost figure, updated yearly) <strong>plus your first-year tuition</strong>. Many students show the living-cost portion through a <strong>GIC</strong>, returned to them in instalments after arrival. See the <a href="/blog/gic-account-canada-2026-guide/">Canada GIC guide</a>, estimate your total with the <a href="/tools/proof-of-funds-calculator/">proof-of-funds calculator</a>, and the <a href="/blog/cost-of-studying-in-canada-for-indians-2026/">cost of studying in Canada</a>.</p></div>

<div class="card"><h2>The 2024–2026 rule changes you must know</h2><ul class="bcheck">
<li><strong>SDS ended (Nov 2024):</strong> everyone now uses the regular study-permit stream — no more two-week fast-track.</li>
<li><strong>Study-permit cap + PAL:</strong> Canada limits international permits and requires a <strong>Provincial Attestation Letter</strong> for most undergraduate/college applicants. <strong>Master's and doctoral students at public institutions are exempt from Jan 2026.</strong></li>
<li><strong>PGWP tightened:</strong> a language-test result is required (since Nov 2024), and non-degree graduates must have studied an <strong>eligible field of study</strong>.</li>
<li><strong>Work hours raised</strong> to 24/week during term.</li>
</ul>
<p>Full detail: <a href="/blog/canada-study-permit-changes-2026/">Canada study-permit changes 2026</a>. Confirm your own case on the official <a href="${IRCC}" target="_blank" rel="nofollow noopener">IRCC study-permit page ↗</a>.</p></div>

<div class="card"><h2>Admission &amp; English requirements</h2>
<p>Each university sets its own English requirement — there is <strong>no single national IELTS score</strong> — but a Band around 6.5 (with no band below 6.0) is common for undergraduate entry, and some programmes ask higher. Canada also accepts TOEFL, PTE and, for many programmes, CELPIP. Check and practise with <a href="/ielts-for-canada-pr/">IELTS for Canada</a>, <a href="/blog/celpip-vs-ielts-for-canada-pr-2026/">CELPIP vs IELTS</a>, and a <a href="/mock-test/ielts/">free IELTS mock test</a>. Always confirm the exact score on your course page.</p></div>

<div class="card"><h2>The study-permit process &amp; timeline</h2>
<p>A rough sequence: get admission from a Designated Learning Institution → obtain your <strong>PAL</strong> (if required for your category) → open a <strong>GIC</strong> and arrange proof of funds → complete the <strong>study-permit application</strong>, medical and biometrics → get approval and travel. Apply <strong>3–6 months ahead</strong> of your intake (Fall/September is the main one; Winter/January and some Spring intakes exist). Rehearse with the <a href="/#/colleges">visa-interview coach</a>.</p></div>

<div class="card"><h2>Working while studying &amp; after graduation</h2><ul class="bcheck">
<li><strong>During study:</strong> up to 24 hours/week off campus in term, unlimited during breaks.</li>
<li><strong>PGWP:</strong> 8 months to 3 years by programme length (master's graduates can get 3 years); needs a language test since Nov 2024; non-degree grads need an eligible field of study. See the <a href="/blog/canada-pgwp-2026-guide/">Canada PGWP guide</a>.</li>
<li><strong>Permanent residence:</strong> PGWP work experience counts toward the Canadian Experience Class under <a href="/blog/canada-pr-express-entry-basics/">Express Entry</a> — the main study-to-PR route.</li>
</ul>
<p class="note"><strong>Last verified:</strong> ${esc(LASTMOD)} against IRCC/canada.ca. Canadian immigration rules change frequently — always confirm the current details on the official IRCC site before you apply.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🧮 Proof-of-funds calculator`, href: `/tools/proof-of-funds-calculator/` },
  { label: `🏦 Canada GIC guide`, href: `/blog/gic-account-canada-2026-guide/` },
  { label: `📋 Study-permit changes 2026`, href: `/blog/canada-study-permit-changes-2026/` },
  { label: `💼 Canada PGWP guide`, href: `/blog/canada-pgwp-2026-guide/` },
  { label: `🍁 Express Entry basics`, href: `/blog/canada-pr-express-entry-basics/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
])}`;
  emit(path, head({
    title: `Study in Canada 2026: Complete Guide (Costs, PAL, PGWP, PR) | ${BRAND}`,
    desc: `Free complete guide to studying in Canada 2026: proof of funds (CAD 22,895 + tuition, GIC), the study-permit cap & PAL, the SDS-ended rules, 24 hrs/week work, and the PGWP-to-PR pathway. Verified against IRCC.`,
    path,
    kw: "study in canada, study in canada for international students, canada student visa 2026, canada study permit requirements, canada proof of funds gic, provincial attestation letter pal, canada pgwp 2026, study in canada from india, cost of studying in canada",
    jsonLdBlocks: [
      jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Study in Canada 2026: The Complete Guide for International Students", description: "Costs, proof of funds, the study-permit cap and PAL, the visa, working while studying and the PGWP-to-PR pathway in Canada, 2026.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
      jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
      faqJsonLd(faqs),
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Study in Canada", path }]),
    ],
  }) + shell(inner));
}
canadaPillarPage();

// ── Study in the UK — PILLAR hub. Facts verified vs gov.uk/UKVI (2026). ──
function ukPillarPage() {
  const path = `/study-in-uk/`;
  const faqs = [
    { q: "How much money do I need for a UK student visa in 2026?", a: "You must show course fees plus living costs (maintenance) of GBP 1,529/month if studying in London or GBP 1,171/month elsewhere, for up to 9 months — so about GBP 13,761 (London) or GBP 10,539 (outside London) of maintenance, on top of your tuition. The money must sit in your account for 28 consecutive days before you apply." },
    { q: "How long can I stay in the UK after my degree?", a: "The Graduate Route lets you stay to work for 2 years after a bachelor's or master's (3 years after a PhD). Note the announced change: for applications made from 1 January 2027 the post-study period drops to 18 months (PhD stays 3 years)." },
    { q: "Can I work while studying in the UK?", a: "Yes — degree-level students can work up to 20 hours per week during term time and full-time during holidays." },
    { q: "Can I bring my family on a UK student visa?", a: "Since January 2024, students on taught master's and most other courses can no longer bring dependants. Only students on PhD/research programmes (and government-sponsored students) can bring family." },
    { q: "Do I need IELTS for the UK?", a: "You need to prove English at roughly CEFR B2 level, but IELTS is not the only accepted test — universities and UKVI accept several tests, and some applicants are exempt (e.g. from majority-English-speaking countries or with an English-taught degree). Check your university's list." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Study in the UK</p>
<section class="hero"><div class="badges"><span class="badge">Complete guide</span><span class="badge">2026</span><span class="badge">Verified vs gov.uk</span></div>
<h1>Study in the UK 2026: The Complete Guide for International Students</h1>
<p class="lead">The UK offers world-leading universities, one-year master's degrees and a post-study work route — with some important 2024–26 rule changes. This guide walks the whole journey (costs, the student visa, working, and staying on after your degree) and links the detailed resource for each step, verified against gov.uk.</p>
<a class="cta" href="/tools/proof-of-funds-calculator/">▶ Calculate your UK proof of funds (free)</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> The UK student visa needs tuition + maintenance of <strong>GBP 1,529/mo (London)</strong> or <strong>GBP 1,171/mo (elsewhere)</strong> for up to 9 months, held 28 days; you can work <strong>20 hrs/week</strong> in term; the <strong>Graduate Route</strong> gives 2 years' post-study work (3 for PhD), <strong>dropping to 18 months for applications from Jan 2027</strong>; and taught-master's students can no longer bring dependants.</div>

<div class="card"><h2>Why study in the UK?</h2><ul class="bcheck">
<li><strong>Top-ranked universities</strong> (Oxford, Cambridge, Imperial, UCL, Manchester, Edinburgh…) with global recognition.</li>
<li><strong>One-year master's degrees</strong> — you finish faster and spend less than a two-year programme.</li>
<li><strong>The Graduate Route</strong> — 2 years' post-study work (3 for a PhD) to gain UK experience.</li>
<li><strong>English-taught throughout</strong>, with strong student support for international students.</li>
</ul></div>

<div class="card"><h2>What it costs</h2>
<p>International <strong>tuition</strong> is set by each university and is not capped — roughly <strong>GBP 11,400–38,000/year</strong> for undergraduate and <strong>GBP 12,000–50,000+/year</strong> for postgraduate (taught master's are often GBP 15,000–25,000). <strong>Maintenance</strong> for the visa is GBP 1,529/month (London) or GBP 1,171/month (elsewhere) for up to 9 months. Budget also for the visa fee (about GBP 558) and the Immigration Health Surcharge (about GBP 776/year). Estimate your full budget with the <a href="/tools/cost-of-studying-abroad-calculator/">cost calculator</a> and see the <a href="/study-abroad/cost-of-studying-in-uk/">UK cost breakdown</a>.</p></div>

<div class="card"><h2>Admission &amp; English</h2><ul class="bcheck">
<li><strong>Undergraduate:</strong> apply through <strong>UCAS</strong>. <strong>Postgraduate:</strong> usually apply directly to each university.</li>
<li><strong>English:</strong> prove roughly CEFR B2 — IELTS is common but not the only accepted test; some applicants are exempt. Prep with <a href="/ielts-for-uk-visa/">IELTS for the UK</a> and a <a href="/mock-test/ielts/">free IELTS mock test</a>.</li>
<li><strong>Documents:</strong> once you accept an offer you receive a <strong>CAS</strong> (Confirmation of Acceptance for Studies) for the visa. See the <a href="/blog/uk-student-visa-pre-cas-requirements/">pre-CAS requirements</a> and a <a href="/blog/sop-for-uk-student-visa-sample/">sample SOP</a>.</li>
</ul></div>

<div class="card"><h2>The student visa</h2>
<p>With your CAS and financial evidence (held 28 consecutive days), you apply for the Student visa, pay the fee and the Immigration Health Surcharge, give biometrics, and (from many countries including India) provide a <strong>TB test certificate</strong>. Use the <a href="/tools/student-visa-document-checklist/">document checklist</a> to gather everything, and rehearse with the <a href="/#/colleges">visa-interview coach</a>.</p></div>

<div class="card"><h2>Working, family &amp; staying on</h2><ul class="bcheck">
<li><strong>During study:</strong> 20 hours/week in term, full-time on holidays.</li>
<li><strong>Dependants:</strong> since Jan 2024, taught-master's (and most) students cannot bring family; PhD/research students can.</li>
<li><strong>After graduating:</strong> the <a href="/blog/uk-graduate-route-visa-2026/">Graduate Route</a> gives 2 years' work (3 for PhD) — reducing to 18 months for applications from January 2027. It can lead on to a Skilled Worker visa.</li>
</ul>
<p class="note"><strong>Last verified:</strong> ${esc(LASTMOD)} against <a href="https://www.gov.uk/student-visa" target="_blank" rel="nofollow noopener">gov.uk ↗</a>. UK rules change — confirm the current details before you apply.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🧮 Proof-of-funds calculator`, href: `/tools/proof-of-funds-calculator/` },
  { label: `✅ Visa document checklist`, href: `/tools/student-visa-document-checklist/` },
  { label: `🎓 UK Graduate Route`, href: `/blog/uk-graduate-route-visa-2026/` },
  { label: `💷 Cost of studying in the UK`, href: `/study-abroad/cost-of-studying-in-uk/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
])}`;
  emit(path, head({ title: `Study in the UK 2026: Complete Guide (Costs, Visa, Graduate Route) | ${BRAND}`, desc: `Free complete guide to studying in the UK 2026: tuition & maintenance (GBP 1,171–1,529/mo), the student visa & CAS, 20 hrs/week work, the dependant rules, and the Graduate Route (2yr, 18mo from Jan 2027). Verified vs gov.uk.`, path, kw: "study in uk, study in uk for international students, uk student visa 2026, uk graduate route, cost of studying in uk, uk student visa requirements, study in uk from india, uk maintenance funds", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Study in the UK 2026: The Complete Guide for International Students", description: "Costs, the student visa and CAS, working, dependant rules and the Graduate Route in the UK, 2026.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
    jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Study in the UK", path }]),
  ] }) + shell(inner));
}
ukPillarPage();

// ── Study in Australia — PILLAR hub. Facts verified vs Home Affairs / Study Australia (2026). ──
function australiaPillarPage() {
  const path = `/study-in-australia/`;
  const faqs = [
    { q: "How much money do I need for an Australian student visa in 2026?", a: "You must show financial capacity for living costs of at least AUD 29,710 per year for a single student, plus tuition and travel. This is a minimum benchmark — actual living costs in Sydney or Melbourne are usually higher." },
    { q: "How much is the Australian student visa fee in 2026?", a: "The subclass 500 student visa application charge rose to AUD 2,500 from 1 July 2026 (up sharply from earlier years). Additional charges apply for any dependants." },
    { q: "How many hours can I work as a student in Australia?", a: "Up to 48 hours per fortnight during study periods, and unlimited hours during scheduled course breaks. Master's-by-research and PhD students have no work-hour limit." },
    { q: "How long is the post-study work visa in Australia?", a: "The Temporary Graduate visa (subclass 485) gives 2 years for a bachelor's or coursework master's, and longer for research degrees (a research master's or doctorate). The longer 4–6 year STEM extensions were removed in July 2024 — confirm the exact period for your qualification on the official Home Affairs page." },
    { q: "What English score do I need for Australia?", a: "The student-visa minimum was raised in 2024 to around IELTS 6.0 (or an equivalent approved test); many universities ask for higher. Your test generally must be recent." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Study in Australia</p>
<section class="hero"><div class="badges"><span class="badge">Complete guide</span><span class="badge">2026</span><span class="badge">Updated for the 2024–26 rules</span></div>
<h1>Study in Australia 2026: The Complete Guide for International Students</h1>
<p class="lead">Australia pairs strong universities with generous work rights and a post-study work visa — but 2024–2026 brought major changes to funds, fees, English and post-study work. This guide covers the whole journey and links the detail for each step, verified against the Department of Home Affairs.</p>
<a class="cta" href="/tools/proof-of-funds-calculator/">▶ Calculate your Australia proof of funds (free)</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> The subclass 500 student visa needs <strong>AUD 29,710/yr</strong> living-cost capacity plus tuition; the visa fee is <strong>AUD 2,500</strong> (from Jul 2026); you can work <strong>48 hours/fortnight</strong> in term; English is about <strong>IELTS 6.0</strong> minimum; and the post-study <strong>485 visa</strong> gives 2 years (bachelor/coursework master) or longer for research degrees.</div>

<div class="card"><h2>Why study in Australia?</h2><ul class="bcheck">
<li><strong>Highly ranked universities</strong> (Melbourne, Sydney, UNSW, ANU, Monash, UQ…).</li>
<li><strong>Strong work rights</strong> — 48 hours/fortnight in term, unlimited on breaks.</li>
<li><strong>Post-study work</strong> via the 485 visa (2–3 years) to gain experience.</li>
<li><strong>High quality of life</strong> and a large, well-supported international student community.</li>
</ul></div>

<div class="card"><h2>What it costs</h2>
<p><strong>Tuition</strong> for international students is roughly <strong>AUD 15,000–45,000/year</strong> depending on the course. For the visa you must show <strong>living-cost capacity of AUD 29,710/year</strong> (a minimum — Sydney/Melbourne cost more), and the <strong>visa application charge is AUD 2,500</strong> from July 2026. You also need <strong>OSHC health cover</strong> for your whole stay. Estimate your budget with the <a href="/tools/cost-of-studying-abroad-calculator/">cost calculator</a> and see the <a href="/study-abroad/cost-of-studying-in-australia/">Australia cost breakdown</a>.</p></div>

<div class="card"><h2>Admission, English &amp; the Genuine Student test</h2><ul class="bcheck">
<li><strong>Apply</strong> to your university (often via an agent or directly) and receive a <strong>Confirmation of Enrolment (CoE)</strong>.</li>
<li><strong>English:</strong> minimum around <strong>IELTS 6.0</strong> (raised in 2024); prep with <a href="/ielts-for-australia-pr/">IELTS for Australia</a>, <a href="/blog/pte-academic-vs-ielts-australia-pr-2026/">PTE vs IELTS</a>, and a <a href="/mock-test/ielts/">free mock test</a>.</li>
<li><strong>Genuine Student (GS)</strong> requirement replaced the old GTE in March 2024 — you explain your study intent in structured statements. See the <a href="/blog/australia-genuine-student-2026/">Genuine Student guide</a>.</li>
</ul></div>

<div class="card"><h2>Working, post-study &amp; PR</h2><ul class="bcheck">
<li><strong>During study:</strong> 48 hours/fortnight in term, unlimited on breaks (no limit for research students).</li>
<li><strong>485 visa:</strong> 2 years (bachelor/coursework master), longer for research degrees (research master's/doctorate) — the longer STEM extensions ended in July 2024.</li>
<li><strong>PR:</strong> skilled work can lead to permanent residence via the points-tested skilled pathways. See <a href="/blog/australia-pr-international-students-points/">Australia PR points</a>.</li>
</ul>
<p class="note"><strong>Last verified:</strong> ${esc(LASTMOD)} against <a href="https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500" target="_blank" rel="nofollow noopener">Home Affairs ↗</a>. Australian rules change frequently — confirm the current details before you apply.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🧮 Proof-of-funds calculator`, href: `/tools/proof-of-funds-calculator/` },
  { label: `✅ Visa document checklist`, href: `/tools/student-visa-document-checklist/` },
  { label: `📝 Genuine Student guide`, href: `/blog/australia-genuine-student-2026/` },
  { label: `🇦🇺 Australia PR points`, href: `/blog/australia-pr-international-students-points/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
])}`;
  emit(path, head({ title: `Study in Australia 2026: Complete Guide (Costs, Visa, 485, PR) | ${BRAND}`, desc: `Free complete guide to studying in Australia 2026: AUD 29,710 funds, the AUD 2,500 subclass 500 visa, 48 hrs/fortnight work, Genuine Student rule, IELTS 6.0, and the 485 post-study visa. Verified vs Home Affairs.`, path, kw: "study in australia, study in australia for international students, australia student visa 2026, subclass 500, australia 485 visa, genuine student requirement, cost of studying in australia, study in australia from india", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Study in Australia 2026: The Complete Guide for International Students", description: "Costs, the subclass 500 visa, Genuine Student rule, working, and the 485 post-study visa in Australia, 2026.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
    jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Study in Australia", path }]),
  ] }) + shell(inner));
}
australiaPillarPage();

// ── Study in the USA — PILLAR hub. Facts verified vs travel.state.gov / DHS SEVP (2026). ──
function usaPillarPage() {
  const path = `/study-in-usa/`;
  const faqs = [
    { q: "How much money do I need for a US student visa (F-1)?", a: "There is no single fixed figure — you must prove you can cover the first-year cost of attendance shown on your Form I-20 (tuition plus living expenses, set by your university). Your school verifies your funds before issuing the I-20, and you show the evidence at your visa interview." },
    { q: "What fees do I pay for an F-1 visa?", a: "The SEVIS I-901 fee is USD 350, and the visa application (MRV) fee is USD 185, on top of your university's costs. Pay the SEVIS fee before your visa interview." },
    { q: "Can I work on an F-1 visa?", a: "Yes — up to 20 hours/week on campus during term (full-time on breaks). Off-campus work needs authorisation: CPT (usually after one academic year) during study, and OPT after graduating." },
    { q: "How long can I work in the USA after graduating?", a: "OPT gives 12 months of work authorisation, and STEM-degree graduates can apply for a 24-month STEM OPT extension — up to 36 months total." },
    { q: "What has changed for F-1 applicants in 2025–26?", a: "US consular screening now includes reviewing applicants' online presence, and F/M/J applicants are asked to set their social-media profiles to public. Interview-waiver rules were updated in late 2025. Always check your local US embassy's current guidance." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Study in the USA</p>
<section class="hero"><div class="badges"><span class="badge">Complete guide</span><span class="badge">2026</span><span class="badge">Verified vs travel.state.gov</span></div>
<h1>Study in the USA 2026: The Complete Guide for International Students</h1>
<p class="lead">The USA has the world's largest choice of universities, strong funding and research, and the OPT work pathway. This guide walks the F-1 journey end to end — costs, the I-20, the visa, working, and OPT/STEM OPT — and links the detail for each step, verified against US government sources.</p>
<a class="cta" href="/tools/student-visa-document-checklist/">▶ Free US visa document checklist</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> The F-1 visa has no fixed fund figure — you prove your <strong>first-year cost of attendance</strong> on the <strong>Form I-20</strong>; you pay a <strong>USD 350 SEVIS fee</strong> and <strong>USD 185 visa fee</strong>; you can work <strong>20 hrs/week on campus</strong>; and after graduating you get <strong>12 months OPT</strong> (+24 months for STEM). Note the 2025 online-screening / social-media rules.</div>

<div class="card"><h2>Why study in the USA?</h2><ul class="bcheck">
<li><strong>The widest choice of universities</strong> and programmes anywhere, across every field.</li>
<li><strong>Strong funding, research and assistantships</strong>, especially at graduate level.</li>
<li><strong>OPT + STEM OPT</strong> — up to 3 years of post-study work for STEM graduates.</li>
<li><strong>Flexible curricula</strong> (majors, minors, electives) and huge alumni networks.</li>
</ul></div>

<div class="card"><h2>What it costs</h2>
<p><strong>Tuition</strong> varies widely by university (public vs private) and programme. For the visa you prove the <strong>first-year cost of attendance</strong> printed on your Form I-20 — tuition plus living, set by your school. Add the <strong>SEVIS I-901 fee (USD 350)</strong> and the <strong>MRV visa fee (USD 185)</strong>. Estimate your budget with the <a href="/tools/cost-of-studying-abroad-calculator/">cost calculator</a> and see the <a href="/study-abroad/cost-of-studying-in-usa/">USA cost breakdown</a>.</p></div>

<div class="card"><h2>Admission &amp; English</h2><ul class="bcheck">
<li><strong>Apply</strong> to SEVP-certified universities (Fall/September is the main intake; Spring/January also common).</li>
<li><strong>English:</strong> each university sets its own requirement (TOEFL, IELTS or others). Prep with a <a href="/mock-test/toefl/">free TOEFL mock test</a>, <a href="/blog/toefl-vs-ielts-usa-universities/">TOEFL vs IELTS for the US</a>, and check <a href="/blog/ms-usa-requirements-costs/">MS in USA requirements</a>.</li>
<li><strong>After admission</strong> the school issues your <strong>Form I-20</strong> for the visa.</li>
</ul></div>

<div class="card"><h2>The F-1 visa process</h2>
<p>Sequence: receive the <strong>I-20</strong> → pay the <strong>SEVIS I-901 fee</strong> → complete the <strong>DS-160</strong> → book and attend the <strong>visa interview</strong> with your financial and academic documents. In 2025 US screening began reviewing applicants' online presence, and F/M/J applicants are asked to make social-media profiles public. Gather everything with the <a href="/tools/student-visa-document-checklist/">document checklist</a> and rehearse with the <a href="/#/colleges">visa-interview coach</a>.</p></div>

<div class="card"><h2>Working &amp; OPT</h2><ul class="bcheck">
<li><strong>On campus:</strong> up to 20 hours/week in term, full-time on breaks.</li>
<li><strong>CPT:</strong> course-related work, usually after one academic year.</li>
<li><strong>OPT:</strong> 12 months after graduation; <strong>STEM OPT</strong> adds 24 months (up to 36 total). See the <a href="/blog/usa-f1-opt-2026/">F-1 OPT &amp; STEM extension guide</a>.</li>
</ul>
<p class="note"><strong>Last verified:</strong> ${esc(LASTMOD)} against <a href="https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html" target="_blank" rel="nofollow noopener">travel.state.gov ↗</a> and DHS SEVP. US rules change — confirm the current details with your school and local US embassy before you apply.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `✅ Visa document checklist`, href: `/tools/student-visa-document-checklist/` },
  { label: `💼 F-1 OPT & STEM extension`, href: `/blog/usa-f1-opt-2026/` },
  { label: `🎓 MS in USA requirements`, href: `/blog/ms-usa-requirements-costs/` },
  { label: `💵 Cost of studying in the USA`, href: `/study-abroad/cost-of-studying-in-usa/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
])}`;
  emit(path, head({ title: `Study in the USA 2026: Complete F-1 Guide (I-20, Visa, OPT) | ${BRAND}`, desc: `Free complete guide to studying in the USA 2026: F-1 proof of funds (I-20 cost of attendance), SEVIS $350 + $185 visa fees, on-campus work, CPT, and OPT + 24-month STEM extension. Verified vs US gov sources.`, path, kw: "study in usa, study in usa for international students, f1 visa 2026, form i-20, sevis fee, opt stem extension, cost of studying in usa, study in usa from india, us student visa process", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Study in the USA 2026: The Complete Guide for International Students", description: "F-1 costs, the I-20, the visa process, working, and OPT/STEM OPT in the USA, 2026.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
    jsonld({ "@context": "https://schema.org", "@type": "WebPage", url: ORIGIN + path, speakable: { "@type": "SpeakableSpecification", cssSelector: [".quick-answer", "h1"] } }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Study in the USA", path }]),
  ] }) + shell(inner));
}
usaPillarPage();

// ── Student-Visa Document Checklist — free interactive tool. Pick a country →
// tick off the documents you need, print/save. Targets "student visa checklist"
// (GSC pos ~23, real impressions). Document lists are the standard, stable
// requirements per destination (not volatile figures). ──
function visaChecklistPage() {
  const path = `/tools/student-visa-document-checklist/`;
  const CORE = [
    "Valid passport (usually valid 6+ months beyond your stay)",
    "University offer / admission letter",
    "Proof of funds (bank statements, loan sanction, or the country's specific vehicle)",
    "English test scorecard (IELTS / TOEFL / PTE) — if required",
    "Academic transcripts, degree/marksheets and certificates",
    "Passport-size photographs (to the country's spec)",
    "Statement of Purpose (SOP) / study plan",
    "Completed visa application form + visa fee payment",
  ];
  const COUNTRIES = [
    { id: "uk", flag: "🇬🇧", name: "United Kingdom", extra: ["CAS (Confirmation of Acceptance for Studies) from your university", "Financial evidence held for 28 consecutive days before applying", "Tuberculosis (TB) test certificate (required from India and many countries)", "Immigration Health Surcharge (IHS) paid", "ATAS certificate (only for certain science/technology postgraduate courses)", "Parental consent + birth certificate if under 18"], link: "/study-in-uk/" },
    { id: "canada", flag: "🇨🇦", name: "Canada", extra: ["Letter of Acceptance from a Designated Learning Institution (DLI)", "Provincial Attestation Letter (PAL) — if required for your category", "Proof of funds (commonly a GIC) + first-year tuition", "Upfront medical exam (from a panel physician)", "Biometrics (fingerprints + photo)", "Custodianship declaration if a minor"], link: "/study-in-canada/" },
    { id: "australia", flag: "🇦🇺", name: "Australia", extra: ["Confirmation of Enrolment (CoE) from your provider", "Genuine Student (GS) statement", "Overseas Student Health Cover (OSHC) for your full stay", "Evidence of financial capacity", "Health examination (if requested)"], link: "/study-in-australia/" },
    { id: "usa", flag: "🇺🇸", name: "USA (F-1)", extra: ["Form I-20 from an SEVP-certified school", "SEVIS I-901 fee payment receipt", "DS-160 confirmation page", "Visa interview appointment (at the US embassy/consulate)", "Financial documents proving cost of attendance"], link: "/study-in-usa/" },
    { id: "germany", flag: "🇩🇪", name: "Germany", extra: ["University admission letter (Zulassungsbescheid)", "Blocked account (Sperrkonto) confirmation — about EUR 11,904", "APS certificate (required for Indian students)", "Health insurance", "Proof of language (German or English, per course)"], link: "/study-in-germany/" },
    { id: "ireland", flag: "🇮🇪", name: "Ireland", extra: ["Letter of Acceptance from the institution", "Proof of funds (about EUR 10,000)", "Private medical insurance", "Evidence tuition fees are paid"], link: "/study-abroad-funding-facts-2026/" },
    { id: "switzerland", flag: "🇨🇭", name: "Switzerland", extra: ["University admission/enrolment letter", "Proof of funds for living costs (commonly ~CHF 21,000/yr — set by your canton)", "Proof of paid or payable tuition", "Health insurance valid in Switzerland", "Applied via the cantonal migration office (national D visa + B residence permit)"], link: "/study-in-switzerland/" },
    { id: "sweden", flag: "🇸🇪", name: "Sweden", extra: ["Notification of admission (via universityadmissions.se)", "Proof of first tuition instalment paid", "Proof of funds (~SEK 10,314/month for the study period — Migrationsverket, 2026)", "Comprehensive health insurance", "Applied for a residence permit for studies (not a visa sticker)"], link: "/study-in-sweden/" },
    { id: "hong-kong", flag: "🇭🇰", name: "Hong Kong", extra: ["University admission/enrolment proof (your university sponsors the visa)", "Financial evidence covering tuition + living costs", "Valid passport", "Completed application form ID 995A + sponsorship form ID 990A", "Recent photographs"], link: "/study-in-hong-kong/" },
  ];
  const opts = COUNTRIES.map((c) => `<option value="${c.id}">${c.flag} ${esc(c.name)}</option>`).join("");
  const faqs = [
    { q: "What documents do I need for a student visa?", a: "Every country wants the core set: a valid passport, your university offer/admission letter, proof of funds, an English test score (if required), academic transcripts, photos, an SOP, and the completed visa form with fee. On top of that each country adds its own — for example a CAS and TB test for the UK, a Letter of Acceptance + proof of funds (GIC) for Canada, a Form I-20 + SEVIS fee for the USA, a blocked account for Germany, and a Confirmation of Enrolment + OSHC health cover for Australia. Pick your country above for the full list." },
    { q: "When should I start collecting documents?", a: "Start 3–6 months before your intake. Some items take time — the UK's 28-day financial-holding rule, Canada's medical exam and biometrics, Germany's APS certificate and blocked account, and the USA's SEVIS fee and visa-interview slot all need lead time. Build your checklist early and track each item." },
    { q: "Can I use an education loan as proof of funds?", a: "Usually yes — a loan sanction letter is widely accepted as proof of funds, and loans can fund a blocked account or GIC. Confirm your specific country's rule and see the education-loan guide." },
  ];
  const tool = `
<div class="card">
  <h2>✅ Build your checklist</h2>
  <p class="note">Pick your destination, tick items as you gather them, and print or save this page. Always cross-check the exact list on the official visa page for your country.</p>
  <label style="display:block;margin:8px 0">Destination
    <select id="vc_country" style="width:100%;max-width:320px;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px">${opts}</select>
  </label>
  <div id="vcList" style="margin-top:12px"></div>
  <div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap">
    <button id="vc_print" class="cta" type="button" style="border:0;cursor:pointer">🖨 Print / save checklist</button>
    <span id="vc_progress" style="align-self:center;color:var(--muted);font-size:14px"></span>
  </div>
</div>
<script>
(function(){
  var DATA=${JSON.stringify(COUNTRIES.map((c) => ({ id: c.id, name: c.flag + " " + c.name, items: CORE.concat(c.extra), link: c.link })))};
  var CORE_N=${CORE.length};
  function byId(id){return document.getElementById(id);}
  function esc(s){return String(s).replace(/[&<>]/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;"}[m];});}
  function find(id){for(var i=0;i<DATA.length;i++){if(DATA[i].id===id)return DATA[i];}return DATA[0];}
  function render(){
    var c=find((byId("vc_country")||{}).value);
    var html="<h3 style=\\"margin:0 0 8px\\">"+esc(c.name)+" — student visa documents</h3><ul style=\\"list-style:none;padding:0;margin:0\\">";
    c.items.forEach(function(it,i){
      var tag=i<CORE_N?"Core":"Country-specific";
      html+="<li style=\\"display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line)\\">"
        +"<input type=\\"checkbox\\" class=\\"vc_chk\\" id=\\"vc_"+i+"\\" style=\\"margin-top:3px;width:18px;height:18px;flex:0 0 auto\\"/>"
        +"<label for=\\"vc_"+i+"\\" style=\\"cursor:pointer\\"><span style=\\"font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.03em\\">"+tag+"</span><br>"+esc(it)+"</label></li>";
    });
    html+="</ul>";
    if(c.link) html+="<p class=\\"note\\" style=\\"margin-top:10px\\">Full step-by-step: <a href=\\""+c.link+"\\">"+esc(c.name)+" guide</a>.</p>";
    var out=byId("vcList"); if(out){out.innerHTML=html; wire();}
  }
  function wire(){
    var chks=document.querySelectorAll(".vc_chk");
    function upd(){var done=0;chks.forEach(function(x){if(x.checked)done++;});var p=byId("vc_progress");if(p)p.textContent=done+" / "+chks.length+" ready";}
    chks.forEach(function(x){x.addEventListener("change",upd);}); upd();
  }
  var sel=byId("vc_country"); if(sel) sel.addEventListener("change",render);
  var pb=byId("vc_print"); if(pb) pb.addEventListener("click",function(){window.print();});
  render();
})();
</script>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › Student Visa Document Checklist</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">Printable</span><span class="badge">6 countries</span></div>
<h1>Student Visa Document Checklist (2026)</h1>
<p class="lead">A free, printable student-visa document checklist for the UK, Canada, Australia, USA, Germany and Ireland — the core documents everyone needs plus each country's specific extras. Tick items off as you gather them.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Every student visa needs the core set — passport, admission letter, proof of funds, English score, transcripts, photos, SOP, and the visa form + fee — plus country-specific documents: UK (CAS + TB test), Canada (Letter of Acceptance + GIC + PAL), USA (Form I-20 + SEVIS fee), Germany (blocked account + APS), Australia (CoE + OSHC). Pick your country below for the full checklist.</div>
${tool}
<div class="card"><h2>Before you fly — the day-you-land essentials</h2>
<p>Once your documents are in order, two things are worth sorting <strong>before</strong> departure so you're not stranded at the airport: a way to stay connected the moment you land, and a cheaper way to move money than an airport bank counter.</p>
<ul class="bcheck">
<li><strong>Connectivity on arrival</strong> — a travel eSIM activates before you fly, so you have data to call your ride, open maps and message home the instant you land — no roaming bill, no hunting for a local SIM desk.</li>
<li><strong>Your first money transfer</strong> — the mid-market rate beats a bank's counter rate for tuition and living-cost transfers; sort your account before you travel so the money's ready.</li>
</ul></div>
${affiliateBlock(["airalo"], "Stay connected the day you land")}
${faqBlock(faqs)}
${relatedGrid([
  { label: `🧮 Proof-of-funds calculator`, href: `/tools/proof-of-funds-calculator/` },
  { label: `🏦 Education loan guide`, href: `/study-abroad-education-loan/` },
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
  { label: `🎤 Visa interview coach`, href: `/#/colleges` },
])}`;
  emit(path, head({
    title: `Student Visa Document Checklist 2026 (Free, Printable) | ${BRAND}`,
    desc: `Free printable student-visa document checklist for the UK, Canada, Australia, USA, Germany & Ireland — core documents plus each country's specific requirements. Tick off as you go.`,
    path,
    kw: "student visa checklist, student visa document checklist, documents required for student visa, student visa requirements, first-time student visa application checklist, uk canada usa student visa documents",
    jsonLdBlocks: [
      jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "Student Visa Document Checklist", applicationCategory: "EducationalApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path, publisher: PUBLISHER }),
      faqJsonLd(faqs),
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "Student Visa Document Checklist", path }]),
    ],
  }) + shell(inner));
}
visaChecklistPage();

// ── Canada Express Entry CRS calculator — free tool. Uses the OFFICIAL IRCC
// point grid (single applicant, no spouse) for the core human-capital factors +
// additional points. Skill-transferability and spouse factors are intentionally
// left out (they need many extra inputs) — the page says so and links the official
// tool. Verified vs canada.ca/express-entry (Jul 2026; job-offer points removed Mar 2025). ──
function crsCalculatorPage() {
  const path = `/tools/canada-express-entry-crs-calculator/`;
  const OFFICIAL = "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score.html";
  const faqs = [
    { q: "What CRS score do I need for Canada PR?", a: "It varies by draw — recent Express Entry cut-offs for general draws have often been in the roughly 480–540 range, while category-based and PNP draws differ. A provincial nomination adds 600 points and effectively guarantees an invitation. Calculate your baseline above, then check current draw cut-offs on IRCC." },
    { q: "How is the CRS score calculated?", a: "Out of 1,200: up to 500 for core human capital (age, education, language, Canadian work experience), up to 100 for skill transferability, and up to 600 additional (a provincial nomination is 600; French, a sibling in Canada, and Canadian study add more). This calculator covers the core factors plus the common additional points for a single applicant." },
    { q: "Which IELTS do I need for Express Entry?", a: "Express Entry uses IELTS General Training (not Academic), converted to a CLB level per ability. Roughly, CLB 9 needs about Listening 8.0 / Reading 7.0 / Writing 7.0 / Speaking 7.0; CLB 7 needs about 6.0 in each. Higher CLB adds a lot of points, so language is often the fastest lever." },
    { q: "Does a job offer still add CRS points?", a: "No — IRCC removed points for a job offer in March 2025. A provincial nomination (+600) is now the main way to add a large block of points." },
  ];
  const eduOpts = [["", "Select…"], ["0", "Less than high school"], ["30", "High school"], ["90", "One-year diploma"], ["98", "Two-year diploma"], ["120", "Bachelor's / 3+ year degree"], ["128", "Two or more credentials (one 3+ yrs)"], ["135", "Master's / professional degree"], ["150", "Doctoral (PhD)"]].map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  const workOpts = [["0", "None"], ["40", "1 year"], ["53", "2 years"], ["64", "3 years"], ["72", "4 years"], ["80", "5+ years"]].map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  const tool = `
<div class="card">
  <h2>🍁 Estimate your CRS score (single applicant)</h2>
  <p class="note">Uses IRCC's official point grid. Covers core factors + common additional points; skill-transferability and spouse factors aren't included — for your exact score use the <a href="${OFFICIAL}" target="_blank" rel="nofollow noopener">official IRCC calculator ↗</a>.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:10px 0">
    <label>Age<input id="crs_age" type="number" inputmode="numeric" min="17" max="60" placeholder="e.g. 26" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Highest education<select id="crs_edu" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px">${eduOpts}</select></label>
    <label>Canadian work experience<select id="crs_work" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px">${workOpts}</select></label>
  </div>
  <div style="margin:6px 0 2px;font-weight:600;font-size:14px">IELTS (General Training) band per skill</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:4px 0">
    <label>Listening<input id="crs_l" type="number" step="0.5" min="0" max="9" placeholder="e.g. 8.0" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Reading<input id="crs_r" type="number" step="0.5" min="0" max="9" placeholder="e.g. 7.0" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Writing<input id="crs_w" type="number" step="0.5" min="0" max="9" placeholder="e.g. 7.0" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
    <label>Speaking<input id="crs_s" type="number" step="0.5" min="0" max="9" placeholder="e.g. 7.0" style="width:100%;padding:9px;border:1px solid var(--line);border-radius:8px;margin-top:4px"/></label>
  </div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin:8px 0">
    <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="crs_pnp" style="width:18px;height:18px"/> Provincial nomination (+600)</label>
    <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="crs_study" style="width:18px;height:18px"/> Canadian post-secondary study (+30)</label>
    <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="crs_sib" style="width:18px;height:18px"/> Sibling in Canada (+15)</label>
  </div>
  <button id="crs_btn" class="cta" type="button" style="border:0;cursor:pointer">Calculate my CRS →</button>
  <div id="crsOut" style="margin-top:12px"></div>
</div>
<script>
(function(){
  function byId(id){return document.getElementById(id);}
  function n(id){var v=parseFloat((byId(id)||{}).value);return isNaN(v)?0:v;}
  // Age -> points (single applicant)
  var AGE={17:0,18:99,19:105,30:105,31:99,32:94,33:88,34:83,35:77,36:72,37:66,38:61,39:55,40:50,41:39,42:28,43:17,44:6};
  function agePts(a){a=Math.floor(a);if(a<=17)return 0;if(a>=20&&a<=29)return 110;if(a>=45)return 0;return AGE[a]!==undefined?AGE[a]:0;}
  // IELTS GT band -> CLB, per ability (descending thresholds)
  var MAP={
    l:[[8.5,10],[8.0,9],[7.5,8],[6.0,7],[5.5,6],[5.0,5],[4.5,4]],
    r:[[8.0,10],[7.0,9],[6.5,8],[6.0,7],[5.0,6],[4.0,5],[3.5,4]],
    w:[[7.5,10],[7.0,9],[6.5,8],[6.0,7],[5.5,6],[5.0,5],[4.0,4]],
    s:[[7.5,10],[7.0,9],[6.5,8],[6.0,7],[5.5,6],[5.0,5],[4.0,4]]
  };
  var CLBPTS={10:34,9:31,8:23,7:17,6:9,5:6,4:6};
  function clb(ab,band){var t=MAP[ab];for(var i=0;i<t.length;i++){if(band>=t[i][0])return t[i][1];}return 0;}
  function langPts(){var abil=[["l","crs_l"],["r","crs_r"],["w","crs_w"],["s","crs_s"]];var total=0,minClb=99;
    abil.forEach(function(x){var c=clb(x[0],n(x[1]));minClb=Math.min(minClb,c);total+=(CLBPTS[c]||0);});
    return {pts:total,minClb:minClb===99?0:minClb};}
  function calc(){
    var age=agePts(n("crs_age"));
    var edu=parseInt((byId("crs_edu")||{}).value||"0",10)||0;
    var work=parseInt((byId("crs_work")||{}).value||"0",10)||0;
    var L=langPts();
    var core=age+edu+work+L.pts;
    if(core>500)core=500;
    var add=0;
    if(byId("crs_pnp").checked)add+=600;
    if(byId("crs_study").checked)add+=30;
    if(byId("crs_sib").checked)add+=15;
    var total=core+add;
    var out=byId("crsOut");if(!out)return;
    out.innerHTML='<div class="callout money"><span class="ic">🍁</span><div>'
      +'<strong>Estimated CRS: '+total+' / 1200</strong><br>'
      +'Age '+age+' · Education '+edu+' · Language '+L.pts+' (min CLB '+L.minClb+') · Canadian work '+work
      +(add?' · Additional '+add:'')+'<br>'
      +'<span style="color:var(--muted);font-size:13px">Baseline for a single applicant — <strong>skill-transferability (up to +100)</strong> and spouse factors are not included, so your official score may be higher. Check current draw cut-offs and your exact score on the <a href="'+"${OFFICIAL}"+'" target="_blank" rel="nofollow noopener">official IRCC calculator ↗</a>.</span></div></div>';
  }
  var b=byId("crs_btn");if(b)b.addEventListener("click",calc);
})();
</script>`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/tools">Tools</a> › Canada CRS Calculator</p>
<section class="hero"><div class="badges"><span class="badge">Free tool</span><span class="badge">Official IRCC grid</span><span class="badge">2026</span></div>
<h1>Canada Express Entry CRS Score Calculator (2026)</h1>
<p class="lead">Estimate your Comprehensive Ranking System (CRS) score for Canada's Express Entry — age, education, IELTS/language, Canadian work experience and additional points — using IRCC's official point grid. Free and instant.</p>
<a class="cta" href="/blog/canada-pr-express-entry-basics/">▶ How Express Entry works</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Your CRS score (out of 1,200) comes from age, education, language (IELTS→CLB), and work experience, plus additional points — a <strong>provincial nomination adds 600</strong>. Job-offer points were removed in March 2025. Enter your details below for a baseline, then confirm on IRCC's official tool.</div>
${tool}
<div class="card"><h2>How to raise your CRS score</h2><ul class="bcheck">
<li><strong>Language is the fastest lever</strong> — moving from CLB 7 to CLB 9 (about IELTS 8/7/7/7) adds a large block of points across all four abilities.</li>
<li><strong>A provincial nomination (+600)</strong> effectively guarantees an invitation — worth exploring if your baseline is short.</li>
<li><strong>Canadian study or work experience</strong> adds points and can qualify you for the Canadian Experience Class.</li>
<li><strong>French</strong> (even as a second language at CLB 7+) adds up to 50 points.</li>
</ul>
<p class="note"><strong>Last verified:</strong> ${esc(LASTMOD)} against IRCC's official CRS criteria. Point values change — confirm your exact score and current draw cut-offs on the <a href="${OFFICIAL}" target="_blank" rel="nofollow noopener">official IRCC calculator ↗</a>.</p></div>
${toolDepthBlock("canada-express-entry-crs-calculator")}
${faqBlock(faqs)}
${relatedGrid([
  { label: `📅 Latest Express Entry draws`, href: `/express-entry-draws-2026/` },
  { label: `🍁 Express Entry basics`, href: `/blog/canada-pr-express-entry-basics/` },
  { label: `🇨🇦 Study in Canada guide`, href: `/study-in-canada/` },
  { label: `🎯 Free IELTS mock test`, href: `/mock-test/ielts/` },
  { label: `💼 Canada PGWP guide`, href: `/blog/canada-pgwp-2026-guide/` },
])}`;
  emit(path, head({ title: `Canada CRS Score Calculator 2026 (Express Entry) — Free | ${BRAND}`, desc: `Free Canada Express Entry CRS calculator using IRCC's official point grid: age, education, IELTS/CLB language, Canadian work experience + additional points. Estimate your PR score instantly.`, path, kw: "crs calculator, express entry crs calculator, canada pr points calculator, crs score calculator 2026, express entry points, canada immigration points calculator, ielts clb crs", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "WebApplication", name: "Canada Express Entry CRS Calculator", applicationCategory: "EducationalApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, isAccessibleForFree: true, url: ORIGIN + path, publisher: PUBLISHER }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Tools", path: "/#/tools" }, { name: "Canada CRS Calculator", path }]),
  ] }) + shell(inner));
}
crsCalculatorPage();

// ── Express Entry draw tracker — timely, high-intent page. Draw data lives in
// content/express-entry-draws.json (update after each ~bi-weekly draw). Figures
// are exact IRCC ministerial-instruction results — never approximated. ──
function expressEntryDrawsPage() {
  const path = `/express-entry-draws-2026/`;
  let data;
  try { data = JSON.parse(readFileSync(join(ROOT, "content", "express-entry-draws.json"), "utf8").replace(/^﻿/, "")); }
  catch (e) { console.warn("express-entry-draws load failed:", e.message); return; }
  const draws = (data.draws || []);
  if (!draws.length) return;
  const fmtDate = (iso) => { const [y, m, d] = iso.split("-"); const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m - 1]; return `${+d} ${mo} ${y}`; };
  const latest = draws[0];
  const td = `padding:9px 12px;border-bottom:1px solid var(--line)`;
  const th = `text-align:left;padding:9px 12px;border-bottom:2px solid var(--line);font-weight:700`;
  const rows = draws.map((d) => `<tr><td style="${td}">${fmtDate(d.date)}</td><td style="${td}">${esc(d.category)}</td><td style="${td}">${d.itas.toLocaleString()}</td><td style="${td}"><strong>${d.crs}</strong></td></tr>`).join("");
  const cecs = draws.filter((d) => /Canadian Experience/i.test(d.category)).map((d) => d.crs);
  const cecRange = cecs.length ? `${Math.min(...cecs)}–${Math.max(...cecs)}` : "—";
  const src = data.source || "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/rounds-invitations.html";
  const faqs = [
    { q: "When is the next Express Entry draw?", a: "IRCC typically holds Express Entry rounds of invitations about every two weeks, though the schedule varies. This page lists the most recent draws; for the very latest round, always check the official IRCC rounds-of-invitations page." },
    { q: "What was the latest Express Entry draw?", a: `The most recent draw in our tracker was on ${fmtDate(latest.date)} — a ${esc(latest.category)} round that issued ${latest.itas.toLocaleString()} invitations with a CRS cut-off of ${latest.crs}. Update dates are shown on the page.` },
    { q: "What CRS score do I need for a CEC draw in 2026?", a: `Recent Canadian Experience Class (CEC) draws in 2026 have cut off around CRS ${cecRange}. Provincial Nominee (PNP) draws are much higher (a nomination adds 600 points), while French-language draws have been the most accessible (often around CRS 400). Estimate your score with the free CRS calculator.` },
    { q: "How has Express Entry changed in 2026?", a: "Two big shifts: (1) job-offer CRS points were removed in March 2025, and (2) IRCC has moved firmly to category-based selection — running targeted draws for CEC, PNP, French-language proficiency, healthcare, trades, physicians, and new-for-2026 categories (researchers/senior managers, transport, and skilled military recruits). Most renewed categories now require 12 months of Canadian work experience." },
    { q: "Which Express Entry category is easiest to get invited under?", a: "In 2026, French-language proficiency draws have had the lowest CRS cut-offs (often around 400), so strong French (CLB 7+) is a major advantage. Category-based draws for in-demand occupations (healthcare, trades, physicians) can also invite lower CRS scores than general or PNP rounds." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/study-in-canada/">Study in Canada</a> › Express Entry Draws</p>
<section class="hero"><div class="badges"><span class="badge">Live tracker</span><span class="badge">2026</span><span class="badge">IRCC data</span></div>
<h1>Canada Express Entry Draws 2026 (Latest Rounds &amp; CRS Cut-offs)</h1>
<p class="lead">The most recent Canada Express Entry rounds of invitations — dates, category, invitations (ITAs) issued and CRS cut-off scores — compiled from IRCC ministerial instructions. Updated as new draws are published.</p>
<a class="cta" href="/tools/canada-express-entry-crs-calculator/">▶ Calculate your CRS score (free)</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Latest draw:</strong> ${fmtDate(latest.date)} — <strong>${esc(latest.category)}</strong>, ${latest.itas.toLocaleString()} invitations, CRS cut-off <strong>${latest.crs}</strong>. Draws run roughly every two weeks; recent CEC rounds have cut off around CRS ${cecRange}. Check IRCC for the very latest.</div>

<div class="card"><h2>Recent Express Entry draws (2026)</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="${th}">Date</th><th style="${th}">Category</th><th style="${th}">Invitations</th><th style="${th}">CRS cut-off</th></tr></thead><tbody>${rows}</tbody></table>
<p class="note"><strong>Last updated: ${esc(data.lastUpdated || LASTMOD)}.</strong> Compiled from IRCC's <a href="${src}" target="_blank" rel="nofollow noopener">rounds of invitations ↗</a>. For the very latest round, always confirm on the official IRCC page.</p></div>

<div class="card"><h2>What the 2026 numbers tell you</h2><ul class="bcheck">
<li><strong>CEC draws</strong> have been steady around CRS ${cecRange} — the core route for candidates with Canadian work experience.</li>
<li><strong>PNP draws</strong> show very high cut-offs because a provincial nomination adds 600 CRS points; the score reflects nominees, not the general pool.</li>
<li><strong>French-language draws</strong> have been the most accessible (often around CRS 400) — strong French is a powerful lever.</li>
<li><strong>Category-based selection</strong> now dominates: targeted rounds for healthcare, trades, physicians, and the new-for-2026 researchers, transport and military categories.</li>
</ul></div>

<div class="card"><h2>How to improve your CRS score</h2>
<p>Your best levers are language (moving to CLB 9 adds a large block of points), provincial nomination (+600), Canadian study or work experience, and French. Estimate your baseline with the free <a href="/tools/canada-express-entry-crs-calculator/">Express Entry CRS calculator</a>, then read <a href="/blog/canada-pr-express-entry-basics/">how Express Entry works</a> and the full <a href="/study-in-canada/">study-in-Canada guide</a>.</p></div>

<div class="card"><h2>Methodology &amp; source</h2><p>Draw dates, categories, invitation counts and CRS cut-offs are taken from IRCC's official rounds of invitations (ministerial instructions), cross-checked against immigration-news reporting, and updated as new draws are published. This is a free reference, not immigration advice — confirm the latest round and your eligibility on the official <a href="${src}" target="_blank" rel="nofollow noopener">IRCC rounds-of-invitations page ↗</a> before acting. You may cite this page with a link.</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `🧮 CRS score calculator`, href: `/tools/canada-express-entry-crs-calculator/` },
  { label: `🍁 How Express Entry works`, href: `/blog/canada-pr-express-entry-basics/` },
  { label: `🇨🇦 Study in Canada guide`, href: `/study-in-canada/` },
  { label: `💼 Canada PGWP guide`, href: `/blog/canada-pgwp-2026-guide/` },
])}`;
  emit(path, head({
    title: `Canada Express Entry Draws 2026 — Latest Rounds & CRS Cut-offs | ${BRAND}`,
    desc: `Latest Canada Express Entry draws 2026: dates, category, invitations and CRS cut-off scores from IRCC data. Newest round ${fmtDate(latest.date)} (${esc(latest.category)}, CRS ${latest.crs}). Free CRS calculator.`,
    path,
    kw: "express entry draws 2026, latest express entry draw, canada pr draw, cec draw 2026, express entry cut off score, crs cut off 2026, express entry latest draw, canada invitation to apply",
    jsonLdBlocks: [
      jsonld({ "@context": "https://schema.org", "@type": "Article", headline: "Canada Express Entry Draws 2026: Latest Rounds & CRS Cut-offs", description: "Recent Canada Express Entry rounds of invitations with dates, categories, ITAs and CRS cut-offs, 2026.", author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-01-01", dateModified: data.lastUpdated || LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
      faqJsonLd(faqs),
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study in Canada", path: "/study-in-canada/" }, { name: "Express Entry Draws", path }]),
    ],
  }) + shell(inner));
}
expressEntryDrawsPage();

// ── Cheapest countries to study abroad 2026 — data study / linkable asset.
// Ranks top destinations by indicative total first-year cost (public-university
// tuition + the country's official living-cost figure). Funds figures are the
// verified official ones; tuition + USD conversions are indicative ranges. ──
function cheapestCountriesPage() {
  const path = `/cheapest-countries-to-study-abroad-2026/`;
  const th = `text-align:left;padding:10px 12px;border-bottom:2px solid var(--line);font-weight:700`;
  const td = `padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top`;
  // rank, country, public tuition (indicative/yr), official living/funds, indicative total USD/yr, note
  const rows = [
    ["1", "🇩🇪 Germany", "Free–€1,500 (public)", "€11,904 blocked account", "≈ $13,000–15,000", "Tuition-free public universities make it the cheapest by far; you mainly fund living costs."],
    ["2", "🇮🇪 Ireland", "€10,000–25,000", "€10,000 proof of funds", "≈ $23,000–38,000", "Lower living costs outside Dublin; strong tech/pharma job market."],
    ["3", "🇨🇦 Canada", "CAD 15,000–40,000", "CAD 22,895 + tuition (GIC)", "≈ $26,000–46,000", "Public tuition is moderate; the GIC is returned to you. Strong study-to-PR path."],
    ["4", "🇦🇺 Australia", "AUD 15,000–45,000", "AUD 29,710 living capacity", "≈ $29,000–50,000", "Higher living-cost benchmark; strong graduate work rights."],
    ["5", "🇬🇧 UK", "£11,400–38,000", "£1,171–1,529/mo maintenance", "≈ $27,000–65,000", "One-year master's shortens total spend even though yearly cost is high."],
    ["6", "🇺🇸 USA", "$20,000–55,000+", "First-year cost of attendance", "≈ $35,000–75,000", "Widest range; assistantships and scholarships can cut the net cost sharply."],
  ];
  const body = rows.map((r) => `<tr><td style="${td}"><strong>${r[0]}</strong></td><td style="${td}"><strong>${r[1]}</strong></td><td style="${td}">${r[2]}</td><td style="${td}">${r[3]}</td><td style="${td}"><strong>${r[4]}</strong></td><td style="${td}">${r[5]}</td></tr>`).join("");
  const faqs = [
    { q: "Which is the cheapest country to study abroad in 2026?", a: "Germany is the cheapest of the major destinations because public universities charge little or no tuition — you mainly need to cover living costs (about €11,904/year in a blocked account). Ireland and Canada are the next most affordable for many students. The USA and Australia tend to be the most expensive on a total-cost basis, though scholarships and assistantships can change that." },
    { q: "How was this ranking calculated?", a: "By indicative total first-year cost = typical public-university tuition + the country's official living-cost/proof-of-funds figure, converted to approximate US dollars. The living-cost and proof-of-funds figures are the official government amounts (verified against each authority); tuition ranges and USD conversions are indicative and vary by university, city and exchange rate." },
    { q: "Can scholarships or loans make an expensive country affordable?", a: "Yes. Scholarships (e.g. DAAD in Germany, university awards in the UK/USA), graduate assistantships in the USA, and education loans can substantially cut the net cost — sometimes making a 'pricey' country cheaper than a 'cheap' one for a given student. Model your own numbers with the cost and loan calculators." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/colleges">Study abroad</a> › Cheapest Countries 2026</p>
<section class="hero"><div class="badges"><span class="badge">Free data study</span><span class="badge">2026</span><span class="badge">Cite freely</span></div>
<h1>Cheapest Countries to Study Abroad in 2026 (Ranked by Total Cost)</h1>
<p class="lead">A free, citable ranking of the top study destinations by indicative total first-year cost — public-university tuition plus each country's official living-cost requirement. Germany comes out cheapest; the USA the most expensive.</p></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Ranked cheapest to most expensive by total first-year cost (2026): <strong>1. Germany (≈ $13–15k)</strong>, 2. Ireland (≈ $23–38k), 3. Canada (≈ $26–46k), 4. Australia (≈ $29–50k), 5. UK (≈ $27–65k), 6. USA (≈ $35–75k). Germany wins because public-university tuition is free — you mainly fund living costs.</div>

<div class="card"><h2>Cheapest study-abroad destinations, ranked (2026)</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px"><thead><tr><th style="${th}">#</th><th style="${th}">Country</th><th style="${th}">Public tuition / yr</th><th style="${th}">Official living / funds</th><th style="${th}">Indicative total / yr</th><th style="${th}">Notes</th></tr></thead><tbody>${body}</tbody></table>
<p class="note">Totals are indicative (tuition ranges + official living-cost figure, converted to approximate USD) and vary by university, city and exchange rate. Living-cost/proof-of-funds figures are the official government amounts — see the verified <a href="/study-abroad-funding-facts-2026/">funding facts 2026</a>.</p></div>

<div class="card"><h2>How to bring the cost down further</h2><ul class="bcheck">
<li><strong>Pick tuition-free or low-tuition public universities</strong> (Germany, and public options in Ireland/Canada).</li>
<li><strong>Apply for scholarships</strong> early — <a href="/fully-funded-scholarships/">fully-funded scholarships</a> and country awards.</li>
<li><strong>Use an education loan wisely</strong> — pay interest during study; see the <a href="/study-abroad-education-loan/">education-loan guide</a> and <a href="/tools/education-loan-emi-calculator/">EMI calculator</a>.</li>
<li><strong>Work part-time</strong> within your visa's limit to offset living costs.</li>
</ul></div>

<div class="card"><h2>Methodology &amp; sources</h2><p><strong>Last verified: ${esc(LASTMOD)}.</strong> Ranking = indicative total first-year cost (typical public-university tuition + the official living-cost / proof-of-funds figure), converted to approximate US dollars. Living-cost and proof-of-funds figures are the official government amounts, verified against the German Federal Foreign Office, IRCC, UKVI, the Australian Department of Home Affairs, the Irish Immigration Service and the US Department of State (linked in the <a href="/study-abroad-funding-facts-2026/">funding facts</a>). Tuition ranges and USD conversions are indicative and change with exchange rates and by university. This is a free reference, not financial advice — confirm current figures before you rely on them.</p>
<p class="note"><strong>Cite this study:</strong> LandingPrep (${esc(BUILD_DATE.slice(0, 4))}). <em>Cheapest Countries to Study Abroad in 2026 (Ranked by Total Cost).</em> Retrieved from ${ORIGIN}${path}</p></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `📊 Funding facts 2026`, href: `/study-abroad-funding-facts-2026/` },
  { label: `🧮 Cost of studying abroad`, href: `/tools/cost-of-studying-abroad-calculator/` },
  { label: `🇩🇪 Study in Germany (cheapest)`, href: `/study-in-germany/` },
  { label: `💸 Fully-funded scholarships`, href: `/fully-funded-scholarships/` },
  { label: `🏦 Education loan guide`, href: `/study-abroad-education-loan/` },
])}`;
  // Was "Cheapest Countries to Study Abroad 2026 (Ranked by Total Cost)": the parenthetical —
  // the only thing distinguishing it from /blog/cheapest-countries-to-study-abroad/ — did not
  // survive the 60-char clamp, so two indexed pages shipped an identical title and competed
  // with each other. This one is the citable cost DATASET, so say that inside the budget.
  emit(path, head({ title: `Cheapest Study Abroad Countries: 2026 Costs | ${BRAND}`, desc: `Free 2026 data study ranking the cheapest countries to study abroad by total first-year cost (tuition + official living funds): Germany, Ireland, Canada, Australia, UK, USA. Citable reference.`, path, kw: "cheapest countries to study abroad, cheapest country to study abroad 2026, affordable study abroad destinations, study abroad cost by country, cheapest place to study masters abroad, low cost study abroad", jsonLdBlocks: [
    jsonld({ "@context": "https://schema.org", "@type": "Dataset", name: "Cheapest Countries to Study Abroad 2026", description: "Top study-abroad destinations ranked by indicative total first-year cost (public tuition + official living-cost figure), 2026.", isAccessibleForFree: true, creator: PUBLISHER, publisher: PUBLISHER, url: ORIGIN + path, license: "https://creativecommons.org/licenses/by/4.0/", dateModified: LASTMOD, temporalCoverage: "2026", spatialCoverage: ["Germany", "Ireland", "Canada", "Australia", "United Kingdom", "United States"], variableMeasured: ["Public-university tuition (indicative)", "Official living-cost / proof-of-funds", "Indicative total first-year cost"], creditText: "LandingPrep — Cheapest Countries to Study Abroad 2026" }),
    faqJsonLd(faqs),
    breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Study abroad", path: "/#/colleges" }, { name: "Cheapest Countries 2026", path }]),
  ] }) + shell(inner));
}
cheapestCountriesPage();
fundingFactsPage();
(() => {
  const byCountry = {};
  COLLEGES.forEach((c) => { (byCountry[c.country] = byCountry[c.country] || []).push(c); });
  Object.keys(byCountry).forEach((country) => intakeDeadlinePage(country, byCountry[country]));
  intakeDeadlineIndex(byCountry);
})();
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
      { q: "Is the German course on LandingPrep really free?", a: "Yes — the German A1 course, vocabulary with natural-voice pronunciation, speaking practice and mock tests are 100% free with no signup and no payment." },
      { q: "What level of German do I need to study in Germany?", a: "Most German-taught degrees require B1–B2 (TestDaF or DSH); many English-taught Master's programmes need no German. Start at A1 here and build up." },
      { q: "Which German exam should I take?", a: "The Goethe-Zertifikat is the most widely recognised worldwide; TestDaF and DSH are used for university admission. Pick the one your university accepts." },
      { q: "Can I practise speaking German for free?", a: "Yes — our hands-free speaking partner holds a real two-way German conversation, gently auto-corrects your mistakes, replies in a natural German voice and shows the English translation. Just press Start and talk." },
    ],
  },
  french: {
    name: "French", native: "Français", slug: "learn-french", flag: "🇫🇷",
    countries: "France, Belgium, Switzerland and Québec (Canada)", tuition: "low-tuition public universities in France",
    exams: "DELF (A1–B2), DALF (C1–C2), TCF and TEF",
    units: ["Greetings &amp; introductions", "Numbers &amp; everyday words", "Articles &amp; gender (le/la/les)", "Key verbs: être &amp; avoir", "Survival French for daily life"],
    kw: "learn french free, free french course online, french a1, learn french for beginners, delf a1 practice, french for study abroad, free french lessons, french vocabulary with audio, french speaking practice ai, french mock test free, study in france language, tcf tef practice free",
    faqs: [
      { q: "Is the French course free?", a: "Yes — the French A1 course, vocabulary with native-voice pronunciation, speaking practice and mock tests are completely free with no signup." },
      { q: "What French level do I need to study in France?", a: "Most French-taught degrees want B2 (DELF/DALF or TCF). Campus France guides the level; English-taught programmes may need none. Start A1 here." },
      { q: "Which French exam is best for Canada?", a: "For Canadian immigration, the TEF and TCF are accepted (Express Entry). For study, DELF/DALF and TCF are widely recognised." },
      { q: "Can I practise speaking French with AI?", a: "Yes — our hands-free speaking partner chats with you in simple French, gently auto-corrects your mistakes, speaks in a natural French voice and shows English translations. Just press Start and talk." },
    ],
  },
  spanish: {
    name: "Spanish", native: "Español", slug: "learn-spanish", flag: "🇪🇸",
    countries: "Spain, Mexico and across Latin America", tuition: "low-tuition public universities in Spain and Latin America",
    exams: "DELE (A1–C2), SIELE and CCSE",
    units: ["Greetings &amp; introductions", "Numbers, days &amp; time", "Articles &amp; gender (el/la/los/las)", "Ser vs estar &amp; key verbs", "Survival Spanish for uni, shops &amp; café"],
    kw: "learn spanish free, free spanish course online, spanish a1, learn spanish for beginners, dele a1 practice, siele practice free, spanish for study abroad, free spanish lessons, spanish vocabulary with audio, spanish speaking practice ai, spanish mock test free, study in spain language requirement, learn spanish online free for beginners",
    faqs: [
      { q: "Is the Spanish course on LandingPrep really free?", a: "Yes — the Spanish A1 course, vocabulary with natural-voice pronunciation, speaking practice and DELE-style mock tests are 100% free with no signup and no payment." },
      { q: "What level of Spanish do I need to study in Spain?", a: "Most Spanish-taught degrees require B1–B2 (DELE or SIELE); many English-taught programmes need no Spanish. Start at A1 here and build up." },
      { q: "Which Spanish exam should I take?", a: "The DELE (issued by Instituto Cervantes) is the most recognised worldwide and is lifelong; SIELE is faster and fully digital. The CCSE is needed for Spanish nationality. Pick the one your university or pathway accepts." },
      { q: "Can I practise speaking Spanish for free?", a: "Yes — our hands-free speaking partner holds a real two-way Spanish conversation, gently auto-corrects your mistakes, replies in a natural Spanish voice and shows the English translation. Just press Start and talk." },
    ],
  },
};

/**
 * Per-exam practice-library facts, measured from content/<exam>/ at build time.
 *
 * The /learn/<exam>/ pages were all ~624 words because everything except the note
 * tiles was prose shared verbatim across all 11 exams. This gives each page real
 * material the other ten cannot have. It is derived from the shipped test files —
 * the same files the format validator and the answerability audit check — so the
 * numbers on the page are the numbers a student actually gets, not a claim.
 */
// Cache lives on the function object, NOT in a module-level `const`. Page builders that
// call examFacts() are declared EARLIER in this file than this point, and a `const` cache
// would sit in the temporal dead zone when they run — which is exactly what happened:
// toolPage() threw "Cannot access 'EXAM_FACTS_CACHE' before initialization" at build.
// A function declaration hoists completely, so a property on it is always reachable.
function examFacts(exam) {
  const CACHE = examFacts._cache || (examFacts._cache = {});
  if (CACHE[exam]) return CACHE[exam];
  const base = join(ROOT, "content", exam);
  const out = { sections: [], tests: 0, questions: 0 };
  if (!existsSync(base)) return (CACHE[exam] = out);
  for (const sec of readdirSync(base)) {
    const sd = join(base, sec);
    let st; try { st = statSync(sd); } catch { continue; }
    if (!st.isDirectory()) continue;
    let tests = 0, qs = 0, mins = 0;
    for (const f of readdirSync(sd)) {
      if (!f.endsWith(".json")) continue;
      let j; try { j = JSON.parse(readFileSync(join(sd, f), "utf8").replace(/^﻿/, "")); } catch { continue; }
      const n = Array.isArray(j.questions) ? j.questions.length : (j.questionCount || 0);
      if (!n) continue;
      tests++; qs += n;
      if (j.durationSeconds) mins += Math.round(j.durationSeconds / 60);
    }
    if (tests) out.sections.push({ sec, tests, qs, perTest: Math.round(qs / tests), mins: tests ? Math.round(mins / tests) : 0 });
  }
  out.sections.sort((a, b) => b.qs - a.qs);
  out.tests = out.sections.reduce((s, x) => s + x.tests, 0);
  out.questions = out.sections.reduce((s, x) => s + x.qs, 0);
  return (CACHE[exam] = out);
}

// Function declaration, not a const arrow — same temporal-dead-zone reason as above:
// callers earlier in the file would hit TDZ on a `const`.
function SECTION_LABEL(s) {
  return String(s).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function examFactsBlock(exam, e) {
  const f = examFacts(exam);
  if (!f.sections.length) return "";
  const EX = exam.toUpperCase();
  const rows = f.sections.map((s) =>
    `<tr><td><a href="/mock-test/${exam}/">${esc(SECTION_LABEL(s.sec))}</a></td><td>${s.tests}</td><td>${s.perTest}</td>` +
    `<td>${s.mins ? s.mins + " min" : "untimed"}</td><td>${s.qs.toLocaleString("en-IN")}</td></tr>`).join("");
  const biggest = f.sections[0];
  const secList = f.sections.map((s) => SECTION_LABEL(s.sec)).join(", ");
  return `<div class="card"><h2>What the free ${EX} practice library actually contains</h2>
<p>Numbers below are counted from the ${EX} test files this site ships, at build time — not an estimate. Every one of these questions is checked before release: the answer key must match an option a student can actually select, and no test may be gameable by picking the same letter throughout.</p>
<div style="overflow-x:auto"><table class="tbl"><thead><tr><th>Section</th><th>Tests</th><th>Questions per test</th><th>Time per test</th><th>Total questions</th></tr></thead><tbody>${rows}</tbody></table></div>
<p>That is <strong>${f.tests} ${EX} practice tests</strong> covering <strong>${f.questions.toLocaleString("en-IN")} questions</strong> across ${f.sections.length} section${f.sections.length === 1 ? "" : "s"} — ${esc(secList)} — all free, with no signup and no attempt limit. ${esc(SECTION_LABEL(biggest.sec))} is the deepest section at ${biggest.tests} tests.</p>
${e ? `<p>${esc(e.name)} is scored on <strong>${esc(e.score)}</strong> and is taken for ${esc(e.for)}. It is accepted by ${esc(e.accepted)}. The live paper is organised as ${esc(e.sections)}, and the practice tests above follow that structure section by section rather than mixing question types into one undifferentiated pool.</p>` : ""}
<p>Use the notes on this page to learn a concept, then a full <a href="/mock-test/${exam}/">${EX} mock test</a> to see whether it survives timed conditions. The gap between those two is where most preparation quietly fails: material feels learned when reviewed and disappears when tested, which is exactly the gap active recall is designed to close.</p></div>`;
}

// ── Smart Notes: prerender each note at /learn/<exam>/<slug>/ + per-exam index ──
function smartNotesPages() {
  const base = join(ROOT, "content", "smart-notes");
  if (!existsSync(base)) return;
  const byExam = {};
  const manifest = {}; // Manifest of notes for the app: { exam: [{id,title,section,estMinutes,slug},...] }
  for (const exam of readdirSync(base)) {
    // GUARD: skip non-directories (e.g., index.json)
    const ed = join(base, exam);
    if (!statSync(ed).isDirectory()) continue;

    const notes = [];
    const examNotes = []; // For manifest
    for (const f of readdirSync(ed)) {
      if (!f.endsWith(".json")) continue;
      let n; try { n = JSON.parse(readFileSync(join(ed, f), "utf8").replace(/^﻿/, "")); } catch (e) { console.warn("smart-note skip", f, e.message); continue; }
      const slug = n.id.replace(new RegExp("^" + exam + "-"), "");
      const path = `/learn/${exam}/${slug}/`;
      const faqs = (n.recall || []).map((r) => ({ q: r.q, a: r.a }));
      const mapHtml = `<ul class="sn-map"><li><strong>${esc(n.conceptMap.central)}</strong><ul>${n.conceptMap.nodes.map((x) => `<li><strong>${esc(x.label)}</strong> — ${esc(x.note)}</li>`).join("")}</ul></li></ul>`;
      const chunks = n.chunks.map((c) => `<div class="card"><h2>${esc(c.heading)}</h2><p>${mdInline(esc(c.body))}</p><div class="callout tip"><span class="ic">💡</span><div><strong>Real example:</strong> ${esc(c.realExample)}</div></div><div class="callout"><strong>🧠 Memory hook:</strong> ${esc(c.memoryHook)}</div></div>`).join("");
      const noteDepth = (() => {
        const nodes = (n.conceptMap && Array.isArray(n.conceptMap.nodes)) ? n.conceptMap.nodes.filter((x) => x && x.label) : [];
        if (!nodes.length) return "";
        const EXU = exam.toUpperCase();
        const ff = examFacts(exam);
        const central = String((n.conceptMap && n.conceptMap.central) || n.title);
        return `<div class="card"><h2>Test yourself before you move on</h2>
<p>Re-reading a note feels like learning and produces almost none. The retrieval below is what actually builds the memory, so cover the map above and answer these from memory — out loud or written down, not in your head, because "I know this" is the feeling that fails under exam pressure.</p>
<ol class="bsteps">${nodes.map((x) => `<li>Without looking: what is <strong>${esc(String(x.label))}</strong>, and how does it connect to ${esc(central)}?</li>`).join("")}</ol>
<p>Anything you could not produce is the part of this note you have not learned yet — regardless of how familiar it felt while reading. Re-read only that node, then re-test the whole set. Testing the whole set matters: recalling one idea in isolation is easier than recalling it among ${nodes.length} competing ones, which is the situation the exam actually puts you in.</p>
<h2>When to come back to this note</h2>
<p>Spacing is not a scheduling detail, it is the mechanism. Meeting this material again just as it starts to fade forces the effortful retrieval that consolidates it, which is why a note reviewed four times across three weeks outlasts the same note read four times in one evening. The built-in scheduler resurfaces these questions at widening intervals for exactly that reason — the prompt arriving when you feel you have half-forgotten is the system working, not failing.</p>
<p>A practical rhythm for ${esc(central)}: today, again tomorrow, then after three days, then after a week. If you fail a review, shorten the next interval rather than re-reading the note end to end — the failure identifies the gap precisely, and re-reading everything wastes the diagnosis.</p>
${ff && ff.sections.length ? `<p><strong>Then apply it under pressure.</strong> Knowing a concept in isolation and using it in a timed paper are different skills, and only the second is examined. There are <strong>${ff.tests} free ${EXU} practice tests</strong> here covering <strong>${ff.questions.toLocaleString("en-IN")} questions</strong> — counted from the test files, not estimated. <a href="/mock-test/${exam}/">Take a full timed ${EXU} mock →</a></p>` : ""}</div>`;
      })();
      const inner = `<p class="crumb"><a href="/">Home</a> › <a href="/learn/${exam}/">${exam.toUpperCase()} Smart Notes</a> › ${esc(n.title)}</p>
<section class="hero"><div class="badges"><span class="badge">Smart Note</span><span class="badge">${n.estMinutes} min</span></div><h1>${esc(n.title)}</h1><p class="lead">${esc(n.summary)}</p></section>
<div class="card"><h2>The big picture</h2>${mapHtml}</div>${chunks}
${noteDepth}
${faqBlock(faqs)}
${relatedGrid([
  EXAMS[exam] ? { label: `🎯 Free ${exam.toUpperCase()} mock test`, href: `/mock-test/${exam}/` } : { label: `🏛️ Free College Predictor`, href: `/#/colleges` },
  { label: `📚 More ${exam.toUpperCase()} Smart Notes`, href: `/learn/${exam}/` },
  { label: `📚 All Smart Notes`, href: `/learn/` },
])}`;
      emit(path, head({ title: `${n.title} | ${BRAND}`, desc: n.summary, path,
        kw: `${n.title.toLowerCase()}, ${exam} ${n.section} notes, ${exam} ${n.section} tips`,
        jsonLdBlocks: [
          jsonld({ "@context": "https://schema.org", "@type": "LearningResource", name: n.title, description: n.summary, learningResourceType: "concept-map study notes", educationalUse: "self-study", teaches: n.conceptMap.central, timeRequired: `PT${n.estMinutes}M`, isAccessibleForFree: true, inLanguage: "en-IN", audience: { "@type": "EducationalAudience", educationalRole: "student" }, provider: PUBLISHER, url: ORIGIN + path }),
          jsonld({ "@context": "https://schema.org", "@type": "Article", headline: n.title, description: n.summary, author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-01-01", dateModified: LASTMOD, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
          faqJsonLd(faqs),
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `${exam.toUpperCase()} Smart Notes`, path: `/learn/${exam}/` }, { name: n.title, path }]),
        ] }) + shell(inner));
      notes.push({ path, title: n.title, summary: n.summary, mins: n.estMinutes });
      examNotes.push({ id: n.id, title: n.title, section: n.section, estMinutes: n.estMinutes, slug });
    }
    if (notes.length) {
      byExam[exam] = notes;
      manifest[exam] = examNotes;
    }
  }
  // Write app manifest
  if (Object.keys(manifest).length > 0) {
    const manifestPath = join(base, "index.json");
    writeFileSafe(manifestPath, JSON.stringify(manifest, null, 2));
  }
  for (const [exam, notes] of Object.entries(byExam)) {
    const path = `/learn/${exam}/`;
    const EX = exam.toUpperCase();
    const e = EXAMS[exam];
    const examName = e ? e.name : EX;
    const mins = notes.map((t) => t.mins || 0);
    const lo = Math.min(...mins), hi = Math.max(...mins);
    const totalMins = mins.reduce((s, m) => s + m, 0);
    const tiles = notes.map((t) => `<a class="tile" href="${t.path}"><strong>${esc(t.title)}</strong><span class="muted"> · ${t.mins} min</span><br><span class="muted">${esc(t.summary)}</span></a>`).join("");
    const faqs = [
      { q: `Are the ${EX} Smart Notes free?`, a: `Yes — all ${notes.length} ${EX} Smart Notes are completely free. No signup, no paywall, and no limit on how often you revise them.` },
      { q: `How long do the ${EX} Smart Notes take?`, a: `Each note takes about ${lo === hi ? lo : `${lo}–${hi}`} minutes, so the full ${EX} set is roughly ${totalMins} minutes of focused reading — deliberately short enough to finish one in a single sitting.` },
      { q: `What makes a Smart Note different from a normal ${EX} study guide?`, a: `A normal guide optimises for coverage; a Smart Note optimises for memory. Each one gives you a visual concept map, 3–5 short chunks with a real example and a memory hook, and five active-recall questions. Active recall and spaced repetition are the two study techniques with the strongest evidence behind them.` },
      { q: `How should I use these notes to prepare for ${examName}?`, a: `Read one note, study its concept map before the detail, then answer the five recall questions from memory. Revisit when the built-in scheduler resurfaces the note — the spacing is what moves it into long-term memory. Pair the notes with full practice to apply what you have revised.` },
      ...(() => {
        const f = examFacts(exam);
        if (!f.sections.length) return [];
        const b = f.sections[0];
        return [
          { q: `How many free ${EX} practice questions are there?`, a: `${f.questions.toLocaleString("en-IN")} questions across ${f.tests} ${EX} practice tests, covering ${f.sections.map((s) => SECTION_LABEL(s.sec)).join(", ")}. The count is measured from the test files themselves at build time, so it cannot drift away from what you actually get. ${SECTION_LABEL(b.sec)} is the deepest section with ${b.tests} tests of about ${b.perTest} questions each.` },
          { q: `Are the ${EX} practice tests checked for errors?`, a: `Yes, on every build. Each question is verified to have an answer key matching an option a student can actually select — a check that caught 227 unanswerable questions when it was first introduced. Tests are also checked so that no paper can be scored well by picking the same letter throughout, and the answer key stored with each test must agree with the per-question key.` },
          ...(e ? [{ q: `How is ${examName} scored?`, a: `${examName} is reported on ${e.score} and is taken for ${e.for}. It is accepted by ${e.accepted}. The paper is organised as ${e.sections}, and the practice tests here follow that same section structure.` }] : []),
        ];
      })(),
    ];
    const inner = `<p class="crumb"><a href="/">Home</a> › <a href="/learn/">Smart Notes</a> › ${EX}</p>
<section class="hero"><div class="badges"><span class="badge">${notes.length} free notes</span><span class="badge">Concept maps</span><span class="badge">Spaced repetition</span></div>
<h1>${EX} Smart Notes — Visual, Memorable Lessons</h1>
<p class="lead">Short, visual lessons with concept maps, real examples and built-in spaced-repetition recall for ${examName}. ${notes.length} free notes, about ${totalMins} minutes in total.</p></section>
<div class="card"><div class="grid">${tiles}</div></div>
<div class="card"><h2>How to revise ${EX} with Smart Notes</h2><ul class="bcheck">
<li><strong>One note, one sitting.</strong> Each note is ${lo === hi ? lo : `${lo}–${hi}`} minutes. Don't binge them — spacing beats cramming, and the notes are built to be returned to.</li>
<li><strong>Start with the concept map.</strong> It shows how the ideas connect <em>before</em> you read the detail, so the detail has something to attach to instead of floating loose.</li>
<li><strong>Read the chunks, not a wall of text.</strong> Every chunk carries a real example and a memory hook — something you can actually retrieve under exam pressure.</li>
<li><strong>Always answer the five recall questions.</strong> Pulling an answer out of memory is what builds it. Re-reading feels productive but barely shifts retention.</li>
<li><strong>Come back when prompted.</strong> The scheduler resurfaces each note just before you'd naturally forget it — that timing is the whole point.</li>
</ul></div>
<div class="card"><h2>Why this format works</h2>
<p>Most ${EX} revision fails for the same reason: highlighting and re-reading feel like learning but produce weak, short-lived memories. Smart Notes are built around the two techniques that consistently outperform them in learning research — <strong>active recall</strong> (retrieving an answer instead of reviewing it) and <strong>spaced repetition</strong> (meeting the material again at widening intervals).</p>
<p>The visual concept map adds a third layer: seeing a topic's structure as a picture as well as words gives you two routes back to the same memory, which is why a diagram often sticks when a paragraph doesn't. Each note is deliberately small so you can finish it, recall it, and move on — rather than abandoning a 40-page PDF halfway.</p></div>
${examFactsBlock(exam, e)}
${faqBlock(faqs)}
${relatedGrid([
  { label: `📚 All Smart Notes (every exam)`, href: `/learn/` },
  ...(e ? [{ label: `📝 Free ${EX} full mock test`, href: `/mock-test/${exam}/` }] : [{ label: `🎓 Free College Predictor`, href: `/#/colleges` }]),
  { label: `🌍 ${EX} score requirements by country`, href: `/eligibility/` },
  { label: `🔄 Score converter`, href: `/tools/english-test-score-converter/` },
  { label: `🎯 All free exams`, href: `/#/exam-prep` },
])}`;
    emit(path, head({ title: `${EX} Smart Notes — Visual Lessons & Concept Maps | ${BRAND}`, desc: `Free ${EX} Smart Notes: ${notes.length} visual lessons with concept maps, real examples and spaced-repetition recall. No signup.`, path, kw: `${exam} notes, ${exam} lessons, ${exam} concept map, ${exam} study notes, ${exam} revision notes, free ${exam} notes`, jsonLdBlocks: [
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Smart Notes", path: "/learn/" }, { name: `${EX} Smart Notes`, path }]),
      jsonld({ "@context": "https://schema.org", "@type": "ItemList", name: `${EX} Smart Notes`, numberOfItems: notes.length, itemListElement: notes.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: ORIGIN + t.path, name: t.title })) }),
      faqJsonLd(faqs),
    ] }) + shell(inner));
  }
  // ── Top-level /learn/ hub listing every exam's Smart Notes ──
  const examList = Object.entries(byExam);
  if (examList.length) {
    const path = `/learn/`;
    const totalNotes = examList.reduce((s, [, ns]) => s + ns.length, 0);
    const examNames = examList.map(([e]) => e.toUpperCase()).join(", ");
    const cards = examList.map(([exam, ns]) => `<a class="tile" href="/learn/${exam}/"><strong>${exam.toUpperCase()} Smart Notes</strong><span class="muted"> · ${ns.length} lessons</span><br><span class="muted">Concept maps, real examples, memory hooks &amp; spaced-repetition recall for ${exam.toUpperCase()}.</span></a>`).join("");
    const hubFaqs = [
      { q: "What are Smart Notes?", a: "Smart Notes are short, visual lessons that make an exam topic easy to learn and hard to forget. Each note has a one-glance concept map, three to five chunked explanations that each include a real example and a memory hook, and a five-question recall quiz that schedules itself for spaced review — so what you learn actually sticks." },
      { q: "Which exams have Smart Notes?", a: `Smart Notes currently cover ${examNames} — ${totalNotes} free lessons in total, with more topics added over time.` },
      { q: "Are Smart Notes really free?", a: "Yes — every Smart Note is 100% free, with no signup, no credit card and no paywall, like everything on LandingPrep." },
      { q: "How do Smart Notes help me remember more?", a: "They combine three evidence-based techniques: a visual concept map (dual coding), a short recall quiz (active recall, the testing effect), and automatic spaced repetition that resurfaces each question right before you would forget it." },
      { q: "How long does one Smart Note take?", a: "About 5–8 minutes to read and quiz yourself — designed as focused, mobile-friendly microlearning you can fit between other study." },
    ];
    const inner = `<p class="crumb"><a href="/">Home</a> › Smart Notes</p>
<section class="hero"><div class="badges"><span class="badge">100% Free</span><span class="badge">${totalNotes} lessons</span><span class="badge">Spaced repetition</span></div><h1>Smart Notes — Free Visual Lessons for Every Exam</h1><p class="lead">Short, memorable lessons with visual concept maps, real examples, memory hooks and built-in spaced-repetition recall — free for ${examNames}. No signup, learn on any device.</p></section>
<div class="card"><h2>Pick your exam</h2><div class="grid">${cards}</div></div>
<div class="card"><h2>What is a Smart Note?</h2><p>A Smart Note turns one exam topic into a lesson you can finish in about <strong>5–8 minutes</strong> and actually remember. Instead of a wall of text, each note gives you three things:</p><ul><li><strong>A visual concept map</strong> — the whole topic at a glance, so its structure sticks in your memory.</li><li><strong>3–5 chunked explanations</strong> — each paired with a <strong>real example</strong> and a <strong>memory hook</strong> (a mnemonic or analogy) that makes the idea easy to recall under exam pressure.</li><li><strong>A 5-question recall quiz</strong> — you test yourself, and the questions are then <strong>scheduled for spaced review</strong> so they come back to you right before you would forget them.</li></ul></div>
<div class="card"><h2>Why this works</h2><p>Smart Notes are built on the best-evidenced ways to learn. <strong>Active recall</strong> — testing yourself — beats re-reading or highlighting. <strong>Dual coding</strong> pairs a picture with words so ideas are stored two ways. <strong>Worked examples</strong> show a concept in action, and <strong>spaced repetition</strong> reviews each fact on a schedule tuned to how memory fades. Together they make revision faster and far more durable than cramming — and every note is free, with no signup, on any device.</p></div>
${faqBlock(hubFaqs)}`;
    emit(path, head({ title: `Smart Notes — Free Visual Exam Lessons & Concept Maps | ${BRAND}`, desc: `Free Smart Notes for ${examNames}: visual concept maps, real examples, memory hooks and spaced-repetition recall. ${totalNotes} lessons, no signup.`, path, kw: `free exam smart notes, visual study notes, concept map exam prep, spaced repetition exam notes, ielts toefl pte gre gmat notes`, jsonLdBlocks: [
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Smart Notes", path }]),
      faqJsonLd(hubFaqs),
      jsonld({ "@context": "https://schema.org", "@type": "CollectionPage", name: "Smart Notes", description: `Free visual exam lessons for ${examNames} — concept maps, real examples and spaced-repetition recall.`, url: ORIGIN + path, isPartOf: PUBLISHER, inLanguage: "en-IN", hasPart: examList.map(([exam]) => ({ "@type": "CollectionPage", name: `${exam.toUpperCase()} Smart Notes`, url: ORIGIN + `/learn/${exam}/` })) }),
    ] }) + shell(inner));
  }
}

function languageLandingPage(key) {
  const L = LANG_SEO[key];
  const path = `/${L.slug}/`;
  const title = `Learn ${L.name} Free — Online A1 Course, Vocabulary &amp; Exam Prep 2026 | ${BRAND}`;
  const desc = `Learn ${L.name} (${L.native}) for free: a structured A1 course, vocabulary with natural-voice pronunciation, an speaking partner and ${L.name} mock tests. Built for students heading to ${L.countries}. No signup.`;
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/#/languages">Languages</a> › Learn ${L.name}</p>
<section class="hero">
  <div class="badges"><span class="badge">100% Free</span><span class="badge">Natural voice</span><span class="badge">speaking</span><span class="badge">No signup</span></div>
  <h1>Learn ${L.name} Free — ${L.flag} Online A1 Course</h1>
  <p class="lead">Study abroad in ${L.countries}? Learn ${L.name} from scratch with a free A1 course, vocabulary you can <em>hear</em> in a natural voice, a 2-way speaking partner and ${L.name} mock tests — all free, for students worldwide.</p>
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
  <p>Our free speaking partner holds a real two-way ${L.name} conversation: speak (or type), and it replies in simple ${L.name} with the English translation and the natural ${L.name} voice — the fastest way to build confidence.</p>
</div>
${faqBlock(L.faqs)}
${relatedGrid([
  { label: `Start the free ${L.name} course`, href: "/#/languages" },
  ...Object.keys(LANG_SEO).filter((k) => k !== key).map((k) => ({ label: `Learn ${LANG_SEO[k].name} free`, href: `/${LANG_SEO[k].slug}/` })),
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
    { q: "Do you have lessons for German and French?", a: "Yes — German and French foundation decks cover pronunciation, gender (der/die/das, le/la), key verbs, word order and a smart learning plan, alongside free A1 courses, vocabulary, mock tests and an speaking partner." },
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
/**
 * Depth for the /ielts-vocabulary/<topic>/ pages, which were a word list and nothing else.
 *
 * A list does not teach anyone to use the words, and Lexical Resource is not scored on how
 * many unusual words appear — it is scored on precision, collocation and word formation.
 * So the block explains what the criterion actually rewards, names real words from THIS
 * page's own list so no two topics read alike, and is blunt about the memorisation trap,
 * which is the single most common way vocabulary study backfires in the exam.
 */
function vocabDepthBlock(t) {
  const words = Array.isArray(t.words) ? t.words.filter((w) => w && w.w) : [];
  if (!words.length) return "";
  const topic = String(t.title || "this topic");
  const pick = (i) => (words[i] ? String(words[i].w) : null);
  const a = pick(0), b = pick(Math.floor(words.length / 2)), c = pick(words.length - 1);
  const named = [a, b, c].filter(Boolean);
  return `<div class="card"><h2>How to actually use ${esc(topic.toLowerCase())} vocabulary in the exam</h2>
<p>A word list is where vocabulary study starts and where most of it unfortunately stops. Lexical Resource is a quarter of your Writing and Speaking band, and it is not scored on how many unusual words you produce — it is scored on <strong>precision, collocation and word formation</strong>. A common word used exactly beats a rare one used approximately, every time.</p>
<ul class="bcheck">
<li><strong>Learn the collocation, not the word.</strong> Knowing ${named[0] ? `<em>${esc(named[0])}</em>` : "a word"} means little until you know which words go with it — the verb it takes, the preposition that follows, whether it is countable. Errors of collocation are visible to examiners in a way that a smaller vocabulary is not, because they sound wrong rather than simple. When you record a new word, record it inside a phrase you could actually say.</li>
<li><strong>Learn the word family.</strong> Word formation is explicitly part of the criterion, so one entry should give you several: the noun, the verb, the adjective, the adverb. Being able to shift form mid-sentence is what lets you vary structure without reaching for new vocabulary, and it is far cheaper than learning more words.</li>
${named.length >= 2 ? `<li><strong>Precision over reach.</strong> Words like <em>${esc(named[1])}</em>${named[2] ? ` and <em>${esc(named[2])}</em>` : ""} earn marks when they are the exact word for the idea and lose them when they are approximately right. If you are not sure of the shade of meaning, use the plain word you are certain of. An accurate simple sentence outscores an ambitious inaccurate one on both Lexical Resource and Grammatical Range.</li>` : ""}
<li><strong>Do not memorise sentences.</strong> This is the trap. Pre-learned phrasing dropped into an answer regardless of fit is recognised immediately — examiners read thousands of scripts — and memorised language that does not fit the question is discounted from your assessment. Learn the words; build the sentences live.</li>
<li><strong>Practise producing, not recognising.</strong> Reading a list feels productive and builds only recognition, which is the wrong half. You need retrieval: cover the definitions and produce each word from its meaning, then write one sentence of your own for each. Recognition is what fails you under exam pressure when you need the word and cannot reach it.</li>
</ul>
<p><strong>Where ${esc(topic.toLowerCase())} actually comes up.</strong> Topic vocabulary earns most in Speaking Part 3, where questions turn abstract and general, and in Writing Task 2, where a precise word can carry an argument a vague one cannot. It matters least in Listening and Reading, where you need to <em>recognise</em> paraphrase rather than produce it — which is exactly why passive list-reading feels like it is working while your Speaking and Writing bands stay where they were.</p>
<p><strong>A realistic way to use this page.</strong> Take five words, not fifty. Write one sentence with each, on a question you might genuinely be asked. Say them out loud, because a word you have never pronounced will not arrive under pressure. Come back in a few days and produce them from the definitions alone. Five words you can use are worth more in the exam than fifty you can recognise, and that ratio is the whole reason most vocabulary study does not move a band.</p></div>`;
}

/**
 * Depth for the two band-checker pages, previously the thinnest indexed pages on the
 * site at 232 and 266 words. /ielts-speaking-checker/ is in KEEP_INDEXED and is the
 * asset pitched in docs/backlink-outreach-kit.md — earning links to a 232-word page
 * wastes the outreach, so this is the page most worth the words.
 *
 * The content is the four official assessment criteria, which are what the tool scores
 * against. Explaining them is the honest way to make the page substantial: it is the
 * same information the user needs to act on the tool's output.
 */
function bandCheckerDepth(isW) {
  const criteria = isW
    ? [
        ["Task Response / Task Achievement", "Whether you actually answered the question that was asked — every part of it, with a clear position held consistently and supported. This is where most confident writers lose the band: a fluent essay that drifts off the prompt, answers only half a two-part question, or never commits to a position is capped here regardless of how good the English is."],
        ["Coherence and Cohesion", "Whether the reader can follow your argument without effort — paragraphing that groups one idea each, and linking that reflects real logical relationships. Cohesive devices are marked on whether they are used accurately, not on how many appear; a paragraph strung together with 'moreover', 'furthermore' and 'in addition' where no addition is happening scores lower than plain sentences that connect properly."],
        ["Lexical Resource", "Range and precision of vocabulary, including collocation and word formation. Precision outranks rarity: a common word used exactly is worth more than an unusual one used approximately, and memorised 'high-level' phrasing dropped into the wrong context is visible to examiners and costs marks."],
        ["Grammatical Range and Accuracy", "Both halves matter and they trade off. Only simple sentences caps your range; complex sentences riddled with errors caps your accuracy. The band comes from how much of your writing is error-free, so controlled complexity beats ambitious structures you cannot land."],
      ]
    : [
        ["Fluency and Coherence", "Whether you can keep going at a natural pace and be followed. Speed is not the measure — long silences, repeated self-correction and abandoned sentences cost more than speaking slowly and clearly. Extending answers with a reason and an example is the single highest-value habit here, especially in Part 1 where short answers are the common failure."],
        ["Lexical Resource", "Range and precision, including idiomatic language used naturally. Rehearsed idioms inserted regardless of context are penalised rather than rewarded; being able to paraphrase when you cannot recall a word is worth more than the word itself."],
        ["Grammatical Range and Accuracy", "Same trade-off as Writing. A mix of structures used accurately scores above complex attempts that collapse mid-sentence, and above safe simple sentences throughout."],
        ["Pronunciation", "Whether you are understood without strain — individual sounds, but also stress, rhythm and intonation. An accent is not penalised and never has been. What is assessed is intelligibility, and sentence stress usually affects that more than individual sounds do."],
      ];
  const f = examFacts("ielts");
  return `<div class="card"><h2>What the four criteria actually mean</h2>
<p>Your ${isW ? "Writing" : "Speaking"} band is the average of four criteria, each weighted equally — so a weakness in one costs you a quarter of the section, and the checker's breakdown is more useful than the single number above it. Understanding what each one rewards is what lets you act on the feedback rather than just read it.</p>
<ul class="bcheck">${criteria.map(([n, d]) => `<li><strong>${esc(n)}.</strong> ${esc(d)}</li>`).join("")}</ul>
<p><strong>How to use this tool so it actually moves your band.</strong> ${isW
  ? "Write the answer under real conditions first — 40 minutes for Task 2, 20 for Task 1, no dictionary and no pausing to look things up. Feedback on an essay you took two hours over describes a person who will not be sitting the exam. Then read the criterion breakdown before the band, find your lowest one, and rewrite the same answer targeting only that criterion. Re-checking the same piece twice teaches you far more than checking four different essays once."
  : "Record a full two-minute Part 2 answer from a cue card, in one take, without stopping to restart. The restarts are where the fluency marks go, so a polished third attempt hides exactly the thing you need to see. Then look at your lowest criterion and re-record the same cue card targeting only that one."}</p>
<p><strong>What an estimate can and cannot do.</strong> This gives you a calibrated estimate against the published criteria, and it is genuinely useful for finding your weakest criterion and tracking whether it is improving. It is not the official band. A real examiner marks live under exam conditions, and borderline cases in particular can land either side. Use it to direct your practice and to know when you are consistently clearing your target — not as a prediction to plan a test date around on its own.</p>
${f && f.sections.length ? `<p>Pair it with full papers: <strong>${f.tests} free IELTS practice tests</strong> covering <strong>${f.questions.toLocaleString("en-IN")} questions</strong> are on this site, counted from the test files rather than estimated. <a href="/mock-test/ielts/">Take a full timed IELTS mock →</a></p>` : ""}</div>`;
}

function bandCheckerPage(mode) {
  const isW = mode === "writing";
  const path = isW ? `/ielts-writing-checker/` : `/ielts-speaking-checker/`;
  const title = isW
    ? `Free IELTS Writing Checker — Instant Band Score (Task 1 &amp; 2) | ${BRAND}`
    : `Free IELTS Speaking Checker — Instant Band Score &amp; Feedback | ${BRAND}`;
  const desc = isW
    ? `Free IELTS Writing checker: paste your Task 1 or Task 2 answer and get an instant estimated band with a Task Response, Coherence, Lexical Resource &amp; Grammar breakdown, corrections and a Band 9 rewrite. No signup.`
    : `Free IELTS Speaking checker: record a Part 2 answer and get an instant estimated band with Fluency, Lexical, Grammar &amp; Pronunciation feedback and a Band 9 model answer. No signup.`;
  const kw = isW
    ? "free ielts writing checker, ielts band score checker, ielts essay checker free, ai ielts writing feedback, ielts writing task 2 checker, ielts writing task 1 checker, check my ielts essay band, ielts writing evaluator free, ielts essay band score calculator"
    : "free ielts speaking checker, ielts speaking band score, ai ielts speaking test free, ielts speaking practice with band score, check my ielts speaking, ielts speaking evaluator, ielts part 2 practice free";
  const faqs = isW ? [
    { q: "Is the IELTS Writing checker really free?", a: "Yes — paste your essay and get an instant estimated band with a full criterion breakdown, corrections and a Band 9 rewrite. No signup, no payment." },
    { q: "How accurate is the band score?", a: "It's calibrated to the official IELTS public band descriptors and is a strong guide for practice (most band checkers are 80–90% accurate). For a high-stakes decision, confirm with a certified teacher." },
    { q: "Does it score Task 1 and Task 2?", a: "Both. Pick Task 1 (report/letter) or Task 2 (essay) and the checker applies the right descriptors (Task Achievement vs Task Response)." },
    { q: "What feedback do I get?", a: "An overall band, sub-scores for Task Response/Achievement, Coherence & Cohesion, Lexical Resource and Grammatical Range & Accuracy, your key mistakes corrected, and a full Band 9 rewrite to learn from." },
  ] : [
    { q: "Is the IELTS Speaking checker free?", a: "Yes — record a Part 2 long-turn answer and get an instant estimated band with feedback and a Band 9 model answer. No signup." },
    { q: "How does it work?", a: "You get a real Part 2 cue card, record your 1–2 minute answer (it transcribes live), and the examiner scores Fluency & Coherence, Lexical Resource, Grammar and Pronunciation against the band descriptors." },
    { q: "How accurate is it?", a: "It's a strong practice guide calibrated to the IELTS descriptors; pronunciation is estimated from the transcript, so pair it with a teacher for a precise pronunciation score." },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${isW ? "IELTS Writing Checker" : "IELTS Speaking Checker"}</p>
<section class="hero">
  <div class="badges"><span class="badge">100% Free</span><span class="badge">Instant band</span><span class="badge">No signup</span><span class="badge">Band 9 ${isW ? "rewrite" : "model"}</span></div>
  <h1>Free IELTS ${isW ? "Writing" : "Speaking"} Checker — Instant Band Score</h1>
  <p class="lead">${isW ? "Paste your Task 1 or Task 2 answer" : "Record a Part 2 answer"} and get an estimated IELTS band in seconds, with a full criterion breakdown, ${isW ? "corrections and a Band 9 rewrite" : "feedback and a Band 9 model answer"}. Free, unlimited, no account.</p>
  <a class="cta" href="/#/${isW ? "writing-checker" : "speaking-checker"}">▶ Check my band score</a>
</section>
<div class="card">
  <h2>How it works</h2>
  <ul>
    <li><strong>1.</strong> ${isW ? "Pick Task 1 or Task 2 and paste your answer." : "Get a real Part 2 cue card and record your answer (it transcribes as you speak)."}</li>
    <li><strong>2.</strong> Our examiner applies the official IELTS band descriptors.</li>
    <li><strong>3.</strong> Get your overall band + ${isW ? "Task Response, Coherence, Lexical Resource &amp; Grammar" : "Fluency, Lexical, Grammar &amp; Pronunciation"} sub-scores, ${isW ? "key corrections and a Band 9 rewrite" : "targeted tips and a Band 9 model answer"}.</li>
  </ul>
</div>
${bandCheckerDepth(isW)}
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
    // (vocabDepthBlock is declared at module level below — see the note there.)
    const list = t.words.map((w) => `<div class="vrow"><strong>${esc(w.w)}</strong> <em>${esc(w.pos || "")}</em> — ${esc(w.def)}<br/><span class="vex">“${esc(w.ex)}”</span>${w.syn ? ` <span class="vsyn">↗ ${esc(w.syn)}</span>` : ""}</div>`).join("");
    const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/ielts-vocabulary/">Vocabulary</a> › ${esc(t.title)}</p>
<section class="hero"><div class="badges"><span class="badge">${t.words.length} words</span><span class="badge">Free</span></div>
<h1>${t.emoji || ""} ${esc(t.title)} Vocabulary for IELTS &amp; TOEFL</h1><p class="lead">${esc(t.intro)}</p>
<a class="cta" href="/#/vocabulary/${id}">▶ Practise with audio</a></section>
<div class="card"><h2>${esc(t.title)} word list</h2>${list}</div>
${vocabDepthBlock(t)}
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
/**
 * Depth for the six /ielts-band-<b>/ overview pages, ~350 words each.
 *
 * Same principle as the band×section pages: the useful thing here is arithmetic the
 * reader cannot do from a descriptor table. Overall band is the mean of four sections
 * rounded to the nearest half, so the reachable combinations for a target band are
 * enumerable — and enumerating them is what turns "I need Band 7" into a plan.
 */
function bandOverviewDepth(item) {
  const b = item.b;
  const target = parseFloat(b);
  const raw = /^(\d+)\s*\/\s*(\d+)$/.exec(String(SEC_RAW[b] || "")) || null;
  const f = examFacts("ielts");
  // Enumerate realistic four-section splits whose mean rounds to the target band.
  const grid = [];
  const opts = [];
  for (let v = Math.max(4, target - 1.5); v <= Math.min(9, target + 1.5); v += 0.5) opts.push(v);
  const rounds = (avg) => Math.round(avg * 2) / 2;
  for (const w of opts) for (const x of opts) {
    // keep the two "other" sections at the target to hold the search small and readable
    const avg = (w + x + target + target) / 4;
    if (rounds(avg) === target && (w !== target || x !== target) && w <= x) grid.push([w, x]);
  }
  const seen = new Set();
  const combos = grid.filter(([w, x]) => { const k = w + "|" + x; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 4);

  return `<div class="card"><h2>What Band ${b} actually requires across four sections</h2>
<p>Your overall IELTS band is the mean of your four section bands, rounded to the nearest whole or half band, and the rounding runs upward at the quarter — an average of ${(target - 0.25).toFixed(2)} is reported as ${b}, while ${(target - 0.4).toFixed(1)} is not. That single rule is the most misread part of IELTS scoring, and it is why Band ${b} does not mean ${b} in everything.</p>
${combos.length ? `<p><strong>You do not need ${b} in every section.</strong> Holding two sections at ${b}, these combinations in the other two still average out to an overall ${b}:</p>
<ul class="bcheck">${combos.map(([w, x]) => `<li>${w} and ${x}, with ${b} and ${b} in the other two — average ${(((w + x + target * 2) / 4)).toFixed(2)}, reported as <strong>${b}</strong>.</li>`).join("")}</ul>
<p>This is worth knowing before you plan, because it changes where the effort goes. Lifting your strongest section from ${b} to ${(target + 0.5).toFixed(1)} buys you the same 0.125 of average as lifting your weakest from ${(target - 0.5).toFixed(1)} to ${b} — but the second is almost always the cheaper half-band to win, and it is the one that also protects you against a per-section minimum.</p>` : ""}
<p><strong>The catch that undoes all of this.</strong> Many universities, and nearly every migration and professional-registration route, publish a per-section minimum alongside the overall figure. Where they do, an averaged Band ${b} carrying a weak section does not qualify — your lowest section is your result. Before you build a plan around averages, check whether your requirement reads "overall ${b}" or "${b} in each". They demand genuinely different preparation, and the difference is usually discovered too late.</p>
${raw ? `<p><strong>What ${b} looks like in the marked sections.</strong> In Listening and Reading, Band ${b} is around ${raw[1]} correct out of ${raw[2]}. There is no negative marking, so an unanswered question is a guaranteed zero where a guess is not — never leave a blank. Boundaries shift slightly between test versions, so treat ${raw[1]}/${raw[2]} as the working target and aim a question or two above it. Writing and Speaking have no raw score at all: each is the average of four published criteria, so one weak criterion costs you a quarter of that section.</p>` : ""}
${f && f.sections.length ? `<p>There are <strong>${f.tests} free IELTS practice tests</strong> here covering <strong>${f.questions.toLocaleString("en-IN")} questions</strong> — counted from the test files, not estimated — across ${f.sections.map((s) => SECTION_LABEL(s.sec)).join(", ")}. <a href="/mock-test/ielts/">Take a full timed IELTS mock →</a> Sit it complete and timed: the errors that decide a half-band mostly appear when you are tired and behind the clock, and a section practised in isolation will not show them to you.</p>` : ""}</div>`;
}

function bandPage(item) {
  const path = `/ielts-band-${item.b.replace(".", "-")}/`;
  const title = `IELTS Band ${item.b} — Requirements &amp; How to Get It (2026) | ${BRAND}`;
  const desc = `What IELTS Band ${item.b} means, the raw score you need (about ${item.raw} in Listening/Reading), who needs it, and a step-by-step plan to reach Band ${item.b}. Free practice tests, lessons and an band checker.`;
  const kw = `ielts band ${item.b}, how to get ielts band ${item.b} in one month, ielts band ${item.b} raw score, ielts band ${item.b} requirements for study abroad, is ielts ${item.b} good for universities, ielts band ${item.b} meaning, strategy to reach ielts band ${item.b}`;
  const steps = [
    { name: "Know your target", text: `Band ${item.b} ≈ about ${item.raw} correct in Listening and Reading. Writing & Speaking are marked on the official band descriptors (Task Response/Fluency, Coherence, Lexical Resource, Grammar).` },
    { name: "Diagnose with a free mock test", text: `Take a full free IELTS mock test to see your current band in each of the four skills and find your weakest one.` },
    { name: "Learn the strategy", text: `Study the free PPT lessons for your weak sections — question types, traps and timing for Band ${item.b}.` },
    { name: "Build vocabulary & grammar", text: `Lexical Resource and Grammar are each 25% of Writing/Speaking. Learn topic vocabulary and Band 9 linking words.` },
    { name: "Practise Writing & Speaking with feedback", text: `Use the free band-score checker to get a TR/CC/LR/GRA breakdown and a Band 9 model, then redo your weak answers.` },
    { name: "Do timed full tests until consistent", text: `Repeat full mocks under exam timing until you hit Band ${item.b} two or three times in a row.` },
  ];
  const faqs = [
    { q: `What raw score is IELTS Band ${item.b}?`, a: `Roughly ${item.raw} correct out of 40 in Listening and in Reading (the exact boundary shifts slightly per test). Writing and Speaking are scored on the band descriptors, not a raw count.` },
    { q: `Is Band ${item.b} good?`, a: `Band ${item.b} is "${item.level}" on the IELTS scale and is typically needed for ${item.use}.` },
    { q: `How long does it take to reach Band ${item.b}?`, a: `It depends on your starting band — most learners move up about 0.5 band with 4–6 weeks of focused, feedback-driven practice. Use the free mock tests and band checker to track progress.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › IELTS Band ${item.b}</p>
<section class="hero"><div class="badges"><span class="badge">${item.level}</span><span class="badge">Raw ≈ ${item.raw}</span><span class="badge">Free plan</span></div>
<h1>IELTS Band ${item.b}: Requirements &amp; How to Get It</h1>
<p class="lead"><strong>Band ${item.b}</strong> is rated "${item.level}" and usually needed for ${item.use}. In Listening and Reading that's about <strong>${item.raw}</strong> correct. Here's exactly how to reach it — free.</p>
<a class="cta" href="/mock-test/ielts/">▶ Take a free IELTS mock test</a></section>
<div class="card"><h2>Step-by-step plan to reach Band ${item.b}</h2><ol>${steps.map((s) => `<li><strong>${s.name}.</strong> ${s.text}</li>`).join("")}</ol></div>
${bandOverviewDepth(item)}
${faqBlock(faqs)}
${relatedGrid([
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
  { label: "Free Writing band checker", href: "/ielts-writing-checker/" },
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
    }) + shell(inner), { thin: true });   // conservative prune (2026-08-15): 8 city guides, 351-word median — the thinnest family on the site and the least defensible, since a 226-word page on living in Munich competes with genuinely deep city guides. noindex,follow; the /student-city-guides/ hub stays indexed.
  });
}

// ── Per-band × per-section IELTS pages ("Band 7 in Writing") ─────────────────
const SEC_RAW = { "6": "23/40", "6.5": "27/40", "7": "30/40", "7.5": "32/40", "8": "35/40" };
const SECTIONS = [
  { s: "Listening", emoji: "🎧", raw: true, tips: ["Read the questions and predict answers before the audio plays.", "Obey the word limit (e.g. 'NO MORE THAN TWO WORDS').", "If you miss one, let it go and keep listening — don't freeze.", "Drill spelling, names and numbers — they are easy marks."],
    format: "IELTS Listening is 40 questions across 4 recordings (a conversation, a monologue, an academic discussion and a lecture), played ONCE, in about 30 minutes. The same Listening test is used for Academic and General Training.",
    mistakes: ["Writing more than the word limit — e.g. three words when it says 'NO MORE THAN TWO WORDS' — which marks the answer wrong.", "Spelling, singular/plural or number errors (both British and American spelling are accepted, but it must be correct).", "Losing your place after one missed answer and panicking instead of moving on.", "Careless answer transfer on paper, or mis-clicking on the computer-delivered test."],
    improve: "Train with a range of accents (British, Australian, North American), do full timed sections, and review every wrong answer to see whether it was vocabulary, spelling or a lapse in concentration.",
    example: "Section 1 gap-fills usually ask for a name, date or number — drilling these to spell accurately recovers the easy marks most students lose." },
  { s: "Reading", emoji: "📖", raw: true, tips: ["Skim for structure first, then scan for keywords and synonyms.", "Spend about 20 minutes per passage; leave the hardest for last.", "Master True/False/Not Given vs Yes/No/Not Given logic.", "Locate, decide, move on — don't read every word."],
    format: "IELTS Academic Reading is 3 long passages with 40 questions in 60 minutes — and there is NO extra transfer time. General Training Reading uses shorter, everyday texts but the same band boundaries.",
    mistakes: ["Reading every word instead of skimming then scanning — the #1 reason people run out of time.", "Confusing True/False/Not Given with Yes/No/Not Given (statement of fact vs writer's opinion).", "Spending too long on the hardest passage and rushing the easy marks at the end.", "Copying an answer straight from the text but with a spelling slip."],
    improve: "Practise finding answers by synonym (the text rarely repeats the question's exact words), time each passage to roughly 20 minutes, and drill the logic of True/False/Not Given.",
    example: "'Not Given' means the passage neither confirms nor contradicts the statement — students lose marks by guessing 'False' when the text simply doesn't mention it." },
  { s: "Writing", emoji: "✍️", raw: false, tips: ["Answer the exact question — Task Response is 25% of the mark.", "Plan for 5 minutes; one clear idea per paragraph.", "Use a range of linkers and precise, topic-specific vocabulary.", "Vary your sentence structures and proofread grammar at the end."],
    format: "IELTS Writing is two tasks in 60 minutes: Task 1 (at least 150 words, ~20 min) and Task 2 (at least 250 words, ~40 min and worth twice as much). It is scored on four equally-weighted criteria: Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.",
    mistakes: ["Writing under the word count (under 150 / 250 words) — an automatic penalty.", "Memorised templates that don't actually fit the question asked.", "Repeating the same linkers ('Firstly, Secondly') instead of natural cohesion.", "Over-complex sentences full of errors — accuracy beats ambition."],
    improve: "Learn the public band descriptors, write to a clear 4-paragraph structure, and score each essay on the four criteria (the free band checker does this instantly), then rewrite your weakest criterion.",
    example: "A clear position held throughout, two developed ideas each with an example, and a range of accurate grammar will out-score a brilliant idea written with frequent mistakes." },
  { s: "Speaking", emoji: "🗣️", raw: false, tips: ["Extend every answer with a reason and an example.", "Use the Part 2 prep minute to jot quick notes.", "Don't memorise scripts — speak naturally and keep flowing.", "Work on pronunciation, word stress and intonation."],
    format: "IELTS Speaking is an 11–14 minute face-to-face interview in three parts: Part 1 (familiar questions), Part 2 (a 2-minute talk from a cue card after 1 minute of prep), and Part 3 (a deeper discussion). It is scored on Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation.",
    mistakes: ["Memorised answers — examiners spot them and they pull down your Fluency score.", "One-word or very short answers in Part 1.", "Going silent or saying 'I don't know' in Part 3 instead of giving an opinion and a reason.", "Speaking too fast to seem fluent — clarity matters more than speed."],
    improve: "Record yourself answering real prompts, extend every answer with a reason and example, build topic vocabulary, and rehearse speaking for the full two minutes in Part 2.",
    example: "In Part 2, a full two-minute answer that covers every cue-card point with natural fluency and varied vocabulary is what separates the higher bands — practise with a timer." },
];
/**
 * Depth for /ielts-band-<b>-<section>/ — 27 pages at a 479-word median.
 *
 * The useful thing these pages were missing is arithmetic. SEC_RAW already holds the
 * raw-score target for each band, so the distance between bands is computable: for a
 * Reading candidate at Band 7 the next half-band is a specific number of extra correct
 * answers, and that number is small enough to change how someone prepares. Every page
 * gets a different figure because every band/section pair has one.
 *
 * The overall-band rounding rule is included because it is the most commonly misread
 * part of IELTS scoring and it is genuinely decision-relevant: it is why a 6.75 average
 * becomes a 7 and a 6.6 does not.
 */
const BAND_ORDER = ["6", "6.5", "7", "7.5", "8"];
function bandDepthBlock(b, sec) {
  const rawOf = (x) => { const m = /^(\d+)\s*\/\s*(\d+)$/.exec(String(SEC_RAW[x] || "")); return m ? { n: +m[1], of: +m[2] } : null; };
  const here = rawOf(b);
  const i = BAND_ORDER.indexOf(b);
  const nextB = i >= 0 && i < BAND_ORDER.length - 1 ? BAND_ORDER[i + 1] : null;
  const prevB = i > 0 ? BAND_ORDER[i - 1] : null;
  const next = nextB ? rawOf(nextB) : null;
  const prev = prevB ? rawOf(prevB) : null;
  const f = examFacts("ielts");

  const maths = sec.raw && here
    ? `<p>In ${esc(sec.s)}, Band ${b} is <strong>${here.n} correct out of ${here.of}</strong>.${next ? ` Band ${nextB} is ${next.n} — <strong>${next.n - here.n} more ${next.n - here.n === 1 ? "question" : "questions"}</strong>.` : ""}${prev ? ` Band ${prevB} is ${prev.n}, so the gap you have already closed to reach this point is ${here.n - prev.n}.` : ""} That is the whole distance, and it is worth seeing as a number rather than as a band: ${next ? `${next.n - here.n} ${next.n - here.n === 1 ? "question" : "questions"} is` : "a handful of questions is"} typically one careless transfer error, one misread instruction, and one question abandoned under time pressure. Half a band is usually not a knowledge problem.</p>
<p>Because there is no negative marking, a blank is strictly worse than a guess — every unanswered question is a guaranteed zero where a guess is not. Boundaries also shift slightly between test versions, so treat ${here.n}/${here.of} as the working target and aim a question or two above it rather than exactly at it.</p>`
    : `<p>${esc(sec.s)} has no raw score. Examiners award a band on each of four published criteria and your section band is their average, so a single weak criterion costs you a quarter of the total — which is why a candidate with excellent English can sit below Band ${b} on a technicality of task response or coherence rather than on language at all.</p>
<p>This matters for how you practise: re-doing whole answers gives you an overall impression, while scoring yourself against each of the four criteria separately tells you which one is actually holding the band down. Those are very different activities, and only the second one moves a band.</p>`;

  return `<div class="card"><h2>The arithmetic of Band ${b} in ${esc(sec.s)}</h2>
${maths}
<p><strong>How section bands become your overall band.</strong> Your overall IELTS band is the average of all four section bands, rounded to the nearest whole or half band — and the rounding runs upward at the quarter. An average of 6.75 is reported as 7.0; an average of 6.5 stays 6.5; an average of 6.6 is reported as 6.5, not 7.0. The practical consequence is that ${esc(sec.s)} is worth exactly one quarter of your result, and lifting your weakest section by half a band moves your average by 0.125 — often not enough on its own. If you need a whole band overall, two sections have to move, and it is usually cheaper to take your two weakest up than to push an already-strong section higher.</p>
<p><strong>Where most institutions actually set the bar.</strong> Many universities and nearly all migration and registration routes publish a per-section minimum alongside the overall figure. Where they do, your lowest section is what counts and a strong average will not rescue it. Check whether the requirement you are working toward is "overall ${b}" or "${b} in each" before you build a study plan around it — they call for genuinely different preparation.</p>
${f && f.sections.length ? `<p><strong>${f.tests} free IELTS practice tests</strong> covering <strong>${f.questions.toLocaleString("en-IN")} questions</strong> are on this site, counted from the test files rather than estimated. <a href="/mock-test/ielts/">Take a full timed IELTS mock →</a> — timed and complete, because a section practised in isolation will not show you the errors that only appear when you are tired and behind the clock.</p>` : ""}</div>`;
}

function bandSectionPage(band, sec) {
  const b = band.b;
  const path = `/ielts-band-${b.replace(".", "-")}-${sec.s.toLowerCase()}/`;
  const need = sec.raw ? `about ${SEC_RAW[b]} correct out of 40` : `consistently meeting the Band ${b} descriptors`;
  const title = `How to Get IELTS Band ${b} in ${sec.s} (2026) | ${BRAND}`;
  const desc = `Get IELTS Band ${b} in ${sec.s}: what you need (${need}), the exact strategy, common mistakes and free practice. Step-by-step plan with mock tests${sec.raw ? "" : " and a free band checker"}.`;
  const steps = [
    { name: "Know the target", text: sec.raw ? `For ${sec.s}, Band ${b} is ${need} (boundaries shift slightly per test).` : `For ${sec.s}, Band ${b} means ${need} — there is no raw score; examiners use the public band descriptors.` },
    { name: "Diagnose", text: `Take a free IELTS ${sec.s} mock to see your current band and your specific weaknesses.` },
    ...sec.tips.map((t, i) => ({ name: "Tactic " + (i + 1), text: t })),
    { name: sec.raw ? "Practise under timing" : "Get feedback and redo", text: sec.raw ? `Do timed ${sec.s} sections until you hit ${need} two or three times in a row.` : `Use the free band checker to score your ${sec.s.toLowerCase()} on each criterion, then rewrite/re-record your weak answers.` },
  ];
  const faqs = [
    { q: `What do I need for Band ${b} in IELTS ${sec.s}?`, a: `You need ${need}. ${sec.raw ? "Every question is one mark with no negative marking, so never leave a blank." : "Focus on the four criteria for this section equally."}` },
    { q: `Is Band ${b} in ${sec.s} hard to get?`, a: `It's very achievable with focused, feedback-driven practice — most learners gain about 0.5 band in 4–6 weeks. The free mocks and band checker show your progress.` },
  ];
  const siblings = SECTIONS.filter((x) => x.s !== sec.s).map((x) => ({ label: `Band ${b} in ${x.s}`, href: `/ielts-band-${b.replace(".", "-")}-${x.s.toLowerCase()}/` }));
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/ielts-band-${b.replace(".", "-")}/">IELTS Band ${b}</a> › ${sec.s}</p>
<section class="hero"><div class="badges"><span class="badge">${sec.emoji} ${sec.s}</span><span class="badge">Band ${b}</span><span class="badge">Free plan</span></div>
<h1>How to Get IELTS Band ${b} in ${sec.s}</h1>
<p class="lead">To score <strong>Band ${b}</strong> in IELTS ${sec.s} you need ${need}. Here's the exact strategy — free.</p>
<a class="cta" href="${sec.raw ? "/mock-test/ielts/" : "/ielts-" + (sec.s === "Writing" ? "writing" : "speaking") + "-checker/"}">▶ ${sec.raw ? "Take a free IELTS mock" : "Check your " + sec.s.toLowerCase() + " band free"}</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> To score Band ${b} in IELTS ${sec.s}, you need ${need}. ${sec.raw ? "Every question is worth one mark with no negative marking — never leave a blank." : "All four scoring criteria are weighted equally, so a weakness in one drags your band down."}</div>
<div class="card"><h2>What Band ${b} requires in ${sec.s}</h2><p>${esc(sec.format)}</p><p><strong>For Band ${b} specifically:</strong> you need ${need}.</p></div>
<div class="card"><h2>Step-by-step plan to Band ${b} in ${sec.s}</h2><ol>${steps.map((s) => `<li><strong>${s.name}.</strong> ${esc(s.text)}</li>`).join("")}</ol></div>
<div class="card"><h2>Common mistakes that keep you below Band ${b}</h2><ul class="bsteps">${(sec.mistakes || []).map((m) => `<li>${esc(m)}</li>`).join("")}</ul></div>
<div class="card"><h2>How to reach Band ${b} faster</h2><p>${esc(sec.improve)}</p><div class="callout key"><span class="ic">💡</span><div>${esc(sec.example)}</div></div></div>
${bandDepthBlock(b, sec)}
${faqBlock(faqs)}
${relatedGrid([
  { label: `All IELTS Band ${b} requirements`, href: `/ielts-band-${b.replace(".", "-")}/` },
  ...siblings,
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
  { label: "Free band checker", href: "/ielts-writing-checker/" },
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
    { q: `How can I reach that score for free?`, a: `Take free ${x.exam} mock tests, learn the strategy in the prep lessons, and check your writing/speaking band with the free band checker.` },
    { q: `How long does it take to reach the required ${x.exam} score?`, a: `Most learners improve 1–2 score points (0.5 band in IELTS terms) every 4–6 weeks of focused, feedback-driven practice. Start early — aim to sit the test 2–3 months before your application deadline.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${x.exam} for ${x.c}</p>
<section class="hero"><div class="badges"><span class="badge">${x.exam}</span><span class="badge">${x.c}</span><span class="badge">2026</span></div>
<h1>${x.exam} Score for ${x.c}: Study &amp; Visa Requirements</h1>
<p class="lead">For ${x.c}, the typical ${x.exam} requirement is <strong>${x.study}</strong>. ${esc(x.extra)}</p>
<a class="cta" href="/mock-test/${x.slug}/">▶ Take a free ${x.exam} mock test</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> For ${x.c}, you typically need <strong>${x.study}</strong> on ${x.exam}. ${esc(x.extra)} Always confirm the exact requirement on your target university's official admission page or the visa authority's website, as scores vary by course and change annually.</div>
<div class="card">
  <h2>Typical ${x.exam} requirement for ${x.c}</h2>
  <p><strong>${x.study}</strong></p>
  <p class="note">${esc(x.extra)}</p>
  <p class="note">Guidance only — always confirm the exact requirement with your chosen university or visa programme, as minimums vary by course level and update yearly.</p>
</div>
<div class="card">
  <h2>What different ${x.exam} scores mean for ${x.c}</h2>
  <p>${x.slug === "ielts" ? "IELTS Band 5.5 = Foundation level (basic communication); Band 6.0–6.5 = Competent for most Master's programmes; Band 7.0+ = Strong candidate for top universities and scholarship programmes." : x.slug === "toefl" ? "TOEFL 78–85 = Meets most universities; 85–100 = Competitive for strong programmes; 100+ = Top-tier university and scholarship qualifier." : x.slug === "pte" ? "PTE 50 = Competent; 65 = Proficient for most study visas; 79+ = Superior (strong visa/scholarship chances)." : "CELPIP CLB 9 = Very high proficiency; CLB 8 = Strong proficiency for most universities; CLB 7 = Basic university entry."}</p>
  <p class="note">Aim slightly above the minimum — higher scores strengthen scholarships and visa applications, especially with competitive programmes.</p>
</div>
<div class="card">
  <h2>How to hit your ${x.exam} target for ${x.c}</h2>
  <ol>
    <li><strong>Diagnose.</strong> Take a free ${x.exam} mock test to see your current score and your weakest section.</li>
    <li><strong>Learn the strategy.</strong> Study the free ${x.exam} prep lessons — focus on high-yield tips for the sections where you dropped points.</li>
    <li><strong>Practise under real conditions.</strong> Do full-length timed mocks every 1–2 weeks. Track your score progress to confirm improvement.</li>
    <li><strong>Get feedback.</strong> For speaking and writing, use the free band checker to understand exactly where you lost marks, then redo weak answers.</li>
    <li><strong>Test 2–3 times if needed.</strong> Most learners book the real exam, and if they miss by a few points, they resit once or twice. Budget time for retakes.</li>
  </ol>
</div>
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${x.exam} mock test`, href: `/mock-test/${x.slug}/` },
  { label: `${x.exam} prep lessons`, href: "/prep-lessons/" },
  { label: "Free band checker", href: "/ielts-writing-checker/" },
  { label: `Student guide to ${x.c === "USA" ? "New York" : x.c === "Canada" ? "Toronto" : x.c === "Australia" ? "Sydney" : x.c === "UK" ? "London" : x.c === "Germany" ? "Berlin" : "Dublin"}`, href: "/student-city-guides/" },
  { label: `Study in ${x.c}`, href: `/study-abroad/top-universities-in-${x.c.toLowerCase().replace(/\s+/g, "-")}/` },
])}`;
  emit(path, head({ title, desc, path, kw: `${x.exam.toLowerCase()} score for ${x.c.toLowerCase()}, ${x.exam.toLowerCase()} requirement ${x.c.toLowerCase()}, ${x.exam.toLowerCase()} for ${x.c.toLowerCase()} study visa, study in ${x.c.toLowerCase()} ${x.exam.toLowerCase()}, ${x.exam.toLowerCase()} score to study in ${x.c.toLowerCase()}`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `${x.exam} for ${x.c}`, path }])] }) + shell(inner));
}

// ── "[Exam] vs [Exam]" comparison pages ─────────────────────────────────────
const EXAM_VS = [
  { a: "IELTS", b: "TOEFL", rows: [["Scoring", "Band 0–9", "0–120"], ["Format", "Paper or computer; face-to-face speaking", "Internet-based; speak into a microphone"], ["Length", "About 2h 45m", "About 2 hours"], ["Speaking", "Live, with a real examiner", "Recorded, AI + human scored"], ["Best for", "UK, Australia, Canada, Ireland, NZ", "USA, and widely accepted worldwide"]], verdict: "Pick IELTS if you prefer a human speaking examiner or are heading to the UK/Australia; pick TOEFL for the USA or if you like an all-computer test.", chooseA: ["You're applying to the UK, Ireland, Australia, New Zealand or Canada, or need the test for a visa or permanent residence — IELTS is accepted almost everywhere.", "You prefer speaking to a real human examiner instead of a microphone.", "You're comfortable with British and international English and a mix of accents.", "You may need the General Training version for migration, not only Academic for university."], chooseB: ["Your target universities are in the United States, where TOEFL is the most familiar test to admissions offices.", "You prefer an all-computer test with no face-to-face interview.", "You're comfortable typing your essays and speaking into a microphone.", "You're confident with North American academic English."], cost: "Both tests cost roughly US$190–250 depending on country and are valid for 2 years. IELTS results arrive in 3–13 days; TOEFL in about 4–8 days." },
  { a: "IELTS", b: "PTE", rows: [["Scoring", "Band 0–9", "10–90 (Global Scale of English)"], ["Marking", "Human examiners", "Fully computer (AI) scored"], ["Results", "3–13 days", "Often within 48 hours"], ["Speaking", "With a real examiner", "Into a microphone, scored"], ["Best for", "Those who prefer human marking", "Fast results and Australia migration"]], verdict: "Choose PTE for fast, fully-computer scoring and quick turnaround; choose IELTS if you prefer a human examiner and the most universal recognition.", chooseA: ["You want the single most widely accepted test — universities, employers and every major visa and permanent-residence system take IELTS.", "You prefer a human examiner marking your speaking and writing.", "You're heading to the UK and need a UKVI-approved test.", "You value the broadest possible recognition over speed."], chooseB: ["You need your result fast — PTE often returns scores within 48 hours.", "You're applying for Australian study or migration, where PTE is very popular.", "You're comfortable with fully computer (AI) scoring and speaking into a microphone.", "You want flexible test dates and quick rebooking."], cost: "Both tests cost roughly US$200–260 and are valid for 2 years. PTE's main advantage is turnaround — often 48 hours versus IELTS's 3–13 days." },
  { a: "TOEFL", b: "PTE", rows: [["Scoring", "0–120", "10–90"], ["Marking", "AI + human", "Fully AI"], ["Results", "4–8 days", "~48 hours"], ["Strength", "Strong US recognition", "Fast, growing acceptance"], ["Best for", "USA universities", "Australia, fast results"]], verdict: "Both are computer-based; TOEFL is the safer choice for the USA, PTE for the fastest results and Australian migration.", chooseA: ["Your universities are in the United States, where TOEFL has the deepest recognition.", "You want a test that has been the US academic standard for decades.", "You're comfortable with integrated tasks that combine reading, listening and speaking or writing."], chooseB: ["You need results in about 48 hours.", "You're applying to Australia for study or migration.", "You prefer fully AI scoring with no human examiner and quick rebooking."], cost: "Both are computer-based, cost roughly US$200–260 and are valid for 2 years. PTE is faster to results; TOEFL is more established in the United States." },
  { a: "IELTS", b: "Duolingo", rows: [["Scoring", "Band 0–9", "10–160"], ["Cost", "Higher (~US$200+)", "Much cheaper (~US$65)"], ["Length", "~2h 45m, at a centre", "~1 hour, at home"], ["Results", "3–13 days", "~2 days"], ["Acceptance", "Universal", "Thousands of universities, growing"]], verdict: "Duolingo is far cheaper, shorter and taken at home — great if your university accepts it. IELTS has the widest acceptance including visas/PR.", chooseA: ["Your university, student visa or permanent-residence pathway requires it — IELTS is accepted virtually everywhere, while the Duolingo English Test is not yet accepted by every institution or immigration system.", "You're applying for a student visa or migration, where Duolingo often isn't accepted.", "You want a result recognised by essentially every university worldwide."], chooseB: ["Your chosen universities explicitly accept the Duolingo English Test — always confirm this first.", "You want a much cheaper test (around US$65) taken at home in about an hour.", "You want results in roughly 2 days without booking a test centre.", "You're early in your search and want a low-cost way to gauge your level."], cost: "The Duolingo English Test (around US$65, about 1 hour, taken at home) is far cheaper and faster than IELTS (around US$200+, about 2h 45m, at a test centre). But IELTS is accepted for visas and permanent residence and by virtually every university — confirm Duolingo is accepted before relying on it." },
  { a: "GRE", b: "GMAT", rows: [["Used for", "Most Master's & PhD programmes", "MBA & business Master's"], ["Score", "260–340 (+ AWA 0–6)", "205–805 (Focus Edition)"], ["Maths", "Calculator allowed", "No calculator (Quant)"], ["Length", "~1h 58m", "~2h 15m"], ["Best for", "Broad grad-school options", "Top business schools"]], verdict: "Take the GRE for the widest range of graduate programmes; take the GMAT Focus if you're targeting competitive MBA programmes that prefer it.", chooseA: ["You're applying to a wide range of Master's or PhD programmes, not only business.", "You want one test accepted by most graduate schools, including many MBA programmes.", "You're stronger at vocabulary-based verbal reasoning and like having a calculator for the maths.", "You're keeping your options open across several fields."], chooseB: ["You're focused on competitive MBA or business Master's programmes, some of which still prefer the GMAT.", "You're strong at data and quantitative reasoning and comfortable working without a calculator.", "You want a score that business schools have benchmarked for years."], cost: "The GRE costs about US$220; the GMAT Focus Edition about US$275–300. Both scores are valid for 5 years. Most business schools now accept both — check each programme's stated preference before deciding." },
  { a: "CELPIP", b: "IELTS", rows: [["Scoring", "CLB level 1–12", "Band 0–9"], ["Delivery", "Fully computer (incl. speaking)", "Paper/computer; speaking with a real examiner"], ["Accent", "North American English", "British/International English"], ["Results", "Usually 4–5 days", "3–13 days"], ["Best for", "Canadian PR, citizenship & some study", "Universal — study, work & migration worldwide"]], verdict: "For Canadian immigration both are accepted by IRCC — pick CELPIP if you prefer North American English and an all-computer test, or IELTS General for the widest global recognition.", chooseA: ["You're applying for Canadian permanent residence, citizenship or some Canadian study, and prefer North American English.", "You want a fully computer-based test, including the speaking section, with no live examiner.", "You're in Canada or a country where CELPIP test centres are available.", "You're more comfortable with Canadian and American accents and contexts."], chooseB: ["You want a result accepted worldwide — study, work and migration in many countries, not only Canada.", "You're comfortable with British and international English and a real speaking examiner.", "You might also apply outside Canada and want one test that covers everything.", "You need IELTS General Training for migration or Academic for university."], cost: "Both are accepted by Immigration, Refugees and Citizenship Canada (IRCC) for Canadian immigration. CELPIP is Canada-focused, fully computer-based and returns results in about 4–5 days; IELTS has global recognition with results in 3–13 days. For Canada-only plans CELPIP is convenient; for global flexibility choose IELTS." },
];
/**
 * Depth for the /<exam>-vs-<exam>/ pages — 10 of them at a 568-word median.
 *
 * The comparison table answers "how do these differ". It does not answer the question
 * people actually arrive with, which is "which one do I sit". Those are different, and
 * the second one is settled by acceptance and by which format suits the individual —
 * not by which test is "easier", a framing the pages should stop rewarding.
 *
 * The practice-library counts come from the shipped files for BOTH exams, so every pair
 * gets different numbers.
 */
function examVsDepthBlock(v) {
  const ka = String(v.a || "").toLowerCase(), kb = String(v.b || "").toLowerCase();
  const fa = examFacts(ka), fb = examFacts(kb);
  const line = (f, name, k) => (f && f.sections.length)
    ? `<li><strong>${esc(name)}:</strong> ${f.tests} free practice tests, ${f.questions.toLocaleString("en-IN")} questions across ${f.sections.map((s) => SECTION_LABEL(s.sec)).join(", ")} — <a href="/mock-test/${k}/">take a full timed mock →</a></li>`
    : "";
  const both = line(fa, v.a, ka) + line(fb, v.b, kb);
  return `<div class="card"><h2>How to actually decide between ${esc(v.a)} and ${esc(v.b)}</h2>
<p>"Which is easier" is the wrong first question, and it is the one almost everyone asks. Neither test is easier in general; they are easier for different people, and the difference between them for <em>you</em> is usually smaller than the difference between preparing properly and not. Work through these in order instead.</p>
<ol class="bsteps">
<li><strong>Start with acceptance, because it can end the decision immediately.</strong> List every institution, visa route or registration body you might apply to, then check which tests each accepts — and which <em>version</em>. If only one test clears all of them, you are finished; the rest of this page is interesting rather than useful. This is the step people skip, and skipping it is how someone sits the wrong test and pays twice.</li>
<li><strong>Then check the deadline against the results timeline.</strong> Turnaround differs between these two, and so does test-centre availability near popular deadlines. Work backwards from the date a score must be received — not sent — and leave room for one resit. If the calendar only permits the faster test, again, decision made.</li>
<li><strong>Only now compare format against your own weaknesses.</strong> This is where the table above earns its place, and the comparison worth making is section by section, not test by test. A candidate who freezes with a live examiner and one who cannot keep a train of thought speaking into a microphone should choose differently, and neither is a general fact about the tests.</li>
<li><strong>Sit a full timed mock of each before you pay.</strong> This is the only step that produces evidence rather than opinion, and it is free. Two complete papers cost you an afternoon and can save a test fee — sit them under real timing, because the difficulty that matters is the one that appears when you are tired and behind the clock.</li>
</ol>
${both ? `<p><strong>You can do step four here, in full, today:</strong></p><ul class="bcheck">${both}</ul><p>Both counts are read from the test files this site ships rather than estimated, and every question is checked before release so its answer key matches an option you can actually select.</p>` : ""}
<p><strong>One caution about switching late.</strong> If you have already prepared substantially for one test, changing to the other resets the format-specific work — the timing habits, the task patterns, the marking criteria — even though your English is unchanged. That is often a bigger cost than the score difference you were chasing. Switch when acceptance or the calendar forces it; be much slower to switch because the other test looks marginally easier.</p>
<p class="note">Fees, turnaround times and acceptance change, sometimes mid-year. Confirm the current position on the official test websites and with each institution before booking — the figures here are for comparison.</p></div>`;
}

function examVsExamPage(v) {
  const path = `/${v.a.toLowerCase()}-vs-${v.b.toLowerCase()}/`;
  const title = `${v.a} vs ${v.b} — Which Is Easier &amp; Which Should You Take? (2026) | ${BRAND}`;
  const desc = `${v.a} vs ${v.b}: a clear side-by-side comparison of scoring, format, length, results and acceptance — and which test to choose. Free practice for both.`;
  const table = `<div class="card"><h2>${v.a} vs ${v.b} at a glance</h2><table class="cmp-table"><thead><tr><th></th><th>${v.a}</th><th>${v.b}</th></tr></thead><tbody>${v.rows.map((r) => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>`;
  const faqs = [
    { q: `Is ${v.a} easier than ${v.b}?`, a: `Neither is universally easier — it depends on your strengths. ${v.verdict}` },
    { q: `Which is more accepted, ${v.a} or ${v.b}?`, a: v.verdict },
    ...(v.cost ? [{ q: `How much do ${v.a} and ${v.b} cost, and how long are scores valid?`, a: v.cost }] : []),
    { q: `Can I prepare for both ${v.a} and ${v.b} for free?`, a: `Yes — LandingPrep has free full-length mock tests, strategy lessons and a band/score checker for both ${v.a} and ${v.b}, so you can try each format before you pay for the real test.` },
  ];
  const slugA = v.a.toLowerCase(), slugB = v.b.toLowerCase();
  const chooseCol = (name, slug, points) => `<div class="card" style="flex:1;min-width:260px"><h2>Choose ${name} if…</h2><ul class="bcheck">${(points || []).map((p) => `<li>${esc(p)}</li>`).join("")}</ul><a class="cta" href="/mock-test/${slug}/" style="margin-top:8px">▶ Free ${name} mock test</a></div>`;
  const chooseBlock = (v.chooseA && v.chooseB) ? `<div style="display:flex;gap:16px;flex-wrap:wrap;margin:0 0 8px">${chooseCol(v.a, slugA, v.chooseA)}${chooseCol(v.b, slugB, v.chooseB)}</div>` : "";
  const costBlock = v.cost ? `<div class="card"><h2>Cost, results &amp; validity</h2><p>${esc(v.cost)}</p><p class="note">Prices vary by country and change over time — always confirm the current fee and accepted test on the official test and university websites.</p></div>` : "";
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${v.a} vs ${v.b}</p>
<section class="hero"><div class="badges"><span class="badge">${v.a}</span><span class="badge">vs</span><span class="badge">${v.b}</span></div>
<h1>${v.a} vs ${v.b}: Which Should You Take?</h1>
<p class="lead">${esc(v.verdict)}</p>
<a class="cta" href="/mock-test/${slugA}/">▶ Try a free ${v.a} mock test</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> ${esc(v.verdict)} Both are accepted by many of the same universities, so the best test is the one that fits your destination, your strengths and your timeline — compare them below.</div>
${table}
${chooseBlock}
${costBlock}
${examVsDepthBlock(v)}
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${v.a} mock test`, href: `/mock-test/${slugA}/` },
  { label: `Free ${v.b} mock test`, href: `/mock-test/${slugB}/` },
  { label: "Score requirements by country", href: "/eligibility/" },
  { label: "Score converter", href: "/tools/english-test-score-converter/" },
  { label: "All test comparisons", href: "/english-test-comparisons/" },
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

/**
 * Depth for the exam×university pages — /ielts-for-<uni>/, /toefl-for-<uni>/ etc.
 *
 * 20 of these are in KEEP_INDEXED with documented Search Console traction at
 * positions 8-27. They were also the shortest pages on the site at ~260-350 words,
 * which is the worst combination available: already visible, and nothing there when
 * someone arrives. This is the highest-value deepening on the site for that reason.
 *
 * Comparison is computed against the university's national peers in COLLEGES, so
 * every page says something different and every claim traces to the dataset.
 */
function examUniDepthBlock(c, examName, examKey, req) {
  const peers = COLLEGES.filter((x) => x.country === c.country && x.id !== c.id);
  const EX = String(examName || "").toUpperCase();
  const f = examKey ? examFacts(examKey) : null;
  const vals = peers.map((x) => parseFloat(x[examKey])).filter((v) => isFinite(v));
  const mine = parseFloat(req);
  const med = vals.length ? vals.slice().sort((a, b) => a - b)[Math.floor(vals.length / 2)] : null;
  const cmp = (isFinite(mine) && med !== null)
    ? `<li><strong>How this compares in ${esc(String(c.country))}.</strong> ${esc(c.name)} asks for ${EX} ${esc(String(req))}, against a median of ${med} across the ${peers.length} other ${esc(String(c.country))} universities in our dataset. ${mine > med ? "That is above the national norm, so the English test is a genuine risk on this application rather than a formality — clear it before you spend money on anything else." : mine < med ? "That is below the national norm. It makes this a low-risk gate here, but the same score will not clear every university you apply to alongside it, so prepare to the highest bar on your shortlist rather than this one." : "That is exactly the national norm, so a score built for this application should travel across your whole shortlist."}</li>`
    : "";
  const lib = f && f.sections.length
    ? `<p><strong>${f.tests} free ${EX} practice tests</strong> covering <strong>${f.questions.toLocaleString("en-IN")} questions</strong> are on this site — counted from the files, not estimated — across ${f.sections.map((s) => SECTION_LABEL(s.sec)).join(", ")}. <a href="/mock-test/${examKey}/">Start a full ${EX} mock test →</a></p>`
    : "";
  return `<div class="card"><h2>What actually decides this application</h2>
<ul class="bcheck">
${cmp}
<li><strong>The requirement is almost always per section, not an overall score.</strong> This is the most expensive misreading in the whole process. Where a university publishes an overall figure <em>and</em> per-section minimums, your lowest section is what counts — a comfortable overall band hiding one weak section is rejected, and it is rejected after you have paid for the test. Check ${esc(c.name)}'s per-section minimums, not just the headline.</li>
<li><strong>The programme can ask for more than the university.</strong> The figure on this page is the institutional baseline. Individual departments — commonly law, medicine, teaching, journalism and anything with a placement or registration requirement — routinely set a higher bar, and theirs is the one that applies to you. Always confirm on the specific programme page.</li>
<li><strong>Scores expire, and the clock is on the test date.</strong> Most English test scores are accepted for two years from the date you sat the test, not from when you applied. Sitting the test very early to "get it out of the way" can mean re-sitting it before you enrol.</li>
</ul>
${lib}
<p class="note">This figure is indicative and compiled for comparison. ${esc(c.name)} sets its own requirement and can change it between admission cycles — confirm on ${c.website ? `<a href="${esc(c.website)}" rel="nofollow noopener" target="_blank">the university's official pages</a>` : "the university's official pages"} before you book.</p></div>
<div class="card"><h2>Planning the test around a ${esc(c.name)} application</h2>
<p>The English test is the only part of this application that is entirely within your control and entirely on your own schedule, which makes it the wrong thing to leave until last — and the thing most applicants leave until last.</p>
<ul class="bcheck">
<li><strong>Work backwards from the deadline, not forwards from today.</strong> ${c.deadline ? `${esc(c.name)}'s typical deadline is ${esc(String(c.deadline))}.` : `Check the deadline for your intake first.`} Results take time to issue and longer to be received and processed, and a resit needs a free slot plus another wait. Two clear months before the deadline is a working minimum for a first attempt; three if you want a resit to remain possible.</li>
<li><strong>Diagnose before you study, not after.</strong> A full timed mock tells you which section is actually short. Most people study the section they enjoy, which is rarely the one costing them the place${isFinite(mine) ? `, and against a requirement of ${esc(String(req))} the margin for a weak section is usually zero` : ""}.</li>
<li><strong>Score the test you are taking.</strong> Test-day loss is very often strategy rather than English — mismanaged timing, misread task instructions, unfamiliar question formats. That is cheap to fix with full-length timed practice and expensive to discover on the day.</li>
<li><strong>Do not book on a good practice day.</strong> Book when you are hitting the target consistently, including in your weakest section. A single strong mock is noise; three in a row is a signal.</li>
</ul>
${c.intakes && c.intakes.length ? `<p>${esc(c.name)} runs ${esc(c.intakes.join(" and "))} ${c.intakes.length > 1 ? "intakes" : "intake"}. If you miss the English requirement for one, the honest options are usually to take the next intake with a better score or to apply elsewhere with the score you have — a conditional offer with an English condition attached still requires you to meet it, and the pre-sessional English courses that sometimes substitute for it carry their own fees and their own entry bar.</p>` : ""}</div>`;
}

function examForUniPage(c) {
  if (!c || !c.id || c.ielts == null) return;
  const band = c.ielts;
  const path = `/ielts-for-${c.id}/`;
  const bandStr = String(band);
  const bandLink = ["6", "6.5", "7", "7.5", "8"].includes(bandStr) ? `/ielts-band-${bandStr.replace(".", "-")}/` : "/ielts-band-7/";
  const title = `${esc(shortUni(c.name))}: IELTS Band ${band} Needed (2026) | ${BRAND}`;
  const desc = `What IELTS score do you need for ${c.name} (${c.country})? Around Band ${band} overall${c.toefl ? " (≈ TOEFL " + c.toefl + ", PTE " + c.pte + ")" : ""}. Plus ${c.name}'s rank, fees, deadlines, programmes and a free plan to reach your target.`;
  const faqs = [
    { q: `What IELTS score do I need for ${c.name}?`, a: `${c.name} typically requires around IELTS Band ${band} overall${c.toefl ? " (equivalent to TOEFL iBT ~" + c.toefl + " or PTE ~" + c.pte + ")" : ""}. Undergraduate courses are often 0.5 lower; some postgraduate programmes ask higher — confirm on your course page.` },
    { q: `Does ${c.name} accept TOEFL or PTE too?`, a: `Yes — ${c.name} also accepts ${c.toefl ? "TOEFL iBT (~" + c.toefl + ") and PTE Academic (~" + c.pte + ")" : "TOEFL iBT and PTE Academic"} alongside IELTS.` },
    { q: `How can I reach Band ${band} for free?`, a: `Take free IELTS mocks to find your weak section, learn the strategy in the PPT lessons, and check your Writing/Speaking band with the free band checker.` },
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
<li><strong>Get feedback.</strong> Check your Writing &amp; Speaking with the free <a href="/ielts-writing-checker/">band checker</a> and redo weak answers.</li>
</ol></div>
${examUniDepthBlock(c, "IELTS", "ielts", c.ielts)}
${faqBlock(faqs)}
${relatedGrid([
  { label: `${esc(c.name)} — full profile`, href: `/university/${c.id}/` },
  { label: `TOEFL score for ${esc(c.name)}`, href: `/toefl-for-${c.id}/` },
  { label: `How to get IELTS Band ${band}`, href: bandLink },
  { label: "Free band checker", href: "/ielts-writing-checker/" },
])}`;
  emit(path, head({ title, desc, path, kw: `ielts score for ${c.name.toLowerCase()}, ielts requirement ${c.name.toLowerCase()}, ${c.name.toLowerCase()} ielts, ielts band for ${c.name.toLowerCase()}, english requirement ${c.name.toLowerCase()}, ${c.name.toLowerCase()} admission requirements`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: c.name, path: `/university/${c.id}/` }, { name: "IELTS score", path }])] }) + shell(inner), { thin: true });   // programmatic exam×uni doorway → noindex (836 such pages were "crawled/discovered – not indexed" in GSC)
}

// ── TOEFL / PTE score for [University] — uses the university's REAL requirement ─
const ALT_EXAMS = [{ name: "TOEFL", full: "TOEFL iBT", k: "toefl" }, { name: "PTE", full: "PTE Academic", k: "pte" }];
function altExamForUniPage(c, ex) {
  if (!c || !c.id || c[ex.k] == null) return;
  const score = c[ex.k];
  const path = `/${ex.k}-for-${c.id}/`;
  const title = `${esc(shortUni(c.name))}: ${ex.name} ${score} Needed (2026) | ${BRAND}`;
  const desc = `What ${ex.full} score do you need for ${c.name} (${c.country})? Around ${ex.name} ${score}${c.ielts ? " (≈ IELTS " + c.ielts + ")" : ""}. Plus ${c.name}'s rank, fees, deadlines, programmes and a free plan to reach it.`;
  const faqs = [
    { q: `What ${ex.name} score do I need for ${c.name}?`, a: `${c.name} typically needs about ${ex.full} ${score}${c.ielts ? ", equivalent to IELTS " + c.ielts : ""}. Confirm the exact figure on the official course page.` },
    { q: `Does ${c.name} accept ${ex.name}?`, a: `Yes — ${c.name} accepts ${ex.full} alongside IELTS for English proficiency.` },
    { q: `How do I prepare for free?`, a: `Take free ${ex.full} mock tests, learn the strategy in the prep lessons, and practise writing/speaking with the free band checker.` },
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
<li><strong>Get feedback.</strong> Check your writing &amp; speaking with the free <a href="/ielts-writing-checker/">band checker</a>.</li>
</ol></div>
${examUniDepthBlock(c, ex.name, ex.k, c[ex.k])}
${faqBlock(faqs)}
${relatedGrid([
  { label: `${esc(c.name)} — full profile`, href: `/university/${c.id}/` },
  { label: `IELTS score for ${esc(c.name)}`, href: `/ielts-for-${c.id}/` },
  { label: `Free ${ex.name} mock test`, href: `/mock-test/${ex.k}/` },
  { label: "Score converter", href: "/tools/english-test-score-converter/" },
])}`;
  emit(path, head({ title, desc, path, kw: `${ex.name.toLowerCase()} score for ${c.name.toLowerCase()}, ${ex.name.toLowerCase()} requirement ${c.name.toLowerCase()}, ${c.name.toLowerCase()} ${ex.name.toLowerCase()}, english requirement ${c.name.toLowerCase()}`, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: c.name, path: `/university/${c.id}/` }, { name: `${ex.name} score`, path }])] }) + shell(inner), { thin: true });   // programmatic exam×uni doorway → noindex (GSC: not worth indexing)
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
    const hasFunded = list.some((s) => /fully|full/i.test((s.type || "") + " " + (s.amount || "")));
    const faqs = [
      { q: `Are there scholarships to study in ${country}?`, a: `Yes — this page lists ${list.length} notable scholarship${list.length === 1 ? "" : "s"} for international students heading to ${country}, ranging from partial tuition waivers${hasFunded ? " to fully-funded awards that cover tuition and living costs" : " to larger merit and need-based awards"}.` },
      { q: `When should I apply for ${country} scholarships?`, a: `Most major scholarships close 6–12 months before the course starts, and many require you to have a university offer first. Start at least a year ahead: shortlist awards, prepare your statement of purpose and recommendation letters early, and note each deadline.` },
      { q: `Are these scholarships free to apply for?`, a: `Yes — browsing this list and our scholarship finder is 100% free, and reputable scholarships never charge an application fee. Each award links to its official page — never pay a third party to "apply" for you.` },
    ];
    const cityFor = country === "USA" ? "New York" : country === "Canada" ? "Toronto" : country === "Australia" ? "Sydney" : country === "UK" ? "London" : country === "Germany" ? "Berlin" : "Dublin";
    const inner = `
<p class="crumb"><a href="/">Home</a> › Scholarships in ${esc(country)}</p>
<section class="hero"><div class="badges"><span class="badge">${list.length} scholarship${list.length === 1 ? "" : "s"}</span><span class="badge">${esc(country)}</span><span class="badge">2026</span></div>
<h1>Scholarships to Study in ${esc(country)}</h1>
<p class="lead">Funding for international students in ${esc(country)} — from partial awards${hasFunded ? " to fully-funded scholarships" : " to large merit and need-based grants"}. Free to browse, with eligibility and deadlines.</p>
<a class="cta" href="/#/colleges">▶ Open the free scholarship finder</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> There ${list.length === 1 ? "is" : "are"} ${list.length} well-known scholarship${list.length === 1 ? "" : "s"} below for studying in ${esc(country)} as an international student. ${hasFunded ? "Some are fully funded (tuition plus living costs); others cover part of your tuition." : "These range from partial tuition discounts to substantial merit and need-based awards."} Apply early — most close 6–12 months before the intake and often need a university offer first. Always confirm amounts and deadlines on each official page.</div>
<div class="card"><h2>${list.length} scholarship${list.length === 1 ? "" : "s"} for ${esc(country)}</h2>${list.map((s) => `<div class="vrow"><strong>${s.id ? `<a href="/scholarship/${esc(s.id)}/">${esc(s.name)}</a>` : esc(s.name)}</strong> — ${esc(s.level || "")} · ${esc(s.type || "")} · ${esc(s.amount || "")}<br/><span class="vex">${esc(s.who || "")}${s.deadline ? " · Deadline: " + esc(s.deadline) : ""}</span>${s.highlight ? `<br/><span class="vex">${esc(s.highlight)}</span>` : ""}</div>`).join("")}</div>
<div class="card"><h2>Types of funding you'll find in ${esc(country)}</h2><ul class="bcheck"><li><strong>Government scholarships</strong> — national schemes (often the most generous and competitive), usually fully or largely funded.</li><li><strong>University awards</strong> — merit-based tuition discounts or scholarships offered directly by the institution, sometimes automatic with your application.</li><li><strong>Need-based grants</strong> — aimed at students who demonstrate financial need.</li><li><strong>Course or department awards</strong> — tied to a specific subject, faculty or research area.</li><li><strong>External / private scholarships</strong> — from foundations, companies and trusts, often for specific nationalities or fields.</li></ul></div>
<div class="card"><h2>How to find and win a scholarship in ${esc(country)}</h2><ol class="bsteps"><li><strong>Shortlist early.</strong> Begin at least 12 months before your intake — the best awards close first.</li><li><strong>Check eligibility precisely.</strong> Nationality, level of study, subject and minimum grades all matter; don't waste effort on awards you can't qualify for.</li><li><strong>Secure your admission or nomination</strong> where the scholarship requires it — many do.</li><li><strong>Write a specific, story-led statement of purpose</strong> that ties your goals to what the scholarship values — build and refine yours free with our <a href="/blog/how-to-write-sop/">SOP guide</a>.</li><li><strong>Line up strong recommendation letters early</strong> — referees usually need 2–3 weeks.</li><li><strong>Apply to several.</strong> Scholarships are competitive; a portfolio of applications improves your odds.</li><li><strong>Track every deadline</strong> and submit well before the closing date. Never pay a third party to apply on your behalf.</li></ol></div>
${faqBlock(faqs)}
${relatedGrid([
  { label: "Free scholarship finder", href: "/#/colleges" },
  { label: "Fully funded scholarships", href: "/fully-funded-scholarships/" },
  { label: "Score requirements by country", href: "/eligibility/" },
  { label: `Student guide to ${cityFor}`, href: "/student-city-guides/" },
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
    { q: `How do I reach that score for free?`, a: `Take free ${x.exam} mock tests, learn the strategy in the prep lessons, and check your writing/speaking band with the free band checker.` },
  ];
  const minLevel = x.levels[0];
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${x.exam} for ${x.country} PR</p>
<section class="hero"><div class="badges"><span class="badge">${esc(x.country)} PR</span><span class="badge">${x.exam}</span><span class="badge">2026</span></div>
<h1>${x.exam} Score for ${x.country} PR / Immigration</h1>
<p class="lead">For <strong>${esc(x.scheme)}</strong>, your ${x.exam} score directly affects eligibility and points. ${esc(x.note)}</p>
<a class="cta" href="/mock-test/${x.k}/">▶ Take a free ${x.exam} mock test</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> For ${esc(x.country)} immigration via ${esc(x.scheme)}, the minimum is usually ${esc(minLevel[0])} — ${esc(minLevel[1])}. ${x.levels.length > 1 ? "Higher scores earn more points and improve your chances of an invitation." : ""} ${esc(x.note)} Always confirm the current requirement on the official government website before you book.</div>
<div class="card"><h2>${x.exam} levels for ${x.country} immigration</h2><table class="cmp-table"><thead><tr><th>Level</th><th>${x.exam} requirement</th><th>What it means</th></tr></thead><tbody>${rows}</tbody></table></div>
<div class="card"><h2>Which English tests are accepted for ${esc(x.country)} immigration?</h2><p>${esc(x.tests)}</p><p class="note">Make sure you book the exact test version the immigration authority accepts (for example, the General/Core version where required, not the Academic one) — taking the wrong version is a common, costly mistake.</p></div>
<div class="card"><h2>How to reach your target ${x.exam} score</h2><ol class="bsteps"><li><strong>Find your starting point.</strong> Take a free full-length ${x.exam} mock test to see exactly which skills are below target.</li><li><strong>Prioritise your weakest skill.</strong> In points-based systems, one low skill can cap your whole score — lift the lowest band first.</li><li><strong>Learn the test strategy,</strong> not just the English — timing, question types and how each skill is marked, in the free prep lessons.</li><li><strong>Check your writing and speaking</strong> against the official criteria with the free band checker before you book.</li><li><strong>Book once you're consistently hitting the target</strong> in practice — re-sits cost money and time.</li></ol></div>
${migrationDepthBlock(x.exam, x.k, x.country, { tests: x.tests, note: x.note, scheme: x.scheme })}
${faqBlock(faqs)}
${relatedGrid([
  { label: `Free ${x.exam} mock test`, href: `/mock-test/${x.k}/` },
  { label: `${x.exam} score for ${x.country} (study)`, href: `/${x.k}-for-${x.country.toLowerCase().replace(/\s+/g, "-")}/` },
  { label: "Score requirements by country", href: "/eligibility/" },
  { label: "Free band checker", href: "/ielts-writing-checker/" },
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
/**
 * Depth for the professional-registration pages — nurses and doctors, 264-302 words each
 * and the highest-intent pages on the site: someone reading these is deciding whether they
 * can move country for work.
 *
 * Registration English is genuinely different from university English, and the differences
 * are where people lose a year. Everything below is either drawn from this page's own
 * source record or is a structural fact about registration routes; no invented cut-offs.
 */
function proRegDepthBlock(x) {
  const role = String(x.role || "").replace(/&amp;/g, "&");
  const body = String(x.body || "").replace(/&amp;/g, "&");
  const req = String(x.req || "").replace(/&amp;/g, "&");
  const alt = String(x.alt || "").replace(/&amp;/g, "&");
  const f = examFacts("ielts");
  const perSkill = /each|in each|at least/i.test(req);
  return `<div class="card"><h2>Why registration English catches out strong candidates</h2>
<p>The requirement for ${esc(body)} is <strong>${esc(req)}</strong> — and it is a substantially harder bar than the same test set for a university place. Clinicians who use English every working day routinely miss it, for reasons that have very little to do with their clinical English.</p>
<ul class="bcheck">
${perSkill ? `<li><strong>It is per skill, so your lowest score is your result.</strong> An overall figure that comfortably clears the bar counts for nothing if one skill sits below it. That single rule is the most common reason a registration application stalls, and it means your preparation should be aimed almost entirely at your weakest skill rather than spread evenly.</li>` : ""}
<li><strong>Writing is usually the one that fails.</strong> Across registration routes it is the most commonly re-sat skill, and the reason is structural rather than linguistic: IELTS Academic Writing asks you to describe a chart and argue an abstract position to an academic marking scheme. Neither resembles clinical documentation, so years of writing excellent notes and discharge summaries builds very little of what Task 1 and Task 2 are marked on.</li>
<li><strong>Check whether scores can be combined across sittings before you re-sit.</strong> ${alt ? esc(alt) : "Some regulators allow results from two test sittings to be combined under set conditions; many do not."} Where combining is permitted the conditions are strict — typically both sittings within a set window and no skill below a floor — and where it is not, one weak skill means re-taking the entire test. This single question changes your whole re-sit strategy, so confirm it with ${esc(body)} directly rather than assuming.</li>
<li><strong>Your score expires, and registration is slow.</strong> Test scores are generally accepted for two years from the test date, while registration — documents, credential verification, regulator assessment, then a visa — routinely runs longer than people expect. Sitting the test as early as possible is a common instinct and a genuine risk: a score that expires mid-application means sitting it again. Time it against your realistic submission date, not against your ambition.</li>
<li><strong>The alternative test is worth a serious look.</strong> ${alt ? esc(alt) : "Most healthcare regulators accept OET as an alternative to IELTS."} OET is built around healthcare tasks — a referral letter, a patient consultation — so for a working clinician the content is familiar and the vocabulary is yours already. That does not make it easier in general, but it removes the mismatch between an academic test and a clinical career, which for many candidates is exactly what the extra half band was costing.</li>
</ul>
<p><strong>A realistic sequence.</strong> Confirm the exact current requirement with ${esc(body)} in writing, because published requirements change and a forum post is not a source. Sit one full timed IELTS Academic mock to find which skill is actually short — most people guess wrong. Decide IELTS or ${alt && /OET/i.test(alt) ? "OET" : "the alternative test"} on the basis of that diagnosis rather than on habit. Then work almost exclusively on the weak skill, and only book when you are clearing the bar consistently in that skill, not on average.</p>
${f && f.sections.length ? `<p>There are <strong>${f.tests} free IELTS practice tests</strong> here covering <strong>${f.questions.toLocaleString("en-IN")} questions</strong> — counted from the test files rather than estimated — across ${f.sections.map((s) => SECTION_LABEL(s.sec)).join(", ")}. <a href="/mock-test/ielts/">Take a full timed IELTS mock →</a> and check your Writing against the criteria with the free <a href="/ielts-writing-checker/">band checker</a>, since Writing is the skill most likely to hold up your registration.</p>` : ""}
<p class="note">Requirements are set by ${esc(body)} and change without notice. Everything here is for planning — confirm the current standard on the regulator's own website before booking a test or paying an application fee.</p></div>`;
}

function examForRolePage(x) {
  const path = `/${x.slug}/`;
  const cleanRole = x.role.replace(/&amp;/g, "&");
  const title = `IELTS for ${cleanRole} — Score Needed for ${x.body.replace(/the |\/ /g, "").slice(0, 40)} (2026) | ${BRAND}`.replace(/\s+\(/, " (");
  const desc = `What IELTS score do ${cleanRole.toLowerCase()} need? For ${x.body.replace(/&amp;/g, "&")}: ${x.req.replace(/&amp;/g, "&")} ${x.alt.replace(/&amp;/g, "&")} Free IELTS mock tests and an band checker to get there.`;
  const faqs = [
    { q: `What IELTS score do ${cleanRole.toLowerCase()} need?`, a: `For ${x.body.replace(/&amp;/g, "&")}: ${x.req.replace(/&amp;/g, "&")}` },
    { q: `Is OET accepted instead of IELTS?`, a: x.alt.replace(/&amp;/g, "&") },
    { q: `How can I reach this score for free?`, a: `Take free IELTS Academic mock tests, study the prep lessons, and check your Writing & Speaking band with the free band checker — Writing is often the hardest 7.0 to hit.` },
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
<li>Most ${x.role.toLowerCase()} struggle with Writing 7.0 — use the free <a href="/ielts-writing-checker/">band checker</a> for criterion feedback.</li>
<li>Learn the strategy in the free <a href="/prep-lessons/">IELTS prep lessons</a>.</li>
<li>See exactly what <a href="/ielts-band-7/">Band 7</a> needs in each section.</li>
</ol></div>
${proRegDepthBlock(x)}
${faqBlock(faqs)}
${relatedGrid([
  { label: "Free IELTS mock test", href: "/mock-test/ielts/" },
  { label: "Free band checker", href: "/ielts-writing-checker/" },
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
smartNotesPages();
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
  ai: "Free speaking partner + essay feedback",
  signup: "None — start instantly",
  predictor: "Free — 110 universities, by your profile",
  sop: "Free SOP builder + sample library",
};
const lpPitch = (kind) => kind === "exam"
  ? `${BRAND} gives you unlimited full-length mock tests with real exam timing, instant scoring and an speaking partner that talks back — across IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE and GMAT. There is no paywall and no signup, so you can start practising in seconds.`
  : `${BRAND} gives you a free college predictor across 110 universities in 15 countries, an SOP builder with samples, a scholarship finder and free exam mock tests — everything to go from shortlisting to admission without paying for counselling, and with no signup.`;
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
    their: { price: "Freemium (free practice + paid VIP)", mocks: "Practice free; scored mocks paid (VIP)", ai: "score estimates in VIP", signup: "Account required", coverage: "PTE (some IELTS)" },
    intro: "APEUni is a widely-used PTE practice app with a large free question bank and a paid VIP tier for score estimates and full mock tests.",
    freeAnswer: "APEUni's question bank is free to practise, but score estimates and full scored mock tests require its paid VIP plan.", paidPerk: "detailed score estimates on every task" },
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
  const desc = `Looking for a free ${name} alternative? ${BRAND} is 100% free — ${c.kind === "exam" ? "unlimited mock tests, instant scoring and feedback" : "a free college predictor, SOP builder and scholarship finder"}, no signup. See the side-by-side comparison.`;
  const rows = c.kind === "exam"
    ? [["Price", LP_CMP.price, c.their.price], ["Full-length mock tests", LP_CMP.mocks, c.their.mocks], ["instant feedback", LP_CMP.ai, c.their.ai], ["Sign-up needed", LP_CMP.signup, c.their.signup], ["Covers", c.coverShort + " + more", c.their.coverage]]
    : [["Price", LP_CMP.price, c.their.price], ["Free college predictor", LP_CMP.predictor, c.their.predictor], ["Free SOP builder", LP_CMP.sop, c.their.sop], ["Free exam mock tests", LP_CMP.mocks, c.their.mocks], ["Sign-up needed", LP_CMP.signup, c.their.signup]];
  const table = `<div class="card"><h2>${esc(name)} vs ${BRAND} at a glance</h2><table class="cmp-table"><thead><tr><th></th><th>${BRAND}</th><th>${esc(name)}</th></tr></thead><tbody>${rows.map((r) => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>`;
  const faqs = [
    { q: `Is there a free alternative to ${name}?`, a: `Yes — ${BRAND} (landingprep.com) is 100% free. ${c.kind === "exam" ? `You get unlimited full-length mock tests, instant scoring and an speaking partner for ${c.coverShort}, with no signup.` : `You get a free college predictor, SOP builder, scholarship finder and exam mock tests, with no signup.`}` },
    { q: `Is ${name} free?`, a: c.freeAnswer },
    { q: `Why choose ${BRAND} over ${name}?`, a: `If cost is your priority, ${BRAND} gives you ${c.kind === "exam" ? "the core practice you need — real-timing mock tests and feedback" : "the core tools you need — a predictor, SOP builder and scholarships"} entirely free. ${name} is a strong option too; the right pick depends on whether you want paid extras like ${c.paidPerk}.` },
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
  emit(path, head({ title, desc, path, kw, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Free alternatives", path: "/free-alternatives/" }, { name: name, path }])] }) + shell(inner), { thin: true });   // competitor "alternative" doorway → noindex (prune for SEO recovery)
}
function altIndexPage() {
  const tiles = COMPETITORS.map((c) => `<a class="tile" href="/${c.slug}-alternative/">Free ${esc(c.name)} alternative</a>`).join("");
  const inner = `
<p class="crumb"><a href="/">Home</a> › Free alternatives</p>
<section class="hero"><div class="badges"><span class="badge">100% free</span><span class="badge">No signup</span></div>
<h1>Free Alternatives to Popular Exam-Prep &amp; Study-Abroad Tools</h1>
<p class="lead">${BRAND} is a 100% free alternative to paid test-prep and study-abroad platforms — unlimited mock tests, instant feedback, a college predictor, SOP builder and scholarship finder, all with no signup. Compare us with the tools you already know.</p></section>
<div class="card"><h2>Compare ${BRAND} with…</h2><div class="grid">${tiles}</div></div>`;
  emit("/free-alternatives/", head({ title: `Free Alternatives to Magoosh, Yocket, Leverage Edu &amp; More (2026) | ${BRAND}`, desc: `${BRAND} is a free alternative to paid exam-prep and study-abroad platforms — free mock tests, instant feedback, college predictor and SOP tools, no signup.`, path: "/free-alternatives/", kw: "free exam prep alternative, free study abroad tool, magoosh alternative free, yocket alternative, leverage edu alternative, free ielts practice alternative", jsonLdBlocks: [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Free alternatives", path: "/free-alternatives/" }])] }) + shell(inner));
}
COMPETITORS.forEach(alternativePage);
altIndexPage();

// ── Substantive head-to-head comparison pages (NOT the thin "alternative"
// doorways above). Balanced, honest, genuinely useful decision resources for a
// curated set of the most-compared tools — this is the "comparison as a real
// resource" the SEO strategy explicitly allows (vs. thin combos it penalises). ──
function comparisonPage(c) {
  const path = `/landingprep-vs-${c.slug}/`;
  const name = c.name;
  const isExam = c.kind === "exam";
  const rows = isExam
    ? [["Price", LP_CMP.price, c.their.price], ["Full-length mock tests", LP_CMP.mocks, c.their.mocks], ["AI speaking + essay feedback", LP_CMP.ai, c.their.ai || "—"], ["Sign-up needed", LP_CMP.signup, c.their.signup], ["Exams covered", c.coverShort + " + more", c.their.coverage]]
    : [["Price", LP_CMP.price, c.their.price], ["Free college predictor", LP_CMP.predictor, c.their.predictor], ["Free SOP builder", LP_CMP.sop, c.their.sop], ["Free exam mock tests", LP_CMP.mocks, c.their.mocks], ["Sign-up needed", LP_CMP.signup, c.their.signup]];
  const table = `<div class="card"><h2>${BRAND} vs ${esc(name)} — side by side</h2><table class="cmp-table"><thead><tr><th></th><th>${BRAND}</th><th>${esc(name)}</th></tr></thead><tbody>${rows.map((r) => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>`;
  const chooseThem = isExam
    ? `you want ${c.paidPerk} and are happy to pay for a structured, guided course`
    : `you want ${c.paidPerk} and prefer paid, hands-on support through your applications`;
  const chooseLP = isExam
    ? `you want to practise as much as you like for free — real-timing mock tests, instant scoring and an AI speaking &amp; writing partner — with no signup and no paywall`
    : `you want to shortlist universities, build your SOP and find scholarships for free, and prepare for your exams and visa in the same place, with no signup`;
  const faqs = [
    { q: `Is ${BRAND} or ${name} better?`, a: `Neither is simply "better" — they suit different needs. ${BRAND} is 100% free with unlimited practice and no signup, so it wins on cost and instant access. ${name} is a strong paid option if ${chooseThem.replace(/&amp;/g, "and")}. Many students use ${BRAND} for free practice and turn to a paid service only if they want that extra structure.` },
    { q: `Is ${name} free?`, a: c.freeAnswer },
    { q: `Can I use both ${BRAND} and ${name}?`, a: `Absolutely. A common approach is to do your unlimited practice and mock tests free on ${BRAND}, and use ${name} for its paid strengths (${c.paidPerk}) if and when you feel you need them.` },
  ];
  const inner = `
<p class="crumb"><a href="/">Home</a> › <a href="/free-alternatives/">Compare</a> › ${BRAND} vs ${esc(name)}</p>
<section class="hero"><div class="badges"><span class="badge">Honest comparison</span><span class="badge">2026</span><span class="badge">Independent</span></div>
<h1>${BRAND} vs ${esc(name)}: An Honest 2026 Comparison</h1>
<p class="lead">A fair, side-by-side look at ${BRAND} and ${esc(name)} — what each does best, what they cost, and which one fits your situation. We run ${BRAND}, so we say up front where ${esc(name)} is the better choice.</p>
<a class="cta" href="${isExam ? `/mock-test/${(c.exams && c.exams[0]) || "ielts"}/` : "/#/colleges"}">▶ ${isExam ? "Try a free mock test" : "Open the free college predictor"}</a></section>
<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> Choose <strong>${BRAND}</strong> if ${chooseLP}. Choose <strong>${esc(name)}</strong> if ${chooseThem}. They can also be used together.</div>
${table}
<div class="card"><h2>What ${BRAND} does best</h2><p>${esc(lpPitch(c.kind))}</p><p>Because everything is free and needs no account, the barrier to just <em>starting</em> is zero — useful when you want to benchmark your level today, drill a weak section, or take a full timed mock the night before your test without buying anything.</p></div>
<div class="card"><h2>What ${esc(name)} does best</h2><p>${esc(c.intro)}</p><p>Its main strength is <strong>${esc(c.paidPerk)}</strong>. If that structured, paid support is what you're looking for, ${esc(name)} is a genuinely good choice — this comparison isn't here to talk you out of it, only to show you the free option alongside it.</p></div>
<div class="card"><h2>Which should you choose?</h2><ul class="bcheck">
<li><strong>Pick ${BRAND} if</strong> ${chooseLP}, or if cost is a constraint and you're a motivated self-studier.</li>
<li><strong>Pick ${esc(name)} if</strong> ${chooseThem}.</li>
<li><strong>Use both if</strong> you want free unlimited practice (${BRAND}) plus ${esc(name)}'s paid extras when you need them.</li>
</ul>
<p class="note">Pricing and features for ${esc(name)} change over time — always check the latest on their official site. ${BRAND} is independent and not affiliated with ${esc(name)}; this comparison reflects publicly available information and our own free tools.</p></div>
${faqBlock(faqs)}
${relatedGrid(isExam
  ? [...(c.exams || []).slice(0, 2).map((e) => ({ label: `Free ${e.toUpperCase()} mock test`, href: `/mock-test/${e}/` })), { label: "All free alternatives", href: "/free-alternatives/" }, { label: "Score converter", href: "/tools/english-test-score-converter/" }]
  : [{ label: "Free college predictor", href: "/#/colleges" }, { label: "Scholarships", href: "/fully-funded-scholarships/" }, { label: "All free alternatives", href: "/free-alternatives/" }, { label: "Study-abroad blog", href: "/blog/" }])}`;
  const lc = name.toLowerCase();
  const kw = `${BRAND.toLowerCase()} vs ${lc}, ${lc} vs ${BRAND.toLowerCase()}, ${lc} or ${BRAND.toLowerCase()}, ${lc} comparison, is ${lc} worth it, free alternative to ${lc}`;
  emit(path, head({ title: `${BRAND} vs ${name} (2026): Honest Comparison — Free vs Paid | ${BRAND}`, desc: `${BRAND} vs ${name}: an honest, independent 2026 comparison — features, price and who each suits. ${BRAND} is 100% free; see where ${name} is the better pick.`, path, kw, jsonLdBlocks: [faqJsonLd(faqs), breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Compare", path: "/free-alternatives/" }, { name: `${BRAND} vs ${name}`, path }])] }) + shell(inner));
}
// Curated: only the most-compared tools, as substantive resources (not a mass batch).
["magoosh", "yocket", "leverage-edu", "ielts-liz"].forEach((slug) => {
  const c = COMPETITORS.find((x) => x.slug === slug);
  if (c) comparisonPage(c);
});
COLLEGES.forEach(examForUniPage);
COLLEGES.forEach((c) => ALT_EXAMS.forEach((ex) => altExamForUniPage(c, ex)));
scholarshipCountryPages();
PR_TARGETS.forEach(examForPRPage);
// PR_COMBOS and PR_TARGETS both claimed six slugs (/ielts-for-canada-pr/ and friends). Both
// pages were built every run; the later one silently overwrote the earlier on disk, which
// happened to be the right outcome — the PR_TARGETS page is the substantially richer one
// (2,669–3,089 chars of unique copy vs 1,529–1,778). Relying on emit order for that is a
// trap, so PR_COMBOS now runs AFTER PR_TARGETS and yields any slug PR_TARGETS owns. It
// still contributes its two unique pages, /ielts-for-uk-visa/ and /pte-for-uk-visa/.
const PR_TARGET_SLUGS = new Set(PR_TARGETS.map((t) => t.slug));
PR_COMBOS.filter((c) => !PR_TARGET_SLUGS.has(c.slug)).forEach(prExamPage);
PRO_REG.forEach(examForRolePage);

// ── Hub / topic-cluster pages (run LAST: group already-emitted spokes) ──────────
function labelOf(html) {
  let t = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]
       || (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
  return t.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s*\|\s*LandingPrep.*$/i, "")
          .replace(/\s*\(2026\)\s*/g, " ").replace(/\s+/g, " ").trim().slice(0, 95);
}
function hubPage(path, title, desc, kw, sections, opts = {}) {
  if (PAGES.some((p) => p.path === path)) return [];
  const total = sections.reduce((n, s) => n + s.links.length, 0);
  if (!total) return [];
  const faqs = Array.isArray(opts.faqs) ? opts.faqs : [];
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${esc(title)}</p>
<section class="hero"><div class="badges"><span class="badge">100% free</span><span class="badge">${total} pages</span></div>
<h1>${esc(title)}</h1><p class="lead">${esc(desc)}</p></section>
${opts.intro || ""}
${sections.filter((s) => s.links.length).map((s) => `<div class="card"><h2>${esc(s.h)}</h2><div class="grid">${s.links.map((l) => `<a class="tile" href="${l.href}">${esc(l.label)}</a>`).join("")}</div></div>`).join("")}
${faqs.length ? faqBlock(faqs) : ""}
<div class="card"><h2>More free LandingPrep hubs</h2><div class="grid">${HUB_LINKS.filter((h) => h.href !== path).map((h) => `<a class="tile" href="${h.href}">${esc(h.label)}</a>`).join("")}</div></div>`;
  // ItemList structured data → eligible for list/carousel treatment in search results.
  const allLinks = sections.flatMap((s) => s.links);
  const itemList = jsonld({
    "@context": "https://schema.org", "@type": "ItemList", name: title, numberOfItems: allLinks.length,
    itemListElement: allLinks.slice(0, 100).map((l, i) => ({ "@type": "ListItem", position: i + 1, url: ORIGIN + l.href, name: l.label })),
  });
  emit(path, head({ title: `${title} (2026) | ${BRAND}`, desc, path, kw, jsonLdBlocks: [itemList, breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: title, path }]), ...(faqs.length ? [faqJsonLd(faqs)] : [])] }) + shell(inner));
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

function contentHub({ path, title, desc, kw, lead, sections, faqs, related, topHtml }) {
  const secHtml = sections.map((s) => `<div class="card"><h2>${esc(s.h)}</h2><p>${esc(s.body)}</p></div>`).join("");
  const inner = `
<p class="crumb"><a href="/">Home</a> › ${esc(title)}</p>
<section class="hero"><div class="badges"><span class="badge">100% free</span><span class="badge">No signup</span></div>
<h1>${esc(title)}</h1><p class="lead">${esc(lead || desc)}</p></section>
${topHtml || ""}
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
      { h: "Writing and Speaking to 8", body: "Writing Band 8 needs a clear, fully extended response with precise vocabulary and varied, accurate grammar — over-complex sentences with errors hurt you. Speaking Band 8 needs effortless fluency, idiomatic but natural vocabulary and clear pronunciation. Use the free Writing and Speaking tools to refine both." },
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
    desc: "How LandingPrep builds free mock tests that mirror the real IELTS, TOEFL, PTE, GRE & GMAT, how the scoring and feedback work, how we keep content current for 2026, and why it's 100% free — with honest limitations.",
    kw: "how landingprep works, are landingprep mock tests accurate, how is ielts mock test scored, ai ielts band score accuracy, who is behind landingprep, free ielts practice methodology",
    lead: "Trust matters when you are preparing for a high-stakes exam. Here is exactly how LandingPrep builds its practice, how the scoring and feedback work, how we keep everything current — and the honest limits of any practice tool.",
    sections: [
      { h: "Built to mirror the real exams", body: "Every mock test is modelled on the official test specification for that exam — the same section order, time limits, question types and answer formats as the real IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo English Test, GRE and GMAT Focus. The goal is that test day feels familiar: the timing pressure, the instructions and the question styles match what you will actually see." },
      { h: "How scoring works", body: "Objective sections (listening, reading, multiple-choice, quant) are auto-scored instantly against a verified answer key, with a point-to-point explanation for every question. Writing and speaking are assessed by an examiner against the official rubric for that exam and mapped onto its real scale — the IELTS band, the TOEFL 0–120, the PTE 10–90, and so on — so you get a realistic estimate to guide your practice." },
      { h: "How the feedback is built", body: "The Writing and Speaking tools are prompted with the official assessment criteria — for IELTS that means Task Achievement, Coherence & Cohesion, Lexical Resource and Grammatical Range & Accuracy; other exams use their own rubrics. You get structured, criterion-by-criterion feedback plus a Band 7+/CEFR C1 model answer to compare against, not just a number." },
      { h: "Kept current for 2026", body: "Exam formats, fees and visa rules change. We review and update content for the current year, cross-checking official test-maker and immigration sources, and date our study-abroad guides so you can see how fresh they are. The GMAT Focus edition, the latest Duolingo format and 2025–26 visa changes are already reflected." },
      { h: "Why it's 100% free", body: "Good exam prep and honest study-abroad guidance are usually locked behind a paywall, which shuts out the students who need them most. LandingPrep's mission is to remove that barrier — every mock test, smart tool, lesson and study-abroad resource is free, with no signup, no credit card and no trial that expires." },
      { h: "Honest limitations", body: "No practice tool — ours or anyone's — can issue an official score, and an estimate is an estimate. Use your LandingPrep results to track progress and find weak areas, but always confirm the exact score and the precise requirement with your chosen university and visa authority before you rely on it. We would rather be upfront about this than over-promise." },
    ],
    faqs: [
      { q: "How accurate is the band/score estimate?", a: "It is a realistic guide, not an official result. Objective sections are scored exactly against an answer key; writing and speaking are rated against the official rubric and mapped to the real scale. Treat it as a progress indicator and verify your target with the official test." },
      { q: "Do the mock tests really match the real exam?", a: "Yes — each mock mirrors the official format, section order, timing and question types for that exam, so test day feels familiar. We update them as exam formats change." },
      { q: "Who is behind LandingPrep?", a: "LandingPrep is built by an education-technology team focused on making exam prep and study-abroad guidance free and accessible. Content is modelled on official test specifications and reviewed for accuracy; we do not claim affiliation with any official test maker." },
      { q: "Is it really free, forever?", a: "Yes. Every mock test, smart tool, lesson and study-abroad resource is 100% free with no signup or payment. An optional free account only adds progress tracking across devices." },
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
      { h: "Common traps and how to avoid them", body: "Do not add opinion or interpretation beyond what the data shows. Do not repeat the same figures. Do not use the same sentence structure repeatedly — vary your syntax. On length: 150 words is a MINIMUM, not a target, and there is no upper limit and no penalty for exceeding one — the widely repeated claim that examiners deduct marks for long answers is simply false. What long answers actually cost you is accuracy and time, since every extra sentence is another chance to make an error and Task 2 is worth twice as much. Aim for roughly 160–190 words because that is enough to cover the features properly and still leave Task 2 its 40 minutes, not because a longer answer is punished." },
      { h: "What the overview paragraph is really for", body: "The overview is the single highest-value paragraph in Task 1 and the one most often missing. Task Achievement explicitly requires you to select and report the main features, and an answer that lists every number without ever saying what the data does as a whole is capped no matter how accurate the figures are. Write it as two sentences with no numbers at all: the overall direction or the biggest contrast, and the most striking exception. Numbers belong in the body paragraphs, where you are proving what the overview claimed. A useful test: if someone read only your overview, would they know the story of the chart? If not, you have written an introduction twice." },
      { h: "Choosing what to leave out", body: "Most candidates lose marks by including too much rather than too little. A chart with twelve data points does not need twelve sentences; it needs the highest, the lowest, the crossover, the anomaly and the trend they belong to. Selecting is part of what is being assessed — 'select and report the main features' means the examiner is judging your choices, not just your accuracy. Before writing, mark the three or four features you would mention if you had to describe the chart out loud in twenty seconds, and build the body around those. Everything else is supporting detail or should be dropped." },
      { h: "Letters in General Training Task 1", body: "General Training candidates write a letter instead, and the criteria differ in one decisive way: tone. The prompt tells you who the recipient is, and that dictates register — formal for an unknown official, semi-formal for a known colleague, informal for a friend. Mixing registers is the most common cause of a capped band here: 'Dear Sir or Madam' followed by contractions and chatty phrasing reads as a candidate who has not understood the task. Cover all three bullet points, give each its own paragraph, and use a sign-off that matches the greeting — 'Yours faithfully' with 'Dear Sir or Madam', 'Yours sincerely' when you named the person." },
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
      { h: "Why a template is a skeleton, not a script", body: "Templates are genuinely useful for structure and genuinely dangerous as memorised text. Examiners read thousands of scripts and recognise pre-learned sentences immediately; language that is clearly memorised and not adapted to the question is discounted from your assessment, so an essay padded with stock phrases can score lower than a plainer one that actually engages the prompt. Use the framework to decide what goes in each paragraph, then write the sentences fresh. The reliable signal that you have over-templated: your introduction would fit almost any question on any topic. If it would, it is not answering this one."},
      { h: "Answering the whole question, which is where most bands are lost", body: "Task Response is a quarter of your mark and the criterion most commonly capped. Two-part prompts are the usual trap: 'What are the causes and what can be done?' is two questions, and an essay that explores causes brilliantly while giving solutions two lines cannot reach Band 7 on that criterion however good the English is. Before writing, underline every question inside the prompt and give each its own body paragraph. Equally, 'to what extent do you agree' expects a position and a degree — a genuinely balanced essay that never commits is answering a different question from the one asked."},
      { h: "Examples that actually support an argument", body: "Body paragraphs need support, and the most common weak version is an example that merely restates the claim. 'Pollution harms health, for example it makes people ill' has added nothing. A working example is specific and does explanatory work: a named context, a mechanism, or a consequence that follows from your reason. Personal experience is acceptable and often stronger than invented statistics — examiners do not fact-check, but a fabricated figure usually reads as fabricated and adds no persuasive weight. If you cannot produce a real example, explain the mechanism instead: why the reason leads to the outcome, step by step."},
      { h: "Timing: forty minutes and how to spend them", body: "Task 2 carries twice the marks of Task 1, so do it first if you are prone to running out of time. Roughly five minutes planning, thirty writing, five checking is the split that survives contact with the exam. The planning five minutes feel wasteful and are not: deciding your position and your two reasons before writing prevents the mid-essay change of direction that destroys coherence. The final five are for the errors you personally repeat — articles, subject-verb agreement, plurals, tense slips. Know your own two and hunt only those; a general re-read finds almost nothing under time pressure."},
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
      { h: "Why two minutes is the whole task", body: "Part 2 is scored on the same four criteria as the rest of Speaking, but it is the only part where you must sustain speech alone. Stopping at forty seconds does not just lose you time — it removes the evidence the examiner needs to award a higher band for Fluency, because there is not enough continuous speech to judge. If you genuinely exhaust the cue card points, keep going: say what you would change, what someone else thought, or how it compares to something similar. The examiner stops you at two minutes and that is the outcome you want, rather than silence at ninety seconds." },
      { h: "Using the one minute of preparation properly", body: "You get a minute and paper. Most candidates waste it writing sentences they then read aloud, which sounds exactly like reading aloud and costs Fluency marks. Write single words instead — five or six nouns that anchor each cue point, plus two unusual words you want to use. Words prompt speech; sentences replace it. Spend the last ten seconds deciding how you will START, because the opening is where hesitation is most visible and a prepared first line buys you momentum into the rest." },
      { h: "The cue card is a prompt, not a contract", body: "The bullet points are there to help you structure two minutes, not to be answered as a checklist. Marching through them mechanically — 'who it was, where it was, when it was' — produces flat, list-like speech that limits both Fluency and Lexical Resource. Treat the last bullet, usually 'and explain why', as the real question and give it most of your time: explanation is where complex structures, opinion language and range naturally appear. The factual bullets are the setup; the explanation is the answer." },
      { h: "When the topic is unfamiliar", body: "Everyone eventually draws a card about something they have no experience of. You are not assessed on the truth of your answer, so the correct move is to adapt rather than freeze — describe something adjacent, or something you have read about or seen. Saying 'I have never actually done this, but a friend of mine did, and she told me...' is completely acceptable, keeps you talking, and demonstrates exactly the flexible language the higher bands reward. The only wrong answer in Part 2 is a short one." },
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
  { path: "/gmat-quant-formulas/", title: "GMAT Quant Formulas 2026: Free Formula Sheet (Algebra, Geometry, Stats)",
    desc: "Free GMAT Focus Quant formula sheet: every essential GMAT math formula for algebra, geometry, arithmetic and statistics, grouped by topic with worked examples and when to use each.",
    kw: "gmat quant formulas, gmat math formulas, gmat formula sheet, gmat focus formulas, gmat formulas, gmat algebra geometry, gmat statistics, free gmat formula sheet, gmat india",
    lead: "GMAT Focus Quant tests business-school-level maths. This free formula sheet lists every formula you actually need, grouped by topic, with worked examples and tips on when to apply each one.",
    topHtml: `<div class="card no-print" style="background:#eef2ff;border-left:4px solid #4f46e5"><p style="margin:0">📄 <strong>One-page GMAT Quant formula sheet</strong> — the reference below is print-ready. Click to download a clean one-pager: <button onclick="window.print()" style="margin-left:6px;background:#4f46e5;color:#fff;border:0;border-radius:8px;padding:8px 16px;font-size:14px;font-weight:700;cursor:pointer">🖨️ Print / Save as PDF</button></p></div>
<style>@media print{body *{visibility:hidden!important}#gmat-formula-sheet,#gmat-formula-sheet *{visibility:visible!important}#gmat-formula-sheet{position:absolute;left:0;top:0;width:100%;border:none;box-shadow:none;padding:0}.no-print{display:none!important}}#gmat-formula-sheet h3{margin:14px 0 6px;font-size:15px;color:#4338ca}#gmat-formula-sheet ul{margin:0 0 4px;padding-left:18px}#gmat-formula-sheet li{margin:3px 0;font-size:14px}#gmat-formula-sheet .fs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:6px 24px}</style>
<div class="card" id="gmat-formula-sheet"><h2 style="margin-top:0">GMAT Focus Quant — Formula Sheet (2026)</h2>
<div class="fs-grid">
<div><h3>Arithmetic</h3><ul><li>Percent change = ((New − Old) / Old) × 100</li><li>Compound interest: A = P(1 + r/n)^(nt)</li><li>Average = Sum / Count → Sum = Average × Count</li><li>Ratio / proportion: a/b = c/d</li></ul></div>
<div><h3>Algebra</h3><ul><li>(a + b)² = a² + 2ab + b²</li><li>(a − b)² = a² − 2ab + b²</li><li>a² − b² = (a + b)(a − b)</li><li>Quadratic: x = (−b ± √(b² − 4ac)) / 2a</li></ul></div>
<div><h3>Geometry</h3><ul><li>Circle: Area = πr², Circumference = 2πr</li><li>Triangle: Area = ½ × base × height</li><li>Pythagoras: a² + b² = c² (triples 3-4-5, 5-12-13)</li><li>Rectangle: Area = l × w</li><li>Box = l × w × h; Cylinder = πr²h</li></ul></div>
<div><h3>Statistics, Probability &amp; Rate</h3><ul><li>Mean = Sum / Count</li><li>Probability = Favourable / Total</li><li>Independent events: P(A and B) = P(A) × P(B)</li><li>Speed = Distance / Time</li><li>Work rate = 1 / time</li></ul></div>
</div>
<p class="muted" style="margin:10px 0 0;font-size:13px">Keep this sheet beside you while you practise, then lock it in with a free <a href="/mock-test/gmat/">GMAT Focus mock test</a>.</p></div>`,
    sections: [
      { h: "The one-page GMAT Quant formula sheet", body: "Arithmetic: Percent change = ((New − Old) / Old) × 100; Compound interest A = P(1 + r/n)^(nt); Average = Sum / Count, so Sum = Average × Count. Algebra: (a + b)² = a² + 2ab + b²; (a − b)² = a² − 2ab + b²; a² − b² = (a + b)(a − b). Geometry: Circle Area = πr², Circumference = 2πr; Triangle Area = ½ × base × height; Rectangle Area = l × w; Box volume = l × w × h; Cylinder volume = πr²h; Pythagoras a² + b² = c² (triples 3-4-5, 5-12-13). Statistics: Mean = Sum / Count; Probability = Favourable / Total; independent events P(A and B) = P(A) × P(B); Speed = Distance / Time; Work rate = 1 / time. Keep this list beside you while you practise, then take a timed mock to lock it in." },
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
      { h: "More is not better, and the examiners say so", body: "Coherence and Cohesion explicitly penalises mechanical or overused linking. A paragraph opening every sentence with 'Moreover', 'Furthermore', 'In addition' scores lower than one with no connectors at all, because the devices are signalling relationships that are not there. The band descriptors reward cohesion that is used flexibly and appropriately, which usually means fewer connectors, better chosen. If you remove a linking word and the meaning does not change, it was doing no work and should go." },
      { h: "Cohesion without connectors, which is what Band 8 looks like", body: "The strongest cohesion is often invisible. Referencing — 'this approach', 'such measures', 'the latter' — ties sentences together without announcing it. So does substitution ('some do, others do not') and controlled repetition of a key noun. Higher-band scripts read as continuous because each sentence picks up something from the one before, not because they are stapled together with adverbs. Practise by writing a paragraph with no connectors at all and making it flow through reference alone; then add back only the two or three that genuinely earn their place." },
      { h: "The connectors most often used wrongly", body: "A short list worth checking in your own writing. 'Moreover' and 'furthermore' add a point in the SAME direction — they cannot introduce a contrast. 'On the contrary' contradicts a previous statement; 'on the other hand' introduces a different side, and they are not interchangeable. 'Firstly / secondly' commit you to finishing the sequence. 'In conclusion' belongs once, at the end. And 'besides' is informal in a way that clashes with an academic essay. Each of these is a small error that examiners notice repeatedly, and accuracy of use is exactly what the criterion measures." },
      { h: "How this differs in Speaking", body: "Written connectors sound wrong out loud. 'Furthermore' and 'in conclusion' in a conversation register as rehearsed, and rehearsed language is discounted. Spoken cohesion uses different tools: 'the thing is', 'what I mean is', 'that said', 'anyway', 'actually'. These are informal by design and appropriate for Parts 1 and 3, where natural fluency is what is being assessed. Using essay connectors in Speaking is a common and costly mismatch, and it comes from studying one list for both papers." },
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
      { h: "Why the answers are always in order — and the two exceptions", body: "Most IELTS Reading question types follow the passage sequentially: if question 5's answer is in paragraph 3, question 6's is at or after that point. This is the most useful structural fact in the paper, because it means a question you cannot answer defines a search window for the next one rather than sending you back to the start. The exceptions are matching headings and matching information to paragraphs, which deliberately jump around. Knowing which type you are on tells you whether to read forward or scan globally, and that single decision saves more time than reading faster ever will." },
      { h: "True / False / Not Given, the type that costs the most marks", body: "The distinction is narrow and consistent. FALSE means the passage states something that contradicts the statement. NOT GIVEN means the passage does not settle it either way. Candidates lose marks by reasoning from world knowledge — if the statement is plainly true in reality but the passage never says so, the answer is NOT GIVEN. Watch for qualifiers: the passage saying 'some researchers' against a statement claiming 'researchers agree' is a contradiction and therefore FALSE, not NOT GIVEN. Answer strictly from the text, and when you cannot find the claim after a genuine search, NOT GIVEN is usually right." },
      { h: "Time management across three passages", body: "Sixty minutes, forty questions, three passages, and no extra transfer time in the paper test — the answer sheet must be filled as you go. Twenty minutes per passage is the standard split, but passages get harder, so aim for eighteen on the first to bank time for the third. If a question has taken more than about ninety seconds, guess, mark it, and move on: every question carries one mark, so a hard one is worth exactly as much as an easy one you are now not reaching. There is no negative marking, so an empty answer is a guaranteed zero where a guess is not — never leave a blank." },
      { h: "Reading for the answer, not for the passage", body: "IELTS Reading is not a comprehension exercise and treating it as one is the most common time sink. You do not need to understand the passage; you need to locate forty specific pieces of information. Read the questions first, note the keywords that are hard to paraphrase — names, dates, numbers, technical terms — and scan for those. Then read closely only around the match, because the answer is almost never the sentence containing your keyword; it is the one before or after, and the test is built on paraphrase, so the exact word from the question rarely appears in the text at all." },
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
    ["/english-test-comparisons/", "English Test Comparisons — IELTS vs TOEFL vs PTE vs Duolingo", "Honest, free comparisons of the major English tests so you take the right one for your country and goal.", "ielts vs toefl, ielts vs pte, which english test, duolingo vs ielts", () => [{ h: "Comparisons & chooser", links: grab((p) => (/-vs-[a-z]+\/$/.test(p) && !/^\/compare\//.test(p)) || /^\/which-english-test\/$/.test(p)) }], {
      intro: `<div class="quick-answer" style="background:#eef2ff;border-left:4px solid #4f46e5;border-radius:12px;padding:14px 18px;margin:0 0 12px"><strong style="color:#4338ca">⚡ Quick answer:</strong> There is no single "best" English test — the right one is whichever your university and visa accept, that plays to your strengths and timeline. IELTS and TOEFL are the most widely accepted; PTE and the Duolingo English Test are faster and often cheaper; CELPIP is built for Canada. Compare them below, then practise free until you hit your target.</div>
<div class="card"><h2>The major English tests at a glance</h2><table class="cmp-table"><thead><tr><th>Test</th><th>Score scale</th><th>Marking</th><th>Results</th><th>Best for</th></tr></thead><tbody>
<tr><td><strong>IELTS</strong></td><td>Band 0–9</td><td>Human examiner (live speaking)</td><td>3–13 days</td><td>The widest acceptance — study, work &amp; migration worldwide; UK/Australia/Canada</td></tr>
<tr><td><strong>TOEFL iBT</strong></td><td>0–120</td><td>AI + human, all-computer</td><td>~4–8 days</td><td>United States universities</td></tr>
<tr><td><strong>PTE Academic</strong></td><td>10–90</td><td>Fully computer (AI)</td><td>Often ~48 hours</td><td>Fast results; Australia study &amp; migration</td></tr>
<tr><td><strong>CELPIP</strong></td><td>CLB 1–12</td><td>Fully computer (North American English)</td><td>~4–5 days</td><td>Canadian permanent residence, citizenship &amp; some study</td></tr>
<tr><td><strong>Duolingo English Test</strong></td><td>10–160</td><td>AI, taken at home</td><td>~2 days</td><td>Cheapest &amp; fastest — where accepted (always confirm)</td></tr>
</tbody></table><p class="note">Figures are indicative for 2026 and change — always confirm the current format, fee and the test your university or visa accepts on the official websites. Use the score converter to see your equivalent score across every test.</p></div>
<div class="card"><h2>How to choose in 3 steps</h2><ol class="bsteps"><li><strong>Check what's accepted.</strong> Start from your shortlisted universities and visa route — pick a test all of them accept.</li><li><strong>Play to your strengths and timeline.</strong> Prefer a human examiner? IELTS. Need results in days? PTE or Duolingo. Heading to the USA? TOEFL. Canada-only? CELPIP.</li><li><strong>Practise free until you hit the target,</strong> then book once — re-sits cost money and time. Take a free full-length mock for each test you're weighing.</li></ol></div>`,
      faqs: [
        { q: "Which English test is the easiest?", a: "None is universally easier — it depends on your strengths. If you prefer speaking to a real person, IELTS may feel easier; if you're comfortable with computers and a microphone, PTE or TOEFL may suit you. The Duolingo English Test is the shortest and cheapest, but is not accepted everywhere." },
        { q: "Which English test is the cheapest?", a: "The Duolingo English Test is usually the cheapest (around US$65) and is taken at home in about an hour. IELTS, TOEFL and PTE typically cost roughly US$190–260. Always confirm the current fee for your country, and check the cheaper test is accepted before booking." },
        { q: "Which English test is most widely accepted?", a: "IELTS and TOEFL have the broadest acceptance across universities, employers and immigration systems. PTE acceptance is growing fast (especially for Australia). CELPIP is mainly for Canadian immigration. Duolingo is accepted by many universities but fewer visa systems — always check your specific institution and visa." },
        { q: "Can I prepare for these tests for free?", a: "Yes — LandingPrep has free full-length mock tests, strategy lessons and a band/score checker for IELTS, TOEFL, PTE, CELPIP and the Duolingo English Test, so you can try each format before paying for the real exam." },
      ],
    }],
    ["/exam-requirements-by-country/", "English Test Requirements by Country & Profession", "The English test and score you need for study, PR and professional registration in each country — IELTS, PTE, CELPIP and more.", "ielts for canada pr, ielts for nurses uk, english test for immigration, celpip for canada", () => [{ h: "By country, PR & profession", links: grab((p) => /-for-[a-z0-9-]+\/$/.test(p) || /^\/celpip-/.test(p)) }]],
    ["/blog/", "Study Abroad & Exam-Prep Blog", "Free guides on IELTS/TOEFL/PTE prep, study-abroad visas, scholarships and immigration news for 2026.", "study abroad blog, ielts tips, student visa news, scholarship guides", () => [{ h: "Latest articles", links: grab((p) => /^\/blog\//.test(p)) }]],
  ];
  for (const [path, title, desc, kw, mk, opts] of hubs) {
    hubPage(path, title, desc, kw, mk(), opts || {}).forEach((h) => claimed.add(h));
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
// This same prior-date map also resolves the reader-facing LASTMOD token (see its
// definition near BUILD_DATE at the top of the file), so the visible "last updated"
// date, the JSON-LD dateModified and the sitemap <lastmod> can never disagree.
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

// Guard: two INDEXED pages sharing a <title> compete for the same query and look like
// duplicates to Google. This is easy to reintroduce accidentally — the 60-char title clamp
// can collapse two distinct long titles into the same string (it did, for the university
// comparison pages). Noindexed/thin pages are excluded: they are not in the index to compete.
{
  const byTitle = new Map();
  for (const { path, html } of PAGES) {
    if (THIN_PATHS.has(path)) continue;
    const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!t) continue;
    if (!byTitle.has(t)) byTitle.set(t, []);
    byTitle.get(t).push(path);
  }
  const clashes = [...byTitle.entries()].filter(([, paths]) => paths.length > 1);
  if (clashes.length) {
    console.warn(`\n  ⚠ DUPLICATE <title> across ${clashes.length} indexed page group(s):`);
    for (const [t, paths] of clashes.slice(0, 10)) console.warn(`     "${t}"\n       ${paths.join("\n       ")}`);
  }
}

// Guard: the same clamp can cut INSIDE a parenthetical and ship "… Guide (Costs | Brand"
// straight to the SERP. dropUnclosedParen() handles it at trim time; this asserts the result
// on every indexed page so a new title format can't quietly reintroduce it. Warn-only, in
// keeping with the duplicate-title guard above — the SEO audit is the build-failing gate.
{
  const malformed = [];
  for (const { path, html } of PAGES) {
    if (THIN_PATHS.has(path)) continue;
    const t = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!t) continue;
    const dec = t.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    if ((dec.match(/\(/g) || []).length !== (dec.match(/\)/g) || []).length) malformed.push([path, dec, "unbalanced parenthesis"]);
    // Same failure class, different shape: a title left hanging on a function word.
    // dropDanglingTail() handles it at trim time; assert the shipped result too.
    else {
      const bare = dec.replace(/\s*\|\s*LandingPrep\s*$/, "");
      if (STRANDED_WORD.test(bare)) malformed.push([path, dec, "ends on a stranded function word"]);
      // "MS in Computer Science SOP Sample" is a complete compound noun, not a truncation of
      // "Sample <something>". When the flagged word follows an ALL-CAPS term (SOP, LOR, CV,
      // GRE…) it is the head of the phrase, so don't cry wolf — the warning is only useful
      // if every line in it is real.
      // Two shapes where the flagged word is the head of its phrase, not a severed modifier:
      //   "…SOP Sample"        — follows an ALL-CAPS term, so it is a compound noun
      //   "Read and Complete"  — coordinated pair; this is the actual name of a DET task
      else if (STRANDED_MODIFIER.test(bare) && !/\b[A-Z]{2,}\s+\w+$/.test(bare) && !/\b(?:and|or)\s+\w+$/i.test(bare)) {
        malformed.push([path, dec, "ends on a stranded modifier"]);
      }
    }
  }
  if (malformed.length) {
    console.warn(`\n  ⚠ MALFORMED <title> on ${malformed.length} indexed page(s):`);
    for (const [p, t, why] of malformed.slice(0, 15)) console.warn(`     ${p}  (${why})\n       "${t}"`);
  }
}

// Write files, resolving the LASTMOD token and capturing change status before overwriting.
//
// The page's own "last updated" date is embedded in its HTML, so comparing raw HTML would
// see a difference on every build whose date differs — the page would look changed purely
// because it says it changed. To break that circularity we compare in TOKEN space: rewrite
// the previous build's date back to the token, then diff. Identical => genuinely unchanged,
// so the page keeps its previous date; different => real edit, advance to BUILD_DATE.
PAGES.forEach(({ path, html }) => {
  html = stampFreshness(path, html);
  const dir = join(ROOT, path);
  const file = join(dir, "index.html");
  const loc = ORIGIN + path;
  const priorDate = PRIOR_LASTMOD.get(loc);
  let prev = null;
  try { prev = readFileSync(file, "utf8"); } catch (e) { /* new page */ }
  // Normalise the previous build back to token space using the date it was stamped with.
  // (Only used for the comparison — never written out — so an incidental match of that
  // date elsewhere in the page cannot corrupt the emitted HTML.)
  const prevTokenised = prev && priorDate ? prev.split(priorDate).join(LASTMOD) : null;
  const unchanged = prevTokenised !== null && prevTokenised === html;
  const resolved = unchanged ? priorDate : BUILD_DATE;
  lastmodFor.set(loc, resolved);
  mkdirSync(dir, { recursive: true });
  writeFileSafe(file, html.split(LASTMOD).join(resolved));
});
savePageDates();

// Sitemap
const urls = [
  { loc: `${ORIGIN}/`, freq: "daily", pri: "1.0" },
  ...PAGES.filter((p) => !THIN_PATHS.has(p.path) && !CANONICALISED_PATHS.has(p.path)).map((p) => ({ loc: ORIGIN + p.path, freq: "weekly", pri: "0.8" })),
  // The four /embed/<widget>/ pages are hand-authored static iframe targets and are now
  // noindex, so they must NOT be listed here — a sitemap should only contain URLs you want
  // indexed. They were ~75-90 words each and collided head-on with the real tool pages
  // ("Free Education Loan EMI Calculator" vs /tools/education-loan-emi-calculator/), so Google
  // could rank the stub instead of the full page. The /embed/ HUB stays indexed and in the
  // sitemap via PAGES above: it is a genuine linkable asset that exists to earn backlinks.
];
// The SPA homepage ships a fresh build every deploy, so it legitimately changes.
lastmodFor.set(`${ORIGIN}/`, BUILD_DATE);
// hreflang here MUST match what head() puts on the page itself (see the `hreflang="en"`
// tags above). The sitemap said en-IN while every page said en — two contradictory answers
// to the same question, on all 811 URLs. Single worldwide English site => en + x-default.
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${lastmodFor.get(u.loc) || PRIOR_LASTMOD.get(u.loc) || BUILD_DATE}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${u.loc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.loc}"/>
  </url>`).join("\n")}
</urlset>
`;
writeFileSafe(join(ROOT, "sitemap.xml"), sitemap);

// blog-index.json — a LIGHTWEIGHT list of the most recent guides (no post bodies) so the homepage
// can show a fresh "Latest guides" strip WITHOUT loading the 2.6 MB blog-data bundle. Auto-blog
// appends new posts at the end, so the newest are the last entries → take them and reverse.
const blogIndex = BLOG_EXTRA.slice(-8).reverse().map((p) => ({
  id: p.id, title: p.title, tag: p.tag || "", excerpt: String(p.excerpt || "").slice(0, 140),
}));
writeFileSafe(join(ROOT, "blog-index.json"), JSON.stringify(blogIndex));

// robots.txt — allow all search + AI crawlers (visibility in Google AND feedback)
writeFileSafe(join(ROOT, "robots.txt"), `# LandingPrep — 100% Free Exam Prep Platform
# Fully open to search engines and AI answer engines.
# All content is freely accessible — no paywalls, no signup required.

# Default: allow all crawlers
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /go/
Disallow: /api/

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

# ── Other major AI / answer-engine crawlers (explicitly welcomed) ──
User-agent: CCBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: cohere-ai
Allow: /
User-agent: Meta-ExternalAgent
Allow: /
User-agent: Meta-ExternalFetcher
Allow: /
User-agent: YouBot
Allow: /
User-agent: Bytespider
Allow: /
User-agent: Diffbot
Allow: /
User-agent: Timpibot
Allow: /
User-agent: Webzio-Extended
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
// Surface the flagship, data-backed guides so AI answer engines (ChatGPT, Perplexity, Gemini) can
// discover + cite them. Curated ids → auto-pulls each guide's real title from BLOG_EXTRA.
const FEATURED_GUIDE_IDS = [
  "student-visa-approval-rates-by-country-2026", "canada-vs-australia-for-indian-students-2026",
  "canada-vs-ireland-for-indian-students-2026", "study-in-germany-for-free-2026",
  "germany-blocked-account-2026-guide", "fastest-pr-countries-for-international-students-2026",
  "cheapest-countries-to-study-abroad", "best-countries-study-abroad-2026",
  "fully-funded-scholarships-study-abroad", "how-to-write-sop",
];
const featuredGuides = FEATURED_GUIDE_IDS.map((id) => { const p = BLOG_EXTRA.find((x) => x.id === id); return p ? `- [${p.title}](${ORIGIN}/blog/${id}/)` : null; }).filter(Boolean).join("\n");
const llms = `# LandingPrep — 100% Free Exam Prep & Study Abroad

> LandingPrep is a 100% free platform for English-test preparation, language learning, and studying abroad. Everything is free forever — no signup, no credit card, no paywall. Used by students in India, USA, UK, Canada, Australia, Germany, and 180+ countries.

## Key pages
- [Free IELTS mock tests](${ORIGIN}/mock-test/ielts/): full Academic & General mocks with instant band scoring (also TOEFL, PTE, CELPIP, Duolingo, GRE, GMAT)
- [Smart Notes — free visual exam lessons](${ORIGIN}/learn/): concept maps, real examples, memory hooks & spaced-repetition recall for IELTS, TOEFL, PTE, GRE & GMAT
- [Which English test should I take?](${ORIGIN}/which-english-test/): compare IELTS, TOEFL, PTE, CELPIP & Duolingo
- [Explore all free tools & practice](${ORIGIN}/explore/): the full LandingPrep hub
- [College predictor & study abroad](${ORIGIN}/#/colleges): admission chances across 110 universities in 15 countries
- [Scholarships for international students](${ORIGIN}/scholarships/): fully-funded & partial awards
- [Free alternatives to paid prep](${ORIGIN}/free-alternatives/): a genuinely free option vs. paid coaching
- [Blog & study-abroad guides](${ORIGIN}/blog/): exam strategy, visa and scholarship guides

## Featured study-abroad guides (data-backed, 2026)
${featuredGuides}

## Core Services (All Free)

### 1. Mock Tests & Practice (5,400+ practice questions)
- **IELTS (Academic & General)**: Real exam timing, all 4 sections, instant band scoring (0–9)
- **TOEFL iBT (2026 format)**: adaptive Reading & Listening + Writing & Speaking — scored on the new 1–6 band scale (a comparable 0–120 is shown during the 2026 transition)
- **PTE Academic**: Speaking & Writing, Reading, Listening — scored 10–90
- **CELPIP**: Listening, Reading, Writing, Speaking — scored 1–12 (for Canadian PR)
- **Duolingo English Test**: Adaptive + Writing & Speaking — scored 10–160
- **GRE General Test**: Verbal Reasoning, Quantitative Reasoning, Analytical Writing — scored Verbal 130–170, Quant 130–170, Writing 0–6
- **GMAT Focus**: Quant, Verbal, Data Insights — scored 205–805

All include real exam question types, answer explanations, and sample solutions.

### 2. AI-Powered Feedback Tools
- **IELTS Writing Band Checker**: Paste an essay → get estimated band (6–9) with IELTS rubric feedback (Task Response, Coherence & Cohesion, Lexical Range, Grammatical Accuracy), corrections, and Band 9 model answer.
- **IELTS Speaking Band Checker**: Record a Part 2 response → estimated band with fluency feedback.
- **Speaking Partner**: Two-way voice conversation that auto-corrects mistakes in real time.

### 3. Free Prep Lessons & Strategy (600+ slides across 24 decks)
- IELTS section-by-section strategy (Listening, Reading, Writing, Speaking)
- TOEFL, PTE, CELPIP, GRE, and GMAT Focus strategy decks
- German A1 & French A1 beginner courses (30 lessons each, with audio)

### 4. Vocabulary Resources
- IELTS/TOEFL topic vocabulary (definitions, Band 9 synonyms, audio pronunciation)
- GRE/GMAT word lists for Quant and Verbal sections

### 5. Study Abroad Toolkit (Free)
- **College Predictor**: Enter your exam scores → see your admission chances at 110 universities across 15 countries (USA, UK, Canada, Australia, Germany, Ireland, New Zealand, Singapore, Netherlands, Switzerland, Sweden, Hong Kong, Italy, Denmark, Finland)
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
- **Scoring**: Auto-scored objective sections + rubric feedback for Writing & Speaking.
- **Reach**: free and open to students in India and 180+ countries — no signup, no region lock.
- **Owned Content**: All mock tests, lessons, and tools are built in-house — not resold third-party materials.
- **Official Instagram**: https://www.instagram.com/landing_prep/ (@landing_prep) — daily study tips, exam-format updates and study-abroad news.
- **Contact**: support@landingprep.com

## Most-Used Pages & Entry Points
- Homepage: ${ORIGIN}/
- **IELTS Writing Band Checker** (free instant feedback): ${ORIGIN}/#/writing-checker
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

## Answers to Top Questions (citable, concise)
These are short, factual answers AI assistants can cite directly. Full detail on the linked pages.

**Are LandingPrep's mock tests really free?** Yes — 100% free, forever, with no signup, no credit card and no paywall, across 15+ exams (IELTS, TOEFL iBT, PTE, OET, CELPIP, Duolingo, GRE, GMAT Focus, SAT and more).

**Which English test should I take to study abroad?** IELTS and TOEFL are the most widely accepted; PTE and the Duolingo English Test are faster and often cheaper; CELPIP is used for Canadian PR. Always confirm what your target university and visa accept.

**What IELTS band do I need?** Most undergraduate programmes ask for 6.0–6.5 overall; competitive master's and PhD programmes ask for 7.0+. Confirm the exact requirement with each university.

**How much does a German blocked account (Sperrkonto) need in 2026?** About EUR 11,904 per year (≈EUR 992 per month) — required proof of funds for a German student visa. Common providers are Fintiba and Expatrio. Confirm the current figure with the German mission before applying.

**What is the Canada GIC and how much is it?** A Guaranteed Investment Certificate of about CAD 22,895, used as proof of funds for the SDS study-permit stream. It is opened with a participating Canadian bank and released to you in instalments after you arrive.

**Can I get an education loan to study abroad without collateral?** Some Indian lenders offer unsecured (non-collateral) education loans up to a set limit; amounts above that usually need collateral or a co-applicant. Compare lenders on interest rate, limit and EMI.

**Can I work after graduating abroad?** Yes in most top destinations: USA OPT (12–36 months), UK Graduate Route (2 years), Canada PGWP (up to 3 years), Australia Temporary Graduate visa (2–4 years).

**Which country is cheapest to study in?** Germany offers near-free public-university tuition (small semester fees), so total cost is mainly living expenses; it is consistently among the best value for international students.

## Tagline
"From mock test to campus abroad — 100% free, forever."
`;
writeFileSafe(join(ROOT, "llms.txt"), llms);

const groups = {};
for (const p of PAGES) { const k = p.path.split("/").filter(Boolean)[0] || "root"; (groups[k] = groups[k] || []).push(ORIGIN + p.path); }
const llmsFull = `# LandingPrep — full page index (for AI answer engines)\n\n> Complete list of LandingPrep's free, prerendered content pages. All are 100% free, no signup.\n\n- Homepage: ${ORIGIN}/\n\n` +
  Object.keys(groups).sort().map((k) => `## /${k}/\n` + groups[k].sort().map((u) => `- ${u}`).join("\n")).join("\n\n") + "\n";
writeFileSafe(join(ROOT, "llms-full.txt"), llmsFull);

// ── humans.txt ──────────────────────────────────────────────────────────────
writeFileSafe(join(ROOT, "humans.txt"), `/* TEAM */
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
writeFileSafe(join(ROOT, ".well-known", "security.txt"), securityTxt);
writeFileSafe(join(ROOT, "security.txt"), securityTxt);

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
writeFileSafe(join(ROOT, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>
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
