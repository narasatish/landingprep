// screens/celpip-renderer.jsx
// CELPIP General — Reading, Writing, and Speaking section renderers
// Exposed as window.LP_CELPIP
(function () {
  const { useState, useEffect, useRef, useCallback } = React;

  // ─── READING ───────────────────────────────────────────────────────────────

  /* Correspondence (email chain) */
  function EmailChain({ passage }) {
    const emails = passage.emails || [];
    return (
      <div className="celpip-email-chain">
        {emails.map((email, i) => (
          <div key={i} className="celpip-email">
            <div className="celpip-email-header">
              <div><strong>From:</strong> {email.from}</div>
              <div><strong>To:</strong> {email.to}</div>
              <div><strong>Subject:</strong> {email.subject}</div>
              <div><strong>Date:</strong> {email.date}</div>
            </div>
            <pre className="celpip-email-body">{email.body}</pre>
          </div>
        ))}
      </div>
    );
  }

  /* Diagram/schedule */
  function ScheduleTable({ passage }) {
    const rows = passage.schedule || [];
    if (!rows.length) return null;
    const cols = Object.keys(rows[0]);
    return (
      <div className="celpip-schedule-wrap">
        {passage.intro && <p className="celpip-schedule-intro">{passage.intro}</p>}
        <table className="celpip-schedule-table">
          <thead>
            <tr>{cols.map(c => <th key={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>{cols.map(c => <td key={c}>{row[c]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* Viewpoints (4 short opinions) */
  function ViewpointCards({ passage }) {
    const vps = passage.viewpoints || [];
    const colours = ["#e0f2fe","#fef3c7","#dcfce7","#fce7f3"];
    return (
      <div className="celpip-viewpoints">
        {vps.map((vp, i) => (
          <div key={i} className="celpip-viewpoint-card" style={{ background: colours[i % colours.length] }}>
            <div className="celpip-viewpoint-name">{vp.name}</div>
            <p className="celpip-viewpoint-text">{vp.text}</p>
          </div>
        ))}
      </div>
    );
  }

  /* Article */
  function ArticlePassage({ passage }) {
    return (
      <div className="celpip-article">
        <h3 className="celpip-article-title">{passage.title}</h3>
        <p className="celpip-article-text">{passage.text}</p>
      </div>
    );
  }

  /* Reading question card */
  function ReadingQCard({ q, answer, setAnswer }) {
    if (q.type === "fill_in_the_blank" || q.questionType === "fill_in_the_blank") {
      return (
        <div className="celpip-rq-card">
          <p className="celpip-rq-prompt">{q.prompt}</p>
          <input className="celpip-rq-fill"
            value={answer || ""}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Type your answer…" />
        </div>
      );
    }
    const opts = q.options || [];
    return (
      <div className="celpip-rq-card">
        <p className="celpip-rq-prompt">{q.prompt}</p>
        <div className="celpip-rq-options">
          {opts.map((opt, oi) => (
            <label key={oi} className={`celpip-rq-opt ${answer === opt ? "selected" : ""}`}>
              <input type="radio" name={q.id} value={opt}
                checked={answer === opt} onChange={() => setAnswer(opt)} />
              <span>{String.fromCharCode(65+oi)}. {opt}</span>
            </label>
          ))}
        </div>
        {q.explanation && answer && (
          <div className={`celpip-rq-feedback ${answer === q.correctAnswer || answer === q.answer ? "correct" : "wrong"}`}>
            {answer === q.correctAnswer || answer === q.answer ? "✓ Correct" : `✗ Correct answer: ${q.correctAnswer || q.answer}`}
            <div className="celpip-rq-explain">{q.explanation}</div>
          </div>
        )}
      </div>
    );
  }

  /* Full reading part panel */
  function ReadingPart({ passage, answers, setAnswer }) {
    const questions = passage.questions || [];
    const [qIdx, setQIdx] = useState(0);
    const total = questions.length;

    function renderPassageContent() {
      switch (passage.type) {
        case "correspondence": return <EmailChain passage={passage} />;
        case "schedule":       return <ScheduleTable passage={passage} />;
        case "viewpoints":     return <ViewpointCards passage={passage} />;
        default:               return <ArticlePassage passage={passage} />;
      }
    }

    const current = questions[qIdx];
    if (!current) return null;
    const answered = questions.filter(q => answers[q.id] != null && answers[q.id] !== "").length;

    return (
      <div className="celpip-reading-part">
        {/* Part header */}
        <div className="celpip-part-header">
          <div className="celpip-part-badge">Part {passage.part}</div>
          <div className="celpip-part-title">{passage.partTitle || passage.title}</div>
          <div className="celpip-part-progress">{answered}/{total} answered</div>
        </div>

        <div className="celpip-reading-layout">
          {/* Left: passage */}
          <div className="celpip-reading-left">
            <h4 className="celpip-passage-title">{passage.title}</h4>
            {renderPassageContent()}
          </div>
          {/* Right: questions */}
          <div className="celpip-reading-right">
            {/* Q nav dots */}
            <div className="celpip-q-dots">
              {questions.map((q, i) => (
                <button key={i}
                  className={`celpip-q-dot ${i === qIdx ? "active" : ""} ${answers[q.id] ? "done" : ""}`}
                  onClick={() => setQIdx(i)}
                  title={`Q${i+1}`}>{i+1}</button>
              ))}
            </div>
            {/* Current question */}
            <div className="celpip-q-num">Question {qIdx + 1} of {total}</div>
            <ReadingQCard
              key={current.id}
              q={current}
              answer={answers[current.id]}
              setAnswer={val => setAnswer(current.id, val)}
            />
            {/* Prev/Next */}
            <div className="celpip-q-nav">
              <button className="celpip-nav-btn" onClick={() => setQIdx(i => Math.max(0, i-1))} disabled={qIdx === 0}>← Prev</button>
              <button className="celpip-nav-btn primary" onClick={() => setQIdx(i => Math.min(total-1, i+1))} disabled={qIdx === total-1}>Next →</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* CELPIP Reading Section */
  function CelpipReadingSection({ sec, answers, setAnswer }) {
    const passages = sec.passages || [];
    const [partIdx, setPartIdx] = useState(0);
    const current = passages[partIdx];
    if (!current) return <div className="celpip-empty">No reading content found.</div>;

    return (
      <div className="celpip-reading-shell">
        {/* Part tabs */}
        <div className="celpip-part-tabs">
          {passages.map((p, i) => {
            const partAnswered = (p.questions||[]).filter(q => answers[q.id]).length;
            const partTotal = (p.questions||[]).length;
            return (
              <button key={i}
                className={`celpip-part-tab ${i === partIdx ? "active" : ""}`}
                onClick={() => setPartIdx(i)}>
                Part {p.part}
                <span className="celpip-tab-sub">{p.partTitle || p.type}</span>
                {partAnswered > 0 && <span className="celpip-tab-count">{partAnswered}/{partTotal}</span>}
              </button>
            );
          })}
        </div>
        <ReadingPart
          key={current.id}
          passage={current}
          answers={answers}
          setAnswer={setAnswer}
        />
      </div>
    );
  }

  // ─── WRITING ───────────────────────────────────────────────────────────────

  function countWords(t) { return (t||"").trim().split(/\s+/).filter(Boolean).length; }

  function EmailTask({ task, answer, setAnswer }) {
    const wc = countWords(answer);
    const inRange = wc >= 140 && wc <= 220;
    return (
      <div className="celpip-writing-task">
        <div className="celpip-task-header">
          <span className="celpip-task-badge">Task 1 — Email Writing</span>
          <span className="celpip-task-time">⏱ {task.timeMinutes} minutes</span>
          <span className="celpip-task-wc-guide">Target: {task.wordCountGuideline}</span>
        </div>
        <div className="celpip-task-scenario">
          <strong>Situation:</strong> {task.scenario}
        </div>
        {task.recipient && (
          <div className="celpip-task-recipient">
            <strong>Write to:</strong> {task.recipient}
          </div>
        )}
        {task.bulletPoints && task.bulletPoints.length > 0 && (
          <div className="celpip-task-bullets">
            <strong>In your email:</strong>
            <ul>
              {task.bulletPoints.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        )}
        {task.formatGuidance && (
          <div className="celpip-task-format">
            <strong>Format note:</strong> {task.formatGuidance}
          </div>
        )}
        <div className="celpip-writing-area">
          <div className="celpip-subject-row">
            <label>Subject line:</label>
            <input className="celpip-subject-input" placeholder="Enter subject line…"
              value={(answer||"").split("\n")[0]?.startsWith("Subject:") ? (answer||"").split("\n")[0].replace("Subject:","").trim() : ""}
              onChange={e => {
                const rest = (answer||"").split("\n").slice(1).join("\n");
                setAnswer(`Subject: ${e.target.value}\n${rest}`);
              }} />
          </div>
          <textarea className="celpip-writing-textarea"
            rows={14}
            placeholder={`Dear ${task.recipient || "..."},\n\n[Your email here]\n\nSincerely,\n[Your name]`}
            value={answer || ""}
            onChange={e => setAnswer(e.target.value)}
          />
          <div className={`celpip-wc-bar ${inRange ? "ok" : wc > 220 ? "over" : "under"}`}>
            {wc} words {inRange ? "✓ In range" : wc > 220 ? "⚠ Over limit" : `(aim for ${task.wordCountGuideline})`}
          </div>
        </div>
        {task.modelAnswerNotes && (
          <details className="celpip-model-notes">
            <summary>Scoring guidance</summary>
            <p>{task.modelAnswerNotes}</p>
          </details>
        )}
      </div>
    );
  }

  function SurveyTask({ task, answer, setAnswer }) {
    const wc = countWords(answer);
    const inRange = wc >= 140 && wc <= 220;
    return (
      <div className="celpip-writing-task">
        <div className="celpip-task-header">
          <span className="celpip-task-badge">Task 2 — Survey Response</span>
          <span className="celpip-task-time">⏱ {task.timeMinutes} minutes</span>
          <span className="celpip-task-wc-guide">Target: {task.wordCountGuideline}</span>
        </div>
        <div className="celpip-task-scenario">
          <strong>Question:</strong> {task.surveyPrompt}
        </div>
        <div className="celpip-survey-options">
          <div className="celpip-survey-option">
            <span className="celpip-survey-label">Option A</span>
            <p>{task.optionA}</p>
          </div>
          <div className="celpip-survey-option">
            <span className="celpip-survey-label">Option B</span>
            <p>{task.optionB}</p>
          </div>
        </div>
        {task.formatGuidance && (
          <div className="celpip-task-format">
            <strong>Format note:</strong> {task.formatGuidance}
          </div>
        )}
        <div className="celpip-writing-area">
          <textarea className="celpip-writing-textarea"
            rows={12}
            placeholder={`I prefer Option [A/B] because...\n\n[Give at least 2 reasons with details]\n\nIn conclusion, I believe...`}
            value={answer || ""}
            onChange={e => setAnswer(e.target.value)}
          />
          <div className={`celpip-wc-bar ${inRange ? "ok" : wc > 220 ? "over" : "under"}`}>
            {wc} words {inRange ? "✓ In range" : wc > 220 ? "⚠ Over limit" : `(aim for ${task.wordCountGuideline})`}
          </div>
        </div>
        {task.modelAnswerNotes && (
          <details className="celpip-model-notes">
            <summary>Scoring guidance</summary>
            <p>{task.modelAnswerNotes}</p>
          </details>
        )}
      </div>
    );
  }

  function CelpipWritingSection({ sec, answers, setAnswer }) {
    const tasks = sec.tasks || [];
    const [taskIdx, setTaskIdx] = useState(0);
    const current = tasks[taskIdx];
    if (!current) return <div className="celpip-empty">No writing tasks found.</div>;

    function renderTask(task) {
      const ans = answers[task.id] || "";
      const setAns = val => setAnswer(task.id, val);
      if (task.taskType === "survey_response") return <SurveyTask task={task} answer={ans} setAnswer={setAns} />;
      return <EmailTask task={task} answer={ans} setAnswer={setAns} />;
    }

    return (
      <div className="celpip-writing-shell">
        <div className="celpip-task-tabs">
          {tasks.map((t, i) => (
            <button key={i}
              className={`celpip-task-tab ${i === taskIdx ? "active" : ""}`}
              onClick={() => setTaskIdx(i)}>
              Task {t.taskNumber}
              <span className="celpip-tab-sub">{t.taskType === "survey_response" ? "Survey" : "Email"}</span>
              {answers[t.id] && <span className="celpip-tab-done">✓</span>}
            </button>
          ))}
        </div>
        {renderTask(current)}
        <div className="celpip-task-footer">
          {taskIdx > 0 && (
            <button className="celpip-nav-btn" onClick={() => setTaskIdx(i => i-1)}>← Task {taskIdx}</button>
          )}
          {taskIdx < tasks.length - 1 && (
            <button className="celpip-nav-btn primary" onClick={() => setTaskIdx(i => i+1)}>Task {taskIdx+2} →</button>
          )}
        </div>
      </div>
    );
  }

  // ─── SPEAKING ──────────────────────────────────────────────────────────────

  const TASK_TYPE_LABELS = {
    giving_advice:        "Giving Advice",
    personal_experience:  "Personal Experience",
    describing_a_scene:   "Describing a Scene",
    making_predictions:   "Making Predictions",
    comparing_and_persuading: "Comparing & Persuading",
    dealing_with_situation:   "Dealing with a Difficult Situation",
    expressing_opinions:  "Expressing Opinions",
    unusual_situation:    "Unusual Situation",
  };

  const TASK_TYPE_ICONS = {
    giving_advice: "💡", personal_experience: "💬", describing_a_scene: "🖼️",
    making_predictions: "🔮", comparing_and_persuading: "⚖️",
    dealing_with_situation: "🤝", expressing_opinions: "📣", unusual_situation: "🤔",
  };

  const TASK_TIPS = {
    giving_advice:       "Give 2–3 practical suggestions. Explain the reason behind each one. Use phrases like 'I would suggest…', 'One thing that might help is…', 'Another option would be…'",
    personal_experience: "Use specific details — where, when, who was involved. Structure: situation → what happened → outcome/reflection.",
    describing_a_scene:  "Describe foreground, background, people's actions and expressions, atmosphere. Use present continuous: 'A woman is walking…', 'Children are playing…'",
    making_predictions:  "Say what you see, then give 2+ predictions using 'I think…', 'It seems likely that…', 'She is probably about to…'. Give reasons.",
    comparing_and_persuading: "Acknowledge strengths of both options. Then argue clearly for one. Use: 'While Option A has…, I believe Option B is better because…'",
    dealing_with_situation: "Be respectful but clear. State the problem, explain the impact, offer a solution or ask for their input. Avoid blaming language.",
    expressing_opinions: "State position clearly. Give 2–3 reasons with examples. Briefly acknowledge the other side. Conclude firmly. Use: 'In my view…', 'For example…', 'While some argue…'",
    unusual_situation:   "Describe what you see clearly. Then explain what is unusual. Give 2 possible reasons or explanations. Be creative but logical.",
  };

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  function SpeakingTask({ task, idx, total, answers, setAnswer, sectionId }) {
    const micSupported = !!SR;
    const ansKey = (sectionId || "celpip_speaking") + "_" + (task.id || ("t" + (task.taskNumber || idx)));
    const transcript = (answers && answers[ansKey]) || "";
    // If this task already has a saved response, show it (start in "done") so the
    // candidate sees their answer when they navigate back to it.
    const [phase, setPhase] = useState(transcript ? "done" : "ready"); // ready | prep | recording | done
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    const recRef = useRef(null);
    const save = (v) => setAnswer && setAnswer(ansKey, v);

    function clearTimer() { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }

    // Real microphone capture → live transcript saved to answers for end-of-test scoring.
    function startMic() {
      if (!SR) return;
      try {
        const r = new SR();
        r.continuous = true; r.interimResults = true; r.lang = "en-US";
        let finalT = "";
        r.onresult = (e) => {
          let interim = "";
          for (let i = 0; i < e.results.length; i++) {
            const res = e.results[i];
            if (res.isFinal) { if (!finalT.includes(res[0].transcript)) finalT += res[0].transcript + " "; }
          }
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (!e.results[i].isFinal) interim += e.results[i][0].transcript;
          }
          save((finalT + interim).trim());
        };
        r.onerror = () => {};
        recRef.current = r;
        r.start();
      } catch (_) {}
    }
    function stopMic() { try { recRef.current && recRef.current.stop(); } catch (_) {} recRef.current = null; }

    function startPrep() {
      clearTimer();
      setPhase("prep");
      setTimeLeft(task.prepSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearTimer(); startRecording(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }

    function startRecording() {
      clearTimer();
      if (!transcript) save(""); // fresh attempt
      setPhase("recording");
      setTimeLeft(task.responseSeconds);
      startMic();
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearTimer(); stopMic(); setPhase("done"); return 0; }
          return prev - 1;
        });
      }, 1000);
    }

    function reset() { clearTimer(); stopMic(); save(""); setPhase("ready"); setTimeLeft(0); }

    useEffect(() => () => { clearTimer(); stopMic(); }, []);

    const icon = TASK_TYPE_ICONS[task.taskType] || "🎙";
    const typeLabel = TASK_TYPE_LABELS[task.taskType] || task.taskType;
    const tip = TASK_TIPS[task.taskType] || task.tip || "";

    return (
      <div className="celpip-sp-task">
        {/* Header */}
        <div className="celpip-sp-task-header">
          <div className="celpip-sp-task-num">Task {task.taskNumber} of {total}</div>
          <div className="celpip-sp-task-type">{icon} {typeLabel}</div>
          <div className="celpip-sp-task-times">
            <span>Prep: {task.prepSeconds}s</span>
            <span>Response: {task.responseSeconds}s</span>
          </div>
        </div>

        {/* Prompt */}
        <div className="celpip-sp-prompt-box">
          {task.sceneDescription && (
            <div className="celpip-sp-scene">
              <div className="celpip-sp-scene-label">📷 Scene Description</div>
              <p>{task.sceneDescription}</p>
            </div>
          )}
          {task.optionA && task.optionB && (
            <div className="celpip-sp-compare">
              <div className="celpip-sp-compare-card a">
                <div className="celpip-sp-compare-label">{task.optionA.label || "Option A"}</div>
                <p>{task.optionA.description}</p>
              </div>
              <div className="celpip-sp-compare-card b">
                <div className="celpip-sp-compare-label">{task.optionB.label || "Option B"}</div>
                <p>{task.optionB.description}</p>
              </div>
            </div>
          )}
          <div className="celpip-sp-prompt">
            <strong>Prompt:</strong> {task.prompt}
          </div>
        </div>

        {/* Strategy tip */}
        {tip && (
          <details className="celpip-sp-tip">
            <summary>💡 Strategy tip</summary>
            <p>{tip}</p>
          </details>
        )}

        {/* Timer and controls */}
        <div className="celpip-sp-controls">
          {phase === "ready" && (
            <button className="celpip-sp-btn start" onClick={startPrep}>
              ▶ Start Preparation ({task.prepSeconds}s)
            </button>
          )}
          {phase === "prep" && (
            <div className="celpip-sp-timer-area prep">
              <div className="celpip-sp-phase-label">⏱ Preparation time</div>
              <div className="celpip-sp-timer">{timeLeft}s</div>
              <div className="celpip-sp-timer-bar">
                <div className="celpip-sp-timer-fill" style={{ width: `${(timeLeft/task.prepSeconds)*100}%`, background: "#3b82f6" }} />
              </div>
              <p className="celpip-sp-hint">Prepare your response — recording starts automatically.</p>
              <button className="celpip-sp-btn start" onClick={startRecording}>Skip to Recording →</button>
            </div>
          )}
          {phase === "recording" && (
            <div className="celpip-sp-timer-area recording">
              <div className="celpip-sp-phase-label">🔴 {micSupported ? "Recording — speak now!" : "Speak now (type your answer below)"}</div>
              <div className="celpip-sp-timer">{timeLeft}s</div>
              <div className="celpip-sp-timer-bar">
                <div className="celpip-sp-timer-fill" style={{ width: `${(timeLeft/task.responseSeconds)*100}%`, background: "#ef4444" }} />
              </div>
              {micSupported
                ? <div className="celpip-sp-live-transcript">{transcript ? transcript : "Listening… your words appear here."}</div>
                : <textarea className="celpip-writing-textarea" style={{ marginTop: 10, minHeight: 90 }} placeholder="Microphone unavailable — type what you would say…" value={transcript} onChange={(e) => save(e.target.value)} />}
              <button className="celpip-sp-btn stop" onClick={() => { clearTimer(); stopMic(); setPhase("done"); }}>⏹ Stop &amp; Save</button>
            </div>
          )}
          {phase === "done" && (
            <div className="celpip-sp-done">
              <div className="celpip-sp-done-icon">✅</div>
              <div className="celpip-sp-done-msg">{transcript ? "Response saved!" : "Add your response"}</div>
              <div className="celpip-sp-transcript-box">
                <strong>{transcript ? "Your response (transcript):" : "If the mic didn't catch your answer, type it here:"}</strong>
                <textarea className="celpip-writing-textarea" style={{ marginTop: 8, minHeight: 90 }}
                  placeholder="Type or edit your spoken response here…"
                  value={transcript} onChange={(e) => save(e.target.value)} />
                <p className="celpip-sp-hint" style={{ marginTop: 6 }}>This response is scored with the rest of your test when you finish. You can edit it or record again.</p>
              </div>
              <div className="celpip-sp-rubric">
                <strong>Scored on:</strong>
                {["Content & Coherence","Vocabulary Range","Listenability (clarity, pacing)","Task Fulfillment"].map((r,i) => (
                  <div key={i} className="celpip-sp-rubric-item">• {r}</div>
                ))}
              </div>
              <button className="celpip-sp-btn retry" onClick={reset}>↺ Try Again</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function CelpipSpeakingSection({ sec, answers, setAnswer }) {
    const tasks = sec.tasks || [];
    const [taskIdx, setTaskIdx] = useState(0);
    const [doneSet, setDoneSet] = useState(new Set());
    const total = tasks.length;
    const current = tasks[taskIdx];
    const sectionId = sec.id || "celpip_speaking";

    function markDone(i) { setDoneSet(prev => new Set([...prev, i])); }

    if (!current) return <div className="celpip-empty">No speaking tasks found.</div>;

    return (
      <div className="celpip-speaking-shell">
        {/* Task dots */}
        <div className="celpip-sp-dot-row">
          {tasks.map((t, i) => (
            <button key={i}
              className={`celpip-sp-dot ${i === taskIdx ? "active" : ""} ${doneSet.has(i) ? "done" : ""}`}
              onClick={() => setTaskIdx(i)}
              title={`Task ${i+1}: ${TASK_TYPE_LABELS[t.taskType] || t.taskType}`}>
              {i+1}
            </button>
          ))}
        </div>

        <SpeakingTask key={taskIdx} task={current} idx={taskIdx} total={total}
          answers={answers} setAnswer={setAnswer} sectionId={sectionId} />

        {/* Nav */}
        <div className="celpip-sp-nav">
          <button className="celpip-nav-btn" disabled={taskIdx === 0}
            onClick={() => setTaskIdx(i => i-1)}>← Prev Task</button>
          <span className="celpip-sp-nav-info">{TASK_TYPE_ICONS[current.taskType]} Task {taskIdx+1} of {total}</span>
          <button className="celpip-nav-btn primary" disabled={taskIdx === total-1}
            onClick={() => { markDone(taskIdx); setTaskIdx(i => i+1); }}>
            Next Task →
          </button>
        </div>
      </div>
    );
  }

  // ─── EXPOSE ────────────────────────────────────────────────────────────────
  window.LP_CELPIP = { CelpipReadingSection, CelpipWritingSection, CelpipSpeakingSection };
})();
