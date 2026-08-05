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
// Prefer IPv4 for all outbound connections. Render containers have no IPv6 route, so when
// smtp.hostinger.com (or any host) resolves to IPv6 the connection fails with ENETUNREACH —
// which is what made password-reset / welcome emails fail intermittently.
try { require("dns").setDefaultResultOrder("ipv4first"); } catch (e) {}

const http    = require("http");
const https   = require("https");
const url     = require("url");
const crypto  = require("crypto");
const fs      = require("fs");
const path    = require("path");
const express = require("express");
const cors    = require("cors");
const compression = require("compression");

const app  = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
// ── Gemini credentials: FREE tier first, paid only as fallback ────────────────
// A single key cannot be "free then paid" — Google bills per-project, and linking
// billing to a project silently makes EVERY call on that key paid. So we use two
// credentials and a ladder:
//   GEMINI_API_KEY_FREE — from a Google AI Studio project with NO billing linked.
//                         This is the real free tier. Tried first, always.
//   GEMINI_API_KEY      — the paid/billing-linked key. Used ONLY when the free key
//                         is rate-limited or quota-exhausted (429 / RESOURCE_EXHAUSTED).
// Only PAID calls count against the spend caps below; free calls and cache hits are free
// and must never be charged against the budget.
const GEMINI_API_KEY_FREE = process.env.GEMINI_API_KEY_FREE || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
// Ordered ladder of {key, paid} actually available at boot.
const AI_KEYS = [
  ...(GEMINI_API_KEY_FREE ? [{ key: GEMINI_API_KEY_FREE, paid: false, label: "free" }] : []),
  ...(GEMINI_API_KEY ? [{ key: GEMINI_API_KEY, paid: true, label: "paid" }] : []),
];
// Kill switch — set AI_ENABLED=0 in Render to stop ALL model spend instantly.
const AI_ENABLED = process.env.AI_ENABLED !== "0";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5500";

if (!AI_KEYS.length) {
  console.warn("⚠️  No Gemini key set (GEMINI_API_KEY_FREE / GEMINI_API_KEY) — AI calls will fail.");
} else if (!GEMINI_API_KEY_FREE) {
  console.warn("⚠️  GEMINI_API_KEY_FREE not set — every AI call bills to the PAID key. Create a Google AI Studio project with NO billing linked and set GEMINI_API_KEY_FREE to use the free tier first.");
}

// ── Middleware ────────────────────────────────────────────────────────────────
// gzip/brotli-style compression for all text assets (JS/CSS/HTML/JSON). The app
// bundle is ~1.2 MB raw; compression cuts transfer ~70–75%, a big LCP win on
// mobile and the Render free tier. compression skips already-compressed types.
app.use(compression());
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

// ── /api/v1/* is an alias of /api/* ──────────────────────────────────────────
// Ship a versioned URL BEFORE a mobile app exists, not after. On the web you deploy
// client and server together, so a contract change is safe; once an app is installed
// you cannot — users update on their own schedule, and an old build must keep working.
// Point the app at /api/v1 from day one: /api/* stays as-is for the website, and a
// future breaking change becomes /api/v2 instead of an outage for everyone on v1.
// Must sit ABOVE the rate limiters so versioned calls are throttled identically.
app.use((req, _res, next) => {
  if (req.url === "/api/v1" || req.url.startsWith("/api/v1/") || req.url.startsWith("/api/v1?")) {
    req.url = "/api" + req.url.slice("/api/v1".length);
  }
  next();
});

