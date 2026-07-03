# TOEFL Multi-Stage Adaptive Mock Engine — Design

Date: 2026-07-03 · Status: approved direction (user picked tasks 1–3 from handoff);
"replace fixed-form" chosen by Claude as the recommended default when the user was
away — easy to reverse by re-adding a fixed-form entry.

## Goal
Make the full TOEFL iBT mock behave like the real January-2026 test: Reading and
Listening are multi-stage adaptive (MST) — stage 1 performance routes the user to an
easier or harder stage 2. Speaking and Writing stay fixed (real test is not adaptive
there). Section-practice mode stays fixed-form.

## Non-goals
- Item-level CAT (question-by-question adaptivity) — the real TOEFL is stage-level.
- Adaptive Speaking/Writing.
- New question content — we reuse the existing banks (30 reading tests × 2 passages,
  30 listening tests) with difficulty tags added.

## Components

### 1. Difficulty tagger — `tools/tag-toefl-difficulty.mjs` (one-time, re-runnable)
Rates each reading passage and listening excerpt `easy | medium | hard` and writes a
`difficulty` field into the content JSON files (regenerating the static artifacts —
the engine reads the tag at runtime).

Heuristic score per passage/excerpt (deterministic):
- Mean sentence length and mean word length of the passage/script text.
- Rare-word ratio: share of tokens not in a built-in ~2,000-word common-English list.
- Question-type weight: inference / insert_text / prose_summary / rhetorical_purpose
  count as harder than factual_information / vocabulary / reference.
The combined z-scored total is bucketed by terciles across the whole bank, so each
difficulty tier is guaranteed to be non-empty (~⅓ of the bank each).

### 2. Adaptive engine — `screens/mock-test.jsx` (TOEFL `full` mocks only)
Build-time (when sections are assembled):
- Reading: stage 1 = one **medium** passage (10 Q). The section carries a
  `stage2Pool = {easy: [...], medium: [...], hard: [...]}` of candidate passages.
- Listening: stage 1 = two **medium** parts (~14 Q); `stage2Pool` of part-pairs.

Run-time routing (when the user moves past the last stage-1 question):
- correct% ≥ 70 → hard stage 2; ≤ 35 → easy; otherwise medium.
- The chosen stage-2 content is spliced into the section, and a brief interstitial
  notice is shown: "Stage 2 loaded — difficulty adjusted to your Stage-1 performance,
  just like the real TOEFL."
- Routing is by graded answers only (MCQ correct/incorrect); unanswered = incorrect.

### 3. Path-aware scoring (0–30 per section)
raw% is computed over all answered questions as today, then adjusted by path:
- hard path: score = round(12 + raw% × 18)  → floor 12, ceiling 30
- medium path: score = round(6 + raw% × 21) → ceiling 27
- easy path: score = round(raw% × 20)       → ceiling 20
The score report names the routed path ("Routed to: Hard stage 2"). Overall 0–120 and
the indicative 1–6 band (2026 dual reporting) are unchanged.

### 4. UX changes
- Remove the "our mock is fixed-form" disclaimer; replace with "This mock is
  multi-stage adaptive, matching the 2026 TOEFL iBT."
- Stage-transition notice as above. No other UI changes.

## Error handling
- If a difficulty tier has no candidates at runtime (stale content), fall back to any
  untagged/medium passage — the mock must never fail to build.
- Tagger validates JSON round-trip and refuses to write on parse errors.

## Testing
- Tagger: run on the real bank; assert every passage/excerpt gets a tag and each tier
  is non-empty; spot-check a sample by hand.
- Engine: exam-validation + hooks gate + `npm test` (Playwright smoke). Manual check
  of both routing branches by simulating high/low stage-1 scores.
