# TOEFL iBT 2026 Migration (Design)

Date: 2026-07-08 · Status: approved (design). Owner sign-off received on the design;
spec review pending.

## Context
TOEFL iBT was redesigned effective **21 January 2026**: a shorter (~under 2 hours),
**adaptive** test scored on a new **1–6 band scale** (half-points, CEFR-aligned), with a
comparable **0–120** overall shown only during a **two-year transition**. Reading and
Listening are **two-stage adaptive**; Writing and Speaking are **linear**. Task types are
new (see §Facts). LandingPrep already ships correct 2026 content as **Smart Notes at
`/learn/toefl/`** (6 ETS-verified notes, live). However, older TOEFL content across the
site still describes the **pre-2026** test as if current. A prior session also
**partially** migrated the mock engine (mock *wrappers* claim "1–6 / adaptive" while the
underlying section banks remain old-format), creating an internal inconsistency.

This migration makes every **current-facing** TOEFL claim accurate, honestly, **without
breaking the working mock** and **without changing transition-valid requirement mentions**.

## Goal
Uniform, accurate 2026-format TOEFL story across the guide, the relevant blog posts, and
the mock-test surface — with the existing mock explicitly labelled as legacy 0–120
practice rather than silently presented as current.

## ETS-verified facts (the source of truth for all edits)
- Effective **21 January 2026**; total test **under 2 hours**.
- **Scoring:** new **1–6 band scale** in half-point increments, CEFR-aligned; **overall =
  average of the four sections, rounded to the nearest half band**; a comparable **0–120**
  overall is also shown for a **two-year transition**. ETS publishes **no** fixed
  CEFR-to-band table — do **not** invent one.
- **Reading** (~50 items, ~30 min) and **Listening** (~47 items, ~29 min) are **two-stage
  adaptive**. **Writing** (~12 items, ~23 min) and **Speaking** (~11 items, ~8 min) are
  **linear**.
- **Task types:** Reading — *Complete the Words, Read in Daily Life, Read an Academic
  Passage*; Listening — *Listen and Choose a Response, Listen to a Conversation, Listen to
  an Announcement, Listen to an Academic Talk*; Writing — *Build a Sentence, Write an
  Email, Write for an Academic Discussion*; Speaking — *Listen and Repeat, Take an
  Interview*.
- Sources: ets.org content pages (overall + per-section), understand-scores, and the
  Jan-2026 updates page. Every factual edit must cite these.

## Scope — three work items

### 1. Exam guide facts — `data/new-exam-guides.json` (TOEFL entry)
This file feeds `screens/guide.jsx`, the descriptive "about the exam" guide (NOT the mock
engine). Rewrite the TOEFL entry to the 2026 facts:
- `scoring` → the 1–6 band scale (note the 0–120 transitional comparable).
- Section list → adaptive Reading/Listening + linear Writing/Speaking, with the correct
  item counts / section times from §Facts (section-level only — do **not** assert
  per-task minutes ETS does not publish).
- Task/`types` arrays → the real 2026 task names per section.
- `tips` → keep practical, aligned to the new tasks.
Locate the TOEFL entry by key (it exists in this file; audit line numbers were
unreliable — find it, don't trust a line number).

### 2. Blog corrections — `blog-data.jsx`
Correct only posts/sections that describe the **old structure or scale as current**:
- The "How to Score TOEFL 100+" post and any "how the 0–120 score is calculated" section:
  add a clear 2026-format update (new 1–6 scale + adaptive + new tasks), and frame the
  0–120 material as the transitional/legacy scale — do not delete useful transitional
  info. `expires`-tag if it reads as time-bound.
- The two study-plan target lines (e.g. "72–79 (TOEFL)", "90+ (TOEFL)") → annotate that
  TOEFL now scores 1–6 with a transitional 0–120, and advise checking the target
  university's stated requirement.
**Leave untouched:** the ~30 "TOEFL 80+/90+/100+" university-**requirement** and
concordance mentions — these remain valid during the 0–120 transition, and mass-editing
them would reduce accuracy.

### 3. Legacy-mock banner — `screens/mock-test.jsx`
When the active exam is TOEFL, render an honest notice above the mock (reuse existing
callout/notice styling; theme-safe, dark-mode-safe):
> "This practice reflects the **pre-2026 TOEFL** (0–120 scale). The test changed in
> January 2026 — see our new **TOEFL 2026 Smart Notes** (`/learn/toefl/`)."
The mock keeps working. Condition strictly on `exam === 'toefl'` so other exams are
unaffected.

## Deliberately out of scope (with rationale)
- **`content/exam-patterns.json`, the ~150 mock banks, and mock scoring logic** — left
  as-is. The mock is now explicitly labelled *legacy 0–120 practice*, so this data is
  **consistent** with what the banner discloses. Rewriting it is the separate, larger
  "regenerate to new task types" project (needs engine work for tasks like Listen-and-
  Repeat / Take-an-Interview) and is **deferred**.
- **Transition-valid requirement/concordance mentions** — kept (accurate for 2 years).
- Resolving the pre-existing mock-wrapper inconsistency (wrappers claim adaptive/1–6) —
  folded into the deferred regenerate project, not this migration. If any wrapper text is
  *user-visible* and actively misleading, the banner covers the disclosure.

## Components & data flow
- `data/new-exam-guides.json` → `screens/guide.jsx` (descriptive display). Decoupled from
  the mock engine.
- `blog-data.jsx` → blog rendering + prerendered blog pages via the SEO generator.
- `screens/mock-test.jsx` → conditional banner (additive markup; no engine coupling).

## Error handling
- Banner is additive markup with a static link — no logic/render risk; guard on
  `exam === 'toefl'`.
- Content edits validated by `npm run build` (precompile + bundle) and the SEO audit
  (`AUDIT PASSED`, 0 broken links). The `/learn/toefl/` link target already exists.

## Testing
- `npm run build` succeeds; SEO audit passes; 26-route Playwright smoke stays green
  (the `/mock-test/ielts/` route and app boot are already covered; TOEFL mock renders via
  the same component).
- Haiku **fact-check** of the rewritten guide entry + blog edits against the §Facts list
  (no fabricated per-task times, no invented CEFR table).
- Haiku **QA** on the `screens/mock-test.jsx` diff (JSX balance, correct conditional, dark-
  mode-safe classes).
- Deploy-gated: push to `main` only on explicit owner go-ahead; bump `CACHE_VERSION`.

## Success criteria
- The guide, the targeted blog posts, the mock surface, and the Smart Notes all present
  the **2026 format** as current; nothing describes the pre-2026 test as current.
- The TOEFL mock still runs and is **honestly labelled** as legacy 0–120 practice, with a
  path to the correct new content.
- No transition-valid requirement content was removed; no engine/banks were destabilised.
- Build green, SEO audit clean, facts ETS-verified.
