(function() {
  const { useState, useEffect, useRef } = React;
  const TYPE_META = {
    read_aloud: { label: "Read Aloud", icon: "\u{1F4D6}", mode: "speak", prep: 35, resp: 40 },
    repeat_sentence: { label: "Repeat Sentence", icon: "\u{1F501}", mode: "speak", prep: 3, resp: 15 },
    describe_image: { label: "Describe Image", icon: "\u{1F4CA}", mode: "speak", prep: 25, resp: 40 },
    retell_lecture: { label: "Re-tell Lecture", icon: "\u{1F393}", mode: "speak", prep: 10, resp: 40 },
    answer_short_question: { label: "Answer Short Question", icon: "\u2753", mode: "speak", prep: 3, resp: 10 },
    summarize_written_text: { label: "Summarize Written Text", icon: "\u270D\uFE0F", mode: "write", min: 5, max: 75, minutes: 10 },
    essay: { label: "Write Essay", icon: "\u{1F4DD}", mode: "write", min: 200, max: 300, minutes: 20 }
  };
  function countWords(t) {
    return (t || "").trim().split(/\s+/).filter(Boolean).length;
  }
  function fmt(s) {
    const m = Math.floor(s / 60), x = s % 60;
    return m > 0 ? `${m}:${String(x).padStart(2, "0")}` : `${x}s`;
  }
  function AudioStimulus({ script, label }) {
    const [playing, setPlaying] = useState(false);
    const [played, setPlayed] = useState(false);
    const ctrlRef = useRef(null);
    const hasTTS = !!(window.LP_TTS && window.LP_TTS.playScript && window.LP_TTS.isEnabled && window.LP_TTS.isEnabled());
    useEffect(() => () => {
      var _a, _b;
      try {
        (_b = (_a = ctrlRef.current) == null ? void 0 : _a.abort) == null ? void 0 : _b.call(_a);
      } catch (e) {
      }
    }, []);
    async function play() {
      if (!script) return;
      const c = new AbortController();
      ctrlRef.current = c;
      setPlaying(true);
      try {
        await window.LP_TTS.playScript(script, { signal: c.signal });
      } catch (e) {
      }
      if (!c.signal.aborted) {
        setPlaying(false);
        setPlayed(true);
      }
    }
    return /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint-blue)", border: "1px solid #c7d2fe", borderRadius: 12, padding: "14px 16px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#4338ca", marginBottom: 8 } }, label || "Audio"), hasTTS ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: play, disabled: playing }, playing ? "\u{1F50A} Playing\u2026" : played ? "\u{1F501} Play again" : "\u25B6 Play audio") : /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "#4b5563", lineHeight: 1.6 } }, /* @__PURE__ */ React.createElement("em", null, "Audio playback needs the natural voice enabled. Transcript shown for practice:"), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6, color: "var(--ink)" } }, script)));
  }
  function SpeakItem({ item, sectionId, answers, setAnswer }) {
    const meta = TYPE_META[item.questionType] || {};
    const prep = item.prepSeconds || meta.prep || 25;
    const resp = item.responseSeconds || meta.resp || 40;
    const [phase, setPhase] = useState("ready");
    const [left, setLeft] = useState(0);
    const [showModel, setShowModel] = useState(false);
    const tRef = useRef(null);
    const recRef = useRef(null);
    const key = sectionId + "_" + item.id;
    function clear() {
      if (tRef.current) {
        clearInterval(tRef.current);
        tRef.current = null;
      }
    }
    useEffect(() => () => {
      var _a, _b;
      clear();
      try {
        (_b = (_a = recRef.current) == null ? void 0 : _a.stop) == null ? void 0 : _b.call(_a);
      } catch (e) {
      }
    }, []);
    function startMic() {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      try {
        const r = new SR();
        r.lang = "en-US";
        r.continuous = true;
        r.interimResults = true;
        let finalT = "";
        r.onresult = (e) => {
          let t = "";
          for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + " ";
          finalT = t.trim();
          setAnswer(key, finalT);
        };
        r.onerror = () => {
        };
        recRef.current = r;
        r.start();
      } catch (e) {
      }
    }
    function stopMic() {
      var _a, _b;
      try {
        (_b = (_a = recRef.current) == null ? void 0 : _a.stop) == null ? void 0 : _b.call(_a);
      } catch (e) {
      }
      recRef.current = null;
    }
    function startPrep() {
      clear();
      setPhase("prep");
      setLeft(prep);
      tRef.current = setInterval(() => setLeft((p) => {
        if (p <= 1) {
          clear();
          startRec();
          return 0;
        }
        return p - 1;
      }), 1e3);
    }
    function startRec() {
      clear();
      setPhase("recording");
      setLeft(resp);
      startMic();
      tRef.current = setInterval(() => setLeft((p) => {
        if (p <= 1) {
          clear();
          stopMic();
          setPhase("done");
          return 0;
        }
        return p - 1;
      }), 1e3);
    }
    function finishEarly() {
      clear();
      stopMic();
      setPhase("done");
    }
    function reset() {
      clear();
      stopMic();
      setPhase("ready");
      setLeft(0);
    }
    const transcript = answers[key] || "";
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, meta.icon, " ", meta.label), /* @__PURE__ */ React.createElement("div", { className: "writing-prompt", style: { marginBottom: 12 } }, item.prompt), item.questionType === "read_aloud" && item.readText && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 18px", marginBottom: 12, fontSize: 16, lineHeight: 1.7 } }, item.readText), item.questionType === "describe_image" && item.visual && window.LP_VisualRenderer && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement(window.LP_VisualRenderer, { task: { visual: item.visual, prompt: item.prompt } })), (item.questionType === "repeat_sentence" || item.questionType === "retell_lecture" || item.questionType === "answer_short_question") && item.audioScript && /* @__PURE__ */ React.createElement(AudioStimulus, { script: item.audioScript, label: item.questionType === "retell_lecture" ? "Lecture" : "Listen" }), item.questionType === "retell_lecture" && Array.isArray(item.keyPoints) && item.keyPoints.length > 0 && phase === "done" && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint-orange)", border: "1px solid #ffd0a0", borderRadius: 12, padding: "12px 14px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "#b85c00" } }, "Key points to mention"), /* @__PURE__ */ React.createElement("ul", { style: { margin: "6px 0 0", paddingLeft: 18 } }, item.keyPoints.map((k, i) => /* @__PURE__ */ React.createElement("li", { key: i, style: { fontSize: 13.5, lineHeight: 1.5 } }, k)))), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "6px 0" } }, phase === "ready" && /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary btn-lg", onClick: startPrep }, "\u25B6 Start (", fmt(prep), " prep \xB7 ", fmt(resp), " speak)"), phase === "prep" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "var(--ink-3)" } }, "\u23F1 Preparation"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 34, fontWeight: 800, color: "#3b82f6" } }, left, "s"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: startRec }, "Skip to recording \u2192")), phase === "recording" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: "#ef4444", fontWeight: 700 } }, "\u{1F534} Recording \u2014 speak now"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 34, fontWeight: 800, color: "#ef4444" } }, left, "s"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: finishEarly }, "\u23F9 Stop early")), phase === "done" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { color: "var(--success)", fontWeight: 700, marginBottom: 8 } }, "\u2705 Response captured"), transcript && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint-green)", border: "1px solid #bbf7d0", borderRadius: 10, padding: "10px 12px", fontSize: 13.5, textAlign: "left", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("strong", null, "Your transcript:"), " ", transcript), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: reset }, "\u21BA Try again"))), (item.modelAnswer || item.correctAnswer) && /* @__PURE__ */ React.createElement("details", { style: { marginTop: 10 }, open: showModel, onToggle: (e) => setShowModel(e.target.open) }, /* @__PURE__ */ React.createElement("summary", { style: { cursor: "pointer", fontWeight: 600, color: "var(--primary)" } }, item.questionType === "answer_short_question" ? "Show answer" : "Show model response"), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint-violet)", border: "1px solid #e9d5ff", borderRadius: 10, padding: "12px 14px", marginTop: 8, fontSize: 14, lineHeight: 1.65 } }, item.questionType === "answer_short_question" && item.correctAnswer ? item.correctAnswer : item.modelAnswer)));
  }
  function WriteItem({ item, sectionId, answers, setAnswer }) {
    const meta = TYPE_META[item.questionType] || {};
    const key = sectionId + "_" + item.id;
    const text = answers[key] || "";
    const wc = countWords(text);
    const min = item.wordMin || meta.min || 5, max = item.wordMax || meta.max || 300;
    const inRange = wc >= min && wc <= max;
    const [showModel, setShowModel] = useState(false);
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, meta.icon, " ", meta.label, " ", meta.minutes ? `\xB7 ${meta.minutes} min` : ""), item.questionType === "summarize_written_text" && item.readText && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint)", border: "1px solid var(--line)", borderRadius: 12, padding: "16px 18px", marginBottom: 12, fontSize: 15, lineHeight: 1.7 } }, /* @__PURE__ */ React.createElement("strong", { style: { display: "block", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8, color: "var(--ink-3)" } }, "Passage"), item.readText), /* @__PURE__ */ React.createElement("div", { className: "writing-prompt" }, /* @__PURE__ */ React.createElement("strong", null, "Task"), item.prompt), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "writing-area",
        style: { marginTop: 12 },
        placeholder: item.questionType === "summarize_written_text" ? "Write ONE sentence (5\u201375 words) summarising the passage\u2026" : "Write your essay here (200\u2013300 words)\u2026",
        value: text,
        onChange: (e) => setAnswer(key, e.target.value)
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "word-count-bar", style: { marginTop: 6 } }, /* @__PURE__ */ React.createElement("span", { className: "wc-num" + (inRange ? " ok" : wc > max ? " low" : "") }, wc, " words ", inRange ? "\u2713 in range" : wc > max ? `\u26A0 over ${max}` : `(aim ${min}\u2013${max})`), /* @__PURE__ */ React.createElement("span", null, "Target: ", min, "\u2013", max, " words")), item.modelAnswer && /* @__PURE__ */ React.createElement("details", { style: { marginTop: 10 }, open: showModel, onToggle: (e) => setShowModel(e.target.open) }, /* @__PURE__ */ React.createElement("summary", { style: { cursor: "pointer", fontWeight: 600, color: "var(--primary)" } }, "Show model answer"), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint-violet)", border: "1px solid #e9d5ff", borderRadius: 10, padding: "12px 14px", marginTop: 8, fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" } }, item.modelAnswer)));
  }
  function PteSwSection({ sec, answers, setAnswer, sectionId }) {
    const items = sec.items || [];
    const [idx, setIdx] = useState(0);
    const current = items[idx];
    if (!current) return /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, "No Speaking & Writing tasks available.");
    const meta = TYPE_META[current.questionType] || {};
    return /* @__PURE__ */ React.createElement("div", { className: "pte-sw-shell" }, /* @__PURE__ */ React.createElement("div", { className: "part-nav", style: { flexWrap: "wrap", gap: 6, marginBottom: 12 } }, items.map((it, i) => {
      const m = TYPE_META[it.questionType] || {};
      const k = sectionId + "_" + it.id;
      const answered = answers[k] && String(answers[k]).trim();
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: it.id || i,
          className: "part-pill" + (i === idx ? " active" : "") + (answered ? " done" : ""),
          title: m.label,
          style: { minWidth: 0, padding: "6px 9px" },
          onClick: () => setIdx(i)
        },
        /* @__PURE__ */ React.createElement("span", { className: "pp-label", style: { fontSize: 14 } }, m.icon || "\u2022"),
        /* @__PURE__ */ React.createElement("span", { className: "pp-meta" }, i + 1)
      );
    })), meta.mode === "write" ? /* @__PURE__ */ React.createElement(WriteItem, { item: current, sectionId, answers, setAnswer }) : /* @__PURE__ */ React.createElement(SpeakItem, { item: current, sectionId, answers, setAnswer }), /* @__PURE__ */ React.createElement("div", { className: "part-pager", style: { marginTop: 12 } }, /* @__PURE__ */ React.createElement("button", { className: "btn", disabled: idx === 0, onClick: () => setIdx((i) => Math.max(0, i - 1)) }, "\u2190 Previous"), /* @__PURE__ */ React.createElement("span", { className: "pp-counter" }, "Item ", idx + 1, " of ", items.length), idx < items.length - 1 ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => setIdx((i) => i + 1) }, "Next \u2192") : /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "btn btn-primary",
        style: { background: "var(--success)" },
        onClick: () => {
          const b = document.querySelector(".test-topbar button.btn-sm");
          if (b) b.click();
        }
      },
      "\u2713 Submit section"
    )));
  }
  window.LP_PTE_SW = { PteSwSection };
})();
