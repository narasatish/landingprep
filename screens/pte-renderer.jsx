// screens/pte-renderer.jsx
// PTE Academic Reading renderer — one item at a time, proper PTE UI.
// Mounted by mock-test.jsx when sec.type === "pte_reading".
//
// Passage blank formats supported:
//   RW Fill Blanks : "... __1__ ... __2__ ..."  (numbered blanks, word bank)
//   Fill Blanks    : "... __1[opt1|opt2|opt3]__ ..." (inline options)

(function () {
  const { useState } = React;

  // ── Parse helpers ─────────────────────────────────────────────────────────

  // Parses "__1__ text __2__" → array of {type:"text",text} | {type:"blank",index:1}
  function parseRwFibPassage(passage) {
    const parts = [];
    const re = /__(\d+)__/g;
    let last = 0, m;
    while ((m = re.exec(passage)) !== null) {
      if (m.index > last) parts.push({ type: "text", text: passage.slice(last, m.index) });
      parts.push({ type: "blank", index: parseInt(m[1], 10) });
      last = m.index + m[0].length;
    }
    if (last < passage.length) parts.push({ type: "text", text: passage.slice(last) });
    return parts;
  }

  // Parses "__1[opt1|opt2|opt3]__ text __2[a|b]__" →
  //   array of {type:"text"} | {type:"blank", index, options:[...]}
  function parseFibPassage(passage) {
    const parts = [];
    const re = /__(\d+)\[([^\]]+)\]__/g;
    let last = 0, m;
    while ((m = re.exec(passage)) !== null) {
      if (m.index > last) parts.push({ type: "text", text: passage.slice(last, m.index) });
      parts.push({ type: "blank", index: parseInt(m[1], 10), options: m[2].split("|") });
      last = m.index + m[0].length;
    }
    if (last < passage.length) parts.push({ type: "text", text: passage.slice(last) });
    return parts;
  }

  /* ────────────────────────────────────────────────────────────
     PTEReadingSection — top-level, manages item navigation
  ──────────────────────────────────────────────────────────── */
  function PTEReadingSection({ sec, answers, setAnswer, sectionId }) {
    const items = sec.items || [];
    const [idx, setIdx] = useState(0);
    const total = items.length;
    const current = items[idx];

    if (!current) return (
      <div className="pte-empty">No items available for this section.</div>
    );

    const handleNext = () => setIdx(i => Math.min(total - 1, i + 1));
    const handlePrev = () => setIdx(i => Math.max(0, i - 1));

    const answered = items.filter(it => {
      const a = answers[sectionId + "_" + it.id];
      return a !== undefined && a !== null && a !== "" &&
             !(Array.isArray(a) && a.length === 0) &&
             !(typeof a === "object" && !Array.isArray(a) && Object.keys(a).length === 0);
    }).length;

    const TYPE_LABELS = {
      reading_writing_fill_blanks: "Reading & Writing: Fill in the Blanks",
      fill_in_blanks:              "Reading: Fill in the Blanks",
      reorder_paragraphs:          "Re-order Paragraphs",
      multiple_choice_multiple:    "Multiple Choice (Multiple Answer)",
      multiple_choice_single:      "Multiple Choice (Single Answer)",
    };

    const INSTRUCTIONS = {
      reading_writing_fill_blanks: "There are some gaps in the text below. Select the best word from the word bank to fill each gap.",
      fill_in_blanks:              "Below is a text with blanks. Click on each blank and select the appropriate option from the dropdown list.",
      reorder_paragraphs:          "The text boxes in the right panel have been placed in a random order. Restore the original order by dragging the boxes into the left panel.",
      multiple_choice_multiple:    "Read the text and answer the question by selecting ALL correct responses.",
      multiple_choice_single:      "Read the text and answer the question by selecting the correct response.",
    };

    return (
      <div className="pte-shell">
        {/* Top bar */}
        <div className="pte-topbar">
          <div className="pte-item-counter">
            Item <strong>{idx + 1}</strong> of <strong>{total}</strong>
          </div>
          <div className="pte-progress-track">
            <div className="pte-progress-fill" style={{ width: `${((idx + 1) / total) * 100}%` }} />
          </div>
          <div className="pte-answered-count">{answered}/{total} answered</div>
        </div>

        {/* Item type label */}
        <div className="pte-item-label-bar">
          <span className="pte-item-type-pill">
            {TYPE_LABELS[current.questionType] || current.questionType}
          </span>
        </div>

        {/* Instruction */}
        <div className="pte-instruction">
          {INSTRUCTIONS[current.questionType] || "Answer the question below."}
        </div>

        {/* The item itself */}
        <div className="pte-item-body">
          <PTEItem
            item={current}
            answer={answers[sectionId + "_" + current.id]}
            onAnswer={val => setAnswer(sectionId + "_" + current.id, val)}
          />
        </div>

        {/* Navigation */}
        <div className="pte-nav-row">
          <button className="btn pte-nav-btn" onClick={handlePrev} disabled={idx === 0}>◀ Previous</button>
          <div className="pte-dot-row">
            {items.map((it, i) => {
              const a = answers[sectionId + "_" + it.id];
              const done = a !== undefined && a !== null && a !== "" &&
                           !(Array.isArray(a) && a.length === 0) &&
                           !(typeof a === "object" && !Array.isArray(a) && Object.keys(a).length === 0);
              return (
                <button
                  key={it.id}
                  className={"pte-dot" + (i === idx ? " active" : "") + (done ? " done" : "")}
                  onClick={() => setIdx(i)}
                  title={`Item ${i + 1}`}
                />
              );
            })}
          </div>
          <button className="btn pte-nav-btn" onClick={handleNext} disabled={idx === total - 1}>Next ▶</button>
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     PTEItem — delegates to type-specific renderer
  ──────────────────────────────────────────────────────────── */
  function PTEItem({ item, answer, onAnswer }) {
    const qt = item.questionType;
    if (qt === "reading_writing_fill_blanks") return <PTERwFib   item={item} answer={answer} onAnswer={onAnswer} />;
    if (qt === "fill_in_blanks")             return <PTEFib      item={item} answer={answer} onAnswer={onAnswer} />;
    if (qt === "reorder_paragraphs")         return <PTEReorder  item={item} answer={answer} onAnswer={onAnswer} />;
    if (qt === "multiple_choice_multiple")   return <PTEMcqMulti item={item} answer={answer} onAnswer={onAnswer} />;
    if (qt === "multiple_choice_single")     return <PTEMcqSingle item={item} answer={answer} onAnswer={onAnswer} />;
    // Legacy old-format MCQ fallback
    if (item.options && item.options.length > 0) {
      return <PTEMcqSingle
        item={{ ...item, questionType: "multiple_choice_single",
                question: item.question || item.prompt || item.text || "" }}
        answer={answer} onAnswer={onAnswer}
      />;
    }
    return (
      <div className="pte-unsupported">
        <p><em>Item type <code>{qt}</code> — not yet rendered.</em></p>
        {item.passage && <p style={{whiteSpace:"pre-wrap"}}>{item.passage}</p>}
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     PTERwFib — Reading & Writing Fill in the Blanks
     Passage uses __1__ __2__ markers. Word bank chips.
  ──────────────────────────────────────────────────────────── */
  function PTERwFib({ item, answer, onAnswer }) {
    // answer = { 1: "word", 2: "word", ... }
    const ans = answer || {};
    const wordBank  = item.wordBank || [];
    const parsedPassage = parseRwFibPassage(item.passage || "");
    const blankIndices  = parsedPassage.filter(p => p.type === "blank").map(p => p.index);

    const usedWords = Object.values(ans);
    const available = wordBank.filter(w => !usedWords.includes(w));

    function handleBlankClick(index) {
      const updated = { ...ans };
      delete updated[index];
      onAnswer(Object.keys(updated).length ? updated : {});
    }

    function handleWordClick(word) {
      // Place into first empty blank
      const firstEmpty = blankIndices.find(bi => !ans[bi]);
      if (firstEmpty == null) return;
      onAnswer({ ...ans, [firstEmpty]: word });
    }

    return (
      <div className="pte-rwfib">
        <div className="pte-rwfib-passage">
          {parsedPassage.map((seg, i) => {
            if (seg.type === "text") return <span key={i}>{seg.text}</span>;
            const filled = ans[seg.index];
            return (
              <span
                key={i}
                className={"pte-blank" + (filled ? " filled" : "")}
                onClick={filled ? () => handleBlankClick(seg.index) : undefined}
                title={filled ? "Click to remove" : "Select a word below"}
              >
                {filled
                  ? <><span className="pte-blank-word">{filled}</span><span className="pte-blank-x">✕</span></>
                  : <span className="pte-blank-placeholder">({seg.index})</span>
                }
              </span>
            );
          })}
        </div>
        <div className="pte-word-bank-label">Word Bank — click a word to place it in the next empty gap:</div>
        <div className="pte-word-bank">
          {wordBank.map((w, i) => (
            <button
              key={i}
              className={"pte-word-chip" + (usedWords.includes(w) ? " used" : "")}
              disabled={usedWords.includes(w)}
              onClick={() => handleWordClick(w)}
            >{w}</button>
          ))}
        </div>
        {Object.keys(ans).length > 0 && (
          <button className="btn pte-clear-btn" onClick={() => onAnswer({})}>Clear all gaps</button>
        )}
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     PTEFib — Fill in the Blanks (dropdown, Reading only)
     Passage uses __1[opt1|opt2|opt3]__ markers.
  ──────────────────────────────────────────────────────────── */
  function PTEFib({ item, answer, onAnswer }) {
    const ans = answer || {};
    const parsedPassage = parseFibPassage(item.passage || "");

    function handleChange(index, val) {
      onAnswer({ ...ans, [index]: val });
    }

    return (
      <div className="pte-fib">
        <div className="pte-fib-passage">
          {parsedPassage.map((seg, i) => {
            if (seg.type === "text") return <span key={i}>{seg.text}</span>;
            return (
              <select
                key={i}
                className={"pte-fib-select" + (ans[seg.index] ? " filled" : "")}
                value={ans[seg.index] || ""}
                onChange={e => handleChange(seg.index, e.target.value)}
              >
                <option value="">— choose —</option>
                {(seg.options || []).map((opt, oi) => (
                  <option key={oi} value={opt}>{opt}</option>
                ))}
              </select>
            );
          })}
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     PTEReorder — Re-order Paragraphs
     item.paragraphs = [{id:"A", text:"..."}, ...]
     answer = ["C","A","B",...] — ordered list of ids in target panel
  ──────────────────────────────────────────────────────────── */
  function PTEReorder({ item, answer, onAnswer }) {
    const paragraphs  = item.paragraphs || [];
    const currentOrder = Array.isArray(answer) && answer.length ? answer : [];
    const placed   = new Set(currentOrder);
    const unplaced = paragraphs.filter(p => !placed.has(p.id));
    const orderedPlaced = currentOrder.map(id => paragraphs.find(p => p.id === id)).filter(Boolean);

    function moveToTarget(id)   { onAnswer([...currentOrder, id]); }
    function removeFromTarget(id) { onAnswer(currentOrder.filter(x => x !== id)); }
    function moveUp(i)  { if (i === 0) return; const o = [...currentOrder]; [o[i-1],o[i]] = [o[i],o[i-1]]; onAnswer(o); }
    function moveDown(i){ if (i === currentOrder.length-1) return; const o=[...currentOrder]; [o[i],o[i+1]]=[o[i+1],o[i]]; onAnswer(o); }

    return (
      <div className="pte-reorder-cols">
        <div className="pte-reorder-panel source">
          <div className="pte-reorder-panel-title">Source — click a paragraph to add it to the right</div>
          {unplaced.length === 0
            ? <div className="pte-reorder-empty">All paragraphs placed</div>
            : unplaced.map(p => (
                <div key={p.id} className="pte-para-card source-card" onClick={() => moveToTarget(p.id)}>
                  <span className="pte-para-id">{p.id}</span>
                  <span className="pte-para-text">{p.text}</span>
                </div>
              ))
          }
        </div>
        <div className="pte-reorder-panel target">
          <div className="pte-reorder-panel-title">Target — arrange in correct order</div>
          {orderedPlaced.length === 0
            ? <div className="pte-reorder-empty">Add paragraphs from the left</div>
            : orderedPlaced.map((p, i) => (
                <div key={p.id} className="pte-para-card target-card">
                  <div className="pte-para-arrows">
                    <button onClick={() => moveUp(i)} disabled={i===0}>▲</button>
                    <button onClick={() => moveDown(i)} disabled={i===orderedPlaced.length-1}>▼</button>
                  </div>
                  <span className="pte-para-id">{p.id}</span>
                  <span className="pte-para-text">{p.text}</span>
                  <button className="pte-para-remove" onClick={() => removeFromTarget(p.id)}>✕</button>
                </div>
              ))
          }
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     PTEMcqMulti — Multiple Choice, Multiple Answer
  ──────────────────────────────────────────────────────────── */
  function PTEMcqMulti({ item, answer, onAnswer }) {
    const selected = Array.isArray(answer) ? answer : [];
    const required = item.requiredCount || item.correctAnswers?.length || 2;

    function toggle(opt) {
      if (selected.includes(opt)) {
        onAnswer(selected.filter(x => x !== opt));
      } else {
        if (selected.length >= required) return; // cap at required count
        onAnswer([...selected, opt]);
      }
    }

    return (
      <div className="pte-mcq-multi">
        {item.passage && <div className="pte-mcq-passage">{item.passage}</div>}
        <div className="pte-mcq-question">{item.question}</div>
        <div className="pte-mcq-note">Select {required} option{required > 1 ? "s" : ""}.</div>
        <div className="pte-options">
          {(item.options || []).map((opt, i) => (
            <label key={i} className={"pte-option" + (selected.includes(opt) ? " selected" : "")}>
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     PTEMcqSingle — Multiple Choice, Single Answer
  ──────────────────────────────────────────────────────────── */
  function PTEMcqSingle({ item, answer, onAnswer }) {
    return (
      <div className="pte-mcq-single">
        {item.passage && <div className="pte-mcq-passage">{item.passage}</div>}
        <div className="pte-mcq-question">{item.question || item.prompt || ""}</div>
        <div className="pte-options">
          {(item.options || []).map((opt, i) => (
            <label key={i} className={"pte-option" + (answer === opt ? " selected" : "")}>
              <input
                type="radio"
                name={item.id + "-opt"}
                checked={answer === opt}
                onChange={() => onAnswer(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────
     PTEReadingReview — shown after test submission
  ──────────────────────────────────────────────────────────── */
  function PTEReadingReview({ sec, answers, sectionId }) {
    const items = sec.items || [];

    return (
      <div className="pte-review">
        <h3 className="pte-review-title">PTE Reading — Review</h3>
        {items.map((item, idx) => {
          const userAns = answers[sectionId + "_" + item.id];
          const qt = item.questionType;
          return (
            <div key={item.id} className="pte-review-item">
              <div className="pte-review-item-header">
                <span className="pte-review-num">Item {idx + 1}</span>
                <span className="pte-review-qtype">{qt}</span>
              </div>

              {/* RW Fill Blanks / Fill Blanks */}
              {(qt === "reading_writing_fill_blanks" || qt === "fill_in_blanks") && (() => {
                const correctAnswers = item.correctAnswers || [];
                const userMap = userAns || {};
                const parsedP = qt === "reading_writing_fill_blanks"
                  ? parseRwFibPassage(item.passage || "")
                  : parseFibPassage(item.passage || "");
                const blanks = parsedP.filter(s => s.type === "blank");
                return (
                  <div className="pte-review-body">
                    <div className="pte-review-passage">
                      {parsedP.map((seg, i) => {
                        if (seg.type === "text") return <span key={i}>{seg.text}</span>;
                        const userWord = userMap[seg.index];
                        const correctWord = correctAnswers[seg.index - 1] || "?";
                        const ok = userWord === correctWord;
                        return (
                          <span key={i} className={"pte-review-blank " + (ok ? "correct" : "incorrect")}>
                            {userWord || "—"}
                            {!ok && <span className="pte-review-correct-word"> ({correctWord})</span>}
                          </span>
                        );
                      })}
                    </div>
                    {item.explanation && <div className="pte-review-explanation">{item.explanation}</div>}
                  </div>
                );
              })()}

              {/* Reorder */}
              {qt === "reorder_paragraphs" && (() => {
                const correct = item.correctOrder || [];
                const user = Array.isArray(userAns) ? userAns : [];
                return (
                  <div className="pte-review-body">
                    <div className="pte-review-orders">
                      <div>
                        <strong>Your order:</strong> {user.join(" → ") || "—"}
                      </div>
                      <div>
                        <strong>Correct order:</strong> {correct.join(" → ")}
                      </div>
                    </div>
                    {item.explanation && <div className="pte-review-explanation">{item.explanation}</div>}
                  </div>
                );
              })()}

              {/* MCQ Multiple */}
              {qt === "multiple_choice_multiple" && (() => {
                const selected = Array.isArray(userAns) ? userAns : [];
                const expected = item.correctAnswers || [];
                return (
                  <div className="pte-review-body">
                    {item.passage && <div className="pte-review-passage-short">{item.passage.substring(0,200)}…</div>}
                    <div className="pte-review-mcq-q">{item.question}</div>
                    <div><strong>Your answer:</strong> {selected.join("; ") || "—"}</div>
                    <div><strong>Correct:</strong> {expected.join("; ")}</div>
                    {item.explanation && <div className="pte-review-explanation">{item.explanation}</div>}
                  </div>
                );
              })()}

              {/* MCQ Single */}
              {(qt === "multiple_choice_single" || (!qt && item.options)) && (() => {
                const ok = userAns === item.correctAnswer;
                return (
                  <div className="pte-review-body">
                    {item.passage && <div className="pte-review-passage-short">{item.passage.substring(0,200)}…</div>}
                    <div className="pte-review-mcq-q">{item.question || item.prompt || ""}</div>
                    <div className={"pte-review-answer " + (ok ? "correct" : "incorrect")}>
                      <strong>Your answer:</strong> {userAns || "—"}
                    </div>
                    {!ok && <div><strong>Correct:</strong> {item.correctAnswer}</div>}
                    {item.explanation && <div className="pte-review-explanation">{item.explanation}</div>}
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    );
  }

  // ── Score helper ──────────────────────────────────────────────────────────
  function scorePteReading(sec, answers, sectionId) {
    const items = sec.items || [];
    let correct = 0, total = 0;
    for (const item of items) {
      const ua  = answers[sectionId + "_" + item.id];
      const qt  = item.questionType;

      if (qt === "reading_writing_fill_blanks" || qt === "fill_in_blanks") {
        // correctAnswers = ["word1","word2",...] indexed 0-based, blanks 1-based
        const correctAnswers = item.correctAnswers || [];
        const userMap = ua || {};
        correctAnswers.forEach((ca, i) => {
          total++;
          if (userMap[i + 1] === ca) correct++;
        });

      } else if (qt === "reorder_paragraphs") {
        const correctOrder = item.correctOrder || [];
        const userOrder = Array.isArray(ua) ? ua : [];
        total += correctOrder.length;
        correctOrder.forEach((id, i) => { if (userOrder[i] === id) correct++; });

      } else if (qt === "multiple_choice_multiple") {
        const selected = Array.isArray(ua) ? ua : [];
        const expected = item.correctAnswers || [];
        total += expected.length;
        expected.forEach(e => { if (selected.includes(e)) correct++; });

      } else if (qt === "multiple_choice_single") {
        total++;
        if (ua === item.correctAnswer) correct++;
      }
    }
    return { correct, total };
  }

  // Expose globally
  window.LP_PTE_RENDERER = { PTEReadingSection, PTEReadingReview, scorePteReading };
})();
