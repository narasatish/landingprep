"use strict";
(function() {
  const COUNTRIES = [
    {
      id: "usa",
      name: "USA",
      flag: "\u{1F1FA}\u{1F1F8}",
      icon: "\u{1F5FD}",
      tagline: "Innovation, research & the best-paid jobs",
      visaSuccess: 75,
      visaNote: "F-1 student visa; approval varies by profile and consulate.",
      whyStudy: ["1.1M+ international students", "62% get a job after graduating", "STEM OPT up to 3 years", "Highest graduate salaries globally"],
      intakes: ["Fall (Aug\u2013Sep)", "Spring (Jan)"],
      population: "335 million",
      weather: "Varies by state \u2014 cold NE winters to warm CA/TX",
      topCities: ["New York", "Boston", "San Francisco", "Los Angeles", "Chicago", "Austin"],
      avgTuition: "$30,000\u201360,000/yr",
      avgLiving: "$12,000\u201320,000/yr",
      postStudyWork: "OPT 12 months (36 for STEM)",
      immigration: "H-1B work visa \u2192 employer-sponsored Green Card (EB-2/EB-3). STEM OPT bridges the gap.",
      settlement: "Green Card backlog is long for Indians; EB-1/NIW faster for high achievers.",
      prTimeline: "Green Card: 1\u201310+ yrs (category & country dependent)",
      popularPrograms: ["MS Computer Science", "MS Data Science", "MBA", "MS Engineering"],
      changes: [{ d: "2025", t: "Heightened visa scrutiny incl. social-media vetting; apply early." }, { d: "2025", t: "STEM OPT 36-month extension remains in place." }, { d: "2024", t: "H-1B registration tightened to curb multiple entries." }]
    },
    {
      id: "canada",
      name: "Canada",
      flag: "\u{1F1E8}\u{1F1E6}",
      icon: "\u{1F341}",
      tagline: "Clear PR pathway & welcoming policies",
      visaSuccess: 62,
      visaNote: "Study permit approvals fell after 2024 intake caps.",
      whyStudy: ["Post-study work up to 3 years", "Direct PR pathways (Express Entry)", "Spouse open work permit", "Affordable vs USA/UK"],
      intakes: ["Fall (Sep)", "Winter (Jan)", "Summer (May)"],
      population: "40 million",
      weather: "Cold winters (\u221210 to \u221230\xB0C); mild summers",
      topCities: ["Toronto", "Vancouver", "Montreal", "Waterloo", "Calgary", "Ottawa"],
      avgTuition: "CAD 20,000\u201340,000/yr",
      avgLiving: "CAD 12,000\u201318,000/yr",
      postStudyWork: "PGWP up to 3 years",
      immigration: "Express Entry (CRS points), Provincial Nominee Programs (PNP), Canadian Experience Class after work.",
      settlement: "One of the clearest student\u2192PR routes globally; Canadian work experience boosts CRS.",
      prTimeline: "PR: ~1\u20133 yrs after qualifying work",
      popularPrograms: ["MSc Computer Science", "Data Science", "MBA", "MEng"],
      changes: [{ d: "2025", t: "Study-permit cap (~437k) + Provincial Attestation Letter (PAL) now required." }, { d: "2024", t: "Proof-of-funds (GIC) raised to CAD 20,635." }, { d: "2024", t: "PGWP now tied to fields linked to labour shortages; spousal work permits restricted." }]
    },
    {
      id: "uk",
      name: "UK",
      flag: "\u{1F1EC}\u{1F1E7}",
      icon: "\u{1F3A1}",
      tagline: "One-year master's & world-top universities",
      visaSuccess: 96,
      visaNote: "High student-visa approval rate.",
      whyStudy: ["One-year master's (save a year)", "Graduate Route 2-year work visa", "4 of world's top 10 universities", "English-speaking"],
      intakes: ["September", "January (some)"],
      population: "67 million",
      weather: "Mild, rainy; 0\u20138\xB0C winter, 15\u201322\xB0C summer",
      topCities: ["London", "Manchester", "Edinburgh", "Birmingham", "Glasgow", "Bristol"],
      avgTuition: "\xA320,000\u201340,000/yr",
      avgLiving: "\xA312,000\u201315,000/yr",
      postStudyWork: "Graduate Route: 2 years (3 for PhD)",
      immigration: "Skilled Worker visa (employer sponsor, salary threshold) \u2192 settlement (ILR) after 5 years.",
      settlement: "Indefinite Leave to Remain (ILR) after 5 years of qualifying work.",
      prTimeline: "ILR: ~5 yrs",
      popularPrograms: ["MSc Computer Science", "MSc Finance", "MBA", "MSc Data Science"],
      changes: [{ d: "2024", t: "Dependants banned for most taught master's students." }, { d: "2025", t: "Graduate Route retained (2 yrs) after government review." }, { d: "2024", t: "Skilled Worker salary threshold raised to \xA338,700." }]
    },
    {
      id: "australia",
      name: "Australia",
      flag: "\u{1F1E6}\u{1F1FA}",
      icon: "\u{1F998}",
      tagline: "High quality of life & skilled migration",
      visaSuccess: 80,
      visaNote: "Subclass 500; Genuine Student test applies.",
      whyStudy: ["2\u20134 year post-study work (485)", "Points-based skilled migration", "High minimum wages", "8 of top 100 universities"],
      intakes: ["February", "July"],
      population: "27 million",
      weather: "Mostly warm; seasons reversed (summer Dec\u2013Feb)",
      topCities: ["Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide", "Canberra"],
      avgTuition: "AUD 35,000\u201350,000/yr",
      avgLiving: "AUD 21,000/yr",
      postStudyWork: "Temporary Graduate (485): 2\u20134 years",
      immigration: "Skilled Independent (189), State Nominated (190), Regional (491) \u2014 points-based.",
      settlement: "Permanent residence via skilled points (age, English, work, qualification).",
      prTimeline: "PR: ~2\u20134 yrs",
      popularPrograms: ["Master of IT", "Data Science", "MBA", "Master of Engineering"],
      changes: [{ d: "2024", t: "Genuine Student (GS) test replaced the GTE requirement." }, { d: "2025", t: "Savings requirement raised to AUD 29,710; higher English bands." }, { d: "2025", t: "International-student commencement caps under discussion." }]
    },
    {
      id: "germany",
      name: "Germany",
      flag: "\u{1F1E9}\u{1F1EA}",
      icon: "\u{1F3F0}",
      tagline: "Tuition-free public universities",
      visaSuccess: 88,
      visaNote: "Requires blocked account proof.",
      whyStudy: ["Little/no tuition at public universities", "Strong engineering & auto industry", "18-month job-seeker visa", "Low cost of living"],
      intakes: ["Winter (Oct)", "Summer (Apr)"],
      population: "84 million",
      weather: "Cool; \u22122 to 4\xB0C winter, 18\u201325\xB0C summer",
      topCities: ["Munich", "Berlin", "Frankfurt", "Aachen", "Stuttgart", "Hamburg"],
      avgTuition: "\u2248\u20AC0 (\u20AC150\u2013350/sem)",
      avgLiving: "\u20AC11,904/yr (blocked account)",
      postStudyWork: "18-month job-seeker visa",
      immigration: "EU Blue Card (salary-based) \u2192 PR; Opportunity Card (points-based job seeker, 2024).",
      settlement: "Permanent residence in 21\u201333 months with a Blue Card + German basics.",
      prTimeline: "PR: ~21\u201333 months (Blue Card)",
      popularPrograms: ["MSc Informatics", "Mechanical/Automotive Eng", "Data Engineering", "Robotics"],
      changes: [{ d: "2024", t: "Opportunity Card (Chancenkarte) launched \u2014 points-based job seeker visa." }, { d: "2024", t: "Blocked-account amount set at \u20AC11,904/yr." }, { d: "2025", t: "Faster Blue Card PR timelines for skilled graduates." }]
    },
    {
      id: "ireland",
      name: "Ireland",
      flag: "\u{1F1EE}\u{1F1EA}",
      icon: "\u2618\uFE0F",
      tagline: "EU tech hub & 2-year stay-back",
      visaSuccess: 85,
      visaNote: "Stamp 2 study visa.",
      whyStudy: ["2-year post-study stay-back (master's)", "European HQs of Google, Apple, Meta", "English-speaking EU country", "Critical Skills pathway"],
      intakes: ["September"],
      population: "5.2 million",
      weather: "Mild, rainy; 4\u20138\xB0C winter, 15\u201320\xB0C summer",
      topCities: ["Dublin", "Cork", "Galway", "Limerick"],
      avgTuition: "\u20AC20,000\u201330,000/yr",
      avgLiving: "\u20AC10,000\u201312,000/yr",
      postStudyWork: "Stamp 1G: up to 2 years",
      immigration: "Critical Skills Employment Permit \u2192 Stamp 4 \u2192 PR after 5 years.",
      settlement: "Long-term residence after 5 years of legal stay.",
      prTimeline: "PR: ~5 yrs",
      popularPrograms: ["MSc Computer Science", "Data Analytics", "Finance", "Pharma"],
      changes: [{ d: "2025", t: "Student fees and minimum funds requirement increased." }, { d: "2024", t: "Stamp 1G post-study stay retained at 24 months for master's." }]
    },
    {
      id: "new-zealand",
      name: "New Zealand",
      flag: "\u{1F1F3}\u{1F1FF}",
      icon: "\u{1F95D}",
      tagline: "Safe, scenic & welcoming",
      visaSuccess: 82,
      visaNote: "Fee-paying student visa.",
      whyStudy: ["Up to 3-year post-study work", "High safety & quality of life", "Partner work + dependent visas", "Skilled migrant pathway"],
      intakes: ["February", "July"],
      population: "5.2 million",
      weather: "Temperate; mild year-round, seasons reversed",
      topCities: ["Auckland", "Wellington", "Christchurch", "Dunedin"],
      avgTuition: "NZD 30,000\u201345,000/yr",
      avgLiving: "NZD 20,000/yr",
      postStudyWork: "Post-study work visa: up to 3 years",
      immigration: "Skilled Migrant Category (points); Green List occupations get fast-tracked.",
      settlement: "Residence via Skilled Migrant points or Green List roles.",
      prTimeline: "PR: ~2\u20133 yrs",
      popularPrograms: ["Master of IT", "Data Science", "Engineering", "Agriculture"],
      changes: [{ d: "2025", t: "Accredited Employer Work Visa (AEWV) settings adjusted." }, { d: "2024", t: "Green List expanded for in-demand occupations." }]
    },
    {
      id: "singapore",
      name: "Singapore",
      flag: "\u{1F1F8}\u{1F1EC}",
      icon: "\u{1F981}",
      tagline: "Asia's global business & tech hub",
      visaSuccess: 90,
      visaNote: "Student's Pass.",
      whyStudy: ["Asia's #1 universities (NUS, NTU)", "Global finance & tech hub", "Safe, English-speaking", "Strong job market"],
      intakes: ["August", "January"],
      population: "5.9 million",
      weather: "Hot & humid year-round (25\u201332\xB0C)",
      topCities: ["Singapore"],
      avgTuition: "SGD 40,000\u201360,000/yr",
      avgLiving: "SGD 12,000\u201318,000/yr",
      postStudyWork: "1-year Long-Term Visit Pass to find work",
      immigration: "Employment Pass (COMPASS points) \u2192 PR.",
      settlement: "Permanent residence after stable employment; competitive.",
      prTimeline: "PR: ~2\u20135 yrs",
      popularPrograms: ["MSc Computer Science", "Business Analytics", "Finance", "AI"],
      changes: [{ d: "2024", t: "COMPASS points framework now governs Employment Pass eligibility." }]
    },
    {
      id: "netherlands",
      name: "Netherlands",
      flag: "\u{1F1F3}\u{1F1F1}",
      icon: "\u{1F337}",
      tagline: "English-taught & innovation-driven",
      visaSuccess: 95,
      visaNote: "Residence permit (MVV).",
      whyStudy: ["2,100+ English-taught programs", "1-year orientation (zoekjaar) visa", "Partner can work freely", "High English proficiency"],
      intakes: ["September", "February (some)"],
      population: "18 million",
      weather: "Mild, windy; 2\u20136\xB0C winter, 17\u201322\xB0C summer",
      topCities: ["Amsterdam", "Eindhoven", "Delft", "Rotterdam", "Utrecht", "Groningen"],
      avgTuition: "\u20AC15,000\u201320,000/yr",
      avgLiving: "\u20AC10,800\u201313,200/yr",
      postStudyWork: "Orientation Year (zoekjaar): 1 year",
      immigration: "Highly Skilled Migrant permit (salary-based) \u2192 PR after 5 years.",
      settlement: "Permanent residence after 5 years of legal stay.",
      prTimeline: "PR: ~5 yrs",
      popularPrograms: ["MSc Artificial Intelligence", "Data Science", "Embedded Systems", "Business"],
      changes: [{ d: "2025", t: "Proposed limits on English-taught bachelor programs (master's mostly unaffected)." }, { d: "2024", t: "Orientation-year visa retained for non-EU graduates." }]
    }
  ];
  const IMMIGRATION = {
    usa: {
      visaTypes: [
        { name: "F-1 Student Visa", note: "Full-time study; on-campus work up to 20h/week; CPT internships during the course." },
        { name: "OPT / STEM OPT", note: "12 months of post-study work \u2014 extended to 36 months for STEM degrees." },
        { name: "H-1B Work Visa", note: "Employer-sponsored specialty occupation; subject to the annual lottery." },
        { name: "Green Card (EB-1/EB-2/EB-3/NIW)", note: "Permanent residence \u2014 employer-sponsored or self-petition (NIW/EB-1) for high achievers." }
      ],
      immigrationPlan: [
        "Enter on an F-1 visa, maintain status and intern via CPT during your degree.",
        "On graduation, apply for OPT \u2014 STEM graduates get a 36-month work window.",
        "Have an employer file an H-1B in the lottery (or use cap-exempt / O-1 routes).",
        "Employer sponsors your Green Card (PERM \u2192 I-140 \u2192 I-485); EB-1 or NIW is faster if you qualify.",
        "After 5 years as a Green Card holder, apply for US citizenship."
      ]
    },
    canada: {
      visaTypes: [
        { name: "Study Permit", note: "Full-time study at a DLI; work up to 24h/week off-campus." },
        { name: "PGWP", note: "Open post-graduation work permit, up to 3 years." },
        { name: "Express Entry (CEC/FSW)", note: "Federal points (CRS) system for permanent residence." },
        { name: "Provincial Nominee (PNP)", note: "A province nominates you, adding 600 CRS points." }
      ],
      immigrationPlan: [
        "Get a Provincial Attestation Letter (PAL) and study permit; enrol at a DLI.",
        "Work during study, then apply for the PGWP after graduating.",
        "Gain 1 year of skilled Canadian work experience (Canadian Experience Class).",
        "Enter the Express Entry pool; boost CRS with a PNP nomination, French or a job offer.",
        "Receive an ITA \u2192 permanent residence; apply for citizenship after 3 years."
      ]
    },
    uk: {
      visaTypes: [
        { name: "Student Visa", note: "Study; work up to 20h/week during term time." },
        { name: "Graduate Route", note: "2-year post-study work (3 for PhD) \u2014 no sponsor needed." },
        { name: "Skilled Worker Visa", note: "Licensed-sponsor job meeting the \xA338,700 salary threshold." },
        { name: "ILR (Settlement)", note: "Indefinite Leave to Remain after 5 years of qualifying stay." }
      ],
      immigrationPlan: [
        "Enter on a Student visa and complete your (often 1-year) master's.",
        "Switch to the Graduate Route (2 years) to find skilled work.",
        "Secure a licensed sponsor and move onto a Skilled Worker visa.",
        "Complete 5 years of qualifying residence, then apply for ILR.",
        "Apply for British citizenship 12 months after getting ILR."
      ]
    },
    australia: {
      visaTypes: [
        { name: "Subclass 500 (Student)", note: "Study; work up to 48 hours per fortnight." },
        { name: "Subclass 485 (Graduate)", note: "2\u20134 years of post-study work rights." },
        { name: "Subclass 189/190/491", note: "Points-based skilled \u2014 independent, state-nominated or regional." },
        { name: "Permanent Residence", note: "Granted via the skilled points test (age, English, work, study)." }
      ],
      immigrationPlan: [
        "Pass the Genuine Student test and study on a subclass 500 visa.",
        "Apply for the 485 Graduate visa; build skilled work and raise your English score.",
        "Lodge an Expression of Interest in SkillSelect and complete a skills assessment.",
        "Receive an invitation under 189/190/491 \u2192 grant of permanent residence.",
        "Apply for citizenship after 4 years' residence (at least 1 as a PR)."
      ]
    },
    germany: {
      visaTypes: [
        { name: "National (D) Student Visa", note: "Study; work 140 full or 280 half days per year." },
        { name: "18-month Job-Seeker Visa", note: "Stay after graduation to find a graduate-level job." },
        { name: "EU Blue Card", note: "Salary-based skilled-work permit with a fast PR track." },
        { name: "Opportunity Card (Chancenkarte)", note: "Points-based job-seeker route launched in 2024." }
      ],
      immigrationPlan: [
        "Show a blocked account (\u2248\u20AC11,904) and enter on the student visa.",
        "Graduate, then switch to the 18-month job-seeker residence permit.",
        "Land a qualifying job and obtain an EU Blue Card.",
        "Reach PR in 21\u201333 months with a Blue Card plus basic German (A1/B1).",
        "Apply for citizenship after ~5 years (sooner with strong integration)."
      ]
    },
    ireland: {
      visaTypes: [
        { name: "Stamp 2 (Study)", note: "Study; work 20h/week (40h during holidays)." },
        { name: "Stamp 1G", note: "Up to 2 years' post-study stay-back to work and job-hunt." },
        { name: "Critical Skills Employment Permit", note: "Fast-track permit for in-demand occupations." },
        { name: "Stamp 4 \u2192 PR", note: "Long-term residence after 5 years of legal stay." }
      ],
      immigrationPlan: [
        "Enter on Stamp 2 and study an eligible master's programme.",
        "Apply for Stamp 1G (24 months) to work and search for a graduate job.",
        "Get a Critical Skills or General Employment Permit.",
        "Move to Stamp 4 and reach 5 years of reckonable residence.",
        "Apply for Irish citizenship by naturalisation."
      ]
    },
    "new-zealand": {
      visaTypes: [
        { name: "Fee-paying Student Visa", note: "Study; work up to 20h/week." },
        { name: "Post-study Work Visa", note: "Open work rights for up to 3 years." },
        { name: "Skilled Migrant Category", note: "Points-based pathway to residence." },
        { name: "Green List", note: "Fast-tracked residence for shortage occupations." }
      ],
      immigrationPlan: [
        "Study on a fee-paying student visa at an approved provider.",
        "Apply for the post-study work visa (up to 3 years).",
        "Secure skilled employment \u2014 ideally a Green List role.",
        "Claim Skilled Migrant points and apply for residence.",
        "Apply for citizenship after 5 years of residence."
      ]
    },
    singapore: {
      visaTypes: [
        { name: "Student's Pass", note: "Full-time study at an approved institution." },
        { name: "Long-Term Visit Pass", note: "1 year after graduation to find work." },
        { name: "Employment Pass", note: "Professional work pass governed by COMPASS points." },
        { name: "Permanent Residence", note: "Via stable, well-paid employment (competitive)." }
      ],
      immigrationPlan: [
        "Study on a Student's Pass at an approved institution.",
        "Apply for the 1-year Long-Term Visit Pass to job-hunt.",
        "Secure an Employment Pass (meet the salary + COMPASS points).",
        "Apply for PR under the Professionals/Technical Personnel scheme.",
        "Citizenship is possible after roughly 2 years as a PR."
      ]
    },
    netherlands: {
      visaTypes: [
        { name: "Residence Permit (MVV)", note: "Study an English-taught programme." },
        { name: "Orientation Year (zoekjaar)", note: "1 year to find work with free labour-market access." },
        { name: "Highly Skilled Migrant Permit", note: "Sponsored work permit (reduced salary threshold for zoekjaar grads)." },
        { name: "Permanent Residence", note: "After 5 years of continuous legal residence." }
      ],
      immigrationPlan: [
        "Enter on the residence permit (MVV) and study your programme.",
        "Apply for the orientation-year (zoekjaar) permit within 3 years of graduating.",
        "Get a sponsored Highly Skilled Migrant job at a recognised employer.",
        "After 5 years of continuous residence, apply for PR.",
        "Apply for Dutch citizenship after 5 years (note renunciation rules)."
      ]
    }
  };
  COUNTRIES.forEach((c) => Object.assign(c, IMMIGRATION[c.id] || {}));
  const LOAN_BANKS = [
    { name: "SBI (Global Ed-Vantage)", type: "Public bank", rate: "10.55\u201311.15%", maxColl: "\u20B91.5 crore", maxNoColl: "\u20B950 lakh*", processing: "\u20B910,000 + GST", repay: "15 years", margin: "15% (abroad)", notes: "Lower rates for premier institutes; tax benefit u/s 80E." },
    { name: "Bank of Baroda", type: "Public bank", rate: "10.60\u201311.10%", maxColl: "\u20B91.5 crore", maxNoColl: "\u20B940 lakh*", processing: "Up to \u20B910,000", repay: "15 years", margin: "10\u201315%", notes: "Concessions for premier institutes & girl students." },
    { name: "Punjab National Bank (Udaan)", type: "Public bank", rate: "10.75\u201311.25%", maxColl: "\u20B91.5 crore", maxNoColl: "\u20B940 lakh*", processing: "Up to \u20B910,000", repay: "15 years", margin: "15%", notes: "0.5% concession for girl students." },
    { name: "HDFC Credila", type: "NBFC", rate: "11.00\u201313.50%", maxColl: "100% finance", maxNoColl: "Up to \u20B950 lakh", processing: "1\u20132% of loan", repay: "Up to 15 years", margin: "Nil\u20135%", notes: "Fast processing; covers 100% incl. living costs." },
    { name: "Avanse", type: "NBFC", rate: "11.50\u201314.50%", maxColl: "Up to \u20B91.25 crore", maxNoColl: "Up to \u20B975 lakh", processing: "1\u20132% of loan", repay: "Up to 15 years", margin: "Nil", notes: "Flexible, quick disbursal; pre-admission loans." },
    { name: "Auxilo", type: "NBFC", rate: "11.50\u201315.00%", maxColl: "Up to \u20B975 lakh", maxNoColl: "Up to \u20B960 lakh", processing: "1\u20132% of loan", repay: "Up to 12 years", margin: "Nil", notes: "Digital process; collateral & non-collateral options." },
    { name: "ICICI Bank", type: "Private bank", rate: "10.50\u201312.50%", maxColl: "\u20B91 crore+", maxNoColl: "Up to \u20B950 lakh", processing: "\u22481% of loan", repay: "12 years", margin: "Nil\u201315%", notes: "Doorstep service; insurance bundled." },
    { name: "Axis Bank", type: "Private bank", rate: "11.00\u201313.00%", maxColl: "\u20B940 lakh+", maxNoColl: "Up to \u20B940 lakh", processing: "Nil (selected)", repay: "15 years", margin: "Nil\u201315%", notes: "100% LIC assignment; quick sanction." },
    { name: "Prodigy Finance", type: "Intl lender", rate: "11.00\u201314.00% (USD)", maxColl: "No collateral", maxNoColl: "Up to ~$100k", processing: "\u22482.5\u20135%", repay: "Up to 20 years", margin: "Nil", notes: "No co-signer/collateral; for top global universities." },
    { name: "MPOWER Financing", type: "Intl lender", rate: "12.00\u201315.00% (USD)", maxColl: "No collateral", maxNoColl: "Up to $100k", processing: "\u22485%", repay: "Up to 10 years", margin: "Nil", notes: "No co-signer; US & Canada only; builds US credit." }
  ];
  window.LP_COUNTRY_DATA = COUNTRIES;
  window.LP_LOAN_BANKS = LOAN_BANKS;
})();
