// Refines logo #02 (plane + cap) into a final brand pack. Outputs to /brand.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const OUT = path.resolve(__dirname, "..", "brand");
fs.mkdirSync(OUT, { recursive: true });

const NAVY = "#101828", BLUE = "#2563EB", GREEN = "#10B981", SOFT = "#F8FAFC", GREY = "#667085";
// brand mark (plane + grad cap), original coords ~ x330-765 y230-635, center (547.5,432.5)
const GRAD = (id) => `<linearGradient id="${id}" x1="330" y1="230" x2="765" y2="635" gradientUnits="userSpaceOnUse"><stop stop-color="${BLUE}"/><stop offset="1" stop-color="${GREEN}"/></linearGradient>`;
function markRaw(planeFill, capFill, tassel) {
  return `<path d="M330 345 L765 230 L624 635 L540 475 L424 595 L475 430 Z" fill="${planeFill}"/>` +
    `<path d="M475 430 L765 230 L540 475 Z" fill="#FFFFFF" opacity="0.30"/>` +
    `<g transform="translate(428 250) rotate(-9)"><path d="M0 65 L112 20 L224 65 L112 110 Z" fill="${capFill}"/>` +
    `<path d="M55 95 C85 120 140 120 170 95 L170 146 C130 171 95 171 55 146 Z" fill="${capFill}"/>` +
    `<path d="M224 65 L224 132" stroke="${tassel}" stroke-width="11" stroke-linecap="round"/><circle cx="224" cy="148" r="16" fill="${tassel}"/></g>`;
}
function placeMark(cx, cy, size, planeFill, capFill, tassel) {
  const s = size / 435, tx = cx - 547.5 * s, ty = cy - 432.5 * s;
  return `<g transform="translate(${tx} ${ty}) scale(${s})">${markRaw(planeFill, capFill, tassel)}</g>`;
}
async function save(name, svg, w, h) {
  fs.writeFileSync(path.join(OUT, name + ".svg"), svg);
  await sharp(Buffer.from(svg)).png().toBuffer().then((b) => fs.writeFileSync(path.join(OUT, name + ".png"), b));
}

// 1) App icon — soft bg + white circle + colored mark
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs>${GRAD("g1")}<filter id="s1" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="22" flood-color="${NAVY}" flood-opacity="0.16"/></filter></defs><rect width="1080" height="1080" rx="220" fill="${SOFT}"/><circle cx="540" cy="540" r="300" fill="#fff" filter="url(#s1)"/>${placeMark(540, 545, 470, "url(#g1)", NAVY, GREEN)}</svg>`;
// 2) IG profile avatar — premium navy frame + white circle + colored mark
const profile = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><defs>${GRAD("g2")}</defs><rect width="1080" height="1080" rx="220" fill="${NAVY}"/><circle cx="540" cy="540" r="360" fill="#fff"/>${placeMark(540, 545, 560, "url(#g2)", NAVY, GREEN)}</svg>`;
// 3) Horizontal lockup — mark + wordmark + tagline (white bg)
const horiz = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="520" viewBox="0 0 1600 520"><defs>${GRAD("g3")}</defs><rect width="1600" height="520" rx="40" fill="#fff"/>${placeMark(250, 250, 360, "url(#g3)", NAVY, GREEN)}<text x="470" y="280" font-family="Inter, Arial, sans-serif" font-size="150" font-weight="800" letter-spacing="-6"><tspan fill="${NAVY}">Landing</tspan><tspan fill="${BLUE}">Prep</tspan></text><text x="476" y="350" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="600" fill="${GREY}">Prepare. Apply. Land Your Future.</text></svg>`;
// 4) Monochrome white mark (for dark backgrounds / watermark)
const white = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080"><rect width="1080" height="1080" rx="220" fill="${BLUE}"/><circle cx="540" cy="540" r="360" fill="rgba(255,255,255,0.0)"/>${placeMark(540, 545, 560, "#fff", "#fff", GREEN)}</svg>`;

(async () => {
  await save("landingprep-icon", icon);
  await save("landingprep-profile", profile);
  await save("landingprep-horizontal", horiz);
  await save("landingprep-icon-blue", white);
  console.log("brand pack written to /brand:", fs.readdirSync(OUT).join(", "));
})();
