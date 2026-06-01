#!/usr/bin/env node
// tools/generate-celpip-ls.js
// Generates CELPIP General LS section tests (031-060) for all 4 sections.
// CELPIP General-LS focuses on everyday Canadian life situations.
// Run: node tools/generate-celpip-ls.js
"use strict";
const fs   = require("fs");
const path = require("path");

const BASE = path.resolve(__dirname, "../content/celpip");

const TOPICS = [
  "moving to a new neighbourhood","renting an apartment","grocery shopping tips",
  "using public libraries","public transit in Canada","applying for a driver's licence",
  "opening a bank account","finding a family doctor","registering children for school",
  "recycling and composting in Canada","winter safety tips","community centre programmes",
  "using a food bank","finding employment services","workplace communication",
  "Canadian weather and seasons","healthcare system navigation","volunteering locally",
  "using online government services","renewing a health card","setting up utilities",
  "neighbourhood community events","managing household budgets","connecting with neighbours",
  "outdoor recreation in Canada","cultural festivals in Canada","local farmer's markets",
  "childcare options in Canada","road safety for new Canadians","home maintenance basics",
];

// CELPIP-style listening scripts (everyday Canadian situations)
const L_SCRIPTS = [
  "A newcomer calls the local community welcome centre to ask about resources available in their new neighbourhood. The coordinator explains the range of services, including a newcomers' café, a language exchange programme, and a free furniture bank for families who need household items.",
  "Two friends discuss the process of finding and renting an apartment in Canada. They compare experiences with landlords, explain the concept of a damage deposit, and discuss tenants' rights under provincial law.",
  "A radio programme host interviews a nutritionist about healthy grocery shopping on a limited budget. The nutritionist recommends buying seasonal produce, using store flyers to plan meals, and comparing unit prices rather than package prices.",
  "A librarian explains the services available at the public library to a new library card holder. Services include e-book lending, computer access, English conversation circles, and a job search assistance programme.",
  "Two colleagues on a bus discuss how to navigate the city's transit system. They explain how to use the transit app, load money onto a transit card, and plan a multi-leg journey across different transit zones.",
  "A community information session explains the steps required to apply for a Canadian driver's licence, including knowledge tests, vision tests, graduated licensing requirements, and where to book road tests.",
  "A bank teller explains to a new customer the different types of bank accounts available, the documents needed to open an account, and the differences between debit and credit cards.",
  "A radio health segment explains how to register with a family doctor in Canada, what to do when you cannot find a doctor accepting new patients, and when to use a walk-in clinic versus an emergency room.",
  "A school office administrator explains to a parent how to register their child for school, what documents are required, how the school year is structured, and what supports are available for children who are new to English.",
  "A municipality's waste services coordinator explains the new three-bin system for sorting recycling, compostable materials, and general rubbish, and clarifies common items that residents often sort incorrectly.",
  "A community centre instructor runs a winter safety session, covering how to dress in layers, how to treat icy paths at home, safe driving practices in snow, and when to call emergency services.",
  "A recreation coordinator describes the programmes available at the community centre, including drop-in sports, swimming lessons, fitness classes, and a seniors' social programme.",
  "A food bank coordinator explains how to access the food bank, what documents are needed, how often clients can visit, and how community members can donate food or volunteer.",
  "An employment services counsellor explains the services available at the employment centre, including resume help, interview preparation, job search workshops, and connections to employers.",
  "A manager leads a short training session on professional communication in the workplace, including how to address colleagues and supervisors, how to write a professional email, and how to give and receive feedback.",
  "A meteorologist on local radio explains the seasonal weather patterns in Canada and gives practical advice for each season, including what clothing to buy, how to prepare a car for winter, and when to book air conditioning service.",
  "A health information line advisor explains how the provincial health insurance system works, including what is covered, what requires a referral, how to access specialist care, and how to appeal a coverage decision.",
  "A volunteer coordinator from a non-profit organisation explains how new Canadians can get involved in volunteering, the benefits of volunteering for building a local network, and how to find opportunities online.",
  "A presenter from a government agency explains how to access provincial government services online, including updating a home address, applying for a health card, and completing tax forms.",
  "A customer service officer from the provincial health authority explains the steps for renewing an expired health card, including required documents, how to book an appointment, and processing times.",
  "A utilities company representative explains how to set up electricity, gas, and internet services in a new home, including what to look for in a contract, how to compare plans, and how to submit a meter reading.",
  "Two neighbours discuss an upcoming street festival organised by their community association. They explain how to register a stall, what permits are needed, and how volunteers can help on the day.",
  "A financial counsellor gives practical advice on creating a household budget, tracking spending, reducing unnecessary costs, and building a small emergency fund.",
  "A community connector from a local organisation explains to a newcomer how to meet neighbours, get involved in street associations, and find cultural and social groups in the community.",
  "A parks and recreation officer explains the outdoor programmes available in local parks, including hiking groups, outdoor fitness classes, sports leagues, and winter skating programmes.",
  "A festival organiser explains a local multicultural festival to a new community member, describing the food stalls, entertainment, cultural performances, and how to participate as a volunteer.",
  "A market manager explains how the local farmer's market operates, including when it runs, where vendors can apply for a stall, and how to find out what will be available each week.",
  "A childcare advisor explains the different types of licensed childcare available, how to apply for a childcare subsidy, and what questions to ask when touring a childcare centre.",
  "A driver training instructor explains road safety rules specific to new Canadian drivers, including winter driving techniques, the rules for interacting with cyclists and pedestrians, and how to handle black ice.",
  "A property maintenance company representative advises a new homeowner on seasonal home maintenance tasks, including gutter cleaning, furnace filter replacement, and checking smoke detector batteries.",
];

