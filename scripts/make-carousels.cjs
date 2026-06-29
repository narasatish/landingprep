/* make-carousels.cjs — generate Instagram-ready carousel slides (1080×1080 PNG) for
   @landing_prep from SVG, via @resvg/resvg-js. Run: node scripts/make-carousels.cjs
   Output: marketing/carousels/<carousel>/slide-NN.png  (+ a contact-sheet preview). */
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const OUT = path.join(__dirname, "..", "marketing", "carousels");
const W = 1080, H = 1080;
const INK = "#0f172a", SUB = "#475569", ACCENT = "#4F46E5", ACCENT2 = "#9333EA", LEAF = "#10B981";
// Strip regional-indicator flag emoji (resvg has no color-flag font → they render as
// "DE"/"GB" letter codes). Country names already carry the meaning.
const esc = (s) => String(s).replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").replace(/\s{2,}/g, " ").trim()
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// crude but effective SVG word-wrap → array of lines (approx by char width)
function wrapLines(text, maxChars) {
  const words = String(text).split(" ");
  const lines = []; let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars && line) { lines.push(line); line = w; }
    else line = (line ? line + " " : "") + w;
  }
  if (line) lines.push(line);
  return lines;
}
function tspans(text, x, y, lh, maxChars, attrs) {
  return wrapLines(text, maxChars).map((l, i) =>
    `<text x="${x}" y="${y + i * lh}" ${attrs}>${esc(l)}</text>`).join("");
}

