/* global React, window */
"use strict";

// LandingPrep — Smart Error Log ("Mistake Notebook"). Auto-collects every
// wrong objective answer across all mock tests (saved to lp_errors by the
// mock-test runner), with filters, inline re-try, and mastery tracking.
(function () {
  const { useState } = React;

  function load() { try { return JSON.parse(localStorage.getItem("lp_errors") || "[]"); } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem("lp_errors", JSON.stringify(a)); } catch (e) {} }
  const fmt = (a) => Array.isArray(a) ? a.join(", ") : String(a == null || a === "" ? "—" : a);
  const TYPE_LABEL = { mcq: "Multiple choice", mcq_multi: "Multi-select", tfng: "True/False/NG", yng: "Yes/No/NG", fill: "Fill the gap", form_field: "Form completion", sent_fill: "Sentence completion", match_heading: "Match heading" };

  function ErrorItem({ item, onUpdate, onRemove }) {
    const [picked, setPicked] = useState(null);
    const mastered = (item.mastered || 0) >= 1;
    const isChoice = ["mcq", "tfng", "yng"].includes(item.type) && Array.isArray(item.options) && item.options.length;
    const tryAns = (opt) => {
      if (picked != null) return;
      setPicked(opt);
      if (opt === item.answer) onUpdate(item.key, { mastered: (item.mastered || 0) + 1 });
    };
    return (
      <div className={"err-item" + (mastered ? " mastered" : "")}>
        <div className="err-top">
          <span className="err-badges">
            <span className="err-badge">{(item.examName || item.exam || "").toUpperCase()}</span>
            <span className="err-badge sec">{item.section}</span>
            <span className="err-badge type">{TYPE_LABEL[item.type] || item.type}</span>
            {mastered && <span className="err-badge done">✓ Mastered</span>}
          </span>
          <button className="err-x" title="Remove" onClick={() => onRemove(item.key)}>✕</button>
        </div>
        <div className="err-q">{item.text}</div>
        {isChoice && picked == null ? (
          <div className="err-options">
            {item.options.map((o, i) => <button key={i} className="err-opt" onClick={() => tryAns(o)}>{o}</button>)}
          </div>
        ) : (
          <div className="err-answers">
            {picked != null && <div className={"err-row " + (picked === item.answer ? "good" : "bad")}>You picked: <strong>{fmt(picked)}</strong> {picked === item.answer ? "✓ correct!" : "✗"}</div>}
            <div className="err-row"><span>Your original answer:</span> <strong className="bad-text">{fmt(item.given)}</strong></div>
            <div className="err-row"><span>Correct answer:</span> <strong className="good-text">{fmt(item.answer)}</strong></div>
            {item.explanation && <div className="err-exp"><strong>Why:</strong> {item.explanation}</div>}
          </div>
        )}
        <div className="err-actions">
          {!mastered && <button className="btn btn-sm" onClick={() => onUpdate(item.key, { mastered: 1 })}>Mark mastered</button>}
          {mastered && <button className="btn btn-sm" onClick={() => onUpdate(item.key, { mastered: 0 })}>Revise again</button>}
        </div>
      </div>
    );
  }

  function ErrorLogPanel({ exams }) {
    const [errs, setErrs] = useState(load);
    const [examF, setExamF] = useState("all");
    const [hideMastered, setHideMastered] = useState(true);
    if (!errs.length) return null;

    const update = (key, patch) => { const next = errs.map(e => e.key === key ? { ...e, ...patch } : e); setErrs(next); save(next); };
    const remove = (key) => { const next = errs.filter(e => e.key !== key); setErrs(next); save(next); };
    const clearMastered = () => { const next = errs.filter(e => !(e.mastered >= 1)); setErrs(next); save(next); };

    const examIds = [...new Set(errs.map(e => e.exam))];
    let shown = errs.filter(e => examF === "all" || e.exam === examF);
    if (hideMastered) shown = shown.filter(e => !(e.mastered >= 1));
    const masteredCount = errs.filter(e => e.mastered >= 1).length;

    return (
      <section className="progress-section">
        <div className="history-header">
          <h2 className="section-heading" style={{ margin: 0 }}>📓 Mistake Notebook</h2>
          <span style={{ color: "var(--ink-3)", fontSize: 14 }}>{errs.length} saved · {masteredCount} mastered</span>
        </div>
        <p style={{ color: "var(--ink-3)", marginTop: -2, fontSize: 14 }}>Every question you got wrong, in one place. Re-try it, then mark it mastered. Keep this empty and you're test-ready.</p>
        <div className="err-filters">
          <select value={examF} onChange={e => setExamF(e.target.value)}>
            <option value="all">All exams</option>
            {examIds.map(id => { const ex = (exams || []).find(x => x.id === id); return <option key={id} value={id}>{ex ? ex.name : id}</option>; })}
          </select>
          <label className="err-check"><input type="checkbox" checked={hideMastered} onChange={e => setHideMastered(e.target.checked)} /> Hide mastered</label>
          {masteredCount > 0 && <button className="btn btn-sm" onClick={clearMastered}>Clear mastered</button>}
        </div>
        {shown.length === 0 ? (
          <div className="err-empty">🎉 Nothing to revise here — great work!</div>
        ) : (
          <div className="err-list">{shown.map(it => <ErrorItem key={it.key} item={it} onUpdate={update} onRemove={remove} />)}</div>
        )}
      </section>
    );
  }

  window.LP_ErrorLogPanel = ErrorLogPanel;
})();
