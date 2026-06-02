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
  const head = parts[0];
  const find = (id) => (exams || []).find((e) => e.id === id) || null;
  if (head === "exam-prep") return { view: "exam-prep", examId: parts[1] || null };
  if (head === "exam-hub" || head === "exams") {
    const ex = find(parts[1]);
    return { view: "guide", examId: ex ? ex.id : exams && exams[0] ? exams[0].id : null };
  }
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
      title: `Free ${examLabel} AI Speaking & Writing Practice with Feedback | LandingPrep`,
      description: `Two-way voice practice and instant writing feedback for ${examLabel}. Speak naturally with an AI examiner, get model answers and rubric-based scoring \u2014 free, browser-based, no signup.`
    });
  }, [exam == null ? void 0 : exam.id]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "agents", onNav }), /* @__PURE__ */ React.createElement("div", { className: "shell", style: { paddingTop: "2rem", paddingBottom: "4rem" } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: "1rem" } }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow", style: { color: "var(--accent)" } }, "AI Agents"), /* @__PURE__ */ React.createElement("h1", { className: "h1", style: { margin: "8px 0 4px", fontSize: "clamp(28px,4.5vw,42px)" } }, "Practice with AI"), /* @__PURE__ */ React.createElement("p", { className: "muted", style: { margin: 0, maxWidth: 640 } }, "Two-way voice speaking practice and instant writing feedback \u2014 both built on the same heuristic scoring engine that powers our mocks.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", flexWrap: "wrap", margin: "1.5rem 0" } }, exams.map(
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
    "\u{1F3A4} AI Speaking Agent"
  ), support.writing && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: `wa-tab ${tab === "writing" ? "active" : ""}`,
      style: tab === "writing" ? { borderBottomColor: accentColor, color: accentColor } : {},
      onClick: () => setTab("writing")
    },
    "\u270D\uFE0F AI Writing Agent"
  )), tab === "speaking" && support.speaking ? /* @__PURE__ */ React.createElement(window.LP_SpeakingAgent, { exam }) : /* @__PURE__ */ React.createElement(window.LP_WritingAgent, { exam }))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
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
    let io;
    const setup = setTimeout(() => {
      const els = [...document.querySelectorAll(".reveal:not(.is-visible)")];
      if (reduce || typeof IntersectionObserver === "undefined") {
        els.forEach(reveal);
        return;
      }
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: "0px 0px -5% 0px", threshold: 0.05 });
      els.forEach((el) => io.observe(el));
    }, 50);
    const fallback = setTimeout(() => {
      document.querySelectorAll(".reveal:not(.is-visible)").forEach(reveal);
    }, 1100);
    return () => {
      clearTimeout(setup);
      clearTimeout(fallback);
      if (io) io.disconnect();
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
      window.LP_MockTest,
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
  } else if (view === "learning") {
    content = /* @__PURE__ */ React.createElement(window.LP_LearningClub, { onNav, exams });
  } else if (view === "agents") {
    content = /* @__PURE__ */ React.createElement(AgentsHub, { onNav, exams, exam: activeExam, onSelectExam: (e) => setExam(e) });
  } else if (view === "progress") {
    content = /* @__PURE__ */ React.createElement(window.LP_Progress, { onNav, exams, onPractice });
  } else if (view === "exam-prep") {
    content = /* @__PURE__ */ React.createElement(window.LP_ExamPrep, { onNav, onPractice, exams, initialExamId: exam ? exam.id : null });
  } else if (view === "tools") {
    content = /* @__PURE__ */ React.createElement(window.LP_Tools, { onNav, initialTab: (window.location.hash || "").indexOf("planner") >= 0 ? "planner" : void 0 });
  } else if (view === "colleges") {
    content = /* @__PURE__ */ React.createElement(window.LP_Colleges, { onNav, initialTab: collegesTab, initialCountry: collegesCountry });
  } else if (view === "blog") {
    content = /* @__PURE__ */ React.createElement(window.LP_Blog, { onNav });
  } else if (view === "languages") {
    content = /* @__PURE__ */ React.createElement(window.LP_Languages, { onNav });
  } else if (view === "lessons") {
    content = /* @__PURE__ */ React.createElement(window.LP_Lessons, { onNav });
  } else if (view === "login") {
    content = /* @__PURE__ */ React.createElement(window.LP_LoginScreen, { onNav, onSuccess: () => setView("progress") });
  } else {
    content = /* @__PURE__ */ React.createElement(window.LP_Home, { onGuide, onPractice, onNav });
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, content, window.LP_ChatbotWidget && /* @__PURE__ */ React.createElement(window.LP_ChatbotWidget, null));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
