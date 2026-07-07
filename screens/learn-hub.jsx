/* global React, window */
"use strict";
// LandingPrep — "Learn" hub: one home for the PPT-style Prep Lessons (learn the
// strategy), the Learning Club (model answers, vocabulary, daily practice), and Smart Notes
// (visual concept maps with spaced-repetition recall). A single nav entry with a clean
// segmented switch — no more overlapping pages.
(function () {
  const { useState, useEffect } = React;

  function SmartNotesBrowser({ onNav }) {
    const [catalog, setCatalog] = useState({});
    const [active, setActive] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      setLoading(true);
      fetch("/content/smart-notes/index.json")
        .then((r) => r.json())
        .then((data) => { setCatalog(data); setLoading(false); })
        .catch((e) => { console.log("Smart Notes catalog fetch failed:", e); setCatalog({}); setLoading(false); });
    }, []);

    const openNote = (exam, note) => {
      setLoading(true);
      fetch(`/content/smart-notes/${exam}/${note.slug}.json`)
        .then((r) => r.json())
        .then((fullNote) => { setActive(fullNote); setLoading(false); })
        .catch((e) => { console.log("Smart Note fetch failed:", exam, note.slug, e); setActive(null); setLoading(false); });
    };

    if (active) {
      return (
        <div className="smartnotes-viewer">
          <button className="smartnotes-back" onClick={() => setActive(null)}>← Back to Smart Notes</button>
          {window.LP_SmartNote ? React.createElement(window.LP_SmartNote, { note: active }) : <div>Smart Note renderer not available.</div>}
        </div>
      );
    }

    if (loading) return <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>;
    if (Object.keys(catalog).length === 0) {
      return <div style={{ padding: "2rem", textAlign: "center", color: "var(--ink-2)" }}>Smart Notes are coming soon.</div>;
    }

    return (
      <div className="smartnotes-catalog">
        {Object.entries(catalog).map(([exam, notes]) => (
          <section key={exam} className="smartnotes-section">
            <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>{exam.toUpperCase()}</h2>
            <div className="grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {notes.map((note) => (
                <button
                  key={note.id}
                  className="tile"
                  onClick={() => openNote(exam, note)}
                  style={{ padding: "1rem", textAlign: "left", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", backgroundColor: "var(--surface)", color: "var(--ink)", cursor: "pointer" }}
                >
                  <strong>{note.title}</strong>
                  <div style={{ fontSize: "0.9rem", color: "var(--ink-2)", marginTop: "0.5rem" }}>
                    {note.section} · {note.estMinutes} min
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  function LearnHub({ onNav, exams, initialTab }) {
    const [tab, setTab] = useState(initialTab === "club" ? "club" : initialTab === "notes" ? "notes" : "lessons");

    useEffect(() => {
      try {
        if (tab === "lessons") {
          document.title = "Learn — Free Exam Prep Lessons (PPT) & Strategy | LandingPrep";
        } else if (tab === "club") {
          document.title = "Learn — Learning Club: Model Answers & Vocabulary | LandingPrep";
        } else if (tab === "notes") {
          document.title = "Learn — Smart Notes: Visual Lessons & Recall | LandingPrep";
        }
        const m = document.querySelector('meta[name="description"]');
        if (m) {
          const desc = tab === "notes"
            ? "Free Smart Notes: visual concept maps with chunked notes, real examples and built-in spaced-repetition recall for IELTS, TOEFL, PTE, GRE, GMAT, CELPIP, Duolingo, German & French. Learn visually, then recall."
            : "Learn first, then practise — free PPT-style lessons for every exam section plus the Learning Club: full model answers, speaking samples and vocabulary for IELTS, TOEFL, PTE, GRE, GMAT, CELPIP, Duolingo, German & French.";
          m.setAttribute("content", desc);
        }
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
            <button className={"learnhub-tab" + (tab === "notes" ? " active" : "")} onClick={() => setTab("notes")}>
              <span className="lh-ico">🧠</span> Smart Notes
              <span className="lh-sub">Visual notes & recall</span>
            </button>
          </div>
        </div>
        {tab === "lessons"
          ? (window.LP_Lessons ? <window.LP_Lessons onNav={onNav} embedded /> : null)
          : tab === "club"
          ? (window.LP_LearningClub ? <window.LP_LearningClub onNav={onNav} exams={exams} embedded /> : null)
          : (tab === "notes" ? <SmartNotesBrowser onNav={onNav} /> : null)}
        <window.LP_Footer />
      </>
    );
  }

  window.LP_LearnHub = LearnHub;
})();
