const { useState: useStateG } = React;
const TABS = [
  "Overview",
  "Pattern & Syllabus",
  "Registration",
  "Fees",
  "Score Guide",
  "Centres",
  "Mock Tests",
  "Tips",
  "Mistakes",
  "FAQs"
];
function ExamGuide({ exam, exams, onBack, onPractice, onNav, onSelectExam }) {
  const [tab, setTab] = useStateG("Overview");
  React.useEffect(() => {
    if (exam && window.LP_SEO) window.LP_SEO.set({
      title: `Free ${exam.name} Guide 2026 \u2014 Pattern, Fees, Scoring & Tips | LandingPrep`,
      description: `Free ${exam.name} guide: full exam pattern, section breakdown, registration, fees, score chart, test centres, top tips and common mistakes \u2014 plus free ${exam.short || exam.name} mock tests, no signup.`
    });
  }, [exam && exam.name]);
  if (!exam) return null;
  const toArr = (v) => Array.isArray(v) ? v : v == null || v === "" ? [] : typeof v === "string" ? v.split(/\s*;\s*|\.\s+(?=[A-Z])/).map((s) => s.trim().replace(/\.$/, "")).filter(Boolean) : [v];
  exam = {
    ...exam,
    streams: toArr(exam.streams).length ? toArr(exam.streams) : [exam.name],
    registration: toArr(exam.registration),
    pattern: Array.isArray(exam.pattern) ? exam.pattern : [],
    sections_detail: Array.isArray(exam.sections_detail) ? exam.sections_detail : [],
    scoreGuide: Array.isArray(exam.scoreGuide) ? exam.scoreGuide : [],
    commonMistakes: toArr(exam.commonMistakes),
    faqs: Array.isArray(exam.faqs) ? exam.faqs : []
  };
  const langTarget = exam.langAlias || null;
  const langName = langTarget ? langTarget.charAt(0).toUpperCase() + langTarget.slice(1) : null;
  const mockId = langTarget ? null : exam.mockAlias || (exam.guideOnly ? null : exam.id);
  const aliasName = exam.mockAlias ? ((exams || []).find((e) => e.id === exam.mockAlias) || {}).name : null;
  const accentStyle = { "--exam-colour": exam.colour };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "exams", onNav }), /* @__PURE__ */ React.createElement("main", { id: "main-content" }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint)", borderBottom: "1px solid var(--line)" } }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "exam-selector-row" }, exams.map((e) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: e.id,
      className: "exam-sel-btn" + (e.id === exam.id ? " is-active" : ""),
      onClick: () => {
        onSelectExam(e);
        setTab("Overview");
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: "esb-dot", style: { background: exam.id === e.id ? "#fff" : e.colour } }),
    e.short || e.name
  ))))), /* @__PURE__ */ React.createElement("section", { className: "guide-hero" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "guide-crumbs" }, /* @__PURE__ */ React.createElement("a", { onClick: (e) => {
    e.preventDefault();
    onNav ? onNav("home") : onBack();
  }, href: "#/" }, "Home"), /* @__PURE__ */ React.createElement("span", null, "/"), /* @__PURE__ */ React.createElement("a", { onClick: (e) => {
    e.preventDefault();
    onBack();
  }, href: "#/exam-hub" }, "Exam Hub"), /* @__PURE__ */ React.createElement("span", null, "/"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink)" } }, exam.name)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "eyebrow", style: { marginBottom: 14 } }, exam.body), /* @__PURE__ */ React.createElement("h1", { className: "h1", style: { fontSize: "clamp(36px,6vw,60px)", lineHeight: 1.04 } }, exam.name, " ", /* @__PURE__ */ React.createElement("em", { style: { fontStyle: "italic", color: exam.colour } }, "complete guide")), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { maxWidth: 700, marginTop: 18 } }, exam.blurb), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12", style: { marginTop: 26 } }, langTarget ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => {
    window.location.hash = "#/languages?lang=" + langTarget;
  } }, "Practise ", langName, " free \u2192") : mockId ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => {
    window.location.hash = "#/exam-prep/" + mockId;
  } }, aliasName ? `Practise with ${aliasName} mocks \u2192` : "Start mock test \u2192") : /* @__PURE__ */ React.createElement("a", { className: "btn btn-primary", href: "#guide-format" }, "Read the full guide \u2193"), ["ielts", "toefl", "pte"].includes(exam.id) && /* @__PURE__ */ React.createElement("a", { className: "btn", href: "/learn/" + exam.id + "/" }, "\u{1F4DA} Smart Notes \u2192"), /* @__PURE__ */ React.createElement("a", { className: "btn", href: exam.official, target: "_blank", rel: "noopener noreferrer" }, "Official site \u2197"), /* @__PURE__ */ React.createElement("a", { className: "btn", href: exam.booking, target: "_blank", rel: "noopener noreferrer" }, "Book your slot \u2197"))), /* @__PURE__ */ React.createElement("div", { className: "guide-stats", style: { marginTop: 28 } }, [
    [exam.duration, "Duration"],
    [exam.score, "Score scale"],
    [exam.sections, "Sections"],
    [langTarget ? "Free " + langName : mockId ? aliasName ? "Shared mocks" : exam.mocks + " free" : "Free guide", langTarget ? "Course + mocks" : mockId ? "Mock tests" : "Format & tips"]
  ].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { className: "guide-stat", key: v }, /* @__PURE__ */ React.createElement("div", { className: "k" }, k), /* @__PURE__ */ React.createElement("div", { className: "v" }, v)))))), /* @__PURE__ */ React.createElement("div", { className: "shell", id: "guide-format" }, /* @__PURE__ */ React.createElement("div", { className: "guide-tabs", style: { marginTop: 0 } }, TABS.map((t) => /* @__PURE__ */ React.createElement("button", { key: t, className: tab === t ? "is-on" : "", onClick: () => setTab(t) }, t))), /* @__PURE__ */ React.createElement("div", { className: "guide-cols", style: { marginTop: 28, paddingBottom: 64 } }, /* @__PURE__ */ React.createElement("div", null, tab === "Overview" && /* @__PURE__ */ React.createElement(OverviewTab, { exam }), tab === "Pattern & Syllabus" && /* @__PURE__ */ React.createElement(PatternTab, { exam }), tab === "Registration" && /* @__PURE__ */ React.createElement(RegistrationTab, { exam }), tab === "Fees" && /* @__PURE__ */ React.createElement(FeesTab, { exam }), tab === "Score Guide" && /* @__PURE__ */ React.createElement(ScoreTab, { exam }), tab === "Centres" && /* @__PURE__ */ React.createElement(CentresTab, { exam }), tab === "Mock Tests" && /* @__PURE__ */ React.createElement(MockTab, { exam, onPractice }), tab === "Tips" && /* @__PURE__ */ React.createElement(TipsTab, { exam }), tab === "Mistakes" && /* @__PURE__ */ React.createElement(MistakesTab, { exam }), tab === "FAQs" && /* @__PURE__ */ React.createElement(FAQsTab, { exam })), /* @__PURE__ */ React.createElement("aside", null, /* @__PURE__ */ React.createElement("div", { className: "aside-card" }, langTarget ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h2", style: { color: "white" } }, "Build your ", langName, " now"), /* @__PURE__ */ React.createElement("p", null, exam.name, " tests your ", langName, ". Practise free with our ", langName, " A1 course, mock tests and a 2-way speaking partner \u2014 the fastest way to start building the skills ", exam.name, " measures."), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      style: { background: "white", color: "var(--ink)", borderColor: "white", marginTop: 16 },
      onClick: () => {
        window.location.hash = "#/languages?lang=" + langTarget;
      }
    },
    "Practise ",
    langName,
    " free \u2192"
  )) : exam.mockAlias ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h2", style: { color: "white" } }, "Practise the same skills as ", aliasName), /* @__PURE__ */ React.createElement("p", null, exam.name, " and ", aliasName, " test the same core English skills at a similar level. Practise free on our ", aliasName, " mocks with real timings while you prepare for ", exam.name, "."), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      style: { background: "white", color: "var(--ink)", borderColor: "white", marginTop: 16 },
      onClick: () => {
        window.location.hash = "#/exam-prep/" + exam.mockAlias;
      }
    },
    "Practise ",
    aliasName,
    " mocks \u2192"
  )) : exam.guideOnly ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h2", style: { color: "white" } }, "Full ", exam.name, " guide"), /* @__PURE__ */ React.createElement("p", null, "This is your complete ", exam.name, " format, scoring and prep guide. Full practice mocks are on the way \u2014 meanwhile, explore our free mock tests for IELTS, TOEFL, PTE, CELPIP and more."), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      style: { background: "white", color: "var(--ink)", borderColor: "white", marginTop: 16 },
      onClick: () => {
        window.location.hash = "#/exam-prep";
      }
    },
    "Browse free mock tests \u2192"
  )) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "h2", style: { color: "white" } }, "Start practising free"), /* @__PURE__ */ React.createElement("p", null, "Take a free ", exam.name, " mock test with real timings. Get a section-by-section score and model answers for writing and speaking."), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      style: { background: "white", color: "var(--ink)", borderColor: "white", marginTop: 16 },
      onClick: () => {
        window.location.hash = "#/exam-prep/" + exam.id;
      }
    },
    "Start free mock \u2192"
  ))), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 22, marginTop: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow", style: { marginBottom: 12 } }, "Always verify officially"), /* @__PURE__ */ React.createElement("p", { className: "fine", style: { marginBottom: 12, lineHeight: 1.6 } }, "Fees, pattern updates, and centre availability change without notice. Confirm all details directly on the official site before booking or paying."), /* @__PURE__ */ React.createElement("a", { className: "btn-link", href: exam.official, target: "_blank", rel: "noopener noreferrer" }, "Official ", exam.name, " site \u2197"), /* @__PURE__ */ React.createElement("div", { style: { height: 8 } }), /* @__PURE__ */ React.createElement("a", { className: "btn-link", href: exam.booking, target: "_blank", rel: "noopener noreferrer" }, "Book your slot \u2197")), /* @__PURE__ */ React.createElement("div", { className: "card", style: { padding: 22, marginTop: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow", style: { marginBottom: 12 } }, "Study resources"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, [
    ["Learning Club", "learning"],
    ["Speaking Agent", "speaking"],
    ["Writing Agent", "writing"],
    ["My Progress", "progress"]
  ].map(([label, id]) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: id,
      className: "btn btn-sm",
      style: { justifyContent: "flex-start" },
      onClick: () => onNav(id)
    },
    label,
    " \u2192"
  )))))))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
}
function OverviewTab({ exam }) {
  return /* @__PURE__ */ React.createElement("div", { className: "guide-card" }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "About ", exam.name), /* @__PURE__ */ React.createElement("p", null, exam.blurb), /* @__PURE__ */ React.createElement("p", null, "Administered by ", exam.body, ". Available in ", exam.streams.length > 1 ? `two versions: ${exam.streams.join(" and ")}` : `one format: ${exam.streams[0]}`, ". Choose your stream carefully \u2014 confirm with the receiving institution or immigration authority before booking."), /* @__PURE__ */ React.createElement("dl", { style: { margin: "20px 0 0", padding: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Conducting body"), /* @__PURE__ */ React.createElement("dd", null, exam.body)), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Available versions"), /* @__PURE__ */ React.createElement("dd", null, exam.streams.join(", "))), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Primary purpose"), /* @__PURE__ */ React.createElement("dd", null, exam.tagline)), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Test duration"), /* @__PURE__ */ React.createElement("dd", null, exam.duration)), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Score scale"), /* @__PURE__ */ React.createElement("dd", null, exam.score)), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Number of sections"), /* @__PURE__ */ React.createElement("dd", null, exam.sections)), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Eligibility"), /* @__PURE__ */ React.createElement("dd", null, "No minimum academic requirement. Valid government-issued photo ID matching test registration details is required on test day.")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Score validity"), /* @__PURE__ */ React.createElement("dd", null, "2 years from test date (most purposes)"))), /* @__PURE__ */ React.createElement("div", { className: "note", style: { marginTop: 18 } }, "\u26A0 Always verify fees, test dates, and centre availability on the official site before booking. LandingPrep content is for preparation only and may not reflect the most recent changes."));
}
function PatternTab({ exam }) {
  if (window.LP_LIVE && window.LP_LIVE.useLive) window.LP_LIVE.useLive();
  const note = window.LP_LIVE ? window.LP_LIVE.patternNote(exam.id) : null;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "guide-card" }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "Test pattern & syllabus"), /* @__PURE__ */ React.createElement("p", null, "The ", exam.name, " runs for ", exam.duration, " across ", exam.sections, " sections. The structure below reflects the latest official format."), note && /* @__PURE__ */ React.createElement("div", { className: "live-note" }, "\u{1F195} ", /* @__PURE__ */ React.createElement("strong", null, "Latest:"), " ", note, window.LP_LIVE.updatedAt() && /* @__PURE__ */ React.createElement("span", { className: "live-stamp" }, " \xB7 updated ", window.LP_LIVE.updatedAt())), /* @__PURE__ */ React.createElement("dl", { style: { margin: "20px 0 0", padding: 0 } }, exam.pattern.map(([k, v], i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "row" }, /* @__PURE__ */ React.createElement("dt", null, k), /* @__PURE__ */ React.createElement("dd", null, v))))), exam.sections_detail && exam.sections_detail.map((sec) => /* @__PURE__ */ React.createElement("div", { key: sec.name, className: "guide-card", style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, sec.icon, " ", sec.name), /* @__PURE__ */ React.createElement("p", { style: { margin: "4px 0 12px", fontSize: 14, color: "var(--ink-3)" } }, sec.time, " minutes \xB7 ", sec.questions > 0 ? `${sec.questions} questions` : "variable tasks"), /* @__PURE__ */ React.createElement("div", { className: "guide-section-card" }, /* @__PURE__ */ React.createElement("div", { className: "gsc-name" }, "Question types"), /* @__PURE__ */ React.createElement("div", { className: "gsc-types" }, sec.types.map((t, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { marginBottom: 4 } }, "\u2022 ", t)))), /* @__PURE__ */ React.createElement("div", { className: "tip-box", style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("strong", null, "Exam tip"), sec.tips))));
}
function RegistrationTab({ exam }) {
  const steps = exam.registration || [
    "Create an account on the official website.",
    `Select your version: ${exam.streams.join(" or ")}.`,
    "Choose a test centre, date and time.",
    "Upload your passport or government ID details exactly as they will appear on test day.",
    "Complete payment. Save your booking confirmation.",
    "Results are released online \u2014 timing varies by exam; check the official site."
  ];
  return /* @__PURE__ */ React.createElement("div", { className: "guide-card" }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "Registration & booking"), /* @__PURE__ */ React.createElement("p", null, "All bookings are made through the official portal. Slots typically open 8\u201312 weeks in advance with rolling availability. Book early \u2014 popular dates and centres fill quickly."), /* @__PURE__ */ React.createElement("ol", { style: { paddingLeft: 20, margin: "16px 0", color: "var(--ink-2)", lineHeight: 1.8 } }, steps.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i }, s))), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12", style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("a", { className: "btn", href: exam.official, target: "_blank", rel: "noopener noreferrer" }, "Open official site \u2197"), /* @__PURE__ */ React.createElement("a", { className: "btn btn-primary", href: exam.booking, target: "_blank", rel: "noopener noreferrer" }, "Book your slot \u2197")), /* @__PURE__ */ React.createElement("div", { className: "note", style: { marginTop: 18 } }, "Ensure your ID details match exactly between your registration form and the ID you present on test day. Discrepancies can result in disqualification."));
}
function FeesTab({ exam }) {
  if (window.LP_LIVE && window.LP_LIVE.useLive) window.LP_LIVE.useLive();
  const live = window.LP_LIVE ? window.LP_LIVE.examFee(exam.id) : null;
  const usd = live && live.usd || exam.fees.usd;
  const stamp = live && live.updated || window.LP_LIVE && window.LP_LIVE.updatedAt();
  return /* @__PURE__ */ React.createElement("div", { className: "guide-card" }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "Test fees"), /* @__PURE__ */ React.createElement("p", null, "Fees vary by country, delivery format (centre vs. home), and applicable taxes. The figures below are typical at time of writing \u2014 always confirm the current amount on the official site before checkout."), stamp && /* @__PURE__ */ React.createElement("div", { className: "live-note" }, "\u{1F4B0} Fees shown are current as of ", /* @__PURE__ */ React.createElement("strong", null, stamp), " and update automatically when our team refreshes them."), /* @__PURE__ */ React.createElement("dl", { style: { margin: "20px 0 0", padding: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Test fee (USD)"), /* @__PURE__ */ React.createElement("dd", null, usd)), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Rescheduling fee"), /* @__PURE__ */ React.createElement("dd", null, "Varies \u2014 typically 25\u201330% of the full test fee if rescheduled within 14 days. Free cancellations vary by provider and timing.")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Score reporting"), /* @__PURE__ */ React.createElement("dd", null, "Some providers include free score reports; additional reports typically cost $20\u201330 each.")), /* @__PURE__ */ React.createElement("div", { className: "row" }, /* @__PURE__ */ React.createElement("dt", null, "Payment methods"), /* @__PURE__ */ React.createElement("dd", null, "Credit/debit card (Visa, Mastercard). Some providers accept net banking. Always pay through the official site only."))), /* @__PURE__ */ React.createElement("div", { className: "note", style: { marginTop: 18 } }, "\u26A0 Fees are updated periodically. The figures above are for guidance only. Always verify the current fee and applicable taxes on ", /* @__PURE__ */ React.createElement("a", { href: exam.official, target: "_blank", rel: "noopener noreferrer", style: { textDecoration: "underline" } }, exam.official), " before making payment."));
}
function ScoreTab({ exam }) {
  const guide = exam.scoreGuide || [];
  return /* @__PURE__ */ React.createElement("div", { className: "guide-card" }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "Score guide"), /* @__PURE__ */ React.createElement("p", null, "Scores are calculated based on your performance across all sections. The table below shows typical score ranges and their implications."), /* @__PURE__ */ React.createElement("table", { className: "score-guide-table" }, /* @__PURE__ */ React.createElement("tbody", null, guide.map(([score, meaning], i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", null, score), /* @__PURE__ */ React.createElement("td", null, meaning))))), /* @__PURE__ */ React.createElement("div", { className: "note", style: { marginTop: 18 } }, "Score requirements vary by institution, programme, and immigration route. Always confirm the exact score threshold with your target university, employer, or immigration authority before applying."));
}
function CentresTab({ exam }) {
  return /* @__PURE__ */ React.createElement("div", { className: "guide-card" }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "Test centres & delivery"), /* @__PURE__ */ React.createElement("p", null, exam.centres || "Available at authorised test centres worldwide. Check the official site for the most current list of available locations."), exam.id === "duolingo" && /* @__PURE__ */ React.createElement("div", { className: "tip-box", style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("strong", null, "Home test"), "The Duolingo English Test is taken entirely at home via a secure browser. No test centre required. You need a quiet room, a laptop or desktop, a working webcam and microphone, and a stable internet connection."), exam.id === "toefl" && /* @__PURE__ */ React.createElement("div", { className: "tip-box", style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("strong", null, "Home Edition"), "The TOEFL iBT Home Edition is the same test delivered at home with live remote proctoring. Available in most countries including India."), exam.id === "gre" && /* @__PURE__ */ React.createElement("div", { className: "tip-box", style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("strong", null, "GRE at Home"), "The GRE General Test at Home is available where ETS supports it. Same test, same scoring. Requires a working webcam, microphone, and ProctorU/ETS software."), exam.id === "gmat" && /* @__PURE__ */ React.createElement("div", { className: "tip-box", style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("strong", null, "Online proctored exam"), "The GMAT Focus Online is available worldwide. Same content and scoring as the test-centre version."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("a", { className: "btn", href: exam.booking, target: "_blank", rel: "noopener noreferrer" }, "Find centres & book \u2197")));
}
function MockTab({ exam, onPractice }) {
  const testTypes = [
    { label: "Full Test", desc: "All sections \xB7 Real timings \xB7 Complete report", icon: "\u{1F4CB}", type: "full" },
    { label: "Listening", desc: "Section drill \xB7 40 min", icon: "\u{1F3A7}", type: "section_listening" },
    { label: "Reading", desc: "Section drill \xB7 60 min", icon: "\u{1F4D6}", type: "section_reading" },
    { label: "Writing", desc: "Section drill \xB7 60 min", icon: "\u270D\uFE0F", type: "section_writing" },
    { label: "Speaking", desc: "Section drill \xB7 15 min", icon: "\u{1F3A4}", type: "section_speaking" }
  ];
  const grammarExams = ["gre", "gmat"];
  const filteredTypes = exam.id === "duolingo" ? [testTypes[0]] : exam.sections === 3 ? [testTypes[0], testTypes[2], testTypes[3], testTypes[4]] : testTypes;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "guide-card", style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "Mock tests for ", exam.name), /* @__PURE__ */ React.createElement("p", null, "LandingPrep includes ", exam.mocks, " ", exam.name, " mock tests \u2014 full-length tests with real timings, section drills for targeted practice, and an adaptive difficulty engine. All mocks are scored dynamically against an answer key or writing heuristic."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 } }, [["20", "Full mocks", "All sections, real timings"], ["40", "Section drills", "Targeted skill practice"]].map(([n, label, sub]) => /* @__PURE__ */ React.createElement("div", { key: label, className: "card-soft", style: { padding: 18 } }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow", style: { marginBottom: 6 } }, label), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--serif)", fontSize: 32, letterSpacing: "-0.02em" } }, n), /* @__PURE__ */ React.createElement("div", { className: "fine", style: { marginTop: 6 } }, sub))))), /* @__PURE__ */ React.createElement("div", { className: "test-type-grid" }, filteredTypes.map(({ label, desc, icon, type }) => /* @__PURE__ */ React.createElement("div", { key: type, className: "test-type-card", onClick: () => onPractice(exam, { examId: exam.id, type }) }, /* @__PURE__ */ React.createElement("div", { className: "ttc-icon" }, icon), /* @__PURE__ */ React.createElement("div", { className: "ttc-name" }, label), /* @__PURE__ */ React.createElement("div", { className: "ttc-desc" }, desc), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-primary", style: { marginTop: 8 } }, "Start \u2192")))));
}
function TipsTab({ exam }) {
  const tips = {
    ielts: [
      "Simulate test-day conditions for every full mock \u2014 same time of day, no pausing, no looking up answers mid-test.",
      "Listening: write answers while listening, not after. You will not have time to recall details later.",
      "Reading: skim the questions BEFORE reading the passage. You are looking for specific information, not reading for pleasure.",
      "Writing Task 2 carries double the marks of Task 1. Do not spend more than 20 minutes on Task 1.",
      "Speaking Part 2: Use your 1 minute of prep time to jot 3\u20134 bullet points, not full sentences.",
      "For T/F/NG questions: 'Not Given' means the information is not in the passage at all \u2014 not that it is uncertain or ambiguous.",
      "Spelling matters in Listening and Reading \u2014 one misspelled letter means the answer is marked wrong."
    ],
    toefl: [
      "Take structured notes during Listening \u2014 use a simple two-column system: main points left, details right.",
      "Speaking: state your main point in the first 5 seconds of your response. Examiners score on structure and clarity, not just vocabulary.",
      "Integrated Writing: the lecture will always relate to the reading \u2014 support, contradict, or qualify it. Map the relationships.",
      "Reading: the final question in each passage (prose summary or table completion) is worth 2\u20133 points. Don't rush it.",
      "Academic Discussion: take a clear position. 'I agree with Marcus because...' is stronger than 'Both sides have merit.'"
    ],
    pte: [
      "Read Aloud: if you pause for more than 3 seconds, the microphone stops recording. Speak continuously at a natural pace.",
      "Repeat Sentence: don't focus on individual words \u2014 capture meaning chunks and reproduce them.",
      "Write From Dictation is the highest-weight listening task. Listen twice mentally before typing.",
      "Re-order Paragraphs: find the topic sentence (usually contains no pronoun references to earlier text) and work forward.",
      "MCQ Multiple: wrong answers carry a penalty. If you are unsure, it is often better to select fewer options."
    ],
    celpip: [
      "Speaking tasks have no 'correct' answer \u2014 but they do require a clear structure: point \u2192 reason \u2192 example \u2192 conclusion.",
      "Email writing: always address all three bullet points. Missing even one can drop your Task Fulfillment score significantly.",
      "Use a conversational but professional Canadian English register \u2014 not overly formal, not slang.",
      "Listening: all audio uses Canadian accents and references. Practise with Canadian media.",
      "Reading Part 4 (viewpoints) is the hardest \u2014 practise distinguishing the writer's opinion from reported opinions of others."
    ],
    duolingo: [
      "Speak clearly and at a measured pace during Read Aloud and Speaking Sample \u2014 AI scoring rewards clarity over speed.",
      "Writing Sample should be 80\u2013150 words with a clear position, specific reason, and brief conclusion.",
      "Listen and Type: transcribe exactly what you hear, including function words (the, a, of). They count.",
      "Speak About the Photo: describe what you see factually, then speculate slightly \u2014 'This suggests that...'.",
      "The adaptive engine rewards correct answers on harder questions. Slow down and be accurate rather than rushing to guess."
    ],
    gre: [
      "Verbal: don't leave Text Completion or Sentence Equivalence blank \u2014 guess if needed as there is no penalty.",
      "Quantitative Comparison: test with specific numbers (fractions, negatives, zero, large numbers) before deciding.",
      "Analytical Writing: aim for a 5-paragraph structure and 450+ words. AW 4.0 is the typical programme requirement.",
      "The test is section-adaptive: the difficulty of your second Verbal/Quant section depends on your first. A hard second section is a good sign.",
      "Use the on-screen calculator sparingly in Quant \u2014 over-reliance slows you down and may indicate a setup error."
    ],
    gmat: [
      "Data Sufficiency: memorise the 5 answer choices (A\u2013E) cold before test day. Do not solve \u2014 assess sufficiency.",
      "Critical Reasoning: pre-think the answer before reading options. This dramatically reduces the pull of attractive wrong answers.",
      "Data Insights Multi-Source Reasoning: read each tab carefully \u2014 the answer often requires cross-referencing two tabs.",
      "Verbal: Sentence Correction has been removed from the Focus Edition. All Verbal questions are CR or RC.",
      "Use the section-order selection strategically \u2014 most coaches recommend starting with your strongest section."
    ]
  };
  const examTips = tips[exam.id] || tips.ielts;
  return /* @__PURE__ */ React.createElement("div", { className: "guide-card" }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "Last-minute tips for ", exam.name), /* @__PURE__ */ React.createElement("ul", { style: { paddingLeft: 18, margin: "16px 0 0", color: "var(--ink-2)", lineHeight: 1.8 } }, examTips.map((t, i) => /* @__PURE__ */ React.createElement("li", { key: i, style: { marginBottom: 8 } }, t))));
}
function MistakesTab({ exam }) {
  const mistakes = exam.commonMistakes || [];
  return /* @__PURE__ */ React.createElement("div", { className: "guide-card" }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "Common mistakes to avoid"), /* @__PURE__ */ React.createElement("p", { style: { marginBottom: 16 } }, "These are the most frequently observed errors by candidates preparing for ", exam.name, ". Address them in your practice sessions before test day."), /* @__PURE__ */ React.createElement("ul", { className: "cm-list" }, mistakes.map((m, i) => /* @__PURE__ */ React.createElement("li", { key: i }, m))));
}
function FAQsTab({ exam }) {
  const [open, setOpen] = useStateG(0);
  return /* @__PURE__ */ React.createElement("div", { className: "guide-card" }, /* @__PURE__ */ React.createElement("h2", { className: "h2" }, "Frequently asked questions"), /* @__PURE__ */ React.createElement("div", { className: "faq", style: { marginTop: 12 } }, exam.faqs.map(([q, a], i) => /* @__PURE__ */ React.createElement("details", { key: i, open: i === open, onToggle: () => setOpen(i) }, /* @__PURE__ */ React.createElement("summary", null, q), /* @__PURE__ */ React.createElement("p", null, a)))));
}
window.LP_Guide = ExamGuide;
