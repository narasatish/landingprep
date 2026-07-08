# TOEFL 2026 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every current-facing TOEFL claim accurate to the Jan-2026 format — fix the guide's stale structure/task fields, flag the two old-format blog areas, and honestly label the legacy mock — without destabilising the mock engine, the ~150 banks, or transition-valid 0–120 requirement content.

**Architecture:** Three independent, additive content/UI edits. (1) `data.jsx` TOEFL entry — replace only `pattern` + `sections_detail` (the fields still describing old tasks); leave `blurb`/`duration`/`score` (already 2026) and `scoreGuide` (transition-valid 0–120). (2) `blog-data.jsx` — add a 2026-update note to the "How to Score TOEFL 100+" post and reframe the "0–120 breakdown" section + two study-plan lines. (3) `screens/mock-test.jsx` — add a legacy-format banner shown only when `exam.id === 'toefl'`. No engine data (`content/exam-patterns.json`), no banks, no scoring logic touched.

**Tech Stack:** React 18 via CDN (JSX compiled by `precompile-jsx.mjs`), Node ESM build (`npm run build`), SEO generator + audit, Playwright smoke, git.

---

## Conventions (read once)
- Build: `npm run build` (check-hooks → assets → precompile-jsx → make-bundle → bump-version → generate-seo-pages → audit). Always build before commit.
- Test: `npm test` (validators, exam-validation, SEO audit, IG tests, smart-notes validator, freshness/expiring, 26-route Playwright smoke).
- ETS-verified facts (do NOT deviate; do NOT invent per-task minutes or a CEFR↔band table):
  - Under ~2 hours; **1–6 band** (half-points, CEFR-aligned); overall = average of 4 sections rounded to nearest half; comparable **0–120** shown for a 2-year transition.
  - Reading (~50 items, ~30 min) & Listening (~47 items, ~29 min) = **two-stage adaptive**. Writing (~12 items, ~23 min) & Speaking (~11 items, ~8 min) = **linear**.
  - Tasks — Reading: Complete the Words / Read in Daily Life / Read an Academic Passage. Listening: Listen and Choose a Response / Listen to a Conversation / Listen to an Announcement / Listen to an Academic Talk. Writing: Build a Sentence / Write an Email / Write for an Academic Discussion. Speaking: Listen and Repeat / Take an Interview.
- Commit messages: NO Co-Authored-By trailer. On OneDrive git slowness/index.lock: `rm -f .git/index.lock`, commit via a background shell.

---

## Task 1: Fix the TOEFL guide's structure/task fields (`data.jsx`)

**Files:**
- Modify: `data.jsx` (TOEFL entry `pattern` ≈ lines 192–208 and `sections_detail` ≈ lines 210–266)

**Do NOT change** in this entry: `blurb`, `duration`, `score` (already 2026-correct) or `scoreGuide` (a transition-valid 0–120 reference we deliberately keep).

- [ ] **Step 1: Read the current TOEFL entry** to confirm exact strings.
Run: open `data.jsx`, find `"id": "toefl"` (~line 170). Confirm the `pattern` and `sections_detail` blocks match the `old_string`s below (whitespace/line-endings are CRLF — match exactly when editing).

- [ ] **Step 2: Replace `pattern`.** Replace this exact block:
```json
      "pattern": [
        [
          "Reading",
          "2 passages · 10 questions each · ~35 min"
        ],
        [
          "Listening",
          "2 lectures + 1 conversation · ~36 min (approx. 28 questions)"
        ],
        [
          "Speaking",
          "4 tasks (1 independent + 3 integrated) · ~16 min"
        ],
        [
          "Writing",
          "Integrated task (read-listen-write) + Academic Discussion task · ~29 min"
        ]
      ],
```
with:
```json
      "pattern": [
        [
          "Reading",
          "Two-stage adaptive · Complete the Words, Read in Daily Life, Read an Academic Passage · ~50 items · ~30 min"
        ],
        [
          "Listening",
          "Two-stage adaptive · Choose a Response, Conversation, Announcement, Academic Talk · ~47 items · ~29 min"
        ],
        [
          "Speaking",
          "Listen and Repeat + Take an Interview · ~11 items · ~8 min"
        ],
        [
          "Writing",
          "Build a Sentence, Write an Email, Write for an Academic Discussion · ~12 items · ~23 min"
        ]
      ],
```

