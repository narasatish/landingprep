"use strict";
(function() {
  const { useState, useEffect } = React;
  function LearnHub({ onNav, exams, initialTab }) {
    const [tab, setTab] = useState(initialTab === "club" ? "club" : "lessons");
    useEffect(() => {
      try {
        if (tab === "lessons") {
          document.title = "Learn \u2014 Free Exam Prep Lessons (PPT) & Strategy | LandingPrep";
        } else {
          document.title = "Learn \u2014 Learning Club: Model Answers & Vocabulary | LandingPrep";
        }
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Learn first, then practise \u2014 free PPT-style lessons for every exam section plus the Learning Club: full model answers, speaking samples and vocabulary for IELTS, TOEFL, PTE, GRE, GMAT, CELPIP, Duolingo, German & French.");
      } catch (e) {
      }
    }, [tab]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "learn", onNav }), /* @__PURE__ */ React.createElement("main", { id: "main-content" }, /* @__PURE__ */ React.createElement("div", { className: "learnhub-bar" }, /* @__PURE__ */ React.createElement("div", { className: "learnhub-tabs" }, /* @__PURE__ */ React.createElement("button", { className: "learnhub-tab" + (tab === "lessons" ? " active" : ""), onClick: () => setTab("lessons") }, /* @__PURE__ */ React.createElement("span", { className: "lh-ico" }, "\u{1F4CA}"), " Prep Lessons", /* @__PURE__ */ React.createElement("span", { className: "lh-sub" }, "Learn the strategy")), /* @__PURE__ */ React.createElement("button", { className: "learnhub-tab" + (tab === "club" ? " active" : ""), onClick: () => setTab("club") }, /* @__PURE__ */ React.createElement("span", { className: "lh-ico" }, "\u{1F393}"), " Learning Club", /* @__PURE__ */ React.createElement("span", { className: "lh-sub" }, "Model answers & vocab")))), tab === "lessons" ? window.LP_Lessons ? /* @__PURE__ */ React.createElement(window.LP_Lessons, { onNav, embedded: true }) : null : window.LP_LearningClub ? /* @__PURE__ */ React.createElement(window.LP_LearningClub, { onNav, exams, embedded: true }) : null), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_LearnHub = LearnHub;
})();
