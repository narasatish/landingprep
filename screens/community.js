"use strict";
(function() {
  const { useState, useEffect } = React;
  const SEED = [
    { id: "s1", title: "Is IELTS 6.5 enough for an MS in Canada?", body: "I have 6.5 overall (6.0 writing). Will top Canadian universities accept this?", country: "Canada", tag: "Admissions", author: "Aarav", ts: Date.now() - 26e7, votes: 4, answers: [{ id: "a", body: "Most accept 6.5 overall with no band below 6.0. A few competitive programs want 7.0 \u2014 check each program page.", author: "Mentor", ts: Date.now() - 17e7, votes: 6 }] },
    { id: "s2", title: "USA vs Germany for MS CS on a tight budget?", body: "Budget ~$20k/yr. Is the US realistic with scholarships, or is Germany better?", country: "Germany", tag: "Funding", author: "Neha", ts: Date.now() - 43e7, votes: 7, answers: [{ id: "b", body: "On $20k, Germany is far safer \u2014 public universities are nearly tuition-free. The US needs a big assistantship. Try the ROI calculator.", author: "Mentor", ts: Date.now() - 34e7, votes: 9 }] }
  ];
  const ago = (ts) => {
    const d = Math.floor((Date.now() - ts) / 864e5);
    return d <= 0 ? "today" : d === 1 ? "1 day ago" : d + " days ago";
  };
  const TAGS = ["General", "Admissions", "Funding", "Visa", "Strategy", "Exams", "Living"];
  function CommunityPanel({ country }) {
    const [qs, setQs] = useState(null);
    const [online, setOnline] = useState(true);
    const [open, setOpen] = useState(null);
    const [asking, setAsking] = useState(false);
    const [form, setForm] = useState({ title: "", body: "", country: country && country !== "Any" ? country : "Multiple", tag: "General", author: "" });
    const [ans, setAns] = useState({});
    const FS = () => window.LP_FIRESTORE;
    const API = window.LP_API_BASE || "";
    const load = async () => {
      try {
        if (FS()) {
          setQs(await FS().community.list());
          setOnline(true);
          return;
        }
        const r = await fetch(API + "/api/community", { cache: "no-store" });
        if (!r.ok) throw 0;
        const j = await r.json();
        setQs(j.questions || []);
        setOnline(true);
      } catch (e) {
        setQs(SEED);
        setOnline(false);
      }
    };
    useEffect(() => {
      load();
      const onReady = () => load();
      window.addEventListener("lp-firestore-ready", onReady);
      return () => window.removeEventListener("lp-firestore-ready", onReady);
    }, []);
    const submitQ = async () => {
      if (form.title.trim().length < 8) return;
      try {
        if (FS()) {
          await FS().community.addQuestion(form);
        } else {
          const r = await fetch(API + "/api/community/question", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
          if (!r.ok) throw 0;
        }
        setForm({ ...form, title: "", body: "" });
        setAsking(false);
        load();
      } catch (e) {
        setOnline(false);
      }
    };
    const submitA = async (qid) => {
      const body = (ans[qid] || "").trim();
      if (body.length < 4) return;
      try {
        if (FS()) {
          await FS().community.addAnswer(qid, { body, author: form.author });
        } else {
          const r = await fetch(API + "/api/community/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: qid, body, author: form.author }) });
          if (!r.ok) throw 0;
        }
        setAns({ ...ans, [qid]: "" });
        load();
      } catch (e) {
        setOnline(false);
      }
    };
    const vote = async (qid, aid) => {
      try {
        if (FS()) {
          await FS().community.vote(qid, aid);
        } else {
          await fetch(API + "/api/community/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: qid, answerId: aid }) });
        }
        load();
      } catch (e) {
      }
    };
    if (!qs) return /* @__PURE__ */ React.createElement("div", { className: "tool-card" }, /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Loading community\u2026"));
    return /* @__PURE__ */ React.createElement("div", { className: "comm-panel" }, /* @__PURE__ */ React.createElement("div", { className: "tool-card comm-head" }, /* @__PURE__ */ React.createElement("div", { className: "comm-head-row" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", null, "\u{1F4AC} Community Q&A"), /* @__PURE__ */ React.createElement("p", { className: "tool-sub" }, "Ask anything about studying abroad and learn from other students' questions.")), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: () => setAsking((a) => !a) }, asking ? "Cancel" : "\uFF0B Ask a question")), !online && /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "\u26A0 You're viewing example questions. Posting needs the live server (run the app on the LandingPrep backend)."), asking && /* @__PURE__ */ React.createElement("div", { className: "comm-ask" }, /* @__PURE__ */ React.createElement("input", { value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), placeholder: "Your question (e.g. Is IELTS 6.5 enough for Canada?)", maxLength: 140 }), /* @__PURE__ */ React.createElement("textarea", { value: form.body, onChange: (e) => setForm({ ...form, body: e.target.value }), rows: 3, placeholder: "Add details (scores, budget, target country)\u2026", maxLength: 2e3 }), /* @__PURE__ */ React.createElement("div", { className: "comm-ask-row" }, /* @__PURE__ */ React.createElement("select", { value: form.country, onChange: (e) => setForm({ ...form, country: e.target.value }) }, /* @__PURE__ */ React.createElement("option", null, "Multiple"), (window.LP_COUNTRY_DATA || []).map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id }, c.name))), /* @__PURE__ */ React.createElement("select", { value: form.tag, onChange: (e) => setForm({ ...form, tag: e.target.value }) }, TAGS.map((t) => /* @__PURE__ */ React.createElement("option", { key: t }, t))), /* @__PURE__ */ React.createElement("input", { value: form.author, onChange: (e) => setForm({ ...form, author: e.target.value }), placeholder: "Your name (optional)", maxLength: 40 }), /* @__PURE__ */ React.createElement("button", { className: "tool-btn", onClick: submitQ, disabled: form.title.trim().length < 8 }, "Post")))), /* @__PURE__ */ React.createElement("div", { className: "comm-list" }, qs.map((q) => /* @__PURE__ */ React.createElement("div", { className: "comm-card", key: q.id }, /* @__PURE__ */ React.createElement("div", { className: "comm-q-head", onClick: () => setOpen(open === q.id ? null : q.id) }, /* @__PURE__ */ React.createElement("button", { className: "comm-vote", onClick: (e) => {
      e.stopPropagation();
      vote(q.id);
    } }, "\u25B2 ", /* @__PURE__ */ React.createElement("span", null, q.votes || 0)), /* @__PURE__ */ React.createElement("div", { className: "comm-q-main" }, /* @__PURE__ */ React.createElement("div", { className: "comm-q-title" }, q.title), /* @__PURE__ */ React.createElement("div", { className: "comm-q-meta" }, /* @__PURE__ */ React.createElement("span", { className: "comm-tag" }, q.tag), /* @__PURE__ */ React.createElement("span", { className: "comm-scope" }, q.country), /* @__PURE__ */ React.createElement("span", null, (q.answers || []).length, " answer", (q.answers || []).length === 1 ? "" : "s"), /* @__PURE__ */ React.createElement("span", null, "\xB7 ", q.author || "Anonymous", " \xB7 ", ago(q.ts)))), /* @__PURE__ */ React.createElement("span", { className: "comm-caret" }, open === q.id ? "\u2212" : "+")), open === q.id && /* @__PURE__ */ React.createElement("div", { className: "comm-q-body" }, q.body && /* @__PURE__ */ React.createElement("p", { className: "comm-q-text" }, q.body), (q.answers || []).map((a) => /* @__PURE__ */ React.createElement("div", { className: "comm-answer", key: a.id }, /* @__PURE__ */ React.createElement("button", { className: "comm-vote sm", onClick: () => vote(q.id, a.id) }, "\u25B2 ", /* @__PURE__ */ React.createElement("span", null, a.votes || 0)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "comm-a-text" }, a.body), /* @__PURE__ */ React.createElement("div", { className: "comm-a-meta" }, a.author || "Anonymous", " \xB7 ", ago(a.ts))))), /* @__PURE__ */ React.createElement("div", { className: "comm-add-answer" }, /* @__PURE__ */ React.createElement("textarea", { value: ans[q.id] || "", onChange: (e) => setAns({ ...ans, [q.id]: e.target.value }), rows: 2, placeholder: "Share your answer or experience\u2026", maxLength: 2e3 }), /* @__PURE__ */ React.createElement("button", { className: "tool-btn ghost", onClick: () => submitA(q.id), disabled: (ans[q.id] || "").trim().length < 4 }, "Post answer")))))), /* @__PURE__ */ React.createElement("p", { className: "tool-note" }, "Be kind and helpful. Answers are community opinions \u2014 always verify official requirements with the university or embassy."));
  }
  window.LP_CommunityPanel = CommunityPanel;
})();
