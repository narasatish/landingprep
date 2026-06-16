// SEO landing pages — study tips, exam comparisons, score targets, etc.
// Each is a separate routable page to expand the site's SEO footprint.
(function () {
  const { useState } = React;

  // Topic-relevance "Keep reading": rank other posts by shared significant terms
  // (countries, exams, themes) in title/keywords/tag — not just identical tag.
  // So a "Germany visa" post recommends other Germany/Europe posts, a country-news
  // post recommends related country guides, etc. Falls back to same-tag then recent.
  const LP_STOP = new Set(("the a an and or for to of in on at is are be your you our we 2025 2026 with how what which best top free guide vs your study abroad after international students").split(" "));
  function LP_terms(a) {
    const raw = ((a.title || "") + " " + (a.kw || "") + " " + (a.tag || "")).toLowerCase();
    const set = new Set();
    (raw.match(/[a-z]{3,}/g) || []).forEach((w) => { if (!LP_STOP.has(w)) set.add(w); });
    return set;
  }
  window.LP_relatedArticles = function (article, all, n) {
    const mine = LP_terms(article);
    const scored = all.filter((a) => a.id !== article.id).map((a) => {
      const t = LP_terms(a);
      let overlap = 0; t.forEach((w) => { if (mine.has(w)) overlap++; });
      return { a, score: overlap + (a.tag === article.tag ? 0.5 : 0) };
    }).sort((x, y) => y.score - x.score);
    let out = scored.filter((s) => s.score > 0).slice(0, n).map((s) => s.a);
    if (out.length < n) {
      const have = new Set(out.map((a) => a.id));
      out = out.concat(all.filter((a) => a.id !== article.id && !have.has(a.id)).slice(0, n - out.length));
    }
    return out;
  };

  const ARTICLES = [
    {
      id: "ielts-vs-toefl",
      tag: "Comparison",
      title: "IELTS vs TOEFL: Which English test should you take in 2026?",
      excerpt: "A side-by-side breakdown of duration, scoring, university acceptance, cost, and difficulty — plus a decision flowchart based on your destination.",
      sections: [
        { h: "Quick verdict", body: "If you're applying to North American universities, TOEFL iBT remains the most widely accepted. For UK, Australia, Canada, and immigration purposes, IELTS Academic or General Training is preferred. Both are accepted at over 11,000 institutions, but the format and culture of each test differs significantly." },
        { h: "Duration and structure", body: "IELTS Academic runs 2 hours 45 minutes across four sections (Listening 30+10, Reading 60, Writing 60, Speaking 11–14 with a human examiner). TOEFL iBT runs about 2 hours via a single computer session covering Reading, Listening, Speaking (recorded responses), and Writing." },
        { h: "Scoring", body: "IELTS reports band scores from 0 to 9 in 0.5 increments per section, with an overall band rounded to the nearest 0.5. TOEFL reports a 0–30 scaled score per section with a 0–120 total. Most undergraduate programmes require IELTS 6.0–6.5 or TOEFL 80+; competitive graduate programmes typically require IELTS 7.0+ or TOEFL 100+." },
        { h: "Speaking format — the biggest difference", body: "IELTS Speaking is conducted face-to-face (or via video call) with a trained examiner across three parts. TOEFL Speaking is recorded — you respond into a microphone with no human in the room. Test-takers who get nervous around examiners often find TOEFL more comfortable; those who prefer natural conversation often prefer IELTS." },
        { h: "Cost (typical 2026 pricing)", body: "IELTS: USD 245–280 globally; INR 17,000 in India. TOEFL iBT: USD 195–220 globally; INR 17,000 in India. Both offer home editions (TOEFL Home Edition, IELTS Online) at similar prices." },
        { h: "Which is easier?", body: "There's no objectively easier test — but candidates with strong academic English and good typing skills often score higher on TOEFL. Those who prefer pen-and-paper reading and live conversation often score higher on IELTS. Take a free mock of each on LandingPrep before committing." }
      ]
    },
    {
      id: "gre-vs-gmat",
      tag: "Comparison",
      title: "GRE or GMAT for MBA? The 2026 honest comparison",
      excerpt: "Most top MBA programmes accept both — but the choice still matters. We compare structure, scoring, business school perception, and which test plays to which strengths.",
      sections: [
        { h: "Acceptance trends", body: "As of 2026, approximately 95% of top MBA programmes accept either GRE or GMAT. However, traditional finance and consulting recruiters still occasionally favour GMAT scores when reviewing candidates. If you're targeting investment banking from a top-10 programme, GMAT may signal stronger commitment to business analytics." },
        { h: "Structure", body: "GMAT Focus Edition (since 2024) is 2 hours 15 minutes: Quantitative Reasoning, Verbal Reasoning, and Data Insights. GRE General is 1 hour 58 minutes: Analytical Writing, two Verbal sections, two Quantitative sections. GRE allows you to skip and return to questions within a section; GMAT does not." },
        { h: "Scoring", body: "GMAT Focus: 205–805 total (in 10-point increments), with 60–90 per section. GRE: 130–170 per Verbal/Quant section (1-point increments) plus 0.0–6.0 Analytical Writing. Top MBA programmes typically expect GMAT 695+ (GRE Verbal 162+, Quant 165+)." },
        { h: "Quant difficulty", body: "GMAT Quant is generally considered harder, with more complex word problems and the unique Data Sufficiency format. GRE Quant tests similar topics but with a calculator available and a more straightforward problem-solving style. Engineers often prefer GRE Quant; finance/consulting candidates often choose GMAT to signal analytical rigour." },
        { h: "Verbal difficulty", body: "GRE Verbal tests vocabulary breadth (Text Completion, Sentence Equivalence) more than GMAT. GMAT Verbal Focus has removed Sentence Correction (since the Focus Edition rollout) and now consists of Critical Reasoning and Reading Comprehension only. Non-native English speakers often find GMAT Verbal Focus more accessible." },
        { h: "Cost", body: "GMAT Focus: USD 275 at test centre, USD 300 online. GRE General: USD 220 globally, USD 228 online. Both are valid for 5 years." }
      ]
    },
    {
      id: "ielts-band-7-blueprint",
      tag: "Strategy",
      title: "The IELTS Band 7 Blueprint: 8-week study plan with daily targets",
      excerpt: "An evidence-based 8-week plan that took dozens of candidates from Band 6.0 to Band 7.0+ — broken into daily 90-minute sessions you can run alongside work or study.",
      sections: [
        { h: "Week 1–2: Diagnostic and foundations", body: "Take a full mock test on day 1 to establish your baseline. Identify your weakest section (typically Writing or Speaking for non-native speakers). Build vocabulary in your weakest topic areas using Quizlet or paper flashcards — aim for 20 new words/day with example sentences." },
        { h: "Week 3–4: Section-specific drilling", body: "Mon/Wed/Fri: Listening + Reading drills (one full section each, 45 min). Tue/Thu: Writing Task 2 (one essay every other day, marked against the Band 7 sample). Weekend: Speaking practice with a partner or our Speaking Practice tool — 30 min each side." },
        { h: "Week 5–6: Mock tests and timing", body: "Take a full mock every Saturday under exam conditions. Review the report Sunday — identify recurring errors. Continue daily section drilling (60 min) focused on weak areas. Begin reading academic texts (BBC, The Guardian, The Economist) for 30 min daily to build advanced vocabulary in context." },
        { h: "Week 7: Refinement", body: "Drop drilling, focus on test-day strategy. Practice speed-skimming Reading passages (target: 18 min per passage). Memorise high-frequency Task 2 essay structures and linking phrases. Run Speaking Part 2 cue cards from cold (1-minute prep, 2-minute response) twice daily." },
        { h: "Week 8: Test week", body: "Three days before: light review only, no new content. Two days before: a single full mock at the same time of day as your real exam. Day before: rest, normal diet, no caffeine experiments. Test day: arrive 60 min early, bring two valid IDs, and trust your preparation." },
        { h: "What this plan won't do", body: "This won't take a Band 5 to Band 7 in 8 weeks — that requires a longer foundational vocabulary and grammar build. It also won't replace genuine immersion (reading widely, speaking regularly). Treat it as a structured intensive on top of broader English exposure." }
      ]
    },
    {
      id: "toefl-speaking-templates",
      tag: "Strategy",
      title: "TOEFL Speaking templates that actually score: avoiding the robot trap",
      excerpt: "Why memorised templates can hurt your score, and the flexible response frameworks high-scorers actually use for each of the four TOEFL Speaking tasks.",
      sections: [
        { h: "Why rigid templates fail", body: "TOEFL examiners are trained to identify memorised content — heavily templated answers receive lower scores even if grammatically correct. The solution isn't to abandon structure; it's to use flexible frameworks that adapt to the prompt." },
        { h: "Task 1 (Independent) framework", body: "(1) State preference clearly in 1 sentence. (2) Give two reasons, each with a specific example. (3) Brief concluding sentence. Total target: 130–150 words spoken in 45 seconds. Practice transitions: 'The first reason... For example... Additionally... For instance... So overall...'" },
        { h: "Task 2 (Integrated: campus reading + listening) framework", body: "(1) State the announcement/proposal in 1 sentence. (2) State the speaker's opinion (agrees/disagrees). (3) Give the speaker's two reasons with specific details from the listening. Avoid your own opinion entirely — only report what the speaker said." },
        { h: "Task 3 (Integrated: academic reading + lecture) framework", body: "(1) Define the academic concept from the reading in 1 sentence. (2) Explain the lecturer's first example. (3) Explain the lecturer's second example. Connect both examples back to the concept. This task tests synthesis, not opinion." },
        { h: "Task 4 (Integrated: lecture only) framework", body: "(1) State the main topic and how it's organised (e.g., 'two types', 'two causes'). (2) Detail the first example with the lecturer's specific terms. (3) Detail the second example similarly. Use the lecturer's terminology — don't paraphrase technical terms." }
      ]
    },
    {
      id: "score-target-by-country",
      tag: "Reference",
      title: "IELTS / TOEFL / PTE score targets by country and visa type",
      excerpt: "A quick-reference guide to score thresholds for student visas, PR, and citizenship in the UK, Canada, Australia, USA, New Zealand, and Germany.",
      sections: [
        { h: "United Kingdom — student visas", body: "UK Student Visa (Tier 4): IELTS Academic UKVI, minimum 5.5 each section for degree level. PTE Academic: 51 each section. TOEFL is no longer accepted for UK student visas as of 2014 — confirm current rules with UKVI." },
        { h: "Canada — student visas and Express Entry", body: "Canadian student visa: IELTS General or Academic 6.0+ (each section 5.5+) for most universities. Express Entry (Permanent Residency): IELTS General Training, with CLB level requirements ranging from CLB 7 (IELTS 6.0L/R/W/S) to CLB 10 (IELTS 8.0+). CELPIP General is also accepted for PR with equivalent CLB scoring." },
        { h: "Australia — student and skilled visas", body: "Subclass 500 (Student): IELTS 5.5+ overall typically, varying by institution. Subclass 189 (Skilled Independent): IELTS 6.0+ each section for points-test, IELTS 7.0+ each for additional 10 points, IELTS 8.0+ each for 20 points. PTE Academic accepted with equivalent thresholds." },
        { h: "United States — F-1 student visas", body: "No federal English score requirement for F-1 visa, but universities set their own thresholds: typically TOEFL iBT 80+ for undergraduate, 100+ for graduate. IELTS 6.5+ for undergraduate, 7.0+ for graduate. Top universities (HYP, MIT, Stanford) typically require TOEFL 100+ or IELTS 7.5+." },
        { h: "New Zealand — student and skilled visas", body: "Student visa: IELTS 5.5+ overall (universities may set higher). Skilled Migrant Category: IELTS 6.5+ overall, with no section below 6.0. PTE Academic 50+ overall (no section below 42)." },
        { h: "Germany — student admissions", body: "Most English-taught programmes require IELTS 6.5+ or TOEFL iBT 90+. German-taught programmes require TestDaF or DSH instead. The Studienkolleg foundation year typically requires IELTS 5.5+ alongside German B1." }
      ]
    },
    {
      id: "common-mistakes-writing",
      tag: "Strategy",
      title: "10 IELTS Writing mistakes that quietly cap your band at 6.5",
      excerpt: "These aren't the obvious grammar errors — they're the structural and stylistic patterns that top out scoring even when your English is otherwise strong.",
      sections: [
        { h: "1. Copying the prompt verbatim", body: "Examiners deduct lexical resource points for any passage copied directly from the question. Always paraphrase the prompt in your introduction — change at least two key nouns and the sentence structure." },
        { h: "2. Memorised opening lines", body: "'In today's modern era of advanced technology...' is on every examiner's blacklist. Skip the throat-clearing — get to the topic in your first sentence. 'Remote work has become a defining feature of post-pandemic employment, raising the question of whether...' is much stronger." },
        { h: "3. One-paragraph thesis", body: "Two body paragraphs of equal weight, each developing one main idea, score better than four short paragraphs or one giant paragraph. Aim for 3–5 sentences per body paragraph." },
        { h: "4. Overusing 'I think'", body: "'I believe', 'in my view', or 'arguably' are stronger and varied. Don't repeat the same phrase across 4 paragraphs." },
        { h: "5. Vague examples", body: "'Many studies have shown...' is meaningless. Even an invented specific example ('A 2019 OECD report found that...') scores higher because it shows you can structure evidence — examiners don't fact-check." },
        { h: "6. Underdeveloped conclusion", body: "Two-line conclusions ('In conclusion, both views have merits') are scored low. Restate your position with new framing and a forward-looking sentence (4–5 lines)." },
        { h: "7. Wrong register for Task 1 General", body: "Letters to a friend should use contractions and informal vocabulary; formal letters should not. Mismatched register can drop your Task Achievement score by a full band." },
        { h: "8. Task 2 with personal anecdotes", body: "Discussion essays favour broad evidence and balanced argument. Personal stories ('When I was at university...') are more appropriate for Speaking Part 2. Use general examples instead." },
        { h: "9. Misused linking words", body: "'Furthermore' is not a synonym for 'and'. 'Moreover' isn't filler. Each connector has a specific role — overusing them or using them incorrectly is more obvious to examiners than not using them at all." },
        { h: "10. Ignoring word count", body: "Task 1: 150+ words. Task 2: 250+ words. Below these thresholds, you lose marks regardless of quality. But going significantly over (350+) often introduces more errors and rarely raises your score." }
      ]
    },
    {
      id: "study-plan-30-day",
      tag: "Strategy",
      title: "30-day GRE prep plan for working professionals",
      excerpt: "A pragmatic, time-efficient GRE study plan for candidates with 1–2 hours per day. Targets a 320+ total in 30 days from a 305 baseline.",
      sections: [
        { h: "Days 1–3: Diagnostic and Quant fundamentals", body: "Take a free GRE diagnostic on Day 1 (LandingPrep, ETS PowerPrep, or Manhattan). Days 2–3: review arithmetic, ratio, percentage, basic algebra. Use Khan Academy free GRE prep videos for any topic where you scored below 50%." },
        { h: "Days 4–10: Verbal vocabulary push", body: "Magoosh's free GRE word list (1000 words) or Manhattan 5lb book vocabulary section. Daily target: 30 new words with sentence usage. Use spaced repetition (Anki recommended). Practice 10 Text Completion + 10 Sentence Equivalence questions every other day." },
        { h: "Days 11–18: Verbal RC and Quant geometry/data", body: "Reading Comprehension: 2 passages daily, untimed first week, then timed at 8 min/passage. Quant: geometry, statistics, probability. Mix of 30-question sets every other day under timed conditions." },
        { h: "Days 19–24: AW and full-length practice", body: "Issue and Argument essays — write one per day, alternate types. Hold yourself to 30 minutes including outline. Use the LandingPrep Writing Agent for instant feedback. Take one full-length practice test on Day 22 (Saturday) under exam conditions." },
        { h: "Days 25–28: Targeted weakness review", body: "Review every wrong answer from your full-length practice test. Re-do similar questions until confident. Take a second full-length test on Day 28." },
        { h: "Days 29–30: Test prep and rest", body: "Day 29: light review, no new content. Day 30: arrive at test centre 45 min early. The goal is to be peak rested, not peak crammed." }
      ]
    },
    {
      id: "ielts-task2-band8-structure",
      tag: "IELTS Writing",
      title: "The IELTS Writing Task 2 structure that scores Band 8",
      excerpt: "A repeatable four-paragraph blueprint for opinion, discussion and problem-solution essays — with the exact linking language examiners reward.",
      sections: [
        { h: "Why structure matters more than vocabulary", body: "Coherence and Cohesion is 25% of your Task 2 score, and it is the easiest band to control. Band 8 essays are not fancier — they are clearer. A predictable, logical structure lets the examiner follow your argument effortlessly, which directly lifts Coherence, Task Response and Grammatical Range." },
        { h: "The four-paragraph blueprint", body: "Introduction (2 sentences): paraphrase the question, then state your clear position or roadmap. Body 1 (4–5 sentences): topic sentence, explanation, specific example, mini-conclusion. Body 2: same shape for your second idea or the opposing view. Conclusion (2 sentences): restate your position and give a final thought. Aim for 270–290 words." },
        { h: "Linking language that earns marks", body: "Open ideas with: 'One compelling reason is…', 'A further consideration is…'. Add examples with: 'A clear illustration of this is…', 'This is borne out by…'. Concede and counter with: 'While critics argue X, the more persuasive view is Y because…'. Conclude with: 'On balance', 'Taking these points together'. Avoid overusing 'Firstly/Secondly' — vary your signposting." },
        { h: "The three mistakes that cap you at Band 6.5", body: "1) Not answering the exact question — 'to what extent' needs a position, not a description. 2) Examples that are vague ('some studies show') instead of concrete. 3) A memorised introduction that does not paraphrase the specific prompt. Fix these three and Task Response jumps a full band." },
        { h: "Practise it free", body: "Open the LandingPrep Learning Club for 40+ Task 2 prompts with Band 7 model answers, or paste your own essay into Writing Feedback for instant feedback on Task Response, Coherence, Lexical Resource and Grammar." }
      ]
    },
    {
      id: "pte-79-plus-fast",
      tag: "PTE Strategy",
      title: "How to score PTE 79+ fast: the high-yield task guide",
      excerpt: "PTE is AI-scored, so a few task types carry most of the marks. Here is where to spend your time for the fastest jump to 79+ (CEFR C1).",
      sections: [
        { h: "PTE scores by communicative skill, not by section", body: "Every task contributes to multiple skills (Speaking, Writing, Reading, Listening) at once. That is why Read Aloud and Repeat Sentence — which feed several skills — are the highest-leverage tasks on the entire test. Master them and your whole score rises." },
        { h: "Speaking: fluency beats accent", body: "The machine rewards a steady, continuous pace with natural stress — not a perfect accent. For Read Aloud, never stop or self-correct; keep flowing even past a stumble. For Repeat Sentence, repeat the rhythm and as many content words as you can; partial credit is real. Describe Image: use a 5-line template (intro, highest, lowest, comparison, conclusion) and fill the full 40 seconds." },
        { h: "Writing: templates are allowed and effective", body: "Summarize Written Text must be ONE grammatically correct sentence of 5–75 words — practise compressing a paragraph into a single complex sentence. For Write Essay, a memorised 5-paragraph frame (intro, two body, counter, conclusion) at 230–260 words scores consistently because PTE rewards structure, grammar and on-topic content." },
        { h: "Listening + Reading: protect your spelling", body: "Write From Dictation and Fill in the Blanks reward exact spelling, and they feed both Listening and Writing. Drill the 50 most common WFD sentences. In Reading, do Reorder Paragraphs and Fill in the Blanks first — they carry the most marks per minute." },
        { h: "A two-week plan", body: "Week 1: 30 min Read Aloud + 30 min Repeat Sentence daily, plus 10 Write From Dictation. Week 2: add two full mock tests on LandingPrep, review every low-scoring task, and re-drill. Most test-takers see a 5–10 point jump from this focus alone." }
      ]
    },
    {
      id: "duolingo-test-guide-2026",
      tag: "Duolingo",
      title: "Duolingo English Test 2026: format, scoring and a free practice plan",
      excerpt: "The DET is adaptive, 1 hour, and accepted by 5,000+ universities. Here's exactly how it's scored and how to prepare for free.",
      sections: [
        { h: "What the DET actually tests", body: "The Duolingo English Test is computer-adaptive: questions get harder or easier based on your answers, so the test is short (about 45–60 minutes) but precise. It blends Reading, Writing, Listening and Speaking into integrated task types like Read and Complete, Listen and Type, Write About the Photo, and Speak About the Photo." },
        { h: "How the 10–160 score works", body: "Your overall score (10–160) maps to CEFR levels and four subscores: Literacy, Comprehension, Conversation and Production. Most universities want 105–120 (roughly IELTS 6.5–7.5 / TOEFL 90–105). Because it is adaptive, accuracy early on matters — answer carefully rather than rushing." },
        { h: "The task types that move your score", body: "Read and Complete (c-test) rewards vocabulary and grammar — drill it daily. Listen and Type rewards spelling and working memory — replay nothing, so train first-pass capture. For the photo tasks, use a simple template: what you see, what is happening, and one inference. Fill the full time on speaking tasks." },
        { h: "A one-week free plan", body: "Days 1–2: learn the 8 task types and time limits. Days 3–5: 20 minutes of Read and Complete + Listen and Type daily, plus three photo descriptions. Days 6–7: take LandingPrep's adaptive Duolingo mocks under timed conditions and review every miss. Practise on the device and browser you will actually use." },
        { h: "Test-day rules that catch people out", body: "The DET has strict proctoring: a clear desk, no looking away, no notes. A single rule violation can void your test. Practise looking only at the screen, and do a quiet room and webcam check the day before." }
      ]
    }
  ];
  // Append extra articles (from blog-data.jsx), skipping any whose id already
  // exists so a post can never render twice (fixes the duplicate-blogs bug).
  try {
    if (window.LP_BLOG_EXTRA) {
      const have = new Set(ARTICLES.map((a) => a.id));
      const fresh = window.LP_BLOG_EXTRA.filter((a) => a && a.id && !have.has(a.id));
      ARTICLES.unshift(...fresh);
    }
  } catch (e) {}

  function BlogIndex({ onNav, onOpen }) {
    React.useEffect(() => {
      if (window.LP_SEO) window.LP_SEO.set({
        title: "Free Study-Abroad & Exam Guides 2026 — IELTS, TOEFL, GRE, GMAT, Visas | LandingPrep",
        description: "Free step-by-step guides on study-abroad visas, costs, funding and PR for the USA, Canada, UK, Europe & Australia — plus IELTS, TOEFL, PTE, GRE & GMAT score targets and study plans.",
      });
    }, []);
    const [query, setQuery] = useState("");
    const [tag, setTag] = useState("");
    // Topic chips, most-used first.
    const tagCounts = {};
    ARTICLES.forEach((a) => { if (a.tag) tagCounts[a.tag] = (tagCounts[a.tag] || 0) + 1; });
    const tags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
    const q = query.trim().toLowerCase();
    const filtered = ARTICLES.filter((a) =>
      (!tag || a.tag === tag) &&
      (!q || (a.title + " " + (a.excerpt || "") + " " + (a.kw || "") + " " + (a.tag || "")).toLowerCase().includes(q))
    );
    return (
      <>
        <window.LP_TopBar current="blog" onNav={onNav} />
        <div className="seo-shell blg-index">
          <div className="seo-hero">
            <div className="eyebrow">Study Tips · Strategy · Comparisons</div>
            <h1 className="h1" style={{ marginTop: 8, fontSize: "clamp(32px,5vw,48px)" }}>Free study-abroad & exam guides</h1>
            <p className="body-lg muted" style={{ maxWidth: 720, marginTop: 12 }}>
              Step-by-step guides on visas, costs, funding and PR for the USA, Canada, UK, Europe &amp; Australia — plus score targets and study plans for IELTS, TOEFL, PTE, GRE and GMAT.
            </p>
          </div>

          <div className="blg-filterbar">
            <div className="blg-search">
              <span className="blg-search-ic" aria-hidden="true">🔎</span>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                     placeholder={`Search ${ARTICLES.length} guides — e.g. "Canada visa", "GMAT", "scholarship"…`}
                     aria-label="Search guides" />
              {query && <button className="blg-search-clear" onClick={() => setQuery("")} aria-label="Clear search">✕</button>}
            </div>
            <div className="blg-chips" role="tablist" aria-label="Filter by topic">
              <button className={"blg-chip" + (tag === "" ? " active" : "")} onClick={() => setTag("")}>All <span className="blg-chip-n">{ARTICLES.length}</span></button>
              {tags.map((t) => (
                <button key={t} className={"blg-chip" + (tag === t ? " active" : "")} onClick={() => setTag(tag === t ? "" : t)}>
                  {t} <span className="blg-chip-n">{tagCounts[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="blg-noresults">
              <p>No guides match {q ? `"${query}"` : "that filter"}{tag ? ` in ${tag}` : ""}.</p>
              <button className="btn" onClick={() => { setQuery(""); setTag(""); }}>Clear filters</button>
            </div>
          ) : (
            <div className="seo-grid">
              {filtered.map((a) => {
                const words = (a.sections || []).reduce((n, s) => n + ((s.body || "") + " " + (s.steps || []).join(" ") + " " + (s.bullets || []).join(" ")).split(/\s+/).length, 0);
                const mins = Math.max(2, Math.round(words / 200));
                return (
                  <div key={a.id} className="seo-card" onClick={() => onOpen(a.id)} role="button" tabIndex={0}
                       onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(a.id)}>
                    <div className="seo-card-top">
                      <span className="tag">{a.tag}</span>
                      <span className="seo-readtime">{mins} min read</span>
                    </div>
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <span className="seo-card-cta">Read guide →</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <window.LP_Footer />
      </>
    );
  }

  // ── Rich content helpers ─────────────────────────────────────────────
  function slugify(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function calloutIcon(t) { return t === "warn" ? "⚠️" : t === "tip" ? "💡" : t === "money" ? "💰" : t === "key" ? "🔑" : "ℹ️"; }
  // Inline formatter: **bold**, [text](url)
  function fmt(text) {
    if (text == null) return null;
    const s = String(text); const out = []; let last = 0, m, k = 0;
    const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
    while ((m = re.exec(s))) {
      if (m.index > last) out.push(s.slice(last, m.index));
      if (m[1]) out.push(<strong key={k++}>{m[1]}</strong>);
      else { const ext = /^https?:/.test(m[3]); out.push(<a key={k++} href={m[3]} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined}>{m[2]}</a>); }
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  }
  function Paragraphs({ text }) {
    return String(text || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p, i) => <p key={i}>{fmt(p)}</p>);
  }
  function Section({ s }) {
    return (
      <section className="blg-section">
        {s.h && <h2 id={slugify(s.h)}>{s.h}</h2>}
        {s.body && <Paragraphs text={s.body} />}
        {s.callout && (
          <div className={"blg-callout " + (s.callout.type || "info")}>
            <span className="blg-callout-ic">{calloutIcon(s.callout.type)}</span>
            <div>{fmt(s.callout.text)}</div>
          </div>
        )}
        {Array.isArray(s.steps) && s.steps.length > 0 && (
          <ol className="blg-steps">{s.steps.map((st, i) => <li key={i}>{fmt(st)}</li>)}</ol>
        )}
        {Array.isArray(s.bullets) && s.bullets.length > 0 && (
          <ul className="blg-bullets">{s.bullets.map((b, i) => <li key={i}>{fmt(b)}</li>)}</ul>
        )}
        {s.table && Array.isArray(s.table.rows) && (
          <div className="blg-tablewrap">
            <table className="blg-table">
              {Array.isArray(s.table.headers) && <thead><tr>{s.table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>}
              <tbody>{s.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{fmt(c)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    );
  }
  function Faq({ faqs }) {
    const [open, setOpen] = useState(0);
    return (
      <div className="blg-faq">
        <h2>Frequently asked questions</h2>
        {faqs.map((f, i) => {
          const q = Array.isArray(f) ? f[0] : f.q; const a = Array.isArray(f) ? f[1] : f.a;
          return (
            <div key={i} className={"blg-faq-item" + (open === i ? " open" : "")}>
              <button className="blg-faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                <span>{q}</span><span className="blg-faq-ic">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && <div className="blg-faq-a">{fmt(a)}</div>}
            </div>
          );
        })}
      </div>
    );
  }

  function BlogArticle({ article, onNav, onBackToIndex, onOpen }) {
    if (!article) return null;
    const words = (article.sections || []).reduce((n, s) =>
      n + ((s.body || "") + " " + (s.steps || []).join(" ") + " " + (s.bullets || []).join(" ")).split(/\s+/).length, 0);
    const mins = Math.max(3, Math.round(words / 200));
    const toc = (article.sections || []).filter((s) => s.h);
    let related = window.LP_relatedArticles(article, ARTICLES, 3);
    return (
      <>
        <window.LP_TopBar current="blog" onNav={onNav} />
        <div className="seo-shell blg-shell">
          <div style={{ marginBottom: 18 }}>
            <a onClick={onBackToIndex} style={{ color: "var(--accent)", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>← All guides</a>
          </div>
          <div className="blg-head">
            <span className="blg-tag">{article.tag}</span>
            <h1>{article.title}</h1>
            <p className="blg-excerpt">{article.excerpt}</p>
            <div className="blg-meta">{article.date ? <span>{article.date}</span> : null}{article.date ? <span className="dot">·</span> : null}<span>{mins} min read</span><span className="dot">·</span><span>LandingPrep</span></div>
          </div>
          {toc.length >= 4 && (
            <nav className="blg-toc">
              <div className="blg-toc-t">📑 On this page</div>
              <ol>{toc.map((s, i) => <li key={i}><a href={"#" + slugify(s.h)}>{s.h}</a></li>)}</ol>
            </nav>
          )}
          <div className="seo-article-body blg-body">
            {(article.sections || []).map((s, i) => <Section key={i} s={s} />)}
          </div>
          {Array.isArray(article.faqs) && article.faqs.length > 0 && <Faq faqs={article.faqs} />}
          <div className="blg-cta">
            <h3>Ready to put this into practice?</h3>
            <p>Take a free mock test, check your eligibility with the College Predictor, or open the Learning Club for model answers — all 100% free.</p>
            <div className="row-gap-12">
              <button className="btn btn-primary" onClick={() => onNav("exams")}>Free mock tests →</button>
              <button className="btn" onClick={() => onNav("colleges")}>Study-abroad tools →</button>
            </div>
          </div>
          {related.length > 0 && (
            <div className="blg-related">
              <h2>Keep reading</h2>
              <div className="seo-grid">
                {related.map((a) => (
                  <div key={a.id} className="seo-card" onClick={() => onOpen(a.id)} role="button" tabIndex={0}
                       onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen(a.id)}>
                    <div className="seo-card-top"><span className="tag">{a.tag}</span></div>
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <span className="seo-card-cta">Read guide →</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <window.LP_Footer />
      </>
    );
  }

  function BlogRouter({ onNav }) {
    const [openId, setOpenId] = useState(null);
    React.useEffect(() => { try { window.scrollTo(0, 0); } catch (e) {} }, [openId]);
    if (openId) {
      const article = ARTICLES.find(a => a.id === openId);
      return <BlogArticle article={article} onNav={onNav} onBackToIndex={() => setOpenId(null)} onOpen={setOpenId} />;
    }
    return <BlogIndex onNav={onNav} onOpen={setOpenId} />;
  }

  window.LP_Blog = BlogRouter;
  window.LP_ARTICLES = ARTICLES;
})();
