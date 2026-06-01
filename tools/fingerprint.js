// fingerprint.js — uniqueness / near-duplicate detection for generated questions
// Used by the generator (Node.js) to reject duplicates before persisting.

"use strict";

function normalize(s) {
  return (s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

// FNV-1a 64-bit fingerprint of normalized question content
function fingerprint(q) {
  const optsStr = (q.options || []).map(normalize).join("||");
  const answerStr = normalize(typeof q.answer === "object" ? JSON.stringify(q.answer) : String(q.answer));
  const base = `${normalize(q.text)}|${optsStr}|${answerStr}|${q.type || ""}`;

  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < base.length; i++) {
    h ^= BigInt(base.charCodeAt(i));
    h = BigInt.asUintN(64, h * 0x100000001b3n);
  }
  return h.toString(36);
}

// Jaccard similarity on word tokens. Used to flag near-duplicates that escape exact-hash matching.
function tokenSet(s) {
  return new Set((s || "").toLowerCase().match(/[a-z]{3,}/g) || []);
}
function jaccard(a, b) {
  const A = tokenSet(a), B = tokenSet(b);
  if (!A.size && !B.size) return 0;
  const inter = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union > 0 ? inter / union : 0;
}

// True if a candidate question is too similar to any in the existing set
function isNearDuplicate(candidate, existing, threshold = 0.85) {
  const candText = candidate.text || "";
  for (const e of existing) {
    if (e.fingerprint === candidate.fingerprint) return true;
    if (jaccard(candText, e.text) >= threshold) return true;
  }
  return false;
}

// Passage-level fingerprint (longer text → just hash first 400 chars + length)
function passageFingerprint(text) {
  const norm = normalize(text).slice(0, 400);
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < norm.length; i++) {
    h ^= BigInt(norm.charCodeAt(i));
    h = BigInt.asUintN(64, h * 0x100000001b3n);
  }
  return h.toString(36) + "_" + (text || "").length;
}

module.exports = { fingerprint, jaccard, isNearDuplicate, passageFingerprint, normalize };
