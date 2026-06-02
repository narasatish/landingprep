// LandingPrep — router v4 with browser-back support via hash routing
const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;

// ── URL helpers ────────────────────────────────────────────────────────
// Maps view state → URL hash and back. Keeps the browser history sane so
// the back/forward buttons work and refresh stays on the same page.
//
// Hash formats:
//   #/                       → home
//   #/exam-prep              → exam prep index
//   #/exam-prep/ielts        → exam detail (drill-down handled internally)
//   #/exam-hub/toefl         → guide view (exam hub)
//   #/learning               → learning club
//   #/agents                 → AI agents hub
//   #/progress               → my progress
//   #/login                  → login
//   #/blog                   → blog index
//   #/blog/<articleId>       → blog article  (parsed in seo-pages internally)
//
// "mock" view is intentionally NOT in the URL because it carries a large
// in-memory test config that can't be reconstructed from the URL alone.
// Going back from a mock test takes the user to its origin (guide or list).

function viewToHash(view, examId) {
  switch (view) {
    case "home":      return "#/";
    case "exam-prep":
      // ExamPrep owns its own deep sub-path (#/exam-prep/<exam>/<section>); don't
      // overwrite it from the top-level router or Back/breadcrumbs break.
      if ((window.location.hash || "").indexOf("#/exam-prep") === 0) return window.location.hash;
      return "#/exam-prep" + (examId ? "/" + examId : "");
    case "guide":     return "#/exam-hub" + (examId ? "/" + examId : "");
    case "learning":  return "#/learning";
    case "agents":    return "#/agents";
    case "progress":  return "#/progress";
    case "tools":     return "#/tools";
    case "colleges":
      // Colleges owns deep sub-paths (#/colleges/<tab>/<country>); preserve them so
      // a "Predict my admission" deep-link lands on the right tab + country.
      if ((window.location.hash || "").indexOf("#/colleges") === 0) return window.location.hash;
      return "#/colleges";
    case "login":     return "#/login";
    case "blog":      return "#/blog";
    case "languages": return "#/languages";
    case "lessons":   return "#/lessons";
    case "mock":      return null; // do not push history for mock — let the back button take user out of the test
    default:          return "#/";
  }
}

