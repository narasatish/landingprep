// tools/tag-toefl-difficulty.mjs
//
// One-time (re-runnable) heuristic difficulty tagger for the TOEFL adaptive
// engine. Tags every reading passage and every listening test file
// easy | medium | hard, and emits content/toefl/adaptive-index.json that the
// runtime uses to pick stage-2 alternates.
//
// Signals (deterministic, no network):
//   - mean sentence length (words)          — longer = harder
//   - mean word length (chars)              — longer = harder
//   - rare-word ratio (not in common list)  — higher = harder
//   - question-type weight                  — inference/insert_text/prose_summary
//                                             harder than factual/vocabulary
// Scores are z-combined then bucketed by terciles across the whole bank, so
// every tier is guaranteed non-empty (~1/3 of the bank each).
//
// Usage: node tools/tag-toefl-difficulty.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const READING_DIR = path.join(ROOT, "content", "toefl", "reading");
const LISTENING_DIR = path.join(ROOT, "content", "toefl", "listening");
const INDEX_OUT = path.join(ROOT, "content", "toefl", "adaptive-index.json");

// ~330 highest-frequency English words + common academic glue. Anything outside
// this counts toward the rare-word ratio. Small on purpose: it only needs to
// RANK passages against each other, not judge absolute rarity.
const COMMON = new Set(("the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us is are was were been has had did said each she's it's don't doesn't can't won't isn't many much more before through where why again same right too very still between own while never both under those being during off above below own few once here does went made found every another such part great little world life hand old tell ask seem feel try leave call point small large number group problem fact water long place case week company system program question government night home water room mother area money story month lot study book eye job word business issue side kind head house service friend father power hour game line end member law car city community name team minute idea body information nothing ago face others level office door health person art war history party result change morning reason research girl guy moment air teacher force education process example paragraph passage author according describe mainly following true except suggest state states also however although because therefore thus since while during within without across among along near far high low increase decrease develop development form found create provide include support show shown known common early late modern century period human natural material energy species surface region climate ocean plant animal cell rock earth sun light heat water food land field science scientist theory evidence study test data result method rate amount level structure function role type effect cause source produce production growth environment temperature pressure area size range").split(/\s+/));

const QTYPE_WEIGHT = {
  // reading
  factual_information: 0, negative_factual: 1, vocabulary_in_context: 0,
  reference: 0, sentence_simplification: 2, inference: 3, rhetorical_purpose: 2,
  insert_text: 3, prose_summary: 3,
  // listening
  gist_content: 0, gist_purpose: 0, detail: 0, function: 2, attitude: 2,
  inference_listening: 3, organization: 2, connecting_content: 3,
};

