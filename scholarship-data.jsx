/* global window */
"use strict";

// LandingPrep — curated scholarship dataset for the Scholarship Finder.
// Figures are INDICATIVE; always confirm on the official scholarship site.
// Schema: { id, name, country, level, type, amount, who, deadline, highlight }
(function () {
  const S = [
{"id":"france-bgf-scholarship","name":"BGF (Bourse du Gouvernement Français) Master's Scholarship","country":"France","level":"Master's","type":"Government","amount":"€600–1,000/month + tuition waiver","who":"International students from eligible countries enrolled in French public Master's programs","deadline":"Varies (Spring for next academic year)","highlight":"Covers living costs and tuition at public universities; competitive selection."},
{"id":"france-erasmus-mundus","name":"Erasmus Mundus Joint Master's Scholarships","country":"France","level":"Master's","type":"Erasmus","amount":"€1,400/month + full tuition","who":"Students pursuing joint Master's degrees offered by European consortiums (many based in France)","deadline":"December/January annually","highlight":"Study across 2–3 European countries; includes mobility and living allowance."},
{"id":"italy-italian-government","name":"Italian Government Scholarship for International Students","country":"Italy","level":"Master's","type":"Government","amount":"€900–1,200/month + tuition waiver","who":"International Master's students enrolled at public Italian universities; merit-based selection","deadline":"March/April annually","highlight":"Covers living costs and waives tuition; competitive pool."},
{"id":"italy-sapienza-partnership","name":"Sapienza University Partnership Scholarships (India Focus)","country":"Italy","level":"Master's","type":"University","amount":"€5,000–10,000/yr","who":"Indian students pursuing Master's in Engineering, Computer Science, or Management at Sapienza","deadline":"April annually","highlight":"Dedicated partnership with Indian universities; partial tuition coverage."},
{"id":"sweden-kth-excellence","name":"KTH Excellence Scholarships","country":"Sweden","level":"Master's","type":"University","amount":"Fully funded (tuition + SEK 12,000/month)","who":"High-achieving international students in engineering and tech Master's programs","deadline":"December/January annually","highlight":"Covers full tuition and living costs; limited availability; highly competitive."},
{"id":"sweden-lund-scholarship","name":"Lund University Global Scholarship Programme","country":"Sweden","level":"Master's","type":"University","amount":"SEK 80,000–140,000/yr (~€8,000–14,000)","who":"International Master's students at Lund; merit-based with emphasis on academic excellence","deadline":"January annually","highlight":"Partial or full tuition coverage; non-need-based merit scholarship."},
{"id":"finland-futura-foundation","name":"Foundation for Economic Education (SEFE) Scholarship","country":"Finland","level":"Master's","type":"University","amount":"Fully funded (tuition + €11,000/yr)","who":"Outstanding international Master's students, especially in STEM and business","deadline":"December annually","highlight":"Covers tuition and living costs; emphasizes academic merit and potential."},
{"id":"finland-aalto-scholarship","name":"Aalto Doctoral & Master's Scholarship Program","country":"Finland","level":"Master's","type":"University","amount":"€5,000–15,000/yr + potential tuition waiver","who":"International Master's applicants with strong academic records and research potential","deadline":"January annually","highlight":"Focus on innovation and sustainability-focused programs."},
{"id":"denmark-dtu-excellence","name":"DTU Excellence Scholarship","country":"Denmark","level":"Master's","type":"University","amount":"DKK 50,000–120,000/yr (~€6,700–16,000) + possible tuition waiver","who":"International engineering and science Master's students with exceptional credentials","deadline":"January annually","highlight":"Targets top performers in STEM; partial/full tuition support possible."},
{"id":"denmark-cbs-scholarship","name":"Copenhagen Business School Scholarship Programme","country":"Denmark","level":"Master's","type":"University","amount":"DKK 40,000–80,000/yr (~€5,300–10,700)","who":"Master's students in business, economics, and management with strong academic profile","deadline":"November annually","highlight":"Merit-based; partial tuition coverage for qualifying candidates."},
{"id":"uae-emirates-scholarship","name":"UAE Government Higher Education Scholarship","country":"United Arab Emirates","level":"Master's","type":"Government","amount":"Fully funded (tuition + AED 10,000/month)","who":"International Master's students in STEM, healthcare, and strategic sectors; limited slots","deadline":"Varies (contact Ministry of Education)","highlight":"Covers tuition and monthly stipend; highly selective; includes living allowance."},
{"id":"uae-nyu-ad-scholarship","name":"NYU Abu Dhabi Global Scholarship","country":"United Arab Emirates","level":"Master's","type":"University","amount":"AED 100,000–220,000/yr (~€27,000–59,500 tuition coverage)","who":"Master's applicants with exceptional academic and leadership potential","deadline":"May annually","highlight":"Need-based and merit-based awards; NYC-caliber education in Middle East hub."},
{"id":"spain-la-caixa-foundation","name":"La Caixa Foundation Scholarship for International Master's","country":"Spain","level":"Master's","type":"Government","amount":"€1,000–1,500/month + tuition waiver","who":"International Master's students at participating Spanish universities; merit and need-based","deadline":"April/May annually","highlight":"Competitive; covers tuition and living costs for Spain's top institutions."},
{"id":"spain-fundacion-carolina","name":"Fundación Carolina Scholarship","country":"Spain","level":"Master's","type":"Government","amount":"€800–1,200/month + tuition waiver","who":"International Master's students in engineering, business, and STEM from select countries","deadline":"March annually","highlight":"Emphasis on career development and Spain-home country economic ties."},
{"id":"poland-meys-scholarship","name":"Ministry of Education and Science (MES) Scholarship","country":"Poland","level":"Master's","type":"Government","amount":"€1,000–1,500/month","who":"International Master's students in accredited Polish public universities","deadline":"April/May annually","highlight":"Government-funded; partial living support; limited slots."},
{"id":"poland-poland-buddy","name":"Polish Ministry/University Partnership Grants (India)","country":"Poland","level":"Master's","type":"Government","amount":"€3,000–6,000/yr + possible tuition waiver","who":"Indian students pursuing Medicine, Engineering, or Computer Science Master's in Poland","deadline":"May/June annually","highlight":"Bilateral India-Poland initiative; priority for engineering and medical fields."},
{"id":"czech-republic-meys","name":"Czech Ministry of Education Scholarship","country":"Czech Republic","level":"Master's","type":"Government","amount":"CZK 15,000–25,000/month (~€600–1,000)","who":"International Master's students at public Czech universities; merit-based selection","deadline":"March/April annually","highlight":"Covers partial living costs; government-funded; merit-based selection."},
{"id":"czech-republic-charles-global","name":"Charles University Global Scholarship Programme","country":"Czech Republic","level":"Master's","type":"University","amount":"CZK 20,000–30,000/month (~€800–1,200) + tuition waiver","who":"High-achieving international Master's students across all disciplines","deadline":"January/February annually","highlight":"Prague's flagship university; merit-based; partial/full support based on profile."},

    // ─── USA ───
    { id: "fulbright", name: "Fulbright Foreign Student Program", country: "USA", level: "Master's & PhD", type: "Government", amount: "Fully funded", who: "International students; apply via your home-country Fulbright commission", deadline: "Feb–Oct (varies by country)", highlight: "The flagship US government scholarship — tuition, living, airfare & insurance." , official: "https://foreign.fulbrightonline.org/"},
    { id: "knight-hennessy", name: "Knight-Hennessy Scholars", country: "USA", level: "Master's & PhD", type: "University", amount: "Fully funded", who: "Any graduate programme at Stanford; strong leadership", deadline: "October", highlight: "Stanford's elite fully-funded graduate scholarship across all schools." , official: "https://knight-hennessy.stanford.edu/"},
    { id: "aauw", name: "AAUW International Fellowships", country: "USA", level: "Master's & PhD", type: "Merit (Women)", amount: "$20,000–50,000", who: "Women who are not US citizens", deadline: "November", highlight: "Supports women pursuing graduate study in the US." },
    { id: "fulbright-nehru", name: "Fulbright-Nehru Master's Fellowship", country: "USA", level: "Master's", type: "Government", amount: "Fully funded", who: "Indian citizens with 3+ yrs experience", deadline: "May", highlight: "India-specific Fulbright track — fully funded US master's." , official: "https://www.usief.org.in/"},

    // ─── UK ───
    { id: "chevening", name: "Chevening Scholarship", country: "UK", level: "Master's", type: "Government", amount: "Fully funded", who: "Leadership potential + 2 yrs work experience", deadline: "November", highlight: "The UK government's global one-year master's scholarship." , official: "https://www.chevening.org/"},
    { id: "commonwealth", name: "Commonwealth Scholarship", country: "UK", level: "Master's & PhD", type: "Government", amount: "Fully funded", who: "Citizens of Commonwealth countries", deadline: "October–December", highlight: "Full funding for students from Commonwealth nations." , official: "https://cscuk.fcdo.gov.uk/"},
    { id: "gates-cambridge", name: "Gates Cambridge Scholarship", country: "UK", level: "Master's & PhD", type: "University", amount: "Fully funded", who: "Outstanding applicants to Cambridge (non-UK)", deadline: "October/December", highlight: "Cambridge's most prestigious international scholarship." , official: "https://www.gatescambridge.org/"},
    // VERIFIED 2026-08-08 on rhodeshouse.ox.ac.uk: Oxford course fees plus a stipend of "£20,400
// per annum (£1,700 per month)" for 2025-26, plus visa fees, the Immigration Health Surcharge,
// two economy flights and a settling-in allowance. "Fully funded" was fair. The LEVEL was wrong:
// Rhodes covers the DPhil too (up to three years), not Master's only.
{ id: "rhodes", name: "Rhodes Scholarship", country: "UK", level: "Master's & DPhil", type: "University", amount: "Fully funded — Oxford fees + £20,400/yr stipend (2025-26), flights, visa & health surcharge", who: "Exceptional students from eligible countries (Oxford)", deadline: "July–September", highlight: "The world's oldest graduate scholarship, at Oxford.", verified: "2026-08-08" , official: "https://www.rhodeshouse.ox.ac.uk/scholarships/the-rhodes-scholarship/"},
    { id: "clarendon", name: "Clarendon Fund Scholarship", country: "UK", level: "Master's & PhD", type: "University", amount: "Fully funded", who: "Any graduate course at Oxford; academic excellence", deadline: "Jan (course deadline)", highlight: "Oxford's flagship merit scholarship — automatic consideration." },
    { id: "great", name: "GREAT Scholarships", country: "UK", level: "Master's", type: "Govt + University", amount: "£10,000", who: "Select countries incl. India", deadline: "Varies by university", highlight: "British Council partial-funding for one-year master's." , official: "https://study-uk.britishcouncil.org/scholarships-funding/great-scholarships"},

    // ─── Germany & Europe ───
    // VERIFIED 2026-08-08 on daad.de itself (scholarship database, EPOS entry): "monthly payments
// of 992 euros" for graduates and "1,300 euros (1,400 euros beginning with February 2026)" for
// doctoral candidates. The stored €934 was an older rate — stale, not wrong-by-invention.
{ id: "daad", name: "DAAD Scholarships", country: "Germany", level: "Master's & PhD", type: "Government", amount: "€992/month (Master's) · €1,400/month (PhD from Feb 2026)", who: "International graduates", deadline: "Varies (often Oct)", highlight: "Germany's main funding body — monthly stipend, plus health/accident/liability insurance and a travel allowance.", verified: "2026-08-08" , official: "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?detail=50076777"},
    { id: "erasmus", name: "Erasmus Mundus Joint Masters", country: "Europe (Multiple)", level: "Master's", type: "EU Government", amount: "Fully funded", who: "Study in 2+ European countries", deadline: "Oct–Jan", highlight: "Prestigious multi-country EU master's, fully funded." , official: "https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters"},
    { id: "eiffel", name: "Eiffel Excellence Scholarship", country: "France", level: "Master's & PhD", type: "Government", amount: "€1,181/month", who: "International students; nominated by the institution", deadline: "January", highlight: "French government scholarship for top international talent." , official: "https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program"},
    { id: "swiss-excellence", name: "Swiss Government Excellence", country: "Switzerland", level: "PhD & Research", type: "Government", amount: "Fully funded", who: "Researchers & postgrads from eligible countries", deadline: "Sep–Dec", highlight: "Funds research/PhD at Swiss universities." , official: "https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships"},
    // VERIFIED 2026-08-08 on studyinnl.org. Figures were already correct: "€5,000 ... in the first
// year", one-off, non-EEA, bachelor's or master's, "not a full-tuition scholarship". Only the
// NAME had changed — it is now the NL Scholarship. Deadlines are set per institution, not
// centrally, so the old "February/May" was misleadingly specific.
{ id: "holland", name: "NL Scholarship (formerly Holland Scholarship)", country: "Netherlands", level: "UG & Master's", type: "Govt + University", amount: "€5,000, one-off, paid in year 1 (not full tuition)", who: "Non-EEA students on a full-time bachelor's or master's at a participating Dutch institution", deadline: "Set by each institution — check your university's own date", highlight: "Dutch government + university partial scholarship.", verified: "2026-08-08" , official: "https://www.studyinnl.org/finances/nl-scholarship"},

    // ─── Canada ───
    { id: "vanier", name: "Vanier Canada Graduate Scholarship", country: "Canada", level: "PhD", type: "Government", amount: "CAD 50,000/yr (3 yrs) — closed", who: "Doctoral students; leadership + research", deadline: "Closed — final competition fall 2024", highlight: "Canada's former flagship doctoral scholarship, discontinued after the fall 2024 competition and replaced by the Canada Graduate Research Scholarship – Doctoral.",
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
        desc: "Vanier Canada Graduate Scholarship: discontinued after fall 2024. Replaced by the Canada Graduate Research Scholarship – Doctoral, CAD 40,000/yr.",
        finalCompetition: "fall 2024 (results released mid-April 2025)",
        replacedByName: "Canada Graduate Research Scholarship – Doctoral (CGRS-D)",
        replacedByAmount: "CAD 40,000 per year for 36 months",
        replacedByDeadline: "17 October (agency deadline; Canadian institutions set earlier internal dates)",
        replacedByWho: "Doctoral applicants with no more than 36 months of full-time-equivalent doctoral study by 31 December of the application year. International applicants are eligible, but up to 15% of awards are available to them.",
        replacedByUrl: "https://nserc-crsng.canada.ca/en/funding-opportunity/canada-graduate-research-scholarship-doctoral-program",
      } },
    { id: "pearson", name: "Lester B. Pearson Scholarship", country: "Canada", level: "Undergraduate", type: "University", amount: "Fully funded", who: "Exceptional international undergrads (U of Toronto)", deadline: "November", highlight: "U of Toronto's premier international UG award." , official: "https://future.utoronto.ca/pearson-scholarships"},
    // VERIFIED 2026-08-08 against nserc-crsng.canada.ca. Two corrections, both material:
// the programme is now the harmonised Canada Graduate RESEARCH Scholarship (CAD 27,000 for
// 12 months at Master's, CAD 40,000/yr for 36 months at Doctoral — not "17,500–50,000"), and
// crucially it is CLOSED TO INTERNATIONAL STUDENTS: "a Canadian citizen, a permanent resident
// of Canada or a Protected Person" as of the deadline. On a site whose readers are
// international applicants, the old wording ("Master's & doctoral students") invited people to
// spend effort on something they cannot receive. Deadline is 1 December, 20:00 ET.
{ id: "cgs", name: "Canada Graduate Research Scholarship (CGRS)", country: "Canada", level: "Master's & PhD", type: "Government", amount: "CAD 27,000 (Master's) · CAD 40,000/yr (Doctoral)", who: "Canadian citizens, permanent residents and Protected Persons ONLY — international students are not eligible", deadline: "1 December (20:00 ET)", highlight: "Canada's harmonised federal graduate award, replacing CGS-M/CGS-D and the Vanier CGS. Not open to international students.", verified: "2026-08-08" , official: "https://nserc-crsng.canada.ca/en/funding-opportunity/canada-graduate-research-scholarship-masters-program"},

    // ─── Australia & NZ ───
    { id: "australia-awards", name: "Australia Awards", country: "Australia", level: "Master's", type: "Government", amount: "Fully funded", who: "Developing-country citizens", deadline: "April–June", highlight: "Australian govt scholarship — tuition, living, travel." , official: "https://www.dfat.gov.au/people-to-people/australia-awards"},
    { id: "rtp", name: "Research Training Program (RTP)", country: "Australia", level: "Master's & PhD (research)", type: "Government", amount: "Fully funded + stipend", who: "Domestic & international research students", deadline: "Aug–Oct", highlight: "Funds research degrees at Australian universities." , official: "https://www.education.gov.au/research-block-grants/research-training-program"},
    { id: "nz-scholarships", name: "New Zealand Scholarships", country: "New Zealand", level: "Master's & PhD", type: "Government", amount: "Fully funded", who: "Citizens of eligible countries", deadline: "Feb–March", highlight: "NZ government full scholarship including living costs." , official: "https://www.nzscholarships.govt.nz/"},

    // ─── Asia ───
    { id: "mext", name: "MEXT Scholarship", country: "Japan", level: "UG / Master's / PhD", type: "Government", amount: "Fully funded", who: "International students; embassy or university route", deadline: "April–June", highlight: "Japanese government scholarship — no tuition + monthly stipend." , official: "https://www.studyinjapan.go.jp/en/planning/scholarships/"},
    { id: "schwarzman", name: "Schwarzman Scholars", country: "China", level: "Master's", type: "University", amount: "Fully funded", who: "Future global leaders (Tsinghua University)", deadline: "September", highlight: "One-year fully-funded master's in global affairs in Beijing." , official: "https://www.schwarzmanscholars.org/"},

    // ─── For Indian students (study anywhere) ───
    // VERIFIED 2026-08-08 on inlaksfoundation.org: covers "tuition fees, living expenses, one-way
// travel, visa costs and health allowance, up to USD 120,000" — the stored $100,000 understated
// it. Eligibility is tighter than "under 30": Indian passport holder resident in India at
// application, born on or after 1 Jan 1996, bachelor's from a recognised Indian university with
// 65% (Social Sciences/Humanities/Law/Fine Arts/Architecture) or 70% (Maths/Sciences/
// Environment), and admission already in hand. The 2026 round is closed.
{ id: "inlaks", name: "Inlaks Shivdasani Scholarship", country: "USA / UK / Europe", level: "Master's", type: "Merit + Need", amount: "Up to USD 120,000 (tuition, living, one-way travel, visa, health)", who: "Indian passport holders resident in India, born on or after 1 Jan 1996, with admission already secured and 65–70% in their bachelor's (varies by discipline)", deadline: "Annual round; 2026 intake now closed", highlight: "Prestigious Indian scholarship for study at top global universities.", verified: "2026-08-08" , official: "https://inlaksfoundation.org/scholarships/"},
    { id: "kc-mahindra", name: "KC Mahindra Scholarship", country: "Multiple", level: "Master's", type: "Merit + Need", amount: "Up to ₹10 lakh (interest-free)", who: "Indian graduates going abroad", deadline: "March–April", highlight: "Long-running Indian scholarship loan for overseas master's." , official: "https://www.kcmet.org/index.aspx"},
    { id: "aga-khan", name: "Aga Khan Foundation ISP", country: "Multiple", level: "Master's & PhD", type: "Need-based", amount: "50% grant + 50% loan", who: "Students from select developing countries", deadline: "Varies (often March)", highlight: "Need-based support for postgraduate study abroad." , official: "https://the.akdn/en/what-we-do/developing-human-capacity/education/international-scholarships"},
  ];

  window.LP_SCHOLARSHIPS = S;
  window.LP_SCHOLARSHIP_COUNTRIES = [...new Set(S.map(s => s.country))];
})();
