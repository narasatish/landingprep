"use strict";
(function() {
  const { useState, useRef, useEffect } = React;
  const QUICK = [
    "Which country suits my budget and profile?",
    "USA vs Canada for an MS \u2014 which is better for me?",
    "How do I improve my chances of a strong scholarship?",
    "What are my chances of a student visa, and how do I prepare?",
    "Build me a 6-month plan to apply for Fall intake."
  ];
  function CounsellorPanel({ country }) {
    const [messages, setMessages] = useState([
      { role: "bot", text: `Hi! I'm your free AI study-abroad counsellor. Tell me your target (e.g. ${country || "USA"}), your test scores, GPA and budget \u2014 and ask me anything about countries, universities, scholarships, visas or timelines.` }
    ]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const listRef = useRef(null);
    useEffect(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, busy]);
    const ask = async (q) => {
      const question = (q || input).trim();
      if (!question || busy) return;
      setInput("");
      setMessages((m) => [...m, { role: "user", text: question }]);
      setBusy(true);
      const prompt = `You are an expert, friendly study-abroad counsellor for international students. The student is currently exploring ${country || "options"}. Give specific, practical, honest advice in under 180 words. Cover concrete steps, realistic expectations, and mention relevant countries, score targets, scholarships or timelines where useful. Do not invent guarantees.

Student question: ${question}`;
      let reply = "";
      try {
        if (window.LP_AI_TUTOR && window.LP_AI_TUTOR.generate) {
          const r = (await window.LP_AI_TUTOR.generate(prompt) || "").trim();
          if (r && !/(?:AI|Smart) Tutor is offline/i.test(r) && !r.startsWith("\u26A0")) reply = r;
        }
      } catch (e) {
      }
      if (!reply) {
        reply = "I can't reach the AI service right now, but here's a quick start: shortlist 2\u20133 countries that fit your budget and PR goals (use the Country Guide tab), run the College Predictor for your scores, check the Scholarship finder, and build your timeline with the Study Planner. Re-ask me when the backend is online for tailored advice.";
      }
      setMessages((m) => [...m, { role: "bot", text: reply }]);
      setBusy(false);
    };
    return /* @__PURE__ */ React.createElement("div", { className: "couns-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4AC} AI Study-Abroad Counsellor"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Free, instant guidance on countries, universities, scholarships, visas and timelines. Currently focused on ", /* @__PURE__ */ React.createElement("strong", null, country || "all destinations"), " \u2014 switch the country above to change context.")), /* @__PURE__ */ React.createElement("div", { className: "couns-chat tool-card" }, /* @__PURE__ */ React.createElement("div", { className: "couns-messages", ref: listRef }, messages.map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "couns-msg " + m.role + (m.role === "bot" ? " md-body" : "") }, m.role === "bot" && window.LP_MD ? window.LP_MD(m.text) : m.text)), busy && /* @__PURE__ */ React.createElement("div", { className: "couns-msg bot couns-typing" }, "Thinking\u2026")), /* @__PURE__ */ React.createElement("div", { className: "couns-quick" }, QUICK.map((q, i) => /* @__PURE__ */ React.createElement("button", { key: i, className: "couns-chip", onClick: () => ask(q), disabled: busy }, q))), /* @__PURE__ */ React.createElement("form", { className: "couns-input", onSubmit: (e) => {
      e.preventDefault();
      ask();
    } }, /* @__PURE__ */ React.createElement("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Ask anything about studying abroad\u2026" }), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", type: "submit", disabled: busy || !input.trim() }, busy ? "\u2026" : "Ask"))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "This guidance is informational \u2014 always verify visa, deadline and eligibility details with the official source."));
  }
  window.LP_CounsellorPanel = CounsellorPanel;
  function ProgramFinderPanel({ country, onNav }) {
    const ALL = window.LP_COLLEGES || [];
    const [q, setQ] = useState("");
    const [maxFee, setMaxFee] = useState("");
    const [noGre, setNoGre] = useState(false);
    const budget = parseFloat(maxFee) || 0;
    const matches = ALL.filter((c) => !country || country === "Any" || c.country === country).filter((c) => !budget || c.tuitionUSD <= budget + 2e3).filter((c) => !noGre || /optional|not/i.test(String(c.gre))).map((c) => ({ c, progs: c.programs.filter((p) => !q.trim() || p.toLowerCase().includes(q.trim().toLowerCase())) })).filter((x) => !q.trim() || x.progs.length).sort((a, b) => a.c.rank - b.c.rank);
    return /* @__PURE__ */ React.createElement("div", { className: "prog-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("h2", null, "\u{1F3AF} Course & Program Finder", country && country !== "Any" ? " \u2014 " + country : ""), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Search a program across ", country && country !== "Any" ? country + "'s" : "all", " top universities and instantly see who offers it, with fees and requirements."), /* @__PURE__ */ React.createElement("div", { className: "tool-row" }, /* @__PURE__ */ React.createElement("label", null, "Program / keyword", /* @__PURE__ */ React.createElement("input", { type: "text", value: q, onChange: (e) => setQ(e.target.value), placeholder: "e.g. data science, MBA, AI, finance" })), /* @__PURE__ */ React.createElement("label", null, "Max tuition (USD/yr)", /* @__PURE__ */ React.createElement("input", { type: "number", value: maxFee, onChange: (e) => setMaxFee(e.target.value), placeholder: "optional" })), /* @__PURE__ */ React.createElement("label", { className: "chk" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: noGre, onChange: (e) => setNoGre(e.target.checked) }), " No GRE required"))), /* @__PURE__ */ React.createElement("div", { className: "prog-results" }, /* @__PURE__ */ React.createElement("h3", null, matches.length, " universit", matches.length === 1 ? "y" : "ies", " found"), matches.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "No matches \u2014 try a broader keyword or widen the budget.")) : matches.map(({ c, progs }) => /* @__PURE__ */ React.createElement("div", { className: "prog-card", key: c.id }, /* @__PURE__ */ React.createElement("div", { className: "prog-head" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("a", { className: "prog-name", href: "/university/" + c.id + "/" }, c.name), /* @__PURE__ */ React.createElement("div", { className: "prog-meta" }, c.country, " \xB7 QS #", c.rank, " \xB7 IELTS ", c.ielts, " \xB7 GRE ", c.gre, " \xB7 ", c.feeNote))), /* @__PURE__ */ React.createElement("div", { className: "prog-progs" }, (q.trim() ? progs : c.programs).map((p) => /* @__PURE__ */ React.createElement("span", { key: p, className: "prog-tag" + (q.trim() && p.toLowerCase().includes(q.trim().toLowerCase()) ? " hit" : "") }, p)))))));
  }
  window.LP_ProgramFinderPanel = ProgramFinderPanel;
})();
