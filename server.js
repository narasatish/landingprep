// server.js — LandingPrep backend
// Proxies AI Tutor calls to Gemini so the API key is never exposed to the frontend.
//
// Start: node server.js   (or npm start)
// Requires: npm install   (installs express, cors, dotenv)
//
// Endpoints:
//   POST /api/ai-tutor/chat   — Gemini chat proxy (streaming SSE or JSON)
//   POST /api/ai-tutor/generate — Gemini one-shot generation (for tools)
//   GET  /api/health          — health check

"use strict";

require("dotenv").config();

const http    = require("http");
const https   = require("https");
const url     = require("url");
const crypto  = require("crypto");
const fs      = require("fs");
const path    = require("path");
const express = require("express");
const cors    = require("cors");

const app  = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5500";

if (!GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set in .env — AI Tutor calls will fail.");
}

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    FRONTEND_ORIGIN,
    "https://landingprep.com", "https://www.landingprep.com",
    "http://landingprep.com", "http://www.landingprep.com",
    "https://landingprep.web.app", "https://landingprep.firebaseapp.com",
    "http://localhost:3000", "http://localhost:5500", "http://127.0.0.1:5500", "http://127.0.0.1:5501",
  ],
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Render/most hosts run behind a reverse proxy — trust it so client IPs & HTTPS detection work.
app.set("trust proxy", 1);
app.disable("x-powered-by");

// ── Security headers (defence-in-depth on every response) ──────────────────────
// Content-Security-Policy: locks down the dangerous vectors (plugin/object injection,
// base-tag hijack, form hijack, clickjacking) while allowing exactly what the app needs
// — React from unpkg/jsdelivr, GA, Google Fonts, Firebase, and the Gemini API. No
// 'unsafe-eval' (the app has zero runtime eval/new Function), so eval-based XSS is dead.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://*.gstatic.com https://www.clarity.ms https://*.clarity.ms",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob:",
  "connect-src 'self' https://*.googleapis.com https://*.onrender.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://*.firebaseio.com https://*.firebaseapp.com https://*.gstatic.com https://*.clarity.ms https://c.bing.com",
  "frame-src 'self' https://*.firebaseapp.com https://www.youtube.com https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");      // block MIME sniffing
  res.setHeader("X-Frame-Options", "SAMEORIGIN");          // anti-clickjacking (legacy)
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(self), camera=(), payment=(), usb=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  // CSP only on HTML documents — never on JSON/API or static assets (avoids odd edge cases).
  if (!req.path.startsWith("/api/")) res.setHeader("Content-Security-Policy", CSP);
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains"); // force HTTPS
  }
  next();
});

// ── Lightweight in-memory rate limiting (brute-force / abuse / DDoS dampening) ──
function rateLimiter({ windowMs, max, message }) {
  const hits = new Map(); // ip -> { count, reset }
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset <= now) hits.delete(k); }, windowMs).unref();
  return (req, res, next) => {
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    let rec = hits.get(ip);
    if (!rec || rec.reset <= now) { rec = { count: 0, reset: now + windowMs }; hits.set(ip, rec); }
    rec.count++;
    if (rec.count > max) {
      res.setHeader("Retry-After", Math.ceil((rec.reset - now) / 1000));
      return res.status(429).json({ error: message || "Too many requests. Please slow down." });
    }
    next();
  };
}
// 120 API calls/min/IP overall; 20 auth attempts/15min/IP (stops password brute-force).
app.use("/api/", rateLimiter({ windowMs: 60 * 1000, max: 120, message: "Too many requests — please wait a minute." }));
app.use("/api/auth/", rateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many attempts — please try again in 15 minutes." }));
// Stricter cap on abuse-prone PUBLIC writes (reviews/community/newsletter/push/clienterror)
// — 20 POSTs/min/IP on top of the global 120/min, so a bot can't flood the homepage.
const _writeCap = rateLimiter({ windowMs: 60 * 1000, max: 20, message: "You're doing that too quickly — please wait a minute." });
app.use(["/api/reviews", "/api/community", "/api/newsletter", "/api/push/subscribe", "/api/clienterror"],
  (req, res, next) => (req.method === "POST" ? _writeCap(req, res, next) : next()));
// Constant-time admin-key check (no timing oracle; denies when ADMIN_SECRET unset).
function adminOK(req) {
  const provided = Buffer.from(String(req.headers["x-admin-key"] || (req.query && req.query.key) || ""));
  const expected = Buffer.from(String(ADMIN_SECRET || ""));
  return !!ADMIN_SECRET && provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
}

// ── Free-tier guard (account-wide) ─────────────────────────────────────────────
// Google's Gemini free-tier limits are per-PROJECT (all users combined), not per-IP,
// so the per-IP limiter above can't keep us inside them. This global cap counts ALL
// Gemini calls and returns 429 once the free-tier rate/day budget is spent — so the
// project physically cannot exceed the free tier and can never incur charges.
// On 429 the frontend degrades gracefully (TTS → native browser voice; tools → cached
// / heuristic output). Defaults match Gemini free-tier; raise via env if you ever upgrade.
// Launch-tuned caps for a ~₹1000 Gemini credit balance. ~₹0.02/AI call, so 300
// AI calls/day ≈ ₹6–7/day → ₹1000 lasts ~4–5 months. TTS is pricier (audio) so
// it stays low + is cached. Account-wide daily ceilings; override via Render env.
const TTS_RPM = parseInt(process.env.TTS_RPM || "3", 10);    // ~3 voice calls/min
const TTS_RPD = parseInt(process.env.TTS_RPD || "30", 10);   // …and 30/day (cached repeats don't count)
const AI_RPM  = parseInt(process.env.AI_RPM  || "10", 10);   // ~10 AI calls/min (smooths bursts)
const AI_RPD  = parseInt(process.env.AI_RPD  || "300", 10);  // …and 300/day ≈ ₹6–7/day on a ₹1000 balance

// ── Defense-in-depth: community data size caps ──────────────────────────────────
// Prevent unbounded growth and resource exhaustion in the file-backed store.
const MAX_COMMUNITY_QUESTIONS = parseInt(process.env.MAX_COMMUNITY_QUESTIONS || "500", 10);  // cap on total questions
const MAX_ANSWERS_PER_Q = parseInt(process.env.MAX_ANSWERS_PER_Q || "50", 10);               // cap answers per question
const MAX_COMMUNITY_LEADERBOARD = parseInt(process.env.MAX_COMMUNITY_LEADERBOARD || "2000", 10); // cap leaderboard entries
const CAP_USAGE = {}; // label -> {day, perDay, min, perMin} — exposed to the owner dashboard
function globalCap({ perMin, perDay, label }) {
  let minCount = 0, minReset = Date.now() + 60 * 1000;
  let dayCount = 0, dayReset = Date.now() + 24 * 60 * 60 * 1000;
  return (req, res, next) => {
    const now = Date.now();
    if (now >= minReset) { minCount = 0; minReset = now + 60 * 1000; }
    if (now >= dayReset) { dayCount = 0; dayReset = now + 24 * 60 * 60 * 1000; }
    if (minCount >= perMin || dayCount >= perDay) {
      const reset = minCount >= perMin ? minReset : dayReset;
      res.setHeader("Retry-After", Math.ceil((reset - now) / 1000));
      CAP_USAGE[label] = { day: dayCount, perDay, min: minCount, perMin };
      return res.status(429).json({ error: `${label} is at its free-tier limit right now — please try again shortly.`, freeTier: true });
    }
    minCount++; dayCount++;
    CAP_USAGE[label] = { day: dayCount, perDay, min: minCount, perMin };
    next();
  };
}
// ── TTS cache: identical (text, voice, lang) → identical audio. We serve cached
// audio BEFORE the rate limiter, so fixed listening content (the same audio for
// every student) bypasses the 3/min free-tier cap and loads instantly. This is
// the single biggest reliability win for the listening feature at scale.
const TTS_CACHE = new Map(); // key -> { audio, ts }  (in-memory, bounded)
const _ttsKey = (b) => require("crypto").createHash("sha1")
  .update(JSON.stringify([String((b && b.text) || "").slice(0, 2000), (b && b.voice) || "Kore", (b && b.lang) || "en"]))
  .digest("hex");
app.use("/api/tts", express.json({ limit: "512kb" }), (req, res, next) => {
  try {
    const hit = TTS_CACHE.get(_ttsKey(req.body || {}));
    if (hit) { res.set("Cache-Control", "public, max-age=86400"); return res.json({ audio: hit.audio, cached: true }); }
  } catch (e) {}
  next();
});
app.use("/api/tts", globalCap({ perMin: TTS_RPM, perDay: TTS_RPD, label: "Natural voice" }));
app.use(["/api/ai-tutor/chat", "/api/ai-tutor/generate"], globalCap({ perMin: AI_RPM, perDay: AI_RPD, label: "AI tutor" }));

app.use(express.json({ limit: "512kb" }));

// 301 redirects for merged/renamed pages (keep old inbound links + SEO equity alive).
// Registered BEFORE express.static so the redirect wins over any stale file.
const REDIRECTS = {
  "/blog/ielts-band-7-in-30-days": "/blog/how-to-get-ielts-band-7/",
  "/blog/ielts-band-7-in-30-days/": "/blog/how-to-get-ielts-band-7/",
};
app.get(Object.keys(REDIRECTS), (req, res) => res.redirect(301, REDIRECTS[req.path] || "/"));

// ── SECURITY: never serve backend source, configs, dependencies, dotfiles, or the
// data dir (user accounts + content pools). The frontend needs NONE of these; the
// backend/build read them from disk directly. Registered BEFORE express.static so
// it wins. (.well-known/ is allowed for security.txt etc.)
app.use((req, res, next) => {
  if (/^\/(data|scripts|tools|node_modules)(\/|$)|^\/(server\.js|package\.json|package-lock\.json)$|^\/\.(?!well-known)/i.test(req.path)) {
    return res.status(404).end();
  }
  next();
});

// Serve static files from the same directory
app.use(express.static(__dirname));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasKey: !!GEMINI_API_KEY,
    firestore: FS_DB ? "connected" : "local-file-ephemeral",
    accounts: Object.keys(STORE.users || {}).length,
    ts: new Date().toISOString(),
  });
});

