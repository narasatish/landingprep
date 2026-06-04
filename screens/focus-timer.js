"use strict";
(function() {
  const { useState, useEffect } = React;
  const PF = [15, 25, 50], PB = [5, 10], LONG_AFTER = 4, LONG_MIN = 15;
  const todayKey = () => {
    const d = /* @__PURE__ */ new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  };
  function loadStats() {
    try {
      const s = JSON.parse(localStorage.getItem("lp_pomo") || "{}");
      return s && s.date === todayKey() ? s : { date: todayKey(), sessions: 0, minutes: 0 };
    } catch (e) {
      return { date: todayKey(), sessions: 0, minutes: 0 };
    }
  }
  function saveStats(s) {
    try {
      localStorage.setItem("lp_pomo", JSON.stringify(s));
    } catch (e) {
    }
  }
  function chime() {
    try {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return;
      const c = new A();
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g);
      g.connect(c.destination);
      o.type = "sine";
      o.frequency.value = 880;
      const t = c.currentTime;
      g.gain.setValueAtTime(1e-4, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(1e-4, t + 0.7);
      o.start(t);
      o.stop(t + 0.72);
    } catch (e) {
    }
  }
  function FocusTimer() {
    const [focusMin, setFocusMin] = useState(25);
    const [breakMin, setBreakMin] = useState(5);
    const [mode, setMode] = useState("focus");
    const [secs, setSecs] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [cycle, setCycle] = useState(0);
    const [task, setTask] = useState("");
    const [stats, setStats] = useState(loadStats);
    const notify = (msg) => {
      try {
        if ("Notification" in window && Notification.permission === "granted") new Notification("LandingPrep Focus Timer", { body: msg, silent: true });
      } catch (e) {
      }
    };
    useEffect(() => {
      if (!running) return;
      const t = setInterval(() => setSecs((s) => s > 0 ? s - 1 : 0), 1e3);
      return () => clearInterval(t);
    }, [running]);
    useEffect(() => {
      if (secs !== 0) return;
      chime();
      if (mode === "focus") {
        setStats((p) => {
          const ns = { date: todayKey(), sessions: (p.sessions || 0) + 1, minutes: (p.minutes || 0) + focusMin };
          saveStats(ns);
          return ns;
        });
        const nc = cycle + 1;
        if (nc >= LONG_AFTER) {
          setCycle(0);
          setMode("long");
          setSecs(LONG_MIN * 60);
        } else {
          setCycle(nc);
          setMode("break");
          setSecs(breakMin * 60);
        }
        notify("Focus session done \u2014 time for a break \u{1F389}");
      } else {
        setMode("focus");
        setSecs(focusMin * 60);
        notify("Break over \u2014 back to focus \u{1F4AA}");
      }
    }, [secs]);
    const modeMin = mode === "focus" ? focusMin : mode === "long" ? LONG_MIN : breakMin;
    const total = modeMin * 60;
    const pct = total > 0 ? Math.round((total - secs) / total * 100) : 0;
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    const label = mode === "focus" ? "Focus" : mode === "long" ? "Long break" : "Break";
    const start = () => {
      try {
        if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
      } catch (e) {
      }
      setRunning((r) => !r);
    };
    const reset = () => {
      setRunning(false);
      setMode("focus");
      setCycle(0);
      setSecs(focusMin * 60);
    };
    const skip = () => {
      setRunning(false);
      if (mode === "focus") {
        const nc = cycle + 1;
        if (nc >= LONG_AFTER) {
          setCycle(0);
          setMode("long");
          setSecs(LONG_MIN * 60);
        } else {
          setCycle(nc);
          setMode("break");
          setSecs(breakMin * 60);
        }
      } else {
        setMode("focus");
        setSecs(focusMin * 60);
      }
    };
    const pickFocus = (m) => {
      setFocusMin(m);
      if (!running && mode === "focus") setSecs(m * 60);
    };
    const pickBreak = (m) => {
      setBreakMin(m);
      if (!running && mode === "break") setSecs(m * 60);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card pomo-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F345} Focus Timer"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "The Pomodoro technique \u2014 ", focusMin, " minutes of deep focus, then a ", breakMin, " minute break, with a longer ", LONG_MIN, " minute break every ", LONG_AFTER, " sessions. Beat procrastination and study longer without burning out."), /* @__PURE__ */ React.createElement("input", { className: "pomo-task", placeholder: "What are you working on? (optional)", value: task, maxLength: 80, onChange: (e) => setTask(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "pomo-wrap mode-" + mode }, /* @__PURE__ */ React.createElement("div", { className: "pomo-ring " + (mode === "focus" ? "focus" : "rest"), style: { "--pct": pct + "%" } }, /* @__PURE__ */ React.createElement("div", { className: "pomo-inner" }, /* @__PURE__ */ React.createElement("div", { className: "pomo-time" }, mm, ":", ss), /* @__PURE__ */ React.createElement("div", { className: "pomo-mode" }, label), task && mode === "focus" && /* @__PURE__ */ React.createElement("div", { className: "pomo-task-now" }, task))), /* @__PURE__ */ React.createElement("div", { className: "pomo-dots", title: "Focus sessions until a long break (" + cycle + "/" + LONG_AFTER + ")" }, Array.from({ length: LONG_AFTER }).map((_, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "pomo-dot" + (i < cycle ? " on" : "") }))), /* @__PURE__ */ React.createElement("div", { className: "tool-row btns pomo-btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: start }, running ? "\u23F8 Pause" : "\u25B6 Start"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: skip }, "\u23ED Skip"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: reset }, "\u21BA Reset")), /* @__PURE__ */ React.createElement("div", { className: "pomo-settings" }, /* @__PURE__ */ React.createElement("div", { className: "pomo-set-group" }, /* @__PURE__ */ React.createElement("span", null, "Focus"), PF.map((m) => /* @__PURE__ */ React.createElement("button", { key: m, className: "pomo-chip" + (focusMin === m ? " on" : ""), onClick: () => pickFocus(m) }, m, "m"))), /* @__PURE__ */ React.createElement("div", { className: "pomo-set-group" }, /* @__PURE__ */ React.createElement("span", null, "Break"), PB.map((m) => /* @__PURE__ */ React.createElement("button", { key: m, className: "pomo-chip" + (breakMin === m ? " on" : ""), onClick: () => pickBreak(m) }, m, "m")))), /* @__PURE__ */ React.createElement("div", { className: "pomo-stats" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, stats.sessions), " session", stats.sessions === 1 ? "" : "s", " today"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, stats.minutes), " focus min today"))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Your daily count is saved on this device only. Keep this tab open while the timer runs."));
  }
  window.LP_FocusTimer = FocusTimer;
})();