function hashToView(hash, exams) {
  const path = (hash || "").replace(/^#\/?/, "");
  if (!path) return { view: "home", examId: null };
  const parts = path.split("/").filter(Boolean);
  const head = parts[0];

  const find = (id) => (exams || []).find(e => e.id === id) || null;

  if (head === "exam-prep") return { view: "exam-prep", examId: parts[1] || null };
  if (head === "exam-hub" || head === "exams") {
    const ex = find(parts[1]);
    return { view: "guide", examId: ex ? ex.id : (exams && exams[0] ? exams[0].id : null) };
  }
  if (head === "learning")  return { view: "learning", examId: null };
  if (head === "agents")    return { view: "agents",   examId: null };
  if (head === "progress")  return { view: "progress", examId: null };
  if (head === "tools")     return { view: "tools",    examId: null };
  if (head === "colleges")  return { view: "colleges", examId: null,
    collegesTab: parts[1] || null,
    collegesCountry: parts[2] ? decodeURIComponent(parts[2]) : null };
  // #/planner is folded into the Tools hub (Study Plan tab) — keep the deep link working.
  if (head === "planner")   return { view: "tools",    examId: null };
  if (head === "login")     return { view: "login",    examId: null };
  if (head === "blog")      return { view: "blog",     examId: null };
  if (head === "languages") return { view: "languages", examId: null };
  if (head === "lessons")   return { view: "lessons",   examId: null };
  return { view: "home", examId: null };
}

// Which AI agents each exam actually needs. GMAT Focus and GRE have no speaking
// section (and GMAT has no writing), so their agents are hidden.
const AGENT_SUPPORT = {
  ielts:    { speaking: true,  writing: true },
  toefl:    { speaking: true,  writing: true },
  pte:      { speaking: true,  writing: true },
  celpip:   { speaking: true,  writing: true },
  duolingo: { speaking: true,  writing: true },
  gre:      { speaking: false, writing: false },
  gmat:     { speaking: false, writing: false },
};

function AgentsHub({ onNav, exams, exam, onSelectExam }) {
  const support = AGENT_SUPPORT[exam?.id] || { speaking: true, writing: true };
  const firstAvail = support.speaking ? "speaking" : support.writing ? "writing" : "none";
  const [tab, setTab] = useStateApp(firstAvail);
  // Keep the selected tab valid when the exam (and thus availability) changes.
  React.useEffect(() => {
    if (tab !== firstAvail && !support[tab]) setTab(firstAvail);
  }, [exam?.id]);
  const accentColor = (exam && exam.colour) || "var(--accent)";
  React.useEffect(() => {
    if (!window.LP_SEO) return;
    const examLabel = exam?.name || "IELTS";
    window.LP_SEO.set({
      title: `Free ${examLabel} AI Speaking & Writing Practice with Feedback | LandingPrep`,
      description: `Two-way voice practice and instant writing feedback for ${examLabel}. Speak naturally with an AI examiner, get model answers and rubric-based scoring — free, browser-based, no signup.`
    });
  }, [exam?.id]);

  return (
    <>
      <window.LP_TopBar current="agents" onNav={onNav} />
      <div className="shell" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <div className="eyebrow" style={{ color: "var(--accent)" }}>AI Agents</div>
          <h1 className="h1" style={{ margin: "8px 0 4px", fontSize: "clamp(28px,4.5vw,42px)" }}>Practice with AI</h1>
          <p className="muted" style={{ margin: 0, maxWidth: 640 }}>Two-way voice speaking practice and instant writing feedback — both built on the same heuristic scoring engine that powers our mocks.</p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "1.5rem 0" }}>
          {exams.map((e) =>
            <button
              key={e.id}
              onClick={() => onSelectExam(e)}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "999px",
                border: `2px solid ${(exam && exam.id === e.id) ? e.colour : "var(--line)"}`,
                background: (exam && exam.id === e.id) ? e.colour + "18" : "var(--surface)",
                color: (exam && exam.id === e.id) ? e.colour : "var(--ink-2)",
                fontWeight: (exam && exam.id === e.id) ? 600 : 500,
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >{e.name}</button>
          )}
        </div>

        {firstAvail === "none" ? (
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "28px 24px", marginTop: 8 }}>
            <h3 className="h3" style={{ marginTop: 0 }}>No speaking or writing agent for {exam?.name}</h3>
            <p className="muted" style={{ margin: "8px 0 16px", maxWidth: 560 }}>
              {exam?.name} is a quantitative and verbal reasoning exam with no speaking section{exam?.id === "gmat" ? " and no essay/writing section" : ""}. Practice it with full mock tests and section drills instead.
            </p>
            <div className="row-gap-12">
              <button className="btn btn-primary" onClick={() => onNav("exam-prep")}>Browse {exam?.name} mock tests →</button>
              <button className="btn" onClick={() => onSelectExam(exams.find(e => AGENT_SUPPORT[e.id]?.speaking) || exams[0])}>Switch to a speaking exam</button>
            </div>
          </div>
        ) : (
          <>
            <div className="wa-tab-bar">
              {support.speaking && (
                <button
                  className={`wa-tab ${tab === "speaking" ? "active" : ""}`}
                  style={tab === "speaking" ? { borderBottomColor: accentColor, color: accentColor } : {}}
                  onClick={() => setTab("speaking")}
                >🎤 AI Speaking Agent</button>
              )}
              {support.writing && (
                <button
                  className={`wa-tab ${tab === "writing" ? "active" : ""}`}
                  style={tab === "writing" ? { borderBottomColor: accentColor, color: accentColor } : {}}
                  onClick={() => setTab("writing")}
                >✍️ AI Writing Agent</button>
              )}
            </div>

            {tab === "speaking" && support.speaking
              ? <window.LP_SpeakingAgent exam={exam} />
              : <window.LP_WritingAgent exam={exam} />}
          </>
        )}
      </div>
      <window.LP_Footer />
    </>
  );
}

