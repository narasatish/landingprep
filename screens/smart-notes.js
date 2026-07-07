(function() {
  function loadSRS() {
    try {
      return JSON.parse(localStorage.getItem("lp_srs") || "{}");
    } catch (e) {
      return {};
    }
  }
  function saveSRS(s) {
    try {
      localStorage.setItem("lp_srs", JSON.stringify(s));
    } catch (e) {
    }
  }
  const key = (deckId, cardId) => deckId + "::" + cardId;
  function addCards(deckId, cards) {
    const st = loadSRS();
    let added = 0;
    (cards || []).forEach((c) => {
      const k = key(deckId, c.id);
      if (!st[k]) {
        st[k] = { ease: 2.5, ivl: 0, due: Date.now() };
        added++;
      }
    });
    saveSRS(st);
    return added;
  }
  function rate(deckId, cardId, grade) {
    const st = loadSRS();
    const k = key(deckId, cardId);
    const cur = st[k] || { ease: 2.5, ivl: 0 };
    let ease = cur.ease, ivl = cur.ivl;
    if (grade === 0) {
      ease = Math.max(1.3, ease - 0.2);
      ivl = 0;
    } else if (grade === 1) {
      ease = Math.max(1.3, ease - 0.15);
      ivl = Math.max(1, Math.round((ivl || 1) * 1.2));
    } else if (grade === 2) {
      ivl = ivl === 0 ? 1 : Math.round(ivl * ease);
    } else {
      ease = ease + 0.15;
      ivl = Math.round((ivl === 0 ? 2 : ivl * ease) * 1.3);
    }
    st[k] = { ease, ivl, due: Date.now() + Math.max(0, ivl) * 864e5 };
    saveSRS(st);
  }
  function dueCount(deckId) {
    const st = loadSRS();
    const now = Date.now();
    return Object.keys(st).filter((k) => k.startsWith(deckId + "::") && st[k].due <= now).length;
  }
  window.LP_SRS = { addCards, rate, dueCount };
  const { useState } = React;
  function ConceptMap({ map }) {
    const nodes = (map.nodes || []).slice(0, 7);
    const W = 640, H = 360, cx = W / 2, cy = H / 2, R = 128;
    const pts = nodes.map((n, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / nodes.length;
      return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), n };
    });
    return React.createElement(
      "svg",
      {
        viewBox: `0 0 ${W} ${H}`,
        width: "100%",
        role: "img",
        "aria-label": "Concept map: " + map.central,
        style: { maxWidth: 640, height: "auto" }
      },
      pts.map((p, i) => React.createElement("line", {
        key: "l" + i,
        x1: cx,
        y1: cy,
        x2: p.x,
        y2: p.y,
        stroke: "var(--line)",
        strokeWidth: 2
      })),
      React.createElement(
        "g",
        { key: "c" },
        React.createElement("circle", { cx, cy, r: 54, fill: "var(--accent)", opacity: 0.14 }),
        React.createElement("text", {
          x: cx,
          y: cy,
          textAnchor: "middle",
          dominantBaseline: "middle",
          style: { fontWeight: 800, fontSize: 13, fill: "var(--ink)" }
        }, wrapText(map.central))
      ),
      pts.map((p, i) => React.createElement(
        "g",
        { key: "n" + i },
        React.createElement("rect", {
          x: p.x - 70,
          y: p.y - 20,
          width: 140,
          height: 40,
          rx: 10,
          fill: "var(--surface)",
          stroke: "var(--line)"
        }),
        React.createElement("text", {
          x: p.x,
          y: p.y,
          textAnchor: "middle",
          dominantBaseline: "middle",
          style: { fontSize: 12, fontWeight: 700, fill: "var(--ink)" }
        }, p.n.label)
      ))
    );
  }
  function wrapText(s) {
    return String(s).length > 18 ? String(s).slice(0, 17) + "\u2026" : s;
  }
  function mdInline(s) {
    if (!s) return "";
    const escaped = String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
    return { __html: html };
  }
  function SmartNote({ note }) {
    const [phase, setPhase] = useState("read");
    const [qi, setQi] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const deckId = "sn-" + note.exam;
    function startQuiz() {
      window.LP_SRS.addCards(deckId, note.recall.map((r, i) => ({ id: note.id + "-" + i })));
      setPhase("quiz");
      setQi(0);
      setRevealed(false);
    }
    function grade(g) {
      window.LP_SRS.rate(deckId, note.id + "-" + qi, g);
      if (qi + 1 >= note.recall.length) setPhase("done");
      else {
        setQi(qi + 1);
        setRevealed(false);
      }
    }
    if (phase === "read") {
      return React.createElement(
        "div",
        { style: { padding: "24px 20px" } },
        React.createElement(
          "div",
          { className: "hero", style: { marginBottom: "24px", padding: "32px 24px" } },
          React.createElement(
            "div",
            { style: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" } },
            React.createElement("span", { className: "badge-pill", style: { background: "rgba(79, 70, 229, 0.1)", color: "var(--accent)" } }, "Smart Note"),
            React.createElement("span", { className: "badge-pill", style: { background: "rgba(79, 70, 229, 0.1)", color: "var(--accent)" } }, (note.estMinutes || 0) + " min")
          ),
          React.createElement("h1", { style: { fontSize: "28px", fontWeight: 800, margin: "16px 0 12px", lineHeight: "1.2" } }, note.title),
          React.createElement("p", { style: { fontSize: "16px", lineHeight: "1.6", color: "var(--ink-2)", margin: 0 } }, note.summary)
        ),
        React.createElement(
          "div",
          { className: "card", style: { marginBottom: "20px", padding: "20px" } },
          React.createElement("h2", { style: { fontSize: "16px", fontWeight: 700, margin: "0 0 16px", color: "var(--ink)" } }, "The big picture"),
          React.createElement(ConceptMap, { map: note.conceptMap })
        ),
        (note.chunks || []).map(
          (chunk, idx) => React.createElement(
            "div",
            { key: idx, className: "card", style: { marginBottom: "20px", padding: "20px" } },
            React.createElement("h2", { style: { fontSize: "18px", fontWeight: 700, margin: "0 0 12px", color: "var(--ink)" } }, chunk.heading),
            React.createElement("p", { style: { fontSize: "15px", lineHeight: "1.6", margin: "0 0 16px", color: "var(--ink-2)" }, dangerouslySetInnerHTML: mdInline(chunk.body) }),
            React.createElement(
              "div",
              { className: "callout tip", style: { background: "rgba(255, 193, 7, 0.08)", border: "1px solid rgba(255, 193, 7, 0.2)", borderRadius: "var(--r-lg)", padding: "14px", marginBottom: "12px" } },
              React.createElement(
                "p",
                { style: { margin: "0", fontSize: "15px", lineHeight: "1.5", color: "var(--ink)" } },
                React.createElement("strong", {}, "\u{1F4A1} Real example:"),
                " " + chunk.realExample
              )
            ),
            React.createElement(
              "div",
              { className: "callout", style: { background: "rgba(79, 70, 229, 0.06)", border: "1px solid rgba(79, 70, 229, 0.15)", borderRadius: "var(--r-lg)", padding: "14px" } },
              React.createElement(
                "p",
                { style: { margin: "0", fontSize: "15px", lineHeight: "1.5", color: "var(--ink)" } },
                React.createElement("strong", {}, "\u{1F9E0} Memory hook:"),
                " " + chunk.memoryHook
              )
            )
          )
        ),
        React.createElement("button", { className: "btn btn-primary", onClick: startQuiz, style: { width: "100%", marginTop: "24px", padding: "12px 18px", fontSize: "15px", fontWeight: 700 } }, "Test yourself \u2192")
      );
    }
    if (phase === "quiz") {
      const q = note.recall[qi];
      return React.createElement(
        "div",
        { style: { padding: "24px 20px" } },
        React.createElement(
          "div",
          { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "12px", borderBottom: "1px solid var(--line)" } },
          React.createElement("span", { style: { fontSize: "14px", fontWeight: 600, color: "var(--ink-3)" } }, "Question " + (qi + 1) + " of " + note.recall.length),
          React.createElement("button", { className: "btn-close", onClick: () => setPhase("read"), style: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--ink-3)" } }, "\u2715")
        ),
        React.createElement(
          "div",
          { className: "card", style: { padding: "24px", marginBottom: "20px" } },
          React.createElement("p", { style: { fontSize: "16px", lineHeight: "1.6", margin: "0", color: "var(--ink)" } }, q.q)
        ),
        !revealed && React.createElement("button", { className: "btn btn-primary", onClick: () => setRevealed(true), style: { width: "100%", padding: "12px 18px", fontSize: "15px", fontWeight: 700, marginBottom: "20px" } }, "Show answer"),
        revealed && React.createElement(
          React.Fragment,
          {},
          React.createElement(
            "div",
            { className: "card", style: { padding: "20px", marginBottom: "20px", background: "rgba(79, 70, 229, 0.04)" } },
            React.createElement("p", { style: { fontSize: "16px", lineHeight: "1.6", margin: "0", color: "var(--ink)", fontWeight: 500 } }, q.a)
          ),
          React.createElement(
            "div",
            { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" } },
            React.createElement("button", { className: "btn again", onClick: () => grade(0), style: { padding: "12px 14px", fontSize: "14px", fontWeight: 700, background: "rgba(184, 58, 46, 0.08)", color: "#b83a2e", border: "1px solid rgba(184, 58, 46, 0.2)", borderRadius: "var(--r-lg)", cursor: "pointer" } }, "Again"),
            React.createElement("button", { className: "btn hard", onClick: () => grade(1), style: { padding: "12px 14px", fontSize: "14px", fontWeight: 700, background: "rgba(181, 133, 44, 0.08)", color: "#b58528", border: "1px solid rgba(181, 133, 44, 0.2)", borderRadius: "var(--r-lg)", cursor: "pointer" } }, "Hard"),
            React.createElement("button", { className: "btn good", onClick: () => grade(2), style: { padding: "12px 14px", fontSize: "14px", fontWeight: 700, background: "rgba(79, 70, 229, 0.08)", color: "var(--accent)", border: "1px solid rgba(79, 70, 229, 0.2)", borderRadius: "var(--r-lg)", cursor: "pointer" } }, "Good"),
            React.createElement("button", { className: "btn easy", onClick: () => grade(3), style: { padding: "12px 14px", fontSize: "14px", fontWeight: 700, background: "rgba(47, 111, 78, 0.08)", color: "#2f6f4e", border: "1px solid rgba(47, 111, 78, 0.2)", borderRadius: "var(--r-lg)", cursor: "pointer" } }, "Easy")
          )
        )
      );
    }
    if (phase === "done") {
      return React.createElement(
        "div",
        { style: { padding: "24px 20px" } },
        React.createElement(
          "div",
          { className: "card", style: { padding: "32px 24px", textAlign: "center" } },
          React.createElement("div", { style: { fontSize: "40px", marginBottom: "16px" } }, "\u2705"),
          React.createElement("h2", { style: { fontSize: "18px", fontWeight: 700, margin: "0 0 12px", color: "var(--ink)" } }, "Great job!"),
          React.createElement("p", { style: { fontSize: "15px", lineHeight: "1.6", margin: "0 0 20px", color: "var(--ink-2)" } }, "These 5 questions are now scheduled for spaced review in your flashcards."),
          React.createElement("button", { className: "btn btn-primary", onClick: () => setPhase("read"), style: { padding: "12px 24px", fontSize: "15px", fontWeight: 700 } }, "Review from the top")
        )
      );
    }
  }
  window.LP_SmartNote = SmartNote;
})();
