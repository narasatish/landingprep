/* global React, window, Notification, navigator, localStorage */
"use strict";

// LandingPrep — opt-in daily study reminders (PWA notifications).
// Re-engages returning users: when opted in, a streak nudge fires the first
// time the app opens on a new day. No push server needed (client-side only).
(function () {
  const OPT = "lp_reminder_optin";
  const SEEN = "lp_last_seen";
  const EXAM_DATE = "lp_exam_date";   // "YYYY-MM-DD"
  const EXAM_NAME = "lp_exam_name";   // e.g. "IELTS"
  const EXAM_FIRED = "lp_exam_fired"; // JSON array of milestones already notified
  const MILESTONES = [7, 3, 1, 0];    // days-before-exam nudges
  const dayKey = () => Math.floor(Date.now() / 86400000);
  const supported = () => typeof Notification !== "undefined";

  // Whole-day difference (exam midnight − today midnight), timezone-safe.
  function daysUntil(str) {
    if (!str) return null;
    const p = String(str).split("-").map(Number);
    if (p.length !== 3 || p.some(isNaN)) return null;
    const exam = new Date(p[0], p[1] - 1, p[2]); exam.setHours(0, 0, 0, 0);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((exam - now) / 86400000);
  }
  function getExam() {
    try { return { date: localStorage.getItem(EXAM_DATE) || "", name: localStorage.getItem(EXAM_NAME) || "" }; }
    catch (e) { return { date: "", name: "" }; }
  }
  function setExam(date, name) {
    try {
      localStorage.setItem(EXAM_DATE, date);
      localStorage.setItem(EXAM_NAME, name || "exam");
      localStorage.removeItem(EXAM_FIRED); // reset milestones when the date changes
    } catch (e) {}
  }
  function clearExam() {
    try { [EXAM_DATE, EXAM_NAME, EXAM_FIRED].forEach((k) => localStorage.removeItem(k)); } catch (e) {}
  }

  // ── Server-side push (fires even when the app is closed) ──────────────────────
  function urlB64ToUint8Array(base64) {
    const pad = "=".repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(b64); const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }
  async function getPushSub() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
    const key = window.LP_VAPID_PUBLIC; if (!key) return null;
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(key) });
    return sub;
  }
  // Register the exam with the backend so it can push at 7/3/1/0 days even when the
  // app is closed. Best-effort: returns false (and the client-side nudge still works)
  // if push is unsupported, blocked, or the server hasn't got VAPID_PRIVATE set.
  async function registerExamPush(date, name) {
    try {
      const sub = await getPushSub(); if (!sub) return false;
      const base = window.LP_API_BASE || "";
      const r = await fetch(base + "/api/push/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, exam: { date, name } }),
      });
      return r.ok;
    } catch (e) { return false; }
  }
  async function clearExamPush() {
    try {
      const sub = await getPushSub(); if (!sub) return;
      const base = window.LP_API_BASE || "";
      await fetch(base + "/api/push/subscribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, exam: null }),
      });
    } catch (e) {}
  }

  function isOptedIn() {
    try { return localStorage.getItem(OPT) === "1" && supported() && Notification.permission === "granted"; }
    catch (e) { return false; }
  }
  async function optIn() {
    if (!supported()) return { ok: false, error: "Notifications aren't supported in this browser." };
    let perm = Notification.permission;
    if (perm === "default") { try { perm = await Notification.requestPermission(); } catch (e) { perm = "denied"; } }
    if (perm !== "granted") return { ok: false, error: "Notifications are blocked. Enable them in your browser settings to get reminders." };
    try { localStorage.setItem(OPT, "1"); } catch (e) {}
    return { ok: true };
  }
  function optOut() { try { localStorage.removeItem(OPT); } catch (e) {} }

  async function showNote(title, body) {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, { body, icon: "/icon.svg", badge: "/icon.svg", tag: "lp-streak" });
      } else if (supported()) {
        new Notification(title, { body, icon: "/icon.svg" });
      }
    } catch (e) {}
  }

  // Exam-day countdown: on app open, fire a nudge as each milestone (7/3/1/0 days
  // before the saved exam date) is reached. Each milestone fires at most once.
  async function checkExam() {
    try {
      if (!isOptedIn()) return;
      const { date, name } = getExam();
      const days = daysUntil(date);
      if (days === null || days < 0) return; // no date, or exam already passed
      let fired = [];
      try { fired = JSON.parse(localStorage.getItem(EXAM_FIRED) || "[]"); } catch (e) {}
      const reached = MILESTONES.filter((m) => days <= m);        // milestones now due
      const fresh = reached.filter((m) => !fired.includes(m));    // not yet notified
      if (!fresh.length) return;
      const label = name || "exam";
      const title = days === 0 ? `${label} day! 🎯` : `${label} in ${days} day${days === 1 ? "" : "s"} ⏳`;
      const body = days === 0
        ? "Today's the day — good luck! Keep it light: a short warm-up, not a full mock."
        : days === 1
          ? `Your ${label} is tomorrow. One confidence run — a single section — then rest well.`
          : `Your ${label} is in ${days} days. Time for a full timed mock to lock in your pacing.`;
      await showNote(title, body);
      localStorage.setItem(EXAM_FIRED, JSON.stringify(Array.from(new Set(fired.concat(reached)))));
    } catch (e) {}
  }

  // Called once on app load. Fires a nudge only when returning on a NEW day.
  async function maybeRemind() {
    try {
      const today = dayKey();
      if (!isOptedIn()) { localStorage.setItem(SEEN, String(today)); return; }
      await checkExam(); // exam-countdown nudges run every load (guarded per milestone)
      const last = Number(localStorage.getItem(SEEN) || "0");
      if (last && today > last) {
        let hasHistory = false;
        try { hasHistory = JSON.parse(localStorage.getItem("lp_history") || "[]").length > 0; } catch (e) {}
        await showNote("Keep your streak alive 🔥",
          hasHistory
            ? "Time for today's practice — a quick mock or daily challenge keeps you sharp."
            : "Ready to start? Take a free mock test today.");
      }
      localStorage.setItem(SEEN, String(today));
    } catch (e) {}
  }

  function ReminderBell() {
    const { useState } = React;
    const [on, setOn] = useState(isOptedIn());
    const [msg, setMsg] = useState("");
    if (!supported()) return null;
    const toggle = async () => {
      if (on) { optOut(); setOn(false); setMsg("Reminders off."); }
      else {
        const r = await optIn();
        if (r.ok) { setOn(true); setMsg("Daily reminders on 🔔"); }
        else setMsg(r.error);
      }
      setTimeout(() => setMsg(""), 3500);
    };
    return (
      <span className="reminder-bell-wrap">
        <button className="btn btn-sm" onClick={toggle} title="Daily study reminder">
          {on ? "🔔 Reminders on" : "🔕 Remind me daily"}
        </button>
        {msg && <span className="reminder-msg">{msg}</span>}
      </span>
    );
  }

  // Exam-date reminder widget: pick your exam + date → get 7/3/1/0-day nudges.
  function ExamReminder() {
    const { useState } = React;
    const saved = getExam();
    const [name, setName] = useState(saved.name || "IELTS");
    const [date, setDate] = useState(saved.date || "");
    const [set, setSet] = useState(!!saved.date);
    const [msg, setMsg] = useState("");
    if (!supported()) return null;
    const EXAMS = ["IELTS", "TOEFL", "PTE", "Duolingo", "CELPIP", "GRE", "GMAT", "OET", "SAT", "Other"];
    const today = new Date().toISOString().slice(0, 10);
    const left = date ? daysUntil(date) : null;
    const save = async () => {
      if (!date) { setMsg("Pick your exam date first."); return; }
      if (daysUntil(date) < 0) { setMsg("That date is in the past."); return; }
      if (!isOptedIn()) { const r = await optIn(); if (!r.ok) { setMsg(r.error); return; } }
      setExam(date, name); setSet(true);
      const pushed = await registerExamPush(date, name);
      setMsg(pushed
        ? "Set — you'll be nudged 7, 3 & 1 days before (and on the day), even with the app closed."
        : "Set — I'll nudge you 7, 3 & 1 days before, and on the day.");
      setTimeout(() => setMsg(""), 5000);
    };
    const clear = () => { clearExam(); clearExamPush(); setDate(""); setSet(false); setMsg("Exam reminder cleared."); setTimeout(() => setMsg(""), 3000); };
    return (
      <div className="exam-reminder">
        {set && left !== null && left >= 0
          ? <p style={{ margin: "0 0 6px", fontWeight: 700, color: "var(--brand, #4f46e5)" }}>
              📅 {left === 0 ? `${name} is today — good luck!` : `${name} in ${left} day${left === 1 ? "" : "s"}`}
            </p>
          : <p className="muted" style={{ margin: "0 0 6px", fontSize: 13 }}>🎯 Get reminded before your exam:</p>}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <select value={name} onChange={(e) => setName(e.target.value)} aria-label="Exam"
            style={{ padding: "7px 8px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }}>
            {EXAMS.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} aria-label="Exam date"
            style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }} />
          <button className="btn btn-sm" onClick={save} style={{ fontSize: 13 }}>{set ? "Update" : "Set reminder"}</button>
          {set && <button className="btn btn-sm" onClick={clear} style={{ fontSize: 13, opacity: 0.75 }}>Clear</button>}
        </div>
        {msg && <p className="muted" style={{ fontSize: 12, marginTop: 6 }}>{msg}</p>}
      </div>
    );
  }

  window.LP_REMINDERS = { optIn, optOut, isOptedIn, maybeRemind, checkExam, getExam, setExam, clearExam, daysUntil, registerExamPush, clearExamPush };
  window.LP_ReminderBell = ReminderBell;
  window.LP_ExamReminder = ExamReminder;
})();
