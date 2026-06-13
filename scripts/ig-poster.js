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

// ── content pickers (one per slot) ───────────────────────────────────────
function pickImmigrationNews(seed) {
  const N = newsItems(); if (!N.length) return null;
  const n = N[seed % N.length]; const T = THEME.immig;
  return { type: "bulletin", bg: T.bg, accent: T.accent, category: "VISA NEWS · " + n.country.toUpperCase(),
    headline: clip(n.text, 116), highlight: [n.country], sub: "", cta: "Full guide → link in bio",
    icons: [{ glyph: "doc", label: "What changed" }, { glyph: "check", label: "Who qualifies" }, { glyph: "globe", label: "How to apply" }],
    caption: `🚨 Visa & immigration update — ${n.country} ${n.flag}${n.date ? " (" + n.date + ")" : ""}\n\n${n.text}\n\nFollow ${HANDLE} for daily study-abroad & visa news 🌍\nFull country guides — link in bio 🔗`,
    tags: ["immigration", "studentvisa", "studyabroad", "visaupdate", "immigrationnews", "study" + n.country.toLowerCase().replace(/\s+/g, ""), "prpathway", "internationalstudents"] };
}
function pickEducationNews(seed) {
  const B = blogPosts(); if (!B.length) return null;
  const edu = B.filter((p) => /university|scholar|study|admission|guide|country|sop|application|career|exam|ielts|gre|gmat/i.test((p.tag || "") + " " + p.title));
  const pool = edu.length ? edu : B; const p = pool[seed % pool.length]; const T = THEME.edu;
  return { type: "bulletin", bg: T.bg, accent: T.accent, category: (p.tag || "STUDY ABROAD").toUpperCase(),
    headline: clip(p.title, 100), highlight: [], sub: clip(p.excerpt, 120), cta: "Read free → link in bio",
    icons: [{ glyph: "cap", label: "Requirements" }, { glyph: "calendar", label: "Deadlines" }, { glyph: "globe", label: "Apply free" }],
    caption: `📚 ${p.title}\n\n${(p.excerpt || "").slice(0, 200)}\n\nRead the full free guide — link in bio 🔗\nFollow ${HANDLE} for daily study-abroad tips`,
    tags: ["studyabroad", "studyabroadnews", (p.tag || "study").toLowerCase().replace(/\s+/g, ""), "internationalstudents", "studentlife", "scholarships", "universityadmission"] };
}
function quizFrom(seedCat, question, raw, ansIdx, tags, examTag, hl) {
  const L = ["A", "B", "C", "D"]; const T = THEME.quiz;
  const ord = [0, 1, 2, 3].slice(0, raw.length).sort((a, b) => ((ansIdx * 31 + a * 17) % 101) - ((ansIdx * 31 + b * 17) % 101));
  const options = ord.map((i, k) => ({ L: L[k], text: raw[i], correct: i === ansIdx }));
  const ans = (options.find((o) => o.correct) || options[0]).L;
  return { type: "quiz", bg: T.bg, accent: T.accent, category: seedCat, question, highlight: hl || [], options, answerLetter: ans,
    caption: `🧠 ${examTag} quiz!\n\n${question}\n\n${options.map((o) => o.L + ") " + o.text).join("\n")}\n\nDrop your answer in the comments 👇\nFollow ${HANDLE} for a daily question · free practice in bio 🔗\n.\n.\n.\n✅ Answer: ${ans}`,
    tags };
}
function pickQuiz(seed) {
  // alternate vocab MCQ and real exam questions
  if (seed % 2 === 0) {
    const W = vocabWords(); if (W.length >= 4) {
      const w = W[seed % W.length]; const d = [];
      for (let i = 1; d.length < 3 && i < W.length; i++) { const o = W[(seed + i * 41) % W.length]; if (o.w !== w.w && o.def && !d.find((x) => x.def === o.def)) d.push(o); }
      if (d.length === 3) { const raw = [w.def, d[0].def, d[1].def, d[2].def].map((x) => x.length > 52 ? x.slice(0, 50).replace(/\s\S*$/, "") + "…" : x);
        return quizFrom("VOCAB QUIZ · IELTS · GRE", `What does “${cap(w.w)}” mean?`, raw, 0, ["ielts", "gre", "vocabularyquiz", "englishquiz", "studyabroad", "ieltspreparation", "wordpower", "dailyquiz"], "Vocabulary", [cap(w.w)]); }
    }
  }
  const Bq = bankQuestions(); if (Bq.length) { const q = Bq[seed % Bq.length];
    return quizFrom(q.exam + " PRACTICE QUESTION", q.question, q.options, q.ai, [q.exam.toLowerCase(), q.exam.toLowerCase() + "prep", "examquiz", "studyabroad", "testprep", "dailyquiz"], q.exam, [q.exam]); }
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
    caption: `🎯 The ${name} exam, explained.\n\n${e.totalDuration ? "⏱ Duration: " + e.totalDuration + "\n" : ""}${e.scoring ? "📊 Scoring: " + e.scoring + "\n" : ""}${secNames ? "📝 Sections: " + secNames + "\n" : ""}\nTake a FREE full-length ${name} mock test — link in bio 🔗\nFollow ${HANDLE} for daily exam prep`,
    tags: [k.toLowerCase(), k.toLowerCase() + "preparation", "examprep", "studyabroad", "testprep", "mocktest", k.toLowerCase() + "exam"] };
}
function pickWordOfDay(seed) {
  const W = vocabWords(); if (!W.length) return null;
  const w = W[(seed * 7) % W.length]; const T = THEME.vocab;
  return { type: "vocab", bg: T.bg, accent: T.accent, category: "WORD OF THE DAY",
    word: cap(w.w), pos: w.pos || "", def: w.def, ex: w.ex || "", syn: w.syn || "", highlight: [],
    cta: "Free vocab decks → link in bio",
    caption: `📖 Word of the day: ${cap(w.w)} ${w.pos ? "(" + w.pos + ")" : ""}\n\n${w.def}${w.ex ? "\n\n📝 “" + w.ex + "”" : ""}${w.syn ? "\n\nSimilar: " + w.syn : ""}\n\nSave this for your IELTS/GRE prep 🔖 — free vocab decks in bio 🔗\nFollow ${HANDLE} for a word every day`,
    tags: ["ielts", "gre", "toefl", "vocabulary", "wordoftheday", "englishvocabulary", "studyabroad", "ieltspreparation"] };
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
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
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
function pillSolid(x, y, text, fill) { const t = stripEmoji(text), w = 34 + t.length * 14; return `<rect x="${x}" y="${y}" rx="11" width="${w}" height="48" fill="${fill}"/><text x="${x + 17}" y="${y + 32}" font-family="${FONT}" font-size="22" font-weight="900" letter-spacing="1.2" fill="#fff">${esc(t.toUpperCase())}</text>`; }
function header(c) {
  return `<text x="64" y="92" font-family="${FONT}" font-size="30" font-weight="900" fill="${c.accent}">▲ LandingPrep</text>` +
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
function renderBulletin(c) {
  const gold = "#F6C75A", red = c.accent || "#E0492B";
  const big = (c.headline || "").length;
  const size = big > 95 ? 56 : big > 58 ? 66 : 80;
  const maxChars = Math.round(1020 / (size * 0.50));
  const h = richLines(c.headline, c.highlight, 64, 230, size, maxChars, gold, "#FFFFFF", 4);
  let body = h.svg, y = h.endY + 16;
  if (c.sub) { const sl = wrapPlain(c.sub, 56).slice(0, 2); body += `<text font-family="${FONT}" font-size="28" font-weight="500" fill="#AEB6C6">${tspans(sl, 64, y + 14, 40)}</text>`; }
  const icons = c.icons || [{ glyph: "doc", label: "What's new" }, { glyph: "check", label: "Who qualifies" }, { glyph: "globe", label: "How to apply" }];
  body += calloutRow(icons, 838, gold, "#E6EAF2");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><linearGradient id="bgd" x1="0" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#101934"/><stop offset="1" stop-color="#080B16"/></linearGradient></defs>
  <rect width="1080" height="1080" fill="url(#bgd)"/>
  <circle cx="1010" cy="70" r="270" fill="${red}" opacity="0.12"/><circle cx="70" cy="1010" r="230" fill="${gold}" opacity="0.06"/>
  <text x="64" y="92" font-family="${FONT}" font-size="29" font-weight="900" fill="#FFFFFF">▲ LandingPrep</text>
  <text x="1016" y="92" text-anchor="end" font-family="${FONT}" font-size="23" font-weight="700" fill="#7E8AA3">${HANDLE}</text>
  ${pillSolid(64, 122, c.category, red)}
  ${body}
  <rect x="0" y="980" width="1080" height="100" fill="${red}"/>
  <text x="64" y="1043" font-family="${FONT}" font-size="31" font-weight="900" fill="#ffffff">${SITE}</text>
  <text x="1016" y="1043" text-anchor="end" font-family="${FONT}" font-size="25" font-weight="700" fill="rgba(255,255,255,0.92)">${esc(stripEmoji(c.cta || "Full guide in bio"))}</text>
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
  const c = pickForSlot(now, slot); if (!c) throw new Error("no content for slot " + slot);
  const png = await renderPng(buildSvg(c));
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

module.exports = { pickForSlot, slotFromHour, buildSvg, renderPng, buildCaption, generateDailyImage, postToInstagram, runDailyPost, runAllSlots, whoami, SLOTS, OUT_DIR };
