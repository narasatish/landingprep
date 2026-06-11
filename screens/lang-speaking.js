"use strict";
(function() {
  const { useState, useRef, useEffect } = React;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const SS = window.speechSynthesis || null;
  const META = {
    german: { name: "German", code: "de-DE", lang: "de", tutor: "Anna", hi: "Hallo! Wie hei\xDFt du?", hiEn: "Hello! What's your name?", retry: "Sag das noch einmal, bitte.", retryEn: "Say that again, please.", cont: "Weiter geht's!", fallback: "Sehr gut! Und du? (Very good! And you?)" },
    french: { name: "French", code: "fr-FR", lang: "fr", tutor: "Marie", hi: "Bonjour ! Comment tu t'appelles ?", hiEn: "Hello! What's your name?", retry: "R\xE9p\xE8te, s'il te pla\xEEt.", retryEn: "Say that again, please.", cont: "On continue !", fallback: "Tr\xE8s bien ! Et toi ? (Very good! And you?)" },
    spanish: { name: "Spanish", code: "es-ES", lang: "es", tutor: "Luc\xEDa", hi: "\xA1Hola! \xBFC\xF3mo te llamas?", hiEn: "Hello! What's your name?", retry: "Repite, por favor.", retryEn: "Say that again, please.", cont: "\xA1Seguimos!", fallback: "\xA1Muy bien! \xBFY t\xFA? (Very good! And you?)" }
  };
  let VOICES = [];
  function refreshVoices() {
    try {
      VOICES = SS ? SS.getVoices() : [];
    } catch (e) {
      VOICES = [];
    }
  }
  if (SS) {
    refreshVoices();
    try {
      SS.onvoiceschanged = refreshVoices;
    } catch (e) {
    }
  }
  function voiceScore(v) {
    const n = (v.name || "").toLowerCase();
    let s = 0;
    if (/natural|neural/.test(n)) s += 100;
    if (/online/.test(n)) s += 80;
    if (/google/.test(n)) s += 60;
    if (v.localService === false) s += 15;
    if (/desktop|sapi|hedda|stefan|david|zira|mark|hazel/.test(n)) s -= 60;
    return s;
  }
  function bestVoice(prefix) {
    const all = VOICES.filter((v) => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(prefix));
    if (!all.length) return { voice: null, good: false };
    const top = all.slice().sort((a, b) => voiceScore(b) - voiceScore(a))[0];
    return { voice: top, good: voiceScore(top) >= 55 };
  }
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
  function parseReply(s) {
    let fix = "";
    const fm = s.match(/\[\s*FIX:\s*([^\]]+)\]/i);
    if (fm) {
      fix = fm[1].trim();
      s = s.replace(fm[0], "").trim();
    }
    const i = s.indexOf("(");
    const native = i >= 0 ? s.slice(0, i).trim() : s.trim();
    const gloss = i >= 0 ? s.slice(i).replace(/[()]/g, "").trim() : "";
    return { native, gloss, fix };
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
    const silenceRef = useRef(null);
    const finalRef = useRef("");
    const interimRef = useRef("");
    const busyRef = useRef(false);
    const ttsAbort = useRef(null);
    const aiAbort = useRef(null);
    const scrollRef = useRef(null);
    useEffect(() => {
      const base = window.LP_API_BASE || "";
      try {
        fetch(base + "/api/health").catch(() => {
        });
      } catch (e) {
      }
      try {
        if (window.LP_TTS && window.LP_TTS.prewarm) window.LP_TTS.prewarm(m.lang);
      } catch (e) {
      }
      return () => stop();
    }, []);
    useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs, phase, interim]);
    function speak(text) {
      const { voice, good } = bestVoice(m.lang);
      if (SS && good && voice) {
        return new Promise((resolve) => {
          try {
            SS.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = m.code;
            u.voice = voice;
            u.rate = 1;
            u.pitch = 1;
            u.onend = resolve;
            u.onerror = resolve;
            SS.speak(u);
            setTimeout(resolve, Math.min(8e3, 900 + text.length * 70));
          } catch (e) {
            resolve();
          }
        });
      }
      try {
        if (window.LP_TTS && window.LP_TTS.speakOne) {
          ttsAbort.current = new AbortController();
          return window.LP_TTS.speakOne(text, "Kore", ttsAbort.current.signal, m.lang);
        }
      } catch (e) {
      }
      return new Promise((resolve) => {
        if (!SS) {
          resolve();
          return;
        }
        try {
          SS.cancel();
          const u = new SpeechSynthesisUtterance(text);
          u.lang = m.code;
          u.onend = resolve;
          u.onerror = resolve;
          SS.speak(u);
          setTimeout(resolve, 6e3);
        } catch (e) {
          resolve();
        }
      });
    }
    function startListening() {
      if (!activeRef.current || busyRef.current || !SR) return;
      let rec;
      try {
        rec = new SR();
      } catch (e) {
        return;
      }
      recRef.current = rec;
      finalRef.current = "";
      interimRef.current = "";
      rec.lang = m.code;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      setPhase("listening");
      setInterim("");
      const armSilence = () => {
        clearTimeout(silenceRef.current);
        silenceRef.current = setTimeout(() => {
          const text = (finalRef.current + " " + interimRef.current).replace(/\s+/g, " ").trim();
          try {
            rec.stop();
          } catch (e) {
          }
          if (text) handleUser(text);
        }, 650);
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
      rec.onerror = (ev) => {
        if (ev && ev.error === "not-allowed") stop();
      };
      rec.onend = () => {
        clearTimeout(silenceRef.current);
        if (activeRef.current && !busyRef.current && !finalRef.current.trim() && !interimRef.current.trim()) {
          try {
            rec.start();
          } catch (e) {
            startListening();
          }
        }
      };
      try {
        rec.start();
      } catch (e) {
      }
    }
    async function handleUser(text) {
      if (!text) return;
      busyRef.current = true;
      clearTimeout(silenceRef.current);
      setInterim("");
      try {
        recRef.current && recRef.current.stop();
      } catch (e) {
      }
      setMsgs((x) => x.concat([{ role: "you", native: text }]));
      setPhase("thinking");
      try {
        aiAbort.current = new AbortController();
        const prompt = `You are ${m.tutor}, a warm, patient ${m.name} conversation partner for an A1 beginner learning ${m.name} for study abroad. The student just said: "${text}".
1) If their ${m.name} has a clear grammar/spelling/word mistake, begin with [FIX: the corrected short phrase].
2) Then reply with ONE short, simple ${m.name} sentence that responds AND asks one easy follow-up question.
3) End with the English translation in parentheses.
Keep it short and encouraging. If they spoke English, gently nudge them to try ${m.name}. Output only that.`;
        const raw = await aiReply(prompt, aiAbort.current.signal);
        if (!activeRef.current) return;
        const { native, gloss, fix } = parseReply(raw || m.fallback);
        setMsgs((x) => x.concat([{ role: "tutor", native: native || m.fallback, gloss, fix }]));
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
      activeRef.current = true;
      setActive(true);
      const first = msgs.length === 0;
      if (first) setMsgs([{ role: "tutor", native: m.hi, gloss: m.hiEn }]);
      busyRef.current = true;
      setPhase("speaking");
      await speak(first ? m.hi : m.cont);
      busyRef.current = false;
      if (activeRef.current) startListening();
    }
    function stop() {
      activeRef.current = false;
      busyRef.current = false;
      setActive(false);
      setPhase("idle");
      setInterim("");
      clearTimeout(silenceRef.current);
      try {
        recRef.current && recRef.current.stop();
      } catch (e) {
      }
      try {
        ttsAbort.current && ttsAbort.current.abort();
      } catch (e) {
      }
      try {
        SS && SS.cancel();
      } catch (e) {
      }
      try {
        aiAbort.current && aiAbort.current.abort();
      } catch (e) {
      }
    }
    const statusText = phase === "listening" ? "\u{1F399}\uFE0F Listening\u2026 just talk" : phase === "thinking" ? "\u{1F4AD} " + m.tutor + " is replying\u2026" : phase === "speaking" ? "\u{1F50A} " + m.tutor + " is speaking\u2026" : "Press Start to begin a real conversation";
    return /* @__PURE__ */ React.createElement("div", { className: "lang-speak" }, /* @__PURE__ */ React.createElement("div", { className: "lang-speak-head" }, /* @__PURE__ */ React.createElement("div", { className: "lang-speak-avatar" + (phase === "speaking" ? " talking" : phase === "listening" ? " listening" : "") }, "\u{1F5E3}\uFE0F"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, m.tutor), /* @__PURE__ */ React.createElement("span", { className: "muted" }, " \xB7 your ", m.name, " conversation partner"))), /* @__PURE__ */ React.createElement("div", { className: "lang-chat", ref: scrollRef }, msgs.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "lang-speak-empty" }, "\u{1F44B} Press ", /* @__PURE__ */ React.createElement("strong", null, "Start"), " and say hello in ", m.name, ". ", m.tutor, " listens the moment you stop talking, gently corrects mistakes, and keeps chatting \u2014 no buttons to press."), msgs.map((mm, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "lang-bubble " + (mm.role === "you" ? "you" : "tutor") }, mm.fix && /* @__PURE__ */ React.createElement("div", { className: "lb-fix" }, "\u270F\uFE0F ", mm.fix), /* @__PURE__ */ React.createElement("div", { className: "lb-native" }, mm.role === "tutor" && /* @__PURE__ */ React.createElement("button", { className: "lang-say", title: "Hear it again", onClick: () => speak(mm.native) }, "\u{1F50A}"), mm.native), mm.gloss && /* @__PURE__ */ React.createElement("div", { className: "lb-gloss" }, mm.gloss))), interim && /* @__PURE__ */ React.createElement("div", { className: "lang-bubble you interim" }, /* @__PURE__ */ React.createElement("div", { className: "lb-native" }, interim, "\u2026"))), /* @__PURE__ */ React.createElement("div", { className: "lang-speak-controls" }, /* @__PURE__ */ React.createElement("div", { className: "lang-speak-status s-" + phase }, statusText), SR ? active ? /* @__PURE__ */ React.createElement("button", { className: "btn lang-stop", onClick: stop }, "\u23F9 Stop conversation") : /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary lang-start", onClick: start }, "\u25B6 Start conversation") : /* @__PURE__ */ React.createElement("form", { className: "lang-type", onSubmit: (e) => {
      e.preventDefault();
      const t = typed;
      setTyped("");
      if (!activeRef.current) {
        activeRef.current = true;
        setActive(true);
      }
      busyRef.current = true;
      handleUser(t);
    } }, /* @__PURE__ */ React.createElement("input", { className: "lc-input", placeholder: "Type in " + m.name + "\u2026 (your browser has no mic input)", value: typed, onChange: (e) => setTyped(e.target.value) }), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", type: "submit", disabled: !typed.trim() }, "Send"))), /* @__PURE__ */ React.createElement("p", { className: "tool-note", style: { marginTop: 10 } }, "\u{1F4A1} Hands-free: press Start and just speak. ", m.tutor, " understands the moment you pause, replies in a natural voice, and shows a \u270F\uFE0F correction when you slip. Mistakes are welcome \u2014 that's how you learn!"));
  }
  window.LP_LangSpeak = LangSpeak;
})();
