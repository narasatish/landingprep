/* global window */
"use strict";
// LandingPrep — "Prep Lessons": slide-deck (PPT-style) lessons per exam section.
// Teach first (tips, tricks, traps, examples), then practise with mocks.
// Schema: window.LP_SLIDE_DECKS[id] = { id, exam, examName, section, emoji, title,
//   summary, slides:[{ emoji, title, points:[...], example?:{label,text}, tip?, warn? }] }
// window.LP_SLIDE_DECK_PLAN drives the picker grid (what's ready + coming soon).
(function () {
  const ieltsListening = {
    id: "ielts-listening", exam: "ielts", examName: "IELTS", section: "Listening", emoji: "🎧",
    title: "IELTS Listening — Tips, Tricks & Strategy",
    summary: "Everything you need to master IELTS Listening before you practise: format, all 8 question types, traps, and a section-by-section game plan.",
    slides: [
      { emoji: "🎧", title: "Welcome to IELTS Listening", points: [
        "30 minutes of audio + 10 minutes to transfer answers (paper) — or answers entered live (computer).",
        "40 questions, 4 sections, played ONCE only — no replays.",
        "Same Listening test for Academic and General Training.",
        "This lesson = learn the strategy. Then practise with our free mocks." ] },
      { emoji: "🗺️", title: "The format at a glance", points: [
        "Section 1: everyday conversation between 2 people (e.g. booking).",
        "Section 2: a monologue on an everyday topic (e.g. a tour).",
        "Section 3: academic discussion (2–4 speakers, e.g. students + tutor).",
        "Section 4: an academic lecture (1 speaker, no pause in the middle)." ],
        tip: "Difficulty increases from Section 1 → 4. Bank easy marks early." },
      { emoji: "📊", title: "How it's scored (band table)", points: [
        "Raw score out of 40 → converted to a band 0–9.",
        "≈ 35/40 = Band 8 · 30/40 = Band 7 · 23/40 = Band 6 · 16/40 = Band 5.",
        "Every question is worth 1 mark — no negative marking.",
        "So ALWAYS guess; never leave a blank." ] },
      { emoji: "📝", title: "The 8 question types", points: [
        "1) Multiple choice  2) Matching  3) Plan/map/diagram labelling",
        "4) Form/note/table/flow-chart completion  5) Sentence completion",
        "6) Short-answer questions",
        "You'll see 3–4 of these per section." ],
        tip: "Each type has its own trick — the next slides cover them." },
      { emoji: "🔘", title: "Multiple choice", points: [
        "Read the question + ALL options before the audio starts.",
        "Underline the key difference between options.",
        "Watch for the speaker rejecting an option ('I wanted A, but actually B').",
        "The answer is what they FINALLY decide — not the first thing said." ],
        example: { label: "Trap", text: "'I'll take the 9am… no wait, make it the 10:30.' → answer is 10:30." } },
      { emoji: "📋", title: "Form / note / table completion", points: [
        "Most common in Section 1 (names, numbers, addresses, dates).",
        "Predict the TYPE of answer needed: a number? a name? a time?",
        "Spelling and numbers must be exact — one wrong letter = 0 marks.",
        "Write what you hear; don't change the word form." ],
        warn: "Obey the word limit, e.g. 'NO MORE THAN TWO WORDS AND/OR A NUMBER'." },
      { emoji: "✍️", title: "Sentence & summary completion", points: [
        "The sentence paraphrases the audio — listen for synonyms, not exact words.",
        "Grammar must fit: singular/plural, verb tense, article.",
        "Read the sentence before AND after the gap for context.",
        "Only write the missing word(s) — copy spelling exactly." ] },
      { emoji: "🔗", title: "Matching", points: [
        "Match items (e.g. people → opinions, places → features).",
        "Options may be used once, more than once, or not at all — check the rule.",
        "Cross out options as you confirm them.",
        "Answers usually come in the order the speakers are discussed." ] },
      { emoji: "🗺️", title: "Map / plan / diagram labelling", points: [
        "Orient yourself FIRST: find 'You are here', the entrance, North.",
        "Follow direction words: left, right, opposite, next to, beyond, corner.",
        "Track the speaker's 'route' with your finger/eyes as they describe it.",
        "Label as you go — don't wait until the end." ],
        example: { label: "Listen for", text: "'Go past the library and it's the second door on your right.'" } },
      { emoji: "🔢", title: "Short-answer questions", points: [
        "Answer with words straight from the audio.",
        "Respect the word limit strictly.",
        "Common in Section 4 (academic detail).",
        "Don't add extra words — they can make a correct answer wrong." ] },
      { emoji: "📏", title: "The word-limit rule (read it!)", points: [
        "'ONE WORD ONLY', 'NO MORE THAN TWO WORDS', 'TWO WORDS AND/OR A NUMBER'.",
        "Hyphenated words (e.g. 'check-in') count as ONE word.",
        "A number like '20' counts as a number, not a word.",
        "Break the limit = automatic 0, even if the meaning is right." ],
        warn: "This is the #1 avoidable mistake. Underline the limit before you listen." },
      { emoji: "🔤", title: "Spelling & capital letters", points: [
        "Both British and American spelling are accepted (colour / color).",
        "Spell names exactly — they're often spelled out aloud, so listen letter-by-letter.",
        "WRITE IN CAPITALS on paper to avoid messy-handwriting errors.",
        "Days, months and proper nouns need a capital letter." ] },
      { emoji: "🔮", title: "Predict before you listen", points: [
        "Use the pause before each section to read the questions.",
        "Predict each answer's type and a likely synonym.",
        "Underline keywords you'll 'listen out' for.",
        "Prediction turns listening from reactive to active." ],
        tip: "10–15 seconds of smart prediction can win you 2–3 marks." },
      { emoji: "🎯", title: "Listen for synonyms (paraphrasing)", points: [
        "The audio almost NEVER uses the exact words in the question.",
        "Example: question says 'cheap' → audio says 'inexpensive / good value'.",
        "Train your ear on synonym families (big/large, start/begin, buy/purchase).",
        "Catch the MEANING, not the matching word." ],
        example: { label: "Paraphrase", text: "Q: 'free of charge' → Audio: 'there's no cost / it's complimentary'." } },
      { emoji: "🪤", title: "Distractors — the classic traps", points: [
        "Speakers change their mind ('Actually, let's not…').",
        "Two numbers/times are mentioned — only one is the answer.",
        "A word from the question is said, but in the WRONG context.",
        "Negatives flip meaning: 'It's NOT on Monday.'" ],
        warn: "If an answer feels too easy/early, stay alert — a correction may follow." },
      { emoji: "➡️", title: "Answers come IN ORDER", points: [
        "Within a section, answers appear in the same order as the questions.",
        "If you miss one, you can tell roughly where you are.",
        "Map/matching sets may jump — but completion sets follow the audio.",
        "Use this to know which question you should be on." ] },
      { emoji: "🏃", title: "If you miss one — MOVE ON", points: [
        "Never freeze on a missed answer; you'll lose the next 2–3 too.",
        "Leave it blank, refocus, and catch the next question.",
        "Come back and GUESS during transfer time.",
        "Protecting your momentum is worth more than one mark." ],
        tip: "A calm 'let it go' mindset is a real Listening skill." },
      { emoji: "1️⃣", title: "Section 1 strategy (everyday)", points: [
        "Usually a form to complete: name, phone, address, date, price.",
        "Practise hearing numbers, postcodes and spelled-out names.",
        "Easiest section — aim for full marks here.",
        "Double-zero is said 'double oh'; 1300 is 'thirteen hundred'." ] },
      { emoji: "2️⃣", title: "Section 2 strategy (monologue)", points: [
        "One speaker describes a place/event (tour, facility, plan).",
        "Often map labelling + multiple choice.",
        "Visualise the place; track directions as described.",
        "Signpost words ('firstly', 'on your left', 'finally') guide you." ] },
      { emoji: "3️⃣", title: "Section 3 strategy (academic discussion)", points: [
        "2–4 speakers (students + tutor) discuss a project/assignment.",
        "Track WHO says WHAT — opinions matter for matching.",
        "Hardest for many: speakers interrupt and agree/disagree.",
        "Listen for opinion language: 'I think', 'I'm not sure', 'exactly'." ] },
      { emoji: "4️⃣", title: "Section 4 strategy (lecture)", points: [
        "A single academic lecture, NO pause in the middle — stay focused.",
        "Usually note/sentence completion following the lecture's structure.",
        "Headings/sub-headings on the page mirror the lecture order.",
        "If you drift off, use the next heading to re-anchor." ] },
      { emoji: "📨", title: "Transfer time (paper test)", points: [
        "You get 10 extra minutes to copy answers to the answer sheet.",
        "Now is the time to fix spelling, capitals and word limits.",
        "Fill EVERY blank — guess intelligently using context.",
        "Computer test: no transfer time, so type carefully as you go." ] },
      { emoji: "🚫", title: "Top avoidable mistakes", points: [
        "Breaking the word limit. ❌",
        "Misspelling a word you heard correctly. ❌",
        "Leaving blanks instead of guessing. ❌",
        "Panicking after one missed answer. ❌" ],
        tip: "Avoid these four and most students jump half a band." },
      { emoji: "🎚️", title: "Train your ear (daily)", points: [
        "Listen to English podcasts/news at natural speed (BBC, TED).",
        "Practise different accents: British, Australian, North American.",
        "Do dictation: write what you hear, then check.",
        "Shadowing: repeat aloud right after the speaker." ] },
      { emoji: "🧩", title: "Use mocks the smart way", points: [
        "Do a full timed Listening mock under exam conditions.",
        "Review EVERY wrong answer — read the transcript, find where you slipped.",
        "Note your error TYPE (spelling? trap? word limit?).",
        "Re-drill that weakness, then take another mock." ],
        tip: "Reviewing transcripts is where the real score gains happen." },
      { emoji: "📅", title: "Day before the test", points: [
        "Do one light section, not a full exam — stay fresh.",
        "Prepare ID, pens/pencils, and confirm the test centre/time.",
        "Sleep well; tired ears miss details.",
        "Quick review of the word-limit and spelling rules." ] },
      { emoji: "✅", title: "Test-day checklist", points: [
        "Arrive early; settle your nerves.",
        "Read instructions + word limits the moment a section opens.",
        "Predict, underline keywords, then listen actively.",
        "Guess every blank; transfer carefully." ] },
      { emoji: "🧠", title: "Mindset that scores", points: [
        "Stay calm — one miss is not a disaster.",
        "Active prediction beats passive listening.",
        "Trust meaning (synonyms), not word-matching.",
        "Accuracy on the basics (spelling, limits) = easy marks." ] },
      { emoji: "💻", title: "Computer vs paper test", points: [
        "Computer-delivered: type answers as you listen — there's NO 10-minute transfer time.",
        "You get headphones with your own volume control + on-screen highlight/notes tools.",
        "Paper-based: audio plays in the room; you transfer answers at the end.",
        "Content, timing and scoring are identical — choose the format you're comfortable with." ],
        tip: "On computer, type carefully the first time — you can't 'fix it in transfer'." },
      { emoji: "🚀", title: "You're ready — now practise!", points: [
        "You now know the format, all question types, traps and section tactics.",
        "Next step: take a free IELTS Listening mock and apply this.",
        "Review, find your error type, and repeat.",
        "Teach → Practise → Review → Improve. Viel Erfolg! 🎉" ],
        tip: "Open the Exam Hub → IELTS → Listening to start a free mock now." },
    ],
  };

  window.LP_SLIDE_DECKS = { "ielts-listening": ieltsListening };

  // Picker grid: shows every exam's sections; ready=true ones are clickable now.
  window.LP_SLIDE_DECK_PLAN = [
    { exam: "ielts", examName: "IELTS", emoji: "🇬🇧", decks: [
      { id: "ielts-listening", section: "Listening", emoji: "🎧", ready: true },
      { section: "Reading", emoji: "📖", ready: false },
      { section: "Writing", emoji: "✍️", ready: false },
      { section: "Speaking", emoji: "🗣️", ready: false } ] },
    { exam: "toefl", examName: "TOEFL iBT", emoji: "🦉", decks: [
      { section: "Reading", emoji: "📖", ready: false }, { section: "Listening", emoji: "🎧", ready: false },
      { section: "Speaking", emoji: "🗣️", ready: false }, { section: "Writing", emoji: "✍️", ready: false } ] },
    { exam: "pte", examName: "PTE Academic", emoji: "💻", decks: [
      { section: "Speaking & Writing", emoji: "🗣️", ready: false }, { section: "Reading", emoji: "📖", ready: false },
      { section: "Listening", emoji: "🎧", ready: false } ] },
    { exam: "gre", examName: "GRE", emoji: "📐", decks: [
      { section: "Verbal", emoji: "📚", ready: false }, { section: "Quant", emoji: "🔢", ready: false },
      { section: "Analytical Writing", emoji: "✍️", ready: false } ] },
    { exam: "gmat", examName: "GMAT Focus", emoji: "📊", decks: [
      { section: "Quant", emoji: "🔢", ready: false }, { section: "Verbal", emoji: "📚", ready: false },
      { section: "Data Insights", emoji: "📈", ready: false } ] },
    { exam: "celpip", examName: "CELPIP", emoji: "🍁", decks: [
      { section: "Listening", emoji: "🎧", ready: false }, { section: "Reading", emoji: "📖", ready: false },
      { section: "Writing", emoji: "✍️", ready: false }, { section: "Speaking", emoji: "🗣️", ready: false } ] },
    { exam: "duolingo", examName: "Duolingo", emoji: "🟢", decks: [
      { section: "Full Test Strategy", emoji: "⚡", ready: false } ] },
  ];
})();
