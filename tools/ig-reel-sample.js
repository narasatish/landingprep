// Local proof: render real carousel slides → build a Reel video. No posting. Run:
//   node tools/ig-reel-sample.js
const path = require("path");
const { execFileSync } = require("child_process");
const ig = require("../scripts/ig-poster.js");
const { buildReel, pickMusic, OUT_DIR } = require("../scripts/ig-reels.js");

(async () => {
  const now = new Date("2026-06-20T09:00:00Z");
  const car = await ig.generateCarousel({ baseUrl: "https://landingprep.com", now });
  const slidePaths = car.imageUrls.map((u) => path.join(OUT_DIR, u.split("/").pop()));
  console.log("✓ slides rendered:", slidePaths.length, "| topic:", car.content.topic);

  const out = path.join(OUT_DIR, "reel-sample.mp4");
  await buildReel({ slidePaths, per: 2.6, music: pickMusic(0), out });

  const fs = require("fs");
  const kb = Math.round(fs.statSync(out).size / 1024);
  let info = "";
  try { execFileSync(require("ffmpeg-static"), ["-i", out], { stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { const s = (e.stderr || "").toString(); const d = (s.match(/Duration: [^,]+/) || [])[0]; const v = (s.match(/Video: [^\n]+\d+x\d+[^\n]*/) || [])[0]; info = (d || "") + " | " + (v || ""); }
  console.log("✓ REEL BUILT: reel-sample.mp4 (" + kb + " KB) " + info);
})().catch((e) => { console.error("✗ FAILED:", e.message); process.exit(1); });
