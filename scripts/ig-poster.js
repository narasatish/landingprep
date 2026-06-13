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
function buildTags() {
  const out = [];
  for (let i = 0; i < arguments.length; i++) { const a = Array.isArray(arguments[i]) ? arguments[i] : [arguments[i]]; for (const t of a) { const x = String(t || "").toLowerCase().replace(/[^a-z0-9]/g, ""); if (x && !out.includes(x)) out.push(x); } }
  return out.slice(0, 5);
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
  const secNames = (e.sections || []).map((s) => s.name).filter(Boolean).slice(0, 4).join(" · ");
  return { type: "exam", bg: T.bg, accent: T.accent, category: name + " EXAM GUIDE",
    headline: name, sub: secNames, stats, highlight: [], cta: "Free " + name + " mock → link in bio",
    caption: `🎯 The ${name} exam, explained 👇\n\n${e.totalDuration ? "⏱ Duration: " + e.totalDuration + "\n" : ""}${e.scoring ? "📊 Scoring: " + e.scoring + "\n" : ""}${secNames ? "📝 Sections: " + secNames + "\n" : ""}\n📲 TAG someone preparing for ${name}.\n📌 SAVE this — you'll need it.\n💬 Which exam are you taking? Comment 👇\n\n👉 FREE full-length ${name} mock test — link in bio.\nFollow ${HANDLE} for daily exam prep 📚`,
    tags: buildTags(k.toLowerCase(), k.toLowerCase() + "preparation", "examprep", "mocktest", "landingprep") };
}
function pickWordOfDay(seed) {
  const W = vocabWords(); if (!W.length) return null;
  const w = W[(seed * 7) % W.length]; const T = THEME.vocab;
  return { type: "vocab", bg: T.bg, accent: T.accent, category: "WORD OF THE DAY",
    word: cap(w.w), pos: w.pos || "", def: w.def, ex: w.ex || "", syn: w.syn || "", highlight: [],
    cta: "Free vocab decks → link in bio",
    caption: `📖 WORD OF THE DAY: ${cap(w.w)} ${w.pos ? "(" + w.pos + ")" : ""}\n\n${w.def}${w.ex ? "\n\n📝 “" + w.ex + "”" : ""}${w.syn ? "\n\n🔁 Similar: " + w.syn : ""}\n\n📲 TAG a study buddy who's building their vocab.\n📌 SAVE for your IELTS/GRE prep.\n💬 Use “${cap(w.w)}” in a sentence below 👇\n\n👉 Free vocab decks — link in bio.\nFollow ${HANDLE} for a new word daily 📚`,
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
const JUNK_RE = /school assembly|news headlines|top \d+ (news|stories|headlines)|round-?up|live updates?|current affairs|gk (questions?|quiz)|\bquiz\b|horoscope|cricket|\bipl\b|box office|recipe/i;
const REL = {
  immig: /visa|immigration|permit|\bpr\b|residen|migrant|citizenship|deport|express entry|graduate route|work right|sponsor/i,
  edu: /student|study|universit|colleg|scholarship|admission|abroad|tuition|campus|intake|enrol|fellowship|\bms\b|graduate/i,
};
const SPAM_RE = /prediction|click here|subscribe|sponsored|how to apply step|top \d+|best \d+|list of|\bvs\b|^\s*\d+\s|apply now|enquire|book (a )?free|consultanc|register now|limited seats/i;
async function liveNews(now, slot) {
  if (process.env.LIVE_NEWS === "0") return null;
  const kind = slot === 0 ? "immig" : "edu"; const seed = dayNumber(now);
  const list = RSS_Q[kind]; const items = await fetchNewsRSS(list[seed % list.length]);
  if (!items || !items.length) return null;
  const cleaned = items.map((it) => ({ src: it.source, date: it.date, t: cleanTitle(it.title) }));
  const good = cleaned.filter((it) => it.t.length >= 28 && it.t.length <= 110 && !JUNK_RE.test(it.t) && !SPAM_RE.test(it.t) && REL[kind].test(it.t) && !/[|/]/.test(it.t) && /^[\x20-\x7E''""–—…]+$/.test(it.t));
  if (!good.length) return null; // no clean headline → fall back to curated (handled by caller)
  const pick = good[seed % good.length];
  return rssToContent({ title: pick.t, source: pick.src, date: pick.date }, kind);
}
async function resolveDailyContent(now, slot) {
  let c = pickForSlot(now, slot);
  if ((slot === 0 || slot === 1)) { try { const live = await liveNews(now, slot); if (live) c = live; } catch (e) { /* keep curated fallback */ } }
  return c;
}

// day number since epoch (UTC) → stable per-day seed
function dayNumber(now) { now = now || new Date(); return Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 86400000); }
const SLOT_PICKERS = [pickImmigrationNews, pickEducationNews, pickQuiz, pickExamSpotlight, pickWordOfDay];
function pickForSlot(now, slot) {
  slot = ((Number(slot) || 0) % SLOTS + SLOTS) % SLOTS;
  const seed = dayNumber(now) * 5 + slot * 911; // unique per (day, slot); large stride avoids overlap
  const chain = [SLOT_PICKERS[slot], pickQuiz, pickWordOfDay, pickImmigrationNews];
  for (const fn of chain) { const r = fn(seed); if (r) return r; }
  return null;
}
function slotFromHour(now) { const h = (now || new Date()).getUTCHours(); return Math.min(SLOTS - 1, Math.floor(((h + 21) % 24) / (24 / SLOTS))); } // 03:30 UTC ≈ slot 0

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
  return logoMark(64, 64, 46, "color") + wordmark(64 + LOGOW(46) + 14, 100, 30, false) +
    `<text x="1016" y="92" text-anchor="end" font-family="${FONT}" font-size="24" font-weight="700" fill="#8A93A3">${HANDLE}</text>` +
    pillSolid(64, 124, c.category, c.accent);
}
function footer(c) {
  return `<rect x="0" y="980" width="1080" height="100" fill="${c.accent}"/>` +
    `<text x="64" y="1043" font-family="${FONT}" font-size="31" font-weight="900" fill="#ffffff">${SITE}</text>` +
    `<text x="1016" y="1043" text-anchor="end" font-family="${FONT}" font-size="25" font-weight="700" fill="rgba(255,255,255,0.92)">${esc(stripEmoji(c.cta || "100% free · link in bio"))}</text>`;
}
function doc(c, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <rect width="1080" height="1080" fill="${c.bg}"/>
  <circle cx="1010" cy="60" r="220" fill="${hexA(c.accent, 0.07)}"/><circle cx="70" cy="930" r="180" fill="${hexA(c.accent, 0.05)}"/>
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
  if (c.flagCountry) s += `<rect x="812" y="48" rx="12" width="220" height="152" fill="#ffffff"/>`;
  const big = (c.headline || "").length;
  const size = big > 96 ? 58 : big > 56 ? 70 : 84;
  const maxChars = Math.round(1040 / (size * 0.495));
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
function bulletinOverlaySvg(c) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><linearGradient id="sc" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#05070D" stop-opacity="0.42"/><stop offset="0.38" stop-color="#05070D" stop-opacity="0.12"/>
    <stop offset="0.58" stop-color="#05070D" stop-opacity="0.5"/><stop offset="0.8" stop-color="#05070D" stop-opacity="0.85"/>
    <stop offset="1" stop-color="#05070D" stop-opacity="0.98"/>
  </linearGradient></defs>
  <rect width="1080" height="1080" fill="url(#sc)"/>
  ${bulletinInner(c)}
</svg>`;
}
function renderQuiz(c) {
  const qLines = wrapRich(c.question, c.highlight, 28).slice(0, 3); const qY = 244, qSize = 50, lh = 58;
  let head = "", y = qY + qSize;
  for (const ln of qLines) { head += `<text x="64" y="${y}" xml:space="preserve" font-family="${FONT}" font-size="${qSize}" font-weight="800" fill="#14181F" letter-spacing="-0.8">${ln.map((w) => `<tspan${w.hi ? ` fill="${c.accent}" font-weight="900"` : ""}>${esc(w.t)} </tspan>`).join("")}</text>`; y += lh; }
  y += 28; const opts = (c.options || []).slice(0, 4); const boxH = 100;
  for (const o of opts) {
    const tl = wrapPlain(o.text, 40).slice(0, 2);
    head += `<rect x="64" y="${y}" width="952" height="${boxH}" rx="18" fill="#ffffff" stroke="${hexA(c.accent, 0.25)}" stroke-width="2"/>`;
    head += `<rect x="64" y="${y}" width="84" height="${boxH}" rx="18" fill="${c.accent}"/><rect x="120" y="${y}" width="28" height="${boxH}" fill="${c.accent}"/>`;
    head += `<text x="106" y="${y + boxH / 2 + 11}" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="900" fill="#fff">${o.L}</text>`;
    head += `<text font-family="${FONT}" font-size="28" font-weight="600" fill="#1f2937">${tspans(tl, 184, y + (boxH - (tl.length - 1) * 34) / 2 + 10, 34)}</text>`;
    y += boxH + 16;
  }
  head += `<text x="64" y="${Math.min(y + 30, 968)}" font-family="${FONT}" font-size="26" font-weight="800" fill="${c.accent}">Comment A, B, C or D below</text>`;
  return doc(c, head);
}
function renderExam(c) {
  let s = `<text x="64" y="380" font-family="${FONT}" font-size="170" font-weight="900" fill="#14181F" letter-spacing="-4">${esc(c.headline)}</text>`;
  s += `<text x="68" y="430" font-family="${FONT}" font-size="28" font-weight="700" fill="${c.accent}">${esc(stripEmoji(c.sub || ""))}</text>`;
  const st = (c.stats || []).slice(0, 4); const bw = 452, bh = 150, gx = 64, gy = 510, gap = 24;
  st.forEach((box, i) => { const x = gx + (i % 2) * (bw + gap), y = gy + Math.floor(i / 2) * (bh + gap);
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="20" fill="#ffffff" stroke="${hexA(c.accent, 0.18)}" stroke-width="2"/>`;
    s += `<text x="${x + 30}" y="${y + 82}" font-family="${FONT}" font-size="48" font-weight="900" fill="${c.accent}">${esc(stripEmoji(box.v))}</text>`;
    s += `<text x="${x + 30}" y="${y + 122}" font-family="${FONT}" font-size="24" font-weight="700" fill="#64748b" letter-spacing="1">${esc(box.label.toUpperCase())}</text>`;
  });
  return doc(c, s);
}
function renderVocab(c) {
  const wl = wrapPlain(c.word, 15).slice(0, 2); const ws = wl.length > 1 ? 84 : 116; let y = 250;
  let s = `<text font-family="${FONT}" font-size="${ws}" font-weight="900" fill="#14181F" letter-spacing="-2">${tspans(wl, 64, y + ws * 0.74, ws)}</text>`;
  y += wl.length * ws + 4;
  if (c.pos) { s += `<text x="66" y="${y}" font-family="${FONT}" font-size="32" font-weight="700" font-style="italic" fill="${c.accent}">${esc(c.pos)}</text>`; y += 56; }
  const dl = wrapPlain(c.def, 38).slice(0, 4); const dh = dl.length * 48 + 48;
  s += `<rect x="64" y="${y}" width="952" height="${dh}" rx="20" fill="${hexA(c.accent, 0.10)}"/><text font-family="${FONT}" font-size="34" font-weight="600" fill="#1f2937">${tspans(dl, 100, y + 60, 48)}</text>`;
  y += dh + 36;
  if (c.ex) { const el = wrapPlain("“" + c.ex + "”", 46).slice(0, 3); s += `<text font-family="${FONT}" font-size="29" font-weight="500" font-style="italic" fill="#475569">${tspans(el, 64, y + 30, 42)}</text>`; y += el.length * 42 + 34; }
  if (c.syn && y < 900) s += pillSolid(64, y, "SIMILAR: " + c.syn, hexA(c.accent, 0.85).replace("0.85", "1"));
  return doc(c, s);
}
function buildSvg(c) {
  return c.type === "bulletin" ? renderBulletin(c) : c.type === "quiz" ? renderQuiz(c) : c.type === "exam" ? renderExam(c) : c.type === "vocab" ? renderVocab(c) : renderHook(c);
}
async function renderPng(svg) { if (!sharp) throw new Error("sharp not installed — run: npm install sharp"); return await sharp(Buffer.from(svg)).png().toBuffer(); }

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
// render a "news" card: photo bg + scrim + text + country flag chip, else dark base
async function renderBulletinPng(c, seed) {
  if (!sharp) throw new Error("sharp not installed");
  const [photo, flag] = await Promise.all([fetchPexels(c.photoQuery, seed), c.flagCountry ? fetchFlag(c.flagCountry) : Promise.resolve(null)]);
  let base = null;
  if (photo) { try { base = sharp(photo).resize(1080, 1080, { fit: "cover", position: "attention", kernel: "lanczos3" }).modulate({ saturation: 1.14, brightness: 1.04 }).sharpen({ sigma: 0.8 }); } catch (e) { base = null; } }
  if (!base) base = sharp(Buffer.from(darkBaseSvg(c)));
  const comps = [{ input: Buffer.from(bulletinOverlaySvg(c)) }];
  if (flag) { try { const fb = await sharp(flag).resize(204, 136, { fit: "cover" }).png().toBuffer(); comps.push({ input: fb, top: 56, left: 820 }); } catch (e) {} }
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
  const png = c.type === "bulletin" ? await renderBulletinPng(c, seed) : await renderPng(buildSvg(c));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  try { for (const f of fs.readdirSync(OUT_DIR)) { const fp = path.join(OUT_DIR, f); if (Date.now() - fs.statSync(fp).mtimeMs > 7200000) fs.unlinkSync(fp); } } catch (e) {}
  const name = `post-${slot}-${Date.now()}.png`; fs.writeFileSync(path.join(OUT_DIR, name), png);
  return { content: c, slot, caption: buildCaption(c), file: name, imageUrl: `${(baseUrl || "").replace(/\/$/, "")}/ig-out/${name}` };
}
async function runDailyPost({ baseUrl, igUserId, token, now, slot }) {
  if (!igUserId || !token) throw new Error("Missing IG_USER_ID or IG_ACCESS_TOKEN env");
  const gen = await generateDailyImage({ baseUrl, now, slot });
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
function slideHeader(topic, accent, dark) {
  return logoMark(64, 60, 42, dark ? "white" : "color") + wordmark(64 + LOGOW(42) + 12, 94, 28, !!dark) + pillSolid(64, 116, topic, accent);
}
function carouselFooter(idx, total, accent, swipe) {
  return `<rect x="0" y="1004" width="1080" height="76" fill="${accent}"/>` +
    `<text x="64" y="1052" font-family="${FONT}" font-size="25" font-weight="900" fill="#fff">${SITE}</text>` +
    `<text x="1016" y="1052" text-anchor="end" font-family="${FONT}" font-size="24" font-weight="800" fill="rgba(255,255,255,0.95)">${swipe ? "SWIPE  ›" : idx + " / " + total}</text>`;
}
// numbered-points content slide (clean branded)
function slidePointsSvg(s) {
  const a = s.accent;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" fill="#F7F8FC"/><circle cx="1015" cy="70" r="230" fill="${hexA(a, 0.07)}"/>` + slideHeader(s.topic, a);
  const tl = wrapPlain(s.title, 24).slice(0, 2); let y = 232;
  svg += `<text font-family="${FONT}" font-size="58" font-weight="900" fill="#14181F" letter-spacing="-1">${tspans(tl, 64, y, 66)}</text>`;
  y += tl.length * 66 + 46;
  (s.points || []).slice(0, 5).forEach((p, i) => {
    const pl = wrapPlain(p, 36).slice(0, 2);
    svg += `<circle cx="100" cy="${y - 6}" r="32" fill="${a}"/><text x="100" y="${y + 4}" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="900" fill="#fff">${i + 1}</text>`;
    svg += `<text font-family="${FONT}" font-size="33" font-weight="500" fill="#1f2937">${tspans(pl, 156, y + (pl.length > 1 ? -8 : 4), 44)}</text>`;
    y += (pl.length > 1 ? 124 : 92);
  });
  return svg + carouselFooter(s.idx, s.total, a) + `</svg>`;
}
// final call-to-action slide
function slideCTASvg(s) {
  const a = s.accent;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${hexA(a, 0.82)}"/></linearGradient></defs>
  <rect width="1080" height="1080" fill="${a}"/><circle cx="900" cy="180" r="280" fill="rgba(255,255,255,0.07)"/><circle cx="150" cy="940" r="220" fill="rgba(255,255,255,0.06)"/>
  <text x="540" y="300" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="800" letter-spacing="3" fill="rgba(255,255,255,0.85)">FOUND THIS USEFUL?</text>
  <text x="540" y="452" text-anchor="middle" font-family="${FONT}" font-size="96" font-weight="900" fill="#fff" letter-spacing="-2">SAVE IT</text>
  <text x="540" y="560" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="700" fill="#fff">and share it with a friend</text>
  <text x="540" y="690" text-anchor="middle" font-family="${FONT}" font-size="40" font-weight="700" fill="rgba(255,255,255,0.92)">Follow ${HANDLE}</text>
  <text x="540" y="744" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="500" fill="rgba(255,255,255,0.85)">for a free daily study-abroad guide</text>
  <rect x="320" y="828" width="440" height="86" rx="43" fill="#fff"/><text x="540" y="883" text-anchor="middle" font-family="${FONT}" font-size="32" font-weight="900" fill="${a}">Full guide in bio</text>
  <text x="540" y="1010" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="900" fill="rgba(255,255,255,0.9)">LandingPrep · ${SITE}</text>
</svg>`;
}
// cover slide content (composited over a photo, or dark fallback)
function slideCoverContent(s) {
  const big = (s.title || "").length;
  const size = big > 44 ? 72 : 86;
  const lines = wrapRich(s.title, [], Math.round(1040 / (size * 0.5))).slice(0, 3);
  const lh = size * 1.06, lastB = 940, firstB = lastB - (lines.length - 1) * lh;
  let svg = lines.map((ln, i) => `<text x="60" y="${firstB + i * lh}" xml:space="preserve" font-family="${FONT}" font-size="${size}" font-weight="900" fill="#fff" letter-spacing="-1.5">${ln.map((w) => `<tspan>${esc(w.t)} </tspan>`).join("")}</text>`).join("");
  const kY = firstB - size - 26;
  if (s.sub) svg += `<text x="62" y="${kY}" font-family="${FONT}" font-size="26" font-weight="800" fill="#FFD66B">${esc(stripEmoji(s.sub))}</text>`;
  svg = centerLogo(kY - 70) + svg;
  svg += `<text x="540" y="978" text-anchor="middle" font-family="${FONT}" font-size="27" font-weight="900" letter-spacing="2" fill="rgba(255,255,255,0.92)">SWIPE TO SEE THE FULL GUIDE  ›</text>`;
  return svg;
}
function slideCoverOverlaySvg(s) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs><linearGradient id="scc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070D" stop-opacity="0.32"/><stop offset="0.42" stop-color="#05070D" stop-opacity="0.12"/><stop offset="0.66" stop-color="#05070D" stop-opacity="0.6"/><stop offset="1" stop-color="#05070D" stop-opacity="0.96"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#scc)"/>${slideCoverContent(s)}</svg>`;
}
function slideCoverDarkSvg(s) {
  const a = s.accent;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs><linearGradient id="cd" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#1A2444"/><stop offset="1" stop-color="#06090F"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#cd)"/><circle cx="840" cy="280" r="320" fill="${hexA(a, 0.14)}"/>${slideCoverContent(s)}</svg>`;
}
async function renderCoverPng(s, photoQuery, seed) {
  if (!sharp) throw new Error("sharp not installed");
  const photo = await fetchPexels(photoQuery, seed);
  if (photo) { try { return await sharp(photo).resize(1080, 1080, { fit: "cover", position: "attention", kernel: "lanczos3" }).modulate({ saturation: 1.1, brightness: 1.02 }).sharpen({ sigma: 0.8 }).composite([{ input: Buffer.from(slideCoverOverlaySvg(s)) }]).png({ quality: 100, compressionLevel: 9 }).toBuffer(); } catch (e) {} }
  return await sharp(Buffer.from(slideCoverDarkSvg(s))).png().toBuffer();
}
function buildCountryCarousel(c, seed) {
  const name = c.name, slug = name.toLowerCase().replace(/\s+/g, ""), total = 5, accent = "#E0492B";
  const costPoints = [c.avgTuition ? "Tuition: " + c.avgTuition : "", c.avgLiving ? "Living costs: " + c.avgLiving : "", c.postStudyWork ? "Post-study work: " + c.postStudyWork : "", c.visaSuccess ? "Visa success rate: ~" + c.visaSuccess + "%" : ""].filter(Boolean);
  const pr = (c.immigrationPlan && c.immigrationPlan.length ? c.immigrationPlan : (c.visaTypes || []).map((v) => v.name + (v.note ? ": " + v.note : ""))).slice(0, 5);
  return {
    topic: "STUDY ABROAD · " + name.toUpperCase(), accent, photoQuery: pickPhotoQuery(name, "edu"),
    slides: [
      { kind: "cover", title: "Study in " + name + " " + YEAR, sub: (c.tagline || "The complete guide").toUpperCase(), idx: 1, total },
      { kind: "points", title: "💰 What it costs", points: costPoints, idx: 2, total },
      { kind: "points", title: "Why " + name + "?", points: (c.whyStudy || []).slice(0, 4), idx: 3, total },
      { kind: "points", title: "Your visa & PR pathway", points: pr, idx: 4, total },
      { kind: "cta", idx: 5, total },
    ],
    caption: `🎓 STUDY IN ${name.toUpperCase()} — your complete ${YEAR} guide 👇\n\nSwipe ➡️ for tuition, living costs, why ${name}, and the full visa → PR pathway.\n\n📲 SHARE with someone planning to study in ${name}.\n📌 SAVE this guide for later.\n💬 Is ${name} on your list? Comment 👇\n\n👉 Full free ${name} guide — link in bio.\nFollow ${HANDLE} for a daily study-abroad guide 🌍`,
    tags: buildTags("study" + slug, "studentvisa", "studyabroad", "internationalstudents", "landingprep"),
  };
}
function pickCarousel(now) {
  const D = evalWindow("country-data.jsx").LP_COUNTRY_DATA || [];
  if (!D.length) return null;
  return buildCountryCarousel(D[dayNumber(now) % D.length], dayNumber(now));
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

module.exports = { pickForSlot, slotFromHour, buildSvg, renderPng, buildCaption, generateDailyImage, postToInstagram, runDailyPost, runAllSlots, generateCarousel, postCarousel, runCarousel, whoami, SLOTS, OUT_DIR };
