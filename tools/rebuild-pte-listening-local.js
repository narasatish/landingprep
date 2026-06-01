#!/usr/bin/env node
// tools/rebuild-pte-listening-local.js
// Generates all 30 PTE Academic Listening tests with proper question type variety.
"use strict";

const fs   = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "content", "pte", "listening");

function pad(n) { return String(n).padStart(3, "0"); }

// ── 30 Academic Topics (one per test) ────────────────────────────────────────
const TOPICS = [
  // test 1
  { topic: "The Neuroscience of Decision Making", type: "lecture" },
  // test 2
  { topic: "Climate Change and Migration", type: "interview" },
  // test 3
  { topic: "The History of Antibiotics", type: "lecture" },
  // test 4
  { topic: "Renewable Energy Transitions", type: "lecture" },
  // test 5
  { topic: "Urban Biodiversity and Green Infrastructure", type: "interview" },
  // test 6
  { topic: "The Psychology of Memory", type: "lecture" },
  // test 7
  { topic: "Deep Sea Exploration", type: "interview" },
  // test 8
  { topic: "Food Systems and Global Nutrition", type: "lecture" },
  // test 9
  { topic: "Artificial Intelligence in Healthcare", type: "interview" },
  // test 10
  { topic: "The Economics of Education", type: "lecture" },
  // test 11
  { topic: "Coral Reef Ecosystems", type: "lecture" },
  // test 12
  { topic: "Space Tourism and Commercialisation", type: "interview" },
  // test 13
  { topic: "Microbiome Research and Human Health", type: "lecture" },
  // test 14
  { topic: "The Sociology of Social Media", type: "lecture" },
  // test 15
  { topic: "Water Security in the 21st Century", type: "interview" },
  // test 16
  { topic: "Quantum Computing Fundamentals", type: "lecture" },
  // test 17
  { topic: "Biodiversity Loss and Extinction Rates", type: "interview" },
  // test 18
  { topic: "Behavioural Economics and Public Policy", type: "lecture" },
  // test 19
  { topic: "The Future of Work and Automation", type: "interview" },
  // test 20
  { topic: "Epigenetics and Gene Expression", type: "lecture" },
  // test 21
  { topic: "Circular Economy and Waste Reduction", type: "interview" },
  // test 22
  { topic: "The History of Pandemics", type: "lecture" },
  // test 23
  { topic: "Neural Plasticity and Learning", type: "interview" },
  // test 24
  { topic: "Arctic Climate Systems", type: "lecture" },
  // test 25
  { topic: "The Ethics of Genetic Engineering", type: "interview" },
  // test 26
  { topic: "Urbanisation and Infrastructure Challenges", type: "lecture" },
  // test 27
  { topic: "The Gut-Brain Axis", type: "interview" },
  // test 28
  { topic: "Carbon Capture and Storage", type: "lecture" },
  // test 29
  { topic: "Language Acquisition and Bilingualism", type: "interview" },
  // test 30
  { topic: "Sustainable Agriculture and Soil Health", type: "lecture" },
  // test 31
  { topic: "The Science of Sleep and Circadian Rhythms", type: "lecture" },
  // test 32
  { topic: "Ocean Acidification and Marine Life", type: "interview" },
  // test 33
  { topic: "The Archaeology of Ancient Trade Routes", type: "lecture" },
  // test 34
  { topic: "Vaccines and the Immune System", type: "interview" },
  // test 35
  { topic: "Renewable Materials and Green Chemistry", type: "lecture" },
  // test 36
  { topic: "The Economics of Renewable Energy Markets", type: "interview" },
  // test 37
  { topic: "Volcanology and Eruption Forecasting", type: "lecture" },
  // test 38
  { topic: "The Psychology of Habit Formation", type: "interview" },
  // test 39
  { topic: "Forest Ecology and Carbon Sequestration", type: "lecture" },
  // test 40
  { topic: "Astrobiology and the Search for Life", type: "interview" },
  // test 41
  { topic: "The History of Cartography", type: "lecture" },
  // test 42
  { topic: "Antibiotic Resistance and Global Health", type: "interview" },
  // test 43
  { topic: "Glaciology and Sea Level Rise", type: "lecture" },
  // test 44
  { topic: "The Neuroscience of Music Perception", type: "interview" },
  // test 45
  { topic: "Smart Cities and Urban Data", type: "lecture" },
  // test 46
  { topic: "Pollinators and Agricultural Resilience", type: "interview" },
  // test 47
  { topic: "The Physics of Renewable Storage Batteries", type: "lecture" },
  // test 48
  { topic: "Migration Patterns of Migratory Birds", type: "interview" },
  // test 49
  { topic: "The Sociology of Public Trust in Science", type: "lecture" },
  // test 50
  { topic: "Genomics and Personalised Medicine", type: "interview" },
  // test 51
  { topic: "Desertification and Land Restoration", type: "lecture" },
  // test 52
  { topic: "The Cognitive Science of Reading", type: "interview" },
  // test 53
  { topic: "Hydrogen as an Energy Carrier", type: "lecture" },
  // test 54
  { topic: "Coral Restoration and Reef Resilience", type: "interview" },
  // test 55
  { topic: "The History of Public Health Systems", type: "lecture" },
  // test 56
  { topic: "Robotics and Human-Machine Collaboration", type: "interview" },
  // test 57
  { topic: "Wetlands and Ecosystem Services", type: "lecture" },
  // test 58
  { topic: "The Economics of Urban Housing", type: "interview" },
  // test 59
  { topic: "Tectonics and Earthquake Resilience", type: "lecture" },
  // test 60
  { topic: "The Future of Sustainable Aviation", type: "interview" },
];

