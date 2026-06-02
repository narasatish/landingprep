(function() {
  const KEY_STORAGE = "lp_gemini_key";
  const MODEL = "gemini-2.5-flash-preview-tts";
  const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const SAMPLE_RATE = 24e3;
  const CACHE_PREFIX = "lp_tts_cache_";
  function getApiKey() {
    return localStorage.getItem(KEY_STORAGE) || "";
  }
  function setApiKey(k) {
    if (k) localStorage.setItem(KEY_STORAGE, k);
    else localStorage.removeItem(KEY_STORAGE);
  }
  function isEnabled() {
    try {
      return localStorage.getItem("lp_tts_off") !== "1";
    } catch (e) {
      return true;
    }
  }
  function base64ToBytes(b64) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function pcmToWavBlob(pcmBytes, sampleRate) {
    const dataLen = pcmBytes.length;
    const buffer = new ArrayBuffer(44 + dataLen);
    const view = new DataView(buffer);
    const writeString = (off, s) => {
      for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
    };
    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataLen, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, dataLen, true);
    new Uint8Array(buffer, 44).set(pcmBytes);
    return new Blob([buffer], { type: "audio/wav" });
  }
  function cacheKey(text, voice) {
    let h = 0;
    const s = voice + "|" + text;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return CACHE_PREFIX + h.toString(36) + "_" + s.length;
  }
  function getCached(text, voice) {
    try {
      return sessionStorage.getItem(cacheKey(text, voice));
    } catch (e) {
      return null;
    }
  }
  function setCached(text, voice, b64) {
    try {
      sessionStorage.setItem(cacheKey(text, voice), b64);
    } catch (e) {
    }
  }
  async function fetchTTSBase64(text, voiceName, lang) {
    const ck = voiceName + "|" + (lang || "en");
    const cached = getCached(text, ck);
    if (cached) return cached;
    const base = window.LP_API_BASE || "";
    const res = await fetch(base + "/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voiceName, lang: lang || "en" })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`TTS ${res.status}: ${err.slice(0, 160)}`);
    }
    const json = await res.json();
    const b64 = json && json.audio;
    if (!b64) throw new Error("Empty audio from TTS proxy");
    setCached(text, ck, b64);
    return b64;
  }
  async function speakOne(text, voiceName, signal, lang) {
    const b64 = await fetchTTSBase64(text, voiceName, lang);
    if (signal == null ? void 0 : signal.aborted) return;
    const pcm = base64ToBytes(b64);
    const wavBlob = pcmToWavBlob(pcm, SAMPLE_RATE);
    const url = URL.createObjectURL(wavBlob);
    return new Promise((resolve) => {
      const audio = new Audio(url);
      const cleanup = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onended = cleanup;
      audio.onerror = cleanup;
      if (signal) {
        signal.addEventListener("abort", () => {
          try {
            audio.pause();
          } catch (e) {
          }
          cleanup();
        }, { once: true });
      }
      audio.play().catch(cleanup);
    });
  }
  function splitIntoChunks(text, maxChars) {
    if (text.length <= maxChars) return [text];
    const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
    const chunks = [];
    let current = "";
    for (const s of sentences) {
      if ((current + s).length > maxChars && current.length > 0) {
        chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length ? chunks : [text.slice(0, maxChars)];
  }
  async function playScript(script, opts = {}) {
    const { signal, onProgress } = opts;
    const lines = script.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const voicePool = ["Kore", "Puck", "Sulafat", "Charon", "Aoede", "Fenrir"];
    const speakerMap = {};
    let scriptHash = 0;
    for (let i = 0; i < script.length; i++) scriptHash = scriptHash * 31 + script.charCodeAt(i) & 2147483647;
    let nextSlot = opts.voiceOffset != null ? opts.voiceOffset : scriptHash % voicePool.length;
    let prevSpeaker = null;
    const MAX_CHUNK = 380;
    for (let i = 0; i < lines.length; i++) {
      if (signal == null ? void 0 : signal.aborted) return;
      const line = lines[i];
      const m = line.match(/^([A-Z][A-Za-z .'-]{1,30}):\s+(.+)$/);
      let speaker, text;
      if (m) {
        speaker = m[1];
        text = m[2];
      } else {
        speaker = "_narrator";
        text = line;
      }
      if (!(speaker in speakerMap)) {
        speakerMap[speaker] = voicePool[nextSlot % voicePool.length];
        nextSlot++;
      }
      const voice = speakerMap[speaker];
      onProgress && onProgress({ lineIdx: i, total: lines.length, speaker, text, voice });
      const chunks = splitIntoChunks(text, MAX_CHUNK);
      for (const chunk of chunks) {
        if (signal == null ? void 0 : signal.aborted) return;
        if (!chunk) continue;
        try {
          await speakOne(chunk, voice, signal);
        } catch (e) {
          console.error("Gemini TTS chunk failed:", e.message);
        }
        if (signal == null ? void 0 : signal.aborted) return;
      }
      const pause = speaker !== prevSpeaker ? 90 : 30;
      await new Promise((r) => setTimeout(r, pause));
      prevSpeaker = speaker;
    }
  }
  const { useState } = React;
  function SettingsModal({ open, onClose }) {
    const [key, setKey] = useState(getApiKey());
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    if (!open) return null;
    const save = () => {
      setApiKey(key.trim());
      onClose();
    };
    const clear = () => {
      setApiKey("");
      setKey("");
      setTestResult(null);
    };
    const test = async () => {
      if (!key.trim()) return;
      setTesting(true);
      setTestResult(null);
      const prev = getApiKey();
      setApiKey(key.trim());
      try {
        const b64 = await fetchTTSBase64("Hello! This is a test of natural voice output.", "Kore");
        const pcm = base64ToBytes(b64);
        const wav = pcmToWavBlob(pcm, SAMPLE_RATE);
        const url = URL.createObjectURL(wav);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        audio.play();
        setTestResult({ ok: true, msg: "\u2713 Working! You should hear Kore say a test sentence." });
      } catch (e) {
        setTestResult({ ok: false, msg: "\u2717 " + e.message });
        setApiKey(prev || "");
      } finally {
        setTesting(false);
      }
    };
    return React.createElement(
      "div",
      {
        className: "settings-modal-overlay",
        onClick: onClose
      },
      React.createElement(
        "div",
        {
          className: "settings-modal",
          onClick: (e) => e.stopPropagation()
        },
        React.createElement(
          "div",
          { className: "settings-header" },
          React.createElement("h2", null, "Natural Voice Settings"),
          React.createElement("button", { className: "btn-icon", onClick: onClose, "aria-label": "Close" }, "\xD7")
        ),
        React.createElement(
          "p",
          { className: "settings-sub" },
          "Enable studio-quality TTS for IELTS Listening and the AI Speaking examiner using Google's Gemini API. Free tier available at ",
          React.createElement("a", { href: "https://aistudio.google.com/apikey", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--accent)", textDecoration: "underline" } }, "aistudio.google.com/apikey"),
          "."
        ),
        React.createElement("label", { className: "settings-label" }, "Gemini API Key"),
        React.createElement("input", {
          type: "password",
          className: "settings-input",
          placeholder: "AIzaSy\u2026",
          value: key,
          onChange: (e) => setKey(e.target.value),
          autoComplete: "off"
        }),
        React.createElement(
          "p",
          { className: "settings-note" },
          "Stored only on your device (localStorage). Never sent anywhere except directly to Google's API."
        ),
        testResult && React.createElement("div", {
          className: "settings-result " + (testResult.ok ? "ok" : "err")
        }, testResult.msg),
        React.createElement(
          "div",
          { className: "settings-actions" },
          React.createElement("button", {
            className: "btn",
            onClick: test,
            disabled: !key.trim() || testing
          }, testing ? "Testing\u2026" : "Test voice"),
          React.createElement("button", {
            className: "btn",
            onClick: clear,
            disabled: !getApiKey()
          }, "Clear key"),
          React.createElement("button", {
            className: "btn btn-primary",
            onClick: save
          }, "Save")
        ),
        isEnabled() && React.createElement(
          "div",
          { className: "settings-status" },
          "\u{1F7E2} Natural voice is enabled. Listening audio and the AI examiner will now use Gemini voices."
        )
      )
    );
  }
  async function prewarm(lang) {
    try {
      await fetchTTSBase64(lang === "de" ? "Hallo!" : lang === "fr" ? "Bonjour !" : "Hello!", "Kore", lang || "en");
    } catch (e) {
    }
  }
  window.LP_TTS = {
    isEnabled,
    getApiKey,
    setApiKey,
    speakOne,
    playScript,
    prewarm,
    SettingsModal,
    voices: { female1: "Kore", male1: "Puck", female2: "Sulafat", male2: "Charon", female3: "Aoede", male3: "Fenrir" }
  };
})();
