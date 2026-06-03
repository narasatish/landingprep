/* global React, window */
"use strict";
// LandingPrep — "Which English Test Should I Take?" — a free interactive recommender.
// Highly shareable/linkable (good for backlinks). Recommends IELTS / TOEFL / PTE /
// Duolingo / CELPIP from destination, purpose and preferences, with reasons + links.
(function () {
  const { useState } = React;

  const QUESTIONS = [
    { id: "dest", q: "Where are you headed?", opts: [["usa", "🇺🇸 USA"], ["uk", "🇬🇧 UK"], ["canada", "🇨🇦 Canada"], ["australia", "🇦🇺 Australia"], ["europe", "🇪🇺 Europe / other"], ["world", "🌍 Not sure yet"]] },
    { id: "purpose", q: "What's it for?", opts: [["study", "🎓 Study"], ["pr", "🛂 PR / immigration"], ["work", "🩺 Professional registration (nurse/doctor)"]] },
    { id: "examiner", q: "How do you prefer to take Speaking?", opts: [["human", "🗣️ With a real examiner"], ["computer", "💻 Into a computer (AI-scored)"], ["any", "🤷 No preference"]] },
    { id: "priority", q: "How important are low cost + fast results?", opts: [["yes", "⚡ Very — cheap & quick please"], ["no", "🎯 I just want the most accepted test"]] },
  ];

  const TESTS = {
    IELTS: { emoji: "🎧", k: "ielts", blurb: "the most widely accepted test for study, work and migration worldwide, with a real-person speaking test." },
    TOEFL: { emoji: "🦉", k: "toefl", blurb: "the top choice for the USA — fully computer-based and accepted by almost every US university." },
    PTE: { emoji: "💻", k: "pte", blurb: "fully computer-scored with results in ~48 hours — popular for Australia and Canada." },
    Duolingo: { emoji: "🟢", k: "duolingo", blurb: "the cheapest and fastest option (~1 hour, at home, ~US$65) — accepted by thousands of universities." },
    CELPIP: { emoji: "🍁", k: "celpip", blurb: "built specifically for Canadian PR and citizenship — fully computer-delivered in North American English." },
  };

  function recommend(a) {
    const s = { IELTS: 0, TOEFL: 0, PTE: 0, Duolingo: 0, CELPIP: 0 };
    const d = a.dest;
    if (d === "usa") { s.TOEFL += 3; s.Duolingo += 2; s.IELTS += 1; }
    else if (d === "uk") { s.IELTS += 3; s.PTE += 2; }
    else if (d === "canada") { s.IELTS += 3; s.PTE += 2; }
    else if (d === "australia") { s.IELTS += 3; s.PTE += 3; }
    else if (d === "europe") { s.IELTS += 2; s.TOEFL += 2; }
    else { s.IELTS += 3; s.TOEFL += 1; }
    if (a.purpose === "pr") { s.IELTS += 2; s.PTE += 2; if (d === "canada") s.CELPIP += 4; }
    else if (a.purpose === "work") { s.IELTS += 4; }
    else { s.IELTS += 1; s.TOEFL += 1; s.Duolingo += 1; }
    if (a.examiner === "human") s.IELTS += 3;
    else if (a.examiner === "computer") { s.PTE += 3; s.TOEFL += 2; s.Duolingo += 2; }
    if (a.priority === "yes") { s.Duolingo += 3; s.PTE += 1; }
    // CELPIP only valid for Canada
    if (d !== "canada") s.CELPIP = -1;
    // Professional registration → CELPIP/Duolingo not used
    if (a.purpose === "work") { s.CELPIP = -1; s.Duolingo = -1; }
    let best = "IELTS", bestV = -99;
    for (const k of Object.keys(s)) if (s[k] > bestV) { bestV = s[k]; best = k; }
    // runner-up
    let alt = null, altV = -99;
    for (const k of Object.keys(s)) if (k !== best && s[k] > altV) { altV = s[k]; alt = k; }
    return { best, alt };
  }

  function reasons(best, a) {
    const r = [];
    const dl = { usa: "the USA", uk: "the UK", canada: "Canada", australia: "Australia", europe: "Europe", world: "your destination" }[a.dest];
    if (best === "TOEFL") r.push(`TOEFL iBT is the most accepted test in ${dl}.`);
    if (best === "IELTS") r.push(`IELTS is accepted almost everywhere${a.dest !== "usa" ? " and is the standard for " + dl : ""}.`);
    if (best === "PTE") r.push("PTE is fully computer-scored with results in about 48 hours.");
    if (best === "Duolingo") r.push("The Duolingo English Test is the cheapest and fastest — taken at home in ~1 hour.");
    if (best === "CELPIP") r.push("CELPIP is purpose-built for Canadian immigration and is accepted by IRCC.");
    if (a.examiner === "human" && best === "IELTS") r.push("It has a real-person speaking test, which you preferred.");
    if (a.examiner === "computer" && (best === "PTE" || best === "TOEFL")) r.push("Speaking is done on a computer, which you preferred.");
    if (a.priority === "yes" && best === "Duolingo") r.push("It's the lowest-cost, quickest-result option.");
    if (a.purpose === "work") r.push("For nurses & doctors, IELTS Academic (or OET) is the standard for registration.");
    if (a.purpose === "pr") r.push("It's accepted for immigration / PR.");
    return r.slice(0, 4);
  }

  function TestFinder({ onNav }) {
    const [step, setStep] = useState(0);
    const [ans, setAns] = useState({});
    const done = step >= QUESTIONS.length;
    const rec = done ? recommend(ans) : null;

    function pick(qid, val) {
      const n = Object.assign({}, ans, { [qid]: val });
      setAns(n); setStep(step + 1);
    }
    function restart() { setAns({}); setStep(0); }

    React.useEffect(() => {
      try {
        document.title = "Which English Test Should I Take? IELTS vs TOEFL vs PTE vs Duolingo — Free Quiz | LandingPrep";
        const m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute("content", "Free quiz: answer 4 questions and get a personalised recommendation — IELTS, TOEFL, PTE, Duolingo or CELPIP — for your country, study/PR goal and preferences.");
      } catch (e) {}
    }, []);

    return (
      <>
        <window.LP_TopBar current="tools" onNav={onNav} />
        <main className="tools-shell">
          <header className="tools-hero">
            <h1>🧭 Which English Test Should I Take?</h1>
            <p>Answer 4 quick questions and get a personalised recommendation — IELTS, TOEFL, PTE, Duolingo or CELPIP — with the reasons why. 100% free.</p>
          </header>

          {!done ? (
            <div className="tool-card tf-card">
              <div className="tf-progress"><span style={{ width: (step / QUESTIONS.length * 100) + "%" }} /></div>
              <div className="tf-step">Question {step + 1} of {QUESTIONS.length}</div>
              <h3 className="tf-q">{QUESTIONS[step].q}</h3>
              <div className="tf-opts">
                {QUESTIONS[step].opts.map(([v, label]) => (
                  <button key={v} className="tf-opt" onClick={() => pick(QUESTIONS[step].id, v)}>{label}</button>
                ))}
              </div>
              {step > 0 && <button className="btn" style={{ marginTop: 14 }} onClick={() => setStep(step - 1)}>← Back</button>}
            </div>
          ) : (
            <div className="tf-result">
              <div className="tf-rec">
                <div className="tf-rec-emoji">{TESTS[rec.best].emoji}</div>
                <div className="tf-rec-name">Take the <strong>{rec.best === "Duolingo" ? "Duolingo English Test" : rec.best}</strong></div>
                <div className="tf-rec-blurb">It's {TESTS[rec.best].blurb}</div>
              </div>
              <div className="tool-card"><h4>Why {rec.best === "Duolingo" ? "Duolingo" : rec.best}?</h4><ul>{reasons(rec.best, ans).map((r, i) => <li key={i}>{r}</li>)}</ul>
                {rec.alt && <p className="tool-note" style={{ marginTop: 8 }}>Close second: <strong>{rec.alt === "Duolingo" ? "Duolingo" : rec.alt}</strong> — also worth considering.</p>}
              </div>
              <div className="row-gap-12">
                <button className="btn btn-primary" onClick={() => onNav("exam-prep")}>▶ Free {rec.best === "Duolingo" ? "Duolingo" : rec.best} mock test</button>
                <button className="btn" onClick={() => onNav("learn")}>📊 Prep lessons</button>
                <button className="btn" onClick={() => { try { window.LP_ShareCard && window.LP_ShareCard.make({ title: "My recommended English test", big: TESTS[rec.best].emoji, label: rec.best === "Duolingo" ? "Duolingo" : rec.best, sub: "Found with the free 'Which English test?' quiz" }); } catch (e) {} }}>📤 Share result</button>
                <button className="btn" onClick={restart}>↻ Retake</button>
              </div>
              <p className="tool-note" style={{ marginTop: 12 }}>⚖️ A guide based on your answers — always confirm the exact test your university or immigration authority accepts.</p>
            </div>
          )}
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_TestFinder = TestFinder;
})();
