(function() {
  const { useState, useRef, useEffect, useCallback } = React;
  const STARTERS = [
    "How do I reach Band 7 in IELTS Writing?",
    "What is the TOEFL iBT score structure?",
    "Tips for PTE Read Aloud?",
    "How does CELPIP Writing Task 1 work?",
    "GRE Verbal strategies?",
    "GMAT Data Sufficiency tips?",
    "IELTS Speaking Part 2 \u2014 how to extend my answer?",
    "What are the most common IELTS Listening traps?"
  ];
  function Bubble({ msg }) {
    const isUser = msg.role === "user";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        className: `chat-bubble ${isUser ? "chat-user" : "chat-agent"}`,
        style: { alignSelf: isUser ? "flex-end" : "flex-start" }
      },
      !isUser && /* @__PURE__ */ React.createElement("div", { className: "bubble-label" }, "\u2728 Smart Tutor"),
      /* @__PURE__ */ React.createElement("div", { className: "bubble-text" + (isUser ? "" : " md-body"), style: isUser ? { whiteSpace: "pre-wrap" } : void 0 }, isUser || !window.LP_MD ? msg.text : window.LP_MD(msg.text), msg.streaming && /* @__PURE__ */ React.createElement("span", { className: "typing-cursor" }, "\u258D"))
    );
  }
  function TypingDots() {
    return /* @__PURE__ */ React.createElement("div", { className: "chat-bubble chat-agent", style: { alignSelf: "flex-start" } }, /* @__PURE__ */ React.createElement("div", { className: "bubble-label" }, "\u2728 Smart Tutor"), /* @__PURE__ */ React.createElement("div", { className: "bubble-text typing-dots" }, /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("span", null)));
  }
  function ChatBody({ msgs, loading, endRef }) {
    var _a, _b;
    return /* @__PURE__ */ React.createElement("div", { className: "cpf-body" }, msgs.map((m, i) => /* @__PURE__ */ React.createElement(Bubble, { key: i, msg: m })), loading && ((_a = msgs[msgs.length - 1]) == null ? void 0 : _a.streaming) && ((_b = msgs[msgs.length - 1]) == null ? void 0 : _b.text) === "" && /* @__PURE__ */ React.createElement(TypingDots, null), /* @__PURE__ */ React.createElement("div", { ref: endRef }));
  }
  function InputRow({ input, setInput, loading, onSend, onStop, inputRef, expanded }) {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    };
    return /* @__PURE__ */ React.createElement("div", { className: "cpf-input" }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        ref: inputRef,
        className: "cpf-textarea",
        placeholder: "Ask your smart tutor\u2026",
        value: input,
        onChange: (e) => setInput(e.target.value),
        onKeyDown: handleKeyDown,
        rows: expanded ? 2 : 1,
        disabled: loading,
        style: { resize: "none", overflowY: "hidden" },
        onInput: (e) => {
          e.target.style.height = "auto";
          e.target.style.height = Math.min(e.target.scrollHeight, expanded ? 120 : 100) + "px";
        }
      }
    ), loading ? /* @__PURE__ */ React.createElement("button", { className: "send send--stop", onClick: onStop, title: "Stop" }, "\u23F9") : /* @__PURE__ */ React.createElement("button", { className: "send", onClick: onSend, disabled: !input.trim(), title: "Send (Enter)" }, "\u2191"));
  }
  function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [msgs, setMsgs] = useState([{
      role: "bot",
      text: "Hi! I'm your LandingPrep smart tutor. Ask me about IELTS band scores, TOEFL strategy, GRE verbal, GMAT Data Insights, writing feedback, or model answers.\n\nNote: the Smart Tutor requires the backend server to be running (node server.js)."
    }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);
    const [error, setError] = useState("");
    const endRef = useRef(null);
    const inputRef = useRef(null);
    useEffect(() => {
      var _a;
      (_a = endRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
    }, [msgs, open, expanded]);
    useEffect(() => {
      if (open) setUnread(0);
    }, [open]);
    useEffect(() => {
      if ((open || expanded) && !loading) {
        setTimeout(() => {
          var _a;
          return (_a = inputRef.current) == null ? void 0 : _a.focus();
        }, 150);
      }
    }, [open, expanded]);
    const appendBot = useCallback((text, streaming = false) => {
      setMsgs((prev) => {
        const last = prev[prev.length - 1];
        if ((last == null ? void 0 : last.role) === "bot" && (last == null ? void 0 : last.streaming)) {
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
      const historyWithUser = [...msgs.filter((m) => !m.streaming), userMsg];
      setMsgs(historyWithUser);
      appendBot("", true);
      let accumulated = "";
      await window.LP_AI_TUTOR.chat(
        historyWithUser,
        (chunk) => {
          accumulated += chunk;
          appendBot(accumulated, true);
          if (!open) setUnread((n) => n + 1);
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
      var _a, _b;
      (_b = (_a = window.LP_AI_TUTOR) == null ? void 0 : _a.abort) == null ? void 0 : _b.call(_a);
      setLoading(false);
    };
    const showStarters = msgs.filter((m) => m.role === "user").length === 0;
    if (expanded) {
      return /* @__PURE__ */ React.createElement("div", { className: "cpf-fullpage" }, /* @__PURE__ */ React.createElement("div", { className: "cpf-fullpage-inner" }, /* @__PURE__ */ React.createElement("div", { className: "cpf-head cpf-head--full" }, /* @__PURE__ */ React.createElement("div", { className: "cpf-head-left" }, /* @__PURE__ */ React.createElement("span", { className: "cpf-title" }, "\u2728 Smart Tutor")), /* @__PURE__ */ React.createElement("div", { className: "cpf-head-right" }, /* @__PURE__ */ React.createElement("button", { className: "cpf-tab-btn", title: "Compact view", onClick: () => setExpanded(false) }, "\u22A1"), /* @__PURE__ */ React.createElement("button", { className: "cpf-close", onClick: () => {
        setExpanded(false);
        setOpen(false);
      } }, "\xD7"))), error && /* @__PURE__ */ React.createElement("div", { className: "cpf-error" }, error), /* @__PURE__ */ React.createElement(ChatBody, { msgs, loading, endRef }), showStarters && /* @__PURE__ */ React.createElement("div", { className: "cpf-starters cpf-starters--full" }, STARTERS.map((s, i) => /* @__PURE__ */ React.createElement("button", { key: i, className: "cpf-starter-chip", onClick: () => send(s) }, s))), /* @__PURE__ */ React.createElement(
        InputRow,
        {
          input,
          setInput,
          loading,
          onSend: send,
          onStop: stop,
          inputRef,
          expanded: true
        }
      )));
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, open && /* @__PURE__ */ React.createElement("div", { className: "chat-panel-floating" }, /* @__PURE__ */ React.createElement("div", { className: "cpf-head" }, /* @__PURE__ */ React.createElement("div", { className: "cpf-head-left" }, /* @__PURE__ */ React.createElement("span", { className: "cpf-title" }, "\u2728 Smart Tutor")), /* @__PURE__ */ React.createElement("div", { className: "cpf-head-right" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "cpf-tab-btn",
        title: "Expand to full page",
        onClick: () => setExpanded(true)
      },
      "\u229E"
    ), /* @__PURE__ */ React.createElement("button", { className: "cpf-close", onClick: () => setOpen(false) }, "\xD7"))), error && /* @__PURE__ */ React.createElement("div", { className: "cpf-error" }, error), /* @__PURE__ */ React.createElement(ChatBody, { msgs, loading, endRef }), showStarters && /* @__PURE__ */ React.createElement("div", { className: "cpf-starters" }, STARTERS.slice(0, 6).map((s, i) => /* @__PURE__ */ React.createElement("button", { key: i, className: "cpf-starter-chip", onClick: () => send(s) }, s))), /* @__PURE__ */ React.createElement(
      InputRow,
      {
        input,
        setInput,
        loading,
        onSend: send,
        onStop: stop,
        inputRef,
        expanded: false
      }
    )), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: `chat-fab chat-fab--ai ${open ? "is-open" : ""}`,
        onClick: () => setOpen((o) => !o),
        "aria-label": open ? "Close smart tutor" : "Open smart tutor",
        title: "Smart Tutor"
      },
      open ? /* @__PURE__ */ React.createElement("span", { style: { fontSize: 22, lineHeight: 1 } }, "\xD7") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 20 } }, "\u2728"), unread > 0 && /* @__PURE__ */ React.createElement("span", { className: "cpf-badge" }, unread))
    ));
  }
  window.LP_ChatbotWidget = ChatbotWidget;
})();
