/* global React, window */
"use strict";

// LandingPrep — SOP (Statement of Purpose) builder + checker/improver.
// Rendered as a tab inside the Tools hub. Uses the AI tutor backend when
// reachable; always works offline with a template + local analysis.
(function () {
  const { useState } = React;

  // Full-length sample winning SOPs (≈550–650 words each) — structure references.
  const SAMPLES = [
    { type: "MS Computer Science", text:
`The first time my fraud-detection model flagged a transaction the rule engine had missed, I realised that the future of security is probabilistic, not deterministic. During a summer internship at a fintech startup, I built a gradient-boosted classifier that reached 94% precision on live transaction data and cut manual review volume by a third. Watching analysts act on my model's outputs in real time taught me something no lecture had: well-engineered machine learning is not an academic exercise but infrastructure that protects real people. That conviction is why I am applying to the MS in Computer Science at Carnegie Mellon University.

My fascination with computing rests on four years of rigorous training. As a computer engineering undergraduate, I built strong foundations in data structures, operating systems and distributed computing, graduating in the top 5% of my class. Beyond coursework, I co-authored a paper on approximate graph-partitioning algorithms and presented it at a regional research symposium, where I learned to frame a messy real-world question as a tractable problem and to defend my assumptions under scrutiny. That experience turned me from a student who completes assignments into one who asks why a method works and where it breaks.

Three projects sharpened my focus. In the fraud-detection system, I learned to balance precision against the operational cost of false positives — a lesson in engineering for humans, not metrics. In an open-source contribution to a distributed key-value store, I debugged a race condition under concurrent writes and wrote the regression tests that caught it, my first taste of systems research. Finally, as a teaching assistant for algorithms, I mentored sixty students and found that explaining intuition clearly is its own form of mastery. Each project pushed me toward the same realisation: I want to build trustworthy, large-scale machine-learning systems, and I need deeper theoretical grounding to do it well.

Carnegie Mellon is the deliberate next step. Professor [Name]'s work on adversarial machine learning maps directly onto the questions that keep me up at night — how do we make models robust when the input distribution is actively hostile? Courses such as Machine Learning at Scale and Advanced Distributed Systems would let me close the gap between the models I can train and the systems that serve them reliably. CMU's culture of building, not just theorising — the practicum, the close faculty collaboration, the proximity to industry research labs — is exactly the environment in which I do my best work.

In the longer term, I intend to lead an applied-machine-learning team building real-time risk and security infrastructure, and eventually to return to research that makes such systems verifiable. In the near term, I want to publish at least one paper during my master's and contribute to an open-source ML-systems project that outlives my degree. I am ready for the intensity of graduate study at CMU, and confident that my blend of engineering rigour, research curiosity and production experience will let me contribute as much as I gain. I look forward to building, at Carnegie Mellon, the systems that make digital trust possible.` },
    { type: "MBA", text:
`Leading a four-person team to turn around a loss-making product line taught me that strategy is worthless without people who believe in it. When I inherited the account, it had missed targets for three consecutive quarters and morale was low. Rather than impose a plan, I spent two weeks listening — to the warehouse staff who knew where orders stalled, to the two analysts who had quietly built workarounds management never saw. We rebuilt the fulfilment process around their insights, cut delivery costs by 18%, and returned the line to profit within two quarters. I was promoted a year ahead of my cohort. More importantly, I learned that my ambition had outgrown my toolkit.

For three years as an operations analyst at a logistics firm, I have lived at the intersection of data and decisions. I automated a demand-forecasting workflow that reduced stockouts by 22%, negotiated with vendors across four countries, and presented quarterly results to a leadership team for whom I was often the youngest person in the room. Each success exposed a new limit: I could optimise a process but not yet structure a financing round; I could lead a small team but not yet design the incentives that align a 200-person organisation. The pattern was clear — I had reached the ceiling of what experience alone could teach me.

An MBA at NYU Stern is the deliberate next step, and I have chosen it specifically. Stern's experiential learning model — the Stern Consulting Corps, the leadership labs — would let me practise, not just study, the skills I lack. Professor [Name]'s course on scaling operations speaks directly to my goal, and the school's depth in fintech and supply-chain analytics matches the industry I know. Above all, New York places me at the centre of the logistics-technology ecosystem I intend to build my career in, surrounded by a network of operators who have already solved the problems ahead of me.

My short-term goal after graduation is to join a high-growth logistics-tech company as a senior operations or strategy leader, owning a P&L and a team. In the longer term — within a decade — I aim to become the Chief Operating Officer of a company that rebuilds physical supply chains around software, and eventually to mentor first-generation professionals the way I once needed mentoring. I know these goals are ambitious. I also know that the operators I admire all share two traits I have spent five years building: the discipline to master detail and the humility to lead through others. Stern is where I will turn that foundation into the judgement a COO needs. I am ready for the work, and eager to contribute my operating experience to every team I join on campus.` },
    { type: "MS Data Science", text:
`A dataset is a story waiting for someone patient enough to listen. I learned this while rebuilding my university's student-dropout prediction model. The existing system flagged students too late to help them; by reframing the problem around early-semester engagement signals — login frequency, assignment timing, library usage — I lifted recall from 61% to 88%. But the result I am proudest of is not the metric: it is that the academic-support team actually used the model, reaching at-risk students six weeks earlier than before. That project taught me that data science earns its value only when a model changes a decision.

My foundation is quantitative and deliberate. As a statistics undergraduate I trained in probability, linear models and experimental design, and I deepened that with three internships that each taught me a different lesson. At a healthcare analytics firm, I built survival models and learned how much careful data cleaning shapes a result. At an e-commerce company, I designed an A/B test framework and discovered the difference between correlation that sells dashboards and causation that survives scrutiny. At a civic-tech non-profit, I mapped public-transit gaps and saw how a single visualisation can move a budget meeting. Across all three, I kept gravitating to the same question: not "what will happen?" but "what should we do?"

Columbia's MS in Data Science is the rigour I need to answer that question well. Its causal-inference track addresses exactly the gap between prediction and decision that my internships exposed, and the industry capstone would let me ship work that matters before I graduate. I am drawn to Professor [Name]'s research on causal methods for policy evaluation, and to a curriculum that treats statistics, computation and ethics as one discipline rather than three. Columbia's position in New York — and its ties to public-policy and health institutions — places me where data and consequential decisions actually meet.

In the near term, I want to become a data scientist who works at the intersection of analytics and policy, building models that public institutions can trust and act on. In the longer term, I intend to lead a data team inside a government or civic organisation, and to advocate for the causal and ethical standards that keep such work honest. I have spent four years learning to listen to data; at Columbia I want to learn to make it speak to the people who decide. I am ready for that work and confident I can contribute to it.` },
    { type: "MS Mechanical / Robotics Engineering", text:
`Watching a 3D-printed prosthetic hand close around a cup for the first time — a hand my team designed for under fifty dollars — convinced me that engineering is empathy made tangible. We built it for a community workshop that could not afford commercial prosthetics, iterating through seven failed grip mechanisms before one held. The user's first independent sip was worth every late night. That moment defined the engineer I want to become: one who builds assistive technology that reaches the people who need it most, not only those who can pay for it. It is why I am applying to the MS in Robotics at the Technical University of Munich.

My preparation has been both rigorous and hands-on. As a mechanical engineering undergraduate, I built a strong base in dynamics, control systems and manufacturing, and I sought out every chance to apply it. I competed twice in a national robotics championship, leading the mechanical design of an autonomous rover that placed third nationally; I learned more from the year we failed than the year we podiumed. During an internship at an electric-vehicle manufacturer, I redesigned a battery enclosure that cut weight by 12% while meeting crash-safety standards, my first experience of engineering under real constraints of cost, regulation and time. Each project pulled me further toward the same field: robotics that interacts physically and safely with human bodies.

TU Munich is the ideal place to pursue this. Its robotics specialisation — particularly the work on actuation, control and human-robot interaction — directly serves my interest in assistive devices, and its proximity to Europe's densest cluster of engineering industry means my research need never stay theoretical. I am especially drawn to Professor [Name]'s laboratory on rehabilitation robotics, where the questions I care about — how do we make a device intuitive, affordable and safe enough for daily home use? — are exactly the questions being asked. TUM's emphasis on building real systems, not only publishing about them, matches how I learn best.

In the longer term, I intend to lead research-driven product design in medical and assistive robotics, and to keep cost and accessibility at the centre of every design decision rather than treating them as afterthoughts. In the near term, I want to contribute to a funded rehabilitation-robotics project during my master's and prototype an open-source assistive device that others can build and improve. I am ready for the demands of graduate research at TUM, and I am confident that my mix of mechanical rigour, competition-tested teamwork and a clear human purpose will let me contribute meaningfully. I want to spend my career making capable hands affordable — and TU Munich is where I will learn to do it at scale.` },
    { type: "MSc Finance (UK)", text:
`The trading simulation I built in my final year started as a class project and ended as the reason I want to study finance seriously. I coded a mean-reversion strategy, back-tested it on a decade of equity data, and watched it survive 2020's volatility only because I had modelled transaction costs honestly. That gap between a clean theoretical return and a real one — slippage, liquidity, behaviour — is exactly what I want the MSc Finance at the London School of Economics to help me close.

My foundation is quantitative. As an economics undergraduate I trained in econometrics, stochastic processes and corporate finance, and ranked in the top of my cohort. Two internships sharpened the theory into practice: at a brokerage I built dashboards that the equity-research desk used daily, and at a fintech startup I helped model credit risk for a small-business lending product, learning how a single assumption can move a portfolio's expected loss. Each role taught me that finance is applied judgement under uncertainty, not memorised formulas.

The MSc Finance at LSE is the deliberate next step. Its rigorous treatment of asset pricing and financial econometrics matches the questions I keep returning to, and Professor [Name]'s work on market microstructure speaks directly to my trading-cost obsession. London itself — Europe's financial centre, minutes from the institutions I want to work in — means my learning need never stay academic. The one-year structure lets me convert a strong foundation into specialist depth quickly.

In the near term I want to join a quantitative or risk team at an asset manager or investment bank in London, applying disciplined, data-driven methods to real portfolios. In the longer term I aim to lead a research-driven investment function and, eventually, to mentor analysts from non-traditional backgrounds the way I was once mentored. I am ready for the intensity of LSE, and confident my blend of quantitative rigour and hands-on modelling will let me contribute as much as I gain.` },
    { type: "MS Business Analytics (Canada)", text:
`When my retail internship's "best-selling" product turned out to be the least profitable once I modelled returns and shipping, I learned that data without context misleads. I rebuilt the company's product-ranking around contribution margin, and the merchandising team changed what they promoted the next quarter. That experience — turning a messy dataset into a decision a business actually acted on — is why I am applying to the MS in Business Analytics at the University of Toronto's Rotman School.

My preparation blends quantitative and business training. As a commerce graduate with a statistics minor, I built strength in regression, optimisation and SQL, and I sought analytics roles every summer. At a logistics firm I forecast demand and cut stockouts by 22%; at a bank I built a churn model that the retention team used to prioritise outreach. Across both, I learned to translate between two languages — the technical one of models and the practical one of managers — which I believe is the real job of an analyst.

Rotman's MS in Business Analytics is the rigour I need to do that at scale. Its emphasis on management consulting projects with real companies, its strength in machine learning for business, and Toronto's position as a North-American tech and finance hub make it the ideal environment. I am drawn to the practicum model, where I would solve a live problem for an industry partner before I graduate, and to faculty whose research bridges analytics and strategy.

Canada also fits my longer-term plan: I want to build my career in a market with strong analytics demand and a clear path from study to skilled work to permanent residence. In the near term I aim to join a data-driven consulting or product-analytics team; in the longer term, to lead an analytics function that keeps decisions honest and evidence-based. I am ready for the demands of Rotman and excited to contribute my mix of business sense and technical skill.` },
    { type: "MPH / Public Health (Australia)", text:
`During a rural health camp in my final undergraduate year, I watched preventable conditions go undiagnosed simply because data never reached the people who could act on it. I built a small register that tracked follow-ups, and the return rate for treatment doubled. That was the moment public health stopped being a subject and became my purpose — and it is why I am applying to the Master of Public Health at the University of Melbourne.

My background is clinical and analytical. As a graduate in life sciences with coursework in epidemiology and biostatistics, I learned to read studies critically and design simple data collection. Volunteering with a community health NGO, I coordinated screening drives and, more importantly, learned why programs fail — not from bad medicine but from poor logistics, weak data and ignored local context. An internship analysing immunisation coverage taught me how to turn surveillance data into recommendations a health officer can use.

Melbourne's MPH is the deliberate next step. Its strengths in epidemiology and global health, and its focus on real-world program evaluation, match exactly the gap I want to fill between evidence and action. I am drawn to Professor [Name]'s work on health systems in low-resource settings, and to a curriculum that treats biostatistics, policy and ethics as one discipline. Australia's strong public-health institutions and its pathways for skilled graduates also fit my plan to build experience before returning to strengthen health systems at home.

In the near term I want to work as an epidemiologist or program evaluator with a health department or NGO, designing interventions that are measured, not just launched. In the longer term I aim to lead public-health programs that close the gap between data and the communities that need it most. I am ready for the rigour of Melbourne's MPH and confident that my field experience and analytical training will let me contribute meaningfully.` },
    { type: "MS Data Engineering (Netherlands)", text:
`The recommendation pipeline I helped build at my internship worked beautifully in testing and fell over in production — not because the model was wrong, but because the data infrastructure couldn't serve it reliably at scale. Fixing that taught me that the unglamorous layer — pipelines, storage, streaming — is what makes machine learning actually useful. That realisation is why I am applying to the MS in Data Science & Technology at TU Delft.

My foundation is in computing. As a computer science undergraduate I built strong fundamentals in algorithms, databases and distributed systems, and I gravitated to the systems side of every project. I contributed to an open-source streaming-data tool, where I learned to reason about throughput and fault tolerance, and during an internship I rebuilt a batch pipeline into a streaming one that cut data latency from hours to minutes. Each experience pulled me toward the same goal: building robust, scalable data infrastructure.

TU Delft is the ideal place to pursue this. Its strength in large-scale data systems and its close ties to Europe's deep-tech industry mean my work would stay grounded in real engineering problems. I am drawn to the research on distributed data management and to a programme that values building real systems, not only publishing about them. The Netherlands' 2,100+ English-taught programmes, its orientation-year visa and its thriving tech sector also make it a place where I can study and then build a career.

In the near term I want to work as a data or platform engineer, building the infrastructure that lets data teams move fast and safely. In the longer term I aim to lead a data-platform team and contribute to the open-source tools that the field relies on. I am ready for the rigour of TU Delft and confident that my systems mindset and hands-on engineering experience will let me contribute from day one.` },
    { type: "MSc Computer Science (Ireland)", text:
`My first paid project was a scheduling tool for a local clinic that kept double-booking patients. The fix was technically simple; the hard part was understanding the messy human workflow it had to fit. Shipping something people used every day — and watching it quietly remove a daily frustration — is why I chose software, and why I am applying to the MSc in Computer Science at Trinity College Dublin.

My foundation is solid and practical. As a computer science undergraduate I built strong fundamentals in data structures, databases and software engineering, and I learned most from building: a published Android app, a contribution to an open-source library, and an internship where I shipped features used by thousands of users. That internship taught me how real engineering teams work — code review, testing, and the discipline of writing software others can maintain.

Trinity's MSc is the deliberate next step. Its specialisations in software engineering and intelligent systems match where I want to deepen, and Dublin — the European headquarters of Google, Microsoft, Meta and a dense startup scene — means my learning stays connected to industry. I am drawn to faculty research that bridges software systems and applied machine learning, and to Ireland's two-year post-study stay-back, which lets me turn my degree into real experience.

In the near term I want to join a strong engineering team building products at scale, ideally in the Dublin tech ecosystem. In the longer term I aim to grow into a technical lead and, eventually, mentor new engineers the way I was helped early on. I am ready for the rigour of Trinity College Dublin and confident that my mix of fundamentals and shipping experience will let me contribute as much as I learn.` },
  ];
  const CLICHES = [
    "since childhood", "from a young age", "from a very young age", "ever since i can remember",
    "i have always been passionate", "i have always been fascinated", "burning desire", "burning passion",
    "in today's competitive world", "in today's world", "backbone of", "play a pivotal role",
    "since my childhood", "i was born to", "dream since childhood", "deeply passionate",
  ];

  function localAnalysis(text) {
    const t = (text || "").trim();
    const words = t ? t.split(/\s+/).filter(Boolean).length : 0;
    const lower = t.toLowerCase();
    const foundCliches = CLICHES.filter(c => lower.includes(c));
    const checks = [
      { ok: words >= 500 && words <= 900, label: `Length ${words} words (aim 500–800)` },
      { ok: /\bwhy\b|because|drawn to|chose|specific/i.test(t) && /(university|program|department|faculty|professor|course)/i.test(t), label: "Explains why this program/university" },
      { ok: /(career|goal|aspire|aim to|plan to|future|long-term|after graduat)/i.test(t), label: "States clear career goals" },
      { ok: /\d/.test(t), label: "Includes specific, quantified achievements" },
      { ok: foundCliches.length === 0, label: foundCliches.length ? `Avoid clichés: "${foundCliches.slice(0, 3).join('", "')}"` : "No common clichés detected" },
    ];
    const score = Math.round((checks.filter(c => c.ok).length / checks.length) * 10);
    return { words, checks, foundCliches, score };
  }

  function Builder({ }) {
    const [f, setF] = useState({ program: "", university: "", background: "", achievements: "", whyCourse: "", career: "" });
    const [out, setOut] = useState("");
    const [busy, setBusy] = useState(false);
    const [src, setSrc] = useState("");
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    const template = () => {
      const prog = f.program || "this program";
      const uni = f.university || "your university";
      const bg = f.background || "my undergraduate degree";
      const ach = f.achievements || "my academic projects, internships and coursework";
      const why = f.whyCourse || "its rigorous curriculum, distinguished faculty and strong research culture";
      const career = f.career || "to solve meaningful, real-world problems and grow into a leader in my field";
      const achFirst = ach.split(/[;.,]/)[0].trim() || ach;
      return (
`There is a moment in every meaningful project when an abstract idea becomes something real. For me, that moment came through ${achFirst} — the point at which I stopped completing assignments and started asking why a method works and where it breaks. That shift is what drives my application to the ${prog} at ${uni}.\n\n` +
`My preparation rests on a solid academic foundation. Through ${bg}, I built the core knowledge and analytical discipline that graduate study demands, and I consistently sought out work beyond the syllabus. Coursework gave me the theory; applying it under real constraints taught me judgement — how to scope a problem, defend my assumptions, and turn an idea into a result others can use.\n\n` +
`Experience sharpened that foundation into a clear direction. ${ach.charAt(0).toUpperCase() + ach.slice(1)} did more than build my résumé — each taught me a distinct lesson about working at the intersection of theory and practice, and each pulled me toward the questions I now want to pursue in depth. These experiences are why I am no longer satisfied to apply existing tools; I want to understand them deeply enough to extend them.\n\n` +
`The ${prog} at ${uni} is the deliberate next step. I am drawn to ${why}, which maps directly onto the direction my work has taken. The chance to learn from faculty whose research aligns with my interests, in an environment that values building as much as theorising, is exactly the rigour I am seeking. I have chosen this program not for its name but for the specific fit between what it offers and what I intend to do.\n\n` +
`In the longer term, my goal is ${career}. In the near term, I want to contribute to research and projects during my studies that outlast my degree, and to learn from peers as ambitious as the program attracts. I am ready for the intensity of graduate study at ${uni}, and confident that my mix of academic rigour, hands-on experience and clear purpose will let me contribute as much as I gain. I look forward to taking this next step at ${uni}.`
      );
    };
    const generate = async () => {
      setBusy(true); setSrc("");
      const prompt =
`You are an expert graduate-admissions consultant. Write a compelling, authentic ~450-word Statement of Purpose with this structure: a specific hook, academic background, relevant experience/projects, why this exact program, why this university, and clear career goals. Avoid all clichés (no "since childhood", no "passion"). Be concrete and specific. Write ONLY the SOP text.
Target program: ${f.program || "(unspecified)"}
Target university: ${f.university || "(unspecified)"}
Background/degree: ${f.background || "(unspecified)"}
Key achievements/projects: ${f.achievements || "(unspecified)"}
Why this course: ${f.whyCourse || "(unspecified)"}
Career goal: ${f.career || "(unspecified)"}`;
      try {
        if (window.LP_AI_TUTOR && window.LP_AI_TUTOR.generate) {
          const r = (await window.LP_AI_TUTOR.generate(prompt) || "").trim();
          if (r && !/(?:AI|Smart) Tutor is offline/i.test(r)) { setOut(r); setSrc("ai"); setBusy(false); return; }
        }
      } catch (e) {}
      setOut(template()); setSrc("template"); setBusy(false);
    };
    const copy = () => { try { navigator.clipboard.writeText(out); } catch (e) {} };
    return (
      <div className="tool-card">
        <h2>📝 SOP Builder</h2>
        <p className="tool-sub">Answer a few prompts and generate a structured first draft. Edit it freely — then run it through the Checker tab.</p>
        <div className="sop-grid">
          <label>Target program<input value={f.program} onChange={set("program")} placeholder="MS Computer Science" /></label>
          <label>Target university<input value={f.university} onChange={set("university")} placeholder="Carnegie Mellon" /></label>
          <label>Your background<input value={f.background} onChange={set("background")} placeholder="B.Tech in IT, 8.4 CGPA" /></label>
          <label>Career goal<input value={f.career} onChange={set("career")} placeholder="ML engineer building healthcare AI" /></label>
        </div>
        <label className="sop-full">Key achievements / projects<textarea value={f.achievements} onChange={set("achievements")} rows={2} placeholder="Built a fraud-detection model (94% accuracy); published a paper; led a 4-person team…" /></label>
        <label className="sop-full">Why this course / university<textarea value={f.whyCourse} onChange={set("whyCourse")} rows={2} placeholder="Prof. X's NLP lab; the analytics specialisation; industry capstone…" /></label>
        <button className="tool-btn" onClick={generate} disabled={busy}>{busy ? "✨ Writing…" : "✨ Generate SOP draft"}</button>
        {out && (
          <div className="sop-output">
            {src === "template" && <p className="tool-note">Offline — generated a full structured draft from your inputs. Add specific details (names, numbers, a real hook) before submitting.</p>}
            <textarea className="sop-result" rows={14} value={out} onChange={e => setOut(e.target.value)} />
            <div className="tool-row btns">
              <span className="sop-count">{out.trim().split(/\s+/).filter(Boolean).length} words</span>
              <button className="tool-btn ghost" onClick={copy}>📋 Copy</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function Checker() {
    const [text, setText] = useState("");
    const [fb, setFb] = useState(null);
    const [busy, setBusy] = useState(false);
    const a = localAnalysis(text);
    const review = async () => {
      setBusy(true); setFb(null);
      const prompt =
`You are an expert SOP reviewer for graduate admissions. Review the Statement of Purpose below. Respond in this exact format:
SCORE: x/10
STRENGTHS: (3 bullet points)
IMPROVE: (3-5 specific, actionable bullet points — structure, specificity, clichés, grammar, flow)
REWRITE: (an improved ~450-word version)
SOP:
"""${text.slice(0, 6000)}"""`;
      try {
        if (window.LP_AI_TUTOR && window.LP_AI_TUTOR.generate) {
          const r = (await window.LP_AI_TUTOR.generate(prompt) || "").trim();
          if (r && !/(?:AI|Smart) Tutor is offline/i.test(r)) { setFb({ ai: r }); setBusy(false); return; }
        }
      } catch (e) {}
      setFb({ offline: true }); setBusy(false);
    };
    return (
      <div className="tool-card">
        <h2>🔍 SOP Checker &amp; Improver</h2>
        <p className="tool-sub">Paste your SOP for an instant structure check, cliché scan and AI rewrite.</p>
        <textarea className="sop-result" rows={10} value={text} onChange={e => setText(e.target.value)} placeholder="Paste your Statement of Purpose here…" />
        {text.trim() && (
          <div className="sop-checklist">
            <div className="sop-score-badge">Quick score <strong>{a.score}/10</strong></div>
            {a.checks.map((c, i) => <div key={i} className={"sop-check " + (c.ok ? "ok" : "no")}>{c.ok ? "✓" : "✗"} {c.label}</div>)}
          </div>
        )}
        <button className="tool-btn" onClick={review} disabled={busy || !text.trim()}>{busy ? "✨ Reviewing…" : "✨ Get instant feedback & rewrite"}</button>
        {fb && fb.offline && <p className="tool-note">The tutor is offline. The structure check and cliché scan above still work — fix those points, then re-run when the backend is reachable for a full rewrite.</p>}
        {fb && fb.ai && <div className="sop-ai-feedback md-body">{window.LP_MD ? window.LP_MD(fb.ai) : fb.ai.split("\n").map((ln, i) => <p key={i}>{ln}</p>)}</div>}
      </div>
    );
  }

  function Samples() {
    const [i, setI] = useState(0);
    return (
      <div className="tool-card">
        <h2>📚 Sample winning SOPs</h2>
        <p className="tool-sub">Study how strong SOPs open — a specific hook, evidence, a clear "why this program", and a goal. Use them as structure references, never copy them.</p>
        <div className="sop-sample-tabs">
          {SAMPLES.map((s, idx) => <button key={idx} className={"sop-sample-tab" + (idx === i ? " active" : "")} onClick={() => setI(idx)}>{s.type}</button>)}
        </div>
        <div className="sop-sample-meta">{SAMPLES[i].text.trim().split(/\s+/).filter(Boolean).length} words · full-length example</div>
        <div className="sop-sample-text">
          {SAMPLES[i].text.split(/\n\n+/).map((p, k) => <p key={k}>{p}</p>)}
        </div>
        <p className="tool-note">Plagiarism is detected by admissions committees and our SOP Checker. Write your own — these only show the shape and depth of a compelling statement.</p>
      </div>
    );
  }

  // ── Letter of Recommendation builder ───────────────────────────────────────
  function LORBuilder() {
    const [f, setF] = useState({ student: "", recommender: "", role: "", program: "", relationship: "", strengths: "", anecdote: "" });
    const [out, setOut] = useState(""); const [busy, setBusy] = useState(false); const [src, setSrc] = useState("");
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    const template = () => {
      const s = f.student || "the applicant", r = f.recommender || "[Recommender name]", role = f.role || "[Title, Institution]";
      const prog = f.program || "the program", rel = f.relationship || "as their professor", str = f.strengths || "strong analytical ability, diligence and intellectual curiosity";
      return (
`To the Admissions Committee,\n\n` +
`It is my pleasure to recommend ${s} for admission to ${prog}. I have known ${s} ${rel}, and in that time they have consistently stood out among their peers.\n\n` +
`${s} demonstrates ${str}. ${f.anecdote ? f.anecdote.charAt(0).toUpperCase() + f.anecdote.slice(1) : "In my course, they tackled a demanding project with independence and rigour, producing work well beyond what was expected."} What impressed me most was not only the quality of their work but the maturity and initiative behind it.\n\n` +
`Beyond their technical strengths, ${s} is collaborative, reliable and genuinely motivated. They ask thoughtful questions, accept feedback gracefully, and lift the standard of those around them. I am confident they will thrive in the rigorous, independent environment of graduate study.\n\n` +
`I recommend ${s} without reservation and am happy to provide further detail if helpful.\n\n` +
`Sincerely,\n${r}\n${role}`
      );
    };
    const generate = async () => {
      setBusy(true); setSrc("");
      const prompt = `Write a formal ~350-word Letter of Recommendation for a graduate-school applicant. Recommender: ${f.recommender || "(unspecified)"} (${f.role || "professor"}). Student: ${f.student || "(unspecified)"}. Program: ${f.program || "(unspecified)"}. Relationship: ${f.relationship || "(unspecified)"}. Key strengths: ${f.strengths || "(unspecified)"}. Specific example: ${f.anecdote || "(unspecified)"}. Be specific, credible and warm; avoid clichés. Write ONLY the letter.`;
      try { if (window.LP_AI_TUTOR && window.LP_AI_TUTOR.generate) { const r = (await window.LP_AI_TUTOR.generate(prompt) || "").trim(); if (r && !/(?:AI|Smart) Tutor is offline/i.test(r)) { setOut(r); setSrc("ai"); setBusy(false); return; } } } catch (e) {}
      setOut(template()); setSrc("template"); setBusy(false);
    };
    const copy = () => { try { navigator.clipboard.writeText(out); } catch (e) {} };
    return (
      <div className="tool-card">
        <h2>🤝 LOR Builder</h2>
        <p className="tool-sub">Generate a strong, specific Letter of Recommendation draft — then your recommender personalises it.</p>
        <div className="sop-grid">
          <label>Student name<input value={f.student} onChange={set("student")} placeholder="Priya Sharma" /></label>
          <label>Recommender name<input value={f.recommender} onChange={set("recommender")} placeholder="Dr. A. Rao" /></label>
          <label>Recommender title<input value={f.role} onChange={set("role")} placeholder="Professor, Dept. of CS, XYZ University" /></label>
          <label>Target program<input value={f.program} onChange={set("program")} placeholder="MS Computer Science" /></label>
        </div>
        <label className="sop-full">Relationship to student<input value={f.relationship} onChange={set("relationship")} placeholder="as their professor for 2 years and project guide" /></label>
        <label className="sop-full">Key strengths<textarea value={f.strengths} onChange={set("strengths")} rows={2} placeholder="exceptional problem-solving, leadership of a 4-person team, top 5% of the class" /></label>
        <label className="sop-full">A specific example / anecdote<textarea value={f.anecdote} onChange={set("anecdote")} rows={2} placeholder="led a research project that was published; debugged a system others had given up on" /></label>
        <button className="tool-btn" onClick={generate} disabled={busy}>{busy ? "✨ Writing…" : "✨ Generate LOR draft"}</button>
        {out && (
          <div className="sop-output">
            {src === "template" && <p className="tool-note">Offline — generated a structured letter from your inputs. Personalise specifics before sending.</p>}
            <textarea className="sop-result" rows={14} value={out} onChange={(e) => setOut(e.target.value)} />
            <div className="tool-row btns"><span className="sop-count">{out.trim().split(/\s+/).filter(Boolean).length} words</span><button className="tool-btn ghost" onClick={copy}>📋 Copy</button></div>
          </div>
        )}
      </div>
    );
  }

  // ── Academic Resume / CV builder ───────────────────────────────────────────
  function ResumeBuilder() {
    const [f, setF] = useState({ name: "", contact: "", degree: "", university: "", gpa: "", skills: "", experience: "", projects: "", achievements: "" });
    const [out, setOut] = useState(""); const [busy, setBusy] = useState(false); const [src, setSrc] = useState("");
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    const bullets = (s) => (s || "").split(/\n|;/).map((x) => x.trim()).filter(Boolean).map((x) => "• " + x).join("\n");
    const template = () =>
`${(f.name || "YOUR NAME").toUpperCase()}\n${f.contact || "email · phone · LinkedIn · city"}\n\n` +
`EDUCATION\n${f.degree || "Degree"}, ${f.university || "University"}${f.gpa ? " — GPA " + f.gpa : ""}\n\n` +
`TECHNICAL SKILLS\n${f.skills || "List your skills, tools and languages"}\n\n` +
`EXPERIENCE\n${bullets(f.experience) || "• Role, Organisation (dates) — achievement with a quantified result"}\n\n` +
`PROJECTS\n${bullets(f.projects) || "• Project — what you built, the tech, and the outcome/metric"}\n\n` +
`ACHIEVEMENTS & LEADERSHIP\n${bullets(f.achievements) || "• Award, publication, scholarship or leadership role"}`;
    const generate = async () => {
      setBusy(true); setSrc("");
      const prompt = `Format a clean, one-page academic CV/resume for a graduate-school applicant from these details. Use clear section headers (Education, Technical Skills, Experience, Projects, Achievements) and concise, quantified bullet points starting with strong action verbs. Name: ${f.name}. Contact: ${f.contact}. Degree: ${f.degree}, ${f.university}, GPA ${f.gpa}. Skills: ${f.skills}. Experience: ${f.experience}. Projects: ${f.projects}. Achievements: ${f.achievements}. Output ONLY the resume text.`;
      try { if (window.LP_AI_TUTOR && window.LP_AI_TUTOR.generate) { const r = (await window.LP_AI_TUTOR.generate(prompt) || "").trim(); if (r && !/(?:AI|Smart) Tutor is offline/i.test(r)) { setOut(r); setSrc("ai"); setBusy(false); return; } } } catch (e) {}
      setOut(template()); setSrc("template"); setBusy(false);
    };
    const copy = () => { try { navigator.clipboard.writeText(out); } catch (e) {} };
    return (
      <div className="tool-card">
        <h2>📄 Resume / CV Builder</h2>
        <p className="tool-sub">Build a clean, quantified academic CV for your applications. One project or role per line.</p>
        <div className="sop-grid">
          <label>Full name<input value={f.name} onChange={set("name")} placeholder="Priya Sharma" /></label>
          <label>Contact line<input value={f.contact} onChange={set("contact")} placeholder="email · phone · LinkedIn · city" /></label>
          <label>Degree<input value={f.degree} onChange={set("degree")} placeholder="B.Tech Computer Science" /></label>
          <label>University<input value={f.university} onChange={set("university")} placeholder="XYZ University" /></label>
          <label>GPA / %<input value={f.gpa} onChange={set("gpa")} placeholder="8.4/10 or 3.6/4" /></label>
          <label>Skills<input value={f.skills} onChange={set("skills")} placeholder="Python, ML, SQL, React" /></label>
        </div>
        <label className="sop-full">Experience (one per line)<textarea value={f.experience} onChange={set("experience")} rows={2} placeholder={"Data Intern, Acme (2024) — cut report time 40%\nTeaching Assistant, XYZ (2023)"} /></label>
        <label className="sop-full">Projects (one per line)<textarea value={f.projects} onChange={set("projects")} rows={2} placeholder={"Fraud detector — 94% precision, deployed at a fintech\nDropout model — recall 61%→88%"} /></label>
        <label className="sop-full">Achievements (one per line)<textarea value={f.achievements} onChange={set("achievements")} rows={2} placeholder={"Published a paper at XYZ symposium\nMerit scholarship, top 5% of class"} /></label>
        <button className="tool-btn" onClick={generate} disabled={busy}>{busy ? "✨ Building…" : "✨ Generate resume"}</button>
        {out && (
          <div className="sop-output">
            {src === "template" && <p className="tool-note">Offline — formatted a clean CV from your inputs. Refine bullets and quantify results before submitting.</p>}
            <textarea className="sop-result" rows={16} value={out} onChange={(e) => setOut(e.target.value)} />
            <div className="tool-row btns"><span className="sop-count">{out.trim().split(/\s+/).filter(Boolean).length} words</span><button className="tool-btn ghost" onClick={copy}>📋 Copy</button></div>
          </div>
        )}
      </div>
    );
  }

  function SOPPanel() {
    const [mode, setMode] = useState("build");
    return (
      <div className="sop-panel">
        <div className="sop-modes">
          <button className={"sop-mode" + (mode === "build" ? " active" : "")} onClick={() => setMode("build")}>📝 SOP</button>
          <button className={"sop-mode" + (mode === "check" ? " active" : "")} onClick={() => setMode("check")}>🔍 Check &amp; improve</button>
          <button className={"sop-mode" + (mode === "lor" ? " active" : "")} onClick={() => setMode("lor")}>🤝 LOR</button>
          <button className={"sop-mode" + (mode === "resume" ? " active" : "")} onClick={() => setMode("resume")}>📄 Resume</button>
          <button className={"sop-mode" + (mode === "samples" ? " active" : "")} onClick={() => setMode("samples")}>📚 Samples</button>
        </div>
        {mode === "build" ? <Builder /> : mode === "check" ? <Checker /> : mode === "lor" ? <LORBuilder /> : mode === "resume" ? <ResumeBuilder /> : <Samples />}
      </div>
    );
  }

  window.LP_SOPPanel = SOPPanel;
})();
