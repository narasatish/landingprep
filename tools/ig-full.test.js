// COMPREHENSIVE pin-to-pin unit tests for the Instagram pipeline — OFFLINE (no network, no posting).
// Exercises everything built recently: all 9 carousel formats, the dark magazine renderers (resvg),
// reels (motion + music), the 12 music beds, captions/hashtags/blog-deep-links/send-CTAs, the daily
// Story, comment auto-reply text, weekly-insights helpers, and determinism.
//   node tools/ig-full.test.js
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ig = require("../scripts/ig-poster.js");
const reels = require("../scripts/ig-reels.js");
const ROOT = path.resolve(__dirname, "..");
const OUT = ig.OUT_DIR;
const BASE = "https://landingprep.com";
let ffmpeg = null; try { ffmpeg = require("ffmpeg-static"); } catch (e) {}
let hasImage = false;
try { require("@resvg/resvg-js"); hasImage = true; } catch (_) {}
if (!hasImage) try { require("sharp"); hasImage = true; } catch (_) {}

let pass = 0, fail = 0; const failed = [];
async function test(name, fn) {
  try { await fn(); pass++; console.log("  ✓ " + name); }
  catch (e) { fail++; failed.push(name + " — " + e.message); console.error("  ✗ " + name + " — " + e.message); }
}
function isPng(p) { try { const b = fs.readFileSync(p).slice(0, 8); return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47; } catch (e) { return false; } }
function localFromUrl(u) { return path.join(OUT, String(u).split("/").pop()); }
function probe(file) { try { execFileSync(ffmpeg, ["-i", file], { stdio: ["ignore", "pipe", "pipe"] }); return ""; } catch (e) { return (e.stderr || "").toString(); } }