// ── Audio Script Generator ────────────────────────────────────────────────────
function makeLectureScript(topic) {
  return `Lecturer: Good afternoon, everyone. Today we are going to examine a topic that has attracted considerable scientific and policy attention in recent years: ${topic}. I want to begin by giving you some historical context, then move on to current research findings, and finish with a look at some of the most pressing challenges and emerging solutions in this area.

So, ${topic} is not a new phenomenon. Scholars and practitioners have grappled with aspects of it for well over a century, but the tools and methodologies available to modern researchers are qualitatively different from anything available before. Digital data collection, advanced computational models, and cross-disciplinary collaboration have transformed what we know.

What the evidence consistently shows is that ${topic} involves complex interactions between multiple systems — whether biological, social, or technological. Researchers have found that simplistic, single-factor explanations consistently fail to account for observed patterns. This has significant implications for how we design interventions and policies.

From an economic standpoint, the costs of inaction in this area are substantial. Multiple large-scale studies have estimated that failing to address the core challenges of ${topic} could cost societies trillions of dollars over the coming decades. In contrast, well-targeted investments now tend to generate benefits that significantly outweigh their costs.

The international dimension is also critical. ${topic} does not respect national borders, which means that coordinated, multilateral responses are necessary. We've seen some promising developments in international agreements over the past decade, but the pace of action remains too slow relative to the pace of change.

Looking forward, the trajectory will depend on innovation, political will, and effective communication between scientists, policymakers, and the public. The decisions made in the next ten to fifteen years will determine outcomes for generations to come. I would like you to keep these dimensions in mind as we work through the case studies today.`;
}

function makeInterviewScript(topic) {
  return `Interviewer: Welcome back to the programme. I'm joined today by a leading researcher whose work focuses on ${topic}. Thank you for being here.

Expert: Thank you for having me. It's a topic that I'm deeply passionate about.

Interviewer: Let's start with the basics. For our listeners who may not be familiar, can you explain what ${topic} involves and why it matters?

Expert: Certainly. ${topic} sits at the intersection of several major scientific and societal concerns. At its core, it involves understanding how interconnected systems — whether in nature, in human communities, or in technology — behave and respond to change. What makes it particularly significant today is that the scale and pace of change we're observing are unprecedented in the historical record.

Interviewer: And what would you say are the most surprising findings from recent research in this area?

Expert: The most striking finding, I think, is how rapidly things can shift once certain thresholds are crossed. We used to think that systems related to ${topic} changed gradually and predictably. But what the data show is that there can be abrupt transitions — what some researchers call tipping points — where the system moves very quickly from one state to another. That's both scientifically fascinating and deeply concerning from a policy perspective.

Interviewer: How should policymakers respond to that kind of uncertainty?

Expert: The key principle is what we call adaptive management — designing policies that can be updated as new evidence emerges, rather than locking in fixed approaches based on current knowledge. We also need much better monitoring systems so that we can detect early warning signals before a tipping point is reached. The good news is that the technology to do that is increasingly available and affordable.

Interviewer: Before we close, what would you say to young researchers considering a career in this field?

Expert: I'd say it's one of the most important areas of science and scholarship there is right now. The intellectual challenges are immense, the real-world stakes are enormous, and the community of researchers is genuinely collaborative and welcoming. We need more brilliant minds working on these problems.`;
}

