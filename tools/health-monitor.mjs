// health-monitor.mjs — external synthetic uptime + content check for the LIVE site.
// Run locally or from CI (GitHub Actions cron). Exits non-zero if any check fails, so
// the CI job goes red and emails you — this catches a full outage that the in-dyno
// monitor can't report (because it would be down too).
//   node tools/health-monitor.mjs            (checks https://landingprep.com)
//   BASE=https://landingprep.com node tools/health-monitor.mjs
const BASE = (process.env.BASE || "https://landingprep.com").replace(/\/$/, "");
const SLOW_MS = parseInt(process.env.SLOW_MS || "12000", 10);
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

let failures = 0;
console.log(`Health check → ${BASE}`);
for (const t of TARGETS) {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);
    const r = await fetch(BASE + t.path, { signal: ctrl.signal, headers: { "x-monitor": "ci" } });
    const body = await r.text();
    clearTimeout(timer);
    const ms = Date.now() - t0;
    const markerOk = !t.marker || body.includes(t.marker);
    const ok = r.ok && markerOk;
    if (!ok) failures++;
    console.log(`  ${ok ? "✓" : "✗"} ${t.path}  HTTP ${r.status}  ${ms}ms${markerOk ? "" : "  [marker MISSING]"}${ms > SLOW_MS ? "  [SLOW]" : ""}`);
  } catch (e) {
    failures++;
    console.log(`  ✗ ${t.path}  UNREACHABLE — ${e.message}`);
  }
}
if (failures) { console.error(`\n❌ ${failures} check(s) failed on ${BASE}`); process.exit(1); }
console.log(`\n✅ All ${TARGETS.length} checks passed on ${BASE}`);
