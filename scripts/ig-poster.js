"use strict";
/*
 * LandingPrep — daily Instagram auto-poster engine (v3: bold "news-page" style, 5 posts/day).
 * Loud, headline-dominant cards (TNC / immigrationnewscanada style): huge bold headline with a
 * highlighted keyword, stat callout boxes, a punchy footer CTA. Content pulled from the site's
 * OWN data so it's always on-brand and free:
 *   slot 0  IMMIGRATION / VISA NEWS   (country policy changes)
 *   slot 1  STUDY-ABROAD / EDUCATION  (blog posts: universities, scholarships, guides)
 *   slot 2  DAILY QUIZ                (vocab MCQ + real exam questions, A/B/C/D)
 *   slot 3  EXAM SPOTLIGHT            (rotating IELTS/TOEFL/GRE/GMAT/PTE/CELPIP/Duolingo stats)
 *   slot 4  WORD OF THE DAY / LANGUAGE
 * Each day uses a date offset so every slot shows fresh content. 5 GitHub-Action cron times/day,
 * each hitting /api/ig/post-daily?slot=N (server also derives the slot from the UTC hour).
 */
const fs = require("fs");
const path = require("path");
let sharp = null;
try { sharp = require("sharp"); } catch (e) { /* installed at deploy time on Render */ }

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "ig-out");
const HANDLE = "@landing_prep";
const SITE = "landingprep.com";
const FONT = "Inter, 'Segoe UI', 'DejaVu Sans', Arial, sans-serif";
const SLOTS = 5;

// ── data loaders (cached, guarded) ───────────────────────────────────────
function evalWindow(file) { try { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, file), "utf8"))(w); return w; } catch (e) { return {}; } }
function loadJSON(file) { try { return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8").replace(/^﻿/, "")); } catch (e) { return null; } }
const cap = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);

let _words = null, _news = null, _blog = null, _bank = null, _exam = null;
function vocabWords() {
  if (_words) return _words;
  const V = loadJSON("data/vocab-topics.json") || {}; _words = [];
  for (const t of Object.values(V)) for (const w of (t.words || [])) if (w && w.w && w.def) _words.push(w);
  return _words;
}
function newsItems() {
  if (_news) return _news;
  const D = evalWindow("country-data.jsx").LP_COUNTRY_DATA || []; _news = [];
  for (const c of D) for (const ch of (c.changes || [])) { const t = ch && (ch.t || (typeof ch === "string" ? ch : "")); if (t) _news.push({ country: c.name, flag: c.flag || "", date: ch.d || "", text: t }); }
  // prioritise visa/immigration-flavoured updates first
  _news.sort((a, b) => (/(visa|permit|\bPR\b|residen|immig|graduate|work)/i.test(b.text) ? 1 : 0) - (/(visa|permit|\bPR\b|residen|immig|graduate|work)/i.test(a.text) ? 1 : 0));
  return _news;
}
function blogPosts() {
  if (_blog) return _blog;
  const B = evalWindow("blog-data.jsx").LP_BLOG_EXTRA || {};
  const arr = Array.isArray(B) ? B : (B.posts || Object.values(B).find((v) => Array.isArray(v)) || []);
  _blog = arr.filter((p) => p && p.title);
  return _blog;
}
function examPatterns() { if (_exam) return _exam; _exam = loadJSON("data/exam-patterns.json") || {}; return _exam; }
function bankQuestions() {
  if (_bank) return _bank;
  _bank = [];
  try {
    const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, "data-questions.js"), "utf8"))(w);
    const Q = w.LP_QUESTIONS || {}; const L = ["A", "B", "C", "D", "E"];
    const walk = (arr, exam) => {
      if (!Array.isArray(arr)) { if (arr && typeof arr === "object") for (const k of Object.keys(arr)) walk(arr[k], exam); return; }
      for (const x of arr) {
        if (!x || typeof x !== "object") continue;
        const q = x.question || x.q || x.prompt, opts = x.options || x.choices;
        if (q && Array.isArray(opts) && opts.length >= 3 && !x.passage && String(q).length <= 110) {
          const ot = opts.map((o) => String(typeof o === "string" ? o : (o.text || o.label || "")).replace(/^[A-E][.)]\s*/, "").trim());
          if (ot.slice(0, 4).every((t) => t && t.length <= 54)) {
            let ans = x.answer !== undefined ? x.answer : x.correct, ai = -1;
            if (typeof ans === "number") ai = ans;
            else if (typeof ans === "string") { ai = L.indexOf(ans.trim().toUpperCase()[0]); if (ai < 0) ai = ot.findIndex((t) => t.toLowerCase() === String(ans).replace(/^[A-E][.)]\s*/, "").trim().toLowerCase()); }
            if (ai >= 0 && ai < Math.min(ot.length, 4)) _bank.push({ exam: exam.toUpperCase(), question: String(q), options: ot.slice(0, 4), ai });
          }
        } else walk(x, exam);
      }
    };
    for (const exam of Object.keys(Q)) walk(Q[exam], exam);
  } catch (e) {}
  return _bank;
}

// palette per content type (very-light bg tint + bold accent)
const THEME = {
  immig: { bg: "#FFF4EE", accent: "#E0492B", chip: "VISA & IMMIGRATION NEWS" },
  edu:   { bg: "#EEF3FF", accent: "#2B5BE0", chip: "STUDY-ABROAD NEWS" },
  quiz:  { bg: "#F1EEFF", accent: "#6D28D9", chip: "DAILY QUIZ" },
  exam:  { bg: "#EBFAF2", accent: "#0E9F6E", chip: "EXAM GUIDE" },
  vocab: { bg: "#E9F7FF", accent: "#0284C7", chip: "WORD OF THE DAY" },
};

// ── hashtag strategy (mix broad-reach + mid + niche + branded, IG max 30) ──
const TAGS = {
  core: ["studyabroad", "studyabroadlife", "internationalstudents", "studygram", "studyabroadconsultant", "landingprep", "abroadstudies", "studentlife"],
  immig: ["immigration", "studentvisa", "visa", "immigrationnews", "studyvisa", "permanentresidency", "studyvisaupdate", "visaupdate", "workpermit", "settleabroad", "studyandwork", "visaguide"],
  edu: ["studyabroad2026", "universityadmission", "scholarships", "collegeadmission", "admissions2026", "dreamuniversity", "studyoverseas", "highereducation", "msabroad", "fallintake2026"],
  ielts: ["ielts", "ieltspreparation", "ieltsband7", "ieltsexam", "ieltstips", "ieltswriting", "ieltsspeaking", "learnenglish", "englishspeaking"],
  toefl: ["toefl", "toeflpreparation", "toeflexam", "toefltips", "englishtest"],
  gre: ["gre", "greprep", "greexam", "grevocabulary", "gremath", "grewords", "grpreparation"],
  gmat: ["gmat", "gmatprep", "gmatexam", "mba", "gmatquant", "businessschool"],
  pte: ["pte", "pteexam", "pteacademic", "ptepreparation"],
  vocab: ["vocabulary", "wordoftheday", "englishvocabulary", "learnenglish", "vocabularywords", "englishwords", "improveenglish", "englishlearning", "dailyvocabulary"],
  quiz: ["quiz", "dailyquiz", "englishquiz", "quiztime", "testyourself", "gkquiz", "knowledgeispower"],
  exam: ["examprep", "testprep", "mocktest", "studytips", "examtips", "studymotivation", "studyhard"],
};
// 2026 algorithm: 3-5 highly relevant tags out-reach 30 generic ones. Pass best-first; we keep 5.
// High-traffic, ON-TOPIC tags only. Irrelevant "trending" tags (war/news events) get an
// account shadow-banned by IG's relevance filter — they HURT reach, so we never use them.
const TRENDING_TAGS = ["studyabroad", "studyabroad2026", "studygram", "internationalstudents", "studyvisa", "ieltspreparation", "studentlife", "studyoverseas", "scholarships", "dreamstudyabroad", "studyabroadlife", "abroadstudies", "highereducation", "msabroad", "futureabroad", "studentvisaupdate"];
function buildTags() {
  const out = [];
  for (let i = 0; i < arguments.length; i++) { const a = Array.isArray(arguments[i]) ? arguments[i] : [arguments[i]]; for (const t of a) { const x = String(t || "").toLowerCase().replace(/[^a-z0-9]/g, ""); if (x && !out.includes(x)) out.push(x); } }
  for (const t of TRENDING_TAGS) { if (!out.includes(t)) out.push(t); }
  return out.slice(0, 20);
}

// ── content pickers (one per slot) ───────────────────────────────────────
function pickImmigrationNews(seed) {
  const N = newsItems(); if (!N.length) return null;
  const n = N[seed % N.length]; const T = THEME.immig;
  return { type: "bulletin", bg: T.bg, accent: T.accent, category: "IMMIGRATION NEWS",
    headline: clip(n.text, 116), highlight: [n.country], sub: "", cta: "Full guide → link in bio",
    flagCountry: n.country, dateStr: n.date || "",
    photoQuery: pickPhotoQuery(n.country + " " + n.text, "immig"),
    icons: [{ glyph: "doc", label: "What changed" }, { glyph: "check", label: "Who qualifies" }, { glyph: "globe", label: "How to apply" }],
    caption: `🚨 ${n.country.toUpperCase()} UPDATE ${n.flag}${n.date ? " · " + n.date : ""}\n\n${n.text}\n\n📲 SHARE this with someone planning to study in ${n.country}.\n📌 SAVE it so you don't miss the deadline.\n💬 Aiming for ${n.country}? Comment "${n.flag || n.country}" 👇\n\n👉 Full ${n.country} guide — 100% free, link in bio.\nFollow ${HANDLE} for daily visa & study-abroad news 🌍`,
    tags: buildTags("study" + n.country.toLowerCase().replace(/\s+/g, ""), "studentvisa", "immigration", "studyabroad", "landingprep") };
}
function pickEducationNews(seed) {
  const B = blogPosts(); if (!B.length) return null;
  const edu = B.filter((p) => /university|scholar|study|admission|guide|country|sop|application|career|exam|ielts|gre|gmat/i.test((p.tag || "") + " " + p.title));
  const pool = edu.length ? edu : B; const p = pool[seed % pool.length]; const T = THEME.edu;
  return { type: "bulletin", bg: T.bg, accent: T.accent, category: (p.tag || "STUDY ABROAD").toUpperCase(),
    headline: clip(p.title, 100), highlight: [], sub: clip(p.excerpt, 120), cta: "Read free → link in bio",
    flagCountry: detectCountry(p.title), dateStr: "",
    photoQuery: pickPhotoQuery(p.title, "edu"),
    icons: [{ glyph: "cap", label: "Requirements" }, { glyph: "calendar", label: "Deadlines" }, { glyph: "globe", label: "Apply free" }],
    caption: `📚 ${p.title}\n\n${clip(p.excerpt, 200)}\n\n📲 SHARE this with a friend applying this year.\n📌 SAVE it for your own applications.\n💬 Which country/course are you targeting? Tell us 👇\n\n👉 Read the full guide — free, link in bio.\nFollow ${HANDLE} for daily study-abroad tips ✈️`,
    tags: buildTags((p.tag || "studyabroad").toLowerCase().replace(/[^a-z0-9]/g, ""), "scholarships", "studyabroad2026", "internationalstudents", "landingprep") };
}
function quizFrom(seedCat, question, raw, ansIdx, tags, examTag, hl) {
  const L = ["A", "B", "C", "D"]; const T = THEME.quiz;
  const ord = [0, 1, 2, 3].slice(0, raw.length).sort((a, b) => ((ansIdx * 31 + a * 17) % 101) - ((ansIdx * 31 + b * 17) % 101));
  const options = ord.map((i, k) => ({ L: L[k], text: raw[i], correct: i === ansIdx }));
  const ans = (options.find((o) => o.correct) || options[0]).L;
  return { type: "quiz", bg: T.bg, accent: T.accent, category: seedCat, question, highlight: hl || [], options, answerLetter: ans,
    caption: `🧠 Can YOU crack this ${examTag} question?\n\n${question}\n\n${options.map((o) => o.L + ") " + o.text).join("\n")}\n\n💬 Comment your answer — A, B, C or D 👇\n📲 TAG a friend who'll get this wrong 😏\n📌 SAVE to revise later.\n\n👉 Free ${examTag} practice — link in bio.\nFollow ${HANDLE} for a daily question 🎯\n.\n.\n.\n✅ Answer: ${ans}`,
    tags };
}
function pickQuiz(seed) {
  // alternate vocab MCQ and real exam questions
  if (seed % 2 === 0) {
    const W = vocabWords(); if (W.length >= 4) {
      const w = W[seed % W.length]; const d = [];
      for (let i = 1; d.length < 3 && i < W.length; i++) { const o = W[(seed + i * 41) % W.length]; if (o.w !== w.w && o.def && !d.find((x) => x.def === o.def)) d.push(o); }
      if (d.length === 3) { const raw = [w.def, d[0].def, d[1].def, d[2].def].map((x) => x.length > 52 ? x.slice(0, 50).replace(/\s\S*$/, "") + "…" : x);
        return quizFrom("VOCAB QUIZ · IELTS · GRE", `What does “${cap(w.w)}” mean?`, raw, 0, buildTags("ielts", "vocabulary", "ieltspreparation", "englishvocabulary", "landingprep"), "Vocabulary", [cap(w.w)]); }
    }
  }
  const Bq = bankQuestions(); if (Bq.length) { const q = Bq[seed % Bq.length]; const ex = q.exam.toLowerCase();
    return quizFrom(q.exam + " PRACTICE QUESTION", q.question, q.options, q.ai, buildTags(ex, ex + "preparation", "examprep", "studyabroad", "landingprep"), q.exam, [q.exam]); }
  return pickQuiz(seed + 1 > 1e6 ? 0 : seed + 1) === null ? null : null; // safety (won't recurse on empty)
}
function shortVal(s, n) { s = String(s || "").replace(/\(.*?\)/g, "").replace(/hours?/i, "h").replace(/minutes?/i, "m").replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n).trim() + "…" : s; }
function shortDur(s) { s = String(s || ""); const h = (s.match(/(\d+)\s*(?:hours?|hrs?|h)\b/i) || [])[1], m = (s.match(/(\d+)\s*(?:minutes?|mins?|m)\b/i) || [])[1]; if (h || m) return (h ? h + "h" : "") + (h && m ? " " : "") + (m ? m + "m" : ""); return shortVal(s, 10); }
function clip(s, n) { s = String(s || "").replace(/\s+/g, " ").trim(); if (s.length <= n) return s; let r = s.slice(0, n).replace(/[\s(,;:.\-–]*\S*$/, "").trim(); r = r.replace(/\s*\([^)]*$/, "").trim(); return r + "…"; }
function pickExamSpotlight(seed) {
  const E = examPatterns(); const keys = Object.keys(E); if (!keys.length) return null;
  const k = keys[seed % keys.length]; const e = E[k]; const T = THEME.exam; const name = k.toUpperCase();
  const stats = [];
  if (e.sections) stats.push({ v: String(e.sections.length), label: "Sections" });
  if (e.totalDuration) stats.push({ v: shortDur(e.totalDuration), label: "Total time" });
  if (e.scoring) stats.push({ v: shortVal(e.scoring, 11), label: "Scoring" });
  stats.push({ v: "FREE", label: "Mock test" });
  stats.push({ v: "Worldwide", label: "Accepted" });
  stats.push({ v: "Year-round", label: "Test dates" });
  const secNames = (e.sections || []).map((s) => s.name).filter(Boolean).slice(0, 4).join(" · ");
  return { type: "exam", bg: T.bg, accent: T.accent, category: name + " EXAM GUIDE",
    headline: name, sub: secNames, stats, highlight: [], cta: "Free " + name + " mock → link in bio",
    caption: `🎯 The ${name} exam, explained 👇\n\n${e.totalDuration ? "⏱ Duration: " + e.totalDuration + "\n" : ""}${e.scoring ? "📊 Scoring: " + e.scoring + "\n" : ""}${secNames ? "📝 Sections: " + secNames + "\n" : ""}\n📲 TAG someone preparing for ${name}.\n📌 SAVE this — you'll need it.\n💬 Which exam are you taking? Comment 👇\n\n👉 FREE full-length ${name} mock test — link in bio.\nFollow ${HANDLE} for daily exam prep 📚`,
    tags: buildTags(k.toLowerCase(), k.toLowerCase() + "preparation", "examprep", "mocktest", "landingprep") };
}
function pickWordOfDay(seed) {
  const W = vocabWords(); if (!W.length) return null; const T = THEME.vocab;
  const n = Math.min(4, W.length); const words = []; const used = new Set();
  for (let i = 0; i < n; i++) { let idx = (((seed * 7 + i * 13) % W.length) + W.length) % W.length; let g = 0; while (used.has(idx) && g++ < W.length) idx = (idx + 1) % W.length; used.add(idx); const w = W[idx]; words.push({ w: cap(w.w), pos: w.pos || "", def: clip(w.def, 56) }); }
  const capList = words.map((x) => `📖 ${x.w}${x.pos ? " (" + x.pos + ")" : ""} — ${x.def}`).join("\n");
  return { type: "vocab", bg: T.bg, accent: T.accent, category: "WORDS OF THE DAY", words, highlight: [],
    caption: `📚 ${n} words to level up your English 👇\n\n${capList}\n\n📲 TAG a study buddy. 📌 SAVE these for your IELTS / GRE prep.\n💬 Use one in a sentence below 👇\n\nFollow ${HANDLE} for new words daily 📚`,
    tags: buildTags("ielts", "vocabulary", "wordoftheday", "englishvocabulary", "landingprep") };
}

// ── LIVE news via Google News RSS (free, no key) — real trending headlines ─
async function fetchT(url, opts, ms) { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms || 9000); try { return await fetch(url, Object.assign({ signal: c.signal }, opts || {})); } finally { clearTimeout(t); } }
function decodeXml(s) {
  return String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n)).replace(/\s+/g, " ").trim();
}
function cleanTitle(t) {
  t = decodeXml(t);
  t = t.replace(/\s*\([A-Za-z0-9_-]{6,}\)\s*$/, "");          // trailing tracking code e.g. (rWiARfhRwq)
  t = t.split(/\s+\|\s+/)[0].trim();                          // keep first segment before " | " SEO spam
  t = t.replace(/\s+[-–—]\s+[^-–—|]{2,45}$/, "").trim();      // strip trailing " - Publisher"
  t = stripEmoji(t);                                          // remove decorative/garbled unicode
  return t.replace(/\s{2,}/g, " ").trim();
}
async function fetchNewsRSS(query) {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + " when:14d")}&hl=en-IN&gl=IN&ceid=IN:en`;
    const r = await fetchT(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; LandingPrepBot/1.0)" } }, 9000);
    if (!r.ok) return null;
    const xml = await r.text(); const items = []; const re = /<item>([\s\S]*?)<\/item>/g; let m;
    while ((m = re.exec(xml)) && items.length < 40) {
      const b = m[1];
      const title = decodeXml((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || "");
      const date = (b.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1] || "";
      const source = decodeXml((b.match(/<source[^>]*>([\s\S]*?)<\/source>/) || [])[1] || "");
      if (title) { const tt = source ? title.replace(new RegExp("\\s*[-–—]\\s*" + source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$", "i"), "").trim() : title; items.push({ title: tt, date, source }); }
    }
    return items.length ? items : null;
  } catch (e) { return null; }
}
const PHOTO_COUNTRIES = ["Canada", "Australia", "United Kingdom", "UK", "Britain", "England", "USA", "United States", "America", "Germany", "France", "Ireland", "New Zealand", "Italy", "Netherlands", "Singapore", "Dubai", "India", "Spain", "Sweden", "Switzerland"];
const LANDMARK = { Canada: "Toronto Canada skyline", Australia: "Sydney Australia opera house", "United Kingdom": "London England Big Ben", UK: "London England Big Ben", Britain: "London England Big Ben", England: "London England Big Ben", USA: "New York city skyline", "United States": "New York city skyline", America: "New York city skyline", Germany: "Berlin Germany Brandenburg gate", France: "Paris France Eiffel Tower", Ireland: "Dublin Ireland", "New Zealand": "Auckland New Zealand", Italy: "Rome Italy Colosseum", Netherlands: "Amsterdam Netherlands canal", Singapore: "Singapore Marina Bay skyline", Dubai: "Dubai skyline Burj Khalifa", India: "India Gateway of India Mumbai", Spain: "Barcelona Spain", Sweden: "Stockholm Sweden", Switzerland: "Switzerland alps zurich" };
function pickPhotoQuery(title, kind) {
  const f = PHOTO_COUNTRIES.find((c) => new RegExp("\\b" + c + "\\b", "i").test(title));
  if (f) return LANDMARK[f] || (f + " skyline landmark");           // country named → its iconic landmark
  const t = String(title).toLowerCase();
  if (/scholarship|fund|grant|tuition/.test(t)) return "graduation ceremony students celebration";
  if (/visa|permit|passport|immigration|residen|migrant/.test(t)) return "passport visa travel documents";
  if (/universit|admission|colleg|campus|enrol/.test(t)) return "university campus students";
  return kind === "immig" ? "airport international travel" : "students studying abroad campus";
}
function fmtDate(s) { try { const d = new Date(s); if (isNaN(d)) return ""; return d.getUTCDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()] + " " + d.getUTCFullYear(); } catch (e) { return ""; } }
// strip a label already baked into a data value so we never double it ("PR: PR: …")
function stripDup(v) { return String(v || "").replace(/^\s*(post[- ]study work( visa)?|work (visa|permit)|pr( pathway| timeline)?|permanent residen\w*|tuition( fees?)?|visa success)\s*[:\-–]\s*/i, "").trim(); }
// pull 2-4 ACCURATE facts from our own (vetted) country data to give the caption real substance
function countryCaptionFacts(name) {
  if (!name) return "";
  try {
    const D = evalWindow("country-data.jsx").LP_COUNTRY_DATA || [];
    const c = D.find((x) => x && x.name && x.name.toLowerCase() === String(name).toLowerCase());
    if (!c) return "";
    const L = [];
    if (c.postStudyWork) L.push("💼 Post-study work: " + stripDup(c.postStudyWork));
    if (c.prTimeline) L.push("🛂 PR pathway: " + stripDup(c.prTimeline));
    if (c.avgTuition) L.push("💰 Tuition: " + stripDup(c.avgTuition));
    if (c.visaSuccess) L.push("✅ ~" + c.visaSuccess + "% student-visa approval");
    return L.length ? "\n\n" + L.slice(0, 4).join("\n") : "";
  } catch (e) { return ""; }
}
function rssToContent(it, kind) {
  const T = kind === "immig" ? THEME.immig : THEME.edu;
  const title = cleanTitle(it.title); const country = detectCountry(title);
  const cat = kind === "immig" ? "IMMIGRATION NEWS" : "STUDY-ABROAD NEWS";   // no source name on the image anymore
  return { type: "bulletin", accent: T.accent, bg: T.bg, category: cat, headline: clip(title, 120), highlight: [],
    flagCountry: country, dateStr: fmtDate(it.date), photoQuery: pickPhotoQuery(title, kind), live: true, cta: "Full guide → landingprep.com",
    caption: `🚨 ${kind === "immig" ? "IMMIGRATION" : "STUDY-ABROAD"} NEWS${it.date ? " · " + fmtDate(it.date) : ""}\n\n${title}${countryCaptionFacts(country)}\n\n⚠️ Rules change often — always confirm the latest on official government / university websites before you act.\n\n📲 SHARE this with someone who needs it.\n📌 SAVE for reference.\n💬 What's your take? Comment 👇\n\n👉 Free study-abroad guides & tools → landingprep.com\nFollow ${HANDLE} for daily updates 🌍`,
    tags: buildTags(kind === "immig" ? "studentvisa" : "studyabroad", kind === "immig" ? "immigration" : "scholarships", "studyabroadnews", "internationalstudents", "landingprep") };
}
const RSS_Q = {
  immig: ["international student visa news", "study abroad immigration policy", "Express Entry Canada draw", "UK Graduate Route student visa", "Australia student visa changes", "post study work visa", "student visa rule change"],
  edu: ["study abroad scholarship", "international student scholarship 2026", "study abroad university admission", "overseas education students", "study abroad intake 2026", "international students enrollment"],
};
const JUNK_RE = /school assembly|news headlines|top \d+ (news|stories|headlines)|round-?up|recap|live updates?|current affairs|gk (questions?|quiz)|\bquiz\b|horoscope|recipe|fifa|world cup|football|soccer|cricket|\bipl\b|olympic|tournament|\bmatch\b|\bgoal[s]?\b|striker|premier league|la liga|box office|\bmovie\b|\bfilm\b|actor|actress|celebrity|trailer|\bsong\b|\balbum\b|web series|box-office/i;
const REL = {
  immig: /visa|immigration|permit|\bpr\b|residen|migrant|citizenship|deport|express entry|graduate route|work right|sponsor/i,
  edu: /student|study|universit|colleg|scholarship|admission|abroad|tuition|campus|intake|enrol|fellowship|\bms\b|graduate/i,
};
const SPAM_RE = /prediction|click here|subscribe|sponsored|how to apply step|top \d+|best \d+|list of|\bvs\b|^\s*\d+\s|apply now|enquire|book (a )?free|consultanc|register now|limited seats/i;
// teaser headlines that promise info but don't state it (we want self-contained news, not "visit website" bait)
const TEASER_RE = /latest .*(times?|dates?|fees?|cost|rates?)|check (all|here|now|out)|everything you|all you need|complete (guide|list|details)|how to apply|step[- ]by[- ]step|find out|here'?s (how|what|why)|what you need|things (you|to) know|you (should|need to) know|ultimate guide|a guide to|explained|breakdown|all you|know about/i;
async function liveNews(now, slot) {
  if (process.env.LIVE_NEWS === "0") return null;
  const kind = slot === 0 ? "immig" : "edu"; const seed = dayNumber(now);
  const list = RSS_Q[kind]; const items = await fetchNewsRSS(list[seed % list.length]);
  if (!items || !items.length) return null;
  const cleaned = items.map((it) => ({ src: it.source, date: it.date, t: cleanTitle(it.title) }));
  const good = cleaned.filter((it) => it.t.length >= 28 && it.t.length <= 110 && !JUNK_RE.test(it.t) && !SPAM_RE.test(it.t) && !TEASER_RE.test(it.t) && REL[kind].test(it.t) && !/[|/]/.test(it.t) && /^[\x20-\x7E''""–—…]+$/.test(it.t));
  if (!good.length) return null; // no clean headline → fall back to curated (handled by caller)
  const pick = good[seed % good.length];
  return rssToContent({ title: pick.t, source: pick.src, date: pick.date }, kind);
}
async function resolveDailyContent(now, slot) {
  let c = pickForSlot(now, slot);
  if (slot === 0) { try { const live = await liveNews(now, dayNumber(now) % 2); if (live) c = live; } catch (e) { /* keep curated fallback */ } }
  return c;
}

