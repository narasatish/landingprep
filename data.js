window.LP_DATA = {
  EXAMS: [
    {
      id: "ielts",
      name: "IELTS",
      short: "IELTS",
      full: "International English Language Testing System",
      body: "British Council \xB7 IDP \xB7 Cambridge Assessment English",
      tagline: "Study, work, migration",
      blurb: "The world's most accepted English proficiency test \u2014 taken by 3.5 million people each year. Choose Academic for university admission and professional registration, or General Training for migration, work, and secondary school.",
      duration: "2h 45m",
      score: "Band 0\u20139",
      sections: 4,
      mocks: 60,
      streams: ["Academic", "General Training"],
      official: "https://ielts.org/take-a-test",
      booking: "https://ielts.org/take-a-test/booking-your-test",
      fees: { inr: "\u20B917,000\u201319,000", usd: "$215\u2013230" },
      colour: "#B83A2E",
      pattern: [
        ["Listening", "4 parts \xB7 40 questions \xB7 30 min listening + 10 min answer transfer"],
        ["Reading", "3 passages \xB7 40 questions \xB7 60 min (Academic: academic texts; General: notices, ads, articles)"],
        ["Writing", "Task 1 (\u2265150 words, 20 min) + Task 2 (\u2265250 words, 40 min) \xB7 60 min total"],
        ["Speaking", "Part 1: Introduction (4\u20135 min) \xB7 Part 2: Cue card (3\u20134 min) \xB7 Part 3: Discussion (4\u20135 min) \xB7 11\u201314 min face-to-face"]
      ],
      sections_detail: [
        {
          name: "Listening",
          icon: "\u{1F3A7}",
          time: 40,
          questions: 40,
          types: ["Form completion", "Note completion", "Matching", "MCQ", "Map/diagram labelling", "Short answer"],
          tips: "You hear the recording once only. Answers follow the order of the questions in Parts 1\u20133."
        },
        {
          name: "Reading",
          icon: "\u{1F4D6}",
          time: 60,
          questions: 40,
          types: ["True/False/Not Given", "Yes/No/Not Given", "Matching headings", "Matching information", "MCQ", "Sentence completion", "Summary completion"],
          tips: "Manage time: aim for 20 min per passage. Skim the questions before reading the passage."
        },
        {
          name: "Writing",
          icon: "\u270D\uFE0F",
          time: 60,
          questions: 2,
          types: ["Task 1 Academic: describe graph/chart/diagram/map/process", "Task 1 General: write a letter", "Task 2: argumentative/discussion essay"],
          tips: "Plan Task 2 for 5 min. Task 2 carries double the marks of Task 1 \u2014 do not spend 40 min on Task 1."
        },
        {
          name: "Speaking",
          icon: "\u{1F3A4}",
          time: 14,
          questions: 3,
          types: ["Part 1: Everyday questions on familiar topics", "Part 2: Speak for 1\u20132 min from a cue card", "Part 3: Abstract discussion linked to Part 2 topic"],
          tips: "Extend answers naturally. Examiners look for fluency, lexical resource, grammar range and accuracy, and pronunciation."
        }
      ],
      scoreGuide: [
        ["Band 9", "Expert user \u2014 full operational command of English"],
        ["Band 8", "Very good user \u2014 occasional unsystematic inaccuracies"],
        ["Band 7", "Good user \u2014 occasional errors in complex situations"],
        ["Band 6.5", "Minimum for many UK/AUS university programmes"],
        ["Band 6", "Competent user \u2014 noticeable but manageable errors"],
        ["Band 5.5", "Minimum for some programmes; Immigration threshold in some countries"]
      ],
      registration: [
        "Create an account on ielts.org (British Council) or IDP India (ieltsidpindia.com).",
        "Select your test type: Academic or General Training.",
        "Choose your test format: Paper-based or Computer-delivered (CD-IELTS recommended for faster results and more slots).",
        "Pick a test centre, date and time from the calendar.",
        "Upload a clear scan of your passport exactly as it will appear on test day.",
        "Pay the fee online. Keep your booking confirmation email.",
        "Results: Paper-based \u2014 13 days. Computer-delivered \u2014 1\u20135 days."
      ],
      centres: "Available in 140+ countries at 1,600+ test centres. In India: Delhi, Mumbai, Chennai, Bangalore, Hyderabad, Kolkata, Pune, Ahmedabad, and 50+ other cities.",
      commonMistakes: [
        "Spending too long on Listening Part 1 and running out of time in Part 4.",
        "Writing fewer than 150 words for Task 1 \u2014 automatic score cap.",
        "Repeating the question words in Task 2 introduction \u2014 called 'lifting', penalised.",
        "Not checking spelling in Listening/Reading answers \u2014 one wrong spelling = wrong answer.",
        "In Reading, choosing NOT GIVEN when the answer is actually FALSE \u2014 read the passage, not your own knowledge.",
        "Speaking too fast in Part 2 to fill 2 minutes \u2014 slow down and develop each point."
      ],
      faqs: [
        ["Which stream should I choose?", "Academic for universities, postgraduate courses and professional body registration (e.g. nursing councils). General Training for skilled migration (Australia, Canada, UK visa), work experience, and secondary education. Always confirm with the receiving institution before booking."],
        ["CD-IELTS vs paper-based?", "CD-IELTS (computer-delivered) gives results in 1\u20135 days instead of 13, offers many more test dates, and allows you to type Writing tasks. The content is identical. Most candidates now choose CD-IELTS."],
        ["How many times can I retake?", "Unlimited \u2014 there is no restriction on the number of attempts. Most centres allow you to book again immediately after sitting."],
        ["Is the 9-band scale pass/fail?", "No. You receive a band score for each of the four skills and an Overall Band Score (average, rounded to nearest 0.5). Institutions set their own minimum \u2014 commonly 6.0, 6.5 or 7.0 overall."],
        ["How long is the score valid?", "IELTS scores are valid for two years from the test date."]
      ]
    },
    {
      id: "toefl",
      name: "TOEFL iBT",
      short: "TOEFL",
      full: "Test of English as a Foreign Language \u2014 Internet-Based Test",
      body: "Educational Testing Service (ETS)",
      tagline: "University admissions worldwide",
      blurb: "Accepted by 12,000+ universities in 160+ countries including all Ivy League institutions. Computer-delivered at an authorised centre or via the TOEFL iBT Home Edition where available.",
      duration: "~2h",
      score: "0\u2013120",
      sections: 4,
      mocks: 60,
      streams: ["iBT", "Essentials"],
      official: "https://www.ets.org/toefl",
      booking: "https://www.ets.org/toefl/test-takers/ibt/register.html",
      fees: { inr: "\u20B915,254", usd: "$183 (centre) / $195 (Home Edition)" },
      colour: "#1F4F8B",
      pattern: [
        ["Reading", "2 passages \xB7 10 questions each \xB7 ~35 min"],
        ["Listening", "2 lectures + 1 conversation \xB7 ~36 min (approx. 28 questions)"],
        ["Speaking", "4 tasks (1 independent + 3 integrated) \xB7 ~16 min"],
        ["Writing", "Integrated task (read-listen-write) + Academic Discussion task \xB7 ~29 min"]
      ],
      sections_detail: [
        {
          name: "Reading",
          icon: "\u{1F4D6}",
          time: 35,
          questions: 20,
          types: ["Factual information", "Negative factual information", "Inference", "Rhetorical purpose", "Vocabulary in context", "Reference", "Sentence simplification", "Insert text", "Prose summary"],
          tips: "Read actively \u2014 mark supporting details. The 'summary' question at the end is worth 2 points; check all 6 options carefully."
        },
        {
          name: "Listening",
          icon: "\u{1F3A7}",
          time: 36,
          questions: 28,
          types: ["Main idea/gist", "Detail", "Function and attitude", "Organization", "Connecting information"],
          tips: "Take notes on the Cornell method (main idea left, detail right, summary below). Lectures can cover biology, history, art, economics \u2014 anything."
        },
        {
          name: "Speaking",
          icon: "\u{1F3A4}",
          time: 16,
          questions: 4,
          types: ["Task 1: Independent \u2014 your opinion on a topic (45 sec prep, 60 sec response)", "Task 2: Campus situation (read + listen + speak)", "Task 3: Academic topic (read + listen + speak)", "Task 4: Academic lecture (listen + speak)"],
          tips: "Use 3 seconds of the prep time to breathe and state your point clearly. Integrated tasks reward accuracy over fluency."
        },
        {
          name: "Writing",
          icon: "\u270D\uFE0F",
          time: 29,
          questions: 2,
          types: ["Integrated: summarise lecture points vs reading passage (150\u2013225 words, 20 min)", "Academic Discussion: contribute a response to a professor's discussion post (\u2265100 words, 10 min)"],
          tips: "Integrated Writing: the lecture will contradict, support or qualify the reading. Academic Discussion: take a clear position and support it with a specific reason."
        }
      ],
      scoreGuide: [
        ["118\u2013120", "Top 1% \u2014 exceptional user"],
        ["110\u2013117", "Competitive for top US/UK universities"],
        ["100\u2013109", "Target for most research universities"],
        ["90\u201399", "Accepted by many mid-tier and state universities"],
        ["80\u201389", "Minimum for many programmes; ESL support may be required"],
        ["79 or below", "Below common university thresholds"]
      ],
      registration: [
        "Create an ETS account at ets.org/toefl.",
        "Choose 'Register for the TOEFL iBT' and select Centre or Home Edition.",
        "Select country, city and a test centre or home test option.",
        "Choose a date and time slot.",
        "Upload passport details \u2014 name must match exactly.",
        "Pay by credit/debit card. Scores released in 4\u20138 days online."
      ],
      centres: "Global network with 4,500+ centres in 165 countries. Home Edition available in most countries including India.",
      commonMistakes: [
        "Using informal vocabulary \u2014 TOEFL rewards academic register throughout.",
        "In Integrated Writing, summarising only the reading and ignoring the lecture.",
        "Speaking too quietly or rushing \u2014 enunciate, the scoring is AI-assisted.",
        "Missing the 2-point prose summary question in Reading \u2014 it changes your section score significantly.",
        "Taking notes too sparingly in Listening \u2014 you cannot replay audio."
      ],
      faqs: [
        ["TOEFL or IELTS?", "For US universities, TOEFL iBT is often preferred. IELTS is preferred by UK and Australian institutions. Both are accepted worldwide \u2014 check your specific programme's requirement."],
        ["What is the Home Edition?", "The TOEFL iBT Home Edition is the same test delivered at home via a secure browser with live remote proctoring. It requires a quiet room, working webcam and microphone, and a stable internet connection."],
        ["Can I section-skip?", "No. You must complete Reading, Listening, Speaking and Writing in that fixed order on test day."],
        ["How is Speaking scored?", "Speaking responses are scored by certified TOEFL raters on a 0\u20134 scale then converted to 0\u201330. AI-assisted tools assist the rating process."],
        ["When are scores available?", "Most candidates receive online scores within 4\u20138 days. Scores are valid for 2 years."]
      ]
    },
    {
      id: "pte",
      name: "PTE Academic",
      short: "PTE",
      full: "Pearson Test of English Academic",
      body: "Pearson VUE",
      tagline: "AI-scored \xB7 results in 48 hours",
      blurb: "Fully computer-based and AI-scored. Results in as little as 48 hours. Widely accepted for Australian, UK and Canadian visas and by 3,000+ universities globally.",
      duration: "2h",
      score: "10\u201390",
      sections: 3,
      mocks: 60,
      streams: ["Academic", "Core"],
      official: "https://www.pearsonpte.com/pte-academic",
      booking: "https://www.pearsonpte.com/book",
      fees: { inr: "\u20B916,900\u201318,900", usd: "$204\u2013226" },
      colour: "#2F6F4E",
      pattern: [
        ["Speaking & Writing", "Read Aloud \xB7 Repeat Sentence \xB7 Describe Image \xB7 Re-tell Lecture \xB7 Answer Short Question \xB7 Summarize Written Text \xB7 Write Essay \xB7 77\u201393 min"],
        ["Reading", "Reading & Writing Fill in the Blanks \xB7 MCQ Multiple \xB7 Re-order Paragraphs \xB7 Fill in the Blanks \xB7 MCQ Single \xB7 32\u201341 min"],
        ["Listening", "Summarize Spoken Text \xB7 MCQ Multiple \xB7 Fill in the Blanks \xB7 Highlight Correct Summary \xB7 MCQ Single \xB7 Select Missing Word \xB7 Highlight Incorrect Words \xB7 Write From Dictation \xB7 45\u201357 min"]
      ],
      sections_detail: [
        {
          name: "Speaking & Writing",
          icon: "\u{1F3A4}\u270D\uFE0F",
          time: 85,
          questions: 0,
          types: ["Read Aloud (6\u20137): read text aloud clearly", "Repeat Sentence (10\u201312): repeat exactly", "Describe Image (6\u20137): describe chart/graph/photo", "Re-tell Lecture (3\u20134): summarise spoken lecture", "Answer Short Question (5\u20136): one-word/phrase answers", "Summarize Written Text (1\u20132): one-sentence summary", "Write Essay (1\u20132): 200\u2013300 word argumentative essay"],
          tips: "Read Aloud and Repeat Sentence heavily impact Listening scores too. Speak continuously \u2014 pausing too long triggers recording to stop."
        },
        {
          name: "Reading",
          icon: "\u{1F4D6}",
          time: 37,
          questions: 0,
          types: ["Reading & Writing Fill in Blanks (5\u20136): drag words into gaps", "MCQ Multiple (1\u20132): select all correct answers (penalty for wrong)", "Re-order Paragraphs (2\u20133): arrange jumbled sentences", "Fill in Blanks (4\u20135): select from dropdown", "MCQ Single (1\u20132): one correct answer"],
          tips: "Re-order Paragraphs: find the topic sentence (usually no pronoun or reference at start). MCQ Multiple: wrong answers deduct marks \u2014 be selective."
        },
        {
          name: "Listening",
          icon: "\u{1F3A7}",
          time: 50,
          questions: 0,
          types: ["Summarize Spoken Text (2\u20133): 50\u201370 word summary", "MCQ Multiple (2\u20133): select all correct answers", "Fill in Blanks (2\u20133): type missing words", "Highlight Correct Summary (2\u20133): pick best summary", "MCQ Single (2\u20133): one correct answer", "Select Missing Word (2\u20133): choose end of audio", "Highlight Incorrect Words (2\u20133): identify words that differ from transcript", "Write From Dictation (3\u20134): type what you hear exactly"],
          tips: "Write From Dictation is the highest-weight Listening task. Listen for each word precisely \u2014 score is partial (per correct word)."
        }
      ],
      scoreGuide: [
        ["85\u201390", "Expert communicator \u2014 rare; Australian PR/student visa: well above minimum"],
        ["79\u201384", "Very high \u2014 exceeds most immigration thresholds"],
        ["65\u201378", "Target for Australian skilled visa (typically 65+), UK student visa (58+)"],
        ["50\u201364", "Accepted by many universities; below some immigration thresholds"],
        ["42\u201349", "Limited proficiency \u2014 below most university and visa requirements"]
      ],
      registration: [
        "Create a Pearson account at pearsonpte.com.",
        "Select PTE Academic or PTE Core (for Canadian PR/citizenship).",
        "Find a test centre and available date/time.",
        "Enter ID details \u2014 passport recommended.",
        "Pay and receive booking confirmation.",
        "Results delivered to your myPTE account in 48 hours."
      ],
      centres: "4,000+ test centres in 100+ countries. In India: 40+ cities including Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Pune, Kolkata.",
      commonMistakes: [
        "Pausing too long in Read Aloud \u2014 the microphone cuts off after 3 seconds of silence.",
        "Speaking with a regional accent too heavy for the AI \u2014 train for clear, measured pronunciation.",
        "Ignoring Repeat Sentence \u2014 it affects both Speaking AND Listening scores simultaneously.",
        "Not finishing Write From Dictation \u2014 partial scoring means every word counts.",
        "Over-time on Write Essay \u2014 300 words is enough; above 400 rarely improves scores."
      ],
      faqs: [
        ["Why choose PTE over IELTS?", "Faster results (48 hrs), no human examiner bias, more test centre slots, and AI consistency. PTE is also fully computer-based, which many candidates find less stressful than a face-to-face speaking interview."],
        ["Is PTE accepted for UK visas?", "Yes \u2014 PTE Academic is on the UK Home Office SELT list. Required score varies by visa type. Always confirm with UKVI."],
        ["What is PTE Core?", "PTE Core is designed specifically for Canadian immigration (IRCC Express Entry and Provincial Nominee Programs). It differs from PTE Academic in content and score benchmarks."],
        ["How often can I retake PTE?", "Unlimited attempts. Results are valid for 2 years from the test date."]
      ]
    },
    {
      id: "celpip",
      name: "CELPIP",
      short: "CELPIP",
      full: "Canadian English Language Proficiency Index Programme",
      body: "Paragon Testing Enterprises (UBC)",
      tagline: "Canada PR &amp; citizenship",
      blurb: "Designated by Immigration, Refugees and Citizenship Canada (IRCC) for permanent residence and citizenship applications. All sections are computer-delivered using Canadian English contexts and accents.",
      duration: "3h",
      score: "1\u201312",
      sections: 4,
      mocks: 60,
      streams: ["General", "General LS"],
      official: "https://www.celpip.ca/",
      booking: "https://www.celpip.ca/register/",
      fees: { inr: "\u20B918,000\u201320,000", usd: "$215\u2013240" },
      colour: "#C8501F",
      pattern: [
        ["Listening", "6 parts (problem solving, daily-life conversation, information, news item, discussion, viewpoints) \xB7 38 questions \xB7 47\u201355 min"],
        ["Reading", "4 parts (correspondence, diagram/chart, information, viewpoints) \xB7 38 questions \xB7 55\u201364 min"],
        ["Writing", "Task 1: Email (150\u2013200 words, 27 min) + Task 2: Survey response (150\u2013200 words, 26 min) \xB7 53 min total"],
        ["Speaking", "8 tasks (giving advice, personal experience, describing a scene, predictions, comparing & persuading, difficult situation, opinions, unusual situation) \xB7 ~15\u201320 min"]
      ],
      sections_detail: [
        {
          name: "Listening",
          icon: "\u{1F3A7}",
          time: 50,
          questions: 38,
          types: ["Part 1: Listening to Problem Solving", "Part 2: Listening to a Daily Life Conversation", "Part 3: Listening for Information", "Part 4: Listening to a News Item", "Part 5: Listening to a Discussion", "Part 6: Listening to Viewpoints"],
          tips: "All audio features Canadian accents and Canadian cultural references. Familiarise yourself with Canadian English pronunciation and vocabulary."
        },
        {
          name: "Reading",
          icon: "\u{1F4D6}",
          time: 55,
          questions: 38,
          types: ["Part 1: Reading correspondence (email/letter)", "Part 2: Reading to apply information from a diagram", "Part 3: Reading for information from articles", "Part 4: Reading for viewpoints and opinions"],
          tips: "Part 4 is the most time-pressured. Practice reading opinion pieces quickly and identifying the writer's position."
        },
        {
          name: "Writing",
          icon: "\u270D\uFE0F",
          time: 53,
          questions: 2,
          types: ["Task 1: Email \u2014 write an email in response to a given situation (150\u2013200 words)", "Task 2: Survey response \u2014 respond to two open-ended questions (150\u2013200 words total)"],
          tips: "Use the CELPIP writing scoring rubric: Task Fulfilment, Vocabulary, Readability, and Conventions. Write in a friendly, Canadian-casual register for emails."
        },
        {
          name: "Speaking",
          icon: "\u{1F3A4}",
          time: 18,
          questions: 8,
          types: ["Task 1: Giving Advice (30s prep, 90s response)", "Task 2: Talking about a Personal Experience (30s/60s)", "Task 3: Describing a Scene (30s/60s)", "Task 4: Making Predictions (30s/60s)", "Task 5: Comparing and Persuading (60s/60s)", "Task 6: Dealing with a Difficult Situation (60s/60s)", "Task 7: Expressing Opinions (30s/90s)", "Task 8: Describing an Unusual Situation (30s/60s)"],
          tips: "All speaking responses are recorded and scored by raters. Organise your response with a clear opening, 2\u20133 supporting points, and a conclusion."
        }
      ],
      scoreGuide: [
        ["10\u201312", "Advanced proficiency \u2014 exceeds most immigration requirements"],
        ["9", "Meets Express Entry CLB 9 requirement for high CRS points"],
        ["7\u20138", "Meets minimum for most PR pathways (CLB 7\u20138)"],
        ["5\u20136", "Below common immigration thresholds; suitable for some work permits"],
        ["1\u20134", "Limited proficiency"]
      ],
      registration: [
        "Register at celpip.ca \u2014 create an account.",
        "Select CELPIP-General (PR) or CELPIP-General LS (citizenship).",
        "Choose a test centre (Canada or select international cities).",
        "Upload valid government photo ID.",
        "Pay the registration fee. Results typically within 4\u20135 business days."
      ],
      centres: "Primarily in Canada. Limited centres internationally \u2014 check celpip.ca for current locations. No Home Edition available.",
      commonMistakes: [
        "Not targeting the word count \u2014 Writing below 150 words is heavily penalised.",
        "Using British English spellings \u2014 CELPIP uses Canadian English (colour, honour \u2014 same as British; program \u2014 same as American). Do not mix.",
        "Forgetting to address all three bullet points in the email task.",
        "Speaking too formally \u2014 CELPIP tests practical, everyday Canadian English, not academic English.",
        "Confusing CELPIP-General with CELPIP-General LS \u2014 wrong test means invalid score for your application."
      ],
      faqs: [
        ["CELPIP vs IELTS for Canada PR?", "Both are accepted by IRCC. CELPIP uses Canadian contexts and accents, making it more relevant for Canada. It is also fully computer-based. The choice often comes down to familiarity with the format."],
        ["What CLB level do I need?", "Federal Skilled Worker: CLB 7 (score of 7 in all bands). CEC: CLB 7 (speaking/listening), CLB 5 (reading/writing) for NOC 0/A; CLB 5 all bands for NOC B. Always verify with the IRCC website."],
        ["Is CELPIP accepted for citizenship?", "CELPIP-General (not General LS) or CELPIP-General LS \u2014 confirm which version your citizenship application requires with IRCC before booking."],
        ["Scores valid for how long?", "2 years from test date for immigration purposes."]
      ]
    },
    {
      id: "duolingo",
      name: "Duolingo English Test",
      short: "DET",
      full: "Duolingo English Test",
      body: "Duolingo Inc.",
      tagline: "From home \xB7 60 minutes \xB7 $65",
      blurb: "Adaptive online English proficiency test taken at home in under an hour. Accepted by 5,500+ universities including Yale, Columbia, NYU, MIT, and the University of Toronto.",
      duration: "1h",
      score: "10\u2013160",
      sections: 2,
      mocks: 60,
      streams: ["Standard"],
      official: "https://englishtest.duolingo.com/",
      booking: "https://englishtest.duolingo.com/applicants",
      fees: { inr: "\u20B95,000\u20135,400", usd: "$65" },
      colour: "#4F8B2F",
      pattern: [
        ["Adaptive Test", "Mixed reading, listening, speaking, writing tasks \xB7 45 min (adaptive difficulty)"],
        ["Video Interview + Writing Sample", "Open-ended unscored video + writing responses \xB7 10 min"],
        ["Results", "Certified scores in \u226448 hours \xB7 Overall score + subscores for literacy, comprehension, conversation, production"]
      ],
      sections_detail: [
        {
          name: "Adaptive Test",
          icon: "\u{1F916}",
          time: 45,
          questions: 0,
          types: ["Read and Complete: fill missing letters in a word", "Read Aloud: read a sentence aloud", "Listen and Type: transcribe spoken audio", "Read and Select: select real English words from a list", "Write About the Photo: describe an image in 1 sentence", "Speak About the Photo: describe an image aloud (30 sec)", "Listen and Respond: respond to a question about an audio clip", "Read Aloud (long): read a paragraph aloud", "Writing Sample: write on a prompted topic (\u226550 words)", "Speaking Sample: speak on a prompted topic (\u226530 sec)"],
          tips: "The test adapts \u2014 harder questions mean higher potential scores. Do not rush; accuracy matters more than speed on word-level tasks."
        },
        {
          name: "Video Interview",
          icon: "\u{1F3A5}",
          time: 10,
          questions: 2,
          types: ["Unscored open-ended video question (sent to institutions as supplemental information)", "Unscored writing sample"],
          tips: "Although unscored, institutions do view the video interview. Speak clearly, confidently, and on-topic."
        }
      ],
      scoreGuide: [
        ["140\u2013160", "Proficiency equivalent to IELTS 8\u20139, TOEFL 110+"],
        ["120\u2013135", "Equivalent to IELTS 7\u20137.5, TOEFL 94\u2013109"],
        ["100\u2013115", "Equivalent to IELTS 6.5\u20137, TOEFL 80\u201393"],
        ["80\u201395", "Equivalent to IELTS 6\u20136.5, TOEFL 65\u201379"],
        ["60\u201375", "Below most university thresholds"]
      ],
      registration: [
        "Create a Duolingo account at englishtest.duolingo.com.",
        "Verify your identity with a government ID.",
        "Download the secure browser or use the web app.",
        "Schedule a session \u2014 tests can be started within minutes of registration.",
        "Pay $65 by credit/debit card.",
        "Sit the test in a quiet room with a working webcam, microphone and stable internet.",
        "Send certified results to institutions for free from your dashboard."
      ],
      centres: "No test centre needed \u2014 taken entirely from home. Requires a supported laptop or desktop with webcam and microphone.",
      commonMistakes: [
        "Not practising Read Aloud sufficiently \u2014 pronunciation clarity matters significantly.",
        "Submitting very short responses to Writing Sample and Speaking Sample \u2014 both need substantive content.",
        "Having background noise during the test \u2014 this can trigger a flag and invalidate results.",
        "Leaving during the adaptive section \u2014 any disruption is flagged.",
        "Not using all available time on Speaking prompts \u2014 30 seconds minimum is expected."
      ],
      faqs: [
        ["Is DET accepted by top universities?", "Yes \u2014 MIT, Yale, Columbia, NYU, Carnegie Mellon and thousands more. However, some programmes still require IELTS or TOEFL. Always verify with your specific programme."],
        ["How adaptive is the test?", "The adaptive engine adjusts difficulty based on each answer. Answering harder questions correctly leads to a higher final score. You will likely see items across a wide range of difficulty."],
        ["What equipment is needed?", "A quiet room with no other people, a laptop or desktop with a working front-facing camera and microphone, and a reliable internet connection. Tablets and phones are not supported."],
        ["Can I retake if I fail?", "You can take the test up to twice per 30-day period."]
      ]
    },
    {
      id: "gre",
      name: "GRE General Test",
      short: "GRE",
      full: "Graduate Record Examinations \u2014 General Test",
      body: "Educational Testing Service (ETS)",
      tagline: "Graduate school admissions",
      blurb: "The standard graduate admissions test for master's and PhD programmes globally. Section-adaptive: your performance in the first scored section of each measure determines the difficulty of the second section.",
      duration: "1h 58m",
      score: "Verbal 130\u2013170 \xB7 Quant 130\u2013170 \xB7 AW 0\u20136",
      sections: 3,
      mocks: 60,
      streams: ["General Test"],
      official: "https://www.ets.org/gre",
      booking: "https://www.ets.org/gre/test-takers/general-test/register.html",
      fees: { inr: "\u20B922,550", usd: "$220 (most locations) / $213 (India)" },
      colour: "#5B3A8B",
      pattern: [
        ["Analytical Writing", "1 task: Analyse an Issue \xB7 30 min"],
        ["Verbal Reasoning", "2 sections \xB7 27 questions total \xB7 41 min (section-adaptive)"],
        ["Quantitative Reasoning", "2 sections \xB7 27 questions total \xB7 47 min (section-adaptive)"]
      ],
      sections_detail: [
        {
          name: "Analytical Writing",
          icon: "\u270D\uFE0F",
          time: 30,
          questions: 1,
          types: ["Analyse an Issue: write a well-reasoned essay taking a position on a complex topic"],
          tips: "AW is scored holistically 0\u20136 by trained raters and e-rater. A 4.0+ satisfies most programmes. Structure: intro with clear position, 2\u20133 developed body paragraphs, concise conclusion."
        },
        {
          name: "Verbal Reasoning",
          icon: "\u{1F4D6}",
          time: 41,
          questions: 27,
          types: ["Text Completion (1\u20133 blanks): fill blanks with vocabulary that fits context", "Sentence Equivalence (2 blanks): both answers must produce equivalent meaning", "Reading Comprehension: short and long passage MCQ, select-in-passage"],
          tips: "Vocabulary is tested in context \u2014 focus on high-frequency GRE words. RC: always read the question before the passage to focus your reading."
        },
        {
          name: "Quantitative Reasoning",
          icon: "\u{1F522}",
          time: 47,
          questions: 27,
          types: ["Quantitative Comparison (QC): compare two quantities", "Problem Solving MCQ: choose one or multiple answers", "Numeric Entry: type the exact answer"],
          tips: "QC questions reward estimation, not full calculation \u2014 check whether the relationship is always/sometimes/never true. Calculator is provided on-screen but avoid over-relying on it."
        }
      ],
      scoreGuide: [
        ["Verbal 165\u2013170 / Quant 165\u2013170", "Top 10% \u2014 competitive for top PhD programmes"],
        ["Verbal 160+ / Quant 160+", "Strong \u2014 75th+ percentile in respective measures"],
        ["Verbal 155 / Quant 155", "Solid \u2014 69th percentile verbal, 66th percentile quant"],
        ["320+ total (V+Q)", "Competitive for most master's programmes"],
        ["AW 4.0", "Meets most programme requirements; 5.0+ is strong"]
      ],
      registration: [
        "Create an ETS account at ets.org.",
        "Select 'Register for the GRE General Test'.",
        "Choose test at a centre or GRE General Test at Home.",
        "Select country, city and available date.",
        "Enter ID details exactly as on your passport.",
        "Pay the registration fee. Score reporting is included for up to 4 programmes.",
        "Scores available 8\u201310 days after the test. Valid for 5 years."
      ],
      centres: "Prometric test centres worldwide. GRE at Home available in most countries. In India: Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune.",
      commonMistakes: [
        "Spending too long on hard Verbal questions \u2014 skip and return at the end of the section.",
        "Ignoring AW because it is a separate score \u2014 many funded PhD programmes require AW 4.5+.",
        "Choosing 'C \u2014 the two quantities are equal' in QC by default \u2014 test with numbers first.",
        "Forgetting that Quant uses standard US conventions \u2014 percentages, ratios, coordinate geometry.",
        "Not practising Numeric Entry \u2014 calculators can't save you from setting up the problem wrong.",
        "Leaving words in Sentence Equivalence that are not synonymous \u2014 both blanks must produce complete and equivalent sentences."
      ],
      faqs: [
        ["How is the section-adaptive feature different from item-adaptive?", "GRE adapts at the section level \u2014 your score on section 1 determines whether section 2 is 'easy', 'medium' or 'hard'. This means even if you answer one question wrong, you are not immediately penalised the way you would be in a fully adaptive test."],
        ["Can I retake GRE?", "Yes \u2014 once every 21 days and up to 5 times in a 12-month period. Only scores from tests taken in the past 5 years are reportable."],
        ["What is the ScoreSelect option?", "You choose which test scores to send to programmes \u2014 you can send your best single day's scores or all scores. Check whether the programme wants to see all scores."],
        ["GRE or GMAT for business school?", "Most top MBA programmes accept both equally. GRE tends to be preferred for joint degree programmes and by candidates applying to multiple disciplines."],
        ["How long are GRE scores valid?", "5 years from the test date."]
      ]
    },
    {
      id: "gmat",
      name: "GMAT Focus",
      short: "GMAT",
      full: "Graduate Management Admission Test \u2014 Focus Edition",
      body: "Graduate Management Admission Council (GMAC)",
      tagline: "MBA &amp; business school",
      blurb: "The GMAT Focus Edition (the only version now offered) is shorter, sharper, and more relevant to business school skills. No sentence correction. A new 205\u2013805 scale. Only your Total Score is sent \u2014 no trial sections, no cancelled scores.",
      duration: "2h 15m",
      score: "205\u2013805",
      sections: 3,
      mocks: 60,
      streams: ["Focus Edition"],
      official: "https://www.mba.com/exams/gmat-focus-edition",
      booking: "https://www.mba.com/exams/gmat-focus-edition/register",
      fees: { inr: "\u20B924,830", usd: "$300" },
      colour: "#B5852C",
      pattern: [
        ["Quantitative Reasoning", "21 questions \xB7 Problem Solving only (no Data Sufficiency) \xB7 45 min"],
        ["Verbal Reasoning", "23 questions \xB7 Critical Reasoning + Reading Comprehension (no Sentence Correction) \xB7 45 min"],
        ["Data Insights", "20 questions \xB7 Data Sufficiency \xB7 Multi-Source Reasoning \xB7 Table Analysis \xB7 Graphics Interpretation \xB7 Two-Part Analysis \xB7 45 min"]
      ],
      sections_detail: [
        {
          name: "Quantitative Reasoning",
          icon: "\u{1F522}",
          time: 45,
          questions: 21,
          types: ["Problem Solving: arithmetic, algebra, geometry, word problems \u2014 choose one of 5 options"],
          tips: "Focuses on higher-order reasoning over computation. You may use the on-screen calculator (a change from the old GMAT). Still practice mental math \u2014 calculator dependency wastes time."
        },
        {
          name: "Verbal Reasoning",
          icon: "\u{1F4D6}",
          time: 45,
          questions: 23,
          types: ["Critical Reasoning: strengthen, weaken, assumption, flaw, inference, boldface \u2014 choose one of 5 options", "Reading Comprehension: main idea, detail, inference, application \u2014 choose one of 5 options"],
          tips: "Sentence Correction is gone. The Focus Edition tests logical and analytical reading exclusively. Pre-thinking the answer before reading options is highly effective in CR."
        },
        {
          name: "Data Insights",
          icon: "\u{1F4CA}",
          time: 45,
          questions: 20,
          types: ["Data Sufficiency: 'Is the data sufficient to answer the question?' \u2014 choose one of 5 standard options", "Multi-Source Reasoning: draw inferences from multiple tabs of data", "Table Analysis: sort and interpret data tables", "Graphics Interpretation: read scatter plots, bar charts, pie charts", "Two-Part Analysis: solve two related parts simultaneously"],
          tips: "Data Sufficiency: memorise the 5 answer options (A\u2013E). Never solve \u2014 only assess sufficiency. Multi-Source Reasoning rewards careful tab-switching and cross-referencing."
        }
      ],
      scoreGuide: [
        ["755\u2013805", "99th percentile \u2014 exceptional; M7 median ~730"],
        ["705\u2013745", "Competitive for M7 and most top 15 MBA programmes"],
        ["655\u2013695", "Strong for top 25\u201350 programmes; may need strong application otherwise"],
        ["605\u2013645", "Below median for top programmes; many mid-tier MBAs accept this range"],
        ["Below 600", "Below median for most ranked business schools"]
      ],
      registration: [
        "Create a mba.com account and complete your candidate profile.",
        "Select 'Register for the GMAT Focus Edition'.",
        "Choose Online (from home) or Test Centre delivery.",
        "Pick a date, time and location.",
        "Pay $300. Rescheduling is free if done >60 days before the test.",
        "Scores available immediately upon completion (preview your score); official scores in 7 days."
      ],
      centres: "Available at 700+ Pearson VUE test centres worldwide and as an Online proctored exam. In India: Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad.",
      commonMistakes: [
        "Using the calculator for Data Sufficiency \u2014 DS is not about computing, it is about sufficiency. Calculator use on DS is a red flag for conceptual misunderstanding.",
        "Forgetting the 5 DS answer options \u2014 not knowing them cold wastes critical seconds.",
        "Confusing Inference with Must be True in CR \u2014 GMAT inferences must follow necessarily, not merely probably.",
        "Over-spending on Quant \u2014 21 questions in 45 min = slightly over 2 min each. Monitor pace.",
        "Applying Sentence Correction instincts to Verbal \u2014 this section has none. Every Verbal question is CR or RC.",
        "Not reviewing the Score Preview \u2014 you can cancel your score before it is reported (costs nothing)."
      ],
      faqs: [
        ["What happened to GMAT Classic?", "GMAC retired the GMAT (Classic) in February 2024. The GMAT Focus Edition is now the only version. It does not include Sentence Correction or an Analytical Writing section."],
        ["GMAT Focus or GRE for MBA?", "Most top MBA programmes accept both. GMAT Focus is specifically designed for management education and its Data Insights section is unique. GRE is preferred by candidates applying to joint degree or non-business programmes simultaneously."],
        ["Can I choose section order?", "Yes \u2014 on test day you can choose the order of the three sections. This is a key strategy decision; most coaches recommend starting with your strongest section."],
        ["How many attempts are allowed?", "5 attempts per 12 months, 8 lifetime maximum. After a failed attempt you must wait 16 days before retaking."],
        ["What is the Score Preview?", "After finishing, you see your unofficial score. You choose to Accept (score is reported) or Cancel (score is not sent anywhere). This choice is free and must be made immediately after the test."]
      ]
    }
  ]
};
