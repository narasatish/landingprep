"use strict";
(function() {
  const { useState, useEffect } = React;
  const SECTIONS = {
    ielts: ["Listening", "Reading", "Writing", "Speaking"],
    toefl: ["Reading", "Listening", "Speaking", "Writing"],
    pte: ["Speaking & Writing", "Reading", "Listening"],
    celpip: ["Listening", "Reading", "Writing", "Speaking"],
    duolingo: ["Literacy", "Comprehension", "Conversation", "Production"],
    gre: ["Verbal Reasoning", "Quantitative", "Analytical Writing"],
    gmat: ["Quantitative", "Verbal", "Data Insights"]
  };
  const EXAM_NAMES = { ielts: "IELTS", toefl: "TOEFL iBT", pte: "PTE Academic", celpip: "CELPIP", duolingo: "Duolingo English Test", gre: "GRE General Test", gmat: "GMAT Focus" };
  const STORE = "lp_study_plan";
  function daysBetween(fromTs, toTs) {
    return Math.ceil((toTs - fromTs) / 864e5);
  }
  function skillKey(section) {
    const s = String(section).toLowerCase();
    if (s.includes("listen")) return "listening";
    if (s.includes("data")) return "data";
    if (s.includes("quant")) return "quant";
    if (s.includes("verbal")) return "verbal";
    if (s.includes("analytical") || s.includes("essay")) return "awa";
    if (s.includes("&") || s.includes("writ") || s.includes("production")) return "writing";
    if (s.includes("speak") || s.includes("conversation")) return "speaking";
    if (s.includes("read") || s.includes("comprehension") || s.includes("literacy")) return "reading";
    return "mixed";
  }
  const DRILLS = {
    listening: [
      "Do 2 full listening sections at normal speed, then replay and transcribe every answer you missed.",
      "Note-taking drill on 1 long lecture: capture signposts (firstly, however, in conclusion) and predict answers before they're said.",
      "Gap-fill / form-completion set \u2014 focus on spelling, numbers, dates and plurals (the careless-loss zone)."
    ],
    reading: [
      "Time 1 full passage set: skim for gist first, then scan for detail; review every wrong answer's keyword trap.",
      "True/False/Not-Given (or inference) drill \u2014 justify each answer with the exact line from the text.",
      "Build a 20-word academic vocabulary list from today's passages and add them to flashcards."
    ],
    writing: [
      "Write 1 essay under time, self-score with the rubric, then paste it into the AI Writing Agent for Task-Response, Coherence, Lexical & Grammar feedback.",
      "Rewrite yesterday's essay fixing the AI's top 2 issues; focus on linking words and clear topic sentences.",
      "Drill the shorter task (graph/letter/summary): master 1 template and 8 high-value phrases."
    ],
    speaking: [
      "Record 3 answers with the AI Speaking Agent; review fluency, pronunciation and the model answer, then re-record your weakest one.",
      "Long-turn drill: 1-min prep, 2-min talk using a 4-point structure \u2014 time it strictly.",
      "Shadow a native audio clip for 10 minutes (repeat aloud in sync) to fix rhythm and intonation."
    ],
    quant: [
      "Drill 20 problem-solving questions; log every error by topic (algebra, geometry, number properties) in the Error Log.",
      "Redo yesterday's missed questions from scratch without notes \u2014 master the method, not the answer.",
      "Timed set: 15 questions in 25 minutes to build pacing; review every trap and shortcut."
    ],
    verbal: [
      "Drill 15 verbal questions; for each wrong one write why the right answer is right AND why yours was wrong.",
      "Learn 25 high-frequency words and practise text-completion using context clues.",
      "Reading-comprehension focus: summarise each passage's main point and author's tone in one line."
    ],
    awa: [
      "Write 1 Issue/Argument essay in 30 minutes (outline first); score with the rubric and the AI Writing Agent.",
      "Study 3 high-scoring sample essays and copy their structure and transition phrases into your notes."
    ],
    data: [
      "Drill 12 Data Insights questions (graphs, tables, two-part analysis); practise reading charts fast and accurately.",
      "Multi-source reasoning: combine information from 2\u20133 tabs under time pressure."
    ],
    mixed: ["Targeted mixed drills on your weakest question types; review each mistake with 'Explain with AI'."]
  };
  const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function buildWeeks({ examId, daysLeft, ordered, weakKeys, target }) {
    const weeks = Math.max(1, Math.ceil(daysLeft / 7));
    const out = [];
    let dayCounter = 0;
    for (let w = 0; w < weeks && dayCounter < daysLeft; w++) {
      const isFirst = w === 0, isLast = w === weeks - 1;
      const focus = isFirst ? "Diagnose & fundamentals" : isLast ? "Full mocks, review & test-day readiness" : `Skill-building${weakKeys.length ? " \u2014 " + weakKeys.join(" & ") : ""}`;
      const days = [];
      for (let d = 0; d < 7 && dayCounter < daysLeft; d++, dayCounter++) {
        const dn = DAY_NAMES[d];
        let task;
        if (isFirst && d === 0) task = `Baseline: take one full ${EXAM_NAMES[examId]} mock, then learn each section's exact format & timing.`;
        else if (d === 5) task = isLast ? `Full timed mock under real exam conditions \u2014 aim for ${target || "your target"}.` : "Half / section mock on your two weakest areas, strictly timed.";
        else if (d === 6) task = "Review day: re-drill every mistake from this week, then rest \u2014 keep it light.";
        else {
          const sec = ordered[(d + w) % ordered.length] || ordered[0] || "Mixed";
          const dr = DRILLS[skillKey(sec)] || DRILLS.mixed;
          task = `${sec}: ${dr[w % dr.length]}`;
        }
        days.push({ d: dn, task });
      }
      out.push({
        week: w + 1,
        focus,
        days,
        milestone: isFirst ? "Know your baseline score & weakest sections" : isLast ? `Hit ${target || "your target"} consistently and lock in test-day logistics` : "Beat last week's mock by ~+0.5 band / +5\u201310 points"
      });
    }
    return out;
  }
  function weakSectionsFor(examId) {
    let hist = [];
    try {
      hist = JSON.parse(localStorage.getItem("lp_history") || "[]");
    } catch (e) {
    }
    const rows = hist.filter((h) => h.exam === examId);
    const totals = {};
    rows.forEach((h) => {
      const ss = h.sectionScores || h.sections || {};
      Object.entries(ss).forEach(([k, v]) => {
        const num = typeof v === "number" ? v : v && (v.pct != null ? v.pct : v.score != null ? v.score : v.band);
        if (typeof num === "number") {
          (totals[k] = totals[k] || []).push(num);
        }
      });
    });
    const avg = Object.entries(totals).map(([k, arr]) => [k, arr.reduce((a, b) => a + b, 0) / arr.length]);
    avg.sort((a, b) => a[1] - b[1]);
    return avg.slice(0, 2).map((x) => x[0]);
  }
  function buildPlan({ examId, daysLeft, target, hours }) {
    const hoursPerDay = Number(hours) || 2;
    const sections = SECTIONS[examId] || [];
    const weakKeys = weakSectionsFor(examId);
    const ordered = [...sections].sort((a, b) => {
      const aw = weakKeys.some((k) => a.toLowerCase().includes(String(k).toLowerCase())) ? 1 : 0;
      const bw = weakKeys.some((k) => b.toLowerCase().includes(String(k).toLowerCase())) ? 1 : 0;
      return bw - aw;
    });
    const weeks = Math.max(1, Math.ceil(daysLeft / 7));
    const phases = [];
    const diagDays = Math.max(1, Math.round(daysLeft * 0.2));
    const mockDays = Math.max(1, Math.round(daysLeft * 0.25));
    const buildDays = Math.max(1, daysLeft - diagDays - mockDays);
    phases.push({
      title: "Phase 1 \xB7 Diagnose & set your baseline",
      span: `${diagDays} day${diagDays > 1 ? "s" : ""}`,
      tasks: [
        `Take one full-length free ${EXAM_NAMES[examId]} mock to get your baseline score.`,
        `Note your weakest sections${weakKeys.length ? " (history shows: " + weakKeys.join(", ") + ")" : ""}.`,
        `Learn the exact format & timing of each section: ${sections.join(", ")}.`,
        `Set a daily routine of ~${hoursPerDay}h with a fixed study time.`
      ]
    });
    const buildTasks = ordered.map(
      (s, i) => `${i === 0 ? "Priority" : i === 1 ? "Priority" : "Maintain"}: ${s} \u2014 daily targeted drills${i < 2 ? " + review every mistake with 'Explain with AI'" : ""}.`
    );
    buildTasks.push("Build vocabulary daily with flashcards (spaced repetition) and the Daily Challenge.");
    buildTasks.push("Use the AI Speaking & Writing agents for instant feedback on those sections.");
    phases.push({
      title: "Phase 2 \xB7 Build skills (weak areas first)",
      span: `${buildDays} day${buildDays > 1 ? "s" : ""}`,
      tasks: buildTasks
    });
    phases.push({
      title: "Phase 3 \xB7 Full mocks & review",
      span: `${mockDays} day${mockDays > 1 ? "s" : ""}`,
      tasks: [
        `Sit a timed full ${EXAM_NAMES[examId]} mock every 2\u20133 days under real conditions.`,
        "After each mock, review every wrong answer and re-drill that question type.",
        `Track your trend in My Progress until you consistently hit ${target || "your target"}.`,
        "Final 2 days: light review, sleep well, prepare ID & test-day logistics."
      ]
    });
    const weeksPlan = buildWeeks({ examId, daysLeft, ordered, weakKeys, target });
    return { examId, examName: EXAM_NAMES[examId], daysLeft, weeks, target, hoursPerDay, weakKeys, phases, weeksPlan, createdTs: Date.now() };
  }
  function PlannerForm({ initial, onGenerate }) {
    const [examId, setExamId] = useState(initial.examId || "ielts");
    const [date, setDate] = useState(initial.date || "");
    const [target, setTarget] = useState(initial.target || "");
    const [hours, setHours] = useState(initial.hours || 2);
    const submit = (e) => {
      e.preventDefault();
      const toTs = date ? (/* @__PURE__ */ new Date(date + "T00:00:00")).getTime() : Date.now() + 30 * 864e5;
      const daysLeft = Math.max(3, daysBetween(Date.now(), toTs));
      onGenerate({ examId, date, target, hours: Number(hours) || 2, daysLeft });
    };
    return /* @__PURE__ */ React.createElement("form", { className: "planner-form tool-card", onSubmit: submit }, /* @__PURE__ */ React.createElement("h2", null, "Build my study plan"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Tell us your exam and test date \u2014 we'll build a personalised plan around your weakest sections."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Exam", /* @__PURE__ */ React.createElement("select", { value: examId, onChange: (e) => setExamId(e.target.value) }, Object.keys(EXAM_NAMES).map((id) => /* @__PURE__ */ React.createElement("option", { key: id, value: id }, EXAM_NAMES[id])))), /* @__PURE__ */ React.createElement("label", null, "Test date", /* @__PURE__ */ React.createElement("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value) })), /* @__PURE__ */ React.createElement("label", null, "Target score", /* @__PURE__ */ React.createElement("input", { type: "text", value: target, placeholder: "e.g. Band 7", onChange: (e) => setTarget(e.target.value) })), /* @__PURE__ */ React.createElement("label", null, "Hours / day", /* @__PURE__ */ React.createElement("input", { type: "number", min: "1", max: "10", step: "0.5", value: hours, onChange: (e) => setHours(e.target.value) }))), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", type: "submit" }, "\u2728 Generate my plan"));
  }
  function PlanView({ plan, onNav, onReset }) {
    const [coach, setCoach] = useState("");
    const [coachState, setCoachState] = useState("idle");
    useEffect(() => {
      let cancelled = false;
      (async () => {
        if (!window.LP_AI_TUTOR || !window.LP_AI_TUTOR.generate) return;
        setCoachState("loading");
        try {
          const prompt = `You are an encouraging ${plan.examName} coach. In 2\u20133 sentences, give motivating, specific advice to a student who has ${plan.daysLeft} days until their test, studies about ${plan.hoursPerDay} hours a day, is targeting ${plan.target || "a strong score"}${plan.weakKeys.length ? ", and is weakest at " + plan.weakKeys.join(" and ") : ""}. Be warm and practical. Do not use a greeting.`;
          const out = await window.LP_AI_TUTOR.generate(prompt);
          const clean = (out || "").trim();
          if (!cancelled && clean && !/AI Tutor is offline/i.test(clean)) {
            setCoach(clean);
            setCoachState("done");
          } else if (!cancelled) setCoachState("idle");
        } catch (e) {
          if (!cancelled) setCoachState("idle");
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [plan.createdTs]);
    return /* @__PURE__ */ React.createElement("div", { className: "plan-view" }, /* @__PURE__ */ React.createElement("div", { className: "plan-summary tool-card" }, /* @__PURE__ */ React.createElement("div", { className: "plan-summary-head" }, /* @__PURE__ */ React.createElement("h2", null, "Your ", plan.examName, " plan"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: onReset }, "\u21BB Rebuild")), /* @__PURE__ */ React.createElement("div", { className: "plan-stats" }, /* @__PURE__ */ React.createElement("div", { className: "plan-stat" }, /* @__PURE__ */ React.createElement("span", null, plan.daysLeft), "days left"), /* @__PURE__ */ React.createElement("div", { className: "plan-stat" }, /* @__PURE__ */ React.createElement("span", null, plan.hoursPerDay, "h"), "per day"), /* @__PURE__ */ React.createElement("div", { className: "plan-stat" }, /* @__PURE__ */ React.createElement("span", null, plan.target || "\u2014"), "target"), /* @__PURE__ */ React.createElement("div", { className: "plan-stat" }, /* @__PURE__ */ React.createElement("span", null, plan.weeks), "week", plan.weeks > 1 ? "s" : "")), plan.weakKeys.length > 0 && /* @__PURE__ */ React.createElement("p", { className: "plan-weak" }, "\u{1F3AF} Focus areas from your history: ", /* @__PURE__ */ React.createElement("strong", null, plan.weakKeys.join(", "))), coachState === "loading" && /* @__PURE__ */ React.createElement("p", { className: "plan-coach loading" }, "\u2728 Personalising coach tips\u2026"), coachState === "done" && /* @__PURE__ */ React.createElement("p", { className: "plan-coach" }, /* @__PURE__ */ React.createElement("strong", null, "\u2728 Coach:"), " ", coach)), plan.phases.map((ph, i) => /* @__PURE__ */ React.createElement("div", { className: "plan-phase tool-card", key: i }, /* @__PURE__ */ React.createElement("div", { className: "plan-phase-head" }, /* @__PURE__ */ React.createElement("h3", null, ph.title), /* @__PURE__ */ React.createElement("span", { className: "plan-span" }, ph.span)), /* @__PURE__ */ React.createElement("ul", { className: "plan-tasks" }, ph.tasks.map((t, j) => /* @__PURE__ */ React.createElement("li", { key: j }, t))))), plan.weeksPlan && plan.weeksPlan.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "plan-weeks-wrap" }, /* @__PURE__ */ React.createElement("h3", { className: "plan-weeks-title" }, "\u{1F4C5} Your week-by-week schedule"), plan.weeksPlan.map((wk) => /* @__PURE__ */ React.createElement("div", { className: "plan-week tool-card", key: wk.week }, /* @__PURE__ */ React.createElement("div", { className: "plan-week-head" }, /* @__PURE__ */ React.createElement("span", { className: "plan-week-no" }, "Week ", wk.week), /* @__PURE__ */ React.createElement("span", { className: "plan-week-focus" }, wk.focus)), /* @__PURE__ */ React.createElement("table", { className: "plan-week-table" }, /* @__PURE__ */ React.createElement("tbody", null, wk.days.map((dy, k) => /* @__PURE__ */ React.createElement("tr", { key: k, className: dy.d === "Sun" ? "plan-day-rest" : "" }, /* @__PURE__ */ React.createElement("td", { className: "plan-day-name" }, dy.d), /* @__PURE__ */ React.createElement("td", { className: "plan-day-task" }, dy.task))))), /* @__PURE__ */ React.createElement("p", { className: "plan-week-milestone" }, "\u{1F3C1} ", /* @__PURE__ */ React.createElement("strong", null, "Milestone:"), " ", wk.milestone)))), /* @__PURE__ */ React.createElement("div", { className: "plan-cta tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "Ready? Start now"), /* @__PURE__ */ React.createElement("div", { className: "plan-cta-btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: () => onNav && onNav("exam-prep") }, "\u25B6 Practise ", plan.examName), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onNav && onNav("learning") }, "\u{1F4DA} Learning Club"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onNav && onNav("progress") }, "\u{1F4CA} My Progress"))));
  }
  function StudyPlannerPanel({ onNav }) {
    const [plan, setPlan] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem(STORE) || "null");
      } catch (e) {
        return null;
      }
    });
    const generate = (cfg) => {
      const p = buildPlan(cfg);
      setPlan(p);
      try {
        localStorage.setItem(STORE, JSON.stringify({ ...p, date: cfg.date }));
      } catch (e) {
      }
    };
    const initial = plan ? { examId: plan.examId, date: plan.date, target: plan.target, hours: plan.hoursPerDay } : {};
    return /* @__PURE__ */ React.createElement("div", { className: "planner-panel" }, !plan ? /* @__PURE__ */ React.createElement(PlannerForm, { initial, onGenerate: generate }) : /* @__PURE__ */ React.createElement(PlanView, { plan, onNav, onReset: () => setPlan(null) }));
  }
  window.LP_StudyPlannerPanel = StudyPlannerPanel;
})();
