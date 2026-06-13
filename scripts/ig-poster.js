"use strict";
/*
 * LandingPrep — daily Instagram auto-poster engine.
 * Picks on-brand content from the site's OWN data (vocab, exams, countries, scholarships,
 * blog, universities), renders a 1080x1080 branded image, and publishes it to the linked
 * Instagram Business account via the official Instagram Graph API.
 *
 * Used by server.js (POST /api/ig/post-daily) which a daily GitHub Action triggers.
 * Nothing here ever fails hard — every content loader falls back so a post always goes out.
 */
const fs = require("fs");
const path = require("path");
let sharp = null;
try { sharp = require("sharp"); } catch (e) { /* installed at deploy time */ }

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "ig-out");
const BRAND = { a: "#4F46E5", b: "#7C3AED", ink: "#0f172a" };

// ── data loaders (guarded) ───────────────────────────────────────────────
function evalWindow(file) {
  try { const w = {}; new Function("window", fs.readFileSync(path.join(ROOT, file), "utf8"))(w); return w; }
  catch (e) { return {}; }
}
function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8").replace(/^﻿/, "")); }
  catch (e) { return null; }
}
const cap = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);

// ── content pickers (one per weekday theme) ──────────────────────────────
function pickVocab(seed) {
  const V = loadJSON("data/vocab-topics.json") || {};
  const words = [];
  for (const t of Object.values(V)) for (const w of (t.words || [])) if (w && w.w) words.push(w);
  if (!words.length) return null;
  const w = words[seed % words.length];
  return {
    label: "WORD OF THE DAY", headline: cap(w.w),
    sub: w.pos ? "(" + w.pos + ")" : "",
    lines: [w.def, w.ex ? "“" + w.ex + "”" : null].filter(Boolean),
    caption: `📖 Word of the day: ${cap(w.w)} ${w.pos ? "(" + w.pos + ")" : ""}\n\n${w.def}${w.ex ? "\n\nExample: " + w.ex : ""}${w.syn ? "\nBand-9 synonym: " + w.syn : ""}\n\nBuild your IELTS/TOEFL vocabulary free — link in bio 🔗`,
    tags: ["ielts", "toefl", "vocabulary", "wordoftheday", "studyabroad", "englishlearning", "ieltspreparation", "ieltsvocabulary"],
  };
}
function pickExamTip(seed) {
  const EP = loadJSON("data/exam-patterns.json") || {};
  const tips = [];
  for (const [k, e] of Object.entries(EP)) for (const tip of (e.tips || [])) tips.push({ exam: k.toUpperCase(), tip });
  if (!tips.length) return null;
  const t = tips[seed % tips.length];
  return {
    label: t.exam + " TIP", headline: t.exam + " tip of the day",
    lines: [t.tip],
    caption: `🎯 ${t.exam} tip:\n\n${t.tip}\n\nTake a FREE full-length ${t.exam} mock test on LandingPrep — link in bio 🔗`,
    tags: [t.exam.toLowerCase(), "examtips", "studyabroad", "testprep", "mocktest", "studygram", "ieltspreparation"],
  };
}
function pickCountry(seed) {
  const D = evalWindow("country-data.jsx").LP_COUNTRY_DATA || [];
  if (!D.length) return null;
  const c = D[seed % D.length];
  return {
    label: "STUDY ABROAD", headline: `Study in ${c.name} ${c.flag || ""}`.trim(),
    lines: [
      c.avgTuition ? "💰 Tuition: " + c.avgTuition : null,
      c.avgLiving ? "🏠 Living: " + c.avgLiving : null,
      c.postStudyWork ? "🛂 Post-study work: " + c.postStudyWork : null,
    ].filter(Boolean).slice(0, 3),
    caption: `🌍 Study in ${c.name} ${c.flag || ""}\n\n${c.avgTuition ? "💰 Tuition: " + c.avgTuition + "/yr\n" : ""}${c.avgLiving ? "🏠 Living: " + c.avgLiving + "/yr\n" : ""}${c.postStudyWork ? "🛂 Post-study work: " + c.postStudyWork + "\n" : ""}${c.visaSuccess ? "✅ Visa success ≈ " + c.visaSuccess + "%\n" : ""}\nFull guide: top universities, fees, visa & PR — link in bio 🔗`,
    tags: ["studyabroad", "study" + String(c.name || "").toLowerCase().replace(/\s+/g, ""), "studyin" + String(c.name || "").toLowerCase().replace(/\s+/g, ""), "internationalstudents", "studyabroadconsultant", "studentvisa"],
  };
}
function pickScholarship(seed) {
  const S = evalWindow("scholarship-data.jsx").LP_SCHOLARSHIPS || [];
  if (!S.length) return null;
  const s = S[seed % S.length];
  return {
    label: "SCHOLARSHIP", headline: s.name || "Scholarship spotlight",
    lines: [s.amount ? "💸 " + s.amount : null, s.country ? "📍 " + s.country : null, s.level ? "🎓 " + s.level : null].filter(Boolean).slice(0, 3),
    caption: `💸 Scholarship spotlight: ${s.name}\n\n${s.amount ? "Award: " + s.amount + "\n" : ""}${s.country ? "Where: " + s.country + "\n" : ""}${s.who ? "Who: " + s.who + "\n" : ""}\nFind scholarships that fit you free — link in bio 🔗`,
    tags: ["scholarship", "scholarships", "studyabroad", "fullyfunded", "fundedscholarship", "internationalstudents", "studyabroadscholarship"],
  };
}
function pickBlog(seed) {
  const B = (evalWindow("blog-data.jsx").LP_BLOG_EXTRA || []).filter((p) => p && p.id && p.title);
  if (!B.length) return null;
  const p = B[seed % B.length];
  return {
    label: "NEW GUIDE", headline: p.title,
    lines: [(p.excerpt || "").slice(0, 150)],
    caption: `📚 ${p.title}\n\n${(p.excerpt || "").slice(0, 200)}\n\nRead the full free guide — link in bio 🔗`,
    tags: ["studyabroad", "ielts", "studentvisa", "studyabroadtips", "examtips", "internationalstudents", "studygram"],
  };
}
function pickUni(seed) {
  const C = (evalWindow("college-data.jsx").LP_COLLEGES || []).filter((c) => c && c.name && c.ielts);
  if (!C.length) return null;
  const c = C[seed % C.length];
  return {
    label: "ENTRY REQUIREMENT", headline: `${c.name}`,
    lines: [`📊 IELTS ${c.ielts} · TOEFL ${c.toefl} · PTE ${c.pte}`, c.feeNote ? "💰 " + c.feeNote : null, c.acceptance ? "✅ " + c.acceptance + "% acceptance" : null].filter(Boolean).slice(0, 3),
    caption: `🎓 ${c.name} — entry requirements\n\n📊 IELTS ${c.ielts} | TOEFL ${c.toefl} | PTE ${c.pte}\n${c.feeNote ? "💰 Tuition: " + c.feeNote + "\n" : ""}${c.acceptance ? "✅ ~" + c.acceptance + "% acceptance\n" : ""}\nFees, deadlines & full admission guide — link in bio 🔗`,
    tags: ["studyabroad", "ielts", "universityadmission", "mastersabroad", "studentvisa", "internationalstudents", "studyabroadconsultant"],
  };
}
const QUOTES = [
  { q: "The future belongs to those who prepare for it today.", a: "Malcolm X" },
  { q: "A different language is a different vision of life.", a: "Federico Fellini" },
  { q: "Education is the passport to the future.", a: "Malcolm X" },
  { q: "Success is the sum of small efforts repeated day in and day out.", a: "Robert Collier" },
  { q: "The expert in anything was once a beginner.", a: "Helen Hayes" },
  { q: "Don't watch the clock; do what it does. Keep going.", a: "Sam Levenson" },
  { q: "Study abroad: invest in the trip that pays you back for life.", a: "LandingPrep" },
];
function pickQuote(seed) {
  const x = QUOTES[seed % QUOTES.length];
  return {
    label: "MOTIVATION", headline: "“" + x.q + "”", sub: "— " + x.a, lines: [],
    caption: `“${x.q}”\n— ${x.a}\n\nYour study-abroad goal is closer than you think. Free mock tests, guides & a college predictor — link in bio 🔗`,
    tags: ["motivation", "studyabroad", "studymotivation", "ielts", "studentlife", "studygram", "dreambig"],
  };
}