// ── Individual question builders ──────────────────────────────────────────────

function makeSummarizeSpokenText(id, num, topic, audioScript) {
  const modelAnswer = `Research into ${topic} reveals complex interactions between multiple systems, with the pace of change accelerating significantly. The economic costs of inaction are substantial, and international coordination is essential. Effective responses require adaptive management, improved monitoring, and sustained investment in both research and policy implementation.`;
  return {
    id: `${id}-q${pad(num)}`,
    questionType: "summarize_spoken_text",
    prompt: `Question ${num}. You will hear a short lecture about ${topic}. Write a 50–70 word summary of it for a fellow student who was not present.`,
    audioScript,
    topic,
    wordLimit: { min: 50, max: 70 },
    modelAnswer,
    explanation: "The summary should cover the main argument (complexity of the topic), key evidence (costs of inaction, tipping points), and the recommended approach (international cooperation, adaptive management).",
  };
}

function makeMultipleChoiceMultiple(id, num, topic, audioScript) {
  // Points A and C are correct
  const points = [
    `${topic} involves complex interactions that cannot be explained by single-factor models`,
    "Early research in this field was conducted entirely by natural scientists",
    "The economic costs of failing to address this topic are estimated to be very high",
    "International agreements have fully resolved the challenges in this area",
    "Digital data collection has transformed the research landscape in this field",
  ];
  return {
    id: `${id}-q${pad(num)}`,
    questionType: "multiple_choice_multiple",
    audioScript,
    question: `Which TWO of the following points does the speaker make about ${topic}?`,
    options: points,
    correctAnswers: [points[0], points[2]],
    requiredCount: 2,
    explanation: "Points A and C are explicitly stated: single-factor explanations fail, and the costs of inaction are substantial. The other options are either not mentioned or contradict the audio.",
  };
}

function makeFillInBlanksListening(id, num, topic, audioScript) {
  const transcript = `The study of ${topic} demonstrates that __1__ interactions between multiple systems drive observed outcomes. Researchers have consistently found that __2__ explanations fail to account for real-world patterns. The international dimension is critical because ${topic} does not respect __3__ borders.`;
  return {
    id: `${id}-q${pad(num)}`,
    questionType: "fill_in_blanks_listening",
    prompt: `Question ${num}. You will hear a recording about ${topic}. Type the missing word in each numbered blank as you listen.`,
    audioScript,
    transcript,
    correctAnswers: ["complex", "simplistic", "national"],
    explanation: "These three words appear verbatim in the audio transcript at the corresponding positions in the transcript shown to the candidate.",
  };
}

function makeHighlightCorrectSummary(id, num, topic, audioScript) {
  return {
    id: `${id}-q${pad(num)}`,
    questionType: "highlight_correct_summary",
    prompt: `Question ${num}. Listen to the recording about ${topic}, then select the paragraph that best summarises what you heard.`,
    audioScript,
    options: [
      `The lecture/interview discusses ${topic}, highlighting the complexity of interactions involved, the economic costs of inaction, the need for international coordination, and the importance of adaptive management and monitoring.`,
      `The lecture argues that ${topic} is a minor concern that has been overstated by researchers and that existing policies are already sufficient to address all related challenges.`,
      `The speaker focuses exclusively on the historical background of ${topic} without discussing current evidence, economic dimensions, or policy implications.`,
    ],
    correctAnswer: `The lecture/interview discusses ${topic}, highlighting the complexity of interactions involved, the economic costs of inaction, the need for international coordination, and the importance of adaptive management and monitoring.`,
    explanation: "Option A accurately summarises the main themes: complexity, economic stakes, international cooperation, and adaptive management. The other options misrepresent the content.",
  };
}

