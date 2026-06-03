"use strict";
(function() {
  const { useState } = React;
  const QUESTIONS = [
    { id: "dest", q: "Where are you headed?", opts: [["usa", "\u{1F1FA}\u{1F1F8} USA"], ["uk", "\u{1F1EC}\u{1F1E7} UK"], ["canada", "\u{1F1E8}\u{1F1E6} Canada"], ["australia", "\u{1F1E6}\u{1F1FA} Australia"], ["europe", "\u{1F1EA}\u{1F1FA} Europe / other"], ["world", "\u{1F30D} Not sure yet"]] },
    { id: "purpose", q: "What's it for?", opts: [["study", "\u{1F393} Study"], ["pr", "\u{1F6C2} PR / immigration"], ["work", "\u{1FA7A} Professional registration (nurse/doctor)"]] },
    { id: "examiner", q: "How do you prefer to take Speaking?", opts: [["human", "\u{1F5E3}\uFE0F With a real examiner"], ["computer", "\u{1F4BB} Into a computer (AI-scored)"], ["any", "\u{1F937} No preference"]] },
    { id: "priority", q: "How important are low cost + fast results?", opts: [["yes", "\u26A1 Very \u2014 cheap & quick please"], ["no", "\u{1F3AF} I just want the most accepted test"]] }
  ];
  const TESTS = {
    IELTS: { emoji: "\u{1F3A7}", k: "ielts", blurb: "the most widely accepted test for study, work and migration worldwide, with a real-person speaking test." },
    TOEFL: { emoji: "\u{1F989}", k: "toefl", blurb: "the top choice for the USA \u2014 fully computer-based and accepted by almost every US university." },
    PTE: { emoji: "\u{1F4BB}", k: "pte", blurb: "fully computer-scored with results in ~48 hours \u2014 popular for Australia and Canada." },
    Duolingo: { emoji: "\u{1F7E2}", k: "duolingo", blurb: "the cheapest and fastest option (~1 hour, at home, ~US$65) \u2014 accepted by thousands of universities." },
    CELPIP: { emoji: "\u{1F341}", k: "celpip", blurb: "built specifically for Canadian PR and citizenship \u2014 fully computer-delivered in North American English." }
  };
  function recommend(a) {
    const s = { IELTS: 0, TOEFL: 0, PTE: 0, Duolingo: 0, CELPIP: 0 };
    const d = a.dest;
    if (d === "usa") {
      s.TOEFL += 3;
      s.Duolingo += 2;
      s.IELTS += 1;
    } else if (d === "uk") {
      s.IELTS += 3;
      s.PTE += 2;
    } else if (d === "canada") {
      s.IELTS += 3;
      s.PTE += 2;
    } else if (d === "australia") {
      s.IELTS += 3;
      s.PTE += 3;
    } else if (d === "europe") {
      s.IELTS += 2;
      s.TOEFL += 2;
    } else {
      s.IELTS += 3;
      s.TOEFL += 1;
    }
    if (a.purpose === "pr") {
      s.IELTS += 2;
      s.PTE += 2;
      if (d === "canada") s.CELPIP += 4;
    } else if (a.purpose === "work") {
      s.IELTS += 4;
    } else {
      s.IELTS += 1;
      s.TOEFL += 1;
      s.Duolingo += 1;
    }
    if (a.examiner === "human") s.IELTS += 3;
    else if (a.examiner === "computer") {
      s.PTE += 3;
      s.TOEFL += 2;
      s.Duolingo += 2;
    }
    if (a.priority === "yes") {
      s.Duolingo += 3;
      s.PTE += 1;
    }
    if (d !== "canada") s.CELPIP = -1;
    if (a.purpose === "work") {
      s.CELPIP = -1;
      s.Duolingo = -1;
    }
    let best = "IELTS", bestV = -99;
    for (const k of Object.keys(s)) if (s[k] > bestV) {
      bestV = s[k];
      best = k;
    }
    let alt = null, altV = -99;
    for (const k of Object.keys(s)) if (k !== best && s[k] > altV) {
      altV = s[k];
      alt = k;
    }
    return { best, alt };
  }
  function reasons(best, a) {
    const r = [];
    const dl = { usa: "the USA", uk: "the UK", canada: "Canada", australia: "Australia", europe: "Europe", world: "your destination" }[a.dest];
    if (best === "TOEFL") r.push(`TOEFL iBT is the most accepted test in ${dl}.`);
    if (best === "IELTS") r.push(`IELTS is accepted almost everywhere${a.dest !== "usa" ? " and is the standard for " + dl : ""}.`);
    if (best === "PTE") r.push("PTE is fully computer-scored with results in about 48 hours.");
    if (best === "Duolingo") r.push("The Duolingo English Test is the cheapest and fastest \u2014 taken at home in ~1 hour.");
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
      setAns(n);
      setStep(step + 1);
    }
    function restart() {
      setAns({});
      setStep(0);
    }
    React.useEffect(() => {
      try {
        document.title = "Which English Test Should I Take? IELTS vs TOEFL vs PTE vs Duolingo \u2014 Free Quiz | LandingPrep";
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Free quiz: answer 4 questions and get a personalised recommendation \u2014 IELTS, TOEFL, PTE, Duolingo or CELPIP \u2014 for your country, study/PR goal and preferences.");
      } catch (e) {
      }
    }, []);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "tools", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell" }, /* @__PURE__ */ React.createElement("header", { className: "tools-hero" }, /* @__PURE__ */ React.createElement("h1", null, "\u{1F9ED} Which English Test Should I Take?"), /* @__PURE__ */ React.createElement("p", null, "Answer 4 quick questions and get a personalised recommendation \u2014 IELTS, TOEFL, PTE, Duolingo or CELPIP \u2014 with the reasons why. 100% free.")), !done ? /* @__PURE__ */ React.createElement("div", { className: "tool-card tf-card" }, /* @__PURE__ */ React.createElement("div", { className: "tf-progress" }, /* @__PURE__ */ React.createElement("span", { style: { width: step / QUESTIONS.length * 100 + "%" } })), /* @__PURE__ */ React.createElement("div", { className: "tf-step" }, "Question ", step + 1, " of ", QUESTIONS.length), /* @__PURE__ */ React.createElement("h3", { className: "tf-q" }, QUESTIONS[step].q), /* @__PURE__ */ React.createElement("div", { className: "tf-opts" }, QUESTIONS[step].opts.map(([v, label]) => /* @__PURE__ */ React.createElement("button", { key: v, className: "tf-opt", onClick: () => pick(QUESTIONS[step].id, v) }, label))), step > 0 && /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginTop: 14 }, onClick: () => setStep(step - 1) }, "\u2190 Back")) : /* @__PURE__ */ React.createElement("div", { className: "tf-result" }, /* @__PURE__ */ React.createElement("div", { className: "tf-rec" }, /* @__PURE__ */ React.createElement("div", { className: "tf-rec-emoji" }, TESTS[rec.best].emoji), /* @__PURE__ */ React.createElement("div", { className: "tf-rec-name" }, "Take the ", /* @__PURE__ */ React.createElement("strong", null, rec.best === "Duolingo" ? "Duolingo English Test" : rec.best)), /* @__PURE__ */ React.createElement("div", { className: "tf-rec-blurb" }, "It's ", TESTS[rec.best].blurb)), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h4", null, "Why ", rec.best === "Duolingo" ? "Duolingo" : rec.best, "?"), /* @__PURE__ */ React.createElement("ul", null, reasons(rec.best, ans).map((r, i) => /* @__PURE__ */ React.createElement("li", { key: i }, r))), rec.alt && /* @__PURE__ */ React.createElement("p", { className: "tool-note", style: { marginTop: 8 } }, "Close second: ", /* @__PURE__ */ React.createElement("strong", null, rec.alt === "Duolingo" ? "Duolingo" : rec.alt), " \u2014 also worth considering.")), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("exam-prep") }, "\u25B6 Free ", rec.best === "Duolingo" ? "Duolingo" : rec.best, " mock test"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("learn") }, "\u{1F4CA} Prep lessons"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
      try {
        window.LP_ShareCard && window.LP_ShareCard.make({ title: "My recommended English test", big: TESTS[rec.best].emoji, label: rec.best === "Duolingo" ? "Duolingo" : rec.best, sub: "Found with the free 'Which English test?' quiz" });
      } catch (e) {
      }
    } }, "\u{1F4E4} Share result"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: restart }, "\u21BB Retake")), /* @__PURE__ */ React.createElement("p", { className: "tool-note", style: { marginTop: 12 } }, "\u2696\uFE0F A guide based on your answers \u2014 always confirm the exact test your university or immigration authority accepts."))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_TestFinder = TestFinder;
})();
