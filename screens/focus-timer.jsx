/* global React, window */
"use strict";

// LandingPrep — big Focus Timer view for the Tools page. A thin view over the
// global window.LP_FOCUS engine (focus-engine.js), so it stays in sync with the
// floating widget and keeps running across navigation.
(function () {
  const { useState, useEffect } = React;
  const PF = [15, 25, 50], PB = [5, 10];

  function useFocus() {
    const [, force] = useState(0);
    useEffect(() => { if (!window.LP_FOCUS) return; return window.LP_FOCUS.subscribe(() => force((x) => x + 1)); }, []);
    return window.LP_FOCUS;
  }

  function FocusTimer() {
    const F = useFocus();
    if (!F) return <div className="tool-card"><p className="tool-sub">Focus timer is loading…</p></div>;
    const s = F.get();
    const modeMin = s.mode === "focus" ? s.focusMin : s.mode === "long" ? F.LONG_MIN : s.breakMin;
    const total = modeMin * 60;
    const pct = total > 0 ? Math.round(((total - s.secs) / total) * 100) : 0;
    const mm = String(Math.floor(s.secs / 60)).padStart(2, "0");
    const ss = String(s.secs % 60).padStart(2, "0");
    const label = s.mode === "focus" ? "Focus" : s.mode === "long" ? "Long break" : "Break";

    return (
      <div className="tool-card pomo-card">
        <h2>🍅 Focus Timer</h2>
        <p className="tool-sub">The Pomodoro technique — {s.focusMin} minutes of deep focus, then a {s.breakMin} minute break, with a longer {F.LONG_MIN} minute break every {F.LONG_AFTER} sessions. It keeps running as you browse, and you can control it from the floating button on any page.</p>

        <input className="pomo-task" placeholder="What are you working on? (optional)" value={s.task} maxLength={80} onChange={(e) => F.setTask(e.target.value)} />

        <div className={"pomo-wrap mode-" + s.mode}>
          <div className={"pomo-ring " + (s.mode === "focus" ? "focus" : "rest")} style={{ "--pct": pct + "%" }}>
            <div className="pomo-inner">
              <div className="pomo-time">{mm}:{ss}</div>
              <div className="pomo-mode">{label}</div>
              {s.task && s.mode === "focus" && <div className="pomo-task-now">{s.task}</div>}
            </div>
          </div>

          <div className="pomo-dots" title={"Focus sessions until a long break (" + s.cycle + "/" + F.LONG_AFTER + ")"}>
            {Array.from({ length: F.LONG_AFTER }).map((_, i) => <span key={i} className={"pomo-dot" + (i < s.cycle ? " on" : "")} />)}
          </div>

          <div className="tool-row btns pomo-btns">
            <button className="tool-btn" onClick={F.startStop}>{s.running ? "⏸ Pause" : "▶ Start"}</button>
            <button className="tool-btn ghost" onClick={F.skip}>⏭ Skip</button>
            <button className="tool-btn ghost" onClick={F.reset}>↺ Reset</button>
          </div>

          <div className="pomo-settings">
            <div className="pomo-set-group"><span>Focus</span>{PF.map((m) => <button key={m} className={"pomo-chip" + (s.focusMin === m ? " on" : "")} onClick={() => F.setFocus(m)}>{m}m</button>)}</div>
            <div className="pomo-set-group"><span>Break</span>{PB.map((m) => <button key={m} className={"pomo-chip" + (s.breakMin === m ? " on" : "")} onClick={() => F.setBreak(m)}>{m}m</button>)}</div>
          </div>

          <div className="pomo-stats">
            <div><strong>{s.sessions}</strong> session{s.sessions === 1 ? "" : "s"} today</div>
            <div><strong>{s.minutes}</strong> focus min today</div>
          </div>
        </div>
        <p className="tool-note">Your daily count is saved on this device only. Tip: open the 🍅 button (bottom-left) to keep the timer and study sounds with you on every page.</p>
      </div>
    );
  }

  window.LP_FocusTimer = FocusTimer;
})();
