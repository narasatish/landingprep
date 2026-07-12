// Guide — enhanced exam guide with 10 tabs, exam-specific content, exam switcher
const { useState: useStateG } = React;

const TABS = [
  "Overview", "Pattern & Syllabus", "Registration", "Fees",
  "Score Guide", "Centres", "Mock Tests", "Tips", "Mistakes", "FAQs"
];

function ExamGuide({ exam, exams, onBack, onPractice, onNav, onSelectExam }) {
  const [tab, setTab] = useStateG("Overview");
  // Per-exam SEO (title + description + canonical) so each guide has its own meta
  // instead of inheriting the homepage's. Effect runs before the early return below
  // (rules-of-hooks) and no-ops when exam is absent.
  React.useEffect(() => {
    if (exam && window.LP_SEO) window.LP_SEO.set({
      title: `Free ${exam.name} Guide 2026 — Pattern, Fees, Scoring & Tips | LandingPrep`,
      description: `Free ${exam.name} guide: full exam pattern, section breakdown, registration, fees, score chart, test centres, top tips and common mistakes — plus free ${exam.short || exam.name} mock tests, no signup.`,
    });
  }, [exam && exam.name]);
  if (!exam) return null;

  // Bulletproofing: every field a tab maps/joins over MUST be an array. Coerce any
  // string/missing value to a sensible array so no data-shape mismatch can ever crash a tab.
  const toArr = (v) => Array.isArray(v) ? v
    : (v == null || v === "") ? []
    : (typeof v === "string" ? v.split(/\s*;\s*|\.\s+(?=[A-Z])/).map(s => s.trim().replace(/\.$/, "")).filter(Boolean) : [v]);
  exam = {
    ...exam,
    streams: toArr(exam.streams).length ? toArr(exam.streams) : [exam.name],
    registration: toArr(exam.registration),
    pattern: Array.isArray(exam.pattern) ? exam.pattern : [],
    sections_detail: Array.isArray(exam.sections_detail) ? exam.sections_detail : [],
    scoreGuide: Array.isArray(exam.scoreGuide) ? exam.scoreGuide : [],
    commonMistakes: toArr(exam.commonMistakes),
    faqs: Array.isArray(exam.faqs) ? exam.faqs : [],
  };

  // mockAlias lets a guide-only exam reuse another exam's mock engine (e.g. PTE Core → PTE Academic,
  // CAEL → TOEFL, Cambridge → IELTS). langAlias points a language exam (TEF/TCF) at the language hub.
  const langTarget = exam.langAlias || null;
  const langName = langTarget ? langTarget.charAt(0).toUpperCase() + langTarget.slice(1) : null;
  const mockId = langTarget ? null : (exam.mockAlias || (exam.guideOnly ? null : exam.id));
  const aliasName = exam.mockAlias ? (((exams || []).find((e) => e.id === exam.mockAlias)) || {}).name : null;

  const accentStyle = { "--exam-colour": exam.colour };

  return (
    <>
      <window.LP_TopBar current="exams" onNav={onNav} />
      <main id="main-content">

      {/* Exam switcher */}
      <div style={{ background: "var(--tint)", borderBottom: "1px solid var(--line)" }}>
        <div className="shell">
          <div className="exam-selector-row">
            {exams.map((e) => (
              <button
                key={e.id}
                className={"exam-sel-btn" + (e.id === exam.id ? " is-active" : "")}
                onClick={() => { onSelectExam(e); setTab("Overview"); }}
              >
                <span className="esb-dot" style={{ background: exam.id === e.id ? "#fff" : e.colour }} />
                {e.short || e.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="guide-hero">
        <div className="shell">
          <div className="guide-crumbs">
            <a onClick={(e) => { e.preventDefault(); onNav ? onNav("home") : onBack(); }} href="#/">Home</a>
            <span>/</span>
            <a onClick={(e) => { e.preventDefault(); onBack(); }} href="#/exam-hub">Exam Hub</a>
            <span>/</span>
            <span style={{ color: "var(--ink)" }}>{exam.name}</span>
          </div>

          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>{exam.body}</div>
            <h1 className="h1" style={{ fontSize: "clamp(36px,6vw,60px)", lineHeight: 1.04 }}>
              {exam.name} <em style={{ fontStyle: "italic", color: exam.colour }}>complete guide</em>
            </h1>
            <p className="body-lg muted" style={{ maxWidth: 700, marginTop: 18 }}>{exam.blurb}</p>

            <div className="row-gap-12" style={{ marginTop: 26 }}>
              {langTarget
                ? <button className="btn btn-primary" onClick={() => { window.location.hash = '#/languages?lang=' + langTarget; }}>Practise {langName} free →</button>
                : mockId
                ? <button className="btn btn-primary" onClick={() => { window.location.hash = '#/exam-prep/' + mockId; }}>{aliasName ? `Practise with ${aliasName} mocks →` : "Start mock test →"}</button>
                : <a className="btn btn-primary" href="#guide-format">Read the full guide ↓</a>}
              {["ielts", "toefl", "pte", "gre", "gmat", "duolingo", "sat", "celpip", "act", "oet", "cambridge"].includes(exam.id) && (
                <a className="btn" href={"/learn/" + exam.id + "/"}>📚 Smart Notes →</a>
              )}
              <a className="btn" href={exam.official} target="_blank" rel="noopener noreferrer">Official site ↗</a>
              <a className="btn" href={exam.booking} target="_blank" rel="noopener noreferrer">Book your slot ↗</a>
            </div>
          </div>

          <div className="guide-stats" style={{ marginTop: 28 }}>
            {[
              [exam.duration, "Duration"],
              [exam.score, "Score scale"],
              [exam.sections, "Sections"],
              [langTarget ? "Free " + langName : mockId ? (aliasName ? "Shared mocks" : exam.mocks + " free") : "Free guide", langTarget ? "Course + mocks" : mockId ? "Mock tests" : "Format & tips"],
            ].map(([k, v]) => (
              <div className="guide-stat" key={v}>
                <div className="k">{k}</div>
                <div className="v">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab nav */}
      <div className="shell" id="guide-format">
        <div className="guide-tabs" style={{ marginTop: 0 }}>
          {TABS.map((t) => (
            <button key={t} className={tab === t ? "is-on" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="guide-cols" style={{ marginTop: 28, paddingBottom: 64 }}>
          <div>
            {tab === "Overview" && <OverviewTab exam={exam} />}
            {tab === "Pattern & Syllabus" && <PatternTab exam={exam} />}
            {tab === "Registration" && <RegistrationTab exam={exam} />}
            {tab === "Fees" && <FeesTab exam={exam} />}
            {tab === "Score Guide" && <ScoreTab exam={exam} />}
            {tab === "Centres" && <CentresTab exam={exam} />}
            {tab === "Mock Tests" && <MockTab exam={exam} onPractice={onPractice} />}
            {tab === "Tips" && <TipsTab exam={exam} />}
            {tab === "Mistakes" && <MistakesTab exam={exam} />}
            {tab === "FAQs" && <FAQsTab exam={exam} />}
          </div>

          {/* Sidebar */}
          <aside>
            <div className="aside-card">
              {langTarget ? (
                <>
                  <h2 className="h2" style={{ color: "white" }}>Build your {langName} now</h2>
                  <p>{exam.name} tests your {langName}. Practise free with our {langName} A1 course, mock tests and a 2-way speaking partner — the fastest way to start building the skills {exam.name} measures.</p>
                  <button
                    className="btn"
                    style={{ background: "white", color: "var(--ink)", borderColor: "white", marginTop: 16 }}
                    onClick={() => { window.location.hash = '#/languages?lang=' + langTarget; }}
                  >
                    Practise {langName} free →
                  </button>
                </>
              ) : exam.mockAlias ? (
                <>
                  <h2 className="h2" style={{ color: "white" }}>Practise the same skills as {aliasName}</h2>
                  <p>{exam.name} and {aliasName} test the same core English skills at a similar level. Practise free on our {aliasName} mocks with real timings while you prepare for {exam.name}.</p>
                  <button
                    className="btn"
                    style={{ background: "white", color: "var(--ink)", borderColor: "white", marginTop: 16 }}
                    onClick={() => { window.location.hash = '#/exam-prep/' + exam.mockAlias; }}
                  >
                    Practise {aliasName} mocks →
                  </button>
                </>
              ) : exam.guideOnly ? (
                <>
                  <h2 className="h2" style={{ color: "white" }}>Full {exam.name} guide</h2>
                  <p>This is your complete {exam.name} format, scoring and prep guide. Full practice mocks are on the way — meanwhile, explore our free mock tests for IELTS, TOEFL, PTE, CELPIP and more.</p>
                  <button
                    className="btn"
                    style={{ background: "white", color: "var(--ink)", borderColor: "white", marginTop: 16 }}
                    onClick={() => { window.location.hash = '#/exam-prep'; }}
                  >
                    Browse free mock tests →
                  </button>
                </>
              ) : (
                <>
                  <h2 className="h2" style={{ color: "white" }}>Start practising free</h2>
                  <p>Take a free {exam.name} mock test with real timings. Get a section-by-section score and model answers for writing and speaking.</p>
                  <button
                    className="btn"
                    style={{ background: "white", color: "var(--ink)", borderColor: "white", marginTop: 16 }}
                    onClick={() => { window.location.hash = '#/exam-prep/' + exam.id; }}
                  >
                    Start free mock →
                  </button>
                </>
              )}
            </div>

            <div className="card" style={{ padding: 22, marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Always verify officially</div>
              <p className="fine" style={{ marginBottom: 12, lineHeight: 1.6 }}>
                Fees, pattern updates, and centre availability change without notice. Confirm all details directly on the official site before booking or paying.
              </p>
              <a className="btn-link" href={exam.official} target="_blank" rel="noopener noreferrer">Official {exam.name} site ↗</a>
              <div style={{ height: 8 }} />
              <a className="btn-link" href={exam.booking} target="_blank" rel="noopener noreferrer">Book your slot ↗</a>
            </div>

            <div className="card" style={{ padding: 22, marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Study resources</div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  ["Learning Club", "learning"],
                  ["Speaking Agent", "speaking"],
                  ["Writing Agent", "writing"],
                  ["My Progress", "progress"],
                ].map(([label, id]) => (
                  <button
                    key={id}
                    className="btn btn-sm"
                    style={{ justifyContent: "flex-start" }}
                    onClick={() => onNav(id)}
                  >
                    {label} →
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      </main>
      <window.LP_Footer />
    </>
  );
}

function OverviewTab({ exam }) {
  return (
    <div className="guide-card">
      <h2 className="h2">About {exam.name}</h2>
      <p>{exam.blurb}</p>
      <p>Administered by {exam.body}. Available in {exam.streams.length > 1 ? `two versions: ${exam.streams.join(" and ")}` : `one format: ${exam.streams[0]}`}. Choose your stream carefully — confirm with the receiving institution or immigration authority before booking.</p>
      <dl style={{ margin: "20px 0 0", padding: 0 }}>
        <div className="row"><dt>Conducting body</dt><dd>{exam.body}</dd></div>
        <div className="row"><dt>Available versions</dt><dd>{exam.streams.join(", ")}</dd></div>
        <div className="row"><dt>Primary purpose</dt><dd>{exam.tagline}</dd></div>
        <div className="row"><dt>Test duration</dt><dd>{exam.duration}</dd></div>
        <div className="row"><dt>Score scale</dt><dd>{exam.score}</dd></div>
        <div className="row"><dt>Number of sections</dt><dd>{exam.sections}</dd></div>
        <div className="row"><dt>Eligibility</dt><dd>No minimum academic requirement. Valid government-issued photo ID matching test registration details is required on test day.</dd></div>
        <div className="row"><dt>Score validity</dt><dd>2 years from test date (most purposes)</dd></div>
      </dl>
      <div className="note" style={{ marginTop: 18 }}>
        ⚠ Always verify fees, test dates, and centre availability on the official site before booking. LandingPrep content is for preparation only and may not reflect the most recent changes.
      </div>
    </div>
  );
}

function PatternTab({ exam }) {
  if (window.LP_LIVE && window.LP_LIVE.useLive) window.LP_LIVE.useLive();
  const note = window.LP_LIVE ? window.LP_LIVE.patternNote(exam.id) : null;
  return (
    <div>
      <div className="guide-card">
        <h2 className="h2">Test pattern &amp; syllabus</h2>
        <p>The {exam.name} runs for {exam.duration} across {exam.sections} sections. The structure below reflects the latest official format.</p>
        {note && <div className="live-note">🆕 <strong>Latest:</strong> {note}{window.LP_LIVE.updatedAt() && <span className="live-stamp"> · updated {window.LP_LIVE.updatedAt()}</span>}</div>}
        <dl style={{ margin: "20px 0 0", padding: 0 }}>
          {exam.pattern.map(([k, v], i) => (
            <div key={i} className="row"><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </div>

      {exam.sections_detail && exam.sections_detail.map((sec) => (
        <div key={sec.name} className="guide-card" style={{ marginTop: 16 }}>
          <h2 className="h2">{sec.icon} {sec.name}</h2>
          <p style={{ margin: "4px 0 12px", fontSize: 14, color: "var(--ink-3)" }}>
            {sec.time} minutes · {sec.questions > 0 ? `${sec.questions} questions` : "variable tasks"}
          </p>
          <div className="guide-section-card">
            <div className="gsc-name">Question types</div>
            <div className="gsc-types">
              {sec.types.map((t, i) => <div key={i} style={{ marginBottom: 4 }}>• {t}</div>)}
            </div>
          </div>
          <div className="tip-box" style={{ marginTop: 12 }}>
            <strong>Exam tip</strong>
            {sec.tips}
          </div>
        </div>
      ))}
    </div>
  );
}

function RegistrationTab({ exam }) {
  const steps = exam.registration || [
    "Create an account on the official website.",
    `Select your version: ${exam.streams.join(" or ")}.`,
    "Choose a test centre, date and time.",
    "Upload your passport or government ID details exactly as they will appear on test day.",
    "Complete payment. Save your booking confirmation.",
    "Results are released online — timing varies by exam; check the official site."
  ];
  return (
    <div className="guide-card">
      <h2 className="h2">Registration &amp; booking</h2>
      <p>All bookings are made through the official portal. Slots typically open 8–12 weeks in advance with rolling availability. Book early — popular dates and centres fill quickly.</p>
      <ol style={{ paddingLeft: 20, margin: "16px 0", color: "var(--ink-2)", lineHeight: 1.8 }}>
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <div className="row-gap-12" style={{ marginTop: 16 }}>
        <a className="btn" href={exam.official} target="_blank" rel="noopener noreferrer">Open official site ↗</a>
        <a className="btn btn-primary" href={exam.booking} target="_blank" rel="noopener noreferrer">Book your slot ↗</a>
      </div>
      <div className="note" style={{ marginTop: 18 }}>
        Ensure your ID details match exactly between your registration form and the ID you present on test day. Discrepancies can result in disqualification.
      </div>
    </div>
  );
}

function FeesTab({ exam }) {
  if (window.LP_LIVE && window.LP_LIVE.useLive) window.LP_LIVE.useLive();
  const live = window.LP_LIVE ? window.LP_LIVE.examFee(exam.id) : null;
  const usd = (live && live.usd) || exam.fees.usd;
  const stamp = (live && live.updated) || (window.LP_LIVE && window.LP_LIVE.updatedAt());
  return (
    <div className="guide-card">
      <h2 className="h2">Test fees</h2>
      <p>Fees vary by country, delivery format (centre vs. home), and applicable taxes. The figures below are typical at time of writing — always confirm the current amount on the official site before checkout.</p>
      {stamp && <div className="live-note">💰 Fees shown are current as of <strong>{stamp}</strong> and update automatically when our team refreshes them.</div>}
      <dl style={{ margin: "20px 0 0", padding: 0 }}>
        <div className="row"><dt>Test fee (USD)</dt><dd>{usd}</dd></div>
        <div className="row"><dt>Rescheduling fee</dt><dd>Varies — typically 25–30% of the full test fee if rescheduled within 14 days. Free cancellations vary by provider and timing.</dd></div>
        <div className="row"><dt>Score reporting</dt><dd>Some providers include free score reports; additional reports typically cost $20–30 each.</dd></div>
        <div className="row"><dt>Payment methods</dt><dd>Credit/debit card (Visa, Mastercard). Some providers accept net banking. Always pay through the official site only.</dd></div>
      </dl>
      <div className="note" style={{ marginTop: 18 }}>
        ⚠ Fees are updated periodically. The figures above are for guidance only. Always verify the current fee and applicable taxes on <a href={exam.official} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>{exam.official}</a> before making payment.
      </div>
    </div>
  );
}

function ScoreTab({ exam }) {
  const guide = exam.scoreGuide || [];
  return (
    <div className="guide-card">
      <h2 className="h2">Score guide</h2>
      <p>Scores are calculated based on your performance across all sections. The table below shows typical score ranges and their implications.</p>
      <table className="score-guide-table">
        <tbody>
          {guide.map(([score, meaning], i) => (
            <tr key={i}>
              <td>{score}</td>
              <td>{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="note" style={{ marginTop: 18 }}>
        Score requirements vary by institution, programme, and immigration route. Always confirm the exact score threshold with your target university, employer, or immigration authority before applying.
      </div>
    </div>
  );
}

function CentresTab({ exam }) {
  return (
    <div className="guide-card">
      <h2 className="h2">Test centres &amp; delivery</h2>
      <p>{exam.centres || "Available at authorised test centres worldwide. Check the official site for the most current list of available locations."}</p>
      {exam.id === "duolingo" && (
        <div className="tip-box" style={{ marginTop: 12 }}>
          <strong>Home test</strong>
          The Duolingo English Test is taken entirely at home via a secure browser. No test centre required. You need a quiet room, a laptop or desktop, a working webcam and microphone, and a stable internet connection.
        </div>
      )}
      {exam.id === "toefl" && (
        <div className="tip-box" style={{ marginTop: 12 }}>
          <strong>Home Edition</strong>
          The TOEFL iBT Home Edition is the same test delivered at home with live remote proctoring. Available in most countries including India.
        </div>
      )}
      {exam.id === "gre" && (
        <div className="tip-box" style={{ marginTop: 12 }}>
          <strong>GRE at Home</strong>
          The GRE General Test at Home is available where ETS supports it. Same test, same scoring. Requires a working webcam, microphone, and ProctorU/ETS software.
        </div>
      )}
      {exam.id === "gmat" && (
        <div className="tip-box" style={{ marginTop: 12 }}>
          <strong>Online proctored exam</strong>
          The GMAT Focus Online is available worldwide. Same content and scoring as the test-centre version.
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <a className="btn" href={exam.booking} target="_blank" rel="noopener noreferrer">Find centres &amp; book ↗</a>
      </div>
    </div>
  );
}

function MockTab({ exam, onPractice }) {
  const testTypes = [
    { label: "Full Test", desc: "All sections · Real timings · Complete report", icon: "📋", type: "full" },
    { label: "Listening", desc: "Section drill · 40 min", icon: "🎧", type: "section_listening" },
    { label: "Reading", desc: "Section drill · 60 min", icon: "📖", type: "section_reading" },
    { label: "Writing", desc: "Section drill · 60 min", icon: "✍️", type: "section_writing" },
    { label: "Speaking", desc: "Section drill · 15 min", icon: "🎤", type: "section_speaking" },
  ];
  const grammarExams = ["gre", "gmat"];
  const filteredTypes = exam.id === "duolingo"
    ? [testTypes[0]]
    : exam.sections === 3
      ? [testTypes[0], testTypes[2], testTypes[3], testTypes[4]]
      : testTypes;

  return (
    <div>
      <div className="guide-card" style={{ marginBottom: 16 }}>
        <h2 className="h2">Mock tests for {exam.name}</h2>
        <p>LandingPrep includes {exam.mocks} {exam.name} mock tests — full-length tests with real timings, section drills for targeted practice, and an adaptive difficulty engine. All mocks are scored dynamically against an answer key or writing heuristic.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
          {[["20", "Full mocks", "All sections, real timings"], ["40", "Section drills", "Targeted skill practice"]].map(([n, label, sub]) => (
            <div key={label} className="card-soft" style={{ padding: 18 }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 32, letterSpacing: "-0.02em" }}>{n}</div>
              <div className="fine" style={{ marginTop: 6 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="test-type-grid">
        {filteredTypes.map(({ label, desc, icon, type }) => (
          <div key={type} className="test-type-card" onClick={() => onPractice(exam, { examId: exam.id, type })}>
            <div className="ttc-icon">{icon}</div>
            <div className="ttc-name">{label}</div>
            <div className="ttc-desc">{desc}</div>
            <button className="btn btn-sm btn-primary" style={{ marginTop: 8 }}>Start →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TipsTab({ exam }) {
  const tips = {
    ielts: [
      "Simulate test-day conditions for every full mock — same time of day, no pausing, no looking up answers mid-test.",
      "Listening: write answers while listening, not after. You will not have time to recall details later.",
      "Reading: skim the questions BEFORE reading the passage. You are looking for specific information, not reading for pleasure.",
      "Writing Task 2 carries double the marks of Task 1. Do not spend more than 20 minutes on Task 1.",
      "Speaking Part 2: Use your 1 minute of prep time to jot 3–4 bullet points, not full sentences.",
      "For T/F/NG questions: 'Not Given' means the information is not in the passage at all — not that it is uncertain or ambiguous.",
      "Spelling matters in Listening and Reading — one misspelled letter means the answer is marked wrong."
    ],
    toefl: [
      "Take structured notes during Listening — use a simple two-column system: main points left, details right.",
      "Speaking: state your main point in the first 5 seconds of your response. Examiners score on structure and clarity, not just vocabulary.",
      "Integrated Writing: the lecture will always relate to the reading — support, contradict, or qualify it. Map the relationships.",
      "Reading: the final question in each passage (prose summary or table completion) is worth 2–3 points. Don't rush it.",
      "Academic Discussion: take a clear position. 'I agree with Marcus because...' is stronger than 'Both sides have merit.'"
    ],
    pte: [
      "Read Aloud: if you pause for more than 3 seconds, the microphone stops recording. Speak continuously at a natural pace.",
      "Repeat Sentence: don't focus on individual words — capture meaning chunks and reproduce them.",
      "Write From Dictation is the highest-weight listening task. Listen twice mentally before typing.",
      "Re-order Paragraphs: find the topic sentence (usually contains no pronoun references to earlier text) and work forward.",
      "MCQ Multiple: wrong answers carry a penalty. If you are unsure, it is often better to select fewer options."
    ],
    celpip: [
      "Speaking tasks have no 'correct' answer — but they do require a clear structure: point → reason → example → conclusion.",
      "Email writing: always address all three bullet points. Missing even one can drop your Task Fulfillment score significantly.",
      "Use a conversational but professional Canadian English register — not overly formal, not slang.",
      "Listening: all audio uses Canadian accents and references. Practise with Canadian media.",
      "Reading Part 4 (viewpoints) is the hardest — practise distinguishing the writer's opinion from reported opinions of others."
    ],
    duolingo: [
      "Speak clearly and at a measured pace during Read Aloud and Speaking Sample — AI scoring rewards clarity over speed.",
      "Writing Sample should be 80–150 words with a clear position, specific reason, and brief conclusion.",
      "Listen and Type: transcribe exactly what you hear, including function words (the, a, of). They count.",
      "Speak About the Photo: describe what you see factually, then speculate slightly — 'This suggests that...'.",
      "The adaptive engine rewards correct answers on harder questions. Slow down and be accurate rather than rushing to guess."
    ],
    gre: [
      "Verbal: don't leave Text Completion or Sentence Equivalence blank — guess if needed as there is no penalty.",
      "Quantitative Comparison: test with specific numbers (fractions, negatives, zero, large numbers) before deciding.",
      "Analytical Writing: aim for a 5-paragraph structure and 450+ words. AW 4.0 is the typical programme requirement.",
      "The test is section-adaptive: the difficulty of your second Verbal/Quant section depends on your first. A hard second section is a good sign.",
      "Use the on-screen calculator sparingly in Quant — over-reliance slows you down and may indicate a setup error."
    ],
    gmat: [
      "Data Sufficiency: memorise the 5 answer choices (A–E) cold before test day. Do not solve — assess sufficiency.",
      "Critical Reasoning: pre-think the answer before reading options. This dramatically reduces the pull of attractive wrong answers.",
      "Data Insights Multi-Source Reasoning: read each tab carefully — the answer often requires cross-referencing two tabs.",
      "Verbal: Sentence Correction has been removed from the Focus Edition. All Verbal questions are CR or RC.",
      "Use the section-order selection strategically — most coaches recommend starting with your strongest section."
    ]
  };
  const examTips = tips[exam.id] || tips.ielts;
  return (
    <div className="guide-card">
      <h2 className="h2">Last-minute tips for {exam.name}</h2>
      <ul style={{ paddingLeft: 18, margin: "16px 0 0", color: "var(--ink-2)", lineHeight: 1.8 }}>
        {examTips.map((t, i) => <li key={i} style={{ marginBottom: 8 }}>{t}</li>)}
      </ul>
    </div>
  );
}

function MistakesTab({ exam }) {
  const mistakes = exam.commonMistakes || [];
  return (
    <div className="guide-card">
      <h2 className="h2">Common mistakes to avoid</h2>
      <p style={{ marginBottom: 16 }}>These are the most frequently observed errors by candidates preparing for {exam.name}. Address them in your practice sessions before test day.</p>
      <ul className="cm-list">
        {mistakes.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </div>
  );
}

function FAQsTab({ exam }) {
  const [open, setOpen] = useStateG(0);
  return (
    <div className="guide-card">
      <h2 className="h2">Frequently asked questions</h2>
      <div className="faq" style={{ marginTop: 12 }}>
        {exam.faqs.map(([q, a], i) => (
          <details key={i} open={i === open} onToggle={() => setOpen(i)}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

window.LP_Guide = ExamGuide;
