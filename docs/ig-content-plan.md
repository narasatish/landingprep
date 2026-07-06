# LandingPrep — Instagram Content Engine (living plan)

The engine (`scripts/ig-poster.js`) auto-posts **5 unique posts/day** + **1 carousel/week**.
This file is the roadmap: what each post type is, the rules, and what's built vs. to-do.
Goal: never repeat a topic within ~45 days. Seed uses `dayNumber*7` (coprime) so **every item in every pool is reachable**.

## Daily 5-post mix (slots, IST)
| Slot | Time | Theme | Rotates between |
|---|---|---|---|
| 0 | 08:00 | News / visa update | live RSS news + curated immigration/education news |
| 1 | 12:30 | Country / university | country spotlight · college spotlight · **Did-you-know facts** |
| 2 | 16:00 | Vocabulary | 4 IELTS/GRE words of the day |
| 3 | 19:30 | Scholarship | scholarship spotlight · **deadline/urgency card** |
| 4 | 21:30 | Cost / extra | cost compare · exam fees · exam guide · **country comparison** · **mistakes** · **checklist** |
| weekly | Sun 11:30 | Carousel | rotates 7 topics: Top-Cities (USA/UK/Canada/Australia/Germany) + Cheapest-Countries + Visa-Mistakes |

## Rules (enforced in the engine)
- **Never invent** current visa rules / fees / deadlines. News = real RSS headline + facts pulled from our **own vetted country data** + a "confirm on official sources" line.
- **No source name on the image.** (Caption is original; keep `landingprep.com`.)
- Image text short + bold; **full details in the caption**.
- `landingprep.com` bottom-right on every image. `@landing_prep` only in the **caption** (not the image).
- Hashtags: **on-topic, high-traffic only** (≤20). Never off-topic "trending" tags (war/news) → shadow-ban risk.
- Rotate CTAs: "Practice free…", "Compare countries…", "Find colleges…", "Save this guide…".

## Visual styles (real fonts via resvg: Anton + Poppins)
- **News** → black/yellow over AI dusk-scene · **Country/facts/scholarship/cost** → AI photo + point list · **Deadline** → dark + red + big date · **Vocab** → cream · **Carousel** → photo + paragraph slides.

## Content buckets — BUILT ✅ / TODO ⬜
**News/visa:** ✅ live RSS + curated (Canada/UK/Australia/USA/Germany)
**Country guides:** ✅ spotlight · ✅ did-you-know facts · ✅ cost · ✅ comparison (X vs Y) · ⬜ cheapest cities · ⬜ popular courses · ⬜ application timeline
**Universities:** ✅ college spotlight · ✅ Top-Cities carousels (5 countries) · ✅ top unis by country · ✅ no-GRE list · ✅ low-IELTS list · ⬜ Duolingo-accepted · ⬜ best colleges by field
**Exam prep:** ✅ exam guide/spotlight · ✅ exam fees · ✅ vocab · ✅ per-exam tips · ✅ exam comparisons · ✅ band-score guides · ✅ writing-task templates · ✅ quiz
**Scholarships:** ✅ 26 scholarships · ✅ deadline cards · ⬜ scholarship-by-country
**Application:** ✅ checklists (visa/SOP/pre-departure) · ✅ mistakes/avoid-these · ⬜ SOP/LOR/resume tips · ⬜ intake comparison (Fall vs Spring)
**Engagement:** ✅ did-you-know · ✅ myths/mistakes · ✅ checklists · ⬜ this-or-that · ⬜ mini-quiz · ⬜ comparison ("5 countries compared")

## Next to add (priority order)
1. Per-exam **tips** (IELTS/PTE/TOEFL/GRE) — deepens slot 2/4.
2. **University list** posts (no-GRE, Duolingo-accepted, low-IELTS) — high save.
3. **Exam comparison** (IELTS vs PTE, TOEFL vs Duolingo).
4. **Quiz / this-or-that** for comments.
5. More carousel topics (visa mistakes, cheapest countries, IELTS writing) → aim 3 carousels/week.

