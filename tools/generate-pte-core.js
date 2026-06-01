#!/usr/bin/env node
// tools/generate-pte-core.js
// Creates PTE Core Speaking & Writing test files (test-031 to test-060).
// PTE Core is aimed at permanent residency / work visa applicants; topics are
// everyday / practical rather than purely academic.
// Run: node tools/generate-pte-core.js
"use strict";

const fs   = require("fs");
const path = require("path");

const OUT_DIR = path.resolve(__dirname, "../content/pte/speaking-writing");

// ─── Topic pool for PTE Core (everyday / practical / community focus) ────────
const TOPICS = [
  "community services",      // 31
  "workplace safety",        // 32
  "public health campaigns", // 33
  "local transport",         // 34
  "neighbourhood volunteering", // 35
  "consumer rights",         // 36
  "job application skills",  // 37
  "climate change adaptation",// 38
  "digital literacy",        // 39
  "housing and tenancy",     // 40
  "cultural integration",    // 41
  "financial planning",      // 42
  "healthy lifestyles",      // 43
  "emergency preparedness",  // 44
  "childcare options",       // 45
  "recycling and waste",     // 46
  "remote work trends",      // 47
  "civic participation",     // 48
  "senior care services",    // 49
  "small business support",  // 50
  "language learning",       // 51
  "public library resources",// 52
  "road safety",             // 53
  "mental health awareness", // 54
  "food security",           // 55
  "water conservation",      // 56
  "neighbourhood watch",     // 57
  "apprenticeship programmes",// 58
  "social media safety",     // 59
  "renewable energy at home",// 60
];

// PTE Core Speaking & Writing task types (7 per test, mix of speaking+writing)
// Core has fewer academic writing tasks and more practical/everyday writing
const TASK_SEQUENCE = [
  { type: "read_aloud",        rubric: ["content","pronunciation","fluency"] },
  { type: "repeat_sentence",   rubric: ["content","pronunciation","fluency"] },
  { type: "describe_image",    rubric: ["content","pronunciation","fluency"] },
  { type: "retell_lecture",    rubric: ["content","pronunciation","fluency"] },
  { type: "answer_short_question", rubric: ["content","pronunciation","fluency"] },
  { type: "summarize_written_text", rubric: ["content","form","grammar","vocabulary","spelling"] },
  { type: "write_essay",       rubric: ["content","form","grammar","vocabulary","spelling","discourse"] },
];

