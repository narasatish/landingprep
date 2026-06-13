"use strict";
/*
 * LandingPrep — daily Instagram auto-poster engine (v2: pro layouts + engaging content).
 * Content the audience actually engages with — pulled from the site's OWN data:
 *   • QUIZ cards    — vocab MCQ + real exam questions (IELTS/GRE/GMAT), A/B/C/D options
 *   • VOCAB cards   — word-of-the-day flashcards
 *   • NEWS cards    — real study-abroad / immigration updates
 * Renders a 1080x1080 "white card on gradient" image and publishes via the Instagram Graph API.
 * Triggered daily by server.js (POST /api/ig/post-daily) + a GitHub Action cron.
 */
const fs = require("fs");
const path = require("path");
let sharp = null;
try { sharp = require("sharp"); } catch (e) { /* installed at deploy time */ }

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "ig-out");
const HANDLE = "@landing_prep";
const FONT = "Inter, 'Segoe UI', 'DejaVu Sans', Arial, sans-serif";
const ACCENT = { quiz: ["#4F46E5", "#7C3AED"], vocab: ["#0EA5E9", "#0369A1"], news: ["#F97316", "#EA580C"], tip: ["#7C3AED", "#5B21B6"] };

// ── data loaders (cached, guarded) ───────────────────────────────────────
function evalWindow(file) { try { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, file), "utf8"))(w); return w; } catch (e) { return {}; } }
function loadJSON(file) { try { return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8").replace(/^﻿/, "")); } catch (e) { return null; } }
const cap = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);

let _words = null, _news = null, _bank = null;
function vocabWords() {
  if (_words) return _words;
  const V = loadJSON("data/vocab-topics.json") || {}; _words = [];
  for (const t of Object.values(V)) for (const w of (t.words || [])) if (w && w.w && w.def) _words.push(w);
  return _words;
}
function newsItems() {
  if (_news) return _news;
  const D = evalWindow("country-data.jsx").LP_COUNTRY_DATA || []; _news = [];
  for (const c of D) for (const ch of (c.changes || [])) if (ch && (ch.t || typeof ch === "string"))
    _news.push({ country: c.name, flag: c.flag || "", date: ch.d || "", text: ch.t || String(ch) });
  return _news;
}
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
          if (ot.slice(0, 4).every((t) => t && t.length <= 56)) {
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

// ── content pickers ──────────────────────────────────────────────────────
function pickVocab(seed) {
  const W = vocabWords(); if (!W.length) return null;
  const w = W[seed % W.length];
  return { type: "vocab", accent: ACCENT.vocab, category: "WORD OF THE DAY",
    word: cap(w.w), pos: w.pos || "", def: w.def, ex: w.ex || "", syn: w.syn || "",
    caption: `📖 Word of the day: ${cap(w.w)} ${w.pos ? "(" + w.pos + ")" : ""}\n\n${w.def}${w.ex ? "\n\n📝 " + w.ex : ""}${w.syn ? "\n\nSimilar: " + w.syn : ""}\n\nSave this for your IELTS/GRE prep 🔖 — free practice in bio 🔗`,
    tags: ["ielts", "toefl", "gre", "vocabulary", "wordoftheday", "studyabroad", "englishvocabulary", "ieltspreparation"] };
}
function quizFrom(category, question, raw, ansIdx, tags, examTag) {
  const L = ["A", "B", "C", "D"];
  const ord = [0, 1, 2, 3].slice(0, raw.length).sort((a, b) => ((ansIdx * 31 + a * 17) % 101) - ((ansIdx * 31 + b * 17) % 101));
  const options = ord.map((i, k) => ({ L: L[k], text: raw[i], correct: i === ansIdx }));
  const ans = (options.find((o) => o.correct) || options[0]).L;
  return { type: "quiz", accent: ACCENT.quiz, category, question, options, answerLetter: ans,
    caption: `🧠 ${examTag} quiz time!\n\n${question}\n\n${options.map((o) => o.L + ") " + o.text).join("\n")}\n\nDrop your answer in the comments 👇\nFollow ${HANDLE} for a daily question · free practice in bio 🔗\n.\n.\n.\n✅ Answer: ${ans}`,
    tags };
}
function pickVocabQuiz(seed) {
  const W = vocabWords(); if (W.length < 4) return null;
  const w = W[seed % W.length]; const distract = [];
  for (let i = 1; distract.length < 3 && i < W.length; i++) { const o = W[(seed + i * 41) % W.length]; if (o.w !== w.w && o.def && !distract.find((d) => d.def === o.def)) distract.push(o); }
  if (distract.length < 3) return null;
  const raw = [w.def, distract[0].def, distract[1].def, distract[2].def].map((d) => d.length > 54 ? d.slice(0, 52).replace(/\s\S*$/, "") + "…" : d);
  return quizFrom("VOCAB QUIZ · IELTS · GRE", `What does “${cap(w.w)}” mean?`, raw, 0,
    ["ielts", "gre", "vocabularyquiz", "englishquiz", "studyabroad", "ieltspreparation", "wordpower", "dailyquiz"], "Vocabulary");
}
function pickExamQuestion(seed) {
  const B = bankQuestions(); if (!B.length) return null;
  const q = B[seed % B.length];
  return quizFrom(q.exam + " PRACTICE QUESTION", q.question, q.options, q.ai,
    [q.exam.toLowerCase(), q.exam.toLowerCase() + "prep", "examquiz", "studyabroad", "testprep", "practicequestion", "dailyquiz"], q.exam);
}
function pickNews(seed) {
  const N = newsItems(); if (!N.length) return null;
  const n = N[seed % N.length];
  return { type: "news", accent: ACCENT.news, category: "STUDY-ABROAD NEWS",
    country: n.country, flag: n.flag, date: n.date, headline: n.text,
    caption: `📰 Study-abroad update${n.date ? " · " + n.date : ""} — ${n.country} ${n.flag}\n\n${n.text}\n\nFollow ${HANDLE} for daily study-abroad & visa news · full guides in bio 🔗`,
    tags: ["studyabroad", "studyabroadnews", "immigration", "studentvisa", "internationalstudents", "study" + String(n.country || "").toLowerCase().replace(/\s+/g, ""), "visaupdate"] };
}
const QUOTES = [
  "The future belongs to those who prepare for it today. — Malcolm X",
  "A different language is a different vision of life. — Federico Fellini",
  "Success is the sum of small efforts repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "Don't watch the clock; do what it does. Keep going.",
];
function pickTip(seed) {
  const EP = loadJSON("data/exam-patterns.json") || {}; const tips = [];
  for (const [k, e] of Object.entries(EP)) for (const t of (e.tips || [])) tips.push({ exam: k.toUpperCase(), tip: t });
  if (!tips.length) return null;
  const t = tips[seed % tips.length];
  return { type: "tip", accent: ACCENT.tip, category: t.exam + " TIP", headline: t.tip, lines: [],
    caption: `🎯 ${t.exam} tip:\n\n${t.tip}\n\nFree full-length ${t.exam} mock test — link in bio 🔗\nFollow ${HANDLE} for daily tips`,
    tags: [t.exam.toLowerCase(), "examtips", "studyabroad", "testprep", "studygram", "ieltspreparation"] };
}
function pickQuote(seed) {
  const q = QUOTES[seed % QUOTES.length];
  return { type: "tip", accent: ACCENT.tip, category: "MOTIVATION", headline: "“" + q.split(" — ")[0] + "”", lines: q.includes(" — ") ? ["— " + q.split(" — ")[1]] : [],
    caption: `${q}\n\nFree mock tests, guides & a college predictor — link in bio 🔗\nFollow ${HANDLE} for daily study-abroad motivation`,
    tags: ["motivation", "studyabroad", "studymotivation", "ielts", "studygram", "dreambig"] };
}

// weekday → ordered theme chain (first that yields content wins)
function pickContent(now) {
  now = now || new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const doy = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start) / 86400000);
  const map = {
    0: [pickVocabQuiz, pickNews, pickVocab],      // Sun — quiz
    1: [pickVocabQuiz, pickExamQuestion, pickVocab], // Mon — quiz
    2: [pickNews, pickVocab, pickVocabQuiz],      // Tue — news
    3: [pickVocab, pickVocabQuiz, pickNews],      // Wed — word of day
    4: [pickExamQuestion, pickVocabQuiz, pickNews], // Thu — exam quiz
    5: [pickNews, pickTip, pickVocabQuiz],        // Fri — news
    6: [pickVocab, pickVocabQuiz, pickNews],      // Sat — word of day
  };
  for (const fn of (map[now.getUTCDay()] || [pickVocabQuiz])) { const r = fn(doy); if (r) return r; }
  return pickVocab(doy) || pickQuote(doy);
}

