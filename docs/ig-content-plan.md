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
| weekly | Sun 11:30 | Carousel | "Top cities to study in <country>" (rotates USA→UK→Canada→Australia→Germany) |

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
**Universities:** ✅ college spotlight · ✅ Top-Cities carousels (5 countries) · ⬜ top unis by country · ⬜ no-GRE / Duolingo-accepted / low-IELTS lists · ⬜ best colleges by field
**Exam prep:** ✅ exam guide/spotlight · ✅ exam fees · ✅ vocab · ✅ per-exam tips · ✅ exam comparisons (IELTS vs PTE) · ⬜ band-score guides · ⬜ writing-task templates
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
