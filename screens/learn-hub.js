"use strict";
(function() {
  const { useState, useEffect } = React;
  function SmartNotesBrowser({ onNav }) {
    const [catalog, setCatalog] = useState({});
    const [active, setActive] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      setLoading(true);
      fetch("/content/smart-notes/index.json").then((r) => r.json()).then((data) => {
        setCatalog(data);
        setLoading(false);
      }).catch((e) => {
        console.log("Smart Notes catalog fetch failed:", e);
        setCatalog({});
        setLoading(false);
      });
    }, []);
    const openNote = (exam, note) => {
      setLoading(true);
      fetch(`/content/smart-notes/${exam}/${note.slug}.json`).then((r) => r.json()).then((fullNote) => {
        setActive(fullNote);
        setLoading(false);
      }).catch((e) => {
        console.log("Smart Note fetch failed:", exam, note.slug, e);
        setActive(null);
        setLoading(false);
      });
    };
    if (active) {
      return /* @__PURE__ */ React.createElement("div", { className: "smartnotes-viewer" }, /* @__PURE__ */ React.createElement("button", { className: "smartnotes-back", onClick: () => setActive(null) }, "\u2190 Back to Smart Notes"), window.LP_SmartNote ? React.createElement(window.LP_SmartNote, { note: active }) : /* @__PURE__ */ React.createElement("div", null, "Smart Note renderer not available."));
    }
    if (loading) return /* @__PURE__ */ React.createElement("div", { style: { padding: "2rem", textAlign: "center" } }, "Loading...");
    if (Object.keys(catalog).length === 0) {
      return /* @__PURE__ */ React.createElement("div", { style: { padding: "2rem", textAlign: "center", color: "var(--ink-2)" } }, "Smart Notes are coming soon.");
    }
    return /* @__PURE__ */ React.createElement("div", { className: "smartnotes-catalog" }, Object.entries(catalog).map(([exam, notes]) => /* @__PURE__ */ React.createElement("section", { key: exam, className: "smartnotes-section" }, /* @__PURE__ */ React.createElement("h2", { style: { marginTop: "2rem", marginBottom: "1rem" } }, exam.toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "grid", style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" } }, notes.map((note) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: note.id,
        className: "tile",
        onClick: () => openNote(exam, note),
        style: { padding: "1rem", textAlign: "left", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", backgroundColor: "var(--surface)", color: "var(--ink)", cursor: "pointer" }
      },
      /* @__PURE__ */ React.createElement("strong", null, note.title),
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: "0.9rem", color: "var(--ink-2)", marginTop: "0.5rem" } }, note.section, " \xB7 ", note.estMinutes, " min")
    ))))));
  }
  function LearnHub({ onNav, exams, initialTab }) {
    const [tab, setTab] = useState(initialTab === "club" ? "club" : initialTab === "notes" ? "notes" : "lessons");
    useEffect(() => {
      try {
        if (tab === "lessons") {
          document.title = "Learn \u2014 Free Exam Prep Lessons (PPT) & Strategy | LandingPrep";
        } else if (tab === "club") {
          document.title = "Learn \u2014 Learning Club: Model Answers & Vocabulary | LandingPrep";
        } else if (tab === "notes") {
          document.title = "Learn \u2014 Smart Notes: Visual Lessons & Recall | LandingPrep";
        }
        const m = document.querySelector('meta[name="description"]');
        if (m) {
          const desc = tab === "notes" ? "Free Smart Notes: visual concept maps with chunked notes, real examples and built-in spaced-repetition recall for IELTS, TOEFL, PTE, GRE, GMAT, CELPIP, Duolingo, German & French. Learn visually, then recall." : "Learn first, then practise \u2014 free PPT-style lessons for every exam section plus the Learning Club: full model answers, speaking samples and vocabulary for IELTS, TOEFL, PTE, GRE, GMAT, CELPIP, Duolingo, German & French.";
          m.setAttribute("content", desc);
        }
      } catch (e) {
      }
    }, [tab]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "learn", onNav }), /* @__PURE__ */ React.createElement("div", { className: "learnhub-bar" }, /* @__PURE__ */ React.createElement("div", { className: "learnhub-tabs" }, /* @__PURE__ */ React.createElement("button", { className: "learnhub-tab" + (tab === "lessons" ? " active" : ""), onClick: () => setTab("lessons") }, /* @__PURE__ */ React.createElement("span", { className: "lh-ico" }, "\u{1F4CA}"), " Prep Lessons", /* @__PURE__ */ React.createElement("span", { className: "lh-sub" }, "Learn the strategy")), /* @__PURE__ */ React.createElement("button", { className: "learnhub-tab" + (tab === "club" ? " active" : ""), onClick: () => setTab("club") }, /* @__PURE__ */ React.createElement("span", { className: "lh-ico" }, "\u{1F393}"), " Learning Club", /* @__PURE__ */ React.createElement("span", { className: "lh-sub" }, "Model answers & vocab")), /* @__PURE__ */ React.createElement("button", { className: "learnhub-tab" + (tab === "notes" ? " active" : ""), onClick: () => setTab("notes") }, /* @__PURE__ */ React.createElement("span", { className: "lh-ico" }, "\u{1F9E0}"), " Smart Notes", /* @__PURE__ */ React.createElement("span", { className: "lh-sub" }, "Visual notes & recall")))), tab === "lessons" ? window.LP_Lessons ? /* @__PURE__ */ React.createElement(window.LP_Lessons, { onNav, embedded: true }) : null : tab === "club" ? window.LP_LearningClub ? /* @__PURE__ */ React.createElement(window.LP_LearningClub, { onNav, exams, embedded: true }) : null : tab === "notes" ? /* @__PURE__ */ React.createElement(SmartNotesBrowser, { onNav }) : null, /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_LearnHub = LearnHub;
})();