// Practical essay prompts for PTE Core (one per test, rotating)
const ESSAY_PROMPTS = [
  "Some people think that individuals should be responsible for their own health and lifestyle choices. Others believe governments should regulate unhealthy behaviours. Discuss both views and give your own opinion.",
  "Many companies now offer flexible working hours and the option to work from home. Do the advantages of this trend outweigh the disadvantages?",
  "Public transport systems in many cities are unreliable and overcrowded. What are the causes of this problem, and what measures could be taken to improve the situation?",
  "Some people believe that immigrants should fully adopt the culture and values of their new country. Others think they should be free to maintain their own culture. Discuss both views.",
  "Governments spend large amounts of money on public libraries. Some people think this money would be better spent on digital resources and the internet. To what extent do you agree?",
  "In many countries the number of people choosing to live alone is increasing. What are the reasons for this, and is it a positive or negative development?",
  "Some people argue that international tourism causes more damage than benefit to local communities. To what extent do you agree or disagree?",
  "Many young people today prefer vocational training over university education. What are the advantages and disadvantages of this trend?",
  "Some people believe that social media has had a negative impact on communication between people. Others disagree. Discuss both views and give your own opinion.",
  "Governments should invest more in public parks and green spaces in cities. To what extent do you agree or disagree?",
  "Some people think it is more important to spend time developing personal interests than spending time with family and friends. Discuss both views and give your own opinion.",
  "It is better for children to begin learning a foreign language at primary school rather than at secondary school. Do you agree or disagree?",
  "Many people believe that international sporting events such as the Olympics are a waste of public money. Others think they bring important benefits. Discuss both views and give your own opinion.",
  "Some people prefer to shop at local markets rather than large supermarkets. What are the advantages and disadvantages of each option?",
  "Governments should make it compulsory for citizens to vote in elections. To what extent do you agree or disagree?",
  "Some experts believe that it is better for children to learn in mixed ability groups at school. Others disagree. Discuss both views.",
  "In many countries, people are living longer. What are the effects of this on individuals and society?",
  "Some people think that the best way to reduce crime is to increase the number of police officers. Others believe that social and economic reforms are more effective. Discuss both views.",
  "Many people believe that consumer culture encourages people to buy things they do not need. To what extent do you agree or disagree?",
  "Advertising aimed at children should be strictly controlled or even banned. To what extent do you agree or disagree?",
  "Some people say that the internet has made it easier to spread false information. Others believe that the internet is a positive force for truth. Discuss both views.",
  "It is more important to spend money on preventing illness than treating it. To what extent do you agree or disagree?",
  "In some countries, paying for household rubbish collection has led to more recycling. Should all countries adopt this approach?",
  "Some people believe that young people should be required to do community service. Others think this should be optional. Discuss both views and give your opinion.",
  "The growing gap between the rich and the poor is one of the biggest challenges facing the world today. What are the causes and what can be done to address this issue?",
  "Some people think that having a career is more important than having a family. To what extent do you agree or disagree?",
  "In many countries, traditional festivals and customs are disappearing. Is this a positive or negative development?",
  "Some people think that employers should not consider a candidate's physical appearance when hiring. Others believe appearance is a valid consideration. Discuss both views.",
  "The overuse of social media among teenagers is causing serious social and psychological problems. To what extent do you agree or disagree?",
  "Some people think that the government should provide free public Wi-Fi in all public spaces. To what extent do you agree or disagree?",
];

