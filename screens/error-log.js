"use strict";
(function() {
  const { useState } = React;
  function load() {
    try {
      return JSON.parse(localStorage.getItem("lp_errors") || "[]");
    } catch (e) {
      return [];
    }
  }
  function save(a) {
    try {
      localStorage.setItem("lp_errors", JSON.stringify(a));
    } catch (e) {
    }
  }
  const fmt = (a) => Array.isArray(a) ? a.join(", ") : String(a == null || a === "" ? "\u2014" : a);
  const TYPE_LABEL = { mcq: "Multiple choice", mcq_multi: "Multi-select", tfng: "True/False/NG", yng: "Yes/No/NG", fill: "Fill the gap", form_field: "Form completion", sent_fill: "Sentence completion", match_heading: "Match heading" };
  function ErrorItem({ item, onUpdate, onRemove }) {
    const [picked, setPicked] = useState(null);
    const mastered = (item.mastered || 0) >= 1;
    const isChoice = ["mcq", "tfng", "yng"].includes(item.type) && Array.isArray(item.options) && item.options.length;
    const tryAns = (opt) => {
      if (picked != null) return;
      setPicked(opt);
      if (opt === item.answer) onUpdate(item.key, { mastered: (item.mastered || 0) + 1 });
    };
    return /* @__PURE__ */ React.createElement("div", { className: "err-item" + (mastered ? " mastered" : "") }, /* @__PURE__ */ React.createElement("div", { className: "err-top" }, /* @__PURE__ */ React.createElement("span", { className: "err-badges" }, /* @__PURE__ */ React.createElement("span", { className: "err-badge" }, (item.examName || item.exam || "").toUpperCase()), /* @__PURE__ */ React.createElement("span", { className: "err-badge sec" }, item.section), /* @__PURE__ */ React.createElement("span", { className: "err-badge type" }, TYPE_LABEL[item.type] || item.type), mastered && /* @__PURE__ */ React.createElement("span", { className: "err-badge done" }, "\u2713 Mastered")), /* @__PURE__ */ React.createElement("button", { className: "err-x", title: "Remove", onClick: () => onRemove(item.key) }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "err-q" }, item.text), isChoice && picked == null ? /* @__PURE__ */ React.createElement("div", { className: "err-options" }, item.options.map((o, i) => /* @__PURE__ */ React.createElement("button", { key: i, className: "err-opt", onClick: () => tryAns(o) }, o))) : /* @__PURE__ */ React.createElement("div", { className: "err-answers" }, picked != null && /* @__PURE__ */ React.createElement("div", { className: "err-row " + (picked === item.answer ? "good" : "bad") }, "You picked: ", /* @__PURE__ */ React.createElement("strong", null, fmt(picked)), " ", picked === item.answer ? "\u2713 correct!" : "\u2717"), /* @__PURE__ */ React.createElement("div", { className: "err-row" }, /* @__PURE__ */ React.createElement("span", null, "Your original answer:"), " ", /* @__PURE__ */ React.createElement("strong", { className: "bad-text" }, fmt(item.given))), /* @__PURE__ */ React.createElement("div", { className: "err-row" }, /* @__PURE__ */ React.createElement("span", null, "Correct answer:"), " ", /* @__PURE__ */ React.createElement("strong", { className: "good-text" }, fmt(item.answer))), item.explanation && /* @__PURE__ */ React.createElement("div", { className: "err-exp" }, /* @__PURE__ */ React.createElement("strong", null, "Why:"), " ", item.explanation)), /* @__PURE__ */ React.createElement("div", { className: "err-actions" }, !mastered && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: () => onUpdate(item.key, { mastered: 1 }) }, "Mark mastered"), mastered && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: () => onUpdate(item.key, { mastered: 0 }) }, "Revise again")));
  }
  function ErrorLogPanel({ exams }) {
    const [errs, setErrs] = useState(load);
    const [examF, setExamF] = useState("all");
    const [hideMastered, setHideMastered] = useState(true);
    if (!errs.length) return null;
    const update = (key, patch) => {
      const next = errs.map((e) => e.key === key ? { ...e, ...patch } : e);
      setErrs(next);
      save(next);
    };
    const remove = (key) => {
      const next = errs.filter((e) => e.key !== key);
      setErrs(next);
      save(next);
    };
    const clearMastered = () => {
      const next = errs.filter((e) => !(e.mastered >= 1));
      setErrs(next);
      save(next);
    };
    const examIds = [...new Set(errs.map((e) => e.exam))];
    let shown = errs.filter((e) => examF === "all" || e.exam === examF);
    if (hideMastered) shown = shown.filter((e) => !(e.mastered >= 1));
    const masteredCount = errs.filter((e) => e.mastered >= 1).length;
    return /* @__PURE__ */ React.createElement("section", { className: "progress-section" }, /* @__PURE__ */ React.createElement("div", { className: "history-header" }, /* @__PURE__ */ React.createElement("h2", { className: "section-heading", style: { margin: 0 } }, "\u{1F4D3} Mistake Notebook"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--ink-3)", fontSize: 14 } }, errs.length, " saved \xB7 ", masteredCount, " mastered")), /* @__PURE__ */ React.createElement("p", { style: { color: "var(--ink-3)", marginTop: -2, fontSize: 14 } }, "Every question you got wrong, in one place. Re-try it, then mark it mastered. Keep this empty and you're test-ready."), /* @__PURE__ */ React.createElement("div", { className: "err-filters" }, /* @__PURE__ */ React.createElement("select", { value: examF, onChange: (e) => setExamF(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "All exams"), examIds.map((id) => {
      const ex = (exams || []).find((x) => x.id === id);
      return /* @__PURE__ */ React.createElement("option", { key: id, value: id }, ex ? ex.name : id);
    })), /* @__PURE__ */ React.createElement("label", { className: "err-check" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: hideMastered, onChange: (e) => setHideMastered(e.target.checked) }), " Hide mastered"), masteredCount > 0 && /* @__PURE__ */ React.createElement("button", { className: "btn btn-sm", onClick: clearMastered }, "Clear mastered")), shown.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "err-empty" }, "\u{1F389} Nothing to revise here \u2014 great work!") : /* @__PURE__ */ React.createElement("div", { className: "err-list" }, shown.map((it) => /* @__PURE__ */ React.createElement(ErrorItem, { key: it.key, item: it, onUpdate: update, onRemove: remove }))));
  }
  window.LP_ErrorLogPanel = ErrorLogPanel;
})();
