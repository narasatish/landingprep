/* global React, window */
"use strict";
// LandingPrep — Language Learning Hub (German flagship + French). Reuses the live
// natural voice (LP_TTS.speakOne) for pronunciation and the shared card styles.
(function () {
  const { useState, useEffect, useRef } = React;

  function pronounce(text) {
    try {
      if (window.LP_TTS && window.LP_TTS.speakOne) window.LP_TTS.speakOne(text, "Kore");
      else if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text); u.rate = 0.9; window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }

  function setSEO(title, desc) {
    try {
      document.title = title;
      let m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", desc);
    } catch (e) {}
  }

  function LearnView({ lang }) {
    const [open, setOpen] = useState(lang.course[0] ? lang.course[0].id : null);
    return (
      <div className="lang-units">
        {lang.course.map((u) => (
          <div key={u.id} className={"topic-card" + (open === u.id ? " is-open" : "")}>
            <div className="tc-head" onClick={() => setOpen(open === u.id ? null : u.id)}>
              <span className="tc-index" style={{ background: "rgba(79,70,229,.12)", color: "var(--accent)" }}>{u.level}</span>
              <div className="tc-head-main"><div className="tc-title">{u.title}</div></div>
              <span className="tc-toggle">+</span>
            </div>
            {open === u.id && (
              <div className="tc-body">
                <div className="tc-approach">📘 {u.grammar}</div>
                <div className="lang-vocab">
                  {u.vocab.map((v, i) => (
                    <div className="lang-vrow" key={i}>
                      <button className="lang-say" title="Hear pronunciation" onClick={() => pronounce(v.w)}>🔊</button>
                      <div className="lang-w"><strong>{v.w}</strong><span>{v.en}</span></div>
                      <div className="lang-ex" title="Hear the example" onClick={() => pronounce(v.ex)}>{v.ex}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function VocabView({ lang }) {
    const all = lang.course.reduce((a, u) => a.concat(u.vocab), []);
    return (
      <div className="tool-card">
        <h3>All {lang.name} A1 vocabulary — {all.length} words</h3>
        <p className="tool-sub">Tap 🔊 to hear the natural voice and repeat aloud. Saying words out loud builds your accent fastest.</p>
        <div className="lang-vocab">
          {all.map((v, i) => (
            <div className="lang-vrow" key={i}>
              <button className="lang-say" onClick={() => pronounce(v.w)}>🔊</button>
              <div className="lang-w"><strong>{v.w}</strong><span>{v.en}</span></div>
              <div className="lang-ex" onClick={() => pronounce(v.ex)}>{v.ex}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function TestView({ lang }) {
    const [ans, setAns] = useState({});
    const [done, setDone] = useState(false);
    const total = lang.quiz.length;
    const score = lang.quiz.reduce((n, q, i) => n + (ans[i] === q.answer ? 1 : 0), 0);
    const pass = Math.ceil(total * 0.7);
    return (
      <div className="tool-card">
        <h3>{lang.name} placement quiz — {total} questions</h3>
        <p className="tool-sub">A quick check of your starting level. Answer all, then submit.</p>
        {lang.quiz.map((q, i) => (
          <div className="lang-q" key={i}>
            <div className="lang-q-prompt">{i + 1}. {q.q}</div>
            <div className="lang-opts">
              {q.options.map((o, oi) => {
                const chosen = ans[i] === oi;
                const cls = done ? (oi === q.answer ? " correct" : (chosen ? " wrong" : "")) : (chosen ? " chosen" : "");
                return <button key={oi} className={"lang-opt" + cls} disabled={done} onClick={() => setAns(Object.assign({}, ans, { [i]: oi }))}>{o}</button>;
              })}
            </div>
          </div>
        ))}
        {!done ? (
          <button className="btn btn-primary" disabled={Object.keys(ans).length < total} onClick={() => setDone(true)}>
            {Object.keys(ans).length < total ? `Answer all ${total} questions` : "Submit & see score →"}
          </button>
        ) : (
          <div className="lang-result">
            You scored <strong>{score}/{total}</strong> — {score >= pass ? "great start! You're ready to move toward A2." : "keep practising the Learn tab, then retake."}
            <button className="btn" style={{ marginLeft: 10 }} onClick={() => { setAns({}); setDone(false); }}>Retake</button>
          </div>
        )}
      </div>
    );
  }

  function ExamsView({ lang, onNav }) {
    return (
      <div>
        <div className="tool-card"><h3>Why learn {lang.name}?</h3><ul className="dest-why">{lang.why.map((w, i) => <li key={i}>{w}</li>)}</ul></div>
        <div className="tool-card">
          <h3>{lang.name} proficiency exams</h3>
          <div className="lang-exams">{lang.exams.map((e, i) => (<div className="lang-exam" key={i}><strong>{e.name}</strong><span>{e.desc}</span></div>))}</div>
        </div>
        <div className="tool-card">
          <h3>Pair {lang.name} with your study-abroad plan</h3>
          <p className="tool-sub">Free college predictor, scholarships, SOP and visa tools — all in one place.</p>
          <div className="row-gap-12">
            <button className="btn btn-primary" onClick={() => onNav("colleges")}>Explore universities →</button>
            <button className="btn" onClick={() => onNav("tools")}>Free tools</button>
          </div>
        </div>
      </div>
    );
  }

  function StoriesView({ langId }) {
    const stories = (window.LP_LANG_STORIES && window.LP_LANG_STORIES[langId]) || [];
    const code = langId === "french" ? "fr" : "de";
    const [active, setActive] = useState(null);
    const [playing, setPlaying] = useState(false);
    const stopRef = useRef(false);
    function speakLine(t) { try { if (window.LP_TTS && window.LP_TTS.speakOne) return window.LP_TTS.speakOne(t, "Kore", null, code); } catch (e) {} return Promise.resolve(); }
    async function readAll(lines) {
      setPlaying(true); stopRef.current = false;
      for (const l of lines) { if (stopRef.current) break; await speakLine(l.t); }
      setPlaying(false);
    }
    if (!stories.length) return <div className="tool-card"><p className="tool-sub">Stories are loading…</p></div>;
    if (!active) {
      return (
        <div className="tool-card">
          <h3>📖 Graded reading stories</h3>
          <p className="tool-sub">Short stories &amp; dialogues with audio and a glossary — the natural way to absorb {langId === "french" ? "French" : "German"}.</p>
          <div className="deck-grid">
            {stories.map((s) => (
              <button key={s.id} className="deck-card" onClick={() => setActive(s)}>
                <span className="deck-card-emoji">{s.emoji || "📖"}</span>
                <span className="deck-card-name">{s.title}</span>
                <span className="deck-card-meta">{s.level} · {s.lines.length} lines →</span>
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="lang-mock-bar">
          <a className="deck-back" onClick={() => { stopRef.current = true; setActive(null); }}>← All stories</a>
          <span className="deck-title-mini">{active.emoji} {active.title} · {active.level}</span>
        </div>
        <div className="tool-card">
          <button className={"btn btn-primary"} onClick={() => playing ? (stopRef.current = true) : readAll(active.lines)}>{playing ? "⏹ Stop" : "▶ Read the whole story"}</button>
          <div className="story-lines">
            {active.lines.map((l, i) => (
              <div className="story-line" key={i}>
                <button className="lang-say" title="Hear this line" onClick={() => speakLine(l.t)}>🔊</button>
                <div><div className="story-native">{l.t}</div><div className="story-gloss">{l.en}</div></div>
              </div>
            ))}
          </div>
        </div>
        {active.glossary && active.glossary.length > 0 && (
          <div className="tool-card"><h4>Glossary</h4><div className="lang-vocab">{active.glossary.map((g, i) => (
            <div className="lang-vrow" key={i}><button className="lang-say" onClick={() => speakLine(g.w)}>🔊</button><div className="lang-w"><strong>{g.w}</strong><span>{g.en}</span></div></div>
          ))}</div></div>
        )}
      </div>
    );
  }

  function Languages({ onNav }) {
    const langs = window.LP_LANGUAGES || {};
    const order = window.LP_LANGUAGE_ORDER || Object.keys(langs);
    const [langId, setLangId] = useState(order[0] || "german");
    const [tab, setTab] = useState("learn");
    const lang = langs[langId];

    useEffect(() => {
      if (lang) setSEO(`Learn ${lang.name} Free — Courses, Vocabulary & Exam Prep | LandingPrep`,
        `Free ${lang.name} course (A1+) with natural-voice pronunciation, vocabulary, a placement test and ${lang.name} exam guidance (Goethe, TestDaF, DELF). Built for study abroad.`);
    }, [langId]);

    if (!lang) return (<><window.LP_TopBar current="languages" onNav={onNav} /><main className="tools-shell tools-shell-wide"><div className="tool-card"><p className="tool-sub">Loading languages…</p></div></main></>);

    return (
      <>
        <window.LP_TopBar current="languages" onNav={onNav} />
        <main className="tools-shell tools-shell-wide">
          <header className="tools-hero">
            <h1>Learn {lang.name} — 100% Free 🎧</h1>
            <p>{lang.blurb}</p>
          </header>
          <div className="tools-groups">
            {order.map((id) => (
              <button key={id} className={"tools-group" + (langId === id ? " active" : "")} onClick={() => { setLangId(id); setTab("learn"); }}>
                {langs[id].flag} {langs[id].name}
              </button>
            ))}
          </div>
          <div className="tools-tabs">
            {[["learn", "📚 Learn"], ["vocab", "🗂 Vocabulary"], ["stories", "📖 Stories"], ["speak", "🎙️ AI Speaking"], ["test", "✅ Placement Test"], ["mock", "📝 Mock Test"], ["exams", "🎓 Exams & Why"]].map(([id, label]) => (
              <button key={id} className={"tools-tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
          {tab === "learn" && <LearnView lang={lang} />}
          {tab === "vocab" && <VocabView lang={lang} />}
          {tab === "stories" && <StoriesView langId={langId} key={langId} />}
          {tab === "speak" && (window.LP_LangSpeak ? <window.LP_LangSpeak langId={langId} key={langId} /> : <div className="tool-card"><p className="tool-sub">Loading speaking partner…</p></div>)}
          {tab === "test" && <TestView lang={lang} key={langId} />}
          {tab === "mock" && (window.LP_LangMock ? <window.LP_LangMock langId={langId} key={langId} /> : <div className="tool-card"><p className="tool-sub">Loading mock tests…</p></div>)}
          {tab === "exams" && <ExamsView lang={lang} onNav={onNav} />}
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_Languages = Languages;
})();
