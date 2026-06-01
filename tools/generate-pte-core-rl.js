#!/usr/bin/env node
// tools/generate-pte-core-rl.js
// Generates PTE Core Reading (test-031..060) and Listening (test-031..060)
// Run: node tools/generate-pte-core-rl.js
"use strict";
const fs   = require("fs");
const path = require("path");

const BASE = path.resolve(__dirname, "../content/pte");

const TOPICS = [
  "community services","workplace safety","public health campaigns","local transport",
  "neighbourhood volunteering","consumer rights","job application skills","climate change adaptation",
  "digital literacy","housing and tenancy","cultural integration","financial planning",
  "healthy lifestyles","emergency preparedness","childcare options","recycling and waste",
  "remote work trends","civic participation","senior care services","small business support",
  "language learning","public library resources","road safety","mental health awareness",
  "food security","water conservation","neighbourhood watch","apprenticeship programmes",
  "social media safety","renewable energy at home",
];

// Reading MCQ questions (rotate 5 per test)
const READING_QS = [
  {
    q: "According to the passage, which of the following best describes the primary benefit of the programme?",
    opts: ["It reduces costs for participants","It increases community engagement","It provides formal qualifications","It replaces existing services"],
    ans: "It increases community engagement",
    exp: "The passage emphasises community-building as the main benefit."
  },
  {
    q: "The word 'sustainable' in the passage most nearly means:",
    opts: ["expensive","able to be maintained long-term","environmentally friendly","profitable"],
    ans: "able to be maintained long-term",
    exp: "'Sustainable' in context refers to something that can continue over time."
  },
  {
    q: "Which statement best summarises the main idea of the passage?",
    opts: [
      "Government funding is the most important factor in programme success.",
      "Individual effort alone is sufficient to solve the problem described.",
      "A combination of community action and institutional support produces the best outcomes.",
      "Technology has replaced traditional methods of addressing the issue."
    ],
    ans: "A combination of community action and institutional support produces the best outcomes.",
    exp: "The passage argues for a combined approach throughout."
  },
  {
    q: "Based on the passage, what can be inferred about participants who complete the programme?",
    opts: [
      "They are guaranteed employment afterwards.",
      "They are likely to develop skills relevant to everyday life.",
      "They receive formal academic recognition.",
      "They are required to volunteer in their community."
    ],
    ans: "They are likely to develop skills relevant to everyday life.",
    exp: "The passage highlights practical skill development as an outcome."
  },
  {
    q: "Which of the following, if true, would most strengthen the argument made in the passage?",
    opts: [
      "Funding for the programme was reduced last year.",
      "Participants in similar programmes in other countries reported improved outcomes.",
      "Some participants withdrew before completing the programme.",
      "The programme is only available in large cities."
    ],
    ans: "Participants in similar programmes in other countries reported improved outcomes.",
    exp: "International evidence supporting similar approaches strengthens the argument."
  },
  {
    q: "The author's tone in the passage can best be described as:",
    opts: ["critical and dismissive","neutral and informative","enthusiastic and promotional","cautious and pessimistic"],
    ans: "neutral and informative",
    exp: "The passage presents information without strong personal opinion."
  },
  {
    q: "According to the passage, which factor most affects the success of the programme?",
    opts: ["the age of participants","participant motivation and consistent engagement","the size of the organisation running it","the geographic location"],
    ans: "participant motivation and consistent engagement",
    exp: "The passage identifies engagement as the key success factor."
  },
  {
    q: "What does the passage suggest about the relationship between the two approaches described?",
    opts: [
      "They are completely incompatible.",
      "One is clearly superior to the other.",
      "They can complement each other when applied appropriately.",
      "Both have been abandoned in favour of newer methods."
    ],
    ans: "They can complement each other when applied appropriately.",
    exp: "The passage suggests both approaches have value depending on context."
  },
  {
    q: "Which of the following is NOT mentioned in the passage as a benefit of the programme?",
    opts: ["improved social connections","financial savings for participants","increased confidence","better health outcomes"],
    ans: "financial savings for participants",
    exp: "Financial savings are not listed as a benefit in the passage."
  },
  {
    q: "The passage implies that without adequate support, participants are most likely to:",
    opts: ["perform better independently","lose motivation and disengage","seek support from other sources","complete the programme more quickly"],
    ans: "lose motivation and disengage",
    exp: "The passage links lack of support to lower engagement and dropout."
  },
];

