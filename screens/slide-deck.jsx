/* global React, window */
"use strict";
// LandingPrep — "Prep Lessons": PPT-style slide viewer + deck picker.
(function () {
  const { useState, useEffect } = React;

  function Slide({ s, idx, total }) {
    return (
      <div className="slide">
        <div className="slide-num">Slide {idx + 1} / {total}</div>
        <div className="slide-emoji">{s.emoji || "📌"}</div>
        <h2 className="slide-title">{s.title}</h2>
        <ul className="slide-points">{(s.points || []).map((p, i) => <li key={i}>{p}</li>)}</ul>
        {s.example && <div className="slide-example"><strong>{s.example.label}: </strong>{s.example.text}</div>}
        {s.tip && <div className="slide-tip">💡 <strong>Tip:</strong> {s.tip}</div>}
        {s.warn && <div className="slide-warn">⚠️ {s.warn}</div>}
      </div>
    );
  }

  function DeckViewer({ deck, onExit }) {
    const [i, setI] = useState(0);
    const total = deck.slides.length;
    const next = () => setI((x) => Math.min(total - 1, x + 1));
    const prev = () => setI((x) => Math.max(0, x - 1));
    useEffect(() => {
      const k = (e) => { if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") prev(); };
      window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
    }, [total]);
    useEffect(() => { try { document.title = deck.title + " | LandingPrep"; } catch (e) {} }, []);
    return (
      <div className="deck-stage">
        <div className="deck-bar">
          <a className="deck-back" onClick={onExit}>← All lessons</a>
          <span className="deck-title-mini">{deck.emoji} {deck.examName} · {deck.section}</span>
        </div>
        <div className="deck-progress"><div className="deck-progress-fill" style={{ width: ((i + 1) / total * 100) + "%" }} /></div>
        <Slide s={deck.slides[i]} idx={i} total={total} />
        <div className="deck-controls">
          <button className="btn" disabled={i === 0} onClick={prev}>← Back</button>
          <div className="deck-dots">{deck.slides.map((_, d) => <span key={d} className={"deck-dot" + (d === i ? " on" : "")} onClick={() => setI(d)} />)}</div>
          {i < total - 1
            ? <button className="btn btn-primary" onClick={next}>Next →</button>
            : <button className="btn btn-primary" onClick={onExit}>Finish ✓</button>}
        </div>
      </div>
    );
  }

  function Lessons({ onNav }) {
    const plan = window.LP_SLIDE_DECK_PLAN || [];
    const decks = window.LP_SLIDE_DECKS || {};
    const [openId, setOpenId] = useState(null);
    useEffect(() => {
      try {
        document.title = "Free Exam Prep Lessons — Tips, Tricks & Strategy Slides | LandingPrep";
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Free slide lessons for IELTS, TOEFL, PTE, GRE, GMAT, CELPIP & Duolingo — tips, tricks, traps and section-by-section strategy. Learn first, then practise with free mocks.");
      } catch (e) {}
    }, []);

    if (openId && decks[openId]) {
      return (<><window.LP_TopBar current="lessons" onNav={onNav} /><main className="tools-shell"><DeckViewer deck={decks[openId]} onExit={() => setOpenId(null)} /></main><window.LP_Footer /></>);
    }
    return (
      <>
        <window.LP_TopBar current="lessons" onNav={onNav} />
        <main className="tools-shell">
          <header className="tools-hero">
            <h1>📊 Exam Prep Lessons</h1>
            <p>Quick, visual slide lessons — tips, tricks and traps for each section. Learn the strategy here, then practise with our free mocks.</p>
          </header>
          {plan.map((ex) => (
            <div className="tool-card" key={ex.exam}>
              <h3>{ex.emoji} {ex.examName}</h3>
              <div className="deck-grid">
                {ex.decks.map((d, di) => {
                  const ready = d.ready && decks[d.id];
                  return (
                    <button key={di} className={"deck-card" + (ready ? "" : " soon")} disabled={!ready} onClick={() => ready && setOpenId(d.id)}>
                      <span className="deck-card-emoji">{d.emoji}</span>
                      <span className="deck-card-name">{d.section}</span>
                      <span className="deck-card-meta">{ready ? (decks[d.id].slides.length + " slides →") : "Coming soon"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_Lessons = Lessons;
})();
