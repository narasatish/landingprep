"use strict";
(function() {
  const CACHE_KEY = "lp_live_cache_v1";
  const FALLBACK = {
    updated: "2026-05-31",
    examFees: {},
    examPatternNotes: {},
    changes: []
  };
  let DATA = FALLBACK;
  let ready = false;
  const subs = /* @__PURE__ */ new Set();
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && typeof cached === "object") {
      DATA = Object.assign({}, FALLBACK, cached);
    }
  } catch (e) {
  }
  function notify() {
    subs.forEach((fn) => {
      try {
        fn(DATA);
      } catch (e) {
      }
    });
  }
  async function load() {
    const base = window.LP_API_BASE || "";
    const urls = [base + "/api/live", "/live-content.json"];
    for (const u of urls) {
      try {
        const r = await fetch(u, { cache: "no-store" });
        if (!r.ok) continue;
        const j = await r.json();
        if (j && typeof j === "object") {
          DATA = Object.assign({}, FALLBACK, j);
          ready = true;
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(DATA));
          } catch (e) {
          }
          notify();
          return;
        }
      } catch (e) {
      }
    }
    ready = true;
    notify();
  }
  function allChanges() {
    const out = [];
    (DATA.changes || []).forEach((c) => out.push({ date: c.date || "", category: c.category || "Update", scope: c.scope || "", title: c.title || "", text: c.text || "" }));
    (window.LP_COUNTRY_DATA || []).forEach((co) => {
      (co.changes || []).forEach((ch) => out.push({ date: String(ch.d || ""), category: "Country", scope: co.name, title: "", text: ch.t || "" }));
    });
    const seen = /* @__PURE__ */ new Set();
    const dedup = out.filter((c) => {
      const k = (c.scope + "|" + c.text).toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    dedup.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return dedup;
  }
  const LP_LIVE = {
    isReady: () => ready,
    data: () => DATA,
    updatedAt: () => DATA.updated || null,
    examFee: (id) => DATA.examFees && DATA.examFees[id] || null,
    patternNote: (id) => DATA.examPatternNotes && DATA.examPatternNotes[id] || null,
    changes: allChanges,
    refresh: load,
    subscribe: (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    // React hook: re-renders the component when live data arrives/updates.
    useLive: function() {
      const [, setN] = React.useState(0);
      React.useEffect(() => LP_LIVE.subscribe(() => setN((n) => n + 1)), []);
      return DATA;
    }
  };
  function ChangesFeed({ limit, scope, title, compact }) {
    LP_LIVE.useLive();
    const [cat, setCat] = React.useState("All");
    let list = LP_LIVE.changes();
    if (scope) list = list.filter((c) => c.scope === scope);
    const cats = ["All", ...Array.from(new Set(list.map((c) => c.category)))];
    if (cat !== "All") list = list.filter((c) => c.category === cat);
    if (limit) list = list.slice(0, limit);
    const icon = (c) => ({ Visa: "\u{1F6C2}", Exam: "\u{1F4DD}", Fees: "\u{1F4B0}", Admission: "\u{1F393}", Country: "\u{1F30D}", Update: "\u{1F195}" })[c.category] || "\u{1F195}";
    return /* @__PURE__ */ React.createElement("div", { className: "changes-feed" + (compact ? " compact" : "") }, /* @__PURE__ */ React.createElement("div", { className: "changes-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", null, title || "\u{1F195} Recent changes & updates"), LP_LIVE.updatedAt() && /* @__PURE__ */ React.createElement("span", { className: "changes-updated" }, "Last updated ", LP_LIVE.updatedAt())), !compact && cats.length > 2 && /* @__PURE__ */ React.createElement("div", { className: "changes-cats" }, cats.map((c) => /* @__PURE__ */ React.createElement("button", { key: c, className: "changes-cat" + (cat === c ? " active" : ""), onClick: () => setCat(c) }, c)))), /* @__PURE__ */ React.createElement("ul", { className: "changes-list" }, list.map((c, i) => /* @__PURE__ */ React.createElement("li", { key: i, className: "change-item" }, /* @__PURE__ */ React.createElement("span", { className: "change-ic", "aria-hidden": true }, icon(c)), /* @__PURE__ */ React.createElement("div", { className: "change-body" }, /* @__PURE__ */ React.createElement("div", { className: "change-meta" }, /* @__PURE__ */ React.createElement("span", { className: "change-date" }, c.date), c.scope && /* @__PURE__ */ React.createElement("span", { className: "change-scope" }, c.scope), /* @__PURE__ */ React.createElement("span", { className: "change-cat" }, c.category)), c.title && /* @__PURE__ */ React.createElement("div", { className: "change-title" }, c.title), /* @__PURE__ */ React.createElement("div", { className: "change-text" }, c.text)))), list.length === 0 && /* @__PURE__ */ React.createElement("li", { className: "change-item" }, /* @__PURE__ */ React.createElement("div", { className: "change-text" }, "No updates in this category yet."))));
  }
  window.LP_LIVE = LP_LIVE;
  window.LP_ChangesFeed = ChangesFeed;
  load();
  setTimeout(() => {
    if (!ready) load();
  }, 4e3);
})();