- [ ] **Step 3: Replace `sections_detail`.** Replace this exact block:
```json
      "sections_detail": [
        {
          "name": "Reading",
          "icon": "📖",
          "time": 35,
          "questions": 20,
          "types": [
            "Factual information",
            "Negative factual information",
            "Inference",
            "Rhetorical purpose",
            "Vocabulary in context",
            "Reference",
            "Sentence simplification",
            "Insert text",
            "Prose summary"
          ],
          "tips": "Read actively — mark supporting details. The 'summary' question at the end is worth 2 points; check all 6 options carefully."
        },
        {
          "name": "Listening",
          "icon": "🎧",
          "time": 36,
          "questions": 28,
          "types": [
            "Main idea/gist",
            "Detail",
            "Function and attitude",
            "Organization",
            "Connecting information"
          ],
          "tips": "Take notes on the Cornell method (main idea left, detail right, summary below). Lectures can cover biology, history, art, economics — anything."
        },
        {
          "name": "Speaking",
          "icon": "🎤",
          "time": 16,
          "questions": 4,
          "types": [
            "Task 1: Independent — your opinion on a topic (45 sec prep, 60 sec response)",
            "Task 2: Campus situation (read + listen + speak)",
            "Task 3: Academic topic (read + listen + speak)",
            "Task 4: Academic lecture (listen + speak)"
          ],
          "tips": "Use 3 seconds of the prep time to breathe and state your point clearly. Integrated tasks reward accuracy over fluency."
        },
        {
          "name": "Writing",
          "icon": "✍️",
          "time": 29,
          "questions": 2,
          "types": [
            "Integrated: summarise lecture points vs reading passage (150–225 words, 20 min)",
            "Academic Discussion: contribute a response to a professor's discussion post (≥100 words, 10 min)"
          ],
          "tips": "Integrated Writing: the lecture will contradict, support or qualify the reading. Academic Discussion: take a clear position and support it with a specific reason."
        }
      ],
```
with:
```json
      "sections_detail": [
        {
          "name": "Reading",
          "icon": "📖",
          "time": 30,
          "questions": 50,
          "types": [
            "Complete the Words — fill missing letters in key words",
            "Read in Daily Life — notices, messages, short informational texts",
            "Read an Academic Passage — a short university-style passage"
          ],
          "tips": "Reading is two-stage adaptive: give the first stage your full focus, as it sets the difficulty of the second. For 'Complete the Words', read the whole sentence — the context gives you the word."
        },
        {
          "name": "Listening",
          "icon": "🎧",
          "time": 29,
          "questions": 47,
          "types": [
            "Listen and Choose a Response — pick the best reply to a prompt",
            "Listen to a Conversation — campus-life dialogue",
            "Listen to an Announcement — academic or campus notice",
            "Listen to an Academic Talk — a short lecture"
          ],
          "tips": "Listening is two-stage adaptive. Take notes of the main idea plus a couple of supporting points; you can't replay the audio."
        },
        {
          "name": "Speaking",
          "icon": "🎤",
          "time": 8,
          "questions": 11,
          "types": [
            "Listen and Repeat — repeat short sentences exactly (pronunciation and intelligibility)",
            "Take an Interview — answer questions about your experiences and opinions"
          ],
          "tips": "Mirror the sentence exactly in Listen and Repeat — words, stress and rhythm. In the interview, speak clearly at a natural pace; clarity beats fancy vocabulary."
        },
        {
          "name": "Writing",
          "icon": "✍️",
          "time": 23,
          "questions": 12,
          "types": [
            "Build a Sentence — rearrange words into a grammatical sentence",
            "Write an Email — an academic or social request/response",
            "Write for an Academic Discussion — post an opinion in an online class discussion"
          ],
          "tips": "For the email: greeting → reason → specific request → thanks. Scoring rewards communicating clearly, not a perfect first draft."
        }
      ],
```

