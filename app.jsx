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
    case "test-finder":      return "#/which-english-test";
    case "relocate":         return "#/relocate";
    case "achievements":     return "#/achievements";
    case "vocabulary":       return "#/vocabulary";
    case "writing-checker":  return "#/writing-checker";
    case "speaking-checker": return "#/speaking-checker";
    case "learn":     return "#/learn";
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
  if (head === "which-english-test")  return { view: "test-finder", examId: null };
  if (head === "relocate")  return { view: "relocate", examId: null };
  if (head === "achievements")  return { view: "achievements", examId: null };
  if (head === "vocabulary")  return { view: "vocabulary", examId: null, vocabTopic: parts[1] || null };
  if (head === "writing-checker")  return { view: "writing-checker",  examId: null };
  if (head === "speaking-checker") return { view: "speaking-checker", examId: null };
  if (head === "learn")     return { view: "learn",    examId: null };
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
              ? <LazyScreen key="agent-speaking" scripts={["screens/speaking-agent.js"]} isReady={() => !!window.LP_SpeakingAgent} label="the speaking agent">{() => <window.LP_SpeakingAgent exam={exam} />}</LazyScreen>
              : <LazyScreen key="agent-writing" scripts={["screens/writing-agent.js"]} isReady={() => !!window.LP_WritingAgent} label="the writing agent">{() => <window.LP_WritingAgent exam={exam} />}</LazyScreen>}
          </>
        )}
      </div>
      <window.LP_Footer />
    </>
  );
}

// Generic lazy-screen gate: loads `scripts` (in order) on mount only if `isReady()` is
// false, then renders children(). Shows a loading card while loading and a recovery card
// on failure (never a blank). Reusable for any deferred screen/data bundle.
function LazyScreen({ scripts, isReady, label, children }) {
  const ready0 = () => { try { return !!isReady(); } catch (e) { return false; } };
  const [ok, setOk] = useStateApp(ready0());
  const [failed, setFailed] = useStateApp(false);
  useEffectApp(() => {
    if (ready0()) { setOk(true); return; }
    let live = true;
    const fail = () => { if (live) setFailed(true); };
    if (!window.LP_loadScript) { fail(); return; }
    (scripts || []).reduce((p, s) => p.then(() => (ready0() ? null : window.LP_loadScript(s))), Promise.resolve())
      .then(() => { if (!live) return; ready0() ? setOk(true) : fail(); })
      .catch(fail);
    return () => { live = false; };
  }, []);
  const wrap = { textAlign: "center", padding: "12vh 20px", maxWidth: 460, margin: "0 auto" };
  if (ok && ready0()) return children();
  if (failed) {
    return (
      <main className="tools-shell" style={wrap}>
        <div style={{ fontSize: 42 }}>📶</div>
        <h2 style={{ margin: "10px 0 6px" }}>Couldn’t load {label || "this section"}</h2>
        <p style={{ color: "var(--ink-3)", marginBottom: 18 }}>Usually a slow or dropped connection — your saved progress is safe.</p>
        <button className="btn" style={{ background: "#4F46E5", color: "#fff" }} onClick={() => location.reload()}>Reload</button>
      </main>
    );
  }
  return (
    <main className="tools-shell" style={wrap}>
      <div style={{ fontSize: 40 }}>⏳</div>
      <h2 style={{ margin: "10px 0 6px" }}>Loading {label || "…"}…</h2>
    </main>
  );
}
window.LP_LazyScreen = LazyScreen;