function makeMultipleChoiceSingle(id, num, topic, audioScript) {
  return {
    id: `${id}-q${pad(num)}`,
    questionType: "multiple_choice_single",
    audioScript,
    question: `According to the audio, what is the key reason why single-factor explanations of ${topic} consistently fail?`,
    options: [
      "Researchers lack sufficient data to test single-factor models",
      `${topic} involves complex interactions between multiple interconnected systems`,
      "Single-factor models are too expensive to implement in practice",
      "Political opposition prevents single-factor explanations from being published",
    ],
    correctAnswer: `${topic} involves complex interactions between multiple interconnected systems`,
    explanation: "The audio explicitly states that simplistic, single-factor explanations fail because the topic involves complex interactions between multiple systems.",
  };
}

function makeSelectMissingWord(id, num, topic, audioScript) {
  const truncatedScript = audioScript.replace(/The decisions made in the next ten to fifteen years will determine outcomes for generations to come\. I would like you to keep these dimensions in mind as we work through the case studies today\./, "The decisions made in the next ten to fifteen years will determine outcomes for generations to [beep]");
  return {
    id: `${id}-q${pad(num)}`,
    questionType: "select_missing_word",
    prompt: `Question ${num}. You will hear a recording about ${topic}. At the end, the final words have been replaced by a beep. Select the option that correctly completes the recording.`,
    audioScript: truncatedScript,
    options: ["come", "start", "forget", "imagine"],
    correctAnswer: "come",
    explanation: "The sentence reads '...will determine outcomes for generations to come.' The word 'come' completes the fixed phrase 'for generations to come' which fits the context of the lecture's conclusion.",
  };
}

function makeHighlightIncorrectWords(id, num, topic, audioScript) {
  // Take first 3 sentences of script and corrupt 3 words
  const correctWords = ["considerable", "historical", "qualitatively"];
  const incorrectWords = ["substantial", "scientific", "fundamentally"];
  const displayTranscript = `Today we are going to examine a topic that has attracted ${incorrectWords[0]} scientific and policy attention in recent years: ${topic}. I want to begin by giving you some ${incorrectWords[1]} context, then move on to current research findings, and finish with a look at some of the most pressing challenges. The tools and methodologies available to modern researchers are ${incorrectWords[2]} different from anything available before.`;
  const correctTranscript = `Today we are going to examine a topic that has attracted ${correctWords[0]} scientific and policy attention in recent years: ${topic}. I want to begin by giving you some ${correctWords[1]} context, then move on to current research findings, and finish with a look at some of the most pressing challenges. The tools and methodologies available to modern researchers are ${correctWords[2]} different from anything available before.`;
  return {
    id: `${id}-q${pad(num)}`,
    questionType: "highlight_incorrect_words",
    prompt: `Question ${num}. Listen to the recording about ${topic}. The transcript below differs from it in several places — click the words that are different from what the speaker says.`,
    audioScript: correctTranscript,
    displayTranscript,
    incorrectWords,
    correctWords,
    explanation: `Three words in the transcript differ from the audio: '${incorrectWords[0]}' should be '${correctWords[0]}', '${incorrectWords[1]}' should be '${correctWords[1]}', and '${incorrectWords[2]}' should be '${correctWords[2]}'.`,
  };
}

function makeWriteFromDictation(id, num, sentences) {
  const sentence = sentences[num % sentences.length];
  return {
    id: `${id}-q${pad(num)}`,
    questionType: "write_from_dictation",
    prompt: `Question ${num}. You will hear a sentence. Type it exactly as you hear it.`,
    audioScript: sentence,
    correctAnswer: sentence,
    explanation: "Type the sentence exactly as you hear it, preserving all words, punctuation cues, and word order.",
  };
}

const DICTATION_SENTENCES = [
  "The complexity of the system means that single-factor explanations consistently fail to account for observed patterns.",
  "International coordination is essential because the challenges involved do not respect national borders.",
  "The economic costs of inaction are estimated to significantly outweigh the costs of proactive intervention.",
  "Adaptive management allows policies to be updated as new evidence emerges from ongoing research.",
  "Digital data collection and computational models have transformed what researchers know about this phenomenon.",
  "Tipping points represent abrupt transitions that can move a system rapidly from one state to another.",
  "The decisions made in the next decade will determine outcomes that extend well into the following century.",
  "Improved monitoring systems can detect early warning signals before critical thresholds are reached.",
];