// Listening MCQ questions
const LISTENING_QS = [
  {
    q: "What is the main topic of the conversation?",
    opts: ["a workplace incident","a community programme","a government policy","an educational course"],
    ans: "a community programme",
    exp: "The speakers are discussing a local community programme throughout."
  },
  {
    q: "What does the speaker say about the registration process?",
    opts: ["It requires a fee","It is done online","It is closed","It requires a reference"],
    ans: "It is done online",
    exp: "The speaker explicitly states that registration is completed online."
  },
  {
    q: "What problem does the speaker identify with the current approach?",
    opts: [
      "It is too expensive for most participants.",
      "It does not reach enough people in the community.",
      "It requires too much time commitment.",
      "It lacks qualified staff."
    ],
    ans: "It does not reach enough people in the community.",
    exp: "The speaker highlights low reach as the key limitation."
  },
  {
    q: "What solution does the speaker propose?",
    opts: [
      "Increasing the budget for the programme.",
      "Partnering with local organisations to expand delivery.",
      "Moving the programme entirely online.",
      "Reducing the number of sessions offered."
    ],
    ans: "Partnering with local organisations to expand delivery.",
    exp: "The speaker suggests community partnerships as the main solution."
  },
  {
    q: "According to the lecture, which group benefits most from the initiative?",
    opts: ["young professionals","recently arrived immigrants","elderly residents","school-age children"],
    ans: "recently arrived immigrants",
    exp: "The lecture focuses on how the initiative supports new arrivals."
  },
  {
    q: "What does the speaker say will happen next month?",
    opts: ["A new programme will launch.","Funding will be cut.","A review will take place.","Staff will be recruited."],
    ans: "A new programme will launch.",
    exp: "The speaker announces a new programme starting next month."
  },
  {
    q: "Which word best describes the speaker's attitude towards the new policy?",
    opts: ["opposed","supportive but cautious","enthusiastic","indifferent"],
    ans: "supportive but cautious",
    exp: "The speaker welcomes the policy but notes potential challenges."
  },
  {
    q: "What evidence does the speaker provide to support the main argument?",
    opts: [
      "Personal experience from working in the field.",
      "Statistics from a recent study.",
      "An example from another country.",
      "Quotes from participants."
    ],
    ans: "Statistics from a recent study.",
    exp: "The speaker cites recent research data to support the claim."
  },
  {
    q: "What is the speaker's recommendation for individuals who want to get involved?",
    opts: [
      "Contact the local council directly.",
      "Sign up through the organisation's website.",
      "Attend an information session first.",
      "Wait for further announcements."
    ],
    ans: "Attend an information session first.",
    exp: "The speaker advises attending an information session before signing up."
  },
  {
    q: "What does the speaker suggest is the most important factor for long-term success?",
    opts: ["government funding","community ownership","professional management","media coverage"],
    ans: "community ownership",
    exp: "The speaker emphasises that communities must lead the initiative themselves."
  },
];