- [ ] **Step 4: Build + audit.** Run `npm run build`. Expected: precompile transpiles `data.jsx` (no JSON/JS error), `AUDIT PASSED`, 0 broken links. If the build fails on a JSON parse error, re-check the replaced block's commas/brackets.

- [ ] **Step 5: Verify the guide is internally consistent.** Run:
```bash
node -e "const d=require('./data.js');const t=(d.EXAMS||d.default&&d.default.EXAMS||[]).find?null:null;" 2>/dev/null; grep -n "Complete the Words" data.js | head -1
```
Expected: the compiled `data.js` contains "Complete the Words" (confirms the edit compiled into the bundle source). Also manually confirm `score` still reads `1–6 bands ... legacy 0–120 dual-reported through 2028` and `scoreGuide` is unchanged.

- [ ] **Step 6: Commit.**
```bash
git add data.jsx data.js
git commit -m "content(toefl-2026): update guide Reading/Listening/Speaking/Writing to the new adaptive task types"
```
(Also stage other build-regenerated artifacts only if the build changed them and they belong with this edit — check `git status` first.)

---

## Task 2: Flag the two old-format blog areas (`blog-data.jsx`)

**Files:**
- Modify: `blog-data.jsx` (the "How to Score TOEFL 100+" post ≈ line 7426; its "TOEFL iBT Breakdown: How the 0-120 Score is Calculated" section ≈ line 21600; two study-plan lines ≈ 260 and 964)

Goal: correct claims that present the OLD test *structure/scale as current*, while KEEPING transition-valid 0–120 requirement/target content. Do not rewrite whole posts.

- [ ] **Step 1: Read the "How to Score TOEFL 100+" post header** (find `"title": "How to Score TOEFL 100+`). Identify its first `sections`/`body` entry and its `metaDesc`.

- [ ] **Step 2: Add a 2026-update note as the FIRST section of that post.** Insert a new section object at the start of that post's `sections` array (match the post's existing section shape — most use `{ "h": "...", "body": "..." }`; copy the exact keys the neighbouring sections use). Content:
  - `h`: `"2026 update: the TOEFL changed"`
  - `body`: `"Heads-up: TOEFL iBT was redesigned in January 2026. It's now under two hours, **scored on a 1–6 band scale** (with a comparable 0–120 shown during a two-year transition), and **Reading and Listening are adaptive**. The task types are new (Complete the Words, Write an Email, Listen and Repeat, and more). The strategy below still helps, and many universities still list 0–120 requirements during the transition — but for the current format see our [TOEFL 2026 Smart Notes](/learn/toefl/)."`
  - If the post object supports an `expires` field (other trend posts do), do NOT add one — this is an evergreen strategy post, not a dated trend.

- [ ] **Step 3: Reframe the "0-120 breakdown" heading.** Find the section with `"h": "TOEFL iBT Breakdown: How the 0-120 Score is Calculated"`. Change that `h` to `"TOEFL iBT Breakdown: How the Legacy 0–120 Score Works (Transitional)"` and prepend to its `body` (before the existing text) the sentence: `"Since January 2026 the primary TOEFL score is a 1–6 band; the 0–120 total below is the comparable scale that ETS still reports during the two-year transition, and that many universities still list. "` Keep the rest of the existing body.

