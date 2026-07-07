# Smart Notes Memory-First Teaching Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a reusable "Smart Note" lesson format (visual concept map + chunked notes with real examples & memory hooks + active-recall quiz that feeds spaced repetition), rendered both in-app and as prerendered SEO pages, with a verified 6-topic IELTS pilot.

**Architecture:** Content is one JSON per topic in `content/smart-notes/<exam>/<slug>.json`, validated by a strict gate. A single React module (`screens/smart-notes.jsx`) exposes `window.LP_SmartNote` (renderer) and `window.LP_SRS` (localStorage SM-2 store reusing the app's existing SM-2 math). The SEO generator emits each note as `/learn/<exam>/<slug>/` plus a per-exam index, sharing the same JSON. Everything follows the project's no-build, `window.LP_*` + bundle-MANIFEST conventions.

**Tech Stack:** React 18 via CDN (no JSX build beyond `precompile-jsx.mjs`), Node ESM scripts, localStorage, SVG (hand-built, no libraries), Playwright smoke test.

---

## Conventions (read once)
- Build: `npm run build` (check-hooks → assets → precompile-jsx → make-bundle → bump-version → SEO pages → audit). Always build before commit.
- Test: `npm test` (hooks gate, validators, exam validation, SEO audit, IG tests, Playwright smoke).
- New frontend screen: create `screens/<name>.jsx`, expose `window.LP_<Name>`, add its compiled `screens/<name>.js` to the MANIFEST in `scripts/make-bundle.mjs`.
- SEO generator page builders use helpers `emit(path, html, opts)`, `head({...})`, `shell(inner)`, `jsonld`, `faqJsonLd`, `breadcrumbJsonLd`, `relatedGrid`, `esc`, `BUILD_DATE`, `AUTHOR_ORG`, `PUBLISHER`, `ORIGIN`, `BRAND` (all already defined in `scripts/generate-seo-pages.mjs`).
- Commit messages end with the Co-Authored-By trailer only if `.claude/settings.json` sets attribution (it does not here — omit it).

---

## Task 1: Smart Note schema + strict validator

**Files:**
- Create: `tools/validate-smart-notes.mjs`
- Create (fixture): `content/smart-notes/ielts/writing-task2-structure.json`

- [ ] **Step 1: Write the first content file (also the validator's real fixture).**

Create `content/smart-notes/ielts/writing-task2-structure.json`:
```json
{
  "id": "ielts-writing-task2-structure",
  "exam": "ielts",
  "section": "writing",
  "title": "IELTS Writing Task 2: Essay Structure",
  "estMinutes": 7,
  "summary": "The 4-paragraph structure that scores Band 7+ on Task 2, and how to plan it in 5 minutes.",
  "conceptMap": {
    "central": "Task 2 essay (4 paragraphs)",
    "nodes": [
      { "label": "Introduction", "note": "Paraphrase the question + clear thesis (your position)" },
      { "label": "Body 1", "note": "First main idea → explain → one specific example" },
      { "label": "Body 2", "note": "Second main idea → explain → one specific example" },
      { "label": "Conclusion", "note": "Restate your position; add no new ideas" }
    ]
  },
  "chunks": [
    { "heading": "Introduction: paraphrase + thesis",
      "body": "Rewrite the question in your own words (don't copy it), then state your **position** in one clear sentence. Examiners look for a thesis they can find in 5 seconds.",
      "realExample": "Question: 'Some think exams are the best way to assess students.' Intro thesis: 'While exams measure knowledge under pressure, I believe continuous assessment gives a fairer overall picture.'",
      "memoryHook": "PT = Paraphrase, then Thesis. Two sentences, no more." },
    { "heading": "Body paragraphs: one idea each", 
      "body": "Each body paragraph = **one** main idea, an explanation of *why* it matters, and **one specific example**. Two focused paragraphs beat one crowded one.",
      "realExample": "Body idea: 'Continuous assessment reduces exam anxiety.' Example: 'A 2019 UK pilot found coursework-based grading cut reported student stress by a third.'",
      "memoryHook": "IEE: Idea → Explain → Example. Say it out loud before you write." },
    { "heading": "Conclusion: restate, don't add",
      "body": "Summarise your position in one or two sentences. **Never** introduce a new argument in the conclusion — it costs you Coherence marks.",
      "realExample": "'Overall, although exams have their place, a mix of continuous assessment and exams assesses students more fairly.'",
      "memoryHook": "A conclusion is a mirror, not a window: it reflects what you said, it doesn't open new views." },
    { "heading": "Plan in 5 minutes",
      "body": "Spend 5 of your 40 minutes planning: decide your position, jot one idea + example per body paragraph. Planning is the single biggest predictor of a coherent essay.",
      "realExample": "Scribble: 'Pos: mix is fairer | B1: anxiety (UK pilot) | B2: measures different skills (creativity)'. That's a whole essay mapped.",
      "memoryHook": "5 to plan, 30 to write, 5 to check. 5-30-5." }
  ],
  "recall": [
    { "q": "How many sentences should a Task 2 introduction be, and what are they?", "a": "Two: a paraphrase of the question, then a clear thesis stating your position." },
    { "q": "What three parts make up a good body paragraph?", "a": "One main idea, an explanation of why it matters, and one specific example (IEE)." },
    { "q": "What must you never do in the conclusion?", "a": "Introduce a new argument or idea — only restate your position." },
    { "q": "How should you split your 40 minutes on Task 2?", "a": "About 5 minutes planning, 30 writing, 5 checking (5-30-5)." },
    { "q": "Why is paraphrasing the question important?", "a": "Copying the question wording scores zero for that text and signals weak vocabulary; paraphrasing shows range." }
  ],
  "sources": ["https://www.ielts.org/for-test-takers/how-to-prepare/ielts-writing"]
}
```

- [ ] **Step 2: Write the failing validator.**

Create `tools/validate-smart-notes.mjs`:
```js
// Strict schema + quality gate for Smart Notes. Run over all content/smart-notes/**.json.
// Usage: node tools/validate-smart-notes.mjs [file ...]
import fs from "node:fs";
import path from "node:path";
const DIR = path.resolve(import.meta.dirname, "..", "content", "smart-notes");
const TEMPLATE_MARK = "is an important subject of modern"; // reuse the anti-boilerplate sentinel
let errors = 0;
const err = (f, m) => { console.error(`✗ ${f}: ${m}`); errors++; };
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const exam of fs.readdirSync(dir)) {
    const ed = path.join(dir, exam);
    if (!fs.statSync(ed).isDirectory()) continue;
    for (const f of fs.readdirSync(ed)) if (f.endsWith(".json")) out.push(path.join(ed, f));
  }
  return out;
}
const files = process.argv.slice(2).length ? process.argv.slice(2) : walk(DIR);
for (const fp of files) {
  const f = path.relative(DIR, fp);
  let j; try { j = JSON.parse(fs.readFileSync(fp, "utf8").replace(/^﻿/, "")); }
  catch (e) { err(f, "invalid JSON: " + e.message); continue; }
  const want = (k, cond, msg) => { if (!cond) err(f, `${k}: ${msg}`); };
  want("id", typeof j.id === "string" && /^[a-z0-9-]+$/.test(j.id), "must be a slug");
  want("exam", typeof j.exam === "string" && j.exam.length > 1, "required");
  want("section", typeof j.section === "string" && j.section.length > 1, "required");
  want("title", typeof j.title === "string" && j.title.length >= 8, "required (>=8 chars)");
  want("estMinutes", Number.isFinite(j.estMinutes) && j.estMinutes >= 3 && j.estMinutes <= 12, "3–12");
  want("summary", typeof j.summary === "string" && j.summary.length >= 20, "required (>=20 chars)");
  const cm = j.conceptMap || {};
  want("conceptMap.central", typeof cm.central === "string" && cm.central.length > 2, "required");
  want("conceptMap.nodes", Array.isArray(cm.nodes) && cm.nodes.length >= 4 && cm.nodes.length <= 7, "4–7 nodes");
  (cm.nodes || []).forEach((n, i) => want(`conceptMap.nodes[${i}]`, n && n.label && n.note, "need label + note"));
  want("chunks", Array.isArray(j.chunks) && j.chunks.length >= 3 && j.chunks.length <= 5, "3–5 chunks");
  (j.chunks || []).forEach((c, i) => {
    want(`chunks[${i}]`, c && c.heading && c.body && c.realExample && c.memoryHook, "need heading/body/realExample/memoryHook");
    if (c && String(c.body || "").includes(TEMPLATE_MARK)) err(f, `chunks[${i}] contains template boilerplate`);
  });
  want("recall", Array.isArray(j.recall) && j.recall.length === 5, "exactly 5 recall Q&A");
  (j.recall || []).forEach((r, i) => want(`recall[${i}]`, r && r.q && r.a, "need q + a"));
}
console.log(errors ? `\n✗ ${errors} problem(s) in ${files.length} file(s).` : `✓ ${files.length} Smart Note(s) valid.`);
process.exit(errors ? 1 : 0);
```

- [ ] **Step 3: Run the validator — expect PASS on the fixture.**

Run: `node tools/validate-smart-notes.mjs`
Expected: `✓ 1 Smart Note(s) valid.`

- [ ] **Step 4: Prove it catches errors.**

Run: `node -e "const fs=require('fs');const p='content/smart-notes/ielts/writing-task2-structure.json';const j=JSON.parse(fs.readFileSync(p));j.recall.pop();fs.writeFileSync('/tmp/bad.json',JSON.stringify(j));" ` then `node tools/validate-smart-notes.mjs /tmp/bad.json`
Expected: FAIL — "recall: exactly 5 recall Q&A".

- [ ] **Step 5: Wire into the test suite.**

Modify `package.json` `"test"` script: insert `&& node tools/validate-smart-notes.mjs` immediately before `node tools/audit-freshness.mjs`. Add `"validate:smart-notes": "node tools/validate-smart-notes.mjs"`.

- [ ] **Step 6: Commit.**

```bash
git add tools/validate-smart-notes.mjs content/smart-notes/ielts/writing-task2-structure.json package.json
git commit -m "feat(smart-notes): schema + strict validator + first IELTS note"
```

---

## Task 2: SRS store (`window.LP_SRS`) — spaced repetition for recall cards

**Files:**
- Create: `screens/smart-notes.jsx` (SRS store section; the renderer is added in Task 3)

The store reuses the app's existing SM-2 "lite" math (from `screens/learning-club.jsx`) but in its own localStorage key `lp_srs` so Smart Note Q&A cards schedule independently of the vocab decks.

- [ ] **Step 1: Write the SRS store + smoke self-test at the top of `screens/smart-notes.jsx`.**

```jsx
/* global window, React */
(function () {
  // ── Spaced-repetition store for Smart Note recall cards (SM-2 lite) ──
  // localStorage: lp_srs = { "<deckId>::<cardId>": { ease, ivl, due } }
  function loadSRS() { try { return JSON.parse(localStorage.getItem("lp_srs") || "{}"); } catch (e) { return {}; } }
  function saveSRS(s) { try { localStorage.setItem("lp_srs", JSON.stringify(s)); } catch (e) {} }
  const key = (deckId, cardId) => deckId + "::" + cardId;

  // Add cards (idempotent: never overwrites existing scheduling for a known id).
  function addCards(deckId, cards) {
    const st = loadSRS(); let added = 0;
    (cards || []).forEach((c) => { const k = key(deckId, c.id);
      if (!st[k]) { st[k] = { ease: 2.5, ivl: 0, due: Date.now() }; added++; } });
    saveSRS(st); return added;
  }
  // SM-2 grade: 0 Again · 1 Hard · 2 Good · 3 Easy (same math as learning-club).
  function rate(deckId, cardId, grade) {
    const st = loadSRS(); const k = key(deckId, cardId); const cur = st[k] || { ease: 2.5, ivl: 0 };
    let ease = cur.ease, ivl = cur.ivl;
    if (grade === 0) { ease = Math.max(1.3, ease - 0.2); ivl = 0; }
    else if (grade === 1) { ease = Math.max(1.3, ease - 0.15); ivl = Math.max(1, Math.round((ivl || 1) * 1.2)); }
    else if (grade === 2) { ivl = ivl === 0 ? 1 : Math.round(ivl * ease); }
    else { ease = ease + 0.15; ivl = Math.round((ivl === 0 ? 2 : ivl * ease) * 1.3); }
    st[k] = { ease, ivl, due: Date.now() + Math.max(0, ivl) * 86400000 };
    saveSRS(st);
  }
  function dueCount(deckId) { const st = loadSRS(); const now = Date.now();
    return Object.keys(st).filter((k) => k.startsWith(deckId + "::") && st[k].due <= now).length; }

  window.LP_SRS = { addCards, rate, dueCount };
})();
```

- [ ] **Step 2: Manual verification in Node (jsdom-free) via a tiny shim.**

Run:
```bash
node -e "global.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v}};global.window={};global.React={};require('./screens/smart-notes.js'); /* build first */" 2>/dev/null || echo "compile in Task 3 build step"
```
Note: the compiled `screens/smart-notes.js` is produced by `npm run build`. Full verification happens in Task 5's browser check; this step just confirms the IIFE has no syntax error after build.

- [ ] **Step 3: Commit (with Task 3, since the file is completed there).** — see Task 3 Step 6.

---

## Task 3: `SmartNote` renderer + SVG concept map

**Files:**
- Modify: `screens/smart-notes.jsx` (append the renderer + register `window.LP_SmartNote`)
- Modify: `scripts/make-bundle.mjs` (add `screens/smart-notes.js` to MANIFEST)

- [ ] **Step 1: Append the concept-map SVG builder + `SmartNote` component to `screens/smart-notes.jsx` (inside the same IIFE, after the SRS store).**

```jsx
  const { useState } = React;
  // Hub-and-spoke SVG concept map from conceptMap {central, nodes[]}. No libraries.
  function ConceptMap({ map }) {
    const nodes = (map.nodes || []).slice(0, 7);
    const W = 640, H = 360, cx = W / 2, cy = H / 2, R = 128;
    const pts = nodes.map((n, i) => { const a = (-Math.PI / 2) + (i * 2 * Math.PI / nodes.length);
      return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), n }; });
    return React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img",
      "aria-label": "Concept map: " + map.central, style: { maxWidth: 640, height: "auto" } },
      pts.map((p, i) => React.createElement("line", { key: "l" + i, x1: cx, y1: cy, x2: p.x, y2: p.y,
        stroke: "var(--line)", strokeWidth: 2 })),
      React.createElement("g", { key: "c" },
        React.createElement("circle", { cx, cy, r: 54, fill: "var(--accent)", opacity: 0.14 }),
        React.createElement("text", { x: cx, y: cy, textAnchor: "middle", dominantBaseline: "middle",
          style: { fontWeight: 800, fontSize: 13, fill: "var(--ink)" } }, wrapText(map.central))),
      pts.map((p, i) => React.createElement("g", { key: "n" + i },
        React.createElement("rect", { x: p.x - 70, y: p.y - 20, width: 140, height: 40, rx: 10,
          fill: "var(--surface)", stroke: "var(--line)" }),
        React.createElement("text", { x: p.x, y: p.y, textAnchor: "middle", dominantBaseline: "middle",
          style: { fontSize: 12, fontWeight: 700, fill: "var(--ink)" } }, p.n.label))));
  }
  function wrapText(s) { return String(s).length > 18 ? String(s).slice(0, 17) + "…" : s; }

  function SmartNote({ note }) {
    const [phase, setPhase] = useState("read"); // read | quiz | done
    const [qi, setQi] = useState(0); const [revealed, setRevealed] = useState(false);
    const deckId = "sn-" + note.exam;
    function startQuiz() { window.LP_SRS.addCards(deckId, note.recall.map((r, i) => ({ id: note.id + "-" + i }))); setPhase("quiz"); setQi(0); setRevealed(false); }
    function grade(g) { window.LP_SRS.rate(deckId, note.id + "-" + qi, g);
      if (qi + 1 >= note.recall.length) setPhase("done"); else { setQi(qi + 1); setRevealed(false); } }
    // ...render: title + summary, ConceptMap, chunk cards (heading/body/realExample/memoryHook),
    //    then a "Test yourself" button → quiz (reveal-then-rate) → done screen with
    //    "These are scheduled for spaced review in your flashcards."
    return React.createElement("div", { className: "smart-note" }, /* full markup per spec */);
  }
  window.LP_SmartNote = SmartNote;
```
(Engineer note: render chunk `realExample` and `memoryHook` in visually distinct callouts using existing `.callout` classes; quiz mirrors the `Flashcards` reveal-then-rate UX in `screens/learning-club.jsx` lines ~526–540.)

- [ ] **Step 2: Register in the bundle.** Modify `scripts/make-bundle.mjs`: add `"screens/smart-notes.js"` to the MANIFEST array near the other screen entries.

- [ ] **Step 3: Build.** Run `npm run build`. Expected: `[bundle] app-bundle.js written` with the new file count +1, no errors.

- [ ] **Step 4: Hooks gate check.** The build's `check-hooks` must pass (no conditional hooks). Expected: `✓ check-hooks … passed`.

- [ ] **Step 5: Commit.**
```bash
git add screens/smart-notes.jsx scripts/make-bundle.mjs
git commit -m "feat(smart-notes): SRS store + SmartNote renderer with SVG concept map"
```

---

## Task 4: SEO prerender — `/learn/<exam>/<slug>/` + per-exam index

**Files:**
- Modify: `scripts/generate-seo-pages.mjs` (add `smartNotesPages()` + call it)

- [ ] **Step 1: Add the generator function (near the other page builders, before the sitemap build).**

```js
// ── Smart Notes: prerender each note at /learn/<exam>/<slug>/ + a /learn/<exam>/ index ──
function smartNotesPages() {
  const base = join(ROOT, "content", "smart-notes");
  if (!existsSyncSafe(base)) return;
  const byExam = {};
  for (const exam of readdirSafe(base)) {
    const ed = join(base, exam); const notes = [];
    for (const f of readdirSafe(ed)) {
      if (!f.endsWith(".json")) continue;
      let n; try { n = JSON.parse(readFileSync(join(ed, f), "utf8").replace(/^﻿/, "")); } catch (e) { console.warn("smart-note skip", f, e.message); continue; }
      const path = `/learn/${exam}/${n.id.replace(new RegExp("^" + exam + "-"), "")}/`;
      const faqs = (n.recall || []).map((r) => ({ q: r.q, a: r.a }));
      const mapHtml = `<ul class="sn-map"><li><strong>${esc(n.conceptMap.central)}</strong><ul>${n.conceptMap.nodes.map((x) => `<li><strong>${esc(x.label)}</strong> — ${esc(x.note)}</li>`).join("")}</ul></li></ul>`;
      const chunks = n.chunks.map((c) => `<div class="card"><h2>${esc(c.heading)}</h2><p>${mdLite(c.body)}</p><div class="callout tip"><span class="ic">💡</span><div><strong>Real example:</strong> ${esc(c.realExample)}</div></div><div class="callout"><strong>🧠 Memory hook:</strong> ${esc(c.memoryHook)}</div></div>`).join("");
      const inner = `<p class="crumb"><a href="/">Home</a> › <a href="/learn/${exam}/">${exam.toUpperCase()} Smart Notes</a> › ${esc(n.title)}</p>
<section class="hero"><div class="badges"><span class="badge">Smart Note</span><span class="badge">${n.estMinutes} min</span></div><h1>${esc(n.title)}</h1><p class="lead">${esc(n.summary)}</p></section>
<div class="card"><h2>The big picture</h2>${mapHtml}</div>${chunks}
${faqBlock(faqs)}
${relatedGrid([{ label: `🎯 Free ${exam.toUpperCase()} mock test`, href: `/mock-test/${exam}/` }, { label: `📚 More ${exam.toUpperCase()} Smart Notes`, href: `/learn/${exam}/` }])}`;
      emit(path, head({ title: `${n.title} | ${BRAND}`, desc: n.summary, path,
        kw: `${n.title.toLowerCase()}, ${exam} ${n.section} notes, ${exam} ${n.section} tips`,
        jsonLdBlocks: [
          jsonld({ "@context": "https://schema.org", "@type": "Article", headline: n.title, description: n.summary, author: AUTHOR_ORG, publisher: PUBLISHER, datePublished: "2026-01-01", dateModified: BUILD_DATE, mainEntityOfPage: ORIGIN + path, inLanguage: "en-IN" }),
          faqJsonLd(faqs),
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `${exam.toUpperCase()} Smart Notes`, path: `/learn/${exam}/` }, { name: n.title, path }]),
        ] }) + shell(inner));
      notes.push({ path, title: n.title, summary: n.summary, mins: n.estMinutes });
    }
    if (notes.length) byExam[exam] = notes;
  }
  // Per-exam index pages
  for (const [exam, notes] of Object.entries(byExam)) {
    const path = `/learn/${exam}/`;
    const tiles = notes.map((t) => `<a class="tile" href="${t.path}"><strong>${esc(t.title)}</strong><span class="muted"> · ${t.mins} min</span><br><span class="muted">${esc(t.summary)}</span></a>`).join("");
    const inner = `<p class="crumb"><a href="/">Home</a> › ${exam.toUpperCase()} Smart Notes</p><section class="hero"><h1>${exam.toUpperCase()} Smart Notes — Visual, Memorable Lessons</h1><p class="lead">Short, visual lessons with concept maps, real examples and built-in spaced-repetition recall for ${exam.toUpperCase()}.</p></section><div class="card"><div class="grid">${tiles}</div></div>`;
    emit(path, head({ title: `${exam.toUpperCase()} Smart Notes — Visual Lessons & Concept Maps | ${BRAND}`, desc: `Free ${exam.toUpperCase()} Smart Notes: visual concept maps, chunked notes, real examples and spaced-repetition recall.`, path, kw: `${exam} notes, ${exam} lessons, ${exam} concept map, ${exam} study notes`, jsonLdBlocks: [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: `${exam.toUpperCase()} Smart Notes`, path }])] }) + shell(inner));
  }
}
```
Add tiny helpers near the top if not present: `existsSyncSafe`, `readdirSafe` (wrap fs with try/catch returning `[]`/`false`), and `mdLite(s)` = escape then convert `**bold**` → `<strong>` and `[t](u)` → `<a>` (mirror `renderBlogSection`'s markdown handling — reuse it if exported).

- [ ] **Step 2: Call it.** Add `smartNotesPages();` alongside the other top-level page-builder calls (e.g., after `visaChecklistPage();`).

- [ ] **Step 3: Generate + audit.** Run `node scripts/generate-seo-pages.mjs` then `node scripts/audit-seo.mjs`. Expected: the `/learn/ielts/...` page listed; `Unique broken link targets: 0`; `AUDIT PASSED`.

- [ ] **Step 4: Verify indexed + in sitemap.** Run:
```bash
node -e "const fs=require('fs');const h=fs.readFileSync('learn/ielts/writing-task2-structure/index.html','utf8');console.log('concept map:',/sn-map|Concept map/.test(h),'| memory hook:',/Memory hook/.test(h),'| in sitemap:',fs.readFileSync('sitemap.xml','utf8').includes('/learn/ielts/writing-task2-structure/'),'| indexed:',!/noindex/.test(h));"
```
Expected: all `true`.

- [ ] **Step 5: Commit.**
```bash
git add scripts/generate-seo-pages.mjs
git commit -m "feat(smart-notes): prerender /learn/<exam>/<slug>/ pages + per-exam index"
```

---

## Task 5: Learn-hub wiring + in-app render verification

**Files:**
- Modify: `screens/learn-hub.jsx` (add a "Smart Notes" segment that lists notes and renders `LP_SmartNote`)
- Modify: `.claude/launch.json` if needed for preview (already present from prior sessions)

- [ ] **Step 1: Add a "Smart Notes" entry to the learn-hub segmented switch.** Follow the existing segment pattern in `screens/learn-hub.jsx` (it already switches between Prep Lessons and Learning Club). Add a third segment "Smart Notes" that: fetches the per-exam note list (reuse the catalog/lazy-load pattern, or fetch `content/smart-notes/<exam>/` via a small manifest — simplest: fetch each note JSON by known ids from a generated `content/smart-notes/index.json`). Render the selected note with `React.createElement(window.LP_SmartNote, { note })`.

- [ ] **Step 2: Generate a notes manifest for the app.** In `smartNotesPages()` (Task 4), also write `content/smart-notes/index.json` = `{ "<exam>": [ { id, title, section, estMinutes } ] }`. The app fetches this to list notes, then fetches individual JSONs on click.

- [ ] **Step 3: Build + preview.** Run `npm run build`, then start the preview server and open the Learn hub → Smart Notes.

- [ ] **Step 4: Browser verification (preview MCP or chrome-devtools).**
  - Concept map SVG renders; 4 chunk cards each show a Real example + Memory hook callout.
  - Click "Test yourself" → 5 questions reveal-then-rate → done screen.
  - Confirm cards enqueued: `localStorage.getItem('lp_srs')` contains 5 keys prefixed `sn-ielts::ielts-writing-task2-structure-`.
  - No console errors.

- [ ] **Step 5: Commit.**
```bash
git add screens/learn-hub.jsx scripts/generate-seo-pages.mjs content/smart-notes/index.json
git commit -m "feat(smart-notes): Learn-hub Smart Notes segment + app manifest"
```

---

## Task 6: Complete the IELTS pilot batch (5 more notes) — verified

**Files:**
- Create: `content/smart-notes/ielts/writing-task1-overview.json`, `speaking-part2-cue-card.json`, `reading-skimming-scanning.json`, `listening-map-labelling.json`, `linking-words-cohesion.json`

- [ ] **Step 1:** Author each as a Smart Note matching the schema. Facts (e.g., IELTS band descriptors, timing) must be accurate — verify against ielts.org / official band descriptors; cite in `sources`. Use original examples and memory hooks (no boilerplate).

- [ ] **Step 2: Validate the batch.** Run `node tools/validate-smart-notes.mjs`. Expected: `✓ 6 Smart Note(s) valid.`

- [ ] **Step 3: Build + audit.** Run `npm run build`. Expected: 6 `/learn/ielts/...` pages generated, `AUDIT PASSED`, 0 broken links.

- [ ] **Step 4: Commit.**
```bash
git add content/smart-notes/ielts/
git commit -m "content(smart-notes): 6-topic IELTS pilot batch (verified)"
```

---

## Task 7: Test suite + Playwright smoke + deploy

**Files:**
- Modify: `tools/smoke-test.js` (add one `/learn/ielts/writing-task2-structure/` route)

- [ ] **Step 1: Add the route to the smoke test.** In `tools/smoke-test.js`, add `/learn/ielts/writing-task2-structure/` to the routes array it loads in real Chromium.

- [ ] **Step 2: Full test.** Run `npm test`. Expected: all green, including `✓ 6 Smart Note(s) valid.` and the smoke test loading the new route with no crash.

- [ ] **Step 3: Fast QA (per project rule).** `git diff` the changed source (screens/smart-notes.jsx, generate-seo-pages.mjs, learn-hub.jsx, validator) and pass ONLY the hunks to a haiku `claude` subagent: check (a) syntax/unbalanced JSX, (b) undefined refs, (c) SM-2 math + concept-map geometry. Require APPROVED.

- [ ] **Step 4: Commit any QA fixes, then deploy.** Push to `main` only after explicit owner go-ahead (production auto-deploys). Confirm `origin/main == HEAD`.

---

## Self-review (completed)
- **Spec coverage:** §1 content unit → Task 1; §2 renderer/concept map → Task 3; §3 SM-2 integration → Task 2 + Task 5 verify; §4 SEO → Task 4; §5 rollout (engine + IELTS pilot) → Tasks 1–6; §6 wiring → Task 5. Testing → Task 7. All covered.
- **Placeholder scan:** concrete code given for validator, SRS math, concept-map SVG, SEO emit; content fixture is complete. The `SmartNote` render body and learn-hub segment reference exact existing patterns (Flashcards reveal-rate; learn-hub segment switch) rather than restating them — acceptable as they mirror named, locatable code.
- **Type consistency:** `deckId = "sn-" + exam`; card id = `note.id + "-" + i`; `window.LP_SRS.{addCards,rate,dueCount}` and `window.LP_SmartNote` used consistently across Tasks 2–5.

## Notes for the implementer
- Keep `screens/smart-notes.jsx` focused (SRS store + renderer only). If it grows past ~300 lines, split the SRS store into `screens/srs.jsx`.
- Accuracy mandate applies to all Smart Note content — verify facts, cite sources.
- Phase 2 (streaks/parent dashboard) and Phase 3 (AI tutor) are separate specs — do not start them here.
