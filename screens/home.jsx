// Home — clean, public, common to all users (no personal stats)
const { useState: useStateH } = React;

// Brand tagline (international, premium).
const LP_TAGLINE = "From mock test to campus abroad";

// Brand logo — gradient graduation-cap monogram (crisp at any size, no assets).
function LPLogo({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="lp-logo">
      <defs>
        <linearGradient id="lpLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8.5" fill="url(#lpLogoGrad)" />
      <path d="M16 8.2 L27 12.6 L16 17 L5 12.6 Z" fill="#fff" />
      <path d="M9.4 14.6 L9.4 19.3 C12.8 21.6 19.2 21.6 22.6 19.3 L22.6 14.6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 12.6 L27 18.6" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="27" cy="19.4" r="1.25" fill="#fff" />
    </svg>
  );
}

// High-intent FAQ — mirrors the FAQPage JSON-LD in index.html for rich results.
const FAQS = [
  { q: "Are the IELTS, TOEFL and PTE mock tests really free?",
    a: "Yes — 100% free, forever. All 1,000+ mock tests across IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo English Test, GRE and GMAT Focus are free with no signup, no credit card and no paywall. Start any test directly from the homepage." },
  { q: "Do the mock tests use real exam patterns and timings?",
    a: "Every test mirrors the official 2026 format and timing — IELTS Listening 30+10 minutes, Reading 60, Writing 60; PTE Read Aloud, Repeat Sentence, Describe Image and Write Essay; GMAT Focus Quant, Verbal and Data Insights. We rebuild the formats and timing, never the copyrighted questions." },
  { q: "Can I practise IELTS and PTE speaking with a real voice?",
    a: "Yes. Our AI Speaking Agent uses natural neural voices — you speak into your mic, get live transcripts and AI follow-up questions, just like a real examiner. Listening sections and Describe Image / Re-tell Lecture tasks also play real audio." },
  { q: "Do I get model answers and band-level feedback for writing?",
    a: "Every writing task — IELTS Task 1 & 2, TOEFL integrated and discussion, PTE essay, GRE issue, GMAT and CELPIP — includes a free Band 7+/CEFR C1 model answer plus live word-count and rubric guidance. The AI Writing Agent gives instant structured feedback on any essay you paste." },
  { q: "Can LandingPrep also help me choose a university and apply abroad?",
    a: "Yes. Beyond free mock tests, LandingPrep includes a free College Predictor across 99 top universities (USA, UK, Canada, Australia, Germany and more) with fees, requirements, scholarships and admission process, plus an SOP builder, study-abroad destination guides with visa-success rates and immigration pathways, and an education-loan comparison — everything to go from test prep to admission, free." },
  { q: "How accurate is the scoring?",
    a: "Listening and Reading use the official band/scaled-score conversion tables. Writing and Speaking use a transparent rubric-based heuristic (task achievement, coherence, vocabulary, grammar). Scores are indicative — an empty answer never scores, and random text never reaches Band 8." },
  { q: "Do I need to create an account or download anything?",
    a: "No. LandingPrep runs entirely in your browser on any device — no download, no signup. An optional free account only adds progress tracking, streaks and skill analytics across all seven exams." },
];

// Study-abroad lifecycle FAQ (mirrors the FAQPage JSON-LD in index.html).
const STUDY_FAQS = [
  { q: "Which country is best for international students?",
    a: "It depends on your budget, field and PR goals. The USA leads on research and salaries; Canada and Australia offer the clearest permanent-residence pathways; the UK has a fast 1-year master's; Germany has near-free public-university tuition; Ireland and the Netherlands are strong English-taught EU hubs. Use the free Country Guide to compare visa-success rates, costs and immigration routes side by side." },
  { q: "How do I shortlist the right universities?",
    a: "Build a balanced list of Safe, Target and Reach schools based on your test score, GPA and budget. LandingPrep's free Profile Evaluation and College Predictor do this automatically across 99 top universities, showing fees, requirements, acceptance rates and Safe/Target/Reach matches." },
  { q: "Which English test should I take to study abroad?",
    a: "Check what your target universities and visa accept. IELTS and TOEFL are the most widely accepted; PTE and the Duolingo English Test are faster and often cheaper; CELPIP is used for Canada. Each LandingPrep exam hub shows the latest pattern, fees and score requirements — all with free mock tests." },
  { q: "How can I fund my study abroad?",
    a: "Combine scholarships, education loans and part-time work. The country-based Scholarship Finder lists fully-funded and merit awards, and the Loan Compare tool shows 10 lenders with interest rates, limits and EMI. Most student visas also allow around 20 hours of part-time work per week." },
  { q: "What is the student-visa success rate, and how do I improve mine?",
    a: "Success rates vary by country and profile — each destination guide shows its indicative visa-success rate. The biggest factors are solid proof of funds, a genuine and consistent study plan, and documents that match. Apply early, especially for Fall intake." },
  { q: "Can I stay and work after I graduate?",
    a: "Yes in most top destinations: the USA offers OPT (12–36 months), the UK a 2-year Graduate Route, Canada a PGWP of up to 3 years, and Australia a 485 visa for 2–4 years. Each Country Guide shows the full step-by-step path from study to work to permanent residence." },
];