// ── extra content: country & college spotlights (stat cards) ──────────────
let _coll = null;
function collegesData() { if (_coll) return _coll; const w = evalWindow("college-data.jsx"); const C = w.LP_COLLEGES || []; const a = Array.isArray(C) ? C : (Object.values(C).find((v) => Array.isArray(v)) || []); _coll = a.filter((c) => c && c.name); return _coll; }
function moneyShort(s) { s = String(s || "").replace(/\(.*?\)/g, "").split(/[;·]/)[0].replace(/,000/g, "k").replace(/\s*\/\s*yr/i, "").replace(/\s+/g, " ").trim(); return s.length > 16 ? s.slice(0, 15).trim().replace(/[–-]$/, "") + "…" : s; }
function pswShort(s) { const m = String(s || "").match(/(\d+)\s*year/i); return m ? "up to " + m[1] + " yrs" : shortVal(s, 12); }
function collegeShort(n) { return String(n || "").replace(/^University of /, "U. of ").replace(/ University$/, ""); }
function pickCountryHighlight(seed) {
  const D = evalWindow("country-data.jsx").LP_COUNTRY_DATA || []; if (!D.length) return null;
  const c = D[(seed * 3) % D.length]; const stats = [];
  if (c.avgTuition) stats.push({ v: moneyShort(c.avgTuition), label: "Tuition / yr" });
  if (c.postStudyWork) stats.push({ v: pswShort(c.postStudyWork), label: "Post-study work" });
  if (c.prTimeline) stats.push({ v: shortVal(c.prTimeline, 10), label: "PR pathway" });
  if (c.visaSuccess) stats.push({ v: "~" + c.visaSuccess + "%", label: "Visa success" });
  stats.push({ v: String((c.intakes || []).length || 2), label: "Intakes / yr" });
  stats.push({ v: "20 h/wk", label: "Work while study" });
  const points = [];
  if (c.avgTuition) points.push("Tuition around " + String(c.avgTuition).replace(/\s*\([^)]*\)/g, "").trim() + (/\/|year|yr|annum/i.test(c.avgTuition) ? "" : " per year"));
  if (c.postStudyWork) points.push("Post-study work visa: " + clip(stripDup(c.postStudyWork), 44));
  if (c.prTimeline) points.push("Clear pathway to PR — " + clip(stripDup(c.prTimeline), 38));
  if (c.visaSuccess) points.push("About " + c.visaSuccess + "% of student visas get approved");
  points.push("Work up to 20 hours a week while you study");
  if ((c.intakes || []).length) points.push((c.intakes.length) + " intakes a year — more chances to apply");
  const slug = c.name.toLowerCase().replace(/\s+/g, "");
  return { type: "exam", accent: "#1D4ED8", category: c.name.toUpperCase(), flagCountry: c.name, headline: c.name, sub: c.tagline || "Study-abroad destination", stats: stats.slice(0, 6), points, cta: "Full country guide — link in bio  →",
    caption: `🌍 Why study in ${c.name}? ${c.flag || ""}\n\n${c.tagline || ""}\n${c.avgTuition ? "💰 Tuition: " + stripDup(c.avgTuition) + "\n" : ""}${c.postStudyWork ? "💼 Post-study work: " + stripDup(c.postStudyWork) + "\n" : ""}${c.prTimeline ? "🛂 PR: " + stripDup(c.prTimeline) + "\n" : ""}\n📲 TAG someone considering ${c.name}.\n📌 SAVE this. 💬 Is ${c.name} on your list? 👇\n\n👉 Full ${c.name} guide — link in bio.\nFollow ${HANDLE} for daily study-abroad guides 🌍`,
    tags: buildTags("study" + slug, "studyin" + slug, "studyabroad", "internationalstudents", "landingprep") };
}
function pickCollegeSpotlight(seed) {
  const C = collegesData(); if (!C.length) return null;
  const c = C[(seed * 5) % C.length]; const stats = [];
  if (c.rank) stats.push({ v: "#" + c.rank, label: "World rank" });
  if (c.feeNote) stats.push({ v: moneyShort(c.feeNote), label: "Tuition / yr" });
  if (c.acceptance) stats.push({ v: c.acceptance + "%", label: "Acceptance" });
  if (c.ielts) stats.push({ v: "IELTS " + c.ielts, label: "Min. IELTS" });
  if (c.gre) stats.push({ v: "GRE " + c.gre, label: "Avg. GRE" });
  if (c.deadline) stats.push({ v: shortVal(c.deadline, 10), label: "Deadline" });
  const _pad = [["Yes", "Intl. friendly"], ["Sept · Jan", "Intakes"], ["Available", "Scholarships"]]; while (stats.length < 6) { const p = _pad[stats.length % _pad.length]; stats.push({ v: p[0], label: p[1] }); }
  const cslug = String(c.country).toLowerCase().replace(/\s+/g, "");
  return { type: "exam", accent: "#7C3AED", category: String(c.country).toUpperCase(), flagCountry: c.country, headline: collegeShort(c.name), sub: (c.city || "") + " · " + c.country, stats: stats.slice(0, 6), cta: "Free college predictor — link in bio  →",
    caption: `🎓 ${c.name} — at a glance\n\n${c.rank ? "🌍 World rank: #" + c.rank + "\n" : ""}${c.feeNote ? "💰 Tuition: " + c.feeNote + "\n" : ""}${c.acceptance ? "✅ Acceptance: " + c.acceptance + "%\n" : ""}${c.ielts ? "📊 IELTS " + c.ielts + " · GRE " + (c.gre || "—") + "\n" : ""}${c.deadline ? "🗓 Deadline: " + c.deadline + "\n" : ""}\n📲 TAG a future applicant. 📌 SAVE this.\n💬 Is this your dream school? 👇\n\n👉 Free college predictor — link in bio.\nFollow ${HANDLE} for daily admits info 🎓`,
    tags: buildTags("studyin" + cslug, "studyabroad", "universityadmission", "topuniversities", "landingprep") };
}
// "Did you know?" — surprising facts about studying in a country (from our own whyStudy data)
function pickCountryFact(seed) {
  const D = evalWindow("country-data.jsx").LP_COUNTRY_DATA || [];
  const pool = D.filter((c) => c && c.name && (c.whyStudy || []).length >= 3);
  if (!pool.length) return null;
  const c = pool[(seed * 7) % pool.length];
  const facts = (c.whyStudy || []).slice(0, 6).map((f) => String(f).trim()).filter(Boolean);
  const slug = c.name.toLowerCase().replace(/\s+/g, "");
  return { type: "exam", accent: "#0EA5E9", category: "DID YOU KNOW? · " + c.name.toUpperCase(), flagCountry: c.name, headline: c.name, sub: "What students don't realise about " + c.name, points: facts,
    caption: `🤯 Did you know? Facts about studying in ${c.name} ${c.flag || ""}\n\n${facts.map((f) => "✅ " + f).join("\n")}\n\n📲 TAG someone who should see this.\n📌 SAVE it. 💬 Surprised? Comment 👇\n\n👉 Full ${c.name} guide → landingprep.com\nFollow ${HANDLE} for daily study-abroad facts 🌍`,
    tags: buildTags("studyin" + slug, "study" + slug, "studyabroad", "didyouknow", "internationalstudents", "landingprep") };
}
// slot 1 now rotates 3 ways for more daily variety: country spotlight / college spotlight / did-you-know facts
function pickCountryOrCollege(seed) { const r = seed % 3; return (r === 0 ? pickCountryHighlight(seed) : r === 1 ? pickCollegeSpotlight(seed) : pickCountryFact(seed)) || pickCountryHighlight(seed) || pickCollegeSpotlight(seed); }
function pickTipOrSpotlight(seed) { const r = seed % 3; return (r === 0 ? pickTip(seed) : r === 1 ? pickCollegeSpotlight(seed + 17) : pickCountryHighlight(seed + 11)) || pickTip(seed) || pickWordOfDay(seed); }
// major study-abroad scholarships (curated, evergreen)
const SCHOLARSHIPS = [
  { n: "Chevening", full: "Chevening Scholarship", country: "UK", award: "Fully funded", level: "Master's", apply: "Nov", who: "future leaders worldwide" },
  { n: "Fulbright", full: "Fulbright Foreign Student Program", country: "USA", award: "Tuition + living", level: "Master's / PhD", apply: "varies", who: "outstanding graduates" },
  { n: "DAAD", full: "DAAD Scholarships", country: "Germany", award: "€934 / month", level: "Master's / PhD", apply: "varies", who: "all academic fields" },
  { n: "Erasmus Mundus", full: "Erasmus Mundus Joint Masters", country: "Europe", award: "Full + €1,400/mo", level: "Master's", apply: "varies", who: "joint-degree students" },
  { n: "Commonwealth", full: "Commonwealth Scholarship", country: "UK", award: "Full + airfare", level: "Master's / PhD", apply: "Oct", who: "Commonwealth citizens" },
  { n: "Australia Awards", full: "Australia Awards Scholarships", country: "Australia", award: "Full tuition + living", level: "Master's", apply: "Apr", who: "developing nations" },
  { n: "Vanier", full: "Vanier Canada Graduate Scholarship", country: "Canada", award: "CAD 50k / yr", level: "PhD", apply: "Nov", who: "top researchers" },
  { n: "Eiffel", full: "Eiffel Excellence Scholarship", country: "France", award: "€1,181 / month", level: "Master's / PhD", apply: "Jan", who: "international students" },
  { n: "Gates Cambridge", full: "Gates Cambridge Scholarship", country: "UK", award: "Fully funded", level: "Master's / PhD", apply: "Dec", who: "outstanding applicants" },
  { n: "Knight-Hennessy", full: "Knight-Hennessy Scholars (Stanford)", country: "USA", award: "Full funding", level: "Any graduate", apply: "Oct", who: "future change-makers" },
  { n: "Holland", full: "Holland Scholarship", country: "Netherlands", award: "€5,000", level: "Bachelor's / Master's", apply: "Feb", who: "non-EEA students" },
  { n: "Rhodes", full: "Rhodes Scholarship", country: "UK", award: "Fully funded", level: "Master's / PhD", apply: "Aug", who: "exceptional all-rounders" },
  { n: "Clarendon", full: "Clarendon Fund (Oxford)", country: "UK", award: "Full + stipend", level: "Master's / PhD", apply: "Jan", who: "academic excellence" },
  { n: "Schwarzman", full: "Schwarzman Scholars (Tsinghua)", country: "China", award: "Fully funded", level: "Master's", apply: "Sep", who: "future global leaders" },
  { n: "MEXT", full: "MEXT (Monbukagakusho)", country: "Japan", award: "Tuition + stipend", level: "All levels", apply: "May", who: "international students" },
  { n: "GKS", full: "Global Korea Scholarship", country: "South Korea", award: "Tuition + living", level: "Bachelor's / Grad", apply: "Feb", who: "international students" },
  { n: "Swiss Excellence", full: "Swiss Government Excellence", country: "Switzerland", award: "CHF 1,920 / mo", level: "PhD / research", apply: "Nov", who: "researchers worldwide" },
  { n: "Orange Tulip", full: "Orange Tulip Scholarship", country: "Netherlands", award: "Partial – full", level: "Bachelor's / Master's", apply: "varies", who: "select countries" },
  { n: "Stipendium", full: "Stipendium Hungaricum", country: "Hungary", award: "Full + stipend", level: "All levels", apply: "Jan", who: "international students" },
  { n: "Türkiye Bursları", full: "Türkiye Scholarships", country: "Turkey", award: "Full + stipend", level: "All levels", apply: "Feb", who: "international students" },
  { n: "NZ Manaaki", full: "Manaaki New Zealand Scholarship", country: "New Zealand", award: "Full + living", level: "Graduate", apply: "varies", who: "developing nations" },
  { n: "Lester Pearson", full: "Lester B. Pearson (Toronto)", country: "Canada", award: "Full tuition + living", level: "Bachelor's", apply: "Nov", who: "exceptional students" },
  { n: "Rotary Peace", full: "Rotary Peace Fellowship", country: "Global", award: "Fully funded", level: "Master's", apply: "May", who: "peace & development" },
  { n: "Marshall", full: "Marshall Scholarship", country: "UK", award: "Fully funded", level: "Master's / PhD", apply: "Sep", who: "US graduates" },
  { n: "DAAD EPOS", full: "DAAD Development-Related (EPOS)", country: "Germany", award: "€934 / mo + travel", level: "Master's / PhD", apply: "varies", who: "developing countries" },
];
function pickScholarship(seed) {
  const s = SCHOLARSHIPS[seed % SCHOLARSHIPS.length];
  const stats = [{ v: clip(s.award, 16), label: "Award" }, { v: s.level, label: "Level" }, { v: s.country, label: "Study in" }, { v: s.apply, label: "Apply by" }, { v: "FREE", label: "Application" }, { v: clip(s.who, 16), label: "Open to" }];
  const slug = s.country.toLowerCase().replace(/\s+/g, "");
  const out = { type: "exam", accent: "#0E9F6E", category: "SCHOLARSHIP", flagCountry: ISO[s.country.toLowerCase()] ? s.country : null, headline: s.n, sub: s.full + " · " + s.country, stats, cta: "Free scholarship guide — link in bio  →",
    caption: `💰 ${s.full} (${s.country})\n\n🎓 Award: ${s.award}\n📚 Level: ${s.level}\n🗓 Apply by: ${s.apply}\n✅ For: ${s.who}\n\n📲 TAG a friend who should apply. 📌 SAVE this.\n💬 Applying this year? Comment 👇\n\n👉 Free scholarships guide — link in bio.\nFollow ${HANDLE} for daily funding alerts 💸`,
    tags: buildTags("scholarships", "studyin" + slug, "studyabroad", "fullyfunded", "landingprep") };
  // on alternate days, present it as the Style-4 urgency/deadline card (when a real apply month exists)
  if (/^[A-Za-z]{3}$/.test(s.apply) && (seed % 2 === 1)) {
    out.style = "urgency";
    out.urgentTag = "SCHOLARSHIP DEADLINE";
    out.date = s.apply.toUpperCase() + " " + YEAR;
    out.urgentLabel = s.full + "  ·  " + s.country;
    out.chips = [s.level, clip(s.award, 20), "Free to apply"];
    out.pct = 56 + (seed % 36);
    out.noteLeft = "Apply by " + s.apply + " " + YEAR;
  }
  return out;
}
function pickExamFees(seed) {
  const FEES = [{ name: "IELTS", fee: "$245" }, { name: "TOEFL", fee: "$195" }, { name: "PTE", fee: "$200" }, { name: "GRE", fee: "$220" }, { name: "GMAT", fee: "$275" }, { name: "Duolingo", fee: "$65" }];
  const stats = FEES.map((e) => ({ v: e.fee, label: e.name }));
  return { type: "exam", accent: "#7C3AED", category: "EXAM FEES · " + YEAR, headline: "What exams cost", sub: "Registration fee per attempt (USD, approx)", stats,
    caption: `💵 What do study-abroad exams cost in ${YEAR}? 👇\n\n${FEES.map((e) => e.name + ": " + e.fee).join("\n")}\n\n📤 SHARE with someone planning their tests.\n📌 SAVE this. 💬 Which test are you taking? 👇\n\nFollow ${HANDLE} for daily exam prep 📚`,
    tags: buildTags("ieltsfees", "toeflfees", "examfees", "greexam", "landingprep") };
}
function pickCostCompared(seed) {
  const D = (evalWindow("country-data.jsx").LP_COUNTRY_DATA || []).filter((c) => c.avgTuition);
  if (D.length < 4) return null;
  const pick = []; for (let i = 0; pick.length < 6 && i < D.length * 2; i++) { const c = D[(seed + i * 5) % D.length]; if (!pick.find((p) => p.name === c.name)) pick.push(c); }
  const stats = pick.map((c) => ({ v: moneyShort(c.avgTuition), label: c.name }));
  return { type: "exam", accent: THEME.edu.accent, category: "COST TO STUDY ABROAD", headline: "What it costs", sub: "Average tuition per year, compared", stats,
    cta: "Full cost breakdown in bio",
    caption: `💸 What does it cost to study abroad? (tuition / year)\n\n${pick.map((c) => `${c.flag || "•"} ${c.name}: ${c.avgTuition}`).join("\n")}\n\n📲 SHARE with someone budgeting their move.\n📌 SAVE this comparison.\n💬 Which fits your budget? Comment 👇\n\n👉 Full cost + scholarships guide — link in bio.\nFollow ${HANDLE} for daily study-abroad money tips 💰`,
    tags: buildTags("studyabroad", "studyabroadcost", "internationalstudents", "studyabroad2026", "landingprep") };
}

