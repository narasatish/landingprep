/* global React, window */
"use strict";

// LandingPrep — Profile Evaluation + Study-abroad Updates & FAQ panels for the
// Colleges page. Profile Evaluation turns one profile into a Safe/Target/Reach
// snapshot, matching scholarships and next steps. Updates shows the live change
// feed + a stage-by-stage study-abroad FAQ.
(function () {
  const { useState } = React;

  const EXAMS = [
    { id: "ielts", name: "IELTS", ph: "e.g. 6.5" },
    { id: "toefl", name: "TOEFL", ph: "e.g. 95" },
    { id: "pte", name: "PTE", ph: "e.g. 65" },
    { id: "duolingo", name: "Duolingo", ph: "e.g. 120" },
    { id: "gre", name: "GRE", ph: "e.g. 320" },
  ];

  // ── Profile Evaluation ─────────────────────────────────────────────────────
  function ProfileEvalPanel({ country, onNav, onOpenTab }) {
    const ALL = window.LP_COLLEGES || [];
    const SCH = window.LP_SCHOLARSHIPS || [];
    const [exam, setExam] = useState("ielts");
    const [score, setScore] = useState("");
    const [gpa, setGpa] = useState("");
    const [budget, setBudget] = useState("");
    const [field, setField] = useState("");
    const [res, setRes] = useState(null);
    const examKey = ["ielts", "toefl", "pte", "duolingo"].includes(exam) ? exam : null;

    const evaluate = () => {
      const sc = parseFloat(score) || 0;
      const g = parseFloat(gpa) || 0;
      const bud = parseFloat(budget) || 0;
      const pool = ALL
        .filter((c) => !country || country === "Any" || c.country === country)
        .filter((c) => !field.trim() || c.programs.join(" ").toLowerCase().includes(field.trim().toLowerCase()))
        .filter((c) => !bud || (c.tuitionUSD || 0) <= bud + 3000);
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
      const sch = SCH.filter((s) => !country || country === "Any" || s.country === country || /Multiple|Europe/i.test(s.country)).slice(0, 4);
      setRes({ buckets, sch, total: pool.length });
    };

    const cfg = EXAMS.find((e) => e.id === exam) || EXAMS[0];
    return (
      <div className="peval-panel">
        <div className="tool-card">
          <h2>🧭 Profile Evaluation{country && country !== "Any" ? " — " + country : ""}</h2>
          <p className="tool-sub">Enter your profile once and get an instant Safe / Target / Reach shortlist, matching scholarships and your next steps — free.</p>
          <div className="tool-row">
            <label>Test
              <select value={exam} onChange={(e) => setExam(e.target.value)}>{EXAMS.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
            </label>
            <label>Your score<input type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder={cfg.ph} /></label>
            <label>GPA (/4)<input type="number" step="0.1" value={gpa} onChange={(e) => setGpa(e.target.value)} placeholder="e.g. 3.4" /></label>
            <label>Max tuition (USD/yr)<input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="optional" /></label>
            <label>Field / program<input type="text" value={field} onChange={(e) => setField(e.target.value)} placeholder="e.g. data science" /></label>
          </div>
          <button className="tool-btn" onClick={evaluate}>🔮 Evaluate my profile</button>
        </div>

        {res && (
          <>
            <div className="tool-card peval-summary">
              <p><strong>{res.total}</strong> universities match your filters{country && country !== "Any" ? " in " + country : ""}: <strong className="peval-safe">{res.buckets.Safe.length} Safe</strong>, <strong className="peval-target">{res.buckets.Target.length} Target</strong>, <strong className="peval-reach">{res.buckets.Reach.length} Reach</strong>.</p>
              <p className="tool-sub">{res.buckets.Safe.length === 0 ? "Consider raising your test score or widening your budget/country to unlock safer options." : "A healthy list mixes a few Reach schools with solid Target and Safe options — apply across all three."}</p>
            </div>
            <div className="peval-cols">
              {["Reach", "Target", "Safe"].map((b) => (
                <div className={"peval-col " + b.toLowerCase()} key={b}>
                  <h3>{b === "Reach" ? "🌟 Reach" : b === "Target" ? "🎯 Target" : "✅ Safe"} <span>({res.buckets[b].length})</span></h3>
                  {res.buckets[b].slice(0, 5).map((c) => (
                    <a className="peval-uni" key={c.id} href={"/university/" + c.id + "/"}>
                      <strong>{c.name}</strong>
                      <span>QS #{c.rank} · {c.acceptance}% accept · {c.feeNote}</span>
                    </a>
                  ))}
                  {res.buckets[b].length === 0 && <p className="tool-sub">None in this band.</p>}
                </div>
              ))}
            </div>
            {res.sch.length > 0 && (
              <div className="tool-card">
                <h3>💸 Scholarships you may qualify for</h3>
                <ul className="peval-sch">{res.sch.map((s, i) => <li key={i}><strong>{s.name}</strong> — {s.amount || s.benefit || "see details"} · {s.country}</li>)}</ul>
              </div>
            )}
            <div className="tool-card peval-next">
              <h3>✅ Your next steps</h3>
              <div className="peval-next-btns">
                <button className="tool-btn" onClick={() => onOpenTab && onOpenTab("predictor")}>🏛️ Open full College Predictor</button>
                <button className="tool-btn ghost" onClick={() => onOpenTab && onOpenTab("scholarships")}>💸 Browse scholarships</button>
                <button className="tool-btn ghost" onClick={() => onOpenTab && onOpenTab("sop")}>📝 Build your SOP</button>
                <button className="tool-btn ghost" onClick={() => onOpenTab && onOpenTab("counsellor")}>💬 Ask the AI counsellor</button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
  window.LP_ProfileEvalPanel = ProfileEvalPanel;

  // ── Updates feed + stage-by-stage study-abroad FAQ ─────────────────────────
  const FAQ_STAGES = [
    { stage: "🌍 Why study abroad", qa: [
      ["Is studying abroad worth it financially?", "It can be, if you choose by ROI: compare total cost (tuition + living − scholarships) against expected post-study salary and work-visa length. Countries with 2–3 year post-study work rights (UK, Canada, Australia, Ireland) and lower or no tuition (Germany) often pay back fastest. Use our Profile Evaluation and loan EMI tools to model it."],
      ["Which country is best for international students?", "There's no single best — it depends on your budget, field and PR goals. The USA leads on research and salaries, Canada and Australia on clear PR pathways, the UK on a fast 1-year master's, and Germany on near-free tuition. Open the Country Guide tab to compare visa-success rates, costs and immigration routes."],
    ]},
    { stage: "🎯 Find course & university", qa: [
      ["How do I shortlist universities?", "Build a balanced list of Safe, Target and Reach schools using your test score, GPA and budget — our Profile Evaluation and College Predictor do this automatically across 99 universities, with fees, requirements and acceptance rates."],
      ["Should I pick the university or the course first?", "Pick the course first. A program that matches your goals — with the right specialisations, faculty and capstone — matters more than rank alone. Use the Course Finder to search a program across universities."],
    ]},
    { stage: "📝 Test prep", qa: [
      ["Which English test should I take?", "Check what your target universities and visa accept. IELTS and TOEFL are the most widely accepted; PTE and Duolingo are faster and often cheaper; CELPIP is for Canada. Our exam hubs show the pattern, fees and score requirements for all seven exams."],
      ["What score do I need?", "Most universities ask IELTS 6.5–7.0 (TOEFL 90–100) for master's; top programs want more. Use the free Score Predictor to convert your score and see what you qualify for."],
    ]},
    { stage: "🎓 Application", qa: [
      ["What documents do I need to apply?", "Typically transcripts, a Statement of Purpose, 2–3 letters of recommendation, your test scores, a CV/resume, and proof of funds. The Country Guide lists each country's exact checklist and deadlines."],
      ["How important is the SOP?", "Very — it's often the deciding factor between similar applicants. Use our SOP Builder for a structured draft and the SOP Checker for an AI review, and study the full-length sample SOPs."],
    ]},
    { stage: "💰 Funding", qa: [
      ["How can I fund my studies?", "Combine scholarships, education loans and part-time work. Our country-based Scholarship Finder lists fully-funded and merit awards, and the Loan Compare tab shows 10 lenders with rates, limits and EMI."],
      ["Can I get a scholarship with an average profile?", "Yes — many scholarships reward need, leadership, or specific fields rather than only top grades. Apply early and to several; check the Scholarships tab filtered by your country."],
    ]},
    { stage: "🛂 Visa", qa: [
      ["What is the student-visa success rate?", "It varies by country and profile — see each destination's visa-success rate in the Country Guide. Strong funds proof, a genuine study plan and consistent documents are the biggest factors."],
      ["When should I apply for my visa?", "As soon as you receive your offer and confirm funds — visa processing can take weeks to months. Apply early, especially for Fall intake."],
    ]},
    { stage: "✈️ Travel & stay", qa: [
      ["How much does living abroad cost?", "Living costs run roughly $10,000–20,000/yr depending on the city — the Country Guide shows averages and top student cities. Budget for rent, food, transport, insurance and one-off setup costs."],
      ["Can I work while studying?", "Most student visas allow part-time work (often ~20 hours/week in term time). Check the exact limit in each destination's visa-types section."],
    ]},
    { stage: "🎓 Post degree", qa: [
      ["Can I stay and work after graduating?", "Most top destinations offer post-study work: USA OPT (12–36 months), UK Graduate Route (2 years), Canada PGWP (up to 3), Australia 485 (2–4). The Immigration roadmap in each Country Guide shows the path from study to work to PR."],
      ["How do I get PR after studying?", "Generally: graduate → post-study work → skilled/sponsored job → permanent residence. Canada and Australia have the clearest points-based routes; see the step-by-step student→PR roadmap per country."],
    ]},
  ];

  function UpdatesPanel({ onOpenTab }) {
    const [open, setOpen] = useState({});
    return (
      <div className="updates-panel">
        <div className="tool-card">
          <h2>❓ Study-abroad FAQ — every stage of your journey</h2>
          <p className="tool-sub">From "why study abroad" to life after your degree — the questions students actually ask. (Latest exam/visa/immigration changes are on the <a href="#/blog" style={{ color: "var(--accent)", fontWeight: 600 }}>Blog</a>.)</p>
          {FAQ_STAGES.map((grp) => (
            <div className="faq-stage" key={grp.stage}>
              <h3 className="faq-stage-title">{grp.stage}</h3>
              {grp.qa.map(([q, a], i) => {
                const key = grp.stage + i;
                return (
                  <div className={"faq-acc" + (open[key] ? " open" : "")} key={key}>
                    <button className="faq-acc-q" onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}>
                      <span>{q}</span><span className="faq-acc-ic">{open[key] ? "−" : "+"}</span>
                    </button>
                    {open[key] && <div className="faq-acc-a">{a}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
  window.LP_UpdatesPanel = UpdatesPanel;
  window.LP_STUDY_FAQ = FAQ_STAGES;
})();