// Summarise Written Text passages (practical topics)
const SWT_PASSAGES = [
  "Community volunteering programmes have grown significantly in recent decades, providing benefits both to participants and the wider community. Research shows that volunteers report higher levels of well-being, stronger social connections, and greater sense of purpose compared to non-volunteers. For communities, volunteers fill gaps in social services, support schools and hospitals, and strengthen neighbourhood bonds.",
  "Workplace safety regulations require employers to conduct regular risk assessments, provide appropriate protective equipment, and train staff in emergency procedures. Studies indicate that workplaces with strong safety cultures experience fewer accidents, lower absenteeism, and higher productivity. Employees who feel safe at work also report greater job satisfaction.",
  "Public health campaigns targeting diet and physical activity have shown measurable results in reducing rates of obesity and related conditions. Campaigns combining mass media messaging with local community programmes tend to be more effective than either approach alone. However, long-term behaviour change requires sustained investment over many years.",
  "Urban public transport networks face increasing demand due to population growth and rising fuel costs. Cities that invest in integrated ticketing, frequent services, and modern vehicles see higher rates of public transport use and corresponding reductions in traffic congestion. Funding for these systems typically requires a mix of government subsidy and user fares.",
  "Neighbourhood volunteering schemes connect local residents with practical tasks such as maintaining parks, helping elderly neighbours, and organising community events. Participants develop skills, build friendships, and contribute to a more cohesive neighbourhood. Local councils that support such schemes through small grants and coordination often see higher participation rates.",
  "Consumer rights legislation protects buyers from unfair trading practices, defective goods, and misleading advertising. Strong consumer protection frameworks encourage confidence in markets, enabling economic growth. Consumers who understand their rights are better equipped to make informed purchasing decisions and seek redress when things go wrong.",
  "Effective job applications typically require a tailored cover letter, a clear and accurate CV, and thorough preparation for interviews. Applicants who research the employer, practise common interview questions, and follow up after interviews are statistically more likely to receive job offers. Career support services help job seekers develop these skills.",
  "Climate change adaptation strategies aim to reduce the vulnerability of communities and ecosystems to climate impacts such as flooding, drought, and extreme heat. Effective adaptation measures include improved drainage infrastructure, urban green spaces, heat action plans, and community early warning systems. Investment in adaptation is generally considered more cost-effective than managing the consequences of climate disasters.",
  "Digital literacy encompasses a range of skills including using devices safely, evaluating online information, and communicating effectively in digital environments. As more services move online, digital literacy has become essential for accessing employment, healthcare, education, and government services. Libraries, schools, and community organisations play an important role in teaching these skills.",
  "Tenancy law governs the relationship between landlords and tenants, setting out rights and responsibilities for both parties. Tenants are entitled to a safe, well-maintained property, adequate notice before eviction, and the return of their deposit at the end of a tenancy. Disputes between landlords and tenants are often resolved through mediation services or housing tribunals.",
  "Cultural integration programmes help newcomers to a country develop language skills, understand local customs, and build social networks. Research suggests that newcomers who participate in integration activities find employment more quickly and report higher levels of life satisfaction. Host communities also benefit from the diversity of perspectives and skills that migrants bring.",
  "Financial planning involves setting income and expenditure goals, building emergency savings, managing debt, and investing for the future. People who engage in financial planning are better prepared for unexpected expenses and retirement. Free financial counselling services are available in many communities for those on low incomes.",
  "Regular physical activity and a balanced diet are the cornerstones of a healthy lifestyle. Adults who meet recommended exercise guidelines of 150 minutes of moderate activity per week have lower rates of heart disease, diabetes, and certain cancers. Workplace wellness programmes and urban design that encourages walking and cycling can make it easier for people to be physically active.",
  "Emergency preparedness involves having a plan for responding to natural disasters, power outages, and other crises. Prepared households typically have emergency kits with food, water, medication, and important documents. Community preparedness networks, in which neighbours share information and resources during emergencies, have been shown to save lives.",
  "Childcare costs are a significant barrier to workforce participation for many families, particularly for mothers. Subsidised childcare and flexible working arrangements enable more parents to enter or remain in paid employment. Countries with affordable, high-quality childcare consistently report higher rates of female workforce participation and stronger economic performance.",
  "Waste management systems that separate recyclable materials at source reduce landfill volumes and lower the environmental impact of waste. Cities with well-designed recycling infrastructure and public education campaigns achieve higher recycling rates. Extended producer responsibility schemes, which require manufacturers to fund end-of-life product disposal, are increasingly used to encourage more sustainable product design.",
  "Remote work, accelerated by the COVID-19 pandemic, has become a permanent feature of many industries. Employees who work remotely report time and cost savings on commuting, while employers benefit from access to talent pools outside their immediate geography. However, remote work can lead to isolation and difficulties in maintaining workplace culture for some employees.",
  "Civic participation includes voting in elections, attending public meetings, joining community organisations, and engaging with local government. Research consistently shows that communities with high levels of civic participation have better public services, lower crime rates, and stronger social cohesion. Civic education programmes in schools help develop these habits from an early age.",
  "Ageing populations in developed countries are increasing demand for aged care services including home care, residential care, and specialist dementia support. Governments face the challenge of funding these services sustainably while ensuring quality care. Workforce shortages in the care sector are a significant concern in many countries.",
  "Small business support programmes provide training, mentoring, grant funding, and access to networks for entrepreneurs. Evidence shows that supported businesses have higher survival rates and grow faster than unsupported ones. Local economic development agencies play an important role in connecting small businesses with resources.",
  "Language learning in adulthood is associated with cognitive benefits including improved memory and delayed onset of dementia. Adults who learn a second language develop greater cultural awareness and communication skills. Online platforms have made language learning more accessible and affordable, enabling more people to learn at their own pace.",
  "Public libraries provide free access to books, digital resources, internet access, and educational programmes for all members of the community. They serve as safe community gathering places and play an important role in supporting literacy and lifelong learning. Library usage has shifted in recent decades towards digital services and community programmes.",
  "Road safety measures including speed limits, seatbelt laws, and drink-driving restrictions have significantly reduced road fatalities in many countries. Infrastructure improvements such as safer road designs, better lighting, and separated cycling lanes also reduce crashes. Young drivers and pedestrians remain at higher risk and are targeted by specific safety campaigns.",
  "Mental health awareness programmes aim to reduce stigma, encourage help-seeking, and improve early identification of mental health conditions. Workplaces that implement mental health programmes report lower absenteeism and higher productivity. Peer support networks and community mental health services are important complements to clinical treatment.",
  "Food security exists when all people have reliable access to sufficient, safe, and nutritious food. Factors affecting food security include agricultural productivity, food distribution systems, income levels, and climate variability. Community food programmes, including food banks and community gardens, provide important safety nets for households at risk of food insecurity.",
  "Water conservation measures are essential in regions facing increasing water stress due to population growth and climate change. Household measures include installing water-efficient fixtures, collecting rainwater, and reducing garden watering. Large-scale measures include improved irrigation efficiency in agriculture and investment in water recycling infrastructure.",
  "Neighbourhood watch programmes involve community members monitoring and reporting suspicious activity in their local area. They work best in partnership with police and local authorities and are associated with reductions in residential burglary. Neighbourhood watch also builds social connections among residents, contributing to broader community safety.",
  "Apprenticeship programmes combine on-the-job training with structured learning, enabling young people and career changers to develop industry-specific skills while earning. Apprentices typically achieve faster employment outcomes than graduates in the same field, and employers benefit from workers trained to their specific needs. Government subsidies help make apprenticeships financially viable for smaller businesses.",
  "Online safety for young people is a growing concern as social media use increases. Risks include cyberbullying, exposure to inappropriate content, privacy breaches, and contact with strangers. Digital literacy education, parental guidance, and platform safety features all contribute to reducing these risks. Open conversations between children and trusted adults are particularly effective.",
  "Residential solar panels, heat pumps, and home insulation reduce household energy bills and carbon emissions. Government incentive schemes and falling technology costs have made these measures more accessible to homeowners. Communities that support group purchasing schemes or shared solar projects enable renters and those in multi-unit buildings to also benefit from renewable energy.",
];

