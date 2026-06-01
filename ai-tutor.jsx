// ai-tutor.jsx — Live AI Tutor engine
// All Gemini calls now go through the backend at /api/ai-tutor/chat.
// The Gemini API key lives in server .env — never in the frontend.
//
// Exports: window.LP_AI_TUTOR
//
// LP_AI_TUTOR.chat(messages, onChunk, onDone, onError)
//   messages : [{role:"user"|"bot", text:"..."}]
//   onChunk  : called with each streamed text piece
//   onDone   : called when complete with full text
//   onError  : called with error string (fallback shown)

(function () {
  // ── Backend endpoint resolution ─────────────────────────────────────────
  // Prefer SAME-ORIGIN so the AI features work whichever port you run
  // `node server.js` on (e.g. PORT=5500). Fall back to localhost:3001 only if
  // same-origin has no API (a split dev setup). Resolved by checkBackend().
  let API_BASE = ""; // same-origin by default (production + single-server dev)
  const API_CANDIDATES = (() => {
    const loc = window.location;
    const list = [];
    if (window.LP_API_BASE) list.push(window.LP_API_BASE); // explicit cloud backend (Render)
    list.push("");                                          // same-origin
    if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") list.push("http://localhost:3001");
    return list;
  })();

  // ── Exam meta for context injection ──────────────────────────────────────
  const EXAM_META = {
    ielts:    { name: "IELTS",     scale: "Band 0–9",      sections: "Listening, Reading, Writing, Speaking" },
    toefl:    { name: "TOEFL iBT", scale: "0–120",         sections: "Reading, Listening, Speaking, Writing" },
    pte:      { name: "PTE Academic & Core", scale: "10–90", sections: "Speaking & Writing, Reading, Listening" },
    celpip:   { name: "CELPIP",    scale: "CLB 1–12",      sections: "Listening, Reading, Writing, Speaking" },
    duolingo: { name: "Duolingo English Test", scale: "10–160", sections: "Literacy, comprehension, conversation, production" },
    gre:      { name: "GRE General", scale: "V+Q 260–340, AW 0–6", sections: "Analytical Writing, Verbal, Quantitative" },
    gmat:     { name: "GMAT Focus", scale: "205–805",      sections: "Quantitative, Verbal, Data Insights" },
  };

  function getPageContext() {
    const hash  = window.location.hash || "";
    const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const examId = parts[1] || null;
    return {
      exam:    examId,
      section: parts[2] || null,
      mode:    "practice",
    };
  }

  // ── Offline message (shown when backend is unreachable) ─────────────────
  const OFFLINE_MSG = "⚠️ AI Tutor is offline. Please start the backend server to use this feature.\n\nRun: node server.js\n\nMake sure your GEMINI_API_KEY is set in the .env file.";

  function fallbackReply(_msg) {
    return OFFLINE_MSG;
  }

  // ── Backend health check (runs once on load) ────────────────────────────
  let _backendAvailable = null; // null=unknown, true/false

  let _backendPromise = null;
  async function checkBackend() {
    if (_backendAvailable !== null) return _backendAvailable;
    if (_backendPromise) return _backendPromise;        // dedupe concurrent probes
    _backendPromise = (async () => {
      for (const base of API_CANDIDATES) {
        try {
          const r = await fetch(base + "/api/health", { signal: AbortSignal.timeout(2500) });
          if (r.ok) { API_BASE = base; _backendAvailable = true; return true; }
        } catch (_) { /* try next candidate */ }
      }
      _backendAvailable = false;
      console.warn("[LP_AI_TUTOR] Backend not reachable (tried: " + API_CANDIDATES.map(b => b || "same-origin").join(", ") + "). Using offline mode.");
      return _backendAvailable;
    })();
    return _backendPromise;
  }

  // Kick off health check immediately (async — result cached)
  checkBackend();

  // ── Abort controller ─────────────────────────────────────────────────────
  let _abortCtrl = null;

  // ── Public API ────────────────────────────────────────────────────────────
  const LP_AI_TUTOR = {
    // These are kept for backward compatibility but no longer store the key —
    // the key lives in server .env only.
    hasKey: () => _backendAvailable !== false,
    getKey: () => "",        // always empty — key is server-side
    setKey: () => {},        // no-op
    isBackendAvailable: () => _backendAvailable,

    fallbackReply,

    // chat(messages, onChunk, onDone, onError)
    async chat(messages, onChunk, onDone, onError) {
      // Abort any in-progress request
      if (_abortCtrl) { try { _abortCtrl.abort(); } catch (_) {} }
      _abortCtrl = new AbortController();

      const available = await checkBackend();

      if (!available) {
        const reply = fallbackReply(messages[messages.length - 1]?.text || messages[messages.length - 1]?.content || "");
        onChunk(reply);
        onDone(reply);
        return;
      }

      const ctx = getPageContext();

      // Convert internal message format → API format
      const apiMessages = messages
        .filter(m => !m.streaming)
        .map(m => ({
          role: (m.role === "bot" || m.role === "assistant") ? "assistant" : "user",
          content: m.text || m.content || "",
        }));

      try {
        const resp = await fetch(API_BASE + "/api/ai-tutor/chat?stream=1", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, context: ctx }),
          signal: _abortCtrl.signal,
        });

        if (!resp.ok) {
          // Non-2xx — parse error message
          const errJson = await resp.json().catch(() => ({}));
          if (errJson.fallback) {
            // Server returned a graceful fallback indicator
            const reply = fallbackReply(messages[messages.length - 1]?.text || "");
            onChunk(reply);
            onDone(reply);
            return;
          }
          throw new Error(errJson.error || `HTTP ${resp.status}`);
        }

        // Read SSE stream
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full   = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") { onDone(full); return; }
            try {
              const j = JSON.parse(data);
              const chunk = j.text || "";
              if (chunk) {
                full += chunk;
                onChunk(chunk);
              }
            } catch (_) {}
          }
        }
        onDone(full);

      } catch (e) {
        if (e.name === "AbortError") { onDone(""); return; }
        console.warn("[LP_AI_TUTOR] chat error:", e.message);
        onError?.(e.message);
        // Show fallback
        const reply = fallbackReply(messages[messages.length - 1]?.text || "");
        onChunk(reply);
        onDone(reply);
      }
    },

    abort() {
      try { _abortCtrl?.abort(); } catch (_) {}
    },

    // One-shot generation — returns a Promise<string>
    async generate(promptText) {
      await checkBackend();
      if (_backendAvailable === false) {
        return fallbackReply(promptText);
      }
      const resp = await fetch(API_BASE + "/api/ai-tutor/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: promptText }] }),
      });
      if (!resp.ok) throw new Error("Server error " + resp.status);
      const data = await resp.json();
      return data.answer || data.text || "";
    },
  };

  window.LP_AI_TUTOR = LP_AI_TUTOR;
})();
