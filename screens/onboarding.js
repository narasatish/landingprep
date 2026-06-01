"use strict";
(function() {
  const { useState } = React;
  const EXAMS = [
    { id: "ielts", name: "IELTS", ph: "e.g. 6.5" },
    { id: "toefl", name: "TOEFL", ph: "e.g. 95" },
    { id: "pte", name: "PTE", ph: "e.g. 65" },
    { id: "duolingo", name: "Duolingo", ph: "e.g. 120" },
    { id: "gre", name: "GRE", ph: "e.g. 320" }
  ];
  const FIELDS = ["Computer Science / IT", "Data Science / AI", "Engineering", "Business / MBA", "Finance", "Health / Bio", "Other"];
  const num = (s) => {
    const m = String(s || "").match(/[\d,]+/);
    return m ? parseInt(m[0].replace(/,/g, ""), 10) : 0;
  };
  function recommendCountries(budget, field) {
    const data = window.LP_COUNTRY_DATA || [];
    const scored = data.map((c) => {
      const tuition = num(c.avgTuition) || 3e4;
      const afford = budget ? Math.max(0, 1 - Math.max(0, tuition - budget) / 4e4) : 1 - Math.min(tuition, 5e4) / 5e4;
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
    ["12\u201310 months before", "Shortlist universities (Profile Evaluation + Predictor), set your target test score and start prep."],
    ["10\u20138 months", "Take your English/GRE test. Draft your SOP, request LORs and build your CV."],
    ["8\u20136 months", "Finalise documents, apply to Safe/Target/Reach universities, and apply for scholarships."],
    ["6\u20133 months", "Accept your best offer, arrange finances/loan and proof of funds, then apply for your visa."],
    ["3\u20130 months", "Prepare your visa interview, book travel & accommodation, and plan your arrival."]
  ];
  function OnboardingPanel({ country, onNav, onOpenTab }) {
    const ALL = window.LP_COLLEGES || [];
    const SCH = window.LP_SCHOLARSHIPS || [];
    const [step, setStep] = useState(1);
    const [f, setF] = useState({ dest: country && country !== "Any" ? country : "Not sure", field: "Computer Science / IT", intake: "Fall (Aug\u2013Sep)", exam: "ielts", score: "", gpa: "", budget: "" });
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    const [plan, setPlan] = useState(null);
    const build = () => {
      const sc = parseFloat(f.score) || 0, g = parseFloat(f.gpa) || 0, bud = parseFloat(f.budget) || 0;
      const examKey = ["ielts", "toefl", "pte", "duolingo"].includes(f.exam) ? f.exam : null;
      let dests = f.dest === "Not sure" ? recommendCountries(bud, f.field).map((c) => c.name) : [f.dest];
      const primary = dests[0];
      const fieldKw = (f.field || "").split(/[\/ ]/)[0].toLowerCase();
      let pool = ALL.filter((c) => dests.includes(c.country)).filter((c) => !bud || (c.tuitionUSD || 0) <= bud + 4e3);
      const fielded = pool.filter((c) => c.programs.join(" ").toLowerCase().includes(fieldKw));
      const usePool = fielded.length >= 6 ? fielded : pool;
      const buckets = classify(usePool, examKey, sc, g);
      const sch = SCH.filter((s) => dests.some((d) => s.country === d) || /Multiple|Europe/i.test(s.country)).slice(0, 4);
      setPlan({ dests, primary, buckets, sch, recommended: f.dest === "Not sure" });
      setStep(3);
    };
    const Dots = () => /* @__PURE__ */ React.createElement("div", { className: "onb-dots" }, [1, 2, 3].map((n) => /* @__PURE__ */ React.createElement("span", { key: n, className: "onb-dot" + (step >= n ? " on" : "") }, n)));
    return /* @__PURE__ */ React.createElement("div", { className: "onb-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card onb-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F680} Build my study-abroad plan"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Answer a few questions and get a personalised plan \u2014 recommended country, your Safe/Target/Reach universities, scholarships, documents and a timeline. Free, no signup."), /* @__PURE__ */ React.createElement(Dots, null)), step === 1 && /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "Step 1 \xB7 Your goal"), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Destination", /* @__PURE__ */ React.createElement("select", { value: f.dest, onChange: set("dest") }, /* @__PURE__ */ React.createElement("option", null, "Not sure"), (window.LP_COUNTRY_DATA || []).map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.name }, c.flag, " ", c.name)))), /* @__PURE__ */ React.createElement("label", null, "Field / program", /* @__PURE__ */ React.createElement("select", { value: f.field, onChange: set("field") }, FIELDS.map((x) => /* @__PURE__ */ React.createElement("option", { key: x }, x)))), /* @__PURE__ */ React.createElement("label", null, "Target intake", /* @__PURE__ */ React.createElement("select", { value: f.intake, onChange: set("intake") }, /* @__PURE__ */ React.createElement("option", null, "Fall (Aug\u2013Sep)"), /* @__PURE__ */ React.createElement("option", null, "Spring (Jan)"), /* @__PURE__ */ React.createElement("option", null, "Summer (May)")))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, `Pick "Not sure" and we'll recommend the best-fit countries for your budget and field.`), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: () => setStep(2) }, "Next \u2192")), step === 2 && /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "Step 2 \xB7 Your profile"), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Test", /* @__PURE__ */ React.createElement("select", { value: f.exam, onChange: set("exam") }, EXAMS.map((e) => /* @__PURE__ */ React.createElement("option", { key: e.id, value: e.id }, e.name)))), /* @__PURE__ */ React.createElement("label", null, "Score (or target)", /* @__PURE__ */ React.createElement("input", { type: "number", value: f.score, onChange: set("score"), placeholder: (EXAMS.find((e) => e.id === f.exam) || {}).ph })), /* @__PURE__ */ React.createElement("label", null, "GPA (/4)", /* @__PURE__ */ React.createElement("input", { type: "number", step: "0.1", value: f.gpa, onChange: set("gpa"), placeholder: "e.g. 3.4" })), /* @__PURE__ */ React.createElement("label", null, "Budget (USD/yr)", /* @__PURE__ */ React.createElement("input", { type: "number", value: f.budget, onChange: set("budget"), placeholder: "e.g. 35000" }))), /* @__PURE__ */ React.createElement("div", { className: "onb-nav" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => setStep(1) }, "\u2190 Back"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: build }, "\u2728 Build my plan"))), step === 3 && plan && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "tool-card onb-result-head" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F3AF} Your personalised plan"), plan.recommended ? /* @__PURE__ */ React.createElement("p", null, "Best-fit destinations for your budget & field: ", /* @__PURE__ */ React.createElement("strong", null, plan.dests.join(", ")), ". We've focused your plan on ", /* @__PURE__ */ React.createElement("strong", null, plan.primary), ".") : /* @__PURE__ */ React.createElement("p", null, "Your plan for ", /* @__PURE__ */ React.createElement("strong", null, plan.primary), ", ", f.field, ", ", f.intake, " intake."), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, plan.buckets.Safe.length, " Safe \xB7 ", plan.buckets.Target.length, " Target \xB7 ", plan.buckets.Reach.length, " Reach universities matched.")), /* @__PURE__ */ React.createElement("div", { className: "peval-cols" }, ["Reach", "Target", "Safe"].map((b) => /* @__PURE__ */ React.createElement("div", { className: "peval-col " + b.toLowerCase(), key: b }, /* @__PURE__ */ React.createElement("h3", null, b === "Reach" ? "\u{1F31F} Reach" : b === "Target" ? "\u{1F3AF} Target" : "\u2705 Safe", " ", /* @__PURE__ */ React.createElement("span", null, "(", plan.buckets[b].length, ")")), plan.buckets[b].slice(0, 4).map((c) => /* @__PURE__ */ React.createElement("a", { className: "peval-uni", key: c.id, href: "/university/" + c.id + "/" }, /* @__PURE__ */ React.createElement("strong", null, c.name), /* @__PURE__ */ React.createElement("span", null, c.country, " \xB7 QS #", c.rank, " \xB7 ", c.feeNote))), plan.buckets[b].length === 0 && /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "None in this band.")))), plan.sch.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4B8} Scholarships to target"), /* @__PURE__ */ React.createElement("ul", { className: "peval-sch" }, plan.sch.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("strong", null, s.name), " \u2014 ", s.amount || s.benefit || "see details", " \xB7 ", s.country)))), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4CB} Documents you'll need"), /* @__PURE__ */ React.createElement("p", { className: "onb-docs" }, "Statement of Purpose (SOP) \xB7 2\u20133 Letters of Recommendation \xB7 Academic transcripts \xB7 Resume/CV \xB7 Test scorecard \xB7 Passport \xB7 Proof of funds", /USA/.test(plan.primary) ? " \xB7 I-20 after admission" : "", /UK/.test(plan.primary) ? " \xB7 CAS after admission" : "", /Canada/.test(plan.primary) ? " \xB7 GIC + PAL" : "", "."), /* @__PURE__ */ React.createElement("div", { className: "onb-doc-btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: () => onOpenTab && onOpenTab("sop") }, "\u270D\uFE0F Build SOP / LOR / Resume"))), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F5D3}\uFE0F Your application timeline"), /* @__PURE__ */ React.createElement("ol", { className: "onb-timeline" }, TIMELINE.map((t, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("span", { className: "onb-tl-when" }, t[0]), /* @__PURE__ */ React.createElement("span", null, t[1]))))), /* @__PURE__ */ React.createElement("div", { className: "tool-card onb-next" }, /* @__PURE__ */ React.createElement("h3", null, "\u2705 Start now"), /* @__PURE__ */ React.createElement("div", { className: "onb-next-btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: () => onOpenTab && onOpenTab("predictor") }, "\u{1F3DB}\uFE0F Refine in College Predictor"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onOpenTab && onOpenTab("scholarships") }, "\u{1F4B8} Scholarships"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onOpenTab && onOpenTab("apply") }, "\u{1F393} Apply now"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onOpenTab && onOpenTab("visa") }, "\u{1F6C2} Visa prep"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onNav && onNav("tools") }, "\u{1F4C5} Study plan")), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", style: { marginTop: 12 }, onClick: () => {
      setPlan(null);
      setStep(1);
    } }, "\u21BB Start over"))));
  }
  window.LP_OnboardingPanel = OnboardingPanel;
})();
