"use strict";
(function() {
  const { useState, useEffect } = React;
  function say(text) {
    try {
      if (window.LP_TTS && window.LP_TTS.speakOne) window.LP_TTS.speakOne(text, "Kore", null, "en");
      else if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "en-US";
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
    }
  }
  function Vocabulary({ onNav, initialTopic }) {
    const data = window.LP_VOCAB || {};
    const order = window.LP_VOCAB_ORDER || Object.keys(data);
    const [topic, setTopic] = useState(initialTopic && data[initialTopic] ? initialTopic : order[0] || "");
    const [q, setQ] = useState("");
    const t = data[topic];
    useEffect(() => {
      try {
        document.title = "Free IELTS & TOEFL Vocabulary \u2014 Topic Word Lists with Examples | LandingPrep";
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Free IELTS & TOEFL vocabulary by topic \u2014 education, technology, environment, health, work, crime, globalisation, Band 9 linking words and TOEFL academic words. Definitions, examples, synonyms and audio.");
      } catch (e) {
      }
    }, []);
    const words = t ? q.trim() ? t.words.filter((w) => (w.w + " " + w.def).toLowerCase().includes(q.trim().toLowerCase())) : t.words : [];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "learn", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell tools-shell-wide" }, /* @__PURE__ */ React.createElement("header", { className: "tools-hero" }, /* @__PURE__ */ React.createElement("h1", null, "\u{1F4D6} IELTS & TOEFL Vocabulary"), /* @__PURE__ */ React.createElement("p", null, "Topic word lists that lift your Lexical Resource band \u2014 with clear definitions, example sentences, higher-band synonyms and \u{1F50A} audio. 100% free.")), /* @__PURE__ */ React.createElement("div", { className: "tools-groups" }, order.map((id) => /* @__PURE__ */ React.createElement("button", { key: id, className: "tools-group" + (topic === id ? " active" : ""), onClick: () => {
      setTopic(id);
      setQ("");
    } }, (data[id].emoji || "\u2022") + " " + data[id].title))), t && /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, t.intro), /* @__PURE__ */ React.createElement("input", { className: "lc-input", style: { width: "100%", marginBottom: 12, boxSizing: "border-box" }, placeholder: "Search " + t.title + " words\u2026", value: q, onChange: (e) => setQ(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "lang-vocab" }, words.map((w, i) => /* @__PURE__ */ React.createElement("div", { className: "lang-vrow vocab-row", key: i }, /* @__PURE__ */ React.createElement("button", { className: "lang-say", title: "Hear it", onClick: () => say(w.w) }, "\u{1F50A}"), /* @__PURE__ */ React.createElement("div", { className: "lang-w" }, /* @__PURE__ */ React.createElement("strong", null, w.w), /* @__PURE__ */ React.createElement("span", null, w.pos ? w.pos + " \xB7 " : "", w.def)), /* @__PURE__ */ React.createElement("div", { className: "lang-ex" }, "\u201C", w.ex, "\u201D", w.syn ? /* @__PURE__ */ React.createElement("span", { className: "vocab-syn" }, " \u2197 ", w.syn) : null)))), !words.length && /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "No words match \u201C", q, "\u201D."))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_Vocabulary = Vocabulary;
})();
