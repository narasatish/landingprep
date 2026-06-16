"use strict";
(function() {
  const { useState, useRef, useEffect } = React;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const CUE_CARDS = [
    "Describe a skill you would like to learn. You should say: what it is, why you want to learn it, how you would learn it, and how it would help you.",
    "Describe a place you have visited that you found memorable. Say where it is, when you went, what you did, and why it was memorable.",
    "Describe a person who has influenced you. Say who they are, how you know them, what they did, and why they influenced you.",
    "Describe a book, film or show you enjoyed. Say what it was, when you experienced it, what it was about, and why you liked it.",
    "Describe a goal you want to achieve in the future. Say what it is, why you want it, how you will achieve it, and how you will feel."
  ];
  function parseJSON(text) {
    if (!text) return null;
    let s = String(text).trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    try {
      return JSON.parse(s);
    } catch (e) {
    }
    const m = s.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch (e2) {
      }
    }
    return null;
  }
  async function evaluate(prompt) {
    const base = window.LP_API_BASE || "";
    const r = await fetch(base + "/api/ai-tutor/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, jsonMode: true })
    });
    if (!r.ok) throw new Error("ai " + r.status);
    const d = await r.json();
    return parseJSON(d.answer || d.text || "");
  }
  function bandColor(b) {
    const n = Number(b) || 0;
    if (n >= 7.5) return "#16a34a";
    if (n >= 6.5) return "#0d9488";
    if (n >= 5.5) return "#d97706";
    return "#dc2626";
  }
  function BandResult({ data, rewriteLabel }) {
    const [open, setOpen] = useState(false);
    if (!data) return null;
    const overall = data.overall != null ? data.overall : "\u2014";
    return /* @__PURE__ */ React.createElement("div", { className: "bc-result" }, /* @__PURE__ */ React.createElement("div", { className: "bc-overall", style: { background: "linear-gradient(135deg, " + bandColor(overall) + ", #0ea5e9)" } }, /* @__PURE__ */ React.createElement("div", { className: "bc-overall-num" }, overall), /* @__PURE__ */ React.createElement("div", { className: "bc-overall-lbl" }, "Estimated Band")), /* @__PURE__ */ React.createElement("div", { className: "bc-criteria" }, (data.criteria || []).map((c, i) => /* @__PURE__ */ React.createElement("div", { className: "bc-crit", key: i }, /* @__PURE__ */ React.createElement("div", { className: "bc-crit-head" }, /* @__PURE__ */ React.createElement("span", { className: "bc-crit-key" }, c.key), /* @__PURE__ */ React.createElement("span", { className: "bc-crit-score", style: { color: bandColor(c.score) } }, c.score)), /* @__PURE__ */ React.createElement("div", { className: "bc-crit-bar" }, /* @__PURE__ */ React.createElement("span", { style: { width: Math.min(9, Number(c.score) || 0) / 9 * 100 + "%", background: bandColor(c.score) } })), c.comment && /* @__PURE__ */ React.createElement("div", { className: "bc-crit-comment" }, c.comment)))), data.strengths && data.strengths.length ? /* @__PURE__ */ React.createElement("div", { className: "bc-lists" }, /* @__PURE__ */ React.createElement("div", { className: "bc-list bc-good" }, /* @__PURE__ */ React.createElement("h4", null, "\u2705 Strengths"), /* @__PURE__ */ React.createElement("ul", null, data.strengths.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i }, s)))), /* @__PURE__ */ React.createElement("div", { className: "bc-list bc-improve" }, /* @__PURE__ */ React.createElement("h4", null, "\u{1F3AF} To improve"), /* @__PURE__ */ React.createElement("ul", null, (data.improvements || []).map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i }, s))))) : null, data.corrections && data.corrections.length ? /* @__PURE__ */ React.createElement("div", { className: "tool-card bc-fixes" }, /* @__PURE__ */ React.createElement("h4", null, "\u270F\uFE0F Key corrections"), data.corrections.slice(0, 8).map((c, i) => /* @__PURE__ */ React.createElement("div", { className: "bc-fix", key: i }, /* @__PURE__ */ React.createElement("span", { className: "bc-fix-old" }, c.original), /* @__PURE__ */ React.createElement("span", { className: "bc-fix-arrow" }, "\u2192"), /* @__PURE__ */ React.createElement("span", { className: "bc-fix-new" }, c.fixed)))) : null, data.band9Rewrite || data.modelAnswer ? /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => setOpen(!open) }, open ? "Hide" : "Show", " ", rewriteLabel, " \u25BE"), open && /* @__PURE__ */ React.createElement("div", { className: "bc-rewrite" }, data.band9Rewrite || data.modelAnswer)) : null, /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginTop: 12 }, onClick: () => window.LP_ShareCard && window.LP_ShareCard.make({ title: (rewriteLabel || "").indexOf("rewrite") >= 0 ? "My IELTS Writing band" : "My IELTS Speaking band", big: overall, label: "Estimated Band", sub: "Checked free with the AI band-score checker \u2014 TR/CC/LR/GRA breakdown" }) }, "\u{1F4E4} Share / save my band"), /* @__PURE__ */ React.createElement("p", { className: "tool-note", style: { marginTop: 10 } }, "\u2696\uFE0F AI estimate for guidance \u2014 calibrated to the official band descriptors but not an official score. Confirm with a teacher for high-stakes decisions."));
  }
  function WritingChecker() {
    const [task, setTask] = useState("Task 2");
    const [text, setText] = useState("");
    const [data, setData] = useState(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const minW = task === "Task 1" ? 150 : 250;
    async function check() {
      setBusy(true);
      setErr("");
      setData(null);
      try {
        const crit = task === "Task 1" ? "Task Achievement" : "Task Response";
        const prompt = `You are a certified IELTS examiner. Evaluate this IELTS Writing ${task} answer strictly against the official public band descriptors. Essay:
"""${text.slice(0, 6e3)}"""

Return ONLY a JSON object: {"overall": <band 0-9 in 0.5 steps>, "wordCount": <int>, "criteria": [{"key":"${crit}","score":<0-9>,"comment":"<one sentence>"},{"key":"Coherence & Cohesion","score":<0-9>,"comment":"<one sentence>"},{"key":"Lexical Resource","score":<0-9>,"comment":"<one sentence>"},{"key":"Grammatical Range & Accuracy","score":<0-9>,"comment":"<one sentence>"}], "strengths": ["<2-3 short points>"], "improvements": ["<3-4 specific, actionable points>"], "corrections": [{"original":"<short phrase from the essay>","fixed":"<corrected phrase>"}], "band9Rewrite": "<a full Band 9 rewrite of the essay, same task>"}`;
        const d = await evaluate(prompt);
        if (!d || d.overall == null) throw new Error("parse");
        setData(d);
        try {
          window.LP_Gamify && window.LP_Gamify.award(30, "band check");
        } catch (e) {
        }
        try {
          const h = JSON.parse(localStorage.getItem("lp_bc_writing") || "[]");
          h.unshift({ t: Date.now(), task, overall: d.overall, words });
          localStorage.setItem("lp_bc_writing", JSON.stringify(h.slice(0, 20)));
        } catch (e) {
        }
      } catch (e) {
        setErr("Couldn't score that \u2014 please try again (the AI may be warming up).");
      }
      setBusy(false);
    }
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("div", { className: "bc-tasks" }, ["Task 1", "Task 2"].map((t) => /* @__PURE__ */ React.createElement("button", { key: t, className: "bc-task" + (task === t ? " active" : ""), onClick: () => setTask(t) }, t === "Task 1" ? "Task 1 (report/letter)" : "Task 2 (essay)"))), /* @__PURE__ */ React.createElement("textarea", { className: "bc-textarea", rows: 12, placeholder: "Paste your IELTS Writing " + task + " answer here\u2026", value: text, onChange: (e) => setText(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "bc-meta" }, /* @__PURE__ */ React.createElement("span", { className: words < minW ? "bc-words low" : "bc-words ok" }, words, " words ", words < minW ? "\xB7 aim for " + minW + "+" : "\u2713"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", disabled: busy || words < 40, onClick: check }, busy ? "Scoring\u2026" : "Check my band score \u2192")), err && /* @__PURE__ */ React.createElement("div", { className: "bc-err" }, err)), busy && /* @__PURE__ */ React.createElement("div", { className: "tool-card bc-loading" }, "\u23F3 The AI examiner is reading your essay and applying the band descriptors\u2026"), /* @__PURE__ */ React.createElement(BandResult, { data, rewriteLabel: "Band 9 rewrite" }));
  }
  function SpeakingChecker() {
    const [card] = useState(() => CUE_CARDS[0]);
    const [cardI, setCardI] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [recording, setRecording] = useState(false);
    const [data, setData] = useState(null);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const recRef = useRef(null);
    const startT = useRef(0);
    const finalRef = useRef("");
    const topic = CUE_CARDS[cardI];
    const words = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
    function toggleRec() {
      if (!SR) {
        setErr("Your browser has no microphone input \u2014 type your answer below instead.");
        return;
      }
      if (recording) {
        try {
          recRef.current && recRef.current.stop();
        } catch (e) {
        }
        return;
      }
      const r = new SR();
      recRef.current = r;
      finalRef.current = "";
      r.lang = "en-US";
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        let f = "", it = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const x = e.results[i];
          if (x.isFinal) f += x[0].transcript + " ";
          else it += x[0].transcript;
        }
        if (f) finalRef.current += f;
        setTranscript((finalRef.current + " " + it).trim());
      };
      r.onerror = () => setRecording(false);
      r.onend = () => {
        setRecording(false);
        setTranscript(finalRef.current.trim());
      };
      startT.current = Date.now();
      setRecording(true);
      setData(null);
      try {
        r.start();
      } catch (e) {
        setRecording(false);
      }
    }
    async function check() {
      setBusy(true);
      setErr("");
      setData(null);
      try {
        const secs = Math.max(1, Math.round((Date.now() - startT.current) / 1e3)) || 60;
        const wpm = Math.round(words / (secs / 60)) || 0;
        const prompt = `You are an IELTS Speaking examiner. Evaluate this transcript of a Part 2 long-turn answer. Cue card topic: "${topic}". The candidate spoke about ${wpm} words per minute. Transcript:
"""${transcript.slice(0, 4e3)}"""

Return ONLY a JSON object: {"overall": <band 0-9 in 0.5 steps>, "criteria": [{"key":"Fluency & Coherence","score":<0-9>,"comment":"<one sentence, mention pace ${wpm} wpm>"},{"key":"Lexical Resource","score":<0-9>,"comment":"<one sentence>"},{"key":"Grammatical Range & Accuracy","score":<0-9>,"comment":"<one sentence>"},{"key":"Pronunciation","score":<0-9>,"comment":"estimate from transcript only"}], "strengths": ["<2-3 points>"], "improvements": ["<3-4 specific points>"], "modelAnswer": "<a Band 9 spoken-style model answer for this cue card, ~180 words>"}`;
        const d = await evaluate(prompt);
        if (!d || d.overall == null) throw new Error("parse");
        setData(d);
        try {
          window.LP_Gamify && window.LP_Gamify.award(30, "band check");
        } catch (e) {
        }
      } catch (e) {
        setErr("Couldn't score that \u2014 please try again.");
      }
      setBusy(false);
    }
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("div", { className: "bc-cue" }, /* @__PURE__ */ React.createElement("strong", null, "\u{1F5E3}\uFE0F Part 2 cue card"), /* @__PURE__ */ React.createElement("p", null, topic), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
      setCardI((cardI + 1) % CUE_CARDS.length);
      setTranscript("");
      setData(null);
    } }, "\u21BB New topic")), /* @__PURE__ */ React.createElement("div", { className: "bc-rec-row" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary bc-rec" + (recording ? " on" : ""), onClick: toggleRec }, recording ? "\u23F9 Stop recording" : "\u{1F399}\uFE0F Record my answer (1\u20132 min)"), words > 0 && /* @__PURE__ */ React.createElement("span", { className: "bc-words ok" }, words, " words captured")), /* @__PURE__ */ React.createElement("textarea", { className: "bc-textarea", rows: 6, placeholder: "Your transcript appears here as you speak \u2014 or type your answer.", value: transcript, onChange: (e) => setTranscript(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "bc-meta" }, /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", disabled: busy || words < 25, onClick: check }, busy ? "Scoring\u2026" : "Check my band score \u2192")), err && /* @__PURE__ */ React.createElement("div", { className: "bc-err" }, err)), busy && /* @__PURE__ */ React.createElement("div", { className: "tool-card bc-loading" }, "\u23F3 The AI examiner is assessing your fluency, vocabulary and grammar\u2026"), /* @__PURE__ */ React.createElement(BandResult, { data, rewriteLabel: "Band 9 model answer" }));
  }
  function BandChecker({ onNav, initialMode }) {
    const [mode, setMode] = useState(initialMode === "speaking" ? "speaking" : "writing");
    useEffect(() => {
      try {
        document.title = mode === "writing" ? "Free IELTS Writing Checker \u2014 Instant Band Score (Task 1 & 2) | LandingPrep" : "Free IELTS Speaking Checker \u2014 Instant Band Score & Feedback | LandingPrep";
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Free AI IELTS band-score checker: paste your essay or record your speaking answer and get an instant estimated band with a TR/CC/LR/GRA breakdown, corrections and a Band 9 model. No signup.");
      } catch (e) {
      }
    }, [mode]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "tools", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell tools-shell-wide" }, /* @__PURE__ */ React.createElement("header", { className: "tools-hero" }, /* @__PURE__ */ React.createElement("h1", null, "\u{1F3AF} Band-Score Checker"), /* @__PURE__ */ React.createElement("p", null, "Paste your essay or record your speaking answer \u2014 get an instant estimated IELTS band with a full criterion breakdown, fixes and a Band 9 model. 100% free, no signup.")), /* @__PURE__ */ React.createElement("div", { className: "tools-tabs" }, /* @__PURE__ */ React.createElement("button", { className: "tools-tab" + (mode === "writing" ? " active" : ""), onClick: () => setMode("writing") }, "\u270D\uFE0F Writing"), /* @__PURE__ */ React.createElement("button", { className: "tools-tab" + (mode === "speaking" ? " active" : ""), onClick: () => setMode("speaking") }, "\u{1F399}\uFE0F Speaking")), mode === "writing" ? /* @__PURE__ */ React.createElement(WritingChecker, null) : /* @__PURE__ */ React.createElement(SpeakingChecker, null)), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_BandChecker = BandChecker;
})();
