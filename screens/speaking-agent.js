"use strict";
(function() {
  const { useState, useEffect, useRef, useCallback } = React;
  const PROMPTS = {
    ielts: {
      topics: [
        { id: "hometown", label: "Hometown & Environment" },
        { id: "technology", label: "Technology & Society" },
        { id: "education", label: "Education Systems" },
        { id: "health", label: "Health & Lifestyle" },
        { id: "work", label: "Work & Career" },
        { id: "environment", label: "Climate & Environment" }
      ],
      openers: {
        hometown: "Let's talk about your hometown. Can you describe it for me?",
        technology: "How has technology changed your daily life?",
        education: "Tell me about the education system in your country.",
        health: "How do you try to stay healthy in your daily routine?",
        work: "What kind of work do you do, or what career are you planning to pursue?",
        environment: "How concerned are you about climate change in your local area?"
      },
      followUps: {
        hometown: [
          "What do you like most about living there?",
          "How has your hometown changed over the past decade?",
          "Would you prefer to live in a city or a smaller town in the future? Why?",
          "What tourist attractions does your hometown have?"
        ],
        technology: [
          "Do you think young people rely too much on technology?",
          "How do you think artificial intelligence will affect employment?",
          "What are the disadvantages of smartphones in modern society?",
          "Do you prefer online shopping or visiting physical stores?"
        ],
        education: [
          "Should university education be free for all students?",
          "How important are extra-curricular activities compared to academic study?",
          "Do you think online learning can replace traditional classrooms?",
          "What skills do you think schools should focus on teaching?"
        ],
        health: [
          "Do you think governments should regulate unhealthy food?",
          "How important is mental health awareness in your country?",
          "What role does exercise play in your weekly routine?",
          "Is traditional medicine or modern medicine more trusted in your culture?"
        ],
        work: [
          "Do you think a high salary is the most important aspect of a job?",
          "How do you feel about working from home permanently?",
          "What challenges do young graduates face when entering the job market?",
          "Do you think job satisfaction is more important than income?"
        ],
        environment: [
          "What can individuals do to reduce their carbon footprint?",
          "Should governments impose heavier taxes on polluting industries?",
          "How do you think renewable energy will change our future?",
          "Are you optimistic or pessimistic about the environment's future?"
        ]
      }
    },
    toefl: {
      topics: [
        { id: "campus", label: "Campus Life" },
        { id: "research", label: "Academic Research" },
        { id: "society", label: "Society & Culture" },
        { id: "science", label: "Science & Innovation" }
      ],
      openers: {
        campus: "Imagine you are describing your ideal university campus to someone. What would it look like?",
        research: "What field of study interests you most, and why?",
        society: "How does culture influence the way people communicate?",
        science: "What scientific discovery do you think has had the biggest impact on humanity?"
      },
      followUps: {
        campus: [
          "What facilities are most important on a university campus?",
          "How do extracurricular activities contribute to academic success?",
          "Should universities be located in city centres or rural areas?",
          "What challenges do international students face on campus?"
        ],
        research: [
          "How should funding be allocated between pure and applied research?",
          "Do you think academic journals should be freely accessible?",
          "What ethical issues arise in modern scientific research?",
          "How can universities improve collaboration between disciplines?"
        ],
        society: [
          "How has globalisation affected local cultural traditions?",
          "Do social media platforms help or harm cultural exchange?",
          "What role does language play in preserving culture?",
          "How do you define national identity in a multicultural society?"
        ],
        science: [
          "Should space exploration receive more government funding?",
          "What are the risks and benefits of gene-editing technology?",
          "How can science education be improved in secondary schools?",
          "Do you think humans will colonise another planet within 100 years?"
        ]
      }
    },
    gre: {
      topics: [
        { id: "argument", label: "Argument Analysis" },
        { id: "issue", label: "Issue Essay Practice" }
      ],
      openers: {
        argument: "I will present a claim and you respond with whether you agree, partially agree, or disagree\u2014then support your position. Ready? Here is the claim: Governments should prioritise economic growth over environmental protection.",
        issue: "Let's practice GRE Analytical Writing. Respond to this issue: To understand the most important characteristics of a society, one must study its major cities."
      },
      followUps: {
        argument: [
          "Can you provide a specific counter-example to your position?",
          "How would you qualify your argument to make it more nuanced?",
          "What assumptions underlie the original claim?",
          "How might someone on the opposing side respond to your point?"
        ],
        issue: [
          "Can you think of evidence that might challenge your view?",
          "What concession would you make to the opposing perspective?",
          "How does your argument hold up when applied to developing nations?",
          "Could you restate your thesis more precisely?"
        ]
      }
    },
    gmat: {
      topics: [
        { id: "business", label: "Business Scenarios" },
        { id: "leadership", label: "Leadership & Ethics" }
      ],
      openers: {
        business: "A company is deciding whether to expand into a new market. Walk me through how you would analyse this decision.",
        leadership: "Describe a situation where a leader had to make an unpopular but necessary decision. What factors should guide that decision?"
      },
      followUps: {
        business: [
          "What data would you need before making that recommendation?",
          "How would you evaluate the risk versus reward?",
          "What competitive factors might affect the outcome?",
          "How would you present this to a board of directors?"
        ],
        leadership: [
          "How do you balance stakeholder interests when they conflict?",
          "What distinguishes good leadership from management?",
          "Can ethical behaviour and profitability always coexist?",
          "How should companies handle whistleblowers?"
        ]
      }
    },
    pte: {
      topics: [
        { id: "describe", label: "Describe Image Practice" },
        { id: "retell", label: "Re-tell Lecture Practice" }
      ],
      openers: {
        describe: "I will describe a chart type and you respond as if you're completing a PTE Describe Image task. The image shows a bar chart comparing average monthly temperatures in Sydney and London across all four seasons. Please describe it.",
        retell: "I will give you a short lecture summary. Listen, then re-tell it. Here it is: Researchers at MIT have found that urban green spaces reduce local temperatures by up to four degrees Celsius, potentially offsetting urban heat island effects without large infrastructure costs."
      },
      followUps: {
        describe: [
          "Can you add a comparison sentence to your description?",
          "What was the most significant trend you identified?",
          "How would you conclude a Describe Image response professionally?",
          "Try describing it again\u2014aim for under 40 seconds this time."
        ],
        retell: [
          "What was the key finding mentioned in the lecture?",
          "Can you add one piece of supporting detail you may have missed?",
          "How confident are you about the accuracy of your re-tell?",
          "Try the re-tell once more with more specific vocabulary."
        ]
      }
    },
    celpip: {
      topics: [
        { id: "daily", label: "Daily Life Situations" },
        { id: "opinion", label: "Opinion Questions" }
      ],
      openers: {
        daily: "You need to leave a voicemail for your landlord about a broken heater in winter. What would you say?",
        opinion: "Some people believe that cars should be banned in city centres. What is your opinion?"
      },
      followUps: {
        daily: [
          "How would you change your language if speaking to a friend versus a professional?",
          "What details are most important to include in that message?",
          "How would you handle a situation where the problem was not resolved quickly?",
          "Can you make your response more concise while keeping all key information?"
        ],
        opinion: [
          "What are the strongest counterarguments to your view?",
          "How would this policy affect different groups in society?",
          "Can you give a real-world example to support your point?",
          "How would you persuade someone who disagrees with you?"
        ]
      }
    },
    duolingo: {
      topics: [
        { id: "express", label: "Express Your Opinion" },
        { id: "describe", label: "Describe a Photo" }
      ],
      openers: {
        express: "Do you think it is better to live in a large city or a small town? Speak for about 90 seconds.",
        describe: "I'll describe a scene and you respond as if completing a Duolingo Speaking task. The scene shows a busy farmers' market on a sunny morning with colourful stalls and many shoppers. Please describe what you see."
      },
      followUps: {
        express: [
          "Can you add a personal example to your response?",
          "What would you say to someone who holds the opposite view?",
          "Try expanding your response to include a future prediction.",
          "How would you rate the fluency of your answer and why?"
        ],
        describe: [
          "What emotions or atmosphere does the scene convey?",
          "Can you use more descriptive adjectives in a second attempt?",
          "What might happen next in that scene?",
          "How did your vocabulary compare to what a native speaker might use?"
        ]
      }
    }
  };
  function generateAIReply(userText, state) {
    const { turnCount, followUpList, followUpIndex } = state;
    const lower = userText.toLowerCase();
    const wordCount = userText.trim().split(/\s+/).filter(Boolean).length;
    if (/\b(feedback|how did i do|evaluate|my score|am i doing)\b/.test(lower)) {
      return null;
    }
    const acks = [
      "That's a good point.",
      "Interesting perspective.",
      "Thank you for sharing that.",
      "I see what you mean.",
      "That's a thoughtful response.",
      "Good \u2014 let me push you a bit further.",
      "Nicely put.",
      "That makes sense."
    ];
    const ack = acks[turnCount % acks.length];
    const nextFU = followUpList && followUpList.length ? followUpList[followUpIndex % followUpList.length] : "What else can you tell me about this? Try to add a reason or an example.";
    if (wordCount < 8) {
      const ELAB = [
        "Could you say a little more about that? Try to give a reason or an example.",
        "Interesting \u2014 can you expand on that with a specific example?",
        "Tell me more. Why do you think that is?",
        "Go on \u2014 what makes you say that?",
        "Can you develop that idea in two or three full sentences?",
        "And how does that affect you personally? Give me an example."
      ];
      if (turnCount % 2 === 1) return `That's a start. ${nextFU}`;
      return ELAB[Math.floor(turnCount / 2) % ELAB.length];
    }
    return `${ack} ${nextFU}`;
  }
  const FILLERS = ["um", "uh", "er", "erm", "like", "you know", "i mean", "basically", "actually", "sort of", "kind of", "literally"];
  function buildFeedback(turns) {
    if (!turns.length) return null;
    const userTurns = turns.filter((t) => t.role === "user");
    const allUserText = userTurns.map((t) => t.text).join(" ");
    const words = allUserText.trim().split(/\s+/).filter(Boolean);
    const totalWords = words.length;
    const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, ""))).size;
    const lexRatio = totalWords > 0 ? (uniqueWords / totalWords).toFixed(2) : 0;
    const turns_u = userTurns.length;
    const avgLen = turns_u > 0 ? Math.round(totalWords / turns_u) : 0;
    const totalMs = userTurns.reduce((s, t) => s + (t.dur || 0), 0);
    const spokenWords = userTurns.filter((t) => t.dur).reduce((s, t) => s + t.text.trim().split(/\s+/).filter(Boolean).length, 0);
    const wpm = totalMs > 2e3 ? Math.round(spokenWords / (totalMs / 6e4)) : null;
    const lower = " " + allUserText.toLowerCase() + " ";
    let fillerCount = 0;
    FILLERS.forEach((f) => {
      const m = lower.match(new RegExp("\\b" + f.replace(/ /g, "\\s+") + "\\b", "g"));
      if (m) fillerCount += m.length;
    });
    const fillerRate = totalWords > 0 ? Math.round(fillerCount / totalWords * 1e3) / 10 : 0;
    let fluencyScore = Math.min(9, Math.max(3, Math.round(avgLen / 12)));
    if (wpm != null) {
      if (wpm < 90 || wpm > 190) fluencyScore = Math.max(3, fluencyScore - 1);
      else if (wpm >= 110 && wpm <= 170) fluencyScore = Math.min(9, fluencyScore + 1);
    }
    if (fillerRate > 6) fluencyScore = Math.max(3, fluencyScore - 1);
    let vocabScore = Math.min(9, Math.max(3, Math.round(lexRatio * 14)));
    let coherenceScore = Math.min(9, Math.max(3, Math.round(turns_u * 1.2)));
    const overall = ((fluencyScore + vocabScore + coherenceScore) / 3).toFixed(1);
    const tips = [];
    if (wpm != null && wpm < 100) tips.push(`Your pace was about ${wpm} words/min \u2014 a little slow. Aim for a steady 120\u2013150 wpm.`);
    if (wpm != null && wpm > 180) tips.push(`Your pace was about ${wpm} words/min \u2014 quite fast. Slow down slightly for clarity.`);
    if (fillerRate > 4) tips.push(`You used ${fillerCount} filler word${fillerCount !== 1 ? "s" : ""} (${fillerRate} per 100 words). Replace "um/like/you know" with a short pause.`);
    if (avgLen < 20) tips.push("Try to give longer responses \u2014 aim for 3\u20135 sentences per turn.");
    if (lexRatio < 0.55) tips.push("You repeated several words \u2014 expand your vocabulary range.");
    if (turns_u < 3) tips.push("Practice staying in the conversation longer; aim for at least 4 exchanges.");
    if (tips.length === 0) tips.push("Excellent session! Focus on pronunciation precision and natural pausing next time.");
    return { fluencyScore, vocabScore, coherenceScore, overall, totalWords, turns_u, wpm, fillerCount, fillerRate, tips };
  }
  async function aiExaminerReply(userText, state, turns) {
    const ai = window.LP_AI_TUTOR;
    if (!ai || typeof ai.generate !== "function") return null;
    const examName = window.LP_AI_TUTOR && state.examName || (state.exam || "English").toUpperCase();
    const history = (turns || []).slice(-8).map((t) => `${t.role === "user" ? "Candidate" : "Examiner"}: ${t.text}`).join("\n");
    const prompt = `You are a friendly, professional ${examName} speaking examiner running a live practice speaking test. The current topic is "${state.topic}".

Conversation so far:
${history}

The candidate just said: "${userText}"

Reply as the examiner in 1\u20133 short sentences: if they made a clear grammar or word-choice mistake, gently note the correction in one brief clause (e.g. "Small tip \u2014 we'd say '\u2026' "). Then warmly acknowledge what they said and ask exactly ONE natural follow-up question that keeps them talking and probes for detail, reasons or examples. Do NOT give scores yet. Stay conversational and encouraging. Return only your spoken reply, no labels.`;
    try {
      const out = await ai.generate(prompt);
      if (!out) return null;
      const trimmed = out.trim();
      if (trimmed.startsWith("\u26A0\uFE0F") || /AI Tutor is offline/i.test(trimmed)) return null;
      return trimmed;
    } catch (_) {
      return null;
    }
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  function useSpeechRecognition(onResult) {
    const recRef = useRef(null);
    const silenceRef = useRef(null);
    const finalRef = useRef("");
    const interimRef = useRef("");
    const activeRef = useRef(false);
    const speechStartRef = useRef(0);
    const [listening, setListening] = useState(false);
    const [supported] = useState(!!SpeechRecognition);
    const submit = useCallback(() => {
      const text = (finalRef.current + " " + interimRef.current).replace(/\s+/g, " ").trim();
      finalRef.current = "";
      interimRef.current = "";
      clearTimeout(silenceRef.current);
      try {
        recRef.current && recRef.current.stop();
      } catch (_) {
      }
      const dur = speechStartRef.current ? Math.max(0, Date.now() - 1e3 - speechStartRef.current) : 0;
      speechStartRef.current = 0;
      if (text) onResult(text, dur);
    }, [onResult]);
    const start = useCallback(() => {
      if (!SpeechRecognition || activeRef.current) return;
      const r = new SpeechRecognition();
      r.continuous = true;
      r.interimResults = true;
      r.lang = "en-US";
      finalRef.current = "";
      r.onresult = (e) => {
        let interim = "", final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) final += res[0].transcript + " ";
          else interim += res[0].transcript;
        }
        if (final) finalRef.current += final;
        interimRef.current = interim;
        if (final || interim.trim()) {
          if (!speechStartRef.current) speechStartRef.current = Date.now();
          clearTimeout(silenceRef.current);
          silenceRef.current = setTimeout(submit, 1e3);
        }
      };
      r.onend = () => {
        setListening(false);
        activeRef.current = false;
      };
      r.onerror = () => {
        setListening(false);
        activeRef.current = false;
        clearTimeout(silenceRef.current);
      };
      recRef.current = r;
      activeRef.current = true;
      try {
        r.start();
        setListening(true);
      } catch (_) {
        activeRef.current = false;
      }
    }, [submit]);
    const stop = useCallback(() => {
      activeRef.current = false;
      clearTimeout(silenceRef.current);
      finalRef.current = "";
      try {
        recRef.current && recRef.current.stop();
      } catch (_) {
      }
      setListening(false);
    }, []);
    return { supported, listening, start, stop };
  }
  function useSpeechSynthesis() {
    const [speaking, setSpeaking] = useState(false);
    const ttsAbortRef = useRef(null);
    const speakNative = useCallback((text, onDone) => {
      if (!window.speechSynthesis) {
        onDone && onDone();
        return;
      }
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-US";
      utt.rate = 0.92;
      utt.pitch = 1.05;
      utt.onstart = () => setSpeaking(true);
      utt.onend = () => {
        setSpeaking(false);
        onDone && onDone();
      };
      utt.onerror = () => {
        setSpeaking(false);
        onDone && onDone();
      };
      window.speechSynthesis.speak(utt);
    }, []);
    const speak = useCallback((text, onDone) => {
      var _a;
      if (!text) {
        onDone && onDone();
        return;
      }
      const tts = window.LP_TTS;
      if (tts && tts.speakOne) {
        try {
          (_a = ttsAbortRef.current) == null ? void 0 : _a.abort();
        } catch (_) {
        }
        const ctrl = new AbortController();
        ttsAbortRef.current = ctrl;
        setSpeaking(true);
        tts.speakOne(text.slice(0, 600), "Kore", ctrl.signal).then(() => {
          setSpeaking(false);
          onDone && onDone();
        }).catch(() => {
          setSpeaking(false);
          speakNative(text, onDone);
        });
        return;
      }
      speakNative(text, onDone);
    }, [speakNative]);
    const cancel = useCallback(() => {
      var _a;
      try {
        (_a = ttsAbortRef.current) == null ? void 0 : _a.abort();
      } catch (_) {
      }
      window.speechSynthesis && window.speechSynthesis.cancel();
      setSpeaking(false);
    }, []);
    return { speaking, speak, cancel };
  }
  function ChatBubble({ msg }) {
    const isUser = msg.role === "user";
    return React.createElement(
      "div",
      {
        className: `chat-bubble ${isUser ? "chat-user" : "chat-agent"}`,
        style: { alignSelf: isUser ? "flex-end" : "flex-start" }
      },
      React.createElement("div", { className: "bubble-label" }, isUser ? "You" : "Agent"),
      React.createElement("div", { className: "bubble-text" }, msg.text)
    );
  }
  function FeedbackPanel({ fb, onRestart }) {
    if (!fb) return null;
    return React.createElement(
      "div",
      { className: "feedback-panel" },
      React.createElement("h3", null, "Session Feedback"),
      React.createElement(
        "div",
        { className: "score-grid" },
        React.createElement(
          "div",
          { className: "score-cell" },
          React.createElement("div", { className: "score-val" }, fb.fluencyScore),
          React.createElement("div", { className: "score-lbl" }, "Fluency")
        ),
        React.createElement(
          "div",
          { className: "score-cell" },
          React.createElement("div", { className: "score-val" }, fb.vocabScore),
          React.createElement("div", { className: "score-lbl" }, "Vocabulary")
        ),
        React.createElement(
          "div",
          { className: "score-cell" },
          React.createElement("div", { className: "score-val" }, fb.coherenceScore),
          React.createElement("div", { className: "score-lbl" }, "Coherence")
        ),
        React.createElement(
          "div",
          { className: "score-cell highlight" },
          React.createElement("div", { className: "score-val" }, fb.overall),
          React.createElement("div", { className: "score-lbl" }, "Overall")
        )
      ),
      React.createElement(
        "p",
        { style: { color: "#6b7280", fontSize: "0.88rem", margin: "0.5rem 0 0.75rem" } },
        `${fb.turns_u} exchange${fb.turns_u !== 1 ? "s" : ""} \xB7 ${fb.totalWords} words spoken`
      ),
      React.createElement(
        "div",
        { className: "fluency-metrics" },
        React.createElement(
          "div",
          { className: "fm-item" },
          React.createElement("div", { className: "fm-val" }, fb.wpm != null ? fb.wpm : "\u2014"),
          React.createElement("div", { className: "fm-lbl" }, "Words / min"),
          React.createElement("div", { className: "fm-hint" }, fb.wpm == null ? "needs mic" : fb.wpm < 100 ? "a bit slow" : fb.wpm > 180 ? "a bit fast" : "natural pace")
        ),
        React.createElement(
          "div",
          { className: "fm-item" },
          React.createElement("div", { className: "fm-val" }, fb.fillerCount),
          React.createElement("div", { className: "fm-lbl" }, "Filler words"),
          React.createElement("div", { className: "fm-hint" }, fb.fillerRate > 4 ? `${fb.fillerRate}/100 words \u2014 high` : "well controlled")
        )
      ),
      React.createElement("h4", { style: { marginBottom: "0.5rem", marginTop: "1rem" } }, "Improvement Tips"),
      React.createElement(
        "ul",
        { className: "tip-list" },
        fb.tips.map((t, i) => React.createElement("li", { key: i }, t))
      ),
      React.createElement(
        "button",
        { className: "btn-primary mt-1", onClick: onRestart },
        "Start New Session"
      )
    );
  }
  function SpeakingAgent({ exam }) {
    const EXAM_ID = exam && exam.id || "ielts";
    const promptData = PROMPTS[EXAM_ID] || PROMPTS.ielts;
    const examColor = exam && exam.colour || "#4f46e5";
    const [phase, setPhase] = useState("setup");
    const [selectedTopic, setSelectedTopic] = useState(promptData.topics[0].id);
    const [turns, setTurns] = useState([]);
    const [inputText, setInputText] = useState("");
    const [agentState, setAgentState] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [agentTyping, setAgentTyping] = useState(false);
    const [autoMic, setAutoMic] = useState(true);
    const chatEndRef = useRef(null);
    const startMicRef = useRef(null);
    const micSupportedRef = useRef(false);
    const autoMicRef = useRef(true);
    autoMicRef.current = autoMic;
    const listenSoon = () => {
      if (autoMicRef.current && micSupportedRef.current && startMicRef.current) {
        setTimeout(() => startMicRef.current && startMicRef.current(), 250);
      }
    };
    const { speaking, speak, cancel } = useSpeechSynthesis();
    const pushMessage = useCallback((role, text, extra) => {
      setTurns((prev) => [...prev, { role, text, id: Date.now() + Math.random(), ...extra || {} }]);
    }, []);
    useEffect(() => {
      chatEndRef.current && chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }, [turns, agentTyping]);
    useEffect(() => {
      const base = window.LP_API_BASE || "";
      try {
        fetch(base + "/api/health").catch(() => {
        });
      } catch (e) {
      }
      try {
        window.LP_TTS && window.LP_TTS.prewarm && window.LP_TTS.prewarm("en");
      } catch (e) {
      }
    }, []);
    useEffect(() => {
      setPhase("setup");
      setTurns([]);
      setFeedback(null);
      setAgentState(null);
    }, [EXAM_ID]);
    const agentReply = useCallback((text, state) => {
      const ruleReply = generateAIReply(text, state);
      if (ruleReply === null) {
        const fb = buildFeedback([...turns, { role: "user", text }]);
        setFeedback(fb);
        setPhase("feedback");
        cancel();
        return;
      }
      setAgentTyping(true);
      const advance = (reply) => {
        setAgentTyping(false);
        pushMessage("agent", reply);
        speak(reply, listenSoon);
        setAgentState((prev) => ({
          ...prev,
          turnCount: (prev ? prev.turnCount : 0) + 1,
          followUpIndex: (prev ? prev.followUpIndex : 0) + 1
        }));
      };
      aiExaminerReply(text, state, [...turns, { role: "user", text }]).then((aiReply) => advance(aiReply || ruleReply)).catch(() => advance(ruleReply));
    }, [turns, pushMessage, speak, cancel]);
    const handleMicResult = useCallback((transcript, dur) => {
      pushMessage("user", transcript, dur ? { dur } : null);
      agentReply(transcript, agentState);
    }, [pushMessage, agentReply, agentState]);
    const { supported: micSupported, listening, start: startMic, stop: stopMic } = useSpeechRecognition(handleMicResult);
    startMicRef.current = startMic;
    micSupportedRef.current = micSupported;
    const startSession = () => {
      const topic = selectedTopic;
      const opener = promptData.openers[topic];
      const followUpList = promptData.followUps[topic] || [];
      const initState = {
        exam: EXAM_ID,
        topic,
        turnCount: 0,
        followUpList,
        followUpIndex: 0
      };
      setAgentState(initState);
      setTurns([]);
      setPhase("active");
      setAgentTyping(true);
      setTimeout(() => {
        setAgentTyping(false);
        pushMessage("agent", opener);
        speak(opener, listenSoon);
      }, 500);
    };
    const sendText = () => {
      const t = inputText.trim();
      if (!t) return;
      setInputText("");
      pushMessage("user", t);
      agentReply(t, agentState);
    };
    const endSession = () => {
      cancel();
      stopMic();
      const fb = buildFeedback(turns);
      setFeedback(fb);
      setPhase("feedback");
    };
    const restart = () => {
      cancel();
      setPhase("setup");
      setTurns([]);
      setFeedback(null);
      setAgentState(null);
    };
    if (phase === "setup") {
      return React.createElement(
        "div",
        { className: "agent-shell" },
        React.createElement(
          "div",
          { className: "agent-header", style: { borderColor: examColor } },
          React.createElement("div", { className: "agent-icon", style: { background: examColor } }, "\u{1F3A4}"),
          React.createElement(
            "div",
            null,
            React.createElement("h2", { style: { margin: 0 } }, "AI Speaking Agent"),
            React.createElement(
              "p",
              { style: { margin: 0, color: "#6b7280", fontSize: "0.9rem" } },
              `${exam && exam.name || "IELTS"} speaking practice \u2014 two\u2011way voice conversation`
            )
          )
        ),
        React.createElement(
          "div",
          { className: "setup-card" },
          React.createElement("h3", null, "Choose a Topic"),
          React.createElement(
            "div",
            { className: "topic-grid" },
            promptData.topics.map(
              (t) => React.createElement("button", {
                key: t.id,
                className: `topic-btn ${selectedTopic === t.id ? "active" : ""}`,
                style: selectedTopic === t.id ? { borderColor: examColor, background: examColor + "15" } : {},
                onClick: () => setSelectedTopic(t.id)
              }, t.label)
            )
          ),
          React.createElement(
            "div",
            { className: "setup-opener-preview" },
            React.createElement("strong", null, "Opening question:"),
            React.createElement("p", null, promptData.openers[selectedTopic])
          ),
          React.createElement(
            "div",
            { className: "setup-tips" },
            React.createElement("h4", null, "How it works"),
            React.createElement(
              "ul",
              null,
              React.createElement("li", null, "Click ", React.createElement("strong", null, "Start Session"), " \u2014 the agent asks the opening question aloud, then listens automatically."),
              React.createElement("li", null, "Just ", React.createElement("strong", null, "speak naturally"), " \u2014 when you pause, the agent replies and re-opens the mic. It's a hands-free two-way conversation. Tap the mic to pause, or type instead."),
              React.createElement("li", null, "Say or type ", React.createElement("em", null, '"give me feedback"'), " at any point, or click ", React.createElement("strong", null, "End & Get Feedback"), "."),
              !micSupported && React.createElement("li", { style: { color: "#f59e0b" } }, "Microphone not available in this browser \u2014 use the text input instead.")
            )
          ),
          React.createElement("button", {
            className: "btn-primary",
            style: { background: examColor, fontSize: "1.05rem", padding: "0.75rem 2rem" },
            onClick: startSession
          }, "Start Session")
        )
      );
    }
    if (phase === "feedback") {
      return React.createElement(
        "div",
        { className: "agent-shell" },
        React.createElement(
          "div",
          { className: "agent-header", style: { borderColor: examColor } },
          React.createElement("div", { className: "agent-icon", style: { background: examColor } }, "\u{1F3A4}"),
          React.createElement("h2", { style: { margin: 0 } }, "Session Complete")
        ),
        React.createElement(FeedbackPanel, { fb: feedback, onRestart: restart })
      );
    }
    return React.createElement(
      "div",
      { className: "agent-shell" },
      React.createElement(
        "div",
        { className: "agent-header", style: { borderColor: examColor } },
        React.createElement("div", { className: "agent-icon", style: { background: examColor } }, "\u{1F3A4}"),
        React.createElement(
          "div",
          { style: { flex: 1 } },
          React.createElement("h2", { style: { margin: 0 } }, "Speaking Practice"),
          React.createElement(
            "p",
            { style: { margin: 0, color: "#6b7280", fontSize: "0.85rem" } },
            speaking ? "\u{1F50A} Agent speaking\u2026" : listening ? "\u{1F399} Listening \u2014 just speak\u2026" : autoMic ? "Your turn \u2014 speak when ready" : "Microphone paused"
          )
        ),
        React.createElement("button", {
          className: "btn-outline",
          style: { fontSize: "0.8rem", padding: "0.4rem 0.9rem" },
          onClick: endSession
        }, "End & Get Feedback")
      ),
      // Chat area
      React.createElement(
        "div",
        { className: "chat-area" },
        turns.map((m) => React.createElement(ChatBubble, { key: m.id, msg: m })),
        agentTyping && React.createElement(
          "div",
          { className: "chat-bubble chat-agent typing-indicator" },
          React.createElement("span", null),
          React.createElement("span", null),
          React.createElement("span", null)
        ),
        React.createElement("div", { ref: chatEndRef })
      ),
      // Input bar
      React.createElement(
        "div",
        { className: "input-bar" },
        micSupported && React.createElement(
          "button",
          {
            className: `mic-btn ${listening ? "recording" : ""}`,
            style: listening ? { background: "#ef4444" } : { background: autoMic ? examColor : "#9ca3af" },
            // Tap to pause/resume hands-free listening (no need to hold).
            onClick: () => {
              if (listening) {
                stopMic();
                setAutoMic(false);
              } else {
                setAutoMic(true);
                startMic();
              }
            },
            title: listening ? "Tap to pause microphone" : autoMic ? "Microphone on \u2014 tap to pause" : "Tap to start speaking"
          },
          listening ? React.createElement("span", { className: "mic-pulse" }, "\u25CF") : autoMic ? "\u{1F399}" : "\u{1F507}"
        ),
        React.createElement("input", {
          className: "chat-input",
          type: "text",
          placeholder: "Or type your response and press Enter\u2026",
          value: inputText,
          // Typing pauses hands-free listening so the two don't collide.
          onFocus: () => {
            if (listening) {
              stopMic();
              setAutoMic(false);
            }
          },
          onChange: (e) => setInputText(e.target.value),
          onKeyDown: (e) => e.key === "Enter" && sendText(),
          disabled: agentTyping
        }),
        React.createElement("button", {
          className: "btn-primary",
          style: { background: examColor, padding: "0.55rem 1.2rem" },
          onClick: sendText,
          disabled: !inputText.trim() || agentTyping
        }, "Send")
      ),
      speaking && React.createElement(
        "div",
        { className: "agent-speaking-bar" },
        React.createElement("span", { className: "wave" }, "\u2582\u2584\u2586\u2584\u2582"),
        " Agent is speaking \u2014 it will listen automatically when it finishes"
      )
    );
  }
  window.LP_SpeakingAgent = SpeakingAgent;
})();
