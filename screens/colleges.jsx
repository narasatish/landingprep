/* global React, window */
"use strict";

// LandingPrep — dedicated Colleges / Study-Abroad page. Country-FIRST: a
// destination selector at the top scopes the predictor, country guide,
// rankings and scholarships to one country (loan stays global).
(function () {
  const { useState, useEffect } = React;

  const COUNTRIES = [
    ["USA", "🇺🇸"], ["UK", "🇬🇧"], ["Canada", "🇨🇦"], ["Australia", "🇦🇺"], ["Germany", "🇩🇪"],
    ["Ireland", "🇮🇪"], ["New Zealand", "🇳🇿"], ["Singapore", "🇸🇬"], ["Netherlands", "🇳🇱"],
  ];
  // Consolidated tabs (merged duplicates: Profile Eval → Build My Plan/Find
  // Colleges; Course Finder → Find Colleges; Compare → Top Universities;
  // Calculators → Loans & Costs). Combined tabs use an in-tab mode toggle.
  const TABS = [
    ["destinations", "🌍 Country Guide"],
    ["onboard", "🚀 Build My Plan"],
    ["predictor", "🏛️ Find Colleges"],
    ["rankings", "🏆 Universities"],
    ["scholarships", "💸 Scholarships"],
    ["apply", "🎓 Apply Now"],
    ["counsellor", "💬 AI Counsellor"],
    ["visa", "🛂 Visa Interview"],
    ["community", "🙋 Community Q&A"],
    ["leaderboard", "🏆 Leaderboard"],
    ["updates", "❓ Help & FAQ"],
    ["loan", "💰 Loans & Costs"],
    ["sop", "✍️ Documents"],
    ["apps", "📋 My Applications"],
  ];
  const TAB_LABEL = Object.fromEntries(TABS);
  // Group the tabs into clean categories so the page shows 2–4 tabs at a time.
  const GROUPS = [
    { id: "explore", label: "🌍 Explore", tabs: ["destinations", "rankings"] },
    { id: "plan", label: "🧭 Plan", tabs: ["onboard", "predictor"] },
    { id: "apply", label: "🎓 Apply", tabs: ["apply", "scholarships", "sop", "apps"] },
    { id: "guidance", label: "💬 Guidance", tabs: ["counsellor", "visa", "loan"] },
    { id: "community", label: "🌐 Community", tabs: ["community", "leaderboard", "updates"] },
  ];
  // Tabs that are scoped to the selected country.
  const COUNTRY_TABS = ["destinations", "onboard", "predictor", "rankings", "scholarships", "apply", "counsellor", "visa"];
  const modeToggle = (cur, set, opts) => (
    <div className="tab-modes">
      {opts.map(([id, label]) => <button key={id} className={"tab-mode" + (cur === id ? " active" : "")} onClick={() => set(id)}>{label}</button>)}
    </div>
  );

  const loadingCard = (msg) => <div className="tool-card"><p className="tool-sub">{msg}</p></div>;

  function Colleges({ onNav, initialTab, initialCountry }) {
    const valid = TABS.map((t) => t[0]);
    const validCountry = COUNTRIES.some(([c]) => c === initialCountry);
    const [tab, setTab] = useState(valid.includes(initialTab) ? initialTab : "destinations");
    const [country, setCountry] = useState(validCountry ? initialCountry : "USA");
    const [findMode, setFindMode] = useState("predict"); // predict | program
    const [uniMode, setUniMode] = useState("rankings");   // rankings | compare
    const [, setLazyTick] = useState(0); // re-render when an on-demand panel bundle finishes loading
    useEffect(() => {
      // Lazy-load panel bundles kept off the initial app load (currently the SOP tool, ~47 KB).
      if (tab === "sop" && window.LP_loadScript && !window.LP_SOPPanel) {
        window.LP_loadScript("screens/sop-tool.js").then(() => setLazyTick((t) => t + 1)).catch(() => {});
      }
    }, [tab]);
    useEffect(() => {
      if (!window.LP_SEO) return;
      const n = (window.LP_COLLEGES || []).length || 99;
      window.LP_SEO.set({
        title: "Study Abroad by Country — Predictor, Compare, Scholarships, Visa & SOP | LandingPrep",
        description: `Choose your destination and explore ${n} top universities by country (USA, UK, Canada, Australia, Germany & more): fees, IELTS/GRE requirements, admission process, scholarships, visa-success rates and immigration. Free profile evaluation, college predictor, university & country comparison, scholarship finder, SOP builder and live exam/visa updates.`,
        keywords: "study abroad by country, college predictor usa, profile evaluation, compare universities, compare study abroad countries, study in uk, study in canada, study in australia, study in germany, top universities by country, scholarships by country, university admission process, student visa, sop builder, study abroad updates"
      });
    }, []);

    const scoped = COUNTRY_TABS.includes(tab);

    return (
      <>
        <window.LP_TopBar current="colleges" onNav={onNav} />
        <main className="tools-shell">
          <header className="tools-hero">
            <h1>Study Abroad — by Country</h1>
            <p>Pick your destination, then explore its top universities, admission, scholarships, costs, visa &amp; immigration — all free.</p>
          </header>

          {scoped && (
            <div className="country-select">
              <div className="country-select-label">🌍 Choose your destination</div>
              <div className="country-select-grid">
                {COUNTRIES.map(([c, f]) => (
                  <button key={c} className={"country-pick" + (country === c ? " active" : "")} onClick={() => setCountry(c)}>
                    <span className="country-pick-flag">{f}</span><span>{c}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="tools-groups">
            {GROUPS.map((g) => (
              <button key={g.id} className={"tools-group" + (g.tabs.includes(tab) ? " active" : "")} onClick={() => { if (!g.tabs.includes(tab)) setTab(g.tabs[0]); }}>{g.label}</button>
            ))}
          </div>
          <div className="tools-tabs">
            {(GROUPS.find((g) => g.tabs.includes(tab)) || GROUPS[0]).tabs.map((id) => (
              <button key={id} className={"tools-tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{TAB_LABEL[id]}</button>
            ))}
          </div>

          {tab === "destinations" && (window.LP_DestinationsPanel ? <window.LP_DestinationsPanel onNav={onNav} country={country} setCountry={setCountry} onFindColleges={() => setTab("predictor")} /> : loadingCard("Country guide is loading…"))}
          {tab === "onboard" && (window.LP_OnboardingPanel ? <window.LP_OnboardingPanel onNav={onNav} country={country} onOpenTab={setTab} /> : loadingCard("Plan builder is loading…"))}

          {/* Find Colleges = Predict chances + Search by program */}
          {tab === "predictor" && (<>
            {modeToggle(findMode, setFindMode, [["predict", "🔮 Predict my chances"], ["program", "🎯 Search by program"]])}
            {findMode === "predict"
              ? (window.LP_CollegePredictorPanel ? <window.LP_CollegePredictorPanel onNav={onNav} country={country} /> : loadingCard("College predictor is loading…"))
              : (window.LP_ProgramFinderPanel ? <window.LP_ProgramFinderPanel onNav={onNav} country={country} /> : loadingCard("Course finder is loading…"))}
          </>)}

          {/* Universities = Rankings + Compare */}
          {tab === "rankings" && (<>
            {modeToggle(uniMode, setUniMode, [["rankings", "🏆 Top rankings"], ["compare", "⚖️ Compare"]])}
            {uniMode === "rankings"
              ? (window.LP_RankingsPanel ? <window.LP_RankingsPanel country={country} /> : loadingCard("Rankings are loading…"))
              : (window.LP_ComparePanel ? <window.LP_ComparePanel country={country} /> : loadingCard("Compare is loading…"))}
          </>)}

          {tab === "scholarships" && (window.LP_ScholarshipPanel ? <window.LP_ScholarshipPanel onNav={onNav} country={country} /> : loadingCard("Scholarship finder is loading…"))}
          {tab === "apply" && (window.LP_ApplyPanel ? <window.LP_ApplyPanel country={country} onOpenTab={setTab} /> : loadingCard("Apply panel is loading…"))}
          {tab === "counsellor" && (window.LP_CounsellorPanel ? <window.LP_CounsellorPanel country={country} /> : loadingCard("AI counsellor is loading…"))}
          {tab === "visa" && (window.LP_VisaInterviewPanel ? <window.LP_VisaInterviewPanel country={country} /> : loadingCard("Visa interview is loading…"))}
          {tab === "community" && (window.LP_CommunityPanel ? <window.LP_CommunityPanel country={country} /> : loadingCard("Community is loading…"))}
          {tab === "leaderboard" && (window.LP_LeaderboardPanel ? <window.LP_LeaderboardPanel /> : loadingCard("Leaderboard is loading…"))}
          {tab === "updates" && (window.LP_UpdatesPanel ? <window.LP_UpdatesPanel onOpenTab={setTab} /> : loadingCard("Help is loading…"))}

          {/* Loans & Costs = lender comparison + GPA/EMI/ROI calculators */}
          {tab === "loan" && (<>
            {window.LP_LoanPanel ? <window.LP_LoanPanel onNav={onNav} /> : loadingCard("Loan comparison is loading…")}
            {window.LP_CalculatorsPanel ? <window.LP_CalculatorsPanel /> : null}
          </>)}

          {tab === "sop" && (window.LP_SOPPanel ? <window.LP_SOPPanel /> : loadingCard("SOP tool is loading…"))}
          {tab === "apps" && (window.LP_ApplicationsPanel ? <window.LP_ApplicationsPanel onNav={onNav} onOpenTab={setTab} /> : loadingCard("Applications tracker is loading…"))}

          <div className="tools-foot">
            <a className="tool-btn ghost" onClick={() => onNav && onNav("tools")}>🧰 English-test tools &amp; study planner →</a>
          </div>
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_Colleges = Colleges;
})();
