const {
  useState: useStateT,
  useEffect: useEffectT,
  useRef: useRefT,
  useCallback: useCbT
} = React;
function fmtTime(secs) {
  if (secs == null || secs < 0) return "0:00";
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function getBestVoices() {
  if (!window.speechSynthesis) return { male: null, female: null, neutral: null, all: [] };
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return { male: null, female: null, neutral: null, all: [] };
  const score = (v) => {
    var _a;
    let s = 0;
    const n = (v.name || "").toLowerCase();
    if (n.includes("natural") || n.includes("neural")) s += 25;
    if (n.includes("online")) s += 8;
    if (n.includes("premium") || n.includes("enhanced") || n.includes("studio")) s += 12;
    if (/en[-_]gb/i.test(v.lang)) s += 12;
    else if (/en[-_](us|au|nz|ca|in)/i.test(v.lang)) s += 9;
    else if ((_a = v.lang) == null ? void 0 : _a.startsWith("en")) s += 5;
    if (n.includes("google")) s += 6;
    if (n.includes("microsoft")) s += 5;
    if (n.includes("apple")) s += 5;
    if (/samantha|daniel|karen|aaron|moira|tessa|fiona|libby|sonia|ryan|aria|guy|jenny|amber/i.test(n)) s += 6;
    if (v.default) s += 2;
    if (v.localService) s += 1;
    return s;
  };
  const en = voices.filter((v) => {
    var _a;
    return (_a = v.lang) == null ? void 0 : _a.startsWith("en");
  }).sort((a, b) => score(b) - score(a));
  if (!en.length) return { male: voices[0], female: voices[0], neutral: voices[0], all: voices };
  const female = en.find((v) => /sonia|libby|samantha|karen|moira|tessa|fiona|aria|jenny|amber|hazel|susan|allison|ava|serena|veena|female/i.test(v.name)) || en[0];
  const male = en.find((v) => v !== female && /ryan|daniel|aaron|alex|guy|david|mark|fred|tom|oliver|rishi|male/i.test(v.name)) || en[1] || en[0];
  const neutral = en[0];
  return { male, female, neutral, all: en };
}
function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve([]);
      return;
    }
    let v = window.speechSynthesis.getVoices();
    if (v.length) {
      resolve(v);
      return;
    }
    const handler = () => {
      v = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(v);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500);
  });
}
async function speakLine(text, opts = {}) {
  if (!(text == null ? void 0 : text.trim())) return;
  if (window.LP_TTS && window.LP_TTS.isEnabled && window.LP_TTS.isEnabled()) {
    try {
      const voiceName = opts.geminiVoice || "Kore";
      await window.LP_TTS.speakOne(text.trim(), voiceName, opts.signal);
      return;
    } catch (e) {
      console.warn("Gemini speakLine failed, falling back:", e.message);
    }
  }
  return new Promise((resolve) => {
    var _a, _b, _c;
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    const utt = new SpeechSynthesisUtterance(text.trim());
    if (opts.voice) utt.voice = opts.voice;
    utt.rate = (_a = opts.rate) != null ? _a : 1;
    utt.pitch = (_b = opts.pitch) != null ? _b : 1;
    utt.volume = (_c = opts.volume) != null ? _c : 1;
    utt.lang = opts.lang || "en-US";
    utt.onend = resolve;
    utt.onerror = resolve;
    window.speechSynthesis.speak(utt);
  });
}
async function playMultiVoiceScript(script, { onProgress, signal } = {}) {
  if (window.LP_TTS && window.LP_TTS.isEnabled && window.LP_TTS.isEnabled()) {
    try {
      await window.LP_TTS.playScript(script, { onProgress, signal });
      return;
    } catch (e) {
      console.warn("Gemini TTS failed, falling back to browser TTS:", e.message);
    }
  }
  const voices = getBestVoices();
  const speakerMap = {};
  let nextSlot = 0;
  const pool = [voices.female, voices.male, voices.neutral].filter(Boolean);
  if (!pool.length) return;
  const lines = script.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    if (signal == null ? void 0 : signal.aborted) return;
    const line = lines[i];
    const m = line.match(/^([A-Z][A-Za-z .'-]{1,30}):\s+(.+)$/);
    let speaker, text;
    if (m) {
      speaker = m[1];
      text = m[2];
    } else {
      speaker = "_narrator";
      text = line;
    }
    if (!speakerMap[speaker]) {
      speakerMap[speaker] = pool[nextSlot % pool.length];
      nextSlot++;
    }
    if (onProgress) onProgress({ lineIdx: i, total: lines.length, speaker, text });
    await speakLine(text, { voice: speakerMap[speaker], rate: 1 });
    if (signal == null ? void 0 : signal.aborted) return;
    await new Promise((r) => setTimeout(r, 250));
  }
}
function stopAllSpeech() {
  try {
    window.speechSynthesis && window.speechSynthesis.cancel();
  } catch (e) {
  }
}
function buildTest(examId, testType) {
  const Q = window.LP_QUESTIONS || {};
  const sections = [];
  const get = (path, fallback) => {
    var _a;
    try {
      return (_a = path.split(".").reduce((o, k) => o && o[k], Q)) != null ? _a : fallback;
    } catch (e) {
      return fallback;
    }
  };
  const cycle = (pool, target, prefix) => {
    if (!Array.isArray(pool) || !pool.length) return [];
    const out = [];
    for (let i = 0; i < target; i++) {
      const base = pool[i % pool.length];
      out.push({ ...base, id: `${prefix}_${i + 1}`, num: i + 1 });
    }
    return out;
  };
  const defaultSpeakingCards = [
    {
      id: "sp_default_1",
      topic: "Describe a place you would like to visit",
      points: ["Where it is", "Why you want to go there", "What you would do there", "And explain why you are interested in this place"],
      sample: ""
    },
    {
      id: "sp_default_2",
      topic: "Describe a skill you have learned recently",
      points: ["What the skill is", "How you learned it", "How long it took", "And explain how it has helped you"],
      sample: ""
    }
  ];
  if (examId === "ielts") {
    if (testType === "full" || testType === "section_listening") {
      sections.push({
        id: "listening",
        name: "Listening",
        icon: "\u{1F3A7}",
        timeSecs: 40 * 60,
        parts: get("ielts.listening.parts", []),
        type: "listening"
      });
    }
    if (testType === "full" || testType === "section_reading") {
      sections.push({
        id: "reading",
        name: "Reading",
        icon: "\u{1F4D6}",
        timeSecs: 60 * 60,
        passages: get("ielts.reading.passages", []),
        type: "reading"
      });
    }
    if (testType === "full" || testType === "section_writing") {
      const task2 = get("ielts.writing.task2", []);
      sections.push({
        id: "writing",
        name: "Writing",
        icon: "\u270D\uFE0F",
        timeSecs: 60 * 60,
        tasks: task2.slice(0, 2),
        type: "writing"
      });
    }
    if (testType === "full" || testType === "section_speaking") {
      const sp = get("ielts.speaking", []);
      const arr = Array.isArray(sp) ? sp : [];
      const partsObj = arr.find((p) => p && p.part === 2);
      const flat = arr.filter((p) => p && (p.prompt || p.topic) && !p.part);
      const cueSource = partsObj && Array.isArray(partsObj.cueCards) && partsObj.cueCards[0] || flat[0] || defaultSpeakingCards[0] || {};
      const cueText = cueSource.prompt || cueSource.cue || cueSource.topic || "Describe a memorable experience. You should say what it was, when it happened, who was with you, and explain why it was memorable.";
      const P1 = [
        "Let's talk about where you live. Do you live in a house or a flat?",
        "What do you like most about your home or neighbourhood?",
        "Do you work, or are you a student at the moment?",
        "What do you usually enjoy doing in your free time?"
      ];
      const P3extra = [
        "How has this changed compared with the past?",
        "Do you think this will be different in the future? Why or why not?",
        "How do people in your country generally feel about this?"
      ];
      const cards = [];
      P1.forEach((q, i) => cards.push({ part: 1, id: "sp_p1_" + i, prompt: q }));
      cards.push({
        part: 2,
        isCueCard: true,
        id: "sp_p2",
        prompt: cueText,
        sampleAnswer: cueSource.modelAnswer || cueSource.sampleAnswer || ""
      });
      flat.slice(1, 3).forEach((p, i) => cards.push({
        part: 3,
        id: "sp_p3_" + i,
        prompt: p.prompt || p.topic,
        sampleAnswer: p.modelAnswer || ""
      }));
      const need = Math.max(0, 4 - cards.filter((c) => c.part === 3).length);
      P3extra.slice(0, need).forEach((q, i) => cards.push({ part: 3, id: "sp_p3g_" + i, prompt: q }));
      sections.push({
        id: "speaking",
        name: "Speaking",
        icon: "\u{1F3A4}",
        timeSecs: 14 * 60,
        cards,
        type: "speaking"
      });
    }
  } else if (examId === "toefl") {
    if (testType === "full" || testType === "section_reading") {
      const tPassages = get("toefl.reading.passages", []);
      const passages = [];
      for (let i = 0; i < 2; i++) {
        const base = tPassages[i % tPassages.length];
        if (!base) break;
        const cycledQ = cycle(base.questions || [], 10, `toefl_r${i + 1}q`);
        passages.push({ ...base, id: `toefl_r${i + 1}`, questions: cycledQ });
      }
      sections.push({ id: "reading", name: "Reading", icon: "\u{1F4D6}", timeSecs: 35 * 60, passages, type: "reading" });
    }
    if (testType === "full" || testType === "section_listening") {
      const excerpts = get("toefl.listening.excerpts", []);
      const parts = [];
      for (let i = 0; i < 4; i++) {
        const base = excerpts[i % excerpts.length];
        if (!base) break;
        const cycledQ = cycle(base.questions || [], (base.questions || []).length || 1, `toefl_l${i + 1}q`);
        parts.push({ ...base, id: `toefl_l${i + 1}`, partNum: i + 1, audioScript: base.script || base.audioScript, context: base.topic || "Academic listening", questions: cycledQ });
      }
      sections.push({ id: "listening", name: "Listening", icon: "\u{1F3A7}", timeSecs: 36 * 60, parts, type: "listening" });
    }
    if (testType === "full" || testType === "section_speaking") {
      const tasks = get("toefl.speaking", []);
      sections.push({
        id: "speaking",
        name: "Speaking",
        icon: "\u{1F3A4}",
        timeSecs: 16 * 60,
        tasks: tasks.slice(0, 4),
        type: "speaking_toefl"
      });
    }
    if (testType === "full" || testType === "section_writing") {
      const tasks = get("toefl.writing", []);
      sections.push({
        id: "writing",
        name: "Writing",
        icon: "\u270D\uFE0F",
        timeSecs: 29 * 60,
        tasks: tasks.slice(0, 2),
        type: "writing"
      });
    }
  } else if (examId === "pte") {
    if (testType === "full" || testType === "section_writing") {
      const tasks = get("pte.speakingWriting", []);
      sections.push({
        id: "writing",
        name: "Speaking & Writing",
        icon: "\u{1F3A4}\u270D\uFE0F",
        timeSecs: 60 * 60,
        tasks: tasks.length ? tasks : [],
        type: "writing"
      });
    }
    if (testType === "full" || testType === "section_reading") {
      const toL = "ABCDEFG";
      const qs = [];
      get("pte.reading", []).forEach((r) => {
        if (r.type === "fill_in_blanks_rw" && r.answers) {
          const passage = String(r.text || "").replace(/_+\[(\d+)\]_+/g, "\uFF3B $1 \uFF3D");
          Object.keys(r.answers).forEach((n) => {
            const opts = r.optionSets && r.optionSets[n] || r.options || [];
            const li = opts.indexOf(r.answers[n]);
            if (opts.length && li >= 0) qs.push({ id: r.id + "_b" + n, type: "mcq", text: "Select the best word for gap \uFF3B" + n + "\uFF3D in the passage.", passage, options: opts.map((o, k) => toL[k] + ". " + o), answer: toL[li] });
          });
        }
      });
      if (qs.length) {
        const cycled = cycle(qs, Math.min(15, qs.length), "pte_r");
        sections.push({ id: "reading", name: "Reading \u2014 Fill in the Blanks", icon: "\u{1F4D6}", timeSecs: 30 * 60, passages: [{ id: "pte_r", title: "Reading", text: "", questions: cycled }], type: "reading" });
      }
    }
    if (testType === "full" || testType === "section_listening") {
      const parts = [];
      get("pte.listening", []).forEach((t) => {
        if (t.type === "write_from_dictation" && Array.isArray(t.sentences)) {
          t.sentences.forEach((s, si) => parts.push({ id: t.id + "_s" + si, partNum: parts.length + 1, context: "Write from Dictation \u2014 type the sentence you hear", audioScript: s, questions: [{ id: t.id + "_s" + si + "_q", type: "fill", text: "Type the sentence you heard, exactly.", answer: s }] }));
        }
      });
      if (parts.length) {
        sections.push({ id: "listening", name: "Listening \u2014 Write from Dictation", icon: "\u{1F3A7}", timeSecs: 30 * 60, parts: parts.slice(0, 15), type: "listening" });
      }
    }
  } else if (examId === "gre") {
    if (testType === "full" || testType === "section_writing") {
      const tasks = get("gre.analyticalWriting", []);
      sections.push({
        id: "aw",
        name: "Analytical Writing \u2014 Issue Task",
        icon: "\u270D\uFE0F",
        timeSecs: 30 * 60,
        tasks: tasks.slice(0, 1),
        type: "writing_aw"
      });
    }
    if (testType === "full" || testType === "section_reading") {
      const vPool = get("gre.verbal", []).flatMap((v) => v.questions ? v.questions.map((q) => ({ ...q, type: q.type || "mcq", passage: q.passage || v.passage || v.text })) : [v]);
      const cycled = cycle(vPool, 27, "gre_v");
      sections.push({
        id: "verbal",
        name: "Verbal Reasoning",
        icon: "\u{1F4D6}",
        timeSecs: 41 * 60,
        passages: [{ id: "gre_v", title: "Verbal Reasoning \u2014 27 questions, 41 minutes", text: "", questions: cycled }],
        type: "reading"
      });
    }
    if (testType === "full" || testType === "section_speaking") {
      const qPool = get("gre.quantitative", []);
      const cycled = cycle(qPool, 27, "gre_q");
      sections.push({
        id: "quant",
        name: "Quantitative Reasoning",
        icon: "\u{1F522}",
        timeSecs: 47 * 60,
        passages: [{ id: "gre_q", title: "Quantitative Reasoning \u2014 27 questions, 47 minutes", text: "", questions: cycled }],
        type: "reading"
      });
    }
  } else if (examId === "gmat") {
    if (testType === "full" || testType === "section_reading") {
      const qPool = get("gmat.quantitative", []);
      const cycled = cycle(qPool, 21, "gmat_q");
      sections.push({
        id: "quant",
        name: "Quantitative Reasoning",
        icon: "\u{1F522}",
        timeSecs: 45 * 60,
        passages: [{ id: "gmat_q", title: "Quantitative Reasoning \u2014 21 questions, 45 minutes", text: "", questions: cycled }],
        type: "reading"
      });
    }
    if (testType === "full" || testType === "section_writing") {
      const vPool = get("gmat.verbal", []).flatMap((v) => v.questions ? v.questions.map((q) => ({ ...q, type: q.type || "mcq", passage: q.passage || v.passage || v.text })) : [v]);
      const cycled = cycle(vPool, 23, "gmat_v");
      sections.push({
        id: "verbal",
        name: "Verbal Reasoning",
        icon: "\u{1F4D6}",
        timeSecs: 45 * 60,
        passages: [{ id: "gmat_v", title: "Verbal Reasoning \u2014 23 questions, 45 minutes", text: "", questions: cycled }],
        type: "reading"
      });
    }
    if (testType === "full" || testType === "section_speaking") {
      const diPool = get("gmat.dataInsights", []);
      const cycled = cycle(diPool, 20, "gmat_di");
      sections.push({
        id: "di",
        name: "Data Insights",
        icon: "\u{1F4CA}",
        timeSecs: 45 * 60,
        passages: [{ id: "gmat_di", title: "Data Insights \u2014 20 questions, 45 minutes", text: "", questions: cycled }],
        type: "reading"
      });
    }
  } else if (examId === "celpip") {
    if (testType === "full" || testType === "section_listening") {
      const cl = get("celpip.listening", []);
      const CEL_SCENES = [
        { emoji: "\u{1F5E3}\uFE0F", bg: "linear-gradient(135deg,#dbeafe,#ede9fe)", image: "/img/scenes/conversation.jpg" },
        { emoji: "\u2615", bg: "linear-gradient(135deg,#fef3c7,#fde68a)", image: "/img/scenes/cafe.jpg" },
        { emoji: "\u{1F3DB}\uFE0F", bg: "linear-gradient(135deg,#dcfce7,#bbf7d0)", image: "/img/scenes/fitness.jpg" },
        { emoji: "\u{1F4F0}", bg: "linear-gradient(135deg,#e0e7ff,#c7d2fe)", image: "/img/scenes/city.jpg" },
        { emoji: "\u{1F465}", bg: "linear-gradient(135deg,#fce7f3,#fbcfe8)", image: "/img/scenes/meeting.jpg" },
        { emoji: "\u{1F399}\uFE0F", bg: "linear-gradient(135deg,#cffafe,#a5f3fc)", image: "/img/scenes/interview.jpg" }
      ];
      const parts = (cl || []).map((p, i) => ({
        id: `cel_l${p.part || i + 1}`,
        partNum: p.part || i + 1,
        name: `Part ${p.part || i + 1}: ${p.name}`,
        context: p.scenario || p.name,
        scene: { emoji: (CEL_SCENES[i] || {}).emoji || "\u{1F3A7}", bg: (CEL_SCENES[i] || {}).bg, label: p.name, image: p.image || (CEL_SCENES[i] || {}).image || "" },
        audioScript: p.audioScript || "Listen carefully.",
        questions: (p.questions || []).map((q) => ({ id: q.id, type: q.type || "mcq", text: q.text || q.prompt, options: q.options, answer: q.answer }))
      }));
      if (parts.length) sections.push({ id: "listening", name: "Listening", icon: "\u{1F3A7}", timeSecs: 47 * 60, parts, type: "listening", isCelpip: true });
    }
    if (testType === "full" || testType === "section_reading") {
      const cr = get("celpip.reading", []);
      const passages = (cr || []).map((p, i) => ({
        id: `cel_r${p.part || i + 1}`,
        part: p.part || i + 1,
        type: p.type,
        title: p.title || p.name,
        partTitle: `Part ${p.part || i + 1}: ${p.name}`,
        intro: p.intro,
        emails: p.emails,
        schedule: p.schedule,
        viewpoints: p.viewpoints,
        text: p.text,
        questions: (p.questions || []).map((q) => ({ id: q.id, type: q.type, prompt: q.prompt || q.text, options: q.options, answer: q.answer, correctAnswer: q.answer, explanation: q.explanation }))
      }));
      if (passages.length) sections.push({ id: "reading", name: "Reading", icon: "\u{1F4D6}", timeSecs: 55 * 60, passages, type: "reading", isCelpip: true });
    }
    if (testType === "full" || testType === "section_writing") {
      const tasks = get("celpip.writing", []);
      const mapped = tasks.map((t, i) => {
        if (t.type === "email") {
          const bullets = (t.taskBullets || []).map((b) => "\u2022 " + b).join("\n");
          return { id: t.id, type: "email", prompt: `${t.situation}

In your email:
${bullets}

Write at least 150 words.`, wordTarget: t.wordTarget || 150, sampleAnswer: t.sampleAnswer };
        } else if (t.type === "survey") {
          return { id: t.id, type: "survey", prompt: `Survey response (write 150\u2013200 words covering both points):

1. ${t.question1}

2. ${t.question2}`, wordTarget: 150, sampleAnswer: t.sampleAnswer };
        }
        return { id: t.id, prompt: t.prompt || t.situation || "Write a response.", wordTarget: t.wordTarget || 150 };
      });
      const finalTasks = mapped.length >= 2 ? mapped.slice(0, 2) : [
        { id: "cel_w1", type: "email", prompt: "You need to send a thank-you email to a friend who helped you move into your new apartment last weekend. Apologise for not thanking them sooner, explain how much their help meant to you, and offer to do something nice for them in return.\n\nWrite at least 150 words.", wordTarget: 150 },
        { id: "cel_w2", type: "survey", prompt: "Survey: Your city is considering whether to invest in (a) a new public library or (b) a new community sports complex. Which do you think would benefit the community more, and why?\n\nWrite at least 150 words.", wordTarget: 150 }
      ];
      sections.push({ id: "writing", name: "Writing", icon: "\u270D\uFE0F", timeSecs: 53 * 60, tasks: finalTasks, type: "writing" });
    }
    if (testType === "full" || testType === "section_speaking") {
      const tasks = get("celpip.speaking", []);
      const realPrompts = [
        { name: "Giving Advice", situation: "A friend is considering quitting their job to start a business with no savings or business plan. Give them practical advice.", prep: 30, response: 90 },
        { name: "Personal Experience", situation: "Describe a memorable experience from your past that taught you something important. Include when it happened, what happened, and what you learned.", prep: 30, response: 60 },
        { name: "Describing a Scene", situation: "Look at the picture. Describe what is happening in as much detail as you can \u2014 the setting, the people, what they are doing, and how they might be feeling.", prep: 30, response: 60 },
        { name: "Making Predictions", situation: "Look at the picture. Predict what is going to happen next. Explain why you think this will happen.", prep: 30, response: 60 },
        { name: "Comparing Options", situation: "Your friend cannot decide between two apartments. Compare them and recommend which one they should choose: a smaller, cheaper apartment closer to work OR a larger, more expensive apartment further from work.", prep: 60, response: 60 },
        { name: "Difficult Situation", situation: "You ordered a product online. It arrived damaged. Call the customer service team and explain the situation, including what you bought, what is wrong with it, and what you want them to do.", prep: 60, response: 60 },
        { name: "Expressing Opinions", situation: "Many people now work from home. Do you think this is a positive or negative change for society? Give specific reasons for your opinion.", prep: 30, response: 90 },
        { name: "Unusual Situation", situation: "You see something strange happening: a person is putting a large package into your neighbour's mailbox at midnight. You don't know your neighbour well. Describe what you would do and why.", prep: 30, response: 60 }
      ];
      const SPK_SCENES = {
        "Describing a Scene": { emoji: "\u{1F3DE}\uFE0F", bg: "linear-gradient(135deg,#dcfce7,#bbf7d0)", image: "/img/scenes/landmark.jpg", label: "Look at the picture \u2014 describe what you see" },
        "Making Predictions": { emoji: "\u{1F52E}", bg: "linear-gradient(135deg,#ede9fe,#ddd6fe)", image: "/img/scenes/street_scene.jpg", label: "Look at the picture \u2014 predict what happens next" },
        "Comparing Options": { emoji: "\u2696\uFE0F", bg: "linear-gradient(135deg,#dbeafe,#bfdbfe)", image: "/img/scenes/apartment.jpg", label: "Compare the two options shown" }
      };
      const cards = realPrompts.map((p, i) => ({
        id: `cel_s${i + 1}`,
        topic: `Task ${i + 1}: ${p.name}`,
        prompt: p.situation,
        points: [],
        scene: SPK_SCENES[p.name] || null,
        prepSeconds: p.prep,
        responseSeconds: p.response
      }));
      sections.push({ id: "speaking", name: "Speaking", icon: "\u{1F3A4}", timeSecs: 20 * 60, cards, type: "speaking" });
    }
  } else if (examId === "duolingo") {
    const toL = "ABCDEFG";
    const wordsToLetters = (words, options) => (words || []).map((w) => {
      const i = (options || []).indexOf(w);
      return i >= 0 ? toL[i] : null;
    }).filter(Boolean);
    const wordToLetter = (word, options) => {
      const i = (options || []).indexOf(word);
      return i >= 0 ? toL[i] : word;
    };
    const dTasks = get("duolingo.tasks", []);
    if (testType === "full" || testType === "section_reading") {
      const readQs = [];
      dTasks.filter((t) => t.type === "read_select").forEach((t) => readQs.push({ id: t.id, type: "mcq_multi", text: t.prompt || "Select all the REAL English words.", options: t.options, answer: wordsToLetters(t.answer, t.options), selectCount: (t.answer || []).length }));
      dTasks.filter((t) => t.type === "fill_blank").forEach((t) => readQs.push({ id: t.id, type: "mcq", text: t.sentence || t.prompt, options: t.options, answer: wordToLetter(t.answer, t.options) }));
      if (readQs.length) sections.push({ id: "reading", name: "Reading \u2014 Read & Select, Complete", icon: "\u{1F4D6}", timeSecs: 18 * 60, passages: [{ id: "duo_read", title: "Reading tasks", text: "", questions: readQs }], type: "reading" });
    }
    if (testType === "full" || testType === "section_listening") {
      const lparts = dTasks.filter((t) => t.type === "listen_type").map((t, i) => ({ id: t.id, partNum: i + 1, context: "Listen and type the sentence you hear", audioScript: t.audioScript, questions: [{ id: t.id + "_q", type: "fill", text: "Type the sentence you heard.", answer: t.answer }] }));
      if (lparts.length) sections.push({ id: "listening", name: "Listening \u2014 Listen & Type", icon: "\u{1F3A7}", timeSecs: 12 * 60, parts: lparts, type: "listening" });
    }
    if (testType === "full" || testType === "section_writing") {
      sections.push({
        id: "writing",
        name: "Writing Sample",
        icon: "\u270D\uFE0F",
        timeSecs: 8 * 60,
        tasks: [
          { id: "duo_wp", prompt: "Write about the photo. Describe the image in one or more sentences (at least 1 minute).", wordTarget: 40, scene: { emoji: "\u{1F34B}", bg: "linear-gradient(135deg,#fef9c3,#fde68a)", image: "/img/scenes/kitchen.jpg", label: "Write at least one sentence about this image" } },
          { id: "duo_w", prompt: "Write a short response about a topic that interests you (50-100 words).", wordTarget: 75 }
        ],
        type: "writing"
      });
    }
    if (testType === "full" || testType === "section_speaking") {
      sections.push({
        id: "speaking",
        name: "Speaking Sample",
        icon: "\u{1F3A4}",
        timeSecs: 20 * 60,
        cards: [
          { id: "duo_sp", topic: "Speak about the photo. Describe what you see in as much detail as you can.", points: ["The setting", "The people and what they are doing", "The mood or atmosphere"], scene: { emoji: "\u{1F389}", bg: "linear-gradient(135deg,#fce7f3,#fbcfe8)", image: "/img/scenes/street_scene.jpg", label: "Speak about this image for up to 90 seconds" }, prepSeconds: 20, responseSeconds: 90 },
          { id: "duo_s1", topic: "Describe a recent experience that taught you something new.", points: ["What happened", "What you learned", "Why it mattered to you"], prepSeconds: 20, responseSeconds: 60 },
          { id: "duo_s2", topic: "Talk about a place you would like to visit.", points: ["Where", "Why", "What you would do there"], prepSeconds: 20, responseSeconds: 60 }
        ],
        type: "speaking"
      });
    }
  }
  return { examId, testType, sections };
}
function MockTest({ exam, testCfg, onBack, onNav }) {
  var _a;
  const [phase, setPhase] = useStateT("select");
  const [config, setConfig] = useStateT(null);
  const [sectionIdx, setSectionIdx] = useStateT(0);
  const [questionIdx, setQuestionIdx] = useStateT(0);
  const [answers, setAnswers] = useStateT({});
  const [timeLeft, setTimeLeft] = useStateT(null);
  const [audioPlayed, setAudioPlayed] = useStateT({});
  const [audioPlaying, setAudioPlaying] = useStateT(false);
  const timerRef = useRefT(null);
  const synthRef = useRefT(null);
  useEffectT(() => {
    if (testCfg && testCfg.prebuiltConfig) {
      setConfig(testCfg.prebuiltConfig);
      setAnswers({});
      setSectionIdx(0);
      setQuestionIdx(0);
      setPhase("intro");
      return;
    }
    if (testCfg && testCfg.type !== "full" && testCfg.type !== "select") {
      const cfg = buildTest(exam.id, testCfg.type);
      setConfig(cfg);
      setPhase("intro");
    }
  }, []);
  useEffectT(() => {
    if (phase !== "active" || timeLeft === null) return;
    if (timeLeft <= 0) {
      advanceSection();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1e3);
    return () => clearTimeout(timerRef.current);
  }, [phase, timeLeft]);
  function startTest(type) {
    try {
      if (window.gtag) window.gtag("event", "mock_test_started", { exam: exam && exam.id, test_type: type });
    } catch (e) {
    }
    const cfg = buildTest(exam.id, type);
    setConfig(cfg);
    setAnswers({});
    setSectionIdx(0);
    setQuestionIdx(0);
    setPhase("intro");
  }
  function beginSection() {
    const sec = config.sections[sectionIdx];
    setTimeLeft(sec.timeSecs);
    setQuestionIdx(0);
    setPhase("active");
  }
  function advanceSection() {
    clearTimeout(timerRef.current);
    stopAudio();
    const nextIdx = sectionIdx + 1;
    if (nextIdx >= config.sections.length) {
      finishTest();
    } else {
      setSectionIdx(nextIdx);
      setQuestionIdx(0);
      setPhase("section-intro");
    }
  }
  function finishTest() {
    const report = scoreTest(config, answers);
    try {
      const hist = JSON.parse(localStorage.getItem("lp_history") || "[]");
      hist.unshift({ exam: exam.id, examName: exam.name, type: config.testType, date: (/* @__PURE__ */ new Date()).toISOString(), ...report });
      localStorage.setItem("lp_history", JSON.stringify(hist.slice(0, 50)));
      if (window.LP_AUTH && window.LP_AUTH.pushHistory) window.LP_AUTH.pushHistory();
      collectErrors(exam, config, answers);
    } catch (e) {
    }
    setPhase("report");
  }
  function setAnswer(qId, val) {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }
  function playAudio(script) {
    stopAudio();
    if (!window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(script);
    utt.rate = 0.9;
    utt.pitch = 1;
    utt.lang = "en-GB";
    utt.onend = () => setAudioPlaying(false);
    utt.onerror = () => setAudioPlaying(false);
    synthRef.current = utt;
    setAudioPlaying(true);
    window.speechSynthesis.speak(utt);
  }
  function stopAudio() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setAudioPlaying(false);
  }
  const markAudioPlayed = (id) => setAudioPlayed((prev) => ({ ...prev, [id]: true }));
  if (phase === "select") return /* @__PURE__ */ React.createElement(TestSelect, { exam, onSelect: startTest, onBack, onNav });
  if (phase === "intro" && config) {
    const sec = config.sections[0];
    return /* @__PURE__ */ React.createElement(
      TestIntro,
      {
        exam,
        config,
        section: sec,
        onStart: () => {
          setSectionIdx(0);
          setPhase("section-intro");
        },
        onBack,
        onNav
      }
    );
  }
  if (phase === "section-intro" && config) {
    const sec = config.sections[sectionIdx];
    return /* @__PURE__ */ React.createElement(
      SectionIntro,
      {
        sec,
        sectionNum: sectionIdx + 1,
        total: config.sections.length,
        onBegin: beginSection,
        onHome: () => {
          if (confirm("Exit test and return to home?")) {
            stopAllSpeech();
            onNav && onNav("home");
          }
        }
      }
    );
  }
  if (phase === "active" && config) {
    const sec = config.sections[sectionIdx];
    const allQs = getAllQuestions(sec);
    const totalQ = allQs.length || (sec.tasks ? sec.tasks.length : 1);
    const answeredCount = Object.keys(answers).filter((k) => k.startsWith(sec.id + "_")).length;
    return /* @__PURE__ */ React.createElement("div", { className: "test-shell" }, /* @__PURE__ */ React.createElement("div", { className: "test-topbar" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "brand test-home-btn",
        onClick: () => {
          if (confirm("Exit the test and return to home? Your answers will be lost.")) {
            stopAllSpeech();
            onNav && onNav("home");
          }
        },
        title: "Return to home (exits test)",
        style: { background: "transparent" }
      },
      window.LP_Logo ? /* @__PURE__ */ React.createElement(window.LP_Logo, { size: 28 }) : /* @__PURE__ */ React.createElement("span", { className: "brand-mark" }, "L"),
      /* @__PURE__ */ React.createElement("span", { className: "brand-text-desktop", style: { display: window.innerWidth > 600 ? "inline" : "none" } }, "LandingPrep")
    ), /* @__PURE__ */ React.createElement("div", { className: "tb-section-info" }, /* @__PURE__ */ React.createElement("div", { className: "tb-exam" }, exam.name), /* @__PURE__ */ React.createElement("div", { className: "tb-section" }, sec.icon, " ", sec.name, " \u2014 Section ", sectionIdx + 1, " of ", config.sections.length)), /* @__PURE__ */ React.createElement("div", { className: "tb-timer", style: timeLeft < 300 ? { color: "var(--error)" } : {} }, fmtTime(timeLeft)), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: advanceSection }, sectionIdx < config.sections.length - 1 ? "Submit section \u2192" : "Finish test \u2192")), config.sections.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "section-nav" }, config.sections.map((s, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s.id,
        className: "sec-pill" + (i === sectionIdx ? " active" : "") + (i < sectionIdx ? " done" : ""),
        onClick: () => {
          if (i === sectionIdx) return;
          if (!confirm(`Jump to ${s.name}? Your time on the current section will continue running.`)) return;
          clearTimeout(timerRef.current);
          stopAudio();
          setSectionIdx(i);
          setQuestionIdx(0);
          setPhase("section-intro");
        },
        title: s.name
      },
      /* @__PURE__ */ React.createElement("span", { className: "sec-pill-icon" }, s.icon),
      /* @__PURE__ */ React.createElement("span", { className: "sec-pill-name" }, s.name)
    ))), /* @__PURE__ */ React.createElement("div", { className: "test-progress-bar" }, /* @__PURE__ */ React.createElement("i", { style: { width: `${Math.min(100, answeredCount / Math.max(1, totalQ) * 100)}%` } })), /* @__PURE__ */ React.createElement("div", { className: "question-layout" }, sec.type === "listening" && /* @__PURE__ */ React.createElement(ListeningSection, { sec, answers, setAnswer, sectionId: sec.id }), sec.type === "pte_reading" && window.LP_PTE_RENDERER && /* @__PURE__ */ React.createElement(window.LP_PTE_RENDERER.PTEReadingSection, { sec, answers, setAnswer, sectionId: sec.id }), sec.type === "pte_listening" && window.LP_PTE_LISTENING && /* @__PURE__ */ React.createElement(window.LP_PTE_LISTENING.PTEListeningSection, { sec, answers, setAnswer, sectionId: sec.id }), sec.type === "pte_sw" && window.LP_PTE_SW && /* @__PURE__ */ React.createElement(window.LP_PTE_SW.PteSwSection, { sec, answers, setAnswer, sectionId: sec.id }), sec.type === "reading" && sec.isCelpip && sec.passages && ((_a = sec.passages[0]) == null ? void 0 : _a.type) && ["correspondence", "schedule", "viewpoints"].includes(sec.passages[0].type) && window.LP_CELPIP && /* @__PURE__ */ React.createElement(window.LP_CELPIP.CelpipReadingSection, { sec, answers, setAnswer: (id, v) => setAnswer(id, v) }), sec.type === "writing" && sec.isCelpip && window.LP_CELPIP && /* @__PURE__ */ React.createElement(window.LP_CELPIP.CelpipWritingSection, { sec, answers, setAnswer: (id, v) => setAnswer(id, v) }), sec.type === "speaking" && sec.isCelpip && window.LP_CELPIP && /* @__PURE__ */ React.createElement(window.LP_CELPIP.CelpipSpeakingSection, { sec, answers, setAnswer: (id, v) => setAnswer(id, v) }), sec.type === "reading" && !sec.isCelpip && /* @__PURE__ */ React.createElement(ReadingSection, { sec, answers, setAnswer, sectionId: sec.id }), (sec.type === "writing" || sec.type === "writing_aw") && !sec.isCelpip && /* @__PURE__ */ React.createElement(WritingSection, { sec, answers, setAnswer, sectionId: sec.id }), (sec.type === "speaking" || sec.type === "speaking_toefl") && !sec.isCelpip && /* @__PURE__ */ React.createElement(SpeakingSection, { sec, answers, setAnswer, sectionId: sec.id })), /* @__PURE__ */ React.createElement("div", { className: "question-nav-bar" }, /* @__PURE__ */ React.createElement("span", { className: "q-counter" }, Object.keys(answers).filter((k) => answers[k] !== "" && answers[k] != null).length, " answered"), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: advanceSection }, sectionIdx < config.sections.length - 1 ? "Next section \u2192" : "Submit test \u2192"))));
  }
  if (phase === "report" && config) {
    return /* @__PURE__ */ React.createElement(TestReport, { exam, config, answers, onBack, onNav, onRetake: () => {
      setPhase("select");
      setAnswers({});
    } });
  }
  return null;
}
function getAllQuestions(sec) {
  if (!sec) return [];
  if (sec.type === "listening") {
    return (sec.parts || []).flatMap((p) => p.questions || []);
  }
  if (sec.type === "pte_reading" || sec.type === "pte_listening" || sec.type === "pte_sw") {
    return sec.items || [];
  }
  if (sec.type === "reading" || sec.type === "reading_pte") {
    return (sec.passages || []).flatMap((p) => p.questions || []);
  }
  return [];
}
function TestSelect({ exam, onSelect, onBack, onNav }) {
  var _a;
  const [selected, setSelected] = useStateT(null);
  const DRILLS = {
    ielts: [
      { id: "full", icon: "\u{1F4CB}", name: "Full Mock Test", desc: "4 sections \xB7 Official timings \xB7 Complete scoring report", meta: [exam.duration, "All sections", "Full report"] },
      { id: "section_listening", icon: "\u{1F3A7}", name: "Listening Drill", desc: "40 questions across 4 parts", meta: ["40 min", "40 questions", "Band 0\u20139"] },
      { id: "section_reading", icon: "\u{1F4D6}", name: "Reading Drill", desc: "3 passages, side-by-side layout", meta: ["60 min", "40 questions", "Band 0\u20139"] },
      { id: "section_writing", icon: "\u270D\uFE0F", name: "Writing Practice", desc: "Task 1 (150w) + Task 2 (250w)", meta: ["60 min", "2 tasks", "Scored"] },
      { id: "section_speaking", icon: "\u{1F3A4}", name: "Speaking with AI Examiner", desc: "Part 1 \xB7 Cue Card \xB7 Part 3 discussion", meta: ["14 min", "AI voice", "Scored"] }
    ],
    toefl: [
      { id: "full", icon: "\u{1F4CB}", name: "Full Mock Test", desc: "All 4 sections \xB7 Official timings", meta: [exam.duration, "0\u2013120", "Full report"] },
      { id: "section_reading", icon: "\u{1F4D6}", name: "Reading Drill", desc: "2 academic passages, 10 Q each", meta: ["35 min", "20 questions", "0\u201330"] },
      { id: "section_listening", icon: "\u{1F3A7}", name: "Listening Drill", desc: "4 lectures/conversations, 28 Q", meta: ["36 min", "28 questions", "0\u201330"] },
      { id: "section_writing", icon: "\u270D\uFE0F", name: "Writing Practice", desc: "Integrated + Academic Discussion", meta: ["29 min", "2 tasks", "0\u201330"] },
      { id: "section_speaking", icon: "\u{1F3A4}", name: "Speaking with AI", desc: "4 tasks \xB7 AI examiner", meta: ["16 min", "4 tasks", "0\u201330"] }
    ],
    gmat: [
      { id: "full", icon: "\u{1F4CB}", name: "Full Mock Test", desc: "3 sections \xB7 64 questions \xB7 2h 15m", meta: [exam.duration, "205\u2013805", "Full report"] },
      { id: "section_reading", icon: "\u{1F522}", name: "Quantitative Reasoning Drill", desc: "21 questions on arithmetic, algebra, percentages, probability, statistics", meta: ["45 min", "21 questions", "60\u201390"] },
      { id: "section_writing", icon: "\u{1F4D6}", name: "Verbal Reasoning Drill", desc: "23 questions: Reading Comprehension + Critical Reasoning", meta: ["45 min", "23 questions", "60\u201390"] },
      { id: "section_speaking", icon: "\u{1F4CA}", name: "Data Insights Drill", desc: "20 questions: graphs, tables, data sufficiency, analytical reasoning", meta: ["45 min", "20 questions", "60\u201390"] }
    ],
    gre: [
      { id: "full", icon: "\u{1F4CB}", name: "Full Mock Test", desc: "AW + Verbal + Quant \xB7 1h 58m", meta: [exam.duration, "130\u2013170 per section", "Full report"] },
      { id: "section_writing", icon: "\u270D\uFE0F", name: "Analytical Writing \u2014 Issue Task", desc: "One 30-minute essay", meta: ["30 min", "1 essay", "0\u20136"] },
      { id: "section_reading", icon: "\u{1F4D6}", name: "Verbal Reasoning Drill", desc: "27 questions: TC, SE, RC", meta: ["41 min", "27 questions", "130\u2013170"] },
      { id: "section_speaking", icon: "\u{1F522}", name: "Quantitative Reasoning Drill", desc: "27 questions: arithmetic, algebra, geometry, data interpretation", meta: ["47 min", "27 questions", "130\u2013170"] }
    ],
    pte: [
      { id: "full", icon: "\u{1F4CB}", name: "Full Mock Test", desc: "All 3 sections \xB7 AI scored", meta: [exam.duration, "10\u201390", "Full report"] },
      { id: "section_writing", icon: "\u{1F3A4}\u270D\uFE0F", name: "Speaking & Writing Drill", desc: "Read aloud \xB7 repeat sentence \xB7 describe image \xB7 summarize \xB7 essay", meta: ["60 min", "AI scored", "10\u201390"] },
      { id: "section_reading", icon: "\u{1F4D6}", name: "Reading Drill", desc: "MCQ \xB7 fill blanks \xB7 reorder paragraphs", meta: ["30 min", "15+ questions", "10\u201390"] },
      { id: "section_listening", icon: "\u{1F3A7}", name: "Listening Drill", desc: "Summarize \xB7 MCQ \xB7 dictation", meta: ["35 min", "15+ questions", "10\u201390"] }
    ],
    celpip: [
      { id: "full", icon: "\u{1F4CB}", name: "Full Mock Test", desc: "All 4 sections \xB7 CLB scoring", meta: [exam.duration, "CLB 1\u201312", "Full report"] },
      { id: "section_listening", icon: "\u{1F3A7}", name: "Listening Drill", desc: "6 parts \xB7 daily/workplace English", meta: ["47 min", "38 questions", "CLB 1\u201312"] },
      { id: "section_reading", icon: "\u{1F4D6}", name: "Reading Drill", desc: "4 reading parts", meta: ["55 min", "36 questions", "CLB 1\u201312"] },
      { id: "section_writing", icon: "\u270D\uFE0F", name: "Writing Practice", desc: "Email + Survey (real Canadian format)", meta: ["53 min", "2 tasks", "CLB 1\u201312"] },
      { id: "section_speaking", icon: "\u{1F3A4}", name: "Speaking with AI", desc: "8 tasks: advice \xB7 scene \xB7 prediction \xB7 opinion", meta: ["20 min", "8 tasks", "CLB 1\u201312"] }
    ],
    duolingo: [
      { id: "full", icon: "\u{1F4CB}", name: "Full Adaptive Test", desc: "Adaptive questions \xB7 Speaking & writing sample \xB7 ~1 hour", meta: [exam.duration, "10\u2013160", "Full report"] }
    ]
  };
  const filtered = DRILLS[exam.id] || DRILLS.ielts;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "exams", onNav }), /* @__PURE__ */ React.createElement("section", { className: "test-select-hero" }, /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("div", { className: "guide-crumbs" }, /* @__PURE__ */ React.createElement("a", { onClick: (e) => {
    e.preventDefault();
    onBack();
  }, href: "#/" }, "Home"), /* @__PURE__ */ React.createElement("span", null, "/"), /* @__PURE__ */ React.createElement("span", null, exam.name), /* @__PURE__ */ React.createElement("span", null, "/"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink)" } }, "Mock Tests")), /* @__PURE__ */ React.createElement("h1", { className: "h1", style: { marginTop: 16 } }, exam.name, " ", /* @__PURE__ */ React.createElement("em", { style: { color: exam.colour, fontStyle: "italic" } }, "Mock Tests")), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { maxWidth: 600, marginTop: 14 } }, "Choose a test type below. All tests are free, timed, and scored dynamically based on your actual answers."))), /* @__PURE__ */ React.createElement("div", { className: "shell", style: { padding: "32px 20px 64px" } }, /* @__PURE__ */ React.createElement("div", { className: "test-type-grid" }, filtered.map((t) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: t.id,
      className: "test-type-card" + (selected === t.id ? " is-selected" : ""),
      onClick: () => setSelected(t.id)
    },
    /* @__PURE__ */ React.createElement("div", { className: "ttc-icon" }, t.icon),
    /* @__PURE__ */ React.createElement("div", { className: "ttc-name" }, t.name),
    /* @__PURE__ */ React.createElement("div", { className: "ttc-desc" }, t.desc),
    /* @__PURE__ */ React.createElement("div", { className: "ttc-meta" }, t.meta.map((m, i) => /* @__PURE__ */ React.createElement("span", { key: i }, m)))
  ))), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 28, display: "flex", gap: 12 } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary",
      disabled: !selected,
      onClick: () => selected && onSelect(selected)
    },
    selected ? `Start ${(_a = filtered.find((t) => t.id === selected)) == null ? void 0 : _a.name} \u2192` : "Select a test type above"
  ), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onBack }, "Back"))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
}
function TestIntro({ exam, config, section, onStart, onBack, onNav }) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "exams", onNav }), /* @__PURE__ */ React.createElement("div", { className: "test-intro" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow", style: { marginBottom: 12 } }, exam.name, " \xB7 Mock Test"), /* @__PURE__ */ React.createElement("h1", null, config.testType === "full" ? `Full ${exam.name} Test` : `${config.sections[0].name} Practice`), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { marginTop: 14 } }, "This test will run for ", config.sections.reduce((a, s) => a + Math.round(s.timeSecs / 60), 0), " minutes total. Each section has its own timer. Complete all questions before the timer expires."), /* @__PURE__ */ React.createElement("ul", { className: "section-list", style: { marginTop: 24 } }, config.sections.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: s.id }, /* @__PURE__ */ React.createElement("span", { className: "s-icon" }, s.icon), /* @__PURE__ */ React.createElement("div", { className: "s-info" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600 } }, "Section ", i + 1, ": ", s.name), /* @__PURE__ */ React.createElement("div", { className: "fine" }, (() => {
    const isTaskBased = s.type.includes("writing") || s.type.includes("speaking") || s.type === "pte_sw";
    const n = s.type === "listening" ? (s.parts || []).flatMap((p) => p.questions || []).length : isTaskBased ? (s.tasks || []).length || (s.items || []).length || (s.cards || []).length : getAllQuestions(s).length || (s.passages || []).flatMap((p) => p.questions || []).length;
    return n + (isTaskBased ? " tasks" : " questions");
  })())), /* @__PURE__ */ React.createElement("span", { className: "s-time" }, Math.round(s.timeSecs / 60), " min")))), /* @__PURE__ */ React.createElement("div", { className: "note", style: { marginTop: 20 } }, '\u26A0 Do not close this tab during the test. Use the "Submit section" button to move between sections. Timer auto-advances when time expires.'), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12", style: { marginTop: 24 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: onStart }, "Begin test \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onBack }, "Cancel"))));
}
function SectionIntro({ sec, sectionNum, total, onBegin, onHome }) {
  return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid var(--border)" } }, /* @__PURE__ */ React.createElement("span", { className: "brand", style: { display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--ink-1)" } }, window.LP_Logo ? /* @__PURE__ */ React.createElement(window.LP_Logo, { size: 26 }) : /* @__PURE__ */ React.createElement("span", { className: "brand-mark" }, "L"), /* @__PURE__ */ React.createElement("span", null, "LandingPrep")), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      style: { fontSize: 13, padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 },
      onClick: onHome
    },
    "\u{1F3E0} Exit to Home"
  )), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center" } }, /* @__PURE__ */ React.createElement("div", { className: "section-intro-card", style: { width: "100%", maxWidth: 560 } }, /* @__PURE__ */ React.createElement("div", { className: "sic-head" }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 32 } }, sec.icon), /* @__PURE__ */ React.createElement("h2", null, "Section ", sectionNum, " of ", total), /* @__PURE__ */ React.createElement("div", { style: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 } }, sec.name)), /* @__PURE__ */ React.createElement("div", { className: "sic-body" }, /* @__PURE__ */ React.createElement("div", { className: "sic-meta" }, /* @__PURE__ */ React.createElement("div", { className: "sic-stat" }, /* @__PURE__ */ React.createElement("div", { className: "k" }, Math.round(sec.timeSecs / 60), " min"), /* @__PURE__ */ React.createElement("div", { className: "v" }, "Time allowed")), /* @__PURE__ */ React.createElement("div", { className: "sic-stat" }, /* @__PURE__ */ React.createElement("div", { className: "k" }, getAllQuestions(sec).length || (sec.tasks ? sec.tasks.length : (sec.items || []).length) || "\u2013"), /* @__PURE__ */ React.createElement("div", { className: "v" }, sec.type.includes("writing") || sec.type.includes("speaking") || sec.type === "pte_sw" ? "Tasks" : "Questions"))), sec.type === "listening" && /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 } }, "You will hear audio for each part. Click the play button before answering questions. In the real exam, audio plays once only."), (sec.type === "reading" || sec.type === "pte_reading") && /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 } }, "Read each passage carefully and answer all questions. Manage your time across all items."), sec.type.includes("writing") && /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 } }, "Write your response in the text area provided. Word count is shown live. Check the minimum word requirement for each task."), sec.type === "pte_sw" && /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 } }, "This section mixes speaking and writing tasks. For speaking items, use the prep and record timers (enable the AI voice in AI Agents settings to hear audio). For Summarize Written Text and Write Essay, type your response \u2014 a model answer is provided for each."), sec.type.includes("speaking") && /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 } }, "Click the microphone button to record your response. You may also type your response if preferred."), sec.type === "pte_listening" && /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--ink-2)", lineHeight: 1.6 } }, "Click \u25B6 Play Audio for each item. The audio transcript will appear for practice. In the real exam, you hear actual audio once only."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: onBegin }, "Start section \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onHome }, "\u{1F3E0} Exit to Home"))))));
}
function SceneImage({ scene }) {
  const [failed, setFailed] = useState(false);
  if (!scene) return null;
  const showImg = scene.image && !failed;
  return /* @__PURE__ */ React.createElement("div", { className: "scene-panel" }, /* @__PURE__ */ React.createElement("div", { className: "scene-frame" }, showImg ? /* @__PURE__ */ React.createElement("img", { src: scene.image, alt: scene.label || "Scenario", className: "scene-img", loading: "lazy", onError: () => setFailed(true) }) : /* @__PURE__ */ React.createElement("div", { className: "scene-illus", style: { background: scene.bg || "linear-gradient(135deg,#e0f2fe,#ede9fe)" } }, /* @__PURE__ */ React.createElement("span", { className: "scene-emoji", "aria-hidden": true }, scene.emoji || "\u{1F3A7}"))), scene.label && /* @__PURE__ */ React.createElement("div", { className: "scene-cap" }, scene.label));
}
function ListeningSection({ sec, answers, setAnswer, sectionId }) {
  const [partIdx, setPartIdx] = useStateT(0);
  const [playing, setPlaying] = useStateT(false);
  const [played, setPlayed] = useStateT({});
  const [progress, setProgress] = useStateT(null);
  const abortRef = useRefT(null);
  const parts = sec.parts || [];
  const current = parts[partIdx];
  useEffectT(() => () => {
    var _a, _b;
    stopAllSpeech();
    (_b = (_a = abortRef.current) == null ? void 0 : _a.abort) == null ? void 0 : _b.call(_a);
  }, []);
  useEffectT(() => {
    ensureVoicesLoaded();
  }, []);
  useEffectT(() => {
    var _a, _b;
    const part = parts[partIdx];
    if (!part) return;
    if (abortRef.current) {
      (_b = (_a = abortRef.current).abort) == null ? void 0 : _b.call(_a);
    }
    stopAllSpeech();
    setPlaying(false);
    setProgress(null);
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(async () => {
      if (controller.signal.aborted) return;
      setPlaying(true);
      setProgress({ lineIdx: 0, total: 1 });
      const partNum = part.partNum || partIdx + 1;
      const clipLabel = part.scriptType ? part.scriptType === "conversation" ? `Conversation ${partIdx + 1}` : `Lecture ${partIdx + 1}` : `Part ${partNum}`;
      const intro = `Now beginning ${clipLabel}. You will hear the recording once only. Listen carefully and answer the questions.`;
      try {
        await speakLine(intro, { geminiVoice: "Kore", signal: controller.signal });
      } catch (e) {
      }
      if (controller.signal.aborted) {
        setPlaying(false);
        setProgress(null);
        return;
      }
      await new Promise((r) => setTimeout(r, 600));
      await playMultiVoiceScript(part.audioScript || part.script || "", {
        signal: controller.signal,
        onProgress: (p) => setProgress(p)
      });
      if (!controller.signal.aborted) {
        await new Promise((r) => setTimeout(r, 400));
        const outro = `That is the end of ${clipLabel}. You now have time to check your answers before moving on.`;
        try {
          await speakLine(outro, { geminiVoice: "Kore", signal: controller.signal });
        } catch (e) {
        }
      }
      if (!controller.signal.aborted) {
        setPlayed((prev) => ({ ...prev, [part.id]: true }));
      }
      setPlaying(false);
      setProgress(null);
    }, 900);
    return () => {
      var _a2;
      clearTimeout(timer);
      (_a2 = controller.abort) == null ? void 0 : _a2.call(controller);
    };
  }, [partIdx]);
  if (!current) return /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, "No listening parts available.");
  const handlePlay = async () => {
    var _a, _b;
    if (playing) {
      (_b = (_a = abortRef.current) == null ? void 0 : _a.abort) == null ? void 0 : _b.call(_a);
      stopAllSpeech();
      setPlaying(false);
      setProgress(null);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setPlaying(true);
    setProgress({ lineIdx: 0, total: 1 });
    const partNum = current.partNum || partIdx + 1;
    const intro = `Replaying Part ${partNum}.`;
    try {
      await speakLine(intro, { geminiVoice: "Kore", signal: controller.signal });
    } catch (e) {
    }
    if (controller.signal.aborted) {
      setPlaying(false);
      setProgress(null);
      return;
    }
    await playMultiVoiceScript(current.audioScript || current.script || "", {
      signal: controller.signal,
      onProgress: (p) => setProgress(p)
    });
    if (!controller.signal.aborted) {
      const outro = `End of Part ${partNum}.`;
      try {
        await speakLine(outro, { geminiVoice: "Kore", signal: controller.signal });
      } catch (e) {
      }
    }
    setPlaying(false);
    setProgress(null);
  };
  const goToPart = (idx) => {
    var _a, _b;
    if (abortRef.current) {
      (_b = (_a = abortRef.current).abort) == null ? void 0 : _b.call(_a);
      stopAllSpeech();
    }
    setPlaying(false);
    setPartIdx(idx);
    setProgress(null);
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "part-nav" }, parts.map((p, i) => {
    const ans = (p.questions || []).filter((q) => answers[sectionId + "_" + q.id] != null && answers[sectionId + "_" + q.id] !== "").length;
    const pillLabel = p.scriptType ? p.scriptType === "conversation" ? `Conv. ${i + 1}` : `Lecture ${i + 1}` : `Part ${p.partNum || i + 1}`;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: p.id,
        className: "part-pill" + (i === partIdx ? " active" : "") + (played[p.id] ? " done" : ""),
        onClick: () => goToPart(i)
      },
      /* @__PURE__ */ React.createElement("span", { className: "pp-label" }, pillLabel),
      /* @__PURE__ */ React.createElement("span", { className: "pp-meta" }, ans, "/", (p.questions || []).length)
    );
  })), current.scene && /* @__PURE__ */ React.createElement(SceneImage, { scene: current.scene }), /* @__PURE__ */ React.createElement("div", { className: "audio-panel" }, /* @__PURE__ */ React.createElement("div", { className: "ap-context" }, /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 600, marginBottom: 4, color: "#fff" } }, current.scriptType ? (current.scriptType === "conversation" ? "Conversation" : "Lecture") + ` ${partIdx + 1}` : `Part ${current.partNum || partIdx + 1}`), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: "rgba(255,255,255,0.85)" } }, current.context), playing && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.7)" } }, /* @__PURE__ */ React.createElement("span", { className: "audio-wave-dot" }), " ", /* @__PURE__ */ React.createElement("span", { className: "audio-wave-dot" }), " ", /* @__PURE__ */ React.createElement("span", { className: "audio-wave-dot" }), " Audio in progress \u2014 do not refresh")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, alignItems: "center" } }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "audio-btn",
      disabled: played[current.id] && !playing,
      onClick: handlePlay
    },
    playing ? "\u23F9 Stop" : played[current.id] ? "\u2713 Played" : "\u25B6 Play " + (current.scriptType ? (current.scriptType === "conversation" ? "Conversation" : "Lecture") + ` ${partIdx + 1}` : "Part " + (current.partNum || partIdx + 1))
  ))), /* @__PURE__ */ React.createElement(
    ListeningQuestions,
    {
      questions: current.questions || [],
      answers,
      setAnswer,
      sectionId,
      partIdx,
      totalParts: parts.length,
      formLayout: current.formLayout || null,
      isCelpip: sec.isCelpip,
      onPrevPart: () => goToPart(Math.max(0, partIdx - 1)),
      onNextPart: () => goToPart(Math.min(parts.length - 1, partIdx + 1))
    }
  ));
}
function mapTitleHash(mapTitle) {
  let h = 0;
  for (let i = 0; i < (mapTitle || "").length; i++) h = h * 31 + (mapTitle.charCodeAt(i) || 0) & 65535;
  return h;
}
function mapLayoutIndex(mapTitle) {
  return mapTitleHash(mapTitle) % 4;
}
const MAP_ACCENTS = ["#1d4ed8", "#0f766e", "#166534", "#b45309", "#9333ea", "#be123c", "#0e7490", "#4d7c0f", "#7c3aed", "#c2410c"];
function mapAccent(mapTitle, fallback) {
  if (!mapTitle) return fallback;
  return MAP_ACCENTS[(mapTitleHash(mapTitle) >> 3) % MAP_ACCENTS.length] || fallback;
}
const MAP_LAYOUTS = [
  // Layout 0: Classic rectangular building with cross-corridors (community centre style)
  {
    rooms: [
      { ltr: "A", x: 60, y: 280, w: 110, h: 70 },
      { ltr: "B", x: 200, y: 280, w: 120, h: 70 },
      { ltr: "C", x: 60, y: 180, w: 110, h: 80 },
      { ltr: "D", x: 200, y: 180, w: 120, h: 80 },
      { ltr: "E", x: 350, y: 180, w: 100, h: 80 },
      { ltr: "F", x: 350, y: 280, w: 100, h: 70 },
      { ltr: "G", x: 60, y: 70, w: 110, h: 90 },
      { ltr: "H", x: 200, y: 70, w: 120, h: 90 },
      { ltr: "I", x: 350, y: 70, w: 100, h: 90 },
      { ltr: "J", x: 470, y: 180, w: 80, h: 170 }
    ],
    corridors: [
      /* @__PURE__ */ React.createElement("rect", { key: "h1", x: "10", y: "165", width: "540", height: "12", fill: "#c8d4e4" }),
      /* @__PURE__ */ React.createElement("rect", { key: "v1", x: "168", y: "10", width: "12", height: "340", fill: "#c8d4e4" }),
      /* @__PURE__ */ React.createElement("rect", { key: "v2", x: "333", y: "10", width: "12", height: "340", fill: "#c8d4e4" })
    ],
    outline: /* @__PURE__ */ React.createElement("rect", { x: "10", y: "10", width: "540", height: "340", fill: "#eef2f7", stroke: "#7890b0", strokeWidth: "2.5", rx: "5" }),
    entrance: { x: 215, y: 342, w: 130, label: "MAIN ENTRANCE" },
    accent: "#1d4ed8"
  },
  // Layout 1: L-shaped building (university campus / library style)
  {
    rooms: [
      { ltr: "A", x: 30, y: 260, w: 120, h: 90 },
      { ltr: "B", x: 170, y: 260, w: 120, h: 90 },
      { ltr: "C", x: 30, y: 160, w: 120, h: 80 },
      { ltr: "D", x: 170, y: 160, w: 120, h: 80 },
      { ltr: "E", x: 310, y: 30, w: 110, h: 90 },
      { ltr: "F", x: 430, y: 30, w: 110, h: 90 },
      { ltr: "G", x: 30, y: 50, w: 120, h: 90 },
      { ltr: "H", x: 170, y: 50, w: 120, h: 90 },
      { ltr: "I", x: 310, y: 140, w: 110, h: 90 },
      { ltr: "J", x: 430, y: 140, w: 110, h: 210 }
    ],
    corridors: [
      /* @__PURE__ */ React.createElement("rect", { key: "h1", x: "10", y: "148", width: "295", height: "10", fill: "#c8d4e4" }),
      /* @__PURE__ */ React.createElement("rect", { key: "v1", x: "148", y: "10", width: "10", height: "340", fill: "#c8d4e4" }),
      /* @__PURE__ */ React.createElement("rect", { key: "h2", x: "295", y: "10", width: "10", height: "340", fill: "#c8d4e4" })
    ],
    outline: /* @__PURE__ */ React.createElement("path", { d: "M10,10 H550 V240 H305 V350 H10 Z", fill: "#eef3fb", stroke: "#7890b0", strokeWidth: "2.5" }),
    entrance: { x: 60, y: 342, w: 130, label: "ENTRANCE" },
    accent: "#0f766e"
  },
  // Layout 2: Open campus map (nature reserve / outdoor style)
  {
    rooms: [
      { ltr: "A", x: 50, y: 280, w: 105, h: 70, rx: 8 },
      { ltr: "B", x: 190, y: 280, w: 105, h: 70, rx: 8 },
      { ltr: "C", x: 330, y: 280, w: 105, h: 70, rx: 8 },
      { ltr: "D", x: 50, y: 180, w: 105, h: 80, rx: 8 },
      { ltr: "E", x: 190, y: 180, w: 105, h: 80, rx: 8 },
      { ltr: "F", x: 330, y: 180, w: 105, h: 80, rx: 8 },
      { ltr: "G", x: 50, y: 65, w: 105, h: 95, rx: 8 },
      { ltr: "H", x: 190, y: 65, w: 105, h: 95, rx: 8 },
      { ltr: "I", x: 330, y: 65, w: 105, h: 95, rx: 8 },
      { ltr: "J", x: 460, y: 65, w: 85, h: 285, rx: 8 }
    ],
    corridors: [
      /* @__PURE__ */ React.createElement("rect", { key: "h1", x: "10", y: "168", width: "440", height: "10", fill: "#b7d8b0" }),
      /* @__PURE__ */ React.createElement("rect", { key: "v1", x: "155", y: "10", width: "10", height: "350", fill: "#b7d8b0" }),
      /* @__PURE__ */ React.createElement("rect", { key: "v2", x: "295", y: "10", width: "10", height: "350", fill: "#b7d8b0" })
    ],
    outline: /* @__PURE__ */ React.createElement("rect", { x: "10", y: "10", width: "540", height: "340", fill: "#f0f8ee", stroke: "#5a9e6f", strokeWidth: "2.5", rx: "10" }),
    entrance: { x: 60, y: 342, w: 130, label: "VISITOR ENTRANCE" },
    accent: "#166534"
  },
  // Layout 3: Two-wing building (hospital / school style)
  {
    rooms: [
      { ltr: "A", x: 25, y: 260, w: 105, h: 80 },
      { ltr: "B", x: 140, y: 260, w: 105, h: 80 },
      { ltr: "C", x: 25, y: 165, w: 105, h: 80 },
      { ltr: "D", x: 140, y: 165, w: 105, h: 80 },
      { ltr: "E", x: 25, y: 50, w: 105, h: 100 },
      { ltr: "F", x: 140, y: 50, w: 105, h: 100 },
      { ltr: "G", x: 310, y: 260, w: 105, h: 80 },
      { ltr: "H", x: 425, y: 260, w: 115, h: 80 },
      { ltr: "I", x: 310, y: 165, w: 105, h: 80 },
      { ltr: "J", x: 425, y: 50, w: 115, h: 195 }
    ],
    corridors: [
      /* @__PURE__ */ React.createElement("rect", { key: "h1", x: "10", y: "152", width: "235", height: "10", fill: "#d4c8e4" }),
      /* @__PURE__ */ React.createElement("rect", { key: "h2", x: "295", y: "152", width: "255", height: "10", fill: "#d4c8e4" }),
      /* @__PURE__ */ React.createElement("rect", { key: "center", x: "248", y: "10", width: "50", height: "340", fill: "#ebe5f5" })
    ],
    outline: /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("rect", { x: "10", y: "10", width: "240", height: "340", fill: "#f5f0ff", stroke: "#8b7ac0", strokeWidth: "2.5", rx: "4" }), /* @__PURE__ */ React.createElement("rect", { x: "295", y: "10", width: "255", height: "340", fill: "#f5f0ff", stroke: "#8b7ac0", strokeWidth: "2.5", rx: "4" })),
    entrance: { x: 60, y: 342, w: 130, label: "MAIN ENTRANCE" },
    accent: "#6d28d9"
  }
];
const SCENE_ROOMS = [
  { ltr: "A", x: 46, y: 268 },
  { ltr: "B", x: 176, y: 282 },
  { ltr: "C", x: 320, y: 272 },
  { ltr: "D", x: 54, y: 170 },
  { ltr: "E", x: 210, y: 160 },
  { ltr: "F", x: 360, y: 176 },
  { ltr: "G", x: 70, y: 64 },
  { ltr: "H", x: 226, y: 58 },
  { ltr: "I", x: 372, y: 66 },
  { ltr: "J", x: 464, y: 182 }
];
const MW = 86, MH = 58;
function sceneRooms() {
  return SCENE_ROOMS.map((r) => ({ ...r, w: MW, h: MH }));
}
function treeCluster(cx, cy, c1, c2, key) {
  return /* @__PURE__ */ React.createElement("g", { key }, /* @__PURE__ */ React.createElement("circle", { cx, cy, r: "15", fill: c1 }), /* @__PURE__ */ React.createElement("circle", { cx: cx - 12, cy: cy + 6, r: "11", fill: c2 }), /* @__PURE__ */ React.createElement("circle", { cx: cx + 12, cy: cy + 6, r: "11", fill: c2 }));
}
const SCENES = {
  campus: {
    accent: "#2e7d32",
    entrance: { x: 60, y: 350, w: 150, label: "MAIN GATE" },
    bg: () => [
      /* @__PURE__ */ React.createElement("rect", { key: "g", x: "8", y: "8", width: "544", height: "364", rx: "12", fill: "#e9f5e6", stroke: "#9bbf93", strokeWidth: "2.5" }),
      /* @__PURE__ */ React.createElement("path", { key: "p1", d: "M40 360 Q160 250 300 250 T545 235", fill: "none", stroke: "#e2dcce", strokeWidth: "16", strokeLinecap: "round" }),
      /* @__PURE__ */ React.createElement("rect", { key: "p2", x: "150", y: "20", width: "16", height: "340", fill: "#e2dcce" }),
      /* @__PURE__ */ React.createElement("rect", { key: "p3", x: "300", y: "20", width: "16", height: "340", fill: "#e2dcce" }),
      /* @__PURE__ */ React.createElement("ellipse", { key: "pond", cx: "118", cy: "318", rx: "52", ry: "26", fill: "#bfe3f0", stroke: "#86c5dc", strokeWidth: "1.5" }),
      treeCluster(440, 320, "#3f9b54", "#2f8a48", "t1"),
      treeCluster(500, 300, "#3f9b54", "#2f8a48", "t2"),
      treeCluster(28, 110, "#3f9b54", "#2f8a48", "t3")
    ]
  },
  park: {
    accent: "#166534",
    entrance: { x: 40, y: 350, w: 140, label: "VISITOR ENTRANCE" },
    bg: () => [
      /* @__PURE__ */ React.createElement("rect", { key: "g", x: "8", y: "8", width: "544", height: "364", rx: "16", fill: "#eef8ea", stroke: "#7bbf6f", strokeWidth: "2.5" }),
      /* @__PURE__ */ React.createElement("path", { key: "lake", d: "M360 250 q60 -40 120 0 q30 50 -20 80 q-70 30 -110 -10 q-30 -40 10 -70 Z", fill: "#bfe3f0", stroke: "#86c5dc", strokeWidth: "1.5" }),
      /* @__PURE__ */ React.createElement("path", { key: "trail", d: "M40 350 C120 300 120 200 220 180 S420 140 520 60", fill: "none", stroke: "#e8dcc2", strokeWidth: "12", strokeLinecap: "round", strokeDasharray: "2 0" }),
      treeCluster(80, 120, "#4caf50", "#388e3c", "t1"),
      treeCluster(150, 80, "#4caf50", "#388e3c", "t2"),
      treeCluster(300, 100, "#4caf50", "#388e3c", "t3"),
      treeCluster(500, 320, "#4caf50", "#388e3c", "t4"),
      treeCluster(40, 300, "#4caf50", "#388e3c", "t5")
    ]
  },
  station: {
    accent: "#1d4ed8",
    entrance: { x: 220, y: 350, w: 130, label: "STATION ENTRANCE" },
    bg: () => [
      /* @__PURE__ */ React.createElement("rect", { key: "b", x: "8", y: "8", width: "544", height: "364", rx: "6", fill: "#eef1f6", stroke: "#94a3b8", strokeWidth: "2.5" }),
      /* @__PURE__ */ React.createElement("rect", { key: "conc", x: "20", y: "300", width: "520", height: "56", fill: "#dbe2ea" }),
      /* @__PURE__ */ React.createElement("text", { key: "cl", x: "280", y: "332", textAnchor: "middle", fontSize: "11", fill: "#64748b", fontWeight: "bold" }, "CONCOURSE"),
      ...[110, 190, 270].map((y, i) => /* @__PURE__ */ React.createElement("g", { key: "pl" + i }, /* @__PURE__ */ React.createElement("rect", { x: "20", y, width: "520", height: "34", fill: "#cfd8e3" }), /* @__PURE__ */ React.createElement("line", { x1: "24", y1: y + 17, x2: "536", y2: y + 17, stroke: "#8a97a8", strokeWidth: "2", strokeDasharray: "10 6" }), /* @__PURE__ */ React.createElement("text", { x: "30", y: y + 21, fontSize: "10", fill: "#475569", fontWeight: "bold" }, "Platform " + (i + 1))))
    ]
  },
  mall: {
    accent: "#9333ea",
    entrance: { x: 215, y: 350, w: 130, label: "MALL ENTRANCE" },
    bg: () => [
      /* @__PURE__ */ React.createElement("rect", { key: "b", x: "8", y: "8", width: "544", height: "364", rx: "8", fill: "#f4eefb", stroke: "#b794d6", strokeWidth: "2.5" }),
      /* @__PURE__ */ React.createElement("rect", { key: "atrium", x: "200", y: "120", width: "160", height: "150", rx: "10", fill: "#fff", stroke: "#d6bdec", strokeWidth: "2" }),
      /* @__PURE__ */ React.createElement("text", { key: "al", x: "280", y: "200", textAnchor: "middle", fontSize: "12", fill: "#9333ea", fontWeight: "bold" }, "ATRIUM"),
      /* @__PURE__ */ React.createElement("rect", { key: "cor1", x: "20", y: "190", width: "180", height: "14", fill: "#e8dcf5" }),
      /* @__PURE__ */ React.createElement("rect", { key: "cor2", x: "360", y: "190", width: "180", height: "14", fill: "#e8dcf5" })
    ]
  },
  sports: {
    accent: "#b45309",
    entrance: { x: 40, y: 350, w: 130, label: "ENTRANCE" },
    bg: () => [
      /* @__PURE__ */ React.createElement("rect", { key: "b", x: "8", y: "8", width: "544", height: "364", rx: "10", fill: "#eafaf0", stroke: "#7cc99a", strokeWidth: "2.5" }),
      /* @__PURE__ */ React.createElement("ellipse", { key: "trackO", cx: "280", cy: "195", rx: "180", ry: "92", fill: "none", stroke: "#e05a3a", strokeWidth: "14" }),
      /* @__PURE__ */ React.createElement("ellipse", { key: "field", cx: "280", cy: "195", rx: "150", ry: "66", fill: "#a9dcb6" }),
      /* @__PURE__ */ React.createElement("line", { key: "hl", x1: "280", y1: "129", x2: "280", y2: "261", stroke: "#fff", strokeWidth: "2" }),
      /* @__PURE__ */ React.createElement("circle", { key: "cc", cx: "280", cy: "195", r: "22", fill: "none", stroke: "#fff", strokeWidth: "2" }),
      /* @__PURE__ */ React.createElement("rect", { key: "pool", x: "40", y: "40", width: "80", height: "40", rx: "4", fill: "#7fd3ec", stroke: "#4ba6c4", strokeWidth: "1.5" }),
      /* @__PURE__ */ React.createElement("text", { key: "pl", x: "80", y: "64", textAnchor: "middle", fontSize: "9", fill: "#0e6c8a", fontWeight: "bold" }, "POOL")
    ]
  }
};
function pickScene(title) {
  const t = (title || "").toLowerCase();
  if (/sport|stadium|leisure|fitness|athletic|arena|aquatic|recreation/.test(t)) return "sports";
  if (/nature|reserve|\bpark\b|garden|botanic|woodland|trail|wildlife/.test(t)) return "park";
  if (/station|railway|airport|terminal|\bbus\b|transport|metro|harbour|port\b/.test(t)) return "station";
  if (/shop|mall|complex|market|retail|plaza|outlet/.test(t)) return "mall";
  if (/universit|college|campus|academ|school|institute/.test(t)) return "campus";
  return "indoor";
}
function MapFloorPlan({ mapKey, mapTitle }) {
  const letters = Object.keys(mapKey || {});
  if (!letters.length) return null;
  const sceneKey = pickScene(mapTitle);
  let rooms, entrance, bg, accent;
  if (sceneKey === "indoor") {
    const layout = MAP_LAYOUTS[mapLayoutIndex(mapTitle)];
    rooms = layout.rooms;
    entrance = layout.entrance;
    accent = mapAccent(mapTitle, layout.accent);
    bg = /* @__PURE__ */ React.createElement(React.Fragment, null, layout.outline, layout.corridors);
  } else {
    const s = SCENES[sceneKey];
    rooms = sceneRooms();
    entrance = s.entrance;
    accent = mapAccent(mapTitle, s.accent);
    bg = s.bg(accent);
  }
  const visiblePos = rooms.filter((p) => letters.includes(p.ltr));
  return /* @__PURE__ */ React.createElement("div", { className: "map-floor-plan" }, mapTitle && /* @__PURE__ */ React.createElement("div", { className: "map-floor-title" }, mapTitle), /* @__PURE__ */ React.createElement("div", { className: "map-floor-note" }, "\u{1F4CD} The map shows letter markers A\u2013J. Listen to the recording to match each question to the correct letter."), /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 560 380", className: "map-floor-svg", role: "img", "aria-label": mapTitle || "Floor plan" }, bg, /* @__PURE__ */ React.createElement("rect", { x: entrance.x, y: entrance.y, width: entrance.w, height: 12, fill: accent, rx: "2" }), /* @__PURE__ */ React.createElement("text", { x: entrance.x + entrance.w / 2, y: entrance.y + 9, textAnchor: "middle", fontSize: "9", fill: "white", fontWeight: "bold" }, entrance.label), visiblePos.map((p) => /* @__PURE__ */ React.createElement("g", { key: p.ltr }, /* @__PURE__ */ React.createElement(
    "rect",
    {
      x: p.x,
      y: p.y,
      width: p.w,
      height: p.h,
      fill: "white",
      stroke: "#8aa0c0",
      strokeWidth: "1.5",
      rx: p.rx || 6,
      opacity: "0.97"
    }
  ), /* @__PURE__ */ React.createElement("circle", { cx: p.x + 18, cy: p.y + 18, r: "13", fill: accent }), /* @__PURE__ */ React.createElement(
    "text",
    {
      x: p.x + 18,
      y: p.y + 23,
      textAnchor: "middle",
      fontSize: "13",
      fontWeight: "bold",
      fill: "white"
    },
    p.ltr
  ))), /* @__PURE__ */ React.createElement("text", { x: "530", y: "35", textAnchor: "middle", fontSize: "20", fill: "#9ca3af" }, "\u2191"), /* @__PURE__ */ React.createElement("text", { x: "530", y: "50", textAnchor: "middle", fontSize: "10", fill: "#9ca3af" }, "N")), /* @__PURE__ */ React.createElement("div", { className: "map-floor-wordbank" }, /* @__PURE__ */ React.createElement("div", { className: "map-wordbank-label" }, "Word bank (A\u2013J):"), /* @__PURE__ */ React.createElement("div", { className: "map-wordbank-items" }, letters.map((ltr) => /* @__PURE__ */ React.createElement("span", { key: ltr, className: "map-wordbank-chip" }, /* @__PURE__ */ React.createElement("span", { className: "map-wordbank-letter", style: { background: accent } }, ltr), /* @__PURE__ */ React.createElement("span", { className: "map-wordbank-name" }, mapKey[ltr]))))));
}
function FormTable({ formLayout, questions, answers, setAnswer, sectionId, instrLabel }) {
  if (!formLayout) return null;
  const { title, example, rows } = formLayout;
  const byNum = {};
  (questions || []).forEach((q) => {
    if (q.num) byNum[q.num] = q;
  });
  const NumCircle = ({ n }) => /* @__PURE__ */ React.createElement("span", { className: "p1-num-circle" }, n);
  const BlankInput = ({ q }) => {
    if (!q) return null;
    const val = answers[sectionId + "_" + q.id] || "";
    return /* @__PURE__ */ React.createElement(
      "input",
      {
        className: "p1-blank-input",
        type: "text",
        value: val,
        onChange: (e) => setAnswer(sectionId + "_" + q.id, e.target.value),
        placeholder: "",
        "aria-label": "Question " + q.num
      }
    );
  };
  return /* @__PURE__ */ React.createElement("div", { className: "p1-form-wrap" }, instrLabel && /* @__PURE__ */ React.createElement("div", { className: "p1-instr" }, instrLabel), /* @__PURE__ */ React.createElement("div", { className: "p1-form-title" }, title), /* @__PURE__ */ React.createElement("table", { className: "p1-form-table" }, /* @__PURE__ */ React.createElement("tbody", null, example && /* @__PURE__ */ React.createElement("tr", { className: "p1-row-example" }, /* @__PURE__ */ React.createElement("td", { className: "p1-td-label" }, example.label), /* @__PURE__ */ React.createElement("td", { className: "p1-td-answer" }, /* @__PURE__ */ React.createElement("span", { className: "p1-example-tag" }, "Example:"), /* @__PURE__ */ React.createElement("em", { className: "p1-example-val" }, example.content))), rows.map((row, ri) => {
    if (row.type === "prefilled") {
      return /* @__PURE__ */ React.createElement("tr", { key: ri, className: "p1-row-prefilled" }, /* @__PURE__ */ React.createElement("td", { className: "p1-td-label" }, row.label), /* @__PURE__ */ React.createElement("td", { className: "p1-td-answer p1-prefilled" }, row.content));
    }
    if (row.type === "blank") {
      const q = byNum[row.num];
      if (row.labelBlank) {
        return /* @__PURE__ */ React.createElement("tr", { key: ri, className: "p1-row-blank" }, /* @__PURE__ */ React.createElement("td", { className: "p1-td-label" }, /* @__PURE__ */ React.createElement("span", { className: "p1-cell-inline" }, /* @__PURE__ */ React.createElement(NumCircle, { n: row.num }), /* @__PURE__ */ React.createElement(BlankInput, { q }), row.labelSuffix && /* @__PURE__ */ React.createElement("span", { className: "p1-ctx" }, row.labelSuffix))), /* @__PURE__ */ React.createElement("td", { className: "p1-td-answer p1-prefilled" }, row.rightContent || ""));
      }
      return /* @__PURE__ */ React.createElement("tr", { key: ri, className: "p1-row-blank" }, /* @__PURE__ */ React.createElement("td", { className: "p1-td-label" }, row.label), /* @__PURE__ */ React.createElement("td", { className: "p1-td-answer" }, /* @__PURE__ */ React.createElement("span", { className: "p1-cell-inline" }, row.prefix && /* @__PURE__ */ React.createElement("span", { className: "p1-ctx" }, row.prefix), /* @__PURE__ */ React.createElement(NumCircle, { n: row.num }), /* @__PURE__ */ React.createElement(BlankInput, { q }), row.suffix && /* @__PURE__ */ React.createElement("span", { className: "p1-ctx" }, row.suffix))));
    }
    return null;
  }))));
}
function groupQuestions(questions) {
  const instructionOf = (q) => {
    if (q.type === "form_completion" || q.type === "table_completion") {
      const limit = q.limitText || (q.wordLimit ? `NO MORE THAN ${["", "ONE", "TWO", "THREE"][q.wordLimit] || q.wordLimit} WORD${q.wordLimit > 1 ? "S" : ""}${q.allowNumber ? " AND/OR A NUMBER" : ""}` : "NO MORE THAN THREE WORDS AND/OR A NUMBER");
      return { kind: "form", label: `Complete the ${q.type === "table_completion" ? "table" : "form"} with ${limit} for each answer.`, title: q.title };
    }
    if (q.type === "mcq_multi") {
      const n = q.selectCount || (Array.isArray(q.answer) ? q.answer.length : 2);
      return { kind: "multi", label: `Mark ${["", "ONE", "TWO", "THREE", "FOUR", "FIVE"][n] || n} letter${n > 1 ? "s" : ""} that represent the correct answer${n > 1 ? "s" : ""}.` };
    }
    if (q.type === "sent_fill") return { kind: "sent_fill", label: "Complete each sentence with NO MORE THAN THREE WORDS. Write your answers in the boxes." };
    if (q.type === "fill" && q.wordLimit) {
      const limit = `NO MORE THAN ${["", "ONE", "TWO", "THREE"][q.wordLimit] || q.wordLimit} WORD${q.wordLimit > 1 ? "S" : ""}${q.allowNumber ? " AND/OR A NUMBER" : ""}`;
      return { kind: "fill", label: `Fill in the blanks with ${limit} for each answer.` };
    }
    if (q.type === "tfng") return { kind: "tfng", label: "Do the following statements agree with the information given? Write TRUE / FALSE / NOT GIVEN." };
    if (q.type === "yng") return { kind: "yng", label: "Do the following statements agree with the writer's views? Write YES / NO / NOT GIVEN." };
    if (q.type === "match_heading") return { kind: "match", label: q.matchHeadings ? "Match each section with the most suitable heading from the list below." : "Match each item with the correct option." };
    if (q.type === "map_label") return { kind: "map_label", label: q.instructions || "Label the map below. Write the correct letter, A\u2013J, next to questions.", mapKey: q.mapKey, mapTitle: q.mapTitle };
    if (q.type === "match_cat") return { kind: "match_cat", label: q.instructions || "Write the correct letter, A, B or C.", categoryOptions: q.categoryOptions };
    if (q.type === "mcq") return { kind: "mcq", label: "Choose the correct letter, A, B, C or D." };
    return { kind: q.type, label: null };
  };
  const groups = [];
  let curr = null;
  questions.forEach((q, idx) => {
    const ins = instructionOf(q);
    const key = ins.kind + "|" + (ins.label || "") + "|" + (ins.title || "");
    if (curr && curr.key === key) {
      curr.questions.push(q);
      curr.endNum = q.num || curr.startNum + curr.questions.length - 1;
    } else {
      curr = { key, instruction: ins, questions: [q], startNum: q.num || idx + 1, endNum: q.num || idx + 1 };
      groups.push(curr);
    }
  });
  return groups;
}
function ListeningQuestions({ questions, answers, setAnswer, sectionId, partIdx, totalParts, formLayout, onPrevPart, onNextPart, isCelpip }) {
  if (!questions.length) return /* @__PURE__ */ React.createElement("div", { style: { padding: 20, color: "var(--ink-3)" } }, "No questions in this part.");
  const total = questions.length;
  const answeredCount = questions.filter((qq) => answers[sectionId + "_" + qq.id] != null && answers[sectionId + "_" + qq.id] !== "").length;
  const groups = groupQuestions(questions);
  return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18, padding: "10px 14px", background: "var(--tint)", borderRadius: 10, fontSize: 13, color: "var(--ink-3)" } }, "Part ", partIdx + 1, " of ", totalParts, " \xB7 ", answeredCount, " of ", total, " questions answered"), isCelpip ? /* @__PURE__ */ React.createElement("div", { className: "q-group" }, /* @__PURE__ */ React.createElement("div", { className: "q-section-header" }, /* @__PURE__ */ React.createElement("div", { className: "qsh-instruction" }, "Listen to the audio above, then choose the best answer for each question.")), questions.map((q, qi) => /* @__PURE__ */ React.createElement(
    QuestionCard,
    {
      key: q.id,
      q,
      qi,
      sectionId,
      answer: answers[sectionId + "_" + q.id],
      onAnswer: (val) => setAnswer(sectionId + "_" + q.id, val),
      hideInstruction: true
    }
  ))) : formLayout ? /* @__PURE__ */ React.createElement("div", { className: "q-group" }, /* @__PURE__ */ React.createElement("div", { className: "q-section-header" }, /* @__PURE__ */ React.createElement("div", { className: "qsh-range" }, "Questions 1\u201310"), /* @__PURE__ */ React.createElement("div", { className: "qsh-instruction" }, "Complete the form below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.")), /* @__PURE__ */ React.createElement(
    FormTable,
    {
      formLayout,
      questions,
      answers,
      setAnswer,
      sectionId
    }
  )) : groups.map((g, gi) => /* @__PURE__ */ React.createElement("div", { key: gi, className: "q-group" }, g.instruction.label && /* @__PURE__ */ React.createElement("div", { className: "q-section-header" }, /* @__PURE__ */ React.createElement("div", { className: "qsh-range" }, "Questions ", g.startNum, g.endNum !== g.startNum ? `\u2013${g.endNum}` : ""), /* @__PURE__ */ React.createElement("div", { className: "qsh-instruction" }, g.instruction.label), g.instruction.title && /* @__PURE__ */ React.createElement("div", { className: "qsh-title" }, g.instruction.title), g.instruction.kind === "map_label" && g.instruction.mapKey && /* @__PURE__ */ React.createElement(MapFloorPlan, { mapKey: g.instruction.mapKey, mapTitle: g.instruction.mapTitle }), g.instruction.kind === "match_cat" && g.instruction.categoryOptions && /* @__PURE__ */ React.createElement("div", { className: "q-match-cat-group" }, g.instruction.categoryOptions.map((opt, oi) => /* @__PURE__ */ React.createElement("div", { key: oi, className: "q-match-cat-opt" }, opt)))), g.questions.map((q, qi) => /* @__PURE__ */ React.createElement(
    QuestionCard,
    {
      key: q.id,
      q,
      qi,
      sectionId,
      answer: answers[sectionId + "_" + q.id],
      onAnswer: (val) => setAnswer(sectionId + "_" + q.id, val),
      hideInstruction: true
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "q-pager", style: { marginTop: 24 } }, /* @__PURE__ */ React.createElement("button", { className: "btn", disabled: partIdx === 0, onClick: onPrevPart }, "\u2190 Previous part"), /* @__PURE__ */ React.createElement("span", { className: "qp-counter" }, "Part ", partIdx + 1, " of ", totalParts, " \xB7 ", answeredCount, "/", total, " answered"), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", disabled: partIdx >= totalParts - 1, onClick: onNextPart }, "Next part \u2192")));
}
function ReadingSection({ sec, answers, setAnswer, sectionId }) {
  const flat = [];
  const passages = sec.passages || [];
  const [pIdx, setPIdx] = useStateT(0);
  const [qIdxInPassage, setQIdxInPassage] = useStateT(0);
  useEffectT(() => {
    setPIdx(0);
    setQIdxInPassage(0);
  }, [sec.id]);
  const currentPassage = passages[pIdx];
  if (!currentPassage) return /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, "No reading passages available.");
  const passageQs = currentPassage.questions || [];
  const answeredInPassage = passageQs.filter((qq) => answers[sectionId + "_" + qq.id] != null && answers[sectionId + "_" + qq.id] !== "").length;
  const startNum = passages.slice(0, pIdx).reduce((s, p) => s + (p.questions || []).length, 0);
  const isPaginated = !!sec.paginated;
  return /* @__PURE__ */ React.createElement("div", null, passages.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "part-nav" }, passages.map((p, i) => {
    const ans = (p.questions || []).filter((q) => answers[sectionId + "_" + q.id] != null && answers[sectionId + "_" + q.id] !== "").length;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: p.id,
        className: "part-pill" + (i === pIdx ? " active" : ""),
        onClick: () => setPIdx(i)
      },
      /* @__PURE__ */ React.createElement("span", { className: "pp-label" }, "Passage ", i + 1),
      /* @__PURE__ */ React.createElement("span", { className: "pp-meta" }, ans, "/", (p.questions || []).length)
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "reading-split" }, /* @__PURE__ */ React.createElement("div", { className: "reading-passage-col" }, currentPassage.text ? /* @__PURE__ */ React.createElement("div", { className: "passage-block sticky" }, currentPassage.title && /* @__PURE__ */ React.createElement("h3", null, currentPassage.title), currentPassage.text.trim().split(/\n\n+/).map((para, i) => /* @__PURE__ */ React.createElement("p", { key: i, style: { margin: "0 0 14px" } }, para.trim())), /* @__PURE__ */ React.createElement("div", { className: "reading-jump-link" }, /* @__PURE__ */ React.createElement("a", { href: "#rq-col-" + (currentPassage.id || "0"), onClick: (e) => {
    var _a;
    e.preventDefault();
    (_a = document.getElementById("rq-col-" + (currentPassage.id || "0"))) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth", block: "start" });
  } }, "Jump to questions \u2193"))) : currentPassage.title ? /* @__PURE__ */ React.createElement("div", { className: "passage-block sticky" }, /* @__PURE__ */ React.createElement("h3", null, currentPassage.title), /* @__PURE__ */ React.createElement("p", { style: { fontStyle: "italic", color: "var(--ink-3)" } }, "Read each question carefully. Some questions include their own context.")) : null), /* @__PURE__ */ React.createElement("div", { className: "reading-questions-col", id: "rq-col-" + (currentPassage.id || "0") }, isPaginated ? (
    // GMAT/GRE: one question per page with Prev/Next/Back-to-list
    (() => {
      const q = passageQs[qIdxInPassage];
      if (!q) return /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, "No question.");
      const totalQ = passageQs.length;
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "q-section-header" }, /* @__PURE__ */ React.createElement("div", { className: "qsh-range" }, "Question ", qIdxInPassage + 1, " of ", totalQ), /* @__PURE__ */ React.createElement("div", { className: "qsh-instruction" }, "Choose the best answer. You can return to previous questions.")), /* @__PURE__ */ React.createElement(
        QuestionCard,
        {
          q,
          qi: startNum + qIdxInPassage,
          sectionId,
          answer: answers[sectionId + "_" + q.id],
          onAnswer: (val) => setAnswer(sectionId + "_" + q.id, val),
          hideInstruction: true
        }
      ), /* @__PURE__ */ React.createElement("div", { className: "q-pager", style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn",
          disabled: qIdxInPassage === 0,
          onClick: () => setQIdxInPassage((i) => Math.max(0, i - 1))
        },
        "\u2190 Previous question"
      ), /* @__PURE__ */ React.createElement("span", { className: "qp-counter" }, "Q ", qIdxInPassage + 1, " / ", totalQ, " \xB7 ", answeredInPassage, "/", totalQ, " answered"), /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "btn btn-primary",
          disabled: qIdxInPassage >= totalQ - 1,
          onClick: () => setQIdxInPassage((i) => Math.min(totalQ - 1, i + 1))
        },
        "Next question \u2192"
      )), /* @__PURE__ */ React.createElement("div", { className: "qpalette", style: { marginTop: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "qp-label" }, "Jump to question"), /* @__PURE__ */ React.createElement("div", { className: "qp-dots" }, passageQs.map((qq, i) => {
        const ansd = answers[sectionId + "_" + qq.id] != null && answers[sectionId + "_" + qq.id] !== "";
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: qq.id || i,
            className: "qp-dot" + (i === qIdxInPassage ? " current" : "") + (ansd ? " answered" : ""),
            onClick: () => setQIdxInPassage(i)
          },
          i + 1
        );
      }))));
    })()
  ) : groupQuestions(passageQs).map((g, gi) => /* @__PURE__ */ React.createElement("div", { key: gi, className: "q-group" }, g.instruction.label && /* @__PURE__ */ React.createElement("div", { className: "q-section-header" }, /* @__PURE__ */ React.createElement("div", { className: "qsh-range" }, "Questions ", g.startNum, g.endNum !== g.startNum ? `\u2013${g.endNum}` : ""), /* @__PURE__ */ React.createElement("div", { className: "qsh-instruction" }, g.instruction.label), g.instruction.title && /* @__PURE__ */ React.createElement("div", { className: "qsh-title" }, g.instruction.title)), g.questions.map((q, qi) => /* @__PURE__ */ React.createElement(
    QuestionCard,
    {
      key: q.id,
      q,
      qi: startNum + passageQs.indexOf(q),
      sectionId,
      answer: answers[sectionId + "_" + q.id],
      onAnswer: (val) => setAnswer(sectionId + "_" + q.id, val),
      hideInstruction: true
    }
  )))), passages.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "q-pager", style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("button", { className: "btn", disabled: pIdx === 0, onClick: () => setPIdx(Math.max(0, pIdx - 1)) }, "\u2190 Previous passage"), /* @__PURE__ */ React.createElement("span", { className: "qp-counter" }, "Passage ", pIdx + 1, " of ", passages.length, " \xB7 ", answeredInPassage, "/", passageQs.length), /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", disabled: pIdx >= passages.length - 1, onClick: () => setPIdx(Math.min(passages.length - 1, pIdx + 1)) }, "Next passage \u2192")))));
}
function QuestionPalette({ items, qIdx, setQIdx, answers, sectionId, groupBy }) {
  return /* @__PURE__ */ React.createElement("div", { className: "qpalette" }, /* @__PURE__ */ React.createElement("div", { className: "qp-label" }, "Questions"), /* @__PURE__ */ React.createElement("div", { className: "qp-dots" }, items.map((f, i) => {
    const ansd = answers[sectionId + "_" + f.q.id] != null && answers[sectionId + "_" + f.q.id] !== "";
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: f.q.id || i,
        className: "qp-dot" + (i === qIdx ? " current" : "") + (ansd ? " answered" : ""),
        title: `Question ${i + 1}${groupBy ? " \xB7 " + groupBy(f) : ""}`,
        onClick: () => setQIdx(i)
      },
      i + 1
    );
  })));
}
function QPager({ qIdx, total, setQIdx, answeredCount }) {
  return /* @__PURE__ */ React.createElement("div", { className: "q-pager" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn",
      disabled: qIdx === 0,
      onClick: () => setQIdx(Math.max(0, qIdx - 1))
    },
    "\u2190 Previous"
  ), /* @__PURE__ */ React.createElement("span", { className: "qp-counter" }, "Question ", qIdx + 1, " of ", total, " ", /* @__PURE__ */ React.createElement("span", { className: "qp-ans-meta" }, "\xB7 ", answeredCount, " answered")), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary",
      disabled: qIdx >= total - 1,
      onClick: () => setQIdx(Math.min(total - 1, qIdx + 1))
    },
    "Next \u2192"
  ));
}
function WritingSection({ sec, answers, setAnswer, sectionId }) {
  const [tIdx, setTIdx] = useStateT(0);
  const tasks = sec.tasks || [];
  const task = tasks[tIdx];
  if (!task) return /* @__PURE__ */ React.createElement("div", { className: "empty-state" }, "No writing tasks available.");
  const key = sectionId + "_" + (task.id || tIdx);
  const text = answers[key] || "";
  const wc = text.trim() ? text.trim().split(/\s+/).length : 0;
  const target = task.minWords || task.wordTarget || 150;
  function writingTaskLabel(t, idx) {
    const variant = t.examVariant || t.variant || "";
    const isGeneral = variant === "general" || variant === "general_training";
    const taskNum = t.taskNumber || idx + 1;
    const minW = t.minWords || t.wordTarget || 150;
    if (t.taskType === "integrated_writing") return `Task ${taskNum} \u2014 Integrated Writing`;
    if (t.taskType === "academic_discussion") return `Task ${taskNum} \u2014 Academic Discussion`;
    if (t.taskType === "argument") return `Task ${taskNum} \u2014 Argument Essay`;
    if (t.taskType === "issue") return `Task ${taskNum} \u2014 Issue Essay (${minW}+ words)`;
    if (t.taskType === "letter" || t.taskType === "general_task_1_letter" || isGeneral && taskNum === 1) {
      const ltype = t.letterType ? ` \u2014 ${t.letterType.charAt(0).toUpperCase()}${t.letterType.slice(1)} Letter` : " \u2014 Letter";
      return `Task 1${ltype} (${minW}+ words)`;
    }
    if (t.taskType === "academic_task_2_essay" || t.taskType === "essay" || taskNum === 2) {
      return `Task 2 \u2014 Essay (${minW}+ words)`;
    }
    if (taskNum === 1) return `Task 1 \u2014 Academic Report (${minW}+ words)`;
    if (t.taskType) return `Task ${taskNum} \u2014 ${t.taskType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`;
    return `Task ${taskNum}`;
  }
  return /* @__PURE__ */ React.createElement("div", { className: "writing-panel" }, tasks.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "part-nav" }, tasks.map((t, i) => {
    const k = sectionId + "_" + (t.id || i);
    const written = answers[k] ? answers[k].trim().split(/\s+/).length : 0;
    const tMin = t.minWords || t.wordTarget || 150;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: t.id || i,
        className: "part-pill" + (i === tIdx ? " active" : "") + (written >= tMin ? " done" : ""),
        onClick: () => setTIdx(i)
      },
      /* @__PURE__ */ React.createElement("span", { className: "pp-label" }, "Task ", i + 1),
      /* @__PURE__ */ React.createElement("span", { className: "pp-meta", style: { color: written >= tMin ? "var(--success)" : written > 0 ? "#f59e0b" : void 0 } }, written, "/", tMin, "w")
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, writingTaskLabel(task, tIdx)), window.LP_VisualRenderer && /* @__PURE__ */ React.createElement(window.LP_VisualRenderer, { task }), task.situation && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint-indigo)", border: "2px solid var(--primary)", borderRadius: "var(--r-md)", padding: "16px 18px", marginBottom: 12 } }, /* @__PURE__ */ React.createElement("strong", { style: { display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, color: "var(--primary)" } }, task.taskType === "argument" ? "Argument to Analyse" : "Issue Statement"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: 15, lineHeight: 1.7, margin: 0, fontStyle: "italic" } }, '"', task.situation, '"')), task.readingTitle && /* @__PURE__ */ React.createElement("div", { style: { fontWeight: 700, fontSize: 14, marginBottom: 4 } }, task.readingTitle), task.readingPassage && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "14px 16px", margin: "0 0 12px 0", fontSize: 14, lineHeight: 1.65, color: "var(--ink-2)" } }, /* @__PURE__ */ React.createElement("strong", { style: { display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 } }, "Reading Passage"), task.readingPassage), task.professorPrompt && /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint-orange)", border: "1px solid #ffd0a0", borderRadius: "var(--r-md)", padding: "14px 16px", margin: "0 0 12px 0", fontSize: 14, lineHeight: 1.65 } }, /* @__PURE__ */ React.createElement("strong", { style: { display: "block", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, color: "#b85c00" } }, "Lecture Notes"), task.professorPrompt), task.taskType === "academic_discussion" && task.professorPost && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { background: "var(--tint-blue)", border: "1px solid #c7d2fe", borderRadius: "var(--r-md)", padding: "12px 14px", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4338ca", display: "block", marginBottom: 6 } }, task.professorName ? `Professor ${task.professorName}` : "Professor's Question"), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 14, lineHeight: 1.65 } }, task.professorPost)), (task.studentPosts || []).map((s, si) => /* @__PURE__ */ React.createElement("div", { key: si, style: { background: "var(--tint-gray)", border: "1px solid #e5e7eb", borderRadius: "var(--r-md)", padding: "12px 14px", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("strong", { style: { fontSize: 12, color: "#374151", display: "block", marginBottom: 4 } }, s.name || `Student ${si + 1}`), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, fontSize: 14, lineHeight: 1.6, color: "#4b5563" } }, s.response)))), task.scene && /* @__PURE__ */ React.createElement(SceneImage, { scene: task.scene }), /* @__PURE__ */ React.createElement("div", { className: "writing-prompt" }, /* @__PURE__ */ React.createElement("strong", null, "Task"), task.prompt), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "writing-area",
      style: { marginTop: 12 },
      placeholder: `Write your response here (minimum ${target} words)...`,
      value: text,
      onChange: (e) => setAnswer(key, e.target.value)
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "word-count-bar", style: { marginTop: 6 } }, /* @__PURE__ */ React.createElement("span", { className: "wc-num" + (wc >= target ? " ok" : wc > 0 ? " low" : "") }, wc, " words", wc > 0 && wc < target ? ` (need ${target - wc} more)` : ""), /* @__PURE__ */ React.createElement("span", { style: { color: wc >= target ? "var(--success)" : void 0 } }, "Minimum: ", target, " words"))), tasks.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "part-pager" }, /* @__PURE__ */ React.createElement("button", { className: "btn", disabled: tIdx === 0, onClick: () => setTIdx(Math.max(0, tIdx - 1)) }, "\u2190 Previous task"), /* @__PURE__ */ React.createElement("span", { className: "pp-counter" }, "Task ", tIdx + 1, " of ", tasks.length), tIdx < tasks.length - 1 ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => setTIdx(tIdx + 1) }, "Next task \u2192") : /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-primary",
      style: { background: "var(--success)" },
      onClick: () => {
        const submitBtn = document.querySelector(".test-topbar button.btn-sm");
        if (submitBtn) submitBtn.click();
      },
      title: "Finish this section / submit the test"
    },
    "\u2713 Submit section"
  )));
}
function SpeakingSection({ sec, answers, setAnswer, sectionId }) {
  var _a, _b, _c, _d, _e, _f;
  const [examinerVoice, setExaminerVoice] = useStateT(null);
  const [phase, setPhase] = useStateT("ready");
  const [currentQ, setCurrentQ] = useStateT(0);
  const [transcripts, setTranscripts] = useStateT({});
  const [allQuestions, setAllQuestions] = useStateT([]);
  const [examinerSaying, setExaminerSaying] = useStateT("");
  const recogRef = useRefT(null);
  const abortRef = useRefT(null);
  useEffectT(() => {
    var _a2, _b2, _c2, _d2, _e2, _f2, _g, _h, _i, _j;
    const items = [];
    if (sec.type === "speaking" || sec.type === "speaking_ielts") {
      items.push({ kind: "greeting", id: "greet", text: "Hello, my name is your AI examiner today. I'll be conducting your speaking test. Let's begin." });
      const allCards = sec.cards || [];
      const p1Cards = allCards.filter((c) => c.part === 1);
      const p2Cards = allCards.filter((c) => c.part === 2 || c.isCueCard);
      const p3Cards = allCards.filter((c) => c.part === 3);
      const hasNewStructure = p1Cards.length > 0 || p2Cards.length > 0;
      items.push({ kind: "part1_intro", id: "p1_intro", text: "First, I'd like to ask you some general questions about yourself." });
      if (hasNewStructure && p1Cards.length) {
        p1Cards.forEach((card, i) => {
          items.push({
            kind: "part1_q",
            id: card.id || "p1_q" + i,
            text: card.prompt || card.topic || "",
            expectSec: 30,
            modelAnswer: card.sampleAnswer || ""
          });
        });
      } else {
        const Q = (_b2 = (_a2 = window.LP_QUESTIONS) == null ? void 0 : _a2.ielts) == null ? void 0 : _b2.speaking;
        const part1 = Array.isArray(Q) ? Q.find((p) => p.part === 1) : null;
        if ((_e2 = (_d2 = (_c2 = part1 == null ? void 0 : part1.topics) == null ? void 0 : _c2[0]) == null ? void 0 : _d2.questions) == null ? void 0 : _e2.length) {
          part1.topics[0].questions.slice(0, 4).forEach((q, i) => {
            items.push({ kind: "part1_q", id: "p1_q" + i, text: q, expectSec: 25 });
          });
        } else {
          items.push({ kind: "part1_q", id: "p1_q0", text: "Could you tell me a bit about where you live?", expectSec: 25 });
          items.push({ kind: "part1_q", id: "p1_q1", text: "What do you do for a living, or are you a student?", expectSec: 25 });
          items.push({ kind: "part1_q", id: "p1_q2", text: "What do you enjoy doing in your spare time?", expectSec: 25 });
        }
      }
      const cueCards = hasNewStructure ? p2Cards : allCards.filter((c) => !c.part) || [];
      cueCards.forEach((card, i) => {
        const cardText = card.prompt || card.topic || "";
        items.push({
          kind: "part2_intro",
          id: "p2_intro_" + i,
          text: `Now I'm going to give you a topic and I'd like you to talk about it for one to two minutes. You'll have one minute to think about what you want to say. Here is your topic: ${cardText}`
        });
        items.push({
          kind: "part2_card",
          id: card.id || "p2_card_" + i,
          text: "Please begin speaking now.",
          card,
          expectSec: 120,
          prep: 60,
          modelAnswer: card.sampleAnswer || ""
        });
        if (card.followUpQuestion) {
          items.push({
            kind: "part1_q",
            id: "p2_followup_" + i,
            text: card.followUpQuestion,
            expectSec: 30,
            modelAnswer: card.followUpModelAnswer || ""
          });
        }
      });
      items.push({ kind: "part3_intro", id: "p3_intro", text: "Now let's move on to part three. I'd like to discuss with you some more general questions related to the topic you just spoke about." });
      if (hasNewStructure && p3Cards.length) {
        p3Cards.forEach((card, i) => {
          items.push({
            kind: "part3_q",
            id: card.id || "p3_q" + i,
            text: card.prompt || "",
            expectSec: 60,
            modelAnswer: card.sampleAnswer || ""
          });
        });
      } else {
        const Q = (_g = (_f2 = window.LP_QUESTIONS) == null ? void 0 : _f2.ielts) == null ? void 0 : _g.speaking;
        const part3 = Array.isArray(Q) ? Q.find((p) => p.part === 3) : null;
        if ((_j = (_i = (_h = part3 == null ? void 0 : part3.discussions) == null ? void 0 : _h[0]) == null ? void 0 : _i.questions) == null ? void 0 : _j.length) {
          part3.discussions[0].questions.slice(0, 3).forEach((q, i) => {
            items.push({ kind: "part3_q", id: "p3_q" + i, text: q.q || q.question || "", expectSec: 40 });
          });
        } else {
          items.push({ kind: "part3_q", id: "p3_q0", text: "How important do you think this is in modern society?", expectSec: 40 });
          items.push({ kind: "part3_q", id: "p3_q1", text: "Do you think this will change in the future? Why or why not?", expectSec: 40 });
        }
      }
      items.push({ kind: "closing", id: "closing", text: "Thank you very much. That is the end of the speaking test. Click Submit section above to continue." });
    } else {
      items.push({ kind: "greeting", id: "greet", text: "Welcome. I'll read each task aloud. When you hear the beep, begin speaking." });
      (sec.tasks || sec.cards || []).forEach((task, i) => {
        items.push({ kind: "task", id: task.id || "task_" + i, text: task.prompt || task.question || "", task, expectSec: task.responseSeconds || 60, prep: task.prepSeconds || 15 });
      });
      items.push({ kind: "closing", id: "closing", text: "Thank you. That is the end of the speaking test." });
    }
    setAllQuestions(items);
  }, [sec]);
  useEffectT(() => {
    ensureVoicesLoaded().then(() => {
      const v = getBestVoices();
      setExaminerVoice(v.female || v.neutral);
    });
    return () => {
      var _a2, _b2;
      stopAllSpeech();
      (_b2 = (_a2 = abortRef.current) == null ? void 0 : _a2.abort) == null ? void 0 : _b2.call(_a2);
    };
  }, []);
  function startMic(key) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setPhase("listening_no_mic");
      return;
    }
    const recog = new SR();
    recog.lang = "en-US";
    recog.continuous = true;
    recog.interimResults = true;
    let finalText = "";
    recog.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + " ";
      finalText = t.trim();
      setTranscripts((tr) => ({ ...tr, [key]: finalText }));
      setAnswer(key, finalText);
    };
    recog.onerror = () => {
    };
    recogRef.current = recog;
    recog.start();
  }
  function stopMic() {
    var _a2;
    try {
      (_a2 = recogRef.current) == null ? void 0 : _a2.stop();
    } catch (e) {
    }
    recogRef.current = null;
  }
  const askCurrent = async () => {
    const item2 = allQuestions[currentQ];
    if (!item2) return;
    stopAllSpeech();
    setExaminerSaying(item2.text);
    setPhase("speaking_question");
    const controller = new AbortController();
    abortRef.current = controller;
    await speakLine(item2.text, { voice: examinerVoice, rate: 0.95 });
    if (controller.signal.aborted) return;
    if (item2.kind === "greeting" || item2.kind.endsWith("_intro") || item2.kind === "closing") {
      await new Promise((r) => setTimeout(r, 500));
      setExaminerSaying("");
      if (item2.kind === "closing") {
        setPhase("done");
        return;
      }
      setCurrentQ((i) => i + 1);
      setPhase("ready");
    } else {
      if (item2.prep) {
        setExaminerSaying(`You have ${item2.prep} seconds to prepare. Begin speaking when you're ready.`);
        await speakLine(`You have ${item2.prep} seconds to prepare. Begin speaking when you are ready.`, { voice: examinerVoice, rate: 0.95 });
      }
      setExaminerSaying("");
      setPhase("listening");
      startMic(sectionId + "_" + item2.id);
    }
  };
  const finishResponse = () => {
    stopMic();
    if (currentQ + 1 >= allQuestions.length) {
      setPhase("done");
      return;
    }
    setCurrentQ((c) => c + 1);
    setPhase("ready");
  };
  const skipCurrent = () => {
    var _a2, _b2;
    stopMic();
    stopAllSpeech();
    (_b2 = (_a2 = abortRef.current) == null ? void 0 : _a2.abort) == null ? void 0 : _b2.call(_a2);
    if (currentQ + 1 >= allQuestions.length) {
      setPhase("done");
      return;
    }
    setCurrentQ((c) => c + 1);
    setPhase("ready");
  };
  useEffectT(() => {
    if (phase === "ready" && examinerVoice && allQuestions.length && currentQ < allQuestions.length) {
      const t = setTimeout(askCurrent, 400);
      return () => clearTimeout(t);
    }
  }, [phase, examinerVoice, allQuestions, currentQ]);
  const item = allQuestions[currentQ];
  const partLabel = item ? item.kind.startsWith("part1") ? "Part 1 \xB7 Introduction" : item.kind.startsWith("part2") ? "Part 2 \xB7 Cue Card" : item.kind.startsWith("part3") ? "Part 3 \xB7 Discussion" : item.kind === "greeting" ? "Greeting" : item.kind === "closing" ? "Closing" : "Speaking Task" : "";
  const currentKey = item ? sectionId + "_" + item.id : null;
  const liveTranscript = currentKey ? transcripts[currentKey] || "" : "";
  return /* @__PURE__ */ React.createElement("div", { className: "speaking-examiner" }, /* @__PURE__ */ React.createElement("div", { className: "exam-stage" }, /* @__PURE__ */ React.createElement("div", { className: "exam-avatar" }, /* @__PURE__ */ React.createElement("div", { className: "avatar-ring", "data-state": phase }, /* @__PURE__ */ React.createElement("div", { className: "avatar-face" }, "\u{1F393}")), /* @__PURE__ */ React.createElement("div", { className: "avatar-label" }, "AI Examiner"), /* @__PURE__ */ React.createElement("div", { className: "avatar-status" }, phase === "speaking_question" && /* @__PURE__ */ React.createElement("span", { className: "status-speaking" }, "\u{1F50A} Speaking\u2026"), phase === "listening" && /* @__PURE__ */ React.createElement("span", { className: "status-listening" }, "\u{1F399} Listening for your response\u2026"), phase === "ready" && /* @__PURE__ */ React.createElement("span", null, "Ready"), phase === "done" && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--success)" } }, "\u2713 Test complete"))), /* @__PURE__ */ React.createElement("div", { className: "exam-conv" }, /* @__PURE__ */ React.createElement("div", { className: "part-label" }, partLabel), examinerSaying && /* @__PURE__ */ React.createElement("div", { className: "examiner-bubble" }, /* @__PURE__ */ React.createElement("div", { className: "eb-label" }, "Examiner"), /* @__PURE__ */ React.createElement("div", { className: "eb-text" }, examinerSaying)), (((_a = item == null ? void 0 : item.card) == null ? void 0 : _a.scene) || ((_b = item == null ? void 0 : item.task) == null ? void 0 : _b.scene)) && /* @__PURE__ */ React.createElement(SceneImage, { scene: ((_c = item.card) == null ? void 0 : _c.scene) || ((_d = item.task) == null ? void 0 : _d.scene) }), (item == null ? void 0 : item.card) && /* @__PURE__ */ React.createElement("div", { className: "cue-card" }, /* @__PURE__ */ React.createElement("div", { className: "cc-label" }, "Cue Card"), /* @__PURE__ */ React.createElement("div", { className: "cc-topic" }, item.card.topic || item.card.prompt), item.card.points && /* @__PURE__ */ React.createElement("ul", null, item.card.points.map((pt, i) => /* @__PURE__ */ React.createElement("li", { key: i }, pt)))), ((_e = item == null ? void 0 : item.task) == null ? void 0 : _e.visual) && window.LP_VisualRenderer && /* @__PURE__ */ React.createElement("div", { className: "describe-visual", style: { margin: "10px 0" } }, /* @__PURE__ */ React.createElement(window.LP_VisualRenderer, { task: { visual: item.task.visual, prompt: item.task.prompt } })), ((_f = item == null ? void 0 : item.task) == null ? void 0 : _f.photoUrl) && /* @__PURE__ */ React.createElement("div", { className: "describe-photo", style: { margin: "10px 0" } }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: item.task.photoUrl,
      alt: item.task.photoAlt || "Describe what you see in this image",
      style: { maxWidth: "100%", height: "auto", borderRadius: 10, border: "1px solid var(--line)" }
    }
  )), liveTranscript && /* @__PURE__ */ React.createElement("div", { className: "candidate-bubble" }, /* @__PURE__ */ React.createElement("div", { className: "cb-label" }, "You (live)"), /* @__PURE__ */ React.createElement("div", { className: "cb-text" }, liveTranscript))), /* @__PURE__ */ React.createElement("div", { className: "exam-controls" }, phase === "ready" && currentQ === 0 && examinerVoice && /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary btn-lg", onClick: askCurrent }, "\u25B6 Begin speaking test"), phase === "listening" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: finishResponse }, "\u2713 I'm done, next question \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: skipCurrent }, "Skip")), phase === "speaking_question" && /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: skipCurrent }, "Skip this question"), phase === "done" && /* @__PURE__ */ React.createElement("div", { className: "done-message" }, "All questions answered. Click Submit section above to score your speaking responses.")), phase === "listening" && item && /* @__PURE__ */ React.createElement("div", { className: "typed-fallback" }, /* @__PURE__ */ React.createElement("label", null, "Or type your response (if mic unavailable):"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      className: "writing-area",
      placeholder: "Type your spoken response here\u2026",
      value: liveTranscript,
      onChange: (e) => {
        setTranscripts((tr) => ({ ...tr, [currentKey]: e.target.value }));
        setAnswer(currentKey, e.target.value);
      }
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "speaking-progress" }, allQuestions.map((q, i) => /* @__PURE__ */ React.createElement(
    "span",
    {
      key: q.id,
      className: "sp-dot" + (i < currentQ ? " done" : i === currentQ ? " current" : ""),
      title: q.text.slice(0, 60)
    }
  )))));
}
function QuestionCard({ q, qi, sectionId, answer, onAnswer, hideInstruction }) {
  if (q.type === "mcq" || q.type === "table_analysis" || q.type === "multi_source_reasoning" || q.type === "graphics_interpretation") {
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Question ", q.num || qi + 1), Array.isArray(q.sources) && /* @__PURE__ */ React.createElement("div", { className: "di-sources" }, q.sources.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "di-source" }, /* @__PURE__ */ React.createElement("div", { className: "di-source-label" }, s.label), /* @__PURE__ */ React.createElement("pre", { className: "di-source-text" }, s.text)))), Array.isArray(q.table) && q.table.length > 0 && typeof q.table[0] === "object" && /* @__PURE__ */ React.createElement("div", { className: "di-table-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "di-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, Object.keys(q.table[0]).map((h) => /* @__PURE__ */ React.createElement("th", { key: h }, h)))), /* @__PURE__ */ React.createElement("tbody", null, q.table.map((row, ri) => /* @__PURE__ */ React.createElement("tr", { key: ri }, Object.keys(q.table[0]).map((k, ci) => ci === 0 ? /* @__PURE__ */ React.createElement("th", { key: k, scope: "row" }, row[k]) : /* @__PURE__ */ React.createElement("td", { key: k }, row[k]))))))), q.chart && Array.isArray(q.chart.values) && Array.isArray(q.chart.labels) && /* @__PURE__ */ React.createElement("div", { className: "di-chart" }, q.chart.caption && /* @__PURE__ */ React.createElement("div", { className: "di-chart-caption" }, q.chart.caption), /* @__PURE__ */ React.createElement("div", { className: "di-chart-bars" }, q.chart.labels.map((lab, i) => {
      const max = Math.max.apply(null, q.chart.values) || 1;
      return /* @__PURE__ */ React.createElement("div", { key: i, className: "di-bar-col" }, /* @__PURE__ */ React.createElement("div", { className: "di-bar-val" }, q.chart.values[i]), /* @__PURE__ */ React.createElement("div", { className: "di-bar", style: { height: Math.round(q.chart.values[i] / max * 90) + 6 + "px" } }), /* @__PURE__ */ React.createElement("div", { className: "di-bar-label" }, lab));
    }))), /* @__PURE__ */ React.createElement("div", { className: "q-text" }, q.text), q.dataTable && /* @__PURE__ */ React.createElement("div", { className: "di-table-wrap" }, q.dataTable.caption && /* @__PURE__ */ React.createElement("div", { className: "di-table-caption" }, q.dataTable.caption), /* @__PURE__ */ React.createElement("table", { className: "di-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, (q.dataTable.headers || []).map((h, i) => /* @__PURE__ */ React.createElement("th", { key: i }, h)))), /* @__PURE__ */ React.createElement("tbody", null, (q.dataTable.rows || []).map((row, ri) => /* @__PURE__ */ React.createElement("tr", { key: ri }, (row || []).map((cell, ci) => ci === 0 ? /* @__PURE__ */ React.createElement("th", { key: ci, scope: "row" }, cell) : /* @__PURE__ */ React.createElement("td", { key: ci }, cell))))))), q.visual && window.LP_VisualRenderer && /* @__PURE__ */ React.createElement(window.LP_VisualRenderer, { task: { visual: q.visual, prompt: q.text } }), q.passage && /* @__PURE__ */ React.createElement("div", { className: "passage-block", style: { maxHeight: 200, marginBottom: 12 } }, /* @__PURE__ */ React.createElement("p", { style: { margin: 0 } }, q.passage)), /* @__PURE__ */ React.createElement("div", { className: "q-options" }, (q.options || []).map((opt, oi) => {
      const letter = ["A", "B", "C", "D", "E"][oi];
      const isSelected = answer === letter;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: oi,
          className: "q-option" + (isSelected ? " is-selected" : ""),
          onClick: () => onAnswer(letter)
        },
        /* @__PURE__ */ React.createElement("span", { className: "opt-letter" }, letter),
        /* @__PURE__ */ React.createElement("span", null, opt.replace(/^[A-E]\.\s*/, ""))
      );
    })));
  }
  if (q.type === "two_part_analysis") {
    const sel = answer ? String(answer).split(",") : ["", ""];
    const pick = (col, ri) => {
      const next = [sel[0] || "", sel[1] || ""];
      next[col] = String(ri);
      onAnswer(next.join(","));
    };
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Question ", q.num || qi + 1), /* @__PURE__ */ React.createElement("div", { className: "q-text" }, q.text || q.prompt), /* @__PURE__ */ React.createElement("table", { className: "di-twopart" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, (q.columns || [])[0]), /* @__PURE__ */ React.createElement("th", null, (q.columns || [])[1]), /* @__PURE__ */ React.createElement("th", { className: "tp-rowhead" }, "Option"))), /* @__PURE__ */ React.createElement("tbody", null, (q.rows || []).map((row, ri) => /* @__PURE__ */ React.createElement("tr", { key: ri }, /* @__PURE__ */ React.createElement("td", { className: "tp-radio" }, /* @__PURE__ */ React.createElement("input", { type: "radio", name: q.id + "_c0", checked: sel[0] === String(ri), onChange: () => pick(0, ri), "aria-label": (q.columns || [])[0] + ": " + row })), /* @__PURE__ */ React.createElement("td", { className: "tp-radio" }, /* @__PURE__ */ React.createElement("input", { type: "radio", name: q.id + "_c1", checked: sel[1] === String(ri), onChange: () => pick(1, ri), "aria-label": (q.columns || [])[1] + ": " + row })), /* @__PURE__ */ React.createElement("td", { className: "tp-rowlabel" }, row))))));
  }
  if (q.type === "tfng" || q.type === "yng") {
    const opts = q.type === "tfng" ? [["TRUE", "T"], ["FALSE", "F"], ["NOT GIVEN", "NG"]] : [["YES", "Y"], ["NO", "N"], ["NOT GIVEN", "NG"]];
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Question ", q.num || qi + 1), /* @__PURE__ */ React.createElement("div", { className: "q-text" }, /* @__PURE__ */ React.createElement("em", { style: { fontSize: 12, color: "var(--ink-3)", display: "block", marginBottom: 6 } }, q.type === "tfng" ? "TRUE / FALSE / NOT GIVEN" : "YES / NO / NOT GIVEN"), q.text), /* @__PURE__ */ React.createElement("div", { className: "q-tfng" }, opts.map(([label, val]) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: val,
        className: "q-option" + (answer === val ? " is-selected" : ""),
        onClick: () => onAnswer(val)
      },
      label
    ))));
  }
  if (q.type === "sent_fill") {
    const sentence = q.sentenceText || q.text || "";
    const parts = sentence.split("__BLANK__");
    const qNum = q.num || qi + 1;
    return /* @__PURE__ */ React.createElement("div", { className: "q-card q-card-sent" }, /* @__PURE__ */ React.createElement("div", { className: "q-sent-row" }, parts[0] && /* @__PURE__ */ React.createElement("span", { className: "q-sent-text" }, parts[0]), /* @__PURE__ */ React.createElement("span", { className: "q-sent-num-circle" }, qNum), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "q-sent-input",
        placeholder: "\u2026",
        value: answer || "",
        onChange: (e) => onAnswer(e.target.value)
      }
    ), parts[1] && /* @__PURE__ */ React.createElement("span", { className: "q-sent-text" }, parts[1])));
  }
  if (q.type === "fill") {
    const wordLimit = q.wordLimit || q.maxWords;
    const limitText = q.wordLimitText || (wordLimit ? `NO MORE THAN ${["", "ONE", "TWO", "THREE", "FOUR", "FIVE"][wordLimit] || wordLimit} WORD${wordLimit > 1 ? "S" : ""}${q.allowNumber ? " AND/OR A NUMBER" : ""}` : null);
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Question ", q.num || qi + 1), !hideInstruction && limitText && /* @__PURE__ */ React.createElement("div", { className: "q-instruction" }, /* @__PURE__ */ React.createElement("em", null, "Fill in the blank with ", /* @__PURE__ */ React.createElement("strong", null, limitText), ".")), /* @__PURE__ */ React.createElement("div", { className: "q-text" }, q.text), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        style: { width: "100%", height: 40, padding: "0 12px", border: "1.5px solid var(--line)", borderRadius: "var(--r-md)", font: "inherit", fontSize: 15, background: "var(--surface)", transition: "border-color 140ms" },
        placeholder: "Type your answer...",
        value: answer || "",
        onChange: (e) => onAnswer(e.target.value)
      }
    ), q.hint && /* @__PURE__ */ React.createElement("div", { className: "fine", style: { marginTop: 6 } }, "Hint: ", q.hint));
  }
  if (q.type === "mcq_multi") {
    const selected = Array.isArray(answer) ? answer : answer ? answer.split(",").filter(Boolean) : [];
    const maxSelect = q.selectCount || (Array.isArray(q.answer) ? q.answer.length : 2);
    const toggle = (letter) => {
      let next;
      if (selected.includes(letter)) next = selected.filter((l) => l !== letter);
      else if (selected.length < maxSelect) next = [...selected, letter];
      else next = selected;
      onAnswer(next.sort());
    };
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Question ", q.num || qi + 1), !hideInstruction && /* @__PURE__ */ React.createElement("div", { className: "q-instruction" }, /* @__PURE__ */ React.createElement("em", null, "Mark ", /* @__PURE__ */ React.createElement("strong", null, ["", "ONE", "TWO", "THREE", "FOUR", "FIVE"][maxSelect] || maxSelect), " letter", maxSelect > 1 ? "s" : "", " that represent the correct answer", maxSelect > 1 ? "s" : "", ".")), /* @__PURE__ */ React.createElement("div", { className: "q-text" }, q.text), /* @__PURE__ */ React.createElement("div", { className: "q-options" }, (q.options || []).map((opt, oi) => {
      const letter = ["A", "B", "C", "D", "E", "F", "G"][oi];
      const isSelected = selected.includes(letter);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: oi,
          className: "q-option q-option-check" + (isSelected ? " is-selected" : ""),
          onClick: () => toggle(letter)
        },
        /* @__PURE__ */ React.createElement("span", { className: "opt-checkbox" + (isSelected ? " is-checked" : "") }, isSelected ? "\u2713" : ""),
        /* @__PURE__ */ React.createElement("span", { className: "opt-letter" }, letter),
        /* @__PURE__ */ React.createElement("span", null, opt.replace(/^[A-E]\.\s*/, ""))
      );
    })), /* @__PURE__ */ React.createElement("div", { className: "fine", style: { marginTop: 8 } }, selected.length, " of ", maxSelect, " selected"));
  }
  if (q.type === "form_completion" || q.type === "table_completion") {
    const fields = q.fields || [];
    const limitText = q.limitText || (q.wordLimit ? `NO MORE THAN ${["", "ONE", "TWO", "THREE", "FOUR", "FIVE"][q.wordLimit] || q.wordLimit} WORD${q.wordLimit > 1 ? "S" : ""}${q.allowNumber ? " AND/OR A NUMBER" : ""}` : "NO MORE THAN THREE WORDS AND/OR A NUMBER");
    const getVal = (fid) => {
      if (typeof answer === "object" && answer !== null) return answer[fid] || "";
      return "";
    };
    const setVal = (fid, val) => {
      const next = { ...typeof answer === "object" && answer !== null ? answer : {} };
      next[fid] = val;
      onAnswer(next);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Questions ", q.questionRange || `${q.startNum || (q.num || qi + 1)}\u2013${(q.startNum || (q.num || qi + 1)) + fields.length - 1}`), !hideInstruction && /* @__PURE__ */ React.createElement("div", { className: "q-instruction" }, /* @__PURE__ */ React.createElement("em", null, "Complete the ", q.type === "table_completion" ? "table" : "form", " with ", /* @__PURE__ */ React.createElement("strong", null, limitText), " for each answer.")), q.title && /* @__PURE__ */ React.createElement("div", { className: "form-title" }, q.title), /* @__PURE__ */ React.createElement("div", { className: q.type === "table_completion" ? "table-completion" : "form-completion" }, fields.map((f, i) => /* @__PURE__ */ React.createElement("div", { className: "fc-row", key: f.id || i }, /* @__PURE__ */ React.createElement("label", { className: "fc-label" }, f.label), /* @__PURE__ */ React.createElement("div", { className: "fc-input-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "fc-num" }, f.num || (q.startNum || (q.num || qi + 1)) + i), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        className: "fc-input",
        placeholder: "\u2026",
        value: getVal(f.id || `f${i}`),
        onChange: (e) => setVal(f.id || `f${i}`, e.target.value)
      }
    ))))));
  }
  if (q.type === "match_heading") {
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Question ", q.num || qi + 1, " \u2014 ", q.matchHeadings ? "Matching headings" : "Matching"), /* @__PURE__ */ React.createElement("div", { className: "q-text" }, q.text), /* @__PURE__ */ React.createElement("div", { className: "q-options" }, (q.options || []).map((opt, oi) => {
      const letter = ["A", "B", "C", "D", "E"][oi];
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: oi,
          className: "q-option" + (answer === letter ? " is-selected" : ""),
          onClick: () => onAnswer(letter)
        },
        /* @__PURE__ */ React.createElement("span", { className: "opt-letter" }, letter),
        /* @__PURE__ */ React.createElement("span", null, opt.replace(/^[A-E]\.\s*/, ""))
      );
    })));
  }
  if (q.type === "map_label") {
    const mapKey = q.mapKey || {};
    const letters = q.mapLetters || Object.keys(mapKey);
    return /* @__PURE__ */ React.createElement("div", { className: "q-card q-card-map" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Question ", q.num || qi + 1), /* @__PURE__ */ React.createElement("div", { className: "q-map-prompt" }, q.text || q.prompt || ""), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginTop: 10 } }, /* @__PURE__ */ React.createElement("label", { style: { fontSize: 13, fontWeight: 600, color: "var(--ink-2)" } }, "Letter:"), /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "q-map-select",
        value: answer || "",
        onChange: (e) => onAnswer(e.target.value),
        style: { padding: "6px 14px", border: "1.5px solid var(--line)", borderRadius: "var(--r-md)", fontSize: 15, background: "var(--surface)", cursor: "pointer", minWidth: 80 }
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014"),
      letters.map((ltr) => /* @__PURE__ */ React.createElement("option", { key: ltr, value: ltr }, ltr))
    ), answer && /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, color: "var(--ink-3)" } }, "\u2192 ", mapKey[answer] || "")));
  }
  if (q.type === "match_cat") {
    const cats = q.categoryOptions || [];
    return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Question ", q.num || qi + 1), !hideInstruction && cats.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "q-match-cats" }, cats.map((c, i) => /* @__PURE__ */ React.createElement("div", { key: i, style: { fontSize: 14, padding: "4px 0" } }, c))), /* @__PURE__ */ React.createElement("div", { className: "q-text", style: { marginTop: 8 } }, q.text), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10, marginTop: 8 } }, /* @__PURE__ */ React.createElement(
      "select",
      {
        className: "q-cat-select",
        value: answer || "",
        onChange: (e) => onAnswer(e.target.value),
        style: { padding: "6px 12px", border: "1.5px solid var(--line)", borderRadius: "var(--r-md)", fontSize: 15, background: "var(--surface)", cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 select \u2014"),
      cats.map((c, i) => {
        const letter = c.charAt(0);
        return /* @__PURE__ */ React.createElement("option", { key: i, value: letter }, c);
      })
    )));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "q-card" }, /* @__PURE__ */ React.createElement("div", { className: "q-num" }, "Question ", q.num || qi + 1, q.subtype ? ` \u2014 ${q.subtype}` : ""), q.passage && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: "var(--ink-2)", lineHeight: 1.65, marginBottom: 12, background: "var(--tint)", padding: "12px 14px", borderRadius: "var(--r-md)", border: "1px solid var(--line)" } }, q.passage), /* @__PURE__ */ React.createElement("div", { className: "q-text" }, q.text), q.statements && q.statements.map((s, si) => /* @__PURE__ */ React.createElement("div", { key: si, style: { fontSize: 14, color: "var(--ink-2)", margin: "4px 0", paddingLeft: 8, borderLeft: "3px solid var(--line)" } }, s)), /* @__PURE__ */ React.createElement("div", { className: "q-options", style: { marginTop: 12 } }, (q.options || []).map((opt, oi) => {
    const letter = ["A", "B", "C", "D", "E"][oi];
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: oi,
        className: "q-option" + (answer === letter ? " is-selected" : ""),
        onClick: () => onAnswer(letter)
      },
      /* @__PURE__ */ React.createElement("span", { className: "opt-letter" }, letter),
      /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13 } }, opt.replace(/^[A-E]\.\s*/, ""))
    );
  })));
}
function scoreTest(config, answers) {
  const result = { sections: {}, overall: null, examId: config.examId };
  const examId = config.examId;
  const totalAnswered = Object.values(answers || {}).filter((a) => {
    if (a == null) return false;
    if (typeof a === "string") return a.trim() !== "";
    if (Array.isArray(a)) return a.length > 0;
    if (typeof a === "object") return Object.values(a).some((v) => String(v || "").trim() !== "");
    return true;
  }).length;
  if (totalAnswered === 0) {
    for (const sec of config.sections) {
      result.sections[sec.id] = { correct: 0, total: 0, band: 0, pct: 0, label: sec.name };
    }
    result.overall = 0;
    result.overallLabel = examId === "ielts" ? "Overall Band" : "Score";
    result.noAttempt = true;
    return result;
  }
  const scaleScore = (correctPct) => {
    switch (examId) {
      case "ielts":
        return null;
      // handled separately via band table
      case "gre":
        return Math.round(130 + correctPct * 40);
      // 130–170
      case "gmat":
        return Math.round(60 + correctPct * 30);
      // 60–90
      case "toefl":
        return Math.round(correctPct * 30);
      // 0–30
      case "pte":
        return Math.round(10 + correctPct * 80);
      // 10–90
      case "celpip":
        return Math.max(1, Math.min(12, Math.round(correctPct * 12)));
      // CLB 1–12
      case "duolingo":
        return Math.round(10 + correctPct * 150);
      // 10–160
      default:
        return Math.round(correctPct * 100);
    }
  };
  const scaleProductive = (band) => {
    const pct = Math.max(0, Math.min(1, band / 9));
    switch (examId) {
      case "ielts":
        return Math.round(band * 2) / 2;
      // keep 0.5 step bands
      case "gre":
        return Math.round(130 + pct * 40);
      case "gmat":
        return Math.round(60 + pct * 30);
      case "toefl":
        return Math.round(pct * 30);
      case "pte":
        return Math.round(10 + pct * 80);
      case "celpip":
        return Math.max(1, Math.min(12, Math.round(pct * 12)));
      case "duolingo":
        return Math.round(10 + pct * 150);
      default:
        return Math.round(pct * 9 * 10) / 10;
    }
  };
  for (const sec of config.sections) {
    if (sec.type === "listening" || sec.type === "reading" || sec.type === "reading_pte") {
      const qs = getAllQuestions(sec);
      let correct = 0;
      for (const q of qs) {
        const given = answers[sec.id + "_" + q.id];
        if (!given) continue;
        if (q.type === "form_field" || q.type === "sent_fill") {
          const g = (given || "").toLowerCase().trim();
          const correctVals = [q.answer, ...q.altAnswers || []].map((x) => (x || "").toLowerCase().trim());
          const expanded = correctVals.flatMap((v) => v.split(/\s*\/\s*/));
          if (expanded.some((v) => v && g === v)) correct++;
        } else if (q.type === "fill") {
          const a = (q.answer || "").toLowerCase().trim();
          const g = (given || "").toLowerCase().trim();
          const alts = (q.altAnswers || []).map((x) => x.toLowerCase().trim());
          if (g === a || alts.includes(g)) correct++;
        } else if (q.type === "map_label" || q.type === "match_cat") {
          if (String(given || "").toUpperCase().trim() === String(q.answer || "").toUpperCase().trim()) correct++;
        } else if (q.type === "mcq" || q.type === "tfng" || q.type === "yng" || q.type === "match_heading" || q.type === "inference" || q.type === "vocab" || q.type === "table_analysis" || q.type === "multi_source_reasoning" || q.type === "graphics_interpretation" || q.type === "two_part_analysis") {
          if (given === q.answer) correct++;
        } else if (q.type === "mcq_multi") {
          const expected = Array.isArray(q.answer) ? [...q.answer].sort().join(",") : String(q.answer || "").split(",").sort().join(",");
          const got = Array.isArray(given) ? [...given].sort().join(",") : String(given || "").split(",").sort().join(",");
          if (got && expected && got === expected) correct++;
        } else if (q.type === "form_completion" || q.type === "table_completion") {
          const fields = q.fields || [];
          const givenObj = typeof given === "object" ? given : {};
          for (const f of fields) {
            const fid = f.id || `f${fields.indexOf(f)}`;
            const got = (givenObj[fid] || "").toLowerCase().trim();
            const expected = (f.answer || "").toLowerCase().trim();
            const alts = (f.altAnswers || []).map((a) => a.toLowerCase().trim());
            if (got && (got === expected || alts.includes(got))) correct++;
          }
        }
      }
      const pct = qs.length > 0 ? correct / qs.length : 0;
      if (examId === "ielts") {
        const band = sec.id === "listening" ? window.LP_SCORE.ieltsListeningBand(correct) : window.LP_SCORE.ieltsReadingBand(correct);
        result.sections[sec.id] = { correct, total: qs.length, band, pct: Math.round(pct * 100), label: sec.name };
      } else {
        const scaled = scaleScore(pct);
        result.sections[sec.id] = { correct, total: qs.length, band: scaled, pct: Math.round(pct * 100), label: sec.name };
      }
    } else if (sec.type === "writing" || sec.type === "writing_aw") {
      const tasks = sec.tasks || [];
      let totalBand = 0;
      let counted = 0;
      for (const task of tasks) {
        const key = sec.id + "_" + (task.id || "0");
        const r = window.LP_SCORE.gradeWriting(answers[key], task.wordTarget || 150);
        totalBand += r.band;
        counted++;
      }
      const avgBand = counted > 0 ? totalBand / counted : 0;
      const scaled = examId === "ielts" ? Math.round(avgBand * 2) / 2 : scaleProductive(avgBand);
      result.sections[sec.id] = { band: scaled, tasks: counted, pct: Math.round(avgBand / 9 * 100), label: sec.name };
    } else if (sec.type === "speaking" || sec.type === "speaking_toefl") {
      const items = sec.cards || sec.tasks || [];
      const prefix = sec.id + "_";
      const usedKeys = /* @__PURE__ */ new Set();
      let totalBand = 0;
      let counted = 0;
      for (const item of items) {
        const key = sec.id + "_" + (item.id || "0");
        usedKeys.add(key);
        const r = window.LP_SCORE.gradeSpeaking(answers[key]);
        totalBand += r.band;
        counted++;
      }
      Object.keys(answers).forEach((k) => {
        if (k.startsWith(prefix) && !usedKeys.has(k) && String(answers[k] || "").trim()) {
          const r = window.LP_SCORE.gradeSpeaking(answers[k]);
          totalBand += r.band;
          counted++;
        }
      });
      const avgBand = counted > 0 ? totalBand / counted : 0;
      const scaled = examId === "ielts" ? Math.round(avgBand * 2) / 2 : scaleProductive(avgBand);
      result.sections[sec.id] = { band: scaled, tasks: counted, pct: Math.round(avgBand / 9 * 100), label: sec.name };
    } else if (sec.type === "pte_sw") {
      const items = sec.items || [];
      const WRITE = /* @__PURE__ */ new Set(["summarize_written_text", "essay", "write_essay"]);
      let totalBand = 0;
      let counted = 0;
      for (const it of items) {
        const key = sec.id + "_" + (it.id || "0");
        const ans = answers[key];
        const r = WRITE.has(it.questionType) ? window.LP_SCORE.gradeWriting(ans || "", it.wordMin || 50) : window.LP_SCORE.gradeSpeaking(ans || "");
        totalBand += r.band;
        counted++;
      }
      const avgBand = counted > 0 ? totalBand / counted : 0;
      result.sections[sec.id] = { band: scaleProductive(avgBand), tasks: counted, pct: Math.round(avgBand / 9 * 100), label: sec.name };
    }
  }
  const bands = Object.values(result.sections).map((s) => s.band).filter((b) => b != null && b > 0);
  if (examId === "ielts" && bands.length > 0) {
    result.overall = window.LP_SCORE.ieltsOverallBand(bands);
    result.overallLabel = "Overall Band";
  } else if (examId === "gmat" && bands.length > 0) {
    const sum = bands.reduce((a, b) => a + b, 0);
    const minSum = bands.length * 60, maxSum = bands.length * 90;
    const ratio = maxSum > minSum ? (sum - minSum) / (maxSum - minSum) : 0;
    result.overall = 205 + Math.round(ratio * 60) * 10;
    result.overallLabel = "GMAT Focus Total Score";
  } else if (examId === "gre" && bands.length > 0) {
    const vq = ["verbal", "quant"].map((k) => {
      var _a;
      return (_a = result.sections[k]) == null ? void 0 : _a.band;
    }).filter((b) => b != null);
    if (vq.length === 2) {
      result.overall = vq[0] + vq[1];
      result.overallLabel = "GRE V+Q Total";
    } else {
      result.overall = Math.round(bands.reduce((a, b) => a + b, 0) / bands.length);
      result.overallLabel = "GRE Section Average";
    }
  } else if (examId === "toefl" && bands.length > 0) {
    result.overall = bands.reduce((a, b) => a + b, 0);
    result.overallLabel = "TOEFL iBT Total";
  } else if (examId === "pte" && bands.length > 0) {
    result.overall = Math.round(bands.reduce((a, b) => a + b, 0) / bands.length);
    result.overallLabel = "PTE Overall (10\u201390)";
  } else if (examId === "celpip" && bands.length > 0) {
    result.overall = Math.round(bands.reduce((a, b) => a + b, 0) / bands.length);
    result.overallLabel = "CELPIP CLB Average";
  } else if (examId === "duolingo" && bands.length > 0) {
    result.overall = Math.round(bands.reduce((a, b) => a + b, 0) / bands.length);
    result.overallLabel = "Duolingo Overall (10\u2013160)";
  } else if (bands.length > 0) {
    result.overall = Math.round(bands.reduce((a, b) => a + b, 0) / bands.length);
    result.overallLabel = "Score";
  }
  return result;
}
function SpeakingReviewItem({ q, given, sectionId }) {
  const [modelAnswer, setModelAnswer] = useStateT(q.modelAnswer || q.sampleAnswer || q.answerGuide || q.exampleAnswer || q.sample || "");
  const [generating, setGenerating] = useStateT(false);
  const [error, setError] = useStateT("");
  const canGenerate = !modelAnswer && !generating && window.LP_TTS && typeof window.LP_TTS.isEnabled === "function" && window.LP_TTS.isEnabled();
  const generateModelAnswer = async () => {
    setGenerating(true);
    setError("");
    const prompt_text = q.prompt || q.topic || "";
    const points = (q.points || []).join(", ");
    const promptBody = `You are an IELTS/CELPIP examiner. Write a fluent, natural Band 7\u20138 model spoken response for this speaking task.

Task: "${prompt_text}"${points ? `
Points to cover: ${points}` : ""}

Write a 2\u20133 paragraph spoken response (approximately 90\u2013150 words). Use clear, natural spoken English \u2014 contractions are fine. Begin speaking directly without preamble.`;
    try {
      const result = await window.LP_AI_TUTOR.generate(promptBody);
      if (result) setModelAnswer(result.trim());
      else setError("Could not generate model answer. Please try again.");
    } catch (e) {
      setError("Error generating model answer. Check server connection.");
    } finally {
      setGenerating(false);
    }
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, (q.prompt || q.topic) && /* @__PURE__ */ React.createElement("div", { className: "review-row" }, /* @__PURE__ */ React.createElement("span", { className: "review-label" }, "Prompt:"), /* @__PURE__ */ React.createElement("span", { className: "review-value" }, q.prompt || q.topic)), q.points && q.points.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "review-row" }, /* @__PURE__ */ React.createElement("span", { className: "review-label" }, "Points to cover:"), /* @__PURE__ */ React.createElement("span", { className: "review-value" }, q.points.join(" \xB7 "))), given && /* @__PURE__ */ React.createElement("details", { className: "review-script" }, /* @__PURE__ */ React.createElement("summary", null, "Your spoken response (transcript)"), /* @__PURE__ */ React.createElement("pre", { className: "script-text" }, given)), modelAnswer ? /* @__PURE__ */ React.createElement("details", { className: "review-script", open: true }, /* @__PURE__ */ React.createElement("summary", null, "\u{1F4C4} Model response (Band 7\u20138)"), /* @__PURE__ */ React.createElement("pre", { className: "script-text" }, modelAnswer), window.LP_TTS && window.LP_TTS.isEnabled && window.LP_TTS.isEnabled() && /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "btn btn-sm",
      style: { marginTop: 8 },
      onClick: () => window.LP_TTS.speakOne(modelAnswer.slice(0, 800), "Kore")
    },
    "\u{1F50A} Listen to model response"
  )) : /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, canGenerate && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: generateModelAnswer, disabled: generating }, generating ? "Generating\u2026" : "\u2728 Generate AI model answer"), !canGenerate && !modelAnswer && /* @__PURE__ */ React.createElement("div", { className: "review-explanation", style: { color: "var(--ink-3)" } }, "No model answer available. Set a Gemini API key in AI Agents to enable AI model answers."), error && /* @__PURE__ */ React.createElement("div", { style: { color: "var(--error)", fontSize: 13, marginTop: 6 } }, error)), /* @__PURE__ */ React.createElement("div", { className: "review-explanation" }, /* @__PURE__ */ React.createElement("strong", null, "Rubric:"), " ", (q.rubric || ["fluency", "coherence", "vocabulary", "grammar", "pronunciation"]).join(" \xB7 ")));
}
function ExplainAI({ examName, q, given, correctText }) {
  const [state, setState] = useStateT("idle");
  const [text, setText] = useStateT("");
  if (!window.LP_AI_TUTOR || !window.LP_AI_TUTOR.generate) return null;
  const ask = async () => {
    if (state === "loading") return;
    setState("loading");
    try {
      const opts = Array.isArray(q.options) && q.options.length ? "\nOptions: " + q.options.map((o) => typeof o === "string" ? o : o.text || o.label || o.value || "").join(" | ") : "";
      const prompt = `You are an expert ${examName || "exam"} tutor. In 3\u20135 short sentences, explain why the correct answer below is right \u2014 and if the student's answer is different, why theirs is wrong. Be clear, specific and encouraging. Do not just repeat the question.
Question: ${q.text || q.prompt || q.topic || ""}${opts}
Student's answer: ${formatAnswer(given) || "(not answered)"}
Correct answer: ${correctText}`;
      const out = await window.LP_AI_TUTOR.generate(prompt);
      const clean = (out || "").trim();
      if (!clean || /AI Tutor is offline/i.test(clean)) {
        setState("error");
        return;
      }
      setText(clean);
      setState("done");
    } catch (e) {
      setState("error");
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "review-explain-ai" }, state !== "done" && /* @__PURE__ */ React.createElement("button", { className: "explain-ai-btn", onClick: ask, disabled: state === "loading" }, state === "loading" ? "\u2728 Thinking\u2026" : "\u2728 Explain with AI"), state === "error" && /* @__PURE__ */ React.createElement("span", { className: "explain-ai-err" }, "Couldn't reach the AI tutor right now \u2014 please try again."), state === "done" && /* @__PURE__ */ React.createElement("div", { className: "explain-ai-out" }, /* @__PURE__ */ React.createElement("strong", null, "\u2728 AI explanation:"), " ", text));
}
function SectionReview({ sec, sectionId, answers, examName }) {
  const [expanded, setExpanded] = useStateT(false);
  const allQs = sec.parts ? sec.parts.flatMap((p) => (p.questions || []).map((q) => ({ q, part: p }))) : sec.passages ? sec.passages.flatMap((p) => (p.questions || []).map((q) => ({ q, passage: p }))) : sec.tasks ? sec.tasks.map((t, i) => ({ q: t, taskIdx: i })) : sec.cards ? sec.cards.map((c, i) => ({ q: c, cardIdx: i })) : [];
  const itemCount = allQs.length;
  if (!itemCount) return null;
  const isCorrect = (q, given) => {
    if (!q.type) return null;
    if (given == null || given === "") return false;
    if (q.type === "form_field" || q.type === "sent_fill") {
      const g = (given || "").toString().toLowerCase().trim();
      const correctVals = [q.answer, ...q.altAnswers || []].map((x) => (x || "").toLowerCase().trim());
      const expanded2 = correctVals.flatMap((v) => v.split(/\s*\/\s*/));
      return expanded2.some((v) => v && g === v);
    }
    if (q.type === "fill") {
      const a = (q.answer || "").toString().toLowerCase().trim();
      const g = (given || "").toString().toLowerCase().trim();
      const alts = (q.altAnswers || []).map((x) => x.toLowerCase().trim());
      return g === a || alts.includes(g);
    }
    if (q.type === "mcq_multi") {
      const exp = Array.isArray(q.answer) ? [...q.answer].sort().join(",") : "";
      const got = Array.isArray(given) ? [...given].sort().join(",") : String(given || "").split(",").map((x) => x.trim()).sort().join(",");
      return exp === got;
    }
    if (q.type === "mcq" || q.type === "tfng" || q.type === "yng" || q.type === "match_heading") {
      return given === q.answer;
    }
    return null;
  };
  return /* @__PURE__ */ React.createElement("div", { className: "report-section review-section" }, /* @__PURE__ */ React.createElement("div", { className: "review-header", onClick: () => setExpanded((e) => !e) }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4DD} Answers & explanations \u2014 ", sec.name), /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm" }, expanded ? "Hide \u25B2" : "Show all \u25BC")), !expanded && /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)", fontSize: 14, margin: "4px 0 0" } }, itemCount, " item", itemCount !== 1 ? "s" : "", '. Click "Show all" to review your answers, see correct responses, listen to the audio script, and read model answers.'), expanded && /* @__PURE__ */ React.createElement(React.Fragment, null, sec.parts && /* @__PURE__ */ React.createElement("div", { className: "review-scripts" }, /* @__PURE__ */ React.createElement("h4", null, "\u{1F3A7} Audio scripts"), sec.parts.map((p, pi) => /* @__PURE__ */ React.createElement("details", { key: p.id || pi, className: "review-script" }, /* @__PURE__ */ React.createElement("summary", null, "Part ", p.partNum || pi + 1, ": ", p.context || "Listening script"), /* @__PURE__ */ React.createElement("pre", { className: "script-text" }, (p.audioScript || "").trim())))), /* @__PURE__ */ React.createElement("div", { className: "review-list" }, allQs.map(({ q, part, passage, taskIdx, cardIdx }, idx) => {
    const key = sectionId + "_" + (q.id || idx);
    const given = answers[key];
    const correct = isCorrect(q, given);
    const objective = correct !== null;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: q.id || idx,
        className: "review-item " + (objective ? correct ? "review-correct" : "review-wrong" : "review-subjective")
      },
      /* @__PURE__ */ React.createElement("div", { className: "review-q-head" }, /* @__PURE__ */ React.createElement("span", { className: "review-q-num" }, "Q", q.num || idx + 1), objective && /* @__PURE__ */ React.createElement("span", { className: "review-badge" }, correct ? "\u2713 Correct" : "\u2717 Incorrect"), !objective && /* @__PURE__ */ React.createElement("span", { className: "review-badge review-badge--sub" }, "Subjective")),
      /* @__PURE__ */ React.createElement("div", { className: "review-q-text" }, q.type === "sent_fill" && q.sentenceText ? q.sentenceText.replace("__BLANK__", `[${q.answer}]`) : q.text || q.prompt || q.topic || ""),
      objective && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "review-row" }, /* @__PURE__ */ React.createElement("span", { className: "review-label" }, "Your answer:"), /* @__PURE__ */ React.createElement("span", { className: "review-value" }, formatAnswer(given) || /* @__PURE__ */ React.createElement("em", { style: { color: "var(--ink-4)" } }, "not answered"))), !correct && /* @__PURE__ */ React.createElement("div", { className: "review-row" }, /* @__PURE__ */ React.createElement("span", { className: "review-label" }, "Correct:"), /* @__PURE__ */ React.createElement("span", { className: "review-value review-value--correct" }, formatAnswer(q.answer))), q.explanation && /* @__PURE__ */ React.createElement("div", { className: "review-explanation" }, /* @__PURE__ */ React.createElement("strong", null, "Explanation:"), " ", q.explanation), q.solution && /* @__PURE__ */ React.createElement("div", { className: "review-explanation" }, /* @__PURE__ */ React.createElement("strong", null, "How to solve:"), " ", q.solution), /* @__PURE__ */ React.createElement(ExplainAI, { examName, q, given, correctText: formatAnswer(q.answer) })),
      q.type === "writing_task" || q.wordTarget ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "review-row" }, /* @__PURE__ */ React.createElement("span", { className: "review-label" }, "Word target:"), /* @__PURE__ */ React.createElement("span", { className: "review-value" }, q.wordTarget || 150, "+ words")), /* @__PURE__ */ React.createElement("div", { className: "review-row" }, /* @__PURE__ */ React.createElement("span", { className: "review-label" }, "You wrote:"), /* @__PURE__ */ React.createElement("span", { className: "review-value" }, given ? String(given).trim().split(/\s+/).filter(Boolean).length + " words" : /* @__PURE__ */ React.createElement("em", null, "not attempted"))), given && /* @__PURE__ */ React.createElement("details", { className: "review-script" }, /* @__PURE__ */ React.createElement("summary", null, "View your response"), /* @__PURE__ */ React.createElement("pre", { className: "script-text" }, given)), (q.modelAnswer || q.sampleAnswer || q.answerGuide || q.exampleAnswer) && /* @__PURE__ */ React.createElement("details", { className: "review-script", open: true }, /* @__PURE__ */ React.createElement("summary", null, "Model answer"), /* @__PURE__ */ React.createElement("pre", { className: "script-text" }, q.modelAnswer || q.sampleAnswer || q.answerGuide || q.exampleAnswer)), /* @__PURE__ */ React.createElement("div", { className: "review-explanation" }, /* @__PURE__ */ React.createElement("strong", null, "How to improve:"), " Compare your response to the model answer. Focus on task achievement, clarity of position, paragraph structure, and varied vocabulary.")) : null,
      (q.type === "speaking_task" || q.responseSeconds || q.topic || q.points && q.points.length > 0) && (sec.type === "speaking" || sec.type === "speaking_toefl") ? /* @__PURE__ */ React.createElement(SpeakingReviewItem, { q, given, sectionId }) : null
    );
  }))));
}
function formatAnswer(a) {
  if (a == null) return "";
  if (Array.isArray(a)) return a.join(", ");
  if (typeof a === "object") return Object.values(a).map((v) => v == null ? "" : String(v)).join(" / ");
  return String(a);
}
function isObjCorrect(q, given) {
  if (!q || !q.type) return null;
  if (given == null || given === "") return false;
  if (q.type === "form_field" || q.type === "sent_fill") {
    const g = (given || "").toString().toLowerCase().trim();
    const correctVals = [q.answer, ...q.altAnswers || []].map((x) => (x || "").toLowerCase().trim());
    return correctVals.flatMap((v) => v.split(/\s*\/\s*/)).some((v) => v && g === v);
  }
  if (q.type === "fill") {
    const a = (q.answer || "").toString().toLowerCase().trim();
    const g = (given || "").toString().toLowerCase().trim();
    return g === a || (q.altAnswers || []).map((x) => x.toLowerCase().trim()).includes(g);
  }
  if (q.type === "mcq_multi") {
    const exp = Array.isArray(q.answer) ? [...q.answer].sort().join(",") : "";
    const got = Array.isArray(given) ? [...given].sort().join(",") : String(given || "").split(",").map((x) => x.trim()).sort().join(",");
    return exp === got;
  }
  if (q.type === "mcq" || q.type === "tfng" || q.type === "yng" || q.type === "match_heading") return given === q.answer;
  return null;
}
function collectErrors(exam, config, answers) {
  try {
    const errs = JSON.parse(localStorage.getItem("lp_errors") || "[]");
    const existing = new Set(errs.map((e) => e.key));
    (config.sections || []).forEach((sec) => {
      const qs = sec.parts ? sec.parts.flatMap((p) => p.questions || []) : sec.passages ? sec.passages.flatMap((p) => p.questions || []) : sec.tasks ? sec.tasks : sec.cards ? sec.cards : [];
      qs.forEach((q, idx) => {
        const key = exam.id + "_" + sec.id + "_" + (q.id || idx);
        const given = answers[sec.id + "_" + (q.id || idx)];
        if (isObjCorrect(q, given) === false && !existing.has(key)) {
          errs.unshift({
            key,
            exam: exam.id,
            examName: exam.name,
            section: sec.name || sec.id,
            type: q.type,
            text: q.text || q.prompt || q.topic || "",
            options: Array.isArray(q.options) ? q.options.map((o) => typeof o === "string" ? o : o.text || o.label || o.value || "") : null,
            answer: q.answer,
            given,
            explanation: q.explanation || q.solution || "",
            ts: Date.now(),
            mastered: 0
          });
          existing.add(key);
        }
      });
    });
    localStorage.setItem("lp_errors", JSON.stringify(errs.slice(0, 200)));
  } catch (e) {
  }
}
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function ScoreCardButton({ exam, report }) {
  const [busy, setBusy] = useStateT(false);
  if (report.overall == null) return null;
  const draw = () => {
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 630;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0, 0, 1200, 630);
    g.addColorStop(0, "#4F46E5");
    g.addColorStop(1, "#7C3AED");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = "rgba(255,255,255,0.09)";
    roundRectPath(ctx, 60, 60, 1080, 510, 28);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 44px system-ui,Segoe UI,Arial";
    ctx.fillText("\u25B2 LandingPrep", 100, 150);
    ctx.font = "500 34px system-ui,Segoe UI,Arial";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(exam.name + " \xB7 Mock Test", 100, 225);
    ctx.font = "800 190px system-ui,Segoe UI,Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(String(report.overall), 100, 430);
    ctx.font = "600 42px system-ui,Segoe UI,Arial";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText(report.overallLabel || "Score", 100, 495);
    ctx.font = "500 30px system-ui,Segoe UI,Arial";
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.fillText("100% free practice \xB7 landingprep.com", 100, 545);
    return c;
  };
  const share = () => {
    setBusy(true);
    try {
      const c = draw();
      const fileName = "landingprep-" + exam.id + "-score.png";
      const finish = () => setBusy(false);
      if (c.toBlob) {
        c.toBlob(async (blob) => {
          try {
            const file = new File([blob], fileName, { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: "My " + exam.name + " score", text: "I scored " + report.overall + " on a free " + exam.name + " mock test at LandingPrep!" });
              return finish();
            }
          } catch (e) {
          }
          const a = document.createElement("a");
          a.href = c.toDataURL("image/png");
          a.download = fileName;
          a.click();
          finish();
        }, "image/png");
      } else {
        const a = document.createElement("a");
        a.href = c.toDataURL("image/png");
        a.download = fileName;
        a.click();
        finish();
      }
    } catch (e) {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: share, disabled: busy, title: "Download or share a score card image" }, busy ? "Preparing\u2026" : "\u{1F4E4} Share score card");
}
function ShareScoreCard({ exam, report }) {
  const [copied, setCopied] = useStateT(false);
  if (report == null || report.overall == null) return null;
  const examId = exam && exam.id || "exam";
  const examName = exam && exam.name || "English";
  const scoreTxt = String(report.overall) + (report.overallLabel ? " (" + report.overallLabel + ")" : "");
  const url = "https://landingprep.com/?utm_source=share&utm_medium=score&utm_campaign=" + encodeURIComponent(examId);
  const msg = "I scored " + scoreTxt + " on a free " + examName + " mock test on LandingPrep \u{1F3AF} Practise free for IELTS, TOEFL, PTE, GRE & GMAT \u{1F449} " + url;
  const ga = (method) => {
    try {
      if (typeof window.gtag === "function") window.gtag("event", "share", { method, content_type: "score", item_id: examId });
    } catch (e) {
    }
  };
  const copyMsg = async () => {
    ga("copy");
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      try {
        window.prompt("Copy your score message:", msg);
      } catch (e2) {
      }
    }
  };
  const nativeShare = async () => {
    ga("native");
    try {
      if (navigator.share) {
        await navigator.share({ title: "My " + examName + " score", text: msg, url });
        return;
      }
    } catch (e) {
      return;
    }
    copyMsg();
  };
  const enc = encodeURIComponent(msg);
  const encUrl = encodeURIComponent(url);
  const targets = [
    { label: "WhatsApp", emoji: "\u{1F7E2}", href: "https://wa.me/?text=" + enc, k: "whatsapp" },
    { label: "X", emoji: "\u2716\uFE0F", href: "https://twitter.com/intent/tweet?text=" + enc, k: "twitter" },
    { label: "Facebook", emoji: "\u{1F4D8}", href: "https://www.facebook.com/sharer/sharer.php?u=" + encUrl + "&quote=" + enc, k: "facebook" },
    { label: "LinkedIn", emoji: "\u{1F4BC}", href: "https://www.linkedin.com/sharing/share-offsite/?url=" + encUrl, k: "linkedin" },
    { label: "Telegram", emoji: "\u2708\uFE0F", href: "https://t.me/share/url?url=" + encUrl + "&text=" + enc, k: "telegram" }
  ];
  const canNative = typeof navigator !== "undefined" && !!navigator.share;
  return /* @__PURE__ */ React.createElement("div", { className: "share-score-card" }, /* @__PURE__ */ React.createElement("div", { className: "ssc-head" }, "\u{1F4E3} Share your score & challenge a friend"), /* @__PURE__ */ React.createElement("div", { className: "ssc-sub" }, "Tell friends you practised free \u2014 they can too. No signup, 100% free forever."), /* @__PURE__ */ React.createElement("div", { className: "ssc-actions" }, canNative && /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary ssc-native", onClick: nativeShare }, "\u{1F4F2} Share"), /* @__PURE__ */ React.createElement("button", { className: "btn ssc-copy", onClick: copyMsg }, copied ? "Copied! \u2705" : "\u{1F517} Copy link"), targets.map((t) => /* @__PURE__ */ React.createElement("a", { key: t.k, className: "ssc-net ssc-" + t.k, href: t.href, target: "_blank", rel: "noopener noreferrer", onClick: () => ga(t.k) }, /* @__PURE__ */ React.createElement("span", { "aria-hidden": "true" }, t.emoji), " ", t.label))));
}
function TestReport({ exam, config, answers, onBack, onNav, onRetake }) {
  const report = scoreTest(config, answers);
  const isEmpty = Object.values(answers).every((a) => {
    var _a;
    return !a || ((_a = a.trim) == null ? void 0 : _a.call(a)) === "";
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "exams", onNav }), /* @__PURE__ */ React.createElement("div", { className: "report-shell" }, isEmpty && /* @__PURE__ */ React.createElement("div", { className: "note", style: { marginBottom: 24 } }, "\u26A0 No answers were submitted. Complete the test before reviewing your score. Scores shown below reflect zero correct answers."), /* @__PURE__ */ React.createElement("div", { className: "report-hero" }, /* @__PURE__ */ React.createElement("div", { className: "rh-score" }, report.overall !== null ? report.overall : "\u2014"), /* @__PURE__ */ React.createElement("div", { className: "rh-label" }, report.overallLabel || "Score", " \xB7 ", exam.name)), /* @__PURE__ */ React.createElement(ShareScoreCard, { exam, report }), /* @__PURE__ */ React.createElement("div", { className: "score-grid" }, Object.entries(report.sections).map(([id, data]) => {
    var _a;
    return /* @__PURE__ */ React.createElement("div", { key: id, className: "score-cell" }, /* @__PURE__ */ React.createElement("div", { className: "sc-band" }, (_a = data.band) != null ? _a : "\u2014"), /* @__PURE__ */ React.createElement("div", { className: "sc-skill" }, data.label || id), data.total && /* @__PURE__ */ React.createElement("div", { className: "fine", style: { marginTop: 4 } }, data.correct, "/", data.total, " correct"));
  })), Object.entries(report.sections).map(([id, data]) => {
    var _a;
    return /* @__PURE__ */ React.createElement("div", { key: id, className: "report-section" }, /* @__PURE__ */ React.createElement("h3", null, data.label || id, " \u2014 Band ", (_a = data.band) != null ? _a : "\u2013"), data.total && /* @__PURE__ */ React.createElement("p", { style: { fontSize: 14, color: "var(--ink-3)", margin: "0 0 10px" } }, data.correct, " of ", data.total, " questions answered correctly (", Math.round(data.correct / data.total * 100), "%)"), (() => {
      const p = typeof data.pct === "number" ? data.pct : data.total ? Math.round(data.correct / data.total * 100) : 0;
      const tier = p >= 75 ? { i: "\u2705", t: "Excellent \u2014 a strong, exam-ready performance at this level." } : p >= 50 ? { i: "\u{1F4C8}", t: "Solid progress \u2014 review the misses below and push for higher accuracy." } : p >= 25 ? { i: "\u{1F4C9}", t: "Keep practising \u2014 focus on accuracy and timing, and study the model answers below." } : { i: "\u26A0\uFE0F", t: "This needs significant work. Review every answer and explanation below, then retry." };
      return /* @__PURE__ */ React.createElement("div", { className: "feedback-row" }, /* @__PURE__ */ React.createElement("span", { className: "fr-icon" }, tier.i), /* @__PURE__ */ React.createElement("span", null, tier.t));
    })(), (id === "writing" || id === "speaking" || id === "aw") && /* @__PURE__ */ React.createElement("div", { className: "feedback-row" }, /* @__PURE__ */ React.createElement("span", { className: "fr-icon" }, "\u{1F4A1}"), /* @__PURE__ */ React.createElement("span", null, "Writing and speaking scores are estimated based on word count, structure, and coherence signals. For accurate scoring, use the AI Writing Agent or speak with a qualified tutor.")));
  }), config.sections.map((sec) => /* @__PURE__ */ React.createElement(SectionReview, { key: sec.id, sec, sectionId: sec.id, answers, examName: exam && exam.name })), /* @__PURE__ */ React.createElement("div", { className: "report-section" }, /* @__PURE__ */ React.createElement("h3", null, "What to do next"), /* @__PURE__ */ React.createElement("div", { className: "feedback-row" }, /* @__PURE__ */ React.createElement("span", { className: "fr-icon" }, "\u{1F4DA}"), /* @__PURE__ */ React.createElement("span", null, "Visit the ", /* @__PURE__ */ React.createElement("strong", null, "Learning Club"), " for model answers, vocabulary, and topic practice.")), /* @__PURE__ */ React.createElement("div", { className: "feedback-row" }, /* @__PURE__ */ React.createElement("span", { className: "fr-icon" }, "\u270D\uFE0F"), /* @__PURE__ */ React.createElement("span", null, "Use the ", /* @__PURE__ */ React.createElement("strong", null, "Writing Agent"), " to get detailed feedback on your writing tasks.")), /* @__PURE__ */ React.createElement("div", { className: "feedback-row" }, /* @__PURE__ */ React.createElement("span", { className: "fr-icon" }, "\u{1F3A4}"), /* @__PURE__ */ React.createElement("span", null, "Use the ", /* @__PURE__ */ React.createElement("strong", null, "Speaking Agent"), " to practice two-way voice conversation.")), /* @__PURE__ */ React.createElement("div", { className: "feedback-row" }, /* @__PURE__ */ React.createElement("span", { className: "fr-icon" }, "\u{1F4CA}"), /* @__PURE__ */ React.createElement("span", null, "Track your progress over time in ", /* @__PURE__ */ React.createElement("strong", null, "My Progress"), "."))), /* @__PURE__ */ React.createElement("div", { className: "note" }, "Scores are indicative only. IELTS Listening and Reading use the official band conversion table. Writing and Speaking use a heuristic based on word count, task completion, and structure signals \u2014 not a live AI or human rater."), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12 report-actions", style: { marginTop: 28 } }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: onRetake }, "Take another test \u2192"), /* @__PURE__ */ React.createElement(ScoreCardButton, { exam, report }), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => window.print(), title: "Print or save your score report as PDF" }, "\u{1F5A8}\uFE0F Print / Save as PDF"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("learning") }, "Go to Learning Club"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: onBack }, "Back"))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
}
window.LP_MockTest = MockTest;
window.LP_buildTest = buildTest;
window.LP_SceneImage = SceneImage;
