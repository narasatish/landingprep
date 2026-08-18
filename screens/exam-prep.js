(function() {
  const { useState, useEffect } = React;
  const EXAM_ORDER = ["ielts", "toefl", "pte", "celpip", "duolingo", "gre", "gmat", "oet", "sat", "act"];
  const EXAM_BRAND = {
    ielts: { color: "#dc2626", tagline: "Study, work & migration in English-speaking countries", icon: "\u{1F1EC}\u{1F1E7}" },
    toefl: { color: "#2563eb", tagline: "Academic English for U.S. universities", icon: "\u{1F393}" },
    pte: { color: "#7c3aed", tagline: "AI-scored, fast turnaround, accepted globally", icon: "\u{1F4BB}" },
    celpip: { color: "#0891b2", tagline: "Canadian English for PR & citizenship", icon: "\u{1F341}" },
    duolingo: { color: "#16a34a", tagline: "Adaptive online English test", icon: "\u{1F989}" },
    gre: { color: "#b45309", tagline: "Graduate school admissions worldwide", icon: "\u{1F4DA}" },
    gmat: { color: "#c2410c", tagline: "MBA & business school admissions", icon: "\u{1F4CA}" },
    oet: { color: "#00A86B", tagline: "English for healthcare professionals", icon: "\u{1FA7A}" },
    sat: { color: "#2E5090", tagline: "US university admissions (Reading, Writing & Math)", icon: "\u{1F393}" },
    act: { color: "#E03C31", tagline: "US admissions \u2014 English, Math, Reading & Science", icon: "\u{1F4DD}" }
  };
  const SECTION_PRESENTATION = {
    listening: { name: "Listening", icon: "\u{1F3A7}" },
    reading: { name: "Reading", icon: "\u{1F4D6}" },
    "reading-writing": { name: "Reading & Writing", icon: "\u{1F4D6}" },
    math: { name: "Math", icon: "\u{1F522}" },
    english: { name: "English", icon: "\u270F\uFE0F" },
    science: { name: "Science", icon: "\u{1F52C}" },
    writing: { name: "Writing", icon: "\u270D\uFE0F" },
    speaking: { name: "Speaking", icon: "\u{1F3A4}" },
    verbal: { name: "Verbal", icon: "\u{1F4D6}" },
    quant: { name: "Quantitative", icon: "\u{1F522}" },
    "data-insights": { name: "Data Insights", icon: "\u{1F4CA}" },
    "speaking-writing": { name: "Speaking & Writing", icon: "\u{1F3A4}\u270D\uFE0F" },
    adaptive: { name: "Adaptive", icon: "\u{1F3AF}" },
    literacy: { name: "Literacy", icon: "\u{1F524}" },
    comprehension: { name: "Comprehension", icon: "\u{1F9E0}" },
    conversation: { name: "Conversation", icon: "\u{1F4AC}" },
    production: { name: "Production", icon: "\u{1F5E3}\uFE0F" }
  };
  function setSEO(title, description) {
    if (!window.LP_SEO) return;
    window.LP_SEO.set({ title, description });
  }
  function ExamIndex({ counts, onChooseExam }) {
    useEffect(() => {
      setSEO(
        "Free Mock Tests \u2014 IELTS, TOEFL, PTE, GRE, GMAT & more | LandingPrep",
        "5,400+ free practice questions with answers across IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo, GRE and GMAT Focus. Real exam patterns, instant scoring."
      );
    }, []);
    return /* @__PURE__ */ React.createElement("div", { className: "ep-index" }, /* @__PURE__ */ React.createElement("div", { className: "home-hero-photo ep-hero-photo" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1280&q=70",
        alt: "Students preparing for international exams",
        loading: "lazy",
        onError: (e) => {
          const p = e.target.closest(".home-hero-photo");
          if (p) p.classList.add("no-photo");
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "hhp-overlay" }), /* @__PURE__ */ React.createElement("div", { className: "ep-hero-cap" }, /* @__PURE__ */ React.createElement("h1", null, "Exam Prep"), /* @__PURE__ */ React.createElement("p", null, "5,400+ free practice questions across 7 international exams. Pick an exam to start."))), /* @__PURE__ */ React.createElement("div", { className: "ep-exam-grid" }, EXAM_ORDER.map((eid) => {
      const brand = EXAM_BRAND[eid];
      const c = (counts == null ? void 0 : counts[eid]) || { sections: {}, full: 0, total: 0 };
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: eid,
          className: "ep-exam-tile",
          onClick: () => onChooseExam(eid),
          style: { borderTopColor: brand.color }
        },
        /* @__PURE__ */ React.createElement("div", { className: "ep-exam-icon", style: { background: brand.color + "18", color: brand.color } }, brand.icon),
        /* @__PURE__ */ React.createElement("div", { className: "ep-exam-name" }, c.label || eid.toUpperCase()),
        /* @__PURE__ */ React.createElement("div", { className: "ep-exam-tag" }, brand.tagline),
        /* @__PURE__ */ React.createElement("div", { className: "ep-exam-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, c.full || 0), " full mocks"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, c.total - (c.full || 0)), " section tests")),
        /* @__PURE__ */ React.createElement(
          "span",
          {
            className: "ep-exam-guide",
            role: "link",
            tabIndex: 0,
            onClick: (e) => {
              e.stopPropagation();
              window.location.hash = "#/exam-hub/" + eid;
            },
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                e.stopPropagation();
                window.location.hash = "#/exam-hub/" + eid;
              }
            },
            style: { display: "inline-block", marginTop: 10, fontSize: 13, fontWeight: 650, color: brand.color, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer" }
          },
          "\u{1F4D6} Guide \u2014 pattern, fees & tips"
        )
      );
    })));
  }
  const VARIANT_HIDDEN_SECTIONS = {
    celpip: { general_ls: ["reading", "writing"] }
  };
  const VARIANT_AGNOSTIC_SECTIONS = {
    ielts: ["speaking", "listening"]
  };
  function ExamDetail({ examId, examMeta, onBack, onOpenSection, onOpenFull }) {
    const brand = EXAM_BRAND[examId] || { color: "#4f46e5", icon: "\u{1F4CB}", tagline: "" };
    const allSections = Object.keys((examMeta == null ? void 0 : examMeta.sections) || {});
    const label = (examMeta == null ? void 0 : examMeta.label) || examId.toUpperCase();
    const variants = EXAM_VARIANTS[examId];
    const [detailVariant, setDetailVariant] = React.useState(variants ? variants[0].id : null);
    const hiddenForVariant = (VARIANT_HIDDEN_SECTIONS[examId] || {})[detailVariant] || [];
    const sections = allSections.filter((s) => !hiddenForVariant.includes(s));
    useEffect(() => {
      setSEO(
        `Free ${label} Mock Tests Online with Answers | LandingPrep`,
        `Free ${label} mock tests, section drills and full-length practice exams. Real exam pattern, instant scoring, model answers \u2014 no signup required.`
      );
    }, [label]);
    const fullCount = ((examMeta == null ? void 0 : examMeta.fullMocks) || []).length;
    return /* @__PURE__ */ React.createElement("div", { className: "ep-detail" }, /* @__PURE__ */ React.createElement("div", { className: "ep-breadcrumb" }, /* @__PURE__ */ React.createElement("a", { onClick: (e) => {
      e.preventDefault();
      onBack();
    }, href: "#/exam-prep" }, "Exam Prep"), " ", /* @__PURE__ */ React.createElement("span", null, "/"), " ", /* @__PURE__ */ React.createElement("span", null, label)), /* @__PURE__ */ React.createElement("div", { className: "ep-detail-banner" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=70",
        alt: label + " exam preparation",
        loading: "lazy",
        onError: (e) => {
          const p = e.target.closest(".ep-detail-banner");
          if (p) p.classList.add("no-photo");
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "ep-detail-tint", style: { background: `linear-gradient(120deg, ${brand.color}e6, ${brand.color}99)` } }), /* @__PURE__ */ React.createElement("div", { className: "ep-detail-cap" }, /* @__PURE__ */ React.createElement("span", { className: "ep-detail-icon" }, brand.icon), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, label), /* @__PURE__ */ React.createElement("p", null, brand.tagline)))), variants && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" } }, variants.map((v) => /* @__PURE__ */ React.createElement("button", { key: v.id, onClick: () => setDetailVariant(v.id), style: {
      padding: "0.35rem 1rem",
      borderRadius: "999px",
      border: `2px solid ${detailVariant === v.id ? brand.color : "var(--line)"}`,
      background: detailVariant === v.id ? brand.color + "18" : "var(--surface)",
      color: detailVariant === v.id ? brand.color : "var(--ink-2)",
      fontWeight: detailVariant === v.id ? 600 : 500,
      cursor: "pointer",
      fontSize: "0.85rem",
      transition: "all 0.15s"
    } }, v.label))), /* @__PURE__ */ React.createElement("div", { className: "ep-section-grid" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "ep-section-card ep-section-card--full",
        onClick: onOpenFull,
        style: { borderColor: brand.color }
      },
      /* @__PURE__ */ React.createElement("div", { className: "ep-section-icon", style: { background: brand.color, color: "#fff" } }, "\u{1F4DD}"),
      /* @__PURE__ */ React.createElement("div", { className: "ep-section-name" }, "Full Mock Tests"),
      /* @__PURE__ */ React.createElement("div", { className: "ep-section-count" }, fullCount, " full-length mocks")
    ), sections.map((sec) => {
      const p = SECTION_PRESENTATION[sec] || { name: sec, icon: "\u{1F4CB}" };
      const n = (examMeta.sections[sec] || []).length;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: sec,
          className: "ep-section-card",
          onClick: () => onOpenSection(sec),
          style: { borderColor: brand.color + "33" }
        },
        /* @__PURE__ */ React.createElement("div", { className: "ep-section-icon", style: { background: brand.color + "18", color: brand.color } }, p.icon),
        /* @__PURE__ */ React.createElement("div", { className: "ep-section-name" }, p.name),
        /* @__PURE__ */ React.createElement("div", { className: "ep-section-count" }, n, " tests")
      );
    })));
  }
  function fmtDuration(secs) {
    if (!secs) return "\u2014";
    const h = Math.floor(secs / 3600);
    const m = Math.round(secs % 3600 / 60);
    return h ? `${h}h ${m}m` : `${m} min`;
  }
  function SectionTestList({ examId, examLabel, section, isFullMock, onBack, onOpenTest }) {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const brand = EXAM_BRAND[examId] || { color: "#4f46e5" };
    const pres = isFullMock ? { name: "Full Mock Tests", icon: "\u{1F4DD}" } : SECTION_PRESENTATION[section] || { name: section, icon: "\u{1F4CB}" };
    const variants = EXAM_VARIANTS[examId];
    const variantAgnostic = !isFullMock && (VARIANT_AGNOSTIC_SECTIONS[examId] || []).includes(section);
    const showVariantPills = !!variants && !variantAgnostic;
    const defaultVariant = variants ? variants[0].id : null;
    const [variant, setVariant] = useState(defaultVariant);
    useEffect(() => {
      setLoading(true);
      const fetcher = isFullMock ? window.LP_CATALOG.listFullMocks(examId) : window.LP_CATALOG.listTests(examId, section);
      fetcher.then((arr) => {
        setTests(arr);
        setLoading(false);
      });
    }, [examId, section, isFullMock]);
    useEffect(() => {
      setSEO(
        `Free ${examLabel} ${pres.name} Practice Tests | LandingPrep`,
        `${tests.length || 30} ${examLabel} ${pres.name} practice tests with answers and model responses. Real exam pattern, browser-based, no signup.`
      );
    }, [examLabel, pres.name, tests.length]);
    return /* @__PURE__ */ React.createElement("div", { className: "ep-list" }, /* @__PURE__ */ React.createElement("div", { className: "ep-breadcrumb" }, /* @__PURE__ */ React.createElement("a", { onClick: (e) => {
      e.preventDefault();
      onBack();
    }, href: "#/exam-prep" }, examLabel), " ", /* @__PURE__ */ React.createElement("span", null, "/"), " ", /* @__PURE__ */ React.createElement("span", null, pres.name)), /* @__PURE__ */ React.createElement("h1", { style: { borderLeft: `4px solid ${brand.color}`, paddingLeft: 16 } }, /* @__PURE__ */ React.createElement("span", { style: { marginRight: 10 } }, pres.icon), examLabel, " \u2014 ", pres.name), /* @__PURE__ */ React.createElement("p", { className: "muted" }, "Choose any test below. Each loads on demand."), examId === "toefl" && /* @__PURE__ */ React.createElement(
      "div",
      {
        role: "note",
        style: {
          margin: "0 0 20px",
          padding: "12px 14px",
          borderRadius: "var(--r-lg, 12px)",
          border: "1px solid var(--line)",
          background: "rgba(2, 132, 199, 0.08)",
          color: "var(--ink)",
          fontSize: "0.9rem",
          lineHeight: 1.5
        }
      },
      /* @__PURE__ */ React.createElement("strong", null, "Heads-up:"),
      " these mocks reflect the ",
      /* @__PURE__ */ React.createElement("strong", null, "pre-2026 TOEFL"),
      " (0\u2013120 scale). TOEFL iBT changed in January 2026 \u2014 it's now a 1\u20136 band with adaptive Reading & Listening and new task types. For the current format, see our",
      " ",
      /* @__PURE__ */ React.createElement("a", { href: "/learn/toefl/", style: { color: "var(--accent)", fontWeight: 700 } }, "TOEFL 2026 Smart Notes \u2192"),
      "."
    ), showVariantPills && variants && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "0.75rem 0 1.25rem" } }, variants.map((v) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: v.id,
        onClick: () => setVariant(v.id),
        style: {
          padding: "0.35rem 1rem",
          borderRadius: "999px",
          border: `2px solid ${variant === v.id ? brand.color : "var(--line)"}`,
          background: variant === v.id ? brand.color + "18" : "var(--surface)",
          color: variant === v.id ? brand.color : "var(--ink-2)",
          fontWeight: variant === v.id ? 600 : 500,
          cursor: "pointer",
          fontSize: "0.85rem",
          transition: "all 0.15s"
        }
      },
      v.label
    ))), loading ? /* @__PURE__ */ React.createElement("div", { className: "ep-loading" }, "Loading tests\u2026") : (() => {
      const visible = showVariantPills ? tests.filter((t) => (t.variant || defaultVariant) === variant) : tests;
      return visible.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "ep-empty" }, "No tests in this bank yet.") : /* @__PURE__ */ React.createElement("div", { className: "ep-test-grid" }, visible.map((t, i) => /* @__PURE__ */ React.createElement("article", { key: t.id, className: "ep-test-card", style: { borderTopColor: brand.color } }, /* @__PURE__ */ React.createElement("div", { className: "ep-test-num" }, String(i + 1).padStart(2, "0")), /* @__PURE__ */ React.createElement("h3", { className: "ep-test-title" }, t.title), /* @__PURE__ */ React.createElement("div", { className: "ep-test-meta" }, /* @__PURE__ */ React.createElement("span", null, "\u23F1 ", fmtDuration(t.durationSeconds)), t.questionCount && /* @__PURE__ */ React.createElement("span", null, "\xB7 ", t.questionCount, " questions"), t.sectionCount && /* @__PURE__ */ React.createElement("span", null, "\xB7 ", t.sectionCount, " sections")), /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn btn-primary ep-start-btn",
          onClick: () => onOpenTest(t, isFullMock)
        },
        "Start \u2192"
      ))));
    })());
  }
  const EXAM_VARIANTS = {
    ielts: [{ id: "academic", label: "Academic" }, { id: "general_training", label: "General Training" }],
    pte: [{ id: "academic", label: "Academic" }, { id: "core", label: "Core" }],
    celpip: [{ id: "general", label: "General" }, { id: "general_ls", label: "General LS" }],
    toefl: [{ id: "ibt", label: "iBT" }]
  };
  function parseExamPrepHash() {
    const parts = (window.location.hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
    const examId = parts[1] || null;
    const sub = parts[2] || null;
    if (!examId) return { view: "index", examId: null, section: null, isFullMock: false };
    if (!sub) return { view: "detail", examId, section: null, isFullMock: false };
    if (sub === "full") return { view: "list", examId, section: null, isFullMock: true };
    return { view: "list", examId, section: sub, isFullMock: false };
  }
  function ExamPrep({ onNav, onPractice, exams, initialExamId }) {
    const [route, setRoute] = useState(parseExamPrepHash());
    const { view, examId, section, isFullMock } = route;
    const [counts, setCounts] = useState({});
    const [examMeta, setExamMeta] = useState(null);
    useEffect(() => {
      const onHash = () => setRoute(parseExamPrepHash());
      window.addEventListener("hashchange", onHash);
      window.addEventListener("popstate", onHash);
      return () => {
        window.removeEventListener("hashchange", onHash);
        window.removeEventListener("popstate", onHash);
      };
    }, []);
    useEffect(() => {
      if (!window.LP_CATALOG) return;
      window.LP_CATALOG.getCounts().then(setCounts);
    }, []);
    useEffect(() => {
      if (!examId || !window.LP_CATALOG) {
        setExamMeta(null);
        return;
      }
      window.LP_CATALOG.getExam(examId).then(setExamMeta);
    }, [examId]);
    const go = (h) => {
      if (window.location.hash !== h) window.location.hash = h;
    };
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
          const exam = exams.find((e) => e.id === entry.exam) || { id: entry.exam, name: (examMeta == null ? void 0 : examMeta.label) || entry.exam };
          onPractice(exam, { examId: entry.exam, type: "full", prebuiltConfig: cfg, source: "exam-prep" });
        } else {
          const test = await window.LP_CATALOG.loadTest(entry);
          const cfg = window.LP_NORMALIZE.normaliseTest(test);
          const exam = exams.find((e) => e.id === entry.exam) || { id: entry.exam, name: (examMeta == null ? void 0 : examMeta.label) || entry.exam };
          onPractice(exam, { examId: entry.exam, type: cfg.testType, prebuiltConfig: cfg, source: "exam-prep" });
        }
      } catch (e) {
        const is404 = e.message && e.message.includes("404");
        setTestLoadError({
          title: is404 ? "Test Not Available Yet" : "Could Not Load Test",
          detail: is404 ? "This test is being prepared and will be available soon. Please try another test." : "Something went wrong loading this test. Please refresh and try again.",
          entry
        });
      }
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "exam-prep", onNav }), /* @__PURE__ */ React.createElement("main", { id: "main-content" }, testLoadError && /* @__PURE__ */ React.createElement("div", { className: "test-error-overlay", onClick: () => setTestLoadError(null) }, /* @__PURE__ */ React.createElement("div", { className: "test-error-card", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "test-error-icon" }, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("h3", { className: "test-error-title" }, testLoadError.title), /* @__PURE__ */ React.createElement("p", { className: "test-error-detail" }, testLoadError.detail), testLoadError.entry && /* @__PURE__ */ React.createElement("p", { className: "test-error-meta" }, testLoadError.entry.title || testLoadError.entry.id), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => setTestLoadError(null) }, "Back to Tests"))), /* @__PURE__ */ React.createElement("div", { className: "shell", style: { paddingTop: 32, paddingBottom: 56 } }, view === "index" && /* @__PURE__ */ React.createElement(ExamIndex, { counts, onChooseExam: openExam }), view === "detail" && examId && !examMeta && /* @__PURE__ */ React.createElement("div", { className: "ep-loading" }, "Loading exam info\u2026"), view === "detail" && examId && examMeta && /* @__PURE__ */ React.createElement(
      ExamDetail,
      {
        examId,
        examMeta,
        onBack: backToIndex,
        onOpenSection: openSection,
        onOpenFull: openFull
      }
    ), view === "list" && examId && (isFullMock || section) && /* @__PURE__ */ React.createElement(
      SectionTestList,
      {
        key: examId + "_" + (isFullMock ? "full" : section),
        examId,
        examLabel: (examMeta == null ? void 0 : examMeta.label) || examId.toUpperCase(),
        section,
        isFullMock,
        onBack: backToDetail,
        onOpenTest: openTest
      }
    ))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_ExamPrep = ExamPrep;
})();
