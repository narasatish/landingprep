"use strict";
(function() {
  const S = [
    { "id": "france-bgf-scholarship", "name": "BGF (Bourse du Gouvernement Fran\xE7ais) Master's Scholarship", "country": "France", "level": "Master's", "type": "Government", "amount": "\u20AC600\u20131,000/month + tuition waiver", "who": "International students from eligible countries enrolled in French public Master's programs", "deadline": "Varies (Spring for next academic year)", "highlight": "Covers living costs and tuition at public universities; competitive selection." },
    { "id": "france-erasmus-mundus", "name": "Erasmus Mundus Joint Master's Scholarships", "country": "France", "level": "Master's", "type": "Erasmus", "amount": "\u20AC1,400/month + full tuition", "who": "Students pursuing joint Master's degrees offered by European consortiums (many based in France)", "deadline": "December/January annually", "highlight": "Study across 2\u20133 European countries; includes mobility and living allowance." },
    { "id": "italy-italian-government", "name": "Italian Government Scholarship for International Students", "country": "Italy", "level": "Master's", "type": "Government", "amount": "\u20AC900\u20131,200/month + tuition waiver", "who": "International Master's students enrolled at public Italian universities; merit-based selection", "deadline": "March/April annually", "highlight": "Covers living costs and waives tuition; competitive pool." },
    { "id": "italy-sapienza-partnership", "name": "Sapienza University Partnership Scholarships (India Focus)", "country": "Italy", "level": "Master's", "type": "University", "amount": "\u20AC5,000\u201310,000/yr", "who": "Indian students pursuing Master's in Engineering, Computer Science, or Management at Sapienza", "deadline": "April annually", "highlight": "Dedicated partnership with Indian universities; partial tuition coverage." },
    { "id": "sweden-kth-excellence", "name": "KTH Excellence Scholarships", "country": "Sweden", "level": "Master's", "type": "University", "amount": "Fully funded (tuition + SEK 12,000/month)", "who": "High-achieving international students in engineering and tech Master's programs", "deadline": "December/January annually", "highlight": "Covers full tuition and living costs; limited availability; highly competitive." },
    { "id": "sweden-lund-scholarship", "name": "Lund University Global Scholarship Programme", "country": "Sweden", "level": "Master's", "type": "University", "amount": "SEK 80,000\u2013140,000/yr (~\u20AC8,000\u201314,000)", "who": "International Master's students at Lund; merit-based with emphasis on academic excellence", "deadline": "January annually", "highlight": "Partial or full tuition coverage; non-need-based merit scholarship." },
    { "id": "finland-futura-foundation", "name": "Foundation for Economic Education (SEFE) Scholarship", "country": "Finland", "level": "Master's", "type": "University", "amount": "Fully funded (tuition + \u20AC11,000/yr)", "who": "Outstanding international Master's students, especially in STEM and business", "deadline": "December annually", "highlight": "Covers tuition and living costs; emphasizes academic merit and potential." },
    { "id": "finland-aalto-scholarship", "name": "Aalto Doctoral & Master's Scholarship Program", "country": "Finland", "level": "Master's", "type": "University", "amount": "\u20AC5,000\u201315,000/yr + potential tuition waiver", "who": "International Master's applicants with strong academic records and research potential", "deadline": "January annually", "highlight": "Focus on innovation and sustainability-focused programs." },
    { "id": "denmark-dtu-excellence", "name": "DTU Excellence Scholarship", "country": "Denmark", "level": "Master's", "type": "University", "amount": "DKK 50,000\u2013120,000/yr (~\u20AC6,700\u201316,000) + possible tuition waiver", "who": "International engineering and science Master's students with exceptional credentials", "deadline": "January annually", "highlight": "Targets top performers in STEM; partial/full tuition support possible." },
    { "id": "denmark-cbs-scholarship", "name": "Copenhagen Business School Scholarship Programme", "country": "Denmark", "level": "Master's", "type": "University", "amount": "DKK 40,000\u201380,000/yr (~\u20AC5,300\u201310,700)", "who": "Master's students in business, economics, and management with strong academic profile", "deadline": "November annually", "highlight": "Merit-based; partial tuition coverage for qualifying candidates." },
    { "id": "uae-emirates-scholarship", "name": "UAE Government Higher Education Scholarship", "country": "United Arab Emirates", "level": "Master's", "type": "Government", "amount": "Fully funded (tuition + AED 10,000/month)", "who": "International Master's students in STEM, healthcare, and strategic sectors; limited slots", "deadline": "Varies (contact Ministry of Education)", "highlight": "Covers tuition and monthly stipend; highly selective; includes living allowance." },
    { "id": "uae-nyu-ad-scholarship", "name": "NYU Abu Dhabi Global Scholarship", "country": "United Arab Emirates", "level": "Master's", "type": "University", "amount": "AED 100,000\u2013220,000/yr (~\u20AC27,000\u201359,500 tuition coverage)", "who": "Master's applicants with exceptional academic and leadership potential", "deadline": "May annually", "highlight": "Need-based and merit-based awards; NYC-caliber education in Middle East hub." },
    { "id": "spain-la-caixa-foundation", "name": "La Caixa Foundation Scholarship for International Master's", "country": "Spain", "level": "Master's", "type": "Government", "amount": "\u20AC1,000\u20131,500/month + tuition waiver", "who": "International Master's students at participating Spanish universities; merit and need-based", "deadline": "April/May annually", "highlight": "Competitive; covers tuition and living costs for Spain's top institutions." },
    { "id": "spain-fundacion-carolina", "name": "Fundaci\xF3n Carolina Scholarship", "country": "Spain", "level": "Master's", "type": "Government", "amount": "\u20AC800\u20131,200/month + tuition waiver", "who": "International Master's students in engineering, business, and STEM from select countries", "deadline": "March annually", "highlight": "Emphasis on career development and Spain-home country economic ties." },
    { "id": "poland-meys-scholarship", "name": "Ministry of Education and Science (MES) Scholarship", "country": "Poland", "level": "Master's", "type": "Government", "amount": "\u20AC1,000\u20131,500/month", "who": "International Master's students in accredited Polish public universities", "deadline": "April/May annually", "highlight": "Government-funded; partial living support; limited slots." },
    { "id": "poland-poland-buddy", "name": "Polish Ministry/University Partnership Grants (India)", "country": "Poland", "level": "Master's", "type": "Government", "amount": "\u20AC3,000\u20136,000/yr + possible tuition waiver", "who": "Indian students pursuing Medicine, Engineering, or Computer Science Master's in Poland", "deadline": "May/June annually", "highlight": "Bilateral India-Poland initiative; priority for engineering and medical fields." },
    { "id": "czech-republic-meys", "name": "Czech Ministry of Education Scholarship", "country": "Czech Republic", "level": "Master's", "type": "Government", "amount": "CZK 15,000\u201325,000/month (~\u20AC600\u20131,000)", "who": "International Master's students at public Czech universities; merit-based selection", "deadline": "March/April annually", "highlight": "Covers partial living costs; government-funded; merit-based selection." },
    { "id": "czech-republic-charles-global", "name": "Charles University Global Scholarship Programme", "country": "Czech Republic", "level": "Master's", "type": "University", "amount": "CZK 20,000\u201330,000/month (~\u20AC800\u20131,200) + tuition waiver", "who": "High-achieving international Master's students across all disciplines", "deadline": "January/February annually", "highlight": "Prague's flagship university; merit-based; partial/full support based on profile." },
    // ─── USA ───
    // VERIFIED 2026-08-08 on foreign.fulbrightonline.org — NO CHANGES NEEDED. Confirmed graduate
    // level ("graduate students, young professionals and artists"), ~4,000 awards across 160+
    // countries, and that you "apply to the Fulbright Commissions/Foundations or U.S. Embassy" in
    // your home country rather than direct, with deadlines set "per established country/award
    // deadlines". The stored entry already said all of this correctly.
    { id: "fulbright", name: "Fulbright Foreign Student Program", country: "USA", level: "Master's & PhD", type: "Government", amount: "Fully funded", who: "International students; apply via your home-country Fulbright commission or US Embassy", deadline: "Feb\u2013Oct (varies by country)", highlight: "The flagship US government scholarship \u2014 tuition, living, airfare & insurance.", verified: "2026-08-08", official: "https://foreign.fulbrightonline.org/" },
    // VERIFIED 2026-08-08 on knight-hennessy.stanford.edu/admission/eligibility (via browser —
    // WebFetch gets 403). Confirmed genuinely open: "no restrictions based on age, college or
    // university, field of study, or career aspiration", all nationalities, no institutional
    // endorsement needed, no regional quotas. The gate the entry omitted is that KHS is NOT a
    // standalone award — you must separately apply to, be accepted by and enrol in a full-time
    // Stanford graduate programme, starting both the same year. Scope is wider than "Master's &
    // PhD": DMA, JD, MA, MBA, MD, MFA, MPP, MS and PhD all qualify.
    { id: "knight-hennessy", name: "Knight-Hennessy Scholars", country: "USA", level: "Any full-time Stanford graduate degree (MA, MS, MBA, JD, MD, MFA, MPP, PhD\u2026)", type: "University", amount: "Fully funded", who: "Open to all nationalities and ages, no endorsement needed \u2014 but you must separately win admission to a full-time Stanford graduate programme and start both in the same year", deadline: "October", highlight: "Stanford's elite fully-funded graduate scholarship across all schools.", verified: "2026-08-08", official: "https://knight-hennessy.stanford.edu/admission/eligibility" },
    { id: "aauw", name: "AAUW International Fellowships", country: "USA", level: "Master's & PhD", type: "Merit (Women)", amount: "$20,000\u201350,000", who: "Women who are not US citizens", deadline: "November", highlight: "Supports women pursuing graduate study in the US." },
    // VERIFIED 2026-08-08 on usief.org.in. The 3-years-experience gate was already right. What was
    // overstated is "Fully funded": USIEF states plainly that "USIEF funding may not cover all costs
    // and the fellow may need to supplement grant benefits with other resources." Also adds three
    // disqualifiers the entry never mentioned — a minimum of 55% marks, no existing US degree or
    // current enrolment in a US programme, and Indian government employees are ineligible.
    { id: "fulbright-nehru", name: "Fulbright-Nehru Master's Fellowship", country: "USA", level: "Master's", type: "Government", amount: "Tuition & fees, living costs, round-trip economy airfare, J-1 support and insurance \u2014 but USIEF says it may not cover everything", who: "Indian citizens with a bachelor's at 55%+ and 3+ years of full-time paid work experience. NOT eligible if you already hold or are enrolled in a US degree, or work for an Indian government entity", deadline: "Mid-May", highlight: "India-specific Fulbright track for a US master's.", verified: "2026-08-08", official: "https://www.usief.org.in/fulbright-nehru-masters-fellowships/" },
    // ─── UK ───
    // VERIFIED 2026-08-08 on chevening.org/scholarships/who-can-apply/eligibility (via browser —
    // WebFetch times out on this host). "Two years' work experience" was right but under-specified:
    // it is 2,800 HOURS, acquired AFTER the undergraduate degree. Two further gates were missing
    // entirely — you must apply to THREE different eligible UK courses and hold an unconditional
    // offer from one by the deadline, and you must commit to returning home for two years. Also
    // ineligible: British/dual-British citizens, UK residents at time of application, employees (and
    // close relatives) of a government department/British Council/partner university, and anyone
    // previously funded by a UK government scholarship.
    { id: "chevening", name: "Chevening Scholarship", country: "UK", level: "Master's (one year, taught)", type: "Government", amount: "Fully funded", who: "2 years' work experience (2,800 hours) after your bachelor's; must apply to THREE UK courses and hold an unconditional offer from one; must return home for 2 years afterwards. Not open to British/dual-British citizens or UK residents", deadline: "Early November", highlight: "The UK government's global one-year master's scholarship.", verified: "2026-08-08", official: "https://www.chevening.org/scholarships/who-can-apply/eligibility/" },
    // VERIFIED 2026-08-08 on cscuk.fcdo.gov.uk (Master's page): full approved tuition, living
    // allowance "£1,712 per month, or £2,000 per month for those at universities in the London
    // metropolitan area", return airfare, study-travel grant, child allowance. 42 Commonwealth
    // nations. Applications close 16:00 BST on 20 October. "Fully funded" was accurate but vague.
    { id: "commonwealth", name: "Commonwealth Scholarship", country: "UK", level: "Master's & PhD", type: "Government", amount: "Fully funded \u2014 full tuition + \xA31,712/month (\xA32,000 in London) + return airfare", who: "Citizens of the 42 eligible Commonwealth countries", deadline: "Closes 16:00 BST, 20 October", highlight: "Full funding for students from Commonwealth nations.", verified: "2026-08-08", official: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-masters-scholarships/" },
    // VERIFIED 2026-08-08 on gatescambridge.org: the University Composition Fee plus maintenance of
    // "£22,050 for 12 months at the 2025-26 rate", up to 4 years for PhD scholars, plus economy
    // airfare each way, visa costs and the Immigration Health Surcharge. "Fully funded" was fair.
    { id: "gates-cambridge", name: "Gates Cambridge Scholarship", country: "UK", level: "Master's & PhD", type: "University", amount: "Fully funded \u2014 Cambridge fees + \xA322,050/yr maintenance (2025-26), airfare, visa & health surcharge", who: "Outstanding applicants to Cambridge (non-UK)", deadline: "October/December", highlight: "Cambridge's most prestigious international scholarship.", verified: "2026-08-08", official: "https://www.gatescambridge.org/programme/the-scholarship/" },
    // VERIFIED 2026-08-08 on rhodeshouse.ox.ac.uk: Oxford course fees plus a stipend of "£20,400
    // per annum (£1,700 per month)" for 2025-26, plus visa fees, the Immigration Health Surcharge,
    // two economy flights and a settling-in allowance. "Fully funded" was fair. The LEVEL was wrong:
    // Rhodes covers the DPhil too (up to three years), not Master's only.
    { id: "rhodes", name: "Rhodes Scholarship", country: "UK", level: "Master's & DPhil", type: "University", amount: "Fully funded \u2014 Oxford fees + \xA320,400/yr stipend (2025-26), flights, visa & health surcharge", who: "Exceptional students from eligible countries (Oxford)", deadline: "July\u2013September", highlight: "The world's oldest graduate scholarship, at Oxford.", verified: "2026-08-08", official: "https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/" },
    { id: "clarendon", name: "Clarendon Fund Scholarship", country: "UK", level: "Master's & PhD", type: "University", amount: "Fully funded", who: "Any graduate course at Oxford; academic excellence", deadline: "Jan (course deadline)", highlight: "Oxford's flagship merit scholarship \u2014 automatic consideration." },
    // VERIFIED 2026-08-08 on study-uk.britishcouncil.org (via browser — WebFetch gets 403 here).
    // "£10,000 towards their tuition fees" — the bare "£10,000" could read as full funding, so it is
    // now explicit that it is a tuition contribution only, with living costs on you. 18 named
    // eligible countries; 140+ scholarships at 60+ UK universities for 2026-27; one-year TAUGHT
    // postgraduate courses; you apply to the university, not the British Council.
    { id: "great", name: "GREAT Scholarships", country: "UK", level: "Master's (one year, taught)", type: "Govt + University", amount: "\xA310,000 towards tuition only \u2014 living costs not covered", who: "Citizens of 18 countries: Bangladesh, China, Egypt, France, Ghana, Greece, India, Indonesia, Italy, Kenya, Malaysia, Mexico, Nigeria, Pakistan, Spain, Thailand, Turkey, Vietnam", deadline: "Varies by university \u2014 apply to the university direct", highlight: "British Council partial-funding for a one-year master's.", verified: "2026-08-08", official: "https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships" },
    // ─── Germany & Europe ───
    // VERIFIED 2026-08-08 on daad.de itself (scholarship database, EPOS entry): "monthly payments
    // of 992 euros" for graduates and "1,300 euros (1,400 euros beginning with February 2026)" for
    // doctoral candidates. The stored €934 was an older rate — stale, not wrong-by-invention.
    { id: "daad", name: "DAAD Scholarships", country: "Germany", level: "Master's & PhD", type: "Government", amount: "\u20AC992/month (Master's) \xB7 \u20AC1,400/month (PhD from Feb 2026)", who: "International graduates", deadline: "Varies (often Oct)", highlight: "Germany's main funding body \u2014 monthly stipend, plus health/accident/liability insurance and a travel allowance.", verified: "2026-08-08", official: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50076777" },
    // VERIFIED 2026-08-08 on erasmus-plus.ec.europa.eu: covers "participation costs" plus a
    // contribution to travel, visa and a living allowance; open worldwide to anyone holding (or
    // about to complete) a bachelor's. The "October and January" window matched what we had.
    // The EU page publishes NO euro figures centrally — each joint programme sets its own — so
    // the amount says that instead of implying a fixed sum.
    { id: "erasmus", name: "Erasmus Mundus Joint Masters", country: "Europe (Multiple)", level: "Master's", type: "EU Government", amount: "Participation costs + travel, visa and a living allowance (each consortium sets its own figures)", who: "Worldwide; need a bachelor's, or be graduating before the course starts. Study in 2+ European countries", deadline: "Usually October\u2013January, set per programme", highlight: "Prestigious multi-country EU master's.", verified: "2026-08-08", official: "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters" },
    // PARTIALLY VERIFIED 2026-08-08 on campusfrance.org. Confirmed: "Only applications submitted by
    // French higher education institutions are accepted" (you cannot self-apply), and age limits of
    // 29 for Master's / 35 for PhD. The €1,181 monthly figure is NOT stated on that page — it lives
    // in the annual "Eiffel Programme rules" PDF — so it stays flagged rather than asserted.
    { id: "eiffel", name: "Eiffel Excellence Scholarship", country: "France", level: "Master's & PhD", type: "Government", amount: "Monthly allowance (~\u20AC1,181 at Master's \u2014 confirm the current year's programme rules)", who: "Under 29 (Master's) / 35 (PhD); your French institution must nominate you \u2014 no self-application", deadline: "January", highlight: "French government scholarship for top international talent.", verified: "2026-08-08", official: "https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program" },
    // VERIFIED 2026-08-08 on sbfi.admin.ch: "CHF 2450.--/month" for both tracks. Two hard gates the
    // entry omitted — you must be UNDER 35, and for a Research Fellowship you must already hold a
    // Master's AND have secured an academic supervisor in Switzerland before applying. Applications
    // go through Swiss diplomatic representations, not direct, and are free of charge. Open from
    // 20 August 2026 for the 2027-28 round; decisions by 31 May. Open to 183 countries.
    { id: "swiss-excellence", name: "Swiss Government Excellence", country: "Switzerland", level: "PhD & Research (also Master's in the arts track)", type: "Government", amount: "CHF 2,450/month", who: "Under 35; Research Fellowship needs a completed Master's AND a Swiss supervisor secured in advance. Apply via your Swiss embassy, not direct", deadline: "Opens 20 August; decisions by 31 May", highlight: "Funds research/PhD at Swiss universities.", verified: "2026-08-08", official: "https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships" },
    // VERIFIED 2026-08-08 on studyinnl.org. Figures were already correct: "€5,000 ... in the first
    // year", one-off, non-EEA, bachelor's or master's, "not a full-tuition scholarship". Only the
    // NAME had changed — it is now the NL Scholarship. Deadlines are set per institution, not
    // centrally, so the old "February/May" was misleadingly specific.
    { id: "holland", name: "NL Scholarship (formerly Holland Scholarship)", country: "Netherlands", level: "UG & Master's", type: "Govt + University", amount: "\u20AC5,000, one-off, paid in year 1 (not full tuition)", who: "Non-EEA students on a full-time bachelor's or master's at a participating Dutch institution", deadline: "Set by each institution \u2014 check your university's own date", highlight: "Dutch government + university partial scholarship.", verified: "2026-08-08", official: "https://www.studyinnl.org/finances/nl-scholarship" },
    // ─── Canada ───
    {
      id: "vanier",
      name: "Vanier Canada Graduate Scholarship",
      country: "Canada",
      level: "PhD",
      type: "Government",
      amount: "CAD 50,000/yr (3 yrs) \u2014 closed",
      who: "Doctoral students; leadership + research",
      deadline: "Closed \u2014 final competition fall 2024",
      highlight: "Canada's former flagship doctoral scholarship, discontinued after the fall 2024 competition and replaced by the Canada Graduate Research Scholarship \u2013 Doctoral.",
      // Verified 2026-08-08 against the University of Toronto SGS award page and the official
      // NSERC funding-opportunity page. vanier.gc.ca no longer resolves. Kept (not deleted)
      // because people still search "Vanier scholarship" and need to be told it is gone and
      // what took its place — that is the most useful thing this URL can now do.
      discontinued: {
        // Explicit short title: the 60-char clamp ate the word "Discontinued" from the
        // generated one, which is the single most important thing a searcher must see.
        title: "Vanier Scholarship Discontinued (2025)",
        // Explicit description too — the generated one ran past the 160-char budget and got
        // clamped to "It is replaced by the…", losing the answer the searcher came for.
        desc: "Vanier Canada Graduate Scholarship: discontinued after fall 2024. Replaced by the Canada Graduate Research Scholarship \u2013 Doctoral, CAD 40,000/yr.",
        finalCompetition: "fall 2024 (results released mid-April 2025)",
        replacedByName: "Canada Graduate Research Scholarship \u2013 Doctoral (CGRS-D)",
        replacedByAmount: "CAD 40,000 per year for 36 months",
        replacedByDeadline: "17 October (agency deadline; Canadian institutions set earlier internal dates)",
        replacedByWho: "Doctoral applicants with no more than 36 months of full-time-equivalent doctoral study by 31 December of the application year. International applicants are eligible, but up to 15% of awards are available to them.",
        replacedByUrl: "https://nserc-crsng.canada.ca/en/funding-opportunity/canada-graduate-research-scholarship-doctoral-program"
      }
    },
    // VERIFIED 2026-08-08 on future.utoronto.ca: covers "tuition, books, incidental fees and full
    // residence support for four years"; ~37 scholars a year. The critical omission was the
    // NOMINATION requirement — your high school must nominate you and may nominate only ONE student
    // per year, and you must separately apply for U of T admission by an earlier date. Someone
    // reading the old entry would not know they cannot apply directly.
    { id: "pearson", name: "Lester B. Pearson Scholarship", country: "Canada", level: "Undergraduate", type: "University", amount: "Fully funded \u2014 tuition, books, incidental fees and full residence for 4 years", who: "International students starting UG at U of T, still in/just out of secondary school \u2014 your SCHOOL must nominate you (one per school)", deadline: "Early November (separate U of T admission application due mid-October)", highlight: "U of Toronto's premier international UG award \u2014 ~37 scholars a year.", verified: "2026-08-08", official: "https://future.utoronto.ca/pearson-scholarships" },
    // VERIFIED 2026-08-08 against nserc-crsng.canada.ca. Two corrections, both material:
    // the programme is now the harmonised Canada Graduate RESEARCH Scholarship (CAD 27,000 for
    // 12 months at Master's, CAD 40,000/yr for 36 months at Doctoral — not "17,500–50,000"), and
    // crucially it is CLOSED TO INTERNATIONAL STUDENTS: "a Canadian citizen, a permanent resident
    // of Canada or a Protected Person" as of the deadline. On a site whose readers are
    // international applicants, the old wording ("Master's & doctoral students") invited people to
    // spend effort on something they cannot receive. Deadline is 1 December, 20:00 ET.
    { id: "cgs", name: "Canada Graduate Research Scholarship (CGRS)", country: "Canada", level: "Master's & PhD", type: "Government", amount: "CAD 27,000 (Master's) \xB7 CAD 40,000/yr (Doctoral)", who: "Canadian citizens, permanent residents and Protected Persons ONLY \u2014 international students are not eligible", deadline: "1 December (20:00 ET)", highlight: "Canada's harmonised federal graduate award, replacing CGS-M/CGS-D and the Vanier CGS. Not open to international students.", verified: "2026-08-08", official: "https://nserc-crsng.canada.ca/en/funding-opportunity/canada-graduate-research-scholarship-masters-program" },
    // ─── Australia & NZ ───
    // VERIFIED 2026-08-08 on dfat.gov.au (via browser — WebFetch times out). Benefits confirmed:
    // full tuition, return economy airfare, a one-off establishment allowance, a fortnightly
    // Contribution to Living Expenses, the compulsory Introductory Academic Program, Overseas
    // Student Health Cover and pre-course English if needed. The LEVEL was wrong — it funds
    // "full time undergraduate or postgraduate study", not Master's only, and includes TAFE as well
    // as universities. Targeted at partner developing countries, particularly the Indo-Pacific.
    { id: "australia-awards", name: "Australia Awards", country: "Australia", level: "UG / Master's / PhD (universities and TAFE)", type: "Government", amount: "Fully funded \u2014 tuition, return airfare, establishment allowance, fortnightly living contribution, health cover", who: "Citizens of partner developing countries, particularly in the Indo-Pacific", deadline: "April\u2013June", highlight: "Australian govt scholarship \u2014 tuition, living, travel.", verified: "2026-08-08", official: "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships" },
    // VERIFIED 2026-08-08 on education.gov.au (via browser — WebFetch times out). "Fully funded +
    // stipend" overstated it: a student "can be offered RTP scholarships for ONE OR MORE of the
    // following: tuition fees offset, a stipend for general living costs, allowances" — so a tuition
    // offset alone is a legitimate RTP award. Also, applications "cannot be made through the
    // Department of Education"; you apply to the university direct. Support runs 3–4 years, and it
    // does cover overseas as well as domestic HDR students.
    { id: "rtp", name: "Research Training Program (RTP)", country: "Australia", level: "Master's & PhD (research/HDR only)", type: "Government", amount: "One or more of: tuition offset, living stipend, allowances \u2014 not guaranteed to be all three", who: "Domestic & overseas research students. Apply to the UNIVERSITY, not the Department of Education", deadline: "Set by each university (commonly Aug\u2013Oct)", highlight: "Funds research degrees at Australian universities for 3\u20134 years.", verified: "2026-08-08", official: "https://www.education.gov.au/research-block-grants/research-training-program" },
    // PARTIALLY VERIFIED 2026-08-08 on nzscholarships.govt.nz (now branded Manaaki New Zealand
    // Scholarships). Confirmed it funds "undergraduate and postgraduate study" — the stored
    // "Master's & PhD" wrongly excluded undergraduates — plus short-term training and English
    // language training for officials. Coverage detail and the eligible-country list are behind
    // further pages and are NOT asserted here; application windows are set per country/round.
    { id: "nz-scholarships", name: "Manaaki New Zealand Scholarships", country: "New Zealand", level: "UG / Master's / PhD", type: "Government", amount: "Fully funded (confirm the exact package for your country's round)", who: "Citizens of eligible countries \u2014 the list and dates vary by round", deadline: "Varies by country round \u2014 check the official site", highlight: "NZ government scholarship covering study and living costs.", verified: "2026-08-08", official: "https://www.nzscholarships.govt.nz/" },
    // ─── Asia ───
    // VERIFIED 2026-08-08 on studyinjapan.go.jp (MEXT page): research students receive
    // "¥143,000～145,000 per month", plus tuition exemption and round-trip airfare. Two routes
    // confirmed: embassy recommendation, or recommendation by a MEXT-approved Japanese university.
    // The undergraduate rate on that page read as ¥242,000, which is far above the usually-quoted
    // UG figure and may belong to an adjacent table row — so it is deliberately NOT asserted here.
    { id: "mext", name: "MEXT Scholarship", country: "Japan", level: "UG / Master's / PhD", type: "Government", amount: "Fully funded \u2014 tuition exemption + \xA5143,000\u2013145,000/month (research students) + round-trip airfare", who: "International students; embassy route or MEXT-approved university recommendation", deadline: "April\u2013June (embassy route)", highlight: "Japanese government scholarship \u2014 no tuition + monthly stipend.", verified: "2026-08-08", official: "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/" },
    // VERIFIED 2026-08-08 on schwarzmanscholars.org/admissions: master's at Tsinghua, Beijing.
    // Age "at least 18 but not yet 29 years of age as of August 1" of the enrolment year, an
    // undergraduate degree, and English proficiency (TOEFL 100, IELTS 7, Duolingo 130 or Cambridge
    // C1/C2 185). Deadline 9 September, 15:00 EDT for US/Global; Chinese citizens apply Jan–May.
    // The page does not itemise what the award covers, so "fully funded" is left unquantified.
    { id: "schwarzman", name: "Schwarzman Scholars", country: "China", level: "Master's", type: "University", amount: "Fully funded", who: "Under 29 on 1 August of enrolment year, with a bachelor's and IELTS 7 / TOEFL 100 (Tsinghua University)", deadline: "9 September (US & Global); Jan\u2013May for Chinese citizens", highlight: "One-year fully-funded master's in global affairs in Beijing.", verified: "2026-08-08", official: "https://www.schwarzmanscholars.org/admissions/" },
    // ─── For Indian students (study anywhere) ───
    // VERIFIED 2026-08-08 on inlaksfoundation.org: covers "tuition fees, living expenses, one-way
    // travel, visa costs and health allowance, up to USD 120,000" — the stored $100,000 understated
    // it. Eligibility is tighter than "under 30": Indian passport holder resident in India at
    // application, born on or after 1 Jan 1996, bachelor's from a recognised Indian university with
    // 65% (Social Sciences/Humanities/Law/Fine Arts/Architecture) or 70% (Maths/Sciences/
    // Environment), and admission already in hand. The 2026 round is closed.
    { id: "inlaks", name: "Inlaks Shivdasani Scholarship", country: "USA / UK / Europe", level: "Master's", type: "Merit + Need", amount: "Up to USD 120,000 (tuition, living, one-way travel, visa, health)", who: "Indian passport holders resident in India, born on or after 1 Jan 1996, with admission already secured and 65\u201370% in their bachelor's (varies by discipline)", deadline: "Annual round; 2026 intake now closed", highlight: "Prestigious Indian scholarship for study at top global universities.", verified: "2026-08-08", official: "https://inlaksfoundation.org/scholarships/" },
    // VERIFIED 2026-08-08 on kcmet.org (via browser). "Up to ₹10 lakh" was true only for THREE
    // people: "Up to ₹10 lakh for the top 3 K. C. Mahindra Fellows / Up to ₹5 lakh for other
    // awardees", with at least 50 awards a year. Quoting the ₹10 lakh ceiling alone set a reader's
    // expectation at double the realistic figure. Also newly extended — it now covers postgraduate
    // study at select premier institutions WITHIN India, not only abroad. It is an interest-free
    // LOAN scholarship (repayable), which the entry did say. Requires a First-Class degree.
    { id: "kc-mahindra", name: "KC Mahindra Scholarship", country: "Multiple", level: "Master's", type: "Merit + Need", amount: "Interest-free LOAN: up to \u20B95 lakh for most awardees; up to \u20B910 lakh for the top 3 Fellows only", who: "Indian citizens with a First-Class degree, for postgraduate study abroad \u2014 or now at select premier institutions in India", deadline: "March\u2013April", highlight: "Long-running Indian interest-free loan scholarship \u2014 50+ awards a year, 1,830+ scholars to date.", verified: "2026-08-08", official: "https://www.kcmet.org/what-we-do-Scholarship-Grants.aspx?tab=0" },
    // VERIFIED 2026-08-08 on the.akdn: "structured as half grant and half loan – where you need to
    // repay 50 percent of the award amount" — the 50/50 split was right. Two things were not: PhD
    // support runs only "for the first two years, after which you are expected to find funding from
    // alternative sources", and the eligible-country list is specific, not "select developing
    // countries". The 2026-27 cycle is CLOSED (next opens early 2027), so "often March" misled.
    { id: "aga-khan", name: "Aga Khan Foundation ISP", country: "Multiple", level: "Master's (PhD considered, first 2 years only)", type: "Need-based", amount: "50% grant + 50% loan \u2014 you repay half", who: "Nationals of Afghanistan, Bangladesh, Egypt, India, Kenya, Kyrgyzstan, Madagascar, Mozambique, Pakistan, Syria, Tajikistan, Tanzania, Uganda (plus Australia/NZ, and Canada/Portugal/USA if originally from those countries)", deadline: "2026-27 cycle closed; next cycle opens early 2027", highlight: "Need-based support for postgraduate study abroad.", verified: "2026-08-08", official: "https://the.akdn/en/what-we-do/developing-human-capacity/education/international-scholarships" }
  ];
  window.LP_SCHOLARSHIPS = S;
  window.LP_SCHOLARSHIP_COUNTRIES = [...new Set(S.map((s) => s.country))];
})();
