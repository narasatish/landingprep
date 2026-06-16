"use strict";
(function() {
  const { useState } = React;
  const QUESTIONS = {
    USA: [
      { q: "Why do you want to study in the USA instead of your home country?", tip: "Name specific program strengths, faculty or research \u2014 not just 'better education'. Show genuine academic intent." },
      { q: "Why did you choose this particular university and course?", tip: "Mention the curriculum, professors, ranking for your field and how it fits your goals. Avoid 'it was easy to get in'." },
      { q: "Who is sponsoring your education and what do they do?", tip: "State your sponsor clearly, their occupation and that funds are sufficient and genuine. Have figures ready." },
      { q: "What are your plans after graduation?", tip: "Show ties to home / a clear career plan. For F-1, emphasise intent consistent with a temporary visa." },
      { q: "Do you have relatives in the USA?", tip: "Answer honestly and briefly; disclose any relatives without over-explaining." }
    ],
    UK: [
      { q: "Why do you want to study in the UK?", tip: "Reference the one-year master's, your course content and career relevance \u2014 be specific." },
      { q: "How will you fund your studies and living costs?", tip: "Show maintenance funds meeting UKVI requirements held for the required period; mention any scholarship/loan." },
      { q: "What do you know about your university and course modules?", tip: "Name 2\u20133 modules and why they matter to your goals \u2014 proves you're a genuine student." },
      { q: "What are your plans after completing your degree?", tip: "Mention the Graduate Route and a credible career direction." }
    ],
    Canada: [
      { q: "Why did you choose to study in Canada?", tip: "Talk about your program, the institution (a DLI) and Canada's strengths in your field." },
      { q: "How will you finance your studies and stay?", tip: "Reference your GIC, tuition payment and proof of funds; be precise with amounts." },
      { q: "Will you return to your home country after your studies?", tip: "Show ties and a plan; if pursuing PGWP/PR, be honest and consistent." },
      { q: "Why this college and not one in your home country?", tip: "Highlight specific program quality, co-op options and outcomes." }
    ],
    Australia: [
      { q: "Why do you want to study in Australia (Genuine Student)?", tip: "Explain your course choice, career relevance and why now \u2014 the GS test assesses genuine intent." },
      { q: "How will you support yourself financially?", tip: "Show funds meeting the savings requirement (AUD ~29,710) plus tuition." },
      { q: "What are your plans after your course finishes?", tip: "Give a credible plan; you can mention the 485 visa honestly." }
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
    const list = QUESTIONS[c];
    const cur = list[idx];
    const review = async () => {
      if (!answer.trim()) return;
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
      setIdx((i) => (i + 1) % list.length);
      setAnswer("");
      setFb(null);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "visa-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F6C2} Visa Interview \u2014 Mock & Coach"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Practise real student-visa interview questions and get instant feedback on credibility, clarity and red flags."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Destination", /* @__PURE__ */ React.createElement("select", { value: c, onChange: (e) => {
      setC(e.target.value);
      setIdx(0);
      setAnswer("");
      setFb(null);
    } }, COUNTRIES.map((x) => /* @__PURE__ */ React.createElement("option", { key: x, value: x }, x)))), /* @__PURE__ */ React.createElement("div", { className: "visa-progress" }, "Question ", idx + 1, " of ", list.length))), /* @__PURE__ */ React.createElement("div", { className: "tool-card visa-q-card" }, /* @__PURE__ */ React.createElement("div", { className: "visa-q" }, "\u2753 ", cur.q), /* @__PURE__ */ React.createElement("textarea", { className: "visa-answer", rows: 4, value: answer, onChange: (e) => setAnswer(e.target.value), placeholder: "Type your answer as you would say it to the officer\u2026" }), /* @__PURE__ */ React.createElement("div", { className: "visa-btns" }, /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: review, disabled: busy || !answer.trim() }, busy ? "\u2728 Reviewing\u2026" : "\u2728 Get instant feedback"), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: next }, "Next question \u2192")), !fb && /* @__PURE__ */ React.createElement("p", { className: "visa-tip" }, "\u{1F4A1} ", /* @__PURE__ */ React.createElement("strong", null, "Tip:"), " ", cur.tip), fb && /* @__PURE__ */ React.createElement("div", { className: "visa-feedback md-body" }, window.LP_MD ? window.LP_MD(fb) : fb.split("\n").map((ln, i) => /* @__PURE__ */ React.createElement("p", { key: i }, ln)))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Practice tool only \u2014 real interviews vary. Always answer truthfully and consistently with your documents."));
  }
  window.LP_VisaInterviewPanel = VisaInterviewPanel;
})();