// ── Lightweight in-memory rate limiting (brute-force / abuse / DDoS dampening) ──
// keyBy:"user" buckets a signed-in caller by account instead of IP. Without it, a whole
// school/hostel or a mobile carrier behind one NAT shares a single 120/min budget and
// students collectively 429 each other — which an app makes much likelier than the web.
// Anonymous callers still fall back to IP, and auth/write caps stay IP-keyed on purpose
// (an attacker brute-forcing a password is unauthenticated, so IP is the only real key).
function rateLimiter({ windowMs, max, message, keyBy }) {
  const hits = new Map(); // key -> { count, reset }
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset <= now) hits.delete(k); }, windowMs).unref();
  return (req, res, next) => {
    const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "unknown";
    let key = "ip:" + ip;
    if (keyBy === "user") {
      // Must VERIFY the token — keying on a raw header would let anyone mint unlimited
      // buckets by sending random strings.
      let who = null;
      try { who = authedEmail(req); } catch (_) { who = null; }
      if (who) key = "u:" + who;
    }
    const now = Date.now();
    let rec = hits.get(key);
    if (!rec || rec.reset <= now) { rec = { count: 0, reset: now + windowMs }; hits.set(key, rec); }
    rec.count++;
    if (rec.count > max) {
      res.setHeader("Retry-After", Math.ceil((rec.reset - now) / 1000));
      return res.status(429).json({ error: message || "Too many requests. Please slow down." });
    }
    next();
  };
}
// 120 API calls/min per signed-in user (falling back to IP when anonymous);
// 20 auth attempts/15min/IP (stops password brute-force).
app.use("/api/", rateLimiter({ windowMs: 60 * 1000, max: 120, keyBy: "user", message: "Too many requests — please wait a minute." }));
app.use("/api/auth/", rateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many attempts — please try again in 15 minutes." }));
// Stricter cap on abuse-prone PUBLIC writes (reviews/community/newsletter/push/clienterror)
// — 20 POSTs/min/IP on top of the global 120/min, so a bot can't flood the homepage.
const _writeCap = rateLimiter({ windowMs: 60 * 1000, max: 20, message: "You're doing that too quickly — please wait a minute." });
app.use(["/api/reviews", "/api/community", "/api/newsletter", "/api/push/subscribe", "/api/clienterror", "/api/auth/forgot", "/api/auth/reset"],
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

// ── /go/<slug> — tracked outbound affiliate/partner redirect ──────────────────
// Why a redirect instead of linking the partner URL directly on the page:
//  1. The affiliate code lives in ONE config file (config/affiliates.json), not baked
//     into hundreds of prerendered HTML files — change your code once, everywhere.
//  2. The indexed HTML links to a same-site /go/ URL, so no raw money link sits in the
//     crawlable page. /go/ is Disallowed in robots.txt and 302 (temporary) so search
//     engines don't pass equity or index the destination.
//  3. Clicks are counted here, so you can see which offers convert (GET /api/go/stats).
// This does NOT replace rel="sponsored nofollow" on the on-page link — that's also set.
let AFFILIATES = { partners: {} };
try { AFFILIATES = JSON.parse(fs.readFileSync(path.join(__dirname, "config", "affiliates.json"), "utf8")); }
catch (e) { console.warn("[affiliates] config not loaded:", e.message); }
const GO_CLICKS = Object.create(null); // slug -> count (in-memory; fine for trend, resets on redeploy)
app.get("/go/:slug", (req, res) => {
  const p = AFFILIATES.partners && AFFILIATES.partners[req.params.slug];
  // Unknown or deactivated partner → send the user somewhere useful, never a dead end.
  if (!p || p.active === false || !/^https:\/\//.test(p.target || "")) return res.redirect(302, "/#/tools");
  GO_CLICKS[req.params.slug] = (GO_CLICKS[req.params.slug] || 0) + 1;
  let dest = p.target;
  if (p.ref && p.refParam) dest += (dest.includes("?") ? "&" : "?") + encodeURIComponent(p.refParam) + "=" + encodeURIComponent(p.ref);
  else if (p.ref) dest += (dest.includes("?") ? "&" : "?") + "ref=" + encodeURIComponent(p.ref);
  res.set("Cache-Control", "no-store");
  res.redirect(302, dest);
});
// Owner-only click tally (same admin key as the other admin routes).
app.get("/api/go/stats", (req, res) => {
  if (!ADMIN_SECRET || req.query.key !== ADMIN_SECRET) return res.status(403).json({ error: "Forbidden — pass ?key=ADMIN_SECRET" });
  res.json({ clicks: GO_CLICKS, ts: new Date().toISOString() });
});

// ── SECURITY: never serve backend source, configs, dependencies, dotfiles, or the
// data dir (user accounts + content pools). The frontend needs NONE of these; the
// backend/build read them from disk directly. Registered BEFORE express.static so
// it wins. (.well-known/ is allowed for security.txt etc.)
app.use((req, res, next) => {
  const p = req.path;
  // NOTE: tools/ holds BOTH dev scripts (fix-*.js, audit-*.mjs…) AND the public SEO tool PAGES
  // (/tools/<name>/index.html — cost calc, EMI, eligibility, etc.). Block only the dev FILES
  // directly in tools/ (anything with an extension), never the /tools/<page>/ directories.
  if (/^\/(data|scripts|node_modules)(\/|$)/i.test(p)
    || /^\/tools\/[^/]+\.[a-z0-9]+$/i.test(p)
    || /^\/(server\.js|package\.json|package-lock\.json)$/i.test(p)
    || /^\/\.(?!well-known)/i.test(p)) {
    return res.status(404).end();
  }
  next();
});

// Serve static files from the same directory.
// Cache-Control matters a lot on Render's free tier: without it Express sends
// `max-age=0`, so Cloudflare marks every response DYNAMIC and each visit + each
// Googlebot crawl hits the (possibly sleeping) dyno for a 30–45 s cold start.
// Prerendered HTML is cache-busted on deploy via the sw.js CACHE_VERSION bump and
// the ?v= asset tags, so it is safe to let the CDN/browser cache and revalidate.
app.use(express.static(__dirname, {
  setHeaders: (res, filePath) => {
    const p = filePath.toLowerCase();
    if (p.endsWith("sw.js") || p.endsWith("service-worker.js")) {
      // The service worker must always revalidate, or users never get new builds.
      res.setHeader("Cache-Control", "no-cache, max-age=0, must-revalidate");
    } else if (p.endsWith(".html")) {
      // Prerendered pages: revalidate hourly but serve stale instantly while it
      // refreshes, so neither users nor crawlers ever wait on a cold dyno.
      res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    } else if (/(sitemap.*\.xml|feed\.xml|robots\.txt|llms.*\.txt|manifest\.(json|webmanifest))$/.test(p)) {
      // SEO/feed files regenerate ~hourly (auto-blog) — keep them fresh-ish.
      res.setHeader("Cache-Control", "public, max-age=3600");
    } else if (/\.(js|css|png|jpe?g|webp|gif|svg|woff2?|ttf|otf|ico|mp3|mp4|webm|pdf|json)$/.test(p)) {
      // Assets are cache-busted via ?v=NNN on each deploy → safe to cache a day.
      res.setHeader("Cache-Control", "public, max-age=86400");
    }
  },
}));

// ── Health check ─────────────────────────────────────────────────────────────
// `hasKey` only means the env var is SET — it does NOT mean the AI works. That false
// comfort hid an ~8-day outage when Google retired every model in MODEL_CHAIN.
// Add ?probe=ai to actually call the model chain and report which model answers.
// It's opt-in because each probe costs one real Gemini call — keep it off the
// high-frequency keep-alive pinger; a daily probe is plenty.
app.get("/api/health", async (req, res) => {
  const base = {
    status: "ok",
    hasKey: AI_KEYS.length > 0,
    aiKeys: AI_KEYS.map((k) => k.label), // e.g. ["free","paid"] — which tiers are configured
    aiEnabled: AI_ENABLED,
    firestore: FS_DB ? "connected" : "local-file-ephemeral",
    accounts: Object.keys(STORE.users || {}).length,
    ts: new Date().toISOString(),
  };
  if (req.query.probe !== "ai") return res.json(base);

  if (!AI_KEYS.length) return res.json({ ...base, ai: { ok: false, reason: "no Gemini key set (GEMINI_API_KEY_FREE / GEMINI_API_KEY)" } });
  if (!AI_ENABLED) return res.json({ ...base, ai: { ok: false, reason: "AI_ENABLED=0 (kill switch on)" } });
  aiRollDay();
  try {
    // Probe deliberately skips the cache (a fresh live call is the point) and refuses to
    // spend paid credit — a health check must never cost money.
    const r = await geminiWithLadder((model) => ({
      contents: [{ role: "user", parts: [{ text: "Reply with the single word: ok" }] }],
      generationConfig: { maxOutputTokens: 8, temperature: 0, ...(model.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}) },
      // Spend paid credit ONLY when there is no free key to test with — otherwise the
      // probe would report "degraded" on a perfectly healthy paid-only setup. The call
      // is 8 output tokens, so the cost is effectively nil either way.
    }), { allowPaid: !GEMINI_API_KEY_FREE, cacheSeed: { probe: Date.now() } });
    return res.json({ ...base, ai: { ok: true, model: r.model, tier: r.cached ? "cache" : (r.paid ? "paid" : "free"), sample: (r.text || "").trim().slice(0, 40) }, spend: AI_SPEND });
  } catch (e) {
    return res.status(503).json({ ...base, status: "degraded", ai: { ok: false, triedModels: MODEL_CHAIN, keys: AI_KEYS.map((k) => k.label), reason: scrubSecrets(e && e.message) }, spend: AI_SPEND });
  }
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
// Live Instagram token. Seeds from the env var, but the server auto-refreshes it (Instagram
// long-lived tokens expire ~60 days from creation regardless of how little you post) and persists
// the fresh token in Firestore — env vars can't be rewritten at runtime, so posting must read this
// live value, never the static env var. Once seeded, the token then never lapses.
let IG_TOKEN = IG_ACCESS_TOKEN;
let IG_TOKEN_REFRESHED_AT = 0;
const IG_PUBLIC_BASE   = process.env.PUBLIC_BASE_URL || "https://landingprep.com";
// ── self-healing daily poster: post any of TODAY's slots that aren't posted yet ──
// A Firestore log (per UTC date) records what's already gone out, so repeated catch-up
// runs NEVER double-post — and a missed slot (skipped/failed cron) is caught up on the
// next run. This is what makes posting effectively mandatory even if GitHub cron flakes.
// 6 posts/day — 2 images, 2 carousels, 2 reels (videos) — spread across IST study peaks.
// dueUTC = when it becomes due (UTC hours). image `slot` picks the content lane; carousel/reel
// `offset` shifts the source day so the two of each type are DIFFERENT topics (not duplicates).
const IG_DAILY_PLAN = [
  { id: "img1",  type: "image",    slot: 0, dueUTC: 2.5  },   // ~08:00 IST — news/update image
  { id: "story1",type: "story",             dueUTC: 4.0  },   // ~09:30 IST — daily fact/tip Story
  { id: "carA",  type: "carousel", offset: 0, dueUTC: 6.0  }, // ~11:30 IST — carousel #1
  { id: "reelA", type: "reel",     offset: 2, dueUTC: 9.5  }, // ~15:00 IST — reel #1
  { id: "img2",  type: "image",    slot: 2, dueUTC: 13.0 },   // ~18:30 IST — quiz/exam image
  { id: "carB",  type: "carousel", offset: 1, dueUTC: 15.5 }, // ~21:00 IST — carousel #2
  { id: "reelB", type: "reel",     offset: 3, dueUTC: 17.0 }, // ~22:30 IST — reel #2
];
let _catchupRunning = false, _catchupStartedAt = 0;
// Anti-hammer state. When Meta hard-blocks publishing ("API access blocked", code 200), retrying
// every 20 min AND force-refreshing the token each time can ESCALATE the block. So on a block we
// pause AUTO attempts for a couple of hours (manual ?catchup=1 still forces through), and we cap
// forced token refreshes. A single successful post clears the pause.
let _igBlockUntil = 0, _lastForcedRefresh = 0;
const IG_BLOCK_RE = /api access blocked|code\D*200|\bpermission|oauth|\bblocked\b/i;
async function igCatchUp(ig, opts) {
  opts = opts || {};
  if (!IG_USER_ID || !IG_TOKEN) return { ok: false, error: "Missing IG_USER_ID / IG_ACCESS_TOKEN" };
  // GUARD against DUPLICATE POSTS — never run two catch-ups at once. The in-server scheduler,
  // the GitHub cron and the cron-job.org ping can all fire in the same window; without this
  // lock, two runs both read "slot not posted yet" and BOTH publish it. One Render instance,
  // so an in-memory lock is sufficient; the per-slot Firestore claim below is a second layer.
  // The lock auto-releases after 20 min so a hung run can never wedge posting forever (the finally
  // below covers exceptions; this covers hangs). 20 min — not 10 — because a full catch-up with two
  // slow reels can legitimately run ~15 min, and releasing mid-run is what let a second run overlap.
  if (_catchupRunning && (Date.now() - _catchupStartedAt) < 20 * 60 * 1000) return { ok: true, skipped: "another catch-up already in progress", postedNow: [], errors: [] };
  _catchupRunning = true; _catchupStartedAt = Date.now();
  try {
    const now = new Date(), date = now.toISOString().slice(0, 10);
    const nowH = now.getUTCHours() + now.getUTCMinutes() / 60, dow = now.getUTCDay();
    const postedNow = {}, errors = []; let log = {};
    const docRef = FS_DB ? FS_DB.collection("ig_daily_log").doc(date) : null;
    if (docRef) { try { const d = await docRef.get(); if (d.exists) log = d.data() || {}; } catch (e) { errors.push("log-read: " + e.message); } }
    // Owner-approval gate: post by default (auto-approve) UNLESS the owner explicitly REJECTED.
    if (FS_DB) { try { const pd = await FS_DB.collection("ig_prepared").doc(date).get(); if (pd.exists && (pd.data() || {}).status === "rejected") return { ok: true, date, skipped: "owner rejected this day's content", postedNow: [], errors: [] }; } catch (e) { /* never block posting */ } }
    // Backing off after a recent Meta publish-block? Skip AUTO attempts (manual ?catchup=1 forces).
    if (!opts.force && _igBlockUntil && Date.now() < _igBlockUntil) {
      return { ok: true, date, skipped: "paused after a Meta publish-block until " + new Date(_igBlockUntil).toISOString() + " (avoids escalating the block; auto-retries after)", postedNow: [], errors: [] };
    }
    const args = { baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_TOKEN, now };
    // An entry is "done" if it has a real mediaId, or "in flight" if claimed in the last 5 min
    // (being posted now). A stale claim (claimed, no mediaId, >5 min) means the earlier attempt
    // failed → it may be retried. CLAIMING in Firestore BEFORE posting guarantees at-most-once.
    // A REEL can take 5–6 min (video render + upload + Meta processing poll up to 240s + publish).
    // CLAIM_TTL MUST exceed the worst-case single post, or a slow reel's claim expires mid-post and
    // a concurrent/next run re-posts it → the duplicate-video bug. 15 min covers it with margin.
    const CLAIM_TTL = 15 * 60 * 1000;
    const isDone = (e) => !!(e && (e.mediaId || (e.claimedAt && Date.now() - e.claimedAt < CLAIM_TTL)));
    // ATOMIC check-and-claim in ONE Firestore transaction → two runs (in-server scheduler + GitHub
    // cron + cron-job.org) can NEVER both claim the same entry, even if the in-memory lock released.
    // Returns false if it's already posted or in-flight. This is the hard guarantee against duplicates.
    const tryClaim = async (key) => {
      if (!docRef || !FS_DB) return false;
      return await FS_DB.runTransaction(async (tx) => {
        const d = await tx.get(docRef);
        const cur = (d.exists ? (d.data() || {}) : {})[key];
        if (isDone(cur)) return false;
        tx.set(docRef, { [key]: { claimedAt: Date.now() } }, { merge: true });
        return true;
      });
    };
    // Post each due entry of today's plan, by type (image / carousel / reel). Idempotent via the
    // claim-before-post, so concurrent triggers never double-publish.
    const smartSched = await loadSmartSchedule();                               // null unless IG_SMART_SCHEDULE=1 + enough data
    for (const p of IG_DAILY_PLAN) {
      const dueUTC = (smartSched && typeof smartSched[p.id] === "number") ? smartSched[p.id] : p.dueUTC;
      if (nowH < dueUTC || isDone(log[p.id])) continue;                         // fast skip: not due, posted, or in-flight
      if (!docRef) { errors.push(p.id + ": no Firestore log — refusing (would risk duplicates)"); continue; }
      let claimed;
      try { claimed = await tryClaim(p.id); }                                   // ATOMIC claim → guarantees at-most-once
      catch (e) { errors.push(p.id + " claim: " + e.message); continue; }
      if (!claimed) continue;                                                   // another run already owns it (posted or in-flight)
      log[p.id] = { claimedAt: Date.now() };
      try {
        let r;
        if (p.type === "carousel") r = await ig.runCarousel(Object.assign({ offset: p.offset }, args));
        else if (p.type === "reel") r = await ig.runReel(Object.assign({ offset: p.offset }, args));
        else if (p.type === "story") r = await ig.runStory(args);
        else r = await ig.runDailyPost(Object.assign({ slot: p.slot }, args));
        log[p.id] = { mediaId: r.mediaId, type: p.type, ts: Date.now() }; postedNow[p.id] = r.mediaId;
        await docRef.set({ [p.id]: log[p.id] }, { merge: true });
        _igBlockUntil = 0;                                                      // publishing works → clear any backoff
      } catch (e) {
        const msg = String(e.message || e).slice(0, 160);
        errors.push(p.id + " (" + p.type + "): " + msg);                        // claim stays; TTL-expires for a retry
        if (IG_BLOCK_RE.test(msg)) {                                            // Meta hard-block → stop now, pause auto-attempts ~2h
          _igBlockUntil = Date.now() + 2 * 3600 * 1000;
          errors.push("⏸ Meta is blocking publishing — pausing auto-attempts ~2h so we don't escalate the block. Fix the token/permission, then hit ?catchup=1 to resume instantly.");
          // SAFETY NET: email the owner the still-due posts (caption + media attached) so nothing is
          // lost while blocked. Detached + throttled so it never holds or breaks the posting path.
          const stillDue = IG_DAILY_PLAN.filter((e) => nowH >= e.dueUTC && !isDone(log[e.id]));
          emailReadyPosts(ig, stillDue).catch(() => {});
          break;
        }
      }
      await new Promise((r) => setTimeout(r, 5000));                            // gap between posts (reels need processing headroom)
    }
    return { ok: errors.length === 0, date, posts: IG_DAILY_PLAN.length, postedNow: Object.keys(postedNow), errors };
  } finally { _catchupRunning = false; }
}

// ── Day-ahead content prep + AI verification + owner approval email ──────────────
// Each evening a cron hits ?prepare=1 → we generate TOMORROW's posts, AI-verify each
// (image rendered? caption complete & under the IG limit? Gemini fact/clarity check),
// store the plan in Firestore, and email the owner a preview with Approve/Reject links.
// Posting proceeds by default tomorrow ("auto-approve") UNLESS the owner clicks Reject —
// so a missed reply never stops posting, and an explicit reject holds the whole day.
const OWNER_EMAIL = process.env.OWNER_EMAIL || "narasatish966@gmail.com";
function prepToken(date, action) { return crypto.createHmac("sha256", AUTH_SECRET).update("igprep|" + action + "|" + date).digest("base64url"); }
function prepLink(date, action) { return IG_PUBLIC_BASE + "/api/ig/review?date=" + date + "&action=" + action + "&token=" + prepToken(date, action); }
// HTTP email via Resend (https://resend.com) — sends over HTTPS:443, which Render never
// blocks (unlike SMTP ports 465/587). Set RESEND_API_KEY in env to use it; it takes
// priority over SMTP. `from` must be a domain you've verified in Resend (e.g. landingprep.com).
async function sendViaResend(to, subject, html) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null; // not configured → caller falls back to SMTP
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM || SMTP.from, to: [to], subject, html, reply_to: SMTP.user }),
    });
    if (r.ok) return true;
    console.warn("[mail] Resend failed:", r.status, (await r.text().catch(() => "")).slice(0, 200));
    return false;
  } catch (e) { console.warn("[mail] Resend error:", e.message); return false; }
}
async function sendMailRich(to, subject, html, attachments) {
  if (!html) return false;
  if (process.env.RESEND_API_KEY && !(attachments && attachments.length)) { const r = await sendViaResend(to, subject, html); if (r) return true; }
  const t = mailer(); if (!t) { console.warn("[mail] rich send skipped: no email transport (set RESEND_API_KEY or SMTP_PASS)"); return false; }
  // Retry transient SMTP failures (Hostinger occasionally throttles / drops the connection)
  // so a single hiccup doesn't silently kill the owner-approval email.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { await t.sendMail({ from: SMTP.from, to, subject, html, replyTo: SMTP.user, attachments: attachments || [] }); return true; }
    catch (e) {
      console.warn(`[mail] rich send failed (attempt ${attempt}/3):`, e.message);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  return false;
}
// SAFETY NET — if Instagram publishing is blocked, the content is still rendered. Rather than let
// a post silently vanish, email the owner each due-but-unposted post: the caption + the ACTUAL
// rendered image / carousel slides / reel video attached, so they can publish it manually in
// seconds. Best-effort, throttled to once / 6h, detached (never holds the posting path). Auto-heals
// the moment direct publishing works again.
let _lastFallbackEmail = 0;
async function emailReadyPosts(ig, dueEntries) {
  if (!OWNER_EMAIL || !Array.isArray(dueEntries) || !dueEntries.length) return;
  if (Date.now() - _lastFallbackEmail < 6 * 3600 * 1000) return; // one digest per block episode
  _lastFallbackEmail = Date.now();
  const baseUrl = IG_PUBLIC_BASE, now = new Date();
  const localPath = (u) => path.join(ig.OUT_DIR, String(u).split("/").pop());
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const attachments = []; const cards = [];
  for (const p of dueEntries) {
    try {
      let topic = "", caption = "";
      if (p.type === "carousel") {
        const g = await ig.generateCarousel({ baseUrl, now, offset: p.offset });
        topic = g.content.topic; caption = g.caption;
        g.imageUrls.forEach((u, i) => { const fp = localPath(u); if (fs.existsSync(fp)) attachments.push({ filename: p.id + "-slide" + (i + 1) + ".png", path: fp }); });
      } else if (p.type === "reel") {
        const g = await ig.generateReel({ baseUrl, now, offset: p.offset });
        topic = g.topic; caption = g.caption;
        const fp = localPath(g.videoUrl); if (fs.existsSync(fp)) attachments.push({ filename: p.id + ".mp4", path: fp });
      } else {
        const g = await ig.generateDailyImage({ baseUrl, now, slot: p.slot });
        topic = (g.content && g.content.category) || "Post"; caption = g.caption;
        const fp = localPath(g.imageUrl); if (fs.existsSync(fp)) attachments.push({ filename: p.id + ".png", path: fp });
      }
      cards.push(`<div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:12px 0"><div style="font-weight:700;margin-bottom:6px">${esc(p.type.toUpperCase())} · ${esc(topic)}</div><pre style="white-space:pre-wrap;font-family:inherit;background:#f8fafc;padding:10px;border-radius:8px;margin:0">${esc(caption)}</pre><div style="color:#64748b;font-size:13px;margin-top:6px">📎 attached: ${esc(p.id)} media — tap, save, and post on Instagram.</div></div>`);
    } catch (e) { /* skip this one; still email the rest */ }
  }
  if (!cards.length) return;
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:680px;margin:0 auto;color:#0f172a"><h2 style="margin:0 0 4px">📲 Instagram auto-posting is blocked — here are today's ready posts</h2><p style="color:#475569;margin:0 0 12px">Direct publishing is temporarily blocked by Meta, so I couldn't auto-post. The content is ready below with the image/video <b>attached</b> — post it manually in a few taps. This auto-resumes the moment publishing works again; no action needed beyond posting these.</p>${cards.join("")}<p style="color:#94a3b8;font-size:12px">Check the <a href="https://landingprep.com/api/ig/post-daily?selftest=1">self-test</a> for status.</p></div>`;
  try { await sendMailRich(OWNER_EMAIL, "📲 LandingPrep IG blocked — " + cards.length + " ready post(s) to publish manually", html, attachments); }
  catch (e) { /* email is best-effort */ }
}
// AI verification of one caption (best-effort; NEVER blocks posting). Returns { ok, issues[] }.
async function geminiVerifyCaption(caption) {
  if (!GEMINI_API_KEY || !caption) return { ok: true, issues: [] };
  const prompt = "You are a strict fact-checker for a study-abroad Instagram brand for Indian students. " +
    "Review this caption ONLY for: (1) clear factual errors about exams, visas, universities or countries; " +
    "(2) obviously cut-off / incomplete sentences; (3) anything misleading. Ignore style and tone. " +
    "If it is fine, reply with exactly: OK. Otherwise reply with a short bullet list of the specific problems.\n\nCAPTION:\n" + caption;
  try {
    const r = await Promise.race([
      geminiPost("gemini-2.5-flash", { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0, thinkingConfig: { thinkingBudget: 0 } } }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 15000)),
    ]);
    const txt = String((r && r.text) || "").trim();
    if (!txt || /^ok\b/i.test(txt)) return { ok: true, issues: [] };
    const issues = txt.split("\n").map((l) => l.replace(/^[-•*\d.\s]+/, "").trim()).filter(Boolean).slice(0, 5);
    return { ok: issues.length === 0, issues };
  } catch (e) { return { ok: true, issues: [] }; }
}
async function verifyPreparedPost(g) {
  const issues = []; const cap = (g && g.caption) || "";
  if (!g || !g.file) issues.push("⛔ image did not render");
  if (cap.length < 60) issues.push("⛔ caption too short or empty");
  if (cap.length > 2200) issues.push("⛔ caption exceeds Instagram's 2,200-char limit");
  const hard = issues.length > 0;
  const ai = await geminiVerifyCaption(cap);
  if (!ai.ok) ai.issues.forEach((i) => issues.push("⚠️ " + i));
  return { ok: !hard && ai.ok, issues };
}
function igDigestHtml(date, posts, carousel, allOk) {
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const slotTime = ["8:00am", "12:30pm", "4:00pm", "7:30pm", "9:30pm"];
  let b = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:680px;margin:0 auto;color:#0f172a">`;
  b += `<h2 style="margin:0 0 4px">📅 Tomorrow's Instagram posts — ${esc(date)}</h2>`;
  b += `<p style="color:#475569;margin:0 0 14px">AI verification: <b style="color:${allOk ? "#16a34a" : "#d97706"}">${allOk ? "all clear ✅" : "please check the ⚠️ items"}</b>. Reply by <b>11:59 pm IST</b>. If you don't, these auto-post tomorrow.</p>`;
  b += `<div style="margin:14px 0"><a href="${prepLink(date, "approve")}" style="background:#16a34a;color:#fff;text-decoration:none;padding:11px 22px;border-radius:9px;font-weight:700;margin-right:10px">✅ Approve &amp; post</a><a href="${prepLink(date, "reject")}" style="background:#ef4444;color:#fff;text-decoration:none;padding:11px 22px;border-radius:9px;font-weight:700">🛑 Reject (hold tomorrow)</a></div>`;
  posts.forEach((p) => {
    b += `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:12px 0"><div style="font-weight:700;margin-bottom:6px">Slot ${p.slot + 1} · ${esc(slotTime[p.slot] || "")} IST · ${esc(p.theme || "")} ${p.ok ? "✅" : "⚠️"}</div>`;
    if (p.imageUrl) b += `<img src="cid:slot${p.slot}" alt="post" style="max-width:280px;border-radius:8px;display:block;margin:6px 0"/>`;
    if (p.issues && p.issues.length) b += `<div style="color:#b45309;font-size:13px;margin:4px 0">${p.issues.map(esc).join("<br>")}</div>`;
    b += `<pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;color:#334155;background:#f8fafc;padding:10px;border-radius:8px;margin:6px 0 0">${esc(p.caption || "")}</pre></div>`;
  });
  if (carousel) b += `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:12px 0"><div style="font-weight:700">Carousel · ${esc(carousel.topic || "")} ${carousel.ok ? "✅" : "⚠️"}</div>${carousel.issues && carousel.issues.length ? `<div style="color:#b45309;font-size:13px">${carousel.issues.map(esc).join("<br>")}</div>` : ""}<pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;color:#334155;background:#f8fafc;padding:10px;border-radius:8px">${esc(carousel.caption || "")}</pre></div>`;
  b += `<p style="color:#94a3b8;font-size:12px;margin-top:16px">LandingPrep auto-poster · internal owner notification.</p></div>`;
  return b;
}
async function prepareTomorrow(ig, opts = {}) {
  if (!ig || !ig.generateDailyImage) return { ok: false, error: "poster not ready" };
  const tmrw = new Date(Date.now() + 24 * 3600 * 1000);
  const date = tmrw.toISOString().slice(0, 10), dow = tmrw.getUTCDay();
  // Idempotency: if tomorrow is already prepared AND the approval email went out (or the owner
  // already approved/rejected), don't re-render or re-email. Lets the server scheduler and the
  // GitHub cron both call this safely without sending duplicate emails. ?prepare=1&force=1 overrides.
  if (FS_DB && !opts.force) {
    try {
      const d = await FS_DB.collection("ig_prepared").doc(date).get();
      const pd = d.exists ? (d.data() || {}) : null;
      if (pd && (pd.emailSent === true || pd.status === "approved" || pd.status === "rejected")) {
        return { ok: true, skipped: "already prepared & emailed", emailSent: true, date };
      }
    } catch (e) { /* on read error, fall through and prepare (better a rare dup than no email) */ }
  }
  const baseUrl = IG_PUBLIC_BASE, OUT = ig.OUT_DIR;
  const posts = [], attachments = [];
  for (let slot = 0; slot < 5; slot++) {
    try {
      const g = await ig.generateDailyImage({ slot, now: tmrw, baseUrl });
      const v = await verifyPreparedPost(g);
      posts.push({ slot, theme: (g.content && g.content.category) || "", caption: g.caption, imageUrl: g.imageUrl, ok: v.ok, issues: v.issues });
      if (g.file && OUT) { const p = path.join(OUT, g.file); if (fs.existsSync(p)) attachments.push({ filename: "slot" + slot + ".png", path: p, cid: "slot" + slot }); }
    } catch (e) { posts.push({ slot, ok: false, issues: ["⛔ render failed: " + e.message] }); }
  }
  let carousel = null;
  if (dow === 0 || dow === 3) {
    try { const r = await ig.generateCitiesCarousel({ baseUrl, now: tmrw, offset: dow === 3 ? 3 : 0 }); carousel = { topic: r.country, caption: r.caption, ok: true, issues: [] };
      const av = await geminiVerifyCaption(r.caption); if (!av.ok) { carousel.ok = false; carousel.issues = av.issues.map((i) => "⚠️ " + i); } }
    catch (e) { carousel = { ok: false, issues: ["⛔ carousel render failed: " + e.message], caption: "" }; }
  }
  const allOk = posts.every((p) => p.ok) && (!carousel || carousel.ok);
  if (FS_DB) { try { await FS_DB.collection("ig_prepared").doc(date).set({ date, status: "pending", allOk, posts: posts.map((p) => ({ slot: p.slot, theme: p.theme || "", ok: p.ok, issues: p.issues || [] })), carousel: carousel ? { topic: carousel.topic || "", ok: carousel.ok, issues: carousel.issues || [] } : null, preparedAt: Date.now() }, { merge: false }); } catch (e) { console.warn("[igprep] store:", e.message); } }
  const emailSent = await sendMailRich(OWNER_EMAIL, `📅 Tomorrow's Instagram posts (${date}) — ${allOk ? "verified ✅" : "needs a look ⚠️"}`, igDigestHtml(date, posts, carousel, allOk), attachments);
  // Record email status on the prepared doc so the self-test / scheduler can see whether the
  // owner-approval email actually went out (the missing-email failure mode is now visible).
  if (FS_DB) { try { await FS_DB.collection("ig_prepared").doc(date).set({ emailSent, emailedAt: emailSent ? Date.now() : null }, { merge: true }); } catch (e) { /* ignore */ } }
  if (!emailSent) console.warn("[igprep] approval email did NOT send for", date, "— check SMTP_PASS in env");
  return { ok: true, emailSent, date, emailedTo: OWNER_EMAIL, allOk, posts: posts.map((p) => ({ slot: p.slot, ok: p.ok, issues: p.issues })), carousel: carousel && { ok: carousel.ok, issues: carousel.issues } };
}
// Owner clicks Approve / Reject from the email (signed link — no secret needed).
app.get("/api/ig/review", async (req, res) => {
  const date = String(req.query.date || ""), action = String(req.query.action || ""), token = String(req.query.token || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !["approve", "reject"].includes(action) || token !== prepToken(date, action)) return res.status(400).send("Invalid or expired review link.");
  const status = action === "approve" ? "approved" : "rejected";
  if (FS_DB) { try { await FS_DB.collection("ig_prepared").doc(date).set({ status, reviewedAt: Date.now() }, { merge: true }); } catch (e) { return res.status(500).send("Could not save — try again."); } }
  res.set("Content-Type", "text/html").send(`<div style="font-family:system-ui;max-width:520px;margin:60px auto;text-align:center"><h2>${action === "approve" ? "✅ Approved" : "🛑 Rejected"}</h2><p style="color:#475569">${action === "approve" ? "Tomorrow's posts (" + date + ") are approved and will publish on schedule." : "Tomorrow's posts (" + date + ") are on hold and will NOT publish."} <a href="https://landingprep.com/">Back to LandingPrep</a></p></div>`);
});
app.all("/api/ig/post-daily", async (req, res) => {
  // ?selftest=1 → SAFE diagnostic, NO secret required. Reveals WHY automation may be failing
  // without exposing any secret/token values: which env vars are set, whether the Instagram
  // token is still valid right now, and how many of today's slots are logged as posted.
  if (String(req.query.selftest || "") === "1") {
    const out = {
      ok: true,
      env: { IG_USER_ID: !!IG_USER_ID, IG_ACCESS_TOKEN: !!IG_ACCESS_TOKEN, IG_POST_SECRET: !!IG_POST_SECRET, FIRESTORE: !!FS_DB, IG_PUBLIC_BASE: IG_PUBLIC_BASE || null },
      tokenValid: null, tokenError: null, account: null, today: null, hint: null,
      email: { smtpConfigured: !!SMTP.pass, ownerEmail: OWNER_EMAIL, tomorrowPrepared: null, tomorrowEmailSent: null },
      scheduler: { serverSideBackup: !!(IG_USER_ID && IG_ACCESS_TOKEN && IG_POST_SECRET) },
    };
    try {
      const ig = require("./scripts/ig-poster.js");
      if (IG_TOKEN) {
        const info = await ig.whoami({ token: IG_TOKEN });
        if (info && !info.error) { out.tokenValid = true; out.account = info.username || info.name || null; }
        else { out.tokenValid = false; out.tokenError = (info && (info.error && info.error.message || info.error)) || "unknown"; }
      }
    } catch (e) { out.tokenError = "poster module: " + e.message; }
    try {
      if (FS_DB) {
        const now = new Date(), date = now.toISOString().slice(0, 10);
        const d = await FS_DB.collection("ig_daily_log").doc(date).get();
        const log = d.exists ? (d.data() || {}) : {};
        out.today = { date, postedSlots: IG_DAILY_PLAN.filter((p) => log[p.id] && log[p.id].mediaId).length, ofSlots: IG_DAILY_PLAN.length, breakdown: IG_DAILY_PLAN.map((p) => p.type[0] + ":" + (log[p.id] && log[p.id].mediaId ? "✓" : "·")).join(" ") };
        const tmrw = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
        const pd = await FS_DB.collection("ig_prepared").doc(tmrw).get();
        out.email.tomorrowPrepared = pd.exists;
        out.email.tomorrowEmailSent = pd.exists ? ((pd.data() || {}).emailSent === true) : false;
        const auth = await FS_DB.collection("ig_config").doc("auth").get();
        const at = auth.exists ? (auth.data() || {}) : {};
        out.token = { autoRefresh: true, lastRefreshedAt: at.refreshedAt ? new Date(at.refreshedAt).toISOString() : "not yet (refreshes on the next server tick)" };
        const al = await FS_DB.collection("ig_config").doc("alerts").get();
        out.recentAlerts = al.exists ? al.data() : null;
      }
    } catch (e) { /* ignore */ }
    out.hint = !out.env.IG_ACCESS_TOKEN ? "IG_ACCESS_TOKEN is not set in Render env."
      : !out.env.IG_POST_SECRET ? "IG_POST_SECRET is not set — the GitHub cron gets 403 and nothing posts."
      : out.tokenValid === false ? "Instagram token is INVALID/EXPIRED — regenerate it in Meta and update IG_ACCESS_TOKEN in Render. Catch-up self-heals once fixed."
      : !out.env.FIRESTORE ? "Firestore not configured — catch-up refuses to post without its log (to avoid duplicates)."
      : !out.email.smtpConfigured ? "SMTP_PASS is not set in Render env — that's why the daily owner-approval email never arrives. Posting still works; set SMTP_PASS (Hostinger mailbox password for support@landingprep.com) to get the emails."
      : "Config looks healthy. Posting + the evening approval email now also run from the server itself (backup scheduler), so they no longer depend on GitHub Actions.";
    return res.status(200).json(out);
  }
  const key = req.query.key || req.headers["x-ig-secret"] || "";
  if (!IG_POST_SECRET || key !== IG_POST_SECRET) return res.status(403).json({ ok: false, error: "forbidden" });
  let ig;
  try { ig = require("./scripts/ig-poster.js"); }
  catch (e) { return res.status(500).json({ ok: false, error: "poster module/sharp not available: " + e.message }); }
  try {
    // ?refreshtoken=1 → force an Instagram token refresh now (secret-gated). Verifies the
    // refreshed token with whoami so you can confirm it worked.
    if (String(req.query.refreshtoken || "") === "1") {
      const rr = await refreshIgToken(true);
      let account = null; try { const info = await ig.whoami({ token: IG_TOKEN }); if (info && !info.error) account = info.igUsername || info.username || info.name || null; } catch (e) {}
      return res.status(rr.ok ? 200 : 500).json({ ...rr, account, tokenLength: (IG_TOKEN || "").length });
    }
    if (String(req.query.whoami || "") === "1") {
      const info = await ig.whoami({ token: IG_TOKEN });
      return res.json({ ok: !info.error, ...info });
    }
    // ?status=1 → READ-ONLY: today's posting log (which slots are posted / due / pending). No posting.
    if (String(req.query.status || "") === "1") {
      const now = new Date(), date = now.toISOString().slice(0, 10);
      const nowH = now.getUTCHours() + now.getUTCMinutes() / 60, dow = now.getUTCDay();
      let log = {};
      if (FS_DB) { try { const d = await FS_DB.collection("ig_daily_log").doc(date).get(); if (d.exists) log = d.data() || {}; } catch (e) { /* ignore */ } }
      const hhmm = (h) => String(Math.floor(h)).padStart(2, "0") + ":" + String(Math.round((h % 1) * 60)).padStart(2, "0");
      const slots = IG_DAILY_PLAN.map((p) => ({
        id: p.id, type: p.type, dueUTC: hhmm(p.dueUTC),
        state: (log[p.id] && log[p.id].mediaId) ? "posted" : (nowH >= p.dueUTC ? "PENDING (posts next catch-up window)" : "not due yet"),
        mediaId: (log[p.id] && log[p.id].mediaId) || null,
      }));
      const pending = slots.filter((s) => s.state.startsWith("PENDING")).map((s) => s.id);
      return res.json({ ok: true, date, nowUTC: now.toISOString(), firestore: !!FS_DB,
        plan: "6 posts + 1 story/day (2 image · 2 carousel · 2 reel · 1 story) + comment auto-reply",
        posted: slots.filter((s) => s.state === "posted").map((s) => s.id),
        pending, slots,
        note: pending.length ? "Pending posts self-heal on the next catch-up window." : "All due posts are done." });
    }
    // ?catchup=1 → self-healing daily poster (used by the cron): posts any of today's
    // still-unposted slots, idempotent via the Firestore log. This is the reliable path.
    // Responds INSTANTLY (202) and does the posting in the background, so external cron
    // pingers (cron-job.org has a ~30s request limit) never see a "timeout" while the
    // server is busy rendering images. Idempotent → safe to fire-and-forget. Add &wait=1
    // to block for the JSON result instead (handy for manual debugging).
    if (String(req.query.catchup || "") === "1") {
      if (String(req.query.wait || "") === "1") { const out = await igCatchUp(ig, { force: true }); return res.status(out.ok ? 200 : 207).json(out); }
      res.status(202).json({ ok: true, started: true, mode: "catchup", note: "running in background" });
      igCatchUp(ig, { force: true }).then((r) => { if (r && r.postedNow && r.postedNow.length) console.log("[catchup-http] posted:", r.postedNow.join(",")); if (r && r.errors && r.errors.length) console.warn("[catchup-http] errors:", r.errors.join(" | ")); })
                   .catch((e) => console.warn("[catchup-http]", e.message));
      return;
    }
    // ?prepare=1 → prepare TOMORROW's posts, AI-verify them, and email the owner for approval.
    // Run this each evening (cron). Posting auto-approves unless the owner clicks Reject.
    // Also background (renders 5 images + AI checks → well over a cron's timeout). &wait=1 to block.
    if (String(req.query.prepare || "") === "1") {
      const force = String(req.query.force || "") === "1";
      if (String(req.query.wait || "") === "1") { const out = await prepareTomorrow(ig, { force }); return res.status(out.ok && out.emailSent !== false ? 200 : 500).json(out); }
      res.status(202).json({ ok: true, started: true, mode: "prepare", note: "running in background" });
      prepareTomorrow(ig, { force }).then((p) => { if (p && p.date) console.log("[prepare-http] prepared", p.date, "emailSent=" + p.emailSent); })
                                    .catch((e) => console.warn("[prepare-http]", e.message));
      return;
    }
    // ?insights=1 → send the weekly report email now (secret-gated; &force=1 to re-send same day).
    if (String(req.query.insights || "") === "1") {
      const out = await igWeeklyInsights(ig, String(req.query.force || "") === "1");
      return res.status(out && out.ok ? 200 : 500).json(out || { ok: false });
    }
    // ── batch/pool mode (pre-made Canva posts in /ig-pool/) ───────────────────
    // ?pool=preview → list pool items (no posting)
    // ?pool=next    → post today's pool item (rotates by date)
    // ?pool=N       → post the pool item at index N
    // ── DUPLICATE GUARD ──────────────────────────────────────────────────────
    // The direct one-off posting endpoints below (pool / carousel / cities / all / slot) BYPASS the
    // daily-log dedup, so ANY cron hitting one of them re-posts the same content on every fire —
    // the duplicate-post bug. Automated posting MUST use ?catchup=1 (atomic, at-most-once). Allow a
    // direct post only for an explicit human one-off (&manual=1) or a preview (which never posts).
    {
      const _manual = String(req.query.manual || "") === "1";
      const _preview = String(req.query.preview || "") !== "" || String(req.query.pool || "") === "preview";
      if (!_manual && !_preview) {
        return res.status(200).json({ ok: true, skipped: "direct posting disabled to prevent duplicates — automated posting runs through ?catchup=1 (deduplicated). Add &manual=1 to force a one-off post." });
      }
    }
    if (req.query.pool != null && req.query.pool !== "") {
      const pq = String(req.query.pool);
      if (pq === "preview") return res.json({ ok: true, preview: true, pool: ig.listPool({ baseUrl: IG_PUBLIC_BASE }) });
      const index = pq === "next" ? null : Number(pq);
      const out = await ig.runPoolPost({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_TOKEN, index });
      return res.json(out);
    }
    // slot: which of the 5 daily themes (0..4). If omitted, derived from the UTC hour.
    const hasSlot = req.query.slot != null && req.query.slot !== "";
    const slot = hasSlot ? Number(req.query.slot) : null;
    const pv = String(req.query.preview || "");
    // ?carousel=1 → publish today's multi-slide carousel (add &preview=1 → just return the slide URLs)
    if (String(req.query.carousel || "") === "1") {
      if (pv) { const g = await ig.generateCarousel({ baseUrl: IG_PUBLIC_BASE }); return res.json({ ok: true, preview: true, type: "carousel", topic: g.content.topic, slides: g.imageUrls, caption: g.caption }); }
      const out = await ig.runCarousel({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_TOKEN });
      return res.json(out);
    }
    // ?cities=1 → publish this week's "Top cities to study in <country>" carousel (rotates weekly)
    if (String(req.query.cities || "") === "1") {
      if (pv) { const g = await ig.generateCitiesCarousel({ baseUrl: IG_PUBLIC_BASE }); return res.json({ ok: true, preview: true, type: "cities-carousel", country: g.country, slides: g.imageUrls, caption: g.caption }); }
      const out = await ig.runCitiesCarousel({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_TOKEN });
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
      const out = await ig.runAllSlots({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_TOKEN });
      return res.json(out);
    }
    const out = await ig.runDailyPost({ baseUrl: IG_PUBLIC_BASE, igUserId: IG_USER_ID, token: IG_TOKEN, slot });
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
// Gemini model fallback chain — tried in order until one succeeds.
// ⚠️ Google RETIRES these on a rolling basis and a retired id returns HTTP 404, which
// silently kills every AI feature (tutor, band checker, speaking). Both previous entries
// died: gemini-1.5-flash (1.5 family shut down) and gemini-2.5-flash (pulled 9 Jul 2026,
// ahead of its announced 16 Oct 2026 date) — that outage ran ~8 days unnoticed.
// Keep newest-GA first, and re-check https://ai.google.dev/gemini-api/docs/deprecations
// whenever AI answers start failing. GET /api/health?probe=ai verifies the chain live.
// Cheapest + FASTEST first. Measured on production (same 3 questions, July 2026):
//   gemini-3.1-flash-lite  ~3.4s
//   gemini-3.5-flash       ~30s, and 78s on one answer — unusable for a chat UI
// flash-lite answers exam questions correctly, so leading with the frontier model was
// paying more for a far worse experience. Later entries are fallbacks only.
const MODEL_CHAIN = ["gemini-3.1-flash-lite", "gemini-2.5-flash-lite", "gemini-3.5-flash"];

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

VERIFIED FACTS — use these exact numbers; do NOT estimate or recall your own:
- GRE percentiles (official ETS interpretive data, test takers Jul 2022–Jun 2025):
  Quantitative 170=89th, 168=80th, 165=67th, 162=57th, 160=50th, 155=37th, 150=23rd.
  Verbal 170=99th, 165=95th, 163=90th, 160=82nd, 155=64th, 152=48th, 150=39th.
  Analytical Writing 6.0=99th, 5.0=93rd, 4.5=85th, 4.0=63rd, 3.5=40th.
  A perfect 170 Quant is the 89th percentile (NOT 94th/96th) — Quant percentiles run far
  lower than Verbal because the GRE pool is quantitatively strong. If asked for a
  percentile not listed, say it varies and link /tools/gre-score-percentile-calculator/.
- GMAT Focus Edition total score range is 205–805 (scores end in 5, 10-point steps).
- IELTS overall band = the average of the four sections rounded to the nearest half band
  (an average ending .25 rounds UP to .5; .75 rounds UP to the next whole band).
- Germany blocked account (2026): EUR 11,904/year (EUR 992/month). Canada GIC: CAD 20,635.
  UK maintenance: GBP 1,529/month in London, GBP 1,171/month outside, for up to 9 months.

Guidelines:
- Give specific, actionable advice — not generic encouragement
- NEVER invent a statistic, percentile, fee or deadline. If it is not in the verified list
  above and you are not certain, say so plainly and point to the official body or the
  relevant free LandingPrep tool rather than guessing a number.
- Reference real exam patterns (e.g. IELTS Listening has 4 parts, 40 questions; TOEFL Writing uses Integrated + Academic Discussion tasks)
- Keep responses focused and under 200 words unless the user explicitly asks for a detailed explanation
- If the user pastes their writing, give structured feedback on Task Achievement, Coherence, Lexical Resource, and Grammar
- If asked for a model answer, write one that genuinely demonstrates Band 7+ / CEFR C1 quality
- Never make up exam registration details — direct users to official websites
- If you don't know something specific, say so honestly

Tone: professional but warm — like a trusted tutor who wants the student to succeed.`;
}

// Never let an upstream error echo the API key back to a caller or into a log.
// The key travels in the Gemini URL query string, so any error that quotes the URL
// would otherwise leak it.
function scrubSecrets(msg) {
  if (!msg) return undefined;
  let s = String(msg).slice(0, 300);
  for (const k of [GEMINI_API_KEY_FREE, GEMINI_API_KEY]) if (k) s = s.split(k).join("[redacted]");
  return s.replace(/([?&]key=)[^&\s"']+/gi, "$1[redacted]");
}

// ── AI response cache ─────────────────────────────────────────────────────────
// Identical (model + system prompt + conversation) → identical answer, so serve it
// from memory instead of paying for it again. Exam questions repeat heavily across
// students ("how many parts in IELTS listening?"), so this is the single biggest
// lever on spend. A cache hit costs nothing and bypasses BOTH the quota caps and the
// free/paid ladder entirely — it never touches Google.
const AI_CACHE = new Map(); // key -> { text, model, ts }
const AI_CACHE_MAX = parseInt(process.env.AI_CACHE_MAX || "500", 10);
const AI_CACHE_TTL_MS = parseInt(process.env.AI_CACHE_TTL_H || "72", 10) * 3600 * 1000;
const aiCacheKey = (model, body) => crypto.createHash("sha256")
  .update(model + " " + JSON.stringify(body)).digest("base64url");
function aiCacheGet(key) {
  const hit = AI_CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > AI_CACHE_TTL_MS) { AI_CACHE.delete(key); return null; }
  // Refresh recency so hot answers survive eviction (approximate LRU).
  AI_CACHE.delete(key); AI_CACHE.set(key, hit);
  return hit;
}
function aiCacheSet(key, text, model) {
  if (!text) return; // never cache an empty answer
  if (AI_CACHE.size >= AI_CACHE_MAX) AI_CACHE.delete(AI_CACHE.keys().next().value); // evict oldest
  AI_CACHE.set(key, { text, model, ts: Date.now() });
}

// Paid-call accounting. Free-key calls and cache hits are deliberately NOT counted —
// only real spend counts against the budget.
const AI_SPEND = { paidCalls: 0, freeCalls: 0, cacheHits: 0, day: new Date().toISOString().slice(0, 10) };
const AI_PAID_RPD = parseInt(process.env.AI_PAID_RPD || "200", 10); // hard daily cap on PAID calls
function aiRollDay() {
  const d = new Date().toISOString().slice(0, 10);
  if (d !== AI_SPEND.day) { AI_SPEND.day = d; AI_SPEND.paidCalls = 0; AI_SPEND.freeCalls = 0; AI_SPEND.cacheHits = 0; }
}

// Try every model on the FREE key first, then (only if allowed) the paid key.
// Quota/rate errors fall through to the next option; a genuine model error does too,
// so one dead model never takes the whole feature down.
// bodyFor may be an object, or a function(model) when the payload varies per model
// (e.g. thinkingConfig only applies to some families).
async function geminiWithLadder(bodyFor, { allowPaid = true, cacheSeed } = {}) {
  aiRollDay();
  const bodyOf = (m) => (typeof bodyFor === "function" ? bodyFor(m) : bodyFor);
  // Cache key is model-INDEPENDENT (seeded on the conversation), so an answer already
  // paid for is reused no matter which model in the ladder produced it.
  const key = aiCacheKey("v1", cacheSeed || bodyOf(MODEL_CHAIN[0]));
  const cached = aiCacheGet(key);
  if (cached) { AI_SPEND.cacheHits++; return { text: cached.text, model: cached.model, cached: true, paid: false }; }

  let lastErr = null;
  for (const cred of AI_KEYS) {
    if (cred.paid && !allowPaid) continue;
    if (cred.paid && AI_SPEND.paidCalls >= AI_PAID_RPD) {
      lastErr = new Error(`Paid daily cap reached (${AI_PAID_RPD}) — refusing to spend more today.`);
      continue;
    }
    for (const model of MODEL_CHAIN) {
      try {
        const r = await geminiPost(model, bodyOf(model), cred.key);
        if (cred.paid) AI_SPEND.paidCalls++; else AI_SPEND.freeCalls++;
        aiCacheSet(key, r.text, r.model);
        return { text: r.text, model: r.model, cached: false, paid: cred.paid };
      } catch (e) {
        lastErr = e;
        console.warn(`[ai] ${cred.label}/${model} failed:`, String(e.message).slice(0, 120));
      }
    }
  }
  throw lastErr || new Error("No Gemini credential configured");
}

// Make a non-streaming HTTPS POST to Gemini and return the response text
function geminiPost(model, body, apiKey) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey || GEMINI_API_KEY}`;
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
function geminiStream(model, body, res, apiKey) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey || GEMINI_API_KEY}`;
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
  if (!AI_ENABLED) {
    return res.status(503).json({ error: "AI is temporarily switched off.", killSwitch: true });
  }
  if (!AI_KEYS.length) {
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

  let lastErr = null;

  // Non-streaming: free-key-first ladder + cache (a repeat question costs nothing).
  if (!wantStream) {
    try {
      const r = await geminiWithLadder(geminiBody, { cacheSeed: { sys: systemPrompt, msgs: fixed } });
      return res.json({ answer: r.text, model: r.model, cached: r.cached, tier: r.cached ? "cache" : (r.paid ? "paid" : "free") });
    } catch (e) {
      lastErr = e;
    }
  } else {
    // Streaming can't be cached mid-flight, but still prefers the free key.
    for (const cred of AI_KEYS) {
      if (cred.paid && AI_SPEND.paidCalls >= AI_PAID_RPD) continue;
      for (const model of MODEL_CHAIN) {
        try {
          await geminiStream(model, geminiBody(model), res, cred.key);
          if (cred.paid) AI_SPEND.paidCalls++; else AI_SPEND.freeCalls++;
          return;
        } catch (e) {
          lastErr = e;
          console.warn(`[ai-tutor] ${cred.label}/${model} stream failed:`, String(e.message).slice(0, 120));
        }
      }
    }
  }

  // All models failed. Surface a sanitised reason: the previous generic message hid an
  // 8-day outage caused by Google retiring every model in MODEL_CHAIN (HTTP 404).
  res.status(502).json({
    error: "AI service temporarily unavailable. Please try again in a moment.",
    fallback: true,
    reason: scrubSecrets(lastErr && lastErr.message),
    triedModels: MODEL_CHAIN,
  });
});

// ── POST /api/ai-tutor/generate ───────────────────────────────────────────────
// One-shot generation used by rebuild tools.
// Body: { prompt: "...", json: true }
app.post("/api/ai-tutor/generate", async (req, res) => {
  if (!AI_ENABLED) return res.status(503).json({ error: "AI is temporarily switched off.", killSwitch: true });
  if (!AI_KEYS.length) return res.status(503).json({ error: "Not configured" });
  const { prompt, jsonMode } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt required" });

  try {
    const r = await geminiWithLadder((model) => ({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4096,
        ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        ...(model.startsWith("gemini-2.5") ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
      },
    }), { cacheSeed: { gen: prompt, json: !!jsonMode } });
    return res.json({ text: r.text, model: r.model, cached: r.cached, tier: r.cached ? "cache" : (r.paid ? "paid" : "free") });
  } catch (e) {
    console.warn("[generate] all options failed:", String(e.message).slice(0, 150));
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

// ── Durable mirror of the NON-account state ────────────────────────────────────
// Newsletter subscribers, reviews, web-push subs and the community Q&A live only in
// JSON files — Render wipes those on every restart. Mirror them to Firestore singleton
// docs (collection "app_state") and reload on boot, exactly like accounts above.
// SAFETY: never write before a successful hydrate, so a Firestore read-blip can't make
// us overwrite good cloud data with the empty file-state we boot with.
let fsStateReady = false;
let fsStateTimer = null;
const fsStatePending = new Set();
async function fsHydrateState() {
  if (!FS_DB) { fsStateReady = true; return; } // no cloud → file-only is fine, allow saves (no-op)
  try {
    const get = async (id) => { const d = await FS_DB.collection("app_state").doc(id).get(); return d.exists ? (d.data() || {}).data : undefined; };
    const subs = await get("subscribers"); if (subs && typeof subs === "object") STORE.subscribers = subs;
    const revs = await get("reviews"); if (Array.isArray(revs)) STORE.reviews = revs;
    const push = await get("pushSubs"); if (push && typeof push === "object") STORE.pushSubs = push;
    const comm = await get("community"); if (comm && Array.isArray(comm.questions)) COMM = comm;
    fsStateReady = true;
    console.log("[firestore] hydrated app state — subscribers:" + Object.keys(STORE.subscribers || {}).length +
      " reviews:" + (STORE.reviews || []).length + " push:" + Object.keys(STORE.pushSubs || {}).length +
      " community-Q:" + ((COMM && COMM.questions) || []).length);
  } catch (e) { console.warn("[firestore] state hydrate failed (staying file-only to avoid data loss):", e.message); }
}
// Mirror one state "part" to Firestore (debounced + batched). Singleton docs are fine up to
// ~1 MB each; at scale, migrate subscribers/reviews to per-doc collections.
function fsSaveState(part) {
  if (!FS_DB || !fsStateReady) return;
  fsStatePending.add(part);
  clearTimeout(fsStateTimer);
  fsStateTimer = setTimeout(() => {
    const map = { subscribers: STORE.subscribers, reviews: STORE.reviews, pushSubs: STORE.pushSubs, community: COMM };
    for (const p of fsStatePending) {
      const data = map[p];
      if (data === undefined) continue;
      FS_DB.collection("app_state").doc(p).set({ data, ts: Date.now() })
        .catch((e) => console.warn("[firestore] state save failed (" + p + "):", e.message));
    }
    fsStatePending.clear();
  }, 400);
}

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
  if (!_transport) _transport = nodemailer.createTransport({ host: SMTP.host, port: SMTP.port, secure: SMTP.port === 465, auth: { user: SMTP.user, pass: SMTP.pass },
    family: 4, // force IPv4 — Render has no IPv6 route, so an IPv6 SMTP address fails ENETUNREACH
    connectionTimeout: 30000, greetingTimeout: 25000, socketTimeout: 45000 }); // generous — Render↔Hostinger can be slow, but never hang forever
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
  if (!html) return false;
  if (process.env.RESEND_API_KEY) { const r = await sendViaResend(to, subject, html); if (r) return true; }
  const t = mailer();
  if (!t) return false;
  try { await t.sendMail({ from: SMTP.from, to, subject, html, replyTo: SMTP.user }); return true; }
  catch (e) { console.warn("[mail] send failed:", e.message); return false; }
}

// ── Newsletter (weekly digest) ─────────────────────────────────────────────────
// One-click unsubscribe via a signed link (no login needed) + an admin-only send
// endpoint. Schedule the send with a GitHub Action (.github/workflows/newsletter.yml).
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";
function unsubToken(email) { return crypto.createHmac("sha256", AUTH_SECRET).update("unsub|" + String(email).toLowerCase()).digest("base64url"); }
function unsubLink(email) { return "https://landingprep.com/api/newsletter/unsubscribe?email=" + encodeURIComponent(email) + "&token=" + unsubToken(email); }
// Double opt-in: a separate signed token to confirm a newsletter sign-up.
function confirmToken(email) { return crypto.createHmac("sha256", AUTH_SECRET).update("confirm|" + String(email).toLowerCase()).digest("base64url"); }
function confirmLink(email) { return "https://landingprep.com/api/newsletter/confirm?email=" + encodeURIComponent(email) + "&token=" + confirmToken(email); }

app.get("/api/newsletter/unsubscribe", (req, res) => {
  const email = String(req.query.email || "").toLowerCase();
  const token = String(req.query.token || "");
  if (!validEmail(email) || token !== unsubToken(email)) return res.status(400).send("Invalid or expired unsubscribe link.");
  if (STORE.users[email]) { STORE.users[email].noNewsletter = true; persistUser(email); }
  if (STORE.subscribers && STORE.subscribers[email]) { delete STORE.subscribers[email]; persist(); fsSaveState("subscribers"); }
  res.set("Content-Type", "text/html").send(
    "<div style='font-family:system-ui;max-width:540px;margin:60px auto;text-align:center'>" +
    "<h2>You're unsubscribed ✅</h2><p style='color:#475569'>You won't receive LandingPrep newsletters anymore. " +
    "You can re-enable them anytime from your account. <a href='https://landingprep.com/'>Back to LandingPrep</a></p></div>");
});

// Public newsletter sign-up (no account needed) — grows the owned email list.
// DOUBLE OPT-IN: a sign-up is stored as unconfirmed and only counts (and receives the
// newsletter) after the user clicks the confirmation link we email them. This keeps the
// list clean, cuts spam complaints, and protects sender reputation.
app.post("/api/newsletter/subscribe", (req, res) => {
  const email = String((req.body && req.body.email) || "").trim().toLowerCase();
  const source = String((req.body && req.body.source) || "site").slice(0, 40);
  if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  // Account holders and already-confirmed subscribers are done — don't re-spam them.
  const existing = STORE.subscribers[email];
  if (STORE.users[email] || (existing && existing.confirmed !== false)) {
    return res.json({ ok: true, confirmed: true });
  }
  // New or still-unconfirmed: (re)store as pending and send the confirmation email.
  STORE.subscribers[email] = { email, source, ts: (existing && existing.ts) || Date.now(), confirmed: false };
  persist(); fsSaveState("subscribers");
  try { sendMail(email, "Confirm your LandingPrep subscription 📬", emailTemplate("confirm", { CONFIRM_LINK: confirmLink(email) })); } catch (e) {}
  res.json({ ok: true, pending: true });
});

// Double opt-in confirmation — clicked from the email. Marks the subscriber confirmed.
app.get("/api/newsletter/confirm", (req, res) => {
  const email = String(req.query.email || "").toLowerCase();
  const token = String(req.query.token || "");
  if (!validEmail(email) || token !== confirmToken(email)) return res.status(400).send("Invalid or expired confirmation link.");
  const sub = STORE.subscribers[email];
  const firstTime = !sub || sub.confirmed === false;
  STORE.subscribers[email] = Object.assign({ email, source: "site", ts: Date.now() }, sub || {}, { confirmed: true, confirmedAt: Date.now() });
  persist(); fsSaveState("subscribers");
  // Now that they've opted in for real, send the welcome email (once).
  if (firstTime) { try { sendMail(email, "Welcome to LandingPrep 🎓", emailTemplate("welcome", { NAME: "there" })); } catch (e) {} }
  res.set("Content-Type", "text/html").send(
    "<div style='font-family:system-ui;max-width:540px;margin:60px auto;text-align:center'>" +
    "<h2>You're subscribed ✅</h2><p style='color:#475569'>Thanks for confirming — you'll get the free LandingPrep weekly newsletter with study-abroad tips, scholarships and mock tests. " +
    "<a href='https://landingprep.com/'>Back to LandingPrep</a></p></div>");
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
  persist(); fsSaveState("reviews");
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
  const prev = STORE.pushSubs[sub.endpoint] || {};
  const rec = { sub, ts: Date.now() };
  // Optional exam-date reminder: fires server-side (even when the app is closed) at
  // 7/3/1/0 days before. `exam` object → set; `exam: null` → clear; absent → preserve.
  const hasExamField = req.body && Object.prototype.hasOwnProperty.call(req.body, "exam");
  const exam = hasExamField ? req.body.exam : undefined;
  if (exam && /^\d{4}-\d{2}-\d{2}$/.test(String(exam.date || ""))) {
    rec.exam = { date: exam.date, name: String(exam.name || "exam").slice(0, 24), fired: [] };
  } else if (exam === null) {
    /* explicit clear — leave rec.exam undefined */
  } else if (prev.exam) { rec.exam = prev.exam; }
  STORE.pushSubs[sub.endpoint] = rec;
  if (Object.keys(STORE.pushSubs).length > 50000) { const k = Object.keys(STORE.pushSubs)[0]; delete STORE.pushSubs[k]; }
  persist(); fsSaveState("pushSubs");
  res.json({ ok: true });
});
app.post("/api/push/unsubscribe", (req, res) => {
  const ep = req.body && req.body.endpoint;
  if (ep && STORE.pushSubs[ep]) { delete STORE.pushSubs[ep]; persist(); fsSaveState("pushSubs"); }
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
  if (removed) { persist(); fsSaveState("pushSubs"); }
  res.json({ ok: true, subscribers: Object.keys(STORE.pushSubs).length, sent, removed });
});

// Cron: exam-countdown pushes. Hit ONCE A DAY (GitHub Action / cron-job.org) so
// subscribers get a nudge at 7/3/1/0 days before their saved exam — even with the
// app closed. Each milestone fires at most once; past exams are cleared.
//   GET /api/admin/run-exam-reminders?key=ADMIN_SECRET
app.get("/api/admin/run-exam-reminders", async (req, res) => {
  if (!adminOK(req)) return res.status(403).json({ error: "Forbidden — pass ?key=ADMIN_SECRET" });
  if (!webpush) return res.status(503).json({ error: "Push not configured — set VAPID_PRIVATE in Render env." });
  const MS = [7, 3, 1, 0];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let checked = 0, sent = 0, pruned = 0, changed = false;
  for (const [ep, rec] of Object.entries(STORE.pushSubs || {})) {
    if (!rec || !rec.exam || !/^\d{4}-\d{2}-\d{2}$/.test(String(rec.exam.date || ""))) continue;
    checked++;
    const p = rec.exam.date.split("-").map(Number);
    const exam = new Date(p[0], p[1] - 1, p[2]); exam.setHours(0, 0, 0, 0);
    const days = Math.round((exam - today) / 86400000);
    if (days < 0) { delete rec.exam; changed = true; continue; } // exam passed → clear
    const fired = Array.isArray(rec.exam.fired) ? rec.exam.fired : [];
    if (!MS.some((m) => days <= m && !fired.includes(m))) continue;
    const name = rec.exam.name || "exam";
    const title = days === 0 ? `${name} day! 🎯` : `${name} in ${days} day${days === 1 ? "" : "s"} ⏳`;
    const body = days === 0
      ? "Today's the day — good luck! Keep it light: a short warm-up, not a full mock."
      : days === 1
        ? `Your ${name} is tomorrow. One confidence run — a single section — then rest well.`
        : `Your ${name} is in ${days} days. Time for a full timed mock to lock in your pacing.`;
    const payload = JSON.stringify({ title, body, url: "/#/exam-prep" });
    try {
      await webpush.sendNotification(rec.sub, payload); sent++;
      rec.exam.fired = Array.from(new Set(fired.concat(MS.filter((x) => days <= x)))); changed = true;
    } catch (e) {
      if (e && (e.statusCode === 404 || e.statusCode === 410)) { delete STORE.pushSubs[ep]; pruned++; changed = true; }
    }
    await new Promise((r) => setTimeout(r, 20));
  }
  if (changed) { persist(); fsSaveState("pushSubs"); }
  res.json({ ok: true, checked, sent, pruned });
});

// Owner dashboard data (behind the admin key). Powers /admin/.
app.get("/api/admin/stats", (req, res) => {
  if (!adminOK(req)) return res.status(403).json({ error: "Forbidden — pass ?key=ADMIN_SECRET" });
  const reviews = STORE.reviews || [];
  res.json({
    users: Object.keys(STORE.users || {}).length,
    subscribers: Object.values(STORE.subscribers || {}).filter((s) => s && s.confirmed !== false).length,
    subscribersPending: Object.values(STORE.subscribers || {}).filter((s) => s && s.confirmed === false).length,
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
  // Only confirmed subscribers (double opt-in). Legacy rows without the field count as confirmed.
  for (const s of Object.values(STORE.subscribers || {})) if (s && validEmail(s.email) && s.confirmed !== false) byEmail[s.email.toLowerCase()] = byEmail[s.email.toLowerCase()] || { name: "", email: s.email };
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

// Branded, authentic password-reset code email. The code is the only secret; the rest
// is reassurance + anti-phishing guidance.
function resetCodeEmail(firstName, code) {
  const spaced = String(code).split("").join("&nbsp;&nbsp;");
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
  <div style="text-align:center;padding:8px 0 4px"><span style="font-size:22px;font-weight:800;background:linear-gradient(135deg,#4F46E5,#9333EA);-webkit-background-clip:text;background-clip:text;color:transparent">LandingPrep</span></div>
  <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:28px 26px;margin-top:10px">
    <h1 style="font-size:20px;margin:0 0 6px;color:#111827">Reset your password</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 18px;color:#4b5563">Hi ${firstName}, we received a request to reset your LandingPrep password. Enter this 6-digit code on the reset screen to continue:</p>
    <div style="text-align:center;margin:18px 0">
      <div style="display:inline-block;background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:16px 28px;font-size:30px;font-weight:800;letter-spacing:4px;color:#4338ca;font-family:'Courier New',monospace">${spaced}</div>
    </div>
    <p style="font-size:14px;line-height:1.6;margin:0 0 6px;color:#6b7280">This code expires in <strong>15 minutes</strong> and can be used once.</p>
    <p style="font-size:14px;line-height:1.6;margin:0;color:#6b7280"><strong>Didn't request this?</strong> You can safely ignore this email — your password won't change unless someone enters this code. LandingPrep will never ask for your code or password by email, phone or chat.</p>
  </div>
  <p style="font-size:12px;color:#9ca3af;text-align:center;margin:14px 0 0">Sent by LandingPrep · 100% free study-abroad prep · landingprep.com</p>
</div>`;
}

// Step 2 of reset: verify the emailed code, then set the new password. The code is
// single-use, expires in 15 min, and locks after 5 wrong attempts (anti brute-force).
app.post("/api/auth/reset", (req, res) => {
  const { email, code, password } = req.body || {};
  const key = String(email || "").toLowerCase();
  const u = STORE.users[key];
  if (!u) return res.status(404).json({ error: "No account found with this email." });
  if (String(password || "").length < 6) return res.status(400).json({ error: "New password must be at least 6 characters." });
  STORE.resets = STORE.resets || {};
  const rec = STORE.resets[key];
  if (!rec) return res.status(400).json({ error: "Request a reset code first." });
  if (Date.now() > rec.expires) { delete STORE.resets[key]; return res.status(400).json({ error: "That code has expired. Request a new one." }); }
  if (rec.attempts >= 5) { delete STORE.resets[key]; return res.status(429).json({ error: "Too many incorrect attempts. Request a new code." }); }
  const provided = crypto.createHmac("sha256", AUTH_SECRET).update("reset|" + key + "|" + String(code || "").trim()).digest("hex");
  const ok = Buffer.from(provided).length === Buffer.from(rec.codeHash).length &&
             crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(rec.codeHash));
  if (!ok) { rec.attempts++; return res.status(400).json({ error: "Incorrect or expired code. Check the email and try again." }); }
  // Valid → set new password, invalidate the code immediately.
  u.hash = hashPw(password);
  delete STORE.resets[key];
  persistUser(key);
  sendMail(u.email, "Your LandingPrep password was changed",
    emailTemplate("password-reset", { NAME: (u.name || "there").split(" ")[0], RESET_LINK: (process.env.FRONTEND_ORIGIN || "https://landingprep.com") + "/#/login" }));
  res.json({ ok: true });
});

