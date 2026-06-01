"use strict";
(function() {
  const { useState, useEffect } = React;
  const fmtUSD = (n) => n < 1e3 ? "\u2248 tuition-free" : "$" + Math.round(n / 1e3) + "k/yr";
  const parseLeadNum = (s) => {
    const m = String(s).match(/[\d.]+/);
    return m ? parseFloat(m[0]) : null;
  };
  const CI = () => window.LP_COLLEGE_COUNTRY_INFO || {};
  const APP_KEY = "lp_applications";
  const STAGES = ["Researching", "Preparing documents", "Applied", "Interview", "Admitted", "Rejected", "Enrolled"];
  function loadApps() {
    try {
      return JSON.parse(localStorage.getItem(APP_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveApps(a) {
    try {
      localStorage.setItem(APP_KEY, JSON.stringify(a));
    } catch (e) {
    }
  }
  function isSaved(id) {
    return loadApps().some((a) => a.id === id);
  }
  function catToBucket(cat) {
    return cat === "safe" ? "Safety" : cat === "target" ? "Target" : cat ? "Dream" : "Considering";
  }
  function addApp(c, cat) {
    const apps = loadApps();
    if (apps.some((a) => a.id === c.id)) return apps;
    apps.unshift({ id: c.id, name: c.name, country: c.country, city: c.city, rank: c.rank, ielts: c.ielts, fee: c.feeNote, intakes: c.intakes, bucket: catToBucket(cat), stage: "Researching", deadline: "", notes: "", ts: 0 });
    saveApps(apps);
    return apps;
  }
  function removeApp(id) {
    const a = loadApps().filter((x) => x.id !== id);
    saveApps(a);
    return a;
  }
  function updateApp(id, patch) {
    const a = loadApps().map((x) => x.id === id ? { ...x, ...patch } : x);
    saveApps(a);
    return a;
  }
  const CAT_META = {
    safe: { label: "\u2705 Safe", cls: "cat-safe", note: "Strong chance \u2014 your profile clears the bar comfortably." },
    target: { label: "\u{1F3AF} Target", cls: "cat-target", note: "Good match \u2014 you meet the typical requirements." },
    reach: { label: "\u{1F680} Reach", cls: "cat-reach", note: "Ambitious \u2014 competitive, but worth a shot." },
    ambitious: { label: "\u{1F31F} Aspirational", cls: "cat-asp", note: "A stretch on current scores \u2014 keep building your profile." }
  };
  function classify(c, user) {
    const eMargin = user.test === "toefl" ? (user.score - c.toefl) / 12 : user.score - c.ielts;
    const uniGpa = parseLeadNum(c.gpa);
    let gpaMargin = null;
    if (user.gpa && uniGpa && uniGpa <= 4) gpaMargin = user.gpa - uniGpa;
    const acc = c.acceptance;
    let cat;
    if (eMargin >= 0.5 && acc >= 30 && (gpaMargin === null || gpaMargin >= 0)) cat = "safe";
    else if (eMargin >= 0 && acc >= 12 && (gpaMargin === null || gpaMargin >= -0.3)) cat = "target";
    else if (eMargin >= -0.5 || acc < 12) cat = "reach";
    else cat = "ambitious";
    if (gpaMargin !== null && gpaMargin < -0.4 && cat === "safe") cat = "target";
    if (gpaMargin !== null && gpaMargin < -0.6 && cat === "target") cat = "reach";
    let conf = 50 + Math.round(eMargin * 15) + Math.round((acc - 30) / 3) + (gpaMargin !== null ? Math.round(gpaMargin * 20) : 0);
    conf = Math.max(5, Math.min(96, conf));
    const eName = user.test === "toefl" ? "TOEFL" : "IELTS";
    const req = user.test === "toefl" ? c.toefl : c.ielts;
    const parts = [`${eName} ${user.score} ${user.score >= req ? "meets" : "is below"} the ${req} required`];
    if (gpaMargin !== null) parts.push(`GPA ${user.gpa.toFixed(1)} vs ${uniGpa} typical`);
    parts.push(`${acc}% acceptance`);
    const overBudget = user.budget && c.tuitionUSD > user.budget + 2e3;
    return { cat, confidence: conf, reason: parts.join(" \xB7 "), overBudget };
  }
  function CompareTable({ items, onClear }) {
    const rows = [
      ["QS Rank", (c) => "#" + c.rank],
      ["National rank", (c) => "#" + c.natRank],
      ["Type", (c) => c.type],
      ["Founded", (c) => c.founded],
      ["Tuition", (c) => c.feeNote],
      ["App fee", (c) => c.appFee],
      ["IELTS", (c) => c.ielts],
      ["TOEFL", (c) => c.toefl],
      ["PTE", (c) => c.pte],
      ["GRE", (c) => c.gre],
      ["Min GPA", (c) => c.gpa],
      ["Acceptance", (c) => c.acceptance + "%"],
      ["Intl students", (c) => c.intlPct + "%"],
      ["Intakes", (c) => c.intakes.join(", ")],
      ["Deadline", (c) => c.deadline],
      ["Scholarships", (c) => c.scholarship ? "\u2713" : "\u2014"],
      ["Post-study work", (c) => (CI()[c.country] || {}).psw || "\u2014"]
    ];
    return /* @__PURE__ */ React.createElement("div", { className: "compare-wrap tool-card" }, /* @__PURE__ */ React.createElement("div", { className: "compare-head" }, /* @__PURE__ */ React.createElement("h3", null, "\u2696\uFE0F Compare (", items.length, ")"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: onClear }, "Clear")), /* @__PURE__ */ React.createElement("div", { className: "compare-scroll" }, /* @__PURE__ */ React.createElement("table", { className: "compare-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null), items.map((c) => /* @__PURE__ */ React.createElement("th", { key: c.id }, c.name)))), /* @__PURE__ */ React.createElement("tbody", null, rows.map(([label, fn]) => /* @__PURE__ */ React.createElement("tr", { key: label }, /* @__PURE__ */ React.createElement("td", { className: "cmp-label" }, label), items.map((c) => /* @__PURE__ */ React.createElement("td", { key: c.id }, fn(c)))))))));
  }
  function Stat({ label, value }) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, label), /* @__PURE__ */ React.createElement("strong", null, value));
  }
  function CollegeCard({ c, cat, reason, confidence, overBudget, compared, onCompare }) {
    const [open, setOpen] = useState(false);
    const [saved, setSaved] = useState(isSaved(c.id));
    const ci = CI()[c.country] || {};
    const proc = (window.LP_COLLEGE_PROCESS || {})[c.country] || [];
    const toggleSave = () => {
      if (saved) {
        removeApp(c.id);
        setSaved(false);
      } else {
        addApp(c, cat);
        setSaved(true);
      }
    };
    const noGre = /optional|not/i.test(String(c.gre));
    return /* @__PURE__ */ React.createElement("div", { className: "college-card" }, /* @__PURE__ */ React.createElement("div", { className: "cc-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "cc-name" }, c.name), /* @__PURE__ */ React.createElement("div", { className: "cc-loc" }, c.city, " \xB7 ", c.country, " \xB7 QS #", c.rank, " \xB7 #", c.natRank, " in ", c.country)), cat && /* @__PURE__ */ React.createElement("span", { className: "cc-cat " + CAT_META[cat].cls }, CAT_META[cat].label)), reason && /* @__PURE__ */ React.createElement("div", { className: "cc-reason" }, reason, confidence ? /* @__PURE__ */ React.createElement("span", { className: "cc-conf" }, " \xB7 ", confidence, "% match") : null), /* @__PURE__ */ React.createElement("div", { className: "cc-stats" }, /* @__PURE__ */ React.createElement(Stat, { label: "IELTS", value: c.ielts }), /* @__PURE__ */ React.createElement(Stat, { label: "TOEFL", value: c.toefl }), /* @__PURE__ */ React.createElement(Stat, { label: "GRE", value: c.gre }), /* @__PURE__ */ React.createElement(Stat, { label: "Tuition", value: fmtUSD(c.tuitionUSD) }), /* @__PURE__ */ React.createElement(Stat, { label: "Accept", value: c.acceptance + "%" })), /* @__PURE__ */ React.createElement("div", { className: "cc-tags" }, c.intakes.map((i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "cc-tag" }, "\u{1F4C5} ", i)), noGre && /* @__PURE__ */ React.createElement("span", { className: "cc-tag good" }, "\u2713 No GRE required"), c.scholarship && /* @__PURE__ */ React.createElement("span", { className: "cc-tag good" }, "\u{1F381} Scholarships"), overBudget && /* @__PURE__ */ React.createElement("span", { className: "cc-tag over" }, "\u{1F4B0} Over budget")), /* @__PURE__ */ React.createElement("div", { className: "cc-btns" }, /* @__PURE__ */ React.createElement("label", { className: "cc-compare" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!compared, onChange: () => onCompare && onCompare(c) }), " Compare"), /* @__PURE__ */ React.createElement("button", { className: "cc-save" + (saved ? " saved" : ""), onClick: toggleSave }, saved ? "\u2713 Saved" : "\uFF0B Save to my list"), /* @__PURE__ */ React.createElement("button", { className: "cc-toggle", onClick: () => setOpen((o) => !o) }, open ? "Hide full details \u25B2" : "Full details \u25BC")), open && /* @__PURE__ */ React.createElement("div", { className: "cc-details" }, /* @__PURE__ */ React.createElement("h4", null, "Overview"), /* @__PURE__ */ React.createElement("div", { className: "cc-grid" }, /* @__PURE__ */ React.createElement(Stat, { label: "Type", value: c.type }), /* @__PURE__ */ React.createElement(Stat, { label: "Founded", value: c.founded }), /* @__PURE__ */ React.createElement(Stat, { label: "Intl students", value: c.intlPct + "%" }), /* @__PURE__ */ React.createElement(Stat, { label: "Website", value: /* @__PURE__ */ React.createElement("a", { href: "https://" + c.website, target: "_blank", rel: "noopener noreferrer" }, c.website) })), c.strengths && /* @__PURE__ */ React.createElement("div", { className: "cc-block" }, /* @__PURE__ */ React.createElement("strong", null, "Known for:"), " ", c.strengths.join(" \xB7 "), c.alumni ? /* @__PURE__ */ React.createElement(React.Fragment, null, " \xB7 ", /* @__PURE__ */ React.createElement("em", null, "Alumni: ", c.alumni)) : null), /* @__PURE__ */ React.createElement("h4", null, "Programs"), /* @__PURE__ */ React.createElement("div", { className: "cc-block" }, c.programs.join(" \xB7 ")), /* @__PURE__ */ React.createElement("h4", null, "Admission requirements"), /* @__PURE__ */ React.createElement("div", { className: "cc-grid" }, /* @__PURE__ */ React.createElement(Stat, { label: "IELTS", value: c.ielts }), /* @__PURE__ */ React.createElement(Stat, { label: "TOEFL", value: c.toefl }), /* @__PURE__ */ React.createElement(Stat, { label: "PTE", value: c.pte }), /* @__PURE__ */ React.createElement(Stat, { label: "Duolingo", value: c.duolingo }), /* @__PURE__ */ React.createElement(Stat, { label: "GRE", value: c.gre }), /* @__PURE__ */ React.createElement(Stat, { label: "GMAT (MBA)", value: c.gmat || "\u2014" }), /* @__PURE__ */ React.createElement(Stat, { label: "Min GPA", value: c.gpa }), /* @__PURE__ */ React.createElement(Stat, { label: "Work exp", value: c.workEx || "Not required" })), ci.checklist && /* @__PURE__ */ React.createElement("div", { className: "cc-block" }, /* @__PURE__ */ React.createElement("strong", null, "Documents needed (", c.country, "):"), " ", ci.checklist.join(" \xB7 ")), /* @__PURE__ */ React.createElement("h4", null, "Costs"), /* @__PURE__ */ React.createElement("div", { className: "cc-block" }, /* @__PURE__ */ React.createElement("strong", null, "Tuition:"), " ", c.feeNote, " \xB7 ", /* @__PURE__ */ React.createElement("strong", null, "Application fee:"), " ", c.appFee, ci.living ? /* @__PURE__ */ React.createElement(React.Fragment, null, " \xB7 ", /* @__PURE__ */ React.createElement("strong", null, "Living cost:"), " ", ci.living) : null), /* @__PURE__ */ React.createElement("h4", null, "Intakes & deadlines"), /* @__PURE__ */ React.createElement("div", { className: "cc-block" }, /* @__PURE__ */ React.createElement("strong", null, "Intakes:"), " ", c.intakes.join(", "), " \xB7 ", /* @__PURE__ */ React.createElement("strong", null, "Typical deadline:"), " ", c.deadline, ci.deadlines ? /* @__PURE__ */ React.createElement(React.Fragment, null, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: "tool-note", style: { display: "inline" } }, ci.deadlines)) : null), c.scholarship && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h4", null, "Scholarships"), /* @__PURE__ */ React.createElement("div", { className: "cc-block" }, c.scholarship)), /* @__PURE__ */ React.createElement("h4", null, "Class profile & selectivity"), /* @__PURE__ */ React.createElement("div", { className: "cc-block" }, /* @__PURE__ */ React.createElement("strong", null, "Acceptance rate:"), " ", c.acceptance, "% \xB7 ", /* @__PURE__ */ React.createElement("strong", null, "Profile:"), " ", c.classProfile), (ci.psw || ci.visa) && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h4", null, "After you graduate (work & visa)"), /* @__PURE__ */ React.createElement("div", { className: "cc-grid" }, /* @__PURE__ */ React.createElement(Stat, { label: "Post-study work", value: ci.psw || "\u2014" }), /* @__PURE__ */ React.createElement(Stat, { label: "Visa", value: ci.visa || "\u2014" }), /* @__PURE__ */ React.createElement(Stat, { label: "Work while studying", value: ci.work || "\u2014" }), /* @__PURE__ */ React.createElement(Stat, { label: "Dependents", value: ci.dependents || "\u2014" }))), proc.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h4", null, "Step-by-step admission process (", c.country, ")"), /* @__PURE__ */ React.createElement("ol", { className: "cc-steps" }, proc.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i }, s)))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "All figures are indicative \u2014 always confirm on the official university website (", c.website, ").")));
  }
  function CollegePredictorPanel({ onNav, country: pageCountry }) {
    const ALL = window.LP_COLLEGES || [];
    const COUNTRIES = window.LP_COLLEGE_COUNTRIES || [];
    const [test, setTest] = useState("ielts");
    const [score, setScore] = useState("");
    const [gpa, setGpa] = useState("");
    const [country, setCountry] = useState(pageCountry || "Any");
    useEffect(() => {
      if (pageCountry) {
        setCountry(pageCountry);
        setResult(null);
      }
    }, [pageCountry]);
    const [budget, setBudget] = useState("");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("rank");
    const [noGre, setNoGre] = useState(false);
    const [scholarOnly, setScholarOnly] = useState(false);
    const [result, setResult] = useState(null);
    const [compare, setCompare] = useState([]);
    const toggleCompare = (c) => setCompare((prev) => prev.some((x) => x.id === c.id) ? prev.filter((x) => x.id !== c.id) : prev.length >= 3 ? prev : [...prev, c]);
    const isCompared = (id) => compare.some((x) => x.id === id);
    const filterPool = (pool) => pool.filter(
      (c) => (country === "Any" || c.country === country) && (!noGre || /optional|not/i.test(String(c.gre))) && (!scholarOnly || !!c.scholarship) && (!query.trim() || (c.programs.join(" ") + " " + (c.strengths || []).join(" ") + " " + c.name).toLowerCase().includes(query.trim().toLowerCase()))
    );
    const sortFn = (a, b) => sort === "fees" ? a.tuitionUSD - b.tuitionUSD : sort === "accept" ? b.acceptance - a.acceptance : a.rank - b.rank;
    const predict = (e) => {
      e && e.preventDefault();
      const s = parseFloat(score);
      const user = { test, score: isNaN(s) ? test === "toefl" ? 80 : 6.5 : s, gpa: parseFloat(gpa) || 0, budget: parseFloat(budget) || 0 };
      const buckets = { safe: [], target: [], reach: [], ambitious: [] };
      filterPool(ALL).forEach((c) => {
        const r = classify(c, user);
        buckets[r.cat].push({ c, ...r });
      });
      Object.keys(buckets).forEach((k) => buckets[k].sort((a, b) => sortFn(a.c, b.c)));
      setResult(buckets);
    };
    const reset = () => setResult(null);
    const browseList = filterPool(ALL).slice().sort(sortFn);
    return /* @__PURE__ */ React.createElement("div", { className: "college-panel" }, /* @__PURE__ */ React.createElement("form", { className: "tool-card", onSubmit: predict }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F393} College Predictor", country !== "Any" ? " \u2014 " + country : ""), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Enter your profile to see Safe / Target / Reach universities ", country !== "Any" ? "in " + country : "", " \u2014 with full details, fees, scholarships, deadlines, class profiles and the complete admission process. Switch country above to explore another destination."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Test", /* @__PURE__ */ React.createElement("select", { value: test, onChange: (e) => setTest(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "ielts" }, "IELTS"), /* @__PURE__ */ React.createElement("option", { value: "toefl" }, "TOEFL iBT"))), /* @__PURE__ */ React.createElement("label", null, "Your score", /* @__PURE__ */ React.createElement("input", { type: "number", step: test === "toefl" ? 1 : 0.5, min: "0", max: test === "toefl" ? 120 : 9, value: score, onChange: (e) => setScore(e.target.value), placeholder: test === "toefl" ? "e.g. 100" : "e.g. 7.0" })), /* @__PURE__ */ React.createElement("label", null, "GPA (out of 4)", /* @__PURE__ */ React.createElement("input", { type: "number", step: "0.1", min: "0", max: "4", value: gpa, onChange: (e) => setGpa(e.target.value), placeholder: "optional" })), /* @__PURE__ */ React.createElement("label", null, "Budget (USD/yr)", /* @__PURE__ */ React.createElement("input", { type: "number", value: budget, onChange: (e) => setBudget(e.target.value), placeholder: "optional" }))), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Search program / keyword", /* @__PURE__ */ React.createElement("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "e.g. data science, MBA, AI" })), /* @__PURE__ */ React.createElement("label", null, "Sort by", /* @__PURE__ */ React.createElement("select", { value: sort, onChange: (e) => setSort(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "rank" }, "Ranking"), /* @__PURE__ */ React.createElement("option", { value: "fees" }, "Lowest fees"), /* @__PURE__ */ React.createElement("option", { value: "accept" }, "Highest acceptance"))), /* @__PURE__ */ React.createElement("label", { className: "chk" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: noGre, onChange: (e) => setNoGre(e.target.checked) }), " No GRE required"), /* @__PURE__ */ React.createElement("label", { className: "chk" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: scholarOnly, onChange: (e) => setScholarOnly(e.target.checked) }), " Has scholarships")), /* @__PURE__ */ React.createElement("div", { className: "tool-row btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", type: "submit" }, "\u{1F52E} Predict my colleges"), result && /* @__PURE__ */ React.createElement("button", { type: "button", className: "tool-btn ghost", onClick: reset }, "Browse all instead"))), compare.length >= 2 && /* @__PURE__ */ React.createElement(CompareTable, { items: compare, onClear: () => setCompare([]) }), result ? /* @__PURE__ */ React.createElement(React.Fragment, null, ["safe", "target", "reach", "ambitious"].map((k) => result[k].length > 0 && /* @__PURE__ */ React.createElement("div", { className: "college-bucket", key: k }, /* @__PURE__ */ React.createElement("div", { className: "cb-head" }, /* @__PURE__ */ React.createElement("h3", null, CAT_META[k].label, " ", /* @__PURE__ */ React.createElement("span", null, "(", result[k].length, ")")), /* @__PURE__ */ React.createElement("p", null, CAT_META[k].note)), result[k].map(({ c, reason, confidence, overBudget }) => /* @__PURE__ */ React.createElement(CollegeCard, { key: c.id, c, cat: k, reason, confidence, overBudget, compared: isCompared(c.id), onCompare: toggleCompare })))), ["safe", "target", "reach", "ambitious"].every((k) => result[k].length === 0) && /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "No colleges matched \u2014 widen your filters or score."))) : /* @__PURE__ */ React.createElement("div", { className: "college-bucket" }, /* @__PURE__ */ React.createElement("div", { className: "cb-head" }, /* @__PURE__ */ React.createElement("h3", null, "Top universities ", country !== "Any" ? "in " + country : "worldwide", " ", /* @__PURE__ */ React.createElement("span", null, "(", browseList.length, ")")), /* @__PURE__ */ React.createElement("p", null, "Browse complete details \u2014 or enter your profile above to predict your fit. Tick ", /* @__PURE__ */ React.createElement("em", null, "Compare"), " on up to 3 to compare side by side.")), browseList.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "No colleges matched your filters.")) : browseList.map((c) => /* @__PURE__ */ React.createElement(CollegeCard, { key: c.id, c, compared: isCompared(c.id), onCompare: toggleCompare }))), /* @__PURE__ */ React.createElement("div", { className: "tools-foot" }, /* @__PURE__ */ React.createElement("a", { className: "tool-btn ghost", onClick: () => onNav && onNav("exam-prep") }, "\u2190 Practise for your entrance exam")));
  }
  window.LP_CollegePredictorPanel = CollegePredictorPanel;
  const BUCKETS = ["Dream", "Target", "Safety", "Considering"];
  const BUCKET_META = { Dream: "\u{1F31F} Dream", Target: "\u{1F3AF} Target", Safety: "\u2705 Safety", Considering: "\u{1F516} Considering" };
  function ApplicationsPanel({ onNav, onOpenTab }) {
    const [apps, setApps] = useState(loadApps);
    const [remindOn, setRemindOn] = useState(() => {
      try {
        return localStorage.getItem("lp_deadline_reminders") === "1";
      } catch (e) {
        return false;
      }
    });
    const set = (id, patch) => setApps(updateApp(id, patch));
    const del = (id) => setApps(removeApp(id));
    const goPredictor = () => {
      if (onOpenTab) onOpenTab("predictor");
      else if (onNav) onNav("colleges");
    };
    const daysLeft = (d) => Math.ceil(((/* @__PURE__ */ new Date(d + "T00:00:00")).getTime() - Date.now()) / 864e5);
    const withDeadlines = apps.filter((a) => a.deadline).sort((x, y) => String(x.deadline).localeCompare(String(y.deadline)));
    const addToCalendar = (a) => {
      const dt = (a.deadline || "").replace(/-/g, "");
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LandingPrep//Applications//EN",
        "BEGIN:VEVENT",
        "UID:" + a.id + "@landingprep",
        "DTSTART;VALUE=DATE:" + dt,
        "DTEND;VALUE=DATE:" + dt,
        "SUMMARY:" + (a.name || "University") + " \u2014 application deadline",
        "DESCRIPTION:" + [a.country, a.bucket, "Apply via LandingPrep"].filter(Boolean).join(" \xB7 "),
        "BEGIN:VALARM",
        "TRIGGER:-P7D",
        "ACTION:DISPLAY",
        "DESCRIPTION:Application deadline in 1 week",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\r\n");
      try {
        const blob = new Blob([lines], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = (a.name || "deadline").replace(/\W+/g, "-").toLowerCase() + ".ics";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1e3);
      } catch (e) {
      }
    };
    const enableReminders = async () => {
      try {
        if (!("Notification" in window)) {
          alert("Your browser doesn't support notifications.");
          return;
        }
        let p = Notification.permission;
        if (p !== "granted") p = await Notification.requestPermission();
        if (p === "granted") {
          localStorage.setItem("lp_deadline_reminders", "1");
          setRemindOn(true);
          const soon = withDeadlines.filter((a) => {
            const d = daysLeft(a.deadline);
            return d >= 0 && d <= 30;
          });
          new Notification("\u2705 Deadline reminders on", { body: soon.length ? soon.length + " deadline(s) within 30 days \u2014 we'll nudge you when you open LandingPrep." : "We'll remind you here as your deadlines approach." });
        }
      } catch (e) {
      }
    };
    useEffect(() => {
      if (!remindOn || !("Notification" in window) || Notification.permission !== "granted") return;
      try {
        const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
        if (localStorage.getItem("lp_deadline_nudged") === today) return;
        const urgent = withDeadlines.filter((a) => {
          const d = daysLeft(a.deadline);
          return d >= 0 && d <= 7;
        });
        if (urgent.length) {
          new Notification("\u23F0 Deadline approaching", { body: urgent.map((a) => `${a.name} (${daysLeft(a.deadline)}d)`).slice(0, 3).join(", ") });
          localStorage.setItem("lp_deadline_nudged", today);
        }
      } catch (e) {
      }
    }, [remindOn, apps.length]);
    if (!apps.length) {
      return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4CB} My Applications"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Your shortlist is empty. Open the ", /* @__PURE__ */ React.createElement("strong", null, "College Predictor"), ", find your matches, and tap ", /* @__PURE__ */ React.createElement("em", null, "\u201C\uFF0B Save to my list\u201D"), " \u2014 they'll appear here so you can track deadlines and stages."), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: goPredictor }, "\u{1F3DB}\uFE0F Go to College Predictor"));
    }
    const applied = apps.filter((a) => ["Applied", "Interview", "Admitted", "Enrolled"].includes(a.stage)).length;
    const admitted = apps.filter((a) => ["Admitted", "Enrolled"].includes(a.stage)).length;
    return /* @__PURE__ */ React.createElement("div", { className: "apps-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4CB} My Applications"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Track every university from shortlist to offer. Saved on this device."), /* @__PURE__ */ React.createElement("div", { className: "apps-summary" }, /* @__PURE__ */ React.createElement("div", { className: "apps-stat" }, /* @__PURE__ */ React.createElement("span", null, apps.length), "saved"), /* @__PURE__ */ React.createElement("div", { className: "apps-stat" }, /* @__PURE__ */ React.createElement("span", null, applied), "applied"), /* @__PURE__ */ React.createElement("div", { className: "apps-stat" }, /* @__PURE__ */ React.createElement("span", null, admitted), "admitted"))), /* @__PURE__ */ React.createElement("div", { className: "tool-card apps-deadlines" }, /* @__PURE__ */ React.createElement("div", { className: "apps-dl-head" }, /* @__PURE__ */ React.createElement("h3", null, "\u23F0 Upcoming deadlines"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost" + (remindOn ? " on" : ""), onClick: enableReminders }, remindOn ? "\u{1F514} Reminders on" : "\u{1F514} Enable reminders")), withDeadlines.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "No deadlines set yet \u2014 add a deadline date to any application below, then export it to your calendar.") : /* @__PURE__ */ React.createElement("ul", { className: "apps-dl-list" }, withDeadlines.map((a) => {
      const d = daysLeft(a.deadline);
      const cls = d < 0 ? "past" : d <= 14 ? "soon" : "ok";
      return /* @__PURE__ */ React.createElement("li", { key: a.id, className: "apps-dl-item " + cls }, /* @__PURE__ */ React.createElement("span", { className: "apps-dl-name" }, a.name), /* @__PURE__ */ React.createElement("span", { className: "apps-dl-date" }, a.deadline), /* @__PURE__ */ React.createElement("span", { className: "apps-dl-days" }, d < 0 ? "passed" : d === 0 ? "today" : d + " days"), /* @__PURE__ */ React.createElement("button", { className: "apps-dl-cal", title: "Add to calendar (.ics)", onClick: () => addToCalendar(a) }, "\u{1F4C5} Add"));
    }))), BUCKETS.map((b) => {
      const list = apps.filter((a) => a.bucket === b);
      if (!list.length) return null;
      return /* @__PURE__ */ React.createElement("div", { className: "apps-bucket", key: b }, /* @__PURE__ */ React.createElement("h3", null, BUCKET_META[b], " ", /* @__PURE__ */ React.createElement("span", null, "(", list.length, ")")), list.map((a) => /* @__PURE__ */ React.createElement("div", { className: "app-card", key: a.id }, /* @__PURE__ */ React.createElement("div", { className: "app-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "app-name" }, a.name), /* @__PURE__ */ React.createElement("div", { className: "app-loc" }, a.city, " \xB7 ", a.country, " \xB7 IELTS ", a.ielts, " \xB7 ", a.fee)), /* @__PURE__ */ React.createElement("button", { className: "err-x", title: "Remove", onClick: () => del(a.id) }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "app-controls" }, /* @__PURE__ */ React.createElement("label", null, "Bucket", /* @__PURE__ */ React.createElement("select", { value: a.bucket, onChange: (e) => set(a.id, { bucket: e.target.value }) }, BUCKETS.map((x) => /* @__PURE__ */ React.createElement("option", { key: x, value: x }, x)))), /* @__PURE__ */ React.createElement("label", null, "Stage", /* @__PURE__ */ React.createElement("select", { value: a.stage, onChange: (e) => set(a.id, { stage: e.target.value }) }, STAGES.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s)))), /* @__PURE__ */ React.createElement("label", null, "Deadline", /* @__PURE__ */ React.createElement("input", { type: "date", value: a.deadline || "", onChange: (e) => set(a.id, { deadline: e.target.value }) }))), /* @__PURE__ */ React.createElement("textarea", { className: "app-notes", rows: 2, placeholder: "Notes (program, scholarship, contact\u2026)", value: a.notes || "", onChange: (e) => set(a.id, { notes: e.target.value }) }))));
    }));
  }
  window.LP_ApplicationsPanel = ApplicationsPanel;
})();
