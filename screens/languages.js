"use strict";
(function() {
  const { useState, useEffect, useRef } = React;
  function pronounce(text) {
    try {
      if (window.LP_TTS && window.LP_TTS.speakOne) window.LP_TTS.speakOne(text, "Kore");
      else if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
    }
  }
  function setSEO(title, desc) {
    try {
      document.title = title;
      let m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute("content", desc);
    } catch (e) {
    }
  }
  function LearnView({ lang }) {
    const [open, setOpen] = useState(lang.course[0] ? lang.course[0].id : null);
    return /* @__PURE__ */ React.createElement("div", { className: "lang-units" }, lang.course.map((u) => /* @__PURE__ */ React.createElement("div", { key: u.id, className: "topic-card" + (open === u.id ? " is-open" : "") }, /* @__PURE__ */ React.createElement("div", { className: "tc-head", onClick: () => setOpen(open === u.id ? null : u.id) }, /* @__PURE__ */ React.createElement("span", { className: "tc-index", style: { background: "rgba(79,70,229,.12)", color: "var(--accent)" } }, u.level), /* @__PURE__ */ React.createElement("div", { className: "tc-head-main" }, /* @__PURE__ */ React.createElement("div", { className: "tc-title" }, u.title)), /* @__PURE__ */ React.createElement("span", { className: "tc-toggle" }, "+")), open === u.id && /* @__PURE__ */ React.createElement("div", { className: "tc-body" }, /* @__PURE__ */ React.createElement("div", { className: "tc-approach" }, "\u{1F4D8} ", u.grammar), /* @__PURE__ */ React.createElement("div", { className: "lang-vocab" }, u.vocab.map((v, i) => /* @__PURE__ */ React.createElement("div", { className: "lang-vrow", key: i }, /* @__PURE__ */ React.createElement("button", { className: "lang-say", title: "Hear pronunciation", onClick: () => pronounce(v.w) }, "\u{1F50A}"), /* @__PURE__ */ React.createElement("div", { className: "lang-w" }, /* @__PURE__ */ React.createElement("strong", null, v.w), /* @__PURE__ */ React.createElement("span", null, v.en)), /* @__PURE__ */ React.createElement("div", { className: "lang-ex", title: "Hear the example", onClick: () => pronounce(v.ex) }, v.ex))))))));
  }
  function VocabView({ lang }) {
    const all = lang.course.reduce((a, u) => a.concat(u.vocab), []);
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "All ", lang.name, " A1 vocabulary \u2014 ", all.length, " words"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Tap \u{1F50A} to hear the natural voice and repeat aloud. Saying words out loud builds your accent fastest."), /* @__PURE__ */ React.createElement("div", { className: "lang-vocab" }, all.map((v, i) => /* @__PURE__ */ React.createElement("div", { className: "lang-vrow", key: i }, /* @__PURE__ */ React.createElement("button", { className: "lang-say", onClick: () => pronounce(v.w) }, "\u{1F50A}"), /* @__PURE__ */ React.createElement("div", { className: "lang-w" }, /* @__PURE__ */ React.createElement("strong", null, v.w), /* @__PURE__ */ React.createElement("span", null, v.en)), /* @__PURE__ */ React.createElement("div", { className: "lang-ex", onClick: () => pronounce(v.ex) }, v.ex)))));
  }
  function TestView({ lang }) {
    const [ans, setAns] = useState({});
    const [done, setDone] = useState(false);
    const total = lang.quiz.length;
    const score = lang.quiz.reduce((n, q, i) => n + (ans[i] === q.answer ? 1 : 0), 0);
    const pass = Math.ceil(total * 0.7);
    return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, lang.name, " placement quiz \u2014 ", total, " questions"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "A quick check of your starting level. Answer all, then submit."), lang.quiz.map((q, i) => /* @__PURE__ */ React.createElement("div", { className: "lang-q", key: i }, /* @__PURE__ */ React.createElement("div", { className: "lang-q-prompt" }, i + 1, ". ", q.q), /* @__PURE__ */ React.createElement("div", { className: "lang-opts" }, q.options.map((o, oi) => {
      const chosen = ans[i] === oi;
      const cls = done ? oi === q.answer ? " correct" : chosen ? " wrong" : "" : chosen ? " chosen" : "";
      return /* @__PURE__ */ React.createElement("button", { key: oi, className: "lang-opt" + cls, disabled: done, onClick: () => setAns(Object.assign({}, ans, { [i]: oi })) }, o);
    })))), !done ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", disabled: Object.keys(ans).length < total, onClick: () => setDone(true) }, Object.keys(ans).length < total ? `Answer all ${total} questions` : "Submit & see score \u2192") : /* @__PURE__ */ React.createElement("div", { className: "lang-result" }, "You scored ", /* @__PURE__ */ React.createElement("strong", null, score, "/", total), " \u2014 ", score >= pass ? "great start! You're ready to move toward A2." : "keep practising the Learn tab, then retake.", /* @__PURE__ */ React.createElement("button", { className: "btn", style: { marginLeft: 10 }, onClick: () => {
      setAns({});
      setDone(false);
    } }, "Retake")));
  }
  function ExamsView({ lang, onNav }) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "Why learn ", lang.name, "?"), /* @__PURE__ */ React.createElement("ul", { className: "dest-why" }, lang.why.map((w, i) => /* @__PURE__ */ React.createElement("li", { key: i }, w)))), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, lang.name, " proficiency exams"), /* @__PURE__ */ React.createElement("div", { className: "lang-exams" }, lang.exams.map((e, i) => /* @__PURE__ */ React.createElement("div", { className: "lang-exam", key: i }, /* @__PURE__ */ React.createElement("strong", null, e.name), /* @__PURE__ */ React.createElement("span", null, e.desc))))), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "Pair ", lang.name, " with your study-abroad plan"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Free college predictor, scholarships, SOP and visa tools \u2014 all in one place."), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("colleges") }, "Explore universities \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("tools") }, "Free tools"))));
  }
  function StoriesView({ langId }) {
    const stories = window.LP_LANG_STORIES && window.LP_LANG_STORIES[langId] || [];
    const code = langId === "french" ? "fr" : "de";
    const [active, setActive] = useState(null);
    const [playing, setPlaying] = useState(false);
    const stopRef = useRef(false);
    function speakLine(t) {
      try {
        if (window.LP_TTS && window.LP_TTS.speakOne) return window.LP_TTS.speakOne(t, "Kore", null, code);
      } catch (e) {
      }
      return Promise.resolve();
    }
    async function readAll(lines) {
      setPlaying(true);
      stopRef.current = false;
      for (const l of lines) {
        if (stopRef.current) break;
        await speakLine(l.t);
      }
      setPlaying(false);
    }
    if (!stories.length) return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Stories are loading\u2026"));
    if (!active) {
      return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h3", null, "\u{1F4D6} Graded reading stories"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Short stories & dialogues with audio and a glossary \u2014 the natural way to absorb ", langId === "french" ? "French" : "German", "."), /* @__PURE__ */ React.createElement("div", { className: "deck-grid" }, stories.map((s) => /* @__PURE__ */ React.createElement("button", { key: s.id, className: "deck-card", onClick: () => setActive(s) }, /* @__PURE__ */ React.createElement("span", { className: "deck-card-emoji" }, s.emoji || "\u{1F4D6}"), /* @__PURE__ */ React.createElement("span", { className: "deck-card-name" }, s.title), /* @__PURE__ */ React.createElement("span", { className: "deck-card-meta" }, s.level, " \xB7 ", s.lines.length, " lines \u2192")))));
    }
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "lang-mock-bar" }, /* @__PURE__ */ React.createElement("a", { className: "deck-back", onClick: () => {
      stopRef.current = true;
      setActive(null);
    } }, "\u2190 All stories"), /* @__PURE__ */ React.createElement("span", { className: "deck-title-mini" }, active.emoji, " ", active.title, " \xB7 ", active.level)), /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => playing ? stopRef.current = true : readAll(active.lines) }, playing ? "\u23F9 Stop" : "\u25B6 Read the whole story"), /* @__PURE__ */ React.createElement("div", { className: "story-lines" }, active.lines.map((l, i) => /* @__PURE__ */ React.createElement("div", { className: "story-line", key: i }, /* @__PURE__ */ React.createElement("button", { className: "lang-say", title: "Hear this line", onClick: () => speakLine(l.t) }, "\u{1F50A}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "story-native" }, l.t), /* @__PURE__ */ React.createElement("div", { className: "story-gloss" }, l.en)))))), active.glossary && active.glossary.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h4", null, "Glossary"), /* @__PURE__ */ React.createElement("div", { className: "lang-vocab" }, active.glossary.map((g, i) => /* @__PURE__ */ React.createElement("div", { className: "lang-vrow", key: i }, /* @__PURE__ */ React.createElement("button", { className: "lang-say", onClick: () => speakLine(g.w) }, "\u{1F50A}"), /* @__PURE__ */ React.createElement("div", { className: "lang-w" }, /* @__PURE__ */ React.createElement("strong", null, g.w), /* @__PURE__ */ React.createElement("span", null, g.en)))))));
  }
  function Languages({ onNav }) {
    const langs = window.LP_LANGUAGES || {};
    const order = window.LP_LANGUAGE_ORDER || Object.keys(langs);
    const [langId, setLangId] = useState(order[0] || "german");
    const [tab, setTab] = useState("learn");
    const lang = langs[langId];
    useEffect(() => {
      if (lang) setSEO(
        `Learn ${lang.name} Free \u2014 Courses, Vocabulary & Exam Prep | LandingPrep`,
        `Free ${lang.name} course (A1+) with natural-voice pronunciation, vocabulary, a placement test and ${lang.name} exam guidance (Goethe, TestDaF, DELF). Built for study abroad.`
      );
    }, [langId]);
    if (!lang) return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "languages", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell tools-shell-wide" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Loading languages\u2026"))));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "languages", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell tools-shell-wide" }, /* @__PURE__ */ React.createElement("header", { className: "tools-hero" }, /* @__PURE__ */ React.createElement("h1", null, "Learn ", lang.name, " \u2014 100% Free \u{1F3A7}"), /* @__PURE__ */ React.createElement("p", null, lang.blurb)), /* @__PURE__ */ React.createElement("div", { className: "tools-groups" }, order.map((id) => /* @__PURE__ */ React.createElement("button", { key: id, className: "tools-group" + (langId === id ? " active" : ""), onClick: () => {
      setLangId(id);
      setTab("learn");
    } }, langs[id].flag, " ", langs[id].name))), /* @__PURE__ */ React.createElement("div", { className: "tools-tabs" }, [["learn", "\u{1F4DA} Learn"], ["vocab", "\u{1F5C2} Vocabulary"], ["stories", "\u{1F4D6} Stories"], ["speak", "\u{1F399}\uFE0F AI Speaking"], ["test", "\u2705 Placement Test"], ["mock", "\u{1F4DD} Mock Test"], ["exams", "\u{1F393} Exams & Why"]].map(([id, label]) => /* @__PURE__ */ React.createElement("button", { key: id, className: "tools-tab" + (tab === id ? " active" : ""), onClick: () => setTab(id) }, label))), tab === "learn" && /* @__PURE__ */ React.createElement(LearnView, { lang }), tab === "vocab" && /* @__PURE__ */ React.createElement(VocabView, { lang }), tab === "stories" && /* @__PURE__ */ React.createElement(StoriesView, { langId, key: langId }), tab === "speak" && (window.LP_LangSpeak ? /* @__PURE__ */ React.createElement(window.LP_LangSpeak, { langId, key: langId }) : /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Loading speaking partner\u2026"))), tab === "test" && /* @__PURE__ */ React.createElement(TestView, { lang, key: langId }), tab === "mock" && (window.LP_LangMock ? /* @__PURE__ */ React.createElement(window.LP_LangMock, { langId, key: langId }) : /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Loading mock tests\u2026"))), tab === "exams" && /* @__PURE__ */ React.createElement(ExamsView, { lang, onNav })), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_Languages = Languages;
})();
