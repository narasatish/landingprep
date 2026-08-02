// Home — clean, public, common to all users (no personal stats)
const { useState: useStateH } = React;

// Brand tagline (international, premium).
const LP_TAGLINE = "From mock test to campus abroad";

// ─────────────────────────────────────────────────────────────────────────────
// HOME PRO — a scoped visual upgrade (UI/UX Pro Max). Everything below lives under
// the `.home-pro` wrapper + a single injected <style>, and uses crisp SVG icons
// instead of emoji. 100% reversible: restore screens/home.jsx.bak (or remove the
// `home-pro` class + <LPProStyles/>) and the original design returns untouched.
// ─────────────────────────────────────────────────────────────────────────────

// Crisp, consistent SVG icon set (Lucide-style, 1.75 stroke) — replaces emoji as
// structural icons (UI/UX Pro Max rule #4: no-emoji-icons / vector-only assets).
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
  compass: "M12 12m-10 0a10 10 0 1 0 20 0 10 10 0 1 0-20 0 M16.2 7.8 14 14l-6.2 2.2L10 10z",
};
function Ic({ name, size = 22, style }) {
  const d = LP_ICONS[name] || LP_ICONS.spark;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
      {d.split(" M").map((seg, i) => <path key={i} d={(i ? "M" : "") + seg} />)}
    </svg>
  );
}
// Icon "chip" — a gradient-tinted rounded square holding an SVG (consistent sizing/rhythm).
function IcChip({ name, tone = "accent" }) {
  return <span className={"pro-icchip pro-tone-" + tone} aria-hidden="true"><Ic name={name} size={22} /></span>;
}
// Expose the icon system globally so every screen shares one vector icon language.
try { window.LP_Ic = Ic; window.LP_IcChip = IcChip; window.LP_ICONS = LP_ICONS; } catch (e) {}

// The injected, scoped design layer. Restyles the existing section class-names so
// the whole page lifts cohesively, plus a refined hero. Dark-mode aware (uses the
// theme's CSS vars) and respects prefers-reduced-motion.
const LP_PRO_CSS = `
.home-pro{ --pro-grad: linear-gradient(135deg, var(--accent), var(--accent-2)); }

/* ── Hero ─────────────────────────────────────────────────────────────────── */
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

/* ── Buttons ──────────────────────────────────────────────────────────────── */
.home-pro .btn{ border-radius:13px; font-weight:650; transition:transform .14s ease, box-shadow .2s ease, background .2s ease, border-color .2s; }
.home-pro .btn:active{ transform:scale(.975); }
.home-pro .btn-primary{ background:var(--pro-grad); border:none; color:#fff;
  box-shadow:0 8px 22px -8px color-mix(in srgb, var(--accent) 70%, transparent); }
.home-pro .btn-primary:hover{ box-shadow:0 12px 30px -8px color-mix(in srgb, var(--accent) 80%, transparent); transform:translateY(-1px); }
.home-pro .btn-lg{ padding:14px 22px; font-size:16px; }

/* ── Icon chips ───────────────────────────────────────────────────────────── */
.home-pro .pro-icchip{ width:46px; height:46px; border-radius:14px; display:inline-grid; place-items:center; flex:0 0 auto;
  background:linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, transparent), color-mix(in srgb, var(--accent-2) 16%, transparent));
  color:var(--accent); border:1px solid color-mix(in srgb, var(--accent) 18%, transparent); transition:transform .18s ease; }
.home-pro .pro-tone-green{ color:var(--leaf); background:linear-gradient(135deg, color-mix(in srgb, var(--leaf) 16%, transparent), color-mix(in srgb, var(--leaf) 6%, transparent)); border-color:color-mix(in srgb, var(--leaf) 20%, transparent); }
.home-pro .pro-tone-sky{ color:#0ea5e9; background:linear-gradient(135deg, rgba(14,165,233,.16), rgba(14,165,233,.06)); border-color:rgba(14,165,233,.22); }
.home-pro .pro-tone-amber{ color:#f59e0b; background:linear-gradient(135deg, rgba(245,158,11,.18), rgba(245,158,11,.06)); border-color:rgba(245,158,11,.24); }
.home-pro .pro-tone-pink{ color:#ec4899; background:linear-gradient(135deg, rgba(236,72,153,.16), rgba(236,72,153,.06)); border-color:rgba(236,72,153,.22); }

/* ── Feature cards (bento lift) ───────────────────────────────────────────── */
.home-pro .lp-pro, .home-pro .hp-tool-card{ border-radius:18px; border:1px solid var(--line); background:var(--surface);
  transition:transform .18s ease, box-shadow .22s ease, border-color .2s ease; }
.home-pro .lp-pro:hover, .home-pro .hp-tool-card:hover{ transform:translateY(-4px);
  border-color:color-mix(in srgb, var(--accent) 40%, var(--line));
  box-shadow:0 18px 38px -20px color-mix(in srgb, var(--accent) 60%, transparent); }
.home-pro .lp-pro:hover .pro-icchip, .home-pro .hp-tool-card:hover .pro-icchip{ transform:scale(1.08) rotate(-3deg); }
.home-pro .lp-pro-ic{ margin-bottom:6px; }

/* ── Stats ────────────────────────────────────────────────────────────────── */
.home-pro .lp-stat-n{ font-weight:800; letter-spacing:-.02em; }
.home-pro .lp-stats{ gap:14px; }

/* ── Eyebrows ─────────────────────────────────────────────────────────────── */
.home-pro .eyebrow{ display:inline-flex; align-items:center; gap:8px; text-transform:uppercase; letter-spacing:.08em;
  font-size:12px; font-weight:750; color:var(--accent); }
.home-pro .eyebrow::before{ content:""; width:18px; height:2px; border-radius:2px; background:var(--pro-grad); }

/* ── Section headings get a touch more air ────────────────────────────────── */
.home-pro .h1{ letter-spacing:-.025em; }

/* ── Reduced motion ───────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce){
  .home-pro .btn, .home-pro .lp-pro, .home-pro .hp-tool-card, .home-pro .pro-icchip{ transition:none !important; }
  .home-pro .lp-pro:hover, .home-pro .hp-tool-card:hover, .home-pro .btn-primary:hover{ transform:none !important; }
}
`;
function LPProStyles() { return <style>{LP_PRO_CSS}</style>; }

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
    a: "Yes. Our Speaking Practice uses natural neural voices — you speak into your mic, get live transcripts and follow-up questions, just like a real examiner. Listening sections and Describe Image / Re-tell Lecture tasks also play real audio." },
  { q: "Do I get model answers and band-level feedback for writing?",
    a: "Every writing task — IELTS Task 1 & 2, TOEFL integrated and discussion, PTE essay, GRE issue, GMAT and CELPIP — includes a free Band 7+/CEFR C1 model answer plus live word-count and rubric guidance. Our Writing Feedback gives instant structured feedback on any essay you paste." },
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

