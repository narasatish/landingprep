#!/usr/bin/env node
// Generates the PWA app icons (PNG, required by Android / install / Play Store) and the
// og-image.png social card (referenced by OG tags + Article schema). Brand-consistent with
// icon.svg (the gradient graduation-cap monogram). Run: node scripts/make-app-assets.cjs
let sharp; try { sharp = require("sharp"); } catch (e) {
  console.log("↷ sharp not installed — skipping make-app-assets (pre-built icons in repo are used)");
  process.exit(0);
}
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const out = (f) => path.join(ROOT, f);
const BRAND1 = "#4F46E5", BRAND2 = "#9333EA";

// The graduation-cap monogram (same artwork as icon.svg), as a standalone SVG at a given size.
function capSVG(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BRAND1}"/><stop offset="1" stop-color="${BRAND2}"/></linearGradient></defs>
    <rect width="32" height="32" rx="8.5" fill="url(#g)"/>
    <path d="M16 8.2 L27 12.6 L16 17 L5 12.6 Z" fill="#fff"/>
    <path d="M9.4 14.6 L9.4 19.3 C12.8 21.6 19.2 21.6 22.6 19.3 L22.6 14.6" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M27 12.6 L27 18.6" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="27" cy="19.4" r="1.25" fill="#fff"/>
  </svg>`;
}

async function main() {
  // ── App icons (PNG) ──────────────────────────────────────────────────────
  await sharp(Buffer.from(capSVG(192))).png().toFile(out("icon-192.png"));
  await sharp(Buffer.from(capSVG(512))).png().toFile(out("icon-512.png"));
  // Maskable: the cap on a solid brand tile, scaled into the centre safe-zone (~76%).
  const inner = Math.round(512 * 0.76);
  const capPng = await sharp(Buffer.from(capSVG(inner))).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: BRAND1 } })
    .composite([{ input: capPng, gravity: "centre" }]).png().toFile(out("icon-maskable-512.png"));
  console.log("✓ icon-192.png, icon-512.png, icon-maskable-512.png");

  // ── OG social card (1200×630) — fixes broken WhatsApp/LinkedIn/IG link previews ──
  const og = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#3b0764"/></linearGradient>
      <linearGradient id="cap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BRAND1}"/><stop offset="1" stop-color="${BRAND2}"/></linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <g transform="translate(96,150) scale(4.2)">
      <rect width="32" height="32" rx="8.5" fill="url(#cap)"/>
      <path d="M16 8.2 L27 12.6 L16 17 L5 12.6 Z" fill="#fff"/>
      <path d="M9.4 14.6 L9.4 19.3 C12.8 21.6 19.2 21.6 22.6 19.3 L22.6 14.6" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M27 12.6 L27 18.6" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
      <circle cx="27" cy="19.4" r="1.25" fill="#fff"/>
    </g>
    <text x="270" y="225" font-family="Segoe UI, Arial, sans-serif" font-size="74" font-weight="800" fill="#ffffff">LandingPrep</text>
    <text x="98" y="350" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="700" fill="#c7d2fe">Free mock tests + a complete study-abroad toolkit</text>
    <text x="98" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="32" fill="#a5b4fc">IELTS · TOEFL · PTE · CELPIP · Duolingo · GRE · GMAT</text>
    <text x="98" y="478" font-family="Segoe UI, Arial, sans-serif" font-size="32" fill="#a5b4fc">College predictor · Scholarships · SOP · Visa · Costs</text>
    <rect x="98" y="525" width="360" height="62" rx="31" fill="${BRAND1}"/>
    <text x="278" y="566" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff">landingprep.com</text>
    <text x="1102" y="566" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#818cf8">100% free · no signup</text>
  </svg>`;
  await sharp(Buffer.from(og)).png().toFile(out("og-image.png"));
  console.log("✓ og-image.png (1200×630)");
}
main().catch((e) => { console.error(e); process.exit(1); });
