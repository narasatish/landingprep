# Test content bank

This directory holds the lazy-loaded test bank. Tests are added by the generator
(`tools/generate-tests.js`) and surfaced to the app via `test-catalog.jsx`.

## How tests are organised

```
content/
  manifest.json              # tiny index of all tests (loaded at app boot)
  .fingerprints.json         # uniqueness ledger (questions + passages)
  ielts/listening/test-001.json
  ielts/listening/test-002.json
  ...
  gmat/quant/test-001.json
  ...
```

Each test file is a self-contained JSON document with `parts[]` containing
passages/scripts and questions. The manifest holds metadata only (id, title,
difficulty, question count, duration, file path) — typically 50–80 KB even for
hundreds of tests, so the boot payload stays small.

## How to fill the 30-tests-per-section bank

The generator script is at `tools/generate-tests.js`. It authors **original**
practice tests via the Gemini API following documented exam patterns (the
factual structure: timings, instruction format, question types). It does NOT
ingest copyrighted source material.

### One-time setup

```bash
# Windows PowerShell
$env:GEMINI_API_KEY = "AIzaSy..."   # from https://aistudio.google.com/apikey

# Linux/macOS
export GEMINI_API_KEY="AIzaSy..."
```

### Generate

```bash
node tools/generate-tests.js --exam ielts --section listening --count 30
node tools/generate-tests.js --exam ielts --section reading   --count 30
node tools/generate-tests.js --exam ielts --section writing   --count 30
node tools/generate-tests.js --exam ielts --section speaking  --count 30
node tools/generate-tests.js --exam toefl --section reading   --count 30
# ...and so on for each exam × section
```

The script:
1. Reads existing manifest entries to pick the next test number
2. Calls Gemini with a prompt describing the *pattern* (not the content) for that exam/section
3. Validates every generated question against `.fingerprints.json`:
   - Exact fingerprint match → reject as duplicate
   - Jaccard similarity ≥ 0.85 to any existing question → reject as near-duplicate
4. Retries up to 3 times per test if uniqueness fails
5. Writes `test-NNN.json`, updates `manifest.json`, updates `.fingerprints.json`
6. Throttles requests (~1.2s gap) to stay inside free-tier rate limits

Expected throughput on the free tier: ~30 tests per exam-section per hour.

### Total bank capacity

Target volume:

| Exam | Sections | Tests/section | Total tests |
|---|---|---|---|
| IELTS | 4 | 30 | 120 |
| TOEFL | 4 | 30 | 120 |
| PTE | 3 | 30 | 90 |
| CELPIP | 4 | 30 | 120 |
| Duolingo | 4 | 30 | 120 |
| GRE | 3 | 30 | 90 |
| GMAT | 3 | 30 | 90 |
| **Total** | — | — | **750 section tests** |

Plus 30 full mocks per exam → **210 full mocks** → **960 total tests** in the bank.

At ~30 KB per test JSON, the entire on-disk bank is ~30 MB and the manifest is
~150 KB. The browser only ever loads the manifest plus the single test the user
opens.

## Adding a "Full Mock" generator

The current script generates per-section tests. Full mocks bundle one test from
each section. Two ways to assemble them:

1. **Composition** — write `tools/compose-mocks.js` that selects 1 random unused
   test from each section's bank and stitches them into a fullMock entry. No new
   content authoring needed. Fastest path once section banks are populated.
2. **End-to-end generation** — extend `generate-tests.js` with a `--full` mode
   that authors a 4-section mock in one call. Slower per test, but produces
   thematically coherent mocks.

Option 1 is recommended once section banks have ~15+ tests each.

## Pattern reference

`tools/generate-tests.js` exports the `PATTERNS` object — the canonical record
of every exam's section format (durations, question types, question counts,
voice / context briefs). Update it there and re-run the generator if any board
changes their official format.

## Uniqueness ledger

`.fingerprints.json` holds:

```json
{
  "questions": [{ "fp": "8z3kqp", "text": "..." }, ...],
  "passages":  ["7q1bnm_2421", ...]
}
```

Do **not** delete this file unless you intentionally want to allow duplicates
(e.g. starting a fresh bank from scratch). It's the only mechanism preventing
the generator from re-authoring near-identical content over time.

## Browser API

Loaded automatically via `test-catalog.jsx`. Available as `window.LP_CATALOG`:

```js
// List all tests for an exam/section (metadata only)
await LP_CATALOG.listTests("ielts", "listening")
// → [{ id, title, difficulty, questionCount, duration, version }, ...]

// Open a specific test (loads questions)
await LP_CATALOG.loadTest(entry)
// → full test JSON with parts[] and questions[]

// Counts across the bank (for SEO pages, dashboards)
await LP_CATALOG.getCounts()
// → { ielts: { listening: 30, reading: 30, ..., total: 120 }, ... }
```

## Legal posture

The generator's prompt explicitly instructs the LLM to **author original
content** and **not** reproduce or paraphrase content from Cambridge, ETS,
GMAC, Pearson, Paragon, or other publishers. The patterns it follows
(timings, instruction wording, question-type structure) are facts about how
each exam is administered and are not subject to copyright.

If you commission human authors instead of (or in addition to) Gemini, the
same test JSON schema applies — they can write directly into the test files
and the manifest/fingerprint system will deduplicate their work too.

## What is *not* in this bank (and shouldn't be)

- Verbatim or substituted passages, scripts, or questions from the official
  publishers' PDFs, books, or websites.
- Content scraped from competitor prep sites without their permission.

Those routes invite takedown notices and lawsuits. The generator + fingerprint
approach above is the standard way prep platforms scale content without
licensing fees.
