/* global React, window */
"use strict";

// LandingPrep — Scholarship Finder (Tools tab). Filters the curated dataset in
// window.LP_SCHOLARSHIPS by country, level and funding type.
(function () {
  const { useState, useEffect } = React;

  const TYPE_CLASS = (t) => /Government|Govt/.test(t) ? "sch-govt" : /University/.test(t) ? "sch-uni" : /Need/.test(t) ? "sch-need" : "sch-merit";

  function ScholarshipCard({ s }) {
    const [open, setOpen] = useState(false);
    return (
      <div className="sch-card">
        <div className="sch-head">
          <div><div className="sch-name">{s.name}</div><div className="sch-loc">{s.country}</div></div>
          <span className={"sch-type " + TYPE_CLASS(s.type)}>{s.type}</span>
        </div>
        <div className="sch-stats">
          <div><span>Level</span><strong>{s.level}</strong></div>
          <div><span>Award</span><strong>{s.amount}</strong></div>
          <div><span>Deadline</span><strong>{s.deadline}</strong></div>
        </div>
        <p className="sch-hi">{s.highlight}</p>
        <button className="cc-toggle" onClick={() => setOpen(o => !o)}>{open ? "Hide eligibility ▲" : "Who can apply ▼"}</button>
        {open && (
          <div className="sch-elig">
            <div><strong>Eligibility:</strong> {s.who}</div>
            <p className="tool-note">Indicative — always confirm amounts, eligibility and deadlines on the official scholarship website.</p>
          </div>
        )}
      </div>
    );
  }

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const ABBR = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  function firstMonth(deadline) {
    const d = deadline || "";
    for (let i = 0; i < MONTHS.length; i++) if (d.includes(MONTHS[i])) return i;
    for (const a in ABBR) if (d.includes(a)) return ABBR[a];
    return 99; // rolling / varies
  }

  function ScholarshipPanel({ onNav, country: pageCountry }) {
    const ALL = window.LP_SCHOLARSHIPS || [];
    const COUNTRIES = window.LP_SCHOLARSHIP_COUNTRIES || [];
    const [country, setCountry] = useState(pageCountry || "Any");
    const [level, setLevel] = useState("Any");
    const [type, setType] = useState("Any");
    const [view, setView] = useState("list");
    useEffect(() => { if (pageCountry) setCountry(pageCountry); }, [pageCountry]);

    const matchLevel = (s) => level === "Any" || s.level.toLowerCase().includes(level.toLowerCase());
    const matchType = (s) => type === "Any" || s.type.toLowerCase().includes(type.toLowerCase());
    // Fuzzy country match: exact, substring, or multi-country/region scholarships.
    const matchCountry = (s) => country === "Any" || s.country === country || s.country.includes(country) || /Multiple|Europe/i.test(s.country);
    const list = ALL.filter(s => matchCountry(s) && matchLevel(s) && matchType(s));

    // Group by deadline month for the calendar view.
    const byMonth = {};
    list.forEach(s => { const m = firstMonth(s.deadline); (byMonth[m] = byMonth[m] || []).push(s); });
    const monthKeys = Object.keys(byMonth).map(Number).sort((a, b) => a - b);

    return (
      <div className="sch-panel">
        <div className="tool-card">
          <h2>💸 Scholarship Finder</h2>
          <p className="tool-sub">Find fully-funded and partial scholarships to study abroad — filter by destination, level and funding type. {ALL.length} curated awards.</p>
          <div className="tool-row">
            <label>Destination
              <select value={country} onChange={e => setCountry(e.target.value)}><option value="Any">Any country</option>{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </label>
            <label>Level
              <select value={level} onChange={e => setLevel(e.target.value)}><option value="Any">Any level</option><option value="Undergraduate">Undergraduate</option><option value="Master's">Master's</option><option value="PhD">PhD</option></select>
            </label>
            <label>Funding type
              <select value={type} onChange={e => setType(e.target.value)}><option value="Any">Any type</option><option value="Government">Government</option><option value="University">University</option><option value="Merit">Merit</option><option value="Need">Need-based</option></select>
            </label>
          </div>
          <div className="sch-viewtoggle">
            <button className={"sch-vbtn" + (view === "list" ? " active" : "")} onClick={() => setView("list")}>📋 List</button>
            <button className={"sch-vbtn" + (view === "calendar" ? " active" : "")} onClick={() => setView("calendar")}>📅 Deadlines calendar</button>
          </div>
        </div>
        {view === "list" ? (
          <div className="sch-results">
            <h3>{list.length} scholarship{list.length !== 1 ? "s" : ""} {country !== "Any" ? "for " + country : ""}</h3>
            {list.length === 0 ? <div className="tool-card"><p className="tool-sub">No scholarships matched — try widening your filters.</p></div>
              : list.map(s => <ScholarshipCard key={s.id} s={s} />)}
          </div>
        ) : (
          <div className="sch-calendar">
            {monthKeys.length === 0 && <div className="tool-card"><p className="tool-sub">No scholarships matched.</p></div>}
            {monthKeys.map(m => (
              <div className="sch-month" key={m}>
                <h3>{m === 99 ? "🔄 Rolling / varies" : "📅 " + MONTHS[m]}</h3>
                {byMonth[m].map(s => (
                  <div className="sch-cal-item" key={s.id}>
                    <div><strong>{s.name}</strong><span className="sch-cal-meta"> · {s.country} · {s.amount}</span></div>
                    <span className="sch-cal-deadline">{s.deadline}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div className="tools-foot">
          <a className="tool-btn ghost" onClick={() => onNav && onNav("colleges")}>🏛️ Find your colleges →</a>
        </div>
      </div>
    );
  }

  window.LP_ScholarshipPanel = ScholarshipPanel;
})();