function App() {
  const exams = window.LP_DATA.EXAMS;

  // Initial view derived from the current URL hash (deep-link safe)
  const initial = hashToView(window.location.hash, exams);
  const initialExam = initial.examId ? exams.find(e => e.id === initial.examId) || null : null;

  const [view, setView]       = useStateApp(initial.view);
  const [exam, setExam]       = useStateApp(initialExam);
  const [testCfg, setTestCfg] = useStateApp(null);
  // Deep-link target for the Colleges page (tab + country), e.g. from a
  // university SEO page's "Predict my admission" CTA → #/colleges/predictor/USA
  const [collegesTab, setCollegesTab]         = useStateApp(initial.collegesTab || null);
  const [collegesCountry, setCollegesCountry] = useStateApp(initial.collegesCountry || null);

  // suppress URL write while we're applying a popstate-triggered state change
  const skipNextHashWrite = useRefApp(false);

  // ── Sync state → URL whenever view/exam changes (except popstate-driven) ──
  useEffectApp(() => {
    if (skipNextHashWrite.current) { skipNextHashWrite.current = false; return; }
    const targetHash = viewToHash(view, exam ? exam.id : null);
    if (targetHash !== null && window.location.hash !== targetHash) {
      // Use pushState so each navigation is a fresh entry the user can back through
      window.history.pushState({ view, examId: exam ? exam.id : null }, "", targetHash);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view, exam]);

  // ── Listen for back/forward (popstate) and direct hash edits (hashchange) ──
  useEffectApp(() => {
    const apply = () => {
      const parsed = hashToView(window.location.hash, exams);
      skipNextHashWrite.current = true;
      // If we're in the middle of a mock test, popping the hash should exit the test.
      setTestCfg(null);
      const nextExam = parsed.examId ? exams.find(e => e.id === parsed.examId) || null : null;
      setExam(nextExam);
      setCollegesTab(parsed.collegesTab || null);
      setCollegesCountry(parsed.collegesCountry || null);
      setView(parsed.view);
    };
    window.addEventListener("popstate", apply);
    window.addEventListener("hashchange", apply);
    return () => {
      window.removeEventListener("popstate", apply);
      window.removeEventListener("hashchange", apply);
    };
  }, [exams]);

  // ── On load: if this device is signed in, pull account history once so any
  // tests taken on another device show up here (cross-device sync). No-op when
  // logged out or backend is offline. ───────────────────────────────────────
  useEffectApp(() => {
    const A = window.LP_AUTH;
    if (A && A.getToken && A.getToken() && A.pullHistory) {
      A.pullHistory();
    }
    // Daily study reminder nudge (only fires when opted in + returning on a new day)
    if (window.LP_REMINDERS && window.LP_REMINDERS.maybeRemind) window.LP_REMINDERS.maybeRemind();
    // Record activity for the streak heatmap (one tick per day the app is opened).
    try {
      const day = Math.floor(Date.now() / 86400000);
      const act = JSON.parse(localStorage.getItem("lp_activity") || "{}");
      act[day] = (act[day] || 0) + 1;
      localStorage.setItem("lp_activity", JSON.stringify(act));
    } catch (e) {}
  }, []);

  // ── Navigation functions ─────────────────────────────────────────────
  const onNav = (id) => {
    if (id === "home")      { setView("home");     setExam(null); return; }
    if (id === "learning")  { setView("learning");  return; }
    if (id === "agents")    { setView("agents");    return; }
    if (id === "speaking")  { setView("agents");    return; }
    if (id === "writing")   { setView("agents");    return; }
    if (id === "progress")  { setView("progress");  return; }
    if (id === "exams")     { setView("guide");     setExam(exam || exams[0]); return; }
    if (id === "exam-prep") { setExam(null); window.location.hash = "#/exam-prep"; setView("exam-prep"); return; }
    if (id === "blog")      { setView("blog");      return; }
    if (id === "languages") { setView("languages"); return; }
    if (id === "lessons")   { setView("lessons");   return; }
    if (id === "tools")     { setView("tools");     return; }
    if (id === "colleges")  { setCollegesTab(null); setCollegesCountry(null); setView("colleges"); return; }
    if (id === "planner")   { setView("tools");     return; }
    if (id === "login")     { setView("login");     return; }
    setView("home");
  };

  const onGuide = (e) => { setExam(e); setView("guide"); };
  const onPractice = (e, cfg) => {
    setExam(e);
    setTestCfg(cfg || { examId: e.id, type: "full" });
    setView("mock");
  };
  const onBack = () => {
    // Go back to exam-prep if we came from there, otherwise home
    if (testCfg && testCfg.source === "exam-prep") {
      setTestCfg(null);
      setView("exam-prep");
    } else {
      setView("home"); setExam(null); setTestCfg(null);
    }
  };

  // ── Scroll-reveal: fade/slide .reveal elements into view ───────────────
  // FAIL-SAFE: a guaranteed timeout reveals everything even if IntersectionObserver
  // never fires (older browsers / headless / odd scroll containers) so content is
  // NEVER left hidden. The observer just makes it nicer (reveal on scroll).
  useEffectApp(() => {
    const reveal = (el) => el && el.classList.add("is-visible");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io;
    // setTimeout (not requestAnimationFrame, which is paused in background tabs) so
    // the setup + fallback ALWAYS run and content is never left hidden.
    const setup = setTimeout(() => {
      const els = [...document.querySelectorAll(".reveal:not(.is-visible)")];
      if (reduce || typeof IntersectionObserver === "undefined") { els.forEach(reveal); return; }
      io = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -5% 0px", threshold: 0.05 });
      els.forEach(el => io.observe(el));
    }, 50);
    // Guaranteed safety net independent of the observer.
    const fallback = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(reveal);
    }, 1100);
    return () => { clearTimeout(setup); clearTimeout(fallback); if (io) io.disconnect(); };
  }, [view, exam, testCfg]);

  const activeExam = exam || exams[0];

  let content;
  if (view === "guide" && activeExam) {
    content = <window.LP_Guide
      exam={activeExam}
      exams={exams}
      onBack={onBack}
      onPractice={onPractice}
      onNav={onNav}
      onSelectExam={(e) => setExam(e)}
    />;
  } else if (view === "mock") {
    content = <window.LP_MockTest
      exam={activeExam}
      testCfg={testCfg}
      onBack={() => {
        const src = testCfg?.source;
        setTestCfg(null);
        if (src === "exam-prep") setView("exam-prep");
        else if (exam) setView("guide");
        else setView("home");
      }}
      onNav={onNav}
    />;
  } else if (view === "learning") {
    content = <window.LP_LearningClub onNav={onNav} exams={exams} />;
  } else if (view === "agents") {
    content = <AgentsHub onNav={onNav} exams={exams} exam={activeExam} onSelectExam={(e) => setExam(e)} />;
  } else if (view === "progress") {
    content = <window.LP_Progress onNav={onNav} exams={exams} onPractice={onPractice} />;
  } else if (view === "exam-prep") {
    content = <window.LP_ExamPrep onNav={onNav} onPractice={onPractice} exams={exams} initialExamId={exam ? exam.id : null} />;
  } else if (view === "tools") {
    content = <window.LP_Tools onNav={onNav} initialTab={(window.location.hash || "").indexOf("planner") >= 0 ? "planner" : undefined} />;
  } else if (view === "colleges") {
    content = <window.LP_Colleges onNav={onNav} initialTab={collegesTab} initialCountry={collegesCountry} />;
  } else if (view === "blog") {
    content = <window.LP_Blog onNav={onNav} />;
  } else if (view === "languages") {
    content = <window.LP_Languages onNav={onNav} />;
  } else if (view === "lessons") {
    content = <window.LP_Lessons onNav={onNav} />;
  } else if (view === "login") {
    content = <window.LP_LoginScreen onNav={onNav} onSuccess={() => setView("progress")} />;
  } else {
    content = <window.LP_Home onGuide={onGuide} onPractice={onPractice} onNav={onNav} />;
  }

  return (
    <>
      {content}
      {window.LP_ChatbotWidget && <window.LP_ChatbotWidget />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
