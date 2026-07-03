// pte-2026-tasks.mjs — one-time injection of the two task types added to the PTE
// Academic pattern in 2026: "Summarize Group Discussion" and "Respond to a Situation".
// All discussion scripts and situations below are ORIGINAL content written for
// LandingPrep (everyday academic scenarios) — they match the task FORMAT of the real
// exam, never its actual questions.
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const SGD = [ // Summarize Group Discussion — 3-speaker scripts, ~40s spoken
  { audioScript: "Speaker A: I think our project should survey students online — we'd reach far more people in a week. Speaker B: But online surveys get rushed answers. Face-to-face interviews would give us deeper reasons, even if we only manage thirty. Speaker C: Why not both? Start with a short online survey to find patterns, then interview ten people about the most surprising results. Speaker A: That works, but we'd need to finish the survey by Friday to leave time for interviews. Speaker B: Agreed — I'll draft the questions tonight and we can review them tomorrow.",
    keyPoints: ["The group debated online surveys (reach) versus interviews (depth)", "They agreed on a combined approach: survey first, then follow-up interviews", "Deadline set — survey done by Friday; questions drafted tonight"] },
  { audioScript: "Speaker A: The library's group rooms are always booked. I propose we ask the university to extend booking hours to midnight. Speaker B: Longer hours won't help if the same few groups block-book every slot. A two-hour daily limit per group would free up rooms. Speaker C: Both ideas cost nothing, so we could suggest them together. My worry is enforcement — who checks that a group actually leaves? Speaker A: The card-swipe system already logs entry, so overstays could be flagged automatically. Speaker B: Then let's write the proposal with both changes and mention the card data.",
    keyPoints: ["Problem: group study rooms are always booked", "Two fixes proposed: longer hours and a two-hour per-group daily limit", "Enforcement concern answered by using existing card-swipe logs; both ideas go in one proposal"] },
  { audioScript: "Speaker A: For the science fair, a live demonstration would draw the biggest crowd — something with immediate visual impact. Speaker B: Live demos can fail in front of everyone. A recorded version with a live commentary is safer. Speaker C: The judges' criteria say originality and interaction matter most, so maybe visitors could run a safe, simple version of the experiment themselves. Speaker A: Hands-on would be memorable, but we'd need safety approval first. Speaker B: Let's check the safety rules tonight and decide tomorrow between the live demo and the hands-on table.",
    keyPoints: ["Options debated: live demo, recorded demo with commentary, or hands-on visitor table", "Judges reward originality and interaction, favouring hands-on", "Decision postponed until safety rules are checked tonight"] },
  { audioScript: "Speaker A: Our club's budget was cut by thirty percent, so I suggest cancelling the printed newsletter — most members read the email version anyway. Speaker B: Some alumni donors only get the print copy. Dropping it might cost us donations larger than the saving. Speaker C: We could print a smaller quarterly edition just for donors and move everyone else to email. Speaker A: That cuts printing by about eighty percent while keeping donors happy. Speaker B: Fine, but let's survey the donors first rather than assume what they want.",
    keyPoints: ["Thirty percent budget cut forces a decision on the printed newsletter", "Risk raised: donors who prefer print might reduce donations", "Compromise: quarterly print for donors only, email for the rest — pending a donor survey"] },
  { audioScript: "Speaker A: I've analysed our café's queue times — the morning rush peaks at nine, and we lose customers who wait more than six minutes. Speaker B: Then we should open the second till from eight thirty. The extra staffing cost is small compared with lost sales. Speaker C: Or we could add mobile ordering, so students order on the way and just collect. Speaker B: Mobile ordering takes months to set up; the second till helps on Monday. Speaker A: Let's do the till now and trial mobile ordering next term.",
    keyPoints: ["Data shows a nine o'clock peak and customers lost after six-minute waits", "Quick fix (second till from 8:30) versus long-term fix (mobile ordering)", "Decision: open the till now, trial mobile ordering next term"] },
];

