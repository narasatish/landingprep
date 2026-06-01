"use strict";
(function() {
  const { useState, useEffect } = React;
  const EXAMS = ["ielts", "toefl", "pte", "celpip", "duolingo", "gre", "gmat"];
  const NAMES = { ielts: "IELTS", toefl: "TOEFL", pte: "PTE", celpip: "CELPIP", duolingo: "Duolingo", gre: "GRE", gmat: "GMAT" };
  const SEED = [
    { name: "Priya S.", exam: "ielts", pct: 94, scoreLabel: "Band 8.0" },
    { name: "Daniel O.", exam: "pte", pct: 91, scoreLabel: "82/90" },
    { name: "Mei L.", exam: "toefl", pct: 88, scoreLabel: "112/120" },
    { name: "Rahul M.", exam: "gre", pct: 90, scoreLabel: "327/340" },
    { name: "Sofia G.", exam: "gmat", pct: 86, scoreLabel: "685" }
  ];
  function myBest() {
    let hist = [];
    try {
      hist = JSON.parse(localStorage.getItem("lp_history") || "[]");
    } catch (e) {
    }
    const best = {};
    hist.forEach((h) => {
      const pct = typeof h.pct === "number" ? h.pct : h.score && h.total ? Math.round(h.score / h.total * 100) : null;
      if (h.exam && typeof pct === "number") {
        if (!best[h.exam] || pct > best[h.exam].pct) best[h.exam] = { pct, scoreLabel: h.scoreLabel || (h.score != null && h.total ? h.score + "/" + h.total : "") };
      }
    });
    return best;
  }
  function LeaderboardPanel() {
    const [exam, setExam] = useState("ielts");
    const [rows, setRows] = useState(null);
    const [online, setOnline] = useState(true);
    const [name, setName] = useState(() => {
      try {
        return window.LP_AUTH && window.LP_AUTH.getUser() && window.LP_AUTH.getUser().name || "";
      } catch (e) {
        return "";
      }
    });
    const [msg, setMsg] = useState("");
    const best = myBest();
    const FS = () => window.LP_FIRESTORE;
    const API = window.LP_API_BASE || "";
    const load = async (ex) => {
      try {
        if (FS()) {
          setRows(await FS().leaderboard.get(ex));
          setOnline(true);
          return;
        }
        const r = await fetch(API + "/api/leaderboard?exam=" + encodeURIComponent(ex), { cache: "no-store" });
        if (!r.ok) throw 0;
        const j = await r.json();
        setRows(j.leaderboard || []);
        setOnline(true);
      } catch (e) {
        setRows(SEED.filter((s) => s.exam === ex));
        setOnline(false);
      }
    };
    useEffect(() => {
      load(exam);
      const onReady = () => load(exam);
      window.addEventListener("lp-firestore-ready", onReady);
      return () => window.removeEventListener("lp-firestore-ready", onReady);
    }, [exam]);
    const submit = async () => {
      const b = best[exam];
      if (!b) {
        setMsg("Take a " + NAMES[exam] + " mock test first \u2014 your best score will appear here.");
        return;
      }
      try {
        const entry = { name: name || "Anonymous", exam, pct: b.pct, scoreLabel: b.scoreLabel };
        if (FS()) {
          await FS().leaderboard.submit(entry);
        } else {
          const r = await fetch(API + "/api/leaderboard/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
          if (!r.ok) throw 0;
        }
        setMsg("\u2705 Submitted your best " + NAMES[exam] + " score (" + b.pct + "%).");
        load(exam);
      } catch (e) {
        setOnline(false);
        setMsg("\u26A0 Couldn't submit \u2014 the live server is offline.");
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "lb-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F3C6} Leaderboard"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "See the top mock-test scorers and add your own best result. Friendly competition to keep you motivated."), /* @__PURE__ */ React.createElement("div", { className: "lb-tabs" }, EXAMS.map((e) => /* @__PURE__ */ React.createElement("button", { key: e, className: "lb-tab" + (exam === e ? " active" : ""), onClick: () => {
      setExam(e);
      setMsg("");
    } }, NAMES[e])))), /* @__PURE__ */ React.createElement("div", { className: "tool-card lb-submit" }, /* @__PURE__ */ React.createElement("div", { className: "lb-submit-row" }, /* @__PURE__ */ React.createElement("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Your display name", maxLength: 40 }), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: submit }, "\uFF0B Add my best ", NAMES[exam], " score", best[exam] ? " (" + best[exam].pct + "%)" : "")), msg && /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, msg), !online && /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "\u26A0 Showing example rankings \u2014 the live leaderboard needs the LandingPrep backend.")), /* @__PURE__ */ React.createElement("div", { className: "tool-card lb-table-card" }, rows === null ? /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Loading\u2026") : rows.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "No scores yet for ", NAMES[exam], " \u2014 be the first to add yours!") : /* @__PURE__ */ React.createElement("table", { className: "lb-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "#"), /* @__PURE__ */ React.createElement("th", null, "Name"), /* @__PURE__ */ React.createElement("th", null, "Score"), /* @__PURE__ */ React.createElement("th", null, "%"))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: r.id || i, className: i < 3 ? "lb-top" : "" }, /* @__PURE__ */ React.createElement("td", { className: "lb-rank" }, i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : i === 2 ? "\u{1F949}" : i + 1), /* @__PURE__ */ React.createElement("td", null, r.name), /* @__PURE__ */ React.createElement("td", null, r.scoreLabel || "\u2014"), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("strong", null, r.pct, "%"))))))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Scores are self-reported from LandingPrep mock tests and shown for motivation only."));
  }
  window.LP_LeaderboardPanel = LeaderboardPanel;
})();
