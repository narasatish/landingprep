/* global React, window */
"use strict";

// LandingPrep — AI Visa Mock-Interview. Country-specific student-visa interview
// questions; the student answers and gets instant feedback (clarity, credibility,
// red flags). Works offline with model guidance per question.
(function () {
  const { useState } = React;

  const QUESTIONS = {
    USA: [
      { q: "Why do you want to study in the USA instead of your home country?", tip: "Name specific program strengths, faculty or research — not just 'better education'. Show genuine academic intent." },
      { q: "Why did you choose this particular university and course?", tip: "Mention the curriculum, professors, ranking for your field and how it fits your goals. Avoid 'it was easy to get in'." },
      { q: "Who is sponsoring your education and what do they do?", tip: "State your sponsor clearly, their occupation and that funds are sufficient and genuine. Have figures ready." },
      { q: "What are your plans after graduation?", tip: "Show ties to home / a clear career plan. For F-1, emphasise intent consistent with a temporary visa." },
      { q: "Do you have relatives in the USA?", tip: "Answer honestly and briefly; disclose any relatives without over-explaining." },
    ],
    UK: [
      { q: "Why do you want to study in the UK?", tip: "Reference the one-year master's, your course content and career relevance — be specific." },
      { q: "How will you fund your studies and living costs?", tip: "Show maintenance funds meeting UKVI requirements held for the required period; mention any scholarship/loan." },
      { q: "What do you know about your university and course modules?", tip: "Name 2–3 modules and why they matter to your goals — proves you're a genuine student." },
      { q: "What are your plans after completing your degree?", tip: "Mention the Graduate Route and a credible career direction." },
    ],
    Canada: [
      { q: "Why did you choose to study in Canada?", tip: "Talk about your program, the institution (a DLI) and Canada's strengths in your field." },
      { q: "How will you finance your studies and stay?", tip: "Reference your GIC, tuition payment and proof of funds; be precise with amounts." },
      { q: "Will you return to your home country after your studies?", tip: "Show ties and a plan; if pursuing PGWP/PR, be honest and consistent." },
      { q: "Why this college and not one in your home country?", tip: "Highlight specific program quality, co-op options and outcomes." },
    ],
    Australia: [
      { q: "Why do you want to study in Australia (Genuine Student)?", tip: "Explain your course choice, career relevance and why now — the GS test assesses genuine intent." },
      { q: "How will you support yourself financially?", tip: "Show funds meeting the savings requirement (AUD ~29,710) plus tuition." },
      { q: "What are your plans after your course finishes?", tip: "Give a credible plan; you can mention the 485 visa honestly." },
    ],
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
      setBusy(true); setFb(null);
      const prompt =
        `You are a ${c} student-visa officer and coach. The applicant was asked: "${cur.q}". Their answer: "${answer.trim()}". ` +
        `In under 140 words give: (1) a credibility score out of 10, (2) what worked, (3) 2 specific improvements, (4) one red flag to avoid. Be direct and practical.`;
      let out = "";
      try {
        if (window.LP_AI_TUTOR && window.LP_AI_TUTOR.generate) {
          const r = (await window.LP_AI_TUTOR.generate(prompt) || "").trim();
          if (r && !/(?:AI|Smart) Tutor is offline/i.test(r) && !r.startsWith("⚠")) out = r;
        }
      } catch (e) {}
      if (!out) out = "AI is offline — self-check against this model guidance: " + cur.tip + " Make sure your answer is specific, consistent with your documents, confident and concise (under 30 seconds spoken).";
      setFb(out); setBusy(false);
    };

    const next = () => { setIdx((i) => (i + 1) % list.length); setAnswer(""); setFb(null); };

    return (
      <div className="visa-panel">
        <div className="tool-card">
          <h2>🛂 Visa Interview — Mock &amp; Coach</h2>
          <p className="tool-sub">Practise real student-visa interview questions and get instant feedback on credibility, clarity and red flags.</p>
          <div className="tool-row">
            <label>Destination
              <select value={c} onChange={(e) => { setC(e.target.value); setIdx(0); setAnswer(""); setFb(null); }}>{COUNTRIES.map((x) => <option key={x} value={x}>{x}</option>)}</select>
            </label>
            <div className="visa-progress">Question {idx + 1} of {list.length}</div>
          </div>
        </div>

        <div className="tool-card visa-q-card">
          <div className="visa-q">❓ {cur.q}</div>
          <textarea className="visa-answer" rows={4} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer as you would say it to the officer…" />
          <div className="visa-btns">
            <button className="tool-btn" onClick={review} disabled={busy || !answer.trim()}>{busy ? "✨ Reviewing…" : "✨ Get instant feedback"}</button>
            <button className="tool-btn ghost" onClick={next}>Next question →</button>
          </div>
          {!fb && <p className="visa-tip">💡 <strong>Tip:</strong> {cur.tip}</p>}
          {fb && <div className="visa-feedback md-body">{window.LP_MD ? window.LP_MD(fb) : fb.split("\n").map((ln, i) => <p key={i}>{ln}</p>)}</div>}
        </div>
        <p className="tool-note">Practice tool only — real interviews vary. Always answer truthfully and consistently with your documents.</p>
      </div>
    );
  }

  window.LP_VisaInterviewPanel = VisaInterviewPanel;
})();