// Passages for fill-in / reorder (PTE Core reading)
const PASSAGES = [
  "Community volunteering strengthens social bonds and improves the well-being of participants. Research shows that volunteers develop new skills and form lasting friendships.",
  "Workplace safety depends on clear procedures, regular training, and a culture where employees feel empowered to report hazards without fear of negative consequences.",
  "Public health campaigns are most effective when they combine clear messaging with practical support for behaviour change. Community partnerships enhance reach and impact.",
  "Urban transport networks must balance frequency, affordability, and environmental impact. Investment in integrated ticketing systems improves the passenger experience.",
  "Neighbourhood programmes that bring residents together build trust and reduce isolation. Regular community events are an important part of creating cohesive neighbourhoods.",
  "Consumer protection laws ensure that buyers have recourse when goods are faulty or advertising is misleading. Strong enforcement discourages dishonest trading practices.",
  "Successful job applications require careful research of the employer, a tailored cover letter, and thorough interview preparation. Following up after interviews demonstrates professionalism.",
  "Climate adaptation planning helps communities reduce the impact of extreme weather events. Early warning systems and community preparedness networks save lives.",
  "Digital literacy skills enable people to participate fully in modern society. Libraries and community centres play a key role in providing training to underserved populations.",
  "Tenancy disputes are best resolved through early communication and mediation. Knowing your rights and responsibilities as a tenant or landlord prevents many common conflicts.",
  "Cultural integration is a two-way process that benefits both newcomers and host communities. Language classes and community events facilitate meaningful connections.",
  "Financial planning involves setting clear goals, building emergency savings, and managing debt responsibly. Free financial counselling is available to those on lower incomes.",
  "Physical activity and a balanced diet reduce the risk of chronic disease. Workplaces that support staff wellness report lower absenteeism and higher productivity.",
  "Emergency preparedness involves planning, practising, and having supplies ready before a disaster strikes. Communities with preparedness networks recover more quickly.",
  "Affordable childcare enables more parents to participate in the workforce and supports children's early development. Government subsidies make quality childcare accessible.",
  "Recycling reduces pressure on landfill and conserves natural resources. Households that sort waste correctly make a meaningful contribution to environmental sustainability.",
  "Remote work offers flexibility but requires strong communication and self-discipline. Organisations that support remote workers with clear expectations see better outcomes.",
  "Civic participation strengthens democracy. Voting, attending public meetings, and joining community organisations give citizens a voice in decisions that affect them.",
  "Aged care services must meet the diverse needs of an ageing population. A skilled and compassionate workforce is essential to delivering quality care.",
  "Small businesses are a vital part of the local economy. Access to mentoring, training, and financial support significantly improves their chances of long-term success.",
  "Learning a second language opens doors to new opportunities and is associated with long-term cognitive benefits. Adults can learn effectively with consistent practice.",
  "Public libraries provide free access to resources and services that support education, employment, and community connection for all members of the public.",
  "Road safety programmes that combine education, enforcement, and engineering improvements have significantly reduced fatalities in many countries.",
  "Mental health in the workplace is a shared responsibility. Supportive managers, clear communication, and access to professional help all make a difference.",
  "Food security requires reliable access to affordable, nutritious food. Community gardens and food banks provide important safety nets for vulnerable households.",
  "Water conservation is essential in regions experiencing drought. Simple household measures can collectively make a significant difference to water supply.",
  "Neighbourhood watch programmes work best as part of a broader community safety strategy that includes good street lighting and strong police-community relations.",
  "Apprenticeships provide a practical pathway into skilled employment. They benefit both apprentices, who gain experience, and employers, who develop loyal staff.",
  "Online safety education helps young people recognise risks, protect their personal information, and respond appropriately to negative online experiences.",
  "Home energy efficiency measures such as insulation, efficient appliances, and solar panels reduce bills and lower household carbon emissions significantly.",
];

