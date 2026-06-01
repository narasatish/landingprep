/**
 * rebuild-ielts-gt-reading-local.js
 * Creates IELTS General Training Reading tests 032-060.
 * GT Reading structure (real exam):
 *   Section 1 (Qs 1-13): TWO or THREE short texts (notices, ads, timetables)
 *   Section 2 (Qs 14-27): TWO texts about work or training
 *   Section 3 (Qs 28-40): ONE longer text on a general topic
 * Run: node tools/rebuild-ielts-gt-reading-local.js
 */
"use strict";
const fs   = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "../content/ielts/reading");

// ─── SECTION 1 TOPICS (short practical texts, Qs 1-13) ──────────────────────
const S1_GROUPS = [
  {
    texts: [
      {
        title: "Community Sports Centre — Notice",
        text: `RIVERSIDE SPORTS CENTRE — IMPORTANT NOTICE\n\nThe main swimming pool will be closed for maintenance from Monday 6th to Friday 10th November. The learner pool remains open during this period.\n\nFitness classes continue as normal. Members wishing to swim should use the Eastfield Centre (2 miles away) — your membership card is accepted there at no extra charge.\n\nSeasonal memberships for January to March are now available at the reception desk. Early bird discount of 15% applies to bookings made before 1st December.\n\nCarpark: spaces 1–20 are reserved for disabled badge holders. All other members use the main car park via Elm Road entrance.\n\nFor any enquiries, contact the membership team: sports@riverside.co.uk`
      },
      {
        title: "Job Advertisement — Office Administrator",
        text: `OFFICE ADMINISTRATOR — Hargreaves Financial Services\n\nWe are looking for an organised and reliable person to join our team.\n\nKey responsibilities:\n• Handling incoming post and telephone enquiries\n• Maintaining client files (both electronic and paper-based)\n• Scheduling appointments for senior advisers\n• Ordering office supplies\n\nRequirements:\n• Minimum 2 years office experience\n• Proficiency in Microsoft Office (Word, Excel, Outlook)\n• Excellent written and verbal communication skills\n• Ability to work independently\n\nSalary: £22,000–£25,000 depending on experience\nHours: Monday–Friday, 9am–5pm\nLocation: City centre — excellent transport links\n\nTo apply, send your CV and covering letter to hr@hargreaves-financial.co.uk by 30th November. No agencies.`
      },
      {
        title: "Train Timetable — Notice for Passengers",
        text: `NORTHGATE RAIL — SERVICE UPDATES\n\nWeekend engineering works between Northgate Central and Barton Junction: Saturday 4th and Sunday 5th December. No trains on this route. Replacement bus services will run every 20 minutes from Northgate Central bus station, Stop D. Buses accept rail tickets.\n\nPlease allow an extra 40 minutes journey time. The first bus departs at 06:15; the last bus at 23:30. Passengers with heavy luggage should use the taxi rank on Station Road — the bus has limited luggage space.\n\nTrains on all other routes run to normal timetable.\n\nFor real-time updates, download the NorthgateRail app or visit northgaterail.co.uk/updates.\n\nWe apologise for the inconvenience.`
      }
    ],
    questions: [
      { num:1, type:"true_false_not_given", prompt:"The main swimming pool will be completely shut for two weeks.", answer:"FALSE", explanation:"It is closed for one week (Monday 6th to Friday 10th)." },
      { num:2, type:"true_false_not_given", prompt:"Members can swim at a different centre at no extra cost during the closure.", answer:"TRUE", explanation:"The Eastfield Centre accepts the membership card at no extra charge." },
      { num:3, type:"true_false_not_given", prompt:"The early bird discount for seasonal memberships is 20%.", answer:"FALSE", explanation:"The discount is 15%." },
      { num:4, type:"true_false_not_given", prompt:"The office administrator role requires experience with spreadsheet software.", answer:"TRUE", explanation:"Microsoft Excel is listed under requirements." },
      { num:5, type:"true_false_not_given", prompt:"The administrator position is part-time.", answer:"FALSE", explanation:"Hours are Monday–Friday, 9am–5pm — a full-time role." },
      { num:6, type:"true_false_not_given", prompt:"Applicants must use a recruitment agency to apply for the role.", answer:"FALSE", explanation:"The ad states 'No agencies'." },
      { num:7, type:"sentence_completion", prompt:"Replacement buses during engineering works depart from Stop _____ at the bus station.", answer:"D", explanation:"The notice states 'Stop D'." },
      { num:8, type:"sentence_completion", prompt:"Passengers should allow an extra _____ minutes when using replacement buses.", answer:"40", explanation:"'Allow an extra 40 minutes journey time'." },
      { num:9, type:"sentence_completion", prompt:"The last replacement bus departs at _____.", answer:"23:30", explanation:"'The last bus at 23:30'." },
      { num:10, type:"sentence_completion", prompt:"Passengers with heavy luggage are advised to use the _____ on Station Road.", answer:"taxi rank", explanation:"The notice recommends the taxi rank for those with heavy luggage." },
      { num:11, type:"multiple_choice", prompt:"What is the purpose of the sports centre notice?", options:["To advertise new memberships","To inform members of changes to facilities","To recruit new staff","To announce a sports competition"], answer:"B", explanation:"The notice primarily informs members about the pool closure and related changes." },
      { num:12, type:"multiple_choice", prompt:"According to the job advertisement, which skill is specifically required?", options:["Accounting knowledge","Driving licence","Microsoft Office proficiency","Customer service experience"], answer:"C", explanation:"'Proficiency in Microsoft Office' is listed as a requirement." },
      { num:13, type:"multiple_choice", prompt:"How can passengers get real-time train updates?", options:["By calling customer services","By visiting a station","By downloading an app or visiting the website","By checking printed timetables"], answer:"C", explanation:"'Download the NorthgateRail app or visit northgaterail.co.uk/updates'." },
    ]
  },
  {
    texts: [
      {
        title: "Dental Surgery — Patient Information",
        text: `BARTON DENTAL SURGERY — PATIENT INFORMATION\n\nNew patients: Please arrive 15 minutes before your first appointment to complete registration paperwork. Bring proof of address (utility bill or bank statement dated within 3 months) and, if applicable, your NHS exemption certificate.\n\nAppointment reminders: We send a text reminder 48 hours before your appointment. If you need to cancel or rearrange, please give at least 24 hours notice. Failure to attend without notice may result in removal from our patient list.\n\nEmergency appointments: Call before 10am for a same-day emergency slot. These are for pain relief only — routine treatment must be booked separately.\n\nCharges: NHS dental charges apply. Check the current NHS charge bands before attending. Some treatments may require a private charge — your dentist will discuss this beforehand.\n\nParking: Limited free parking at the rear. Enter from Oak Lane.`
      },
      {
        title: "Community Library — Summer Reading Challenge",
        text: `GREENFIELD LIBRARY — SUMMER READING CHALLENGE\n\nJoin our annual Summer Reading Challenge — open to all children aged 4 to 11.\n\nHow it works:\n• Read any 6 books from the library between 1 July and 31 August\n• Record your reading in your challenge booklet\n• Collect a sticker for each book you finish\n• Receive your medal and certificate at the completion event on 5th September\n\nReading can be done anywhere — at home, on holiday, or in the library. Audiobooks also count.\n\nSign up at the library information desk. You will receive your starter booklet and first sticker free of charge.\n\nParents and carers: Help your child choose books at the right reading level — staff are happy to make recommendations.\n\nAll children who complete the challenge will be entered into a prize draw for book tokens worth £30.`
      }
    ],
    questions: [
      { num:1, type:"true_false_not_given", prompt:"New patients must bring proof of address to their first appointment.", answer:"TRUE", explanation:"The notice requires a utility bill or bank statement." },
      { num:2, type:"true_false_not_given", prompt:"Patients receive an appointment reminder by telephone.", answer:"FALSE", explanation:"Reminders are sent by text, not telephone." },
      { num:3, type:"true_false_not_given", prompt:"Emergency dental appointments are suitable for all types of dental treatment.", answer:"FALSE", explanation:"'These are for pain relief only — routine treatment must be booked separately'." },
      { num:4, type:"true_false_not_given", prompt:"The dental surgery has parking accessible from Oak Lane.", answer:"TRUE", explanation:"'Enter from Oak Lane' for the rear parking." },
      { num:5, type:"true_false_not_given", prompt:"The Summer Reading Challenge is restricted to library members.", answer:"NOT GIVEN", explanation:"The text does not specify whether library membership is required." },
      { num:6, type:"true_false_not_given", prompt:"Children must read exactly six library books to complete the challenge.", answer:"TRUE", explanation:"'Read any 6 books from the library'." },
      { num:7, type:"sentence_completion", prompt:"The Summer Reading Challenge runs from 1 July to _____.", answer:"31 August", explanation:"The dates are stated clearly." },
      { num:8, type:"sentence_completion", prompt:"Children receive a _____ for each book they complete.", answer:"sticker", explanation:"'Collect a sticker for each book you finish'." },
      { num:9, type:"sentence_completion", prompt:"All children who finish the challenge are entered into a draw for book tokens worth £_____.", answer:"30", explanation:"'Book tokens worth £30'." },
      { num:10, type:"sentence_completion", prompt:"To cancel a dental appointment, patients must give at least _____ hours notice.", answer:"24", explanation:"'At least 24 hours notice'." },
      { num:11, type:"multiple_choice", prompt:"What happens if a patient misses an appointment without warning?", options:["They are charged a fee","They may be removed from the patient list","They cannot book emergency appointments","They must re-register as a new patient"], answer:"B", explanation:"'May result in removal from our patient list'." },
      { num:12, type:"multiple_choice", prompt:"Where do children sign up for the Summer Reading Challenge?", options:["Online","By phone","At the library information desk","By post"], answer:"C", explanation:"'Sign up at the library information desk'." },
      { num:13, type:"multiple_choice", prompt:"Which statement about the challenge is correct?", options:["Only books read in the library count","Audiobooks are included","Children must read at least 8 books","The completion event is in August"], answer:"B", explanation:"'Audiobooks also count'." },
    ]
  }
];