// Step 1 of reset: email a single-use 6-digit code. Always responds ok — never reveals
// whether an account exists (anti-enumeration). Rate-limited (see _writeCap above).
app.post("/api/auth/forgot", (req, res) => {
  const key = String((req.body && req.body.email) || "").toLowerCase();
  const u = STORE.users[key];
  if (u) {
    const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
    STORE.resets = STORE.resets || {};
    STORE.resets[key] = {
      codeHash: crypto.createHmac("sha256", AUTH_SECRET).update("reset|" + key + "|" + code).digest("hex"),
      expires: Date.now() + 15 * 60 * 1000,
      attempts: 0,
    };
    // FIRE-AND-FORGET — do NOT await. Hostinger SMTP (plus a Render cold start) can take
    // several seconds; awaiting it made the browser's request time out, so the UI showed
    // "couldn't send the code" and never advanced to the code-entry step — even though the
    // email was actually sent. The reset record is stored synchronously above, so the
    // emailed code is valid the instant it arrives.
    Promise.resolve().then(() => sendMailRich(u.email, "Your LandingPrep password reset code",
      resetCodeEmail((u.name || "there").split(" ")[0], code))).catch(() => {});
  }
  res.json({ ok: true }); // respond instantly so the client advances to the code box
});

// Admin SMTP diagnostic: verify the mailbox connection + send a test email, returning
// the REAL error so misconfiguration is obvious. Gated by ADMIN_SECRET.
//   GET /api/admin/test-mail?key=<ADMIN_SECRET>&to=you@example.com
app.get("/api/admin/test-mail", async (req, res) => {
  if (!adminOK(req)) return res.status(403).json({ error: "Forbidden — set ADMIN_SECRET in Render env and pass ?key=<it>." });
  const to = String(req.query.to || SMTP.user);
  const provider = process.env.RESEND_API_KEY ? "resend" : "smtp";
  const info = { provider, from: process.env.RESEND_FROM || SMTP.from, user: SMTP.user };
  // Resend (HTTPS) — works on Render even when SMTP ports are blocked.
  if (provider === "resend") {
    const ok = await sendViaResend(to, "LandingPrep email test ✅", "<p>Email works via Resend — password-reset codes & welcome emails will deliver. Sent to " + to + ".</p>");
    return ok
      ? res.json({ ok: true, ...info, sentTo: to, message: "Sent via Resend (HTTPS). Check inbox + spam." })
      : res.json({ ok: false, ...info, error: "Resend send failed — see server logs. Usually: RESEND_API_KEY wrong, or the 'from' domain isn't verified in Resend yet." });
  }
  // SMTP fallback
  if (!SMTP.pass) return res.json({ ok: false, ...info, host: SMTP.host, port: SMTP.port, smtpPassSet: false, error: "Neither RESEND_API_KEY nor SMTP_PASS is set." });
  try {
    const t = mailer();
    await t.verify();
    await sendMail(to, "LandingPrep SMTP test ✅", "<p>Your SMTP works — reset codes & welcome emails will deliver.</p>");
    res.json({ ok: true, ...info, host: SMTP.host, port: SMTP.port, sentTo: to, message: "Connected, authenticated and sent. Check inbox + spam." });
  } catch (e) {
    res.json({ ok: false, ...info, host: SMTP.host, port: SMTP.port, error: String((e && e.message) || e),
      hint: "Render's free tier often BLOCKS outbound SMTP (465 & 587), which causes this timeout. The reliable fix: sign up at resend.com, verify landingprep.com, and set RESEND_API_KEY in Render — it sends over HTTPS, which Render allows." });
  }
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
  fsSaveState("community"); // mirror Q&A + leaderboard to Firestore (durable across Render restarts)
}
// Strip HTML tag-like runs from user-supplied text.
//
// Why on WRITE, not just on render: /api/community serves this text raw as JSON to ANY
// client. The React web app auto-escapes, so it is safe today - but a native/WebView
// mobile client or an email digest would happily execute a stored <script>. We cannot
// guarantee every future consumer escapes, so the store itself must be clean.
//
// Deliberately conservative: only *complete* tag-like runs are removed, so the maths
// students actually write - "x<y", "a < b", "score <6.5" - survives untouched (a bare
// "<" not followed by a letter or "/" is never a tag).
//
// Looped because one pass is bypassable: "<<script>script>" collapses INTO a live
// "<script>" after a single replace. Repeat until the string stops changing.
//
// Stripped rather than entity-encoded: escaping on write would double-escape, since
// React re-escapes the "&" and users would literally see "&lt;script&gt;".
const stripTags = (s) => {
  let out = String(s), prev;
  do { prev = out; out = out.replace(/<\/?[a-zA-Z][^>]*>/g, ""); } while (out !== prev);
  return out;
};
const clean = (s, max) => stripTags(String(s == null ? "" : s)).replace(/[\u0000-\u001F\u007F]/g, " ").trim().slice(0, max);
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

// One-tap unsubscribe for the weekly digest (token-signed). Registered BEFORE the /api catch-all.
app.get("/api/unsubscribe", (req, res) => {
  const email = String(req.query.e || "").toLowerCase();
  const wrap = (msg) => "<div style='font-family:system-ui,Arial;max-width:480px;margin:12vh auto;text-align:center;color:#1f2937'><div style='font-size:40px'>✅</div><h1 style='font-size:22px'>You're unsubscribed</h1><p style='color:#6b7280'>" + msg + " You can still use everything on <a href='/' style='color:#4F46E5'>landingprep.com</a> free.</p></div>";
  if (!email || String(req.query.t || "") !== unsubToken(email)) return res.status(400).send("<p style='font-family:system-ui;max-width:480px;margin:12vh auto;text-align:center'>This unsubscribe link is invalid or expired.</p>");
  let done = false;
  for (const [key, u] of Object.entries(STORE.users || {})) {
    if (u && String(u.email || "").toLowerCase() === email) { u.noNewsletter = true; persistUser(key); done = true; }
  }
  res.send(wrap(done ? "You won't receive weekly emails anymore." : "You won't be emailed."));
});

// ── Resilience: unknown API routes + central error handler ─────────────────────
// Any /api/* path that no route matched → clean JSON 404 (never an HTML error page).
app.use("/api", (req, res) => res.status(404).json({ error: "Not found", path: req.path }));

// Any non-API path that matched no prerendered file → a branded 404 instead of Express's
// bare "Cannot GET /x". Status stays 404 (never 200 with a friendly page — that is a soft
// 404 and Google indexes it), and `noindex` keeps a stray crawl of a dead URL out of the
// index. Registered AFTER express.static, so a real page always wins; this only ever runs
// for URLs that genuinely do not exist. Self-contained markup: it must render even if the
// asset that 404'd was the CSS itself.
app.use((req, res) => {
  res.status(404).type("html").send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, follow" />
<title>Page not found | LandingPrep</title></head>
<body style="margin:0;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;color:#1f2937;background:#FBFCFE">
<div style="max-width:560px;margin:12vh auto;padding:0 20px;text-align:center">
  <div style="font-size:44px;line-height:1">🧭</div>
  <h1 style="font-size:24px;margin:12px 0 8px">That page isn't here</h1>
  <p style="color:#6b7280;margin:0 0 24px">The link may be out of date or mistyped. Everything on LandingPrep is free — try one of these:</p>
  <p style="line-height:2.2">
    <a href="/" style="color:#4338ca;font-weight:600;text-decoration:none">Home</a> &nbsp;·&nbsp;
    <a href="/mock-test/ielts/" style="color:#4338ca;font-weight:600;text-decoration:none">Free IELTS mock test</a> &nbsp;·&nbsp;
    <a href="/tools/university-eligibility-checker/" style="color:#4338ca;font-weight:600;text-decoration:none">University eligibility checker</a> &nbsp;·&nbsp;
    <a href="/blog/" style="color:#4338ca;font-weight:600;text-decoration:none">Blog</a>
  </p>
</div>
</body></html>`);
});

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
  fsHydrateState(); // load durable subscribers/reviews/push/community from Firestore on boot
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

// ── Instagram token auto-refresh + fail-loud alerts ───────────────────────────────
// graph.instagram.com (Instagram-Login) long-lived tokens expire ~60 days from creation, no
// matter how little you post. The ig_refresh_token flow returns a fresh 60-day token using ONLY
// the current token (no app secret). We refresh well before expiry and persist the new token in
// Firestore (env can't be rewritten at runtime), so once seeded it never lapses.
async function loadStoredToken() {
  if (!FS_DB) return;
  try {
    const d = await FS_DB.collection("ig_config").doc("auth").get();
    const data = d.exists ? (d.data() || {}) : {};
    // Only adopt the Firestore (auto-refreshed) token if it descended from the CURRENT env seed.
    // If IG_ACCESS_TOKEN was changed in the host env — a manual re-seed after a revoked/blocked
    // token — the stored token is stale and also broken, so we IGNORE it and use the fresh env
    // token. This is what makes "update IG_ACCESS_TOKEN in Render" actually recover posting.
    if (data.token && typeof data.token === "string" && data.token.length > 20 && data.seed === IG_ACCESS_TOKEN) {
      IG_TOKEN = data.token; IG_TOKEN_REFRESHED_AT = data.refreshedAt || 0;
      console.log("[ig-token] using refreshed token from Firestore (last refresh", IG_TOKEN_REFRESHED_AT ? new Date(IG_TOKEN_REFRESHED_AT).toISOString() : "n/a", ")");
    } else if (data.token) {
      console.log("[ig-token] env IG_ACCESS_TOKEN changed (re-seed) — ignoring stale Firestore token, using the fresh env token");
    }
  } catch (e) { /* keep env token */ }
}
async function refreshIgToken(force) {
  if (!IG_TOKEN) return { ok: false, error: "no token to refresh" };
  // Refresh at most once/day (the API also requires the token to be ≥24h old). Each refresh
  // extends validity ~60 days, so refreshing daily means it can never expire.
  if (!force && IG_TOKEN_REFRESHED_AT && (Date.now() - IG_TOKEN_REFRESHED_AT) < 24 * 3600 * 1000) return { ok: true, skipped: "refreshed <24h ago" };
  try {
    const r = await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(IG_TOKEN)}`);
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.access_token) {
      IG_TOKEN = j.access_token; IG_TOKEN_REFRESHED_AT = Date.now();
      if (FS_DB) { try { await FS_DB.collection("ig_config").doc("auth").set({ token: IG_TOKEN, seed: IG_ACCESS_TOKEN, refreshedAt: IG_TOKEN_REFRESHED_AT, expiresInSec: j.expires_in || null }, { merge: true }); } catch (e) { /* keep in-memory token */ } }
      console.log("[ig-token] refreshed OK — valid ~" + Math.round((j.expires_in || 5184000) / 86400) + " more days");
      return { ok: true, expiresIn: j.expires_in };
    }
    return { ok: false, error: (j.error && (j.error.message || JSON.stringify(j.error))) || ("HTTP " + r.status) };
  } catch (e) { return { ok: false, error: e.message }; }
}
// Fail-loud alert — emails the owner the moment something fails, throttled to once per kind per
// ~6h so a real problem is seen in minutes instead of days. Also recorded in Firestore for the self-test.
const _lastAlert = {};
async function igAlert(kind, detail) {
  const now = Date.now();
  if (_lastAlert[kind] && now - _lastAlert[kind] < 6 * 3600 * 1000) return;
  _lastAlert[kind] = now;
  if (FS_DB) { try { await FS_DB.collection("ig_config").doc("alerts").set({ [kind]: { detail: String(detail).slice(0, 500), at: now } }, { merge: true }); } catch (e) { /* ignore */ } }
  const html = `<div style="font-family:system-ui;max-width:600px"><h2>⚠️ Instagram auto-poster needs attention</h2><p><b>${String(kind)}</b></p><pre style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:8px">${String(detail).slice(0, 1500).replace(/</g, "&lt;")}</pre><p>Open <a href="https://landingprep.com/api/ig/post-daily?selftest=1">the self-test</a>. If the token is invalid, regenerate it once in Meta and update IG_ACCESS_TOKEN in Render — auto-refresh keeps it alive after that.</p></div>`;
  try { await sendMailRich(OWNER_EMAIL, "⚠️ LandingPrep Instagram auto-poster: " + kind, html); } catch (e) { /* ignore */ }
  console.warn("[ig-alert]", kind, "-", String(detail).slice(0, 200));
}

