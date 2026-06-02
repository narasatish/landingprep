"use strict";
(function() {
  const { useState, useRef, useEffect } = React;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const META = {
    german: { name: "German", code: "de-DE", tts: "de", tutor: "Anna", hi: "Hallo! Wie hei\xDFt du?", hiEn: "Hello! What's your name?", retry: "Entschuldigung, versuch es noch einmal.", retryEn: "Sorry, try again.", fallback: "Sehr gut! Und du? (Very good! And you?)" },
    french: { name: "French", code: "fr-FR", tts: "fr", tutor: "Marie", hi: "Bonjour ! Comment tu t'appelles ?", hiEn: "Hello! What's your name?", retry: "D\xE9sol\xE9e, r\xE9essaie.", retryEn: "Sorry, try again.", fallback: "Tr\xE8s bien ! Et toi ? (Very good! And you?)" }
  };
  function speak(text, tts) {
    try {
      if (window.LP_TTS && window.LP_TTS.speakOne) window.LP_TTS.speakOne(text, "Kore", null, tts);
    } catch (e) {
    }
  }
  async function aiReply(prompt) {
    const base = window.LP_API_BASE || "";
    const r = await fetch(base + "/api/ai-tutor/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, messages: [{ role: "user", content: prompt }] })
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
    const [listening, setListening] = useState(false);
    const [thinking, setThinking] = useState(false);
    const [typed, setTyped] = useState("");
    const recRef = useRef(null);
    const started = useRef(false);
    const scrollRef = useRef(null);
    useEffect(() => {
      if (started.current) return;
      started.current = true;
      setMsgs([{ role: "tutor", native: m.hi, gloss: m.hiEn }]);
      speak(m.hi, m.tts);
    }, []);
    useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs, thinking]);
    async function handleUser(text) {
      if (!text || !text.trim()) return;
      setMsgs((x) => x.concat([{ role: "you", native: text }]));
      setThinking(true);
      try {
        const prompt = `You are ${m.tutor}, a warm, encouraging ${m.name} conversation partner for an absolute A1 beginner learning ${m.name} for study abroad. The student just said: "${text}". Reply with ONE or TWO very simple ${m.name} sentences (A1 level) that respond AND ask ONE easy follow-up question. Then add the English translation in parentheses at the very end. Keep it short and simple. Output ONLY the reply, nothing else.`;
        const raw = await aiReply(prompt);
        const { native, gloss } = splitReply(raw || m.fallback);
        setMsgs((x) => x.concat([{ role: "tutor", native: native || m.fallback, gloss }]));
        speak(native || m.fallback, m.tts);
      } catch (e) {
        setMsgs((x) => x.concat([{ role: "tutor", native: m.retry, gloss: m.retryEn }]));
        speak(m.retry, m.tts);
      }
      setThinking(false);
    }
    function listen() {
      if (!SR) return;
      if (listening) {
        try {
          recRef.current && recRef.current.stop();
        } catch (e) {
        }
        return;
      }
      const r = new SR();
      recRef.current = r;
      r.lang = m.code;
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.continuous = false;
      r.onresult = (e) => {
        const t = e.results[0][0].transcript;
        setListening(false);
        handleUser(t);
      };
      r.onerror = () => setListening(false);
      r.onend = () => setListening(false);
      setListening(true);
      try {
        r.start();
      } catch (e) {
        setListening(false);
      }
    }
    return /* @__PURE__ */ React.createElement("div", { className: "lang-speak" }, /* @__PURE__ */ React.createElement("div", { className: "lang-speak-head" }, /* @__PURE__ */ React.createElement("div", { className: "lang-speak-avatar" }, "\u{1F5E3}\uFE0F"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, m.tutor), /* @__PURE__ */ React.createElement("span", { className: "muted" }, " \xB7 your ", m.name, " conversation partner"))), /* @__PURE__ */ React.createElement("div", { className: "lang-chat", ref: scrollRef }, msgs.map((mm, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "lang-bubble " + (mm.role === "you" ? "you" : "tutor") }, /* @__PURE__ */ React.createElement("div", { className: "lb-native" }, mm.role === "tutor" && /* @__PURE__ */ React.createElement("button", { className: "lang-say", title: "Hear it", onClick: () => speak(mm.native, m.tts) }, "\u{1F50A}"), mm.native), mm.gloss && /* @__PURE__ */ React.createElement("div", { className: "lb-gloss" }, mm.gloss))), thinking && /* @__PURE__ */ React.createElement("div", { className: "lang-bubble tutor" }, /* @__PURE__ */ React.createElement("div", { className: "lb-native" }, "\u2026"))), /* @__PURE__ */ React.createElement("div", { className: "lang-speak-controls" }, SR ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary lang-mic" + (listening ? " rec" : ""), onClick: listen }, listening ? "\u{1F399} Listening\u2026 (tap to stop)" : "\u{1F399} Tap & speak in " + m.name) : /* @__PURE__ */ React.createElement("div", { className: "tool-note" }, "\u{1F3A4} Your browser doesn't support voice input \u2014 type below instead."), /* @__PURE__ */ React.createElement("form", { className: "lang-type", onSubmit: (e) => {
      e.preventDefault();
      const t = typed;
      setTyped("");
      handleUser(t);
    } }, /* @__PURE__ */ React.createElement("input", { className: "lc-input", placeholder: "Or type in " + m.name + "\u2026", value: typed, onChange: (e) => setTyped(e.target.value) }), /* @__PURE__ */ React.createElement("button", { className: "btn", type: "submit", disabled: !typed.trim() }, "Send"))), /* @__PURE__ */ React.createElement("p", { className: "tool-note", style: { marginTop: 10 } }, "\u{1F4A1} Speak or type in ", m.name, ". ", m.tutor, " replies in simple ", m.name, " (with English) and keeps chatting. Mistakes are welcome \u2014 that's how you learn!"));
  }
  window.LP_LangSpeak = LangSpeak;
})();
