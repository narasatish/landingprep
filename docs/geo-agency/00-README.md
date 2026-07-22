# GEO Agency — Research & Build Dossier

Research compiled July 2026 for a GEO (Generative Engine Optimization) agency targeting
**study-abroad / edtech / coaching businesses in India**. This folder is the permanent asset we
build the business from.

## Files
1. [`01-competitors-and-tools.md`](01-competitors-and-tools.md) — competitor landscape, GEO tools, pricing benchmarks
2. [`02-methodology-playbook.md`](02-methodology-playbook.md) — how to actually get a brand cited in AI (delivery playbook)
3. [`03-outbound-automation-stack.md`](03-outbound-automation-stack.md) — outreach tool stack, costs, ban/legal risk
4. [`04-inbound-seo-keywords.md`](04-inbound-seo-keywords.md) — get found on Google + cited in AI (keywords, content, directories)

---

## Executive summary — the 6 decisions the research forces

**1. Don't sell "GEO." Sell "AI visibility for study-abroad/edtech in India."**
The GEO category is already maturing (Profound at ~$1B valuation; India agencies — upGrowth, Nico
Digital, PageTraffic — already ranking). Generic first-mover advantage is gone. Our defensible edge =
**niche + automation + live proof**, not "we do GEO."

**2. The product is a SERVICE, not a tool.** Tracking tools start at $29/mo (Otterly) and are
commoditizing. We build a lightweight in-house tracking engine (our stack already has a Gemini proxy)
and sell strategy + delivery. Never compete as a tool.

**3. Pricing:** India retainers land ₹90K-₹1.6L/mo (Starter ₹55-80K). Sell a paid audit (₹5-15K,
credited to month 1) as the entry point. We're ~40-60% below US pricing with AI keeping costs low.

**4. Delivery is 80% automatable; getting clients is not.** The methodology (audit → schema →
citable content → off-site authority → monthly tracking) is a repeatable, AI-runnable pipeline.
Sales is the human bottleneck — accepted.

**5. Outbound automation reality check (important):**
- **AI SDR tools are over-hyped** — they automate research + copy, NOT outcomes. Clay + Smartlead
  (~$180-280/mo) beats $1,500+/mo tools like 11x/Artisan.
- **LinkedIn automation is high-risk in 2026** — HeyReach was permanently banned March 2026;
  ~40% of accounts on cloud tools suspended Q1. Use **manual + VA + Sales Navigator**, not bots.
- **Deliverability is the real game** — all platforms over-claim; real inbox placement 30-75%.
  List quality drives 80% of results, tool choice ~15-20%.
- **Legal:** India DPDP Act (conservative consent + unsubscribe + 90-day retention), GDPR (never
  cold-email EU consumers), CAN-SPAM ($53k/email — but tools handle basics). B2B is a gray area; be conservative.

**6. Inbound is the durable channel.** Free audit tool + flagship content ("GEO Buyer's Guide",
"State of AI Search: EdTech Report", platform how-tos) + directories (Clutch/G2/SuperbCompanies) +
being cited in AI ourselves. Realistic first inbound client: **8-16 weeks**, ~$3-8K MRR.

---

## Proposed automated system (maps to our existing stack)

| Module | What it does | Built on |
|--------|-------------|----------|
| **① GEO Audit Engine** | prompt bank per niche → query Gemini/Perplexity/ChatGPT → detect mention/citation → score 0-100 vs competitors | existing Gemini proxy in `server.js` |
| **② Lead Pipeline** | free-audit form → Firestore → email notify → drip nurture | existing Firestore + nodemailer |
| **③ Report Generator** | audit data → branded web/PDF report | existing static-HTML generation |
| **④ Monitoring Cron** | weekly re-run client prompts → visibility trend → alerts | new scheduled job |
| **⑤ Content Engine** | per client: citable FAQ content + JSON-LD schema + robots.txt for AI bots | existing SEO scripts + Gemini |
| **⑥ Outbound Assist** (human-in-loop) | build lead lists + draft personalized email/LinkedIn copy; human sends | Clay/Lusha + Smartlead + manual LinkedIn |

~70% reuses infrastructure LandingPrep already has.

## Build phases
- **Phase 1 (MVP):** GEO Audit Engine + free audit landing page + lead capture.
- **Phase 2:** Report generator + pricing page + booking + sample audits of our own sites.
- **Phase 3:** Monitoring cron + content engine + client portal (retainer delivery).
- **Outbound track (parallel, human-in-loop):** lead lists + AI-drafted copy; manual/VA send.

## Open decisions (need the owner)
- Business name + domain
- Confirm niche = study-abroad/edtech (recommended)
- Approve pricing tiers
- Commit to sales time (the human bottleneck)
