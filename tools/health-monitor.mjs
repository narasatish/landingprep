// health-monitor.mjs — external synthetic uptime + content check for the LIVE site.
// Run locally or from CI (GitHub Actions cron). Exits non-zero ONLY on a real outage
// so the CI job goes red and emails you.
//
// COLD-START TOLERANT (this is the important bit): Render's free tier sleeps after
// ~15 min idle and takes 30-50s to wake. A naive check with a short timeout fires a
// FALSE "down" alert every time it happens to hit a sleeping dyno. So we:
//   1) send a warm-up ping first (75s budget) to wake the service,
//   2) run each check with a generous timeout,
//   3) RETRY any failure once after a short pause.
// Only a check that still fails after warm-up + retry counts as an outage.
//
//   node tools/health-monitor.mjs            (checks https://landingprep.com)
//   BASE=https://landingprep.com node tools/health-monitor.mjs
const BASE = (process.env.BASE || "https://landingprep.com").replace(/\/$/, "");
const SLOW_MS = parseInt(process.env.SLOW_MS || "12000", 10);
const PER_CHECK_MS = parseInt(process.env.PER_CHECK_MS || "30000", 10);
const WARMUP_MS = parseInt(process.env.WARMUP_MS || "75000", 10);
const TARGETS = [
  { path: "/", marker: "LandingPrep" },
  { path: "/api/health", marker: '"status":"ok"' },
  { path: "/which-english-test/", marker: "English Test" },
  { path: "/explore/", marker: "Explore" },
  { path: "/ielts-band-7/", marker: "IELTS" },
  { path: "/ielts-writing-checker/", marker: "Writing" },
  { path: "/ielts-speaking-checker/", marker: "Speaking" },
  { path: "/mock-test/ielts/", marker: "IELTS" },
  { path: "/content/pte/listening/test-001.json", marker: "questionType" },
  { path: "/content/ielts/reading/test-001.json", marker: "passages" },
  { path: "/content/celpip/listening/test-001.json", marker: "Problem Solving" },
  { path: "/content/gre/quant/test-001.json", marker: "correctAnswer" },
  { path: "/sitemap.xml", marker: "<urlset" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function hit(path, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(BASE + path, { signal: ctrl.signal, headers: { "x-monitor": "ci" } });
    const body = await r.text();
    return { ok: r.ok, status: r.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function checkOne(t) {
  const t0 = Date.now();
  try {
    const { ok, status, body } = await hit(t.path, PER_CHECK_MS);
    const markerOk = !t.marker || body.includes(t.marker);
    return { pass: ok && markerOk, status, ms: Date.now() - t0, markerOk };
  } catch (e) {
    return { pass: false, status: 0, ms: Date.now() - t0, markerOk: true, err: e.message };
  }
}

console.log(`Health check → ${BASE}`);

// 1) Warm-up ping: absorb a cold start before we start judging timings.
try {
  const w0 = Date.now();
  await hit("/api/health", WARMUP_MS);
  console.log(`  ⏱ warm-up ping ${Date.now() - w0}ms`);
} catch (e) {
  console.log(`  ⏱ warm-up ping failed (${e.message}) — continuing to per-check (with retry)`);
}
await sleep(1500);

// 2) Run every check; retry a failure once (transient blip vs. real outage).
let failures = 0;
for (const t of TARGETS) {
  let res = await checkOne(t);
  if (!res.pass) { await sleep(3000); res = await checkOne(t); }
  if (!res.pass) failures++;
  console.log(
    `  ${res.pass ? "✓" : "✗"} ${t.path}  HTTP ${res.status}  ${res.ms}ms` +
    `${res.markerOk === false ? "  [marker MISSING]" : ""}` +
    `${res.err ? "  [" + res.err + "]" : ""}` +
    `${res.ms > SLOW_MS ? "  [SLOW]" : ""}`
  );
}

if (failures) {
  console.error(`\n❌ ${failures} check(s) failed on ${BASE} after warm-up + retry — likely a real outage.`);
  process.exit(1);
}
console.log(`\n✅ All ${TARGETS.length} checks passed on ${BASE}`);
