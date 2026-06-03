import fs from "fs";
const p = "content/pte/listening-bank.json";
const b = JSON.parse(fs.readFileSync(p, "utf8"));

b.hiw[4] = {
  topic: "Internet and information technology",
  audioScript: "The internet revolutionized communication by connecting computers worldwide into a global network. Packet switching enables data to travel efficiently across multiple routes. Protocols standardize how devices exchange information reliably between distant locations.",
  displayTranscript: "The internet revolutionized communication by connecting computers worldwide into a local network. Packet switching enables data to travel slowly across multiple routes. Protocols standardize how devices exchange information poorly between nearby locations.",
  incorrectWords: ["local", "slowly", "poorly", "nearby"],
  correctWords: ["global", "efficiently", "reliably", "distant"],
  explanation: "The audio says global, efficiently, reliably and distant.",
};

b.hiw[5] = {
  topic: "Enzyme catalysis",
  audioScript: "Enzymes accelerate chemical reactions by lowering activation energy requirements. Each enzyme has an optimal temperature and pH at which it works best. Extreme conditions can denature the protein and destroy its catalytic activity.",
  displayTranscript: "Enzymes accelerate chemical reactions by raising activation energy requirements. Each enzyme has an optimal temperature and pH at which it works worst. Extreme conditions can strengthen the protein and enhance its catalytic activity.",
  incorrectWords: ["raising", "worst", "strengthen", "enhance"],
  correctWords: ["lowering", "best", "denature", "destroy"],
  explanation: "The audio says lowering, best, denature and destroy.",
};

fs.writeFileSync(p, JSON.stringify(b, null, 2));
console.log("rewrote hiw[4], hiw[5] as clean 4-swap items");