// Read Aloud passages (practical / everyday)
const RA_PASSAGES = [
  "Local community centres offer a wide range of services to residents of all ages, from childcare and after-school programmes to classes for seniors and support groups for people with disabilities.",
  "Employers are legally required to identify and manage workplace hazards, provide employees with safety training, and ensure that all equipment is regularly inspected and maintained.",
  "Hand washing with soap and water for at least twenty seconds remains one of the most effective ways to prevent the spread of infectious diseases in community settings.",
  "Bus and train timetables are available on the transport authority's website, through the official app, and at customer service centres located in major stations throughout the city.",
  "Volunteers are needed to assist with the annual neighbourhood clean-up day scheduled for next Saturday. Participants should wear comfortable clothing and bring their own gardening gloves.",
  "Consumers who believe they have been treated unfairly by a business have the right to complain to the relevant consumer protection agency, which can investigate and order compensation.",
  "A well-written curriculum vitae should be no longer than two pages, clearly structured, free of spelling errors, and tailored to each position you apply for.",
  "Communities can reduce their vulnerability to flooding by maintaining drainage systems, avoiding construction on flood-prone land, and ensuring that residents have access to timely flood warnings.",
  "Basic digital skills, including using email, searching online safely, and protecting personal information, are increasingly essential for participating in modern working and civic life.",
  "Tenants who have unresolved disputes with their landlords are advised to seek advice from a tenancy advocacy service before taking the matter to a housing tribunal.",
  "Settlement services help newly arrived immigrants to access language classes, find employment, connect with community groups, and understand their rights and responsibilities in their new country.",
  "Setting aside a small amount of money each month into a dedicated savings account can provide an important financial buffer when unexpected expenses arise.",
  "The recommended daily intake of fruit and vegetables for adults is at least five portions, each portion being approximately eighty grams of fresh, frozen, or canned produce.",
  "In the event of a natural disaster, residents should follow the instructions of emergency services, evacuate if directed to do so, and avoid using roads that are required by emergency vehicles.",
  "Subsidised childcare places are available to eligible families through the national childcare programme. Applications can be made online or in person at the nearest family support centre.",
  "Households that sort their waste into general rubbish, recycling, and food waste bins help reduce the amount of material sent to landfill and lower the cost of waste collection.",
  "Many organisations now offer their employees the option to work from home for some or all of their working hours, a change that has significantly altered how workplaces are managed.",
  "Attending public meetings and submitting feedback on proposed planning decisions are effective ways for residents to influence decisions that affect their local community.",
  "Home care services provide practical support with daily tasks for older adults and people with disabilities, enabling them to continue living independently in their own homes.",
  "Small businesses can access free advice on marketing, financial management, and business planning through government-supported enterprise centres located throughout the region.",
  "Research shows that adults who regularly practise a second language maintain sharper memories and are better able to focus on complex tasks compared to those who speak only one language.",
  "Library cardholders can borrow books, e-books, audiobooks, and DVDs, access online databases and language learning tools, and use computers and printing facilities free of charge.",
  "Pedestrians and cyclists should always use marked crossings when available, make eye contact with drivers before crossing, and wear high-visibility clothing in low-light conditions.",
  "Workplaces that provide training in mental health first aid enable staff to identify early signs of distress in their colleagues and refer them to appropriate support services.",
  "Community food programmes rely on donations of non-perishable food items and financial contributions from local residents and businesses to support families experiencing hardship.",
  "Installing a dual-flush toilet, fixing dripping taps, and using a bucket rather than a hose when washing the car are simple measures that can significantly reduce household water use.",
  "Residents who notice suspicious activity in their neighbourhood should report it to police using the non-emergency number rather than confronting individuals directly.",
  "Apprenticeship programmes are open to school leavers, career changers, and adults returning to the workforce, and typically last between one and four years depending on the qualification.",
  "Parents and carers should regularly check the privacy settings on their children's devices, discuss online safety rules, and encourage children to talk to them if they see anything upsetting online.",
  "Solar panels installed on the roof of a typical family home can generate enough electricity to meet most of the household's daytime energy needs, with surplus power exported to the grid.",
];

