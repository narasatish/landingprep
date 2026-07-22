# GEO Delivery Playbook — How to Get a Brand Cited by AI (2026)

> This is the **delivery methodology** we run for every client. Sourced from 70+ current
> (2026) references + the Princeton/KDD GEO study. Store and update as platforms change.

---

## 1. Citation factors — what actually makes an LLM cite a brand

Ranked by impact (higher = more leverage):

| Factor | Impact | Notes |
|--------|--------|-------|
| Semantic completeness | 4.2x higher citation likelihood | Content scoring 8.5+ on completeness gets selected far more |
| Multimodal content (text+image+video) | 92% correlation to AI selection | Highest single correlation |
| Structured data (JSON-LD schema) | 3.2x citation increase | 65% of AI-cited pages use schema |
| Content freshness | 82% cite rate (<30 days) vs 37% (old) | Perplexity penalizes staleness hardest |
| Authority & E-E-A-T | Mandatory (all topics now) | Named author + bio + date required |
| URL accessibility / crawlability | Critical | Can't cite what it can't crawl |
| Entity authority (brand recognition) | 3-factor verification gate | AI cross-checks brand across the web before citing |

**Content elements that lift citability 25-40%:**
- Statistics & data: +37% · Expert quotations: +30% · Authoritative source citations: +40%
- Technical terminology: +28% · Direct answers in first 40-60 words · Recent publication date

**Entity authority audit (must be consistent everywhere):**
- [ ] Brand name spelled identically across site, Google Business Profile, socials, Wikipedia
- [ ] Business category consistent everywhere
- [ ] Founder/leadership info matches across platforms
- [ ] Company description uses identical terminology
- [ ] Homepage schema matches GBP description

---

## 2. On-site tactics

### A. JSON-LD schema (highest technical leverage — 3.2x)
Implement per page type: `Article`, `FAQPage` (+28% citation), `Course` (`isAccessibleForFree:true`),
`Organization` (homepage), `BreadcrumbList`, `NewsArticle`. Effects take 2-4 weeks to appear.

### B. Content structure for citation
| Format | Citation performance |
|--------|---------------------|
| Listicles | #1 cited format — 22% of all AI citations |
| Q&A / FAQ | +45% vs paragraphs |
| Tables | 2.5x vs prose; 89% higher reference rate |
| Lists with context | +34% vs bare bullets |
| Direct answers (40-60 words up top) | High extraction probability |

Checklist: lead with direct answers · semantic H1→H2→H3 · FAQ sections + schema · convert data
to tables · listicles for comparisons · stats with sources · multimodal (images+video) · named
expert quotes.

### C. Crawlability for AI bots (robots.txt)
Allow **search** bots (cite with attribution): `OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`,
`Google-Extended`. Optionally block **training** crawlers: `GPTBot`, `CCBot`, `anthropic-ai`,
`Bytespider`. Also: no `noindex` on key pages, Core Web Vitals passing, mobile-indexable.

### D. llms.txt — reality check
**Neutral. Does NOT measurably improve AI visibility** (SE Ranking 300k-domain study + others
found no correlation; major bots skip it and crawl HTML). Don't sell it as a needle-mover.
Ship it if trivial, but invest effort in content quality instead.

---

## 3. Off-site tactics — earned authority

**Where AI looks first (citation source share):**
| Source | ChatGPT | Perplexity |
|--------|---------|-----------|
| Wikipedia | 47.9% | lower |
| Reddit | ~9% | 46.7% |
| YouTube | high | growing |
| G2 / review sites | product recs | growing |
| Quora / Stack Overflow | Q&A | high |

Only ~11% of ChatGPT-cited domains overlap Perplexity's → **multi-platform strategy required.**

**Earned-media playbook (median +239% citation lift):**
- Original research / proprietary data (only ~15% of marketers do this — big edge)
- Press in AI-sourced publications · Wikipedia mentions · authentic Reddit/Quora participation
- YouTube educational content · G2/Capterra reviews · industry news bylines · LinkedIn thought leadership

