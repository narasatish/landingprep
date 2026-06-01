#!/usr/bin/env node
/**
 * tools/gen-duolingo-photos.js
 * Duolingo "write_about_photo" / "speak_about_photo" items currently repeat just
 * two scenes across all 30 tests and have NO image. This script:
 *   1. Diversifies the scenes (a library of distinct everyday scenes).
 *   2. Attaches a clean flat-illustration SVG as a data-URI `photoUrl`
 *      (rendered by the SpeakingSection describe-photo <img> block).
 *   3. Rewrites each prompt to match its assigned scene.
 * No network. Deterministic. Self-contained (SVG inlined as data-URI).
 */
"use strict";
const fs = require("fs");
const path = require("path");

// ── Scene library: compact, recognizable flat SVG illustrations ───────────────
const SKY = "#cfeffd", GROUND = "#e9e4d6";
function frame(inner, sky = SKY, ground = GROUND) {
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>`
    + `<rect width='400' height='300' fill='${sky}'/>`
    + `<rect y='210' width='400' height='90' fill='${ground}'/>`
    + inner + `</svg>`;
}
const SCENES = [
  { key: "park",
    prompt: "a city park on a sunny day, with people walking along a path, tall green trees, and a wooden bench",
    alt: "Illustration of a sunny city park with trees, a path and a bench",
    svg: frame(`<circle cx='330' cy='55' r='26' fill='#ffe07a'/>`
      + `<path d='M40 210 Q200 170 360 210 L360 230 Q200 200 40 230 Z' fill='#bfae86'/>`
      + `<g fill='#3f9b54'><circle cx='80' cy='150' r='38'/><circle cx='120' cy='160' r='30'/></g><rect x='96' y='175' width='10' height='45' fill='#7a5230'/>`
      + `<g fill='#2f8a48'><circle cx='300' cy='140' r='34'/><circle cx='270' cy='155' r='26'/></g><rect x='292' y='170' width='10' height='50' fill='#7a5230'/>`
      + `<g fill='#8a5a2b'><rect x='170' y='195' width='60' height='8' rx='2'/><rect x='176' y='203' width='6' height='16'/><rect x='218' y='203' width='6' height='16'/></g>`
      + `<g><circle cx='140' cy='185' r='7' fill='#e8a06a'/><rect x='136' y='192' width='8' height='20' fill='#3a6ea5'/></g>`) },
  { key: "market",
    prompt: "a busy traditional street market with colourful fruit and vegetable stalls, striped awnings and shoppers",
    alt: "Illustration of a busy traditional market with stalls and awnings",
    svg: frame(`<g><rect x='40' y='150' width='120' height='60' fill='#c9a36a'/><rect x='40' y='130' width='120' height='22' fill='#e0533d'/><rect x='40' y='130' width='120' height='22' fill='url(#s1)'/>`
      + `<circle cx='65' cy='165' r='9' fill='#e23b3b'/><circle cx='90' cy='165' r='9' fill='#f2a93b'/><circle cx='115' cy='165' r='9' fill='#6fbf4b'/><circle cx='140' cy='165' r='9' fill='#e23b3b'/></g>`
      + `<g><rect x='230' y='150' width='130' height='60' fill='#c9a36a'/><rect x='230' y='130' width='130' height='22' fill='#3b7fe2'/>`
      + `<circle cx='255' cy='165' r='9' fill='#f2d03b'/><circle cx='285' cy='165' r='9' fill='#6fbf4b'/><circle cx='315' cy='165' r='9' fill='#e23b3b'/><circle cx='345' cy='165' r='9' fill='#9b59b6'/></g>`
      + `<g><circle cx='195' cy='185' r='8' fill='#e8a06a'/><rect x='190' y='192' width='10' height='22' fill='#2e7d6b'/></g>`
      + `<defs><pattern id='s1' width='20' height='22' patternUnits='userSpaceOnUse'><rect width='10' height='22' fill='#fff' opacity='.5'/></pattern></defs>`) },
  { key: "kitchen",
    prompt: "a home kitchen where someone is cooking, with a stove, pots, a counter and cupboards",
    alt: "Illustration of a home kitchen with a stove, pots and counter",
    svg: frame(`<rect x='30' y='170' width='340' height='40' fill='#b98b5e'/><rect x='30' y='160' width='340' height='12' fill='#d8b483'/>`
      + `<rect x='250' y='120' width='110' height='50' fill='#cfd6dc'/><rect x='258' y='128' width='40' height='34' fill='#9aa6b0'/>`
      + `<g><ellipse cx='90' cy='160' rx='26' ry='8' fill='#7a7f85'/><rect x='66' y='140' width='48' height='20' rx='3' fill='#9aa0a6'/><rect x='112' y='145' width='16' height='5' fill='#555'/></g>`
      + `<g><rect x='150' y='150' width='34' height='14' rx='3' fill='#c0392b'/><rect x='182' y='154' width='12' height='4' fill='#555'/></g>`
      + `<rect x='40' y='60' width='70' height='40' fill='#bfa' opacity='.4'/>`
      + `<g><circle cx='215' cy='150' r='8' fill='#e8a06a'/><rect x='210' y='157' width='10' height='14' fill='#6c5ce7'/></g>`, "#f4ece0") },
  { key: "classroom",
    prompt: "a school classroom with a teacher at a whiteboard and students sitting at desks",
    alt: "Illustration of a classroom with a whiteboard and desks",
    svg: frame(`<rect x='40' y='70' width='150' height='80' fill='#fff' stroke='#9aa6b0' stroke-width='3'/>`
      + `<line x1='55' y1='95' x2='150' y2='95' stroke='#3b7fe2' stroke-width='3'/><line x1='55' y1='112' x2='130' y2='112' stroke='#3b7fe2' stroke-width='3'/>`
      + `<g><circle cx='225' cy='120' r='9' fill='#e8a06a'/><rect x='219' y='128' width='12' height='30' fill='#c0392b'/></g>`
      + `<g fill='#8a5a2b'><rect x='70' y='185' width='50' height='8'/><rect x='74' y='193' width='6' height='16'/><rect x='112' y='193' width='6' height='16'/>`
      + `<rect x='170' y='185' width='50' height='8'/><rect x='174' y='193' width='6' height='16'/><rect x='212' y='193' width='6' height='16'/>`
      + `<rect x='270' y='185' width='50' height='8'/><rect x='274' y='193' width='6' height='16'/><rect x='312' y='193' width='6' height='16'/></g>`, "#eef3e8") },
  { key: "beach",
    prompt: "a sandy beach beside the sea, with a colourful umbrella, gentle waves and a clear sky",
    alt: "Illustration of a beach with an umbrella and the sea",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='400' height='300' fill='#bfe9ff'/>`
      + `<circle cx='320' cy='55' r='26' fill='#ffe07a'/><rect y='150' width='400' height='70' fill='#4bb6d6'/>`
      + `<path d='M0 150 q40 10 80 0 t80 0 t80 0 t80 0 t80 0 v10 H0 Z' fill='#6fc9e6'/>`
      + `<rect y='210' width='400' height='90' fill='#f2e2b8'/>`
      + `<g><path d='M250 200 A40 40 0 0 1 330 200 Z' fill='#e74c3c'/><line x1='290' y1='200' x2='290' y2='150' stroke='#7a5230' stroke-width='4'/></g>`
      + `<g><circle cx='120' cy='195' r='8' fill='#e8a06a'/><rect x='114' y='202' width='12' height='16' fill='#2980b9'/></g></svg>` },
  { key: "station",
    prompt: "a train arriving at a busy railway station platform, with passengers waiting and a station sign",
    alt: "Illustration of a train at a station platform with passengers",
    svg: frame(`<rect x='30' y='110' width='250' height='70' rx='8' fill='#3b6fb0'/><rect x='30' y='110' width='250' height='20' rx='8' fill='#2c5689'/>`
      + `<rect x='50' y='135' width='34' height='30' fill='#bfe3ff'/><rect x='100' y='135' width='34' height='30' fill='#bfe3ff'/><rect x='150' y='135' width='34' height='30' fill='#bfe3ff'/><rect x='200' y='135' width='34' height='30' fill='#bfe3ff'/>`
      + `<circle cx='80' cy='185' r='8' fill='#222'/><circle cx='230' cy='185' r='8' fill='#222'/>`
      + `<rect x='300' y='90' width='70' height='26' rx='3' fill='#1f6f43'/><text x='335' y='108' font-size='13' fill='#fff' text-anchor='middle' font-family='sans-serif'>STN</text>`
      + `<g><circle cx='320' cy='160' r='8' fill='#e8a06a'/><rect x='314' y='167' width='12' height='26' fill='#8e44ad'/></g>`) },
  { key: "restaurant",
    prompt: "a restaurant interior where people are eating at tables set with plates, glasses and a small vase",
    alt: "Illustration of a restaurant with set tables and diners",
    svg: frame(`<g><ellipse cx='110' cy='180' rx='55' ry='16' fill='#c98a5a'/><circle cx='95' cy='176' r='12' fill='#fff'/><circle cx='128' cy='176' r='12' fill='#fff'/><rect x='108' y='160' width='6' height='16' fill='#3a7d4a'/></g>`
      + `<g><ellipse cx='280' cy='185' rx='55' ry='16' fill='#c98a5a'/><circle cx='262' cy='181' r='12' fill='#fff'/><circle cx='298' cy='181' r='12' fill='#fff'/><rect x='277' y='165' width='6' height='16' fill='#c0392b'/></g>`
      + `<g><circle cx='110' cy='130' r='9' fill='#e8a06a'/><rect x='104' y='138' width='12' height='22' fill='#2c3e50'/></g>`
      + `<g><circle cx='280' cy='135' r='9' fill='#e8a06a'/><rect x='274' y='143' width='12' height='22' fill='#16a085'/></g>`, "#f3e6da") },
  { key: "intersection",
    prompt: "a busy city intersection with pedestrians on a crossing, cyclists, cars and traffic lights between tall buildings",
    alt: "Illustration of a busy city intersection with crossing and traffic",
    svg: frame(`<g fill='#9fb3c8'><rect x='30' y='70' width='60' height='140'/><rect x='110' y='95' width='55' height='115'/><rect x='300' y='80' width='65' height='130'/></g>`
      + `<g fill='#cdd9e5'><rect x='40' y='85' width='14' height='16'/><rect x='66' y='85' width='14' height='16'/><rect x='40' y='115' width='14' height='16'/><rect x='66' y='115' width='14' height='16'/><rect x='320' y='95' width='14' height='16'/><rect x='344' y='95' width='14' height='16'/></g>`
      + `<rect y='230' width='400' height='50' fill='#5a5f66'/>`
      + `<g fill='#fff'><rect x='180' y='234' width='14' height='42'/><rect x='206' y='234' width='14' height='42'/><rect x='232' y='234' width='14' height='42'/></g>`
      + `<g><rect x='250' y='195' width='40' height='18' rx='4' fill='#e74c3c'/><circle cx='258' cy='216' r='6' fill='#222'/><circle cx='282' cy='216' r='6' fill='#222'/></g>`
      + `<g><rect x='150' y='150' width='8' height='30' fill='#444'/><circle cx='154' cy='150' r='9' fill='#e23b3b'/><circle cx='154' cy='150' r='9' fill='#2ecc71' opacity='0'/></g>`
      + `<g><circle cx='200' cy='220' r='6' fill='#e8a06a'/><rect x='196' y='226' width='8' height='14' fill='#34495e'/></g>`) },
  { key: "library",
    prompt: "a quiet library with tall shelves full of books and a person reading at a table",
    alt: "Illustration of a library with bookshelves and a reader",
    svg: frame(`<g><rect x='30' y='70' width='110' height='140' fill='#9c6b3f'/><g fill='#e0c9a6'><rect x='36' y='78' width='98' height='6'/><rect x='36' y='100' width='98' height='6'/><rect x='36' y='122' width='98' height='6'/><rect x='36' y='144' width='98' height='6'/></g>`
      + `<g fill='#c0392b'><rect x='40' y='84' width='8' height='14'/></g><g fill='#2980b9'><rect x='52' y='84' width='8' height='14'/></g><g fill='#27ae60'><rect x='64' y='84' width='8' height='14'/></g><g fill='#f39c12'><rect x='76' y='84' width='8' height='14'/></g>`
      + `<g fill='#8a5a2b'><rect x='210' y='180' width='120' height='8'/><rect x='216' y='188' width='6' height='22'/><rect x='318' y='188' width='6' height='22'/></g>`
      + `<rect x='250' y='168' width='34' height='14' fill='#ecf0f1' transform='rotate(-6 267 175)'/>`
      + `<g><circle cx='270' cy='150' r='9' fill='#e8a06a'/><rect x='264' y='158' width='12' height='22' fill='#2c3e50'/></g>`, "#efe9df") },
  { key: "office",
    prompt: "a modern open-plan office where people work at desks with computers, plants and large windows",
    alt: "Illustration of an open-plan office with desks and computers",
    svg: frame(`<rect x='30' y='60' width='150' height='70' fill='#bfe3ff' opacity='.7'/>`
      + `<g><rect x='40' y='165' width='110' height='10' fill='#9c6b3f'/><rect x='70' y='140' width='40' height='26' fill='#2c3e50'/><rect x='76' y='146' width='28' height='16' fill='#5dade2'/></g>`
      + `<g><rect x='230' y='165' width='120' height='10' fill='#9c6b3f'/><rect x='262' y='140' width='40' height='26' fill='#2c3e50'/><rect x='268' y='146' width='28' height='16' fill='#5dade2'/></g>`
      + `<g><circle cx='95' cy='130' r='9' fill='#e8a06a'/><rect x='89' y='138' width='12' height='24' fill='#16a085'/></g>`
      + `<g><circle cx='287' cy='130' r='9' fill='#e8a06a'/><rect x='281' y='138' width='12' height='24' fill='#8e44ad'/></g>`
      + `<g fill='#2ecc71'><circle cx='200' cy='150' r='10'/><circle cx='190' cy='160' r='8'/><circle cx='210' cy='160' r='8'/></g><rect x='195' y='165' width='10' height='12' fill='#7a5230'/>`, "#f0f2f4") },
];

