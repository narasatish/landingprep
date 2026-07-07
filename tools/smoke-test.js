/* smoke-test.js — end-to-end "does every page actually load?" gate.
   Boots the real server, opens each main route in a headless Chromium (Playwright), and
   FAILS if any page: throws a React/JS error, shows the "Something hiccupped" error
   boundary, or doesn't mount. This is the guard that catches the kind of crash that hit
   /#/progress — at the real user level, not just static analysis.

   Run: node tools/smoke-test.js   (needs `npm install playwright && npx playwright install chromium`)
   Degrades gracefully (exit 0 + warning) if Playwright/Chromium aren't installed, so it
   never blocks a build on a machine that hasn't set it up. */
"use strict";
const { spawn } = require("child_process");
const http = require("http");

let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { console.warn("⚠ smoke-test skipped — Playwright not installed (run `npm install playwright && npx playwright install chromium`)."); process.exit(0); }

const PORT = process.env.SMOKE_PORT ? Number(process.env.SMOKE_PORT) : 3097;
const BASE = "http://localhost:" + PORT;
// The routes a real user hits. /#/progress is the one that crashed — it's first.
const ROUTES = [
  "/#/progress", "/#/", "/#/exam-prep", "/#/exams", "/#/colleges", "/#/tools",
  "/#/learn", "/#/vocabulary", "/#/languages", "/#/writing-checker", "/#/speaking-checker",
  "/#/blog", "/#/login", "/#/achievements", "/#/relocate",
  "/mock-test/ielts/", "/study-abroad-funding-facts-2026/",
  // Smart Notes: a prerendered /learn/<exam>/<slug>/ page must render (concept map + quiz)
  "/learn/ielts/writing-task2-structure/",
  // Colleges hub consolidation (v322): legacy tab ids must still resolve via TAB_ALIAS
  "/#/colleges/loan/Germany", "/#/colleges/sop", "/#/colleges/leaderboard", "/#/colleges/visa",
  // Exam-prep deep routes incl. the TOEFL adaptive mock list
  "/#/exam-prep/toefl/full", "/#/exam-prep/ielts/reading", "/#/exam-hub/toefl",
  "/practice/toefl/",
];

function waitForServer(timeoutMs) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    (function ping() {
      const req = http.get(BASE + "/api/health", (res) => { res.resume(); resolve(); });
      req.on("error", () => { if (Date.now() > deadline) reject(new Error("server didn't start")); else setTimeout(ping, 400); });
      req.setTimeout(2000, () => req.destroy());
    })();
  });
}

(async () => {
  const server = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT: String(PORT), WEEKLY_DIGEST: "0", DAILY_REMINDER: "0" }, stdio: "ignore" });
  let browser;
  const failures = [];
  try {
    await waitForServer(20000);
    browser = await chromium.launch({ headless: true });
    // Block service workers: on a fresh profile the first SW install fires
    // controllerchange → location.reload() (index.html), which kills any
    // click-through scenario mid-flight. Real users only reload once ever.
    const ctx = await browser.newContext({ serviceWorkers: "block" });
    for (const route of ROUTES) {
      const page = await ctx.newPage();
      const errs = [];
      page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
      page.on("pageerror", (e) => errs.push(String(e && e.message || e)));
      try {
        await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 20000 });
        // Wait for the app to actually mount content (resolves instantly on light pages,
        // gives data-heavy views the time they need) — no fragile fixed sleeps.
        let mounted = true;
        try { await page.waitForSelector("main, .report-shell, .login-shell, #root > *", { state: "attached", timeout: 14000 }); }
        catch (e) { mounted = false; }
        await page.waitForTimeout(700); // settle, let an error boundary surface if it's going to
        // The app normalizes the hash on some routes, which can destroy the evaluation
        // context mid-call — retry once after a beat instead of failing a healthy page.
        let res;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            res = await page.evaluate(() => ({
              boundary: /Something hiccupped|didn.t load right/i.test((document.body && document.body.innerText) || ""),
              appErrors: (window.__lpErrors || []).slice(0, 5),
            }));
            break;
          } catch (e) { if (attempt === 1) throw e; await page.waitForTimeout(1200); }
        }
        // Only count app/React errors — ignore third-party noise (Google Analytics / Clarity blocked in headless).
        const isAppErr = (e) => /Minified React error|render error|#3\d\d|rendered (more|fewer) hooks/i.test(e);
        const reactErr = [...errs, ...(res.appErrors || [])].some(isAppErr);
        if (res.boundary) failures.push(route + " → shows the 'Something hiccupped' error boundary");
        else if (reactErr) failures.push(route + " → React render error: " + ([...errs, ...res.appErrors].find(isAppErr) || "").slice(0, 120));
        else if (!mounted) failures.push(route + " → did not mount content within 14s");
        else process.stdout.write(".");
      } catch (e) { failures.push(route + " → " + String(e.message).slice(0, 120)); }
      await page.close();
    }
    // ── Deep scenario: the TOEFL multi-stage adaptive mock gates stage 1 and
    // routes stage 2 (the v321 engine) — a real click-through, not just a load.
    try {
      const page = await ctx.newPage();
      await page.goto(BASE + "/#/exam-prep/toefl/full", { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.click(".ep-start-btn", { timeout: 15000 });                    // open mock 1
      await page.click("text=Begin test", { timeout: 15000 });                  // test intro
      await page.click("text=Start section", { timeout: 15000 });               // reading intro
      await page.waitForSelector("text=Multi-stage adaptive", { timeout: 15000 }); // stage-1 gate visible
      await page.click("text=Submit Stage 1", { timeout: 15000 });              // route (0 answers → easy)
      await page.waitForSelector("text=Stage 2 loaded", { timeout: 15000 });    // stage-2 swapped in
      process.stdout.write(".");
      await page.close();
    } catch (e) {
      failures.push("TOEFL adaptive click-through → " + String(e.message).slice(0, 120));
    }
  } catch (e) {
    failures.push("harness error: " + e.message);
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.kill();
  }
  process.stdout.write("\n");
  if (failures.length) {
    console.error("\n✗ smoke-test FAILED — these pages would be broken for users:\n" + failures.map((f) => "  • " + f).join("\n") + "\n");
    process.exit(1);
  }
  console.log("✓ smoke-test: " + ROUTES.length + " routes loaded in a real browser — no crashes, no error boundary.");
})();