// ── Auto-reply to new comments — engagement = reach ──────────────────────────────
// Polls the latest few posts and replies ONCE to each new top-level comment with a warm, varied,
// non-spammy message (a question gets pointed to the free guides; praise gets a thank-you). Dedup
// via Firestore so a comment is never replied to twice; capped per run; skips the account's own
// comments. Best-effort — a missing permission or error never breaks posting. Toggle: IG_AUTOREPLY=0.
let _autoReplyBusy = false, _lastAutoReply = 0, _acctUsername = null;
async function acctUsername(ig) {
  if (_acctUsername) return _acctUsername;
  try { const w = await ig.whoami({ token: IG_TOKEN }); _acctUsername = (w && (w.igUsername || w.username)) || null; } catch (e) {}
  return _acctUsername;
}
function autoReplyText(comment, i) {
  const t = String((comment && comment.text) || "").toLowerCase();
  if (/\?|how |which |when |where |can i|cost|fee|visa|ielts|toefl|gre|gmat|scholarship|loan|deadline|intake/.test(t))
    return "Great question! 🙌 We break this down in our free guides — link in bio. Want a post on anything specific next? 👇";
  const thanks = ["Thank you so much! 🙌 Follow for a daily study-abroad guide 🌍", "So glad this helped! 🙏 More free guides in our bio ✨", "Appreciate you! 🌍 Save it for when you apply 📌", "Thanks for the love! ✨ A new tip drops here every day 🎓"];
  return thanks[Math.abs(i) % thanks.length];
}
async function igAutoReply(ig) {
  if (process.env.IG_AUTOREPLY === "0") return;                 // kill-switch
  if (_autoReplyBusy || !IG_USER_ID || !IG_TOKEN || !FS_DB) return;
  if (Date.now() - _lastAutoReply < 25 * 60 * 1000) return;     // gentle cadence (~once/25 min)
  _autoReplyBusy = true; _lastAutoReply = Date.now();
  try {
    const me = await acctUsername(ig);
    const media = await ig.listRecentMedia({ igUserId: IG_USER_ID, token: IG_TOKEN, limit: 4 });
    const ref = FS_DB.collection("ig_config").doc("replied");
    const snap = await ref.get(); const replied = (snap.exists && (snap.data() || {}).ids) || {};
    let count = 0; const MAX = 8;
    for (const m of media) {
      if (count >= MAX) break;
      let comments = []; try { comments = await ig.listComments({ mediaId: m.id, token: IG_TOKEN }); } catch (e) { continue; }
      for (const c of comments) {
        if (count >= MAX) break;
        if (!c.id || replied[c.id]) continue;
        if (me && c.username && c.username.toLowerCase() === me.toLowerCase()) { replied[c.id] = 1; continue; } // skip our own
        const r = await ig.replyToComment({ commentId: c.id, message: autoReplyText(c, count), token: IG_TOKEN });
        replied[c.id] = r.ok ? Date.now() : 1;                  // mark either way → never retry-storm a bad comment
        if (r.ok) { count++; await new Promise((rr) => setTimeout(rr, 2500)); }
      }
    }
    const ids = Object.keys(replied); if (ids.length > 600) ids.slice(0, ids.length - 600).forEach((k) => delete replied[k]); // prune
    if (count > 0 || !snap.exists) await ref.set({ ids: replied, updatedAt: Date.now() }, { merge: true });
    if (count > 0) console.log("[ig-autoreply] replied to", count, "comment(s)");
  } catch (e) { console.warn("[ig-autoreply]", e.message); }
  finally { _autoReplyBusy = false; }
}