function dataUri(svg) {
  return "data:image/svg+xml," + encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
}

const dir = path.join(__dirname, "..", "content", "duolingo", "adaptive");
const files = fs.readdirSync(dir).filter(f => /^test-\d+\.json$/.test(f)).sort();
let attached = 0, written = 0;
files.forEach((f, ti) => {
  const fp = path.join(dir, f);
  const json = JSON.parse(fs.readFileSync(fp, "utf8"));
  let changed = false;
  (json.questions || []).forEach(q => {
    if (!/photo/i.test(q.questionType || "")) return;
    // write_about_photo and speak_about_photo in a test get different scenes; tests rotate.
    const isSpeak = /speak/i.test(q.questionType);
    const scene = SCENES[(ti + (isSpeak ? 5 : 0)) % SCENES.length];
    const numTag = (String(q.prompt || "").match(/^\[\d+\]\s*/) || [""])[0];
    q.photoUrl = dataUri(scene.svg);
    q.photoAlt = scene.alt;
    q.photoScene = scene.key;
    q.prompt = isSpeak
      ? `${numTag}Look at the picture of ${scene.prompt}. You have 20 seconds to prepare, then speak for up to 90 seconds describing what you see and what you think is happening.`
      : `${numTag}Describe what you see in the picture of ${scene.prompt}. Write at least 5–8 sentences in 5 minutes.`;
    changed = true; attached++;
  });
  if (changed) { fs.writeFileSync(fp, JSON.stringify(json, null, 2)); written++; }
});
console.log(`Duolingo photos: attached ${attached} images across ${written} files (${SCENES.length} distinct scenes).`);