// ─── SECTION 2 TOPICS (work/training texts, Qs 14-27) ───────────────────────
const S2_GROUPS = [
  {
    texts: [
      {
        title: "Staff Training Policy — Hartwell Manufacturing",
        text: `HARTWELL MANUFACTURING — STAFF TRAINING POLICY\n\nAt Hartwell Manufacturing, we recognise that continuous professional development is essential to both individual career growth and company competitiveness. The following policy outlines training entitlements and procedures for all permanent employees.\n\nAnnual training budget: Each permanent employee is entitled to five training days per year, in addition to any mandatory compliance training. Training requests must be submitted via the HR portal at least four weeks in advance and require line manager approval. Requests submitted less than four weeks before the training date may not be approved.\n\nTypes of supported training:\n• Job-specific technical training (fully funded)\n• Professional qualifications (50% of course fees funded; remaining 50% repaid if employee leaves within 18 months)\n• Soft skills workshops (funded with line manager approval)\n• Conference attendance (funded subject to budget availability)\n\nRecovery clause: Where the company funds more than £500 of training costs and the employee leaves within 12 months of completing the training, the employee agrees to repay a proportion of costs on a sliding scale.\n\nTime off in lieu: Where training takes place outside normal working hours, time off in lieu (TOIL) is granted at straight time — not at an enhanced rate.\n\nFor further information, contact the HR department at training@hartwell.co.uk.`
      },
      {
        title: "Graduate Scheme Information — Hartwell Manufacturing",
        text: `HARTWELL MANUFACTURING — GRADUATE DEVELOPMENT SCHEME\n\nWe offer a two-year rotational graduate scheme for recently qualified graduates in engineering, business, or manufacturing disciplines. The scheme provides exposure to four different departments over 24 months, with six-month placements in each.\n\nStructure:\n• Months 1–6: Production and Operations\n• Months 7–12: Quality Assurance and Compliance\n• Months 13–18: Supply Chain and Procurement\n• Months 19–24: Engineering Projects\n\nStarting salary: £28,500 per annum, rising to £32,000 upon successful completion of the scheme. Graduates are also eligible for the company bonus scheme from month seven.\n\nMentoring: Each graduate is paired with a senior manager who provides monthly one-to-one coaching sessions throughout the scheme.\n\nApplication: Apply online by 28th February. Interviews take place in April; offers made by the end of May. The scheme begins in September each year.\n\nTo be eligible, you must hold at least a 2:1 degree in a relevant subject and have the right to work in the UK.`
      }
    ],
    questions: [
      { num:14, type:"true_false_not_given", prompt:"All employees at Hartwell Manufacturing are entitled to five training days per year.", answer:"FALSE", explanation:"The entitlement applies to 'permanent employees' only." },
      { num:15, type:"true_false_not_given", prompt:"Training requests must be submitted at least four weeks in advance.", answer:"TRUE", explanation:"Stated directly in the policy." },
      { num:16, type:"true_false_not_given", prompt:"The company funds the full cost of professional qualifications.", answer:"FALSE", explanation:"Only 50% of professional qualification fees are funded." },
      { num:17, type:"true_false_not_given", prompt:"Employees who leave within a year of completing funded training may have to repay some costs.", answer:"TRUE", explanation:"The recovery clause applies when training cost exceeds £500 and employee leaves within 12 months." },
      { num:18, type:"sentence_completion", prompt:"Training outside working hours earns time off in lieu at _____ time.", answer:"straight", explanation:"TOIL is granted 'at straight time — not at an enhanced rate'." },
      { num:19, type:"sentence_completion", prompt:"The graduate scheme lasts _____ months in total.", answer:"24", explanation:"'A two-year rotational graduate scheme' / 24 months." },
      { num:20, type:"sentence_completion", prompt:"Each six-month placement covers a different _____.", answer:"department", explanation:"Graduates rotate through four different departments." },
      { num:21, type:"sentence_completion", prompt:"The starting salary for graduates is £_____ per year.", answer:"28,500", explanation:"'Starting salary: £28,500 per annum'." },
      { num:22, type:"multiple_choice", prompt:"When are graduates eligible to join the bonus scheme?", options:["From the start of the scheme","After six months","After one year","After completing the scheme"], answer:"B", explanation:"'Eligible for the company bonus scheme from month seven'." },
      { num:23, type:"multiple_choice", prompt:"How often do mentoring sessions take place?", options:["Weekly","Monthly","Every six months","Annually"], answer:"B", explanation:"'Monthly one-to-one coaching sessions'." },
      { num:24, type:"multiple_choice", prompt:"When does the graduate scheme begin each year?", options:["February","April","June","September"], answer:"D", explanation:"'The scheme begins in September each year'." },
      { num:25, type:"multiple_choice", prompt:"What minimum degree classification is required to apply?", options:["Third class","2:2","2:1","First class"], answer:"C", explanation:"'At least a 2:1 degree'." },
      { num:26, type:"multiple_choice", prompt:"What must applicants have in addition to a relevant degree?", options:["A driving licence","Post-graduate qualification","Right to work in the UK","Previous work experience"], answer:"C", explanation:"'Have the right to work in the UK'." },
      { num:27, type:"multiple_choice", prompt:"What happens if an employee funded more than £500 in training leaves after 10 months?", options:["No repayment required","A proportion of costs must be repaid","The full amount must be repaid immediately","The policy does not apply"], answer:"B", explanation:"The sliding scale recovery clause applies when employee leaves within 12 months." },
    ]
  }
];