// ── DM auto-welcome responder (engagement → follows) ─────────────────────────────
// Replies ONCE to each new conversation with a warm welcome + the link hub. IG forbids cold DMs,
// so this only ever replies to people who messaged YOU (within the policy window). OFF by default —
// set IG_DM_AUTOREPLY=1 to enable (after confirming the instagram_business_manage_messages scope).
// Best-effort, deduped per conversation, throttled, capped — never breaks posting.
let _dmBusy = false, _lastDm = 0;
async function igDmAutoReply(ig) {
  if (process.env.IG_DM_AUTOREPLY !== "1") return;             // opt-in only (messaging is sensitive)
  if (_dmBusy || !IG_USER_ID || !IG_TOKEN || !FS_DB) return;
  if (Date.now() - _lastDm < 25 * 60 * 1000) return;
  _dmBusy = true; _lastDm = Date.now();
  try {
    const convos = await ig.listConversations({ igUserId: IG_USER_ID, token: IG_TOKEN, limit: 15 });
    const ref = FS_DB.collection("ig_config").doc("dm_replied");
    const snap = await ref.get(); const replied = (snap.exists && (snap.data() || {}).ids) || {};
    const welcome = "Hey! 👋 Thanks for messaging LandingPrep. For free study-abroad guides, mock tests & our College Predictor, tap the link in our bio (landingprep.com/links). Which country or exam are you planning? We're happy to point you to the right free resources 🌍";
    let count = 0; const MAX = 6;
    for (const c of convos) {
      if (count >= MAX) break;
      if (replied[c.id]) continue;                              // one welcome per conversation, ever
      let msgs = []; try { msgs = await ig.listMessages({ conversationId: c.id, token: IG_TOKEN }); } catch (e) { continue; }
      const inbound = msgs.find((m) => m.fromId && String(m.fromId) !== String(IG_USER_ID));   // a message from THEM
      if (!inbound) continue;
      const r = await ig.sendDM({ igUserId: IG_USER_ID, recipientId: inbound.fromId, text: welcome, token: IG_TOKEN });
      replied[c.id] = r.ok ? Date.now() : 1;                    // mark either way → never retry-storm a bad convo
      if (r.ok) { count++; await new Promise((rr) => setTimeout(rr, 3000)); }
    }
    const ids = Object.keys(replied); if (ids.length > 500) ids.slice(0, ids.length - 500).forEach((k) => delete replied[k]);
    if (count > 0 || !snap.exists) await ref.set({ ids: replied, updatedAt: Date.now() }, { merge: true });
    if (count > 0) console.log("[ig-dm] welcomed", count, "new conversation(s)");
  } catch (e) { console.warn("[ig-dm]", e.message); }
  finally { _dmBusy = false; }
}