- [ ] **Step 4: Annotate the two study-plan target lines.** 
  - Find `"**Jan–Feb**: Take IELTS/TOEFL. Aim for 5.5–6.0 (IELTS) or 72–79 (TOEFL)."` → replace the `72–79 (TOEFL)` portion so the line reads `"...Aim for 5.5–6.0 (IELTS), or the TOEFL equivalent (TOEFL now scores 1–6; a comparable 0–120 around 72–79 is shown during the transition — check your university's requirement)."`
  - Find the line containing `Target 6.5+ (IELTS) or 90+ (TOEFL)` and similarly append `" (TOEFL now uses a 1–6 band; 90+ refers to the transitional 0–120 many universities still list)"` inside that line's string.
  Match each string exactly (they are inside JS string literals — keep the surrounding quotes/escaping valid).

- [ ] **Step 5: Build + audit.** Run `npm run build`. Expected: `blog-data.jsx` compiles (no unterminated-string / JSON errors), blog pages regenerate, `AUDIT PASSED`, 0 broken links (the `/learn/toefl/` link target exists).

- [ ] **Step 6: Verify the note landed on the prerendered post.** Run:
```bash
node -e "const fs=require('fs');const p=require('child_process').execSync('ls blog/*toefl-100*/index.html 2>/dev/null || true').toString().trim(); if(!p){console.log('locate the post slug dir under blog/ and check manually');process.exit(0);} console.log('has 2026 note:', /2026 update: the TOEFL changed/.test(fs.readFileSync(p.split('\\n')[0],'utf8')));"
```
Expected: `true` (or, if the slug differs, `grep -rl "2026 update: the TOEFL changed" blog/*/index.html`).

- [ ] **Step 7: Commit.**
```bash
git add blog-data.jsx blog-data.js
git commit -m "content(toefl-2026): flag legacy-format TOEFL blog sections + link to 2026 Smart Notes"
```

---

## Task 3: Legacy-format banner on the TOEFL mock (`screens/mock-test.jsx`)

**Files:**
- Modify: `screens/mock-test.jsx` (the drill-selection render, near the `DRILLS` map; `DRILLS` is defined ≈ line 778, `exam` is in scope with `exam.id`/`exam.duration`)

- [ ] **Step 1: Find where `DRILLS[exam.id]` is rendered.** Search `screens/mock-test.jsx` for where the per-exam drill cards are mapped into JSX (look for `DRILLS[` used in the return, or `.map(` over the drills). Note the JSX element that wraps the drill grid and the indentation.

- [ ] **Step 2: Insert the banner immediately above the drill grid**, guarded by `exam.id === "toefl"`. Use this JSX (adjust the wrapper class to match a nearby existing notice/callout; a plain styled div is fine — keep it theme/dark-mode safe by using CSS vars, not hex):
```jsx
{exam.id === "toefl" && (
  <div
    role="note"
    style={{
      margin: "0 0 16px",
      padding: "12px 14px",
      borderRadius: "var(--r-lg)",
      border: "1px solid var(--line)",
      background: "rgba(2, 132, 199, 0.08)",
      color: "var(--ink)",
      fontSize: "14px",
      lineHeight: "1.5",
    }}
  >
    <strong>Heads-up:</strong> this practice reflects the <strong>pre-2026 TOEFL</strong> (0–120 scale).
    TOEFL iBT changed in January 2026 (now a 1–6 band, adaptive Reading &amp; Listening, new task types).
    For the current format, see our{" "}
    <a href="/learn/toefl/" style={{ color: "var(--accent)", fontWeight: 700 }}>TOEFL 2026 Smart Notes →</a>.
  </div>
)}
```
Place it inside the same container that holds the drill grid, before the grid element, at the matching indentation. Do NOT change the `DRILLS.toefl` labels themselves (they honestly describe the legacy mock the banner discloses).

- [ ] **Step 3: Build.** Run `npm run build`. Expected: precompile transpiles `mock-test.jsx` (no JSX error), bundle writes, `check-hooks` passes, `AUDIT PASSED`.

