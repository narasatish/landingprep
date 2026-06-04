"use strict";
(function() {
  const { useState, useEffect } = React;
  const PF = [15, 25, 50], PB = [5, 10];
  function useFocus() {
    const [, force] = useState(0);
    useEffect(() => {
      if (!window.LP_FOCUS) return;
      return window.LP_FOCUS.subscribe(() => force((x) => x + 1));
    }, []);
    return window.LP_FOCUS;
  }
  function FocusTimer() {
    const F = useFocus();
    if (!F) return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Focus timer is loading\u2026"));
    const s = F.get();
    const modeMin = s.mode === "focus" ? s.focusMin : s.mode === "long" ? F.LONG_MIN : s.breakMin;
    const total = modeMin * 60;
    const pct = total > 0 ? Math.round((total - s.secs) / total * 100) : 0;
    const mm = String(Math.floor(s.secs / 60)).padStart(2, "0");
    const ss = String(s.secs % 60).padStart(2, "0");
    const label = s.mode === "focus" ? "Focus" : s.mode === "long" ? "Long break" : "Break";
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card pomo-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F345} Focus Timer"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "The Pomodoro technique \u2014 ", s.focusMin, " minutes of deep focus, then a ", s.breakMin, " minute break, with a longer ", F.LONG_MIN, " minute break every ", F.LONG_AFTER, " sessions. It keeps running as you browse, and you can control it from the floating button on any page."), /* @__PURE__ */ React.createElement("input", { className: "pomo-task", placeholder: "What are you working on? (optional)", value: s.task, maxLength: 80, onChange: (e) => F.setTask(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "pomo-wrap mode-" + s.mode }, /* @__PURE__ */ React.createElement("div", { className: "pomo-ring " + (s.mode === "focus" ? "focus" : "rest"), style: { "--pct": pct + "%" } }, /* @__PURE__ */ React.createElement("div", { className: "pomo-inner" }, /* @__PURE__ */ React.createElement("div", { className: "pomo-time" }, mm, ":", ss), /* @__PURE__ */ React.createElement("div", { className: "pomo-mode" }, label), s.task && s.mode === "focus" && /* @__PURE__ */ React.createElement("div", { className: "pomo-task-now" }, s.task))), /* @__PURE__ */ React.createElement("div", { className: "pomo-dots", title: "Focus sessions until a long break (" + s.cycle + "/" + F.LONG_AFTER + ")" }, Array.from({ length: F.LONG_AFTER }).map((_, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "pomo-dot" + (i < s.cycle ? " on" : "") }))), /* @__PURE__ */ React.createElement("div", { className: "tool-row btns pomo-btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: F.startStop }, s.running ? "\u23F8 Pause" : "\u25B6 Start"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: F.skip }, "\u23ED Skip"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: F.reset }, "\u21BA Reset")), /* @__PURE__ */ React.createElement("div", { className: "pomo-settings" }, /* @__PURE__ */ React.createElement("div", { className: "pomo-set-group" }, /* @__PURE__ */ React.createElement("span", null, "Focus"), PF.map((m) => /* @__PURE__ */ React.createElement("button", { key: m, className: "pomo-chip" + (s.focusMin === m ? " on" : ""), onClick: () => F.setFocus(m) }, m, "m"))), /* @__PURE__ */ React.createElement("div", { className: "pomo-set-group" }, /* @__PURE__ */ React.createElement("span", null, "Break"), PB.map((m) => /* @__PURE__ */ React.createElement("button", { key: m, className: "pomo-chip" + (s.breakMin === m ? " on" : ""), onClick: () => F.setBreak(m) }, m, "m")))), /* @__PURE__ */ React.createElement("div", { className: "pomo-stats" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, s.sessions), " session", s.sessions === 1 ? "" : "s", " today"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, s.minutes), " focus min today"))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Your daily count is saved on this device only. Tip: open the \u{1F345} button (bottom-left) to keep the timer and study sounds with you on every page."));
  }
  window.LP_FocusTimer = FocusTimer;
})();
