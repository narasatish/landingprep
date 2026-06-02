/* global React, window */
"use strict";
// LandingPrep — Achievements: full XP/level/badge view + how XP works. Reads
// the shared gamification engine (window.LP_Gamify) — no duplicate logic.
(function () {
  const { useState, useEffect } = React;

  const LADDER = [
    { lvl: 1, min: 0, title: "Rookie", emoji: "🌱" },
    { lvl: 2, min: 100, title: "Learner", emoji: "📗" },
    { lvl: 3, min: 250, title: "Achiever", emoji: "📘" },
    { lvl: 4, min: 450, title: "Scholar", emoji: "🎓" },
    { lvl: 5, min: 700, title: "High-Flyer", emoji: "🚀" },
    { lvl: 6, min: 1000, title: "Expert", emoji: "⭐" },
    { lvl: 7, min: 1400, title: "Master", emoji: "🏅" },
    { lvl: 8, min: 1900, title: "Champion", emoji: "🏆" },
    { lvl: 9, min: 2500, title: "Legend", emoji: "👑" },
  ];
  const SOURCES = [
    { emoji: "📝", what: "Complete a mock test", xp: "+40 XP" },
    { emoji: "🎯", what: "Check a band score (writing/speaking)", xp: "+30 XP" },
    { emoji: "📅", what: "Study on a new day", xp: "+12 XP" },
    { emoji: "⚡", what: "Each practice session", xp: "+8 XP" },
  ];
  const HOWTO = {
    first: "Finish any mock test.", s3: "Study 3 days in a row.", five: "Complete 5 mock tests.",
    s7: "Keep a 7-day streak.", xp500: "Reach 500 XP.", t20: "Complete 20 mock tests.",
    xp1k: "Reach 1000 XP.", s30: "Keep a 30-day streak.",
  };

  function Achievements({ onNav }) {
    const [s] = useState(() => (window.LP_Gamify ? window.LP_Gamify.stats() : null));
    useEffect(() => {
      try {
        document.title = "Achievements, XP & Streaks | LandingPrep";
        const m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute("content", "Track your XP, level, daily streak and badges as you practise for IELTS, TOEFL and more on LandingPrep.");
      } catch (e) {}
    }, []);
    if (!s) return (<><window.LP_TopBar current="progress" onNav={onNav} /><main className="tools-shell"><div className="tool-card"><p className="tool-sub">Loading…</p></div></main><window.LP_Footer /></>);
    const earned = s.badges.filter((b) => b.got).length;

    return (
      <>
        <window.LP_TopBar current="progress" onNav={onNav} />
        <main className="tools-shell tools-shell-wide">
          <header className="tools-hero">
            <h1>🏆 Your Achievements</h1>
            <p>Level up by practising. {earned}/{s.badges.length} badges earned · {s.xp} XP · {s.streak}-day streak 🔥</p>
          </header>

          {window.LP_GamifyCard ? <window.LP_GamifyCard /> : null}

          <div className="tool-card">
            <h3>How XP works</h3>
            <div className="ach-sources">
              {SOURCES.map((x, i) => (<div className="ach-src" key={i}><span className="ach-src-emoji">{x.emoji}</span><span className="ach-src-what">{x.what}</span><span className="ach-src-xp">{x.xp}</span></div>))}
            </div>
            <p className="tool-note" style={{ marginTop: 10 }}>Study every day to grow your 🔥 streak — long streaks unlock the best badges.</p>
          </div>

          <div className="tool-card">
            <h3>Level ladder</h3>
            <div className="ach-ladder">
              {LADDER.map((l) => (
                <div key={l.lvl} className={"ach-rung" + (s.level === l.lvl ? " current" : s.level > l.lvl ? " passed" : "")}>
                  <span className="ach-rung-emoji">{l.emoji}</span>
                  <span className="ach-rung-title">Lv {l.lvl} · {l.title}</span>
                  <span className="ach-rung-xp">{l.min} XP{s.level === l.lvl ? " · you are here" : ""}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tool-card">
            <h3>Badges ({earned}/{s.badges.length})</h3>
            <div className="gam-badges">
              {s.badges.map((b) => (
                <div key={b.id} className={"gam-badge ach-badge" + (b.got ? " got" : "")} title={HOWTO[b.id] || ""}>
                  <span className="gam-badge-emoji">{b.emoji}</span>
                  <span className="gam-badge-name">{b.name}</span>
                  <span className="ach-badge-how">{b.got ? "✓ Earned" : (HOWTO[b.id] || "")}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="row-gap-12" style={{ marginTop: 4 }}>
            <button className="btn btn-primary" onClick={() => onNav("exam-prep")}>Take a mock test → earn XP</button>
            <button className="btn" onClick={() => onNav("progress")}>My progress</button>
          </div>
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_Achievements = Achievements;
})();