// Deterministic daily content: weekday → theme, day-of-year → which item (so it cycles).
function pickContent(now) {
  now = now || new Date();
  const dow = now.getUTCDay();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const doy = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start) / 86400000);
  const order = [pickQuote, pickVocab, pickExamTip, pickCountry, pickScholarship, pickBlog, pickUni]; // Sun..Sat
  const chain = [order[dow], pickVocab, pickExamTip, pickCountry, pickBlog, pickQuote]; // fallbacks
  for (const fn of chain) { const r = fn(doy); if (r) return r; }
  return pickQuote(doy);
}

// ── image (1080x1080 branded SVG → PNG) ──────────────────────────────────
const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(text, max) {
  const words = String(text || "").split(/\s+/); const out = []; let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) { if (line) out.push(line.trim()); line = w; }
    else line = (line + " " + w).trim();
  }
  if (line) out.push(line.trim());
  return out;
}
function tspans(lines, x, startY, lh, attrs) {
  return lines.map((l, i) => `<tspan x="${x}" y="${startY + i * lh}" ${attrs || ""}>${esc(l)}</tspan>`).join("");
}
// The headless Linux renderer has no color-emoji font (emoji would show as ▯ boxes),
// so strip emoji from text drawn INTO the image. Captions keep their emoji (IG renders those).
function stripEmoji(s) {
  return String(s == null ? "" : s)
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/[\u{FE00}-\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s{2,}/g, " ").replace(/\s+([·,.])/g, "$1").trim();
}
function buildSvg(c0) {
  const c = Object.assign({}, c0, {
    headline: stripEmoji(c0.headline),
    label: stripEmoji(c0.label),
    sub: c0.sub ? stripEmoji(c0.sub) : c0.sub,
    lines: (c0.lines || []).map(stripEmoji).filter(Boolean),
  });
  const W = 1080, H = 1080, PAD = 90;
  const headLines = wrap(c.headline, c.headline.length > 60 ? 30 : 20).slice(0, 4);
  const headSize = headLines.length >= 3 ? 62 : 78;
  const headStartY = 470 - (headLines.length - 1) * (headSize * 0.55);
  let bodyY = headStartY + headLines.length * (headSize * 1.06) + (c.sub ? 70 : 40);
  const bodyBlocks = (c.lines || []).map((l) => wrap(l, 46).slice(0, 3));
  const fontStack = "Inter, 'Segoe UI', 'DejaVu Sans', Arial, sans-serif";
  let body = "";
  for (const blk of bodyBlocks) {
    body += `<text font-family="${fontStack}" font-size="34" fill="#E9E9FB" font-weight="500">${tspans(blk, PAD, bodyY, 46)}</text>`;
    bodyY += blk.length * 46 + 22;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${BRAND.a}"/><stop offset="1" stop-color="${BRAND.b}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="980" cy="120" r="320" fill="#ffffff" opacity="0.06"/>
  <circle cx="120" cy="1000" r="260" fill="#ffffff" opacity="0.05"/>
  <text x="${PAD}" y="130" font-family="${fontStack}" font-size="40" font-weight="800" fill="#fff">▲ LandingPrep</text>
  <rect x="${PAD}" y="180" rx="22" ry="22" width="${36 + c.label.length * 17}" height="44" fill="#ffffff" opacity="0.18"/>
  <text x="${PAD + 18}" y="210" font-family="${fontStack}" font-size="22" font-weight="700" letter-spacing="2" fill="#fff">${esc(c.label)}</text>
  <text font-family="${fontStack}" font-size="${headSize}" font-weight="800" fill="#ffffff" letter-spacing="-1">${tspans(headLines, PAD, headStartY, headSize * 1.06)}</text>
  ${c.sub ? `<text x="${PAD}" y="${headStartY + headLines.length * (headSize * 1.06) + 8}" font-family="${fontStack}" font-size="32" font-weight="600" fill="#D7D7FA">${esc(c.sub)}</text>` : ""}
  ${body}
  <text x="${PAD}" y="980" font-family="${fontStack}" font-size="30" font-weight="700" fill="#fff">landingprep.com</text>
  <text x="${PAD}" y="1018" font-family="${fontStack}" font-size="24" fill="#E9E9FB">100% free exam prep · study-abroad guides · link in bio</text>
</svg>`;
}
async function renderPng(svg) {
  if (!sharp) throw new Error("sharp not installed — run: npm install sharp");
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

// ── publish via Instagram Graph API (2-step: container then publish) ─────
async function postToInstagram({ imageUrl, caption, igUserId, token }) {
  const v = "v21.0";
  const create = await fetch(`https://graph.facebook.com/${v}/${igUserId}/media`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
  });
  const cj = await create.json();
  if (!create.ok || !cj.id) throw new Error("IG container failed: " + JSON.stringify(cj));
  // small wait so Meta finishes fetching the image
  await new Promise((r) => setTimeout(r, 4000));
  const pub = await fetch(`https://graph.facebook.com/${v}/${igUserId}/media_publish`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: cj.id, access_token: token }),
  });
  const pj = await pub.json();
  if (!pub.ok || !pj.id) throw new Error("IG publish failed: " + JSON.stringify(pj));
  return { containerId: cj.id, mediaId: pj.id };
}

