/* global React, window */
"use strict";
// LandingPrep — "Move Abroad" hub: interactive pre-departure checklist, country
// visa-timeline tracker, and student city guides. Reads window.LP_SA_EXTRA.
(function () {
  const { useState, useEffect } = React;
  const KEY = "lp_predeparture";

  function Checklist({ data }) {
    const [done, setDone] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } });
    const toggle = (id) => { const n = Object.assign({}, done, { [id]: !done[id] }); setDone(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch (e) {} };
    const all = data.reduce((a, g) => a.concat(g.items.map((_, i) => g.group + i)), []);
    const completed = all.filter((id) => done[id]).length;
    return (
      <div>
        <div className="tool-card">
          <h3>✅ Pre-departure checklist</h3>
          <p className="tool-sub">Everything to sort before you fly — ticks are saved on this device.</p>
          <div className="rl-progress"><div className="rl-progress-bar"><span style={{ width: (all.length ? completed / all.length * 100 : 0) + "%" }} /></div><span className="rl-progress-txt">{completed}/{all.length} done</span></div>
        </div>
        {data.map((g) => (
          <div className="tool-card" key={g.group}>
            <h4>{g.group}</h4>
            {g.items.map((it, i) => {
              const id = g.group + i;
              return (
                <label className={"rl-check" + (done[id] ? " checked" : "")} key={i}>
                  <input type="checkbox" checked={!!done[id]} onChange={() => toggle(id)} /> <span>{it}</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  function VisaTimeline({ data }) {
    const countries = Object.keys(data);
    const [c, setC] = useState(countries[0] || "");
    const steps = data[c] || [];
    return (
      <div>
        <div className="tools-groups">
          {countries.map((k) => <button key={k} className={"tools-group" + (c === k ? " active" : "")} onClick={() => setC(k)}>{k}</button>)}
        </div>
        <div className="tool-card">
          <h3>🛂 {c} student-visa timeline</h3>
          <ol className="rl-timeline">
            {steps.map((s, i) => (
              <li key={i}><div className="rl-step-when">{s.when}</div><div className="rl-step-body"><strong>{s.step}</strong><span>{s.detail}</span></div></li>
            ))}
          </ol>
          <p className="tool-note">Always confirm the latest rules on the official immigration website — processing times change.</p>
        </div>
      </div>
    );
  }

  function CityGuides({ data }) {
    return (
      <div className="rl-cities">
        {data.map((c, i) => (
          <div className="tool-card rl-city" key={i}>
            <h3>{c.emoji} {c.city} <span className="rl-city-country">{c.country}</span></h3>
            <p className="tool-sub">{c.intro}</p>
            <div className="rl-city-meta"><span>💷 {c.cost}</span><span>🚌 {c.transport}</span></div>
            {c.studentAreas && <p className="rl-city-areas"><strong>Student areas:</strong> {c.studentAreas.join(", ")}</p>}
            <ul className="rl-city-tips">{(c.tips || []).map((t, j) => <li key={j}>{t}</li>)}</ul>
          </div>
        ))}
      </div>
    );
  }

  function Relocate({ onNav, initialTab }) {
    const d = window.LP_SA_EXTRA || {};
    const [tab, setTab] = useState(["checklist", "visa", "cities"].includes(initialTab) ? initialTab : "checklist");
    useEffect(() => {
      try {
        document.title = "Move Abroad — Pre-Departure Checklist, Visa Timeline & City Guides | LandingPrep";
        const m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute("content", "Free study-abroad relocation toolkit: an interactive pre-departure checklist, student-visa timelines for the USA, UK, Canada, Australia & Germany, and city guides with costs and tips.");
      } catch (e) {}
    }, []);
    return (
      <>
        <window.LP_TopBar current="colleges" onNav={onNav} />
        <main className="tools-shell tools-shell-wide">
          <header className="tools-hero">
            <h1>✈️ Move Abroad</h1>
            <p>Everything after the offer letter — a pre-departure checklist you can tick off, visa timelines by country, and student city guides.</p>
          </header>
          <div className="tools-tabs">
            <button className={"tools-tab" + (tab === "checklist" ? " active" : "")} onClick={() => setTab("checklist")}>✅ Pre-departure</button>
            <button className={"tools-tab" + (tab === "visa" ? " active" : "")} onClick={() => setTab("visa")}>🛂 Visa timeline</button>
            <button className={"tools-tab" + (tab === "cities" ? " active" : "")} onClick={() => setTab("cities")}>🏙️ City guides</button>
          </div>
          {tab === "checklist" && (d.preDeparture ? <Checklist data={d.preDeparture} /> : <div className="tool-card"><p className="tool-sub">Loading…</p></div>)}
          {tab === "visa" && (d.visaTimeline ? <VisaTimeline data={d.visaTimeline} /> : <div className="tool-card"><p className="tool-sub">Loading…</p></div>)}
          {tab === "cities" && (d.cityGuides ? <CityGuides data={d.cityGuides} /> : <div className="tool-card"><p className="tool-sub">Loading…</p></div>)}
          <div className="tools-foot"><a className="tool-btn ghost" onClick={() => onNav && onNav("colleges")}>🏛️ College predictor &amp; scholarships →</a></div>
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_Relocate = Relocate;
})();
