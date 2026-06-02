/* global React, window */
"use strict";
// LandingPrep — IELTS/TOEFL Vocabulary hub. Topic word lists with definitions,
// example sentences, higher-band synonyms and 🔊 pronunciation. Targets high-traffic
// "IELTS vocabulary / topic vocabulary / TOEFL words" searches.
(function () {
  const { useState, useEffect } = React;

  function say(text) { try { if (window.LP_TTS && window.LP_TTS.speakOne) window.LP_TTS.speakOne(text, "Kore", null, "en"); else if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(text); u.lang = "en-US"; window.speechSynthesis.speak(u); } } catch (e) {} }

  function Vocabulary({ onNav, initialTopic }) {
    const data = window.LP_VOCAB || {};
    const order = window.LP_VOCAB_ORDER || Object.keys(data);
    const [topic, setTopic] = useState(initialTopic && data[initialTopic] ? initialTopic : (order[0] || ""));
    const [q, setQ] = useState("");
    const t = data[topic];

    useEffect(() => {
      try {
        document.title = "Free IELTS & TOEFL Vocabulary — Topic Word Lists with Examples | LandingPrep";
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Free IELTS & TOEFL vocabulary by topic — education, technology, environment, health, work, crime, globalisation, Band 9 linking words and TOEFL academic words. Definitions, examples, synonyms and audio.");
      } catch (e) {}
    }, []);

    const words = t ? (q.trim() ? t.words.filter((w) => (w.w + " " + w.def).toLowerCase().includes(q.trim().toLowerCase())) : t.words) : [];

    return (
      <>
        <window.LP_TopBar current="learn" onNav={onNav} />
        <main className="tools-shell tools-shell-wide">
          <header className="tools-hero">
            <h1>📖 IELTS &amp; TOEFL Vocabulary</h1>
            <p>Topic word lists that lift your Lexical Resource band — with clear definitions, example sentences, higher-band synonyms and 🔊 audio. 100% free.</p>
          </header>
          <div className="tools-groups">
            {order.map((id) => (
              <button key={id} className={"tools-group" + (topic === id ? " active" : "")} onClick={() => { setTopic(id); setQ(""); }}>
                {(data[id].emoji || "•") + " " + data[id].title}
              </button>
            ))}
          </div>
          {t && (
            <div className="tool-card">
              <p className="tool-sub">{t.intro}</p>
              <input className="lc-input" style={{ width: "100%", marginBottom: 12, boxSizing: "border-box" }} placeholder={"Search " + t.title + " words…"} value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="lang-vocab">
                {words.map((w, i) => (
                  <div className="lang-vrow vocab-row" key={i}>
                    <button className="lang-say" title="Hear it" onClick={() => say(w.w)}>🔊</button>
                    <div className="lang-w">
                      <strong>{w.w}</strong>
                      <span>{w.pos ? w.pos + " · " : ""}{w.def}</span>
                    </div>
                    <div className="lang-ex">“{w.ex}”{w.syn ? <span className="vocab-syn"> ↗ {w.syn}</span> : null}</div>
                  </div>
                ))}
              </div>
              {!words.length && <p className="tool-note">No words match “{q}”.</p>}
            </div>
          )}
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_Vocabulary = Vocabulary;
})();
