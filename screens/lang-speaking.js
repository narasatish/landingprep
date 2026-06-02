"use strict";
(function() {
  const { useState, useRef, useEffect } = React;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const META = {
    german: { name: "German", code: "de-DE", tts: "de", tutor: "Anna", hi: "Hallo! Wie hei\xDFt du?", hiEn: "Hello! What's your name?", retry: "Entschuldigung, sag das noch einmal.", retryEn: "Sorry, say that again.", fallback: "Sehr gut! Und du? (Very good! And you?)" },
    french: { name: "French", code: "fr-FR", tts: "fr", tutor: "Marie", hi: "Bonjour ! Comment tu t'appelles ?", hiEn: "Hello! What's your name?", retry: "D\xE9sol\xE9e, r\xE9p\xE8te encore une fois.", retryEn: "Sorry, say that again.", fallback: "Tr\xE8s bien ! Et toi ? (Very good! And you?)" }
  };
  async function aiReply(prompt, signal) {
    const base = window.LP_API_BASE || "";
    const r = await fetch(base + "/api/ai-tutor/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, messages: [{ role: "user", content: prompt }] }),
      signal
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
    const [phase, setPhase] = useState("idle");
    const [interim, setInterim] = useState("");
    const [typed, setTyped] = useState("");
    const activeRef = useRef(false);
    const recRef = useRef(null);
    const ttsAbort = useRef(null);
    const aiAbort = useRef(null);
    const busyRef = useRef(false);
    const scrollRef = useRef(null);
    useEffect(() => () => stop(), []);
    useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs, phase, interim]);
    function speak(text) {
      try {
        if (!(window.LP_TTS && window.LP_TTS.speakOne)) return Promise.resolve();
        ttsAbort.current = new AbortController();
        return window.LP_TTS.speakOne(text, "Kore", ttsAbort.current.signal, m.tts);
      } catch (e) {
        return Promise.resolve();
      }
    }
    function listenTurn() {
      if (!activeRef.current || busyRef.current || !SR) return;
      let got = false;
      let rec;
      try {
        rec = new SR();
      } catch (e) {
        return;
      }
      recRef.current = rec;
      rec.lang = m.code;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;
      setPhase("listening");
      setInterim("");
      rec.onresult = (e) => {
        let finalTxt = "", interimTxt = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalTxt += res[0].transcript;
          else interimTxt += res[0].transcript;
        }
        if (interimTxt) setInterim(interimTxt);
        if (finalTxt.trim()) {
          got = true;
          try {
            rec.stop();
          } catch (e2) {
          }
          handleUser(finalTxt.trim());
        }
      };
      rec.onerror = (ev) => {
        if (ev && ev.error === "not-allowed") {
          stop();
          return;
        }
      };
      rec.onend = () => {
        if (got) return;
        if (activeRef.current && !busyRef.current) listenTurn();
      };
      try {
        rec.start();
      } catch (e) {
      }
    }
    async function handleUser(text) {
      if (!text) return;
      busyRef.current = true;
      setInterim("");
      setMsgs((x) => x.concat([{ role: "you", native: text }]));
      setPhase("thinking");
      try {
        aiAbort.current = new AbortController();
        const prompt = `You are ${m.tutor}, a warm, encouraging ${m.name} conversation partner for an absolute A1 beginner learning ${m.name} for study abroad. The student just said: "${text}". Reply with ONE or TWO very simple ${m.name} sentences (A1 level) that respond AND ask ONE easy follow-up question. Then add the English translation in parentheses at the very end. Keep it short. Output ONLY the reply.`;
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
      if (activeRef.current) listenTurn();
    }
    async function start() {
      if (activeRef.current) return;
      activeRef.current = true;
      setActive(true);
      const first = msgs.length === 0;
      if (first) setMsgs([{ role: "tutor", native: m.hi, gloss: m.hiEn }]);
      busyRef.current = true;
      setPhase("speaking");
      await speak(first ? m.hi : m.name === "German" ? "Weiter geht's!" : "On continue !");
      busyRef.current = false;
      if (activeRef.current) listenTurn();
    }
    function stop() {
      activeRef.current = false;
      busyRef.current = false;
      setActive(false);
      setPhase("idle");
      setInterim("");
      try {
        recRef.current && recRef.current.stop();
      } catch (e) {
      }
      try {
        ttsAbort.current && ttsAbort.current.abort();
      } catch (e) {
      }
      try {
        aiAbort.current && aiAbort.current.abort();
      } catch (e) {
      }
    }
    const statusText = phase === "listening" ? "\u{1F399}\uFE0F Listening\u2026 just talk" : phase === "thinking" ? "\u{1F4AD} " + m.tutor + " is thinking\u2026" : phase === "speaking" ? "\u{1F50A} " + m.tutor + " is speaking\u2026" : "Press Start to begin a real conversation";
    return /* @__PURE__ */ React.createElement("div", { className: "lang-speak" }, /* @__PURE__ */ React.createElement("div", { className: "lang-speak-head" }, /* @__PURE__ */ React.createElement("div", { className: "lang-speak-avatar" + (phase === "speaking" ? " talking" : phase === "listening" ? " listening" : "") }, "\u{1F5E3}\uFE0F"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, m.tutor), /* @__PURE__ */ React.createElement("span", { className: "muted" }, " \xB7 your ", m.name, " conversation partner"))), /* @__PURE__ */ React.createElement("div", { className: "lang-chat", ref: scrollRef }, msgs.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "lang-speak-empty" }, "\u{1F44B} Press ", /* @__PURE__ */ React.createElement("strong", null, "Start"), " and say hello in ", m.name, ". ", m.tutor, " will chat back and keep the conversation going \u2014 no buttons to press."), msgs.map((mm, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "lang-bubble " + (mm.role === "you" ? "you" : "tutor") }, /* @__PURE__ */ React.createElement("div", { className: "lb-native" }, mm.role === "tutor" && /* @__PURE__ */ React.createElement("button", { className: "lang-say", title: "Hear it again", onClick: () => {
      try {
        window.LP_TTS.speakOne(mm.native, "Kore", null, m.tts);
      } catch (e) {
      }
    } }, "\u{1F50A}"), mm.native), mm.gloss && /* @__PURE__ */ React.createElement("div", { className: "lb-gloss" }, mm.gloss))), interim && /* @__PURE__ */ React.createElement("div", { className: "lang-bubble you interim" }, /* @__PURE__ */ React.createElement("div", { className: "lb-native" }, interim, "\u2026"))), /* @__PURE__ */ React.createElement("div", { className: "lang-speak-controls" }, /* @__PURE__ */ React.createElement("div", { className: "lang-speak-status s-" + phase }, statusText), SR ? active ? /* @__PURE__ */ React.createElement("button", { className: "btn lang-stop", onClick: stop }, "\u23F9 Stop conversation") : /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary lang-start", onClick: start }, "\u25B6 Start conversation") : /* @__PURE__ */ React.createElement("form", { className: "lang-type", onSubmit: (e) => {
      e.preventDefault();
      const t = typed;
      setTyped("");
      if (!activeRef.current) {
        activeRef.current = true;
        setActive(true);
      }
      busyRef.current = true;
      handleUser(t);
    } }, /* @__PURE__ */ React.createElement("input", { className: "lc-input", placeholder: "Type in " + m.name + "\u2026 (your browser has no mic input)", value: typed, onChange: (e) => setTyped(e.target.value) }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", type: "submit", disabled: !typed.trim() }, "Send"))), /* @__PURE__ */ React.createElement("p", { className: "tool-note", style: { marginTop: 10 } }, "\u{1F4A1} Hands-free: press Start once and just speak. ", m.tutor, " replies in simple ", m.name, " (with English) and listens again automatically. Mistakes are welcome \u2014 that's how you learn!"));
  }
  window.LP_LangSpeak = LangSpeak;
})();