// ── Daily Instagram auto-poster ───────────────────────────────────────────────
// Picks on-brand content from the site's own data, renders a branded image (served
// publicly from /ig-out/), and publishes to the linked IG Business account via the
// Instagram Graph API. Triggered daily by a GitHub Action (cron) hitting this URL.
//   ?preview=1  → generate the image + caption and return them WITHOUT posting (safe test)
//   (no preview) → actually publishes to Instagram
// Auth: pass the shared secret as ?key=... or header x-ig-secret. Never posts without IG_* env.
const IG_POST_SECRET   = process.env.IG_POST_SECRET || "";
const IG_USER_ID       = process.env.IG_USER_ID || "";
const IG_ACCESS_TOKEN  = process.env.IG_ACCESS_TOKEN || "";
const IG_PUBLIC_BASE   = process.env.PUBLIC_BASE_URL || "https://landingprep.com";
// ── self-healing daily poster: post any of TODAY's slots that aren't posted yet ──
// A Firestore log (per UTC date) records what's already gone out, so repeated catch-up
// runs NEVER double-post — and a missed slot (skipped/failed cron) is caught up on the
// next run. This is what makes posting effectively mandatory even if GitHub cron flakes.
const IG_SLOT_DUE_UTC = [2.5, 7, 10.5, 14, 16];   // when each daily slot becomes due (UTC hours)
async function igCatchUp(ig) {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) return { ok: false, error: "Missing IG_USER_ID / IG_ACCESS_TOKEN" };
  const now = new Date(), date = now.toISOString().slice(0, 10);
  const nowH = now.getUTCHours() + now.getUTCMinutes() / 60, dow = now.getUTCDay();
  const postedNow = {}, errors = []; let log = {};
  const docRef = FS_DB ? FS_DB.collection("ig_daily_log").doc(date) : null;
  if (docRef) { try { const d = await docRef.get(); if (d.exists) log = d.data() || {}; } catch (e) { errors.push("log-read: " + e.message); } }
  const args = { baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_ACCESS_TOKEN };
  // weekly carousel — Sundays, due 06:00 UTC
  if (dow === 0 && nowH >= 6 && !log.carousel) {
    try { const r = await ig.runCitiesCarousel(args); log.carousel = { mediaId: r.mediaId, ts: Date.now() }; postedNow.carousel = r.mediaId; if (docRef) await docRef.set(log, { merge: true }); }
    catch (e) { errors.push("carousel: " + String(e.message || e).slice(0, 160)); }
  }
  for (let slot = 0; slot < IG_SLOT_DUE_UTC.length; slot++) {
    if (nowH < IG_SLOT_DUE_UTC[slot] || log[slot]) continue;            // not due yet, or already posted
    if (!docRef) { errors.push("slot" + slot + ": no Firestore log — refusing (would risk duplicates)"); continue; }
    try { const r = await ig.runDailyPost(Object.assign({ slot }, args)); log[slot] = { mediaId: r.mediaId, ts: Date.now() }; postedNow[slot] = r.mediaId; await docRef.set(log, { merge: true }); }
    catch (e) { errors.push("slot" + slot + ": " + String(e.message || e).slice(0, 160)); }
    await new Promise((r) => setTimeout(r, 4000));                       // small gap between posts
  }
  return { ok: errors.length === 0, date, postedNow: Object.keys(postedNow), alreadyDone: Object.keys(log).filter((k) => k !== "carousel" || log.carousel), errors };
}
app.all("/api/ig/post-daily", async (req, res) => {
  const key = req.query.key || req.headers["x-ig-secret"] || "";
  if (!IG_POST_SECRET || key !== IG_POST_SECRET) return res.status(403).json({ ok: false, error: "forbidden" });
  let ig;
  try { ig = require("./scripts/ig-poster.js"); }
  catch (e) { return res.status(500).json({ ok: false, error: "poster module/sharp not available: " + e.message }); }
  try {
    if (String(req.query.whoami || "") === "1") {
      const info = await ig.whoami({ token: IG_ACCESS_TOKEN });
      return res.json({ ok: !info.error, ...info });
    }
    // ?catchup=1 → self-healing daily poster (used by the cron): posts any of today's
    // still-unposted slots, idempotent via the Firestore log. This is the reliable path.
    if (String(req.query.catchup || "") === "1") { const out = await igCatchUp(ig); return res.status(out.ok ? 200 : 207).json(out); }
    // ── batch/pool mode (pre-made Canva posts in /ig-pool/) ───────────────────
    // ?pool=preview → list pool items (no posting)
    // ?pool=next    → post today's pool item (rotates by date)
    // ?pool=N       → post the pool item at index N
    if (req.query.pool != null && req.query.pool !== "") {
      const pq = String(req.query.pool);
      if (pq === "preview") return res.json({ ok: true, preview: true, pool: ig.listPool({ baseUrl: IG_PUBLIC_BASE }) });
      const index = pq === "next" ? null : Number(pq);
      const out = await ig.runPoolPost({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_ACCESS_TOKEN, index });
      return res.json(out);
    }
    // slot: which of the 5 daily themes (0..4). If omitted, derived from the UTC hour.
    const hasSlot = req.query.slot != null && req.query.slot !== "";
    const slot = hasSlot ? Number(req.query.slot) : null;
    const pv = String(req.query.preview || "");
    // ?carousel=1 → publish today's multi-slide carousel (add &preview=1 → just return the slide URLs)
    if (String(req.query.carousel || "") === "1") {
      if (pv) { const g = await ig.generateCarousel({ baseUrl: IG_PUBLIC_BASE }); return res.json({ ok: true, preview: true, type: "carousel", topic: g.content.topic, slides: g.imageUrls, caption: g.caption }); }
      const out = await ig.runCarousel({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_ACCESS_TOKEN });
      return res.json(out);
    }
    // ?cities=1 → publish this week's "Top cities to study in <country>" carousel (rotates weekly)
    if (String(req.query.cities || "") === "1") {
      if (pv) { const g = await ig.generateCitiesCarousel({ baseUrl: IG_PUBLIC_BASE }); return res.json({ ok: true, preview: true, type: "cities-carousel", country: g.country, slides: g.imageUrls, caption: g.caption }); }
      const out = await ig.runCitiesCarousel({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_ACCESS_TOKEN });
      return res.json(out);
    }
    if (pv) {
      // ?preview=1            → today's slot for the current hour
      // ?preview=1&slot=N     → preview a specific slot (0..4)
      // ?preview=all          → preview all 5 of today's posts
      if (pv === "all") {
        const all = [];
        for (let s = 0; s < ig.SLOTS; s++) {
          if (s === ig.CAROUSEL_SLOT) { const g = await ig.generateCarousel({ baseUrl: IG_PUBLIC_BASE }); all.push({ slot: s, type: "carousel", theme: g.content.topic, slides: g.imageUrls, caption: g.caption }); }
          else { const g = await ig.generateDailyImage({ baseUrl: IG_PUBLIC_BASE, slot: s }); all.push({ slot: s, theme: g.content.category, imageUrl: g.imageUrl, caption: g.caption }); }
        }
        return res.json({ ok: true, preview: true, count: all.length, posts: all });
      }
      if (Number(slot) === ig.CAROUSEL_SLOT) { const g = await ig.generateCarousel({ baseUrl: IG_PUBLIC_BASE }); return res.json({ ok: true, preview: true, slot, type: "carousel", theme: g.content.topic, slides: g.imageUrls, caption: g.caption }); }
      const gen = await ig.generateDailyImage({ baseUrl: IG_PUBLIC_BASE, slot });
      return res.json({ ok: true, preview: true, slot: gen.slot, theme: gen.content.category, imageUrl: gen.imageUrl, caption: gen.caption });
    }
    // ?all=1 → publish all 5 of today's posts in one run (used for the first manual test)
    if (String(req.query.all || "") === "1") {
      const out = await ig.runAllSlots({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_ACCESS_TOKEN });
      return res.json(out);
    }
    const out = await ig.runDailyPost({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_ACCESS_TOKEN, slot });
    res.json(out);
  } catch (e) { res.status(500).json({ ok: false, error: String((e && e.message) || e) }); }
});