// ─── SECTION 3 TOPICS (longer general text, Qs 28-40) ───────────────────────
const S3_TOPICS = [
  {
    title: "The Rise of the Sharing Economy",
    text: `The sharing economy — broadly defined as a system in which individuals share access to goods, services, resources, or skills — has grown from a niche concept into a global economic force worth hundreds of billions of dollars. Enabled by digital platforms that reduce transaction costs and build trust between strangers, the sharing economy encompasses everything from short-term accommodation rental to freelance labour markets, peer-to-peer car sharing, and even the temporary exchange of everyday items such as tools and clothing.\n\nThe roots of the sharing economy can be traced to collaborative consumption practices long pre-dating the internet — from lending libraries to communal farming equipment. What changed dramatically in the early twenty-first century was the emergence of smartphone technology and GPS, which made it trivially easy to connect people with underutilised assets to those who needed them. Airbnb, founded in 2008, showed that millions of people were willing to welcome strangers into their homes in exchange for payment. Uber, launched in 2009, demonstrated that private individuals would use their personal vehicles as taxis if the platform managed the logistical and reputational risks.\n\nProponents of the sharing economy argue that it increases economic efficiency by reducing waste and making better use of existing assets. A private car, for example, is stationary and depreciating for approximately ninety-five percent of its lifetime — peer-to-peer car sharing can monetise this idle capacity. Environmentalists have suggested that widespread sharing could reduce the total number of goods manufactured, thereby lowering carbon emissions associated with production.\n\nHowever, the sharing economy has attracted significant criticism. The most persistent concerns relate to labour conditions. Workers on platforms such as Uber and Deliveroo are typically classified as independent contractors rather than employees, which means they are not entitled to minimum wage guarantees, sick pay, holiday pay, or pension contributions. A series of landmark court rulings in various countries have begun to challenge this classification, with the UK Supreme Court ruling in 2021 that Uber drivers should be classified as workers and therefore entitled to minimum wage and holiday pay.\n\nHousing markets in major cities have also been disrupted. Research in cities including Barcelona, Amsterdam, and New York has found that the concentration of short-term rental platforms reduces the availability of long-term rental housing, pushing up rents and displacing residents. Several cities have responded with strict regulations capping the number of nights a property can be listed or requiring hosts to register with local authorities.\n\nThe question of taxation presents further complexity. Traditional businesses pay business rates and are subject to standard employment tax frameworks. Many sharing economy platforms have historically benefited from regulatory ambiguity — operating across national borders in ways that complicate taxation and consumer protection enforcement. Governments are increasingly closing these loopholes through data-sharing requirements and updated platform economy tax rules.\n\nLooking ahead, the trajectory of the sharing economy will depend substantially on how regulatory frameworks evolve. Advocates hope that thoughtful regulation can preserve the genuine consumer benefits — lower prices, greater convenience, and more flexible working — while ensuring fair treatment for workers and protecting communities from displacement. Critics worry that without robust intervention, the sharing economy's promises of democratised access will continue to mask the extraction of value by platform owners at the expense of workers and local residents.`,
    questions: [
      { num:28, type:"matching_headings", prompt:"Section that explains what enabled peer-to-peer platforms to grow", answer:"B", explanation:"Paragraph 2 discusses smartphone technology and GPS enabling the growth." },
      { num:29, type:"matching_headings", prompt:"Section focusing on arguments made by supporters of sharing platforms", answer:"C", explanation:"Paragraph 3 presents proponents' arguments about efficiency and environment." },
      { num:30, type:"matching_headings", prompt:"Section describing legal challenges to worker classification", answer:"D", explanation:"Paragraph 4 discusses court rulings on labour conditions." },
      { num:31, type:"matching_headings", prompt:"Section about the effect on housing availability", answer:"E", explanation:"Paragraph 5 covers housing market disruption." },
      { num:32, type:"matching_headings", prompt:"Section discussing how governments are closing tax loopholes", answer:"F", explanation:"Paragraph 6 covers taxation and regulatory complexity." },
      { num:33, type:"true_false_not_given", prompt:"The sharing economy was made possible entirely by twenty-first century technology.", answer:"FALSE", explanation:"The text notes collaborative consumption practices pre-dated the internet." },
      { num:34, type:"true_false_not_given", prompt:"A typical private car is in use for approximately five percent of its lifetime.", answer:"TRUE", explanation:"The car is 'stationary and depreciating for approximately ninety-five percent of its lifetime'." },
      { num:35, type:"true_false_not_given", prompt:"The UK Supreme Court ruled that Uber drivers are entitled to sick pay.", answer:"NOT GIVEN", explanation:"The ruling grants minimum wage and holiday pay — sick pay is not mentioned." },
      { num:36, type:"sentence_completion", prompt:"Research has found that short-term rental platforms reduce the supply of _____ housing.", answer:"long-term rental", explanation:"'Reduces the availability of long-term rental housing'." },
      { num:37, type:"sentence_completion", prompt:"Some cities require hosts to _____ with local authorities.", answer:"register", explanation:"'Requiring hosts to register with local authorities'." },
      { num:38, type:"sentence_completion", prompt:"Governments are using _____ requirements to address taxation of platforms.", answer:"data-sharing", explanation:"'Through data-sharing requirements and updated platform economy tax rules'." },
      { num:39, type:"multiple_choice", prompt:"According to the text, which year did Uber launch?", options:["2007","2008","2009","2010"], answer:"C", explanation:"'Uber, launched in 2009'." },
      { num:40, type:"multiple_choice", prompt:"What do critics fear will continue without robust regulatory intervention?", options:["Reduced consumer prices","Extraction of value by platform owners at expense of workers","Slower technological innovation","Higher taxation of traditional businesses"], answer:"B", explanation:"Critics worry platforms will continue 'extraction of value by platform owners at the expense of workers'." },
    ]
  },
  {
    title: "The Psychology of Habit Formation",
    text: `Understanding how habits form and how they can be changed has become one of the most practically significant areas of psychological research. Habits — defined as automatic behaviours triggered by contextual cues — account for an estimated forty to forty-five percent of daily actions. They conserve cognitive resources by shifting routine behaviour from conscious deliberation to automatic processing, freeing mental capacity for more complex tasks.\n\nThe neurological basis of habit formation is now well established. The basal ganglia, a group of structures deep in the brain associated with procedural learning and motor control, play a central role. When a behaviour is performed repeatedly in a consistent context, neural pathways in the basal ganglia are strengthened through a process called long-term potentiation. The behaviour requires progressively less conscious effort — a phenomenon known as automaticity. Importantly, this process is not easily reversed: even after years of abstinence, previously ingrained habits can be reactivated by the original environmental triggers.\n\nThe habit loop model, popularised by journalist Charles Duhigg in his 2012 book The Power of Habit, proposes that every habit consists of three components: a cue (or trigger), a routine, and a reward. The cue initiates the behaviour — it may be a time of day, an emotional state, a location, or a preceding action. The routine is the behaviour itself. The reward reinforces the neural circuit, making the habit more likely to be repeated. Duhigg argues that habits cannot truly be eliminated but can be modified by identifying the cue, experimenting with different routines while keeping the same reward, and consistently repeating the new routine in the same context.\n\nResearch into habit formation has quantified how long new habits take to form. A widely cited 2010 study by Phillippa Lally and colleagues at University College London found that the time for a new behaviour to become automatic ranged from 18 to 254 days, with an average of 66 days — considerably longer than the popular myth of 21 days. The speed of habit formation varied significantly with the complexity of the behaviour and individual differences.\n\nOne of the most important practical applications of habit research is in public health. Smoking, excessive alcohol consumption, physical inactivity, and poor diet are all, in part, habitual behaviours. Behaviour change interventions that leverage habit theory — such as implementation intentions ('I will do X at time Y in place Z') and habit stacking (attaching a new behaviour to an existing one) — have shown consistent effectiveness in clinical trials across a range of health domains.\n\nThe workplace is another domain where habit research has been applied. Organisations have found that small environmental redesigns — placing fruit at eye level in canteens, making stairs more visually prominent, or positioning hand sanitisers at entry points — can reliably shift employee behaviour at scale without requiring willpower or active decision-making. These interventions are consistent with nudge theory, which proposes that choice architecture can guide behaviour while preserving individual autonomy.\n\nCritics argue that relying on habit formation to drive behaviour change risks overlooking structural barriers. A person living in a food desert cannot form healthy eating habits regardless of their intentions, and an employee in a precarious job cannot establish exercise routines if working irregular shifts. Sustainable behaviour change, critics contend, requires not only understanding individual psychology but also addressing the social and economic conditions that constrain choice.`,
    questions: [
      { num:28, type:"matching_headings", prompt:"Section about the brain structures involved in habit formation", answer:"B", explanation:"Paragraph 2 covers the basal ganglia and neurological basis." },
      { num:29, type:"matching_headings", prompt:"Section describing a three-part model of habits", answer:"C", explanation:"Paragraph 3 describes Duhigg's cue-routine-reward loop." },
      { num:30, type:"matching_headings", prompt:"Section presenting research on how many days habit formation takes", answer:"D", explanation:"Paragraph 4 covers Lally's 2010 research on automaticity timing." },
      { num:31, type:"matching_headings", prompt:"Section about applying habit theory to improve health", answer:"E", explanation:"Paragraph 5 covers public health applications." },
      { num:32, type:"matching_headings", prompt:"Section about using environmental changes to shift workplace behaviour", answer:"F", explanation:"Paragraph 6 covers workplace redesign strategies." },
      { num:33, type:"true_false_not_given", prompt:"Habits account for roughly half of all daily actions.", answer:"FALSE", explanation:"The text states 'forty to forty-five percent'." },
      { num:34, type:"true_false_not_given", prompt:"The habit loop model was first proposed in a 2012 publication.", answer:"TRUE", explanation:"Duhigg's book was published in 2012." },
      { num:35, type:"true_false_not_given", prompt:"The study by Lally found that habits take on average 21 days to form.", answer:"FALSE", explanation:"The average was 66 days — 21 days is called 'a popular myth'." },
      { num:36, type:"sentence_completion", prompt:"Behaviours become automatic through a neural process called _____.", answer:"long-term potentiation", explanation:"'Long-term potentiation' strengthens neural pathways." },
      { num:37, type:"sentence_completion", prompt:"The habit stacking technique involves attaching a new behaviour to _____ one.", answer:"an existing", explanation:"'Attaching a new behaviour to an existing one'." },
      { num:38, type:"sentence_completion", prompt:"Critics argue that structural _____ must also be addressed for lasting behaviour change.", answer:"barriers", explanation:"'Addressing the social and economic conditions that constrain choice'." },
      { num:39, type:"multiple_choice", prompt:"According to the study by Lally, what was the minimum time found for habit formation?", options:["18 days","21 days","66 days","254 days"], answer:"A", explanation:"'Ranged from 18 to 254 days'." },
      { num:40, type:"multiple_choice", prompt:"What do workplace environmental interventions have in common with nudge theory?", options:["They require employees to make active decisions","They preserve individual autonomy","They increase cognitive load","They rely on financial incentives"], answer:"B", explanation:"Both 'guide behaviour while preserving individual autonomy'." },
    ]
  }
];