const TESTIMONIALS = [
  { name: "Priya S.", exam: "IELTS Academic", place: "Bengaluru, India", stars: 5,
    text: "Got Band 7.5 on my first attempt. The free mock tests felt exactly like the real exam and the model answers showed me precisely how to structure Task 2." },
  { name: "Daniel O.", exam: "PTE Academic", place: "Lagos → Sydney", stars: 5,
    text: "The AI speaking practice and Describe Image charts were a game-changer. I jumped from 65 to 82 and saved hundreds on coaching." },
  { name: "Mei L.", exam: "TOEFL iBT", place: "Shanghai", stars: 5,
    text: "Real timings, instant scoring, and the writing model answers are genuinely C1 level. I hit 105 and got into my dream grad program." },
  { name: "Ahmed R.", exam: "CELPIP", place: "Toronto", stars: 5,
    text: "Practised the email and survey tasks daily here for free. Scored CLB 9 across the board for my PR — couldn't recommend it more." },
  { name: "Sofia G.", exam: "GMAT Focus", place: "São Paulo", stars: 5,
    text: "The Data Insights drills with real charts were exactly what I needed. Clean interface, honest scoring, completely free." },
  { name: "Rahul M.", exam: "GRE", place: "Hyderabad", stars: 5,
    text: "The 30-day plan plus the issue-essay model answers took me from a 305 diagnostic to a 322. Best free GRE resource I found." },
];

