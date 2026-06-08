/* global React, window */
"use strict";
// LandingPrep — "Learn" hub: one home for both the PPT-style Prep Lessons (learn the
// strategy) and the Learning Club (model answers, vocabulary, daily practice). A single
// nav entry with a clean segmented switch — no more two separate, overlapping pages.
(function () {
  const { useState, useEffect } = React;

  function LearnHub({ onNav, exams, initialTab }) {
    const [tab, setTab] = useState(initialTab === "club" ? "club" : "lessons");

    useEffect(() => {
      try {
        if (tab === "lessons") {
          document.title = "Learn — Free Exam Prep Lessons (PPT) & Strategy | LandingPrep";
        } else {
          document.title = "Learn — Learning Club: Model Answers & Vocabulary | LandingPrep";
        }
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Learn first, then practise — free PPT-style lessons for every exam section plus the Learning Club: full model answers, speaking samples and vocabulary for IELTS, TOEFL, PTE, GRE, GMAT, CELPIP, Duolingo, German & French.");
      } catch (e) {}
    }, [tab]);

    return (
      <>
        <window.LP_TopBar current="learn" onNav={onNav} />
        <div className="learnhub-bar">
          <div className="learnhub-tabs">
            <button className={"learnhub-tab" + (tab === "lessons" ? " active" : "")} onClick={() => setTab("lessons")}>
              <span className="lh-ico">📊</span> Prep Lessons
              <span className="lh-sub">Learn the strategy</span>
            </button>
            <button className={"learnhub-tab" + (tab === "club" ? " active" : "")} onClick={() => setTab("club")}>
              <span className="lh-ico">🎓</span> Learning Club
              <span className="lh-sub">Model answers & vocab</span>
            </button>
          </div>
        </div>
        {tab === "lessons"
          ? (window.LP_Lessons ? <window.LP_Lessons onNav={onNav} embedded /> : null)
          : (window.LP_LearningClub ? <window.LP_LearningClub onNav={onNav} exams={exams} embedded /> : null)}
        <window.LP_Footer />
      </>
    );
  }

  window.LP_LearnHub = LearnHub;
})();
