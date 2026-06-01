// LandingPrep — exam catalog v2 (rich, scraped from official sources for factual data)
window.LP_DATA = {
  EXAMS: [
    {
      id: "ielts", name: "IELTS", short: "IELTS",
      full: "International English Language Testing System",
      body: "British Council · IDP · Cambridge Assessment English",
      tagline: "Study, work, migration",
      blurb: "The world's most accepted English proficiency test — taken by 3.5 million people each year. Choose Academic for university admission and professional registration, or General Training for migration, work, and secondary school.",
      duration: "2h 45m", score: "Band 0–9", sections: 4, mocks: 60,
      streams: ["Academic", "General Training"],
      official: "https://ielts.org/take-a-test",
      booking: "https://ielts.org/take-a-test/booking-your-test",
      fees: { inr: "₹17,000–19,000", usd: "$215–230" },
      colour: "#B83A2E",
      pattern: [
        ["Listening", "4 parts · 40 questions · 30 min listening + 10 min answer transfer"],
        ["Reading", "3 passages · 40 questions · 60 min (Academic: academic texts; General: notices, ads, articles)"],
        ["Writing", "Task 1 (≥150 words, 20 min) + Task 2 (≥250 words, 40 min) · 60 min total"],
        ["Speaking", "Part 1: Introduction (4–5 min) · Part 2: Cue card (3–4 min) · Part 3: Discussion (4–5 min) · 11–14 min face-to-face"]
      ],
      sections_detail: [
        { name: "Listening", icon: "🎧", time: 40, questions: 40,
          types: ["Form completion", "Note completion", "Matching", "MCQ", "Map/diagram labelling", "Short answer"],
          tips: "You hear the recording once only. Answers follow the order of the questions in Parts 1–3." },
        { name: "Reading", icon: "📖", time: 60, questions: 40,
          types: ["True/False/Not Given", "Yes/No/Not Given", "Matching headings", "Matching information", "MCQ", "Sentence completion", "Summary completion"],
          tips: "Manage time: aim for 20 min per passage. Skim the questions before reading the passage." },
        { name: "Writing", icon: "✍️", time: 60, questions: 2,
          types: ["Task 1 Academic: describe graph/chart/diagram/map/process", "Task 1 General: write a letter", "Task 2: argumentative/discussion essay"],
          tips: "Plan Task 2 for 5 min. Task 2 carries double the marks of Task 1 — do not spend 40 min on Task 1." },
        { name: "Speaking", icon: "🎤", time: 14, questions: 3,
          types: ["Part 1: Everyday questions on familiar topics", "Part 2: Speak for 1–2 min from a cue card", "Part 3: Abstract discussion linked to Part 2 topic"],
          tips: "Extend answers naturally. Examiners look for fluency, lexical resource, grammar range and accuracy, and pronunciation." }
      ],
      scoreGuide: [
        ["Band 9", "Expert user — full operational command of English"],
        ["Band 8", "Very good user — occasional unsystematic inaccuracies"],
        ["Band 7", "Good user — occasional errors in complex situations"],
        ["Band 6.5", "Minimum for many UK/AUS university programmes"],
        ["Band 6", "Competent user — noticeable but manageable errors"],
        ["Band 5.5", "Minimum for some programmes; Immigration threshold in some countries"]
      ],
      registration: [
        "Create an account on ielts.org (British Council) or IDP India (ieltsidpindia.com).",
        "Select your test type: Academic or General Training.",
        "Choose your test format: Paper-based or Computer-delivered (CD-IELTS recommended for faster results and more slots).",
        "Pick a test centre, date and time from the calendar.",
        "Upload a clear scan of your passport exactly as it will appear on test day.",
        "Pay the fee online. Keep your booking confirmation email.",
        "Results: Paper-based — 13 days. Computer-delivered — 1–5 days."
      ],
      centres: "Available in 140+ countries at 1,600+ test centres. In India: Delhi, Mumbai, Chennai, Bangalore, Hyderabad, Kolkata, Pune, Ahmedabad, and 50+ other cities.",
      commonMistakes: [
        "Spending too long on Listening Part 1 and running out of time in Part 4.",
        "Writing fewer than 150 words for Task 1 — automatic score cap.",
        "Repeating the question words in Task 2 introduction — called 'lifting', penalised.",
        "Not checking spelling in Listening/Reading answers — one wrong spelling = wrong answer.",
        "In Reading, choosing NOT GIVEN when the answer is actually FALSE — read the passage, not your own knowledge.",
        "Speaking too fast in Part 2 to fill 2 minutes — slow down and develop each point."
      ],
      faqs: [
        ["Which stream should I choose?", "Academic for universities, postgraduate courses and professional body registration (e.g. nursing councils). General Training for skilled migration (Australia, Canada, UK visa), work experience, and secondary education. Always confirm with the receiving institution before booking."],
        ["CD-IELTS vs paper-based?", "CD-IELTS (computer-delivered) gives results in 1–5 days instead of 13, offers many more test dates, and allows you to type Writing tasks. The content is identical. Most candidates now choose CD-IELTS."],
        ["How many times can I retake?", "Unlimited — there is no restriction on the number of attempts. Most centres allow you to book again immediately after sitting."],
        ["Is the 9-band scale pass/fail?", "No. You receive a band score for each of the four skills and an Overall Band Score (average, rounded to nearest 0.5). Institutions set their own minimum — commonly 6.0, 6.5 or 7.0 overall."],
        ["How long is the score valid?", "IELTS scores are valid for two years from the test date."]
      ]
    },
    {
      id: "toefl", name: "TOEFL iBT", short: "TOEFL",
      full: "Test of English as a Foreign Language — Internet-Based Test",
      body: "Educational Testing Service (ETS)",
      tagline: "University admissions worldwide",
      blurb: "Accepted by 12,000+ universities in 160+ countries including all Ivy League institutions. Computer-delivered at an authorised centre or via the TOEFL iBT Home Edition where available.",
      duration: "~2h", score: "0–120", sections: 4, mocks: 60,
      streams: ["iBT", "Essentials"],
      official: "https://www.ets.org/toefl",
      booking: "https://www.ets.org/toefl/test-takers/ibt/register.html",
      fees: { inr: "₹15,254", usd: "$183 (centre) / $195 (Home Edition)" },
      colour: "#1F4F8B",
      pattern: [
        ["Reading", "2 passages · 10 questions each · ~35 min"],
        ["Listening", "2 lectures + 1 conversation · ~36 min (approx. 28 questions)"],
        ["Speaking", "4 tasks (1 independent + 3 integrated) · ~16 min"],
        ["Writing", "Integrated task (read-listen-write) + Academic Discussion task · ~29 min"]
      ],
      sections_detail: [
        { name: "Reading", icon: "📖", time: 35, questions: 20,
          types: ["Factual information", "Negative factual information", "Inference", "Rhetorical purpose", "Vocabulary in context", "Reference", "Sentence simplification", "Insert text", "Prose summary"],
          tips: "Read actively — mark supporting details. The 'summary' question at the end is worth 2 points; check all 6 options carefully." },
        { name: "Listening", icon: "🎧", time: 36, questions: 28,
          types: ["Main idea/gist", "Detail", "Function and attitude", "Organization", "Connecting information"],
          tips: "Take notes on the Cornell method (main idea left, detail right, summary below). Lectures can cover biology, history, art, economics — anything." },
        { name: "Speaking", icon: "🎤", time: 16, questions: 4,
          types: ["Task 1: Independent — your opinion on a topic (45 sec prep, 60 sec response)", "Task 2: Campus situation (read + listen + speak)", "Task 3: Academic topic (read + listen + speak)", "Task 4: Academic lecture (listen + speak)"],
          tips: "Use 3 seconds of the prep time to breathe and state your point clearly. Integrated tasks reward accuracy over fluency." },
        { name: "Writing", icon: "✍️", time: 29, questions: 2,
          types: ["Integrated: summarise lecture points vs reading passage (150–225 words, 20 min)", "Academic Discussion: contribute a response to a professor's discussion post (≥100 words, 10 min)"],
          tips: "Integrated Writing: the lecture will contradict, support or qualify the reading. Academic Discussion: take a clear position and support it with a specific reason." }
      ],
      scoreGuide: [
        ["118–120", "Top 1% — exceptional user"],
        ["110–117", "Competitive for top US/UK universities"],
        ["100–109", "Target for most research universities"],
        ["90–99", "Accepted by many mid-tier and state universities"],
        ["80–89", "Minimum for many programmes; ESL support may be required"],
        ["79 or below", "Below common university thresholds"]
      ],
      registration: [
        "Create an ETS account at ets.org/toefl.",
        "Choose 'Register for the TOEFL iBT' and select Centre or Home Edition.",
        "Select country, city and a test centre or home test option.",
        "Choose a date and time slot.",
        "Upload passport details — name must match exactly.",
        "Pay by credit/debit card. Scores released in 4–8 days online."
      ],
      centres: "Global network with 4,500+ centres in 165 countries. Home Edition available in most countries including India.",
      commonMistakes: [
        "Using informal vocabulary — TOEFL rewards academic register throughout.",
        "In Integrated Writing, summarising only the reading and ignoring the lecture.",
        "Speaking too quietly or rushing — enunciate, the scoring is AI-assisted.",
        "Missing the 2-point prose summary question in Reading — it changes your section score significantly.",
        "Taking notes too sparingly in Listening — you cannot replay audio."
      ],
      faqs: [
        ["TOEFL or IELTS?", "For US universities, TOEFL iBT is often preferred. IELTS is preferred by UK and Australian institutions. Both are accepted worldwide — check your specific programme's requirement."],
        ["What is the Home Edition?", "The TOEFL iBT Home Edition is the same test delivered at home via a secure browser with live remote proctoring. It requires a quiet room, working webcam and microphone, and a stable internet connection."],
        ["Can I section-skip?", "No. You must complete Reading, Listening, Speaking and Writing in that fixed order on test day."],
        ["How is Speaking scored?", "Speaking responses are scored by certified TOEFL raters on a 0–4 scale then converted to 0–30. AI-assisted tools assist the rating process."],
        ["When are scores available?", "Most candidates receive online scores within 4–8 days. Scores are valid for 2 years."]
      ]
    },
    {
      id: "pte", name: "PTE Academic", short: "PTE",
      full: "Pearson Test of English Academic",
      body: "Pearson VUE",
      tagline: "AI-scored · results in 48 hours",
      blurb: "Fully computer-based and AI-scored. Results in as little as 48 hours. Widely accepted for Australian, UK and Canadian visas and by 3,000+ universities globally.",
      duration: "2h", score: "10–90", sections: 3, mocks: 60,
      streams: ["Academic", "Core"],
      official: "https://www.pearsonpte.com/pte-academic",
      booking: "https://www.pearsonpte.com/book",
      fees: { inr: "₹16,900–18,900", usd: "$204–226" },
      colour: "#2F6F4E",
      pattern: [
        ["Speaking & Writing", "Read Aloud · Repeat Sentence · Describe Image · Re-tell Lecture · Answer Short Question · Summarize Written Text · Write Essay · 77–93 min"],
        ["Reading", "Reading & Writing Fill in the Blanks · MCQ Multiple · Re-order Paragraphs · Fill in the Blanks · MCQ Single · 32–41 min"],
        ["Listening", "Summarize Spoken Text · MCQ Multiple · Fill in the Blanks · Highlight Correct Summary · MCQ Single · Select Missing Word · Highlight Incorrect Words · Write From Dictation · 45–57 min"]
      ],
      sections_detail: [
        { name: "Speaking & Writing", icon: "🎤✍️", time: 85, questions: 0,
          types: ["Read Aloud (6–7): read text aloud clearly", "Repeat Sentence (10–12): repeat exactly", "Describe Image (6–7): describe chart/graph/photo", "Re-tell Lecture (3–4): summarise spoken lecture", "Answer Short Question (5–6): one-word/phrase answers", "Summarize Written Text (1–2): one-sentence summary", "Write Essay (1–2): 200–300 word argumentative essay"],
          tips: "Read Aloud and Repeat Sentence heavily impact Listening scores too. Speak continuously — pausing too long triggers recording to stop." },
        { name: "Reading", icon: "📖", time: 37, questions: 0,
          types: ["Reading & Writing Fill in Blanks (5–6): drag words into gaps", "MCQ Multiple (1–2): select all correct answers (penalty for wrong)", "Re-order Paragraphs (2–3): arrange jumbled sentences", "Fill in Blanks (4–5): select from dropdown", "MCQ Single (1–2): one correct answer"],
          tips: "Re-order Paragraphs: find the topic sentence (usually no pronoun or reference at start). MCQ Multiple: wrong answers deduct marks — be selective." },
        { name: "Listening", icon: "🎧", time: 50, questions: 0,
          types: ["Summarize Spoken Text (2–3): 50–70 word summary", "MCQ Multiple (2–3): select all correct answers", "Fill in Blanks (2–3): type missing words", "Highlight Correct Summary (2–3): pick best summary", "MCQ Single (2–3): one correct answer", "Select Missing Word (2–3): choose end of audio", "Highlight Incorrect Words (2–3): identify words that differ from transcript", "Write From Dictation (3–4): type what you hear exactly"],
          tips: "Write From Dictation is the highest-weight Listening task. Listen for each word precisely — score is partial (per correct word)." }
      ],
      scoreGuide: [
        ["85–90", "Expert communicator — rare; Australian PR/student visa: well above minimum"],
        ["79–84", "Very high — exceeds most immigration thresholds"],
        ["65–78", "Target for Australian skilled visa (typically 65+), UK student visa (58+)"],
        ["50–64", "Accepted by many universities; below some immigration thresholds"],
        ["42–49", "Limited proficiency — below most university and visa requirements"]
      ],
      registration: [
        "Create a Pearson account at pearsonpte.com.",
        "Select PTE Academic or PTE Core (for Canadian PR/citizenship).",
        "Find a test centre and available date/time.",
        "Enter ID details — passport recommended.",
        "Pay and receive booking confirmation.",
        "Results delivered to your myPTE account in 48 hours."
      ],
      centres: "4,000+ test centres in 100+ countries. In India: 40+ cities including Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Pune, Kolkata.",
      commonMistakes: [
        "Pausing too long in Read Aloud — the microphone cuts off after 3 seconds of silence.",
        "Speaking with a regional accent too heavy for the AI — train for clear, measured pronunciation.",
        "Ignoring Repeat Sentence — it affects both Speaking AND Listening scores simultaneously.",
        "Not finishing Write From Dictation — partial scoring means every word counts.",
        "Over-time on Write Essay — 300 words is enough; above 400 rarely improves scores."
      ],
      faqs: [
        ["Why choose PTE over IELTS?", "Faster results (48 hrs), no human examiner bias, more test centre slots, and AI consistency. PTE is also fully computer-based, which many candidates find less stressful than a face-to-face speaking interview."],
        ["Is PTE accepted for UK visas?", "Yes — PTE Academic is on the UK Home Office SELT list. Required score varies by visa type. Always confirm with UKVI."],
        ["What is PTE Core?", "PTE Core is designed specifically for Canadian immigration (IRCC Express Entry and Provincial Nominee Programs). It differs from PTE Academic in content and score benchmarks."],
        ["How often can I retake PTE?", "Unlimited attempts. Results are valid for 2 years from the test date."]
      ]
    },
    {
      id: "celpip", name: "CELPIP", short: "CELPIP",
      full: "Canadian English Language Proficiency Index Programme",
      body: "Paragon Testing Enterprises (UBC)",
      tagline: "Canada PR &amp; citizenship",
      blurb: "Designated by Immigration, Refugees and Citizenship Canada (IRCC) for permanent residence and citizenship applications. All sections are computer-delivered using Canadian English contexts and accents.",
      duration: "3h", score: "1–12", sections: 4, mocks: 60,
      streams: ["General", "General LS"],
      official: "https://www.celpip.ca/",
      booking: "https://www.celpip.ca/register/",
      fees: { inr: "₹18,000–20,000", usd: "$215–240" },
      colour: "#C8501F",
      pattern: [
        ["Listening", "6 parts (news broadcast, conversation, discussion, news item, interview, opinion) · 47–55 min"],
        ["Reading", "4 parts (correspondence, diagram/chart, information, viewpoints) · 55–64 min"],
        ["Writing", "Task 1: Email (150–200 words, 27 min) + Task 2: Survey response (150–200 words, 26 min) · 53 min total"],
        ["Speaking", "8 tasks (giving advice, talking to neighbour, situation description, etc.) · ~15–20 min total"]
      ],
      sections_detail: [
        { name: "Listening", icon: "🎧", time: 50, questions: 38,
          types: ["Part 1: News broadcast", "Part 2: Conversation between two friends", "Part 3: News item with detailed information", "Part 4: Discussion between two people", "Part 5: Interview between two people", "Part 6: Opinion about a topic"],
          tips: "All audio features Canadian accents and Canadian cultural references. Familiarise yourself with Canadian English pronunciation and vocabulary." },
        { name: "Reading", icon: "📖", time: 55, questions: 38,
          types: ["Part 1: Reading correspondence (email/letter)", "Part 2: Reading to apply information from a diagram", "Part 3: Reading for information from articles", "Part 4: Reading for viewpoints and opinions"],
          tips: "Part 4 is the most time-pressured. Practice reading opinion pieces quickly and identifying the writer's position." },
        { name: "Writing", icon: "✍️", time: 53, questions: 2,
          types: ["Task 1: Email — write an email in response to a given situation (150–200 words)", "Task 2: Survey response — respond to two open-ended questions (150–200 words total)"],
          tips: "Use the CELPIP writing scoring rubric: Task Fulfilment, Vocabulary, Readability, and Conventions. Write in a friendly, Canadian-casual register for emails." },
        { name: "Speaking", icon: "🎤", time: 18, questions: 8,
          types: ["Task 1: Giving advice (30 sec prep, 90 sec response)", "Task 2: Talking to a neighbour", "Task 3: Discussing options from a chart", "Task 4: Making predictions", "Task 5: Comparing visuals", "Task 6: Dealing with a difficult situation", "Task 7: Expressing opinions", "Task 8: Describing an unusual situation"],
          tips: "All speaking responses are recorded and scored by raters. Organise your response with a clear opening, 2–3 supporting points, and a conclusion." }
      ],
      scoreGuide: [
        ["10–12", "Advanced proficiency — exceeds most immigration requirements"],
        ["9", "Meets Express Entry CLB 9 requirement for high CRS points"],
        ["7–8", "Meets minimum for most PR pathways (CLB 7–8)"],
        ["5–6", "Below common immigration thresholds; suitable for some work permits"],
        ["1–4", "Limited proficiency"]
      ],
      registration: [
        "Register at celpip.ca — create an account.",
        "Select CELPIP-General (PR) or CELPIP-General LS (citizenship).",
        "Choose a test centre (Canada or select international cities).",
        "Upload valid government photo ID.",
        "Pay the registration fee. Results typically within 4–5 business days."
      ],
      centres: "Primarily in Canada. Limited centres internationally — check celpip.ca for current locations. No Home Edition available.",
      commonMistakes: [
        "Not targeting the word count — Writing below 150 words is heavily penalised.",
        "Using British English spellings — CELPIP uses Canadian English (colour, honour — same as British; program — same as American). Do not mix.",
        "Forgetting to address all three bullet points in the email task.",
        "Speaking too formally — CELPIP tests practical, everyday Canadian English, not academic English.",
        "Confusing CELPIP-General with CELPIP-General LS — wrong test means invalid score for your application."
      ],
      faqs: [
        ["CELPIP vs IELTS for Canada PR?", "Both are accepted by IRCC. CELPIP uses Canadian contexts and accents, making it more relevant for Canada. It is also fully computer-based. The choice often comes down to familiarity with the format."],
        ["What CLB level do I need?", "Federal Skilled Worker: CLB 7 (score of 7 in all bands). CEC: CLB 7 (speaking/listening), CLB 5 (reading/writing) for NOC 0/A; CLB 5 all bands for NOC B. Always verify with the IRCC website."],
        ["Is CELPIP accepted for citizenship?", "CELPIP-General (not General LS) or CELPIP-General LS — confirm which version your citizenship application requires with IRCC before booking."],
        ["Scores valid for how long?", "2 years from test date for immigration purposes."]
      ]
    },
    {
      id: "duolingo", name: "Duolingo English Test", short: "DET",
      full: "Duolingo English Test",
      body: "Duolingo Inc.",
      tagline: "From home · 60 minutes · $65",
      blurb: "Adaptive online English proficiency test taken at home in under an hour. Accepted by 5,500+ universities including Yale, Columbia, NYU, MIT, and the University of Toronto.",
      duration: "1h", score: "10–160", sections: 2, mocks: 60,
      streams: ["Standard"],
      official: "https://englishtest.duolingo.com/",
      booking: "https://englishtest.duolingo.com/applicants",
      fees: { inr: "₹5,000–5,400", usd: "$65" },
      colour: "#4F8B2F",
      pattern: [
        ["Adaptive Test", "Mixed reading, listening, speaking, writing tasks · 45 min (adaptive difficulty)"],
        ["Video Interview + Writing Sample", "Open-ended unscored video + writing responses · 10 min"],
        ["Results", "Certified scores in ≤48 hours · Overall score + subscores for literacy, comprehension, conversation, production"]
      ],
      sections_detail: [
        { name: "Adaptive Test", icon: "🤖", time: 45, questions: 0,
          types: ["Read and Complete: fill missing letters in a word", "Read Aloud: read a sentence aloud", "Listen and Type: transcribe spoken audio", "Read and Select: select real English words from a list", "Write About the Photo: describe an image in 1 sentence", "Speak About the Photo: describe an image aloud (30 sec)", "Listen and Respond: respond to a question about an audio clip", "Read Aloud (long): read a paragraph aloud", "Writing Sample: write on a prompted topic (≥50 words)", "Speaking Sample: speak on a prompted topic (≥30 sec)"],
          tips: "The test adapts — harder questions mean higher potential scores. Do not rush; accuracy matters more than speed on word-level tasks." },
        { name: "Video Interview", icon: "🎥", time: 10, questions: 2,
          types: ["Unscored open-ended video question (sent to institutions as supplemental information)", "Unscored writing sample"],
          tips: "Although unscored, institutions do view the video interview. Speak clearly, confidently, and on-topic." }
      ],
      scoreGuide: [
        ["140–160", "Proficiency equivalent to IELTS 8–9, TOEFL 110+"],
        ["120–135", "Equivalent to IELTS 7–7.5, TOEFL 94–109"],
        ["100–115", "Equivalent to IELTS 6.5–7, TOEFL 80–93"],
        ["80–95", "Equivalent to IELTS 6–6.5, TOEFL 65–79"],
        ["60–75", "Below most university thresholds"]
      ],
      registration: [
        "Create a Duolingo account at englishtest.duolingo.com.",
        "Verify your identity with a government ID.",
        "Download the secure browser or use the web app.",
        "Schedule a session — tests can be started within minutes of registration.",
        "Pay $65 by credit/debit card.",
        "Sit the test in a quiet room with a working webcam, microphone and stable internet.",
        "Send certified results to institutions for free from your dashboard."
      ],
      centres: "No test centre needed — taken entirely from home. Requires a supported laptop or desktop with webcam and microphone.",
      commonMistakes: [
        "Not practising Read Aloud sufficiently — pronunciation clarity matters significantly.",
        "Submitting very short responses to Writing Sample and Speaking Sample — both need substantive content.",
        "Having background noise during the test — this can trigger a flag and invalidate results.",
        "Leaving during the adaptive section — any disruption is flagged.",
        "Not using all available time on Speaking prompts — 30 seconds minimum is expected."
      ],
      faqs: [
        ["Is DET accepted by top universities?", "Yes — MIT, Yale, Columbia, NYU, Carnegie Mellon and thousands more. However, some programmes still require IELTS or TOEFL. Always verify with your specific programme."],
        ["How adaptive is the test?", "The adaptive engine adjusts difficulty based on each answer. Answering harder questions correctly leads to a higher final score. You will likely see items across a wide range of difficulty."],
        ["What equipment is needed?", "A quiet room with no other people, a laptop or desktop with a working front-facing camera and microphone, and a reliable internet connection. Tablets and phones are not supported."],
        ["Can I retake if I fail?", "You can take the test up to twice per 30-day period."]
      ]
    },
    {
      id: "gre", name: "GRE General Test", short: "GRE",
      full: "Graduate Record Examinations — General Test",
      body: "Educational Testing Service (ETS)",
      tagline: "Graduate school admissions",
      blurb: "The standard graduate admissions test for master's and PhD programmes globally. Section-adaptive: your performance in the first scored section of each measure determines the difficulty of the second section.",
      duration: "1h 58m", score: "Verbal 130–170 · Quant 130–170 · AW 0–6", sections: 3, mocks: 60,
      streams: ["General Test"],
      official: "https://www.ets.org/gre",
      booking: "https://www.ets.org/gre/test-takers/general-test/register.html",
      fees: { inr: "₹22,550", usd: "$220 (most locations) / $213 (India)" },
      colour: "#5B3A8B",
      pattern: [
        ["Analytical Writing", "1 task: Analyse an Issue · 30 min"],
        ["Verbal Reasoning", "2 sections · 27 questions total · 41 min (section-adaptive)"],
        ["Quantitative Reasoning", "2 sections · 27 questions total · 47 min (section-adaptive)"]
      ],
      sections_detail: [
        { name: "Analytical Writing", icon: "✍️", time: 30, questions: 1,
          types: ["Analyse an Issue: write a well-reasoned essay taking a position on a complex topic"],
          tips: "AW is scored holistically 0–6 by trained raters and e-rater. A 4.0+ satisfies most programmes. Structure: intro with clear position, 2–3 developed body paragraphs, concise conclusion." },
        { name: "Verbal Reasoning", icon: "📖", time: 41, questions: 27,
          types: ["Text Completion (1–3 blanks): fill blanks with vocabulary that fits context", "Sentence Equivalence (2 blanks): both answers must produce equivalent meaning", "Reading Comprehension: short and long passage MCQ, select-in-passage"],
          tips: "Vocabulary is tested in context — focus on high-frequency GRE words. RC: always read the question before the passage to focus your reading." },
        { name: "Quantitative Reasoning", icon: "🔢", time: 47, questions: 27,
          types: ["Quantitative Comparison (QC): compare two quantities", "Problem Solving MCQ: choose one or multiple answers", "Numeric Entry: type the exact answer"],
          tips: "QC questions reward estimation, not full calculation — check whether the relationship is always/sometimes/never true. Calculator is provided on-screen but avoid over-relying on it." }
      ],
      scoreGuide: [
        ["Verbal 165–170 / Quant 165–170", "Top 10% — competitive for top PhD programmes"],
        ["Verbal 160+ / Quant 160+", "Strong — 75th+ percentile in respective measures"],
        ["Verbal 155 / Quant 155", "Solid — 69th percentile verbal, 66th percentile quant"],
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
        "Scores available 8–10 days after the test. Valid for 5 years."
      ],
      centres: "Prometric test centres worldwide. GRE at Home available in most countries. In India: Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune.",
      commonMistakes: [
        "Spending too long on hard Verbal questions — skip and return at the end of the section.",
        "Ignoring AW because it is a separate score — many funded PhD programmes require AW 4.5+.",
        "Choosing 'C — the two quantities are equal' in QC by default — test with numbers first.",
        "Forgetting that Quant uses standard US conventions — percentages, ratios, coordinate geometry.",
        "Not practising Numeric Entry — calculators can't save you from setting up the problem wrong.",
        "Leaving words in Sentence Equivalence that are not synonymous — both blanks must produce complete and equivalent sentences."
      ],
      faqs: [
        ["How is the section-adaptive feature different from item-adaptive?", "GRE adapts at the section level — your score on section 1 determines whether section 2 is 'easy', 'medium' or 'hard'. This means even if you answer one question wrong, you are not immediately penalised the way you would be in a fully adaptive test."],
        ["Can I retake GRE?", "Yes — once every 21 days and up to 5 times in a 12-month period. Only scores from tests taken in the past 5 years are reportable."],
        ["What is the ScoreSelect option?", "You choose which test scores to send to programmes — you can send your best single day's scores or all scores. Check whether the programme wants to see all scores."],
        ["GRE or GMAT for business school?", "Most top MBA programmes accept both equally. GRE tends to be preferred for joint degree programmes and by candidates applying to multiple disciplines."],
        ["How long are GRE scores valid?", "5 years from the test date."]
      ]
    },
    {
      id: "gmat", name: "GMAT Focus", short: "GMAT",
      full: "Graduate Management Admission Test — Focus Edition",
      body: "Graduate Management Admission Council (GMAC)",
      tagline: "MBA &amp; business school",
      blurb: "The GMAT Focus Edition (the only version now offered) is shorter, sharper, and more relevant to business school skills. No sentence correction. A new 205–805 scale. Only your Total Score is sent — no trial sections, no cancelled scores.",
      duration: "2h 15m", score: "205–805", sections: 3, mocks: 60,
      streams: ["Focus Edition"],
      official: "https://www.mba.com/exams/gmat-focus-edition",
      booking: "https://www.mba.com/exams/gmat-focus-edition/register",
      fees: { inr: "₹24,830", usd: "$300" },
      colour: "#B5852C",
      pattern: [
        ["Quantitative Reasoning", "21 questions · Problem Solving only (no Data Sufficiency) · 45 min"],
        ["Verbal Reasoning", "23 questions · Critical Reasoning + Reading Comprehension (no Sentence Correction) · 45 min"],
        ["Data Insights", "20 questions · Data Sufficiency · Multi-Source Reasoning · Table Analysis · Graphics Interpretation · Two-Part Analysis · 45 min"]
      ],
      sections_detail: [
        { name: "Quantitative Reasoning", icon: "🔢", time: 45, questions: 21,
          types: ["Problem Solving: arithmetic, algebra, geometry, word problems — choose one of 5 options"],
          tips: "Focuses on higher-order reasoning over computation. You may use the on-screen calculator (a change from the old GMAT). Still practice mental math — calculator dependency wastes time." },
        { name: "Verbal Reasoning", icon: "📖", time: 45, questions: 23,
          types: ["Critical Reasoning: strengthen, weaken, assumption, flaw, inference, boldface — choose one of 5 options", "Reading Comprehension: main idea, detail, inference, application — choose one of 5 options"],
          tips: "Sentence Correction is gone. The Focus Edition tests logical and analytical reading exclusively. Pre-thinking the answer before reading options is highly effective in CR." },
        { name: "Data Insights", icon: "📊", time: 45, questions: 20,
          types: ["Data Sufficiency: 'Is the data sufficient to answer the question?' — choose one of 5 standard options", "Multi-Source Reasoning: draw inferences from multiple tabs of data", "Table Analysis: sort and interpret data tables", "Graphics Interpretation: read scatter plots, bar charts, pie charts", "Two-Part Analysis: solve two related parts simultaneously"],
          tips: "Data Sufficiency: memorise the 5 answer options (A–E). Never solve — only assess sufficiency. Multi-Source Reasoning rewards careful tab-switching and cross-referencing." }
      ],
      scoreGuide: [
        ["755–805", "99th percentile — exceptional; M7 median ~730"],
        ["705–745", "Competitive for M7 and most top 15 MBA programmes"],
        ["655–695", "Strong for top 25–50 programmes; may need strong application otherwise"],
        ["605–645", "Below median for top programmes; many mid-tier MBAs accept this range"],
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
        "Using the calculator for Data Sufficiency — DS is not about computing, it is about sufficiency. Calculator use on DS is a red flag for conceptual misunderstanding.",
        "Forgetting the 5 DS answer options — not knowing them cold wastes critical seconds.",
        "Confusing Inference with Must be True in CR — GMAT inferences must follow necessarily, not merely probably.",
        "Over-spending on Quant — 21 questions in 45 min = slightly over 2 min each. Monitor pace.",
        "Applying Sentence Correction instincts to Verbal — this section has none. Every Verbal question is CR or RC.",
        "Not reviewing the Score Preview — you can cancel your score before it is reported (costs nothing)."
      ],
      faqs: [
        ["What happened to GMAT Classic?", "GMAC retired the GMAT (Classic) in February 2024. The GMAT Focus Edition is now the only version. It does not include Sentence Correction or an Analytical Writing section."],
        ["GMAT Focus or GRE for MBA?", "Most top MBA programmes accept both. GMAT Focus is specifically designed for management education and its Data Insights section is unique. GRE is preferred by candidates applying to joint degree or non-business programmes simultaneously."],
        ["Can I choose section order?", "Yes — on test day you can choose the order of the three sections. This is a key strategy decision; most coaches recommend starting with your strongest section."],
        ["How many attempts are allowed?", "5 attempts per 12 months, 8 lifetime maximum. After a failed attempt you must wait 16 days before retaking."],
        ["What is the Score Preview?", "After finishing, you see your unofficial score. You choose to Accept (score is reported) or Cancel (score is not sent anywhere). This choice is free and must be made immediately after the test."]
      ]
    }
  ]
};