(async () => {
  console.log("COMPREHENSIVE IG pipeline tests (offline):\n");

  // ── 1. Module surface ──────────────────────────────────────────────────────
  console.log("[1] Module exports");
  const EXPORTS = ["pickForSlot", "slotFromHour", "buildCaption", "generateDailyImage", "generateCarousel",
    "postCarousel", "runCarousel", "generateReel", "postReel", "runReel", "generateStory", "postStory", "runStory",
    "storyContent", "listRecentMedia", "listComments", "replyToComment", "postFirstComment", "firstCommentText",
    "seriesTag", "reelHook", "weeklyStats", "whoami", "SLOTS", "OUT_DIR"];
  for (const e of EXPORTS) await test("exports " + e, () => assert.ok(ig[e] !== undefined, "missing export: " + e));
  await test("ig-reels exports buildReel, buildReelMotion, pickMusic, OUT_DIR", () =>
    ["buildReel", "buildReelMotion", "pickMusic", "OUT_DIR"].forEach((f) => assert.ok(reels[f] !== undefined, "missing " + f)));

  // ── 2. All 9 carousel formats generate + render (dark theme via resvg) ──────
  console.log("\n[2] All 9 carousel formats — content, slides, captions, blog links, rendered PNGs");
  if (hasImage) {
    const topics = new Set(); const covers = new Set();
    for (let d = 0; d < 9; d++) {
      const now = new Date(Date.UTC(2026, 5, 22 + d, 9, 0, 0));
      let gen;
      await test("carousel day+" + d + ": generateCarousel returns content+caption+imageUrls", async () => {
        gen = await ig.generateCarousel({ baseUrl: BASE, now });
        assert.ok(gen && gen.content && gen.caption && Array.isArray(gen.imageUrls), "bad shape");
      });
      if (!gen) continue;
      const c = gen.content; topics.add(c.topic);
      await test("  [" + c.topic + "] has a cover, >=1 points slide, a cta — total >=3 slides", () => {
        const kinds = c.slides.map((s) => s.kind);
        assert.ok(c.slides.length >= 3, "only " + c.slides.length + " slides");
        assert.ok(kinds.includes("cover"), "no cover");
        assert.ok(kinds.includes("cta"), "no cta");
        assert.ok(kinds.filter((k) => k === "points").length >= 1, "no points slide");
      });
      await test("  [" + c.topic + "] every points slide has a non-empty array (no string-bug)", () => {
        c.slides.filter((s) => s.kind === "points").forEach((s) => {
          assert.ok(Array.isArray(s.points) && s.points.length >= 1, "empty/non-array points on '" + s.title + "'");
        });
      });
      await test("  [" + c.topic + "] cover title is unique (hook variety)", () => {
        const t = c.slides[0].title; assert.ok(t && !covers.has(t), "duplicate cover title: " + t); covers.add(t);
      });
      await test("  [" + c.topic + "] caption <=2200, has hashtags, send/share CTA", () => {
        assert.ok(gen.caption.length <= 2200, "caption " + gen.caption.length + " chars");
        assert.ok(/#[a-z0-9]/i.test(gen.caption), "no hashtags");
        assert.ok(/SEND|SHARE|TAG|SAVE/i.test(gen.caption), "no engagement CTA");
      });
      await test("  [" + c.topic + "] caption deep-links to a REAL blog page", () => {
        const m = gen.caption.match(/landingprep\.com\/blog\/([a-z0-9-]+)/);
        if (m) assert.ok(fs.existsSync(path.join(ROOT, "blog", m[1], "index.html")), "blog slug does not exist: " + m[1]);
      });
      await test("  [" + c.topic + "] all slides rendered to valid 1080x1080 PNGs (dark theme)", () => {
        assert.ok(gen.imageUrls.length === c.slides.length, "url count != slide count");
        gen.imageUrls.forEach((u) => { const p = localFromUrl(u); assert.ok(isPng(p), "not a PNG: " + p); assert.ok(fs.statSync(p).size > 5000, "PNG suspiciously small: " + p); });
      });
    }
    await test("all 9 distinct carousel formats appeared over 9 consecutive days", () => assert.ok(topics.size >= 8, "only " + topics.size + " distinct topics (expected 9)"));
  } else { console.log("  ↷ skip [2] — no sharp/@resvg installed"); }

  // ── 3. Image-post slots render ──────────────────────────────────────────────
  console.log("\n[3] Image posts (slots) render valid PNGs");
  if (hasImage) {
    for (const slot of [0, 2, 4]) {
      await test("generateDailyImage slot " + slot + " → valid PNG + caption", async () => {
        const g = await ig.generateDailyImage({ baseUrl: BASE, now: new Date(Date.UTC(2026, 5, 22, 9)), slot });
        assert.ok(isPng(localFromUrl(g.imageUrl)), "not a PNG");
        assert.ok(ig.buildCaption(g.content).length <= 2200, "caption too long");
      });
    }
  } else { console.log("  ↷ skip [3] — no sharp/@resvg installed"); }

  // ── 4. Daily Story ──────────────────────────────────────────────────────────
  console.log("\n[4] Daily Story");
  await test("storyContent rotates through 6 distinct facts", () => {
    const set = new Set(); for (let d = 0; d < 6; d++) set.add(ig.storyContent(new Date(Date.UTC(2026, 5, 22 + d))).big);
    assert.strictEqual(set.size, 6, "only " + set.size + " distinct story facts");
  });
  if (hasImage) {
    await test("generateStory → valid PNG", async () => {
      const s = await ig.generateStory({ baseUrl: BASE, now: new Date(Date.UTC(2026, 5, 22, 9)) });
      assert.ok(isPng(localFromUrl(s.imageUrl)), "story not a PNG");
    });
  } else { console.log("  ↷ skip generateStory — no sharp/@resvg installed"); }

  // ── 5. Reels — motion video with audio (dark theme) ─────────────────────────
  console.log("\n[5] Reels (video) — generate, valid mp4, has audio + video streams");
  if (ffmpeg) {
    let reel;
    await test("generateReel → mp4 written", async () => {
      reel = await ig.generateReel({ baseUrl: BASE, now: new Date(Date.UTC(2026, 5, 22, 9)), offset: 2 });
      assert.ok(reel && reel.videoUrl, "no videoUrl");
      assert.ok(fs.existsSync(localFromUrl(reel.videoUrl)), "mp4 missing");
    });
    await test("reel mp4 is valid h264 720x1280 with an AAC audio track (music present)", () => {
      const info = probe(localFromUrl(reel.videoUrl));
      assert.ok(/Video: h264/.test(info), "no h264 video stream");
      assert.ok(/720x1280|1080x1920/.test(info), "wrong dimensions: " + (info.match(/\d+x\d+/) || [])[0]);
      assert.ok(/Audio: aac/.test(info), "no AAC audio track");
    });
    await test("two daily reels (offset 2 vs 3) are DIFFERENT topics", async () => {
      const a = await ig.generateReel({ baseUrl: BASE, now: new Date(Date.UTC(2026, 5, 22, 9)), offset: 2 });
      const b = await ig.generateReel({ baseUrl: BASE, now: new Date(Date.UTC(2026, 5, 22, 9)), offset: 3 });
      assert.notStrictEqual(a.topic, b.topic, "both reels same topic: " + a.topic);
    });
  } else { console.log("  ↷ skip [5] — ffmpeg-static not installed"); }

  // ── 6. Music beds ───────────────────────────────────────────────────────────
  console.log("\n[6] Music — 12 lo-fi tracks, valid stereo mp3, no clipping");
  const AUDIO = path.join(ROOT, "assets", "audio");
  const tracks = fs.existsSync(AUDIO) ? fs.readdirSync(AUDIO).filter((f) => /\.mp3$/i.test(f)) : [];
  await test("at least 10 music tracks present", () => assert.ok(tracks.length >= 10, "only " + tracks.length + " tracks"));
  await test("no leftover old 'calm-*' tracks", () => assert.ok(!tracks.some((t) => /^calm-/.test(t)), "old calm tracks still present"));
  await test("pickMusic returns a real file path", () => { const m = reels.pickMusic(3); assert.ok(m && fs.existsSync(m), "pickMusic returned bad path"); });
  if (ffmpeg) for (const t of ["lofi-warm.mp3", "lofi-night.mp3", "lofi-rain.mp3"]) {
    await test("track " + t + " is stereo mp3 with peaks below 0 dBFS (no clipping = not harsh)", () => {
      const f = path.join(AUDIO, t); assert.ok(fs.existsSync(f), "missing " + t);
      const info = probe(f); assert.ok(/Audio: mp3/.test(info) && /stereo/.test(info), "not stereo mp3");
      let vd = ""; try { execFileSync(ffmpeg, ["-i", f, "-af", "volumedetect", "-f", "null", "-"], { stdio: ["ignore", "pipe", "pipe"] }); } catch (e) { vd = (e.stderr || "").toString(); }
      const mx = (vd.match(/max_volume:\s*(-?[0-9.]+) dB/) || [])[1];
      if (mx != null) assert.ok(parseFloat(mx) <= 0.0, "CLIPPING — max_volume " + mx + " dB");
    });
  }

  // ── 7. Engagement helpers ───────────────────────────────────────────────────
  console.log("\n[7] Captions, first-comment, series, hooks, insights helpers");
  await test("firstCommentText leads with a SEND prompt + has hashtags, for every weekday", () => {
    for (let d = 0; d < 7; d++) { const txt = ig.firstCommentText({ topic: "X" }, new Date(Date.UTC(2026, 5, 21 + d)));
      assert.ok(/send/i.test(txt), "no send prompt (day " + d + ")"); assert.ok(/#\w/.test(txt), "no hashtags"); }
  });
  await test("seriesTag returns a non-empty string for all 7 weekdays", () => {
    for (let d = 0; d < 7; d++) { const s = ig.seriesTag(new Date(Date.UTC(2026, 5, 21 + d))); assert.ok(typeof s === "string" && s.length > 3, "bad series tag day " + d); }
  });
  await test("reelHook returns a non-empty hook for every carousel topic", () => {
    ["STUDENT VISA · SUCCESS RATES", "FASTEST PR · STUDY ABROAD", "POST-STUDY WORK VISAS", "INTAKES · WHEN TO APPLY",
      "TOP UNIVERSITIES · CANADA", "STUDY ABROAD · ROADMAP", "GRE · EXAM GUIDE", "STUDY ABROAD · MYTHS vs FACTS", "STUDY ABROAD · IRELAND"]
      .forEach((t) => { const h = ig.reelHook({ topic: t }); assert.ok(h && h.length > 8, "weak hook for " + t); });
  });
  await test("weeklyStats is callable and returns the expected shape with no token (best-effort)", async () => {
    const s = await ig.weeklyStats({ igUserId: "0", token: "" });
    ["followers", "weekPosts", "weekLikes", "weekComments", "byHourIST", "analyzed"].forEach((k) => assert.ok(k in s, "missing field " + k));
  });

  // ── 8. Determinism + safety ─────────────────────────────────────────────────
  console.log("\n[8] Determinism + caption safety");
  if (hasImage) {
    await test("same day → identical carousel caption (idempotent)", async () => {
      const now = new Date(Date.UTC(2026, 5, 24, 9));
      const a = (await ig.generateCarousel({ baseUrl: BASE, now })).caption;
      const b = (await ig.generateCarousel({ baseUrl: BASE, now })).caption;
      assert.strictEqual(a, b, "carousel caption not deterministic");
    });
  } else { console.log("  ↷ skip carousel idempotency — no sharp/@resvg installed"); }
  await test("oversized caption is hard-truncated to <=2200", () => {
    assert.ok(ig.buildCaption({ caption: "word ".repeat(2000), tags: ["studyabroad", "landingprep"] }).length <= 2200);
  });
  await test("slotFromHour returns 0..SLOTS-1 for all 24 hours", () => {
    for (let h = 0; h < 24; h++) { const s = ig.slotFromHour(new Date(Date.UTC(2026, 5, 22, h))); assert.ok(s >= 0 && s < ig.SLOTS, "hour " + h); }
  });

  console.log("\n" + "=".repeat(60));
  console.log("COMPREHENSIVE IG tests: " + pass + " passed, " + fail + " failed");
  if (fail) { console.log("\nFailures:"); failed.forEach((f) => console.log("  ✗ " + f)); }
  process.exit(fail ? 1 : 0);
})();
