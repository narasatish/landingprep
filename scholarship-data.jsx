/* global window */
"use strict";

// LandingPrep — curated scholarship dataset for the Scholarship Finder.
// Figures are INDICATIVE; always confirm on the official scholarship site.
// Schema: { id, name, country, level, type, amount, who, deadline, highlight }
(function () {
  const S = [
    // ─── USA ───
    { id: "fulbright", name: "Fulbright Foreign Student Program", country: "USA", level: "Master's & PhD", type: "Government", amount: "Fully funded", who: "International students; apply via your home-country Fulbright commission", deadline: "Feb–Oct (varies by country)", highlight: "The flagship US government scholarship — tuition, living, airfare & insurance." },
    { id: "knight-hennessy", name: "Knight-Hennessy Scholars", country: "USA", level: "Master's & PhD", type: "University", amount: "Fully funded", who: "Any graduate programme at Stanford; strong leadership", deadline: "October", highlight: "Stanford's elite fully-funded graduate scholarship across all schools." },
    { id: "aauw", name: "AAUW International Fellowships", country: "USA", level: "Master's & PhD", type: "Merit (Women)", amount: "$20,000–50,000", who: "Women who are not US citizens", deadline: "November", highlight: "Supports women pursuing graduate study in the US." },
    { id: "fulbright-nehru", name: "Fulbright-Nehru Master's Fellowship", country: "USA", level: "Master's", type: "Government", amount: "Fully funded", who: "Indian citizens with 3+ yrs experience", deadline: "May", highlight: "India-specific Fulbright track — fully funded US master's." },

    // ─── UK ───
    { id: "chevening", name: "Chevening Scholarship", country: "UK", level: "Master's", type: "Government", amount: "Fully funded", who: "Leadership potential + 2 yrs work experience", deadline: "November", highlight: "The UK government's global one-year master's scholarship." },
    { id: "commonwealth", name: "Commonwealth Scholarship", country: "UK", level: "Master's & PhD", type: "Government", amount: "Fully funded", who: "Citizens of Commonwealth countries", deadline: "October–December", highlight: "Full funding for students from Commonwealth nations." },
    { id: "gates-cambridge", name: "Gates Cambridge Scholarship", country: "UK", level: "Master's & PhD", type: "University", amount: "Fully funded", who: "Outstanding applicants to Cambridge (non-UK)", deadline: "October/December", highlight: "Cambridge's most prestigious international scholarship." },
    { id: "rhodes", name: "Rhodes Scholarship", country: "UK", level: "Master's", type: "University", amount: "Fully funded", who: "Exceptional students from eligible countries (Oxford)", deadline: "July–September", highlight: "The world's oldest graduate scholarship, at Oxford." },
    { id: "clarendon", name: "Clarendon Fund Scholarship", country: "UK", level: "Master's & PhD", type: "University", amount: "Fully funded", who: "Any graduate course at Oxford; academic excellence", deadline: "Jan (course deadline)", highlight: "Oxford's flagship merit scholarship — automatic consideration." },
    { id: "great", name: "GREAT Scholarships", country: "UK", level: "Master's", type: "Govt + University", amount: "£10,000", who: "Select countries incl. India", deadline: "Varies by university", highlight: "British Council partial-funding for one-year master's." },

    // ─── Germany & Europe ───
    { id: "daad", name: "DAAD Scholarships", country: "Germany", level: "Master's & PhD", type: "Government", amount: "€934/month + extras", who: "International graduates", deadline: "Varies (often Oct)", highlight: "Germany's main funding body — monthly stipend, travel, insurance." },
    { id: "erasmus", name: "Erasmus Mundus Joint Masters", country: "Europe (Multiple)", level: "Master's", type: "EU Government", amount: "Fully funded", who: "Study in 2+ European countries", deadline: "Oct–Jan", highlight: "Prestigious multi-country EU master's, fully funded." },
    { id: "eiffel", name: "Eiffel Excellence Scholarship", country: "France", level: "Master's & PhD", type: "Government", amount: "€1,181/month", who: "International students; nominated by the institution", deadline: "January", highlight: "French government scholarship for top international talent." },
    { id: "swiss-excellence", name: "Swiss Government Excellence", country: "Switzerland", level: "PhD & Research", type: "Government", amount: "Fully funded", who: "Researchers & postgrads from eligible countries", deadline: "Sep–Dec", highlight: "Funds research/PhD at Swiss universities." },
    { id: "holland", name: "Holland Scholarship", country: "Netherlands", level: "UG & Master's", type: "Govt + University", amount: "€5,000 (year 1)", who: "Non-EEA students", deadline: "February/May", highlight: "Dutch government + university partial scholarship." },

    // ─── Canada ───
    { id: "vanier", name: "Vanier Canada Graduate Scholarship", country: "Canada", level: "PhD", type: "Government", amount: "CAD 50,000/yr (3 yrs)", who: "Doctoral students; leadership + research", deadline: "Sep–Nov", highlight: "Canada's top doctoral scholarship." },
    { id: "pearson", name: "Lester B. Pearson Scholarship", country: "Canada", level: "Undergraduate", type: "University", amount: "Fully funded", who: "Exceptional international undergrads (U of Toronto)", deadline: "November", highlight: "U of Toronto's premier international UG award." },
    { id: "cgs", name: "Canada Graduate Scholarships", country: "Canada", level: "Master's & PhD", type: "Government", amount: "CAD 17,500–50,000", who: "Master's & doctoral students", deadline: "Dec", highlight: "Federal funding across Canadian universities." },

    // ─── Australia & NZ ───
    { id: "australia-awards", name: "Australia Awards", country: "Australia", level: "Master's", type: "Government", amount: "Fully funded", who: "Developing-country citizens", deadline: "April–June", highlight: "Australian govt scholarship — tuition, living, travel." },
    { id: "rtp", name: "Research Training Program (RTP)", country: "Australia", level: "Master's & PhD (research)", type: "Government", amount: "Fully funded + stipend", who: "Domestic & international research students", deadline: "Aug–Oct", highlight: "Funds research degrees at Australian universities." },
    { id: "nz-scholarships", name: "New Zealand Scholarships", country: "New Zealand", level: "Master's & PhD", type: "Government", amount: "Fully funded", who: "Citizens of eligible countries", deadline: "Feb–March", highlight: "NZ government full scholarship including living costs." },

    // ─── Asia ───
    { id: "mext", name: "MEXT Scholarship", country: "Japan", level: "UG / Master's / PhD", type: "Government", amount: "Fully funded", who: "International students; embassy or university route", deadline: "April–June", highlight: "Japanese government scholarship — no tuition + monthly stipend." },
    { id: "schwarzman", name: "Schwarzman Scholars", country: "China", level: "Master's", type: "University", amount: "Fully funded", who: "Future global leaders (Tsinghua University)", deadline: "September", highlight: "One-year fully-funded master's in global affairs in Beijing." },

    // ─── For Indian students (study anywhere) ───
    { id: "inlaks", name: "Inlaks Shivdasani Scholarship", country: "USA / UK / Europe", level: "Master's", type: "Merit + Need", amount: "Up to $100,000", who: "Indian citizens under 30 with a top admit", deadline: "Feb–March", highlight: "Prestigious Indian scholarship for study at top global universities." },
    { id: "kc-mahindra", name: "KC Mahindra Scholarship", country: "Multiple", level: "Master's", type: "Merit + Need", amount: "Up to ₹10 lakh (interest-free)", who: "Indian graduates going abroad", deadline: "March–April", highlight: "Long-running Indian scholarship loan for overseas master's." },
    { id: "aga-khan", name: "Aga Khan Foundation ISP", country: "Multiple", level: "Master's & PhD", type: "Need-based", amount: "50% grant + 50% loan", who: "Students from select developing countries", deadline: "Varies (often March)", highlight: "Need-based support for postgraduate study abroad." },
  ];

  window.LP_SCHOLARSHIPS = S;
  window.LP_SCHOLARSHIP_COUNTRIES = [...new Set(S.map(s => s.country))];
})();
