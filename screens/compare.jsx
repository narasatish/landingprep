/* global React, window */
"use strict";

// LandingPrep — side-by-side Compare tool for the Colleges page.
// Two modes: compare up to 4 universities, or up to 3 study destinations.
(function () {
  const { useState } = React;

  // ── Compare universities ───────────────────────────────────────────────────
  function UniCompare({ country }) {
    const ALL = window.LP_COLLEGES || [];
    const [picks, setPicks] = useState([]);
    const [q, setQ] = useState("");
    const matches = q.trim()
      ? ALL.filter((c) => (c.name + " " + c.country).toLowerCase().includes(q.trim().toLowerCase()) && !picks.find((p) => p.id === c.id)).slice(0, 7)
      : [];
    const add = (c) => { if (picks.length < 4) { setPicks([...picks, c]); setQ(""); } };
    const remove = (id) => setPicks(picks.filter((p) => p.id !== id));

    const ROWS = [
      ["Country", (c) => c.country], ["City", (c) => c.city],
      ["QS World rank", (c) => "#" + c.rank], ["National rank", (c) => "#" + c.natRank],
      ["Type", (c) => c.type], ["Tuition (intl)", (c) => c.feeNote],
      ["IELTS", (c) => c.ielts], ["TOEFL", (c) => c.toefl], ["GRE", (c) => c.gre],
      ["Acceptance rate", (c) => c.acceptance + "%"], ["Intl students", (c) => c.intlPct + "%"],
      ["Intakes", (c) => (c.intakes || []).join(", ")], ["Deadline", (c) => c.deadline],
      ["Scholarships", (c) => c.scholarship || "—"],
      ["Top programs", (c) => (c.programs || []).slice(0, 4).join(", ")],
    ];

    return (
      <div className="cmp-uni">
        <div className="tool-card">
          <h3>🏛️ Compare universities <span className="cmp-count">({picks.length}/4)</span></h3>
          <p className="tool-sub">Search and add up to four universities to compare fees, requirements, acceptance and more side by side.</p>
          <div className="cmp-search">
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a university (e.g. Toronto, MIT, Melbourne)…" />
            {matches.length > 0 && (
              <div className="cmp-suggest">
                {matches.map((c) => (
                  <button key={c.id} className="cmp-suggest-item" onClick={() => add(c)}>
                    <strong>{c.name}</strong><span>{c.country} · QS #{c.rank}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {picks.length > 0 && (
            <div className="cmp-chips">
              {picks.map((c) => <span key={c.id} className="cmp-chip">{c.name}<button onClick={() => remove(c.id)} aria-label="Remove">✕</button></span>)}
            </div>
          )}
        </div>

        {picks.length === 0 ? (
          <div className="tool-card"><p className="tool-sub">Add universities above to build your comparison. Tip: compare a Reach, a Target and a Safe school together.</p></div>
        ) : (
          <div className="tool-card cmp-table-wrap">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th className="cmp-rowhead">Metric</th>
                  {picks.map((c) => (
                    <th key={c.id}><a href={"/university/" + c.id + "/"}>{c.name}</a></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, fn]) => (
                  <tr key={label}>
                    <td className="cmp-rowhead">{label}</td>
                    {picks.map((c) => <td key={c.id}>{fn(c)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ── Compare countries ───────────────────────────────────────────────────────
  function CountryCompare() {
    const ALL = window.LP_COUNTRY_DATA || [];
    const [picks, setPicks] = useState(ALL.slice(0, 3).map((c) => c.name));
    const toggle = (name) => {
      setPicks((p) => p.includes(name) ? p.filter((x) => x !== name) : (p.length < 3 ? [...p, name] : p));
    };
    const cols = picks.map((n) => ALL.find((c) => c.name === n)).filter(Boolean);
    const ROWS = [
      ["Student-visa success", (c) => c.visaSuccess + "%"],
      ["Avg tuition", (c) => c.avgTuition], ["Avg living cost", (c) => c.avgLiving],
      ["Post-study work", (c) => c.postStudyWork], ["PR timeline", (c) => c.prTimeline],
      ["Immigration route", (c) => c.immigration], ["Intakes", (c) => (c.intakes || []).join(", ")],
      ["Top cities", (c) => (c.topCities || []).slice(0, 4).join(", ")],
      ["Popular programs", (c) => (c.popularPrograms || []).slice(0, 4).join(", ")],
      ["Weather", (c) => c.weather],
    ];
    return (
      <div className="cmp-country">
        <div className="tool-card">
          <h3>🌍 Compare destinations <span className="cmp-count">({picks.length}/3)</span></h3>
          <p className="tool-sub">Pick up to three countries to compare cost, work rights, PR speed and visa success.</p>
          <div className="cmp-country-pick">
            {ALL.map((c) => (
              <button key={c.id} className={"cmp-cpick" + (picks.includes(c.name) ? " active" : "")} onClick={() => toggle(c.name)}>
                <span>{c.flag}</span>{c.name}
              </button>
            ))}
          </div>
        </div>
        {cols.length > 0 && (
          <div className="tool-card cmp-table-wrap">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th className="cmp-rowhead">Metric</th>
                  {cols.map((c) => <th key={c.id}>{c.flag} {c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {ROWS.map(([label, fn]) => (
                  <tr key={label}>
                    <td className="cmp-rowhead">{label}</td>
                    {cols.map((c) => <td key={c.id}>{fn(c)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function ComparePanel({ country }) {
    const [mode, setMode] = useState("uni");
    return (
      <div className="cmp-panel">
        <div className="tool-card">
          <h2>⚖️ Compare side by side</h2>
          <p className="tool-sub">Make a confident decision — compare universities or whole destinations on the metrics that matter.</p>
          <div className="cmp-modes">
            <button className={"cmp-mode" + (mode === "uni" ? " active" : "")} onClick={() => setMode("uni")}>🏛️ Universities</button>
            <button className={"cmp-mode" + (mode === "country" ? " active" : "")} onClick={() => setMode("country")}>🌍 Countries</button>
          </div>
        </div>
        {mode === "uni" ? <UniCompare country={country} /> : <CountryCompare />}
      </div>
    );
  }

  window.LP_ComparePanel = ComparePanel;
})();
