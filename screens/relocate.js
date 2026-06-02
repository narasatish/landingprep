"use strict";
(function() {
  const { useState, useEffect } = React;
  const KEY = "lp_predeparture";
  function Checklist({ data }) {
    const [done, setDone] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem(KEY) || "{}");
      } catch (e) {
        return {};
      }
    });
    const toggle = (id) => {
      const n = Object.assign({}, done, { [id]: !done[id] });
      setDone(n);
      try {
        localStorage.setItem(KEY, JSON.stringify(n));
      } catch (e) {
      }
    };
    const all = data.reduce((a, g) => a.concat(g.items.map((_, i) => g.group + i)), []);
    const completed = all.filter((id) => done[id]).length;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u2705 Pre-departure checklist"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Everything to sort before you fly \u2014 ticks are saved on this device."), /* @__PURE__ */ React.createElement("div", { className: "rl-progress" }, /* @__PURE__ */ React.createElement("div", { className: "rl-progress-bar" }, /* @__PURE__ */ React.createElement("span", { style: { width: (all.length ? completed / all.length * 100 : 0) + "%" } })), /* @__PURE__ */ React.createElement("span", { className: "rl-progress-txt" }, completed, "/", all.length, " done"))), data.map((g) => /* @__PURE__ */ React.createElement("div", { className: "tool-card", key: g.group }, /* @__PURE__ */ React.createElement("h4", null, g.group), g.items.map((it, i) => {
      const id = g.group + i;
      return /* @__PURE__ */ React.createElement("label", { className: "rl-check" + (done[id] ? " checked" : ""), key: i }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: !!done[id], onChange: () => toggle(id) }), " ", /* @__PURE__ */ React.createElement("span", null, it));
    }))));
  }
  function VisaTimeline({ data }) {
    const countries = Object.keys(data);
    const [c, setC] = useState(countries[0] || "");
    const steps = data[c] || [];
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "tools-groups" }, countries.map((k) => /* @__PURE__ */ React.createElement("button", { key: k, className: "tools-group" + (c === k ? " active" : ""), onClick: () => setC(k) }, k))), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F6C2} ", c, " student-visa timeline"), /* @__PURE__ */ React.createElement("ol", { className: "rl-timeline" }, steps.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("div", { className: "rl-step-when" }, s.when), /* @__PURE__ */ React.createElement("div", { className: "rl-step-body" }, /* @__PURE__ */ React.createElement("strong", null, s.step), /* @__PURE__ */ React.createElement("span", null, s.detail))))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Always confirm the latest rules on the official immigration website \u2014 processing times change.")));
  }
  function CityGuides({ data }) {
    return /* @__PURE__ */ React.createElement("div", { className: "rl-cities" }, data.map((c, i) => /* @__PURE__ */ React.createElement("div", { className: "tool-card rl-city", key: i }, /* @__PURE__ */ React.createElement("h3", null, c.emoji, " ", c.city, " ", /* @__PURE__ */ React.createElement("span", { className: "rl-city-country" }, c.country)), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, c.intro), /* @__PURE__ */ React.createElement("div", { className: "rl-city-meta" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4B7} ", c.cost), /* @__PURE__ */ React.createElement("span", null, "\u{1F68C} ", c.transport)), c.studentAreas && /* @__PURE__ */ React.createElement("p", { className: "rl-city-areas" }, /* @__PURE__ */ React.createElement("strong", null, "Student areas:"), " ", c.studentAreas.join(", ")), /* @__PURE__ */ React.createElement("ul", { className: "rl-city-tips" }, (c.tips || []).map((t, j) => /* @__PURE__ */ React.createElement("li", { key: j }, t))))));
  }
  function Relocate({ onNav, initialTab }) {
    const d = window.LP_SA_EXTRA || {};
    const [tab, setTab] = useState(["checklist", "visa", "cities"].includes(initialTab) ? initialTab : "checklist");
    useEffect(() => {
      try {
        document.title = "Move Abroad \u2014 Pre-Departure Checklist, Visa Timeline & City Guides | LandingPrep";
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Free study-abroad relocation toolkit: an interactive pre-departure checklist, student-visa timelines for the USA, UK, Canada, Australia & Germany, and city guides with costs and tips.");
      } catch (e) {
      }
    }, []);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "colleges", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell tools-shell-wide" }, /* @__PURE__ */ React.createElement("header", { className: "tools-hero" }, /* @__PURE__ */ React.createElement("h1", null, "\u2708\uFE0F Move Abroad"), /* @__PURE__ */ React.createElement("p", null, "Everything after the offer letter \u2014 a pre-departure checklist you can tick off, visa timelines by country, and student city guides.")), /* @__PURE__ */ React.createElement("div", { className: "tools-tabs" }, /* @__PURE__ */ React.createElement("button", { className: "tools-tab" + (tab === "checklist" ? " active" : ""), onClick: () => setTab("checklist") }, "\u2705 Pre-departure"), /* @__PURE__ */ React.createElement("button", { className: "tools-tab" + (tab === "visa" ? " active" : ""), onClick: () => setTab("visa") }, "\u{1F6C2} Visa timeline"), /* @__PURE__ */ React.createElement("button", { className: "tools-tab" + (tab === "cities" ? " active" : ""), onClick: () => setTab("cities") }, "\u{1F3D9}\uFE0F City guides")), tab === "checklist" && (d.preDeparture ? /* @__PURE__ */ React.createElement(Checklist, { data: d.preDeparture }) : /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Loading\u2026"))), tab === "visa" && (d.visaTimeline ? /* @__PURE__ */ React.createElement(VisaTimeline, { data: d.visaTimeline }) : /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Loading\u2026"))), tab === "cities" && (d.cityGuides ? /* @__PURE__ */ React.createElement(CityGuides, { data: d.cityGuides }) : /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Loading\u2026"))), /* @__PURE__ */ React.createElement("div", { className: "tools-foot" }, /* @__PURE__ */ React.createElement("a", { className: "tool-btn ghost", onClick: () => onNav && onNav("colleges") }, "\u{1F3DB}\uFE0F College predictor & scholarships \u2192"))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_Relocate = Relocate;
})();
