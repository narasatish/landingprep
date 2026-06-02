"use strict";
(function() {
  const { useState } = React;
  const LEVELS = [
    { min: 0, title: "Rookie", emoji: "\u{1F331}" },
    { min: 100, title: "Learner", emoji: "\u{1F4D7}" },
    { min: 250, title: "Achiever", emoji: "\u{1F4D8}" },
    { min: 450, title: "Scholar", emoji: "\u{1F393}" },
    { min: 700, title: "High-Flyer", emoji: "\u{1F680}" },
    { min: 1e3, title: "Expert", emoji: "\u2B50" },
    { min: 1400, title: "Master", emoji: "\u{1F3C5}" },
    { min: 1900, title: "Champion", emoji: "\u{1F3C6}" },
    { min: 2500, title: "Legend", emoji: "\u{1F451}" }
  ];
  function readJSON(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || fallback);
    } catch (e) {
      try {
        return JSON.parse(fallback);
      } catch (_) {
        return null;
      }
    }
  }
  function dayKey(d) {
    const x = d || /* @__PURE__ */ new Date();
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  }
  function streakFrom(activity) {
    let s = 0;
    const d = /* @__PURE__ */ new Date();
    if (!activity[dayKey(d)]) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) {
      if (activity[dayKey(d)]) {
        s++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return s;
  }
  function stats() {
    const history = readJSON("lp_history", "[]") || [];
    const activity = readJSON("lp_activity", "{}") || {};
    const bonus = Number(localStorage.getItem("lp_xp") || 0) || 0;
    const tests = history.length;
    const activeDays = Object.keys(activity).length;
    const sessions = Object.values(activity).reduce((a, b) => a + (Number(b) || 0), 0);
    const streak = streakFrom(activity);
    const xp = tests * 40 + sessions * 8 + activeDays * 12 + bonus;
    let li = 0;
    for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) li = i;
    const cur = LEVELS[li], next = LEVELS[li + 1] || null;
    const into = xp - cur.min, span = next ? next.min - cur.min : 1;
    const pct = next ? Math.min(100, Math.round(into / span * 100)) : 100;
    const studiedToday = !!activity[dayKey()];
    const badges = [
      { id: "first", emoji: "\u{1F3AF}", name: "First Test", got: tests >= 1 },
      { id: "s3", emoji: "\u{1F525}", name: "3-Day Streak", got: streak >= 3 },
      { id: "five", emoji: "\u{1F4DA}", name: "5 Tests", got: tests >= 5 },
      { id: "s7", emoji: "\u{1F525}", name: "Week Warrior", got: streak >= 7 },
      { id: "xp500", emoji: "\u2B50", name: "500 XP", got: xp >= 500 },
      { id: "t20", emoji: "\u{1F3C6}", name: "20 Tests", got: tests >= 20 },
      { id: "xp1k", emoji: "\u{1F48E}", name: "1000 XP", got: xp >= 1e3 },
      { id: "s30", emoji: "\u{1F451}", name: "30-Day Streak", got: streak >= 30 }
    ];
    return { xp, level: li + 1, levelTitle: cur.title, levelEmoji: cur.emoji, next, pct, into, span, tests, activeDays, streak, studiedToday, badges };
  }
  function award(amount) {
    try {
      const cur = Number(localStorage.getItem("lp_xp") || 0) || 0;
      localStorage.setItem("lp_xp", String(cur + (Number(amount) || 0)));
      const a = readJSON("lp_activity", "{}") || {};
      const k = dayKey();
      a[k] = (a[k] || 0) + 1;
      localStorage.setItem("lp_activity", JSON.stringify(a));
    } catch (e) {
    }
  }
  function GamifyCard({ compact }) {
    const [s] = useState(stats);
    return /* @__PURE__ */ React.createElement("div", { className: "gam-card" + (compact ? " gam-compact" : "") }, /* @__PURE__ */ React.createElement("div", { className: "gam-top" }, /* @__PURE__ */ React.createElement("div", { className: "gam-level" }, /* @__PURE__ */ React.createElement("span", { className: "gam-level-emoji" }, s.levelEmoji), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "gam-level-num" }, "Level ", s.level), /* @__PURE__ */ React.createElement("div", { className: "gam-level-title" }, s.levelTitle))), /* @__PURE__ */ React.createElement("div", { className: "gam-streak", title: "Daily streak" }, /* @__PURE__ */ React.createElement("span", { className: "gam-flame" + (s.streak > 0 ? " on" : "") }, "\u{1F525}"), /* @__PURE__ */ React.createElement("span", { className: "gam-streak-num" }, s.streak), /* @__PURE__ */ React.createElement("span", { className: "gam-streak-lbl" }, "day", s.streak === 1 ? "" : "s"))), /* @__PURE__ */ React.createElement("div", { className: "gam-xp-row" }, /* @__PURE__ */ React.createElement("div", { className: "gam-xp-bar" }, /* @__PURE__ */ React.createElement("span", { style: { width: s.pct + "%" } })), /* @__PURE__ */ React.createElement("div", { className: "gam-xp-txt" }, s.xp, " XP", s.next ? " \xB7 " + (s.next.min - s.xp) + " to " + s.next.title : " \xB7 max level")), !compact && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "gam-goal" }, s.studiedToday ? "\u2705 Daily goal done \u2014 see you tomorrow!" : "\u{1F3AF} Daily goal: do one activity today to keep your streak alive."), /* @__PURE__ */ React.createElement("div", { className: "gam-badges" }, s.badges.map((b) => /* @__PURE__ */ React.createElement("div", { key: b.id, className: "gam-badge" + (b.got ? " got" : ""), title: b.name }, /* @__PURE__ */ React.createElement("span", { className: "gam-badge-emoji" }, b.emoji), /* @__PURE__ */ React.createElement("span", { className: "gam-badge-name" }, b.name))))));
  }
  window.LP_Gamify = { stats, award };
  window.LP_GamifyCard = GamifyCard;
})();