// ── Build one test ─────────────────────────────────────────────────────────────
function buildTest(testNum) {
  const num3 = pad(testNum);
  const id = `pte-listening-${num3}`;
  const { topic, type } = TOPICS[testNum - 1];
  const audioScript = type === "lecture" ? makeLectureScript(topic) : makeInterviewScript(topic);

  // Build 17 items in PTE order
  const questions = [];
  let qn = 1;

  // Items 1-2: summarize_spoken_text
  questions.push(makeSummarizeSpokenText(id, qn++, topic, audioScript));
  questions.push(makeSummarizeSpokenText(id, qn++, topic + " — Key Dimensions", audioScript));

  // Items 3-4: multiple_choice_multiple
  questions.push(makeMultipleChoiceMultiple(id, qn++, topic, audioScript));
  questions.push({
    ...makeMultipleChoiceMultiple(id, qn++, topic, audioScript),
    question: `Which TWO statements accurately reflect what the speaker says about responses to ${topic}?`,
    options: [
      "Adaptive management requires policies to be flexible as new evidence emerges",
      "All international agreements related to this topic have been fully implemented",
      "Better monitoring technology is increasingly available and affordable",
      "The research community in this field is competitive and unwelcoming to newcomers",
      "Real-world stakes in this field are considered minor by most researchers",
    ],
    correctAnswers: [
      "Adaptive management requires policies to be flexible as new evidence emerges",
      "Better monitoring technology is increasingly available and affordable",
    ],
  });

  // Items 5-7: fill_in_blanks_listening
  questions.push(makeFillInBlanksListening(id, qn++, topic, audioScript));
  questions.push({
    id: `${id}-q${pad(qn++)}`,
    questionType: "fill_in_blanks_listening",
    prompt: `Fill in the blanks (recording 2). Type the missing word in each blank as you listen to the passage about ${topic}.`,
    audioScript,
    transcript: `What the evidence consistently shows is that ${topic} involves __1__ interactions between multiple systems. From an economic standpoint, the costs of __2__ in this area are substantial. Looking forward, the trajectory will depend on __3__, political will, and effective communication between scientists and policymakers.`,
    correctAnswers: ["complex", "inaction", "innovation"],
    explanation: "These three words appear in the audio at the corresponding blank positions in the transcript.",
  });
  questions.push({
    id: `${id}-q${pad(qn++)}`,
    questionType: "fill_in_blanks_listening",
    prompt: `Fill in the blanks (recording 3). Type the missing word in each blank as you listen to the passage about ${topic}.`,
    audioScript,
    transcript: `The international dimension is also __1__. ${topic} does not respect national borders, which means that coordinated, __2__ responses are necessary. The decisions made in the next ten to fifteen years will determine outcomes for __3__ to come.`,
    correctAnswers: ["critical", "multilateral", "generations"],
    explanation: "These words are spoken in the audio and correspond to the blanks in the transcript.",
  });

  // Items 8-9: highlight_correct_summary
  questions.push(makeHighlightCorrectSummary(id, qn++, topic, audioScript));
  questions.push({
    id: `${id}-q${pad(qn++)}`,
    questionType: "highlight_correct_summary",
    prompt: `Highlight the correct summary (recording 2). Listen, then select the paragraph that best summarises the talk on ${topic}.`,
    audioScript,
    options: [
      `The audio emphasises that ${topic} requires adaptive management and improved monitoring, because the system can undergo abrupt transitions at tipping points, and the pace of change is unprecedented.`,
      `The speaker claims that ${topic} is fully understood and that all the major scientific questions in this area have already been resolved by existing research.`,
      `The audio focuses solely on the historical background of ${topic} and does not address any current research findings or policy implications.`,
    ],
    correctAnswer: `The audio emphasises that ${topic} requires adaptive management and improved monitoring, because the system can undergo abrupt transitions at tipping points, and the pace of change is unprecedented.`,
    explanation: "Option A is the only summary that accurately reflects the audio's discussion of tipping points, the need for adaptive management, and improved monitoring.",
  });

  // Items 10-11: multiple_choice_single
  questions.push(makeMultipleChoiceSingle(id, qn++, topic, audioScript));
  questions.push({
    id: `${id}-q${pad(qn++)}`,
    questionType: "multiple_choice_single",
    audioScript,
    question: `According to the audio on ${topic}, what is the key principle for designing effective policies in this field?`,
    options: [
      "Locking in fixed approaches based on the best current scientific knowledge",
      "Delegating all policy decisions to international bodies",
      "Adaptive management — designing policies that can be updated as new evidence emerges",
      "Prioritising economic growth over scientific caution",
    ],
    correctAnswer: "Adaptive management — designing policies that can be updated as new evidence emerges",
    explanation: "The audio explicitly describes adaptive management as the key principle: 'designing policies that can be updated as new evidence emerges, rather than locking in fixed approaches.'",
  });

  // Items 12-13: select_missing_word
  questions.push(makeSelectMissingWord(id, qn++, topic, audioScript));
  questions.push({
    id: `${id}-q${pad(qn++)}`,
    questionType: "select_missing_word",
    prompt: `Select the missing word (recording 2). The final words are replaced by a beep — choose the correct completion for the talk on ${topic}.`,
    audioScript: audioScript.replace(
      "We've seen some promising developments in international agreements over the past decade, but the pace of action remains too slow relative to the pace of change.",
      "We've seen some promising developments in international agreements over the past decade, but the pace of action remains too slow relative to the pace of [beep]"
    ),
    options: ["change", "funding", "debate", "history"],
    correctAnswer: "change",
    explanation: "The sentence ends 'too slow relative to the pace of change' — the word 'change' completes the phrase that directly contrasts the pace of policy action with the pace of environmental or systemic change.",
  });

  // Items 14-15: highlight_incorrect_words
  questions.push(makeHighlightIncorrectWords(id, qn++, topic, audioScript));
  questions.push({
    id: `${id}-q${pad(qn++)}`,
    questionType: "highlight_incorrect_words",
    prompt: `Highlight the incorrect words (recording 2). Click the words in the transcript that differ from the recording about ${topic}.`,
    audioScript: `What the evidence consistently shows is that ${topic} involves complex interactions between multiple systems. Researchers have found that simplistic, single-factor explanations consistently fail to account for observed patterns. This has significant implications for how we design interventions and policies.`,
    displayTranscript: `What the evidence consistently shows is that ${topic} involves basic interactions between multiple systems. Researchers have found that simplistic, single-factor explanations consistently fail to account for measured patterns. This has major implications for how we design interventions and policies.`,
    incorrectWords: ["basic", "measured", "major"],
    correctWords: ["complex", "observed", "significant"],
    explanation: "Three words differ from the audio: 'basic' should be 'complex', 'measured' should be 'observed', and 'major' should be 'significant'.",
  });

  // Items 16-17: write_from_dictation
  questions.push(makeWriteFromDictation(id, qn++, DICTATION_SENTENCES));
  questions.push(makeWriteFromDictation(id, qn++, DICTATION_SENTENCES));

  return {
    id,
    exam: "pte",
    section: "listening",
    type: "section",
    title: `PTE Academic Listening Practice Test ${testNum}`,
    topic,
    durationSeconds: 2700,
    questionCount: questions.length,
    instructions: "Listen to the audio for each item and respond according to the question type. In the real PTE exam you hear actual audio; here the transcript is shown for study purposes.",
    questions,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("Rebuilding PTE Academic Listening tests 001–060...");
let built = 0;
for (let n = 1; n <= 60; n++) {
  const test = buildTest(n);
  const outPath = path.join(OUT_DIR, `test-${pad(n)}.json`);
  fs.writeFileSync(outPath, JSON.stringify(test, null, 2));
  const types = [...new Set(test.questions.map(q => q.questionType))];
  process.stdout.write(`  ✓ test-${pad(n)}.json  [${types.join(', ')}]\n`);
  built++;
}
console.log(`\nDone. ${built} tests written to ${OUT_DIR}`);
