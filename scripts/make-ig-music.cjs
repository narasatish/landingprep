#!/usr/bin/env node
"use strict";
/*
 * Generates ORIGINAL calm ambient music beds for the Instagram Reels, straight from ffmpeg —
 * no downloads, no copyright risk, no external dependency (Instagram business accounts mute
 * licensed/copyrighted audio anyway, so original pads are the only thing that survives + plays).
 *
 * Each track is a warm, slow-breathing chord pad (sine partials + gentle tremolo + soft echo
 * "room" + slow stereo drift) — the kind of peaceful lo-fi/ambient that suits study slides and
 * images without distracting from the text. Loopable; the reel builder loops whichever it picks.
 *
 *   node scripts/make-ig-music.cjs           # build any missing tracks
 *   node scripts/make-ig-music.cjs --force   # rebuild all
 *
 * Output: assets/audio/*.mp3  (ig-reels.js → pickMusic() rotates through them daily).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

const ROOT = path.resolve(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "assets", "audio");
const DUR = 36;          // seconds — long enough to feel evolving; reel loops it anyway
const SR = 44100;

// Calm chord pads. Frequencies in Hz (low octaves = warm). Each partial breathes on its own
// slow LFO so the pad never sounds static. amp kept low so it sits UNDER the visuals.
const TRACKS = [
  { name: "calm-dawn",   chord: [130.81, 164.81, 196.00, 293.66], mood: "C add9 — soft, hopeful morning" },
  { name: "calm-focus",  chord: [110.00, 130.81, 164.81, 246.94], mood: "A min9 — lo-fi study calm" },
  { name: "calm-uplift", chord: [146.83, 185.00, 220.00, 277.18], mood: "D maj7 — gentle, uplifting" },
  { name: "calm-night",  chord: [ 98.00, 123.47, 146.83, 196.00], mood: "G — deep, peaceful evening" },
  { name: "calm-clarity",chord: [123.47, 155.56, 185.00, 246.94], mood: "B min — clean, focused" },
];

// Build the aevalsrc expression: each partial = sine * its own slow amplitude LFO (breathing).
function chordExpr(freqs) {
  const amps = [0.20, 0.16, 0.13, 0.10];
  const lfos = [0.05, 0.07, 0.06, 0.04];   // very slow Hz so it "breathes" over ~15-25s
  return freqs.map((f, i) =>
    `${amps[i]}*sin(2*PI*${f}*t)*(${(0.65).toFixed(2)}+${(0.35).toFixed(2)}*sin(2*PI*${lfos[i]}*t))`
  ).join("+");
}

function build(track, out) {
  const expr = chordExpr(track.chord);
  const af = [
    "lowpass=f=1100",                              // warmth — shave harsh highs
    "aecho=0.8:0.9:140:0.22",                      // soft room/reverb tail
    "aformat=channel_layouts=stereo",
    "apulsator=hz=0.07:width=0.35",                // slow, soothing stereo drift
    "tremolo=f=0.12:d=0.18",                        // barely-there shimmer
    `afade=t=in:st=0:d=4`,                          // gentle 4s swell in
    `afade=t=out:st=${DUR - 4}:d=4`,                // 4s fade out (clean loop point)
    "volume=0.9",
  ].join(",");
  const args = [
    "-y",
    "-f", "lavfi", "-i", `aevalsrc='${expr}':d=${DUR}:s=${SR}`,
    "-af", af,
    "-c:a", "libmp3lame", "-q:a", "4", "-ar", String(SR),
    out,
  ];
  execFileSync(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"], timeout: 120000 });
}

(function main() {
  const force = process.argv.includes("--force");
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  let made = 0;
  for (const t of TRACKS) {
    const out = path.join(AUDIO_DIR, t.name + ".mp3");
    if (!force && fs.existsSync(out) && fs.statSync(out).size > 1000) { console.log("· kept   " + t.name + ".mp3"); continue; }
    try {
      build(t, out);
      const kb = Math.round(fs.statSync(out).size / 1024);
      console.log("✓ built  " + t.name + ".mp3  (" + kb + " KB) — " + t.mood);
      made++;
    } catch (e) {
      console.error("✗ failed " + t.name + ": " + String(e.message).slice(0, 160));
    }
  }
  console.log(made ? ("\n" + made + " ambient track(s) ready in assets/audio/") : "\nAll tracks already present.");
})();