// ── Band predictor + university/visa eligibility tool ────────────────────────
const CEFR_TABLE = {
  C2: { label: "C2 · Mastery", ielts: "8.5–9.0", toefl: "115–120", pte: "85–90", celpip: "11–12", duolingo: "145–160",
        elig: "Top-tier universities (Oxbridge, Ivy League) and the maximum language points for PR/immigration. You're exam-ready for anything." },
  C1: { label: "C1 · Advanced", ielts: "7.0–8.0", toefl: "95–114", pte: "65–84", celpip: "9–10", duolingo: "120–140",
        elig: "Competitive master's & PhD programs, professional registration (nursing, engineering), and strong Canada/Australia PR points." },
  B2: { label: "B2 · Upper-Intermediate", ielts: "5.5–6.5", toefl: "72–94", pte: "50–64", celpip: "7–8", duolingo: "95–115",
        elig: "Most undergraduate programs, UK & Australia student visas, and many taught master's degrees. The common 6.0–6.5 admission band." },
  B1: { label: "B1 · Intermediate", ielts: "4.0–5.0", toefl: "42–71", pte: "36–49", celpip: "5–6", duolingo: "75–90",
        elig: "Foundation / pathway & some diploma programs. Below most direct-entry degree requirements — aim higher for university." },
  A2: { label: "A2 · Elementary", ielts: "3.0–3.5", toefl: "0–41", pte: "10–35", celpip: "3–4", duolingo: "10–70",
        elig: "Below typical academic and visa requirements. Build core skills first — practise daily and re-test in a few weeks." },
};
function scoreToCEFR(exam, s) {
  const v = parseFloat(s); if (isNaN(v)) return null;
  const t = {
    ielts:    [[8.5,"C2"],[7,"C1"],[5.5,"B2"],[4,"B1"],[0,"A2"]],
    toefl:    [[115,"C2"],[95,"C1"],[72,"B2"],[42,"B1"],[0,"A2"]],
    pte:      [[85,"C2"],[65,"C1"],[50,"B2"],[36,"B1"],[0,"A2"]],
    celpip:   [[11,"C2"],[9,"C1"],[7,"B2"],[5,"B1"],[0,"A2"]],
    duolingo: [[145,"C2"],[120,"C1"],[95,"B2"],[75,"B1"],[0,"A2"]],
  }[exam] || [];
  for (const [min, lvl] of t) if (v >= min) return lvl;
  return "A2";
}
const PREDICTOR_EXAMS = [
  { id: "ielts", name: "IELTS", ph: "e.g. 6.5", step: "0.5", min: "0", max: "9" },
  { id: "toefl", name: "TOEFL iBT", ph: "e.g. 90", step: "1", min: "0", max: "120" },
  { id: "pte", name: "PTE", ph: "e.g. 60", step: "1", min: "10", max: "90" },
  { id: "celpip", name: "CELPIP", ph: "e.g. 9", step: "1", min: "1", max: "12" },
  { id: "duolingo", name: "Duolingo", ph: "e.g. 120", step: "5", min: "10", max: "160" },
];
function BandPredictor() {
  const [exam, setExam] = useStateH("ielts");
  const [score, setScore] = useStateH("");
  const cfg = PREDICTOR_EXAMS.find(e => e.id === exam);
  const cefr = score ? scoreToCEFR(exam, score) : null;
  const row = cefr ? CEFR_TABLE[cefr] : null;
  const others = ["ielts", "toefl", "pte", "celpip", "duolingo"].filter(e => e !== exam);
  const nameOf = (id) => PREDICTOR_EXAMS.find(e => e.id === id).name;
  return (
    <div className="predictor-card reveal">
      <div className="predictor-form">
        <div>
          <label className="predictor-label">Your exam</label>
          <div className="predictor-exam-row">
            {PREDICTOR_EXAMS.map(e => (
              <button key={e.id} className={"predictor-chip" + (exam === e.id ? " active" : "")}
                onClick={() => { setExam(e.id); setScore(""); }}>{e.name}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="predictor-label">Your score</label>
          <input className="predictor-input" type="number" inputMode="decimal"
            placeholder={cfg.ph} step={cfg.step} min={cfg.min} max={cfg.max}
            value={score} onChange={e => setScore(e.target.value)} />
        </div>
      </div>
      {row ? (
        <div className="predictor-result">
          <div className="predictor-cefr">Your level: <strong>{row.label}</strong></div>
          <div className="predictor-equiv">
            <div className="pe-title">Equivalent scores</div>
            <div className="pe-grid">
              {others.map(id => (
                <div className="pe-cell" key={id}><span className="pe-exam">{nameOf(id)}</span><span className="pe-val">{row[id]}</span></div>
              ))}
            </div>
          </div>
          <div className="predictor-elig"><strong>What this gets you:</strong> {row.elig}</div>
          <p className="predictor-note">Indicative CEFR-aligned conversion. Always confirm exact requirements with your target university or visa authority.</p>
        </div>
      ) : (
        <p className="predictor-hint">Enter your score to see your CEFR level, equivalent scores in every other exam, and what universities/visas you qualify for.</p>
      )}
    </div>
  );
}

function Home({ onGuide, onPractice, onNav }) {
  const exams = window.LP_DATA.EXAMS;
  const [faqTab, setFaqTab] = useStateH("exams");
  React.useEffect(() => {
    if (!window.LP_SEO) return;
    window.LP_SEO.set({
      title: "Free IELTS, TOEFL, PTE, GRE & GMAT Mock Tests Online | LandingPrep",
      description: "1,000+ free practice tests with answers and model responses. Real exam patterns, instant scoring, natural-voice listening — no signup required."
    });
  }, []);
  const faqActive = faqTab === "abroad" ? STUDY_FAQS : FAQS;
  return (
    <>
      <window.LP_TopBar current="home" onNav={onNav} />
      <window.LP_Marquee />

      <main id="main-content">
      {/* Hero */}
      <section className="hero">
        <div className="shell">
          <div className="hero-inner-clean">
            <div className="hero-meta">
              <span className="chip"><span className="dot" style={{ background: "var(--leaf)" }} /> Trusted by students worldwide</span>
              <span className="chip">100% free</span>
              <span className="chip">No signup</span>
            </div>
            <div className="hero-tagline">🌍 {LP_TAGLINE}</div>
            <h1 className="display">
              Prep for your exam.<br />Land your <em style={{ fontStyle: "italic", fontFamily: "var(--serif)", color: "var(--accent)" }}>dream university</em> abroad.
            </h1>
            <p className="body-lg muted" style={{ maxWidth: 760, marginTop: 18, marginInline: "auto" }}>
              1,000+ free mock tests for IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE &amp; GMAT — plus a complete study-abroad toolkit: college predictor, scholarships, SOP, visa &amp; more. All free, for students in every country.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => onNav("exam-prep")}>Browse all mock tests →</button>
              <button className="btn btn-lg" onClick={() => { window.location.hash = "#/colleges/onboard"; onNav("colleges"); }}>🚀 Build my study-abroad plan</button>
              <button className="btn btn-lg" onClick={() => window.LP_REFERRAL && window.LP_REFERRAL.invite()} title="Share free prep with a friend">📲 Invite a friend</button>
            </div>
            <div className="hero-fine">
              <span><span className="dot" /> No registration to start</span>
              <span><span className="dot" /> 100% free, forever</span>
              <span><span className="dot" /> Browser-based — works anywhere</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero photo band (real photo, graceful gradient fallback) */}
      <section className="section reveal" style={{ paddingTop: 8, paddingBottom: 8 }}>
        <div className="shell">
          <div className="home-hero-photo">
            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=72"
                 alt="Graduates throwing their caps in celebration with a city skyline" loading="lazy"
                 onError={(e) => { const p = e.target.closest(".home-hero-photo"); if (p) p.classList.add("no-photo"); }} />
            <div className="hhp-overlay" />
            <div className="hhp-cap">Join students worldwide preparing for their dream universities — 100% free.</div>
          </div>
        </div>
      </section>

      {/* Key stats band */}
      <section className="section lp-stats-section reveal" style={{ paddingTop: 24, paddingBottom: 8 }}>
        <div className="shell">
          <div className="lp-stats">
            {[["7", "exams covered"], ["1,000+", "free mock tests"], ["99", "universities"], ["100%", "free, forever"], ["0", "signups to start"]].map(([n, l]) => (
              <div className="lp-stat" key={l}><span className="lp-stat-n">{n}</span><span className="lp-stat-l">{l}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* Main pros — everything you get, free */}
      <section className="section reveal" style={{ paddingTop: 18 }}>
        <div className="shell">
          <div className="section-header reveal">
            <div>
              <div className="eyebrow">Why students choose LandingPrep</div>
              <h2 className="h1">Everything you need — from test prep to admission, <em style={{ fontFamily: "var(--serif)", fontStyle: "italic", color: "var(--accent)" }}>100% free</em>.</h2>
              <p className="muted" style={{ maxWidth: 660, marginTop: 10 }}>
                One platform replaces a dozen paid tools and a coaching centre — practise the exam, then plan your university, scholarship and visa journey.
              </p>
            </div>
          </div>
          <div className="lp-pros reveal">
            {[
              ["📝", "1,000+ realistic mocks", "Real timings & patterns across all 7 exams with instant scoring.", "exam-prep"],
              ["🎤", "AI speaking practice", "Speak into your mic, get live transcripts, follow-ups & fluency scoring.", "agents"],
              ["✍️", "AI band-score checker", "Paste an essay or record a Part 2 — instant IELTS band, TR/CC/LR/GRA breakdown & Band 9 model.", "writing-checker"],
              ["🏛️", "College Predictor", "99 top universities with fees, requirements & Safe/Target/Reach matches.", "colleges"],
              ["💸", "Scholarships & loans", "Country-based scholarship finder and a 10-lender education-loan compare.", "colleges"],
              ["🛂", "Visa, PR & immigration", "Visa types, settlement options and a step-by-step student→PR roadmap.", "colleges"],
              ["📅", "Personalised study plan", "A real week-by-week schedule built around your weakest sections.", "tools"],
              ["📊", "Progress & analytics", "Track scores, streaks and skill splits across every exam — on any device.", "progress"],
            ].map(([icon, title, desc, nav]) => (
              <button className="lp-pro" key={title} onClick={() => onNav(nav)}>
                <span className="lp-pro-ic" aria-hidden>{icon}</span>
                <span className="lp-pro-t">{title}</span>
                <span className="lp-pro-d">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Study-abroad destinations band */}
      <section className="section sa-band reveal" style={{ paddingTop: 30 }}>
        <div className="shell">
          <div className="sa-band-inner">
            <div className="sa-band-text">
              <div className="eyebrow">🌍 Study abroad — free</div>
              <h2 className="h1" style={{ margin: "6px 0 8px" }}>Find your university, scholarships &amp; visa path</h2>
              <p className="muted" style={{ maxWidth: 560 }}>99 top universities across 9 countries with fees, requirements, scholarships, visa-success rates, immigration & PR pathways — plus a college predictor, SOP builder and loan comparison. All free.</p>
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => onNav("colleges")}>🏛️ Open College Predictor →</button>
                <button className="btn" onClick={() => { window.location.hash = "#/colleges/apply"; onNav("colleges"); }}>🎓 Apply to 99+ universities</button>
              </div>
            </div>
            <div className="sa-band-flags">
              {[["🇺🇸", "USA"], ["🇬🇧", "UK"], ["🇨🇦", "Canada"], ["🇦🇺", "Australia"], ["🇩🇪", "Germany"], ["🇮🇪", "Ireland"], ["🇳🇿", "NZ"], ["🇸🇬", "Singapore"]].map(([f, n]) => (
                <button key={n} className="sa-flag" onClick={() => onNav("colleges")} title={"Study in " + n}><span>{f}</span>{n}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Simple linked exam list */}
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="shell">
          <div className="section-header reveal">
            <div>
              <div className="eyebrow">Choose your exam</div>
              <h2 className="h1">Seven exams. One unified prep platform.</h2>
              <p className="muted" style={{ maxWidth: 640, marginTop: 10 }}>
                Click any exam to open its complete prep hub — pattern, registration, fees, score guide, mock tests, tips, and FAQs.
              </p>
            </div>
          </div>

          <ul className="exam-list-simple reveal">
            {exams.map((e) => (
              <li key={e.id}>
                <a href="#" onClick={(ev) => { ev.preventDefault(); onGuide(e); }}>
                  <span className="el-dot" style={{ background: e.colour }} />
                  <span className="el-name">{e.name}</span>
                  <span className="el-tag">{e.tagline}</span>
                  <span className="el-arrow">→</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Gamification: XP / level / streak (retention) */}
      {window.LP_GamifyCard ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="shell" style={{ maxWidth: 760 }}>
            <window.LP_GamifyCard />
          </div>
        </section>
      ) : null}

      {/* Popular free tools — discovery + internal links for crawlers */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Popular free tools</div>
          <div className="hp-tools-grid">
            {[
              ["🎯", "AI Band Checker", "Instant IELTS Writing/Speaking band + Band 9 model", "writing-checker"],
              ["📖", "Vocabulary by topic", "Band-9 words with audio for every IELTS topic", "vocabulary"],
              ["📊", "Prep Lessons", "600+ PPT strategy slides for all 7 exams", "learn"],
              ["✈️", "Move Abroad", "Pre-departure checklist, visa timeline & city guides", "relocate"],
            ].map(([ic, t, d, id]) => (
              <button key={id} className="hp-tool-card" onClick={() => onNav(id)}>
                <span className="hp-tool-ic">{ic}</span>
                <span className="hp-tool-t">{t}</span>
                <span className="hp-tool-d">{d}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Club CTA */}
      <section className="section">
        <div className="shell">
          <div className="card-cta reveal">
            <div className="eyebrow">Free Learning Club · 200+ topics</div>
            <h2 className="h1">Topics, model answers,<br/>and vocabulary you can actually use.</h2>
            <p className="body-lg muted" style={{ maxWidth: 640, marginTop: 8 }}>
              30+ writing prompts and 30+ speaking topics per English exam. GRE issue tasks and GMAT data insight walk-throughs. Every answer at full word count, every word with usage examples.
            </p>
            <div className="row-gap-12" style={{ marginTop: 18 }}>
              <button className="btn btn-primary" onClick={() => onNav("learning")}>Open Learning Club</button>
              <button className="btn" onClick={() => onNav("agents")}>Try AI Agents</button>
              <button className="btn" onClick={() => onNav("blog")}>Study tips & strategy</button>
            </div>
          </div>
        </div>
      </section>

      {/* Score & eligibility — lives in the Tools hub (no duplicate widget here) */}
      <section className="section" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="shell">
          <div className="card-cta reveal">
            <div className="eyebrow">Free tool · No signup</div>
            <h2 className="h1">Score &amp; eligibility checker</h2>
            <p className="body-lg muted" style={{ maxWidth: 640, marginTop: 8 }}>
              Convert your score across IELTS, TOEFL, PTE, CELPIP &amp; Duolingo, see your CEFR level, and find out which universities and visas you qualify for.
            </p>
            <div className="row-gap-12" style={{ marginTop: 18 }}>
              <button className="btn btn-primary" onClick={() => onNav("tools")}>Open Score &amp; Eligibility →</button>
              <button className="btn" onClick={() => onNav("colleges")}>🧭 Build my study-abroad plan</button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="shell">
          <div className="section-header reveal">
            <div>
              <div className="eyebrow">Loved by test-takers worldwide</div>
              <h2 className="h1">Real results, zero cost.</h2>
              <p className="muted" style={{ maxWidth: 640, marginTop: 10 }}>
                Students across India, Canada, Australia, the US and beyond reach their target scores with LandingPrep — free.
              </p>
            </div>
          </div>
          <div className="testimonial-grid reveal">
            {TESTIMONIALS.map((t, i) => (
              <figure className="testimonial-card" key={i}>
                <div className="t-stars" aria-label={t.stars + " stars"}>{"★★★★★".slice(0, t.stars)}</div>
                <blockquote>{t.text}</blockquote>
                <figcaption>
                  <span className="t-avatar" aria-hidden>{t.name[0]}</span>
                  <span>
                    <span className="t-name">{t.name}</span>
                    <span className="t-meta">{t.exam} · {t.place}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq-section" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="shell">
          <div className="section-header reveal">
            <div>
              <div className="eyebrow">Frequently asked questions</div>
              <h2 className="h1">Everything you need to know</h2>
              <p className="muted" style={{ maxWidth: 640, marginTop: 10 }}>
                Free exam prep and study-abroad guidance for students worldwide — answered. Switch between exam and study-abroad questions below.
              </p>
            </div>
          </div>
          <div className="faq-tabs reveal">
            <button className={"faq-tab" + (faqTab === "exams" ? " active" : "")} onClick={() => setFaqTab("exams")}>📝 Exam prep</button>
            <button className={"faq-tab" + (faqTab === "abroad" ? " active" : "")} onClick={() => setFaqTab("abroad")}>🌍 Study abroad</button>
          </div>
          <div className="faq-list reveal" key={faqTab}>
            {faqActive.map((f, i) => (
              <details className="faq-item" key={i}>
                <summary>{f.q}<span className="faq-toggle" aria-hidden>+</span></summary>
                <div className="faq-answer">{f.a}</div>
              </details>
            ))}
            {faqTab === "abroad" && (
              <button className="btn" style={{ marginTop: 16 }} onClick={() => onNav("colleges")}>See the full study-abroad FAQ →</button>
            )}
          </div>
        </div>
      </section>

      {/* Sign up CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="shell">
          <div className="card-signup reveal">
            <div>
              <div className="eyebrow">Optional · Free account</div>
              <h2 className="h2" style={{ marginTop: 4 }}>Track your progress over time</h2>
              <p className="muted" style={{ marginTop: 6, maxWidth: 540 }}>
                Sign in to save your test history, track streaks, see skill splits across all exams, and continue where you left off — on any device.
              </p>
            </div>
            <button className="btn btn-primary btn-lg" onClick={() => onNav("login")}>Create free account</button>
          </div>
        </div>
      </section>

      {/* SEO content — crawlable answer-style block, collapsed into one tab above the
          footer so it stays in the DOM for Google/AI search but doesn't clutter the page. */}
      <section className="section seo-content" style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", paddingTop: 18, paddingBottom: 18 }}>
        <div className="shell">
          <details className="seo-disclosure reveal">
            <summary>Free IELTS, TOEFL, PTE, GRE &amp; GMAT mock tests + a complete study-abroad toolkit</summary>
            <div className="seo-content-inner">
            <p>
              <strong>LandingPrep</strong> is a 100% free platform that takes you from your first mock test all the way to your campus abroad. Practise <a href="#/exam-hub/ielts" onClick={(e)=>{e.preventDefault();onGuide(exams[0]);}}>IELTS</a>, TOEFL iBT, PTE Academic, CELPIP, the Duolingo English Test, GRE and GMAT Focus with 1,000+ full-length <a href="#/exam-prep" onClick={(e)=>{e.preventDefault();onNav("exam-prep");}}>mock tests</a> built on real exam timings and section-honest scoring — plus free AI speaking and writing practice with model answers. There is no signup, no credit card and no paywall.
            </p>
            <p>
              Beyond test prep, LandingPrep is a full <a href="#/colleges" onClick={(e)=>{e.preventDefault();onNav("colleges");}}>study-abroad</a> toolkit. Use the free <strong>College Predictor</strong> to find your Safe, Target and Reach universities across 99 top institutions in the USA, UK, Canada, Australia, Germany, Ireland, New Zealand, Singapore and the Netherlands. Compare universities and whole countries, find scholarships, build your <strong>SOP, LOR and resume</strong>, estimate cost and ROI, compare 10 education-loan lenders, practise your visa interview, and follow step-by-step immigration and PR roadmaps for every destination.
            </p>
            <p>
              Whether you are searching for <em>free IELTS practice tests</em>, the <em>best universities for an MS in Computer Science in Canada</em>, the <em>cost of studying in the UK</em>, <em>study-abroad scholarships</em>, or <em>which English test to take</em>, LandingPrep gives clear, free answers and the tools to act on them — for international students in every country. Start free on the <a href="#/" onClick={(e)=>{e.preventDefault();onNav("home");}}>homepage</a>, or read our <a href="#/blog" onClick={(e)=>{e.preventDefault();onNav("blog");}}>study &amp; immigration blog</a>.
            </p>
            </div>
          </details>
        </div>
      </section>

      </main>
      <window.LP_Footer />
    </>
  );
}

function TopBar({ current = "home", onNav }) {
  const [open, setOpen] = useStateH(false);
  const [settingsOpen, setSettingsOpen] = useStateH(false);
  const [ttsEnabled, setTtsEnabled] = useStateH(window.LP_TTS ? window.LP_TTS.isEnabled() : false);
  const [user, setUser] = useStateH(window.LP_AUTH ? window.LP_AUTH.getUser() : null);
  const [dark, setDark] = useStateH(document.documentElement.getAttribute("data-theme") === "dark");
  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    try { localStorage.setItem("lp_theme", next ? "dark" : "light"); } catch (e) {}
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
    try { await e.userChoice; } catch (_) {}
    window.__lpInstall = null; setCanInstall(false);
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
  // Desktop nav: the brand logo already returns Home, so it's omitted here to
  // keep the row tidy. Labels are kept short so they arrange neatly on one line.
  // Slim primary nav (5 items). Exam Hub is folded into "Exams"; AI Agents and
  // Progress live in the profile menu + mobile drawer.
  const items = [
    ["home", "Home"],
    ["exam-prep", "Mock Tests"],
    ["exams", "Exam Guides"],
    ["learn", "Learn"],
    ["colleges", "Study Abroad"],
    ["tools", "Tools"],
    ["languages", "Languages"],
    ["blog", "Blog"],
  ];
  // The slide-out drawer (mobile) offers the full set for discoverability.
  const drawerItems = [
    ["home", "Home"],
    ["exam-prep", "Mock Tests"],
    ["exams", "Exam Guides"],
    ["learn", "📚 Learn (Lessons + Club)"],
    ["writing-checker", "🎯 AI Band-Score Checker"],
    ["vocabulary", "📖 Vocabulary"],
    ["achievements", "🏆 Achievements & XP"],
    ["agents", "AI Speaking & Writing"],
    ["colleges", "Study Abroad"],
    ["relocate", "✈️ Move Abroad (checklist + visa)"],
    ["tools", "Tools"],
    ["languages", "Learn German & French"],
    ["blog", "Blog"],
    ["progress", "My Progress"],
  ];
  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else onNav && onNav("home");
  };

  return (
    <>
      <header className="topbar">
        <div className="shell topbar-inner">
          <div className="topbar-left">
            <button className="brand" onClick={() => onNav && onNav("home")} style={{ background: "transparent" }}>
              <LPLogo size={32} />
              <span className="brand-name">LandingPrep</span>
            </button>
          </div>
          <nav className="nav">
            {items.map(([id, label]) => (
              <a key={id} className={current === id ? "is-on" : ""} onClick={(e) => { e.preventDefault(); onNav && onNav(id); }} href="#">{label}</a>
            ))}
          </nav>
          <div className="topbar-actions">
            {canInstall && (
              <button className="topbar-icon-btn" onClick={installApp} aria-label="Install app" title="Install LandingPrep app">⬇️</button>
            )}
            <button className="topbar-icon-btn" onClick={toggleDark} aria-label="Toggle night study mode" title={dark ? "Switch to light mode" : "Night study (dark mode)"}>
              {dark ? "☀️" : "🌙"}
            </button>
            {user ? (
              <button className="topbar-profile" onClick={() => onNav && onNav("progress")} title={user.email}>
                <span className="user-avatar" aria-hidden>{user.name?.[0]?.toUpperCase() || "U"}</span>
                <span className="tp-name">{user.name?.split(" ")[0] || "Account"}</span>
              </button>
            ) : (
              <button className="topbar-auth" onClick={() => onNav && onNav("login")}>Log in / Sign up</button>
            )}
            <button className="menu-btn" aria-label="Menu" onClick={() => setOpen(true)}><span /><span /><span /></button>
          </div>
        </div>
      </header>

      {current !== "home" && (
        <div className="page-back">
          <div className="shell">
            <button className="back-inline" onClick={goBack} aria-label="Go back to the previous page">
              <span aria-hidden>←</span> Back
            </button>
          </div>
        </div>
      )}

      {window.LP_TTS && <window.LP_TTS.SettingsModal open={settingsOpen} onClose={closeSettings} />}

      {open && (
        <div className={"drawer is-open"} onClick={() => setOpen(false)}>
          <aside className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <button className="drawer-close" onClick={() => setOpen(false)}>×</button>
            {drawerItems.map(([id, label]) => (
              <a key={id} href="#" onClick={(e) => { e.preventDefault(); setOpen(false); onNav && onNav(id); }}>{label}</a>
            ))}
            <button className="btn" style={{ marginTop: 16 }} onClick={toggleDark}>{dark ? "☀️ Light mode" : "🌙 Night study mode"}</button>
            {!user && <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => { setOpen(false); onNav("login"); }}>Log in / Sign up</button>}
            {user && <button className="btn" style={{ marginTop: 10 }} onClick={() => { if (window.LP_AUTH) window.LP_AUTH.signOut(); setOpen(false); }}>Sign out</button>}
          </aside>
        </div>
      )}
    </>
  );
}

function Marquee() {
  const items = [
    "60 mocks per exam",
    "Real test-day timings",
    "Section-honest scoring",
    "Voice-native speaking",
    "Free Learning Club",
    "AI writing review",
    "IELTS · TOEFL · PTE · CELPIP · Duolingo · GRE · GMAT",
  ];
  const repeated = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {repeated.map((t, i) => (
          <span key={i}>{t}<span className="dot" /></span>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: 8 }}>
              <LPLogo size={30} />
              <span className="brand-name">LandingPrep</span>
            </div>
            <div className="footer-tagline">{LP_TAGLINE}</div>
            <p className="muted" style={{ maxWidth: 380, fontSize: 14, lineHeight: 1.6, marginTop: 10 }}>
              Free exam prep + a complete study-abroad toolkit for students worldwide — IELTS, TOEFL, PTE, CELPIP, Duolingo, GRE &amp; GMAT mock tests, plus college predictor, scholarships, SOP &amp; visa guidance.
            </p>
            <p className="muted" style={{ fontSize: 13, marginTop: 12 }}>
              📧 <a href="mailto:support@landingprep.com" style={{ color: "var(--accent)", fontWeight: 600 }}>support@landingprep.com</a>
              {"  ·  "}<a href="/about/" style={{ color: "var(--accent)", fontWeight: 600 }}>About</a>
            </p>
          </div>
          <div>
            <h3>Exam Guides</h3>
            <ul>
              <li><a href="#/exam-hub/ielts">IELTS</a></li><li><a href="#/exam-hub/toefl">TOEFL iBT</a></li><li><a href="#/exam-hub/pte">PTE Academic</a></li><li><a href="#/exam-hub/celpip">CELPIP</a></li><li><a href="#/exam-hub/duolingo">Duolingo</a></li><li><a href="#/exam-hub/gre">GRE</a></li><li><a href="#/exam-hub/gmat">GMAT Focus</a></li>
            </ul>
          </div>
          <div>
            <h3>Practice</h3>
            <ul>
              <li><a href="#/exam-prep">Mock tests</a></li><li><a href="/ielts-writing-checker/">AI Band Checker</a></li><li><a href="/ielts-vocabulary/">Vocabulary</a></li><li><a href="/prep-lessons/">Prep Lessons</a></li><li><a href="#/learning">Learning Club</a></li><li><a href="#/agents">AI Speaking &amp; Writing</a></li>
            </ul>
          </div>
          <div>
            <h3>Resources</h3>
            <ul>
              <li><a href="/ielts-band-7/">IELTS band requirements</a></li><li><a href="/which-english-test/">Which English test? (quiz)</a></li><li><a href="#/relocate">Move Abroad checklist</a></li><li><a href="/student-city-guides/">Student city guides</a></li><li><a href="/learn-german/">Learn German &amp; French</a></li><li><a href="#/blog">Study tips & strategy</a></li><li><a href="/explore/">Explore all free pages</a></li><li><a href="#/progress">My Progress</a></li>
            </ul>
          </div>
        </div>
        <div className="colophon">
          <span>© 2026 LandingPrep. Independent prep platform — not affiliated with any test provider.</span>
          <span><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a> · <a href="/about/">About</a></span>
        </div>
      </div>
    </footer>
  );
}

window.LP_Home = Home;
window.LP_TopBar = TopBar;
window.LP_Footer = Footer;
window.LP_Logo = LPLogo;
window.LP_TAGLINE = LP_TAGLINE;
window.LP_Marquee = Marquee;
