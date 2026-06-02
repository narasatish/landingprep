/* global React, window */
"use strict";

// LandingPrep — Free Tools hub: score converter, eligibility checker,
// reading-speed test and listen-&-repeat (shadowing) trainer.
(function () {
  const { useState, useRef, useEffect } = React;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;

  // ── Concordance: CEFR ↔ IELTS ↔ TOEFL ↔ PTE ↔ CELPIP ↔ Duolingo ──────────
  const CEFR_ROWS = [
    { cefr: "C2", label: "Mastery",        ielts: "8.5–9.0", toefl: "114–120", pte: "85–90", celpip: "11–12", duolingo: "140–160" },
    { cefr: "C1", label: "Advanced",       ielts: "7.0–8.0", toefl: "95–113",  pte: "76–84", celpip: "9–10",  duolingo: "120–135" },
    { cefr: "B2", label: "Upper-Intermediate", ielts: "5.5–6.5", toefl: "72–94", pte: "59–75", celpip: "7–8", duolingo: "95–115" },
    { cefr: "B1", label: "Intermediate",   ielts: "4.0–5.0", toefl: "42–71",   pte: "43–58", celpip: "5–6",   duolingo: "60–90" },
    { cefr: "A2", label: "Elementary",     ielts: "3.0–3.5", toefl: "30–41",   pte: "30–42", celpip: "3–4",   duolingo: "35–55" },
  ];
  const CONVERT_EXAMS = [
    { id: "ielts", name: "IELTS", min: 1, max: 9, step: 0.5, lb: [["C2",8.5],["C1",7],["B2",5.5],["B1",4],["A2",0]] },
    { id: "toefl", name: "TOEFL iBT", min: 0, max: 120, step: 1, lb: [["C2",114],["C1",95],["B2",72],["B1",42],["A2",0]] },
    { id: "pte", name: "PTE Academic", min: 10, max: 90, step: 1, lb: [["C2",85],["C1",76],["B2",59],["B1",43],["A2",0]] },
    { id: "celpip", name: "CELPIP", min: 1, max: 12, step: 1, lb: [["C2",11],["C1",9],["B2",7],["B1",5],["A2",0]] },
    { id: "duolingo", name: "Duolingo", min: 10, max: 160, step: 5, lb: [["C2",140],["C1",120],["B2",95],["B1",60],["A2",0]] },
  ];
  function scoreToCEFR(exam, score) {
    const e = CONVERT_EXAMS.find(x => x.id === exam);
    if (!e || isNaN(score)) return null;
    for (const [cefr, lo] of e.lb) if (score >= lo) return cefr;
    return "A2";
  }

  // ── Eligibility minimums (typical; advisory) ─────────────────────────────
  const ELIG = {
    ielts:    { name: "IELTS", scale: "Band", countries: { Canada: 6.0, Australia: 6.0, UK: 5.5, USA: 6.5, "New Zealand": 6.5 } },
    toefl:    { name: "TOEFL iBT", scale: "pts", countries: { USA: 80, Canada: 86, Germany: 80, UK: 80 } },
    pte:      { name: "PTE Academic", scale: "pts", countries: { Australia: 50, Canada: 60, UK: 59, "New Zealand": 58 } },
    celpip:   { name: "CELPIP", scale: "Level", countries: { Canada: 7 } },
    duolingo: { name: "Duolingo", scale: "pts", countries: { USA: 105, Canada: 110, UK: 110 } },
  };

  // ── Reading passages (≈250 words each) ───────────────────────────────────
  const PASSAGES = [
    { title: "Urban Green Spaces", words: 252, text: "Cities around the world are rediscovering the value of green spaces. For much of the twentieth century, urban planners prioritised roads, factories and housing, treating parks as a pleasant but optional extra. That attitude has shifted dramatically. Researchers now understand that access to trees, grass and water has measurable effects on physical and mental health. People who live near parks report lower levels of stress, take more exercise, and recover from illness more quickly than those surrounded only by concrete. Green spaces also perform practical functions that are easy to overlook. Trees absorb rainfall and reduce the risk of flooding during heavy storms. Their leaves filter dust and pollutants from the air, while their shade lowers temperatures during increasingly frequent heatwaves. A single mature tree can cool the area around it as effectively as several air conditioners, but without consuming electricity or releasing additional heat. Wildlife benefits too, as parks and gardens provide corridors that allow birds, insects and small mammals to move safely through the built environment. Despite these advantages, green space is unevenly distributed. Wealthier neighbourhoods often enjoy generous parks and tree-lined streets, while poorer districts may have almost none. Closing this gap has become a priority for many city governments, which are now planting trees, converting derelict land into community gardens, and even installing gardens on rooftops. The challenge is considerable, because land in growing cities is expensive and competition for it is fierce. Yet the evidence is increasingly clear: investing in nature is not a luxury but a sensible strategy for healthier, more resilient cities." },
    { title: "The Science of Sleep", words: 246, text: "Sleep occupies roughly a third of human life, yet for centuries it was dismissed as a passive state in which little of importance happened. Modern research has overturned that view completely. Far from switching off, the brain is intensely active during sleep, carrying out tasks that are essential for memory, learning and health. During the deepest stages of sleep, the brain consolidates the day's experiences, transferring fragile new memories into more stable long-term storage. Skills that are practised before sleep are often performed better the following morning, as if the brain has continued rehearsing them overnight. Sleep also appears to clear away waste products that accumulate in brain tissue during waking hours, a kind of nightly cleaning that may help protect against disease. The consequences of insufficient sleep are serious and wide-ranging. People who regularly sleep too little show reduced concentration, weaker immune responses and a greater risk of heart disease, diabetes and depression. Reaction times slow, and the ability to regulate emotions declines, making conflicts and mistakes more likely. Despite this, sleep is frequently sacrificed in modern societies that prize productivity and offer endless distractions on glowing screens. Scientists recommend a consistent schedule, a cool and dark bedroom, and a deliberate wind-down period before bed. They warn that no amount of weekend recovery can fully repair the damage of chronic sleep loss. Understanding sleep, then, is not merely an academic exercise but a practical necessity for anyone who wishes to think clearly and live well." },
  ];

  // ── Shadowing sentences ──────────────────────────────────────────────────
  const SHADOW = [
    "The committee reached a unanimous decision after a lengthy discussion.",
    "Renewable energy is becoming increasingly affordable across the world.",
    "She articulated her argument with remarkable clarity and confidence.",
    "Understanding cultural differences is essential for effective communication.",
    "The proposal was rejected because it lacked sufficient supporting evidence.",
  ];

  function Tabs({ tab, setTab }) {
    const t = [["planner", "📅 Study Plan"], ["convert", "🔁 Score & Eligibility"], ["writing", "📊 Word & Readability"], ["reading", "⚡ Reading Speed"], ["shadow", "🎤 Listen & Repeat"]];
    return (
      <div className="tools-tabs">
        {t.map(([id, label]) => (
          <button key={id} className={"tools-tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
    );
  }

  // ── 1. Score Converter ───────────────────────────────────────────────────
  function Converter() {
    const [exam, setExam] = useState("ielts");
    const cfg = CONVERT_EXAMS.find(x => x.id === exam);
    const [score, setScore] = useState(7);
    const cefr = scoreToCEFR(exam, parseFloat(score));
    const row = CEFR_ROWS.find(r => r.cefr === cefr);
    return (
      <div className="tool-card">
        <h2>English Test Score Converter</h2>
        <p className="tool-sub">Convert between IELTS, TOEFL iBT, PTE Academic, CELPIP, Duolingo and CEFR. Based on published concordance ranges.</p>
        <div className="tool-row">
          <label>My test
            <select value={exam} onChange={e => { setExam(e.target.value); }}>
              {CONVERT_EXAMS.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
            </select>
          </label>
          <label>My score
            <input type="number" min={cfg.min} max={cfg.max} step={cfg.step} value={score}
              onChange={e => setScore(e.target.value)} />
          </label>
        </div>
        {row ? (
          <div className="convert-out">
            <div className="convert-cefr"><span className="cefr-badge">{row.cefr}</span> {row.label}</div>
            <div className="convert-grid">
              {[["IELTS", row.ielts], ["TOEFL iBT", row.toefl], ["PTE", row.pte], ["CELPIP", row.celpip], ["Duolingo", row.duolingo]].map(([k, v]) => (
                <div key={k} className="convert-cell"><span>{k}</span><strong>{v}</strong></div>
              ))}
            </div>
            <p className="tool-note">Equivalent ranges at the same CEFR level. Always confirm exact requirements with the test maker or your university.</p>
          </div>
        ) : <p className="tool-note">Enter a valid score to convert.</p>}
      </div>
    );
  }

  // ── 2. Eligibility checker ───────────────────────────────────────────────
  function Eligibility() {
    const [exam, setExam] = useState("ielts");
    const e = ELIG[exam];
    const countries = Object.keys(e.countries);
    const [country, setCountry] = useState(countries[0]);
    const [score, setScore] = useState("");
    const min = e.countries[country] != null ? e.countries[country] : (e.countries[countries[0]]);
    const realCountry = e.countries[country] != null ? country : countries[0];
    const s = parseFloat(score);
    const has = score !== "" && !isNaN(s);
    const ok = has && s >= e.countries[realCountry];
    return (
      <div className="tool-card">
        <h2>Study-Abroad Eligibility Checker</h2>
        <p className="tool-sub">See whether your score clears the typical minimum for your destination.</p>
        <div className="tool-row">
          <label>Test
            <select value={exam} onChange={ev => { const nx = ev.target.value; setExam(nx); setCountry(Object.keys(ELIG[nx].countries)[0]); }}>
              {Object.keys(ELIG).map(id => <option key={id} value={id}>{ELIG[id].name}</option>)}
            </select>
          </label>
          <label>Destination
            <select value={realCountry} onChange={ev => setCountry(ev.target.value)}>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>My score
            <input type="number" value={score} onChange={ev => setScore(ev.target.value)} placeholder={`${e.scale}`} />
          </label>
        </div>
        <div className={"elig-result " + (has ? (ok ? "good" : "warn") : "idle")}>
          {!has ? <span>Enter your score to check eligibility.</span>
            : ok ? <span>✅ Likely eligible — you meet the typical minimum for {realCountry} ({e.name} {e.countries[realCountry]}{e.scale === "pts" ? "" : ""}).</span>
                 : <span>⚠️ Below the typical minimum for {realCountry} ({e.name} {e.countries[realCountry]}). Keep practising — you're close!</span>}
        </div>
        <p className="tool-note">Guidance only. Minimums vary by university, course and visa stream — always verify with the official body.</p>
      </div>
    );
  }

  // ── 3. Reading speed test ────────────────────────────────────────────────
  function ReadingSpeed() {
    const [idx] = useState(() => Math.floor((Date.now() / 86400000)) % PASSAGES.length);
    const p = PASSAGES[idx];
    const [phase, setPhase] = useState("ready"); // ready | reading | done
    const startRef = useRef(0);
    const [wpm, setWpm] = useState(0);
    const start = () => { startRef.current = Date.now(); setPhase("reading"); };
    const finish = () => {
      const mins = (Date.now() - startRef.current) / 60000;
      setWpm(mins > 0 ? Math.round(p.words / mins) : 0);
      setPhase("done");
    };
    const verdict = (w) => w >= 250 ? ["Excellent", "good"] : w >= 180 ? ["Solid — exam-ready pace", "good"] : w >= 120 ? ["Average — push for 200+ wpm", "warn"] : ["Slow — practise daily reading", "warn"];
    const v = verdict(wpm);
    return (
      <div className="tool-card">
        <h2>Reading Speed Test</h2>
        <p className="tool-sub">Read the passage naturally, then stop the timer. IELTS, TOEFL and GRE reading reward 200+ words per minute with comprehension.</p>
        {phase === "ready" && (
          <div className="reading-cta">
            <p><strong>{p.title}</strong> · {p.words} words</p>
            <button className="tool-btn" onClick={start}>▶ Start reading</button>
          </div>
        )}
        {phase === "reading" && (
          <div>
            <p className="reading-text">{p.text}</p>
            <button className="tool-btn" onClick={finish}>⏹ I've finished — show my speed</button>
          </div>
        )}
        {phase === "done" && (
          <div className={"reading-result " + v[1]}>
            <div className="big-wpm">{wpm}<span> wpm</span></div>
            <div>{v[0]}</div>
            <button className="tool-btn ghost" onClick={() => setPhase("ready")}>Try again</button>
          </div>
        )}
      </div>
    );
  }

  // ── 4. Listen & Repeat (shadowing) ───────────────────────────────────────
  function Shadow() {
    const [i, setI] = useState(0);
    const sentence = SHADOW[i];
    const [heard, setHeard] = useState("");
    const [score, setScore] = useState(null);
    const [listening, setListening] = useState(false);
    const recRef = useRef(null);

    const speak = async () => {
      try {
        if (window.LP_TTS && window.LP_TTS.isEnabled && window.LP_TTS.isEnabled()) {
          await window.LP_TTS.speakOne(sentence, window.LP_TTS.voices.female1);
          return;
        }
      } catch (e) {}
      // Fallback to the browser's built-in speech synthesis
      try { const u = new SpeechSynthesisUtterance(sentence); window.speechSynthesis.speak(u); } catch (e) {}
    };
    const norm = (t) => (t || "").toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
    const grade = (said) => {
      const target = norm(sentence), got = new Set(norm(said));
      if (!target.length) return 0;
      const hit = target.filter(w => got.has(w)).length;
      return Math.round((hit / target.length) * 100);
    };
    const listen = () => {
      if (!SR) { setHeard("Speech recognition isn't supported in this browser. Try Chrome."); return; }
      const r = new SR(); recRef.current = r;
      r.lang = "en-US"; r.interimResults = false; r.maxAlternatives = 1;
      setHeard(""); setScore(null); setListening(true);
      r.onresult = (ev) => { const t = ev.results[0][0].transcript; setHeard(t); setScore(grade(t)); };
      r.onerror = () => setListening(false);
      r.onend = () => setListening(false);
      try { r.start(); } catch (e) { setListening(false); }
    };
    const next = () => { setI((i + 1) % SHADOW.length); setHeard(""); setScore(null); };
    return (
      <div className="tool-card">
        <h2>Listen &amp; Repeat (Shadowing)</h2>
        <p className="tool-sub">Hear a sentence, repeat it aloud, and get a pronunciation match score. Great for fluency and accent.</p>
        <div className="shadow-sentence">“{sentence}”</div>
        <div className="tool-row btns">
          <button className="tool-btn" onClick={speak}>🔊 Hear it</button>
          <button className="tool-btn" onClick={listen} disabled={listening}>{listening ? "🎤 Listening…" : "🎤 Repeat it"}</button>
          <button className="tool-btn ghost" onClick={next}>Next sentence →</button>
        </div>
        {heard && <div className="shadow-heard">You said: <em>{heard}</em></div>}
        {score != null && (
          <div className={"shadow-score " + (score >= 80 ? "good" : score >= 50 ? "warn" : "bad")}>
            Match: <strong>{score}%</strong> {score >= 80 ? "— excellent!" : score >= 50 ? "— close, try again" : "— listen again and repeat slowly"}
          </div>
        )}
        {!SR && <p className="tool-note">Tip: the microphone match works best in Google Chrome.</p>}
      </div>
    );
  }

  // ── 5. Word count & readability (for IELTS/TOEFL writing + speaking pace) ──
  function syllables(w) {
    w = w.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return w ? 1 : 0;
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
    const m = w.match(/[aeiouy]{1,2}/g);
    return m ? m.length : 1;
  }
  function WordCheck() {
    const [text, setText] = useState("");
    const words = (text.trim().match(/\b[\w'-]+\b/g) || []);
    const wc = words.length;
    const sentences = (text.match(/[.!?]+(?:\s|$)/g) || []).length || (text.trim() ? 1 : 0);
    const paras = text.trim() ? text.trim().split(/\n\s*\n/).filter(Boolean).length : 0;
    const chars = text.replace(/\s/g, "").length;
    const syl = words.reduce((a, w) => a + syllables(w), 0);
    const avgSentLen = sentences ? wc / sentences : 0;
    const flesch = wc ? Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * avgSentLen - 84.6 * (syl / wc)))) : 0;
    const grade = wc ? Math.max(1, Math.round(0.39 * avgSentLen + 11.8 * (syl / wc) - 15.59)) : 0;
    const readMin = (wc / 200), speakMin = (wc / 130);
    const fmt = (m) => m < 1 ? Math.round(m * 60) + "s" : Math.floor(m) + "m " + Math.round((m % 1) * 60) + "s";
    const longSent = (text.match(/[^.!?]+[.!?]+/g) || []).map((s) => ({ s: s.trim(), n: (s.trim().match(/\b[\w'-]+\b/g) || []).length })).filter((x) => x.n > 30).sort((a, b) => b.n - a.n).slice(0, 3);
    const ease = flesch >= 60 ? "easy to read" : flesch >= 40 ? "fairly hard (academic)" : "very hard / dense";
    return (
      <div>
        <div className="tool-card">
          <h3>📊 Word count &amp; readability</h3>
          <p className="tool-sub">Paste your essay or speaking script. Check word count against IELTS/TOEFL targets, reading/speaking time and readability — all in your browser, nothing stored.</p>
          <textarea className="bc-textarea" rows={10} placeholder="Paste your text here…" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        {wc > 0 && (
          <>
            <div className="wc-grid">
              <div className="wc-stat"><div className="wc-num">{wc}</div><div className="wc-lbl">words</div></div>
              <div className="wc-stat"><div className="wc-num">{sentences}</div><div className="wc-lbl">sentences</div></div>
              <div className="wc-stat"><div className="wc-num">{paras}</div><div className="wc-lbl">paragraphs</div></div>
              <div className="wc-stat"><div className="wc-num">{chars}</div><div className="wc-lbl">characters</div></div>
              <div className="wc-stat"><div className="wc-num">{Math.round(avgSentLen)}</div><div className="wc-lbl">avg words/sentence</div></div>
              <div className="wc-stat"><div className="wc-num">{fmt(speakMin)}</div><div className="wc-lbl">speaking time</div></div>
            </div>
            <div className="tool-card">
              <h4>Readability</h4>
              <p className="tool-sub" style={{ marginTop: 4 }}>Flesch reading ease <strong>{flesch}/100</strong> ({ease}) · approx. grade level <strong>{grade}</strong> · reading time {fmt(readMin)}.</p>
              <div className="wc-targets">
                <span className={"wc-pill " + (wc >= 250 ? "ok" : "")}>IELTS Task 2: 250+ {wc >= 250 ? "✓" : "(" + (250 - wc) + " more)"}</span>
                <span className={"wc-pill " + (wc >= 150 ? "ok" : "")}>IELTS Task 1: 150+ {wc >= 150 ? "✓" : "(" + (150 - wc) + " more)"}</span>
                <span className="wc-pill">TOEFL essay: 300+</span>
              </div>
              {longSent.length > 0 && (
                <div className="wc-warn"><strong>⚠️ Long sentences ({longSent.length}):</strong> over 30 words can hurt clarity. Consider splitting:<ul>{longSent.map((x, i) => <li key={i}>{x.n} words — “{x.s.slice(0, 80)}…”</li>)}</ul></div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  function Tools({ onNav, initialTab }) {
    // Exam-prep tools. College selection lives on its own #/colleges page.
    // Default to the Study Plan tab (also the #/planner back-compat target).
    const validTabs = ["planner", "convert", "writing", "reading", "shadow"];
    // Back-compat: the old "eligibility" tab is now merged into "convert".
    const startTab = initialTab === "eligibility" ? "convert" : initialTab;
    const [tab, setTab] = useState(validTabs.includes(startTab) ? startTab : "planner");
    useEffect(() => {
      if (!window.LP_SEO) return;
      window.LP_SEO.set({
        title: "Free Exam Tools — AI Study Planner, Score Converter, Eligibility | LandingPrep",
        description: "Free exam-prep tools: AI study planner, IELTS↔TOEFL↔PTE score converter, study-abroad eligibility checker, reading-speed test and listen-&-repeat pronunciation trainer. No signup.",
        keywords: "ielts study plan, ai study planner, ielts to toefl converter, pte to ielts, english score converter, study abroad eligibility, reading speed test, ielts band calculator"
      });
    }, []);
    return (
      <>
        <window.LP_TopBar current="tools" onNav={onNav} />
        <main className="tools-shell">
          <header className="tools-hero">
            <div className="home-hero-photo sa-hero-photo">
              <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1400&q=70"
                   alt="Laptop, notebook and coffee — planning exam prep" loading="lazy"
                   onError={(e) => { const p = e.target.closest(".home-hero-photo"); if (p) p.classList.add("no-photo"); }} />
              <div className="hhp-overlay" />
              <div className="ep-hero-cap">
                <h1>Free Exam Tools</h1>
                <p>Plan your prep, convert scores, check eligibility, time your reading and sharpen pronunciation — all free, in your browser.</p>
              </div>
            </div>
          </header>
          <Tabs tab={tab} setTab={setTab} />
          {tab === "planner" && (window.LP_StudyPlannerPanel
            ? <window.LP_StudyPlannerPanel onNav={onNav} />
            : <div className="tool-card"><p className="tool-sub">Study planner is loading…</p></div>)}
          {tab === "convert" && <><Converter /><Eligibility /></>}
          {tab === "writing" && <WordCheck />}
          {tab === "reading" && <ReadingSpeed />}
          {tab === "shadow" && <Shadow />}
          <div className="tools-foot">
            <a className="tool-btn ghost" onClick={() => onNav && onNav("colleges")}>🏛️ College predictor &amp; study-abroad tools →</a>
          </div>
        </main>
        <window.LP_Footer />
      </>
    );
  }

  window.LP_Tools = Tools;
})();