// ─── BUILD A TEST ─────────────────────────────────────────────────────────────
function buildTest(n) {
  const num = String(n).padStart(3, "0");
  const id  = `ielts-reading-${num}`;

  const s1 = S1_GROUPS[(n - 32) % S1_GROUPS.length];
  const s2 = S2_GROUPS[(n - 32) % S2_GROUPS.length];
  const s3 = S3_TOPICS[(n - 32) % S3_TOPICS.length];

  const passages = [
    {
      id: `${id}-p1`,
      title: "Section 1: Short Texts",
      subtitle: s1.texts.map(t => t.title).join(" / "),
      text: s1.texts.map(t => `[${t.title}]\n\n${t.text}`).join("\n\n---\n\n"),
    },
    {
      id: `${id}-p2`,
      title: "Section 2: Work and Training",
      subtitle: s2.texts.map(t => t.title).join(" / "),
      text: s2.texts.map(t => `[${t.title}]\n\n${t.text}`).join("\n\n---\n\n"),
    },
    {
      id: `${id}-p3`,
      title: "Section 3: " + s3.title,
      text: s3.text,
    },
  ];

  const allQ = [
    ...s1.questions.map(q => ({
      id: `${id}-q${q.num}`,
      passageId: `${id}-p1`,
      passageIndex: 0,
      num: q.num,
      questionType: q.type,
      prompt: q.prompt,
      options: q.options || undefined,
      correctAnswer: q.answer,
      explanation: q.explanation,
    })),
    ...s2.questions.map(q => ({
      id: `${id}-q${q.num}`,
      passageId: `${id}-p2`,
      passageIndex: 1,
      num: q.num,
      questionType: q.type,
      prompt: q.prompt,
      options: q.options || undefined,
      correctAnswer: q.answer,
      explanation: q.explanation,
    })),
    ...s3.questions.map(q => ({
      id: `${id}-q${q.num}`,
      passageId: `${id}-p3`,
      passageIndex: 2,
      num: q.num,
      questionType: q.type,
      prompt: q.prompt,
      options: q.options || undefined,
      correctAnswer: q.answer,
      explanation: q.explanation,
    })),
  ].map(q => { if (!q.options) delete q.options; return q; });

  return {
    id,
    exam: "ielts",
    section: "reading",
    variant: "general_training",
    title: `IELTS General Training Reading Practice Test ${n - 30}`,
    durationSeconds: 3600,
    questionCount: 40,
    passages,
    questions: allQ,
  };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
for (let n = 32; n <= 60; n++) {
  const test = buildTest(n);
  const outPath = path.join(OUT_DIR, `test-${String(n).padStart(3,"0")}.json`);
  fs.writeFileSync(outPath, JSON.stringify(test, null, 2), "utf8");
  console.log(`  ✓ test-${String(n).padStart(3,"0")}.json (GT Reading ${n-30})`);
}
console.log("\nDone. 29 GT reading tests written.");