function buildCaption(c) {
  const tags = (c.tags || []).map((t) => "#" + t).join(" ");
  return (c.caption || c.headline) + (tags ? "\n\n" + tags : "");
}

// Helper: use the server's token to look up the Instagram Business Account ID(s),
// so the user doesn't have to run Graph API calls by hand. Returns each Page + its
// linked IG account id/username — copy the igId into the IG_USER_ID env var.
async function whoami({ token }) {
  if (!token) throw new Error("Missing IG_ACCESS_TOKEN env");
  const v = "v21.0";
  const r = await fetch(`https://graph.facebook.com/${v}/me/accounts?fields=id,name,instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`);
  const j = await r.json();
  if (j.error) return { error: j.error };
  const pages = (j.data || []).map((p) => ({
    page: p.name, pageId: p.id,
    igUserId: p.instagram_business_account && p.instagram_business_account.id,
    igUsername: p.instagram_business_account && p.instagram_business_account.username,
  }));
  return { pages, hint: "Copy 'igUserId' into your Render IG_USER_ID env var." };
}

// Generate today's image to disk and return its public URL + caption (no posting).
async function generateDailyImage({ baseUrl, now }) {
  const c = pickContent(now);
  const svg = buildSvg(c);
  const png = await renderPng(svg);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // cleanup files older than 2h
  try { for (const f of fs.readdirSync(OUT_DIR)) { const fp = path.join(OUT_DIR, f); if (Date.now() - fs.statSync(fp).mtimeMs > 7200000) fs.unlinkSync(fp); } } catch (e) {}
  const name = `post-${Date.now()}.png`;
  fs.writeFileSync(path.join(OUT_DIR, name), png);
  return { content: c, caption: buildCaption(c), file: name, imageUrl: `${(baseUrl || "").replace(/\/$/, "")}/ig-out/${name}` };
}

// Full daily run: generate image → publish to IG.
async function runDailyPost({ baseUrl, igUserId, token, now }) {
  if (!igUserId || !token) throw new Error("Missing IG_USER_ID or IG_ACCESS_TOKEN env");
  const gen = await generateDailyImage({ baseUrl, now });
  const res = await postToInstagram({ imageUrl: gen.imageUrl, caption: gen.caption, igUserId, token });
  return { ok: true, mediaId: res.mediaId, theme: gen.content.label, imageUrl: gen.imageUrl };
}

module.exports = { pickContent, buildSvg, renderPng, buildCaption, generateDailyImage, postToInstagram, runDailyPost, whoami, OUT_DIR };
