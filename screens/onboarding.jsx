/* global React, window */
"use strict";

// LandingPrep — "Build My Study-Abroad Plan" onboarding wizard. Three steps:
// goal → profile → a personalised plan (recommended country, Safe/Target/Reach
// universities, scholarships, document checklist, application timeline, and
// one-click links into every tool). Self-contained; works fully offline.
(function () {
  const { useState } = React;

  const EXAMS = [
    { id: "ielts", name: "IELTS", ph: "e.g. 6.5" }, { id: "toefl", name: "TOEFL", ph: "e.g. 95" },
    { id: "pte", name: "PTE", ph: "e.g. 65" }, { id: "duolingo", name: "Duolingo", ph: "e.g. 120" },
    { id: "gre", name: "GRE", ph: "e.g. 320" },
  ];
  const FIELDS = ["Computer Science / IT", "Data Science / AI", "Engineering", "Business / MBA", "Finance", "Health / Bio", "Other"];
  const num = (s) => { const m = String(s || "").match(/[\d,]+/); return m ? parseInt(m[0].replace(/,/g, ""), 10) : 0; };

  // Recommend countries when the student is unsure — score by affordability,
  // visa success and post-study work strength, nudged by budget & field.
  function recommendCountries(budget, field) {
    const data = window.LP_COUNTRY_DATA || [];
    const scored = data.map((c) => {
      const tuition = num(c.avgTuition) || 30000;
      const afford = budget ? Math.max(0, 1 - Math.max(0, tuition - budget) / 40000) : 1 - Math.min(tuition, 50000) / 50000;
      const visa = (c.visaSuccess || 70) / 100;
      const psw = /3 year|36|up to 3|2–4|2-4/i.test(c.postStudyWork || "") ? 1 : 0.6;
      let bonus = 0;
      if (/Germany|Ireland|Netherlands/.test(c.name) && /Engineer|Data|Computer|AI/i.test(field || "")) bonus += 0.15;
      if (/USA|UK/.test(c.name) && /Business|MBA|Finance/i.test(field || "")) bonus += 0.15;
      return { c, score: afford * 0.4 + visa * 0.35 + psw * 0.15 + bonus };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map((x) => x.c);
  }

  function classify(pool, examKey, sc, g) {
    const buckets = { Safe: [], Target: [], Reach: [] };
    pool.forEach((c) => {
      const req = examKey ? parseFloat(c[examKey]) || 0 : 0;
      const meets = !req || !sc || sc >= req;
      const acc = c.acceptance || 50;
      let cls = acc < 15 ? "Reach" : acc < 35 ? "Target" : "Safe";
      if (sc && !meets) cls = cls === "Safe" ? "Target" : "Reach";
      if (g && g >= 3.7 && meets && cls === "Reach" && acc >= 10) cls = "Target";
      buckets[cls].push(c);
    });
    Object.keys(buckets).forEach((k) => buckets[k].sort((a, b) => a.rank - b.rank));
    return buckets;
  }

  const TIMELINE = [
    ["12–10 months before", "Shortlist universities (Profile Evaluation + Predictor), set your target test score and start prep."],
    ["10–8 months", "Take your English/GRE test. Draft your SOP, request LORs and build your CV."],
    ["8–6 months", "Finalise documents, apply to Safe/Target/Reach universities, and apply for scholarships."],
    ["6–3 months", "Accept your best offer, arrange finances/loan and proof of funds, then apply for your visa."],
    ["3–0 months", "Prepare your visa interview, book travel & accommodation, and plan your arrival."],
  ];

  function OnboardingPanel({ country, onNav, onOpenTab }) {
    const ALL = window.LP_COLLEGES || [];
    const SCH = window.LP_SCHOLARSHIPS || [];
    const [step, setStep] = useState(1);
    const [f, setF] = useState({ dest: country && country !== "Any" ? country : "Not sure", field: "Computer Science / IT", intake: "Fall (Aug–Sep)", exam: "ielts", score: "", gpa: "", budget: "" });
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    const [plan, setPlan] = useState(null);

    const build = () => {
      const sc = parseFloat(f.score) || 0, g = parseFloat(f.gpa) || 0, bud = parseFloat(f.budget) || 0;
      const examKey = ["ielts", "toefl", "pte", "duolingo"].includes(f.exam) ? f.exam : null;
      let dests = f.dest === "Not sure" ? recommendCountries(bud, f.field).map((c) => c.name) : [f.dest];
      const primary = dests[0];
      const fieldKw = (f.field || "").split(/[\/ ]/)[0].toLowerCase();
      let pool = ALL.filter((c) => dests.includes(c.country))
        .filter((c) => !bud || (c.tuitionUSD || 0) <= bud + 4000);
      // prefer field match but don't exclude
      const fielded = pool.filter((c) => c.programs.join(" ").toLowerCase().includes(fieldKw));
      const usePool = fielded.length >= 6 ? fielded : pool;
      const buckets = classify(usePool, examKey, sc, g);
      const sch = SCH.filter((s) => dests.some((d) => s.country === d) || /Multiple|Europe/i.test(s.country)).slice(0, 4);
      setPlan({ dests, primary, buckets, sch, recommended: f.dest === "Not sure" });
      setStep(3);
    };

    const Dots = () => (
      <div className="onb-dots">{[1, 2, 3].map((n) => <span key={n} className={"onb-dot" + (step >= n ? " on" : "")}>{n}</span>)}</div>
    );

    return (
      <div className="onb-panel">
        <div className="tool-card onb-head">
          <h2>🚀 Build my study-abroad plan</h2>
          <p className="tool-sub">Answer a few questions and get a personalised plan — recommended country, your Safe/Target/Reach universities, scholarships, documents and a timeline. Free, no signup.</p>
          <Dots />
        </div>

        {step === 1 && (
          <div className="tool-card">
            <h3>Step 1 · Your goal</h3>
            <div className="tool-row">
              <label>Destination
                <select value={f.dest} onChange={set("dest")}>
                  <option>Not sure</option>
                  {(window.LP_COUNTRY_DATA || []).map((c) => <option key={c.id} value={c.name}>{c.flag} {c.name}</option>)}
                </select>
              </label>
              <label>Field / program
                <select value={f.field} onChange={set("field")}>{FIELDS.map((x) => <option key={x}>{x}</option>)}</select>
              </label>
              <label>Target intake
                <select value={f.intake} onChange={set("intake")}><option>Fall (Aug–Sep)</option><option>Spring (Jan)</option><option>Summer (May)</option></select>
              </label>
            </div>
            <p className="tool-note">Pick "Not sure" and we'll recommend the best-fit countries for your budget and field.</p>
            <button className="tool-btn" onClick={() => setStep(2)}>Next →</button>
          </div>
        )}

        {step === 2 && (
          <div className="tool-card">
            <h3>Step 2 · Your profile</h3>
            <div className="tool-row">
              <label>Test<select value={f.exam} onChange={set("exam")}>{EXAMS.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
              <label>Score (or target)<input type="number" value={f.score} onChange={set("score")} placeholder={(EXAMS.find((e) => e.id === f.exam) || {}).ph} /></label>
              <label>GPA (/4)<input type="number" step="0.1" value={f.gpa} onChange={set("gpa")} placeholder="e.g. 3.4" /></label>
              <label>Budget (USD/yr)<input type="number" value={f.budget} onChange={set("budget")} placeholder="e.g. 35000" /></label>
            </div>
            <div className="onb-nav">
              <button className="tool-btn ghost" onClick={() => setStep(1)}>← Back</button>
              <button className="tool-btn" onClick={build}>✨ Build my plan</button>
            </div>
          </div>
        )}

        {step === 3 && plan && (
          <>
            <div className="tool-card onb-result-head">
              <h3>🎯 Your personalised plan</h3>
              {plan.recommended
                ? <p>Best-fit destinations for your budget &amp; field: <strong>{plan.dests.join(", ")}</strong>. We've focused your plan on <strong>{plan.primary}</strong>.</p>
                : <p>Your plan for <strong>{plan.primary}</strong>, {f.field}, {f.intake} intake.</p>}
              <p className="tool-sub">{plan.buckets.Safe.length} Safe · {plan.buckets.Target.length} Target · {plan.buckets.Reach.length} Reach universities matched.</p>
            </div>

            <div className="peval-cols">
              {["Reach", "Target", "Safe"].map((b) => (
                <div className={"peval-col " + b.toLowerCase()} key={b}>
                  <h3>{b === "Reach" ? "🌟 Reach" : b === "Target" ? "🎯 Target" : "✅ Safe"} <span>({plan.buckets[b].length})</span></h3>
                  {plan.buckets[b].slice(0, 4).map((c) => (
                    <a className="peval-uni" key={c.id} href={"/university/" + c.id + "/"}><strong>{c.name}</strong><span>{c.country} · QS #{c.rank} · {c.feeNote}</span></a>
                  ))}
                  {plan.buckets[b].length === 0 && <p className="tool-sub">None in this band.</p>}
                </div>
              ))}
            </div>

            {plan.sch.length > 0 && (
              <div className="tool-card"><h3>💸 Scholarships to target</h3>
                <ul className="peval-sch">{plan.sch.map((s, i) => <li key={i}><strong>{s.name}</strong> — {s.amount || s.benefit || "see details"} · {s.country}</li>)}</ul>
              </div>
            )}

            <div className="tool-card">
              <h3>📋 Documents you'll need</h3>
              <p className="onb-docs">Statement of Purpose (SOP) · 2–3 Letters of Recommendation · Academic transcripts · Resume/CV · Test scorecard · Passport · Proof of funds{/USA/.test(plan.primary) ? " · I-20 after admission" : ""}{/UK/.test(plan.primary) ? " · CAS after admission" : ""}{/Canada/.test(plan.primary) ? " · GIC + PAL" : ""}.</p>
              <div className="onb-doc-btns">
                <button className="tool-btn" onClick={() => onOpenTab && onOpenTab("sop")}>✍️ Build SOP / LOR / Resume</button>
              </div>
            </div>

            <div className="tool-card">
              <h3>🗓️ Your application timeline</h3>
              <ol className="onb-timeline">{TIMELINE.map((t, i) => <li key={i}><span className="onb-tl-when">{t[0]}</span><span>{t[1]}</span></li>)}</ol>
            </div>

            <div className="tool-card onb-next">
              <h3>✅ Start now</h3>
              <div className="onb-next-btns">
                <button className="tool-btn" onClick={() => onOpenTab && onOpenTab("predictor")}>🏛️ Refine in College Predictor</button>
                <button className="tool-btn ghost" onClick={() => onOpenTab && onOpenTab("scholarships")}>💸 Scholarships</button>
                <button className="tool-btn ghost" onClick={() => onOpenTab && onOpenTab("apply")}>🎓 Apply now</button>
                <button className="tool-btn ghost" onClick={() => onOpenTab && onOpenTab("visa")}>🛂 Visa prep</button>
                <button className="tool-btn ghost" onClick={() => onNav && onNav("tools")}>📅 Study plan</button>
              </div>
              <button className="tool-btn ghost" style={{ marginTop: 12 }} onClick={() => { setPlan(null); setStep(1); }}>↻ Start over</button>
            </div>
          </>
        )}
      </div>
    );
  }

  window.LP_OnboardingPanel = OnboardingPanel;
})();
