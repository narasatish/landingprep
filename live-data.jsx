/* global React, window, fetch, localStorage */
"use strict";

// LandingPrep — LIVE DATA layer. Single source of truth for content that
// changes over time (exam fees, exam-pattern notes, and a site-wide "what's
// changed" feed). Fetches /api/live (served from live-content.json) at runtime
// and caches it, so editing ONE file updates fees / patterns / changes across
// every page with no rebuild and no redeploy. Always falls back to bundled
// defaults + the last cached copy, so the site works fully offline too.
(function () {
  const CACHE_KEY = "lp_live_cache_v1";

  // Bundled fallback so pages render correct values even with no backend.
  const FALLBACK = {
    updated: "2026-05-31",
    examFees: {},
    examPatternNotes: {},
    changes: [],
  };

  let DATA = FALLBACK;
  let ready = false;
  const subs = new Set();

  // Seed from localStorage cache immediately (instant + offline-safe).
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && typeof cached === "object") { DATA = Object.assign({}, FALLBACK, cached); }
  } catch (e) {}

  function notify() { subs.forEach((fn) => { try { fn(DATA); } catch (e) {} }); }

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
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(DATA)); } catch (e) {}
          notify();
          return;
        }
      } catch (e) { /* try next */ }
    }
    ready = true; // backend offline — keep cached/fallback
    notify();
  }

  // Merge the editable change-feed with the structured per-country / per-exam
  // change notes already in the data files, de-duplicated, newest first.
  function allChanges() {
    const out = [];
    (DATA.changes || []).forEach((c) => out.push({ date: c.date || "", category: c.category || "Update", scope: c.scope || "", title: c.title || "", text: c.text || "" }));
    (window.LP_COUNTRY_DATA || []).forEach((co) => {
      (co.changes || []).forEach((ch) => out.push({ date: String(ch.d || ""), category: "Country", scope: co.name, title: "", text: ch.t || "" }));
    });
    const seen = new Set();
    const dedup = out.filter((c) => { const k = (c.scope + "|" + c.text).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
    dedup.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return dedup;
  }

  const LP_LIVE = {
    isReady: () => ready,
    data: () => DATA,
    updatedAt: () => DATA.updated || null,
    examFee: (id) => (DATA.examFees && DATA.examFees[id]) || null,
    patternNote: (id) => (DATA.examPatternNotes && DATA.examPatternNotes[id]) || null,
    changes: allChanges,
    refresh: load,
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
    // React hook: re-renders the component when live data arrives/updates.
    useLive: function () {
      const [, setN] = React.useState(0);
      React.useEffect(() => LP_LIVE.subscribe(() => setN((n) => n + 1)), []);
      return DATA;
    },
  };

  // ── Site-wide "Recent changes / What's new" feed component ─────────────────
  function ChangesFeed({ limit, scope, title, compact }) {
    LP_LIVE.useLive();
    const [cat, setCat] = React.useState("All");
    let list = LP_LIVE.changes();
    if (scope) list = list.filter((c) => c.scope === scope);
    const cats = ["All", ...Array.from(new Set(list.map((c) => c.category)))];
    if (cat !== "All") list = list.filter((c) => c.category === cat);
    if (limit) list = list.slice(0, limit);
    const icon = (c) => ({ Visa: "🛂", Exam: "📝", Fees: "💰", Admission: "🎓", Country: "🌍", Update: "🆕" }[c.category] || "🆕");
    return (
      <div className={"changes-feed" + (compact ? " compact" : "")}>
        <div className="changes-head">
          <div>
            <h3>{title || "🆕 Recent changes & updates"}</h3>
            {LP_LIVE.updatedAt() && <span className="changes-updated">Last updated {LP_LIVE.updatedAt()}</span>}
          </div>
          {!compact && cats.length > 2 && (
            <div className="changes-cats">
              {cats.map((c) => <button key={c} className={"changes-cat" + (cat === c ? " active" : "")} onClick={() => setCat(c)}>{c}</button>)}
            </div>
          )}
        </div>
        <ul className="changes-list">
          {list.map((c, i) => (
            <li key={i} className="change-item">
              <span className="change-ic" aria-hidden>{icon(c)}</span>
              <div className="change-body">
                <div className="change-meta"><span className="change-date">{c.date}</span>{c.scope && <span className="change-scope">{c.scope}</span>}<span className="change-cat">{c.category}</span></div>
                {c.title && <div className="change-title">{c.title}</div>}
                <div className="change-text">{c.text}</div>
              </div>
            </li>
          ))}
          {list.length === 0 && <li className="change-item"><div className="change-text">No updates in this category yet.</div></li>}
        </ul>
      </div>
    );
  }

  window.LP_LIVE = LP_LIVE;
  window.LP_ChangesFeed = ChangesFeed;
  // Kick off the fetch immediately (and again shortly after, in case the backend
  // is still warming up on a cold start).
  load();
  setTimeout(() => { if (!ready) load(); }, 4000);
})();
