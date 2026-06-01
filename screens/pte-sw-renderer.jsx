// screens/pte-sw-renderer.jsx
// PTE Academic — Speaking & Writing section renderer.
// Renders each task type with the CORRECT interface instead of force-speaking
// everything through the IELTS examiner flow:
//   read_aloud / repeat_sentence / describe_image / retell_lecture /
//   answer_short_question  → spoken-response UI (stimulus + prep/record timers + mic)
//   summarize_written_text / essay → written-response UI (textarea + word count)
// Exposed as window.LP_PTE_SW = { PteSwSection }
(function () {
  const { useState, useEffect, useRef } = React;

  const TYPE_META = {
    read_aloud:            { label: "Read Aloud",            icon: "📖", mode: "speak", prep: 35, resp: 40 },
    repeat_sentence:       { label: "Repeat Sentence",       icon: "🔁", mode: "speak", prep: 3,  resp: 15 },
    describe_image:        { label: "Describe Image",        icon: "📊", mode: "speak", prep: 25, resp: 40 },
    retell_lecture:        { label: "Re-tell Lecture",       icon: "🎓", mode: "speak", prep: 10, resp: 40 },
    answer_short_question: { label: "Answer Short Question", icon: "❓", mode: "speak", prep: 3,  resp: 10 },
    summarize_written_text:{ label: "Summarize Written Text",icon: "✍️", mode: "write", min: 5,  max: 75,  minutes: 10 },
    essay:                 { label: "Write Essay",           icon: "📝", mode: "write", min: 200, max: 300, minutes: 20 },
  };

  function countWords(t) { return (t || "").trim().split(/\s+/).filter(Boolean).length; }
  function fmt(s) { const m = Math.floor(s / 60), x = s % 60; return m > 0 ? `${m}:${String(x).padStart(2,"0")}` : `${x}s`; }

  // ── Audio player (uses real Gemini TTS when available) ──────────────────────
  function AudioStimulus({ script, label }) {
    const [playing, setPlaying] = useState(false);
    const [played, setPlayed] = useState(false);
    const ctrlRef = useRef(null);
    const hasTTS = !!(window.LP_TTS && window.LP_TTS.playScript && window.LP_TTS.isEnabled && window.LP_TTS.isEnabled());
    useEffect(() => () => { try { ctrlRef.current?.abort?.(); } catch (e) {} }, []);
    async function play() {
      if (!script) return;
      const c = new AbortController(); ctrlRef.current = c;
      setPlaying(true);
      try { await window.LP_TTS.playScript(script, { signal: c.signal }); } catch (e) {}
      if (!c.signal.aborted) { setPlaying(false); setPlayed(true); }
    }
    return (
      <div style={{ background:"var(--tint-blue)", border:"1px solid #c7d2fe", borderRadius:12, padding:"14px 16px", marginBottom:12 }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", color:"#4338ca", marginBottom:8 }}>{label || "Audio"}</div>
        {hasTTS ? (
          <button className="btn btn-primary" onClick={play} disabled={playing}>
            {playing ? "🔊 Playing…" : played ? "🔁 Play again" : "▶ Play audio"}
          </button>
        ) : (
          <div style={{ fontSize:13, color:"#4b5563", lineHeight:1.6 }}>
            <em>Audio playback needs the AI voice enabled. Transcript shown for practice:</em>
            <div style={{ marginTop:6, color:"var(--ink)" }}>{script}</div>
          </div>
        )}
      </div>
    );
  }

  // ── Spoken-response item ────────────────────────────────────────────────────
  function SpeakItem({ item, sectionId, answers, setAnswer }) {
    const meta = TYPE_META[item.questionType] || {};
    const prep = item.prepSeconds || meta.prep || 25;
    const resp = item.responseSeconds || meta.resp || 40;
    const [phase, setPhase] = useState("ready"); // ready|prep|recording|done
    const [left, setLeft] = useState(0);
    const [showModel, setShowModel] = useState(false);
    const tRef = useRef(null);
    const recRef = useRef(null);
    const key = sectionId + "_" + item.id;

    function clear() { if (tRef.current) { clearInterval(tRef.current); tRef.current = null; } }
    useEffect(() => () => { clear(); try { recRef.current?.stop?.(); } catch (e) {} }, []);

    function startMic() {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      try {
        const r = new SR(); r.lang = "en-US"; r.continuous = true; r.interimResults = true;
        let finalT = "";
        r.onresult = (e) => { let t=""; for (let i=0;i<e.results.length;i++) t+=e.results[i][0].transcript+" "; finalT=t.trim(); setAnswer(key, finalT); };
        r.onerror = () => {}; recRef.current = r; r.start();
      } catch (e) {}
    }
    function stopMic() { try { recRef.current?.stop?.(); } catch (e) {} recRef.current = null; }

    function startPrep() {
      clear(); setPhase("prep"); setLeft(prep);
      tRef.current = setInterval(() => setLeft(p => { if (p <= 1) { clear(); startRec(); return 0; } return p - 1; }), 1000);
    }
    function startRec() {
      clear(); setPhase("recording"); setLeft(resp); startMic();
      tRef.current = setInterval(() => setLeft(p => { if (p <= 1) { clear(); stopMic(); setPhase("done"); return 0; } return p - 1; }), 1000);
    }
    function finishEarly() { clear(); stopMic(); setPhase("done"); }
    function reset() { clear(); stopMic(); setPhase("ready"); setLeft(0); }

    const transcript = answers[key] || "";

    return (
      <div className="q-card">
        <div className="q-num">{meta.icon} {meta.label}</div>
        <div className="writing-prompt" style={{ marginBottom: 12 }}>{item.prompt}</div>

        {/* Stimulus */}
        {item.questionType === "read_aloud" && item.readText && (
          <div style={{ background:"var(--tint)", border:"1px solid var(--line)", borderRadius:12, padding:"16px 18px", marginBottom:12, fontSize:16, lineHeight:1.7 }}>{item.readText}</div>
        )}
        {item.questionType === "describe_image" && item.visual && window.LP_VisualRenderer && (
          <div style={{ marginBottom: 12 }}><window.LP_VisualRenderer task={{ visual: item.visual, prompt: item.prompt }} /></div>
        )}
        {(item.questionType === "repeat_sentence" || item.questionType === "retell_lecture" || item.questionType === "answer_short_question") && item.audioScript && (
          <AudioStimulus script={item.audioScript} label={item.questionType === "retell_lecture" ? "Lecture" : "Listen"} />
        )}
        {item.questionType === "retell_lecture" && Array.isArray(item.keyPoints) && item.keyPoints.length > 0 && phase === "done" && (
          <div style={{ background:"var(--tint-orange)", border:"1px solid #ffd0a0", borderRadius:12, padding:"12px 14px", marginBottom:12 }}>
            <strong style={{ fontSize:11, textTransform:"uppercase", letterSpacing:".08em", color:"#b85c00" }}>Key points to mention</strong>
            <ul style={{ margin:"6px 0 0", paddingLeft:18 }}>{item.keyPoints.map((k,i) => <li key={i} style={{ fontSize:13.5, lineHeight:1.5 }}>{k}</li>)}</ul>
          </div>
        )}

        {/* Controls */}
        <div style={{ textAlign:"center", padding:"6px 0" }}>
          {phase === "ready" && <button className="btn btn-primary btn-lg" onClick={startPrep}>▶ Start ({fmt(prep)} prep · {fmt(resp)} speak)</button>}
          {phase === "prep" && (
            <div>
              <div style={{ fontSize:12, color:"var(--ink-3)" }}>⏱ Preparation</div>
              <div style={{ fontSize:34, fontWeight:800, color:"#3b82f6" }}>{left}s</div>
              <button className="btn" onClick={startRec}>Skip to recording →</button>
            </div>
          )}
          {phase === "recording" && (
            <div>
              <div style={{ fontSize:12, color:"#ef4444", fontWeight:700 }}>🔴 Recording — speak now</div>
              <div style={{ fontSize:34, fontWeight:800, color:"#ef4444" }}>{left}s</div>
              <button className="btn" onClick={finishEarly}>⏹ Stop early</button>
            </div>
          )}
          {phase === "done" && (
            <div>
              <div style={{ color:"var(--success)", fontWeight:700, marginBottom:8 }}>✅ Response captured</div>
              {transcript && <div style={{ background:"var(--tint-green)", border:"1px solid #bbf7d0", borderRadius:10, padding:"10px 12px", fontSize:13.5, textAlign:"left", marginBottom:8 }}><strong>Your transcript:</strong> {transcript}</div>}
              <button className="btn" onClick={reset}>↺ Try again</button>
            </div>
          )}
        </div>

        {/* Model / reference answer */}
        {(item.modelAnswer || item.correctAnswer) && (
          <details style={{ marginTop: 10 }} open={showModel} onToggle={e => setShowModel(e.target.open)}>
            <summary style={{ cursor:"pointer", fontWeight:600, color:"var(--primary)" }}>
              {item.questionType === "answer_short_question" ? "Show answer" : "Show model response"}
            </summary>
            <div style={{ background:"var(--tint-violet)", border:"1px solid #e9d5ff", borderRadius:10, padding:"12px 14px", marginTop:8, fontSize:14, lineHeight:1.65 }}>
              {item.questionType === "answer_short_question" && item.correctAnswer ? item.correctAnswer : item.modelAnswer}
            </div>
          </details>
        )}
      </div>
    );
  }

  // ── Written-response item ───────────────────────────────────────────────────
  function WriteItem({ item, sectionId, answers, setAnswer }) {
    const meta = TYPE_META[item.questionType] || {};
    const key = sectionId + "_" + item.id;
    const text = answers[key] || "";
    const wc = countWords(text);
    const min = item.wordMin || meta.min || 5, max = item.wordMax || meta.max || 300;
    const inRange = wc >= min && wc <= max;
    const [showModel, setShowModel] = useState(false);

    return (
      <div className="q-card">
        <div className="q-num">{meta.icon} {meta.label} {meta.minutes ? `· ${meta.minutes} min` : ""}</div>

        {item.questionType === "summarize_written_text" && item.readText && (
          <div style={{ background:"var(--tint)", border:"1px solid var(--line)", borderRadius:12, padding:"16px 18px", marginBottom:12, fontSize:15, lineHeight:1.7 }}>
            <strong style={{ display:"block", fontSize:11, textTransform:"uppercase", letterSpacing:".08em", marginBottom:8, color:"var(--ink-3)" }}>Passage</strong>
            {item.readText}
          </div>
        )}
        <div className="writing-prompt"><strong>Task</strong>{item.prompt}</div>

        <textarea
          className="writing-area"
          style={{ marginTop: 12 }}
          placeholder={item.questionType === "summarize_written_text"
            ? "Write ONE sentence (5–75 words) summarising the passage…"
            : "Write your essay here (200–300 words)…"}
          value={text}
          onChange={e => setAnswer(key, e.target.value)}
        />
        <div className="word-count-bar" style={{ marginTop: 6 }}>
          <span className={"wc-num" + (inRange ? " ok" : wc > max ? " low" : "")}>
            {wc} words {inRange ? "✓ in range" : wc > max ? `⚠ over ${max}` : `(aim ${min}–${max})`}
          </span>
          <span>Target: {min}–{max} words</span>
        </div>

        {item.modelAnswer && (
          <details style={{ marginTop: 10 }} open={showModel} onToggle={e => setShowModel(e.target.open)}>
            <summary style={{ cursor:"pointer", fontWeight:600, color:"var(--primary)" }}>Show model answer</summary>
            <div style={{ background:"var(--tint-violet)", border:"1px solid #e9d5ff", borderRadius:10, padding:"12px 14px", marginTop:8, fontSize:14, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{item.modelAnswer}</div>
          </details>
        )}
      </div>
    );
  }

  // ── Section shell with grouped item navigation ──────────────────────────────
  function PteSwSection({ sec, answers, setAnswer, sectionId }) {
    const items = sec.items || [];
    const [idx, setIdx] = useState(0);
    const current = items[idx];
    if (!current) return <div className="empty-state">No Speaking & Writing tasks available.</div>;
    const meta = TYPE_META[current.questionType] || {};

    return (
      <div className="pte-sw-shell">
        {/* progress strip */}
        <div className="part-nav" style={{ flexWrap:"wrap", gap:6, marginBottom:12 }}>
          {items.map((it, i) => {
            const m = TYPE_META[it.questionType] || {};
            const k = sectionId + "_" + it.id;
            const answered = answers[k] && String(answers[k]).trim();
            return (
              <button key={it.id || i}
                className={"part-pill" + (i === idx ? " active" : "") + (answered ? " done" : "")}
                title={m.label}
                style={{ minWidth: 0, padding: "6px 9px" }}
                onClick={() => setIdx(i)}>
                <span className="pp-label" style={{ fontSize: 14 }}>{m.icon || "•"}</span>
                <span className="pp-meta">{i + 1}</span>
              </button>
            );
          })}
        </div>

        {meta.mode === "write"
          ? <WriteItem item={current} sectionId={sectionId} answers={answers} setAnswer={setAnswer} />
          : <SpeakItem item={current} sectionId={sectionId} answers={answers} setAnswer={setAnswer} />}

        <div className="part-pager" style={{ marginTop: 12 }}>
          <button className="btn" disabled={idx === 0} onClick={() => setIdx(i => Math.max(0, i - 1))}>← Previous</button>
          <span className="pp-counter">Item {idx + 1} of {items.length}</span>
          {idx < items.length - 1
            ? <button className="btn btn-primary" onClick={() => setIdx(i => i + 1)}>Next →</button>
            : <button className="btn btn-primary" style={{ background:"var(--success)" }}
                onClick={() => { const b = document.querySelector(".test-topbar button.btn-sm"); if (b) b.click(); }}>✓ Submit section</button>}
        </div>
      </div>
    );
  }

  window.LP_PTE_SW = { PteSwSection };
})();
