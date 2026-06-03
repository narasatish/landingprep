import fs from "fs";
const p = "content/pte/listening-bank.json";
const b = JSON.parse(fs.readFileSync(p, "utf8"));

// 1) mcs[10]: correctAnswer was a paraphrase — set it to the exact intended option.
b.mcs[10].correctAnswer = "Accessibility standards improve usability for all users including those with temporary limitations";

// 2) hiw[6]: rewrite as a clean 4-swap item (real HIW changes only a few words).
b.hiw[6] = {
  topic: "Plate tectonics",
  audioScript: "Plate tectonics explains earthquakes, volcanoes, and mountain building through crustal dynamics. Earth's lithosphere consists of rigid plates moving over a plastic mantle. Divergent boundaries create new crust as plates separate, while convergent boundaries destroy crust as plates collide.",
  displayTranscript: "Plate tectonics explains earthquakes, volcanoes, and mountain erosion through crustal dynamics. Earth's lithosphere consists of rigid plates moving over a solid mantle. Divergent boundaries create new crust as plates merge, while convergent boundaries destroy crust as plates align.",
  incorrectWords: ["erosion", "solid", "merge", "align"],
  correctWords: ["building", "plastic", "separate", "collide"],
  explanation: "The audio says building, plastic, separate and collide.",
};

// 3) hiw[7]: same — clean 4-swap item.
b.hiw[7] = {
  topic: "The immune system",
  audioScript: "The immune system defends against pathogens through innate and adaptive responses. Innate immunity provides immediate defense through physical barriers and phagocytic cells. Adaptive immunity develops specific antibodies targeting particular pathogens.",
  displayTranscript: "The immune system attacks against pathogens through innate and adaptive responses. Innate immunity provides delayed defense through chemical barriers and phagocytic cells. Adaptive immunity develops random antibodies targeting particular pathogens.",
  incorrectWords: ["attacks", "delayed", "chemical", "random"],
  correctWords: ["defends", "immediate", "physical", "specific"],
  explanation: "The audio says defends, immediate, physical and specific.",
};

fs.writeFileSync(p, JSON.stringify(b, null, 2));
console.log("patched mcs[10], hiw[6], hiw[7]");
