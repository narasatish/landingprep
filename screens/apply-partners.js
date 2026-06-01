"use strict";
(function() {
  const { useState } = React;
  const PARTNER_CONFIG = {
    "ucl": { discountPct: 0 },
    "toronto": { discountPct: 0 },
    "kings-college-london": { discountPct: 0 },
    "edinburgh": { discountPct: 0 },
    "ubc": { discountPct: 0 },
    "manchester": { discountPct: 0 },
    "mcgill": { discountPct: 0 },
    "monash": { discountPct: 0 },
    "melbourne": { discountPct: 0 },
    "sydney": { discountPct: 0 },
    "tu-munich": { discountPct: 0 },
    "trinity-college-dublin": { discountPct: 0 }
  };
  const COLOURS = ["#4F46E5", "#0ea5e9", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777"];
  const initials = (name) => name.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const feeNum = (appFee) => {
    const m = String(appFee || "").match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  };
  function ApplyPanel({ country, onOpenTab }) {
    const ALL = window.LP_COLLEGES || [];
    const [showAll, setShowAll] = useState(false);
    let pool = ALL.filter((c) => !country || country === "Any" || c.country === country);
    pool = pool.sort((a, b) => a.rank - b.rank);
    const rows = (showAll ? pool : pool.slice(0, 6)).map((c) => {
      const cfg = PARTNER_CONFIG[c.id] || {};
      const fee = feeNum(c.appFee);
      const pct = cfg.discountPct || 0;
      const discounted = pct > 0 ? Math.round(fee * (1 - pct / 100)) : fee;
      return { c, fee, pct, discounted, applyUrl: cfg.applyUrl || "https://" + (c.website || "") };
    });
    return /* @__PURE__ */ React.createElement("div", { className: "apply-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card apply-head" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F393} Apply to ", pool.length, "+ Universities", country && country !== "Any" ? " in " + country : ""), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Start your application and unlock exclusive application & visa-fee waivers through LandingPrep partner universities. One profile, many applications.")), /* @__PURE__ */ React.createElement("div", { className: "tool-card apply-table-card" }, /* @__PURE__ */ React.createElement("div", { className: "apply-table" }, /* @__PURE__ */ React.createElement("div", { className: "apply-row apply-thead" }, /* @__PURE__ */ React.createElement("div", null, "University"), /* @__PURE__ */ React.createElement("div", { className: "apply-fee-h" }, "Application fee"), /* @__PURE__ */ React.createElement("div", { className: "apply-act-h" }, "Action")), rows.map(({ c, fee, pct, discounted, applyUrl }) => /* @__PURE__ */ React.createElement("div", { className: "apply-row", key: c.id }, /* @__PURE__ */ React.createElement("div", { className: "apply-uni" }, /* @__PURE__ */ React.createElement("span", { className: "apply-logo", style: { background: COLOURS[c.id.charCodeAt(0) % COLOURS.length] } }, initials(c.name)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("a", { className: "apply-name", href: "/university/" + c.id + "/" }, c.name), /* @__PURE__ */ React.createElement("div", { className: "apply-loc" }, c.city, " \xB7 ", c.country, " \xB7 QS #", c.rank))), /* @__PURE__ */ React.createElement("div", { className: "apply-fee" }, pct > 0 ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "apply-pct" }, "% "), /* @__PURE__ */ React.createElement("span", { className: "apply-old" }, fee ? "$" + fee : "\u2014"), " ", /* @__PURE__ */ React.createElement("span", { className: "apply-new" }, "$", discounted, " (", pct, "% off)")) : /* @__PURE__ */ React.createElement("span", { className: "apply-cur" }, fee ? "$" + fee : "Free")), /* @__PURE__ */ React.createElement("div", { className: "apply-act" }, /* @__PURE__ */ React.createElement("a", { className: "apply-btn", href: applyUrl, target: "_blank", rel: "noopener noreferrer" }, "Apply Now"))))), pool.length > 6 && /* @__PURE__ */ React.createElement("div", { className: "apply-more" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => setShowAll((s) => !s) }, showAll ? "Show less" : "Explore More \u2192"))), /* @__PURE__ */ React.createElement("div", { className: "tool-card apply-help" }, /* @__PURE__ */ React.createElement("h3", null, "How applying through LandingPrep works"), /* @__PURE__ */ React.createElement("ol", { className: "apply-steps" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Shortlist"), " with the free Profile Evaluation & College Predictor."), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Prepare"), " your SOP, LOR and resume with our free builders."), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Apply"), " to partner universities here \u2014 fee waivers applied automatically where available."), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Track"), " every application, deadline and offer in My Applications.")), /* @__PURE__ */ React.createElement("div", { className: "apply-help-btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: () => onOpenTab && onOpenTab("onboard") }, "\u{1F9ED} Build my plan"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => onOpenTab && onOpenTab("predictor") }, "\u{1F3DB}\uFE0F Find my matches")), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Application-fee waivers and partner links are provided through LandingPrep university partnerships and may change. Always confirm fees on the official university site before paying. LandingPrep may earn a referral fee at no cost to you.")));
  }
  window.LP_ApplyPanel = ApplyPanel;
})();
