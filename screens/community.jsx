/* global React, window, fetch, localStorage */
"use strict";

// LandingPrep — Community Q&A. Students ask and answer study-abroad questions,
// backed by the node server (/api/community). Falls back to a read-only seed
// when the backend is offline, so the UI always renders.
(function () {
  const { useState, useEffect } = React;

  const SEED = [
    { id: "s1", title: "Is IELTS 6.5 enough for an MS in Canada?", body: "I have 6.5 overall (6.0 writing). Will top Canadian universities accept this?", country: "Canada", tag: "Admissions", author: "Aarav", ts: Date.now() - 2.6e8, votes: 4, answers: [{ id: "a", body: "Most accept 6.5 overall with no band below 6.0. A few competitive programs want 7.0 — check each program page.", author: "Mentor", ts: Date.now() - 1.7e8, votes: 6 }] },
    { id: "s2", title: "USA vs Germany for MS CS on a tight budget?", body: "Budget ~$20k/yr. Is the US realistic with scholarships, or is Germany better?", country: "Germany", tag: "Funding", author: "Neha", ts: Date.now() - 4.3e8, votes: 7, answers: [{ id: "b", body: "On $20k, Germany is far safer — public universities are nearly tuition-free. The US needs a big assistantship. Try the ROI calculator.", author: "Mentor", ts: Date.now() - 3.4e8, votes: 9 }] },
  ];
  const ago = (ts) => { const d = Math.floor((Date.now() - ts) / 86400000); return d <= 0 ? "today" : d === 1 ? "1 day ago" : d + " days ago"; };
  const TAGS = ["General", "Admissions", "Funding", "Visa", "Strategy", "Exams", "Living"];

  function CommunityPanel({ country }) {
    const [qs, setQs] = useState(null);
    const [online, setOnline] = useState(true);
    const [open, setOpen] = useState(null);
    const [asking, setAsking] = useState(false);
    const [form, setForm] = useState({ title: "", body: "", country: country && country !== "Any" ? country : "Multiple", tag: "General", author: "" });
    const [ans, setAns] = useState({});

    const FS = () => window.LP_FIRESTORE; // use Firestore if configured, else /api
    const API = window.LP_API_BASE || ""; // Render backend base when split, else same-origin
    const load = async () => {
      try {
        if (FS()) { setQs(await FS().community.list()); setOnline(true); return; }
        const r = await fetch(API + "/api/community", { cache: "no-store" });
        if (!r.ok) throw 0;
        const j = await r.json(); setQs(j.questions || []); setOnline(true);
      } catch (e) { setQs(SEED); setOnline(false); }
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
        if (FS()) { await FS().community.addQuestion(form); }
        else { const r = await fetch(API + "/api/community/question", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); if (!r.ok) throw 0; }
        setForm({ ...form, title: "", body: "" }); setAsking(false); load();
      } catch (e) { setOnline(false); }
    };
    const submitA = async (qid) => {
      const body = (ans[qid] || "").trim(); if (body.length < 4) return;
      try {
        if (FS()) { await FS().community.addAnswer(qid, { body, author: form.author }); }
        else { const r = await fetch(API + "/api/community/answer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: qid, body, author: form.author }) }); if (!r.ok) throw 0; }
        setAns({ ...ans, [qid]: "" }); load();
      } catch (e) { setOnline(false); }
    };
    const vote = async (qid, aid) => {
      try {
        if (FS()) { await FS().community.vote(qid, aid); }
        else { await fetch(API + "/api/community/vote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: qid, answerId: aid }) }); }
        load();
      } catch (e) {}
    };

    if (!qs) return <div className="tool-card"><p className="tool-sub">Loading community…</p></div>;

    return (
      <div className="comm-panel">
        <div className="tool-card comm-head">
          <div className="comm-head-row">
            <div><h2>💬 Community Q&amp;A</h2><p className="tool-sub">Ask anything about studying abroad and learn from other students' questions.</p></div>
            <button className="tool-btn" onClick={() => setAsking((a) => !a)}>{asking ? "Cancel" : "＋ Ask a question"}</button>
          </div>
          {!online && <p className="tool-note">⚠ You're viewing example questions. Posting needs the live server (run the app on the LandingPrep backend).</p>}
          {asking && (
            <div className="comm-ask">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Your question (e.g. Is IELTS 6.5 enough for Canada?)" maxLength={140} />
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} placeholder="Add details (scores, budget, target country)…" maxLength={2000} />
              <div className="comm-ask-row">
                <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}><option>Multiple</option>{(window.LP_COUNTRY_DATA || []).map((c) => <option key={c.id}>{c.name}</option>)}</select>
                <select value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })}>{TAGS.map((t) => <option key={t}>{t}</option>)}</select>
                <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Your name (optional)" maxLength={40} />
                <button className="tool-btn" onClick={submitQ} disabled={form.title.trim().length < 8}>Post</button>
              </div>
            </div>
          )}
        </div>

        <div className="comm-list">
          {qs.map((q) => (
            <div className="comm-card" key={q.id}>
              <div className="comm-q-head" onClick={() => setOpen(open === q.id ? null : q.id)}>
                <button className="comm-vote" onClick={(e) => { e.stopPropagation(); vote(q.id); }}>▲ <span>{q.votes || 0}</span></button>
                <div className="comm-q-main">
                  <div className="comm-q-title">{q.title}</div>
                  <div className="comm-q-meta"><span className="comm-tag">{q.tag}</span><span className="comm-scope">{q.country}</span><span>{(q.answers || []).length} answer{(q.answers || []).length === 1 ? "" : "s"}</span><span>· {q.author || "Anonymous"} · {ago(q.ts)}</span></div>
                </div>
                <span className="comm-caret">{open === q.id ? "−" : "+"}</span>
              </div>
              {open === q.id && (
                <div className="comm-q-body">
                  {q.body && <p className="comm-q-text">{q.body}</p>}
                  {(q.answers || []).map((a) => (
                    <div className="comm-answer" key={a.id}>
                      <button className="comm-vote sm" onClick={() => vote(q.id, a.id)}>▲ <span>{a.votes || 0}</span></button>
                      <div><div className="comm-a-text">{a.body}</div><div className="comm-a-meta">{a.author || "Anonymous"} · {ago(a.ts)}</div></div>
                    </div>
                  ))}
                  <div className="comm-add-answer">
                    <textarea value={ans[q.id] || ""} onChange={(e) => setAns({ ...ans, [q.id]: e.target.value })} rows={2} placeholder="Share your answer or experience…" maxLength={2000} />
                    <button className="tool-btn ghost" onClick={() => submitA(q.id)} disabled={(ans[q.id] || "").trim().length < 4}>Post answer</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="tool-note">Be kind and helpful. Answers are community opinions — always verify official requirements with the university or embassy.</p>
      </div>
    );
  }

  window.LP_CommunityPanel = CommunityPanel;
})();
