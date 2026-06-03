// fix-pte-fib.mjs — replace every malformed PTE Reading "fill_in_blanks" item (no
// __N[..]__ dropdown markup / no answer key) with a proper authored one from BANK below,
// rotating for variety. Leaves already-valid items untouched. Each BANK item is a real
// academic passage with 4 inline-dropdown blanks, the correct word per blank, and an
// explanation. Renderer format: __N[opt1|opt2|opt3]__ ; correctAnswers[i] is one of blank i's opts.
import fs from "fs"; import path from "path";
const DIR = "content/pte/reading";

const BANK = [
  { topic: "Plate tectonics", passage: "The Earth's outer shell is divided into rigid plates that move slowly over a __1[plastic|liquid|frozen]__ layer of the mantle. Where two plates __2[collide|vanish|reverse]__, one may slide beneath the other, forming deep trenches. This continuous motion gradually __3[reshapes|destroys|ignores]__ the surface, building mountains and triggering earthquakes over millions of __4[years|seconds|metres]__.", answers: ["plastic", "collide", "reshapes", "years"] },
  { topic: "Photosynthesis", passage: "Plants convert sunlight into chemical energy through a process __1[known|hidden|opposed]__ as photosynthesis. Inside the leaves, chlorophyll __2[absorbs|reflects|emits]__ light and uses it to combine carbon dioxide and water. The result is glucose, which stores energy, and oxygen, which is __3[released|consumed|trapped]__ into the air. This reaction is __4[fundamental|harmful|optional]__ to almost all life on Earth.", answers: ["known", "absorbs", "released", "fundamental"] },
  { topic: "The water cycle", passage: "Water moves continuously between the oceans, atmosphere and land in a process called the water cycle. Heat from the sun causes surface water to __1[evaporate|freeze|settle]__ and rise as vapour. As it cools, the vapour __2[condenses|expands|burns]__ into clouds, and eventually falls back as __3[precipitation|radiation|sediment]__. Rivers then return this water to the sea, and the cycle __4[repeats|stops|reverses]__.", answers: ["evaporate", "condenses", "precipitation", "repeats"] },
  { topic: "Antibiotic resistance", passage: "Bacteria can develop resistance when antibiotics are used too __1[frequently|rarely|carefully]__. The few bacteria that survive a treatment pass on their resistant genes, so the population gradually becomes harder to __2[treat|count|observe]__. To slow this trend, doctors are urged to __3[prescribe|abandon|hide]__ antibiotics only when necessary, and patients should always __4[complete|shorten|skip]__ the full course.", answers: ["frequently", "treat", "prescribe", "complete"] },
  { topic: "Supply and demand", passage: "In a market economy, prices are largely determined by supply and demand. When a product becomes __1[scarce|common|invisible]__ but many people want it, its price tends to __2[rise|vanish|freeze]__. Conversely, if supply __3[exceeds|equals|ignores]__ demand, sellers often lower prices to attract buyers. This balance helps allocate resources __4[efficiently|randomly|secretly]__ across the economy.", answers: ["scarce", "rise", "exceeds", "efficiently"] },
  { topic: "Memory and recall", passage: "Psychologists distinguish between short-term and long-term memory. Information is first held __1[briefly|forever|silently]__ in short-term memory, where it can be lost within seconds unless it is __2[rehearsed|deleted|ignored]__. Through repetition and meaning, some memories are __3[transferred|returned|hidden]__ to long-term storage. Retrieving them later is easier when they are linked to __4[existing|random|empty]__ knowledge.", answers: ["briefly", "rehearsed", "transferred", "existing"] },
  { topic: "Renewable energy", passage: "Renewable sources such as wind and solar power are increasingly used to __1[generate|consume|waste]__ electricity. Unlike fossil fuels, they produce very few __2[emissions|profits|machines]__ and will not run out. Their main __3[limitation|advantage|purpose]__ is that output varies with the weather, so engineers are developing better ways to __4[store|burn|sell]__ the energy they produce.", answers: ["generate", "emissions", "limitation", "store"] },
  { topic: "Coral reefs", passage: "Coral reefs are among the most __1[diverse|barren|silent]__ ecosystems on the planet, supporting thousands of species. The corals themselves rely on tiny algae that live in their tissues and __2[provide|steal|block]__ food through photosynthesis. When ocean temperatures rise too high, the corals expel these algae and __3[bleach|grow|migrate]__, a process that can be __4[fatal|helpful|temporary]__ if it lasts too long.", answers: ["diverse", "provide", "bleach", "fatal"] },
  { topic: "The printing press", passage: "The invention of the printing press in the fifteenth century __1[transformed|delayed|hid]__ the spread of information. Before it, books were copied by hand, making them rare and __2[expensive|colourful|short]__. Printing allowed identical copies to be produced __3[quickly|secretly|poorly]__ and cheaply, which helped ideas spread across Europe and __4[accelerated|prevented|reversed]__ the growth of literacy.", answers: ["transformed", "expensive", "quickly", "accelerated"] },
  { topic: "Urban planning", passage: "Good urban planning aims to make cities both functional and __1[livable|crowded|distant]__. Planners try to balance housing, transport and green space so that residents can move around __2[easily|rarely|blindly]__. Well-designed public spaces also __3[encourage|prevent|ignore]__ social interaction, while sensible zoning reduces pollution and helps a city grow in a __4[sustainable|sudden|hidden]__ way.", answers: ["livable", "easily", "encourage", "sustainable"] },
  { topic: "Volcanoes", passage: "Volcanoes form where molten rock, called magma, rises toward the Earth's __1[surface|core|orbit]__. When the pressure becomes too great, the volcano __2[erupts|cools|sinks]__, releasing lava, ash and gases. Although eruptions can be __3[destructive|silent|invisible]__, the ash they leave behind often makes the surrounding soil extremely __4[fertile|toxic|dry]__ for farming.", answers: ["surface", "erupts", "destructive", "fertile"] },
  { topic: "Sleep and health", passage: "Sleep plays a __1[vital|minor|random]__ role in physical and mental health. During deep sleep, the body repairs tissues and the brain __2[consolidates|erases|hides]__ memories from the day. People who regularly sleep too little are more __3[likely|reluctant|able]__ to suffer from poor concentration and weakened immunity, so experts __4[recommend|forbid|doubt]__ a consistent sleep schedule.", answers: ["vital", "consolidates", "likely", "recommend"] },
];

