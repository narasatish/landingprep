# LandingPrep — Session Handoff (read me FIRST in a new session)

**Last updated: 2026-08-13 (session 10) · repo at v443 · branch `main`, all pushed & live.**
Production auto-deploys on every push to `main`. Keep this file updated at the end of major
work — it went 4 versions stale (said v394 while production ran v401) and cost a session's
worth of re-derivation.

> 🛑 **READ THIS BEFORE OPTIMISING ANYTHING.** A query-level analysis of the GSC export showed
> the ENTIRE on-page opportunity is worth **~1.8 clicks/month**: 20 queries sit in the winnable
> band (position 8–30 with volume), totalling 34 impressions/month against **564 site-wide**.
> The site has **767 indexed pages earning ~0.7 impressions/page/month**. It is technically
> excellent — SEO 100, accessibility 100, every sitemap URL verified live, valid schema
> throughout — and none of that is the problem.
> **The constraint is authority (links + brand), which cannot be written into this repo.**
> Sessions 7–9 shipped ~12 deploys of real fixes and moved clicks by approximately zero. Before
> starting any SEO/perf task, ask what it is worth in clicks; usually the answer is "nothing,
> the effort belongs in `docs/backlink-outreach-kit.md`".

> 📊 **A real GSC export now exists** — `Performance on Search, 2026-08-08, last 3 months`
> (28 clicks / 4,527 impressions / 302 pages). Everything in the "GSC reality" section below
> is measured from it. **Ask the owner for a fresh export before any pruning or
> content-priority decision** — the session-9 export was the difference between pruning the
> right 24 pages and destroying the site's best-performing family (see below).

> ⚠️ **Do not trust the version number written in a commit MESSAGE — or in this file.**
> `1febcc32` says "(v413)" but shipped **v411**, and session 9 then wrote "v417" here while
> production ran **v416**. The number gets typed from memory instead of read after the build,
> and the warning did not stop it happening again. Read `sw.js`
> (`git show <sha>:sw.js | grep lp-v`) for the real value, every time.
> Verified chain: 401 → 405 → 409 → 411 → 413 → 415 → 416 → 417 → 421 → 423 → 425 → 428 → 431
> → 432 → 436 → 437 → 438 → 439 → 443 — every deploy bumped, no duplicates.

> 🔎 **Session 10 changed where the effort should go.** Sessions 7–9 concluded the on-site work
> was exhausted and only authority remained. That is still true *for SEO* — but it was never
> true for the PRODUCT. One hour of actually using the app (rather than auditing it) turned up
> a broken IELTS Listening player, then 450 questions whose review screen showed a question the
> student never saw, then a test library advertising ~3.5x more material than it holds. None of
> these appear in any audit, because every page renders, every test passes and every URL is
> 200. **Use the product before auditing it.**

---

## 📉 The test library holds far less material than the file count suggests

Measured 2026-08-12. `content/` has **1,019 `test-NNN.json` files** and **5,420 distinct
questions** across 18,735 instances — **each question is shown ~3.5x**. Per section, counting
for each test how much material had NOT appeared in an earlier-numbered test of that section:

| section | files | tests' worth of material | tests adding NOTHING new |
|---|---|---|---|
| `celpip/reading` | 30 | ~1.1 | 15 |
| `gmat/verbal` | 30 | ~1.3 | 27 |
| `gmat/quant` | 30 | ~1.9 | 28 |
| `toefl/listening` | 30 | ~2.1 | 27 |
| `ielts/reading` | 60 | ~4.0 | **54** |
| `ielts/listening` | 61 | ~5.7 | 50 |
| `pte/listening` | 60 | ~6.1 | 47 |
| `celpip/listening` | 60 | ~6.9 | 50 |

Genuinely varied, leave alone: `toefl/reading` (95% new), `oet`/`sat`/`act` (97–99%),
`pte/speaking-writing` (74%), `duolingo/literacy` + `comprehension` (71%), `celpip/writing`
(70%), `ielts/writing` (69%), `gre/quant` (60%).

The copy was fixed to advertise **5,400+ practice questions** instead of "1,000+ mock tests",
and `tools/audit-content-claims.mjs` (in `npm test`) now fails the build if any advertised
number exceeds the measured total. **The content itself was NOT fixed** — writing real
questions for the eight sections above is the outstanding job, and it is the one that would
actually make the product good. Do not "fix" it by deleting files: the full mocks reference
section tests by filename (`mock-014` → `test-014.json`), so deletions must rewire those.

### ⚠️ Three wrong measurements of this, in order — do not repeat them
1. **Hashing question stems only** → "513 duplicate files". Wrong: ignores passages.
2. **Hashing whole files** → "almost no duplicates". Wrong: defeated by supersets —
   `celpip/reading/test-002` contains *every* string in `test-001` plus 38 more, so the two
   hash differently while offering a student nothing new.
