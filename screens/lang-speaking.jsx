/* global React, window */
"use strict";
// LandingPrep — German/French AI speaking partner. Hands-free, NATURAL voice, and it
// gently AUTO-CORRECTS your mistakes:
//  • Continuous recognition that captures the WHOLE utterance (final + trailing words)
//    so it stops missing your last words; submits ~0.9s after you stop talking.
//  • Replies in the NATURAL neural voice (Gemini TTS) — not a robotic browser voice.
//  • If you make a mistake, it shows a quick ✏️ correction, then keeps chatting.
//  • Backend + voice are pre-warmed on mount so the first reply isn't a cold start.
//  • One Start / Stop button. Mic is muted while the agent speaks (no echo).
(function () {
  const { useState, useRef, useEffect } = React;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const SS = window.speechSynthesis || null;
  const META = {
    german: { name: "German", code: "de-DE", lang: "de", tutor: "Anna", hi: "Hallo! Wie heißt du?", hiEn: "Hello! What's your name?", retry: "Sag das noch einmal, bitte.", retryEn: "Say that again, please.", cont: "Weiter geht's!", fallback: "Sehr gut! Und du? (Very good! And you?)" },
    french: { name: "French", code: "fr-FR", lang: "fr", tutor: "Marie", hi: "Bonjour ! Comment tu t'appelles ?", hiEn: "Hello! What's your name?", retry: "Répète, s'il te plaît.", retryEn: "Say that again, please.", cont: "On continue !", fallback: "Très bien ! Et toi ? (Very good! And you?)" },
  };

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
  // Pull out an optional [FIX: ...] correction, then split native + (English gloss).
  function parseReply(s) {
    let fix = "";
    const fm = s.match(/\[\s*FIX:\s*([^\]]+)\]/i);
    if (fm) { fix = fm[1].trim(); s = s.replace(fm[0], "").trim(); }
    const i = s.indexOf("(");
    const native = i >= 0 ? s.slice(0, i).trim() : s.trim();
    const gloss = i >= 0 ? s.slice(i).replace(/[()]/g, "").trim() : "";
    return { native, gloss, fix };
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
    const interimRef = useRef("");
    const busyRef = useRef(false);
    const ttsAbort = useRef(null);
    const aiAbort = useRef(null);
    const scrollRef = useRef(null);

    // Pre-warm the backend (AI + TTS) so the first reply isn't a cold start.
    useEffect(() => {
      const base = window.LP_API_BASE || "";
      try { fetch(base + "/api/health").catch(() => {}); } catch (e) {}
      try { if (window.LP_TTS && window.LP_TTS.prewarm) window.LP_TTS.prewarm(m.lang); } catch (e) {}
      return () => stop();
    }, []);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, phase, interim]);

    // NATURAL neural voice (Gemini). Falls back to the browser voice only if TTS is off.
    function speak(text) {
      try {
        if (window.LP_TTS && window.LP_TTS.speakOne) {
          ttsAbort.current = new AbortController();
          return window.LP_TTS.speakOne(text, "Kore", ttsAbort.current.signal, m.lang);
        }
      } catch (e) {}
      return new Promise((resolve) => {
        if (!SS) { resolve(); return; }
        try { SS.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = m.code; u.onend = resolve; u.onerror = resolve; SS.speak(u); setTimeout(resolve, 6000); }
        catch (e) { resolve(); }
      });
    }

    function startListening() {
      if (!activeRef.current || busyRef.current || !SR) return;
      let rec;
      try { rec = new SR(); } catch (e) { return; }
      recRef.current = rec;
      finalRef.current = ""; interimRef.current = "";
      rec.lang = m.code; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;
      setPhase("listening"); setInterim("");
      const armSilence = () => {
        clearTimeout(silenceRef.current);
        silenceRef.current = setTimeout(() => {
          // Submit the FULL utterance: finalised words + any trailing interim word.
          const text = (finalRef.current + " " + interimRef.current).replace(/\s+/g, " ").trim();
          try { rec.stop(); } catch (e) {}
          if (text) handleUser(text);
        }, 900);
      };
      rec.onresult = (e) => {
        let interimTxt = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalRef.current += res[0].transcript + " ";
          else interimTxt += res[0].transcript;
        }
        interimRef.current = interimTxt;
        setInterim((finalRef.current + " " + interimTxt).trim());
        if (finalRef.current.trim() || interimTxt.trim()) armSilence();
      };
      rec.onerror = (ev) => { if (ev && ev.error === "not-allowed") stop(); };
      rec.onend = () => {
        clearTimeout(silenceRef.current);
        if (activeRef.current && !busyRef.current && !finalRef.current.trim() && !interimRef.current.trim()) {
          try { rec.start(); } catch (e) { startListening(); }
        }
      };
      try { rec.start(); } catch (e) {}
    }

    async function handleUser(text) {
      if (!text) return;
      busyRef.current = true; clearTimeout(silenceRef.current); setInterim("");
      try { recRef.current && recRef.current.stop(); } catch (e) {}
      setMsgs((x) => x.concat([{ role: "you", native: text }]));
      setPhase("thinking");
      try {
        aiAbort.current = new AbortController();
        const prompt = `You are ${m.tutor}, a warm, patient ${m.name} conversation partner for an A1 beginner learning ${m.name} for study abroad. The student just said: "${text}".\n` +
          `1) If their ${m.name} has a clear grammar/spelling/word mistake, begin with [FIX: the corrected short phrase].\n` +
          `2) Then reply with ONE short, simple ${m.name} sentence that responds AND asks one easy follow-up question.\n` +
          `3) End with the English translation in parentheses.\n` +
          `Keep it short and encouraging. If they spoke English, gently nudge them to try ${m.name}. Output only that.`;
        const raw = await aiReply(prompt, aiAbort.current.signal);
        if (!activeRef.current) return;
        const { native, gloss, fix } = parseReply(raw || m.fallback);
        setMsgs((x) => x.concat([{ role: "tutor", native: native || m.fallback, gloss, fix }]));
        setPhase("speaking");
        await speak(native || m.fallback);          // speak only the reply, not the correction
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
      try { ttsAbort.current && ttsAbort.current.abort(); } catch (e) {}
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
          {msgs.length === 0 && <div className="lang-speak-empty">👋 Press <strong>Start</strong> and say hello in {m.name}. {m.tutor} listens the moment you stop talking, gently corrects mistakes, and keeps chatting — no buttons to press.</div>}
          {msgs.map((mm, i) => (
            <div key={i} className={"lang-bubble " + (mm.role === "you" ? "you" : "tutor")}>
              {mm.fix && <div className="lb-fix">✏️ {mm.fix}</div>}
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
        <p className="tool-note" style={{ marginTop: 10 }}>💡 Hands-free: press Start and just speak. {m.tutor} understands the moment you pause, replies in a natural voice, and shows a ✏️ correction when you slip. Mistakes are welcome — that's how you learn!</p>
      </div>
    );
  }

  window.LP_LangSpeak = LangSpeak;
})();