const isValid = (q) => /__\d+\[[^\]]+\]__/.test(q.passage || "") && Array.isArray(q.correctAnswers) && q.correctAnswers.length;
let replaced = 0, errors = [];
const files = fs.readdirSync(DIR).filter((x) => /^test-\d+\.json$/.test(x)).sort();
files.forEach((f, ti) => {
  const file = path.join(DIR, f);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  let dirty = false, fibSeen = 0;
  for (let i = 0; i < (j.questions || []).length; i++) {
    const q = j.questions[i];
    if (q.questionType !== "fill_in_blanks") continue;
    if (isValid(q)) { fibSeen++; continue; }
    const b = BANK[(ti * 3 + fibSeen) % BANK.length]; fibSeen++;
    // validate the bank item before applying
    const blanks = [...b.passage.matchAll(/__(\d+)\[([^\]]+)\]__/g)];
    if (blanks.length !== b.answers.length) { errors.push(`BANK '${b.topic}': ${blanks.length} blanks vs ${b.answers.length} answers`); continue; }
    for (const g of blanks) { const opts = g[2].split("|"); const ans = b.answers[+g[1] - 1]; if (!opts.includes(ans)) errors.push(`BANK '${b.topic}' blank ${g[1]}: answer "${ans}" not in [${g[2]}]`); }
    j.questions[i] = {
      id: q.id, questionType: "fill_in_blanks", topic: b.topic,
      prompt: `Read the text about ${b.topic.toLowerCase()} and select the correct word for each blank from the dropdown list.`,
      passage: b.passage, blanks: b.answers.map((_, k) => k + 1), correctAnswers: b.answers,
      explanation: `The blanks are completed, in order, with: ${b.answers.join(", ")}. Each is the word that best fits the meaning and grammar of its sentence; the other dropdown options do not fit the context.`,
    };
    replaced++; dirty = true;
  }
  if (dirty) fs.writeFileSync(file, JSON.stringify(j, null, 2));
});
if (errors.length) { console.error(`✗ ${errors.length} errors:`); errors.slice(0, 20).forEach((e) => console.error("  " + e)); process.exit(1); }
console.log(`✅ Replaced ${replaced} malformed PTE Reading fill-in-blanks with valid authored items (4 dropdown blanks + answers + explanation each).`);