## Targets
5 posts/day · 1 carousel/week now → add carousels (→3/week) and Reels later. Evergreen pool target ≈ 690+ posts so the feed stays unique for months.

---

# Distribution starter kit (items 10–13) — copy-paste ready

> **Why this section exists:** GSC (Jul 2026) confirms your on-site demand is real but tiny (15 clicks / 3,014 impressions/3mo) and the ceiling is *authority/brand*, not more pages. Off-site distribution is the #1 lever. These are ready to execute — you press publish; nobody can do this part but you. All angles are grounded in your **proven** GSC topics: Germany blocked account, GMAT formulas, education loans, Canada study permit.

## A. YouTube — 4 starter videos (your #1 gap; cited in ~23% of AI Overviews)
Point every video's description + pinned comment at the matching free page.

1. **"Germany Blocked Account 2026: exactly how much + how to open it"** (8–10 min)
   Hook: "Germany needs €11,904 in a blocked account — here's the cheapest way to open one and get it approved." → link `/study-in-germany/` + `/tools/proof-of-funds-calculator/`. (191 impressions already sitting at pos 37 — video + internal links can lift it.)
2. **"Every GMAT Quant formula you actually need (free sheet)"** (10–12 min)
   Hook: "You don't need 200 formulas — you need these 20." Screen-share the formula sheet. → link `/gmat-quant-formulas/`. (135 impressions, biggest non-Germany pool.)
3. **"Education loan for abroad: secured vs collateral-free, honestly"** (8 min)
   Hook: "No collateral? You can still get a loan — here's who lends and at what rate." → link `/study-abroad-education-loan/` + EMI calculator.
4. **"Canada study permit 2026: what changed (SDS gone, PAL, 24-hr work)"** (8 min)
   Hook: "If you're using a 2023 guide, it's wrong. Here's the 2026 reality." → link `/study-in-canada/`.
   *Format tip:* also cut each into 2–3 Shorts (one fact each) — Shorts drive discovery, the long video builds watch time.

## B. Telegram — 2 launch posts (algorithm-free reach; where Indian aspirants live)
Create **@LandingPrepExams** + **@LandingPrepAbroad**, post 1 tip + 1 link twice daily (fixed times).
- *Launch post 1:* "🎯 Free, forever: 1,000+ full-length IELTS/TOEFL/PTE/GRE/GMAT mocks, an AI speaking partner, a college predictor and study-abroad tools — no signup. Start: landingprep.com. Daily tips drop here at 8am & 8pm."
- *Launch post 2 (abroad):* "🇩🇪🇨🇦 Proof-of-funds by country, 2026 (verified vs official sources): Germany €11,904 · Canada CAD 20,635 + tuition · UK £1,171–1,529/mo. Calculate yours free → landingprep.com/tools/proof-of-funds-calculator/"

## C. Reddit / Quora — value-first templates (48% of AI citations come from UGC)
Rule: answer the question fully FIRST; link only if it directly helps; never drop the same link twice.
- *r/IELTS / r/gradadmissions reply:* "[full genuine answer]… I self-scored my writing before the test with a free AI checker (landingprep.com/ielts-writing-checker, no signup) — good for catching Task-2 structure issues. Good luck!"
- *r/germany / r/studyAbroad (blocked account Q):* "[full answer with the €11,904 figure + how Sperrkonto works]… I put together a free calculator + guide that stays updated to the official amount if it helps: landingprep.com/study-in-germany/."
- *Monthly:* one "I built 1,000+ free mock tests — AMA" thread in a relevant sub.

## D. Backlinks + email (assets already built)
- `docs/backlink-outreach-kit.md` is ready — start Tier A: pitch the funding-facts data study to education journalists, add the free AI checker to university resource pages. 10–15 personalised emails/week.
- Weekly email digest is **blocked on Resend setup** (see SESSION-HANDOFF) — once live, it's your algorithm-proof retention channel and feeds branded search (a ranking input).

**Cadence that's sustainable solo:** 2 YouTube videos/week · 2 Telegram posts/day · 3–5 Reddit/Quora answers/week · 10 outreach emails/week. Track branded-search volume in GSC monthly — that's the leading indicator that this is working.
