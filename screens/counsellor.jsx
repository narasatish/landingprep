/* global React, window */
"use strict";

// LandingPrep — AI Study-Abroad Counsellor + Course/Program Finder.
(function () {
  const { useState, useRef, useEffect } = React;

  // ── AI Study-Abroad Counsellor ────────────────────────────────────────────
  const QUICK = [
    "Which country suits my budget and profile?",
    "USA vs Canada for an MS — which is better for me?",
    "How do I improve my chances of a strong scholarship?",
    "What are my chances of a student visa, and how do I prepare?",
    "Build me a 6-month plan to apply for Fall intake.",
  ];

  function CounsellorPanel({ country }) {
    const [messages, setMessages] = useState([
      { role: "bot", text: `Hi! I'm your free AI study-abroad counsellor. Tell me your target (e.g. ${country || "USA"}), your test scores, GPA and budget — and ask me anything about countries, universities, scholarships, visas or timelines.` },
    ]);
    const [input, setInput] = useState("");
    const [busy, setBusy] = useState(false);
    const listRef = useRef(null);
    useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages, busy]);

    const ask = async (q) => {
      const question = (q || input).trim();
      if (!question || busy) return;
      setInput("");
      setMessages(m => [...m, { role: "user", text: question }]);
      setBusy(true);
      const prompt =
        `You are an expert, friendly study-abroad counsellor for international students. The student is currently exploring ${country || "options"}. ` +
        `Give specific, practical, honest advice in under 180 words. Cover concrete steps, realistic expectations, and mention relevant countries, score targets, scholarships or timelines where useful. Do not invent guarantees.\n\n` +
        `Student question: ${question}`;
      let reply = "";
      try {
        if (window.LP_AI_TUTOR && window.LP_AI_TUTOR.generate) {
          const r = (await window.LP_AI_TUTOR.generate(prompt) || "").trim();
          if (r && !/(?:AI|Smart) Tutor is offline/i.test(r) && !r.startsWith("⚠")) reply = r;
        }
      } catch (e) {}
      if (!reply) {
        reply = "I can't reach the AI service right now, but here's a quick start: shortlist 2–3 countries that fit your budget and PR goals (use the Country Guide tab), run the College Predictor for your scores, check the Scholarship finder, and build your timeline with the Study Planner. Re-ask me when the backend is online for tailored advice.";
      }
      setMessages(m => [...m, { role: "bot", text: reply }]);
      setBusy(false);
    };

    return (
      <div className="couns-panel">
        <div className="tool-card">
          <h2>💬 AI Study-Abroad Counsellor</h2>
          <p className="tool-sub">Free, instant guidance on countries, universities, scholarships, visas and timelines. Currently focused on <strong>{country || "all destinations"}</strong> — switch the country above to change context.</p>
        </div>
        <div className="couns-chat tool-card">
          <div className="couns-messages" ref={listRef}>
            {messages.map((m, i) => <div key={i} className={"couns-msg " + m.role + (m.role === "bot" ? " md-body" : "")}>{m.role === "bot" && window.LP_MD ? window.LP_MD(m.text) : m.text}</div>)}
            {busy && <div className="couns-msg bot couns-typing">Thinking…</div>}
          </div>
          <div className="couns-quick">
            {QUICK.map((q, i) => <button key={i} className="couns-chip" onClick={() => ask(q)} disabled={busy}>{q}</button>)}
          </div>
          <form className="couns-input" onSubmit={e => { e.preventDefault(); ask(); }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything about studying abroad…" />
            <button className="tool-btn" type="submit" disabled={busy || !input.trim()}>{busy ? "…" : "Ask"}</button>
          </form>
        </div>
        <p className="tool-note">This guidance is informational — always verify visa, deadline and eligibility details with the official source.</p>
      </div>
    );
  }
  window.LP_CounsellorPanel = CounsellorPanel;

  // ── Course / Program Finder ───────────────────────────────────────────────
  function ProgramFinderPanel({ country, onNav }) {
    const ALL = window.LP_COLLEGES || [];
    const [q, setQ] = useState("");
    const [maxFee, setMaxFee] = useState("");
    const [noGre, setNoGre] = useState(false);

    const budget = parseFloat(maxFee) || 0;
    const matches = ALL
      .filter(c => (!country || country === "Any" || c.country === country))
      .filter(c => !budget || c.tuitionUSD <= budget + 2000)
      .filter(c => !noGre || /optional|not/i.test(String(c.gre)))
      .map(c => ({ c, progs: c.programs.filter(p => !q.trim() || p.toLowerCase().includes(q.trim().toLowerCase())) }))
      .filter(x => !q.trim() || x.progs.length)
      .sort((a, b) => a.c.rank - b.c.rank);

    return (
      <div className="prog-panel">
        <div className="tool-card">
          <h2>🎯 Course &amp; Program Finder{country && country !== "Any" ? " — " + country : ""}</h2>
          <p className="tool-sub">Search a program across {country && country !== "Any" ? country + "'s" : "all"} top universities and instantly see who offers it, with fees and requirements.</p>
          <div className="tool-row">
            <label>Program / keyword
              <input type="text" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. data science, MBA, AI, finance" />
            </label>
            <label>Max tuition (USD/yr)
              <input type="number" value={maxFee} onChange={e => setMaxFee(e.target.value)} placeholder="optional" />
            </label>
            <label className="chk"><input type="checkbox" checked={noGre} onChange={e => setNoGre(e.target.checked)} /> No GRE required</label>
          </div>
        </div>
        <div className="prog-results">
          <h3>{matches.length} universit{matches.length === 1 ? "y" : "ies"} found</h3>
          {matches.length === 0 ? <div className="tool-card"><p className="tool-sub">No matches — try a broader keyword or widen the budget.</p></div>
            : matches.map(({ c, progs }) => (
              <div className="prog-card" key={c.id}>
                <div className="prog-head">
                  <div><a className="prog-name" href={"/university/" + c.id + "/"}>{c.name}</a>
                    <div className="prog-meta">{c.country} · QS #{c.rank} · IELTS {c.ielts} · GRE {c.gre} · {c.feeNote}</div></div>
                </div>
                <div className="prog-progs">{(q.trim() ? progs : c.programs).map(p => <span key={p} className={"prog-tag" + (q.trim() && p.toLowerCase().includes(q.trim().toLowerCase()) ? " hit" : "")}>{p}</span>)}</div>
              </div>
            ))}
        </div>
      </div>
    );
  }
  window.LP_ProgramFinderPanel = ProgramFinderPanel;
})();
