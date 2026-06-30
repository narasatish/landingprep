// Instagram Reels generator — turns a set of slide PNGs (the same ones the carousel uses)
// into a lightweight 720×1280 vertical video. Settings are deliberately LIGHT (720p, 24fps,
// ultrafast, single-thread) so it never OOM-kills on a free Render dyno. Optional music bed
// from /assets/audio/*.mp3 (royalty-free); otherwise a silent track is added so the file is
// always a valid Reel.  Used by ig-poster.js → generateReel/runReel.
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
let ffmpegPath = null; try { ffmpegPath = require("ffmpeg-static"); } catch (e) { /* optional — only needed at deploy time on Render */ }

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "ig-out");
const AUDIO_DIR = path.join(ROOT, "assets", "audio");

// Pick a royalty-free music bed if the brand dropped any into /assets/audio (rotates daily).
function pickMusic(dayN) {
  try {
    const files = fs.readdirSync(AUDIO_DIR).filter((f) => /\.(mp3|m4a|aac|wav)$/i.test(f));
    if (files.length) return path.join(AUDIO_DIR, files[Math.abs(dayN || 0) % files.length]);
  } catch (e) { /* no audio dir */ }
  return null;
}

// slidePaths: absolute paths to the slide PNGs (cover → points → CTA), in order.
// Returns the output .mp4 path. Each slide shows for `per` seconds.
function buildReel({ slidePaths, per = 2.6, music = null, out }) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(slidePaths) || !slidePaths.length) return reject(new Error("buildReel: no slides"));
    const W = 720, H = 1280, FPS = 24;
    const listPath = out.replace(/\.mp4$/i, "") + "-list.txt";
    // ffconcat demuxer: hold each image for `per` seconds (last frame repeated so it isn't clipped).
    let list = "ffconcat version 1.0\n";
    for (const p of slidePaths) list += "file '" + p.replace(/'/g, "'\\''") + "'\nduration " + per + "\n";
    list += "file '" + slidePaths[slidePaths.length - 1].replace(/'/g, "'\\''") + "'\n";
    fs.writeFileSync(listPath, list);

    // scale to fit, pad to 9:16 on the brand colour, force yuv420p (Instagram requirement).
    const vf = "scale=" + W + ":" + H + ":force_original_aspect_ratio=decrease,pad=" + W + ":" + H + ":(ow-iw)/2:(oh-ih)/2:color=0x1e1b4b,format=yuv420p";
    const args = ["-y", "-f", "concat", "-safe", "0", "-i", listPath];
    if (music) args.push("-stream_loop", "-1", "-i", music);           // loop music to cover the video
    else args.push("-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100");
    args.push(
      "-vf", vf, "-r", String(FPS),
      "-c:v", "libx264", "-preset", "ultrafast", "-threads", "1", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart",
      out
    );
    execFile(ffmpegPath, args, { timeout: 150000, maxBuffer: 32 * 1024 * 1024 }, (err) => {
      try { fs.unlinkSync(listPath); } catch (e) {}
      if (err) return reject(new Error("ffmpeg failed: " + String(err.message).slice(0, 240)));
      try { if (!fs.existsSync(out) || fs.statSync(out).size < 1000) return reject(new Error("reel output missing/empty")); } catch (e) { return reject(e); }
      resolve(out);
    });
  });
}

// MOTION version — a gentle Ken-Burns slow-zoom on each slide so the Reel isn't a static slideshow.
// Watch time / completion is the #1 Reels ranking signal in 2026; subtle motion lifts hold-rate.
// Heavier than buildReel, so generateReel falls back to the static build if this errors/times out.
function buildReelMotion({ slidePaths, per = 2.6, music = null, out }) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(slidePaths) || !slidePaths.length) return reject(new Error("buildReelMotion: no slides"));
    const W = 720, H = 1280, FPS = 24, frames = Math.round(per * FPS);
    const args = ["-y"];
    for (const p of slidePaths) args.push("-i", p);   // one still frame per slide; zoompan's d= generates the duration
    const aIdx = slidePaths.length;
    if (music) args.push("-stream_loop", "-1", "-i", music);
    else args.push("-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100");
    // Per-slide slow zoom-in (z 1.0→1.10), centred; then concat. yuv420p for Instagram.
    const zp = `zoompan=z='min(zoom+0.0010,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS}`;
    let fc = slidePaths.map((_, i) => `[${i}:v]${zp},format=yuv420p,setsar=1[v${i}]`).join(";");
    fc += ";" + slidePaths.map((_, i) => `[v${i}]`).join("") + `concat=n=${slidePaths.length}:v=1:a=0[v]`;
    args.push("-filter_complex", fc, "-map", "[v]", "-map", `${aIdx}:a`,
      "-c:v", "libx264", "-preset", "ultrafast", "-threads", "1", "-pix_fmt", "yuv420p", "-r", String(FPS),
      "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", out);
    execFile(ffmpegPath, args, { timeout: 200000, maxBuffer: 32 * 1024 * 1024 }, (err) => {
      if (err) return reject(new Error("ffmpeg(motion) failed: " + String(err.message).slice(0, 200)));
      try { if (!fs.existsSync(out) || fs.statSync(out).size < 1000) return reject(new Error("motion reel missing/empty")); } catch (e) { return reject(e); }
      resolve(out);
    });
  });
}

module.exports = { buildReel, buildReelMotion, pickMusic, OUT_DIR };