// day number since epoch (UTC) → stable per-day seed
function dayNumber(now) { now = now || new Date(); return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000); }
// 8 posts/day: 7 singles + 1 carousel (slot 5). Fresh topics daily via date offset.
const CAROUSEL_SLOT = -1; // dedicated daily-carousel slot disabled at 5/day (still available via ?carousel=1)
function pickNewsRotating(seed) { return (seed % 2 ? pickImmigrationNews(seed) : pickEducationNews(seed)) || pickImmigrationNews(seed) || pickEducationNews(seed); }
// ── NEW content types (deepen the daily pool; all from owned/evergreen data) ──
// "X vs Y" country comparison — high-save format, built from our own country data
function pickComparison(seed) {
  const D = (evalWindow("country-data.jsx").LP_COUNTRY_DATA || []).filter((c) => c && c.name && c.avgTuition);
  if (D.length < 2) return null;
  const a = D[(seed * 3) % D.length]; let b = D[(seed * 7 + 1) % D.length]; if (b.name === a.name) b = D[(seed * 7 + 3) % D.length];
  if (a.name === b.name) return null;
  const pts = [];
  if (a.avgTuition && b.avgTuition) pts.push("Tuition/yr: " + a.name + " " + moneyShort(a.avgTuition) + " · " + b.name + " " + moneyShort(b.avgTuition));
  if (a.postStudyWork && b.postStudyWork) pts.push("Post-study work: " + a.name + " " + shortVal(stripDup(a.postStudyWork), 12) + " · " + b.name + " " + shortVal(stripDup(b.postStudyWork), 12));
  if (a.prTimeline && b.prTimeline) pts.push("PR: " + a.name + " " + shortVal(stripDup(a.prTimeline), 12) + " · " + b.name + " " + shortVal(stripDup(b.prTimeline), 12));
  if (a.visaSuccess && b.visaSuccess) pts.push("Visa approval: " + a.name + " ~" + a.visaSuccess + "% · " + b.name + " ~" + b.visaSuccess + "%");
  if (pts.length < 2) return null;
  const sl = (n) => n.toLowerCase().replace(/\s+/g, "");
  return { type: "exam", accent: "#7C3AED", category: "COUNTRY COMPARISON", headline: a.name + " vs " + b.name, sub: "Which fits you better?", points: pts.slice(0, 5),
    caption: `🆚 ${a.name} vs ${b.name} — which should you pick? ${a.flag || ""}${b.flag || ""}\n\n${pts.map((p) => "• " + p).join("\n")}\n\n💬 Which would you choose? Comment 👇\n📌 SAVE this. 📲 SHARE with someone deciding.\n\n👉 Compare countries free → landingprep.com\nFollow ${HANDLE} for daily study-abroad guides 🌍`,
    tags: buildTags("studyin" + sl(a.name), "studyin" + sl(b.name), "studyabroad", "studyabroadcomparison", "internationalstudents", "landingprep") };
}
const MISTAKE_SETS = [
  { t: "5 study-abroad mistakes", sub: "Save this before you apply", items: ["Applying without checking each university's deadline", "Choosing a course for 'PR' instead of your real career fit", "Leaving proof-of-funds to the last minute", "Sending one generic SOP to every university", "Booking your visa appointment far too late"] },
  { t: "5 student-visa mistakes", sub: "These cause most rejections", items: ["Incomplete or inconsistent financial documents", "A weak SOP with no clear study plan", "Unexplained gaps in your study history", "Applying too close to your intake date", "Not reading the country's specific visa rules"] },
  { t: "5 university-application mistakes", sub: "Don't lose an admit over these", items: ["Shortlisting only 'dream' universities, no safe ones", "Missing or weak letters of recommendation", "Copy-pasting your SOP from the internet", "Ignoring English-test and GPA cut-offs", "Applying after scholarship deadlines close"] },
];
function pickMistakes(seed) {
  const m = MISTAKE_SETS[seed % MISTAKE_SETS.length];
  return { type: "exam", accent: "#EF4444", category: "AVOID THESE", headline: m.t, sub: m.sub, points: m.items,
    caption: `🚫 ${m.t} 👇\n\n${m.items.map((x) => "❌ " + x).join("\n")}\n\n📌 SAVE this so you don't slip up. 📲 SHARE with a friend applying.\n💬 Made any of these? Comment 👇\n\n👉 Free study-abroad tools → landingprep.com\nFollow ${HANDLE} for daily study-abroad tips 🌍`,
    tags: buildTags("studyabroad", "studyabroadtips", "studentvisa", "studyabroadmistakes", "internationalstudents", "landingprep") };
}
const CHECKLISTS = [
  { t: "Student visa checklist", sub: "Tick these off before you apply", items: ["Valid passport (6+ months left)", "University offer / admission letter", "Proof of funds / blocked account", "English test score (IELTS / PTE / TOEFL)", "Statement of purpose", "Tuition / fee payment receipt"] },
  { t: "SOP checklist", sub: "A strong statement of purpose covers", items: ["Why this course & this university", "Your academic & project background", "Relevant work or internship experience", "Clear career goals after graduation", "Why this country fits your plan", "No spelling / grammar errors"] },
  { t: "Pre-departure checklist", sub: "Before you fly abroad", items: ["Visa, passport & admission letter (copies too)", "Tuition paid + initial living funds ready", "Accommodation booked for the first weeks", "Travel + health insurance sorted", "Forex card / international banking set up", "Important docs scanned to the cloud"] },
];
function pickChecklist(seed) {
  const c = CHECKLISTS[seed % CHECKLISTS.length];
  return { type: "exam", accent: "#0EA5E9", category: "SAVE THIS CHECKLIST", headline: c.t, sub: c.sub, points: c.items,
    caption: `✅ ${c.t} 👇\n\n${c.items.map((x) => "☑️ " + x).join("\n")}\n\n📌 SAVE this checklist. 📲 SHARE with someone who needs it.\n💬 Anything you'd add? Comment 👇\n\n👉 Free study-abroad guides → landingprep.com\nFollow ${HANDLE} for daily study-abroad help 🌍`,
    tags: buildTags("studyabroad", "studyabroadchecklist", "studentvisa", "studyabroadtips", "internationalstudents", "landingprep") };
}
// slot 4 now rotates 6 ways for daily variety: cost · exam fees · exam guide · comparison · mistakes · checklist
function pickRotatingExtra(seed) {
  const r = seed % 6;
  const f = r === 0 ? pickCostCompared(seed) : r === 1 ? pickExamFees(seed) : r === 2 ? pickExamSpotlight(seed) : r === 3 ? pickComparison(seed) : r === 4 ? pickMistakes(seed) : pickChecklist(seed);
  return f || pickExamFees(seed) || pickCostCompared(seed) || pickScholarship(seed);
}
// 5 strong posts/day — all deep pools + a rotating 5th (cost / exam-fees / exam-guide cycle).
// per-exam tips (from our own exam-patterns data) — drives users to free practice
function pickExamTip(seed) {
  const E = examPatterns(); const keys = Object.keys(E).filter((k) => (E[k].tips || []).length >= 3);
  if (!keys.length) return null;
  const k = keys[seed % keys.length]; const e = E[k]; const name = k.toUpperCase();
  const tips = (e.tips || []).slice(0, 6).map((t) => String(t).trim()).filter(Boolean);
  return { type: "exam", accent: "#2563EB", category: name + " TIPS", headline: name + " tips", sub: "Boost your score with these", points: tips,
    caption: `🎯 ${name} tips to boost your score 👇\n\n${tips.map((t) => "✅ " + t).join("\n")}\n\n📌 SAVE this. 💬 Taking ${name}? Comment your test date 👇\n\n👉 Free ${name} practice → landingprep.com\nFollow ${HANDLE} for daily exam prep 📚`,
    tags: buildTags(k.toLowerCase(), k.toLowerCase() + "preparation", k.toLowerCase() + "tips", "examprep", "studyabroad", "landingprep") };
}
// "IELTS vs PTE" style exam comparison
function pickExamComparison(seed) {
  const E = examPatterns(); const keys = Object.keys(E);
  if (keys.length < 2) return null;
  const a = keys[seed % keys.length]; let b = keys[(seed * 7 + 1) % keys.length]; if (b === a) b = keys[(seed * 7 + 3) % keys.length];
  if (a === b) return null;
  const ea = E[a], eb = E[b], A = a.toUpperCase(), B = b.toUpperCase(), pts = [];
  if (ea.totalDuration && eb.totalDuration) pts.push("Duration: " + A + " " + shortDur(ea.totalDuration) + " · " + B + " " + shortDur(eb.totalDuration));
  if (ea.scoring && eb.scoring) pts.push("Score: " + A + " " + shortVal(ea.scoring, 12) + " · " + B + " " + shortVal(eb.scoring, 12));
  if ((ea.sections || []).length && (eb.sections || []).length) pts.push("Sections: " + A + " " + ea.sections.length + " · " + B + " " + eb.sections.length);
  pts.push("Both accepted by thousands of universities worldwide");
  if (pts.length < 2) return null;
  return { type: "exam", accent: "#0E9F6E", category: "EXAM COMPARISON", headline: A + " vs " + B, sub: "Which test should you take?", points: pts.slice(0, 5),
    caption: `🆚 ${A} vs ${B} — which should you take? 👇\n\n${pts.map((p) => "• " + p).join("\n")}\n\n💬 Which are you taking? Comment 👇\n📌 SAVE this comparison.\n\n👉 Free practice for both → landingprep.com\nFollow ${HANDLE} for daily exam prep 📚`,
    tags: buildTags(a.toLowerCase(), b.toLowerCase(), "examprep", "testprep", "studyabroad", "landingprep") };
}
// slot 2 now rotates 3 ways: words of the day · exam tips · exam comparison
function pickExamPrep(seed) { const r = seed % 3; return (r === 0 ? pickWordOfDay(seed) : r === 1 ? pickExamTip(seed) : pickExamComparison(seed)) || pickWordOfDay(seed) || pickExamSpotlight(seed); }
const SLOT_PICKERS = [pickNewsRotating, pickCountryOrCollege, pickExamPrep, pickScholarship, pickRotatingExtra];
function pickForSlot(now, slot) {
  slot = ((Number(slot) || 0) % SLOTS + SLOTS) % SLOTS;
  if (slot === CAROUSEL_SLOT) return null;
  const seed = dayNumber(now) * 7 + slot * 131;   // *7 is coprime to common pool sizes (6,26,…) so EVERY item is reachable
  const chain = [SLOT_PICKERS[slot], pickWordOfDay, pickScholarship, pickImmigrationNews];
  for (const fn of chain) { const r = fn && fn(seed); if (r) return r; }
  return null;
}
function slotFromHour(now) { const h = (now || new Date()).getUTCHours(); return Math.min(SLOTS - 1, Math.max(0, Math.floor(((h + 22) % 24) / 2.4))); }

