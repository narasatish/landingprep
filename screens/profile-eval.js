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
      const pool = ALL.filter((c) => !country || country === "Any" || c.country === country).filter((c) => !field.trim() || c.programs.join(" ").toLowerCase().includes(field.trim().toLowerCase())).filter((c) => !bud || (c.tuitionUSD || 0) <= bud + 3e3);
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
    return /* @__PURE__ */ React.createElement("div", { className: "peval-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F9ED} Profile Evaluation", country && country !== "Any" ? " \u2014 " + country : ""), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Enter your profile once and get an instant Safe / Target / Reach shortlist, matching scholarships and your next steps \u2014 free."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Test", /* @__PURE__ */ React.createElement("select", { value: exam, onChange: (e) => setExam(e.target.value) }, EXAMS.map((e) => /* @__PURE__ */ React.createElement("option", { key: e.id, value: e.id }, e.name)))), /* @__PURE__ */ React.createElement("label", null, "Your score", /* @__PURE__ */ React.createElement("input", { type: "number", value: score, onChange: (e) => setScore(e.target.value), placeholder: cfg.ph })), /* @__PURE__ */ React.createElement("label", null, "GPA (/4)", /* @__PURE__ */ React.createElement("input", { type: "number", step: "0.1", value: gpa, onChange: (e) => setGpa(e.target.value), placeholder: "e.g. 3.4" })), /* @__PURE__ */ React.createElement("label", null, "Max tuition (USD/yr)", /* @__PURE__ */ React.createElement("input", { type: "number", value: budget, onChange: (e) => setBudget(e.target.value), placeholder: "optional" })), /* @__PURE__ */ React.createElement("label", null, "Field / program", /* @__PURE__ */ React.createElement("input", { type: "text", value: field, onChange: (e) => setField(e.target.value), placeholder: "e.g. data science" }))), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: evaluate }, "\u{1F52E} Evaluate my profile")), res && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "tool-card peval-summary" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, res.total), " universities match your filters", country && country !== "Any" ? " in " + country : "", ": ", /* @__PURE__ */ React.createElement("strong", { className: "peval-safe" }, res.buckets.Safe.length, " Safe"), ", ", /* @__PURE__ */ React.createElement("strong", { className: "peval-target" }, res.buckets.Target.length, " Target"), ", ", /* @__PURE__ */ React.createElement("strong", { className: "peval-reach" }, res.buckets.Reach.length, " Reach"), "."), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, res.buckets.Safe.length === 0 ? "Consider raising your test score or widening your budget/country to unlock safer options." : "A healthy list mixes a few Reach schools with solid Target and Safe options \u2014 apply across all three.")), /* @__PURE__ */ React.createElement("div", { className: "peval-cols" }, ["Reach", "Target", "Safe"].map((b) => /* @__PURE__ */ React.createElement("div", { className: "peval-col " + b.toLowerCase(), key: b }, /* @__PURE__ */ React.createElement("h3", null, b === "Reach" ? "\u{1F31F} Reach" : b === "Target" ? "\u{1F3AF} Target" : "\u2705 Safe", " ", /* @__PURE__ */ React.createElement("span", null, "(", res.buckets[b].length, ")")), res.buckets[b].slice(0, 5).map((c) => /* @__PURE__ */ React.createElement("a", { className: "peval-uni", key: c.id, href: "/university/" + c.id + "/" }, /* @__PURE__ */ React.createElement("strong", null, c.name), /* @__PURE__ */ React.createElement("span", null, "QS #", c.rank, " \xB7 ", c.acceptance, "% accept \xB7 ", c.feeNote))), res.buckets[b].length === 0 && /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "None in this band.")))), res.sch.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4B8} Scholarships you may qualify for"), /* @__PURE__ */ React.createElement("ul", { className: "peval-sch" }, res.sch.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("strong", null, s.name), " \u2014 ", s.amount || s.benefit || "see details", " \xB7 ", s.country)))), /* @__PURE__ */ React.createElement("div", { className: "tool-card peval-next" }, /* @__PURE__ */ React.createElement("h3", null, "\u2705 Your next steps"), /* @__PURE__ */ React.createElement("div", { className: "peval-next-btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: () => onOpenTab && onOpenTab("predictor") }, "\u{1F3DB}\uFE0F Open full College Predictor"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onOpenTab && onOpenTab("scholarships") }, "\u{1F4B8} Browse scholarships"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onOpenTab && onOpenTab("sop") }, "\u{1F4DD} Build your SOP"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onOpenTab && onOpenTab("counsellor") }, "\u{1F4AC} Ask the AI counsellor")))));
  }
  window.LP_ProfileEvalPanel = ProfileEvalPanel;
  const FAQ_STAGES = [
    { stage: "\u{1F30D} Why study abroad", qa: [
      ["Is studying abroad worth it financially?", "It can be, if you choose by ROI: compare total cost (tuition + living \u2212 scholarships) against expected post-study salary and work-visa length. Countries with 2\u20133 year post-study work rights (UK, Canada, Australia, Ireland) and lower or no tuition (Germany) often pay back fastest. Use our Profile Evaluation and loan EMI tools to model it."],
      ["Which country is best for international students?", "There's no single best \u2014 it depends on your budget, field and PR goals. The USA leads on research and salaries, Canada and Australia on clear PR pathways, the UK on a fast 1-year master's, and Germany on near-free tuition. Open the Country Guide tab to compare visa-success rates, costs and immigration routes."]
    ] },
    { stage: "\u{1F3AF} Find course & university", qa: [
      ["How do I shortlist universities?", "Build a balanced list of Safe, Target and Reach schools using your test score, GPA and budget \u2014 our Profile Evaluation and College Predictor do this automatically across 99 universities, with fees, requirements and acceptance rates."],
      ["Should I pick the university or the course first?", "Pick the course first. A program that matches your goals \u2014 with the right specialisations, faculty and capstone \u2014 matters more than rank alone. Use the Course Finder to search a program across universities."]
    ] },
    { stage: "\u{1F4DD} Test prep", qa: [
      ["Which English test should I take?", "Check what your target universities and visa accept. IELTS and TOEFL are the most widely accepted; PTE and Duolingo are faster and often cheaper; CELPIP is for Canada. Our exam hubs show the pattern, fees and score requirements for all seven exams."],
      ["What score do I need?", "Most universities ask IELTS 6.5\u20137.0 (TOEFL 90\u2013100) for master's; top programs want more. Use the free Score Predictor to convert your score and see what you qualify for."]
    ] },
    { stage: "\u{1F393} Application", qa: [
      ["What documents do I need to apply?", "Typically transcripts, a Statement of Purpose, 2\u20133 letters of recommendation, your test scores, a CV/resume, and proof of funds. The Country Guide lists each country's exact checklist and deadlines."],
      ["How important is the SOP?", "Very \u2014 it's often the deciding factor between similar applicants. Use our SOP Builder for a structured draft and the SOP Checker for an AI review, and study the full-length sample SOPs."]
    ] },
    { stage: "\u{1F4B0} Funding", qa: [
      ["How can I fund my studies?", "Combine scholarships, education loans and part-time work. Our country-based Scholarship Finder lists fully-funded and merit awards, and the Loan Compare tab shows 10 lenders with rates, limits and EMI."],
      ["Can I get a scholarship with an average profile?", "Yes \u2014 many scholarships reward need, leadership, or specific fields rather than only top grades. Apply early and to several; check the Scholarships tab filtered by your country."]
    ] },
    { stage: "\u{1F6C2} Visa", qa: [
      ["What is the student-visa success rate?", "It varies by country and profile \u2014 see each destination's visa-success rate in the Country Guide. Strong funds proof, a genuine study plan and consistent documents are the biggest factors."],
      ["When should I apply for my visa?", "As soon as you receive your offer and confirm funds \u2014 visa processing can take weeks to months. Apply early, especially for Fall intake."]
    ] },
    { stage: "\u2708\uFE0F Travel & stay", qa: [
      ["How much does living abroad cost?", "Living costs run roughly $10,000\u201320,000/yr depending on the city \u2014 the Country Guide shows averages and top student cities. Budget for rent, food, transport, insurance and one-off setup costs."],
      ["Can I work while studying?", "Most student visas allow part-time work (often ~20 hours/week in term time). Check the exact limit in each destination's visa-types section."]
    ] },
    { stage: "\u{1F393} Post degree", qa: [
      ["Can I stay and work after graduating?", "Most top destinations offer post-study work: USA OPT (12\u201336 months), UK Graduate Route (2 years), Canada PGWP (up to 3), Australia 485 (2\u20134). The Immigration roadmap in each Country Guide shows the path from study to work to PR."],
      ["How do I get PR after studying?", "Generally: graduate \u2192 post-study work \u2192 skilled/sponsored job \u2192 permanent residence. Canada and Australia have the clearest points-based routes; see the step-by-step student\u2192PR roadmap per country."]
    ] }
  ];
  function UpdatesPanel({ onOpenTab }) {
    const [open, setOpen] = useState({});
    return /* @__PURE__ */ React.createElement("div", { className: "updates-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u2753 Study-abroad FAQ \u2014 every stage of your journey"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, 'From "why study abroad" to life after your degree \u2014 the questions students actually ask. (Latest exam/visa/immigration changes are on the ', /* @__PURE__ */ React.createElement("a", { href: "#/blog", style: { color: "var(--accent)", fontWeight: 600 } }, "Blog"), ".)"), FAQ_STAGES.map((grp) => /* @__PURE__ */ React.createElement("div", { className: "faq-stage", key: grp.stage }, /* @__PURE__ */ React.createElement("h3", { className: "faq-stage-title" }, grp.stage), grp.qa.map(([q, a], i) => {
      const key = grp.stage + i;
      return /* @__PURE__ */ React.createElement("div", { className: "faq-acc" + (open[key] ? " open" : ""), key }, /* @__PURE__ */ React.createElement("button", { className: "faq-acc-q", onClick: () => setOpen((o) => ({ ...o, [key]: !o[key] })) }, /* @__PURE__ */ React.createElement("span", null, q), /* @__PURE__ */ React.createElement("span", { className: "faq-acc-ic" }, open[key] ? "\u2212" : "+")), open[key] && /* @__PURE__ */ React.createElement("div", { className: "faq-acc-a" }, a));
    })))));
  }
  window.LP_UpdatesPanel = UpdatesPanel;
  window.LP_STUDY_FAQ = FAQ_STAGES;
})();