function textStats(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/[.!?]+/).filter(s => s.trim().length > 2);
  const words = clean.toLowerCase().match(/[a-z']+/g) || [];
  if (!words.length || !sentences.length) return { sentLen: 0, wordLen: 0, rare: 0 };
  const sentLen = words.length / sentences.length;
  const wordLen = words.reduce((a, w) => a + w.length, 0) / words.length;
  const rare = words.filter(w => w.length > 3 && !COMMON.has(w)).length / words.length;
  return { sentLen, wordLen, rare };
}

function qtypeScore(questions) {
  if (!questions.length) return 0;
  return questions.reduce((a, q) => {
    const t = q.questionType === "inference" && q.scriptId ? "inference_listening" : q.questionType;
    return a + (QTYPE_WEIGHT[t] ?? 1);
  }, 0) / questions.length;
}

// z-normalise each signal across all items, then sum
function combine(items) {
  const keys = ["sentLen", "wordLen", "rare", "qtype"];
  for (const k of keys) {
    const vals = items.map(it => it.signals[k]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length) || 1;
    items.forEach(it => { it.score = (it.score || 0) + (it.signals[k] - mean) / sd; });
  }
  return items;
}

function bucketByTercile(items) {
  const sorted = [...items].sort((a, b) => a.score - b.score);
  const t1 = Math.floor(sorted.length / 3), t2 = Math.floor((2 * sorted.length) / 3);
  sorted.forEach((it, i) => { it.difficulty = i < t1 ? "easy" : i < t2 ? "medium" : "hard"; });
  return items;
}

function listJson(dir) {
  return fs.readdirSync(dir).filter(f => /^test-\d+\.json$/.test(f)).sort();
}

// ── Reading: tag each passage ────────────────────────────────────────────────
const readingItems = [];
const readingFiles = new Map(); // file → parsed JSON
for (const f of listJson(READING_DIR)) {
  const abs = path.join(READING_DIR, f);
  let test;
  try { test = JSON.parse(fs.readFileSync(abs, "utf8")); }
  catch (e) { console.error(`✗ SKIP unparseable ${f}: ${e.message}`); continue; }
  readingFiles.set(f, test);
  for (const p of test.passages || []) {
    const qs = (test.questions || []).filter(q => q.passageId === p.id);
    const st = textStats(p.text);
    readingItems.push({
      file: `toefl/reading/${f}`, localFile: f, passage: p,
      passageId: p.id, title: p.title || "",
      signals: { ...st, qtype: qtypeScore(qs) },
    });
  }
}
bucketByTercile(combine(readingItems));
readingItems.forEach(it => { it.passage.difficulty = it.difficulty; });

// ── Listening: tag each test file (aggregate over its scripts) ───────────────
const listeningItems = [];
const listeningFiles = new Map();
for (const f of listJson(LISTENING_DIR)) {
  const abs = path.join(LISTENING_DIR, f);
  let test;
  try { test = JSON.parse(fs.readFileSync(abs, "utf8")); }
  catch (e) { console.error(`✗ SKIP unparseable ${f}: ${e.message}`); continue; }
  listeningFiles.set(f, test);
  const allScript = (test.listeningScripts || []).map(s => s.script || "").join(" ");
  const st = textStats(allScript);
  listeningItems.push({
    file: `toefl/listening/${f}`, localFile: f, test,
    signals: { ...st, qtype: qtypeScore(test.questions || []) },
  });
}
bucketByTercile(combine(listeningItems));
listeningItems.forEach(it => { it.test.difficulty = it.difficulty; });

// ── Write tags back + emit index ─────────────────────────────────────────────
for (const [f, test] of readingFiles) {
  fs.writeFileSync(path.join(READING_DIR, f), JSON.stringify(test, null, 2) + "\n");
}
for (const [f, test] of listeningFiles) {
  fs.writeFileSync(path.join(LISTENING_DIR, f), JSON.stringify(test, null, 2) + "\n");
}

const index = {
  generated: "tools/tag-toefl-difficulty.mjs",
  reading: { easy: [], medium: [], hard: [] },
  listening: { easy: [], medium: [], hard: [] },
};
for (const it of readingItems) {
  index.reading[it.difficulty].push({ file: it.file, passageId: it.passageId, title: it.title });
}
for (const it of listeningItems) {
  index.listening[it.difficulty].push({ file: it.file });
}
fs.writeFileSync(INDEX_OUT, JSON.stringify(index, null, 2) + "\n");

// ── Report + sanity checks ───────────────────────────────────────────────────
const rc = Object.fromEntries(Object.entries(index.reading).map(([k, v]) => [k, v.length]));
const lc = Object.fromEntries(Object.entries(index.listening).map(([k, v]) => [k, v.length]));
console.log("Reading passages:", rc, "| Listening files:", lc);
const untaggedR = readingItems.filter(it => !it.passage.difficulty).length;
const untaggedL = listeningItems.filter(it => !it.test.difficulty).length;
if (untaggedR || untaggedL || !rc.easy || !rc.hard || !lc.easy || !lc.hard) {
  console.error("✗ FAILED: empty tier or untagged items"); process.exit(1);
}
console.log("✓ All tagged; adaptive-index.json written");
