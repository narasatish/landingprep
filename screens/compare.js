"use strict";
(function() {
  const { useState } = React;
  function UniCompare({ country }) {
    const ALL = window.LP_COLLEGES || [];
    const [picks, setPicks] = useState([]);
    const [q, setQ] = useState("");
    const matches = q.trim() ? ALL.filter((c) => (c.name + " " + c.country).toLowerCase().includes(q.trim().toLowerCase()) && !picks.find((p) => p.id === c.id)).slice(0, 7) : [];
    const add = (c) => {
      if (picks.length < 4) {
        setPicks([...picks, c]);
        setQ("");
      }
    };
    const remove = (id) => setPicks(picks.filter((p) => p.id !== id));
    const ROWS = [
      ["Country", (c) => c.country],
      ["City", (c) => c.city],
      ["QS World rank", (c) => "#" + c.rank],
      ["National rank", (c) => "#" + c.natRank],
      ["Type", (c) => c.type],
      ["Tuition (intl)", (c) => c.feeNote],
      ["IELTS", (c) => c.ielts],
      ["TOEFL", (c) => c.toefl],
      ["GRE", (c) => c.gre],
      ["Acceptance rate", (c) => c.acceptance + "%"],
      ["Intl students", (c) => c.intlPct + "%"],
      ["Intakes", (c) => (c.intakes || []).join(", ")],
      ["Deadline", (c) => c.deadline],
      ["Scholarships", (c) => c.scholarship || "\u2014"],
      ["Top programs", (c) => (c.programs || []).slice(0, 4).join(", ")]
    ];
    return /* @__PURE__ */ React.createElement("div", { className: "cmp-uni" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F3DB}\uFE0F Compare universities ", /* @__PURE__ */ React.createElement("span", { className: "cmp-count" }, "(", picks.length, "/4)")), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Search and add up to four universities to compare fees, requirements, acceptance and more side by side."), /* @__PURE__ */ React.createElement("div", { className: "cmp-search" }, /* @__PURE__ */ React.createElement("input", { type: "text", value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search a university (e.g. Toronto, MIT, Melbourne)\u2026" }), matches.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "cmp-suggest" }, matches.map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, className: "cmp-suggest-item", onClick: () => add(c) }, /* @__PURE__ */ React.createElement("strong", null, c.name), /* @__PURE__ */ React.createElement("span", null, c.country, " \xB7 QS #", c.rank))))), picks.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "cmp-chips" }, picks.map((c) => /* @__PURE__ */ React.createElement("span", { key: c.id, className: "cmp-chip" }, c.name, /* @__PURE__ */ React.createElement("button", { onClick: () => remove(c.id), "aria-label": "Remove" }, "\u2715"))))), picks.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Add universities above to build your comparison. Tip: compare a Reach, a Target and a Safe school together.")) : /* @__PURE__ */ React.createElement("div", { className: "tool-card cmp-table-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "cmp-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "cmp-rowhead" }, "Metric"), picks.map((c) => /* @__PURE__ */ React.createElement("th", { key: c.id }, /* @__PURE__ */ React.createElement("a", { href: "/university/" + c.id + "/" }, c.name))))), /* @__PURE__ */ React.createElement("tbody", null, ROWS.map(([label, fn]) => /* @__PURE__ */ React.createElement("tr", { key: label }, /* @__PURE__ */ React.createElement("td", { className: "cmp-rowhead" }, label), picks.map((c) => /* @__PURE__ */ React.createElement("td", { key: c.id }, fn(c)))))))));
  }
  function CountryCompare() {
    const ALL = window.LP_COUNTRY_DATA || [];
    const [picks, setPicks] = useState(ALL.slice(0, 3).map((c) => c.name));
    const toggle = (name) => {
      setPicks((p) => p.includes(name) ? p.filter((x) => x !== name) : p.length < 3 ? [...p, name] : p);
    };
    const cols = picks.map((n) => ALL.find((c) => c.name === n)).filter(Boolean);
    const ROWS = [
      ["Student-visa success", (c) => c.visaSuccess + "%"],
      ["Avg tuition", (c) => c.avgTuition],
      ["Avg living cost", (c) => c.avgLiving],
      ["Post-study work", (c) => c.postStudyWork],
      ["PR timeline", (c) => c.prTimeline],
      ["Immigration route", (c) => c.immigration],
      ["Intakes", (c) => (c.intakes || []).join(", ")],
      ["Top cities", (c) => (c.topCities || []).slice(0, 4).join(", ")],
      ["Popular programs", (c) => (c.popularPrograms || []).slice(0, 4).join(", ")],
      ["Weather", (c) => c.weather]
    ];
    return /* @__PURE__ */ React.createElement("div", { className: "cmp-country" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F30D} Compare destinations ", /* @__PURE__ */ React.createElement("span", { className: "cmp-count" }, "(", picks.length, "/3)")), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Pick up to three countries to compare cost, work rights, PR speed and visa success."), /* @__PURE__ */ React.createElement("div", { className: "cmp-country-pick" }, ALL.map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, className: "cmp-cpick" + (picks.includes(c.name) ? " active" : ""), onClick: () => toggle(c.name) }, /* @__PURE__ */ React.createElement("span", null, c.flag), c.name)))), cols.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "tool-card cmp-table-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "cmp-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "cmp-rowhead" }, "Metric"), cols.map((c) => /* @__PURE__ */ React.createElement("th", { key: c.id }, c.flag, " ", c.name)))), /* @__PURE__ */ React.createElement("tbody", null, ROWS.map(([label, fn]) => /* @__PURE__ */ React.createElement("tr", { key: label }, /* @__PURE__ */ React.createElement("td", { className: "cmp-rowhead" }, label), cols.map((c) => /* @__PURE__ */ React.createElement("td", { key: c.id }, fn(c)))))))));
  }
  function ComparePanel({ country }) {
    const [mode, setMode] = useState("uni");
    return /* @__PURE__ */ React.createElement("div", { className: "cmp-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u2696\uFE0F Compare side by side"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Make a confident decision \u2014 compare universities or whole destinations on the metrics that matter."), /* @__PURE__ */ React.createElement("div", { className: "cmp-modes" }, /* @__PURE__ */ React.createElement("button", { className: "cmp-mode" + (mode === "uni" ? " active" : ""), onClick: () => setMode("uni") }, "\u{1F3DB}\uFE0F Universities"), /* @__PURE__ */ React.createElement("button", { className: "cmp-mode" + (mode === "country" ? " active" : ""), onClick: () => setMode("country") }, "\u{1F30D} Countries"))), mode === "uni" ? /* @__PURE__ */ React.createElement(UniCompare, { country }) : /* @__PURE__ */ React.createElement(CountryCompare, null));
  }
  window.LP_ComparePanel = ComparePanel;
})();