const RTS = [ // Respond to a Situation — original everyday scenarios
  { situation: "Your professor returned your assignment with a grade you believe overlooks a section you completed. You are at office hours. Politely explain the issue and ask for a review.", modelAnswer: "Good afternoon, Professor. Thank you for the feedback on my assignment. I noticed the grade summary says section three was missing, but I did submit it — it starts on page six, just after the data tables. Could I ask you to take another look when you have a moment? I'm happy to walk you through it now or leave a printed copy. I appreciate your time." },
  { situation: "You lent a classmate your only textbook two weeks ago and your exam is in five days. Call them and ask for it back without damaging the friendship.", modelAnswer: "Hey, it's me — hope the semester's treating you well! Quick favour: I need my textbook back for the exam on Friday, so could I collect it tomorrow, or could you drop it at the library desk for me? If you still need it after my exam, you're welcome to borrow it again. Thanks so much — good luck with your revision too!" },
  { situation: "Your flight to an important university interview was cancelled. You are at the airline counter. Explain your urgency and ask what options are available.", modelAnswer: "Hello — my flight this afternoon was cancelled, and I have a university interview tomorrow morning that I can't reschedule. Could you tell me what my options are? I'd take any earlier alternative — a different route, another airport, or a seat on tonight's flight if there's a waitlist. If nothing is available, could you confirm what compensation or hotel support applies? Thank you for your help." },
  { situation: "Your noisy neighbours in the student residence play loud music after midnight during exam week. Speak to them politely but firmly.", modelAnswer: "Hi — sorry to knock this late. I'm your neighbour in 4B. I don't want to make this awkward, but it's exam week and the music has been going past midnight the last few nights, and I really need to sleep. Would you mind keeping it down after eleven until exams finish? Happy to return the favour whenever you need quiet. Thanks for understanding." },
  { situation: "You ordered a laptop online for your studies; it arrived with a cracked screen. Call customer service to request a replacement before your course starts next week.", modelAnswer: "Hello, I'm calling about order number 4-7-2-1. The laptop arrived today, but the screen is cracked in the top corner — it was damaged in transit, and the box shows an impact mark. My course starts next Monday, so I'd like to request an express replacement rather than a refund. I can send photos of the damage and the packaging right away. Could you confirm how quickly a replacement could reach me?" },
];

// Inject one SGD + one RTS into each of test-001..005 (distinct content per file).
for (let i = 0; i < 5; i++) {
  const f = path.join(ROOT, "content", "pte", "speaking-writing", `test-00${i + 1}.json`);
  const t = JSON.parse(readFileSync(f, "utf8"));
  if (t.questions.some((q) => q.questionType === "summarize_group_discussion")) { console.log(`  test-00${i + 1}: already has 2026 tasks — skipped`); continue; }
  const sgd = SGD[i], rts = RTS[i];
  // Place the new speaking tasks after the last speaking item, before written tasks.
  const firstWrite = t.questions.findIndex((q) => q.questionType === "summarize_written_text" || q.questionType === "essay");
  const at = firstWrite === -1 ? t.questions.length : firstWrite;
  t.questions.splice(at, 0,
    { id: t.id + "-sgd-1", questionType: "summarize_group_discussion",
      prompt: "You will hear three people discussing a topic. After listening, summarize the discussion in your own words — cover the main points of view and any decision reached. You have 10 seconds to prepare and 2 minutes to speak.",
      audioScript: sgd.audioScript, keyPoints: sgd.keyPoints,
      rubric: "Content: covers each speaker's position and the outcome. Fluency: natural pace, minimal hesitation. Vocabulary/grammar: clear connectors (while, whereas, they agreed that…).",
      difficulty: "medium", topic: "campus life", correctAnswer: "" },
    { id: t.id + "-rts-1", questionType: "respond_to_situation",
      prompt: "Read the situation below. You have 20 seconds to prepare, then 40 seconds to respond as you would in real life — appropriate tone, clear request, natural spoken English.",
      situation: rts.situation, modelAnswer: rts.modelAnswer,
      rubric: "Appropriacy: tone fits the situation (polite/firm as needed). Content: states the problem and a clear request. Fluency and pronunciation.",
      difficulty: "medium", topic: "everyday situations", correctAnswer: "" }
  );
  t.questionCount = t.questions.length;
  t.durationSeconds = (t.durationSeconds || 4500) + 5 * 60; // ~5 min for the two new tasks
  if (typeof t.instructions === "string" && !/2026/.test(t.instructions)) {
    t.instructions += " Includes the two task types added to the PTE Academic pattern in 2026: Summarize Group Discussion and Respond to a Situation.";
  }
  writeFileSync(f, JSON.stringify(t, null, 2));
  console.log(`  test-00${i + 1}: +SGD +RTS → ${t.questionCount} items, ${(t.durationSeconds / 60).toFixed(0)}m`);
}
console.log("Done.");