3. **Hashing full mocks with `file` refs stripped** → "29 of 30 add nothing". Wrong and nearly
   caused 387 deletions: full mocks are 1 KB compositions whose entire identity IS the section
   files they point at. They are distinct.
   The metric that survived: **novel substantial strings per test, in order**.

---

## ⚠️ Dead ends already paid for — do NOT repeat these

**1. CLS on the homepage is NOT measurable with local Lighthouse.** The metric is *bimodal*, not
noisy: on unchanged code, 10 runs gave `0.000, 0.000, 0.004, 0.004, 0.145, 0.150, 0.150, 0.152,
0.152, 0.156` — **6/10 contained the big shift**. A single run tells you nothing, and comparing
two single runs is worthless. Session 9 burned ~12 experiments before establishing this.
- Bisecting `<GoalOnboarding />` out gave 0.007 on ONE run, which looked like a smoking gun. Run
  properly at n=10 it was **9/10 still shifting** — the modal was never the cause.
- Four "fixes" measured and rejected: always-mount + animate opacity, instant opacity flip,
  removing the full-viewport `backdrop-filter`, and revealing on first interaction (that one
  measured *worse*, and was wrong anyway — only DISCRETE inputs open CLS's 500 ms exclusion
  window, scroll does not, and Lighthouse's own scrolling/touch fired it mid-trace).
- **If you attempt this again:** n≥10 per variant, compare the RATE of >0.1 shifts, and validate
  against the owner's PageSpeed runs, not this machine.

**2. Local Lighthouse timings on this machine are garbage.** It reported TBT 4,000–11,000 ms;
real PSI says **50 ms mobile / 10 ms desktop**. Main-thread work was never a problem. Any local
timing number in older notes should be discarded.

**3. Do NOT write more "study abroad from <country>" pages.** The existing
`/blog/study-abroad-from-nigeria-2026/` and `/blog/study-abroad-from-pakistan-2026/` have **zero
impressions in 3 months**, and zero queries mention those countries. `keyword-suggest.mjs` flags
Bangladesh/Nepal as gaps — they are gaps because there is no demand reaching this domain, not
because the pages are missing. Writing them adds thin pages and nothing else.

**4. theme.css is NOT a sitewide problem.** It is 302 KB raw / 50 KB gzipped and render-blocking,
but it is loaded by **`index.html` only** — the SPA homepage. All 780+ prerendered SEO pages
inline ~8.6 KB and load **no external stylesheet at all**, which is why a static page scores 87
desktop while the homepage scores 61. So critical-CSS extraction would improve exactly one page,
which receives mostly branded traffic. Low ROI, real FOUC risk. Left alone deliberately.

**5. Minifying `app-bundle.js` was tried and reverted.** Saved 19 KB gzipped, no measurable TBT
gain, and it collapses line numbers in every stack trace the `/api/clienterror` reporter sends
home. Bad trade.

---

## What this project is
**landingprep.com** — a 100%-free exam-prep (15 exams: IELTS, TOEFL, PTE, CELPIP, Duolingo,
GRE, GMAT, OET, SAT, ACT…) + study-abroad SPA. **React via CDN, no framework build**; JSX is
precompiled to `.js` by esbuild. ~1,357 prerendered pages on disk, **767 in the sitemap** (was 811 before the session-9 pruning)
(the rest are deliberately noindex/canonicalised), generated by `scripts/generate-seo-pages.mjs`.
Served by **`server.js` (Express) on Render free tier**. Owner: **Satish**
(narasatish966@gmail.com). Instagram @landing_prep (auto-poster in repo).

> ⚠️ **This is the LandingPrep repo, NOT Syllab** (a different project of the same owner).
> Never write "Syllab" into content, docs or config. Verified clean as of v405 — the only
> occurrence is the warning note in `docs/claude-playbook.md`. Beware: grepping `syllab`
> matches **syllable/syllabus** — 76 false positives. Use `\bsyllab\b`.

## ⚠️ CRITICAL deploy model (misunderstanding this caused a 2-feature production outage)
- **Render's `buildCommand` is `npm install` — it does NOT run `npm run build`.** Render serves
  **exactly the files committed to git, as-is.** So every build output (`app-bundle.js`, all
  `screens/*.js`, `college-data.js`, `blog-data.js`, the prerendered `/**/index.html`, sitemap,
  `sw.js`) **must be built locally and committed.** If a generated file isn't committed, it 404s live.
- **You MUST run `npm run build` locally before committing** (bumps `sw.js` CACHE_VERSION
  `lp-vNNN` + all `?v=` refs, regenerates SEO pages, runs the SEO audit which FAILS on broken links).
- `npm test` = hooks gate + exam validation + SEO audit + answer audit + IG tests + **Playwright
  smoke (26 routes in real Chromium)**. Run before every deploy.
- **Verify on PRODUCTION after deploying**, not just locally. Poll `curl -s
  https://landingprep.com/sw.js | grep CACHE_VERSION` until it shows the new version.

## ⚠️ The lazy-data 404 trap (DO NOT re-trigger)
- `college-data.js` (College Predictor) and `blog-data.js` (in-app blog) are **lazy-loaded**, NOT
  `<script src>` in index.html. `precompile-jsx.mjs` only re-transpiles a lazy module **if its
  `.js` sibling already exists** ("sibling rule"). **If you `rm` one before building, precompile
  SKIPS it, `git add -A` stages the deletion, and it 404s on production.**
- **NEVER `rm college-data.js` or `blog-data.js`.** Guardrail: `precompile-jsx.mjs` fails the
  build loudly if `college-data.js`, `blog-data.js` or `seo-pages.js` is missing after transpile.

## ⚠️ OneDrive gotchas (repo lives on OneDrive — SLOW/flaky git)
- `git add -A` on the full tree can take **3+ minutes**. `.git/index.lock` races are common —
  the lock is often **stale and clears itself**; check `Get-Process git` before killing anything
  (killing `node.exe` also kills other sessions' dev servers).
- Commit+push via `run_in_background` with a long timeout and poll a sentinel line.
- **RECOMMEND moving the repo off OneDrive.**

---

## Shipped in session 7 (v405 + v409)

**v405 — five live defects found by audit, all fixed & verified on production**
1. **64 indexable `<title>`s were cut mid-phrase.** v401 fixed unbalanced parentheses; the same
   clamp still stranded a function word ("…Rules by") or severed a list ("…2026: USA" continuing
   ", Canada, UK"). New `dropDanglingTail()` in generate-seo-pages.mjs walks the cut back to a
   grammatically complete point, **running to a fixed point** (dropping a stranded "vs" exposes
   the severed list item behind it). 64 → 0. Build guard extended to assert the shipped result.
   *Trade-off: titles are shorter, so some lost keywords. Revisit per-page if CTR doesn't move.*
2. **hreflang contradicted itself on all 811 URLs** — sitemap said `en-IN`, every page said `en`.
   Now both `en`. **If you change one, change the other** (`generate-seo-pages.mjs` ~line 491 for
   the page, ~line 6032 for the sitemap).
3. **Mojibake** in homepage `og:image:alt` (double-encoded em dash). Only visible instance sitewide.
4. **Score converter had no bounds** — `pick()` snaps to nearest row, so IELTS "99" returned a
   confident "9.0 · C2". Added per-test ranges.
5. **GA4 + Microsoft Clarity now load deferred** (first interaction, or load+3.5s). The gtag/clarity
   QUEUE stubs still run immediately so no events are lost.

**v409 — accessibility**
- WCAG 1.4.1: prose + footer inline links now underlined; cards/tiles/CTAs/hubnav deliberately not
  (their shape distinguishes them, which satisfies 1.4.1). Lighthouse accessibility **95 → 100**.
- **CSS specificity trap hit twice here.** A `:not()` chain inherits its argument's specificity and
  silently out-ranked the card exclusions, underlining every card. And `footer .wrap a`
  (descendant) swallowed `nav.hubnav`, which lives inside the footer — it must be `footer>.wrap>a`.
  **Assert computed `textDecorationLine` in a real browser**, don't trust the CSS reading right.

**Tried and reverted:** minifying `app-bundle.js`. Saved 19 KB gzipped, **no** measurable TBT gain
(gzip already handled the whitespace), and it collapsed line numbers in every stack trace the
`/api/clienterror` reporter sends home. Bad trade — don't redo it without a stronger reason.

## Shipped in session 8 (v411 + v413)

**v411 — the homepage scrolled sideways on phones.** At 375px `document.scrollWidth` was 415.
- **Isolate by elimination, don't theorise.** The fixed-position onboarding overlay *measured*
  415 wide and looked like the cause; hiding it changed nothing (it was stretching to an
  already-wide layout). Hiding `ul.exam-list-simple` dropped scrollWidth to exactly 375.
- Real cause: the exam row is a flex row where `el-dot`/`el-name`/`el-new`/`el-arrow` all had
  `flex-shrink:0`, leaving `.el-tag` the only shrinkable item. "Duolingo English Test" (longest
  name) + the POPULAR badge already exceeded the 335px card, so the arrow was pushed to x=415.
- Fix in `theme.css`: `.el-name`/`.el-tag` may shrink + ellipsis; `.el-tag` hidden ≤430px;
  `.el-arrow` pinned with `margin-left:auto`. 375px: no scroll, 0 of 15 names clipped.
  1280px: all 15 taglines still visible.

**v413 — the 3 tap targets actually below WCAG 2.5.8's 24×24 floor**
- `See all guides →` 117×19 → 141×44 · `Just exploring — skip` 155×23 → 175×45 ·
  `.focus-x` 24×19 → 31×31. Grown by padding/min-size so nothing around them moves.
  Verified live: **0 remaining AA failures** across all interactive elements.
- ⚠️ **A crude count is not a defect count.** An earlier pass reported "74 of 151 tap targets
  under 44×44" — that included inline text links inside sentences, which 2.5.8 **exempts**.
  Filtered properly: only **3** failed. The pomodoro chips are exactly 24×24 and already pass.
  63 remain under the 44×44 AAA/Apple-HIG guideline — a design choice, not a compliance failure.

## Shipped in session 9 (v415 → v432) — first session with real GSC data

**v415 — pruned 24 zero-traffic pages, every removal backed by the export**
- 4 `/embed/<widget>/` → `noindex, follow` + out of sitemap. 73–89-word **iframe targets** for
  other people's sites, but indexable and colliding head-on with the real tools
  (`/embed/loan-emi/` "Free Education Loan EMI Calculator" vs
  `/tools/education-loan-emi-calculator/`) — Google could rank the stub. **Zero impressions in
  3 months**, so nothing forfeited. `follow` kept so equity flows; noindex does not affect
  iframe rendering. **The `/embed/` HUB stays indexed** — it is a backlink-acquisition asset.
- New `PRUNE_ZERO_TRAFFIC` set (checked in `emit()`, mirror of `KEEP_INDEXED`): 20 of the 22
  `/scholarships-in-<country>/`. Family averages **56% five-gram sibling overlap** at ~500
  words. Only 2 of 22 appear in GSC and both are excluded — `/scholarships-in-australia/`
  (29 impr) and `/scholarships-in-switzerland/` (1 impr but **position 4**).
- **Left alone deliberately:** the 44 `/scholarship/<named>/`. Same short+templated shape on
  paper, but Rhodes/Chevening/DAAD are real demand and `/scholarship/daad/` ranks **position 5**.
  These need DEEPENING, not deletion — the single best content investment available.
- Sitemap 811 → 786. Diffed URL-by-URL: exactly 25 gone = the 24 above + one unrelated
  (`/blog/express-entry-july-2026-draws-recap/`, whose `expires: 2026-08-07` passed and the
  existing auto-archive noindexed on schedule — `generate-seo-pages.mjs:1385`).

**v416 — fed the proven exam×university pages**
GSC's best performers were the site's *worst* internally linked: `/pte-for-rmit/` had **1**
inbound link on 93 impressions; `/academic-vocabulary-for-essays/` 2 on 62; `/compare/rwth-vs-kit/`
2 on 55. Cause: the university related-grid linked **only** `/ielts-for-<id>/`, never the
PTE/TOEFL variants, though all three exist for every university. New `PROVEN_EXAM_PAGES` is
derived FROM `KEEP_INDEXED` (so they cannot drift) and surfaces only vouched-for variants —
9 pages each gained an inbound link. Deliberately not blanket-linking all 334 combos.

**v417 — the scholarship pages finally cite their own source**
All 44 `/scholarship/<named>/` pages told the reader to "always confirm on the official
scholarship website" and **not one linked it** — the reader's obvious next click, and the
page's missing citation. 23 now render an "Official source" card (+ a not-affiliated note),
plus `MonetaryGrant` JSON-LD built strictly from fields already on the page, with the official
URL as `url`/`sameAs`/`sponsor` so the entity resolves to the awarding body, not to us.
`/scholarship/daad/` 403 → 456 words.
- **Verification changed the answer 11 of 26 times.** The obvious addresses redirect elsewhere:
  Holland Scholarship is now the **NL Scholarship**, Aga Khan moved to `the.akdn`, Canada
  Graduate Scholarships to `nserc-crsng.canada.ca`, GREAT under `/scholarships-funding/`. The
  FINAL post-redirect URL ships, so nobody eats a hop. Links were then re-fetched **from the
  built HTML** (not the source list): 23/23 returned 2xx.
- **3 pages deliberately have NO link**: `aauw` + `clarendon` return persistent HTTP 403
  (bot-blocked — probably fine for a human, but unverifiable, and an unverified outbound link
  is worse than none), and `vanier` (below). The 18 country-prefixed scholarships
  (`czech-republic-*`, `denmark-*`, `finland-*`, `poland-*`, …) likewise: their official
  addresses were not confidently known, and guessing is what the never-fabricate rule forbids.

**v421 — the Vanier page was advertising a scholarship that no longer exists** ✅ RESOLVED
It showed "CAD 50,000/yr" with a "Sep–Nov" deadline as though applications were open. Verified
against the University of Toronto SGS award page and the official NSERC funding page: the
programme is **discontinued** (final competition fall 2024, results April 2025), replaced by the
**Canada Graduate Research Scholarship – Doctoral** (CAD 40,000/yr for 36 months, 17 Oct agency
deadline, international applicants capped at 15% of awards). This is the worst error class this
site can make — a real applicant could have prepared for a competition that no longer runs.
- **Kept, not deleted.** People still search "Vanier"; the useful thing this URL can now do is
  say it's gone and what replaced it. New `discontinued` field drives an unmissable ⛔ banner,
  a replacement table, rewritten FAQs ("Can I still apply?" → "No"), how-to-apply steps that
  describe the REPLACEMENT and say so, and suppression of "why it's worth applying". 403→731 words.
- ⚠️ **Both clamps had to be overridden by hand.** The generated title clamped back to plain
  "Vanier Canada Graduate Scholarship", dropping the word **Discontinued** — the one thing the
  searcher must see. The description clamped mid-phrase at "It is replaced by the…". The
  `discontinued` object therefore takes optional `title` and `desc` overrides. **Any future
  closed programme should use them** rather than fight the clamp.

> 🚩 **STILL OPEN — the rest of `scholarship-data.jsx` has never been re-verified.** Vanier was
> found only because its official URL 404'd during the v417 link pass. **11 of 26 official URLs
> had silently moved**, so amounts, deadlines and eligibility in that file are equally likely to
> be stale. Nothing there has been checked against source since it was written. Treat every
> figure as unverified until someone does a pass.

**Tried and reverted (session 8): `content-visibility:auto` on the 16 below-fold sections.**
Attempted twice — first with a flat 600px placeholder, then properly with per-section
`contain-intrinsic-size` measured at 375px (sections range **124px–2,975px**, so the flat value
was wrong for nearly all of them). Median of 5 baseline vs 4 treatment runs, same host:
`perf 28→27 · TBT 4,794→10,719ms · LCP 6.6→7.5s · CLS 0.150→0.152`. Accurate sizing did remove
the CLS regression the naive attempt caused, but TBT median **more than doubled** — Lighthouse
scrolls during the audit so every section renders anyway and the containment is pure overhead.
**Don't retry without a fundamentally different approach** (e.g. genuine lazy React rendering).

---

## Shipped in session 10 (v436 → v443) — found by USING the product

**v436 — IELTS Listening could hang forever on "Audio in progress".** Gemini TTS with no
timeout and no failure path; if it stalled, the section was unusable and the student could not
proceed. Added `withTimeout()`, a `geminiTtsHealthy` circuit breaker, a settle-once guard with
a length-scaled watchdog, a bail-out when `getVoices()` is empty, and a visible `role="alert"`
warning. `setPlayed()` no longer fires when playback failed.

**v437 — the answer review showed a question the student never saw.** 450 of 1,240 IELTS
listening questions carried a `prompt` field filled with placeholder text about an unrelated
hotel booking — 15 distinct strings, each repeated 30x across the 31 files. The test screen
was always right (it renders the real label); the *review* renders `text`, which
`normalize-test.jsx` built from `prompt`. So test-001 showed *"what is the check-in time?"*
above the answer **"Thornton"** (real question: "Applicant surname"). That same `text` is fed
to the AI tutor's explain call, so the tutor was justifying answers against the wrong question.
Fixed both halves: all 450 prompts rewritten by *deriving* from each question's own
`label`/`sentenceText` (0 answers changed, 0 labels changed, verified against HEAD), and the
normalizer now builds `text` from the field that holds the question so a bad prompt can never
reach the review or the tutor again. Dropped 452 placeholder `audioContext` fields (read by no
screen) and aligned dead `parts[].context` values to the real script titles.

**v438 — the headline claim outran the content.** See the section above.

**v439 — the paid Gemini key was billing for work the free tier can do, and a trap was
armed.** `/api/tts` built its URL from `GEMINI_API_KEY` and *gated availability on it*. So
setting ONLY `GEMINI_API_KEY_FREE` — exactly what the server's own startup warning instructs —
would have returned 503 on every TTS request and silently killed all audio on the site: the
listening player, the examiner voice, the speaking partner. `geminiVerifyCaption()` had the
same shape (gated on the paid key, called `geminiPost()` with no key so it defaulted to paid).
Both now walk `AI_KEYS` free-first, respect the paid daily cap, fall through on 429/quota, and
book spend to the tier that served the request. Also fixed: the writing checker silently cut
essays at 3,500 chars while printing the full word count, so a 700-word GRE essay was graded
on ~600 words and marked down for a conclusion the examiner never saw (now 9,000, and it says
so if the cap is hit).

**v443 — every generated page now carries an honest "last updated" date.** ~700 indexed pages
had no freshness signal at all. Dates are keyed to a per-path fingerprint of the page's
`<main>` text (`content/page-dates.json`) and move ONLY when that text changes — stamping
today's date every build is fake freshness. Also made builds 6x faster (600s+ → 102s) by
skipping identical writes in `writeFileSafe`, and stopped the malformed-title check crying
wolf on "…SOP Sample".

### ⚠️ AUTH_SECRET is coupled to the Gemini key — read before rotating keys
`AUTH_SECRET` falls back to a hash of `GEMINI_API_KEY`, so changing or removing that key
**logs out every user**. This is live right now while migrating to the free key. Set
`AUTH_SECRET` explicitly in Render FIRST, then change the Gemini key. The derivation itself was
deliberately left alone (changing it would log everyone out immediately); a startup warning
now fires when it is unset.

### Checked in session 10 and found genuinely healthy — do not re-audit
- **Writing checker feedback** is really about the submitted text: a deliberately flawed essay
  came back quoting its own errors ("lifes", "technology have"), naming the missing
  counter-argument, and rewriting one of its own sentences. 6/6 on targeted checks.
- **College Predictor** uses all four inputs and quotes the user's real numbers back;
  `overBudget` is computed *and* rendered.
- **Speaking examiner** sends the live topic, last 8 turns, and the candidate's actual words.
- **Auth**: scrypt + random salt, `timingSafeEqual`, HMAC tokens with expiry, generic signin
  error (no user enumeration), reset codes that expire and lock, `/api/auth/` rate-limited to
  20 attempts / 15 min. Production Firestore reports **connected**, so accounts are durable.
- **Live SEO invariants**: 45 sitemap URLs sampled across the whole file — 0 redirects, 0
  non-200, exactly 1 title / description / canonical each, canonical == sitemap URL, 0 JSON-LD
  parse failures. Checked again in the *hydrated* DOM and after two client-side navigations:
  still exactly 1 of each (no react-helmet duplication).
- **GEO**: every major AI crawler explicitly allowed in robots.txt, sitemap declared, llms.txt
  live (11 KB) with no stale claims.

### 📏 Thin content: the policy and the gate disagree by ~6x
Measured across all 766 indexed pages (unique `<main>` text): median **644 words**; **22% under
400 words**; only **13% meet the 1,500-word policy** in CLAUDE.md. The enforcement gate is
`THIN_MIN_CHARS = 1500` — 1,500 *characters*, roughly 250 words.
**Do not "fix" this by tightening the gate**: `/pte-for-rmit/` is 257 words and holds a
page-one ranking ("rmit university pte score requirement", position 5.4). Thin here does not
mean worthless. Deepening the highest-potential pages is the real work; mass-pruning would
repeat the session-9 near-miss.

### Where to look next (same method: use it, don't audit it)
The AI checkers, College Predictor, auth and SEO invariants are now covered (above). Still
unexercised: **the signup → progress-saving → history round trip in a real browser** (the code
and rate limits check out, but nobody has driven the flow), the **PTE/CELPIP/Duolingo section
renderers**, and the **error notebook / progress analytics**.

---

## Measured performance (real Lighthouse — measured, not assumed)
- **Static prerendered pages are fine.** `/gmat-quant-formulas/` desktop: perf **87**, LCP 1.9s,
  CLS 0, TBT 90ms, accessibility 100.
- **The SPA homepage is the outlier.** Production mobile, same host before/after:

  | | before (v401) | after (v409), median of 3 |
  |---|---|---|
  | perf | 25 | **36** |
  | LCP | 9.7s | **6.4s** |
  | TBT | 5,220ms | **4,112ms** |
  | CLS | 0.142 | **0.000** (0 in all 3 runs) |

  Cause of the "before": clarity.js 2,494ms + gtag 1,561ms of main-thread bootup, now deferred.
  The "before" was a single run, so treat the magnitude cautiously; CLS→0 is the solid part.
- **Still poor at ~36.** Remaining cost is React itself (app-bundle ~1.3s + react/react-dom
  ~2.3s bootup) rendering **947 DOM elements**. **Real fix is code-splitting** — a genuine
  refactor, not attempted. `content-visibility` was tested twice and made it worse (see above).

### ⚠️ How to measure this WITHOUT fooling yourself
- **Never trust a single Lighthouse run.** A session-7 claim that deferring analytics took TBT
  5,220→2,480ms was **noise, not a result** — the same code later measured TBT 2,480 vs 11,090ms.
  It was only caught because a post-revert baseline matched the "regression" just reverted.
- **The variance was self-inflicted:** builds and `npm test` running concurrently. With the
  machine quiet, 5 runs gave a stable perf 27–30. **Stop other work, then run n≥5 and compare
  MEDIANS.**
- **Localhost is not a proxy for production CLS.** Localhost shows CLS 0.15 (`main#main-content`
  shift + a fonts.gstatic.com reflow); production shows **zero** layout shifts. Cause of the
  difference was never determined. Localhost is valid for before/after on the same host only.
- **CrUX field data is blocked** — needs a PSI API key (the AI-Studio `GEMINI_API_KEY` returns
  401: "API keys are not supported by this API"), and keyless PSI is globally 429. Also note: at
  ~1,659 impressions the site likely has **too few Chrome users for CrUX to hold field data at
  all**, so a key may return nothing. Lab data is the meaningful signal for now.

## Verified healthy (sessions 7–8)
**816/816** live URLs returned 200 when measured at sitemap=811 (pre-pruning; now 767), no redirects, bogus path gives
a **hard 404** not a soft-200 · exactly one title/description/canonical on the homepage **and after
client-side nav through 5 SPA routes** (no react-helmet duplication) · 7 JSON-LD blocks parse ·
both score converters match the ETS concordance and round-trip · robots.txt allows all major AI
crawlers · `/api/health` 200, Firestore connected · **zero** Syllab brand leaks.

**GEO / AI-citability — audited session 8, healthy, nothing to fix.** Across 812 indexable pages:
FAQPage schema **94%** · a concrete figure in the first 1,200 chars **93%** · quick-answer block
**70%** · question-shaped H2/H3 **48%** · **0** pages with a question in the title but no answer.
`llms.txt` accurate (110 universities / 15 countries verified against `college-data.jsx`; all 31
links 200). ⚠️ A mid-audit claim of "32 pages with no schema" was **wrong** — those are hub pages
carrying `BreadcrumbList` + `ItemList` (+ `Dataset`), which is correct for collection pages; the
test was just too narrow. Only real caveat: **273 pages (34%) under 600 words** — a prune-or-deepen
question under the March-2026 quality rule, not a schema one.

**AI tutor — spot-checked session 8 (3 live calls, `gemini-3.1-flash-lite`), passed all three:**
correct concordance (IELTS 7.0 → TOEFL 94–101, matching the site's own converter); refused to claim
unlimited mocks or GMAT AI feedback (correctly noted GMAT Focus has no essay section); refused to
reproduce real exam material on copyright grounds and offered an original passage instead.
⚠️ Minor inconsistency: the tutor says "no official conversion table provided by ETS" while the
site's own blog page is framed around the "official ETS concordance". Same numbers, opposite
framing — worth aligning.

---

## GSC reality + strategic conclusion
**Measured from the 2026-08-08 export (last 3 months, Web): 28 clicks / 4,527 impressions /
302 pages.** Desktop 21 clicks @ pos 36 · Mobile 6 @ pos 24.2 · Tablet 0. The homepage alone
takes 14 of the 28 clicks (pos 8.6, branded).

### What actually works — this reverses the old "prune the programmatic pages" instinct
The **university long-tail is the site's engine.** `/university/`, `/<exam>-for-<uni>/` and
`/compare/` occupy almost all of striking distance, and hold genuine page-one rankings:

| query | pos |
|---|---|
| "rmit university pte score requirement" | **5.4** |
| "rwth aachen ielts requirement" | **6.0** |
| "technical university of darmstadt application fee" | **6.7** |
| "university college cork application fee" | **9.9** |
| "ucc acceptance rate" | **10.3** |
| "university of sydney ielts requirement" | **10.0** |

**Do NOT prune this family.** Session 9 nearly did, on a 4-page duplication sample. Across the
full family the overlap is only 10%, 20 pages are already protected by `KEEP_INDEXED`, and
`/pte-for-rmit/` ranks 15.4 on 93 impressions. Pruning would have destroyed the one thing working.

### Highest-impression pages sitting on page 2–3 (the real targets)
`/university/ucc/` 101 impr @ 28.6 · `/pte-for-rmit/` 93 @ 15.4 · `/blog/ielts-to-toefl-score-conversion-2026/`
77 @ 21.4 · `/academic-vocabulary-for-essays/` 62 @ 18.8 · `/compare/rwth-vs-kit/` 55 @ 11.5 (2 clicks) ·
`/ielts-for-ucd/` 55 @ 12.1 · `/university/manchester/` 53 @ 16.3.
Biggest query-level volume in striking distance: "student visa checklist" (15 impr @ 24.2),
"student visa document checklist" (13 @ 23.2), "sds visa requirements" (9 @ 17.9).

### ⚠️ "Page-one rankings with zero clicks" is NOT a CTR problem — don't chase it
Session 9 first framed ~15 page-one/zero-click queries as a title/snippet failure. Checked
against standard position-CTR curves, those 9 page-one queries carry **~1.3 expected clicks in
total** at their impression counts. Observing 0 is unremarkable. It is a VOLUME problem, not a
CTR problem, and title micro-optimisation there is wasted effort. A reordered university title
was simulated across all 110 universities and **rejected**: it traded a clean 88%-"Fee" title
for dangling "…Acceptance" on long names, chasing a defect that does not exist.

- **The bottleneck is off-site authority (backlinks + brand).** BUT the older handoff's claim that
  "on-site SEO is SATURATED" was **wrong** — sessions 7–8 found 64 broken titles, a sitewide hreflang
  contradiction, a 25/100 mobile homepage, a page that scrolled sideways on every phone, and 3
  sub-minimum tap targets. **Audit before declaring saturation.** Note the flip side: sessions 7–8
  also produced three *false* alarms (32 "schema-less" pages, 74 "failing" tap targets, 76 "Syllab"
  hits that were the word *syllable*). **Verify a finding before acting on it, and before reporting
  a number.**
- Distribution is still the main click lever: `docs/ready-to-post-answers.md`,
  `docs/backlink-outreach-kit.md`, `docs/distribution-plan-8-weeks.md`. User posts these.

## Pending ON USER
1. **Set `GEMINI_API_KEY_FREE` in Render** — live `/api/health` returns `"aiKeys":["paid"]`, so every
   AI tutor call bills the PAID key, against the standing free-tier-first rule. The free-first ladder
   is already implemented in `server.js` (it warns at line 56); only the env var is missing. **This
   also blocks testing AI tutor response quality at zero cost.**
2. **Set `VAPID_PRIVATE` in Render** to turn on push sends — steps in `docs/push-setup.md`. No-ops
   gracefully until then.
3. **Post the distribution answers** — the real click lever.
4. **Blogs publish nothing.** `blog-queue.json` is **empty** and `auto-content-gen.yml` is
   **manual-only by design** (weekly cron deliberately removed — unattended LLM drafting feeding an
   auto-publisher is the scaled-content pattern the March-2026 update penalises, on visa/fee content
   where a fabricated figure misleads a real applicant). `daily-content.yml` fires daily at 04:30 UTC
   and no-ops. Newest blog `datePublished` is 2026-01-01. **Owner's call — do not re-enable unilaterally.**
5. ~~Verify `/scholarship/vanier/`~~ — **DONE in v421** (discontinued; page now explains the replacement). But the REST of `scholarship-data.jsx` is still unverified — see the 🚩 above.
   restructured; figures deliberately left untouched (see the 🚩 above). Update or retire.
6. Resend email setup may still be pending. Move the repo OFF OneDrive.

## Next on-site work, in the order the data justifies
> Re-read the 🛑 box at the top first. Everything in this list is worth a fraction of a click per
> month. It is maintenance, not growth. If you have a choice between any item here and sending
> five outreach emails, send the emails.

0. **Nothing on this list beats `docs/backlink-outreach-kit.md`.** Tier 0 there (the embed
   widgets) is the only asset that earns links without asking a favour, and §1b is the GMAT
   formula sheet — ~62 impressions/month stuck at position 65-69, purely an authority gap.
1. **Deepen the `/scholarship/<named>/` pages properly.** v417 gave them a verified source and
   schema, but they are still ~450 templated words with ~40% mutual overlap. Real depth needs
   researched, per-scholarship facts (eligibility detail, selection criteria, timeline,
   realistic odds) — each verified against the official site now linked from the page. **Do the
   9 with GSC impressions first**: `inlaks` (18 impr), `cgs` (16), `gates-cambridge` (6),
   `daad` (3, **position 5**), `uae-emirates-scholarship` (3), `fulbright-nehru` (2),
   `france-bgf-scholarship`, `nz-scholarships`, `sweden-kth-excellence` (1 each).
2. **Add official-source links to the remaining 21** (18 country-prefixed + aauw + clarendon)
   — same method: fetch, follow redirects, ship only the final 2xx URL.
3. **The striking-distance pages with real volume**, all needing RANKING not CTR work:
   `/university/ucc/` (101 impr @ 28.6), `/pte-for-rmit/` (93 @ 15.4),
   `/blog/ielts-to-toefl-score-conversion-2026/` (77 @ 21.4),
   `/academic-vocabulary-for-essays/` (62 @ 18.8).
4. **Homepage mobile perf.** Real PSI (owner-supplied, 2026-08-08): mobile Perf **61**, LCP 6.3s,
   FCP 4.1s, CLS 0.147, TBT 50ms; desktop **86**, LCP 1.9s, CLS 0.052. Fixed since: fonts made
   non-blocking, preconnects 4→2, versioned assets `immutable`, hero photo given a srcset
   (PSI's 95 KiB "improve image delivery" now passes). Remaining: "Reduce unused JavaScript
   354 KiB" (needs code-splitting the 66-file bundle) and CLS — see the dead-ends section before
   touching either. `content-visibility` failed twice; theme.css affects only the homepage.

## Not audited yet (be honest about this)
- **CWV field data** — blocked on a PSI API key, and may be empty anyway at current traffic (above).
- **a11y beyond Lighthouse**, and beyond the page types sampled — no screen-reader or keyboard-only
  pass, no colour-contrast audit across themes (dark mode untested).
- **Visual/design review** — session 8 measured mobile *geometry* (overflow, tap targets, font
  sizes) programmatically because the browser pane could not screenshot. **Nobody has actually
  LOOKED at the rendered pages.** Layout that is geometrically valid can still look wrong.
- **The other 811 pages' interactive behaviour** — only the two score converters were exercised.
- **273 thin pages (<600 words)** — identified, not triaged.
- **Deep AI tutor evaluation** — 3 prompts is a spot-check, not an eval set.

## Content rules (user mandate — non-negotiable)
- 100% accurate, **never fabricate**; verify against official sources; full names not shortforms.
- NEVER copy real exam questions (copyright) — original items matching real format only.
- Don't mass-add thin/programmatic pages. Quality over quantity.
- **Deploys need the user's explicit OK each time.**
- No `Co-Authored-By` trailer (project convention).
- AI feedback tools are **IELTS-only** — don't claim them for PTE/GMAT/TOEFL; never claim
  "unlimited" or "100+ mocks".

## How to report a check (learned the hard way)
Say what you **checked** and what you **did NOT**. Name the *class* of bug a check can't surface,
not just the coverage count. Measure the **rendered DOM** after hydration and after client-side nav.
Verify against the real artifact (grep the built file, assert computed CSS) — never a description
of it, and never an agent's opinion of a described diff.