// Lazily load the ~300 KB test runner (screens/mock-test.js) + question bank
// (data-questions.js) only when the user actually starts a test — keeps them off the
// initial app load. data-questions loads first (the runner reads LP_QUESTIONS when it
// builds a test), then the runner. A failed load shows a recovery card (never a blank).
function MockTestGate(props) {
  const present = () => !!window.LP_MockTest && typeof window.LP_QUESTIONS !== "undefined";
  const [ready, setReady] = useStateApp(present());
  const [failed, setFailed] = useStateApp(false);
  useEffectApp(() => {
    if (present()) { setReady(true); return; }
    let live = true;
    const fail = () => { if (live) setFailed(true); };
    if (!window.LP_loadScript) { fail(); return; }
    (typeof window.LP_QUESTIONS !== "undefined" ? Promise.resolve() : window.LP_loadScript("data-questions.js"))
      .then(() => (window.LP_MockTest ? null : window.LP_loadScript("screens/mock-test.js")))
      .then(() => { if (!live) return; present() ? setReady(true) : fail(); })
      .catch(fail);
    return () => { live = false; };
  }, []);
  if (ready && window.LP_MockTest) return React.createElement(window.LP_MockTest, props);
  const wrap = { textAlign: "center", padding: "14vh 20px", maxWidth: 460, margin: "0 auto" };
  if (failed) {
    return (
      <main className="tools-shell" style={wrap}>
        <div style={{ fontSize: 42 }}>📶</div>
        <h2 style={{ margin: "10px 0 6px" }}>Couldn’t load the test</h2>
        <p style={{ color: "var(--ink-3)", marginBottom: 18 }}>Usually a slow or dropped connection — your saved progress is safe.</p>
        <button className="btn" style={{ background: "#4F46E5", color: "#fff" }} onClick={() => location.reload()}>Reload</button>
      </main>
    );
  }
  return (
    <main className="tools-shell" style={wrap}>
      <div style={{ fontSize: 40 }}>⏳</div>
      <h2 style={{ margin: "10px 0 6px" }}>Loading your test…</h2>
      <p style={{ color: "var(--ink-3)" }}>Preparing the questions and test engine.</p>
    </main>
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

  // Viral loop: capture first-touch ?ref= referral on boot (fires GA referral_landing).
  useEffectApp(() => {
    try { window.LP_REFERRAL && window.LP_REFERRAL.capture(); } catch (e) {}
  }, []);

  // Analytics: GA4 only auto-tracks the FIRST page load, not client-side route
  // changes — so without this you can't see which tools/screens users actually use.
  // Fire a page_view + a tool_open (with the screen name) on every in-app navigation.
  useEffectApp(() => {
    try {
      if (window.gtag) {
        const path = window.location.hash || "#/";
        window.gtag("event", "page_view", { page_path: path, page_title: String(view) });
        window.gtag("event", "tool_open", { tool: String(view) });
      }
    } catch (e) {}
  }, [view]);

  // Idle-preload the study-abroad data bundle (~79 KB) shortly after boot so it is ready by
  // the time the user opens any college/study-abroad screen — without blocking initial load.
  useEffectApp(() => {
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1800));
    idle(() => {
      if (window.LP_loadScript && typeof window.LP_COLLEGES === "undefined") {
        window.LP_loadScript("college-data.js").catch(() => {});
      }
    });
  }, []);

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
    if (id === "test-finder")  { setView("test-finder");  return; }
    if (id === "relocate")  { setView("relocate");  return; }
    if (id === "achievements")  { setView("achievements");  return; }
    if (id === "vocabulary")  { setView("vocabulary");  return; }
    if (id === "writing-checker")  { setView("writing-checker");  return; }
    if (id === "speaking-checker") { setView("speaking-checker"); return; }
    if (id === "learn")     { setView("learn");     return; }
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
    content = <MockTestGate
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
  } else if (view === "test-finder") {
    content = <window.LP_TestFinder onNav={onNav} />;
  } else if (view === "relocate") {
    content = <window.LP_Relocate onNav={onNav} />;
  } else if (view === "achievements") {
    content = <window.LP_Achievements onNav={onNav} />;
  } else if (view === "vocabulary") {
    content = <window.LP_Vocabulary onNav={onNav} initialTopic={(window.location.hash || "").split("/")[2] || null} />;
  } else if (view === "writing-checker") {
    content = <window.LP_BandChecker onNav={onNav} initialMode="writing" />;
  } else if (view === "speaking-checker") {
    content = <window.LP_BandChecker onNav={onNav} initialMode="speaking" />;
  } else if (view === "learn") {
    content = <window.LP_LearnHub onNav={onNav} exams={exams} initialTab="lessons" />;
  } else if (view === "learning") {
    content = <window.LP_LearnHub onNav={onNav} exams={exams} initialTab="club" />;
  } else if (view === "agents") {
    content = <AgentsHub onNav={onNav} exams={exams} exam={activeExam} onSelectExam={(e) => setExam(e)} />;
  } else if (view === "progress") {
    content = <window.LP_Progress onNav={onNav} exams={exams} onPractice={onPractice} />;
  } else if (view === "exam-prep") {
    content = <window.LP_ExamPrep onNav={onNav} onPractice={onPractice} exams={exams} initialExamId={exam ? exam.id : null} />;
  } else if (view === "tools") {
    content = <window.LP_Tools onNav={onNav} initialTab={(window.location.hash || "").indexOf("planner") >= 0 ? "planner" : undefined} />;
  } else if (view === "colleges") {
    content = <LazyScreen scripts={["college-data.js"]} isReady={() => typeof window.LP_COLLEGES !== "undefined"} label="study-abroad data">{() => <window.LP_Colleges onNav={onNav} initialTab={collegesTab} initialCountry={collegesCountry} />}</LazyScreen>;
  } else if (view === "blog") {
    // blog-data.js (~122 KB) + seo-pages.js load on demand here (in order: data first, so
    // seo-pages.js sees window.LP_BLOG_EXTRA at eval) — keeps them off the initial load.
    content = <LazyScreen scripts={["blog-data.js", "seo-pages.js"]} isReady={() => !!window.LP_Blog} label="the blog">{() => <window.LP_Blog onNav={onNav} />}</LazyScreen>;
  } else if (view === "languages") {
    content = <window.LP_Languages onNav={onNav} />;
  } else if (view === "lessons") {
    content = <window.LP_LearnHub onNav={onNav} exams={exams} initialTab="lessons" />;
  } else if (view === "login") {
    content = <window.LP_LoginScreen onNav={onNav} onSuccess={() => setView("progress")} />;
  } else {
    content = <window.LP_Home onGuide={onGuide} onPractice={onPractice} onNav={onNav} />;
  }

  return (
    <>
      {content}
      {window.LP_ChatbotWidget && <window.LP_ChatbotWidget />}
      {window.LP_FocusWidget && <window.LP_FocusWidget />}
    </>
  );
}