// Listening MCQs
const LQS = [
  {q:"What is the main purpose of this conversation?",opts:["To explain a complaint procedure","To describe available community resources","To advertise a paid service","To explain a government policy"],a:"To describe available community resources",e:"The conversation introduces resources for the community."},
  {q:"What does the speaker recommend doing first?",opts:["Visiting the office in person","Calling the helpline","Completing an online application","Asking a neighbour for advice"],a:"Calling the helpline",e:"The speaker advises calling first to get information."},
  {q:"What document does the speaker say is required?",opts:["A passport","Proof of address","A reference letter","A medical certificate"],a:"Proof of address",e:"The speaker specifies proof of address as the required document."},
  {q:"What is the speaker's main recommendation?",opts:["Use public transport","Compare options before deciding","Ask a professional for advice","Register as soon as possible"],a:"Compare options before deciding",e:"The speaker emphasises comparing before making a choice."},
  {q:"What problem does the speaker identify?",opts:["High costs","Long waiting times","Lack of information","Inconvenient location"],a:"Long waiting times",e:"The speaker notes that waiting times are a challenge."},
  {q:"What will happen after the listener completes the first step?",opts:["They will receive a confirmation by email","They will be called for an interview","A staff member will visit their home","They will need to attend a workshop"],a:"They will receive a confirmation by email",e:"The speaker says email confirmation follows the first step."},
  {q:"What does the speaker say about the cost?",opts:["It is free","There is a one-time fee","It depends on income","It requires insurance"],a:"It is free",e:"The speaker explicitly states the service is free of charge."},
  {q:"Which of the following is NOT mentioned as a benefit of the programme?",opts:["Improving language skills","Building community connections","Receiving financial assistance","Finding employment"],a:"Receiving financial assistance",e:"Financial assistance is not mentioned as a programme benefit."},
  {q:"What should the listener do if they have further questions?",opts:["Visit the website","Call the office","Email a staff member","Attend a workshop"],a:"Visit the website",e:"The speaker directs listeners to the website for more information."},
  {q:"What does the speaker say about eligibility?",opts:["Anyone can apply","Only citizens can apply","Eligibility depends on income","Proof of residency is required"],a:"Proof of residency is required",e:"The speaker mentions residency proof as an eligibility requirement."},
];

