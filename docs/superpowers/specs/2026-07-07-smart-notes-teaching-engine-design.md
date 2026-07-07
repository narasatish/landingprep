# Smart Notes — Memory-First Teaching Engine (Design)

Date: 2026-07-07 · Status: approved (design sections 1–6). Scope confirmed with owner:
Approach A (Smart Notes) first; roll out across **all exams** in phases. Engagement/
gamification + parent dashboard (B) and AI tutor (C) are explicitly out of scope here
(Phase 2/3).

## Goal
Replace "traditional" wall-of-text lessons with a reusable, evidence-based lesson
format that makes exam-prep content **easy to learn and hard to forget**, and that
doubles as substantive SEO content. Built on LandingPrep's existing Learn hub +
SM-2 spaced-repetition flashcards (no new memory engine).

## Evidence base (why this shape)
Research synthesis (2026) ranks the highest-leverage, best-evidenced techniques as:
spaced retrieval + active recall (testing effect), dual coding (visual + verbal),
worked/real examples + elaboration, chunking, interleaving, and concrete examples.
Format trends that help without gimmickry: microlearning (5–8 min, mobile-first),
visual mapping, and *genuine* streaks. Avoid: leaderboards, fake XP/badges, rah-rah
notifications. The engine below operationalizes the trifecta (spaced retrieval +
worked examples + dual coding).

## Non-goals (YAGNI)
- Streaks / gamification / XP (Phase 2).
- Parent dashboard (Phase 2).
- AI tutor mode (Phase 3).
- Authoring every topic for every exam in this first build — the engine ships with a
  proven pilot batch; content scales in verified phases.

## 1. Content unit — one Smart Note = one topic
A JSON file per topic: `content/smart-notes/<exam>/<slug>.json`. Schema:
```
{
  "id": "ielts-writing-task2-structure",
  "exam": "ielts", "section": "writing", "title": "IELTS Writing Task 2: Essay Structure",
  "estMinutes": 7,
  "summary": "one-sentence what-you'll-learn",
  "conceptMap": {                     // drives the visual (§2)
    "central": "Task 2 essay",
    "nodes": [ { "label": "Introduction", "note": "paraphrase + thesis" },
               { "label": "Body 1", "note": "one idea + example" }, ... 4–7 total ]
  },
  "chunks": [                         // 3–5 learning chunks
    { "heading": "...", "body": "concise markdown (bold, links)",
      "realExample": "a real-world / exam-style example",
      "memoryHook": "a mnemonic or analogy" }, ...
  ],
  "recall": [                         // 5 active-recall Q&A → flashcards
    { "q": "...", "a": "..." }, ...
  ],
  "sources": [ "https://official..." ]  // where facts need citing
}
```
Authoring rule: 100% accurate (verify any factual claims against official sources,
per project mandate); original examples; concise chunks (no walls of text).

## 2. Renderer — `SmartNote` React component
One component (new screen module, added to the bundle MANIFEST + lazy-loadable).
Renders top→bottom:
1. **Visual concept map** — a lightweight, self-contained **SVG hub-and-spoke**
   generated from `conceptMap` (central node + radial nodes with short notes). No
   third-party mind-map library (keeps the CDN-React/no-build setup + mobile perf
   intact). Dark-mode aware via CSS vars.
2. **Chunked notes** — each chunk as a card: heading, body, a highlighted
   **"Real example"** callout, and a **"Memory hook"** callout (distinct styling so
   the brain tags them).
3. **Active-recall quiz** — the `recall` Q&A shown one at a time (reveal-then-self-rate),
   mirroring the existing Flashcards UX.
Microlearning length; mobile-first; matches existing design tokens (pro.css).

## 3. Memory integration (reuse SM-2)
Completing the recall quiz calls the existing spaced-repetition store (the SM-2
"lite" flashcard system in `screens/learning-club.jsx`) to enqueue those Q&A as
scheduled flashcards under a per-exam deck. No new algorithm — extend the current
one with a small `addCards(deckId, cards)` entry point. Review then happens through
the existing Flashcards surface. localStorage-backed as today.

## 4. SEO synergy
`generate-seo-pages.mjs` emits each Smart Note as a prerendered page at
`/learn/<exam>/<slug>/` (path confirmed free at generation time) with the notes content,
concept-map SVG, Article + FAQ (from `recall`) + Breadcrumb JSON-LD, canonical,
and internal links to the exam's mock test + related notes. These are substantive,
original, genuinely useful pages (the *good* kind of content) — added to the sitemap.
The in-app `SmartNote` component and the prerendered page render from the SAME JSON.

## 5. Rollout plan (all exams, phased)
- **Phase 0 (this build):** engine (schema + `SmartNote` component + SM-2 hook + SEO
  emit + validator) **plus a pilot batch of ~6 core IELTS topics**, authored and
  verified end-to-end, deployed and validated live.
- **Phase 1+:** author verified batches per exam (TOEFL, PTE, GRE, GMAT, …) using the
  same parallel-agent + strict-validator + QA workflow proven on the TOEFL reading
  rewrite. Each batch: fact-checked, schema-validated, tested, QA'd, deployed.
- A `tools/validate-smart-notes.mjs` gate (schema, required fields, concept-map node
  count 4–7, exactly 5 recall Q&A, no template boilerplate) enforces quality at scale.

## 6. Wiring & entry points
- Add "Smart Notes" into the existing **Learn hub** (`screens/learn-hub.jsx`) as a
  segment alongside Prep Lessons / Learning Club.
- Link from each exam's guide + mock-test pages to its Smart Notes.
- Register routes/paths in the SEO generator (sitemap, prerender) + App PAGE_SEO per
  the project's SEO rule.

## Error handling
- Missing/invalid Smart Note JSON → skipped in generation with a warning (never breaks
  the build); validator catches it in `npm test`.
- Concept map with <3 or >7 nodes → validator error.
- SM-2 `addCards` de-dupes by card id so re-taking a quiz doesn't duplicate cards.

## Testing
- `tools/validate-smart-notes.mjs` (schema/quality) wired into `npm test`.
- Playwright smoke: one Smart Note route renders (concept map + chunks + quiz), no crash.
- In-browser check: finishing a quiz enqueues flashcards (localStorage) and they appear
  in the Flashcards surface.
- Fact accuracy of the pilot batch verified against official/authoritative sources.

## Success criteria
- A learner can open a topic, see a one-glance visual map, read 3–5 chunked notes with
  a real example + memory hook each, take a 5-question recall quiz, and have those
  auto-scheduled for spaced review — in ≤8 minutes, on mobile.
- Each Smart Note is a live, indexed, substantive page.
- The format is proven on the IELTS pilot batch, with a repeatable, validated pipeline
  to extend to all exams.
