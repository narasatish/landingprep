// Exercise the live endpoints with REAL input and read the OUTPUT.
// The point is not "does it return 200" — it is "does the answer use what I sent".
//
// This exists because "the page renders" was repeatedly mistaken for "the feature works".
// A hollow AI endpoint returns 200 with a fluent generic paragraph and passes every
// structural check ever written. So the assertions below check that the reply engages the
// SPECIFIC sentence submitted, and that a generated question is on the topic requested.
//
// COST WARNING — run with `npm run test:ai`, deliberately NOT part of `npm test`.
// It makes real Gemini calls, including a TTS call that returns ~200KB of audio. While
// GEMINI_API_KEY_FREE is unset those calls bill to the PAID key, so this is not something
// to run in a loop. Set the free key first (see the server's own startup warning).
import { spawn } from "child_process";
import http from "http";

const PORT = 3099;
const BASE = "http://localhost:" + PORT;

function req(method, path, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request(BASE + path, {
      method,
      headers: data ? { "content-type": "application/json", "content-length": Buffer.byteLength(data) } : {},
      timeout: 90000,
    }, (res) => {
      let b = "";
      res.on("data", (c) => (b += c));
      res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    r.on("error", (e) => resolve({ status: 0, body: "ERR " + e.message }));
    r.on("timeout", () => { r.destroy(); resolve({ status: 0, body: "TIMEOUT" }); });
    if (data) r.write(data);
    r.end();
  });
}

const server = spawn(process.execPath, ["server.js"], {
  env: { ...process.env, PORT: String(PORT), WEEKLY_DIGEST: "0", DAILY_REMINDER: "0" },
  stdio: "ignore",
});

const wait = async () => {
  const deadline = Date.now() + 90000;
  while (Date.now() < deadline) {
    const r = await req("GET", "/api/health");
    if (r.status === 200) return true;
    await new Promise((s) => setTimeout(s, 500));
  }
  return false;
};

const results = [];
const rec = (name, ok, detail) => { results.push({ name, ok, detail }); console.log((ok ? "  PASS " : "  FAIL ") + name + (detail ? " — " + detail : "")); };

try {
  if (!(await wait())) { console.log("server did not start"); process.exit(1); }
  console.log("server up on " + PORT + "\n");

  console.log("── READ ENDPOINTS ──");
  for (const [name, p] of [["health", "/api/health"], ["live data", "/api/live"], ["community", "/api/community"], ["leaderboard", "/api/leaderboard"], ["reviews", "/api/reviews"], ["push key", "/api/push/key"]]) {
    const r = await req("GET", p);
    rec(name, r.status === 200, `HTTP ${r.status}, ${r.body.length}B`);
  }

  console.log("\n── AI TUTOR CHAT (the English-teaching AI) ──");
  // A question with SPECIFIC content. A hollow implementation answers generically.
  const q = "In IELTS Writing Task 2 I wrote: 'Nowadays, many peoples thinks that technology is more better for education.' Identify every grammar error and give the corrected sentence.";
  const chat = await req("POST", "/api/ai-tutor/chat", { message: q, messages: [{ role: "user", content: q }], exam: "ielts" });
  console.log(`  HTTP ${chat.status}, ${chat.body.length}B`);
  let reply = "";
  try { const j = JSON.parse(chat.body); reply = j.reply || j.text || j.message || j.content || JSON.stringify(j).slice(0, 400); } catch { reply = chat.body.slice(0, 400); }
  console.log("  reply preview: " + String(reply).replace(/\s+/g, " ").slice(0, 300));
  // Does the reply engage the ACTUAL errors in the sentence?
  const rl = String(reply).toLowerCase();
  const cues = ["people", "think", "better", "much better", "far better"];
  const hits = cues.filter((c) => rl.includes(c));
  rec("chat returns 200", chat.status === 200, `HTTP ${chat.status}`);
  rec("chat reply is substantive (>120 chars)", String(reply).length > 120, String(reply).length + " chars");
  rec("chat reply engages the submitted sentence", hits.length >= 2, "matched cues: " + (hits.join(", ") || "NONE"));

  console.log("\n── AI TUTOR GENERATE ──");
  const gen = await req("POST", "/api/ai-tutor/generate", { exam: "ielts", section: "writing", topic: "urbanisation", prompt: "Generate one IELTS Writing Task 2 question about urbanisation." });
  console.log(`  HTTP ${gen.status}, ${gen.body.length}B`);
  console.log("  preview: " + gen.body.replace(/\s+/g, " ").slice(0, 260));
  rec("generate returns 200", gen.status === 200, `HTTP ${gen.status}`);
  rec("generate output mentions the requested topic", /urban/i.test(gen.body), /urban/i.test(gen.body) ? "yes" : "topic ignored");

  console.log("\n── TTS ──");
  const tts = await req("POST", "/api/tts", { text: "This is a listening test sample sentence.", voice: "Kore" });
  console.log(`  HTTP ${tts.status}, ${tts.body.length}B`);
  console.log("  preview: " + tts.body.replace(/\s+/g, " ").slice(0, 200));
  rec("tts responds", tts.status === 200 || tts.status === 503, `HTTP ${tts.status}` + (tts.status === 503 ? " (expected without a key)" : ""));

  console.log("\n── SUMMARY ──");
  const fails = results.filter((r) => !r.ok);
  console.log(`${results.length - fails.length}/${results.length} checks passed`);
  fails.forEach((f) => console.log("  FAILED: " + f.name + " — " + f.detail));
} finally {
  server.kill();
}
