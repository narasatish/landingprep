/* global window */
"use strict";

// LandingPrep — extra blog articles (country admission & immigration changes).
// Plain data so both the in-app blog and the static SEO generator can read it.
// Schema: { id, tag, title, excerpt, kw, sections:[{h, body}] }
(function () {
  const EXTRA = [
    {
      id: "canada-study-permit-changes-2026", tag: "Immigration", date: "2026",
      title: "Canada Study Permit Changes 2025–26: Caps, PAL, GIC & PGWP Explained",
      excerpt: "Canada tightened its international-student rules. Here's exactly what changed — study-permit caps, the Provincial Attestation Letter, higher proof-of-funds, and PGWP field restrictions — and how to plan around it.",
      kw: "canada study permit changes 2026, provincial attestation letter, canada gic 2026, pgwp changes, canada student visa cap",
      sections: [
        { h: "Study-permit cap", body: "Canada introduced a national cap on new study permits (around 437,000 for 2025), allocated to provinces by population. This means more competition for letters of acceptance from designated learning institutions (DLIs). Apply early and to multiple DLIs to improve your odds." },
        { h: "Provincial Attestation Letter (PAL)", body: "Most undergraduate and college applicants now need a Provincial Attestation Letter (PAL) — issued by the province — as part of the study-permit application. Your DLI typically helps obtain it after you accept the offer and pay the deposit. Master's and PhD applicants have been exempt in several provinces, but confirm current rules." },
        { h: "Higher proof of funds (GIC)", body: "The cost-of-living requirement for a study permit rose to CAD 20,635 (up from CAD 10,000) on top of first-year tuition. The Guaranteed Investment Certificate (GIC) route remains the simplest way to show living funds for SDS-style applications." },
        { h: "PGWP field restrictions", body: "The Post-Graduation Work Permit (up to 3 years) is now more closely tied to programs linked to long-term labour shortages, and language-test requirements were added. Public-college programs delivered via curriculum-licensing arrangements lost PGWP eligibility. Check your specific program's PGWP status before enrolling." },
        { h: "Spousal work permits", body: "Open work permits for spouses of international students were restricted to spouses of master's, doctoral, and select professional-program students. Plan family finances accordingly." },
        { h: "What this means for you", body: "Canada still offers one of the clearest student-to-PR pathways via Express Entry, but the bar is higher. Target PGWP-eligible programs at strong DLIs, budget for the higher GIC, and keep your IELTS/CELPIP score high to maximise CRS points. Practise free on LandingPrep." }
      ]
    },
    {
      id: "uk-graduate-route-visa-2026", tag: "Immigration", date: "2026",
      title: "UK Student & Graduate Route Visa in 2026: Dependants, Salary & Stay-Back",
      excerpt: "The UK kept its 2-year Graduate Route but tightened other rules. What master's students need to know about dependants, the Skilled Worker salary threshold, and post-study work.",
      kw: "uk graduate route 2026, uk student visa dependants, skilled worker salary threshold, uk post study work visa",
      sections: [
        { h: "Graduate Route retained", body: "After a government review, the UK retained the Graduate Route — 2 years of post-study work (3 for PhD) with no sponsorship or salary requirement. It remains one of the biggest draws of UK study for international students." },
        { h: "Dependants banned for most master's", body: "Since January 2024, students on most taught master's programmes can no longer bring dependants (spouse/children). Exceptions apply to research-based postgraduate programmes and government-sponsored students." },
        { h: "Skilled Worker salary threshold up", body: "To move from the Graduate Route to a sponsored Skilled Worker visa (the path to settlement), the general salary threshold rose to £38,700. New-entrant and shortage-occupation discounts can lower this — research roles in your field before committing." },
        { h: "One-year master's advantage", body: "UK master's degrees are typically one year, saving a year of tuition and living costs versus 2-year programmes elsewhere. Combined with the Graduate Route, that's up to 3 years in the UK from a single year of study." },
        { h: "Settlement (ILR)", body: "Indefinite Leave to Remain is generally available after 5 years of qualifying residence on eligible work visas. Plan your Graduate Route → Skilled Worker transition early, ideally with an employer who sponsors." },
        { h: "Plan your score", body: "UK universities want IELTS UKVI 6.5–7.5 depending on the programme. Take a free IELTS mock on LandingPrep to check where you stand." }
      ]
    },
    {
      id: "australia-genuine-student-2026", tag: "Immigration", date: "2026",
      title: "Australia Student Visa 2026: Genuine Student Test, Savings & 485 Work Visa",
      excerpt: "Australia replaced the GTE with the Genuine Student (GS) requirement and raised savings thresholds. Here's how to prepare a strong Subclass 500 application.",
      kw: "australia genuine student test, subclass 500 visa 2026, australia savings requirement, 485 graduate visa, study in australia",
      sections: [
        { h: "Genuine Student (GS) requirement", body: "In March 2024 the Genuine Temporary Entrant (GTE) statement was replaced by the Genuine Student (GS) requirement. You answer structured questions about your circumstances, choice of course and how it fits your goals. Write specific, honest, well-evidenced answers — generic statements raise red flags." },
        { h: "Higher savings requirement", body: "The financial-capacity requirement for a Subclass 500 student visa rose to AUD 29,710 in living funds (in addition to tuition and travel). Keep funds in a stable account with a clear money trail." },
        { h: "English requirements raised", body: "Minimum English-test scores for the student and post-study work visas were increased. Most universities want IELTS 6.5 overall; some programmes and the 485 visa now expect higher bands. Check the specific requirement and practise free on LandingPrep." },
        { h: "Temporary Graduate visa (485)", body: "The post-study work visa (Subclass 485) gives 2–4 years of work rights depending on your qualification and where you studied (regional areas get longer). It's the bridge to skilled migration." },
        { h: "Skilled migration & PR", body: "Permanent residence runs through points-tested skilled visas (189 Independent, 190 State-Nominated, 491 Regional). Points come from age, English, qualifications and work experience — a high IELTS/PTE score is one of the easiest ways to add points." },
        { h: "Caps on the horizon", body: "International-student commencement caps have been discussed. Apply early, choose CRICOS-registered providers, and keep your documentation impeccable." }
      ]
    },
    {
      id: "germany-opportunity-card-2026", tag: "Immigration", date: "2026",
      title: "Germany Opportunity Card (Chancenkarte) 2026: Points-Based Job Seeking",
      excerpt: "Germany launched the points-based Opportunity Card to attract skilled workers and graduates. Here's how it works alongside tuition-free study and the Blue Card route to PR.",
      kw: "germany opportunity card, chancenkarte 2026, germany blue card, study in germany free, germany pr for indians",
      sections: [
        { h: "Tuition-free study", body: "Public universities in Germany charge little or no tuition (typically €150–350/semester in administrative fees), even for international students. You mainly budget for living costs via a blocked account (€11,904/year)." },
        { h: "Opportunity Card (Chancenkarte)", body: "Launched in June 2024, the Opportunity Card is a points-based visa that lets qualified non-EU nationals enter Germany to look for work for up to a year. Points come from qualification, German/English skills, age and experience. It complements the 18-month post-study job-seeker visa graduates already get." },
        { h: "18-month job-seeker visa", body: "After graduating from a German university, you can stay 18 months to find a job related to your field, working any job meanwhile to support yourself." },
        { h: "EU Blue Card → PR", body: "Land a qualifying job above the salary threshold and you get the EU Blue Card. Permanent residence can follow in as little as 21 months (with B1 German) or 33 months — among the fastest PR timelines in the developed world." },
        { h: "GRE for some programmes", body: "Many German MS programmes (especially in data and engineering) request or recommend the GRE, plus IELTS 6.5. Get an APS certificate (mandatory for Indian applicants) early." },
        { h: "Why Germany is booming for Indians", body: "A growing share of Indian students now choose Germany over the US/UK for its cost, strong engineering industry and clear PR path. Practise your IELTS and GRE free on LandingPrep." }
      ]
    },
    {
      id: "usa-f1-opt-2026", tag: "Immigration", date: "2026",
      title: "USA F-1 Visa & OPT in 2026: Scrutiny, STEM OPT and the H-1B Path",
      excerpt: "Studying in the US in 2026 means more visa scrutiny but the same powerful STEM OPT and H-1B opportunities. Here's how to prepare a clean F-1 application and plan your work pathway.",
      kw: "usa f1 visa 2026, stem opt 36 months, h1b lottery, study in usa, opt work permit",
      sections: [
        { h: "More visa scrutiny", body: "US student-visa interviews now include closer documentation checks and social-media vetting. Apply early, keep your finances and intentions clearly documented, and be ready to articulate your study and career plan in the interview." },
        { h: "OPT and STEM OPT", body: "Optional Practical Training gives 12 months of work authorisation after graduation; STEM-designated degrees add a 24-month extension for a total of 36 months — the longest runway among major destinations to find an employer and enter the H-1B lottery multiple times." },
        { h: "H-1B work visa", body: "The H-1B is the main route from study to long-term work, allocated by an annual lottery. Registration rules were tightened to a beneficiary-centric system to curb multiple entries and improve fairness. A STEM degree dramatically improves your odds via the 3 OPT years." },
        { h: "Green Card reality", body: "Employer-sponsored Green Cards (EB-2/EB-3) have long backlogs for Indian nationals. High achievers may qualify faster via EB-1 or a National Interest Waiver (EB-2 NIW). Plan a long horizon and pick employers who sponsor early." },
        { h: "Cost & funding", body: "US tuition runs $30,000–60,000/year. Assistantships, on-campus work (20 hrs/week) and scholarships offset costs — use our free Scholarship Finder. Education loans from Prodigy/MPOWER need no collateral for top universities." },
        { h: "Test scores", body: "Most US graduate programmes want IELTS 7.0 / TOEFL 100, with GRE optional at many. Practise free on LandingPrep and use the College Predictor to target the right schools." }
      ]
    },
    {
      id: "ielts-band-7-in-30-days", tag: "IELTS", date: "2026",
      title: "How to Get IELTS Band 7 in 30 Days: A Free Day-by-Day Study Plan",
      excerpt: "A realistic 30-day plan to reach IELTS Band 7, with daily tasks for Listening, Reading, Writing and Speaking — using only free resources.",
      kw: "ielts band 7 in 30 days, ielts study plan, how to get band 7 in ielts, ielts preparation 1 month, free ielts study plan",
      sections: [
        { h: "Can you really hit Band 7 in 30 days?", body: "Yes, if you already sit around Band 6–6.5 and study 2–3 focused hours daily. Band 7 means no band below 6.5 for most universities — so the fastest gains come from fixing your two weakest skills, not polishing your strongest. Start with a free full mock to find them." },
        { h: "Week 1 — Diagnose & fundamentals", body: "Take a baseline mock, learn the exact format and timing of each section, and drill the basics: skimming and scanning for Reading, note-taking for Listening, and a clear 4-paragraph Task 2 structure. Build a daily 20-word academic vocabulary habit." },
        { h: "Week 2 — Writing & Speaking (the score-killers)", body: "Most students lose Band 7 in Writing and Speaking. Write one Task 2 essay daily, score it with the rubric, and use the free AI Writing Agent for feedback on Task Response, Coherence, Lexical Resource and Grammar. Record three Speaking answers a day and review fluency and pronunciation." },
        { h: "Week 3 — Reading & Listening accuracy", body: "Drill True/False/Not-Given and matching-headings (the biggest Reading traps), and gap-fill Listening for spelling, numbers and plurals. Always review every wrong answer and justify the correct one with the exact line." },
        { h: "Week 4 — Full mocks under exam conditions", body: "Sit a timed full mock every two to three days, review thoroughly, and re-drill weak question types. Final two days: light review, sleep well, and prepare your ID and test-day logistics." },
        { h: "Start free", body: "Build this exact plan automatically with the free LandingPrep Study Planner, then practise with 60 free IELTS mock tests and instant scoring." }
      ]
    },
    {
      id: "ielts-vs-toefl-vs-pte", tag: "Comparison", date: "2026",
      title: "IELTS vs TOEFL vs PTE in 2026: Which English Test Should You Take?",
      excerpt: "A clear comparison of IELTS, TOEFL iBT and PTE Academic — acceptance, format, cost, difficulty and which test suits you best.",
      kw: "ielts vs toefl vs pte, which english test is easiest, ielts or pte, toefl vs ielts for usa, best english test for study abroad",
      sections: [
        { h: "Quick answer", body: "Choose IELTS or TOEFL if you want the widest university and visa acceptance. Choose PTE if you want fast (often 48-hour) AI-scored results and prefer a fully computer-based test. Choose the Duolingo English Test if you want the cheapest, fastest at-home option and your universities accept it. Always confirm acceptance for your exact universities and visa." },
        { h: "Acceptance", body: "IELTS and TOEFL are accepted almost everywhere. PTE Academic is accepted by 3,000+ universities and Australian, UK and New Zealand visas. Duolingo is accepted by 5,500+ institutions but not all, and rarely for visas." },
        { h: "Format & speaking", body: "IELTS Speaking is face-to-face with an examiner; TOEFL and PTE record your voice for a computer to score. If you freeze talking to a person, PTE/TOEFL may suit you; if you prefer a human, pick IELTS." },
        { h: "Difficulty", body: "No test is objectively 'easiest' — it depends on your strengths. PTE's AI scoring rewards clear pronunciation and fluency; IELTS Writing rewards structure and vocabulary; TOEFL integrates reading/listening into speaking and writing. Take a free practice test of each on LandingPrep to see where you score highest." },
        { h: "Cost & results", body: "Fees are broadly similar (~$200–240); the Duolingo Test is much cheaper (~$65). PTE and Duolingo return results fastest (often 1–2 days); IELTS and TOEFL take a few days to two weeks." },
        { h: "Bottom line", body: "Pick the test your target universities accept, that plays to your strengths, and that fits your timeline. Practise all of them free on LandingPrep before you decide." }
      ]
    },
    {
      id: "how-to-write-sop", tag: "Applications", date: "2026",
      title: "How to Write a Statement of Purpose (SOP): Step-by-Step Guide + Template",
      excerpt: "A proven structure for writing a Statement of Purpose that gets admits — with a paragraph-by-paragraph template and the mistakes to avoid.",
      kw: "how to write sop, statement of purpose sample, sop for ms, sop structure, sop template study abroad",
      sections: [
        { h: "What admissions committees actually want", body: "A strong SOP answers four questions clearly: why this field, why you're prepared, why this exact program and university, and what you'll do after. It must be specific and evidence-based — not a list of adjectives. Aim for 800–1,000 words." },
        { h: "Paragraph 1 — A specific hook", body: "Open with a concrete moment (a project, a problem you solved) that sparked your goal. Avoid clichés like 'since childhood' or 'I have always been passionate'. Show, don't tell." },
        { h: "Paragraphs 2–3 — Background & evidence", body: "Connect your degree, key projects, internships and any publications to your goal. Quantify results ('improved recall from 61% to 88%'). Each example should show a skill the program values." },
        { h: "Paragraph 4 — Why this program", body: "Name specific courses, labs, professors and facilities — and why they fit your goals. This is the paragraph most applicants get lazy about; it's also the one that separates real applicants from copy-paste ones." },
        { h: "Paragraph 5 — Career goals", body: "State a clear short-term and long-term goal, and how this degree bridges them. Keep it credible and specific to your field." },
        { h: "Build yours free", body: "Use the free LandingPrep SOP Builder to draft from your inputs, the SOP Checker for an AI review and cliché scan, and study nine full-length sample SOPs across countries and programs." }
      ]
    },
    {
      id: "cheapest-countries-to-study-abroad", tag: "Study Abroad", date: "2026",
      title: "Cheapest Countries to Study Abroad in 2026 (Tuition + Living Costs)",
      excerpt: "Where can you study abroad on a tight budget? A 2026 ranking of affordable destinations with tuition, living costs, work rights and PR pathways.",
      kw: "cheapest countries to study abroad, affordable study abroad 2026, study abroad on a budget, free tuition countries, cheapest masters abroad",
      sections: [
        { h: "Quick answer", body: "For the lowest total cost, Germany leads — public universities are almost tuition-free, and you mainly budget living costs (~€11,900/yr). Other affordable, high-value destinations include Ireland and the Netherlands in Europe, plus strong scholarship options in Canada and Australia. Always model total cost minus scholarships, not just tuition." },
        { h: "Germany — near-free tuition", body: "Public universities charge only small semester fees (€150–350). You show ~€11,904 in a blocked account for living costs. Add a strong engineering industry and a fast Blue Card PR route, and Germany offers exceptional value." },
        { h: "Ireland & Netherlands", body: "Both are English-taught EU hubs with strong tech and business sectors and post-study stay-back (Ireland's Stamp 1G for 2 years; the Dutch orientation-year visa for 1 year). Tuition is moderate (€10,000–20,000) and far below the US/UK." },
        { h: "Canada & Australia — scholarships matter", body: "Tuition is higher, but generous scholarships, part-time work rights and clear PR pathways improve the long-term ROI. Use the free Scholarship Finder and the Cost & ROI calculator to compare." },
        { h: "Hidden costs to budget", body: "Beyond tuition, plan for living costs, health insurance, visa fees, flights, deposits and proof-of-funds. The cheapest sticker price isn't always the cheapest total." },
        { h: "Compare free", body: "Use LandingPrep's free Compare Countries tool to weigh tuition, living costs, work rights, PR speed and visa success side by side." }
      ]
    },
    {
      id: "fully-funded-scholarships-study-abroad", tag: "Scholarships", date: "2026",
      title: "How to Get a Fully Funded Scholarship to Study Abroad in 2026",
      excerpt: "A practical guide to winning fully funded scholarships — types, eligibility, timelines and how to write a winning application.",
      kw: "fully funded scholarships 2026, how to get scholarship to study abroad, free scholarships for international students, fully funded masters scholarship",
      sections: [
        { h: "Quick answer", body: "Fully funded scholarships cover tuition plus a living stipend (and sometimes travel). The strongest routes are government scholarships (Chevening, DAAD, Fulbright, Australia Awards), university merit and assistantship funding, and field-specific grants. Apply 12–18 months before your intake, to several at once." },
        { h: "Types of funding", body: "Government scholarships are prestigious and fully funded but competitive. University assistantships (teaching/research) waive tuition and pay a stipend — common for MS/PhD. Departmental merit scholarships reduce tuition partially. Need-based aid and external grants round out the mix." },
        { h: "Eligibility levers you control", body: "Strong grades, a high IELTS/GRE score, relevant research or work, leadership, and a compelling SOP. Many awards also reward giving back to your home country — make that explicit." },
        { h: "Timeline", body: "Most major scholarships open 12–18 months ahead and close before university deadlines. Build a calendar, prepare documents early (transcripts, SOP, LORs, scores), and never miss a deadline." },
        { h: "Write to win", body: "Tailor every essay to the scholarship's mission, lead with a specific story, quantify impact, and state exactly how you'll use the award and what you'll do afterwards." },
        { h: "Find yours free", body: "Use the free LandingPrep Scholarship Finder filtered by your country, and lift your test score with free IELTS/GRE mocks to strengthen every application." }
      ]
    },
    {
      id: "gre-2026-format-study-plan", tag: "GRE", date: "2026",
      title: "GRE in 2026: New Shorter Format, Scoring and a Free Study Plan",
      excerpt: "Everything about the shorter GRE — sections, timing, scoring, and a free study plan to hit a competitive score.",
      kw: "gre 2026 format, shorter gre, gre scoring, gre study plan, gre verbal quant preparation, gre for ms",
      sections: [
        { h: "Quick answer", body: "The GRE is now a shorter test of about 1 hour 58 minutes with fewer questions and no separate unscored/research section. It still scores Verbal and Quant on 130–170 each (260–340 total) plus one Analytical Writing task on 0–6. Many programs now list it as optional, so check before you commit." },
        { h: "The shorter format", body: "The current GRE dropped the long unscored sections, so plan about two hours including check-in. You get one Analytical Writing 'Analyze an Issue' task, two Verbal sections and two Quant sections, with on-screen calculator and a section-level adaptive design." },
        { h: "What's a good score?", body: "Competitive STEM applicants often target 160+ Quant; humanities value high Verbal. Top programs look for 320+ combined, but always check your specific program's averages — and whether the GRE is required at all." },
        { h: "Study plan", body: "Spend the first week on fundamentals and a baseline mock, the middle weeks drilling your weakest of Verbal/Quant with daily error logs, and the final week on full timed mocks. Learn 25 high-frequency words a day for Verbal." },
        { h: "Analytical Writing", body: "Outline first, take a clear position, support it with two or three specific examples, and use clean transitions. Study high-scoring samples and write one essay under time every few days." },
        { h: "Practise free", body: "Take free GRE mock tests on LandingPrep with Verbal, Quant and Analytical Writing, and build a personalised plan with the free Study Planner." }
      ]
    },
    {
      id: "study-abroad-without-ielts", tag: "Study Abroad", date: "2026",
      title: "Study Abroad Without IELTS in 2026: Countries & Universities That Accept Alternatives",
      excerpt: "Can you study abroad without IELTS? Yes — here are the accepted alternatives and how universities waive the English test.",
      kw: "study abroad without ielts, universities without ielts, study in usa without ielts, ielts waiver, alternatives to ielts",
      sections: [
        { h: "Quick answer", body: "Yes, many universities accept alternatives to IELTS — TOEFL, PTE, the Duolingo English Test, or a waiver if you studied previously in English (a medium-of-instruction or MOI letter). Some also accept a video interview. Always confirm the exact policy with each university before applying." },
        { h: "Accepted alternatives", body: "TOEFL iBT and PTE Academic are accepted almost as widely as IELTS. The Duolingo English Test is cheaper and at-home, accepted by 5,500+ institutions. Confirm minimum scores per program." },
        { h: "English-medium waiver (MOI)", body: "If your previous degree was taught entirely in English, many universities waive the English test with a Medium of Instruction letter from your institution. Policies vary widely — get it in writing from the admissions office." },
        { h: "Country notes", body: "Several universities in the USA, UK, Canada, Germany, Ireland and Australia offer waivers or accept alternatives, but student visas (UKVI, etc.) may still require a Secure English Language Test. Don't assume a university waiver covers the visa." },
        { h: "Don't skip prep", body: "Even with a waiver, strong English helps your SOP, interviews and studies. A good PTE or Duolingo score is fast and inexpensive — practise free on LandingPrep." },
        { h: "Check eligibility free", body: "Use the free Score & Eligibility tool to convert any score and see which universities and visas you qualify for." }
      ]
    },
    {
      id: "education-loan-study-abroad", tag: "Funding", date: "2026",
      title: "Education Loan for Studying Abroad: How to Choose & Compare Lenders (2026)",
      excerpt: "A clear guide to education loans for studying abroad — collateral vs non-collateral, interest rates, and how to compare lenders and EMI.",
      kw: "education loan for abroad studies, study abroad loan, collateral free education loan, education loan interest rates, abroad study loan emi",
      sections: [
        { h: "Quick answer", body: "Education loans for abroad study come in two forms: secured (with collateral, lower rates, higher limits up to ₹1.5 crore) and unsecured (no collateral, faster, smaller limits, higher rates). Compare interest rate, processing fee, moratorium, repayment tenure and margin — not just the headline rate — and always estimate your EMI first." },
        { h: "Secured vs unsecured", body: "Secured loans from public banks (SBI, BoB, PNB) offer the lowest rates (~10.5–11.5%) and biggest limits but need property/FD collateral and take longer. Unsecured loans from NBFCs (HDFC Credila, Avanse, Auxilo) and international lenders (Prodigy, MPOWER) are faster and need no collateral, at higher rates." },
        { h: "What to compare", body: "Interest rate (fixed vs floating), processing fee, moratorium (repayment holiday during study + grace), total repayment tenure, margin money you must fund yourself, and prepayment terms. A lower rate with a long moratorium can beat a slightly cheaper rate without one." },
        { h: "Tax & documents", body: "In India, education-loan interest is deductible under Section 80E. Keep your admission letter, fee structure, co-applicant income proof and collateral documents ready to speed up sanction." },
        { h: "International lenders", body: "Prodigy Finance and MPOWER offer no-collateral, no-co-signer loans in USD for students at top global universities — useful when domestic collateral isn't an option, though rates are higher." },
        { h: "Compare free", body: "Use the free LandingPrep Loans & Costs tool to compare 10 lenders side by side, estimate your EMI, and model the payback with the Cost & ROI calculator." }
      ]
    },
    {
      id: "duolingo-english-test-guide", tag: "Duolingo", date: "2026",
      title: "Duolingo English Test 2026: Score Chart, Accepting Universities & Tips",
      excerpt: "The Duolingo English Test explained — format, score chart vs IELTS/TOEFL, which universities accept it, and how to score higher.",
      kw: "duolingo english test, duolingo score chart, det vs ielts, universities accepting duolingo, duolingo english test tips",
      sections: [
        { h: "Quick answer", body: "The Duolingo English Test (DET) is a cheaper (~$65), faster (results in ~2 days) at-home English test scored 10–160. It's accepted by 5,500+ institutions including many top universities, but not all — and rarely for visas. Confirm your universities accept it and their minimum score before booking." },
        { h: "Score chart (approximate)", body: "DET 120 ≈ IELTS 7.0 / TOEFL 95; DET 105 ≈ IELTS 6.5 / TOEFL 80; DET 135 ≈ IELTS 7.5+. Most universities ask for 105–120. Use the free Score & Eligibility converter for exact equivalents." },
        { h: "Format", body: "The DET is adaptive — questions get harder or easier based on your answers — and mixes reading, listening, speaking and writing tasks, plus an interactive interview and writing sample reviewed by the institution. The whole test takes about an hour." },
        { h: "Who accepts it", body: "Thousands of universities in the USA, Canada, UK, Ireland and Australia accept the DET for admission. Always check the specific program page; some competitive programs still prefer IELTS/TOEFL." },
        { h: "Tips to score higher", body: "Speak clearly and at length (don't stop early), use varied vocabulary and grammar, manage the strict timers, and prepare your quiet, well-lit room to meet the test's proctoring rules." },
        { h: "Practise free", body: "Take free Duolingo-style practice on LandingPrep and convert your target score to IELTS/TOEFL with the free Score & Eligibility tool." }
      ]
    },
    {
      id: "best-countries-study-abroad-2026", tag: "Study Abroad", date: "2026",
      title: "Best Countries to Study Abroad in 2026: Cost, Work Rights & PR Compared",
      excerpt: "A clear, no-hype comparison of the top study destinations — tuition, living cost, post-study work length, and how easy it is to stay long-term. Pick the country that fits your goal and budget.",
      kw: "best countries to study abroad 2026, cheapest country to study abroad, study abroad with work rights, post study work visa comparison, study abroad PR pathway",
      sections: [
        { h: "How to choose", body: "Don't pick by ranking alone. Weigh four things: total cost (tuition + living), how many hours you can work while studying, the length of the post-study work visa, and how realistic permanent residency is. The right country depends on whether your goal is the cheapest degree, the best job market, or settling long-term." },
        { h: "USA", body: "Highest earning potential and research strength, but also the highest cost. F-1 students get up to 3 years of OPT (STEM). PR is competitive (H-1B lottery → green card). Best for top STEM students aiming high." },
        { h: "Canada", body: "Strong student-to-PR pathway via Express Entry, though 2025–26 rules tightened (caps, higher funds). PGWP up to 3 years. Mid-range cost. Best for those prioritising settlement." },
        { h: "UK", body: "One-year master's saves money and time; 2-year Graduate Route to work after. Settlement needs a sponsored Skilled Worker job (£38,700+). Best for fast, focused master's study." },
        { h: "Germany & Europe", body: "Public universities in Germany charge little to no tuition; you mainly fund living costs. An 18-month job-seeker visa follows graduation. Best for budget-conscious students comfortable with some German." },
        { h: "Australia & New Zealand", body: "Good lifestyle, strong work rights, and post-study work visas (2–4 years). Higher living costs in big cities. Solid PR points systems. Best for a balanced study-work-settle plan." },
        { h: "Next step", body: "Use LandingPrep's free College Predictor and Cost & ROI calculator to compare real universities and total costs for your shortlist — then take a free mock test for the exam they require." }
      ]
    },
    {
      id: "how-to-get-scholarship-study-abroad", tag: "Scholarships", date: "2026",
      title: "How to Get a Scholarship to Study Abroad: A Step-by-Step 2026 Guide",
      excerpt: "Most students never apply for the scholarships they'd actually win. Here's the practical system — where to find them, what wins, and how to write an application that stands out.",
      kw: "how to get scholarship to study abroad, fully funded scholarships 2026, scholarship application tips, merit scholarships international students, study abroad funding",
      sections: [
        { h: "Start 12 months early", body: "The biggest reason students miss scholarships is timing — many close 8–10 months before the intake. Build a calendar of deadlines the moment you shortlist universities. LandingPrep's Scholarship finder lists deadlines so you don't miss them." },
        { h: "Three types worth targeting", body: "1) University merit scholarships (automatic or by application — often the easiest to win). 2) Government schemes (Chevening, Fulbright, DAAD, Australia Awards — prestigious, competitive). 3) Private/NGO and country-specific awards (smaller but less contested). Apply to all three tiers, not just the famous ones." },
        { h: "What actually wins", body: "Strong academics matter, but committees pick people, not transcripts. A clear goal, evidence of leadership or impact, and a specific reason you chose that programme beat a generic 'I am hardworking' essay every time. Quantify everything — 'raised ₹2 lakh for a clinic' beats 'did social work'." },
        { h: "Write a sharp essay", body: "Open with a specific moment, not a cliché. State your goal, why this scholarship enables it, and what you'll give back. Mirror the scholarship's values in your examples. Keep one essay per scholarship — never send a copy-paste." },
        { h: "Get strong recommenders", body: "Pick referees who can give specific stories about you, and give them your CV, goal, and a deadline reminder. A vivid, detailed letter from a lecturer who knows you beats a vague one from a famous name." },
        { h: "Use the free tools", body: "Find awards with LandingPrep's Scholarship finder, draft your essay with the SOP builder, and polish it — all free. Apply to 10+ scholarships; the more strong applications you send, the better your odds." }
      ]
    },
    {
      id: "ielts-vs-pte-which-easier-2026", tag: "IELTS", date: "2026",
      title: "IELTS vs PTE in 2026: Which Is Easier and Which Should You Take?",
      excerpt: "IELTS and PTE are both widely accepted — but they suit different people. Compare scoring, speaking format, results speed, and who each test favours, so you book the right one.",
      kw: "ielts vs pte, which is easier ielts or pte, pte vs ielts 2026, pte academic for student visa, ielts or pte for australia canada",
      sections: [
        { h: "Quick verdict", body: "If you're nervous about a face-to-face speaking exam and want fast, computer-scored results, PTE often feels easier. If you prefer a human examiner and lots of free practice material, IELTS may suit you. Both are accepted for most universities and visas in the UK, Australia, Canada and New Zealand — confirm your specific programme." },
        { h: "Speaking format", body: "IELTS Speaking is a live 11–14 minute interview with a human examiner. PTE Speaking is recorded and scored by AI, with tasks like Read Aloud and Repeat Sentence. Confident speakers who freeze on tech may prefer IELTS; those who dislike face-to-face exams prefer PTE." },
        { h: "Scoring & accuracy", body: "IELTS uses 0–9 bands marked partly by humans. PTE uses 10–90 AI scoring that rewards clear pronunciation and fluency mechanically — you can 'game' it with technique. PTE's integrated tasks score multiple skills at once, so high-leverage tasks (Read Aloud, Repeat Sentence) lift your whole score." },
        { h: "Results speed", body: "PTE typically returns results in 2–5 days; IELTS computer-delivered in 3–5 days, paper-based in up to 13 days. If you're racing a visa or admission deadline, PTE's speed can matter." },
        { h: "Which to pick", body: "Take a free practice section of each on LandingPrep and see which scoring style fits you. Strong pronunciation + comfort with computers → PTE. Prefer human interaction + abundant prep resources → IELTS. There's no universally 'easier' test — only the one that fits you." },
        { h: "Practise both free", body: "LandingPrep has free IELTS and PTE mock tests with instant scoring and an AI speaking partner — try both before you pay the booking fee." }
      ]
    }
  ];

  window.LP_BLOG_EXTRA = EXTRA;
})();