- [ ] **Step 4: Verify the banner is present + guarded.** Run:
```bash
grep -c "pre-2026 TOEFL" screens/mock-test.js && grep -c 'exam.id === "toefl"' screens/mock-test.js
```
Expected: both ≥ 1.

- [ ] **Step 5: Browser check (preview).** Start the preview server, open the TOEFL mock (`#/exam-prep/toefl` or the app's TOEFL mock route), confirm: the banner shows on TOEFL, the `/learn/toefl/` link is present, and the banner does NOT show for another exam (e.g. IELTS). Confirm no console errors. (If preview is unavailable, note it and rely on the grep + smoke test.)

- [ ] **Step 6: Commit.**
```bash
git add screens/mock-test.jsx screens/mock-test.js
git commit -m "feat(toefl-2026): legacy-format notice on the TOEFL mock linking to 2026 Smart Notes"
```

---

## Task 4: Fact-check, full test, QA, deploy

**Files:** none (verification + release)

- [ ] **Step 1: Fact-check (haiku).** Dispatch a haiku `claude` subagent with the DIFF of `data.jsx` (Task 1) + the blog edits (Task 2). Verify against the ETS facts in Conventions: correct task names, section item counts (~50/~47/~12/~11) and times (~30/~29/~8/~23), adaptive R/L + linear W/S, 1–6 primary with 0–120 transitional, no invented per-task minutes, no invented CEFR↔band table. Require `APPROVED`.

- [ ] **Step 2: Full test.** Run `npm test`. Expected: all green, including `✓ 12 Smart Note(s) valid.` and `✓ smoke-test: 26 routes loaded ... no crashes` (the TOEFL mock renders through the same component; the banner must not break it).

- [ ] **Step 3: Fast QA (haiku).** `git diff` the three source files (`data.jsx`, `blog-data.jsx`, `screens/mock-test.jsx`) and pass ONLY the hunks to a haiku `claude` subagent: check (a) valid JSON/JS (no unterminated strings, balanced brackets/JSX), (b) the banner is correctly guarded on `exam.id === "toefl"` and dark-mode-safe (CSS vars), (c) no transition-valid requirement content was deleted. Require `APPROVED`.

- [ ] **Step 4: Build once more for a clean version bump.** Run `npm run build`; note the new `lp-vNNN` (CACHE_VERSION must bump for deploy).

- [ ] **Step 5: Commit any QA fixes + the version bump, then deploy on explicit owner go-ahead.** Push to `main` only after the owner says go (production auto-deploys). Confirm `origin/main == HEAD` after push. Owner then hard-refreshes for the new SW.

---

## Self-review (completed)
- **Spec coverage:** §Scope item 1 (guide) → Task 1 (retargeted from `new-exam-guides.json`, which has no TOEFL entry, to `data.jsx` — the real guide source; only the still-stale `pattern`/`sections_detail` change, per the "don't touch transition-valid" rule which keeps `scoreGuide`). Item 2 (blog) → Task 2. Item 3 (legacy banner) → Task 3. Out-of-scope (exam-patterns.json, banks, requirement mentions) → untouched by all tasks. Testing/deploy → Task 4.
- **Placeholder scan:** exact old→new blocks given for Task 1; explicit strings + insert content for Task 2; full banner JSX for Task 3. No TBDs.
- **Consistency:** the `/learn/toefl/` link target (already live) is used identically in Tasks 2 and 3; task names and counts match the Conventions facts across tasks.

## Notes for the implementer
- The guide's `blurb`, `duration`, `score` are already 2026-correct — do NOT re-edit them. `scoreGuide` (0–120 buckets) is deliberately kept as the transitional reference.
- Accuracy mandate: every factual claim must match the ETS facts in Conventions; when unsure of a per-task number ETS doesn't publish, omit it rather than guess.
- Deploy is owner-gated; do not push to `main` without an explicit go-ahead.
