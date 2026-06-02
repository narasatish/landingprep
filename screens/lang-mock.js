"use strict";
(function() {
  const { useState } = React;
  const TTS = { german: "de", french: "fr" };
  function speak(text, code) {
    try {
      if (window.LP_TTS && window.LP_TTS.speakOne) window.LP_TTS.speakOne(text, "Kore", null, code);
    } catch (e) {
    }
  }
  function LangMock({ langId }) {
    const mocks = window.LP_LANG_MOCKS && window.LP_LANG_MOCKS[langId] || [];
    const code = TTS[langId] || "de";
    const name = langId === "french" ? "French" : "German";
    const [active, setActive] = useState(null);
    const [ans, setAns] = useState({});
    const [done, setDone] = useState(false);
    if (!active) {
      return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, name, " mock tests"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Full A1 practice tests \u2014 Reading, Grammar & Vocabulary, and Listening (with the natural voice). Instant scoring and review."), /* @__PURE__ */ React.createElement("div", { className: "deck-grid" }, mocks.map((m) => /* @__PURE__ */ React.createElement("button", { key: m.id, className: "deck-card", onClick: () => {
        setActive(m);
        setAns({});
        setDone(false);
      } }, /* @__PURE__ */ React.createElement("span", { className: "deck-card-emoji" }, "\u{1F4DD}"), /* @__PURE__ */ React.createElement("span", { className: "deck-card-name" }, m.title.replace(/\s*\(.*\)/, "")), /* @__PURE__ */ React.createElement("span", { className: "deck-card-meta" }, m.sections.reduce((n, s) => n + s.questions.length, 0), " questions \u2192")))), !mocks.length && /* @__PURE__ */ React.createElement("p", { className: "tool-note", style: { marginTop: 10 } }, "More tests coming soon."), /* @__PURE__ */ React.createElement("p", { className: "tool-note", style: { marginTop: 10 } }, "\u{1F4A1} Tip: study the Learn tab first, then take a mock under timed conditions."));
    }
    const flat = [];
    active.sections.forEach((s, si) => s.questions.forEach((q, qi) => flat.push({ key: si + "_" + qi, q })));
    const totalQ = flat.length;
    const answered = Object.keys(ans).length;
    const score = flat.reduce((n, f) => n + (ans[f.key] === f.q.answer ? 1 : 0), 0);
    const pct = Math.round(score / totalQ * 100);
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "lang-mock-bar" }, /* @__PURE__ */ React.createElement("a", { className: "deck-back", onClick: () => setActive(null) }, "\u2190 All mock tests"), /* @__PURE__ */ React.createElement("span", { className: "deck-title-mini" }, active.title)), !done && /* @__PURE__ */ React.createElement("div", { className: "tool-note", style: { marginBottom: 12 } }, "\u{1F4DD} ", totalQ, " questions \xB7 about ", active.minutes, " minutes. Answer all, then submit."), active.sections.map((s, si) => /* @__PURE__ */ React.createElement("div", { className: "tool-card", key: si }, /* @__PURE__ */ React.createElement("h3", null, s.title), s.intro && /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, s.intro), s.passage && /* @__PURE__ */ React.createElement("div", { className: "lang-mock-passage" }, s.passage), s.questions.map((q, qi) => {
      const key = si + "_" + qi;
      return /* @__PURE__ */ React.createElement("div", { className: "lang-q", key: qi }, /* @__PURE__ */ React.createElement("div", { className: "lang-q-prompt" }, s.type === "listening" && /* @__PURE__ */ React.createElement("button", { className: "lang-say", title: "Play audio", onClick: () => speak(q.audio, code) }, "\u25B6"), " ", qi + 1, ". ", q.q), /* @__PURE__ */ React.createElement("div", { className: "lang-opts" }, q.options.map((o, oi) => {
        const chosen = ans[key] === oi;
        const cls = done ? oi === q.answer ? " correct" : chosen ? " wrong" : "" : chosen ? " chosen" : "";
        return /* @__PURE__ */ React.createElement("button", { key: oi, className: "lang-opt" + cls, disabled: done, onClick: () => setAns(Object.assign({}, ans, { [key]: oi })) }, o);
      })));
    }))), !done ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", disabled: answered < totalQ, onClick: () => {
      setDone(true);
      try {
        window.scrollTo(0, 0);
      } catch (e) {
      }
    } }, answered < totalQ ? `Answer all questions (${answered}/${totalQ})` : "Submit & score \u2192") : /* @__PURE__ */ React.createElement("div", { className: "lang-result" }, "Your score: ", /* @__PURE__ */ React.createElement("strong", null, score, "/", totalQ, " (", pct, "%)"), " \u2014 ", pct >= 80 ? "excellent \u2014 A1 level secured! \u{1F389}" : pct >= 60 ? "good \u2014 review the answers in red and retake." : "keep studying the Learn tab, then retake.", /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginLeft: 10 }, onClick: () => {
      setAns({});
      setDone(false);
    } }, "Retake"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => setActive(null) }, "Other tests")));
  }
  window.LP_LangMock = LangMock;
})();
