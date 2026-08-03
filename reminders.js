"use strict";
(function() {
  const OPT = "lp_reminder_optin";
  const SEEN = "lp_last_seen";
  const EXAM_DATE = "lp_exam_date";
  const EXAM_NAME = "lp_exam_name";
  const EXAM_FIRED = "lp_exam_fired";
  const MILESTONES = [7, 3, 1, 0];
  const dayKey = () => Math.floor(Date.now() / 864e5);
  const supported = () => typeof Notification !== "undefined";
  function daysUntil(str) {
    if (!str) return null;
    const p = String(str).split("-").map(Number);
    if (p.length !== 3 || p.some(isNaN)) return null;
    const exam = new Date(p[0], p[1] - 1, p[2]);
    exam.setHours(0, 0, 0, 0);
    const now = /* @__PURE__ */ new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((exam - now) / 864e5);
  }
  function getExam() {
    try {
      return { date: localStorage.getItem(EXAM_DATE) || "", name: localStorage.getItem(EXAM_NAME) || "" };
    } catch (e) {
      return { date: "", name: "" };
    }
  }
  function setExam(date, name) {
    try {
      localStorage.setItem(EXAM_DATE, date);
      localStorage.setItem(EXAM_NAME, name || "exam");
      localStorage.removeItem(EXAM_FIRED);
    } catch (e) {
    }
  }
  function clearExam() {
    try {
      [EXAM_DATE, EXAM_NAME, EXAM_FIRED].forEach((k) => localStorage.removeItem(k));
    } catch (e) {
    }
  }
  function urlB64ToUint8Array(base64) {
    const pad = "=".repeat((4 - base64.length % 4) % 4);
    const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(b64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }
  async function getPushSub() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
    const key = window.LP_VAPID_PUBLIC;
    if (!key) return null;
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(key) });
    return sub;
  }
  async function registerExamPush(date, name) {
    try {
      const sub = await getPushSub();
      if (!sub) return false;
      const base = window.LP_API_BASE || "";
      const r = await fetch(base + "/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, exam: { date, name } })
      });
      return r.ok;
    } catch (e) {
      return false;
    }
  }
  async function clearExamPush() {
    try {
      const sub = await getPushSub();
      if (!sub) return;
      const base = window.LP_API_BASE || "";
      await fetch(base + "/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, exam: null })
      });
    } catch (e) {
    }
  }
  function isOptedIn() {
    try {
      return localStorage.getItem(OPT) === "1" && supported() && Notification.permission === "granted";
    } catch (e) {
      return false;
    }
  }
  async function optIn() {
    if (!supported()) return { ok: false, error: "Notifications aren't supported in this browser." };
    let perm = Notification.permission;
    if (perm === "default") {
      try {
        perm = await Notification.requestPermission();
      } catch (e) {
        perm = "denied";
      }
    }
    if (perm !== "granted") return { ok: false, error: "Notifications are blocked. Enable them in your browser settings to get reminders." };
    try {
      localStorage.setItem(OPT, "1");
    } catch (e) {
    }
    return { ok: true };
  }
  function optOut() {
    try {
      localStorage.removeItem(OPT);
    } catch (e) {
    }
  }
  async function showNote(title, body) {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(title, { body, icon: "/icon.svg", badge: "/icon.svg", tag: "lp-streak" });
      } else if (supported()) {
        new Notification(title, { body, icon: "/icon.svg" });
      }
    } catch (e) {
    }
  }
  async function checkExam() {
    try {
      if (!isOptedIn()) return;
      const { date, name } = getExam();
      const days = daysUntil(date);
      if (days === null || days < 0) return;
      let fired = [];
      try {
        fired = JSON.parse(localStorage.getItem(EXAM_FIRED) || "[]");
      } catch (e) {
      }
      const reached = MILESTONES.filter((m) => days <= m);
      const fresh = reached.filter((m) => !fired.includes(m));
      if (!fresh.length) return;
      const label = name || "exam";
      const title = days === 0 ? `${label} day! \u{1F3AF}` : `${label} in ${days} day${days === 1 ? "" : "s"} \u23F3`;
      const body = days === 0 ? "Today's the day \u2014 good luck! Keep it light: a short warm-up, not a full mock." : days === 1 ? `Your ${label} is tomorrow. One confidence run \u2014 a single section \u2014 then rest well.` : `Your ${label} is in ${days} days. Time for a full timed mock to lock in your pacing.`;
      await showNote(title, body);
      localStorage.setItem(EXAM_FIRED, JSON.stringify(Array.from(new Set(fired.concat(reached)))));
    } catch (e) {
    }
  }
  async function maybeRemind() {
    try {
      const today = dayKey();
      if (!isOptedIn()) {
        localStorage.setItem(SEEN, String(today));
        return;
      }
      await checkExam();
      const last = Number(localStorage.getItem(SEEN) || "0");
      if (last && today > last) {
        let hasHistory = false;
        try {
          hasHistory = JSON.parse(localStorage.getItem("lp_history") || "[]").length > 0;
        } catch (e) {
        }
        await showNote(
          "Keep your streak alive \u{1F525}",
          hasHistory ? "Time for today's practice \u2014 a quick mock or daily challenge keeps you sharp." : "Ready to start? Take a free mock test today."
        );
      }
      localStorage.setItem(SEEN, String(today));
    } catch (e) {
    }
  }
  function ReminderBell() {
    const { useState } = React;
    const [on, setOn] = useState(isOptedIn());
    const [msg, setMsg] = useState("");
    if (!supported()) return null;
    const toggle = async () => {
      if (on) {
        optOut();
        setOn(false);
        setMsg("Reminders off.");
      } else {
        const r = await optIn();
        if (r.ok) {
          setOn(true);
          setMsg("Daily reminders on \u{1F514}");
        } else setMsg(r.error);
      }
      setTimeout(() => setMsg(""), 3500);
    };
    return /* @__PURE__ */ React.createElement("span", { className: "reminder-bell-wrap" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: toggle, title: "Daily study reminder" }, on ? "\u{1F514} Reminders on" : "\u{1F515} Remind me daily"), msg && /* @__PURE__ */ React.createElement("span", { className: "reminder-msg" }, msg));
  }
  function ExamReminder() {
    const { useState } = React;
    const saved = getExam();
    const [name, setName] = useState(saved.name || "IELTS");
    const [date, setDate] = useState(saved.date || "");
    const [set, setSet] = useState(!!saved.date);
    const [msg, setMsg] = useState("");
    if (!supported()) return null;
    const EXAMS = ["IELTS", "TOEFL", "PTE", "Duolingo", "CELPIP", "GRE", "GMAT", "OET", "SAT", "Other"];
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const left = date ? daysUntil(date) : null;
    const save = async () => {
      if (!date) {
        setMsg("Pick your exam date first.");
        return;
      }
      if (daysUntil(date) < 0) {
        setMsg("That date is in the past.");
        return;
      }
      if (!isOptedIn()) {
        const r = await optIn();
        if (!r.ok) {
          setMsg(r.error);
          return;
        }
      }
      setExam(date, name);
      setSet(true);
      const pushed = await registerExamPush(date, name);
      setMsg(pushed ? "Set \u2014 you'll be nudged 7, 3 & 1 days before (and on the day), even with the app closed." : "Set \u2014 I'll nudge you 7, 3 & 1 days before, and on the day.");
      setTimeout(() => setMsg(""), 5e3);
    };
    const clear = () => {
      clearExam();
      clearExamPush();
      setDate("");
      setSet(false);
      setMsg("Exam reminder cleared.");
      setTimeout(() => setMsg(""), 3e3);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "exam-reminder" }, set && left !== null && left >= 0 ? /* @__PURE__ */ React.createElement("p", { style: { margin: "0 0 6px", fontWeight: 700, color: "var(--brand, #4f46e5)" } }, "\u{1F4C5} ", left === 0 ? `${name} is today \u2014 good luck!` : `${name} in ${left} day${left === 1 ? "" : "s"}`) : /* @__PURE__ */ React.createElement("p", { className: "muted", style: { margin: "0 0 6px", fontSize: 13 } }, "\u{1F3AF} Get reminded before your exam:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" } }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: name,
        onChange: (e) => setName(e.target.value),
        "aria-label": "Exam",
        style: { padding: "7px 8px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }
      },
      EXAMS.map((x) => /* @__PURE__ */ React.createElement("option", { key: x, value: x }, x))
    ), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "date",
        value: date,
        min: today,
        onChange: (e) => setDate(e.target.value),
        "aria-label": "Exam date",
        style: { padding: "6px 8px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 13 }
      }
    ), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: save, style: { fontSize: 13 } }, set ? "Update" : "Set reminder"), set && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: clear, style: { fontSize: 13, opacity: 0.75 } }, "Clear")), msg && /* @__PURE__ */ React.createElement("p", { className: "muted", style: { fontSize: 12, marginTop: 6 } }, msg));
  }
  window.LP_REMINDERS = { optIn, optOut, isOptedIn, maybeRemind, checkExam, getExam, setExam, clearExam, daysUntil, registerExamPush, clearExamPush };
  window.LP_ReminderBell = ReminderBell;
  window.LP_ExamReminder = ExamReminder;
})();
