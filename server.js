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
app.use(express.json({ limit: "512kb" }));

// Serve static files from the same directory
app.use(express.static(__dirname));

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasKey: !!GEMINI_API_KEY,
    ts: new Date().toISOString(),
  });
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
let STORE = { users: {}, history: {} };
(function loadStore() {
  try { STORE = JSON.parse(fs.readFileSync(STORE_PATH, "utf8")); }
  catch (_) { STORE = { users: {}, history: {} }; }
})();
let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true }); fs.writeFileSync(STORE_PATH, JSON.stringify(STORE)); }
    catch (e) { console.warn("[auth] persist failed:", e.message); }
  }, 200);
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

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "All fields are required." });
  if (!validEmail(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (String(password).length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });
  const key = String(email).toLowerCase();
  if (STORE.users[key]) return res.status(409).json({ error: "An account with this email already exists. Try signing in." });
  STORE.users[key] = { name, email, hash: hashPw(password), createdAt: Date.now() };
  persist();
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
  persist();
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
  persist();
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
    try { fs.mkdirSync(path.dirname(COMM_PATH), { recursive: true }); fs.writeFileSync(COMM_PATH, JSON.stringify(COMM)); }
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
  const title = clean(req.body && req.body.title, 140);
  const body = clean(req.body && req.body.body, 2000);
  if (title.length < 8) return res.status(400).json({ error: "Please write a clearer question title (8+ chars)." });
  const q = { id: newId(), title, body, country: clean(req.body && req.body.country, 40) || "Multiple", tag: clean(req.body && req.body.tag, 30) || "General", author: clean(req.body && req.body.author, 40) || "Anonymous", ts: Date.now(), votes: 0, answers: [] };
  COMM.questions.unshift(q);
  COMM.questions = COMM.questions.slice(0, 500);
  persistComm();
  res.json({ ok: true, question: q });
});
app.post("/api/community/answer", (req, res) => {
  const q = COMM.questions.find((x) => x.id === (req.body && req.body.questionId));
  if (!q) return res.status(404).json({ error: "Question not found." });
  const body = clean(req.body && req.body.body, 2000);
  if (body.length < 4) return res.status(400).json({ error: "Answer is too short." });
  const a = { id: newId(), body, author: clean(req.body && req.body.author, 40) || "Anonymous", ts: Date.now(), votes: 0 };
  q.answers = q.answers || []; q.answers.push(a);
  persistComm();
  res.json({ ok: true, answer: a });
});
app.post("/api/community/vote", (req, res) => {
  const q = COMM.questions.find((x) => x.id === (req.body && req.body.questionId));
  if (!q) return res.status(404).json({ error: "Question not found." });
  if (req.body.answerId) { const a = (q.answers || []).find((x) => x.id === req.body.answerId); if (a) a.votes = (a.votes || 0) + 1; }
  else q.votes = (q.votes || 0) + 1;
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
  COMM.leaderboard = COMM.leaderboard.slice(0, 2000);
  persistComm();
  res.json({ ok: true });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
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