// Listening scripts (core topics)
const L_SCRIPTS = [
  "This discussion covers community volunteering in urban areas. The speakers explain how volunteering programmes are organised, who benefits, and how to get involved. They highlight that regular participation builds skills and friendships.",
  "In this workplace conversation, a manager and an employee discuss safety procedures for a new piece of equipment. They explain the steps for reporting a hazard and the importance of not operating equipment without proper training.",
  "This public health briefing outlines a campaign to encourage residents to get vaccinated. The speaker describes where clinics are located, how to book an appointment, and what to bring on the day.",
  "Two commuters discuss problems with the local bus service and compare it with using a bicycle for daily travel. They consider cost, time, and environmental impact in their comparison.",
  "A community centre coordinator explains a new programme designed to connect isolated residents with volunteers who can help with shopping and errands. Listeners are encouraged to register online.",
  "A consumer affairs officer explains what to do when a product is faulty. Steps include contacting the retailer, keeping the receipt, and escalating to a consumer protection agency if necessary.",
  "A careers adviser discusses how to prepare for a job interview, including researching the employer, practising common questions, and choosing appropriate clothing for a professional setting.",
  "An emergency services officer explains how to prepare a household emergency kit and what to do during a storm. Residents are advised to charge devices, store water, and follow official evacuation orders.",
  "A librarian explains the digital literacy classes available at the local library, including basic computer skills, using email safely, and navigating government services online.",
  "A tenants' rights advocate outlines what tenants can do if their landlord refuses to make repairs. Options include written requests, mediation services, and housing tribunal applications.",
  "A settlement worker describes language and employment programmes available to new immigrants. The programmes are free, community-based, and designed to help participants build local networks.",
  "A financial counsellor explains how to create a simple budget, prioritise essential expenses, and start building an emergency savings fund on a low income.",
  "A health promotion officer describes free exercise classes and nutrition workshops available at community centres as part of a local healthy lifestyles campaign.",
  "An emergency preparedness trainer outlines the contents of a home emergency kit and explains how households should plan for a power outage lasting several days.",
  "A childcare coordinator explains the types of government-subsidised childcare available, how to apply for a place, and what documentation is required for the subsidy.",
  "A council waste officer explains the new three-bin recycling system, including what can go in each bin and the consequences of contaminating recycling with non-recyclable items.",
  "A manager outlines the organisation's new remote work policy, including expectations for availability, communication, and the process for requesting remote work arrangements.",
  "A local councillor encourages residents to participate in an upcoming community consultation on a proposed park redevelopment. Residents can attend a public meeting or complete an online survey.",
  "An aged care coordinator describes available services for elderly residents, including home care, meals delivery, transport assistance, and residential aged care options.",
  "A business development officer explains grant programmes available to help small businesses with marketing, equipment, and training costs.",
  "A language school coordinator explains the intake process for adult English classes, including a placement test, the course structure, and what learners should bring on their first day.",
  "A library manager explains new digital services, including e-book borrowing, online databases, and virtual story-time sessions for children.",
  "A road safety educator explains the rules for using shared paths, the importance of helmet use for cyclists, and how to behave safely at intersections.",
  "A workplace mental health coordinator introduces a new employee assistance programme offering free counselling sessions, a wellness app, and peer support training for managers.",
  "A community food bank volunteer explains how the food bank operates, how to access a food parcel, and how local businesses and residents can donate food or funds.",
  "A water authority officer explains water restrictions currently in place and provides practical tips for reducing household water consumption during the drought period.",
  "A police community liaison officer explains how neighbourhood watch works, what to report, how to report it, and what residents should not do when they see suspicious activity.",
  "A training organisation outlines an apprenticeship programme in construction, covering the application process, wage rates, study requirements, and career pathways after completion.",
  "An online safety educator presents to a community group about how to help young people stay safe online, including privacy settings, recognising risks, and starting conversations at home.",
  "An energy retailer's adviser explains a government-supported programme that offers rebates for households that install solar panels or upgrade to energy-efficient appliances.",
];

function generateReading(n) {
  const idx = n - 31;
  const num = String(n).padStart(3,"0");
  const topic = TOPICS[idx];
  const passage = PASSAGES[idx];

  // 5 MCQ questions + 3 fill + 2 reorder = 10 questions for PTE Core Reading
  const questions = [];
  for (let qi = 0; qi < 5; qi++) {
    const rq = READING_QS[qi % READING_QS.length];
    questions.push({
      id: `pte-reading-${num}-q${String(qi+1).padStart(2,"0")}`,
      questionType: "reading_comprehension",
      prompt: rq.q,
      options: rq.opts,
      correctAnswer: rq.ans,
      explanation: rq.exp,
      difficulty: qi < 2 ? "easy" : qi < 4 ? "medium" : "hard",
      topic,
    });
  }
  for (let qi = 5; qi < 8; qi++) {
    questions.push({
      id: `pte-reading-${num}-q${String(qi+1).padStart(2,"0")}`,
      questionType: "fill_in_the_blank",
      prompt: `Complete the sentence from a text about ${topic}: "Without adequate support, participants are most likely to _____ over time."`,
      correctAnswer: "disengage",
      altAnswers: ["withdraw","drop out","lose motivation"],
      explanation: "The context implies that lack of support leads to disengagement.",
      difficulty: "medium",
      topic,
    });
  }
  for (let qi = 8; qi < 10; qi++) {
    questions.push({
      id: `pte-reading-${num}-q${String(qi+1).padStart(2,"0")}`,
      questionType: "reorder_paragraphs",
      prompt: `Re-order the sentences to form a coherent paragraph about ${topic}.\n1. ${passage.split(". ")[0] || "Context is provided."}.\n2. ${passage.split(". ")[1] || "Support is essential."}.\n3. ${passage.split(". ")[2] || "Outcomes depend on engagement."}.`,
      correctAnswer: "1,2,3",
      explanation: "The logical order follows introduction → detail → conclusion.",
      difficulty: "medium",
      topic,
    });
  }
  return {
    id: `pte-reading-${num}`,
    exam: "pte",
    section: "reading",
    type: "section",
    title: `PTE Core Reading Practice Test ${n}`,
    variant: "core",
    durationSeconds: 2700,
    questionCount: 10,
    instructions: "PTE Core Reading section. Tasks reflect everyday and practical texts relevant to community life and employment.",
    questions,
  };
}

