# LandingPrep — Session Handoff (read me first in a new session)

Last updated: 2026-07-03 (session 2) · repo at v323, committed locally on branch
seo/latest-exam-durations-and-quality — NOT yet pushed (push to main auto-deploys on
Render; needs user OK). This file lets a fresh Claude session continue with full
context. Keep it updated at the end of major work.

## Shipped this session (v321–v323, local commits a5a16ef0 / dde732e8 / 8e00c156)
- **TOEFL true multi-stage adaptive full mocks (v321)** — spec in
  docs/superpowers/specs/2026-07-03-toefl-adaptive-design.md. Reading/Listening have a
  Stage-1 gate; routing ≥70%→hard, ≤35%→easy, else medium; path-aware 0–30 scoring.
  tools/tag-toefl-difficulty.mjs (re-runnable) tags passages/files + emits
  content/toefl/adaptive-index.json. Engine: normalize-test.jsx (attachToeflAdaptive
  pre-loads alternates) + mock-test.jsx (routeAdaptiveStage, renderer gating). Any
  failure → fixed-form fallback. Old fixed-form disclaimers removed from 30 mocks.
- **Colleges hub 14 tabs → 10 (v322)** — loan→Scholarships & Loans, sop+apps→Apply
  Now, leaderboard→Community (sub-mode toggles); 4 nav groups. TAB_ALIAS keeps ALL old
  tab ids/deep-links working (#/colleges/loan/..., /sop, /apps, /leaderboard).
- **E2E + growth (v323)** — smoke-test now 25 routes + a real TOEFL-adaptive
  click-through; SW blocked in test context (first install reload was killing
  click-throughs). Funding-guide PDF email gate reused on Scholarships & Loans tab
  (window.LP_GuideDownload, per-page source analytics).
- run-tests.js "script loaded" checks now accept app-bundle.js membership (stale
  since v315 bundling; they were failing and blocking the npm-test chain).
- FLAGGED (chip spawned, not done): several content/toefl/reading files (e.g.
  test-005) have template-boilerplate passages — need rewriting as real content.

## What this project is
landingprep.com — 100% free exam-prep (15 exams) + study-abroad SPA (React-via-CDN, no
framework build; JSX precompiled by esbuild) + ~695 static SEO pages, served by
server.js (Express) on Render free tier. Auto-deploys on push to `main`.
Owner: Satish (narasatish966@gmail.com). Instagram: @landing_prep (auto-poster in repo).

## Build & deploy (CRITICAL conventions)
- `npm run build` = check-hooks gate → assets → precompile JSX → **make-bundle** →
  bump-version (CACHE_VERSION lp-vNNN + all ?v= refs) → SEO pages → SEO audit.
- **ALWAYS build before commit; ALWAYS bump happens automatically in build.**
- `npm test` = hooks gate + exam validation + SEO audit + answer audit + IG tests +
  **Playwright smoke test** (17 routes in real Chromium; needs `npx playwright install chromium` once).
- **Git on OneDrive is SLOW/flaky** (index.lock races, multi-minute adds). Pattern that
  works: `rm -f .git/index.lock` → commit/push via `run_in_background` → on conflict
  `git rebase -X theirs origin/main` (conflicts are only generated files/feed.xml; the
  auto-blog GitHub Action pushes to main ~hourly and races you). RECOMMEND moving repo
  off OneDrive (told user repeatedly).
- Frontend JS = ONE `app-bundle.js` (65 files concatenated by scripts/make-bundle.mjs in
  index.html order). New screens: add to index.html normally OR to the bundle MANIFEST.
- QA rule (user's global CLAUDE.md): fast haiku diff-review agent before reporting; run
  deterministic checks yourself first. Deploys need user's explicit OK (standing OK
  existed this session for the listed tasks).

## Everything shipped this session (all live, v299→v320)
- Full UI redesign: pro.css site-wide design layer (gradient buttons, SVG icon system
  window.LP_Ic/LP_IcChip in screens/home.jsx, bento cards, count-up in pro.js). Backup:
  screens/home.jsx.bak + git tag `home-redesign-only`.
- Perf: 65 scripts → 1 bundle (5 requests total on first load).
- Nav merge: one "Exams" item (exam-prep); every exam tile links its guide (#/exam-hub/<id>).
- Fixed crashes: Progress React #300 (hook after early return) — hooks gate now blocks
  the whole class at build time (tools/check-hooks.js, AST-based, self-testing).
- Security: password reset rebuilt — emailed 6-digit code (HMAC, 15-min, 5 attempts,
  anti-enumeration), 2-step UI in auth.jsx. OLD flow allowed account takeover.
- Email: Render free tier BLOCKS outbound SMTP (465+587 both fail ENETUNREACH/timeout —
  confirmed). Code supports Resend (HTTPS) — sendViaResend() in server.js; user must
  sign up at resend.com, verify domain (3 DNS records at `send`/`resend._domainkey` in
  Hostinger), set RESEND_API_KEY + RESEND_FROM in Render. **STILL PENDING ON USER.**
  Diagnostic: /api/admin/test-mail?key=<ADMIN_SECRET>&to=x (ADMIN_SECRET env: user was
  given `1W2st-HwEBX7WPtIZI4QuITK-_3pVvfH` to set; check if set).
- Exams updated to real 2026 patterns (verified via web search 2026-07):
  - ACT → Enhanced ACT: Eng 50q/35m, Math 45q/50m, Read 36q/40m, Science 40q/40m
    OPTIONAL, composite = E+M+R only (branch in mock-test.jsx scoreTest).
  - TOEFL → 2026: ~90 min (R27/L27/S12/W23), report shows 0–120 + indicative 1–6 band
    (dual-reported until 2028). Real test is adaptive; ours fixed-form (noted in-test).
    TRUE adaptive engine = possible future project.
  - PTE → added 2026 tasks: summarize_group_discussion + respond_to_situation
    (pte-sw-renderer.jsx TYPE_META + stimulus branches; 10 original items in
    content/pte/speaking-writing/test-001..005). exam-patterns.json is the canonical spec.
  - IELTS/GRE/GMAT/SAT/Duolingo/CELPIP/OET verified current — no changes needed.
- Growth assets built: 3 IG carousels (marketing/carousels/, 15 PNG slides via
  scripts/make-carousels.cjs), 6-page lead-magnet PDF (marketing/2026-scholarships-
  funding-guide.pdf via scripts/make-guide-pdf.cjs), email-gated instant download on
  home (GuideDownload in home.jsx), share-cards wired (home score check + mock results +
  band checker + test finder), visa-interview coach upgraded (mic answering, 34 original
  questions, 6 countries — screens/visa-interview.jsx), data-study page
  /study-abroad-funding-facts-2026/, AEO answers block in llms.txt.
- SEO: 26 proven exam×uni/compare pages re-indexed (KEEP_INDEXED whitelist in
  generate-seo-pages.mjs); ~440 zero-impression combos stay noindexed (March-2026
  penalty recovery). GSC reality: ~13 clicks/3mo, avg position ~29 — recovery needs
  BACKLINKS + TIME (3–6 months), not more code. Best-traction pages: Germany blocked
  account, Canada GIC, education-loan guides.

## Content rules (user mandate)
- 100% accurate, never fabricate; full names not shortforms; everything must be
  genuinely useful to users ("1000%"), not SEO filler.
- NEVER copy real exam questions (copyrighted) — original questions matching real
  format/timing/difficulty only. User explicitly agreed.
- Don't mass-add thin/programmatic pages (domain-level penalty risk).

## Pending on USER (remind if relevant)
1. Resend setup (email is dead until then — reset codes, welcome, digest).
2. Post the IG carousels + film Reel scripts (10 scripts delivered in chat).
3. Send backlink outreach (kit in docs/), promote the funding-facts data study.
4. Move repo off OneDrive.
5. WEEKLY_DIGEST=1 env when email works; delete duplicate IG post; GSC re-index requests.

## Possible next work (user-approved direction, not started)
- TOEFL true multi-stage adaptive engine + new 2026 task types beyond timings.
- Colleges hub tab consolidation (14 tabs → fewer).
- E2E: extend smoke test coverage; PDF gate on more pages.
