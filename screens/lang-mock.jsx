/* global React, window */
"use strict";
// LandingPrep — German/French mock-test runner (A1, Goethe/DELF-style). Reading,
// Grammar & Vocabulary, and Listening (spoken via the live native voice). Scored.
(function () {
  const { useState } = React;
  const TTS = { german: "de", french: "fr" };
  function speak(text, code) { try { if (window.LP_TTS && window.LP_TTS.speakOne) window.LP_TTS.speakOne(text, "Kore", null, code); } catch (e) {} }

  function LangMock({ langId }) {
    const mocks = (window.LP_LANG_MOCKS && window.LP_LANG_MOCKS[langId]) || [];
    const code = TTS[langId] || "de";
    const name = langId === "french" ? "French" : "German";
    const [active, setActive] = useState(null);
    const [ans, setAns] = useState({});
    const [done, setDone] = useState(false);

    if (!active) {
      return (
        <div className="tool-card">
          <h3>{name} mock tests</h3>
          <p className="tool-sub">Full A1 practice tests — Reading, Grammar &amp; Vocabulary, and Listening (with the natural voice). Instant scoring and review.</p>
          <div className="deck-grid">
            {mocks.map((m) => (
              <button key={m.id} className="deck-card" onClick={() => { setActive(m); setAns({}); setDone(false); }}>
                <span className="deck-card-emoji">📝</span>
                <span className="deck-card-name">{m.title.replace(/\s*\(.*\)/, "")}</span>
                <span className="deck-card-meta">{m.sections.reduce((n, s) => n + s.questions.length, 0)} questions →</span>
              </button>
            ))}
          </div>
          {!mocks.length && <p className="tool-note" style={{ marginTop: 10 }}>More tests coming soon.</p>}
          <p className="tool-note" style={{ marginTop: 10 }}>💡 Tip: study the Learn tab first, then take a mock under timed conditions.</p>
        </div>
      );
    }

    const flat = [];
    active.sections.forEach((s, si) => s.questions.forEach((q, qi) => flat.push({ key: si + "_" + qi, q })));
    const totalQ = flat.length;
    const answered = Object.keys(ans).length;
    const score = flat.reduce((n, f) => n + (ans[f.key] === f.q.answer ? 1 : 0), 0);
    const pct = Math.round((score / totalQ) * 100);

    return (
      <div>
        <div className="lang-mock-bar">
          <a className="deck-back" onClick={() => setActive(null)}>← All mock tests</a>
          <span className="deck-title-mini">{active.title}</span>
        </div>
        {!done && <div className="tool-note" style={{ marginBottom: 12 }}>📝 {totalQ} questions · about {active.minutes} minutes. Answer all, then submit.</div>}
        {active.sections.map((s, si) => (
          <div className="tool-card" key={si}>
            <h3>{s.title}</h3>
            {s.intro && <p className="tool-sub">{s.intro}</p>}
            {s.passage && <div className="lang-mock-passage">{s.passage}</div>}
            {s.questions.map((q, qi) => {
              const key = si + "_" + qi;
              return (
                <div className="lang-q" key={qi}>
                  <div className="lang-q-prompt">
                    {s.type === "listening" && <button className="lang-say" title="Play audio" onClick={() => speak(q.audio, code)}>▶</button>}
                    {" "}{qi + 1}. {q.q}
                  </div>
                  <div className="lang-opts">
                    {q.options.map((o, oi) => {
                      const chosen = ans[key] === oi;
                      const cls = done ? (oi === q.answer ? " correct" : (chosen ? " wrong" : "")) : (chosen ? " chosen" : "");
                      return <button key={oi} className={"lang-opt" + cls} disabled={done} onClick={() => setAns(Object.assign({}, ans, { [key]: oi }))}>{o}</button>;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {!done
          ? <button className="btn btn-primary" disabled={answered < totalQ} onClick={() => { setDone(true); try { window.scrollTo(0, 0); } catch (e) {} }}>
              {answered < totalQ ? `Answer all questions (${answered}/${totalQ})` : "Submit & score →"}
            </button>
          : <div className="lang-result">
              Your score: <strong>{score}/{totalQ} ({pct}%)</strong> — {pct >= 80 ? "excellent — A1 level secured! 🎉" : pct >= 60 ? "good — review the answers in red and retake." : "keep studying the Learn tab, then retake."}
              <button className="btn" style={{ marginLeft: 10 }} onClick={() => { setAns({}); setDone(false); }}>Retake</button>
              <button className="btn" onClick={() => setActive(null)}>Other tests</button>
            </div>}
      </div>
    );
  }

  window.LP_LangMock = LangMock;
})();
