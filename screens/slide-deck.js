"use strict";
(function() {
  const { useState, useEffect } = React;
  function renderTitle(s) {
    if (s.accent && s.title.indexOf(s.accent) >= 0) {
      const parts = s.title.split(s.accent);
      return /* @__PURE__ */ React.createElement(React.Fragment, null, parts[0], /* @__PURE__ */ React.createElement("span", { className: "slide-accent" }, s.accent), parts.slice(1).join(s.accent));
    }
    return s.title;
  }
  function Slide({ s, idx, total, deck }) {
    const note = s.note || s.tip;
    const caption = s.visualCaption || deck && deck.section || "";
    return /* @__PURE__ */ React.createElement("div", { className: "slide" }, /* @__PURE__ */ React.createElement("span", { className: "slide-blob slide-blob-tr" }), /* @__PURE__ */ React.createElement("span", { className: "slide-blob slide-blob-bl" }), /* @__PURE__ */ React.createElement("div", { className: "slide-grid" }, /* @__PURE__ */ React.createElement("div", { className: "slide-left" }, /* @__PURE__ */ React.createElement("div", { className: "slide-num" }, idx + 1, " / ", total), /* @__PURE__ */ React.createElement("h2", { className: "slide-title" }, renderTitle(s)), /* @__PURE__ */ React.createElement("ul", { className: "slide-points" }, (s.points || []).map((p, i) => /* @__PURE__ */ React.createElement("li", { key: i }, p))), s.example && /* @__PURE__ */ React.createElement("div", { className: "slide-example" }, /* @__PURE__ */ React.createElement("strong", null, s.example.label, ": "), s.example.text), s.warn && /* @__PURE__ */ React.createElement("div", { className: "slide-warn" }, "\u26A0\uFE0F ", s.warn), note && /* @__PURE__ */ React.createElement("div", { className: "slide-note" }, "\u{1F399}\uFE0F ", note)), /* @__PURE__ */ React.createElement("div", { className: "slide-right" }, /* @__PURE__ */ React.createElement("div", { className: "slide-visual" }, /* @__PURE__ */ React.createElement("div", { className: "slide-visual-emoji" }, s.emoji || "\u{1F4CC}"), caption && /* @__PURE__ */ React.createElement("div", { className: "slide-visual-cap" }, caption)))));
  }
  function DeckViewer({ deck, onExit }) {
    const [i, setI] = useState(0);
    const total = deck.slides.length;
    const next = () => setI((x) => Math.min(total - 1, x + 1));
    const prev = () => setI((x) => Math.max(0, x - 1));
    useEffect(() => {
      const k = (e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      };
      window.addEventListener("keydown", k);
      return () => window.removeEventListener("keydown", k);
    }, [total]);
    useEffect(() => {
      try {
        document.title = deck.title + " | LandingPrep";
      } catch (e) {
      }
    }, []);
    return /* @__PURE__ */ React.createElement("div", { className: "deck-stage" }, /* @__PURE__ */ React.createElement("div", { className: "deck-bar" }, /* @__PURE__ */ React.createElement("a", { className: "deck-back", onClick: onExit }, "\u2190 All lessons"), /* @__PURE__ */ React.createElement("span", { className: "deck-title-mini" }, deck.emoji, " ", deck.examName, " \xB7 ", deck.section)), /* @__PURE__ */ React.createElement("div", { className: "deck-progress" }, /* @__PURE__ */ React.createElement("div", { className: "deck-progress-fill", style: { width: (i + 1) / total * 100 + "%" } })), /* @__PURE__ */ React.createElement("div", { className: "slide-frame" }, /* @__PURE__ */ React.createElement(Slide, { s: deck.slides[i], idx: i, total, deck })), /* @__PURE__ */ React.createElement("div", { className: "deck-controls" }, /* @__PURE__ */ React.createElement("button", { className: "btn", disabled: i === 0, onClick: prev }, "\u2190 Back"), /* @__PURE__ */ React.createElement("div", { className: "deck-dots" }, deck.slides.map((_, d) => /* @__PURE__ */ React.createElement("span", { key: d, className: "deck-dot" + (d === i ? " on" : ""), onClick: () => setI(d) }))), i < total - 1 ? /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: next }, "Next \u2192") : /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: onExit }, "Finish \u2713")));
  }
  function Lessons({ onNav }) {
    const plan = window.LP_SLIDE_DECK_PLAN || [];
    const decks = window.LP_SLIDE_DECKS || {};
    const [openId, setOpenId] = useState(null);
    useEffect(() => {
      try {
        document.title = "Free Exam Prep Lessons \u2014 Tips, Tricks & Strategy Slides | LandingPrep";
        const m = document.querySelector('meta[name="description"]');
        if (m) m.setAttribute("content", "Free slide lessons for IELTS, TOEFL, PTE, GRE, GMAT, CELPIP & Duolingo \u2014 tips, tricks, traps and section-by-section strategy. Learn first, then practise with free mocks.");
      } catch (e) {
      }
    }, []);
    if (openId && decks[openId]) {
      return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "lessons", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell" }, /* @__PURE__ */ React.createElement(DeckViewer, { deck: decks[openId], onExit: () => setOpenId(null) })), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
    }
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "lessons", onNav }), /* @__PURE__ */ React.createElement("main", { className: "tools-shell" }, /* @__PURE__ */ React.createElement("header", { className: "tools-hero" }, /* @__PURE__ */ React.createElement("h1", null, "\u{1F4CA} Exam Prep Lessons"), /* @__PURE__ */ React.createElement("p", null, "Quick, visual slide lessons \u2014 tips, tricks and traps for each section. Learn the strategy here, then practise with our free mocks.")), plan.map((ex) => /* @__PURE__ */ React.createElement("div", { className: "tool-card", key: ex.exam }, /* @__PURE__ */ React.createElement("h3", null, ex.emoji, " ", ex.examName), /* @__PURE__ */ React.createElement("div", { className: "deck-grid" }, ex.decks.map((d, di) => {
      const ready = d.ready && decks[d.id];
      return /* @__PURE__ */ React.createElement("button", { key: di, className: "deck-card" + (ready ? "" : " soon"), disabled: !ready, onClick: () => ready && setOpenId(d.id) }, /* @__PURE__ */ React.createElement("span", { className: "deck-card-emoji" }, d.emoji), /* @__PURE__ */ React.createElement("span", { className: "deck-card-name" }, d.section), /* @__PURE__ */ React.createElement("span", { className: "deck-card-meta" }, ready ? decks[d.id].slides.length + " slides \u2192" : "Coming soon"));
    }))))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  window.LP_Lessons = Lessons;
})();
