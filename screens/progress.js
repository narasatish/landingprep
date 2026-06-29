"use strict";
(function() {
  const { useState, useEffect, useMemo } = React;
  const STORAGE_KEY = "lp_history";
  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY);
  }
  function fmtDate(ts) {
    if (!ts) return "\u2014";
    const d = new Date(ts);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  function scoreNumOf(entry) {
    if (entry.overallBand !== void 0) return entry.overallBand;
    if (entry.overall !== void 0) return entry.overall;
    if (entry.band !== void 0) return entry.band;
    if (entry.score !== void 0) return entry.score;
    return null;
  }
  function fmtScore(entry, examId) {
    const n = scoreNumOf(entry);
    if (n == null) return "\u2014";
    if (["ielts", "celpip"].includes(examId)) return `Band ${n}`;
    return `${n}`;
  }
  function StatsMosaic({ history, exams }) {
    if (!history.length) return null;
    const latest = history[0];
    const latestExam = exams.find((e) => e.id === latest.exam) || {};
    const latestScore = scoreNumOf(latest);
    const sectionScores = latest.sectionScores || latest.sections || {};
    const valOf = (v) => {
      var _a, _b, _c;
      if (typeof v === "number") return v;
      if (typeof v === "string") return v;
      if (v && typeof v === "object") return (_c = (_b = (_a = v.band) != null ? _a : v.score) != null ? _b : v.value) != null ? _c : "\u2014";
      return "\u2014";
    };
    const sectionEntries = Object.entries(sectionScores).slice(0, 4).map(([k, v]) => [k, valOf(v)]);
    const sevenDaysAgo = Date.now() - 7 * 864e5;
    const thisWeek = history.filter((h) => new Date(h.date || h.ts || 0).getTime() >= sevenDaysAgo).length;
    const weekTarget = 6;
    function calcStreak(hist) {
      if (!hist.length) return 0;
      const days = [...new Set(hist.map((e) => {
        const d = new Date(e.date || e.ts || 0);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      }))].sort().reverse();
      let streak2 = 1;
      for (let i = 1; i < days.length; i++) {
        const [y1, m1, d1] = days[i - 1].split("-").map(Number);
        const [y2, m2, d2] = days[i].split("-").map(Number);
        const diff = (new Date(y1, m1, d1) - new Date(y2, m2, d2)) / 864e5;
        if (diff === 1) streak2++;
        else break;
      }
      return streak2;
    }
    const streak = calcStreak(history);
    const skillAvgs = {};
    history.forEach((h) => {
      const ss = h.sectionScores || h.sections || {};
      Object.entries(ss).forEach(([k, v]) => {
        var _a, _b;
        const raw = typeof v === "object" && v !== null ? (_b = (_a = v.band) != null ? _a : v.score) != null ? _b : null : v;
        const num = parseFloat(raw);
        if (isNaN(num)) return;
        if (!skillAvgs[k]) skillAvgs[k] = { sum: 0, count: 0 };
        skillAvgs[k].sum += num;
        skillAvgs[k].count++;
      });
    });
    const skillData = Object.entries(skillAvgs).map(([k, v]) => ({ name: k, score: v.count ? v.sum / v.count : 0 })).slice(0, 4);
    const examCounts = {};
    history.forEach((h) => {
      examCounts[h.exam] = (examCounts[h.exam] || 0) + 1;
    });
    const allExamIds = exams.map((e) => e.id);
    const leastPracticed = allExamIds.map((id) => ({ id, count: examCounts[id] || 0, exam: exams.find((e) => e.id === id) })).sort((a, b) => a.count - b.count)[0];
    const nextUp = leastPracticed == null ? void 0 : leastPracticed.exam;
    return /* @__PURE__ */ React.createElement("div", { className: "dashboard-mosaic" }, /* @__PURE__ */ React.createElement("div", { className: "dm-tile t-band" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, latestExam.name || "Latest", " \xB7 Latest mock"), /* @__PURE__ */ React.createElement("div", { className: "num", style: { marginTop: 16 } }, latestScore != null ? latestScore : "\u2014"), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: 4 } }, ["ielts", "celpip"].includes(latest.exam) ? "Band overall" : "Score", " \xB7 ", fmtDate(latest.date || latest.ts))), sectionEntries.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "splits" }, sectionEntries.map(([k, v]) => /* @__PURE__ */ React.createElement("div", { className: "sp", key: k }, /* @__PURE__ */ React.createElement("div", { className: "v" }, v), /* @__PURE__ */ React.createElement("div", { className: "k" }, k.slice(0, 1).toUpperCase()))))), /* @__PURE__ */ React.createElement("div", { className: "dm-tile t-progress" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "label" }, "This week"), /* @__PURE__ */ React.createElement("div", { className: "num", style: { marginTop: 8 } }, thisWeek, " / ", weekTarget)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "bar" }, /* @__PURE__ */ React.createElement("i", { style: { width: `${Math.min(100, thisWeek / weekTarget * 100)}%` } })), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: 6 } }, "Mocks completed"))), /* @__PURE__ */ React.createElement("div", { className: "dm-tile t-streak" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Streak"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 6 } }, /* @__PURE__ */ React.createElement("span", { className: "num" }, streak), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18 } }, streak === 1 ? "day" : "days")), /* @__PURE__ */ React.createElement("div", { className: "sub" }, "Daily target met")), skillData.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "dm-tile", style: { gridColumn: "span 2" } }, /* @__PURE__ */ React.createElement("div", { className: "label", style: { marginBottom: 14 } }, "Skill split (averages)"), /* @__PURE__ */ React.createElement("div", null, skillData.map((s) => /* @__PURE__ */ React.createElement("div", { className: "skill-row", key: s.name }, /* @__PURE__ */ React.createElement("div", { className: "name" }, s.name.charAt(0).toUpperCase() + s.name.slice(1)), /* @__PURE__ */ React.createElement("div", { className: "skill-track" }, /* @__PURE__ */ React.createElement("i", { style: { width: `${Math.min(100, s.score / 9 * 100)}%` } })), /* @__PURE__ */ React.createElement("div", { className: "num" }, s.score.toFixed(1)))))), nextUp && /* @__PURE__ */ React.createElement("div", { className: "dm-tile" }, /* @__PURE__ */ React.createElement("div", { className: "label" }, "Suggested next"), /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.15, marginTop: 8, letterSpacing: "-0.01em" } }, nextUp.name), /* @__PURE__ */ React.createElement("div", { className: "sub", style: { marginTop: 4 } }, examCounts[nextUp.id] || 0, " mocks \xB7 least practiced")));
  }
  function StatCard({ icon, label, value, color }) {
    return /* @__PURE__ */ React.createElement("div", { className: "stat-card", style: { borderTopColor: color || "var(--accent)" } }, /* @__PURE__ */ React.createElement("div", { className: "stat-icon" }, icon), /* @__PURE__ */ React.createElement("div", { className: "stat-value" }, value), /* @__PURE__ */ React.createElement("div", { className: "stat-label" }, label));
  }
  const LEVELS = ["Beginner", "Riser", "Achiever", "Scholar", "Expert", "Master"];
  function avgPctOf(h) {
    const secs = h.sections ? Object.values(h.sections) : [];
    const ps = secs.map((s) => typeof s.pct === "number" ? s.pct : null).filter((n) => n != null);
    return ps.length ? ps.reduce((a, b) => a + b, 0) / ps.length : 0;
  }
  function computeGamification(history) {
    let xp = 0;
    history.forEach((h) => {
      xp += 50 + Math.round(avgPctOf(h) * 0.5);
    });
    const PER = 300;
    const levelIdx = Math.min(LEVELS.length - 1, Math.floor(xp / PER));
    const intoLevel = xp - levelIdx * PER;
    const need = PER;
    const days = [...new Set(history.map((h) => new Date(h.date || h.ts || 0).toDateString()))].map((d) => new Date(d).getTime()).sort((a, b) => b - a);
    let streak = days.length ? 1 : 0;
    for (let i = 1; i < days.length; i++) {
      if (Math.round((days[i - 1] - days[i]) / 864e5) === 1) streak++;
      else break;
    }
    const examSet = new Set(history.map((h) => h.exam));
    const bestPct = history.length ? Math.max(...history.map(avgPctOf)) : 0;
    const badges = [
      { id: "first", icon: "\u{1F3AF}", name: "First Test", earned: history.length >= 1 },
      { id: "five", icon: "\u{1F525}", name: "5 Tests", earned: history.length >= 5 },
      { id: "ten", icon: "\u{1F4AA}", name: "10 Tests", earned: history.length >= 10 },
      { id: "streak3", icon: "\u{1F4C5}", name: "3-Day Streak", earned: streak >= 3 },
      { id: "streak7", icon: "\u26A1", name: "7-Day Streak", earned: streak >= 7 },
      { id: "explorer", icon: "\u{1F30D}", name: "All 7 Exams", earned: examSet.size >= 7 },
      { id: "high", icon: "\u{1F3C6}", name: "High Scorer (80%+)", earned: bestPct >= 80 }
    ];
    return { xp, level: levelIdx + 1, levelName: LEVELS[levelIdx], intoLevel, need, badges, streak };
  }
  function LevelCard({ g }) {
    const pct = Math.min(100, Math.round(g.intoLevel / g.need * 100));
    const earned = g.badges.filter((b) => b.earned);
    return /* @__PURE__ */ React.createElement("section", { className: "progress-section" }, /* @__PURE__ */ React.createElement("div", { className: "gamify-grid" }, /* @__PURE__ */ React.createElement("div", { className: "level-card" }, /* @__PURE__ */ React.createElement("div", { className: "level-badge" }, "Lv ", g.level), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "level-name" }, g.levelName), /* @__PURE__ */ React.createElement("div", { className: "level-xp" }, g.xp, " XP"), /* @__PURE__ */ React.createElement("div", { className: "xp-bar" }, /* @__PURE__ */ React.createElement("div", { className: "xp-fill", style: { width: pct + "%" } })), /* @__PURE__ */ React.createElement("div", { className: "xp-next" }, g.need - g.intoLevel, " XP to next level"))), /* @__PURE__ */ React.createElement("div", { className: "badge-wall" }, /* @__PURE__ */ React.createElement("div", { className: "badge-wall-title" }, "Badges \u2014 ", earned.length, "/", g.badges.length), /* @__PURE__ */ React.createElement("div", { className: "badge-row" }, g.badges.map((b) => /* @__PURE__ */ React.createElement("div", { key: b.id, className: "badge-chip" + (b.earned ? " earned" : ""), title: b.name }, /* @__PURE__ */ React.createElement("span", { className: "badge-emoji" }, b.icon), /* @__PURE__ */ React.createElement("span", { className: "badge-name" }, b.name)))))));
  }
  function computeWeakness(history) {
    const acc = {};
    history.forEach((h) => {
      if (!h.sections) return;
      Object.values(h.sections).forEach((s) => {
        if (typeof s.pct !== "number") return;
        const k = s.label || "Section";
        acc[k] = acc[k] || { sum: 0, n: 0 };
        acc[k].sum += s.pct;
        acc[k].n += 1;
      });
    });
    return Object.entries(acc).map(([label, v]) => ({ label, avg: Math.round(v.sum / v.n), n: v.n })).sort((a, b) => a.avg - b.avg);
  }
  function StudyPlan({ history, onNav }) {
    const skills = computeWeakness(history);
    if (skills.length < 1) return null;
    const weak = skills.slice(0, 3);
    return /* @__PURE__ */ React.createElement("section", { className: "progress-section" }, /* @__PURE__ */ React.createElement("h2", { className: "section-heading" }, "Your personalised study plan"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)", marginTop: -6 } }, "Based on your ", history.length, " test", history.length !== 1 ? "s" : "", ", focus here next:"), /* @__PURE__ */ React.createElement("div", { className: "plan-grid" }, weak.map((s, i) => {
      const tier = s.avg >= 75 ? { c: "var(--leaf)", t: "Strong \u2014 keep sharp" } : s.avg >= 50 ? { c: "var(--gold)", t: "Improving \u2014 drill more" } : { c: "var(--ember)", t: "Priority \u2014 focus here" };
      return /* @__PURE__ */ React.createElement("div", { key: s.label, className: "plan-card", style: { borderLeftColor: tier.c } }, /* @__PURE__ */ React.createElement("div", { className: "plan-rank" }, "#", i + 1), /* @__PURE__ */ React.createElement("div", { className: "plan-skill" }, s.label), /* @__PURE__ */ React.createElement("div", { className: "plan-bar" }, /* @__PURE__ */ React.createElement("div", { style: { width: s.avg + "%", background: tier.c } })), /* @__PURE__ */ React.createElement("div", { className: "plan-meta" }, /* @__PURE__ */ React.createElement("span", { style: { color: tier.c, fontWeight: 700 } }, s.avg, "%"), " avg \xB7 ", tier.t), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm btn-primary", style: { marginTop: 10 }, onClick: () => onNav("exam-prep") }, "Practise ", s.label, " \u2192"));
    })));
  }
  function ActivityHeatmap({ history }) {
    let act = {};
    try {
      act = JSON.parse(localStorage.getItem("lp_activity") || "{}");
    } catch (e) {
    }
    const map = {};
    Object.keys(act).forEach((k) => {
      map[k] = act[k];
    });
    (history || []).forEach((h) => {
      const t = new Date(h.date || h.ts || 0).getTime();
      if (t) {
        const d = Math.floor(t / 864e5);
        map[d] = (map[d] || 0) + 1;
      }
    });
    if (!Object.keys(map).length) return null;
    const today = Math.floor(Date.now() / 864e5);
    const DAYS = 84;
    const cells = [];
    for (let i = 0; i < DAYS; i++) {
      const day = today - (DAYS - 1 - i);
      cells.push({ day, c: map[day] || 0 });
    }
    let streak = 0;
    for (let d = today; ; d--) {
      if (map[d]) streak++;
      else break;
    }
    const lvl = (c) => c <= 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : 3;
    const activeDays = Object.values(map).filter((v) => v > 0).length;
    return /* @__PURE__ */ React.createElement("section", { className: "progress-section" }, /* @__PURE__ */ React.createElement("h2", { className: "section-heading" }, "Your activity"), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)", marginTop: -6, fontSize: 14 } }, "\u{1F525} ", streak, "-day streak \xB7 ", activeDays, " active day", activeDays !== 1 ? "s" : "", " in the last 12 weeks. Show up daily to keep the streak alive."), /* @__PURE__ */ React.createElement("div", { className: "heatmap" }, cells.map((x, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "hm-cell hm-" + lvl(x.c), title: x.c + " session" + (x.c !== 1 ? "s" : "") }))), /* @__PURE__ */ React.createElement("div", { className: "heatmap-legend" }, /* @__PURE__ */ React.createElement("span", null, "Less"), /* @__PURE__ */ React.createElement("span", { className: "hm-cell hm-0" }), /* @__PURE__ */ React.createElement("span", { className: "hm-cell hm-1" }), /* @__PURE__ */ React.createElement("span", { className: "hm-cell hm-2" }), /* @__PURE__ */ React.createElement("span", { className: "hm-cell hm-3" }), /* @__PURE__ */ React.createElement("span", null, "More")));
  }
  function Analytics({ history, exams }) {
    const byExam = {};
    [...history].reverse().forEach((h) => {
      const n = scoreNumOf(h);
      if (n == null) return;
      (byExam[h.exam] = byExam[h.exam] || []).push(n);
    });
    const examIds = Object.keys(byExam).sort((a, b) => byExam[b].length - byExam[a].length);
    const [sel, setSel] = useState(examIds[0] || null);
    if (!examIds.length) return null;
    const activeId = examIds.includes(sel) ? sel : examIds[0];
    const exam = (exams || []).find((e) => e.id === activeId) || { name: activeId, id: activeId };
    const series = byExam[activeId] || [];
    let predicted = null, delta = null;
    if (series.length >= 2) {
      delta = +(series[series.length - 1] - series[0]).toFixed(1);
      const n = series.length;
      const xs = series.map((_, i) => i);
      const mx = (n - 1) / 2, my = series.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      xs.forEach((x, i) => {
        num += (x - mx) * (series[i] - my);
        den += (x - mx) ** 2;
      });
      const slope = den ? num / den : 0;
      predicted = +(series[n - 1] + slope).toFixed(1);
    }
    const W = 300, H = 64, P = 6;
    const lo = Math.min(...series), hi = Math.max(...series);
    const span = hi - lo || 1;
    const pts = series.map((v, i) => {
      const x = series.length === 1 ? W / 2 : P + i / (series.length - 1) * (W - 2 * P);
      const y = H - P - (v - lo) / span * (H - 2 * P);
      return [x, y];
    });
    const poly = pts.map((p) => p.join(",")).join(" ");
    const sections = computeWeakness(history.filter((h) => h.exam === activeId)).slice(0, 5);
    return /* @__PURE__ */ React.createElement("section", { className: "progress-section" }, /* @__PURE__ */ React.createElement("h2", { className: "section-heading" }, "Performance analytics"), examIds.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "analytics-chips" }, examIds.map((id) => {
      const ex = (exams || []).find((e) => e.id === id);
      return /* @__PURE__ */ React.createElement("button", { key: id, className: "analytics-chip" + (id === activeId ? " active" : ""), onClick: () => setSel(id) }, ex ? ex.name : id);
    })), /* @__PURE__ */ React.createElement("div", { className: "analytics-grid" }, /* @__PURE__ */ React.createElement("div", { className: "analytics-card" }, /* @__PURE__ */ React.createElement("div", { className: "analytics-card-title" }, exam.name, " score trend"), series.length < 2 ? /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)", fontSize: 14 } }, "Take another ", exam.name, " mock to see your trend line.") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("svg", { className: "sparkline", viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none", width: "100%", height: "64" }, /* @__PURE__ */ React.createElement("polyline", { fill: "none", stroke: "var(--accent)", strokeWidth: "2.5", strokeLinejoin: "round", strokeLinecap: "round", points: poly }), pts.map((p, i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: p[0], cy: p[1], r: "3", fill: "var(--accent)" }))), /* @__PURE__ */ React.createElement("div", { className: "analytics-meta" }, /* @__PURE__ */ React.createElement("span", { className: delta >= 0 ? "delta up" : "delta down" }, delta >= 0 ? "\u25B2" : "\u25BC", " ", Math.abs(delta)), /* @__PURE__ */ React.createElement("span", null, " over ", series.length, " attempts")))), /* @__PURE__ */ React.createElement("div", { className: "analytics-card" }, /* @__PURE__ */ React.createElement("div", { className: "analytics-card-title" }, "Predicted next score"), predicted == null ? /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)", fontSize: 14 } }, "Need at least 2 attempts to project.") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "analytics-predict" }, predicted), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)", fontSize: 13, margin: 0 } }, "On your current trend, your next ", exam.name, " attempt is projected around here. Keep practising to push it up.")))), sections.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "analytics-card", style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "analytics-card-title" }, "Section strengths \u2014 ", exam.name), /* @__PURE__ */ React.createElement("div", { className: "analytics-bars" }, sections.map((s) => {
      const c = s.avg >= 75 ? "var(--leaf)" : s.avg >= 50 ? "var(--gold)" : "var(--ember)";
      return /* @__PURE__ */ React.createElement("div", { className: "analytics-bar-row", key: s.label }, /* @__PURE__ */ React.createElement("span", { className: "analytics-bar-label" }, s.label), /* @__PURE__ */ React.createElement("div", { className: "analytics-bar" }, /* @__PURE__ */ React.createElement("div", { style: { width: s.avg + "%", background: c } })), /* @__PURE__ */ React.createElement("span", { className: "analytics-bar-val", style: { color: c } }, s.avg, "%"));
    })), /* @__PURE__ */ React.createElement("button", { className: "weak-drill-btn", onClick: () => {
      window.location.hash = "#/exam-prep/" + activeId;
    } }, "\u{1F3AF} Practise my weakest skill \u2014 ", exam.name, " ", sections[0].label, " \u2192")));
  }
  function Progress({ exams, onPractice, onNav }) {
    var _a;
    const [user, setUser] = useState(window.LP_AUTH ? window.LP_AUTH.getUser() : null);
    useEffect(() => {
      if (!window.LP_AUTH) return;
      return window.LP_AUTH.subscribe(setUser);
    }, []);
    useEffect(() => {
      if (!window.LP_SEO) return;
      window.LP_SEO.set({
        title: "My Progress \u2014 Track Mock Test Scores | LandingPrep",
        description: "Track your exam preparation across IELTS, TOEFL, PTE, GRE, GMAT and more. See section scores, streaks, skill splits and historical performance.",
        robots: "noindex,follow"
      });
    }, []);
    const [filter, setFilter] = useState("all");
    const [confirmClear, setConfirmClear] = useState(false);
    const [history, setHistory] = useState(loadHistory);
    useEffect(() => {
      setHistory(loadHistory());
    }, []);
    const filtered = useMemo(
      () => filter === "all" ? history : history.filter((e) => e.exam === filter),
      [history, filter]
    );
    if (!user) {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "progress", onNav }), /* @__PURE__ */ React.createElement("main", { id: "main-content" }, /* @__PURE__ */ React.createElement("div", { className: "login-shell" }, /* @__PURE__ */ React.createElement("div", { className: "login-card", style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 48, marginBottom: 8 } }, "\u{1F4CA}"), /* @__PURE__ */ React.createElement("h1", null, "Sign in to track your progress"), /* @__PURE__ */ React.createElement("p", { className: "sub" }, "Save your test history, track streaks, see skill splits across all exams, and continue where you left off \u2014 on any device. Free forever, takes 30 seconds."), /* @__PURE__ */ React.createElement("button", { className: "login-btn", onClick: () => onNav("login") }, "Sign in or create account \u2192"), /* @__PURE__ */ React.createElement("div", { className: "toggle", style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("a", { onClick: () => onNav("home") }, "\u2190 Back to home"))))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
    }
    const totalTests = history.length;
    const allScores = history.map(scoreNumOf).filter((n) => typeof n === "number");
    const avgScore = allScores.length ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1) : "\u2014";
    const bestScore = allScores.length ? Math.max(...allScores) : "\u2014";
    const examIds = [...new Set(history.map((h) => h.exam))];
    const handleClear = () => {
      clearHistory();
      setHistory([]);
      setConfirmClear(false);
    };
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "progress", onNav }), /* @__PURE__ */ React.createElement("main", { id: "main-content" }, /* @__PURE__ */ React.createElement("div", { className: "progress-shell" }, /* @__PURE__ */ React.createElement("div", { className: "progress-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { style: { margin: 0, fontSize: "1.8rem" } }, "Welcome back, ", ((_a = user.name) == null ? void 0 : _a.split(" ")[0]) || "friend"), /* @__PURE__ */ React.createElement("p", { style: { margin: "0.25rem 0 0", color: "var(--ink-3)" } }, totalTests > 0 ? `You've completed ${totalTests} mock test${totalTests !== 1 ? "s" : ""} so far. Keep going.` : "Take a mock test to start tracking your progress.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" } }, window.LP_ReminderBell && /* @__PURE__ */ React.createElement(window.LP_ReminderBell, null), history.length > 0 && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", style: { color: "var(--error)" }, onClick: () => setConfirmClear(true) }, "Clear history"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: () => window.LP_AUTH && window.LP_AUTH.signOut() }, "Sign out"))), window.LP_GamifyCard ? /* @__PURE__ */ React.createElement(window.LP_GamifyCard, null) : null, confirmClear && /* @__PURE__ */ React.createElement("div", { className: "confirm-banner" }, /* @__PURE__ */ React.createElement("span", null, "This will permanently delete all test history."), /* @__PURE__ */ React.createElement("button", { className: "btn-primary", style: { background: "var(--error)", marginLeft: "1rem", padding: "8px 16px", borderRadius: 8, border: 0, color: "#fff", cursor: "pointer" }, onClick: handleClear }, "Yes, delete"), /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginLeft: "0.5rem" }, onClick: () => setConfirmClear(false) }, "Cancel")), history.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "3rem", marginBottom: "1rem" } }, "\u{1F4CA}"), /* @__PURE__ */ React.createElement("h3", null, "No tests completed yet"), /* @__PURE__ */ React.createElement("p", null, "Complete a mock test to see your progress here. Your scores are saved automatically."), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 20 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("exams") }, "Browse Exam Hub"))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(StatsMosaic, { history, exams }), /* @__PURE__ */ React.createElement("div", { className: "stats-row" }, /* @__PURE__ */ React.createElement(StatCard, { icon: "\u{1F4DD}", label: "Tests Taken", value: totalTests, color: "var(--accent)" }), /* @__PURE__ */ React.createElement(StatCard, { icon: "\u2B50", label: "Average Score", value: avgScore, color: "var(--gold)" }), /* @__PURE__ */ React.createElement(StatCard, { icon: "\u{1F3C6}", label: "Best Score", value: bestScore, color: "var(--leaf)" }), /* @__PURE__ */ React.createElement(StatCard, { icon: "\u{1F3AF}", label: "Active Exams", value: examIds.length, color: "var(--ember)" })), /* @__PURE__ */ React.createElement(LevelCard, { g: computeGamification(history) }), /* @__PURE__ */ React.createElement(ActivityHeatmap, { history }), /* @__PURE__ */ React.createElement(Analytics, { history, exams }), window.LP_ErrorLogPanel && /* @__PURE__ */ React.createElement(window.LP_ErrorLogPanel, { exams }), /* @__PURE__ */ React.createElement(StudyPlan, { history, onNav }), /* @__PURE__ */ React.createElement("section", { className: "progress-section" }, /* @__PURE__ */ React.createElement("div", { className: "history-header" }, /* @__PURE__ */ React.createElement("h2", { className: "section-heading", style: { margin: 0 } }, "Test History"), /* @__PURE__ */ React.createElement("div", { className: "filter-row" }, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-3)", fontSize: 14 } }, "Filter:"), /* @__PURE__ */ React.createElement("select", { className: "filter-select", value: filter, onChange: (e) => setFilter(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "All Exams"), examIds.map((eid) => {
      const ex = exams.find((e) => e.id === eid);
      return /* @__PURE__ */ React.createElement("option", { key: eid, value: eid }, (ex == null ? void 0 : ex.name) || eid);
    })))), /* @__PURE__ */ React.createElement("div", { className: "history-table-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "history-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Date"), /* @__PURE__ */ React.createElement("th", null, "Exam"), /* @__PURE__ */ React.createElement("th", null, "Type"), /* @__PURE__ */ React.createElement("th", null, "Score"), /* @__PURE__ */ React.createElement("th", null, "Sections"), /* @__PURE__ */ React.createElement("th", null))), /* @__PURE__ */ React.createElement("tbody", null, filtered.map((entry, idx) => {
      var _a2;
      const ex = exams.find((e) => e.id === entry.exam);
      const color = (ex == null ? void 0 : ex.colour) || "var(--accent)";
      return /* @__PURE__ */ React.createElement("tr", { key: idx }, /* @__PURE__ */ React.createElement("td", null, fmtDate(entry.date || entry.ts)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "exam-tag", style: { background: color + "18", color } }, (ex == null ? void 0 : ex.name) || entry.exam)), /* @__PURE__ */ React.createElement("td", null, entry.type === "full" ? "Full Test" : (_a2 = entry.type) == null ? void 0 : _a2.replace("section_", "").replace(/^./, (c) => c.toUpperCase())), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("strong", { style: { color } }, fmtScore(entry, entry.exam))), /* @__PURE__ */ React.createElement("td", null, (() => {
        const ss = entry.sectionScores || entry.sections;
        if (!ss) return "\u2014";
        return Object.entries(ss).map(([k, v]) => {
          var _a3, _b;
          const val = typeof v === "object" && v !== null ? (_b = (_a3 = v.band) != null ? _a3 : v.score) != null ? _b : "\u2014" : v;
          return /* @__PURE__ */ React.createElement("span", { key: k, className: "section-tag" }, k, ": ", val);
        });
      })()), /* @__PURE__ */ React.createElement("td", null, ex && onPractice && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: () => onPractice(ex, { examId: ex.id, type: "full" }) }, "Retry")));
    })))))))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_Progress = Progress;
})();
