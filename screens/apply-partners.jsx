/* global React, window */
"use strict";

// LandingPrep — "Apply to 500+ Universities" partner panel (CollegeDunia-style).
// Application-fee waivers / referral links are CONFIGURED by LandingPrep
// partnerships. Edit PARTNER_CONFIG below (or wire it to a backend feed later):
//   discountPct → fee waiver shown to the user
//   applyUrl    → your aggregator/affiliate referral link (defaults to the
//                 university's official site until a partnership is set up)
(function () {
  const { useState } = React;

  // Per-university partner overrides keyed by college id. Until you sign a
  // partnership, leave discountPct 0 and the Apply button points to the
  // official site. Add your referral link + waiver here to go live.
  const PARTNER_CONFIG = {
    "ucl": { discountPct: 0 }, "toronto": { discountPct: 0 }, "kings-college-london": { discountPct: 0 },
    "edinburgh": { discountPct: 0 }, "ubc": { discountPct: 0 }, "manchester": { discountPct: 0 },
    "mcgill": { discountPct: 0 }, "monash": { discountPct: 0 }, "melbourne": { discountPct: 0 },
    "sydney": { discountPct: 0 }, "tu-munich": { discountPct: 0 }, "trinity-college-dublin": { discountPct: 0 },
  };

  const COLOURS = ["#4F46E5", "#0ea5e9", "#16a34a", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777"];
  const initials = (name) => name.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const feeNum = (appFee) => { const m = String(appFee || "").match(/\d+/); return m ? parseInt(m[0], 10) : 0; };

  function ApplyPanel({ country, onOpenTab }) {
    const ALL = window.LP_COLLEGES || [];
    const [showAll, setShowAll] = useState(false);
    // Build the partner list: any configured university, else top universities
    // (optionally scoped to the page country), sorted by rank.
    let pool = ALL.filter((c) => (!country || country === "Any" || c.country === country));
    pool = pool.sort((a, b) => a.rank - b.rank);
    const rows = (showAll ? pool : pool.slice(0, 6)).map((c) => {
      const cfg = PARTNER_CONFIG[c.id] || {};
      const fee = feeNum(c.appFee);
      const pct = cfg.discountPct || 0;
      const discounted = pct > 0 ? Math.round(fee * (1 - pct / 100)) : fee;
      return { c, fee, pct, discounted, applyUrl: cfg.applyUrl || ("https://" + (c.website || "")) };
    });

    return (
      <div className="apply-panel">
        <div className="tool-card apply-head">
          <h2>🎓 Apply to {pool.length}+ Universities{country && country !== "Any" ? " in " + country : ""}</h2>
          <p className="tool-sub">Start your application and unlock exclusive application &amp; visa-fee waivers through LandingPrep partner universities. One profile, many applications.</p>
        </div>

        <div className="tool-card apply-table-card">
          <div className="apply-table">
            <div className="apply-row apply-thead">
              <div>University</div>
              <div className="apply-fee-h">Application fee</div>
              <div className="apply-act-h">Action</div>
            </div>
            {rows.map(({ c, fee, pct, discounted, applyUrl }) => (
              <div className="apply-row" key={c.id}>
                <div className="apply-uni">
                  <span className="apply-logo" style={{ background: COLOURS[(c.id.charCodeAt(0)) % COLOURS.length] }}>{initials(c.name)}</span>
                  <div>
                    <a className="apply-name" href={"/university/" + c.id + "/"}>{c.name}</a>
                    <div className="apply-loc">{c.city} · {c.country} · QS #{c.rank}</div>
                  </div>
                </div>
                <div className="apply-fee">
                  {pct > 0
                    ? <><span className="apply-pct">% </span><span className="apply-old">{fee ? "$" + fee : "—"}</span> <span className="apply-new">${discounted} ({pct}% off)</span></>
                    : <span className="apply-cur">{fee ? "$" + fee : "Free"}</span>}
                </div>
                <div className="apply-act">
                  <a className="apply-btn" href={applyUrl} target="_blank" rel="noopener noreferrer">Apply Now</a>
                </div>
              </div>
            ))}
          </div>
          {pool.length > 6 && (
            <div className="apply-more">
              <button className="tool-btn ghost" onClick={() => setShowAll((s) => !s)}>{showAll ? "Show less" : "Explore More →"}</button>
            </div>
          )}
        </div>

        <div className="tool-card apply-help">
          <h3>How applying through LandingPrep works</h3>
          <ol className="apply-steps">
            <li><strong>Shortlist</strong> with the free Profile Evaluation &amp; College Predictor.</li>
            <li><strong>Prepare</strong> your SOP, LOR and resume with our free builders.</li>
            <li><strong>Apply</strong> to partner universities here — fee waivers applied automatically where available.</li>
            <li><strong>Track</strong> every application, deadline and offer in My Applications.</li>
          </ol>
          <div className="apply-help-btns">
            <button className="tool-btn" onClick={() => onOpenTab && onOpenTab("onboard")}>🧭 Build my plan</button>
            <button className="tool-btn ghost" onClick={() => onOpenTab && onOpenTab("predictor")}>🏛️ Find my matches</button>
          </div>
          <p className="tool-note">Application-fee waivers and partner links are provided through LandingPrep university partnerships and may change. Always confirm fees on the official university site before paying. LandingPrep may earn a referral fee at no cost to you.</p>
        </div>
      </div>
    );
  }

  window.LP_ApplyPanel = ApplyPanel;
})();
