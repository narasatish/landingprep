#!/usr/bin/env node
"use strict";
/*
 * Generates ORIGINAL warm lo-fi music beds for the Instagram Reels, straight from ffmpeg — no
 * downloads, no copyright risk (Instagram mutes licensed/copyrighted audio on business accounts,
 * so original music is the only thing that survives + plays).
 *
 * v2 — SMOOTH & WARM (the v1 sine pads sounded "hard"). Each track now layers:
 *   • a warm chord PAD (jazzy maj7/min7 — the classy lo-fi sound), gently breathing,
 *   • a soft SUB-BASS (root, one octave down) for warmth,
 *   • a plucked MELODY that arpeggiates the chord (phase-reset per note = clean, no clicks),
 * then a smoothing chain: heavy low-pass for warmth, soft reverb for space, a LIMITER so peaks
 * never sound harsh, and slow stereo drift. No tremolo, no clipping → smooth, calm, modern.
 *
 *   node scripts/make-ig-music.cjs           # build any missing tracks
 *   node scripts/make-ig-music.cjs --force   # rebuild all
 *
 * Output: assets/audio/lofi-*.mp3  (ig-reels.js → pickMusic() rotates through them daily).
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const ffmpegPath = require("ffmpeg-static");

const ROOT = path.resolve(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "assets", "audio");
const DUR = 40;          // seconds — long, evolving loop; the reel loops whatever slice it needs
const SR = 44100;
const STEP = 1.45;       // seconds per melody note (relaxed lo-fi tempo)

// Jazzy 7th chords (the classy lo-fi sound). [root, 3rd, 5th, 7th] in Hz, warm low-mid octave.
const TRACKS = [
  { name: "lofi-warm",    chord: [174.61, 220.00, 261.63, 329.63], mood: "Fmaj7 — warm, golden" },
  { name: "lofi-night",   chord: [110.00, 130.81, 164.81, 196.00], mood: "Am7 — mellow, late-night" },
  { name: "lofi-dream",   chord: [130.81, 164.81, 196.00, 246.94], mood: "Cmaj7 — bright, calm" },
  { name: "lofi-study",   chord: [146.83, 174.61, 220.00, 261.63], mood: "Dm7 — focused, soft" },
  { name: "lofi-float",   chord: [164.81, 196.00, 246.94, 293.66], mood: "Em7 — airy, dreamy" },
  { name: "lofi-sunset",  chord: [196.00, 246.94, 293.66, 369.99], mood: "Gmaj7 — golden-hour glow" },
  { name: "lofi-rain",    chord: [116.54, 146.83, 174.61, 220.00], mood: "Bbmaj7 — deep, rainy calm" },
  { name: "lofi-amber",   chord: [130.81, 155.56, 196.00, 233.08], mood: "Cm7 — moody, warm" },
  { name: "lofi-velvet",  chord: [155.56, 196.00, 233.08, 293.66], mood: "Ebmaj7 — smooth, plush" },
  { name: "lofi-drift",   chord: [123.47, 146.83, 185.00, 220.00], mood: "Bm7 — slow, reflective" },
  { name: "lofi-glow",    chord: [110.00, 138.59, 164.81, 207.65], mood: "Amaj7 — soft, hopeful" },
  { name: "lofi-mist",    chord: [146.83, 185.00, 220.00, 277.18], mood: "Dmaj7 — light, gentle" },
];

// Nested-if that selects the melody note frequency for the current step index.
function melodySelect(notes) {
  const total = (notes.length * STEP).toFixed(3);
  const idx = `floor(mod(t,${total})/${STEP})`;
  let e = notes[notes.length - 1].toFixed(2);
  for (let i = notes.length - 2; i >= 0; i--) e = `if(eq(${idx},${i}),${notes[i].toFixed(2)},${e})`;
  return e;
}

function trackExpr(chord) {
  const [r, t3, t5, t7] = chord;
  // PAD — chord tones, each breathing on its own slow LFO. Low amps so it sits under everything.
  const amps = [0.11, 0.10, 0.085, 0.07], lfos = [0.05, 0.06, 0.045, 0.07];
  const pad = chord.map((f, i) => `${amps[i]}*sin(2*PI*${f}*t)*(0.55+0.45*sin(2*PI*${lfos[i]}*t))`).join("+");
  // SUB-BASS — root an octave down, soft and round.
  const bass = `0.15*sin(2*PI*${(r / 2).toFixed(2)}*t)*(0.6+0.4*sin(2*PI*0.05*t))`;
  // MELODY — gentle up-and-down arpeggio of the chord, an octave up; phase-reset per note so each
  // is a clean pluck (no click). env = soft attack * exponential decay.
  const mel = [t3 * 2, t5 * 2, t7 * 2, t5 * 2, r * 2, t3 * 2];
  const env = `(1-exp(-20*mod(t,${STEP})))*exp(-2.3*mod(t,${STEP}))`;
  const melody = `0.13*${env}*sin(2*PI*(${melodySelect(mel)})*mod(t,${STEP}))`;
  return `${pad}+${bass}+${melody}`;
}

function build(track, out) {
  const af = [
    "aformat=channel_layouts=stereo",
    "highpass=f=55",                                  // trim sub rumble below the bass
    "lowpass=f=1350",                                 // WARMTH — shave the harsh highs (the "hard" fix)
    "aecho=0.85:0.75:120|180:0.24|0.17",              // soft stereo room/reverb tail
    "apulsator=hz=0.05:width=0.22",                   // very slow, gentle stereo drift
    "volume=2.0",                                     // bring the quiet synth up to level…
    "alimiter=level_in=1:level_out=0.9:limit=0.9:attack=6:release=60", // …then tame peaks so nothing is harsh
    "afade=t=in:st=0:d=5",
    `afade=t=out:st=${DUR - 5}:d=5`,
  ].join(",");
  const args = [
    "-y",
    "-f", "lavfi", "-i", `aevalsrc='${trackExpr(track.chord)}':d=${DUR}:s=${SR}`,
    "-af", af,
    "-c:a", "libmp3lame", "-q:a", "4", "-ar", String(SR),
    out,
  ];
  execFileSync(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"], timeout: 120000 });
}

(function main() {
  const force = process.argv.includes("--force");
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  // Remove the old v1 "calm-*" pads so the reel only picks the new smooth ones.
  try { for (const f of fs.readdirSync(AUDIO_DIR)) if (/^calm-.*\.mp3$/i.test(f)) fs.unlinkSync(path.join(AUDIO_DIR, f)); } catch (e) {}
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
      console.error("✗ failed " + t.name + ": " + String(e.message).slice(0, 200));
    }
  }
  console.log(made ? ("\n" + made + " smooth lo-fi track(s) ready in assets/audio/") : "\nAll tracks already present.");
})();
