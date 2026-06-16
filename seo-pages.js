(function() {
  const { useState } = React;
  const LP_STOP = new Set("the a an and or for to of in on at is are be your you our we 2025 2026 with how what which best top free guide vs your study abroad after international students".split(" "));
  function LP_terms(a) {
    const raw = ((a.title || "") + " " + (a.kw || "") + " " + (a.tag || "")).toLowerCase();
    const set = /* @__PURE__ */ new Set();
    (raw.match(/[a-z]{3,}/g) || []).forEach((w) => {
      if (!LP_STOP.has(w)) set.add(w);
    });
    return set;
  }
  window.LP_relatedArticles = function(article, all, n) {
    const mine = LP_terms(article);
    const scored = all.filter((a) => a.id !== article.id).map((a) => {
      const t = LP_terms(a);
      let overlap = 0;
      t.forEach((w) => {
        if (mine.has(w)) overlap++;
      });
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
      excerpt: "A side-by-side breakdown of duration, scoring, university acceptance, cost, and difficulty \u2014 plus a decision flowchart based on your destination.",
      sections: [
        { h: "Quick verdict", body: "If you're applying to North American universities, TOEFL iBT remains the most widely accepted. For UK, Australia, Canada, and immigration purposes, IELTS Academic or General Training is preferred. Both are accepted at over 11,000 institutions, but the format and culture of each test differs significantly." },
        { h: "Duration and structure", body: "IELTS Academic runs 2 hours 45 minutes across four sections (Listening 30+10, Reading 60, Writing 60, Speaking 11\u201314 with a human examiner). TOEFL iBT runs about 2 hours via a single computer session covering Reading, Listening, Speaking (recorded responses), and Writing." },
        { h: "Scoring", body: "IELTS reports band scores from 0 to 9 in 0.5 increments per section, with an overall band rounded to the nearest 0.5. TOEFL reports a 0\u201330 scaled score per section with a 0\u2013120 total. Most undergraduate programmes require IELTS 6.0\u20136.5 or TOEFL 80+; competitive graduate programmes typically require IELTS 7.0+ or TOEFL 100+." },
        { h: "Speaking format \u2014 the biggest difference", body: "IELTS Speaking is conducted face-to-face (or via video call) with a trained examiner across three parts. TOEFL Speaking is recorded \u2014 you respond into a microphone with no human in the room. Test-takers who get nervous around examiners often find TOEFL more comfortable; those who prefer natural conversation often prefer IELTS." },
        { h: "Cost (typical 2026 pricing)", body: "IELTS: USD 245\u2013280 globally; INR 17,000 in India. TOEFL iBT: USD 195\u2013220 globally; INR 17,000 in India. Both offer home editions (TOEFL Home Edition, IELTS Online) at similar prices." },
        { h: "Which is easier?", body: "There's no objectively easier test \u2014 but candidates with strong academic English and good typing skills often score higher on TOEFL. Those who prefer pen-and-paper reading and live conversation often score higher on IELTS. Take a free mock of each on LandingPrep before committing." }
      ]
    },
    {
      id: "gre-vs-gmat",
      tag: "Comparison",
      title: "GRE or GMAT for MBA? The 2026 honest comparison",
      excerpt: "Most top MBA programmes accept both \u2014 but the choice still matters. We compare structure, scoring, business school perception, and which test plays to which strengths.",
      sections: [
        { h: "Acceptance trends", body: "As of 2026, approximately 95% of top MBA programmes accept either GRE or GMAT. However, traditional finance and consulting recruiters still occasionally favour GMAT scores when reviewing candidates. If you're targeting investment banking from a top-10 programme, GMAT may signal stronger commitment to business analytics." },
        { h: "Structure", body: "GMAT Focus Edition (since 2024) is 2 hours 15 minutes: Quantitative Reasoning, Verbal Reasoning, and Data Insights. GRE General is 1 hour 58 minutes: Analytical Writing, two Verbal sections, two Quantitative sections. GRE allows you to skip and return to questions within a section; GMAT does not." },
        { h: "Scoring", body: "GMAT Focus: 205\u2013805 total (in 10-point increments), with 60\u201390 per section. GRE: 130\u2013170 per Verbal/Quant section (1-point increments) plus 0.0\u20136.0 Analytical Writing. Top MBA programmes typically expect GMAT 695+ (GRE Verbal 162+, Quant 165+)." },
        { h: "Quant difficulty", body: "GMAT Quant is generally considered harder, with more complex word problems and the unique Data Sufficiency format. GRE Quant tests similar topics but with a calculator available and a more straightforward problem-solving style. Engineers often prefer GRE Quant; finance/consulting candidates often choose GMAT to signal analytical rigour." },
        { h: "Verbal difficulty", body: "GRE Verbal tests vocabulary breadth (Text Completion, Sentence Equivalence) more than GMAT. GMAT Verbal Focus has removed Sentence Correction (since the Focus Edition rollout) and now consists of Critical Reasoning and Reading Comprehension only. Non-native English speakers often find GMAT Verbal Focus more accessible." },
        { h: "Cost", body: "GMAT Focus: USD 275 at test centre, USD 300 online. GRE General: USD 220 globally, USD 228 online. Both are valid for 5 years." }
      ]
    },
    {
      id: "ielts-band-7-blueprint",
      tag: "Strategy",
      title: "The IELTS Band 7 Blueprint: 8-week study plan with daily targets",
      excerpt: "An evidence-based 8-week plan that took dozens of candidates from Band 6.0 to Band 7.0+ \u2014 broken into daily 90-minute sessions you can run alongside work or study.",
      sections: [
        { h: "Week 1\u20132: Diagnostic and foundations", body: "Take a full mock test on day 1 to establish your baseline. Identify your weakest section (typically Writing or Speaking for non-native speakers). Build vocabulary in your weakest topic areas using Quizlet or paper flashcards \u2014 aim for 20 new words/day with example sentences." },
        { h: "Week 3\u20134: Section-specific drilling", body: "Mon/Wed/Fri: Listening + Reading drills (one full section each, 45 min). Tue/Thu: Writing Task 2 (one essay every other day, marked against the Band 7 sample). Weekend: Speaking practice with a partner or our Speaking Practice tool \u2014 30 min each side." },
        { h: "Week 5\u20136: Mock tests and timing", body: "Take a full mock every Saturday under exam conditions. Review the report Sunday \u2014 identify recurring errors. Continue daily section drilling (60 min) focused on weak areas. Begin reading academic texts (BBC, The Guardian, The Economist) for 30 min daily to build advanced vocabulary in context." },
        { h: "Week 7: Refinement", body: "Drop drilling, focus on test-day strategy. Practice speed-skimming Reading passages (target: 18 min per passage). Memorise high-frequency Task 2 essay structures and linking phrases. Run Speaking Part 2 cue cards from cold (1-minute prep, 2-minute response) twice daily." },
        { h: "Week 8: Test week", body: "Three days before: light review only, no new content. Two days before: a single full mock at the same time of day as your real exam. Day before: rest, normal diet, no caffeine experiments. Test day: arrive 60 min early, bring two valid IDs, and trust your preparation." },
        { h: "What this plan won't do", body: "This won't take a Band 5 to Band 7 in 8 weeks \u2014 that requires a longer foundational vocabulary and grammar build. It also won't replace genuine immersion (reading widely, speaking regularly). Treat it as a structured intensive on top of broader English exposure." }
      ]
    },
    {
      id: "toefl-speaking-templates",
      tag: "Strategy",
      title: "TOEFL Speaking templates that actually score: avoiding the robot trap",
      excerpt: "Why memorised templates can hurt your score, and the flexible response frameworks high-scorers actually use for each of the four TOEFL Speaking tasks.",
      sections: [
        { h: "Why rigid templates fail", body: "TOEFL examiners are trained to identify memorised content \u2014 heavily templated answers receive lower scores even if grammatically correct. The solution isn't to abandon structure; it's to use flexible frameworks that adapt to the prompt." },
        { h: "Task 1 (Independent) framework", body: "(1) State preference clearly in 1 sentence. (2) Give two reasons, each with a specific example. (3) Brief concluding sentence. Total target: 130\u2013150 words spoken in 45 seconds. Practice transitions: 'The first reason... For example... Additionally... For instance... So overall...'" },
        { h: "Task 2 (Integrated: campus reading + listening) framework", body: "(1) State the announcement/proposal in 1 sentence. (2) State the speaker's opinion (agrees/disagrees). (3) Give the speaker's two reasons with specific details from the listening. Avoid your own opinion entirely \u2014 only report what the speaker said." },
        { h: "Task 3 (Integrated: academic reading + lecture) framework", body: "(1) Define the academic concept from the reading in 1 sentence. (2) Explain the lecturer's first example. (3) Explain the lecturer's second example. Connect both examples back to the concept. This task tests synthesis, not opinion." },
        { h: "Task 4 (Integrated: lecture only) framework", body: "(1) State the main topic and how it's organised (e.g., 'two types', 'two causes'). (2) Detail the first example with the lecturer's specific terms. (3) Detail the second example similarly. Use the lecturer's terminology \u2014 don't paraphrase technical terms." }
      ]
    },
    {
      id: "score-target-by-country",
      tag: "Reference",
      title: "IELTS / TOEFL / PTE score targets by country and visa type",
      excerpt: "A quick-reference guide to score thresholds for student visas, PR, and citizenship in the UK, Canada, Australia, USA, New Zealand, and Germany.",
      sections: [
        { h: "United Kingdom \u2014 student visas", body: "UK Student Visa (Tier 4): IELTS Academic UKVI, minimum 5.5 each section for degree level. PTE Academic: 51 each section. TOEFL is no longer accepted for UK student visas as of 2014 \u2014 confirm current rules with UKVI." },
        { h: "Canada \u2014 student visas and Express Entry", body: "Canadian student visa: IELTS General or Academic 6.0+ (each section 5.5+) for most universities. Express Entry (Permanent Residency): IELTS General Training, with CLB level requirements ranging from CLB 7 (IELTS 6.0L/R/W/S) to CLB 10 (IELTS 8.0+). CELPIP General is also accepted for PR with equivalent CLB scoring." },
        { h: "Australia \u2014 student and skilled visas", body: "Subclass 500 (Student): IELTS 5.5+ overall typically, varying by institution. Subclass 189 (Skilled Independent): IELTS 6.0+ each section for points-test, IELTS 7.0+ each for additional 10 points, IELTS 8.0+ each for 20 points. PTE Academic accepted with equivalent thresholds." },
        { h: "United States \u2014 F-1 student visas", body: "No federal English score requirement for F-1 visa, but universities set their own thresholds: typically TOEFL iBT 80+ for undergraduate, 100+ for graduate. IELTS 6.5+ for undergraduate, 7.0+ for graduate. Top universities (HYP, MIT, Stanford) typically require TOEFL 100+ or IELTS 7.5+." },
        { h: "New Zealand \u2014 student and skilled visas", body: "Student visa: IELTS 5.5+ overall (universities may set higher). Skilled Migrant Category: IELTS 6.5+ overall, with no section below 6.0. PTE Academic 50+ overall (no section below 42)." },
        { h: "Germany \u2014 student admissions", body: "Most English-taught programmes require IELTS 6.5+ or TOEFL iBT 90+. German-taught programmes require TestDaF or DSH instead. The Studienkolleg foundation year typically requires IELTS 5.5+ alongside German B1." }
      ]
    },
    {
      id: "common-mistakes-writing",
      tag: "Strategy",
      title: "10 IELTS Writing mistakes that quietly cap your band at 6.5",
      excerpt: "These aren't the obvious grammar errors \u2014 they're the structural and stylistic patterns that top out scoring even when your English is otherwise strong.",
      sections: [
        { h: "1. Copying the prompt verbatim", body: "Examiners deduct lexical resource points for any passage copied directly from the question. Always paraphrase the prompt in your introduction \u2014 change at least two key nouns and the sentence structure." },
        { h: "2. Memorised opening lines", body: "'In today's modern era of advanced technology...' is on every examiner's blacklist. Skip the throat-clearing \u2014 get to the topic in your first sentence. 'Remote work has become a defining feature of post-pandemic employment, raising the question of whether...' is much stronger." },
        { h: "3. One-paragraph thesis", body: "Two body paragraphs of equal weight, each developing one main idea, score better than four short paragraphs or one giant paragraph. Aim for 3\u20135 sentences per body paragraph." },
        { h: "4. Overusing 'I think'", body: "'I believe', 'in my view', or 'arguably' are stronger and varied. Don't repeat the same phrase across 4 paragraphs." },
        { h: "5. Vague examples", body: "'Many studies have shown...' is meaningless. Even an invented specific example ('A 2019 OECD report found that...') scores higher because it shows you can structure evidence \u2014 examiners don't fact-check." },
        { h: "6. Underdeveloped conclusion", body: "Two-line conclusions ('In conclusion, both views have merits') are scored low. Restate your position with new framing and a forward-looking sentence (4\u20135 lines)." },
        { h: "7. Wrong register for Task 1 General", body: "Letters to a friend should use contractions and informal vocabulary; formal letters should not. Mismatched register can drop your Task Achievement score by a full band." },
        { h: "8. Task 2 with personal anecdotes", body: "Discussion essays favour broad evidence and balanced argument. Personal stories ('When I was at university...') are more appropriate for Speaking Part 2. Use general examples instead." },
        { h: "9. Misused linking words", body: "'Furthermore' is not a synonym for 'and'. 'Moreover' isn't filler. Each connector has a specific role \u2014 overusing them or using them incorrectly is more obvious to examiners than not using them at all." },
        { h: "10. Ignoring word count", body: "Task 1: 150+ words. Task 2: 250+ words. Below these thresholds, you lose marks regardless of quality. But going significantly over (350+) often introduces more errors and rarely raises your score." }
      ]
    },
    {
      id: "study-plan-30-day",
      tag: "Strategy",
      title: "30-day GRE prep plan for working professionals",
      excerpt: "A pragmatic, time-efficient GRE study plan for candidates with 1\u20132 hours per day. Targets a 320+ total in 30 days from a 305 baseline.",
      sections: [
        { h: "Days 1\u20133: Diagnostic and Quant fundamentals", body: "Take a free GRE diagnostic on Day 1 (LandingPrep, ETS PowerPrep, or Manhattan). Days 2\u20133: review arithmetic, ratio, percentage, basic algebra. Use Khan Academy free GRE prep videos for any topic where you scored below 50%." },
        { h: "Days 4\u201310: Verbal vocabulary push", body: "Magoosh's free GRE word list (1000 words) or Manhattan 5lb book vocabulary section. Daily target: 30 new words with sentence usage. Use spaced repetition (Anki recommended). Practice 10 Text Completion + 10 Sentence Equivalence questions every other day." },
        { h: "Days 11\u201318: Verbal RC and Quant geometry/data", body: "Reading Comprehension: 2 passages daily, untimed first week, then timed at 8 min/passage. Quant: geometry, statistics, probability. Mix of 30-question sets every other day under timed conditions." },
        { h: "Days 19\u201324: AW and full-length practice", body: "Issue and Argument essays \u2014 write one per day, alternate types. Hold yourself to 30 minutes including outline. Use the LandingPrep Writing Agent for instant feedback. Take one full-length practice test on Day 22 (Saturday) under exam conditions." },
        { h: "Days 25\u201328: Targeted weakness review", body: "Review every wrong answer from your full-length practice test. Re-do similar questions until confident. Take a second full-length test on Day 28." },
        { h: "Days 29\u201330: Test prep and rest", body: "Day 29: light review, no new content. Day 30: arrive at test centre 45 min early. The goal is to be peak rested, not peak crammed." }
      ]
    },
    {
      id: "ielts-task2-band8-structure",
      tag: "IELTS Writing",
      title: "The IELTS Writing Task 2 structure that scores Band 8",
      excerpt: "A repeatable four-paragraph blueprint for opinion, discussion and problem-solution essays \u2014 with the exact linking language examiners reward.",
      sections: [
        { h: "Why structure matters more than vocabulary", body: "Coherence and Cohesion is 25% of your Task 2 score, and it is the easiest band to control. Band 8 essays are not fancier \u2014 they are clearer. A predictable, logical structure lets the examiner follow your argument effortlessly, which directly lifts Coherence, Task Response and Grammatical Range." },
        { h: "The four-paragraph blueprint", body: "Introduction (2 sentences): paraphrase the question, then state your clear position or roadmap. Body 1 (4\u20135 sentences): topic sentence, explanation, specific example, mini-conclusion. Body 2: same shape for your second idea or the opposing view. Conclusion (2 sentences): restate your position and give a final thought. Aim for 270\u2013290 words." },
        { h: "Linking language that earns marks", body: "Open ideas with: 'One compelling reason is\u2026', 'A further consideration is\u2026'. Add examples with: 'A clear illustration of this is\u2026', 'This is borne out by\u2026'. Concede and counter with: 'While critics argue X, the more persuasive view is Y because\u2026'. Conclude with: 'On balance', 'Taking these points together'. Avoid overusing 'Firstly/Secondly' \u2014 vary your signposting." },
        { h: "The three mistakes that cap you at Band 6.5", body: "1) Not answering the exact question \u2014 'to what extent' needs a position, not a description. 2) Examples that are vague ('some studies show') instead of concrete. 3) A memorised introduction that does not paraphrase the specific prompt. Fix these three and Task Response jumps a full band." },
        { h: "Practise it free", body: "Open the LandingPrep Learning Club for 40+ Task 2 prompts with Band 7 model answers, or paste your own essay into Writing Feedback for instant feedback on Task Response, Coherence, Lexical Resource and Grammar." }
      ]
    },
    {
      id: "pte-79-plus-fast",
      tag: "PTE Strategy",
      title: "How to score PTE 79+ fast: the high-yield task guide",
      excerpt: "PTE is AI-scored, so a few task types carry most of the marks. Here is where to spend your time for the fastest jump to 79+ (CEFR C1).",
      sections: [
        { h: "PTE scores by communicative skill, not by section", body: "Every task contributes to multiple skills (Speaking, Writing, Reading, Listening) at once. That is why Read Aloud and Repeat Sentence \u2014 which feed several skills \u2014 are the highest-leverage tasks on the entire test. Master them and your whole score rises." },
        { h: "Speaking: fluency beats accent", body: "The machine rewards a steady, continuous pace with natural stress \u2014 not a perfect accent. For Read Aloud, never stop or self-correct; keep flowing even past a stumble. For Repeat Sentence, repeat the rhythm and as many content words as you can; partial credit is real. Describe Image: use a 5-line template (intro, highest, lowest, comparison, conclusion) and fill the full 40 seconds." },
        { h: "Writing: templates are allowed and effective", body: "Summarize Written Text must be ONE grammatically correct sentence of 5\u201375 words \u2014 practise compressing a paragraph into a single complex sentence. For Write Essay, a memorised 5-paragraph frame (intro, two body, counter, conclusion) at 230\u2013260 words scores consistently because PTE rewards structure, grammar and on-topic content." },
        { h: "Listening + Reading: protect your spelling", body: "Write From Dictation and Fill in the Blanks reward exact spelling, and they feed both Listening and Writing. Drill the 50 most common WFD sentences. In Reading, do Reorder Paragraphs and Fill in the Blanks first \u2014 they carry the most marks per minute." },
        { h: "A two-week plan", body: "Week 1: 30 min Read Aloud + 30 min Repeat Sentence daily, plus 10 Write From Dictation. Week 2: add two full mock tests on LandingPrep, review every low-scoring task, and re-drill. Most test-takers see a 5\u201310 point jump from this focus alone." }
      ]
    },
    {
      id: "duolingo-test-guide-2026",
      tag: "Duolingo",
      title: "Duolingo English Test 2026: format, scoring and a free practice plan",
      excerpt: "The DET is adaptive, 1 hour, and accepted by 5,000+ universities. Here's exactly how it's scored and how to prepare for free.",
      sections: [
        { h: "What the DET actually tests", body: "The Duolingo English Test is computer-adaptive: questions get harder or easier based on your answers, so the test is short (about 45\u201360 minutes) but precise. It blends Reading, Writing, Listening and Speaking into integrated task types like Read and Complete, Listen and Type, Write About the Photo, and Speak About the Photo." },
        { h: "How the 10\u2013160 score works", body: "Your overall score (10\u2013160) maps to CEFR levels and four subscores: Literacy, Comprehension, Conversation and Production. Most universities want 105\u2013120 (roughly IELTS 6.5\u20137.5 / TOEFL 90\u2013105). Because it is adaptive, accuracy early on matters \u2014 answer carefully rather than rushing." },
        { h: "The task types that move your score", body: "Read and Complete (c-test) rewards vocabulary and grammar \u2014 drill it daily. Listen and Type rewards spelling and working memory \u2014 replay nothing, so train first-pass capture. For the photo tasks, use a simple template: what you see, what is happening, and one inference. Fill the full time on speaking tasks." },
        { h: "A one-week free plan", body: "Days 1\u20132: learn the 8 task types and time limits. Days 3\u20135: 20 minutes of Read and Complete + Listen and Type daily, plus three photo descriptions. Days 6\u20137: take LandingPrep's adaptive Duolingo mocks under timed conditions and review every miss. Practise on the device and browser you will actually use." },
        { h: "Test-day rules that catch people out", body: "The DET has strict proctoring: a clear desk, no looking away, no notes. A single rule violation can void your test. Practise looking only at the screen, and do a quiet room and webcam check the day before." }
      ]
    }
  ];
  try {
    if (window.LP_BLOG_EXTRA) {
      const have = new Set(ARTICLES.map((a) => a.id));
      const fresh = window.LP_BLOG_EXTRA.filter((a) => a && a.id && !have.has(a.id));
      ARTICLES.unshift(...fresh);
    }
  } catch (e) {
  }
  function BlogIndex({ onNav, onOpen }) {
    React.useEffect(() => {
      if (window.LP_SEO) window.LP_SEO.set({
        title: "Free Study-Abroad & Exam Guides 2026 \u2014 IELTS, TOEFL, GRE, GMAT, Visas | LandingPrep",
        description: "Free step-by-step guides on study-abroad visas, costs, funding and PR for the USA, Canada, UK, Europe & Australia \u2014 plus IELTS, TOEFL, PTE, GRE & GMAT score targets and study plans."
      });
    }, []);
    const [query, setQuery] = useState("");
    const [tag, setTag] = useState("");
    const tagCounts = {};
    ARTICLES.forEach((a) => {
      if (a.tag) tagCounts[a.tag] = (tagCounts[a.tag] || 0) + 1;
    });
    const tags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
    const q = query.trim().toLowerCase();
    const filtered = ARTICLES.filter(
      (a) => (!tag || a.tag === tag) && (!q || (a.title + " " + (a.excerpt || "") + " " + (a.kw || "") + " " + (a.tag || "")).toLowerCase().includes(q))
    );
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "blog", onNav }), /* @__PURE__ */ React.createElement("div", { className: "seo-shell blg-index" }, /* @__PURE__ */ React.createElement("div", { className: "seo-hero" }, /* @__PURE__ */ React.createElement("div", { className: "eyebrow" }, "Study Tips \xB7 Strategy \xB7 Comparisons"), /* @__PURE__ */ React.createElement("h1", { className: "h1", style: { marginTop: 8, fontSize: "clamp(32px,5vw,48px)" } }, "Free study-abroad & exam guides"), /* @__PURE__ */ React.createElement("p", { className: "body-lg muted", style: { maxWidth: 720, marginTop: 12 } }, "Step-by-step guides on visas, costs, funding and PR for the USA, Canada, UK, Europe & Australia \u2014 plus score targets and study plans for IELTS, TOEFL, PTE, GRE and GMAT.")), /* @__PURE__ */ React.createElement("div", { className: "blg-filterbar" }, /* @__PURE__ */ React.createElement("div", { className: "blg-search" }, /* @__PURE__ */ React.createElement("span", { className: "blg-search-ic", "aria-hidden": "true" }, "\u{1F50E}"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "search",
        value: query,
        onChange: (e) => setQuery(e.target.value),
        placeholder: `Search ${ARTICLES.length} guides \u2014 e.g. "Canada visa", "GMAT", "scholarship"\u2026`,
        "aria-label": "Search guides"
      }
    ), query && /* @__PURE__ */ React.createElement("button", { className: "blg-search-clear", onClick: () => setQuery(""), "aria-label": "Clear search" }, "\u2715")), /* @__PURE__ */ React.createElement("div", { className: "blg-chips", role: "tablist", "aria-label": "Filter by topic" }, /* @__PURE__ */ React.createElement("button", { className: "blg-chip" + (tag === "" ? " active" : ""), onClick: () => setTag("") }, "All ", /* @__PURE__ */ React.createElement("span", { className: "blg-chip-n" }, ARTICLES.length)), tags.map((t) => /* @__PURE__ */ React.createElement("button", { key: t, className: "blg-chip" + (tag === t ? " active" : ""), onClick: () => setTag(tag === t ? "" : t) }, t, " ", /* @__PURE__ */ React.createElement("span", { className: "blg-chip-n" }, tagCounts[t]))))), filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "blg-noresults" }, /* @__PURE__ */ React.createElement("p", null, "No guides match ", q ? `"${query}"` : "that filter", tag ? ` in ${tag}` : "", "."), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => {
      setQuery("");
      setTag("");
    } }, "Clear filters")) : /* @__PURE__ */ React.createElement("div", { className: "seo-grid" }, filtered.map((a) => {
      const words = (a.sections || []).reduce((n, s) => n + ((s.body || "") + " " + (s.steps || []).join(" ") + " " + (s.bullets || []).join(" ")).split(/\s+/).length, 0);
      const mins = Math.max(2, Math.round(words / 200));
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: a.id,
          className: "seo-card",
          onClick: () => onOpen(a.id),
          role: "button",
          tabIndex: 0,
          onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && onOpen(a.id)
        },
        /* @__PURE__ */ React.createElement("div", { className: "seo-card-top" }, /* @__PURE__ */ React.createElement("span", { className: "tag" }, a.tag), /* @__PURE__ */ React.createElement("span", { className: "seo-readtime" }, mins, " min read")),
        /* @__PURE__ */ React.createElement("h3", null, a.title),
        /* @__PURE__ */ React.createElement("p", null, a.excerpt),
        /* @__PURE__ */ React.createElement("span", { className: "seo-card-cta" }, "Read guide \u2192")
      );
    }))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  function slugify(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function calloutIcon(t) {
    return t === "warn" ? "\u26A0\uFE0F" : t === "tip" ? "\u{1F4A1}" : t === "money" ? "\u{1F4B0}" : t === "key" ? "\u{1F511}" : "\u2139\uFE0F";
  }
  function fmt(text) {
    if (text == null) return null;
    const s = String(text);
    const out = [];
    let last = 0, m, k = 0;
    const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
    while (m = re.exec(s)) {
      if (m.index > last) out.push(s.slice(last, m.index));
      if (m[1]) out.push(/* @__PURE__ */ React.createElement("strong", { key: k++ }, m[1]));
      else {
        const ext = /^https?:/.test(m[3]);
        out.push(/* @__PURE__ */ React.createElement("a", { key: k++, href: m[3], target: ext ? "_blank" : void 0, rel: ext ? "noopener noreferrer" : void 0 }, m[2]));
      }
      last = m.index + m[0].length;
    }
    if (last < s.length) out.push(s.slice(last));
    return out;
  }
  function Paragraphs({ text }) {
    return String(text || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p, i) => /* @__PURE__ */ React.createElement("p", { key: i }, fmt(p)));
  }
  function Section({ s }) {
    return /* @__PURE__ */ React.createElement("section", { className: "blg-section" }, s.h && /* @__PURE__ */ React.createElement("h2", { id: slugify(s.h) }, s.h), s.body && /* @__PURE__ */ React.createElement(Paragraphs, { text: s.body }), s.callout && /* @__PURE__ */ React.createElement("div", { className: "blg-callout " + (s.callout.type || "info") }, /* @__PURE__ */ React.createElement("span", { className: "blg-callout-ic" }, calloutIcon(s.callout.type)), /* @__PURE__ */ React.createElement("div", null, fmt(s.callout.text))), Array.isArray(s.steps) && s.steps.length > 0 && /* @__PURE__ */ React.createElement("ol", { className: "blg-steps" }, s.steps.map((st, i) => /* @__PURE__ */ React.createElement("li", { key: i }, fmt(st)))), Array.isArray(s.bullets) && s.bullets.length > 0 && /* @__PURE__ */ React.createElement("ul", { className: "blg-bullets" }, s.bullets.map((b, i) => /* @__PURE__ */ React.createElement("li", { key: i }, fmt(b)))), s.table && Array.isArray(s.table.rows) && /* @__PURE__ */ React.createElement("div", { className: "blg-tablewrap" }, /* @__PURE__ */ React.createElement("table", { className: "blg-table" }, Array.isArray(s.table.headers) && /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, s.table.headers.map((h, i) => /* @__PURE__ */ React.createElement("th", { key: i }, h)))), /* @__PURE__ */ React.createElement("tbody", null, s.table.rows.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, r.map((c, j) => /* @__PURE__ */ React.createElement("td", { key: j }, fmt(c)))))))));
  }
  function Faq({ faqs }) {
    const [open, setOpen] = useState(0);
    return /* @__PURE__ */ React.createElement("div", { className: "blg-faq" }, /* @__PURE__ */ React.createElement("h2", null, "Frequently asked questions"), faqs.map((f, i) => {
      const q = Array.isArray(f) ? f[0] : f.q;
      const a = Array.isArray(f) ? f[1] : f.a;
      return /* @__PURE__ */ React.createElement("div", { key: i, className: "blg-faq-item" + (open === i ? " open" : "") }, /* @__PURE__ */ React.createElement("button", { className: "blg-faq-q", onClick: () => setOpen(open === i ? -1 : i), "aria-expanded": open === i }, /* @__PURE__ */ React.createElement("span", null, q), /* @__PURE__ */ React.createElement("span", { className: "blg-faq-ic" }, open === i ? "\u2212" : "+")), open === i && /* @__PURE__ */ React.createElement("div", { className: "blg-faq-a" }, fmt(a)));
    }));
  }
  function BlogArticle({ article, onNav, onBackToIndex, onOpen }) {
    if (!article) return null;
    const words = (article.sections || []).reduce((n, s) => n + ((s.body || "") + " " + (s.steps || []).join(" ") + " " + (s.bullets || []).join(" ")).split(/\s+/).length, 0);
    const mins = Math.max(3, Math.round(words / 200));
    const toc = (article.sections || []).filter((s) => s.h);
    let related = window.LP_relatedArticles(article, ARTICLES, 3);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(window.LP_TopBar, { current: "blog", onNav }), /* @__PURE__ */ React.createElement("div", { className: "seo-shell blg-shell" }, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement("a", { onClick: onBackToIndex, style: { color: "var(--accent)", cursor: "pointer", fontSize: 14, fontWeight: 600 } }, "\u2190 All guides")), /* @__PURE__ */ React.createElement("div", { className: "blg-head" }, /* @__PURE__ */ React.createElement("span", { className: "blg-tag" }, article.tag), /* @__PURE__ */ React.createElement("h1", null, article.title), /* @__PURE__ */ React.createElement("p", { className: "blg-excerpt" }, article.excerpt), /* @__PURE__ */ React.createElement("div", { className: "blg-meta" }, article.date ? /* @__PURE__ */ React.createElement("span", null, article.date) : null, article.date ? /* @__PURE__ */ React.createElement("span", { className: "dot" }, "\xB7") : null, /* @__PURE__ */ React.createElement("span", null, mins, " min read"), /* @__PURE__ */ React.createElement("span", { className: "dot" }, "\xB7"), /* @__PURE__ */ React.createElement("span", null, "LandingPrep"))), toc.length >= 4 && /* @__PURE__ */ React.createElement("nav", { className: "blg-toc" }, /* @__PURE__ */ React.createElement("div", { className: "blg-toc-t" }, "\u{1F4D1} On this page"), /* @__PURE__ */ React.createElement("ol", null, toc.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("a", { href: "#" + slugify(s.h) }, s.h))))), /* @__PURE__ */ React.createElement("div", { className: "seo-article-body blg-body" }, (article.sections || []).map((s, i) => /* @__PURE__ */ React.createElement(Section, { key: i, s }))), Array.isArray(article.faqs) && article.faqs.length > 0 && /* @__PURE__ */ React.createElement(Faq, { faqs: article.faqs }), /* @__PURE__ */ React.createElement("div", { className: "blg-cta" }, /* @__PURE__ */ React.createElement("h3", null, "Ready to put this into practice?"), /* @__PURE__ */ React.createElement("p", null, "Take a free mock test, check your eligibility with the College Predictor, or open the Learning Club for model answers \u2014 all 100% free."), /* @__PURE__ */ React.createElement("div", { className: "row-gap-12" }, /* @__PURE__ */ React.createElement("button", { className: "btn btn-primary", onClick: () => onNav("exams") }, "Free mock tests \u2192"), /* @__PURE__ */ React.createElement("button", { className: "btn", onClick: () => onNav("colleges") }, "Study-abroad tools \u2192"))), related.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "blg-related" }, /* @__PURE__ */ React.createElement("h2", null, "Keep reading"), /* @__PURE__ */ React.createElement("div", { className: "seo-grid" }, related.map((a) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: a.id,
        className: "seo-card",
        onClick: () => onOpen(a.id),
        role: "button",
        tabIndex: 0,
        onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && onOpen(a.id)
      },
      /* @__PURE__ */ React.createElement("div", { className: "seo-card-top" }, /* @__PURE__ */ React.createElement("span", { className: "tag" }, a.tag)),
      /* @__PURE__ */ React.createElement("h3", null, a.title),
      /* @__PURE__ */ React.createElement("p", null, a.excerpt),
      /* @__PURE__ */ React.createElement("span", { className: "seo-card-cta" }, "Read guide \u2192")
    ))))), /* @__PURE__ */ React.createElement(window.LP_Footer, null));
  }
  function BlogRouter({ onNav }) {
    const [openId, setOpenId] = useState(null);
    React.useEffect(() => {
      try {
        window.scrollTo(0, 0);
      } catch (e) {
      }
    }, [openId]);
    if (openId) {
      const article = ARTICLES.find((a) => a.id === openId);
      return /* @__PURE__ */ React.createElement(BlogArticle, { article, onNav, onBackToIndex: () => setOpenId(null), onOpen: setOpenId });
    }
    return /* @__PURE__ */ React.createElement(BlogIndex, { onNav, onOpen: setOpenId });
  }
  window.LP_Blog = BlogRouter;
  window.LP_ARTICLES = ARTICLES;
})();
