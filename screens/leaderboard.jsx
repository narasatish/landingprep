/* global React, window, fetch, localStorage */
"use strict";

// LandingPrep — Leaderboard. Ranks students by their best mock-test percentage
// per exam, backed by the node server (/api/leaderboard). Submitting is opt-in:
// it reads your saved mock history and posts your best score under a display
// name. Falls back to a read-only seed when the backend is offline.
(function () {
  const { useState, useEffect } = React;

  const EXAMS = ["ielts", "toefl", "pte", "celpip", "duolingo", "gre", "gmat"];
  const NAMES = { ielts: "IELTS", toefl: "TOEFL", pte: "PTE", celpip: "CELPIP", duolingo: "Duolingo", gre: "GRE", gmat: "GMAT" };
  const SEED = [
    { name: "Priya S.", exam: "ielts", pct: 94, scoreLabel: "Band 8.0" },
    { name: "Daniel O.", exam: "pte", pct: 91, scoreLabel: "82/90" },
    { name: "Mei L.", exam: "toefl", pct: 88, scoreLabel: "112/120" },
    { name: "Rahul M.", exam: "gre", pct: 90, scoreLabel: "327/340" },
    { name: "Sofia G.", exam: "gmat", pct: 86, scoreLabel: "685" },
  ];

  // Best mock percentage per exam from local history.
  function myBest() {
    let hist = [];
    try { hist = JSON.parse(localStorage.getItem("lp_history") || "[]"); } catch (e) {}
    const best = {};
    hist.forEach((h) => {
      const pct = typeof h.pct === "number" ? h.pct : (h.score && h.total ? Math.round((h.score / h.total) * 100) : null);
      if (h.exam && typeof pct === "number") { if (!best[h.exam] || pct > best[h.exam].pct) best[h.exam] = { pct, scoreLabel: h.scoreLabel || (h.score != null && h.total ? h.score + "/" + h.total : "") }; }
    });
    return best;
  }

  function LeaderboardPanel() {
    const [exam, setExam] = useState("ielts");
    const [rows, setRows] = useState(null);
    const [online, setOnline] = useState(true);
    const [name, setName] = useState(() => { try { return (window.LP_AUTH && window.LP_AUTH.getUser() && window.LP_AUTH.getUser().name) || ""; } catch (e) { return ""; } });
    const [msg, setMsg] = useState("");
    const best = myBest();

    const FS = () => window.LP_FIRESTORE; // Firestore if configured, else /api
    const API = window.LP_API_BASE || ""; // Render backend base when split, else same-origin
    const load = async (ex) => {
      try {
        if (FS()) { setRows(await FS().leaderboard.get(ex)); setOnline(true); return; }
        const r = await fetch(API + "/api/leaderboard?exam=" + encodeURIComponent(ex), { cache: "no-store" });
        if (!r.ok) throw 0;
        const j = await r.json(); setRows(j.leaderboard || []); setOnline(true);
      } catch (e) { setRows(SEED.filter((s) => s.exam === ex)); setOnline(false); }
    };
    useEffect(() => {
      load(exam);
      const onReady = () => load(exam);
      window.addEventListener("lp-firestore-ready", onReady);
      return () => window.removeEventListener("lp-firestore-ready", onReady);
    }, [exam]);

    const submit = async () => {
      const b = best[exam];
      if (!b) { setMsg("Take a " + NAMES[exam] + " mock test first — your best score will appear here."); return; }
      try {
        const entry = { name: name || "Anonymous", exam, pct: b.pct, scoreLabel: b.scoreLabel };
        if (FS()) { await FS().leaderboard.submit(entry); }
        else { const r = await fetch(API + "/api/leaderboard/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) }); if (!r.ok) throw 0; }
        setMsg("✅ Submitted your best " + NAMES[exam] + " score (" + b.pct + "%)."); load(exam);
      } catch (e) { setOnline(false); setMsg("⚠ Couldn't submit — the live server is offline."); }
    };

    return (
      <div className="lb-panel">
        <div className="tool-card">
          <h2>🏆 Leaderboard</h2>
          <p className="tool-sub">See the top mock-test scorers and add your own best result. Friendly competition to keep you motivated.</p>
          <div className="lb-tabs">{EXAMS.map((e) => <button key={e} className={"lb-tab" + (exam === e ? " active" : "")} onClick={() => { setExam(e); setMsg(""); }}>{NAMES[e]}</button>)}</div>
        </div>

        <div className="tool-card lb-submit">
          <div className="lb-submit-row">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name" maxLength={40} />
            <button className="tool-btn" onClick={submit}>＋ Add my best {NAMES[exam]} score{best[exam] ? " (" + best[exam].pct + "%)" : ""}</button>
          </div>
          {msg && <p className="tool-note">{msg}</p>}
          {!online && <p className="tool-note">⚠ Showing example rankings — the live leaderboard needs the LandingPrep backend.</p>}
        </div>

        <div className="tool-card lb-table-card">
          {rows === null ? <p className="tool-sub">Loading…</p> : rows.length === 0 ? <p className="tool-sub">No scores yet for {NAMES[exam]} — be the first to add yours!</p> : (
            <table className="lb-table">
              <thead><tr><th>#</th><th>Name</th><th>Score</th><th>%</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id || i} className={i < 3 ? "lb-top" : ""}>
                    <td className="lb-rank">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</td>
                    <td>{r.name}</td><td>{r.scoreLabel || "—"}</td><td><strong>{r.pct}%</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="tool-note">Scores are self-reported from LandingPrep mock tests and shown for motivation only.</p>
      </div>
    );
  }

  window.LP_LeaderboardPanel = LeaderboardPanel;
})();
