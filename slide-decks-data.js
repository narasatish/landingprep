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
  const germanBasics = {
    id: "german-basics",
    exam: "german",
    examName: "German (Deutsch)",
    section: "Foundations A1",
    emoji: "\u{1F1E9}\u{1F1EA}",
    title: "German Foundations \u2014 Learn German the Smart Way",
    summary: "A fast, visual intro to German for study abroad: pronunciation, der/die/das, cases, verbs, sentence order, and how to reach A1\u2013B1 quickly.",
    slides: [
      { emoji: "\u{1F1E9}\u{1F1EA}", title: "Welcome to German!", points: [
        "German opens tuition-free study in Germany, Austria & Switzerland.",
        "It looks hard but is very logical \u2014 rules, not chaos.",
        "Goal of this lesson: the foundations + a smart learning plan.",
        "Learn here, then use our German course, flashcards & AI tutor."
      ], tip: "Consistency beats intensity \u2014 20 mins daily > 3 hours weekly." },
      { emoji: "\u{1F524}", title: "The alphabet & special letters", points: [
        "Same 26 letters as English + \xE4, \xF6, \xFC (umlauts) and \xDF (sharp s).",
        "\xE4 \u2248 'e' in bed \xB7 \xF6 \u2248 'i' in girl \xB7 \xFC = say 'ee' with rounded lips.",
        "\xDF sounds like 'ss' (e.g. Stra\xDFe = 'shtrahsse').",
        "No umlaut on a keyboard? Write ae, oe, ue, ss."
      ] },
      {
        emoji: "\u{1F5E3}\uFE0F",
        title: "Pronunciation rules (it's consistent!)",
        points: [
          "German is read as written \u2014 once you learn the sounds, you can say any word.",
          "'w' = English 'v' (Wasser = 'vasser'). 'v' = 'f' (Vater = 'fahter').",
          "'z' = 'ts' (Zeit = 'tsait'). 'ei' = 'eye', 'ie' = 'ee'.",
          "'ch' = soft hiss (ich) or throaty (Buch); 'sch' = 'sh'."
        ],
        example: { label: "Try it", text: "Eis = 'ice', Bier = 'beer', Schule = 'shoo-le'." }
      },
      { emoji: "\u{1F44B}", title: "Survival phrases (say these on day 1)", points: [
        "Hallo / Guten Tag \u2014 Hello.  Tsch\xFCss \u2014 Bye.",
        "Danke \u2014 Thanks.  Bitte \u2014 Please / You're welcome.",
        "Entschuldigung \u2014 Excuse me / Sorry.",
        "Sprechen Sie Englisch? \u2014 Do you speak English?"
      ] },
      {
        emoji: "\u{1F6BB}",
        title: "der, die, das \u2014 noun gender",
        points: [
          "Every noun is masculine (der), feminine (die) or neuter (das).",
          "ALWAYS learn the article with the noun (not 'Tisch' but 'der Tisch').",
          "Plural article is always 'die'.",
          "Endings hint at gender: -ung/-heit/-keit \u2192 die; -chen \u2192 das."
        ],
        warn: "Don't guess gender later \u2014 memorise it from the start. It affects everything."
      },
      { emoji: "\u{1F522}", title: "Numbers & the 'reversed' trick", points: [
        "1\u201310: eins, zwei, drei, vier, f\xFCnf, sechs, sieben, acht, neun, zehn.",
        "21 = einundzwanzig = literally 'one-and-twenty'.",
        "Read tens after units: 47 = siebenundvierzig.",
        "Hundreds & thousands: hundert, tausend."
      ] },
      {
        emoji: "\u{1F9E9}",
        title: "The 4 cases (the heart of German)",
        points: [
          "Nominative = the subject (who does it).",
          "Accusative = the direct object (what is affected).",
          "Dative = the indirect object (to/for whom).",
          "Genitive = possession (of). Cases change articles: der\u2192den\u2192dem."
        ],
        tip: "Don't panic \u2014 at A1 you mostly need Nominative & Accusative."
      },
      { emoji: "\u{1F501}", title: "Verb conjugation (regular)", points: [
        "Take the stem (spielen \u2192 spiel) and add endings.",
        "ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en.",
        "ich spiele, du spielst, er spielt, wir spielen.",
        "Most verbs follow this \u2014 learn the pattern once."
      ] },
      { emoji: "\u2B50", title: "The big irregulars: sein & haben", points: [
        "sein (to be): ich bin, du bist, er ist, wir sind, ihr seid, sie sind.",
        "haben (to have): ich habe, du hast, er hat, wir haben, sie haben.",
        "These two appear constantly \u2014 memorise them cold.",
        "'Ich bin Student' = I am a student. 'Ich habe Zeit' = I have time."
      ] },
      {
        emoji: "\u{1F4D0}",
        title: "Word order \u2014 the verb is 2nd",
        points: [
          "In a normal statement, the conjugated verb is always in position 2.",
          "'Ich lerne heute Deutsch' OR 'Heute lerne ich Deutsch.'",
          "Start with time/place? The verb still comes second, subject after.",
          "Questions: verb first \u2014 'Lernst du Deutsch?'"
        ],
        example: { label: "Pattern", text: "[Time] + VERB + [Subject] + [rest]: 'Morgen gehe ich zur Uni.'" }
      },
      { emoji: "\u{1F17F}\uFE0F", title: "Personal pronouns & 'you'", points: [
        "ich (I), du (you-informal), er/sie/es (he/she/it).",
        "wir (we), ihr (you all), sie (they), Sie (you-formal).",
        "Use 'Sie' with strangers, officials, professors.",
        "Use 'du' with friends, family, fellow students."
      ] },
      { emoji: "\u{1F6AB}", title: "Saying 'no' and 'not'", points: [
        "'nicht' negates verbs/adjectives: 'Ich verstehe nicht.'",
        "'kein/keine' negates nouns: 'Ich habe keine Zeit.'",
        "'nein' = the answer 'no'.",
        "Position of 'nicht' usually comes late in the sentence."
      ] },
      { emoji: "\u2753", title: "Question words (the W-words)", points: [
        "wer (who), was (what), wo (where), wann (when).",
        "wie (how), warum (why), wie viel (how much).",
        "These start open questions: 'Wo wohnst du?' = Where do you live?",
        "Yes/no questions just flip the verb to the front."
      ] },
      { emoji: "\u{1F3E0}", title: "Everyday vocabulary themes", points: [
        "Build vocab by theme: family, food, home, university, travel.",
        "Learn nouns with their article + a sample sentence.",
        "20 new words/day with spaced repetition = ~600/month.",
        "Use our German flashcards \u2014 they speak each word aloud."
      ] },
      {
        emoji: "\u{1F552}",
        title: "Telling the time",
        points: [
          "'Wie sp\xE4t ist es?' = What time is it?",
          "Es ist drei Uhr = 3:00. Es ist halb vier = 3:30 (half to four!).",
          "Viertel nach = quarter past; Viertel vor = quarter to.",
          "24-hour clock is common: 14:00 = vierzehn Uhr."
        ],
        warn: "'halb vier' means 3:30, NOT 4:30 \u2014 a classic learner trap."
      },
      {
        emoji: "\u{1F9F1}",
        title: "Compound words \u2014 German superpower",
        points: [
          "German builds long words by joining shorter ones.",
          "Handschuh = Hand + Schuh = 'hand-shoe' = glove. \u{1F9E4}",
          "The LAST noun decides the gender & meaning.",
          "Break long words into parts and they become readable."
        ],
        example: { label: "Famous one", text: "Geschwindigkeitsbegrenzung = speed limit (Geschwindigkeit + Begrenzung)." }
      },
      { emoji: "\u{1F3A7}", title: "Train your ear early", points: [
        "Watch German with subtitles (Easy German on YouTube is gold).",
        "Listen to slow-German podcasts during commutes.",
        "Repeat sentences aloud (shadowing) to fix pronunciation.",
        "Use our AI tutor & natural voice to hear real German."
      ] },
      { emoji: "\u{1F5E3}\uFE0F", title: "Speak from day one", points: [
        "Don't wait until you're 'ready' \u2014 speak badly, then improve.",
        "Talk to yourself in German while doing chores.",
        "Use our German AI speaking practice for live 2-way conversation.",
        "Mistakes are data, not failure."
      ] },
      { emoji: "\u{1F6AB}", title: "Common beginner mistakes", points: [
        "Forgetting the noun's article (der/die/das).",
        "Putting the verb in the wrong position.",
        "Mixing up 'ein' (a) with 'der/die/das' (the).",
        "Translating word-for-word from English."
      ] },
      { emoji: "\u{1F393}", title: "German exams for study abroad", points: [
        "Goethe-Zertifikat (A1\u2013C2): the global gold standard.",
        "TestDaF & DSH: university admission (B2\u2013C1).",
        "telc: jobs, residence, integration.",
        "Most degrees want B1\u2013B2; some English-taught need none."
      ] },
      { emoji: "\u{1F4C5}", title: "Your 90-day A1 plan", points: [
        "Weeks 1\u20134: alphabet, pronunciation, greetings, der/die/das, present tense.",
        "Weeks 5\u20138: cases (Nom/Akk), numbers, time, 300+ words.",
        "Weeks 9\u201312: sentences, daily conversations, A1 mock tests.",
        "Practise speaking + listening every single day."
      ] },
      { emoji: "\u{1F680}", title: "Los geht's \u2014 let's start!", points: [
        "You now know the foundations: sounds, gender, cases, verbs, word order.",
        "Next: open the German course (Learn tab) and the flashcards.",
        "Then take the German placement test and practise speaking.",
        "Viel Erfolg! You've got this. \u{1F389}"
      ], tip: "Open Languages \u2192 German to start your A1 course now." }
    ]
  };
  const frenchBasics = {
    id: "french-basics",
    exam: "french",
    examName: "French (Fran\xE7ais)",
    section: "Foundations A1",
    emoji: "\u{1F1EB}\u{1F1F7}",
    title: "French Foundations \u2014 Learn French the Smart Way",
    summary: "A fast, visual intro to French for study abroad: pronunciation, le/la, verbs, accents and how to reach A1 quickly.",
    slides: [
      { emoji: "\u{1F1EB}\u{1F1F7}", title: "Welcome to French!", points: [
        "French opens study in France, Belgium, Switzerland & Qu\xE9bec (Canada).",
        "DELF/DALF, TCF and TEF are accepted for study & immigration.",
        "This lesson covers the foundations + a smart learning plan.",
        "Learn here, then use our French course, flashcards & AI tutor."
      ], tip: "20 minutes a day, every day \u2014 that's the secret." },
      { emoji: "\u{1F524}", title: "Accents & special letters", points: [
        "\xE9 (accent aigu), \xE8/\xE0 (grave), \xEA (circonflexe), \xE7 (cedilla), \xEB (tr\xE9ma).",
        "Accents change sound and meaning: ou (or) vs o\xF9 (where).",
        "\xE7 sounds like 's' (fran\xE7ais = 'fronsay').",
        "Accents matter \u2014 don't skip them."
      ] },
      {
        emoji: "\u{1F5E3}\uFE0F",
        title: "Pronunciation basics",
        points: [
          "Final consonants are usually SILENT (Paris = 'paree').",
          "'r' is throaty; 'u' is rounded (say 'ee' with lips forward).",
          "Nasal sounds: on, an, in, un (air through the nose).",
          "'ch' = 'sh' (chat = 'sha'); 'j' = soft 'zh'."
        ],
        example: { label: "Try it", text: "Bonjour = 'bon-zhoor', merci = 'mair-see', oui = 'wee'." }
      },
      { emoji: "\u{1F44B}", title: "Survival phrases", points: [
        "Bonjour \u2014 Hello.  Au revoir \u2014 Goodbye.",
        "Merci \u2014 Thanks.  S'il vous pla\xEEt \u2014 Please.",
        "Excusez-moi \u2014 Excuse me.  Pardon \u2014 Sorry.",
        "Parlez-vous anglais? \u2014 Do you speak English?"
      ] },
      {
        emoji: "\u{1F6BB}",
        title: "le, la, les \u2014 noun gender",
        points: [
          "Nouns are masculine (le) or feminine (la); plural = les.",
          "Before a vowel, le/la become l' (l'ami, l'universit\xE9).",
          "Learn the article WITH the noun.",
          "Endings hint: -tion/-t\xE9 \u2192 feminine; -age/-ment \u2192 masculine."
        ],
        warn: "Gender affects adjectives and agreement \u2014 memorise it early."
      },
      { emoji: "\u{1F522}", title: "Numbers (watch 70\u201399!)", points: [
        "1\u201310: un, deux, trois, quatre, cinq, six, sept, huit, neuf, dix.",
        "70 = soixante-dix (sixty-ten), 80 = quatre-vingts (four-twenties).",
        "90 = quatre-vingt-dix (four-twenty-ten). Yes, really. \u{1F605}",
        "Belgium/Switzerland use simpler septante, huitante, nonante."
      ] },
      { emoji: "\u{1F17F}\uFE0F", title: "Subject pronouns & 'you'", points: [
        "je (I), tu (you-informal), il/elle (he/she).",
        "nous (we), vous (you-formal/plural), ils/elles (they).",
        "Use 'vous' with strangers and in formal settings.",
        "Use 'tu' with friends, family, classmates."
      ] },
      {
        emoji: "\u2B50",
        title: "Key verbs: \xEAtre & avoir",
        points: [
          "\xEAtre (to be): je suis, tu es, il est, nous sommes, vous \xEAtes, ils sont.",
          "avoir (to have): j'ai, tu as, il a, nous avons, vous avez, ils ont.",
          "These two power most sentences \u2014 memorise them.",
          "'Je suis \xE9tudiant' = I'm a student. 'J'ai 20 ans' = I'm 20."
        ],
        tip: "In French you 'have' your age: 'J'ai vingt ans' = literally 'I have 20 years'."
      },
      { emoji: "\u{1F501}", title: "Regular -er verbs", points: [
        "Most verbs end in -er (parler, aimer, habiter).",
        "Drop -er, add: -e, -es, -e, -ons, -ez, -ent.",
        "je parle, tu parles, il parle, nous parlons, vous parlez.",
        "Master -er verbs and you can say a LOT."
      ] },
      { emoji: "\u2753", title: "Asking questions", points: [
        "Easiest: add 'Est-ce que\u2026' before a statement.",
        "'Est-ce que tu parles fran\xE7ais?' = Do you speak French?",
        "Or just raise your intonation: 'Tu parles fran\xE7ais?'",
        "Question words: o\xF9, quand, comment, pourquoi, combien."
      ] },
      { emoji: "\u{1F3A7}", title: "Train your ear", points: [
        "Watch French shows with subtitles; try 'Easy French' on YouTube.",
        "Listen to slow-French podcasts daily.",
        "Shadow sentences aloud to fix the accent.",
        "Use our AI tutor & natural voice for real French."
      ] },
      { emoji: "\u{1F6AB}", title: "Common beginner mistakes", points: [
        "Pronouncing silent final consonants.",
        "Forgetting accents (they change meaning).",
        "Mixing le/la genders.",
        "Translating English word order directly."
      ] },
      { emoji: "\u{1F393}", title: "French exams for study abroad", points: [
        "DELF (A1\u2013B2) & DALF (C1\u2013C2): lifelong diplomas for study.",
        "TCF: Campus France, Qu\xE9bec immigration, citizenship.",
        "TEF: Canadian immigration (Express Entry).",
        "Most French degrees want B2; Campus France guides the level."
      ] },
      { emoji: "\u{1F680}", title: "On y va \u2014 let's go!", points: [
        "You've got the foundations: accents, gender, key verbs, questions.",
        "Next: open the French course (Learn tab) and flashcards.",
        "Take the French placement test and practise speaking.",
        "Bonne chance! \u{1F389}"
      ], tip: "Open Languages \u2192 French to start your A1 course now." }
    ]
  };
  window.LP_SLIDE_DECKS = { "ielts-listening": ieltsListening, "german-basics": germanBasics, "french-basics": frenchBasics };
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
    ] },
    { exam: "languages", examName: "Languages (German & French)", emoji: "\u{1F5E3}\uFE0F", decks: [
      { id: "german-basics", section: "German Foundations", emoji: "\u{1F1E9}\u{1F1EA}", ready: true },
      { id: "french-basics", section: "French Foundations", emoji: "\u{1F1EB}\u{1F1F7}", ready: true }
    ] }
  ];
})();
