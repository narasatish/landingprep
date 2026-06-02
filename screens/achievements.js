"use strict";
(function() {
  const { useState, useEffect } = React;
  const LADDER = [
    { lvl: 1, min: 0, title: "Rookie", emoji: "\u{1F331}" },
    { lvl: 2, min: 100, title: "Learner", emoji: "\u{1F4D7}" },
    { lvl: 3, min: 250, title: "Achiever", emoji: "\u{1F4D8}" },
    { lvl: 4, min: 450, title: "Scholar", emoji: "\u{1F393}" },
    { lvl: 5, min: 700, title: "High-Flyer", emoji: "\u{1F680}" },
    { lvl: 6, min: 1e3, title: "Expert", emoji: "\u2B50" },
    { lvl: 7, min: 1400, title: "Master", emoji: "\u{1F3C5}" },
    { lvl: 8, min: 1900, title: "Champion", emoji: "\u{1F3C6}" },
    { lvl: 9, min: 2500, title: "Legend", emoji: "\u{1F451}" }
  ];
  const SOURCES = [
    { emoji: "\u{1F4DD}", what: "Complete a mock test", xp: "+40 XP" },
    { emoji: "\u{1F3AF}", what: "Check a band score (writing/speaking)", xp: "+30 XP" },
    { emoji: "\u{1F4C5}", what: "Study on a new day", xp: "+12 XP" },
    { emoji: "\u26A1", what: "Each practice session", xp: "+8 XP" }
  ];
  const HOWTO = {
    first: "Finish any mock test.",
    s3: "Study 3 days in a row.",
    five: "Complete 5 mock tests.",
    s7: "Keep a 7-day streak.",
    xp500: "Reach 500 XP.",
    t20: "Complete 20 mock tests.",
    xp1k: "Reach 1000 XP.",
    s30: "Keep a 30-day streak."
  };
  function Achievements({ onNav }) {
    const [s] = useState(() => window.LP_Gamify ? window.LP_Gamify.stats() : null);
    useEffect(() => {
      try {
        document.title = "Achievements, XP & Streaks | LandingPrep";
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Track your XP, level, daily streak and badges as you practise for IELTS, TOEFL and more on LandingPrep.");
      } catch (e) {
      }
    }, []);
    if (!s) return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "progress", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Loading\u2026"))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
    const earned = s.badges.filter((b) => b.got).length;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "progress", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell tools-shell-wide" }, /* @__PURE__ */ React.createElement("header", { className: "tools-hero" }, /* @__PURE__ */ React.createElement("h1", null, "\u{1F3C6} Your Achievements"), /* @__PURE__ */ React.createElement("p", null, "Level up by practising. ", earned, "/", s.badges.length, " badges earned \xB7 ", s.xp, " XP \xB7 ", s.streak, "-day streak \u{1F525}")), window.LP_GamifyCard ? /* @__PURE__ */ React.createElement(window.LP_GamifyCard, null) : null, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "How XP works"), /* @__PURE__ */ React.createElement("div", { className: "ach-sources" }, SOURCES.map((x, i) => /* @__PURE__ */ React.createElement("div", { className: "ach-src", key: i }, /* @__PURE__ */ React.createElement("span", { className: "ach-src-emoji" }, x.emoji), /* @__PURE__ */ React.createElement("span", { className: "ach-src-what" }, x.what), /* @__PURE__ */ React.createElement("span", { className: "ach-src-xp" }, x.xp)))), /* @__PURE__ */ React.createElement("p", { className: "tool-note", style: { marginTop: 10 } }, "Study every day to grow your \u{1F525} streak \u2014 long streaks unlock the best badges.")), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "Level ladder"), /* @__PURE__ */ React.createElement("div", { className: "ach-ladder" }, LADDER.map((l) => /* @__PURE__ */ React.createElement("div", { key: l.lvl, className: "ach-rung" + (s.level === l.lvl ? " current" : s.level > l.lvl ? " passed" : "") }, /* @__PURE__ */ React.createElement("span", { className: "ach-rung-emoji" }, l.emoji), /* @__PURE__ */ React.createElement("span", { className: "ach-rung-title" }, "Lv ", l.lvl, " \xB7 ", l.title), /* @__PURE__ */ React.createElement("span", { className: "ach-rung-xp" }, l.min, " XP", s.level === l.lvl ? " \xB7 you are here" : ""))))), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "Badges (", earned, "/", s.badges.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "gam-badges" }, s.badges.map((b) => /* @__PURE__ */ React.createElement("div", { key: b.id, className: "gam-badge ach-badge" + (b.got ? " got" : ""), title: HOWTO[b.id] || "" }, /* @__PURE__ */ React.createElement("span", { className: "gam-badge-emoji" }, b.emoji), /* @__PURE__ */ React.createElement("span", { className: "gam-badge-name" }, b.name), /* @__PURE__ */ React.createElement("span", { className: "ach-badge-how" }, b.got ? "\u2713 Earned" : HOWTO[b.id] || ""))))), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12", style: { marginTop: 4 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("exam-prep") }, "Take a mock test \u2192 earn XP"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("progress") }, "My progress"))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_Achievements = Achievements;
})();
