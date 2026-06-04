/* global window, localStorage */
"use strict";

// LandingPrep — global Focus Timer engine (single source of truth).
// A plain-JS singleton with its own interval, so the Pomodoro keeps running as the
// user navigates between pages. React views (the big Tools view + the floating
// widget) subscribe to it and call its methods; they never own the timer state.
(function () {
  if (window.LP_FOCUS) return;
  const LONG_AFTER = 4, LONG_MIN = 15;

  const todayKey = () => { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
  function loadStats() {
    try { const s = JSON.parse(localStorage.getItem("lp_pomo") || "{}"); return (s && s.date === todayKey()) ? { sessions: s.sessions || 0, minutes: s.minutes || 0 } : { sessions: 0, minutes: 0 }; }
    catch (e) { return { sessions: 0, minutes: 0 }; }
  }
  function saveStats() { try { localStorage.setItem("lp_pomo", JSON.stringify({ date: todayKey(), sessions: s.sessions, minutes: s.minutes })); } catch (e) {} }
  function chime() {
    try {
      const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
      const c = new A(); const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination); o.type = "sine"; o.frequency.value = 880;
      const t = c.currentTime;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      o.start(t); o.stop(t + 0.72);
    } catch (e) {}
  }
  function notify(msg) { try { if ("Notification" in window && Notification.permission === "granted") new Notification("LandingPrep Focus Timer", { body: msg, silent: true }); } catch (e) {} }

  const init = loadStats();
  const s = { running: false, mode: "focus", secs: 25 * 60, focusMin: 25, breakMin: 5, cycle: 0, task: "", sessions: init.sessions, minutes: init.minutes };
  const subs = new Set();
  let timer = null;
  const emit = () => subs.forEach((fn) => { try { fn(s); } catch (e) {} });
  const dur = (mode) => (mode === "focus" ? s.focusMin : mode === "long" ? LONG_MIN : s.breakMin) * 60;

  function tick() {
    s.secs -= 1;
    if (s.secs > 0) { emit(); return; }
    chime();
    if (s.mode === "focus") {
      s.sessions += 1; s.minutes += s.focusMin; saveStats();
      s.cycle += 1;
      if (s.cycle >= LONG_AFTER) { s.cycle = 0; s.mode = "long"; } else { s.mode = "break"; }
      notify("Focus session done — time for a break 🎉");
    } else { s.mode = "focus"; notify("Break over — back to focus 💪"); }
    s.secs = dur(s.mode);
    emit();
  }
  function clear() { if (timer) { clearInterval(timer); timer = null; } }
  function startStop() {
    if (s.running) { s.running = false; clear(); }
    else { try { if ("Notification" in window && Notification.permission === "default") Notification.requestPermission(); } catch (e) {} s.running = true; clear(); timer = setInterval(tick, 1000); }
    emit();
  }
  function reset() { s.running = false; clear(); s.mode = "focus"; s.cycle = 0; s.secs = dur("focus"); emit(); }
  function skip() {
    s.running = false; clear();
    if (s.mode === "focus") { s.cycle += 1; if (s.cycle >= LONG_AFTER) { s.cycle = 0; s.mode = "long"; } else { s.mode = "break"; } }
    else { s.mode = "focus"; }
    s.secs = dur(s.mode); emit();
  }
  function setFocus(m) { s.focusMin = m; if (!s.running && s.mode === "focus") s.secs = m * 60; emit(); }
  function setBreak(m) { s.breakMin = m; if (!s.running && s.mode === "break") s.secs = m * 60; emit(); }
  function setTask(t) { s.task = (t || "").slice(0, 80); emit(); }

  window.LP_FOCUS = {
    LONG_AFTER, LONG_MIN,
    get: () => s,
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    startStop, reset, skip, setFocus, setBreak, setTask,
  };
})();
