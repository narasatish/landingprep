/* make-guide-pdf.cjs — generate the lead-magnet PDF "2026 Scholarships + Funding Guide"
   as branded A4 pages (SVG → PNG via resvg → embedded with pdf-lib). All figures are
   from official sources + LandingPrep's own guides (no fabrication).
   Run: node scripts/make-guide-pdf.cjs  →  marketing/2026-scholarships-funding-guide.pdf */
const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");
const { PDFDocument } = require("pdf-lib");

const W = 1240, H = 1754; // A4 portrait @ ~150 DPI
const INK = "#0f172a", SUB = "#475569", ACCENT = "#4F46E5", ACCENT2 = "#9333EA";
const esc = (s) => String(s).replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "").replace(/\s{2,}/g, " ").trim()
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(text, max) {
  const words = String(text).split(" "); const out = []; let l = "";
  for (const w of words) { if ((l + " " + w).trim().length > max && l) { out.push(l); l = w; } else l = (l ? l + " " : "") + w; }
  if (l) out.push(l); return out;
}
const defs = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ACCENT}"/><stop offset=".55" stop-color="#6D28D9"/><stop offset="1" stop-color="${ACCENT2}"/></linearGradient><linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${ACCENT}"/><stop offset="1" stop-color="${ACCENT2}"/></linearGradient></defs>`;
const footer = (c) => `<text x="${W / 2}" y="${H - 50}" text-anchor="middle" font-family="Arial" font-size="26" font-weight="600" fill="${c || SUB}">LandingPrep · 100% free study-abroad prep · landingprep.com</text>`;