// Short questions for answer_short_question (with answers)
const SHORT_QS = [
  { prompt: "What document do you need to present when starting a new job to prove your identity and right to work?", answer: "passport or identity documents" },
  { prompt: "What number should you call in a life-threatening emergency in most English-speaking countries?", answer: "emergency services number, such as 000, 911, or 999" },
  { prompt: "What is the term for the minimum wage that employers are legally required to pay their workers?", answer: "minimum wage" },
  { prompt: "What do we call the regular payment a tenant makes to a landlord in exchange for using a property?", answer: "rent" },
  { prompt: "What government document allows a non-citizen to live and work legally in a country?", answer: "visa or work permit" },
  { prompt: "What is the name of the process by which household waste is sorted so that materials like glass, paper and plastic can be used again?", answer: "recycling" },
  { prompt: "What do we call the document that summarises a person's education, work experience, and skills when applying for a job?", answer: "curriculum vitae or resume" },
  { prompt: "What term describes a workplace arrangement where employees can choose when to start and finish their working day?", answer: "flexible working hours" },
  { prompt: "What organisation in your country would you contact if you had a complaint about a product or service that the company refused to resolve?", answer: "consumer protection agency or ombudsman" },
  { prompt: "What is the name given to a person who moves permanently from one country to another?", answer: "immigrant or migrant" },
  { prompt: "What do we call the money set aside by a tenant at the start of a tenancy, held by the landlord as security against damage?", answer: "bond or security deposit" },
  { prompt: "What term describes the skills needed to use computers, smartphones, and the internet safely and effectively?", answer: "digital literacy" },
  { prompt: "What is the name of the government payment provided to people who are unemployed and looking for work?", answer: "unemployment benefit or job seeker's allowance" },
  { prompt: "What do we call a formal agreement between an employer and an apprentice that sets out the terms of their training?", answer: "apprenticeship agreement" },
  { prompt: "What term describes the process of reducing the amount of waste sent to landfill by buying less and reusing items?", answer: "waste reduction" },
  { prompt: "What is the name given to the regular payment made by an employer into an employee's retirement savings fund?", answer: "superannuation or pension contribution" },
  { prompt: "What organisation manages and maintains roads, footpaths, and local parks in most Australian, British, and Canadian cities?", answer: "local council or municipality" },
  { prompt: "What term describes a legal document that gives one person the authority to act on behalf of another person in financial or legal matters?", answer: "power of attorney" },
  { prompt: "What do we call the system that allows workers to take paid time off when they are sick?", answer: "sick leave" },
  { prompt: "What is the term for a benefit provided by employers that allows workers to buy goods or services at a reduced price?", answer: "employee discount or staff benefit" },
  { prompt: "What do we call the document issued by a bank that shows all recent transactions on a customer's account?", answer: "bank statement" },
  { prompt: "What term describes the legal right of employees to request a safe working environment free from hazards?", answer: "workplace health and safety rights" },
  { prompt: "What is the name given to a free community service that provides legal advice to people who cannot afford a lawyer?", answer: "legal aid" },
  { prompt: "What do we call the mental and physical condition of a person, including their happiness, relationships, and health?", answer: "well-being" },
  { prompt: "What government programme provides financial assistance to families to help cover the cost of childcare?", answer: "childcare subsidy" },
  { prompt: "What is the name of the tax that most employees have automatically deducted from their pay each time they are paid?", answer: "income tax or pay-as-you-go tax" },
  { prompt: "What do we call the process by which a person from another country applies to become a permanent citizen of their new country?", answer: "naturalisation or citizenship application" },
  { prompt: "What term describes the legal requirement for vehicles to be regularly checked to ensure they are safe to drive on public roads?", answer: "vehicle inspection or roadworthy certificate" },
  { prompt: "What is the name of the free service provided by many banks and employers that allows money to be transferred directly into an employee's bank account?", answer: "direct deposit or electronic funds transfer" },
  { prompt: "What do we call a business that operates in the local area and is owned by a person or family rather than a large corporation?", answer: "small business or local business" },
];

