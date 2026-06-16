// Gemini 2.5 TTS integration — natural human-quality voices
// Free tier: https://aistudio.google.com/apikey
//
// Voices used:
//   Kore     — firm female (default narrator / receptionist / examiner)
//   Puck     — upbeat male (second speaker)
//   Sulafat  — warm female (third speaker)
//   Charon   — informative male (fourth speaker)
//   Aoede    — breezy female
//   Fenrir   — excitable male

(function () {
  const KEY_STORAGE = "lp_gemini_key";
  const MODEL = "gemini-2.5-flash-preview-tts";
  const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const SAMPLE_RATE = 24000;
  const CACHE_PREFIX = "lp_tts_cache_";

  // ── Key management ────────────────────────────────────────────────────
  function getApiKey() { return localStorage.getItem(KEY_STORAGE) || ""; }
  function setApiKey(k) {
    if (k) localStorage.setItem(KEY_STORAGE, k);
    else localStorage.removeItem(KEY_STORAGE);
  }
  // Natural voice is served by the backend /api/tts proxy, so it's ON by default
  // (no client key needed). Users can opt out via the lp_tts_off flag.
  function isEnabled() { try { return localStorage.getItem("lp_tts_off") !== "1"; } catch (e) { return true; } }

  // ── PCM → WAV conversion ──────────────────────────────────────────────
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
    const writeString = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataLen, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);   // subchunk1 size
    view.setUint16(20, 1, true);    // PCM
    view.setUint16(22, 1, true);    // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true);    // block align
    view.setUint16(34, 16, true);   // bits per sample
    writeString(36, "data");
    view.setUint32(40, dataLen, true);
    new Uint8Array(buffer, 44).set(pcmBytes);
    return new Blob([buffer], { type: "audio/wav" });
  }

  // ── Cache: store small base64 chunks in sessionStorage ────────────────
  // Audio is ~100KB/30sec at 24kHz mono; sessionStorage gives us ~5MB.
  function cacheKey(text, voice) {
    // Lightweight hash
    let h = 0;
    const s = voice + "|" + text;
    for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return CACHE_PREFIX + h.toString(36) + "_" + s.length;
  }
  function getCached(text, voice) {
    try { return sessionStorage.getItem(cacheKey(text, voice)); }
    catch (e) { return null; }
  }
  function setCached(text, voice, b64) {
    try { sessionStorage.setItem(cacheKey(text, voice), b64); }
    catch (e) { /* quota exceeded — silently drop */ }
  }

  // ── API call ──────────────────────────────────────────────────────────
  async function fetchTTSBase64(text, voiceName, lang) {
    const ck = voiceName + "|" + (lang || "en");
    const cached = getCached(text, ck);
    if (cached) return cached;

    // Call the backend TTS proxy (it holds the Gemini key) — natural neural voice
    // without exposing any key in the browser. lang ("de"/"fr"/...) = native accent.
    const base = (window.LP_API_BASE || "");
    const res = await fetch(base + "/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voiceName, lang: lang || "en" }),
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

  // ── Play a single line ────────────────────────────────────────────────
  // Returns a Promise<void> that resolves when audio finishes (or aborts).
  async function speakOne(text, voiceName, signal, lang) {
    const b64 = await fetchTTSBase64(text, voiceName, lang);
    if (signal?.aborted) return;
    const pcm = base64ToBytes(b64);
    const wavBlob = pcmToWavBlob(pcm, SAMPLE_RATE);
    const url = URL.createObjectURL(wavBlob);
    return new Promise((resolve) => {
      const audio = new Audio(url);
      const cleanup = () => { URL.revokeObjectURL(url); resolve(); };
      audio.onended = cleanup;
      audio.onerror = cleanup;
      if (signal) {
        signal.addEventListener("abort", () => { try { audio.pause(); } catch(e){} cleanup(); }, { once: true });
      }
      audio.play().catch(cleanup);
    });
  }

  // ── Play a multi-voice script ─────────────────────────────────────────
  // Parses "Speaker: text" lines and routes each speaker to a distinct voice.
  // Returns a Promise<void> that resolves when finished or aborted.
  // Split text into chunks ≤ MAX_CHARS at sentence boundaries
  function splitIntoChunks(text, maxChars) {
    if (text.length <= maxChars) return [text];
    // Split at sentence boundaries: period/exclamation/question followed by space or end
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
    const lines = script.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const voicePool = ["Kore", "Puck", "Sulafat", "Charon", "Aoede", "Fenrir"];
    const speakerMap = {}; // speaker name → voice index
    // Start voice assignment at a per-script offset so different lectures /
    // sentences / conversations use DIFFERENT voices (not always Kore) — variety
    // across items without any renderer change. Multi-speaker scripts still get
    // distinct voices because slots advance sequentially from this offset.
    let scriptHash = 0;
    for (let i = 0; i < script.length; i++) scriptHash = (scriptHash * 31 + script.charCodeAt(i)) & 0x7fffffff;
    let nextSlot = opts.voiceOffset != null ? opts.voiceOffset : (scriptHash % voicePool.length);
    let prevSpeaker = null;
    const MAX_CHUNK = 380; // Gemini TTS works best under ~400 chars

    for (let i = 0; i < lines.length; i++) {
      if (signal?.aborted) return;
      const line = lines[i];
      const m = line.match(/^([A-Z][A-Za-z .'-]{1,30}):\s+(.+)$/);
      let speaker, text;
      if (m) { speaker = m[1]; text = m[2]; }
      else { speaker = "_narrator"; text = line; }

      if (!(speaker in speakerMap)) {
        speakerMap[speaker] = voicePool[nextSlot % voicePool.length];
        nextSlot++;
      }
      const voice = speakerMap[speaker];
      onProgress && onProgress({ lineIdx: i, total: lines.length, speaker, text, voice });

      // Split long lines so Gemini never gets too many chars at once
      const chunks = splitIntoChunks(text, MAX_CHUNK);
      for (const chunk of chunks) {
        if (signal?.aborted) return;
        if (!chunk) continue;
        try {
          await speakOne(chunk, voice, signal);
        } catch (e) {
          console.error("Gemini TTS chunk failed:", e.message);
          // continue — skip failed chunk, keep going
        }
        if (signal?.aborted) return;
      }

      // Very short pause between turns — only slightly longer when speaker changes
      const pause = speaker !== prevSpeaker ? 90 : 30;
      await new Promise(r => setTimeout(r, pause));
      prevSpeaker = speaker;
    }
  }

  // ── Settings modal component ──────────────────────────────────────────
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
      setTesting(true); setTestResult(null);
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
        setTestResult({ ok: true, msg: "✓ Working! You should hear Kore say a test sentence." });
      } catch (e) {
        setTestResult({ ok: false, msg: "✗ " + e.message });
        setApiKey(prev || "");
      } finally {
        setTesting(false);
      }
    };

    return React.createElement("div", {
      className: "settings-modal-overlay",
      onClick: onClose,
    },
      React.createElement("div", {
        className: "settings-modal",
        onClick: (e) => e.stopPropagation(),
      },
        React.createElement("div", { className: "settings-header" },
          React.createElement("h2", null, "Natural Voice Settings"),
          React.createElement("button", { className: "btn-icon", onClick: onClose, "aria-label": "Close" }, "×")
        ),

        React.createElement("p", { className: "settings-sub" },
          "Enable studio-quality TTS for IELTS Listening and the speaking examiner using Google's Gemini API. Free tier available at ",
          React.createElement("a", { href: "https://aistudio.google.com/apikey", target: "_blank", rel: "noopener noreferrer", style: { color: "var(--accent)", textDecoration: "underline" } }, "aistudio.google.com/apikey"),
          "."
        ),

        React.createElement("label", { className: "settings-label" }, "Gemini API Key"),
        React.createElement("input", {
          type: "password",
          className: "settings-input",
          placeholder: "AIzaSy…",
          value: key,
          onChange: (e) => setKey(e.target.value),
          autoComplete: "off",
        }),
        React.createElement("p", { className: "settings-note" },
          "Stored only on your device (localStorage). Never sent anywhere except directly to Google's API."
        ),

        testResult && React.createElement("div", {
          className: "settings-result " + (testResult.ok ? "ok" : "err")
        }, testResult.msg),

        React.createElement("div", { className: "settings-actions" },
          React.createElement("button", {
            className: "btn",
            onClick: test,
            disabled: !key.trim() || testing,
          }, testing ? "Testing…" : "Test voice"),
          React.createElement("button", {
            className: "btn",
            onClick: clear,
            disabled: !getApiKey(),
          }, "Clear key"),
          React.createElement("button", {
            className: "btn btn-primary",
            onClick: save,
          }, "Save")
        ),

        isEnabled() && React.createElement("div", { className: "settings-status" },
          "🟢 Natural voice is enabled. Listening audio and the speaking examiner will now use Gemini voices."
        )
      )
    );
  }

  // Warm the TTS backend (and cache a short greeting) so the first spoken reply in a
  // conversation isn't delayed by a cold start. Fire-and-forget.
  async function prewarm(lang) {
    try { await fetchTTSBase64(lang === "de" ? "Hallo!" : lang === "fr" ? "Bonjour !" : "Hello!", "Kore", lang || "en"); } catch (e) {}
  }

  // ── Expose API ────────────────────────────────────────────────────────
  window.LP_TTS = {
    isEnabled,
    getApiKey, setApiKey,
    speakOne,
    playScript,
    prewarm,
    SettingsModal,
    voices: { female1: "Kore", male1: "Puck", female2: "Sulafat", male2: "Charon", female3: "Aoede", male3: "Fenrir" },
  };
})();
