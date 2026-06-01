"use strict";
(function() {
  const OPT = "lp_reminder_optin";
  const SEEN = "lp_last_seen";
  const dayKey = () => Math.floor(Date.now() / 864e5);
  const supported = () => typeof Notification !== "undefined";
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
  async function maybeRemind() {
    try {
      const today = dayKey();
      if (!isOptedIn()) {
        localStorage.setItem(SEEN, String(today));
        return;
      }
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
  window.LP_REMINDERS = { optIn, optOut, isOptedIn, maybeRemind };
  window.LP_ReminderBell = ReminderBell;
})();