// Retell lecture starters (what the lecture is about)
const LECTURE_TOPICS = [
  "the importance of neighbourhood volunteering in building social capital",
  "how workplace safety culture reduces injuries and improves productivity",
  "the effectiveness of public health campaigns targeting lifestyle diseases",
  "challenges facing urban public transport systems and potential solutions",
  "the role of community organisations in supporting new immigrants",
  "how consumer protection laws benefit both buyers and honest businesses",
  "key elements of a successful job application and interview strategy",
  "community-based approaches to climate change adaptation",
  "the growing importance of digital literacy in everyday life",
  "the rights and responsibilities of tenants and landlords",
  "how cultural integration programmes support migrants and host communities",
  "practical strategies for personal financial planning on a low income",
  "the benefits of regular physical activity for long-term health",
  "how households and communities can prepare for natural disasters",
  "the economic and social benefits of affordable, high-quality childcare",
  "the environmental benefits of household recycling and waste reduction",
  "the impact of remote work on employees, employers, and urban planning",
  "how civic participation strengthens democracy and community services",
  "challenges in providing aged care services for ageing populations",
  "the role of government and community programmes in supporting small businesses",
  "the cognitive and social benefits of learning a second language in adulthood",
  "how public libraries support lifelong learning and community connection",
  "strategies for reducing road injuries among vulnerable road users",
  "workplace programmes that improve employee mental health and well-being",
  "community food programmes and their role in addressing food insecurity",
  "why water conservation is essential and how individuals can contribute",
  "how neighbourhood watch programmes reduce crime and build community",
  "the benefits of apprenticeship programmes for young people and employers",
  "protecting young people from online risks through education and technology",
  "how home solar panels and energy efficiency measures reduce costs and emissions",
];

