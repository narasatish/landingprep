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
    for (const route of ROUTES) {
      const page = await browser.newPage();
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
        const res = await page.evaluate(() => ({
          boundary: /Something hiccupped|didn.t load right/i.test(document.body.innerText || ""),
          appErrors: (window.__lpErrors || []).slice(0, 5),
        }));
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