function generateListening(n) {
  const idx = n - 31;
  const num = String(n).padStart(3,"0");
  const topic = TOPICS[idx];
  const script = L_SCRIPTS[idx];

  const listeningScripts = [
    {
      id: `pte-listening-${num}-s1`,
      sectionPart: 1,
      title: `Conversation: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
      script,
      audioUrl: "",
      internalVoiceConfig: { hidden: true },
    },
  ];
  const questions = [];
  for (let qi = 0; qi < 8; qi++) {
    const lq = LISTENING_QS[qi % LISTENING_QS.length];
    questions.push({
      id: `pte-listening-${num}-q${String(qi+1).padStart(2,"0")}`,
      questionType: qi < 5 ? "multiple_choice_single" : "fill_in_the_blank",
      part: 1,
      audioScriptId: `pte-listening-${num}-s1`,
      prompt: qi < 5 ? lq.q : `What key word is missing? "Without community support, the programme would _____ to reach its goals."`,
      ...(qi < 5 ? {
        options: lq.opts,
        correctAnswer: lq.ans,
        explanation: lq.exp,
      } : {
        correctAnswer: "struggle",
        altAnswers: ["fail","be unable"],
        explanation: "Context implies difficulty without support.",
      }),
      difficulty: qi < 3 ? "easy" : qi < 6 ? "medium" : "hard",
      topic,
    });
  }
  for (let qi = 8; qi < 12; qi++) {
    const lq = LISTENING_QS[(qi+2) % LISTENING_QS.length];
    questions.push({
      id: `pte-listening-${num}-q${String(qi+1).padStart(2,"0")}`,
      questionType: "multiple_choice_single",
      part: 1,
      audioScriptId: `pte-listening-${num}-s1`,
      prompt: lq.q,
      options: lq.opts,
      correctAnswer: lq.ans,
      explanation: lq.exp,
      difficulty: "medium",
      topic,
    });
  }
  return {
    id: `pte-listening-${num}`,
    exam: "pte",
    section: "listening",
    type: "section",
    title: `PTE Core Listening Practice Test ${n}`,
    variant: "core",
    durationSeconds: 1800,
    questionCount: 12,
    instructions: "PTE Core Listening section. Listen to conversations and short lectures about everyday topics.",
    listeningScripts,
    questions,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
let created = 0;
for (let n = 31; n <= 60; n++) {
  const num = String(n).padStart(3,"0");

  const rPath = path.join(BASE, "reading", `test-${num}.json`);
  if (!fs.existsSync(rPath)) {
    fs.writeFileSync(rPath, JSON.stringify(generateReading(n), null, 2));
    console.log(`✅  reading/test-${num}.json`);
    created++;
  } else {
    console.log(`⏭  reading/test-${num}.json already exists`);
  }

  const lPath = path.join(BASE, "listening", `test-${num}.json`);
  if (!fs.existsSync(lPath)) {
    fs.writeFileSync(lPath, JSON.stringify(generateListening(n), null, 2));
    console.log(`✅  listening/test-${num}.json`);
    created++;
  } else {
    console.log(`⏭  listening/test-${num}.json already exists`);
  }
}
console.log(`\n📊  Done: ${created} files created.`);