// Reading passages and MCQs
const R_PASSAGES = TOPICS.map((t, i) => ({
  title: `Understanding ${t.charAt(0).toUpperCase() + t.slice(1)}`,
  text: [
    `Many newcomers to Canada find that understanding ${t} is an important early step in settling into their new community.`,
    `Local community organisations and government services offer a range of support options related to ${t}. These are often free or low-cost and available in multiple languages.`,
    `Taking time to research available resources and asking for help when needed are key strategies for navigating ${t} successfully in Canada.`,
  ].join(" "),
}));

const RMCQS = [
  {q:"According to the passage, what is the most important first step?",opts:["Researching available resources","Contacting a professional","Speaking with neighbours","Visiting a government office"],a:"Researching available resources",e:"The passage recommends researching as the first step."},
  {q:"The word 'navigate' in the passage most nearly means:",opts:["travel through","find a path through","avoid","discuss"],a:"find a path through",e:"'Navigate' here means to find one's way through a complex situation."},
  {q:"What does the passage say about the cost of support services?",opts:["They are always free","They are often free or low-cost","They require a government referral","The cost depends on immigration status"],a:"They are often free or low-cost",e:"The passage states services are often free or low-cost."},
  {q:"Which of the following can be inferred from the passage?",opts:["Newcomers rarely need help","Multiple languages are often available","Only citizens can access services","Services are only available online"],a:"Multiple languages are often available",e:"The passage explicitly mentions multiple languages."},
  {q:"What is the main purpose of the passage?",opts:["To advertise a government programme","To inform newcomers about support options","To explain immigration requirements","To describe Canadian culture"],a:"To inform newcomers about support options",e:"The passage aims to inform about available support."},
];

// Writing task prompts (CELPIP General LS style)
const W_PROMPTS = [
  ["Write a letter to your new neighbour introducing yourself and suggesting a time to meet for coffee.","Write a short survey response about what community services are most important to you."],
  ["Write an email to your landlord reporting a maintenance issue in your apartment.","Write a note to leave for a delivery person explaining where to leave a package."],
  ["Write a message to a friend recommending a grocery store and explaining why you like it.","Write a short response to a community survey about grocery services in your area."],
  ["Write a letter to the library requesting information about their programmes for newcomers.","Write a short post for a community board about a book you recently enjoyed."],
  ["Write an email to a friend explaining how to use the city's public transit system.","Write a complaint letter to the transit authority about a service issue you experienced."],
  ["Write a letter to the licensing authority asking about the process for converting your foreign licence.","Write a short note to a friend explaining what you learned in a driving knowledge test."],
  ["Write an email to your bank asking about the process for setting up automatic bill payments.","Write a short review of the customer service you received when opening your bank account."],
  ["Write a letter to a new doctor's office requesting a first appointment and listing your medical history.","Write a message to a friend recommending a walk-in clinic you found helpful."],
  ["Write a letter to the school principal introducing your child and asking about available support programmes.","Write a note to your child's teacher introducing yourself and asking how you can support learning at home."],
  ["Write a note to your building manager asking for clarification on the recycling programme.","Write a short message to a neighbour explaining why it is important to sort recyclables correctly."],
  ["Write a message to a community group sharing winter safety tips you have found useful.","Write a short email to your employer explaining that you were late due to icy roads."],
  ["Write a letter to the community centre requesting information about programmes for seniors.","Write a short survey response about what new programme you would like the community centre to offer."],
  ["Write a letter to the food bank requesting information about how to access assistance.","Write a thank-you note to a food bank volunteer for their support."],
  ["Write an email to an employment centre asking to book an appointment with a career counsellor.","Write a short cover letter for a job you are interested in applying for."],
  ["Write a professional email to a colleague asking for help with a workplace task.","Write a short message to your supervisor explaining that you will be absent tomorrow."],
  ["Write a message to a friend who is moving to Canada describing what to expect from the winter season.","Write a short review of winter clothing you purchased that you found effective."],
  ["Write a letter to a health information line asking about how to find a specialist in your area.","Write a short email to a friend explaining what you learned from a health appointment."],
  ["Write a letter to a volunteer organisation expressing your interest in volunteering.","Write a short message to a friend encouraging them to volunteer in the community."],
  ["Write an email to a government service asking how to complete a specific online task.","Write a short guide for a family member explaining how to use an online government portal."],
  ["Write a letter to the health authority asking how to renew your health card.","Write a short message to a friend reminding them that their health card is about to expire."],
  ["Write an email to a utilities company asking about the process for setting up electricity service.","Write a short note to a housemate explaining how to submit a monthly meter reading."],
  ["Write a letter to your community association volunteering to help organise a street festival.","Write a short invitation to a neighbour to attend a community event."],
  ["Write an email to a financial counsellor asking for advice on creating a household budget.","Write a short message to a family member sharing a budgeting tip you have found useful."],
  ["Write a letter to your community welcome centre asking about social groups in your area.","Write a short message to a new neighbour welcoming them to the street."],
  ["Write a letter to the parks authority asking about outdoor programmes available in your area.","Write a short message to a friend inviting them to join you for an outdoor activity."],
  ["Write a letter to the festival organisers asking how to participate in a multicultural festival.","Write a short social media post sharing your experience of attending a cultural festival."],
  ["Write an email to the farmer's market manager asking about becoming a vendor.","Write a short message to a friend recommending your favourite stall at the local market."],
  ["Write a letter to a childcare centre requesting a tour and asking about their daily programme.","Write a short message to a friend asking for their recommendation for a childcare provider."],
  ["Write a letter to a driving school asking about winter driving courses for new Canadians.","Write a short message to a friend explaining a road safety rule you recently learned."],
  ["Write a letter to your building manager asking for advice on seasonal home maintenance.","Write a short note to a housemate reminding them of a home maintenance task that needs to be done."],
];

