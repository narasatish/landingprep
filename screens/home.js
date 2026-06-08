const { useState: useStateH } = React;
const LP_TAGLINE = "From mock test to campus abroad";
function LPLogo({ size = 30 }) {
  return /* @__PURE__ */ React.createElement("svg", { width: size, height: size, viewBox: "0 0 32 32", "aria-hidden": "true", className: "lp-logo" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "lpLogoGrad", x1: "0", y1: "0", x2: "1", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { offset: "0", stopColor: "#4F46E5" }), /* @__PURE__ */ React.createElement("stop", { offset: "1", stopColor: "#9333EA" }))), /* @__PURE__ */ React.createElement("rect", { width: "32", height: "32", rx: "8.5", fill: "url(#lpLogoGrad)" }), /* @__PURE__ */ React.createElement("path", { d: "M16 8.2 L27 12.6 L16 17 L5 12.6 Z", fill: "#fff" }), /* @__PURE__ */ React.createElement("path", { d: "M9.4 14.6 L9.4 19.3 C12.8 21.6 19.2 21.6 22.6 19.3 L22.6 14.6", fill: "none", stroke: "#fff", strokeWidth: "1.7", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M27 12.6 L27 18.6", stroke: "#fff", strokeWidth: "1.4", strokeLinecap: "round" }), /* @__PURE__ */ React.createElement("circle", { cx: "27", cy: "19.4", r: "1.25", fill: "#fff" }));
}
const FAQS = [
  {
    q: "Are the IELTS, TOEFL and PTE mock tests really free?",
    a: "Yes \u2014 100% free, forever. All 1,000+ mock tests across IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo English Test, GRE and GMAT Focus are free with no signup, no credit card and no paywall. Start any test directly from the homepage."
  },
  {
    q: "Do the mock tests use real exam patterns and timings?",
    a: "Every test mirrors the official 2026 format and timing \u2014 IELTS Listening 30+10 minutes, Reading 60, Writing 60; PTE Read Aloud, Repeat Sentence, Describe Image and Write Essay; GMAT Focus Quant, Verbal and Data Insights. We rebuild the formats and timing, never the copyrighted questions."
  },
  {
    q: "Can I practise IELTS and PTE speaking with a real voice?",
    a: "Yes. Our AI Speaking Agent uses natural neural voices \u2014 you speak into your mic, get live transcripts and AI follow-up questions, just like a real examiner. Listening sections and Describe Image / Re-tell Lecture tasks also play real audio."
  },
  {
    q: "Do I get model answers and band-level feedback for writing?",
    a: "Every writing task \u2014 IELTS Task 1 & 2, TOEFL integrated and discussion, PTE essay, GRE issue, GMAT and CELPIP \u2014 includes a free Band 7+/CEFR C1 model answer plus live word-count and rubric guidance. The AI Writing Agent gives instant structured feedback on any essay you paste."
  },
  {
    q: "Can LandingPrep also help me choose a university and apply abroad?",
    a: "Yes. Beyond free mock tests, LandingPrep includes a free College Predictor across 99 top universities (USA, UK, Canada, Australia, Germany and more) with fees, requirements, scholarships and admission process, plus an SOP builder, study-abroad destination guides with visa-success rates and immigration pathways, and an education-loan comparison \u2014 everything to go from test prep to admission, free."
  },
  {
    q: "How accurate is the scoring?",
    a: "Listening and Reading use the official band/scaled-score conversion tables. Writing and Speaking use a transparent rubric-based heuristic (task achievement, coherence, vocabulary, grammar). Scores are indicative \u2014 an empty answer never scores, and random text never reaches Band 8."
  },
  {
    q: "Do I need to create an account or download anything?",
    a: "No. LandingPrep runs entirely in your browser on any device \u2014 no download, no signup. An optional free account only adds progress tracking, streaks and skill analytics across all seven exams."
  }
];
const STUDY_FAQS = [
  {
    q: "Which country is best for international students?",
    a: "It depends on your budget, field and PR goals. The USA leads on research and salaries; Canada and Australia offer the clearest permanent-residence pathways; the UK has a fast 1-year master's; Germany has near-free public-university tuition; Ireland and the Netherlands are strong English-taught EU hubs. Use the free Country Guide to compare visa-success rates, costs and immigration routes side by side."
  },
  {
    q: "How do I shortlist the right universities?",
    a: "Build a balanced list of Safe, Target and Reach schools based on your test score, GPA and budget. LandingPrep's free Profile Evaluation and College Predictor do this automatically across 99 top universities, showing fees, requirements, acceptance rates and Safe/Target/Reach matches."
  },
  {
    q: "Which English test should I take to study abroad?",
    a: "Check what your target universities and visa accept. IELTS and TOEFL are the most widely accepted; PTE and the Duolingo English Test are faster and often cheaper; CELPIP is used for Canada. Each LandingPrep exam hub shows the latest pattern, fees and score requirements \u2014 all with free mock tests."
  },
  {
    q: "How can I fund my study abroad?",
    a: "Combine scholarships, education loans and part-time work. The country-based Scholarship Finder lists fully-funded and merit awards, and the Loan Compare tool shows 10 lenders with interest rates, limits and EMI. Most student visas also allow around 20 hours of part-time work per week."
  },
  {
    q: "What is the student-visa success rate, and how do I improve mine?",
    a: "Success rates vary by country and profile \u2014 each destination guide shows its indicative visa-success rate. The biggest factors are solid proof of funds, a genuine and consistent study plan, and documents that match. Apply early, especially for Fall intake."
  },
  {
    q: "Can I stay and work after I graduate?",
    a: "Yes in most top destinations: the USA offers OPT (12\u201336 months), the UK a 2-year Graduate Route, Canada a PGWP of up to 3 years, and Australia a 485 visa for 2\u20134 years. Each Country Guide shows the full step-by-step path from study to work to permanent residence."
  }
];
const TESTIMONIALS = [
  {
    name: "Priya S.",
    exam: "IELTS Academic",
    place: "Bengaluru, India",
    stars: 5,
    text: "Got Band 7.5 on my first attempt. The free mock tests felt exactly like the real exam and the model answers showed me precisely how to structure Task 2."
  },
  {
    name: "Daniel O.",
    exam: "PTE Academic",
    place: "Lagos \u2192 Sydney",
    stars: 5,
    text: "The AI speaking practice and Describe Image charts were a game-changer. I jumped from 65 to 82 and saved hundreds on coaching."
  },
  {
    name: "Mei L.",
    exam: "TOEFL iBT",
    place: "Shanghai",
    stars: 5,
    text: "Real timings, instant scoring, and the writing model answers are genuinely C1 level. I hit 105 and got into my dream grad program."
  },
  {
    name: "Ahmed R.",
    exam: "CELPIP",
    place: "Toronto",
    stars: 5,
    text: "Practised the email and survey tasks daily here for free. Scored CLB 9 across the board for my PR \u2014 couldn't recommend it more."
  },
  {
    name: "Sofia G.",
    exam: "GMAT Focus",
    place: "S\xE3o Paulo",
    stars: 5,
    text: "The Data Insights drills with real charts were exactly what I needed. Clean interface, honest scoring, completely free."
  },
  {
    name: "Rahul M.",
    exam: "GRE",
    place: "Hyderabad",
    stars: 5,
    text: "The 30-day plan plus the issue-essay model answers took me from a 305 diagnostic to a 322. Best free GRE resource I found."
  }
];
const CEFR_TABLE = {
  C2: {
    label: "C2 \xB7 Mastery",
    ielts: "8.5\u20139.0",
    toefl: "115\u2013120",
    pte: "85\u201390",
    celpip: "11\u201312",
    duolingo: "145\u2013160",
    elig: "Top-tier universities (Oxbridge, Ivy League) and the maximum language points for PR/immigration. You're exam-ready for anything."
  },
  C1: {
    label: "C1 \xB7 Advanced",
    ielts: "7.0\u20138.0",
    toefl: "95\u2013114",
    pte: "65\u201384",
    celpip: "9\u201310",
    duolingo: "120\u2013140",
    elig: "Competitive master's & PhD programs, professional registration (nursing, engineering), and strong Canada/Australia PR points."
  },
  B2: {
    label: "B2 \xB7 Upper-Intermediate",
    ielts: "5.5\u20136.5",
    toefl: "72\u201394",
    pte: "50\u201364",
    celpip: "7\u20138",
    duolingo: "95\u2013115",
    elig: "Most undergraduate programs, UK & Australia student visas, and many taught master's degrees. The common 6.0\u20136.5 admission band."
  },
  B1: {
    label: "B1 \xB7 Intermediate",
    ielts: "4.0\u20135.0",
    toefl: "42\u201371",
    pte: "36\u201349",
    celpip: "5\u20136",
    duolingo: "75\u201390",
    elig: "Foundation / pathway & some diploma programs. Below most direct-entry degree requirements \u2014 aim higher for university."
  },
  A2: {
    label: "A2 \xB7 Elementary",
    ielts: "3.0\u20133.5",
    toefl: "0\u201341",
    pte: "10\u201335",
    celpip: "3\u20134",
    duolingo: "10\u201370",
    elig: "Below typical academic and visa requirements. Build core skills first \u2014 practise daily and re-test in a few weeks."
  }
};
function scoreToCEFR(exam, s) {
  const v = parseFloat(s);
  if (isNaN(v)) return null;
  const t = {
    ielts: [[8.5, "C2"], [7, "C1"], [5.5, "B2"], [4, "B1"], [0, "A2"]],
    toefl: [[115, "C2"], [95, "C1"], [72, "B2"], [42, "B1"], [0, "A2"]],
    pte: [[85, "C2"], [65, "C1"], [50, "B2"], [36, "B1"], [0, "A2"]],
    celpip: [[11, "C2"], [9, "C1"], [7, "B2"], [5, "B1"], [0, "A2"]],
    duolingo: [[145, "C2"], [120, "C1"], [95, "B2"], [75, "B1"], [0, "A2"]]
  }[exam] || [];
  for (const [min, lvl] of t) if (v >= min) return lvl;
  return "A2";
}
const PREDICTOR_EXAMS = [
  { id: "ielts", name: "IELTS", ph: "e.g. 6.5", step: "0.5", min: "0", max: "9" },
  { id: "toefl", name: "TOEFL iBT", ph: "e.g. 90", step: "1", min: "0", max: "120" },
  { id: "pte", name: "PTE", ph: "e.g. 60", step: "1", min: "10", max: "90" },
  { id: "celpip", name: "CELPIP", ph: "e.g. 9", step: "1", min: "1", max: "12" },
  { id: "duolingo", name: "Duolingo", ph: "e.g. 120", step: "5", min: "10", max: "160" }
];
function BandPredictor() {
  const [exam, setExam] = useStateH("ielts");
  const [score, setScore] = useStateH("");
  const cfg = PREDICTOR_EXAMS.find((e) => e.id === exam);
  const cefr = score ? scoreToCEFR(exam, score) : null;
  const row = cefr ? CEFR_TABLE[cefr] : null;
  const others = ["ielts", "toefl", "pte", "celpip", "duolingo"].filter((e) => e !== exam);
  const nameOf = (id) => PREDICTOR_EXAMS.find((e) => e.id === id).name;
  return /* @__PURE__ */ React.createElement("div", { className: "predictor-card reveal" }, /* @__PURE__ */ React.createElement("div", { className: "predictor-form" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "predictor-label" }, "Your exam"), /* @__PURE__ */ React.createElement("div", { className: "predictor-exam-row" }, PREDICTOR_EXAMS.map((e) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: e.id,
      className: "predictor-chip" + (exam === e.id ? " active" : ""),
      onClick: () => {
        setExam(e.id);
        setScore("");
      }
    },
    e.name
  )))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "predictor-label" }, "Your score"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "predictor-input",
      type: "number",
      inputMode: "decimal",
      placeholder: cfg.ph,
      step: cfg.step,
      min: cfg.min,
      max: cfg.max,
      value: score,
      onChange: (e) => setScore(e.target.value)
    }
  ))), row ? /* @__PURE__ */ React.createElement("div", { className: "predictor-result" }, /* @__PURE__ */ React.createElement("div", { className: "predictor-cefr" }, "Your level: ", /* @__PURE__ */ React.createElement("strong", null, row.label)), /* @__PURE__ */ React.createElement("div", { className: "predictor-equiv" }, /* @__PURE__ */ React.createElement("div", { className: "pe-title" }, "Equivalent scores"), /* @__PURE__ */ React.createElement("div", { className: "pe-grid" }, others.map((id) => /* @__PURE__ */ React.createElement("div", { className: "pe-cell", key: id }, /* @__PURE__ */ React.createElement("span", { className: "pe-exam" }, nameOf(id)), /* @__PURE__ */ React.createElement("span", { className: "pe-val" }, row[id]))))), /* @__PURE__ */ React.createElement("div", { className: "predictor-elig" }, /* @__PURE__ */ React.createElement("strong", null, "What this gets you:"), " ", row.elig), /* @__PURE__ */ React.createElement("p", { className: "predictor-note" }, "Indicative CEFR-aligned conversion. Always confirm exact requirements with your target university or visa authority.")) : /* @__PURE__ */ React.createElement("p", { className: "predictor-hint" }, "Enter your score to see your CEFR level, equivalent scores in every other exam, and what universities/visas you qualify for."));
}
function Home({ onGuide, onPractice, onNav }) {
  const exams = window.LP_DATA.EXAMS;
  const [faqTab, setFaqTab] = useStateH("exams");
  React.useEffect(() => {
    if (!window.LP_SEO) return;
    window.LP_SEO.set({
      title: "Free IELTS, TOEFL, PTE, GRE & GMAT Mock Tests Online | LandingPrep",
      description: "1,000+ free practice tests with answers and model responses. Real exam patterns, instant scoring, natural-voice listening \u2014 no signup required."
    });
  }, []);
  const faqActive = faqTab === "abroad" ? STUDY_FAQS : FAQS;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "home", onNav }), /* @__PURE__ */ React.createElement(window.LP_Marquee, null), /* @__PURE__ */ React.createElement("main", { id: "main-content" }, /* @__PURE__ */ React.createElement("section", { className: "hero" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "hero-inner-clean" }, /* @__PURE__ */ React.createElement("div", { className: "hero-meta" }, /* @__PURE__ */ React.createElement("span", { className: "chip" }, /* @__PURE__ */ React.createElement("span", { className: "dot", style: { background: "var(--leaf)" } }), " Trusted by students worldwide"), /* @__PURE__ */ React.createElement("span", { className: "chip" }, "100% free"), /* @__PURE__ */ React.createElement("span", { className: "chip" }, "No signup")), /* @__PURE__ */ React.createElement("div", { className: "hero-tagline" }, "\u{1F30D} ", LP_TAGLINE), /* @__PURE__ */ React.createElement("h1", { className: "display" }, "Prep for your exam.", /* @__PURE__ */ React.createElement("br", null), "Land your ", /* @__PURE__ */ React.createElement("em", { style: { fontStyle: "italic", fontFamily: "var(--serif)", color: "var(--accent)" } }, "dream university"), " abroad."), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { maxWidth: 760, marginTop: 18, marginInline: "auto" } }, "1,000+ free mock tests for IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE & GMAT \u2014 plus a complete study-abroad toolkit: college predictor, scholarships, SOP, visa & more. All free, for students in every country."), /* @__PURE__ */ React.createElement("div", { className: "hero-cta" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary btn-lg", onClick: () => onNav("exam-prep") }, "Browse all mock tests \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-lg", onClick: () => {
    window.location.hash = "#/colleges/onboard";
    onNav("colleges");
  } }, "\u{1F680} Build my study-abroad plan"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-lg", onClick: () => window.LP_REFERRAL && window.LP_REFERRAL.invite(), title: "Share free prep with a friend" }, "\u{1F4F2} Invite a friend")), /* @__PURE__ */ React.createElement("div", { className: "hero-fine" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "dot" }), " No registration to start"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "dot" }), " 100% free, forever"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "dot" }), " Browser-based \u2014 works anywhere"))))), /* @__PURE__ */ React.createElement("section", { className: "section reveal", style: { paddingTop: 8, paddingBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "home-hero-photo" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=72",
      alt: "Graduates throwing their caps in celebration with a city skyline",
      loading: "lazy",
      onError: (e) => {
        const p = e.target.closest(".home-hero-photo");
        if (p) p.classList.add("no-photo");
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "hhp-overlay" }), /* @__PURE__ */ React.createElement("div", { className: "hhp-cap" }, "Join students worldwide preparing for their dream universities \u2014 100% free.")))), /* @__PURE__ */ React.createElement("section", { className: "section lp-stats-section reveal", style: { paddingTop: 24, paddingBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "lp-stats" }, [["7", "exams covered"], ["1,000+", "free mock tests"], ["99", "universities"], ["100%", "free, forever"], ["0", "signups to start"]].map(([n, l]) => /* @__PURE__ */ React.createElement("div", { className: "lp-stat", key: l }, /* @__PURE__ */ React.createElement("span", { className: "lp-stat-n" }, n), /* @__PURE__ */ React.createElement("span", { className: "lp-stat-l" }, l)))))), /* @__PURE__ */ React.createElement("section", { className: "section reveal", style: { paddingTop: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Why students choose LandingPrep"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Everything you need \u2014 from test prep to admission, ", /* @__PURE__ */ React.createElement("em", { style: { fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent)" } }, "100% free"), "."), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 660, marginTop: 10 } }, "One platform replaces a dozen paid tools and a coaching centre \u2014 practise the exam, then plan your university, scholarship and visa journey."))), /* @__PURE__ */ React.createElement("div", { className: "lp-pros reveal" }, [
    ["\u{1F4DD}", "1,000+ realistic mocks", "Real timings & patterns across all 7 exams with instant scoring.", "exam-prep"],
    ["\u{1F3A4}", "AI speaking practice", "Speak into your mic, get live transcripts, follow-ups & fluency scoring.", "agents"],
    ["\u270D\uFE0F", "AI band-score checker", "Paste an essay or record a Part 2 \u2014 instant IELTS band, TR/CC/LR/GRA breakdown & Band 9 model.", "writing-checker"],
    ["\u{1F3DB}\uFE0F", "College Predictor", "99 top universities with fees, requirements & Safe/Target/Reach matches.", "colleges"],
    ["\u{1F4B8}", "Scholarships & loans", "Country-based scholarship finder and a 10-lender education-loan compare.", "colleges"],
    ["\u{1F6C2}", "Visa, PR & immigration", "Visa types, settlement options and a step-by-step student\u2192PR roadmap.", "colleges"],
    ["\u{1F4C5}", "Personalised study plan", "A real week-by-week schedule built around your weakest sections.", "tools"],
    ["\u{1F4CA}", "Progress & analytics", "Track scores, streaks and skill splits across every exam \u2014 on any device.", "progress"]
  ].map(([icon, title, desc, nav]) => /* @__PURE__ */ React.createElement("button", { className: "lp-pro", key: title, onClick: () => onNav(nav) }, /* @__PURE__ */ React.createElement("span", { className: "lp-pro-ic", "aria-hidden": true }, icon), /* @__PURE__ */ React.createElement("span", { className: "lp-pro-t" }, title), /* @__PURE__ */ React.createElement("span", { className: "lp-pro-d" }, desc)))))), /* @__PURE__ */ React.createElement("section", { className: "section sa-band reveal", style: { paddingTop: 30 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "sa-band-inner" }, /* @__PURE__ */ React.createElement("div", { className: "sa-band-text" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "\u{1F30D} Study abroad \u2014 free"), /* @__PURE__ */ React.createElement("h2", { className: "h1", style: { margin: "6px 0 8px" } }, "Find your university, scholarships & visa path"), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 560 } }, "99 top universities across 9 countries with fees, requirements, scholarships, visa-success rates, immigration & PR pathways \u2014 plus a college predictor, SOP builder and loan comparison. All free."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("colleges") }, "\u{1F3DB}\uFE0F Open College Predictor \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
    window.location.hash = "#/colleges/apply";
    onNav("colleges");
  } }, "\u{1F393} Apply to 99+ universities"))), /* @__PURE__ */ React.createElement("div", { className: "sa-band-flags" }, [["\u{1F1FA}\u{1F1F8}", "USA"], ["\u{1F1EC}\u{1F1E7}", "UK"], ["\u{1F1E8}\u{1F1E6}", "Canada"], ["\u{1F1E6}\u{1F1FA}", "Australia"], ["\u{1F1E9}\u{1F1EA}", "Germany"], ["\u{1F1EE}\u{1F1EA}", "Ireland"], ["\u{1F1F3}\u{1F1FF}", "NZ"], ["\u{1F1F8}\u{1F1EC}", "Singapore"]].map(([f, n]) => /* @__PURE__ */ React.createElement("button", { key: n, className: "sa-flag", onClick: () => onNav("colleges"), title: "Study in " + n }, /* @__PURE__ */ React.createElement("span", null, f), n)))))), /* @__PURE__ */ React.createElement("section", { className: "section", style: { paddingTop: 28 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Choose your exam"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Seven exams. One unified prep platform."), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 640, marginTop: 10 } }, "Click any exam to open its complete prep hub \u2014 pattern, registration, fees, score guide, mock tests, tips, and FAQs."))), /* @__PURE__ */ React.createElement("ul", { className: "exam-list-simple reveal" }, exams.map((e) => /* @__PURE__ */ React.createElement("li", { key: e.id }, /* @__PURE__ */ React.createElement("a", { href: "#", onClick: (ev) => {
    ev.preventDefault();
    onGuide(e);
  } }, /* @__PURE__ */ React.createElement("span", { className: "el-dot", style: { background: e.colour } }), /* @__PURE__ */ React.createElement("span", { className: "el-name" }, e.name), /* @__PURE__ */ React.createElement("span", { className: "el-tag" }, e.tagline), /* @__PURE__ */ React.createElement("span", { className: "el-arrow" }, "\u2192"))))))), window.LP_GamifyCard ? /* @__PURE__ */ React.createElement("section", { className: "section", style: { paddingTop: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "shell", style: { maxWidth: 760 } }, /* @__PURE__ */ React.createElement(window.LP_GamifyCard, null))) : null, /* @__PURE__ */ React.createElement("section", { className: "section", style: { paddingTop: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow", style: { marginBottom: 12 } }, "Popular free tools"), /* @__PURE__ */ React.createElement("div", { className: "hp-tools-grid" }, [
    ["\u{1F3AF}", "AI Band Checker", "Instant IELTS Writing/Speaking band + Band 9 model", "writing-checker"],
    ["\u{1F4D6}", "Vocabulary by topic", "Band-9 words with audio for every IELTS topic", "vocabulary"],
    ["\u{1F4CA}", "Prep Lessons", "600+ PPT strategy slides for all 7 exams", "learn"],
    ["\u2708\uFE0F", "Move Abroad", "Pre-departure checklist, visa timeline & city guides", "relocate"]
  ].map(([ic, t, d, id]) => /* @__PURE__ */ React.createElement("button", { key: id, className: "hp-tool-card", onClick: () => onNav(id) }, /* @__PURE__ */ React.createElement("span", { className: "hp-tool-ic" }, ic), /* @__PURE__ */ React.createElement("span", { className: "hp-tool-t" }, t), /* @__PURE__ */ React.createElement("span", { className: "hp-tool-d" }, d)))))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "card-cta reveal" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Free Learning Club \xB7 200+ topics"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Topics, model answers,", /* @__PURE__ */ React.createElement("br", null), "and vocabulary you can actually use."), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { maxWidth: 640, marginTop: 8 } }, "30+ writing prompts and 30+ speaking topics per English exam. GRE issue tasks and GMAT data insight walk-throughs. Every answer at full word count, every word with usage examples."), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12", style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("learning") }, "Open Learning Club"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("agents") }, "Try AI Agents"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("blog") }, "Study tips & strategy"))))), /* @__PURE__ */ React.createElement("section", { className: "section", style: { background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "card-cta reveal" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Free tool \xB7 No signup"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Score & eligibility checker"), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { maxWidth: 640, marginTop: 8 } }, "Convert your score across IELTS, TOEFL, PTE, CELPIP & Duolingo, see your CEFR level, and find out which universities and visas you qualify for."), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12", style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("tools") }, "Open Score & Eligibility \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("colleges") }, "\u{1F9ED} Build my study-abroad plan"))))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Loved by test-takers worldwide"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Real results, zero cost."), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 640, marginTop: 10 } }, "Students across India, Canada, Australia, the US and beyond reach their target scores with LandingPrep \u2014 free."))), /* @__PURE__ */ React.createElement("div", { className: "testimonial-grid reveal" }, TESTIMONIALS.map((t, i) => /* @__PURE__ */ React.createElement("figure", { className: "testimonial-card", key: i }, /* @__PURE__ */ React.createElement("div", { className: "t-stars", "aria-label": t.stars + " stars" }, "\u2605\u2605\u2605\u2605\u2605".slice(0, t.stars)), /* @__PURE__ */ React.createElement("blockquote", null, t.text), /* @__PURE__ */ React.createElement("figcaption", null, /* @__PURE__ */ React.createElement("span", { className: "t-avatar", "aria-hidden": true }, t.name[0]), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "t-name" }, t.name), /* @__PURE__ */ React.createElement("span", { className: "t-meta" }, t.exam, " \xB7 ", t.place)))))))), /* @__PURE__ */ React.createElement("section", { className: "section faq-section", style: { background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Frequently asked questions"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Everything you need to know"), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 640, marginTop: 10 } }, "Free exam prep and study-abroad guidance for students worldwide \u2014 answered. Switch between exam and study-abroad questions below."))), /* @__PURE__ */ React.createElement("div", { className: "faq-tabs reveal" }, /* @__PURE__ */ React.createElement("button", { className: "faq-tab" + (faqTab === "exams" ? " active" : ""), onClick: () => setFaqTab("exams") }, "\u{1F4DD} Exam prep"), /* @__PURE__ */ React.createElement("button", { className: "faq-tab" + (faqTab === "abroad" ? " active" : ""), onClick: () => setFaqTab("abroad") }, "\u{1F30D} Study abroad")), /* @__PURE__ */ React.createElement("div", { className: "faq-list reveal", key: faqTab }, faqActive.map((f, i) => /* @__PURE__ */ React.createElement("details", { className: "faq-item", key: i }, /* @__PURE__ */ React.createElement("summary", null, f.q, /* @__PURE__ */ React.createElement("span", { className: "faq-toggle", "aria-hidden": true }, "+")), /* @__PURE__ */ React.createElement("div", { className: "faq-answer" }, f.a))), faqTab === "abroad" && /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginTop: 16 }, onClick: () => onNav("colleges") }, "See the full study-abroad FAQ \u2192")))), /* @__PURE__ */ React.createElement("section", { className: "section", style: { paddingTop: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "card-signup reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Optional \xB7 Free account"), /* @__PURE__ */ React.createElement("h2", { className: "h2", style: { marginTop: 4 } }, "Track your progress over time"), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { marginTop: 6, maxWidth: 540 } }, "Sign in to save your test history, track streaks, see skill splits across all exams, and continue where you left off \u2014 on any device.")), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary btn-lg", onClick: () => onNav("login") }, "Create free account")))), /* @__PURE__ */ React.createElement("section", { className: "section seo-content", style: { background: "var(--surface-2)", borderTop: "1px solid var(--line)", paddingTop: 18, paddingBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("details", { className: "seo-disclosure reveal" }, /* @__PURE__ */ React.createElement("summary", null, "Free IELTS, TOEFL, PTE, GRE & GMAT mock tests + a complete study-abroad toolkit"), /* @__PURE__ */ React.createElement("div", { className: "seo-content-inner" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "LandingPrep"), " is a 100% free platform that takes you from your first mock test all the way to your campus abroad. Practise ", /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/ielts", onClick: (e) => {
    e.preventDefault();
    onGuide(exams[0]);
  } }, "IELTS"), ", TOEFL iBT, PTE Academic, CELPIP, the Duolingo English Test, GRE and GMAT Focus with 1,000+ full-length ", /* @__PURE__ */ React.createElement("a", { href: "#/exam-prep", onClick: (e) => {
    e.preventDefault();
    onNav("exam-prep");
  } }, "mock tests"), " built on real exam timings and section-honest scoring \u2014 plus free AI speaking and writing practice with model answers. There is no signup, no credit card and no paywall."), /* @__PURE__ */ React.createElement("p", null, "Beyond test prep, LandingPrep is a full ", /* @__PURE__ */ React.createElement("a", { href: "#/colleges", onClick: (e) => {
    e.preventDefault();
    onNav("colleges");
  } }, "study-abroad"), " toolkit. Use the free ", /* @__PURE__ */ React.createElement("strong", null, "College Predictor"), " to find your Safe, Target and Reach universities across 99 top institutions in the USA, UK, Canada, Australia, Germany, Ireland, New Zealand, Singapore and the Netherlands. Compare universities and whole countries, find scholarships, build your ", /* @__PURE__ */ React.createElement("strong", null, "SOP, LOR and resume"), ", estimate cost and ROI, compare 10 education-loan lenders, practise your visa interview, and follow step-by-step immigration and PR roadmaps for every destination."), /* @__PURE__ */ React.createElement("p", null, "Whether you are searching for ", /* @__PURE__ */ React.createElement("em", null, "free IELTS practice tests"), ", the ", /* @__PURE__ */ React.createElement("em", null, "best universities for an MS in Computer Science in Canada"), ", the ", /* @__PURE__ */ React.createElement("em", null, "cost of studying in the UK"), ", ", /* @__PURE__ */ React.createElement("em", null, "study-abroad scholarships"), ", or ", /* @__PURE__ */ React.createElement("em", null, "which English test to take"), ", LandingPrep gives clear, free answers and the tools to act on them \u2014 for international students in every country. Start free on the ", /* @__PURE__ */ React.createElement("a", { href: "#/", onClick: (e) => {
    e.preventDefault();
    onNav("home");
  } }, "homepage"), ", or read our ", /* @__PURE__ */ React.createElement("a", { href: "#/blog", onClick: (e) => {
    e.preventDefault();
    onNav("blog");
  } }, "study & immigration blog"), ".")))))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
}
function TopBar({ current = "home", onNav }) {
  var _a, _b, _c;
  const [open, setOpen] = useStateH(false);
  const [settingsOpen, setSettingsOpen] = useStateH(false);
  const [ttsEnabled, setTtsEnabled] = useStateH(window.LP_TTS ? window.LP_TTS.isEnabled() : false);
  const [user, setUser] = useStateH(window.LP_AUTH ? window.LP_AUTH.getUser() : null);
  const [dark, setDark] = useStateH(document.documentElement.getAttribute("data-theme") === "dark");
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try {
      localStorage.setItem("lp_theme", next ? "dark" : "light");
    } catch (e) {
    }
  };
  const [canInstall, setCanInstall] = useStateH(!!window.__lpInstall);
  React.useEffect(() => {
    const on = () => setCanInstall(true);
    window.addEventListener("lp-installable", on);
    return () => window.removeEventListener("lp-installable", on);
  }, []);
  const installApp = async () => {
    const e = window.__lpInstall;
    if (!e) return;
    e.prompt();
    try {
      await e.userChoice;
    } catch (_) {
    }
    window.__lpInstall = null;
    setCanInstall(false);
  };
  React.useEffect(() => {
    if (!window.LP_AUTH) return;
    const off = window.LP_AUTH.subscribe((u) => setUser(u));
    return off;
  }, []);
  const closeSettings = () => {
    setSettingsOpen(false);
    setTtsEnabled(window.LP_TTS ? window.LP_TTS.isEnabled() : false);
  };
  const items = [
    ["home", "Home"],
    ["exam-prep", "Exams"],
    ["exams", "Exam Hub"],
    ["learn", "Learn"],
    ["colleges", "Study Abroad"],
    ["tools", "Tools"],
    ["languages", "Languages"],
    ["blog", "Blog"]
  ];
  const drawerItems = [
    ["home", "Home"],
    ["exam-prep", "Exams"],
    ["exams", "Exam Guides"],
    ["learn", "\u{1F4DA} Learn (Lessons + Club)"],
    ["writing-checker", "\u{1F3AF} AI Band-Score Checker"],
    ["vocabulary", "\u{1F4D6} Vocabulary"],
    ["achievements", "\u{1F3C6} Achievements & XP"],
    ["agents", "AI Speaking & Writing"],
    ["colleges", "Study Abroad"],
    ["relocate", "\u2708\uFE0F Move Abroad (checklist + visa)"],
    ["tools", "Tools"],
    ["languages", "Learn German & French"],
    ["blog", "Blog"],
    ["progress", "My Progress"]
  ];
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else onNav && onNav("home");
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("header", { className: "topbar" }, /* @__PURE__ */ React.createElement("div", { className: "shell topbar-inner" }, /* @__PURE__ */ React.createElement("div", { className: "topbar-left" }, /* @__PURE__ */ React.createElement("button", { className: "brand", onClick: () => onNav && onNav("home"), style: { background: "transparent" } }, /* @__PURE__ */ React.createElement(LPLogo, { size: 32 }), /* @__PURE__ */ React.createElement("span", { className: "brand-name" }, "LandingPrep"))), /* @__PURE__ */ React.createElement("nav", { className: "nav" }, items.map(([id, label]) => /* @__PURE__ */ React.createElement("a", { key: id, className: current === id ? "is-on" : "", onClick: (e) => {
    e.preventDefault();
    onNav && onNav(id);
  }, href: "#" }, label))), /* @__PURE__ */ React.createElement("div", { className: "topbar-actions" }, canInstall && /* @__PURE__ */ React.createElement("button", { className: "topbar-icon-btn", onClick: installApp, "aria-label": "Install app", title: "Install LandingPrep app" }, "\u2B07\uFE0F"), /* @__PURE__ */ React.createElement("button", { className: "topbar-icon-btn", onClick: toggleDark, "aria-label": "Toggle night study mode", title: dark ? "Switch to light mode" : "Night study (dark mode)" }, dark ? "\u2600\uFE0F" : "\u{1F319}"), user ? /* @__PURE__ */ React.createElement("button", { className: "topbar-profile", onClick: () => onNav && onNav("progress"), title: user.email }, /* @__PURE__ */ React.createElement("span", { className: "user-avatar", "aria-hidden": true }, ((_b = (_a = user.name) == null ? void 0 : _a[0]) == null ? void 0 : _b.toUpperCase()) || "U"), /* @__PURE__ */ React.createElement("span", { className: "tp-name" }, ((_c = user.name) == null ? void 0 : _c.split(" ")[0]) || "Account")) : /* @__PURE__ */ React.createElement("button", { className: "topbar-auth", onClick: () => onNav && onNav("login") }, "Log in / Sign up"), /* @__PURE__ */ React.createElement("button", { className: "menu-btn", "aria-label": "Menu", onClick: () => setOpen(true) }, /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("span", null))))), current !== "home" && /* @__PURE__ */ React.createElement("div", { className: "page-back" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("button", { className: "back-inline", onClick: goBack, "aria-label": "Go back to the previous page" }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": true }, "\u2190"), " Back"))), window.LP_TTS && /* @__PURE__ */ React.createElement(window.LP_TTS.SettingsModal, { open: settingsOpen, onClose: closeSettings }), open && /* @__PURE__ */ React.createElement("div", { className: "drawer is-open", onClick: () => setOpen(false) }, /* @__PURE__ */ React.createElement("aside", { className: "drawer-panel", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("button", { className: "drawer-close", onClick: () => setOpen(false) }, "\xD7"), drawerItems.map(([id, label]) => /* @__PURE__ */ React.createElement("a", { key: id, href: "#", onClick: (e) => {
    e.preventDefault();
    setOpen(false);
    onNav && onNav(id);
  } }, label)), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginTop: 16 }, onClick: toggleDark }, dark ? "\u2600\uFE0F Light mode" : "\u{1F319} Night study mode"), !user && /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", style: { marginTop: 10 }, onClick: () => {
    setOpen(false);
    onNav("login");
  } }, "Log in / Sign up"), user && /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginTop: 10 }, onClick: () => {
    if (window.LP_AUTH) window.LP_AUTH.signOut();
    setOpen(false);
  } }, "Sign out"))));
}
function Marquee() {
  const items = [
    "60 mocks per exam",
    "Real test-day timings",
    "Section-honest scoring",
    "Voice-native speaking",
    "Free Learning Club",
    "AI writing review",
    "IELTS \xB7 TOEFL \xB7 PTE \xB7 CELPIP \xB7 Duolingo \xB7 GRE \xB7 GMAT"
  ];
  const repeated = [...items, ...items];
  return /* @__PURE__ */ React.createElement("div", { className: "marquee" }, /* @__PURE__ */ React.createElement("div", { className: "marquee-track" }, repeated.map((t, i) => /* @__PURE__ */ React.createElement("span", { key: i }, t, /* @__PURE__ */ React.createElement("span", { className: "dot" })))));
}
function Footer() {
  return /* @__PURE__ */ React.createElement("footer", { className: "footer" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "footer-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "brand", style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement(LPLogo, { size: 30 }), /* @__PURE__ */ React.createElement("span", { className: "brand-name" }, "LandingPrep")), /* @__PURE__ */ React.createElement("div", { className: "footer-tagline" }, LP_TAGLINE), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 380, fontSize: 14, lineHeight: 1.6, marginTop: 10 } }, "Free exam prep + a complete study-abroad toolkit for students worldwide \u2014 IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE & GMAT mock tests, plus college predictor, scholarships, SOP & visa guidance."), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { fontSize: 13, marginTop: 12 } }, "\u{1F4E7} ", /* @__PURE__ */ React.createElement("a", { href: "mailto:support@landingprep.com", style: { color: "var(--accent)", fontWeight: 600 } }, "support@landingprep.com"), "  \xB7  ", /* @__PURE__ */ React.createElement("a", { href: "/about/", style: { color: "var(--accent)", fontWeight: 600 } }, "About"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", null, "Exam Hub"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/ielts" }, "IELTS")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/toefl" }, "TOEFL iBT")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/pte" }, "PTE Academic")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/celpip" }, "CELPIP")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/duolingo" }, "Duolingo")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/gre" }, "GRE")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/gmat" }, "GMAT Focus")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", null, "Practice"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-prep" }, "Mock tests")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/ielts-writing-checker/" }, "AI Band Checker")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/ielts-vocabulary/" }, "Vocabulary")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/prep-lessons/" }, "Prep Lessons")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/learning" }, "Learning Club")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/agents" }, "AI Speaking & Writing")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", null, "Resources"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/ielts-band-7/" }, "IELTS band requirements")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/which-english-test/" }, "Which English test? (quiz)")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/relocate" }, "Move Abroad checklist")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/student-city-guides/" }, "Student city guides")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/learn-german/" }, "Learn German & French")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/blog" }, "Study tips & strategy")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/explore/" }, "Explore all free pages")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/progress" }, "My Progress"))))), /* @__PURE__ */ React.createElement("div", { className: "colophon" }, /* @__PURE__ */ React.createElement("span", null, "\xA9 2026 LandingPrep. Independent prep platform \u2014 not affiliated with any test provider."), /* @__PURE__ */ React.createElement("span", null, "1,000+ free mock tests across 7 exams"))));
}
window.LP_Home = Home;
window.LP_TopBar = TopBar;
window.LP_Footer = Footer;
window.LP_Logo = LPLogo;
window.LP_TAGLINE = LP_TAGLINE;
window.LP_Marquee = Marquee;
