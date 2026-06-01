"use strict";
(function() {
  const { useState, useEffect } = React;
  const TYPE_CLASS = (t) => /Government|Govt/.test(t) ? "sch-govt" : /University/.test(t) ? "sch-uni" : /Need/.test(t) ? "sch-need" : "sch-merit";
  function ScholarshipCard({ s }) {
    const [open, setOpen] = useState(false);
    return /* @__PURE__ */ React.createElement("div", { className: "sch-card" }, /* @__PURE__ */ React.createElement("div", { className: "sch-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sch-name" }, s.name), /* @__PURE__ */ React.createElement("div", { className: "sch-loc" }, s.country)), /* @__PURE__ */ React.createElement("span", { className: "sch-type " + TYPE_CLASS(s.type) }, s.type)), /* @__PURE__ */ React.createElement("div", { className: "sch-stats" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Level"), /* @__PURE__ */ React.createElement("strong", null, s.level)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Award"), /* @__PURE__ */ React.createElement("strong", null, s.amount)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Deadline"), /* @__PURE__ */ React.createElement("strong", null, s.deadline))), /* @__PURE__ */ React.createElement("p", { className: "sch-hi" }, s.highlight), /* @__PURE__ */ React.createElement("button", { className: "cc-toggle", onClick: () => setOpen((o) => !o) }, open ? "Hide eligibility \u25B2" : "Who can apply \u25BC"), open && /* @__PURE__ */ React.createElement("div", { className: "sch-elig" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Eligibility:"), " ", s.who), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Indicative \u2014 always confirm amounts, eligibility and deadlines on the official scholarship website.")));
  }
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const ABBR = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  function firstMonth(deadline) {
    const d = deadline || "";
    for (let i = 0; i < MONTHS.length; i++) if (d.includes(MONTHS[i])) return i;
    for (const a in ABBR) if (d.includes(a)) return ABBR[a];
    return 99;
  }
  function ScholarshipPanel({ onNav, country: pageCountry }) {
    const ALL = window.LP_SCHOLARSHIPS || [];
    const COUNTRIES = window.LP_SCHOLARSHIP_COUNTRIES || [];
    const [country, setCountry] = useState(pageCountry || "Any");
    const [level, setLevel] = useState("Any");
    const [type, setType] = useState("Any");
    const [view, setView] = useState("list");
    useEffect(() => {
      if (pageCountry) setCountry(pageCountry);
    }, [pageCountry]);
    const matchLevel = (s) => level === "Any" || s.level.toLowerCase().includes(level.toLowerCase());
    const matchType = (s) => type === "Any" || s.type.toLowerCase().includes(type.toLowerCase());
    const matchCountry = (s) => country === "Any" || s.country === country || s.country.includes(country) || /Multiple|Europe/i.test(s.country);
    const list = ALL.filter((s) => matchCountry(s) && matchLevel(s) && matchType(s));
    const byMonth = {};
    list.forEach((s) => {
      const m = firstMonth(s.deadline);
      (byMonth[m] = byMonth[m] || []).push(s);
    });
    const monthKeys = Object.keys(byMonth).map(Number).sort((a, b) => a - b);
    return /* @__PURE__ */ React.createElement("div", { className: "sch-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4B8} Scholarship Finder"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Find fully-funded and partial scholarships to study abroad \u2014 filter by destination, level and funding type. ", ALL.length, " curated awards."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Destination", /* @__PURE__ */ React.createElement("select", { value: country, onChange: (e) => setCountry(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "Any" }, "Any country"), COUNTRIES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c)))), /* @__PURE__ */ React.createElement("label", null, "Level", /* @__PURE__ */ React.createElement("select", { value: level, onChange: (e) => setLevel(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "Any" }, "Any level"), /* @__PURE__ */ React.createElement("option", { value: "Undergraduate" }, "Undergraduate"), /* @__PURE__ */ React.createElement("option", { value: "Master's" }, "Master's"), /* @__PURE__ */ React.createElement("option", { value: "PhD" }, "PhD"))), /* @__PURE__ */ React.createElement("label", null, "Funding type", /* @__PURE__ */ React.createElement("select", { value: type, onChange: (e) => setType(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "Any" }, "Any type"), /* @__PURE__ */ React.createElement("option", { value: "Government" }, "Government"), /* @__PURE__ */ React.createElement("option", { value: "University" }, "University"), /* @__PURE__ */ React.createElement("option", { value: "Merit" }, "Merit"), /* @__PURE__ */ React.createElement("option", { value: "Need" }, "Need-based")))), /* @__PURE__ */ React.createElement("div", { className: "sch-viewtoggle" }, /* @__PURE__ */ React.createElement("button", { className: "sch-vbtn" + (view === "list" ? " active" : ""), onClick: () => setView("list") }, "\u{1F4CB} List"), /* @__PURE__ */ React.createElement("button", { className: "sch-vbtn" + (view === "calendar" ? " active" : ""), onClick: () => setView("calendar") }, "\u{1F4C5} Deadlines calendar"))), view === "list" ? /* @__PURE__ */ React.createElement("div", { className: "sch-results" }, /* @__PURE__ */ React.createElement("h3", null, list.length, " scholarship", list.length !== 1 ? "s" : "", " ", country !== "Any" ? "for " + country : ""), list.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "No scholarships matched \u2014 try widening your filters.")) : list.map((s) => /* @__PURE__ */ React.createElement(ScholarshipCard, { key: s.id, s }))) : /* @__PURE__ */ React.createElement("div", { className: "sch-calendar" }, monthKeys.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "No scholarships matched.")), monthKeys.map((m) => /* @__PURE__ */ React.createElement("div", { className: "sch-month", key: m }, /* @__PURE__ */ React.createElement("h3", null, m === 99 ? "\u{1F504} Rolling / varies" : "\u{1F4C5} " + MONTHS[m]), byMonth[m].map((s) => /* @__PURE__ */ React.createElement("div", { className: "sch-cal-item", key: s.id }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, s.name), /* @__PURE__ */ React.createElement("span", { className: "sch-cal-meta" }, " \xB7 ", s.country, " \xB7 ", s.amount)), /* @__PURE__ */ React.createElement("span", { className: "sch-cal-deadline" }, s.deadline)))))), /* @__PURE__ */ React.createElement("div", { className: "tools-foot" }, /* @__PURE__ */ React.createElement("a", { className: "tool-btn ghost", onClick: () => onNav && onNav("colleges") }, "\u{1F3DB}\uFE0F Find your colleges \u2192")));
  }
  window.LP_ScholarshipPanel = ScholarshipPanel;
})();
