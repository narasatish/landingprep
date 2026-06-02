/* global React, window */
"use strict";
// LandingPrep — free AI Band-Score Checker (IELTS Writing & Speaking). Paste an essay
// or record a Part-2 answer and get an instant estimated band with a TR/CC/LR/GRA
// breakdown, fixes and a Band-9 model. Targets the highest-intent prep niche
// ("free IELTS writing checker / band score"). Uses the backend Gemini proxy (jsonMode).
(function () {
  const { useState, useRef, useEffect } = React;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  const CUE_CARDS = [
    "Describe a skill you would like to learn. You should say: what it is, why you want to learn it, how you would learn it, and how it would help you.",
    "Describe a place you have visited that you found memorable. Say where it is, when you went, what you did, and why it was memorable.",
    "Describe a person who has influenced you. Say who they are, how you know them, what they did, and why they influenced you.",
    "Describe a book, film or show you enjoyed. Say what it was, when you experienced it, what it was about, and why you liked it.",
    "Describe a goal you want to achieve in the future. Say what it is, why you want it, how you will achieve it, and how you will feel.",
  ];

  function parseJSON(text) {
    if (!text) return null;
    let s = String(text).trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    try { return JSON.parse(s); } catch (e) {}
    const m = s.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch (e2) {} }
    return null;
  }
  async function evaluate(prompt) {
    const base = window.LP_API_BASE || "";
    const r = await fetch(base + "/api/ai-tutor/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, jsonMode: true }),
    });
    if (!r.ok) throw new Error("ai " + r.status);
    const d = await r.json();
    return parseJSON(d.answer || d.text || "");
  }
  function bandColor(b) {
    const n = Number(b) || 0;
    if (n >= 7.5) return "#16a34a";
    if (n >= 6.5) return "#0d9488";
    if (n >= 5.5) return "#d97706";
    return "#dc2626";
  }

  function BandResult({ data, rewriteLabel }) {
    const [open, setOpen] = useState(false);
    if (!data) return null;
    const overall = data.overall != null ? data.overall : "—";
    return (
      <div className="bc-result">
        <div className="bc-overall" style={{ background: "linear-gradient(135deg, " + bandColor(overall) + ", #0ea5e9)" }}>
          <div className="bc-overall-num">{overall}</div>
          <div className="bc-overall-lbl">Estimated Band</div>
        </div>
        <div className="bc-criteria">
          {(data.criteria || []).map((c, i) => (
            <div className="bc-crit" key={i}>
              <div className="bc-crit-head"><span className="bc-crit-key">{c.key}</span><span className="bc-crit-score" style={{ color: bandColor(c.score) }}>{c.score}</span></div>
              <div className="bc-crit-bar"><span style={{ width: (Math.min(9, Number(c.score) || 0) / 9 * 100) + "%", background: bandColor(c.score) }} /></div>
              {c.comment && <div className="bc-crit-comment">{c.comment}</div>}
            </div>
          ))}
        </div>
        {(data.strengths && data.strengths.length) ? (
          <div className="bc-lists">
            <div className="bc-list bc-good"><h4>✅ Strengths</h4><ul>{data.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            <div className="bc-list bc-improve"><h4>🎯 To improve</h4><ul>{(data.improvements || []).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          </div>
        ) : null}
        {(data.corrections && data.corrections.length) ? (
          <div className="tool-card bc-fixes"><h4>✏️ Key corrections</h4>
            {data.corrections.slice(0, 8).map((c, i) => (
              <div className="bc-fix" key={i}><span className="bc-fix-old">{c.original}</span><span className="bc-fix-arrow">→</span><span className="bc-fix-new">{c.fixed}</span></div>
            ))}
          </div>
        ) : null}
        {(data.band9Rewrite || data.modelAnswer) ? (
          <div className="tool-card">
            <button className="btn" onClick={() => setOpen(!open)}>{open ? "Hide" : "Show"} {rewriteLabel} ▾</button>
            {open && <div className="bc-rewrite">{data.band9Rewrite || data.modelAnswer}</div>}
          </div>
        ) : null}
        <button className="btn" style={{ marginTop: 12 }} onClick={() => window.LP_ShareCard && window.LP_ShareCard.make({ title: (rewriteLabel || "").indexOf("rewrite") >= 0 ? "My IELTS Writing band" : "My IELTS Speaking band", big: overall, label: "Estimated Band", sub: "Checked free with the AI band-score checker — TR/CC/LR/GRA breakdown" })}>📤 Share / save my band</button>
        <p className="tool-note" style={{ marginTop: 10 }}>⚖️ AI estimate for guidance — calibrated to the official band descriptors but not an official score. Confirm with a teacher for high-stakes decisions.</p>
      </div>
    );
  }

  function WritingChecker() {
    const [task, setTask] = useState("Task 2");
    const [text, setText] = useState("");
    const [data, setData] = useState(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const minW = task === "Task 1" ? 150 : 250;
    async function check() {
      setBusy(true); setErr(""); setData(null);
      try {
        const crit = task === "Task 1" ? "Task Achievement" : "Task Response";
        const prompt = `You are a certified IELTS examiner. Evaluate this IELTS Writing ${task} answer strictly against the official public band descriptors. Essay:\n"""${text.slice(0, 6000)}"""\n\nReturn ONLY a JSON object: {"overall": <band 0-9 in 0.5 steps>, "wordCount": <int>, "criteria": [{"key":"${crit}","score":<0-9>,"comment":"<one sentence>"},{"key":"Coherence & Cohesion","score":<0-9>,"comment":"<one sentence>"},{"key":"Lexical Resource","score":<0-9>,"comment":"<one sentence>"},{"key":"Grammatical Range & Accuracy","score":<0-9>,"comment":"<one sentence>"}], "strengths": ["<2-3 short points>"], "improvements": ["<3-4 specific, actionable points>"], "corrections": [{"original":"<short phrase from the essay>","fixed":"<corrected phrase>"}], "band9Rewrite": "<a full Band 9 rewrite of the essay, same task>"}`;
        const d = await evaluate(prompt);
        if (!d || d.overall == null) throw new Error("parse");
        setData(d);
        try { window.LP_Gamify && window.LP_Gamify.award(30, "band check"); } catch (e) {}
        try { const h = JSON.parse(localStorage.getItem("lp_bc_writing") || "[]"); h.unshift({ t: Date.now(), task, overall: d.overall, words }); localStorage.setItem("lp_bc_writing", JSON.stringify(h.slice(0, 20))); } catch (e) {}
      } catch (e) { setErr("Couldn't score that — please try again (the AI may be warming up)."); }
      setBusy(false);
    }
    return (
      <div>
        <div className="tool-card">
          <div className="bc-tasks">
            {["Task 1", "Task 2"].map((t) => <button key={t} className={"bc-task" + (task === t ? " active" : "")} onClick={() => setTask(t)}>{t === "Task 1" ? "Task 1 (report/letter)" : "Task 2 (essay)"}</button>)}
          </div>
          <textarea className="bc-textarea" rows={12} placeholder={"Paste your IELTS Writing " + task + " answer here…"} value={text} onChange={(e) => setText(e.target.value)} />
          <div className="bc-meta">
            <span className={words < minW ? "bc-words low" : "bc-words ok"}>{words} words {words < minW ? "· aim for " + minW + "+" : "✓"}</span>
            <button className="btn btn-primary" disabled={busy || words < 40} onClick={check}>{busy ? "Scoring…" : "Check my band score →"}</button>
          </div>
          {err && <div className="bc-err">{err}</div>}
        </div>
        {busy && <div className="tool-card bc-loading">⏳ The AI examiner is reading your essay and applying the band descriptors…</div>}
        <BandResult data={data} rewriteLabel="Band 9 rewrite" />
      </div>
    );
  }

  function SpeakingChecker() {
    const [card] = useState(() => CUE_CARDS[0]);
    const [cardI, setCardI] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [recording, setRecording] = useState(false);
    const [data, setData] = useState(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const recRef = useRef(null);
    const startT = useRef(0);
    const finalRef = useRef("");
    const topic = CUE_CARDS[cardI];
    const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

    function toggleRec() {
      if (!SR) { setErr("Your browser has no microphone input — type your answer below instead."); return; }
      if (recording) { try { recRef.current && recRef.current.stop(); } catch (e) {} return; }
      const r = new SR(); recRef.current = r; finalRef.current = "";
      r.lang = "en-US"; r.continuous = true; r.interimResults = true;
      r.onresult = (e) => { let f = "", it = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const x = e.results[i]; if (x.isFinal) f += x[0].transcript + " "; else it += x[0].transcript; } if (f) finalRef.current += f; setTranscript((finalRef.current + " " + it).trim()); };
      r.onerror = () => setRecording(false);
      r.onend = () => { setRecording(false); setTranscript(finalRef.current.trim()); };
      startT.current = Date.now(); setRecording(true); setData(null);
      try { r.start(); } catch (e) { setRecording(false); }
    }
    async function check() {
      setBusy(true); setErr(""); setData(null);
      try {
        const secs = Math.max(1, Math.round((Date.now() - startT.current) / 1000)) || 60;
        const wpm = Math.round(words / (secs / 60)) || 0;
        const prompt = `You are an IELTS Speaking examiner. Evaluate this transcript of a Part 2 long-turn answer. Cue card topic: "${topic}". The candidate spoke about ${wpm} words per minute. Transcript:\n"""${transcript.slice(0, 4000)}"""\n\nReturn ONLY a JSON object: {"overall": <band 0-9 in 0.5 steps>, "criteria": [{"key":"Fluency & Coherence","score":<0-9>,"comment":"<one sentence, mention pace ${wpm} wpm>"},{"key":"Lexical Resource","score":<0-9>,"comment":"<one sentence>"},{"key":"Grammatical Range & Accuracy","score":<0-9>,"comment":"<one sentence>"},{"key":"Pronunciation","score":<0-9>,"comment":"estimate from transcript only"}], "strengths": ["<2-3 points>"], "improvements": ["<3-4 specific points>"], "modelAnswer": "<a Band 9 spoken-style model answer for this cue card, ~180 words>"}`;
        const d = await evaluate(prompt);
        if (!d || d.overall == null) throw new Error("parse");
        setData(d);
        try { window.LP_Gamify && window.LP_Gamify.award(30, "band check"); } catch (e) {}
      } catch (e) { setErr("Couldn't score that — please try again."); }
      setBusy(false);
    }
    return (
      <div>
        <div className="tool-card">
          <div className="bc-cue"><strong>🗣️ Part 2 cue card</strong><p>{topic}</p><button className="btn" onClick={() => { setCardI((cardI + 1) % CUE_CARDS.length); setTranscript(""); setData(null); }}>↻ New topic</button></div>
          <div className="bc-rec-row">
            <button className={"btn btn-primary bc-rec" + (recording ? " on" : "")} onClick={toggleRec}>{recording ? "⏹ Stop recording" : "🎙️ Record my answer (1–2 min)"}</button>
            {words > 0 && <span className="bc-words ok">{words} words captured</span>}
          </div>
          <textarea className="bc-textarea" rows={6} placeholder="Your transcript appears here as you speak — or type your answer." value={transcript} onChange={(e) => setTranscript(e.target.value)} />
          <div className="bc-meta"><span /><button className="btn btn-primary" disabled={busy || words < 25} onClick={check}>{busy ? "Scoring…" : "Check my band score →"}</button></div>
          {err && <div className="bc-err">{err}</div>}
        </div>
        {busy && <div className="tool-card bc-loading">⏳ The AI examiner is assessing your fluency, vocabulary and grammar…</div>}
        <BandResult data={data} rewriteLabel="Band 9 model answer" />
      </div>
    );
  }

  function BandChecker({ onNav, initialMode }) {
    const [mode, setMode] = useState(initialMode === "speaking" ? "speaking" : "writing");
    useEffect(() => {
      try {
        document.title = mode === "writing"
          ? "Free IELTS Writing Checker — Instant AI Band Score (Task 1 & 2) | LandingPrep"
          : "Free IELTS Speaking Checker — Instant AI Band Score & Feedback | LandingPrep";
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Free AI IELTS band-score checker: paste your essay or record your speaking answer and get an instant estimated band with a TR/CC/LR/GRA breakdown, corrections and a Band 9 model. No signup.");
      } catch (e) {}
    }, [mode]);
    return (
      <>
        <window.LP_TopBar current="tools" onNav={onNav} />
        <main className="tools-shell tools-shell-wide">
          <header className="tools-hero">
            <h1>🎯 AI Band-Score Checker</h1>
            <p>Paste your essay or record your speaking answer — get an instant estimated IELTS band with a full criterion breakdown, fixes and a Band 9 model. 100% free, no signup.</p>
          </header>
          <div className="tools-tabs">
            <button className={"tools-tab" + (mode === "writing" ? " active" : "")} onClick={() => setMode("writing")}>✍️ Writing</button>
            <button className={"tools-tab" + (mode === "speaking" ? " active" : "")} onClick={() => setMode("speaking")}>🎙️ Speaking</button>
          </div>
          {mode === "writing" ? <WritingChecker /> : <SpeakingChecker />}
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_BandChecker = BandChecker;
})();
