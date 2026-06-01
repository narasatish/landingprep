(function() {
  const { useState, useRef, useEffect } = React;
  function AudioStatusBar({ playing, audioScript, onStop, onReplay }) {
    const [revealed, setRevealed] = useState(false);
    const hasTTS = !!(window.LP_TTS && window.LP_TTS.playScript);
    return /* @__PURE__ */ React.createElement("div", { className: "pte-audio-panel" }, /* @__PURE__ */ React.createElement("div", { className: "pte-audio-bar" }, playing ? /* @__PURE__ */ React.createElement("button", { className: "pte-play-btn playing", onClick: onStop }, "\u23F9 Stop Audio") : /* @__PURE__ */ React.createElement("button", { className: "pte-play-btn", onClick: onReplay }, "\u25B6 Play Again"), /* @__PURE__ */ React.createElement("span", { className: "pte-audio-note", style: { flex: 1 } }, playing ? "\u{1F50A} Playing audio\u2026" : hasTTS ? "Audio ready \u2014 navigating auto-plays next item." : "No TTS key \u2014 show transcript to study."), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "pte-transcript-toggle",
        onClick: () => setRevealed((r) => !r)
      },
      revealed ? "Hide transcript" : "Show transcript"
    )), revealed && /* @__PURE__ */ React.createElement("pre", { className: "pte-audio-script" }, audioScript));
  }
  function countWords(text) {
    return (text || "").trim().split(/\s+/).filter(Boolean).length;
  }
  function SummarizeSpokenText({ item, answer, setAnswer, audioBar }) {
    var _a, _b;
    const wc = countWords(answer || "");
    const min = ((_a = item.wordLimit) == null ? void 0 : _a.min) || 50;
    const max = ((_b = item.wordLimit) == null ? void 0 : _b.max) || 70;
    const inRange = wc >= min && wc <= max;
    return /* @__PURE__ */ React.createElement("div", { className: "pte-item pte-sst" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-label" }, "Summarize Spoken Text"), /* @__PURE__ */ React.createElement("p", { className: "pte-instruction" }, "Listen to the recording and write a summary in ", min, "\u2013", max, " words."), audioBar, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "pte-textarea",
        rows: 5,
        placeholder: `Write your summary here (${min}\u2013${max} words)\u2026`,
        value: answer || "",
        onChange: (e) => setAnswer(e.target.value)
      }
    ), /* @__PURE__ */ React.createElement("div", { className: `pte-word-count ${inRange ? "ok" : "warn"}` }, wc, " words ", inRange ? "\u2713" : `(need ${min}\u2013${max})`), item.modelAnswer && /* @__PURE__ */ React.createElement("details", { className: "pte-model-answer" }, /* @__PURE__ */ React.createElement("summary", null, "Model answer (study reference)"), /* @__PURE__ */ React.createElement("p", null, item.modelAnswer)));
  }
  function MultChoiceMultiple({ item, answer, setAnswer, audioBar }) {
    const selected = Array.isArray(answer) ? answer : answer ? [answer] : [];
    const required = item.requiredCount || 2;
    function toggle(opt) {
      let next;
      if (selected.includes(opt)) next = selected.filter((x) => x !== opt);
      else if (selected.length < required) next = [...selected, opt];
      else next = [...selected.slice(1), opt];
      setAnswer(next);
    }
    return /* @__PURE__ */ React.createElement("div", { className: "pte-item pte-mcm" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-label" }, "Multiple Choice (Multiple)"), audioBar, /* @__PURE__ */ React.createElement("p", { className: "pte-question" }, item.question), /* @__PURE__ */ React.createElement("p", { className: "pte-instruction" }, "Select ", required, " answers."), /* @__PURE__ */ React.createElement("div", { className: "pte-options" }, (item.options || []).map((opt, i) => /* @__PURE__ */ React.createElement("label", { key: i, className: `pte-option ${selected.includes(opt) ? "selected" : ""}` }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: selected.includes(opt), onChange: () => toggle(opt) }), opt))));
  }
  function FillInBlanksListening({ item, answer, setAnswer, audioBar }) {
    const blanks = item.correctAnswers || [];
    const userAnswers = Array.isArray(answer) ? answer : Array(blanks.length).fill("");
    function updateBlank(i, val) {
      const next = [...userAnswers];
      next[i] = val;
      setAnswer(next);
    }
    const transcript = item.transcript || "";
    const parts = [];
    const re = /__(\d+)__/g;
    let last = 0, m;
    while ((m = re.exec(transcript)) !== null) {
      if (m.index > last) parts.push({ type: "text", text: transcript.slice(last, m.index) });
      parts.push({ type: "blank", index: parseInt(m[1], 10) - 1 });
      last = m.index + m[0].length;
    }
    if (last < transcript.length) parts.push({ type: "text", text: transcript.slice(last) });
    return /* @__PURE__ */ React.createElement("div", { className: "pte-item pte-fib" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-label" }, "Fill in the Blanks (Listening)"), /* @__PURE__ */ React.createElement("p", { className: "pte-instruction" }, "Listen and type the missing words."), audioBar, /* @__PURE__ */ React.createElement("div", { className: "pte-fib-transcript" }, parts.map((part, i) => {
      if (part.type === "text") return /* @__PURE__ */ React.createElement("span", { key: i }, part.text);
      const bi = part.index;
      return /* @__PURE__ */ React.createElement(
        "input",
        {
          key: i,
          type: "text",
          className: "pte-fib-input",
          value: userAnswers[bi] || "",
          onChange: (e) => updateBlank(bi, e.target.value),
          placeholder: `[${bi + 1}]`
        }
      );
    })));
  }
  function HighlightCorrectSummary({ item, answer, setAnswer, audioBar }) {
    return /* @__PURE__ */ React.createElement("div", { className: "pte-item pte-hcs" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-label" }, "Highlight Correct Summary"), /* @__PURE__ */ React.createElement("p", { className: "pte-instruction" }, "Select the paragraph that best summarises the recording."), audioBar, /* @__PURE__ */ React.createElement("div", { className: "pte-options" }, (item.options || []).map((opt, i) => /* @__PURE__ */ React.createElement("label", { key: i, className: `pte-option pte-summary-option ${answer === opt ? "selected" : ""}` }, /* @__PURE__ */ React.createElement("input", { type: "radio", name: `hcs-${item.id}`, checked: answer === opt, onChange: () => setAnswer(opt) }), opt))));
  }
  function MultChoiceSingle({ item, answer, setAnswer, audioBar }) {
    return /* @__PURE__ */ React.createElement("div", { className: "pte-item pte-mcs" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-label" }, "Multiple Choice (Single)"), audioBar, /* @__PURE__ */ React.createElement("p", { className: "pte-question" }, item.question), /* @__PURE__ */ React.createElement("div", { className: "pte-options" }, (item.options || []).map((opt, i) => /* @__PURE__ */ React.createElement("label", { key: i, className: `pte-option ${answer === opt ? "selected" : ""}` }, /* @__PURE__ */ React.createElement("input", { type: "radio", name: `mcs-${item.id}`, checked: answer === opt, onChange: () => setAnswer(opt) }), opt))));
  }
  function SelectMissingWord({ item, answer, setAnswer, audioBar }) {
    return /* @__PURE__ */ React.createElement("div", { className: "pte-item pte-smw" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-label" }, "Select Missing Word"), /* @__PURE__ */ React.createElement("p", { className: "pte-instruction" }, "The last word(s) are replaced by a beep. Select the option that completes the recording."), audioBar, /* @__PURE__ */ React.createElement("div", { className: "pte-options pte-options-inline" }, (item.options || []).map((opt, i) => /* @__PURE__ */ React.createElement("label", { key: i, className: `pte-option pte-option-chip ${answer === opt ? "selected" : ""}` }, /* @__PURE__ */ React.createElement("input", { type: "radio", name: `smw-${item.id}`, checked: answer === opt, onChange: () => setAnswer(opt) }), opt))));
  }
  function HighlightIncorrectWords({ item, answer, setAnswer, audioBar }) {
    const highlighted = Array.isArray(answer) ? answer : [];
    const transcript = item.displayTranscript || "";
    const words = transcript.split(/(\s+)/);
    function toggleWord(word) {
      const clean = word.trim().replace(/[^a-zA-Z0-9'-]/g, "");
      if (!clean) return;
      setAnswer(highlighted.includes(clean) ? highlighted.filter((w) => w !== clean) : [...highlighted, clean]);
    }
    return /* @__PURE__ */ React.createElement("div", { className: "pte-item pte-hiw" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-label" }, "Highlight Incorrect Words"), /* @__PURE__ */ React.createElement("p", { className: "pte-instruction" }, "Click each word in the transcript that differs from what you hear."), audioBar, /* @__PURE__ */ React.createElement("div", { className: "pte-hiw-transcript" }, words.map((chunk, i) => {
      if (/^\s+$/.test(chunk)) return /* @__PURE__ */ React.createElement("span", { key: i }, chunk);
      const clean = chunk.replace(/[^a-zA-Z0-9'-]/g, "");
      return /* @__PURE__ */ React.createElement(
        "span",
        {
          key: i,
          className: `pte-hiw-word ${highlighted.includes(clean) ? "highlighted" : ""}`,
          onClick: () => toggleWord(chunk)
        },
        chunk
      );
    })), /* @__PURE__ */ React.createElement("p", { className: "pte-instruction", style: { marginTop: 8 } }, "Highlighted: ", highlighted.length > 0 ? highlighted.join(", ") : "none"));
  }
  function WriteFromDictation({ item, answer, setAnswer, audioBar }) {
    return /* @__PURE__ */ React.createElement("div", { className: "pte-item pte-wfd" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-label" }, "Write from Dictation"), /* @__PURE__ */ React.createElement("p", { className: "pte-instruction" }, "Listen and type the sentence exactly as you hear it."), audioBar, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "pte-wfd-input",
        value: answer || "",
        onChange: (e) => setAnswer(e.target.value),
        placeholder: "Type the sentence here\u2026"
      }
    ));
  }
  function PTEListeningItem({ item, answer, setAnswer, audioBar }) {
    const props = { item, answer, setAnswer, audioBar };
    switch (item.questionType) {
      case "summarize_spoken_text":
        return /* @__PURE__ */ React.createElement(SummarizeSpokenText, { ...props });
      case "multiple_choice_multiple":
        return /* @__PURE__ */ React.createElement(MultChoiceMultiple, { ...props });
      case "fill_in_blanks_listening":
        return /* @__PURE__ */ React.createElement(FillInBlanksListening, { ...props });
      case "highlight_correct_summary":
        return /* @__PURE__ */ React.createElement(HighlightCorrectSummary, { ...props });
      case "multiple_choice_single":
        return /* @__PURE__ */ React.createElement(MultChoiceSingle, { ...props });
      case "select_missing_word":
        return /* @__PURE__ */ React.createElement(SelectMissingWord, { ...props });
      case "highlight_incorrect_words":
        return /* @__PURE__ */ React.createElement(HighlightIncorrectWords, { ...props });
      case "write_from_dictation":
        return /* @__PURE__ */ React.createElement(WriteFromDictation, { ...props });
      default:
        return /* @__PURE__ */ React.createElement("div", { className: "pte-item" }, /* @__PURE__ */ React.createElement("div", { className: "pte-item-label" }, item.questionType), audioBar, /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-2)", fontStyle: "italic" } }, "Renderer not available for type: ", item.questionType));
    }
  }
  function PTEListeningSection({ sec, answers, setAnswer, sectionId }) {
    const items = sec.items || [];
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const abortRef = useRef(null);
    const timerRef = useRef(null);
    const total = items.length;
    const current = items[idx];
    useEffect(() => {
      if (!current) return;
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch (e) {
        }
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      setPlaying(false);
      const controller = new AbortController();
      abortRef.current = controller;
      timerRef.current = setTimeout(async () => {
        if (controller.signal.aborted) return;
        const script = current.audioScript || "";
        if (!script || !(window.LP_TTS && window.LP_TTS.playScript)) return;
        setPlaying(true);
        try {
          await window.LP_TTS.playScript(script, { signal: controller.signal });
        } catch (e) {
        }
        if (!controller.signal.aborted) setPlaying(false);
      }, 600);
      return () => {
        clearTimeout(timerRef.current);
        try {
          controller.abort();
        } catch (e) {
        }
        setPlaying(false);
      };
    }, [idx]);
    if (!current) return /* @__PURE__ */ React.createElement("div", { className: "pte-empty" }, "No listening items found.");
    const itemKey = `${sectionId}-${current.id}`;
    const currentAnswer = answers[itemKey];
    function navigate(newIdx) {
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch (e) {
        }
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      setPlaying(false);
      setIdx(newIdx);
    }
    function handleStop() {
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch (e) {
        }
      }
      setPlaying(false);
    }
    async function handleReplay() {
      if (abortRef.current) {
        try {
          abortRef.current.abort();
        } catch (e) {
        }
      }
      setPlaying(false);
      const controller = new AbortController();
      abortRef.current = controller;
      const script = current.audioScript || "";
      if (!script || !(window.LP_TTS && window.LP_TTS.playScript)) return;
      setPlaying(true);
      try {
        await window.LP_TTS.playScript(script, { signal: controller.signal });
      } catch (e) {
      }
      if (!controller.signal.aborted) setPlaying(false);
    }
    const audioBar = /* @__PURE__ */ React.createElement(
      AudioStatusBar,
      {
        playing,
        audioScript: current.audioScript || "",
        onStop: handleStop,
        onReplay: handleReplay
      }
    );
    const TYPE_LABELS = {
      summarize_spoken_text: "SST",
      multiple_choice_multiple: "MCM",
      fill_in_blanks_listening: "FIB",
      highlight_correct_summary: "HCS",
      multiple_choice_single: "MCS",
      select_missing_word: "SMW",
      highlight_incorrect_words: "HIW",
      write_from_dictation: "WFD"
    };
    return /* @__PURE__ */ React.createElement("div", { className: "pte-listening-shell" }, /* @__PURE__ */ React.createElement("div", { className: "pte-nav-header" }, /* @__PURE__ */ React.createElement("button", { className: "pte-nav-btn", onClick: () => navigate(Math.max(0, idx - 1)), disabled: idx === 0 }, "\u2190 Prev"), /* @__PURE__ */ React.createElement("span", { className: "pte-nav-counter" }, "Item ", idx + 1, " of ", total, /* @__PURE__ */ React.createElement("span", { className: "pte-nav-type-badge" }, TYPE_LABELS[current.questionType] || current.questionType)), /* @__PURE__ */ React.createElement("button", { className: "pte-nav-btn", onClick: () => navigate(Math.min(total - 1, idx + 1)), disabled: idx === total - 1 }, "Next \u2192")), /* @__PURE__ */ React.createElement("div", { className: "pte-dot-row" }, items.map((it, i) => {
      const key = `${sectionId}-${it.id}`;
      const ans = answers[key];
      const done = ans != null && ans !== "" && !(Array.isArray(ans) && ans.length === 0);
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: i,
          className: `pte-dot ${i === idx ? "active" : ""} ${done ? "done" : ""}`,
          onClick: () => navigate(i),
          title: `Item ${i + 1}: ${TYPE_LABELS[it.questionType] || it.questionType}`
        },
        /* @__PURE__ */ React.createElement("span", { className: "pte-dot-label" }, TYPE_LABELS[it.questionType] || i + 1)
      );
    })), /* @__PURE__ */ React.createElement(
      PTEListeningItem,
      {
        key: itemKey,
        item: current,
        answer: currentAnswer,
        setAnswer: (val) => setAnswer(itemKey, val),
        audioBar
      }
    ), current.explanation && /* @__PURE__ */ React.createElement("div", { className: "pte-explanation" }, /* @__PURE__ */ React.createElement("strong", null, "Note:"), " ", current.explanation));
  }
  window.LP_PTE_LISTENING = { PTEListeningSection, PTEListeningItem };
})();
