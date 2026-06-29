/* global React, window */
"use strict";

(function () {
  const { useState, useEffect, useMemo } = React;

  const STORAGE_KEY = "lp_history";

  function loadHistory() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  }
  function clearHistory() { localStorage.removeItem(STORAGE_KEY); }

  function fmtDate(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  function scoreNumOf(entry) {
    if (entry.overallBand !== undefined) return entry.overallBand;
    if (entry.overall !== undefined) return entry.overall;
    if (entry.band !== undefined) return entry.band;
    if (entry.score !== undefined) return entry.score;
    return null;
  }

  function fmtScore(entry, examId) {
    const n = scoreNumOf(entry);
    if (n == null) return "—";
    if (["ielts","celpip"].includes(examId)) return `Band ${n}`;
    return `${n}`;
  }

  // Mosaic dashboard tiles
  function StatsMosaic({ history, exams }) {
    if (!history.length) return null;

    // Latest mock
    const latest = history[0];
    const latestExam = exams.find(e => e.id === latest.exam) || {};
    const latestScore = scoreNumOf(latest);

    // Section split for latest test (if exists) — handle both number and object values
    const sectionScores = latest.sectionScores || latest.sections || {};
    const valOf = (v) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") return v;
      if (v && typeof v === "object") return v.band ?? v.score ?? v.value ?? "—";
      return "—";
    };
    const sectionEntries = Object.entries(sectionScores).slice(0, 4).map(([k, v]) => [k, valOf(v)]);

    // This week count
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    const thisWeek = history.filter(h => new Date(h.date || h.ts || 0).getTime() >= sevenDaysAgo).length;
    const weekTarget = 6;

    // Streak
    function calcStreak(hist) {
      if (!hist.length) return 0;
      const days = [...new Set(hist.map(e => {
        const d = new Date(e.date || e.ts || 0);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }))].sort().reverse();
      let streak = 1;
      for (let i = 1; i < days.length; i++) {
        const [y1, m1, d1] = days[i-1].split("-").map(Number);
        const [y2, m2, d2] = days[i].split("-").map(Number);
        const diff = (new Date(y1, m1, d1) - new Date(y2, m2, d2)) / 86400000;
        if (diff === 1) streak++; else break;
      }
      return streak;
    }
    const streak = calcStreak(history);

    // Skill split — average across all tests
    const skillAvgs = {};
    history.forEach(h => {
      const ss = h.sectionScores || h.sections || {};
      Object.entries(ss).forEach(([k, v]) => {
        const raw = (typeof v === "object" && v !== null) ? (v.band ?? v.score ?? null) : v;
        const num = parseFloat(raw);
        if (isNaN(num)) return;
        if (!skillAvgs[k]) skillAvgs[k] = { sum: 0, count: 0 };
        skillAvgs[k].sum += num;
        skillAvgs[k].count++;
      });
    });
    const skillData = Object.entries(skillAvgs)
      .map(([k, v]) => ({ name: k, score: v.count ? v.sum / v.count : 0 }))
      .slice(0, 4);

    // Find next-up suggestion (least practiced exam)
    const examCounts = {};
    history.forEach(h => { examCounts[h.exam] = (examCounts[h.exam] || 0) + 1; });
    const allExamIds = exams.map(e => e.id);
    const leastPracticed = allExamIds
      .map(id => ({ id, count: examCounts[id] || 0, exam: exams.find(e => e.id === id) }))
      .sort((a, b) => a.count - b.count)[0];
    const nextUp = leastPracticed?.exam;

    return (
      <div className="dashboard-mosaic">
        <div className="dm-tile t-band">
          <div>
            <div className="label">{latestExam.name || "Latest"} · Latest mock</div>
            <div className="num" style={{ marginTop: 16 }}>{latestScore ?? "—"}</div>
            <div className="sub" style={{ marginTop: 4 }}>
              {["ielts","celpip"].includes(latest.exam) ? "Band overall" : "Score"} · {fmtDate(latest.date || latest.ts)}
            </div>
          </div>
          {sectionEntries.length > 0 && (
            <div className="splits">
              {sectionEntries.map(([k, v]) => (
                <div className="sp" key={k}>
                  <div className="v">{v}</div>
                  <div className="k">{k.slice(0,1).toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dm-tile t-progress">
          <div>
            <div className="label">This week</div>
            <div className="num" style={{ marginTop: 8 }}>{thisWeek} / {weekTarget}</div>
          </div>
          <div>
            <div className="bar"><i style={{ width: `${Math.min(100, thisWeek/weekTarget*100)}%` }} /></div>
            <div className="sub" style={{ marginTop: 6 }}>Mocks completed</div>
          </div>
        </div>

        <div className="dm-tile t-streak">
          <div className="label">Streak</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="num">{streak}</span>
            <span style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18 }}>{streak === 1 ? "day" : "days"}</span>
          </div>
          <div className="sub">Daily target met</div>
        </div>

        {skillData.length > 0 && (
          <div className="dm-tile" style={{ gridColumn: "span 2" }}>
            <div className="label" style={{ marginBottom: 14 }}>Skill split (averages)</div>
            <div>
              {skillData.map(s => (
                <div className="skill-row" key={s.name}>
                  <div className="name">{s.name.charAt(0).toUpperCase() + s.name.slice(1)}</div>
                  <div className="skill-track"><i style={{ width: `${Math.min(100, s.score / 9 * 100)}%` }} /></div>
                  <div className="num">{s.score.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {nextUp && (
          <div className="dm-tile">
            <div className="label">Suggested next</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.15, marginTop: 8, letterSpacing: "-0.01em" }}>
              {nextUp.name}
            </div>
            <div className="sub" style={{ marginTop: 4 }}>{examCounts[nextUp.id] || 0} mocks · least practiced</div>
          </div>
        )}
      </div>
    );
  }

  function StatCard({ icon, label, value, color }) {
    return (
      <div className="stat-card" style={{ borderTopColor: color || "var(--accent)" }}>
        <div className="stat-icon">{icon}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    );
  }

  // ── Gamification: XP, levels, badges ────────────────────────────────────────
  const LEVELS = ["Beginner", "Riser", "Achiever", "Scholar", "Expert", "Master"];
  function avgPctOf(h) {
    const secs = h.sections ? Object.values(h.sections) : [];
    const ps = secs.map(s => (typeof s.pct === "number" ? s.pct : null)).filter(n => n != null);
    return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : 0;
  }
  function computeGamification(history) {
    let xp = 0;
    history.forEach(h => { xp += 50 + Math.round(avgPctOf(h) * 0.5); });
    const PER = 300;
    const levelIdx = Math.min(LEVELS.length - 1, Math.floor(xp / PER));
    const intoLevel = xp - levelIdx * PER;
    const need = PER;
    // Streak
    const days = [...new Set(history.map(h => new Date(h.date || h.ts || 0).toDateString()))]
      .map(d => new Date(d).getTime()).sort((a, b) => b - a);
    let streak = days.length ? 1 : 0;
    for (let i = 1; i < days.length; i++) {
      if (Math.round((days[i - 1] - days[i]) / 86400000) === 1) streak++; else break;
    }
    const examSet = new Set(history.map(h => h.exam));
    const bestPct = history.length ? Math.max(...history.map(avgPctOf)) : 0;
    const badges = [
      { id: "first", icon: "🎯", name: "First Test", earned: history.length >= 1 },
      { id: "five", icon: "🔥", name: "5 Tests", earned: history.length >= 5 },
      { id: "ten", icon: "💪", name: "10 Tests", earned: history.length >= 10 },
      { id: "streak3", icon: "📅", name: "3-Day Streak", earned: streak >= 3 },
      { id: "streak7", icon: "⚡", name: "7-Day Streak", earned: streak >= 7 },
      { id: "explorer", icon: "🌍", name: "All 7 Exams", earned: examSet.size >= 7 },
      { id: "high", icon: "🏆", name: "High Scorer (80%+)", earned: bestPct >= 80 },
    ];
    return { xp, level: levelIdx + 1, levelName: LEVELS[levelIdx], intoLevel, need, badges, streak };
  }

  function LevelCard({ g }) {
    const pct = Math.min(100, Math.round((g.intoLevel / g.need) * 100));
    const earned = g.badges.filter(b => b.earned);
    return (
      <section className="progress-section">
        <div className="gamify-grid">
          <div className="level-card">
            <div className="level-badge">Lv {g.level}</div>
            <div>
              <div className="level-name">{g.levelName}</div>
              <div className="level-xp">{g.xp} XP</div>
              <div className="xp-bar"><div className="xp-fill" style={{ width: pct + "%" }} /></div>
              <div className="xp-next">{g.need - g.intoLevel} XP to next level</div>
            </div>
          </div>
          <div className="badge-wall">
            <div className="badge-wall-title">Badges — {earned.length}/{g.badges.length}</div>
            <div className="badge-row">
              {g.badges.map(b => (
                <div key={b.id} className={"badge-chip" + (b.earned ? " earned" : "")} title={b.name}>
                  <span className="badge-emoji">{b.icon}</span>
                  <span className="badge-name">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Weakness analytics + study plan ─────────────────────────────────────────
  function computeWeakness(history) {
    const acc = {}; // skill label → {sum, n}
    history.forEach(h => {
      if (!h.sections) return;
      Object.values(h.sections).forEach(s => {
        if (typeof s.pct !== "number") return;
        const k = s.label || "Section";
        acc[k] = acc[k] || { sum: 0, n: 0 };
        acc[k].sum += s.pct; acc[k].n += 1;
      });
    });
    return Object.entries(acc)
      .map(([label, v]) => ({ label, avg: Math.round(v.sum / v.n), n: v.n }))
      .sort((a, b) => a.avg - b.avg);
  }
  function StudyPlan({ history, onNav }) {
    const skills = computeWeakness(history);
    if (skills.length < 1) return null;
    const weak = skills.slice(0, 3);
    return (
      <section className="progress-section">
        <h2 className="section-heading">Your personalised study plan</h2>
        <p style={{ color: "var(--ink-3)", marginTop: -6 }}>Based on your {history.length} test{history.length !== 1 ? "s" : ""}, focus here next:</p>
        <div className="plan-grid">
          {weak.map((s, i) => {
            const tier = s.avg >= 75 ? { c: "var(--leaf)", t: "Strong — keep sharp" } : s.avg >= 50 ? { c: "var(--gold)", t: "Improving — drill more" } : { c: "var(--ember)", t: "Priority — focus here" };
            return (
              <div key={s.label} className="plan-card" style={{ borderLeftColor: tier.c }}>
                <div className="plan-rank">#{i + 1}</div>
                <div className="plan-skill">{s.label}</div>
                <div className="plan-bar"><div style={{ width: s.avg + "%", background: tier.c }} /></div>
                <div className="plan-meta"><span style={{ color: tier.c, fontWeight: 700 }}>{s.avg}%</span> avg · {tier.t}</div>
                <button className="btn btn-sm btn-primary" style={{ marginTop: 10 }} onClick={() => onNav("exam-prep")}>Practise {s.label} →</button>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // ── 12-week activity heatmap + streak ──────────────────────────────────────
  function ActivityHeatmap({ history }) {
    let act = {};
    try { act = JSON.parse(localStorage.getItem("lp_activity") || "{}"); } catch (e) {}
    const map = {};
    Object.keys(act).forEach(k => { map[k] = act[k]; });
    (history || []).forEach(h => { const t = new Date(h.date || h.ts || 0).getTime(); if (t) { const d = Math.floor(t / 86400000); map[d] = (map[d] || 0) + 1; } });
    if (!Object.keys(map).length) return null;
    const today = Math.floor(Date.now() / 86400000);
    const DAYS = 84;
    const cells = [];
    for (let i = 0; i < DAYS; i++) { const day = today - (DAYS - 1 - i); cells.push({ day, c: map[day] || 0 }); }
    let streak = 0; for (let d = today; ; d--) { if (map[d]) streak++; else break; }
    const lvl = (c) => c <= 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : 3;
    const activeDays = Object.values(map).filter(v => v > 0).length;
    return (
      <section className="progress-section">
        <h2 className="section-heading">Your activity</h2>
        <p style={{ color: "var(--ink-3)", marginTop: -6, fontSize: 14 }}>🔥 {streak}-day streak · {activeDays} active day{activeDays !== 1 ? "s" : ""} in the last 12 weeks. Show up daily to keep the streak alive.</p>
        <div className="heatmap">{cells.map((x, i) => <span key={i} className={"hm-cell hm-" + lvl(x.c)} title={x.c + " session" + (x.c !== 1 ? "s" : "")} />)}</div>
        <div className="heatmap-legend"><span>Less</span><span className="hm-cell hm-0" /><span className="hm-cell hm-1" /><span className="hm-cell hm-2" /><span className="hm-cell hm-3" /><span>More</span></div>
      </section>
    );
  }

  // ── Performance analytics: score trend, predicted next, section strengths ──
  function Analytics({ history, exams }) {
    // chronological attempts per exam (history is newest-first)
    const byExam = {};
    [...history].reverse().forEach(h => {
      const n = scoreNumOf(h);
      if (n == null) return;
      (byExam[h.exam] = byExam[h.exam] || []).push(n);
    });
    const examIds = Object.keys(byExam).sort((a, b) => byExam[b].length - byExam[a].length);
    const [sel, setSel] = useState(examIds[0] || null);
    if (!examIds.length) return null;
    const activeId = examIds.includes(sel) ? sel : examIds[0];
    const exam = (exams || []).find(e => e.id === activeId) || { name: activeId, id: activeId };
    const series = byExam[activeId] || [];

    // Linear-regression slope for a simple "predicted next" projection
    let predicted = null, delta = null;
    if (series.length >= 2) {
      delta = +(series[series.length - 1] - series[0]).toFixed(1);
      const n = series.length;
      const xs = series.map((_, i) => i);
      const mx = (n - 1) / 2, my = series.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      xs.forEach((x, i) => { num += (x - mx) * (series[i] - my); den += (x - mx) ** 2; });
      const slope = den ? num / den : 0;
      predicted = +(series[n - 1] + slope).toFixed(1);
    }

    // Sparkline geometry
    const W = 300, H = 64, P = 6;
    const lo = Math.min(...series), hi = Math.max(...series);
    const span = hi - lo || 1;
    const pts = series.map((v, i) => {
      const x = series.length === 1 ? W / 2 : P + (i / (series.length - 1)) * (W - 2 * P);
      const y = H - P - ((v - lo) / span) * (H - 2 * P);
      return [x, y];
    });
    const poly = pts.map(p => p.join(",")).join(" ");

    const sections = computeWeakness(history.filter(h => h.exam === activeId)).slice(0, 5);

    return (
      <section className="progress-section">
        <h2 className="section-heading">Performance analytics</h2>
        {examIds.length > 1 && (
          <div className="analytics-chips">
            {examIds.map(id => {
              const ex = (exams || []).find(e => e.id === id);
              return <button key={id} className={"analytics-chip" + (id === activeId ? " active" : "")} onClick={() => setSel(id)}>{ex ? ex.name : id}</button>;
            })}
          </div>
        )}
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-card-title">{exam.name} score trend</div>
            {series.length < 2 ? (
              <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Take another {exam.name} mock to see your trend line.</p>
            ) : (
              <>
                <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height="64">
                  <polyline fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={poly} />
                  {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--accent)" />)}
                </svg>
                <div className="analytics-meta">
                  <span className={delta >= 0 ? "delta up" : "delta down"}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}</span>
                  <span> over {series.length} attempts</span>
                </div>
              </>
            )}
          </div>
          <div className="analytics-card">
            <div className="analytics-card-title">Predicted next score</div>
            {predicted == null ? (
              <p style={{ color: "var(--ink-3)", fontSize: 14 }}>Need at least 2 attempts to project.</p>
            ) : (
              <>
                <div className="analytics-predict">{predicted}</div>
                <p style={{ color: "var(--ink-3)", fontSize: 13, margin: 0 }}>On your current trend, your next {exam.name} attempt is projected around here. Keep practising to push it up.</p>
              </>
            )}
          </div>
        </div>
        {sections.length > 0 && (
          <div className="analytics-card" style={{ marginTop: 12 }}>
            <div className="analytics-card-title">Section strengths — {exam.name}</div>
            <div className="analytics-bars">
              {sections.map(s => {
                const c = s.avg >= 75 ? "var(--leaf)" : s.avg >= 50 ? "var(--gold)" : "var(--ember)";
                return (
                  <div className="analytics-bar-row" key={s.label}>
                    <span className="analytics-bar-label">{s.label}</span>
                    <div className="analytics-bar"><div style={{ width: s.avg + "%", background: c }} /></div>
                    <span className="analytics-bar-val" style={{ color: c }}>{s.avg}%</span>
                  </div>
                );
              })}
            </div>
            <button className="weak-drill-btn" onClick={() => { window.location.hash = "#/exam-prep/" + activeId; }}>
              🎯 Practise my weakest skill — {exam.name} {sections[0].label} →
            </button>
          </div>
        )}
      </section>
    );
  }

  function Progress({ exams, onPractice, onNav }) {
    const [user, setUser] = useState(window.LP_AUTH ? window.LP_AUTH.getUser() : null);
    useEffect(() => {
      if (!window.LP_AUTH) return;
      return window.LP_AUTH.subscribe(setUser);
    }, []);

    useEffect(() => {
      if (!window.LP_SEO) return;
      window.LP_SEO.set({
        title: "My Progress — Track Mock Test Scores | LandingPrep",
        description: "Track your exam preparation across IELTS, TOEFL, PTE, GRE, GMAT and more. See section scores, streaks, skill splits and historical performance.",
        robots: "noindex,follow"
      });
    }, []);

    const [filter, setFilter] = useState("all");
    const [confirmClear, setConfirmClear] = useState(false);
    const [history, setHistory] = useState(loadHistory);
    useEffect(() => { setHistory(loadHistory()); }, []);

    // ⚠️ ALL React hooks must run on EVERY render — keep them ABOVE any conditional
    // return. Previously this useMemo sat after the `if (!user)` gate, so a signed-out
    // render ran fewer hooks than a signed-in one; when auth state flipped React threw
    // error #300 ("rendered fewer hooks than expected") and crashed the page. Moved up.
    const filtered = useMemo(() =>
      filter === "all" ? history : history.filter(e => e.exam === filter),
    [history, filter]);

    // Login gate
    if (!user) {
      return (
        <>
          <window.LP_TopBar current="progress" onNav={onNav} />
          <main id="main-content">
          <div className="login-shell">
            <div className="login-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
              <h1>Sign in to track your progress</h1>
              <p className="sub">Save your test history, track streaks, see skill splits across all exams, and continue where you left off — on any device. Free forever, takes 30 seconds.</p>
              <button className="login-btn" onClick={() => onNav("login")}>Sign in or create account →</button>
              <div className="toggle" style={{ marginTop: 16 }}>
                <a onClick={() => onNav("home")}>← Back to home</a>
              </div>
            </div>
          </div>
          </main>
          <window.LP_Footer />
        </>
      );
    }

    const totalTests = history.length;
    const allScores = history.map(scoreNumOf).filter(n => typeof n === "number");
    const avgScore = allScores.length ? (allScores.reduce((a,b)=>a+b,0)/allScores.length).toFixed(1) : "—";
    const bestScore = allScores.length ? Math.max(...allScores) : "—";

    const examIds = [...new Set(history.map(h => h.exam))];

    const handleClear = () => { clearHistory(); setHistory([]); setConfirmClear(false); };

    return (
      <>
        <window.LP_TopBar current="progress" onNav={onNav} />
        <main id="main-content">
        <div className="progress-shell">
          <div className="progress-header">
            <div>
              <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Welcome back, {user.name?.split(" ")[0] || "friend"}</h1>
              <p style={{ margin: "0.25rem 0 0", color: "var(--ink-3)" }}>
                {totalTests > 0
                  ? `You've completed ${totalTests} mock test${totalTests !== 1 ? "s" : ""} so far. Keep going.`
                  : "Take a mock test to start tracking your progress."}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {window.LP_ReminderBell && <window.LP_ReminderBell />}
              {history.length > 0 && (
                <button className="btn btn-sm" style={{ color: "var(--error)" }} onClick={() => setConfirmClear(true)}>Clear history</button>
              )}
              <button className="btn btn-sm" onClick={() => window.LP_AUTH && window.LP_AUTH.signOut()}>Sign out</button>
            </div>
          </div>

          {window.LP_GamifyCard ? <window.LP_GamifyCard /> : null}

          {confirmClear && (
            <div className="confirm-banner">
              <span>This will permanently delete all test history.</span>
              <button className="btn-primary" style={{ background: "var(--error)", marginLeft: "1rem", padding: "8px 16px", borderRadius: 8, border: 0, color: "#fff", cursor: "pointer" }} onClick={handleClear}>Yes, delete</button>
              <button className="btn" style={{ marginLeft: "0.5rem" }} onClick={() => setConfirmClear(false)}>Cancel</button>
            </div>
          )}

          {history.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
              <h3>No tests completed yet</h3>
              <p>Complete a mock test to see your progress here. Your scores are saved automatically.</p>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={() => onNav("exams")}>Browse Exam Hub</button>
              </div>
            </div>
          ) : (
            <>
              <StatsMosaic history={history} exams={exams} />

              <div className="stats-row">
                <StatCard icon="📝" label="Tests Taken" value={totalTests} color="var(--accent)" />
                <StatCard icon="⭐" label="Average Score" value={avgScore} color="var(--gold)" />
                <StatCard icon="🏆" label="Best Score" value={bestScore} color="var(--leaf)" />
                <StatCard icon="🎯" label="Active Exams" value={examIds.length} color="var(--ember)" />
              </div>

              <LevelCard g={computeGamification(history)} />
              <ActivityHeatmap history={history} />
              <Analytics history={history} exams={exams} />
              {window.LP_ErrorLogPanel && <window.LP_ErrorLogPanel exams={exams} />}
              <StudyPlan history={history} onNav={onNav} />

              <section className="progress-section">
                <div className="history-header">
                  <h2 className="section-heading" style={{ margin: 0 }}>Test History</h2>
                  <div className="filter-row">
                    <span style={{ color: "var(--ink-3)", fontSize: 14 }}>Filter:</span>
                    <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                      <option value="all">All Exams</option>
                      {examIds.map(eid => {
                        const ex = exams.find(e => e.id === eid);
                        return <option key={eid} value={eid}>{ex?.name || eid}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div className="history-table-wrap">
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>Date</th><th>Exam</th><th>Type</th><th>Score</th><th>Sections</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((entry, idx) => {
                        const ex = exams.find(e => e.id === entry.exam);
                        const color = ex?.colour || "var(--accent)";
                        return (
                          <tr key={idx}>
                            <td>{fmtDate(entry.date || entry.ts)}</td>
                            <td><span className="exam-tag" style={{ background: color + "18", color }}>{ex?.name || entry.exam}</span></td>
                            <td>{entry.type === "full" ? "Full Test" : entry.type?.replace("section_","").replace(/^./, c => c.toUpperCase())}</td>
                            <td><strong style={{ color }}>{fmtScore(entry, entry.exam)}</strong></td>
                            <td>
                              {(() => {
                                const ss = entry.sectionScores || entry.sections;
                                if (!ss) return "—";
                                return Object.entries(ss).map(([k, v]) => {
                                  const val = typeof v === "object" && v !== null
                                    ? (v.band ?? v.score ?? "—")
                                    : v;
                                  return <span key={k} className="section-tag">{k}: {val}</span>;
                                });
                              })()}
                            </td>
                            <td>
                              {ex && onPractice && <button className="btn btn-sm" onClick={() => onPractice(ex, { examId: ex.id, type: "full" })}>Retry</button>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_Progress = Progress;
})();
