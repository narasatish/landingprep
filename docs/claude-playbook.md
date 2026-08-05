# LandingPrep — Claude Playbook (read on demand)

> This file holds the detailed SEO + debugging lessons that used to live in CLAUDE.md.
> CLAUDE.md now points here so the details load only when you're doing SEO, debugging,
> or deploy work — not on every message. Read this file before that kind of work.

## SEO strategy (post March-2026 Google Core Update) — QUALITY OVER QUANTITY

The March-2026 core update penalises **scaled/programmatic/thin content** and applies a
**domain-level quality multiplier** (ratio of helpful:unhelpful pages). LandingPrep's reach
dropped because of ~1,175 URLs, many of them thin programmatic combos.

**DO NOT mass-add programmatic pages** (university-vs-university combos, competitor
"alternative" doorways, keyword-variation pages). They drag the WHOLE domain down. Instead:
- **Prune** thin pages → `noindex,follow` + remove from sitemap (see `THIN_PATHS` /
  `emit(path, html, {thin:true})` in `generate-seo-pages.mjs`).
- **Add only substantive content** (1,500+ words, real data, first-hand value) — deep guides,
  comparisons done as real resources.
- **Strengthen + interlink** existing top pages; optimise titles/metas for CTR.
- Earn backlinks (linkable assets, data studies) — never fabricate links.

## SEO stack used by top edtech companies (follow this model)
- **Prerendered static HTML** for every public route (done ✅) — bots get real meta without JS
- **JSON-LD structured data** per page type: Course, FAQPage, BreadcrumbList, Article,
  SoftwareApplication, EducationalOrganization
- **Canonical URLs** must EXACTLY match `TAB_TO_PATH` routes — never let sitemap drift from routes
- **og:image PNG** (not SVG) — WhatsApp/LinkedIn/iMessage all require PNG; `npm run build:og`
- **max-snippet:-1** in robots meta — lets Google show long snippets, improves CTR
- **hreflang en-IN** — signals Indian audience, boosts ranking for IN searches
- **FAQ schema on homepage** — earns rich snippet accordion
- **SoftwareApplication schema** — shows star rating + "Free" badge
- **BreadcrumbList on all sub-pages** — shows breadcrumbs in SERP
- **Aggressive keyword density** — real phrases Indians type: "free NCERT notes Class 10",
  "JEE mock test free 2026", "CBSE Class 10 Maths important chapters"

**Be aggressive on keywords — LandingPrep's content is FREE.** Every page description should
contain: "free", the exam name, "India" or "Indian students", and the action ("practice",
"mock test", "notes", "AI tutor").

> ⚠️ **This is the LandingPrep repo. Never write "Syllab" (a different project) into content,
> docs or config.** A QA sweep found Syllab branding live on 10 GMAT/PTE/TOEFL prep-lesson
> decks — on the final "Next Steps" slide, recommending a different site to LandingPrep's own
> users. Fixed in v395. Also note LandingPrep's **AI feedback tools are IELTS-only** (Writing
> and Speaking band checkers, Speaking Partner) — do NOT claim AI feedback for PTE/GMAT/TOEFL,
> and do not claim "unlimited" or "100+ mocks" anywhere; neither is verifiable.

## Debugging Lessons (HARD-LEARNED — check these FIRST)

When a feature "doesn't work" in production but seems fine in dev, suspect these in order before
touching application code:

1. **Vite env files** — `.env.local` loads in ALL modes including `npm run build`. Dev-only
   overrides MUST live in `.env.development.local`. Verify what's baked into a bundle:
   `Select-String -Path "dist/assets/*.js" -Pattern "localhost|<prod-domain>" -SimpleMatch`
2. **Firestore named databases** — `admin.firestore()` and `getFirestore()` default to the
   `(default)` database. If the project uses a named DB (e.g. `ai-studio-…`), every call returns
   `5 NOT_FOUND` until you call `db.settings({ databaseId })` on the backend AND configure the
   named DB on the client init.
3. **Firestore security rules** — every collection needs an explicit rule. Missing rules fall
   through to default-deny and ALL reads/writes fail SILENTLY in the client SDK. Symptom: "cache
   never hits" or "writes appear successful but data isn't there." Grep `firestore.rules` for the
   collection name before assuming the code is wrong.
4. **Render free-tier cold starts** — dynos sleep after 15 min idle, take 30–45 s to wake. Any
   frontend timeout under 60 s on a cold call will always fail. Either (a) bump timeout to ≥75 s,
   (b) pre-warm the backend on app/page mount with a `/health` ping, or (c) both.
5. **Service worker cache** — bumping `CACHE_VERSION` in `sw.js` is mandatory on every frontend
   deploy or users keep the stale bundle. After deploying, hard-refresh (Ctrl+Shift+R) or close
   all tabs for the new SW to activate.
6. **Mobile ≠ desktop timeouts** — never copy a desktop timeout to mobile blindly. If desktop
   works and mobile doesn't, suspect (4) and (3) together — desktop's longer timeout masked a
   cache rule problem that mobile exposed.

### Triage checklist when user reports "X is broken in production"

Run this BEFORE diving into application code. Each step is ~30 seconds.

- [ ] What does `grep -ohE 'localhost|<prod-api>' dist/assets/*.js` show? If localhost appears,
      env file is poisoning the build.
- [ ] Does `firestore.rules` have an explicit rule for every collection the code reads/writes?
- [ ] Does the backend's Firestore client call `db.settings({ databaseId })` for named DBs?
- [ ] Is the frontend timeout ≥ 75 s for any call that hits a free-tier dyno?
- [ ] Is `CACHE_VERSION` in `sw.js` bumped to a new value for this deploy? **ALWAYS bump.**
- [ ] Has the user hard-refreshed? Service workers are sticky.
- [ ] Does any new external resource (font, video, image CDN) need a CSP update in
      `firebase.json`? CSP blocks silently in production — check console after first deploy.
- [ ] Are all backend URL calls using the correct path? Backend prewarm = `/api/ai/health`,
      not `/health`.

### Cache-first pattern (what FINALLY worked for PPT lessons)

When AI generation is slow, cache the deterministic output in Firestore keyed by
`(class, subject, chapter)`. Rules: any auth'd user can read, only validated lessons (≥10 slides,
not flagged as fallback) can write. First user pays the cold-start cost; everyone else gets
instant cache hits. Combine with a backend pre-warm on the page where the user triggers the call.
