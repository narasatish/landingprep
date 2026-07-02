"use strict";
(function() {
  const { useState, useRef, useEffect } = React;
  const QUESTIONS = {
    USA: [
      { q: "Why do you want to study in the USA instead of your home country?", tip: "Name specific program strengths, faculty or research \u2014 not just 'better education'. Show genuine academic intent." },
      { q: "Why did you choose this particular university and course?", tip: "Mention the curriculum, professors, ranking for your field and how it fits your goals. Avoid 'it was easy to get in'." },
      { q: "How many universities did you apply to, and which ones accepted you?", tip: "Answer honestly with numbers. Officers check whether this university was a considered choice, not a fallback." },
      { q: "Who is sponsoring your education and what do they do?", tip: "State your sponsor clearly, their occupation and that funds are sufficient and genuine. Have figures ready." },
      { q: "What is your sponsor's annual income? How will you cover the total cost?", tip: "Know the exact numbers: annual income, tuition + living cost, and how much is savings vs loan. Vague finances are the #1 rejection reason." },
      { q: "You have a gap year / backlogs \u2014 explain them.", tip: "Own it briefly: what you did in the gap (work, courses) or how you cleared backlogs. Never sound defensive or make excuses." },
      { q: "What are your plans after graduation?", tip: "Show ties to home / a clear career plan. For F-1, emphasise intent consistent with a temporary visa." },
      { q: "Do you have relatives or friends in the USA?", tip: "Answer honestly and briefly; disclose any relatives without over-explaining. Inconsistency here is a credibility killer." },
      { q: "Why should I approve your visa?", tip: "A 20-second closing summary: genuine student + strong academics + funds ready + clear plan. Calm confidence, no begging." }
    ],
    UK: [
      { q: "Why do you want to study in the UK?", tip: "Reference the one-year master's, your course content and career relevance \u2014 be specific." },
      { q: "Why this university? What other offers did you have?", tip: "Compare honestly \u2014 mention rankings for your subject, modules or industry links that decided it." },
      { q: "How will you fund your studies and living costs?", tip: "Show maintenance funds meeting UKVI requirements held for the required 28 days; mention any scholarship/loan." },
      { q: "What do you know about your course modules?", tip: "Name 2\u20133 modules and why they matter to your goals \u2014 proves you're a genuine student." },
      { q: "Where will you live, and what are your estimated monthly costs?", tip: "Know your city's realistic rent + living costs (London vs elsewhere differ). Shows real preparation." },
      { q: "What are your plans after completing your degree?", tip: "Mention the Graduate Route honestly and a credible career direction." }
    ],
    Canada: [
      { q: "Why did you choose to study in Canada?", tip: "Talk about your program, the institution (a DLI) and Canada's strengths in your field." },
      { q: "How will you finance your studies and stay?", tip: "Reference your GIC, first-year tuition payment and proof of funds; be precise with amounts." },
      { q: "Why this program \u2014 how does it connect to your past studies or work?", tip: "Draw a clear line: background \u2192 this program \u2192 career. A logical study plan is what officers look for." },
      { q: "Will you return to your home country after your studies?", tip: "Show ties and a plan; if pursuing PGWP/PR, be honest and consistent \u2014 never contradict your SOP." },
      { q: "Why this college and not one in your home country?", tip: "Highlight specific program quality, co-op options and outcomes." }
    ],
    Australia: [
      { q: "Why do you want to study in Australia (Genuine Student)?", tip: "Explain your course choice, career relevance and why now \u2014 the GS test assesses genuine intent." },
      { q: "How will you support yourself financially?", tip: "Show funds meeting the savings requirement (about AUD 29,710/yr living) plus tuition." },
      { q: "What do you know about your course structure and the institution?", tip: "Name the units/majors and why they fit. Generic answers fail the Genuine Student assessment." },
      { q: "Have you ever been refused a visa for any country?", tip: "Disclose truthfully \u2014 refusals are on record, and hiding one is worse than having one." },
      { q: "What are your plans after your course finishes?", tip: "Give a credible plan; you can mention the 485 visa honestly." }
    ],
    Germany: [
      { q: "Why do you want to study in Germany?", tip: "Mention low/zero tuition honestly but LEAD with academics: the program, the university's strength in your field, industry links." },
      { q: "How will you finance your stay?", tip: "Reference your blocked account (Sperrkonto, ~EUR 11,904/yr) and who funded it. Precise figures build credibility." },
      { q: "Why this course, and what do you know about its contents?", tip: "Name modules and how they build on your bachelor's. German officers probe academic fit hard." },
      { q: "Do you speak German? How will you manage daily life?", tip: "Be honest about your level; mention any A1/A2 course and willingness to learn \u2014 it signals genuine settlement readiness." },
      { q: "What will you do after graduating?", tip: "You can honestly mention the 18-month job-seeker residence permit and your target industry in Germany or home." }
    ],
    Ireland: [
      { q: "Why did you choose Ireland for your studies?", tip: "Mention your course, the university, and Ireland's strengths (tech/pharma hub, English-speaking EU) \u2014 specific to YOUR field." },
      { q: "How are you funding your education?", tip: "Show tuition paid/payable plus the ~EUR 10,000 living funds requirement; name the source." },
      { q: "What do you know about your college and course?", tip: "Name modules, duration and why this program over alternatives \u2014 genuine-student evidence." },
      { q: "What are your plans after finishing your course?", tip: "You can honestly mention the Third Level Graduate Programme (up to 24 months) and a clear career direction." }
    ]
  };
  const COUNTRIES = Object.keys(QUESTIONS);
  function VisaInterviewPanel({ country }) {
    const start = COUNTRIES.includes(country) ? country : "USA";
    const [c, setC] = useState(start);
    const [idx, setIdx] = useState(0);
    const [answer, setAnswer] = useState("");
    const [fb, setFb] = useState(null);
    const [busy, setBusy] = useState(false);
    const [listening, setListening] = useState(false);
    const recogRef = useRef(null);
    const list = QUESTIONS[c];
    const cur = list[idx];
    const micSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const startMic = () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      const recog = new SR();
      recog.lang = "en-US";
      recog.continuous = true;
      recog.interimResults = true;
      recog.onresult = (e) => {
        let t = "";
        for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript + " ";
        setAnswer(t.trim());
      };
      recog.onerror = () => setListening(false);
      recog.onend = () => setListening(false);
      recogRef.current = recog;
      setListening(true);
      recog.start();
    };
    const stopMic = () => {
      try {
        recogRef.current && recogRef.current.stop();
      } catch (e) {
      }
      setListening(false);
    };
    useEffect(() => () => stopMic(), []);
    const review = async () => {
      if (!answer.trim()) return;
      stopMic();
      setBusy(true);
      setFb(null);
      const prompt = `You are a ${c} student-visa officer and coach. The applicant was asked: "${cur.q}". Their answer: "${answer.trim()}". In under 140 words give: (1) a credibility score out of 10, (2) what worked, (3) 2 specific improvements, (4) one red flag to avoid. Be direct and practical.`;
      let out = "";
      try {
        if (window.LP_AI_TUTOR && window.LP_AI_TUTOR.generate) {
          const r = (await window.LP_AI_TUTOR.generate(prompt) || "").trim();
          if (r && !/(?:AI|Smart) Tutor is offline/i.test(r) && !r.startsWith("\u26A0")) out = r;
        }
      } catch (e) {
      }
      if (!out) out = "AI is offline \u2014 self-check against this model guidance: " + cur.tip + " Make sure your answer is specific, consistent with your documents, confident and concise (under 30 seconds spoken).";
      setFb(out);
      setBusy(false);
    };
    const next = () => {
      stopMic();
      setIdx((i) => (i + 1) % list.length);
      setAnswer("");
      setFb(null);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "visa-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F6C2} Visa Interview \u2014 Mock & Coach"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Practise real student-visa interview questions ", /* @__PURE__ */ React.createElement("strong", null, "out loud"), " \u2014 speak your answer into the mic (or type it) and get instant feedback on credibility, clarity and red flags."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Destination", /* @__PURE__ */ React.createElement("select", { value: c, onChange: (e) => {
      stopMic();
      setC(e.target.value);
      setIdx(0);
      setAnswer("");
      setFb(null);
    } }, COUNTRIES.map((x) => /* @__PURE__ */ React.createElement("option", { key: x, value: x }, x)))), /* @__PURE__ */ React.createElement("div", { className: "visa-progress" }, "Question ", idx + 1, " of ", list.length))), /* @__PURE__ */ React.createElement("div", { className: "tool-card visa-q-card" }, /* @__PURE__ */ React.createElement("div", { className: "visa-q" }, "\u2753 ", cur.q), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        className: "visa-answer",
        rows: 4,
        value: answer,
        onChange: (e) => setAnswer(e.target.value),
        placeholder: micSupported ? "Tap \u{1F3A4} and answer aloud like you would to the officer \u2014 or type here\u2026" : "Type your answer as you would say it to the officer\u2026"
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "visa-btns" }, micSupported && /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "tool-btn" + (listening ? "" : " ghost"),
        onClick: listening ? stopMic : startMic,
        style: listening ? { background: "#dc2626", color: "#fff", border: "none" } : void 0
      },
      listening ? "\u23F9 Stop \u2014 I'm done" : "\u{1F3A4} Answer aloud"
    ), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: review, disabled: busy || !answer.trim() }, busy ? "\u2728 Reviewing\u2026" : "\u2728 Get instant feedback"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: next }, "Next question \u2192")), listening && /* @__PURE__ */ React.createElement("p", { className: "visa-tip", style: { color: "#dc2626", fontWeight: 600 } }, "\u25CF Listening\u2026 speak naturally, then press Stop."), !fb && !listening && /* @__PURE__ */ React.createElement("p", { className: "visa-tip" }, "\u{1F4A1} ", /* @__PURE__ */ React.createElement("strong", null, "Tip:"), " ", cur.tip), fb && /* @__PURE__ */ React.createElement("div", { className: "visa-feedback md-body" }, window.LP_MD ? window.LP_MD(fb) : fb.split("\n").map((ln, i) => /* @__PURE__ */ React.createElement("p", { key: i }, ln)))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Practice tool only \u2014 real interviews vary. Always answer truthfully and consistently with your documents."));
  }
  window.LP_VisaInterviewPanel = VisaInterviewPanel;
})();
