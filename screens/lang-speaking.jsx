/* global React, window */
"use strict";
// LandingPrep — German/French AI speaking partner. HANDS-FREE, LOW-LATENCY:
//  • Continuous recognition with silence-detection — understands you the FIRST time,
//    no gaps, no "speak again". Submits ~0.9s after you stop talking.
//  • Replies in an INSTANT browser-native German/French voice (no TTS network round-
//    trip) so there's no lag — feels like a real back-and-forth.
//  • Backend is pre-warmed on mount so the first reply isn't a cold start.
//  • One Start / Stop button. Mic is muted while the agent speaks (no echo).
(function () {
  const { useState, useRef, useEffect } = React;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const SS = window.speechSynthesis || null;
  const META = {
    german: { name: "German", code: "de-DE", lang: "de", tutor: "Anna", hi: "Hallo! Wie heißt du?", hiEn: "Hello! What's your name?", retry: "Sag das noch einmal, bitte.", retryEn: "Say that again, please.", cont: "Weiter geht's!", fallback: "Sehr gut! Und du? (Very good! And you?)" },
    french: { name: "French", code: "fr-FR", lang: "fr", tutor: "Marie", hi: "Bonjour ! Comment tu t'appelles ?", hiEn: "Hello! What's your name?", retry: "Répète, s'il te plaît.", retryEn: "Say that again, please.", cont: "On continue !", fallback: "Très bien ! Et toi ? (Very good! And you?)" },
  };

  // Cache native voices (load asynchronously in some browsers).
  let VOICES = [];
  function refreshVoices() { try { VOICES = SS ? SS.getVoices() : []; } catch (e) { VOICES = []; } }
  if (SS) { refreshVoices(); try { SS.onvoiceschanged = refreshVoices; } catch (e) {} }
  function pickVoice(prefix) {
    const m = VOICES.filter((v) => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(prefix));
    return m.find((v) => /google/i.test(v.name)) || m.find((v) => /natural|neural|premium/i.test(v.name)) || m[0] || null;
  }

  async function aiReply(prompt, signal) {
    const base = window.LP_API_BASE || "";
    const r = await fetch(base + "/api/ai-tutor/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, messages: [{ role: "user", content: prompt }] }), signal,
    });
    if (!r.ok) throw new Error("ai " + r.status);
    const d = await r.json();
    return (d.answer || d.text || "").trim();
  }
  function splitReply(s) {
    const i = s.indexOf("(");
    if (i >= 0) return { native: s.slice(0, i).trim(), gloss: s.slice(i).replace(/[()]/g, "").trim() };
    return { native: s.trim(), gloss: "" };
  }

  function LangSpeak({ langId }) {
    const m = META[langId] || META.german;
    const [msgs, setMsgs] = useState([]);
    const [active, setActive] = useState(false);
    const [phase, setPhase] = useState("idle");   // idle | listening | thinking | speaking
    const [interim, setInterim] = useState("");
    const [typed, setTyped] = useState("");

    const activeRef = useRef(false);
    const recRef = useRef(null);
    const silenceRef = useRef(null);
    const finalRef = useRef("");
    const busyRef = useRef(false);
    const aiAbort = useRef(null);
    const scrollRef = useRef(null);

    // Pre-warm the backend so the first reply isn't a cold start.
    useEffect(() => {
      const base = window.LP_API_BASE || "";
      try { fetch(base + "/api/ai/health", { method: "GET" }).catch(() => {}); } catch (e) {}
      refreshVoices();
      return () => stop();
    }, []);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, phase, interim]);

    // INSTANT native voice — no network. Resolves when finished.
    function speak(text) {
      return new Promise((resolve) => {
        if (!SS) { resolve(); return; }
        try {
          SS.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = m.code; u.rate = 0.96; u.pitch = 1.0;
          const v = pickVoice(m.lang); if (v) u.voice = v;
          u.onend = resolve; u.onerror = resolve;
          SS.speak(u);
          // Safety: never hang if the engine drops onend.
          setTimeout(resolve, Math.min(9000, 1200 + text.length * 75));
        } catch (e) { resolve(); }
      });
    }

    function startListening() {
      if (!activeRef.current || busyRef.current || !SR) return;
      let rec;
      try { rec = new SR(); } catch (e) { return; }
      recRef.current = rec;
      finalRef.current = "";
      rec.lang = m.code; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
      setPhase("listening"); setInterim("");
      const armSilence = () => {
        clearTimeout(silenceRef.current);
        silenceRef.current = setTimeout(() => {
          const text = finalRef.current.trim();
          try { rec.stop(); } catch (e) {}
          if (text) handleUser(text);
        }, 900);   // submit ~0.9s after the user stops talking
      };
      rec.onresult = (e) => {
        let interimTxt = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalRef.current += res[0].transcript + " ";
          else interimTxt += res[0].transcript;
        }
        setInterim(interimTxt || finalRef.current);
        if (finalRef.current.trim() || interimTxt.trim()) armSilence();
      };
      rec.onerror = (ev) => { if (ev && ev.error === "not-allowed") { stop(); } };
      rec.onend = () => {
        clearTimeout(silenceRef.current);
        // If it ended on its own (no submission yet) and we're still listening, revive it.
        if (activeRef.current && !busyRef.current && phase !== "thinking" && !finalRef.current.trim()) {
          try { rec.start(); } catch (e) { startListening(); }
        }
      };
      try { rec.start(); } catch (e) { /* already running */ }
    }

    async function handleUser(text) {
      if (!text) return;
      busyRef.current = true; clearTimeout(silenceRef.current); setInterim("");
      try { recRef.current && recRef.current.stop(); } catch (e) {}
      setMsgs((x) => x.concat([{ role: "you", native: text }]));
      setPhase("thinking");
      try {
        aiAbort.current = new AbortController();
        const prompt = `You are ${m.tutor}, a warm ${m.name} conversation partner for an A1 beginner. The student just said: "${text}". Reply with ONE short, simple ${m.name} sentence that answers AND asks one easy follow-up. Then the English translation in parentheses. Be brief. Output ONLY the reply.`;
        const raw = await aiReply(prompt, aiAbort.current.signal);
        if (!activeRef.current) return;
        const { native, gloss } = splitReply(raw || m.fallback);
        setMsgs((x) => x.concat([{ role: "tutor", native: native || m.fallback, gloss }]));
        setPhase("speaking");
        await speak(native || m.fallback);
      } catch (e) {
        if (!activeRef.current) return;
        setMsgs((x) => x.concat([{ role: "tutor", native: m.retry, gloss: m.retryEn }]));
        setPhase("speaking");
        await speak(m.retry);
      }
      busyRef.current = false;
      if (activeRef.current) startListening();
    }

    async function start() {
      if (activeRef.current) return;
      try { if (SS) SS.resume(); } catch (e) {}     // unlock audio on the user gesture
      activeRef.current = true; setActive(true);
      const first = msgs.length === 0;
      if (first) setMsgs([{ role: "tutor", native: m.hi, gloss: m.hiEn }]);
      busyRef.current = true; setPhase("speaking");
      await speak(first ? m.hi : m.cont);
      busyRef.current = false;
      if (activeRef.current) startListening();
    }

    function stop() {
      activeRef.current = false; busyRef.current = false; setActive(false); setPhase("idle"); setInterim("");
      clearTimeout(silenceRef.current);
      try { recRef.current && recRef.current.stop(); } catch (e) {}
      try { SS && SS.cancel(); } catch (e) {}
      try { aiAbort.current && aiAbort.current.abort(); } catch (e) {}
    }

    const statusText = phase === "listening" ? "🎙️ Listening… just talk"
      : phase === "thinking" ? "💭 " + m.tutor + " is replying…"
      : phase === "speaking" ? "🔊 " + m.tutor + " is speaking…"
      : "Press Start to begin a real conversation";

    return (
      <div className="lang-speak">
        <div className="lang-speak-head">
          <div className={"lang-speak-avatar" + (phase === "speaking" ? " talking" : phase === "listening" ? " listening" : "")}>🗣️</div>
          <div><strong>{m.tutor}</strong><span className="muted"> · your {m.name} conversation partner</span></div>
        </div>

        <div className="lang-chat" ref={scrollRef}>
          {msgs.length === 0 && <div className="lang-speak-empty">👋 Press <strong>Start</strong> and say hello in {m.name}. {m.tutor} listens the moment you stop talking and replies instantly — no buttons to press.</div>}
          {msgs.map((mm, i) => (
            <div key={i} className={"lang-bubble " + (mm.role === "you" ? "you" : "tutor")}>
              <div className="lb-native">
                {mm.role === "tutor" && <button className="lang-say" title="Hear it again" onClick={() => speak(mm.native)}>🔊</button>}
                {mm.native}
              </div>
              {mm.gloss && <div className="lb-gloss">{mm.gloss}</div>}
            </div>
          ))}
          {interim && <div className="lang-bubble you interim"><div className="lb-native">{interim}…</div></div>}
        </div>

        <div className="lang-speak-controls">
          <div className={"lang-speak-status s-" + phase}>{statusText}</div>
          {SR
            ? (active
                ? <button className="btn lang-stop" onClick={stop}>⏹ Stop conversation</button>
                : <button className="btn btn-primary lang-start" onClick={start}>▶ Start conversation</button>)
            : (
              <form className="lang-type" onSubmit={(e) => { e.preventDefault(); const t = typed; setTyped(""); if (!activeRef.current) { activeRef.current = true; setActive(true); } busyRef.current = true; handleUser(t); }}>
                <input className="lc-input" placeholder={"Type in " + m.name + "… (your browser has no mic input)"} value={typed} onChange={(e) => setTyped(e.target.value)} />
                <button className="btn btn-primary" type="submit" disabled={!typed.trim()}>Send</button>
              </form>
            )}
        </div>
        <p className="tool-note" style={{ marginTop: 10 }}>💡 Hands-free &amp; instant: press Start once and just speak. {m.tutor} understands the moment you pause and replies right away. Mistakes are welcome — that's how you learn!</p>
      </div>
    );
  }

  window.LP_LangSpeak = LangSpeak;
})();