// ── image rendering (1080x1080, bold news-page style) ────────────────────
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function stripEmoji(s) {
  return String(s == null ? "" : s)
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, "")              // emoji + enclosed-alphanumeric supplement (squared letters)
    .replace(/[\u{2460}-\u{24FF}]/gu, "")                // circled/enclosed alphanumerics
    .replace(/[\u{2600}-\u{27BF}]/gu, "").replace(/[\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/[\u{2190}-\u{21FF}]/gu, "").replace(/[\u{FE00}-\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
}
function hexA(hex, a) { const m = hex.replace("#", ""); return `rgba(${parseInt(m.slice(0, 2), 16)},${parseInt(m.slice(2, 4), 16)},${parseInt(m.slice(4, 6), 16)},${a})`; }
function wrapPlain(text, max) {
  const words = stripEmoji(text).split(/\s+/).filter(Boolean); const out = []; let line = "";
  for (const w of words) { if ((line + " " + w).trim().length > max && line) { out.push(line.trim()); line = w; } else line = (line + " " + w).trim(); }
  if (line) out.push(line.trim()); return out;
}
function tspans(lines, x, y0, lh) { return lines.map((l, i) => `<tspan x="${x}" y="${y0 + i * lh}">${esc(l)}</tspan>`).join(""); }
// rich (highlighted-keyword) wrapped headline
function wrapRich(text, highlights, max) {
  const hi = new Set((highlights || []).map((h) => String(h).toLowerCase()));
  const isNum = (w) => /^[\$€£₹]?\d[\d,.%+–\-]*\+?$/.test(w) || /^(19|20)\d\d$/.test(w);
  const words = stripEmoji(text).split(/\s+/).filter(Boolean).map((w) => { const bare = w.toLowerCase().replace(/[^a-z0-9%$€£₹]/g, ""); return { t: w, hi: (bare && hi.has(bare)) || isNum(w) }; });
  const lines = []; let cur = [], len = 0;
  for (const w of words) { if (len + w.t.length + 1 > max && cur.length) { lines.push(cur); cur = []; len = 0; } cur.push(w); len += w.t.length + 1; }
  if (cur.length) lines.push(cur); return lines;
}
function richLines(text, highlights, x, yTop, size, maxChars, accent, baseFill, maxLines) {
  baseFill = baseFill || "#14181F";
  let lines = wrapRich(text, highlights, maxChars); if (maxLines) lines = lines.slice(0, maxLines);
  const lh = size * 1.12; let y = yTop + size, svg = "";
  for (const ln of lines) {
    const spans = ln.map((w) => `<tspan${w.hi ? ` fill="${accent}" font-weight="900"` : ""}>${esc(w.t)} </tspan>`).join("");
    svg += `<text x="${x}" y="${y}" xml:space="preserve" font-family="${FONT}" font-size="${size}" font-weight="800" fill="${baseFill}" letter-spacing="-1.2">${spans}</text>`;
    y += lh;
  }
  return { svg, endY: y };
}
// simple line-art icons for the dark "news bulletin" callout row
function icon(name, cx, cy, s, col) {
  const st = `fill="none" stroke="${col}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`;
  if (name === "doc") return `<rect x="${cx - s * 0.5}" y="${cy - s * 0.68}" width="${s}" height="${s * 1.36}" rx="5" ${st}/><line x1="${cx - s * 0.25}" y1="${cy - s * 0.28}" x2="${cx + s * 0.25}" y2="${cy - s * 0.28}" ${st}/><line x1="${cx - s * 0.25}" y1="${cy + s * 0.02}" x2="${cx + s * 0.25}" y2="${cy + s * 0.02}" ${st}/><line x1="${cx - s * 0.25}" y1="${cy + s * 0.32}" x2="${cx + s * 0.08}" y2="${cy + s * 0.32}" ${st}/>`;
  if (name === "check") return `<polyline points="${cx - s * 0.5},${cy} ${cx - s * 0.12},${cy + s * 0.4} ${cx + s * 0.55},${cy - s * 0.42}" ${st}/>`;
  if (name === "globe") return `<circle cx="${cx}" cy="${cy}" r="${s * 0.7}" ${st}/><ellipse cx="${cx}" cy="${cy}" rx="${s * 0.3}" ry="${s * 0.7}" ${st}/><line x1="${cx - s * 0.7}" y1="${cy}" x2="${cx + s * 0.7}" y2="${cy}" ${st}/>`;
  if (name === "calendar") return `<rect x="${cx - s * 0.6}" y="${cy - s * 0.5}" width="${s * 1.2}" height="${s}" rx="5" ${st}/><line x1="${cx - s * 0.6}" y1="${cy - s * 0.18}" x2="${cx + s * 0.6}" y2="${cy - s * 0.18}" ${st}/><line x1="${cx - s * 0.28}" y1="${cy - s * 0.68}" x2="${cx - s * 0.28}" y2="${cy - s * 0.4}" ${st}/><line x1="${cx + s * 0.28}" y1="${cy - s * 0.68}" x2="${cx + s * 0.28}" y2="${cy - s * 0.4}" ${st}/>`;
  if (name === "up") return `<polyline points="${cx - s * 0.6},${cy + s * 0.4} ${cx - s * 0.15},${cy - s * 0.08} ${cx + s * 0.12},${cy + s * 0.2} ${cx + s * 0.6},${cy - s * 0.45}" ${st}/><polyline points="${cx + s * 0.28},${cy - s * 0.45} ${cx + s * 0.6},${cy - s * 0.45} ${cx + s * 0.6},${cy - s * 0.13}" ${st}/>`;
  if (name === "cap") return `<polygon points="${cx},${cy - s * 0.55} ${cx + s * 0.78},${cy - s * 0.16} ${cx},${cy + s * 0.22} ${cx - s * 0.78},${cy - s * 0.16}" ${st}/><path d="M ${cx - s * 0.42} ${cy - s * 0.02} L ${cx - s * 0.42} ${cy + s * 0.36} Q ${cx} ${cy + s * 0.62} ${cx + s * 0.42} ${cy + s * 0.36} L ${cx + s * 0.42} ${cy - s * 0.02}" ${st}/>`;
  return "";
}
function calloutRow(items, y, ring, label) {
  const xs = [256, 540, 824]; let s = "";
  items.slice(0, 3).forEach((it, i) => { const cx = xs[i];
    s += `<circle cx="${cx}" cy="${y}" r="48" fill="rgba(255,255,255,0.04)" stroke="${ring}" stroke-width="2.5"/>`;
    s += icon(it.glyph, cx, y, 38, ring);
    s += `<text x="${cx}" y="${y + 92}" text-anchor="middle" font-family="${FONT}" font-size="21" font-weight="800" fill="${label}" letter-spacing="1">${esc(it.label.toUpperCase())}</text>`;
  });
  return s;
}
function pillSolid(x, y, text, fill) { const t = stripEmoji(text), w = 36 + t.length * 15.6; return `<rect x="${x}" y="${y}" rx="11" width="${w}" height="48" fill="${fill}"/><text x="${x + 18}" y="${y + 32}" font-family="${FONT}" font-size="22" font-weight="900" letter-spacing="1.2" fill="#fff">${esc(t.toUpperCase())}</text>`; }
// ── brand logo mark (paper plane + grad cap) ──────────────────────────────
let _lpid = 0;
function markRaw(plane, cap, tassel) {
  return `<path d="M330 345 L765 230 L624 635 L540 475 L424 595 L475 430 Z" fill="${plane}"/>` +
    `<path d="M475 430 L765 230 L540 475 Z" fill="#FFFFFF" opacity="0.30"/>` +
    `<g transform="translate(428 250) rotate(-9)"><path d="M0 65 L112 20 L224 65 L112 110 Z" fill="${cap}"/>` +
    `<path d="M55 95 C85 120 140 120 170 95 L170 146 C130 171 95 171 55 146 Z" fill="${cap}"/>` +
    `<path d="M224 65 L224 132" stroke="${tassel}" stroke-width="11" stroke-linecap="round"/><circle cx="224" cy="148" r="16" fill="${tassel}"/></g>`;
}
const LOGOW = (h) => 435 * (h / 405);
function logoMark(x, yTop, h, mode) {
  const s = h / 405, tx = x - 330 * s, ty = yTop - 230 * s;
  if (mode === "white") return `<g transform="translate(${tx} ${ty}) scale(${s})">${markRaw("#fff", "#fff", "#34D399")}</g>`;
  const id = "lpg" + (++_lpid);
  return `<defs><linearGradient id="${id}" x1="330" y1="230" x2="765" y2="635" gradientUnits="userSpaceOnUse"><stop stop-color="#2563EB"/><stop offset="1" stop-color="#10B981"/></linearGradient></defs><g transform="translate(${tx} ${ty}) scale(${s})">${markRaw("url(#" + id + ")", "#101828", "#10B981")}</g>`;
}
function wordmark(x, y, size, lightText) { const a = lightText ? "#fff" : "#101828", b = lightText ? "#fff" : "#2563EB"; return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="900" letter-spacing="-0.5"><tspan fill="${a}">Landing</tspan><tspan fill="${b}">Prep</tspan></text>`; }
function header(c) {
  return logoMark(56, 46, 44, "white") + wordmark(56 + LOGOW(44) + 12, 86, 28, true) +
    `<text x="1016" y="82" text-anchor="end" font-family="${MONO}" font-size="16" fill="${C_MUTE}">ATLAS OF DEPARTURE</text>` +
    `<text x="64" y="176" font-family="${MONO}" font-size="21" font-weight="700" letter-spacing="2" fill="${C_GOLD}">${esc(stripEmoji(c.category))}</text>`;
}
function footer(c) {
  const red = c.accent || "#E0492B";
  return `<rect x="0" y="1004" width="1080" height="76" fill="${red}"/>` +
    `<text x="64" y="1052" font-family="${FONT}" font-size="29" font-weight="900" fill="#ffffff">${SITE}</text>` +
    `<text x="1016" y="1052" text-anchor="end" font-family="${FONT}" font-size="24" font-weight="700" fill="rgba(255,255,255,0.92)">${esc(stripEmoji(c.cta || "free · link in bio"))}</text>`;
}
// shared cartographic dark frame for quiz / exam / word cards
function doc(c, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#0A1330"/><stop offset="0.55" stop-color="#0B1124"/><stop offset="1" stop-color="#070A18"/></linearGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C_GOLD}" stop-opacity="0.20"/><stop offset="1" stop-color="${C_GOLD}" stop-opacity="0"/></radialGradient></defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <circle cx="980" cy="150" r="300" fill="url(#glow)"/>
  ${cartoRings(980, 150)}
  ${header(c)}${body}${footer(c)}
</svg>`;
}
function renderHook(c) {
  const big = (c.headline || "").length;
  const size = big > 95 ? 56 : big > 60 ? 66 : 80;
  const maxChars = Math.round(1020 / (size * 0.50));
  const h = richLines(c.headline, c.highlight, 64, 232, size, maxChars, c.accent);
  let s = h.svg, y = h.endY + 24;
  if (c.sub) { const sl = wrapPlain(c.sub, 52).slice(0, 3); s += `<text font-family="${FONT}" font-size="30" font-weight="500" fill="#475569">${tspans(sl, 64, y + 10, 42)}</text>`; }
  return doc(c, s);
}
// centered brand wordmark with flanking rule lines (toronto.culture style)
function centerLogo(cy) {
  const cx = 540, h = 46, lw = LOGOW(h), gap = 14, tw = 252, total = lw + gap + tw, left = cx - total / 2;
  const rg = 26, len = 80;
  return `<line x1="${left - rg - len}" y1="${cy}" x2="${left - rg}" y2="${cy}" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>` +
    `<line x1="${left + total + rg}" y1="${cy}" x2="${left + total + rg + len}" y2="${cy}" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>` +
    logoMark(left, cy - h / 2, h, "white") +
    `<text x="${left + lw + gap}" y="${cy + 11}" font-family="${FONT}" font-size="32" font-weight="900" letter-spacing="0.3" fill="#ffffff">LandingPrep</text>`;
}
// content layer for the "news" cards — incnews style: logo + NEW tag + flag + bold multicolor headline + loud bar
function bulletinInner(c) {
  const red = c.accent || "#E0492B", gold = "#FFD400";
  let s = logoMark(56, 48, 46, "white") + wordmark(56 + LOGOW(46) + 14, 88, 28, true);
  const ntag = ("NEW" + (c.dateStr ? "  ·  " + c.dateStr : "")).toUpperCase();
  s += `<rect x="56" y="110" rx="9" width="${42 + ntag.length * 13.5}" height="46" fill="${red}"/><text x="74" y="141" font-family="${FONT}" font-size="23" font-weight="900" letter-spacing="1.4" fill="#fff">${esc(ntag)}</text>`;
  if (c.flagCountry) s += `<rect x="620" y="116" rx="18" width="424" height="292" fill="#ffffff"/><rect x="620" y="116" rx="18" width="424" height="292" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="2"/>`;
  const big = (c.headline || "").length;
  const size = big > 96 ? 56 : big > 56 ? 66 : 80;
  const maxChars = Math.round(1000 / (size * 0.57));
  const lines = wrapRich(c.headline, [c.flagCountry || ""], maxChars).slice(0, 4);
  const lh = size * 1.05, lastB = 980, firstB = lastB - (lines.length - 1) * lh;
  lines.forEach((ln, i) => { const spans = ln.map((w) => `<tspan${w.hi ? ` fill="${gold}"` : ""}>${esc(w.t)} </tspan>`).join("");
    s += `<text x="56" y="${firstB + i * lh}" xml:space="preserve" font-family="${FONT}" font-size="${size}" font-weight="900" fill="#ffffff" letter-spacing="-1.5">${spans}</text>`; });
  const kickY = firstB - size - 20, kick = stripEmoji(c.category);
  s += `<rect x="56" y="${kickY - 32}" rx="8" width="${52 + kick.length * 15.5}" height="42" fill="${gold}"/><text x="78" y="${kickY - 3}" font-family="${FONT}" font-size="22" font-weight="900" letter-spacing="1" fill="#101828">${esc(kick)}</text>`;
  s += `<rect x="0" y="1004" width="1080" height="76" fill="${red}"/><text x="540" y="1054" text-anchor="middle" font-family="${FONT}" font-size="31" font-weight="900" fill="#fff">Visit ${SITE} for the full story</text>`;
  return s;
}
function darkBaseSvg(c) {
  const red = c.accent || "#E0492B";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs><linearGradient id="bgd" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#1A2444"/><stop offset="0.55" stop-color="#0E1730"/><stop offset="1" stop-color="#06090F"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#bgd)"/><circle cx="840" cy="300" r="320" fill="${red}" opacity="0.14"/></svg>`;
}
// flat dark card (used by buildSvg path / previews without photo compositing)
function renderBulletin(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs><linearGradient id="bgd2" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#1A2444"/><stop offset="1" stop-color="#06090F"/></linearGradient><linearGradient id="sc2" x1="0" y1="0" x2="0" y2="1"><stop offset="0.4" stop-color="#05070D" stop-opacity="0"/><stop offset="0.8" stop-color="#05070D" stop-opacity="0.72"/><stop offset="1" stop-color="#05070D" stop-opacity="0.97"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#bgd2)"/><rect width="1080" height="1080" fill="url(#sc2)"/>${bulletinInner(c)}</svg>`;
}
// rich DESIGNED background (no random stock photos) — brand gradient + accent wash + dark headline zone
function brandBgSvg(c) {
  const a = c.accent || "#E0492B";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><linearGradient id="bb" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#1C2C54"/><stop offset="0.5" stop-color="#101B36"/><stop offset="1" stop-color="#070B16"/></linearGradient>
  <linearGradient id="aw" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0.45" stop-color="${a}" stop-opacity="0"/><stop offset="1" stop-color="${a}" stop-opacity="0.4"/></linearGradient></defs>
  <rect width="1080" height="1080" fill="url(#bb)"/><rect width="1080" height="1080" fill="url(#aw)"/>
  <path d="M0 980 L1080 560 L1080 1080 L0 1080 Z" fill="rgba(0,0,0,0.28)"/>
  <circle cx="140" cy="180" r="200" fill="rgba(255,255,255,0.03)"/><circle cx="980" cy="900" r="240" fill="${hexA(a, 0.08)}"/></svg>`;
}
function bulletinOverlaySvg(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><linearGradient id="sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0.3" stop-color="#05070D" stop-opacity="0.15"/><stop offset="0.62" stop-color="#05070D" stop-opacity="0.5"/><stop offset="1" stop-color="#05070D" stop-opacity="0.92"/></linearGradient></defs>
  <rect width="1080" height="1080" fill="url(#sc)"/>
  ${bulletinInner(c)}
</svg>`;
}
function renderQuiz(c) {
  const qLines = wrapRich(c.question, c.highlight, 28).slice(0, 3); const qY = 252, qSize = 50, lh = 58;
  let head = "", y = qY + qSize;
  for (const ln of qLines) { head += `<text x="64" y="${y}" xml:space="preserve" font-family="${FONT}" font-size="${qSize}" font-weight="800" fill="${C_CREAM}" letter-spacing="-0.8">${ln.map((w) => `<tspan${w.hi ? ` fill="${C_GOLD}" font-weight="900"` : ""}>${esc(w.t)} </tspan>`).join("")}</text>`; y += lh; }
  y += 30; const opts = (c.options || []).slice(0, 4); const boxH = 100;
  for (const o of opts) {
    const tl = wrapPlain(o.text, 38).slice(0, 2); const ok = !!o.correct; const tab = ok ? C_GREEN : C_GOLD;
    head += `<rect x="64" y="${y}" width="952" height="${boxH}" rx="18" fill="${hexA(ok ? C_GREEN : "#ffffff", ok ? 0.12 : 0.05)}" stroke="${hexA(tab, ok ? 0.7 : 0.32)}" stroke-width="${ok ? 2.5 : 1.5}"/>`;
    head += `<rect x="64" y="${y}" width="92" height="${boxH}" rx="18" fill="${tab}"/><rect x="128" y="${y}" width="28" height="${boxH}" fill="${tab}"/>`;
    head += `<text x="110" y="${y + boxH / 2 + 11}" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="900" fill="#0A1330">${o.L}</text>`;
    head += `<text font-family="${FONT}" font-size="27" font-weight="500" fill="${ok ? "#fff" : "#DCE2EE"}">${tspans(tl, 188, y + (boxH - (tl.length - 1) * 34) / 2 + 10, 34)}</text>`;
    if (ok) head += `<polyline points="958,${y + boxH / 2} 972,${y + boxH / 2 + 14} 998,${y + boxH / 2 - 16}" fill="none" stroke="${C_GREEN}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    y += boxH + 16;
  }
  head += `<text x="64" y="${Math.min(y + 32, 968)}" font-family="${MONO}" font-size="24" font-weight="700" fill="${C_GREEN}">ANSWER: ${esc(c.answerLetter || "")}  ·  did you get it right?</text>`;
  return doc(c, head);
}
function renderExam(c) {
  const hl = String(c.headline || ""); const size = hl.length > 24 ? 60 : hl.length > 13 ? 88 : hl.length > 7 ? 124 : 156;
  const wl = wrapPlain(hl, Math.max(7, Math.round(990 / (size * 0.58)))).slice(0, 2);
  let s = "", y = 300;
  wl.forEach((ln, i) => { s += `<text x="64" y="${y + i * size}" font-family="${FONT}" font-size="${size}" font-weight="900" fill="${C_CREAM}" letter-spacing="-3">${esc(ln)}</text>`; });
  y = 300 + wl.length * size - Math.round(size * 0.22);
  s += `<text x="68" y="${y + 12}" font-family="${FONT}" font-size="28" font-weight="700" fill="${C_GOLD}">${esc(stripEmoji(c.sub || ""))}</text>`;
  const st = (c.stats || []).slice(0, 4); const bw = 452, bh = 146, gx = 64, gap = 24, gy = y + 72;
  st.forEach((box, i) => { const x = gx + (i % 2) * (bw + gap), by = gy + Math.floor(i / 2) * (bh + gap);
    s += `<rect x="${x}" y="${by}" width="${bw}" height="${bh}" rx="20" fill="${hexA("#ffffff", 0.045)}" stroke="${hexA(C_GOLD, 0.28)}" stroke-width="1.5"/>`;
    s += `<text x="${x + 30}" y="${by + 82}" font-family="${FONT}" font-size="44" font-weight="900" fill="${C_GOLD}">${esc(stripEmoji(box.v))}</text>`;
    s += `<text x="${x + 30}" y="${by + 120}" font-family="${MONO}" font-size="21" font-weight="700" fill="${C_MUTE}" letter-spacing="1">${esc(box.label.toUpperCase())}</text>`;
  });
  return doc(c, s);
}
function renderVocab(c) {
  const wl = wrapPlain(c.word, 15).slice(0, 2); const ws = wl.length > 1 ? 84 : 116; let y = 258;
  let s = `<text font-family="${FONT}" font-size="${ws}" font-weight="900" fill="${C_CREAM}" letter-spacing="-2">${tspans(wl, 64, y + ws * 0.74, ws)}</text>`;
  y += wl.length * ws + 4;
  if (c.pos) { s += `<text x="66" y="${y}" font-family="${FONT}" font-size="32" font-weight="700" font-style="italic" fill="${C_GOLD}">${esc(c.pos)}</text>`; y += 56; }
  const dl = wrapPlain(c.def, 38).slice(0, 4); const dh = dl.length * 48 + 48;
  s += `<rect x="64" y="${y}" width="952" height="${dh}" rx="20" fill="${hexA(C_GOLD, 0.08)}" stroke="${hexA(C_GOLD, 0.22)}" stroke-width="1.5"/><text font-family="${FONT}" font-size="34" font-weight="500" fill="#DCE2EE">${tspans(dl, 100, y + 60, 48)}</text>`;
  y += dh + 36;
  if (c.ex) { const el = wrapPlain("“" + c.ex + "”", 46).slice(0, 3); s += `<text font-family="${FONT}" font-size="29" font-weight="500" font-style="italic" fill="${C_MUTE}">${tspans(el, 64, y + 30, 42)}</text>`; y += el.length * 42 + 34; }
  if (c.syn && y < 900) { const sy = ("SIMILAR: " + c.syn).toUpperCase(); s += `<rect x="64" y="${y}" rx="10" width="${48 + sy.length * 13}" height="46" fill="${hexA(C_GOLD, 0.16)}"/><text x="86" y="${y + 31}" font-family="${MONO}" font-size="19" font-weight="700" fill="${C_GOLD}" letter-spacing="1">${esc(sy)}</text>`; }
  return doc(c, s);
}
// ══ BRIGHT illustrated design system (futuresabroad style) ════════════════
const BR_NAVY = "#0F2150", BR_YELLOW = "#FACC15", BR_INK = "#1E293B", BR_CARD = "#F4F7FF", BR_SUB = "#64748B";
function lighten(hex, amt) { const m = hex.replace("#", ""); const c = (i) => parseInt(m.slice(i, i + 2), 16); const L = (x) => Math.round(x + (255 - x) * amt); return `rgb(${L(c(0))},${L(c(2))},${L(c(4))})`; }
function brIcon(cx, cy, r, glyph) {
  const s = r * 0.92, st = `fill="none" stroke="#fff" stroke-width="${(r * 0.13).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"`;
  if (glyph === "globe") return `<circle cx="${cx}" cy="${cy}" r="${s * 0.62}" ${st}/><ellipse cx="${cx}" cy="${cy}" rx="${s * 0.26}" ry="${s * 0.62}" ${st}/><line x1="${cx - s * 0.62}" y1="${cy}" x2="${cx + s * 0.62}" y2="${cy}" ${st}/>`;
  if (glyph === "briefcase") return `<rect x="${cx - s * 0.55}" y="${cy - s * 0.26}" width="${s * 1.1}" height="${s * 0.76}" rx="${s * 0.12}" ${st}/><path d="M${cx - s * 0.22} ${cy - s * 0.26} v${-s * 0.18} h${s * 0.44} v${s * 0.18}" ${st}/><line x1="${cx - s * 0.55}" y1="${cy + s * 0.06}" x2="${cx + s * 0.55}" y2="${cy + s * 0.06}" ${st}/>`;
  if (glyph === "cap") return `<path d="M${cx} ${cy - s * 0.44} L${cx + s * 0.72} ${cy - s * 0.08} L${cx} ${cy + s * 0.28} L${cx - s * 0.72} ${cy - s * 0.08} Z" ${st}/><path d="M${cx - s * 0.4} ${cy + s * 0.04} v${s * 0.3} q${s * 0.4} ${s * 0.24} ${s * 0.8} 0 v${-s * 0.3}" ${st}/>`;
  if (glyph === "money") return `<circle cx="${cx}" cy="${cy}" r="${s * 0.6}" ${st}/><line x1="${cx}" y1="${cy - s * 0.34}" x2="${cx}" y2="${cy + s * 0.34}" ${st}/><path d="M${cx + s * 0.2} ${cy - s * 0.18} q${-s * 0.45} ${-s * 0.18} ${-s * 0.45} ${s * 0.18} q0 ${s * 0.3} ${s * 0.45} ${s * 0.18}" ${st}/>`;
  if (glyph === "passport") return `<rect x="${cx - s * 0.46}" y="${cy - s * 0.6}" width="${s * 0.92}" height="${s * 1.2}" rx="${s * 0.1}" ${st}/><circle cx="${cx}" cy="${cy - s * 0.14}" r="${s * 0.2}" ${st}/><line x1="${cx - s * 0.2}" y1="${cy + s * 0.28}" x2="${cx + s * 0.2}" y2="${cy + s * 0.28}" ${st}/>`;
  if (glyph === "plane") return `<path d="M${cx - s * 0.58} ${cy + s * 0.12} L${cx + s * 0.6} ${cy - s * 0.46} L${cx + s * 0.16} ${cy + s * 0.56} L${cx - s * 0.02} ${cy + s * 0.14} Z" ${st}/>`;
  if (glyph === "star") return `<path d="M${cx} ${cy - s * 0.58} L${cx + s * 0.17} ${cy - s * 0.1} L${cx + s * 0.55} ${cy - s * 0.06} L${cx + s * 0.24} ${cy + s * 0.2} L${cx + s * 0.34} ${cy + s * 0.56} L${cx} ${cy + s * 0.34} L${cx - s * 0.34} ${cy + s * 0.56} L${cx - s * 0.24} ${cy + s * 0.2} L${cx - s * 0.55} ${cy - s * 0.06} L${cx - s * 0.17} ${cy - s * 0.1} Z" ${st}/>`;
  if (glyph === "calendar") return `<rect x="${cx - s * 0.55}" y="${cy - s * 0.45}" width="${s * 1.1}" height="${s * 0.95}" rx="${s * 0.1}" ${st}/><line x1="${cx - s * 0.55}" y1="${cy - s * 0.16}" x2="${cx + s * 0.55}" y2="${cy - s * 0.16}" ${st}/><line x1="${cx - s * 0.25}" y1="${cy - s * 0.6}" x2="${cx - s * 0.25}" y2="${cy - s * 0.32}" ${st}/><line x1="${cx + s * 0.25}" y1="${cy - s * 0.6}" x2="${cx + s * 0.25}" y2="${cy - s * 0.32}" ${st}/>`;
  if (glyph === "check") return `<circle cx="${cx}" cy="${cy}" r="${s * 0.6}" ${st}/><path d="M${cx - s * 0.28} ${cy} l${s * 0.18} ${s * 0.2} ${s * 0.4} -${s * 0.4}" ${st}/>`;
  if (glyph === "book") return `<path d="M${cx} ${cy - s * 0.46} q${-s * 0.5} ${-s * 0.2} ${-s * 0.58} ${s * 0.04} v${s * 0.82} q${s * 0.08} ${-s * 0.2} ${s * 0.58} 0 q${s * 0.5} ${-s * 0.2} ${s * 0.58} 0 v${-s * 0.82} q${-s * 0.08} ${-s * 0.24} ${-s * 0.58} ${-s * 0.04} z" ${st}/><line x1="${cx}" y1="${cy - s * 0.42}" x2="${cx}" y2="${cy + s * 0.38}" ${st}/>`;
  return `<circle cx="${cx}" cy="${cy}" r="${s * 0.5}" ${st}/>`;
}
function brDots(x, y, col) { let s = ""; for (let i = 0; i < 9; i++) s += `<circle cx="${x + (i % 3) * 26}" cy="${y + Math.floor(i / 3) * 26}" r="5" fill="${col}"/>`; return s; }
function brBg(accent) {
  return `<defs><linearGradient id="brg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="${lighten(accent, 0.28)}"/></linearGradient></defs>
  <rect width="1080" height="1080" fill="url(#brg)"/>${brDots(64, 64, "rgba(255,255,255,0.5)")}${brDots(940, 930, "rgba(255,255,255,0.4)")}
  <circle cx="1010" cy="120" r="14" fill="${BR_YELLOW}"/><circle cx="80" cy="985" r="16" fill="rgba(255,255,255,0.22)"/>`;
}
function brLogoBar() { return `<rect x="250" y="50" width="580" height="92" rx="26" fill="#fff"/>${logoMark(330, 66, 60, "color")}<text x="408" y="110" font-family="${FONT}" font-size="42" font-weight="900" letter-spacing="-1"><tspan fill="${BR_NAVY}">Landing</tspan><tspan fill="#2563EB">Prep</tspan></text>`; }
function brCta(text, accent) { return `<rect x="90" y="918" width="900" height="94" rx="47" fill="${BR_YELLOW}"/><text x="540" y="978" text-anchor="middle" font-family="${FONT}" font-size="36" font-weight="900" letter-spacing="0.5" fill="${BR_NAVY}">${esc(stripEmoji(text))}</text>`; }
// Clean footer — no "link in bio" CTA. Just the handle + site, centered.
function brFooter() { return `<text x="986" y="1042" text-anchor="end" font-family="${FONT}" font-size="26" font-weight="800" letter-spacing="0.5" fill="rgba(255,255,255,0.9)">landingprep.com</text>`; }
function brPill(x, y, text, accent, flagGap) { const t = stripEmoji(text), w = (flagGap ? 78 : 28) + t.length * 16.5 + 28; return `<rect x="${x}" y="${y}" width="${w}" height="58" rx="29" fill="${hexA(accent, 0.14)}"/>${flagGap ? `<rect x="${x + 16}" y="${y + 13}" width="48" height="32" rx="5" fill="#fff" stroke="#e2e8f0"/>` : ""}<text x="${x + (flagGap ? 78 : 26)}" y="${y + 40}" font-family="${FONT}" font-size="27" font-weight="900" letter-spacing="1" fill="${accent}">${esc(t)}</text>`; }
function brFrame(accent, inner, cta) { return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${brBg(accent)}${inner}${brFooter()}</svg>`; }
// stat/spotlight (country, college, exam, scholarship, cost)
function renderBrightStat(c) {
  const a = c.accent || "#2563EB"; let s = `<rect x="90" y="178" width="900" height="700" rx="40" fill="#fff"/>`;
  s += brPill(130, 214, c.category, a, !!c.flagCountry);
  const longH = (c.headline || "").length > 13;
  s += `<text x="130" y="352" font-family="${FONT}" font-size="${longH ? 60 : 86}" font-weight="900" fill="${BR_NAVY}" letter-spacing="-2">${esc(wrapPlain(c.headline, longH ? 20 : 13).slice(0, 1)[0] || c.headline)}</text>`;
  if (c.sub) s += `<text x="132" y="404" font-family="${FONT}" font-size="26" font-weight="700" fill="${a}">${esc(wrapPlain(c.sub, 54).slice(0, 1)[0] || "")}</text>`;
  const st = (c.stats || []).slice(0, 6), cols = 2, bw = 396, gap = 28, gx = 130, gy = 450, bottom = 858;
  const rows = Math.max(1, Math.ceil(st.length / cols)), bh = Math.floor((bottom - gy - (rows - 1) * 20) / rows);
  st.forEach((box, i) => { const x = gx + (i % cols) * (bw + gap), by = gy + Math.floor(i / cols) * (bh + 20);
    s += `<rect x="${x}" y="${by}" width="${bw}" height="${bh}" rx="22" fill="${hexA(a, 0.11)}"/>`;
    s += `<rect x="${x}" y="${by + 16}" width="9" height="${bh - 32}" rx="5" fill="${a}"/>`;
    s += `<text x="${x + 38}" y="${by + Math.round(bh / 2) + 4}" font-family="${FONT}" font-size="${bh > 150 ? 42 : 35}" font-weight="900" fill="${a}">${esc(stripEmoji(String(box.v)))}</text>`;
    s += `<text x="${x + 38}" y="${by + bh - 26}" font-family="${FONT}" font-size="21" font-weight="800" fill="${BR_INK}" letter-spacing="0.5">${esc(String(box.label).toUpperCase())}</text>`;
  });
  return brFrame(a, s);
}
function renderBrightQuiz(c) {
  const a = c.accent || "#7C3AED"; let s = `<rect x="90" y="178" width="900" height="700" rx="40" fill="#fff"/>`;
  s += brPill(130, 214, c.category, a, false);
  const ql = wrapRich(c.question, c.highlight, 30).slice(0, 3); let y = 326;
  ql.forEach((ln) => { s += `<text x="130" y="${y}" xml:space="preserve" font-family="${FONT}" font-size="44" font-weight="900" fill="${BR_NAVY}" letter-spacing="-1">${ln.map((w) => `<tspan${w.hi ? ` fill="${a}"` : ""}>${esc(w.t)} </tspan>`).join("")}</text>`; y += 54; });
  y += 16; const opts = (c.options || []).slice(0, 4); const oh = 88;
  opts.forEach((o) => { const ok = !!o.correct; const tab = ok ? "#10B981" : a; const tl = wrapPlain(o.text, 40).slice(0, 1);
    s += `<rect x="130" y="${y}" width="820" height="${oh}" rx="18" fill="${ok ? "#ECFDF5" : BR_CARD}" stroke="${ok ? "#10B981" : "transparent"}" stroke-width="2.5"/>`;
    s += `<rect x="130" y="${y}" width="74" height="${oh}" rx="18" fill="${tab}"/><rect x="170" y="${y}" width="22" height="${oh}" fill="${tab}"/>`;
    s += `<text x="167" y="${y + oh / 2 + 11}" text-anchor="middle" font-family="${FONT}" font-size="32" font-weight="900" fill="#fff">${o.L}</text>`;
    s += `<text x="224" y="${y + oh / 2 + 10}" font-family="${FONT}" font-size="27" font-weight="600" fill="${BR_INK}">${esc(tl[0] || "")}</text>`;
    if (ok) s += `<path d="M888,${y + oh / 2} l14,14 26,-30" fill="none" stroke="#10B981" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    y += oh + 14;
  });
  return brFrame(a, s, "Answer: " + (c.answerLetter || "") + "  ·  did you get it right?");
}
function renderBrightVocab(c) {
  const a = c.accent || "#2563EB"; let s = `<rect x="90" y="178" width="900" height="700" rx="40" fill="#fff"/>`;
  s += brPill(130, 214, c.category || "WORDS OF THE DAY", a, false);
  const words = (c.words && c.words.length ? c.words : [{ w: c.word || "", pos: c.pos || "", def: c.def || "" }]).slice(0, 4);
  const n = words.length, top = 318, bh = Math.floor((852 - top) / n);
  words.forEach((wd, i) => { const by = top + i * bh;
    s += `<text x="130" y="${by + 44}" font-family="${FONT}" font-size="46" font-weight="900" fill="${BR_NAVY}" letter-spacing="-1">${esc(wd.w)}<tspan font-size="26" font-weight="700" font-style="italic" fill="${a}">  ${esc(wd.pos || "")}</tspan></text>`;
    const dl = wrapPlain(wd.def, 54).slice(0, 1);
    s += `<text x="130" y="${by + 84}" font-family="${FONT}" font-size="27" font-weight="500" fill="${BR_SUB}">${esc(dl[0] || "")}</text>`;
    if (i < n - 1) s += `<line x1="130" y1="${by + bh - 14}" x2="950" y2="${by + bh - 14}" stroke="#EEF2F7" stroke-width="2"/>`;
  });
  return brFrame(a, s);
}
function renderBrightNews(c) {
  const a = c.accent || "#1D4ED8"; let s = `<rect x="90" y="178" width="900" height="700" rx="40" fill="#fff"/>`;
  s += brPill(130, 214, c.category, a, !!c.flagCountry);
  s += `<rect x="${c.flagCountry ? 130 + (78 + stripEmoji(c.category).length * 16.5 + 28) + 16 : 760}" y="218" width="120" height="50" rx="25" fill="#EF4444"/><text x="${(c.flagCountry ? 130 + (78 + stripEmoji(c.category).length * 16.5 + 28) + 16 : 760) + 60}" y="252" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="900" letter-spacing="1" fill="#fff">NEW</text>`;
  const hl = wrapPlain(stripEmoji(c.headline), 24).slice(0, 5); const hs = hl.length > 4 ? 56 : hl.length > 2 ? 66 : 76;
  let y = 360; hl.forEach((ln, i) => { s += `<text x="130" y="${y + i * (hs + 6)}" font-family="${FONT}" font-size="${hs}" font-weight="900" fill="${BR_NAVY}" letter-spacing="-1.5">${esc(ln)}</text>`; });
  return brFrame(a, s, "Read the full story — link in bio  →");
}
function buildSvg(c) {
  return c.type === "quiz" ? renderBrightQuiz(c) : c.type === "vocab" ? renderBrightVocab(c) : c.type === "exam" ? renderBrightStat(c) : c.type === "bulletin" ? renderBrightNews(c) : renderBrightStat(c);
}
async function renderPng(svg) { if (!sharp) throw new Error("sharp not installed — run: npm install sharp"); return await sharp(Buffer.from(svg)).png().toBuffer(); }
// ── photo backdrops: text/data composited over a real photo (premium look) ──
const PHOTO_DIR = path.join(ROOT, "assets/post-photos");
function _slug(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function photoFor(c) {
  if (!fs.existsSync(PHOTO_DIR)) return null;
  const cat = String(c.category || "");
  const topic = c.type === "bulletin" ? "news" : /SCHOLAR/i.test(cat) ? "scholarship" : /COST/i.test(cat) ? "cost" : "study";
  const keys = [];
  if (c.flagCountry) keys.push(_slug(c.flagCountry));
  if (c.headline) keys.push(_slug(c.headline));
  keys.push(topic, "default");
  for (const k of keys) for (const e of [".jpg", ".jpeg", ".png", ".webp"]) { const p = path.join(PHOTO_DIR, k + e); if (fs.existsSync(p)) return p; }
  return null;
}
function _pbox(x, y, v, l) {
  return `<rect x="${x}" y="${y}" width="430" height="120" rx="20" fill="#ffffff" fill-opacity="0.13"/><text x="${x + 28}" y="${y + 58}" font-family="${FONT}" font-size="40" font-weight="900" fill="#fff">${esc(stripEmoji(String(v)))}</text><text x="${x + 28}" y="${y + 94}" font-family="${FONT}" font-size="21" font-weight="800" fill="#dbe4ff" letter-spacing="1">${esc(String(l).toUpperCase())}</text>`;
}
function photoOverlaySvg(c) {
  const a = c.accent || "#2563EB", cat = stripEmoji(c.category || ""), flagGap = !!c.flagCountry;
  const pw = (flagGap ? 92 : 32) + cat.length * 16.5 + 32;
  let s = `<svg width="1080" height="1080" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="po" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0f28" stop-opacity="0.36"/><stop offset="0.4" stop-color="#0a0f28" stop-opacity="0.12"/><stop offset="1" stop-color="#0a0f28" stop-opacity="0.97"/></linearGradient></defs>`;
  s += `<rect width="1080" height="1080" fill="url(#po)"/>`;
  s += `<rect x="60" y="64" width="${Math.round(pw)}" height="62" rx="31" fill="${a}"/>`;
  s += `<text x="${flagGap ? 150 : 92}" y="105" font-family="${FONT}" font-size="29" font-weight="900" fill="#fff" letter-spacing="2">${esc(cat)}</text>`;
  if (c.type === "vocab" && c.words && c.words.length) {
    s += `<text x="60" y="430" font-family="${FONT}" font-size="60" font-weight="900" fill="#fff">${esc(c.headline || "Words of the Day")}</text>`;
    const ws = c.words.slice(0, 4), top = 500, bh = Math.floor((986 - top) / ws.length);
    ws.forEach((w, i) => { const by = top + i * bh;
      s += `<text x="62" y="${by + 44}" font-family="${FONT}" font-size="44" font-weight="900" fill="#fff">${esc(w.w)}<tspan font-size="25" font-style="italic" fill="#cfe0ff">  ${esc(w.pos || "")}</tspan></text>`;
      s += `<text x="62" y="${by + 82}" font-family="${FONT}" font-size="26" font-weight="500" fill="#dbe4ff">${esc(wrapPlain(w.def, 56).slice(0, 1)[0] || "")}</text>`;
    });
  } else if (c.stats && c.stats.length) {
    const longH = (c.headline || "").length > 13;
    if (c.sub) s += `<text x="60" y="602" font-family="${FONT}" font-size="46" font-weight="800" fill="#cfe0ff">${esc(stripEmoji(c.sub)).slice(0, 42)}</text>`;
    s += `<text x="56" y="704" font-family="${FONT}" font-size="${longH ? 80 : 116}" font-weight="900" fill="#fff" letter-spacing="-3">${esc(wrapPlain(c.headline, longH ? 16 : 11).slice(0, 1)[0] || c.headline)}</text>`;
    c.stats.slice(0, 4).forEach((b, i) => { s += _pbox(64 + (i % 2) * 522, 754 + Math.floor(i / 2) * 134, b.v, b.label); });
  } else {
    const hl = wrapPlain(stripEmoji(c.headline || ""), 22).slice(0, 4), hs = hl.length > 3 ? 64 : 76, y0 = 980 - (hl.length - 1) * (hs + 6);
    hl.forEach((ln, i) => { s += `<text x="58" y="${y0 + i * (hs + 6)}" font-family="${FONT}" font-size="${hs}" font-weight="900" fill="#fff" letter-spacing="-1">${esc(ln)}</text>`; });
  }
  s += `<text x="1018" y="1040" text-anchor="end" font-family="${FONT}" font-size="26" font-weight="800" fill="#ffffff" fill-opacity="0.92">landingprep.com</text></svg>`;
  return s;
}
// ══ VIRAL TEMPLATE SYSTEM — rendered with REAL fonts via resvg (Anton + Poppins) ══
// This is the quality fix: librsvg (used by sharp) silently falls back to a plain
// system font, which made the old cards look dull. resvg loads the bundled TTFs, so
// the bold "immigration-news" look (heavy Anton headline + Poppins data) renders for real.
let Resvg = null;
try { Resvg = require("@resvg/resvg-js").Resvg; } catch (e) { /* installed at deploy on Render */ }
const FONTS_DIR = path.join(ROOT, "assets/fonts");
const FONT_FILES = ["Anton-Regular.ttf", "Poppins-ExtraBold.ttf", "Poppins-Bold.ttf", "Poppins-SemiBold.ttf", "Poppins-Regular.ttf"]
  .map((f) => path.join(FONTS_DIR, f)).filter((f) => { try { return fs.existsSync(f); } catch (e) { return false; } });
const HEAD = "Anton", BODY = "Poppins";
function resvgPng(svg, width) {
  if (!Resvg) throw new Error("@resvg/resvg-js not installed");
  return new Resvg(svg, { fitTo: { mode: "width", value: width || 1080 }, font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: BODY } }).render().asPng();
}
// only use a real photo when one is named for THIS country (keeps generic posts on clean solid cards)
function countryPhoto(c) {
  if (!c || !c.flagCountry) return null;
  try { if (!fs.existsSync(PHOTO_DIR)) return null; } catch (e) { return null; }
  const k = _slug(c.flagCountry);
  for (const e of [".jpg", ".jpeg", ".png", ".webp"]) { const p = path.join(PHOTO_DIR, k + e); try { if (fs.existsSync(p)) return p; } catch (e2) {} }
  return null;
}
async function safeFlag(country, w, h) {
  if (!sharp) return null;
  try { const fb = await fetchFlag(country); if (!fb) return null; return await sharp(fb).resize(w || 104, h || 68, { fit: "cover" }).png().toBuffer(); } catch (e) { return null; }
}
// wrapped ALL-CAPS headline lines (Anton) with optional yellow keyword highlight
function capLines(lines, x, firstBaseline, size, lh, hiSet, baseFill, hiFill) {
  return lines.map((ln, i) => {
    const spans = ln.split(/\s+/).filter(Boolean).map((w) => {
      const bare = w.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      return `<tspan${hiSet.has(bare) ? ` fill="${hiFill}"` : ""}>${esc(w)} </tspan>`;
    }).join("");
    return `<text x="${x}" y="${firstBaseline + i * lh}" xml:space="preserve" font-family="${HEAD}" font-size="${size}" fill="${baseFill}" letter-spacing="0.4">${spans}</text>`;
  }).join("");
}
// designed "photo-style" backdrop — a dusk skyline imitated with vector shapes + lit windows
// (gives news/scholarship posts a premium photographic feel with NO real photos)
function sceneBg(accent) {
  let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#13203f"/><stop offset="0.5" stop-color="#0c1228"/><stop offset="1" stop-color="#070a16"/></linearGradient>`;
  s += `<radialGradient id="sun" cx="76%" cy="20%" r="46%"><stop offset="0" stop-color="${hexA(accent, 0.5)}"/><stop offset="1" stop-color="${hexA(accent, 0)}"/></radialGradient>`;
  s += `<linearGradient id="vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070d" stop-opacity="0.1"/><stop offset="0.5" stop-color="#05070d" stop-opacity="0.46"/><stop offset="1" stop-color="#05070d" stop-opacity="0.96"/></linearGradient></defs>`;
  s += `<rect width="1080" height="1080" fill="url(#sky)"/><circle cx="838" cy="232" r="380" fill="url(#sun)"/>`;
  const H = [300, 470, 360, 540, 410, 320, 500, 380, 560, 330, 450, 360, 420], baseY = 1082; let x = -30, i = 0;
  while (x < 1110) { const h = H[i % H.length], w = 78 + (h % 70), by = baseY - h;
    s += `<rect x="${x}" y="${by}" width="${w}" height="${h}" fill="#0a1226" opacity="0.5"/>`;
    for (let wy = by + 26; wy < baseY - 30; wy += 36) for (let wx = x + 12; wx < x + w - 12; wx += 26) if (((wx * 5 + wy * 3 + i * 7) % 4) === 0) s += `<rect x="${wx}" y="${wy}" width="7" height="11" fill="${hexA(accent, 0.45)}"/>`;
    x += w + 7; i++;
  }
  return s + `<rect width="1080" height="1080" fill="url(#vg)"/>`;
}
// blue/yellow education-consultancy card (futuresabroad style) — country / college spotlight
function viralCountry(c) {
  const BLUE = "#1657E0", DK = "#0B265F", Y = "#FFC83A", INK = "#11203f";
  const cat = clip(stripEmoji(c.category || "STUDY ABROAD"), 22).toUpperCase();
  const head = stripEmoji(c.headline || ""), stats = (c.stats || []).slice(0, 4);
  const iconFor = (l) => { l = l.toLowerCase(); return /tuition|cost|fee|\$/.test(l) ? "money" : /work|job|opt/.test(l) ? "briefcase" : /pr|visa|permit|green/.test(l) ? "passport" : /intake|deadline|date/.test(l) ? "calendar" : /rank|accept|ielts|gre|score/.test(l) ? "star" : /study|hour/.test(l) ? "cap" : "globe"; };
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">`;
  s += `<defs><linearGradient id="bl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BLUE}"/><stop offset="1" stop-color="${DK}"/></linearGradient></defs>`;
  s += `<rect width="1080" height="1080" fill="url(#bl)"/>${brDots(72, 70, "rgba(255,255,255,0.32)")}`;
  s += `<rect x="60" y="150" width="960" height="744" rx="40" fill="#fff"/>`;
  s += `<text x="100" y="224" font-family="${BODY}" font-weight="800" font-size="33" fill="${INK}">Landing<tspan fill="${BLUE}">Prep</tspan></text>`;
  const pw = 30 + cat.length * 14.5;
  s += `<rect x="${Math.round(980 - pw)}" y="192" rx="23" width="${Math.round(pw)}" height="46" fill="${BLUE}"/><text x="${Math.round(980 - pw / 2)}" y="222" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="21" fill="#fff" letter-spacing="1">${esc(cat)}</text>`;
  const hsize = head.length > 14 ? 66 : 94, hl = wrapPlain(head, head.length > 14 ? 17 : 12).slice(0, 2); let hy = 322;
  hl.forEach((ln, i) => { s += `<text x="100" y="${hy + i * (hsize + 2)}" font-family="${HEAD}" font-size="${hsize}" fill="${INK}">${esc(ln.toUpperCase())}</text>`; });
  let cy = hy + hl.length * (hsize + 2) - hsize + 4;
  if (c.sub) { s += `<text x="102" y="${cy + 30}" font-family="${BODY}" font-weight="600" font-size="27" fill="${BLUE}">${esc(clip(stripEmoji(c.sub), 50))}</text>`; cy += 50; }
  const gy = Math.max(cy + 22, 452), gx = 100, gap = 22, bw = (880 - gap) / 2, bh = Math.min(152, Math.floor((858 - gy - gap) / 2));
  stats.forEach((b, i) => { const x = gx + (i % 2) * (bw + gap), by = gy + Math.floor(i / 2) * (bh + gap);
    s += `<rect x="${x}" y="${by}" width="${Math.round(bw)}" height="${bh}" rx="20" fill="#F1F5FF"/>`;
    s += `<circle cx="${x + 44}" cy="${by + 46}" r="26" fill="${BLUE}"/>${brIcon(x + 44, by + 46, 26, iconFor(String(b.label)))}`;
    s += `<text x="${x + 84}" y="${by + 56}" font-family="${BODY}" font-weight="800" font-size="30" fill="${INK}">${esc(stripEmoji(String(b.v)).slice(0, 14))}</text>`;
    s += `<text x="${x + 24}" y="${by + bh - 24}" font-family="${BODY}" font-weight="700" font-size="20" fill="${BLUE}" letter-spacing="0.5">${esc(String(b.label).toUpperCase())}</text>`;
  });
  s += `<rect x="60" y="916" width="960" height="96" rx="22" fill="${Y}"/><text x="540" y="976" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="37" fill="${INK}" letter-spacing="0.5">SAVE THIS  &#183;  landingprep.com</text>`;
  s += `<text x="540" y="1058" text-anchor="middle" font-family="${BODY}" font-weight="700" font-size="25" fill="rgba(255,255,255,0.85)">Follow for daily study-abroad guides</text>`;
  return s + `</svg>`;
}
// 1 — bold black/yellow "urgent news" over a designed dusk-city scene (no real photo)
function viralNews(c) {
  const Y = "#FFD400", R = "#E0162B";
  let cat = stripEmoji(c.category || "UPDATE"); if (cat.length > 26) cat = cat.split(" · ")[0]; cat = clip(cat, 28).toUpperCase();
  const head = stripEmoji(c.headline || "").toUpperCase();
  const len = head.length, size = len > 95 ? 70 : len > 60 ? 88 : len > 34 ? 110 : 134;
  const maxc = Math.max(8, Math.round(950 / (size * 0.50)));
  const lines = wrapPlain(head, maxc).slice(0, 5), lh = size * 1.0;
  const firstBase = 728 - (lines.length - 1) * lh;
  const hiSet = new Set(String(c.flagCountry || "").toUpperCase().split(/\s+/).filter(Boolean));
  const chips = (c.icons || []).map((i) => i.label).filter(Boolean).slice(0, 3);
  const pw = 44 + cat.length * 17;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">`;
  s += sceneBg("#2b6cff");
  s += `<rect x="72" y="74" rx="10" width="${Math.round(pw)}" height="60" fill="${R}"/><text x="${72 + pw / 2}" y="114" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="30" fill="#fff" letter-spacing="1.5">${esc(cat)}</text>`;
  s += capLines(lines, 72, firstBase, size, lh, hiSet, "#fff", Y);
  if (chips.length) { let cx = 72; const cy = 794; chips.forEach((t) => { const tt = stripEmoji(t), w = 44 + tt.length * 16.5; s += `<rect x="${cx}" y="${cy}" rx="12" width="${Math.round(w)}" height="78" fill="rgba(255,255,255,0.09)"/><rect x="${cx}" y="${cy}" rx="6" width="9" height="78" fill="${Y}"/><text x="${cx + 30}" y="${cy + 50}" font-family="${BODY}" font-weight="700" font-size="29" fill="#fff">${esc(tt)}</text>`; cx += w + 20; }); }
  s += `<rect x="0" y="912" width="1080" height="104" fill="${Y}"/><text x="540" y="978" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="42" fill="#0a0a0a" letter-spacing="0.5">FULL STORY IN THE CAPTION  &#8595;</text>`;
  s += `<text x="540" y="1060" text-anchor="middle" font-family="${BODY}" font-weight="700" font-size="28" fill="#9a9a9a">landingprep.com</text>`;
  return s + `</svg>`;
}
// 2 — premium indigo stat card (country / scholarship / cost / exam fees / exam guide)
function viralStat(c, scene, accentOverride) {
  const a = accentOverride || c.accent || "#2563EB";
  let cat = stripEmoji(c.category || ""); if (cat.length > 30) cat = cat.split(" · ")[0]; cat = clip(cat, 30).toUpperCase();
  const head = stripEmoji(c.headline || "").toUpperCase();
  const stats = (c.stats || []).slice(0, 6), pw = 36 + cat.length * 15.5;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">`;
  if (scene) s += sceneBg(a);
  else { s += `<defs><linearGradient id="sg" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#1b2452"/><stop offset="0.55" stop-color="#111634"/><stop offset="1" stop-color="#0a0d1f"/></linearGradient></defs>`;
    s += `<rect width="1080" height="1080" fill="url(#sg)"/><circle cx="980" cy="120" r="240" fill="${hexA(a, 0.18)}"/><circle cx="120" cy="1000" r="180" fill="${hexA(a, 0.10)}"/>`; }
  s += `<rect x="72" y="78" rx="31" width="${Math.round(pw)}" height="62" fill="${a}"/><text x="${72 + pw / 2}" y="119" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="27" fill="#fff" letter-spacing="1.5">${esc(cat)}</text>`;
  const hsize = head.length > 16 ? 76 : head.length > 9 ? 104 : 120;
  const hl = wrapPlain(head, head.length > 16 ? 18 : 12).slice(0, 2); let hy = 250;
  hl.forEach((ln, i) => { s += `<text x="70" y="${hy + i * (hsize + 2)}" font-family="${HEAD}" font-size="${hsize}" fill="#fff" letter-spacing="0.5">${esc(ln)}</text>`; });
  let cursor = hy + hl.length * (hsize + 2) - hsize + 6;
  if (c.sub) { s += `<text x="74" y="${cursor + 34}" font-family="${BODY}" font-weight="600" font-size="29" fill="${lighten(a, 0.5)}">${esc(clip(stripEmoji(c.sub), 54))}</text>`; cursor += 56; }
  const gy = Math.max(cursor + 28, 358), gx = 72, gap = 26, cols = 2, bw = (1080 - gx * 2 - gap) / 2;
  const rows = Math.max(1, Math.ceil(stats.length / cols)), bh = Math.floor((992 - gy - (rows - 1) * gap) / rows);
  stats.forEach((b, i) => { const x = gx + (i % cols) * (bw + gap), by = gy + Math.floor(i / cols) * (bh + gap);
    const v = stripEmoji(String(b.v)), vsize = v.length > 11 ? 30 : v.length > 8 ? 35 : 41;
    s += `<rect x="${x}" y="${by}" width="${Math.round(bw)}" height="${bh}" rx="20" fill="rgba(255,255,255,0.07)"/><rect x="${x}" y="${by + 14}" width="8" height="${bh - 28}" rx="4" fill="${a}"/>`;
    s += `<text x="${x + 34}" y="${by + Math.round(bh / 2) + 6}" font-family="${BODY}" font-weight="800" font-size="${vsize}" fill="#fff">${esc(v)}</text>`;
    s += `<text x="${x + 34}" y="${by + bh - 26}" font-family="${BODY}" font-weight="700" font-size="19" fill="${lighten(a, 0.55)}" letter-spacing="0.5">${esc(String(b.label).toUpperCase())}</text>`;
  });
  s += `<text x="540" y="1052" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="28" fill="rgba(255,255,255,0.88)">landingprep.com</text>`;
  return s + `</svg>`;
}
// 3 — clean cream vocabulary card (TNC-explainer style)
function viralVocab(c) {
  const a = c.accent || "#2563EB", NAVY = "#15203f";
  const words = (c.words && c.words.length ? c.words : [{ w: c.word || "", pos: c.pos || "", def: c.def || "" }]).slice(0, 4);
  const n = words.length, cat = (c.category || "WORDS OF THE DAY").toUpperCase(), pw = 30 + cat.length * 14.5;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="#F3ECE4"/>`;
  s += `<text x="72" y="116" font-family="${BODY}" font-weight="800" font-size="36" fill="${NAVY}" letter-spacing="1.5">LANDINGPREP</text>`;
  s += `<rect x="${Math.round(1008 - pw)}" y="80" rx="26" width="${Math.round(pw)}" height="52" fill="${a}"/><text x="${Math.round(1008 - pw / 2)}" y="114" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="23" fill="#fff" letter-spacing="1">${esc(cat)}</text>`;
  s += `<line x1="72" y1="150" x2="1008" y2="150" stroke="#dcd2c6" stroke-width="2"/>`;
  s += `<text x="70" y="250" font-family="${HEAD}" font-size="76" fill="${NAVY}">${n} WORDS TO KNOW</text>`;
  const top = 300, bottom = 980, rh = Math.floor((bottom - top) / n);
  words.forEach((w, i) => { const by = top + i * rh;
    s += `<text x="72" y="${by + 60}" font-family="${BODY}" font-weight="800" font-size="56" fill="${NAVY}">${esc(cap(w.w))}<tspan font-family="${BODY}" font-weight="600" font-size="27" font-style="italic" fill="${a}">   ${esc(w.pos || "")}</tspan></text>`;
    s += `<text x="72" y="${by + 104}" font-family="${BODY}" font-weight="400" font-size="30" fill="#4a4a4a">${esc(wrapPlain(w.def, 62).slice(0, 1)[0] || "")}</text>`;
    if (i < n - 1) s += `<line x1="72" y1="${by + rh - 8}" x2="1008" y2="${by + rh - 8}" stroke="#e3d9cd" stroke-width="2"/>`;
  });
  s += `<rect x="0" y="1000" width="1080" height="80" fill="${NAVY}"/><text x="72" y="1050" font-family="${BODY}" font-weight="700" font-size="30" fill="#fff">Save these for your IELTS / GRE prep</text><text x="1008" y="1050" text-anchor="end" font-family="${BODY}" font-weight="700" font-size="26" fill="#aab0c8">landingprep.com</text>`;
  return s + `</svg>`;
}
// Style 4 — urgency / deadline card (solid dark charcoal + red, big date + progress bar)
function viralUrgency(c) {
  const R = "#DC2626", CH = "#0B0F19", MUT = "#94a3b8";
  const tag = String(c.urgentTag || "DEADLINE ALERT").toUpperCase();
  const label = clip(stripEmoji(c.urgentLabel || c.sub || ""), 48).toUpperCase();
  const kicker = String(c.kicker || "APPLICATIONS CLOSE").toUpperCase();
  const date = String(c.date || c.headline || "").toUpperCase();
  const pct = Math.max(20, Math.min(94, Math.round(c.pct || 70)));
  const chips = (c.chips || []).map((t) => stripEmoji(String(t))).filter(Boolean).slice(0, 3);
  const noteLeft = c.noteLeft || ("Application window " + pct + "% elapsed");
  const noteRight = pct >= 78 ? "CLOSING SOON" : "APPLY EARLY";
  const sub = c.subLine || "Free to apply — don't miss it.";
  const dsize = date.length > 10 ? 116 : date.length > 7 ? 186 : 208;
  const barX = 90, barW = 900, barY = 656, fillW = Math.round(barW * pct / 100);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">`;
  s += `<defs><radialGradient id="rg" cx="50%" cy="10%" r="58%"><stop offset="0" stop-color="${R}" stop-opacity="0.3"/><stop offset="1" stop-color="${R}" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="1080" height="1080" fill="${CH}"/><rect width="1080" height="1080" fill="url(#rg)"/><rect width="1080" height="12" fill="${R}"/>`;
  const pillW = Math.round(132 + tag.length * 16.5), px = (1080 - pillW) / 2;
  s += `<rect x="${px}" y="124" rx="30" width="${pillW}" height="60" fill="${R}"/>`;
  s += `<path d="M${px + 48} 140 L${px + 67} 172 L${px + 29} 172 Z" fill="none" stroke="#fff" stroke-width="3.6" stroke-linejoin="round"/><line x1="${px + 48}" y1="150" x2="${px + 48}" y2="160" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/><circle cx="${px + 48}" cy="166" r="2" fill="#fff"/>`;
  s += `<text x="${px + pillW / 2 + 22}" y="163" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="29" fill="#fff" letter-spacing="2">${esc(tag)}</text>`;
  if (label) s += `<text x="540" y="272" text-anchor="middle" font-family="${BODY}" font-weight="700" font-size="32" fill="${MUT}" letter-spacing="1">${esc(label)}</text>`;
  s += `<text x="540" y="372" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="42" fill="#fff" letter-spacing="6">${esc(kicker)}</text>`;
  s += `<text x="540" y="566" text-anchor="middle" font-family="${HEAD}" font-size="${dsize}" fill="#fff" letter-spacing="2">${esc(date)}</text>`;
  s += `<rect x="${barX}" y="${barY}" width="${barW}" height="26" rx="13" fill="#1f2937"/><rect x="${barX}" y="${barY}" width="${fillW}" height="26" rx="13" fill="${R}"/>`;
  s += `<text x="${barX}" y="${barY + 64}" font-family="${BODY}" font-weight="700" font-size="26" fill="${MUT}">${esc(noteLeft)}</text>`;
  s += `<text x="${barX + barW}" y="${barY + 64}" text-anchor="end" font-family="${BODY}" font-weight="800" font-size="26" fill="${R}">${esc(noteRight)}</text>`;
  if (chips.length) { const cw = chips.map((t) => 44 + t.length * 15.5), total = cw.reduce((a, b) => a + b, 0) + (chips.length - 1) * 20; let cx = (1080 - total) / 2; const cy = 768;
    chips.forEach((t, i) => { s += `<rect x="${Math.round(cx)}" y="${cy}" rx="14" width="${Math.round(cw[i])}" height="70" fill="#161c2b" stroke="#27314a" stroke-width="1.5"/><text x="${Math.round(cx + cw[i] / 2)}" y="${cy + 45}" text-anchor="middle" font-family="${BODY}" font-weight="700" font-size="26" fill="#e5e7eb">${esc(t)}</text>`; cx += cw[i] + 20; }); }
  s += `<text x="540" y="916" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="40" fill="#fff">${esc(sub)}</text>`;
  s += `<rect x="0" y="1004" width="1080" height="76" fill="${R}"/><text x="540" y="1052" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="28" fill="#fff">landingprep.com</text>`;
  return s + `</svg>`;
}
// ══ AI photographic backgrounds (Imagen via Gemini key), cached on disk ══
// Generates a real premium background ONCE per key (country/topic), caches it, then reuses
// it forever — so cost is a one-time ~₹3/key, not per-post. Crisp text is overlaid by resvg.
const AIBG_DIR = path.join(ROOT, "assets/ai-bg");
const IMG_MODEL = process.env.IMAGE_MODEL || "imagen-4.0-generate-001";
const AIBG_ON = process.env.AIBG !== "0";
function aibgKey(c) {
  if (c.flagCountry && ISO[String(c.flagCountry).toLowerCase()]) return "country-" + _slug(c.flagCountry);
  const cat = String(c.category || "");
  if (c.type === "bulletin") return "news";
  if (/SCHOLARSHIP/i.test(cat)) return "scholarship";
  if (/COST/i.test(cat)) return "cost";
  if (/EXAM/i.test(cat)) return "exam";
  return "study";
}
function aibgPrompt(c, key) {
  const base = " Premium cinematic editorial photograph, golden-hour dusk, dramatic atmospheric moody lighting, deep navy-blue and warm amber tones, soft bokeh, shallow depth of field, high-end magazine quality, slightly darker toward the bottom for text. No text, no words, no logos, no watermarks, no visible faces. Ultra realistic, square 1:1.";
  if (key.indexOf("country-") === 0) return "A stunning view of " + (LANDMARK[c.flagCountry] || (c.flagCountry + " famous city skyline")) + " — iconic landmark and modern skyline." + base;
  const M = { news: "A modern government building beside a city skyline, immigration and visa news theme.", scholarship: "An elegant historic university campus and grand library facade at dusk, scholarship theme.", cost: "A clean flat-lay desk with a small globe, stacked coins and travel documents, study-budget theme.", exam: "A calm tidy study desk with open books, a laptop and notes beside a bright window.", study: "A beautiful modern university campus with students walking in the distance, warm light." };
  return (M[key] || M.study) + base;
}
async function imagenGen(prompt) {
  if (!IMG_KEY) return null;
  try {
    const r = await fetchT(`https://generativelanguage.googleapis.com/v1beta/models/${IMG_MODEL}:predict?key=${encodeURIComponent(IMG_KEY)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: "1:1" } }) }, 60000);
    if (!r.ok) return null;
    const j = await r.json(), p = j && j.predictions && j.predictions[0];
    const b64 = p && (p.bytesBase64Encoded || (p.image && p.image.imageBytes));
    return b64 ? Buffer.from(b64, "base64") : null;
  } catch (e) { return null; }
}
async function aiBackground(c) {
  if (!AIBG_ON || !sharp) return null;
  const key = aibgKey(c);
  try { fs.mkdirSync(AIBG_DIR, { recursive: true }); } catch (e) {}
  for (const e of [".jpg", ".png", ".webp"]) { const p = path.join(AIBG_DIR, key + e); if (fs.existsSync(p)) return p; }   // cache hit — no key needed (works on Render from the committed library)
  if (!IMG_KEY) return null;                                                                                              // a key is only needed to GENERATE a new background
  const buf = await imagenGen(aibgPrompt(c, key)); if (!buf) return null;
  const p = path.join(AIBG_DIR, key + ".jpg");
  try { const out = await sharp(buf).resize(1080, 1080, { fit: "cover", kernel: "lanczos3" }).jpeg({ quality: 88 }).toBuffer(); fs.writeFileSync(p, out); return p; } catch (e) { return null; }
}
// transparent text/data overlay (real fonts) composited OVER an AI photo background
function viralOverlay(c) {
  const news = c.type === "bulletin", a = news ? "#E0162B" : (c.accent || "#2563EB"), Y = "#FFD400";
  let cat = stripEmoji(c.category || (news ? "UPDATE" : "")); if (cat.length > 28) cat = cat.split(" · ")[0]; cat = clip(cat, 28).toUpperCase();
  const pw = 44 + cat.length * 16.5;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">`;
  s += `<defs><linearGradient id="ov" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070d" stop-opacity="0.22"/><stop offset="0.42" stop-color="#05070d" stop-opacity="0.44"/><stop offset="1" stop-color="#05070d" stop-opacity="0.95"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#ov)"/>`;
  s += `<rect x="72" y="74" rx="${news ? 10 : 31}" width="${Math.round(pw)}" height="60" fill="${a}"/><text x="${72 + pw / 2}" y="114" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="29" fill="#fff" letter-spacing="1.5">${esc(cat)}</text>`;
  if (news) {
    const head = stripEmoji(c.headline || "").toUpperCase(), len = head.length, size = len > 95 ? 70 : len > 60 ? 88 : len > 34 ? 110 : 134;
    const lines = wrapPlain(head, Math.max(8, Math.round(950 / (size * 0.50)))).slice(0, 5), lh = size, firstBase = 720 - (lines.length - 1) * lh;
    const hiSet = new Set(String(c.flagCountry || "").toUpperCase().split(/\s+/).filter(Boolean));
    s += capLines(lines, 72, firstBase, size, lh, hiSet, "#fff", Y);
    const chips = (c.icons || []).map((i) => i.label).filter(Boolean).slice(0, 3);
    if (chips.length) { let cx = 72; const cy = 792; chips.forEach((t) => { const tt = stripEmoji(t), w = 44 + tt.length * 16.5; s += `<rect x="${cx}" y="${cy}" rx="12" width="${Math.round(w)}" height="74" fill="rgba(255,255,255,0.13)"/><rect x="${cx}" y="${cy}" rx="6" width="9" height="74" fill="${Y}"/><text x="${cx + 30}" y="${cy + 48}" font-family="${BODY}" font-weight="700" font-size="28" fill="#fff">${esc(tt)}</text>`; cx += w + 18; }); }
    s += `<rect x="0" y="912" width="1080" height="104" fill="${Y}"/><text x="540" y="978" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="42" fill="#0a0a0a" letter-spacing="0.5">FULL STORY IN THE CAPTION  &#8595;</text>`;
  } else {
    const head = stripEmoji(c.headline || "").toUpperCase(), hsize = head.length > 16 ? 76 : head.length > 9 ? 104 : 120;
    const hl = wrapPlain(head, head.length > 16 ? 18 : 12).slice(0, 2); let hy = 250;
    hl.forEach((ln, i) => { s += `<text x="70" y="${hy + i * (hsize + 2)}" font-family="${HEAD}" font-size="${hsize}" fill="#fff" letter-spacing="0.5">${esc(ln)}</text>`; });
    let cur = hy + hl.length * (hsize + 2) - hsize + 6;
    if (c.sub) { s += `<text x="74" y="${cur + 34}" font-family="${BODY}" font-weight="600" font-size="29" fill="#e7eeff">${esc(clip(stripEmoji(c.sub), 54))}</text>`; cur += 56; }
    // sentence/point-based content (a clean bullet list, NOT tiny stat boxes)
    const pts = (c.points && c.points.length ? c.points : (c.stats || []).map((b) => `${b.label}: ${stripEmoji(String(b.v))}`)).slice(0, 6);
    const py0 = Math.max(cur + 44, 398), py1 = 988, rowH = Math.min(120, Math.floor((py1 - py0) / Math.max(1, pts.length)));
    pts.forEach((p, i) => { const ry = py0 + i * rowH;
      s += `<circle cx="100" cy="${ry + 14}" r="21" fill="${a}"/><path d="M89 ${ry + 14} l8 8 14 -17" fill="none" stroke="#fff" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>`;
      const lines = wrapPlain(stripEmoji(String(p)), 40).slice(0, 2);
      lines.forEach((ln, j) => { s += `<text x="146" y="${ry + 24 + j * 40}" font-family="${BODY}" font-weight="${j === 0 ? 600 : 400}" font-size="32" fill="#fff">${esc(ln)}</text>`; });
    });
  }
  s += `<text x="540" y="1060" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="28" fill="rgba(255,255,255,0.92)">landingprep.com</text>`;
  return s + `</svg>`;
}
// render a single post: AI photo background + crisp overlay (premium); falls back to solid vector cards
async function renderViral(c) {
  if (c.style === "urgency") return Buffer.from(resvgPng(viralUrgency(c), 1080));
  if (AIBG_ON && sharp && c.type !== "vocab") {
    try {
      const bg = await aiBackground(c);
      if (bg) {
        const comps = [{ input: resvgPng(viralOverlay(c), 1080) }];
        if (c.flagCountry) { const f = await safeFlag(c.flagCountry); if (f) comps.push({ input: f, top: 76, left: 894 }); }
        return await sharp(fs.readFileSync(bg)).resize(1080, 1080, { fit: "cover", kernel: "lanczos3" }).composite(comps).png({ quality: 100 }).toBuffer();
      }
    } catch (e) { console.error("[ig] ai-bg render failed, using vector fallback:", e && e.message); }
  }
  // fallback: solid vector templates (no key / generation failed / vocab)
  let svg, light = false;
  if (c.type === "vocab") svg = viralVocab(c);
  else if (c.type === "bulletin") svg = viralNews(c);
  else { const cat = String(c.category || ""); if (/SCHOLARSHIP/i.test(cat)) svg = viralStat(c, true, "#E7B24B"); else if (c.flagCountry) { svg = viralCountry(c); light = true; } else svg = viralStat(c, false); }
  const overlay = resvgPng(svg, 1080);
  if (!light && c.flagCountry && sharp) { const f = await safeFlag(c.flagCountry); if (f) return await sharp(overlay).composite([{ input: f, top: 76, left: 894 }]).png({ quality: 100 }).toBuffer(); }
  return Buffer.from(overlay);
}
// render a single post: viral style (real fonts) when resvg is available, else legacy flat card
async function renderContentPng(c) {
  if (Resvg) { try { return await renderViral(c); } catch (e) { console.error("[ig] viral render failed, using fallback:", e && e.message); } }
  if (!sharp) throw new Error("neither resvg nor sharp available");
  const photo = photoFor(c);
  if (photo) {
    try {
      const comps = [{ input: Buffer.from(photoOverlaySvg(c)) }];
      if (c.flagCountry) { try { const fb = await fetchFlag(c.flagCountry); if (fb) comps.push({ input: await sharp(fb).resize(50, 34, { fit: "cover" }).png().toBuffer(), top: 78, left: 86 }); } catch (e) {} }
      return await sharp(fs.readFileSync(photo)).resize(1080, 1080, { fit: "cover", kernel: "lanczos3" }).composite(comps).png({ quality: 100 }).toBuffer();
    } catch (e) { /* fall through to flat card */ }
  }
  const base = sharp(Buffer.from(buildSvg(c)));
  if (c.flagCountry) { try { const fb = await fetchFlag(c.flagCountry); if (fb) { const f = await sharp(fb).resize(46, 30, { fit: "cover" }).png().toBuffer(); return await base.composite([{ input: f, top: 228, left: 147 }]).png({ quality: 100 }).toBuffer(); } } catch (e) {} }
  return await base.png({ quality: 100 }).toBuffer();
}

// fetch a relevant square stock photo from the free Pexels API (returns Buffer or null)
const PEXELS_KEY = process.env.PEXELS_API_KEY || "";
async function fetchPexels(query, seed) {
  if (!PEXELS_KEY || !query) return null;
  try {
    const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=square&size=large`, { headers: { Authorization: PEXELS_KEY } });
    if (!r.ok) return null;
    const j = await r.json(); const ph = (j.photos || []); if (!ph.length) return null;
    // Pexels ranks by relevance — pick only from the top 3 so the photo actually matches (avoids the #14 "motel" problem)
    const pick = ph[(Math.abs(seed || 0)) % Math.min(ph.length, 3)];
    // large2x (~1880px) downscaled to 1080² stays crisp without the memory cost of full-res originals
    const url = pick && pick.src && (pick.src.large2x || pick.src.original || pick.src.large); if (!url) return null;
    const img = await fetch(url); if (!img.ok) return null;
    return Buffer.from(await img.arrayBuffer());
  } catch (e) { return null; }
}
// country → ISO code for the free flagcdn.com flag images
const ISO = { canada: "ca", australia: "au", "united kingdom": "gb", uk: "gb", britain: "gb", england: "gb", usa: "us", "united states": "us", america: "us", germany: "de", france: "fr", ireland: "ie", "new zealand": "nz", italy: "it", netherlands: "nl", singapore: "sg", india: "in", spain: "es", sweden: "se", switzerland: "ch", uae: "ae", "united arab emirates": "ae", dubai: "ae", japan: "jp", china: "cn", poland: "pl", finland: "fi", denmark: "dk", norway: "no", austria: "at" };
async function fetchFlag(country) {
  const code = ISO[String(country || "").toLowerCase().trim()]; if (!code) return null;
  try { const r = await fetchT(`https://flagcdn.com/w640/${code}.png`, {}, 7000); if (!r.ok) return null; return Buffer.from(await r.arrayBuffer()); } catch (e) { return null; }
}
function detectCountry(text) { const f = PHOTO_COUNTRIES.find((c) => new RegExp("\\b" + c + "\\b", "i").test(text || "")); return f ? (/UK|Britain|England/i.test(f) ? "United Kingdom" : /USA|America|United States/i.test(f) ? "United States" : f) : null; }
// ── AI image generation (Imagen 3) — budgeted to ~3 images/day (~₹300/mo) ──
const IMG_KEY = process.env.IMAGE_API_KEY || process.env.GEMINI_API_KEY || "";
const IMAGES_ON = process.env.IMAGES_ENABLED === "1";
async function aiImage(prompt) {
  if (!IMAGES_ON || !IMG_KEY || !prompt) return null;
  try {
    const r = await fetchT(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(IMG_KEY)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: "1:1" } }) }, 40000);
    if (!r.ok) return null;
    const j = await r.json();
    const p = j && j.predictions && j.predictions[0];
    const b64 = p && (p.bytesBase64Encoded || (p.image && p.image.imageBytes));
    return b64 ? Buffer.from(b64, "base64") : null;
  } catch (e) { return null; }
}
function newsImagePrompt(c) {
  const country = c.flagCountry || "a study-abroad destination";
  const subj = /visa|permit|immigration|passport|residen|migrant/i.test(c.headline) ? "a passport, modern airport terminal, or government building" : "a university campus or famous city landmark";
  return `Cinematic premium editorial photograph for a study-abroad and immigration news post about ${country}. Subject: ${subj} of ${country}. Dramatic natural lighting, shallow depth of field, muted cinematic color grade, ultra realistic, high quality. Absolutely no text, no words, no letters, no captions, no logos, no watermarks.`;
}
function coverImagePrompt(s) {
  return `Cinematic premium wide photograph of ${s.flagCountry || "a study-abroad destination"} — its most famous skyline or landmark at golden hour, dramatic lighting, ultra realistic, magazine quality. Absolutely no text, no words, no letters, no logos, no watermarks.`;
}
// ── "Cartographic Ascent" — the canvas-skill aesthetic, free, in SVG ───────
const MONO = "'DejaVu Sans Mono','Liberation Mono','Courier New',monospace";
const C_GOLD = "#E4B45C", C_CREAM = "#F1ECE0", C_MUTE = "#7C8CB0", C_GREEN = "#2DD6A8", C_INK = "#2A3F66";
function cartoRings(cx, cy) {
  let s = "";
  for (let i = 1; i <= 14; i++) {
    const r = i * 28, amp = 4 + i * 0.8, k = 3 + (i % 4), ph = i * 0.7, pts = [];
    for (let a = 0; a <= 360; a += 9) { const rad = a * Math.PI / 180, rr = r + amp * Math.sin(k * rad + ph); pts.push(`${(cx + rr * Math.cos(rad)).toFixed(1)} ${(cy + rr * Math.sin(rad)).toFixed(1)}`); }
    s += `<path d="M ${pts.join(" L ")} Z" fill="none" stroke="${C_INK}" stroke-width="1" opacity="${Math.max(0, 0.36 - i * 0.022).toFixed(3)}"/>`;
  }
  return s;
}
function cartoNewsSvg(c) {
  const DX = 848, DY = 300, OX = 142, OY = 596, red = c.accent || "#E0492B";
  const big = (c.headline || "").length, size = big > 96 ? 52 : big > 56 ? 62 : 74;
  const lines = wrapRich(c.headline, [c.flagCountry || ""], Math.round(1000 / (size * 0.57))).slice(0, 4);
  const lh = size * 1.06, lastB = 966, firstB = lastB - (lines.length - 1) * lh;
  let head = "";
  lines.forEach((ln, i) => { const sp = ln.map((w) => `<tspan${w.hi ? ` fill="${C_GOLD}"` : ""}>${esc(w.t)} </tspan>`).join("");
    head += `<text x="64" y="${firstB + i * lh}" xml:space="preserve" font-family="${FONT}" font-size="${size}" font-weight="900" fill="${C_CREAM}" letter-spacing="-1.2">${sp}</text>`; });
  const kickY = firstB - size - 22;
  const ntag = ("NEW" + (c.dateStr ? "  ·  " + c.dateStr : "")).toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#0A1330"/><stop offset="0.55" stop-color="#0B1124"/><stop offset="1" stop-color="#070A18"/></linearGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C_GOLD}" stop-opacity="0.30"/><stop offset="1" stop-color="${C_GOLD}" stop-opacity="0"/></radialGradient></defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <circle cx="${DX}" cy="${DY}" r="300" fill="url(#glow)"/>
  ${cartoRings(DX, DY)}
  <path d="M ${OX} ${OY} Q 400 330 ${DX} ${DY}" fill="none" stroke="${C_GOLD}" stroke-width="3"/>
  <circle cx="${OX}" cy="${OY}" r="7" fill="none" stroke="${C_MUTE}" stroke-width="2"/><circle cx="${OX}" cy="${OY}" r="2.5" fill="${C_MUTE}"/>
  <text x="${OX + 16}" y="${OY - 5}" font-family="${MONO}" font-size="16" fill="${C_MUTE}">ORIGIN</text>
  <text x="${OX + 16}" y="${OY + 16}" font-family="${MONO}" font-size="14" fill="${C_MUTE}">00°00′ DEPARTURE</text>
  <line x1="${DX - 150}" y1="${DY}" x2="${DX + 150}" y2="${DY}" stroke="${C_GOLD}" stroke-width="1" opacity="0.45"/>
  <line x1="${DX}" y1="${DY - 150}" x2="${DX}" y2="${DY + 150}" stroke="${C_GOLD}" stroke-width="1" opacity="0.45"/>
  <circle cx="${DX}" cy="${DY}" r="118" fill="none" stroke="${C_GOLD}" stroke-width="1.5" opacity="0.55"/>
  ${c.flagCountry ? `<rect x="${DX - 104}" y="${DY - 72}" rx="10" width="208" height="144" fill="#ffffff"/>` : `<circle cx="${DX}" cy="${DY}" r="44" fill="none" stroke="${C_GOLD}" stroke-width="2"/><circle cx="${DX}" cy="${DY}" r="9" fill="${C_GREEN}"/>`}
  ${logoMark(56, 46, 42, "white")}${wordmark(56 + LOGOW(42) + 12, 84, 26, true)}
  <text x="1016" y="80" text-anchor="end" font-family="${MONO}" font-size="16" fill="${C_MUTE}">ATLAS OF DEPARTURE</text>
  <rect x="56" y="108" rx="8" width="${42 + ntag.length * 13.5}" height="44" fill="${red}"/><text x="74" y="138" font-family="${FONT}" font-size="22" font-weight="900" letter-spacing="1.4" fill="#fff">${esc(ntag)}</text>
  <text x="64" y="${kickY}" font-family="${MONO}" font-size="20" font-weight="700" letter-spacing="2" fill="${C_GOLD}">${esc(stripEmoji(c.category))}</text>
  ${head}
  <rect x="0" y="1004" width="1080" height="76" fill="${red}"/><text x="540" y="1054" text-anchor="middle" font-family="${FONT}" font-size="31" font-weight="900" fill="#fff">Visit ${SITE} for the full story</text>
</svg>`;
}
// render a "news" card: AI photo (if enabled) OR the free cartographic-ascent art; flag = the destination
async function renderBulletinPng(c, seed) {
  if (!sharp) throw new Error("sharp not installed");
  const flag = c.flagCountry ? await fetchFlag(c.flagCountry) : null;
  if (IMAGES_ON && IMG_KEY) {
    const ai = await aiImage(newsImagePrompt(c));
    if (ai) { try {
      const comps = [{ input: Buffer.from(bulletinOverlaySvg(c)) }];
      if (flag) { const fb = await sharp(flag).resize(412, 280, { fit: "cover" }).png().toBuffer(); comps.push({ input: fb, top: 122, left: 626 }); }
      return await sharp(ai).resize(1080, 1080, { fit: "cover", kernel: "lanczos3" }).modulate({ saturation: 1.06 }).composite(comps).png({ quality: 100, compressionLevel: 9 }).toBuffer();
    } catch (e) {} }
  }
  const base = sharp(Buffer.from(cartoNewsSvg(c)));
  const comps = [];
  if (flag) { try { const fb = await sharp(flag).resize(204, 142, { fit: "cover" }).png().toBuffer(); comps.push({ input: fb, top: 229, left: 746 }); } catch (e) {} }
  return await base.composite(comps).png({ quality: 100, compressionLevel: 9 }).toBuffer();
}

// ── caption + publish ────────────────────────────────────────────────────
function buildCaption(c) { const tags = (c.tags || []).map((t) => "#" + t).join(" "); return (c.caption || c.headline || "") + (tags ? "\n\n" + tags : ""); }
async function postToInstagram({ imageUrl, caption, igUserId, token }) {
  const v = "v21.0";
  const cr = await fetch(`https://graph.instagram.com/${v}/${igUserId}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }) });
  const cj = await cr.json(); if (!cr.ok || !cj.id) throw new Error("IG container failed: " + JSON.stringify(cj));
  await new Promise((r) => setTimeout(r, 4000));
  const pr = await fetch(`https://graph.instagram.com/${v}/${igUserId}/media_publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creation_id: cj.id, access_token: token }) });
  const pj = await pr.json(); if (!pr.ok || !pj.id) throw new Error("IG publish failed: " + JSON.stringify(pj));
  return { containerId: cj.id, mediaId: pj.id };
}
async function whoami({ token }) {
  if (!token) throw new Error("Missing IG_ACCESS_TOKEN env");
  const r = await fetch(`https://graph.instagram.com/v21.0/me?fields=user_id,username,name&access_token=${encodeURIComponent(token)}`);
  const j = await r.json(); if (j.error) return { error: j.error };
  return { igUserId: j.user_id || j.id, igUsername: j.username, name: j.name, hint: "Copy 'igUserId' into your Render IG_USER_ID env var (Instagram-Login flow uses graph.instagram.com)." };
}
async function generateDailyImage({ baseUrl, now, slot }) {
  if (slot == null) slot = slotFromHour(now);
  const c = await resolveDailyContent(now, slot); if (!c) throw new Error("no content for slot " + slot);
  const seed = dayNumber(now) * 5 + (Number(slot) || 0);
  const png = await renderContentPng(c);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  try { for (const f of fs.readdirSync(OUT_DIR)) { const fp = path.join(OUT_DIR, f); if (Date.now() - fs.statSync(fp).mtimeMs > 7200000) fs.unlinkSync(fp); } } catch (e) {}
  const name = `post-${slot}-${Date.now()}.png`; fs.writeFileSync(path.join(OUT_DIR, name), png);
  return { content: c, slot, caption: buildCaption(c), file: name, imageUrl: `${(baseUrl || "").replace(/\/$/, "")}/ig-out/${name}` };
}
async function runDailyPost({ baseUrl, igUserId, token, now, slot }) {
  if (!igUserId || !token) throw new Error("Missing IG_USER_ID or IG_ACCESS_TOKEN env");
  const sl = slot == null ? slotFromHour(now) : (((Number(slot) || 0) % SLOTS + SLOTS) % SLOTS);
  if (sl === CAROUSEL_SLOT) { const r = await runCarousel({ baseUrl, igUserId, token, now }); return { ok: true, slot: sl, ...r }; }
  const gen = await generateDailyImage({ baseUrl, now, slot: sl });
  const res = await postToInstagram({ imageUrl: gen.imageUrl, caption: gen.caption, igUserId, token });
  return { ok: true, slot: gen.slot, mediaId: res.mediaId, theme: gen.content.type + ":" + gen.content.category, imageUrl: gen.imageUrl };
}
async function runAllSlots({ baseUrl, igUserId, token, now }) {
  const out = [];
  for (let s = 0; s < SLOTS; s++) {
    try { out.push(await runDailyPost({ baseUrl, igUserId, token, now, slot: s })); await new Promise((r) => setTimeout(r, 6000)); }
    catch (e) { out.push({ ok: false, slot: s, error: String((e && e.message) || e) }); }
  }
  return { ok: out.every((o) => o.ok), posts: out };
}

// ── CAROUSELS (multi-slide posts — the highest-reach image format) ────────
const YEAR = "2026";
function slideHeader(topic) {
  return logoMark(56, 46, 42, "white") + wordmark(56 + LOGOW(42) + 12, 84, 26, true) +
    `<text x="1016" y="80" text-anchor="end" font-family="${MONO}" font-size="16" fill="${C_MUTE}">ATLAS OF DEPARTURE</text>` +
    `<text x="64" y="172" font-family="${MONO}" font-size="20" font-weight="700" letter-spacing="2" fill="${C_GOLD}">${esc(stripEmoji(topic))}</text>`;
}
function cartoBgSvgFrag() {
  return `<defs><linearGradient id="bg" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stop-color="#0A1330"/><stop offset="0.55" stop-color="#0B1124"/><stop offset="1" stop-color="#070A18"/></linearGradient>
  <radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C_GOLD}" stop-opacity="0.20"/><stop offset="1" stop-color="${C_GOLD}" stop-opacity="0"/></radialGradient></defs>
  <rect width="1080" height="1080" fill="url(#bg)"/><circle cx="980" cy="150" r="300" fill="url(#glow)"/>${cartoRings(980, 150)}`;
}
function carouselFooter(idx, total, accent, swipe) {
  return `<rect x="0" y="1004" width="1080" height="76" fill="${accent}"/>` +
    `<text x="64" y="1052" font-family="${FONT}" font-size="25" font-weight="900" fill="#fff">${SITE}</text>` +
    `<text x="1016" y="1052" text-anchor="end" font-family="${FONT}" font-size="24" font-weight="800" fill="rgba(255,255,255,0.95)">${swipe ? "SWIPE  ›" : idx + " / " + total}</text>`;
}
// numbered-points content slide (cartographic)
// bright numbered-points content slide
function slidePointsSvg(s) {
  const a = s.accent || "#2563EB";
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${brBg(a)}${brLogoBar()}<rect x="90" y="178" width="900" height="770" rx="40" fill="#fff"/>`;
  svg += brPill(130, 212, s.topic, a, false);
  svg += `<circle cx="916" cy="241" r="34" fill="${BR_CARD}"/><text x="916" y="252" text-anchor="middle" font-family="${FONT}" font-size="25" font-weight="900" fill="${a}">${s.idx}/${s.total}</text>`;
  const tl = wrapPlain(s.title, 22).slice(0, 2); let y = 342;
  tl.forEach((ln, i) => { svg += `<text x="130" y="${y + i * 62}" font-family="${FONT}" font-size="56" font-weight="900" fill="${BR_NAVY}" letter-spacing="-1.5">${esc(ln)}</text>`; });
  y += (tl.length - 1) * 62 + 56;
  const pts = (s.points || []).slice(0, 5); const oh = pts.length >= 5 ? 86 : 98;
  pts.forEach((p, i) => { const pl = wrapPlain(p, 40).slice(0, 2);
    svg += `<rect x="130" y="${y}" width="820" height="${oh}" rx="18" fill="${BR_CARD}"/>`;
    svg += `<circle cx="184" cy="${y + oh / 2}" r="28" fill="${a}"/><text x="184" y="${y + oh / 2 + 10}" text-anchor="middle" font-family="${FONT}" font-size="28" font-weight="900" fill="#fff">${i + 1}</text>`;
    svg += `<text font-family="${FONT}" font-size="27" font-weight="600" fill="${BR_INK}">${tspans(pl, 236, y + (oh - (pl.length - 1) * 34) / 2 + 9, 34)}</text>`;
    y += oh + 12;
  });
  svg += `<text x="540" y="1008" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="900" fill="#fff">SWIPE FOR MORE  →</text>`;
  return svg + `</svg>`;
}
// bright final CTA slide
function slideCTASvg(s) {
  const a = s.accent || "#2563EB";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${brBg(a)}${brLogoBar()}
  <rect x="90" y="200" width="900" height="680" rx="40" fill="#fff"/>
  <text x="540" y="330" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="800" fill="${a}">FOUND THIS USEFUL?</text>
  <text x="540" y="480" text-anchor="middle" font-family="${FONT}" font-size="132" font-weight="900" fill="${BR_NAVY}" letter-spacing="-4">SAVE IT</text>
  <text x="540" y="572" text-anchor="middle" font-family="${FONT}" font-size="42" font-weight="600" fill="${BR_INK}">and share it with a friend</text>
  <circle cx="430" cy="690" r="42" fill="${a}"/>${brIcon(430, 690, 42, "check")}<circle cx="540" cy="690" r="42" fill="${a}"/>${brIcon(540, 690, 42, "star")}<circle cx="650" cy="690" r="42" fill="${a}"/>${brIcon(650, 690, 42, "plane")}
  <text x="540" y="820" text-anchor="middle" font-family="${FONT}" font-size="40" font-weight="900" fill="${BR_NAVY}">Follow ${HANDLE} for daily guides</text>
  ${brCta("Full guide — link in bio  →", a)}
</svg>`;
}
// bright carousel cover
function cartoCoverSvg(s) {
  const a = s.accent || "#1D4ED8";
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">${brBg(a)}${brLogoBar()}<rect x="90" y="178" width="900" height="700" rx="40" fill="#fff"/>`;
  svg += brPill(130, 214, s.sub || "STUDY ABROAD GUIDE", a, !!s.flagCountry);
  const tl = wrapPlain(s.title, 15).slice(0, 3); const ts = tl.length > 2 ? 72 : 88; let y = 372;
  tl.forEach((ln, i) => { svg += `<text x="130" y="${y + i * (ts + 4)}" font-family="${FONT}" font-size="${ts}" font-weight="900" fill="${BR_NAVY}" letter-spacing="-2">${esc(ln)}</text>`; });
  svg += `<circle cx="810" cy="770" r="96" fill="${hexA(a, 0.12)}"/>` + brIcon(810, 770, 96, "cap").replace(/#fff/g, a);
  svg += brCta("SWIPE TO SEE THE FULL GUIDE  →", a);
  return svg + `</svg>`;
}
async function renderCoverPng(s, photoQuery, seed) {
  if (!sharp) throw new Error("sharp not installed");
  const base = sharp(Buffer.from(cartoCoverSvg(s)));
  if (s.flagCountry) { try { const fb = await fetchFlag(s.flagCountry); if (fb) { const f = await sharp(fb).resize(46, 30, { fit: "cover" }).png().toBuffer(); return await base.composite([{ input: f, top: 228, left: 147 }]).png({ quality: 100 }).toBuffer(); } } catch (e) {} }
  return await base.png({ quality: 100 }).toBuffer();
}
function buildCountryCarousel(c, seed) {
  const name = c.name, slug = name.toLowerCase().replace(/\s+/g, ""), total = 5, accent = "#E0492B";
  const costPoints = [c.avgTuition ? "Tuition: " + c.avgTuition : "", c.avgLiving ? "Living costs: " + c.avgLiving : "", c.postStudyWork ? "Post-study work: " + c.postStudyWork : "", c.visaSuccess ? "Visa success rate: ~" + c.visaSuccess + "%" : ""].filter(Boolean);
  const pr = (c.immigrationPlan && c.immigrationPlan.length ? c.immigrationPlan : (c.visaTypes || []).map((v) => v.name + (v.note ? ": " + v.note : ""))).slice(0, 5);
  return {
    topic: "STUDY ABROAD · " + name.toUpperCase(), accent, photoQuery: pickPhotoQuery(name, "edu"),
    slides: [
      { kind: "cover", title: "Study in " + name + " " + YEAR, sub: (c.tagline || "The complete guide").toUpperCase(), flagCountry: name, idx: 1, total },
      { kind: "points", title: "💰 What it costs", points: costPoints, idx: 2, total },
      { kind: "points", title: "Why " + name + "?", points: (c.whyStudy || []).slice(0, 4), idx: 3, total },
      { kind: "points", title: "Your visa & PR pathway", points: pr, idx: 4, total },
      { kind: "cta", idx: 5, total },
    ],
    caption: `🎓 STUDY IN ${name.toUpperCase()} — your complete ${YEAR} guide 👇\n\nSwipe ➡️ for tuition, living costs, why ${name}, and the full visa → PR pathway.\n\n📲 SHARE with someone planning to study in ${name}.\n📌 SAVE this guide for later.\n💬 Is ${name} on your list? Comment 👇\n\n👉 Full free ${name} guide — link in bio.\nFollow ${HANDLE} for a daily study-abroad guide 🌍`,
    tags: buildTags("study" + slug, "studentvisa", "studyabroad", "internationalstudents", "landingprep"),
  };
}
function buildTopCollegesCarousel(seed) {
  const C = collegesData(); if (!C.length) return null;
  const countries = [...new Set(C.map((c) => c.country))]; const country = countries[seed % countries.length];
  const list = C.filter((c) => c.country === country).sort((a, b) => (a.rank || 999) - (b.rank || 999)).slice(0, 10);
  if (list.length < 3) return null;
  const pts = list.map((c) => `${collegeShort(c.name)} — ${c.rank ? "#" + c.rank + " · " : ""}${c.feeNote || ""}`.trim());
  const slug = country.toLowerCase().replace(/\s+/g, "");
  return { topic: "TOP UNIVERSITIES · " + country.toUpperCase(), accent: "#7C3AED", flagCountry: country,
    slides: [
      { kind: "cover", title: "Top universities in " + country, sub: "RANKED FOR INTERNATIONAL STUDENTS", flagCountry: country },
      { kind: "points", title: "The top picks", points: pts.slice(0, 5) },
      { kind: "points", title: "More great options", points: pts.slice(5, 10) },
      { kind: "cta" },
    ],
    caption: `🎓 Top universities in ${country} for international students 👇\n\nSwipe for world rankings + tuition fees.\n\n📲 SHARE with a future applicant.\n📌 SAVE this list.\n💬 Which one is your dream? 👇\n\n👉 Free college predictor — link in bio.\nFollow ${HANDLE} for daily admits info 🎓`,
    tags: buildTags("studyin" + slug, "topuniversities", "studyabroad", "universityadmission", "landingprep") };
}
function buildAdmissionCarousel(seed) {
  return { topic: "STUDY ABROAD · ROADMAP", accent: "#0E9F6E", flagCountry: null,
    slides: [
      { kind: "cover", title: "How to study abroad in " + YEAR, sub: "YOUR STEP-BY-STEP ROADMAP" },
      { kind: "points", title: "1 · Plan & prepare", points: ["Shortlist countries & courses (budget, PR, jobs)", "Take your English / aptitude test (IELTS, PTE, GRE…)", "Build your profile: grades, projects, work experience"] },
      { kind: "points", title: "2 · Apply", points: ["Shortlist 6–8 universities (reach / match / safe)", "Write a strong SOP + get 2–3 LORs", "Submit applications before the deadlines"] },
      { kind: "points", title: "3 · Fund & fly", points: ["Accept your offer & pay the deposit", "Apply for scholarships & an education loan", "Get your student visa — then book your flight!"] },
      { kind: "cta" },
    ],
    caption: `✈️ How to study abroad — the complete ${YEAR} roadmap 👇\n\nSave this if you're starting your journey.\n\n📲 SHARE with a friend who's planning.\n📌 SAVE the roadmap.\n💬 Which step are you on? 👇\n\n👉 Free tools & guides — link in bio.\nFollow ${HANDLE} for daily study-abroad help ✈️`,
    tags: buildTags("studyabroad", "studyabroad2026", "internationalstudents", "studyabroadtips", "landingprep") };
}
function buildExamCarousel(seed) {
  const E = examPatterns(); const keys = Object.keys(E); if (!keys.length) return null;
  const k = keys[seed % keys.length]; const e = E[k]; const name = k.toUpperCase();
  const secs = (e.sections || []).map((s) => `${s.name}${s.duration ? " — " + s.duration : ""}`);
  const tips = (e.tips || []).slice(0, 3);
  return { topic: name + " · EXAM GUIDE", accent: "#0E9F6E", flagCountry: null,
    slides: [
      { kind: "cover", title: "The " + name + " exam, explained", sub: ((e.totalDuration ? e.totalDuration + " · " : "") + (e.scoring || "")).toUpperCase() },
      { kind: "points", title: "The sections", points: secs.slice(0, 5) },
      tips.length ? { kind: "points", title: "Top tips to score high", points: tips } : null,
      { kind: "cta" },
    ],
    caption: `🎯 The ${name} exam, fully explained 👇\n\nSwipe for sections, scoring & top tips.\n\n📲 TAG someone taking ${name}.\n📌 SAVE this guide.\n💬 When's your test? 👇\n\n👉 Free ${name} mock test — link in bio.\nFollow ${HANDLE} for daily exam prep 📚`,
    tags: buildTags(k.toLowerCase(), k.toLowerCase() + "preparation", "examprep", "mocktest", "landingprep") };
}
function finalizeCarousel(car) {
  if (!car) return null;
  const slides = car.slides.filter(Boolean).filter((s) => s.kind !== "points" || (s.points && s.points.filter(Boolean).length));
  slides.forEach((s, i) => { s.idx = i + 1; s.total = slides.length; s.accent = car.accent; });
  car.slides = slides; return car;
}
// rotate the daily carousel: country guide → top colleges → admission roadmap → exam guide
function pickCarousel(now) {
  const seed = dayNumber(now); const which = seed % 4; let car = null;
  if (which === 0) { const D = evalWindow("country-data.jsx").LP_COUNTRY_DATA || []; if (D.length) car = buildCountryCarousel(D[seed % D.length], seed); }
  else if (which === 1) car = buildTopCollegesCarousel(seed);
  else if (which === 2) car = buildAdmissionCarousel(seed);
  else car = buildExamCarousel(seed);
  return finalizeCarousel(car) || finalizeCarousel(buildAdmissionCarousel(seed));
}
async function generateCarousel({ baseUrl, now }) {
  const car = pickCarousel(now); if (!car) throw new Error("no carousel content");
  fs.mkdirSync(OUT_DIR, { recursive: true });
  try { for (const f of fs.readdirSync(OUT_DIR)) { const fp = path.join(OUT_DIR, f); if (Date.now() - fs.statSync(fp).mtimeMs > 7200000) fs.unlinkSync(fp); } } catch (e) {}
  const urls = []; const stamp = Date.now();
  for (let i = 0; i < car.slides.length; i++) {
    const s = car.slides[i]; s.topic = car.topic; s.accent = car.accent;
    const png = s.kind === "cover" ? await renderCoverPng(s, car.photoQuery, dayNumber(now) + i) : s.kind === "cta" ? await renderPng(slideCTASvg(s)) : await renderPng(slidePointsSvg(s));
    const name = `car-${stamp}-${i}.png`; fs.writeFileSync(path.join(OUT_DIR, name), png);
    urls.push(`${(baseUrl || "").replace(/\/$/, "")}/ig-out/${name}`);
  }
  return { content: car, caption: buildCaption(car), imageUrls: urls };
}
async function postCarousel({ imageUrls, caption, igUserId, token }) {
  const v = "v21.0"; const children = [];
  for (const url of imageUrls) {
    const r = await fetch(`https://graph.instagram.com/${v}/${igUserId}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: token }) });
    const j = await r.json(); if (!r.ok || !j.id) throw new Error("carousel child failed: " + JSON.stringify(j));
    children.push(j.id); await new Promise((r) => setTimeout(r, 2500));
  }
  const cr = await fetch(`https://graph.instagram.com/${v}/${igUserId}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ media_type: "CAROUSEL", children: children.join(","), caption, access_token: token }) });
  const cj = await cr.json(); if (!cr.ok || !cj.id) throw new Error("carousel container failed: " + JSON.stringify(cj));
  await new Promise((r) => setTimeout(r, 4000));
  const pr = await fetch(`https://graph.instagram.com/${v}/${igUserId}/media_publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creation_id: cj.id, access_token: token }) });
  const pj = await pr.json(); if (!pr.ok || !pj.id) throw new Error("carousel publish failed: " + JSON.stringify(pj));
  return { mediaId: pj.id, slides: imageUrls.length };
}
async function runCarousel({ baseUrl, igUserId, token, now }) {
  if (!igUserId || !token) throw new Error("Missing IG_USER_ID or IG_ACCESS_TOKEN env");
  const gen = await generateCarousel({ baseUrl, now });
  const res = await postCarousel({ imageUrls: gen.imageUrls, caption: gen.caption, igUserId, token });
  return { ok: true, type: "carousel", topic: gen.content.topic, slides: res.slides, mediaId: res.mediaId };
}

// ── pre-made image pool (batch mode) ─────────────────────────────────────────
// Posts are designed in Canva and dropped into /ig-pool/ alongside a pool.json
// manifest. The server serves the PNGs statically and posts them as-is, so no
// image generation (or Canva API token) is needed at post time.
const POOL_DIR = path.join(ROOT, "ig-pool");
function loadPool() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(POOL_DIR, "pool.json"), "utf8"));
    return Array.isArray(j && j.posts) ? j.posts : [];
  } catch (e) { return []; }
}
function poolItemUrls(item, baseUrl) {
  const base = (baseUrl || "").replace(/\/$/, "");
  return ((item && item.images) || []).map((f) => `${base}/ig-pool/${encodeURIComponent(f)}`);
}
function poolItemType(item) {
  return (item && item.type) || (item && item.images && item.images.length > 1 ? "carousel" : "single");
}
function listPool({ baseUrl } = {}) {
  return loadPool().map((it, i) => ({ index: i, id: it.id, type: poolItemType(it), images: poolItemUrls(it, baseUrl), caption: it.caption || "" }));
}
async function runPoolPost({ baseUrl, igUserId, token, index, now }) {
  if (!igUserId || !token) throw new Error("Missing IG_USER_ID or IG_ACCESS_TOKEN env");
  const pool = loadPool();
  if (!pool.length) throw new Error("ig-pool/pool.json is empty or missing");
  const i = (index == null) ? (dayNumber(now) % pool.length) : ((((Number(index) || 0) % pool.length) + pool.length) % pool.length);
  const item = pool[i];
  const urls = poolItemUrls(item, baseUrl);
  if (!urls.length) throw new Error("pool item has no images: " + (item.id || i));
  const caption = item.caption || buildCaption(item);
  if (poolItemType(item) === "carousel" || urls.length > 1) {
    const res = await postCarousel({ imageUrls: urls, caption, igUserId, token });
    return { ok: true, pool: true, index: i, id: item.id, type: "carousel", slides: urls.length, mediaId: res.mediaId };
  }
  const res = await postToInstagram({ imageUrl: urls[0], caption, igUserId, token });
  return { ok: true, pool: true, index: i, id: item.id, type: "single", mediaId: res.mediaId };
}

// ══ "TOP CITIES TO STUDY IN …" carousels — cover slide + one paragraph-rich slide per city ══
const STUDY_CITIES = {
  usa: { name: "the USA", cover: "country-usa", cities: [
    { city: "Boston", slug: "boston", unis: "Harvard, MIT, BU, Northeastern", text: "America's ultimate student city — walkable, safe and packed with world-leading research in tech, biotech and finance. Rents are high, but you get unmatched academic prestige and more internships than almost anywhere in the world." },
    { city: "New York", slug: "new-york", unis: "Columbia, NYU, Cornell Tech", text: "The city that never sleeps. Unrivalled for business, media, art and finance, with Wall Street on your doorstep. It's expensive and competitive, but the networking and internship pull are simply world-class." },
    { city: "Los Angeles", slug: "los-angeles", unis: "UCLA, USC, Caltech", text: "Sun, beaches and serious academics. LA is the hub for film, media, aerospace and a booming tech scene. It's sprawling and car-dependent, but the lifestyle and entertainment-industry access are hard to beat." },
    { city: "San Francisco", slug: "san-francisco", unis: "Stanford, UC Berkeley", text: "The heart of global tech. Silicon Valley puts you next to Google, Apple and thousands of startups, paying the highest salaries in the US. Living costs are steep, but the CS, AI and engineering opportunities are unmatched." },
    { city: "Chicago", slug: "chicago", unis: "UChicago, Northwestern", text: "A powerhouse for economics, business and law at a friendlier cost than the coasts. Big-city culture on Lake Michigan, strong finance and consulting recruiting — and famously cold winters to push through." },
  ] },
  uk: { name: "the UK", cover: "country-uk", cities: [
    { city: "London", slug: "london", unis: "UCL, Imperial, KCL, LSE", text: "Four world-top-40 universities in one city, plus the biggest graduate job market in Europe — finance, tech, media and law. Rent is steep, but the 2-year Graduate Route lets you stay and work after your degree." },
    { city: "Oxford", slug: "oxford", unis: "University of Oxford", text: "One of the oldest, most prestigious universities on earth. A small, walkable college town an hour from London, strong in everything from PPE to medicine and AI research. Highly competitive — but unmatched prestige." },
    { city: "Manchester", slug: "manchester", unis: "University of Manchester", text: "A big, affordable student city with a famous music and football culture. Strong in engineering, computer science and business, with much lower living costs than London and a huge international community." },
    { city: "Edinburgh", slug: "edinburgh", unis: "University of Edinburgh", text: "Scotland's stunning capital and a top-20 global university, especially for AI, data science and medicine. Compact, historic and friendly, with a lively festival scene and easy access to the Highlands." },
  ] },
  canada: { name: "Canada", cover: "country-canada", cities: [
    { city: "Toronto", slug: "toronto", unis: "U of Toronto, TMU, York", text: "Canada's biggest, most diverse city and home to the #1-ranked University of Toronto. The hub for finance, tech and AI jobs, with a clear study → work permit → PR pathway. Pricey, but the opportunities are unmatched." },
    { city: "Vancouver", slug: "vancouver", unis: "UBC, SFU", text: "Mountains, ocean and a top-40 global university (UBC). Mild weather, a booming film and tech scene, and a strong Asian-Pacific community. Cost of living is high, but the lifestyle and PR pathway are big draws." },
    { city: "Montreal", slug: "montreal", unis: "McGill, Concordia", text: "A bilingual, European-feeling city with the lowest tuition and rent of Canada's big three — and McGill, one of the country's best universities. Vibrant, artsy and affordable, ideal for students on a budget." },
    { city: "Waterloo", slug: "waterloo", unis: "U of Waterloo, Laurier", text: "Canada's tech and engineering capital, famous for the world's largest co-op (paid internship) program. Grads get hired by Google, Apple and top startups. A smaller, student-focused city with strong job outcomes." },
  ] },
  australia: { name: "Australia", cover: "country-australia", cities: [
    { city: "Melbourne", slug: "melbourne", unis: "U of Melbourne, Monash, RMIT", text: "Regularly voted one of the world's most liveable cities, and home to the #1-ranked University of Melbourne. Great coffee, sport and arts, a big job market, and post-study work rights of up to 4–6 years." },
    { city: "Sydney", slug: "sydney", unis: "USYD, UNSW, UTS", text: "Iconic harbour, beaches and two top-20 global universities. The finance and tech hub of Australia with the strongest graduate job market — but also the highest cost of living, so budget carefully." },
    { city: "Brisbane", slug: "brisbane", unis: "UQ, QUT, Griffith", text: "Sunny, warm and noticeably cheaper than Sydney or Melbourne, with the highly-ranked University of Queensland. A growing job market, an easy outdoor lifestyle and a fast-rising international student scene." },
    { city: "Canberra", slug: "canberra", unis: "ANU, U of Canberra", text: "Australia's capital and home to ANU, the country's #1 research university. Smaller and quieter, with strong government, policy and research jobs, lower competition for housing, and generous regional migration points." },
  ] },
  germany: { name: "Germany", cover: "country-germany", cities: [
    { city: "Munich", slug: "munich", unis: "TUM, LMU", text: "Home to TUM and LMU — two of Europe's best universities — and the headquarters of BMW, Siemens and Allianz. Public university tuition is essentially €0, even for international students. Higher rent, but huge engineering and business opportunities." },
    { city: "Berlin", slug: "berlin", unis: "TU Berlin, Humboldt, FU", text: "Germany's creative, startup-driven capital, with several strong public universities and near-zero tuition. Affordable, international and English-friendly, with a booming tech scene and an 18-month post-study job-seeker visa." },
    { city: "Aachen", slug: "aachen", unis: "RWTH Aachen", text: "Home to RWTH Aachen, Germany's top university for engineering and technology. A compact, affordable student city on the Dutch/Belgian border, with deep industry links and excellent job prospects in mechanical, electrical and computer engineering." },
    { city: "Heidelberg", slug: "heidelberg", unis: "Heidelberg University", text: "Germany's oldest university and a global leader in medicine, life sciences and physics. A beautiful, historic riverside town — safe, walkable and research-intensive, with strong funding and PhD opportunities." },
  ] },
};
function cityPrompt(country, city) {
  return "A stunning view of the " + city + " city skyline and iconic landmarks in " + country + ". Premium cinematic editorial photograph, golden-hour dusk, dramatic atmospheric lighting, deep blue and warm amber tones, soft bokeh, high-end magazine quality, darker toward the bottom for text. No text, no words, no logos, no visible faces. Ultra realistic, square 1:1.";
}
async function cityBg(country, slug, city) {
  if (!sharp) return null;
  try { fs.mkdirSync(AIBG_DIR, { recursive: true }); } catch (e) {}
  const key = "city-" + slug;
  for (const e of [".jpg", ".png", ".webp"]) { const p = path.join(AIBG_DIR, key + e); if (fs.existsSync(p)) return p; }
  if (!IMG_KEY) return null;
  const buf = await imagenGen(cityPrompt(country, city)); if (!buf) return null;
  const p = path.join(AIBG_DIR, key + ".jpg");
  try { const out = await sharp(buf).resize(1080, 1080, { fit: "cover", kernel: "lanczos3" }).jpeg({ quality: 88 }).toBuffer(); fs.writeFileSync(p, out); return p; } catch (e) { return null; }
}
function _csPill(x, y, txt, a) { const w = 40 + txt.length * 14; return `<rect x="${x}" y="${y}" rx="28" width="${Math.round(w)}" height="56" fill="${a}"/><text x="${x + w / 2}" y="${y + 38}" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="25" fill="#fff" letter-spacing="1.5">${esc(txt)}</text>`; }
function cityCoverSvg(cc, total) {
  const a = "#1657E0", Y = "#FFC83A";
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs><linearGradient id="cc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070d" stop-opacity="0.3"/><stop offset="0.45" stop-color="#05070d" stop-opacity="0.55"/><stop offset="1" stop-color="#05070d" stop-opacity="0.96"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#cc)"/>`;
  s += _csPill(72, 74, "TOP STUDY CITIES", a);
  const title = ("BEST CITIES TO STUDY IN " + cc.name).toUpperCase(), lines = wrapPlain(title, 13).slice(0, 4);
  let y = 600 - (lines.length - 1) * 100;
  lines.forEach((ln, i) => { s += `<text x="72" y="${y + i * 100}" font-family="${HEAD}" font-size="98" fill="#fff" letter-spacing="0.5">${esc(ln)}</text>`; });
  s += `<text x="74" y="${y + lines.length * 100 + 8}" font-family="${BODY}" font-weight="600" font-size="34" fill="#e7eeff">The universities, the jobs, and real student life.</text>`;
  s += `<rect x="0" y="912" width="1080" height="104" fill="${Y}"/><text x="540" y="978" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="40" fill="#0a0a0a" letter-spacing="0.5">SWIPE TO SEE ALL ${total - 1} CITIES  &#8594;</text>`;
  s += `<text x="540" y="1060" text-anchor="middle" font-family="${BODY}" font-weight="800" font-size="28" fill="rgba(255,255,255,0.92)">landingprep.com</text>`;
  return s + `</svg>`;
}
function citySlideSvg(slide, idx, total) {
  const a = "#3B82F6", Y = "#FFD400";
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs><linearGradient id="ci" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070d" stop-opacity="0.22"/><stop offset="0.4" stop-color="#05070d" stop-opacity="0.55"/><stop offset="1" stop-color="#05070d" stop-opacity="0.97"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#ci)"/>`;
  s += _csPill(72, 74, "TOP STUDY CITIES", a);
  s += `<text x="1008" y="112" text-anchor="end" font-family="${BODY}" font-weight="800" font-size="30" fill="rgba(255,255,255,0.85)">${idx} / ${total}</text>`;
  const cityUp = stripEmoji(slide.city).toUpperCase(), csize = cityUp.length > 11 ? 92 : 124;
  s += `<text x="72" y="436" font-family="${HEAD}" font-size="${csize}" fill="#fff" letter-spacing="0.5">${esc(cityUp)}</text>`;
  s += `<text x="74" y="492" font-family="${BODY}" font-weight="700" font-size="30" fill="${lighten(a, 0.45)}">Top universities: ${esc(clip(slide.unis, 40))}</text>`;
  const para = wrapPlain(stripEmoji(slide.text), 40).slice(0, 7);
  para.forEach((ln, i) => { s += `<text x="72" y="${560 + i * 48}" font-family="${BODY}" font-weight="500" font-size="34" fill="#eef2ff">${esc(ln)}</text>`; });
  if (idx < total) s += `<text x="1008" y="980" text-anchor="end" font-family="${BODY}" font-weight="800" font-size="30" fill="${Y}">SWIPE  &#8594;</text>`;
  s += `<text x="72" y="980" font-family="${BODY}" font-weight="800" font-size="28" fill="rgba(255,255,255,0.92)">landingprep.com</text>`;
  return s + `</svg>`;
}
function buildCitiesCarousel(key) {
  const cc = STUDY_CITIES[key]; if (!cc) return null;
  const cities = cc.cities.slice(0, 5), total = cities.length + 1;
  const slides = [{ kind: "cover" }].concat(cities.map((c) => Object.assign({ kind: "city" }, c)));
  const caption = `🌍 The ${cities.length} best cities to study in ${cc.name} 👇\n\nSwipe ➡️ for each city — the top universities, the jobs, and what student life is really like.\n\n${cities.map((c) => "📍 " + c.city + " — " + c.unis).join("\n")}\n\n📌 SAVE this for your shortlist. 📲 SHARE it with someone applying.\n💬 Which city is your pick? Comment 👇\n\nFollow ${HANDLE} for daily study-abroad guides 🌍`;
  return { slides, total, caption, tags: buildTags("studyin" + key, "studyabroad", "topuniversities", "internationalstudents", "landingprep") };
}
async function renderCitiesCarousel({ baseUrl, key }) {
  const cc = STUDY_CITIES[key]; const car = buildCitiesCarousel(key); if (!car) throw new Error("no cities for " + key);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const urls = [], stamp = Date.now();
  for (let i = 0; i < car.slides.length; i++) {
    const sl = car.slides[i]; let photoPath = null, svg;
    if (sl.kind === "cover") { for (const e of [".jpg", ".png", ".webp"]) { const p = path.join(AIBG_DIR, cc.cover + e); if (fs.existsSync(p)) { photoPath = p; break; } } svg = cityCoverSvg(cc, car.total); }
    else { photoPath = await cityBg(cc.name, sl.slug, sl.city); svg = citySlideSvg(sl, i + 1, car.total); }
    const overlay = resvgPng(svg, 1080);
    let png;
    if (photoPath && sharp) png = await sharp(fs.readFileSync(photoPath)).resize(1080, 1080, { fit: "cover", kernel: "lanczos3" }).composite([{ input: overlay }]).png({ quality: 100 }).toBuffer();
    else png = Buffer.from(overlay);
    const name = `cities-${stamp}-${i}.png`; fs.writeFileSync(path.join(OUT_DIR, name), png);
    urls.push(`${(baseUrl || "").replace(/\/$/, "")}/ig-out/${name}`);
  }
  return { imageUrls: urls, caption: car.caption, slides: car.slides.length };
}
// pick this week's country for the Top-Cities carousel (rotates one country/week)
function citiesWeekKey(now) { const keys = Object.keys(STUDY_CITIES); return keys[Math.floor(dayNumber(now) / 7) % keys.length]; }
async function generateCitiesCarousel({ baseUrl, now }) { const key = citiesWeekKey(now); const g = await renderCitiesCarousel({ baseUrl, key }); return Object.assign({ country: key }, g); }
async function runCitiesCarousel({ baseUrl, igUserId, token, now }) {
  if (!igUserId || !token) throw new Error("Missing IG_USER_ID or IG_ACCESS_TOKEN env");
  const gen = await generateCitiesCarousel({ baseUrl, now });
  const res = await postCarousel({ imageUrls: gen.imageUrls, caption: gen.caption, igUserId, token });
  return { ok: true, type: "cities-carousel", country: gen.country, slides: res.slides, mediaId: res.mediaId };
}
module.exports = { pickForSlot, slotFromHour, buildSvg, renderPng, buildCaption, generateDailyImage, postToInstagram, runDailyPost, runAllSlots, generateCarousel, postCarousel, runCarousel, whoami, listPool, runPoolPost, buildCitiesCarousel, renderCitiesCarousel, generateCitiesCarousel, runCitiesCarousel, SLOTS, CAROUSEL_SLOT, OUT_DIR, POOL_DIR };
