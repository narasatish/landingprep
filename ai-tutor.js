(function() {
  let API_BASE = "";
  const API_CANDIDATES = (() => {
    const loc = window.location;
    const list = [];
    if (window.LP_API_BASE) list.push(window.LP_API_BASE);
    list.push("");
    if (loc.hostname === "localhost" || loc.hostname === "127.0.0.1") list.push("http://localhost:3001");
    return list;
  })();
  const EXAM_META = {
    ielts: { name: "IELTS", scale: "Band 0\u20139", sections: "Listening, Reading, Writing, Speaking" },
    toefl: { name: "TOEFL iBT", scale: "0\u2013120", sections: "Reading, Listening, Speaking, Writing" },
    pte: { name: "PTE Academic & Core", scale: "10\u201390", sections: "Speaking & Writing, Reading, Listening" },
    celpip: { name: "CELPIP", scale: "CLB 1\u201312", sections: "Listening, Reading, Writing, Speaking" },
    duolingo: { name: "Duolingo English Test", scale: "10\u2013160", sections: "Literacy, comprehension, conversation, production" },
    gre: { name: "GRE General", scale: "V+Q 260\u2013340, AW 0\u20136", sections: "Analytical Writing, Verbal, Quantitative" },
    gmat: { name: "GMAT Focus", scale: "205\u2013805", sections: "Quantitative, Verbal, Data Insights" }
  };
  function getPageContext() {
    const hash = window.location.hash || "";
    const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const examId = parts[1] || null;
    return {
      exam: examId,
      section: parts[2] || null,
      mode: "practice"
    };
  }
  const OFFLINE_MSG = "\u26A0\uFE0F Smart Tutor is offline. Please start the backend server to use this feature.\n\nRun: node server.js\n\nMake sure your GEMINI_API_KEY is set in the .env file.";
  function fallbackReply(_msg) {
    return OFFLINE_MSG;
  }
  let _backendAvailable = null;
  let _backendPromise = null;
  async function checkBackend() {
    if (_backendAvailable !== null) return _backendAvailable;
    if (_backendPromise) return _backendPromise;
    _backendPromise = (async () => {
      for (const base of API_CANDIDATES) {
        try {
          const r = await fetch(base + "/api/health", { signal: AbortSignal.timeout(2500) });
          if (r.ok) {
            API_BASE = base;
            _backendAvailable = true;
            return true;
          }
        } catch (_) {
        }
      }
      _backendAvailable = false;
      console.warn("[LP_AI_TUTOR] Backend not reachable (tried: " + API_CANDIDATES.map((b) => b || "same-origin").join(", ") + "). Using offline mode.");
      return _backendAvailable;
    })();
    return _backendPromise;
  }
  checkBackend();
  let _abortCtrl = null;
  const LP_AI_TUTOR = {
    // These are kept for backward compatibility but no longer store the key —
    // the key lives in server .env only.
    hasKey: () => _backendAvailable !== false,
    getKey: () => "",
    // always empty — key is server-side
    setKey: () => {
    },
    // no-op
    isBackendAvailable: () => _backendAvailable,
    fallbackReply,
    // chat(messages, onChunk, onDone, onError)
    async chat(messages, onChunk, onDone, onError) {
      var _a, _b, _c, _d;
      if (_abortCtrl) {
        try {
          _abortCtrl.abort();
        } catch (_) {
        }
      }
      _abortCtrl = new AbortController();
      const available = await checkBackend();
      if (!available) {
        const reply = fallbackReply(((_a = messages[messages.length - 1]) == null ? void 0 : _a.text) || ((_b = messages[messages.length - 1]) == null ? void 0 : _b.content) || "");
        onChunk(reply);
        onDone(reply);
        return;
      }
      const ctx = getPageContext();
      const apiMessages = messages.filter((m) => !m.streaming).map((m) => ({
        role: m.role === "bot" || m.role === "assistant" ? "assistant" : "user",
        content: m.text || m.content || ""
      }));
      try {
        const resp = await fetch(API_BASE + "/api/ai-tutor/chat?stream=1", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, context: ctx }),
          signal: _abortCtrl.signal
        });
        if (!resp.ok) {
          const errJson = await resp.json().catch(() => ({}));
          if (errJson.fallback) {
            const reply = fallbackReply(((_c = messages[messages.length - 1]) == null ? void 0 : _c.text) || "");
            onChunk(reply);
            onDone(reply);
            return;
          }
          throw new Error(errJson.error || `HTTP ${resp.status}`);
        }
        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              onDone(full);
              return;
            }
            try {
              const j = JSON.parse(data);
              const chunk = j.text || "";
              if (chunk) {
                full += chunk;
                onChunk(chunk);
              }
            } catch (_) {
            }
          }
        }
        onDone(full);
      } catch (e) {
        if (e.name === "AbortError") {
          onDone("");
          return;
        }
        console.warn("[LP_AI_TUTOR] chat error:", e.message);
        onError == null ? void 0 : onError(e.message);
        const reply = fallbackReply(((_d = messages[messages.length - 1]) == null ? void 0 : _d.text) || "");
        onChunk(reply);
        onDone(reply);
      }
    },
    abort() {
      try {
        _abortCtrl == null ? void 0 : _abortCtrl.abort();
      } catch (_) {
      }
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
        body: JSON.stringify({ messages: [{ role: "user", content: promptText }] })
      });
      if (!resp.ok) throw new Error("Server error " + resp.status);
      const data = await resp.json();
      return data.answer || data.text || "";
    }
  };
  window.LP_AI_TUTOR = LP_AI_TUTOR;
})();
