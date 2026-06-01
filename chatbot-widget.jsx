// chatbot-widget.jsx — AI Tutor floating widget + full-page expand
// API key is now on the backend — no key input in this UI.
(function () {
  const { useState, useRef, useEffect, useCallback } = React;

  // ── Starter questions ────────────────────────────────────────────────────
  const STARTERS = [
    "How do I reach Band 7 in IELTS Writing?",
    "What is the TOEFL iBT score structure?",
    "Tips for PTE Read Aloud?",
    "How does CELPIP Writing Task 1 work?",
    "GRE Verbal strategies?",
    "GMAT Data Sufficiency tips?",
    "IELTS Speaking Part 2 — how to extend my answer?",
    "What are the most common IELTS Listening traps?",
  ];

  // ── Single message bubble ─────────────────────────────────────────────────
  function Bubble({ msg }) {
    const isUser = msg.role === "user";
    return (
      <div
        className={`chat-bubble ${isUser ? "chat-user" : "chat-agent"}`}
        style={{ alignSelf: isUser ? "flex-end" : "flex-start" }}
      >
        {!isUser && (
          <div className="bubble-label">✨ AI Tutor</div>
        )}
        <div className={"bubble-text" + (isUser ? "" : " md-body")} style={isUser ? { whiteSpace: "pre-wrap" } : undefined}>
          {isUser || !window.LP_MD ? msg.text : window.LP_MD(msg.text)}
          {msg.streaming && <span className="typing-cursor">▍</span>}
        </div>
      </div>
    );
  }

  // ── Typing dots placeholder ───────────────────────────────────────────────
  function TypingDots() {
    return (
      <div className="chat-bubble chat-agent" style={{ alignSelf: "flex-start" }}>
        <div className="bubble-label">✨ AI Tutor</div>
        <div className="bubble-text typing-dots"><span /><span /><span /></div>
      </div>
    );
  }

  // ── Chat body (shared between panel and fullpage) ─────────────────────────
  function ChatBody({ msgs, loading, endRef }) {
    return (
      <div className="cpf-body">
        {msgs.map((m, i) => <Bubble key={i} msg={m} />)}
        {loading && msgs[msgs.length - 1]?.streaming && msgs[msgs.length - 1]?.text === "" && (
          <TypingDots />
        )}
        <div ref={endRef} />
      </div>
    );
  }

  // ── Input row ─────────────────────────────────────────────────────────────
  function InputRow({ input, setInput, loading, onSend, onStop, inputRef, expanded }) {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
    };
    return (
      <div className="cpf-input">
        <textarea
          ref={inputRef}
          className="cpf-textarea"
          placeholder="Ask your AI tutor…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={expanded ? 2 : 1}
          disabled={loading}
          style={{ resize: "none", overflowY: "hidden" }}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, expanded ? 120 : 100) + "px";
          }}
        />
        {loading ? (
          <button className="send send--stop" onClick={onStop} title="Stop">⏹</button>
        ) : (
          <button className="send" onClick={onSend} disabled={!input.trim()} title="Send (Enter)">↑</button>
        )}
      </div>
    );
  }

  // ── Main widget ───────────────────────────────────────────────────────────
  function ChatbotWidget() {
    const [open,     setOpen]     = useState(false);
    const [expanded, setExpanded] = useState(false); // full-page mode
    const [msgs,     setMsgs]     = useState([{
      role: "bot",
      text: "Hi! I'm your LandingPrep AI tutor. Ask me about IELTS band scores, TOEFL strategy, GRE verbal, GMAT Data Insights, writing feedback, or model answers.\n\nNote: the AI Tutor requires the backend server to be running (node server.js).",
    }]);
    const [input,   setInput]   = useState("");
    const [loading, setLoading] = useState(false);
    const [unread,  setUnread]  = useState(0);
    const [error,   setError]   = useState("");
    const endRef   = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom
    useEffect(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [msgs, open, expanded]);

    // Clear unread when opened
    useEffect(() => { if (open) setUnread(0); }, [open]);

    // Focus input
    useEffect(() => {
      if ((open || expanded) && !loading) {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    }, [open, expanded]);

    const appendBot = useCallback((text, streaming = false) => {
      setMsgs(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "bot" && last?.streaming) {
          return [...prev.slice(0, -1), { ...last, text, streaming }];
        }
        return [...prev, { role: "bot", text, streaming }];
      });
    }, []);

    const send = useCallback(async (textOverride) => {
      const t = (textOverride || input).trim();
      if (!t || loading) return;
      setInput("");
      setError("");
      setLoading(true);

      const userMsg = { role: "user", text: t };
      const historyWithUser = [...msgs.filter(m => !m.streaming), userMsg];
      setMsgs(historyWithUser);

      // Streaming placeholder
      appendBot("", true);

      let accumulated = "";
      await window.LP_AI_TUTOR.chat(
        historyWithUser,
        (chunk) => {
          accumulated += chunk;
          appendBot(accumulated, true);
          if (!open) setUnread(n => n + 1);
        },
        (full) => {
          appendBot(full || accumulated, false);
          setLoading(false);
        },
        (errMsg) => {
          setError("Something went wrong. Showing a cached answer.");
          setLoading(false);
          console.warn("[chatbot]", errMsg);
        }
      );
    }, [input, loading, msgs, open, appendBot]);

    const stop = () => {
      window.LP_AI_TUTOR?.abort?.();
      setLoading(false);
    };

    const showStarters = msgs.filter(m => m.role === "user").length === 0;

    // ── Full-page modal ─────────────────────────────────────────────────────
    if (expanded) {
      return (
        <div className="cpf-fullpage">
          <div className="cpf-fullpage-inner">
            {/* Header */}
            <div className="cpf-head cpf-head--full">
              <div className="cpf-head-left">
                <span className="cpf-title">✨ AI Tutor</span>
              </div>
              <div className="cpf-head-right">
                <button className="cpf-tab-btn" title="Compact view" onClick={() => setExpanded(false)}>⊡</button>
                <button className="cpf-close" onClick={() => { setExpanded(false); setOpen(false); }}>×</button>
              </div>
            </div>

            {error && <div className="cpf-error">{error}</div>}

            <ChatBody msgs={msgs} loading={loading} endRef={endRef} />

            {showStarters && (
              <div className="cpf-starters cpf-starters--full">
                {STARTERS.map((s, i) => (
                  <button key={i} className="cpf-starter-chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}

            <InputRow
              input={input} setInput={setInput} loading={loading}
              onSend={send} onStop={stop} inputRef={inputRef} expanded={true}
            />
          </div>
        </div>
      );
    }

    // ── Floating panel ──────────────────────────────────────────────────────
    return (
      <>
        {open && (
          <div className="chat-panel-floating">
            {/* Header */}
            <div className="cpf-head">
              <div className="cpf-head-left">
                <span className="cpf-title">✨ AI Tutor</span>
              </div>
              <div className="cpf-head-right">
                <button
                  className="cpf-tab-btn"
                  title="Expand to full page"
                  onClick={() => setExpanded(true)}
                >⊞</button>
                <button className="cpf-close" onClick={() => setOpen(false)}>×</button>
              </div>
            </div>

            {error && <div className="cpf-error">{error}</div>}

            <ChatBody msgs={msgs} loading={loading} endRef={endRef} />

            {showStarters && (
              <div className="cpf-starters">
                {STARTERS.slice(0, 6).map((s, i) => (
                  <button key={i} className="cpf-starter-chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}

            <InputRow
              input={input} setInput={setInput} loading={loading}
              onSend={send} onStop={stop} inputRef={inputRef} expanded={false}
            />
          </div>
        )}

        {/* FAB */}
        <button
          className={`chat-fab chat-fab--ai ${open ? "is-open" : ""}`}
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close AI tutor" : "Open AI tutor"}
          title="AI Tutor"
        >
          {open
            ? <span style={{ fontSize: 22, lineHeight: 1 }}>×</span>
            : <>
                <span style={{ fontSize: 20 }}>✨</span>
                {unread > 0 && <span className="cpf-badge">{unread}</span>}
              </>
          }
        </button>
      </>
    );
  }

  window.LP_ChatbotWidget = ChatbotWidget;
})();
