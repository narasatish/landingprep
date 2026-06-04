"use strict";
(function() {
  const { useState, useRef, useEffect } = React;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const CEFR_ROWS = [
    { cefr: "C2", label: "Mastery", ielts: "8.5\u20139.0", toefl: "114\u2013120", pte: "85\u201390", celpip: "11\u201312", duolingo: "140\u2013160" },
    { cefr: "C1", label: "Advanced", ielts: "7.0\u20138.0", toefl: "95\u2013113", pte: "76\u201384", celpip: "9\u201310", duolingo: "120\u2013135" },
    { cefr: "B2", label: "Upper-Intermediate", ielts: "5.5\u20136.5", toefl: "72\u201394", pte: "59\u201375", celpip: "7\u20138", duolingo: "95\u2013115" },
    { cefr: "B1", label: "Intermediate", ielts: "4.0\u20135.0", toefl: "42\u201371", pte: "43\u201358", celpip: "5\u20136", duolingo: "60\u201390" },
    { cefr: "A2", label: "Elementary", ielts: "3.0\u20133.5", toefl: "30\u201341", pte: "30\u201342", celpip: "3\u20134", duolingo: "35\u201355" }
  ];
  const CONVERT_EXAMS = [
    { id: "ielts", name: "IELTS", min: 1, max: 9, step: 0.5, lb: [["C2", 8.5], ["C1", 7], ["B2", 5.5], ["B1", 4], ["A2", 0]] },
    { id: "toefl", name: "TOEFL iBT", min: 0, max: 120, step: 1, lb: [["C2", 114], ["C1", 95], ["B2", 72], ["B1", 42], ["A2", 0]] },
    { id: "pte", name: "PTE Academic", min: 10, max: 90, step: 1, lb: [["C2", 85], ["C1", 76], ["B2", 59], ["B1", 43], ["A2", 0]] },
    { id: "celpip", name: "CELPIP", min: 1, max: 12, step: 1, lb: [["C2", 11], ["C1", 9], ["B2", 7], ["B1", 5], ["A2", 0]] },
    { id: "duolingo", name: "Duolingo", min: 10, max: 160, step: 5, lb: [["C2", 140], ["C1", 120], ["B2", 95], ["B1", 60], ["A2", 0]] }
  ];
  function scoreToCEFR(exam, score) {
    const e = CONVERT_EXAMS.find((x) => x.id === exam);
    if (!e || isNaN(score)) return null;
    for (const [cefr, lo] of e.lb) if (score >= lo) return cefr;
    return "A2";
  }
  const ELIG = {
    ielts: { name: "IELTS", scale: "Band", countries: { Canada: 6, Australia: 6, UK: 5.5, USA: 6.5, "New Zealand": 6.5 } },
    toefl: { name: "TOEFL iBT", scale: "pts", countries: { USA: 80, Canada: 86, Germany: 80, UK: 80 } },
    pte: { name: "PTE Academic", scale: "pts", countries: { Australia: 50, Canada: 60, UK: 59, "New Zealand": 58 } },
    celpip: { name: "CELPIP", scale: "Level", countries: { Canada: 7 } },
    duolingo: { name: "Duolingo", scale: "pts", countries: { USA: 105, Canada: 110, UK: 110 } }
  };
  const PASSAGES = [
    { title: "Urban Green Spaces", words: 252, text: "Cities around the world are rediscovering the value of green spaces. For much of the twentieth century, urban planners prioritised roads, factories and housing, treating parks as a pleasant but optional extra. That attitude has shifted dramatically. Researchers now understand that access to trees, grass and water has measurable effects on physical and mental health. People who live near parks report lower levels of stress, take more exercise, and recover from illness more quickly than those surrounded only by concrete. Green spaces also perform practical functions that are easy to overlook. Trees absorb rainfall and reduce the risk of flooding during heavy storms. Their leaves filter dust and pollutants from the air, while their shade lowers temperatures during increasingly frequent heatwaves. A single mature tree can cool the area around it as effectively as several air conditioners, but without consuming electricity or releasing additional heat. Wildlife benefits too, as parks and gardens provide corridors that allow birds, insects and small mammals to move safely through the built environment. Despite these advantages, green space is unevenly distributed. Wealthier neighbourhoods often enjoy generous parks and tree-lined streets, while poorer districts may have almost none. Closing this gap has become a priority for many city governments, which are now planting trees, converting derelict land into community gardens, and even installing gardens on rooftops. The challenge is considerable, because land in growing cities is expensive and competition for it is fierce. Yet the evidence is increasingly clear: investing in nature is not a luxury but a sensible strategy for healthier, more resilient cities." },
    { title: "The Science of Sleep", words: 246, text: "Sleep occupies roughly a third of human life, yet for centuries it was dismissed as a passive state in which little of importance happened. Modern research has overturned that view completely. Far from switching off, the brain is intensely active during sleep, carrying out tasks that are essential for memory, learning and health. During the deepest stages of sleep, the brain consolidates the day's experiences, transferring fragile new memories into more stable long-term storage. Skills that are practised before sleep are often performed better the following morning, as if the brain has continued rehearsing them overnight. Sleep also appears to clear away waste products that accumulate in brain tissue during waking hours, a kind of nightly cleaning that may help protect against disease. The consequences of insufficient sleep are serious and wide-ranging. People who regularly sleep too little show reduced concentration, weaker immune responses and a greater risk of heart disease, diabetes and depression. Reaction times slow, and the ability to regulate emotions declines, making conflicts and mistakes more likely. Despite this, sleep is frequently sacrificed in modern societies that prize productivity and offer endless distractions on glowing screens. Scientists recommend a consistent schedule, a cool and dark bedroom, and a deliberate wind-down period before bed. They warn that no amount of weekend recovery can fully repair the damage of chronic sleep loss. Understanding sleep, then, is not merely an academic exercise but a practical necessity for anyone who wishes to think clearly and live well." }
  ];
  const SHADOW = [
    "The committee reached a unanimous decision after a lengthy discussion.",
    "Renewable energy is becoming increasingly affordable across the world.",
    "She articulated her argument with remarkable clarity and confidence.",
    "Understanding cultural differences is essential for effective communication.",
    "The proposal was rejected because it lacked sufficient supporting evidence."
  ];
  function Converter() {
    const [exam, setExam] = useState("ielts");
    const cfg = CONVERT_EXAMS.find((x) => x.id === exam);
    const [score, setScore] = useState(7);
    const cefr = scoreToCEFR(exam, parseFloat(score));
    const row = CEFR_ROWS.find((r) => r.cefr === cefr);
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "English Test Score Converter"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Convert between IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo and CEFR. Based on published concordance ranges."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "My test", /* @__PURE__ */ React.createElement("select", { value: exam, onChange: (e) => {
      setExam(e.target.value);
    } }, CONVERT_EXAMS.map((x) => /* @__PURE__ */ React.createElement("option", { key: x.id, value: x.id }, x.name)))), /* @__PURE__ */ React.createElement("label", null, "My score", /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: cfg.min,
        max: cfg.max,
        step: cfg.step,
        value: score,
        onChange: (e) => setScore(e.target.value)
      }
    ))), row ? /* @__PURE__ */ React.createElement("div", { className: "convert-out" }, /* @__PURE__ */ React.createElement("div", { className: "convert-cefr" }, /* @__PURE__ */ React.createElement("span", { className: "cefr-badge" }, row.cefr), " ", row.label), /* @__PURE__ */ React.createElement("div", { className: "convert-grid" }, [["IELTS", row.ielts], ["TOEFL iBT", row.toefl], ["PTE", row.pte], ["CELPIP", row.celpip], ["Duolingo", row.duolingo]].map(([k, v]) => /* @__PURE__ */ React.createElement("div", { key: k, className: "convert-cell" }, /* @__PURE__ */ React.createElement("span", null, k), /* @__PURE__ */ React.createElement("strong", null, v)))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Equivalent ranges at the same CEFR level. Always confirm exact requirements with the test maker or your university.")) : /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Enter a valid score to convert."));
  }
  function Eligibility() {
    const [exam, setExam] = useState("ielts");
    const e = ELIG[exam];
    const countries = Object.keys(e.countries);
    const [country, setCountry] = useState(countries[0]);
    const [score, setScore] = useState("");
    const min = e.countries[country] != null ? e.countries[country] : e.countries[countries[0]];
    const realCountry = e.countries[country] != null ? country : countries[0];
    const s = parseFloat(score);
    const has = score !== "" && !isNaN(s);
    const ok = has && s >= e.countries[realCountry];
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "Study-Abroad Eligibility Checker"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "See whether your score clears the typical minimum for your destination."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Test", /* @__PURE__ */ React.createElement("select", { value: exam, onChange: (ev) => {
      const nx = ev.target.value;
      setExam(nx);
      setCountry(Object.keys(ELIG[nx].countries)[0]);
    } }, Object.keys(ELIG).map((id) => /* @__PURE__ */ React.createElement("option", { key: id, value: id }, ELIG[id].name)))), /* @__PURE__ */ React.createElement("label", null, "Destination", /* @__PURE__ */ React.createElement("select", { value: realCountry, onChange: (ev) => setCountry(ev.target.value) }, countries.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c)))), /* @__PURE__ */ React.createElement("label", null, "My score", /* @__PURE__ */ React.createElement("input", { type: "number", value: score, onChange: (ev) => setScore(ev.target.value), placeholder: `${e.scale}` }))), /* @__PURE__ */ React.createElement("div", { className: "elig-result " + (has ? ok ? "good" : "warn" : "idle") }, !has ? /* @__PURE__ */ React.createElement("span", null, "Enter your score to check eligibility.") : ok ? /* @__PURE__ */ React.createElement("span", null, "\u2705 Likely eligible \u2014 you meet the typical minimum for ", realCountry, " (", e.name, " ", e.countries[realCountry], e.scale === "pts" ? "" : "", ").") : /* @__PURE__ */ React.createElement("span", null, "\u26A0\uFE0F Below the typical minimum for ", realCountry, " (", e.name, " ", e.countries[realCountry], "). Keep practising \u2014 you're close!")), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Guidance only. Minimums vary by university, course and visa stream \u2014 always verify with the official body."));
  }
  function ReadingSpeed() {
    const [idx] = useState(() => Math.floor(Date.now() / 864e5) % PASSAGES.length);
    const p = PASSAGES[idx];
    const [phase, setPhase] = useState("ready");
    const startRef = useRef(0);
    const [wpm, setWpm] = useState(0);
    const start = () => {
      startRef.current = Date.now();
      setPhase("reading");
    };
    const finish = () => {
      const mins = (Date.now() - startRef.current) / 6e4;
      setWpm(mins > 0 ? Math.round(p.words / mins) : 0);
      setPhase("done");
    };
    const verdict = (w) => w >= 250 ? ["Excellent", "good"] : w >= 180 ? ["Solid \u2014 exam-ready pace", "good"] : w >= 120 ? ["Average \u2014 push for 200+ wpm", "warn"] : ["Slow \u2014 practise daily reading", "warn"];
    const v = verdict(wpm);
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "Reading Speed Test"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Read the passage naturally, then stop the timer. IELTS, TOEFL and GRE reading reward 200+ words per minute with comprehension."), phase === "ready" && /* @__PURE__ */ React.createElement("div", { className: "reading-cta" }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, p.title), " \xB7 ", p.words, " words"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: start }, "\u25B6 Start reading")), phase === "reading" && /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "reading-text" }, p.text), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: finish }, "\u23F9 I've finished \u2014 show my speed")), phase === "done" && /* @__PURE__ */ React.createElement("div", { className: "reading-result " + v[1] }, /* @__PURE__ */ React.createElement("div", { className: "big-wpm" }, wpm, /* @__PURE__ */ React.createElement("span", null, " wpm")), /* @__PURE__ */ React.createElement("div", null, v[0]), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => setPhase("ready") }, "Try again")));
  }
  function Shadow() {
    const [i, setI] = useState(0);
    const sentence = SHADOW[i];
    const [heard, setHeard] = useState("");
    const [score, setScore] = useState(null);
    const [listening, setListening] = useState(false);
    const recRef = useRef(null);
    const speak = async () => {
      try {
        if (window.LP_TTS && window.LP_TTS.isEnabled && window.LP_TTS.isEnabled()) {
          await window.LP_TTS.speakOne(sentence, window.LP_TTS.voices.female1);
          return;
        }
      } catch (e) {
      }
      try {
        const u = new SpeechSynthesisUtterance(sentence);
        window.speechSynthesis.speak(u);
      } catch (e) {
      }
    };
    const norm = (t) => (t || "").toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
    const grade = (said) => {
      const target = norm(sentence), got = new Set(norm(said));
      if (!target.length) return 0;
      const hit = target.filter((w) => got.has(w)).length;
      return Math.round(hit / target.length * 100);
    };
    const listen = () => {
      if (!SR) {
        setHeard("Speech recognition isn't supported in this browser. Try Chrome.");
        return;
      }
      const r = new SR();
      recRef.current = r;
      r.lang = "en-US";
      r.interimResults = false;
      r.maxAlternatives = 1;
      setHeard("");
      setScore(null);
      setListening(true);
      r.onresult = (ev) => {
        const t = ev.results[0][0].transcript;
        setHeard(t);
        setScore(grade(t));
      };
      r.onerror = () => setListening(false);
      r.onend = () => setListening(false);
      try {
        r.start();
      } catch (e) {
        setListening(false);
      }
    };
    const next = () => {
      setI((i + 1) % SHADOW.length);
      setHeard("");
      setScore(null);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "Listen & Repeat (Shadowing)"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Hear a sentence, repeat it aloud, and get a pronunciation match score. Great for fluency and accent."), /* @__PURE__ */ React.createElement("div", { className: "shadow-sentence" }, "\u201C", sentence, "\u201D"), /* @__PURE__ */ React.createElement("div", { className: "tool-row btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: speak }, "\u{1F50A} Hear it"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: listen, disabled: listening }, listening ? "\u{1F3A4} Listening\u2026" : "\u{1F3A4} Repeat it"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: next }, "Next sentence \u2192")), heard && /* @__PURE__ */ React.createElement("div", { className: "shadow-heard" }, "You said: ", /* @__PURE__ */ React.createElement("em", null, heard)), score != null && /* @__PURE__ */ React.createElement("div", { className: "shadow-score " + (score >= 80 ? "good" : score >= 50 ? "warn" : "bad") }, "Match: ", /* @__PURE__ */ React.createElement("strong", null, score, "%"), " ", score >= 80 ? "\u2014 excellent!" : score >= 50 ? "\u2014 close, try again" : "\u2014 listen again and repeat slowly"), !SR && /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Tip: the microphone match works best in Google Chrome."));
  }
  function syllables(w) {
    w = w.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return w ? 1 : 0;
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
    const m = w.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  }
  function WordCheck() {
    const [text, setText] = useState("");
    const words = text.trim().match(/\b[\w'-]+\b/g) || [];
    const wc = words.length;
    const sentences = (text.match(/[.!?]+(?:\s|$)/g) || []).length || (text.trim() ? 1 : 0);
    const paras = text.trim() ? text.trim().split(/\n\s*\n/).filter(Boolean).length : 0;
    const chars = text.replace(/\s/g, "").length;
    const syl = words.reduce((a, w) => a + syllables(w), 0);
    const avgSentLen = sentences ? wc / sentences : 0;
    const flesch = wc ? Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * avgSentLen - 84.6 * (syl / wc)))) : 0;
    const grade = wc ? Math.max(1, Math.round(0.39 * avgSentLen + 11.8 * (syl / wc) - 15.59)) : 0;
    const readMin = wc / 200, speakMin = wc / 130;
    const fmt = (m) => m < 1 ? Math.round(m * 60) + "s" : Math.floor(m) + "m " + Math.round(m % 1 * 60) + "s";
    const longSent = (text.match(/[^.!?]+[.!?]+/g) || []).map((s) => ({ s: s.trim(), n: (s.trim().match(/\b[\w'-]+\b/g) || []).length })).filter((x) => x.n > 30).sort((a, b) => b.n - a.n).slice(0, 3);
    const ease = flesch >= 60 ? "easy to read" : flesch >= 40 ? "fairly hard (academic)" : "very hard / dense";
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4CA} Word count & readability"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Paste your essay or speaking script. Check word count against IELTS/TOEFL targets, reading/speaking time and readability \u2014 all in your browser, nothing stored."), /* @__PURE__ */ React.createElement("textarea", { className: "bc-textarea", rows: 10, placeholder: "Paste your text here\u2026", value: text, onChange: (e) => setText(e.target.value) })), wc > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "wc-grid" }, /* @__PURE__ */ React.createElement("div", { className: "wc-stat" }, /* @__PURE__ */ React.createElement("div", { className: "wc-num" }, wc), /* @__PURE__ */ React.createElement("div", { className: "wc-lbl" }, "words")), /* @__PURE__ */ React.createElement("div", { className: "wc-stat" }, /* @__PURE__ */ React.createElement("div", { className: "wc-num" }, sentences), /* @__PURE__ */ React.createElement("div", { className: "wc-lbl" }, "sentences")), /* @__PURE__ */ React.createElement("div", { className: "wc-stat" }, /* @__PURE__ */ React.createElement("div", { className: "wc-num" }, paras), /* @__PURE__ */ React.createElement("div", { className: "wc-lbl" }, "paragraphs")), /* @__PURE__ */ React.createElement("div", { className: "wc-stat" }, /* @__PURE__ */ React.createElement("div", { className: "wc-num" }, chars), /* @__PURE__ */ React.createElement("div", { className: "wc-lbl" }, "characters")), /* @__PURE__ */ React.createElement("div", { className: "wc-stat" }, /* @__PURE__ */ React.createElement("div", { className: "wc-num" }, Math.round(avgSentLen)), /* @__PURE__ */ React.createElement("div", { className: "wc-lbl" }, "avg words/sentence")), /* @__PURE__ */ React.createElement("div", { className: "wc-stat" }, /* @__PURE__ */ React.createElement("div", { className: "wc-num" }, fmt(speakMin)), /* @__PURE__ */ React.createElement("div", { className: "wc-lbl" }, "speaking time"))), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h4", null, "Readability"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub", style: { marginTop: 4 } }, "Flesch reading ease ", /* @__PURE__ */ React.createElement("strong", null, flesch, "/100"), " (", ease, ") \xB7 approx. grade level ", /* @__PURE__ */ React.createElement("strong", null, grade), " \xB7 reading time ", fmt(readMin), "."), /* @__PURE__ */ React.createElement("div", { className: "wc-targets" }, /* @__PURE__ */ React.createElement("span", { className: "wc-pill " + (wc >= 250 ? "ok" : "") }, "IELTS Task 2: 250+ ", wc >= 250 ? "\u2713" : "(" + (250 - wc) + " more)"), /* @__PURE__ */ React.createElement("span", { className: "wc-pill " + (wc >= 150 ? "ok" : "") }, "IELTS Task 1: 150+ ", wc >= 150 ? "\u2713" : "(" + (150 - wc) + " more)"), /* @__PURE__ */ React.createElement("span", { className: "wc-pill" }, "TOEFL essay: 300+")), longSent.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "wc-warn" }, /* @__PURE__ */ React.createElement("strong", null, "\u26A0\uFE0F Long sentences (", longSent.length, "):"), " over 30 words can hurt clarity. Consider splitting:", /* @__PURE__ */ React.createElement("ul", null, longSent.map((x, i) => /* @__PURE__ */ React.createElement("li", { key: i }, x.n, " words \u2014 \u201C", x.s.slice(0, 80), "\u2026\u201D")))))));
  }
  const CLB_IELTS = [
    { clb: 10, L: 8.5, R: 8, W: 7.5, S: 7.5 },
    { clb: 9, L: 8, R: 7, W: 7, S: 7 },
    { clb: 8, L: 7.5, R: 6.5, W: 6.5, S: 6.5 },
    { clb: 7, L: 6, R: 6, W: 6, S: 6 },
    { clb: 6, L: 5.5, R: 5, W: 5.5, S: 5.5 },
    { clb: 5, L: 5, R: 4, W: 5, S: 5 },
    { clb: 4, L: 4.5, R: 3.5, W: 4, S: 4 }
  ];
  function ieltsToCLB(skill, score) {
    if (isNaN(score)) return null;
    for (const row of CLB_IELTS) if (score >= row[skill]) return row.clb;
    return 0;
  }
  function CLBConverter() {
    const SK = [["L", "Listening"], ["R", "Reading"], ["W", "Writing"], ["S", "Speaking"]];
    const [v, setV] = useState({ L: "", R: "", W: "", S: "" });
    const clbs = SK.map(([k]) => v[k] === "" ? null : ieltsToCLB(k, parseFloat(v[k])));
    const filled = clbs.every((c) => c != null);
    const overall = filled ? Math.min(...clbs) : null;
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F341} IELTS \u2192 CLB Calculator (Canada PR)"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Convert your IELTS General Training scores to Canadian Language Benchmarks (CLB) for Express Entry. Your CRS language points are driven by your ", /* @__PURE__ */ React.createElement("strong", null, "lowest"), " skill, so every band counts."), /* @__PURE__ */ React.createElement("div", { className: "clb-inputs" }, SK.map(([k, label]) => /* @__PURE__ */ React.createElement("label", { key: k }, label, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "0",
        max: "9",
        step: "0.5",
        placeholder: "0\u20139",
        value: v[k],
        onChange: (e) => setV({ ...v, [k]: e.target.value })
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "clb-skill-out" }, v[k] === "" ? "\u2014" : ieltsToCLB(k, parseFloat(v[k])) ? "CLB " + ieltsToCLB(k, parseFloat(v[k])) : "< CLB 4")))), filled && /* @__PURE__ */ React.createElement("div", { className: "clb-result " + (overall >= 9 ? "good" : overall >= 7 ? "warn" : "idle") }, /* @__PURE__ */ React.createElement("div", { className: "clb-big" }, "CLB ", overall), /* @__PURE__ */ React.createElement("div", null, overall >= 9 ? "Strong \u2014 CLB 9+ unlocks the most CRS language points." : overall >= 7 ? "Eligible \u2014 CLB 7 is the usual Express Entry minimum; push your weakest skill higher for more points." : "Below CLB 7 \u2014 most Express Entry programs need CLB 7+. Focus on your lowest skill.")), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Based on IRCC's IELTS General Training \u2194 CLB equivalency. Always confirm current rules on the official IRCC site."));
  }
  function Countdown() {
    const [date, setDate] = useState("");
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const target = date ? /* @__PURE__ */ new Date(date + "T00:00:00") : null;
    const days = target && !isNaN(target) ? Math.round((target - today) / 864e5) : null;
    const weeks = days != null ? Math.floor(days / 7) : null;
    const pace = days != null && days > 0 ? days >= 56 ? "Plenty of time \u2014 a steady 1\u20132 hours a day will do it." : days >= 21 ? "Good runway \u2014 aim for 2 hours a day and a full mock each week." : days >= 7 ? "Crunch time \u2014 2\u20133 focused hours a day and daily section drills." : "Final stretch \u2014 light revision, a mock yesterday, and rest before test day." : null;
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u23F3 Exam Countdown"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Pick your test date to see how long you have \u2014 and the study pace that fits."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "My test date", /* @__PURE__ */ React.createElement("input", { type: "date", value: date, onChange: (e) => setDate(e.target.value) }))), days != null && (days > 0 ? /* @__PURE__ */ React.createElement("div", { className: "countdown-out good" }, /* @__PURE__ */ React.createElement("div", { className: "countdown-big" }, days, /* @__PURE__ */ React.createElement("span", null, " day", days === 1 ? "" : "s")), /* @__PURE__ */ React.createElement("div", { className: "countdown-sub" }, "\u2248 ", weeks, " week", weeks === 1 ? "" : "s", " away"), /* @__PURE__ */ React.createElement("div", { className: "countdown-pace" }, pace)) : days === 0 ? /* @__PURE__ */ React.createElement("div", { className: "countdown-out warn" }, /* @__PURE__ */ React.createElement("div", { className: "countdown-big" }, "Today \u{1F3AF}"), /* @__PURE__ */ React.createElement("div", { className: "countdown-pace" }, "It's test day \u2014 stay calm, you've got this. Arrive early and breathe.")) : /* @__PURE__ */ React.createElement("div", { className: "countdown-out idle" }, /* @__PURE__ */ React.createElement("div", { className: "countdown-sub" }, "That date has passed. Pick an upcoming date, or book your next attempt and aim higher."))));
  }
  function Pomodoro() {
    const FOCUS = 25 * 60, BREAK = 5 * 60;
    const [secs, setSecs] = useState(FOCUS);
    const [running, setRunning] = useState(false);
    const [mode, setMode] = useState("focus");
    const [done, setDone] = useState(0);
    useEffect(() => {
      if (!running) return;
      const t = setInterval(() => {
        setSecs((s) => {
          if (s > 1) return s - 1;
          if (mode === "focus") {
            setDone((d) => d + 1);
            setMode("break");
            return BREAK;
          }
          setMode("focus");
          return FOCUS;
        });
      }, 1e3);
      return () => clearInterval(t);
    }, [running, mode]);
    const total = mode === "focus" ? FOCUS : BREAK;
    const pct = Math.round((total - secs) / total * 100);
    const mm = String(Math.floor(secs / 60)).padStart(2, "0");
    const ss = String(secs % 60).padStart(2, "0");
    const reset = () => {
      setRunning(false);
      setMode("focus");
      setSecs(FOCUS);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F345} Focus Timer"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "The Pomodoro technique: 25 minutes of focused study, then a 5-minute break. Repeat to beat procrastination and study longer without burning out."), /* @__PURE__ */ React.createElement("div", { className: "pomo-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "pomo-ring " + mode, style: { "--pct": pct + "%" } }, /* @__PURE__ */ React.createElement("div", { className: "pomo-inner" }, /* @__PURE__ */ React.createElement("div", { className: "pomo-time" }, mm, ":", ss), /* @__PURE__ */ React.createElement("div", { className: "pomo-mode" }, mode === "focus" ? "Focus" : "Break"))), /* @__PURE__ */ React.createElement("div", { className: "tool-row btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: () => setRunning((r) => !r) }, running ? "\u23F8 Pause" : "\u25B6 Start"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: reset }, "\u21BA Reset")), /* @__PURE__ */ React.createElement("div", { className: "pomo-count" }, "\u2705 ", done, " focus session", done === 1 ? "" : "s", " completed")));
  }
  const TOOLS_META = [
    { id: "planner", icon: "\u{1F4C5}", name: "AI Study Plan", desc: "Personalised plan to your test date" },
    { id: "convert", icon: "\u{1F501}", name: "Score Converter", desc: "IELTS \xB7 TOEFL \xB7 PTE \xB7 CELPIP \xB7 DET" },
    { id: "clb", icon: "\u{1F341}", name: "IELTS \u2192 CLB", desc: "Canada PR / Express Entry levels" },
    { id: "writing", icon: "\u{1F4CA}", name: "Word & Readability", desc: "Count, timing & readability" },
    { id: "reading", icon: "\u26A1", name: "Reading Speed", desc: "Words-per-minute test" },
    { id: "shadow", icon: "\u{1F3A4}", name: "Listen & Repeat", desc: "Pronunciation shadowing" },
    { id: "countdown", icon: "\u23F3", name: "Exam Countdown", desc: "Days left + study pace" },
    { id: "timer", icon: "\u{1F345}", name: "Focus Timer", desc: "Pomodoro study sessions" }
  ];
  function Tools({ onNav, initialTab }) {
    const validTabs = ["planner", "convert", "clb", "writing", "reading", "shadow", "countdown", "timer"];
    const startTab = initialTab === "eligibility" ? "convert" : initialTab;
    const [tab, setTab] = useState(validTabs.includes(startTab) ? startTab : "planner");
    useEffect(() => {
      if (!window.LP_SEO) return;
      window.LP_SEO.set({
        title: "Free Exam Tools \u2014 AI Study Planner, Score Converter, Eligibility | LandingPrep",
        description: "Free exam-prep tools: AI study planner, IELTS\u2194TOEFL\u2194PTE score converter, study-abroad eligibility checker, reading-speed test and listen-&-repeat pronunciation trainer. No signup.",
        keywords: "ielts study plan, ai study planner, ielts to toefl converter, pte to ielts, english score converter, study abroad eligibility, reading speed test, ielts band calculator"
      });
    }, []);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "tools", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell" }, /* @__PURE__ */ React.createElement("header", { className: "tools-hero" }, /* @__PURE__ */ React.createElement("div", { className: "home-hero-photo sa-hero-photo" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        src: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=70",
        alt: "Laptop, notebook and coffee \u2014 planning exam prep",
        loading: "lazy",
        onError: (e) => {
          const p = e.target.closest(".home-hero-photo");
          if (p) p.classList.add("no-photo");
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "hhp-overlay" }), /* @__PURE__ */ React.createElement("div", { className: "ep-hero-cap" }, /* @__PURE__ */ React.createElement("h1", null, "Free Exam Tools"), /* @__PURE__ */ React.createElement("p", null, "Plan your prep, convert scores, check eligibility, time your reading and sharpen pronunciation \u2014 all free, in your browser.")))), /* @__PURE__ */ React.createElement("div", { className: "tool-launcher" }, TOOLS_META.map((t, i) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: t.id,
        type: "button",
        className: "tool-launch-card" + (tab === t.id ? " active" : ""),
        style: { animationDelay: i * 45 + "ms" },
        onClick: () => setTab(t.id)
      },
      /* @__PURE__ */ React.createElement("span", { className: "tlc-icon" }, t.icon),
      /* @__PURE__ */ React.createElement("span", { className: "tlc-name" }, t.name),
      /* @__PURE__ */ React.createElement("span", { className: "tlc-desc" }, t.desc)
    ))), /* @__PURE__ */ React.createElement("div", { className: "tool-panel", key: tab }, tab === "planner" && (window.LP_StudyPlannerPanel ? /* @__PURE__ */ React.createElement(window.LP_StudyPlannerPanel, { onNav }) : /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Study planner is loading\u2026"))), tab === "convert" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Converter, null), /* @__PURE__ */ React.createElement(Eligibility, null)), tab === "clb" && /* @__PURE__ */ React.createElement(CLBConverter, null), tab === "writing" && /* @__PURE__ */ React.createElement(WordCheck, null), tab === "reading" && /* @__PURE__ */ React.createElement(ReadingSpeed, null), tab === "shadow" && /* @__PURE__ */ React.createElement(Shadow, null), tab === "countdown" && /* @__PURE__ */ React.createElement(Countdown, null), tab === "timer" && /* @__PURE__ */ React.createElement(Pomodoro, null)), /* @__PURE__ */ React.createElement("div", { className: "tools-foot" }, /* @__PURE__ */ React.createElement("a", { className: "tool-btn ghost", onClick: () => onNav && onNav("colleges") }, "\u{1F3DB}\uFE0F College predictor & study-abroad tools \u2192"))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_Tools = Tools;
})();