// ── Text-to-speech proxy (natural Gemini voice) ───────────────────────────────
// The frontend can't hold the Gemini key, so it calls THIS endpoint, which
// proxies to Gemini 2.5 TTS using the server key and returns base64 audio. This
// is what gives the natural human examiner/listening voice across the site.
app.post("/api/tts", async (req, res) => {
  if (!GEMINI_API_KEY) return res.status(503).json({ error: "TTS unavailable (no key)" });
  const text = String((req.body && req.body.text) || "").slice(0, 2000);
  const voice = (String((req.body && req.body.voice) || "Kore").replace(/[^A-Za-z]/g, "").slice(0, 24)) || "Kore";
  const lang = String((req.body && req.body.lang) || "en").toLowerCase().slice(0, 2);
  if (!text.trim()) return res.status(400).json({ error: "text required" });
  // Language-aware instruction so German/French are pronounced natively (and the
  // instruction itself is in that language, so the model doesn't read it aloud in English).
  const INSTR = {
    de: "Sprich den folgenden deutschen Text natürlich und freundlich aus: ",
    fr: "Lis le texte français suivant de façon naturelle et amicale : ",
    es: "Lee el siguiente texto en español de forma natural y amable: ",
  };
  const instr = INSTR[lang] || "Say the following naturally in a warm, friendly voice: ";
  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=" + GEMINI_API_KEY;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instr + text }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
      }),
    });
    if (!r.ok) { const e = await r.text(); return res.status(502).json({ error: "tts upstream " + r.status, detail: e.slice(0, 160) }); }
    const j = await r.json();
    const b64 = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].inlineData && j.candidates[0].content.parts[0].inlineData.data;
    if (!b64) return res.status(502).json({ error: "empty audio" });
    // Cache so the next request for the same audio is instant + free (bounded LRU).
    try { TTS_CACHE.set(_ttsKey(req.body || {}), { audio: b64, ts: Date.now() }); if (TTS_CACHE.size > 400) TTS_CACHE.delete(TTS_CACHE.keys().next().value); } catch (e) {}
    res.set("Cache-Control", "public, max-age=86400");
    res.json({ audio: b64 });
  } catch (e) { res.status(500).json({ error: "tts failed", detail: e.message }); }
});

// ── Live content feed ────────────────────────────────────────────────────────
// Serves live-content.json read fresh on every request (no cache) so editing
// the file updates fees / patterns / change-feed across the whole site with no
// rebuild and no redeploy. Falls back to an empty payload if the file is missing.
app.get("/api/live", (_req, res) => {
  res.set("Cache-Control", "no-store, max-age=0");
  try {
    const raw = fs.readFileSync(path.join(__dirname, "live-content.json"), "utf8");
    res.type("application/json").send(raw);
  } catch (e) {
    res.json({ updated: null, examFees: {}, examPatternNotes: {}, changes: [] });
  }
});

// ── Gemini helpers ────────────────────────────────────────────────────────────
const MODEL_CHAIN = ["gemini-2.5-flash", "gemini-1.5-flash"];

const EXAM_META = {
  ielts:    { name: "IELTS",                scale: "Band 0–9",           sections: "Listening, Reading, Writing, Speaking" },
  toefl:    { name: "TOEFL iBT",            scale: "0–120",              sections: "Reading, Listening, Speaking, Writing" },
  pte:      { name: "PTE Academic & Core",  scale: "10–90",              sections: "Speaking & Writing, Reading, Listening" },
  celpip:   { name: "CELPIP",               scale: "CLB 1–12",           sections: "Listening, Reading, Writing, Speaking" },
  duolingo: { name: "Duolingo English Test", scale: "10–160",            sections: "Literacy, comprehension, conversation, production" },
  gre:      { name: "GRE General",          scale: "V+Q 260–340, AW 0–6", sections: "Analytical Writing, Verbal, Quantitative" },
  gmat:     { name: "GMAT Focus",           scale: "205–805",            sections: "Quantitative, Verbal, Data Insights" },
};

function buildSystemPrompt(ctx) {
  const examLine = ctx && ctx.exam && EXAM_META[ctx.exam]
    ? `The user is currently working on **${EXAM_META[ctx.exam].name}** (scale: ${EXAM_META[ctx.exam].scale}, sections: ${EXAM_META[ctx.exam].sections}).`
    : "The user has not selected a specific exam — give general guidance across IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE and GMAT.";

  return `You are LandingPrep's expert AI exam tutor — knowledgeable, encouraging, and concise.

Your expertise covers: IELTS (Academic & General Training), TOEFL iBT, PTE Academic & Core, CELPIP General & General LS, Duolingo English Test, GRE General Test, and GMAT Focus Edition.

${examLine}

Guidelines:
- Give specific, actionable advice — not generic encouragement
- Reference real exam patterns (e.g. IELTS Listening has 4 parts, 40 questions; TOEFL Writing uses Integrated + Academic Discussion tasks)
- Keep responses focused and under 200 words unless the user explicitly asks for a detailed explanation
- If the user pastes their writing, give structured feedback on Task Achievement, Coherence, Lexical Resource, and Grammar
- If asked for a model answer, write one that genuinely demonstrates Band 7+ / CEFR C1 quality
- Never make up exam registration details — direct users to official websites
- If you don't know something specific, say so honestly

Tone: professional but warm — like a trusted tutor who wants the student to succeed.`;
}