// ── Weekly insights email + best-time auto-scheduling ────────────────────────────
// Once a week we email the owner a plain report (followers, weekly likes/comments, reach, top post,
// best posting hours) AND — only if there's enough history and IG_SMART_SCHEDULE=1 — store a
// data-driven schedule so posting auto-shifts to the hours that actually perform.
function bestHoursFrom(byHourIST) {
  return Object.keys(byHourIST || {}).map((h) => ({ h: +h, posts: byHourIST[h].posts, avg: byHourIST[h].eng / Math.max(1, byHourIST[h].posts) }))
    .filter((r) => r.posts >= 2).sort((a, b) => b.avg - a.avg);
}
function insightsEmailHtml(s, best) {
  const n = (v) => (v == null ? "—" : v); const esc = (x) => String(x == null ? "" : x).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const istLabel = (h) => { const ap = h < 12 ? "am" : "pm"; const hh = (h % 12 === 0) ? 12 : h % 12; return hh + ap; };
  const bestTxt = (best && best.length) ? best.slice(0, 5).map((r) => istLabel(r.h) + " IST").join(" · ") : "not enough data yet — keep posting and this fills in";
  const row = (l, v) => `<tr><td style="padding:8px;border-bottom:1px solid #eef2f7">${l}</td><td style="padding:8px;border-bottom:1px solid #eef2f7;text-align:right;font-weight:700">${v}</td></tr>`;
  const top = s.top ? `<div style="border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin:10px 0"><b>🏆 Top post</b><br>${esc(s.top.caption)}<br><span style="color:#475569">${s.top.likes} likes · ${s.top.comments} comments${s.top.permalink ? ` · <a href="${esc(s.top.permalink)}">view</a>` : ""}</span></div>` : "";
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:640px;margin:0 auto;color:#0f172a">
    <h2>📊 Your Instagram week — @landing_prep</h2>
    <table style="width:100%;border-collapse:collapse;margin:8px 0">
      ${row("👥 Followers", n(s.followers))}${row("🖼️ Posts this week", s.weekPosts)}${row("❤️ Likes this week", s.weekLikes)}${row("💬 Comments this week", s.weekComments)}${row("📈 Reach (7 days)", n(s.reach))}
    </table>
    ${top}
    <div style="background:#eef2ff;border-radius:12px;padding:14px;margin:10px 0"><b>⏰ Best posting times (IST)</b><br>${bestTxt}<br><span style="color:#64748b;font-size:13px">Set <b>IG_SMART_SCHEDULE=1</b> in Render to auto-shift posts to these windows (activates once there are 15+ posts of history).</span></div>
    <p style="color:#94a3b8;font-size:12px">Based on your last ${s.analyzed} posts. Figures are best-effort from the Instagram API.</p></div>`;
}
async function igWeeklyInsights(ig, force) {
  if (!FS_DB || !IG_USER_ID || !IG_TOKEN) return { ok: false, reason: "not configured" };
  const today = new Date().toISOString().slice(0, 10);
  const ref = FS_DB.collection("ig_config").doc("insights");
  if (!force) { try { const snap = await ref.get(); if (snap.exists && (snap.data() || {}).lastDate === today) return { ok: true, skipped: "already sent today" }; } catch (e) {} }
  const s = await ig.weeklyStats({ igUserId: IG_USER_ID, token: IG_TOKEN });
  const best = bestHoursFrom(s.byHourIST);
  // Store a data-driven schedule once there's enough history (the plan only USES it if IG_SMART_SCHEDULE=1).
  try {
    if (s.analyzed >= 15 && best.length >= 6) {
      const topHours = best.slice(0, 6).map((r) => r.h).sort((a, b) => a - b);
      const ids = ["img1", "carA", "reelA", "img2", "carB", "reelB"]; const dueUTC = {};
      ids.forEach((id, i) => { dueUTC[id] = ((topHours[i] - 5.5) + 24) % 24; });
      await FS_DB.collection("ig_config").doc("schedule").set({ dueUTC, hoursIST: topHours, enough: true, computedAt: Date.now() }, { merge: true });
    }
  } catch (e) {}
  const sent = await sendMailRich(OWNER_EMAIL, "📊 LandingPrep Instagram — your weekly report", insightsEmailHtml(s, best));
  if (sent) { try { await ref.set({ lastDate: today, at: Date.now() }, { merge: true }); } catch (e) {} }
  return { ok: true, sent, analyzed: s.analyzed, bestHoursIST: best.slice(0, 6).map((r) => r.h) };
}
// Data-driven schedule override (cached 1h). Returns null unless IG_SMART_SCHEDULE=1 AND a schedule
// with enough history exists — so by default the proven static plan is used UNCHANGED.
let _smartSched = null, _smartSchedAt = 0;
async function loadSmartSchedule() {
  if (process.env.IG_SMART_SCHEDULE !== "1" || !FS_DB) return null;
  if (_smartSched && Date.now() - _smartSchedAt < 3600000) return _smartSched;
  try { const d = await FS_DB.collection("ig_config").doc("schedule").get(); const data = d.exists ? (d.data() || {}) : {}; _smartSched = (data.enough && data.dueUTC) ? data.dueUTC : null; _smartSchedAt = Date.now(); }
  catch (e) { _smartSched = null; }
  return _smartSched;
}

// ── Instagram backup scheduler — the "never breaks" safety net ────────────────────
// The IG automation must NOT depend solely on GitHub Actions (which can be disabled, throttled,
// or silently lose a cron — which is exactly what broke the owner-approval email). This in-process
// loop runs the SAME idempotent functions as the cron endpoints:
//   • igCatchUp      — posts any due-but-unposted slot for today; Firestore-gated so it NEVER
//                      double-posts, even alongside the GitHub cron.
//   • prepareTomorrow — the evening owner-approval email; guarded to send exactly once per day.
// Render keeps this instance warm via the keep-alive ping, so the loop stays alive. If GitHub
// Actions stops entirely, posting + the daily email keep running from here.
let _igTickBusy = false;
async function igAutoTick(reason) {
  if (_igTickBusy) return;
  if (!IG_USER_ID || !IG_TOKEN || !IG_POST_SECRET) return; // not configured → no-op
  _igTickBusy = true;
  let ig;
  try { ig = require("./scripts/ig-poster.js"); }
  catch (e) { console.warn("[ig-tick] poster module not available:", e.message); _igTickBusy = false; return; }
  try {
    // 0) Keep the Instagram token alive (idempotent, once/day). If the token is set to
    //    "never expire" (a non-expiring Page token), the refresh simply doesn't apply — that's
    //    NOT a failure, so we only log it quietly and never alert. Real token death is caught by
    //    the posting-failure path below, which is the signal that actually matters.
    try { const tr = await refreshIgToken(); if (!tr.ok && !tr.skipped) console.warn("[ig-token] refresh not applied (fine if your token never expires):", tr.error); }
    catch (e) { console.warn("[ig-tick] token refresh:", e.message); }
    // 1) Self-heal today's posting (idempotent). On a hard failure, alert loudly — and if it
    //    looks token-related, force a refresh immediately so the next window self-heals.
    try {
      const r = await igCatchUp(ig);
      if (r && r.postedNow && r.postedNow.length) console.log("[ig-tick] posted slots:", r.postedNow.join(","));
      if (r && r.errors && r.errors.length) {
        const blob = r.errors.join(" | ");
        if (/oauth|token|expired|session|code\D*190|permission/i.test(blob)) {
          // Throttle forced refreshes to once/6h — refreshing on every 20-min tick while blocked
          // is itself abusive and can deepen Meta's block.
          if (Date.now() - _lastForcedRefresh > 6 * 3600 * 1000) { _lastForcedRefresh = Date.now(); await refreshIgToken(true); }
          await igAlert("posting-token-error", blob);
        }
        else await igAlert("posting-error", blob);
      }
    } catch (e) { console.warn("[ig-tick] catchup:", e.message); await igAlert("posting-exception", e.message); }
    // 1b) Auto-reply to new comments (engagement → reach). Best-effort, throttled internally.
    try { await igAutoReply(ig); } catch (e) { console.warn("[ig-tick] autoreply:", e.message); }
    // 1c) DM auto-welcome for new conversations (opt-in: IG_DM_AUTOREPLY=1). Best-effort.
    try { await igDmAutoReply(ig); } catch (e) { console.warn("[ig-tick] dm:", e.message); }
    // 2) Evening owner-approval email for TOMORROW — once per day, ~15:00–18:00 UTC
    //    (≈20:30–23:30 IST, before the 11:59pm IST auto-approve deadline). prepareTomorrow is
    //    internally idempotent (skips if already prepared & emailed), so this is safe to call often.
    const hUTC = new Date().getUTCHours();
    if (FS_DB && hUTC >= 15 && hUTC < 18) {
      try { const p = await prepareTomorrow(ig); if (p && p.emailSent && !p.skipped) console.log("[ig-tick] emailed tomorrow's approval digest:", p.date); }
      catch (e) { console.warn("[ig-tick] prepare:", e.message); }
    }
    // 3) Weekly insights email + best-time schedule refresh — Mondays ~03:00–05:00 UTC, once/week.
    if (FS_DB && new Date().getUTCDay() === 1 && hUTC >= 3 && hUTC < 5) {
      try { const w = await igWeeklyInsights(ig); if (w && w.sent) console.log("[ig-tick] weekly insights emailed (analysed", w.analyzed, "posts)"); }
      catch (e) { console.warn("[ig-tick] insights:", e.message); }
    }
  } finally { _igTickBusy = false; }
}
// Tick every 20 min; first run shortly after boot (after loading any refreshed token from
// Firestore). unref() so it never keeps the process alive on its own.
const _igTimer = setInterval(() => { igAutoTick("interval"); }, 20 * 60 * 1000);
if (_igTimer && _igTimer.unref) _igTimer.unref();
setTimeout(async () => { await loadStoredToken(); igAutoTick("boot"); }, 30 * 1000);

// ── Daily practice-reminder push (retention) ─────────────────────────────────
// Web Push, subscribe/unsubscribe and the SW handler already exist; the only gap was a daily
// TRIGGER. Self-contained: once/day in a target UTC window, fan out an opt-in reminder to every
// stored subscriber (users explicitly subscribed; unsubscribe endpoint handles opt-out). Claims
// the day BEFORE sending so a restart or overlapping tick can never double-send.
let _lastReminderDate = "";
async function dailyReminderTick() {
  try {
    if (!webpush || process.env.DAILY_REMINDER === "0") return;          // push off, or disabled
    const now = new Date(); const h = now.getUTCHours();
    if (h < 13 || h >= 15) return;                                       // window ~13:00–15:00 UTC (≈6:30–8:30pm IST)
    const today = now.toISOString().slice(0, 10);
    if (_lastReminderDate === today) return;                            // already sent today
    const subs = Object.entries(STORE.pushSubs || {});
    _lastReminderDate = today;                                           // claim the day up front (at-most-once)
    if (!subs.length) return;
    const lines = [
      "Time for today's free practice — keep your streak going! 🔥",
      "5 minutes today beats an hour next week. Let's go 💪",
      "Your next free mock is ready — a little every day adds up 📈",
      "Don't break your streak! Today's free practice is waiting 🎯",
    ];
    const payload = JSON.stringify({ title: "LandingPrep", body: lines[now.getUTCDate() % lines.length], url: "/" });
    let sent = 0, removed = 0;
    for (const [ep, rec] of subs) {
      try { await webpush.sendNotification(rec.sub, payload); sent++; }
      catch (e) { if (e && (e.statusCode === 404 || e.statusCode === 410)) { delete STORE.pushSubs[ep]; removed++; } }
      await new Promise((r) => setTimeout(r, 20));
    }
    if (removed) { persist(); fsSaveState("pushSubs"); }
    console.log("[reminder] daily push — sent:", sent, "removed:", removed);
  } catch (e) { console.warn("[reminder] tick:", e.message); }
}
const _reminderTimer = setInterval(() => { dailyReminderTick().catch(() => {}); }, 17 * 60 * 1000);
if (_reminderTimer && _reminderTimer.unref) _reminderTimer.unref();
setTimeout(() => { dailyReminderTick().catch(() => {}); }, 60 * 1000);

// ── Weekly digest email (OFF by default — set WEEKLY_DIGEST=1 to enable) ──────────
// Personalised progress lives in the browser, so this is a "new guides + practice nudge" digest to
// registered users who haven't opted out — NOT per-user stats. Every email carries a one-tap,
// token-signed unsubscribe link. Off by default + once/week + throttled, so it can NEVER spam: the
// owner flips WEEKLY_DIGEST=1 only when ready.
function unsubToken(email) { return crypto.createHmac("sha256", AUTH_SECRET).update("unsub|" + String(email).toLowerCase()).digest("base64url"); }
let _lastDigestDate = "";
function digestGuidesHtml() {
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(__dirname, "blog-index.json"), "utf8"));
    return (idx || []).slice(0, 3).map((p) => `<li style="margin:8px 0"><a href="https://landingprep.com/blog/${p.id}/" style="color:#4F46E5;font-weight:600;text-decoration:none">${String(p.title || "").replace(/</g, "")}</a></li>`).join("");
  } catch (e) { return ""; }
}
async function sendWeeklyDigest() {
  try {
    if (process.env.WEEKLY_DIGEST !== "1") return;                                  // OFF unless explicitly enabled
    const now = new Date();
    if (now.getUTCDay() !== 0 || now.getUTCHours() < 9 || now.getUTCHours() >= 11) return; // Sundays ~09:00–11:00 UTC
    const today = now.toISOString().slice(0, 10);
    if (_lastDigestDate === today) return;
    _lastDigestDate = today;                                                        // claim before sending (once/week)
    const recips = [];
    for (const u of Object.values(STORE.users || {})) if (u && u.email && !u.noNewsletter) recips.push(u);
    if (!recips.length) return;
    const guides = digestGuidesHtml();
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    let sent = 0;
    for (const u of recips) {
      const unsub = "https://landingprep.com/api/unsubscribe?e=" + encodeURIComponent(u.email) + "&t=" + unsubToken(u.email);
      // Personalise from the user's synced test history (cross-device, server-stored).
      const hist = STORE.history[u.email] || [];
      const thisWeek = hist.filter((h) => (h.ts || Date.parse(h.date) || 0) >= weekAgo).length;
      const best = {};
      for (const h of hist) { const ex = String(h.exam || "").toUpperCase(); const sc = h.score != null ? h.score : h.overall; if (ex && sc != null && (best[ex] == null || sc > best[ex])) best[ex] = sc; }
      const bestLine = Object.entries(best).slice(0, 4).map(([e, s]) => `${e} ${s}`).join(" · ");
      const statsBlock = hist.length
        ? `<div style="background:#eef2ff;border-radius:12px;padding:14px 16px;margin:14px 0;font-size:15px"><strong>📊 Your progress</strong><br/>${hist.length} test${hist.length > 1 ? "s" : ""} completed${thisWeek ? ` · <strong>${thisWeek} this week</strong> 🔥` : ""}${bestLine ? `<br/>Best scores: ${bestLine}` : ""}</div>`
        : "";
      const nudge = !hist.length ? "Take your first free mock today — it only takes a few minutes."
        : thisWeek ? "Great momentum this week — keep the streak going!"
        : "It's been a quiet week. Jump back in — a little practice adds up fast.";
      const html = `<div style="font-family:system-ui,Arial;max-width:560px;margin:0 auto;color:#1f2937">`
        + `<h2 style="color:#4F46E5">Hi ${String(u.name || "there").replace(/</g, "")}, keep your prep going 📚</h2>`
        + statsBlock
        + `<p>${nudge}</p>`
        + `<p style="margin:18px 0"><a href="https://landingprep.com/" style="background:#4F46E5;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:700">Practise free →</a></p>`
        + (guides ? `<p style="font-weight:700;margin:18px 0 6px">📰 New study-abroad guides:</p><ul style="padding-left:18px">${guides}</ul>` : "")
        + `<hr style="border:none;border-top:1px solid #e5e7eb;margin:22px 0"/>`
        + `<p style="font-size:12px;color:#9ca3af">You're receiving this because you created a free LandingPrep account. <a href="${unsub}" style="color:#9ca3af">Unsubscribe</a>.</p></div>`;
      if (await sendMailRich(u.email, "Your weekly LandingPrep update 📚", html)) sent++;
      await new Promise((r) => setTimeout(r, 200));                                 // throttle SMTP
    }
    console.log("[digest] weekly digest sent to", sent, "of", recips.length);
  } catch (e) { console.warn("[digest] tick:", e.message); }
}
const _digestTimer = setInterval(() => { sendWeeklyDigest().catch(() => {}); }, 31 * 60 * 1000);
if (_digestTimer && _digestTimer.unref) _digestTimer.unref();

// ── Keep-warm self-ping ────────────────────────────────────────────────────────
// Render's free tier sleeps the dyno after ~15 min idle (then a 30–45s cold start
// that can look like a failure to the first visitor). Pinging our own public
// /api/health every ~13 min keeps the dyno awake so real users never hit a cold
// start. Only runs when a public URL is known (RENDER_EXTERNAL_URL is auto-set on
// Render) — it's a no-op locally. Fully guarded: a failed ping never crashes anything.
// Fall back to the known public URL so the self-ping ALWAYS runs in production even if
// RENDER_EXTERNAL_URL isn't set — this keeps the dyno awake (and the IG posting scheduler
// running) with zero dependence on GitHub Actions or any external pinger.
const SELF_PING_URL = (process.env.RENDER_EXTERNAL_URL || process.env.SELF_PING_URL || (/^https:\/\//.test(IG_PUBLIC_BASE) ? IG_PUBLIC_BASE : "")).replace(/\/$/, "");
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
