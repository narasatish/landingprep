"use strict";
(function() {
  const { useState, useEffect } = React;
  const COUNTRY_PRIORITY = ["USA", "UK", "Canada", "Australia", "Germany", "Ireland", "New Zealand", "Netherlands", "France", "Italy", "Spain", "Sweden", "Finland", "Denmark", "Poland", "Czech Republic", "United Arab Emirates", "Singapore"];
  const COUNTRY_FALLBACK = [
    ["USA", "\u{1F1FA}\u{1F1F8}"],
    ["UK", "\u{1F1EC}\u{1F1E7}"],
    ["Canada", "\u{1F1E8}\u{1F1E6}"],
    ["Australia", "\u{1F1E6}\u{1F1FA}"],
    ["Germany", "\u{1F1E9}\u{1F1EA}"],
    ["Ireland", "\u{1F1EE}\u{1F1EA}"],
    ["New Zealand", "\u{1F1F3}\u{1F1FF}"],
    ["Singapore", "\u{1F1F8}\u{1F1EC}"],
    ["Netherlands", "\u{1F1F3}\u{1F1F1}"]
  ];
  function getCountries() {
    const data = window.LP_COUNTRY_DATA || [];
    if (!data.length) return COUNTRY_FALLBACK;
    const byName = {};
    data.forEach((c) => {
      byName[c.name] = c;
    });
    const out = COUNTRY_PRIORITY.filter((n) => byName[n]).map((n) => [n, byName[n].flag]);
    data.forEach((c) => {
      if (!COUNTRY_PRIORITY.includes(c.name)) out.push([c.name, c.flag]);
    });
    return out;
  }
  const TABS = [
    ["destinations", "globe", "Country Guide"],
    ["onboard", "rocket", "Build My Plan"],
    ["predictor", "building", "Find Colleges"],
    ["rankings", "trophy", "Universities"],
    ["scholarships", "wallet", "Scholarships & Loans"],
    ["apply", "cap", "Apply Now"],
    ["counsellor", "chat", "AI Counsellor"],
    ["visa", "stamp", "Visa Interview"],
    ["community", "users", "Community"],
    ["updates", "help", "Help & FAQ"]
  ];
  const TAB_ALIAS = {
    loan: { tab: "scholarships", mode: "loan" },
    sop: { tab: "apply", mode: "sop" },
    apps: { tab: "apply", mode: "apps" },
    leaderboard: { tab: "community", mode: "leaderboard" }
  };
  const TAB_LABEL = Object.fromEntries(TABS.map((t) => [t[0], t[2]]));
  const TAB_ICON = Object.fromEntries(TABS.map((t) => [t[0], t[1]]));
  const ic = (name, size) => window.LP_Ic ? /* @__PURE__ */ React.createElement(window.LP_Ic, { name, size: size || 15, style: { verticalAlign: "-3px", marginRight: 6 } }) : null;
  const GROUPS = [
    { id: "explore", icon: "globe", label: "Explore", tabs: ["destinations", "rankings"] },
    { id: "plan", icon: "compass", label: "Plan", tabs: ["onboard", "predictor"] },
    { id: "apply", icon: "cap", label: "Apply", tabs: ["apply", "scholarships"] },
    { id: "guidance", icon: "chat", label: "Guidance", tabs: ["counsellor", "visa", "community", "updates"] }
  ];
  const COUNTRY_TABS = ["destinations", "onboard", "predictor", "rankings", "scholarships", "apply", "counsellor", "visa"];
  const modeToggle = (cur, set, opts) => /* @__PURE__ */ React.createElement("div", { className: "tab-modes" }, opts.map(([id, label]) => /* @__PURE__ */ React.createElement("button", { key: id, className: "tab-mode" + (cur === id ? " active" : ""), onClick: () => set(id) }, label)));
  const loadingCard = (msg) => /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, msg));
  function Colleges({ onNav, initialTab, initialCountry }) {
    const valid = TABS.map((t) => t[0]);
    const init = TAB_ALIAS[initialTab] || { tab: valid.includes(initialTab) ? initialTab : "destinations", mode: null };
    const validCountry = getCountries().some(([c]) => c === initialCountry);
    const [tab, setTab] = useState(init.tab);
    const [country, setCountry] = useState(validCountry ? initialCountry : "USA");
    const [findMode, setFindMode] = useState("predict");
    const [uniMode, setUniMode] = useState("rankings");
    const [fundMode, setFundMode] = useState(init.mode === "loan" ? "loan" : "scholarships");
    const [applyMode, setApplyMode] = useState(init.mode === "sop" || init.mode === "apps" ? init.mode : "apply");
    const [commMode, setCommMode] = useState(init.mode === "leaderboard" ? "leaderboard" : "qa");
    const [, setLazyTick] = useState(0);
    const openTab = (id) => {
      const a = TAB_ALIAS[id];
      if (a) {
        if (a.tab === "scholarships") setFundMode(a.mode);
        if (a.tab === "apply") setApplyMode(a.mode);
        if (a.tab === "community") setCommMode(a.mode);
        setTab(a.tab);
      } else if (valid.includes(id)) {
        setTab(id);
      }
    };
    useEffect(() => {
      if (tab === "apply" && applyMode === "sop" && window.LP_loadScript && !window.LP_SOPPanel) {
        window.LP_loadScript("screens/sop-tool.js").then(() => setLazyTick((t) => t + 1)).catch(() => {
        });
      }
    }, [tab, applyMode]);
    useEffect(() => {
      if (!window.LP_SEO) return;
      const n = (window.LP_COLLEGES || []).length || 99;
      window.LP_SEO.set({
        title: "Study Abroad by Country \u2014 Predictor, Compare, Scholarships, Visa & SOP | LandingPrep",
        description: `Choose your destination and explore ${n} top universities by country (USA, UK, Canada, Australia, Germany & more): fees, IELTS/GRE requirements, admission process, scholarships, visa-success rates and immigration. Free profile evaluation, college predictor, university & country comparison, scholarship finder, SOP builder and live exam/visa updates.`,
        keywords: "study abroad by country, college predictor usa, profile evaluation, compare universities, compare study abroad countries, study in uk, study in canada, study in australia, study in germany, top universities by country, scholarships by country, university admission process, student visa, sop builder, study abroad updates"
      });
    }, []);
    const scoped = COUNTRY_TABS.includes(tab);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "colleges", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell tools-shell-wide" }, /* @__PURE__ */ React.createElement("header", { className: "tools-hero" }, /* @__PURE__ */ React.createElement("h1", null, "Study Abroad \u2014 by Country"), /* @__PURE__ */ React.createElement("p", null, "Pick your destination, then explore its top universities, admission, scholarships, costs, visa & immigration \u2014 all free.")), scoped && /* @__PURE__ */ React.createElement("div", { className: "country-select" }, /* @__PURE__ */ React.createElement("div", { className: "country-select-label" }, "\u{1F30D} Choose your destination"), /* @__PURE__ */ React.createElement("div", { className: "country-select-grid" }, getCountries().map(([c, f]) => /* @__PURE__ */ React.createElement("button", { key: c, className: "country-pick" + (country === c ? " active" : ""), onClick: () => setCountry(c) }, /* @__PURE__ */ React.createElement("span", { className: "country-pick-flag" }, f), /* @__PURE__ */ React.createElement("span", null, c))))), /* @__PURE__ */ React.createElement("div", { className: "tools-groups" }, GROUPS.map((g) => /* @__PURE__ */ React.createElement("button", { key: g.id, className: "tools-group" + (g.tabs.includes(tab) ? " active" : ""), onClick: () => {
      if (!g.tabs.includes(tab)) setTab(g.tabs[0]);
    } }, ic(g.icon, 16), g.label))), /* @__PURE__ */ React.createElement("div", { className: "tools-tabs" }, (GROUPS.find((g) => g.tabs.includes(tab)) || GROUPS[0]).tabs.map((id) => /* @__PURE__ */ React.createElement("button", { key: id, className: "tools-tab" + (tab === id ? " active" : ""), onClick: () => setTab(id) }, ic(TAB_ICON[id]), TAB_LABEL[id]))), tab === "destinations" && (window.LP_DestinationsPanel ? /* @__PURE__ */ React.createElement(window.LP_DestinationsPanel, { onNav, country, setCountry, onFindColleges: () => setTab("predictor") }) : loadingCard("Country guide is loading\u2026")), tab === "onboard" && (window.LP_OnboardingPanel ? /* @__PURE__ */ React.createElement(window.LP_OnboardingPanel, { onNav, country, onOpenTab: openTab }) : loadingCard("Plan builder is loading\u2026")), tab === "predictor" && /* @__PURE__ */ React.createElement(React.Fragment, null, modeToggle(findMode, setFindMode, [["predict", "\u{1F52E} Predict my chances"], ["program", "\u{1F3AF} Search by program"]]), findMode === "predict" ? window.LP_CollegePredictorPanel ? /* @__PURE__ */ React.createElement(window.LP_CollegePredictorPanel, { onNav, country }) : loadingCard("College predictor is loading\u2026") : window.LP_ProgramFinderPanel ? /* @__PURE__ */ React.createElement(window.LP_ProgramFinderPanel, { onNav, country }) : loadingCard("Course finder is loading\u2026")), tab === "rankings" && /* @__PURE__ */ React.createElement(React.Fragment, null, modeToggle(uniMode, setUniMode, [["rankings", "\u{1F3C6} Top rankings"], ["compare", "\u2696\uFE0F Compare"]]), uniMode === "rankings" ? window.LP_RankingsPanel ? /* @__PURE__ */ React.createElement(window.LP_RankingsPanel, { country }) : loadingCard("Rankings are loading\u2026") : window.LP_ComparePanel ? /* @__PURE__ */ React.createElement(window.LP_ComparePanel, { country }) : loadingCard("Compare is loading\u2026")), tab === "scholarships" && /* @__PURE__ */ React.createElement(React.Fragment, null, modeToggle(fundMode, setFundMode, [["scholarships", "\u{1F4B8} Scholarships"], ["loan", "\u{1F3E6} Loans & Costs"]]), fundMode === "scholarships" ? window.LP_ScholarshipPanel ? /* @__PURE__ */ React.createElement(window.LP_ScholarshipPanel, { onNav, country }) : loadingCard("Scholarship finder is loading\u2026") : /* @__PURE__ */ React.createElement(React.Fragment, null, window.LP_LoanPanel ? /* @__PURE__ */ React.createElement(window.LP_LoanPanel, { onNav }) : loadingCard("Loan comparison is loading\u2026"), window.LP_CalculatorsPanel ? /* @__PURE__ */ React.createElement(window.LP_CalculatorsPanel, null) : null)), tab === "apply" && /* @__PURE__ */ React.createElement(React.Fragment, null, modeToggle(applyMode, setApplyMode, [["apply", "\u{1F393} Apply now"], ["sop", "\u{1F4DD} Documents"], ["apps", "\u{1F4CB} My Applications"]]), applyMode === "apply" && (window.LP_ApplyPanel ? /* @__PURE__ */ React.createElement(window.LP_ApplyPanel, { country, onOpenTab: openTab }) : loadingCard("Apply panel is loading\u2026")), applyMode === "sop" && (window.LP_SOPPanel ? /* @__PURE__ */ React.createElement(window.LP_SOPPanel, null) : loadingCard("SOP tool is loading\u2026")), applyMode === "apps" && (window.LP_ApplicationsPanel ? /* @__PURE__ */ React.createElement(window.LP_ApplicationsPanel, { onNav, onOpenTab: openTab }) : loadingCard("Applications tracker is loading\u2026"))), tab === "counsellor" && (window.LP_CounsellorPanel ? /* @__PURE__ */ React.createElement(window.LP_CounsellorPanel, { country }) : loadingCard("AI counsellor is loading\u2026")), tab === "visa" && (window.LP_VisaInterviewPanel ? /* @__PURE__ */ React.createElement(window.LP_VisaInterviewPanel, { country }) : loadingCard("Visa interview is loading\u2026")), tab === "community" && /* @__PURE__ */ React.createElement(React.Fragment, null, modeToggle(commMode, setCommMode, [["qa", "\u{1F4AC} Q&A"], ["leaderboard", "\u{1F3C6} Leaderboard"]]), commMode === "qa" ? window.LP_CommunityPanel ? /* @__PURE__ */ React.createElement(window.LP_CommunityPanel, { country }) : loadingCard("Community is loading\u2026") : window.LP_LeaderboardPanel ? /* @__PURE__ */ React.createElement(window.LP_LeaderboardPanel, null) : loadingCard("Leaderboard is loading\u2026")), tab === "updates" && (window.LP_UpdatesPanel ? /* @__PURE__ */ React.createElement(window.LP_UpdatesPanel, { onOpenTab: openTab }) : loadingCard("Help is loading\u2026")), /* @__PURE__ */ React.createElement("div", { className: "tools-foot" }, /* @__PURE__ */ React.createElement("a", { className: "tool-btn ghost", onClick: () => onNav && onNav("tools") }, "\u{1F9F0} English-test tools & study planner \u2192"))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_Colleges = Colleges;
})();
