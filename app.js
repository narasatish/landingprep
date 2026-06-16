const { useState: useStateApp, useEffect: useEffectApp, useRef: useRefApp } = React;
function viewToHash(view, examId) {
  switch (view) {
    case "home":
      return "#/";
    case "exam-prep":
      if ((window.location.hash || "").indexOf("#/exam-prep") === 0) return window.location.hash;
      return "#/exam-prep" + (examId ? "/" + examId : "");
    case "guide":
      return "#/exam-hub" + (examId ? "/" + examId : "");
    case "test-finder":
      return "#/which-english-test";
    case "relocate":
      return "#/relocate";
    case "achievements":
      return "#/achievements";
    case "vocabulary":
      return "#/vocabulary";
    case "writing-checker":
      return "#/writing-checker";
    case "speaking-checker":
      return "#/speaking-checker";
    case "learn":
      return "#/learn";
    case "learning":
      return "#/learning";
    case "agents":
      return "#/agents";
    case "progress":
      return "#/progress";
    case "tools":
      return "#/tools";
    case "colleges":
      if ((window.location.hash || "").indexOf("#/colleges") === 0) return window.location.hash;
      return "#/colleges";
    case "login":
      return "#/login";
    case "blog":
      return "#/blog";
    case "languages":
      return "#/languages";
    case "lessons":
      return "#/lessons";
    case "mock":
      return null;
    // do not push history for mock — let the back button take user out of the test
    default:
      return "#/";
  }
}
function hashToView(hash, exams) {
  const path = (hash || "").replace(/^#\/?/, "");
  if (!path) return { view: "home", examId: null };
  const parts = path.split("/").filter(Boolean);
  const head = (parts[0] || "").split("?")[0];
  const find = (id) => (exams || []).find((e) => e.id === id) || null;
  if (head === "exam-prep") return { view: "exam-prep", examId: parts[1] || null };
  if (head === "exam-hub" || head === "exams") {
    const ex = find(parts[1]);
    return { view: "guide", examId: ex ? ex.id : exams && exams[0] ? exams[0].id : null };
  }
  if (head === "which-english-test") return { view: "test-finder", examId: null };
  if (head === "relocate") return { view: "relocate", examId: null };
  if (head === "achievements") return { view: "achievements", examId: null };
  if (head === "vocabulary") return { view: "vocabulary", examId: null, vocabTopic: parts[1] || null };
  if (head === "writing-checker") return { view: "writing-checker", examId: null };
  if (head === "speaking-checker") return { view: "speaking-checker", examId: null };
  if (head === "learn") return { view: "learn", examId: null };
  if (head === "learning") return { view: "learning", examId: null };
  if (head === "agents") return { view: "agents", examId: null };
  if (head === "progress") return { view: "progress", examId: null };
  if (head === "tools") return { view: "tools", examId: null };
  if (head === "colleges") return {
    view: "colleges",
    examId: null,
    collegesTab: parts[1] || null,
    collegesCountry: parts[2] ? decodeURIComponent(parts[2]) : null
  };
  if (head === "planner") return { view: "tools", examId: null };
  if (head === "login") return { view: "login", examId: null };
  if (head === "blog") return { view: "blog", examId: null };
  if (head === "languages") return { view: "languages", examId: null };
  if (head === "lessons") return { view: "lessons", examId: null };
  return { view: "home", examId: null };
}
const AGENT_SUPPORT = {
  ielts: { speaking: true, writing: true },
  toefl: { speaking: true, writing: true },
  pte: { speaking: true, writing: true },
  celpip: { speaking: true, writing: true },
  duolingo: { speaking: true, writing: true },
  gre: { speaking: false, writing: false },
  gmat: { speaking: false, writing: false }
};
function AgentsHub({ onNav, exams, exam, onSelectExam }) {
  const support = AGENT_SUPPORT[exam == null ? void 0 : exam.id] || { speaking: true, writing: true };
  const firstAvail = support.speaking ? "speaking" : support.writing ? "writing" : "none";
  const [tab, setTab] = useStateApp(firstAvail);
  React.useEffect(() => {
    if (tab !== firstAvail && !support[tab]) setTab(firstAvail);
  }, [exam == null ? void 0 : exam.id]);
  const accentColor = exam && exam.colour || "var(--accent)";
  React.useEffect(() => {
    if (!window.LP_SEO) return;
    const examLabel = (exam == null ? void 0 : exam.name) || "IELTS";
    window.LP_SEO.set({
      title: `Free ${examLabel} Speaking & Writing Practice with Feedback | LandingPrep`,
      description: `Two-way voice practice and instant writing feedback for ${examLabel}. Speak naturally with a speaking examiner, get model answers and rubric-based scoring \u2014 free, browser-based, no signup.`
    });
  }, [exam == null ? void 0 : exam.id]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "agents", onNav }), /* @__PURE__ */ React.createElement("div", { className: "shell", style: { paddingTop: "2rem", paddingBottom: "4rem" } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "1rem" } }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow", style: { color: "var(--accent)" } }, "Speaking & Writing"), /* @__PURE__ */ React.createElement("h1", { className: "h1", style: { margin: "8px 0 4px", fontSize: "clamp(28px,4.5vw,42px)" } }, "Practice Speaking & Writing"), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { margin: 0, maxWidth: 640 } }, "Two-way voice speaking practice and instant writing feedback \u2014 both built on the same heuristic scoring engine that powers our mocks.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "1.5rem 0" } }, exams.map(
    (e) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: e.id,
        onClick: () => onSelectExam(e),
        style: {
          padding: "0.4rem 0.9rem",
          borderRadius: "999px",
          border: `2px solid ${exam && exam.id === e.id ? e.colour : "var(--line)"}`,
          background: exam && exam.id === e.id ? e.colour + "18" : "var(--surface)",
          color: exam && exam.id === e.id ? e.colour : "var(--ink-2)",
          fontWeight: exam && exam.id === e.id ? 600 : 500,
          cursor: "pointer",
          fontSize: "0.85rem"
        }
      },
      e.name
    )
  )), firstAvail === "none" ? /* @__PURE__ */ React.createElement("div", { style: { background: "var(--surface-2)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "28px 24px", marginTop: 8 } }, /* @__PURE__ */ React.createElement("h3", { className: "h3", style: { marginTop: 0 } }, "No speaking or writing agent for ", exam == null ? void 0 : exam.name), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { margin: "8px 0 16px", maxWidth: 560 } }, exam == null ? void 0 : exam.name, " is a quantitative and verbal reasoning exam with no speaking section", (exam == null ? void 0 : exam.id) === "gmat" ? " and no essay/writing section" : "", ". Practice it with full mock tests and section drills instead."), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("exam-prep") }, "Browse ", exam == null ? void 0 : exam.name, " mock tests \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onSelectExam(exams.find((e) => {
    var _a;
    return (_a = AGENT_SUPPORT[e.id]) == null ? void 0 : _a.speaking;
  }) || exams[0]) }, "Switch to a speaking exam"))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "wa-tab-bar" }, support.speaking && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `wa-tab ${tab === "speaking" ? "active" : ""}`,
      style: tab === "speaking" ? { borderBottomColor: accentColor, color: accentColor } : {},
      onClick: () => setTab("speaking")
    },
    "\u{1F3A4} Speaking Practice"
  ), support.writing && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `wa-tab ${tab === "writing" ? "active" : ""}`,
      style: tab === "writing" ? { borderBottomColor: accentColor, color: accentColor } : {},
      onClick: () => setTab("writing")
    },
    "\u270D\uFE0F Writing Feedback"
  )), tab === "speaking" && support.speaking ? /* @__PURE__ */ React.createElement(LazyScreen, { key: "agent-speaking", scripts: ["screens/speaking-agent.js"], isReady: () => !!window.LP_SpeakingAgent, label: "the speaking agent" }, () => /* @__PURE__ */ React.createElement(window.LP_SpeakingAgent, { exam })) : /* @__PURE__ */ React.createElement(LazyScreen, { key: "agent-writing", scripts: ["screens/writing-agent.js"], isReady: () => !!window.LP_WritingAgent, label: "the writing agent" }, () => /* @__PURE__ */ React.createElement(window.LP_WritingAgent, { exam })))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
}
function LazyScreen({ scripts, isReady, label, children }) {
  const ready0 = () => {
    try {
      return !!isReady();
    } catch (e) {
      return false;
    }
  };
  const [ok, setOk] = useStateApp(ready0());
  const [failed, setFailed] = useStateApp(false);
  useEffectApp(() => {
    if (ready0()) {
      setOk(true);
      return;
    }
    let live = true;
    const fail = () => {
      if (live) setFailed(true);
    };
    if (!window.LP_loadScript) {
      fail();
      return;
    }
    (scripts || []).reduce((p, s) => p.then(() => ready0() ? null : window.LP_loadScript(s)), Promise.resolve()).then(() => {
      if (!live) return;
      ready0() ? setOk(true) : fail();
    }).catch(fail);
    return () => {
      live = false;
    };
  }, []);
  const wrap = { textAlign: "center", padding: "12vh 20px", maxWidth: 460, margin: "0 auto" };
  if (ok && ready0()) return children();
  if (failed) {
    return /* @__PURE__ */ React.createElement("main", { className: "tools-shell", style: wrap }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 42 } }, "\u{1F4F6}"), /* @__PURE__ */ React.createElement("h2", { style: { margin: "10px 0 6px" } }, "Couldn\u2019t load ", label || "this section"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)", marginBottom: 18 } }, "Usually a slow or dropped connection \u2014 your saved progress is safe."), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { background: "#4F46E5", color: "#fff" }, onClick: () => location.reload() }, "Reload"));
  }
  return /* @__PURE__ */ React.createElement("main", { className: "tools-shell", style: wrap }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40 } }, "\u23F3"), /* @__PURE__ */ React.createElement("h2", { style: { margin: "10px 0 6px" } }, "Loading ", label || "\u2026", "\u2026"));
}
window.LP_LazyScreen = LazyScreen;
function MockTestGate(props) {
  const present = () => !!window.LP_MockTest && typeof window.LP_QUESTIONS !== "undefined";
  const [ready, setReady] = useStateApp(present());
  const [failed, setFailed] = useStateApp(false);
  useEffectApp(() => {
    if (present()) {
      setReady(true);
      return;
    }
    let live = true;
    const fail = () => {
      if (live) setFailed(true);
    };
    if (!window.LP_loadScript) {
      fail();
      return;
    }
    (typeof window.LP_QUESTIONS !== "undefined" ? Promise.resolve() : window.LP_loadScript("data-questions.js")).then(() => window.LP_QUESTIONS && !window.LP_QUESTIONS.__extra ? window.LP_loadScript("exam-extra.js").catch(() => {
    }) : null).then(() => window.LP_MockTest ? null : window.LP_loadScript("screens/mock-test.js")).then(() => {
      if (!live) return;
      present() ? setReady(true) : fail();
    }).catch(fail);
    return () => {
      live = false;
    };
  }, []);
  if (ready && window.LP_MockTest) return React.createElement(window.LP_MockTest, props);
  const wrap = { textAlign: "center", padding: "14vh 20px", maxWidth: 460, margin: "0 auto" };
  if (failed) {
    return /* @__PURE__ */ React.createElement("main", { className: "tools-shell", style: wrap }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 42 } }, "\u{1F4F6}"), /* @__PURE__ */ React.createElement("h2", { style: { margin: "10px 0 6px" } }, "Couldn\u2019t load the test"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)", marginBottom: 18 } }, "Usually a slow or dropped connection \u2014 your saved progress is safe."), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { background: "#4F46E5", color: "#fff" }, onClick: () => location.reload() }, "Reload"));
  }
  return /* @__PURE__ */ React.createElement("main", { className: "tools-shell", style: wrap }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 40 } }, "\u23F3"), /* @__PURE__ */ React.createElement("h2", { style: { margin: "10px 0 6px" } }, "Loading your test\u2026"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)" } }, "Preparing the questions and test engine."));
}
function App() {
  const exams = window.LP_DATA.EXAMS;
  const initial = hashToView(window.location.hash, exams);
  const initialExam = initial.examId ? exams.find((e) => e.id === initial.examId) || null : null;
  const [view, setView] = useStateApp(initial.view);
  const [exam, setExam] = useStateApp(initialExam);
  const [testCfg, setTestCfg] = useStateApp(null);
  const [collegesTab, setCollegesTab] = useStateApp(initial.collegesTab || null);
  const [collegesCountry, setCollegesCountry] = useStateApp(initial.collegesCountry || null);
  const skipNextHashWrite = useRefApp(false);
  useEffectApp(() => {
    if (skipNextHashWrite.current) {
      skipNextHashWrite.current = false;
      return;
    }
    const targetHash = viewToHash(view, exam ? exam.id : null);
    if (targetHash !== null && window.location.hash !== targetHash) {
      window.history.pushState({ view, examId: exam ? exam.id : null }, "", targetHash);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [view, exam]);
  useEffectApp(() => {
    try {
      window.LP_REFERRAL && window.LP_REFERRAL.capture();
    } catch (e) {
    }
  }, []);
  useEffectApp(() => {
    try {
      if (window.gtag) {
        const path = window.location.hash || "#/";
        window.gtag("event", "page_view", { page_path: path, page_title: String(view) });
        window.gtag("event", "tool_open", { tool: String(view) });
      }
    } catch (e) {
    }
  }, [view]);
  useEffectApp(() => {
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1800));
    idle(() => {
      if (window.LP_loadScript && typeof window.LP_COLLEGES === "undefined") {
        window.LP_loadScript("college-data.js").catch(() => {
        });
      }
    });
  }, []);
  useEffectApp(() => {
    const apply = () => {
      const parsed = hashToView(window.location.hash, exams);
      skipNextHashWrite.current = true;
      setTestCfg(null);
      const nextExam = parsed.examId ? exams.find((e) => e.id === parsed.examId) || null : null;
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
  useEffectApp(() => {
    const A = window.LP_AUTH;
    if (A && A.getToken && A.getToken() && A.pullHistory) {
      A.pullHistory();
    }
    if (window.LP_REMINDERS && window.LP_REMINDERS.maybeRemind) window.LP_REMINDERS.maybeRemind();
    try {
      const day = Math.floor(Date.now() / 864e5);
      const act = JSON.parse(localStorage.getItem("lp_activity") || "{}");
      act[day] = (act[day] || 0) + 1;
      localStorage.setItem("lp_activity", JSON.stringify(act));
    } catch (e) {
    }
  }, []);
  const onNav = (id) => {
    if (id === "home") {
      setView("home");
      setExam(null);
      return;
    }
    if (id === "test-finder") {
      setView("test-finder");
      return;
    }
    if (id === "relocate") {
      setView("relocate");
      return;
    }
    if (id === "achievements") {
      setView("achievements");
      return;
    }
    if (id === "vocabulary") {
      setView("vocabulary");
      return;
    }
    if (id === "writing-checker") {
      setView("writing-checker");
      return;
    }
    if (id === "speaking-checker") {
      setView("speaking-checker");
      return;
    }
    if (id === "learn") {
      setView("learn");
      return;
    }
    if (id === "learning") {
      setView("learning");
      return;
    }
    if (id === "agents") {
      setView("agents");
      return;
    }
    if (id === "speaking") {
      setView("agents");
      return;
    }
    if (id === "writing") {
      setView("agents");
      return;
    }
    if (id === "progress") {
      setView("progress");
      return;
    }
    if (id === "exams") {
      setView("guide");
      setExam(exam || exams[0]);
      return;
    }
    if (id === "exam-prep") {
      setExam(null);
      window.location.hash = "#/exam-prep";
      setView("exam-prep");
      return;
    }
    if (id === "blog") {
      setView("blog");
      return;
    }
    if (id === "languages") {
      setView("languages");
      return;
    }
    if (id === "lessons") {
      setView("lessons");
      return;
    }
    if (id === "tools") {
      setView("tools");
      return;
    }
    if (id === "colleges") {
      setCollegesTab(null);
      setCollegesCountry(null);
      setView("colleges");
      return;
    }
    if (id === "planner") {
      setView("tools");
      return;
    }
    if (id === "login") {
      setView("login");
      return;
    }
    setView("home");
  };
  const onGuide = (e) => {
    setExam(e);
    setView("guide");
  };
  const onPractice = (e, cfg) => {
    setExam(e);
    setTestCfg(cfg || { examId: e.id, type: "full" });
    setView("mock");
  };
  const onBack = () => {
    if (testCfg && testCfg.source === "exam-prep") {
      setTestCfg(null);
      setView("exam-prep");
    } else {
      setView("home");
      setExam(null);
      setTestCfg(null);
    }
  };
  useEffectApp(() => {
    const reveal = (el) => el && el.classList.add("is-visible");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let io, mo, deb;
    const sweep = () => {
      const els = [...document.querySelectorAll(".reveal:not(.is-visible)")];
      if (!els.length) return;
      if (reduce || typeof IntersectionObserver === "undefined") {
        els.forEach(reveal);
        return;
      }
      if (!io) io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: "0px 0px -5% 0px", threshold: 0.05 });
      els.forEach((el) => io.observe(el));
    };
    const setup = setTimeout(sweep, 50);
    if (typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(() => {
        clearTimeout(deb);
        deb = setTimeout(sweep, 80);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
    const fallback = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(reveal);
    }, 1100);
    return () => {
      clearTimeout(setup);
      clearTimeout(fallback);
      clearTimeout(deb);
      if (io) io.disconnect();
      if (mo) mo.disconnect();
    };
  }, [view, exam, testCfg]);
  const activeExam = exam || exams[0];
  let content;
  if (view === "guide" && activeExam) {
    content = /* @__PURE__ */ React.createElement(
      window.LP_Guide,
      {
        exam: activeExam,
        exams,
        onBack,
        onPractice,
        onNav,
        onSelectExam: (e) => setExam(e)
      }
    );
  } else if (view === "mock") {
    content = /* @__PURE__ */ React.createElement(
      MockTestGate,
      {
        exam: activeExam,
        testCfg,
        onBack: () => {
          const src = testCfg == null ? void 0 : testCfg.source;
          setTestCfg(null);
          if (src === "exam-prep") setView("exam-prep");
          else if (exam) setView("guide");
          else setView("home");
        },
        onNav
      }
    );
  } else if (view === "test-finder") {
    content = /* @__PURE__ */ React.createElement(window.LP_TestFinder, { onNav });
  } else if (view === "relocate") {
    content = /* @__PURE__ */ React.createElement(window.LP_Relocate, { onNav });
  } else if (view === "achievements") {
    content = /* @__PURE__ */ React.createElement(window.LP_Achievements, { onNav });
  } else if (view === "vocabulary") {
    content = /* @__PURE__ */ React.createElement(window.LP_Vocabulary, { onNav, initialTopic: (window.location.hash || "").split("/")[2] || null });
  } else if (view === "writing-checker") {
    content = /* @__PURE__ */ React.createElement(window.LP_BandChecker, { onNav, initialMode: "writing" });
  } else if (view === "speaking-checker") {
    content = /* @__PURE__ */ React.createElement(window.LP_BandChecker, { onNav, initialMode: "speaking" });
  } else if (view === "learn") {
    content = /* @__PURE__ */ React.createElement(window.LP_LearnHub, { onNav, exams, initialTab: "lessons" });
  } else if (view === "learning") {
    content = /* @__PURE__ */ React.createElement(window.LP_LearnHub, { onNav, exams, initialTab: "club" });
  } else if (view === "agents") {
    content = /* @__PURE__ */ React.createElement(AgentsHub, { onNav, exams, exam: activeExam, onSelectExam: (e) => setExam(e) });
  } else if (view === "progress") {
    content = /* @__PURE__ */ React.createElement(window.LP_Progress, { onNav, exams, onPractice });
  } else if (view === "exam-prep") {
    content = /* @__PURE__ */ React.createElement(window.LP_ExamPrep, { onNav, onPractice, exams, initialExamId: exam ? exam.id : null });
  } else if (view === "tools") {
    content = /* @__PURE__ */ React.createElement(window.LP_Tools, { onNav, initialTab: (window.location.hash || "").indexOf("planner") >= 0 ? "planner" : void 0 });
  } else if (view === "colleges") {
    content = /* @__PURE__ */ React.createElement(LazyScreen, { scripts: ["college-data.js"], isReady: () => typeof window.LP_COLLEGES !== "undefined", label: "study-abroad data" }, () => /* @__PURE__ */ React.createElement(window.LP_Colleges, { onNav, initialTab: collegesTab, initialCountry: collegesCountry }));
  } else if (view === "blog") {
    content = /* @__PURE__ */ React.createElement(LazyScreen, { scripts: ["blog-data.js", "seo-pages.js"], isReady: () => !!window.LP_Blog, label: "the blog" }, () => /* @__PURE__ */ React.createElement(window.LP_Blog, { onNav }));
  } else if (view === "languages") {
    content = /* @__PURE__ */ React.createElement(window.LP_Languages, { onNav });
  } else if (view === "lessons") {
    content = /* @__PURE__ */ React.createElement(window.LP_LearnHub, { onNav, exams, initialTab: "lessons" });
  } else if (view === "login") {
    content = /* @__PURE__ */ React.createElement(window.LP_LoginScreen, { onNav, onSuccess: () => setView("progress") });
  } else {
    content = /* @__PURE__ */ React.createElement(window.LP_Home, { onGuide, onPractice, onNav });
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, content, window.LP_ChatbotWidget && /* @__PURE__ */ React.createElement(window.LP_ChatbotWidget, null), window.LP_FocusWidget && /* @__PURE__ */ React.createElement(window.LP_FocusWidget, null));
}
class LPErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    try {
      if (window.gtag) window.gtag("event", "exception", { description: ("render:" + (err && err.message || err)).slice(0, 150), fatal: false });
    } catch (e) {
    }
    try {
      console.error("[LandingPrep] render error:", err, info && info.componentStack);
    } catch (e) {
    }
    try {
      if (window.__lpReport) window.__lpReport("render: " + (err && err.message || err), err && err.stack || info && info.componentStack, "react-render");
    } catch (e) {
    }
  }
  render() {
    if (!this.state.err) return this.props.children;
    const goHome = () => {
      try {
        window.location.hash = "#/";
      } catch (e) {
      }
      window.location.reload();
    };
    return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 480, margin: "16vh auto", padding: 28, textAlign: "center", fontFamily: "system-ui, Arial, sans-serif" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 44 } }, "\u{1F6DF}"), /* @__PURE__ */ React.createElement("h1", { style: { fontSize: 23, margin: "12px 0 6px", color: "var(--ink, #1f2937)" } }, "Something hiccupped"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-2, #6b7280)", fontSize: 15, lineHeight: 1.6, margin: "0 0 20px" } }, "A page didn\u2019t load right \u2014 your saved progress is safe. Try reloading or head back to the homepage."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { onClick: () => window.location.reload(), style: { background: "var(--accent, #4F46E5)", color: "#fff", border: 0, borderRadius: 10, padding: "12px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer" } }, "Reload"), /* @__PURE__ */ React.createElement("button", { onClick: goHome, style: { background: "transparent", color: "var(--accent, #4F46E5)", border: "1px solid var(--accent, #4F46E5)", borderRadius: 10, padding: "12px 22px", fontSize: 15, fontWeight: 700, cursor: "pointer" } }, "Go to homepage")));
  }
}
try {
  ReactDOM.createRoot(document.getElementById("root")).render(
    /* @__PURE__ */ React.createElement(LPErrorBoundary, null, /* @__PURE__ */ React.createElement(App, null))
  );
} catch (e) {
  try {
    console.error("[LandingPrep] fatal mount error:", e);
  } catch (_) {
  }
}
