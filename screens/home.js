const { useState: useStateH } = React;
const LP_TAGLINE = "From mock test to campus abroad";
const LP_ICONS = {
  file: "M14 3v4a1 1 0 0 0 1 1h4 M9 13h6 M9 17h4 M5 3h9l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
  mic: "M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M19 10v1a7 7 0 0 1-14 0v-1 M12 18v4 M8 22h8",
  pen: "M12 20h9 M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z",
  building: "M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4 M9 9h0 M9 13h0 M9 17h0",
  wallet: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 10h18 M16 14h2",
  stamp: "M5 22h14 M6 18h12v-1a4 4 0 0 0-2-3.4 3 3 0 0 1-1.3-3.3l.3-1.3A3 3 0 0 0 12 4a3 3 0 0 0-3 6l.3 1.3A3 3 0 0 1 8 14.6 4 4 0 0 0 6 17z",
  calendar: "M8 2v4 M16 2v4 M3 8h18 M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  chart: "M3 3v18h18 M7 16v-5 M12 16V8 M17 16v-9",
  book: "M12 7v14 M3 18a2 2 0 0 1 2-2h7V4H5a2 2 0 0 0-2 2z M21 18a2 2 0 0 1-2-2h-7V4h7a2 2 0 0 0 2 2z",
  target: "M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0 M12 12m-5 0a5 5 0 1 0 10 0 5 5 0 1 0-10 0 M12 12h.01",
  plane: "M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9 1.7l5.1 3.5-2 2-2.5-.3a.8.8 0 0 0-.7 1.3L7 19l1.6 2.6a.8.8 0 0 0 1.3-.7l-.3-2.5 2-2 3.5 5.1a1 1 0 0 0 1.7-.9z",
  compare: "M16 3h5v5 M21 3l-7 7 M8 21H3v-5 M3 21l7-7 M21 16v5h-5 M16 21l5-5 M3 8V3h5 M3 3l5 5",
  refresh: "M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5",
  globe: "M12 12m-10 0a10 10 0 1 0 20 0 10 10 0 1 0-20 0 M2 12h20 M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z",
  money: "M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  bolt: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  spark: "M12 3v4 M12 17v4 M3 12h4 M17 12h4 M6 6l2.5 2.5 M15.5 15.5 18 18 M6 18l2.5-2.5 M15.5 8.5 18 6",
  check: "M20 6 9 17l-5-5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
  cap: "M22 10 12 5 2 10l10 5 10-5z M6 12v5c3 2 9 2 12 0v-5 M22 10v6",
  rocket: "M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2a2.1 2.1 0 1 0-3-3z M12 15l-3-3a16 16 0 0 1 6-9c4-1 7 2 6 6a16 16 0 0 1-9 6z M9 12H4s.5-3 2-4 5 0 5 0 M12 15v5s3-.5 4-2 0-5 0-5",
  clock: "M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0 M12 7v5l3 2",
  trophy: "M8 21h8 M12 17v4 M7 4h10v5a5 5 0 0 1-10 0z M7 4H5a2 2 0 0 0 0 4h2 M17 4h2a2 2 0 0 1 0 4h-2",
  chat: "M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-1L3 21l1.1-5A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0 M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8",
  help: "M12 12m-10 0a10 10 0 1 0 20 0 10 10 0 1 0-20 0 M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3 M12 17h.01",
  clipboard: "M9 4h6a1 1 0 0 0 1-1 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1 1 1 0 0 0 1 1z M9 3a1 1 0 0 0-2 0H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1",
  compass: "M12 12m-10 0a10 10 0 1 0 20 0 10 10 0 1 0-20 0 M16.2 7.8 14 14l-6.2 2.2L10 10z"
};
function Ic({ name, size = 22, style }) {
  const d = LP_ICONS[name] || LP_ICONS.spark;
  return /* @__PURE__ */ React.createElement(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.75",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": "true",
      style
    },
    d.split(" M").map((seg, i) => /* @__PURE__ */ React.createElement("path", { key: i, d: (i ? "M" : "") + seg }))
  );
}
function IcChip({ name, tone = "accent" }) {
  return /* @__PURE__ */ React.createElement("span", { className: "pro-icchip pro-tone-" + tone, "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Ic, { name, size: 22 }));
}
try {
  window.LP_Ic = Ic;
  window.LP_IcChip = IcChip;
  window.LP_ICONS = LP_ICONS;
} catch (e) {
}
const LP_PRO_CSS = `
.home-pro{ --pro-grad: linear-gradient(135deg, var(--accent), var(--accent-2)); }

/* \u2500\u2500 Hero \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.home-pro .hero{ position:relative; overflow:hidden; isolation:isolate;
  background:
    radial-gradient(60% 80% at 12% 8%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 60%),
    radial-gradient(55% 75% at 92% 18%, color-mix(in srgb, var(--accent-2) 18%, transparent), transparent 62%),
    radial-gradient(45% 60% at 50% 110%, color-mix(in srgb, var(--leaf) 12%, transparent), transparent 60%); }
.home-pro .hero::after{ content:""; position:absolute; inset:0; z-index:-1; pointer-events:none;
  background-image: radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--ink) 9%, transparent) 1px, transparent 0);
  background-size: 26px 26px; -webkit-mask-image: radial-gradient(70% 60% at 50% 30%, #000 0%, transparent 75%);
          mask-image: radial-gradient(70% 60% at 50% 30%, #000 0%, transparent 75%); opacity:.5; }
.home-pro .hero-meta .chip{ backdrop-filter:saturate(1.4) blur(6px); background:color-mix(in srgb, var(--surface) 70%, transparent);
  border:1px solid var(--line); font-weight:600; }
.home-pro .hero-tagline{ display:inline-flex; align-items:center; gap:7px; padding:6px 14px; border-radius:999px;
  background:color-mix(in srgb, var(--accent) 10%, transparent); color:var(--accent); font-weight:700;
  border:1px solid color-mix(in srgb, var(--accent) 22%, transparent); }
.home-pro .display{ letter-spacing:-.035em; line-height:1.02; }
.home-pro .display .grad{ background:var(--pro-grad); -webkit-background-clip:text; background-clip:text; color:transparent;
  font-family:var(--serif); font-style:italic; }
.home-pro .hero-cta{ gap:12px; }

/* \u2500\u2500 Buttons \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.home-pro .btn{ border-radius:13px; font-weight:650; transition:transform .14s ease, box-shadow .2s ease, background .2s ease, border-color .2s; }
.home-pro .btn:active{ transform:scale(.975); }
.home-pro .btn-primary{ background:var(--pro-grad); border:none; color:#fff;
  box-shadow:0 8px 22px -8px color-mix(in srgb, var(--accent) 70%, transparent); }
.home-pro .btn-primary:hover{ box-shadow:0 12px 30px -8px color-mix(in srgb, var(--accent) 80%, transparent); transform:translateY(-1px); }
.home-pro .btn-lg{ padding:14px 22px; font-size:16px; }

/* \u2500\u2500 Icon chips \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.home-pro .pro-icchip{ width:46px; height:46px; border-radius:14px; display:inline-grid; place-items:center; flex:0 0 auto;
  background:linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, transparent), color-mix(in srgb, var(--accent-2) 16%, transparent));
  color:var(--accent); border:1px solid color-mix(in srgb, var(--accent) 18%, transparent); transition:transform .18s ease; }
.home-pro .pro-tone-green{ color:var(--leaf); background:linear-gradient(135deg, color-mix(in srgb, var(--leaf) 16%, transparent), color-mix(in srgb, var(--leaf) 6%, transparent)); border-color:color-mix(in srgb, var(--leaf) 20%, transparent); }
.home-pro .pro-tone-sky{ color:#0ea5e9; background:linear-gradient(135deg, rgba(14,165,233,.16), rgba(14,165,233,.06)); border-color:rgba(14,165,233,.22); }
.home-pro .pro-tone-amber{ color:#f59e0b; background:linear-gradient(135deg, rgba(245,158,11,.18), rgba(245,158,11,.06)); border-color:rgba(245,158,11,.24); }
.home-pro .pro-tone-pink{ color:#ec4899; background:linear-gradient(135deg, rgba(236,72,153,.16), rgba(236,72,153,.06)); border-color:rgba(236,72,153,.22); }

/* \u2500\u2500 Feature cards (bento lift) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.home-pro .lp-pro, .home-pro .hp-tool-card{ border-radius:18px; border:1px solid var(--line); background:var(--surface);
  transition:transform .18s ease, box-shadow .22s ease, border-color .2s ease; }
.home-pro .lp-pro:hover, .home-pro .hp-tool-card:hover{ transform:translateY(-4px);
  border-color:color-mix(in srgb, var(--accent) 40%, var(--line));
  box-shadow:0 18px 38px -20px color-mix(in srgb, var(--accent) 60%, transparent); }
.home-pro .lp-pro:hover .pro-icchip, .home-pro .hp-tool-card:hover .pro-icchip{ transform:scale(1.08) rotate(-3deg); }
.home-pro .lp-pro-ic{ margin-bottom:6px; }

/* \u2500\u2500 Stats \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.home-pro .lp-stat-n{ font-weight:800; letter-spacing:-.02em; }
.home-pro .lp-stats{ gap:14px; }

/* \u2500\u2500 Eyebrows \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.home-pro .eyebrow{ display:inline-flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:.08em;
  font-size:12px; font-weight:750; color:var(--accent); }
.home-pro .eyebrow::before{ content:""; width:18px; height:2px; border-radius:2px; background:var(--pro-grad); }

/* \u2500\u2500 Section headings get a touch more air \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.home-pro .h1{ letter-spacing:-.025em; }

/* \u2500\u2500 Reduced motion \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
@media (prefers-reduced-motion: reduce){
  .home-pro .btn, .home-pro .lp-pro, .home-pro .hp-tool-card, .home-pro .pro-icchip{ transition:none !important; }
  .home-pro .lp-pro:hover, .home-pro .hp-tool-card:hover, .home-pro .btn-primary:hover{ transform:none !important; }
}
`;
function LPProStyles() {
  return /* @__PURE__ */ React.createElement("style", null, LP_PRO_CSS);
}
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
    a: "Yes. Our Speaking Practice uses natural neural voices \u2014 you speak into your mic, get live transcripts and follow-up questions, just like a real examiner. Listening sections and Describe Image / Re-tell Lecture tasks also play real audio."
  },
  {
    q: "Do I get model answers and band-level feedback for writing?",
    a: "Every writing task \u2014 IELTS Task 1 & 2, TOEFL integrated and discussion, PTE essay, GRE issue, GMAT and CELPIP \u2014 includes a free Band 7+/CEFR C1 model answer plus live word-count and rubric guidance. Our Writing Feedback gives instant structured feedback on any essay you paste."
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
function Reviews() {
  const [reviews, setReviews] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ stars: 5, exam: "", name: "", place: "", text: "" });
  const [status, setStatus] = React.useState("");
  React.useEffect(() => {
    const base = window.LP_API_BASE || "";
    fetch(base + "/api/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews || [])).catch(() => {
    });
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    if (String(form.text).trim().length < 10) {
      setStatus("err");
      return;
    }
    setStatus("sending");
    try {
      const base = window.LP_API_BASE || "";
      const r = await fetch(base + "/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (r.ok && d.review) {
        setReviews([d.review, ...reviews]);
        setStatus("ok");
        setOpen(false);
        setForm({ stars: 5, exam: "", name: "", place: "", text: "" });
        try {
          if (window.gtag) window.gtag("event", "review_submitted");
        } catch (e2) {
        }
      } else {
        setStatus("err");
      }
    } catch (e2) {
      setStatus("err");
    }
  };
  const inputStyle = { padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 14, background: "var(--surface)", color: "var(--ink)", width: "100%" };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "testimonial-grid reveal" }, reviews.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "trust-block reveal", style: { textAlign: "center", padding: "8px 0 4px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 16 } }, [["\u{1F4AF}", "100% free"], ["\u{1F6AB}", "No signup to start"], ["\u{1F4B3}", "No card needed"], ["\u{1F4DA}", "15+ exams"], ["\u{1F30D}", "9 study destinations"], ["\u26A1", "Instant scoring"]].map(([ic, t]) => /* @__PURE__ */ React.createElement("span", { key: t, style: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "9px 15px", fontWeight: 600, fontSize: 14, boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,.05))" } }, ic, " ", t))), /* @__PURE__ */ React.createElement("p", { style: { maxWidth: 580, margin: "0 auto", color: "var(--ink-2)", fontSize: 16, lineHeight: 1.65 } }, "Built by people who ", /* @__PURE__ */ React.createElement("strong", null, "studied abroad themselves"), " \u2014 we know the journey, so every tool is genuinely free with no catch. ", /* @__PURE__ */ React.createElement("strong", null, "Be the first to share your story"), " and help the next student decide.")) : reviews.map((t, i) => /* @__PURE__ */ React.createElement("figure", { className: "testimonial-card", key: i }, /* @__PURE__ */ React.createElement("div", { className: "t-stars", "aria-label": t.stars + " stars" }, "\u2605\u2605\u2605\u2605\u2605".slice(0, t.stars)), /* @__PURE__ */ React.createElement("blockquote", null, t.text), /* @__PURE__ */ React.createElement("figcaption", null, /* @__PURE__ */ React.createElement("span", { className: "t-avatar", "aria-hidden": true }, (t.name || "?")[0]), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "t-name" }, t.name), /* @__PURE__ */ React.createElement("span", { className: "t-meta" }, [t.exam, t.place].filter(Boolean).join(" \xB7 "))))))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 18 } }, !open && /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => setOpen(true) }, "\u270D\uFE0F Share your experience"), status === "ok" && /* @__PURE__ */ React.createElement("p", { style: { color: "var(--leaf)", marginTop: 10, fontWeight: 600 } }, "Thank you \u2014 your review is live! \u{1F389}")), open && /* @__PURE__ */ React.createElement("form", { onSubmit: submit, style: { maxWidth: 560, margin: "16px auto 0", display: "grid", gap: 10, textAlign: "left" } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 13, fontWeight: 600 } }, "Your rating", /* @__PURE__ */ React.createElement("select", { value: form.stars, onChange: (e) => setForm({ ...form, stars: parseInt(e.target.value, 10) }), style: { ...inputStyle, marginTop: 4 } }, [5, 4, 3, 2, 1].map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, "\u2605".repeat(s), " (", s, ")")))), /* @__PURE__ */ React.createElement("textarea", { placeholder: "How did LandingPrep help you? (at least 10 characters)", value: form.text, onChange: (e) => setForm({ ...form, text: e.target.value }), rows: 3, required: true, style: inputStyle }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("input", { placeholder: "Exam (e.g. IELTS)", value: form.exam, onChange: (e) => setForm({ ...form, exam: e.target.value }), style: { ...inputStyle, flex: "1 1 120px" } }), /* @__PURE__ */ React.createElement("input", { placeholder: "Name (optional)", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), style: { ...inputStyle, flex: "1 1 120px" } }), /* @__PURE__ */ React.createElement("input", { placeholder: "Place (optional)", value: form.place, onChange: (e) => setForm({ ...form, place: e.target.value }), style: { ...inputStyle, flex: "1 1 120px" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary" }, status === "sending" ? "Posting\u2026" : "Post review"), /* @__PURE__ */ React.createElement("button", { type: "button", className: "btn", onClick: () => setOpen(false) }, "Cancel")), status === "err" && /* @__PURE__ */ React.createElement("span", { style: { color: "#dc2626", fontSize: 13 } }, "Please pick a rating and write at least 10 characters.")));
}
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
function QuickScoreCheck({ onNav }) {
  const [exam, setExam] = React.useState("ielts");
  const [score, setScore] = React.useState("");
  const meta = PREDICTOR_EXAMS.find((e) => e.id === exam) || PREDICTOR_EXAMS[0];
  const lvl = score !== "" ? scoreToCEFR(exam, score) : null;
  const row = lvl ? CEFR_TABLE[lvl] : null;
  const fieldStyle = { padding: "11px 13px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15, background: "var(--surface-2)", color: "var(--ink)" };
  return /* @__PURE__ */ React.createElement("section", { className: "section reveal", style: { paddingTop: 18, paddingBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: "22px 24px", boxShadow: "var(--shadow, 0 10px 28px -16px rgba(16,24,40,.18))" } }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "\u26A1 20-second check \xB7 no signup"), /* @__PURE__ */ React.createElement("h3", { className: "h2", style: { margin: "4px 0 14px" } }, "Already have a score? See what you qualify for \u2014 instantly."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement("select", { value: exam, onChange: (e) => {
    setExam(e.target.value);
    setScore("");
  }, style: fieldStyle, "aria-label": "Exam" }, PREDICTOR_EXAMS.map((e) => /* @__PURE__ */ React.createElement("option", { key: e.id, value: e.id }, e.name))), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      inputMode: "decimal",
      step: meta.step,
      min: meta.min,
      max: meta.max,
      placeholder: meta.ph,
      value: score,
      onChange: (e) => setScore(e.target.value),
      style: { ...fieldStyle, width: 140 },
      "aria-label": "Your score"
    }
  ), !row && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-3)", fontSize: 14 } }, "\u2190 enter your ", meta.name, " score")), row && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 16, color: "var(--accent)" } }, row.label), /* @__PURE__ */ React.createElement("p", { style: { margin: "6px 0 12px", color: "var(--ink-2)", fontSize: 15, lineHeight: 1.6 } }, row.elig), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("tools") }, "See full eligibility + universities \u2192")))));
}
function LatestGuides() {
  const [posts, setPosts] = React.useState([]);
  React.useEffect(() => {
    fetch("/blog-index.json").then((r) => r.json()).then((d) => setPosts((Array.isArray(d) ? d : []).slice(0, 3))).catch(() => {
    });
  }, []);
  if (!posts.length) return null;
  return /* @__PURE__ */ React.createElement("section", { className: "section reveal", style: { paddingTop: 22 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "\u{1F4F0} Fresh study-abroad guides"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Latest from the blog"))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginTop: 14 } }, posts.map((p) => /* @__PURE__ */ React.createElement("a", { key: p.id, href: "/blog/" + p.id + "/", style: { display: "block", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 20px", textDecoration: "none", color: "inherit", boxShadow: "var(--shadow-sm,0 1px 2px rgba(0,0,0,.05))" } }, p.tag && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--accent)" } }, p.tag), /* @__PURE__ */ React.createElement("h3", { style: { margin: "6px 0 8px", fontSize: 17, lineHeight: 1.3 } }, p.title), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 14, color: "var(--ink-3)", lineHeight: 1.55 } }, p.excerpt, "\u2026"), /* @__PURE__ */ React.createElement("span", { style: { display: "inline-block", marginTop: 10, color: "var(--accent)", fontWeight: 600, fontSize: 14 } }, "Read guide \u2192")))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginTop: 16 } }, /* @__PURE__ */ React.createElement("a", { href: "/blog/", style: { color: "var(--accent)", fontWeight: 600 } }, "See all guides \u2192"))));
}
function GoalOnboarding({ onNav }) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    try {
      if (!localStorage.getItem("lp_onboarded")) {
        const t = setTimeout(() => setShow(true), 1400);
        return () => clearTimeout(t);
      }
    } catch (e) {
    }
  }, []);
  if (!show) return null;
  const done = (goal, nav) => {
    try {
      localStorage.setItem("lp_onboarded", goal || "skip");
    } catch (e) {
    }
    setShow(false);
    if (nav) onNav(nav);
  };
  const opts = [
    ["\u{1F393}", "Study abroad", "Universities, scholarships & visa", "colleges"],
    ["\u{1F4DD}", "Crack an exam", "IELTS, TOEFL, OET, PTE, GRE & more", "exam-prep"],
    ["\u{1F30D}", "Check my English level", "Score \u2192 CEFR \u2192 what I qualify for", "tools"]
  ];
  return /* @__PURE__ */ React.createElement("div", { onClick: () => done("skip"), style: { position: "fixed", inset: 0, background: "rgba(8,12,30,0.62)", backdropFilter: "blur(3px)", zIndex: 9999, display: "grid", placeItems: "center", padding: 20 } }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "26px 24px", maxWidth: 460, width: "100%", boxShadow: "0 30px 70px -20px rgba(0,0,0,.55)" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12.5, fontWeight: 800, color: "var(--accent)", letterSpacing: ".06em" } }, "\u{1F44B} WELCOME \u2014 TAKES 5 SECONDS"), /* @__PURE__ */ React.createElement("h2", { style: { margin: "6px 0 4px", fontSize: 24, letterSpacing: "-.02em" } }, "What brings you here?"), /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 16px", color: "var(--ink-3, #667085)", fontSize: 14 } }, "We'll take you straight to the right place. Everything's free \u2014 no signup."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10 } }, opts.map(([ic, t, d, nav]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: t,
      onClick: () => done(t, nav),
      style: { display: "flex", gap: 14, alignItems: "center", textAlign: "left", padding: "14px 16px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface-2)", cursor: "pointer", transition: "border-color .15s, transform .15s" },
      onMouseEnter: (e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.transform = "translateY(-2px)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.transform = "none";
      }
    },
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 26, lineHeight: 1 } }, ic),
    /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { style: { display: "block", fontWeight: 700, fontSize: 16 } }, t), /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--ink-3, #667085)" } }, d)),
    /* @__PURE__ */ React.createElement("span", { style: { marginLeft: "auto", color: "var(--accent)", fontSize: 18 } }, "\u2192")
  ))), /* @__PURE__ */ React.createElement("button", { onClick: () => done("skip"), style: { display: "block", margin: "14px auto 0", background: "none", border: "none", color: "var(--ink-3, #667085)", fontSize: 14, cursor: "pointer", textDecoration: "underline" } }, "Just exploring \u2014 skip")));
}
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
function ReturningBar({ onNav }) {
  const [s, setS] = React.useState(null);
  React.useEffect(() => {
    try {
      const g = window.LP_Gamify && window.LP_Gamify.stats ? window.LP_Gamify.stats() : null;
      if (g && (g.tests > 0 || g.activeDays > 0)) setS(g);
    } catch (e) {
    }
  }, []);
  if (!s) return null;
  return /* @__PURE__ */ React.createElement("div", { className: "returning-bar reveal", role: "region", "aria-label": "Your progress" }, /* @__PURE__ */ React.createElement("span", { className: "rb-item" }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 18 } }, s.streak > 0 ? "\u{1F525}" : "\u2728"), " ", /* @__PURE__ */ React.createElement("b", null, s.streak, "-day"), " streak"), /* @__PURE__ */ React.createElement("span", { className: "rb-item" }, s.levelEmoji, " Lvl ", s.level, " \xB7 ", s.xp, " XP"), /* @__PURE__ */ React.createElement("span", { className: "rb-item rb-quest" }, s.studiedToday ? "\u2705 Today's goal done \u2014 streak safe" : "\u{1F3AF} Practise once today to keep your streak"), /* @__PURE__ */ React.createElement("button", { className: "rb-cta", onClick: () => onNav("exam-prep") }, "Continue practising \u2192"));
}
function Home({ onGuide, onPractice, onNav }) {
  const exams = window.LP_DATA.EXAMS;
  const [faqTab, setFaqTab] = useStateH("exams");
  const [examFilter, setExamFilter] = useStateH("all");
  const POPULAR_EXAMS = ["ielts", "toefl", "pte", "duolingo"];
  const examMatchesFilter = (e, f) => {
    if (f === "all") return true;
    const s = ((e.tagline || "") + " " + (e.for || "") + " " + (e.blurb || "")).toLowerCase();
    const isWork = /\bpr\b|immigration|migration|citizenship|express entry/.test(s);
    if (f === "work") return isWork || /\bwork\b/.test(s);
    return !isWork || /study|admission|universit|mba|graduate|college|academic|school/.test(s);
  };
  React.useEffect(() => {
    if (!window.LP_SEO) return;
    window.LP_SEO.set({
      title: "Free IELTS, TOEFL, OET, PTE, GRE & GMAT Mock Tests | LandingPrep",
      description: "1,000+ free practice tests across 15+ exams \u2014 IELTS, TOEFL, OET, PTE, GRE, GMAT, SAT & more. Real exam patterns, instant scoring & AI band feedback \u2014 no signup."
    });
  }, []);
  const faqActive = faqTab === "abroad" ? STUDY_FAQS : FAQS;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(LPProStyles, null), /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "home", onNav }), /* @__PURE__ */ React.createElement(window.LP_Marquee, null), /* @__PURE__ */ React.createElement(GoalOnboarding, { onNav }), /* @__PURE__ */ React.createElement("main", { id: "main-content", className: "home-pro" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement(ReturningBar, { onNav })), /* @__PURE__ */ React.createElement("section", { className: "hero" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "hero-inner-clean" }, /* @__PURE__ */ React.createElement("div", { className: "hero-meta" }, /* @__PURE__ */ React.createElement("span", { className: "chip" }, /* @__PURE__ */ React.createElement("span", { className: "dot", style: { background: "var(--leaf)" } }), " Trusted by students worldwide"), /* @__PURE__ */ React.createElement("span", { className: "chip" }, "100% free"), /* @__PURE__ */ React.createElement("span", { className: "chip" }, "No signup")), /* @__PURE__ */ React.createElement("div", { className: "hero-tagline" }, /* @__PURE__ */ React.createElement(Ic, { name: "globe", size: 15 }), " ", LP_TAGLINE), /* @__PURE__ */ React.createElement("h1", { className: "display" }, "Prep for your exam.", /* @__PURE__ */ React.createElement("br", null), "Land your ", /* @__PURE__ */ React.createElement("em", { className: "grad" }, "dream university"), " abroad."), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { maxWidth: 760, marginTop: 18, marginInline: "auto" } }, "1,000+ free mock tests across 15+ exams \u2014 IELTS, TOEFL, OET, PTE, GRE, GMAT, SAT & more \u2014 plus a complete study-abroad toolkit: college predictor, scholarships, SOP & visa guidance. All free, for students in every country."), /* @__PURE__ */ React.createElement("div", { className: "hero-cta" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary btn-lg", onClick: () => onNav("exam-prep") }, "Browse all mock tests \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-lg", onClick: () => {
    window.location.hash = "#/colleges/onboard";
    onNav("colleges");
  } }, /* @__PURE__ */ React.createElement(Ic, { name: "rocket", size: 17, style: { marginRight: 7, verticalAlign: "-3px" } }), "Build my study-abroad plan"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-lg", onClick: () => window.LP_REFERRAL && window.LP_REFERRAL.invite(), title: "Share free prep with a friend" }, "Invite a friend")), /* @__PURE__ */ React.createElement("div", { className: "hero-fine" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "dot" }), " No registration to start"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "dot" }), " 100% free, forever"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "dot" }), " Browser-based \u2014 works anywhere"))))), /* @__PURE__ */ React.createElement("section", { className: "section reveal", style: { paddingTop: 8, paddingBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "home-hero-photo" }, /* @__PURE__ */ React.createElement(
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
  ), /* @__PURE__ */ React.createElement("div", { className: "hhp-overlay" }), /* @__PURE__ */ React.createElement("div", { className: "hhp-cap" }, "Join students worldwide preparing for their dream universities \u2014 100% free.")))), /* @__PURE__ */ React.createElement("section", { className: "section lp-stats-section reveal", style: { paddingTop: 24, paddingBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "lp-stats" }, [[exams.length + "+", "exams covered", "var(--accent)"], ["1,000+", "free mock tests", "#16a34a"], ["99", "universities", "#0ea5e9"], ["100%", "free, forever", "#f59e0b"], ["9", "study destinations", "#ec4899"]].map(([n, l, c]) => /* @__PURE__ */ React.createElement("div", { className: "lp-stat", key: l }, /* @__PURE__ */ React.createElement("span", { className: "lp-stat-n", style: { color: c } }, n), /* @__PURE__ */ React.createElement("span", { className: "lp-stat-l" }, l)))))), /* @__PURE__ */ React.createElement(QuickScoreCheck, { onNav }), /* @__PURE__ */ React.createElement("section", { className: "section reveal", style: { paddingTop: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Why students choose LandingPrep"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Everything you need \u2014 from test prep to admission, ", /* @__PURE__ */ React.createElement("em", { style: { fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent)" } }, "100% free"), "."), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 660, marginTop: 10 } }, "One platform replaces a dozen paid tools and a coaching centre \u2014 practise the exam, then plan your university, scholarship and visa journey."))), /* @__PURE__ */ React.createElement("div", { className: "lp-pros reveal" }, [
    ["file", "accent", "1,000+ realistic mocks", "Real timings & patterns across all 15+ exams with instant scoring.", "exam-prep"],
    ["mic", "pink", "Speaking practice", "Speak into your mic, get live transcripts, follow-ups & fluency scoring.", "agents"],
    ["pen", "sky", "AI band-score checker", "Paste an essay or record a Part 2 \u2014 instant IELTS band, TR/CC/LR/GRA breakdown & Band 9 model.", "writing-checker"],
    ["building", "accent", "College Predictor", "99 top universities with fees, requirements & Safe/Target/Reach matches.", "colleges"],
    ["wallet", "green", "Scholarships & loans", "Country-based scholarship finder and a 10-lender education-loan compare.", "colleges"],
    ["stamp", "amber", "Visa, PR & immigration", "Visa types, settlement options and a step-by-step student\u2192PR roadmap.", "colleges"],
    ["calendar", "sky", "Personalised study plan", "A real week-by-week schedule built around your weakest sections.", "tools"],
    ["chart", "green", "Progress & analytics", "Track scores, streaks and skill splits across every exam \u2014 on any device.", "progress"]
  ].map(([icon, tone, title, desc, nav]) => /* @__PURE__ */ React.createElement("button", { className: "lp-pro", key: title, onClick: () => onNav(nav) }, /* @__PURE__ */ React.createElement("span", { className: "lp-pro-ic" }, /* @__PURE__ */ React.createElement(IcChip, { name: icon, tone })), /* @__PURE__ */ React.createElement("span", { className: "lp-pro-t" }, title), /* @__PURE__ */ React.createElement("span", { className: "lp-pro-d" }, desc)))))), /* @__PURE__ */ React.createElement("section", { className: "section sa-band reveal", style: { paddingTop: 30 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "sa-band-inner" }, /* @__PURE__ */ React.createElement("div", { className: "sa-band-text" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "\u{1F30D} Study abroad \u2014 free"), /* @__PURE__ */ React.createElement("h2", { className: "h1", style: { margin: "6px 0 8px" } }, "Find your university, scholarships & visa path"), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 560 } }, "99 top universities across 9 countries with fees, requirements, scholarships, visa-success rates, immigration & PR pathways \u2014 plus a college predictor, SOP builder and loan comparison. All free."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("colleges") }, "\u{1F3DB}\uFE0F Open College Predictor \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
    window.location.hash = "#/colleges/apply";
    onNav("colleges");
  } }, "\u{1F393} Apply to 99+ universities"))), /* @__PURE__ */ React.createElement("div", { className: "sa-band-flags" }, [["\u{1F1FA}\u{1F1F8}", "USA"], ["\u{1F1EC}\u{1F1E7}", "UK"], ["\u{1F1E8}\u{1F1E6}", "Canada"], ["\u{1F1E6}\u{1F1FA}", "Australia"], ["\u{1F1E9}\u{1F1EA}", "Germany"], ["\u{1F1EE}\u{1F1EA}", "Ireland"], ["\u{1F1F3}\u{1F1FF}", "NZ"], ["\u{1F1F8}\u{1F1EC}", "Singapore"]].map(([f, n]) => /* @__PURE__ */ React.createElement("button", { key: n, className: "sa-flag", onClick: () => onNav("colleges"), title: "Study in " + n }, /* @__PURE__ */ React.createElement("span", null, f), n)))))), /* @__PURE__ */ React.createElement("section", { className: "section", style: { paddingTop: 28 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Choose your exam"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Every major exam. One free platform."), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 640, marginTop: 10 } }, "Click any exam to open its complete prep hub \u2014 pattern, registration, fees, score guide, mock tests, tips, and FAQs."))), /* @__PURE__ */ React.createElement("div", { className: "exam-filter reveal", style: { display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 16px" } }, [["all", "All exams"], ["study", "\u{1F393} Study & admissions"], ["work", "\u{1F6C2} Work & PR"]].map(([f, label]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f,
      onClick: () => setExamFilter(f),
      style: {
        padding: "8px 16px",
        borderRadius: 999,
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        border: "1px solid " + (examFilter === f ? "var(--accent)" : "var(--line)"),
        background: examFilter === f ? "var(--accent)" : "var(--surface)",
        color: examFilter === f ? "#fff" : "var(--ink)"
      }
    },
    label
  ))), /* @__PURE__ */ React.createElement("ul", { className: "exam-list-simple reveal" }, exams.filter((e) => examMatchesFilter(e, examFilter)).map((e) => {
    const isNew = e.id === "oet";
    const isPopular = POPULAR_EXAMS.includes(e.id);
    return /* @__PURE__ */ React.createElement("li", { key: e.id }, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: "#",
        onClick: (ev) => {
          ev.preventDefault();
          onGuide(e);
        },
        style: { borderLeft: "3px solid " + e.colour }
      },
      /* @__PURE__ */ React.createElement("span", { className: "el-dot", style: { background: e.colour, boxShadow: "0 0 0 4px " + e.colour + "26" } }),
      /* @__PURE__ */ React.createElement("span", { className: "el-name" }, e.name),
      isNew && /* @__PURE__ */ React.createElement("span", { className: "el-new" }, "NEW"),
      !isNew && isPopular && /* @__PURE__ */ React.createElement("span", { className: "el-new", style: { background: "linear-gradient(135deg,#f59e0b,#ef4444)", boxShadow: "0 2px 8px -2px rgba(239,68,68,.5)" } }, "POPULAR"),
      /* @__PURE__ */ React.createElement("span", { className: "el-tag" }, e.tagline),
      /* @__PURE__ */ React.createElement("span", { className: "el-arrow", style: { color: e.colour } }, "\u2192")
    ));
  })))), /* @__PURE__ */ React.createElement("section", { className: "section", style: { paddingTop: 28 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Compare, convert & plan \u2014 free"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Pick the right test, hit the right score."), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 660, marginTop: 10 } }, "Free, in-depth guides to help you choose between exams, convert your score across every test, and find the exact score \u2014 and scholarships \u2014 your country and university want."))), /* @__PURE__ */ React.createElement("div", { className: "hp-tools-grid reveal" }, [
    ["compare", "accent", "Compare the tests", "IELTS vs PTE, IELTS vs TOEFL, GRE vs GMAT \u2014 side by side, with which to take.", "/english-test-comparisons/"],
    ["refresh", "sky", "Score converter", "Convert IELTS \u2194 TOEFL \u2194 PTE \u2194 CEFR \u2194 Duolingo with a full concordance table.", "/tools/english-test-score-converter/"],
    ["globe", "accent", "Score needed by country", "The exact English-test & admission score each country and university expects.", "/eligibility/"],
    ["wallet", "green", "Scholarships by country", "Fully-funded and merit awards with eligibility, amounts and deadlines.", "/fully-funded-scholarships/"],
    ["stamp", "amber", "Test scores for PR & visa", "IELTS, PTE & CELPIP scores for Canada, Australia & UK immigration.", "/ielts-for-canada-pr/"],
    ["money", "green", "Cost of studying abroad", "Add up tuition, living, visa & flights with the free cost calculator.", "/tools/cost-of-studying-abroad-calculator/"],
    ["stamp", "amber", "Visa interview questions", "Real F-1, UK, Canada & Australia student-visa questions, answered.", "/visa-interview/"],
    ["pen", "pink", "SOP & LOR samples", "Complete statement-of-purpose & recommendation samples to adapt.", "/sop-samples/"],
    ["calendar", "sky", "Intakes & deadlines", "When to apply \u2014 intake seasons & deadlines for every country.", "/intakes/"],
    ["target", "accent", "IELTS band calculator", "Turn your raw Listening & Reading answers into the official 0\u20139 band.", "/tools/ielts-band-score-calculator/"]
  ].map(([ic, tone, t, d, href]) => /* @__PURE__ */ React.createElement("a", { key: href + t, className: "hp-tool-card", href, style: { textDecoration: "none" } }, /* @__PURE__ */ React.createElement("span", { className: "hp-tool-ic" }, /* @__PURE__ */ React.createElement(IcChip, { name: ic, tone })), /* @__PURE__ */ React.createElement("span", { className: "hp-tool-t" }, t), /* @__PURE__ */ React.createElement("span", { className: "hp-tool-d" }, d)))))), window.LP_GamifyCard && window.LP_AUTH && window.LP_AUTH.getUser() ? /* @__PURE__ */ React.createElement("section", { className: "section", style: { paddingTop: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "shell", style: { maxWidth: 760 } }, /* @__PURE__ */ React.createElement(window.LP_GamifyCard, null))) : null, /* @__PURE__ */ React.createElement("section", { className: "section", style: { paddingTop: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow", style: { marginBottom: 12 } }, "Popular free tools"), /* @__PURE__ */ React.createElement("div", { className: "hp-tools-grid" }, [
    ["target", "accent", "Band Checker", "Instant IELTS Writing/Speaking band + Band 9 model", "writing-checker"],
    ["book", "sky", "Vocabulary by topic", "Band-9 words with audio for every IELTS topic", "vocabulary"],
    ["chart", "green", "Prep Lessons", "600+ PPT strategy slides for all 7 exams", "learn"],
    ["plane", "pink", "Move Abroad", "Pre-departure checklist, visa timeline & city guides", "relocate"]
  ].map(([ic, tone, t, d, id]) => /* @__PURE__ */ React.createElement("button", { key: id, className: "hp-tool-card", onClick: () => onNav(id) }, /* @__PURE__ */ React.createElement("span", { className: "hp-tool-ic" }, /* @__PURE__ */ React.createElement(IcChip, { name: ic, tone })), /* @__PURE__ */ React.createElement("span", { className: "hp-tool-t" }, t), /* @__PURE__ */ React.createElement("span", { className: "hp-tool-d" }, d)))))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "card-cta reveal" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Free Learning Club \xB7 200+ topics"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Topics, model answers,", /* @__PURE__ */ React.createElement("br", null), "and vocabulary you can actually use."), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { maxWidth: 640, marginTop: 8 } }, "30+ writing prompts and 30+ speaking topics per English exam. GRE issue tasks and GMAT data insight walk-throughs. Every answer at full word count, every word with usage examples."), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12", style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("learning") }, "Open Learning Club"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("agents") }, "Try Speaking & Writing"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("blog") }, "Study tips & strategy"))))), /* @__PURE__ */ React.createElement("section", { className: "section", style: { background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "card-cta reveal" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Free tool \xB7 No signup"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Score & eligibility checker"), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { maxWidth: 640, marginTop: 8 } }, "Convert your score across IELTS, TOEFL, PTE, CELPIP & Duolingo, see your CEFR level, and find out which universities and visas you qualify for."), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12", style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("tools") }, "Open Score & Eligibility \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("colleges") }, "\u{1F9ED} Build my study-abroad plan"))))), /* @__PURE__ */ React.createElement("section", { className: "section" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Loved by test-takers worldwide"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Real results, zero cost."), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 640, marginTop: 10 } }, "Students across India, Canada, Australia, the US and beyond reach their target scores with LandingPrep \u2014 free."))), /* @__PURE__ */ React.createElement(Reviews, null))), /* @__PURE__ */ React.createElement(LatestGuides, null), /* @__PURE__ */ React.createElement("section", { className: "section faq-section", style: { background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "section-header reveal" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Frequently asked questions"), /* @__PURE__ */ React.createElement("h2", { className: "h1" }, "Everything you need to know"), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 640, marginTop: 10 } }, "Free exam prep and study-abroad guidance for students worldwide \u2014 answered. Switch between exam and study-abroad questions below."))), /* @__PURE__ */ React.createElement("div", { className: "faq-tabs reveal" }, /* @__PURE__ */ React.createElement("button", { className: "faq-tab" + (faqTab === "exams" ? " active" : ""), onClick: () => setFaqTab("exams") }, "\u{1F4DD} Exam prep"), /* @__PURE__ */ React.createElement("button", { className: "faq-tab" + (faqTab === "abroad" ? " active" : ""), onClick: () => setFaqTab("abroad") }, "\u{1F30D} Study abroad")), /* @__PURE__ */ React.createElement("div", { className: "faq-list reveal", key: faqTab }, faqActive.map((f, i) => /* @__PURE__ */ React.createElement("details", { className: "faq-item", key: i }, /* @__PURE__ */ React.createElement("summary", null, f.q, /* @__PURE__ */ React.createElement("span", { className: "faq-toggle", "aria-hidden": true }, "+")), /* @__PURE__ */ React.createElement("div", { className: "faq-answer" }, f.a))), faqTab === "abroad" && /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginTop: 16 }, onClick: () => onNav("colleges") }, "See the full study-abroad FAQ \u2192")))), /* @__PURE__ */ React.createElement("section", { className: "section", style: { paddingTop: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "card-signup reveal", style: { display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 320px" } }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Optional \xB7 Free account"), /* @__PURE__ */ React.createElement("h2", { className: "h2", style: { marginTop: 4 } }, "Track your progress over time"), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { marginTop: 6, maxWidth: 540 } }, "Sign in to save your test history, track streaks, see skill splits across all exams, and continue where you left off \u2014 on any device."), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary btn-lg", style: { marginTop: 16 }, onClick: () => onNav("login") }, "Create free account")), /* @__PURE__ */ React.createElement("div", { "aria-hidden": "true", style: { flex: "0 0 300px", maxWidth: 300, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 18, boxShadow: "var(--shadow, 0 10px 28px -14px rgba(16,24,40,.18))" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#f59e0b" } }, "\u{1F525} 7-day streak"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-3)" } }, "Level 4 \xB7 532 XP")), /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 260 80", style: { width: "100%", height: 78, marginTop: 12 } }, /* @__PURE__ */ React.createElement("polyline", { points: "0,66 43,58 86,60 130,42 173,34 216,22 260,10", fill: "none", stroke: "var(--accent)", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round" }), [[0, 66], [43, 58], [86, 60], [130, 42], [173, 34], [216, 22], [260, 10]].map(([x, y], i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: x, cy: y, r: "3.5", fill: "var(--accent)" }))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: "var(--ink-3)", fontWeight: 600, margin: "2px 0 12px" } }, "IELTS band trend \xB7 last 7 mocks"), [["Listening", 86, "#16a34a"], ["Reading", 74, "#0ea5e9"], ["Writing", 62, "#f59e0b"]].map(([s, w, c]) => /* @__PURE__ */ React.createElement("div", { key: s, style: { marginBottom: 9 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("span", null, s), /* @__PURE__ */ React.createElement("span", { style: { color: c } }, w, "%")), /* @__PURE__ */ React.createElement("div", { style: { height: 7, borderRadius: 999, background: "var(--line)" } }, /* @__PURE__ */ React.createElement("div", { style: { width: w + "%", height: "100%", borderRadius: 999, background: c } })))))))), /* @__PURE__ */ React.createElement("section", { className: "section seo-content", style: { background: "var(--surface-2)", borderTop: "1px solid var(--line)", paddingTop: 18, paddingBottom: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("details", { className: "seo-disclosure reveal" }, /* @__PURE__ */ React.createElement("summary", null, "Free IELTS, TOEFL, PTE, GRE & GMAT mock tests + a complete study-abroad toolkit"), /* @__PURE__ */ React.createElement("div", { className: "seo-content-inner" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "LandingPrep"), " is a 100% free platform that takes you from your first mock test all the way to your campus abroad. Practise ", /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/ielts", onClick: (e) => {
    e.preventDefault();
    onGuide(exams[0]);
  } }, "IELTS"), ", TOEFL iBT, PTE Academic, CELPIP, the Duolingo English Test, GRE and GMAT Focus with 1,000+ full-length ", /* @__PURE__ */ React.createElement("a", { href: "#/exam-prep", onClick: (e) => {
    e.preventDefault();
    onNav("exam-prep");
  } }, "mock tests"), " built on real exam timings and section-honest scoring \u2014 plus free speaking and writing practice with model answers. There is no signup, no credit card and no paywall."), /* @__PURE__ */ React.createElement("p", null, "Beyond test prep, LandingPrep is a full ", /* @__PURE__ */ React.createElement("a", { href: "#/colleges", onClick: (e) => {
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
    ["exam-prep", "Mock Tests"],
    ["exams", "Exam Guides"],
    ["learn", "Learn"],
    ["colleges", "Study Abroad"],
    ["tools", "Tools"],
    ["languages", "Languages"],
    ["blog", "Blog"]
  ];
  const drawerItems = [
    ["home", "Home"],
    ["exam-prep", "Mock Tests"],
    ["exams", "Exam Guides"],
    ["learn", "\u{1F4DA} Learn (Lessons + Club)"],
    ["writing-checker", "\u{1F3AF} Band-Score Checker"],
    ["vocabulary", "\u{1F4D6} Vocabulary"],
    ["achievements", "\u{1F3C6} Achievements & XP"],
    ["agents", "Speaking & Writing"],
    ["colleges", "Study Abroad"],
    ["relocate", "\u2708\uFE0F Move Abroad (checklist + visa)"],
    ["tools", "Tools"],
    ["languages", "Learn German, French & Spanish"],
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
  const [nlEmail, setNlEmail] = React.useState("");
  const [nlStatus, setNlStatus] = React.useState("");
  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(nlEmail)) {
      setNlStatus("err");
      return;
    }
    setNlStatus("sending");
    try {
      const base = window.LP_API_BASE || "";
      const r = await fetch(base + "/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: nlEmail, source: "footer" }) });
      if (r.ok) {
        setNlStatus("ok");
        setNlEmail("");
        try {
          if (window.gtag) window.gtag("event", "newsletter_signup", { source: "footer" });
        } catch (e2) {
        }
      } else setNlStatus("err");
    } catch (e2) {
      setNlStatus("err");
    }
  };
  const [pushStatus, setPushStatus] = React.useState("");
  const enablePush = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !window.LP_VAPID_PUBLIC) {
        setPushStatus("unsupported");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushStatus("denied");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const b64 = window.LP_VAPID_PUBLIC, pad = "=".repeat((4 - b64.length % 4) % 4);
      const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
      const key = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i);
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      const base = window.LP_API_BASE || "";
      await fetch(base + "/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub }) });
      setPushStatus("ok");
      try {
        if (window.gtag) window.gtag("event", "push_enabled");
      } catch (e2) {
      }
    } catch (e2) {
      setPushStatus("err");
    }
  };
  return /* @__PURE__ */ React.createElement("footer", { className: "footer" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "footer-grid" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "brand", style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement(LPLogo, { size: 30 }), /* @__PURE__ */ React.createElement("span", { className: "brand-name" }, "LandingPrep")), /* @__PURE__ */ React.createElement("div", { className: "footer-tagline" }, LP_TAGLINE), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { maxWidth: 380, fontSize: 14, lineHeight: 1.6, marginTop: 10 } }, "Free exam prep + a complete study-abroad toolkit for students worldwide \u2014 IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE & GMAT mock tests, plus college predictor, scholarships, SOP & visa guidance."), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { fontSize: 13, marginTop: 12 } }, "\u{1F4E7} ", /* @__PURE__ */ React.createElement("a", { href: "mailto:support@landingprep.com", style: { color: "var(--accent)", fontWeight: 600 } }, "support@landingprep.com"), "  \xB7  ", /* @__PURE__ */ React.createElement("a", { href: "/about/", style: { color: "var(--accent)", fontWeight: 600 } }, "About")), /* @__PURE__ */ React.createElement("form", { onSubmit: subscribe, "aria-label": "Newsletter signup", style: { marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 380 } }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "email",
      value: nlEmail,
      onChange: (e) => setNlEmail(e.target.value),
      placeholder: "Email for free weekly study tips",
      "aria-label": "Email address",
      style: { flex: "1 1 170px", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 14, background: "var(--surface)", color: "var(--ink)" }
    }
  ), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "btn btn-primary", style: { padding: "10px 16px" } }, nlStatus === "sending" ? "\u2026" : "Get tips"), nlStatus === "ok" && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--leaf)", width: "100%" } }, "\u2705 Subscribed \u2014 check your inbox!"), nlStatus === "err" && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "#dc2626", width: "100%" } }, "Please enter a valid email.")), pushStatus === "ok" ? /* @__PURE__ */ React.createElement("p", { style: { fontSize: 13, color: "var(--leaf)", marginTop: 10 } }, "\u{1F514} Reminders on \u2014 see you tomorrow!") : /* @__PURE__ */ React.createElement("button", { onClick: enablePush, className: "btn", style: { marginTop: 10, padding: "9px 14px", fontSize: 13 } }, "\u{1F514} Daily practice reminder"), pushStatus === "denied" && /* @__PURE__ */ React.createElement("p", { className: "muted", style: { fontSize: 12, marginTop: 6 } }, "Enable notifications in your browser settings to get reminders."), pushStatus === "unsupported" && /* @__PURE__ */ React.createElement("p", { className: "muted", style: { fontSize: 12, marginTop: 6 } }, "Reminders aren't supported on this browser/device."), window.LP_PLAY_URL ? /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.LP_PLAY_URL,
      target: "_blank",
      rel: "noopener",
      "aria-label": "Get the LandingPrep app on Google Play",
      onClick: () => {
        try {
          if (window.gtag) window.gtag("event", "get_app_click");
        } catch (e) {
        }
      },
      style: { display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, background: "#000", color: "#fff", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, textDecoration: "none", minHeight: 40 }
    },
    "\u25B6 Get the app on Google Play"
  ) : null), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, "Exam Guides"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/ielts" }, "IELTS")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/toefl" }, "TOEFL iBT")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/pte" }, "PTE Academic")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/celpip" }, "CELPIP")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/duolingo" }, "Duolingo")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/gre" }, "GRE")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-hub/gmat" }, "GMAT Focus")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, "Practice"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/exam-prep" }, "Mock tests")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/ielts-writing-checker/" }, "Band Checker")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/ielts-vocabulary/" }, "Vocabulary")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/prep-lessons/" }, "Prep Lessons")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/learning" }, "Learning Club")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/agents" }, "Speaking & Writing")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, "Resources"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/ielts-band-7/" }, "IELTS band requirements")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/which-english-test/" }, "Which English test? (quiz)")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/relocate" }, "Move Abroad checklist")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/student-city-guides/" }, "Student city guides")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/learn-german/" }, "Learn German, French & Spanish")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/blog" }, "Study tips & strategy")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/explore/" }, "Explore all free pages")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#/progress" }, "My Progress")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "https://syllab.in/", rel: "noopener", title: "Free NCERT & CBSE notes, mock tests and AI tutor" }, "School exams? Syllab \u2014 free CBSE/NCERT prep")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, "Compare & Plan"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/english-test-comparisons/" }, "Compare all tests")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/ielts-vs-pte/" }, "IELTS vs PTE")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/ielts-vs-toefl/" }, "IELTS vs TOEFL")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/tools/english-test-score-converter/" }, "Score converter")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/eligibility/" }, "Score needed by country")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/fully-funded-scholarships/" }, "Scholarships by country")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "/ielts-for-canada-pr/" }, "Test scores for PR & visa"))))), /* @__PURE__ */ React.createElement("div", { className: "colophon" }, /* @__PURE__ */ React.createElement("span", null, "\xA9 2026 LandingPrep. Independent prep platform \u2014 not affiliated with any test provider."), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("a", { href: "/privacy/" }, "Privacy"), " \xB7 ", /* @__PURE__ */ React.createElement("a", { href: "/terms/" }, "Terms"), " \xB7 ", /* @__PURE__ */ React.createElement("a", { href: "/about/" }, "About")))));
}
window.LP_Home = Home;
window.LP_TopBar = TopBar;
window.LP_Footer = Footer;
window.LP_Logo = LPLogo;
window.LP_TAGLINE = LP_TAGLINE;
window.LP_Marquee = Marquee;
