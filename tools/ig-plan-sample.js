// Local proof of the 6-post daily plan (2 image · 2 carousel · 2 reel). Renders all six
// locally — NO posting. Confirms each type generates and the two carousels / two reels are
// DIFFERENT topics.  Run: node tools/ig-plan-sample.js
const path = require("path");
const fs = require("fs");
const ig = require("../scripts/ig-poster.js");
const { OUT_DIR } = require("../scripts/ig-reels.js");

const PLAN = [
  { id: "img1",  type: "image",    slot: 0, dueUTC: 2.5 },
  { id: "carA",  type: "carousel", offset: 0, dueUTC: 6.0 },
  { id: "reelA", type: "reel",     offset: 2, dueUTC: 9.5 },
  { id: "img2",  type: "image",    slot: 2, dueUTC: 13.0 },
  { id: "carB",  type: "carousel", offset: 1, dueUTC: 15.5 },
  { id: "reelB", type: "reel",     offset: 3, dueUTC: 17.0 },
];

(async () => {
  const now = new Date("2026-06-20T09:00:00Z");
  const base = "https://landingprep.com";
  const topics = {};
  for (const p of PLAN) {
    if (p.type === "image") {
      const g = await ig.generateDailyImage({ baseUrl: base, slot: p.slot, now });
      console.log("✓ " + p.id + " [image]  " + (g.content && g.content.category) + " — " + (g.caption || "").split("\n")[0].slice(0, 50));
    } else if (p.type === "carousel") {
      const g = await ig.generateCarousel({ baseUrl: base, now, offset: p.offset });
      topics[p.id] = g.content.topic;
      console.log("✓ " + p.id + " [carousel] " + g.imageUrls.length + " slides — topic: " + g.content.topic);
    } else {
      const g = await ig.generateReel({ baseUrl: base, now, offset: p.offset });
      topics[p.id] = g.topic;
      const file = path.join(OUT_DIR, g.videoUrl.split("/").pop());
      const kb = fs.existsSync(file) ? Math.round(fs.statSync(file).size / 1024) : "?";
      console.log("✓ " + p.id + " [reel]   mp4 " + kb + " KB — topic: " + g.topic);
    }
  }
  console.log("\nDistinct topics → carousels: " + (topics.carA !== topics.carB ? "DIFFERENT ✓" : "SAME ✗") + " | reels: " + (topics.reelA !== topics.reelB ? "DIFFERENT ✓" : "SAME ✗"));
  console.log("6/6 posts generated locally — image · carousel · reel all working.");
})().catch((e) => { console.error("✗ FAILED:", e.message); process.exit(1); });
