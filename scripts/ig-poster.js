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
const SLOTS = 10;

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
const TRENDING_TAGS = ["studyabroad", "studyabroad2026", "studygram", "internationalstudents", "studyvisa", "ieltspreparation", "studentlife", "studyoverseas", "scholarships", "dreamstudyabroad"];
function buildTags() {
  const out = [];
  for (let i = 0; i < arguments.length; i++) { const a = Array.isArray(arguments[i]) ? arguments[i] : [arguments[i]]; for (const t of a) { const x = String(t || "").toLowerCase().replace(/[^a-z0-9]/g, ""); if (x && !out.includes(x)) out.push(x); } }
  for (const t of TRENDING_TAGS) { if (!out.includes(t)) out.push(t); }
  return out.slice(0, 15);
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
function rssToContent(it, kind) {
  const T = kind === "immig" ? THEME.immig : THEME.edu;
  const title = cleanTitle(it.title); const src = (it.source || "").slice(0, 18);
  const cat = (kind === "immig" ? "IMMIGRATION NEWS" : "STUDY-ABROAD NEWS") + (src ? " · " + src.toUpperCase() : "");
  return { type: "bulletin", accent: T.accent, bg: T.bg, category: cat, headline: clip(title, 120), highlight: [],
    flagCountry: detectCountry(title), dateStr: fmtDate(it.date), photoQuery: pickPhotoQuery(title, kind), live: true, cta: "More news → link in bio",
    caption: `🚨 ${kind === "immig" ? "IMMIGRATION" : "STUDY-ABROAD"} NEWS${it.date ? " · " + fmtDate(it.date) : ""}\n\n${title}${src ? "\n\n📰 Source: " + (it.source || "") : ""}\n\n📲 SHARE this — someone you know needs to see it.\n📌 SAVE for reference.\n💬 What's your take? Comment 👇\n\n👉 Daily study-abroad news + free guides — link in bio.\nFollow ${HANDLE} for trending updates 🌍`,
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
  if (slot === 0 || slot === 3) { try { const live = await liveNews(now, slot === 0 ? 0 : 1); if (live) c = live; } catch (e) { /* keep curated fallback */ } }
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
  const slug = c.name.toLowerCase().replace(/\s+/g, "");
  return { type: "exam", accent: "#1D4ED8", category: c.name.toUpperCase(), flagCountry: c.name, headline: c.name, sub: c.tagline || "Study-abroad destination", stats: stats.slice(0, 6), cta: "Full country guide — link in bio  →",
    caption: `🌍 Why study in ${c.name}? ${c.flag || ""}\n\n${c.tagline || ""}\n${c.avgTuition ? "💰 Tuition: " + c.avgTuition + "\n" : ""}${c.postStudyWork ? "💼 Post-study work: " + c.postStudyWork + "\n" : ""}${c.prTimeline ? "🛂 PR: " + c.prTimeline + "\n" : ""}\n📲 TAG someone considering ${c.name}.\n📌 SAVE this. 💬 Is ${c.name} on your list? 👇\n\n👉 Full ${c.name} guide — link in bio.\nFollow ${HANDLE} for daily study-abroad guides 🌍`,
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
function pickCountryOrCollege(seed) { return (seed % 2 ? pickCountryHighlight(seed) : pickCollegeSpotlight(seed)) || pickCountryHighlight(seed) || pickCollegeSpotlight(seed); }
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
];
function pickScholarship(seed) {
  const s = SCHOLARSHIPS[seed % SCHOLARSHIPS.length];
  const stats = [{ v: clip(s.award, 16), label: "Award" }, { v: s.level, label: "Level" }, { v: s.country, label: "Study in" }, { v: s.apply, label: "Apply by" }, { v: "FREE", label: "Application" }, { v: clip(s.who, 16), label: "Open to" }];
  const slug = s.country.toLowerCase().replace(/\s+/g, "");
  return { type: "exam", accent: "#0E9F6E", category: "SCHOLARSHIP", flagCountry: ISO[s.country.toLowerCase()] ? s.country : null, headline: s.n, sub: s.full + " · " + s.country, stats, cta: "Free scholarship guide — link in bio  →",
    caption: `💰 ${s.full} (${s.country})\n\n🎓 Award: ${s.award}\n📚 Level: ${s.level}\n🗓 Apply by: ${s.apply}\n✅ For: ${s.who}\n\n📲 TAG a friend who should apply. 📌 SAVE this.\n💬 Applying this year? Comment 👇\n\n👉 Free scholarships guide — link in bio.\nFollow ${HANDLE} for daily funding alerts 💸`,
    tags: buildTags("scholarships", "studyin" + slug, "studyabroad", "fullyfunded", "landingprep") };
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
const CAROUSEL_SLOT = 5;
const SLOT_PICKERS = [pickImmigrationNews, pickQuiz, pickCountryOrCollege, pickEducationNews, pickWordOfDay, null, pickExamSpotlight, pickTipOrSpotlight, pickScholarship, pickCostCompared];
function pickForSlot(now, slot) {
  slot = ((Number(slot) || 0) % SLOTS + SLOTS) % SLOTS;
  if (slot === CAROUSEL_SLOT) return null;
  const seed = dayNumber(now) * 8 + slot * 131;
  const chain = [SLOT_PICKERS[slot], pickQuiz, pickWordOfDay, pickImmigrationNews];
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
    s += `<rect x="${x}" y="${by}" width="${bw}" height="${bh}" rx="22" fill="${BR_CARD}"/>`;
    s += `<text x="${x + 30}" y="${by + Math.round(bh / 2) + 4}" font-family="${FONT}" font-size="${bh > 150 ? 42 : 35}" font-weight="900" fill="${a}">${esc(stripEmoji(String(box.v)))}</text>`;
    s += `<text x="${x + 30}" y="${by + bh - 26}" font-family="${FONT}" font-size="21" font-weight="800" fill="${BR_SUB}" letter-spacing="0.5">${esc(String(box.label).toUpperCase())}</text>`;
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
// render any single post in the bright style + composite its country flag into the category pill
async function renderContentPng(c) {
  if (!sharp) throw new Error("sharp not installed");
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
  const cr = await fetch(`https://graph.facebook.com/${v}/${igUserId}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }) });
  const cj = await cr.json(); if (!cr.ok || !cj.id) throw new Error("IG container failed: " + JSON.stringify(cj));
  await new Promise((r) => setTimeout(r, 4000));
  const pr = await fetch(`https://graph.facebook.com/${v}/${igUserId}/media_publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creation_id: cj.id, access_token: token }) });
  const pj = await pr.json(); if (!pr.ok || !pj.id) throw new Error("IG publish failed: " + JSON.stringify(pj));
  return { containerId: cj.id, mediaId: pj.id };
}
async function whoami({ token }) {
  if (!token) throw new Error("Missing IG_ACCESS_TOKEN env");
  const r = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`);
  const j = await r.json(); if (j.error) return { error: j.error };
  return { pages: (j.data || []).map((p) => ({ page: p.name, pageId: p.id, igUserId: p.instagram_business_account && p.instagram_business_account.id, igUsername: p.instagram_business_account && p.instagram_business_account.username })), hint: "Copy 'igUserId' into your Render IG_USER_ID env var." };
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
    const r = await fetch(`https://graph.facebook.com/${v}/${igUserId}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image_url: url, is_carousel_item: true, access_token: token }) });
    const j = await r.json(); if (!r.ok || !j.id) throw new Error("carousel child failed: " + JSON.stringify(j));
    children.push(j.id); await new Promise((r) => setTimeout(r, 2500));
  }
  const cr = await fetch(`https://graph.facebook.com/${v}/${igUserId}/media`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ media_type: "CAROUSEL", children: children.join(","), caption, access_token: token }) });
  const cj = await cr.json(); if (!cr.ok || !cj.id) throw new Error("carousel container failed: " + JSON.stringify(cj));
  await new Promise((r) => setTimeout(r, 4000));
  const pr = await fetch(`https://graph.facebook.com/${v}/${igUserId}/media_publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ creation_id: cj.id, access_token: token }) });
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

module.exports = { pickForSlot, slotFromHour, buildSvg, renderPng, buildCaption, generateDailyImage, postToInstagram, runDailyPost, runAllSlots, generateCarousel, postCarousel, runCarousel, whoami, listPool, runPoolPost, SLOTS, CAROUSEL_SLOT, OUT_DIR, POOL_DIR };