// Speaking prompts (CELPIP General LS style — 3 tasks per test)
const SP_TOPICS = TOPICS.map((t,i) => [
  `Talk about your experience with ${t} since arriving in Canada. What challenges have you faced and how have you addressed them?`,
  `Describe a situation where you needed help with ${t}. Who helped you, and what was the outcome?`,
  `What advice would you give to a friend who is new to Canada about ${t}? Give specific suggestions.`,
]);

// ─── Generators ──────────────────────────────────────────────────────────────
function makeListening(n) {
  const idx = n - 31, num = String(n).padStart(3,"0");
  const topic = TOPICS[idx], script = L_SCRIPTS[idx];
  const questions = LQS.slice(0,8).map((lq,qi) => ({
    id: `celpip-listening-${num}-q${String(qi+1).padStart(2,"0")}`,
    questionType: "multiple_choice_single",
    part: 1,
    audioScriptId: `celpip-listening-${num}-s1`,
    prompt: lq.q, options: lq.opts, correctAnswer: lq.a, explanation: lq.e,
    difficulty: qi < 3 ? "easy" : qi < 6 ? "medium" : "hard",
    topic,
  }));
  // Add 2 fill questions
  [["you should always ___ first before making a major decision","research"],
   ["community resources are often ___ or low-cost for eligible residents","free"]].forEach(([prompt,ans],qi) => {
    questions.push({
      id: `celpip-listening-${num}-q${String(qi+9).padStart(2,"0")}`,
      questionType: "fill_in_the_blank",
      part: 1,
      audioScriptId: `celpip-listening-${num}-s1`,
      prompt: `Complete the sentence: "${prompt}."`,
      correctAnswer: ans,
      difficulty: "medium", topic,
    });
  });
  return {
    id: `celpip-listening-${num}`, exam: "celpip", section: "listening", type: "section",
    title: `CELPIP General LS Listening Practice Test ${n}`,
    variant: "general_ls", durationSeconds: 1800, questionCount: 10,
    instructions: "Listen to conversations and answer the questions.",
    listeningScripts: [{
      id: `celpip-listening-${num}-s1`, sectionPart: 1,
      title: `Conversation: ${topic.charAt(0).toUpperCase()+topic.slice(1)}`,
      script, audioUrl: "", internalVoiceConfig: { hidden: true },
    }],
    questions,
  };
}