function gradientDefs() {
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ACCENT}"/><stop offset=".55" stop-color="#6D28D9"/><stop offset="1" stop-color="${ACCENT2}"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${ACCENT}"/><stop offset="1" stop-color="${ACCENT2}"/>
    </linearGradient></defs>`;
}
function brandFooter(color) {
  return `<text x="${W / 2}" y="1028" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700" fill="${color || "rgba(255,255,255,.85)"}">🎓 LandingPrep · 100% free · landingprep.com</text>`;
}
// ── Slide builders ───────────────────────────────────────────────────────────
function coverSlide(o) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${gradientDefs()}
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="900" cy="180" r="240" fill="#fff" opacity=".10"/>
    <circle cx="160" cy="930" r="280" fill="#fff" opacity=".10"/>
    <text x="80" y="200" font-family="Arial" font-size="34" font-weight="700" fill="rgba(255,255,255,.85)">${esc(o.kicker || "SAVE THIS 📌")}</text>
    ${tspans(o.title, 80, 360, 96, 18, `font-family="Arial" font-size="84" font-weight="800" fill="#fff"`)}
    ${tspans(o.sub || "", 80, 760, 50, 40, `font-family="Arial" font-size="38" font-weight="500" fill="rgba(255,255,255,.92)"`)}
    <text x="80" y="930" font-family="Arial" font-size="34" font-weight="700" fill="#fff">Swipe →</text>
    ${brandFooter()}</svg>`;
}
function listSlide(o) {
  // o.items: [{ name, meta, note }]
  let y = 300;
  const rows = o.items.map((it) => {
    const block = `
      <rect x="80" y="${y - 52}" width="14" height="${it.note ? 150 : 110}" rx="7" fill="url(#bar)"/>
      <text x="120" y="${y}" font-family="Arial" font-size="44" font-weight="800" fill="${INK}">${esc(it.name)}</text>
      <text x="120" y="${y + 48}" font-family="Arial" font-size="32" font-weight="500" fill="${SUB}">${esc(it.meta)}</text>
      ${it.note ? `<text x="120" y="${y + 92}" font-family="Arial" font-size="28" font-weight="500" fill="${ACCENT}">${esc(it.note)}</text>` : ""}`;
    y += it.note ? 200 : 160;
    return block;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${gradientDefs()}
    <rect width="${W}" height="${H}" fill="#F8FAFC"/>
    <rect x="0" y="0" width="${W}" height="170" fill="url(#bar)"/>
    <text x="80" y="108" font-family="Arial" font-size="50" font-weight="800" fill="#fff">${esc(o.title)}</text>
    ${rows}
    ${brandFooter(SUB)}</svg>`;
}
function ctaSlide(o) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${gradientDefs()}
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="170" cy="190" r="230" fill="#fff" opacity=".10"/>
    ${tspans(o.headline, 80, 380, 88, 20, `font-family="Arial" font-size="78" font-weight="800" fill="#fff"`)}
    ${tspans(o.sub || "", 80, 660, 50, 36, `font-family="Arial" font-size="40" font-weight="500" fill="rgba(255,255,255,.95)"`)}
    <rect x="80" y="780" width="920" height="110" rx="55" fill="#fff"/>
    <text x="${W / 2}" y="850" text-anchor="middle" font-family="Arial" font-size="42" font-weight="800" fill="${ACCENT}">${esc(o.button)}</text>
    ${brandFooter()}</svg>`;
}

// ── Carousel content (accurate; flagship awards + general guidance) ───────────
const CAROUSELS = {
  "scholarships": [
    coverSlide({ kicker: "SAVE THIS 📌 · FULLY FUNDED", title: "10 Fully-Funded Scholarships for 2026", sub: "Tuition + living covered. Tag a friend who's applying abroad 👇" }),
    listSlide({ title: "🇩🇪 Germany & 🇬🇧 UK", items: [
      { name: "DAAD Scholarships", meta: "Germany · tuition + monthly stipend", note: "Deadlines vary by programme" },
      { name: "Chevening", meta: "UK · full 1-year master's (UK Gov)", note: "Applications usually Aug–Nov" },
    ] }),
    listSlide({ title: "🇬🇧 UK & 🇺🇸 USA", items: [
      { name: "Commonwealth Scholarships", meta: "UK · full, for developing countries", note: "Via national nominating agency" },
      { name: "Fulbright", meta: "USA · full master's/PhD funding", note: "Apply ~12–15 months ahead" },
    ] }),
    listSlide({ title: "🇪🇺 Europe & 🇦🇺 Australia", items: [
      { name: "Erasmus Mundus", meta: "EU · full joint master's + travel", note: "Deadlines usually Dec–Feb" },
      { name: "Australia Awards", meta: "Australia · full (Australian Gov)", note: "Eligible countries only" },
    ] }),
    listSlide({ title: "🇳🇿 New Zealand & 🇨🇦 Canada", items: [
      { name: "Manaaki NZ Scholarships", meta: "New Zealand · full (NZ Gov)", note: "Selected countries" },
      { name: "Vanier CGS", meta: "Canada · CAD 50,000/yr · PhD", note: "Nominated by the university" },
    ] }),
    listSlide({ title: "🇬🇧 UK & 🇺🇸 USA — top-tier", items: [
      { name: "Gates Cambridge", meta: "UK · full · University of Cambridge", note: "One round per year" },
      { name: "Knight-Hennessy", meta: "USA · full · Stanford University", note: "Any Stanford grad programme" },
    ] }),
    ctaSlide({ headline: "Find scholarships you actually qualify for", sub: "Free scholarship finder by country, field & eligibility — no signup.", button: "landingprep.com → Scholarships" }),
  ],
  "ielts-bands": [
    coverSlide({ kicker: "SAVE THIS 📌", title: "The IELTS Band You Actually Need", sub: "By country, for 2026. Don't overpay for scores you don't need 👇" }),
    listSlide({ title: "🎓 Study — band needed", items: [
      { name: "🇬🇧 United Kingdom", meta: "6.0–6.5 overall (UG/PG); often 5.5+ per band" },
      { name: "🇨🇦 Canada", meta: "6.0–6.5; many programmes want 6.0 each band" },
      { name: "🇦🇺 Australia", meta: "6.0–6.5 overall; varies by course & visa" },
      { name: "🇺🇸 USA", meta: "6.5–7.0 (varies a lot by university)" },
    ] }),
    listSlide({ title: "🎓 Study — band needed", items: [
      { name: "🇩🇪 Germany", meta: "6.5 for most English-taught master's" },
      { name: "🇮🇪 Ireland", meta: "6.5 overall for most universities" },
      { name: "🇳🇿 New Zealand", meta: "6.0–6.5 overall depending on level" },
      { name: "🛂 Canada PR", meta: "CLB 7 = IELTS 6.0 in each band (Express Entry)" },
    ] }),
    ctaSlide({ headline: "Know your exact target — then hit it free", sub: "Free IELTS↔CLB & score converter + full mock tests. Always confirm with your university.", button: "landingprep.com → Free tools" }),
  ],
  "visa-docs": [
    coverSlide({ kicker: "SAVE THIS 📌 · DON'T GET REJECTED", title: "Student Visa Documents Checklist", sub: "Miss one and your visa gets delayed. Save it for application day 👇" }),
    listSlide({ title: "✅ The essentials", items: [
      { name: "1 · Valid passport", meta: "Valid 6+ months beyond your stay" },
      { name: "2 · Acceptance letter", meta: "CAS (UK) / I-20 (USA) / LOA (Canada)" },
      { name: "3 · Proof of funds", meta: "Blocked account / GIC / bank statements" },
      { name: "4 · English test score", meta: "IELTS / TOEFL / PTE — meets the requirement" },
    ] }),
    listSlide({ title: "✅ Don't forget these", items: [
      { name: "5 · Academic transcripts", meta: "10th, 12th & degree certificates" },
      { name: "6 · SOP / statement", meta: "Genuine, consistent study plan" },
      { name: "7 · Visa form + fee", meta: "Correct form, paid, with receipt" },
      { name: "8 · Photos · 9 · Insurance · 10 · Police clearance", meta: "Visa-spec photos, health cover, PCC where required" },
    ] }),
    ctaSlide({ headline: "Get the full, country-by-country checklist", sub: "Free documents checklist + visa interview questions — no signup.", button: "landingprep.com → Study Abroad" }),
  ],
};

// ── Render ───────────────────────────────────────────────────────────────────
function renderPng(svg, w) {
  return new Resvg(svg, { fitTo: { mode: "width", value: w || W }, font: { loadSystemFonts: true } }).render().asPng();
}
fs.mkdirSync(OUT, { recursive: true });
let total = 0;
for (const [name, slides] of Object.entries(CAROUSELS)) {
  const dir = path.join(OUT, name);
  fs.mkdirSync(dir, { recursive: true });
  slides.forEach((svg, i) => {
    const png = renderPng(svg);
    fs.writeFileSync(path.join(dir, "slide-" + String(i + 1).padStart(2, "0") + ".png"), png);
    total++;
  });
  console.log("  ✓ " + name + " — " + slides.length + " slides → marketing/carousels/" + name + "/");
}
console.log("Generated " + total + " carousel slides (1080×1080 PNG) for @landing_prep.");
