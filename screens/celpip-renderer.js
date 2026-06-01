(function() {
  const { useState, useEffect, useRef, useCallback } = React;
  function EmailChain({ passage }) {
    const emails = passage.emails || [];
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-email-chain" }, emails.map((email, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "celpip-email" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-email-header" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "From:"), " ", email.from), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "To:"), " ", email.to), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Subject:"), " ", email.subject), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("strong", null, "Date:"), " ", email.date)), /* @__PURE__ */ React.createElement("pre", { className: "celpip-email-body" }, email.body))));
  }
  function ScheduleTable({ passage }) {
    const rows = passage.schedule || [];
    if (!rows.length) return null;
    const cols = Object.keys(rows[0]);
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-schedule-wrap" }, passage.intro && /* @__PURE__ */ React.createElement("p", { className: "celpip-schedule-intro" }, passage.intro), /* @__PURE__ */ React.createElement("table", { className: "celpip-schedule-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, cols.map((c) => /* @__PURE__ */ React.createElement("th", { key: c }, c.charAt(0).toUpperCase() + c.slice(1))))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((row, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, cols.map((c) => /* @__PURE__ */ React.createElement("td", { key: c }, row[c])))))));
  }
  function ViewpointCards({ passage }) {
    const vps = passage.viewpoints || [];
    const colours = ["#e0f2fe", "#fef3c7", "#dcfce7", "#fce7f3"];
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-viewpoints" }, vps.map((vp, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "celpip-viewpoint-card", style: { background: colours[i % colours.length] } }, /* @__PURE__ */ React.createElement("div", { className: "celpip-viewpoint-name" }, vp.name), /* @__PURE__ */ React.createElement("p", { className: "celpip-viewpoint-text" }, vp.text))));
  }
  function ArticlePassage({ passage }) {
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-article" }, /* @__PURE__ */ React.createElement("h3", { className: "celpip-article-title" }, passage.title), /* @__PURE__ */ React.createElement("p", { className: "celpip-article-text" }, passage.text));
  }
  function ReadingQCard({ q, answer, setAnswer }) {
    if (q.type === "fill_in_the_blank" || q.questionType === "fill_in_the_blank") {
      return /* @__PURE__ */ React.createElement("div", { className: "celpip-rq-card" }, /* @__PURE__ */ React.createElement("p", { className: "celpip-rq-prompt" }, q.prompt), /* @__PURE__ */ React.createElement(
        "input",
        {
          className: "celpip-rq-fill",
          value: answer || "",
          onChange: (e) => setAnswer(e.target.value),
          placeholder: "Type your answer\u2026"
        }
      ));
    }
    const opts = q.options || [];
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-rq-card" }, /* @__PURE__ */ React.createElement("p", { className: "celpip-rq-prompt" }, q.prompt), /* @__PURE__ */ React.createElement("div", { className: "celpip-rq-options" }, opts.map((opt, oi) => /* @__PURE__ */ React.createElement("label", { key: oi, className: `celpip-rq-opt ${answer === opt ? "selected" : ""}` }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "radio",
        name: q.id,
        value: opt,
        checked: answer === opt,
        onChange: () => setAnswer(opt)
      }
    ), /* @__PURE__ */ React.createElement("span", null, String.fromCharCode(65 + oi), ". ", opt)))), q.explanation && answer && /* @__PURE__ */ React.createElement("div", { className: `celpip-rq-feedback ${answer === q.correctAnswer || answer === q.answer ? "correct" : "wrong"}` }, answer === q.correctAnswer || answer === q.answer ? "\u2713 Correct" : `\u2717 Correct answer: ${q.correctAnswer || q.answer}`, /* @__PURE__ */ React.createElement("div", { className: "celpip-rq-explain" }, q.explanation)));
  }
  function ReadingPart({ passage, answers, setAnswer }) {
    const questions = passage.questions || [];
    const [qIdx, setQIdx] = useState(0);
    const total = questions.length;
    function renderPassageContent() {
      switch (passage.type) {
        case "correspondence":
          return /* @__PURE__ */ React.createElement(EmailChain, { passage });
        case "schedule":
          return /* @__PURE__ */ React.createElement(ScheduleTable, { passage });
        case "viewpoints":
          return /* @__PURE__ */ React.createElement(ViewpointCards, { passage });
        default:
          return /* @__PURE__ */ React.createElement(ArticlePassage, { passage });
      }
    }
    const current = questions[qIdx];
    if (!current) return null;
    const answered = questions.filter((q) => answers[q.id] != null && answers[q.id] !== "").length;
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-reading-part" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-part-header" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-part-badge" }, "Part ", passage.part), /* @__PURE__ */ React.createElement("div", { className: "celpip-part-title" }, passage.partTitle || passage.title), /* @__PURE__ */ React.createElement("div", { className: "celpip-part-progress" }, answered, "/", total, " answered")), /* @__PURE__ */ React.createElement("div", { className: "celpip-reading-layout" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-reading-left" }, /* @__PURE__ */ React.createElement("h4", { className: "celpip-passage-title" }, passage.title), renderPassageContent()), /* @__PURE__ */ React.createElement("div", { className: "celpip-reading-right" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-q-dots" }, questions.map((q, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        className: `celpip-q-dot ${i === qIdx ? "active" : ""} ${answers[q.id] ? "done" : ""}`,
        onClick: () => setQIdx(i),
        title: `Q${i + 1}`
      },
      i + 1
    ))), /* @__PURE__ */ React.createElement("div", { className: "celpip-q-num" }, "Question ", qIdx + 1, " of ", total), /* @__PURE__ */ React.createElement(
      ReadingQCard,
      {
        key: current.id,
        q: current,
        answer: answers[current.id],
        setAnswer: (val) => setAnswer(current.id, val)
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "celpip-q-nav" }, /* @__PURE__ */ React.createElement("button", { className: "celpip-nav-btn", onClick: () => setQIdx((i) => Math.max(0, i - 1)), disabled: qIdx === 0 }, "\u2190 Prev"), /* @__PURE__ */ React.createElement("button", { className: "celpip-nav-btn primary", onClick: () => setQIdx((i) => Math.min(total - 1, i + 1)), disabled: qIdx === total - 1 }, "Next \u2192")))));
  }
  function CelpipReadingSection({ sec, answers, setAnswer }) {
    const passages = sec.passages || [];
    const [partIdx, setPartIdx] = useState(0);
    const current = passages[partIdx];
    if (!current) return /* @__PURE__ */ React.createElement("div", { className: "celpip-empty" }, "No reading content found.");
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-reading-shell" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-part-tabs" }, passages.map((p, i) => {
      const partAnswered = (p.questions || []).filter((q) => answers[q.id]).length;
      const partTotal = (p.questions || []).length;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: i,
          className: `celpip-part-tab ${i === partIdx ? "active" : ""}`,
          onClick: () => setPartIdx(i)
        },
        "Part ",
        p.part,
        /* @__PURE__ */ React.createElement("span", { className: "celpip-tab-sub" }, p.partTitle || p.type),
        partAnswered > 0 && /* @__PURE__ */ React.createElement("span", { className: "celpip-tab-count" }, partAnswered, "/", partTotal)
      );
    })), /* @__PURE__ */ React.createElement(
      ReadingPart,
      {
        key: current.id,
        passage: current,
        answers,
        setAnswer
      }
    ));
  }
  function countWords(t) {
    return (t || "").trim().split(/\s+/).filter(Boolean).length;
  }
  function EmailTask({ task, answer, setAnswer }) {
    var _a;
    const wc = countWords(answer);
    const inRange = wc >= 140 && wc <= 220;
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-writing-task" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-task-header" }, /* @__PURE__ */ React.createElement("span", { className: "celpip-task-badge" }, "Task 1 \u2014 Email Writing"), /* @__PURE__ */ React.createElement("span", { className: "celpip-task-time" }, "\u23F1 ", task.timeMinutes, " minutes"), /* @__PURE__ */ React.createElement("span", { className: "celpip-task-wc-guide" }, "Target: ", task.wordCountGuideline)), /* @__PURE__ */ React.createElement("div", { className: "celpip-task-scenario" }, /* @__PURE__ */ React.createElement("strong", null, "Situation:"), " ", task.scenario), task.recipient && /* @__PURE__ */ React.createElement("div", { className: "celpip-task-recipient" }, /* @__PURE__ */ React.createElement("strong", null, "Write to:"), " ", task.recipient), task.bulletPoints && task.bulletPoints.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "celpip-task-bullets" }, /* @__PURE__ */ React.createElement("strong", null, "In your email:"), /* @__PURE__ */ React.createElement("ul", null, task.bulletPoints.map((b, i) => /* @__PURE__ */ React.createElement("li", { key: i }, b)))), task.formatGuidance && /* @__PURE__ */ React.createElement("div", { className: "celpip-task-format" }, /* @__PURE__ */ React.createElement("strong", null, "Format note:"), " ", task.formatGuidance), /* @__PURE__ */ React.createElement("div", { className: "celpip-writing-area" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-subject-row" }, /* @__PURE__ */ React.createElement("label", null, "Subject line:"), /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "celpip-subject-input",
        placeholder: "Enter subject line\u2026",
        value: ((_a = (answer || "").split("\n")[0]) == null ? void 0 : _a.startsWith("Subject:")) ? (answer || "").split("\n")[0].replace("Subject:", "").trim() : "",
        onChange: (e) => {
          const rest = (answer || "").split("\n").slice(1).join("\n");
          setAnswer(`Subject: ${e.target.value}
${rest}`);
        }
      }
    )), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "celpip-writing-textarea",
        rows: 14,
        placeholder: `Dear ${task.recipient || "..."},

[Your email here]

Sincerely,
[Your name]`,
        value: answer || "",
        onChange: (e) => setAnswer(e.target.value)
      }
    ), /* @__PURE__ */ React.createElement("div", { className: `celpip-wc-bar ${inRange ? "ok" : wc > 220 ? "over" : "under"}` }, wc, " words ", inRange ? "\u2713 In range" : wc > 220 ? "\u26A0 Over limit" : `(aim for ${task.wordCountGuideline})`)), task.modelAnswerNotes && /* @__PURE__ */ React.createElement("details", { className: "celpip-model-notes" }, /* @__PURE__ */ React.createElement("summary", null, "Scoring guidance"), /* @__PURE__ */ React.createElement("p", null, task.modelAnswerNotes)));
  }
  function SurveyTask({ task, answer, setAnswer }) {
    const wc = countWords(answer);
    const inRange = wc >= 140 && wc <= 220;
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-writing-task" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-task-header" }, /* @__PURE__ */ React.createElement("span", { className: "celpip-task-badge" }, "Task 2 \u2014 Survey Response"), /* @__PURE__ */ React.createElement("span", { className: "celpip-task-time" }, "\u23F1 ", task.timeMinutes, " minutes"), /* @__PURE__ */ React.createElement("span", { className: "celpip-task-wc-guide" }, "Target: ", task.wordCountGuideline)), /* @__PURE__ */ React.createElement("div", { className: "celpip-task-scenario" }, /* @__PURE__ */ React.createElement("strong", null, "Question:"), " ", task.surveyPrompt), /* @__PURE__ */ React.createElement("div", { className: "celpip-survey-options" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-survey-option" }, /* @__PURE__ */ React.createElement("span", { className: "celpip-survey-label" }, "Option A"), /* @__PURE__ */ React.createElement("p", null, task.optionA)), /* @__PURE__ */ React.createElement("div", { className: "celpip-survey-option" }, /* @__PURE__ */ React.createElement("span", { className: "celpip-survey-label" }, "Option B"), /* @__PURE__ */ React.createElement("p", null, task.optionB))), task.formatGuidance && /* @__PURE__ */ React.createElement("div", { className: "celpip-task-format" }, /* @__PURE__ */ React.createElement("strong", null, "Format note:"), " ", task.formatGuidance), /* @__PURE__ */ React.createElement("div", { className: "celpip-writing-area" }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "celpip-writing-textarea",
        rows: 12,
        placeholder: `I prefer Option [A/B] because...

[Give at least 2 reasons with details]

In conclusion, I believe...`,
        value: answer || "",
        onChange: (e) => setAnswer(e.target.value)
      }
    ), /* @__PURE__ */ React.createElement("div", { className: `celpip-wc-bar ${inRange ? "ok" : wc > 220 ? "over" : "under"}` }, wc, " words ", inRange ? "\u2713 In range" : wc > 220 ? "\u26A0 Over limit" : `(aim for ${task.wordCountGuideline})`)), task.modelAnswerNotes && /* @__PURE__ */ React.createElement("details", { className: "celpip-model-notes" }, /* @__PURE__ */ React.createElement("summary", null, "Scoring guidance"), /* @__PURE__ */ React.createElement("p", null, task.modelAnswerNotes)));
  }
  function CelpipWritingSection({ sec, answers, setAnswer }) {
    const tasks = sec.tasks || [];
    const [taskIdx, setTaskIdx] = useState(0);
    const current = tasks[taskIdx];
    if (!current) return /* @__PURE__ */ React.createElement("div", { className: "celpip-empty" }, "No writing tasks found.");
    function renderTask(task) {
      const ans = answers[task.id] || "";
      const setAns = (val) => setAnswer(task.id, val);
      if (task.taskType === "survey_response") return /* @__PURE__ */ React.createElement(SurveyTask, { task, answer: ans, setAnswer: setAns });
      return /* @__PURE__ */ React.createElement(EmailTask, { task, answer: ans, setAnswer: setAns });
    }
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-writing-shell" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-task-tabs" }, tasks.map((t, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        className: `celpip-task-tab ${i === taskIdx ? "active" : ""}`,
        onClick: () => setTaskIdx(i)
      },
      "Task ",
      t.taskNumber,
      /* @__PURE__ */ React.createElement("span", { className: "celpip-tab-sub" }, t.taskType === "survey_response" ? "Survey" : "Email"),
      answers[t.id] && /* @__PURE__ */ React.createElement("span", { className: "celpip-tab-done" }, "\u2713")
    ))), renderTask(current), /* @__PURE__ */ React.createElement("div", { className: "celpip-task-footer" }, taskIdx > 0 && /* @__PURE__ */ React.createElement("button", { className: "celpip-nav-btn", onClick: () => setTaskIdx((i) => i - 1) }, "\u2190 Task ", taskIdx), taskIdx < tasks.length - 1 && /* @__PURE__ */ React.createElement("button", { className: "celpip-nav-btn primary", onClick: () => setTaskIdx((i) => i + 1) }, "Task ", taskIdx + 2, " \u2192")));
  }
  const TASK_TYPE_LABELS = {
    giving_advice: "Giving Advice",
    personal_experience: "Personal Experience",
    describing_a_scene: "Describing a Scene",
    making_predictions: "Making Predictions",
    comparing_and_persuading: "Comparing & Persuading",
    dealing_with_situation: "Dealing with a Difficult Situation",
    expressing_opinions: "Expressing Opinions",
    unusual_situation: "Unusual Situation"
  };
  const TASK_TYPE_ICONS = {
    giving_advice: "\u{1F4A1}",
    personal_experience: "\u{1F4AC}",
    describing_a_scene: "\u{1F5BC}\uFE0F",
    making_predictions: "\u{1F52E}",
    comparing_and_persuading: "\u2696\uFE0F",
    dealing_with_situation: "\u{1F91D}",
    expressing_opinions: "\u{1F4E3}",
    unusual_situation: "\u{1F914}"
  };
  const TASK_TIPS = {
    giving_advice: "Give 2\u20133 practical suggestions. Explain the reason behind each one. Use phrases like 'I would suggest\u2026', 'One thing that might help is\u2026', 'Another option would be\u2026'",
    personal_experience: "Use specific details \u2014 where, when, who was involved. Structure: situation \u2192 what happened \u2192 outcome/reflection.",
    describing_a_scene: "Describe foreground, background, people's actions and expressions, atmosphere. Use present continuous: 'A woman is walking\u2026', 'Children are playing\u2026'",
    making_predictions: "Say what you see, then give 2+ predictions using 'I think\u2026', 'It seems likely that\u2026', 'She is probably about to\u2026'. Give reasons.",
    comparing_and_persuading: "Acknowledge strengths of both options. Then argue clearly for one. Use: 'While Option A has\u2026, I believe Option B is better because\u2026'",
    dealing_with_situation: "Be respectful but clear. State the problem, explain the impact, offer a solution or ask for their input. Avoid blaming language.",
    expressing_opinions: "State position clearly. Give 2\u20133 reasons with examples. Briefly acknowledge the other side. Conclude firmly. Use: 'In my view\u2026', 'For example\u2026', 'While some argue\u2026'",
    unusual_situation: "Describe what you see clearly. Then explain what is unusual. Give 2 possible reasons or explanations. Be creative but logical."
  };
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  function SpeakingTask({ task, idx, total, answers, setAnswer, sectionId }) {
    const micSupported = !!SR;
    const ansKey = (sectionId || "celpip_speaking") + "_" + (task.id || "t" + (task.taskNumber || idx));
    const transcript = answers && answers[ansKey] || "";
    const [phase, setPhase] = useState(transcript ? "done" : "ready");
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    const recRef = useRef(null);
    const save = (v) => setAnswer && setAnswer(ansKey, v);
    function clearTimer() {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    function startMic() {
      if (!SR) return;
      try {
        const r = new SR();
        r.continuous = true;
        r.interimResults = true;
        r.lang = "en-US";
        let finalT = "";
        r.onresult = (e) => {
          let interim = "";
          for (let i = 0; i < e.results.length; i++) {
            const res = e.results[i];
            if (res.isFinal) {
              if (!finalT.includes(res[0].transcript)) finalT += res[0].transcript + " ";
            }
          }
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (!e.results[i].isFinal) interim += e.results[i][0].transcript;
          }
          save((finalT + interim).trim());
        };
        r.onerror = () => {
        };
        recRef.current = r;
        r.start();
      } catch (_) {
      }
    }
    function stopMic() {
      try {
        recRef.current && recRef.current.stop();
      } catch (_) {
      }
      recRef.current = null;
    }
    function startPrep() {
      clearTimer();
      setPhase("prep");
      setTimeLeft(task.prepSeconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
    }
    function startRecording() {
      clearTimer();
      if (!transcript) save("");
      setPhase("recording");
      setTimeLeft(task.responseSeconds);
      startMic();
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            stopMic();
            setPhase("done");
            return 0;
          }
          return prev - 1;
        });
      }, 1e3);
    }
    function reset() {
      clearTimer();
      stopMic();
      save("");
      setPhase("ready");
      setTimeLeft(0);
    }
    useEffect(() => () => {
      clearTimer();
      stopMic();
    }, []);
    const icon = TASK_TYPE_ICONS[task.taskType] || "\u{1F399}";
    const typeLabel = TASK_TYPE_LABELS[task.taskType] || task.taskType;
    const tip = TASK_TIPS[task.taskType] || task.tip || "";
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-task" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-task-header" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-task-num" }, "Task ", task.taskNumber, " of ", total), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-task-type" }, icon, " ", typeLabel), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-task-times" }, /* @__PURE__ */ React.createElement("span", null, "Prep: ", task.prepSeconds, "s"), /* @__PURE__ */ React.createElement("span", null, "Response: ", task.responseSeconds, "s"))), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-prompt-box" }, task.sceneDescription && /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-scene" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-scene-label" }, "\u{1F4F7} Scene Description"), /* @__PURE__ */ React.createElement("p", null, task.sceneDescription)), task.optionA && task.optionB && /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-compare" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-compare-card a" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-compare-label" }, task.optionA.label || "Option A"), /* @__PURE__ */ React.createElement("p", null, task.optionA.description)), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-compare-card b" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-compare-label" }, task.optionB.label || "Option B"), /* @__PURE__ */ React.createElement("p", null, task.optionB.description))), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-prompt" }, /* @__PURE__ */ React.createElement("strong", null, "Prompt:"), " ", task.prompt)), tip && /* @__PURE__ */ React.createElement("details", { className: "celpip-sp-tip" }, /* @__PURE__ */ React.createElement("summary", null, "\u{1F4A1} Strategy tip"), /* @__PURE__ */ React.createElement("p", null, tip)), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-controls" }, phase === "ready" && /* @__PURE__ */ React.createElement("button", { className: "celpip-sp-btn start", onClick: startPrep }, "\u25B6 Start Preparation (", task.prepSeconds, "s)"), phase === "prep" && /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-timer-area prep" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-phase-label" }, "\u23F1 Preparation time"), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-timer" }, timeLeft, "s"), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-timer-bar" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-timer-fill", style: { width: `${timeLeft / task.prepSeconds * 100}%`, background: "#3b82f6" } })), /* @__PURE__ */ React.createElement("p", { className: "celpip-sp-hint" }, "Prepare your response \u2014 recording starts automatically."), /* @__PURE__ */ React.createElement("button", { className: "celpip-sp-btn start", onClick: startRecording }, "Skip to Recording \u2192")), phase === "recording" && /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-timer-area recording" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-phase-label" }, "\u{1F534} ", micSupported ? "Recording \u2014 speak now!" : "Speak now (type your answer below)"), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-timer" }, timeLeft, "s"), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-timer-bar" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-timer-fill", style: { width: `${timeLeft / task.responseSeconds * 100}%`, background: "#ef4444" } })), micSupported ? /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-live-transcript" }, transcript ? transcript : "Listening\u2026 your words appear here.") : /* @__PURE__ */ React.createElement("textarea", { className: "celpip-writing-textarea", style: { marginTop: 10, minHeight: 90 }, placeholder: "Microphone unavailable \u2014 type what you would say\u2026", value: transcript, onChange: (e) => save(e.target.value) }), /* @__PURE__ */ React.createElement("button", { className: "celpip-sp-btn stop", onClick: () => {
      clearTimer();
      stopMic();
      setPhase("done");
    } }, "\u23F9 Stop & Save")), phase === "done" && /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-done" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-done-icon" }, "\u2705"), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-done-msg" }, transcript ? "Response saved!" : "Add your response"), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-transcript-box" }, /* @__PURE__ */ React.createElement("strong", null, transcript ? "Your response (transcript):" : "If the mic didn't catch your answer, type it here:"), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "celpip-writing-textarea",
        style: { marginTop: 8, minHeight: 90 },
        placeholder: "Type or edit your spoken response here\u2026",
        value: transcript,
        onChange: (e) => save(e.target.value)
      }
    ), /* @__PURE__ */ React.createElement("p", { className: "celpip-sp-hint", style: { marginTop: 6 } }, "This response is scored with the rest of your test when you finish. You can edit it or record again.")), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-rubric" }, /* @__PURE__ */ React.createElement("strong", null, "Scored on:"), ["Content & Coherence", "Vocabulary Range", "Listenability (clarity, pacing)", "Task Fulfillment"].map((r, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "celpip-sp-rubric-item" }, "\u2022 ", r))), /* @__PURE__ */ React.createElement("button", { className: "celpip-sp-btn retry", onClick: reset }, "\u21BA Try Again"))));
  }
  function CelpipSpeakingSection({ sec, answers, setAnswer }) {
    const tasks = sec.tasks || [];
    const [taskIdx, setTaskIdx] = useState(0);
    const [doneSet, setDoneSet] = useState(/* @__PURE__ */ new Set());
    const total = tasks.length;
    const current = tasks[taskIdx];
    const sectionId = sec.id || "celpip_speaking";
    function markDone(i) {
      setDoneSet((prev) => /* @__PURE__ */ new Set([...prev, i]));
    }
    if (!current) return /* @__PURE__ */ React.createElement("div", { className: "celpip-empty" }, "No speaking tasks found.");
    return /* @__PURE__ */ React.createElement("div", { className: "celpip-speaking-shell" }, /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-dot-row" }, tasks.map((t, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: i,
        className: `celpip-sp-dot ${i === taskIdx ? "active" : ""} ${doneSet.has(i) ? "done" : ""}`,
        onClick: () => setTaskIdx(i),
        title: `Task ${i + 1}: ${TASK_TYPE_LABELS[t.taskType] || t.taskType}`
      },
      i + 1
    ))), /* @__PURE__ */ React.createElement(
      SpeakingTask,
      {
        key: taskIdx,
        task: current,
        idx: taskIdx,
        total,
        answers,
        setAnswer,
        sectionId
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "celpip-sp-nav" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "celpip-nav-btn",
        disabled: taskIdx === 0,
        onClick: () => setTaskIdx((i) => i - 1)
      },
      "\u2190 Prev Task"
    ), /* @__PURE__ */ React.createElement("span", { className: "celpip-sp-nav-info" }, TASK_TYPE_ICONS[current.taskType], " Task ", taskIdx + 1, " of ", total), /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "celpip-nav-btn primary",
        disabled: taskIdx === total - 1,
        onClick: () => {
          markDone(taskIdx);
          setTaskIdx((i) => i + 1);
        }
      },
      "Next Task \u2192"
    )));
  }
  window.LP_CELPIP = { CelpipReadingSection, CelpipWritingSection, CelpipSpeakingSection };
})();