// Real reviews — fetched from the backend and submitted by actual users. No
// fabricated testimonials: the section shows genuine reviews as they come in.
function Reviews() {
  const [reviews, setReviews] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ stars: 5, exam: "", name: "", place: "", text: "" });
  const [status, setStatus] = React.useState("");
  React.useEffect(() => {
    const base = window.LP_API_BASE || "";
    fetch(base + "/api/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews || [])).catch(() => {});
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    if (String(form.text).trim().length < 10) { setStatus("err"); return; }
    setStatus("sending");
    try {
      const base = window.LP_API_BASE || "";
      const r = await fetch(base + "/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (r.ok && d.review) {
        setReviews([d.review, ...reviews]); setStatus("ok"); setOpen(false);
        setForm({ stars: 5, exam: "", name: "", place: "", text: "" });
        try { if (window.gtag) window.gtag("event", "review_submitted"); } catch (e2) {}
      } else { setStatus("err"); }
    } catch (e2) { setStatus("err"); }
  };
  const inputStyle = { padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 14, background: "var(--surface)", color: "var(--ink)", width: "100%" };
  return (
    <div>
      <div className="testimonial-grid reveal">
        {reviews.length === 0 ? (
          <div className="trust-block reveal" style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 16 }}>
              {[["💯", "100% free"], ["🚫", "No signup to start"], ["💳", "No card needed"], ["📚", "15+ exams"], ["🌍", "9 study destinations"], ["⚡", "Instant scoring"]].map(([ic, t]) => (
                <span key={t} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, padding: "9px 15px", fontWeight: 600, fontSize: 14, boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,.05))" }}>{ic} {t}</span>
              ))}
            </div>
            <p style={{ maxWidth: 580, margin: "0 auto", color: "var(--ink-2)", fontSize: 16, lineHeight: 1.65 }}>
              Built by people who <strong>studied abroad themselves</strong> — we know the journey, so every tool is genuinely free with no catch. <strong>Be the first to share your story</strong> and help the next student decide.
            </p>
          </div>
        ) : reviews.map((t, i) => (
          <figure className="testimonial-card" key={i}>
            <div className="t-stars" aria-label={t.stars + " stars"}>{"★★★★★".slice(0, t.stars)}</div>
            <blockquote>{t.text}</blockquote>
            <figcaption>
              <span className="t-avatar" aria-hidden>{(t.name || "?")[0]}</span>
              <span>
                <span className="t-name">{t.name}</span>
                <span className="t-meta">{[t.exam, t.place].filter(Boolean).join(" · ")}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 18 }}>
        {!open && <button className="btn btn-primary" onClick={() => setOpen(true)}>✍️ Share your experience</button>}
        {status === "ok" && <p style={{ color: "var(--leaf)", marginTop: 10, fontWeight: 600 }}>Thank you — your review is live! 🎉</p>}
      </div>
      {open && (
        <form onSubmit={submit} style={{ maxWidth: 560, margin: "16px auto 0", display: "grid", gap: 10, textAlign: "left" }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Your rating
            <select value={form.stars} onChange={(e) => setForm({ ...form, stars: parseInt(e.target.value, 10) })} style={{ ...inputStyle, marginTop: 4 }}>
              {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{"★".repeat(s)} ({s})</option>)}
            </select>
          </label>
          <textarea placeholder="How did LandingPrep help you? (at least 10 characters)" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={3} required style={inputStyle} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input placeholder="Exam (e.g. IELTS)" value={form.exam} onChange={(e) => setForm({ ...form, exam: e.target.value })} style={{ ...inputStyle, flex: "1 1 120px" }} />
            <input placeholder="Name (optional)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, flex: "1 1 120px" }} />
            <input placeholder="Place (optional)" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} style={{ ...inputStyle, flex: "1 1 120px" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn-primary">{status === "sending" ? "Posting…" : "Post review"}</button>
            <button type="button" className="btn" onClick={() => setOpen(false)}>Cancel</button>
          </div>
          {status === "err" && <span style={{ color: "#dc2626", fontSize: 13 }}>Please pick a rating and write at least 10 characters.</span>}
        </form>
      )}
    </div>
  );
}

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
// Above-the-fold interactive hook: a 20-second "enter your score → instant eligibility" check.
// Reuses the CEFR mapping; converts cold visitors who already have a score.
function QuickScoreCheck({ onNav }) {
  const [exam, setExam] = React.useState("ielts");
  const [score, setScore] = React.useState("");
  const meta = PREDICTOR_EXAMS.find((e) => e.id === exam) || PREDICTOR_EXAMS[0];
  const lvl = score !== "" ? scoreToCEFR(exam, score) : null;
  const row = lvl ? CEFR_TABLE[lvl] : null;
  const fieldStyle = { padding: "11px 13px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15, background: "var(--surface-2)", color: "var(--ink)" };
  return (
    <section className="section reveal" style={{ paddingTop: 18, paddingBottom: 6 }}>
      <div className="shell">
        <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, padding: "22px 24px", boxShadow: "var(--shadow, 0 10px 28px -16px rgba(16,24,40,.18))" }}>
          <div className="eyebrow">⚡ 20-second check · no signup</div>
          <h2 className="h2" style={{ margin: "4px 0 14px" }}>Already have a score? See what you qualify for — instantly.</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <select value={exam} onChange={(e) => { setExam(e.target.value); setScore(""); }} style={fieldStyle} aria-label="Exam">
              {PREDICTOR_EXAMS.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <input type="number" inputMode="decimal" step={meta.step} min={meta.min} max={meta.max} placeholder={meta.ph}
              value={score} onChange={(e) => setScore(e.target.value)} style={{ ...fieldStyle, width: 140 }} aria-label="Your score" />
            {!row && <span style={{ color: "var(--ink-3)", fontSize: 14 }}>← enter your {meta.name} score</span>}
          </div>
          {row && (
            <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--line)" }}>
              <strong style={{ fontSize: 16, color: "var(--accent)" }}>{row.label}</strong>
              <p style={{ margin: "6px 0 12px", color: "var(--ink-2)", fontSize: 15, lineHeight: 1.6 }}>{row.elig}</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => onNav("tools")}>See full eligibility + universities →</button>
                <button className="btn" onClick={() => { try { window.LP_ShareCard && window.LP_ShareCard.make({ title: "My English level: " + meta.name + " " + score, big: lvl, label: row.label, sub: "Checked free on LandingPrep — see what you qualify for" }); } catch (e) {} }}>📤 Share</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
// "Latest guides" strip — pulls the newest posts from the lightweight blog-index.json (not the 2.6 MB
// bundle), so the homepage stays fresh as the auto-blog publishes, with crawlable links + internal SEO.
function LatestGuides() {
  const [posts, setPosts] = React.useState([]);
  React.useEffect(() => {
    fetch("/blog-index.json").then((r) => r.json()).then((d) => setPosts((Array.isArray(d) ? d : []).slice(0, 3))).catch(() => {});
  }, []);
  if (!posts.length) return null;
  return (
    <section className="section reveal" style={{ paddingTop: 22 }}>
      <div className="shell">
        <div className="section-header reveal">
          <div>
            <div className="eyebrow">📰 Fresh study-abroad guides</div>
            <h2 className="h1">Latest from the blog</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14, marginTop: 14 }}>
          {posts.map((p) => (
            <a key={p.id} href={"/blog/" + p.id + "/"} style={{ display: "block", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 20px", textDecoration: "none", color: "inherit", boxShadow: "var(--shadow-sm,0 1px 2px rgba(0,0,0,.05))" }}>
              {p.tag && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--accent)" }}>{p.tag}</span>}
              <h3 style={{ margin: "6px 0 8px", fontSize: 17, lineHeight: 1.3 }}>{p.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ink-3)", lineHeight: 1.55 }}>{p.excerpt}…</p>
              <span style={{ display: "inline-block", marginTop: 10, color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>Read guide →</span>
            </a>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <a href="/blog/" style={{ color: "var(--accent)", fontWeight: 600 }}>See all guides →</a>
        </div>
      </div>
    </section>
  );
}
// 5-second first-visit onboarding — routes a new visitor straight to their goal. Shows once
// (localStorage), non-blocking (delayed + easily dismissed), so it never hurts bounce/SEO.
// Free 2026 Scholarships & Funding Guide — real 6-page PDF (10 fully-funded scholarships,
// proof-of-funds by country, loans, timeline, saving tips). Email unlocks the download
// INSTANTLY (we never hold the file hostage on email delivery) and subscribes them to
// the weekly digest via the existing double-opt-in newsletter flow.
function GuideDownload({ source } = {}) {
  const PDF = "/marketing/2026-scholarships-funding-guide.pdf";
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState(() => { try { return localStorage.getItem("lp_guide_dl") ? "done" : "idle"; } catch (e) { return "idle"; } });
  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setState("err"); return; }
    setState("busy");
    try {
      const base = window.LP_API_BASE || "";
      fetch(base + "/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), source: "funding-guide-pdf" }) }).catch(() => {});
      try { if (window.gtag) window.gtag("event", "guide_download", { source: source || "home" }); } catch (e2) {}
    } catch (e2) {}
    try { localStorage.setItem("lp_guide_dl", "1"); } catch (e2) {}
    setState("done");
    // auto-start the download
    const a = document.createElement("a"); a.href = PDF; a.download = "2026-scholarships-funding-guide.pdf"; document.body.appendChild(a); a.click(); a.remove();
  };
  const field = { padding: "12px 14px", borderRadius: 10, border: "1px solid var(--line)", fontSize: 15, background: "var(--surface)", color: "var(--ink)", flex: "1 1 220px" };
  return (
    <section className="section reveal" style={{ paddingTop: 10 }}>
      <div className="shell">
        <div style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, var(--surface)), color-mix(in srgb, var(--accent-2) 10%, var(--surface)))", border: "1px solid var(--line)", borderRadius: 18, padding: "24px 26px", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px" }}>
            <div className="eyebrow">Free PDF guide · 2026</div>
            <h2 className="h2" style={{ margin: "4px 0 6px" }}>Scholarships &amp; Funding Guide 2026</h2>
            <p className="muted" style={{ margin: 0, maxWidth: 520 }}>10 fully-funded scholarships (DAAD, Chevening, Fulbright…), exact proof-of-funds by country, education-loan basics and a month-by-month application timeline — in one free 6-page PDF.</p>
          </div>
          <div style={{ flex: "1 1 300px" }}>
            {state === "done" ? (
              <div>
                <p style={{ margin: "0 0 10px", fontWeight: 650, color: "var(--leaf)" }}>✅ Your guide is downloading.</p>
                <a className="btn btn-primary" href={PDF} download>⬇️ Download again</a>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={field} aria-label="Email for the free guide" />
                <button type="submit" className="btn btn-primary" disabled={state === "busy"}>{state === "busy" ? "…" : "Get the free PDF →"}</button>
                {state === "err" && <span style={{ color: "#dc2626", fontSize: 13, flexBasis: "100%" }}>Enter a valid email address.</span>}
                <span style={{ fontSize: 12, color: "var(--ink-3)", flexBasis: "100%" }}>Instant download. We'll also send the free weekly study-abroad digest — unsubscribe anytime.</span>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
function GoalOnboarding({ onNav }) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    try { if (!localStorage.getItem("lp_onboarded")) { const t = setTimeout(() => setShow(true), 1400); return () => clearTimeout(t); } } catch (e) {}
  }, []);
  if (!show) return null;
  const done = (goal, nav) => { try { localStorage.setItem("lp_onboarded", goal || "skip"); } catch (e) {} setShow(false); if (nav) onNav(nav); };
  const opts = [
    ["🎓", "Study abroad", "Universities, scholarships & visa", "colleges"],
    ["📝", "Crack an exam", "IELTS, TOEFL, OET, PTE, GRE & more", "exam-prep"],
    ["🌍", "Check my English level", "Score → CEFR → what I qualify for", "tools"],
  ];
  return (
    <div onClick={() => done("skip")} style={{ position: "fixed", inset: 0, background: "rgba(8,12,30,0.62)", backdropFilter: "blur(3px)", zIndex: 9999, display: "grid", placeItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "26px 24px", maxWidth: 460, width: "100%", boxShadow: "0 30px 70px -20px rgba(0,0,0,.55)" }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--accent)", letterSpacing: ".06em" }}>👋 WELCOME — TAKES 5 SECONDS</div>
        <h2 style={{ margin: "6px 0 4px", fontSize: 24, letterSpacing: "-.02em" }}>What brings you here?</h2>
        <p style={{ margin: "0 0 16px", color: "var(--ink-3, #667085)", fontSize: 14 }}>We'll take you straight to the right place. Everything's free — no signup.</p>
        <div style={{ display: "grid", gap: 10 }}>
          {opts.map(([ic, t, d, nav]) => (
            <button key={t} onClick={() => done(t, nav)} style={{ display: "flex", gap: 14, alignItems: "center", textAlign: "left", padding: "14px 16px", borderRadius: 14, border: "1px solid var(--line)", background: "var(--surface-2)", cursor: "pointer", transition: "border-color .15s, transform .15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.transform = "none"; }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>{ic}</span>
              <span><span style={{ display: "block", fontWeight: 700, fontSize: 16 }}>{t}</span><span style={{ fontSize: 13, color: "var(--ink-3, #667085)" }}>{d}</span></span>
              <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: 18 }}>→</span>
            </button>
          ))}
        </div>
        <button onClick={() => done("skip")} style={{ display: "block", margin: "14px auto 0", background: "none", border: "none", color: "var(--ink-3, #667085)", fontSize: 14, cursor: "pointer", textDecoration: "underline" }}>Just exploring — skip</button>
      </div>
    </div>
  );
}
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

// Returning-user bar — surfaces streak (#6) + a one-tap resume (#7). Shows ONLY to
// users with prior activity, so first-time visitors get the clean hero unchanged.
function ReturningBar({ onNav }) {
  const [s, setS] = React.useState(null);
  React.useEffect(() => {
    try {
      const g = window.LP_Gamify && window.LP_Gamify.stats ? window.LP_Gamify.stats() : null;
      if (g && (g.tests > 0 || g.activeDays > 0)) setS(g);
    } catch (e) {}
  }, []);
  if (!s) return null;
  return (
    <div className="returning-bar reveal" role="region" aria-label="Your progress">
      <span className="rb-item"><span style={{ fontSize: 18 }}>{s.streak > 0 ? "🔥" : "✨"}</span> <b>{s.streak}-day</b> streak</span>
      <span className="rb-item">{s.levelEmoji} Lvl {s.level} · {s.xp} XP</span>
      <span className="rb-item rb-quest">{s.studiedToday ? "✅ Today's goal done — streak safe" : "🎯 Practise once today to keep your streak"}</span>
      <button className="rb-cta" onClick={() => onNav("exam-prep")}>Continue practising →</button>
    </div>
  );
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
    return !isWork || /study|admission|universit|mba|graduate|college|academic|school/.test(s); // study
  };
  React.useEffect(() => {
    if (!window.LP_SEO) return;
    window.LP_SEO.set({
      title: "Free IELTS, TOEFL, OET, PTE, GRE & GMAT Mock Tests | LandingPrep",
      description: "1,000+ free practice tests across 15+ exams — IELTS, TOEFL, OET, PTE, GRE, GMAT, SAT & more. Real exam patterns, instant scoring & AI band feedback — no signup."
    });
  }, []);
  const faqActive = faqTab === "abroad" ? STUDY_FAQS : FAQS;
  return (
    <>
      <LPProStyles />
      <window.LP_TopBar current="home" onNav={onNav} />
      <window.LP_Marquee />

      <GoalOnboarding onNav={onNav} />
      <main id="main-content" className="home-pro">
      <div className="shell"><ReturningBar onNav={onNav} /></div>
      {/* Hero */}
      <section className="hero">
        <div className="shell">
          <div className="hero-inner-clean">
            <div className="hero-meta">
              <span className="chip"><span className="dot" style={{ background: "var(--leaf)" }} /> Trusted by students worldwide</span>
              <span className="chip">100% free</span>
              <span className="chip">No signup</span>
            </div>
            <div className="hero-tagline"><Ic name="globe" size={15} /> {LP_TAGLINE}</div>
            <h1 className="display">
              Prep for your exam.<br />Land your <em className="grad">dream university</em> abroad.
            </h1>
            <p className="body-lg muted" style={{ maxWidth: 760, marginTop: 18, marginInline: "auto" }}>
              1,000+ free mock tests across 15+ exams — IELTS, TOEFL, OET, PTE, GRE, GMAT, SAT &amp; more — plus a complete study-abroad toolkit: college predictor, scholarships, SOP &amp; visa guidance. All free, for students in every country.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => onNav("exam-prep")}>Browse all mock tests →</button>
              <button className="btn btn-lg" onClick={() => { window.location.hash = "#/colleges/onboard"; onNav("colleges"); }}><Ic name="rocket" size={17} style={{ marginRight: 7, verticalAlign: "-3px" }} />Build my study-abroad plan</button>
              <button className="btn btn-lg" onClick={() => window.LP_REFERRAL && window.LP_REFERRAL.invite()} title="Share free prep with a friend">Invite a friend</button>
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
            {[[exams.length + "+", "exams covered", "var(--accent)"], ["1,000+", "free mock tests", "#16a34a"], ["99", "universities", "#0284c7"], ["100%", "free, forever", "#b45309"], ["9", "study destinations", "#ec4899"]].map(([n, l, c]) => (
              <div className="lp-stat" key={l}><span className="lp-stat-n" style={{ color: c }}>{n}</span><span className="lp-stat-l">{l}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* Above-the-fold interactive hook — instant score → eligibility */}
      <QuickScoreCheck onNav={onNav} />

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
              ["file", "accent", "1,000+ realistic mocks", "Real timings & patterns across all 15+ exams with instant scoring.", "exam-prep"],
              ["mic", "pink", "Speaking practice", "Speak into your mic, get live transcripts, follow-ups & fluency scoring.", "agents"],
              ["pen", "sky", "AI band-score checker", "Paste an essay or record a Part 2 — instant IELTS band, TR/CC/LR/GRA breakdown & Band 9 model.", "writing-checker"],
              ["building", "accent", "College Predictor", "99 top universities with fees, requirements & Safe/Target/Reach matches.", "colleges"],
              ["wallet", "green", "Scholarships & loans", "Country-based scholarship finder and a 10-lender education-loan compare.", "colleges"],
              ["stamp", "amber", "Visa, PR & immigration", "Visa types, settlement options and a step-by-step student→PR roadmap.", "colleges"],
              ["calendar", "sky", "Personalised study plan", "A real week-by-week schedule built around your weakest sections.", "tools"],
              ["chart", "green", "Progress & analytics", "Track scores, streaks and skill splits across every exam — on any device.", "progress"],
            ].map(([icon, tone, title, desc, nav]) => (
              <button className="lp-pro" key={title} onClick={() => onNav(nav)}>
                <span className="lp-pro-ic"><IcChip name={icon} tone={tone} /></span>
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
              <h2 className="h1">Every major exam. One free platform.</h2>
              <p className="muted" style={{ maxWidth: 640, marginTop: 10 }}>
                Click any exam to open its complete prep hub — pattern, registration, fees, score guide, mock tests, tips, and FAQs.
              </p>
            </div>
          </div>

          <div className="exam-filter reveal" style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "0 0 16px" }}>
            {[["all", "All exams"], ["study", "🎓 Study & admissions"], ["work", "🛂 Work & PR"]].map(([f, label]) => (
              <button key={f} onClick={() => setExamFilter(f)}
                style={{ padding: "8px 16px", borderRadius: 999, fontWeight: 600, fontSize: 14, cursor: "pointer",
                  border: "1px solid " + (examFilter === f ? "var(--accent)" : "var(--line)"),
                  background: examFilter === f ? "var(--accent)" : "var(--surface)",
                  color: examFilter === f ? "#fff" : "var(--ink)" }}>{label}</button>
            ))}
          </div>
          <ul className="exam-list-simple reveal">
            {exams.filter((e) => examMatchesFilter(e, examFilter)).map((e) => {
              const isNew = e.id === "oet";
              const isPopular = POPULAR_EXAMS.includes(e.id);
              return (
              <li key={e.id}>
                <a href="#" onClick={(ev) => { ev.preventDefault(); onGuide(e); }}
                   style={{ borderLeft: "3px solid " + e.colour }}>
                  <span className="el-dot" style={{ background: e.colour, boxShadow: "0 0 0 4px " + e.colour + "26" }} />
                  <span className="el-name">{e.name}</span>
                  {isNew && <span className="el-new">NEW</span>}
                  {!isNew && isPopular && <span className="el-new" style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)", boxShadow: "0 2px 8px -2px rgba(239,68,68,.5)" }}>POPULAR</span>}
                  <span className="el-tag">{e.tagline}</span>
                  <span className="el-arrow" style={{ color: e.colour }}>→</span>
                </a>
              </li>
            );})}
          </ul>
        </div>
      </section>

      {/* Compare, convert & plan — surfaces the free static guides (comparisons,
          score converter, eligibility, scholarships, PR) for users + crawlers. */}
      <section className="section" style={{ paddingTop: 28 }}>
        <div className="shell">
          <div className="section-header reveal">
            <div>
              <div className="eyebrow">Compare, convert &amp; plan — free</div>
              <h2 className="h1">Pick the right test, hit the right score.</h2>
              <p className="muted" style={{ maxWidth: 660, marginTop: 10 }}>
                Free, in-depth guides to help you choose between exams, convert your score across every test, and find the exact score — and scholarships — your country and university want.
              </p>
            </div>
          </div>
          <div className="hp-tools-grid reveal">
            {[
              ["compare", "accent", "Compare the tests", "IELTS vs PTE, IELTS vs TOEFL, GRE vs GMAT — side by side, with which to take.", "/english-test-comparisons/"],
              ["refresh", "sky", "Score converter", "Convert IELTS ↔ TOEFL ↔ PTE ↔ CEFR ↔ Duolingo with a full concordance table.", "/tools/english-test-score-converter/"],
              ["globe", "accent", "Score needed by country", "The exact English-test & admission score each country and university expects.", "/eligibility/"],
              ["wallet", "green", "Scholarships by country", "Fully-funded and merit awards with eligibility, amounts and deadlines.", "/fully-funded-scholarships/"],
              ["stamp", "amber", "Test scores for PR & visa", "IELTS, PTE & CELPIP scores for Canada, Australia & UK immigration.", "/ielts-for-canada-pr/"],
              ["money", "green", "Cost of studying abroad", "Add up tuition, living, visa & flights with the free cost calculator.", "/tools/cost-of-studying-abroad-calculator/"],
              ["stamp", "amber", "Visa interview questions", "Real F-1, UK, Canada & Australia student-visa questions, answered.", "/visa-interview/"],
              ["pen", "pink", "SOP & LOR samples", "Complete statement-of-purpose & recommendation samples to adapt.", "/sop-samples/"],
              ["calendar", "sky", "Intakes & deadlines", "When to apply — intake seasons & deadlines for every country.", "/intakes/"],
              ["target", "accent", "IELTS band calculator", "Enter your four section scores → your official overall IELTS band, instantly.", "/tools/ielts-band-score-calculator/"],
              ["compare", "sky", "CGPA to percentage", "Convert CGPA/SGPA to a percentage using your university's exact formula.", "/tools/cgpa-to-percentage-calculator/"],
              ["target", "green", "Percentage to US GPA", "Estimate your US 4.0 GPA from an Indian percentage — the band method universities use.", "/tools/percentage-to-gpa-calculator/"],
              ["refresh", "amber", "IELTS One Skill Retake", "See which single IELTS skill to retake to hit your target band — plus the 2026 OSR rules.", "/tools/ielts-one-skill-retake-calculator/"],
              ["clock", "pink", "Reading speed test", "Time your reading and build the 200+ wpm pace IELTS, TOEFL & GRE reward.", "/tools/reading-speed-test/"],
              ["check", "green", "Eligibility checker", "Enter your test score + destination to see if you clear the typical minimum.", "/tools/university-eligibility-checker/"],
              ["chart", "sky", "GRE percentile calculator", "Turn your GRE Verbal, Quant & Writing scores into official ETS percentiles.", "/tools/gre-score-percentile-calculator/"],
            ].map(([ic, tone, t, d, href]) => (
              <a key={href + t} className="hp-tool-card" href={href} style={{ textDecoration: "none" }}>
                <span className="hp-tool-ic"><IcChip name={ic} tone={tone} /></span>
                <span className="hp-tool-t">{t}</span>
                <span className="hp-tool-d">{d}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification: XP / level / streak (retention) — signed-in users only */}
      {window.LP_GamifyCard && window.LP_AUTH && window.LP_AUTH.getUser() ? (
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
              ["target", "accent", "Band Checker", "Instant IELTS Writing/Speaking band + Band 9 model", "writing-checker"],
              ["book", "sky", "Vocabulary by topic", "Band-9 words with audio for every IELTS topic", "vocabulary"],
              ["chart", "green", "Prep Lessons", "600+ PPT strategy slides for all 7 exams", "learn"],
              ["plane", "pink", "Move Abroad", "Pre-departure checklist, visa timeline & city guides", "relocate"],
            ].map(([ic, tone, t, d, id]) => (
              <button key={id} className="hp-tool-card" onClick={() => onNav(id)}>
                <span className="hp-tool-ic"><IcChip name={ic} tone={tone} /></span>
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
              <button className="btn" onClick={() => onNav("agents")}>Try Speaking & Writing</button>
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
          <Reviews />
        </div>
      </section>

      {/* Latest guides strip — fresh auto-blog content */}
      <LatestGuides />

      {/* Free 2026 funding guide — real value for email (instant download) */}
      <GuideDownload />

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
          <div className="card-signup reveal" style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 320px" }}>
              <div className="eyebrow">Optional · Free account</div>
              <h2 className="h2" style={{ marginTop: 4 }}>Track your progress over time</h2>
              <p className="muted" style={{ marginTop: 6, maxWidth: 540 }}>
                Sign in to save your test history, track streaks, see skill splits across all exams, and continue where you left off — on any device.
              </p>
              <button className="btn btn-primary btn-lg" style={{ marginTop: 16 }} onClick={() => onNav("login")}>Create free account</button>
            </div>
            {/* Dashboard preview mockup — gives the section a visual so sign-up feels tangible */}
            <div aria-hidden="true" style={{ flex: "0 0 300px", maxWidth: 300, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: 18, boxShadow: "var(--shadow, 0 10px 28px -14px rgba(16,24,40,.18))" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: "#b45309" }}>🔥 7-day streak</span>
                <span style={{ color: "var(--ink-3)" }}>Level 4 · 532 XP</span>
              </div>
              <svg viewBox="0 0 260 80" style={{ width: "100%", height: 78, marginTop: 12 }}>
                <polyline points="0,66 43,58 86,60 130,42 173,34 216,22 260,10" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {[[0,66],[43,58],[86,60],[130,42],[173,34],[216,22],[260,10]].map(([x,y],i)=>(<circle key={i} cx={x} cy={y} r="3.5" fill="var(--accent)" />))}
              </svg>
              <div style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 600, margin: "2px 0 12px" }}>IELTS band trend · last 7 mocks</div>
              {[["Listening", 86, "#16a34a"], ["Reading", 74, "#0ea5e9"], ["Writing", 62, "#f59e0b"]].map(([s, w, c]) => (
                <div key={s} style={{ marginBottom: 9 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}><span>{s}</span><span style={{ color: "var(--ink)", fontWeight: 700 }}>{w}%</span></div>
                  <div style={{ height: 7, borderRadius: 999, background: "var(--line)" }}><div style={{ width: w + "%", height: "100%", borderRadius: 999, background: c }} /></div>
                </div>
              ))}
            </div>
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
              <strong>LandingPrep</strong> is a 100% free platform that takes you from your first mock test all the way to your campus abroad. Practise <a href="#/exam-hub/ielts" onClick={(e)=>{e.preventDefault();onGuide(exams[0]);}}>IELTS</a>, TOEFL iBT, PTE Academic, CELPIP, the Duolingo English Test, GRE and GMAT Focus with 1,000+ full-length <a href="#/exam-prep" onClick={(e)=>{e.preventDefault();onNav("exam-prep");}}>mock tests</a> built on real exam timings and section-honest scoring — plus free speaking and writing practice with model answers. There is no signup, no credit card and no paywall.
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
  // Slim primary nav (5 items). Exam Hub is folded into "Exams"; Speaking & Writing and
  // Progress live in the profile menu + mobile drawer.
  // "Mock Tests" + "Exam Guides" are merged into one "Exams" destination: the exam hub
  // lists every exam with its mocks AND a guide link per tile — one intent, one place.
  const items = [
    ["home", "Home"],
    ["exam-prep", "Exams"],
    ["learn", "Learn"],
    ["colleges", "Study Abroad"],
    ["tools", "Tools"],
    ["languages", "Languages"],
    ["blog", "Blog"],
  ];
  // The slide-out drawer (mobile) offers the full set for discoverability.
  const drawerItems = [
    ["home", "Home"],
    ["exam-prep", "📝 Exams (mocks + guides)"],
    ["learn", "📚 Learn (Lessons + Club)"],
    ["writing-checker", "🎯 Band-Score Checker"],
    ["vocabulary", "📖 Vocabulary"],
    ["achievements", "🏆 Achievements & XP"],
    ["agents", "Speaking & Writing"],
    ["colleges", "Study Abroad"],
    ["relocate", "✈️ Move Abroad (checklist + visa)"],
    ["tools", "Tools"],
    ["languages", "Learn German, French & Spanish"],
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
            <button className="brand" onClick={() => onNav && onNav("home")} style={{ background: "transparent" }} aria-label="LandingPrep — home">
              <LPLogo size={32} />
              <span className="brand-name">LandingPrep</span>
            </button>
          </div>
          <nav className="nav">
            {items.map(([id, label]) => (
              <a key={id} className={(current === id || (id === "exam-prep" && current === "exams")) ? "is-on" : ""} onClick={(e) => { e.preventDefault(); onNav && onNav(id); }} href="#">{label}</a>
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
            <button className="drawer-close" aria-label="Close menu" onClick={() => setOpen(false)}>×</button>
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
  const [nlEmail, setNlEmail] = React.useState("");
  const [nlStatus, setNlStatus] = React.useState(""); // "" | sending | ok | err
  const subscribe = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(nlEmail)) { setNlStatus("err"); return; }
    setNlStatus("sending");
    try {
      const base = window.LP_API_BASE || "";
      const r = await fetch(base + "/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: nlEmail, source: "footer" }) });
      if (r.ok) { setNlStatus("ok"); setNlEmail(""); try { if (window.gtag) window.gtag("event", "newsletter_signup", { source: "footer" }); } catch (e2) {} }
      else setNlStatus("err");
    } catch (e2) { setNlStatus("err"); }
  };
  const [pushStatus, setPushStatus] = React.useState("");
  const enablePush = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !window.LP_VAPID_PUBLIC) { setPushStatus("unsupported"); return; }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setPushStatus("denied"); return; }
      const reg = await navigator.serviceWorker.ready;
      const b64 = window.LP_VAPID_PUBLIC, pad = "=".repeat((4 - (b64.length % 4)) % 4);
      const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
      const key = new Uint8Array(raw.length); for (let i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i);
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      const base = window.LP_API_BASE || "";
      await fetch(base + "/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub }) });
      setPushStatus("ok");
      try { if (window.gtag) window.gtag("event", "push_enabled"); } catch (e2) {}
    } catch (e2) { setPushStatus("err"); }
  };
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
              {"  ·  "}<a href="https://www.instagram.com/landing_prep/" target="_blank" rel="me noopener" aria-label="LandingPrep on Instagram" style={{ color: "var(--accent)", fontWeight: 600 }}>📸 Instagram</a>
            </p>
            <form onSubmit={subscribe} aria-label="Newsletter signup" style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 380 }}>
              <input type="email" value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} placeholder="Email for free weekly study tips" aria-label="Email address"
                style={{ flex: "1 1 170px", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--line)", fontSize: 14, background: "var(--surface)", color: "var(--ink)" }} />
              <button type="submit" className="btn btn-primary" style={{ padding: "10px 16px" }}>{nlStatus === "sending" ? "…" : "Get tips"}</button>
              {nlStatus === "ok" && <span style={{ fontSize: 13, color: "var(--leaf)", width: "100%" }}>✅ Subscribed — check your inbox!</span>}
              {nlStatus === "err" && <span style={{ fontSize: 13, color: "#dc2626", width: "100%" }}>Please enter a valid email.</span>}
            </form>
            {pushStatus === "ok"
              ? <p style={{ fontSize: 13, color: "var(--leaf)", marginTop: 10 }}>🔔 Reminders on — see you tomorrow!</p>
              : <button onClick={enablePush} className="btn" style={{ marginTop: 10, padding: "9px 14px", fontSize: 13 }}>🔔 Daily practice reminder</button>}
            {pushStatus === "denied" && <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Enable notifications in your browser settings to get reminders.</p>}
            {pushStatus === "unsupported" && <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>Reminders aren't supported on this browser/device.</p>}
            {window.LP_PLAY_URL ? (
              <a href={window.LP_PLAY_URL} target="_blank" rel="noopener" aria-label="Get the LandingPrep app on Google Play"
                onClick={() => { try { if (window.gtag) window.gtag("event", "get_app_click"); } catch (e) {} }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, background: "#000", color: "#fff", borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, textDecoration: "none", minHeight: 40 }}>
                ▶ Get the app on Google Play
              </a>
            ) : null}
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
              <li><a href="#/exam-prep">Mock tests</a></li><li><a href="/ielts-writing-checker/">Band Checker</a></li><li><a href="/ielts-vocabulary/">Vocabulary</a></li><li><a href="/prep-lessons/">Prep Lessons</a></li><li><a href="#/learning">Learning Club</a></li><li><a href="#/agents">Speaking &amp; Writing</a></li>
            </ul>
          </div>
          <div>
            <h3>Resources</h3>
            <ul>
              <li><a href="/ielts-band-7/">IELTS band requirements</a></li><li><a href="/which-english-test/">Which English test? (quiz)</a></li><li><a href="#/relocate">Move Abroad checklist</a></li><li><a href="/student-city-guides/">Student city guides</a></li><li><a href="/learn-german/">Learn German, French &amp; Spanish</a></li><li><a href="#/blog">Study tips & strategy</a></li><li><a href="/explore/">Explore all free pages</a></li><li><a href="#/progress">My Progress</a></li>
            </ul>
          </div>
          <div>
            <h3>Compare &amp; Plan</h3>
            <ul>
              <li><a href="/english-test-comparisons/">Compare all tests</a></li><li><a href="/ielts-vs-pte/">IELTS vs PTE</a></li><li><a href="/ielts-vs-toefl/">IELTS vs TOEFL</a></li><li><a href="/tools/english-test-score-converter/">Score converter</a></li><li><a href="/eligibility/">Score needed by country</a></li><li><a href="/fully-funded-scholarships/">Scholarships by country</a></li><li><a href="/ielts-for-canada-pr/">Test scores for PR &amp; visa</a></li>
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
window.LP_GuideDownload = GuideDownload; // email-gated funding-guide PDF, reused on other pages
window.LP_TopBar = TopBar;
window.LP_Footer = Footer;
window.LP_Logo = LPLogo;
window.LP_TAGLINE = LP_TAGLINE;
window.LP_Marquee = Marquee;
