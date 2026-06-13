// IG story-highlight covers (square, shown as circles) in brand style
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const OUT = path.resolve(__dirname, "..", "brand", "highlights");
fs.mkdirSync(OUT, { recursive: true });
const NAVY = "#101828", BLUE = "#2563EB", GREEN = "#10B981";
const st = `fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"`;
// icons centered around (100,100) in a 200 box
const icons = {
  visa: `<rect x="58" y="34" width="84" height="132" rx="12" ${st}/><circle cx="100" cy="78" r="20" ${st}/><line x1="78" y1="118" x2="122" y2="118" ${st}/><line x1="78" y1="140" x2="110" y2="140" ${st}/>`,
  exams: `<path d="M100 40 L168 72 L100 104 L32 72 Z" ${st}/><path d="M58 88 L58 126 Q100 150 142 126 L142 88" ${st}/><line x1="168" y1="72" x2="168" y2="120" ${st}/><circle cx="168" cy="128" r="7" fill="#34D399"/>`,
  scholarships: `<path d="M78 40 L72 96 M122 40 L128 96" ${st}/><circle cx="100" cy="120" r="44" ${st}/><path d="M100 98 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2 z" fill="#34D399"/>`,
  universities: `<path d="M30 78 L100 40 L170 78 Z" ${st}/><line x1="44" y1="92" x2="44" y2="150" ${st}/><line x1="76" y1="92" x2="76" y2="150" ${st}/><line x1="124" y1="92" x2="124" y2="150" ${st}/><line x1="156" y1="92" x2="156" y2="150" ${st}/><line x1="28" y1="162" x2="172" y2="162" ${st}/>`,
};
const labels = { visa: "VISA", exams: "EXAMS", scholarships: "SCHOLARSHIPS", universities: "UNIVERSITIES" };
async function make(key) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BLUE}"/><stop offset="1" stop-color="${GREEN}"/></linearGradient></defs>
  <rect width="1080" height="1080" fill="${NAVY}"/>
  <circle cx="540" cy="540" r="430" fill="none" stroke="url(#r)" stroke-width="14"/>
  <g transform="translate(290 250) scale(2.5)">${icons[key]}</g>
  <text x="540" y="800" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="900" letter-spacing="2" fill="#fff">${labels[key]}</text>
  </svg>`;
  fs.writeFileSync(path.join(OUT, key + ".svg"), svg);
  await sharp(Buffer.from(svg)).png().toBuffer().then((b) => fs.writeFileSync(path.join(OUT, key + ".png"), b));
}
(async () => { for (const k of Object.keys(icons)) await make(k); console.log("highlight covers:", fs.readdirSync(OUT).filter((f) => f.endsWith(".png")).join(", ")); })();
