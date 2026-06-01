/* global React, window */
"use strict";

// LandingPrep — study-abroad Destinations (country profiles), Top-University
// rankings, and education-loan comparison panels for the Colleges page.
(function () {
  const { useState, useEffect } = React;
  const COUNTRIES = () => window.LP_COUNTRY_DATA || [];
  const COLLEGES = () => window.LP_COLLEGES || [];

  // ── Destinations: per-country profile (controlled by the page country) ─────
  function DestinationsPanel({ onNav, country, onFindColleges }) {
    const list = COUNTRIES();
    const c = list.find(x => x.name === country) || list.find(x => x.name === "USA") || list[0];
    if (!c) return <div className="tool-card"><p className="tool-sub">Loading destinations…</p></div>;
    const unis = COLLEGES().filter(u => u.country === c.name).sort((a, b) => a.rank - b.rank).slice(0, 8);
    const proc = (window.LP_COLLEGE_PROCESS || {})[c.name] || [];
    const ci = (window.LP_COLLEGE_COUNTRY_INFO || {})[c.name] || {};
    const vsClass = c.visaSuccess >= 85 ? "good" : c.visaSuccess >= 70 ? "ok" : "warn";
    return (
      <div className="dest-panel">
        <div className="dest-hero tool-card">
          {window.LP_Landmark ? <div className="dest-landmark"><window.LP_Landmark id={c.id} /></div> : <div className="dest-hero-icon">{c.icon}</div>}
          <div className="dest-hero-info">
            <h2>{c.flag} Study in {c.name}</h2>
            <p className="tool-sub">{c.tagline}</p>
            <div className="dest-badges">
              <span className={"dest-visa " + vsClass}>🛂 {c.visaSuccess}% student-visa success</span>
              <span className="dest-badge">🎓 {unis.length ? unis[0].natRank ? "Top universities incl. " + unis[0].name.split(" ").slice(0, 2).join(" ") : "" : ""}</span>
            </div>
          </div>
        </div>

        <div className="dest-grid2">
          <div className="tool-card">
            <h3>✅ Why {c.name}?</h3>
            <ul className="dest-why">{c.whyStudy.map((w, i) => <li key={i}>{w}</li>)}</ul>
          </div>
          <div className="tool-card">
            <h3>📊 Key facts</h3>
            <div className="dest-facts">
              <div><span>Population</span><strong>{c.population}</strong></div>
              <div><span>Weather</span><strong>{c.weather}</strong></div>
              <div><span>Intakes</span><strong>{c.intakes.join(", ")}</strong></div>
              <div><span>Avg tuition</span><strong>{c.avgTuition}</strong></div>
              <div><span>Living cost</span><strong>{c.avgLiving}</strong></div>
              <div><span>Post-study work</span><strong>{c.postStudyWork}</strong></div>
            </div>
          </div>
        </div>

        <div className="tool-card">
          <h3>🛬 Immigration, PR &amp; settlement in {c.name}</h3>
          <div className="dest-imm">
            <p><strong>Student visa:</strong> {c.visaNote} <span className={"dest-visa inline " + vsClass}>{c.visaSuccess}% approval</span></p>
            <p><strong>Immigration pathway:</strong> {c.immigration}</p>
            <p><strong>Settlement:</strong> {c.settlement} <span className="dest-pr-pill">PR ≈ {c.prTimeline}</span></p>
          </div>

          {c.visaTypes && c.visaTypes.length > 0 && (
            <div className="dest-visatypes">
              <h4 className="dest-sub">🛂 Visa &amp; permit types you'll use</h4>
              <div className="dest-visa-grid">
                {c.visaTypes.map((v, i) => (
                  <div className="dest-visa-card" key={i}>
                    <strong>{v.name}</strong>
                    <span>{v.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {c.immigrationPlan && c.immigrationPlan.length > 0 && (
            <div className="dest-immplan">
              <h4 className="dest-sub">🗺️ Your student → PR roadmap</h4>
              <ol className="dest-roadmap">
                {c.immigrationPlan.map((s, i) => (
                  <li key={i}><span className="dest-step-n">{i + 1}</span><span>{s}</span></li>
                ))}
              </ol>
            </div>
          )}

          {c.changes && c.changes.length > 0 && (
            <div className="dest-immchanges">
              <h4 className="dest-sub">🆕 Recent immigration &amp; visa changes</h4>
              <ul className="dest-changes">{c.changes.map((ch, i) => <li key={i}><span className="dest-change-d">{ch.d}</span> {ch.t}</li>)}</ul>
            </div>
          )}
          <p className="tool-note">Immigration rules change often — always confirm with the official government / embassy source before acting.</p>
        </div>

        <div className="tool-card">
          <h3>🏙️ Top student cities</h3>
          <div className="dest-cities">{c.topCities.map(t => <span key={t} className="dest-city">📍 {t}</span>)}</div>
        </div>

        <div className="tool-card">
          <h3>📝 Admission process in {c.name}</h3>
          {proc.length > 0 && <ol className="dest-process">{proc.map((s, i) => <li key={i}>{s}</li>)}</ol>}
          {ci.checklist && <p className="dest-docs"><strong>Documents needed:</strong> {ci.checklist.join(" · ")}</p>}
          {ci.deadlines && <p className="dest-docs"><strong>Typical deadlines:</strong> {ci.deadlines}</p>}
        </div>

        {unis.length > 0 && (
          <div className="tool-card">
            <h3>🏛️ Top universities in {c.name}</h3>
            <div className="dest-unis">
              {unis.map(u => (
                <div className="dest-uni" key={u.id}>
                  <div><strong>{u.name}</strong><div className="dest-uni-meta">QS #{u.rank} · IELTS {u.ielts} · {u.acceptance}% accept · {u.feeNote}</div></div>
                  <a className="dest-uni-link" href={"/university/" + u.id + "/"}>Details →</a>
                </div>
              ))}
            </div>
            <button className="tool-btn" style={{ marginTop: 12 }} onClick={() => onFindColleges ? onFindColleges() : (onNav && onNav("colleges"))}>🔮 Find &amp; predict colleges in {c.name} →</button>
          </div>
        )}
      </div>
    );
  }

  // ── Top Universities / world rankings (scoped to the page country) ─────────
  function RankingsPanel({ country: pageCountry }) {
    const all = COLLEGES();
    const countries = [...new Set(all.map(c => c.country))];
    const [country, setCountry] = useState(pageCountry || "All");
    const [q, setQ] = useState("");
    useEffect(() => { if (pageCountry) setCountry(pageCountry); }, [pageCountry]);
    const list = all
      .filter(c => (country === "All" || c.country === country) && (!q.trim() || (c.name + " " + c.programs.join(" ")).toLowerCase().includes(q.trim().toLowerCase())))
      .sort((a, b) => a.rank - b.rank);
    return (
      <div className="rank-panel">
        <div className="tool-card">
          <h2>🏆 Top Universities {country !== "All" ? "in " + country : "in the World"}</h2>
          <p className="tool-sub">Ranked by QS World Ranking. Showing {list.length} universities. Switch country above, or browse all here.</p>
          <div className="tool-row">
            <label>Country
              <select value={country} onChange={e => setCountry(e.target.value)}><option value="All">All countries</option>{countries.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </label>
            <label>Search
              <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="university or program" />
            </label>
          </div>
        </div>
        <div className="rank-list">
          {list.map((c, i) => (
            <div className="rank-row" key={c.id}>
              <div className="rank-num">#{c.rank}</div>
              <div className="rank-info">
                <a href={"/university/" + c.id + "/"} className="rank-name">{c.name}</a>
                <div className="rank-meta">{c.city} · {c.country} · #{c.natRank} nationally · {c.type}</div>
              </div>
              <div className="rank-stats"><span>IELTS {c.ielts}</span><span>{c.acceptance}% accept</span><span>{c.feeNote}</span></div>
            </div>
          ))}
          {list.length === 0 && <div className="tool-card"><p className="tool-sub">No universities matched.</p></div>}
        </div>
      </div>
    );
  }

  // ── Education-loan lender comparison ──────────────────────────────────────
  // Official application pages per lender (verify on the lender's site).
  const LOAN_APPLY = {
    "SBI (Global Ed-Vantage)": "https://sbi.co.in/web/personal-banking/loans/education-loans/global-ed-vantage",
    "Bank of Baroda": "https://www.bankofbaroda.in/personal-banking/loans/education-loan",
    "Punjab National Bank (Udaan)": "https://www.pnbindia.in/education-loan.html",
    "HDFC Credila": "https://www.hdfccredila.com/",
    "Avanse": "https://www.avanse.com/",
    "Auxilo": "https://www.auxilo.com/",
    "ICICI Bank": "https://www.icicibank.com/personal-banking/loans/education-loan",
    "Axis Bank": "https://www.axisbank.com/retail/loans/education-loan",
    "Prodigy Finance": "https://prodigyfinance.com/",
    "MPOWER Financing": "https://www.mpowerfinancing.com/",
  };
  function LoanPanel({ onNav }) {
    const banks = window.LP_LOAN_BANKS || [];
    const [type, setType] = useState("All");
    const types = ["All", ...new Set(banks.map(b => b.type))];
    const list = banks.filter(b => type === "All" || b.type === type);
    return (
      <div className="loan-panel">
        <div className="tool-card">
          <h2>🏦 Compare Education Loans</h2>
          <p className="tool-sub">Indicative terms from major Indian banks and NBFCs for studying abroad. Compare interest, limits, processing fees and repayment — then estimate your EMI.</p>
          <div className="tool-row">
            <label>Lender type
              <select value={type} onChange={e => setType(e.target.value)}>{types.map(t => <option key={t} value={t}>{t}</option>)}</select>
            </label>
          </div>
        </div>
        <div className="loan-cards">
          {list.map((b, i) => (
            <div className="loan-card" key={i}>
              <div className="loan-head"><strong>{b.name}</strong><span className="loan-type">{b.type}</span></div>
              <div className="loan-stats">
                <div><span>Interest</span><strong>{b.rate}</strong></div>
                <div><span>Max (collateral)</span><strong>{b.maxColl}</strong></div>
                <div><span>Max (no collateral)</span><strong>{b.maxNoColl}</strong></div>
                <div><span>Processing fee</span><strong>{b.processing}</strong></div>
                <div><span>Repayment</span><strong>{b.repay}</strong></div>
                <div><span>Margin</span><strong>{b.margin}</strong></div>
              </div>
              <p className="loan-notes">{b.notes}</p>
              {LOAN_APPLY[b.name] && <a className="loan-apply" href={LOAN_APPLY[b.name]} target="_blank" rel="noopener noreferrer">Apply on official site ↗</a>}
            </div>
          ))}
        </div>
        <p className="tool-note">Rates change frequently and depend on your profile, co-applicant and collateral — confirm with the lender. *Unsecured limits vary by university tier.</p>
        <div className="tools-foot">
          <a className="tool-btn ghost" onClick={() => onNav && onNav("colleges")}>🧮 Calculate your EMI (GPA &amp; Loan tab) →</a>
        </div>
      </div>
    );
  }

  window.LP_DestinationsPanel = DestinationsPanel;
  window.LP_RankingsPanel = RankingsPanel;
  window.LP_LoanPanel = LoanPanel;
})();
