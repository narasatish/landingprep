/* global React, window */
"use strict";

// LandingPrep — College Predictor + comprehensive directory + detail view +
// compare + application tracker. Data lives in window.LP_COLLEGES /
// window.LP_COLLEGE_COUNTRY_INFO.
(function () {
  const { useState, useEffect } = React;

  const fmtUSD = (n) => n < 1000 ? "≈ tuition-free" : "$" + Math.round(n / 1000) + "k/yr";
  const parseLeadNum = (s) => { const m = String(s).match(/[\d.]+/); return m ? parseFloat(m[0]) : null; };
  const CI = () => window.LP_COLLEGE_COUNTRY_INFO || {};

  // ── Application tracker store (localStorage) ──────────────────────────────
  const APP_KEY = "lp_applications";
  const STAGES = ["Researching", "Preparing documents", "Applied", "Interview", "Admitted", "Rejected", "Enrolled"];
  function loadApps() { try { return JSON.parse(localStorage.getItem(APP_KEY) || "[]"); } catch (e) { return []; } }
  function saveApps(a) { try { localStorage.setItem(APP_KEY, JSON.stringify(a)); } catch (e) {} }
  function isSaved(id) { return loadApps().some(a => a.id === id); }
  function catToBucket(cat) { return cat === "safe" ? "Safety" : cat === "target" ? "Target" : cat ? "Dream" : "Considering"; }
  function addApp(c, cat) {
    const apps = loadApps();
    if (apps.some(a => a.id === c.id)) return apps;
    apps.unshift({ id: c.id, name: c.name, country: c.country, city: c.city, rank: c.rank, ielts: c.ielts, fee: c.feeNote, intakes: c.intakes, bucket: catToBucket(cat), stage: "Researching", deadline: "", notes: "", ts: 0 });
    saveApps(apps); return apps;
  }
  function removeApp(id) { const a = loadApps().filter(x => x.id !== id); saveApps(a); return a; }
  function updateApp(id, patch) { const a = loadApps().map(x => x.id === id ? { ...x, ...patch } : x); saveApps(a); return a; }

  const CAT_META = {
    safe:      { label: "✅ Safe",        cls: "cat-safe",   note: "Strong chance — your profile clears the bar comfortably." },
    target:    { label: "🎯 Target",      cls: "cat-target", note: "Good match — you meet the typical requirements." },
    reach:     { label: "🚀 Reach",       cls: "cat-reach",  note: "Ambitious — competitive, but worth a shot." },
    ambitious: { label: "🌟 Aspirational", cls: "cat-asp",   note: "A stretch on current scores — keep building your profile." },
  };

  // Profile-aware classification with a reason + confidence %.
  function classify(c, user) {
    const eMargin = user.test === "toefl" ? (user.score - c.toefl) / 12 : (user.score - c.ielts);
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
    const overBudget = user.budget && c.tuitionUSD > user.budget + 2000;
    return { cat, confidence: conf, reason: parts.join(" · "), overBudget };
  }

  // ── Compare table ─────────────────────────────────────────────────────────
  function CompareTable({ items, onClear }) {
    const rows = [
      ["QS Rank", c => "#" + c.rank], ["National rank", c => "#" + c.natRank], ["Type", c => c.type], ["Founded", c => c.founded],
      ["Tuition", c => c.feeNote], ["App fee", c => c.appFee], ["IELTS", c => c.ielts], ["TOEFL", c => c.toefl],
      ["PTE", c => c.pte], ["GRE", c => c.gre], ["Min GPA", c => c.gpa], ["Acceptance", c => c.acceptance + "%"],
      ["Intl students", c => c.intlPct + "%"], ["Intakes", c => c.intakes.join(", ")], ["Deadline", c => c.deadline],
      ["Scholarships", c => c.scholarship ? "✓" : "—"], ["Post-study work", c => (CI()[c.country] || {}).psw || "—"],
    ];
    return (
      <div className="compare-wrap tool-card">
        <div className="compare-head"><h3>⚖️ Compare ({items.length})</h3><button className="tool-btn ghost" onClick={onClear}>Clear</button></div>
        <div className="compare-scroll">
          <table className="compare-table">
            <thead><tr><th></th>{items.map(c => <th key={c.id}>{c.name}</th>)}</tr></thead>
            <tbody>{rows.map(([label, fn]) => <tr key={label}><td className="cmp-label">{label}</td>{items.map(c => <td key={c.id}>{fn(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    );
  }

  function Stat({ label, value }) { return <div><span>{label}</span><strong>{value}</strong></div>; }

  function CollegeCard({ c, cat, reason, confidence, overBudget, compared, onCompare }) {
    const [open, setOpen] = useState(false);
    const [saved, setSaved] = useState(isSaved(c.id));
    const ci = CI()[c.country] || {};
    const proc = (window.LP_COLLEGE_PROCESS || {})[c.country] || [];
    const toggleSave = () => { if (saved) { removeApp(c.id); setSaved(false); } else { addApp(c, cat); setSaved(true); } };
    const noGre = /optional|not/i.test(String(c.gre));
    return (
      <div className="college-card">
        <div className="cc-head">
          <div>
            <div className="cc-name">{c.name}</div>
            <div className="cc-loc">{c.city} · {c.country} · QS #{c.rank} · #{c.natRank} in {c.country}</div>
          </div>
          {cat && <span className={"cc-cat " + CAT_META[cat].cls}>{CAT_META[cat].label}</span>}
        </div>
        {reason && <div className="cc-reason">{reason}{confidence ? <span className="cc-conf"> · {confidence}% match</span> : null}</div>}
        <div className="cc-stats">
          <Stat label="IELTS" value={c.ielts} /><Stat label="TOEFL" value={c.toefl} /><Stat label="GRE" value={c.gre} />
          <Stat label="Tuition" value={fmtUSD(c.tuitionUSD)} /><Stat label="Accept" value={c.acceptance + "%"} />
        </div>
        <div className="cc-tags">
          {c.intakes.map(i => <span key={i} className="cc-tag">📅 {i}</span>)}
          {noGre && <span className="cc-tag good">✓ No GRE required</span>}
          {c.scholarship && <span className="cc-tag good">🎁 Scholarships</span>}
          {overBudget && <span className="cc-tag over">💰 Over budget</span>}
        </div>
        <div className="cc-btns">
          <label className="cc-compare"><input type="checkbox" checked={!!compared} onChange={() => onCompare && onCompare(c)} /> Compare</label>
          <button className={"cc-save" + (saved ? " saved" : "")} onClick={toggleSave}>{saved ? "✓ Saved" : "＋ Save to my list"}</button>
          <button className="cc-toggle" onClick={() => setOpen(o => !o)}>{open ? "Hide full details ▲" : "Full details ▼"}</button>
        </div>
        {open && (
          <div className="cc-details">
            <h4>Overview</h4>
            <div className="cc-grid">
              <Stat label="Type" value={c.type} /><Stat label="Founded" value={c.founded} />
              <Stat label="Intl students" value={c.intlPct + "%"} /><Stat label="Website" value={<a href={"https://" + c.website} target="_blank" rel="noopener noreferrer">{c.website}</a>} />
            </div>
            {c.strengths && <div className="cc-block"><strong>Known for:</strong> {c.strengths.join(" · ")}{c.alumni ? <> · <em>Alumni: {c.alumni}</em></> : null}</div>}

            <h4>Programs</h4>
            <div className="cc-block">{c.programs.join(" · ")}</div>

            <h4>Admission requirements</h4>
            <div className="cc-grid">
              <Stat label="IELTS" value={c.ielts} /><Stat label="TOEFL" value={c.toefl} /><Stat label="PTE" value={c.pte} /><Stat label="Duolingo" value={c.duolingo} />
              <Stat label="GRE" value={c.gre} /><Stat label="GMAT (MBA)" value={c.gmat || "—"} /><Stat label="Min GPA" value={c.gpa} /><Stat label="Work exp" value={c.workEx || "Not required"} />
            </div>
            {ci.checklist && <div className="cc-block"><strong>Documents needed ({c.country}):</strong> {ci.checklist.join(" · ")}</div>}

            <h4>Costs</h4>
            <div className="cc-block"><strong>Tuition:</strong> {c.feeNote} · <strong>Application fee:</strong> {c.appFee}{ci.living ? <> · <strong>Living cost:</strong> {ci.living}</> : null}</div>

            <h4>Intakes & deadlines</h4>
            <div className="cc-block"><strong>Intakes:</strong> {c.intakes.join(", ")} · <strong>Typical deadline:</strong> {c.deadline}{ci.deadlines ? <> · <span className="tool-note" style={{ display: "inline" }}>{ci.deadlines}</span></> : null}</div>

            {c.scholarship && (<><h4>Scholarships</h4><div className="cc-block">{c.scholarship}</div></>)}

            <h4>Class profile & selectivity</h4>
            <div className="cc-block"><strong>Acceptance rate:</strong> {c.acceptance}% · <strong>Profile:</strong> {c.classProfile}</div>

            {(ci.psw || ci.visa) && (<>
              <h4>After you graduate (work & visa)</h4>
              <div className="cc-grid">
                <Stat label="Post-study work" value={ci.psw || "—"} /><Stat label="Visa" value={ci.visa || "—"} />
                <Stat label="Work while studying" value={ci.work || "—"} /><Stat label="Dependents" value={ci.dependents || "—"} />
              </div>
            </>)}

            {proc.length > 0 && (<>
              <h4>Step-by-step admission process ({c.country})</h4>
              <ol className="cc-steps">{proc.map((s, i) => <li key={i}>{s}</li>)}</ol>
            </>)}
            <p className="tool-note">All figures are indicative — always confirm on the official university website ({c.website}).</p>
          </div>
        )}
      </div>
    );
  }

  function CollegePredictorPanel({ onNav, country: pageCountry }) {
    const ALL = window.LP_COLLEGES || [];
    const COUNTRIES = window.LP_COLLEGE_COUNTRIES || [];
    const [test, setTest] = useState("ielts");
    const [score, setScore] = useState("");
    const [gpa, setGpa] = useState("");
    const [country, setCountry] = useState(pageCountry || "Any");
    useEffect(() => { if (pageCountry) { setCountry(pageCountry); setResult(null); } }, [pageCountry]);
    const [budget, setBudget] = useState("");
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("rank");
    const [noGre, setNoGre] = useState(false);
    const [scholarOnly, setScholarOnly] = useState(false);
    const [result, setResult] = useState(null);
    const [compare, setCompare] = useState([]); // array of college objects

    const toggleCompare = (c) => setCompare(prev => prev.some(x => x.id === c.id) ? prev.filter(x => x.id !== c.id) : (prev.length >= 3 ? prev : [...prev, c]));
    const isCompared = (id) => compare.some(x => x.id === id);

    const filterPool = (pool) => pool.filter(c =>
      (country === "Any" || c.country === country) &&
      (!noGre || /optional|not/i.test(String(c.gre))) &&
      (!scholarOnly || !!c.scholarship) &&
      (!query.trim() || (c.programs.join(" ") + " " + (c.strengths || []).join(" ") + " " + c.name).toLowerCase().includes(query.trim().toLowerCase()))
    );
    const sortFn = (a, b) => sort === "fees" ? a.tuitionUSD - b.tuitionUSD : sort === "accept" ? b.acceptance - a.acceptance : a.rank - b.rank;

    const predict = (e) => {
      e && e.preventDefault();
      const s = parseFloat(score);
      const user = { test, score: isNaN(s) ? (test === "toefl" ? 80 : 6.5) : s, gpa: parseFloat(gpa) || 0, budget: parseFloat(budget) || 0 };
      const buckets = { safe: [], target: [], reach: [], ambitious: [] };
      filterPool(ALL).forEach(c => { const r = classify(c, user); buckets[r.cat].push({ c, ...r }); });
      Object.keys(buckets).forEach(k => buckets[k].sort((a, b) => sortFn(a.c, b.c)));
      setResult(buckets);
    };
    const reset = () => setResult(null);
    const browseList = filterPool(ALL).slice().sort(sortFn);

    return (
      <div className="college-panel">
        <form className="tool-card" onSubmit={predict}>
          <h2>🎓 College Predictor{country !== "Any" ? " — " + country : ""}</h2>
          <p className="tool-sub">Enter your profile to see Safe / Target / Reach universities {country !== "Any" ? "in " + country : ""} — with full details, fees, scholarships, deadlines, class profiles and the complete admission process. Switch country above to explore another destination.</p>
          <div className="tool-row">
            <label>Test
              <select value={test} onChange={e => setTest(e.target.value)}><option value="ielts">IELTS</option><option value="toefl">TOEFL iBT</option></select>
            </label>
            <label>Your score
              <input type="number" step={test === "toefl" ? 1 : 0.5} min="0" max={test === "toefl" ? 120 : 9} value={score} onChange={e => setScore(e.target.value)} placeholder={test === "toefl" ? "e.g. 100" : "e.g. 7.0"} />
            </label>
            <label>GPA (out of 4)
              <input type="number" step="0.1" min="0" max="4" value={gpa} onChange={e => setGpa(e.target.value)} placeholder="optional" />
            </label>
            <label>Budget (USD/yr)
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="optional" />
            </label>
          </div>
          <div className="tool-row">
            <label>Search program / keyword
              <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. data science, MBA, AI" />
            </label>
            <label>Sort by
              <select value={sort} onChange={e => setSort(e.target.value)}><option value="rank">Ranking</option><option value="fees">Lowest fees</option><option value="accept">Highest acceptance</option></select>
            </label>
            <label className="chk"><input type="checkbox" checked={noGre} onChange={e => setNoGre(e.target.checked)} /> No GRE required</label>
            <label className="chk"><input type="checkbox" checked={scholarOnly} onChange={e => setScholarOnly(e.target.checked)} /> Has scholarships</label>
          </div>
          <div className="tool-row btns">
            <button className="tool-btn" type="submit">🔮 Predict my colleges</button>
            {result && <button type="button" className="tool-btn ghost" onClick={reset}>Browse all instead</button>}
          </div>
        </form>

        {compare.length >= 2 && <CompareTable items={compare} onClear={() => setCompare([])} />}

        {result ? (
          <>
            {["safe", "target", "reach", "ambitious"].map(k => result[k].length > 0 && (
              <div className="college-bucket" key={k}>
                <div className="cb-head"><h3>{CAT_META[k].label} <span>({result[k].length})</span></h3><p>{CAT_META[k].note}</p></div>
                {result[k].map(({ c, reason, confidence, overBudget }) => <CollegeCard key={c.id} c={c} cat={k} reason={reason} confidence={confidence} overBudget={overBudget} compared={isCompared(c.id)} onCompare={toggleCompare} />)}
              </div>
            ))}
            {["safe", "target", "reach", "ambitious"].every(k => result[k].length === 0) && (
              <div className="tool-card"><p className="tool-sub">No colleges matched — widen your filters or score.</p></div>
            )}
          </>
        ) : (
          <div className="college-bucket">
            <div className="cb-head"><h3>Top universities {country !== "Any" ? "in " + country : "worldwide"} <span>({browseList.length})</span></h3>
              <p>Browse complete details — or enter your profile above to predict your fit. Tick <em>Compare</em> on up to 3 to compare side by side.</p></div>
            {browseList.length === 0 ? <div className="tool-card"><p className="tool-sub">No colleges matched your filters.</p></div>
              : browseList.map(c => <CollegeCard key={c.id} c={c} compared={isCompared(c.id)} onCompare={toggleCompare} />)}
          </div>
        )}
        <div className="tools-foot">
          <a className="tool-btn ghost" onClick={() => onNav && onNav("exam-prep")}>← Practise for your entrance exam</a>
        </div>
      </div>
    );
  }
  window.LP_CollegePredictorPanel = CollegePredictorPanel;

  // ── My Applications tracker ───────────────────────────────────────────────
  const BUCKETS = ["Dream", "Target", "Safety", "Considering"];
  const BUCKET_META = { Dream: "🌟 Dream", Target: "🎯 Target", Safety: "✅ Safety", Considering: "🔖 Considering" };
  function ApplicationsPanel({ onNav, onOpenTab }) {
    const [apps, setApps] = useState(loadApps);
    const [remindOn, setRemindOn] = useState(() => { try { return localStorage.getItem("lp_deadline_reminders") === "1"; } catch (e) { return false; } });
    const set = (id, patch) => setApps(updateApp(id, patch));
    const del = (id) => setApps(removeApp(id));
    const goPredictor = () => { if (onOpenTab) onOpenTab("predictor"); else if (onNav) onNav("colleges"); };

    const daysLeft = (d) => Math.ceil((new Date(d + "T00:00:00").getTime() - Date.now()) / 86400000);
    const withDeadlines = apps.filter((a) => a.deadline).sort((x, y) => String(x.deadline).localeCompare(String(y.deadline)));

    // Download a .ics calendar event for one application deadline.
    const addToCalendar = (a) => {
      const dt = (a.deadline || "").replace(/-/g, "");
      const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//LandingPrep//Applications//EN", "BEGIN:VEVENT",
        "UID:" + a.id + "@landingprep", "DTSTART;VALUE=DATE:" + dt, "DTEND;VALUE=DATE:" + dt,
        "SUMMARY:" + (a.name || "University") + " — application deadline",
        "DESCRIPTION:" + [a.country, a.bucket, "Apply via LandingPrep"].filter(Boolean).join(" · "),
        "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", "DESCRIPTION:Application deadline in 1 week", "END:VALARM",
        "END:VEVENT", "END:VCALENDAR"].join("\r\n");
      try {
        const blob = new Blob([lines], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url; link.download = (a.name || "deadline").replace(/\W+/g, "-").toLowerCase() + ".ics";
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (e) {}
    };

    // Opt into browser deadline reminders.
    const enableReminders = async () => {
      try {
        if (!("Notification" in window)) { alert("Your browser doesn't support notifications."); return; }
        let p = Notification.permission;
        if (p !== "granted") p = await Notification.requestPermission();
        if (p === "granted") {
          localStorage.setItem("lp_deadline_reminders", "1"); setRemindOn(true);
          const soon = withDeadlines.filter((a) => { const d = daysLeft(a.deadline); return d >= 0 && d <= 30; });
          new Notification("✅ Deadline reminders on", { body: soon.length ? soon.length + " deadline(s) within 30 days — we'll nudge you when you open LandingPrep." : "We'll remind you here as your deadlines approach." });
        }
      } catch (e) {}
    };

    // Fire a one-per-day nudge for deadlines within 7 days, if enabled.
    useEffect(() => {
      if (!remindOn || !("Notification" in window) || Notification.permission !== "granted") return;
      try {
        const today = new Date().toISOString().slice(0, 10);
        if (localStorage.getItem("lp_deadline_nudged") === today) return;
        const urgent = withDeadlines.filter((a) => { const d = daysLeft(a.deadline); return d >= 0 && d <= 7; });
        if (urgent.length) {
          new Notification("⏰ Deadline approaching", { body: urgent.map((a) => `${a.name} (${daysLeft(a.deadline)}d)`).slice(0, 3).join(", ") });
          localStorage.setItem("lp_deadline_nudged", today);
        }
      } catch (e) {}
    }, [remindOn, apps.length]);
    if (!apps.length) {
      return (
        <div className="tool-card">
          <h2>📋 My Applications</h2>
          <p className="tool-sub">Your shortlist is empty. Open the <strong>College Predictor</strong>, find your matches, and tap <em>“＋ Save to my list”</em> — they'll appear here so you can track deadlines and stages.</p>
          <button className="tool-btn" onClick={goPredictor}>🏛️ Go to College Predictor</button>
        </div>
      );
    }
    const applied = apps.filter(a => ["Applied", "Interview", "Admitted", "Enrolled"].includes(a.stage)).length;
    const admitted = apps.filter(a => ["Admitted", "Enrolled"].includes(a.stage)).length;
    return (
      <div className="apps-panel">
        <div className="tool-card">
          <h2>📋 My Applications</h2>
          <p className="tool-sub">Track every university from shortlist to offer. Saved on this device.</p>
          <div className="apps-summary">
            <div className="apps-stat"><span>{apps.length}</span>saved</div>
            <div className="apps-stat"><span>{applied}</span>applied</div>
            <div className="apps-stat"><span>{admitted}</span>admitted</div>
          </div>
        </div>

        <div className="tool-card apps-deadlines">
          <div className="apps-dl-head">
            <h3>⏰ Upcoming deadlines</h3>
            <button className={"tool-btn ghost" + (remindOn ? " on" : "")} onClick={enableReminders}>{remindOn ? "🔔 Reminders on" : "🔔 Enable reminders"}</button>
          </div>
          {withDeadlines.length === 0
            ? <p className="tool-sub">No deadlines set yet — add a deadline date to any application below, then export it to your calendar.</p>
            : (
              <ul className="apps-dl-list">
                {withDeadlines.map((a) => {
                  const d = daysLeft(a.deadline);
                  const cls = d < 0 ? "past" : d <= 14 ? "soon" : "ok";
                  return (
                    <li key={a.id} className={"apps-dl-item " + cls}>
                      <span className="apps-dl-name">{a.name}</span>
                      <span className="apps-dl-date">{a.deadline}</span>
                      <span className="apps-dl-days">{d < 0 ? "passed" : d === 0 ? "today" : d + " days"}</span>
                      <button className="apps-dl-cal" title="Add to calendar (.ics)" onClick={() => addToCalendar(a)}>📅 Add</button>
                    </li>
                  );
                })}
              </ul>
            )}
        </div>
        {BUCKETS.map(b => {
          const list = apps.filter(a => a.bucket === b);
          if (!list.length) return null;
          return (
            <div className="apps-bucket" key={b}>
              <h3>{BUCKET_META[b]} <span>({list.length})</span></h3>
              {list.map(a => (
                <div className="app-card" key={a.id}>
                  <div className="app-head">
                    <div><div className="app-name">{a.name}</div><div className="app-loc">{a.city} · {a.country} · IELTS {a.ielts} · {a.fee}</div></div>
                    <button className="err-x" title="Remove" onClick={() => del(a.id)}>✕</button>
                  </div>
                  <div className="app-controls">
                    <label>Bucket
                      <select value={a.bucket} onChange={e => set(a.id, { bucket: e.target.value })}>{BUCKETS.map(x => <option key={x} value={x}>{x}</option>)}</select>
                    </label>
                    <label>Stage
                      <select value={a.stage} onChange={e => set(a.id, { stage: e.target.value })}>{STAGES.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </label>
                    <label>Deadline
                      <input type="date" value={a.deadline || ""} onChange={e => set(a.id, { deadline: e.target.value })} />
                    </label>
                  </div>
                  <textarea className="app-notes" rows={2} placeholder="Notes (program, scholarship, contact…)" value={a.notes || ""} onChange={e => set(a.id, { notes: e.target.value })} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  }
  window.LP_ApplicationsPanel = ApplicationsPanel;
})();