// ── image (1080x1080, white card on gradient) ────────────────────────────
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function stripEmoji(s) {
  return String(s == null ? "" : s)
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "").replace(/[\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/[\u{2190}-\u{21FF}]/gu, "").replace(/[\u{FE00}-\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
}
function wrap(text, max) {
  const words = stripEmoji(text).split(/\s+/); const out = []; let line = "";
  for (const w of words) { if ((line + " " + w).trim().length > max) { if (line) out.push(line.trim()); line = w; } else line = (line + " " + w).trim(); }
  if (line) out.push(line.trim()); return out;
}
function tspans(lines, x, y0, lh) { return lines.map((l, i) => `<tspan x="${x}" y="${y0 + i * lh}">${esc(l)}</tspan>`).join(""); }
function hexA(hex, a) { const m = hex.replace("#", ""); return `rgba(${parseInt(m.slice(0, 2), 16)},${parseInt(m.slice(2, 4), 16)},${parseInt(m.slice(4, 6), 16)},${a})`; }
function pill(x, y, text, fill, tcol) {
  const t = stripEmoji(text), w = 30 + t.length * 14.5;
  return `<rect x="${x}" y="${y}" rx="21" ry="21" width="${w}" height="42" fill="${fill}"/><text x="${x + 16}" y="${y + 28}" font-family="${FONT}" font-size="21" font-weight="800" letter-spacing="1.5" fill="${tcol}">${esc(t)}</text>`;
}

function renderQuiz(c) {
  const a1 = c.accent[0];
  const qLines = wrap(c.question, 30).slice(0, 3);
  const qY = 312; let y = qY + qLines.length * 58 + 28;
  const opts = (c.options || []).slice(0, 4); const boxH = opts.length >= 4 ? 100 : 116;
  let rows = "";
  for (const o of opts) {
    const tl = wrap(o.text, 40).slice(0, 2);
    rows += `<rect x="128" y="${y}" width="824" height="${boxH}" rx="20" fill="${hexA(a1, 0.06)}" stroke="${hexA(a1, 0.16)}" stroke-width="1.5"/>`;
    rows += `<circle cx="186" cy="${y + boxH / 2}" r="27" fill="${a1}"/><text x="186" y="${y + boxH / 2 + 9}" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="800" fill="#fff">${o.L}</text>`;
    rows += `<text font-family="${FONT}" font-size="27" fill="#1f2937" font-weight="500">${tspans(tl, 236, y + (boxH - (tl.length - 1) * 34) / 2 + 9, 34)}</text>`;
    y += boxH + 14;
  }
  return `<text font-family="${FONT}" font-size="52" font-weight="800" fill="#0f172a" letter-spacing="-0.5">${tspans(qLines, 128, qY, 58)}</text>${rows}`;
}
function renderVocab(c) {
  const a1 = c.accent[0];
  const wl = wrap(c.word, 16).slice(0, 2); const ws = wl.length > 1 ? 66 : 88;
  let y = 300, s = `<text font-family="${FONT}" font-size="${ws}" font-weight="800" fill="#0f172a" letter-spacing="-1">${tspans(wl, 128, y + ws * 0.72, ws * 1.02)}</text>`;
  y += wl.length * ws * 1.02 + 6;
  if (c.pos) { s += `<text x="128" y="${y}" font-family="${FONT}" font-size="30" font-weight="700" font-style="italic" fill="${a1}">${esc(c.pos)}</text>`; y += 52; }
  const dl = wrap(c.def, 40).slice(0, 4); const dh = dl.length * 46 + 44;
  s += `<rect x="128" y="${y}" width="824" height="${dh}" rx="20" fill="${hexA(a1, 0.08)}"/><text font-family="${FONT}" font-size="32" fill="#1f2937" font-weight="500">${tspans(dl, 162, y + 58, 46)}</text>`;
  y += dh + 34;
  if (c.ex) { const el = wrap("“" + c.ex + "”", 46).slice(0, 3); s += `<text font-family="${FONT}" font-size="28" fill="#475569" font-style="italic">${tspans(el, 128, y + 30, 40)}</text>`; y += el.length * 40 + 34; }
  if (c.syn) s += pill(128, y, "SIMILAR: " + c.syn, hexA(a1, 0.14), a1);
  return s;
}
function renderNews(c) {
  const a1 = c.accent[0];
  let s = pill(128, 280, esc(stripEmoji(c.country)) + (c.date ? " · " + esc(c.date) : ""), hexA(a1, 0.14), a1);
  const hl = wrap(c.headline, 28).slice(0, 6);
  s += `<text font-family="${FONT}" font-size="48" font-weight="800" fill="#0f172a" letter-spacing="-0.5">${tspans(hl, 128, 380, 58)}</text>`;
  return s;
}
function renderTip(c) {
  const hl = wrap(c.headline, 24).slice(0, 6); let y = 330;
  let s = `<text font-family="${FONT}" font-size="56" font-weight="800" fill="#0f172a" letter-spacing="-1">${tspans(hl, 128, y, 66)}</text>`;
  y += hl.length * 66 + 24;
  for (const l of (c.lines || [])) { const ll = wrap(l, 40).slice(0, 2); s += `<text font-family="${FONT}" font-size="30" fill="#475569">${tspans(ll, 128, y + 30, 42)}</text>`; y += ll.length * 42 + 18; }
  return s;
}
function buildSvg(c) {
  const a1 = (c.accent || ACCENT.tip)[0], a2 = (c.accent || ACCENT.tip)[1];
  const inner = c.type === "quiz" ? renderQuiz(c) : c.type === "vocab" ? renderVocab(c) : c.type === "news" ? renderNews(c) : renderTip(c);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a1}"/><stop offset="1" stop-color="${a2}"/></linearGradient></defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <circle cx="980" cy="100" r="300" fill="#fff" opacity="0.08"/><circle cx="110" cy="985" r="250" fill="#fff" opacity="0.06"/>
  <rect x="44" y="44" rx="48" ry="48" width="992" height="992" fill="#ffffff"/>
  <text x="128" y="170" font-family="${FONT}" font-size="30" font-weight="800" fill="${a1}">▲ LandingPrep</text>
  ${pill(128, 200, c.category, hexA(a1, 0.12), a1)}
  ${inner}
  <line x1="128" y1="908" x2="952" y2="908" stroke="#EEF1F6" stroke-width="2"/>
  <text x="128" y="952" font-family="${FONT}" font-size="27" font-weight="800" fill="#0f172a">${HANDLE}${c.type === "quiz" ? "    ·    Answer in the comments" : ""}</text>
  <text x="128" y="984" font-family="${FONT}" font-size="21" fill="#64748b">Follow for daily IELTS · GRE · GMAT · study-abroad updates</text>
</svg>`;
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
async function generateDailyImage({ baseUrl, now }) {
  const c = pickContent(now); const png = await renderPng(buildSvg(c));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  try { for (const f of fs.readdirSync(OUT_DIR)) { const fp = path.join(OUT_DIR, f); if (Date.now() - fs.statSync(fp).mtimeMs > 7200000) fs.unlinkSync(fp); } } catch (e) {}
  const name = `post-${Date.now()}.png`; fs.writeFileSync(path.join(OUT_DIR, name), png);
  return { content: c, caption: buildCaption(c), file: name, imageUrl: `${(baseUrl || "").replace(/\/$/, "")}/ig-out/${name}` };
}
async function runDailyPost({ baseUrl, igUserId, token, now }) {
  if (!igUserId || !token) throw new Error("Missing IG_USER_ID or IG_ACCESS_TOKEN env");
  const gen = await generateDailyImage({ baseUrl, now });
  const res = await postToInstagram({ imageUrl: gen.imageUrl, caption: gen.caption, igUserId, token });
  return { ok: true, mediaId: res.mediaId, theme: gen.content.type + ":" + gen.content.category, imageUrl: gen.imageUrl };
}

module.exports = { pickContent, buildSvg, renderPng, buildCaption, generateDailyImage, postToInstagram, runDailyPost, whoami, OUT_DIR };