**Flywheel:** original data → distribute (press/Reddit/YouTube) → AI cites those platforms →
entity authority rises → future content cited more easily.

---

## 4. Measurement — how we prove ROI to clients

**Core metrics:**
| Metric | Definition | Competitive benchmark |
|--------|-----------|----------------------|
| Citation Rate | % of tested prompts where brand appears | 15-25% |
| AI Share of Voice | your citations vs competitors' | 20-35% |
| Brand Mention Rate | % prompts mentioning brand | awareness proxy |
| Citation Velocity | MoM citation growth | 5-15% MoM |
| Platform Diversity | # of AI platforms citing you | 3+ = strong |

**Method (30-day):** define 50-100 buyer-intent prompts (include competitor names) → baseline
across ChatGPT/Perplexity/Gemini/Google AI Mode → monthly re-run → tie to GA4 traffic from AI
sources. Cited pages earn ~+35% organic CTR; AI-referred traffic converts far higher than organic
(reported 15.9% ChatGPT / 10.5% Perplexity vs 1.76% Google organic).

**Tracking tools:** Otterly.ai (simple), Averi.ai, SE Ranking (SMB-friendly), Semrush/Ahrefs AI
modules (enterprise), Stackmatix. **Our engine will do this in-house** (query + detect + score)
so we don't pay per-client tool fees.

---

## 5. Platform differences (tune per platform)

- **ChatGPT** — ~10.4 citations/response; loves Wikipedia (47.9%) + editorial press; needs browsing on. Optimize: Wikipedia mentions, major-press coverage, strong E-E-A-T.
- **Perplexity** — ~21.9 citations/response; loves Reddit (46.7%); brutal on staleness (82% <30d). Optimize: monthly freshness, "2026" signals, Reddit presence, Q&A format.
- **Google AI Overviews** — only 38% of citations from top-10 organic (down from 76%); 92% multimodal correlation; schema on 65% of cited pages; E-E-A-T mandatory. Optimize: schema, video, semantic completeness. Ranking #1 ≠ cited.
- **Gemini** — like AIO; strong YouTube + interactive-tool preference.
- **Copilot** — Bing index + LinkedIn; B2B lean. Optimize: Bing indexation, LinkedIn presence.

---

## 6. Myths (do NOT sell these)
- "Need llms.txt" — neutral, no lift · "Keyword density matters" — no · "Separate AI content" —
no, write once well · "More backlinks = more citations" — quality >> quantity · "Schema guarantees
citations" — helps, not a trigger · "Manufactured mentions help" — backfires, AI detects fakes ·
"One strategy fits all engines" — no · "GEO replaces SEO" — GEO sits ON TOP of SEO · "Cite once,
done" — citations are volatile, need monthly monitoring.

---

## 7. 90-day delivery template (per client)
- **Wk 1-2:** audit AI visibility (20 prompts) + baseline + entity-consistency audit + crawl/E-E-A-T audit; pick 2-3 target platforms.
- **Wk 3-4:** JSON-LD schema on key pages · reformat top-10 pages (tables/Q&A/lists) · E-E-A-T signals · robots.txt · freshness.
- **Wk 5-6:** start original-research asset · 2-3 press pitches · Reddit/Quora presence · Wikipedia audit · LinkedIn posts · YouTube plan.
- **Wk 7-8:** citation tracking live (50-100 prompts) · baseline all platforms · GA4 AI-source tracking.
- **Wk 9-12:** publish research + distribute · 5-10 FAQ-schema pages · YouTube videos · high-authority guest posts · active Reddit.
- **Month 4+:** monthly tracking · double down on winners · refresh content every 30 days.

_Full source list (71 URLs) retained in research notes; key refs: digitalapplied.com, aithinkerlab.com,
frase.io, otterly.ai, stackmatix.com, almcorp.com (top-10 citation drop 76%→38%), cmswire.com (Reddit)._