function cover() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <circle cx="1040" cy="240" r="280" fill="#fff" opacity=".10"/><circle cx="180" cy="1500" r="320" fill="#fff" opacity=".10"/>
    <text x="110" y="300" font-family="Arial" font-size="34" font-weight="700" fill="rgba(255,255,255,.85)">FREE GUIDE · 2026</text>
    ${wrap("2026 Scholarships & Funding Guide", 16).map((l, i) => `<text x="110" y="${430 + i * 100}" font-family="Arial" font-size="88" font-weight="800" fill="#fff">${esc(l)}</text>`).join("")}
    ${wrap("Fully-funded scholarships, proof-of-funds by country, education loans, a month-by-month timeline and money-saving tips — everything to fund your study abroad.", 52).map((l, i) => `<text x="110" y="${780 + i * 52}" font-family="Arial" font-size="38" font-weight="500" fill="rgba(255,255,255,.93)">${esc(l)}</text>`).join("")}
    <rect x="110" y="1080" width="560" height="96" rx="48" fill="#fff"/><text x="390" y="1140" text-anchor="middle" font-family="Arial" font-size="38" font-weight="800" fill="${ACCENT}">100% free · no signup</text>
    ${footer("rgba(255,255,255,.85)")}</svg>`;
}
// content page: title + blocks [{h, body}]
function page(title, blocks) {
  let y = 320;
  const body = blocks.map((b) => {
    let s = "";
    if (b.h) { s += `<rect x="110" y="${y - 38}" width="12" height="46" rx="6" fill="url(#bar)"/><text x="140" y="${y}" font-family="Arial" font-size="42" font-weight="800" fill="${INK}">${esc(b.h)}</text>`; y += 64; }
    if (b.body) { for (const line of wrap(b.body, 74)) { s += `<text x="140" y="${y}" font-family="Arial" font-size="31" font-weight="400" fill="${SUB}">${esc(line)}</text>`; y += 46; } }
    y += 30;
    return s;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
    <rect width="${W}" height="${H}" fill="#F8FAFC"/>
    <rect x="0" y="0" width="${W}" height="200" fill="url(#bar)"/>
    <text x="110" y="125" font-family="Arial" font-size="52" font-weight="800" fill="#fff">${esc(title)}</text>
    ${body}${footer()}</svg>`;
}
function cta() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    ${wrap("Now go from funding to campus — free", 20).map((l, i) => `<text x="110" y="${500 + i * 92}" font-family="Arial" font-size="74" font-weight="800" fill="#fff">${esc(l)}</text>`).join("")}
    ${wrap("Practise 15+ exams with free mock tests, check your university chances, compare scholarships and visas — all free on LandingPrep.", 50).map((l, i) => `<text x="110" y="${760 + i * 52}" font-family="Arial" font-size="38" font-weight="500" fill="rgba(255,255,255,.95)">${esc(l)}</text>`).join("")}
    <rect x="110" y="1020" width="760" height="104" rx="52" fill="#fff"/><text x="490" y="1086" text-anchor="middle" font-family="Arial" font-size="40" font-weight="800" fill="${ACCENT}">Start free → landingprep.com</text>
    ${footer("rgba(255,255,255,.85)")}</svg>`;
}

// ── Content (accurate; verify exact figures with official sources before applying) ──
const PAGES = [
  cover(),
  page("Top fully-funded scholarships (1/2)", [
    { h: "DAAD — Germany", body: "Germany's academic exchange service funds international master's & PhD students with tuition support plus a monthly living stipend. Deadlines vary by programme; apply early through the DAAD scholarship database." },
    { h: "Chevening — UK", body: "The UK government's flagship award fully funds a one-year master's (tuition, living, travel). Applications typically open August–November. Strong leadership and work experience matter." },
    { h: "Commonwealth Scholarships — UK", body: "Full funding for students from eligible Commonwealth (mostly developing) countries, applied via your national nominating agency." },
    { h: "Fulbright — USA", body: "Prestigious full funding for master's/PhD study in the US; apply roughly 12–15 months before intake through your country's Fulbright commission." },
    { h: "Erasmus Mundus — EU", body: "Fully-funded joint master's degrees across multiple European universities, including tuition, a monthly allowance and travel. Deadlines usually December–February." },
  ]),
  page("Top fully-funded scholarships (2/2)", [
    { h: "Australia Awards — Australia", body: "Australian-government scholarships covering full tuition and living costs for students from eligible partner countries." },
    { h: "Manaaki New Zealand Scholarships", body: "New Zealand-government full scholarships for students from selected countries, covering tuition, living and travel." },
    { h: "Vanier CGS — Canada", body: "CAD 50,000 per year for doctoral study in Canada; you must be nominated by the Canadian university." },
    { h: "Gates Cambridge — UK", body: "Full-cost scholarship to study at the University of Cambridge, with one main application round per year." },
    { h: "Knight-Hennessy Scholars — USA", body: "Full funding for any graduate programme at Stanford University; highly competitive, single annual deadline." },
    { h: "Tip", body: "Most universities also offer their own merit scholarships — always check the university's financial-aid page after you get admission." },
  ]),
  page("Proof of funds by country (2026)", [
    { h: "How much you must show", body: "Germany: about EUR 11,904/year in a blocked account (Sperrkonto), ~EUR 992/month, via Fintiba or Expatrio." },
    { body: "Canada: about CAD 20,635 via a GIC for the SDS study-permit stream, returned to you in instalments after arrival." },
    { body: "UK: about GBP 1,334/month (London) or GBP 1,023/month (elsewhere) for up to 9 months, held 28 days." },
    { body: "Australia: about AUD 29,710/year in living costs as financial evidence under the Genuine Student requirement." },
    { body: "Ireland: about EUR 10,000/year shown to immigration. USA: the first-year cost of attendance for your university (varies)." },
    { h: "Always verify", body: "These figures change yearly. Confirm the current amount on the official immigration website before you apply or transfer money. Full live table: landingprep.com/study-abroad-funding-facts-2026/" },
  ]),
  page("Loans, timeline & money-saving tips", [
    { h: "Education loans", body: "Secured (with collateral) loans are typically ~8.5–11% p.a. — the cheapest option. Unsecured/no-collateral loans are ~11–15% p.a. with a per-lender limit. Most loans have a moratorium covering your course plus 6–12 months; paying the simple interest during study cuts the total a lot. Compare lenders on rate, limit and EMI." },
    { h: "Month-by-month timeline", body: "15–12 months: shortlist universities, book your English/standardised test. 12–9: take tests, draft SOP/LORs, apply for scholarships. 9–6: submit applications. 6–3: accept an offer, arrange funds (blocked account/GIC/loan). 3–1: apply for your visa, book accommodation and flights." },
    { h: "Money-saving tips", body: "Apply to a few scholarships in parallel; pick countries with low/zero tuition (e.g. Germany) where you only fund living costs; work part-time (most student visas allow ~20 hours/week); use free prep instead of paid coaching; and budget a 2–3% buffer for currency-conversion loss on transfers." },
  ]),
  cta(),
];

(async () => {
  fs.mkdirSync(path.join(__dirname, "..", "marketing"), { recursive: true });
  const pdf = await PDFDocument.create();
  const pgDir = path.join(__dirname, "..", "marketing", "guide-pages");
  fs.mkdirSync(pgDir, { recursive: true });
  let n = 0;
  for (const svg of PAGES) {
    const png = new Resvg(svg, { fitTo: { mode: "width", value: W }, font: { loadSystemFonts: true } }).render().asPng();
    fs.writeFileSync(path.join(pgDir, "page-" + String(++n).padStart(2, "0") + ".png"), png);
    const img = await pdf.embedPng(png);
    const pg = pdf.addPage([595.28, 841.89]); // A4 in points
    pg.drawImage(img, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  const out = path.join(__dirname, "..", "marketing", "2026-scholarships-funding-guide.pdf");
  fs.writeFileSync(out, await pdf.save());
  console.log("✓ PDF written: marketing/2026-scholarships-funding-guide.pdf (" + PAGES.length + " pages)");
})();
