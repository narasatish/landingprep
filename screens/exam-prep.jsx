// screens/exam-prep.jsx
//
// Exam Prep browser. Three views, controlled by internal state:
//   1) Index   — 7 exam tiles
//   2) Detail  — per-exam: "Full Mock Tests" + section tabs
//   3) Section — list of 30 test cards for the chosen section
//
// Clicking a test card calls onPractice(exam, { prebuiltConfig })
// which delegates to the existing mock-test engine.

(function () {
  const { useState, useEffect } = React;

  const EXAM_ORDER = ["ielts","toefl","pte","celpip","duolingo","gre","gmat","oet","sat"];

  const EXAM_BRAND = {
    ielts:    { color: "#dc2626", tagline: "Study, work & migration in English-speaking countries", icon: "🇬🇧" },
    toefl:    { color: "#2563eb", tagline: "Academic English for U.S. universities",                  icon: "🎓" },
    pte:      { color: "#7c3aed", tagline: "AI-scored, fast turnaround, accepted globally",            icon: "💻" },
    celpip:   { color: "#0891b2", tagline: "Canadian English for PR & citizenship",                   icon: "🍁" },
    duolingo: { color: "#16a34a", tagline: "Adaptive online English test",                            icon: "🦉" },
    gre:      { color: "#b45309", tagline: "Graduate school admissions worldwide",                    icon: "📚" },
    gmat:     { color: "#c2410c", tagline: "MBA & business school admissions",                        icon: "📊" },
    oet:      { color: "#00A86B", tagline: "English for healthcare professionals",                    icon: "🩺" },
    sat:      { color: "#2E5090", tagline: "US university admissions (Reading, Writing & Math)",       icon: "🎓" },
  };

  const SECTION_PRESENTATION = {
    listening: { name: "Listening", icon: "🎧" },
    reading:   { name: "Reading",   icon: "📖" },
    "reading-writing": { name: "Reading & Writing", icon: "📖" },
    math:      { name: "Math",      icon: "🔢" },
    english:   { name: "English",   icon: "✏️" },
    science:   { name: "Science",   icon: "🔬" },
    writing:   { name: "Writing",   icon: "✍️" },
    speaking:  { name: "Speaking",  icon: "🎤" },
    verbal:    { name: "Verbal",    icon: "📖" },
    quant:     { name: "Quantitative", icon: "🔢" },
    "data-insights": { name: "Data Insights", icon: "📊" },
    "speaking-writing": { name: "Speaking & Writing", icon: "🎤✍️" },
    adaptive:  { name: "Adaptive",      icon: "🎯" },
    literacy:  { name: "Literacy",      icon: "🔤" },
    comprehension: { name: "Comprehension", icon: "🧠" },
    conversation:  { name: "Conversation",  icon: "💬" },
    production:    { name: "Production",    icon: "🗣️" },
  };

  function setSEO(title, description) {
    if (!window.LP_SEO) return;
    window.LP_SEO.set({ title, description });
  }

  // ─────────── Index: 7 exam tiles ───────────
  function ExamIndex({ counts, onChooseExam }) {
    useEffect(() => {
      setSEO("Free Mock Tests — IELTS, TOEFL, PTE, GRE, GMAT & more | LandingPrep",
        "990+ free practice tests with answers across IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo, GRE and GMAT Focus. Real exam patterns, instant scoring.");
    }, []);
    return (
      <div className="ep-index">
        <div className="home-hero-photo ep-hero-photo">
          <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1280&q=70"
               alt="Students preparing for international exams" loading="lazy"
               onError={(e) => { const p = e.target.closest(".home-hero-photo"); if (p) p.classList.add("no-photo"); }} />
          <div className="hhp-overlay" />
          <div className="ep-hero-cap">
            <h1>Exam Prep</h1>
            <p>990 free practice tests across 7 international exams. Pick an exam to start.</p>
          </div>
        </div>
        <div className="ep-exam-grid">
          {EXAM_ORDER.map(eid => {
            const brand = EXAM_BRAND[eid];
            const c = counts?.[eid] || { sections: {}, full: 0, total: 0 };
            return (
              <button key={eid} className="ep-exam-tile" onClick={() => onChooseExam(eid)}
                      style={{ borderTopColor: brand.color }}>
                <div className="ep-exam-icon" style={{ background: brand.color + "18", color: brand.color }}>{brand.icon}</div>
                <div className="ep-exam-name">{c.label || eid.toUpperCase()}</div>
                <div className="ep-exam-tag">{brand.tagline}</div>
                <div className="ep-exam-stats">
                  <span><strong>{c.full || 0}</strong> full mocks</span>
                  <span><strong>{c.total - (c.full || 0)}</strong> section tests</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Sections hidden for a given variant (CELPIP General LS = no Reading/Writing)
  const VARIANT_HIDDEN_SECTIONS = {
    celpip: { general_ls: ["reading","writing"] },
  };

  // Sections that are IDENTICAL across variants — show ALL their tests for every
  // variant instead of filtering (IELTS Speaking is the same for Academic & GT,
  // so General Training speaking must not be empty).
  const VARIANT_AGNOSTIC_SECTIONS = {
    ielts: ["speaking"],
  };

  // ─────────── Detail: full + sections nav ───────────
  function ExamDetail({ examId, examMeta, onBack, onOpenSection, onOpenFull }) {
    const brand = EXAM_BRAND[examId] || { color: "#4f46e5", icon: "📋", tagline: "" };
    const allSections = Object.keys(examMeta?.sections || {});
    const label = examMeta?.label || examId.toUpperCase();

    // Variant selector at detail level (for CELPIP etc.)
    const variants = EXAM_VARIANTS[examId];
    const [detailVariant, setDetailVariant] = React.useState(variants ? variants[0].id : null);

    // Filter sections based on active variant
    const hiddenForVariant = (VARIANT_HIDDEN_SECTIONS[examId] || {})[detailVariant] || [];
    const sections = allSections.filter(s => !hiddenForVariant.includes(s));

    useEffect(() => {
      setSEO(`Free ${label} Mock Tests Online with Answers | LandingPrep`,
        `Free ${label} mock tests, section drills and full-length practice exams. Real exam pattern, instant scoring, model answers — no signup required.`);
    }, [label]);

    const fullCount = (examMeta?.fullMocks || []).length;

    return (
      <div className="ep-detail">
        <div className="ep-breadcrumb">
          <a onClick={(e) => { e.preventDefault(); onBack(); }} href="#/exam-prep">Exam Prep</a> <span>/</span> <span>{label}</span>
        </div>
        <div className="ep-detail-banner">
          <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=70"
               alt={label + " exam preparation"} loading="lazy"
               onError={(e) => { const p = e.target.closest(".ep-detail-banner"); if (p) p.classList.add("no-photo"); }} />
          <div className="ep-detail-tint" style={{ background: `linear-gradient(120deg, ${brand.color}e6, ${brand.color}99)` }} />
          <div className="ep-detail-cap">
            <span className="ep-detail-icon">{brand.icon}</span>
            <div><h1>{label}</h1><p>{brand.tagline}</p></div>
          </div>
        </div>

        {/* Variant selector at detail level */}
        {variants && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {variants.map(v => (
              <button key={v.id} onClick={() => setDetailVariant(v.id)} style={{
                padding: "0.35rem 1rem", borderRadius: "999px",
                border: `2px solid ${detailVariant === v.id ? brand.color : "var(--line)"}`,
                background: detailVariant === v.id ? brand.color + "18" : "var(--surface)",
                color: detailVariant === v.id ? brand.color : "var(--ink-2)",
                fontWeight: detailVariant === v.id ? 600 : 500,
                cursor: "pointer", fontSize: "0.85rem", transition: "all 0.15s",
              }}>{v.label}</button>
            ))}
          </div>
        )}

        <div className="ep-section-grid">
          <button className="ep-section-card ep-section-card--full" onClick={onOpenFull}
                  style={{ borderColor: brand.color }}>
            <div className="ep-section-icon" style={{ background: brand.color, color: "#fff" }}>📝</div>
            <div className="ep-section-name">Full Mock Tests</div>
            <div className="ep-section-count">{fullCount} full-length mocks</div>
          </button>
          {sections.map(sec => {
            const p = SECTION_PRESENTATION[sec] || { name: sec, icon: "📋" };
            const n = (examMeta.sections[sec] || []).length;
            return (
              <button key={sec} className="ep-section-card" onClick={() => onOpenSection(sec)}
                      style={{ borderColor: brand.color + "33" }}>
                <div className="ep-section-icon" style={{ background: brand.color + "18", color: brand.color }}>{p.icon}</div>
                <div className="ep-section-name">{p.name}</div>
                <div className="ep-section-count">{n} tests</div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─────────── Section list: 30 cards ───────────
  function fmtDuration(secs) {
    if (!secs) return "—";
    const h = Math.floor(secs / 3600);
    const m = Math.round((secs % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m} min`;
  }

  function SectionTestList({ examId, examLabel, section, isFullMock, onBack, onOpenTest }) {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const brand = EXAM_BRAND[examId] || { color: "#4f46e5" };
    const pres = isFullMock
      ? { name: "Full Mock Tests", icon: "📝" }
      : (SECTION_PRESENTATION[section] || { name: section, icon: "📋" });

    // Determine if this list supports variant filtering
    const variants = EXAM_VARIANTS[examId];
    // Variant-agnostic sections (e.g. IELTS Speaking) show ALL tests for any variant.
    const variantAgnostic = !isFullMock && (VARIANT_AGNOSTIC_SECTIONS[examId] || []).includes(section);
    // Show variant pills for full mocks OR any section that actually filters by variant
    const showVariantPills = !!variants && !variantAgnostic;
    const defaultVariant = variants ? variants[0].id : null;
    const [variant, setVariant] = useState(defaultVariant);

    useEffect(() => {
      setLoading(true);
      const fetcher = isFullMock
        ? window.LP_CATALOG.listFullMocks(examId)
        : window.LP_CATALOG.listTests(examId, section);
      fetcher.then(arr => { setTests(arr); setLoading(false); });
    }, [examId, section, isFullMock]);

    useEffect(() => {
      setSEO(`Free ${examLabel} ${pres.name} Practice Tests | LandingPrep`,
        `${tests.length || 30} ${examLabel} ${pres.name} practice tests with answers and model responses. Real exam pattern, browser-based, no signup.`);
    }, [examLabel, pres.name, tests.length]);

    return (
      <div className="ep-list">
        <div className="ep-breadcrumb">
          <a onClick={(e) => { e.preventDefault(); onBack(); }} href="#/exam-prep">{examLabel}</a> <span>/</span> <span>{pres.name}</span>
        </div>
        <h1 style={{ borderLeft: `4px solid ${brand.color}`, paddingLeft: 16 }}>
          <span style={{ marginRight: 10 }}>{pres.icon}</span>
          {examLabel} — {pres.name}
        </h1>
        <p className="muted">Choose any test below. Each loads on demand.</p>

        {showVariantPills && variants && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.75rem 0 1.25rem" }}>
            {variants.map(v => (
              <button
                key={v.id}
                onClick={() => setVariant(v.id)}
                style={{
                  padding: "0.35rem 1rem",
                  borderRadius: "999px",
                  border: `2px solid ${variant === v.id ? brand.color : "var(--line)"}`,
                  background: variant === v.id ? brand.color + "18" : "var(--surface)",
                  color: variant === v.id ? brand.color : "var(--ink-2)",
                  fontWeight: variant === v.id ? 600 : 500,
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "all 0.15s",
                }}
              >{v.label}</button>
            ))}
          </div>
        )}

        {loading
          ? <div className="ep-loading">Loading tests…</div>
          : (() => {
              const visible = showVariantPills
                ? tests.filter(t => (t.variant || defaultVariant) === variant)
                : tests;
              return visible.length === 0
                ? <div className="ep-empty">No tests in this bank yet.</div>
                : (
              <div className="ep-test-grid">
                {visible.map((t, i) => (
                  <article key={t.id} className="ep-test-card" style={{ borderTopColor: brand.color }}>
                    <div className="ep-test-num">{String(i + 1).padStart(2, "0")}</div>
                    <h3 className="ep-test-title">{t.title}</h3>
                    <div className="ep-test-meta">
                      <span>⏱ {fmtDuration(t.durationSeconds)}</span>
                      {t.questionCount && <span>· {t.questionCount} questions</span>}
                      {t.sectionCount && <span>· {t.sectionCount} sections</span>}
                    </div>
                    <button className="btn btn-primary ep-start-btn"
                            onClick={() => onOpenTest(t, isFullMock)}>
                      Start →
                    </button>
                  </article>
                ))}
              </div>
            );
            })()}
      </div>
    );
  }

  // Variant config per exam (for both section lists and full mocks)
  const EXAM_VARIANTS = {
    ielts:   [{ id: "academic", label: "Academic" }, { id: "general_training", label: "General Training" }],
    pte:     [{ id: "academic", label: "Academic" }, { id: "core", label: "Core" }],
    celpip:  [{ id: "general", label: "General" }, { id: "general_ls", label: "General LS" }],
    toefl:   [{ id: "ibt", label: "iBT" }],
  };

  // Derive the exam-prep view from the URL hash so every internal step
  // (index → exam → section/full) is a real history entry and Back works.
  function parseExamPrepHash() {
    const parts = (window.location.hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
    const examId = parts[1] || null;       // parts[0] === "exam-prep"
    const sub = parts[2] || null;          // section id or "full"
    if (!examId)        return { view: "index",  examId: null,  section: null, isFullMock: false };
    if (!sub)           return { view: "detail", examId,        section: null, isFullMock: false };
    if (sub === "full") return { view: "list",   examId,        section: null, isFullMock: true };
    return { view: "list", examId, section: sub, isFullMock: false };
  }

  // ─────────── Root: route between three views (hash-driven) ───────────
  function ExamPrep({ onNav, onPractice, exams, initialExamId }) {
    const [route, setRoute] = useState(parseExamPrepHash());
    const { view, examId, section, isFullMock } = route;
    const [counts, setCounts] = useState({});
    const [examMeta, setExamMeta] = useState(null);

    // Re-derive the view whenever the hash changes (covers browser/in-app Back).
    useEffect(() => {
      const onHash = () => setRoute(parseExamPrepHash());
      window.addEventListener("hashchange", onHash);
      window.addEventListener("popstate", onHash);
      return () => { window.removeEventListener("hashchange", onHash); window.removeEventListener("popstate", onHash); };
    }, []);

    useEffect(() => {
      if (!window.LP_CATALOG) return;
      window.LP_CATALOG.getCounts().then(setCounts);
    }, []);

    useEffect(() => {
      if (!examId || !window.LP_CATALOG) { setExamMeta(null); return; }
      window.LP_CATALOG.getExam(examId).then(setExamMeta);
    }, [examId]);

    // Navigation = hash changes (each becomes a history entry the user can Back through)
    const go = (h) => { if (window.location.hash !== h) window.location.hash = h; };
    const openExam = (eid) => go("#/exam-prep/" + eid);
    const openSection = (sec) => go("#/exam-prep/" + examId + "/" + sec);
    const openFull = () => go("#/exam-prep/" + examId + "/full");
    const backToDetail = () => go("#/exam-prep/" + examId);
    const backToIndex = () => go("#/exam-prep");

    const [testLoadError, setTestLoadError] = React.useState(null);

    const openTest = async (entry, isFull) => {
      setTestLoadError(null);
      try {
        if (isFull) {
          const composition = await window.LP_CATALOG.loadFullMock(entry);
          const cfg = await window.LP_NORMALIZE.buildFullMockConfig(composition, window.LP_CATALOG.loadTest);
          const exam = exams.find(e => e.id === entry.exam) || { id: entry.exam, name: examMeta?.label || entry.exam };
          onPractice(exam, { examId: entry.exam, type: "full", prebuiltConfig: cfg, source: "exam-prep" });
        } else {
          const test = await window.LP_CATALOG.loadTest(entry);
          const cfg = window.LP_NORMALIZE.normaliseTest(test);
          const exam = exams.find(e => e.id === entry.exam) || { id: entry.exam, name: examMeta?.label || entry.exam };
          onPractice(exam, { examId: entry.exam, type: cfg.testType, prebuiltConfig: cfg, source: "exam-prep" });
        }
      } catch (e) {
        const is404 = e.message && e.message.includes("404");
        setTestLoadError({
          title: is404 ? "Test Not Available Yet" : "Could Not Load Test",
          detail: is404
            ? "This test is being prepared and will be available soon. Please try another test."
            : "Something went wrong loading this test. Please refresh and try again.",
          entry,
        });
      }
    };

    return (
      <>
        <window.LP_TopBar current="exam-prep" onNav={onNav} />
        <main id="main-content">

        {/* ── Clean test-load error modal (replaces browser alert) ─────── */}
        {testLoadError && (
          <div className="test-error-overlay" onClick={() => setTestLoadError(null)}>
            <div className="test-error-card" onClick={e => e.stopPropagation()}>
              <div className="test-error-icon">⚠️</div>
              <h3 className="test-error-title">{testLoadError.title}</h3>
              <p className="test-error-detail">{testLoadError.detail}</p>
              {testLoadError.entry && (
                <p className="test-error-meta">
                  {testLoadError.entry.title || testLoadError.entry.id}
                </p>
              )}
              <button className="btn btn-primary" onClick={() => setTestLoadError(null)}>
                Back to Tests
              </button>
            </div>
          </div>
        )}

        <div className="shell" style={{ paddingTop: 32, paddingBottom: 56 }}>
          {view === "index" && (
            <ExamIndex counts={counts} onChooseExam={openExam} />
          )}
          {view === "detail" && examId && !examMeta && (
            <div className="ep-loading">Loading exam info…</div>
          )}
          {view === "detail" && examId && examMeta && (
            <ExamDetail examId={examId} examMeta={examMeta} onBack={backToIndex}
                        onOpenSection={openSection} onOpenFull={openFull} />
          )}
          {view === "list" && examId && (isFullMock || section) && (
            <SectionTestList
              key={examId + "_" + (isFullMock ? "full" : section)}
              examId={examId}
              examLabel={examMeta?.label || examId.toUpperCase()}
              section={section}
              isFullMock={isFullMock}
              onBack={backToDetail}
              onOpenTest={openTest}
            />
          )}
        </div>
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_ExamPrep = ExamPrep;
})();