// ─── Generator ───────────────────────────────────────────────────────────────
function generateTest(n) {
  const idx = n - 31; // 0-based
  const num = String(n).padStart(3, "0");
  const topic = TOPICS[idx];
  const shortQ = SHORT_QS[idx];

  const questions = [
    {
      id: `pte-speaking-writing-${num}-q01`,
      questionType: "read_aloud",
      prompt: RA_PASSAGES[idx],
      correctAnswer: "",
      rubric: ["content","pronunciation","fluency"],
      difficulty: "medium",
      topic,
    },
    {
      id: `pte-speaking-writing-${num}-q02`,
      questionType: "repeat_sentence",
      prompt: `Listen to and repeat the following sentence about ${topic}.`,
      correctAnswer: "",
      rubric: ["content","pronunciation","fluency"],
      difficulty: "medium",
      topic,
    },
    {
      id: `pte-speaking-writing-${num}-q03`,
      questionType: "describe_image",
      prompt: `Describe the image related to ${topic} shown on screen. Cover key features and make comparisons where relevant.`,
      correctAnswer: "",
      rubric: ["content","pronunciation","fluency"],
      difficulty: "medium",
      topic,
    },
    {
      id: `pte-speaking-writing-${num}-q04`,
      questionType: "retell_lecture",
      prompt: `You will hear a short lecture about ${LECTURE_TOPICS[idx]}. After listening, retell the lecture in your own words.`,
      correctAnswer: "",
      rubric: ["content","pronunciation","fluency"],
      difficulty: "medium",
      topic,
    },
    {
      id: `pte-speaking-writing-${num}-q05`,
      questionType: "answer_short_question",
      prompt: shortQ.prompt,
      correctAnswer: shortQ.answer,
      rubric: ["content"],
      difficulty: "easy",
      topic,
    },
    {
      id: `pte-speaking-writing-${num}-q06`,
      questionType: "summarize_written_text",
      prompt: SWT_PASSAGES[idx],
      correctAnswer: "",
      rubric: ["content","form","grammar","vocabulary","spelling"],
      difficulty: "medium",
      topic,
      wordTarget: 75,
    },
    {
      id: `pte-speaking-writing-${num}-q07`,
      questionType: "write_essay",
      prompt: ESSAY_PROMPTS[idx],
      correctAnswer: "",
      rubric: ["content","form","grammar","vocabulary","spelling","discourse"],
      difficulty: "medium",
      topic,
      wordTarget: 200,
      modelAnswer: "",
    },
  ];

  return {
    id: `pte-speaking-writing-${num}`,
    exam: "pte",
    section: "speaking-writing",
    type: "section",
    title: `PTE Core Speaking Writing Practice Test ${n}`,
    variant: "core",
    durationSeconds: 2700,
    questionCount: 7,
    instructions: "PTE Core Speaking & Writing practice test. Tasks reflect everyday and workplace contexts relevant to permanent residency applicants.",
    questions,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
let created = 0, skipped = 0;
for (let n = 31; n <= 60; n++) {
  const fname = `test-${String(n).padStart(3,"0")}.json`;
  const fpath = path.join(OUT_DIR, fname);
  if (fs.existsSync(fpath)) {
    console.log(`⏭  Already exists: ${fname}`);
    skipped++;
    continue;
  }
  const data = generateTest(n);
  fs.writeFileSync(fpath, JSON.stringify(data, null, 2));
  console.log(`✅  Created: ${fname} — "${data.title}"`);
  created++;
}
console.log(`\n📊  Done: ${created} created, ${skipped} skipped.`);
