// screens/pte-listening-renderer.jsx
// PTE Academic Listening renderer — item-at-a-time, one component per question type.
// Auto-plays audio when navigating between items; stops previous audio automatically.
// Exposed as window.LP_PTE_LISTENING

(function () {
  const { useState, useRef, useEffect } = React;

  /* ── Audio status bar (section-controlled, no independent play button) ───── */
  function AudioStatusBar({ playing, audioScript, onStop, onReplay }) {
    const [revealed, setRevealed] = useState(false);
    const hasTTS = !!(window.LP_TTS && window.LP_TTS.playScript);

    return (
      <div className="pte-audio-panel">
        <div className="pte-audio-bar">
          {playing ? (
            <button className="pte-play-btn playing" onClick={onStop}>⏹ Stop Audio</button>
          ) : (
            <button className="pte-play-btn" onClick={onReplay}>▶ Play Again</button>
          )}
          <span className="pte-audio-note" style={{ flex: 1 }}>
            {playing ? "🔊 Playing audio…" : hasTTS ? "Audio ready — navigating auto-plays next item." : "No TTS key — show transcript to study."}
          </span>
          <button
            className="pte-transcript-toggle"
            onClick={() => setRevealed(r => !r)}
          >{revealed ? "Hide transcript" : "Show transcript"}</button>
        </div>
        {revealed && (
          <pre className="pte-audio-script">{audioScript}</pre>
        )}
      </div>
    );
  }

  /* ── Word counter helper ────────────────────────────────────────────────── */
  function countWords(text) {
    return (text || "").trim().split(/\s+/).filter(Boolean).length;
  }

  // Each item renderer receives audioBar (pre-built JSX from the section) instead of AudioPanel
  /* ── 1. SummarizeSpokenText ─────────────────────────────────────────────── */
  function SummarizeSpokenText({ item, answer, setAnswer, audioBar }) {
    const wc = countWords(answer || "");
    const min = item.wordLimit?.min || 50;
    const max = item.wordLimit?.max || 70;
    const inRange = wc >= min && wc <= max;
    return (
      <div className="pte-item pte-sst">
        <div className="pte-item-label">Summarize Spoken Text</div>
        <p className="pte-instruction">Listen to the recording and write a summary in {min}–{max} words.</p>
        {audioBar}
        <textarea
          className="pte-textarea"
          rows={5}
          placeholder={`Write your summary here (${min}–${max} words)…`}
          value={answer || ""}
          onChange={e => setAnswer(e.target.value)}
        />
        <div className={`pte-word-count ${inRange ? "ok" : "warn"}`}>
          {wc} words {inRange ? "✓" : `(need ${min}–${max})`}
        </div>
        {item.modelAnswer && (
          <details className="pte-model-answer">
            <summary>Model answer (study reference)</summary>
            <p>{item.modelAnswer}</p>
          </details>
        )}
      </div>
    );
  }

  /* ── 2. MultChoiceMultiple ──────────────────────────────────────────────── */
  function MultChoiceMultiple({ item, answer, setAnswer, audioBar }) {
    const selected = Array.isArray(answer) ? answer : (answer ? [answer] : []);
    const required = item.requiredCount || 2;
    function toggle(opt) {
      let next;
      if (selected.includes(opt)) next = selected.filter(x => x !== opt);
      else if (selected.length < required) next = [...selected, opt];
      else next = [...selected.slice(1), opt];
      setAnswer(next);
    }
    return (
      <div className="pte-item pte-mcm">
        <div className="pte-item-label">Multiple Choice (Multiple)</div>
        {audioBar}
        <p className="pte-question">{item.question}</p>
        <p className="pte-instruction">Select {required} answers.</p>
        <div className="pte-options">
          {(item.options || []).map((opt, i) => (
            <label key={i} className={`pte-option ${selected.includes(opt) ? "selected" : ""}`}>
              <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ── 3. FillInBlanksListening ───────────────────────────────────────────── */
  function FillInBlanksListening({ item, answer, setAnswer, audioBar }) {
    const blanks = item.correctAnswers || [];
    const userAnswers = Array.isArray(answer) ? answer : Array(blanks.length).fill("");
    function updateBlank(i, val) {
      const next = [...userAnswers]; next[i] = val; setAnswer(next);
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
    return (
      <div className="pte-item pte-fib">
        <div className="pte-item-label">Fill in the Blanks (Listening)</div>
        <p className="pte-instruction">Listen and type the missing words.</p>
        {audioBar}
        <div className="pte-fib-transcript">
          {parts.map((part, i) => {
            if (part.type === "text") return <span key={i}>{part.text}</span>;
            const bi = part.index;
            return (
              <input key={i} type="text" className="pte-fib-input"
                value={userAnswers[bi] || ""} onChange={e => updateBlank(bi, e.target.value)}
                placeholder={`[${bi + 1}]`} />
            );
          })}
        </div>
      </div>
    );
  }

  /* ── 4. HighlightCorrectSummary ─────────────────────────────────────────── */
  function HighlightCorrectSummary({ item, answer, setAnswer, audioBar }) {
    return (
      <div className="pte-item pte-hcs">
        <div className="pte-item-label">Highlight Correct Summary</div>
        <p className="pte-instruction">Select the paragraph that best summarises the recording.</p>
        {audioBar}
        <div className="pte-options">
          {(item.options || []).map((opt, i) => (
            <label key={i} className={`pte-option pte-summary-option ${answer === opt ? "selected" : ""}`}>
              <input type="radio" name={`hcs-${item.id}`} checked={answer === opt} onChange={() => setAnswer(opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ── 5. MultChoiceSingle ────────────────────────────────────────────────── */
  function MultChoiceSingle({ item, answer, setAnswer, audioBar }) {
    return (
      <div className="pte-item pte-mcs">
        <div className="pte-item-label">Multiple Choice (Single)</div>
        {audioBar}
        <p className="pte-question">{item.question}</p>
        <div className="pte-options">
          {(item.options || []).map((opt, i) => (
            <label key={i} className={`pte-option ${answer === opt ? "selected" : ""}`}>
              <input type="radio" name={`mcs-${item.id}`} checked={answer === opt} onChange={() => setAnswer(opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ── 6. SelectMissingWord ───────────────────────────────────────────────── */
  function SelectMissingWord({ item, answer, setAnswer, audioBar }) {
    return (
      <div className="pte-item pte-smw">
        <div className="pte-item-label">Select Missing Word</div>
        <p className="pte-instruction">The last word(s) are replaced by a beep. Select the option that completes the recording.</p>
        {audioBar}
        <div className="pte-options pte-options-inline">
          {(item.options || []).map((opt, i) => (
            <label key={i} className={`pte-option pte-option-chip ${answer === opt ? "selected" : ""}`}>
              <input type="radio" name={`smw-${item.id}`} checked={answer === opt} onChange={() => setAnswer(opt)} />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ── 7. HighlightIncorrectWords ─────────────────────────────────────────── */
  function HighlightIncorrectWords({ item, answer, setAnswer, audioBar }) {
    const highlighted = Array.isArray(answer) ? answer : [];
    const transcript = item.displayTranscript || "";
    const words = transcript.split(/(\s+)/);
    function toggleWord(word) {
      const clean = word.trim().replace(/[^a-zA-Z0-9'-]/g, "");
      if (!clean) return;
      setAnswer(highlighted.includes(clean)
        ? highlighted.filter(w => w !== clean)
        : [...highlighted, clean]);
    }
    return (
      <div className="pte-item pte-hiw">
        <div className="pte-item-label">Highlight Incorrect Words</div>
        <p className="pte-instruction">Click each word in the transcript that differs from what you hear.</p>
        {audioBar}
        <div className="pte-hiw-transcript">
          {words.map((chunk, i) => {
            if (/^\s+$/.test(chunk)) return <span key={i}>{chunk}</span>;
            const clean = chunk.replace(/[^a-zA-Z0-9'-]/g, "");
            return (
              <span key={i}
                className={`pte-hiw-word ${highlighted.includes(clean) ? "highlighted" : ""}`}
                onClick={() => toggleWord(chunk)}>{chunk}</span>
            );
          })}
        </div>
        <p className="pte-instruction" style={{ marginTop: 8 }}>
          Highlighted: {highlighted.length > 0 ? highlighted.join(", ") : "none"}
        </p>
      </div>
    );
  }

  /* ── 8. WriteFromDictation ──────────────────────────────────────────────── */
  function WriteFromDictation({ item, answer, setAnswer, audioBar }) {
    return (
      <div className="pte-item pte-wfd">
        <div className="pte-item-label">Write from Dictation</div>
        <p className="pte-instruction">Listen and type the sentence exactly as you hear it.</p>
        {audioBar}
        <input type="text" className="pte-wfd-input"
          value={answer || ""} onChange={e => setAnswer(e.target.value)}
          placeholder="Type the sentence here…" />
      </div>
    );
  }

  /* ── Item dispatcher ────────────────────────────────────────────────────── */
  function PTEListeningItem({ item, answer, setAnswer, audioBar }) {
    const props = { item, answer, setAnswer, audioBar };
    switch (item.questionType) {
      case "summarize_spoken_text":    return <SummarizeSpokenText {...props} />;
      case "multiple_choice_multiple": return <MultChoiceMultiple {...props} />;
      case "fill_in_blanks_listening": return <FillInBlanksListening {...props} />;
      case "highlight_correct_summary":return <HighlightCorrectSummary {...props} />;
      case "multiple_choice_single":   return <MultChoiceSingle {...props} />;
      case "select_missing_word":      return <SelectMissingWord {...props} />;
      case "highlight_incorrect_words":return <HighlightIncorrectWords {...props} />;
      case "write_from_dictation":     return <WriteFromDictation {...props} />;
      default:
        return (
          <div className="pte-item">
            <div className="pte-item-label">{item.questionType}</div>
            {audioBar}
            <p style={{ color: "var(--ink-2)", fontStyle: "italic" }}>
              Renderer not available for type: {item.questionType}
            </p>
          </div>
        );
    }
  }

  /* ── PTEListeningSection — auto-plays audio when item changes ───────────── */
  function PTEListeningSection({ sec, answers, setAnswer, sectionId }) {
    const items = sec.items || [];
    const [idx, setIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const abortRef = useRef(null);
    const timerRef = useRef(null);

    const total = items.length;
    const current = items[idx];

    // ── Auto-play whenever idx changes ──────────────────────────────────────
    useEffect(() => {
      if (!current) return;
      // Stop any previous audio
      if (abortRef.current) { try { abortRef.current.abort(); } catch(e){} }
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
        } catch(e) { /* aborted or TTS error */ }
        if (!controller.signal.aborted) setPlaying(false);
      }, 600);

      return () => {
        clearTimeout(timerRef.current);
        try { controller.abort(); } catch(e){}
        setPlaying(false);
      };
    }, [idx]);

    if (!current) return <div className="pte-empty">No listening items found.</div>;

    const itemKey = `${sectionId}-${current.id}`;
    const currentAnswer = answers[itemKey];

    function navigate(newIdx) {
      // Abort audio immediately before changing item
      if (abortRef.current) { try { abortRef.current.abort(); } catch(e){} }
      if (timerRef.current) clearTimeout(timerRef.current);
      setPlaying(false);
      setIdx(newIdx);
    }

    function handleStop() {
      if (abortRef.current) { try { abortRef.current.abort(); } catch(e){} }
      setPlaying(false);
    }

    async function handleReplay() {
      if (abortRef.current) { try { abortRef.current.abort(); } catch(e){} }
      setPlaying(false);
      const controller = new AbortController();
      abortRef.current = controller;
      const script = current.audioScript || "";
      if (!script || !(window.LP_TTS && window.LP_TTS.playScript)) return;
      setPlaying(true);
      try {
        await window.LP_TTS.playScript(script, { signal: controller.signal });
      } catch(e) {}
      if (!controller.signal.aborted) setPlaying(false);
    }

    // Build the shared audio bar that each item renderer will display
    const audioBar = (
      <AudioStatusBar
        playing={playing}
        audioScript={current.audioScript || ""}
        onStop={handleStop}
        onReplay={handleReplay}
      />
    );

    // Human-readable type label for progress dots
    const TYPE_LABELS = {
      summarize_spoken_text: "SST",
      multiple_choice_multiple: "MCM",
      fill_in_blanks_listening: "FIB",
      highlight_correct_summary: "HCS",
      multiple_choice_single: "MCS",
      select_missing_word: "SMW",
      highlight_incorrect_words: "HIW",
      write_from_dictation: "WFD",
    };

    return (
      <div className="pte-listening-shell">
        {/* Navigation header */}
        <div className="pte-nav-header">
          <button className="pte-nav-btn" onClick={() => navigate(Math.max(0, idx - 1))} disabled={idx === 0}>
            ← Prev
          </button>
          <span className="pte-nav-counter">
            Item {idx + 1} of {total}
            <span className="pte-nav-type-badge">{TYPE_LABELS[current.questionType] || current.questionType}</span>
          </span>
          <button className="pte-nav-btn" onClick={() => navigate(Math.min(total - 1, idx + 1))} disabled={idx === total - 1}>
            Next →
          </button>
        </div>

        {/* Dot progress with type labels */}
        <div className="pte-dot-row">
          {items.map((it, i) => {
            const key = `${sectionId}-${it.id}`;
            const ans = answers[key];
            const done = ans != null && ans !== "" && !(Array.isArray(ans) && ans.length === 0);
            return (
              <button
                key={i}
                className={`pte-dot ${i === idx ? "active" : ""} ${done ? "done" : ""}`}
                onClick={() => navigate(i)}
                title={`Item ${i + 1}: ${TYPE_LABELS[it.questionType] || it.questionType}`}
              >
                <span className="pte-dot-label">{TYPE_LABELS[it.questionType] || (i + 1)}</span>
              </button>
            );
          })}
        </div>

        {/* Item renderer — key forces remount on idx change */}
        <PTEListeningItem
          key={itemKey}
          item={current}
          answer={currentAnswer}
          setAnswer={val => setAnswer(itemKey, val)}
          audioBar={audioBar}
        />

        {/* Explanation */}
        {current.explanation && (
          <div className="pte-explanation">
            <strong>Note:</strong> {current.explanation}
          </div>
        )}
      </div>
    );
  }

  window.LP_PTE_LISTENING = { PTEListeningSection, PTEListeningItem };
})();
