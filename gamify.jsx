/* global React, window */
"use strict";
// LandingPrep — lightweight gamification (XP, levels, streak, badges) to drive
// retention (Duolingo-style). Derives stats from existing activity so it works
// immediately: lp_history (mock tests) + lp_activity (active-day map). Optional
// LP_Gamify.award(xp) bumps a bonus store. Renders window.LP_GamifyCard.
(function () {
  const { useState } = React;

  const LEVELS = [
    { min: 0, title: "Rookie", emoji: "🌱" },
    { min: 100, title: "Learner", emoji: "📗" },
    { min: 250, title: "Achiever", emoji: "📘" },
    { min: 450, title: "Scholar", emoji: "🎓" },
    { min: 700, title: "High-Flyer", emoji: "🚀" },
    { min: 1000, title: "Expert", emoji: "⭐" },
    { min: 1400, title: "Master", emoji: "🏅" },
    { min: 1900, title: "Champion", emoji: "🏆" },
    { min: 2500, title: "Legend", emoji: "👑" },
  ];

  function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || fallback); } catch (e) { try { return JSON.parse(fallback); } catch (_) { return null; } } }
  function dayKey(d) { const x = d || new Date(); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); }

  function streakFrom(activity) {
    let s = 0; const d = new Date();
    // allow today OR yesterday to start (so a missed "today" before studying doesn't zero it)
    if (!activity[dayKey(d)]) d.setDate(d.getDate() - 1);
    for (let i = 0; i < 400; i++) { if (activity[dayKey(d)]) { s++; d.setDate(d.getDate() - 1); } else break; }
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
    let li = 0; for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) li = i;
    const cur = LEVELS[li], next = LEVELS[li + 1] || null;
    const into = xp - cur.min, span = next ? next.min - cur.min : 1;
    const pct = next ? Math.min(100, Math.round(into / span * 100)) : 100;
    const studiedToday = !!activity[dayKey()];
    const badges = [
      { id: "first", emoji: "🎯", name: "First Test", got: tests >= 1 },
      { id: "s3", emoji: "🔥", name: "3-Day Streak", got: streak >= 3 },
      { id: "five", emoji: "📚", name: "5 Tests", got: tests >= 5 },
      { id: "s7", emoji: "🔥", name: "Week Warrior", got: streak >= 7 },
      { id: "xp500", emoji: "⭐", name: "500 XP", got: xp >= 500 },
      { id: "t20", emoji: "🏆", name: "20 Tests", got: tests >= 20 },
      { id: "xp1k", emoji: "💎", name: "1000 XP", got: xp >= 1000 },
      { id: "s30", emoji: "👑", name: "30-Day Streak", got: streak >= 30 },
    ];
    return { xp, level: li + 1, levelTitle: cur.title, levelEmoji: cur.emoji, next, pct, into, span, tests, activeDays, streak, studiedToday, badges };
  }

  function award(amount) {
    try {
      const cur = Number(localStorage.getItem("lp_xp") || 0) || 0;
      localStorage.setItem("lp_xp", String(cur + (Number(amount) || 0)));
      // mark today active so streak/daily goal update
      const a = readJSON("lp_activity", "{}") || {}; const k = dayKey(); a[k] = (a[k] || 0) + 1;
      localStorage.setItem("lp_activity", JSON.stringify(a));
    } catch (e) {}
  }

  function GamifyCard({ compact }) {
    const [s] = useState(stats);
    return (
      <div className={"gam-card" + (compact ? " gam-compact" : "")}>
        <div className="gam-top">
          <div className="gam-level"><span className="gam-level-emoji">{s.levelEmoji}</span><div><div className="gam-level-num">Level {s.level}</div><div className="gam-level-title">{s.levelTitle}</div></div></div>
          <div className="gam-streak" title="Daily streak"><span className={"gam-flame" + (s.streak > 0 ? " on" : "")}>🔥</span><span className="gam-streak-num">{s.streak}</span><span className="gam-streak-lbl">day{s.streak === 1 ? "" : "s"}</span></div>
        </div>
        <div className="gam-xp-row">
          <div className="gam-xp-bar"><span style={{ width: s.pct + "%" }} /></div>
          <div className="gam-xp-txt">{s.xp} XP{s.next ? " · " + (s.next.min - s.xp) + " to " + s.next.title : " · max level"}</div>
        </div>
        {!compact && (
          <>
            <div className="gam-goal">{s.studiedToday ? "✅ Daily goal done — see you tomorrow!" : "🎯 Daily goal: do one activity today to keep your streak alive."}</div>
            <div className="gam-badges">
              {s.badges.map((b) => (
                <div key={b.id} className={"gam-badge" + (b.got ? " got" : "")} title={b.name}>
                  <span className="gam-badge-emoji">{b.emoji}</span>
                  <span className="gam-badge-name">{b.name}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  window.LP_Gamify = { stats, award };
  window.LP_GamifyCard = GamifyCard;
})();
