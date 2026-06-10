"use strict";
(function() {
  const COUNTRIES = [
    { "id": "france", "name": "France", "flag": "\u{1F1EB}\u{1F1F7}", "icon": "\u{1F5FC}", "tagline": "World-class education with minimal tuition, Parisian charm", "visaSuccess": 82, "visaNote": "Student visa approval rates are high; French government actively welcomes international students to boost enrollment.", "whyStudy": ["Tuition-free or heavily subsidized public universities", "Gateway to Europe via Erasmus and cross-border mobility", "Rich academic heritage spanning centuries of innovation", "Post-study work visa for job-search and career building"], "intakes": ["September (Fall)", "January (Spring)"], "population": "68 million", "weather": "Temperate; cool winters, mild summers", "topCities": ["Paris", "Lyon", "Marseille", "Toulouse", "Grenoble", "Bordeaux"], "avgTuition": "\u20AC0\u20134,000/yr (public universities); \u20AC8,000\u201318,000/yr (private/grandes \xE9coles)", "avgLiving": "\u20AC900\u20131,500/month (Paris); \u20AC650\u20131,100/month (provinces)", "postStudyWork": "APS (Autorisation Provisoire de S\xE9jour) visa: 2 years to find employment", "immigration": "After securing a CDI (permanent employment contract), students can transition to a multi-year work visa and eventually apply for permanent residency after 5 years continuous residence. France values skilled talent and streamlines the process for degree-holders.", "settlement": "Strong student networks, affordable housing subsidies (CAF), and cultural integration make settling straightforward.", "prTimeline": "Permanent residency attainable after 5 years continuous legal residence and employment", "popularPrograms": ["MS Computer Science", "MBA", "MS Data Science", "MS Engineering", "MS Management", "LLM Law"], "changes": [{ "d": "2025", "t": "French government raised post-study work visa from 6 months to 2 years for all Master's graduates, regardless of specialty." }, { "d": "2026", "t": "New pathway for international graduates: companies can hire directly under the 'talent passport' scheme without lengthy sponsor approvals." }], "visaTypes": [{ "name": "Student Visa (VLS-TS)", "note": "For full-time degree programs; renewable annually if enrolled and meeting academic progress." }, { "name": "Visitor Visa", "note": "Short-term; not suitable for degree study, but bridges pre-enrollment visits." }, { "name": "APS (Post-Study Work)", "note": "2-year job-search and work authorization following graduation." }], "immigrationPlan": "Study on a student visa \u2192 secure a CDI employment contract \u2192 transition to work visa \u2192 apply for permanent residency after 5 years of continuous legal residency and employment." },
    { "id": "italy", "name": "Italy", "flag": "\u{1F1EE}\u{1F1F9}", "icon": "\u{1F3DB}\uFE0F", "tagline": "Affordable Masters in Europe's creative and tech hub", "visaSuccess": 78, "visaNote": "Italian student visa approvals are straightforward for enrolled students; some regional variation in processing speed.", "whyStudy": ["One of Europe's lowest tuition costs for public universities", "Access to Erasmus exchanges across EU and beyond", "Strong reputation in design, engineering, and humanities", "Low cost of living outside Milan and Rome"], "intakes": ["September (Fall)", "March (Spring)"], "population": "59 million", "weather": "Mediterranean in south; temperate in north; mild year-round", "topCities": ["Milan", "Rome", "Bologna", "Turin", "Florence", "Padua"], "avgTuition": "\u20AC900\u20133,000/yr (public); \u20AC6,000\u201315,000/yr (private)", "avgLiving": "\u20AC700\u20131,100/month outside Milan; \u20AC1,200\u20131,600/month in Milan", "postStudyWork": "Residence visa post-graduation; eligible for visa extension to seek employment (typically 12 months)", "immigration": "Italy does not have a formal post-study work visa, but graduates can apply for a residence permit as a job-seeker or freelancer for up to 12 months. Securing employment then allows transition to a work residence permit.", "settlement": "World-renowned cuisine, art, and lifestyle; affordable rent subsidies in university towns; strong social fabric.", "prTimeline": "Permanent residency after 10 years legal residence; EU citizens with 5 years", "popularPrograms": ["MS Design & Innovation", "MS Engineering", "MBA", "MS Computer Science", "MS Finance", "MS Architecture"], "changes": [{ "d": "2025", "t": "Italy introduced a 'Global Talent' residence visa, streamlining work permits for Master's graduates in STEM and creative sectors." }, { "d": "2026", "t": "New bilateral scholarships launched with India for engineering and tech Master's programs at top Italian universities." }], "visaTypes": [{ "name": "Student Residence Permit", "note": "Valid for the duration of study; renewable with proof of enrollment and financial means." }, { "name": "Job-Seeker Permit", "note": "Up to 12 months post-graduation to find employment." }, { "name": "Work Residence Permit", "note": "Issued upon securing employment; renewable yearly." }], "immigrationPlan": "Study on a student residence permit \u2192 apply for job-seeker permit after graduation \u2192 secure employment and transition to work permit \u2192 continuous residence leading to permanent residency." },
    { "id": "sweden", "name": "Sweden", "flag": "\u{1F1F8}\u{1F1EA}", "icon": "\u2744\uFE0F", "tagline": "Nordic excellence with generous scholarships and work rights", "visaSuccess": 85, "visaNote": "Swedish student visa approvals are high-integrity; immigration focuses on credential verification and financial proof.", "whyStudy": ["Most scholarships cover tuition + living costs at top institutions", "Excellent post-study work rights: 6 months minimum, extendable", "World-leading tech, innovation, and sustainability programs", "Highest English proficiency and quality of life in Nordics"], "intakes": ["August (Fall)", "January (Spring)"], "population": "10.5 million", "weather": "Cold winters (\u22125 to 5\xB0C); mild summers (15\u201320\xB0C); long daylight in summer", "topCities": ["Stockholm", "Gothenburg", "Uppsala", "Lund", "Malm\xF6", "Link\xF6ping"], "avgTuition": "SEK 80,000\u2013140,000/yr (non-EU; ~\u20AC8,000\u201314,000); free for EU citizens", "avgLiving": "SEK 10,000\u201313,000/month (~\u20AC850\u20131,100); Stockholm higher", "postStudyWork": "6-month job-search visa automatically; extendable to 24 months if job offer secured", "immigration": "Sweden prioritizes skilled workers; after securing employment in a regulated role, graduates can apply for a work permit renewable annually. PR eligibility begins after 4 years continuous legal residence and employment.", "settlement": "Exceptional work-life balance, gender equality, and comprehensive social support; high standard of living; excellent public services.", "prTimeline": "Permanent residency after 4 years continuous legal residence", "popularPrograms": ["MS Sustainable Energy Engineering", "MBA", "MS Computer Science", "MS Artificial Intelligence", "MS Data Science", "MS Environmental Engineering"], "changes": [{ "d": "2025", "t": "Sweden extended post-study work visa from 6 months to 12 months automatic extension, plus option to renew for 12 more months with job offer." }, { "d": "2026", "t": "New fast-track residence permit for Master's graduates in tech and engineering, reducing wait time from 4 to 2.5 years for PR eligibility." }], "visaTypes": [{ "name": "Student Residence Permit", "note": "Valid 1\u20132 years depending on program length; renewable with enrollment proof and financial resources." }, { "name": "Job-Seeker Permit", "note": "6-month post-graduation auto-granted; extendable to 24 months with job offer." }, { "name": "Work and Residence Permit", "note": "For employed graduates in regulated occupations; annual renewal." }], "immigrationPlan": "Study on student residence permit \u2192 6-month job-search visa post-graduation \u2192 secure employment in regulated role \u2192 work permit \u2192 PR eligibility after 4 years continuous residence." },
    { "id": "finland", "name": "Finland", "flag": "\u{1F1EB}\u{1F1EE}", "icon": "\u{1F30C}", "tagline": "Tech innovation hub with strong scholarship and post-study work options", "visaSuccess": 83, "visaNote": "Finnish student visa has high approval rates; authorities are transparent and efficient in document review.", "whyStudy": ["Top scholarships cover full tuition and living expenses", "Leading hub for AI, software, and clean-tech research", "Post-study work visa of 12 months, extendable with employment", "Education ranked among world's best by quality metrics"], "intakes": ["August (Fall)", "January (Spring)"], "population": "5.5 million", "weather": "Harsh winters (\u221215 to \u22125\xB0C); brief mild summers (10\u201320\xB0C); midnight sun in far north", "topCities": ["Helsinki", "Espoo", "Tampere", "Turku", "Oulu", "Jyv\xE4skyl\xE4"], "avgTuition": "\u20AC0\u20138,500/yr (EU); \u20AC12,000\u201320,000/yr (non-EU); many scholarships waive entirely", "avgLiving": "\u20AC900\u20131,300/month outside Helsinki; \u20AC1,100\u20131,500/month in Helsinki", "postStudyWork": "12-month residence permit for job-search post-graduation; extendable to 24 months if employment secured", "immigration": "Finland recognizes skilled talent; after securing a job matching your Master's qualification, work permit and residence are granted. After 4 years continuous legal residence, apply for permanent residency with minimal additional scrutiny.", "settlement": "Exceptional education system spillover, high wages, strong social safety net, and innovative culture make long-term residency attractive.", "prTimeline": "Permanent residency after 4 years continuous legal residence", "popularPrograms": ["MS Software Engineering", "MS AI and Machine Learning", "MBA", "MS Data Science", "MS Clean Energy Technology", "MS Computer Science"], "changes": [{ "d": "2025", "t": "Finland increased post-study work visa to 12 months for all Master's graduates, with explicit option to extend another 12 months upon job offer." }, { "d": "2026", "t": "Fast-track permanent residency pathway introduced: graduates in critical sectors (AI, green tech, biotech) eligible for PR after 2.5 years continuous employment." }], "visaTypes": [{ "name": "Student Residence Permit", "note": "Valid for study duration (1\u20132 years); renewable with enrollment and financial proof." }, { "name": "Job-Seeker Residence Permit", "note": "12-month automatic grant post-graduation for employment search." }, { "name": "Work-Based Residence Permit", "note": "Issued upon secured employment; renewable yearly." }], "immigrationPlan": "Study on student residence permit \u2192 12-month job-seeker permit post-graduation \u2192 secure role matching Master's qualification \u2192 work-based residence permit \u2192 PR after 4 years (or 2.5 in critical sectors)." },
    { "id": "denmark", "name": "Denmark", "flag": "\u{1F1E9}\u{1F1F0}", "icon": "\u{1F6B4}", "tagline": "Nordic quality, strong tech sector, and accessible student life", "visaSuccess": 80, "visaNote": "Danish student visa has good approval rates; immigration is rigorous on financial verification but transparent in process.", "whyStudy": ["Strong scholarships and low tuition for EU/international students", "World-class engineering, IT, and business education", "Post-study work visa with job-offer extension pathways", "Excellent quality of life and gender equality"], "intakes": ["August (Fall)", "February (Spring)"], "population": "5.9 million", "weather": "Temperate maritime; cold winters (\u22123 to 3\xB0C); cool summers (12\u201317\xB0C)", "topCities": ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Roskilde", "Kolding"], "avgTuition": "DKK 50,000\u2013120,000/yr (~\u20AC6,700\u201316,000 non-EU); free for EU citizens", "avgLiving": "DKK 7,500\u201310,000/month (~\u20AC1,000\u20131,340); Copenhagen higher", "postStudyWork": "3-year residence permit for job-search and work post-graduation", "immigration": "Denmark offers one of Europe's longest post-study work visas at 3 years. Graduates securing employment can convert to work residency renewable annually. Permanent residency eligible after 4\u20138 years continuous residence depending on pathway and income level.", "settlement": "Bicycle-friendly culture, transparent governance, comprehensive social benefits, and strong tech startup ecosystem.", "prTimeline": "Permanent residency after 4\u20138 years continuous legal residence (varies by income and family status)", "popularPrograms": ["MS Engineering", "MS Computer Science", "MBA", "MS Renewable Energy", "MS Finance", "MS Business Administration"], "changes": [{ "d": "2025", "t": "Denmark extended the post-study work residence permit from 2 years to 3 years, explicitly designed to help graduates secure employment." }, { "d": "2026", "t": "New 'Talent Track' residence permit launched: Master's graduates in shortage occupations (engineering, IT, healthcare) can apply for accelerated PR after 2.5 years employment." }], "visaTypes": [{ "name": "Student Residence Permit", "note": "Valid 1\u20132 years depending on program; renewable with enrollment and financial proof." }, { "name": "Post-Study Residence Permit", "note": "3-year permit for job-search and employment post-graduation." }, { "name": "Work Residence Permit", "note": "Renewable annually upon employment in regulated occupation." }], "immigrationPlan": "Study on student residence permit \u2192 3-year post-study residence permit \u2192 secure employment \u2192 work residence permit \u2192 PR eligibility after 4\u20138 years continuous residence." },
    { "id": "uae", "name": "United Arab Emirates", "flag": "\u{1F1E6}\u{1F1EA}", "icon": "\u{1F3D9}\uFE0F", "tagline": "Tax-free salaries, Golden Visa, and global branch campuses", "visaSuccess": 88, "visaNote": "UAE student visa approvals are straightforward; immigration welcomes international talent with streamlined processes.", "whyStudy": ["Study at world-ranked institutions via branch campuses (NYU Abu Dhabi, Sorbonne, INSEAD, etc.)", "Tax-free employment and Golden Visa pathway for graduates", "Safe, cosmopolitan environment with world-class amenities", "Gateway to Middle East and Asia for career advancement"], "intakes": ["August (Fall)", "January (Spring)"], "population": "10.8 million", "weather": "Desert climate; hot summers (40\u201350\xB0C); warm winters (15\u201325\xB0C)", "topCities": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"], "avgTuition": "AED 80,000\u2013220,000/yr (~\u20AC21,500\u201359,500 at branch campuses); varies widely", "avgLiving": "AED 30,000\u201350,000/month (~\u20AC8,000\u201313,500 in Dubai); lower outside", "postStudyWork": "Typically 1\u20133 years post-graduation; Golden Visa (10 years) available for graduates earning above AED 10,000/month (\u20AC2,700)", "immigration": "UAE offers a Golden Visa for Master's graduates and professionals earning above AED 10,000/month, renewable every 10 years. No quota or sponsorship cap. Long-term residency and flexible work rules make career building straightforward.", "settlement": "World-class infrastructure, safety, diverse expat communities, and tax-free income; easy transition to permanent residency via Golden Visa.", "prTimeline": "Golden Visa (10-year renewable residency) available upon graduation and employment meeting income threshold", "popularPrograms": ["MBA (INSEAD, University of Chicago Booth)", "MS Computer Science", "MS Finance", "MS Engineering", "MS Data Science", "MS Business Administration"], "changes": [{ "d": "2025", "t": "UAE lowered Golden Visa income threshold from AED 15,000 to AED 10,000/month for Master's graduates, making it accessible to more students." }, { "d": "2026", "t": "New 'Investor-Student' visa introduced: allows concurrent study and investment, blending education with entrepreneurship pathway." }], "visaTypes": [{ "name": "Student Visa", "note": "Valid for study duration; sponsored by institution; renewable upon enrollment proof." }, { "name": "Work Visa", "note": "Post-graduation; sponsored by employer; typical duration 2\u20133 years." }, { "name": "Golden Visa", "note": "10-year renewable residency for graduates earning AED 10,000+/month; no sponsorship required." }], "immigrationPlan": "Study on student visa sponsored by institution \u2192 secure employment upon graduation \u2192 apply for Golden Visa if earning threshold met \u2192 10-year renewable residency with employment flexibility." },
    { "id": "spain", "name": "Spain", "flag": "\u{1F1EA}\u{1F1F8}", "icon": "\u{1F31E}", "tagline": "Affordable Mediterranean education with strong Erasmus ties", "visaSuccess": 76, "visaNote": "Spanish student visa approvals are solid; financial proof and enrollment confirmation are key requirements.", "whyStudy": ["Competitive tuition costs; public universities extremely affordable", "Access to Erasmus mobility across entire EU", "Growing English-taught Master's programs in tech and business", "Excellent lifestyle, culture, and Mediterranean climate"], "intakes": ["September (Fall)", "February (Spring)"], "population": "47 million", "weather": "Mediterranean/warm temperate; mild winters (5\u201315\xB0C); hot summers (25\u201335\xB0C)", "topCities": ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Granada"], "avgTuition": "\u20AC1,000\u20133,500/yr (public); \u20AC7,000\u201316,000/yr (private)", "avgLiving": "\u20AC700\u20131,100/month outside Madrid/Barcelona; \u20AC1,100\u20131,500/month in major cities", "postStudyWork": "Residence permit available post-graduation; 12-month job-search extension possible; work permit with employment", "immigration": "Spain does not offer explicit post-study work visa but grants residence permits to graduates seeking employment. Securing a job allows transition to work residency. PR eligibility after 5 years continuous legal residence with employment.", "settlement": "Strong food culture, vibrant social life, affordable cost of living, and warm community integration.", "prTimeline": "Permanent residency after 5 years continuous legal residence", "popularPrograms": ["MS Computer Science", "MBA", "MS Engineering", "MS Data Science", "MS Finance", "MS Telecommunications"], "changes": [{ "d": "2025", "t": "Spain introduced a 12-month post-study residence permit extension for Master's graduates, improving job-search runway." }, { "d": "2026", "t": "Bilateral agreements signed with India offering expedited work permits for engineering and IT Master's graduates at top Spanish universities." }], "visaTypes": [{ "name": "Student Residence Permit", "note": "Valid for study duration; renewable with enrollment proof and financial resources." }, { "name": "Job-Seeker Residence Extension", "note": "Up to 12 months post-graduation for employment search." }, { "name": "Work Residence Permit", "note": "Issued upon securing employment; renewable yearly." }], "immigrationPlan": "Study on student residence permit \u2192 extend residence as job-seeker (up to 12 months) \u2192 secure employment \u2192 work residence permit \u2192 PR after 5 years continuous residence." },
    { "id": "poland", "name": "Poland", "flag": "\u{1F1F5}\u{1F1F1}", "icon": "\u{1F3F0}", "tagline": "Low cost, strong tech sector, and English-taught Medicine programs", "visaSuccess": 79, "visaNote": "Polish student visa approvals are efficient; immigration processing is straightforward with clear documentation requirements.", "whyStudy": ["Exceptionally low tuition and living costs across EU", "Growing hub for tech startups and software engineering", "Renowned English-taught Medical and Dentistry programs", "Access to Erasmus and EU job market post-graduation"], "intakes": ["September (Fall)", "February/March (Spring)"], "population": "37 million", "weather": "Temperate continental; cold winters (\u22125 to 0\xB0C); warm summers (18\u201325\xB0C)", "topCities": ["Warsaw", "Krakow", "Wroclaw", "Gdansk", "Poznan", "Lublin"], "avgTuition": "\u20AC2,000\u20135,000/yr (most programs); \u20AC8,000\u201318,000/yr (Medicine in English)", "avgLiving": "\u20AC500\u2013850/month (low cost nationwide); Warsaw slightly higher", "postStudyWork": "Residence permit available post-graduation; work visa with employment secured", "immigration": "Poland allows graduates to stay and seek employment; work permits are straightforward upon job offer. PR eligibility after 5 years continuous legal residence with stable employment.", "settlement": "Historic cities, affordable housing, warm hospitality, and thriving cultural scene; excellent value for long-term residency.", "prTimeline": "Permanent residency after 5 years continuous legal residence", "popularPrograms": ["MS Medicine (English-taught)", "MS Computer Science", "MS Dentistry (English-taught)", "MBA", "MS Engineering", "MS Data Science"], "changes": [{ "d": "2025", "t": "Poland streamlined post-study residence for Master's graduates, allowing automatic 12-month extension for job-search without visa reapplication." }, { "d": "2026", "t": "New scholarship program launched: 500+ grants for Indian students in Medicine, Engineering, and Tech; \u20AC5,000\u201310,000/yr per student." }], "visaTypes": [{ "name": "Student Residence Permit", "note": "Valid for study duration; renewable with enrollment proof and financial means." }, { "name": "Residence for Job-Seeking", "note": "Available post-graduation; typically 12 months to secure employment." }, { "name": "Work Residence Permit", "note": "Issued with employment contract; renewable annually." }], "immigrationPlan": "Study on student residence permit \u2192 job-seeking residence post-graduation \u2192 secure employment \u2192 work residence permit \u2192 PR after 5 years continuous residence." },
    { "id": "czech-republic", "name": "Czech Republic", "flag": "\u{1F1E8}\u{1F1FF}", "icon": "\u{1F3DB}\uFE0F", "tagline": "Cheapest EU tuition, English-taught Medicine, and historic charm", "visaSuccess": 81, "visaNote": "Czech student visa approvals are reliable; immigration procedures are transparent and efficiently processed.", "whyStudy": ["Europe's lowest tuition for public universities, including Medicine", "English-taught Medical and Dentistry programs highly reputable", "Strong computer science and engineering education", "Beautiful historic cities with affordable living"], "intakes": ["September (Fall)", "February (Spring, limited)"], "population": "10.5 million", "weather": "Temperate continental; cold winters (\u22125 to 0\xB0C); mild summers (15\u201325\xB0C)", "topCities": ["Prague", "Brno", "Ostrava", "Plzen", "Ceske Budejovice", "Liberec"], "avgTuition": "\u20AC2,000\u20134,500/yr (most programs); \u20AC7,000\u201316,000/yr (Medicine in English)", "avgLiving": "\u20AC500\u2013800/month (nationwide); Prague slightly elevated", "postStudyWork": "Residence permit available post-graduation; 12-month job-search window; work visa upon employment", "immigration": "Czech Republic grants residence permits to employed graduates. After 5 years continuous legal residence with stable employment, PR is accessible. Non-EU citizens follow streamlined pathways.", "settlement": "UNESCO-protected historic center, vibrant youth culture, affordable rent and food, and efficient public transport.", "prTimeline": "Permanent residency after 5 years continuous legal residence", "popularPrograms": ["MS Medicine (English-taught)", "MS Computer Science", "MS Dentistry (English-taught)", "MBA", "MS Engineering", "MS Software Engineering"], "changes": [{ "d": "2025", "t": "Czech Republic formalized 12-month post-study residence permit for Master's graduates, automatically granted upon graduation without additional visa fees." }, { "d": "2026", "t": "New bilateral scholarship scheme with India: 300+ full-tuition grants for Medicine and Engineering Master's; priority for NEET/JEE qualifiers." }], "visaTypes": [{ "name": "Student Residence Permit", "note": "Valid for study duration; renewable annually with enrollment and financial proof." }, { "name": "Post-Study Residence Permit", "note": "12-month automatic extension post-graduation for job-search and employment." }, { "name": "Work Residence Permit", "note": "Issued upon employment; renewable yearly." }], "immigrationPlan": "Study on student residence permit \u2192 12-month post-study residence permit \u2192 secure employment \u2192 work residence permit \u2192 PR after 5 years continuous residence." },
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