// Make a non-streaming HTTPS POST to Gemini and return the response text
function geminiPost(model, body) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    const parsed = url.parse(apiUrl);
    const bodyStr = JSON.stringify(body);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
      },
    };
    const req = https.request(opts, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0,300)}`));
        try {
          const j = JSON.parse(data);
          const text = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          resolve({ text, model });
        } catch (e) { reject(new Error("JSON parse: " + data.slice(0,200))); }
      });
    });
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

// Make a streaming HTTPS POST to Gemini and pipe SSE to Express response
function geminiStream(model, body, res) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
    const parsed = url.parse(apiUrl);
    const bodyStr = JSON.stringify(body);
    const opts = {
      hostname: parsed.hostname,
      path: parsed.path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
      },
    };
    const req = https.request(opts, (upstream) => {
      if (upstream.statusCode >= 400) {
        let errData = "";
        upstream.on("data", c => errData += c);
        upstream.on("end", () => reject(new Error(`HTTP ${upstream.statusCode}: ${errData.slice(0,200)}`)));
        return;
      }
      // Set SSE headers on the client response
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      let buffer = "";
      upstream.on("data", (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") { res.write("data: [DONE]\n\n"); continue; }
          try {
            const j = JSON.parse(data);
            const text = j?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) res.write(`data: ${JSON.stringify({ text, model })}\n\n`);
          } catch (_) {}
        }
      });
      upstream.on("end", () => { res.write("data: [DONE]\n\n"); res.end(); resolve(); });
      upstream.on("error", reject);
    });
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

// ── POST /api/ai-tutor/chat ───────────────────────────────────────────────────
//
// Request body:
//   { messages: [{role:"user"|"assistant", content:"..."}], context: {exam, section, mode} }
//
// Query param: ?stream=1 → SSE streaming response
//              (default) → JSON response { answer, model }
//
app.post("/api/ai-tutor/chat", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: "AI Tutor not configured — contact site admin." });
  }

  const { messages = [], context = {} } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  const wantStream = req.query.stream === "1";
  const systemPrompt = buildSystemPrompt(context);

  // Convert frontend message format to Gemini format
  const contents = messages.slice(-12).map(m => ({
    role: (m.role === "assistant" || m.role === "bot") ? "model" : "user",
    parts: [{ text: m.content || m.text || "" }],
  }));

  // Deduplicate: Gemini requires alternating user/model roles — fix if needed
  const fixed = [];
  for (const c of contents) {
    if (fixed.length > 0 && fixed[fixed.length - 1].role === c.role) {
      // Merge consecutive same-role messages
      fixed[fixed.length - 1].parts[0].text += "\n" + c.parts[0].text;
    } else {
      fixed.push(c);
    }
  }
  // Must start with user
  if (fixed.length && fixed[0].role === "model") fixed.shift();

  const geminiBody = (model) => ({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: fixed,
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
      ...(model.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  });

  for (const model of MODEL_CHAIN) {
    try {
      if (wantStream) {
        await geminiStream(model, geminiBody(model), res);
        return;
      } else {
        const result = await geminiPost(model, geminiBody(model));
        return res.json({ answer: result.text, model: result.model });
      }
    } catch (e) {
      console.warn(`[ai-tutor] ${model} failed:`, e.message.slice(0, 150));
    }
  }

  // All models failed
  res.status(502).json({
    error: "AI service temporarily unavailable. Please try again in a moment.",
    fallback: true,
  });
});

// ── POST /api/ai-tutor/generate ───────────────────────────────────────────────
// One-shot generation used by rebuild tools.
// Body: { prompt: "...", json: true }
app.post("/api/ai-tutor/generate", async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(503).json({ error: "Not configured" });
  }
  const { prompt, jsonMode } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  for (const model of MODEL_CHAIN) {
    try {
      const result = await geminiPost(model, {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 4096,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
          ...(model.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
        },
      });
      return res.json({ text: result.text, model: result.model });
    } catch (e) {
      console.warn(`[generate] ${model} failed:`, e.message.slice(0, 150));
    }
  }
  res.status(502).json({ error: "All models failed" });
});

// ── Auth + cross-device sync ───────────────────────────────────────────────────
// Real accounts with scrypt-hashed passwords + HMAC session tokens, persisted to
// a JSON file. The frontend uses this when reachable and falls back to localStorage
// otherwise, so the site works either way.
const AUTH_SECRET = process.env.AUTH_SECRET || crypto.createHash("sha256").update(GEMINI_API_KEY + "|landingprep-auth").digest("hex");
const STORE_PATH = path.join(__dirname, "data", "auth-store.json");
let STORE = { users: {}, history: {}, subscribers: {} };
(function loadStore() {
  try { STORE = JSON.parse(fs.readFileSync(STORE_PATH, "utf8")); }
  catch (_) { STORE = { users: {}, history: {}, subscribers: {} }; }
  if (!STORE.subscribers) STORE.subscribers = {}; // newsletter sign-ups without an account
  if (!STORE.reviews) STORE.reviews = []; // real user reviews (never fabricated)
  if (!STORE.pushSubs) STORE.pushSubs = {}; // web-push subscriptions (endpoint -> sub)
})();
let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true }); fs.writeFileSync(STORE_PATH, JSON.stringify(STORE)); }
    catch (e) { console.warn("[auth] persist failed:", e.message); }
  }, 200);
}

// ── Durable store via Firebase Admin (Firestore) — OPTIONAL but recommended ─────
// Render's free disk is wiped on every redeploy, so the JSON file above is not
// durable. When FIREBASE_SERVICE_ACCOUNT is set (the service-account JSON, as one
// line, in Render's Environment), user accounts + history are mirrored to Firestore
// and reloaded on boot — so nothing is lost across redeploys/restarts.
//   Get the JSON: Firebase Console → ⚙ Project settings → Service accounts →
//   "Generate new private key". Paste the whole file into the env var.
let FS_DB = null;
(function initFirestore() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT || "";
  if (!raw) { console.log("[firestore] not configured — using local file store (not durable on Render free)."); return; }
  try {
    const admin = require("firebase-admin");
    const cred = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(cred), projectId: cred.project_id });
    FS_DB = admin.firestore();
    // If you created a NAMED Firestore database (anything other than "(default)"),
    // set FIRESTORE_DATABASE_ID in Render — otherwise every call fails with 5 NOT_FOUND.
    // The "(default)" database needs nothing here.
    const dbId = (process.env.FIRESTORE_DATABASE_ID || "").trim();
    if (dbId && dbId !== "(default)") FS_DB.settings({ databaseId: dbId });
    console.log("[firestore] connected" + (dbId ? " (db: " + dbId + ")" : " (default db)") + " — user accounts are now durable.");
  } catch (e) { console.warn("[firestore] init failed; using local file store:", e.message); }
})();

async function fsHydrate() {
  if (!FS_DB) return;
  try {
    const snap = await FS_DB.collection("accounts").get();
    snap.forEach((doc) => {
      const d = doc.data() || {};
      STORE.users[doc.id] = { name: d.name, email: d.email, hash: d.hash, createdAt: d.createdAt, noNewsletter: !!d.noNewsletter };
      if (Array.isArray(d.history)) STORE.history[doc.id] = d.history;
    });
    console.log("[firestore] hydrated " + snap.size + " account(s) from Firestore.");
  } catch (e) { console.warn("[firestore] hydrate failed:", e.message); }
}

function fsSaveUser(key) {
  if (!FS_DB || !STORE.users[key]) return;
  const u = STORE.users[key];
  FS_DB.collection("accounts").doc(key).set({
    name: u.name || "", email: u.email || "", hash: u.hash || "",
    createdAt: u.createdAt || Date.now(), noNewsletter: !!u.noNewsletter,
    history: (STORE.history[key] || []).slice(0, 100),
  }, { merge: true }).catch((e) => console.warn("[firestore] save failed:", e.message));
}

// Write-through: persist to the local file (fast) AND mirror this user to Firestore (durable).
function persistUser(key) { persist(); fsSaveUser(key); }

function hashPw(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return salt + ":" + hash;
}
function verifyPw(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(password, salt, 32).toString("hex");
  try { return crypto.timingSafeEqual(Buffer.from(test, "hex"), Buffer.from(hash, "hex")); } catch (_) { return false; }
}
function signToken(email) {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + 1000 * 60 * 60 * 24 * 90 })).toString("base64url");
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return payload + "." + sig;
}
function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expect = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  if (sig !== expect) return null;
  try { const p = JSON.parse(Buffer.from(payload, "base64url").toString()); if (p.x < Date.now()) return null; return p.e; } catch (_) { return null; }
}
function authedEmail(req) { return verifyToken((req.headers.authorization || "").replace(/^Bearer\s+/i, "")); }
const validEmail = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e || "");

// ── Email (Nodemailer via Hostinger SMTP) ──────────────────────────────────────
// Configure in .env:  SMTP_PASS=your-support@landingprep.com-mailbox-password
// (host/port/user have sensible Hostinger defaults). If SMTP_PASS is missing,
// email is silently skipped so signup/reset still work.
const nodemailer = require("nodemailer");
const SMTP = {
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  user: process.env.SMTP_USER || "support@landingprep.com",
  pass: process.env.SMTP_PASS || "",
  from: process.env.SMTP_FROM || "LandingPrep <support@landingprep.com>",
};
let _transport = null;
function mailer() {
  if (!SMTP.pass) return null;
  if (!_transport) _transport = nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, secure: SMTP.port === 465, auth: { user: SMTP.user, pass: SMTP.pass } });
  return _transport;
}
function emailTemplate(name, vars) {
  try {
    let html = fs.readFileSync(path.join(__dirname, "emails", name + ".html"), "utf8");
    Object.entries(vars || {}).forEach(([k, v]) => { html = html.split("{{" + k + "}}").join(String(v == null ? "" : v)); });
    return html;
  } catch (e) { return null; }
}
async function sendMail(to, subject, html) {
  const t = mailer();
  if (!t || !html) return false;
  try { await t.sendMail({ from: SMTP.from, to, subject, html, replyTo: SMTP.user }); return true; }
  catch (e) { console.warn("[mail] send failed:", e.message); return false; }
}

// ── Newsletter (weekly digest) ─────────────────────────────────────────────────
// One-click unsubscribe via a signed link (no login needed) + an admin-only send
// endpoint. Schedule the send with a GitHub Action (.github/workflows/newsletter.yml).
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";
function unsubToken(email) { return crypto.createHmac("sha256", AUTH_SECRET).update("unsub|" + String(email).toLowerCase()).digest("base64url"); }
function unsubLink(email) { return "https://landingprep.com/api/newsletter/unsubscribe?email=" + encodeURIComponent(email) + "&token=" + unsubToken(email); }

app.get("/api/newsletter/unsubscribe", (req, res) => {
  const email = String(req.query.email || "").toLowerCase();
  const token = String(req.query.token || "");
  if (!validEmail(email) || token !== unsubToken(email)) return res.status(400).send("Invalid or expired unsubscribe link.");
  if (STORE.users[email]) { STORE.users[email].noNewsletter = true; persistUser(email); }
  if (STORE.subscribers && STORE.subscribers[email]) { delete STORE.subscribers[email]; persist(); }
  res.set("Content-Type", "text/html").send(
    "<div style='font-family:system-ui;max-width:540px;margin:60px auto;text-align:center'>" +
    "<h2>You're unsubscribed ✅</h2><p style='color:#475569'>You won't receive LandingPrep newsletters anymore. " +
    "You can re-enable them anytime from your account. <a href='https://landingprep.com/'>Back to LandingPrep</a></p></div>");
});

// Public newsletter sign-up (no account needed) — grows the owned email list.
app.post("/api/newsletter/subscribe", (req, res) => {
  const email = String((req.body && req.body.email) || "").trim().toLowerCase();
  const source = String((req.body && req.body.source) || "site").slice(0, 40);
  if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (!STORE.subscribers[email] && !STORE.users[email]) {
    STORE.subscribers[email] = { email, source, ts: Date.now() };
    persist();
    // fire-and-forget welcome (only actually sends if SMTP is configured)
    try { sendMail(email, "Welcome to LandingPrep 🎓", emailTemplate("welcome", { NAME: "there" })); } catch (e) {}
  }
  res.json({ ok: true });
});

// Real user reviews (replaced fabricated testimonials). Public submit + read.
app.post("/api/reviews", (req, res) => {
  const b = req.body || {};
  const stars = parseInt(b.stars, 10);
  const text = String(b.text || "").trim();
  if (!(stars >= 1 && stars <= 5)) return res.status(400).json({ error: "Please pick 1–5 stars." });
  if (text.length < 10 || text.length > 600) return res.status(400).json({ error: "Your review should be 10–600 characters." });
  const review = {
    stars, text: text.slice(0, 600),
    name: (String(b.name || "").trim().slice(0, 40)) || "A LandingPrep user",
    exam: String(b.exam || "").trim().slice(0, 30),
    place: String(b.place || "").trim().slice(0, 40),
    ts: Date.now(),
  };
  STORE.reviews.unshift(review);
  if (STORE.reviews.length > 500) STORE.reviews.length = 500;
  persist();
  res.json({ ok: true, review });
});
app.get("/api/reviews", (_req, res) => {
  res.json({ reviews: (STORE.reviews || []).slice(0, 12), count: (STORE.reviews || []).length });
});

// ── Web Push (PWA daily-practice reminders) ──────────────────────────────────
// Public VAPID key is committed (public by design); the private key comes from the
// Render env var VAPID_PRIVATE. Without it, subscriptions are still stored but
// sending gracefully no-ops — so this never crashes the server.
const VAPID_PUBLIC = "BKc84WZ_bAokzXt0rj94PGCdtzDOvcZAzb_ZJ6TmPWTGskrsXh1MMrpcZDTkN6Mo0AZ0yQwURhYBVulHOWzfQaQ";
let webpush = null;
try {
  if (process.env.VAPID_PRIVATE) {
    webpush = require("web-push");
    webpush.setVapidDetails("mailto:support@landingprep.com", VAPID_PUBLIC, process.env.VAPID_PRIVATE);
    console.log("[push] web-push configured.");
  } else {
    console.log("[push] VAPID_PRIVATE not set — push send disabled (subscriptions still stored).");
  }
} catch (e) { console.warn("[push] web-push unavailable:", e.message); webpush = null; }

app.get("/api/push/key", (_req, res) => res.json({ key: VAPID_PUBLIC }));
app.post("/api/push/subscribe", (req, res) => {
  const sub = req.body && req.body.subscription;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: "subscription required" });
  STORE.pushSubs[sub.endpoint] = { sub, ts: Date.now() };
  if (Object.keys(STORE.pushSubs).length > 50000) { const k = Object.keys(STORE.pushSubs)[0]; delete STORE.pushSubs[k]; }
  persist();
  res.json({ ok: true });
});
app.post("/api/push/unsubscribe", (req, res) => {
  const ep = req.body && req.body.endpoint;
  if (ep && STORE.pushSubs[ep]) { delete STORE.pushSubs[ep]; persist(); }
  res.json({ ok: true });
});
// Admin: fan out a push to all subscribers (use for the daily reminder).
//   POST /api/admin/send-push   header X-Admin-Key: <ADMIN_SECRET>   body { title, body, url }
app.post("/api/admin/send-push", async (req, res) => {
  if (!adminOK(req)) return res.status(403).json({ error: "Forbidden" });
  if (!webpush) return res.status(503).json({ error: "Push not configured — set VAPID_PRIVATE in Render env." });
  const { title, body, url } = req.body || {};
  const payload = JSON.stringify({ title: title || "LandingPrep", body: body || "Time for today's free practice — keep your streak going! 🔥", url: url || "/" });
  let sent = 0, removed = 0;
  for (const [ep, rec] of Object.entries(STORE.pushSubs || {})) {
    try { await webpush.sendNotification(rec.sub, payload); sent++; }
    catch (e) { if (e && (e.statusCode === 404 || e.statusCode === 410)) { delete STORE.pushSubs[ep]; removed++; } }
    await new Promise((r) => setTimeout(r, 20));
  }
  if (removed) persist();
  res.json({ ok: true, subscribers: Object.keys(STORE.pushSubs).length, sent, removed });
});

// Owner dashboard data (behind the admin key). Powers /admin/.
app.get("/api/admin/stats", (req, res) => {
  if (!adminOK(req)) return res.status(403).json({ error: "Forbidden — pass ?key=ADMIN_SECRET" });
  const reviews = STORE.reviews || [];
  res.json({
    users: Object.keys(STORE.users || {}).length,
    subscribers: Object.keys(STORE.subscribers || {}).length,
    reviews: reviews.length,
    avgRating: reviews.length ? +(reviews.reduce((s, r) => s + (r.stars || 0), 0) / reviews.length).toFixed(2) : null,
    recentReviews: reviews.slice(0, 6).map((r) => ({ stars: r.stars, text: String(r.text || "").slice(0, 90), name: r.name, exam: r.exam })),
    pushSubs: Object.keys(STORE.pushSubs || {}).length,
    aiUsage: CAP_USAGE,
    clientErrors: MONITOR.clientErrors.length,
    recentErrors: MONITOR.clientErrors.slice(-6).map((e) => ({ m: String((e && (e.message || e.m)) || e || "").slice(0, 100), url: String((e && e.url) || "").slice(0, 80) })),
    uptimeHrs: +(process.uptime() / 3600).toFixed(1),
    ts: new Date().toISOString(),
  });
});

// Admin-only: send the weekly newsletter to all opted-in users.
//   POST /api/admin/send-newsletter   header: X-Admin-Key: <ADMIN_SECRET>
//   body: { subject, headline, body }   (body may contain simple HTML)
app.post("/api/admin/send-newsletter", async (req, res) => {
  if (!adminOK(req)) return res.status(403).json({ error: "Forbidden" });
  if (!mailer()) return res.status(503).json({ error: "SMTP not configured — set SMTP_PASS." });
  const { subject, headline, body } = req.body || {};
  if (!subject || !body) return res.status(400).json({ error: "subject and body are required." });
  // Recipients = opted-in account holders + standalone newsletter subscribers (deduped by email).
  const byEmail = {};
  for (const u of Object.values(STORE.users)) if (u && validEmail(u.email) && !u.noNewsletter) byEmail[u.email.toLowerCase()] = { name: u.name, email: u.email };
  for (const s of Object.values(STORE.subscribers || {})) if (s && validEmail(s.email)) byEmail[s.email.toLowerCase()] = byEmail[s.email.toLowerCase()] || { name: "", email: s.email };
  const recipients = Object.values(byEmail);
  let sent = 0, failed = 0;
  for (const u of recipients) {
    const html = emailTemplate("newsletter", {
      NAME: (u.name || "there").split(" ")[0], SUBJECT: subject,
      HEADLINE: headline || subject, BODY: body, UNSUB_LINK: unsubLink(u.email),
    });
    (await sendMail(u.email, subject, html)) ? sent++ : failed++;
    await new Promise((r) => setTimeout(r, 120)); // gentle pacing for SMTP limits
  }
  res.json({ ok: true, recipients: recipients.length, sent, failed });
});

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "All fields are required." });
  if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (String(password).length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
  const key = String(email).toLowerCase();
  if (STORE.users[key]) return res.status(409).json({ error: "An account with this email already exists. Try signing in." });
  STORE.users[key] = { name, email, hash: hashPw(password), createdAt: Date.now() };
  persistUser(key);
  // Fire-and-forget welcome email (never blocks signup).
  sendMail(email, "Welcome to LandingPrep 🎓", emailTemplate("welcome", { NAME: (name || "there").split(" ")[0] }));
  res.json({ ok: true, user: { name, email }, token: signToken(key) });
});

app.post("/api/auth/signin", (req, res) => {
  const { email, password } = req.body || {};
  const key = String(email || "").toLowerCase();
  const u = STORE.users[key];
  if (!u || !verifyPw(password, u.hash)) return res.status(401).json({ error: "Invalid email or password." });
  res.json({ ok: true, user: { name: u.name, email: u.email }, token: signToken(key) });
});

app.post("/api/auth/reset", (req, res) => {
  const { email, password } = req.body || {};
  const key = String(email || "").toLowerCase();
  if (!STORE.users[key]) return res.status(404).json({ error: "No account found with this email." });
  if (String(password || "").length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });
  STORE.users[key].hash = hashPw(password);
  persistUser(key);
  // Security notification email (fire-and-forget).
  sendMail(STORE.users[key].email, "Your LandingPrep password was changed",
    emailTemplate("password-reset", { NAME: (STORE.users[key].name || "there").split(" ")[0], RESET_LINK: (process.env.FRONTEND_ORIGIN || "https://landingprep.com") + "/#/login" }));
  res.json({ ok: true });
});

// Optional: email a password-reset link (for a future "forgot password" email flow).
// Always responds ok (never reveals whether an email exists).
app.post("/api/auth/forgot", (req, res) => {
  const key = String((req.body && req.body.email) || "").toLowerCase();
  const u = STORE.users[key];
  if (u) {
    const link = (process.env.FRONTEND_ORIGIN || "https://landingprep.com") + "/#/login?reset=1&email=" + encodeURIComponent(u.email);
    sendMail(u.email, "Reset your LandingPrep password", emailTemplate("password-reset", { NAME: (u.name || "there").split(" ")[0], RESET_LINK: link }));
  }
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  const email = authedEmail(req);
  if (!email || !STORE.users[email]) return res.status(401).json({ error: "Not authenticated." });
  const u = STORE.users[email];
  res.json({ ok: true, user: { name: u.name, email: u.email } });
});

// Cross-device test history sync
app.get("/api/auth/history", (req, res) => {
  const email = authedEmail(req);
  if (!email) return res.status(401).json({ error: "Not authenticated." });
  res.json({ ok: true, history: STORE.history[email] || [] });
});
app.post("/api/auth/history", (req, res) => {
  const email = authedEmail(req);
  if (!email) return res.status(401).json({ error: "Not authenticated." });
  const list = Array.isArray(req.body && req.body.history) ? req.body.history : [];
  STORE.history[email] = list.slice(0, 100);
  persistUser(email);
  res.json({ ok: true, count: STORE.history[email].length });
});

// ── Community Q&A + Leaderboard (file-backed) ──────────────────────────────────
const COMM_PATH = path.join(__dirname, "data", "community.json");
let COMM = { questions: [], leaderboard: [] };
(function loadComm() {
  try { COMM = JSON.parse(fs.readFileSync(COMM_PATH, "utf8")); }
  catch (_) { COMM = { questions: [], leaderboard: [] }; }
  if (!COMM.questions || COMM.questions.length === 0) {
    COMM.questions = [
      { id: "seed1", title: "Is IELTS 6.5 enough for an MS in Canada?", body: "I have IELTS 6.5 overall (6.0 in writing). Will top Canadian universities accept this for a master's, or should I retake?", country: "Canada", tag: "Admissions", author: "Aarav", ts: Date.now() - 86400000 * 3, votes: 4, answers: [{ id: "a1", body: "Most Canadian universities accept 6.5 overall with no band below 6.0, so you likely qualify. A few competitive programs want 7.0 — check each program page. Your 6.0 writing is fine for most.", author: "Mentor", ts: Date.now() - 86400000 * 2, votes: 6 }] },
      { id: "seed2", title: "USA vs Germany for an MS in Computer Science on a tight budget?", body: "Budget is around $20k/year. Is the US realistic with scholarships, or is Germany a better bet?", country: "Germany", tag: "Funding", author: "Neha", ts: Date.now() - 86400000 * 5, votes: 7, answers: [{ id: "a2", body: "On $20k, Germany is far safer — public universities are almost tuition-free and living is ~€11.9k/yr. The US is possible only with a big assistantship/scholarship. Run both through the ROI calculator.", author: "Mentor", ts: Date.now() - 86400000 * 4, votes: 9 }] },
      { id: "seed3", title: "How many universities should I apply to?", body: "Trying to decide how many Safe/Target/Reach schools to apply to without wasting money on fees.", country: "Multiple", tag: "Strategy", author: "Rohit", ts: Date.now() - 86400000 * 1, votes: 3, answers: [] },
    ];
  }
  if (!COMM.leaderboard) COMM.leaderboard = [];
})();
let commTimer = null;
function persistComm() {
  clearTimeout(commTimer);
  commTimer = setTimeout(() => {
    try {
      // Ensure data/ directory exists
      const dataDir = path.dirname(COMM_PATH);
      fs.mkdirSync(dataDir, { recursive: true });
      // Atomic write: write to temp file, then rename. Prevents partial-write corruption on crash.
      const tempPath = COMM_PATH + ".tmp";
      const json = JSON.stringify(COMM);
      fs.writeFileSync(tempPath, json, "utf8");
      fs.renameSync(tempPath, COMM_PATH);
    }
    catch (e) { console.warn("[community] persist failed:", e.message); }
  }, 200);
}
const clean = (s, max) => String(s == null ? "" : s).replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
const newId = () => { try { return crypto.randomUUID(); } catch (_) { return "id" + Date.now() + Math.floor(Math.random() * 1e6); } };

app.get("/api/community", (_req, res) => {
  res.set("Cache-Control", "no-store");
  const list = COMM.questions.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0))
    .map((q) => ({ ...q, answers: (q.answers || []).slice().sort((x, y) => (y.votes || 0) - (x.votes || 0)) }));
  res.json({ ok: true, questions: list });
});
app.post("/api/community/question", (req, res) => {
  // Check if we've reached max questions
  if ((COMM.questions && COMM.questions.length) >= MAX_COMMUNITY_QUESTIONS) {
    return res.status(429).json({ error: `Community has reached maximum ${MAX_COMMUNITY_QUESTIONS} questions. Please try again later.` });
  }

  const title = clean(req.body && req.body.title, 140);
  const body = clean(req.body && req.body.body, 2000);
  if (title.length < 8) return res.status(400).json({ error: "Please write a clearer question title (8+ chars)." });

  const author = clean(req.body && req.body.author, 40) || "Anonymous";
  if (author.length > 40) {
    return res.status(400).json({ error: "Author name is too long (maximum 40 characters)." });
  }

  const q = {
    id: newId(),
    title,
    body,
    country: clean(req.body && req.body.country, 40) || "Multiple",
    tag: clean(req.body && req.body.tag, 30) || "General",
    author,
    ts: Date.now(),
    votes: 0,
    answers: []
  };
  COMM.questions.unshift(q);
  COMM.questions = COMM.questions.slice(0, MAX_COMMUNITY_QUESTIONS);
  persistComm();
  res.json({ ok: true, question: q });
});
app.post("/api/community/answer", (req, res) => {
  // Validate questionId exists and is a non-empty string
  const questionId = req.body && req.body.questionId;
  if (!questionId || typeof questionId !== "string" || questionId.trim().length === 0) {
    return res.status(400).json({ error: "Invalid question ID." });
  }
  const q = COMM.questions.find((x) => x.id === questionId);
  if (!q) return res.status(404).json({ error: "Question not found." });

  // Check if question already has max answers
  const answerCount = (q.answers && q.answers.length) || 0;
  if (answerCount >= MAX_ANSWERS_PER_Q) {
    return res.status(429).json({ error: `This question already has ${MAX_ANSWERS_PER_Q} answers. No more can be added.` });
  }

  // Validate and sanitize answer body
  const body = clean(req.body && req.body.body, 4000);
  if (body.length < 4) return res.status(400).json({ error: "Answer is too short (minimum 4 characters)." });

  // Validate and sanitize author name
  const author = clean(req.body && req.body.author, 40) || "Anonymous";
  if (author.length > 40) {
    return res.status(400).json({ error: "Author name is too long (maximum 40 characters)." });
  }

  const a = { id: newId(), body, author, ts: Date.now(), votes: 0 };
  q.answers = q.answers || []; q.answers.push(a);
  persistComm();
  res.json({ ok: true, answer: a });
});
const VOTE_LOG = new Map(); // ip -> Set(voteKey) — one vote per item per IP (anti-manipulation)
app.post("/api/community/vote", (req, res) => {
  // Validate questionId
  const questionId = req.body && req.body.questionId;
  if (!questionId || typeof questionId !== "string" || questionId.trim().length === 0) {
    return res.status(400).json({ error: "Invalid question ID." });
  }
  const q = COMM.questions.find((x) => x.id === questionId);
  if (!q) return res.status(404).json({ error: "Question not found." });
  // One vote per (IP, item): block repeat/inflated voting.
  const _ip = String(req.headers["x-forwarded-for"] || (req.socket && req.socket.remoteAddress) || "").split(",")[0].trim();
  const _vk = questionId + "|" + (req.body.answerId || "");
  if (VOTE_LOG.size > 20000) VOTE_LOG.clear();
  let _voted = VOTE_LOG.get(_ip); if (!_voted) { _voted = new Set(); VOTE_LOG.set(_ip, _voted); }
  if (_voted.has(_vk)) return res.status(429).json({ error: "You've already voted on this." });
  _voted.add(_vk);

  // Vote on question or answer (if answerId is provided and valid)
  if (req.body.answerId) {
    const answerId = req.body.answerId;
    if (typeof answerId !== "string" || answerId.trim().length === 0) {
      return res.status(400).json({ error: "Invalid answer ID." });
    }
    const a = (q.answers || []).find((x) => x.id === answerId);
    if (!a) return res.status(404).json({ error: "Answer not found." });
    a.votes = (a.votes || 0) + 1;
  } else {
    q.votes = (q.votes || 0) + 1;
  }
  persistComm();
  res.json({ ok: true });
});

app.get("/api/leaderboard", (req, res) => {
  res.set("Cache-Control", "no-store");
  const exam = clean(req.query && req.query.exam, 20);
  let list = COMM.leaderboard.slice();
  if (exam) list = list.filter((e) => e.exam === exam);
  list.sort((a, b) => (b.pct || 0) - (a.pct || 0) || (b.ts || 0) - (a.ts || 0));
  res.json({ ok: true, leaderboard: list.slice(0, 50) });
});
app.post("/api/leaderboard/submit", (req, res) => {
  const name = clean(req.body && req.body.name, 40) || "Anonymous";
  const exam = clean(req.body && req.body.exam, 20);
  const pct = Math.max(0, Math.min(100, Math.round(Number(req.body && req.body.pct) || 0)));
  const scoreLabel = clean(req.body && req.body.scoreLabel, 30);
  if (!exam) return res.status(400).json({ error: "Exam is required." });
  // Keep one best entry per (name, exam).
  const key = (name + "|" + exam).toLowerCase();
  const existing = COMM.leaderboard.find((e) => (e.name + "|" + e.exam).toLowerCase() === key);
  if (existing) { if (pct > (existing.pct || 0)) { existing.pct = pct; existing.scoreLabel = scoreLabel; existing.ts = Date.now(); } }
  else COMM.leaderboard.push({ id: newId(), name, exam, pct, scoreLabel, ts: Date.now() });
  COMM.leaderboard = COMM.leaderboard.slice(0, MAX_COMMUNITY_LEADERBOARD);
  persistComm();
  res.json({ ok: true });
});

// ── Production health monitoring + alerting ────────────────────────────────────
// Captures real client-side errors AND runs synthetic checks of key pages/APIs, then
// alerts you (email + optional webhook) — throttled so one issue can't spam you. Gives
// the "we know instantly when any page or tool breaks" guarantee.
const ALERT_TO = process.env.ALERT_EMAIL || SMTP.user;
const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK_URL || ""; // Slack/Discord/Teams incoming webhook
const _escH = (s) => String(s == null ? "" : s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
const MONITOR = { clientErrors: [], lastRun: null, alertedAt: new Map() };
async function sendAlert(key, subject, body) {
  const now = Date.now();
  if (now - (MONITOR.alertedAt.get(key) || 0) < 30 * 60 * 1000) return; // dedupe same issue for 30 min
  MONITOR.alertedAt.set(key, now);
  console.error("[ALERT] " + subject + " — " + String(body).slice(0, 300));
  if (ALERT_WEBHOOK && typeof fetch === "function") {
    try { fetch(ALERT_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: `🚨 LandingPrep — ${subject}\n${String(body).slice(0, 1500)}` }) }).catch(() => {}); } catch (e) {}
  }
  try {
    await sendMail(ALERT_TO, "🚨 LandingPrep alert: " + subject,
      `<h2 style="font-family:system-ui">🚨 ${_escH(subject)}</h2>` +
      `<pre style="font-family:monospace;font-size:13px;white-space:pre-wrap;background:#f8fafc;padding:14px;border-radius:8px">${_escH(body)}</pre>` +
      `<p style="font-family:system-ui;color:#64748b;font-size:13px">Sent automatically by the LandingPrep health monitor. Reply to this email if you need to investigate.</p>`);
  } catch (e) {}
}

// Real-user error capture: the frontend POSTs here whenever a JS / React render error
// fires, so we hear about breakage the moment a visitor hits it.
app.post("/api/clienterror", (req, res) => {
  const b = req.body || {};
  const ev = {
    message: String(b.message || "").slice(0, 500), url: String(b.url || "").slice(0, 300),
    stack: String(b.stack || "").slice(0, 1500), kind: String(b.kind || "error").slice(0, 30),
    ua: String(req.headers["user-agent"] || "").slice(0, 200), ts: new Date().toISOString(),
  };
  if (!ev.message) return res.json({ ok: true });
  MONITOR.clientErrors.push(ev);
  if (MONITOR.clientErrors.length > 300) MONITOR.clientErrors.shift();
  sendAlert("client:" + ev.message.slice(0, 80), "Client error — " + ev.message.slice(0, 120),
    `Page: ${ev.url}\nType: ${ev.kind}\nUA: ${ev.ua}\n\n${ev.stack}`);
  res.json({ ok: true });
});

// ── Defense-in-depth: monitor base URL allowlist ──────────────────────────────
// Prevent monitoring from being hijacked to scan internal/paid endpoints by validating
// the resolved base URL against an allowlist. Falls back to localhost if validation fails.
const MONITOR_HOST_ALLOWLIST = ["landingprep.com", "www.landingprep.com", "localhost", "127.0.0.1"];
function validateMonitorBase(base) {
  if (!base) return "http://localhost:" + PORT;
  try {
    const parsed = new url.URL(base);
    // Must be http or https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      console.warn("[monitor] rejecting non-http(s) base:", base);
      return "http://localhost:" + PORT;
    }
    // Check if hostname matches allowlist (exact match or *.onrender.com)
    const host = parsed.hostname || "";
    const isAllowed = MONITOR_HOST_ALLOWLIST.includes(host) ||
                      /^[\w-]+\.onrender\.com$/.test(host) ||
                      host === "localhost" ||
                      host === "127.0.0.1";
    if (!isAllowed) {
      console.warn("[monitor] rejecting unexpected host:", host, "— allowed:", MONITOR_HOST_ALLOWLIST.join(", "), "+ *.onrender.com");
      return "http://localhost:" + PORT;
    }
    return base;
  } catch (e) {
    console.warn("[monitor] invalid URL:", base, "—", e.message);
    return "http://localhost:" + PORT;
  }
}

// Synthetic monitor: fetch key public pages / APIs / exam content and check HTTP status
// + a content marker + latency. Runs on a timer (the keep-warm ping keeps the dyno awake
// so this runs continuously in production). Catches outages, 500s, blank pages, slow loads.
// IMPORTANT: All paths are static/content/health — NEVER /api/ai-tutor, /api/tts, or any endpoint
// that burns Gemini free-tier quota.
const MON_TARGETS = [
  { path: "/", marker: "LandingPrep" },
  { path: "/api/health", marker: '"status":"ok"' },
  { path: "/which-english-test/", marker: "English Test" },
  { path: "/explore/", marker: "Explore" },
  { path: "/ielts-band-7/", marker: "IELTS" },
  { path: "/ielts-writing-checker/", marker: "Writing" },   // static page (AI tool frontend, not backend call)
  { path: "/ielts-speaking-checker/", marker: "Speaking" }, // static page (AI tool frontend, not backend call)
  { path: "/mock-test/ielts/", marker: "IELTS" },           // exam runner entry (static)
  { path: "/content/pte/listening/test-001.json", marker: "questionType" },
  { path: "/content/ielts/reading/test-001.json", marker: "passages" },
  { path: "/content/celpip/listening/test-001.json", marker: "Problem Solving" },
  { path: "/content/gre/quant/test-001.json", marker: "correctAnswer" },
  { path: "/sitemap.xml", marker: "<urlset" },
];
async function monHit(base, tgt) {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, 30000);
    const r = await fetch(base + tgt.path, { headers: { "x-monitor": "1" }, signal: ctrl.signal });
    const text = await r.text().catch(() => "");
    clearTimeout(timer);
    const markerOk = !tgt.marker || text.includes(tgt.marker);
    return { ok: r.ok && markerOk, status: r.status, ms: Date.now() - t0, markerOk };
  } catch (e) {
    return { ok: false, status: 0, ms: Date.now() - t0, markerOk: true, err: e.message };
  }
}
async function runMonitor() {
  // Resolve and validate monitor base URL against allowlist
  const raw = process.env.MONITOR_BASE || process.env.RENDER_EXTERNAL_URL || process.env.SELF_PING_URL || ("http://localhost:" + PORT);
  const base = validateMonitorBase(raw).replace(/\/$/, "");
  const results = [];
  for (const tgt of MON_TARGETS) {
    // Cold-start / transient tolerant: a single blip must NOT email you. Only alert
    // if the check fails TWICE (retry once after 3s), with a 30s timeout (> cold start).
    let res = await monHit(base, tgt);
    if (!res.ok) { await new Promise((r) => setTimeout(r, 3000)); res = await monHit(base, tgt); }
    results.push({ path: tgt.path, status: res.status, ms: res.ms, ok: res.ok });
    if (!res.ok) {
      sendAlert("monitor:" + tgt.path, "Health check FAILED: " + tgt.path,
        `HTTP ${res.status}, ${res.ms}ms, marker ${tgt.marker ? (res.markerOk ? "present" : "MISSING") : "n/a"}${res.err ? ", " + res.err : ""} @ ${base} (confirmed after retry)`);
    } else if (res.ms > 9000) {
      sendAlert("slow:" + tgt.path, "Slow page: " + tgt.path, `${res.ms}ms (HTTP ${res.status})`);
    }
  }
  MONITOR.lastRun = { ts: new Date().toISOString(), base, allOk: results.every((r) => r.ok), results };
  return MONITOR.lastRun;
}
setTimeout(() => { runMonitor().catch(() => {}); }, 90 * 1000).unref();      // first run ~90s after boot
setInterval(() => { runMonitor().catch(() => {}); }, 10 * 60 * 1000).unref(); // then every 10 minutes

// Status feed for a dashboard / the AI fix-agent. GET /api/health/report?key=ADMIN_SECRET
app.get("/api/health/report", (req, res) => {
  if (!adminOK(req)) return res.status(403).json({ error: "Forbidden — pass ?key=ADMIN_SECRET" });
  res.json({ lastRun: MONITOR.lastRun, clientErrorCount: MONITOR.clientErrors.length, recentClientErrors: MONITOR.clientErrors.slice(-50) });
});

// ── Resilience: unknown API routes + central error handler ─────────────────────
// Any /api/* path that no route matched → clean JSON 404 (never an HTML error page).
app.use("/api", (req, res) => res.status(404).json({ error: "Not found", path: req.path }));
// Central error handler: a thrown error in ANY route lands here and returns a safe
// 500 instead of hanging the request or crashing the process. Must have 4 args.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[express error]", err && err.stack ? err.stack : err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

// ── Process-level guards: one bad async error must NEVER take the whole site down ─
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason && reason.stack ? reason.stack : reason);
});
let SERVER_READY = false;
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err && err.stack ? err.stack : err);
  // Fatal at startup (e.g. port in use) → exit so the platform can restart cleanly.
  // After the server is listening, stay alive: one bad request throw must not take the
  // whole site down for every other user.
  if (!SERVER_READY || (err && (err.code === "EADDRINUSE" || err.code === "EACCES"))) {
    process.exit(1);
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  SERVER_READY = true;
  fsHydrate(); // load durable accounts from Firestore (if configured) on boot
  console.log(`\n🚀  LandingPrep server running at http://localhost:${PORT}`);
  console.log(`   Gemini key: ${GEMINI_API_KEY ? "✅ loaded from .env" : "❌ NOT SET — add to .env"}`);
  console.log(`   CORS origin: ${FRONTEND_ORIGIN}`);
  console.log(`   Static files served from: ${__dirname}`);
  console.log(`\n   Endpoints:`);
  console.log(`     GET  /api/health`);
  console.log(`     POST /api/ai-tutor/chat`);
  console.log(`     POST /api/ai-tutor/chat?stream=1  (SSE)`);
  console.log(`     POST /api/ai-tutor/generate\n`);
});
// Anti-hang / slow-loris: drop requests that stall. AI streaming can be slow, so the
// per-request ceiling is generous (120s) but finite — no socket leaks forever.
server.requestTimeout = 120000;     // 120s hard cap per request
server.headersTimeout = 65000;      // must exceed keepAliveTimeout
server.keepAliveTimeout = 61000;    // > typical 60s LB idle to avoid 502s on Render
server.on("clientError", (err, socket) => {
  if (socket.writable && !socket.destroyed) socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

// ── Keep-warm self-ping ────────────────────────────────────────────────────────
// Render's free tier sleeps the dyno after ~15 min idle (then a 30–45s cold start
// that can look like a failure to the first visitor). Pinging our own public
// /api/health every ~13 min keeps the dyno awake so real users never hit a cold
// start. Only runs when a public URL is known (RENDER_EXTERNAL_URL is auto-set on
// Render) — it's a no-op locally. Fully guarded: a failed ping never crashes anything.
const SELF_PING_URL = (process.env.RENDER_EXTERNAL_URL || process.env.SELF_PING_URL || "").replace(/\/$/, "");
if (SELF_PING_URL && typeof fetch === "function") {
  const warm = () => {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => { try { ctrl.abort(); } catch (e) {} }, 20000);
      fetch(SELF_PING_URL + "/api/health", { signal: ctrl.signal, headers: { "x-keep-warm": "1" } })
        .catch(() => {})
        .finally(() => clearTimeout(timer));
    } catch (e) { /* never throw from keep-warm */ }
  };
  setTimeout(warm, 30 * 1000).unref();          // first ping shortly after boot
  setInterval(warm, 13 * 60 * 1000).unref();    // then every 13 min (< Render's 15 min idle)
  console.log(`   Keep-warm: pinging ${SELF_PING_URL}/api/health every 13 min`);
}
