"use strict";
(function() {
  const ieltsListening = {
    id: "ielts-listening",
    exam: "ielts",
    examName: "IELTS",
    section: "Listening",
    emoji: "\u{1F3A7}",
    title: "IELTS Listening \u2014 Tips, Tricks & Strategy",
    summary: "Everything you need to master IELTS Listening before you practise: format, all 8 question types, traps, and a section-by-section game plan.",
    slides: [
      { emoji: "\u{1F3A7}", title: "Welcome to IELTS Listening", points: [
        "30 minutes of audio + 10 minutes to transfer answers (paper) \u2014 or answers entered live (computer).",
        "40 questions, 4 sections, played ONCE only \u2014 no replays.",
        "Same Listening test for Academic and General Training.",
        "This lesson = learn the strategy. Then practise with our free mocks."
      ] },
      {
        emoji: "\u{1F5FA}\uFE0F",
        title: "The format at a glance",
        points: [
          "Section 1: everyday conversation between 2 people (e.g. booking).",
          "Section 2: a monologue on an everyday topic (e.g. a tour).",
          "Section 3: academic discussion (2\u20134 speakers, e.g. students + tutor).",
          "Section 4: an academic lecture (1 speaker, no pause in the middle)."
        ],
        tip: "Difficulty increases from Section 1 \u2192 4. Bank easy marks early."
      },
      { emoji: "\u{1F4CA}", title: "How it's scored (band table)", points: [
        "Raw score out of 40 \u2192 converted to a band 0\u20139.",
        "\u2248 35/40 = Band 8 \xB7 30/40 = Band 7 \xB7 23/40 = Band 6 \xB7 16/40 = Band 5.",
        "Every question is worth 1 mark \u2014 no negative marking.",
        "So ALWAYS guess; never leave a blank."
      ] },
      {
        emoji: "\u{1F4DD}",
        title: "The 8 question types",
        points: [
          "1) Multiple choice  2) Matching  3) Plan/map/diagram labelling",
          "4) Form/note/table/flow-chart completion  5) Sentence completion",
          "6) Short-answer questions",
          "You'll see 3\u20134 of these per section."
        ],
        tip: "Each type has its own trick \u2014 the next slides cover them."
      },
      {
        emoji: "\u{1F518}",
        title: "Multiple choice",
        points: [
          "Read the question + ALL options before the audio starts.",
          "Underline the key difference between options.",
          "Watch for the speaker rejecting an option ('I wanted A, but actually B').",
          "The answer is what they FINALLY decide \u2014 not the first thing said."
        ],
        example: { label: "Trap", text: "'I'll take the 9am\u2026 no wait, make it the 10:30.' \u2192 answer is 10:30." }
      },
      {
        emoji: "\u{1F4CB}",
        title: "Form / note / table completion",
        points: [
          "Most common in Section 1 (names, numbers, addresses, dates).",
          "Predict the TYPE of answer needed: a number? a name? a time?",
          "Spelling and numbers must be exact \u2014 one wrong letter = 0 marks.",
          "Write what you hear; don't change the word form."
        ],
        warn: "Obey the word limit, e.g. 'NO MORE THAN TWO WORDS AND/OR A NUMBER'."
      },
      { emoji: "\u270D\uFE0F", title: "Sentence & summary completion", points: [
        "The sentence paraphrases the audio \u2014 listen for synonyms, not exact words.",
        "Grammar must fit: singular/plural, verb tense, article.",
        "Read the sentence before AND after the gap for context.",
        "Only write the missing word(s) \u2014 copy spelling exactly."
      ] },
      { emoji: "\u{1F517}", title: "Matching", points: [
        "Match items (e.g. people \u2192 opinions, places \u2192 features).",
        "Options may be used once, more than once, or not at all \u2014 check the rule.",
        "Cross out options as you confirm them.",
        "Answers usually come in the order the speakers are discussed."
      ] },
      {
        emoji: "\u{1F5FA}\uFE0F",
        title: "Map / plan / diagram labelling",
        points: [
          "Orient yourself FIRST: find 'You are here', the entrance, North.",
          "Follow direction words: left, right, opposite, next to, beyond, corner.",
          "Track the speaker's 'route' with your finger/eyes as they describe it.",
          "Label as you go \u2014 don't wait until the end."
        ],
        example: { label: "Listen for", text: "'Go past the library and it's the second door on your right.'" }
      },
      { emoji: "\u{1F522}", title: "Short-answer questions", points: [
        "Answer with words straight from the audio.",
        "Respect the word limit strictly.",
        "Common in Section 4 (academic detail).",
        "Don't add extra words \u2014 they can make a correct answer wrong."
      ] },
      {
        emoji: "\u{1F4CF}",
        title: "The word-limit rule (read it!)",
        points: [
          "'ONE WORD ONLY', 'NO MORE THAN TWO WORDS', 'TWO WORDS AND/OR A NUMBER'.",
          "Hyphenated words (e.g. 'check-in') count as ONE word.",
          "A number like '20' counts as a number, not a word.",
          "Break the limit = automatic 0, even if the meaning is right."
        ],
        warn: "This is the #1 avoidable mistake. Underline the limit before you listen."
      },
      { emoji: "\u{1F524}", title: "Spelling & capital letters", points: [
        "Both British and American spelling are accepted (colour / color).",
        "Spell names exactly \u2014 they're often spelled out aloud, so listen letter-by-letter.",
        "WRITE IN CAPITALS on paper to avoid messy-handwriting errors.",
        "Days, months and proper nouns need a capital letter."
      ] },
      {
        emoji: "\u{1F52E}",
        title: "Predict before you listen",
        points: [
          "Use the pause before each section to read the questions.",
          "Predict each answer's type and a likely synonym.",
          "Underline keywords you'll 'listen out' for.",
          "Prediction turns listening from reactive to active."
        ],
        tip: "10\u201315 seconds of smart prediction can win you 2\u20133 marks."
      },
      {
        emoji: "\u{1F3AF}",
        title: "Listen for synonyms (paraphrasing)",
        points: [
          "The audio almost NEVER uses the exact words in the question.",
          "Example: question says 'cheap' \u2192 audio says 'inexpensive / good value'.",
          "Train your ear on synonym families (big/large, start/begin, buy/purchase).",
          "Catch the MEANING, not the matching word."
        ],
        example: { label: "Paraphrase", text: "Q: 'free of charge' \u2192 Audio: 'there's no cost / it's complimentary'." }
      },
      {
        emoji: "\u{1FAA4}",
        title: "Distractors \u2014 the classic traps",
        points: [
          "Speakers change their mind ('Actually, let's not\u2026').",
          "Two numbers/times are mentioned \u2014 only one is the answer.",
          "A word from the question is said, but in the WRONG context.",
          "Negatives flip meaning: 'It's NOT on Monday.'"
        ],
        warn: "If an answer feels too easy/early, stay alert \u2014 a correction may follow."
      },
      { emoji: "\u27A1\uFE0F", title: "Answers come IN ORDER", points: [
        "Within a section, answers appear in the same order as the questions.",
        "If you miss one, you can tell roughly where you are.",
        "Map/matching sets may jump \u2014 but completion sets follow the audio.",
        "Use this to know which question you should be on."
      ] },
      {
        emoji: "\u{1F3C3}",
        title: "If you miss one \u2014 MOVE ON",
        points: [
          "Never freeze on a missed answer; you'll lose the next 2\u20133 too.",
          "Leave it blank, refocus, and catch the next question.",
          "Come back and GUESS during transfer time.",
          "Protecting your momentum is worth more than one mark."
        ],
        tip: "A calm 'let it go' mindset is a real Listening skill."
      },
      { emoji: "1\uFE0F\u20E3", title: "Section 1 strategy (everyday)", points: [
        "Usually a form to complete: name, phone, address, date, price.",
        "Practise hearing numbers, postcodes and spelled-out names.",
        "Easiest section \u2014 aim for full marks here.",
        "Double-zero is said 'double oh'; 1300 is 'thirteen hundred'."
      ] },
      { emoji: "2\uFE0F\u20E3", title: "Section 2 strategy (monologue)", points: [
        "One speaker describes a place/event (tour, facility, plan).",
        "Often map labelling + multiple choice.",
        "Visualise the place; track directions as described.",
        "Signpost words ('firstly', 'on your left', 'finally') guide you."
      ] },
      { emoji: "3\uFE0F\u20E3", title: "Section 3 strategy (academic discussion)", points: [
        "2\u20134 speakers (students + tutor) discuss a project/assignment.",
        "Track WHO says WHAT \u2014 opinions matter for matching.",
        "Hardest for many: speakers interrupt and agree/disagree.",
        "Listen for opinion language: 'I think', 'I'm not sure', 'exactly'."
      ] },
      { emoji: "4\uFE0F\u20E3", title: "Section 4 strategy (lecture)", points: [
        "A single academic lecture, NO pause in the middle \u2014 stay focused.",
        "Usually note/sentence completion following the lecture's structure.",
        "Headings/sub-headings on the page mirror the lecture order.",
        "If you drift off, use the next heading to re-anchor."
      ] },
      { emoji: "\u{1F4E8}", title: "Transfer time (paper test)", points: [
        "You get 10 extra minutes to copy answers to the answer sheet.",
        "Now is the time to fix spelling, capitals and word limits.",
        "Fill EVERY blank \u2014 guess intelligently using context.",
        "Computer test: no transfer time, so type carefully as you go."
      ] },
      {
        emoji: "\u{1F6AB}",
        title: "Top avoidable mistakes",
        points: [
          "Breaking the word limit. \u274C",
          "Misspelling a word you heard correctly. \u274C",
          "Leaving blanks instead of guessing. \u274C",
          "Panicking after one missed answer. \u274C"
        ],
        tip: "Avoid these four and most students jump half a band."
      },
      { emoji: "\u{1F39A}\uFE0F", title: "Train your ear (daily)", points: [
        "Listen to English podcasts/news at natural speed (BBC, TED).",
        "Practise different accents: British, Australian, North American.",
        "Do dictation: write what you hear, then check.",
        "Shadowing: repeat aloud right after the speaker."
      ] },
      {
        emoji: "\u{1F9E9}",
        title: "Use mocks the smart way",
        points: [
          "Do a full timed Listening mock under exam conditions.",
          "Review EVERY wrong answer \u2014 read the transcript, find where you slipped.",
          "Note your error TYPE (spelling? trap? word limit?).",
          "Re-drill that weakness, then take another mock."
        ],
        tip: "Reviewing transcripts is where the real score gains happen."
      },
      { emoji: "\u{1F4C5}", title: "Day before the test", points: [
        "Do one light section, not a full exam \u2014 stay fresh.",
        "Prepare ID, pens/pencils, and confirm the test centre/time.",
        "Sleep well; tired ears miss details.",
        "Quick review of the word-limit and spelling rules."
      ] },
      { emoji: "\u2705", title: "Test-day checklist", points: [
        "Arrive early; settle your nerves.",
        "Read instructions + word limits the moment a section opens.",
        "Predict, underline keywords, then listen actively.",
        "Guess every blank; transfer carefully."
      ] },
      { emoji: "\u{1F9E0}", title: "Mindset that scores", points: [
        "Stay calm \u2014 one miss is not a disaster.",
        "Active prediction beats passive listening.",
        "Trust meaning (synonyms), not word-matching.",
        "Accuracy on the basics (spelling, limits) = easy marks."
      ] },
      {
        emoji: "\u{1F4BB}",
        title: "Computer vs paper test",
        points: [
          "Computer-delivered: type answers as you listen \u2014 there's NO 10-minute transfer time.",
          "You get headphones with your own volume control + on-screen highlight/notes tools.",
          "Paper-based: audio plays in the room; you transfer answers at the end.",
          "Content, timing and scoring are identical \u2014 choose the format you're comfortable with."
        ],
        tip: "On computer, type carefully the first time \u2014 you can't 'fix it in transfer'."
      },
      {
        emoji: "\u{1F680}",
        title: "You're ready \u2014 now practise!",
        points: [
          "You now know the format, all question types, traps and section tactics.",
          "Next step: take a free IELTS Listening mock and apply this.",
          "Review, find your error type, and repeat.",
          "Teach \u2192 Practise \u2192 Review \u2192 Improve. Viel Erfolg! \u{1F389}"
        ],
        tip: "Open the Exam Hub \u2192 IELTS \u2192 Listening to start a free mock now."
      }
    ]
  };
  window.LP_SLIDE_DECKS = { "ielts-listening": ieltsListening };
  window.LP_SLIDE_DECK_PLAN = [
    { exam: "ielts", examName: "IELTS", emoji: "\u{1F1EC}\u{1F1E7}", decks: [
      { id: "ielts-listening", section: "Listening", emoji: "\u{1F3A7}", ready: true },
      { section: "Reading", emoji: "\u{1F4D6}", ready: false },
      { section: "Writing", emoji: "\u270D\uFE0F", ready: false },
      { section: "Speaking", emoji: "\u{1F5E3}\uFE0F", ready: false }
    ] },
    { exam: "toefl", examName: "TOEFL iBT", emoji: "\u{1F989}", decks: [
      { section: "Reading", emoji: "\u{1F4D6}", ready: false },
      { section: "Listening", emoji: "\u{1F3A7}", ready: false },
      { section: "Speaking", emoji: "\u{1F5E3}\uFE0F", ready: false },
      { section: "Writing", emoji: "\u270D\uFE0F", ready: false }
    ] },
    { exam: "pte", examName: "PTE Academic", emoji: "\u{1F4BB}", decks: [
      { section: "Speaking & Writing", emoji: "\u{1F5E3}\uFE0F", ready: false },
      { section: "Reading", emoji: "\u{1F4D6}", ready: false },
      { section: "Listening", emoji: "\u{1F3A7}", ready: false }
    ] },
    { exam: "gre", examName: "GRE", emoji: "\u{1F4D0}", decks: [
      { section: "Verbal", emoji: "\u{1F4DA}", ready: false },
      { section: "Quant", emoji: "\u{1F522}", ready: false },
      { section: "Analytical Writing", emoji: "\u270D\uFE0F", ready: false }
    ] },
    { exam: "gmat", examName: "GMAT Focus", emoji: "\u{1F4CA}", decks: [
      { section: "Quant", emoji: "\u{1F522}", ready: false },
      { section: "Verbal", emoji: "\u{1F4DA}", ready: false },
      { section: "Data Insights", emoji: "\u{1F4C8}", ready: false }
    ] },
    { exam: "celpip", examName: "CELPIP", emoji: "\u{1F341}", decks: [
      { section: "Listening", emoji: "\u{1F3A7}", ready: false },
      { section: "Reading", emoji: "\u{1F4D6}", ready: false },
      { section: "Writing", emoji: "\u270D\uFE0F", ready: false },
      { section: "Speaking", emoji: "\u{1F5E3}\uFE0F", ready: false }
    ] },
    { exam: "duolingo", examName: "Duolingo", emoji: "\u{1F7E2}", decks: [
      { section: "Full Test Strategy", emoji: "\u26A1", ready: false }
    ] }
  ];
})();