// ── Error boundary: a render error in any screen shows a friendly recovery card
// instead of a blank white page, and offers a one-tap way back to a working state.
class LPErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err: err }; }
  componentDidCatch(err, info) {
    try { if (window.gtag) window.gtag("event", "exception", { description: ("render:" + (err && err.message || err)).slice(0, 150), fatal: false }); } catch (e) {}
    try { console.error("[LandingPrep] render error:", err, info && info.componentStack); } catch (e) {}
    // Alert the backend monitor so a broken screen/tool reaches the team/agent immediately.
    try { if (window.__lpReport) window.__lpReport("render: " + (err && err.message || err), (err && err.stack) || (info && info.componentStack), "react-render"); } catch (e) {}
  }
  render() {
    if (!this.state.err) return this.props.children;
    const goHome = () => { try { window.location.hash = "#/"; } catch (e) {} window.location.reload(); };
    return (
      <div style={{ maxWidth: 480, margin: "16vh auto", padding: 28, textAlign: "center", fontFamily: "system-ui, Arial, sans-serif" }}>
        <div style={{ fontSize: 44 }}>🛟</div>
        <h1 style={{ fontSize: 23, margin: "12px 0 6px", color: "var(--ink, #1f2937)" }}>Something hiccupped</h1>
        <p style={{ color: "var(--ink-2, #6b7280)", fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" }}>
          A page didn’t load right — your saved progress is safe. Try reloading or head back to the homepage.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => window.location.reload()} style={{ background: "var(--accent, #4F46E5)", color: "#fff", border: 0, borderRadius: 10, padding: "12px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Reload</button>
          <button onClick={goHome} style={{ background: "transparent", color: "var(--accent, #4F46E5)", border: "1px solid var(--accent, #4F46E5)", borderRadius: 10, padding: "12px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Go to homepage</button>
        </div>
      </div>
    );
  }
}

// Mount inside a try/catch so even a catastrophic init failure leaves the static
// boot-watchdog (in index.html) to show its recovery card rather than a blank page.
try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <LPErrorBoundary><App /></LPErrorBoundary>
  );
} catch (e) {
  try { console.error("[LandingPrep] fatal mount error:", e); } catch (_) {}
}