function makeReading(n) {
  const idx = n - 31, num = String(n).padStart(3,"0");
  const topic = TOPICS[idx], rp = R_PASSAGES[idx];
  const questions = RMCQS.map((rq,qi) => ({
    id: `celpip-reading-${num}-q${String(qi+1).padStart(2,"0")}`,
    questionType: "reading_comprehension",
    prompt: rq.q, options: rq.opts, correctAnswer: rq.a, explanation: rq.e,
    difficulty: qi < 2 ? "easy" : qi < 4 ? "medium" : "hard",
    topic,
  }));
  // Add fill questions
  [["Community organisations often offer services in ___ languages to help newcomers","multiple"],
   ["Asking for ___ when needed is a key strategy for settling in Canada","help"]].forEach(([prompt,ans],qi) => {
    questions.push({
      id: `celpip-reading-${num}-q${String(qi+6).padStart(2,"0")}`,
      questionType: "fill_in_the_blank",
      prompt: `Complete the sentence based on the passage: "${prompt}."`,
      correctAnswer: ans,
      difficulty: "medium", topic,
    });
  });
  return {
    id: `celpip-reading-${num}`, exam: "celpip", section: "reading", type: "section",
    title: `CELPIP General LS Reading Practice Test ${n}`,
    variant: "general_ls", durationSeconds: 2700, questionCount: 7,
    instructions: "Read the passage and answer the questions.",
    passages: [{ id: `celpip-reading-${num}-p1`, title: rp.title, text: rp.text }],
    questions: questions.map(q => ({ ...q, passageId: `celpip-reading-${num}-p1` })),
  };
}

function makeWriting(n) {
  const idx = n - 31, num = String(n).padStart(3,"0");
  const topic = TOPICS[idx], prompts = W_PROMPTS[idx];
  return {
    id: `celpip-writing-${num}`, exam: "celpip", section: "writing", type: "section",
    title: `CELPIP General LS Writing Practice Test ${n}`,
    variant: "general_ls", durationSeconds: 3600, questionCount: 2,
    instructions: "Complete both writing tasks within the time limit.",
    questions: prompts.map((p,qi) => ({
      id: `celpip-writing-${num}-q0${qi+1}`,
      questionType: "writing_task", prompt: p,
      modelAnswer: `A strong response addresses the task directly, is well-organised, uses a range of vocabulary, and is appropriate in tone and format for the audience described.`,
      rubric: ["task response","organization","vocabulary","grammar","development"],
      difficulty: "medium", topic,
      wordTarget: qi === 0 ? 150 : 75,
      letterType: qi === 0 ? "semi-formal" : "informal",
    })),
  };
}

function makeSpeaking(n) {
  const idx = n - 31, num = String(n).padStart(3,"0");
  const topic = TOPICS[idx], sps = SP_TOPICS[idx];
  return {
    id: `celpip-speaking-${num}`, exam: "celpip", section: "speaking", type: "section",
    title: `CELPIP General LS Speaking Practice Test ${n}`,
    variant: "general_ls", durationSeconds: 900, questionCount: 3,
    instructions: "Record responses and review using the rubric.",
    questions: sps.map((p,qi) => ({
      id: `celpip-speaking-${num}-q0${qi+1}`,
      questionType: "speaking_task", prompt: p,
      prepSeconds: qi === 0 ? 15 : 30,
      responseSeconds: qi === 0 ? 90 : 120,
      rubric: ["fluency","coherence","vocabulary","grammar","pronunciation"],
      difficulty: "medium", topic,
    })),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
let created = 0;
for (let n = 31; n <= 60; n++) {
  const num = String(n).padStart(3,"0");
  const files = [
    [path.join(BASE,"listening",`test-${num}.json`), makeListening(n)],
    [path.join(BASE,"reading",`test-${num}.json`), makeReading(n)],
    [path.join(BASE,"writing",`test-${num}.json`), makeWriting(n)],
    [path.join(BASE,"speaking",`test-${num}.json`), makeSpeaking(n)],
  ];
  for (const [fpath, data] of files) {
    if (!fs.existsSync(fpath)) {
      fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
      console.log(`✅  ${path.relative(path.resolve(__dirname,".."), fpath)}`);
      created++;
    } else {
      console.log(`⏭  ${path.relative(path.resolve(__dirname,".."), fpath)} already exists`);
    }
  }
}
console.log(`\n📊  Done: ${created} files created.`);
